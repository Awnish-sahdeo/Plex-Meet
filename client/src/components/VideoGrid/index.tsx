"use client";

import { useMeetingStore } from "@/store/meetingStore";
import ParticipantTile from "@/components/ParticipantTile";
import { AnimatePresence } from "framer-motion";

export default function VideoGrid({ localStream }: { localStream: MediaStream | null }) {
  const { participants, activeSpeakerId, isMuted, isCameraOff } = useMeetingStore();
  
  const participantsList = Array.from(participants.values());
  const totalCount = participantsList.length + 1; // +1 for local

  const getGridConfig = (count: number) => {
    if (count === 1) return { columns: "1fr", rows: "1fr" };
    if (count === 2) return { columns: "1fr 1fr", rows: "1fr" };
    if (count <= 4) return { columns: "1fr 1fr", rows: "1fr 1fr" };
    if (count <= 6) return { columns: "1fr 1fr 1fr", rows: "1fr 1fr" };
    if (count <= 9) return { columns: "1fr 1fr 1fr", rows: "1fr 1fr 1fr" };
    return { columns: "repeat(4, 1fr)", rows: "repeat(3, 1fr)" };
  };

  const { columns, rows } = getGridConfig(totalCount);

  return (
    <div style={{
      flex: 1,
      display: "grid",
      gridTemplateColumns: columns,
      gridTemplateRows: rows,
      gap: 12,
      padding: 16,
      width: "100%",
      height: "100%",
      overflow: "hidden",
    }}>
      <AnimatePresence>
        {/* Local Participant */}
        <ParticipantTile
          key="local"
          name="You"
          isLocal
          stream={localStream || undefined}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isSpeaking={activeSpeakerId === "local"}
        />

        {/* Remote Participants */}
        {participantsList.map((p) => (
          <ParticipantTile
            key={p.socketId}
            name={p.displayName}
            stream={p.stream}
            isMuted={p.isMuted}
            isCameraOff={p.isCameraOff}
            isSpeaking={activeSpeakerId === p.socketId}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
