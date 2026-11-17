/**
 * Accuracy Proposal Engine — Google Apps Script Web App
 * Bound to the proposal registration spreadsheet. Deploy as a Web app:
 * Execute as Me; access Anyone. No spreadsheet data is returned to visitors.
 */
const SPREADSHEET_ID = '1ZsFV8YmBpBvLqPNfY2h_KZb9wvtp82Jna3FZkyQrduI';

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.websiteURL) return page('Thank you.', true); // Bots triggering this trap are not written.
    const type = String(p.category || '').trim().toLowerCase();
    if (type !== 'pilot' && type !== 'waitlist') return page('Unknown registration type.', false);
    const pilot = type === 'pilot';
    const fullName = value(p.fullName, 100);
    const email = value(p.email, 160);
    const company = value(p.company, 160);
    const phone = value(p.phone, 30); // Optional for both plans
    if (!fullName || !company || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return page('Please fill in your name, work email and company.', false);
    if (pilot && p.pilotCommitment !== 'yes') return page('Pilot applicants must accept the participation commitment.', false);
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) return page('The service is busy. Please try again.', false);
    try {
      const tab = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(pilot ? 'Pilot Partners' : 'Waitlist');
      if (!tab) throw new Error('Target tab does not exist');
      // Prevent user-supplied values from becoming spreadsheet formulas.
      const safe = s => /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
      const row = [new Date(), safe(fullName), safe(email), safe(company), safe(phone)];
      tab.appendRow(pilot ? [...row, 'Yes', 'New', 'Accuracy Proposal Engine landing page'] : [...row, 'Accuracy Proposal Engine landing page']);
    } finally { lock.releaseLock(); }
    return page('Your registration has been received.', true);
  } catch (error) {
    console.error(error);
    return page('Registration could not be saved. Please try again later.', false);
  }
}
function value(raw, limit) { return String(raw || '').trim().slice(0, limit); }
function page(message, ok) {
  const heading = ok ? 'Thank you' : 'Something went wrong';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#7B1C2E"><title>${heading} | Accuracy</title></head><body style="margin:0;min-height:100dvh;display:grid;place-items:center;background:#FAFAF8;color:#1A0D10;font-family:Arial,sans-serif"><main style="background:white;border:1px solid #E0D9D5;border-top:3px solid #7B1C2E;padding:42px;max-width:490px;text-align:center;margin:20px"><img src="https://accuracyconsultancy.com/assets/logo.svg" alt="Accuracy Consultancy" width="185" height="60" style="display:block;margin:0 auto 32px"><h1 style="font-family:Georgia,serif;font-weight:400;font-size:42px;margin:0 0 20px">${heading}</h1><p style="color:#6B5A5E;line-height:1.7">${message}</p><a href="https://accuracyconsultancy.com/" target="_top" style="display:inline-block;margin-top:18px;color:#7B1C2E;text-underline-offset:4px">Visit our main website</a></main></body></html>`;
  return HtmlService.createHtmlOutput(html).setTitle(`${heading} | Accuracy`);
}
