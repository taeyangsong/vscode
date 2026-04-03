# Architecture — Priority Guard

## 시스템 개요

```
Browser (Vanilla JS)
       │  HTTP/JSON
       ▼
FastAPI (Python)
  ├── /tasks/*   →  SQLite (SQLAlchemy)
  └── /ai/*      →  Anthropic Claude API
```

단일 서버, 단일 DB. 스케일 아웃보다 단순함 우선.

---

## 레이어 구조

```
┌──────────────────────────────────────┐
│  Presentation  (static/)             │
│  index.html / style.css / app.js     │
└───────────────────┬──────────────────┘
                    │ fetch() HTTP
┌───────────────────▼──────────────────┐
│  API Layer  (app/routers/)           │
│  tasks.py          ai.py             │
│  CRUD + 비즈니스    Claude API 호출    │
└──────────┬─────────────┬────────────┘
           │             │
┌──────────▼──────┐  ┌───▼────────────┐
│  Data Layer     │  │  External AI   │
│  models.py      │  │  Anthropic API │
│  database.py    │  │  (Haiku 4.5)   │
│  SQLite         │  └────────────────┘
└─────────────────┘
```

---

## 데이터 모델

### Task

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | INTEGER PK | 자동 증가 |
| title | VARCHAR(200) | 할일 내용 |
| priority | INTEGER | 순위 (1=가장 높음) |
| done | BOOLEAN | 완료 여부 |
| date | DATE | 해당 날짜 |
| created_at | DATETIME | 생성 시각 |
| note | TEXT nullable | 메모 |

**인덱스:** `id` (PK)
**조회 패턴:** 항상 `date` 로 필터링 후 `priority` 정렬

---

## 핵심 플로우

### 1. 새 요청 AI 판단

```
User 입력 new_task
    │
    ▼
POST /ai/evaluate
    │
    ├── 오늘 미완료 할일 목록 조회 (DB)
    │
    ├── Claude Haiku 호출
    │   프롬프트: 기존 목록 + 새 요청
    │   응답: { decision, insert_at, reason, suggested_reorder }
    │
    └── EvaluationResult 반환
            │
            ▼ (User가 "이 순위로 추가" 클릭)
    POST /tasks/insert
            │
            ├── 기존 priority >= insert_at 항목 +1
            └── 새 Task 생성
```

### 2. 드래그 순위 변경

```
User 드래그 완료
    │
    ▼
DOM 순서 변경 (즉시 반영)
    │
    ▼
POST /tasks/reorder  [{ id, priority }, ...]
    │
    └── 일괄 UPDATE
```

### 3. 어제 미완료 가져오기

```
POST /tasks/carry-over
    │
    ├── 어제(today-1) done=False 항목 조회
    ├── 오늘 최대 priority + 1 부터 순서대로
    └── 새 Task 생성 (원본 삭제 안 함)
```

---

## AI 프롬프트 설계

### evaluate 판단 기준

```
insert  → 긴급 + 중요, 현재 진행 중인 작업보다 우선해야 함
later   → 오늘 처리 가능하나 현재 순위보다 낮음
reject  → 오늘 안 해도 되거나 위임 가능
```

응답 형식: JSON (파싱 실패 시 500)

### summary 요약 구조

완료 목록 + 미완료 목록 → 3~4문장 평가 + 내일 조언 1가지

---

## 확장 고려사항

| 요소 | 현재 | 확장 시 |
|---|---|---|
| DB | SQLite | PostgreSQL (connection pool 추가) |
| AI 모델 | Haiku | Sonnet (복잡한 판단) |
| 인증 | 없음 | JWT 또는 세션 |
| 배포 | 로컬 | Docker + Nginx |
| 알림 | 없음 | 슬랙 웹훅 |
