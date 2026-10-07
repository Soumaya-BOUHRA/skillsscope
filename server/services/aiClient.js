const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

export class AiError extends Error {
  constructor(message, code = 'AI_SERVICE_ERROR', statusCode = 502) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function getAiConfig() {
  const apiKey = process.env.XAI_API_KEY?.trim();
  const model = process.env.XAI_MODEL?.trim() || 'grok-4.7';
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 120000;
  return { apiKey, model, timeoutMs };
}

export function isAiConfigured() {
  return Boolean(getAiConfig().apiKey);
}

/**
 * Calls the xAI chat completions endpoint and returns the raw assistant content.
 */
export async function chatCompletion(messages, { temperature = 0.2, maxTokens = 8000 } = {}) {
  const { apiKey, model, timeoutMs } = getAiConfig();

  if (!apiKey) {
    throw new AiError(
      'AI analysis is unavailable: XAI_API_KEY is not configured on the server.',
      'AI_SERVICE_ERROR',
      503
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new AiError('The AI service timed out. Please try again.', 'AI_SERVICE_ERROR', 504);
    }
    throw new AiError(`Could not reach the AI service: ${err.message}`, 'AI_SERVICE_ERROR', 502);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    let message;
    if (/incorrect api key|invalid api key|unauthorized/i.test(detail)) {
      message = 'The AI service rejected the API key. Check XAI_API_KEY in server/.env.';
    } else if (response.status === 401 || response.status === 403) {
      message = 'The AI service rejected the credentials. Check XAI_API_KEY.';
    } else if (response.status === 404) {
      message = `The AI model "${model}" was not found. Check XAI_MODEL.`;
    } else if (response.status === 429) {
      message = 'The AI service is rate limited. Please try again shortly.';
    } else if (response.status === 400) {
      const upstream = detail.match(/"error"\s*:\s*"([^"]{1,200})"/);
      message = `The AI service rejected the request${upstream ? `: ${upstream[1]}` : ` (HTTP 400).`}`;
    } else {
      message = `The AI service returned an error (HTTP ${response.status}).`;
    }
    console.error('[ai] upstream error:', response.status, detail.slice(0, 300));
    throw new AiError(message, 'AI_SERVICE_ERROR', 502);
  }

  const payload = await response.json().catch(() => null);
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new AiError('The AI service returned an empty response.', 'AI_INVALID_RESPONSE', 502);
  }

  return content;
}

/**
 * Extracts a JSON object from a model response that may be wrapped in
 * markdown fences or preceded by prose.
 */
export function extractJson(content) {
  if (typeof content !== 'string') return null;

  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates = [];
  if (fenced?.[1]) candidates.push(fenced[1]);

  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(content.slice(firstBrace, lastBrace + 1));
  }
  candidates.push(content);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.trim());
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      // try next candidate
    }
  }
  return null;
}

export async function chatJson(messages, options = {}) {
  const content = await chatCompletion(messages, options);
  const parsed = extractJson(content);
  if (!parsed) {
    throw new AiError('The AI response could not be parsed as JSON.', 'AI_INVALID_RESPONSE', 502);
  }
  return parsed;
}
