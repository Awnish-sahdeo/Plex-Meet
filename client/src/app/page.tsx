"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMeetings } from "@/context/MeetingsContext";
import { theme } from "@/styles/theme";
import { Video, Plus, Link, ArrowRight, Clock as ClockIcon, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo({ size = 32 }: { size?: number }) {
  return (
    <div style={{ 
      width: size, 
      height: size, 
      background: theme.colors.primary, 
      borderRadius: 8, 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      boxShadow: theme.shadow.glow,
    }}>
      <Video size={size * 0.6} color="white" />
    </div>
  );
}

// ── Clock ─────────────────────────────────────────────────────────────────────
function Clock() {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setDisplay(n.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{display}</span>;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { activeMeetings, recentMeetings, joinMeeting } = useMeetings();
  const [joinCode, setJoinCode] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const genId = () => [3, 4, 3].map((n) => Math.random().toString(36).slice(2, 2 + n)).join("-");

  const startNow = () => {
    const id = genId();
    joinMeeting(id, `Meeting — ${id}`);
    router.push(`/room/${id}`);
    setShowMenu(false);
  };

  const copyLink = () => {
    const id = genId();
    navigator.clipboard.writeText(`${window.location.origin}/room/${id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    setShowMenu(false);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().replace(/\s/g, "");
    if (!code) return;
    joinMeeting(code);
    router.push(`/room/${code}`);
  };

  const date = new Date().toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column", 
      background: theme.colors.bg,
      color: theme.colors.text,
      fontFamily: theme.font.sans,
    }}>

      {/* ── Nav ── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: "64px",
        borderBottom: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Logo size={36} />
          <span style={{ fontSize: "20px", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Plex<span style={{ color: theme.colors.primary }}>Meet</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "14px", color: theme.colors.textMuted }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ClockIcon size={14} />
            <Clock />
          </div>
          <span style={{ color: theme.colors.border }}>|</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={14} />
            <span>{date}</span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        paddingTop: "100px", 
        gap: "64px",
        background: `radial-gradient(circle at top center, ${theme.colors.primary}10, transparent 40%)`
      }}>

        {/* Hero */}
        <div style={{ textAlign: "center", maxWidth: "640px", padding: "0 24px" }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ 
              fontSize: "56px", 
              fontWeight: 800, 
              lineHeight: 1.1, 
              marginBottom: "20px",
              letterSpacing: "-0.03em",
            }}
          >
            Premium video meetings.<br />
            <span style={{ 
              background: `linear-gradient(to right, ${theme.colors.primary}, ${theme.colors.secondary})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>Now free for everyone.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontSize: "18px", color: theme.colors.textMuted, lineHeight: 1.5 }}
          >
            We rebuilt Plex Meet for professional conferencing. High-definition media, real-time collaboration, and global scalability.
          </motion.p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>

          {/* New meeting dropdown */}
          <div style={{ position: "relative" }} ref={menuRef}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary" 
              onClick={() => setShowMenu(p => !p)}
              style={{
                background: theme.colors.primary,
                color: "white",
                border: "none",
                padding: "14px 28px",
                borderRadius: 30,
                fontWeight: 600,
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                boxShadow: theme.shadow.glow,
              }}
            >
              <Plus size={20} />
              New meeting
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 12px)",
                    left: 0,
                    width: 260,
                    background: theme.colors.bgElevated,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.radius.lg,
                    boxShadow: theme.shadow.lg,
                    padding: 8,
                    zIndex: 100,
                  }}
                >
                  <div className="menu-item" onClick={startNow}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${theme.colors.primary}20`, color: theme.colors.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Video size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Start instant meeting</div>
                      <div style={{ fontSize: 12, color: theme.colors.textDim }}>Join right now</div>
                    </div>
                  </div>
                  <div className="menu-item" onClick={copyLink}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${theme.colors.success}20`, color: theme.colors.success, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Link size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{copied ? "Copied!" : "Create link"}</div>
                      <div style={{ fontSize: 12, color: theme.colors.textDim }}>Share with others</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span style={{ color: theme.colors.textDim, fontSize: "14px", fontWeight: 500 }}>or</span>

          {/* Join by code */}
          <form onSubmit={handleJoin} style={{ display: "flex", gap: "12px" }}>
            <div style={{ position: "relative" }}>
              <input
                className="input-field"
                placeholder="Enter a code or link"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                style={{ 
                  background: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                  padding: "14px 20px",
                  borderRadius: 30,
                  width: "280px",
                  fontSize: "16px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={!joinCode.trim()}
              style={{
                background: "none",
                border: "none",
                color: joinCode.trim() ? theme.colors.primary : theme.colors.textDim,
                fontWeight: 600,
                fontSize: "16px",
                cursor: joinCode.trim() ? "pointer" : "default",
                padding: "0 12px",
              }}
            >
              Join
            </button>
          </form>
        </div>

        {/* ── Status Section ── */}
        <div style={{ width: "100%", maxWidth: "800px", padding: "0 24px 64px" }}>
          {activeMeetings.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: theme.colors.primary, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Live Now</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
                {activeMeetings.map(m => (
                  <div key={m.roomId} className="meeting-card" onClick={() => router.push(`/room/${m.roomId}`)}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: theme.colors.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                      <Video size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>{m.title || m.roomId}</div>
                      <div style={{ fontSize: 13, color: theme.colors.textDim }}>{m.roomId}</div>
                    </div>
                    <ArrowRight size={20} color={theme.colors.textDim} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentMeetings.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: theme.colors.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Recently Visited</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 12 }}>
                {recentMeetings.slice(0, 4).map(m => (
                  <div key={m.roomId} className="meeting-card" onClick={() => router.push(`/room/${m.roomId}`)}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: theme.colors.surface, display: "flex", alignItems: "center", justifyContent: "center", color: theme.colors.textDim }}>
                      <ClockIcon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{m.title || m.roomId}</div>
                      <div style={{ fontSize: 12, color: theme.colors.textDim }}>
                        {new Date(m.joinedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: ${theme.radius.md};
          cursor: pointer;
          transition: background 0.2s;
        }
        .menu-item:hover {
          background: ${theme.colors.surface};
        }
        .meeting-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: ${theme.colors.bgElevated};
          border: 1px solid ${theme.colors.border};
          borderRadius: ${theme.radius.lg};
          cursor: pointer;
          transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .meeting-card:hover {
          transform: translateY(-2px);
          background: ${theme.colors.surface};
          box-shadow: ${theme.shadow.md};
        }
        .input-field:focus {
          border-color: ${theme.colors.primary};
        }
      `}</style>
    </div>
  );
}
