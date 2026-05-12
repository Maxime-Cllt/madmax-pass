<script lang="ts">
    interface Props {
        message: string;
        isError?: boolean;
    }

    let {message, isError = false}: Props = $props();
</script>

<p
    class="text-center text-[10px] font-bold min-h-[1rem] {isError
        ? 'text-rose-500'
        : 'text-cyan-600 dark:text-cyan-400'}"
>
    {message}
</p>
