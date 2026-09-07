import React, { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import style from "./Modal.module.css";

export interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    closeOnBackdrop?: boolean;
    labelledBy?: string;
    showCloseButton?: boolean;
    closeButtonClassName?: string;
}

export function Modal({
    open,
    onClose,
    children,
    className,
    closeOnBackdrop = true,
    labelledBy,
    showCloseButton = true,
    closeButtonClassName,
}: ModalProps) {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!isHydrated || typeof document === "undefined") return null;

    return createPortal(
        <div
            className={`${style.layer} ${open ? style.open : ""}`}
            aria-hidden={!open}
            onMouseDown={(event) => {
                if (open && closeOnBackdrop && event.target === event.currentTarget) onClose();
            }}
        >
            <div
                className={`${style.content} ${className ?? ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                inert={!open ? true : undefined}
            >
                {showCloseButton && (
                    <button
                        type="button"
                        className={`${style.closeButton} ${closeButtonClassName ?? ""}`}
                        onClick={onClose}
                        aria-label="Zavřít"
                    />
                )}
                {children}
            </div>
        </div>,
        document.body
    );
}

export default Modal;
