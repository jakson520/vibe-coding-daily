function withDefaultHeaders(headers: HeadersInit | undefined, accept: string) {
  const nextHeaders = new Headers(headers);

  if (!nextHeaders.has("Accept")) {
    nextHeaders.set("Accept", accept);
  }

  if (!nextHeaders.has("User-Agent")) {
    nextHeaders.set("User-Agent", "VibeCodingDaily/1.0 (+http://127.0.0.1)");
  }

  return nextHeaders;
}

function delay(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

class RequestError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
  }
}

async function fetchResponse(
  url: string,
  init: RequestInit | undefined,
  timeoutMs: number,
  accept: string,
) {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        headers: withDefaultHeaders(init?.headers, accept),
        signal: controller.signal,
        cache: "no-store",
      });

      if (response.ok) {
        return response;
      }

      const retryableStatus =
        response.status === 408 || response.status === 429 || response.status >= 500;
      const error = new RequestError(
        `Request failed ${response.status} for ${url}`,
        retryableStatus,
      );

      if (!retryableStatus || attempt === maxAttempts) {
        throw error;
      }

      lastError = error;
    } catch (error) {
      lastError = error;
      if (error instanceof RequestError && !error.retryable) {
        throw error;
      }

      if (attempt === maxAttempts) {
        throw error;
      }
    } finally {
      clearTimeout(timer);
    }

    await delay(attempt * 500);
  }

  throw lastError instanceof Error ? lastError : new Error(`Request failed for ${url}`);
}

export async function fetchJson<T>(url: string, init?: RequestInit, timeoutMs = 20000): Promise<T> {
  const response = await fetchResponse(
    url,
    init,
    timeoutMs,
    "application/json, text/plain, */*",
  );
  return (await response.json()) as T;
}

export async function fetchText(url: string, init?: RequestInit, timeoutMs = 20000): Promise<string> {
  const response = await fetchResponse(
    url,
    init,
    timeoutMs,
    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  );
  return response.text();
}
