from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import Base, engine
from app.routers import tasks, ai

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Priority Guard")

app.include_router(tasks.router)
app.include_router(ai.router)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def root():
    return FileResponse("static/index.html")
