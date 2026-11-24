// Vibe Coding Hub prototype — static single-page app reading window.HUB_DATA.
(function () {
  "use strict";

  const DATA = window.HUB_DATA || { projects: [] };
  const app = document.getElementById("app");
  const REPO = "https://github.com/frontfont/km-ai-vibe-code";

  // ---------- Icons (24px line icons) ----------
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    pencil: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    all: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    app: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M7 6.5h.01M10 6.5h.01"/>',
    skill: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8z"/><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2-2.2-.8 2.2-.8z"/>',
    prompt: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    agent: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4"/><circle cx="12" cy="3.5" r="1"/><path d="M9 13h.01M15 13h.01"/><path d="M9.5 16.5h5"/>',
    script: '<path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14"/>',
    workflow: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.5"/>',
    upload: '<path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/>',
    download: '<path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>',
    back: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    shield: '<path d="M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
    pkg: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5"/><path d="M12 12v9"/>',
  };
  const icon = (name) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  // ---------- Labels ----------
  const LABELS = {
    asset: { app: "App", skill: "Skill", prompt: "Prompt", agent: "Agent", script: "Script", workflow: "Workflow" },
    assetPlural: { app: "แอปพลิเคชัน", skill: "Skills", prompt: "Prompts", agent: "Agents" },
    data: { public: "Public", internal: "Internal", confidential: "Confidential", restricted_pii: "ข้อมูลส่วนบุคคล" },
    reuse: { showcase_only: "ดูเป็นตัวอย่าง", reusable: "นำไปใช้ต่อได้", production_ready: "พร้อมใช้งานจริง" },
    support: { none: "ไม่มีการดูแล", best_effort: "ดูแลตามความสะดวก", supported: "มีทีมดูแล" },
    decision: { none: "ไม่มี", assistive: "ช่วยตัดสินใจ", financial_or_hr: "มีผลการเงิน/HR" },
    result: {
      approved_reusable: ["ผ่าน · นำไปใช้ได้", "ok"],
      approved_showcase: ["ผ่าน · ดูเป็นตัวอย่าง", "warn"],
      rejected: ["ไม่ผ่าน", "bad"],
    },
    tier: { T1: "ความเสี่ยงต่ำ", T2: "ความเสี่ยงกลาง", T3: "ความเสี่ยงสูง" },
    reviewer: { "ai-coe": "AI CoE", security: "Security", dpo: "DPO", legal: "Legal", compliance: "Compliance" },
  };
  const BLOCKS = [
    ["problem_opportunity", "1. Problem & AI Opportunity"],
    ["value_roi", "2. Value Proposition & ROI"],
    ["users_channels", "3. Users & Channels"],
    ["data_resources", "4. Data & Key Resources"],
    ["cost_constraints", "5. Cost & Constraints"],
    ["activities_adoption", "6. Key Activities & Adoption"],
  ];
  const BLOCK_NAME = Object.fromEntries(BLOCKS.map(([k, v]) => [k, v.replace(/^\d\.\s*/, "")]));
  const RAIL = [
    ["#/", "all", "ผลงานทั้งหมด"],
    ["#/t/app", "app", "แอปพลิเคชัน"],
    ["#/t/skill", "skill", "Skills"],
    ["#/t/prompt", "prompt", "Prompts"],
    ["#/t/agent", "agent", "Agents"],
    null,
    ["#/saved", "bookmark", "ที่บันทึกไว้"],
    ["#/submit", "upload", "ส่งผลงาน"],
  ];

  // ---------- Helpers ----------
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uniq = (arr) => [...new Set(arr)].sort();
  const mainType = (p) => p.kabac.reuse.asset_types[0];
  const resultBadge = (r) => {
    const [label, cls] = LABELS.result[r] || ["รอตรวจ", "warn"];
    return `<span class="badge ${cls}">${esc(label)}</span>`;
  };
  const chips = (items, map) => items.map((i) => `<span class="chip">${esc(map ? map[i] || i : i)}</span>`).join("");
  const fmt = (n) => Number(n || 0).toLocaleString("th-TH");
  // Cover image (optional). Falls back to the gradient + type icon when absent.
  const coverCls = (p) => (p.cover ? "has-img" : "");
  const coverImg = (p) => (p.cover ? `<img class="cover-img" src="${esc(p.cover)}" alt="" loading="lazy">` : "");

  // Bookmarks are a per-viewer convenience; storage may be unavailable.
  const SAVE_KEY = "vibehub.saved";
  let saved = new Set();
  try { saved = new Set(JSON.parse(localStorage.getItem(SAVE_KEY) || "[]")); } catch (_) { /* ignore */ }
  function persistSaved() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify([...saved])); } catch (_) { /* ignore */ }
    const dot = document.getElementById("saved-count");
    dot.hidden = saved.size === 0;
    dot.textContent = saved.size;
  }
  const saveBtn = (slug) =>
    `<button class="save-btn ${saved.has(slug) ? "on" : ""}" type="button" data-save="${esc(slug)}"
       aria-pressed="${saved.has(slug)}" aria-label="บันทึกผลงานนี้">${icon("bookmark")}</button>`;

  // ---------- Catalog ----------
  const state = { q: "", bu: "", result: "" };

  function renderCatalog({ type = "", savedOnly = false } = {}) {
    const ps = DATA.projects;
    const isHome = !type && !savedOnly;
    const bus = uniq(ps.map((p) => p.kabac.reuse.bu));
    const companies = uniq(ps.map((p) => p.kabac.reuse.company)).length;
    const total = ps.reduce((s, p) => s + (p.downloads || 0), 0);

    let head;
    if (isHome) {
      head = `
        <section class="hero">
          <h1 class="hero-title">Build · Share · Reuse</h1>
          <p class="hero-sub">คลังผลงาน AI Vibe Coding จากทุก BU ในเครือ ทุกชิ้นผ่านการตรวจด้าน Security และ Regulation แล้ว หยิบไปใช้ต่อได้ทันที</p>
          <div class="stats">
            <div class="stat"><b>${ps.length}</b><span>ผลงาน</span></div>
            <div class="stat"><b>${companies}</b><span>บริษัทในเครือ</span></div>
            <div class="stat"><b>${fmt(total)}</b><span>ครั้งที่ถูกนำไปใช้</span></div>
          </div>
        </section>
        ${renderFeatured(ps)}`;
    } else {
      const title = savedOnly ? "ที่บันทึกไว้" : LABELS.assetPlural[type] || LABELS.asset[type] || type;
      head = `<section class="hero"><h1 class="hero-title">${esc(title)}</h1></section>`;
    }

    app.innerHTML = `
      ${head}
      <div class="section-head">
        <div><h2>${isHome ? "ผลงานทั้งหมด" : "รายการ"}</h2><p id="count"></p></div>
      </div>
      <div class="filters">
        <label class="search">${icon("search")}
          <input id="q" type="search" placeholder="ค้นหา เช่น สรุปประชุม, RAG, finance" value="${esc(state.q)}" aria-label="ค้นหาผลงาน">
        </label>
        <select id="bu" aria-label="กรองตาม BU"><option value="">ทุก BU</option>${bus.map((b) => `<option ${state.bu === b ? "selected" : ""}>${esc(b)}</option>`).join("")}</select>
        <select id="result" aria-label="กรองตามผลการตรวจ">
          <option value="">ทุกผลการตรวจ</option>
          <option value="approved_reusable" ${state.result === "approved_reusable" ? "selected" : ""}>นำไปใช้ได้</option>
          <option value="approved_showcase" ${state.result === "approved_showcase" ? "selected" : ""}>ดูเป็นตัวอย่าง</option>
        </select>
      </div>
      <div id="grid" class="grid"></div>`;

    const opts = { type, savedOnly };
    for (const id of ["q", "bu", "result"]) {
      document.getElementById(id).addEventListener("input", (e) => { state[id] = e.target.value; renderGrid(opts); });
    }
    renderGrid(opts);
  }

  function renderFeatured(ps) {
    const top = ps.filter((p) => p.audit.result === "approved_reusable")
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 2);
    if (!top.length) return "";
    return `<section class="featured" aria-label="ผลงานแนะนำ">${top.map((p, i) => {
      const k = p.kabac;
      return `
        <a class="cover feature ${i ? "small" : ""} ${coverCls(p)}" data-type="${esc(mainType(p))}" href="#/p/${encodeURIComponent(p.slug)}">
          ${coverImg(p)}
          <span class="frame"></span>
          <span class="cover-icon">${icon(mainType(p))}</span>
          ${saveBtn(p.slug)}
          <div class="cover-inner">
            <span class="kicker">${i ? "ยอดนิยม" : "ผลงานแนะนำ"} · ${esc(LABELS.asset[mainType(p)])}</span>
            <h2 class="gold-text">${esc(k.meta.project)}</h2>
            ${i ? "" : `<p>${esc(k.meta.summary)}</p>`}
            <div class="row"><span class="tier">${esc(p.audit.tier)}</span><span class="chip">${esc(k.reuse.bu)}</span><span class="chip">${icon("download").replace('class="i"', 'class="i" style="width:14px;height:14px;vertical-align:-2px"')} ${fmt(p.downloads)}</span></div>
          </div>
        </a>`;
    }).join("")}</section>`;
  }

  function matches(p, { type, savedOnly }) {
    const k = p.kabac;
    if (savedOnly && !saved.has(p.slug)) return false;
    if (type && !k.reuse.asset_types.includes(type)) return false;
    if (state.bu && k.reuse.bu !== state.bu) return false;
    if (state.result && p.audit.result !== state.result) return false;
    if (!state.q) return true;
    const hay = [k.meta.project, k.meta.summary, k.meta.owner, k.reuse.bu, ...(k.reuse.tags || []),
      ...k.reuse.asset_types, ...Object.values(k.business).flat()].join(" ").toLowerCase();
    return state.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  }

  function renderGrid(opts) {
    const list = DATA.projects.filter((p) => matches(p, opts)).sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    document.getElementById("count").textContent = `${list.length} ผลงาน`;
    const grid = document.getElementById("grid");
    if (!list.length) {
      grid.innerHTML = opts.savedOnly && !saved.size
        ? `<div class="empty"><b>ยังไม่มีผลงานที่บันทึกไว้</b>กดไอคอน ${icon("bookmark")} บนการ์ดเพื่อเก็บผลงานที่สนใจไว้ดูทีหลัง</div>`
        : `<div class="empty"><b>ไม่พบผลงาน</b>ลองเปลี่ยนคำค้นหาหรือตัวกรอง</div>`;
      return;
    }
    grid.innerHTML = list.map((p) => {
      const k = p.kabac, t = mainType(p);
      return `
        <a class="card" href="#/p/${encodeURIComponent(p.slug)}">
          <div class="cover ${coverCls(p)}" data-type="${esc(t)}">
            ${coverImg(p)}
            <span class="frame"></span>
            <span class="cover-icon">${icon(t)}</span>
            <span class="cover-label">${esc(k.reuse.asset_types.map((x) => LABELS.asset[x] || x).join(" · "))}</span>
            ${saveBtn(p.slug)}
          </div>
          <div class="card-body">
            <div class="row">${resultBadge(p.audit.result)}<span class="tier">${esc(p.audit.tier)}</span></div>
            <h3>${esc(k.meta.project)}</h3>
            <p>${esc(k.meta.summary)}</p>
            <div class="card-meta"><span>${esc(k.reuse.bu)} · ${esc(k.reuse.company)}</span><span class="dl">${icon("download")}${fmt(p.downloads)}</span></div>
          </div>
        </a>`;
    }).join("");
  }

  // ---------- Project detail ----------
  function renderDetail(slug) {
    const p = DATA.projects.find((x) => x.slug === slug);
    if (!p) {
      app.innerHTML = `<a class="back" href="#/">${icon("back")} ผลงานทั้งหมด</a><div class="empty"><b>ไม่พบผลงานนี้</b>อาจถูกถอดออกหรือลิงก์ไม่ถูกต้อง</div>`;
      return;
    }
    const k = p.kabac, r = k.reuse, a = p.audit, t = mainType(p);
    const repo = r.repo_url || "";
    const zip = repo ? `${repo}/archive/refs/heads/main.zip` : "";
    const canUse = a.result === "approved_reusable";

    app.innerHTML = `
      <a class="back" href="#/">${icon("back")} ผลงานทั้งหมด</a>
      <section class="cover detail-cover ${coverCls(p)}" data-type="${esc(t)}">
        ${coverImg(p)}
        <span class="frame"></span>
        <span class="cover-icon">${icon(t)}</span>
        ${saveBtn(p.slug)}
        <div class="cover-inner">
          <div class="row">${resultBadge(a.result)}<span class="tier">${esc(a.tier)} · ${esc(LABELS.tier[a.tier])}</span><span class="chip">v${esc(p.version)}</span>${chips(r.asset_types, LABELS.asset)}</div>
          <h1 class="gold-text">${esc(k.meta.project)}</h1>
          <p>${esc(k.meta.summary)}</p>
          <div class="actions">
            ${zip ? `<a class="btn primary" href="${esc(zip)}">${icon("download")} ดาวน์โหลดโค้ด</a>` : ""}
            ${repo ? `<a class="btn" href="${esc(repo)}" target="_blank" rel="noopener">${icon("external")} เปิด Repository</a>` : ""}
          </div>
        </div>
      </section>
      ${canUse ? "" : `<div class="notice">${icon("info")}<div><b>ดูเป็นตัวอย่างเท่านั้น</b> · ผลงานนี้ยังไม่อนุญาตให้นำไปใช้กับข้อมูลจริง ถ้าต้องการใช้ ให้ติดต่อผู้ดูแลเพื่อขอตรวจเพิ่ม</div></div>`}
      <div class="layout">
        <section class="canvas" aria-label="KABAC Canvas">
          <div class="canvas-title"><h2>KABAC Canvas</h2><span>${esc(k.meta.owner)} · ${esc(k.meta.status)} · ${esc(k.meta.date)}</span></div>
          <div class="layer-label">Business Layer</div>
          <div class="blocks">
            ${BLOCKS.map(([key, title]) => `
              <div class="block"><h4>${esc(title)}</h4>
                <ul>${(k.business[key] || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>
              </div>`).join("")}
          </div>
          <div class="layer-label tech">Technical Decision Layer (ADR)</div>
          <div class="adr-wrap">
            <table class="adr">
              <thead><tr><th>ADR &amp; Decision Area</th><th>Selected Architecture</th><th>Business &amp; Tech Rationale</th><th>Trade-offs &amp; Mitigations</th></tr></thead>
              <tbody>${k.adr.map((d) => `
                <tr>
                  <td>${esc(d.id)}<small>${esc(d.area)}</small></td>
                  <td>${esc(d.selected_architecture)}</td>
                  <td>${esc(d.rationale)}<span class="links row">${d.links_to.map((l) => `<span class="chip">↑ ${esc(BLOCK_NAME[l] || l)}</span>`).join("")}</span></td>
                  <td>${esc(d.tradeoffs_mitigations)}</td>
                </tr>`).join("")}</tbody>
            </table>
          </div>
        </section>
        <aside>
          <div class="panel">
            <h3>${icon("shield")} ผลการตรวจ</h3>
            <ul class="checks">
              <li><i>✓</i>ตรวจอัตโนมัติ 6 ข้อผ่าน</li>
              ${(a.reviewed_by || []).map((x) => `<li><i>✓</i>${esc(LABELS.reviewer[x] || x)}</li>`).join("")}
            </ul>
            <dl class="kv">
              <dt>ตรวจเมื่อ</dt><dd>${esc(a.reviewed_at || "-")}</dd>
              <dt>ตรวจซ้ำ</dt><dd>${esc(a.next_review || "-")}</dd>
            </dl>
          </div>
          <div class="panel">
            <h3>${icon("pkg")} ข้อมูลการนำไปใช้</h3>
            <dl class="kv">
              <dt>ระดับ</dt><dd>${esc(LABELS.reuse[r.reuse_level])}</dd>
              <dt>ข้อมูลที่ใช้</dt><dd>${esc(LABELS.data[r.data_classification])}</dd>
              <dt>เชื่อมระบบภายใน</dt><dd>${r.connects_internal_systems ? "ใช่" : "ไม่"}</dd>
              <dt>ผลต่อการตัดสินใจ</dt><dd>${esc(LABELS.decision[r.decision_impact])}</dd>
              <dt>AI ที่ใช้</dt><dd>${esc(r.ai_vendor_model.join(", "))}</dd>
              <dt>License</dt><dd>${esc(r.license)}</dd>
            </dl>
          </div>
          <div class="panel">
            <h3>${icon("user")} ผู้ดูแล</h3>
            <dl class="kv">
              <dt>ทีม</dt><dd>${esc(r.maintainer)}</dd>
              <dt>BU</dt><dd>${esc(r.bu)}</dd>
              <dt>บริษัท</dt><dd>${esc(r.company)}</dd>
              <dt>การดูแล</dt><dd>${esc(LABELS.support[r.support])}</dd>
            </dl>
          </div>
        </aside>
      </div>`;
  }

  // ---------- Submit guide ----------
  function renderSubmit() {
    app.innerHTML = `
      <section class="hero">
        <h1 class="hero-title">Share your work</h1>
        <p class="hero-sub">มีโปรเจกต์ AI ที่ทำแล้วได้ผล? แชร์ให้ทั้งเครือได้ใช้ ใช้เวลาเตรียมประมาณ 30 นาที</p>
      </section>
      <div class="steps">
        <div class="step"><h3>คัดลอก Template</h3><p>สร้าง repo ใหม่จากโฟลเดอร์ <a href="${REPO}/tree/main/template" target="_blank" rel="noopener">template</a> แล้วใส่โค้ด, Skill หรือ Prompt ของคุณ</p></div>
        <div class="step"><h3>กรอก KABAC</h3><p>อธิบายปัญหา คุณค่า และการตัดสินใจทางเทคนิคใน kabac.yaml ดู<a href="${REPO}/blob/main/docs/KABAC-MANUAL.md" target="_blank" rel="noopener">คู่มือ</a>และตัวอย่างในเว็บนี้</p></div>
        <div class="step"><h3>รอตรวจอัตโนมัติ</h3><p>เมื่อ push ขึ้น GitHub ระบบจะตรวจ Secret, ช่องโหว่, ข้อมูลส่วนบุคคล และ Skill อันตรายให้ทันที</p></div>
        <div class="step"><h3>ส่งเข้าระบบ</h3><p>กรอก<a href="${REPO}/issues/new?template=submission.yml" target="_blank" rel="noopener">ฟอร์มส่งผลงาน</a> ทีมตรวจตามระดับความเสี่ยง แล้วผลงานจะขึ้นหน้านี้</p></div>
      </div>
      <div class="section-head"><div><h2>ใช้เวลาตรวจนานเท่าไร</h2><p>ขึ้นกับระดับความเสี่ยงที่คำนวณจาก KABAC ของคุณ</p></div></div>
      <div class="table-scroll"><table class="tiers">
        <thead><tr><th>ระดับ</th><th>ผลงานแบบไหน</th><th>ใครตรวจ</th><th>ระยะเวลา</th></tr></thead>
        <tbody>
          <tr><td><span class="tier">T1</span> ความเสี่ยงต่ำ</td><td>ใช้ข้อมูล Public/Internal ไม่เชื่อมระบบภายใน</td><td>AI CoE</td><td>3 วันทำการ</td></tr>
          <tr><td><span class="tier">T2</span> ความเสี่ยงกลาง</td><td>ใช้ข้อมูล Confidential หรือเชื่อมระบบภายใน</td><td>AI CoE + Security</td><td>7 วันทำการ</td></tr>
          <tr><td><span class="tier">T3</span> ความเสี่ยงสูง</td><td>มีข้อมูลส่วนบุคคล หรือมีผลต่อการเงิน/HR</td><td>+ DPO / Legal / Compliance</td><td>14 วันทำการ</td></tr>
        </tbody>
      </table></div>`;
  }

  // ---------- Shell: rail, icons, router ----------
  document.getElementById("rail").innerHTML = RAIL.map((item) => item
    ? `<a href="${item[0]}" data-route="${item[0]}">${icon(item[1])}<span>${esc(item[2])}</span></a>`
    : "<hr>").join("");
  document.querySelectorAll("[data-icon]").forEach((el) => el.insertAdjacentHTML("afterbegin", icon(el.dataset.icon)));

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-save]");
    if (!btn) return;
    e.preventDefault(); e.stopPropagation();
    const slug = btn.dataset.save;
    saved.has(slug) ? saved.delete(slug) : saved.add(slug);
    persistSaved();
    document.querySelectorAll(`[data-save="${CSS.escape(slug)}"]`).forEach((b) => {
      b.classList.toggle("on", saved.has(slug));
      b.setAttribute("aria-pressed", saved.has(slug));
    });
    if (location.hash === "#/saved") route();
  });
  document.getElementById("top-search").addEventListener("click", () => {
    if (!/^#\/(t\/|saved|$)|^$|^#\/?$/.test(location.hash)) location.hash = "#/";
    setTimeout(() => { const q = document.getElementById("q"); if (q) { q.scrollIntoView({ block: "center" }); q.focus(); } }, 50);
  });

  function route() {
    const hash = location.hash.replace(/^#/, "") || "/";
    let active = "#/";
    let m;
    if ((m = hash.match(/^\/p\/(.+)$/))) renderDetail(decodeURIComponent(m[1]));
    else if ((m = hash.match(/^\/t\/(\w+)$/))) { active = `#/t/${m[1]}`; renderCatalog({ type: m[1] }); }
    else if (hash === "/saved") { active = "#/saved"; renderCatalog({ savedOnly: true }); }
    else if (hash === "/submit") { active = "#/submit"; renderSubmit(); }
    else renderCatalog();
    document.querySelectorAll("[data-route]").forEach((a) => {
      const on = a.dataset.route === active;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
  }

  document.getElementById("demo-banner").hidden = !DATA.demo;
  persistSaved();
  window.addEventListener("hashchange", route);
  route();
})();
