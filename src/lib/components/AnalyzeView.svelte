<script lang="ts">
    import {invoke} from "@tauri-apps/api/core";
    import {t, translateWarning} from "../i18n.svelte";
    import type {AnalyzeResult} from "../types";
    import CrackTimes from "./CrackTimes.svelte";
    import Icon from "./Icon.svelte";

    let password = $state("");
    let visible = $state(false);
    let result = $state<AnalyzeResult | null>(null);

    $effect(() => {
        if (!password) {
            result = null;
            return;
        }
        const pw = password;
        invoke<AnalyzeResult>("analyze_password", {password: pw})
            .then((r) => {
                // ignore stale results if user typed again
                if (pw === password) result = r;
            })
            .catch((e) => console.error("Analyze error:", e));
    });

    type StrengthLevel = {
        labelKey: string;
        barColor: string;
        labelColor: string;
    };

    function strengthFor(bits: number): StrengthLevel {
        if (bits < 40)  return {labelKey: "strength.veryWeak", barColor: "bg-rose-500",    labelColor: "text-rose-500"};
        if (bits < 60)  return {labelKey: "strength.weak",     barColor: "bg-orange-500",  labelColor: "text-orange-500"};
        if (bits < 80)  return {labelKey: "strength.medium",   barColor: "bg-yellow-500",  labelColor: "text-yellow-500"};
        if (bits < 100) return {labelKey: "strength.strong",   barColor: "bg-emerald-500", labelColor: "text-emerald-500"};
        if (bits < 128) return {labelKey: "strength.veryStrong", barColor: "bg-cyan-400",  labelColor: "text-cyan-400"};
        return {labelKey: "strength.quantum", barColor: "bg-cyan-400", labelColor: "text-cyan-400"};
    }

    function scoreColor(score: number): string {
        if (score < 30) return "text-rose-500";
        if (score < 50) return "text-orange-500";
        if (score < 70) return "text-yellow-500";
        if (score < 90) return "text-emerald-500";
        return "text-cyan-400";
    }

    const COMPOSITION: {flag: keyof AnalyzeResult; labelKey: string}[] = [
        {flag: "has_upper", labelKey: "password.upper"},
        {flag: "has_lower", labelKey: "password.lower"},
        {flag: "has_digits", labelKey: "password.digits"},
        {flag: "has_symbols", labelKey: "password.symbols"},
    ];

    const STATS = (r: AnalyzeResult) => [
        {labelKey: "analyze.length", value: String(r.length)},
        {labelKey: "analyze.pool", value: String(r.pool_size)},
        {labelKey: "analyze.entropyPerChar", value: `${r.entropy_per_char.toFixed(2)} bits`},
        {labelKey: "analyze.classicalBits", value: `${r.estimate.classical_bits} bits`},
        {labelKey: "analyze.quantumBits", value: `${r.estimate.quantum_bits} bits`},
        {labelKey: "analyze.score", value: `${r.score}/100`, valueClass: scoreColor(r.score)},
    ];

    const BADGE_ON = "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
    const BADGE_OFF = "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-400 dark:text-slate-600";
</script>

<div class="w-full max-w-2xl px-4 py-8 my-auto">
    <div class="text-center mb-6">
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("analyze.title")}
        </h1>
        <p class="mt-1 text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">
            {t("analyze.subtitle")}
        </p>
    </div>

    <div class="relative group">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl blur opacity-20 dark:opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <section class="relative bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-8 shadow-2xl transition-colors duration-300">
            <div class="space-y-6">

                <div class="space-y-3">
                    <p class="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                        {t("analyze.inputLabel")}
                    </p>
                    <div class="flex gap-3">
                        <div class="relative flex-1 min-w-0">
                            <input
                                type={visible ? "text" : "password"}
                                bind:value={password}
                                placeholder={t("analyze.placeholder")}
                                class="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 md:py-4 text-lg md:text-xl font-mono text-emerald-600 dark:text-emerald-400 placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                            />
                        </div>
                        <button
                            type="button"
                            title={t("analyze.visibilityTitle")}
                            onclick={() => (visible = !visible)}
                            class="shrink-0 w-[50px] md:w-[60px] flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-emerald-500/30 text-slate-400 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-white transition-all active:scale-95"
                        >
                            <Icon name={visible ? "eye-off" : "eye"}/>
                        </button>
                    </div>
                </div>

                {#if !result}
                    <div class="py-6 text-center">
                        <Icon name="shield" size={40} strokeWidth={1.5} class="mx-auto mb-3 text-slate-300 dark:text-slate-700"/>
                        <p class="text-[11px] text-slate-400 dark:text-slate-600 font-medium">
                            {t("analyze.emptyHint")}
                        </p>
                    </div>
                {:else}
                    {@const strength = strengthFor(result.estimate.classical_bits)}
                    {@const strengthPct = Math.min(result.estimate.classical_bits / 128 * 100, 100)}

                    <div class="space-y-5">

                        <!-- Strength gauge -->
                        <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                            <div class="flex items-center justify-between px-1">
                                <span class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                    {t("analyze.strength")}
                                </span>
                                <span class="text-xs font-bold {strength.labelColor}">{t(strength.labelKey)}</span>
                            </div>
                            <div class="h-2.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                                <div class="h-full rounded-full transition-all duration-500 {strength.barColor}" style="width: {strengthPct}%"></div>
                            </div>
                        </div>

                        <!-- Stats -->
                        <div class="grid grid-cols-3 gap-2">
                            {#each STATS(result) as stat}
                                <div class="flex flex-col items-center p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                                    <span class="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1">
                                        {t(stat.labelKey)}
                                    </span>
                                    <span class="text-sm font-mono font-bold {stat.valueClass ?? 'text-slate-700 dark:text-slate-200'}">
                                        {stat.value}
                                    </span>
                                </div>
                            {/each}
                        </div>

                        <!-- Composition -->
                        <div class="space-y-2">
                            <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
                                {t("analyze.composition")}
                            </p>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {#each COMPOSITION as comp}
                                    {@const present = result[comp.flag] as boolean}
                                    <div class="flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all {present ? BADGE_ON : BADGE_OFF}">
                                        <span class="text-base leading-none">{present ? "✓" : "✗"}</span>
                                        <span>{t(comp.labelKey)}</span>
                                    </div>
                                {/each}
                            </div>
                        </div>

                        <!-- Warnings -->
                        <div class="space-y-2">
                            <p class="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
                                {t("analyze.warnings")}
                            </p>
                            <div class="space-y-1.5">
                                {#if result.warnings.length === 0}
                                    <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                        <Icon name="check" size={14} strokeWidth={2.5}/>
                                        {t("analyze.noIssues")}
                                    </div>
                                {:else}
                                    {#each result.warnings as warning}
                                        <div class="flex items-start gap-2 px-3 py-2 rounded-xl bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
                                            <Icon name="warning" size={14} strokeWidth={2.5} class="shrink-0 mt-0.5"/>
                                            <span>{translateWarning(warning)}</span>
                                        </div>
                                    {/each}
                                {/if}
                            </div>
                        </div>

                        <CrackTimes estimate={result.estimate}/>
                    </div>
                {/if}
            </div>
        </section>
    </div>
</div>
