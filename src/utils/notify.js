const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const PARENT_EMAIL = 'ran2.chen@gmail.com';

/**
 * Sends an email to the parent via EmailJS.
 * Silently no-ops if env vars aren't configured.
 */
export async function notifyParent(childName, subject, score, total) {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) return;

  const label = subject.charAt(0).toUpperCase() + subject.slice(1);

  try {
    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: {
          to_email: PARENT_EMAIL,
          child_name: childName,
          subject_name: label,
          score: String(score),
          total: String(total),
        },
      }),
    });
  } catch {
    // best-effort — don't block the UI if email fails
  }
}
