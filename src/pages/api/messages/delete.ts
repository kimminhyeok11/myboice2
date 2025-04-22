import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { dbConnect } from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });
  await dbConnect();

  const user = await User.findOne({ name: session.user.name });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Message ID required' });

  // 본인이 받은 메시지만 삭제 가능
  const msg = await Message.findOne({ _id: id, receiver: user._id });
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  await Message.deleteOne({ _id: id });
  return res.status(200).json({ message: '메시지 삭제 완료' });
}
