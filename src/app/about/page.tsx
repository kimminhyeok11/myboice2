export default function AboutPage() {
  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">서비스 소개</h1>
      <p className="mb-6 text-lg">
        이 서비스는 <b>음성 메시지</b>를 녹음하여 다른 사용자에게 익명으로 보내고, 받은 메시지를 확인할 수 있는 실험적 플랫폼입니다.<br /><br />
        <span className="font-semibold">메세지를 보내보세요. 누군가 응답할겁니다.</span>
      </p>
      <div className="mb-6 p-4 bg-black rounded border border-gray-700 text-gray-200">
        <b>MVP 모델</b>임을 참고해 주세요.<br />
        현재 최소 기능만 제공되고 있으며, 여러분의 피드백을 바탕으로 개선될 예정입니다.
      </div>
      <h2 className="text-xl font-semibold mb-2">피드백을 남겨주세요!</h2>
      <p className="mb-4">서비스 이용 후 느낀 점, 불편사항, 개선 아이디어 등을 아래 이메일로 보내주시면 적극 반영하겠습니다.</p>
      <div className="p-3 bg-gray-100 rounded text-gray-700 select-all">
        📧 <b>피드백 이메일:</b> <a href="mailto:salad20c@gmail.com" className="underline text-blue-600">salad20c@gmail.com</a>
      </div>
    </div>
  );
}
