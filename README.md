# Priority Guard

> 갑작스러운 업무 요청에 흔들리지 않는 직장인의 AI 우선순위 파트너

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green.svg)](https://fastapi.tiangolo.com/)
[![Claude API](https://img.shields.io/badge/Claude-Haiku-8A2BE2.svg)](https://www.anthropic.com/)

---

## 왜 만들었나

아침에 오늘 할일을 정성껏 정리해도, 슬랙·이메일로 새 요청이 쏟아지면 계획이 무너집니다.
기존 Todo 앱은 목록만 관리할 뿐, **"이 요청을 지금 해야 하나?"** 는 매번 본인이 판단해야 합니다.

**Priority Guard** 는 새 요청이 들어올 때 기존 할일 목록과 비교해 AI가 대신 판단해줍니다.

---

## 기능

| 기능 | 설명 |
|---|---|
| 할일 관리 | 우선순위와 함께 오늘 할일 등록 / 완료 / 삭제 |
| 새 요청 판단 | 갑자기 들어온 요청을 AI가 🔴끼워넣기 / 🔵나중에 / ⚪오늘 안 해도 됨 으로 판단 |
| 하루 요약 | 완료·미완료 기반으로 오늘 하루 평가 + 내일을 위한 조언 |

---

## 스크린샷

```
┌─────────────────────────────────────┐
│  Priority Guard        2026년 4월 3일│
├─────────────────────────────────────┤
│  오늘 할일 (2/4 완료)                │
│  ✅ 1. 기획서 초안 작성              │
│  ✅ 2. 팀장 보고                     │
│  ⏳ 3. API 코드 리뷰                 │
│  ⏳ 4. 테스트 케이스 작성            │
├─────────────────────────────────────┤
│  새 요청 판단  [AI]                  │
│  "디자인팀 미팅 준비해줄 수 있어요?" │
│  → 🔵 나중에 처리                    │
│    현재 진행 중인 코드리뷰보다       │
│    긴급도가 낮습니다.                │
└─────────────────────────────────────┘
```

---

## 시작하기

### 요구사항

- Python 3.10+
- [Anthropic API Key](https://console.anthropic.com/)

### 설치 및 실행

```bash
# 1. 의존성 설치
pip install -r requirements.txt

# 2. 환경변수 설정
cp .env.example .env
# .env 파일에 ANTHROPIC_API_KEY=your_key 입력

# 3. 서버 실행
python run.py
```

브라우저에서 **http://localhost:8000** 접속

---

## 프로젝트 구조

```
OmniFlow/
├── app/
│   ├── main.py          # FastAPI 앱 진입점
│   ├── database.py      # SQLite 설정
│   ├── models.py        # Task 모델
│   └── routers/
│       ├── tasks.py     # 할일 CRUD API
│       └── ai.py        # AI 판단 / 요약 API
├── static/
│   ├── index.html       # 메인 UI
│   ├── style.css
│   └── app.js
├── run.py               # 서버 실행 진입점
├── requirements.txt
└── .env.example
```

---

## API

| Method | Endpoint | 설명 |
|---|---|---|
| GET | `/tasks/` | 오늘 할일 목록 조회 |
| POST | `/tasks/` | 할일 추가 |
| PATCH | `/tasks/{id}` | 할일 수정 (완료, 순위 변경 등) |
| DELETE | `/tasks/{id}` | 할일 삭제 |
| POST | `/ai/evaluate` | 새 요청 AI 판단 |
| GET | `/ai/summary` | 하루 요약 생성 |

API 문서: http://localhost:8000/docs

---

## 기술 스택

- **Backend:** FastAPI, SQLAlchemy, SQLite
- **AI:** Claude API (claude-haiku-4-5)
- **Frontend:** Vanilla JS (프레임워크 없음)

---

## License

MIT
