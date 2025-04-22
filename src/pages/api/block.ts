import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });
  await dbConnect();

  const { userIdToBlock } = req.body;
  if (!userIdToBlock) return res.status(400).json({ error: 'Invalid request' });

  const me = await User.findById(session.user.id);
  if (!me) return res.status(404).json({ error: 'User not found' });
  if (!me.blockedUsers.includes(userIdToBlock)) {
    me.blockedUsers.push(userIdToBlock);
    await me.save();
  }

  return res.status(200).json({ message: '해당 사용자를 차단했습니다.' });
}
