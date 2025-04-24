"use client";
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

function TextFallbackForm({ setMessage, sending }: { setMessage: (msg: string) => void, sending: boolean }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const handleSend = async () => {
    if (!text.trim()) return setError("메시지를 입력하세요.");
    if (text.length > 100) return setError("100자 이내로 입력하세요.");
    setError("");
    try {
      const res = await axios.post("/api/messages/send-text", { text });
      setMessage(res.data.message || "메시지 전송 성공!");
      setText("");
    } catch (e: any) {
      setMessage(e.response?.data?.error || "오류 발생");
    }
  };
  return (
    <div className="flex flex-col items-center gap-2 bg-black p-6 rounded-lg shadow-lg w-full max-w-md">
      <textarea
        className="w-full p-2 rounded bg-black text-white border border-gray-700 focus:outline-none focus:border-red-500 resize-none"
        rows={3}
        maxLength={100}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="텍스트 메시지 입력 (최대 100자)"
        disabled={sending}
      />
      <button
        className="bg-red-500 text-white px-6 py-2 rounded w-full font-bold hover:bg-red-600 disabled:opacity-60"
        onClick={handleSend}
        disabled={sending}
      >
        텍스트 메시지 전송
      </button>
      {error && <div className="text-red-400 mt-1">{error}</div>}
    </div>
  );
}

export default function RecordPage() {
  const { data: session } = useSession();
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [publicAudioUrl, setPublicAudioUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    setMessage("");
    try {
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
    } catch (err: any) {
      if (err?.name === "NotFoundError") {
        setMessage("마이크 장치를 찾을 수 없습니다. 마이크 연결 및 권한을 확인해 주세요.");
      } else if (err?.name === "NotAllowedError") {
        setMessage("마이크 사용 권한이 거부되었습니다. 브라우저의 마이크 권한을 허용해 주세요.");
      } else {
        setMessage("녹음 시작 중 오류가 발생했습니다: " + (err?.message || String(err)));
      }
    }
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
      setPublicAudioUrl(res.data.audioUrl || null);
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
    <div className="flex flex-col items-center justify-center h-screen overflow-hidden p-2">
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
        {(message.includes('마이크 장치를 찾을 수 없습니다') || message.includes('마이크 사용 권한이 거부되었습니다')) && (
          <TextFallbackForm setMessage={setMessage} sending={sending} />
        )}
        {message && <div className="mt-4 text-red-400">{message}</div>}
      </div>
    </div>
  );
}
