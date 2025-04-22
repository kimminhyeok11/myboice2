"use client";
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export default function RecordPage() {
  const { data: session } = useSession();
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    setMessage("");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunks.current = [];
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/webm" });
      setAudioUrl(URL.createObjectURL(blob));
    };
    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const sendAudio = async () => {
    if (!audioUrl) return;
    setSending(true);
    setMessage("");
    const blob = await fetch(audioUrl).then(r => r.blob());
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");
    try {
      const res = await axios.post("/api/messages/send", formData);
      setMessage(res.data.message || "메시지 전송 성공!");
      setAudioUrl(null);
    } catch (e: any) {
      setMessage(e.response?.data?.error || "오류 발생");
    }
    setSending(false);
  };

  if (!session?.user) {
    return <div className="p-8">로그인이 필요합니다.</div>;
  }

  return (
    <>
      <button
        onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign("/")}
        className="text-blue-600 hover:underline mt-6 ml-6"
      >
        ← 뒤로가기
      </button>
      <div className="flex flex-col items-center justify-center min-h-screen">

      <h1 className="text-2xl font-bold mb-6">음성 메시지 녹음 및 전송</h1>
      <div className="flex flex-col items-center gap-4">
        {!recording && (
          <button onClick={startRecording} className="bg-blue-500 text-white px-6 py-2 rounded">
            녹음 시작
          </button>
        )}
        {recording && (
          <button onClick={stopRecording} className="bg-red-500 text-white px-6 py-2 rounded">
            녹음 중지
          </button>
        )}
        {audioUrl && (
          <>
            <audio controls src={audioUrl} className="mb-2" />
            <button onClick={sendAudio} disabled={sending} className="bg-green-500 text-white px-6 py-2 rounded">
              {sending ? "전송 중..." : "메시지 보내기 (랜덤 회원에게)"}
            </button>
          </>
        )}
        {message && <div className="mt-4 text-blue-700">{message}</div>}
      </div>
    </div>
    </>
  );
}
