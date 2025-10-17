// frontend/js/projects.js
const tbody = document.getElementById("projectTableBody");
const addBtn = document.getElementById("addProjectBtn");

async function authCheck() {
  const r = await fetch("/api/auth/check", { credentials: "include" });
  const d = await r.json();
  if (!d.loggedIn) location.href = "/login.html";
}

function formatDate(val) {
  if (!val) return "";
  const d = new Date(val);
  // Convert to ISO date to avoid timezone drift
  const local = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  return local.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function statusBadge(s) {
  const key = String(s || "")
    .toLowerCase()
    .trim();

  // accept both "to-do" and "todo"
  const normalized = key === "to-do" ? "todo" : key;

  const map = {
    todo: "badge bg-secondary", // gray
    active: "badge bg-info text-dark", // blue-ish, readable
    paused: "badge bg-warning text-dark", // yellow
    completed: "badge bg-success", // green
  };

  const cls = map[normalized] || "badge bg-light text-dark";
  const label = s ?? "—"; // show original text
  return `<span class="${cls} text-capitalize">${escape(label)}</span>`;
}

function row({ _id, name, client = "", status = "to-do", deadline = "" }) {
  return `<tr>
    <td>${escape(name)}</td>
    <td>${escape(client)}</td>
    <td>${statusBadge(status)}</td>
    <td>${formatDate(deadline)}</td>
     <td> <button class="btn btn-outline-primary btn-sm edit-btn" data-id="${_id}">Edit</button>
     <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${_id}">Delete</button>
     </td>
  </tr>`;
}

function render(list) {
  tbody.innerHTML = list.length
    ? list.map(row).join("")
    : `<tr><td colspan="4" class="text-center text-muted py-4">No projects yet. Click "Add Project" to get started.</td></tr>`;
}

async function loadProjects() {
  const r = await fetch("/api/projects", { credentials: "include" });
  if (!r.ok) return render([]);
  render(await r.json());
}

document
  .getElementById("addProjectForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const projectId = form.dataset.editId; // we’ll set this later when clicking Edit

    const body = {
      name: document.getElementById("projectTitle").value,
      client: document.getElementById("clientName").value,
      status: document.getElementById("status").value,
      deadline: document.getElementById("deadline").value,
    };

    const url = projectId ? `/api/projects/${projectId}` : "/api/projects";
    const method = projectId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (res.ok) {
      // Close modal
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addProjectModal")
      );
      modal.hide();
      e.target.reset();
      delete form.dataset.editId; // clear edit mode
      loadProjects();
    } else {
      alert("Failed to save project");
    }
  });

//delete a project in actions
tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest('[data-action="delete"]');
  if (!btn) return;

  const id = btn.dataset.id;
  if (!id) return;

  if (!confirm("Delete this project?")) return;

  const res = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (res.status === 204 || res.ok) {
    loadProjects();
  } else {
    alert("Failed to delete project");
  }
});
//edit a project in actions
tbody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("edit-btn")) {
    const id = e.target.dataset.id;

    const res = await fetch(`/api/projects/${id}`, { credentials: "include" });
    if (!res.ok) return alert("Failed to load project");

    const project = await res.json();

    // populate form fields
    document.getElementById("projectTitle").value = project.name;
    document.getElementById("clientName").value = project.client;
    document.getElementById("status").value = project.status;
    document.getElementById("deadline").value = project.deadline
      ? new Date(project.deadline).toISOString().split("T")[0]
      : ""; //format date so its the beginning of the string

    // store ID so the submit handler knows it’s an edit
    const form = document.getElementById("addProjectForm");
    form.dataset.editId = id;

    // open modal
    const modalEl = document.getElementById("addProjectModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
});

function escape(s = "") {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]
  );
}

authCheck().then(loadProjects);
