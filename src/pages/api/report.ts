import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { dbConnect } from '@/lib/db';
import Report from '@/models/Report';
import Message from '@/models/Message';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });
  await dbConnect();

  const { messageId, reason } = req.body;
  if (!messageId || !reason) return res.status(400).json({ error: 'Invalid request' });

  // 메시지 정보 확인
  const message = await Message.findById(messageId);
  if (!message) return res.status(404).json({ error: 'Message not found' });

  // 동일 사용자가 동일 메시지 중복 신고 방지
  const duplicate = await Report.findOne({ reporter: session.user.id, message: messageId });
  if (duplicate) return res.status(400).json({ error: '이미 신고한 메시지입니다.' });

  // 신고 저장
  await Report.create({ reporter: session.user.id, message: messageId, reason });

  // 해당 메시지의 sender가 받은 전체 신고 횟수(유저 단위 누적)
  const messagesFromSender = await Message.find({ sender: message.sender }).distinct('_id');
  const reportCount = await Report.countDocuments({ message: { $in: messagesFromSender } });
  if (reportCount >= 10) {
    await User.findByIdAndUpdate(message.sender, { isBanned: true });
  }

  return res.status(200).json({ message: '신고가 접수되었습니다.' });
}
