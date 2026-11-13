const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const { initializeApp, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { buildFunctionErrorPayload, logBackendFunctionError } = require("./error-logger");

if (getApps().length === 0) {
  initializeApp();
}
const db = getFirestore();

// Define os secrets necessários para a função
const gmailUser = defineSecret("GMAIL_USER");
const gmailAppPassword = defineSecret("GMAIL_APP_PASSWORD");
const senderName = defineSecret("SENDER_NAME");

const siteUrl = "https://nfgbrentano.art.br";

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatPoemContentHtml(content) {
  const safeContent = escapeHtml(content || "");
  return safeContent
    .replace(/\r\n/g, "\n")
    .replace(/\n\n+/g, '</p><p style="margin: 1.5em 0; font-size: 18px; line-height: 2; color: #e2e2e2;">')
    .replace(/\n/g, "<br>");
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email) {
  return typeof email === "string" && EMAIL_REGEX.test(email) && email.length <= 254;
}

async function handleSubscribeLogic({ dbInstance, email, cryptoModule = crypto }) {
  if (typeof email !== "string") {
    return {
      statusCode: 400,
      body: { success: false, message: "Por favor, insira um e-mail válido." },
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return {
      statusCode: 400,
      body: { success: false, message: "Por favor, insira um e-mail válido." },
    };
  }
  const docRef = dbInstance.collection("subscribers").doc(normalizedEmail);
  const docSnap = await docRef.get();

  const nowIso = new Date().toISOString();

  if (docSnap.exists) {
    const data = docSnap.data() || {};
    if (data.active === true) {
      return {
        statusCode: 200,
        body: {
          success: true,
          message: "Este e-mail já está inscrito.",
          status: "already_subscribed",
        },
      };
    }

    // Reativação de assinante anteriormente inativado
    const unsubscribe_token = data.unsubscribe_token || (typeof cryptoModule.randomUUID === "function" ? cryptoModule.randomUUID() : cryptoModule.randomBytes(16).toString("hex"));
    await docRef.update({
      active: true,
      unsubscribe_token,
      reactivated_at: nowIso,
      unsubscribed_at: null,
    });

    return {
      statusCode: 200,
      body: {
        success: true,
        message: "Obrigado por assinar.",
        status: "reactivated",
      },
    };
  }

  // Novo assinante
  const unsubscribe_token = typeof cryptoModule.randomUUID === "function"
    ? cryptoModule.randomUUID()
    : cryptoModule.randomBytes(16).toString("hex");

  await docRef.set({
    email: normalizedEmail,
    active: true,
    unsubscribe_token,
    created_at: nowIso,
  });

  return {
    statusCode: 200,
    body: {
      success: true,
      message: "Obrigado por assinar.",
      status: "subscribed",
    },
  };
}

async function handleUnsubscribeLogic({ dbInstance, token }) {
  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      statusCode: 400,
      body: { success: false, message: "Token de cancelamento não fornecido." },
    };
  }

  const cleanToken = token.trim();
  const querySnap = await dbInstance
    .collection("subscribers")
    .where("unsubscribe_token", "==", cleanToken)
    .limit(1)
    .get();

  if (querySnap.empty) {
    return {
      statusCode: 404,
      body: { success: false, message: "Assinatura não encontrada ou link expirado." },
    };
  }

  const docSnap = querySnap.docs[0];
  const data = docSnap.data() || {};
  const nowIso = new Date().toISOString();

  if (data.active === false) {
    return {
      statusCode: 200,
      body: {
        success: true,
        message: "Inscrição já cancelada anteriormente.",
        already_unsubscribed: true,
      },
    };
  }

  await docSnap.ref.update({
    active: false,
    unsubscribed_at: nowIso,
  });

  return {
    statusCode: 200,
    body: {
      success: true,
      message: "Inscrição cancelada com sucesso.",
      already_unsubscribed: false,
    },
  };
}

exports.escapeHtml = escapeHtml;
exports.formatPoemContentHtml = formatPoemContentHtml;
exports.isValidEmail = isValidEmail;
exports.handleSubscribeLogic = handleSubscribeLogic;
exports.handleUnsubscribeLogic = handleUnsubscribeLogic;
exports.buildFunctionErrorPayload = buildFunctionErrorPayload;
exports.logBackendFunctionError = (dbInstance, error, options = {}) =>
  logBackendFunctionError(dbInstance || db, error, { logger, ...options });

exports.subscribeNewsletter = onRequest(
  {
    region: "southamerica-east1",
    cors: true,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ success: false, message: "Método não permitido. Use POST." });
      return;
    }

    try {
      const email = req.body?.email;
      const result = await handleSubscribeLogic({ dbInstance: db, email });
      res.status(result.statusCode).json(result.body);
    } catch (error) {
      logger.error("Erro na função subscribeNewsletter:", error);
      await logBackendFunctionError(db, error, {
        category: "runtime",
        severity: "error",
        route_or_task: "subscribeNewsletter",
      });
      res.status(500).json({ success: false, message: "Erro ao processar inscrição." });
    }
  }
);

exports.unsubscribeNewsletter = onRequest(
  {
    region: "southamerica-east1",
    cors: true,
  },
  async (req, res) => {
    try {
      const token = req.body?.token || req.query?.token;
      const result = await handleUnsubscribeLogic({ dbInstance: db, token });
      res.status(result.statusCode).json(result.body);
    } catch (error) {
      logger.error("Erro na função unsubscribeNewsletter:", error);
      await logBackendFunctionError(db, error, {
        category: "runtime",
        severity: "error",
        route_or_task: "unsubscribeNewsletter",
      });
      res.status(500).json({ success: false, message: "Erro ao processar cancelamento." });
    }
  }
);

exports.sendNewsletter = onCall(
  {
    region: "southamerica-east1",
    secrets: [gmailUser, gmailAppPassword, senderName],
  },
  async (request) => {
    // 1. Validar autenticação
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "É necessário estar autenticado para enviar a newsletter."
      );
    }

    const { poemId, targetEmail } = request.data;
    if (!poemId) {
      throw new HttpsError("invalid-argument", "O parâmetro poemId é obrigatório.");
    }

    const GMAIL_USER = gmailUser.value();
    const GMAIL_APP_PASSWORD = gmailAppPassword.value();
    const SENDER_NAME = senderName.value() || "Natanael Fernando Gatti Brentano";

    try {
      // 2. Buscar Poema
      const poemDoc = await db.collection("poems").doc(poemId).get();
      if (!poemDoc.exists) {
        throw new HttpsError("not-found", "Poema não encontrado.");
      }
      const poem = poemDoc.data();
      const poemUrl = `${siteUrl}/poema/${poem.slug}`;

      // 3. Buscar Assinantes
      let subscribers = [];
      if (targetEmail) {
        subscribers = [
          { email: targetEmail, unsubscribe_token: "daily-test-token" },
        ];
      } else {
        const snapshot = await db
          .collection("subscribers")
          .where("active", "==", true)
          .get();
        snapshot.forEach((doc) => {
          subscribers.push(doc.data());
        });
      }

      if (subscribers.length === 0) {
        return {
          success: true,
          message: "Nenhum assinante ativo encontrado.",
          count: 0,
        };
      }

      const poemContentHtml = formatPoemContentHtml(poem.content);
      const escapedPoemTitle = escapeHtml(poem.title || "");

      const getHtmlEmail = (unsubscribeToken) => {
        const safeToken = encodeURIComponent(unsubscribeToken || "");
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
              <p style="margin: 0; font-family: sans-serif; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #666666;">Novo poema publicado</p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 60px 20px 20px;">
              <h1 style="margin: 0; font-size: 36px; font-weight: 400; color: #e2e2e2; line-height: 1.2;">${escapedPoemTitle}</h1>
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
              <p style="margin: 20px 0 0; font-size: 12px; color: #444444;">
                <a href="${siteUrl}/unsubscribe?token=${safeToken}" style="color: #666666; text-decoration: underline;">Não quer mais receber estes e-mails? Cancelar inscrição</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
      };

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      });

      let successCount = 0;
      let failCount = 0;

      // Batch em grupos de 5
      const BATCH_SIZE = 5;
      for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        const batch = subscribers.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
          batch.map(async (sub) => {
            const safeToken = encodeURIComponent(sub.unsubscribe_token || "");
            const mailOptions = {
              from: `"${SENDER_NAME}" <${GMAIL_USER}>`,
              to: sub.email,
              subject: `${poem.title} — novo poema`,
              html: getHtmlEmail(sub.unsubscribe_token),
              text: `${poem.title}\n\n${poem.content}\n\n---\nLeia no site: ${poemUrl}\nCancelar inscrição: ${siteUrl}/unsubscribe?token=${safeToken}`,
              headers: {
                "List-Unsubscribe": `<${siteUrl}/unsubscribe?token=${safeToken}>, <mailto:${GMAIL_USER}?subject=Unsubscribe%20${safeToken}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              },
            };

            try {
              await transporter.sendMail(mailOptions);
              successCount++;
            } catch (err) {
              logger.error(`Falha ao enviar para ${sub.email}:`, err);
              failCount++;

              // Desativar assinante
              try {
                const subQuery = await db
                  .collection("subscribers")
                  .where("email", "==", sub.email)
                  .get();
                if (!subQuery.empty) {
                  await subQuery.docs[0].ref.update({ active: false });
                  logger.info(`Assinante desativado: ${sub.email}`);
                }
              } catch (dbErr) {
                logger.error(
                  `Falha ao desativar assinante ${sub.email}:`,
                  dbErr
                );
              }
            }
          })
        );
      }

      if (successCount === 0 && failCount > 0) {
        throw new Error("Todos os envios falharam via Gmail SMTP.");
      }

      if (failCount > 0) {
        await logBackendFunctionError(
          db,
          new Error(`Falha parcial no envio de newsletter (${failCount} falha(s) de ${subscribers.length})`),
          {
            category: "smtp",
            severity: "warning",
            route_or_task: "sendNewsletter",
            context: { poemId, successCount, failCount, total: subscribers.length },
          }
        );
      }

      // Log success
      await db.collection("email_campaign_logs").add({
        poem_id: poemId,
        status: successCount > 0 ? "success" : "failed",
        type: targetEmail ? "individual" : "newsletter",
        target_email: targetEmail || null,
        details: targetEmail 
          ? `Envio individual para ${targetEmail}. Sucesso: ${successCount}, Falhas: ${failCount}.`
          : `Newsletter enviada via Gmail SMTP. Sucesso: ${successCount}, Falhas: ${failCount}.`,
        created_at: FieldValue.serverTimestamp(),
      });

      return { success: true, count: subscribers.length };
    } catch (error) {
      logger.error("Erro na função sendnewsletter:", error);

      await logBackendFunctionError(db, error, {
        category: String(error?.message || "").includes("SMTP") ? "smtp" : "runtime",
        severity: "critical",
        route_or_task: "sendNewsletter",
        context: {
          poemId,
          type: targetEmail ? "individual" : "newsletter",
        },
      });

      // Tentativa de log
      await db
        .collection("email_campaign_logs")
        .add({
          poem_id: poemId,
          status: "failed",
          type: targetEmail ? "individual" : "newsletter",
          target_email: targetEmail || null,
          details: `Erro geral na execução: ${error.message || String(error)}`,
          created_at: FieldValue.serverTimestamp(),
        })
        .catch(() => {});

      throw new HttpsError("internal", "Falha ao enviar newsletter.");
    }
  }
);
