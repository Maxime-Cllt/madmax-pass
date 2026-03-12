import {invoke} from "@tauri-apps/api/core";

const form = document.querySelector<HTMLFormElement>("#password-form");
const lengthInput = document.querySelector<HTMLInputElement>("#length-input");
const lengthDisplay = document.querySelector<HTMLElement>("#length-display");
const outputInput = document.querySelector<HTMLInputElement>("#password-output");
const statusMsg = document.querySelector<HTMLElement>("#status-msg");
const copyBtn = document.querySelector<HTMLButtonElement>("#copy-btn");

function setStatus(message: string, isError = false) {
    if (!statusMsg) return;
    statusMsg.textContent = message;
    statusMsg.className = isError
        ? "text-center text-xs font-medium min-h-[1rem] text-rose-400"
        : "text-center text-xs font-medium min-h-[1rem] text-cyan-400";

    // Clear status after 3 seconds if it's not an error
    if (!isError) {
        setTimeout(() => {
            if (statusMsg.textContent === message) {
                statusMsg.textContent = "";
            }
        }, 3000);
    }
}

// Update length display
lengthInput?.addEventListener("input", (e) => {
    if (lengthDisplay) {
        lengthDisplay.textContent = (e.target as HTMLInputElement).value;
    }
});

async function generatePassword() {
    const rawLength = lengthInput?.value ?? "32";
    const length = Number.parseInt(rawLength, 10);

    if (!Number.isFinite(length)) {
        setStatus("Longueur invalide.", true);
        return;
    }

    try {
        const password = await invoke<string>("generate_password", {length});
        if (outputInput) {
            outputInput.value = password;
            outputInput.select();
        }
        setStatus("Nouveau mot de passe généré");
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatus(message, true);
  }
}

form?.addEventListener("submit", (event) => {
    event.preventDefault();
    generatePassword();
});

copyBtn?.addEventListener("click", async () => {
    const value = outputInput?.value ?? "";
    if (!value) {
        setStatus("Générez un mot de passe d'abord", true);
        return;
    }

    try {
        await navigator.clipboard.writeText(value);
        setStatus("Copié dans le presse-papiers !");

        // Visual feedback on button
        const originalContent = copyBtn.innerHTML;
        copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-400"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(() => {
            copyBtn.innerHTML = originalContent;
        }, 2000);

    } catch {
        setStatus("Erreur lors de la copie", true);
    }
});

// Initial generation
generatePassword();
