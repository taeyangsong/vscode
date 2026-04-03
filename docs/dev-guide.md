# Dev Guide — Priority Guard

## 개발 환경 세팅

```bash
# 1. 의존성 설치
pip install -r requirements.txt

# 2. 환경변수
cp .env.example .env
# ANTHROPIC_API_KEY=sk-ant-... 입력

# 3. 서버 실행 (hot-reload 포함)
python run.py
# → http://localhost:8000
# → API 문서: http://localhost:8000/docs
```

---

## 브랜치 전략

```
main  ← 항상 동작하는 상태 유지
  └── feature/기능명   ← 새 기능 개발
  └── fix/버그명       ← 버그 수정
```

MVP 단계에서는 `main` 직접 커밋 허용.

---

## 커밋 메시지 규칙

```
<타입>: <요약>

<본문 — 선택>
```

| 타입 | 용도 |
|---|---|
| `feat` | 새 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 |
| `docs` | 문서만 변경 |
| `style` | CSS/UI 변경 |
| `chore` | 설정, 의존성 변경 |

예시:
```
feat: 반복 할일 기능 추가

매일/매주 단위로 반복되는 할일을 등록하면
자정에 자동으로 오늘 목록에 추가됨.
```

---

## 새 기능 개발 절차

### Step 1 — CLAUDE.md 백로그 확인

`CLAUDE.md` 의 `다음 개발 우선순위` 섹션에서 작업 선택.

### Step 2 — 백엔드 먼저

```python
# 1. app/models.py — 필요 시 모델 컬럼 추가
# 2. app/routers/tasks.py 또는 ai.py — 엔드포인트 추가
# 3. python run.py 실행 후 /docs 에서 직접 테스트
```

### Step 3 — 프론트 연결

```js
// static/app.js 맨 아래 섹션에 함수 추가
// static/index.html 에 버튼/입력 추가
// static/style.css 에 스타일 추가
```

### Step 4 — 문서 업데이트

- `docs/api.md` — 새 엔드포인트 추가
- `CHANGELOG.md` — 변경사항 기록
- `CLAUDE.md` 백로그 — 완료 체크

### Step 5 — 커밋 & 푸시

```bash
git add <변경파일들>
git commit -m "feat: ..."
git push origin main
```

---

## 모델 변경 시

SQLite는 자동 마이그레이션이 없음. 컬럼 추가 시:

```bash
# 방법 1: DB 삭제 후 재생성 (개발 초기)
rm priority_guard.db
python run.py  # Base.metadata.create_all() 재실행

# 방법 2: ALTER TABLE 직접 실행 (데이터 보존 필요 시)
sqlite3 priority_guard.db "ALTER TABLE tasks ADD COLUMN tag TEXT;"
```

---

## 디버깅

```bash
# DB 내용 확인
sqlite3 priority_guard.db "SELECT * FROM tasks ORDER BY date, priority;"

# API 직접 호출
curl http://localhost:8000/tasks/
curl -X POST http://localhost:8000/tasks/ \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트","priority":1,"date":"2026-04-03"}'

# AI 판단 테스트
curl -X POST http://localhost:8000/ai/evaluate \
  -H "Content-Type: application/json" \
  -d '{"new_task":"긴급 보고서 작성"}'
```

---

## 의존성 추가 시

```bash
pip install 패키지명==버전
pip freeze | grep 패키지명  # 버전 확인
# requirements.txt 에 버전 고정으로 추가
```

---

## 자주 하는 실수

| 실수 | 해결 |
|---|---|
| `ANTHROPIC_API_KEY` 미설정 | `.env` 파일 확인 |
| DB 스키마 불일치 | `priority_guard.db` 삭제 후 재실행 |
| 프론트 캐시 | 브라우저 강력 새로고침 (Ctrl+Shift+R) |
| CORS 오류 | 로컬 실행 시 발생 안 함, 배포 시 `CORSMiddleware` 추가 필요 |
