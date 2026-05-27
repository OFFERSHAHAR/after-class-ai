# After Class AI

כיתה וירטואלית לתרגול n8n ו-AI אחרי שיעור Zoom.

המטרה: לתת למורה ולתלמידים מרחב תרגול חי שבו כל תלמיד מקבל workflow אישי לניסוי, והמורה רואה בזמן אמת מי התקדם, מי הריץ בהצלחה ומי צריך עזרה.

## מה יש בפרויקט כרגע

- ממשק דמו בעברית ו-RTL
- לוח מורה
- מסך תלמיד
- ספריית תבניות workflow
- פיד הרצות חי מדומה
- תיעוד מוצר ראשוני
- קובץ Docker Compose עתידי להרצת n8n מקומי
- דוגמת workflow לייבוא ל-n8n
- תכנון ותבניות Google Sheets כ-backend זמני ל-MVP
- Student Kit להרצה מקומית של חניכים אחרי השיעור

## הרצה מקומית של הממשק

מתוך תיקיית הפרויקט:

```powershell
python -m http.server 5173 --bind 127.0.0.1
```

ואז לפתוח:

```text
http://127.0.0.1:5173/
```

## הרצת n8n מקומי

נדרש Docker Desktop.

1. להעתיק את קובץ ההגדרות:

```powershell
Copy-Item .env.example .env
```

2. להפעיל:

```powershell
docker compose up -d
```

3. לפתוח:

```text
http://127.0.0.1:5678/
```

## מבנה תיקיות

```text
after-class-ai/
  index.html
  styles.css
  app.js
  README.md
  docker-compose.yml
  .env.example
  .gitignore
  docs/
    interface-brief.md
    teacher-operations-guide.md
    google-sheets-backend.md
    roadmap.md
  google-apps-script/
    Code.gs
  sheets/
    *.csv
  student-kit/
    run-local.bat
    templates/
    my-workflows/
    notes/
  workflows/
    lead-bot-template.json
```

## מה צריך לבנות כדי שזה יעבוד באמת

1. חיבור ל-n8n API
2. יצירת חדר שיעור
3. ניהול תלמידים
4. שכפול workflow מתבנית לתלמיד
5. קריאת executions אמיתיים מ-n8n
6. הרשאות sandbox לתלמידים
7. מסך Live Board לשיתוף בזום

## מדריכים

- [פירוט ממשק וחזון](docs/interface-brief.md)
- [הצעה למורה](docs/teacher-proposal.md)
- [מדריך תפעול למורה ותלמידים](docs/teacher-operations-guide.md)
- [Google Sheets כ-backend זמני](docs/google-sheets-backend.md)
- [פקודת הקמת Google Sheets](docs/sheets-setup-command.md)
- [ערכת הרצה לחניך](docs/student-kit.md)
- [Roadmap](docs/roadmap.md)

## סטטוס

זהו MVP חזותי ראשוני. הוא מתאים להצגה, שיחה עם מורה/שותפים, ותכנון המשך פיתוח.
