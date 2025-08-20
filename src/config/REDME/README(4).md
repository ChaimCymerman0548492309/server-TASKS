

# 📌 Data Model

## 🗄️ Job Table

טבלת **Jobs** מרכזית שמתעדת את כל הג׳ובים שנוצרו.

| Field            | Type      | Notes                                           |         |       |           |         |
| ---------------- | --------- | ----------------------------------------------- | ------- | ----- | --------- | ------- |
| `jobId`          | UUID (PK) | מזהה ייחודי לג׳וב                               |         |       |           |         |
| `tenantId`       | String    | מזהה הדייר (Tenant)                             |         |       |           |         |
| `type`           | String    | סוג המשימה (למשל: `email`, `sms`)               |         |       |           |         |
| `payloadHash`    | String    | Hash של תוכן ה־payload לצורך אימות Idempotency  |         |       |           |         |
| `status`         | Enum      | \`queued                                        | running | retry | succeeded | fatal\` |
| `attempts`       | Int       | מספר ניסיונות שבוצעו עד כה                      |         |       |           |         |
| `nextRunAt`      | Timestamp | מתי הניסיון הבא מתוזמן (בשימוש ב־Retry/Backoff) |         |       |           |         |
| `idempotencyKey` | String    | מפתח ייחודי מהלקוח                              |         |       |           |         |
| `webhookUrl`     | String    | לאן לשלוח את ההתראה עם סיום הג׳וב               |         |       |           |         |
| `createdAt`      | Timestamp | מתי נוצר הג׳וב                                  |         |       |           |         |
| `updatedAt`      | Timestamp | מתי עודכן לאחרונה                               |         |       |           |         |

---

## 🔑 Indexes

* `(tenantId, status)` – לשליפות מהירות של ג׳ובים פעילים לדייר.
* `(nextRunAt)` – לתזמון וניהול Retry.
* `UNIQUE (tenantId, idempotencyKey)` – מבטיח Idempotency.

---

## 📋 Attempt Table (Optional)

טבלת **Attempts** (אופציונלית – אפשר לוותר בגרסה הכי בסיסית).
משמשת לתיעוד מפורט של כל ניסיון להריץ ג׳וב.

| Field        | Type      | Notes                       |        |             |
| ------------ | --------- | --------------------------- | ------ | ----------- |
| `attemptId`  | UUID (PK) | מזהה ייחודי לניסיון         |        |             |
| `jobId`      | UUID (FK) | קישור לטבלת Jobs            |        |             |
| `status`     | Enum      | \`running                   | failed | succeeded\` |
| `error`      | String    | הודעת שגיאה אם הניסיון נכשל |        |             |
| `startedAt`  | Timestamp | מתי התחיל הניסיון           |        |             |
| `finishedAt` | Timestamp | מתי הסתיים הניסיון          |        |             |

---

## 📌 Notes

* **Retention** – נתוני הג׳ובים נשמרים למשך **7 ימים** בלבד.
* **Size estimate** – כל שורה ≈ 1KB → 1,000 ג׳ובים/יום ≈ 1MB/יום → 7MB/שבוע.
* **Backups** – לא נדרשים ברמת התרגיל, אך נרשום ש־DB עמיד ל־Crash.

