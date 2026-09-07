<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { CSSProperties } from "vue";
import { getHslFromText } from "../utils/getHslFromText";

type Size = string | number;
type BackgroundColor = string | "random" | null;

export interface AvatarProps {
    name: string;
    size?: Size;
    src?: string | null;
    class?: string;
    className?: string;
    backgroundColor?: BackgroundColor;
    containerStyle?: CSSProperties;
    letterStyle?: CSSProperties;
    alt?: string;
}

const props = withDefaults(defineProps<AvatarProps>(), {
    size: 16,
    src: null,
    class: "",
    className: "",
    backgroundColor: "random",
    alt: "avatar",
});

const isClient = ref(false);
onMounted(() => {
    isClient.value = true;
});

const sizeComputed = computed<string>(() => {
    return typeof props.size === "number" ? `${props.size}px` : props.size;
});

const computedBg = computed<string>(() => {
    if (props.backgroundColor === "random" || !props.backgroundColor) {
        return getHslFromText(props.name || "");
    }
    return props.backgroundColor;
});

type StyleVars = CSSProperties & { ["--size"]?: string };
const containerStyles = computed<StyleVars>(() => {
    return {
        backgroundColor: !props.src ? computedBg.value : "transparent",
        "--size": sizeComputed.value,
        ...(props.containerStyle ?? {}),
    };
});

const letter = computed<string>(() => {
    if (!props.name?.trim()) return "";
    return props.name
        .trim()
        .split(/\s+/)
        .map((w) => w?.[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase();
});

const emit = defineEmits<{ (e: "click", event: MouseEvent): void }>();
</script>

<template>
    <div
        :class="[$style.avatar, className, props.class]"
        :style="containerStyles"
        @click="emit('click', $event)"
    >
        <img v-if="src" :class="$style.image" :src="src" :alt="props.alt" />
        <p v-else-if="isClient" :class="$style.letter" :style="letterStyle">{{ letter }}</p>
    </div>
</template>

<style module>
.avatar {
    width: var(--size, 16px);
    aspect-ratio: 1 / 1;
    border-radius: 100%;
    position: relative;
    flex-shrink: 0;
    overflow: hidden;
}

.letter {
    font-size: calc(var(--size, 16px) / 2.3);
    width: fit-content;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    user-select: none;
    pointer-events: none;
    color: var(--netuvio-avatar-color, var(--avatar-color, var(--bg, #ffffff)));
    font-weight: 500;
    margin: 0;
}

.image {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 100%;
    pointer-events: none;
}
</style>
