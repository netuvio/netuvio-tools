# @netuvio/tools-vue

Utility and helper components for the **Netuvio** ecosystem built for Vue 3 & Nuxt.

- **100% CSS Modules**: All component styles are isolated using Vue `<style module>` — zero global CSS pollution or class conflicts.
- **SSR / Nuxt Ready**: Safe execution in both server-side (Nuxt, Vite SSR) and client-side SPA environments.
- **Tree-Shakeable**: Import only the components you need or register globally via the optional Vue plugin.
- **Type-Safe**: Full TypeScript definitions and slot typings included.

---

## Installation

```bash
npm install @netuvio/tools-vue
# or
pnpm add @netuvio/tools-vue
# or
yarn add @netuvio/tools-vue
```

### Peer Dependencies
Make sure you have `vue` installed (version 3.3+):

```bash
npm install vue
```

### Importing Styles
Import the bundled styles once in your app entry point (`main.ts` or `app.vue`):

```ts
import '@netuvio/tools-vue/styles.css';
```

---

## Registration

### Option A: Direct Component Imports (Recommended)
Import individual components wherever you need them:

```vue
<script setup lang="ts">
import { Avatar, SmoothSizeWrapper, Modal } from '@netuvio/tools-vue';
</script>
```

### Option B: Global Vue Plugin
Register all components globally in your Vue app:

```ts
import { createApp } from 'vue';
import App from './App.vue';
import NetuvioTools from '@netuvio/tools-vue';
import '@netuvio/tools-vue/styles.css';

const app = createApp(App);
app.use(NetuvioTools);
app.mount('#app');
```

---

## Components & Use Cases

### 1. `SmoothSizeWrapper`
Smoothly animates container dimensions whenever the internal content changes height or width. Powered by `ResizeObserver`, eliminating the need for fixed heights or manual calculations. Perfect for dynamic tab panels, multi-step wizards, or variable-length lists.

#### Use Cases & Examples

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { SmoothSizeWrapper } from '@netuvio/tools-vue';

const currentTab = ref('short');
</script>

<template>
  <div class="tabs-card">
    <div class="tab-buttons">
      <button @click="currentTab = 'short'">Short Tab</button>
      <button @click="currentTab = 'long'">Long Tab</button>
    </div>

    <!-- Automatically animates height smoothly on content change -->
    <SmoothSizeWrapper :transition-duration="350" easing="cubic-bezier(0.22, 1, 0.36, 1)">
      <div v-if="currentTab === 'short'" key="short" style="padding: 16px;">
        <p>Short content here.</p>
      </div>
      <div v-else key="long" style="padding: 16px;">
        <p>Line 1: Detailed information...</p>
        <p>Line 2: More information...</p>
        <p>Line 3: Extended information...</p>
      </div>
    </SmoothSizeWrapper>
  </div>
</template>
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tag` | `string \| Component` | `'div'` | HTML tag or component for the root wrapper |
| `transitionDuration` | `number` | `400` | Animation duration in milliseconds |
| `easing` | `string` | `'cubic-bezier(0.22, 1, 0.36, 1)'` | CSS transition timing function |
| `animateWidth` | `boolean` | `false` | When true, animates both width and height |

#### Events

| Event | Payload | Description |
| --- | --- | --- |
| `@resize` | `{ width: number, height: number }` | Emitted when size is measured |

---

### 2. `Modal`
Production-grade modal dialog featuring **event-based scroll locking**. Unlike basic modals that set `overflow: hidden` on the body (which causes layout jumps as the scrollbar disappears), this modal intercepts wheel, touch, and keyboard scrolling events to prevent background movement while allowing full, natural scrolling inside the modal.

#### Use Cases & Examples

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Modal } from '@netuvio/tools-vue';

const isModalOpen = ref(false);
</script>

<template>
  <button @click="isModalOpen = true">Open Dialog</button>

  <Modal
    :enabled="isModalOpen"
    :can-be-closed-by-clicking-outside="true"
    :show-close-button="true"
    @close="isModalOpen = false"
    @closed="console.log('Animation completed')"
  >
    <h2>Account Settings</h2>
    <p>Modal content with scroll locking and smooth animations.</p>
    <button @click="isModalOpen = false">Done</button>
  </Modal>
</template>
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | *(required)* | Controls visibility and open state |
| `canBeClosedByClickingOutside` | `boolean` | `true` | Allows backdrop click dismiss |
| `showCloseButton` | `boolean` | `true` | Renders a circular close button |
| `modalClassName` | `string` | `''` | Custom CSS class for inner dialog box |
| `containerClassName` | `string` | `''` | Custom CSS class for overlay layer |
| `teleportTo` | `string` | `'body'` | Target element selector for Teleport |

#### Events

| Event | Description |
| --- | --- |
| `@close` | Triggered when close is requested (ESC, backdrop click, or close button) |
| `@closed` | Triggered after the closing animation finishes |

---

### 3. `Popover`
Smart floating popover with built-in mobile adaptability:
- **Desktop**: Positions relative to the trigger (`top-left`, `top-right`, `bottom-left`, `bottom-right`) with scroll intent detection so user scrolling gracefully dismisses it.
- **Mobile (< 768px)**: Automatically promotes the popover into a centered bottom/modal sheet, providing a superior mobile UX.

#### Use Cases & Examples

```vue
<script setup lang="ts">
import { Popover } from '@netuvio/tools-vue';
</script>

<template>
  <Popover position="bottom-right" trigger="click">
    <template #trigger>
      <button class="avatar-button">Options</button>
    </template>

    <template #content>
      <div style="padding: 12px; min-width: 200px;">
        <p><strong>Signed in as</strong> user@example.com</p>
        <hr />
        <a href="#profile">Profile</a>
        <a href="#settings">Settings</a>
      </div>
    </template>
  </Popover>
</template>
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Desktop position relative to trigger |
| `trigger` | `'click' \| 'hover'` | `'click'` | Trigger activation mode |
| `canBeHovered` | `boolean` | `false` | Keeps popover open when hovering over popover content |
| `wrapperClass` | `string` | `''` | Custom CSS class for outer trigger wrapper |

---

### 4. `TypewriterText`
Accessible typewriter text cycling component. Features smart common prefix calculation (only backspaces differing letters for natural typing), pauses, and automatic `prefers-reduced-motion` detection. Includes a hidden `aria-live` screen reader element.

#### Use Cases & Examples

```vue
<script setup lang="ts">
import { TypewriterText } from '@netuvio/tools-vue';

const titles = [
  'Fullstack Developer',
  'Vue & React Enthusiast',
  'UI/UX Designer',
];
</script>

<template>
  <h1>
    I am a <TypewriterText :texts="titles" :typing-speed="45" :pause-duration="2000" tag="span" />
  </h1>
</template>
```

#### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `texts` | `string[]` | *(required)* | Array of strings to cycle through |
| `tag` | `string` | `'p'` | HTML tag rendered for the container |
| `typingSpeed` | `number` | `48` | Milliseconds per typed character |
| `deletingSpeed` | `number` | `24` | Milliseconds per deleted character |
| `pauseDuration` | `number` | `2400` | Pause duration before backspacing |
| `initialDelay` | `number` | `2800` | Initial delay before starting the loop |

---

### 5. `WrittenText`
Renders decorative handwritten/cursive text with responsive sizing. Falls back gracefully to standard cursive fonts if custom fonts are not loaded.

#### Use Cases & Examples

```vue
<script setup lang="ts">
import { WrittenText } from '@netuvio/tools-vue';
</script>

<template>
  <WrittenText text="Hello World!" :font-size="36" as="h2" />
</template>
```

---

### 6. `Avatar`
Avatar component for Vue displaying user initials or images with deterministic HSL background calculation.

#### Use Cases & Examples

```vue
<script setup lang="ts">
import { Avatar } from '@netuvio/tools-vue';
</script>

<template>
  <div style="display: flex; gap: 12px;">
    <!-- Automatic initials and deterministic HSL color -->
    <Avatar name="Stanislav Škudrna" :size="40" />

    <!-- Image avatar -->
    <Avatar
      name="Jane Doe"
      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
      :size="40"
    />

    <!-- Fixed background color -->
    <Avatar name="Support Team" background-color="#10b981" :size="32" />
  </div>
</template>
```

---

### 7. `ProgressiveImage`
Progressive image loader that shows a tiny blurred/low-res preview immediately, then crossfades into the full high-res image once loaded.

#### Use Cases & Examples

```vue
<script setup lang="ts">
import { ProgressiveImage } from '@netuvio/tools-vue';
</script>

<template>
  <div style="max-width: 600px;">
    <ProgressiveImage
      low-res-src="/images/hero-preview.webp"
      high-res-src="/images/hero-4k.webp"
      alt="Hero background"
    />
  </div>
</template>
```

---

### 8. `SmoothConditionalSize`
Collapsible/accordion component that smoothly animates open/closed states using the modern `grid-template-rows: 0fr -> 1fr` CSS technique.

#### Use Cases & Examples

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { SmoothConditionalSize } from '@netuvio/tools-vue';

const isExpanded = ref(false);
</script>

<template>
  <button @click="isExpanded = !isExpanded">
    {{ isExpanded ? 'Hide Details' : 'Show Details' }}
  </button>

  <SmoothConditionalSize :show="isExpanded" :duration="300">
    <div style="padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 8px;">
      <p>Hidden accordion details smoothly revealed.</p>
    </div>
  </SmoothConditionalSize>
</template>
```

---

### 9. `ClientOnly` & `useIsHydrated`
Prevents hydration mismatch errors in Nuxt or Vite SSR by delaying rendering until after client mount.

```vue
<script setup lang="ts">
import { ClientOnly, useIsHydrated } from '@netuvio/tools-vue';

const isHydrated = useIsHydrated();
</script>

<template>
  <ClientOnly>
    <p>Local time: {{ new Date().toLocaleTimeString() }}</p>

    <template #fallback>
      <p>Loading time...</p>
    </template>
  </ClientOnly>
</template>
```

---

## Customizing & Theming via CSS Variables

Components use **Namespaced Fallback Chains**. They inherit existing project CSS variables automatically, and can be customized globally:

```css
:root {
  --netuvio-modal-z-index: 1100;
  --netuvio-popover-z-index: 1000;
  --netuvio-bg: #ffffff;
  --netuvio-border: rgba(0, 0, 0, 0.1);
  --netuvio-text: #111111;
  --netuvio-avatar-color: #ffffff;
}
```

## License

MIT © [Netuvio (Stanislav Škudrna)](./LICENSE)



