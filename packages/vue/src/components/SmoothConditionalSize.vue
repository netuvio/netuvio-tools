<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from "vue";
import type { Component } from "vue";

const emit = defineEmits<{
    (e: "afterLeave"): void;
}>();

const props = withDefaults(defineProps<{
    show: boolean;
    tag?: keyof HTMLElementTagNameMap | Component | string;
    duration?: number;
    easing?: string;
    allowTransform?: boolean;
}>(), {
    tag: "div",
    duration: 300,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    allowTransform: true,
});

const isRendered = ref(props.show);
const isOpen = ref(props.show);

let enterFrame: number | undefined;
let leaveTimeout: ReturnType<typeof setTimeout> | undefined;

const wrapperStyle = computed(() => ({
    "--smooth-conditional-size-duration": `${props.duration}ms`,
    "--smooth-conditional-size-easing": props.easing,
    "--smooth-conditional-size-translate-y": props.allowTransform ? "-8px" : "0",
}));

function cancelScheduledWork(): void {
    if (enterFrame !== undefined) {
        cancelAnimationFrame(enterFrame);
        enterFrame = undefined;
    }

    if (leaveTimeout !== undefined) {
        clearTimeout(leaveTimeout);
        leaveTimeout = undefined;
    }
}

function openAfterRender(): void {
    void nextTick(() => {
        enterFrame = requestAnimationFrame(() => {
            enterFrame = undefined;
            isOpen.value = true;
        });
    });
}

function enter(): void {
    cancelScheduledWork();

    if (isRendered.value) {
        isOpen.value = true;
        return;
    }

    isRendered.value = true;
    isOpen.value = false;
    openAfterRender();
}

function leave(): void {
    cancelScheduledWork();

    if (!isRendered.value) {
        emit("afterLeave");
        return;
    }

    isOpen.value = false;
    leaveTimeout = setTimeout(() => {
        isRendered.value = false;
        leaveTimeout = undefined;
        emit("afterLeave");
    }, props.duration);
}

watch(
    () => props.show,
    (show) => {
        if (show) {
            enter();
            return;
        }
        leave();
    }
);

onBeforeUnmount(cancelScheduledWork);
</script>

<template>
    <component
        :is="props.tag"
        v-if="isRendered"
        :class="[$style.smoothConditionalSize, { [$style.open]: isOpen }]"
        :style="wrapperStyle"
        :aria-hidden="!isOpen"
        :inert="!isOpen ? true : undefined"
    >
        <div :class="$style.clip">
            <div :class="$style.content">
                <slot />
            </div>
        </div>
    </component>
</template>

<style module>
.smoothConditionalSize {
    display: grid;
    grid-template-rows: 0fr;
    overflow: hidden;
    transition: grid-template-rows var(--smooth-conditional-size-duration) var(--smooth-conditional-size-easing);
}

.open {
    grid-template-rows: 1fr;
}

.clip {
    min-height: 0;
    overflow: hidden;
}

.content {
    opacity: 0;
    pointer-events: none;
    transform: translateY(var(--smooth-conditional-size-translate-y, 0));
    transition:
        opacity var(--smooth-conditional-size-duration) ease,
        transform var(--smooth-conditional-size-duration) var(--smooth-conditional-size-easing);
}

.open .content {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
    .smoothConditionalSize,
    .content {
        transition-duration: 0.01ms !important;
    }
}
</style>
