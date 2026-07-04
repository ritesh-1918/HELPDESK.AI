import * as React from 'react';
import type { WarningContextProps } from '../_util/warning';
import type { Locale } from '../locale';
import type { AlertConfig, BadgeConfig, BreadcrumbConfig, ButtonConfig, CardConfig, CardMetaConfig, CascaderConfig, CheckboxConfig, CollapseConfig, ColorPickerConfig, ComponentStyleConfig, ConfigConsumerProps, CSPConfig, DatePickerConfig, DirectionType, DrawerConfig, DropdownConfig, EmptyConfig, FlexConfig, FloatButtonConfig, FloatButtonGroupConfig, FormConfig, ImageConfig, InputConfig, InputNumberConfig, InputSearchConfig, ListConfig, MasonryConfig, MentionsConfig, MenuConfig, MessageConfig, ModalConfig, NotificationConfig, OTPConfig, PaginationConfig, PopconfirmConfig, PopoverConfig, PopupOverflow, ProgressConfig, QRcodeConfig, RadioConfig, RangePickerConfig, RibbonConfig, SelectConfig, SkeletonConfig, SpaceConfig, SpinConfig, SwitchStyleConfig, TableConfig, TabsConfig, TagConfig, TextAreaConfig, ThemeConfig, TimePickerConfig, TooltipConfig, TourConfig, TransferConfig, TreeSelectConfig, UploadConfig, Variant, WaveConfig } from './context';
import { ConfigConsumer, ConfigContext, defaultIconPrefixCls, defaultPrefixCls, Variants } from './context';
import type { RenderEmptyHandler } from './defaultRenderEmpty';
import useConfig from './hooks/useConfig';
import type { SizeType } from './SizeContext';
import SizeContext from './SizeContext';
export type { Variant };
export { Variants };
export declare const warnContext: (componentName: string) => void;
export { ConfigConsumer, type ConfigConsumerProps, ConfigContext, type CSPConfig, defaultIconPrefixCls, defaultPrefixCls, type DirectionType, type RenderEmptyHandler, type ThemeConfig, };
export declare const configConsumerProps: string[];
export interface ConfigProviderProps {
    getTargetContainer?: () => HTMLElement | Window | ShadowRoot;
    getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot;
    prefixCls?: string;
    iconPrefixCls?: string;
    children?: React.ReactNode;
    renderEmpty?: RenderEmptyHandler;
    csp?: CSPConfig;
    /** @deprecated Please use `{ button: { autoInsertSpace: boolean }}` instead */
    autoInsertSpaceInButton?: boolean;
    variant?: Variant;
    form?: FormConfig;
    input?: InputConfig;
    inputSearch?: InputSearchConfig;
    otp?: OTPConfig;
    inputNumber?: InputNumberConfig;
    textArea?: TextAreaConfig;
    select?: SelectConfig;
    pagination?: PaginationConfig;
    /**
     * @descCN 语言包配置，语言包可到 `antd/locale` 目录下寻找。
     * @descEN Language package setting, you can find the packages in `antd/locale`.
     */
    locale?: Locale;
    componentSize?: SizeType;
    componentDisabled?: boolean;
    /**
     * @descCN 设置布局展示方向。
     * @descEN Set direction of layout.
     * @default ltr
     */
    direction?: DirectionType;
    space?: SpaceConfig;
    splitter?: ComponentStyleConfig;
    /**
     * @descCN 设置 `false` 时关闭虚拟滚动。
     * @descEN Close the virtual scrolling when setting `false`.
     * @default true
     */
    virtual?: boolean;
    /** @deprecated Please use `popupMatchSelectWidth` instead */
    dropdownMatchSelectWidth?: boolean;
    popupMatchSelectWidth?: boolean;
    popupOverflow?: PopupOverflow;
    theme?: ThemeConfig;
    warning?: WarningContextProps;
    alert?: AlertConfig;
    affix?: ComponentStyleConfig;
    anchor?: ComponentStyleConfig;
    app?: ComponentStyleConfig;
    button?: ButtonConfig;
    calendar?: ComponentStyleConfig;
    carousel?: ComponentStyleConfig;
    cascader?: CascaderConfig;
    treeSelect?: TreeSelectConfig;
    collapse?: CollapseConfig;
    divider?: ComponentStyleConfig;
    drawer?: DrawerConfig;
    typography?: ComponentStyleConfig;
    skeleton?: SkeletonConfig;
    spin?: SpinConfig;
    segmented?: ComponentStyleConfig;
    statistic?: ComponentStyleConfig;
    steps?: ComponentStyleConfig;
    image?: ImageConfig;
    layout?: ComponentStyleConfig;
    list?: ListConfig;
    mentions?: MentionsConfig;
    modal?: ModalConfig;
    progress?: ProgressConfig;
    result?: ComponentStyleConfig;
    slider?: ComponentStyleConfig;
    masonry?: MasonryConfig;
    breadcrumb?: BreadcrumbConfig;
    menu?: MenuConfig;
    floatButton?: FloatButtonConfig;
    floatButtonGroup?: FloatButtonGroupConfig;
    checkbox?: CheckboxConfig;
    descriptions?: ComponentStyleConfig;
    empty?: EmptyConfig;
    badge?: BadgeConfig;
    radio?: RadioConfig;
    rate?: ComponentStyleConfig;
    ribbon?: RibbonConfig;
    switch?: SwitchStyleConfig;
    transfer?: TransferConfig;
    avatar?: ComponentStyleConfig;
    message?: MessageConfig;
    tag?: TagConfig;
    table?: TableConfig;
    card?: CardConfig;
    cardMeta?: CardMetaConfig;
    tabs?: TabsConfig;
    timeline?: ComponentStyleConfig;
    timePicker?: TimePickerConfig;
    upload?: UploadConfig;
    notification?: NotificationConfig;
    tree?: ComponentStyleConfig;
    colorPicker?: ColorPickerConfig;
    datePicker?: DatePickerConfig;
    rangePicker?: RangePickerConfig;
    dropdown?: DropdownConfig;
    flex?: FlexConfig;
    /**
     * Wave is special component which only patch on the effect of component interaction.
     */
    wave?: WaveConfig;
    tour?: TourConfig;
    tooltip?: TooltipConfig;
    popover?: PopoverConfig;
    popconfirm?: PopconfirmConfig;
    watermark?: ComponentStyleConfig;
    qrcode?: QRcodeConfig;
}
type holderRenderType = (children: React.ReactNode) => React.ReactNode;
declare function getGlobalIconPrefixCls(): string;
export interface GlobalConfigProps {
    prefixCls?: string;
    iconPrefixCls?: string;
    theme?: ThemeConfig;
    holderRender?: holderRenderType;
}
declare const setGlobalConfig: (props: GlobalConfigProps) => void;
export declare const globalConfig: () => {
    getPrefixCls: (suffixCls?: string, customizePrefixCls?: string) => string;
    getIconPrefixCls: typeof getGlobalIconPrefixCls;
    getRootPrefixCls: () => string;
    getTheme: () => ThemeConfig;
    holderRender: holderRenderType | undefined;
};
declare const ConfigProvider: React.FC<ConfigProviderProps> & {
    /** @private internal Usage. do not use in your production */
    ConfigContext: typeof ConfigContext;
    /** @deprecated Please use `ConfigProvider.useConfig().componentSize` instead */
    SizeContext: typeof SizeContext;
    config: typeof setGlobalConfig;
    useConfig: typeof useConfig;
};
export default ConfigProvider;
