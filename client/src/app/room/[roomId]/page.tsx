"use client";

import { use, useState, useEffect } from "react";
import MeetingLayout from "@/layout/MeetingLayout";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useActiveSpeaker } from "@/hooks/useActiveSpeaker";
import { useRouter } from "next/navigation";
import { useMeetings } from "@/context/MeetingsContext";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const router = useRouter();
  const { leaveMeeting } = useMeetings();
  
  const [peerId, setPeerId] = useState("");

  useEffect(() => {
    let id = localStorage.getItem('peerId');
    if (!id) {
      id = `user-${Math.random().toString(36).slice(2, 7)}`;
      localStorage.setItem('peerId', id);
    }
    setPeerId(id);
  }, []);

  const { localStream, toggleMute, toggleCamera, startScreenShare, stopScreenShare, leaveRoom } = useWebRTC(roomId, peerId);
  
  // Initialize active speaker detection
  useActiveSpeaker();

  const handleLeave = () => {
    leaveRoom();
    leaveMeeting(roomId);
    router.push("/");
  };

  return (
    <MeetingLayout
      roomId={roomId}
      localStream={localStream}
      onToggleMute={toggleMute}
      onToggleCamera={toggleCamera}
      onToggleScreenShare={startScreenShare}
      onLeave={handleLeave}
    />
  );
}
