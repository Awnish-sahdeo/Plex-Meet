"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useMeetingStore } from "@/store/meetingStore";

interface PeerConnection {
  socketId: string;
  pc: RTCPeerConnection;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: { width: 1280, height: 720, frameRate: 30 },
  audio: { echoCancellation: true, noiseSuppression: true },
};

export function useWebRTC(roomId: string, peerId: string) {
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<string, PeerConnection>>(new Map());

  const {
    addParticipant,
    removeParticipant,
    updateParticipant,
    setParticipantStream,
    isMuted,
    isCameraOff,
    setIsMuted,
    setIsCameraOff,
    setIsScreenSharing,
    addMessage,
    resetMeeting,
  } = useMeetingStore();

  const SIGNALING_URL = process.env.NEXT_PUBLIC_SIGNALING_URL || "http://localhost:4000";

  const createPeerConnection = useCallback((targetSocketId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("ice-candidate", {
          targetSocketId,
          candidate: event.candidate,
          fromSocketId: socketRef.current.id,
        });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setParticipantStream(targetSocketId, remoteStream);
    };

    peerConnections.current.set(targetSocketId, { socketId: targetSocketId, pc });
    return pc;
  }, [setParticipantStream]);

  const stopScreenShare = useCallback(() => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    peerConnections.current.forEach(({ pc }) => {
      const sender = pc.getSenders().find(s => s.track?.kind === "video");
      if (sender && videoTrack) sender.replaceTrack(videoTrack).catch(e => console.error(e));
    });

    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    setIsScreenSharing(false);
    socketRef.current?.emit("screen-share-stopped", { roomId });
  }, [roomId, setIsScreenSharing]);

  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;
      const screenTrack = stream.getVideoTracks()[0];

      peerConnections.current.forEach(({ pc }) => {
        const sender = pc.getSenders().find(s => s.track?.kind === "video");
        if (sender) sender.replaceTrack(screenTrack).catch(e => console.error(e));
      });

      setIsScreenSharing(true);
      socketRef.current?.emit("screen-share-started", { roomId });

      screenTrack.onended = () => stopScreenShare();
    } catch (err) {
      console.error("Failed to share screen:", err);
    }
  }, [roomId, setIsScreenSharing, stopScreenShare]);

  useEffect(() => {
    if (socketRef.current) return;
    
    resetMeeting();

    const init = async () => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
        localStreamRef.current = stream;
        setLocalStream(stream);
      } catch (err) {
        console.error("Failed to get local stream:", err);
        return;
      }
      
      const socket = io(SIGNALING_URL, { 
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5 
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("join-room", { roomId, peerId });
      });

      socket.on("existing-peers", async ({ peers }: { peers: any[] }) => {
        for (const p of peers) {
          addParticipant({
            socketId: p.socketId,
            peerId: p.peerId,
            displayName: p.displayName,
            isMuted: p.isMuted,
            isCameraOff: p.isCameraOff,
            isScreenSharing: false,
            isHandRaised: false,
          });
          const pc = createPeerConnection(p.socketId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("offer", { targetSocketId: p.socketId, offer, fromSocketId: socket.id });
        }
      });

      socket.on("peer-joined", ({ peerId: pId, socketId, displayName }: any) => {
        addParticipant({
          socketId,
          peerId: pId,
          displayName: displayName || `User ${socketId.slice(0, 4)}`,
          isMuted: false,
          isCameraOff: false,
          isScreenSharing: false,
          isHandRaised: false,
        });
      });

      socket.on("offer", async ({ offer, fromSocketId }: { offer: RTCSessionDescriptionInit; fromSocketId: string }) => {
        const pc = createPeerConnection(fromSocketId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", { targetSocketId: fromSocketId, answer, fromSocketId: socket.id });
      });

      socket.on("answer", async ({ answer, fromSocketId }: { answer: RTCSessionDescriptionInit; fromSocketId: string }) => {
        const conn = peerConnections.current.get(fromSocketId);
        if (conn) await conn.pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("ice-candidate", async ({ candidate, fromSocketId }: { candidate: RTCIceCandidateInit; fromSocketId: string }) => {
        const conn = peerConnections.current.get(fromSocketId);
        if (conn) await conn.pc.addIceCandidate(new RTCIceCandidate(candidate));
      });

      socket.on("peer-left", ({ socketId }: { socketId: string }) => {
        const conn = peerConnections.current.get(socketId);
        conn?.pc.close();
        peerConnections.current.delete(socketId);
        removeParticipant(socketId);
      });

      socket.on("peer-media-state-changed", ({ socketId, isMuted: m, isCameraOff: c }) => {
        updateParticipant(socketId, { isMuted: m, isCameraOff: c });
      });

      socket.on("peer-screen-share-started", ({ socketId }) => {
        updateParticipant(socketId, { isScreenSharing: true });
      });

      socket.on("peer-screen-share-stopped", ({ socketId }) => {
        updateParticipant(socketId, { isScreenSharing: false });
      });

      socket.on("chat-message", (msg) => {
        addMessage(msg);
      });
    };

    init();
    
    const currentPCs = peerConnections.current;
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      currentPCs.forEach(c => c.pc.close());
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [roomId, peerId, addParticipant, removeParticipant, updateParticipant, addMessage, createPeerConnection, SIGNALING_URL, resetMeeting]);

  const toggleMute = useCallback(() => {
    const newState = !isMuted;
    localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = !newState);
    setIsMuted(newState);
    socketRef.current?.emit("media-state-changed", { roomId, isMuted: newState, isCameraOff });
  }, [isMuted, isCameraOff, roomId, setIsMuted]);

  const toggleCamera = useCallback(() => {
    const newState = !isCameraOff;
    localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = !newState);
    setIsCameraOff(newState);
    socketRef.current?.emit("media-state-changed", { roomId, isMuted, isCameraOff: newState });
  }, [isMuted, isCameraOff, roomId, setIsCameraOff]);

  const sendMessage = useCallback((text: string, senderName: string) => {
    socketRef.current?.emit("chat-message", { roomId, text, senderName });
  }, [roomId]);

  const leaveRoom = useCallback(() => {
    socketRef.current?.disconnect();
    peerConnections.current.forEach(c => c.pc.close());
    localStreamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  return { localStream, toggleMute, toggleCamera, startScreenShare, stopScreenShare, sendMessage, leaveRoom };
}
