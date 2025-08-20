

# 🔁 Retry Mechanism & Backoff

מערכת הג׳ובים תומכת ב־**Retry חכם** לכל משימה ול־Webhook, עם Backoff מדורג כדי למנוע עומס על Workers או Webhook endpoints.

---

## 1. Job Retry (Background Worker)

* **Max attempts:** 3
* **Backoff schedule:**

  | Attempt | Wait time |
  | ------- | --------- |
  | 1       | 30s       |
  | 2       | 60s       |
  | 3       | 120s      |
* **Idempotency:**

  * כל ניסיון הוא **idempotent**, כלומר חזרה על ניסיון לא תגרום ל־double-processing.
  * Status מתעדכן ב־DB (`queued → running → retry → succeeded/fatal`).

**Flow Example:**

```mermaid
sequenceDiagram
    Worker ->> Worker: job failed ❌
    Note right of Worker: Retry #1 → wait 30s
    Worker ->> Worker: retry job (1)
    Worker ->> Worker: job failed ❌
    Note right of Worker: Retry #2 → wait 60s
    Worker ->> Worker: retry job (2)
    Worker ->> Worker: job failed ❌
    Note right of Worker: Retry #3 → wait 120s
    Worker ->> Worker: retry job (3)
    Worker ->> DB: set status=fatal
```

---

## 2. Webhook Retry

* **Max attempts:** 3
* **Backoff schedule:** 30s → 60s → 120s
* **Failure handling:**

  * אם כל הניסיונות נכשלו → Job נשלח ל־DLQ (Dead Letter Queue).
  * Alerts נשלחים למפעילים אם DLQ מלא >5 דקות.

**Flow Example:**

```mermaid
sequenceDiagram
    Worker ->> Webhook: POST job completion
    Webhook -->> Worker: failure ❌
    Note right of Worker: Retry Webhook #1 → 30s
    Worker ->> Webhook: POST retry #1
    Worker ->> Webhook: POST retry #2
    Worker ->> Webhook: POST retry #3
    Worker ->> DLQ: failed job
```

---

## 3. Notes & Best Practices

* **Backoff values configurable** – ניתן לשנות לפי עומס או SLA.
* **Observability:**

  * כל Retry מתועד בלוגים עם `tenantId`, `jobId`, `attempt number`, `nextRunAt`.
  * Metrics: Retry rate, Failed jobs, DLQ size.
* **Idempotency guarantees:**

  * כל Retry חייב להיות בטוח ולא ליצור כפילויות (במיוחד חשוב ל־Webhook).

---
