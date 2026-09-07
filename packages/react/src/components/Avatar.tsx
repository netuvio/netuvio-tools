import React, { useMemo } from "react";
import styles from "./Avatar.module.css";
import { getHslFromText } from "../utils/getHslFromText";

export interface AvatarProps {
    name: string;
    size?: string | number;
    src?: string | null;
    className?: string;
    background?: string;
    alt?: string;
    style?: React.CSSProperties;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export function Avatar({
    size = "16px",
    src,
    className,
    background,
    name,
    alt = "avatar",
    style,
    onClick,
}: AvatarProps) {
    const computedSize = typeof size === "number" ? `${size}px` : size;

    const computedBackground = useMemo(() => {
        if (background) return background;
        return getHslFromText(name || "");
    }, [background, name]);

    const letter = useMemo(() => {
        if (!name?.trim()) return "";
        return name
            .trim()
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }, [name]);

    const containerStyle: React.CSSProperties = {
        background: !src ? computedBackground : "transparent",
        ["--size" as any]: computedSize,
        ...style,
    };

    return (
        <div
            onClick={onClick}
            className={`${styles.avatar}${className ? ` ${className}` : ""}`}
            style={containerStyle}
        >
            {src ? (
                <img className={styles.image} src={src} alt={alt} />
            ) : (
                <p className={styles.letter}>{letter}</p>
            )}
        </div>
    );
}

export default Avatar;
