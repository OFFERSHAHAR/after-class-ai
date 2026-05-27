const SHEETS = {
  sessions: 'sessions',
  students: 'students',
  exercises: 'exercises',
  runs: 'runs',
  helpRequests: 'help_requests',
};

const SPREADSHEET_ID = '19GOHx2oq1ZsnkggJ-r-8TGvYvhYle3sAWifAzmL-rwQ';

const BRAND = {
  black: '#111111',
  red: '#D40000',
  deepRed: '#8B0000',
  gold: '#D6A21E',
  cream: '#FFF8E7',
  silver: '#E5E7EB',
  graphite: '#2B2B2B',
  green: '#138A36',
  orange: '#C66A00',
  blue: '#1F5FBF',
};

const SHEET_SCHEMAS = {
  dashboard: {
    headers: ['metric', 'value', 'note'],
    rows: [
      ['Active session', '=IFERROR(INDEX(FILTER(sessions!C2:C,sessions!G2:G="active"),1),"No active session")', 'Current open class'],
      ['Active students', '=COUNTIF(students!G2:G,"active")', 'Students currently in lab'],
      ['Successful runs', '=COUNTIF(runs!F2:F,"success")', 'All recorded successes'],
      ['Open help requests', '=COUNTIF(help_requests!E2:E,"open")', 'Students waiting for help'],
      ['Last run', '=IFERROR(INDEX(SORT(runs!H2:H,runs!H2:H,FALSE),1),"No runs yet")', 'Most recent execution'],
    ],
  },
  sessions: {
    headers: ['id', 'code', 'title', 'date', 'teacher', 'active_exercise_id', 'status', 'join_open'],
    rows: [
      ['session-001', 'AI-203', 'Webhooks and AI', new Date(), 'Teacher', 'exercise-lead-bot', 'active', true],
    ],
  },
  students: {
    headers: ['id', 'session_id', 'name', 'joined_at', 'workflow_id', 'workflow_url', 'status'],
    rows: [
      ['student-001', 'session-001', 'Noa', new Date(), '123', 'http://127.0.0.1:5678/workflow/123', 'active'],
    ],
  },
  exercises: {
    headers: ['id', 'title', 'level', 'description', 'template_file', 'status'],
    rows: [
      ['exercise-lead-bot', 'Lead Bot', 'Intermediate', 'Webhook classifies a lead and returns a result', 'workflows/lead-bot-template.json', 'active'],
      ['exercise-webhook-echo', 'Webhook Echo', 'Beginner', 'Receive JSON and return a clean response', 'workflows/webhook-echo-template.json', 'active'],
      ['exercise-ticket-router', 'Ticket Router', 'Business', 'Route tickets by topic and urgency', 'workflows/ticket-router-template.json', 'active'],
    ],
  },
  runs: {
    headers: ['id', 'session_id', 'student_id', 'exercise_id', 'workflow_id', 'status', 'message', 'created_at'],
    rows: [
      ['run-001', 'session-001', 'student-001', 'exercise-lead-bot', '123', 'success', 'Webhook returned 200', new Date()],
      ['run-002', 'session-001', 'student-001', 'exercise-lead-bot', '123', 'running', 'Testing payload validation', new Date()],
      ['run-003', 'session-001', 'student-001', 'exercise-lead-bot', '123', 'failed', 'Missing email field in JSON', new Date()],
    ],
  },
  help_requests: {
    headers: ['id', 'session_id', 'student_id', 'reason', 'status', 'created_at', 'resolved_at'],
    rows: [
      ['help-001', 'session-001', 'student-001', 'credentials error', 'open', new Date(), ''],
    ],
  },
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('After Class AI')
    .addItem('Setup / reset sheets', 'setupAfterClassSheets')
    .addItem('Refresh Ferrari styling', 'styleAfterClassSheets')
    .addToUi();
}

function setupAfterClassSheets() {
  const spreadsheet = getSpreadsheet();

  Object.keys(SHEET_SCHEMAS).forEach((sheetName) => {
    const schema = SHEET_SCHEMAS[sheetName];
    const sheet = getOrCreateSheet(spreadsheet, sheetName);
    sheet.clear();
    sheet.clearConditionalFormatRules();
    sheet.getRange(1, 1, 1, schema.headers.length).setValues([schema.headers]);

    if (schema.rows.length) {
      sheet.getRange(2, 1, schema.rows.length, schema.headers.length).setValues(schema.rows);
    }
  });

  styleAfterClassSheets();
  addValidations();
  SpreadsheetApp.flush();
  return 'After Class AI sheets were created and styled.';
}

function styleAfterClassSheets() {
  const spreadsheet = getSpreadsheet();
  const order = ['dashboard', 'sessions', 'students', 'exercises', 'runs', 'help_requests'];

  order.forEach((sheetName, index) => {
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return;
    spreadsheet.setActiveSheet(sheet);
    spreadsheet.moveActiveSheet(index + 1);
    styleSheet(sheet, sheetName);
  });

  styleDashboard(spreadsheet.getSheetByName('dashboard'));
}

function doGet(event) {
  const action = event.parameter.action || 'state';
  const payload = route(action, event.parameter);
  return jsonResponse(payload, event.parameter.callback);
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
  if (action === 'reportRun') return reportRun(data);
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

function reportRun(data) {
  const sessions = readObjects(SHEETS.sessions);
  const session = data.sessionId
    ? sessions.find((row) => row.id === data.sessionId)
    : sessions.find((row) => row.code === data.sessionCode) || sessions.find((row) => row.status === 'active');

  if (!session) return { ok: false, error: 'No matching session found' };

  const actorName = data.actorName || data.studentName || 'Teacher';
  const workflowName = data.workflowName || 'n8n workflow';
  const status = data.status || 'success';
  const message = data.message || `${workflowName} reported ${status}`;

  const run = {
    id: 'run-' + Date.now(),
    session_id: session.id,
    student_id: actorName,
    exercise_id: session.active_exercise_id || data.exerciseId || '',
    workflow_id: data.workflowId || workflowName,
    status,
    message: `${workflowName}: ${message}`,
    created_at: new Date(),
  };

  appendObject(SHEETS.runs, run);
  return { ok: true, run, session };
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

function jsonResponse(payload, callback) {
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(payload) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) return activeSpreadsheet;
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet(spreadsheet, sheetName) {
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

function styleSheet(sheet, sheetName) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const lastRow = Math.max(sheet.getLastRow(), 1);
  const fullRange = sheet.getRange(1, 1, Math.max(lastRow, 50), lastColumn);
  const header = sheet.getRange(1, 1, 1, lastColumn);

  sheet.setFrozenRows(1);
  sheet.setHiddenGridlines(true);
  try {
    sheet.setRightToLeft(false);
  } catch (error) {
    // Older Sheets runtimes may not expose RTL controls on Sheet.
  }

  fullRange
    .setFontFamily('Arial')
    .setFontSize(10)
    .setVerticalAlignment('middle')
    .setWrap(true);

  header
    .setBackground(BRAND.black)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(11)
    .setBorder(true, true, true, true, true, true, BRAND.gold, SpreadsheetApp.BorderStyle.SOLID_MEDIUM);

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastColumn)
      .setBackground(BRAND.cream)
      .setFontColor(BRAND.graphite)
      .setBorder(true, true, true, true, true, true, '#F0E4C4', SpreadsheetApp.BorderStyle.SOLID);
  }

  sheet.autoResizeColumns(1, lastColumn);
  for (let column = 1; column <= lastColumn; column += 1) {
    const width = Math.min(Math.max(sheet.getColumnWidth(column), 120), 260);
    sheet.setColumnWidth(column, width);
  }
  sheet.setRowHeights(1, Math.max(lastRow, 20), 30);
  sheet.setRowHeight(1, 38);
  const existingFilter = sheet.getFilter();
  if (existingFilter) existingFilter.remove();
  sheet.getDataRange().createFilter();
  addStatusFormatting(sheet, sheetName);
}

function styleDashboard(sheet) {
  if (!sheet) return;

  sheet.getRange('A1:C1')
    .setBackground(BRAND.deepRed)
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setFontSize(12);

  sheet.getRange('A2:C6')
    .setBackground('#FFFFFF')
    .setBorder(true, true, true, true, true, true, BRAND.silver, SpreadsheetApp.BorderStyle.SOLID);

  sheet.getRange('B2:B6')
    .setBackground(BRAND.black)
    .setFontColor(BRAND.gold)
    .setFontWeight('bold')
    .setFontSize(13);

  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 260);
}

function addStatusFormatting(sheet, sheetName) {
  const statusColumnBySheet = {
    sessions: 7,
    students: 7,
    exercises: 6,
    runs: 6,
    help_requests: 5,
  };
  const statusColumn = statusColumnBySheet[sheetName];
  if (!statusColumn) return;

  const range = sheet.getRange(2, statusColumn, Math.max(sheet.getMaxRows() - 1, 1), 1);
  const rules = [
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('active')
      .setBackground('#E7F6EC')
      .setFontColor(BRAND.green)
      .setRanges([range])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('success')
      .setBackground('#E7F6EC')
      .setFontColor(BRAND.green)
      .setRanges([range])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('running')
      .setBackground('#EAF1FF')
      .setFontColor(BRAND.blue)
      .setRanges([range])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('open')
      .setBackground('#FFE9E9')
      .setFontColor(BRAND.red)
      .setRanges([range])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('failed')
      .setBackground('#FFE9E9')
      .setFontColor(BRAND.red)
      .setRanges([range])
      .build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo('closed')
      .setBackground('#F3F4F6')
      .setFontColor('#6B7280')
      .setRanges([range])
      .build(),
  ];
  sheet.setConditionalFormatRules(rules);
}

function addValidations() {
  const spreadsheet = getSpreadsheet();
  const validations = [
    { sheet: 'sessions', range: 'G2:G', values: ['draft', 'active', 'closed'] },
    { sheet: 'sessions', range: 'H2:H', values: ['TRUE', 'FALSE'] },
    { sheet: 'students', range: 'G2:G', values: ['active', 'done', 'inactive'] },
    { sheet: 'exercises', range: 'F2:F', values: ['active', 'archived'] },
    { sheet: 'runs', range: 'F2:F', values: ['running', 'success', 'failed'] },
    { sheet: 'help_requests', range: 'E2:E', values: ['open', 'in_progress', 'resolved'] },
  ];

  validations.forEach((item) => {
    const sheet = spreadsheet.getSheetByName(item.sheet);
    if (!sheet) return;
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(item.values, true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(item.range).setDataValidation(rule);
  });
}

function createCode() {
  return 'AI-' + Math.floor(100 + Math.random() * 900);
}
