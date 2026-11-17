const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync(require('node:path').join(__dirname, '../backend/Code.gs'), 'utf8');

function backend(options = {}) {
  const rows = [];
  let released = false;
  const context = vm.createContext({
    console: { error() {} },
    LockService: { getScriptLock: () => ({ tryLock: () => !options.busy, releaseLock: () => { released = true; } }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: tab => options.missingTab ? null : ({ getRange: () => ({ getValue: () => "", setValue() {} }), appendRow: row => {
      if (options.writeFails) throw Error('Write failed');
      rows.push({ tab, row });
    } }) }) },
    HtmlService: { createHtmlOutput: html => ({ html, setTitle() { return this; } }) }
  });
  vm.runInContext(code, context);
  return { post: parameter => context.doPost({ parameter }), rows, released: () => released };
}
const valid = { category: 'waitlist', fullName: 'Test Applicant', email: 'qa@example.com', company: 'Test Company', companyWebsite: 'example.com' };

test('waitlist saves without phone or pilot consent in the matching columns', () => {
  const app = backend();
  assert.match(app.post(valid).html, /Your registration has been received/);
  assert.equal(app.rows[0].tab, 'Waitlist');
  assert.deepEqual(Array.from(app.rows[0].row).slice(1), ['Test Applicant', 'qa@example.com', 'Test Company', '', 'Accuracy Proposal Engine landing page', 'https://example.com']);
  assert.ok(app.released());
});

test('pilot requires consent before saving', () => {
  const app = backend();
  assert.match(app.post({ ...valid, category: 'pilot' }).html, /must accept/);
  assert.equal(app.rows.length, 0);
});

test('pilot saves optional phone and approved commitment to Pilot Partners', () => {
  const app = backend();
  app.post({ ...valid, category: 'pilot', pilotCommitment: 'yes', phone: '966500000000' });
  assert.equal(app.rows[0].tab, 'Pilot Partners');
  assert.deepEqual(Array.from(app.rows[0].row).slice(4), ['966500000000', 'Yes', 'New', 'Accuracy Proposal Engine landing page', 'https://example.com']);
});

test('pilot also accepts an empty optional phone', () => {
  const app = backend();
  app.post({ ...valid, category: 'pilot', pilotCommitment: 'yes' });
  assert.equal(app.rows[0].row[4], '');
});

test('invalid email, blank names, blank company and unknown category never save', () => {
  for (const change of [{ email: 'qa@example' }, { fullName: '  ' }, { company: '' }, { category: 'other' }, { companyWebsite: '' }, { companyWebsite: 'javascript:alert(1)' }, { phone: 'abc' }]) {
    const app = backend();
    assert.match(app.post({ ...valid, ...change }).html, /Something went wrong/);
    assert.equal(app.rows.length, 0);
  }
});

test('formula-like user values stay literal text', () => {
  const app = backend();
  app.post({ ...valid, company: '=SUM(A1)' });
  assert.equal(app.rows[0].row[3], "'=SUM(A1)");
});

test('honeypot submissions do not write rows', () => {
  const app = backend();
  app.post({ ...valid, websiteURL: 'spam.example' });
  assert.equal(app.rows.length, 0);
});

test('busy or failed writes never show a saved confirmation', () => {
  for (const options of [{ busy: true }, { missingTab: true }, { writeFails: true }]) {
    const app = backend(options);
    const result = app.post(valid);
    assert.match(result.html, /Something went wrong/);
    assert.doesNotMatch(result.html, /Your registration has been received/);
    assert.equal(app.rows.length, 0);
    if (!options.busy) assert.ok(app.released());
  }
});
