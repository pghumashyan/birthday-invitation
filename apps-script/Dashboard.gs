/**
 * Private RSVP dashboard for the birthday invitation.
 *
 * WHY THIS IS A SEPARATE APPS SCRIPT PROJECT
 * ------------------------------------------
 * Code.gs is deployed with "Who has access: Anyone" so guests can submit. A
 * script project has only one doGet, so if the dashboard lived in that project
 * it would be served to anyone who opened the public /exec URL — the whole
 * guest list, published. Keeping it in its own project lets this one be
 * deployed "Only myself" while the receiver stays public.
 *
 * SETUP
 *   1. Open your RSVP sheet and copy its ID from the address bar:
 *        docs.google.com/spreadsheets/d/  THIS_PART  /edit
 *   2. Go to script.google.com -> New project. Name it "RSVP Dashboard".
 *   3. Delete the sample code, paste this whole file in, and set SHEET_ID below.
 *   4. Deploy -> New deployment -> type "Web app".
 *        Execute as:      Me
 *        Who has access:  Only myself       <-- NOT "Anyone"
 *   5. Open the /exec URL it gives you. Bookmark it.
 *
 * Only your Google account can open that URL. Google does the authentication,
 * so this is real access control, not a password check in the page.
 */

var CONFIG = {
  sheetId: 'PASTE_YOUR_SHEET_ID_HERE',
  eventDate: '2026-09-28T17:30:00+04:00',
  goingLabel: 'Գալիս է',
  title: 'Ցոլակ Խաչատրյանի 30-ամյակը',
};

function doGet() {
  var data = readRsvps();
  return HtmlService.createHtmlOutput(renderPage(data))
    .setTitle('RSVP — ' + CONFIG.title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Reads the sheet and rolls the rows up into the numbers worth seeing. */
function readRsvps() {
  var sheet = SpreadsheetApp.openById(CONFIG.sheetId).getSheets()[0];
  var values = sheet.getDataRange().getValues();
  var rows = values.slice(1); // drop the header row

  var guests = [];
  var totalPeople = 0;
  var going = 0;
  var declined = 0;
  var seen = {};

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r[1]) continue; // no name -> not a real row

    var name = String(r[1]).trim();
    var isGoing = String(r[2]).trim() === CONFIG.goingLabel;
    var count = Number(r[3]) || 0;

    // Nothing stops a guest submitting twice. Flag repeats rather than
    // silently double-counting them in your table booking.
    var key = name.toLowerCase();
    var duplicate = Object.prototype.hasOwnProperty.call(seen, key);
    seen[key] = true;

    if (isGoing) {
      going++;
      totalPeople += count;
    } else {
      declined++;
    }

    guests.push({
      timestamp: r[0],
      name: name,
      going: isGoing,
      count: count,
      duplicate: duplicate,
    });
  }

  // Newest first — the most recent reply is usually what you came to see.
  guests.reverse();

  return {
    guests: guests,
    totalPeople: totalPeople,
    going: going,
    declined: declined,
    responses: going + declined,
    daysLeft: daysUntilEvent(),
  };
}

function daysUntilEvent() {
  var ms = new Date(CONFIG.eventDate).getTime() - new Date().getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / 86400000);
}

function fmtDate(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) !== '[object Date]') return String(value);
  return Utilities.formatDate(value, 'Asia/Yerevan', 'dd.MM.yyyy HH:mm');
}

/** Guest names are attacker-controlled text. Never interpolate them raw. */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPage(d) {
  var rows = '';
  for (var i = 0; i < d.guests.length; i++) {
    var g = d.guests[i];
    rows +=
      '<tr class="' + (g.going ? '' : 'no') + '">' +
      '<td class="name">' + esc(g.name) +
        (g.duplicate ? ' <span class="dup" title="Այս անունն արդեն պատասխանել է">կրկնվող</span>' : '') +
      '</td>' +
      '<td>' + (g.going
        ? '<span class="pill yes">Գալիս է</span>'
        : '<span class="pill nope">Չի գալիս</span>') + '</td>' +
      '<td class="num">' + (g.going ? g.count : '—') + '</td>' +
      '<td class="when">' + esc(fmtDate(g.timestamp)) + '</td>' +
      '</tr>';
  }

  if (!rows) {
    rows = '<tr><td colspan="4" class="empty">Դեռ պատասխաններ չկան</td></tr>';
  }

  return '' +
'<!DOCTYPE html><html lang="hy"><head><meta charset="utf-8">' +
'<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Armenian:wght@400;500;600&display=swap" rel="stylesheet">' +
'<style>' +
'  *{box-sizing:border-box}' +
'  body{margin:0;padding:24px 16px 48px;background:#fdf8f3;color:#2a2119;' +
'       font-family:"Noto Sans Armenian",system-ui,sans-serif;line-height:1.6}' +
'  .wrap{max-width:820px;margin:0 auto}' +
'  h1{font-size:20px;margin:0 0 4px;font-weight:600}' +
'  .sub{color:#7a6b5d;font-size:13px;margin-bottom:24px}' +
'  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:28px}' +
'  .stat{background:#fff;border:1px solid #e3d6c8;border-radius:14px;padding:16px}' +
'  .stat .k{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#7a6b5d}' +
'  .stat .v{font-size:30px;font-weight:600;line-height:1.2;margin-top:4px}' +
'  .stat.hero{background:#6f2733;border-color:#6f2733}' +
'  .stat.hero .k{color:#d9bd8c}.stat.hero .v{color:#fff}' +
'  table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e3d6c8;' +
'        border-radius:14px;overflow:hidden;font-size:14px}' +
'  th{text-align:left;background:#f7e9e3;font-size:11px;letter-spacing:.1em;' +
'     text-transform:uppercase;color:#7a6b5d;padding:12px;font-weight:600}' +
'  td{padding:12px;border-top:1px solid #f0e6da;vertical-align:middle}' +
'  tr.no td{color:#9a8d80}' +
'  .name{font-weight:500}' +
'  .num{text-align:center;font-weight:600;font-variant-numeric:tabular-nums}' +
'  .when{color:#9a8d80;font-size:12px;white-space:nowrap}' +
'  .pill{display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px}' +
'  .pill.yes{background:#e6f2e6;color:#2f6b34}' +
'  .pill.nope{background:#f3ece8;color:#8a7a6d}' +
'  .dup{background:#fdf0d8;color:#8a6a1f;font-size:11px;padding:2px 7px;border-radius:999px}' +
'  .empty{text-align:center;color:#9a8d80;padding:32px}' +
'  .foot{margin-top:20px;font-size:12px;color:#9a8d80}' +
'  @media(max-width:520px){.when{display:none}th:nth-child(4){display:none}}' +
'</style></head><body><div class="wrap">' +
'<h1>' + esc(CONFIG.title) + '</h1>' +
'<div class="sub">Մնացել է ' + d.daysLeft + ' օր · թարմացվել է ' +
   esc(Utilities.formatDate(new Date(), 'Asia/Yerevan', 'dd.MM.yyyy HH:mm')) + '</div>' +
'<div class="stats">' +
'  <div class="stat hero"><div class="k">Ընդամենը հոգի</div><div class="v">' + d.totalPeople + '</div></div>' +
'  <div class="stat"><div class="k">Գալիս են</div><div class="v">' + d.going + '</div></div>' +
'  <div class="stat"><div class="k">Չեն գալիս</div><div class="v">' + d.declined + '</div></div>' +
'  <div class="stat"><div class="k">Պատասխաններ</div><div class="v">' + d.responses + '</div></div>' +
'</div>' +
'<table><thead><tr><th>Անուն</th><th>Կարգավիճակ</th><th>Հոգի</th><th>Երբ</th></tr></thead>' +
'<tbody>' + rows + '</tbody></table>' +
'<div class="foot">«Ընդամենը հոգի» = սեղան ամրագրելու թիվը։ Էջը թարմացնելու համար՝ refresh։</div>' +
'</div></body></html>';
}
