<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";

const props = withDefaults(defineProps<{
    enabled: boolean;
    canBeClosedByClickingOutside?: boolean;
    modalStyle?: Record<string, string | number>;
    modalClassName?: string;
    containerStyle?: Record<string, string | number>;
    containerClassName?: string;
    showCloseButton?: boolean;
    closeButtonClassName?: string;
    teleportTo?: string;
}>(), {
    canBeClosedByClickingOutside: true,
    modalClassName: "",
    containerClassName: "",
    showCloseButton: true,
    closeButtonClassName: "",
    teleportTo: "body",
});

type AnimationState = "opening" | "open" | "closing" | "closed";

const emit = defineEmits<{
    (e: "close"): void;
    (e: "closed"): void;
}>();

const isOpen = ref<boolean>(props.enabled);
const animationState = ref<AnimationState>("closed");
let animationTimeout: ReturnType<typeof setTimeout> | null = null;

const clearAnimationTimeout = () => {
    if (!animationTimeout) return;
    clearTimeout(animationTimeout);
    animationTimeout = null;
};

const modalRoot = ref<HTMLElement | null>(null);
const modalContent = ref<HTMLElement | null>(null);

const getScrollableAncestor = (el: Element | null): HTMLElement | null => {
    if (!el || typeof window === "undefined") return null;
    let node: Element | null = el as Element;
    while (node && node !== document.documentElement) {
        const style = window.getComputedStyle(node as Element);
        const oy = style.overflowY;
        const isScrollable =
            (oy === "auto" || oy === "scroll" || oy === "overlay") &&
            (node as HTMLElement).scrollHeight > (node as HTMLElement).clientHeight;
        if (isScrollable) return node as HTMLElement;
        node = node.parentElement;
    }
    return null;
};

const canScrollBy = (el: HTMLElement, deltaY: number): boolean => {
    if (deltaY === 0) return true;
    if (deltaY > 0) {
        return el.scrollTop + el.clientHeight < el.scrollHeight;
    } else {
        return el.scrollTop > 0;
    }
};

let touchStartY = 0;
let touchScrollable: HTMLElement | null = null;

const onWheel = (e: WheelEvent) => {
    if (!modalRoot.value) return;
    const target = e.target as Element | null;
    if (!target || !modalRoot.value.contains(target)) {
        e.preventDefault();
        return;
    }
    const scrollable = getScrollableAncestor(target);
    if (!scrollable) {
        e.preventDefault();
        return;
    }
    if (!canScrollBy(scrollable, e.deltaY)) {
        e.preventDefault();
        return;
    }
};

const onTouchStart = (e: TouchEvent) => {
    if (!modalRoot.value) return;
    const t = e.touches[0];
    if (!t) return;
    touchStartY = t.clientY;

    const target = e.target as Element | null;
    if (target && modalRoot.value.contains(target)) {
        touchScrollable = getScrollableAncestor(target);
    } else {
        touchScrollable = null;
    }
};

const onTouchMove = (e: TouchEvent) => {
    if (!modalRoot.value) return;
    const t = e.touches[0];
    if (!t) return;
    const deltaY = touchStartY - t.clientY;

    const target = e.target as Element | null;
    if (!target || !modalRoot.value.contains(target)) {
        e.preventDefault();
        return;
    }

    if (!touchScrollable) {
        e.preventDefault();
        return;
    }

    if (!canScrollBy(touchScrollable, deltaY)) {
        e.preventDefault();
        return;
    }
};

const scrollingKeys = new Set([" ", "PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp"]);

const onKeyDownGlobal = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
        emitClose();
        return;
    }

    if (!modalRoot.value) return;
    if (!scrollingKeys.has(e.key)) return;

    const target = (e.target as Element) || null;
    const tag = (target?.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || (target as HTMLElement)?.isContentEditable) {
        return;
    }

    if (!target || !modalRoot.value.contains(target)) {
        e.preventDefault();
        return;
    }

    const scrollable = getScrollableAncestor(target);
    if (!scrollable) {
        e.preventDefault();
        return;
    }
};

const attachScrollLock = () => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    document.addEventListener("wheel", onWheel, { passive: false, capture: true });
    document.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
    document.addEventListener("keydown", onKeyDownGlobal, { capture: true });
};

const detachScrollLock = () => {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    document.removeEventListener("wheel", onWheel, { capture: true } as any);
    document.removeEventListener("touchstart", onTouchStart, { capture: true } as any);
    document.removeEventListener("touchmove", onTouchMove, { capture: true } as any);
    document.removeEventListener("keydown", onKeyDownGlobal, { capture: true } as any);
};

watch(() => props.enabled, (val) => {
    clearAnimationTimeout();

    if (val) {
        isOpen.value = true;
        animationState.value = "opening";
        attachScrollLock();
        animationTimeout = setTimeout(() => {
            animationTimeout = null;
            if (props.enabled) { animationState.value = "open"; }
        }, 300);
    } else {
        if (!isOpen.value) {
            animationState.value = "closed";
            detachScrollLock();
            return;
        }

        animationState.value = "closing";
        animationTimeout = setTimeout(() => {
            animationTimeout = null;
            if (props.enabled) return;

            isOpen.value = false;
            animationState.value = "closed";
            detachScrollLock();
            emit("closed");
        }, 250);
    }
}, { immediate: true });

const emitClose = () => {
    if (!props.enabled || animationState.value === "closing" || animationState.value === "closed") return;
    emit("close");
};

onUnmounted(() => {
    detachScrollLock();
    clearAnimationTimeout();
});
</script>

<template>
    <Teleport :to="props.teleportTo">
        <div
            v-if="isOpen"
            :class="[$style.modal, containerClassName]"
            :style="containerStyle"
            :data-anim="animationState"
            ref="modalRoot"
        >
            <div
                :class="$style.blurOverlay"
                @click="canBeClosedByClickingOutside ? emitClose() : undefined"
            ></div>

            <div
                :class="[$style.modalContent, modalClassName]"
                :style="modalStyle"
                ref="modalContent"
            >
                <div
                    v-if="showCloseButton"
                    :class="[$style.closeButton, closeButtonClassName]"
                    @click="emitClose"
                ></div>

                <slot />
            </div>
        </div>
    </Teleport>
</template>

<style module>
.modal {
    position: fixed;
    z-index: var(--netuvio-modal-z-index, var(--modal-z-index, 1100));
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    overscroll-behavior: contain;
}

.modal[data-anim="opening"] .blurOverlay {
    animation: closediv-opening 0.3s ease-out forwards;
}

@keyframes closediv-opening {
    0% { opacity: 0; }
    100% { opacity: 1; }
}

.modal[data-anim="opening"] .modalContent {
    animation: modalcontent-opening 0.3s ease-in-out forwards;
}

@keyframes modalcontent-opening {
    0% { transform: translate(-50%, -65%); opacity: 0; }
    100% { transform: translate(-50%, -50%); opacity: 1; }
}

.modal[data-anim="closing"] .blurOverlay {
    animation: closediv-closing 0.25s ease-out forwards;
}

@keyframes closediv-closing {
    0% { opacity: 1; }
    100% { opacity: 0; }
}

.modal[data-anim="closing"] .modalContent {
    animation: modalcontent-closing 0.15s ease-in forwards;
}

@keyframes modalcontent-closing {
    0% { transform: translate(-50%, -50%); opacity: 1; }
    100% { transform: translate(-50%, -80%); opacity: 0; }
}

.modal > .blurOverlay {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 1;
    backdrop-filter: blur(5px) brightness(0.6);
    -webkit-backdrop-filter: blur(5px) brightness(0.6);
}

.modal > .modalContent {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--netuvio-bg, var(--pagebg, var(--element-background, #ffffff)));
    padding: 20px;
    border: 1px solid var(--netuvio-border, var(--element-border-color, var(--border-color, rgba(0, 0, 0, 0.1))));
    border-radius: 24px;
    width: 90vw;
    max-width: 400px;
    min-width: 40px;
    max-height: 90vh;
    min-height: 40px;
    box-shadow: 0 0 6px rgba(0, 0, 0, 0.025);
    overflow: auto;
    -webkit-overflow-scrolling: touch;
}

.modalContent > .closeButton {
    width: 24px;
    height: 24px;
    position: absolute;
    background-color: var(--netuvio-bg-darker, var(--pagebg-darker, rgba(0, 0, 0, 0.06)));
    z-index: 1;
    border-radius: 100%;
    top: 12px;
    right: 12px;
    transition: background-color 0.3s;
    cursor: pointer;
}

.modalContent > .closeButton:hover {
    background-color: var(--netuvio-accent, var(--element-color-accent, rgba(0, 0, 0, 0.12)));
}

.modalContent > .closeButton::before,
.modalContent > .closeButton::after {
    position: absolute;
    content: "";
    top: 50%;
    left: 50%;
    width: 10px;
    height: 2px;
    border-radius: 999px;
    background-color: var(--netuvio-text, var(--text-color, #111111));
}

.modalContent > .closeButton::before {
    transform: translate(-50%, -50%) rotate(45deg);
}

.modalContent > .closeButton::after {
    transform: translate(-50%, -50%) rotate(-45deg);
}

@media (prefers-reduced-motion: reduce) {
    .modal, .modal * {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
    }
}
</style>
