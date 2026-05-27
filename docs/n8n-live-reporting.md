# הצגת הרצות מתוך n8n בממשק הכיתה

## המטרה

כאשר המורה בונה תהליך בתוך:

```text
n8n
```

והתהליך רץ, ההרצה תופיע בלוח של:

```text
After Class AI
```

כך כל הכיתה רואה בזמן אמת:

- התהליך הורץ
- ההרצה הצליחה
- ההרצה נכשלה
- יש הודעת מצב מהמורה או מהתהליך

## איך זה עובד

בתוך התהליך של:

```text
n8n
```

מוסיפים בסוף צעד מסוג:

```text
HTTP Request
```

הצעד הזה שולח דיווח אל:

```text
Apps Script
```

והסקריפט מוסיף שורה בלשונית:

```text
runs
```

הממשק שלנו קורא את הלשונית ומציג את ההרצה בלוח המורה.

## כתובת הדיווח

כתובת הבסיס:

```text
https://script.google.com/macros/s/AKfycbxN6EKwE8-EVQROfMfYa4dMB666gy_5pXCpNLS1tB9t5-1RSl3u8YVi1UEK8L2Gyqwq_g/exec
```

דוגמה לדיווח הצלחה:

```text
https://script.google.com/macros/s/AKfycbxN6EKwE8-EVQROfMfYa4dMB666gy_5pXCpNLS1tB9t5-1RSl3u8YVi1UEK8L2Gyqwq_g/exec?action=reportRun&sessionCode=AI-203&actorName=Teacher&workflowName=LeadBot&status=success&message=Teacher workflow completed
```

דוגמה לדיווח כישלון:

```text
https://script.google.com/macros/s/AKfycbxN6EKwE8-EVQROfMfYa4dMB666gy_5pXCpNLS1tB9t5-1RSl3u8YVi1UEK8L2Gyqwq_g/exec?action=reportRun&sessionCode=AI-203&actorName=Teacher&workflowName=LeadBot&status=failed&message=Missing field in payload
```

## הגדרות בצעד הדיווח

בתוך:

```text
HTTP Request
```

מגדירים:

```text
Method: GET
```

ואת הכתובת שמים בשדה:

```text
URL
```

## פרמטרים חשובים

```text
action=reportRun
```

אומר לסקריפט שזה דיווח הרצה.

```text
sessionCode=AI-203
```

קוד השיעור הפעיל.

```text
actorName=Teacher
```

מי הריץ.

אפשר לשים שם מורה או שם תלמיד.

```text
workflowName=LeadBot
```

שם התהליך.

```text
status=success
```

סטטוס ההרצה.

ערכים מומלצים:

```text
success
running
failed
```

```text
message=...
```

הודעה קצרה שתוצג בלוח.

## מה עושים בשיעור מחר

בזמן שהמורה בונה את התהליך:

1. בונים את הצעדים הרגילים.
2. מוסיפים בסוף צעד דיווח.
3. מריצים את התהליך.
4. מסתכלים בלוח:

```text
After Class AI
```

5. הכיתה רואה שההרצה הופיעה.

## איך להציג את זה לתלמידים

אפשר להגיד:

```text
כל תהליך שנבנה היום יכול לדווח ללוח הכיתה.
ככה אנחנו רואים ביחד מה רץ, מה הצליח, ומה צריך תיקון.
```

## גרסה ידנית אם משהו נתקע

אם הדיווח מתוך:

```text
n8n
```

לא עובד בזמן השיעור, משתמשים בכפתור בממשק:

```text
הרץ workflow
```

זה עדיין ירשום את ההרצה בגיליון ויציג אותה בלוח.

