<script lang="ts">
    import {theme, toggleTheme} from "../theme.svelte";
    import Icon from "./Icon.svelte";
</script>

<button
    onclick={toggleTheme}
    class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-500 hover:text-cyan-500 transition-colors shrink-0"
    aria-label="Toggle theme"
>
    {#if theme.current === "dark"}
        <Icon name="sun" size={18}/>
    {:else}
        <Icon name="moon" size={18}/>
    {/if}
</button>
