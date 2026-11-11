const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

if (typeof admin.initializeApp === "function" && (!admin.apps || admin.apps.length === 0)) {
  admin.initializeApp();
}
const db = typeof admin.firestore === "function" ? admin.firestore() : null;

// Define os secrets necessários para a função
const gmailUser = defineSecret("GMAIL_USER");
const gmailAppPassword = defineSecret("GMAIL_APP_PASSWORD");
const senderName = defineSecret("SENDER_NAME");

const siteUrl = "https://nfgbrentano.art.br";

function sanitizeFunctionErrorText(input) {
  if (input === null || input === undefined) return "";
  const text = typeof input === "string" ? input : String(input);
  return text
    .replace(/\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi, "Bearer [REDACTED]")
    .replace(
      /\b(token|access_token|refresh_token|id_token|password|pass|passwd|secret|api_key|apikey|authorization|auth|credentials)\b(\s*[=:]\s*['"]?)(?!Bearer\b)([^'"&\s,}\]]+)/gi,
      "$1$2[REDACTED]"
    )
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL_REDACTED]");
}

function truncateText(value, maxLength) {
  const str = typeof value === "string" ? value : String(value || "");
  if (str.length <= maxLength) return str;
  if (maxLength <= 3) return str.slice(0, maxLength);
  return str.slice(0, maxLength - 3) + "...";
}

function buildFunctionErrorPayload(error, options = {}) {
  const source = "backend:functions";
  const category = options.category || "runtime";
  const severity = options.severity || "error";
  const route_or_task = truncateText(
    sanitizeFunctionErrorText(options.route_or_task || "sendNewsletter"),
    300
  );
  const rawMsg = error instanceof Error ? error.message : String(error || "Unknown function error");
  const message = truncateText(sanitizeFunctionErrorText(rawMsg).trim() || "Unknown function error", 1000);
  const stack = truncateText(sanitizeFunctionErrorText(error?.stack || ""), 4000);
  const contextJson = options.context ? JSON.stringify(options.context) : "{}";
  const context = truncateText(sanitizeFunctionErrorText(contextJson), 2000);

  let hash = 0x811c9dc5;
  const rawKey = `${source}|${category}|${route_or_task}|${message.slice(0, 200)}`;
  for (let i = 0; i < rawKey.length; i++) {
    hash ^= rawKey.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  const fingerprint = truncateText(
    `${source}:${category}:${route_or_task}:${hash.toString(16).padStart(8, "0")}`,
    128
  );

  return {
    source,
    category,
    severity,
    message,
    stack,
    route_or_task,
    fingerprint,
    context,
    user_agent: "firebase-functions/node",
    status: "open",
    created_at: new Date().toISOString().slice(0, 40),
  };
}

async function logBackendFunctionError(dbInstance, error, options = {}) {
  try {
    const targetDb = dbInstance || db;
    if (!targetDb || typeof targetDb.collection !== "function") return null;
    const payload = buildFunctionErrorPayload(error, options);
    await targetDb.collection("error_logs").add(payload);
    return payload;
  } catch (logErr) {
    logger.warn("Falha ao persistir em error_logs:", logErr);
    return null;
  }
}

exports.buildFunctionErrorPayload = buildFunctionErrorPayload;
exports.logBackendFunctionError = logBackendFunctionError;

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

      const poemContentHtml = (poem.content || "")
        .replace(/\n\n/g, '</p><p style="margin: 1.5em 0; font-size: 18px; line-height: 2; color: #e2e2e2;">')
        .replace(/\n/g, "<br>");

      const getHtmlEmail = (unsubscribeToken) => `<!DOCTYPE html>
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
              <h1 style="margin: 0; font-size: 36px; font-weight: 400; color: #e2e2e2; line-height: 1.2;">${poem.title}</h1>
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
                <a href="${siteUrl}/unsubscribe?token=${unsubscribeToken}" style="color: #666666; text-decoration: underline;">Não quer mais receber estes e-mails? Cancelar inscrição</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

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
            const mailOptions = {
              from: `"${SENDER_NAME}" <${GMAIL_USER}>`,
              to: sub.email,
              subject: `${poem.title} — novo poema`,
              html: getHtmlEmail(sub.unsubscribe_token),
              text: `${poem.title}\n\n${poem.content}\n\n---\nLeia no site: ${poemUrl}\nCancelar inscrição: ${siteUrl}/unsubscribe?token=${sub.unsubscribe_token}`,
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
        created_at: admin.firestore.FieldValue.serverTimestamp(),
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
          created_at: admin.firestore.FieldValue.serverTimestamp(),
        })
        .catch(() => {});

      throw new HttpsError("internal", "Falha ao enviar newsletter.");
    }
  }
);
