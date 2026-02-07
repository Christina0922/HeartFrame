import { NextRequest, NextResponse } from 'next/server';
import { getOrderByToken, updateOrder } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const order = getOrderByToken(token);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  if (order.status !== 'paid') {
    return NextResponse.json({ error: 'Payment required' }, { status: 403 });
  }

  if (!order.poem_text || !order.image_url) {
    return NextResponse.json({ error: 'Content not ready' }, { status: 404 });
  }

  // 공유용 토큰 생성 (없는 경우에만)
  let shareToken = order.share_token;
  if (!shareToken) {
    shareToken = nanoid(32);
    updateOrder(token, { share_token: shareToken });
  }

  // 실제 파일 다운로드 URL 생성 (S3/R2 등)
  // 여기서는 임시로 이미지 URL 반환
  const downloadUrl = order.image_url;

  return NextResponse.json({
    poem_text: order.poem_text,
    image_url: order.image_url,
    download_url: downloadUrl,
    share_token: shareToken,
  });
}

