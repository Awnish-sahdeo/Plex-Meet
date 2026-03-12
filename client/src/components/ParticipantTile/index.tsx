"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MicOff, Pin, Maximize2 } from "lucide-react";
import { theme } from "@/styles/theme";

interface ParticipantTileProps {
  stream?: MediaStream;
  name: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isSpeaking?: boolean;
}

export default function ParticipantTile({
  stream,
  name,
  isLocal,
  isMuted,
  isCameraOff,
  isSpeaking,
}: ParticipantTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        boxShadow: isSpeaking ? theme.shadow.glowGreen : "none",
        borderColor: isSpeaking ? theme.colors.success : theme.colors.border,
      }}
      transition={{ type: "spring", damping: 20, stiffness: 120 }}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: theme.colors.tile,
        borderRadius: theme.radius.lg,
        overflow: "hidden",
        border: "2px solid transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isCameraOff || !stream ? (
        <div style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: theme.colors.bgElevated,
          color: theme.colors.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          fontWeight: 600,
        }}>
          {name.charAt(0).toUpperCase()}
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: isLocal ? "scaleX(-1)" : "none",
          }}
        />
      )}

      {/* Overlays */}
      <div style={{
        position: "absolute",
        bottom: 12,
        left: 12,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        padding: "4px 10px",
        borderRadius: theme.radius.sm,
        display: "flex",
        alignItems: "center",
        gap: 6,
        maxWidth: "80%",
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: theme.colors.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name} {isLocal && "(You)"}
        </span>
        {isMuted && <MicOff size={14} color={theme.colors.danger} />}
      </div>

      <div style={{
        position: "absolute",
        top: 12,
        right: 12,
        display: "flex",
        gap: 8,
        opacity: 0,
        transition: "opacity 0.2s"
      }} className="tile-actions">
        <button className="icon-btn-small" style={{ background: "rgba(0,0,0,0.5)", border: "none", color: "white", padding: 4, borderRadius: 4 }}>
          <Pin size={16} />
        </button>
      </div>

      <style jsx>{`
        div:hover .tile-actions {
          opacity: 1;
        }
        .icon-btn-small:hover {
          background: rgba(0,0,0,0.8);
        }
      `}</style>
    </motion.div>
  );
}
