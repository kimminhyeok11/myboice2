import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import User from "@/models/User";
import { dbConnect } from "@/lib/db";

export default async function FriendsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <div className="p-8">로그인이 필요합니다.</div>;
  }
  await dbConnect();
  // 최대 4명까지만 표시
  const users = await User.find({ name: { $ne: session.user.name } }).limit(4);
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">다른 사용자 목록</h1>
      <ul className="list-disc list-inside">
        {users.length === 0 && <li>다른 사용자가 없습니다.</li>}
        {users.map((user: any) => (
          <li key={user._id} className="mb-2">
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
