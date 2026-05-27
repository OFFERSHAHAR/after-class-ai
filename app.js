const config = window.AFTER_CLASS_AI_CONFIG || {};
const apiUrl = (config.sheetsApiUrl || "").trim();
const defaultSessionCode = config.defaultSessionCode || "AI-203";
const refreshSeconds = Number(config.refreshSeconds || 10);

const state = {
  session: null,
  student: null,
  demoMode: !apiUrl,
};

const feedItems = [
  {
    status: "ok",
    icon: "✓",
    name: "מאיה",
    title: "הרצה הסתיימה בהצלחה",
    detail: "הליד סווג ונרשם בגיליון התרגול.",
    time: "לפני דקה",
  },
  {
    status: "run",
    icon: "…",
    name: "איתי",
    title: "בודק כתובת קבלה",
    detail: "ממתין לשליחת נתוני בדיקה.",
    time: "עכשיו",
  },
  {
    status: "help",
    icon: "!",
    name: "רוני",
    title: "צריך עזרה",
    detail: "בעיה בהרשאות או בחיבור לגיליון.",
    time: "לפני 4 דק׳",
  },
];

const studentNames = ["נועה", "עומר", "ליאור", "שחר", "אורי", "טל"];
const feedList = document.querySelector("#feedList");
const activeStudents = document.querySelector("#activeStudents");
const successRuns = document.querySelector("#successRuns");
const needsHelp = document.querySelector("#needsHelp");
const connectionNote = document.querySelector("#connectionNote");
const sessionCodeInput = document.querySelector("#sessionCode");

sessionCodeInput.value = defaultSessionCode;

function setConnection(message, status = "") {
  connectionNote.textContent = message;
  connectionNote.className = `connection-note ${status}`.trim();
}

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

function pushFeed(item) {
  feedItems.unshift({ ...item, time: "עכשיו" });
  if (feedItems.length > 12) feedItems.pop();
  renderFeed();
}

function callApi(action, params = {}) {
  if (!apiUrl) return Promise.resolve({ ok: false, demo: true });

  return new Promise((resolve, reject) => {
    const callbackName = `afterClassCallback_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const url = new URL(apiUrl);
    url.searchParams.set("action", action);
    url.searchParams.set("callback", callbackName);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });

    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("החיבור לגיליון לקח יותר מדי זמן"));
    }, 12000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("לא ניתן להתחבר לסקריפט"));
    };

    script.src = url.toString();
    document.body.appendChild(script);
  });
}

function addDemoRun(name = studentNames[Math.floor(Math.random() * studentNames.length)]) {
  const ok = Math.random() > 0.28;
  pushFeed({
    status: ok ? "ok" : "help",
    icon: ok ? "✓" : "!",
    name,
    title: ok ? "הרצה נרשמה בהצלחה" : "נדרשת בדיקת שגיאה",
    detail: ok ? "הפעולה נשמרה בלוח הכיתה." : "חסר שדה בנתוני הבדיקה.",
  });

  const success = Number(successRuns.textContent);
  const help = Number(needsHelp.textContent);
  successRuns.textContent = ok ? success + 1 : success;
  needsHelp.textContent = ok ? Math.max(0, help - 1) : help + 1;
}

function updateDashboardFromRemote(payload) {
  if (!payload || !payload.ok) return;

  state.session = payload.session;
  const students = payload.students || [];
  const runs = payload.runs || [];
  const helpRequests = payload.helpRequests || [];

  activeStudents.textContent = students.filter((student) => student.status === "active").length;
  successRuns.textContent = runs.filter((run) => run.status === "success").length;
  needsHelp.textContent = helpRequests.length;

  feedItems.length = 0;
  runs.slice(0, 8).forEach((run) => {
    feedItems.push({
      status: run.status === "success" ? "ok" : run.status === "failed" ? "help" : "run",
      icon: run.status === "success" ? "✓" : run.status === "failed" ? "!" : "…",
      name: run.student_id || "תלמיד",
      title: run.status === "success" ? "הרצה הצליחה" : run.status === "failed" ? "הרצה נכשלה" : "הרצה בתהליך",
      detail: run.message || "אירוע נרשם בגיליון.",
      time: formatTime(run.created_at),
    });
  });

  helpRequests.slice(0, 4).forEach((help) => {
    feedItems.unshift({
      status: "help",
      icon: "!",
      name: help.student_id || "תלמיד",
      title: "בקשת עזרה פתוחה",
      detail: help.reason || "צריך עזרה",
      time: formatTime(help.created_at),
    });
  });

  if (!feedItems.length) {
    feedItems.push({
      status: "run",
      icon: "…",
      name: "המערכת",
      title: "מחכה לפעילות כיתה",
      detail: "תלמידים שיופיעו בגיליון יוצגו כאן.",
      time: "עכשיו",
    });
  }

  renderFeed();
}

function formatTime(value) {
  if (!value) return "עכשיו";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "עכשיו";
  return date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

async function refreshState() {
  if (!apiUrl) {
    setConnection("מצב דמו. הכנס כתובת סקריפט בקובץ ההגדרות כדי לעבוד מול הגיליון.");
    return;
  }

  try {
    const payload = await callApi("state", { sessionCode: sessionCodeInput.value.trim() || defaultSessionCode });
    if (!payload.ok) {
      setConnection(payload.error || "הגיליון לא החזיר שיעור פעיל", "error");
      return;
    }

    setConnection("מחובר לגיליון. הנתונים נשמרים ומתעדכנים.", "connected");
    updateDashboardFromRemote(payload);
  } catch (error) {
    setConnection(error.message, "error");
  }
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.view}`).classList.add("active");
  });
});

document.querySelector("#simulateRun").addEventListener("click", () => addDemoRun());

document.querySelector("#studentRun").addEventListener("click", async () => {
  const name = document.querySelector("#studentName").value.trim() || "תלמיד/ה";

  if (!apiUrl || !state.session || !state.student) {
    addDemoRun(name);
    return;
  }

  const payload = await callApi("createRun", {
    sessionId: state.session.id,
    studentId: state.student.id,
    exerciseId: state.session.active_exercise_id || "exercise-lead-bot",
    status: "success",
    message: "התלמיד סימן הרצה מוצלחת מהממשק",
  });

  if (payload.ok) {
    pushFeed({
      status: "ok",
      icon: "✓",
      name,
      title: "הרצה נרשמה בגיליון",
      detail: "המורה יראה את ההרצה בלוח הכיתה.",
    });
    await refreshState();
  }
});

document.querySelector("#downloadWorkflow").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = config.currentWorkflowUrl || "workflows/current-class-workflow.json";
  link.download = config.currentWorkflowName || "after-class-current-workflow.json";
  document.body.appendChild(link);
  link.click();
  link.remove();

  pushFeed({
    status: "run",
    icon: "…",
    name: "תלמיד",
    title: "הורדת תבנית",
    detail: "קובץ התרגיל הנוכחי ירד למחשב וניתן לייבא אותו לתוך n8n.",
  });
});

document.querySelector("#joinLab").addEventListener("click", async () => {
  const name = document.querySelector("#studentName").value.trim() || "תלמיד/ה";
  const sessionCode = sessionCodeInput.value.trim() || defaultSessionCode;

  if (!apiUrl) {
    activeStudents.textContent = Number(activeStudents.textContent) + 1;
    pushFeed({
      status: "run",
      icon: "…",
      name,
      title: "הצטרפות למעבדה",
      detail: "מצב דמו. בגירסה המחוברת זה יירשם בגיליון.",
    });
    return;
  }

  try {
    const payload = await callApi("join", { name, sessionCode });
    if (!payload.ok) {
      setConnection(payload.error || "לא ניתן להצטרף לשיעור", "error");
      return;
    }

    state.student = payload.student;
    state.session = payload.session;
    setConnection("הצטרפת לשיעור. הפעילות שלך נשמרת בגיליון.", "connected");
    pushFeed({
      status: "run",
      icon: "…",
      name,
      title: "הצטרף לשיעור",
      detail: `קוד שיעור: ${sessionCode}`,
    });
    await refreshState();
  } catch (error) {
    setConnection(error.message, "error");
  }
});

document.querySelector("#helpRequest").addEventListener("click", async () => {
  const name = document.querySelector("#studentName").value.trim() || "תלמיד/ה";

  if (!apiUrl || !state.session || !state.student) {
    needsHelp.textContent = Number(needsHelp.textContent) + 1;
    pushFeed({
      status: "help",
      icon: "!",
      name,
      title: "בקשת עזרה",
      detail: "מצב דמו. בגירסה המחוברת זה יירשם בגיליון.",
    });
    return;
  }

  const payload = await callApi("requestHelp", {
    sessionId: state.session.id,
    studentId: state.student.id,
    reason: "התלמיד ביקש עזרה מהממשק",
  });

  if (payload.ok) {
    pushFeed({
      status: "help",
      icon: "!",
      name,
      title: "בקשת עזרה נשלחה",
      detail: "המורה יראה את הבקשה בלוח.",
    });
    await refreshState();
  }
});

document.querySelector("#clearFeed").addEventListener("click", () => {
  feedItems.length = 0;
  renderFeed();
});

document.querySelector("#cloneForClass").addEventListener("click", () => {
  pushFeed({
    status: "run",
    icon: "…",
    name: "מורה",
    title: "שכפול תרגיל לכיתה",
    detail: "בשלב מחר זה יהיה סימון פעילות. בהמשך נחבר שכפול אמיתי.",
  });
});

document.querySelector("#createSession").addEventListener("click", async () => {
  if (!apiUrl) {
    pushFeed({
      status: "ok",
      icon: "✓",
      name: "המערכת",
      title: "מפגש דמו נפתח",
      detail: "הכיתה מוכנה לתרגול דמו.",
    });
    return;
  }

  const payload = await callApi("createSession", {
    code: sessionCodeInput.value.trim() || defaultSessionCode,
    title: "שיעור תרגול חי",
    teacher: "Teacher",
  });

  if (payload.ok) {
    state.session = payload.session;
    setConnection("שיעור חדש נוצר בגיליון.", "connected");
    await refreshState();
  }
});

renderFeed();
refreshState();
if (apiUrl) window.setInterval(refreshState, refreshSeconds * 1000);
