// ── Syscall data ──────────────────────────────────────────────────────────────
const SYSCALLS = [
  { id: "0x0025", name: "NtOpenProcess",       status: "hooked",   desc: "Intercepts process handle acquisition" },
  { id: "0x003A", name: "NtAllocateVirtualMemory", status: "hooked", desc: "Monitors memory allocation requests" },
  { id: "0x004F", name: "NtWriteVirtualMemory",  status: "hooked",   desc: "Intercepts cross-process writes" },
  { id: "0x0050", name: "NtReadVirtualMemory",   status: "hooked",   desc: "Intercepts cross-process reads" },
  { id: "0x0055", name: "NtCreateFile",          status: "hooked",   desc: "Monitors file creation/opening" },
  { id: "0x006D", name: "NtQuerySystemInformation", status: "hooked", desc: "Intercepts system info queries" },
  { id: "0x0012", name: "NtClose",               status: "passthru", desc: "Passes through without modification" },
  { id: "0x002F", name: "NtDeviceIoControlFile", status: "passthru", desc: "Passes through without modification" },
  { id: "0x0041", name: "NtProtectVirtualMemory", status: "blocked", desc: "Blocked when target is kernel image" },
  { id: "0x00BA", name: "NtLoadDriver",          status: "blocked",  desc: "Blocked for unsigned drivers" },
];

// ── Render syscall table ───────────────────────────────────────────────────────
function renderTable(data) {
  const tbody = document.getElementById("syscall-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  data.forEach(row => {
    const tr = document.createElement("tr");
    const tagClass = row.status === "hooked" ? "tag-hooked"
                   : row.status === "blocked" ? "tag-blocked"
                   : "tag-passthru";
    tr.innerHTML = `
      <td><code style="font-family:var(--mono);color:var(--accent)">${row.id}</code></td>
      <td><code style="font-family:var(--mono)">${row.name}</code></td>
      <td><span class="tag ${tagClass}">${row.status}</span></td>
      <td style="color:var(--muted)">${row.desc}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Filter ─────────────────────────────────────────────────────────────────────
function initFilter() {
  const input = document.getElementById("filter-input");
  const select = document.getElementById("filter-status");
  if (!input || !select) return;

  function applyFilter() {
    const q = input.value.toLowerCase();
    const s = select.value;
    const filtered = SYSCALLS.filter(row => {
      const matchText = !q || row.name.toLowerCase().includes(q) || row.id.includes(q);
      const matchStatus = !s || row.status === s;
      return matchText && matchStatus;
    });
    renderTable(filtered);
    document.getElementById("result-count").textContent = `${filtered.length} entries`;
  }

  input.addEventListener("input", applyFilter);
  select.addEventListener("change", applyFilter);
  renderTable(SYSCALLS);
  document.getElementById("result-count").textContent = `${SYSCALLS.length} entries`;
}

// ── Copy code buttons ──────────────────────────────────────────────────────────
function initCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const pre = btn.closest(".code-wrap").querySelector("pre");
      const text = pre.innerText;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "Copy"), 1800);
      }).catch(() => {
        btn.textContent = "Error";
        setTimeout(() => (btn.textContent = "Copy"), 1800);
      });
    });
  });
}

// ── Animated counters ─────────────────────────────────────────────────────────
function animateCounters() {
  document.querySelectorAll("[data-count]").forEach(el => {
    const target = parseInt(el.dataset.count, 10);
    if (!target || target <= 0) return;
    const suffix = el.dataset.suffix || "";
    const duration = 900;
    const step = Math.ceil(duration / target);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + 1, target);
      el.textContent = current + suffix;
      if (current >= target) clearInterval(timer);
    }, step);
  });
}

// ── Smooth-scroll for nav links ────────────────────────────────────────────────
function initNavScroll() {
  document.querySelectorAll("a[href^='#']").forEach(a => {
    a.addEventListener("click", e => {
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

// ── IntersectionObserver for fade-in ──────────────────────────────────────────
function initFadeIn() {
  const style = document.createElement("style");
  style.textContent = `
    .fade-in { opacity: 0; transform: translateY(16px); transition: opacity .45s ease, transform .45s ease; }
    .fade-in.visible { opacity: 1; transform: none; }
  `;
  document.head.appendChild(style);

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".card, .step, details, .flow-box").forEach(el => {
    el.classList.add("fade-in");
    obs.observe(el);
  });
}

// ── Boot ───────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initFilter();
  initCopyButtons();
  animateCounters();
  initNavScroll();
  initFadeIn();
});
