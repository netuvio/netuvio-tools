import React, { Children, isValidElement, ReactElement, ReactNode } from "react";

export type SwitchOwnProps = {
    children?: ReactNode;
};

export type CaseOwnProps = {
    when: boolean;
    children?: ReactNode;
};

export type DefaultOwnProps = {
    children?: ReactNode;
};

type PolymorphicProps<T extends React.ElementType, TOwnProps = {}> =
    TOwnProps & {
        as?: T;
    } & Omit<React.ComponentPropsWithoutRef<T>, keyof TOwnProps | "as">;

export type CaseProps<T extends React.ElementType = React.ElementType> = PolymorphicProps<T, CaseOwnProps>;
export type DefaultProps<T extends React.ElementType = React.ElementType> = PolymorphicProps<T, DefaultOwnProps>;
export type SwitchProps<T extends React.ElementType = React.ElementType> = PolymorphicProps<T, SwitchOwnProps>;

export function Case<T extends React.ElementType = React.ElementType>({ children }: CaseProps<T>) {
    return <>{children}</>;
}

export function Default<T extends React.ElementType = React.ElementType>({ children }: DefaultProps<T>) {
    return <>{children}</>;
}

function isCaseElement(
    element: ReactNode
): element is ReactElement<CaseProps<any>, typeof Case> {
    return isValidElement(element) && element.type === Case;
}

function isDefaultElement(
    element: ReactNode
): element is ReactElement<DefaultProps<any>, typeof Default> {
    return isValidElement(element) && element.type === Default;
}

function renderWithWrapper(
    content: ReactNode,
    Component?: React.ElementType,
    props?: Record<string, unknown>
) {
    const Wrapper = Component ?? React.Fragment;

    if (Wrapper === React.Fragment) {
        return <>{content}</>;
    }

    return <Wrapper {...props}>{content}</Wrapper>;
}

export function Switch<T extends React.ElementType = React.ElementType>({
    children,
    as,
    ...restProps
}: SwitchProps<T>) {
    const childrenArray = Children.toArray(children);

    let matchedContent: ReactNode = null;

    for (const child of childrenArray) {
        if (isDefaultElement(child)) {
            const {
                children: defaultChildren,
                as: defaultAs,
                ...defaultRestProps
            } = child.props;

            matchedContent = renderWithWrapper(
                defaultChildren,
                defaultAs,
                defaultRestProps as Record<string, unknown>
            );

            continue;
        }

        if (isCaseElement(child) && child.props.when) {
            const {
                children: caseChildren,
                when: _when,
                as: caseAs,
                ...caseRestProps
            } = child.props;

            matchedContent = renderWithWrapper(
                caseChildren,
                caseAs,
                caseRestProps as Record<string, unknown>
            );

            break;
        }
    }

    return renderWithWrapper(
        matchedContent,
        as,
        restProps as Record<string, unknown>
    );
}

export default Switch;
