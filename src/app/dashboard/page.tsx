import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl mb-4">로그인이 필요합니다.</h2>
        <Link href="/login" className="text-blue-500 underline">로그인 페이지로 이동</Link>
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">대시보드</h1>
      <div className="mb-4">
        <span className="font-semibold">이메일:</span> {session.user.email}
      </div>
      <div className="mb-4">
        <span className="font-semibold">이름:</span> {session.user.name || "(없음)"}
      </div>
      <div className="mb-4">
        <Link href="/friends" className="text-blue-500 underline">친구 목록 보기</Link>
      </div>
      <div className="mb-4">
        <Link href="/inbox" className="text-blue-500 underline">받은 메시지함</Link>
      </div>
      <div className="mb-4">
        <Link href="/record" className="text-blue-500 underline">음성 메시지 보내기</Link>
      </div>
    </div>
  );
}
