/**
 * Nestloop Shop, booking capture
 * ------------------------------
 * Paste this into the Apps Script editor of the orders sheet, set SECRET,
 * and deploy it as a web app. The shop posts one row here the moment someone
 * presses Book, before WhatsApp opens, so the people who never press send in
 * WhatsApp still land in the sheet.
 *
 * SETUP, about three minutes
 *
 *  1. In the hey@nestloop.in Google account, create a new spreadsheet and
 *     call it "Nestloop Shop Orders".
 *  2. Extensions, then Apps Script. Delete whatever is in the editor.
 *  3. Paste this whole file in.
 *  4. Replace PUT_A_LONG_RANDOM_STRING_HERE below with a long random string.
 *     Mash the keyboard for 30 characters. This is the only thing stopping a
 *     stranger writing rows into your sheet, so treat it like a password and
 *     do not paste it into a chat.
 *  5. Save. Then Deploy, New deployment, type Web app.
 *       Execute as:      Me
 *       Who has access:  Anyone
 *     "Anyone" is required because the shop's server is not signed in to
 *     Google. The secret above is what actually guards it.
 *  6. Authorise when Google asks. It will warn that the app is unverified,
 *     which is normal for your own script: Advanced, then Go to the project.
 *  7. Copy the deployment URL. It ends in /exec.
 *
 * Then send Boldrin the URL and the secret by a private route, not in chat,
 * and they go into Vercel as BOOKING_SHEET_URL and BOOKING_SHEET_SECRET.
 *
 * IF YOU EDIT THIS LATER: a new deployment gets a new URL unless you choose
 * Manage deployments and edit the existing one. Editing the existing one keeps
 * the URL, which is what you want.
 */

var SECRET = 'PUT_A_LONG_RANDOM_STRING_HERE';

var SHEET_NAME = 'Orders';

var HEADERS = [
  'Received',
  'Order ID',
  'Status',
  'Unit code',
  'Title',
  'Name',
  'Phone',
  'Address',
  'Pincode',
  'Delivery date',
  'Delivery fee',
  'Warranty',
  'Pay choice',
  'Due now',
  'Total',
  'Source'
];

function doPost(e) {
  var lock = LockService.getScriptLock();

  try {
    // Two people booking in the same second must not land on the same row.
    lock.waitLock(10000);

    var body = JSON.parse(e.postData.contents);

    if (!body.secret || body.secret !== SECRET) {
      return reply({ ok: false, error: 'rejected' });
    }

    var sheet = getSheet();

    sheet.appendRow([
      formatWhen(body.receivedAt),
      body.orderId || '',
      'New',
      body.unitCode || '',
      body.title || '',
      body.name || '',
      // Leading apostrophe keeps +91 numbers as text. Without it Sheets eats
      // the plus sign and tries to do arithmetic on a phone number.
      body.phone ? "'" + body.phone : '',
      body.address || '',
      body.pincode ? "'" + body.pincode : '',
      body.deliveryDate || '',
      body.deliveryFee || '',
      body.warranty || '',
      body.payChoice || '',
      body.dueNow || 0,
      body.total || 0,
      body.source || 'shop'
    ]);

    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    try {
      lock.releaseLock();
    } catch (ignored) {}
  }
}

/** A browser hitting the URL should not see a stack trace. */
function doGet() {
  return reply({ ok: true, service: 'nestloop shop orders' });
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function formatWhen(iso) {
  try {
    return Utilities.formatDate(
      iso ? new Date(iso) : new Date(),
      'Asia/Kolkata',
      'yyyy-MM-dd HH:mm'
    );
  } catch (err) {
    return new Date();
  }
}

function reply(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
