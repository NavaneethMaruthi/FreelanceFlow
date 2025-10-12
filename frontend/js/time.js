// /public/js/time.js
const modalEl = document.getElementById("logEntryModal");
const logBtn = document.getElementById("logEntryBtn");
const form = document.getElementById("ts-form");
const tbody = document.getElementById("timesheet-rows");
const projectSelect = document.getElementById("projectSelect");

+modalEl?.addEventListener("show.bs.modal", loadProjects);

const statusBadge = (s) => {
  const map = {
    unpaid: "badge bg-warning text-dark",
    invoiced: "badge bg-secondary",
    paid: "badge bg-success",
  };
  return `<span class="${map[s] || "badge bg-light text-dark"}">${s}</span>`;
};

//load projects from dropdown
async function loadProjects() {
  const res = await fetch("/api/timesheets/projects", {
    credentials: "include",
    cache: "no-store",
  });
  const projects = await res.json();
  projectSelect.innerHTML = projects
    .map(
      (p) =>
        `<option value="${p.id}">${p.name}${p.client ? " — " + p.client : ""}</option>`
    )
    .join("");
}

function renderRows(rows) {
  tbody.innerHTML = rows
    .map((r) => {
      const d = new Date(r.date);
      const dateStr = d.toLocaleDateString();
      const proj = r.projectName
        ? `${r.projectName}${r.client ? " — " + r.client : ""}`
        : r.client || "—";
      const task = r.comments?.trim() || "—";
      return `
        <tr data-id="${r._id}">
          <td>${dateStr}</td>
          <td>${(Number(r.hours) || 0).toFixed(2)}</td>
          <td>${proj}</td>
          <td>${task}</td>
          <td>${statusBadge(r.status)}</td>
        </tr>
      `;
    })
    .join("");
}

async function loadTimesheets() {
  const res = await fetch("/api/timesheets");
  const rows = await res.json();
  renderRows(rows);
}

//refresh projects dropdown list
logBtn.addEventListener("click", loadProjects);
modalEl?.addEventListener("show.bs.modal", loadProjects);

// add new entry
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());
  payload.hours = Number(payload.hours);
  if (payload.projectId) payload.projectId = payload.projectId.trim();

  const res = await fetch("/api/timesheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.message || "Failed to save entry");
    return;
  }

  form.reset();
  bootstrap.Modal.getInstance(modalEl)?.hide();
  await loadTimesheets();
});

await loadProjects();
await loadTimesheets();
