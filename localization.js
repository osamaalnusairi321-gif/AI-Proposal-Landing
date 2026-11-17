/* Visitor-facing dynamic copy; static Arabic lives in ar/index.html. */
const REGISTRATION_COPY = {
  en: {
    waitlist: 'Waitlist', pilot: 'Pilot Partner', selected: 'Selected: ',
    join: 'Join Waitlist', apply: 'Apply for Pilot', sending: 'Submitting…',
    incomplete: 'Complete the required fields with valid details to continue.',
    consent: 'Check the pilot commitment above to continue.',
    readyPilot: 'Your pilot application is ready to submit. Phone is optional.',
    readyWaitlist: 'Your registration is ready to submit. Phone is optional.',
    unavailable: 'Registration is temporarily unavailable. Please try again later.'
  },
  ar: {
    waitlist: 'قائمة الانتظار', pilot: 'البرنامج التجريبي', selected: 'نوع التسجيل: ',
    join: 'انضم إلى قائمة الانتظار', apply: 'قدّم طلب الانضمام للبرنامج التجريبي', sending: 'جارٍ إرسال طلبك…',
    incomplete: 'أكمل بياناتك حتى تتمكن من إرسال الطلب.',
    consent: 'ضع علامة في المربع للموافقة على شروط التجربة.',
    readyPilot: 'طلبك جاهز. اضغط على الزر أدناه لإرساله.',
    readyWaitlist: 'يمكنك الآن الانضمام إلى قائمة الانتظار.',
    unavailable: 'لا يمكن إرسال الطلب الآن. حاول مرة أخرى لاحقًا.'
  }
};
if (typeof module !== 'undefined') module.exports = REGISTRATION_COPY;
