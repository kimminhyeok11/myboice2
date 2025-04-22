import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import Message from '@/models/Message';
import { createClient } from '@supabase/supabase-js';

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
  // 랜덤 회원 찾기 (본인 포함)
  const allUsers = await User.find({});
  if (allUsers.length === 0) return res.status(400).json({ error: '회원이 없습니다.' });
  const randomUser = allUsers[Math.floor(Math.random() * allUsers.length)];
  // 오디오 파일 저장 (간단하게 서버에 저장)
  const { audio } = await parseForm(req);
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webm`;

  // 차단 체크
  const senderId = (session.user as { id?: string }).id!;
  // 차단된 사용자 ID 문자열 배열 생성
  const blockedIds: string[] = randomUser.blockedUsers?.map((id: any) => id.toString()) || [];
  if (blockedIds.includes(senderId)) {
    return res.status(403).json({ error: '차단된 사용자입니다.' });
  }

  // Supabase Storage 클라이언트 생성
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  // 오디오 업로드
  const { data, error } = await supabase.storage
    .from('audio')
    .upload(filename, audio, { contentType: 'audio/webm' });
  if (error) {
    return res.status(500).json({ error: '오디오 업로드 실패', detail: error.message });
  }
  // public URL 생성
  const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(filename);
  const audioUrl = publicUrlData.publicUrl;
  // 메시지 DB에 저장
  await Message.create({
    sender: senderId,
    receiver: randomUser._id,
    audioUrl,
    text: "", // 명시적으로 빈 문자열 저장
    status: 'unread',
  });
  return res.status(200).json({ message: "우주 어딘가의 누군가에게 메시지가 전송되었습니다! 신의 응답이 함께 하길.." });
}
