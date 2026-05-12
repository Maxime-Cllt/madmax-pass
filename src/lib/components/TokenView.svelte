<script lang="ts">
    import {invoke} from "@tauri-apps/api/core";
    import {t} from "../i18n.svelte";
    import type {GenerateResult, CrackEstimate} from "../types";
    import CopyButton from "./CopyButton.svelte";
    import GenerateButton from "./GenerateButton.svelte";
    import CrackTimes from "./CrackTimes.svelte";
    import StatusMessage from "./StatusMessage.svelte";

    const STATUS_TIMEOUT_MS = 3000;

    type SizeOption = {bytes: number; bits: number; quantumSafe: boolean};
    const SIZES: SizeOption[] = [
        {bytes: 16, bits: 128, quantumSafe: false},
        {bytes: 32, bits: 256, quantumSafe: true},
        {bytes: 48, bits: 384, quantumSafe: true},
        {bytes: 64, bits: 512, quantumSafe: true},
    ];

    const FORMATS = ["hex", "base64url", "alphanumeric"] as const;
    type Format = (typeof FORMATS)[number];
    const FORMAT_LABEL: Record<Format, string> = {
        hex: "Hex",
        base64url: "Base64url",
        alphanumeric: "Alphanum",
    };

    let bytes = $state(16);
    let format = $state<Format>("hex");

    let token = $state("");
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

    async function generate() {
        try {
            const result = await invoke<GenerateResult>("generate_token", {bytes, format});
            token = result.value;
            estimate = result.estimate;
            setStatus(t("status.tokenGenerated"));
        } catch (error) {
            setStatus(String(error), true);
        }
    }

    $effect(() => {
        // re-generate whenever size or format changes
        bytes; format;
        generate();
    });

    const SIZE_ACTIVE = "bg-violet-500/10 dark:bg-violet-500/10 border-violet-500/30 text-violet-600 dark:text-violet-400";
    const SIZE_INACTIVE = "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-violet-500/20";
</script>

<div class="w-full max-w-2xl px-4 py-8 my-auto">
    <div class="text-center mb-6">
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("token.title")}
        </h1>
        <p class="mt-1 text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">
            {t("token.subtitle")}
        </p>
    </div>

    <div class="relative group">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-3xl blur opacity-20 dark:opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <section class="relative bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-5 md:p-8 shadow-2xl transition-colors duration-300">
            <div class="space-y-6">

                <div class="space-y-3">
                    <p class="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                        {t("token.outputLabel")}
                    </p>
                    <div class="flex gap-3">
                        <div class="relative flex-1 min-w-0">
                            <input
                                type="text"
                                readonly
                                value={token}
                                placeholder="••••••••••••••••••••••••••••••••"
                                class="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/5 rounded-2xl px-4 py-3 md:py-4 text-sm md:text-base font-mono text-violet-600 dark:text-violet-400 placeholder:text-slate-300 dark:placeholder:text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                            />
                        </div>
                        <CopyButton
                            value={token}
                            title={t("token.copyTitle")}
                            accent="violet"
                            onCopied={() => setStatus(t("status.copied"))}
                            onError={() => setStatus(t("status.copyError"), true)}
                        />
                    </div>

                    <div class="pt-1">
                        <GenerateButton label={t("token.generate")} gradient="violet-cyan" onclick={generate}/>
                    </div>
                </div>

                <div class="space-y-6 pt-2 border-t border-slate-100 dark:border-white/5">
                    <div class="space-y-3">
                        <p class="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                            {t("token.size")}
                        </p>
                        <div class="grid grid-cols-4 gap-2">
                            {#each SIZES as size}
                                <button
                                    type="button"
                                    onclick={() => (bytes = size.bytes)}
                                    class="flex flex-col items-center py-2 md:py-3 rounded-2xl border font-bold transition-all text-[10px] md:text-sm {bytes === size.bytes ? SIZE_ACTIVE : SIZE_INACTIVE}"
                                >
                                    {size.bytes}
                                    {#if size.quantumSafe}
                                        <span class="text-[8px] md:text-[10px] font-bold text-emerald-500 mt-0.5">QS ✓</span>
                                    {:else}
                                        <span class="text-[8px] md:text-[10px] font-normal opacity-70 mt-0.5">{size.bits} bits</span>
                                    {/if}
                                </button>
                            {/each}
                        </div>
                    </div>

                    <div class="space-y-3">
                        <p class="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                            {t("token.format")}
                        </p>
                        <div class="grid grid-cols-3 gap-2">
                            {#each FORMATS as f}
                                <button
                                    type="button"
                                    onclick={() => (format = f)}
                                    class="py-2 md:py-3 rounded-2xl border font-bold transition-all text-[10px] md:text-xs {format === f ? SIZE_ACTIVE : SIZE_INACTIVE}"
                                >
                                    {FORMAT_LABEL[f]}
                                </button>
                            {/each}
                        </div>
                    </div>
                </div>

                <CrackTimes {estimate}/>

                <StatusMessage message={status.message} isError={status.isError}/>
            </div>
        </section>
    </div>
</div>
