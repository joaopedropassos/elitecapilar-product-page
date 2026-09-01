#!/usr/bin/env node

const API_URL = "https://api.mercadopago.com/users/me";
const timeoutMs = Number(process.env.MP_HEALTH_TIMEOUT_MS ?? 10000);
const retries = Number(process.env.MP_HEALTH_RETRIES ?? 2);
const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function emit(result, exitCode) {
  process.stdout.write(`${JSON.stringify(result)}\n`);
  process.exitCode = exitCode;
}

if (!token) {
  emit({
    ok: false,
    service: "mercado-pago",
    check: "authenticated-api",
    status: "configuration_error",
    message: "MERCADOPAGO_ACCESS_TOKEN não configurado",
  }, 2);
} else if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
  emit({
    ok: false,
    service: "mercado-pago",
    check: "authenticated-api",
    status: "configuration_error",
    message: "MP_HEALTH_TIMEOUT_MS deve ser um número igual ou maior que 1000",
  }, 2);
} else {
  let lastError = null;
  let lastStatus = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const startedAt = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        signal: controller.signal,
      });
      lastStatus = response.status;
      const latencyMs = Math.round(performance.now() - startedAt);
      clearTimeout(timeout);

      if (response.ok) {
        emit({
          ok: true,
          service: "mercado-pago",
          check: "authenticated-api",
          status: "healthy",
          httpStatus: response.status,
          latencyMs,
          attempt: attempt + 1,
          checkedAt: new Date().toISOString(),
        }, 0);
        break;
      }

      if (response.status === 401 || response.status === 403) {
        emit({
          ok: false,
          service: "mercado-pago",
          check: "authenticated-api",
          status: "authentication_error",
          httpStatus: response.status,
          latencyMs,
          message: "A API respondeu, mas o Access Token foi recusado",
          checkedAt: new Date().toISOString(),
        }, 2);
        break;
      }

      lastError = `HTTP ${response.status}`;
      if (attempt < retries && (response.status === 429 || response.status >= 500)) {
        await sleep(250 * (attempt + 1));
        continue;
      }

      emit({
        ok: false,
        service: "mercado-pago",
        check: "authenticated-api",
        status: response.status === 429 || response.status >= 500 ? "api_error" : "unexpected_response",
        httpStatus: response.status,
        latencyMs,
        attempts: attempt + 1,
        message: "A API respondeu com status não saudável",
        checkedAt: new Date().toISOString(),
      }, response.status === 429 || response.status >= 500 ? 3 : 4);
      break;
    } catch (error) {
      clearTimeout(timeout);
      lastError = error?.name === "AbortError" ? `timeout after ${timeoutMs}ms` : "network_error";
      if (attempt < retries) {
        await sleep(250 * (attempt + 1));
        continue;
      }

      emit({
        ok: false,
        service: "mercado-pago",
        check: "authenticated-api",
        status: "connection_error",
        httpStatus: lastStatus,
        attempts: attempt + 1,
        message: lastError,
        checkedAt: new Date().toISOString(),
      }, 3);
    }
  }
}
