"use client";

import { X, UserPlus, Search, MoreHorizontal, MicOff, CameraOff } from "lucide-react";
import { motion } from "framer-motion";
import { useMeetingStore } from "@/store/meetingStore";
import { theme } from "@/styles/theme";

export default function ParticipantsPanel() {
  const { participants, setPanel } = useMeetingStore();
  const participantsList = Array.from(participants.values());

  return (
    <motion.aside
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      style={{
        width: 360,
        height: "100%",
        background: theme.colors.bgElevated,
        borderLeft: `1px solid ${theme.colors.border}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
      }}
    >
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${theme.colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <h3 style={{ margin: 0, fontWeight: 600, color: theme.colors.text }}>People</h3>
        <button onClick={() => setPanel(null)} style={{ background: "none", border: "none", color: theme.colors.textMuted, cursor: "pointer" }}>
          <X size={20} />
        </button>
      </div>

      <div style={{ padding: 20 }}>
        <button style={{
          width: "100%",
          padding: "10px 16px",
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: 24,
          color: theme.colors.text,
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          fontSize: 14,
          transition: "background 0.2s",
        }}>
          <UserPlus size={18} color={theme.colors.primary} />
          <span>Add others</span>
        </button>
      </div>

      <div style={{ padding: "0 20px 12px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: theme.colors.surface,
          padding: "8px 12px",
          borderRadius: 8,
          border: `1px solid ${theme.colors.border}`,
        }}>
          <Search size={16} color={theme.colors.textDim} />
          <input
            placeholder="Search for people"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              color: theme.colors.text,
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        <div style={{ padding: "8px 12px", fontSize: 12, fontWeight: 600, color: theme.colors.textDim, textTransform: "uppercase" }}>
          In-call ({participantsList.length + 1})
        </div>

        {/* Local user */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          borderRadius: 8,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: theme.colors.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "white" }}>Y</div>
            <span style={{ fontSize: 14, color: theme.colors.text }}>You</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.colors.textDim }}>
            <MicOff size={16} />
            <MoreHorizontal size={16} />
          </div>
        </div>

        {/* Remote users */}
        {participantsList.map((p) => (
          <div key={p.socketId} style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            borderRadius: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: theme.colors.secondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: "white" }}>
                {p.displayName.charAt(0)}
              </div>
              <span style={{ fontSize: 14, color: theme.colors.text }}>{p.displayName}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.colors.textDim }}>
              {p.isMuted && <MicOff size={16} />}
              {p.isCameraOff && <CameraOff size={16} />}
              <MoreHorizontal size={16} />
            </div>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}
