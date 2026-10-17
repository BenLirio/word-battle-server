// Languages a viewer can read entries in. The list is fixed so that cached
// translations stay bounded at (entries x languages).
export const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: "English",
  "zh-Hans": "Simplified Chinese",
  "zh-Hant": "Traditional Chinese",
  ja: "Japanese",
  ko: "Korean",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  it: "Italian",
  ru: "Russian",
  uk: "Ukrainian",
  pl: "Polish",
  nl: "Dutch",
  sv: "Swedish",
  tr: "Turkish",
  el: "Greek",
  ar: "Arabic",
  he: "Hebrew",
  fa: "Persian",
  hi: "Hindi",
  bn: "Bengali",
  vi: "Vietnamese",
  th: "Thai",
  id: "Indonesian",
  ms: "Malay",
};

export const DEFAULT_LANGUAGE = "en";

// Maps a browser locale such as "zh-TW" or "pt_BR" to a supported language,
// or undefined when the language is not supported.
export const normalizeLanguage = (locale?: string): string | undefined => {
  if (typeof locale !== "string") return undefined;
  const parts = locale.trim().toLowerCase().split(/[-_]/);
  const primary = parts[0];
  if (primary === "zh") {
    const traditional = parts
      .slice(1)
      .some((part) => ["hant", "tw", "hk", "mo"].includes(part));
    return traditional ? "zh-Hant" : "zh-Hans";
  }
  return primary in SUPPORTED_LANGUAGES ? primary : undefined;
};

// Normalizes a model-reported source language; unknown codes become "und".
export const normalizeSourceLanguage = (code?: string): string => {
  const supported = normalizeLanguage(code);
  if (supported) return supported;
  const primary = (code || "").trim().toLowerCase().split(/[-_]/)[0];
  return /^[a-z]{2,3}$/.test(primary) ? primary : "und";
};
