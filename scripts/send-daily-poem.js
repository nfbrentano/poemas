import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import nodemailer from 'nodemailer';

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
const targetEmail = 'nfgbrentano@gmail.com';
const baseUrl = 'https://nfbrentano.github.io/poemas/'; 

if (!firebaseConfig.apiKey || !gmailUser || !gmailPass) {
  console.error('Firebase credentials and Gmail credentials (GMAIL_USER, GMAIL_PASS) are required.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configurar o transporter do Nodemailer para o Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailUser,
    pass: gmailPass
  }
});

async function sendDailyPoem() {
  try {
    console.log('Fetching published poems...');
    
    const q = query(
      collection(db, 'poems'),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);
    const poems = snapshot.docs.map(doc => doc.data());
      
    if (poems.length === 0) {
      console.log('No published poems found.');
      return;
    }
    
    // Pick a random poem
    const randomPoem = poems[Math.floor(Math.random() * poems.length)];
    
    console.log(`Sending poem: "${randomPoem.title}" to ${targetEmail} via Gmail SMTP...`);
    
    const poemUrl = `${baseUrl}poema/${randomPoem.slug}`;
    
    const poemContentHtml = randomPoem.content
      .replace(/\n\n/g, '</p><p style="margin: 1.5em 0; font-size: 18px; line-height: 2; color: #e2e2e2;">')
      .replace(/\n/g, '<br>');

    const htmlContent = `<!DOCTYPE html>
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
              <h1 style="margin: 0; font-size: 36px; font-weight: 400; color: #e2e2e2; line-height: 1.2;">${randomPoem.title}</h1>
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
              <p style="margin: 0 0 8px; font-size: 16px; font-style: italic; color: #666666;">Natanael Brentano</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const info = await transporter.sendMail({
      from: `"Poemas" <${gmailUser}>`, 
      to: targetEmail,
      subject: `Poema do Dia: ${randomPoem.title}`,
      html: htmlContent
    });
    
    console.log('Email sent successfully. Response:', info.messageId);
    process.exit(0);
  } catch (err) {
    console.error('Failed to send daily poem:', err);
    process.exit(1);
  }
}

sendDailyPoem();
