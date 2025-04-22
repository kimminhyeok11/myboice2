import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import Message from '@/models/Message';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });
  await dbConnect();

  const { text, receiver, replyTo } = req.body;
  if (!text || typeof text !== 'string' || text.length === 0 || text.length > 100) {
    return res.status(400).json({ error: '텍스트는 1~100자 이내여야 합니다.' });
  }

  let targetUser;
  if (receiver) {
    // 답장: receiver 명시
    targetUser = await User.findById(receiver);
    if (!targetUser) return res.status(404).json({ error: '수신자를 찾을 수 없습니다.' });
  } else {
    // 랜덤 회원 찾기 (본인 포함)
    const allUsers = await User.find({});
    if (allUsers.length === 0) return res.status(400).json({ error: '회원이 없습니다.' });
    targetUser = allUsers[Math.floor(Math.random() * allUsers.length)];
  }

  await Message.create({
    sender: (session.user as { id?: string }).id,
    receiver: targetUser._id,
    text,
    replyTo: replyTo || undefined,
    status: 'unread',
  });

  return res.status(200).json({ message: "우주 어딘가의 누군가에게 메시지가 전송되었습니다! 신의 응답이 함께 하길.." });
}
