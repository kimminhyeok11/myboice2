import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { dbConnect } from '@/lib/db';
import Message from '@/models/Message';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ count: 0 });
  await dbConnect();
  // receiver가 ObjectId라면 아래처럼 변환, string이면 변환 없이 사용
  // import mongoose from 'mongoose';
  // const count = await Message.countDocuments({ receiver: new mongoose.Types.ObjectId(session.user.id), status: 'unread' });
  const userId = session.user.id ?? session.user.id;
  const count = await Message.countDocuments({ receiver: userId, status: 'unread' });
  return res.status(200).json({ count });
}
