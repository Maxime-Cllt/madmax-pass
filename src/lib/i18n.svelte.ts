// --- i18n: lightweight FR/EN translator with Svelte 5 reactivity ---

export type Locale = "fr" | "en";

type Dict = Record<string, string>;

const FR: Dict = {
    // sidebar
    "nav.passwords": "Générateur",
    "nav.tokens": "Tokens",
    "nav.analyze": "Analyser",
    "sidebar.lang": "Langue",

    // password view
    "password.title": "Sécurité Maximale",
    "password.subtitle": "Génération de clés cryptographiques à haute entropie",
    "password.outputLabel": "Mot de passe généré",
    "password.copyTitle": "Copier le mot de passe",
    "password.generate": "GÉNÉRER",
    "password.length": "Longueur",
    "password.upper": "Majuscules",
    "password.lower": "Minuscules",
    "password.digits": "Chiffres",
    "password.symbols": "Symboles",
    "password.quantumSafe": "Mode Quantum Safe",
    "password.quantumSafeDesc": "≥ 128 bits quantiques · min 40 car.",

    // token view
    "token.title": "Token Cryptographique",
    "token.subtitle": "Génération de tokens via entropie OS",
    "token.outputLabel": "Token généré",
    "token.copyTitle": "Copier le token",
    "token.generate": "GÉNÉRER",
    "token.size": "Taille (octets)",
    "token.format": "Format",

    // analyze view
    "analyze.title": "Analyseur de Sécurité",
    "analyze.subtitle": "Évaluez la robustesse d'un mot de passe existant",
    "analyze.inputLabel": "Mot de passe à analyser",
    "analyze.placeholder": "Entrez un mot de passe…",
    "analyze.visibilityTitle": "Afficher / masquer",
    "analyze.emptyHint": "Entrez un mot de passe pour voir son analyse",
    "analyze.strength": "Force",
    "analyze.length": "Longueur",
    "analyze.pool": "Pool",
    "analyze.entropyPerChar": "Entropie/car.",
    "analyze.classicalBits": "Entropie class.",
    "analyze.quantumBits": "Entropie quant.",
    "analyze.score": "Score",
    "analyze.composition": "Composition",
    "analyze.warnings": "Avertissements",
    "analyze.noIssues": "Aucun problème détecté",

    // crack times
    "crack.title": "Temps pour craquer",
    "crack.fast": "Hash rapide",
    "crack.slow": "Hash lent",
    "crack.quantum": "Quantique",

    // strength labels
    "strength.veryWeak": "Très faible",
    "strength.weak": "Faible",
    "strength.medium": "Moyen",
    "strength.strong": "Fort",
    "strength.veryStrong": "Très fort",
    "strength.quantum": "Quantique ✓",

    // status messages
    "status.passwordGenerated": "Nouveau mot de passe généré",
    "status.passwordGeneratedCopied": "Nouveau mot de passe généré et copié !",
    "status.tokenGenerated": "Nouveau token généré",
    "status.copied": "Copié !",
    "status.copyError": "Erreur de copie",

    // time units (singular / plural)
    "time.lessThanSecond": "< 1 seconde",
    "time.seconds": "secondes",
    "time.second": "seconde",
    "time.minutes": "minutes",
    "time.minute": "minute",
    "time.hours": "heures",
    "time.hour": "heure",
    "time.days": "jours",
    "time.day": "jour",
    "time.years": "ans",
    "time.year": "an",

    // warnings (Rust-emitted)
    "warning.tooShort": "Trop court — minimum recommandé : 12 caractères",
    "warning.lowLength": "Longueur faible — recommandé : ≥ 12 caractères",
    "warning.repeatedChars": "Répétition de caractères ({n} consécutifs identiques)",
    "warning.ascending": "Séquence ascendante détectée (ex : abcd, 1234)",
    "warning.descending": "Séquence descendante détectée (ex : dcba, 9876)",
    "warning.year": "Contient une année (ex : 1990, 2024)",
    "warning.singleClass": "Un seul type de caractère — diversifiez votre mot de passe",
    "warning.repeatedBlock": "Motif répété détecté (bloc de {n} car. répété)",
};

const EN: Dict = {
    "nav.passwords": "Generator",
    "nav.tokens": "Tokens",
    "nav.analyze": "Analyze",
    "sidebar.lang": "Language",

    "password.title": "Maximum Security",
    "password.subtitle": "High-entropy cryptographic key generation",
    "password.outputLabel": "Generated password",
    "password.copyTitle": "Copy password",
    "password.generate": "GENERATE",
    "password.length": "Length",
    "password.upper": "Uppercase",
    "password.lower": "Lowercase",
    "password.digits": "Digits",
    "password.symbols": "Symbols",
    "password.quantumSafe": "Quantum Safe Mode",
    "password.quantumSafeDesc": "≥ 128 quantum bits · min 40 chars",

    "token.title": "Cryptographic Token",
    "token.subtitle": "Token generation via OS entropy",
    "token.outputLabel": "Generated token",
    "token.copyTitle": "Copy token",
    "token.generate": "GENERATE",
    "token.size": "Size (bytes)",
    "token.format": "Format",

    "analyze.title": "Security Analyzer",
    "analyze.subtitle": "Assess the strength of an existing password",
    "analyze.inputLabel": "Password to analyze",
    "analyze.placeholder": "Enter a password…",
    "analyze.visibilityTitle": "Show / hide",
    "analyze.emptyHint": "Enter a password to see its analysis",
    "analyze.strength": "Strength",
    "analyze.length": "Length",
    "analyze.pool": "Pool",
    "analyze.entropyPerChar": "Entropy/char",
    "analyze.classicalBits": "Classical entropy",
    "analyze.quantumBits": "Quantum entropy",
    "analyze.score": "Score",
    "analyze.composition": "Composition",
    "analyze.warnings": "Warnings",
    "analyze.noIssues": "No issues detected",

    "crack.title": "Time to crack",
    "crack.fast": "Fast hash",
    "crack.slow": "Slow hash",
    "crack.quantum": "Quantum",

    "strength.veryWeak": "Very weak",
    "strength.weak": "Weak",
    "strength.medium": "Medium",
    "strength.strong": "Strong",
    "strength.veryStrong": "Very strong",
    "strength.quantum": "Quantum ✓",

    "status.passwordGenerated": "New password generated",
    "status.passwordGeneratedCopied": "New password generated and copied!",
    "status.tokenGenerated": "New token generated",
    "status.copied": "Copied!",
    "status.copyError": "Copy error",

    "time.lessThanSecond": "< 1 second",
    "time.seconds": "seconds",
    "time.second": "second",
    "time.minutes": "minutes",
    "time.minute": "minute",
    "time.hours": "hours",
    "time.hour": "hour",
    "time.days": "days",
    "time.day": "day",
    "time.years": "years",
    "time.year": "year",

    "warning.tooShort": "Too short — recommended minimum: 12 characters",
    "warning.lowLength": "Low length — recommended: ≥ 12 characters",
    "warning.repeatedChars": "Repeated characters ({n} consecutive identical)",
    "warning.ascending": "Ascending sequence detected (e.g. abcd, 1234)",
    "warning.descending": "Descending sequence detected (e.g. dcba, 9876)",
    "warning.year": "Contains a year (e.g. 1990, 2024)",
    "warning.singleClass": "Single character class — diversify your password",
    "warning.repeatedBlock": "Repeated pattern detected ({n}-char block repeated)",
};

const DICTS: Record<Locale, Dict> = {fr: FR, en: EN};
const STORAGE_KEY = "locale";

function detectInitialLocale(): Locale {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "fr" || stored === "en") return stored;
    const nav = navigator.language?.toLowerCase() ?? "";
    return nav.startsWith("fr") ? "fr" : "en";
}

// Reactive locale state (Svelte 5 rune).
// Components that read `locale.current` or call `t(...)` auto-update on change.
export const locale = $state<{current: Locale}>({current: detectInitialLocale()});

export function setLocale(next: Locale) {
    if (next === locale.current) return;
    locale.current = next;
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute("lang", next);
}

export function t(key: string, params?: Record<string, string | number>): string {
    const dict = DICTS[locale.current];
    let value = dict[key] ?? DICTS.fr[key] ?? key;
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            value = value.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
    }
    return value;
}

// --- Translators for Rust-emitted strings (FR-only at source) ---

export function translateTime(s: string): string {
    if (locale.current === "fr") return s;

    if (s === "< 1 seconde") return t("time.lessThanSecond");

    const sci = s.match(/^~(\d+) × 10\^(-?\d+) ans$/);
    if (sci) return `~${sci[1]} × 10^${sci[2]} ${t("time.years")}`;

    const m = s.match(/^(\d+) (seconde|minute|heure|jour|an)(s?)$/);
    if (m) {
        const n = m[1];
        const unit = m[2];
        const plural = m[3] === "s";
        const key =
            unit === "seconde" ? (plural ? "time.seconds" : "time.second") :
            unit === "minute" ? (plural ? "time.minutes" : "time.minute") :
            unit === "heure" ? (plural ? "time.hours" : "time.hour") :
            unit === "jour" ? (plural ? "time.days" : "time.day") :
            (plural ? "time.years" : "time.year");
        return `${n} ${t(key)}`;
    }

    return s;
}

const WARNING_EXACT: Record<string, string> = {
    "Trop court — minimum recommandé : 12 caractères": "warning.tooShort",
    "Longueur faible — recommandé : ≥ 12 caractères": "warning.lowLength",
    "Séquence ascendante détectée (ex : abcd, 1234)": "warning.ascending",
    "Séquence descendante détectée (ex : dcba, 9876)": "warning.descending",
    "Contient une année (ex : 1990, 2024)": "warning.year",
    "Un seul type de caractère — diversifiez votre mot de passe": "warning.singleClass",
};

export function translateWarning(s: string): string {
    if (locale.current === "fr") return s;

    const exact = WARNING_EXACT[s];
    if (exact) return t(exact);

    const repChars = s.match(/^Répétition de caractères \((\d+) consécutifs identiques\)$/);
    if (repChars) return t("warning.repeatedChars", {n: repChars[1]});

    const repBlock = s.match(/^Motif répété détecté \(bloc de (\d+) car\. répété\)$/);
    if (repBlock) return t("warning.repeatedBlock", {n: repBlock[1]});

    return s;
}
