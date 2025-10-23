export type NormalizedApiErrors = {
  bundleName?: string;
  blockTitle?: string;
  packages?: Record<string, string> | Array<{ id: string; message: string }>;
  message?: string;
};

function isPlainObject(v: any) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function collectStringsDeep(obj: any, out: string[] = []) {
  if (!obj && obj !== 0) return out;
  if (typeof obj === "string") {
    out.push(obj);
    return out;
  }
  if (Array.isArray(obj)) {
    for (const it of obj) collectStringsDeep(it, out);
    return out;
  }
  if (isPlainObject(obj)) {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === "string" && /message|error|title/i.test(k)) out.push(v);
      else collectStringsDeep(v, out);
    }
  }
  return out;
}

export function parseApiErrors(response: any): NormalizedApiErrors {
  if (!response) return {};

  // 🔹 STEP 1: Handle serialized JSON string
  if (typeof response === "string") {
    try {
      const parsed = JSON.parse(response);
      return parseApiErrors(parsed); // recurse into parsed structure
    } catch {
      return { message: response };
    }
  }

  // 🔹 STEP 2: Handle case where `response.message` itself is a stringified JSON array/object
  if (typeof response?.message === "string") {
    const msg = response.message.trim();
    if (msg.startsWith("[") || msg.startsWith("{")) {
      try {
        const parsedInner = JSON.parse(msg);
        return parseApiErrors(parsedInner);
      } catch {
        return { message: msg };
      }
    } else {
      return { message: msg };
    }
  }

  // 🔹 STEP 3: Handle array of errors (e.g. validation array)
  if (Array.isArray(response)) {
    const messages: string[] = [];
    const packages: Array<{ id: string; message: string }> = [];

    for (const item of response) {
      if (!item) continue;
      if (typeof item === "string") {
        messages.push(item);
        continue;
      }
      if (item.message && item.id) {
        packages.push({ id: String(item.id), message: String(item.message) });
        continue;
      }
      if (item.message) {
        messages.push(String(item.message));
        continue;
      }
      const found = collectStringsDeep(item);
      if (found.length) messages.push(...found);
    }

    return {
      message: messages.join("; "),
      ...(packages.length ? { packages } : {}),
    };
  }

  // 🔹 STEP 4: Prefer nested `data` if present (fetchers, axios)
  const payload = response.data ?? response;
  const out: NormalizedApiErrors = {};

  // 🔹 STEP 5: If payload.errors is an object map
  if (payload.errors && isPlainObject(payload.errors)) {
    const errs = payload.errors as Record<string, any>;
    if (errs.bundleName) out.bundleName = String(errs.bundleName);
    if (errs.blockTitle) out.blockTitle = String(errs.blockTitle);
    if (errs.packages) out.packages = errs.packages;

    const other: string[] = [];
    for (const [k, v] of Object.entries(errs)) {
      if (!["bundleName", "blockTitle", "packages"].includes(k)) {
        if (typeof v === "string") other.push(v);
        else if (Array.isArray(v)) other.push(...v.map(String));
        else if (isPlainObject(v)) other.push(...collectStringsDeep(v));
      }
    }

    if (other.length && !out.message) out.message = other.join("; ");
    if (out.bundleName || out.blockTitle || out.packages || out.message) return out;
  }

  // 🔹 STEP 6: If payload.errors is an array
  if (Array.isArray(payload.errors)) {
    const arr = payload.errors;
    const packages: Array<{ id: string; message: string }> = [];
    const otherMessages: string[] = [];

    for (const it of arr) {
      if (!it) continue;
      if (typeof it === "string") {
        otherMessages.push(it);
        continue;
      }
      if (it.message && it.id) {
        packages.push({ id: String(it.id), message: String(it.message) });
        continue;
      }
      if (it.field && it.message) {
        const field = String(it.field);
        const message = String(it.message);
        if (/bundleName/i.test(field)) out.bundleName = message;
        else if (/blockTitle/i.test(field)) out.blockTitle = message;
        else otherMessages.push(message);
        continue;
      }
      const found = collectStringsDeep(it);
      if (found.length) otherMessages.push(...found);
    }

    if (packages.length) out.packages = packages;
    if (otherMessages.length) out.message = otherMessages.join("; ");
    return out;
  }

  // 🔹 STEP 7: Fallback top-level fields and deep scan
  if (payload.bundleName) out.bundleName = String(payload.bundleName);
  if (payload.blockTitle) out.blockTitle = String(payload.blockTitle);
  if (payload.packages) out.packages = payload.packages;

  const deep = collectStringsDeep(payload);
  if (deep.length) {
    const maybeTitleMsg = deep.find((s) =>
      /title|bundle|name|unique|required/i.test(s)
    );
    out.message = maybeTitleMsg ?? deep.join("; ");
  }

  return out;
}

export function formatPackagesMessage(
  packages: NormalizedApiErrors["packages"]
): string | undefined {
  if (!packages) return undefined;
  if (typeof packages === "string") return packages;
  if (Array.isArray(packages))
    return packages
      .map((p) => (p.message ? `${p.id}: ${p.message}` : p.id))
      .join("; ");
  return Object.entries(packages)
    .map(([id, msg]) => `${id}: ${msg}`)
    .join("; ");
}

// 🔹 Unified helper: clean display message for React/UI
export function getApiMessage(response: any): string | undefined {
  const norm = parseApiErrors(response);
  const pkgMsg = formatPackagesMessage(norm.packages);
  let final = norm.message ?? norm.bundleName ?? norm.blockTitle ?? pkgMsg;

  //NEW FIX: if message is still array or JSON, extract clean message
  if (typeof final === "string" && (final.trim().startsWith("[") || final.trim().startsWith("{"))) {
    try {
      const parsed = JSON.parse(final);
      if (Array.isArray(parsed)) {
        // return combined message(s)
        final = parsed.map((it: any) => it?.message ?? "").filter(Boolean).join("; ");
      } else if (typeof parsed === "object" && parsed?.message) {
        final = parsed.message;
      }
    } catch {
      // ignore parse error, keep final as is
    }
  }  return final;
}

