export function splitIso(iso?: string | null): { date?: string; time?: string } {
  if (!iso) return {};
  const d = new Date(iso);
  if (isNaN(d.getTime())) return {};
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`,
  };
}

// utils/shopify-id.ts

export type GidParts = {
  namespace?: string;   // e.g., "shopify"
  resource?: string;    // e.g., "Product", "DiscountAutomaticApp"
  rawId?: string;       // trailing segment after the resource (may be UUID or digits)
  numericString?: string | null; // only set if rawId is all digits
};

export function parseShopifyGid(input: unknown): GidParts {
  if (input == null) return { numericString: null };

  const s = String(input).trim();
  if (!s) return { numericString: null };

  // 1) Already numeric string
  if (/^\d+$/.test(s)) return { rawId: s, numericString: s };

  // 2) Maybe base64 (Storefront API returns base64 GIDs)
  const decoded = tryDecodeBase64(s);
  const candidate =
    decoded && decoded.includes("gid://shopify/") ? decoded : s;

  // 3) gid://shopify/Resource/ID[?query]
  const m = candidate.match(/^gid:\/\/([^/]+)\/([^/?]+)\/([^?]+)(?:\?.*)?$/);
  if (m) {
    const [, namespace, resource, rawId] = m;
    return {
      namespace,
      resource,
      rawId,
      numericString: /^\d+$/.test(rawId) ? rawId : null,
    };
  }

  // 4) Fallback: take the last path-like segment
  const last = candidate.split(/[/:]/).filter(Boolean).pop()!;
  return {
    rawId: last,
    numericString: /^\d+$/.test(last) ? last : null,
  };
}

function tryDecodeBase64(s: string): string | null {
  // quick filter so we don't decode random strings (standard b64)
  if (!/^[A-Za-z0-9+/=]+$/.test(s) || s.length % 4 !== 0) return null;
  try {
    const out = Buffer.from(s, "base64").toString("utf8");
    // reject likely-binary output
    if (/[\x00-\x08\x0E-\x1F]/.test(out)) return null;
    return out;
  } catch {
    return null;
  }
}

/** Returns the numeric tail as a STRING (or null) */
export function toNumericIdStringOrNull(input: unknown): string | null {
  return parseShopifyGid(input).numericString ?? null;
}

/** Returns the numeric tail as a STRING; throws if not numeric */
export function toNumericIdStringOrThrow(
  input: unknown,
  label = "Shopify ID"
): string {
  const s = toNumericIdStringOrNull(input);
  if (!s) throw new Error(`${label} is not a numeric resource id: ${input}`);
  return s;
}

/** Convenience: BigInt if you really need it (mind JSON serialization). */
export function toNumericBigIntOrNull(input: unknown): bigint | null {
  const s = toNumericIdStringOrNull(input);
  return s ? BigInt(s) : null;
}


/** Return a JS number or throw if missing/invalid/unsafe. */
export function toNumericIdOrThrow(input: unknown, label = "Shopify ID"): number {
  const n = toNumericIdOrNull(input);
  if (n == null) {
    // clarify if it was an overflow vs invalid
    const s = extractNumericIdString(input);
    if (s && !Number.isSafeInteger(Number(s))) {
      throw new Error(`${label} (${s}) exceeds Number.MAX_SAFE_INTEGER`);
    }
    throw new Error(`${label} is not a numeric resource id: ${String(input)}`);
  }
  return n;
}

export function toNumericIdOrNull(input: unknown): number | null {
  const s = extractNumericIdString(input);
  if (!s) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) ? n : null;
}

const TRAILING_NUM_RE = /(?:^|\/)(\d+)(?:[?#].*)?$/;


function extractNumericIdString(input: unknown): string | null {
  if (input == null) return null;

  if (typeof input === "object") {
    const any = input as any;
    const maybe = any.id ?? any.gid ?? any.shopifyId ?? any.shopify_id;
    if (maybe != null) return extractNumericIdString(maybe);
    return null;
  }

  if (typeof input === "number") {
    if (!Number.isFinite(input) || input < 0 || !Number.isInteger(input)) return null;
    return String(input);
  }

  if (typeof input === "bigint") {
    if (input < 0n) return null;
    return input.toString();
  }

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return null;
    if (/^\d+$/.test(s)) return String(parseInt(s, 10)); // normalize leading zeros
    const m = s.match(TRAILING_NUM_RE);
    if (m?.[1]) return String(parseInt(m[1], 10));
  }

  return null;
}