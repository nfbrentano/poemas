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
    const htmlContent = `
      <h1>${randomPoem.title}</h1>
      ${randomPoem.content}
      <br/><br/>
      <a href="${poemUrl}">Ler no site</a>
    `;

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
