const { formatPoemPlainText } = require("./newsletter-helpers");
const { logBackendFunctionError } = require("./error-logger");

const ADMIN_EMAILS = [
  "nfgbrentano@gmail.com",
  "natanaelfernando@outlook.com",
];

const MAX_BODY_CHARS = 140;
const MAX_PAYLOAD_BYTES = 3072; // <= 3 KB (RNF03)
const PUSH_BATCH_SIZE = 10;

function defaultCreateError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function isAdminAuth(auth) {
  if (!auth) return false;
  const token = auth.token || {};
  if (token.admin === true) return true;
  const email = typeof token.email === "string" ? token.email.toLowerCase().trim() : "";
  return Boolean(email && ADMIN_EMAILS.includes(email));
}

function assertAdminAuth(auth, createError = defaultCreateError, actionLabel = "enviar notificações push") {
  if (!auth) {
    throw createError(
      "unauthenticated",
      `É necessário estar autenticado para ${actionLabel}.`
    );
  }
  if (!isAdminAuth(auth)) {
    throw createError(
      "permission-denied",
      `Apenas administradores podem ${actionLabel}.`
    );
  }
}

function truncateText(value, maxChars) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxChars) return normalized;
  if (maxChars <= 3) return normalized.slice(0, maxChars);
  return `${normalized.slice(0, maxChars - 3).trimEnd()}...`;
}

function trimToUtf8Bytes(str, maxBytes) {
  const text = String(str || "");
  if (Buffer.byteLength(text, "utf8") <= maxBytes) return text;
  let end = text.length;
  while (end > 0 && Buffer.byteLength(`${text.slice(0, end)}...`, "utf8") > maxBytes) {
    end -= 1;
  }
  return end > 0 ? `${text.slice(0, end).trimEnd()}...` : "";
}

function buildPushPayload({
  poem = {},
  title,
  body,
  siteUrl = "https://nfgbrentano.art.br",
} = {}) {
  const cleanSiteUrl = String(siteUrl || "https://nfgbrentano.art.br").replace(/\/+$/, "");
  const cleanSlug = String(poem?.slug || "").replace(/^\/+|\/+$/g, "");
  const url = `${cleanSiteUrl}/poema/${cleanSlug}/`;

  let safeTitle = typeof title === "string" && title.trim()
    ? title.trim().replace(/\s+/g, " ")
    : String(poem?.title || "Novo poema publicado").replace(/\s+/g, " ").trim();

  let rawBody = "";
  if (typeof body === "string" && body.trim()) {
    rawBody = body.trim();
  } else if (typeof poem?.excerpt === "string" && poem.excerpt.trim()) {
    rawBody = formatPoemPlainText(poem.excerpt);
  } else {
    rawBody = formatPoemPlainText(poem?.content || "");
  }

  let safeBody = truncateText(rawBody, MAX_BODY_CHARS) || "Leia o novo poema no site.";

  const payload = {
    title: safeTitle,
    body: safeBody,
    url,
  };

  // Garante limite prático <= 3 KB para Web Push (RNF03)
  if (Buffer.byteLength(JSON.stringify(payload), "utf8") > MAX_PAYLOAD_BYTES) {
    const overhead = Buffer.byteLength(
      JSON.stringify({ title: safeTitle, body: "", url }),
      "utf8"
    );
    const availableForBody = MAX_PAYLOAD_BYTES - overhead;
    if (availableForBody >= 16) {
      payload.body = trimToUtf8Bytes(safeBody, availableForBody);
    } else {
      payload.body = "";
      const titleOverhead = Buffer.byteLength(
        JSON.stringify({ title: "", body: "", url }),
        "utf8"
      );
      payload.title = trimToUtf8Bytes(safeTitle, Math.max(0, MAX_PAYLOAD_BYTES - titleOverhead));
    }
  }

  return payload;
}

async function handleSendPushLogic({
  auth,
  data = {},
  dbInstance,
  webPush,
  vapidPublicKey,
  vapidPrivateKey,
  vapidSubject = "mailto:nfgbrentano@gmail.com",
  siteUrl = "https://nfgbrentano.art.br",
  logger = console,
  logErrorFn = logBackendFunctionError,
  createError = defaultCreateError,
  createdAtValue = null,
}) {
  // RNF02 & CT01: Validar autenticação e permissão admin antes de ler qualquer coleção
  assertAdminAuth(auth, createError);

  const poemId = typeof data?.poemId === "string" ? data.poemId.trim() : "";
  if (!poemId) {
    throw createError("invalid-argument", "O parâmetro poemId é obrigatório.");
  }

  const poemDoc = await dbInstance.collection("poems").doc(poemId).get();
  if (!poemDoc.exists) {
    throw createError("not-found", "Poema não encontrado.");
  }

  const poem = poemDoc.data() || {};
  if (poem.status !== "published") {
    throw createError(
      "failed-precondition",
      "Apenas poemas com status published podem gerar notificação push."
    );
  }
  if (!poem.slug) {
    throw createError("failed-precondition", "O poema precisa possuir um slug válido.");
  }

  const subject = typeof vapidSubject === "string" && vapidSubject.trim()
    ? vapidSubject.trim()
    : "mailto:nfgbrentano@gmail.com";

  if (!vapidPublicKey || !vapidPrivateKey) {
    const configErr = new Error("Chaves VAPID não configuradas no servidor.");
    await logErrorFn(dbInstance, configErr, {
      logger,
      category: "runtime",
      severity: "critical",
      route_or_task: "sendPushNotification",
      context: { phase: "vapid_config", poemId },
    });
    throw createError("failed-precondition", "Chaves VAPID não configuradas no servidor.");
  }

  try {
    webPush.setVapidDetails(subject, vapidPublicKey, vapidPrivateKey);
  } catch (vapidErr) {
    await logErrorFn(dbInstance, vapidErr, {
      logger,
      category: "runtime",
      severity: "critical",
      route_or_task: "sendPushNotification",
      context: { phase: "setVapidDetails", poemId },
    });
    throw createError("internal", "Falha ao configurar credenciais VAPID.");
  }

  const payload = buildPushPayload({
    poem,
    title: data?.title,
    body: data?.body,
    siteUrl,
  });
  const payloadJson = JSON.stringify(payload);

  const subsSnapshot = await dbInstance.collection("push_subscriptions").get();
  const docs = Array.isArray(subsSnapshot?.docs) ? subsSnapshot.docs : [];
  const total = docs.length;

  let sent = 0;
  let failed = 0;
  let removed = 0;
  let unexpectedErrors = 0;
  const errorSamples = [];

  for (let i = 0; i < docs.length; i += PUSH_BATCH_SIZE) {
    const batch = docs.slice(i, i + PUSH_BATCH_SIZE);
    await Promise.allSettled(
      batch.map(async (subDoc) => {
        const subData = typeof subDoc.data === "function" ? subDoc.data() : subDoc.data;
        const subscription = subData?.subscription;
        if (!subscription || !subscription.endpoint) {
          failed += 1;
          unexpectedErrors += 1;
          return;
        }

        try {
          await webPush.sendNotification(subscription, payloadJson);
          sent += 1;
        } catch (sendErr) {
          failed += 1;
          const statusCode = Number(sendErr?.statusCode ?? sendErr?.status);
          if (statusCode === 404 || statusCode === 410) {
            try {
              if (subDoc.ref && typeof subDoc.ref.delete === "function") {
                await subDoc.ref.delete();
                removed += 1;
              }
            } catch (delErr) {
              if (logger && typeof logger.warn === "function") {
                logger.warn("Falha ao remover assinatura expirada:", delErr);
              }
            }
          } else {
            unexpectedErrors += 1;
            if (errorSamples.length < 3) {
              errorSamples.push(sendErr?.message || String(sendErr));
            }
          }
        }
      })
    );
  }

  if (unexpectedErrors > 0) {
    await logErrorFn(
      dbInstance,
      new Error(`Falha ao enviar Web Push (${unexpectedErrors} erro(s) inesperado(s) de ${total})`),
      {
        logger,
        category: "network",
        severity: sent === 0 ? "critical" : "warning",
        route_or_task: "sendPushNotification",
        context: {
          poemId,
          sent,
          failed,
          removed,
          unexpectedErrors,
          total,
          samples: errorSamples,
        },
      }
    );
  }

  const details = total === 0
    ? "Nenhuma inscrição push ativa no momento."
    : `Web Push enviado. Entregues: ${sent}, Falhas: ${failed}, Removidas (404/410): ${removed}.`;

  try {
    await dbInstance.collection("email_campaign_logs").add({
      poem_id: poemId,
      channel: "push",
      type: "push",
      status: sent > 0 || unexpectedErrors === 0 ? "success" : "failed",
      sent,
      failed,
      removed,
      total,
      details,
      created_at: createdAtValue || new Date().toISOString(),
    });
  } catch (logCampaignErr) {
    if (logger && typeof logger.warn === "function") {
      logger.warn("Falha ao gravar histórico de campanha push:", logCampaignErr);
    }
  }

  return {
    success: true,
    sent,
    failed,
    removed,
    total,
  };
}

module.exports = {
  ADMIN_EMAILS,
  MAX_BODY_CHARS,
  MAX_PAYLOAD_BYTES,
  PUSH_BATCH_SIZE,
  isAdminAuth,
  assertAdminAuth,
  truncateText,
  buildPushPayload,
  handleSendPushLogic,
};
