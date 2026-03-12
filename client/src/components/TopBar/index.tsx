"use client";

import { useEffect, useState } from "react";
import { Shield, Settings, Info, Wifi } from "lucide-react";
import { theme } from "@/styles/theme";
import { useMeetingStore } from "@/store/meetingStore";

export default function TopBar({ roomId }: { roomId: string }) {
  const { participants } = useMeetingStore();
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header style={{
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      background: theme.colors.bg,
      borderBottom: `1px solid ${theme.colors.border}`,
      color: theme.colors.text,
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ padding: 8, background: theme.colors.primary, borderRadius: 8 }}>
            <Video size={20} color="white" />
          </div>
          <span style={{ fontWeight: 600, fontSize: 18 }}>Plex Meet</span>
        </div>
        <div style={{ width: 1, height: 24, background: theme.colors.border }} />
        <span style={{ fontSize: 14, color: theme.colors.textMuted, fontFamily: theme.font.mono }}>{roomId}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: theme.colors.textMuted, fontSize: 14 }}>
          <span>{time}</span>
          <span>•</span>
          <span>{participants.size + 1} in call</span>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="icon-btn-plain"><Wifi size={18} /></button>
          <button className="icon-btn-plain"><Shield size={18} /></button>
          <button className="icon-btn-plain"><Settings size={18} /></button>
          <button className="icon-btn-plain"><Info size={18} /></button>
        </div>
      </div>

      <style jsx>{`
        .icon-btn-plain {
          background: none;
          border: none;
          color: ${theme.colors.textMuted};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
          border-radius: 50%;
          transition: background 0.2s, color 0.2s;
        }
        .icon-btn-plain:hover {
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
        }
      `}</style>
    </header>
  );
}

import { Video } from "lucide-react";
