from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo
class Task(BaseModel):
    id: int
    title: str
    completed: bool = False

tasks = []
counter = 1

@app.get("/tasks")
def get_tasks():
    return tasks

@app.post("/tasks")
def create_task(task: dict):
    global counter
    new_task = Task(id=counter, title=task["title"])
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
