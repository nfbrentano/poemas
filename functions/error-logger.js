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
    if (!dbInstance || typeof dbInstance.collection !== "function") return null;
    const payload = buildFunctionErrorPayload(error, options);
    await dbInstance.collection("error_logs").add(payload);
    return payload;
  } catch (logErr) {
    if (options.logger && typeof options.logger.warn === "function") {
      options.logger.warn("Falha ao persistir em error_logs:", logErr);
    }
    return null;
  }
}

module.exports = {
  sanitizeFunctionErrorText,
  truncateText,
  buildFunctionErrorPayload,
  logBackendFunctionError,
};
