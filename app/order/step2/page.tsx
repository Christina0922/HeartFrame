'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function OrderStep2() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [coreSentence, setCoreSentence] = useState('');
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');

  const handleSubmit = async () => {
    if (!coreSentence.trim()) {
      alert('핵심 문장을 입력해주세요.');
      return;
    }

    const orderData = {
      recipient: searchParams.get('recipient') || '',
      date: searchParams.get('date') || '',
      mood: searchParams.get('mood') || '',
      core_sentence: coreSentence.trim(),
      name: name.trim() || undefined,
      keywords: keywords.trim() || undefined,
    };

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('주문 생성 실패');
      }

      const { token } = await response.json();
      router.push(`/generate?token=${token}`);
    } catch (error) {
      alert('주문 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-medium text-gray-900 mb-8">메시지 입력</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              핵심 문장 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={coreSentence}
              onChange={(e) => setCoreSentence(e.target.value)}
              placeholder="전하고 싶은 핵심 메시지를 한 문장으로 입력하세요"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름 (선택)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="받는 분의 이름"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              키워드 (선택)
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="예: 감사, 사랑, 축하"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-12">
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            생성하기
          </button>
        </div>
      </div>
    </div>
  );
}

