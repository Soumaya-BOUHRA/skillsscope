const DEFAULT_AI_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_AI_MODEL = 'openai/gpt-oss-120b';

const positiveInt = (value, fallback) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

export class AiError extends Error {
  constructor(message, code = 'AI_SERVICE_ERROR', statusCode = 502) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function getAiConfig() {
  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim() || DEFAULT_AI_MODEL;
  const baseUrl = (process.env.AI_BASE_URL?.trim() || DEFAULT_AI_BASE_URL).replace(/\/+$/, '');
  const timeoutMs = positiveInt(process.env.AI_TIMEOUT_MS, 120000);
  const maxInputChars = positiveInt(process.env.AI_MAX_INPUT_CHARS, 10000);
  const maxOutputTokens = positiveInt(process.env.AI_MAX_OUTPUT_TOKENS, 3000);
  return { apiKey, model, baseUrl, timeoutMs, maxInputChars, maxOutputTokens };
}

export function isAiConfigured() {
  return Boolean(getAiConfig().apiKey);
}

export function cleanAiInput(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[^\p{L}\p{N}\p{P}\p{Zs}\n\t]/gu, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function prepareAiInput(raw, maxChars = getAiConfig().maxInputChars) {
  return cleanAiInput(raw).slice(0, maxChars);
}

function upstreamErrorMessage(detail) {
  if (!detail) return '';
  try {
    const parsed = JSON.parse(detail);
    return parsed?.error?.message || parsed?.message || '';
  } catch {
    const match = detail.match(/"message"\s*:\s*"([^"]{1,300})"/);
    return match?.[1] || '';
  }
}

function mapUpstreamError(status, detail) {
  const upstream = upstreamErrorMessage(detail);
  const suffix = upstream ? ` Details: ${upstream}` : '';

  if (status === 401 || status === 403) {
    return new AiError(
      'The AI service rejected the credentials. Check AI_API_KEY in server/.env.',
      'AI_AUTH_ERROR',
      502
    );
  }
  if (status === 413) {
    return new AiError(
      'The AI request is too large for the provider (HTTP 413). Reduce AI_MAX_INPUT_CHARS or shorten the CV.',
      'AI_INPUT_TOO_LARGE',
      413
    );
  }
  if (status === 429) {
    return new AiError(
      'The AI service rate limit was reached (HTTP 429). Wait a moment and try again.',
      'AI_RATE_LIMITED',
      429
    );
  }
  if (status === 404) {
    return new AiError(
      `The AI model or endpoint was not found. Check AI_MODEL and AI_BASE_URL.${suffix}`,
      'AI_SERVICE_ERROR',
      502
    );
  }
  if (status === 400) {
    return new AiError(
      `The AI service rejected the request (HTTP 400).${suffix}`,
      'AI_SERVICE_ERROR',
      502
    );
  }
  return new AiError(`The AI service returned an error (HTTP ${status}).${suffix}`, 'AI_SERVICE_ERROR', 502);
}

/**
 * Calls an OpenAI-compatible chat completions endpoint (Groq by default) and
 * returns the assistant content. Truncated or empty responses are rejected so
 * callers never persist incomplete data.
 */
export async function chatCompletion(messages, { temperature = 0.2, maxTokens } = {}) {
  const { apiKey, model, baseUrl, timeoutMs, maxOutputTokens } = getAiConfig();

  if (!apiKey) {
    throw new AiError(
      'AI analysis is unavailable: AI_API_KEY is not configured on the server.',
      'AI_SERVICE_ERROR',
      503
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: positiveInt(maxTokens, maxOutputTokens),
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new AiError(
        `The AI service timed out after ${Math.round(timeoutMs / 1000)}s. Please try again.`,
        'AI_TIMEOUT',
        504
      );
    }
    throw new AiError(`Could not reach the AI service: ${err.message}`, 'AI_SERVICE_ERROR', 502);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    const error = mapUpstreamError(response.status, detail);
    console.error('[ai] upstream error:', response.status, detail.slice(0, 300));
    throw error;
  }

  const payload = await response.json().catch(() => null);
  if (!payload) {
    throw new AiError('The AI service returned an invalid response.', 'AI_INVALID_RESPONSE', 502);
  }

  if (payload.usage) {
    console.log('[ai] usage:', JSON.stringify(payload.usage));
  }

  const choice = payload.choices?.[0];
  const content = choice?.message?.content;
  const finishReason = choice?.finish_reason;

  if (finishReason === 'length') {
    throw new AiError(
      `The AI response was truncated because the output limit (${maxOutputTokens} tokens) was reached. Increase AI_MAX_OUTPUT_TOKENS and retry.`,
      'AI_OUTPUT_TRUNCATED',
      502
    );
  }

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
