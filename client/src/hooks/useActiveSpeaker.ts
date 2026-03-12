"use client";

import { useEffect, useRef } from "react";
import { useMeetingStore } from "@/store/meetingStore";

export function useActiveSpeaker() {
  const { participants, setActiveSpeaker } = useMeetingStore();
  const analysers = useRef<Map<string, { analyser: AnalyserNode; data: Uint8Array }>>(new Map());
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const checkVolume = () => {
      let loudestId: string | null = null;
      let maxVol = 0;

      participants.forEach((p, socketId) => {
        if (!p.stream || p.isMuted) return;
        
        const stream = p.stream;
        let record = analysers.current.get(socketId);
        if (!record) {
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          record = { analyser, data: new Uint8Array(analyser.frequencyBinCount) };
          analysers.current.set(socketId, record);
        }

        if (record) {
          (record.analyser as any).getByteFrequencyData(record.data);
          
          let sum = 0;
          for (let i = 0; i < record.data.length; i++) {
            sum += record.data[i];
          }
          const avg = sum / record.data.length;
          
          if (avg > 30 && avg > maxVol) {
            maxVol = avg;
            loudestId = socketId;
          }
        }
      });

      setActiveSpeaker(loudestId);
      animationFrame.current = requestAnimationFrame(checkVolume);
    };

    animationFrame.current = requestAnimationFrame(checkVolume);

    const currentAnalysers = analysers.current;
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      audioCtx.close().catch(e => console.error(e));
      currentAnalysers.clear();
    };
  }, [participants, setActiveSpeaker]);

  return null;
}
