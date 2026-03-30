<div align="center">

![TaskFlow Banner](https://via.placeholder.com/1280x420/111827/60A5FA?text=TASKFLOW%20-%20Modern%20Productivity%20Platform)

# TaskFlow

**실시간 협업이 가능한 차세대 업무·태스크 관리 플랫폼**

개발자, 디자이너, PM이 함께 쓰는 직관적이고 강력한 생산성 도구.  
Linear + Notion + ClickUp의 장점만 모았습니다.

![Stars](https://img.shields.io/github/stars/taeyang-dev/taskflow?style=for-the-badge&color=0ea5e9)
![Forks](https://img.shields.io/github/forks/taeyang-dev/taskflow?style=for-the-badge)
![License](https://img.shields.io/github/license/taeyang-dev/taskflow?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

<br>

## ✨ 주요 특징

- ⚡ **실시간 협업** — 여러 사람이 동시에 작업 가능 (Pusher 기반)
- 🤖 **AI 어시스턴트** — 작업 자동 분류, 우선순위 제안, 요약 생성 (GPT-4o)
- 📋 **다양한 뷰** — Kanban, List, Timeline, Calendar, Table
- 🔄 **강력한 자동화** — If-Then 규칙으로 반복 업무 자동화
- 🔗 **외부 연동** — Slack, GitHub, Google Calendar, Notion
- 📱 **완벽한 반응형** — PWA 지원으로 모바일에서도 네이티브급 경험

## 📸 실제 화면

<div align="center">
  <img src="https://picsum.photos/id/1015/800/450" width="49%" alt="Dashboard" />
  <img src="https://picsum.photos/id/106/800/450" width="49%" alt="Kanban Board" />
  <img src="https://picsum.photos/id/201/800/450" width="49%" alt="AI Assistant" />
  <img src="https://picsum.photos/id/237/800/450" width="49%" alt="Timeline View" />
</div>

<br>

## 🛠 기술 스택

**Frontend**: Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · TanStack Query · Zustand  
**Backend**: tRPC · Next.js API Routes  
**Database**: PostgreSQL · Prisma ORM  
**AI**: OpenAI GPT-4o + LangChain  
**Real-time**: Pusher  
**배포**: Vercel + Neon Serverless Postgres

## 🚀 빠른 시작

```bash
git clone https://github.com/taeyang-dev/taskflow.git
cd taskflow

pnpm install

# 환경변수 복사
cp .env.example .env.local

# DB 마이그레이션
pnpm prisma migrate dev

# 개발 서버 실행
pnpm dev
