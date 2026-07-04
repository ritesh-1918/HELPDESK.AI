import type { CSSObject } from '@ant-design/cssinjs';
import type { SelectToken } from '../../select/style/token';
/**
 * Get multiple selector needed style. The calculation:
 *
 * ContainerPadding = BasePadding - ItemMargin
 *
 * Border:                    ╔═══════════════════════════╗                 ┬
 * ContainerPadding:          ║                           ║                 │
 *                            ╟───────────────────────────╢     ┬           │
 * Item Margin:               ║                           ║     │           │
 *                            ║             ┌──────────┐  ║     │           │
 * Item(multipleItemHeight):  ║ BasePadding │   Item   │  ║  Overflow  Container(ControlHeight)
 *                            ║             └──────────┘  ║     │           │
 * Item Margin:               ║                           ║     │           │
 *                            ╟───────────────────────────╢     ┴           │
 * ContainerPadding:          ║                           ║                 │
 * Border:                    ╚═══════════════════════════╝                 ┴
 */
export declare const getMultipleSelectorUnit: (token: Pick<SelectToken, "max" | "calc" | "multipleSelectItemHeight" | "paddingXXS" | "lineWidth" | "INTERNAL_FIXED_ITEM_MARGIN">) => {
    basePadding: string | number;
    containerPadding: string | number;
    itemHeight: string;
    itemLineHeight: string;
};
/**
 * Get the `@rc-component/overflow` needed style.
 * It's a share style which means not affected by `size`.
 */
export declare const genOverflowStyle: (token: Pick<SelectToken, "calc" | "componentCls" | "iconCls" | "borderRadiusSM" | "motionDurationSlow" | "paddingXS" | "multipleItemColorDisabled" | "multipleItemBorderColorDisabled" | "colorIcon" | "colorIconHover" | "INTERNAL_FIXED_ITEM_MARGIN">) => CSSObject;
