

# 📌 Idempotency

Idempotency מבטיח שקריאות כפולות ל־`POST /jobs` לא יגרמו ליצירה של מספר ג׳ובים זהים.

## 🔑 חוקי Idempotency

* ייחודיות נקבעת לפי **`(tenantId, Idempotency-Key)`**.
* אותו `Idempotency-Key` + אותו Payload → המערכת תחזיר את אותו `jobId` שכבר נוצר.
* אותו `Idempotency-Key` + **Payload שונה** → יוחזר שגיאה `409 Conflict`.

## 📝 דוגמה – אותה בקשה פעמיים

**Request 1**

```http
POST /jobs
Idempotency-Key: abc123
```

```json
{
  "tenantId": "tenant_123",
  "type": "email",
  "payload": {
    "to": "user@example.com",
    "subject": "Hello",
    "body": "Welcome!"
  },
  "webhookUrl": "https://client.app/webhooks/job"
}
```

**Response 1**

```json
{
  "jobId": "job_abc123",
  "status": "queued",
  "createdAt": "2025-08-20T10:00:00Z"
}
```

**Request 2 (אותו Key + אותו Payload)**

```http
POST /jobs
Idempotency-Key: abc123
```

```json
{
  "tenantId": "tenant_123",
  "type": "email",
  "payload": {
    "to": "user@example.com",
    "subject": "Hello",
    "body": "Welcome!"
  },
  "webhookUrl": "https://client.app/webhooks/job"
}
```

**Response 2 (200 OK – מחזיר אותו ג׳וב)**

```json
{
  "jobId": "job_abc123",
  "status": "queued",
  "createdAt": "2025-08-20T10:00:00Z"
}
```

---

## ❌ דוגמה – אותו Key עם Payload שונה

**Request**

```http
POST /jobs
Idempotency-Key: abc123
```

```json
{
  "tenantId": "tenant_123",
  "type": "sms",
  "payload": {
    "phone": "+972501234567",
    "text": "Hello!"
  },
  "webhookUrl": "https://client.app/webhooks/job"
}
```

**Response**

```json
{
  "error": "Conflict",
  "message": "Idempotency-Key already used with different payload",
  "code": 409
}
```

---

## ⚙️ מימוש

* לפני החזרת תשובה (`200/201`), נעשית **כתיבה ל־DB** של רשומת הג׳וב.
* קיים אינדקס ייחודי על `(tenantId, idempotencyKey)`.
* כתיבה זו מבטיחה שהשירות **עמיד ל־Crash/Restart** – גם אם התהליך מתנתק אחרי ההכנסה ל־DB, המידע נשמר.

