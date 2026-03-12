"use client";

import { motion } from "framer-motion";
import { 
  Mic, MicOff, Video, VideoOff, 
  MonitorUp, MonitorOff, Users, 
  MessageSquare, Hand, PhoneOff, 
  MoreVertical 
} from "lucide-react";
import { useMeetingStore } from "@/store/meetingStore";
import { theme } from "@/styles/theme";

interface ControlBtnProps {
  icon: React.ElementType;
  onClick: () => void;
  active?: boolean;
  danger?: boolean;
  label: string;
}

function ControlBtn({ icon: Icon, onClick, active, danger, label }: ControlBtnProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      title={label}
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        border: "none",
        background: danger 
          ? theme.colors.danger 
          : active ? theme.colors.primary : theme.colors.surface,
        color: "white",
        transition: "background 0.2s",
      }}
    >
      <Icon size={20} />
    </motion.button>
  );
}

export default function ControlBar({ 
  onToggleMute, 
  onToggleCamera, 
  onToggleScreenShare,
  onLeave 
}: { 
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onLeave: () => void;
}) {
  const { 
    isMuted, 
    isCameraOff, 
    isScreenSharing, 
    isHandRaised, 
    setIsHandRaised,
    panel,
    setPanel 
  } = useMeetingStore();

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 24px",
      background: "rgba(15, 23, 42, 0.8)",
      backdropFilter: "blur(12px)",
      borderRadius: theme.radius.xl,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadow.lg,
      zIndex: 100,
    }}>
      <ControlBtn 
        icon={isMuted ? MicOff : Mic} 
        label={isMuted ? "Unmute" : "Mute"}
        active={!isMuted}
        onClick={onToggleMute}
      />
      <ControlBtn 
        icon={isCameraOff ? VideoOff : Video} 
        label={isCameraOff ? "Start Video" : "Stop Video"}
        active={!isCameraOff}
        onClick={onToggleCamera}
      />
      <ControlBtn 
        icon={isScreenSharing ? MonitorOff : MonitorUp} 
        label={isScreenSharing ? "Stop Sharing" : "Screen Share"}
        active={isScreenSharing}
        onClick={onToggleScreenShare}
      />
      
      <div style={{ width: 1, height: 32, background: theme.colors.border, margin: "0 4px" }} />

      <ControlBtn 
        icon={Users} 
        label="Participants" 
        active={panel === "people"}
        onClick={() => setPanel("people")}
      />
      <ControlBtn 
        icon={MessageSquare} 
        label="Chat" 
        active={panel === "chat"}
        onClick={() => setPanel("chat")}
      />
      <ControlBtn 
        icon={Hand} 
        label="Raise Hand" 
        active={isHandRaised}
        onClick={() => setIsHandRaised(!isHandRaised)}
      />
      
      <ControlBtn 
        icon={MoreVertical} 
        label="More Options" 
        onClick={() => {}}
      />
      
      <ControlBtn 
        icon={PhoneOff} 
        label="Leave Meeting" 
        danger 
        onClick={onLeave}
      />
    </div>
  );
}
