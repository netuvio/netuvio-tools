<script setup lang="ts">
import { ref, shallowRef, computed, onMounted, onBeforeUnmount } from "vue";
import type { Component } from "vue";

export type ResizePayload = {
    width: number;
    height: number;
};

const emit = defineEmits<{
    (e: "resize", payload: ResizePayload): void;
}>();

const props = withDefaults(defineProps<{
    tag?: keyof HTMLElementTagNameMap | Component | string;
    transitionDuration?: number;
    easing?: string;
    animateWidth?: boolean;
}>(), {
    tag: "div",
    transitionDuration: 400,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    animateWidth: false,
});

const contentRef = shallowRef<HTMLElement | null>(null);
const measuredHeight = ref<number | null>(null);
const measuredWidth = ref<number | null>(null);
const transitionsEnabled = ref(false);

let resizeObserver: ResizeObserver | null = null;
let animationFrame: number | null = null;

const wrapperStyle = computed(() => {
    const transitionProperties = props.animateWidth ? ["height", "width"] : ["height"];

    return {
        height: measuredHeight.value === null ? "auto" : `${measuredHeight.value}px`,
        width: props.animateWidth
            ? measuredWidth.value === null ? "auto" : `${measuredWidth.value}px`
            : undefined,
        overflow: "hidden",
        transition: transitionsEnabled.value
            ? transitionProperties
                .map(property => `${property} ${props.transitionDuration}ms ${props.easing}`)
                .join(", ")
            : "none",
    };
});

function measureContent(): void {
    if (!contentRef.value) return;

    const rect = contentRef.value.getBoundingClientRect();
    const width = Math.max(0, rect.width);
    const height = Math.max(0, rect.height);

    measuredWidth.value = width;
    measuredHeight.value = height;
    emit("resize", { width, height });
}

function scheduleMeasurement(): void {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);

    animationFrame = requestAnimationFrame(() => {
        animationFrame = null;
        measureContent();
    });
}

onMounted(() => {
    measureContent();

    if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(scheduleMeasurement);
        if (contentRef.value) resizeObserver.observe(contentRef.value);
    }

    requestAnimationFrame(() => {
        transitionsEnabled.value = true;
    });
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    resizeObserver = null;

    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
});
</script>

<template>
    <component :is="props.tag" :style="wrapperStyle" data-smooth-size-wrapper>
        <div
            ref="contentRef"
            :class="[
                $style.content,
                {
                    [$style.measureWidth]: props.animateWidth
                }
            ]"
        >
            <slot />
        </div>
    </component>
</template>

<style module>
.content {
    display: grid;
}

.measureWidth {
    display: inline-grid;
    width: max-content;
}

@media (prefers-reduced-motion: reduce) {
    [data-smooth-size-wrapper] {
        transition-duration: 0.01ms !important;
    }
}
</style>
