import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });
  await dbConnect();
  const user = await User.findOne({ name: session.user.name });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.status(200).json({ blockedUsers: user.blockedUsers.map((id:any) => id.toString()) });
}
