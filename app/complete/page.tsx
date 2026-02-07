'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

interface CompleteData {
  poem_text: string;
  image_url: string;
  download_url: string;
  share_token: string;
}

function CompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [data, setData] = useState<CompleteData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }

    const fetchComplete = async () => {
      try {
        const response = await fetch(`/api/file?token=${token}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        // 에러 처리
      } finally {
        setLoading(false);
      }
    };

    fetchComplete();
  }, [token, router]);

  const handleShare = () => {
    if (!data) return;
    
    const shareUrl = `${window.location.origin}/preview?token=${data.share_token}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'HeartFrame',
        text: '마음액자를 확인해보세요',
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('링크가 복사되었습니다.');
    }
  };

  const handleDownload = () => {
    if (data?.download_url) {
      window.location.href = data.download_url;
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
        <div className="text-gray-600">결제 완료 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-medium text-gray-900 mb-8 text-center">
          결제 완료
        </h1>

        <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
          <div className="mb-6">
            <img
              src={data.image_url}
              alt="완성본"
              className="w-full rounded-lg"
            />
          </div>

          <div className="text-gray-900 whitespace-pre-line mb-6">
            {data.poem_text}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDownload}
            className="w-full py-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            파일 다운로드
          </button>
          <button
            onClick={handleShare}
            className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            공유하기
          </button>
        </div>

        {data.share_token && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-600 mb-2">공유 링크</div>
            <div className="text-sm text-gray-900 break-all">
              {`${window.location.origin}/preview?token=${data.share_token}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Complete() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">로딩 중...</div>}>
      <CompleteContent />
    </Suspense>
  );
}
