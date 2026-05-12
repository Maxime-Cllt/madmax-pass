import {mount} from "svelte";
import App from "./App.svelte";
import {applyInitialTheme} from "./lib/theme.svelte";
import {locale} from "./lib/i18n.svelte";

// Self-hosted fonts (latin .woff2 only — Tauri webviews don't need .woff)
import "./lib/fonts.css";

applyInitialTheme();
document.documentElement.setAttribute("lang", locale.current);

const target = document.getElementById("app");
if (!target) throw new Error("#app mount point not found");

export default mount(App, {target});
