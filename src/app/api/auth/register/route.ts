import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    console.log("register: start");
    const { name, password } = await req.json();
    console.log("register: got body", { name });
    if (!name || !password) {
      console.log("register: missing name or password");
      return NextResponse.json({ error: '이름과 비밀번호를 입력하세요.' }, { status: 400 });
    }
    await dbConnect();
    console.log("register: db connected");
    const existing = await User.findOne({ name });
    console.log("register: user existence checked", { exists: !!existing });
    if (existing) {
      console.log("register: duplicate name");
      return NextResponse.json({ error: '이미 가입된 이름입니다.' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    console.log("register: password hashed");
    const user = await User.create({ name, password: hashed });
    console.log("register: user created", { name: user.name });
    return NextResponse.json({ message: '회원가입 성공', user: { name: user.name } }, { status: 201 });
  } catch (e: any) {
    console.error("register error:", e);
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
