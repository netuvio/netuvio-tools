import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export interface TeleportProps {
    children?: React.ReactNode;
    to?: string | HTMLElement | null;
}

export function Teleport({ children, to = "teleports" }: TeleportProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || typeof document === "undefined") {
        return null;
    }

    let targetElement: HTMLElement | null = null;
    if (typeof to === "string") {
        targetElement = document.getElementById(to) || (document.querySelector(to) as HTMLElement | null);
    } else if (to) {
        targetElement = to;
    } else {
        targetElement = document.body;
    }

    if (!targetElement) {
        return null;
    }

    return createPortal(children, targetElement);
}

export default Teleport;
