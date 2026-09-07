import React from "react";

export type IfOwnProps<T extends React.ElementType = React.ElementType> = {
    condition: boolean;
    fallback?: React.ReactNode;
    children?: React.ReactNode;
    as?: T;
};

export type IfProps<T extends React.ElementType = typeof React.Fragment> =
    IfOwnProps<T> &
    Omit<React.ComponentPropsWithoutRef<T>, keyof IfOwnProps<T>>;

export function If<T extends React.ElementType = typeof React.Fragment>({
    condition,
    children,
    fallback = null,
    as,
    ...restProps
}: IfProps<T>) {
    const Component = as ?? React.Fragment;

    if (Component === React.Fragment) {
        return condition ? <>{children}</> : <>{fallback}</>;
    }

    return condition ? <Component {...restProps}>{children}</Component> : <>{fallback}</>;
}

export default If;
