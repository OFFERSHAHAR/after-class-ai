const SHEETS = {
  sessions: 'sessions',
  students: 'students',
  exercises: 'exercises',
  runs: 'runs',
  helpRequests: 'help_requests',
};

const SPREADSHEET_ID = '19GOHx2oq1ZsnkggJ-r-8TGvYvhYle3sAWifAzmL-rwQ_';

function doGet(event) {
  const action = event.parameter.action || 'state';
  const payload = route(action, event.parameter);
  return jsonResponse(payload);
}

function doPost(event) {
  const body = event.postData && event.postData.contents
    ? JSON.parse(event.postData.contents)
    : {};
  const action = body.action || 'state';
  const payload = route(action, body);
  return jsonResponse(payload);
}

function route(action, data) {
  if (action === 'state') return getState(data.sessionCode);
  if (action === 'join') return joinSession(data);
  if (action === 'createRun') return createRun(data);
  if (action === 'requestHelp') return requestHelp(data);
  if (action === 'createSession') return createSession(data);
  return { ok: false, error: 'Unknown action: ' + action };
}

function getState(sessionCode) {
  const sessions = readObjects(SHEETS.sessions);
  const session = sessionCode
    ? sessions.find((row) => row.code === sessionCode)
    : sessions.find((row) => row.status === 'active');

  if (!session) return { ok: false, error: 'No active session found' };

  const students = readObjects(SHEETS.students)
    .filter((row) => row.session_id === session.id);
  const runs = readObjects(SHEETS.runs)
    .filter((row) => row.session_id === session.id)
    .slice(-30)
    .reverse();
  const helpRequests = readObjects(SHEETS.helpRequests)
    .filter((row) => row.session_id === session.id && row.status !== 'resolved');
  const exercises = readObjects(SHEETS.exercises);

  return { ok: true, session, students, runs, helpRequests, exercises };
}

function joinSession(data) {
  const sessions = readObjects(SHEETS.sessions);
  const session = sessions.find((row) => row.code === data.sessionCode);

  if (!session) return { ok: false, error: 'Session code not found' };
  if (session.join_open !== true && session.join_open !== 'TRUE') {
    return { ok: false, error: 'Joining is closed for this session' };
  }

  const student = {
    id: 'student-' + Date.now(),
    session_id: session.id,
    name: data.name || 'תלמיד/ה',
    joined_at: new Date(),
    workflow_id: '',
    workflow_url: '',
    status: 'active',
  };

  appendObject(SHEETS.students, student);
  return { ok: true, student, session };
}

function createRun(data) {
  const run = {
    id: 'run-' + Date.now(),
    session_id: data.sessionId,
    student_id: data.studentId,
    exercise_id: data.exerciseId,
    workflow_id: data.workflowId || '',
    status: data.status || 'success',
    message: data.message || 'Workflow run recorded',
    created_at: new Date(),
  };

  appendObject(SHEETS.runs, run);
  return { ok: true, run };
}

function requestHelp(data) {
  const help = {
    id: 'help-' + Date.now(),
    session_id: data.sessionId,
    student_id: data.studentId,
    reason: data.reason || 'צריך עזרה',
    status: 'open',
    created_at: new Date(),
    resolved_at: '',
  };

  appendObject(SHEETS.helpRequests, help);
  return { ok: true, help };
}

function createSession(data) {
  const session = {
    id: 'session-' + Date.now(),
    code: data.code || createCode(),
    title: data.title || 'שיעור חדש',
    date: new Date(),
    teacher: data.teacher || 'Teacher',
    active_exercise_id: data.activeExerciseId || 'exercise-lead-bot',
    status: 'active',
    join_open: true,
  };

  appendObject(SHEETS.sessions, session);
  return { ok: true, session };
}

function readObjects(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error('Missing sheet: ' + sheetName);

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  return values.slice(1).filter((row) => row.some(Boolean)).map((row) => {
    const object = {};
    headers.forEach((header, index) => {
      object[header] = row[index];
    });
    return object;
  });
}

function appendObject(sheetName, object) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) throw new Error('Missing sheet: ' + sheetName);

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const row = headers.map((header) => object[header] === undefined ? '' : object[header]);
  sheet.appendRow(row);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function createCode() {
  return 'AI-' + Math.floor(100 + Math.random() * 900);
}
