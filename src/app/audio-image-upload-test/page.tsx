"use client";
import React, { useState } from "react";

export default function AudioImageUploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setError("");
    setPreviewUrl("");
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!file) { setError("파일을 선택하세요"); return; }
    setLoading(true); setError("");
    try {
      const formData = new FormData(); formData.append("image", file);
      // API 서버 URL: env에 없으면 현재 origin 사용
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
      const apiEndpoint = `${baseUrl}/api/audio-image-upload`;
      console.log('Uploading to:', apiEndpoint);
      const res = await fetch(apiEndpoint, { method: 'POST', body: formData });
      console.log('API response status:', res.status, res.statusText);
      if (!res.ok) {
        const errText = await res.text();
        setDebugInfo(`Error Text:\n${errText}`);
        console.error('Upload error text:', errText);
        setError(errText || `업로드 실패: ${res.status}`);
      } else {
        const data = await res.json();
        setDebugInfo(`Success Data:\n${JSON.stringify(data, null, 2)}`);
        console.log('Upload success data:', data);
        setPreviewUrl(data.url);
      }
    } catch (e: any) {
      setError(e.message || '오류 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
      <h1 className="text-xl font-semibold mb-4 text-center w-full">이미지 업로드 테스트</h1>
      <label className="w-full max-w-sm mb-4">
        <input type="file" accept="image/*" onChange={handleChange} className="hidden" />
        <div className="w-full py-2 text-center bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg text-sm text-white">
          {file ? file.name : "파일 선택"}
        </div>
      </label>
      <button onClick={handleUpload} disabled={loading || !file} className="w-full max-w-sm py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 mb-4 text-sm">
        {loading ? '업로드 중...' : '업로드'}
      </button>
      {previewUrl && (
        <img src={previewUrl} alt="uploaded" className="w-full max-w-sm rounded-md mt-4 shadow-lg" />
      )}
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {debugInfo && (
        <pre className="mt-4 p-2 bg-gray-900 text-xs text-green-200 whitespace-pre-wrap max-w-sm w-full rounded">
          {debugInfo}
        </pre>
      )}
    </div>
  );
}
