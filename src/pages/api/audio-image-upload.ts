import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('DEBUG: SUPABASE_URL=', process.env.SUPABASE_URL);
  console.log('DEBUG: SUPABASE_ANON_KEY=', process.env.SUPABASE_ANON_KEY?.slice(0, 10) + '...');
  if (req.method !== "POST") return res.status(405).end();

  try {
    const form = new formidable.IncomingForm();
    const { files } = await new Promise<{ files: any }>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        else resolve({ files });
      });
    });

    const file = files.image as any;
    if (!file) return res.status(400).json({ error: "이미지 파일이 없습니다." });

    const fileData = fs.readFileSync(file.filepath);
    const ext = file.originalFilename?.split('.')?.pop() || 'png';
    const filename = `test-image-${Date.now()}.${ext}`;
    const contentType = file.mimetype || `image/${ext}`;

    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(filename, fileData, { contentType });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('audio').getPublicUrl(filename);
    return res.status(200).json({ url: publicUrlData.publicUrl });
  } catch (err: any) {
    console.error('Upload error:', err);
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.message || '서버 오류' });
  }
}
