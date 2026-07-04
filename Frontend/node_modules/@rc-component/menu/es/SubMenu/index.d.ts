import * as React from 'react';
import type { SubMenuType, PopupRender } from '../interface';
export type SemanticName = 'list' | 'listTitle';
export interface SubMenuProps extends Omit<SubMenuType, 'key' | 'children' | 'label'> {
    classNames?: Partial<Record<SemanticName, string>>;
    styles?: Partial<Record<SemanticName, React.CSSProperties>>;
    title?: React.ReactNode;
    children?: React.ReactNode;
    /** @private Used for rest popup. Do not use in your prod */
    internalPopupClose?: boolean;
    /** @private Internal filled key. Do not set it directly */
    eventKey?: string;
    /** @private Do not use. Private warning empty usage */
    warnKey?: boolean;
    popupRender?: PopupRender;
}
declare const SubMenu: React.ForwardRefExoticComponent<Omit<SubMenuProps, "ref"> & React.RefAttributes<HTMLLIElement>>;
export default SubMenu;
