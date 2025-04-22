import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { dbConnect } from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });
  await dbConnect();

  // 현재 로그인 사용자의 id 찾기
  const user = await User.findOne({ name: session.user.name });
  if (!user) return res.status(404).json({ error: 'User not found' });

  // 받은 메시지 찾기 (receiver가 본인)
  const messages = await Message.find({ receiver: user._id })
    .sort({ createdAt: -1 })
    .populate('sender', 'name')
    .lean();

  // 프론트엔드에 필요한 정보만 가공
  const formatted = messages.map((msg: any) => ({
    _id: msg._id,
    sender: {
      _id: msg.sender?._id?.toString?.() || '',
      name: msg.sender?.name || '알 수 없음',
    },
    audioUrl: msg.audioUrl ?? undefined,
    text: msg.text ?? "",
    createdAt: msg.createdAt,
  }));

  return res.status(200).json({ messages: formatted });
}
