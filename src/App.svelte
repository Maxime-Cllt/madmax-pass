<script lang="ts">
    import type {View} from "./lib/types";
    import Sidebar from "./lib/components/Sidebar.svelte";
    import PasswordView from "./lib/components/PasswordView.svelte";
    import TokenView from "./lib/components/TokenView.svelte";
    import AnalyzeView from "./lib/components/AnalyzeView.svelte";

    let view = $state<View>("password");
</script>

<Sidebar current={view} onSelect={(v) => (view = v)}/>

<main class="flex-1 flex flex-col items-center overflow-y-auto bg-slate-100/30 dark:bg-slate-950/20 transition-colors duration-300">
    {#if view === "password"}
        <PasswordView/>
    {:else if view === "token"}
        <TokenView/>
    {:else if view === "analyze"}
        <AnalyzeView/>
    {/if}
</main>
