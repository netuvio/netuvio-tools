# @netuvio/tools-react

React utility a helper komponenty ekosystému **Netuvio**.

## Instalace

```bash
npm install @netuvio/tools-react
# nebo
pnpm add @netuvio/tools-react
# nebo
yarn add @netuvio/tools-react
```

### Peer Dependencies
Ujistěte se, že máte nainstalovaný `react` a `react-dom` (verze 18 nebo 19):

```bash
npm install react react-dom
```

## Obsažené komponenty

- **`Avatar`**: Zobrazení avataru uživatele s podporou obrázku nebo iniciál s deterministickým výpočtem HSL barvy pozadí podle jména.
- **`ClientOnly`**: Vykreslení obsahu pouze na klientovi, zabraňuje hydratačním chybám při SSR.
- **`If`**: Deklarativní podmínková komponenta s podporou `fallback` a polymorfního wrapperu `as`.
- **`Switch`**, **`Case`**, **`Default`**: Deklarativní větvení UI s podporou polymorfních wrapperů.
- **`Teleport`**: Bezpečný React portál s flexibilním cílovým elementem a SSR ochranou.
- **`Modal`**: Přístupný dialogový modal s klávesnicovou navigací (ESC) a animacemi.
- **`getHslFromText`**: Pomocná funkce pro převod textu na stabilní HSL barvu.

## Rychlý start

```tsx
import '@netuvio/tools-react/styles.css';
import { Avatar, ClientOnly, If, Switch, Case, Default, Teleport, Modal } from '@netuvio/tools-react';

export default function App() {
  return (
    <div>
      <Avatar name="Stanislav Škudrna" size={40} />

      <ClientOnly fallback={<p>Načítání...</p>}>
        <p>Pouze na klientovi</p>
      </ClientOnly>

      <If condition={true} fallback={<p>Nepravda</p>}>
        <p>Pravda</p>
      </If>
    </div>
  );
}
```

## Licence

MIT © [Netuvio (Stanislav Škudrna)](./LICENSE)

