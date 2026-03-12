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
const viewPassword = document.querySelector<HTMLElement>("#view-password");
const viewToken = document.querySelector<HTMLElement>("#view-token");

const NAV_PASS_ACTIVE = "flex items-center gap-3 px-3 py-3 rounded-xl bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold transition-all group overflow-hidden whitespace-nowrap";
const NAV_TOKEN_ACTIVE = "flex items-center gap-3 px-3 py-3 rounded-xl bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 font-bold transition-all group overflow-hidden whitespace-nowrap";
const NAV_INACTIVE = "flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200 transition-all group overflow-hidden whitespace-nowrap";

function showView(view: "password" | "token") {
    if (view === "password") {
        viewPassword?.classList.remove("hidden");
        viewToken?.classList.add("hidden");
        if (navPasswords) navPasswords.className = NAV_PASS_ACTIVE;
        if (navTokens) navTokens.className = NAV_INACTIVE;
    } else {
        viewPassword?.classList.add("hidden");
        viewToken?.classList.remove("hidden");
        if (navPasswords) navPasswords.className = NAV_INACTIVE;
        if (navTokens) navTokens.className = NAV_TOKEN_ACTIVE;
    }
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

// --- Init ---
generatePassword();
