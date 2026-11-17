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
    waitlist: 'قائمة الانتظار', pilot: 'البرنامج التجريبي', selected: 'اخترت: ',
    join: 'انضم إلى قائمة الانتظار', apply: 'قدّم طلبًا للمشاركة في البرنامج التجريبي', sending: 'جارٍ إرسال طلبك…',
    incomplete: 'أكمل الحقول المطلوبة ببيانات صحيحة للمتابعة.',
    consent: 'للمتابعة، وافق على متطلبات المشاركة الموضّحة أعلاه.',
    readyPilot: 'طلب المشاركة جاهز للإرسال. رقم الجوال اختياري.',
    readyWaitlist: 'بياناتك جاهزة للإرسال. رقم الجوال اختياري.',
    unavailable: 'التسجيل غير متاح مؤقتًا. يُرجى المحاولة لاحقًا.'
  }
};
if (typeof module !== 'undefined') module.exports = REGISTRATION_COPY;
