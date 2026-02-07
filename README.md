# HeartFrame

단건 결제형 웹 비즈니스 시스템

## 설치

```bash
npm install
```

## 환경 변수 설정

`.env.example`을 참고하여 `.env` 파일을 생성하세요.

## 실행

```bash
npm run dev
```

## 주요 기능

- 회원가입/로그인 없이 즉시 주문 시작
- 단건 결제만 지원 (Stripe)
- 토큰 기반 접근 제어
- SQLite 데이터베이스

## 기술 스택

- Next.js 14 (App Router)
- Tailwind CSS
- Stripe
- SQLite (better-sqlite3)

