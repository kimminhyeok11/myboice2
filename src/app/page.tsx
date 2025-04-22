"use client";
import Link from "next/link";
import TypewriterTV from "@/components/TypewriterTV";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const { data: session } = useSession();
  useEffect(() => { setHydrated(true); }, []);

  // 버튼 클릭 시 경로 결정
  const handleStart = () => {
    if (session) {
      window.location.href = "/record";
    } else {
      window.location.href = "/register";
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <TypewriterTV start={hydrated} />
      <h1 className="text-4xl font-bold mb-4 text-blue-700">Echoros</h1>
      <p className="mb-8 text-gray-700 text-center max-w-md">
        누구나 쉽게 음성 메시지를 녹음하고, 랜덤한 누군가에게 보낼 수 있는 서비스입니다.<br />
        새로운 만남과 소통을 경험해보세요!
      </p>
      <button
        onClick={handleStart}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded shadow mb-4 transition"
      >
        메시지 보내기 시작하기
      </button>
      <Link
        href="/about"
        className="text-blue-500 hover:underline text-sm"
      >
        서비스 소개 보기
      </Link>
    </main>
  );
}
