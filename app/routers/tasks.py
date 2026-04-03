from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Task

router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    title: str
    priority: int
    date: date
    note: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    priority: int | None = None
    done: bool | None = None
    note: str | None = None


class TaskOut(BaseModel):
    id: int
    title: str
    priority: int
    done: bool
    date: date
    note: str | None

    model_config = {"from_attributes": True}


class ReorderItem(BaseModel):
    id: int
    priority: int


@router.get("/", response_model=list[TaskOut])
def get_tasks(target_date: date | None = None, db: Session = Depends(get_db)):
    q = db.query(Task)
    if target_date:
        q = q.filter(Task.date == target_date)
    else:
        q = q.filter(Task.date == date.today())
    return q.order_by(Task.priority).all()


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    """최근 7일 완료율 통계"""
    result = []
    for i in range(6, -1, -1):
        d = date.today() - timedelta(days=i)
        tasks = db.query(Task).filter(Task.date == d).all()
        total = len(tasks)
        done = sum(1 for t in tasks if t.done)
        result.append({
            "date": d.isoformat(),
            "total": total,
            "done": done,
            "rate": round(done / total * 100) if total > 0 else None
        })
    return result


@router.post("/", response_model=TaskOut, status_code=201)
def create_task(body: TaskCreate, db: Session = Depends(get_db)):
    task = Task(**body.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.post("/insert", response_model=TaskOut, status_code=201)
def insert_task_at(body: TaskCreate, db: Session = Depends(get_db)):
    """지정된 우선순위 위치에 끼워넣기 — 기존 항목 순위 자동 밀기"""
    tasks_to_shift = (
        db.query(Task)
        .filter(Task.date == body.date, Task.done == False, Task.priority >= body.priority)
        .all()
    )
    for t in tasks_to_shift:
        t.priority += 1

    task = Task(**body.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.post("/reorder")
def reorder_tasks(items: list[ReorderItem], db: Session = Depends(get_db)):
    """여러 태스크 순위 일괄 변경 (드래그 후)"""
    for item in items:
        task = db.get(Task, item.id)
        if task:
            task.priority = item.priority
    db.commit()
    return {"ok": True}


@router.post("/carry-over")
def carry_over(db: Session = Depends(get_db)):
    """어제 미완료 항목을 오늘로 복사"""
    yesterday = date.today() - timedelta(days=1)
    today = date.today()

    pending = (
        db.query(Task)
        .filter(Task.date == yesterday, Task.done == False)
        .order_by(Task.priority)
        .all()
    )
    if not pending:
        return {"carried": 0}

    # 오늘 가장 낮은 순위 다음에 추가
    max_priority = db.query(Task).filter(Task.date == today).count()

    carried = 0
    for t in pending:
        max_priority += 1
        new_task = Task(title=t.title, priority=max_priority, date=today, note=t.note)
        db.add(new_task)
        carried += 1

    db.commit()
    return {"carried": carried}


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, body: TaskUpdate, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
