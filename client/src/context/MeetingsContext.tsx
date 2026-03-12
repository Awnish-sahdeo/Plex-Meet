"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

export interface MeetingEntry {
  roomId: string;
  joinedAt: number; // timestamp
  title?: string;
}

interface MeetingsContextValue {
  activeMeetings: MeetingEntry[];
  recentMeetings: MeetingEntry[];
  joinMeeting: (roomId: string, title?: string) => void;
  leaveMeeting: (roomId: string) => void;
}

const MeetingsContext = createContext<MeetingsContextValue>({
  activeMeetings: [],
  recentMeetings: [],
  joinMeeting: () => {},
  leaveMeeting: () => {},
});

export function MeetingsProvider({ children }: { children: ReactNode }) {
  const [activeMeetings, setActiveMeetings] = useState<MeetingEntry[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<MeetingEntry[]>([]);

  // Restore recent meetings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("plexmeet_recent");
      if (stored) setRecentMeetings(JSON.parse(stored));
    } catch {}
  }, []);

  const joinMeeting = useCallback((roomId: string, title?: string) => {
    const entry: MeetingEntry = { roomId, title, joinedAt: Date.now() };

    setActiveMeetings((prev) => {
      if (prev.find((m) => m.roomId === roomId)) return prev;
      return [...prev, entry];
    });

    setRecentMeetings((prev) => {
      const filtered = prev.filter((m) => m.roomId !== roomId);
      const updated = [entry, ...filtered].slice(0, 8); // keep last 8
      try { localStorage.setItem("plexmeet_recent", JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const leaveMeeting = useCallback((roomId: string) => {
    setActiveMeetings((prev) => prev.filter((m) => m.roomId !== roomId));
  }, []);

  return (
    <MeetingsContext.Provider value={{ activeMeetings, recentMeetings, joinMeeting, leaveMeeting }}>
      {children}
    </MeetingsContext.Provider>
  );
}

export const useMeetings = () => useContext(MeetingsContext);
