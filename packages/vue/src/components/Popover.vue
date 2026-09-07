<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch, useCssModule } from "vue";
import Modal from "./Modal.vue";

const props = withDefaults(defineProps<{
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    trigger?: "click" | "hover";
    wrapperClass?: string;
    canBeHovered?: boolean;
}>(), {
    canBeHovered: false,
});

const isOpen = ref(false);
const isPositionReady = ref(false);
const popoverRef = ref<HTMLDivElement | null>(null);
const triggerRef = ref<HTMLDivElement | null>(null);
const hoverTimeout = ref<number | null>(null);
const popoverStyle = ref<Record<string, string>>({});
const isMobilePopover = ref(false);

const viewportPadding = 12;
const popoverGap = 12;
const userScrollIntentWindowMs = 700;
const mobilePopoverMediaQuery = "(max-width: 768px)";

let lastUserScrollIntentAt = 0;
let isScrollbarDragging = false;
let mobilePopoverMedia: MediaQueryList | null = null;

function clampPosition(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
}

const lockPopoverPosition = () => {
    if (!triggerRef.value || typeof window === "undefined") return;
    if (isMobilePopover.value) {
        popoverStyle.value = {};
        isPositionReady.value = true;
        return;
    }

    const triggerRect = triggerRef.value.getBoundingClientRect();
    const popoverRect = popoverRef.value?.getBoundingClientRect();
    const popoverWidth = popoverRect?.width ?? 256;
    const popoverHeight = popoverRect?.height ?? 0;
    const position = props.position ?? "bottom-right";

    let top = triggerRect.bottom + popoverGap;
    const style: Record<string, string> = {};

    if (position.includes("top")) {
        top = triggerRect.top - popoverHeight - popoverGap;
    }

    style.top = `${clampPosition(top, viewportPadding, window.innerHeight - popoverHeight - viewportPadding)}px`;

    if (position.includes("left")) {
        const maxLeft = Math.max(viewportPadding, window.innerWidth - popoverWidth - viewportPadding);
        style.left = `${clampPosition(triggerRect.left, viewportPadding, maxLeft)}px`;
    } else {
        const maxRight = Math.max(viewportPadding, window.innerWidth - popoverWidth - viewportPadding);
        const right = window.innerWidth - triggerRect.right;
        style.right = `${clampPosition(right, viewportPadding, maxRight)}px`;
    }

    popoverStyle.value = {
        ...style,
        visibility: "visible",
    };
    isPositionReady.value = true;
};

const cancelPopoverClose = () => {
    if (hoverTimeout.value) {
        clearTimeout(hoverTimeout.value);
        hoverTimeout.value = null;
    }
};

const openPopover = () => {
    cancelPopoverClose();
    if (isOpen.value) return;

    isPositionReady.value = false;
    popoverStyle.value = isMobilePopover.value ? {} : { visibility: "hidden" };
    isOpen.value = true;
};

const closePopover = () => {
    cancelPopoverClose();
    isOpen.value = false;
    isPositionReady.value = false;
    detachScrollCloseListeners();
};

const closePopoverDelayed = () => {
    cancelPopoverClose();
    hoverTimeout.value = window.setTimeout(() => {
        hoverTimeout.value = null;
        closePopover();
    }, 200);
};

const togglePopover = () => {
    if (isOpen.value) {
        closePopover();
        return;
    }
    openPopover();
};

const handleClickOutside = (event: MouseEvent) => {
    if (props.trigger === "click" && popoverRef.value && triggerRef.value) {
        const target = event.target as Node;
        if (!popoverRef.value.contains(target) && !triggerRef.value.contains(target)) {
            closePopover();
        }
    }
};

const isPopoverEventTarget = (event: Event) => {
    const target = event.target as Node | null;
    return Boolean(target && popoverRef.value?.contains(target));
};

const markUserScrollIntent = () => {
    lastUserScrollIntentAt = Date.now();
};

const isHTMLElement = (value: unknown): value is HTMLElement => value instanceof HTMLElement;

const isEventOnViewportScrollbar = (event: MouseEvent | PointerEvent) => {
    if (typeof window === "undefined" || typeof document === "undefined") return false;
    const documentElement = document.documentElement;
    const verticalScrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const horizontalScrollbarHeight = window.innerHeight - documentElement.clientHeight;
    const isOnVerticalScrollbar = verticalScrollbarWidth > 0
        && event.clientX >= documentElement.clientWidth
        && event.clientX <= window.innerWidth
        && event.clientY >= 0
        && event.clientY <= window.innerHeight;
    const isOnHorizontalScrollbar = horizontalScrollbarHeight > 0
        && event.clientY >= documentElement.clientHeight
        && event.clientY <= window.innerHeight
        && event.clientX >= 0
        && event.clientX <= window.innerWidth;

    return isOnVerticalScrollbar || isOnHorizontalScrollbar;
};

const isEventOnElementScrollbar = (event: MouseEvent | PointerEvent) => {
    const path = event.composedPath().filter(isHTMLElement);

    return path.some((element) => {
        if (popoverRef.value?.contains(element)) return false;

        const rect = element.getBoundingClientRect();
        const verticalScrollbarWidth = element.offsetWidth - element.clientWidth;
        const horizontalScrollbarHeight = element.offsetHeight - element.clientHeight;
        const hasVerticalScrollbar = verticalScrollbarWidth > 0 && element.scrollHeight > element.clientHeight;
        const hasHorizontalScrollbar = horizontalScrollbarHeight > 0 && element.scrollWidth > element.clientWidth;
        const isOnVerticalScrollbar = hasVerticalScrollbar
            && event.clientX >= rect.right - verticalScrollbarWidth
            && event.clientX <= rect.right
            && event.clientY >= rect.top
            && event.clientY <= rect.bottom;
        const isOnHorizontalScrollbar = hasHorizontalScrollbar
            && event.clientY >= rect.bottom - horizontalScrollbarHeight
            && event.clientY <= rect.bottom
            && event.clientX >= rect.left
            && event.clientX <= rect.right;

        return isOnVerticalScrollbar || isOnHorizontalScrollbar;
    });
};

const handleScrollbarPointerDown = (event: MouseEvent | PointerEvent) => {
    if (isPopoverEventTarget(event)) return;
    if ("button" in event && event.button !== 0) return;
    if (!isEventOnViewportScrollbar(event) && !isEventOnElementScrollbar(event)) return;

    isScrollbarDragging = true;
    lastUserScrollIntentAt = Date.now();
};

const handleScrollbarPointerUp = () => {
    isScrollbarDragging = false;
};

const handleScrollKeyIntent = (event: KeyboardEvent) => {
    if (isPopoverEventTarget(event)) return;

    const scrollKeys = new Set([
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "End",
        "Home",
        "PageDown",
        "PageUp",
        " ",
        "Spacebar",
    ]);

    if (scrollKeys.has(event.key)) {
        lastUserScrollIntentAt = Date.now();
    }
};

const handleScrollClose = (event: Event) => {
    if (isPopoverEventTarget(event)) return;
    if (!isScrollbarDragging && Date.now() - lastUserScrollIntentAt > userScrollIntentWindowMs) return;

    closePopover();
};

const attachScrollCloseListeners = () => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    lastUserScrollIntentAt = 0;
    isScrollbarDragging = false;
    document.addEventListener("wheel", markUserScrollIntent, { capture: true, passive: true });
    document.addEventListener("touchmove", markUserScrollIntent, { capture: true, passive: true });
    document.addEventListener("pointerdown", handleScrollbarPointerDown, true);
    document.addEventListener("mousedown", handleScrollbarPointerDown, true);
    document.addEventListener("keydown", handleScrollKeyIntent, true);
    window.addEventListener("pointerup", handleScrollbarPointerUp, true);
    window.addEventListener("mouseup", handleScrollbarPointerUp, true);
    window.addEventListener("scroll", handleScrollClose, true);
};

const detachScrollCloseListeners = () => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    isScrollbarDragging = false;
    document.removeEventListener("wheel", markUserScrollIntent, true);
    document.removeEventListener("touchmove", markUserScrollIntent, true);
    document.removeEventListener("pointerdown", handleScrollbarPointerDown, true);
    document.removeEventListener("mousedown", handleScrollbarPointerDown, true);
    document.removeEventListener("keydown", handleScrollKeyIntent, true);
    window.removeEventListener("pointerup", handleScrollbarPointerUp, true);
    window.removeEventListener("mouseup", handleScrollbarPointerUp, true);
    window.removeEventListener("scroll", handleScrollClose, true);
};

const handleMouseEnter = () => {
    if (props.trigger === "hover") {
        openPopover();
    }
};

const handlePopoverMouseEnter = () => {
    if (props.trigger !== "hover") return;
    if (props.canBeHovered) {
        openPopover();
        return;
    }
    closePopover();
};

const handleMouseLeave = () => {
    if (props.trigger === "hover") {
        closePopoverDelayed();
    }
};

const handleClick = () => {
    if (props.trigger === "click" || !props.trigger || (props.trigger === "hover" && isMobilePopover.value)) {
        togglePopover();
    }
};

const handleFocusIn = () => {
    if (props.trigger === "hover" && !isMobilePopover.value) {
        openPopover();
    }
};

const handleFocusOut = (event: FocusEvent) => {
    if (props.trigger !== "hover" || isMobilePopover.value) return;

    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && (triggerRef.value?.contains(nextTarget) || popoverRef.value?.contains(nextTarget))) {
        return;
    }

    closePopoverDelayed();
};

const syncMobilePopover = () => {
    isMobilePopover.value = Boolean(mobilePopoverMedia?.matches);
};

onMounted(() => {
    if (typeof window !== "undefined") {
        mobilePopoverMedia = window.matchMedia(mobilePopoverMediaQuery);
        syncMobilePopover();
        mobilePopoverMedia.addEventListener("change", syncMobilePopover);
    }

    if (props.trigger === "click" || !props.trigger) {
        document.addEventListener("click", handleClickOutside);
    }
});

onUnmounted(() => {
    mobilePopoverMedia?.removeEventListener("change", syncMobilePopover);
    mobilePopoverMedia = null;

    if (typeof document !== "undefined") {
        document.removeEventListener("click", handleClickOutside);
    }
    detachScrollCloseListeners();
    cancelPopoverClose();
});

watch(isOpen, async (open) => {
    if (!open) {
        detachScrollCloseListeners();
        return;
    }

    await nextTick();

    if (isMobilePopover.value) {
        isPositionReady.value = true;
        popoverStyle.value = {};
        detachScrollCloseListeners();
        return;
    }

    lockPopoverPosition();
    attachScrollCloseListeners();
});

watch(isMobilePopover, async (mobile) => {
    if (!isOpen.value) return;

    await nextTick();

    if (mobile) {
        popoverStyle.value = {};
        isPositionReady.value = true;
        detachScrollCloseListeners();
        return;
    }

    isPositionReady.value = false;
    popoverStyle.value = { visibility: "hidden" };
    lockPopoverPosition();
    attachScrollCloseListeners();
});

const $style = useCssModule();
</script>

<template>
    <div :class="$style.popoverWrapper + (props.wrapperClass ? ' ' + props.wrapperClass : '')">
        <div 
            ref="triggerRef" 
            :class="$style.trigger"
            @click="handleClick"
            @mouseenter="handleMouseEnter"
            @mouseleave="handleMouseLeave"
            @focusin="handleFocusIn"
            @focusout="handleFocusOut"
        >
            <slot name="trigger"></slot>
        </div>

        <Teleport to="body">
            <Modal
                v-if="isMobilePopover"
                :enabled="isOpen"
                :container-class-name="$style.mobilePopoverModal"
                :modal-class-name="$style.mobilePopoverContent"
                :close-button-class-name="$style.mobilePopoverClose"
                @close="closePopover"
            >
                <div ref="popoverRef" :class="$style.mobilePopoverBody">
                    <slot name="content"></slot>
                </div>
            </Modal>

            <Transition
                v-else
                :enter-active-class="$style.popoverFadeEnterActive"
                :enter-from-class="$style.popoverFadeEnterFrom"
                :leave-active-class="$style.popoverFadeLeaveActive"
                :leave-to-class="$style.popoverFadeLeaveTo"
            >
                <div
                    v-if="isOpen"
                    ref="popoverRef"
                    :class="[$style.popover, $style[position || 'bottom-right']]"
                    :style="popoverStyle"
                    :data-position-ready="isPositionReady"
                    @mouseenter="handlePopoverMouseEnter"
                    @mouseleave="handleMouseLeave"
                >
                    <slot name="content"></slot>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<style module>
.popoverWrapper {
    position: relative;
    display: inline-block;
}

.trigger {
    cursor: pointer;
    display: flex;
    align-items: center;
}

.popover {
    position: fixed;
    background-color: var(--netuvio-popover-bg, var(--background-color-secondary, var(--background-color-2, #ffffff)));
    border-radius: 20px;
    padding: 12px;
    min-width: 256px;
    z-index: var(--netuvio-popover-z-index, var(--popover-z-index, 1000));
    box-shadow: 0 18px 54px rgba(0, 0, 0, 0.18);
    border: 1px solid var(--netuvio-border, var(--element-border-color, var(--border-color, rgba(0, 0, 0, 0.1))));
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

.mobilePopoverModal {
    z-index: var(--netuvio-popover-z-index, var(--popover-z-index, 1000)) !important;
}

.mobilePopoverContent {
    width: calc(100vw - 32px) !important;
    max-width: 520px !important;
    max-height: min(680px, calc(100dvh - 48px)) !important;
    padding: 18px !important;
}

.mobilePopoverClose {
    top: 14px !important;
    right: 14px !important;
}

.mobilePopoverBody {
    width: 100%;
    max-width: 100%;
    padding-top: 24px;
}

.mobilePopoverBody > * {
    width: 100% !important;
    max-width: 100% !important;
    max-height: calc(100dvh - 132px) !important;
    box-sizing: border-box;
}

.popoverFadeEnterActive,
.popoverFadeLeaveActive {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.popoverFadeEnterFrom,
.popoverFadeLeaveTo {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
}
</style>
