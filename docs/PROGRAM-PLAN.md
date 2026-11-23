# แผนโครงการ: Enterprise Vibe Coding Hub

> สถานะ: Draft · เอกสารนี้เป็นร่างแรก ใช้เป็นจุดตั้งต้นในการคุยกับทีม

## 1. ภาพรวม Flow

```
[1. Submit]  →  [2. Intake Check]  →  [3. Audit]  →  [4. Publish]  →  [5. Reuse & Feedback]
 เจ้าของงาน       ระบบตรวจอัตโนมัติ      คนตรวจตาม Tier    ขึ้นเว็บ Hub        BU อื่นดาวน์โหลด / Fork
 กรอก KABAC       (GitHub Actions)       (Security/Legal)   พร้อม Badge        แจ้งปัญหา / ขอ Feature
 + push GitHub
```

## 2. สิ่งที่ผู้ส่งต้องส่ง (Submission Package)

ทุกคนสร้าง repo จาก [`template/`](../template/) โครงสร้างบังคับ:

```
my-project/
├── kabac.yaml            ← KABAC แบบที่เครื่องอ่านได้ (Hub ดึงไปแสดงผลเอง)
├── KABAC.pdf             ← ฉบับนำเสนอ (ไม่บังคับ)
├── README.md             ← วิธีติดตั้ง/ใช้งาน ภายใน 5 นาที
├── src/                  ← โค้ด
├── skills/               ← Claude Skills / Prompts / Agent configs
├── .env.example          ← ห้ามมี secret จริง
├── docs/demo.gif         ← ภาพหรือวิดีโอสาธิต
└── SECURITY.md           ← ประกาศว่าใช้ข้อมูลประเภทใด และมีข้อจำกัดอะไร
```

### ส่วนที่เพิ่มจาก KABAC เดิม: "7. Reuse & Compliance"

KABAC เดิมเป็นเอกสารออกแบบและตัดสินใจ เมื่อใช้เป็นแคตตาล็อกให้คนอื่นนำโค้ดไปใช้ซ้ำ จึงต้องเพิ่มฟิลด์ที่การ Audit และเว็บ Hub ใช้ (รายละเอียดใน [KABAC-MANUAL.md](KABAC-MANUAL.md#ส่วนที่-3-reuse--compliance-เพิ่มใหม่สำหรับ-hub))

| ฟิลด์ | ตัวอย่าง |
|---|---|
| `bu` / `company` | BU-Retail / บริษัท A |
| `data_classification` | Public / Internal / Confidential / Restricted-PII |
| `ai_vendor_model` | Claude API, Azure OpenAI, On-prem |
| `asset_type` | App / Skill / Prompt / Agent / Script |
| `reuse_level` | Showcase only / Reusable / Production-ready |
| `maintainer` + `support` | ใครดูแล มีการ support หรือไม่ |
| `license` | Internal Group License |

และกำหนดให้ **ADR หมวด Accuracy & Guardrails เป็นข้อบังคับ** (schema ตรวจให้อัตโนมัติ)

## 3. ระบบ GitHub

- ใช้ **GitHub Organization แยก** สำหรับงานที่ส่งเข้ามา แต่ละโปรเจกต์มี repo ของตัวเอง และใช้ repo นี้ (`KM-AI-Vibe-Code`) เป็น repo กลาง
- ลงทะเบียนด้วย **Issue Form** ([submission.yml](../.github/ISSUE_TEMPLATE/submission.yml)) และเพิ่มลง [`registry/projects.yaml`](../registry/projects.yaml) ผ่าน PR เพื่อให้มี audit trail
- ใส่ Branch protection บังคับ Review และเปิด Secret scanning / Push protection ระดับ Org

## 4. Audit แบ่ง 2 ชั้น

### 4.1 ตรวจอัตโนมัติ — [`vibe-audit.yml`](../.github/workflows/vibe-audit.yml)

| ตรวจอะไร | เครื่องมือ |
|---|---|
| KABAC กรอกครบตาม schema + คำนวณ Tier | `scripts/validate_kabac.py` |
| Secret / API Key หลุด | Gitleaks |
| ช่องโหว่ในโค้ด (SAST) | Semgrep |
| Library มีช่องโหว่ | Trivy |
| PII ในไฟล์ (เลขบัตรประชาชนไทย, เบอร์โทร, อีเมล) | `scripts/scan_pii.py` |
| **Skills/Prompts มีคำสั่งอันตราย** | `scripts/scan_skills.py` |

> ⚠️ Skills และ Agent config ทำงานด้วยสิทธิ์ของคนที่นำไปใช้ ถ้า skill มีคำสั่งแอบส่งข้อมูลออก แล้วถูกแจกทั้งเครือ ความเสียหายจะกระจายไปทุกบริษัท

### 4.2 ตรวจด้วยคน แบ่ง Tier ตามความเสี่ยง

| Tier | เงื่อนไข | ผู้ตรวจ | SLA |
|---|---|---|---|
| **T1 – Low** | ไม่แตะข้อมูลจริง ใช้ Public/Internal data | AI CoE | 3 วันทำการ |
| **T2 – Medium** | ใช้ข้อมูล Confidential หรือเชื่อมระบบภายใน | + Security | 7 วันทำการ |
| **T3 – High** | มี PII, ข้อมูลลูกค้า, ใช้ตัดสินใจทางการเงินหรือ HR | + DPO / Legal / Compliance | 14 วันทำการ |

Checklist ฉบับเต็ม: [AUDIT-CHECKLIST.md](AUDIT-CHECKLIST.md)

**ผลการตรวจ** แสดงเป็น Badge บนเว็บ:
🟢 Approved – Reusable · 🟡 Approved – Showcase only (ดูได้ ห้ามนำไปใช้กับข้อมูลจริง) · 🔴 Rejected (แจ้งสิ่งที่ต้องแก้)

## 5. เว็บ Vibe Coding Hub

**ฟีเจอร์หลัก**
- **แคตตาล็อก + ค้นหา/กรอง** ตาม BU, Use case, ประเภท (App/Skill/Prompt), Tech stack, ระดับ Data
- **หน้าโปรเจกต์** แสดง KABAC Canvas ที่สร้างจาก `kabac.yaml` โดยอัตโนมัติ, Badge ผลตรวจ, Demo, ผู้ดูแล, เวอร์ชัน
- **ปุ่ม Download / Fork / Copy Skill** และเก็บ log ว่าใครดาวน์โหลดอะไรไป
- **Reuse counter + Rating + Comment** ใช้วัดผลและเป็นแรงจูงใจให้คนส่งงาน
- **Login ผ่าน SSO** (Entra ID/Okta) ให้เห็นได้เฉพาะคนในเครือ

**สถาปัตยกรรมแบบง่าย:** Next.js หรือ Static site + GitHub API → ดึงข้อมูลจาก `registry/projects.yaml` และ `kabac.yaml` ของแต่ละ repo → Deploy บน Cloud ภายในองค์กร

## 6. บทบาทผู้เกี่ยวข้อง

| บทบาท | หน้าที่ |
|---|---|
| **Submitter** | กรอก KABAC, push code, แก้ตามผลตรวจ |
| **BU Champion** | คัดงานและช่วยคนใน BU ให้ส่งงานได้ครบ |
| **AI CoE (เจ้าของโครงการ)** | ดูแล Template, ตรวจ T1, ดูแลเว็บ |
| **Security / DPO / Legal** | ตรวจ T2–T3 |
| **Platform Team** | ดูแล GitHub Org, CI pipeline, Hosting |

## 7. Lifecycle หลังเผยแพร่

- **เปลี่ยนโค้ด = ตรวจอัตโนมัติใหม่ทุกครั้ง** ถ้าเปลี่ยน Data/Architecture ต้องให้คนตรวจซ้ำ
- **Status** ใช้ค่าตาม KABAC (Draft → Proposed → Accepted → Superseded)
- **Re-audit รายปี** และถ้าไม่มีคนดูแลเกิน 6 เดือน ให้ติดป้าย "Unmaintained"

## 8. แผน Rollout

| Phase | ระยะเวลา | งาน | สถานะ |
|---|---|---|---|
| **0 – Setup** | 3–4 สัปดาห์ | KABAC เป็น YAML, Template repo, CI pipeline, Audit checklist | 🟡 กำลังทำ |
| **1 – Pilot** | 1–2 เดือน | 1–2 BU ส่งงาน 10–20 ชิ้น เพื่อปรับ process | ⬜ |
| **2 – Hub v1** | 1–2 เดือน | เปิดเว็บภายในเครือ และจัด Showcase Day | ⬜ |
| **3 – Scale** | ต่อเนื่อง | เปิดทุก BU และบริษัทในเครือ, Leaderboard, รางวัล | ⬜ |

## 9. เรื่องที่ต้องตัดสินใจ (Open Questions)

1. **สิทธิ์ทรัพย์สินทางปัญญาข้ามบริษัทในเครือ** บริษัทลูกเป็นนิติบุคคลแยกกัน การแชร์โค้ดข้ามบริษัทอาจต้องมี Intercompany License
2. **ใครรับผิดชอบเมื่อโค้ดที่นำไปใช้ซ้ำมีปัญหา** แนะนำให้ระบุชัดว่า "As-is, best-effort support"
3. **ใช้ GitHub Enterprise หรือไม่** และบริษัทในเครืออยู่ใน tenant เดียวกันหรือไม่
4. **รับเฉพาะงานที่ใช้งานจริงแล้ว หรือรับ Prototype ด้วย**
