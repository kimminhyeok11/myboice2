"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

interface VoiceMessage {
  _id: string;
  sender: string;
  audioUrl: string;
  createdAt: string;
  status?: string;
}

export default function InboxPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        {messages.map((msg) => (
          <li key={msg._id} className={`border rounded p-4 flex flex-col gap-2 ${msg.status === 'unread' ? 'bg-yellow-50' : 'bg-white'}`}
            onClick={async () => {
              if (msg.status === 'unread') {
                await axios.post('/api/messages/read', { id: msg._id });
                fetchMessages();
              }
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">보낸 사람: {msg.sender}</span>
              <span className={`text-xs ml-2 font-semibold ${msg.status === 'unread' ? 'text-yellow-600' : 'text-green-600'}`}>{msg.status === 'unread' ? '읽지 않음' : '읽음'}</span>
            </div>
            <audio controls src={msg.audioUrl} />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  await axios.delete(`/api/messages/delete`, { params: { id: msg._id } });
                  fetchMessages();
                }}
                className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
