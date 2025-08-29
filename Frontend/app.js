// 1) URL base de nuestra API FastAPI
const API_URL = "http://127.0.0.1:8000";

// 2) Referencias a elementos del HTML
const els = {
  input: document.getElementById("taskInput"),
  addBtn: document.getElementById("addBtn"),
  list: document.getElementById("taskList"),
  filters: document.querySelectorAll(".filter")
};

// 3) Estado en memoria
let tasks = [];
let currentFilter = "all"; 

// 4) Filtro
function applyFilter(items) {
  if (currentFilter === "pending") return items.filter(t => !t.completed);
  if (currentFilter === "done")    return items.filter(t =>  t.completed);
  return items;
}

// 5) Renderizado
function render() {
  els.list.innerHTML = "";
  const filtered = applyFilter(tasks);

  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay películas.";
    li.style.textAlign = "center";
    li.style.opacity = "0.7";
    els.list.appendChild(li);
    return;
  }

  filtered.forEach(task => {
  const li = document.createElement("li");
  li.className = "task";

  // Contenedor de texto (título + reseña)
  const content = document.createElement("div");
  content.style.flex = "1";

  // Título
  const title = document.createElement("span");
  title.className = "title" + (task.completed ? " completed" : "");
  title.textContent = task.title;

  // Reseña
  const review = document.createElement("p");
  review.style.fontSize = "12px";
  review.style.opacity = "0.8";
  review.textContent = task.review ? task.review : "Sin reseña disponible";

  content.appendChild(title);
  content.appendChild(review);

  // Imagen (póster si existe)
  if (task.poster) {
    const img = document.createElement("img");
    img.src = task.poster;
    img.style.width = "50px";
    img.style.borderRadius = "8px";
    img.style.marginRight = "10px";
    li.appendChild(img);
  }

  // Botones de acción
  const actions = document.createElement("div");
  actions.className = "actions";

  const doneBtn = document.createElement("button");
  doneBtn.className = "done";
  doneBtn.textContent = task.completed ? "Desmarcar" : "Completar";
  doneBtn.onclick = () => toggleTask(task.id);

  const delBtn = document.createElement("button");
  delBtn.className = "delete";
  delBtn.textContent = "Eliminar";
  delBtn.onclick = () => deleteTask(task.id);

  actions.appendChild(doneBtn);
  actions.appendChild(delBtn);

  // Ensamblar <li>
  li.appendChild(content);
  li.appendChild(actions);
  els.list.appendChild(li);
});
}

// 6) Obtener tareas
async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks`);
  if (!res.ok) {
    alert("Error al cargar las tareas");
    return;
  }
  tasks = await res.json();
  render();
}

// 7) Agregar tarea
async function addTask() {
  const title = els.input.value.trim();
  if (!title) return alert("Escribe una película");

  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) return alert("No se pudo crear la tarea");

  els.input.value = "";
  fetchTasks();
}

// 8) Alternar completado
async function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const updated = { ...task, completed: !task.completed };

  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });

  if (!res.ok) return alert("No se pudo actualizar la tarea");

  fetchTasks();
}

// 9) Eliminar tarea
async function deleteTask(id) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) return alert("No se pudo eliminar la tarea");

  fetchTasks();
}

// 10) Eventos
els.addBtn.addEventListener("click", addTask);
els.input.addEventListener("keypress", e => { if (e.key === "Enter") addTask(); });

els.filters.forEach(btn => {
  btn.addEventListener("click", () => {
    els.filters.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// 11) Inicializar
fetchTasks();
