"use client";

import { useMeetingStore } from "@/store/meetingStore";
import TopBar from "@/components/TopBar";
import ControlBar from "@/components/ControlBar";
import VideoGrid from "@/components/VideoGrid";
import ChatPanel from "@/components/ChatPanel";
import ParticipantsPanel from "@/components/ParticipantsPanel";
import { AnimatePresence } from "framer-motion";
import { theme } from "@/styles/theme";

interface MeetingLayoutProps {
  roomId: string;
  localStream: MediaStream | null;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onLeave: () => void;
}

export default function MeetingLayout({
  roomId,
  localStream,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  onLeave,
}: MeetingLayoutProps) {
  const { panel } = useMeetingStore();

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: theme.colors.bg,
      color: theme.colors.text,
      overflow: "hidden",
      fontFamily: theme.font.sans,
    }}>
      <TopBar roomId={roomId} />

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>
        <VideoGrid localStream={localStream} />
        
        <AnimatePresence>
          {panel === "chat" && <ChatPanel />}
          {panel === "people" && <ParticipantsPanel />}
        </AnimatePresence>
      </div>

      <ControlBar 
        onToggleMute={onToggleMute}
        onToggleCamera={onToggleCamera}
        onToggleScreenShare={onToggleScreenShare}
        onLeave={onLeave}
      />
    </div>
  );
}
