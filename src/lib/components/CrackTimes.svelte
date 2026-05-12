<script lang="ts">
    import type {CrackEstimate} from "../types";
    import {t, translateTime} from "../i18n.svelte";

    interface Props {
        estimate: CrackEstimate | null;
    }

    let {estimate}: Props = $props();

    const LABELS = ["crack.fast", "crack.slow", "crack.quantum"] as const;

    const EMPTY_CLS = "text-[11px] font-mono font-bold text-slate-300 dark:text-slate-700 transition-colors duration-300";
    const ACTIVE_CLS = "text-[11px] font-mono font-bold transition-colors duration-300";

    function timeFor(idx: number): {text: string; color: string | null} {
        const s = estimate?.scenarios[idx];
        if (!s) return {text: "—", color: null};
        return {text: translateTime(s.time), color: s.color};
    }
</script>

<div class="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
    <p class="text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold px-1">
        {t("crack.title")}
    </p>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        {#each LABELS as labelKey, i}
            {@const slot = timeFor(i)}
            <div class="flex items-center justify-between md:flex-col md:items-start p-2 rounded-xl bg-slate-50/50 dark:bg-white/5">
                <span class="text-[9px] text-slate-400 dark:text-slate-500">{t(labelKey)}</span>
                <span class={slot.color ? `${ACTIVE_CLS} ${slot.color}` : EMPTY_CLS}>
                    {slot.text}
                </span>
            </div>
        {/each}
    </div>
</div>
