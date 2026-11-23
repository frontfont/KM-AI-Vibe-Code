# Security & Data Declaration

กรอกให้ตรงกับ `reuse` ใน `kabac.yaml` ผู้ตรวจจะใช้ไฟล์นี้ประกอบการ Audit

## ข้อมูลที่ใช้

| แหล่งข้อมูล | ประเภท (public/internal/confidential/restricted_pii) | ส่งไปยัง AI vendor หรือไม่ |
|---|---|---|
| ... | ... | ใช่ / ไม่ |

## AI Vendor / Model

- Vendor / Model: ...
- ข้อมูลข้ามพรมแดนหรือไม่: ...
- สัญญา / Data retention: ...

## สิทธิ์ที่ระบบหรือ Agent ต้องใช้

- Network (โดเมนที่เรียก): ...
- Shell / File system: ...
- ระบบภายในที่เชื่อมต่อ: ...

## Secrets

ใช้ตัวแปรใน `.env.example` เท่านั้น **ห้าม commit secret จริง**

## Guardrails

- Human-in-the-loop: ...
- วิธีปิดระบบเมื่อมีปัญหา (kill switch): ...

## แจ้งปัญหาด้านความปลอดภัย

ติดต่อ: ...
