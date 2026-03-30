<div align="center">

![Helix Banner](https://picsum.photos/id/1015/1280/480)

# Helix

**오픈소스 멀티에이전트 AI 협력 인프라**

단일 LLM의 한계를 넘어, **여러 전문 에이전트가 실시간으로 협력**하여 복잡한 과제를 해결하는 차세대 AI 플랫폼.

**OpenAI · Anthropic · xAI · Google DeepMind** 등 모든 AI 조직이 공통으로 사용할 수 있는 중립적 오픈 인프라를 목표로 합니다.

![GitHub Stars](https://img.shields.io/github/stars/taeyang-dev/helix?style=for-the-badge&color=0ea5e9)
![License](https://img.shields.io/github/license/taeyang-dev/helix?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)

</div>

<br>

## ✨ Helix의 핵심 가치

- **Universal Agent Protocol** — 어떤 LLM, 어떤 프레임워크든 자유롭게 연결
- **Graph-based Multi-Agent Orchestration** — LangGraph + CRDT 실시간 협업
- **Production-grade Evaluation & Benchmarking** — GAIA, AgentBench, WebArena 통합
- **Built-in Safety & Alignment** — Constitutional AI, Guardrails, Red-teaming
- **Observability & Debugging** — LangSmith급 Tracing (완전 오픈소스)
- **Self-host + Enterprise Ready** — Air-gapped 환경 완벽 지원

Helix는 **AI 에이전트 생태계의 Linux**가 되는 것을 목표로 합니다.

## 📸 Helix Interface

<div align="center">
  <img src="https://picsum.photos/id/1015/850/480" width="49%" alt="Multi-Agent Dashboard" />
  <img src="https://picsum.photos/id/106/850/480" width="49%" alt="Agent Collaboration Graph" />
  <img src="https://picsum.photos/id/201/850/480" width="49%" alt="Evaluation Suite" />
  <img src="https://picsum.photos/id/237/850/480" width="49%" alt="Safety & Guardrails" />
</div>

<br>

## 🛠 기술 스택

| 영역                | 기술 스택                                      |
|---------------------|-----------------------------------------------|
| **Frontend**        | Next.js 15 App Router, TypeScript, Tailwind, shadcn/ui, React Flow |
| **Core Engine**     | Python + TypeScript Monorepo, LangGraph-inspired Graph Engine |
| **Multi-Agent**     | Custom Orchestrator + Liveblocks (Real-time)   |
| **Models**          | OpenAI, Anthropic, Grok, Llama 3, Mistral, Gemini (Agnostic) |
| **Vector DB**       | PgVector, Qdrant, Chroma                      |
| **Evaluation**      | Custom Benchmark Suite + Hugging Face         |
| **Infra**           | Docker, Kubernetes, Turborepo, GitHub Actions |

## 🚀 빠른 시작

```bash
# Docker Compose (가장 추천)
git clone https://github.com/taeyang-dev/helix.git
cd helix
docker compose up -d

# 또는 로컬 개발
pnpm install
pnpm dev
