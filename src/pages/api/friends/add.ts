import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });
  const { friendId } = req.body;
  if (!friendId) return res.status(400).json({ error: 'No friendId provided' });
  await dbConnect();
  const user = await User.findOne({ email: session.user.email });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.friends.includes(friendId)) {
    return res.status(200).json({ message: 'Already friends' });
  }
  user.friends.push(friendId);
  await user.save();
  return res.status(200).json({ message: 'Friend added' });
}
