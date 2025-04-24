"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import axios from "axios";

export default function Navbar() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  // 30초마다 읽지 않은 메시지 개수 폴링
  useEffect(() => {
    if (!session?.user || pathname === "/inbox") return;
    let mounted = true;
    const fetchUnread = async () => {
      try {
        const res = await axios.get("/api/messages/unread-count");
        if (mounted) setUnreadCount(res.data.count);
      } catch {
        if (mounted) setUnreadCount(0);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, [session, pathname]);

  // 받은 메시지함에 들어가면 뱃지 0으로 초기화
  useEffect(() => {
    if (pathname === "/inbox" && unreadCount > 0) {
      setUnreadCount(0);
    }
  }, [pathname]);

  return (
    <nav className="w-full bg-gray-100 py-1 px-2 flex gap-2 items-center border-b mb-2 text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
      <Link href="/" className="font-bold text-blue-600 hover:underline">홈</Link>
      <Link href="/record" className="text-gray-700 hover:underline">메시지 보내기</Link>
      <Link href="/inbox" className="text-gray-700 hover:underline relative">
        받은 메시지함
        {unreadCount > 0 && (
          <span className="ml-2 inline-block bg-red-500 text-white text-xs rounded-full px-2 py-0.5 align-middle">
            [{unreadCount}]
          </span>
        )}
      </Link>
      <Link href="/friends" className="text-gray-700 hover:underline">친구 목록</Link>
      <Link href="/about" className="text-gray-700 hover:underline">서비스 소개</Link>
      <div className="ml-auto flex gap-4">
        {!session?.user ? (
          <>
            <Link href="/login" className="hover:underline">로그인</Link>
            <Link href="/register" className="hover:underline">회원가입</Link>
          </>
        ) : (
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-white hover:underline">
            로그아웃
          </button>
        )}
      </div>
    </nav>
  );
}
