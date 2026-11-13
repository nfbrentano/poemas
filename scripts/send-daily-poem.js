import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import nodemailer from 'nodemailer';
import { getPoemOfDay } from '../src/utils/poemOfDay.js';
import { reportError } from '../src/utils/error-reporter.js';

export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function formatPoemContentHtml(content) {
  const safeContent = escapeHtml(content || '');
  return safeContent
    .replace(/\r\n/g, '\n')
    .replace(/\n\n+/g, '</p><p style="margin: 1.5em 0; font-size: 18px; line-height: 2; color: #e2e2e2;">')
    .replace(/\n/g, '<br>');
}

export function buildDailyPoemEmailHtml({ poem, baseUrl = 'https://nfgbrentano.art.br/' }) {
  const safeTitle = escapeHtml(poem?.title || '');
  const poemContentHtml = formatPoemContentHtml(poem?.content || '');
  const safeBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const poemUrl = `${safeBaseUrl}poema/${encodeURIComponent(poem?.slug || '')}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #050505; font-family: Georgia, serif;">
  <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #050505;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" style="max-width: 600px; width: 100%;">
          <tr>
            <td style="text-align: center; padding-bottom: 40px; border-bottom: 1px solid #1a1a1a;">
              <p style="margin: 0; font-family: sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #666666;">Poema do Dia</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 60px 20px 20px;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 400; color: #e2e2e2; line-height: 1.2;">${safeTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <p style="margin: 1.5em 0; font-size: 18px; line-height: 2; color: #e2e2e2;">${poemContentHtml}</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 60px 20px 40px;">
              <a href="${poemUrl}" style="display: inline-block; padding: 14px 32px; font-family: sans-serif; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; color: #050505; background-color: #e2e2e2; text-decoration: none; border-radius: 2px;">Ler no site</a>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 40px 20px; border-top: 1px solid #1a1a1a;">
              <p style="margin: 0 0 8px; font-size: 16px; font-style: italic; color: #666666;">Natanael Fernando Gatti Brentano</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function getDailyPoemRecipients() {
  const envRecipients = process.env.DAILY_POEM_RECIPIENTS;
  if (!envRecipients || !envRecipients.trim()) {
    return ['nfgbrentano@gmail.com'];
  }
  return envRecipients
    .split(',')
    .map(e => e.trim())
    .filter(Boolean);
}

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_PASS;
const baseUrl = 'https://nfgbrentano.art.br/'; 

export async function sendDailyPoem({ dbInstance, transporterInstance, log = console.log, errorLog = console.error } = {}) {
  let db = dbInstance;
  let transporter = transporterInstance;

  if (!db) {
    if (!firebaseConfig.apiKey || !gmailUser || !gmailPass) {
      errorLog('Firebase credentials and Gmail credentials (GMAIL_USER, GMAIL_PASS) are required.');
      process.exit(1);
    }
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });
  }

  try {
    log('Fetching published poems...');
    
    const q = query(
      collection(db, 'poems'),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);
    const poems = snapshot.docs.map(doc => doc.data());
      
    if (poems.length === 0) {
      log('No published poems found.');
      return { success: true, count: 0 };
    }
    
    // Pick a random poem
    const randomPoem = getPoemOfDay(poems);
    const recipients = getDailyPoemRecipients();
    
    log(`Sending poem: "${randomPoem.title}" to ${recipients.join(', ')} via Gmail SMTP...`);
    
    const htmlContent = buildDailyPoemEmailHtml({ poem: randomPoem, baseUrl });

    const info = await transporter.sendMail({
      from: `"Poemas" <${gmailUser}>`, 
      to: recipients.join(', '),
      subject: `Poema do Dia: ${randomPoem.title}`,
      html: htmlContent,
      headers: {
        'List-Unsubscribe': `<${baseUrl}unsubscribe?token=daily-author>, <mailto:${gmailUser}?subject=Unsubscribe%20daily-author>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    });
    
    log('Email sent successfully. Response:', info.messageId);
    return { success: true, count: recipients.length, messageId: info.messageId };
  } catch (err) {
    errorLog('Failed to send daily poem:', err);
    await reportError(err, {
      source: 'backend:scripts',
      category: 'smtp',
      severity: 'critical',
      route_or_task: 'scripts/send-daily-poem.js',
      user_agent: 'node-script/send-daily-poem',
      context: { script: 'send-daily-poem' },
      dbInstance: db,
      addDocFn: addDoc,
      collectionFn: collection,
      skipSessionLimits: true
    });
    throw err;
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  sendDailyPoem()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
