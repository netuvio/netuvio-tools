# Netuvio Tools

Monorepo pomocných komponent a nástrojů ekosystému **Netuvio** pro React a Vue 3.

## Struktura monorepa

```text
netuvio-tools/
└── packages/
    ├── react/   # @netuvio/tools-react (React utility komponenty) -> publikováno na NPM
    └── vue/     # @netuvio/tools-vue   (Vue 3 utility komponenty)  -> publikováno na NPM
```

## Příkazy

```bash
# Instalace všech závislostí
pnpm install

# Sestavení všech balíčků
pnpm run build

# Typová kontrola TypeScriptu
pnpm run typecheck

# Vyčištění dist složek
pnpm run clean
```

## Jak publikovat na NPM

Pro publikování balíčků `@netuvio/tools-react` a `@netuvio/tools-vue` můžete využít dvě metody:

### 1. Lokální publikace z terminálu (CLI)

1. **Přihlášení do NPM**:
   Musíte mít účet s přístupem do organizace `@netuvio`:
   ```bash
   npm login
   ```
2. **Sestavení balíčků**:
   ```bash
   pnpm run build
   ```
3. **Publikování na NPM**:
   ```bash
   pnpm run publish:packages
   ```
   *(Pokud máte v gitu necommitnuté změny, přidejte příznak `--no-git-checks`: `pnpm --filter "@netuvio/tools-*" publish --access public --no-git-checks`)*

---

### 2. Automatická publikace přes GitHub Actions (CI/CD)

V repozitáři je nastaven workflow [`.github/workflows/publish.yml`](./.github/workflows/publish.yml).

1. **Nastavení NPM Tokenu v GitHubu**:
   - Na [npmjs.com](https://www.npmjs.com/) vygenerujte Access Token (typ **Automation** nebo **Granular Access Token** s právy publikovat v `@netuvio`).
   - V repozitáři na GitHubu přejděte do **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
   - Vytvořte secret s názvem `NPM_TOKEN` a vložte vygenerovaný token.
2. **Spuštění publikace**:
   - **Ručně (Workflow Dispatch)**: V záložce **Actions** vyberte *Publish to NPM* a klikněte na **Run workflow**.
   - **Přes GitHub Release**: Vytvořením nového GitHub Release (např. tag `v0.1.0`) se automaticky spustí typecheck, build a publikace na NPM s ověřením NPM Provenance.

---

### Pravidla pro verzování
- Verze se spravuje v `packages/react/package.json` a `packages/vue/package.json`.
- NPM nedovolí přepsat již publikovanou verzi – před každým dalším vydáním je nutné číslo verze navýšit (např. `0.1.1`, `0.2.0`).

## Licence

MIT © [Netuvio (Stanislav Škudrna)](./LICENSE)
