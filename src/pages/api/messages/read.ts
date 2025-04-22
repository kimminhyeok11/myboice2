import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { dbConnect } from '@/lib/db';
import Message from '@/models/Message';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });
  await dbConnect();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Message ID required' });

  // 본인이 받은 메시지만 읽음 처리 가능
  const msg = await Message.findOne({ _id: id, receiver: user._id });
  if (!msg) return res.status(404).json({ error: 'Message not found' });
  msg.status = 'read';
  await msg.save();
  return res.status(200).json({ message: '읽음 처리 완료' });
}
