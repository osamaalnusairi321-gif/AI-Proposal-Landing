(() => {
  'use strict';
  const form = document.getElementById('interest-form');
  const category = document.getElementById('category');
  const consentWrap = document.getElementById('pilot-consent-wrap');
  const consent = document.getElementById('pilot-consent');
  const selected = document.getElementById('selected-label');
  const status = document.getElementById('form-status');
  const hint = document.getElementById('form-hint');
  const submit = document.getElementById('submit-button');
  const fields = ['full-name', 'email', 'company', 'company-website', 'phone'].map(id => document.getElementById(id));
  const touched = new Set();
  const planButtons = [...document.querySelectorAll('[data-plan], .segment-button')];
  const waitlistButton = document.getElementById('choose-waitlist');
  const pilotButton = document.getElementById('choose-pilot');
  let submitting = false;

  function validate() {
    const values = Object.fromEntries(fields.map(input => [input.name, input.value]));
    const errors = validateRegistration(values);
    fields.forEach(input => {
      const message = errors[input.name] || '';
      input.setCustomValidity(message);
      const show = Boolean(message && touched.has(input));
      input.setAttribute('aria-invalid', String(show));
      const error = document.getElementById(input.id + '-error');
      error.textContent = show ? message : '';
      error.hidden = !show;
    });
    return Object.keys(errors).length === 0 && (category.value !== 'pilot' || consent.checked);
  }

  function updateButton() {
    const valid = validate();
    submit.disabled = submitting || !valid;
    submit.setAttribute('aria-disabled', String(submit.disabled));
    submit.textContent = submitting ? 'Submitting…' : category.value === 'pilot' ? 'Apply for Pilot' : 'Join Waitlist';
    if (!fields.every(input => (!input.required || input.value.trim()) && input.checkValidity())) {
      hint.textContent = 'Complete the required fields with valid details to continue.';
    } else if (category.value === 'pilot' && !consent.checked) {
      hint.textContent = 'Check the pilot commitment above to continue.';
    } else {
      hint.textContent = category.value === 'pilot' ? 'Your pilot application is ready to submit. Phone is optional.' : 'Your registration is ready to submit. Phone is optional.';
    }
  }

  function selectPlan(plan, shouldScroll = false) {
    if (submitting) return;
    const pilot = plan === 'pilot';
    category.value = pilot ? 'pilot' : 'waitlist';
    consentWrap.hidden = !pilot;
    consent.disabled = !pilot;
    consent.required = pilot;
    if (!pilot) consent.checked = false;
    waitlistButton.setAttribute('aria-pressed', String(!pilot));
    pilotButton.setAttribute('aria-pressed', String(pilot));
    selected.textContent = `Selected: ${pilot ? 'Pilot Partner' : 'Waitlist'}`;
    status.textContent = '';
    status.className = 'form-status';
    updateButton();
    if (shouldScroll) document.getElementById('registration').scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'start'
    });
  }

  // Delegation covers typing, pasting, autofill events and the checkbox.
  form.addEventListener('input', event => {
    if (fields.includes(event.target)) touched.add(event.target);
    updateButton();
  });
  form.addEventListener('focusout', event => {
    if (fields.includes(event.target)) touched.add(event.target);
    updateButton();
  });
  form.addEventListener('change', updateButton);
  form.addEventListener('focusin', updateButton);
  document.querySelectorAll('[data-plan]').forEach(button => button.addEventListener('click', () => selectPlan(button.dataset.plan, true)));
  waitlistButton.addEventListener('click', () => selectPlan('waitlist'));
  pilotButton.addEventListener('click', () => selectPlan('pilot'));
  document.getElementById('year').textContent = new Date().getFullYear();

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (submitting) return;
    fields.forEach(input => { input.value = input.value.trim(); });
    status.className = 'form-status';
    status.textContent = '';
    if (!validate()) {
      updateButton();
      fields.forEach(input => touched.add(input));
      updateButton();
      const invalid = fields.find(input => !input.validity.valid);
      (invalid || consent).focus();
      return;
    }

    const endpoint = String(window.PROPOSAL_ENGINE_CONFIG?.submissionUrl || '').trim();
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(endpoint)) {
      status.textContent = 'Registration is temporarily unavailable. Please try again later.';
      status.classList.add('error');
      return;
    }

    const website = document.getElementById('company-website');
    website.value = normalizeCompanyWebsite(website.value);
    form.action = endpoint;
    submitting = true;
    form.setAttribute('aria-busy', 'true');
    planButtons.forEach(button => { button.disabled = true; });
    updateButton();
    // A native POST reaches Apps Script without cross-origin fetch restrictions.
    // The backend confirms success only after the registration has been saved.
    HTMLFormElement.prototype.submit.call(form);
  });

  // Restore usable controls when returning from the backend confirmation page.
  window.addEventListener('pageshow', () => {
    submitting = false;
    form.removeAttribute('aria-busy');
    planButtons.forEach(button => { button.disabled = false; });
    selectPlan(category.value);
  });
  window.addEventListener('focus', updateButton);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateButton(); });
  selectPlan(category.value);
})();
