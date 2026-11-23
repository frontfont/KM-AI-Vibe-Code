# Audit Checklist

ใช้คู่กับผลจาก workflow `vibe-audit` ผู้ตรวจคัดลอก checklist นี้ไปวางใน Issue ของผลงานที่ตรวจ แล้วติ๊กทีละข้อ
Tier คำนวณจาก `kabac.yaml` (ดู [KABAC-MANUAL.md](KABAC-MANUAL.md#ส่วนที่-3-reuse--compliance-เพิ่มใหม่สำหรับ-hub))

## A. ตรวจอัตโนมัติ (ทุก Tier — ต้องผ่านก่อนเริ่มตรวจด้วยคน)

- [ ] `kabac` — kabac.yaml ผ่าน schema
- [ ] `secrets` — Gitleaks ไม่พบ secret
- [ ] `sast` — Semgrep ไม่พบ finding ระดับ ERROR
- [ ] `dependencies` — Trivy ไม่พบช่องโหว่ HIGH/CRITICAL ที่ยังไม่ได้แก้
- [ ] `pii` — ไม่พบเลขบัตรประชาชน/เบอร์โทร/อีเมลจริงในไฟล์
- [ ] `skills` — ไม่พบคำสั่งอันตรายใน Skills/Prompts หรือถ้าพบ ผู้ส่งชี้แจงได้

## B. T1 — AI CoE (ทุกผลงาน)

**คุณภาพ KABAC**
- [ ] Problem & Value ชัดเจน วัดผลได้
- [ ] ทุก ADR เชื่อมกับช่อง Business Layer ได้จริง
- [ ] Trade-offs ไม่ถูกซ่อน
- [ ] README ทำตามแล้วติดตั้งได้จริงภายใน ~5 นาที

**Skills / Prompts / Agents**
- [ ] อ่าน Skill ทุกไฟล์แล้ว ไม่มีคำสั่งส่งข้อมูลออกนอกองค์กร หรืออ่าน credential
- [ ] สิทธิ์ที่ Agent ใช้ (tool, shell, network) น้อยที่สุดเท่าที่จำเป็น
- [ ] ไม่มีข้อความที่สั่งให้โมเดลข้ามนโยบายความปลอดภัย
- [ ] Prompt ที่รับ input จากผู้ใช้หรือเอกสารภายนอก มีการป้องกัน prompt injection

**Safety**
- [ ] มี Human-in-the-loop ในจุดที่ผลลัพธ์มีผลต่อคนหรือเงิน
- [ ] ระบุข้อจำกัด/โอกาส hallucination ใน README หรือ UI
- [ ] มีวิธีปิดหรือถอดระบบเมื่อมีปัญหา (kill switch)

## C. T2 — + Security

- [ ] การเชื่อมต่อระบบภายในใช้ service account แยก สิทธิ์ต่ำสุด
- [ ] Secret เก็บใน Vault/Secret Manager ไม่อยู่ในโค้ดหรือ `.env` ที่ commit
- [ ] Logging ไม่บันทึกข้อมูล Confidential หรือ prompt ที่มีข้อมูลลับ
- [ ] ข้อมูล Confidential ที่ส่งไปยัง AI vendor อยู่ภายใต้สัญญา/Zero data retention ที่องค์กรอนุมัติ
- [ ] มีการทำ Threat model ย่อ (อย่างน้อย: prompt injection, data exfiltration, privilege escalation)

## D. T3 — + DPO / Legal / Compliance

**PDPA**
- [ ] ระบุฐานทางกฎหมาย (lawful basis) ในการประมวลผลข้อมูลส่วนบุคคล
- [ ] ข้อมูลส่วนบุคคลถูกส่งออกนอกประเทศหรือไม่ ถ้าใช่ มีมาตรการตามมาตรา 28–29
- [ ] มี Data retention / การลบข้อมูล
- [ ] ทำ DPIA แล้ว (กรณีความเสี่ยงสูง)

**Regulation รายอุตสาหกรรม** (เลือกที่เกี่ยวข้อง)
- [ ] ธปท. — แนวปฏิบัติด้าน IT Risk / การใช้ AI ในสถาบันการเงิน
- [ ] คปภ. — สำหรับธุรกิจประกัน
- [ ] ก.ล.ต. — สำหรับบริษัทจดทะเบียน / ธุรกิจหลักทรัพย์
- [ ] แนวทาง AI Governance ของ ETDA และนโยบาย AI ภายในองค์กร

**การตัดสินใจที่มีผลต่อบุคคล**
- [ ] ผลลัพธ์ที่มีผลทางการเงินหรือ HR มีคนตัดสินใจขั้นสุดท้ายเสมอ
- [ ] ตรวจ bias ในข้อมูลหรือผลลัพธ์แล้ว
- [ ] อธิบายผลลัพธ์ให้ผู้ได้รับผลกระทบเข้าใจได้

## E. ผลการตรวจ

| ผล | ความหมาย |
|---|---|
| 🟢 **Approved – Reusable** | BU อื่นนำไปใช้กับข้อมูลจริงได้ |
| 🟡 **Approved – Showcase only** | ดูเป็นตัวอย่างได้ ห้ามนำไปใช้กับข้อมูลจริงจนกว่าจะตรวจซ้ำ |
| 🔴 **Rejected** | ระบุสิ่งที่ต้องแก้ แล้วส่งใหม่ได้ |
