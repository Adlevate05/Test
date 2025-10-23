// app/utils/AppContext.tsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type PropsWithChildren,
  useEffect,
} from "react";

import { useLocation, useMatches } from "@remix-run/react";

import type {
  AppInitialState,
  Visibility,
  Eligibilty,
  Bar,
  BogoBar,
  MultiBar,
  PriceMode,
} from "../utils/types/app-context.types";
import { useCurrency } from "./CurrencyContext";

/* ----------------------------- Types ----------------------------- */

type Ctx = {
  bundleName: string;
  setBundleName: (v: string) => void;
  discountName: string;
  setDiscountName: (v: string) => void;
  blockTitle: string;
  setBlockTitle: (v: string) => void;

  visibility: Visibility;
  setVisibility: (v: Visibility) => void;

  eligibilty: Eligibilty;
  setEligibilty: (v: Eligibilty) => void;

  startDate?: string;
  setStartDate: (v: string) => void;
  startTime?: string;
  setStartTime: (v: string) => void;
  hasEndDate: boolean;
  setHasEndDate: (v: boolean) => void;
  endDate?: string;
  setEndDate: (v: string) => void;
  endTime?: string;
  setEndTime: (v: string) => void;

  cornerRadius: number;
  setCornerRadius: (v: number) => void;
  spacing: number;
  setSpacing: (v: number) => void;
  selectedStyle: number;
  setSelectedStyle: (v: number) => void;

  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;

  primarySpecificIds: string[];
  setPrimarySpecificIds: (v: string[]) => void;
  bundleSpecificIds: string[];
  setBundleSpecificIds: (v: string[]) => void;
  bundleExceptIds: string[];
  setBundleExceptIds: (v: string[]) => void;
  primaryExceptIds: string[];
  setPrimaryExceptIds: (v: string[]) => void;

  // Packages
  packages: Bar[];
  bogoPackages: BogoBar[];
  multiPackages: MultiBar[];

  // Add Packages
  addPackage: (p?: Partial<Bar>) => void;
  bogoAddPackage: (p?: Partial<BogoBar>) => void;
  multiAddPackage: (p?: Partial<MultiBar>) => void;

  // Remove Packages
  removePackage: (index: number) => void;
  bogoRemovePackage: (index: number) => void;
  multiRemovePackage: (index: number) => void;

  // Move Packages
  movePackageUp: (index: number) => void;
  bogoMovePackageUp: (index: number) => void;
  multiMovePackageUp: (index: number) => void;
  movePackageDown: (index: number) => void;
  bogoMovePackageDown: (index: number) => void;
  multiMovePackageDown: (index: number) => void;

  // Update Packages
  updatePackage: (index: number, patch: Partial<Bar>) => void;
  bogoUpdatePackage: (index: number, patch: Partial<Bar>) => void;
  multiUpdatePackage: (index: number, patch: Partial<Bar>) => void;

  selectedThemeColor: string;
  setSelectedThemeColor: (color: string) => void;
  themeColors: string[];
  borderThemeColors: string[];

  // -------------------------------------------------------------------
  // color

  cardsBackground: string;
  setCardsBackground: (v: string) => void;

  selectedBackground: string;
  setSelectedBackground: (v: string) => void;

  borderColor: string;
  setBorderColor: (v: string) => void;

  blockTitleColor: string;
  setBlockTitleColor: (v: string) => void;

  titleColor: string;
  setTitleColor: (v: string) => void;

  subtitleColor: string;
  setSubtitleColor: (v: string) => void;

  priceColor: string;
  setPriceColor: (v: string) => void;

  fullPriceColor: string;
  setFullPriceColor: (v: string) => void;

  labelBackground: string;
  setLabelBackground: (v: string) => void;

  labelText: string;
  setLabelText: (v: string) => void;

  badgeBackground: string;
  setBadgeBackground: (v: string) => void;

  badgeText: string;
  setBadgeText: (v: string) => void;

  // Typography
  blockTitleFontSize: number;
  setBlockTitleFontSize: (v: number) => void;
  blockTitleFontStyle: string;
  setBlockTitleFontStyle: (v: string) => void;

  titleFontSize: number;
  setTitleFontSize: (v: number) => void;
  titleFontStyle: string;
  setTitleFontStyle: (v: string) => void;

  subtitleFontSize: number;
  setSubtitleFontSize: (v: number) => void;
  subtitleFontStyle: string;
  setSubtitleFontStyle: (v: string) => void;

  labelFontSize: number;
  setLabelFontSize: (v: number) => void;
  labelFontStyle: string;
  setLabelFontStyle: (v: string) => void;

  selectedCard: string | null;
  setSelectedCard: React.Dispatch<React.SetStateAction<string | null>>;

  /** Helper function */
  calculateDiscountedPrice: (
    originalPrice: number,
    priceMode: PriceMode,
    discountValue: number,
    quantity?: number,
  ) => number;

  calculateDiscountedPrice_3: (
    originalPrice: number,
    priceMode: PriceMode,
    discountValue: number,
    quantity?: number,
  ) => number;

  calculateDiscountedPrice_2: (options: {
    unitPrice: number;
    quantity: number;
    priceMode: PriceMode;
    discountValue?: number;
    buyQuantity?: number;
    freeQuantity?: number;
  }) => number;

  calculateOffer: (options: {
    buyQuantity: number;
    freeQuantity: number;
    unitPrice: number;
  }) => any;

  renderTemplate: (
    template: string,
    vars: Record<string, string | number | boolean>,
  ) => string;

  //  forms validatin
  bundleNameError?: string;
  setBundleNameError: (v?: string) => void;
  barTitleError?: string;
  setBarTitleError: (v?: string) => void;
  blockTitleError?: string;
  setBlockTitleError: (v?: string) => void;

  validateForm: () => boolean;
};

/* ---------------------------- Theme Colors ---------------------------- */

const themeColor = [
  "#000000", // Black
  "#FF0000", // Red
  "#FF8C00", // Orange
  "#90EE90", // Light Green
  "#00FF00", // Green
  "#00BFFF", // Sky Blue
  "#8A2BE2", // Blue Violet
  "#FF1493", // Deep Pink
];
const borderThemeColor = [
  "#374151",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

/* ---------------------------- Context ---------------------------- */
const AppCtx = createContext<Ctx | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useAppContext must be used inside <AppProvider>");
  return ctx;
};

/* --------------------------- Provider ---------------------------- */
type AppProviderProps = PropsWithChildren<{
  initialState?: AppInitialState;
}>;

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  initialState,
}) => {
  const now = new Date();
  // 1) Where in the app tree are we?
  const location = useLocation();
  const matches = useMatches();

  // 2) If missing, log *exact route path* + route ids + a real stack
  if (typeof window !== "undefined" && initialState === undefined) {
    const routeIds = matches.map((m) => m.id).join(" → ");
    const err = new Error(
      `[AppProvider] missing initialState at ${location.pathname} | matches: ${routeIds}`,
    );
    // Print both a stack AND structured info
    console.error(err); // includes JS stack
    console.log({
      pathname: location.pathname,
      routeIds,
      where: "CSR",
      note: "Find the route above mounting <AppProvider> without props",
    });
  }
  const init = <T,>(key: keyof AppInitialState, fallback: T): T =>
    (initialState?.[key] as T | undefined) ?? fallback;

  const { symbol, currencyCode } = useCurrency();

  // ----------------------------- Typography -----------------------------
  const [blockTitleFontSize, setBlockTitleFontSize] = useState(
    init("blockTitleFontSize", 14),
  );
  const [blockTitleFontStyle, setBlockTitleFontStyle] = useState(
    init("blockTitleFontStyle", "Regular"),
  );

  const [titleFontSize, setTitleFontSize] = useState(init("titleFontSize", 16));
  const [titleFontStyle, setTitleFontStyle] = useState(
    init("titleFontStyle", "Regular"),
  );

  const [subtitleFontSize, setSubtitleFontSize] = useState(
    init("subtitleFontSize", 13),
  );
  const [subtitleFontStyle, setSubtitleFontStyle] = useState(
    init("subtitleFontStyle", "Regular"),
  );

  const [labelFontSize, setLabelFontSize] = useState(init("labelFontSize", 12));
  const [labelFontStyle, setLabelFontStyle] = useState(
    init("labelFontStyle", "Regular"),
  );

  const [bundleName, setBundleName] = useState<string>(
    init("bundleName", "Bundle #1"),
  );
  const [discountName, setDiscountName] = useState<string>(
    init("discountName", ""),
  );
  const [blockTitle, setBlockTitle] = useState<string>(
    init("blockTitle", "BUNDLE & SAVE"),
  );
  const [visibility, setVisibility] = useState<Visibility>(
    init("visibility", "all"),
  );
  const [eligibilty, setEligibilty] = useState<Eligibilty>(
    init("eligibilty", "bundle_except"),
  );
  const [startDate, setStartDate] = useState<string>(() =>
    init("startDate", now.toISOString().split("T")[0]),
  );

  const [startTime, setStartTime] = useState<string>(
    () => init("startTime", now.toTimeString().slice(0, 5)), // HH:mm
  );

  const [endDate, setEndDate] = useState<string | undefined>(
    () => initialState?.endDate,
  );

  const [endTime, setEndTime] = useState<string | undefined>(
    () => initialState?.endTime,
  );
  const [hasEndDate, setHasEndDate] = useState(init("hasEndDate", false));

  useEffect(() => {
    if (hasEndDate) {
      setEndDate(startDate);
      setEndTime(endTime ?? "23:59");
    } else {
      setEndDate(undefined);
      setEndTime(undefined);
    }
  }, [hasEndDate, startDate, endTime]);

  const [cornerRadius, setCornerRadius] = useState(init("cornerRadius", 8));
  const [spacing, setSpacing] = useState(init("spacing", 16));
  const [selectedStyle, setSelectedStyle] = useState(init("selectedStyle", 0));

  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [primarySpecificIds, setPrimarySpecificIds] = useState<string[]>(
    init("primarySpecificIds", []),
  );
  const [bundleSpecificIds, setBundleSpecificIds] = useState<string[]>(
    init("bundleSpecificIds", []),
  );
  const [bundleExceptIds, setBundleExceptIds] = useState<string[]>(
    init("bundleExceptIds", []),
  );
  const [primaryExceptIds, setPrimaryExceptIds] = useState<string[]>(
    init("primaryExceptIds", []),
  );

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [bundleNameError, setBundleNameError] = useState<string>();
  const [barTitleError, setBarTitleError] = useState<string>();
  const [blockTitleError, setBlockTitleError] = useState<string>();

  // ---------------------------------------------------------------------------------
  //  colors
  // ---------------------------------------------------------------------------------

  const [cardsBackground, setCardsBackground] = useState(
    init("cardsBackground", "#f6f6f7"),
  );
  const [selectedBackground, setSelectedBackground] = useState(
    init("selectedBackground", "#ffffff"),
  );
  const [borderColor, setBorderColor] = useState(
    init("borderColor", "#a259ff"),
  );
  const [blockTitleColor, setBlockTitleColor] = useState(
    init("blockTitleColor", "#000000"),
  );

  const [titleColor, setTitleColor] = useState(init("titleColor", "#000000"));
  const [subtitleColor, setSubtitleColor] = useState(
    init("subtitleColor", "#666666"),
  );
  const [priceColor, setPriceColor] = useState(init("priceColor", "#000000"));
  const [fullPriceColor, setFullPriceColor] = useState(
    init("fullPriceColor", "#666666"),
  );

  const [labelBackground, setLabelBackground] = useState(
    init("labelBackground", "#f6f6f7"),
  );
  const [labelText, setLabelText] = useState(init("labelText", "#ffffff"));
  const [badgeBackground, setBadgeBackground] = useState(
    init("badgeBackground", "#a259ff"),
  );
  const [badgeText, setBadgeText] = useState(init("badgeText", "#ffffff"));

  // ----------------------------- Helper Functions -----------------------------

  const [packages, setPackages] = useState<Bar[]>(() => {
    if (initialState?.packages && initialState.packages.length > 0) {
      // coming from DB → map into Bar type
      return initialState.packages.map((pkg) => ({
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        title: pkg.title ?? "Pack",
        quantity: pkg.quantity,
        Blocktitle: pkg.Blocktitle ?? "BUNDLE & SAVE",
        subtitle: pkg.subtitle ?? "",
        priceMode:
          !pkg.discountValue || pkg.discountValue === 0
            ? "default"
            : pkg.discountType === "fixedAmount"
              ? "fixed"
              : pkg.discountType === "percentage"
                ? "percentage"
                : "default",
        discountValue: pkg.discountValue,
        badgeText: pkg.badgeText ?? "",
        badgeStyle: pkg.badgeStyle ?? "simple",
        label: pkg.label ?? "",
        selectedByDefault: pkg.selectedByDefault ?? false,
        symbol: symbol,
        currencyCode: currencyCode,
      }));
    }

    // fallback default if no DB packages
    return [
      {
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        title: "Pack",
        quantity: 1,
        Blocktitle: "BUNDLE & SAVE",
        subtitle: "Standard price",
        priceMode: "default",
        badgeText: "",
        badgeStyle: "simple",
        label: "Save {{saved_total}}",
        selectedByDefault: true,
        price: 10,
        symbol: symbol,
        currencyCode: currencyCode,
      },
      {
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        title: "Pack",
        quantity: 2,
        Blocktitle: "BUNDLE & SAVE",
        subtitle: "You save {{saved_percentage}}",
        priceMode: "percentage",
        badgeText: "Most Popular",
        badgeStyle: "most-popular",
        label: "SAVE {{saved_total}}",
        selectedByDefault: false,
        price: 10,
        discountValue: 10,
        symbol: symbol,
        currencyCode: currencyCode,
      },
    ];
  });

  const [bogoPackages, setBogoPackages] = useState<BogoBar[]>(() => {
    if (initialState?.bogoPackages && initialState.bogoPackages.length > 0) {
      // coming from DB → map into Bar type
      return initialState.bogoPackages.map((pkg) => ({
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        title: pkg.title ?? "Buy 1, Get 1 Free",
        Blocktitle: pkg.Blocktitle ?? "BUNDLE & SAVE",
        subtitle: pkg.subtitle ?? "price",
        priceMode: pkg.priceMode ?? "default",
        badgeText: pkg.badgeText ?? "Most Popular",
        badgeStyle: pkg.badgeStyle ?? "most-popular",
        label: pkg.label ?? "Save {{saved_total}}",
        freeQuantity: pkg.freeQuantity,
        buyQuantity: pkg.buyQuantity,
        selectedByDefault: pkg.selectedByDefault ?? false,
        price: 100,
        symbol: symbol,
        currencyCode: currencyCode,
      }));
    }

    return [
      {
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        title: "Buy 1, Get 1 Free",
        Blocktitle: "BUNDLE & SAVE",
        subtitle: "price",
        priceMode: "default",
        badgeText: "Most Popular",
        badgeStyle: "most-popular",
        label: "Save {{saved_total}}",
        freeQuantity: 1,
        buyQuantity: 1,
        selectedByDefault: true,
        price: 100,
        symbol: symbol,
        currencyCode: currencyCode,
      },
      {
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        title: "Buy 2, Get 3 Free",
        Blocktitle: "BUNDLE & SAVE",
        subtitle: "price",
        priceMode: "default",
        badgeText: "Most Popular",
        badgeStyle: "most-popular",
        label: "Save {{saved_total}}",
        freeQuantity: 2,
        buyQuantity: 2,
        selectedByDefault: false,
        price: 200,
        symbol: symbol,
        currencyCode: currencyCode,
      },
      {
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        title: "Buy 3, Get 4 Free",
        Blocktitle: "BUNDLE & SAVE",
        subtitle: "price",
        priceMode: "default",
        badgeText: "Most Popular",
        badgeStyle: "most-popular",
        label: "Save {{saved_total}}",
        freeQuantity: 3,
        buyQuantity: 3,
        selectedByDefault: false,
        price: 300,
        symbol: symbol,
        currencyCode: currencyCode,
      },
    ];
  });

  const [multiPackages, setMultiPackages] = useState<MultiBar[]>(() => {
    if (initialState?.multiPackages && initialState.multiPackages.length > 0) {
      // coming from DB → map into Bar type
      return initialState.multiPackages.map((pkg) => ({
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        title: pkg.title,
        Blocktitle: pkg.Blocktitle ?? "BUNDLE & SAVE",
        subtitle: pkg.subtitle ?? "price",
        priceMode:
          !pkg.discountValue || pkg.discountValue === 0
            ? "default"
            : pkg.discountType === "fixedAmount"
              ? "fixed"
              : pkg.discountType === "percentage"
                ? "percentage"
                : "default",

        discountValue: pkg.discountValue,
        badgeText: pkg.badgeText ?? "",
        badgeStyle: pkg.badgeStyle ?? "simple",
        label: pkg.label ?? "",
        quantity: pkg.quantity,
        selectedByDefault: pkg.selectedByDefault ?? false,
        price: 100,
        symbol: symbol,
        currencyCode: currencyCode,
      }));
    }

    return [
      {
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        title: "Buy One Pack",
        Blocktitle: "BUNDLE & SAVE",
        subtitle: "Standard price",
        priceMode: "default",
        badgeText: "Save 50%",
        badgeStyle: "simple",
        label: "Save {{saved_total}}",
        quantity: 1,
        selectedByDefault: true,
        price: 100,
        symbol: symbol,
        currencyCode: currencyCode,
      },
      {
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        title: "Buy Two Pack",
        Blocktitle: "BUNDLE & SAVE",
        subtitle: "Standard price",
        priceMode: "default",
        badgeText: "Save 60%",
        badgeStyle: "simple",
        label: "Save {{saved_total}}",
        quantity: 2,
        selectedByDefault: false,
        price: 200,
        symbol: symbol,
        currencyCode: currencyCode,
      },
    ];
  });

  // validateForm will be declared after package state so it has access to packages, bogoPackages and multiPackages
  const validateForm = useCallback(() => {
    let valid = true;

    if (!bundleName.trim()) {
      setBundleNameError("Bundle name is required");
      valid = false;
    } else {
      setBundleNameError(undefined);
    }

    // Validate that every package has a non-empty title — collect ids for any failing package
    const emptyPackageIds: string[] = [
      ...(Array.isArray(packages)
        ? packages.filter((p) => !(p.title && p.title.trim())).map((p) => p.id)
        : []),
      ...(Array.isArray(bogoPackages)
        ? bogoPackages
            .filter((p) => !(p.title && p.title.trim()))
            .map((p) => p.id)
        : []),
      ...(Array.isArray(multiPackages)
        ? multiPackages
            .filter((p) => !(p.title && p.title.trim()))
            .map((p) => p.id)
        : []),
    ];

    if (emptyPackageIds.length > 0) {
      setBarTitleError(
        `Title is required for package id(s): ${emptyPackageIds.join(", ")}`,
      );
      valid = false;
    } else {
      setBarTitleError(undefined);
    }

    if (!blockTitle.trim()) {
      setBlockTitleError("Block title is required");
      valid = false;
    } else {
      setBlockTitleError(undefined);
    }

    return valid;
  }, [bundleName, blockTitle, packages, bogoPackages, multiPackages]);

  const addPackage = useCallback(
    (bar: Partial<Bar> = {}) => {
      setPackages((prev) => [
        ...prev,
        {
          id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
          title: bar.title ?? `New bar`,
          quantity: bar.quantity ?? 1,
          Blocktitle: bar.Blocktitle ?? blockTitle,
          subtitle: bar.subtitle ?? "",
          priceMode: bar.priceMode ?? "default",
          badgeText: bar.badgeText ?? "",
          badgeStyle: bar.badgeStyle ?? "simple",
          label: bar.label ?? "",
          selectedByDefault: bar.selectedByDefault ?? false,
          symbol: symbol,
          currencyCode: currencyCode,
        },
      ]);
    },
    [blockTitle],
  );

  const bogoAddPackage = useCallback(
    (bar: Partial<BogoBar> = {}) => {
      setBogoPackages((prev) => [
        ...prev,
        {
          id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
          title: bar.title ?? `New bar`,
          buyQuantity: bar.buyQuantity ?? 1,
          freeQuantity: bar.freeQuantity ?? 1,
          Blocktitle: bar.Blocktitle ?? blockTitle,
          subtitle: bar.subtitle ?? "save 5%",
          priceMode: bar.priceMode ?? "default",
          badgeText: bar.badgeText ?? "",
          badgeStyle: bar.badgeStyle ?? "simple",
          label: bar.label ?? "",
          selectedByDefault: bar.selectedByDefault ?? false,
          symbol: symbol,
          currencyCode: currencyCode,
        },
      ]);
    },
    [blockTitle],
  );

  const multiAddPackage = useCallback(
    (bar: Partial<MultiBar> = {}) => {
      setMultiPackages((prev) => [
        ...prev,
        {
          id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
          title: bar.title ?? `New bar`,
          quantity: bar.quantity ?? 1,
          Blocktitle: bar.Blocktitle ?? blockTitle,
          subtitle: bar.subtitle ?? "Standard price",
          priceMode: bar.priceMode ?? "default",
          badgeText: bar.badgeText ?? "",
          badgeStyle: bar.badgeStyle ?? "simple",
          label: bar.label ?? "",
          selectedByDefault: bar.selectedByDefault ?? false,
          symbol: symbol,
          currencyCode: currencyCode,
        },
      ]);
    },
    [blockTitle],
  );

  const removePackage = useCallback((index: number) => {
    setPackages((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  }, []);

  const bogoRemovePackage = useCallback((index: number) => {
    setBogoPackages((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  }, []);

  const multiRemovePackage = useCallback((index: number) => {
    setMultiPackages((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
    );
  }, []);

  const movePackageUp = useCallback((index: number) => {
    if (index === 0) return;
    setPackages((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const bogoMovePackageUp = useCallback((index: number) => {
    if (index === 0) return;
    setBogoPackages((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const multiMovePackageUp = useCallback((index: number) => {
    if (index === 0) return;
    setMultiPackages((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const movePackageDown = useCallback((index: number) => {
    setPackages((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      return next;
    });
  }, []);

  const bogoMovePackageDown = useCallback((index: number) => {
    setBogoPackages((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      return next;
    });
  }, []);

  const multiMovePackageDown = useCallback((index: number) => {
    setMultiPackages((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      return next;
    });
  }, []);

  const updatePackage = useCallback((index: number, patch: Partial<Bar>) => {
    setPackages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

  const bogoUpdatePackage = useCallback(
    (index: number, patch: Partial<Bar>) => {
      setBogoPackages((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...patch };
        return next;
      });
    },
    [],
  );

  const multiUpdatePackage = useCallback(
    (index: number, patch: Partial<Bar>) => {
      setMultiPackages((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], ...patch };
        return next;
      });
    },
    [],
  );

  const calculateDiscountedPrice = useCallback(
    (
      originalPrice: number,
      priceMode: PriceMode,
      discountValue: number,
      quantity: number = 1,
    ) => {
      let discounted = originalPrice;

      if (priceMode === "percentage") {
        discounted = originalPrice * (1 - discountValue / 100);
      } else if (priceMode === "fixed") {
        discounted = Math.max(0, originalPrice - discountValue);
      } else if (priceMode === "default") {
        discounted = Math.max(0, originalPrice);
      }

      return discounted;
    },
    [],
  );

  const calculateDiscountedPrice_3 = useCallback(
    (
      unitPrice: number,
      priceMode: PriceMode,
      discountValue: number,
      quantity: number = 1,
    ) => {
      const totalBefore = unitPrice * quantity;
      let totalAfter = totalBefore;

      if (priceMode === "percentage") {
        totalAfter = totalBefore * (1 - discountValue / 100);
      } else if (priceMode === "fixed") {
        totalAfter = Math.max(0, totalBefore - discountValue);
      } else if (priceMode === "default") {
        totalAfter = totalBefore;
      }

      return totalAfter;
    },
    [],
  );

  const calculateDiscountedPrice_2 = useCallback(
    ({
      unitPrice,
      quantity = 1,
      priceMode,
      discountValue = 0,
      buyQuantity = 0,
      freeQuantity = 0,
    }: {
      unitPrice: number;
      quantity?: number;
      priceMode: PriceMode;
      discountValue?: number;
      buyQuantity?: number;
      freeQuantity?: number;
    }): number => {
      return (buyQuantity / (buyQuantity + freeQuantity)) * 100;

      // if (priceMode === "percentage")
      //   return unitPrice * quantity * (1 - discountValue / 100);

      // if (priceMode === "fixed")
      //   return Math.max(0, unitPrice * quantity - discountValue);

      // if (priceMode === "default") {
      //   const groupSize = buyQuantity + freeQuantity;
      //   if (groupSize === 0 || buyQuantity === 0) return unitPrice * quantity;

      //   const fullBundles = Math.floor(quantity / groupSize);
      //   const remainder = quantity % groupSize;
      //   const paidItems = fullBundles * buyQuantity + remainder;

      //   return discountValue > 0
      //     ? paidItems * unitPrice -
      //     fullBundles * freeQuantity * unitPrice * (discountValue / 100)
      //     : paidItems * unitPrice;
      // }

      // return unitPrice * quantity; // default
    },
    [],
  );

  const calculateOffer = useCallback(
    ({
      unitPrice,
      buyQuantity = 1,
      freeQuantity = 0,
    }: {
      unitPrice: number;
      buyQuantity?: number;
      freeQuantity?: number;
    }) => {
      if (buyQuantity <= 0 || unitPrice <= 0) return null;

      const actualPrice = (buyQuantity + freeQuantity) * unitPrice;
      const priceToPay = buyQuantity * unitPrice;
      const savePercentage =
        (freeQuantity / (buyQuantity + freeQuantity)) * 100;
      const savedAmount = actualPrice - priceToPay;

      return { savePercentage, actualPrice, priceToPay, savedAmount };
    },
    [],
  );

  const renderTemplate = useCallback(
    (template: string, vars: Record<string, any>) => {
      return template.replace(/{{(.*?)}}/g, (_match, key) => {
        const trimmedKey = String(key).trim();
        const raw = vars[trimmedKey];

        // Gracefully handle undefined/missing
        let actual = raw !== undefined && raw !== null ? String(raw) : "";

        // Special cases
        if (trimmedKey === "saved_percentage") {
          const n = Number.parseFloat(actual);
          return Number.isFinite(n) ? `${Math.round(n)}%` : "";
        }

        if (trimmedKey === "saved_total") {
          const n = Number.parseFloat(actual);
          return Number.isFinite(n)
            ? `${symbol}${Math.round(n)}`
            : `${symbol}0`;
        }

        // Default: if numeric, format to 2 decimals; else return as-is
        const n = Number.parseFloat(actual);
        return Number.isFinite(n) ? n.toFixed(2) : actual;
      });
    },
    [symbol], // 👈 include dependencies captured inside the function
  );

  const [selectedThemeColor, setSelectedThemeColor] = useState<string>(
    themeColor[0],
  );

  const value = useMemo<Ctx>(
    () => ({
      bundleName,
      setBundleName,
      discountName,
      setDiscountName,
      blockTitle,
      setBlockTitle,
      visibility,
      setVisibility,
      eligibilty,
      setEligibilty,
      startDate,
      setStartDate,
      startTime,
      setStartTime,
      hasEndDate,
      setHasEndDate,
      endDate,
      setEndDate,
      endTime,
      setEndTime,
      cornerRadius,
      setCornerRadius,
      spacing,
      setSpacing,
      selectedStyle,
      setSelectedStyle,
      searchValue,
      setSearchValue,
      currentPage,
      setCurrentPage,
      itemsPerPage,
      primarySpecificIds,
      setPrimarySpecificIds,
      bundleSpecificIds,
      setBundleSpecificIds,
      bundleExceptIds,
      setBundleExceptIds,
      primaryExceptIds,
      setPrimaryExceptIds,
      packages,
      addPackage,
      removePackage,
      movePackageUp,
      movePackageDown,
      updatePackage,
      selectedThemeColor,
      setSelectedThemeColor,
      themeColors: themeColor,
      borderThemeColors: borderThemeColor,
      calculateDiscountedPrice,
      bogoPackages: bogoPackages,
      bogoAddPackage,
      bogoUpdatePackage,
      bogoMovePackageUp,
      bogoMovePackageDown,
      bogoRemovePackage,
      multiPackages: multiPackages,
      multiAddPackage,
      multiUpdatePackage,
      multiMovePackageUp,
      multiMovePackageDown,
      multiRemovePackage,
      renderTemplate,
      calculateDiscountedPrice_2,
      calculateDiscountedPrice_3,
      calculateOffer,
      cardsBackground,
      setCardsBackground,
      selectedBackground,
      setSelectedBackground,
      borderColor,
      setBorderColor,
      blockTitleColor,
      setBlockTitleColor,
      titleColor,
      setTitleColor,
      subtitleColor,
      setSubtitleColor,
      priceColor,
      setPriceColor,
      fullPriceColor,
      setFullPriceColor,
      labelBackground,
      setLabelBackground,
      labelText,
      setLabelText,
      badgeBackground,
      setBadgeBackground,
      badgeText,
      setBadgeText,
      blockTitleFontSize,
      setBlockTitleFontSize,
      blockTitleFontStyle,
      setBlockTitleFontStyle,

      titleFontSize,
      setTitleFontSize,
      titleFontStyle,
      setTitleFontStyle,

      subtitleFontSize,
      setSubtitleFontSize,
      subtitleFontStyle,
      setSubtitleFontStyle,

      labelFontSize,
      setLabelFontSize,
      labelFontStyle,
      setLabelFontStyle,
      selectedCard,
      setSelectedCard,

      bundleNameError,
      setBundleNameError,
      barTitleError,
      setBarTitleError,
      blockTitleError,
      setBlockTitleError,
      validateForm,
    }),
    [
      bundleName,
      discountName,
      blockTitle,
      visibility,
      eligibilty,
      startDate,
      startTime,
      hasEndDate,
      endDate,
      endTime,
      cornerRadius,
      spacing,
      selectedStyle,
      searchValue,
      currentPage,
      itemsPerPage,
      primarySpecificIds,
      bundleSpecificIds,
      bundleExceptIds,
      primaryExceptIds,
      packages,
      addPackage,
      removePackage,
      movePackageUp,
      movePackageDown,
      updatePackage,
      selectedThemeColor,
      calculateDiscountedPrice,
      bogoPackages,
      bogoAddPackage,
      bogoUpdatePackage,
      bogoMovePackageUp,
      bogoMovePackageDown,
      bogoRemovePackage,
      multiPackages,
      multiAddPackage,
      multiUpdatePackage,
      multiMovePackageUp,
      multiMovePackageDown,
      multiRemovePackage,
      calculateDiscountedPrice_2,
      calculateDiscountedPrice_3,
      calculateOffer,
      bundleNameError,
      setBundleNameError,
      barTitleError,
      setBarTitleError,
      blockTitleError,
      setBlockTitleError,
      validateForm,

      cardsBackground,
      selectedBackground,
      borderColor,
      blockTitleColor,
      titleColor,
      subtitleColor,
      priceColor,
      fullPriceColor,
      labelBackground,
      labelText,
      badgeBackground,
      badgeText,
      blockTitleFontSize,
      setBlockTitleFontSize,
      // -----------------------------------------------------------------------------------
      blockTitleFontStyle,
      setBlockTitleFontStyle,
      titleFontSize,
      setTitleFontSize,
      titleFontStyle,
      setTitleFontStyle,
      subtitleFontSize,
      setSubtitleFontSize,
      subtitleFontStyle,
      setSubtitleFontStyle,
      labelFontSize,
      setLabelFontSize,
      labelFontStyle,
      setLabelFontStyle,
      renderTemplate,
      selectedCard,
      setSelectedCard,
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};
