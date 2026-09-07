import type { App } from "vue";

import SmoothSizeWrapper from "./components/SmoothSizeWrapper.vue";
import Modal from "./components/Modal.vue";
import Popover from "./components/Popover.vue";
import TypewriterText from "./components/TypewriterText.vue";
import WrittenText from "./components/WrittenText.vue";
import Avatar from "./components/Avatar.vue";
import ProgressiveImage from "./components/ProgressiveImage.vue";
import SmoothConditionalSize from "./components/SmoothConditionalSize.vue";
import ClientOnly from "./components/ClientOnly.vue";

export {
    SmoothSizeWrapper,
    Modal,
    Popover,
    TypewriterText,
    WrittenText,
    Avatar,
    ProgressiveImage,
    SmoothConditionalSize,
    ClientOnly,
};

export type { ResizePayload } from "./components/SmoothSizeWrapper.vue";
export type { AvatarProps } from "./components/Avatar.vue";
export type { ProgressiveImageProps } from "./components/ProgressiveImage.vue";

export * from "./utils/getHslFromText";
export * from "./utils/useIsHydrated";

export const NetuvioTools = {
    install(app: App) {
        app.component("SmoothSizeWrapper", SmoothSizeWrapper);
        app.component("Modal", Modal);
        app.component("Popover", Popover);
        app.component("TypewriterText", TypewriterText);
        app.component("WrittenText", WrittenText);
        app.component("Avatar", Avatar);
        app.component("ProgressiveImage", ProgressiveImage);
        app.component("SmoothConditionalSize", SmoothConditionalSize);
        app.component("ClientOnly", ClientOnly);
    },
};

export default NetuvioTools;
