"use client";
import { useEffect, useRef, useState } from "react";
import Image from 'next/image';

const STORY = [
  "...여기는 주피터 탐사대원 1117호, 마지막 생존자.",
  "",
  "우주선은 전복됐다. 시스템은 침묵했고, 나침반은 돌기를 멈췄다.",
  "식량은 사라졌고, 생존 가능성은 수치조차 불가능한 수준.",
  "나는 지금, 이름 없는 행성의 모래바다 위에 있다.",
  "",
  "이 통신기도 곧 꺼지겠지. 하지만 혹시 모르잖아.",
  "혹시, 누군가 듣고 있다면.",
  "나는 살아 있다.",
  "",
  "[신호 종료...]"
];

export default function TypewriterTV({ start = false }: { start?: boolean }) {
  const [hydrated, setHydrated] = useState(false);
  const [displayed, setDisplayed] = useState("");
  const [line, setLine] = useState(0);
  const [char, setChar] = useState(0);
  const interval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!start || !hydrated) return;
    if (line >= STORY.length) return;
    interval.current = setInterval(() => {
      setDisplayed((prev) => prev + STORY[line][char]);
      setChar((c) => c + 1);
    }, 110);
    return () => clearInterval(interval.current!);
  }, [line, char, start, hydrated]);

  useEffect(() => {
    if (line < STORY.length && char === STORY[line].length) {
      clearInterval(interval.current!);
      setTimeout(() => {
        setDisplayed((prev) => prev + "\n");
        setLine((l) => l + 1);
        setChar(0);
      }, 1200);
    }
  }, [char, line]);

  return (
    <div className="relative flex justify-center items-center w-full max-w-md mx-auto" style={{aspectRatio: '4/3', minHeight: 220}}>
      {/* TV 프레임 SVG 이미지 */}
      <Image
        src="/images/tv-frame.svg"
        alt="tv frame"
        fill
        className="absolute inset-0 object-fill pointer-events-none select-none z-30"
        style={{ opacity: 1 }}
        draggable={false}
        unoptimized
        priority
      />
      {/* 글자 박스 */}
      <div
        className="absolute inset-0 flex flex-col justify-center items-center w-full h-full px-12 py-10 z-40"
        style={{
          fontFamily: '"VT323", monospace',
          background: "radial-gradient(ellipse at 50% 40%, #222 70%, #000 100%)",
          borderRadius: 32,
          boxSizing: "border-box",
        }}
      >
        {/* 강한 노이즈 */}
        <svg className="pointer-events-none absolute inset-0 w-full h-full" style={{mixBlendMode: 'soft-light', opacity: 0.32, zIndex: 31}} xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
        <div
          className="w-full text-green-400 whitespace-pre-wrap break-words overflow-hidden text-xs leading-none tracking-wide text-center relative z-40"
          style={{ minHeight: 80, fontFamily: 'VT323, monospace', fontSize: '13px', lineHeight: '1.05' }}
        >
          {displayed}
          <span className="animate-pulse">█</span>
        </div>
        <div className="mt-1 text-gray-500 text-xs z-40 text-center">[기록: 항성일 4372-AX]</div>
      </div>
    </div>
  );
}
