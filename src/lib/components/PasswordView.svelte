<script lang="ts">
    import {invoke} from "@tauri-apps/api/core";
    import {t} from "../i18n.svelte";
    import type {GenerateResult, CrackEstimate} from "../types";
    import CopyButton from "./CopyButton.svelte";
    import GenerateButton from "./GenerateButton.svelte";
    import CrackTimes from "./CrackTimes.svelte";
    import StatusMessage from "./StatusMessage.svelte";
    import Icon from "./Icon.svelte";

    // ≥ 128 quantum bits with full pool (89 chars): ceil(256 / log2(89)) = 40
    const QUANTUM_SAFE_MIN = 40;
    const STATUS_TIMEOUT_MS = 3000;

    type CharOption = {key: "upper" | "lower" | "digits" | "symbols"; labelKey: string};

    const OPTIONS: CharOption[] = [
        {key: "upper", labelKey: "password.upper"},
        {key: "lower", labelKey: "password.lower"},
        {key: "digits", labelKey: "password.digits"},
        {key: "symbols", labelKey: "password.symbols"},
    ];

    let length = $state(32);
    let upper = $state(true);
    let lower = $state(true);
    let digits = $state(true);
    let symbols = $state(false);
    let quantumSafe = $state(false);
    let copyBtn = $state<CopyButton | undefined>(undefined);

    let password = $state("");
    let estimate = $state<CrackEstimate | null>(null);
    let status = $state({message: "", isError: false});
    let statusTimer: number | undefined;

    function setStatus(message: string, isError = false) {
        status = {message, isError};
        window.clearTimeout(statusTimer);
        if (!isError && message) {
            statusTimer = window.setTimeout(() => {
                status = {message: "", isError: false};
            }, STATUS_TIMEOUT_MS);
        }
    }

    function toggle(option: CharOption["key"]) {
        if (option === "upper") upper = !upper;
        else if (option === "lower") lower = !lower;
        else if (option === "digits") digits = !digits;
        else symbols = !symbols;
    }

    function getOption(key: CharOption["key"]): boolean {
        return key === "upper" ? upper : key === "lower" ? lower : key === "digits" ? digits : symbols;
    }

    $effect(() => {
        if (quantumSafe) {
            upper = true;
            lower = true;
            digits = true;
            symbols = true;
            if (length < QUANTUM_SAFE_MIN) length = QUANTUM_SAFE_MIN;
        }
    });

    async function generate() {
        try {
            const result = await invoke<GenerateResult>("generate_password", {
                length, upper, lower, digits, symbols,
            });
            password = result.value;
            estimate = result.estimate;
            try {
                await navigator.clipboard.writeText(result.value);
                copyBtn?.flash();
                setStatus(t("status.passwordGeneratedCopied"));
            } catch {
                setStatus(t("status.passwordGenerated"));
            }
        } catch (error) {
            setStatus(String(error), true);
        }
    }

    $effect(() => {
        generate();
    });
</script>

<div class="w-full max-w-2xl px-4 py-8 my-auto">
    <div class="text-center mb-6">
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("password.title")}
        </h1>
        <p class="mt-1 text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">
            {t("password.subtitle")}
        </p>
    </div>

    <div class="relative group">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20 dark:opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <section class="relative bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-8 shadow-2xl transition-colors duration-300">
            <form class="space-y-6" onsubmit={(e) => { e.preventDefault(); generate(); }}>

                <div class="space-y-3">
                    <p class="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                        {t("password.outputLabel")}
                    </p>
                    <div class="flex gap-3">
                        <div class="relative flex-1 min-w-0">
                            <input
                                type="text"
                                readonly
                                value={password}
                                placeholder="••••••••••••••••"
                                class="font-mono-output w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 md:py-4 text-lg md:text-xl text-cyan-600 dark:text-cyan-400 placeholder:text-slate-300 dark:placeholder:text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                            />
                        </div>
                        <CopyButton
                            bind:this={copyBtn}
                            value={password}
                            title={t("password.copyTitle")}
                            accent="cyan"
                            onCopied={() => setStatus(t("status.copied"))}
                            onError={() => setStatus(t("status.copyError"), true)}
                        />
                    </div>

                    <div class="pt-1">
                        <GenerateButton label={t("password.generate")} gradient="cyan-blue" type="submit"/>
                    </div>
                </div>

                <!-- Options -->
                <div class="space-y-6 pt-2 border-t border-slate-100 dark:border-white/5">
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <label for="password-length" class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                                {t("password.length")} :
                                <span class="text-cyan-600 dark:text-cyan-400 font-mono text-sm ml-2">{length}</span>
                            </label>
                        </div>
                        <div class="px-1">
                            <input
                                id="password-length"
                                type="range"
                                min={quantumSafe ? QUANTUM_SAFE_MIN : 4}
                                max="128"
                                bind:value={length}
                                class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3 md:gap-4">
                        {#each OPTIONS as opt}
                            <label class="flex items-center justify-between p-3 md:p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer group">
                                <span class="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                                    {t(opt.labelKey)}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={getOption(opt.key)}
                                    disabled={quantumSafe}
                                    onchange={() => toggle(opt.key)}
                                    class="h-4 w-4 md:h-5 md:w-5 rounded-lg border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-cyan-500 focus:ring-cyan-500/50"
                                />
                            </label>
                        {/each}
                    </div>

                    <!-- Quantum Safe -->
                    <label
                        class="flex items-center justify-between p-3 md:p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-cyan-500/20 transition-all cursor-pointer group"
                        class:quantum-safe-active={quantumSafe}
                    >
                        <div class="flex items-start gap-3">
                            <Icon name="atom" size={18} class="text-slate-400 dark:text-slate-500 group-hover:text-cyan-500 transition-colors shrink-0 mt-0.5"/>
                            <div>
                                <span class="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                                    {t("password.quantumSafe")}
                                </span>
                                <p class="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                                    {t("password.quantumSafeDesc")}
                                </p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            bind:checked={quantumSafe}
                            class="h-4 w-4 md:h-5 md:w-5 rounded-lg border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-cyan-500 focus:ring-cyan-500/50"
                        />
                    </label>
                </div>

                <CrackTimes {estimate}/>

                <StatusMessage message={status.message} isError={status.isError}/>
            </form>
        </section>
    </div>
</div>
