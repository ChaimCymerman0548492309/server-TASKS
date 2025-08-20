

# 📌 API Endpoints & Webhook

## 1. `POST /jobs`

יוצר ג׳וב חדש לביצוע ברקע.

* **Headers**

  * `Content-Type: application/json`
  * `Idempotency-Key: <unique-string>` (חובה)

* **Request Body**

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

* **Response (201 Created)**

```json
{
  "jobId": "job_abc123",
  "status": "queued",
  "createdAt": "2025-08-20T10:00:00Z"
}
```

* **Error Responses**

  * `400 Bad Request` – אם חסר שדה חובה.
  * `401 Unauthorized` – Tenant לא מורשה.
  * `409 Conflict` – `Idempotency-Key` קיים עם Payload שונה.
  * `429 Too Many Requests` – עברו את המכסה לדייר (Rate limit).

---

## 2. `GET /jobs/{jobId}`

בודק את מצב הג׳וב.

* **Example Request**

```
GET /jobs/job_abc123
```

* **Response (200 OK)**

```json
{
  "jobId": "job_abc123",
  "status": "running",
  "attempts": 1,
  "nextRunAt": "2025-08-20T10:01:00Z",
  "createdAt": "2025-08-20T10:00:00Z",
  "updatedAt": "2025-08-20T10:00:30Z"
}
```

* **Status Values**

  * `queued` – ממתין לביצוע.
  * `running` – כרגע מעובד.
  * `retry` – נכשל, יבוצע שוב.
  * `succeeded` – הסתיים בהצלחה.
  * `fatal` – נכשל אחרי כל הניסיונות.

* **Error Responses**

  * `401 Unauthorized` – Tenant לא מורשה.
  * `404 Not Found` – לא נמצא ג׳וב עם `jobId`.

---

## 3. **Webhook (Outbound)**

כאשר ג׳וב מסתיים (בהצלחה או כישלון), השירות ישלח קריאת **POST** ל־Webhook URL שהוגדר ב־`POST /jobs`.

* **Headers**

  * `Content-Type: application/json`
  * `X-Signature: sha256=<hmac>` (לחתימה, ניתן להוסיף מאוחר יותר)

* **Request Body Example**

```json
{
  "jobId": "job_abc123",
  "status": "succeeded",
  "attempts": 1,
  "payload": {
    "to": "user@example.com",
    "subject": "Hello",
    "body": "Welcome!"
  },
  "completedAt": "2025-08-20T10:02:00Z"
}
```

* **Expected Response**

```http
200 OK
```

* **Retry Policy**

  * אם ה־Webhook נכשל, נעשים עד **3 ניסיונות** עם backoff: 30s → 60s → 120s.
  * אם נכשל בכל הניסיונות → נשלח ל־DLQ (Dead Letter Queue).

---

## 4. **Error Model**

| Status Code | מתי מוחזר                            |
| ----------- | ------------------------------------ |
| **400**     | נתונים חסרים / פורמט לא תקין         |
| **401**     | Tenant לא מורשה                      |
| **404**     | Job לא קיים                          |
| **409**     | Idempotency-Key כפול עם Payload שונה |
| **429**     | עברו את המכסה ל־Tenant (Rate limit)  |


