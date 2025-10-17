//js/time.js
const modalEl = document.getElementById("logEntryModal");
const logBtn = document.getElementById("logEntryBtn");
const form = document.getElementById("ts-form");
const tbody = document.getElementById("timesheet-rows");
const projectSelect = document.getElementById("projectSelect");

+modalEl?.addEventListener("show.bs.modal", loadProjects);

let editingId = null; // Track if we're editing an existing entry
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
        `<option value="${p.id}">${p.name}${p.client ? " — " + p.client : ""}</option>`,
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
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${r._id}">
              Edit
            </button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${r._id}">
              Delete
            </button>
          </td>
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

// add new entry OR update existing
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());
  payload.hours = Number(payload.hours);
  if (payload.projectId) payload.projectId = payload.projectId.trim();

  let res;
  if (editingId) {
    // UPDATE existing entry
    res = await fetch(`/api/timesheets/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } else {
    // CREATE new entry
    res = await fetch("/api/timesheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.message || "Failed to save entry");
    return;
  }

  form.reset();
  editingId = null;
  document.querySelector("#logEntryLabel").textContent = "Log Time Entry";
  // eslint-disable-next-line no-undef
  bootstrap.Modal.getInstance(modalEl)?.hide();
  await loadTimesheets();
});

// Handle Edit and Delete clicks
tbody.addEventListener("click", async (e) => {
  const target = e.target.closest("button[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  const id = target.dataset.id;

  if (action === "delete") {
    // DELETE entry
    if (!confirm("Delete this time entry?")) return;

    const res = await fetch(`/api/timesheets/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.status === 204 || res.ok) {
      await loadTimesheets();
    } else {
      alert("Failed to delete entry");
    }
  } else if (action === "edit") {
    // EDIT entry - populate form with existing data
    const res = await fetch("/api/timesheets", { credentials: "include" });
    const timesheets = await res.json();
    const entry = timesheets.find((t) => t._id === id);

    if (!entry) {
      alert("Entry not found");
      return;
    }

    // Populate form fields
    const dateObj = new Date(entry.date);
    document.getElementById("ts-date").value = dateObj
      .toISOString()
      .split("T")[0];
    document.getElementById("ts-hours").value = entry.hours;
    document.getElementById("projectSelect").value = entry.projectId || "";
    document.getElementById("ts-comments").value = entry.comments || "";
    document.getElementById("ts-status").value = entry.status || "unpaid";

    // Set editing mode
    editingId = id;
    document.querySelector("#logEntryLabel").textContent = "Edit Time Entry";

    // Load projects and show modal
    await loadProjects();
    // eslint-disable-next-line no-undef
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
});

// Reset form when modal is closed
modalEl.addEventListener("hidden.bs.modal", () => {
  editingId = null;
  form.reset();
  document.querySelector("#logEntryLabel").textContent = "Log Time Entry";
});

// Load projects when modal opens (for new entries)
modalEl?.addEventListener("show.bs.modal", () => {
  if (!editingId) {
    loadProjects();
  }
});

await loadProjects();
await loadTimesheets();
