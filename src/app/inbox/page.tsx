"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import TypewriterText from "./TypewriterText";

interface VoiceMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
  };
  audioUrl?: string;
  text?: string;
  replyTo?: string;
  createdAt: string;
  status?: string;
}
// sender._id는 항상 ObjectId, sender.name은 화면 출력용만 사용

// 답장 버튼 컴포넌트
function ReplyButton({ msg, onReplied }: { msg: VoiceMessage, onReplied: () => void }) {
  const [show, setShow] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [micDenied, setMicDenied] = useState(false);
  const [text, setText] = useState("");

  // 음성 녹음 시작
  const startRecording = async () => {
    setError("");
    setMicDenied(false);
    setAudioChunks([]);
    setAudioUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new window.MediaRecorder(stream);
      setMediaRecorder(mr);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioChunks(chunks);
        setAudioUrl(URL.createObjectURL(blob));
      };
      mr.start();
      setRecording(true);
    } catch (err: any) {
      setMicDenied(true);
      setError("마이크를 사용할 수 없습니다. 텍스트 답장만 가능합니다.");
    }
  };

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  // 음성 답장 전송
  const sendAudioReply = async () => {
    if (!audioChunks.length) return setError("녹음된 음성이 없습니다.");
    setSending(true);
    setError("");
    try {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob);
      formData.append('receiver', msg.sender._id);
      formData.append('replyTo', msg._id);
      await axios.post('/api/messages/send', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShow(false);
      setAudioChunks([]);
      setAudioUrl(null);
      onReplied();
    } catch (e: any) {
      setError(e.response?.data?.error || "전송 실패");
    } finally {
      setSending(false);
    }
  };

  // 텍스트 답장 전송 (fallback)
  const sendTextReply = async () => {
    if (!text.trim()) return setError("메시지를 입력하세요.");
    if (text.length > 100) return setError("100자 이내로 입력하세요.");
    setSending(true);
    setError("");
    try {
      await axios.post("/api/messages/send-text", {
        text,
        receiver: msg.sender._id,
        replyTo: msg._id,
      });
      setText("");
      setShow(false);
      onReplied();
    } catch (e: any) {
      setError(e.response?.data?.error || "전송 실패");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        onClick={e => { e.stopPropagation(); setShow(v => !v); if (!show) startRecording(); }}
        disabled={sending}
      >
        답장
      </button>
      {show && (
        <div className="absolute z-10 top-full left-0 mt-2 bg-white border rounded p-2 shadow w-72 flex flex-col gap-2">
          {!micDenied ? (
            <>
              <div className="flex flex-col gap-2">
                {!recording && !audioUrl && (
                  <button className="px-2 py-1 text-xs bg-green-500 text-white rounded" onClick={startRecording} disabled={recording || sending}>
                    녹음 시작
                  </button>
                )}
                {recording && (
                  <button className="px-2 py-1 text-xs bg-yellow-500 text-white rounded" onClick={stopRecording} disabled={sending}>
                    녹음 중지
                  </button>
                )}
                {audioUrl && (
                  <>
                    <audio controls src={audioUrl} className="w-full" />
                    <button className="px-2 py-1 text-xs bg-blue-500 text-white rounded" onClick={sendAudioReply} disabled={sending}>
                      전송
                    </button>
                  </>
                )}
                <button className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded" onClick={() => { setShow(false); setAudioUrl(null); setRecording(false); setAudioChunks([]); }} disabled={sending}>
                  취소
                </button>
              </div>
            </>
          ) : (
            <>
              <textarea
                className="w-full p-1 border rounded text-sm"
                maxLength={100}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="마이크를 사용할 수 없습니다. 텍스트 답장 (최대 100자)"
                rows={2}
                disabled={sending}
              />
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={sendTextReply}
                  disabled={sending}
                >
                  전송
                </button>
                <button
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  onClick={() => { setShow(false); setText(""); }}
                  disabled={sending}
                >
                  취소
                </button>
              </div>
            </>
          )}
          {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
        </div>
      )}
    </div>
  );
}


export default function InboxPage() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  interface User {
    id?: string;
    _id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }

const { data: session, status } = useSession();
const user = session?.user as User;
// id 또는 _id를 사용할 수 있도록 보장
const userId = user?.id ?? user?._id;
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // 내 차단 목록 불러오기
  useEffect(() => {
    if (!userId) return;
    axios.get('/api/user/me').then(res => {
      setBlockedUsers(res.data.blockedUsers || []);
    });
  }, [userId]);

  const fetchMessages = () => {
    setLoading(true);
    setError("");
    axios
      .get("/api/messages/inbox")
      .then((res) => {
        setMessages(res.data.messages || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "메시지 불러오기 실패");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchMessages();
    }
  }, [status]);

  if (status === "loading") return <div className="p-8">로딩 중...</div>;
  if (status === "unauthenticated") return <div className="p-8">로그인이 필요합니다.</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">받은 메시지함</h1>
        <button onClick={fetchMessages} className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">새로고침</button>
      </div>
      {loading && <div>불러오는 중...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && messages.length === 0 && <div>받은 메시지가 없습니다.</div>}
      <ul className="space-y-6">
        {[...messages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((msg) => (
          <li key={msg._id} className={`border rounded p-4 flex flex-col gap-2 ${msg.status === 'unread' ? 'bg-yellow-50' : 'bg-white'}`}
            onClick={async () => {
              if (msg.status === 'unread') {
                await axios.post('/api/messages/read', { id: msg._id });
                fetchMessages();
              }
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">보낸 사람: {msg.sender.name}</span>
              <span className={`text-xs ml-2 font-semibold ${msg.status === 'unread' ? 'text-yellow-600' : 'text-green-600'}`}>{msg.status === 'unread' ? '읽지 않음' : '읽음'}</span>
            </div>
            {msg.audioUrl ? (
              <audio controls src={msg.audioUrl} />
            ) : msg.text ? (
              <div className="text-base bg-green-700/70 text-white rounded p-2 whitespace-pre-line">
                {msg.text ?? ""}
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-gray-400">{hydrated ? new Date(msg.createdAt).toLocaleString() : ''}</span>
              <div className="flex gap-2">
                <ReplyButton msg={msg} onReplied={fetchMessages} />
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    await axios.delete(`/api/messages/delete`, { params: { id: msg._id } });
                    fetchMessages();
                  }}
                  className="px-2 py-1 text-xs bg-red-100 text-white rounded hover:bg-red-200"
                >
                  삭제
                </button>
                {/* 신고/차단 버튼: 내 메시지가 아니면 노출 */}
                {msg.sender._id !== (userId) && (
                  <>
                    <button
                      className="ml-2 px-2 py-1 text-xs bg-yellow-200 text-yellow-800 rounded hover:bg-yellow-300"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const reason = prompt('신고 사유를 입력해 주세요. (예: 욕설, 스팸 등)');
                        if (!reason) return;
                        try {
                          await axios.post('/api/report', { messageId: msg._id, reason });
                          alert('신고가 접수되었습니다. 감사합니다.');
                        } catch (err: any) {
                          alert(err.response?.data?.error || '신고 처리 중 오류가 발생했습니다.');
                        }
                      }}
                    >신고</button>
                    <button
                      className="ml-2 px-2 py-1 text-xs bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!window.confirm('이 사용자를 차단하면 앞으로 메시지를 받지 않습니다. 정말 차단할까요?')) return;
                        try {
                          await axios.post('/api/block', { userIdToBlock: msg.sender._id });
                          setBlockedUsers(b => [...b, msg.sender._id]);
                          alert('해당 사용자를 차단했습니다.');
                        } catch (err: any) {
                          alert(err.response?.data?.error || '차단 처리 중 오류가 발생했습니다.');
                        }
                      }}
                    >차단</button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
