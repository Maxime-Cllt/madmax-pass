type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function initialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
}

export const theme = $state<{current: Theme}>({current: initialTheme()});

export function toggleTheme() {
    theme.current = theme.current === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, theme.current);
    document.documentElement.classList.toggle("dark", theme.current === "dark");
}

export function applyInitialTheme() {
    document.documentElement.classList.toggle("dark", theme.current === "dark");
}
