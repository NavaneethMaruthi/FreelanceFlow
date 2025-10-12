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
  if (Number.isNaN(d)) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function row({ _id, name, client = "", status = "to-do", deadline = "" }) {
  return `<tr>
    <td>${escape(name)}</td>
    <td>${escape(client)}</td>
    <td class="text-capitalize">${escape(status)}</td>
    <td>${formatDate(deadline)}</td>
     <td> <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${_id}">Delete</button></td>
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

    const body = {
      name: document.getElementById("projectTitle").value,
      client: document.getElementById("clientName").value,
      status: document.getElementById("status").value,
      deadline: document.getElementById("deadline").value,
    };

    const res = await fetch("/api/projects", {
      method: "POST",
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
      loadProjects();
    } else {
      alert("Failed to save project");
    }
  });

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
