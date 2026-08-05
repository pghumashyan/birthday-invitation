/**
 * RSVP receiver for the birthday invitation site.
 *
 * Setup:
 *   1. Create a Google Sheet. Put these headers in row 1:
 *        A1: Ամսաթիվ   B1: Անուն   C1: Կարգավիճակ   D1: Հոգի
 *   2. Extensions -> Apps Script. Delete whatever is there, paste this file.
 *   3. Deploy -> New deployment -> type "Web app".
 *        Execute as:      Me
 *        Who has access:  Anyone          <-- NOT "Anyone with a Google account"
 *   4. Copy the /exec URL into CONFIG.endpoint in src/App.jsx.
 *
 * Total headcount in the sheet:  =SUM(D2:D)
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var data = JSON.parse(e.postData.contents);

    // A lock stops two guests submitting at the same instant from overwriting
    // each other's row.
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      sheet.appendRow([
        data.timestamp ? new Date(data.timestamp) : new Date(),
        String(data.guestName || ''),
        data.attending ? 'Գալիս է' : 'Չի գալիս',
        Number(data.totalCount) || 0
      ]);
    } finally {
      lock.releaseLock();
    }

    return json({ result: 'ok' });
  } catch (err) {
    return json({ result: 'error', message: String(err) });
  }
}

/** Lets you open the /exec URL in a browser to confirm the deploy is live. */
function doGet() {
  return json({ result: 'ok', message: 'RSVP endpoint is running' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
