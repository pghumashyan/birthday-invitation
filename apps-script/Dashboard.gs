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
 *   1. Open your RSVP sheet and copy its ID out of the address bar:
 *        docs.google.com/spreadsheets/d/  THIS_LONG_PART  /edit
 *   2. Go to script.google.com -> New project. Name it "RSVP Dashboard".
 *   3. Delete the sample code, paste this whole file, set SHEET_ID below.
 *   4. Deploy -> New deployment -> type "Web app".
 *        Execute as:      Me
 *        Who has access:  Only myself      <-- NOT "Anyone"
 *   5. Open the /exec URL it gives you. Bookmark it on your phone.
 *
 * Only your Google account can open that URL — Google does the authentication,
 * so this is real access control, not a password check inside the page.
 */

var CONFIG = {
  sheetId: 'PASTE_YOUR_SHEET_ID_HERE',
  eventDate: '2026-09-28T17:00:00+04:00',
  goingLabel: 'Գալիս է',
  title: 'Ցոլակ Խաչատրյանի 30-ամյակը',
  venue: 'Florence Restaurant',
};

function doGet() {
  return HtmlService.createHtmlOutput(renderPage(readRsvps()))
    .setTitle('RSVP — ' + CONFIG.title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ---------------------------------------------------------------- data ---- */

function readRsvps() {
  var sheet = SpreadsheetApp.openById(CONFIG.sheetId).getSheets()[0];
  var rows = sheet.getDataRange().getValues().slice(1); // drop header

  var going = [];
  var declined = [];
  var totalPeople = 0;
  var seen = {};

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (!r[1]) continue; // no name -> not a real row

    var name = String(r[1]).trim();
    var key = name.toLowerCase();
    // Nothing stops a guest submitting twice. Flag repeats rather than
    // silently double-counting them in the table booking.
    var duplicate = Object.prototype.hasOwnProperty.call(seen, key);
    seen[key] = true;

    var entry = {
      name: name,
      count: Number(r[3]) || 0,
      when: r[0],
      duplicate: duplicate,
    };

    if (String(r[2]).trim() === CONFIG.goingLabel) {
      going.push(entry);
      totalPeople += entry.count;
    } else {
      declined.push(entry);
    }
  }

  // Newest first — the latest reply is usually what you opened this to see.
  going.reverse();
  declined.reverse();

  return {
    going: going,
    declined: declined,
    totalPeople: totalPeople,
    responses: going.length + declined.length,
    extraGuests: totalPeople - going.length, // plus-ones beyond the repliers
    daysLeft: daysUntilEvent(),
    duplicates: going.concat(declined).filter(function (g) { return g.duplicate; }).length,
  };
}

function daysUntilEvent() {
  var ms = new Date(CONFIG.eventDate).getTime() - new Date().getTime();
  return ms <= 0 ? 0 : Math.ceil(ms / 86400000);
}

function fmtDate(v) {
  if (!v) return '';
  if (Object.prototype.toString.call(v) !== '[object Date]') return String(v);
  return Utilities.formatDate(v, 'Asia/Yerevan', 'dd.MM HH:mm');
}

/** Guest names are attacker-controlled text. Never interpolate them raw. */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* -------------------------------------------------------------- render ---- */

function guestRows(list, showCount) {
  if (!list.length) {
    return '<tr><td colspan="' + (showCount ? 3 : 2) + '" class="empty">Դատարկ է</td></tr>';
  }
  var out = '';
  for (var i = 0; i < list.length; i++) {
    var g = list[i];
    out +=
      '<tr>' +
      '<td class="name">' + esc(g.name) +
        (g.duplicate ? ' <span class="dup">կրկնվող</span>' : '') +
      '</td>' +
      (showCount ? '<td class="num">' + g.count + '</td>' : '') +
      '<td class="when">' + esc(fmtDate(g.when)) + '</td>' +
      '</tr>';
  }
  return out;
}

function renderPage(d) {
  var dupNote = d.duplicates
    ? '<div class="warn">⚠️ ' + d.duplicates +
      ' կրկնվող անուն — ստուգեք, որ մարդը երկու անգամ չհաշվվի։</div>'
    : '';

  return '' +
'<!DOCTYPE html><html lang="hy"><head><meta charset="utf-8">' +
'<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Armenian:wght@400;500;600&display=swap" rel="stylesheet">' +
'<style>' +
'*{box-sizing:border-box}' +
'body{margin:0;padding:20px 14px 56px;background:#fdf8f3;color:#2a2119;' +
'     font-family:"Noto Sans Armenian",system-ui,sans-serif;line-height:1.55}' +
'.wrap{max-width:760px;margin:0 auto}' +
'h1{font-size:19px;margin:0 0 2px;font-weight:600}' +
'.sub{color:#7a6b5d;font-size:13px;margin-bottom:20px}' +
'.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:10px;margin-bottom:14px}' +
'.stat{background:#fff;border:1px solid #e3d6c8;border-radius:14px;padding:14px}' +
'.stat .k{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7a6b5d}' +
'.stat .v{font-size:29px;font-weight:600;line-height:1.15;margin-top:2px}' +
'.stat.hero{background:#6f2733;border-color:#6f2733}' +
'.stat.hero .k{color:#d9bd8c}.stat.hero .v{color:#fff}' +
'.stat .hint{font-size:11px;color:#9a8d80;margin-top:2px}' +
'.warn{background:#fdf0d8;border:1px solid #e8d3a4;color:#7a5c14;border-radius:12px;' +
'      padding:10px 12px;font-size:13px;margin-bottom:18px}' +
'h2{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#7a6b5d;' +
'   margin:26px 0 8px;font-weight:600}' +
'table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e3d6c8;' +
'      border-radius:14px;overflow:hidden;font-size:14px}' +
'th{text-align:left;background:#f7e9e3;font-size:10px;letter-spacing:.1em;text-transform:uppercase;' +
'   color:#7a6b5d;padding:10px 12px;font-weight:600}' +
'td{padding:11px 12px;border-top:1px solid #f2e9dd}' +
'.name{font-weight:500}' +
'.num{text-align:center;font-weight:600;font-variant-numeric:tabular-nums;width:70px}' +
'.when{color:#9a8d80;font-size:12px;white-space:nowrap;width:90px}' +
'.dup{background:#fdf0d8;color:#8a6a1f;font-size:10px;padding:2px 6px;border-radius:999px}' +
'.empty{text-align:center;color:#9a8d80;padding:22px}' +
'.foot{margin-top:22px;font-size:12px;color:#9a8d80}' +
'</style></head><body><div class="wrap">' +

'<h1>' + esc(CONFIG.title) + '</h1>' +
'<div class="sub">' + esc(CONFIG.venue) + ' · մնացել է ' + d.daysLeft + ' օր · ' +
   esc(Utilities.formatDate(new Date(), 'Asia/Yerevan', 'dd.MM.yyyy HH:mm')) + '</div>' +

'<div class="stats">' +
'<div class="stat hero"><div class="k">Ընդամենը հոգի</div><div class="v">' + d.totalPeople + '</div>' +
'  <div class="hint" style="color:#d9bd8c">սեղանի համար</div></div>' +
'<div class="stat"><div class="k">Գալիս են</div><div class="v">' + d.going.length + '</div>' +
'  <div class="hint">+' + d.extraGuests + ' ուղեկից</div></div>' +
'<div class="stat"><div class="k">Չեն գալիս</div><div class="v">' + d.declined.length + '</div></div>' +
'<div class="stat"><div class="k">Պատասխաններ</div><div class="v">' + d.responses + '</div></div>' +
'</div>' +

dupNote +

'<h2>Գալիս են (' + d.going.length + ')</h2>' +
'<table><thead><tr><th>Անուն</th><th style="text-align:center">Հոգի</th><th>Երբ</th></tr></thead>' +
'<tbody>' + guestRows(d.going, true) + '</tbody></table>' +

'<h2>Չեն գալիս (' + d.declined.length + ')</h2>' +
'<table><thead><tr><th>Անուն</th><th>Երբ</th></tr></thead>' +
'<tbody>' + guestRows(d.declined, false) + '</tbody></table>' +

'<div class="foot">«Ընդամենը հոգի» = ռեստորանում ամրագրելու թիվը (ներառյալ պատասխանողները)։ ' +
'Թարմացնելու համար՝ refresh։</div>' +
'</div></body></html>';
}
