import os
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import anthropic
from app.database import get_db
from app.models import Task

router = APIRouter(prefix="/ai", tags=["ai"])


class NewRequestBody(BaseModel):
    new_task: str


class EvaluationResult(BaseModel):
    decision: str          # "insert" | "later" | "reject"
    insert_at: int | None  # 끼워넣을 우선순위 위치
    reason: str
    suggested_reorder: list[dict] | None = None


@router.post("/evaluate", response_model=EvaluationResult)
def evaluate_new_request(body: NewRequestBody, db: Session = Depends(get_db)):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set")

    tasks = (
        db.query(Task)
        .filter(Task.date == date.today(), Task.done == False)
        .order_by(Task.priority)
        .all()
    )

    task_list_text = "\n".join(
        [f"{t.priority}. {t.title}" for t in tasks]
    ) or "현재 등록된 할일 없음"

    prompt = f"""당신은 직장인의 업무 우선순위 관리를 돕는 AI 어시스턴트입니다.

## 오늘의 할일 목록 (우선순위 순)
{task_list_text}

## 새로 들어온 요청
{body.new_task}

## 판단 기준
- insert: 지금 바로 처리해야 하며 기존 목록에 끼워넣어야 함
- later: 오늘 중에 처리하되 현재 우선순위보다 낮음 (목록 맨 뒤)
- reject: 오늘 하지 않아도 되거나 다른 사람에게 위임 가능

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{{
  "decision": "insert" | "later" | "reject",
  "insert_at": <끼워넣을 순위 숫자, insert가 아니면 null>,
  "reason": "<판단 이유를 2문장 이내로>",
  "suggested_reorder": [
    {{"id": <task_id>, "new_priority": <숫자>}},
    ...
  ] (insert일 때만, 나머지 task들의 새 순위 포함)
}}"""

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )

    import json
    try:
        result = json.loads(message.content[0].text)
        return EvaluationResult(**result)
    except Exception:
        raise HTTPException(status_code=500, detail="AI 응답 파싱 실패")


@router.get("/summary")
def daily_summary(db: Session = Depends(get_db)):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not set")

    tasks = db.query(Task).filter(Task.date == date.today()).order_by(Task.priority).all()
    if not tasks:
        return {"summary": "오늘 등록된 할일이 없습니다."}

    done = [t for t in tasks if t.done]
    pending = [t for t in tasks if not t.done]

    done_text = "\n".join([f"✅ {t.title}" for t in done]) or "없음"
    pending_text = "\n".join([f"⏳ {t.title}" for t in pending]) or "없음"

    prompt = f"""직장인의 오늘 하루 업무를 요약해주세요.

완료한 일:
{done_text}

미완료:
{pending_text}

3~4문장으로 간결하게 오늘 하루를 평가하고, 내일을 위한 한 가지 조언을 해주세요."""

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )

    return {"summary": message.content[0].text}
