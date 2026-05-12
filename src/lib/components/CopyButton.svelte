<script lang="ts">
    import Icon from "./Icon.svelte";

    interface Props {
        value: string;
        title: string;
        accent: "cyan" | "violet" | "emerald";
        onCopied?: () => void;
        onError?: () => void;
    }

    let {value, title, accent, onCopied, onError}: Props = $props();
    let copied = $state(false);
    let timer: number | undefined;

    const ACCENT_CLASSES: Record<Props["accent"], string> = {
        cyan: "hover:border-cyan-500/30 hover:text-cyan-600 dark:hover:text-white",
        violet: "hover:border-violet-500/30 hover:text-violet-600 dark:hover:text-white",
        emerald: "hover:border-emerald-500/30 hover:text-emerald-600 dark:hover:text-white",
    };

    async function copy() {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            flash();
            onCopied?.();
        } catch {
            onError?.();
        }
    }

    export function flash() {
        copied = true;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => (copied = false), 2000);
    }
</script>

<button
    type="button"
    {title}
    onclick={copy}
    class="shrink-0 w-[50px] md:w-[60px] flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 dark:text-slate-300 transition-all active:scale-95 group/copy {ACCENT_CLASSES[accent]}"
>
    {#if copied}
        <Icon name="check" class="text-emerald-500"/>
    {:else}
        <Icon name="copy" class="group-hover/copy:scale-110 transition-transform"/>
    {/if}
</button>
