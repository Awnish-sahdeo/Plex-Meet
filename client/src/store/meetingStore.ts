import { create } from "zustand";

export interface Participant {
  socketId: string;
  peerId: string;
  displayName: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  stream?: MediaStream;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  ts: number;
}

export type SidePanel = "people" | "chat" | null;

interface MeetingState {
  // Participants
  participants: Map<string, Participant>;
  addParticipant: (p: Participant) => void;
  removeParticipant: (socketId: string) => void;
  updateParticipant: (socketId: string, update: Partial<Participant>) => void;
  setParticipantStream: (socketId: string, stream: MediaStream) => void;

  // Local media
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  setIsMuted: (v: boolean) => void;
  setIsCameraOff: (v: boolean) => void;
  setIsScreenSharing: (v: boolean) => void;
  setIsHandRaised: (v: boolean) => void;

  // Active speaker
  activeSpeakerId: string | null;
  setActiveSpeaker: (id: string | null) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;

  // UI
  panel: SidePanel;
  setPanel: (p: SidePanel) => void;

  // Time
  meetingStartTime: number;
  setMeetingStartTime: (t: number) => void;

  resetMeeting: () => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
  participants: new Map(), // Keyed by peerId
  
  addParticipant: (p) =>
    set((s) => {
      const m = new Map(s.participants);
      // Ensure we don't have a stale entry for the same socketId but different peerId (unlikely)
      // and overwrite if the same peerId rejoins with a new socketId.
      m.set(p.peerId, { ...m.get(p.peerId), ...p });
      return { participants: m };
    }),

  removeParticipant: (socketId) =>
    set((s) => {
      const m = new Map(s.participants);
      // Find the participant with this socketId and remove it
      let targetPeerId: string | null = null;
      m.forEach((p, peerId) => {
        if (p.socketId === socketId) targetPeerId = peerId;
      });
      if (targetPeerId) m.delete(targetPeerId);
      return { participants: m };
    }),

  updateParticipant: (socketId, update) =>
    set((s) => {
      const m = new Map(s.participants);
      let targetPeerId: string | null = null;
      m.forEach((p, peerId) => {
        if (p.socketId === socketId) targetPeerId = peerId;
      });
      if (targetPeerId) {
        const existing = m.get(targetPeerId);
        if (existing) m.set(targetPeerId, { ...existing, ...update });
      }
      return { participants: m };
    }),

  setParticipantStream: (socketId, stream) =>
    set((s) => {
      const m = new Map(s.participants);
      let targetPeerId: string | null = null;
      m.forEach((p, peerId) => {
        if (p.socketId === socketId) targetPeerId = peerId;
      });
      if (targetPeerId) {
        const existing = m.get(targetPeerId);
        if (existing) m.set(targetPeerId, { ...existing, stream });
      }
      return { participants: m };
    }),

  isMuted: false,
  isCameraOff: false,
  isScreenSharing: false,
  isHandRaised: false,
  setIsMuted: (v) => set({ isMuted: v }),
  setIsCameraOff: (v) => set({ isCameraOff: v }),
  setIsScreenSharing: (v) => set({ isScreenSharing: v }),
  setIsHandRaised: (v) => set({ isHandRaised: v }),

  activeSpeakerId: null,
  setActiveSpeaker: (id) => set({ activeSpeakerId: id }),

  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  panel: null,
  setPanel: (p) =>
    set((s) => ({ panel: s.panel === p ? null : p })),

  meetingStartTime: Date.now(),
  setMeetingStartTime: (t) => set({ meetingStartTime: t }),

  resetMeeting: () => set({
    participants: new Map(),
    isMuted: false,
    isCameraOff: false,
    isScreenSharing: false,
    isHandRaised: false,
    activeSpeakerId: null,
    messages: [],
    panel: null,
    meetingStartTime: Date.now()
  }),
}));
