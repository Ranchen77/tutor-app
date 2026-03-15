const KEY   = import.meta.env.VITE_TEXTBELT_KEY;
const PHONE = import.meta.env.VITE_PARENT_PHONE;

/**
 * Sends an SMS to the parent via Textbelt.
 * Silently no-ops if env vars aren't configured.
 */
export async function notifyParent(childName, subject, score, total) {
  if (!KEY || !PHONE) return;

  const label = subject.charAt(0).toUpperCase() + subject.slice(1);
  const message = `📚 ${childName} just finished ${label} — scored ${score}/${total}!`;

  try {
    await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: PHONE, message, key: KEY }),
    });
  } catch {
    // best-effort — don't block the UI if SMS fails
  }
}
