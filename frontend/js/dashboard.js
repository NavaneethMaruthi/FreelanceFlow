async function loadDashboard() {
  const res = await fetch("/api/dashboard", { credentials: "include" });

  if (!res.ok) {
    console.error("Failed to load dashboard data");
    return;
  }

  const data = await res.json();

  // Update total hours
  document.querySelector(".hours-value").textContent = `${data.totalHours} hrs`;

  // Update total projects
  document.querySelector(".projects-value").textContent = data.totalProjects;

  // Update active projects table
  const tbody = document.getElementById("top-projects-body");

  if (data.activeProjects.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted py-3">
          No active projects yet.
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = data.activeProjects
      .map((p) => {
        const deadline = p.deadline
          ? new Date(p.deadline).toLocaleDateString()
          : "No deadline";

        return `
        <tr>
          <td>${escape(p.name)}</td>
          <td>${escape(p.client)}</td>
          <td><span class="badge bg-success text-capitalize">${escape(p.status)}</span></td>
          <td>${deadline}</td>
        </tr>
      `;
      })
      .join("");
  }
}

function escape(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

loadDashboard();
