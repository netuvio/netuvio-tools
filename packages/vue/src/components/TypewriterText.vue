<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = withDefaults(defineProps<{
    texts: string[];
    tag?: keyof HTMLElementTagNameMap | string;
    initialDelay?: number;
    pauseDuration?: number;
    typingSpeed?: number;
    deletingSpeed?: number;
}>(), {
    tag: "p",
    initialDelay: 2800,
    pauseDuration: 2400,
    typingSpeed: 48,
    deletingSpeed: 24,
});

const normalizedTexts = computed(() => props.texts.filter(text => text.length > 0));
const displayedText = ref(normalizedTexts.value[0] ?? "");
const layoutText = ref(displayedText.value);
const layoutTokens = computed(() => {
    let startIndex = 0;

    return (layoutText.value.match(/\s+|\S+/gu) ?? []).map(value => {
        const characters = Array.from(value);
        const token = {
            characters,
            isWhitespace: /^\s+$/u.test(value),
            startIndex,
        };

        startIndex += characters.length;
        return token;
    });
});
const visibleCharacterCount = computed(() => Array.from(displayedText.value).length);
const isTextComplete = computed(() => displayedText.value === layoutText.value);

let currentTextIndex = 0;
let cycleVersion = 0;
let timeout: ReturnType<typeof setTimeout> | undefined;
let isMounted = false;
let reducedMotionQuery: MediaQueryList | undefined;

function clearScheduledStep(): void {
    if (timeout === undefined) return;
    clearTimeout(timeout);
    timeout = undefined;
}

function scheduleStep(callback: () => void, delay: number, version: number): void {
    clearScheduledStep();
    timeout = setTimeout(() => {
        timeout = undefined;
        if (version === cycleVersion) callback();
    }, delay);
}

function getCommonPrefixLength(currentText: string, nextText: string): number {
    const currentCharacters = Array.from(currentText);
    const nextCharacters = Array.from(nextText);
    const shortestLength = Math.min(currentCharacters.length, nextCharacters.length);

    let prefixLength = 0;
    while (
        prefixLength < shortestLength &&
        currentCharacters[prefixLength] === nextCharacters[prefixLength]
    ) {
        prefixLength += 1;
    }

    return prefixLength;
}

function typeText(nextTextIndex: number, version: number): void {
    const nextText = normalizedTexts.value[nextTextIndex];
    if (!nextText) return;

    layoutText.value = nextText;
    const nextCharacters = Array.from(nextText);
    const displayedLength = Array.from(displayedText.value).length;

    if (displayedLength < nextCharacters.length) {
        displayedText.value = nextCharacters.slice(0, displayedLength + 1).join("");
        scheduleStep(
            () => typeText(nextTextIndex, version),
            props.typingSpeed,
            version,
        );
        return;
    }

    currentTextIndex = nextTextIndex;
    const followingTextIndex = (currentTextIndex + 1) % normalizedTexts.value.length;
    scheduleStep(
        () => deleteText(followingTextIndex, version),
        props.pauseDuration,
        version,
    );
}

function deleteText(nextTextIndex: number, version: number): void {
    const nextText = normalizedTexts.value[nextTextIndex];
    if (!nextText) return;

    const prefixLength = getCommonPrefixLength(displayedText.value, nextText);
    const displayedCharacters = Array.from(displayedText.value);

    if (displayedCharacters.length > prefixLength) {
        displayedCharacters.pop();
        displayedText.value = displayedCharacters.join("");
        scheduleStep(
            () => deleteText(nextTextIndex, version),
            props.deletingSpeed,
            version,
        );
        return;
    }

    typeText(nextTextIndex, version);
}

function restartCycle(): void {
    clearScheduledStep();
    cycleVersion += 1;
    currentTextIndex = 0;
    displayedText.value = normalizedTexts.value[0] ?? "";
    layoutText.value = displayedText.value;

    if (
        !isMounted ||
        normalizedTexts.value.length < 2 ||
        reducedMotionQuery?.matches
    ) {
        return;
    }

    const version = cycleVersion;
    scheduleStep(() => deleteText(1, version), props.initialDelay, version);
}

function handleReducedMotionChange(): void {
    restartCycle();
}

watch(
    () => props.texts.join("\u0000"),
    restartCycle,
);

onMounted(() => {
    isMounted = true;
    if (typeof window !== "undefined") {
        reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
        reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    }
    restartCycle();
});

onBeforeUnmount(() => {
    isMounted = false;
    cycleVersion += 1;
    clearScheduledStep();
    reducedMotionQuery?.removeEventListener("change", handleReducedMotionChange);
});
</script>

<template>
    <component :is="props.tag" aria-live="off">
        <span :class="$style.srOnly">{{ displayedText }}</span>
        <span aria-hidden="true"><template v-for="token in layoutTokens" :key="token.startIndex"><span v-if="token.isWhitespace">{{ token.characters.join("") }}</span><span v-else :class="$style.word"><span v-for="(character, characterIndex) in token.characters" :key="characterIndex" :class="[$style.character, { [$style.visibleCharacter]: token.startIndex + characterIndex < visibleCharacterCount }]">{{ character }}</span></span></template><span :class="[$style.cursor, { [$style.visibleCursor]: isTextComplete }]"></span></span>
    </component>
</template>

<style module>
.srOnly {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}

.word {
    display: inline-block;
    white-space: nowrap;
}

.character {
    opacity: 0;
    transition: opacity 140ms ease;
}

.visibleCharacter {
    opacity: 1;
}

.cursor {
    display: inline-block;
    width: var(--netuvio-typewriter-cursor-size, var(--typewriter-cursor-size, 0.22em));
    margin-left: var(--netuvio-typewriter-cursor-gap, var(--typewriter-cursor-gap, 0.11em));
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: currentColor;
    vertical-align: 0;
    opacity: 0;
    transform: scale(0.7);
    transition: opacity 180ms ease-out, transform 180ms ease-out;
}

.visibleCursor {
    opacity: 1;
    transform: scale(1);
}

@media (prefers-reduced-motion: reduce) {
    .character {
        transition: none;
    }

    .cursor {
        transition: none;
    }
}
</style>
