import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import Message from '@/models/Message';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

function parseForm(req: NextApiRequest): Promise<{ audio: Buffer; originalname: string; mimetype: string; fields: any }> {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      const file = (files.audio as formidable.File) || files.file;
      if (!file) return reject(new Error('No audio file'));
      const buffer = fs.readFileSync(file.filepath);
      resolve({ audio: buffer, originalname: file.originalFilename || file.newFilename || 'recording.webm', mimetype: file.mimetype || 'audio/webm', fields });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });
  await dbConnect();

  // form parsing (audio + optional receiver, replyTo)
  let audio, originalname, mimetype, fields;
  try {
    ({ audio, originalname, mimetype, fields } = await parseForm(req));
  } catch (err: any) {
    return res.status(400).json({ error: '오디오 파일 파싱에 실패했습니다.', detail: err.message });
  }

  // 수신자 결정: reply인 경우 fields.receiver 우선, 아니면 랜덤
  let receiverId: string;
  let receiverUser;
  if (fields.receiver) {
    receiverId = fields.receiver;
    receiverUser = await User.findById(receiverId);
    if (!receiverUser) return res.status(404).json({ error: '수신자를 찾을 수 없습니다.' });
  } else {
    const allUsers = await User.find({});
    if (!allUsers.length) return res.status(400).json({ error: '회원이 없습니다.' });
    receiverUser = allUsers[Math.floor(Math.random() * allUsers.length)];
    receiverId = receiverUser._id.toString();
  }

  // 오디오 파일 저장 (간단하게 서버에 저장)
  const ext = originalname.split('.').pop() || 'webm';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const contentType = mimetype || `audio/${ext}`;
  const path = `${receiverId}/${filename}`;

  // 차단 체크
  const senderId = (session.user as { id?: string }).id!;
  // 차단된 사용자 ID 문자열 배열 생성
  const blockedIds: string[] = receiverUser.blockedUsers?.map((id: any) => id.toString()) || [];
  if (blockedIds.includes(senderId)) {
    return res.status(403).json({ error: '차단된 사용자입니다.' });
  }

  // Supabase Storage 클라이언트 생성
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
  // 오디오 업로드
  const { data, error } = await supabase.storage
    .from('audio')
    .upload(path, audio, { contentType });
  if (error) {
    return res.status(500).json({ error: "오디오 업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", detail: error.message });
  }
  // public URL 대신 서명된 URL 생성 (만료 7일)
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('audio')
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signedUrlError) {
    return res.status(500).json({ error: "오디오 URL 생성 중 오류가 발생했습니다.", detail: signedUrlError.message });
  }
  const audioUrl = signedUrlData.signedUrl;

  // 메시지 DB에 저장
  await Message.create({
    sender: senderId,
    receiver: receiverId,
    audioUrl,
    text: "",
    replyTo: fields.replyTo || undefined,
    status: 'unread',
  });
  return res.status(200).json({ message: "우주 어딘가의 누군가에게 메시지가 전송되었습니다! 신의 응답이 함께 하길..", audioUrl });
}
