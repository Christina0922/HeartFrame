'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Recipient, Mood } from '@/lib/types';

const DATE_PRESETS = [
  { label: '오늘', value: 'today' },
  { label: '내일', value: 'tomorrow' },
  { label: '다음 주', value: 'next_week' },
  { label: '직접 입력', value: 'custom' },
];

const MOODS: { value: Mood; label: string }[] = [
  { value: '따뜻한', label: '따뜻한' },
  { value: '진지한', label: '진지한' },
  { value: '밝은', label: '밝은' },
];

export default function OrderStep1() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRecipient = (searchParams.get('recipient') as Recipient) || '기타';

  const [recipient, setRecipient] = useState<Recipient>(initialRecipient);
  const [dateType, setDateType] = useState<string>('today');
  const [customDate, setCustomDate] = useState('');
  const [mood, setMood] = useState<Mood>('따뜻한');

  const handleNext = () => {
    let date = '';
    if (dateType === 'today') {
      date = new Date().toISOString().split('T')[0];
    } else if (dateType === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
    } else if (dateType === 'next_week') {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      date = nextWeek.toISOString().split('T')[0];
    } else {
      date = customDate;
    }

    if (!date) {
      alert('날짜를 선택해주세요.');
      return;
    }

    const params = new URLSearchParams({
      recipient,
      date,
      mood,
    });

    router.push(`/order/step2?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-medium text-gray-900 mb-8">주문 정보</h1>

        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              받는 대상
            </label>
            <select
              value={recipient}
              onChange={(e) => setRecipient(e.target.value as Recipient)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            >
              <option value="부모님">부모님</option>
              <option value="배우자">배우자</option>
              <option value="친구">친구</option>
              <option value="연인">연인</option>
              <option value="선생님">선생님</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setDateType(preset.value)}
                  className={`px-4 py-2 border rounded-lg text-sm ${
                    dateType === preset.value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {dateType === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              분위기
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`px-4 py-2 border rounded-lg text-sm ${
                    mood === m.value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <button
            onClick={handleNext}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}

