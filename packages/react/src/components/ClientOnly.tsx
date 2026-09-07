import React, { ReactNode, useEffect, useState } from "react";

export interface ClientOnlyProps {
    children: ReactNode;
    fallback?: ReactNode | null;
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

export default ClientOnly;
