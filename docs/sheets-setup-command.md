# פקודת הקמת Google Sheets

## מה נוסף

בקובץ:

```text
google-apps-script/Code.gs
```

נוספה פקודת הקמה:

```javascript
setupAfterClassSheets()
```

הפקודה מקימה את ה-Google Sheet של After Class AI בצורה מוכנה לעבודה:

- יוצרת את כל הלשוניות
- מוסיפה כותרות
- מוסיפה נתוני דמו
- מקפיאה שורת כותרת
- מוסיפה פילטרים
- מוסיפה dropdowns לסטטוסים
- מוסיפה צבעי סטטוס
- מוסיפה dashboard ראשוני
- מעצבת את הגיליון בסגנון אדום, שחור וזהב

## הלשוניות שנוצרות

```text
dashboard
sessions
students
exercises
runs
help_requests
```

## איך מריצים

1. פותחים את ה-Google Sheet:

```text
https://docs.google.com/spreadsheets/d/19GOHx2oq1ZsnkggJ-r-8TGvYvhYle3sAWifAzmL-rwQ/edit
```

2. נכנסים ל:

```text
Extensions > Apps Script
```

3. מדביקים את הקוד מתוך:

```text
google-apps-script/Code.gs
```

4. שומרים.

5. בוחרים מהרשימה העליונה את הפונקציה:

```javascript
setupAfterClassSheets
```

6. לוחצים Run.

7. מאשרים הרשאות Google בפעם הראשונה.

## אזהרה חשובה

הפקודה `setupAfterClassSheets()` מאפסת את הלשוניות של המערכת ומכניסה נתוני דמו.

להריץ אותה:

- בפעם הראשונה שמקימים את ה-Sheet
- כשמוכנים לאפס סביבת בדיקות

לא להריץ אותה על Sheet שכבר יש בו נתוני תלמידים אמיתיים בלי לגבות.

## עיצוב בלבד

אם רוצים רק לרענן את העיצוב בלי לאפס נתונים, מריצים:

```javascript
styleAfterClassSheets()
```

## תפריט בתוך Google Sheets

אחרי שמריצים את הסקריפט, יופיע בתפריט העליון:

```text
After Class AI
```

ובתוכו:

- Setup / reset sheets
- Refresh Ferrari styling

## איך זה מתחבר לממשק

אחרי שה-Sheet מוקם:

1. מפרסמים את Apps Script כ-Web App
2. מקבלים URL
3. מכניסים את ה-URL לממשק
4. הכפתורים בממשק יוכלו לקרוא ולכתוב ל-Sheet
