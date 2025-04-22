"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", { name, password });
      // 회원가입 성공 시 자동 로그인
      const loginRes = await signIn("credentials", {
        name,
        password,
        redirect: false,
      });
      if (loginRes?.error) {
        setError(typeof loginRes?.error === 'string' ? loginRes?.error : JSON.stringify(loginRes?.error) || '회원가입 실패');
        setTimeout(() => router.push("/login"), 2000);
      } else {
        router.push("/dashboard"); // 원하는 경로로 이동
      }
    } catch (e: any) {
      setError(typeof e.response?.data?.error === 'string' ? e.response?.data?.error : e.response?.data?.error?.message || '회원가입 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">회원가입</h1>
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
          <button type="submit" className="bg-blue-500 text-white rounded p-2" disabled={loading}>
            {loading ? "가입 중..." : "회원가입"}
          </button>
          {error && (
            <div className="text-red-500 text-sm mb-2">
              {typeof error === 'string' ? error : (error ? JSON.stringify(error) : '알 수 없는 오류가 발생했습니다.')}
            </div>
          )}
          {success && <div className="text-green-600 text-sm">{success}</div>}
        </form>
        <div className="mt-4 text-center">
          <a href="/login" className="text-blue-500 underline">이미 계정이 있으신가요? 로그인</a>
        </div>
      </div>
    </div>
  );
}
