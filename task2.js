// Task 2: Kanban board
const MAX_IN_PROGRESS_CARDS = 3;
const PRIORITY_ORDER = { High: 3, Medium: 2, Low: 1 };
const INITIAL_TASKS = [
  { id: "task-01", title: "Sketch the landing page hero", tag: "Design", priority: "High", status: "todo", due: "Today" },
  { id: "task-02", title: "Collect color palette ideas", tag: "Design", priority: "Medium", status: "todo", due: "Today" },
  { id: "task-03", title: "Write a short project intro", tag: "Writing", priority: "Low", status: "todo", due: "Tomorrow" },
  { id: "task-04", title: "Choose the type scale", tag: "Design", priority: "Medium", status: "todo", due: "Tomorrow" },
  { id: "task-05", title: "Build the navigation bar", tag: "Code", priority: "High", status: "progress", due: "Today" },
  { id: "task-06", title: "Create the responsive card grid", tag: "Code", priority: "High", status: "progress", due: "Tomorrow" },
  { id: "task-07", title: "Check mobile spacing", tag: "Polish", priority: "Medium", status: "progress", due: "Friday" },
  { id: "task-08", title: "Set up the project folders", tag: "Code", priority: "Low", status: "done", due: "Done" },
  { id: "task-09", title: "Pick a project name", tag: "Writing", priority: "Low", status: "done", due: "Done" },
  { id: "task-10", title: "Save the first wireframe", tag: "Design", priority: "Medium", status: "done", due: "Done" },
];
const BOARD_STATUSES = ["todo", "progress", "done"];
const STATUS_LABELS = { todo: "To do", progress: "In progress", done: "Done" };

let taskItems = INITIAL_TASKS.map((task) => ({ ...task }));
let taskFilter = "all";
let taskSearch = "";
let priorityDescending = false;

const boardElement = document.querySelector("#kanban-board");
const tagFilterElement = document.querySelector("#tag-filter");
const taskSearchElement = document.querySelector("#task-search");
const sortPriorityButton = document.querySelector("#sort-priority");
const boardMessageElement = document.querySelector("#board-message");
const progressTrackElement = document.querySelector(".progress-track");

function populateTagFilter() {
  const tags = [...new Set(taskItems.map((task) => task.tag))].sort((first, second) => first.localeCompare(second));
  tags.forEach((tag) => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    tagFilterElement.append(option);
  });
}

function getVisibleTasks() {
  const normalizedSearch = taskSearch.trim().toLowerCase();
  const visibleTasks = taskItems.filter((task) => {
    const matchesTag = taskFilter === "all" || task.tag === taskFilter;
    const matchesSearch = normalizedSearch === "" || task.title.toLowerCase().includes(normalizedSearch);
    return matchesTag && matchesSearch;
  });

  return visibleTasks.sort((first, second) => {
    const priorityDifference = PRIORITY_ORDER[second.priority] - PRIORITY_ORDER[first.priority];
    return priorityDescending ? priorityDifference : -priorityDifference;
  });
}

function createTaskCard(task) {
  const card = document.createElement("article");
  card.className = `task-card${task.status === "done" ? " is-done" : ""}`;
  card.dataset.taskId = task.id;

  const top = document.createElement("div");
  top.className = "task-top";
  const tag = document.createElement("span");
  tag.className = "task-tag";
  tag.textContent = task.tag;
  const priority = document.createElement("span");
  priority.className = `priority-label priority-${task.priority.toLowerCase()}`;
  priority.textContent = task.priority.toUpperCase();
  top.append(tag, priority);

  const title = document.createElement("h4");
  title.className = "task-title";
  title.textContent = task.title;

  const bottom = document.createElement("div");
  bottom.className = "task-bottom";
  const due = document.createElement("span");
  due.className = "task-due";
  due.textContent = task.status === "done" ? "✓ Completed" : `◷ ${task.due}`;
  const actions = document.createElement("div");
  actions.className = "task-actions";

  const currentIndex = BOARD_STATUSES.indexOf(task.status);
  if (currentIndex > 0) {
    actions.append(createMoveButton(task.id, BOARD_STATUSES[currentIndex - 1], "←", `Move ${task.title} to ${STATUS_LABELS[BOARD_STATUSES[currentIndex - 1]]}`));
  }
  if (currentIndex < BOARD_STATUSES.length - 1) {
    actions.append(createMoveButton(task.id, BOARD_STATUSES[currentIndex + 1], "→", `Move ${task.title} to ${STATUS_LABELS[BOARD_STATUSES[currentIndex + 1]]}`));
  }
  bottom.append(due, actions);
  card.append(top, title, bottom);
  return card;
}

function createMoveButton(taskId, nextStatus, icon, label) {
  const button = document.createElement("button");
  button.className = "move-button";
  button.type = "button";
  button.dataset.move = nextStatus;
  button.dataset.taskId = taskId;
  button.setAttribute("aria-label", label);
  button.textContent = icon;
  return button;
}

function renderBoard() {
  const visibleTasks = getVisibleTasks();
  const statusCounts = { todo: 0, progress: 0, done: 0 };
  visibleTasks.forEach((task) => { statusCounts[task.status] += 1; });

  BOARD_STATUSES.forEach((status) => {
    const list = boardElement.querySelector(`[data-list="${status}"]`);
    list.replaceChildren();
    const statusTasks = visibleTasks.filter((task) => task.status === status);
    if (statusTasks.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "empty-column";
      emptyMessage.textContent = "Nothing here yet.";
      list.append(emptyMessage);
    } else {
      statusTasks.forEach((task) => list.append(createTaskCard(task)));
    }
    boardElement.querySelector(`[data-count="${status}"]`).textContent = String(statusCounts[status]);
  });

  const completedCount = taskItems.filter((task) => task.status === "done").length;
  const totalCount = taskItems.length;
  const completionPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  document.querySelector("#progress-copy").textContent = `${completedCount} of ${totalCount} complete`;
  document.querySelector("#progress-fill").style.width = `${completionPercentage}%`;
  progressTrackElement.setAttribute("aria-valuenow", String(completionPercentage));

  if (visibleTasks.length === 0) {
    boardMessageElement.textContent = "No tasks found. Try a different search or tag.";
    boardMessageElement.className = "board-message is-error";
  } else {
    boardMessageElement.textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"} shown.`;
    boardMessageElement.className = "board-message";
  }
}

function moveTask(taskId, nextStatus) {
  const task = taskItems.find((item) => item.id === taskId);
  if (!task || !BOARD_STATUSES.includes(nextStatus)) {
    boardMessageElement.textContent = "That move is unavailable. Choose an arrow on a task card.";
    boardMessageElement.className = "board-message is-error";
    return;
  }

  const progressCount = taskItems.filter((item) => item.status === "progress").length;
  const isEnteringFullProgressColumn = nextStatus === "progress" && task.status !== "progress" && progressCount >= MAX_IN_PROGRESS_CARDS;
  if (isEnteringFullProgressColumn) {
    boardMessageElement.textContent = `Move blocked: In progress already has ${MAX_IN_PROGRESS_CARDS} cards. Finish or move one first.`;
    boardMessageElement.className = "board-message is-error";
    return;
  }

  const previousStatus = task.status;
  task.status = nextStatus;
  renderBoard();
  boardMessageElement.textContent = `“${task.title}” moved from ${STATUS_LABELS[previousStatus]} to ${STATUS_LABELS[nextStatus]}.`;
  boardMessageElement.className = "board-message";
}

boardElement.addEventListener("click", (event) => {
  const moveButton = event.target.closest("button[data-move]");
  if (!moveButton || !boardElement.contains(moveButton)) return;
  moveTask(moveButton.dataset.taskId, moveButton.dataset.move);
});

taskSearchElement.addEventListener("input", () => {
  taskSearch = taskSearchElement.value;
  renderBoard();
});

tagFilterElement.addEventListener("change", () => {
  taskFilter = tagFilterElement.value;
  renderBoard();
});

sortPriorityButton.addEventListener("click", () => {
  priorityDescending = !priorityDescending;
  sortPriorityButton.setAttribute("aria-pressed", String(priorityDescending));
  sortPriorityButton.querySelector("span").textContent = priorityDescending ? "↓" : "↑";
  renderBoard();
});

populateTagFilter();
renderBoard();
