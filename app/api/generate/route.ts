import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getOrderByToken, updateOrder } from '@/lib/db';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const generateSchema = z.object({
  recipient: z.string(),
  date: z.string(),
  mood: z.string(),
  core_sentence: z.string().min(1),
  name: z.string().optional(),
  keywords: z.string().optional(),
  token: z.string().optional(),
  retry: z.boolean().optional(),
});

// 시 생성 (실제로는 AI API 호출 필요)
async function generatePoem(data: {
  recipient: string;
  date: string;
  mood: string;
  core_sentence: string;
  name?: string;
  keywords?: string;
}): Promise<string> {
  // 실제 구현 시 AI API 호출
  // 여기서는 예시 텍스트 반환
  const lines = [
    `${data.core_sentence}`,
    '',
    `${data.recipient}께`,
    `${data.date}에`,
    `${data.mood} 마음으로`,
    '전하는 메시지입니다.',
  ];

  if (data.name) {
    lines.splice(2, 0, `${data.name}님께`);
  }

  return lines.join('\n');
}

// 이미지 생성 (실제로는 이미지 생성 API 호출 필요)
async function generateImage(data: {
  recipient: string;
  mood: string;
  poem_text: string;
}): Promise<string> {
  // 실제 구현 시 이미지 생성 API 호출
  // 여기서는 플레이스홀더 반환
  return `https://via.placeholder.com/800x600/ffffff/000000?text=HeartFrame`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = generateSchema.parse(body);

    // 재시도인 경우
    if (validated.retry && validated.token) {
      const token = validated.token; // 타입 가드
      const order = getOrderByToken(token);
      if (!order || order.status !== 'preview') {
        return NextResponse.json({ error: 'Invalid order' }, { status: 400 });
      }

      updateOrder(token, { status: 'generating' });

      // 백그라운드에서 재생성
      setTimeout(async () => {
        try {
          const poem_text = await generatePoem({
            recipient: order.recipient,
            date: order.date,
            mood: order.mood,
            core_sentence: order.core_sentence,
            name: order.name || undefined,
            keywords: order.keywords || undefined,
          });

          const image_url = await generateImage({
            recipient: order.recipient,
            mood: order.mood,
            poem_text,
          });

          updateOrder(token, {
            poem_text,
            image_url,
            status: 'preview',
          });
        } catch (error) {
          updateOrder(token, { status: 'failed' });
        }
      }, 100);

      return NextResponse.json({ token, status: 'generating' });
    }

    // 새 주문 생성
    const order = createOrder({
      recipient: validated.recipient,
      date: validated.date,
      mood: validated.mood,
      core_sentence: validated.core_sentence,
      name: validated.name,
      keywords: validated.keywords,
    });

    updateOrder(order.token, { status: 'generating' });

    // 백그라운드에서 생성 (실제로는 큐 시스템 사용 권장)
    setTimeout(async () => {
      try {
        const poem_text = await generatePoem({
          recipient: order.recipient,
          date: order.date,
          mood: order.mood,
          core_sentence: order.core_sentence,
          name: order.name || undefined,
          keywords: order.keywords || undefined,
        });

        const image_url = await generateImage({
          recipient: order.recipient,
          mood: order.mood,
          poem_text,
        });

        updateOrder(order.token, {
          poem_text,
          image_url,
          status: 'preview',
        });
      } catch (error) {
        // 재시도 1회
        try {
          const poem_text = await generatePoem({
            recipient: order.recipient,
            date: order.date,
            mood: order.mood,
            core_sentence: order.core_sentence,
            name: order.name || undefined,
            keywords: order.keywords || undefined,
          });

          const image_url = await generateImage({
            recipient: order.recipient,
            mood: order.mood,
            poem_text,
          });

          updateOrder(order.token, {
            poem_text,
            image_url,
            status: 'preview',
          });
        } catch (retryError) {
          updateOrder(order.token, { status: 'failed' });
        }
      }
    }, 100);

    return NextResponse.json({ token: order.token, status: 'generating' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

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

  // 공유 토큰으로 접근한 경우, 원본 토큰 정보는 제외
  const response: any = { ...order };
  if (order.share_token === token) {
    // 공유 링크 접근 시 민감한 정보 제거
    delete response.token;
    delete response.stripe_session_id;
  }

  return NextResponse.json(response);
}

