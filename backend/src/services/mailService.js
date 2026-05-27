const RESEND_API_URL = 'https://api.resend.com/emails';
const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM;

async function sendPasswordResetEmail({ to, nome, resetLink, expiresAt }) {
  const formattedExpiry = expiresAt.toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });

  if (!resendApiKey || !resendFrom) {
    throw new Error('Resend non configurato: impostare RESEND_API_KEY e RESEND_FROM')
  }

  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [to],
      subject: 'Recupero password Trento Apartment Service',
      text: [
        `Ciao ${nome},`,
        '',
        'Abbiamo ricevuto una richiesta di reset password per il tuo account.',
        `Usa questo link per impostare una nuova password: ${resetLink}`,
        `Il link scade il: ${formattedExpiry}`,
        '',
        'Se non hai richiesto tu questo reset, puoi ignorare questa email.',
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="margin: 0 0 16px; color: #9a1528;">Recupero password</h2>
          <p>Ciao ${nome},</p>
          <p>Abbiamo ricevuto una richiesta di reset password per il tuo account.</p>
          <p>
            <a href="${resetLink}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#9a1528;color:#fff;text-decoration:none;">
              Imposta una nuova password
            </a>
          </p>
          <p>Il link scade il: <strong>${formattedExpiry}</strong></p>
          <p style="color:#6b7280;">Se non hai richiesto tu questo reset, puoi ignorare questa email.</p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend error ${response.status}: ${errorText}`)
  }

  return { skipped: false }
}

module.exports = {
  sendPasswordResetEmail,
};