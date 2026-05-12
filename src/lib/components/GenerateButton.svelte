<script lang="ts">
    import Icon from "./Icon.svelte";

    interface Props {
        label: string;
        gradient: "cyan-blue" | "violet-cyan";
        type?: "button" | "submit";
        onclick?: () => void;
    }

    let {label, gradient, type = "button", onclick}: Props = $props();

    const GRADIENTS: Record<Props["gradient"], string> = {
        "cyan-blue":
            "from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-900/20",
        "violet-cyan":
            "from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 shadow-violet-900/20",
    };
</script>

<button
    {type}
    {onclick}
    class="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r {GRADIENTS[gradient]} text-white font-bold py-3 md:py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-[0.98] overflow-hidden"
>
    <span class="relative z-10 flex items-center gap-2 text-sm md:text-base">
        <Icon name="refresh" size={18} strokeWidth={2.5} class="group-hover:rotate-180 transition-transform duration-500"/>
        <span>{label}</span>
    </span>
    <div class="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
</button>
