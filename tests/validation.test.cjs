const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { validateRegistration, normalizeCompanyWebsite } = require('../validation.js');
const valid = { fullName: 'محمد O’Neill', email: 'name+team@example.co.uk', company: '3M & Partners', companyWebsite: 'example.com', phone: '' };
test('valid international names, company names and optional phone pass', () => assert.deepEqual(validateRegistration(valid), {}));
for (const [key, values] of Object.entries({
 fullName: ['', '   ', '12345', 'Name123', '<script>'],
 email: ['', 'hello', 'a@localhost', 'a..b@example.com', '.a@example.com', 'a@example..com', 'a@-example.com', 'a@com', 'a b@example.com'],
 company: ['', '   ', '***', '<b>company</b>'],
 companyWebsite: ['', 'hello', 'javascript:alert(1)', 'ftp://example.com', 'https://localhost', 'https://example..com', 'https://user@example.com', 'https://example.com:99999', 'https://example.com/%zz'],
 phone: ['+966500000000', '966 500000000', '123abc456', '123456', '1234567890123456', '١٢٣٤٥٦٧٨٩']
})) {
 test('rejects invalid ' + key, () => { for (const value of values) assert.ok(validateRegistration({...valid,[key]:value})[key], `${key}: ${value}`); });
}
test('accepts HTTP(S) websites and domains; normalizes plain domains', () => {
 for (const companyWebsite of ['example.com','www.example.com','https://example.com/about','http://example.co.uk/?q=1','https://example.com:443']) assert.equal(validateRegistration({...valid,companyWebsite}).companyWebsite, undefined);
 assert.equal(normalizeCompanyWebsite(' example.com '),'https://example.com');
 assert.equal(normalizeCompanyWebsite('http://example.com'),'http://example.com');
});
test('accepts 7–15 phone digits and rejects additional symbols', () => {
 for (const phone of ['1234567','966500000000','123456789012345']) assert.equal(validateRegistration({...valid,phone}).phone, undefined);
});
test('deployed backend source contains identical validation rules', () => {
 const root=path.join(__dirname,'..');
 assert.ok(fs.readFileSync(path.join(root,'backend/Code.gs'),'utf8').endsWith(fs.readFileSync(path.join(root,'validation.js'),'utf8')));
});

test('Arabic rules match English validity and localize every error', () => {
 const scenarios=[{}, {...valid,fullName:'123'}, {...valid,email:'bad'}, {...valid,company:'***'}, {...valid,companyWebsite:'javascript:bad'}, {...valid,phone:'abc'}];
 for(const values of scenarios){
  const en=validateRegistration(values), ar=validateRegistration({...values,language:'ar'});
  assert.deepEqual(Object.keys(ar),Object.keys(en));
  for(const message of Object.values(ar))assert.match(message,/[\u0600-\u06ff]/);
 }
});
test('English and Arabic dynamic copy have identical nonempty keys', () => {
 const copy=require('../localization.js');
 assert.deepEqual(Object.keys(copy.ar),Object.keys(copy.en));
 for(const value of Object.values(copy.ar))assert.match(value,/[\u0600-\u06ff]/);
});
