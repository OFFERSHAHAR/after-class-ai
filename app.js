const config = window.AFTER_CLASS_AI_CONFIG || {};
const apiUrl = (config.sheetsApiUrl || "").trim();
const defaultSessionCode = config.defaultSessionCode || "AI-203";
const refreshSeconds = Number(config.refreshSeconds || 10);
const teacherCode = config.teacherCode || "teacher203";

const state = {
  session: null,
  student: null,
  teacherMode: localStorage.getItem("afterClassTeacherMode") === "true",
  uploadedWorkflow: null,
  feedClearedAt: Number(localStorage.getItem("afterClassFeedClearedAt") || 0),
  activeExercise: null,
};

const feedItems = [
  {
    status: "run",
    icon: "…",
    name: "מערכת",
    title: "ממתינה לפעילות כיתה",
    detail: "תלמידים שיצטרפו, יריצו או יבקשו עזרה יופיעו כאן.",
    time: "עכשיו",
  },
];

const studentNames = ["נועה", "עומר", "ליאור", "שחר", "אורי", "טל"];
const feedList = document.querySelector("#feedList");
const activeStudents = document.querySelector("#activeStudents");
const successRuns = document.querySelector("#successRuns");
const needsHelp = document.querySelector("#needsHelp");
const connectionNote = document.querySelector("#connectionNote");
const studentActionNote = document.querySelector("#studentActionNote");
const sessionCodeInput = document.querySelector("#sessionCode");
const joinButton = document.querySelector("#joinLab");
const runButton = document.querySelector("#studentRun");
const helpButton = document.querySelector("#helpRequest");
const downloadButton = document.querySelector("#downloadWorkflow");
const testChatbotButton = document.querySelector("#testChatbot");
const chatbotResult = document.querySelector("#chatbotResult");
const roleLabel = document.querySelector("#roleLabel");
const pageTitle = document.querySelector("#pageTitle");
const currentExerciseName = document.querySelector("#currentExerciseName");
const currentExercisePath = document.querySelector("#currentExercisePath");
const teacherBuilderNote = document.querySelector("#teacherBuilderNote");
const workflowFileStatus = document.querySelector("#workflowFileStatus");
const webhookUrlInput = document.querySelector("#webhookUrlInput");
const lessonTitle = document.querySelector("#lessonTitle");
const lessonGoal = document.querySelector("#lessonGoal");
const guidedFix = document.querySelector("#guidedFix");
const lessonPreviewTitle = document.querySelector("#lessonPreviewTitle");
const lessonPreviewGoal = document.querySelector("#lessonPreviewGoal");

sessionCodeInput.value = defaultSessionCode;
webhookUrlInput.value = config.n8nWebhookUrl || "";

function setConnection(message, status = "") {
  connectionNote.textContent = message;
  connectionNote.className = `connection-note ${status}`.trim();
}

function setAction(message, status = "") {
  studentActionNote.textContent = message;
  studentActionNote.className = `action-note ${status}`.trim();
}

function setTeacherNote(message, status = "") {
  teacherBuilderNote.textContent = message;
  teacherBuilderNote.className = `action-note ${status}`.trim();
}

function setButtonBusy(button, busyText) {
  if (!button) return () => {};
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = busyText;
  return () => {
    button.disabled = false;
    button.textContent = originalText;
  };
}

function setChatbotResult(message, status = "") {
  chatbotResult.textContent = message;
  chatbotResult.className = `result-box ${status}`.trim();
}

function setView(viewId) {
  const target = state.teacherMode ? viewId : viewId === "teacher" || viewId === "teacher-builder" ? "student" : viewId;
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === target);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === target);
  });
}

function applyRoleMode() {
  document.querySelectorAll(".teacher-only").forEach((element) => {
    element.hidden = !state.teacherMode;
  });
  roleLabel.textContent = state.teacherMode ? "תצוגת מורה פעילה" : "תצוגת תלמיד";
  pageTitle.textContent = state.teacherMode
    ? "לוח מורה והכנת שיעור לכיתה חיה"
    : "מריצים, בודקים, ומקבלים משוב בלי פקודות";
  if (!state.teacherMode && (document.querySelector(".view.active")?.id || "") !== "student") {
    setView("student");
  }
}

function renderFeed() {
  if (!feedList) return;
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

function isAfterFeedClear(value) {
  if (!state.feedClearedAt) return true;
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() > state.feedClearedAt;
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

function postFormApi(action, params = {}) {
  if (!apiUrl) return Promise.resolve({ ok: false, demo: true });

  return new Promise((resolve) => {
    const iframeName = `afterClassPost_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const iframe = document.createElement("iframe");
    iframe.name = iframeName;
    iframe.hidden = true;

    const form = document.createElement("form");
    form.method = "POST";
    form.action = apiUrl;
    form.target = iframeName;
    form.hidden = true;

    const fields = { action, ...params };
    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value == null ? "" : String(value);
      form.appendChild(input);
    });

    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();

    window.setTimeout(() => {
      form.remove();
      iframe.remove();
      resolve({ ok: true });
    }, 1800);
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

  successRuns.textContent = ok ? Number(successRuns.textContent) + 1 : successRuns.textContent;
  needsHelp.textContent = ok ? Math.max(0, Number(needsHelp.textContent) - 1) : Number(needsHelp.textContent) + 1;
}

function updateDashboardFromRemote(payload) {
  if (!payload || !payload.ok) return;

  state.session = payload.session;
  state.activeExercise = payload.activeExercise || null;
  const students = payload.students || [];
  const allRuns = payload.runs || [];
  const allHelpRequests = payload.helpRequests || [];
  const runs = allRuns.filter((run) => isAfterFeedClear(run.created_at));
  const helpRequests = allHelpRequests.filter((help) => isAfterFeedClear(help.created_at));

  activeStudents.textContent = students.filter((student) => student.status === "active").length;
  successRuns.textContent = allRuns.filter((run) => run.status === "success").length;
  needsHelp.textContent = allHelpRequests.length;

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

  if (!feedItems.length && !state.feedClearedAt) {
    feedItems.push({
      status: "run",
      icon: "…",
      name: "מערכת",
      title: "ממתינה לפעילות כיתה",
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
    setConnection("מצב דמו. אחרי חיבור הסקריפט הנתונים יישמרו בגיליון.");
    return;
  }

  try {
    const payload = await callApi("state", { sessionCode: sessionCodeInput.value.trim() || defaultSessionCode });
    if (!payload.ok) {
      setConnection(payload.error || "הגיליון לא החזיר שיעור פעיל", "error");
      return;
    }

    setConnection("מחובר לגיליון. הפעילות נשמרת ומתעדכנת.", "connected");
    updateDashboardFromRemote(payload);
  } catch (error) {
    setConnection(error.message, "error");
  }
}

function downloadTextFile(fileName, text, type = "application/json") {
  const blob = new Blob([text], { type });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(link.href);
  link.remove();
}

function getPublishedWorkflow() {
  if (state.uploadedWorkflow) return state.uploadedWorkflow;
  if (state.activeExercise?.workflow_json) {
    return {
      name: state.activeExercise.workflow_file_name || state.activeExercise.template_file || "class-workflow.json",
      content: state.activeExercise.workflow_json,
    };
  }
  return null;
}

function updateLessonPreview() {
  lessonPreviewTitle.textContent = lessonTitle.value.trim() || "שיעור ללא שם";
  lessonPreviewGoal.textContent = lessonGoal.value.trim() || "מטרת התרגיל תופיע כאן.";
  currentExerciseName.textContent = lessonTitle.value.trim() || "תרגיל נוכחי";
  currentExercisePath.textContent = state.uploadedWorkflow?.name || "קובץ כיתה פעיל";
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelector("#teacherGateOpen").addEventListener("click", () => {
  document.querySelector("#teacherGate").hidden = false;
  document.querySelector("#teacherCodeInput").focus();
});

document.querySelector("#teacherGateClose").addEventListener("click", () => {
  document.querySelector("#teacherGate").hidden = true;
});

document.querySelector("#teacherLogin").addEventListener("click", () => {
  const input = document.querySelector("#teacherCodeInput");
  const note = document.querySelector("#teacherGateNote");
  if (input.value.trim() !== teacherCode) {
    note.textContent = "קוד שגוי.";
    note.className = "action-note error";
    return;
  }
  state.teacherMode = true;
  localStorage.setItem("afterClassTeacherMode", "true");
  document.querySelector("#teacherGate").hidden = true;
  input.value = "";
  applyRoleMode();
  setView("teacher");
});

document.querySelector("#teacherExit").addEventListener("click", () => {
  state.teacherMode = false;
  localStorage.removeItem("afterClassTeacherMode");
  applyRoleMode();
  setView("student");
});

document.querySelector("#simulateRun").addEventListener("click", () => addDemoRun());

document.querySelector("#studentRun").addEventListener("click", async () => {
  const release = setButtonBusy(runButton, "רושם הרצה...");
  setAction("רושם הרצה בלוח הכיתה...", "busy");
  const name = document.querySelector("#studentName").value.trim() || "תלמיד/ה";

  if (!apiUrl || !state.session || !state.student) {
    addDemoRun(name);
    setAction("הרצת דמו נרשמה.", "success");
    release();
    return;
  }

  try {
    const payload = await callApi("createRun", {
      sessionId: state.session.id,
      studentId: state.student.id,
      exerciseId: state.session.active_exercise_id || "exercise-lead-bot",
      status: "success",
      message: "התלמיד סימן הרצה מוצלחת מהממשק",
    });

    if (payload.ok) {
      setAction("ההרצה נרשמה בהצלחה.", "success");
      await refreshState();
    } else {
      setAction(payload.error || "ההרצה לא נרשמה.", "error");
    }
  } catch (error) {
    setAction(error.message, "error");
  } finally {
    release();
  }
});

document.querySelector("#testChatbot").addEventListener("click", async () => {
  const release = setButtonBusy(testChatbotButton, "בודק...");
  const name = document.querySelector("#studentName").value.trim() || "תלמיד/ה";
  const sessionCode = sessionCodeInput.value.trim() || defaultSessionCode;
  setAction("שולח בדיקה אל התרגיל ומחכה לתשובה...", "busy");
  setChatbotResult("בודק את הצאט בוט מול סביבת העבודה...");

  if (!apiUrl) {
    setChatbotResult("מצב דמו: הצאט בוט החזיר תשובה מובנית לשירות לקוחות.", "success");
    setAction("בדיקת דמו הסתיימה.", "success");
    release();
    return;
  }

  try {
    const payload = await callApi("runN8nTest", {
      sessionCode,
      actorName: name,
      workflowName: lessonTitle.value.trim() || "Customer Service Chatbot",
      webhookUrl: webhookUrlInput.value.trim() || config.n8nWebhookUrl,
      message: "שלום, אני רוצה לדעת איך מקבלים החזר כספי על הזמנה",
    });

    if (payload.ok) {
      const result = typeof payload.result === "string" ? payload.result : JSON.stringify(payload.result, null, 2);
      setChatbotResult(result, "success");
      setAction("הבדיקה הצליחה ונרשמה בלוח.", "success");
      await refreshState();
    } else {
      setChatbotResult(payload.error || JSON.stringify(payload, null, 2), "error");
      setAction("הבדיקה נכשלה ונרשמה בלוח.", "error");
      await refreshState();
    }
  } catch (error) {
    setChatbotResult(error.message, "error");
    setAction(error.message, "error");
  } finally {
    release();
  }
});

document.querySelector("#downloadWorkflow").addEventListener("click", () => {
  const release = setButtonBusy(downloadButton, "מוריד...");
  setAction("מוריד את תרגיל הכיתה הנוכחי...", "busy");

  const publishedWorkflow = getPublishedWorkflow();
  if (publishedWorkflow) {
    downloadTextFile(publishedWorkflow.name, publishedWorkflow.content);
  } else {
    const link = document.createElement("a");
    link.href = config.currentWorkflowUrl || "workflows/current-class-workflow.json";
    link.download = config.currentWorkflowName || "after-class-current-workflow.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  setAction("קובץ התרגיל הורד למחשב.", "success");
  window.setTimeout(release, 800);
});

document.querySelector("#joinLab").addEventListener("click", async () => {
  if (state.student) {
    setAction("כבר הצטרפת לשיעור. אין צורך ללחוץ שוב.", "success");
    return;
  }

  const release = setButtonBusy(joinButton, "מצטרף...");
  setAction("מצרף אותך לשיעור ורושם בגיליון...", "busy");
  const name = document.querySelector("#studentName").value.trim() || "תלמיד/ה";
  const sessionCode = sessionCodeInput.value.trim() || defaultSessionCode;

  if (!apiUrl) {
    activeStudents.textContent = Number(activeStudents.textContent) + 1;
    state.student = { id: `demo-${Date.now()}`, name };
    setAction("הצטרפת במצב דמו.", "success");
    joinButton.textContent = "מחובר";
    joinButton.disabled = true;
    return;
  }

  try {
    const payload = await callApi("join", { name, sessionCode });
    if (!payload.ok) {
      setConnection(payload.error || "לא ניתן להצטרף לשיעור", "error");
      release();
      return;
    }

    state.student = payload.student;
    state.session = payload.session;
    setConnection("הצטרפת לשיעור. הפעילות שלך נשמרת בגיליון.", "connected");
    setAction("הצטרפת בהצלחה. אפשר להוריד תרגיל או להריץ בדיקה.", "success");
    joinButton.textContent = "מחובר";
    joinButton.disabled = true;
    await refreshState();
  } catch (error) {
    setConnection(error.message, "error");
    setAction(error.message, "error");
    release();
  }
});

document.querySelector("#helpRequest").addEventListener("click", async () => {
  const release = setButtonBusy(helpButton, "שולח עזרה...");
  setAction("שולח בקשת עזרה למורה...", "busy");
  const name = document.querySelector("#studentName").value.trim() || "תלמיד/ה";

  if (!apiUrl || !state.session || !state.student) {
    needsHelp.textContent = Number(needsHelp.textContent) + 1;
    pushFeed({
      status: "help",
      icon: "!",
      name,
      title: "בקשת עזרה",
      detail: "מצב דמו. בגרסה המחוברת זה יירשם בגיליון.",
    });
    setAction("בקשת עזרה נרשמה במצב דמו.", "success");
    release();
    return;
  }

  try {
    const payload = await callApi("requestHelp", {
      sessionId: state.session.id,
      studentId: state.student.id,
      reason: "התלמיד ביקש עזרה מהממשק",
    });

    if (payload.ok) {
      setAction("בקשת העזרה נשלחה למורה.", "success");
      await refreshState();
    } else {
      setAction(payload.error || "בקשת העזרה לא נשלחה.", "error");
    }
  } catch (error) {
    setAction(error.message, "error");
  } finally {
    release();
  }
});

document.querySelector("#clearFeed").addEventListener("click", () => {
  state.feedClearedAt = Date.now();
  localStorage.setItem("afterClassFeedClearedAt", String(state.feedClearedAt));
  feedItems.length = 0;
  renderFeed();
});

document.querySelector("#cloneForClass").addEventListener("click", () => {
  setView("teacher-builder");
});

document.querySelector("#createSession").addEventListener("click", async () => {
  if (!apiUrl) {
    pushFeed({
      status: "ok",
      icon: "✓",
      name: "מערכת",
      title: "מפגש דמו נפתח",
      detail: "הכיתה מוכנה לתרגול דמו.",
    });
    return;
  }

  const payload = await callApi("createSession", {
    code: sessionCodeInput.value.trim() || defaultSessionCode,
    title: lessonTitle.value.trim() || "שיעור תרגול חי",
    teacher: "Teacher",
  });

  if (payload.ok) {
    state.session = payload.session;
    setConnection("שיעור חדש נוצר בגיליון.", "connected");
    await refreshState();
  }
});

document.querySelector("#workflowFileInput").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;

  try {
    const content = await file.text();
    JSON.parse(content);
    state.uploadedWorkflow = { name: file.name, content };
    workflowFileStatus.textContent = `הקובץ ${file.name} נטען בהצלחה ויוצע לתלמידים להורדה במחשב הזה.`;
    workflowFileStatus.className = "result-box success";
    updateLessonPreview();
    setTeacherNote("קובץ התרגיל נטען בהצלחה.", "success");
  } catch (error) {
    state.uploadedWorkflow = null;
    workflowFileStatus.textContent = "הקובץ לא תקין. צריך קובץ תרגיל בפורמט JSON.";
    workflowFileStatus.className = "result-box error";
    setTeacherNote("לא ניתן לקרוא את קובץ התרגיל.", "error");
  }
});

[lessonTitle, lessonGoal, guidedFix].forEach((field) => {
  field.addEventListener("input", updateLessonPreview);
});

document.querySelector("#publishLesson").addEventListener("click", async () => {
  updateLessonPreview();
  if (!state.uploadedWorkflow) {
    setTeacherNote("צריך להעלות קובץ תרגיל לפני פרסום לכיתה.", "error");
    return;
  }

  const release = setButtonBusy(document.querySelector("#publishLesson"), "מפרסם...");
  localStorage.setItem(
    "afterClassLesson",
    JSON.stringify({
      title: lessonTitle.value.trim(),
      goal: lessonGoal.value.trim(),
      guidedFix: guidedFix.value.trim(),
      webhookUrl: webhookUrlInput.value.trim(),
      workflowName: state.uploadedWorkflow?.name || config.currentWorkflowName,
    })
  );

  try {
    if (apiUrl) {
      await postFormApi("publishExercise", {
        sessionCode: sessionCodeInput.value.trim() || defaultSessionCode,
        title: lessonTitle.value.trim(),
        goal: lessonGoal.value.trim(),
        description: guidedFix.value.trim(),
        webhookUrl: webhookUrlInput.value.trim(),
        workflowFileName: state.uploadedWorkflow.name,
        workflowJson: state.uploadedWorkflow.content,
      });
      await refreshState();
    }

    setTeacherNote("השיעור פורסם. כפתור הורד תרגיל יוריד עכשיו את הקובץ שהמורה העלה.", "success");
    pushFeed({
      status: "ok",
      icon: "✓",
      name: "מורה",
      title: "תרגיל פורסם לכיתה",
      detail: lessonTitle.value.trim() || "שיעור חדש",
    });
  } catch (error) {
    setTeacherNote(error.message || "פרסום התרגיל נכשל.", "error");
  } finally {
    release();
  }
});

document.querySelector("#downloadLessonPlan").addEventListener("click", () => {
  const text = [
    `שם השיעור: ${lessonTitle.value.trim()}`,
    "",
    `מטרה: ${lessonGoal.value.trim()}`,
    "",
    `תיקון מודרך: ${guidedFix.value.trim()}`,
    "",
    `כתובת בדיקה: ${webhookUrlInput.value.trim()}`,
    "",
    `קובץ תרגיל: ${state.uploadedWorkflow?.name || config.currentWorkflowName}`,
  ].join("\n");
  downloadTextFile("after-class-lesson-plan.txt", text, "text/plain");
  setTeacherNote("דף השיעור הורד למחשב.", "success");
});

const savedLesson = localStorage.getItem("afterClassLesson");
if (savedLesson) {
  try {
    const lesson = JSON.parse(savedLesson);
    lessonTitle.value = lesson.title || lessonTitle.value;
    lessonGoal.value = lesson.goal || lessonGoal.value;
    guidedFix.value = lesson.guidedFix || guidedFix.value;
    webhookUrlInput.value = lesson.webhookUrl || webhookUrlInput.value;
  } catch {
    localStorage.removeItem("afterClassLesson");
  }
}

renderFeed();
updateLessonPreview();
applyRoleMode();
setView("student");
refreshState();
if (apiUrl) window.setInterval(refreshState, refreshSeconds * 1000);
