import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import Message from '@/models/Message';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req: NextApiRequest): Promise<{ audio: Buffer }> {
  return new Promise((resolve, reject) => {
    const data: Buffer[] = [];
    req.on('data', chunk => data.push(chunk));
    req.on('end', () => {
      // NOTE: 실제 서비스에서는 formidable 등으로 멀티파트 파싱 필요
      resolve({ audio: Buffer.concat(data) });
    });
    req.on('error', reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });
  await dbConnect();
  // 랜덤 회원 찾기 (본인 제외)
  const allUsers = await User.find({ email: { $ne: session.user.email } });
  if (allUsers.length === 0) return res.status(400).json({ error: '다른 회원이 없습니다.' });
  const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
  // 오디오 파일 저장 (간단하게 서버에 저장)
  const { audio } = await parseForm(req);
  const audioDir = path.join(process.cwd(), 'public', 'audio');
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webm`;
  const filepath = path.join(audioDir, filename);
  fs.writeFileSync(filepath, audio);
  const audioUrl = `/audio/${filename}`;
  // 메시지 DB에 저장
  await Message.create({
    sender: (session.user as { id?: string }).id,
    receiver: randomUser._id,
    audioUrl,
    status: 'unread',
  });
  return res.status(200).json({ message: `${randomUser.name || randomUser.email}님에게 메시지가 전송되었습니다!` });
}
