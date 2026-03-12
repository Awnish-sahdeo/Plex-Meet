"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMeetingStore } from "@/store/meetingStore";
import { theme } from "@/styles/theme";

export default function ChatPanel() {
  const { messages, setPanel, addMessage } = useMeetingStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    // In a real app, this would be sent via socket. sendMessage is handled in useWebRTC.
    // We expect the message to come back via socket and be added to the store.
    // For now, assume high level component handles the actual WS call.
    setInput("");
  };

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
        <h3 style={{ margin: 0, fontWeight: 600, color: theme.colors.text }}>In-call messages</h3>
        <button onClick={() => setPanel(null)} style={{ background: "none", border: "none", color: theme.colors.textMuted, cursor: "pointer" }}>
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} style={{
        flex: 1,
        overflowY: "auto",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 4 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: theme.colors.primary }}>{msg.senderName}</span>
                <span style={{ fontSize: 11, color: theme.colors.textDim }}>
                  {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{
                margin: 0,
                fontSize: 14,
                color: theme.colors.text,
                lineHeight: "1.5",
                background: theme.colors.surface,
                padding: "8px 12px",
                borderRadius: "0 12px 12px 12px",
                alignSelf: "flex-start",
              }}>
                {msg.text}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSend} style={{
        padding: 20,
        borderTop: `1px solid ${theme.colors.border}`,
        background: theme.colors.bg,
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: theme.colors.surface,
          padding: "8px 12px",
          borderRadius: 24,
          border: `1px solid ${theme.colors.border}`,
        }}>
          <button type="button" style={{ background: "none", border: "none", color: theme.colors.textMuted }}><Smile size={18} /></button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message to everyone"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              color: theme.colors.text,
              fontSize: 14,
              outline: "none",
            }}
          />
          <button type="submit" style={{ 
            background: "none", 
            border: "none", 
            color: input.trim() ? theme.colors.primary : theme.colors.textDim,
            cursor: input.trim() ? "pointer" : "default" 
          }}>
            <Send size={18} />
          </button>
        </div>
      </form>
    </motion.aside>
  );
}
