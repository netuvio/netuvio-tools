# @netuvio/tools-vue

Vue 3 utility a helper komponenty ekosystému **Netuvio**.

## Instalace

```bash
npm install @netuvio/tools-vue
# nebo
pnpm add @netuvio/tools-vue
# nebo
yarn add @netuvio/tools-vue
```

### Peer Dependencies
Ujistěte se, že máte nainstalovaný `vue` (verze 3.3+):

```bash
npm install vue
```

## Obsažené komponenty

- **`SmoothSizeWrapper`**: Plynulá animace změn rozměrů obsahu (výška i šířka) pomocí ResizeObserveru.
- **`Modal`**: Pokročilý dialogový modal s event-based scroll lockem, klávesovými zkratkami (ESC) a animacemi.
- **`Popover`**: Chytrý popover s automatickým fallbackem na modal na mobilních zařízeních a scroll trackingem.
- **`TypewriterText`**: Psací stroj s a11y podporou, plynulým cyklením textů a reduced-motion ochranou.
- **`WrittenText`**: Ručně psaný dekorativní text s responzivní velikostí.
- **`Avatar`**: Avatar s obrázkem nebo iniciálami a deterministickým HSL výpočtem barvy podle jména.
- **`ProgressiveImage`**: Progresivní načítání obrázků s plynulým přechodem z náhledu do plného rozlišení.
- **`SmoothConditionalSize`**: Plynulé akordeonové sbalování/rozbalování obsahu přes moderní CSS Grid.
- **`ClientOnly`**: Vykreslení obsahu pouze po klientském namountování (pro SSR bezpečnost).
- **`useIsHydrated`**: Vue composable vracející readonly ref o stavu hydratace.
- **`getHslFromText`**: Pomocná funkce pro převod textu na stabilní HSL barvu.

## Rychlý start

### Použití jako komponenta

```vue
<script setup lang="ts">
import '@netuvio/tools-vue/styles.css';
import {
  Avatar,
  SmoothSizeWrapper,
  Modal,
  Popover,
  TypewriterText,
  WrittenText,
  ProgressiveImage,
  SmoothConditionalSize,
  ClientOnly,
} from '@netuvio/tools-vue';
</script>

<template>
  <Avatar name="Stanislav Škudrna" :size="40" />
  <TypewriterText :texts="['První text', 'Druhý text']" />
</template>
```

### Registrace jako Vue Plugin (volitelné)

```ts
import { createApp } from 'vue';
import App from './App.vue';
import NetuvioTools from '@netuvio/tools-vue';
import '@netuvio/tools-vue/styles.css';

const app = createApp(App);
app.use(NetuvioTools);
app.mount('#app');
```

## Licence

MIT © [Netuvio (Stanislav Škudrna)](./LICENSE)

