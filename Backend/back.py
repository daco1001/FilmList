from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API de TMDb
TMDB_API_KEY = "1223b3121da0c4d6b986c9a9185f6550"   
TMDB_URL = "https://api.themoviedb.org/3/search/movie"

# Modelo de película
class Task(BaseModel):
    id: int
    title: str
    completed: bool = False
    review: str | None = None
    poster: str | None = None

tasks = []
counter = 1

@app.get("/tasks")
def get_tasks():
    return tasks

@app.post("/tasks")
def create_task(task: dict):
    global counter
    title = task["title"]

    review = None
    poster = None

    # Llamada a TMDb
    params = {"api_key": TMDB_API_KEY, "query": title, "language": "es-ES"}
    response = requests.get(TMDB_URL, params=params)

    if response.status_code == 200:
        data = response.json()
        if data["results"]:
            movie = data["results"][0]   # La primera coincidencia
            review = movie.get("overview")
            poster = f"https://image.tmdb.org/t/p/w200{movie['poster_path']}" if movie.get("poster_path") else None

    new_task = Task(id=counter, title=title, review=review, poster=poster)
    tasks.append(new_task)
    counter += 1
    return new_task

@app.put("/tasks/{task_id}")
def update_task(task_id: int, updated: Task):
    for i, t in enumerate(tasks):
        if t.id == task_id:
            tasks[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    for i, t in enumerate(tasks):
        if t.id == task_id:
            tasks.pop(i)
            return {"ok": True}
    raise HTTPException(status_code=404, detail="Task not found")
