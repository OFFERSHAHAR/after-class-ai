# After Class AI - Student Kit

ערכת תרגול מקומית לחניך.

המטרה: לאפשר לכל חניך להמשיך להתנסות גם אחרי שהשיעור הסתיים, עם תבניות workflow שנשלחו מהמערכת או מהמורה.

## מה יש בערכה

```text
student-kit/
  run-local.bat
  run-with-ngrok.bat
  README.md
  config/
    student-kit.config.json
  payloads/
    lead-example.json
  templates/
    lead-bot-template.json
  tools/
    README.md
  my-workflows/
    .gitkeep
  notes/
    .gitkeep
```

## איך מריצים

1. פותחים את התיקייה `student-kit`.
2. לוחצים פעמיים על:

```text
run-local.bat
```

3. נפתח שרת מקומי בכתובת:

```text
http://127.0.0.1:5180/
```

אם אין Python על המחשב, הקובץ יפתח את `index.html` ישירות כדי שהחניך עדיין יוכל לעבוד עם הערכה.

אם הפורט תפוס, אפשר לערוך את הקובץ `run-local.bat` ולשנות את הערך:

```bat
set PORT=5180
```

## הפעלה עם ngrok

ברוב המקרים לא צריך ngrok.

משתמשים בו רק אם המורה מבקש קישור ציבורי, למשל כדי ש-webhook חיצוני יגיע למחשב של החניך.

1. מורידים `ngrok.exe`.
2. שמים אותו בתיקייה:

```text
tools/
```

3. לוחצים על:

```text
run-with-ngrok.bat
```

החלון של ngrok יציג קישור ציבורי מסוג:

```text
https://xxxx.ngrok-free.app
```

## איך משתמשים בתבניות מהשיעור

המורה או הממשק יכולים לשלוח קובץ workflow בפורמט JSON.

שומרים אותו כאן:

```text
templates/
```

או אם החניך שינה אותו ורוצה לשמור גרסה אישית:

```text
my-workflows/
```

## איך מייבאים workflow ל-n8n

1. פותחים את n8n.
2. לוחצים על Import workflow.
3. בוחרים קובץ מתוך `templates/` או `my-workflows/`.
4. שומרים בשם אישי, למשל:

```text
Lead Bot - Noa - Practice
```

## מה כדאי לשמור בתיקייה

- workflows שהחניך שינה
- payloads לבדיקה
- הערות מהשיעור
- תוצאות ניסוי
- גרסאות שונות של אותו תרגיל

## חשוב

- לא לשמור API keys אמיתיים בקבצי workflow.
- לא להעלות קבצים עם credentials ל-Git.
- אם תבנית דורשת מפתח API, להשתמש ב-credentials בתוך n8n ולא בתוך JSON.
