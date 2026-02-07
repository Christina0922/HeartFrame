'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [message, setMessage] = useState('시와 이미지를 생성하고 있습니다...');

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    // Labor Illusion: 10-15초 지연
    const messages = [
      '시와 이미지를 생성하고 있습니다...',
      '메시지를 분석하고 있습니다...',
      '시를 작성하고 있습니다...',
      '이미지를 생성하고 있습니다...',
      '마무리 중입니다...',
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setMessage(messages[messageIndex]);
    }, 2500);

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/generate?token=${token}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'preview') {
            clearInterval(messageInterval);
            router.push(`/preview?token=${token}`);
          }
        }
      } catch (error) {
        // 재시도
      }
    };

    // 10-15초 후 상태 확인 시작
    const statusCheckDelay = 10000 + Math.random() * 5000;
    const statusInterval = setInterval(checkStatus, 2000);

    setTimeout(() => {
      checkStatus();
    }, statusCheckDelay);

    return () => {
      clearInterval(messageInterval);
      clearInterval(statusInterval);
    };
  }, [token, router]);

  // 뒤로 가기 차단
  useEffect(() => {
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export default function Generate() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">로딩 중...</div>}>
      <GenerateContent />
    </Suspense>
  );
}

