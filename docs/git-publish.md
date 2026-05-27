# העלאה ל-GitHub

## פעם ראשונה

מתוך תיקיית `after-class-ai`:

```powershell
git init
git branch -M main
git add .
git commit -m "Initial After Class AI prototype"
```

יוצרים repository חדש ב-GitHub בשם:

```text
after-class-ai
```

ואז מחברים את ה-remote:

```powershell
git remote add origin https://github.com/YOUR_USER/after-class-ai.git
git push -u origin main
```

## אחרי שינויים נוספים

```powershell
git status
git add .
git commit -m "Describe the change"
git push
```

## חשוב

- לא להעלות `.env`.
- להשתמש ב-`.env.example` עבור דוגמה בלבד.
- אם מפתח או סיסמה אמיתיים נכנסו בטעות ל-Git, צריך לבטל אותם ולהחליף אותם מיד.

