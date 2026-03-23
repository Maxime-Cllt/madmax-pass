import {invoke} from "@tauri-apps/api/core";

// --- Theme Management ---
function initTheme() {
    const theme = localStorage.getItem("theme") || "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");

    const themeBtn = document.querySelector("#theme-toggle");
    themeBtn?.addEventListener("click", () => {
        const isDark = document.documentElement.classList.toggle("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
}

initTheme();

// --- DOM refs: shared ---
const sidebar = document.querySelector<HTMLElement>("#sidebar");
const sidebarToggle = document.querySelector<HTMLButtonElement>("#sidebar-toggle");

// --- DOM refs: password view ---
const form = document.querySelector<HTMLFormElement>("#password-form");
const lengthInput = document.querySelector<HTMLInputElement>("#length-input");
const lengthDisplay = document.querySelector<HTMLElement>("#length-display");
const outputInput = document.querySelector<HTMLInputElement>("#password-output");
const statusMsg = document.querySelector<HTMLElement>("#status-msg");
const copyBtn = document.querySelector<HTMLButtonElement>("#copy-btn");

const upperCheckbox = document.querySelector<HTMLInputElement>("#include-upper");
const lowerCheckbox = document.querySelector<HTMLInputElement>("#include-lower");
const digitsCheckbox = document.querySelector<HTMLInputElement>("#include-digits");
const symbolsCheckbox = document.querySelector<HTMLInputElement>("#include-symbols");

const crackFastEl = document.querySelector<HTMLElement>("#crack-fast");
const crackSlowEl = document.querySelector<HTMLElement>("#crack-slow");
const crackQuantumEl = document.querySelector<HTMLElement>("#crack-quantum");

const quantumSafeCheckbox = document.querySelector<HTMLInputElement>("#quantum-safe");
const quantumSafeLabel = document.querySelector<HTMLElement>("#quantum-safe-label");

// --- DOM refs: analyze view ---
const analyzeInput = document.querySelector<HTMLInputElement>("#analyze-input");
const analyzeVisibilityBtn = document.querySelector<HTMLButtonElement>("#analyze-visibility-btn");
const analyzeEyeIcon = document.querySelector<HTMLElement>("#analyze-eye-icon");
const analyzeEyeOffIcon = document.querySelector<HTMLElement>("#analyze-eye-off-icon");
const analyzeResults = document.querySelector<HTMLElement>("#analyze-results");
const analyzeEmpty = document.querySelector<HTMLElement>("#analyze-empty");
const analyzeStrengthBar = document.querySelector<HTMLElement>("#analyze-strength-bar");
const analyzeStrengthLabel = document.querySelector<HTMLElement>("#analyze-strength-label");
const analyzeLengthEl = document.querySelector<HTMLElement>("#analyze-length");
const analyzePoolEl = document.querySelector<HTMLElement>("#analyze-pool");
const analyzeClassicalBitsEl = document.querySelector<HTMLElement>("#analyze-classical-bits");
const analyzeQuantumBitsEl = document.querySelector<HTMLElement>("#analyze-quantum-bits");
const analyzeEntropyPerCharEl = document.querySelector<HTMLElement>("#analyze-entropy-per-char");
const analyzeScoreEl = document.querySelector<HTMLElement>("#analyze-score");
const analyzeWarningsList = document.querySelector<HTMLElement>("#analyze-warnings-list");
const analyzeCrackFastEl = document.querySelector<HTMLElement>("#analyze-crack-fast");
const analyzeCrackSlowEl = document.querySelector<HTMLElement>("#analyze-crack-slow");
const analyzeCrackQuantumEl = document.querySelector<HTMLElement>("#analyze-crack-quantum");

// --- DOM refs: token view ---
const tokenOutput = document.querySelector<HTMLInputElement>("#token-output");
const tokenCopyBtn = document.querySelector<HTMLButtonElement>("#token-copy-btn");
const tokenStatusMsg = document.querySelector<HTMLElement>("#token-status-msg");
const tokenGenerateBtn = document.querySelector<HTMLButtonElement>("#token-generate-btn");

const tokenCrackFastEl = document.querySelector<HTMLElement>("#token-crack-fast");
const tokenCrackSlowEl = document.querySelector<HTMLElement>("#token-crack-slow");
const tokenCrackQuantumEl = document.querySelector<HTMLElement>("#token-crack-quantum");

const tokenSizeBtns = document.querySelectorAll<HTMLButtonElement>(".token-size-btn");
const tokenFormatBtns = document.querySelectorAll<HTMLButtonElement>(".token-format-btn");

// --- Token state ---
let tokenBytes = 16;
let tokenFormat = "hex";

// Minimum pour ≥ 128 bits quantiques avec pool complet (89 chars) :
// ceil(256 / log2(89)) = 40
const QUANTUM_SAFE_MIN = 40;

// --- Types Rust ---
interface AnalyzeResult {
    length: number;
    pool_size: number;
    has_upper: boolean;
    has_lower: boolean;
    has_digits: boolean;
    has_symbols: boolean;
    entropy_per_char: number;
    score: number;
    warnings: string[];
    estimate: CrackEstimate;
}

interface Scenario {
    label: string;
    hint: string;
    time: string;
    color: string;
}

interface CrackEstimate {
    classical_bits: number;
    quantum_bits: number;
    quantum_safe: boolean;
    scenarios: Scenario[];
}

interface GenerateResult {
    value: string;
    estimate: CrackEstimate;
}

// --- Navigation ---
const navPasswords = document.querySelector<HTMLAnchorElement>("#nav-passwords");
const navTokens = document.querySelector<HTMLAnchorElement>("#nav-tokens");
const navAnalyze = document.querySelector<HTMLAnchorElement>("#nav-analyze");
const viewPassword = document.querySelector<HTMLElement>("#view-password");
const viewToken = document.querySelector<HTMLElement>("#view-token");
const viewAnalyze = document.querySelector<HTMLElement>("#view-analyze");

const NAV_PASS_ACTIVE = "flex items-center gap-3 px-3 py-3 rounded-xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold transition-all group overflow-hidden whitespace-nowrap";
const NAV_TOKEN_ACTIVE = "flex items-center gap-3 px-3 py-3 rounded-xl bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 font-bold transition-all group overflow-hidden whitespace-nowrap";
const NAV_ANALYZE_ACTIVE = "flex items-center gap-3 px-3 py-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold transition-all group overflow-hidden whitespace-nowrap";
const NAV_INACTIVE = "flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200 transition-all group overflow-hidden whitespace-nowrap";

function showView(view: "password" | "token" | "analyze") {
    viewPassword?.classList.toggle("hidden", view !== "password");
    viewToken?.classList.toggle("hidden", view !== "token");
    viewAnalyze?.classList.toggle("hidden", view !== "analyze");
    if (navPasswords) navPasswords.className = view === "password" ? NAV_PASS_ACTIVE : NAV_INACTIVE;
    if (navTokens) navTokens.className = view === "token" ? NAV_TOKEN_ACTIVE : NAV_INACTIVE;
    if (navAnalyze) navAnalyze.className = view === "analyze" ? NAV_ANALYZE_ACTIVE : NAV_INACTIVE;
}

navPasswords?.addEventListener("click", (e) => {
    e.preventDefault();
    showView("password");
});
navTokens?.addEventListener("click", (e) => {
    e.preventDefault();
    showView("token");
    generateToken();
});
navAnalyze?.addEventListener("click", (e) => {
    e.preventDefault();
    showView("analyze");
});

// --- Affichage des estimations (données calculées en Rust) ---
function displayEstimate(
    estimate: CrackEstimate,
    fastEl: HTMLElement | null,
    slowEl: HTMLElement | null,
    quantumEl: HTMLElement | null
) {
    const base = "text-[11px] font-mono font-bold transition-colors duration-300";
    const empty = `${base} text-slate-300 dark:text-slate-700`;

    const [fast, slow, quantum] = estimate.scenarios;

    if (fastEl) {
        fastEl.textContent = fast?.time ?? "—";
        fastEl.className = fast ? `${base} ${fast.color}` : empty;
    }
    if (slowEl) {
        slowEl.textContent = slow?.time ?? "—";
        slowEl.className = slow ? `${base} ${slow.color}` : empty;
    }
    if (quantumEl) {
        quantumEl.textContent = quantum?.time ?? "—";
        quantumEl.className = quantum ? `${base} ${quantum.color}` : empty;
    }
}

// --- Quantum Safe mode ---
function applyQuantumSafe(enabled: boolean) {
    const charCheckboxes = [upperCheckbox, lowerCheckbox, digitsCheckbox, symbolsCheckbox];
    if (enabled) {
        charCheckboxes.forEach(cb => {
            if (cb) {
                cb.checked = true;
                cb.disabled = true;
            }
        });
        if (lengthInput) {
            lengthInput.min = String(QUANTUM_SAFE_MIN);
            if (parseInt(lengthInput.value) < QUANTUM_SAFE_MIN) {
                lengthInput.value = String(QUANTUM_SAFE_MIN);
                if (lengthDisplay) lengthDisplay.textContent = String(QUANTUM_SAFE_MIN);
            }
        }
        quantumSafeLabel?.classList.add("quantum-safe-active");
    } else {
        charCheckboxes.forEach(cb => {
            if (cb) cb.disabled = false;
        });
        if (lengthInput) lengthInput.min = "4";
        quantumSafeLabel?.classList.remove("quantum-safe-active");
    }
}

// --- Status helpers ---
function setStatus(element: HTMLElement | null, message: string, isError = false) {
    if (!element) return;
    element.textContent = message;
    element.className = isError
        ? "text-center text-xs font-bold min-h-[1rem] text-rose-500"
        : "text-center text-xs font-bold min-h-[1rem] text-cyan-600 dark:text-cyan-400";

    if (!isError) {
        setTimeout(() => {
            if (element.textContent === message) element.textContent = "";
        }, 3000);
    }
}

// --- Event listeners: sidebar ---
sidebarToggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("collapsed");
});

// --- Event listeners: password view ---
quantumSafeCheckbox?.addEventListener("change", () => {
    applyQuantumSafe(quantumSafeCheckbox.checked);
    generatePassword();
});

lengthInput?.addEventListener("input", (e) => {
    if (lengthDisplay) lengthDisplay.textContent = (e.target as HTMLInputElement).value;
});

// --- Password generation ---
async function generatePassword() {
    const length = Number.parseInt(lengthInput?.value ?? "32", 10);
    const upper = upperCheckbox?.checked ?? true;
    const lower = lowerCheckbox?.checked ?? true;
    const digits = digitsCheckbox?.checked ?? true;
    const symbols = symbolsCheckbox?.checked ?? true;

    try {
        const result = await invoke<GenerateResult>("generate_password", {
            length, upper, lower, digits, symbols
        });
        if (outputInput) outputInput.value = result.value;
        displayEstimate(result.estimate, crackFastEl, crackSlowEl, crackQuantumEl);
        setStatus(statusMsg, "Nouveau mot de passe généré");
    } catch (error) {
        setStatus(statusMsg, String(error), true);
    }
}

form?.addEventListener("submit", (e) => {
    e.preventDefault();
    generatePassword();
});

copyBtn?.addEventListener("click", async () => {
    const value = outputInput?.value ?? "";
    if (!value) return;
    try {
        await navigator.clipboard.writeText(value);
        setStatus(statusMsg, "Copié !");
        const original = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(() => {
            copyBtn.innerHTML = original;
        }, 2000);
    } catch {
        setStatus(statusMsg, "Erreur de copie", true);
    }
});

// --- Token: size button handlers ---
const TOKEN_SIZE_ACTIVE = "token-size-btn flex flex-col items-center py-3 rounded-2xl bg-violet-500/10 dark:bg-violet-500/10 border border-violet-500/30 text-violet-600 dark:text-violet-400 font-bold transition-all text-sm";
const TOKEN_SIZE_INACTIVE = "token-size-btn flex flex-col items-center py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-violet-500/20 font-bold transition-all text-sm";

tokenSizeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        tokenBytes = parseInt(btn.dataset.bytes ?? "16", 10);
        tokenSizeBtns.forEach(b => {
            b.className = b === btn ? TOKEN_SIZE_ACTIVE : TOKEN_SIZE_INACTIVE;
        });
        generateToken();
    });
});

// --- Token: format button handlers ---
const TOKEN_FORMAT_ACTIVE = "token-format-btn py-3 rounded-2xl bg-violet-500/10 dark:bg-violet-500/10 border border-violet-500/30 text-violet-600 dark:text-violet-400 font-bold transition-all text-xs";
const TOKEN_FORMAT_INACTIVE = "token-format-btn py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-violet-500/20 font-bold transition-all text-xs";

tokenFormatBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        tokenFormat = btn.dataset.format ?? "hex";
        tokenFormatBtns.forEach(b => {
            b.className = b === btn ? TOKEN_FORMAT_ACTIVE : TOKEN_FORMAT_INACTIVE;
        });
        generateToken();
    });
});

// --- Token generation ---
async function generateToken() {
    try {
        const result = await invoke<GenerateResult>("generate_token", {
            bytes: tokenBytes,
            format: tokenFormat,
        });
        if (tokenOutput) tokenOutput.value = result.value;
        displayEstimate(result.estimate, tokenCrackFastEl, tokenCrackSlowEl, tokenCrackQuantumEl);
        setStatus(tokenStatusMsg, "Nouveau token généré");
    } catch (error) {
        setStatus(tokenStatusMsg, String(error), true);
    }
}

tokenGenerateBtn?.addEventListener("click", generateToken);

tokenCopyBtn?.addEventListener("click", async () => {
    const value = tokenOutput?.value ?? "";
    if (!value) return;
    try {
        await navigator.clipboard.writeText(value);
        setStatus(tokenStatusMsg, "Copié !");
        const original = tokenCopyBtn.innerHTML;
        tokenCopyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(() => {
            tokenCopyBtn.innerHTML = original;
        }, 2000);
    } catch {
        setStatus(tokenStatusMsg, "Erreur de copie", true);
    }
});

// --- Analyze: visibility toggle ---
analyzeVisibilityBtn?.addEventListener("click", () => {
    const isPassword = analyzeInput?.type === "password";
    if (analyzeInput) analyzeInput.type = isPassword ? "text" : "password";
    analyzeEyeIcon?.classList.toggle("hidden", isPassword);
    analyzeEyeOffIcon?.classList.toggle("hidden", !isPassword);
});

// --- Analyze: composition badge update ---
function updateBadge(badgeEl: HTMLElement | null, iconEl: HTMLElement | null, present: boolean) {
    if (!badgeEl || !iconEl) return;
    if (present) {
        badgeEl.className = "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
        iconEl.textContent = "✓";
    } else {
        badgeEl.className = "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-600";
        iconEl.textContent = "✗";
    }
}

// --- Analyze: strength bar update ---
function updateStrength(bits: number) {
    const score = Math.min(bits / 128 * 100, 100);
    if (analyzeStrengthBar) {
        analyzeStrengthBar.style.width = `${score}%`;
    }

    let label: string;
    let barColor: string;
    let labelColor: string;

    if (bits < 40) {
        label = "Très faible";
        barColor = "bg-rose-500";
        labelColor = "text-rose-500";
    } else if (bits < 60) {
        label = "Faible";
        barColor = "bg-orange-500";
        labelColor = "text-orange-500";
    } else if (bits < 80) {
        label = "Moyen";
        barColor = "bg-yellow-500";
        labelColor = "text-yellow-500";
    } else if (bits < 100) {
        label = "Fort";
        barColor = "bg-emerald-500";
        labelColor = "text-emerald-500";
    } else {
        label = bits >= 128 ? "Quantique ✓" : "Très fort";
        barColor = "bg-cyan-400";
        labelColor = "text-cyan-400";
    }

    if (analyzeStrengthBar) analyzeStrengthBar.className = `h-full rounded-full transition-all duration-500 ${barColor}`;
    if (analyzeStrengthLabel) {
        analyzeStrengthLabel.textContent = label;
        analyzeStrengthLabel.className = `text-xs font-bold ${labelColor}`;
    }
}

// --- Password analysis ---
async function analyzePassword() {
    const password = analyzeInput?.value ?? "";

    if (!password) {
        analyzeResults?.classList.add("hidden");
        analyzeEmpty?.classList.remove("hidden");
        return;
    }

    try {
        const result = await invoke<AnalyzeResult>("analyze_password", {password});

        analyzeEmpty?.classList.add("hidden");
        analyzeResults?.classList.remove("hidden");

        // Stats
        if (analyzeLengthEl) analyzeLengthEl.textContent = String(result.length);
        if (analyzePoolEl) analyzePoolEl.textContent = String(result.pool_size);
        if (analyzeEntropyPerCharEl) analyzeEntropyPerCharEl.textContent = `${result.entropy_per_char.toFixed(2)} bits`;
        if (analyzeClassicalBitsEl) analyzeClassicalBitsEl.textContent = `${result.estimate.classical_bits} bits`;
        if (analyzeQuantumBitsEl) analyzeQuantumBitsEl.textContent = `${result.estimate.quantum_bits} bits`;

        // Score
        if (analyzeScoreEl) {
            analyzeScoreEl.textContent = `${result.score}/100`;
            const scoreColor =
                result.score < 30 ? "text-rose-500" :
                    result.score < 50 ? "text-orange-500" :
                        result.score < 70 ? "text-yellow-500" :
                            result.score < 90 ? "text-emerald-500" :
                                "text-cyan-400";
            analyzeScoreEl.className = `text-sm font-mono font-bold ${scoreColor}`;
        }

        updateStrength(result.estimate.classical_bits);

        updateBadge(document.querySelector("#badge-upper"), document.querySelector("#badge-upper-icon"), result.has_upper);
        updateBadge(document.querySelector("#badge-lower"), document.querySelector("#badge-lower-icon"), result.has_lower);
        updateBadge(document.querySelector("#badge-digits"), document.querySelector("#badge-digits-icon"), result.has_digits);
        updateBadge(document.querySelector("#badge-symbols"), document.querySelector("#badge-symbols-icon"), result.has_symbols);

        // Warnings
        if (analyzeWarningsList) {
            analyzeWarningsList.innerHTML = "";
            if (result.warnings.length === 0) {
                analyzeWarningsList.innerHTML = `
                    <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Aucun problème détecté
                    </div>`;
            } else {
                for (const w of result.warnings) {
                    const div = document.createElement("div");
                    div.className = "flex items-start gap-2 px-3 py-2 rounded-xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold";
                    div.innerHTML = `<svg class="shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg><span>${w}</span>`;
                    analyzeWarningsList.appendChild(div);
                }
            }
        }

        displayEstimate(result.estimate, analyzeCrackFastEl, analyzeCrackSlowEl, analyzeCrackQuantumEl);
    } catch (error) {
        console.error("Analyze error:", error);
    }
}

analyzeInput?.addEventListener("input", analyzePassword);

// --- Init ---
generatePassword();
