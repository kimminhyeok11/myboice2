import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-100 py-3 px-4 flex gap-4 items-center border-b mb-6">
      <Link href="/dashboard" className="font-bold text-blue-600 hover:underline">홈</Link>
      <Link href="/record" className="text-gray-700 hover:underline">메시지 보내기</Link>
      <Link href="/inbox" className="text-gray-700 hover:underline">받은 메시지함</Link>
      <Link href="/friends" className="text-gray-700 hover:underline">친구 목록</Link>
      <Link href="/about" className="text-gray-700 hover:underline">서비스 소개</Link>
      <Link href="/login" className="ml-auto text-gray-500 hover:underline">로그인</Link>
    </nav>
  );
}
