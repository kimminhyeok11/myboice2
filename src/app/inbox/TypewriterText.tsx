"use client";
import { useEffect, useRef, useState } from "react";

export default function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const i = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    i.current = 0;
    if (!text) return;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i.current]);
      i.current += 1;
      if (i.current >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 28); // 타이핑 속도 조절
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span>
      {displayed}
      <span className={`ml-1 ${done ? 'opacity-0' : 'opacity-100 animate-pulse'} text-white`}>|</span>
    </span>
  );
}
