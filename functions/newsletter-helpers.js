const crypto = require("crypto");

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

module.exports = {
  escapeHtml,
  formatPoemContentHtml,
  isValidEmail,
  handleSubscribeLogic,
  handleUnsubscribeLogic,
};
