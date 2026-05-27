const feedItems = [
  {
    status: "ok",
    icon: "✓",
    name: "מאיה",
    title: "Lead Bot הסתיים בהצלחה",
    detail: "הליד סווג כגבוה ונשמר בגיליון.",
    time: "לפני דקה",
  },
  {
    status: "run",
    icon: "…",
    name: "איתי",
    title: "מריץ בדיקת webhook",
    detail: "ממתין לבקשת POST מתוך Postman.",
    time: "עכשיו",
  },
  {
    status: "help",
    icon: "!",
    name: "רוני",
    title: "צריך עזרה ב־credentials",
    detail: "Google Sheets מחזיר הרשאת צפייה בלבד.",
    time: "לפני 4 דק׳",
  },
  {
    status: "ok",
    icon: "✓",
    name: "דנה",
    title: "Ticket Router עבר בדיקה",
    detail: "פנייה טכנית נותבה לצוות תמיכה.",
    time: "לפני 8 דק׳",
  },
];

const studentNames = ["נועה", "עומר", "ליאור", "שחר", "אורי", "טל"];
const feedList = document.querySelector("#feedList");
const activeStudents = document.querySelector("#activeStudents");
const successRuns = document.querySelector("#successRuns");
const needsHelp = document.querySelector("#needsHelp");

function renderFeed() {
  feedList.innerHTML = feedItems
    .map(
      (item) => `
        <article class="feed-item">
          <div class="feed-status ${item.status}">${item.icon}</div>
          <div>
            <h4>${item.name}: ${item.title}</h4>
            <p>${item.detail}</p>
          </div>
          <span class="feed-time">${item.time}</span>
        </article>
      `
    )
    .join("");
}

function addRun(name = studentNames[Math.floor(Math.random() * studentNames.length)]) {
  const ok = Math.random() > 0.28;
  feedItems.unshift({
    status: ok ? "ok" : "help",
    icon: ok ? "✓" : "!",
    name,
    title: ok ? "workflow הורץ בהצלחה" : "נדרשת בדיקת שגיאה",
    detail: ok
      ? "Webhook קיבל payload והחזיר תשובה תקינה."
      : "חסר שדה email ב־JSON שנשלח ל־AI.",
    time: "עכשיו",
  });

  if (feedItems.length > 8) {
    feedItems.pop();
  }

  const success = Number(successRuns.textContent);
  const help = Number(needsHelp.textContent);
  successRuns.textContent = ok ? success + 1 : success;
  needsHelp.textContent = ok ? Math.max(0, help - 1) : help + 1;
  renderFeed();
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.view}`).classList.add("active");
  });
});

document.querySelector("#simulateRun").addEventListener("click", () => addRun());

document.querySelector("#studentRun").addEventListener("click", () => {
  const name = document.querySelector("#studentName").value.trim() || "תלמיד/ה";
  addRun(name);
});

document.querySelector("#joinLab").addEventListener("click", () => {
  const name = document.querySelector("#studentName").value.trim() || "תלמיד/ה";
  activeStudents.textContent = Number(activeStudents.textContent) + 1;
  feedItems.unshift({
    status: "run",
    icon: "…",
    name,
    title: "הצטרפות למעבדה",
    detail: "נוצר עותק אישי של Lead Bot בסביבת sandbox.",
    time: "עכשיו",
  });
  renderFeed();
});

document.querySelector("#clearFeed").addEventListener("click", () => {
  feedItems.length = 0;
  renderFeed();
});

document.querySelector("#cloneForClass").addEventListener("click", () => {
  feedItems.unshift({
    status: "run",
    icon: "…",
    name: "מורה",
    title: "שכפל תרגיל לכל הכיתה",
    detail: "נוצרו עותקים אישיים של Lead Bot לכל המשתתפים הפעילים.",
    time: "עכשיו",
  });
  renderFeed();
});

document.querySelector("#createSession").addEventListener("click", () => {
  feedItems.unshift({
    status: "ok",
    icon: "✓",
    name: "After Class AI",
    title: "מפגש חדש נפתח",
    detail: "הכיתה מוכנה לתרגול n8n, כולל תבניות והרצות דמו.",
    time: "עכשיו",
  });
  renderFeed();
});

renderFeed();
