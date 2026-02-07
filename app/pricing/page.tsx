'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { PricePlan, PRICE_PLANS } from '@/lib/types';

export default function Pricing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [selectedPlan, setSelectedPlan] = useState<PricePlan>('basic');
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!token) {
      router.push('/');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, plan: selectedPlan }),
      });

      if (!response.ok) {
        throw new Error('결제 세션 생성 실패');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      alert('결제 진행 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-medium text-gray-900 mb-8 text-center">
          요금제 선택
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {(['basic', 'plus', 'premium'] as PricePlan[]).map((plan) => {
            const planData = PRICE_PLANS[plan];
            const isSelected = selectedPlan === plan;
            const isBasic = plan === 'basic';

            return (
              <button
                key={plan}
                onClick={() => setSelectedPlan(plan)}
                className={`p-6 border-2 rounded-lg text-left transition-all ${
                  isSelected
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400'
                } ${isBasic ? 'ring-2 ring-gray-900 ring-offset-2' : ''}`}
              >
                <div className="mb-2">
                  <div className="font-medium text-gray-900">{planData.name}</div>
                  {isBasic && (
                    <span className="text-xs text-gray-500 ml-2">(기본 선택)</span>
                  )}
                </div>
                <div className="text-2xl font-medium text-gray-900 mb-1">
                  {planData.price.toLocaleString()}원
                </div>
                <div className="text-sm text-gray-500">
                  {plan === 'basic' && '기본 품질'}
                  {plan === 'plus' && '고품질'}
                  {plan === 'premium' && '최고 품질'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="max-w-md mx-auto">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : '결제하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

