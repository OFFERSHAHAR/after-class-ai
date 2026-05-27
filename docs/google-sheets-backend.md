# Google Sheets Backend - MVP

## למה Sheets

בשלב הראשון לא חייבים לבנות בסיס נתונים מלא. Google Sheets יכול לשמש כ-backend זמני ונוח:

- קל לשיתוף עם מורה וחברים
- אפשר לראות ולערוך נתונים ידנית
- מתאים ל-MVP מהיר
- לא דורש שרת מורכב
- אפשר לחבר אליו Apps Script כ-API פשוט

המטרה היא ש-After Class AI ישתמש ב-Sheets לניהול:

- שיעורים
- תלמידים
- תרגילים
- הרצות
- בקשות עזרה

## מבנה הקובץ

יוצרים Google Sheet בשם:

```text
After Class AI - Data
```

ובתוכו יוצרים 5 לשוניות:

```text
sessions
students
exercises
runs
help_requests
```

## sessions

לשונית שיעורים.

| id | code | title | date | teacher | active_exercise_id | status | join_open |
|---|---|---|---|---|---|---|---|
| session-001 | AI-203 | Webhooks ו-AI | 2026-05-27 | Teacher | exercise-lead-bot | active | TRUE |

שדות:

- `id` - מזהה פנימי
- `code` - קוד שהמורה שולח בזום
- `title` - שם השיעור
- `date` - תאריך
- `teacher` - שם המורה
- `active_exercise_id` - התרגיל הפעיל
- `status` - draft / active / closed
- `join_open` - האם תלמידים יכולים להצטרף

## students

לשונית תלמידים.

| id | session_id | name | joined_at | workflow_id | workflow_url | status |
|---|---|---|---|---|---|---|
| student-001 | session-001 | נועה | 2026-05-27 18:05 | 123 | http://127.0.0.1:5678/workflow/123 | active |

שדות:

- `id` - מזהה תלמיד
- `session_id` - לאיזה שיעור הוא מחובר
- `name` - שם תלמיד
- `joined_at` - זמן הצטרפות
- `workflow_id` - מזהה workflow אישי ב-n8n
- `workflow_url` - קישור לפתיחה ב-n8n
- `status` - active / done / inactive

## exercises

לשונית תרגילים.

| id | title | level | description | template_file | status |
|---|---|---|---|---|---|
| exercise-lead-bot | Lead Bot | ביניים | Webhook שמסווג ליד | workflows/lead-bot-template.json | active |

שדות:

- `id` - מזהה תרגיל
- `title` - שם תרגיל
- `level` - רמה
- `description` - הסבר קצר
- `template_file` - קובץ workflow בפרויקט
- `status` - active / archived

## runs

לשונית הרצות.

| id | session_id | student_id | exercise_id | workflow_id | status | message | created_at |
|---|---|---|---|---|---|---|---|
| run-001 | session-001 | student-001 | exercise-lead-bot | 123 | success | Webhook returned 200 | 2026-05-27 18:11 |

שדות:

- `id` - מזהה הרצה
- `session_id` - שיעור
- `student_id` - תלמיד
- `exercise_id` - תרגיל
- `workflow_id` - workflow ב-n8n
- `status` - running / success / failed
- `message` - הודעה קצרה ללוח החי
- `created_at` - זמן הרצה

## help_requests

לשונית בקשות עזרה.

| id | session_id | student_id | reason | status | created_at | resolved_at |
|---|---|---|---|---|---|---|
| help-001 | session-001 | student-001 | credentials error | open | 2026-05-27 18:15 | |

שדות:

- `id` - מזהה בקשה
- `session_id` - שיעור
- `student_id` - תלמיד
- `reason` - סיבת עזרה
- `status` - open / in_progress / resolved
- `created_at` - זמן פתיחה
- `resolved_at` - זמן סגירה

## איך הממשק יעבוד מול Sheets

### הצטרפות תלמיד

1. תלמיד מזין קוד שיעור ושם
2. הממשק קורא את `sessions`
3. אם הקוד פעיל ופתוח, נוצרת שורה ב-`students`
4. בהמשך המערכת תיצור workflow אישי ב-n8n ותעדכן `workflow_id`

### יצירת שיעור

1. מורה לוחץ "שיעור חדש"
2. נוצרת שורה ב-`sessions`
3. המערכת מייצרת קוד שיעור
4. המורה שולח את הקוד בזום

### בקשת עזרה

1. תלמיד לוחץ "אני צריך עזרה"
2. נוצרת שורה ב-`help_requests`
3. לוח המורה מציג את התלמיד כ"דורש עזרה"

### הרצת workflow

בשלב הדמו:

1. לחיצה על "הרץ workflow" יוצרת שורה ב-`runs`
2. הסטטוס מופיע בלוח החי

בשלב n8n אמיתי:

1. n8n מריץ workflow
2. webhook או API מעדכן את `runs`
3. הממשק קורא את הסטטוס מה-Sheet

## חיבור טכני מומלץ

ל-MVP הכי פשוט:

- Google Sheet
- Apps Script Web App
- הממשק קורא וכותב דרך URL של Apps Script

היתרון: לא צריך להכניס Google API keys לדפדפן.

## מגבלות

Sheets טוב ל-MVP, אבל לא למערכת גדולה:

- אין הרשאות עדינות כמו בסיס נתונים אמיתי
- כתיבה מרובה במקביל יכולה להיות איטית
- צריך להיזהר מחשיפת URL של Apps Script
- לא מתאים לעשרות כיתות במקביל בלי תכנון

לשלב ראשון עם מורה, קבוצה קטנה ותרגול חי, זה מספיק טוב.

