
# 📈 9. Scale Thinking

* **Job Size Heuristic:** \~1 KB per job
* **Volume:** \~1k jobs/day → \~1 MB/day → \~7 MB/week (Metadata retention: 7 days)
* **Burst Handling:** \~2 RPS → מספיק Worker קטן (concurrency 3–5)
* **Queue vs Cron:** Queue נבחרה → מאפשר עיבוד אסינכרוני מידי + Retry נוח
* **DB Choice:** SQL נבחרה → מבטיחה ACID ויכולת לבצע Idempotency עם UNIQUE constraint.

  * Mitigation: אם Rows גדלים → Partitioning או Cleanup אוטומטי אחרי 7 ימים

---

# ⚖️ 10. Risks & Trade-offs

| Decision                      | Choice & Reason                 | Mitigation / Note                             |
| ----------------------------- | ------------------------------- | --------------------------------------------- |
| Queue vs Cron                 | Queue → Async + Retry           | Easy Retry, less complex than Cron scheduling |
| SQL vs NoSQL                  | SQL → ACID, Idempotency         | Partition or TTL cleanup for large tables     |
| Sync vs Async Webhook         | Async → avoids blocking Worker  | DLQ for failed webhooks                       |
| At-least-once vs Exactly-once | At-least-once → simpler, faster | Make effects idempotent                       |
| Retry Backoff Values          | 30s → 60s → 120s                | Configurable if system load increases         |

---

# 📚 11. Glossary

* **Tenant:** לקוח או יחידת משתמש נפרדת
* **Job:** משימה ברקע שמערכת מבצעת
* **Worker:** רכיב שמבצע את ה־Job בפועל
* **Queue:** תור שמחזיק Jobs להקצאה ל־Workers
* **Webhook:** נקודת קצה חיצונית שמקבלת עדכון על סטטוס Job
* **DLQ (Dead Letter Queue):** Jobs שנכשלו בכל הניסיונות ושולחים למעקב
* **Idempotency-Key:** מפתח ייחודי שמונע יצירת Job כפול
* **Backoff:** המתנה מתמשכת בין ניסיונות חוזרים לאחר כישלון
* **Retry:** ניסיון חוזר של Job או Webhook במקרה של כשלון

---

### Optional “Shine” Quality Features

* **Mermaid state diagram** ל־Job Status (`queued → running → retry → succeeded/fatal`)
* Rate limiting per tenant
* Fallback if file/queue write fails → log + retry later
* Webhook signature header: `X-Signature: sha256=<hmac>`
* Operational alert: Page if DLQ > 0 for 5+ minutes

