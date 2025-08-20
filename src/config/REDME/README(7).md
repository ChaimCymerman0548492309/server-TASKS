

# ⚙️ Non-Functional Requirements (NFRs)

### 1. Latency Goals

| Operation           | Typical Target |
| ------------------- | -------------- |
| `POST /jobs`        | ≤ 500 ms       |
| `GET /jobs/{jobId}` | ≤ 300 ms       |

> הערה: לא מדובר ב־SLO מחייב, אלא יעד ביצועים לג׳ובים קטנים (\~1 KB/job).

---

### 2. Durability

* **DB write happens before returning 200/201** → מבטיח שהג׳וב נשמר אפילו אם Worker נופל.
* **Crash-safe DB** – Data committed before acknowledgment.
* Metadata נשמר **7 ימים** בלבד (Retention Policy).

---

### 3. Observability

* **Structured logs** – כולל:

  * `tenantId`, `jobId`, `traceId`, `attempt number`, `status`.
* **Metrics:**

  * Jobs created per minute
  * Job failure rate
  * DLQ size
* **Alerts:**

  * Page ops אם DLQ > 0 ל־5 דקות רצופות.

---

### 4. Security

* כל התקשורת דרך **HTTPS**
* Webhook עם **HMAC signature header** (`X-Signature: sha256=<hmac>`).
* Tenant-level authentication → API מקבל רק בקשות מאושרות.
* Rate limiting per tenant → למנוע עומס חריג או DOS פנימי.

---

### 5. Rate Limiting

* מוגדר לכל **Tenant**
* אם עובר את המכסה → HTTP 429 Too Many Requests.
* מאפשר Burst \~2 RPS לכל Tenant

---

### 6. Reliability & At-Least-Once Processing

* **At-least-once** → Worker או Webhook עלול לבצע Retry, לכן כל פעולה **Idempotent**.
* Queue + Retry + DLQ מבטיח שמטלות לא יאבדו.

---

### 7. Operational Notes

* Backoff values configurable (30s → 60s → 120s)
* Retries מתועדים בלוגים וכוללים סטטוס מפורט
* Webhook failure → DLQ + Alert
* Observability מאפשר troubleshooting מהיר במקרה של failures


