'use client';

import { useRouter } from 'next/navigation';
import { Recipient } from '@/lib/types';

const SITUATIONS: { label: string; recipient: Recipient; example: string }[] = [
  {
    label: '부모님께',
    recipient: '부모님',
    example: '그동안 고마웠습니다.\n앞으로도 건강하세요.\n사랑합니다.',
  },
  {
    label: '배우자에게',
    recipient: '배우자',
    example: '함께한 시간이\n가장 소중했습니다.\n고마워요.',
  },
  {
    label: '친구에게',
    recipient: '친구',
    example: '우정이\n이렇게 깊을 줄 몰랐어요.\n고마워.',
  },
  {
    label: '연인에게',
    recipient: '연인',
    example: '당신과 함께한\n모든 순간이\n행복이었습니다.',
  },
  {
    label: '선생님께',
    recipient: '선생님',
    example: '가르침에 감사드립니다.\n앞으로도\n잘 지내시길 바랍니다.',
  },
  {
    label: '기타',
    recipient: '기타',
    example: '소중한 마음을\n전하고 싶습니다.\n감사합니다.',
  },
];

export default function Home() {
  const router = useRouter();

  const handleStart = (recipient: Recipient) => {
    router.push(`/order/step1?recipient=${encodeURIComponent(recipient)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-gray-900 mb-4">
            HeartFrame
          </h1>
          <p className="text-gray-600">
            마음을 담은 액자를 만들어드립니다
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {SITUATIONS.map((situation) => (
            <button
              key={situation.recipient}
              onClick={() => handleStart(situation.recipient)}
              className="p-6 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="font-medium text-gray-900 mb-3">
                {situation.label}
              </div>
              <div className="text-sm text-gray-500 whitespace-pre-line">
                {situation.example}
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            상황을 선택하시면 주문을 시작할 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}

