import type { DirectionType } from '../config-provider';
import type { TooltipProps } from '../tooltip';
import type { MenuPopupSemanticClassNames, MenuPopupSemanticStyles, MenuSemanticClassNames, MenuSemanticStyles, SubMenuSemanticClassNames, SubMenuSemanticStyles } from './menu';
export type MenuTheme = 'light' | 'dark';
export interface MenuContextProps {
    prefixCls: string;
    inlineCollapsed: boolean;
    direction?: DirectionType;
    theme?: MenuTheme;
    firstLevel: boolean;
    tooltip?: false | TooltipProps;
    classNames?: MenuSemanticClassNames & {
        popup?: MenuPopupSemanticClassNames;
        subMenu?: SubMenuSemanticClassNames;
    };
    styles?: MenuSemanticStyles & {
        popup?: MenuPopupSemanticStyles;
        subMenu?: SubMenuSemanticStyles;
    };
}
declare const MenuContext: import("react").Context<MenuContextProps>;
export default MenuContext;
