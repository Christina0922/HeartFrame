'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

interface PreviewData {
  poem_text: string;
  image_url: string;
  recipient: string;
}

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    const fetchPreview = async () => {
      try {
        const response = await fetch(`/api/generate?token=${token}`);
        if (response.ok) {
          const order = await response.json();
          
          // 공유 토큰으로 접근한 경우 (결제 완료된 주문)
          const isSharedAccess = order.share_token === token && order.status === 'paid';
          setIsShared(isSharedAccess);
          
          // 미리보기 상태이거나 공유 링크인 경우
          if ((order.status === 'preview' || isSharedAccess) && order.poem_text && order.image_url) {
            setData({
              poem_text: order.poem_text,
              image_url: order.image_url,
              recipient: order.recipient,
            });
          }
        }
      } catch (error) {
        // 에러 처리
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [token, router]);

  const handleComplete = () => {
    router.push(`/pricing?token=${token}`);
  };

  const handleRetry = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, retry: true }),
      });

      if (response.ok) {
        router.push(`/generate?token=${token}`);
      }
    } catch (error) {
      alert('다시 만들기 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">미리보기를 불러올 수 없습니다.</div>
      </div>
    );
  }

  // 공유 링크인 경우 전체 텍스트 노출, 아니면 30-40%만 노출
  const lines = data.poem_text.split('\n');
  const visibleLines = isShared 
    ? lines.length 
    : Math.max(1, Math.floor(lines.length * 0.35));
  const visibleText = lines.slice(0, visibleLines).join('\n');
  const hiddenText = lines.slice(visibleLines).join('\n');

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-medium text-gray-900 mb-8 text-center">
          {isShared ? 'HeartFrame' : '미리보기'}
        </h1>

        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <div className="mb-6">
            <img
              src={data.image_url}
              alt={isShared ? '완성본' : '미리보기'}
              className="w-full rounded-lg"
              style={isShared ? {} : { filter: 'blur(0.5px)' }}
            />
          </div>

          <div className="space-y-4">
            <div className="text-gray-900 whitespace-pre-line">
              {visibleText}
            </div>
            {!isShared && (
              <div className="text-gray-400 whitespace-pre-line">
                {hiddenText.split('\n').map((line, i) => (
                  <div key={i} className="opacity-30">
                    {line || '\u00A0'}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {!isShared && (
          <>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-700 text-center">
                이 액자에 담길 마지막 문장은<br />
                결제 후에만 완성됩니다.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleComplete}
                className="w-full py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                완성본 받기
              </button>
              <button
                onClick={handleRetry}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                다시 만들기 (1회 무료)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Preview() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">로딩 중...</div>}>
      <PreviewContent />
    </Suspense>
  );
}
