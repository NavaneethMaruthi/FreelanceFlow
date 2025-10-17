// Get the table body once
const tbody = document.getElementById("top-projects-body");

// Helpers
function escapeHtml(s = "") {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]
  );
}

// Robust deadline parser (handles Date, ISO, 'YYYY-MM-DD', numbers)
function toMs(deadline) {
  if (!deadline) return NaN;
  if (deadline instanceof Date) return deadline.getTime();
  if (typeof deadline === "number")
    return Number.isFinite(deadline) ? deadline : NaN;
  if (typeof deadline === "string") {
    // Support 'YYYY-MM-DD' by anchoring to local midnight; fall back to Date.parse
    const ymd = /^(\d{4})-(\d{2})-(\d{2})$/;
    const m = deadline.match(ymd);
    if (m) {
      const [_, y, mo, d] = m;
      const dt = new Date(Number(y), Number(mo) - 1, Number(d), 0, 0, 0, 0);
      return dt.getTime();
    }
    const t = Date.parse(deadline);
    return Number.isNaN(t) ? NaN : t;
  }
  return NaN;
}

// Rank deadlines relative to NOW (future first, then least-overdue, then none)
function deadlineKey(d) {
  const t = toMs(d);
  if (Number.isNaN(t)) return { bucket: 2, val: Infinity };
  const now = Date.now();
  if (t >= now) return { bucket: 0, val: t - now }; // future: sooner is better
  return { bucket: 1, val: now - t }; // past: less overdue is better
}

function top3ByDeadline(projects) {
  return [...projects]
    .filter((p) => String(p.status).toLowerCase().trim() === "active")
    .sort((a, b) => {
      const ka = deadlineKey(a.deadline);
      const kb = deadlineKey(b.deadline);
      if (ka.bucket !== kb.bucket) return ka.bucket - kb.bucket;
      return ka.val - kb.val;
    })
    .slice(0, 3);
}

async function loadDashboard() {
  try {
    const res = await fetch("/api/dashboard", { credentials: "include" });
    if (!res.ok) throw new Error("Failed to load dashboard data");
    const data = await res.json();

    // Summary tiles
    document.querySelector(".hours-value").textContent =
      `${data.totalHours ?? 0} hrs`;
    document.querySelector(".projects-value").textContent =
      `${data.totalProjects ?? 0}`;

    // Try to compute top-3 from dashboard payload
    let rows = top3ByDeadline(data.activeProjects ?? []);

    // Fallback: if dashboard already gave you only "last edited" or not enough,
    // fetch full projects list and recompute by deadline.
    if (rows.length < 3 || (data.activeProjects?.length ?? 0) <= 3) {
      try {
        const all = await fetch("/api/projects", { credentials: "include" });
        if (all.ok) {
          const allProjects = await all.json();
          const recomputed = top3ByDeadline(allProjects);
          if (recomputed.length) rows = recomputed;
        }
      } catch {
        /* ignore fallback errors */
      }
    }

    if (rows.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="text-center text-muted py-3">
            No active projects yet.
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = rows
      .map((p) => {
        const deadline = toMs(p.deadline)
          ? new Date(toMs(p.deadline)).toLocaleDateString()
          : "No deadline";
        return `
          <tr>
            <td>${escapeHtml(p.name)}</td>
            <td>${escapeHtml(p.client)}</td>
            <td><span class="badge bg-info text-dark text-capitalize">${escapeHtml(p.status)}</span></td>
            <td>${deadline}</td>
          </tr>`;
      })
      .join("");
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-danger py-3">
          Error loading dashboard.
        </td>
      </tr>`;
  }
}

// Run once
loadDashboard();
