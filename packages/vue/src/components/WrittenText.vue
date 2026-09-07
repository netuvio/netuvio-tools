<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
    text: string;
    as?: string;
    fontSize?: number | string | null;
}>(), {
    text: "",
    as: "p",
    fontSize: null,
});

const formattedFontSize = computed(() => {
    if (typeof props.fontSize === "number") {
        return `${props.fontSize}px`;
    }
    return props.fontSize;
});
</script>

<template>
    <component
        :is="props.as"
        :class="$style.text"
        :style="[props.fontSize ? { '--font-size': formattedFontSize } : {}]"
    >
        {{ props.text }}
    </component>
</template>

<style module>
.text {
    font-family: var(--netuvio-written-font, var(--written-text-font, "Sacramento", cursive));
    font-size: var(--font-size, 1em);
    height: calc(var(--font-size, 1em) / 1.1);
    color: var(--netuvio-written-color, var(--accent-color, currentColor));
    line-height: 0.95;
}

@media screen and (max-width: 600px) {
    .text {
        height: auto;
        line-height: 1.05;
    }
}
</style>
