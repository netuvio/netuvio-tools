# @netuvio/tools-react

Utility and helper components for the **Netuvio** ecosystem built for React 18 & 19.

- **100% CSS Modules**: Zero global CSS leaks or selector clashes.
- **SSR Safe**: Fully compatible with Next.js (App & Pages router), Remix, Vite, and Astro.
- **Type-Safe**: First-class TypeScript support with exported prop interfaces.
- **Zero-Config Theming**: Works out-of-the-box with sensible defaults and automatically inherits existing CSS variables.

---

## Installation

```bash
npm install @netuvio/tools-react
# or
pnpm add @netuvio/tools-react
# or
yarn add @netuvio/tools-react
```

### Peer Dependencies
Make sure you have `react` and `react-dom` installed (version 18 or 19):

```bash
npm install react react-dom
```

### Importing Styles
Import the bundled styles once in your root layout or application entry point:

```tsx
import '@netuvio/tools-react/styles.css';
```

---

## Components & Use Cases

### 1. `Avatar`
Displays a user profile picture or generated initials. When no image is provided, it automatically computes a stable, deterministic HSL background color from the user's name so each user receives a consistent and distinct accent.

#### Use Cases & Examples

```tsx
import { Avatar } from '@netuvio/tools-react';

export function UserProfiles() {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {/* Generated initials with automatic deterministic HSL background */}
      <Avatar name="Stanislav Škudrna" size={40} />

      {/* Profile picture with image */}
      <Avatar
        name="John Doe"
        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
        size="48px"
      />

      {/* Custom background color override */}
      <Avatar name="Admin User" size={32} background="#6366f1" />

      {/* Clickable avatar */}
      <Avatar
        name="Sarah Connor"
        size={40}
        onClick={() => alert('Profile clicked!')}
      />
    </div>
  );
}
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string` | *(required)* | Name used to derive initials and deterministic HSL color |
| `size` | `number \| string` | `'16px'` | Diameter of avatar (number becomes `${size}px`) |
| `src` | `string \| null` | `undefined` | URL of the profile image |
| `background` | `string` | `undefined` | Custom CSS background override |
| `alt` | `string` | `'avatar'` | Image alt text |
| `className` | `string` | `undefined` | Additional CSS class |
| `style` | `React.CSSProperties` | `undefined` | Inline style overrides |
| `onClick` | `(e) => void` | `undefined` | Click event handler |

---

### 2. `Switch`, `Case`, `Default`
Declarative pattern matching and state switching for React without nested ternaries or inline IIFEs. Evaluates cases sequentially and renders the first matching `<Case>`, or `<Default>` if no conditions match.

#### Use Cases & Examples

```tsx
import { Switch, Case, Default } from '@netuvio/tools-react';

type Status = 'loading' | 'error' | 'empty' | 'success';

interface UserListProps {
  status: Status;
  users: Array<{ id: string; name: string }>;
  errorMessage?: string;
}

export function UserList({ status, users, errorMessage }: UserListProps) {
  return (
    <Switch>
      <Case when={status === 'loading'}>
        <div className="spinner">Loading users...</div>
      </Case>

      <Case when={status === 'error'}>
        <div className="alert-error">Failed to load: {errorMessage}</div>
      </Case>

      <Case when={status === 'empty' || users.length === 0}>
        <div className="empty-state">No users found.</div>
      </Case>

      <Case when={status === 'success'}>
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      </Case>

      <Default>
        <div>Unknown status</div>
      </Default>
    </Switch>
  );
}
```

#### Polymorphic Container (`as`)
Wrap the matched result in a container element automatically:

```tsx
<Switch as="section" className="content-box">
  <Case when={isAdmin} as="div" className="admin-panel">
    <AdminControls />
  </Case>
  <Default as="div" className="user-panel">
    <UserControls />
  </Default>
</Switch>
```

---

### 3. `If`
Clean declarative conditional rendering component with built-in `fallback` and polymorphic container support. Eliminates ugly `condition ? <Component /> : null` expressions.

#### Use Cases & Examples

```tsx
import { If } from '@netuvio/tools-react';

export function DashboardHeader({ user, notificationsCount }) {
  return (
    <header>
      {/* Simple conditional */}
      <If condition={user.isLoggedIn}>
        <p>Welcome back, {user.name}!</p>
      </If>

      {/* With fallback */}
      <If
        condition={notificationsCount > 0}
        fallback={<span>No new notifications</span>}
      >
        <span className="badge">{notificationsCount} new alerts</span>
      </If>

      {/* Polymorphic element wrapping */}
      <If
        condition={user.isPremium}
        as="aside"
        className="premium-banner"
      >
        Premium Membership Active
      </If>
    </header>
  );
}
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `condition` | `boolean` | *(required)* | Condition to evaluate |
| `children` | `ReactNode` | `undefined` | Content rendered when condition is `true` |
| `fallback` | `ReactNode` | `null` | Content rendered when condition is `false` |
| `as` | `React.ElementType` | `React.Fragment` | Element or component to wrap the result in |

---

### 4. `ClientOnly`
Ensures children are only rendered in the browser after hydration has completed. Prevents hydration mismatch errors when dealing with browser-only APIs (`window`, `localStorage`, `matchMedia`, dynamic client timestamps, or theme detection).

#### Use Cases & Examples

```tsx
import { ClientOnly } from '@netuvio/tools-react';

export function UserSettings() {
  return (
    <div>
      <h3>Preferences</h3>

      {/* Reading localStorage or window dimensions safely */}
      <ClientOnly fallback={<div className="skeleton">Loading theme...</div>}>
        <p>Saved Theme: {localStorage.getItem('theme') ?? 'System default'}</p>
        <p>Window width: {window.innerWidth}px</p>
      </ClientOnly>
    </div>
  );
}
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | *(required)* | Content rendered exclusively on the client |
| `fallback` | `ReactNode` | `null` | Placeholder content rendered on the server and during hydration |

---

### 5. `Modal`
Accessible, animated dialog modal with backdrop blur, click-outside handling, and `Escape` key listeners. Uses React portals to render cleanly at the root level.

#### Use Cases & Examples

```tsx
import { useState } from 'react';
import { Modal } from '@netuvio/tools-react';

export function DeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Delete Project</button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        closeOnBackdrop={true}
        showCloseButton={true}
      >
        <div style={{ padding: '24px' }}>
          <h2>Are you sure?</h2>
          <p>This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button onClick={() => setIsOpen(false)}>Cancel</button>
            <button style={{ background: 'red', color: 'white' }}>Confirm Delete</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | *(required)* | Controls visibility of the modal |
| `onClose` | `() => void` | *(required)* | Callback triggered on ESC key, backdrop click, or close button |
| `closeOnBackdrop` | `boolean` | `true` | Whether clicking the backdrop triggers `onClose` |
| `showCloseButton` | `boolean` | `true` | Displays circular close button in top right |
| `className` | `string` | `undefined` | Custom class for modal dialog content box |
| `closeButtonClassName`| `string` | `undefined` | Custom class for close button |
| `labelledBy` | `string` | `undefined` | `aria-labelledby` ID pointing to title |

---

### 6. `Teleport`
Safe React portal component with SSR protection and flexible target resolution.

#### Use Cases & Examples

```tsx
import { Teleport } from '@netuvio/tools-react';

export function FloatingTooltip() {
  return (
    <div>
      <p>Hover me</p>

      {/* Portals to <div id="teleports"></div> or falls back to document.body */}
      <Teleport to="teleports">
        <div className="floating-tooltip">I render outside the parent DOM tree!</div>
      </Teleport>

      {/* Portals to any custom CSS selector or HTMLElement */}
      <Teleport to="#dropdown-root">
        <div className="dropdown-menu">Menu items...</div>
      </Teleport>
    </div>
  );
}
```

---

### 7. `getHslFromText`
Standalone utility function generating consistent, deterministic HSL colors from any input string.

```ts
import { getHslFromText } from '@netuvio/tools-react';

const color1 = getHslFromText('Stanislav'); // e.g. "hsl(214, 52%, 58%)"
const color2 = getHslFromText('Netuvio');   // e.g. "hsl(86, 61%, 51%)"
```

---

## Customizing & Theming via CSS Variables

Components use **Namespaced Fallback Chains**. They require no setup, but you can override styles application-wide or per component:

```css
:root {
  /* Override library-specific tokens */
  --netuvio-modal-z-index: 9999;
  --netuvio-bg: #1e1e2e;
  --netuvio-border: rgba(255, 255, 255, 0.1);
  --netuvio-text: #ffffff;
  --netuvio-avatar-color: #ffffff;
}
```

## License

MIT © [Netuvio (Stanislav Škudrna)](./LICENSE)



