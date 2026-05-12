<script lang="ts">
    interface Props {
        name: "copy" | "check" | "refresh" | "key" | "token" | "shield" | "sun" | "moon" | "eye" | "eye-off" | "warning" | "globe" | "chevron-left" | "atom";
        size?: number;
        class?: string;
        strokeWidth?: number;
    }

    let {name, size = 20, class: cls = "", strokeWidth = 2}: Props = $props();
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    class={cls}
>
    {#if name === "copy"}
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    {:else if name === "check"}
        <polyline points="20 6 9 17 4 12"/>
    {:else if name === "refresh"}
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
    {:else if name === "key"}
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3-3.5 3.5z"/>
    {:else if name === "token"}
        <path d="M4 7V4h16v3"/>
        <path d="M9 20h6"/>
        <path d="M12 4v16"/>
    {:else if name === "shield"}
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    {:else if name === "sun"}
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2"/>
        <path d="M12 20v2"/>
        <path d="m4.93 4.93 1.41 1.41"/>
        <path d="m17.66 17.66 1.41 1.41"/>
        <path d="M2 12h2"/>
        <path d="M20 12h2"/>
        <path d="m6.34 17.66-1.41 1.41"/>
        <path d="m19.07 4.93-1.41 1.41"/>
    {:else if name === "moon"}
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    {:else if name === "eye"}
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
    {:else if name === "eye-off"}
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
        <line x1="2" x2="22" y1="2" y2="22"/>
    {:else if name === "warning"}
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <path d="M12 9v4"/>
        <path d="M12 17h.01"/>
    {:else if name === "globe"}
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    {:else if name === "chevron-left"}
        <path d="m15 18-6-6 6-6"/>
    {:else if name === "atom"}
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.5-6.5-1.5 1.5M7 17l-1.5 1.5m0-11L7 7m10 10-1.5-1.5"/>
    {/if}
</svg>
