// Vibe Coding Hub prototype — static single-page app reading window.HUB_DATA.
(function () {
  "use strict";

  const DATA = window.HUB_DATA || { projects: [] };
  const app = document.getElementById("app");
  const REPO = "https://github.com/frontfont/km-ai-vibe-code";

  const LABELS = {
    asset: { app: "App", skill: "Skill", prompt: "Prompt", agent: "Agent", script: "Script", workflow: "Workflow" },
    data: { public: "Public", internal: "Internal", confidential: "Confidential", restricted_pii: "ข้อมูลส่วนบุคคล" },
    reuse: { showcase_only: "ดูเป็นตัวอย่าง", reusable: "นำไปใช้ต่อได้", production_ready: "พร้อมใช้งานจริง" },
    support: { none: "ไม่มีการดูแล", best_effort: "ดูแลตามความสะดวก", supported: "มีทีมดูแล" },
    decision: { none: "ไม่มี", assistive: "ช่วยตัดสินใจ", financial_or_hr: "มีผลการเงิน/HR" },
    result: {
      approved_reusable: ["🟢 ผ่าน · นำไปใช้ได้", "ok"],
      approved_showcase: ["🟡 ผ่าน · ดูเป็นตัวอย่างเท่านั้น", "warn"],
      rejected: ["🔴 ไม่ผ่าน", "bad"],
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

  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const resultBadge = (r) => {
    const [label, cls] = LABELS.result[r] || ["รอตรวจ", "warn"];
    return `<span class="badge ${cls}">${esc(label)}</span>`;
  };
  const chips = (items, map) => items.map((i) => `<span class="chip">${esc(map ? map[i] || i : i)}</span>`).join("");
  const uniq = (arr) => [...new Set(arr)].sort();

  // ---------- Home / catalog ----------
  const state = { q: "", bu: "", type: "", result: "" };

  function renderHome() {
    const ps = DATA.projects;
    const bus = uniq(ps.map((p) => p.kabac.reuse.bu));
    const types = uniq(ps.flatMap((p) => p.kabac.reuse.asset_types));
    const totalDownloads = ps.reduce((s, p) => s + (p.downloads || 0), 0);
    const companies = uniq(ps.map((p) => p.kabac.reuse.company)).length;

    app.innerHTML = `
      <section class="hero">
        <h1>ผลงาน AI Vibe Coding จากทุก BU ในเครือ</h1>
        <p>ค้นหาแอป, Skill, Prompt และ Agent ที่เพื่อนร่วมองค์กรสร้างไว้ ทุกชิ้นผ่านการตรวจด้าน Security และ Regulation แล้ว ดาวน์โหลดไปใช้ต่อได้ทันที</p>
        <div class="stats">
          <div class="stat"><b>${ps.length}</b><span>ผลงาน</span></div>
          <div class="stat"><b>${companies}</b><span>บริษัทในเครือ</span></div>
          <div class="stat"><b>${totalDownloads.toLocaleString("th-TH")}</b><span>ครั้งที่ถูกนำไปใช้</span></div>
        </div>
      </section>
      <div class="filters">
        <input id="q" type="search" placeholder="ค้นหา เช่น สรุปประชุม, RAG, finance" value="${esc(state.q)}" aria-label="ค้นหา">
        <select id="bu" aria-label="BU"><option value="">ทุก BU</option>${bus.map((b) => `<option ${state.bu === b ? "selected" : ""}>${esc(b)}</option>`).join("")}</select>
        <select id="type" aria-label="ประเภท"><option value="">ทุกประเภท</option>${types.map((t) => `<option value="${esc(t)}" ${state.type === t ? "selected" : ""}>${esc(LABELS.asset[t] || t)}</option>`).join("")}</select>
        <select id="result" aria-label="ผลการตรวจ">
          <option value="">ทุกผลการตรวจ</option>
          <option value="approved_reusable" ${state.result === "approved_reusable" ? "selected" : ""}>นำไปใช้ได้</option>
          <option value="approved_showcase" ${state.result === "approved_showcase" ? "selected" : ""}>ดูเป็นตัวอย่าง</option>
        </select>
      </div>
      <div id="grid" class="grid"></div>`;

    for (const id of ["q", "bu", "type", "result"]) {
      document.getElementById(id).addEventListener("input", (e) => { state[id] = e.target.value; renderGrid(); });
    }
    renderGrid();
  }

  function matches(p) {
    const k = p.kabac;
    if (state.bu && k.reuse.bu !== state.bu) return false;
    if (state.type && !k.reuse.asset_types.includes(state.type)) return false;
    if (state.result && p.audit.result !== state.result) return false;
    if (!state.q) return true;
    const hay = [k.meta.project, k.meta.summary, k.meta.owner, k.reuse.bu, ...(k.reuse.tags || []),
      ...Object.values(k.business).flat()].join(" ").toLowerCase();
    return state.q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
  }

  function renderGrid() {
    const list = DATA.projects.filter(matches).sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    const grid = document.getElementById("grid");
    if (!list.length) { grid.innerHTML = `<div class="empty">ไม่พบผลงานที่ตรงกับการค้นหา</div>`; return; }
    grid.innerHTML = list.map((p) => {
      const k = p.kabac;
      return `
        <a class="card" href="#/p/${encodeURIComponent(p.slug)}">
          <div class="row">${resultBadge(p.audit.result)}<span class="tier">${esc(p.audit.tier)}</span></div>
          <h3>${esc(k.meta.project)}</h3>
          <p>${esc(k.meta.summary)}</p>
          <div class="row">${chips(k.reuse.asset_types, LABELS.asset)}</div>
          <div class="card-meta"><span>${esc(k.reuse.bu)} · ${esc(k.reuse.company)}</span><span>⬇ ${p.downloads || 0}</span></div>
        </a>`;
    }).join("");
  }

  // ---------- Project detail ----------
  function renderDetail(slug) {
    const p = DATA.projects.find((x) => x.slug === slug);
    if (!p) { app.innerHTML = `<a class="back" href="#/">← กลับ</a><div class="empty">ไม่พบผลงานนี้</div>`; return; }
    const k = p.kabac, r = k.reuse, a = p.audit;
    const repo = r.repo_url || "";
    const zip = repo ? `${repo}/archive/refs/heads/main.zip` : "";
    const canUse = a.result === "approved_reusable";

    app.innerHTML = `
      <a class="back" href="#/">← ผลงานทั้งหมด</a>
      <div class="detail-head">
        <div>
          <div class="row">${resultBadge(a.result)}<span class="tier">${esc(a.tier)} · ${esc(LABELS.tier[a.tier])}</span><span class="chip">v${esc(p.version)}</span></div>
          <h1>${esc(k.meta.project)}</h1>
          <p>${esc(k.meta.summary)}</p>
        </div>
        <div class="actions">
          ${zip ? `<a class="btn primary" href="${esc(zip)}">⬇ ดาวน์โหลดโค้ด</a>` : ""}
          ${repo ? `<a class="btn" href="${esc(repo)}" target="_blank" rel="noopener">เปิด Repository</a>` : ""}
        </div>
      </div>
      ${canUse ? "" : `<div class="panel" style="margin-bottom:16px;border-color:var(--warn-fg)"><b>ดูเป็นตัวอย่างเท่านั้น:</b> ผลงานนี้ยังไม่อนุญาตให้นำไปใช้กับข้อมูลจริง ถ้าต้องการใช้ ให้ติดต่อผู้ดูแลเพื่อขอตรวจเพิ่ม</div>`}
      <div class="layout">
        <section class="canvas" aria-label="KABAC Canvas">
          <div class="canvas-title">KABAC Canvas <span>Owner: ${esc(k.meta.owner)} · Status: ${esc(k.meta.status)} · ${esc(k.meta.date)}</span></div>
          <div class="layer-label biz">Business Layer</div>
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
                  <td>${esc(d.id)}<br><span style="font-weight:400">${esc(d.area)}</span></td>
                  <td>${esc(d.selected_architecture)}</td>
                  <td>${esc(d.rationale)}<span class="links row">${d.links_to.map((l) => `<span class="chip">↑ ${esc(BLOCK_NAME[l] || l)}</span>`).join("")}</span></td>
                  <td>${esc(d.tradeoffs_mitigations)}</td>
                </tr>`).join("")}</tbody>
            </table>
          </div>
        </section>
        <aside>
          <div class="panel">
            <h3>ข้อมูลการนำไปใช้</h3>
            <dl class="kv">
              <dt>ประเภท</dt><dd>${r.asset_types.map((t) => esc(LABELS.asset[t] || t)).join(", ")}</dd>
              <dt>ระดับ</dt><dd>${esc(LABELS.reuse[r.reuse_level])}</dd>
              <dt>ข้อมูลที่ใช้</dt><dd>${esc(LABELS.data[r.data_classification])}</dd>
              <dt>เชื่อมระบบภายใน</dt><dd>${r.connects_internal_systems ? "ใช่" : "ไม่"}</dd>
              <dt>ผลต่อการตัดสินใจ</dt><dd>${esc(LABELS.decision[r.decision_impact])}</dd>
              <dt>AI ที่ใช้</dt><dd>${esc(r.ai_vendor_model.join(", "))}</dd>
              <dt>License</dt><dd>${esc(r.license)}</dd>
            </dl>
          </div>
          <div class="panel">
            <h3>ผู้ดูแล</h3>
            <dl class="kv">
              <dt>ทีม</dt><dd>${esc(r.maintainer)}</dd>
              <dt>BU</dt><dd>${esc(r.bu)}</dd>
              <dt>บริษัท</dt><dd>${esc(r.company)}</dd>
              <dt>การดูแล</dt><dd>${esc(LABELS.support[r.support])}</dd>
            </dl>
          </div>
          <div class="panel">
            <h3>ผลการตรวจ</h3>
            <ol class="steps-small">
              <li class="done">✓ ตรวจอัตโนมัติ 6 ข้อผ่าน</li>
              ${(a.reviewed_by || []).map((x) => `<li class="done">✓ ${esc(LABELS.reviewer[x] || x)}</li>`).join("")}
            </ol>
            <dl class="kv" style="margin-top:10px">
              <dt>ตรวจเมื่อ</dt><dd>${esc(a.reviewed_at || "-")}</dd>
              <dt>ตรวจซ้ำ</dt><dd>${esc(a.next_review || "-")}</dd>
            </dl>
          </div>
        </aside>
      </div>`;
  }

  // ---------- Submit guide ----------
  function renderSubmit() {
    app.innerHTML = `
      <section class="hero">
        <h1>ส่งผลงานของคุณ</h1>
        <p>มีโปรเจกต์ AI ที่ทำแล้วได้ผล? แชร์ให้ทั้งเครือได้ใช้ ใช้เวลาเตรียมประมาณ 30 นาที</p>
      </section>
      <div class="steps">
        <div class="step"><h3>คัดลอก Template</h3><p>สร้าง repo ใหม่จากโฟลเดอร์ <a href="${REPO}/tree/main/template" target="_blank" rel="noopener">template</a> แล้วใส่โค้ด, Skill หรือ Prompt ของคุณ</p></div>
        <div class="step"><h3>กรอก KABAC</h3><p>อธิบายปัญหา คุณค่า และการตัดสินใจทางเทคนิคใน <code>kabac.yaml</code> ดู<a href="${REPO}/blob/main/docs/KABAC-MANUAL.md" target="_blank" rel="noopener">คู่มือ</a>และตัวอย่างในเว็บนี้</p></div>
        <div class="step"><h3>รอตรวจอัตโนมัติ</h3><p>เมื่อ push ขึ้น GitHub ระบบจะตรวจ Secret, ช่องโหว่, ข้อมูลส่วนบุคคล และ Skill อันตรายให้ทันที</p></div>
        <div class="step"><h3>ส่งเข้าระบบ</h3><p>กรอก<a href="${REPO}/issues/new?template=submission.yml" target="_blank" rel="noopener">ฟอร์มส่งผลงาน</a> ทีมตรวจตามระดับความเสี่ยง แล้วผลงานจะขึ้นหน้านี้</p></div>
      </div>
      <h2 class="section-title">ใช้เวลาตรวจนานเท่าไร</h2>
      <div class="table-scroll"><table class="tiers">
        <thead><tr><th>ระดับ</th><th>ผลงานแบบไหน</th><th>ใครตรวจ</th><th>ระยะเวลา</th></tr></thead>
        <tbody>
          <tr><td><b>T1</b> ความเสี่ยงต่ำ</td><td>ใช้ข้อมูล Public/Internal ไม่เชื่อมระบบภายใน</td><td>AI CoE</td><td>3 วันทำการ</td></tr>
          <tr><td><b>T2</b> ความเสี่ยงกลาง</td><td>ใช้ข้อมูล Confidential หรือเชื่อมระบบภายใน</td><td>AI CoE + Security</td><td>7 วันทำการ</td></tr>
          <tr><td><b>T3</b> ความเสี่ยงสูง</td><td>มีข้อมูลส่วนบุคคล หรือมีผลต่อการเงิน/HR</td><td>+ DPO / Legal / Compliance</td><td>14 วันทำการ</td></tr>
        </tbody>
      </table></div>`;
  }

  // ---------- Router ----------
  function route() {
    const hash = location.hash.replace(/^#/, "") || "/";
    const m = hash.match(/^\/p\/(.+)$/);
    document.querySelectorAll("[data-nav]").forEach((a) =>
      a.classList.toggle("active", (a.dataset.nav === "submit") === hash.startsWith("/submit")));
    if (m) renderDetail(decodeURIComponent(m[1]));
    else if (hash.startsWith("/submit")) renderSubmit();
    else renderHome();
    window.scrollTo(0, 0);
  }

  document.getElementById("demo-banner").hidden = !DATA.demo;
  window.addEventListener("hashchange", route);
  route();
})();
