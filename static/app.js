// ── Utils ──────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];

function escHtml(str) {
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function toast(msg) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 2500);
}

// ── Init ───────────────────────────────────────────────
document.getElementById("today-date").textContent = new Date().toLocaleDateString("ko-KR", {
  year: "numeric", month: "long", day: "numeric", weekday: "short"
});

document.getElementById("new-title").addEventListener("keydown", e => { if (e.key === "Enter") addTask(); });
document.getElementById("new-request").addEventListener("keydown", e => { if (e.key === "Enter") evaluateRequest(); });

loadTasks();
loadStats();

// ── Tasks ──────────────────────────────────────────────
async function loadTasks() {
  const res = await fetch(`/tasks/?target_date=${todayStr()}`);
  const tasks = await res.json();
  renderTasks(tasks);
}

function renderTasks(tasks) {
  const list = document.getElementById("task-list");
  const count = document.getElementById("task-count");
  const emptyMsg = document.getElementById("empty-msg");

  const done = tasks.filter(t => t.done).length;
  count.textContent = `(${done}/${tasks.length} 완료)`;
  emptyMsg.classList.toggle("hidden", tasks.length > 0);

  list.innerHTML = tasks.map(t => `
    <li class="task-item ${t.done ? "done" : ""}"
        id="task-${t.id}"
        draggable="true"
        data-id="${t.id}"
        data-priority="${t.priority}">
      <span class="drag-handle">⠿</span>
      <div class="priority-badge">${t.priority}</div>
      <span class="task-title" ondblclick="startEdit(${t.id}, this)">${escHtml(t.title)}</span>
      <div class="task-actions">
        ${t.done
          ? `<button class="btn-undo"   onclick="toggleDone(${t.id}, false)">되돌리기</button>`
          : `<button class="btn-done"   onclick="toggleDone(${t.id}, true)">완료</button>`
        }
        <button class="btn-delete" onclick="deleteTask(${t.id})">삭제</button>
      </div>
    </li>
  `).join("");

  setupDragAndDrop();
}

async function addTask() {
  const titleEl = document.getElementById("new-title");
  const prioEl  = document.getElementById("new-priority");
  const title   = titleEl.value.trim();
  const priority = parseInt(prioEl.value) || autoNextPriority();

  if (!title) return toast("할일을 입력하세요.");

  await fetch("/tasks/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, priority, date: todayStr() })
  });

  titleEl.value = "";
  prioEl.value  = "";
  loadTasks();
  loadStats();
}

async function toggleDone(id, done) {
  await fetch(`/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done })
  });
  loadTasks();
  loadStats();
}

async function deleteTask(id) {
  if (!confirm("삭제할까요?")) return;
  await fetch(`/tasks/${id}`, { method: "DELETE" });
  loadTasks();
  loadStats();
}

function autoNextPriority() {
  const items = document.querySelectorAll(".task-item:not(.done)");
  return items.length + 1;
}

// ── Inline Edit ────────────────────────────────────────
function startEdit(id, el) {
  const current = el.textContent;
  const input = document.createElement("input");
  input.className = "task-title-input";
  input.value = current;
  el.replaceWith(input);
  input.focus();
  input.select();

  const commit = async () => {
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== current) {
      await fetch(`/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle })
      });
      toast("수정됨");
    }
    loadTasks();
  };

  input.addEventListener("blur", commit);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); input.blur(); }
    if (e.key === "Escape") { input.removeEventListener("blur", commit); loadTasks(); }
  });
}

// ── Drag & Drop Reorder ────────────────────────────────
let dragSrc = null;

function setupDragAndDrop() {
  const items = document.querySelectorAll(".task-item");
  items.forEach(item => {
    item.addEventListener("dragstart", onDragStart);
    item.addEventListener("dragover",  onDragOver);
    item.addEventListener("dragleave", onDragLeave);
    item.addEventListener("drop",      onDrop);
    item.addEventListener("dragend",   onDragEnd);
  });
}

function onDragStart(e) {
  dragSrc = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  if (this !== dragSrc) this.classList.add("drag-over");
}

function onDragLeave() { this.classList.remove("drag-over"); }

function onDrop(e) {
  e.preventDefault();
  this.classList.remove("drag-over");
  if (this === dragSrc) return;

  const list = document.getElementById("task-list");
  const items = [...list.querySelectorAll(".task-item")];
  const srcIdx  = items.indexOf(dragSrc);
  const destIdx = items.indexOf(this);

  if (srcIdx < destIdx) list.insertBefore(dragSrc, this.nextSibling);
  else                  list.insertBefore(dragSrc, this);

  saveReorder();
}

function onDragEnd() {
  document.querySelectorAll(".task-item").forEach(el => {
    el.classList.remove("dragging", "drag-over");
  });
}

async function saveReorder() {
  const items = [...document.querySelectorAll(".task-item")];
  const payload = items.map((el, idx) => ({
    id: parseInt(el.dataset.id),
    priority: idx + 1
  }));

  // 배지 즉시 업데이트
  items.forEach((el, idx) => {
    el.querySelector(".priority-badge").textContent = idx + 1;
    el.dataset.priority = idx + 1;
  });

  await fetch("/tasks/reorder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  toast("순위 저장됨");
}

// ── Carry Over ────────────────────────────────────────
async function carryOver() {
  const res  = await fetch("/tasks/carry-over", { method: "POST" });
  const data = await res.json();
  if (data.carried === 0) {
    toast("어제 미완료 항목이 없습니다.");
  } else {
    toast(`어제 미완료 ${data.carried}개를 가져왔습니다.`);
    loadTasks();
    loadStats();
  }
}

// ── Stats ─────────────────────────────────────────────
async function loadStats() {
  const res   = await fetch("/tasks/stats");
  const stats = await res.json();
  const bar   = document.getElementById("stats-bar");

  const days = ["일", "월", "화", "수", "목", "금", "토"];

  bar.innerHTML = stats.map((s, i) => {
    const isToday = i === stats.length - 1;
    const d = new Date(s.date + "T00:00:00");
    const label = isToday ? "오늘" : days[d.getDay()];
    const height = s.rate != null ? s.rate : 0;
    const fillClass = s.rate == null ? "empty" : isToday ? "today" : "";
    const rateText = s.rate != null ? `${s.rate}%` : "–";
    const rateClass = s.rate == null ? "no-data" : isToday ? "today" : "";

    return `
      <div class="stat-col">
        <div class="stat-rate ${rateClass}">${rateText}</div>
        <div class="stat-bar-wrap">
          <div class="stat-bar-fill ${fillClass}" style="height:${height}%"></div>
        </div>
        <div class="stat-label">${label}</div>
      </div>
    `;
  }).join("");
}

// ── AI Evaluate ───────────────────────────────────────
async function evaluateRequest() {
  const input   = document.getElementById("new-request");
  const newTask = input.value.trim();
  if (!newTask) return toast("요청 내용을 입력하세요.");

  const box = document.getElementById("eval-result");
  box.className = "eval-box loading";
  box.textContent = "AI가 판단 중...";
  box.classList.remove("hidden");

  try {
    const res  = await fetch("/ai/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_task: newTask })
    });
    const data = await res.json();

    const labels = {
      insert: "🔴 지금 끼워넣기",
      later:  "🔵 나중에 처리",
      reject: "⚪ 오늘 안 해도 됨"
    };

    box.className = `eval-box ${data.decision}`;
    box.innerHTML = `
      <div class="eval-decision">${labels[data.decision]}</div>
      <div>${escHtml(data.reason)}</div>
      ${data.decision === "insert"
        ? `<div style="margin-top:8px;font-size:0.83rem;color:#666;">→ ${data.insert_at}번 순위로 추가, 기존 항목 자동 밀기</div>
           <button style="margin-top:10px" onclick="insertTaskNow('${escHtml(newTask)}', ${data.insert_at})">이 순위로 추가</button>`
        : data.decision === "later"
        ? `<button style="margin-top:10px" onclick="insertTaskLater('${escHtml(newTask)}')">목록 맨 뒤에 추가</button>`
        : ""
      }
    `;
  } catch {
    box.className = "eval-box reject";
    box.textContent = "오류가 발생했습니다.";
  }
}

async function insertTaskNow(title, priority) {
  await fetch("/tasks/insert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, priority, date: todayStr() })
  });
  document.getElementById("new-request").value = "";
  document.getElementById("eval-result").classList.add("hidden");
  toast(`"${title}" 을 ${priority}번 순위로 추가했습니다.`);
  loadTasks();
  loadStats();
}

async function insertTaskLater(title) {
  const priority = autoNextPriority() + 1;
  await fetch("/tasks/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, priority, date: todayStr() })
  });
  document.getElementById("new-request").value = "";
  document.getElementById("eval-result").classList.add("hidden");
  toast(`"${title}" 을 목록 맨 뒤에 추가했습니다.`);
  loadTasks();
  loadStats();
}

// ── AI Summary ────────────────────────────────────────
async function getSummary() {
  const box = document.getElementById("summary-result");
  box.className = "summary-box loading";
  box.textContent = "요약 생성 중...";
  box.classList.remove("hidden");

  try {
    const res  = await fetch("/ai/summary");
    const data = await res.json();
    box.className = "summary-box";
    box.textContent = data.summary;
  } catch {
    box.textContent = "오류가 발생했습니다.";
  }
}
