# Netuvio Tools

Monorepo of utility components and tools for the **Netuvio** ecosystem supporting React and Vue 3.

## Monorepo Structure

```text
netuvio-tools/
└── packages/
    ├── react/   # @netuvio/tools-react (React utility components) -> published to NPM
    └── vue/     # @netuvio/tools-vue   (Vue 3 utility components)  -> published to NPM
```

## Commands

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm run build

# TypeScript typecheck
pnpm run typecheck

# Clean dist directories
pnpm run clean
```

## How to Publish to NPM

To publish `@netuvio/tools-react` and `@netuvio/tools-vue`, you can use either of the following methods:

### 1. Local Publishing from Terminal (CLI)

1. **Log in to NPM**:
   Make sure you are logged in to an account with access to the `@netuvio` organization:
   ```bash
   npm login
   ```
2. **Build packages**:
   ```bash
   pnpm run build
   ```
3. **Publish to NPM**:
   ```bash
   pnpm run publish:packages
   ```
   *(If you have uncommitted changes in git, add the `--no-git-checks` flag: `pnpm --filter "@netuvio/tools-*" publish --access public --no-git-checks`)*

---

### 2. Automated Publishing via GitHub Actions (CI/CD)

The repository includes a ready-to-use workflow in [`.github/workflows/publish.yml`](./.github/workflows/publish.yml).

1. **Configure NPM Token in GitHub**:
   - Go to [npmjs.com](https://www.npmjs.com/) and generate an Access Token (type **Automation** or a **Granular Access Token** with publish permissions for `@netuvio`).
   - In your GitHub repository, navigate to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
   - Create a secret named `NPM_TOKEN` and paste your generated token.
2. **Trigger the Publish**:
   - **Manually (Workflow Dispatch)**: Go to the **Actions** tab on GitHub, select *Publish to NPM*, and click **Run workflow**.
   - **Via GitHub Release**: Creating a new GitHub Release (e.g., tag `v0.1.0`) will automatically run typechecking, building, and publishing to NPM with NPM Provenance verification.

---

### Versioning Guidelines
- Package versions are managed in `packages/react/package.json` and `packages/vue/package.json`.
- NPM does not allow overwriting already published versions — increment the version number before each release (e.g., `0.1.1`, `0.2.0`).

## License

MIT © [Netuvio (Stanislav Škudrna)](./LICENSE)

