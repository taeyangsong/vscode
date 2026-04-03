from datetime import date
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


@router.get("/", response_model=list[TaskOut])
def get_tasks(target_date: date | None = None, db: Session = Depends(get_db)):
    q = db.query(Task)
    if target_date:
        q = q.filter(Task.date == target_date)
    else:
        q = q.filter(Task.date == date.today())
    return q.order_by(Task.priority).all()


@router.post("/", response_model=TaskOut, status_code=201)
def create_task(body: TaskCreate, db: Session = Depends(get_db)):
    task = Task(**body.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


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
