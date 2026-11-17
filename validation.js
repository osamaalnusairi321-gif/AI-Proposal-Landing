/* Shared registration rules; also embedded in the Apps Script receiver. */
function validateRegistration(values) {
  const errors = {};
  const name = String(values.fullName || '').trim();
  const email = String(values.email || '').trim();
  const company = String(values.company || '').trim();
  const website = String(values.companyWebsite || '').trim();
  const phone = String(values.phone || '').trim();
  if (!name) errors.fullName = 'Enter your full name.';
  else if (name.length < 2 || name.length > 100 || !/^[\p{L}\p{M} .’'\-]+$/u.test(name) || !/\p{L}/u.test(name)) errors.fullName = 'Use letters, spaces, apostrophes, hyphens or periods for your name.';
  const parts = email.split('@');
  const host = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i;
  if (!email) errors.email = 'Enter your work email address.';
  else if (email.length > 160 || parts.length !== 2 || parts[0].length > 64 || !/^[a-z0-9.!#$%&'*+/=?^_\x60{|}~\-]+$/i.test(parts[0]) || /^\.|\.$|\.\./.test(parts[0]) || !host.test(parts[1])) errors.email = 'Enter a valid email address, such as you@company.com.';
  if (!company) errors.company = 'Enter your company name.';
  else if (company.length > 160 || !/[\p{L}\p{N}]/u.test(company) || /[\u0000-\u001f\u007f<>]/.test(company)) errors.company = 'Enter a valid company name using letters or numbers.';
  const websiteParts = website.match(/^(?:https?:\/\/)?([^/:?#]+)(?::([0-9]{1,5}))?(?:[/?#][^\s\\<>"{}|^]*)?$/i);
  if (!website) errors.companyWebsite = 'Enter your company website.';
  else if (website.length > 500 || !websiteParts || !host.test(websiteParts[1]) || (websiteParts[2] && (+websiteParts[2] < 1 || +websiteParts[2] > 65535)) || /%(?![a-f0-9]{2})/i.test(website)) errors.companyWebsite = 'Enter a valid website, such as https://company.com.';
  if (phone && !/^[0-9]{7,15}$/.test(phone)) errors.phone = 'Enter 7–15 digits only, including the country code. Do not use +, spaces or letters.';
  return errors;
}
function normalizeCompanyWebsite(website) {
  const trimmed = String(website || '').trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : 'https://' + trimmed;
}
if (typeof module !== 'undefined') module.exports = { validateRegistration, normalizeCompanyWebsite };
