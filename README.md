<div align="center">

![NexusFlow Banner](https://picsum.photos/id/1015/1280/480)

# NexusFlow

**인류의 집단 지능을 가속하는 오픈소스 생산성 플랫폼**

복잡한 세상에서 **진짜 중요한 일**에만 집중할 수 있게 합니다.  
Linear의 속도 + Notion의 유연함 + Grok의 지능을 하나로.

우리는 단순한 TODO 앱을 만드는 게 아닙니다.  
**미래의 작업 방식을 재정의**하고 있습니다.

![Stars](https://img.shields.io/github/stars/taeyang-dev/nexusflow?style=for-the-badge&color=0ea5e9)
![Forks](https://img.shields.io/github/forks/taeyang-dev/nexusflow?style=for-the-badge)
![License](https://img.shields.io/github/license/taeyang-dev/nexusflow?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![AI](https://img.shields.io/badge/AI-Powered-10b981?style=for-the-badge)

</div>

<br>

## 🚀 왜 NexusFlow인가?

- **첫 번째 원리(First Principles)**로 설계된 UI/UX — 불필요한 모든 것을 제거
- **실시간 멀티플레이어 협업** — 수십 명이 동시에 작업해도 Lightning 속도
- **진짜 똑똑한 AI** — 단순 자동완성이 아닌, 전략적 제안과 통찰 제공 (Grok-inspired reasoning)
- **완전한 데이터 소유권** — 클라우드든 자체 호스팅이든 당신의 데이터는 당신 것
- **미래 지향적 확장성** — Plugin 생태계 + Open Protocol로 누구나 확장 가능

우리는 생산성을 “관리”하는 것이 아니라, **인간의 잠재력을 증폭**시키는 도구를 만듭니다.

## 📸 실제 경험

<div align="center">
  <img src="https://picsum.photos/id/1015/850/480" width="49%" alt="Command Center" />
  <img src="https://picsum.photos/id/106/850/480" width="49%" alt="Multiplayer Canvas" />
  <img src="https://picsum.photos/id/201/850/480" width="49%" alt="AI Reasoning" />
  <img src="https://picsum.photos/id/237/850/480" width="49%" alt="Timeline Intelligence" />
</div>

## 🛠 기술 스택 (최신 & 최고만)

- **Frontend** — Next.js 15 App Router + React 19 + TypeScript + Tailwind + shadcn/ui + Framer Motion
- **Intelligence Layer** — Grok / OpenAI / Claude (모델 agnostic) + LangGraph
- **Real-time** — Liveblocks + WebSocket + CRDT
- **Backend** — tRPC + Prisma + PostgreSQL
- **Infra** — Docker + Turborepo + GitHub Actions + Vercel / Fly.io / Self-host
- **Auth** — Passkeys + OAuth (완전 passwordless)

## 🚀 30초 만에 시작하기

```bash
# Docker 한 줄 설치 (추천)
docker run -d -p 3000:3000 \
  -e DATABASE_URL=your_db_url \
  ghcr.io/taeyang-dev/nexusflow:latest

# 또는 직접 빌드
git clone https://github.com/taeyang-dev/nexusflow.git && cd nexusflow
pnpm install && pnpm dev
