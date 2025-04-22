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
  const user = await User.findOne({ email: session.user.email }).populate("friends");
  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">내 친구 목록</h1>
      <ul className="list-disc list-inside">
        {user.friends.length === 0 && <li>친구가 없습니다.</li>}
        {user.friends.map((friend: any) => (
          <li key={friend._id} className="mb-2">
            {friend.name || friend.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
