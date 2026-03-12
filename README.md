<div align="center">
  <img src="/src-tauri/icons/icon.png" width="120" height="120" alt="Madmax Pass" />
  <h1>Madmax Pass</h1>
  <p>Interface moderne de génération de mots de passe ultra sécurisés.</p>

  <p>
    <img src="https://img.shields.io/badge/Rust-dea584?style=for-the-badge&logo=rust&logoColor=white" alt="Rust" />
    <img src="https://img.shields.io/badge/Tauri-ffc130?style=for-the-badge&logo=tauri&logoColor=white" alt="Tauri" />
    <img src="https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white" alt="SvelteKit" />
    <img src="https://img.shields.io/badge/Bun-F2F2F2?style=for-the-badge&logo=bun&logoColor=black" alt="Bun" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  </p>
</div>

---

Madmax Pass est une application Tauri qui génère des mots de passe ultra-sécurisés en local, avec une génération
effectuée en Rust pour la vitesse et la sécurité. L'interface est un tableau de bord simple avec une barre latérale et
un panneau de génération de mots de passe minimaliste.

## Fonctionnalités

| Feature | Description                                               |
|---------|-----------------------------------------------------------|
| 🔒      | Génération locale uniquement (aucun appel réseau)         |
| ⚡       | Randomité cryptographiquement sécurisée (`OsRng` de Rust) |
| 📏      | Contraintes de longueur : minimum 16, maximum 4096        |
| 📋      | Interface simple avec copie vers le presse-papiers        |

## Stack Technique

```mermaid
flowchart TB
    subgraph Frontend["Frontend"]
        direction LR
        Svelte["SvelteKit"]
        TS["TypeScript"]
        Tailwind["Tailwind CSS"]
    end
    
    subgraph Backend["Backend - Tauri v2"]
        direction LR
        Rust["Rust<br/>Générateur de mots de passe"]
    end
    
    Frontend -->|"IPC / Commands"| Backend
```

- **Frontend** : SvelteKit + TypeScript + Tailwind CSS v4
- **Backend** : Tauri v2 + Rust (génération de mots de passe)

## Prérequis

- [Bun](https://bun.sh/)
- [Rust toolchain](https://rustup.rs/) (stable)
- [Prérequis Tauri](https://tauri.app/start/prerequisites/) pour votre OS

## Installation & Utilisation

### Installation des dépendances

```bash
bun install
```

### Mode Développement

**UI Web uniquement :**
```bash
bun dev
```

**Application Tauri complète :**
```bash
bun tauri dev
```

### Build Release

```bash
bun tauri build
```

## Tests

**Tests unitaires Rust :**
```bash
cd src-tauri
cargo test
```

## Génération de Mots de Passe

- Implémenté en Rust dans `src-tauri/src/password.rs`
- Force les limites min/max (16–4096)
- Garantit au moins une minuscule, une majuscule, un chiffre et un symbole

## Structure du Projet

```
madmax-pass/
├── src/                      # Frontend Svelte
│   ├── main.ts              # Logique frontend
│   └── styles.css           # Styles Tailwind
├── src-tauri/               # Backend Rust
│   ├── src/
│   │   ├── lib.rs           # Configuration Tauri
│   │   └── password.rs      # Générateur de mots de passe
│   └── icons/               # Icônes de l'application
└── index.html               # Layout UI
```

---

<div align="center">
  <em>Générez des mots de passe sécurisés en toute simplicité.</em>
</div>
