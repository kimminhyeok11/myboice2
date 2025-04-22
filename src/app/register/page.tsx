"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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
      const res = await axios.post("/api/auth/register", { email, name, password });
      // 회원가입 성공 시 자동 로그인
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (loginRes?.error) {
        setSuccess("회원가입은 완료됐지만 자동 로그인이 실패했습니다. 직접 로그인 해주세요.");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        router.push("/dashboard"); // 원하는 경로로 이동
      }
    } catch (e: any) {
      setError(e.response?.data?.error || "오류 발생");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">회원가입</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border p-2 rounded text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            required
          />
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
          {error && <div className="text-red-600 font-semibold text-sm mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
        </form>
        <div className="mt-4 text-center">
          <a href="/login" className="text-blue-500 underline">이미 계정이 있으신가요? 로그인</a>
        </div>
      </div>
    </div>
  );
}
