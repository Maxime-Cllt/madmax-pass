<script lang="ts">
    import {locale, setLocale, t, type Locale} from "../i18n.svelte";
    import Icon from "./Icon.svelte";

    const OPTIONS: Locale[] = ["fr", "en"];

    const BASE = "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors";
    const ACTIVE = "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400";
    const INACTIVE = "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200";
</script>

<div class="px-3 py-2 sidebar-text">
    <div class="flex items-center gap-2 mb-2 text-[9px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">
        <Icon name="globe" size={12}/>
        <span>{t("sidebar.lang")}</span>
    </div>
    <div class="flex gap-1">
        {#each OPTIONS as code}
            <button
                onclick={() => setLocale(code)}
                class="{BASE} {locale.current === code ? ACTIVE : INACTIVE}"
            >
                {code}
            </button>
        {/each}
    </div>
</div>
