"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await signIn("credentials", {
      name,
      password,
      redirect: false,
    });
    if (result?.error) setError(typeof result?.error === 'string' ? result?.error : JSON.stringify(result?.error) || "로그인 실패");
    if (result?.ok) window.location.href = "/dashboard";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">로그인</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border p-2 rounded text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border p-2 rounded text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            required
          />
          <button type="submit" className="bg-blue-500 text-white rounded p-2">로그인</button>
          {error && (
            <div className="text-red-500 text-sm mb-2">
              {typeof error === 'string' ? error : (error ? JSON.stringify(error) : '알 수 없는 오류가 발생했습니다.')}
            </div>
          )}
        </form>
        <div className="mt-4 flex flex-col gap-2">
          <div className="text-xs text-gray-500 mb-2">
            ※ <b>GitHub/Google 로그인은 별도 연동이 필요</b>합니다.<br />
            현재는 <b>이메일/비밀번호 로그인만 이용</b>하실 수 있습니다.
          </div>
          <button
            className="bg-gray-800 text-white rounded p-2"
            onClick={() => signIn("github")}
          >
            GitHub로 로그인
          </button>
          <button
            className="bg-red-500 text-white rounded p-2"
            onClick={() => signIn("google")}
          >
            Google로 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
