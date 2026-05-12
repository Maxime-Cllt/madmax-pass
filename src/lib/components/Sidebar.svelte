<script lang="ts">
    import type {View} from "../types";
    import {t} from "../i18n.svelte";
    import Icon from "./Icon.svelte";
    import ThemeToggle from "./ThemeToggle.svelte";
    import LanguageSelector from "./LanguageSelector.svelte";

    interface Props {
        current: View;
        onSelect: (view: View) => void;
    }

    let {current, onSelect}: Props = $props();
    let collapsed = $state(false);

    type NavEntry = {
        view: View;
        labelKey: string;
        icon: "key" | "token" | "shield";
        activeCls: string;
    };

    const NAV: NavEntry[] = [
        {
            view: "password",
            labelKey: "nav.passwords",
            icon: "key",
            activeCls: "bg-cyan-500/5 dark:bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400",
        },
        {
            view: "token",
            labelKey: "nav.tokens",
            icon: "token",
            activeCls: "bg-violet-500/5 dark:bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400",
        },
        {
            view: "analyze",
            labelKey: "nav.analyze",
            icon: "shield",
            activeCls: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        },
    ];

    const INACTIVE_CLS = "border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200";
</script>

<aside
    class="w-64 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 backdrop-blur-xl flex flex-col p-4 shrink-0 transition-all duration-300 relative group/sidebar shadow-xl dark:shadow-none"
    class:sidebar-collapsed={collapsed}
>
    <!-- Collapse Toggle -->
    <button
        onclick={() => (collapsed = !collapsed)}
        class="absolute -right-3 top-8 h-6 w-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center text-slate-400 hover:text-cyan-500 transition-all z-50"
        aria-label="Toggle sidebar"
    >
        <Icon name="chevron-left" size={14} strokeWidth={2.5} class="toggle-icon transition-transform duration-300"/>
    </button>

    <!-- Logo & Theme Toggle -->
    <div class="flex items-center justify-between mb-10 px-2">
        <div class="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-bold">
                MP
            </div>
            <div class="sidebar-text transition-opacity duration-300">
                <p class="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 leading-none mb-1 font-bold">Madmax</p>
                <p class="text-sm font-bold leading-none">Pass</p>
            </div>
        </div>
        <ThemeToggle/>
    </div>

    <!-- Navigation -->
    <nav class="space-y-2 flex-1 overflow-hidden">
        {#each NAV as entry}
            {@const active = current === entry.view}
            <button
                type="button"
                onclick={() => onSelect(entry.view)}
                class="w-full flex items-center gap-3 px-3 py-3 rounded-xl border font-bold transition-all group overflow-hidden whitespace-nowrap text-left {active ? entry.activeCls : INACTIVE_CLS}"
            >
                <div class="shrink-0">
                    <Icon name={entry.icon} class="group-hover:scale-110 transition-transform"/>
                </div>
                <span class="sidebar-text transition-opacity duration-300 font-bold">{t(entry.labelKey)}</span>
            </button>
        {/each}
    </nav>

    <LanguageSelector/>
</aside>
