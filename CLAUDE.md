# CLAUDE.md — Priority Guard 개발 지침

이 파일은 Claude Code가 이 프로젝트를 효율적으로 개발하기 위한 컨텍스트와 규칙을 담습니다.

---

## 프로젝트 개요

**Priority Guard** — 직장인을 위한 AI 우선순위 관리 웹앱.
갑작스러운 업무 요청이 들어올 때 기존 할일 목록과 비교해 AI가 처리 순위를 판단해줌.

- **타겟:** 직장인 (본인 포함)
- **핵심 가치:** 계획 수립보다 계획 수호 (guard the plan)
- **MVP 철학:** 기능 최소화, 즉시 사용 가능

---

## 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| Backend | FastAPI + Uvicorn | `app/` 디렉토리 |
| ORM | SQLAlchemy 2.x (mapped_column 스타일) | |
| DB | SQLite (`priority_guard.db`) | 개발/운영 동일 |
| AI | Anthropic Claude API (claude-haiku-4-5-20251001) | 빠른 응답 우선 |
| Frontend | Vanilla JS + CSS (프레임워크 없음) | `static/` 디렉토리 |
| 환경변수 | python-dotenv (`.env`) | |

---

## 디렉토리 구조

```
OmniFlow/
├── CLAUDE.md              ← 이 파일 (AI 개발 지침)
├── CHANGELOG.md           ← 변경 이력
├── README.md              ← 사용자용 문서
├── run.py                 ← 서버 진입점 (uvicorn)
├── requirements.txt
├── .env.example
├── app/
│   ├── main.py            ← FastAPI 앱, 라우터 등록, static mount
│   ├── database.py        ← SQLite 엔진, SessionLocal, Base
│   ├── models.py          ← SQLAlchemy 모델 (Task)
│   └── routers/
│       ├── tasks.py       ← 할일 CRUD + reorder, carry-over, stats
│       └── ai.py          ← AI 판단 (evaluate) + 하루 요약 (summary)
├── static/
│   ├── index.html         ← 단일 페이지 UI
│   ├── style.css
│   └── app.js             ← 모든 프론트 로직
└── docs/
    ├── architecture.md
    ├── dev-guide.md
    └── api.md
```

---

## 코딩 컨벤션

### Backend (Python)

```python
# 모델: SQLAlchemy 2.x mapped_column 스타일 사용
class Task(Base):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)

# Pydantic: model_dump(exclude_none=True) 로 PATCH 처리
# 라우터: prefix + tags 반드시 지정
router = APIRouter(prefix="/tasks", tags=["tasks"])

# 응답 모델: 항상 response_model 명시
@router.get("/", response_model=list[TaskOut])
```

- 새 엔드포인트는 기존 라우터 파일에 추가 (새 파일 X, 기능이 완전히 다를 때만 신규)
- DB 세션: `Depends(get_db)` 패턴 유지
- AI 호출: `app/routers/ai.py` 에 집중, 모델은 `claude-haiku-4-5-20251001` 고정

### Frontend (Vanilla JS)

```js
// API 호출은 항상 async/await
// 에러는 toast() 로 표시
// DOM 조작: innerHTML 사용 시 escHtml() 필수
// 상태: 서버 응답 기준으로 항상 loadTasks() 재호출
```

- 새 기능은 `app.js` 맨 아래 섹션에 추가 (`// ── 섹션명 ──` 구분자 사용)
- CSS 클래스명: kebab-case, 컴포넌트 단위로 묶어서 작성

---

## 새 기능 추가 패턴

### 1. 백엔드 엔드포인트 추가

```python
# app/routers/tasks.py 또는 ai.py 에 추가
class NewFeatureBody(BaseModel):
    field: str

@router.post("/new-endpoint", response_model=SomeOut)
def new_feature(body: NewFeatureBody, db: Session = Depends(get_db)):
    ...
```

### 2. 프론트 함수 추가

```js
// static/app.js 맨 아래에 섹션 추가
// ── New Feature ──────────────────────────────────────
async function newFeature() {
  const res = await fetch("/tasks/new-endpoint", { method: "POST", ... });
  ...
  loadTasks();  // 상태 동기화는 항상 loadTasks() 호출로
}
```

### 3. HTML 버튼/입력 추가

```html
<!-- static/index.html 의 적절한 .card 섹션에 추가 -->
<button onclick="newFeature()">새 기능</button>
```

---

## AI 프롬프트 규칙 (ai.py)

- 모델: `claude-haiku-4-5-20251001` (빠름, 저렴)
- 복잡한 분석이 필요하면: `claude-sonnet-4-6` 사용
- 응답 형식: JSON 응답이 필요할 땐 프롬프트에 "다른 텍스트 없이 JSON만" 명시
- 한국어 프롬프트, 한국어 응답 유지
- max_tokens: 판단용 512, 요약용 400 이하

---

## 작업 원칙

1. **읽고 수정**: 기존 파일을 먼저 읽고 패턴에 맞게 수정. 새 파일 최소화.
2. **작게 커밋**: 기능 단위로 커밋. 커밋 메시지는 한/영 혼용 허용.
3. **DB 마이그레이션**: 모델 변경 시 `Base.metadata.create_all()` 로 자동 처리됨 (SQLite). 컬럼 추가는 `ALTER TABLE` 직접 실행 필요.
4. **테스트**: MVP 단계에서는 수동 테스트. 기능이 안정화되면 `tests/` 추가.
5. **의존성**: `requirements.txt` 에 버전 고정 유지.

---

## 자주 쓰는 명령어

```bash
# 서버 실행
python run.py

# 의존성 설치
pip install -r requirements.txt

# API 문서 확인
# http://localhost:8000/docs

# DB 직접 확인
sqlite3 priority_guard.db ".tables"
sqlite3 priority_guard.db "SELECT * FROM tasks ORDER BY priority;"

# 커밋 & 푸시
git add -p && git commit -m "..." && git push origin main
```

---

## 다음 개발 우선순위 (Backlog)

- [ ] 반복 할일 (매일/매주 루틴)
- [ ] 태그/카테고리 분류
- [ ] 슬랙 웹훅 연동 (새 요청 자동 수신)
- [ ] 모바일 PWA 지원
- [ ] 다크모드
- [ ] 멀티 유저 (로그인)
