const todayStr = () => new Date().toISOString().split("T")[0];

document.getElementById("today-date").textContent = new Date().toLocaleDateString("ko-KR", {
  year: "numeric", month: "long", day: "numeric", weekday: "short"
});

async function loadTasks() {
  const res = await fetch(`/tasks/?target_date=${todayStr()}`);
  const tasks = await res.json();

  const list = document.getElementById("task-list");
  const count = document.getElementById("task-count");
  const done = tasks.filter(t => t.done).length;
  count.textContent = `(${done}/${tasks.length} 완료)`;

  list.innerHTML = tasks.map(t => `
    <li class="task-item ${t.done ? "done" : ""}" id="task-${t.id}">
      <div class="priority-badge">${t.priority}</div>
      <span class="task-title">${escHtml(t.title)}</span>
      <div class="task-actions">
        ${t.done
          ? `<button class="btn-undo" onclick="toggleDone(${t.id}, false)">되돌리기</button>`
          : `<button class="btn-done" onclick="toggleDone(${t.id}, true)">완료</button>`
        }
        <button class="btn-delete" onclick="deleteTask(${t.id})">삭제</button>
      </div>
    </li>
  `).join("");
}

async function addTask() {
  const title = document.getElementById("new-title").value.trim();
  const priority = parseInt(document.getElementById("new-priority").value) || autoNextPriority();

  if (!title) return alert("할일을 입력하세요.");

  await fetch("/tasks/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, priority, date: todayStr() })
  });

  document.getElementById("new-title").value = "";
  document.getElementById("new-priority").value = "";
  loadTasks();
}

async function toggleDone(id, done) {
  await fetch(`/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done })
  });
  loadTasks();
}

async function deleteTask(id) {
  if (!confirm("삭제할까요?")) return;
  await fetch(`/tasks/${id}`, { method: "DELETE" });
  loadTasks();
}

async function evaluateRequest() {
  const input = document.getElementById("new-request");
  const newTask = input.value.trim();
  if (!newTask) return alert("요청 내용을 입력하세요.");

  const box = document.getElementById("eval-result");
  box.className = "eval-box loading";
  box.textContent = "AI가 판단 중...";
  box.classList.remove("hidden");

  try {
    const res = await fetch("/ai/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_task: newTask })
    });
    const data = await res.json();

    const labels = { insert: "🔴 지금 끼워넣기", later: "🔵 나중에 처리", reject: "⚪ 오늘 안 해도 됨" };
    box.className = `eval-box ${data.decision}`;
    box.innerHTML = `
      <div class="eval-decision">${labels[data.decision]}</div>
      <div>${escHtml(data.reason)}</div>
      ${data.decision === "insert" ? `<div style="margin-top:8px;font-size:0.85rem;color:#666;">→ ${data.insert_at}번 순위로 추가 권장</div>` : ""}
    `;

    // insert면 자동으로 할일 추가 버튼 제공
    if (data.decision === "insert") {
      box.innerHTML += `<button style="margin-top:10px" onclick="insertTask('${escHtml(newTask)}', ${data.insert_at})">이 순위로 추가</button>`;
    }
  } catch {
    box.className = "eval-box reject";
    box.textContent = "오류가 발생했습니다.";
  }
}

async function insertTask(title, priority) {
  await fetch("/tasks/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, priority, date: todayStr() })
  });
  document.getElementById("new-request").value = "";
  document.getElementById("eval-result").classList.add("hidden");
  loadTasks();
}

async function getSummary() {
  const box = document.getElementById("summary-result");
  box.className = "summary-box loading";
  box.textContent = "요약 생성 중...";
  box.classList.remove("hidden");

  try {
    const res = await fetch("/ai/summary");
    const data = await res.json();
    box.className = "summary-box";
    box.textContent = data.summary;
  } catch {
    box.textContent = "오류가 발생했습니다.";
  }
}

function autoNextPriority() {
  const badges = document.querySelectorAll(".priority-badge");
  return badges.length + 1;
}

function escHtml(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

// Enter 키 지원
document.getElementById("new-title").addEventListener("keydown", e => { if (e.key === "Enter") addTask(); });
document.getElementById("new-request").addEventListener("keydown", e => { if (e.key === "Enter") evaluateRequest(); });

loadTasks();
