document.addEventListener("DOMContentLoaded", () => {

let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
let selectedColor = "#3b82f6";

let draggedIndex = null;

const colorPicker = document.getElementById("colorPicker");
const colorPreview = document.getElementById("colorPreview");
const errorMsg = document.getElementById("errorMsg");

/* COLOR */
colorPicker.oninput = () => {
  selectedColor = colorPicker.value;
  colorPreview.style.background = selectedColor;
};

/* BACK */
document.getElementById("backBtn").onclick = () => {
  location.href = "index.html";
};

/* THEME */
const themeBtn = document.getElementById("themeToggle");

if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light-mode");
  themeBtn.textContent = "Light";
} else {
  themeBtn.textContent = "Dark";
}

themeBtn.onclick = () => {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  themeBtn.textContent = isLight ? "Light" : "Dark";
  localStorage.setItem("theme", isLight ? "light" : "dark");
};

/* ADD */
document.getElementById("add").onclick = () => {
  const h = homeworkInput.value.trim();
  const c = classInput.value.trim();
  const d = dueInput.value;

  if (!h || !c || !d) {
    errorMsg.textContent = "Fill all fields";
    return;
  }

  errorMsg.textContent = "";

  assignments.push({
    id: Date.now(),
    homework: h,
    className: c,
    dueDate: d,
    color: selectedColor,
    completed: false
  });

  save();
  render();
};

function save() {
  localStorage.setItem("assignments", JSON.stringify(assignments));
}

/* DATE HELP */
function getStatus(date) {
  const today = new Date().toISOString().split("T")[0];

  if (date < today) return "overdue";
  if (date === today) return "today";
  return "upcoming";
}

/* DRAG HELPERS */
function reorder(arr, from, to) {
  const item = arr.splice(from, 1)[0];
  arr.splice(to, 0, item);
}

/* RENDER */
function render() {
  const container = document.querySelector(".added");
  container.innerHTML = "";

  assignments.forEach((a, index) => {

    const status = getStatus(a.dueDate);

    const row = document.createElement("div");
    row.className = "assignment-bar fade-in";

    row.style.background = a.color;

    if (status === "overdue") row.classList.add("overdue");
    if (status === "today") row.classList.add("today");

    row.draggable = true;

    /* DRAG START */
    row.addEventListener("dragstart", () => {
      draggedIndex = index;
      row.classList.add("dragging");
    });

    /* DRAG END */
    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
    });

    /* DROP */
    row.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    row.addEventListener("drop", () => {
      if (draggedIndex === null) return;

      reorder(assignments, draggedIndex, index);
      save();
      render();
    });

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = a.completed;

    check.onchange = () => {
      a.completed = check.checked;
      save();
    };

    const hw = document.createElement("div");
    hw.textContent = a.homework;

    const cl = document.createElement("div");
    cl.textContent = a.className;

    const date = document.createElement("div");
    date.textContent = a.dueDate;

    const del = document.createElement("button");
    del.textContent = "X";

    del.onclick = () => {
      row.style.opacity = "0";
      setTimeout(() => {
        assignments = assignments.filter(x => x.id !== a.id);
        save();
        render();
      }, 150);
    };

    row.append(check, hw, cl, date, del);
    container.appendChild(row);
  });
}

render();

});
