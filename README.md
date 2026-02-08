# HeartFrame

단건 결제형 웹 비즈니스 시스템

## 설치

```bash
npm install
```

## 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# OpenAI API Key (필수 - 이미지 생성용)
# ⚠️ 서버 전용 - 절대 NEXT_PUBLIC_ 접두사를 사용하지 마세요
OPENAI_API_KEY=sk-your-openai-api-key-here

# Stripe (결제용)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 디버그 패널 표시 (선택)
# 개발 환경에서는 기본적으로 표시됩니다
# 프로덕션에서도 표시하려면: NEXT_PUBLIC_SHOW_DEBUG=true
NEXT_PUBLIC_SHOW_DEBUG=false
```

## ⚠️ 보안 주의사항

### 환경 변수 규칙
- **서버 전용 키는 절대 `NEXT_PUBLIC_` 접두사를 사용하지 마세요**
  - `OPENAI_API_KEY` ✅ (서버 전용)
  - `NEXT_PUBLIC_OPENAI_API_KEY` ❌ (브라우저에 노출됨)
- `NEXT_PUBLIC_*`로 시작하는 변수는 브라우저 번들에 포함되어 모든 사용자에게 노출됩니다
- 비밀키, API 키, 토큰은 서버 사이드에서만 사용하세요

### 토큰/키 노출 금지
- UI에 토큰이나 API 키를 표시하지 마세요
- 콘솔 로그에 토큰이나 키를 출력하지 마세요
- 에러 메시지에 민감 정보를 포함하지 마세요
- 디버그 패널에는 requestId만 표시하고, 실제 토큰은 마스킹 처리됩니다

### API 호출 구조
- OpenAI API는 서버 사이드(`/app/api/*`)에서만 호출합니다
- 클라이언트는 내부 API(`/api/generate`)만 호출합니다
- 서버 응답에는 절대 API 키나 토큰이 포함되지 않습니다

## 실행

```bash
npm run dev
```

## 디버그 패널

### 로컬 개발 환경
- 기본적으로 디버그 패널이 표시됩니다 (localhost에서 실행 시)
- 숨기려면: `.env.local`에 `NEXT_PUBLIC_SHOW_DEBUG=false` 설정

### 프로덕션/프리뷰 환경
- 기본적으로 디버그 패널이 **표시되지 않습니다**
- 표시하려면: Vercel 환경 변수에 `NEXT_PUBLIC_SHOW_DEBUG=true` 설정

### 디버그 패널 켜는 법
1. `.env.local` 파일에 `NEXT_PUBLIC_SHOW_DEBUG=true` 추가
2. 개발 서버 재시작: `npm run dev`

## 주요 기능

- 회원가입/로그인 없이 즉시 주문 시작
- 단건 결제만 지원 (Stripe)
- 토큰 기반 접근 제어
- AI 이미지 생성 (OpenAI DALL-E 3)
- SQLite 데이터베이스

## 기술 스택

- Next.js 14 (App Router)
- Tailwind CSS
- Stripe
- OpenAI (DALL-E 3)
- SQLite (better-sqlite3)
