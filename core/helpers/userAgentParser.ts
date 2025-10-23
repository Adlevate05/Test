// utils/userAgent.ts

export type ParsedUserAgent = {
  os: string;
  browser: string;
  browserVersion: string;
  platform: string;
};

export function parseUserAgent(userAgent: string | undefined): ParsedUserAgent {
  if (!userAgent) {
    return {
      os: "Unknown",
      browser: "Unknown",
      browserVersion: "Unknown",
      platform: "Unknown",
    };
  }

  let os = "Unknown";
  let browser = "Unknown";
  let browserVersion = "Unknown";
  let platform = userAgent.includes("Mobile") ? "Mobile" : "Desktop";

  // --- OS detection ---
  if (userAgent.includes("Win")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "MacOS";
  else if (userAgent.includes("X11") || userAgent.includes("Linux"))
    os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
    os = "iOS";

  // --- Browser detection + version ---
  const browserRegexes: { name: string; regex: RegExp }[] = [
    { name: "Chrome", regex: /Chrome\/([\d.]+)/ },
    { name: "Firefox", regex: /Firefox\/([\d.]+)/ },
    { name: "Safari", regex: /Version\/([\d.]+).*Safari/ },
    { name: "Edge", regex: /Edg\/([\d.]+)/ },
    { name: "IE", regex: /(MSIE |rv:)([\d.]+)/ },
  ];

  for (const { name, regex } of browserRegexes) {
    const match = userAgent.match(regex);
    if (match) {
      browser = name;
      browserVersion = match[1] ?? match[2] ?? "Unknown";
      break;
    }
  }

  return { os, browser, browserVersion, platform };
}
