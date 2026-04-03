# API Reference — Priority Guard

Base URL: `http://localhost:8000`
대화형 문서: `http://localhost:8000/docs`

---

## Tasks

### GET /tasks/
오늘 할일 목록 조회 (기본: 오늘 날짜, priority 오름차순)

**Query Parameters**
| 파라미터 | 타입 | 필수 | 설명 |
|---|---|---|---|
| target_date | string (YYYY-MM-DD) | 선택 | 조회할 날짜. 미입력 시 오늘 |

**Response** `200`
```json
[
  {
    "id": 1,
    "title": "기획서 초안 작성",
    "priority": 1,
    "done": false,
    "date": "2026-04-03",
    "note": null
  }
]
```

---

### POST /tasks/
할일 추가

**Request Body**
```json
{
  "title": "기획서 초안 작성",
  "priority": 1,
  "date": "2026-04-03",
  "note": null
}
```

**Response** `201` — 생성된 Task 객체

---

### POST /tasks/insert
지정 순위에 끼워넣기 (기존 항목 순위 자동 +1)

**Request Body** — `POST /tasks/` 와 동일

**동작**
1. `priority >= body.priority` 이고 `done=false` 인 오늘 항목의 priority를 +1
2. 새 Task 생성

**Response** `201` — 생성된 Task 객체

---

### POST /tasks/reorder
여러 할일 순위 일괄 변경 (드래그 후 저장)

**Request Body**
```json
[
  { "id": 3, "priority": 1 },
  { "id": 1, "priority": 2 },
  { "id": 2, "priority": 3 }
]
```

**Response** `200`
```json
{ "ok": true }
```

---

### POST /tasks/carry-over
어제 미완료 항목을 오늘로 복사

**Request Body** — 없음

**동작**
1. 어제(`today - 1`) `done=false` 항목 조회
2. 오늘 최대 priority 다음 순서로 새 Task 생성 (원본 유지)

**Response** `200`
```json
{ "carried": 3 }
```

---

### GET /tasks/stats
최근 7일 완료율 통계

**Response** `200`
```json
[
  { "date": "2026-03-28", "total": 5, "done": 4, "rate": 80 },
  { "date": "2026-03-29", "total": 0, "done": 0, "rate": null },
  ...
  { "date": "2026-04-03", "total": 3, "done": 1, "rate": 33 }
]
```
- `rate`: 완료율 (%). 할일이 없으면 `null`

---

### PATCH /tasks/{task_id}
할일 수정 (부분 업데이트)

**Path Parameters**
| 파라미터 | 설명 |
|---|---|
| task_id | Task ID |

**Request Body** (모든 필드 선택)
```json
{
  "title": "수정된 제목",
  "priority": 2,
  "done": true,
  "note": "메모"
}
```

**Response** `200` — 수정된 Task 객체
**Response** `404` — Task 없음

---

### DELETE /tasks/{task_id}
할일 삭제

**Response** `204` — No Content
**Response** `404` — Task 없음

---

## AI

### POST /ai/evaluate
새 요청을 오늘 할일 목록과 비교해 처리 방법 판단

**Request Body**
```json
{
  "new_task": "디자인팀 미팅 자료 준비"
}
```

**Response** `200`
```json
{
  "decision": "insert",
  "insert_at": 2,
  "reason": "미팅이 오후 2시로 예정되어 있어 현재 작업보다 우선 처리가 필요합니다. 기존 2번 항목을 밀고 끼워넣기를 권장합니다.",
  "suggested_reorder": [
    { "id": 3, "new_priority": 3 },
    { "id": 4, "new_priority": 4 }
  ]
}
```

**decision 값**
| 값 | 의미 |
|---|---|
| `insert` | 지금 끼워넣기. `insert_at` 위치에 추가 권장 |
| `later` | 오늘 처리, 현재 순위보다 낮음 (목록 맨 뒤) |
| `reject` | 오늘 안 해도 됨 또는 위임 가능 |

**Response** `500` — ANTHROPIC_API_KEY 미설정 또는 AI 응답 파싱 실패

---

### GET /ai/summary
오늘 완료/미완료 기반 하루 요약 + 내일 조언

**Response** `200`
```json
{
  "summary": "오늘 5개 중 3개를 완료했습니다. 기획서 작성과 팀장 보고를 마무리한 것이 특히 잘 된 점입니다. 남은 코드 리뷰는 내일 오전 첫 번째로 처리하면 좋겠습니다. 내일은 집중 시간을 아침에 확보해 미완료 항목부터 처리해보세요."
}
```
