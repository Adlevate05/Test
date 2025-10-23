import type {
  BogoCreateInput,
  MultiCreateInput,
  VolumeSameProductCreateInput,
  // You’ll wire these later:
  // BogoCreateInput,
  // QuantityBreakMultiProductCreateInput,
} from "../dto/discount.dto";

/** ---------- Common (camelCase output) ---------- */
type CommonFields = {
  /** Discount kind */
  type: "volume-same-product" | "bogo" | "quantity-break-multi-product" | string;
  functionId?: string;
  status?: "draft" | "active";
  visibility?: "all" | "specific" | "except";
  eligibility: any,
  primarySpecificIds?: string[];
  primaryExceptIds?: string[];
  bundleSpecificIds?: string[];
  bundleExceptIds?: string[];
  nameApp?: string;     // bundleName
  nameStore?: string;   // discountName
  blockTitle?: string;  // UI title
  startsAt?: string;
  endsAt?: string;
  startTime?: string;
  endTime?: string;
  style?: Record<string, any>;
  options?: Record<string, any>;
  collectionIds?: string[];
};

export type VolumeSameProductDTO =
  Omit<VolumeSameProductCreateInput, "type"> & CommonFields;

/** ---------- helpers ---------- */
const toStr = (v: unknown, d = "") => (v == null ? d : String(v));

const toStrArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (typeof v === "string") return v.split(",").map(s => s.trim()).filter(Boolean);
  return [];
};

const toInt = (v: unknown, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : d;
};

const toFloat = (v: unknown, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const safeJson = (s: FormDataEntryValue | null): any => {
  if (!s) return undefined;
  try { return JSON.parse(String(s)); } catch { return undefined; }
};

const normalizeVisibility = (val: unknown): "all" | "specific" | "except" => {
  const m = String(val ?? "").toLowerCase();
  return m === "specific" || m === "except" ? m : "all";
};

const normalizeEligibility = (
  val: unknown
): "bundle_specific" | "bundle_except" | "" => {
  const m = String(val ?? "").toLowerCase();

  if (m === "bundle_specific") return "bundle_specific";
  if (m === "bundle_except") return "bundle_except";

  return ""; // ✅ safe empty fallback
};


/** Read a snake_case array field: prefers `field[]`, falls back to single `field` (comma or single) */
const readSnakeArray = (form: FormData, field: string) => {
  const bracket = `${field}[]`;
  const arr = form.getAll(bracket);
  if (arr && arr.length > 0) return arr;
  return form.get(field);
};

const clampPercent = (n: number) => Math.max(1, Math.min(99, Math.floor(n)));
const nonNeg = (n: number) => Math.max(0, n);

/** ---------- common field parser (snake_case in → camelCase out) ---------- */
async function parseCommonFields(request: Request) {
  const form = await request.formData();

  // READ ONLY SNAKE_CASE from the form
  const raw = {
    type:              form.get("type"),
    function_id:       form.get("function_id"),
    status:            form.get("status"),
    visibility:        form.get("visibility"),
    eligibility:       form.get("eligibility"),

    primary_specific_ids: readSnakeArray(form, "primary_specific_ids"),
    primary_except_ids:   readSnakeArray(form, "primary_except_ids"),

    bundle_specific_ids: readSnakeArray(form, "bundle_specific_ids"),
    bundle_except_ids:   readSnakeArray(form, "bundle_except_ids"),

    name_app:    form.get("name_app"),
    name_store:  form.get("name_store"),
    block_title: form.get("block_title"),

    starts_at: form.get("starts_at"),
    ends_at:   form.get("ends_at"),
    start_time: form.get("start_time"),
    end_time:   form.get("end_time"),


    style:   safeJson(form.get("style"))   ?? form.get("style"),
    options: safeJson(form.get("options")) ?? form.get("options"),

    // optional collections (used by volume / quantity-break)
    collection_ids: readSnakeArray(form, "collection_ids"),
  };

  // Normalize to camelCase output
  const functionId = toStr(raw.function_id, "");
  const type = toStr(raw.type, "");
  const status = raw.status === "active" ? "active" : "draft";
  const visibility = normalizeVisibility(raw.visibility);
  const eligibility = normalizeEligibility(raw.eligibility);

  const primarySpecificIds = toStrArray(raw.primary_specific_ids);
  const primaryExceptIds   = toStrArray(raw.primary_except_ids);

  const bundleSpecificIds = toStrArray(raw.bundle_specific_ids);
  const bundleExceptIds   = toStrArray(raw.bundle_except_ids);

  const nameApp    = toStr(raw.name_app, "");
  const nameStore  = toStr(raw.name_store, "");
  const blockTitle = toStr(raw.block_title, "");

  const style   = typeof raw.style === "string"   ? safeJson(raw.style)   ?? {} : (raw.style   ?? {});
  const options = typeof raw.options === "string" ? safeJson(raw.options) ?? {} : (raw.options ?? {});

  const collectionIds = toStrArray(raw.collection_ids);

  return {
    common: {
      type,
      functionId,
      status,
      visibility,
      eligibility,
      primarySpecificIds,
      primaryExceptIds,
      bundleSpecificIds,
      bundleExceptIds,
      nameApp,
      nameStore,
      blockTitle,
      startsAt: raw.starts_at ? toStr(raw.starts_at) : undefined,
      endsAt:   raw.ends_at   ? toStr(raw.ends_at)   : undefined,
      startTime: raw.start_time ? raw.start_time : undefined,
      endTime:   raw.end_time   ? raw.end_time   : undefined,
      style,
      options,
      collectionIds,
    } as CommonFields,
    raw, // pass-through for type-specific reads
  };
}

/** ---------- normalize packages from options (UI bars) ---------- */
type VolumePkg = {
  quantity: number;
  discountType: "fixedAmount" | "percentage";
  discountValue: number;
  title?: string;
  subtitle?: string;
  label?: string;
  badgeText?: string;
  badgeStyle?: string;
  selectedByDefault?: boolean;
};

type BogoPkg = {
  buyQuantity: number;
  freeQuantity: number;
  title?: string;
  subtitle?: string;
  label?: string;
  badgeText?: string;
  badgeStyle?: string;
  selectedByDefault?: boolean;
};

type MultiPkg = {
  quantity: number;
  discountType: "fixedAmount" | "percentage";
  discountValue: number;
  title?: string;
  subtitle?: string;
  label?: string;
  badgeText?: string;
  badgeStyle?: string;
  selectedByDefault?: boolean;
};

function normalizeVolumePackagesFromOptions(options: any): VolumePkg[] {
  const pkgs = options?.packages;
  if (!Array.isArray(pkgs)) return [];

  const mapOne = (p: any): VolumePkg | null => {
    const quantity = toInt(p?.quantity, 1);
    if (quantity <= 0) return null;

    const mode = String(p?.priceMode ?? "default");
    const rawVal = toFloat(p?.discountValue ?? p?.value ?? 0, 0);

    let discountType: "fixedAmount" | "percentage" = "percentage";
    let discountValue = 0;

    if (mode === "percentage") {
      discountType = "percentage";
      discountValue = clampPercent(rawVal);
    } else if (mode === "fixed") {
      discountType = "fixedAmount";
      discountValue = nonNeg(rawVal);
    } else {
      // "default" or unknown => no discount
      discountType = "percentage";
      discountValue = 0;
    }

    return {
      quantity,
      discountType,
      discountValue,
      title: toStr(p?.title, ""),
      subtitle: toStr(p?.subtitle, ""),
      label: toStr(p?.label, ""),
      badgeText: toStr(p?.badgeText, ""),
      badgeStyle: toStr(p?.badgeStyle, ""),
      selectedByDefault: Boolean(p?.selectedByDefault),
    };
  };

  return pkgs.map(mapOne).filter(Boolean) as VolumePkg[];
}

function normalizeBogoPackagesFromOptions(options: any): BogoPkg[] {
  const pkgs = options?.bogoPackages;
  if (!Array.isArray(pkgs)) return [];

  const mapOne = (p: any): BogoPkg | null => {
    const buyQuantity = toInt(p?.buyQuantity, 1);
    if (buyQuantity <= 0) return null;

    return {
      buyQuantity: buyQuantity,
      freeQuantity: toInt(p?.freeQuantity, 0),
      title: toStr(p?.title, ""),
      subtitle: toStr(p?.subtitle, ""),
      label: toStr(p?.label, ""),
      badgeText: toStr(p?.badgeText, ""),
      badgeStyle: toStr(p?.badgeStyle, ""),
      selectedByDefault: Boolean(p?.selectedByDefault),
    };
  };

  return pkgs.map(mapOne).filter(Boolean) as BogoPkg[];
}

function normalizeMultiFromOptions(options: any): MultiPkg[] {
  const pkgs = options?.multiPackages;
  if (!Array.isArray(pkgs)) return [];

  const mapOne = (p: any): MultiPkg | null => {
    const quantity = toInt(p?.quantity, 1);
    if (quantity <= 0) return null;

    const mode = String(p?.priceMode ?? "default");
    const rawVal = toFloat(p?.discountValue ?? p?.value ?? 0, 0);

    let discountType: "fixedAmount" | "percentage" = "percentage";
    let discountValue = 0;

    if (mode === "percentage") {
      discountType = "percentage";
      discountValue = clampPercent(rawVal);
    } else if (mode === "fixed") {
      discountType = "fixedAmount";
      discountValue = nonNeg(rawVal);
    } else {
      // "default" or unknown => no discount
      discountType = "percentage";
      discountValue = 0;
    }

    return {
      quantity,
      discountType,
      discountValue,
      title: toStr(p?.title, ""),
      subtitle: toStr(p?.subtitle, ""),
      label: toStr(p?.label, ""),
      badgeText: toStr(p?.badgeText, ""),
      badgeStyle: toStr(p?.badgeStyle, ""),
      selectedByDefault: Boolean(p?.selectedByDefault),
    };
  };

  return pkgs.map(mapOne).filter(Boolean) as MultiPkg[];
}

/** ---------- Volume (same product) ---------- */
export async function parseVolumeSameProductDTO(
  request: Request,
): Promise<VolumeSameProductCreateInput> {
  const { common } = await parseCommonFields(request);

  // Prefer new UI bars from options.packages
  const packages = normalizeVolumePackagesFromOptions(common.options);


  return {
    // Common
    type: "volume-same-product",
    functionId: toStr(common.functionId, ""),
    status: common.status === "active" ? "active" : "draft",
    blockTitle: common.blockTitle,
    nameApp: common.nameApp,
    nameStore: common.nameStore,
    startsAt: common.startsAt ?? null,
    startTime: common.startTime ?? null,
    endsAt: common.endsAt ?? null,
    endTime: common.endTime ?? null,
    visibility: common.visibility ?? "all",
    eligibility: common.eligibility ?? "",
    primarySpecificIds: common.primarySpecificIds,
    primaryExceptIds: common.primaryExceptIds,
    collectionIds: common.collectionIds,
    style: common.style,
    // New multi-bar
    packages: packages.length ? packages : undefined,
  };
}

/** ---------- Bogo ---------- */
export async function parseBogoDTO(
  request: Request,
): Promise<BogoCreateInput> {
  const { common } = await parseCommonFields(request);

  // Prefer new UI bars from options.packages
  const packages = normalizeBogoPackagesFromOptions(common.options);


  return {
    // Common
    type: "bogo",
    functionId: toStr(common.functionId, ""),
    status: common.status === "active" ? "active" : "draft",
    blockTitle: common.blockTitle,
    nameApp: common.nameApp,
    nameStore: common.nameStore,
    startsAt: common.startsAt ?? null,
    startTime: common.startTime ?? null,
    endsAt: common.endsAt ?? null,
    endTime: common.endTime ?? null,
    visibility: common.visibility ?? "all",
    eligibility: common.eligibility ?? "",
    primarySpecificIds: common.primarySpecificIds,
    primaryExceptIds: common.primaryExceptIds,
    collectionIds: common.collectionIds,
    style: common.style,
    packages: packages.length ? packages : undefined,
  };
}

export async function parseMultiProductDTO(
  request: Request,
): Promise<MultiCreateInput> {
  const { common } = await parseCommonFields(request);

  // Prefer new UI bars from options.packages
  const packages = normalizeMultiFromOptions(common.options);


  return {
    // Common
    type: "quantity-break-multi-product",
    functionId: toStr(common.functionId, ""),
    status: common.status === "active" ? "active" : "draft",
    blockTitle: common.blockTitle,
    nameApp: common.nameApp,
    nameStore: common.nameStore,
    startsAt: common.startsAt ?? null,
    startTime: common.startTime ?? null,
    endsAt: common.endsAt ?? null,
    endTime: common.endTime ?? null,
    visibility: common.visibility ?? "all",
    eligibility: common.eligibility ?? "",
    bundleSpecificIds: common.bundleSpecificIds,
    bundleExceptIds: common.bundleExceptIds,
    collectionIds: common.collectionIds,
    style: common.style,
    packages: packages.length ? packages : undefined,
  };
}

/** ---------- generic switching helper (volume only for now) ---------- */
// Overload for now (you’ll add the others later)
export async function parseDiscountDTO(
  request: Request,
  type: "volume-same-product",
): Promise<VolumeSameProductCreateInput>;

export async function parseDiscountDTO(
  request: Request,
  type: "bogo",
): Promise<BogoCreateInput>;

export async function parseDiscountDTO(
  request: Request,
  type: "quantity-break-multi-product",
): Promise<MultiCreateInput>;

// Impl
export async function parseDiscountDTO(
  request: Request,
  type: "volume-same-product | bogo | quantity-break-multi-product" | string,
): Promise<VolumeSameProductCreateInput | BogoCreateInput | MultiCreateInput> {
  switch (type) {
    case "volume-same-product":
      return parseVolumeSameProductDTO(request);
    case "bogo":
      return parseBogoDTO(request);
    case "quantity-break-multi-product":
      return parseMultiProductDTO(request);
    default: {
      // Extend here later for "bogo" and "quantity-break-multi-product"
      const neverType: never = type as never;
      throw new Error(`Unsupported discount type for parser: ${neverType as any}`);
    }
  }
}
