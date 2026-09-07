<script setup lang="ts">
import { ref, watch } from "vue";

export interface ProgressiveImageProps {
    lowResSrc: string;
    highResSrc: string;
    alt?: string;
}

const props = withDefaults(defineProps<ProgressiveImageProps>(), {
    alt: "",
});

const displayedLowResSrc = ref("");
const displayedHighResSrc = ref("");
const highResLoaded = ref(false);

let loadId = 0;

function loadImages() {
    const currentLoadId = ++loadId;

    displayedLowResSrc.value = props.lowResSrc;
    displayedHighResSrc.value = "";
    highResLoaded.value = false;

    if (typeof window === "undefined") {
        return;
    }

    const image = new window.Image();
    image.src = props.highResSrc;

    const applyHighRes = () => {
        if (currentLoadId !== loadId) return;
        displayedHighResSrc.value = props.highResSrc;
        highResLoaded.value = true;
    };

    if (image.complete && image.naturalWidth > 0) {
        applyHighRes();
        return;
    }

    image.onload = () => {
        applyHighRes();
    };

    image.onerror = () => {
        if (currentLoadId !== loadId) return;
        highResLoaded.value = false;
    };
}

watch(
    () => [props.lowResSrc, props.highResSrc],
    () => {
        loadImages();
    },
    { immediate: true }
);
</script>

<template>
    <div
        :class="[
            $style.progressiveImage,
            { [$style.highResLoaded]: highResLoaded }
        ]"
        data-progressive-image
    >
        <img
            :class="$style.lowRes"
            :src="displayedLowResSrc"
            :alt="props.alt"
            decoding="async"
        />

        <img
            v-if="displayedHighResSrc"
            :class="$style.highRes"
            :src="displayedHighResSrc"
            :alt="props.alt"
            decoding="async"
        />
    </div>
</template>

<style module>
.progressiveImage {
    position: relative;
    overflow: hidden;
}

.lowRes,
.highRes {
    width: 100%;
    height: auto;
    display: block;
}

.lowRes {
    transition: opacity 0.4s ease;
}

.highRes {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.4s ease;
}

.highResLoaded .highRes {
    opacity: 1;
}

.highResLoaded .lowRes {
    opacity: 0;
}
</style>
