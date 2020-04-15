import { c as createElement, C as Component, P as PureComponent, R as React, a as Children, b as cloneElement } from './source.production-86e2832f.js';
import { c as createCommonjsModule, a as commonjsGlobal, p as propTypes, u as unwrapExports } from './index-ed166f27.js';
import { c as cx } from './index-330529d6.js';

/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** Alignment along the horizontal axis. */
var Alignment = {
    CENTER: "center",
    LEFT: "left",
    RIGHT: "right",
};

/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// tslint:disable:object-literal-sort-keys
var Elevation = {
    ZERO: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
};

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// tslint:disable:object-literal-sort-keys
/**
 * The four basic intents.
 */
var Intent = {
    NONE: "none",
    PRIMARY: "primary",
    SUCCESS: "success",
    WARNING: "warning",
    DANGER: "danger",
};

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Position = {
    BOTTOM: "bottom",
    BOTTOM_LEFT: "bottom-left",
    BOTTOM_RIGHT: "bottom-right",
    LEFT: "left",
    LEFT_BOTTOM: "left-bottom",
    LEFT_TOP: "left-top",
    RIGHT: "right",
    RIGHT_BOTTOM: "right-bottom",
    RIGHT_TOP: "right-top",
    TOP: "top",
    TOP_LEFT: "top-left",
    TOP_RIGHT: "top-right",
};
function isPositionHorizontal(position) {
    /* istanbul ignore next */
    return (position === Position.TOP ||
        position === Position.TOP_LEFT ||
        position === Position.TOP_RIGHT ||
        position === Position.BOTTOM ||
        position === Position.BOTTOM_LEFT ||
        position === Position.BOTTOM_RIGHT);
}
function isPositionVertical(position) {
    /* istanbul ignore next */
    return (position === Position.LEFT ||
        position === Position.LEFT_TOP ||
        position === Position.LEFT_BOTTOM ||
        position === Position.RIGHT ||
        position === Position.RIGHT_TOP ||
        position === Position.RIGHT_BOTTOM);
}
function getPositionIgnoreAngles(position) {
    if (position === Position.TOP ||
        position === Position.TOP_LEFT ||
        position === Position.TOP_RIGHT) {
        return Position.TOP;
    }
    else if (position === Position.BOTTOM ||
        position === Position.BOTTOM_LEFT ||
        position === Position.BOTTOM_RIGHT) {
        return Position.BOTTOM;
    }
    else if (position === Position.LEFT ||
        position === Position.LEFT_TOP ||
        position === Position.LEFT_BOTTOM) {
        return Position.LEFT;
    }
    else {
        return Position.RIGHT;
    }
}

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var NS =  "bp3";
// modifiers
var ACTIVE = NS + "-active";
var ALIGN_LEFT = NS + "-align-left";
var ALIGN_RIGHT = NS + "-align-right";
var DARK = NS + "-dark";
var DISABLED = NS + "-disabled";
var FILL = NS + "-fill";
var FIXED = NS + "-fixed";
var FIXED_TOP = NS + "-fixed-top";
var INLINE = NS + "-inline";
var INTERACTIVE = NS + "-interactive";
var LARGE = NS + "-large";
var LOADING = NS + "-loading";
var MINIMAL = NS + "-minimal";
var MULTILINE = NS + "-multiline";
var ROUND = NS + "-round";
var SMALL = NS + "-small";
var VERTICAL = NS + "-vertical";
var POSITION_TOP = positionClass(Position.TOP);
var POSITION_BOTTOM = positionClass(Position.BOTTOM);
var POSITION_LEFT = positionClass(Position.LEFT);
var POSITION_RIGHT = positionClass(Position.RIGHT);
var ELEVATION_0 = elevationClass(Elevation.ZERO);
var ELEVATION_1 = elevationClass(Elevation.ONE);
var ELEVATION_2 = elevationClass(Elevation.TWO);
var ELEVATION_3 = elevationClass(Elevation.THREE);
var ELEVATION_4 = elevationClass(Elevation.FOUR);
var INTENT_PRIMARY = intentClass(Intent.PRIMARY);
var INTENT_SUCCESS = intentClass(Intent.SUCCESS);
var INTENT_WARNING = intentClass(Intent.WARNING);
var INTENT_DANGER = intentClass(Intent.DANGER);
var FOCUS_DISABLED = NS + "-focus-disabled";
// text utilities
var UI_TEXT = NS + "-ui-text";
var RUNNING_TEXT = NS + "-running-text";
var MONOSPACE_TEXT = NS + "-monospace-text";
var TEXT_LARGE = NS + "-text-large";
var TEXT_SMALL = NS + "-text-small";
var TEXT_MUTED = NS + "-text-muted";
var TEXT_DISABLED = NS + "-text-disabled";
var TEXT_OVERFLOW_ELLIPSIS = NS + "-text-overflow-ellipsis";
// textual elements
var BLOCKQUOTE = NS + "-blockquote";
var CODE = NS + "-code";
var CODE_BLOCK = NS + "-code-block";
var HEADING = NS + "-heading";
var LIST = NS + "-list";
var LIST_UNSTYLED = NS + "-list-unstyled";
var RTL = NS + "-rtl";
// components
var ALERT = NS + "-alert";
var ALERT_BODY = ALERT + "-body";
var ALERT_CONTENTS = ALERT + "-contents";
var ALERT_FOOTER = ALERT + "-footer";
var BREADCRUMB = NS + "-breadcrumb";
var BREADCRUMB_CURRENT = BREADCRUMB + "-current";
var BREADCRUMBS = BREADCRUMB + "s";
var BREADCRUMBS_COLLAPSED = BREADCRUMB + "s-collapsed";
var BUTTON = NS + "-button";
var BUTTON_GROUP = BUTTON + "-group";
var BUTTON_SPINNER = BUTTON + "-spinner";
var BUTTON_TEXT = BUTTON + "-text";
var CALLOUT = NS + "-callout";
var CALLOUT_ICON = CALLOUT + "-icon";
var CARD = NS + "-card";
var COLLAPSE = NS + "-collapse";
var COLLAPSE_BODY = COLLAPSE + "-body";
var COLLAPSIBLE_LIST = NS + "-collapse-list";
var CONTEXT_MENU = NS + "-context-menu";
var CONTEXT_MENU_POPOVER_TARGET = CONTEXT_MENU + "-popover-target";
var CONTROL_GROUP = NS + "-control-group";
var DIALOG = NS + "-dialog";
var DIALOG_CONTAINER = DIALOG + "-container";
var DIALOG_BODY = DIALOG + "-body";
var DIALOG_CLOSE_BUTTON = DIALOG + "-close-button";
var DIALOG_FOOTER = DIALOG + "-footer";
var DIALOG_FOOTER_ACTIONS = DIALOG + "-footer-actions";
var DIALOG_HEADER = DIALOG + "-header";
var DIVIDER = NS + "-divider";
var DRAWER = NS + "-drawer";
var DRAWER_BODY = DRAWER + "-body";
var DRAWER_FOOTER = DRAWER + "-footer";
var DRAWER_HEADER = DRAWER + "-header";
var EDITABLE_TEXT = NS + "-editable-text";
var EDITABLE_TEXT_CONTENT = EDITABLE_TEXT + "-content";
var EDITABLE_TEXT_EDITING = EDITABLE_TEXT + "-editing";
var EDITABLE_TEXT_INPUT = EDITABLE_TEXT + "-input";
var EDITABLE_TEXT_PLACEHOLDER = EDITABLE_TEXT + "-placeholder";
var FLEX_EXPANDER = NS + "-flex-expander";
var HTML_SELECT = NS + "-html-select";
/** @deprecated prefer `<HTMLSelect>` component */
var SELECT = NS + "-select";
var HTML_TABLE = NS + "-html-table";
var HTML_TABLE_BORDERED = HTML_TABLE + "-bordered";
var HTML_TABLE_CONDENSED = HTML_TABLE + "-condensed";
var HTML_TABLE_STRIPED = HTML_TABLE + "-striped";
var INPUT = NS + "-input";
var INPUT_GHOST = INPUT + "-ghost";
var INPUT_GROUP = INPUT + "-group";
var INPUT_ACTION = INPUT + "-action";
var CONTROL = NS + "-control";
var CONTROL_INDICATOR = CONTROL + "-indicator";
var CONTROL_INDICATOR_CHILD = CONTROL_INDICATOR + "-child";
var CHECKBOX = NS + "-checkbox";
var RADIO = NS + "-radio";
var SWITCH = NS + "-switch";
var SWITCH_INNER_TEXT = SWITCH + "-inner-text";
var FILE_INPUT = NS + "-file-input";
var FILE_INPUT_HAS_SELECTION = NS + "-file-input-has-selection";
var FILE_UPLOAD_INPUT = NS + "-file-upload-input";
var FILE_UPLOAD_INPUT_CUSTOM_TEXT = NS + "-file-upload-input-custom-text";
var KEY = NS + "-key";
var KEY_COMBO = KEY + "-combo";
var MODIFIER_KEY = NS + "-modifier-key";
var HOTKEY = NS + "-hotkey";
var HOTKEY_LABEL = HOTKEY + "-label";
var HOTKEY_COLUMN = HOTKEY + "-column";
var HOTKEY_DIALOG = HOTKEY + "-dialog";
var LABEL = NS + "-label";
var FORM_GROUP = NS + "-form-group";
var FORM_CONTENT = NS + "-form-content";
var FORM_HELPER_TEXT = NS + "-form-helper-text";
var MENU = NS + "-menu";
var MENU_ITEM = MENU + "-item";
var MENU_ITEM_LABEL = MENU_ITEM + "-label";
var MENU_SUBMENU = NS + "-submenu";
var MENU_DIVIDER = MENU + "-divider";
var MENU_HEADER = MENU + "-header";
var NAVBAR = NS + "-navbar";
var NAVBAR_GROUP = NAVBAR + "-group";
var NAVBAR_HEADING = NAVBAR + "-heading";
var NAVBAR_DIVIDER = NAVBAR + "-divider";
var NON_IDEAL_STATE = NS + "-non-ideal-state";
var NON_IDEAL_STATE_VISUAL = NON_IDEAL_STATE + "-visual";
var NUMERIC_INPUT = NS + "-numeric-input";
var OVERFLOW_LIST = NS + "-overflow-list";
var OVERFLOW_LIST_SPACER = OVERFLOW_LIST + "-spacer";
var OVERLAY = NS + "-overlay";
var OVERLAY_BACKDROP = OVERLAY + "-backdrop";
var OVERLAY_CONTAINER = OVERLAY + "-container";
var OVERLAY_CONTENT = OVERLAY + "-content";
var OVERLAY_INLINE = OVERLAY + "-inline";
var OVERLAY_OPEN = OVERLAY + "-open";
var OVERLAY_SCROLL_CONTAINER = OVERLAY + "-scroll-container";
var PANEL_STACK = NS + "-panel-stack";
var PANEL_STACK_HEADER = PANEL_STACK + "-header";
var PANEL_STACK_HEADER_BACK = PANEL_STACK + "-header-back";
var PANEL_STACK_VIEW = PANEL_STACK + "-view";
var POPOVER = NS + "-popover";
var POPOVER_ARROW = POPOVER + "-arrow";
var POPOVER_BACKDROP = POPOVER + "-backdrop";
var POPOVER_CONTENT = POPOVER + "-content";
var POPOVER_CONTENT_SIZING = POPOVER_CONTENT + "-sizing";
var POPOVER_DISMISS = POPOVER + "-dismiss";
var POPOVER_DISMISS_OVERRIDE = POPOVER_DISMISS + "-override";
var POPOVER_OPEN = POPOVER + "-open";
var POPOVER_TARGET = POPOVER + "-target";
var POPOVER_WRAPPER = POPOVER + "-wrapper";
var TRANSITION_CONTAINER = NS + "-transition-container";
var PROGRESS_BAR = NS + "-progress-bar";
var PROGRESS_METER = NS + "-progress-meter";
var PROGRESS_NO_STRIPES = NS + "-no-stripes";
var PROGRESS_NO_ANIMATION = NS + "-no-animation";
var PORTAL = NS + "-portal";
var SKELETON = NS + "-skeleton";
var SLIDER = NS + "-slider";
var SLIDER_AXIS = SLIDER + "-axis";
var SLIDER_HANDLE = SLIDER + "-handle";
var SLIDER_LABEL = SLIDER + "-label";
var SLIDER_TRACK = SLIDER + "-track";
var SLIDER_PROGRESS = SLIDER + "-progress";
var START = NS + "-start";
var END = NS + "-end";
var SPINNER = NS + "-spinner";
var SPINNER_ANIMATION = SPINNER + "-animation";
var SPINNER_HEAD = SPINNER + "-head";
var SPINNER_NO_SPIN = NS + "-no-spin";
var SPINNER_TRACK = SPINNER + "-track";
var TAB = NS + "-tab";
var TAB_INDICATOR = TAB + "-indicator";
var TAB_INDICATOR_WRAPPER = TAB_INDICATOR + "-wrapper";
var TAB_LIST = TAB + "-list";
var TAB_PANEL = TAB + "-panel";
var TABS = TAB + "s";
var TAG = NS + "-tag";
var TAG_REMOVE = TAG + "-remove";
var TAG_INPUT = NS + "-tag-input";
var TAG_INPUT_ICON = TAG_INPUT + "-icon";
var TAG_INPUT_VALUES = TAG_INPUT + "-values";
var TOAST = NS + "-toast";
var TOAST_CONTAINER = TOAST + "-container";
var TOAST_MESSAGE = TOAST + "-message";
var TOOLTIP = NS + "-tooltip";
var TOOLTIP_INDICATOR = TOOLTIP + "-indicator";
var TREE = NS + "-tree";
var TREE_NODE = NS + "-tree-node";
var TREE_NODE_CARET = TREE_NODE + "-caret";
var TREE_NODE_CARET_CLOSED = TREE_NODE_CARET + "-closed";
var TREE_NODE_CARET_NONE = TREE_NODE_CARET + "-none";
var TREE_NODE_CARET_OPEN = TREE_NODE_CARET + "-open";
var TREE_NODE_CONTENT = TREE_NODE + "-content";
var TREE_NODE_EXPANDED = TREE_NODE + "-expanded";
var TREE_NODE_ICON = TREE_NODE + "-icon";
var TREE_NODE_LABEL = TREE_NODE + "-label";
var TREE_NODE_LIST = TREE_NODE + "-list";
var TREE_NODE_SECONDARY_LABEL = TREE_NODE + "-secondary-label";
var TREE_NODE_SELECTED = TREE_NODE + "-selected";
var TREE_ROOT = NS + "-tree-root";
var ICON = NS + "-icon";
var ICON_STANDARD = ICON + "-standard";
var ICON_LARGE = ICON + "-large";
/**
 * Returns the namespace prefix for all Blueprint CSS classes.
 * Customize this namespace at build time with the `({}).BLUEPRINT_NAMESPACE` environment variable.
 */
function getClassNamespace() {
    return NS;
}
/** Return CSS class for alignment. */
function alignmentClass(alignment) {
    switch (alignment) {
        case Alignment.LEFT:
            return ALIGN_LEFT;
        case Alignment.RIGHT:
            return ALIGN_RIGHT;
        default:
            return undefined;
    }
}
function elevationClass(elevation) {
    if (elevation == null) {
        return undefined;
    }
    return NS + "-elevation-" + elevation;
}
/** Returns CSS class for icon name. */
function iconClass(iconName) {
    if (iconName == null) {
        return undefined;
    }
    return iconName.indexOf(NS + "-icon-") === 0 ? iconName : NS + "-icon-" + iconName;
}
/** Return CSS class for intent. */
function intentClass(intent) {
    if (intent == null || intent === Intent.NONE) {
        return undefined;
    }
    return NS + "-intent-" + intent.toLowerCase();
}
function positionClass(position) {
    if (position == null) {
        return undefined;
    }
    return NS + "-position-" + position;
}

var classes = /*#__PURE__*/Object.freeze({
    __proto__: null,
    ACTIVE: ACTIVE,
    ALIGN_LEFT: ALIGN_LEFT,
    ALIGN_RIGHT: ALIGN_RIGHT,
    DARK: DARK,
    DISABLED: DISABLED,
    FILL: FILL,
    FIXED: FIXED,
    FIXED_TOP: FIXED_TOP,
    INLINE: INLINE,
    INTERACTIVE: INTERACTIVE,
    LARGE: LARGE,
    LOADING: LOADING,
    MINIMAL: MINIMAL,
    MULTILINE: MULTILINE,
    ROUND: ROUND,
    SMALL: SMALL,
    VERTICAL: VERTICAL,
    POSITION_TOP: POSITION_TOP,
    POSITION_BOTTOM: POSITION_BOTTOM,
    POSITION_LEFT: POSITION_LEFT,
    POSITION_RIGHT: POSITION_RIGHT,
    ELEVATION_0: ELEVATION_0,
    ELEVATION_1: ELEVATION_1,
    ELEVATION_2: ELEVATION_2,
    ELEVATION_3: ELEVATION_3,
    ELEVATION_4: ELEVATION_4,
    INTENT_PRIMARY: INTENT_PRIMARY,
    INTENT_SUCCESS: INTENT_SUCCESS,
    INTENT_WARNING: INTENT_WARNING,
    INTENT_DANGER: INTENT_DANGER,
    FOCUS_DISABLED: FOCUS_DISABLED,
    UI_TEXT: UI_TEXT,
    RUNNING_TEXT: RUNNING_TEXT,
    MONOSPACE_TEXT: MONOSPACE_TEXT,
    TEXT_LARGE: TEXT_LARGE,
    TEXT_SMALL: TEXT_SMALL,
    TEXT_MUTED: TEXT_MUTED,
    TEXT_DISABLED: TEXT_DISABLED,
    TEXT_OVERFLOW_ELLIPSIS: TEXT_OVERFLOW_ELLIPSIS,
    BLOCKQUOTE: BLOCKQUOTE,
    CODE: CODE,
    CODE_BLOCK: CODE_BLOCK,
    HEADING: HEADING,
    LIST: LIST,
    LIST_UNSTYLED: LIST_UNSTYLED,
    RTL: RTL,
    ALERT: ALERT,
    ALERT_BODY: ALERT_BODY,
    ALERT_CONTENTS: ALERT_CONTENTS,
    ALERT_FOOTER: ALERT_FOOTER,
    BREADCRUMB: BREADCRUMB,
    BREADCRUMB_CURRENT: BREADCRUMB_CURRENT,
    BREADCRUMBS: BREADCRUMBS,
    BREADCRUMBS_COLLAPSED: BREADCRUMBS_COLLAPSED,
    BUTTON: BUTTON,
    BUTTON_GROUP: BUTTON_GROUP,
    BUTTON_SPINNER: BUTTON_SPINNER,
    BUTTON_TEXT: BUTTON_TEXT,
    CALLOUT: CALLOUT,
    CALLOUT_ICON: CALLOUT_ICON,
    CARD: CARD,
    COLLAPSE: COLLAPSE,
    COLLAPSE_BODY: COLLAPSE_BODY,
    COLLAPSIBLE_LIST: COLLAPSIBLE_LIST,
    CONTEXT_MENU: CONTEXT_MENU,
    CONTEXT_MENU_POPOVER_TARGET: CONTEXT_MENU_POPOVER_TARGET,
    CONTROL_GROUP: CONTROL_GROUP,
    DIALOG: DIALOG,
    DIALOG_CONTAINER: DIALOG_CONTAINER,
    DIALOG_BODY: DIALOG_BODY,
    DIALOG_CLOSE_BUTTON: DIALOG_CLOSE_BUTTON,
    DIALOG_FOOTER: DIALOG_FOOTER,
    DIALOG_FOOTER_ACTIONS: DIALOG_FOOTER_ACTIONS,
    DIALOG_HEADER: DIALOG_HEADER,
    DIVIDER: DIVIDER,
    DRAWER: DRAWER,
    DRAWER_BODY: DRAWER_BODY,
    DRAWER_FOOTER: DRAWER_FOOTER,
    DRAWER_HEADER: DRAWER_HEADER,
    EDITABLE_TEXT: EDITABLE_TEXT,
    EDITABLE_TEXT_CONTENT: EDITABLE_TEXT_CONTENT,
    EDITABLE_TEXT_EDITING: EDITABLE_TEXT_EDITING,
    EDITABLE_TEXT_INPUT: EDITABLE_TEXT_INPUT,
    EDITABLE_TEXT_PLACEHOLDER: EDITABLE_TEXT_PLACEHOLDER,
    FLEX_EXPANDER: FLEX_EXPANDER,
    HTML_SELECT: HTML_SELECT,
    SELECT: SELECT,
    HTML_TABLE: HTML_TABLE,
    HTML_TABLE_BORDERED: HTML_TABLE_BORDERED,
    HTML_TABLE_CONDENSED: HTML_TABLE_CONDENSED,
    HTML_TABLE_STRIPED: HTML_TABLE_STRIPED,
    INPUT: INPUT,
    INPUT_GHOST: INPUT_GHOST,
    INPUT_GROUP: INPUT_GROUP,
    INPUT_ACTION: INPUT_ACTION,
    CONTROL: CONTROL,
    CONTROL_INDICATOR: CONTROL_INDICATOR,
    CONTROL_INDICATOR_CHILD: CONTROL_INDICATOR_CHILD,
    CHECKBOX: CHECKBOX,
    RADIO: RADIO,
    SWITCH: SWITCH,
    SWITCH_INNER_TEXT: SWITCH_INNER_TEXT,
    FILE_INPUT: FILE_INPUT,
    FILE_INPUT_HAS_SELECTION: FILE_INPUT_HAS_SELECTION,
    FILE_UPLOAD_INPUT: FILE_UPLOAD_INPUT,
    FILE_UPLOAD_INPUT_CUSTOM_TEXT: FILE_UPLOAD_INPUT_CUSTOM_TEXT,
    KEY: KEY,
    KEY_COMBO: KEY_COMBO,
    MODIFIER_KEY: MODIFIER_KEY,
    HOTKEY: HOTKEY,
    HOTKEY_LABEL: HOTKEY_LABEL,
    HOTKEY_COLUMN: HOTKEY_COLUMN,
    HOTKEY_DIALOG: HOTKEY_DIALOG,
    LABEL: LABEL,
    FORM_GROUP: FORM_GROUP,
    FORM_CONTENT: FORM_CONTENT,
    FORM_HELPER_TEXT: FORM_HELPER_TEXT,
    MENU: MENU,
    MENU_ITEM: MENU_ITEM,
    MENU_ITEM_LABEL: MENU_ITEM_LABEL,
    MENU_SUBMENU: MENU_SUBMENU,
    MENU_DIVIDER: MENU_DIVIDER,
    MENU_HEADER: MENU_HEADER,
    NAVBAR: NAVBAR,
    NAVBAR_GROUP: NAVBAR_GROUP,
    NAVBAR_HEADING: NAVBAR_HEADING,
    NAVBAR_DIVIDER: NAVBAR_DIVIDER,
    NON_IDEAL_STATE: NON_IDEAL_STATE,
    NON_IDEAL_STATE_VISUAL: NON_IDEAL_STATE_VISUAL,
    NUMERIC_INPUT: NUMERIC_INPUT,
    OVERFLOW_LIST: OVERFLOW_LIST,
    OVERFLOW_LIST_SPACER: OVERFLOW_LIST_SPACER,
    OVERLAY: OVERLAY,
    OVERLAY_BACKDROP: OVERLAY_BACKDROP,
    OVERLAY_CONTAINER: OVERLAY_CONTAINER,
    OVERLAY_CONTENT: OVERLAY_CONTENT,
    OVERLAY_INLINE: OVERLAY_INLINE,
    OVERLAY_OPEN: OVERLAY_OPEN,
    OVERLAY_SCROLL_CONTAINER: OVERLAY_SCROLL_CONTAINER,
    PANEL_STACK: PANEL_STACK,
    PANEL_STACK_HEADER: PANEL_STACK_HEADER,
    PANEL_STACK_HEADER_BACK: PANEL_STACK_HEADER_BACK,
    PANEL_STACK_VIEW: PANEL_STACK_VIEW,
    POPOVER: POPOVER,
    POPOVER_ARROW: POPOVER_ARROW,
    POPOVER_BACKDROP: POPOVER_BACKDROP,
    POPOVER_CONTENT: POPOVER_CONTENT,
    POPOVER_CONTENT_SIZING: POPOVER_CONTENT_SIZING,
    POPOVER_DISMISS: POPOVER_DISMISS,
    POPOVER_DISMISS_OVERRIDE: POPOVER_DISMISS_OVERRIDE,
    POPOVER_OPEN: POPOVER_OPEN,
    POPOVER_TARGET: POPOVER_TARGET,
    POPOVER_WRAPPER: POPOVER_WRAPPER,
    TRANSITION_CONTAINER: TRANSITION_CONTAINER,
    PROGRESS_BAR: PROGRESS_BAR,
    PROGRESS_METER: PROGRESS_METER,
    PROGRESS_NO_STRIPES: PROGRESS_NO_STRIPES,
    PROGRESS_NO_ANIMATION: PROGRESS_NO_ANIMATION,
    PORTAL: PORTAL,
    SKELETON: SKELETON,
    SLIDER: SLIDER,
    SLIDER_AXIS: SLIDER_AXIS,
    SLIDER_HANDLE: SLIDER_HANDLE,
    SLIDER_LABEL: SLIDER_LABEL,
    SLIDER_TRACK: SLIDER_TRACK,
    SLIDER_PROGRESS: SLIDER_PROGRESS,
    START: START,
    END: END,
    SPINNER: SPINNER,
    SPINNER_ANIMATION: SPINNER_ANIMATION,
    SPINNER_HEAD: SPINNER_HEAD,
    SPINNER_NO_SPIN: SPINNER_NO_SPIN,
    SPINNER_TRACK: SPINNER_TRACK,
    TAB: TAB,
    TAB_INDICATOR: TAB_INDICATOR,
    TAB_INDICATOR_WRAPPER: TAB_INDICATOR_WRAPPER,
    TAB_LIST: TAB_LIST,
    TAB_PANEL: TAB_PANEL,
    TABS: TABS,
    TAG: TAG,
    TAG_REMOVE: TAG_REMOVE,
    TAG_INPUT: TAG_INPUT,
    TAG_INPUT_ICON: TAG_INPUT_ICON,
    TAG_INPUT_VALUES: TAG_INPUT_VALUES,
    TOAST: TOAST,
    TOAST_CONTAINER: TOAST_CONTAINER,
    TOAST_MESSAGE: TOAST_MESSAGE,
    TOOLTIP: TOOLTIP,
    TOOLTIP_INDICATOR: TOOLTIP_INDICATOR,
    TREE: TREE,
    TREE_NODE: TREE_NODE,
    TREE_NODE_CARET: TREE_NODE_CARET,
    TREE_NODE_CARET_CLOSED: TREE_NODE_CARET_CLOSED,
    TREE_NODE_CARET_NONE: TREE_NODE_CARET_NONE,
    TREE_NODE_CARET_OPEN: TREE_NODE_CARET_OPEN,
    TREE_NODE_CONTENT: TREE_NODE_CONTENT,
    TREE_NODE_EXPANDED: TREE_NODE_EXPANDED,
    TREE_NODE_ICON: TREE_NODE_ICON,
    TREE_NODE_LABEL: TREE_NODE_LABEL,
    TREE_NODE_LIST: TREE_NODE_LIST,
    TREE_NODE_SECONDARY_LABEL: TREE_NODE_SECONDARY_LABEL,
    TREE_NODE_SELECTED: TREE_NODE_SELECTED,
    TREE_ROOT: TREE_ROOT,
    ICON: ICON,
    ICON_STANDARD: ICON_STANDARD,
    ICON_LARGE: ICON_LARGE,
    getClassNamespace: getClassNamespace,
    alignmentClass: alignmentClass,
    elevationClass: elevationClass,
    iconClass: iconClass,
    intentClass: intentClass,
    positionClass: positionClass
});

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
}

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ns = "[Blueprint]";
var CLAMP_MIN_MAX = ns + " clamp: max cannot be less than min";
var ALERT_WARN_CANCEL_PROPS = ns + " <Alert> cancelButtonText and onCancel should be set together.";
var ALERT_WARN_CANCEL_ESCAPE_KEY = ns + " <Alert> canEscapeKeyCancel enabled without onCancel or onClose handler.";
var ALERT_WARN_CANCEL_OUTSIDE_CLICK = ns + " <Alert> canOutsideClickCancel enbaled without onCancel or onClose handler.";
var COLLAPSIBLE_LIST_INVALID_CHILD = ns + " <CollapsibleList> children must be <MenuItem>s";
var CONTEXTMENU_WARN_DECORATOR_NO_METHOD = ns + " @ContextMenuTarget-decorated class should implement renderContextMenu.";
var CONTEXTMENU_WARN_DECORATOR_NEEDS_REACT_ELEMENT = ns + " \"@ContextMenuTarget-decorated components must return a single JSX.Element or an empty render.";
var HOTKEYS_HOTKEY_CHILDREN = ns + " <Hotkeys> only accepts <Hotkey> children.";
var HOTKEYS_WARN_DECORATOR_NO_METHOD = ns + " @HotkeysTarget-decorated class should implement renderHotkeys.";
var HOTKEYS_WARN_DECORATOR_NEEDS_REACT_ELEMENT = ns + " \"@HotkeysTarget-decorated components must return a single JSX.Element or an empty render.";
var NUMERIC_INPUT_MIN_MAX = ns + " <NumericInput> requires min to be no greater than max if both are defined.";
var NUMERIC_INPUT_MINOR_STEP_SIZE_BOUND = ns + " <NumericInput> requires minorStepSize to be no greater than stepSize.";
var NUMERIC_INPUT_MAJOR_STEP_SIZE_BOUND = ns + " <NumericInput> requires stepSize to be no greater than majorStepSize.";
var NUMERIC_INPUT_MINOR_STEP_SIZE_NON_POSITIVE = ns + " <NumericInput> requires minorStepSize to be strictly greater than zero.";
var NUMERIC_INPUT_MAJOR_STEP_SIZE_NON_POSITIVE = ns + " <NumericInput> requires majorStepSize to be strictly greater than zero.";
var NUMERIC_INPUT_STEP_SIZE_NON_POSITIVE = ns + " <NumericInput> requires stepSize to be strictly greater than zero.";
var NUMERIC_INPUT_STEP_SIZE_NULL = ns + " <NumericInput> requires stepSize to be defined.";
var PANEL_STACK_INITIAL_PANEL_STACK_MUTEX = ns + " <PanelStack> requires exactly one of initialPanel and stack prop";
var PANEL_STACK_REQUIRES_PANEL = ns + " <PanelStack> requires at least one panel in the stack";
var OVERFLOW_LIST_OBSERVE_PARENTS_CHANGED = ns + " <OverflowList> does not support changing observeParents after mounting.";
// TODO (clewis): Migrate old Popover validation errors to the component formerly known as Popover2.
// See: https://github.com/palantir/blueprint/issues/1940
var POPOVER_REQUIRES_TARGET = ns + " <Popover> requires target prop or at least one child element.";
var POPOVER_HAS_BACKDROP_INTERACTION = ns + " <Popover hasBackdrop={true}> requires interactionKind={PopoverInteractionKind.CLICK}.";
var POPOVER_WARN_TOO_MANY_CHILDREN = ns +
    " <Popover> supports one or two children; additional children are ignored." +
    " First child is the target, second child is the content. You may instead supply these two as props.";
var POPOVER_WARN_DOUBLE_CONTENT = ns + " <Popover> with two children ignores content prop; use either prop or children.";
var POPOVER_WARN_DOUBLE_TARGET = ns + " <Popover> with children ignores target prop; use either prop or children.";
var POPOVER_WARN_EMPTY_CONTENT = ns + " Disabling <Popover> with empty/whitespace content...";
var POPOVER_WARN_HAS_BACKDROP_INLINE = ns + " <Popover usePortal={false}> ignores hasBackdrop";
var POPOVER_WARN_UNCONTROLLED_ONINTERACTION = ns + " <Popover> onInteraction is ignored when uncontrolled.";
var PORTAL_CONTEXT_CLASS_NAME_STRING = ns + " <Portal> context blueprintPortalClassName must be string";
var RADIOGROUP_WARN_CHILDREN_OPTIONS_MUTEX = ns + " <RadioGroup> children and options prop are mutually exclusive, with options taking priority.";
var SLIDER_ZERO_STEP = ns + " <Slider> stepSize must be greater than zero.";
var SLIDER_ZERO_LABEL_STEP = ns + " <Slider> labelStepSize must be greater than zero.";
var RANGESLIDER_NULL_VALUE = ns + " <RangeSlider> value prop must be an array of two non-null numbers.";
var MULTISLIDER_INVALID_CHILD = ns + " <MultiSlider> children must be <SliderHandle>s or <SliderTrackStop>s";
var SPINNER_WARN_CLASSES_SIZE = ns + " <Spinner> Classes.SMALL/LARGE are ignored if size prop is set.";
var TOASTER_CREATE_NULL = ns +
    " Toaster.create() is not supported inside React lifecycle methods in React 16." +
    " See usage example on the docs site.";
var TOASTER_WARN_INLINE = ns + " Toaster.create() ignores inline prop as it always creates a new element.";
var DIALOG_WARN_NO_HEADER_ICON = ns + " <Dialog> iconName is ignored if title is omitted.";
var DIALOG_WARN_NO_HEADER_CLOSE_BUTTON = ns + " <Dialog> isCloseButtonShown prop is ignored if title is omitted.";
var DRAWER_VERTICAL_IS_IGNORED = ns + " <Drawer> vertical is ignored if position is defined";
var DRAWER_ANGLE_POSITIONS_ARE_CASTED = ns + " <Drawer> all angle positions are casted into pure position (TOP, BOTTOM, LEFT or RIGHT)";
var TOASTER_MAX_TOASTS_INVALID = ns + " <Toaster> maxToasts is set to an invalid number, must be greater than 0";

/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Returns true if the arrays are equal. Elements will be shallowly compared by
 * default, or they will be compared using the custom `compare` function if one
 * is provided.
 */
function arraysEqual(arrA, arrB, compare) {
    if (compare === void 0) { compare = function (a, b) { return a === b; }; }
    // treat `null` and `undefined` as the same
    if (arrA == null && arrB == null) {
        return true;
    }
    else if (arrA == null || arrB == null || arrA.length !== arrB.length) {
        return false;
    }
    else {
        return arrA.every(function (a, i) { return compare(a, arrB[i]); });
    }
}
/**
 * Shallow comparison between objects. If `keys` is provided, just that subset
 * of keys will be compared; otherwise, all keys will be compared.
 * @returns true if items are equal.
 */
function shallowCompareKeys(objA, objB, keys) {
    // treat `null` and `undefined` as the same
    if (objA == null && objB == null) {
        return true;
    }
    else if (objA == null || objB == null) {
        return false;
    }
    else if (Array.isArray(objA) || Array.isArray(objB)) {
        return false;
    }
    else if (keys != null) {
        return _shallowCompareKeys(objA, objB, keys);
    }
    else {
        // shallowly compare all keys from both objects
        var keysA = Object.keys(objA);
        var keysB = Object.keys(objB);
        return (_shallowCompareKeys(objA, objB, { include: keysA }) && _shallowCompareKeys(objA, objB, { include: keysB }));
    }
}
/**
 * Deep comparison between objects. If `keys` is provided, just that subset of
 * keys will be compared; otherwise, all keys will be compared.
 * @returns true if items are equal.
 */
function deepCompareKeys(objA, objB, keys) {
    if (objA === objB) {
        return true;
    }
    else if (objA == null && objB == null) {
        // treat `null` and `undefined` as the same
        return true;
    }
    else if (objA == null || objB == null) {
        return false;
    }
    else if (Array.isArray(objA) || Array.isArray(objB)) {
        return arraysEqual(objA, objB, deepCompareKeys);
    }
    else if (_isSimplePrimitiveType(objA) || _isSimplePrimitiveType(objB)) {
        return objA === objB;
    }
    else if (keys != null) {
        return _deepCompareKeys(objA, objB, keys);
    }
    else if (objA.constructor !== objB.constructor) {
        return false;
    }
    else {
        var keysA = Object.keys(objA);
        var keysB = Object.keys(objB);
        if (keysA == null || keysB == null) {
            return false;
        }
        if (keysA.length === 0 && keysB.length === 0) {
            return true;
        }
        return arraysEqual(keysA, keysB) && _deepCompareKeys(objA, objB, keysA);
    }
}
/**
 * Returns a descriptive object for each key whose values are deeply unequal
 * between two provided objects. Useful for debugging shouldComponentUpdate.
 */
function getDeepUnequalKeyValues(objA, objB, keys) {
    if (objA === void 0) { objA = {}; }
    if (objB === void 0) { objB = {}; }
    var filteredKeys = keys == null ? _unionKeys(objA, objB) : keys;
    return _getUnequalKeyValues(objA, objB, filteredKeys, function (a, b, key) {
        return deepCompareKeys(a, b, [key]);
    });
}
// Private helpers
// ===============
/**
 * Partial shallow comparison between objects using the given list of keys.
 */
function _shallowCompareKeys(objA, objB, keys) {
    return _filterKeys(objA, objB, keys).every(function (key) {
        return objA.hasOwnProperty(key) === objB.hasOwnProperty(key) && objA[key] === objB[key];
    });
}
/**
 * Partial deep comparison between objects using the given list of keys.
 */
function _deepCompareKeys(objA, objB, keys) {
    return keys.every(function (key) {
        return objA.hasOwnProperty(key) === objB.hasOwnProperty(key) && deepCompareKeys(objA[key], objB[key]);
    });
}
function _isSimplePrimitiveType(value) {
    return typeof value === "number" || typeof value === "string" || typeof value === "boolean";
}
function _filterKeys(objA, objB, keys) {
    if (_isWhitelist(keys)) {
        return keys.include;
    }
    else if (_isBlacklist(keys)) {
        var keysA = Object.keys(objA);
        var keysB = Object.keys(objB);
        // merge keys from both objects into a big set for quick access
        var keySet_1 = _arrayToObject(keysA.concat(keysB));
        // delete blacklisted keys from the key set
        keys.exclude.forEach(function (key) { return delete keySet_1[key]; });
        // return the remaining keys as an array
        return Object.keys(keySet_1);
    }
    return [];
}
function _isWhitelist(keys) {
    return keys != null && keys.include != null;
}
function _isBlacklist(keys) {
    return keys != null && keys.exclude != null;
}
function _arrayToObject(arr) {
    return arr.reduce(function (obj, element) {
        obj[element] = true;
        return obj;
    }, {});
}
function _getUnequalKeyValues(objA, objB, keys, compareFn) {
    var unequalKeys = keys.filter(function (key) { return !compareFn(objA, objB, key); });
    var unequalKeyValues = unequalKeys.map(function (key) { return ({
        key: key,
        valueA: objA[key],
        valueB: objB[key],
    }); });
    return unequalKeyValues;
}
function _unionKeys(objA, objB) {
    var keysA = Object.keys(objA);
    var keysB = Object.keys(objB);
    var concatKeys = keysA.concat(keysB);
    var keySet = _arrayToObject(concatKeys);
    return Object.keys(keySet);
}

/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// tslint:disable-next-line:ban-types
function safeInvokeMember(obj, key) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (obj != null) {
        var member = obj[key];
        if (isFunction(member)) {
            return member.apply(void 0, args);
        }
    }
    return undefined;
}

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** Returns whether `"development"` exists and equals `env`. */
function isNodeEnv(env) {
    return typeof process !== "undefined" && process.env && "development" === env;
}
/** Returns whether the value is a function. Acts as a type guard. */
// tslint:disable-next-line:ban-types
function isFunction(value) {
    return typeof value === "function";
}
/**
 * Returns true if `node` is null/undefined, false, empty string, or an array
 * composed of those. If `node` is an array, only one level of the array is
 * checked, for performance reasons.
 */
function isReactNodeEmpty(node, skipArray) {
    if (skipArray === void 0) { skipArray = false; }
    return (node == null ||
        node === "" ||
        node === false ||
        (!skipArray &&
            Array.isArray(node) &&
            // only recurse one level through arrays, for performance
            (node.length === 0 || node.every(function (n) { return isReactNodeEmpty(n, true); }))));
}
/**
 * Converts a React node to an element: non-empty string or number or
 * `React.Fragment` (React 16.3+) is wrapped in given tag name; empty strings
 * and booleans are discarded.
 */
function ensureElement(child, tagName) {
    if (tagName === void 0) { tagName = "span"; }
    if (child == null || typeof child === "boolean") {
        return undefined;
    }
    else if (typeof child === "string") {
        // cull whitespace strings
        return child.trim().length > 0 ? createElement(tagName, {}, child) : undefined;
    }
    else if (typeof child === "number" || typeof child.type === "symbol" || Array.isArray(child)) {
        // React.Fragment has a symbol type, ReactNodeArray extends from Array
        return createElement(tagName, {}, child);
    }
    else if (isReactElement(child)) {
        return child;
    }
    else {
        // child is inferred as {}
        return undefined;
    }
}
function isReactElement(child) {
    return (typeof child === "object" &&
        typeof child.type !== "undefined" &&
        typeof child.props !== "undefined");
}
function getDisplayName(ComponentClass) {
    return ComponentClass.displayName || ComponentClass.name || "Unknown";
}
/**
 * Returns true if the given JSX element matches the given component type.
 *
 * NOTE: This function only checks equality of `displayName` for performance and
 * to tolerate multiple minor versions of a component being included in one
 * application bundle.
 * @param element JSX element in question
 * @param ComponentType desired component type of element
 */
function isElementOfType(element, ComponentType) {
    return (element != null &&
        element.type != null &&
        element.type.displayName != null &&
        element.type.displayName === ComponentType.displayName);
}
// tslint:disable-next-line:ban-types
function safeInvoke(func) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (isFunction(func)) {
        return func.apply(void 0, args);
    }
    return undefined;
}
// tslint:disable-next-line:ban-types
function safeInvokeOrValue(funcOrValue) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return isFunction(funcOrValue) ? funcOrValue.apply(void 0, args) : funcOrValue;
}
function elementIsOrContains(element, testElement) {
    return element === testElement || element.contains(testElement);
}
/**
 * Returns the difference in length between two arrays. A `null` argument is
 * considered an empty list. The return value will be positive if `a` is longer
 * than `b`, negative if the opposite is true, and zero if their lengths are
 * equal.
 */
function arrayLengthCompare(a, b) {
    if (a === void 0) { a = []; }
    if (b === void 0) { b = []; }
    return a.length - b.length;
}
/**
 * Returns true if the two numbers are within the given tolerance of each other.
 * This is useful to correct for floating point precision issues, less useful
 * for integers.
 */
function approxEqual(a, b, tolerance) {
    if (tolerance === void 0) { tolerance = 0.00001; }
    return Math.abs(a - b) <= tolerance;
}
/**
 * Clamps the given number between min and max values. Returns value if within
 * range, or closest bound.
 */
function clamp(val, min, max) {
    if (val == null) {
        return val;
    }
    if (max < min) {
        throw new Error(CLAMP_MIN_MAX);
    }
    return Math.min(Math.max(val, min), max);
}
/** Returns the number of decimal places in the given number. */
function countDecimalPlaces(num) {
    if (!isFinite(num)) {
        return 0;
    }
    var e = 1, p = 0;
    while (Math.round(num * e) / e !== num) {
        e *= 10;
        p++;
    }
    return p;
}
/**
 * Throttle an event on an EventTarget by wrapping it in a
 * `requestAnimationFrame` call. Returns the event handler that was bound to
 * given eventName so you can clean up after yourself.
 * @see https://developer.mozilla.org/en-US/docs/Web/Events/scroll
 */
function throttleEvent(target, eventName, newEventName) {
    var throttledFunc = _throttleHelper(function (event) {
        target.dispatchEvent(new CustomEvent(newEventName, event));
    });
    target.addEventListener(eventName, throttledFunc);
    return throttledFunc;
}
/**
 * Throttle a callback by wrapping it in a `requestAnimationFrame` call. Returns
 * the throttled function.
 * @see https://www.html5rocks.com/en/tutorials/speed/animations/
 */
function throttleReactEventCallback(callback, options) {
    if (options === void 0) { options = {}; }
    var throttledFunc = _throttleHelper(callback, function (event2) {
        if (options.preventDefault) {
            event2.preventDefault();
        }
    }, 
    // prevent React from reclaiming the event object before we reference it
    function (event2) { return event2.persist(); });
    return throttledFunc;
}
/**
 * Throttle a method by wrapping it in a `requestAnimationFrame` call. Returns
 * the throttled function.
 */
// tslint:disable-next-line:ban-types
function throttle(method) {
    return _throttleHelper(method);
}
// tslint:disable-next-line:ban-types
function _throttleHelper(onAnimationFrameRequested, onBeforeIsRunningCheck, onAfterIsRunningCheck) {
    var isRunning = false;
    var func = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // don't use safeInvoke, because we might have more than its max number
        // of typed params
        if (isFunction(onBeforeIsRunningCheck)) {
            onBeforeIsRunningCheck.apply(void 0, args);
        }
        if (isRunning) {
            return;
        }
        isRunning = true;
        if (isFunction(onAfterIsRunningCheck)) {
            onAfterIsRunningCheck.apply(void 0, args);
        }
        requestAnimationFrame(function () {
            onAnimationFrameRequested.apply(void 0, args);
            isRunning = false;
        });
    };
    return func;
}

var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    isNodeEnv: isNodeEnv,
    isFunction: isFunction,
    isReactNodeEmpty: isReactNodeEmpty,
    ensureElement: ensureElement,
    isReactElement: isReactElement,
    getDisplayName: getDisplayName,
    isElementOfType: isElementOfType,
    safeInvoke: safeInvoke,
    safeInvokeOrValue: safeInvokeOrValue,
    elementIsOrContains: elementIsOrContains,
    arrayLengthCompare: arrayLengthCompare,
    approxEqual: approxEqual,
    clamp: clamp,
    countDecimalPlaces: countDecimalPlaces,
    throttleEvent: throttleEvent,
    throttleReactEventCallback: throttleReactEventCallback,
    throttle: throttle,
    arraysEqual: arraysEqual,
    shallowCompareKeys: shallowCompareKeys,
    deepCompareKeys: deepCompareKeys,
    getDeepUnequalKeyValues: getDeepUnequalKeyValues,
    safeInvokeMember: safeInvokeMember
});

/*
 * Copyright 2019 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An abstract component that Blueprint components can extend
 * in order to add some common functionality like runtime props validation.
 */
var AbstractComponent2 = /** @class */ (function (_super) {
    __extends(AbstractComponent2, _super);
    function AbstractComponent2(props, context) {
        var _this = _super.call(this, props, context) || this;
        // Not bothering to remove entries when their timeouts finish because clearing invalid ID is a no-op
        _this.timeoutIds = [];
        /**
         * Clear all known timeouts.
         */
        _this.clearTimeouts = function () {
            if (_this.timeoutIds.length > 0) {
                for (var _i = 0, _a = _this.timeoutIds; _i < _a.length; _i++) {
                    var timeoutId = _a[_i];
                    window.clearTimeout(timeoutId);
                }
                _this.timeoutIds = [];
            }
        };
        if (!isNodeEnv("production")) {
            _this.validateProps(_this.props);
        }
        return _this;
    }
    AbstractComponent2.prototype.componentDidUpdate = function (_prevProps, _prevState, _snapshot) {
        if (!isNodeEnv("production")) {
            this.validateProps(this.props);
        }
    };
    AbstractComponent2.prototype.componentWillUnmount = function () {
        this.clearTimeouts();
    };
    /**
     * Set a timeout and remember its ID.
     * All stored timeouts will be cleared when component unmounts.
     * @returns a "cancel" function that will clear timeout when invoked.
     */
    AbstractComponent2.prototype.setTimeout = function (callback, timeout) {
        var handle = window.setTimeout(callback, timeout);
        this.timeoutIds.push(handle);
        return function () { return window.clearTimeout(handle); };
    };
    /**
     * Ensures that the props specified for a component are valid.
     * Implementations should check that props are valid and usually throw an Error if they are not.
     * Implementations should not duplicate checks that the type system already guarantees.
     *
     * This method should be used instead of React's
     * [propTypes](https://facebook.github.io/react/docs/reusable-components.html#prop-validation) feature.
     * Like propTypes, these runtime checks run only in development mode.
     */
    AbstractComponent2.prototype.validateProps = function (_props) {
        // implement in subclass
    };
    return AbstractComponent2;
}(Component));

/*
 * Copyright 2019 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * An abstract component that Blueprint components can extend
 * in order to add some common functionality like runtime props validation.
 */
var AbstractPureComponent2 = /** @class */ (function (_super) {
    __extends(AbstractPureComponent2, _super);
    function AbstractPureComponent2(props, context) {
        var _this = _super.call(this, props, context) || this;
        // Not bothering to remove entries when their timeouts finish because clearing invalid ID is a no-op
        _this.timeoutIds = [];
        /**
         * Clear all known timeouts.
         */
        _this.clearTimeouts = function () {
            if (_this.timeoutIds.length > 0) {
                for (var _i = 0, _a = _this.timeoutIds; _i < _a.length; _i++) {
                    var timeoutId = _a[_i];
                    window.clearTimeout(timeoutId);
                }
                _this.timeoutIds = [];
            }
        };
        if (!isNodeEnv("production")) {
            _this.validateProps(_this.props);
        }
        return _this;
    }
    AbstractPureComponent2.prototype.componentDidUpdate = function (_prevProps, _prevState, _snapshot) {
        if (!isNodeEnv("production")) {
            this.validateProps(this.props);
        }
    };
    AbstractPureComponent2.prototype.componentWillUnmount = function () {
        this.clearTimeouts();
    };
    /**
     * Set a timeout and remember its ID.
     * All stored timeouts will be cleared when component unmounts.
     * @returns a "cancel" function that will clear timeout when invoked.
     */
    AbstractPureComponent2.prototype.setTimeout = function (callback, timeout) {
        var handle = window.setTimeout(callback, timeout);
        this.timeoutIds.push(handle);
        return function () { return window.clearTimeout(handle); };
    };
    /**
     * Ensures that the props specified for a component are valid.
     * Implementations should check that props are valid and usually throw an Error if they are not.
     * Implementations should not duplicate checks that the type system already guarantees.
     *
     * This method should be used instead of React's
     * [propTypes](https://facebook.github.io/react/docs/reusable-components.html#prop-validation) feature.
     * Like propTypes, these runtime checks run only in development mode.
     */
    AbstractPureComponent2.prototype.validateProps = function (_props) {
        // implement in subclass
    };
    return AbstractPureComponent2;
}(PureComponent));

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var DISPLAYNAME_PREFIX = "Blueprint3";
/** A collection of curated prop keys used across our Components which are not valid HTMLElement props. */
var INVALID_PROPS = [
    "active",
    "alignText",
    "containerRef",
    "elementRef",
    "fill",
    "icon",
    "inputRef",
    "intent",
    "inline",
    "large",
    "loading",
    "leftIcon",
    "minimal",
    "onChildrenMount",
    "onRemove",
    "panel",
    "panelClassName",
    "popoverProps",
    "rightElement",
    "rightIcon",
    "round",
    "small",
    "text",
];
/**
 * Typically applied to HTMLElements to filter out blacklisted props. When applied to a Component,
 * can filter props from being passed down to the children. Can also filter by a combined list of
 * supplied prop keys and the blacklist (only appropriate for HTMLElements).
 * @param props The original props object to filter down.
 * @param {string[]} invalidProps If supplied, overwrites the default blacklist.
 * @param {boolean} shouldMerge If true, will merge supplied invalidProps and blacklist together.
 */
function removeNonHTMLProps(props, invalidProps, shouldMerge) {
    if (invalidProps === void 0) { invalidProps = INVALID_PROPS; }
    if (shouldMerge === void 0) { shouldMerge = false; }
    if (shouldMerge) {
        invalidProps = invalidProps.concat(INVALID_PROPS);
    }
    return invalidProps.reduce(function (prev, curr) {
        if (prev.hasOwnProperty(curr)) {
            delete prev[curr];
        }
        return prev;
    }, __assign({}, props));
}

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var BACKSPACE = 8;
var TAB$1 = 9;
var ENTER = 13;
var SHIFT = 16;
var ESCAPE = 27;
var SPACE = 32;
var ARROW_LEFT = 37;
var ARROW_UP = 38;
var ARROW_RIGHT = 39;
var ARROW_DOWN = 40;
var DELETE = 46;
/** Returns whether the key code is `enter` or `space`, the two keys that can click a button. */
function isKeyboardClick(keyCode) {
    return keyCode === ENTER || keyCode === SPACE;
}

var keys = /*#__PURE__*/Object.freeze({
    __proto__: null,
    BACKSPACE: BACKSPACE,
    TAB: TAB$1,
    ENTER: ENTER,
    SHIFT: SHIFT,
    ESCAPE: ESCAPE,
    SPACE: SPACE,
    ARROW_LEFT: ARROW_LEFT,
    ARROW_UP: ARROW_UP,
    ARROW_RIGHT: ARROW_RIGHT,
    ARROW_DOWN: ARROW_DOWN,
    DELETE: DELETE,
    isKeyboardClick: isKeyboardClick
});

/*!
Copyright (C) 2013-2015 by Andrea Giammarchi - @WebReflection

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
(function(window){  /* jshint loopfunc: true, noempty: false*/
  // http://www.w3.org/TR/dom/#element

  function createDocumentFragment() {
    return document.createDocumentFragment();
  }

  function createElement(nodeName) {
    return document.createElement(nodeName);
  }

  function enoughArguments(length, name) {
    if (!length) throw new Error(
      'Failed to construct ' +
        name +
      ': 1 argument required, but only 0 present.'
    );
  }

  function mutationMacro(nodes) {
    if (nodes.length === 1) {
      return textNodeIfPrimitive(nodes[0]);
    }
    for (var
      fragment = createDocumentFragment(),
      list = slice.call(nodes),
      i = 0; i < nodes.length; i++
    ) {
      fragment.appendChild(textNodeIfPrimitive(list[i]));
    }
    return fragment;
  }

  function textNodeIfPrimitive(node) {
    return typeof node === 'object' ? node : document.createTextNode(node);
  }

  for(var
    head,
    property,
    TemporaryPrototype,
    TemporaryTokenList,
    wrapVerifyToken,
    document = window.document,
    hOP = Object.prototype.hasOwnProperty,
    defineProperty = Object.defineProperty || function (object, property, descriptor) {
      if (hOP.call(descriptor, 'value')) {
        object[property] = descriptor.value;
      } else {
        if (hOP.call(descriptor, 'get'))
          object.__defineGetter__(property, descriptor.get);
        if (hOP.call(descriptor, 'set'))
          object.__defineSetter__(property, descriptor.set);
      }
      return object;
    },
    indexOf = [].indexOf || function indexOf(value){
      var length = this.length;
      while(length--) {
        if (this[length] === value) {
          break;
        }
      }
      return length;
    },
    // http://www.w3.org/TR/domcore/#domtokenlist
    verifyToken = function (token) {
      if (!token) {
        throw 'SyntaxError';
      } else if (spaces.test(token)) {
        throw 'InvalidCharacterError';
      }
      return token;
    },
    DOMTokenList = function (node) {
      var
        noClassName = typeof node.className === 'undefined',
        className = noClassName ?
          (node.getAttribute('class') || '') : node.className,
        isSVG = noClassName || typeof className === 'object',
        value = (isSVG ?
          (noClassName ? className : className.baseVal) :
          className
        ).replace(trim, '')
      ;
      if (value.length) {
        properties.push.apply(
          this,
          value.split(spaces)
        );
      }
      this._isSVG = isSVG;
      this._ = node;
    },
    classListDescriptor = {
      get: function get() {
        return new DOMTokenList(this);
      },
      set: function(){}
    },
    trim = /^\s+|\s+$/g,
    spaces = /\s+/,
    SPACE = '\x20',
    CLASS_LIST = 'classList',
    toggle = function toggle(token, force) {
      if (this.contains(token)) {
        if (!force) {
          // force is not true (either false or omitted)
          this.remove(token);
        }
      } else if(force === undefined || force) {
        force = true;
        this.add(token);
      }
      return !!force;
    },
    DocumentFragmentPrototype = window.DocumentFragment && DocumentFragment.prototype,
    Node = window.Node,
    NodePrototype = (Node || Element).prototype,
    CharacterData = window.CharacterData || Node,
    CharacterDataPrototype = CharacterData && CharacterData.prototype,
    DocumentType = window.DocumentType,
    DocumentTypePrototype = DocumentType && DocumentType.prototype,
    ElementPrototype = (window.Element || Node || window.HTMLElement).prototype,
    HTMLSelectElement = window.HTMLSelectElement || createElement('select').constructor,
    selectRemove = HTMLSelectElement.prototype.remove,
    SVGElement = window.SVGElement,
    properties = [
      'matches', (
        ElementPrototype.matchesSelector ||
        ElementPrototype.webkitMatchesSelector ||
        ElementPrototype.khtmlMatchesSelector ||
        ElementPrototype.mozMatchesSelector ||
        ElementPrototype.msMatchesSelector ||
        ElementPrototype.oMatchesSelector ||
        function matches(selector) {
          var parentNode = this.parentNode;
          return !!parentNode && -1 < indexOf.call(
            parentNode.querySelectorAll(selector),
            this
          );
        }
      ),
      'closest', function closest(selector) {
        var parentNode = this, matches;
        while (
          // document has no .matches
          (matches = parentNode && parentNode.matches) &&
          !parentNode.matches(selector)
        ) {
          parentNode = parentNode.parentNode;
        }
        return matches ? parentNode : null;
      },
      'prepend', function prepend() {
        var firstChild = this.firstChild,
            node = mutationMacro(arguments);
        if (firstChild) {
          this.insertBefore(node, firstChild);
        } else {
          this.appendChild(node);
        }
      },
      'append', function append() {
        this.appendChild(mutationMacro(arguments));
      },
      'before', function before() {
        var parentNode = this.parentNode;
        if (parentNode) {
          parentNode.insertBefore(
            mutationMacro(arguments), this
          );
        }
      },
      'after', function after() {
        var parentNode = this.parentNode,
            nextSibling = this.nextSibling,
            node = mutationMacro(arguments);
        if (parentNode) {
          if (nextSibling) {
            parentNode.insertBefore(node, nextSibling);
          } else {
            parentNode.appendChild(node);
          }
        }
      },
      // https://dom.spec.whatwg.org/#dom-element-toggleattribute
      'toggleAttribute', function toggleAttribute(name, force) {
        var had = this.hasAttribute(name);
        if (1 < arguments.length) {
          if (had && !force)
            this.removeAttribute(name);
          else if (force && !had)
            this.setAttribute(name, "");
        }
        else if (had)
          this.removeAttribute(name);
        else
          this.setAttribute(name, "");
        return this.hasAttribute(name);
      },
      // WARNING - DEPRECATED - use .replaceWith() instead
      'replace', function replace() {
        this.replaceWith.apply(this, arguments);
      },
      'replaceWith', function replaceWith() {
        var parentNode = this.parentNode;
        if (parentNode) {
          parentNode.replaceChild(
            mutationMacro(arguments),
            this
          );
        }
      },
      'remove', function remove() {
        var parentNode = this.parentNode;
        if (parentNode) {
          parentNode.removeChild(this);
        }
      }
    ],
    slice = properties.slice,
    i = properties.length; i; i -= 2
  ) {
    property = properties[i - 2];
    if (!(property in ElementPrototype)) {
      ElementPrototype[property] = properties[i - 1];
    }
    // avoid unnecessary re-patch when the script is included
    // gazillion times without any reason whatsoever
    // https://github.com/WebReflection/dom4/pull/48
    if (property === 'remove' && !selectRemove._dom4) {
      // see https://github.com/WebReflection/dom4/issues/19
      (HTMLSelectElement.prototype[property] = function () {
        return 0 < arguments.length ?
          selectRemove.apply(this, arguments) :
          ElementPrototype.remove.call(this);
      })._dom4 = true;
    }
    // see https://github.com/WebReflection/dom4/issues/18
    if (/^(?:before|after|replace|replaceWith|remove)$/.test(property)) {
      if (CharacterData && !(property in CharacterDataPrototype)) {
        CharacterDataPrototype[property] = properties[i - 1];
      }
      if (DocumentType && !(property in DocumentTypePrototype)) {
        DocumentTypePrototype[property] = properties[i - 1];
      }
    }
    // see https://github.com/WebReflection/dom4/pull/26
    if (/^(?:append|prepend)$/.test(property)) {
      if (DocumentFragmentPrototype) {
        if (!(property in DocumentFragmentPrototype)) {
          DocumentFragmentPrototype[property] = properties[i - 1];
        }
      } else {
        try {
          createDocumentFragment().constructor.prototype[property] = properties[i - 1];
        } catch(o_O) {}
      }
    }
  }

  // most likely an IE9 only issue
  // see https://github.com/WebReflection/dom4/issues/6
  if (!createElement('a').matches('a')) {
    ElementPrototype[property] = function(matches){
      return function (selector) {
        return matches.call(
          this.parentNode ?
            this :
            createDocumentFragment().appendChild(this),
          selector
        );
      };
    }(ElementPrototype[property]);
  }

  // used to fix both old webkit and SVG
  DOMTokenList.prototype = {
    length: 0,
    add: function add() {
      for(var j = 0, token; j < arguments.length; j++) {
        token = arguments[j];
        if(!this.contains(token)) {
          properties.push.call(this, property);
        }
      }
      if (this._isSVG) {
        this._.setAttribute('class', '' + this);
      } else {
        this._.className = '' + this;
      }
    },
    contains: (function(indexOf){
      return function contains(token) {
        i = indexOf.call(this, property = verifyToken(token));
        return -1 < i;
      };
    }([].indexOf || function (token) {
      i = this.length;
      while(i-- && this[i] !== token){}
      return i;
    })),
    item: function item(i) {
      return this[i] || null;
    },
    remove: function remove() {
      for(var j = 0, token; j < arguments.length; j++) {
        token = arguments[j];
        if(this.contains(token)) {
          properties.splice.call(this, i, 1);
        }
      }
      if (this._isSVG) {
        this._.setAttribute('class', '' + this);
      } else {
        this._.className = '' + this;
      }
    },
    toggle: toggle,
    toString: function toString() {
      return properties.join.call(this, SPACE);
    }
  };

  if (SVGElement && !(CLASS_LIST in SVGElement.prototype)) {
    defineProperty(SVGElement.prototype, CLASS_LIST, classListDescriptor);
  }

  // http://www.w3.org/TR/dom/#domtokenlist
  // iOS 5.1 has completely screwed this property
  // classList in ElementPrototype is false
  // but it's actually there as getter
  if (!(CLASS_LIST in document.documentElement)) {
    defineProperty(ElementPrototype, CLASS_LIST, classListDescriptor);
  } else {
    // iOS 5.1 and Nokia ASHA do not support multiple add or remove
    // trying to detect and fix that in here
    TemporaryTokenList = createElement('div')[CLASS_LIST];
    TemporaryTokenList.add('a', 'b', 'a');
    if ('a\x20b' != TemporaryTokenList) {
      // no other way to reach original methods in iOS 5.1
      TemporaryPrototype = TemporaryTokenList.constructor.prototype;
      if (!('add' in TemporaryPrototype)) {
        // ASHA double fails in here
        TemporaryPrototype = window.TemporaryTokenList.prototype;
      }
      wrapVerifyToken = function (original) {
        return function () {
          var i = 0;
          while (i < arguments.length) {
            original.call(this, arguments[i++]);
          }
        };
      };
      TemporaryPrototype.add = wrapVerifyToken(TemporaryPrototype.add);
      TemporaryPrototype.remove = wrapVerifyToken(TemporaryPrototype.remove);
      // toggle is broken too ^_^ ... let's fix it
      TemporaryPrototype.toggle = toggle;
    }
  }

  if (!('contains' in NodePrototype)) {
    defineProperty(NodePrototype, 'contains', {
      value: function (el) {
        while (el && el !== this) el = el.parentNode;
        return this === el;
      }
    });
  }

  if (!('head' in document)) {
    defineProperty(document, 'head', {
      get: function () {
        return head || (
          head = document.getElementsByTagName('head')[0]
        );
      }
    });
  }

  // requestAnimationFrame partial polyfill
  (function () {
    for (var
      raf,
      rAF = window.requestAnimationFrame,
      cAF = window.cancelAnimationFrame,
      prefixes = ['o', 'ms', 'moz', 'webkit'],
      i = prefixes.length;
      !cAF && i--;
    ) {
      rAF = rAF || window[prefixes[i] + 'RequestAnimationFrame'];
      cAF = window[prefixes[i] + 'CancelAnimationFrame'] ||
            window[prefixes[i] + 'CancelRequestAnimationFrame'];
    }
    if (!cAF) {
      // some FF apparently implemented rAF but no cAF 
      if (rAF) {
        raf = rAF;
        rAF = function (callback) {
          var goOn = true;
          raf(function () {
            if (goOn) callback.apply(this, arguments);
          });
          return function () {
            goOn = false;
          };
        };
        cAF = function (id) {
          id();
        };
      } else {
        rAF = function (callback) {
          return setTimeout(callback, 15, 15);
        };
        cAF = function (id) {
          clearTimeout(id);
        };
      }
    }
    window.requestAnimationFrame = rAF;
    window.cancelAnimationFrame = cAF;
  }());

  // http://www.w3.org/TR/dom/#customevent
  try{new window.CustomEvent('?');}catch(o_O){
    window.CustomEvent = function(
      eventName,
      defaultInitDict
    ){

      // the infamous substitute
      function CustomEvent(type, eventInitDict) {
        /*jshint eqnull:true */
        var event = document.createEvent(eventName);
        if (typeof type != 'string') {
          throw new Error('An event name must be provided');
        }
        if (eventName == 'Event') {
          event.initCustomEvent = initCustomEvent;
        }
        if (eventInitDict == null) {
          eventInitDict = defaultInitDict;
        }
        event.initCustomEvent(
          type,
          eventInitDict.bubbles,
          eventInitDict.cancelable,
          eventInitDict.detail
        );
        return event;
      }

      // attached at runtime
      function initCustomEvent(
        type, bubbles, cancelable, detail
      ) {
        /*jshint validthis:true*/
        this.initEvent(type, bubbles, cancelable);
        this.detail = detail;
      }

      // that's it
      return CustomEvent;
    }(
      // is this IE9 or IE10 ?
      // where CustomEvent is there
      // but not usable as construtor ?
      window.CustomEvent ?
        // use the CustomEvent interface in such case
        'CustomEvent' : 'Event',
        // otherwise the common compatible one
      {
        bubbles: false,
        cancelable: false,
        detail: null
      }
    );
  }

  // window.Event as constructor
  try { new Event('_'); } catch (o_O) {
    /* jshint -W022 */
    o_O = (function ($Event) {
      function Event(type, init) {
        enoughArguments(arguments.length, 'Event');
        var out = document.createEvent('Event');
        if (!init) init = {};
        out.initEvent(
          type,
          !!init.bubbles,
          !!init.cancelable
        );
        return out;
      }
      Event.prototype = $Event.prototype;
      return Event;
    }(window.Event || function Event() {}));
    defineProperty(window, 'Event', {value: o_O});
    // Android 4 gotcha
    if (Event !== o_O) Event = o_O;
  }

  // window.KeyboardEvent as constructor
  try { new KeyboardEvent('_', {}); } catch (o_O) {
    /* jshint -W022 */
    o_O = (function ($KeyboardEvent) {
      // code inspired by https://gist.github.com/termi/4654819
      var
        initType = 0,
        defaults = {
          char: '',
          key: '',
          location: 0,
          ctrlKey: false,
          shiftKey: false,
          altKey: false,
          metaKey: false,
          altGraphKey: false,
          repeat: false,
          locale: navigator.language,
          detail: 0,
          bubbles: false,
          cancelable: false,
          keyCode: 0,
          charCode: 0,
          which: 0
        },
        eventType
      ;
      try {
        var e = document.createEvent('KeyboardEvent');
        e.initKeyboardEvent(
          'keyup', false, false, window, '+', 3,
          true, false, true, false, false
        );
        initType = (
          (e.keyIdentifier || e.key) == '+' &&
          (e.keyLocation || e.location) == 3
        ) && (
          e.ctrlKey ? e.altKey ? 1 : 3 : e.shiftKey ? 2 : 4
        ) || 9;
      } catch(o_O) {}
      eventType = 0 < initType ? 'KeyboardEvent' : 'Event';

      function getModifier(init) {
        for (var
          out = [],
          keys = [
            'ctrlKey',
            'Control',
            'shiftKey',
            'Shift',
            'altKey',
            'Alt',
            'metaKey',
            'Meta',
            'altGraphKey',
            'AltGraph'
          ],
          i = 0; i < keys.length; i += 2
        ) {
          if (init[keys[i]])
            out.push(keys[i + 1]);
        }
        return out.join(' ');
      }

      function withDefaults(target, source) {
        for (var key in source) {
          if (
            source.hasOwnProperty(key) &&
            !source.hasOwnProperty.call(target, key)
          ) target[key] = source[key];
        }
        return target;
      }

      function withInitValues(key, out, init) {
        try {
          out[key] = init[key];
        } catch(o_O) {}
      }

      function KeyboardEvent(type, init) {
        enoughArguments(arguments.length, 'KeyboardEvent');
        init = withDefaults(init || {}, defaults);
        var
          out = document.createEvent(eventType),
          ctrlKey = init.ctrlKey,
          shiftKey = init.shiftKey,
          altKey = init.altKey,
          metaKey = init.metaKey,
          altGraphKey = init.altGraphKey,
          modifiers = initType > 3 ? getModifier(init) : null,
          key = String(init.key),
          chr = String(init.char),
          location = init.location,
          keyCode = init.keyCode || (
            (init.keyCode = key) &&
            key.charCodeAt(0)
          ) || 0,
          charCode = init.charCode || (
            (init.charCode = chr) &&
            chr.charCodeAt(0)
          ) || 0,
          bubbles = init.bubbles,
          cancelable = init.cancelable,
          repeat = init.repeat,
          locale = init.locale,
          view = init.view || window,
          args
        ;
        if (!init.which) init.which = init.keyCode;
        if ('initKeyEvent' in out) {
          out.initKeyEvent(
            type, bubbles, cancelable, view,
            ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode
          );
        } else if (0 < initType && 'initKeyboardEvent' in out) {
          args = [type, bubbles, cancelable, view];
          switch (initType) {
            case 1:
              args.push(key, location, ctrlKey, shiftKey, altKey, metaKey, altGraphKey);
              break;
            case 2:
              args.push(ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);
              break;
            case 3:
              args.push(key, location, ctrlKey, altKey, shiftKey, metaKey, altGraphKey);
              break;
            case 4:
              args.push(key, location, modifiers, repeat, locale);
              break;
            default:
              args.push(char, key, location, modifiers, repeat, locale);
          }
          out.initKeyboardEvent.apply(out, args);
        } else {
          out.initEvent(type, bubbles, cancelable);
        }
        for (key in out) {
          if (defaults.hasOwnProperty(key) && out[key] !== init[key]) {
            withInitValues(key, out, init);
          }
        }
        return out;
      }
      KeyboardEvent.prototype = $KeyboardEvent.prototype;
      return KeyboardEvent;
    }(window.KeyboardEvent || function KeyboardEvent() {}));
    defineProperty(window, 'KeyboardEvent', {value: o_O});
    // Android 4 gotcha
    if (KeyboardEvent !== o_O) KeyboardEvent = o_O;
  }

  // window.MouseEvent as constructor
  try { new MouseEvent('_', {}); } catch (o_O) {
    /* jshint -W022 */
    o_O = (function ($MouseEvent) {
      function MouseEvent(type, init) {
        enoughArguments(arguments.length, 'MouseEvent');
        var out = document.createEvent('MouseEvent');
        if (!init) init = {};
        out.initMouseEvent(
          type,
          !!init.bubbles,
          !!init.cancelable,
          init.view || window,
          init.detail || 1,
          init.screenX || 0,
          init.screenY || 0,
          init.clientX || 0,
          init.clientY || 0,
          !!init.ctrlKey,
          !!init.altKey,
          !!init.shiftKey,
          !!init.metaKey,
          init.button || 0,
          init.relatedTarget || null
        );
        return out;
      }
      MouseEvent.prototype = $MouseEvent.prototype;
      return MouseEvent;
    }(window.MouseEvent || function MouseEvent() {}));
    defineProperty(window, 'MouseEvent', {value: o_O});
    // Android 4 gotcha
    if (MouseEvent !== o_O) MouseEvent = o_O;
  }

  if (!document.querySelectorAll('*').forEach) {
    (function () {
      function patch(what) {
        var querySelectorAll = what.querySelectorAll;
        what.querySelectorAll = function qSA(css) {
          var result = querySelectorAll.call(this, css);
          result.forEach = Array.prototype.forEach;
          return result;
        };
      }
      patch(document);
      patch(Element.prototype);
    }());
  }

  try {
    // https://drafts.csswg.org/selectors-4/#the-scope-pseudo
    document.querySelector(':scope *');
  } catch(o_O) {
    (function () {
      var dataScope = 'data-scope-' + (Math.random() * 1e9 >>> 0);
      var proto = Element.prototype;
      var querySelector = proto.querySelector;
      var querySelectorAll = proto.querySelectorAll;
      proto.querySelector = function qS(css) {
        return find(this, querySelector, css);
      };
      proto.querySelectorAll = function qSA(css) {
        return find(this, querySelectorAll, css);
      };
      function find(node, method, css) {
        node.setAttribute(dataScope, null);
        var result = method.call(
          node,
          String(css).replace(
            /(^|,\s*)(:scope([ >]|$))/g,
            function ($0, $1, $2, $3) {
              return $1 + '[' + dataScope + ']' + ($3 || ' ');
            }
          )
        );
        node.removeAttribute(dataScope);
        return result;
      }
    }());
  }
}(window));
(function (global){
  // a WeakMap fallback for DOM nodes only used as key
  var DOMMap = global.WeakMap || (function () {

    var
      counter = 0,
      dispatched = false,
      drop = false,
      value
    ;

    function dispatch(key, ce, shouldDrop) {
      drop = shouldDrop;
      dispatched = false;
      value = undefined;
      key.dispatchEvent(ce);
    }

    function Handler(value) {
      this.value = value;
    }

    Handler.prototype.handleEvent = function handleEvent(e) {
      dispatched = true;
      if (drop) {
        e.currentTarget.removeEventListener(e.type, this, false);
      } else {
        value = this.value;
      }
    };

    function DOMMap() {
      counter++;  // make id clashing highly improbable
      this.__ce__ = new Event(('@DOMMap:' + counter) + Math.random());
    }

    DOMMap.prototype = {
      'constructor': DOMMap,
      'delete': function del(key) {
        return dispatch(key, this.__ce__, true), dispatched;
      },
      'get': function get(key) {
        dispatch(key, this.__ce__, false);
        var v = value;
        value = undefined;
        return v;
      },
      'has': function has(key) {
        return dispatch(key, this.__ce__, false), dispatched;
      },
      'set': function set(key, value) {
        dispatch(key, this.__ce__, true);
        key.addEventListener(this.__ce__.type, new Handler(value), false);
        return this;
      },
    };

    return DOMMap;

  }());

  function Dict() {}
  Dict.prototype = (Object.create || Object)(null);

  // https://dom.spec.whatwg.org/#interface-eventtarget

  function createEventListener(type, callback, options) {
    function eventListener(e) {
      if (eventListener.once) {
        e.currentTarget.removeEventListener(
          e.type,
          callback,
          eventListener
        );
        eventListener.removed = true;
      }
      if (eventListener.passive) {
        e.preventDefault = createEventListener.preventDefault;
      }
      if (typeof eventListener.callback === 'function') {
        /* jshint validthis: true */
        eventListener.callback.call(this, e);
      } else if (eventListener.callback) {
        eventListener.callback.handleEvent(e);
      }
      if (eventListener.passive) {
        delete e.preventDefault;
      }
    }
    eventListener.type = type;
    eventListener.callback = callback;
    eventListener.capture = !!options.capture;
    eventListener.passive = !!options.passive;
    eventListener.once = !!options.once;
    // currently pointless but specs say to use it, so ...
    eventListener.removed = false;
    return eventListener;
  }

  createEventListener.preventDefault = function preventDefault() {};

  var
    Event = global.CustomEvent,
    dE = global.dispatchEvent,
    aEL = global.addEventListener,
    rEL = global.removeEventListener,
    counter = 0,
    increment = function () { counter++; },
    indexOf = [].indexOf || function indexOf(value){
      var length = this.length;
      while(length--) {
        if (this[length] === value) {
          break;
        }
      }
      return length;
    },
    getListenerKey = function (options) {
      return ''.concat(
        options.capture ? '1' : '0',
        options.passive ? '1' : '0',
        options.once ? '1' : '0'
      );
    },
    augment
  ;

  try {
    aEL('_', increment, {once: true});
    dE(new Event('_'));
    dE(new Event('_'));
    rEL('_', increment, {once: true});
  } catch(o_O) {}

  if (counter !== 1) {
    (function () {
      var dm = new DOMMap();
      function createAEL(aEL) {
        return function addEventListener(type, handler, options) {
          if (options && typeof options !== 'boolean') {
            var
              info = dm.get(this),
              key = getListenerKey(options),
              i, tmp, wrap
            ;
            if (!info) dm.set(this, (info = new Dict()));
            if (!(type in info)) info[type] = {
              handler: [],
              wrap: []
            };
            tmp = info[type];
            i = indexOf.call(tmp.handler, handler);
            if (i < 0) {
              i = tmp.handler.push(handler) - 1;
              tmp.wrap[i] = (wrap = new Dict());
            } else {
              wrap = tmp.wrap[i];
            }
            if (!(key in wrap)) {
              wrap[key] = createEventListener(type, handler, options);
              aEL.call(this, type, wrap[key], wrap[key].capture);
            }
          } else {
            aEL.call(this, type, handler, options);
          }
        };
      }
      function createREL(rEL) {
        return function removeEventListener(type, handler, options) {
          if (options && typeof options !== 'boolean') {
            var
              info = dm.get(this),
              key, i, tmp, wrap
            ;
            if (info && (type in info)) {
              tmp = info[type];
              i = indexOf.call(tmp.handler, handler);
              if (-1 < i) {
                key = getListenerKey(options);
                wrap = tmp.wrap[i];
                if (key in wrap) {
                  rEL.call(this, type, wrap[key], wrap[key].capture);
                  delete wrap[key];
                  // return if there are other wraps
                  for (key in wrap) return;
                  // otherwise remove all the things
                  tmp.handler.splice(i, 1);
                  tmp.wrap.splice(i, 1);
                  // if there are no other handlers
                  if (tmp.handler.length === 0)
                    // drop the info[type] entirely
                    delete info[type];
                }
              }
            }
          } else {
            rEL.call(this, type, handler, options);
          }
        };
      }

      augment = function (Constructor) {
        if (!Constructor) return;
        var proto = Constructor.prototype;
        proto.addEventListener = createAEL(proto.addEventListener);
        proto.removeEventListener = createREL(proto.removeEventListener);
      };

      if (global.EventTarget) {
        augment(EventTarget);
      } else {
        augment(global.Text);
        augment(global.Element || global.HTMLElement);
        augment(global.HTMLDocument);
        augment(global.Window || {prototype:global});
        augment(global.XMLHttpRequest);
      }

    }());
  }

}(self));

/** @license React v16.13.0
 * react-dom.production.js
 *
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const ReactDOM={};(function(I,ea){function k(a){for(var b="https://reactjs.org/docs/error-decoder.html?invariant="+a,c=1;c<arguments.length;c++)b+="&args[]="+encodeURIComponent(arguments[c]);return "Minified React error #"+a+"; visit "+b+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}
function ji(a,b,c,d,e,f,g,h,m){yb=!1;gc=null;ki.apply(li,arguments);}function mi(a,b,c,d,e,f,g,h,m){ji.apply(this,arguments);if(yb){if(yb){var n=gc;yb=!1;gc=null;}else throw Error(k(198));hc||(hc=!0,pd=n);}}function lf(a,b,c){var d=a.type||"unknown-event";a.currentTarget=mf(c);mi(d,b,void 0,a);a.currentTarget=null;}function zb(a){if(null===a||"object"!==typeof a)return null;a=nf&&a[nf]||a["@@iterator"];return "function"===typeof a?a:null}function ni(a){if(-1===a._status){a._status=0;var b=a._ctor;b=b();
a._result=b;b.then(function(b){0===a._status&&(b=b.default,a._status=1,a._result=b);},function(b){0===a._status&&(a._status=2,a._result=b);});}}function na(a){if(null==a)return null;if("function"===typeof a)return a.displayName||a.name||null;if("string"===typeof a)return a;switch(a){case Ma:return "Fragment";case cb:return "Portal";case ic:return "Profiler";case of:return "StrictMode";case jc:return "Suspense";case qd:return "SuspenseList"}if("object"===typeof a)switch(a.$$typeof){case pf:return "Context.Consumer";
case qf:return "Context.Provider";case rd:var b=a.render;b=b.displayName||b.name||"";return a.displayName||(""!==b?"ForwardRef("+b+")":"ForwardRef");case sd:return na(a.type);case rf:return na(a.render);case sf:if(a=1===a._status?a._result:null)return na(a)}return null}function td(a){var b="";do{a:switch(a.tag){case 3:case 4:case 6:case 7:case 10:case 9:var c="";break a;default:var d=a._debugOwner,e=a._debugSource,f=na(a.type);c=null;d&&(c=na(d.type));d=f;f="";e?f=" (at "+e.fileName.replace(oi,"")+
":"+e.lineNumber+")":c&&(f=" (created by "+c+")");c="\n    in "+(d||"Unknown")+f;}b+=c;a=a.return;}while(a);return b}function tf(){if(kc)for(var a in db){var b=db[a],c=kc.indexOf(a);if(!(-1<c))throw Error(k(96,a));if(!lc[c]){if(!b.extractEvents)throw Error(k(97,a));lc[c]=b;c=b.eventTypes;for(var d in c){var e=void 0;var f=c[d],g=b,h=d;if(ud.hasOwnProperty(h))throw Error(k(99,h));ud[h]=f;var m=f.phasedRegistrationNames;if(m){for(e in m)m.hasOwnProperty(e)&&uf(m[e],g,h);e=!0;}else f.registrationName?(uf(f.registrationName,
g,h),e=!0):e=!1;if(!e)throw Error(k(98,d,a));}}}}function uf(a,b,c){if(eb[a])throw Error(k(100,a));eb[a]=b;vd[a]=b.eventTypes[c].dependencies;}function vf(a){var b=!1,c;for(c in a)if(a.hasOwnProperty(c)){var d=a[c];if(!db.hasOwnProperty(c)||db[c]!==d){if(db[c])throw Error(k(102,c));db[c]=d;b=!0;}}b&&tf();}function wf(a){if(a=xf(a)){if("function"!==typeof wd)throw Error(k(280));var b=a.stateNode;b&&(b=xd(b),wd(a.stateNode,a.type,b));}}function yf(a){fb?gb?gb.push(a):gb=[a]:fb=a;}function zf(){if(fb){var a=
fb,b=gb;gb=fb=null;wf(a);if(b)for(a=0;a<b.length;a++)wf(b[a]);}}function yd(){if(null!==fb||null!==gb)zd(),zf();}function Af(a,b,c){if(Ad)return a(b,c);Ad=!0;try{return Bf(a,b,c)}finally{Ad=!1,yd();}}function pi(a){if(Cf.call(Df,a))return !0;if(Cf.call(Ef,a))return !1;if(qi.test(a))return Df[a]=!0;Ef[a]=!0;return !1}function ri(a,b,c,d){if(null!==c&&0===c.type)return !1;switch(typeof b){case "function":case "symbol":return !0;case "boolean":if(d)return !1;if(null!==c)return !c.acceptsBooleans;a=a.toLowerCase().slice(0,
5);return "data-"!==a&&"aria-"!==a;default:return !1}}function si(a,b,c,d){if(null===b||"undefined"===typeof b||ri(a,b,c,d))return !0;if(d)return !1;if(null!==c)switch(c.type){case 3:return !b;case 4:return !1===b;case 5:return isNaN(b);case 6:return isNaN(b)||1>b}return !1}function L(a,b,c,d,e,f){this.acceptsBooleans=2===b||3===b||4===b;this.attributeName=d;this.attributeNamespace=e;this.mustUseProperty=c;this.propertyName=a;this.type=b;this.sanitizeURL=f;}function Bd(a,b,c,d){var e=E.hasOwnProperty(b)?
E[b]:null;var f=null!==e?0===e.type:d?!1:!(2<b.length)||"o"!==b[0]&&"O"!==b[0]||"n"!==b[1]&&"N"!==b[1]?!1:!0;f||(si(b,c,e,d)&&(c=null),d||null===e?pi(b)&&(null===c?a.removeAttribute(b):a.setAttribute(b,""+c)):e.mustUseProperty?a[e.propertyName]=null===c?3===e.type?!1:"":c:(b=e.attributeName,d=e.attributeNamespace,null===c?a.removeAttribute(b):(e=e.type,c=3===e||4===e&&!0===c?"":""+c,d?a.setAttributeNS(d,b,c):a.setAttribute(b,c))));}function va(a){switch(typeof a){case "boolean":case "number":case "object":case "string":case "undefined":return a;
default:return ""}}function Ff(a){var b=a.type;return (a=a.nodeName)&&"input"===a.toLowerCase()&&("checkbox"===b||"radio"===b)}function ti(a){var b=Ff(a)?"checked":"value",c=Object.getOwnPropertyDescriptor(a.constructor.prototype,b),d=""+a[b];if(!a.hasOwnProperty(b)&&"undefined"!==typeof c&&"function"===typeof c.get&&"function"===typeof c.set){var e=c.get,f=c.set;Object.defineProperty(a,b,{configurable:!0,get:function(){return e.call(this)},set:function(a){d=""+a;f.call(this,a);}});Object.defineProperty(a,
b,{enumerable:c.enumerable});return {getValue:function(){return d},setValue:function(a){d=""+a;},stopTracking:function(){a._valueTracker=null;delete a[b];}}}}function mc(a){a._valueTracker||(a._valueTracker=ti(a));}function Gf(a){if(!a)return !1;var b=a._valueTracker;if(!b)return !0;var c=b.getValue();var d="";a&&(d=Ff(a)?a.checked?"true":"false":a.value);a=d;return a!==c?(b.setValue(a),!0):!1}function Cd(a,b){var c=b.checked;return M({},b,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:null!=
c?c:a._wrapperState.initialChecked})}function Hf(a,b){var c=null==b.defaultValue?"":b.defaultValue,d=null!=b.checked?b.checked:b.defaultChecked;c=va(null!=b.value?b.value:c);a._wrapperState={initialChecked:d,initialValue:c,controlled:"checkbox"===b.type||"radio"===b.type?null!=b.checked:null!=b.value};}function If(a,b){b=b.checked;null!=b&&Bd(a,"checked",b,!1);}function Dd(a,b){If(a,b);var c=va(b.value),d=b.type;if(null!=c)if("number"===d){if(0===c&&""===a.value||a.value!=c)a.value=""+c;}else a.value!==
""+c&&(a.value=""+c);else if("submit"===d||"reset"===d){a.removeAttribute("value");return}b.hasOwnProperty("value")?Ed(a,b.type,c):b.hasOwnProperty("defaultValue")&&Ed(a,b.type,va(b.defaultValue));null==b.checked&&null!=b.defaultChecked&&(a.defaultChecked=!!b.defaultChecked);}function Jf(a,b,c){if(b.hasOwnProperty("value")||b.hasOwnProperty("defaultValue")){var d=b.type;if(!("submit"!==d&&"reset"!==d||void 0!==b.value&&null!==b.value))return;b=""+a._wrapperState.initialValue;c||b===a.value||(a.value=
b);a.defaultValue=b;}c=a.name;""!==c&&(a.name="");a.defaultChecked=!!a._wrapperState.initialChecked;""!==c&&(a.name=c);}function Ed(a,b,c){if("number"!==b||a.ownerDocument.activeElement!==a)null==c?a.defaultValue=""+a._wrapperState.initialValue:a.defaultValue!==""+c&&(a.defaultValue=""+c);}function ui(a){var b="";ea.Children.forEach(a,function(a){null!=a&&(b+=a);});return b}function Fd(a,b){a=M({children:void 0},b);if(b=ui(b.children))a.children=b;return a}function hb(a,b,c,d){a=a.options;if(b){b={};
for(var e=0;e<c.length;e++)b["$"+c[e]]=!0;for(c=0;c<a.length;c++)e=b.hasOwnProperty("$"+a[c].value),a[c].selected!==e&&(a[c].selected=e),e&&d&&(a[c].defaultSelected=!0);}else {c=""+va(c);b=null;for(e=0;e<a.length;e++){if(a[e].value===c){a[e].selected=!0;d&&(a[e].defaultSelected=!0);return}null!==b||a[e].disabled||(b=a[e]);}null!==b&&(b.selected=!0);}}function Gd(a,b){if(null!=b.dangerouslySetInnerHTML)throw Error(k(91));return M({},b,{value:void 0,defaultValue:void 0,children:""+a._wrapperState.initialValue})}
function Kf(a,b){var c=b.value;if(null==c){c=b.children;b=b.defaultValue;if(null!=c){if(null!=b)throw Error(k(92));if(Array.isArray(c)){if(!(1>=c.length))throw Error(k(93));c=c[0];}b=c;}null==b&&(b="");c=b;}a._wrapperState={initialValue:va(c)};}function Lf(a,b){var c=va(b.value),d=va(b.defaultValue);null!=c&&(c=""+c,c!==a.value&&(a.value=c),null==b.defaultValue&&a.defaultValue!==c&&(a.defaultValue=c));null!=d&&(a.defaultValue=""+d);}function Mf(a,b){b=a.textContent;b===a._wrapperState.initialValue&&""!==
b&&null!==b&&(a.value=b);}function Nf(a){switch(a){case "svg":return "http://www.w3.org/2000/svg";case "math":return "http://www.w3.org/1998/Math/MathML";default:return "http://www.w3.org/1999/xhtml"}}function Hd(a,b){return null==a||"http://www.w3.org/1999/xhtml"===a?Nf(b):"http://www.w3.org/2000/svg"===a&&"foreignObject"===b?"http://www.w3.org/1999/xhtml":a}function nc(a,b){var c={};c[a.toLowerCase()]=b.toLowerCase();c["Webkit"+a]="webkit"+b;c["Moz"+a]="moz"+b;return c}function oc(a){if(Id[a])return Id[a];
if(!ib[a])return a;var b=ib[a],c;for(c in b)if(b.hasOwnProperty(c)&&c in Of)return Id[a]=b[c];return a}function Jd(a){var b=Pf.get(a);void 0===b&&(b=new Map,Pf.set(a,b));return b}function Na(a){var b=a,c=a;if(a.alternate)for(;b.return;)b=b.return;else {a=b;do b=a,0!==(b.effectTag&1026)&&(c=b.return),a=b.return;while(a)}return 3===b.tag?c:null}function Qf(a){if(13===a.tag){var b=a.memoizedState;null===b&&(a=a.alternate,null!==a&&(b=a.memoizedState));if(null!==b)return b.dehydrated}return null}function Rf(a){if(Na(a)!==
a)throw Error(k(188));}function vi(a){var b=a.alternate;if(!b){b=Na(a);if(null===b)throw Error(k(188));return b!==a?null:a}for(var c=a,d=b;;){var e=c.return;if(null===e)break;var f=e.alternate;if(null===f){d=e.return;if(null!==d){c=d;continue}break}if(e.child===f.child){for(f=e.child;f;){if(f===c)return Rf(e),a;if(f===d)return Rf(e),b;f=f.sibling;}throw Error(k(188));}if(c.return!==d.return)c=e,d=f;else {for(var g=!1,h=e.child;h;){if(h===c){g=!0;c=e;d=f;break}if(h===d){g=!0;d=e;c=f;break}h=h.sibling;}if(!g){for(h=
f.child;h;){if(h===c){g=!0;c=f;d=e;break}if(h===d){g=!0;d=f;c=e;break}h=h.sibling;}if(!g)throw Error(k(189));}}if(c.alternate!==d)throw Error(k(190));}if(3!==c.tag)throw Error(k(188));return c.stateNode.current===c?a:b}function Sf(a){a=vi(a);if(!a)return null;for(var b=a;;){if(5===b.tag||6===b.tag)return b;if(b.child)b.child.return=b,b=b.child;else {if(b===a)break;for(;!b.sibling;){if(!b.return||b.return===a)return null;b=b.return;}b.sibling.return=b.return;b=b.sibling;}}return null}function jb(a,b){if(null==
b)throw Error(k(30));if(null==a)return b;if(Array.isArray(a)){if(Array.isArray(b))return a.push.apply(a,b),a;a.push(b);return a}return Array.isArray(b)?[a].concat(b):[a,b]}function Kd(a,b,c){Array.isArray(a)?a.forEach(b,c):a&&b.call(c,a);}function pc(a){null!==a&&(Ab=jb(Ab,a));a=Ab;Ab=null;if(a){Kd(a,wi);if(Ab)throw Error(k(95));if(hc)throw (a=pd, hc=!1, pd=null, a);}}function Ld(a){a=a.target||a.srcElement||window;a.correspondingUseElement&&(a=a.correspondingUseElement);return 3===a.nodeType?a.parentNode:
a}function Tf(a){if(!wa)return !1;a="on"+a;var b=a in document;b||(b=document.createElement("div"),b.setAttribute(a,"return;"),b="function"===typeof b[a]);return b}function Uf(a){a.topLevelType=null;a.nativeEvent=null;a.targetInst=null;a.ancestors.length=0;10>qc.length&&qc.push(a);}function Vf(a,b,c,d){if(qc.length){var e=qc.pop();e.topLevelType=a;e.eventSystemFlags=d;e.nativeEvent=b;e.targetInst=c;return e}return {topLevelType:a,eventSystemFlags:d,nativeEvent:b,targetInst:c,ancestors:[]}}function Wf(a){var b=
a.targetInst,c=b;do{if(!c){a.ancestors.push(c);break}var d=c;if(3===d.tag)d=d.stateNode.containerInfo;else {for(;d.return;)d=d.return;d=3!==d.tag?null:d.stateNode.containerInfo;}if(!d)break;b=c.tag;5!==b&&6!==b||a.ancestors.push(c);c=Bb(d);}while(c);for(c=0;c<a.ancestors.length;c++){b=a.ancestors[c];var e=Ld(a.nativeEvent);d=a.topLevelType;var f=a.nativeEvent,g=a.eventSystemFlags;0===c&&(g|=64);for(var h=null,m=0;m<lc.length;m++){var n=lc[m];n&&(n=n.extractEvents(d,b,f,e,g))&&(h=jb(h,n));}pc(h);}}function Md(a,
b,c){if(!c.has(a)){switch(a){case "scroll":Cb(b,"scroll",!0);break;case "focus":case "blur":Cb(b,"focus",!0);Cb(b,"blur",!0);c.set("blur",null);c.set("focus",null);break;case "cancel":case "close":Tf(a)&&Cb(b,a,!0);break;case "invalid":case "submit":case "reset":break;default:-1===Db.indexOf(a)&&w(a,b);}c.set(a,null);}}function xi(a,b){var c=Jd(b);Nd.forEach(function(a){Md(a,b,c);});yi.forEach(function(a){Md(a,b,c);});}function Od(a,b,c,d,e){return {blockedOn:a,topLevelType:b,eventSystemFlags:c|32,nativeEvent:e,
container:d}}function Xf(a,b){switch(a){case "focus":case "blur":xa=null;break;case "dragenter":case "dragleave":ya=null;break;case "mouseover":case "mouseout":za=null;break;case "pointerover":case "pointerout":Eb.delete(b.pointerId);break;case "gotpointercapture":case "lostpointercapture":Fb.delete(b.pointerId);}}function Gb(a,b,c,d,e,f){if(null===a||a.nativeEvent!==f)return a=Od(b,c,d,e,f),null!==b&&(b=Hb(b),null!==b&&Yf(b)),a;a.eventSystemFlags|=d;return a}function zi(a,b,c,d,e){switch(b){case "focus":return xa=
Gb(xa,a,b,c,d,e),!0;case "dragenter":return ya=Gb(ya,a,b,c,d,e),!0;case "mouseover":return za=Gb(za,a,b,c,d,e),!0;case "pointerover":var f=e.pointerId;Eb.set(f,Gb(Eb.get(f)||null,a,b,c,d,e));return !0;case "gotpointercapture":return f=e.pointerId,Fb.set(f,Gb(Fb.get(f)||null,a,b,c,d,e)),!0}return !1}function Ai(a){var b=Bb(a.target);if(null!==b){var c=Na(b);if(null!==c)if(b=c.tag,13===b){if(b=Qf(c),null!==b){a.blockedOn=b;Pd(a.priority,function(){Bi(c);});return}}else if(3===b&&c.stateNode.hydrate){a.blockedOn=
3===c.tag?c.stateNode.containerInfo:null;return}}a.blockedOn=null;}function rc(a){if(null!==a.blockedOn)return !1;var b=Qd(a.topLevelType,a.eventSystemFlags,a.container,a.nativeEvent);if(null!==b){var c=Hb(b);null!==c&&Yf(c);a.blockedOn=b;return !1}return !0}function Zf(a,b,c){rc(a)&&c.delete(b);}function Ci(){for(Rd=!1;0<fa.length;){var a=fa[0];if(null!==a.blockedOn){a=Hb(a.blockedOn);null!==a&&Di(a);break}var b=Qd(a.topLevelType,a.eventSystemFlags,a.container,a.nativeEvent);null!==b?a.blockedOn=b:fa.shift();}null!==
xa&&rc(xa)&&(xa=null);null!==ya&&rc(ya)&&(ya=null);null!==za&&rc(za)&&(za=null);Eb.forEach(Zf);Fb.forEach(Zf);}function Ib(a,b){a.blockedOn===b&&(a.blockedOn=null,Rd||(Rd=!0,$f(ag,Ci)));}function bg(a){if(0<fa.length){Ib(fa[0],a);for(var b=1;b<fa.length;b++){var c=fa[b];c.blockedOn===a&&(c.blockedOn=null);}}null!==xa&&Ib(xa,a);null!==ya&&Ib(ya,a);null!==za&&Ib(za,a);b=function(b){return Ib(b,a)};Eb.forEach(b);Fb.forEach(b);for(b=0;b<Jb.length;b++)c=Jb[b],c.blockedOn===a&&(c.blockedOn=null);for(;0<Jb.length&&
(b=Jb[0],null===b.blockedOn);)Ai(b),null===b.blockedOn&&Jb.shift();}function Sd(a,b){for(var c=0;c<a.length;c+=2){var d=a[c],e=a[c+1],f="on"+(e[0].toUpperCase()+e.slice(1));f={phasedRegistrationNames:{bubbled:f,captured:f+"Capture"},dependencies:[d],eventPriority:b};Td.set(d,b);cg.set(d,f);dg[e]=f;}}function w(a,b){Cb(b,a,!1);}function Cb(a,b,c){var d=Td.get(b);switch(void 0===d?2:d){case 0:d=Ei.bind(null,b,1,a);break;case 1:d=Fi.bind(null,b,1,a);break;default:d=sc.bind(null,b,1,a);}c?a.addEventListener(b,
d,!0):a.addEventListener(b,d,!1);}function Ei(a,b,c,d){Oa||zd();var e=sc,f=Oa;Oa=!0;try{eg(e,a,b,c,d);}finally{(Oa=f)||yd();}}function Fi(a,b,c,d){Gi(Hi,sc.bind(null,a,b,c,d));}function sc(a,b,c,d){if(tc)if(0<fa.length&&-1<Nd.indexOf(a))a=Od(null,a,b,c,d),fa.push(a);else {var e=Qd(a,b,c,d);if(null===e)Xf(a,d);else if(-1<Nd.indexOf(a))a=Od(e,a,b,c,d),fa.push(a);else if(!zi(e,a,b,c,d)){Xf(a,d);a=Vf(a,d,null,b);try{Af(Wf,a);}finally{Uf(a);}}}}function Qd(a,b,c,d){c=Ld(d);c=Bb(c);if(null!==c){var e=Na(c);if(null===
e)c=null;else {var f=e.tag;if(13===f){c=Qf(e);if(null!==c)return c;c=null;}else if(3===f){if(e.stateNode.hydrate)return 3===e.tag?e.stateNode.containerInfo:null;c=null;}else e!==c&&(c=null);}}a=Vf(a,d,c,b);try{Af(Wf,a);}finally{Uf(a);}return null}function fg(a,b,c){return null==b||"boolean"===typeof b||""===b?"":c||"number"!==typeof b||0===b||Kb.hasOwnProperty(a)&&Kb[a]?(""+b).trim():b+"px"}function gg(a,b){a=a.style;for(var c in b)if(b.hasOwnProperty(c)){var d=0===c.indexOf("--"),e=fg(c,b[c],d);"float"===
c&&(c="cssFloat");d?a.setProperty(c,e):a[c]=e;}}function Ud(a,b){if(b){if(Ii[a]&&(null!=b.children||null!=b.dangerouslySetInnerHTML))throw Error(k(137,a,""));if(null!=b.dangerouslySetInnerHTML){if(null!=b.children)throw Error(k(60));if(!("object"===typeof b.dangerouslySetInnerHTML&&"__html"in b.dangerouslySetInnerHTML))throw Error(k(61));}if(null!=b.style&&"object"!==typeof b.style)throw Error(k(62,""));}}function Vd(a,b){if(-1===a.indexOf("-"))return "string"===typeof b.is;switch(a){case "annotation-xml":case "color-profile":case "font-face":case "font-face-src":case "font-face-uri":case "font-face-format":case "font-face-name":case "missing-glyph":return !1;
default:return !0}}function oa(a,b){a=9===a.nodeType||11===a.nodeType?a:a.ownerDocument;var c=Jd(a);b=vd[b];for(var d=0;d<b.length;d++)Md(b[d],a,c);}function uc(){}function Wd(a){a=a||("undefined"!==typeof document?document:void 0);if("undefined"===typeof a)return null;try{return a.activeElement||a.body}catch(b){return a.body}}function hg(a){for(;a&&a.firstChild;)a=a.firstChild;return a}function ig(a,b){var c=hg(a);a=0;for(var d;c;){if(3===c.nodeType){d=a+c.textContent.length;if(a<=b&&d>=b)return {node:c,
offset:b-a};a=d;}a:{for(;c;){if(c.nextSibling){c=c.nextSibling;break a}c=c.parentNode;}c=void 0;}c=hg(c);}}function jg(a,b){return a&&b?a===b?!0:a&&3===a.nodeType?!1:b&&3===b.nodeType?jg(a,b.parentNode):"contains"in a?a.contains(b):a.compareDocumentPosition?!!(a.compareDocumentPosition(b)&16):!1:!1}function kg(){for(var a=window,b=Wd();b instanceof a.HTMLIFrameElement;){try{var c="string"===typeof b.contentWindow.location.href;}catch(d){c=!1;}if(c)a=b.contentWindow;else break;b=Wd(a.document);}return b}
function Xd(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return b&&("input"===b&&("text"===a.type||"search"===a.type||"tel"===a.type||"url"===a.type||"password"===a.type)||"textarea"===b||"true"===a.contentEditable)}function lg(a,b){switch(a){case "button":case "input":case "select":case "textarea":return !!b.autoFocus}return !1}function Yd(a,b){return "textarea"===a||"option"===a||"noscript"===a||"string"===typeof b.children||"number"===typeof b.children||"object"===typeof b.dangerouslySetInnerHTML&&
null!==b.dangerouslySetInnerHTML&&null!=b.dangerouslySetInnerHTML.__html}function kb(a){for(;null!=a;a=a.nextSibling){var b=a.nodeType;if(1===b||3===b)break}return a}function mg(a){a=a.previousSibling;for(var b=0;a;){if(8===a.nodeType){var c=a.data;if(c===ng||c===Zd||c===$d){if(0===b)return a;b--;}else c===og&&b++;}a=a.previousSibling;}return null}function Bb(a){var b=a[Aa];if(b)return b;for(var c=a.parentNode;c;){if(b=c[Lb]||c[Aa]){c=b.alternate;if(null!==b.child||null!==c&&null!==c.child)for(a=mg(a);null!==
a;){if(c=a[Aa])return c;a=mg(a);}return b}a=c;c=a.parentNode;}return null}function Hb(a){a=a[Aa]||a[Lb];return !a||5!==a.tag&&6!==a.tag&&13!==a.tag&&3!==a.tag?null:a}function Pa(a){if(5===a.tag||6===a.tag)return a.stateNode;throw Error(k(33));}function ae(a){return a[vc]||null}function pa(a){do a=a.return;while(a&&5!==a.tag);return a?a:null}function pg(a,b){var c=a.stateNode;if(!c)return null;var d=xd(c);if(!d)return null;c=d[b];a:switch(b){case "onClick":case "onClickCapture":case "onDoubleClick":case "onDoubleClickCapture":case "onMouseDown":case "onMouseDownCapture":case "onMouseMove":case "onMouseMoveCapture":case "onMouseUp":case "onMouseUpCapture":case "onMouseEnter":(d=
!d.disabled)||(a=a.type,d=!("button"===a||"input"===a||"select"===a||"textarea"===a));a=!d;break a;default:a=!1;}if(a)return null;if(c&&"function"!==typeof c)throw Error(k(231,b,typeof c));return c}function qg(a,b,c){if(b=pg(a,c.dispatchConfig.phasedRegistrationNames[b]))c._dispatchListeners=jb(c._dispatchListeners,b),c._dispatchInstances=jb(c._dispatchInstances,a);}function Ji(a){if(a&&a.dispatchConfig.phasedRegistrationNames){for(var b=a._targetInst,c=[];b;)c.push(b),b=pa(b);for(b=c.length;0<b--;)qg(c[b],
"captured",a);for(b=0;b<c.length;b++)qg(c[b],"bubbled",a);}}function be(a,b,c){a&&c&&c.dispatchConfig.registrationName&&(b=pg(a,c.dispatchConfig.registrationName))&&(c._dispatchListeners=jb(c._dispatchListeners,b),c._dispatchInstances=jb(c._dispatchInstances,a));}function Ki(a){a&&a.dispatchConfig.registrationName&&be(a._targetInst,null,a);}function lb(a){Kd(a,Ji);}function rg(){if(wc)return wc;var a,b=ce,c=b.length,d,e="value"in Ba?Ba.value:Ba.textContent,f=e.length;for(a=0;a<c&&b[a]===e[a];a++);var g=
c-a;for(d=1;d<=g&&b[c-d]===e[f-d];d++);return wc=e.slice(a,1<d?1-d:void 0)}function xc(){return !0}function yc(){return !1}function R(a,b,c,d){this.dispatchConfig=a;this._targetInst=b;this.nativeEvent=c;a=this.constructor.Interface;for(var e in a)a.hasOwnProperty(e)&&((b=a[e])?this[e]=b(c):"target"===e?this.target=d:this[e]=c[e]);this.isDefaultPrevented=(null!=c.defaultPrevented?c.defaultPrevented:!1===c.returnValue)?xc:yc;this.isPropagationStopped=yc;return this}function Li(a,b,c,d){if(this.eventPool.length){var e=
this.eventPool.pop();this.call(e,a,b,c,d);return e}return new this(a,b,c,d)}function Mi(a){if(!(a instanceof this))throw Error(k(279));a.destructor();10>this.eventPool.length&&this.eventPool.push(a);}function sg(a){a.eventPool=[];a.getPooled=Li;a.release=Mi;}function tg(a,b){switch(a){case "keyup":return -1!==Ni.indexOf(b.keyCode);case "keydown":return 229!==b.keyCode;case "keypress":case "mousedown":case "blur":return !0;default:return !1}}function ug(a){a=a.detail;return "object"===typeof a&&"data"in
a?a.data:null}function Oi(a,b){switch(a){case "compositionend":return ug(b);case "keypress":if(32!==b.which)return null;vg=!0;return wg;case "textInput":return a=b.data,a===wg&&vg?null:a;default:return null}}function Pi(a,b){if(mb)return "compositionend"===a||!de&&tg(a,b)?(a=rg(),wc=ce=Ba=null,mb=!1,a):null;switch(a){case "paste":return null;case "keypress":if(!(b.ctrlKey||b.altKey||b.metaKey)||b.ctrlKey&&b.altKey){if(b.char&&1<b.char.length)return b.char;if(b.which)return String.fromCharCode(b.which)}return null;
case "compositionend":return xg&&"ko"!==b.locale?null:b.data;default:return null}}function yg(a){var b=a&&a.nodeName&&a.nodeName.toLowerCase();return "input"===b?!!Qi[a.type]:"textarea"===b?!0:!1}function zg(a,b,c){a=R.getPooled(Ag.change,a,b,c);a.type="change";yf(c);lb(a);return a}function Ri(a){pc(a);}function zc(a){var b=Pa(a);if(Gf(b))return a}function Si(a,b){if("change"===a)return b}function Bg(){Mb&&(Mb.detachEvent("onpropertychange",Cg),Nb=Mb=null);}function Cg(a){if("value"===a.propertyName&&
zc(Nb))if(a=zg(Nb,a,Ld(a)),Oa)pc(a);else {Oa=!0;try{ee(Ri,a);}finally{Oa=!1,yd();}}}function Ti(a,b,c){"focus"===a?(Bg(),Mb=b,Nb=c,Mb.attachEvent("onpropertychange",Cg)):"blur"===a&&Bg();}function Ui(a,b){if("selectionchange"===a||"keyup"===a||"keydown"===a)return zc(Nb)}function Vi(a,b){if("click"===a)return zc(b)}function Wi(a,b){if("input"===a||"change"===a)return zc(b)}function Xi(a){var b=this.nativeEvent;return b.getModifierState?b.getModifierState(a):(a=Yi[a])?!!b[a]:!1}function fe(a){return Xi}
function Zi(a,b){return a===b&&(0!==a||1/a===1/b)||a!==a&&b!==b}function Ob(a,b){if(Qa(a,b))return !0;if("object"!==typeof a||null===a||"object"!==typeof b||null===b)return !1;var c=Object.keys(a),d=Object.keys(b);if(c.length!==d.length)return !1;for(d=0;d<c.length;d++)if(!$i.call(b,c[d])||!Qa(a[c[d]],b[c[d]]))return !1;return !0}function Dg(a,b){var c=b.window===b?b.document:9===b.nodeType?b:b.ownerDocument;if(ge||null==nb||nb!==Wd(c))return null;c=nb;"selectionStart"in c&&Xd(c)?c={start:c.selectionStart,
end:c.selectionEnd}:(c=(c.ownerDocument&&c.ownerDocument.defaultView||window).getSelection(),c={anchorNode:c.anchorNode,anchorOffset:c.anchorOffset,focusNode:c.focusNode,focusOffset:c.focusOffset});return Pb&&Ob(Pb,c)?null:(Pb=c,a=R.getPooled(Eg.select,he,a,b),a.type="select",a.target=nb,lb(a),a)}function Ac(a){var b=a.keyCode;"charCode"in a?(a=a.charCode,0===a&&13===b&&(a=13)):a=b;10===a&&(a=13);return 32<=a||13===a?a:0}function q(a,b){0>ob||(a.current=ie[ob],ie[ob]=null,ob--);}function y(a,b,c){ob++;
ie[ob]=a.current;a.current=b;}function pb(a,b){var c=a.type.contextTypes;if(!c)return Ca;var d=a.stateNode;if(d&&d.__reactInternalMemoizedUnmaskedChildContext===b)return d.__reactInternalMemoizedMaskedChildContext;var e={},f;for(f in c)e[f]=b[f];d&&(a=a.stateNode,a.__reactInternalMemoizedUnmaskedChildContext=b,a.__reactInternalMemoizedMaskedChildContext=e);return e}function N(a){a=a.childContextTypes;return null!==a&&void 0!==a}function Fg(a,b,c){if(B.current!==Ca)throw Error(k(168));y(B,b);y(G,c);}
function Gg(a,b,c){var d=a.stateNode;a=b.childContextTypes;if("function"!==typeof d.getChildContext)return c;d=d.getChildContext();for(var e in d)if(!(e in a))throw Error(k(108,na(b)||"Unknown",e));return M({},c,{},d)}function Bc(a){a=(a=a.stateNode)&&a.__reactInternalMemoizedMergedChildContext||Ca;Ra=B.current;y(B,a);y(G,G.current);return !0}function Hg(a,b,c){var d=a.stateNode;if(!d)throw Error(k(169));c?(a=Gg(a,b,Ra),d.__reactInternalMemoizedMergedChildContext=a,q(G),q(B),y(B,a)):q(G);y(G,c);}function Cc(){switch(aj()){case Dc:return 99;
case Ig:return 98;case Jg:return 97;case Kg:return 96;case Lg:return 95;default:throw Error(k(332));}}function Mg(a){switch(a){case 99:return Dc;case 98:return Ig;case 97:return Jg;case 96:return Kg;case 95:return Lg;default:throw Error(k(332));}}function Da(a,b){a=Mg(a);return bj(a,b)}function Ng(a,b,c){a=Mg(a);return je(a,b,c)}function Og(a){null===qa?(qa=[a],Ec=je(Dc,Pg)):qa.push(a);return Qg}function ha(){if(null!==Ec){var a=Ec;Ec=null;Rg(a);}Pg();}function Pg(){if(!ke&&null!==qa){ke=!0;var a=0;
try{var b=qa;Da(99,function(){for(;a<b.length;a++){var c=b[a];do c=c(!0);while(null!==c)}});qa=null;}catch(c){throw (null!==qa&&(qa=qa.slice(a+1)), je(Dc,ha), c);}finally{ke=!1;}}}function Fc(a,b,c){c/=10;return 1073741821-(((1073741821-a+b/10)/c|0)+1)*c}function aa(a,b){if(a&&a.defaultProps){b=M({},b);a=a.defaultProps;for(var c in a)void 0===b[c]&&(b[c]=a[c]);}return b}function le(){Gc=qb=Hc=null;}function me(a){var b=Ic.current;q(Ic);a.type._context._currentValue=b;}function Sg(a,b){for(;null!==a;){var c=
a.alternate;if(a.childExpirationTime<b)a.childExpirationTime=b,null!==c&&c.childExpirationTime<b&&(c.childExpirationTime=b);else if(null!==c&&c.childExpirationTime<b)c.childExpirationTime=b;else break;a=a.return;}}function rb(a,b){Hc=a;Gc=qb=null;a=a.dependencies;null!==a&&null!==a.firstContext&&(a.expirationTime>=b&&(ia=!0),a.firstContext=null);}function W(a,b){if(Gc!==a&&!1!==b&&0!==b){if("number"!==typeof b||1073741823===b)Gc=a,b=1073741823;b={context:a,observedBits:b,next:null};if(null===qb){if(null===
Hc)throw Error(k(308));qb=b;Hc.dependencies={expirationTime:0,firstContext:b,responders:null};}else qb=qb.next=b;}return a._currentValue}function ne(a){a.updateQueue={baseState:a.memoizedState,baseQueue:null,shared:{pending:null},effects:null};}function oe(a,b){a=a.updateQueue;b.updateQueue===a&&(b.updateQueue={baseState:a.baseState,baseQueue:a.baseQueue,shared:a.shared,effects:a.effects});}function Ea(a,b){a={expirationTime:a,suspenseConfig:b,tag:Tg,payload:null,callback:null,next:null};return a.next=
a}function Fa(a,b){a=a.updateQueue;if(null!==a){a=a.shared;var c=a.pending;null===c?b.next=b:(b.next=c.next,c.next=b);a.pending=b;}}function Ug(a,b){var c=a.alternate;null!==c&&oe(c,a);a=a.updateQueue;c=a.baseQueue;null===c?(a.baseQueue=b.next=b,b.next=b):(b.next=c.next,c.next=b);}function Qb(a,b,c,d){var e=a.updateQueue;Ga=!1;var f=e.baseQueue,g=e.shared.pending;if(null!==g){if(null!==f){var h=f.next;f.next=g.next;g.next=h;}f=g;e.shared.pending=null;h=a.alternate;null!==h&&(h=h.updateQueue,null!==h&&
(h.baseQueue=g));}if(null!==f){h=f.next;var m=e.baseState,n=0,k=null,ba=null,l=null;if(null!==h){var p=h;do{g=p.expirationTime;if(g<d){var t={expirationTime:p.expirationTime,suspenseConfig:p.suspenseConfig,tag:p.tag,payload:p.payload,callback:p.callback,next:null};null===l?(ba=l=t,k=m):l=l.next=t;g>n&&(n=g);}else {null!==l&&(l=l.next={expirationTime:1073741823,suspenseConfig:p.suspenseConfig,tag:p.tag,payload:p.payload,callback:p.callback,next:null});Vg(g,p.suspenseConfig);a:{var q=a,r=p;g=b;t=c;switch(r.tag){case 1:q=
r.payload;if("function"===typeof q){m=q.call(t,m,g);break a}m=q;break a;case 3:q.effectTag=q.effectTag&-4097|64;case Tg:q=r.payload;g="function"===typeof q?q.call(t,m,g):q;if(null===g||void 0===g)break a;m=M({},m,g);break a;case Jc:Ga=!0;}}null!==p.callback&&(a.effectTag|=32,g=e.effects,null===g?e.effects=[p]:g.push(p));}p=p.next;if(null===p||p===h)if(g=e.shared.pending,null===g)break;else p=f.next=g.next,g.next=h,e.baseQueue=f=g,e.shared.pending=null;}while(1)}null===l?k=m:l.next=ba;e.baseState=k;e.baseQueue=
l;Kc(n);a.expirationTime=n;a.memoizedState=m;}}function Wg(a,b,c){a=b.effects;b.effects=null;if(null!==a)for(b=0;b<a.length;b++){var d=a[b],e=d.callback;if(null!==e){d.callback=null;d=e;e=c;if("function"!==typeof d)throw Error(k(191,d));d.call(e);}}}function Lc(a,b,c,d){b=a.memoizedState;c=c(d,b);c=null===c||void 0===c?b:M({},b,c);a.memoizedState=c;0===a.expirationTime&&(a.updateQueue.baseState=c);}function Xg(a,b,c,d,e,f,g){a=a.stateNode;return "function"===typeof a.shouldComponentUpdate?a.shouldComponentUpdate(d,
f,g):b.prototype&&b.prototype.isPureReactComponent?!Ob(c,d)||!Ob(e,f):!0}function Yg(a,b,c){var d=!1,e=Ca;var f=b.contextType;"object"===typeof f&&null!==f?f=W(f):(e=N(b)?Ra:B.current,d=b.contextTypes,f=(d=null!==d&&void 0!==d)?pb(a,e):Ca);b=new b(c,f);a.memoizedState=null!==b.state&&void 0!==b.state?b.state:null;b.updater=Mc;a.stateNode=b;b._reactInternalFiber=a;d&&(a=a.stateNode,a.__reactInternalMemoizedUnmaskedChildContext=e,a.__reactInternalMemoizedMaskedChildContext=f);return b}function Zg(a,
b,c,d){a=b.state;"function"===typeof b.componentWillReceiveProps&&b.componentWillReceiveProps(c,d);"function"===typeof b.UNSAFE_componentWillReceiveProps&&b.UNSAFE_componentWillReceiveProps(c,d);b.state!==a&&Mc.enqueueReplaceState(b,b.state,null);}function pe(a,b,c,d){var e=a.stateNode;e.props=c;e.state=a.memoizedState;e.refs=$g;ne(a);var f=b.contextType;"object"===typeof f&&null!==f?e.context=W(f):(f=N(b)?Ra:B.current,e.context=pb(a,f));Qb(a,c,e,d);e.state=a.memoizedState;f=b.getDerivedStateFromProps;
"function"===typeof f&&(Lc(a,b,f,c),e.state=a.memoizedState);"function"===typeof b.getDerivedStateFromProps||"function"===typeof e.getSnapshotBeforeUpdate||"function"!==typeof e.UNSAFE_componentWillMount&&"function"!==typeof e.componentWillMount||(b=e.state,"function"===typeof e.componentWillMount&&e.componentWillMount(),"function"===typeof e.UNSAFE_componentWillMount&&e.UNSAFE_componentWillMount(),b!==e.state&&Mc.enqueueReplaceState(e,e.state,null),Qb(a,c,e,d),e.state=a.memoizedState);"function"===
typeof e.componentDidMount&&(a.effectTag|=4);}function Rb(a,b,c){a=c.ref;if(null!==a&&"function"!==typeof a&&"object"!==typeof a){if(c._owner){c=c._owner;if(c){if(1!==c.tag)throw Error(k(309));var d=c.stateNode;}if(!d)throw Error(k(147,a));var e=""+a;if(null!==b&&null!==b.ref&&"function"===typeof b.ref&&b.ref._stringRef===e)return b.ref;b=function(a){var b=d.refs;b===$g&&(b=d.refs={});null===a?delete b[e]:b[e]=a;};b._stringRef=e;return b}if("string"!==typeof a)throw Error(k(284));if(!c._owner)throw Error(k(290,
a));}return a}function Nc(a,b){if("textarea"!==a.type)throw Error(k(31,"[object Object]"===Object.prototype.toString.call(b)?"object with keys {"+Object.keys(b).join(", ")+"}":b,""));}function ah(a){function b(b,c){if(a){var d=b.lastEffect;null!==d?(d.nextEffect=c,b.lastEffect=c):b.firstEffect=b.lastEffect=c;c.nextEffect=null;c.effectTag=8;}}function c(c,d){if(!a)return null;for(;null!==d;)b(c,d),d=d.sibling;return null}function d(a,b){for(a=new Map;null!==b;)null!==b.key?a.set(b.key,b):a.set(b.index,
b),b=b.sibling;return a}function e(a,b){a=Sa(a,b);a.index=0;a.sibling=null;return a}function f(b,c,d){b.index=d;if(!a)return c;d=b.alternate;if(null!==d)return d=d.index,d<c?(b.effectTag=2,c):d;b.effectTag=2;return c}function g(b){a&&null===b.alternate&&(b.effectTag=2);return b}function h(a,b,c,d){if(null===b||6!==b.tag)return b=qe(c,a.mode,d),b.return=a,b;b=e(b,c);b.return=a;return b}function m(a,b,c,d){if(null!==b&&b.elementType===c.type)return d=e(b,c.props),d.ref=Rb(a,b,c),d.return=a,d;d=Oc(c.type,
c.key,c.props,null,a.mode,d);d.ref=Rb(a,b,c);d.return=a;return d}function n(a,b,c,d){if(null===b||4!==b.tag||b.stateNode.containerInfo!==c.containerInfo||b.stateNode.implementation!==c.implementation)return b=re(c,a.mode,d),b.return=a,b;b=e(b,c.children||[]);b.return=a;return b}function l(a,b,c,d,f){if(null===b||7!==b.tag)return b=Ha(c,a.mode,d,f),b.return=a,b;b=e(b,c);b.return=a;return b}function ba(a,b,c){if("string"===typeof b||"number"===typeof b)return b=qe(""+b,a.mode,c),b.return=a,b;if("object"===
typeof b&&null!==b){switch(b.$$typeof){case Pc:return c=Oc(b.type,b.key,b.props,null,a.mode,c),c.ref=Rb(a,null,b),c.return=a,c;case cb:return b=re(b,a.mode,c),b.return=a,b}if(Qc(b)||zb(b))return b=Ha(b,a.mode,c,null),b.return=a,b;Nc(a,b);}return null}function p(a,b,c,d){var e=null!==b?b.key:null;if("string"===typeof c||"number"===typeof c)return null!==e?null:h(a,b,""+c,d);if("object"===typeof c&&null!==c){switch(c.$$typeof){case Pc:return c.key===e?c.type===Ma?l(a,b,c.props.children,d,e):m(a,b,c,
d):null;case cb:return c.key===e?n(a,b,c,d):null}if(Qc(c)||zb(c))return null!==e?null:l(a,b,c,d,null);Nc(a,c);}return null}function t(a,b,c,d,e){if("string"===typeof d||"number"===typeof d)return a=a.get(c)||null,h(b,a,""+d,e);if("object"===typeof d&&null!==d){switch(d.$$typeof){case Pc:return a=a.get(null===d.key?c:d.key)||null,d.type===Ma?l(b,a,d.props.children,e,d.key):m(b,a,d,e);case cb:return a=a.get(null===d.key?c:d.key)||null,n(b,a,d,e)}if(Qc(d)||zb(d))return a=a.get(c)||null,l(b,a,d,e,null);
Nc(b,d);}return null}function q(e,g,h,m){for(var n=null,k=null,l=g,r=g=0,C=null;null!==l&&r<h.length;r++){l.index>r?(C=l,l=null):C=l.sibling;var O=p(e,l,h[r],m);if(null===O){null===l&&(l=C);break}a&&l&&null===O.alternate&&b(e,l);g=f(O,g,r);null===k?n=O:k.sibling=O;k=O;l=C;}if(r===h.length)return c(e,l),n;if(null===l){for(;r<h.length;r++)l=ba(e,h[r],m),null!==l&&(g=f(l,g,r),null===k?n=l:k.sibling=l,k=l);return n}for(l=d(e,l);r<h.length;r++)C=t(l,e,r,h[r],m),null!==C&&(a&&null!==C.alternate&&l.delete(null===
C.key?r:C.key),g=f(C,g,r),null===k?n=C:k.sibling=C,k=C);a&&l.forEach(function(a){return b(e,a)});return n}function w(e,g,h,n){var m=zb(h);if("function"!==typeof m)throw Error(k(150));h=m.call(h);if(null==h)throw Error(k(151));for(var l=m=null,r=g,C=g=0,O=null,v=h.next();null!==r&&!v.done;C++,v=h.next()){r.index>C?(O=r,r=null):O=r.sibling;var q=p(e,r,v.value,n);if(null===q){null===r&&(r=O);break}a&&r&&null===q.alternate&&b(e,r);g=f(q,g,C);null===l?m=q:l.sibling=q;l=q;r=O;}if(v.done)return c(e,r),m;
if(null===r){for(;!v.done;C++,v=h.next())v=ba(e,v.value,n),null!==v&&(g=f(v,g,C),null===l?m=v:l.sibling=v,l=v);return m}for(r=d(e,r);!v.done;C++,v=h.next())v=t(r,e,C,v.value,n),null!==v&&(a&&null!==v.alternate&&r.delete(null===v.key?C:v.key),g=f(v,g,C),null===l?m=v:l.sibling=v,l=v);a&&r.forEach(function(a){return b(e,a)});return m}return function(a,d,f,h){var m="object"===typeof f&&null!==f&&f.type===Ma&&null===f.key;m&&(f=f.props.children);var n="object"===typeof f&&null!==f;if(n)switch(f.$$typeof){case Pc:a:{n=
f.key;for(m=d;null!==m;){if(m.key===n){switch(m.tag){case 7:if(f.type===Ma){c(a,m.sibling);d=e(m,f.props.children);d.return=a;a=d;break a}break;default:if(m.elementType===f.type){c(a,m.sibling);d=e(m,f.props);d.ref=Rb(a,m,f);d.return=a;a=d;break a}}c(a,m);break}else b(a,m);m=m.sibling;}f.type===Ma?(d=Ha(f.props.children,a.mode,h,f.key),d.return=a,a=d):(h=Oc(f.type,f.key,f.props,null,a.mode,h),h.ref=Rb(a,d,f),h.return=a,a=h);}return g(a);case cb:a:{for(m=f.key;null!==d;){if(d.key===m)if(4===d.tag&&d.stateNode.containerInfo===
f.containerInfo&&d.stateNode.implementation===f.implementation){c(a,d.sibling);d=e(d,f.children||[]);d.return=a;a=d;break a}else {c(a,d);break}else b(a,d);d=d.sibling;}d=re(f,a.mode,h);d.return=a;a=d;}return g(a)}if("string"===typeof f||"number"===typeof f)return f=""+f,null!==d&&6===d.tag?(c(a,d.sibling),d=e(d,f),d.return=a,a=d):(c(a,d),d=qe(f,a.mode,h),d.return=a,a=d),g(a);if(Qc(f))return q(a,d,f,h);if(zb(f))return w(a,d,f,h);n&&Nc(a,f);if("undefined"===typeof f&&!m)switch(a.tag){case 1:case 0:throw (a=
a.type, Error(k(152,a.displayName||a.name||"Component")));}return c(a,d)};}function Ta(a){if(a===Sb)throw Error(k(174));return a}function se(a,b){y(Tb,b);y(Ub,a);y(ja,Sb);a=b.nodeType;switch(a){case 9:case 11:b=(b=b.documentElement)?b.namespaceURI:Hd(null,"");break;default:a=8===a?b.parentNode:b,b=a.namespaceURI||null,a=a.tagName,b=Hd(b,a);}q(ja);y(ja,b);}function tb(a){q(ja);q(Ub);q(Tb);}function bh(a){Ta(Tb.current);var b=Ta(ja.current);var c=Hd(b,a.type);b!==c&&(y(Ub,a),y(ja,c));}function te(a){Ub.current===
a&&(q(ja),q(Ub));}function Rc(a){for(var b=a;null!==b;){if(13===b.tag){var c=b.memoizedState;if(null!==c&&(c=c.dehydrated,null===c||c.data===$d||c.data===Zd))return b}else if(19===b.tag&&void 0!==b.memoizedProps.revealOrder){if(0!==(b.effectTag&64))return b}else if(null!==b.child){b.child.return=b;b=b.child;continue}if(b===a)break;for(;null===b.sibling;){if(null===b.return||b.return===a)return null;b=b.return;}b.sibling.return=b.return;b=b.sibling;}return null}function ue(a,b){return {responder:a,props:b}}
function S(){throw Error(k(321));}function ve(a,b){if(null===b)return !1;for(var c=0;c<b.length&&c<a.length;c++)if(!Qa(a[c],b[c]))return !1;return !0}function we(a,b,c,d,e,f){Ia=f;z=b;b.memoizedState=null;b.updateQueue=null;b.expirationTime=0;Sc.current=null===a||null===a.memoizedState?dj:ej;a=c(d,e);if(b.expirationTime===Ia){f=0;do{b.expirationTime=0;if(!(25>f))throw Error(k(301));f+=1;J=K=null;b.updateQueue=null;Sc.current=fj;a=c(d,e);}while(b.expirationTime===Ia)}Sc.current=Tc;b=null!==K&&null!==K.next;
Ia=0;J=K=z=null;Uc=!1;if(b)throw Error(k(300));return a}function ub(){var a={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};null===J?z.memoizedState=J=a:J=J.next=a;return J}function vb(){if(null===K){var a=z.alternate;a=null!==a?a.memoizedState:null;}else a=K.next;var b=null===J?z.memoizedState:J.next;if(null!==b)J=b,K=a;else {if(null===a)throw Error(k(310));K=a;a={memoizedState:K.memoizedState,baseState:K.baseState,baseQueue:K.baseQueue,queue:K.queue,next:null};null===J?z.memoizedState=
J=a:J=J.next=a;}return J}function Ua(a,b){return "function"===typeof b?b(a):b}function Vc(a,b,c){b=vb();c=b.queue;if(null===c)throw Error(k(311));c.lastRenderedReducer=a;var d=K,e=d.baseQueue,f=c.pending;if(null!==f){if(null!==e){var g=e.next;e.next=f.next;f.next=g;}d.baseQueue=e=f;c.pending=null;}if(null!==e){e=e.next;d=d.baseState;var h=g=f=null,m=e;do{var n=m.expirationTime;if(n<Ia){var l={expirationTime:m.expirationTime,suspenseConfig:m.suspenseConfig,action:m.action,eagerReducer:m.eagerReducer,eagerState:m.eagerState,
next:null};null===h?(g=h=l,f=d):h=h.next=l;n>z.expirationTime&&(z.expirationTime=n,Kc(n));}else null!==h&&(h=h.next={expirationTime:1073741823,suspenseConfig:m.suspenseConfig,action:m.action,eagerReducer:m.eagerReducer,eagerState:m.eagerState,next:null}),Vg(n,m.suspenseConfig),d=m.eagerReducer===a?m.eagerState:a(d,m.action);m=m.next;}while(null!==m&&m!==e);null===h?f=d:h.next=g;Qa(d,b.memoizedState)||(ia=!0);b.memoizedState=d;b.baseState=f;b.baseQueue=h;c.lastRenderedState=d;}return [b.memoizedState,
c.dispatch]}function Wc(a,b,c){b=vb();c=b.queue;if(null===c)throw Error(k(311));c.lastRenderedReducer=a;var d=c.dispatch,e=c.pending,f=b.memoizedState;if(null!==e){c.pending=null;var g=e=e.next;do f=a(f,g.action),g=g.next;while(g!==e);Qa(f,b.memoizedState)||(ia=!0);b.memoizedState=f;null===b.baseQueue&&(b.baseState=f);c.lastRenderedState=f;}return [f,d]}function xe(a){var b=ub();"function"===typeof a&&(a=a());b.memoizedState=b.baseState=a;a=b.queue={pending:null,dispatch:null,lastRenderedReducer:Ua,
lastRenderedState:a};a=a.dispatch=ch.bind(null,z,a);return [b.memoizedState,a]}function ye(a,b,c,d){a={tag:a,create:b,destroy:c,deps:d,next:null};b=z.updateQueue;null===b?(b={lastEffect:null},z.updateQueue=b,b.lastEffect=a.next=a):(c=b.lastEffect,null===c?b.lastEffect=a.next=a:(d=c.next,c.next=a,a.next=d,b.lastEffect=a));return a}function dh(a){return vb().memoizedState}function ze(a,b,c,d){var e=ub();z.effectTag|=a;e.memoizedState=ye(1|b,c,void 0,void 0===d?null:d);}function Ae(a,b,c,d){var e=vb();
d=void 0===d?null:d;var f=void 0;if(null!==K){var g=K.memoizedState;f=g.destroy;if(null!==d&&ve(d,g.deps)){ye(b,c,f,d);return}}z.effectTag|=a;e.memoizedState=ye(1|b,c,f,d);}function eh(a,b){return ze(516,4,a,b)}function Xc(a,b){return Ae(516,4,a,b)}function fh(a,b){return Ae(4,2,a,b)}function gh(a,b){if("function"===typeof b)return a=a(),b(a),function(){b(null);};if(null!==b&&void 0!==b)return a=a(),b.current=a,function(){b.current=null;}}function hh(a,b,c){c=null!==c&&void 0!==c?c.concat([a]):null;
return Ae(4,2,gh.bind(null,b,a),c)}function Be(a,b){}function ih(a,b){ub().memoizedState=[a,void 0===b?null:b];return a}function Yc(a,b){var c=vb();b=void 0===b?null:b;var d=c.memoizedState;if(null!==d&&null!==b&&ve(b,d[1]))return d[0];c.memoizedState=[a,b];return a}function jh(a,b){var c=vb();b=void 0===b?null:b;var d=c.memoizedState;if(null!==d&&null!==b&&ve(b,d[1]))return d[0];a=a();c.memoizedState=[a,b];return a}function Ce(a,b,c){var d=Cc();Da(98>d?98:d,function(){a(!0);});Da(97<d?97:d,function(){var d=
X.suspense;X.suspense=void 0===b?null:b;try{a(!1),c();}finally{X.suspense=d;}});}function ch(a,b,c){var d=ka(),e=Vb.suspense;d=Va(d,a,e);e={expirationTime:d,suspenseConfig:e,action:c,eagerReducer:null,eagerState:null,next:null};var f=b.pending;null===f?e.next=e:(e.next=f.next,f.next=e);b.pending=e;f=a.alternate;if(a===z||null!==f&&f===z)Uc=!0,e.expirationTime=Ia,z.expirationTime=Ia;else {if(0===a.expirationTime&&(null===f||0===f.expirationTime)&&(f=b.lastRenderedReducer,null!==f))try{var g=b.lastRenderedState,
h=f(g,c);e.eagerReducer=f;e.eagerState=h;if(Qa(h,g))return}catch(m){}finally{}Ja(a,d);}}function kh(a,b){var c=la(5,null,null,0);c.elementType="DELETED";c.type="DELETED";c.stateNode=b;c.return=a;c.effectTag=8;null!==a.lastEffect?(a.lastEffect.nextEffect=c,a.lastEffect=c):a.firstEffect=a.lastEffect=c;}function lh(a,b){switch(a.tag){case 5:var c=a.type;b=1!==b.nodeType||c.toLowerCase()!==b.nodeName.toLowerCase()?null:b;return null!==b?(a.stateNode=b,!0):!1;case 6:return b=""===a.pendingProps||3!==b.nodeType?
null:b,null!==b?(a.stateNode=b,!0):!1;case 13:return !1;default:return !1}}function De(a){if(Wa){var b=Ka;if(b){var c=b;if(!lh(a,b)){b=kb(c.nextSibling);if(!b||!lh(a,b)){a.effectTag=a.effectTag&-1025|2;Wa=!1;ra=a;return}kh(ra,c);}ra=a;Ka=kb(b.firstChild);}else a.effectTag=a.effectTag&-1025|2,Wa=!1,ra=a;}}function mh(a){for(a=a.return;null!==a&&5!==a.tag&&3!==a.tag&&13!==a.tag;)a=a.return;ra=a;}function Zc(a){if(a!==ra)return !1;if(!Wa)return mh(a),Wa=!0,!1;var b=a.type;if(5!==a.tag||"head"!==b&&"body"!==
b&&!Yd(b,a.memoizedProps))for(b=Ka;b;)kh(a,b),b=kb(b.nextSibling);mh(a);if(13===a.tag){a=a.memoizedState;a=null!==a?a.dehydrated:null;if(!a)throw Error(k(317));a:{a=a.nextSibling;for(b=0;a;){if(8===a.nodeType){var c=a.data;if(c===og){if(0===b){Ka=kb(a.nextSibling);break a}b--;}else c!==ng&&c!==Zd&&c!==$d||b++;}a=a.nextSibling;}Ka=null;}}else Ka=ra?kb(a.stateNode.nextSibling):null;return !0}function Ee(){Ka=ra=null;Wa=!1;}function T(a,b,c,d){b.child=null===a?Fe(b,null,c,d):wb(b,a.child,c,d);}function nh(a,
b,c,d,e){c=c.render;var f=b.ref;rb(b,e);d=we(a,b,c,d,f,e);if(null!==a&&!ia)return b.updateQueue=a.updateQueue,b.effectTag&=-517,a.expirationTime<=e&&(a.expirationTime=0),sa(a,b,e);b.effectTag|=1;T(a,b,d,e);return b.child}function oh(a,b,c,d,e,f){if(null===a){var g=c.type;if("function"===typeof g&&!Ge(g)&&void 0===g.defaultProps&&null===c.compare&&void 0===c.defaultProps)return b.tag=15,b.type=g,ph(a,b,g,d,e,f);a=Oc(c.type,null,d,null,b.mode,f);a.ref=b.ref;a.return=b;return b.child=a}g=a.child;if(e<
f&&(e=g.memoizedProps,c=c.compare,c=null!==c?c:Ob,c(e,d)&&a.ref===b.ref))return sa(a,b,f);b.effectTag|=1;a=Sa(g,d);a.ref=b.ref;a.return=b;return b.child=a}function ph(a,b,c,d,e,f){return null!==a&&Ob(a.memoizedProps,d)&&a.ref===b.ref&&(ia=!1,e<f)?(b.expirationTime=a.expirationTime,sa(a,b,f)):He(a,b,c,d,f)}function qh(a,b){var c=b.ref;if(null===a&&null!==c||null!==a&&a.ref!==c)b.effectTag|=128;}function He(a,b,c,d,e){var f=N(c)?Ra:B.current;f=pb(b,f);rb(b,e);c=we(a,b,c,d,f,e);if(null!==a&&!ia)return b.updateQueue=
a.updateQueue,b.effectTag&=-517,a.expirationTime<=e&&(a.expirationTime=0),sa(a,b,e);b.effectTag|=1;T(a,b,c,e);return b.child}function rh(a,b,c,d,e){if(N(c)){var f=!0;Bc(b);}else f=!1;rb(b,e);if(null===b.stateNode)null!==a&&(a.alternate=null,b.alternate=null,b.effectTag|=2),Yg(b,c,d),pe(b,c,d,e),d=!0;else if(null===a){var g=b.stateNode,h=b.memoizedProps;g.props=h;var m=g.context,n=c.contextType;"object"===typeof n&&null!==n?n=W(n):(n=N(c)?Ra:B.current,n=pb(b,n));var l=c.getDerivedStateFromProps,k="function"===
typeof l||"function"===typeof g.getSnapshotBeforeUpdate;k||"function"!==typeof g.UNSAFE_componentWillReceiveProps&&"function"!==typeof g.componentWillReceiveProps||(h!==d||m!==n)&&Zg(b,g,d,n);Ga=!1;var p=b.memoizedState;g.state=p;Qb(b,d,g,e);m=b.memoizedState;h!==d||p!==m||G.current||Ga?("function"===typeof l&&(Lc(b,c,l,d),m=b.memoizedState),(h=Ga||Xg(b,c,h,d,p,m,n))?(k||"function"!==typeof g.UNSAFE_componentWillMount&&"function"!==typeof g.componentWillMount||("function"===typeof g.componentWillMount&&
g.componentWillMount(),"function"===typeof g.UNSAFE_componentWillMount&&g.UNSAFE_componentWillMount()),"function"===typeof g.componentDidMount&&(b.effectTag|=4)):("function"===typeof g.componentDidMount&&(b.effectTag|=4),b.memoizedProps=d,b.memoizedState=m),g.props=d,g.state=m,g.context=n,d=h):("function"===typeof g.componentDidMount&&(b.effectTag|=4),d=!1);}else g=b.stateNode,oe(a,b),h=b.memoizedProps,g.props=b.type===b.elementType?h:aa(b.type,h),m=g.context,n=c.contextType,"object"===typeof n&&null!==
n?n=W(n):(n=N(c)?Ra:B.current,n=pb(b,n)),l=c.getDerivedStateFromProps,(k="function"===typeof l||"function"===typeof g.getSnapshotBeforeUpdate)||"function"!==typeof g.UNSAFE_componentWillReceiveProps&&"function"!==typeof g.componentWillReceiveProps||(h!==d||m!==n)&&Zg(b,g,d,n),Ga=!1,m=b.memoizedState,g.state=m,Qb(b,d,g,e),p=b.memoizedState,h!==d||m!==p||G.current||Ga?("function"===typeof l&&(Lc(b,c,l,d),p=b.memoizedState),(l=Ga||Xg(b,c,h,d,m,p,n))?(k||"function"!==typeof g.UNSAFE_componentWillUpdate&&
"function"!==typeof g.componentWillUpdate||("function"===typeof g.componentWillUpdate&&g.componentWillUpdate(d,p,n),"function"===typeof g.UNSAFE_componentWillUpdate&&g.UNSAFE_componentWillUpdate(d,p,n)),"function"===typeof g.componentDidUpdate&&(b.effectTag|=4),"function"===typeof g.getSnapshotBeforeUpdate&&(b.effectTag|=256)):("function"!==typeof g.componentDidUpdate||h===a.memoizedProps&&m===a.memoizedState||(b.effectTag|=4),"function"!==typeof g.getSnapshotBeforeUpdate||h===a.memoizedProps&&m===
a.memoizedState||(b.effectTag|=256),b.memoizedProps=d,b.memoizedState=p),g.props=d,g.state=p,g.context=n,d=l):("function"!==typeof g.componentDidUpdate||h===a.memoizedProps&&m===a.memoizedState||(b.effectTag|=4),"function"!==typeof g.getSnapshotBeforeUpdate||h===a.memoizedProps&&m===a.memoizedState||(b.effectTag|=256),d=!1);return Ie(a,b,c,d,f,e)}function Ie(a,b,c,d,e,f){qh(a,b);var g=0!==(b.effectTag&64);if(!d&&!g)return e&&Hg(b,c,!1),sa(a,b,f);d=b.stateNode;gj.current=b;var h=g&&"function"!==typeof c.getDerivedStateFromError?
null:d.render();b.effectTag|=1;null!==a&&g?(b.child=wb(b,a.child,null,f),b.child=wb(b,null,h,f)):T(a,b,h,f);b.memoizedState=d.state;e&&Hg(b,c,!0);return b.child}function sh(a){var b=a.stateNode;b.pendingContext?Fg(a,b.pendingContext,b.pendingContext!==b.context):b.context&&Fg(a,b.context,!1);se(a,b.containerInfo);}function th(a,b,c){var d=b.mode,e=b.pendingProps,f=D.current,g=!1,h;(h=0!==(b.effectTag&64))||(h=0!==(f&2)&&(null===a||null!==a.memoizedState));h?(g=!0,b.effectTag&=-65):null!==a&&null===
a.memoizedState||void 0===e.fallback||!0===e.unstable_avoidThisFallback||(f|=1);y(D,f&1);if(null===a){void 0!==e.fallback&&De(b);if(g){g=e.fallback;e=Ha(null,d,0,null);e.return=b;if(0===(b.mode&2))for(a=null!==b.memoizedState?b.child.child:b.child,e.child=a;null!==a;)a.return=e,a=a.sibling;c=Ha(g,d,c,null);c.return=b;e.sibling=c;b.memoizedState=Je;b.child=e;return c}d=e.children;b.memoizedState=null;return b.child=Fe(b,null,d,c)}if(null!==a.memoizedState){a=a.child;d=a.sibling;if(g){e=e.fallback;
c=Sa(a,a.pendingProps);c.return=b;if(0===(b.mode&2)&&(g=null!==b.memoizedState?b.child.child:b.child,g!==a.child))for(c.child=g;null!==g;)g.return=c,g=g.sibling;d=Sa(d,e);d.return=b;c.sibling=d;c.childExpirationTime=0;b.memoizedState=Je;b.child=c;return d}c=wb(b,a.child,e.children,c);b.memoizedState=null;return b.child=c}a=a.child;if(g){g=e.fallback;e=Ha(null,d,0,null);e.return=b;e.child=a;null!==a&&(a.return=e);if(0===(b.mode&2))for(a=null!==b.memoizedState?b.child.child:b.child,e.child=a;null!==
a;)a.return=e,a=a.sibling;c=Ha(g,d,c,null);c.return=b;e.sibling=c;c.effectTag|=2;e.childExpirationTime=0;b.memoizedState=Je;b.child=e;return c}b.memoizedState=null;return b.child=wb(b,a,e.children,c)}function uh(a,b){a.expirationTime<b&&(a.expirationTime=b);var c=a.alternate;null!==c&&c.expirationTime<b&&(c.expirationTime=b);Sg(a.return,b);}function Ke(a,b,c,d,e,f){var g=a.memoizedState;null===g?a.memoizedState={isBackwards:b,rendering:null,renderingStartTime:0,last:d,tail:c,tailExpiration:0,tailMode:e,
lastEffect:f}:(g.isBackwards=b,g.rendering=null,g.renderingStartTime=0,g.last=d,g.tail=c,g.tailExpiration=0,g.tailMode=e,g.lastEffect=f);}function vh(a,b,c){var d=b.pendingProps,e=d.revealOrder,f=d.tail;T(a,b,d.children,c);d=D.current;if(0!==(d&2))d=d&1|2,b.effectTag|=64;else {if(null!==a&&0!==(a.effectTag&64))a:for(a=b.child;null!==a;){if(13===a.tag)null!==a.memoizedState&&uh(a,c);else if(19===a.tag)uh(a,c);else if(null!==a.child){a.child.return=a;a=a.child;continue}if(a===b)break a;for(;null===a.sibling;){if(null===
a.return||a.return===b)break a;a=a.return;}a.sibling.return=a.return;a=a.sibling;}d&=1;}y(D,d);if(0===(b.mode&2))b.memoizedState=null;else switch(e){case "forwards":c=b.child;for(e=null;null!==c;)a=c.alternate,null!==a&&null===Rc(a)&&(e=c),c=c.sibling;c=e;null===c?(e=b.child,b.child=null):(e=c.sibling,c.sibling=null);Ke(b,!1,e,c,f,b.lastEffect);break;case "backwards":c=null;e=b.child;for(b.child=null;null!==e;){a=e.alternate;if(null!==a&&null===Rc(a)){b.child=e;break}a=e.sibling;e.sibling=c;c=e;e=a;}Ke(b,
!0,c,null,f,b.lastEffect);break;case "together":Ke(b,!1,null,null,void 0,b.lastEffect);break;default:b.memoizedState=null;}return b.child}function sa(a,b,c){null!==a&&(b.dependencies=a.dependencies);var d=b.expirationTime;0!==d&&Kc(d);if(b.childExpirationTime<c)return null;if(null!==a&&b.child!==a.child)throw Error(k(153));if(null!==b.child){a=b.child;c=Sa(a,a.pendingProps);b.child=c;for(c.return=b;null!==a.sibling;)a=a.sibling,c=c.sibling=Sa(a,a.pendingProps),c.return=b;c.sibling=null;}return b.child}
function $c(a,b){switch(a.tailMode){case "hidden":b=a.tail;for(var c=null;null!==b;)null!==b.alternate&&(c=b),b=b.sibling;null===c?a.tail=null:c.sibling=null;break;case "collapsed":c=a.tail;for(var d=null;null!==c;)null!==c.alternate&&(d=c),c=c.sibling;null===d?b||null===a.tail?a.tail=null:a.tail.sibling=null:d.sibling=null;}}function hj(a,b,c){var d=b.pendingProps;switch(b.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return null;case 1:return N(b.type)&&(q(G),q(B)),
null;case 3:return tb(),q(G),q(B),c=b.stateNode,c.pendingContext&&(c.context=c.pendingContext,c.pendingContext=null),null!==a&&null!==a.child||!Zc(b)||(b.effectTag|=4),null;case 5:te(b);c=Ta(Tb.current);var e=b.type;if(null!==a&&null!=b.stateNode)ij(a,b,e,d,c),a.ref!==b.ref&&(b.effectTag|=128);else {if(!d){if(null===b.stateNode)throw Error(k(166));return null}a=Ta(ja.current);if(Zc(b)){d=b.stateNode;e=b.type;var f=b.memoizedProps;d[Aa]=b;d[vc]=f;switch(e){case "iframe":case "object":case "embed":w("load",
d);break;case "video":case "audio":for(a=0;a<Db.length;a++)w(Db[a],d);break;case "source":w("error",d);break;case "img":case "image":case "link":w("error",d);w("load",d);break;case "form":w("reset",d);w("submit",d);break;case "details":w("toggle",d);break;case "input":Hf(d,f);w("invalid",d);oa(c,"onChange");break;case "select":d._wrapperState={wasMultiple:!!f.multiple};w("invalid",d);oa(c,"onChange");break;case "textarea":Kf(d,f),w("invalid",d),oa(c,"onChange");}Ud(e,f);a=null;for(var g in f)if(f.hasOwnProperty(g)){var h=
f[g];"children"===g?"string"===typeof h?d.textContent!==h&&(a=["children",h]):"number"===typeof h&&d.textContent!==""+h&&(a=["children",""+h]):eb.hasOwnProperty(g)&&null!=h&&oa(c,g);}switch(e){case "input":mc(d);Jf(d,f,!0);break;case "textarea":mc(d);Mf(d);break;case "select":case "option":break;default:"function"===typeof f.onClick&&(d.onclick=uc);}c=a;b.updateQueue=c;null!==c&&(b.effectTag|=4);}else {g=9===c.nodeType?c:c.ownerDocument;"http://www.w3.org/1999/xhtml"===a&&(a=Nf(e));"http://www.w3.org/1999/xhtml"===
a?"script"===e?(a=g.createElement("div"),a.innerHTML="<script>\x3c/script>",a=a.removeChild(a.firstChild)):"string"===typeof d.is?a=g.createElement(e,{is:d.is}):(a=g.createElement(e),"select"===e&&(g=a,d.multiple?g.multiple=!0:d.size&&(g.size=d.size))):a=g.createElementNS(a,e);a[Aa]=b;a[vc]=d;jj(a,b,!1);b.stateNode=a;g=Vd(e,d);switch(e){case "iframe":case "object":case "embed":w("load",a);h=d;break;case "video":case "audio":for(h=0;h<Db.length;h++)w(Db[h],a);h=d;break;case "source":w("error",a);
h=d;break;case "img":case "image":case "link":w("error",a);w("load",a);h=d;break;case "form":w("reset",a);w("submit",a);h=d;break;case "details":w("toggle",a);h=d;break;case "input":Hf(a,d);h=Cd(a,d);w("invalid",a);oa(c,"onChange");break;case "option":h=Fd(a,d);break;case "select":a._wrapperState={wasMultiple:!!d.multiple};h=M({},d,{value:void 0});w("invalid",a);oa(c,"onChange");break;case "textarea":Kf(a,d);h=Gd(a,d);w("invalid",a);oa(c,"onChange");break;default:h=d;}Ud(e,h);var m=h;for(f in m)if(m.hasOwnProperty(f)){var n=
m[f];"style"===f?gg(a,n):"dangerouslySetInnerHTML"===f?(n=n?n.__html:void 0,null!=n&&xh(a,n)):"children"===f?"string"===typeof n?("textarea"!==e||""!==n)&&Wb(a,n):"number"===typeof n&&Wb(a,""+n):"suppressContentEditableWarning"!==f&&"suppressHydrationWarning"!==f&&"autoFocus"!==f&&(eb.hasOwnProperty(f)?null!=n&&oa(c,f):null!=n&&Bd(a,f,n,g));}switch(e){case "input":mc(a);Jf(a,d,!1);break;case "textarea":mc(a);Mf(a);break;case "option":null!=d.value&&a.setAttribute("value",""+va(d.value));break;case "select":a.multiple=
!!d.multiple;c=d.value;null!=c?hb(a,!!d.multiple,c,!1):null!=d.defaultValue&&hb(a,!!d.multiple,d.defaultValue,!0);break;default:"function"===typeof h.onClick&&(a.onclick=uc);}lg(e,d)&&(b.effectTag|=4);}null!==b.ref&&(b.effectTag|=128);}return null;case 6:if(a&&null!=b.stateNode)kj(a,b,a.memoizedProps,d);else {if("string"!==typeof d&&null===b.stateNode)throw Error(k(166));c=Ta(Tb.current);Ta(ja.current);Zc(b)?(c=b.stateNode,d=b.memoizedProps,c[Aa]=b,c.nodeValue!==d&&(b.effectTag|=4)):(c=(9===c.nodeType?
c:c.ownerDocument).createTextNode(d),c[Aa]=b,b.stateNode=c);}return null;case 13:q(D);d=b.memoizedState;if(0!==(b.effectTag&64))return b.expirationTime=c,b;c=null!==d;d=!1;null===a?void 0!==b.memoizedProps.fallback&&Zc(b):(e=a.memoizedState,d=null!==e,c||null===e||(e=a.child.sibling,null!==e&&(f=b.firstEffect,null!==f?(b.firstEffect=e,e.nextEffect=f):(b.firstEffect=b.lastEffect=e,e.nextEffect=null),e.effectTag=8)));if(c&&!d&&0!==(b.mode&2))if(null===a&&!0!==b.memoizedProps.unstable_avoidThisFallback||
0!==(D.current&1))F===Xa&&(F=ad);else {if(F===Xa||F===ad)F=bd;0!==Xb&&null!==U&&(Ya(U,P),yh(U,Xb));}if(c||d)b.effectTag|=4;return null;case 4:return tb(),null;case 10:return me(b),null;case 17:return N(b.type)&&(q(G),q(B)),null;case 19:q(D);d=b.memoizedState;if(null===d)return null;e=0!==(b.effectTag&64);f=d.rendering;if(null===f)if(e)$c(d,!1);else {if(F!==Xa||null!==a&&0!==(a.effectTag&64))for(f=b.child;null!==f;){a=Rc(f);if(null!==a){b.effectTag|=64;$c(d,!1);e=a.updateQueue;null!==e&&(b.updateQueue=
e,b.effectTag|=4);null===d.lastEffect&&(b.firstEffect=null);b.lastEffect=d.lastEffect;for(d=b.child;null!==d;)e=d,f=c,e.effectTag&=2,e.nextEffect=null,e.firstEffect=null,e.lastEffect=null,a=e.alternate,null===a?(e.childExpirationTime=0,e.expirationTime=f,e.child=null,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null):(e.childExpirationTime=a.childExpirationTime,e.expirationTime=a.expirationTime,e.child=a.child,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,
e.updateQueue=a.updateQueue,f=a.dependencies,e.dependencies=null===f?null:{expirationTime:f.expirationTime,firstContext:f.firstContext,responders:f.responders}),d=d.sibling;y(D,D.current&1|2);return b.child}f=f.sibling;}}else {if(!e)if(a=Rc(f),null!==a){if(b.effectTag|=64,e=!0,c=a.updateQueue,null!==c&&(b.updateQueue=c,b.effectTag|=4),$c(d,!0),null===d.tail&&"hidden"===d.tailMode&&!f.alternate)return b=b.lastEffect=d.lastEffect,null!==b&&(b.nextEffect=null),null}else 2*Y()-d.renderingStartTime>d.tailExpiration&&
1<c&&(b.effectTag|=64,e=!0,$c(d,!1),b.expirationTime=b.childExpirationTime=c-1);d.isBackwards?(f.sibling=b.child,b.child=f):(c=d.last,null!==c?c.sibling=f:b.child=f,d.last=f);}return null!==d.tail?(0===d.tailExpiration&&(d.tailExpiration=Y()+500),c=d.tail,d.rendering=c,d.tail=c.sibling,d.lastEffect=b.lastEffect,d.renderingStartTime=Y(),c.sibling=null,b=D.current,y(D,e?b&1|2:b&1),c):null}throw Error(k(156,b.tag));}function lj(a,b){switch(a.tag){case 1:return N(a.type)&&(q(G),q(B)),b=a.effectTag,b&4096?
(a.effectTag=b&-4097|64,a):null;case 3:tb();q(G);q(B);b=a.effectTag;if(0!==(b&64))throw Error(k(285));a.effectTag=b&-4097|64;return a;case 5:return te(a),null;case 13:return q(D),b=a.effectTag,b&4096?(a.effectTag=b&-4097|64,a):null;case 19:return q(D),null;case 4:return tb(),null;case 10:return me(a),null;default:return null}}function Le(a,b){return {value:a,source:b,stack:td(b)}}function Me(a,b){var c=b.source,d=b.stack;null===d&&null!==c&&(d=td(c));null!==c&&na(c.type);b=b.value;null!==a&&1===a.tag&&
na(a.type);try{console.error(b);}catch(e){setTimeout(function(){throw e;});}}function mj(a,b){try{b.props=a.memoizedProps,b.state=a.memoizedState,b.componentWillUnmount();}catch(c){Za(a,c);}}function zh(a){var b=a.ref;if(null!==b)if("function"===typeof b)try{b(null);}catch(c){Za(a,c);}else b.current=null;}function nj(a,b){switch(b.tag){case 0:case 11:case 15:case 22:return;case 1:if(b.effectTag&256&&null!==a){var c=a.memoizedProps,d=a.memoizedState;a=b.stateNode;b=a.getSnapshotBeforeUpdate(b.elementType===
b.type?c:aa(b.type,c),d);a.__reactInternalSnapshotBeforeUpdate=b;}return;case 3:case 5:case 6:case 4:case 17:return}throw Error(k(163));}function Ah(a,b){b=b.updateQueue;b=null!==b?b.lastEffect:null;if(null!==b){var c=b=b.next;do{if((c.tag&a)===a){var d=c.destroy;c.destroy=void 0;void 0!==d&&d();}c=c.next;}while(c!==b)}}function Bh(a,b){b=b.updateQueue;b=null!==b?b.lastEffect:null;if(null!==b){var c=b=b.next;do{if((c.tag&a)===a){var d=c.create;c.destroy=d();}c=c.next;}while(c!==b)}}function oj(a,b,c,d){switch(c.tag){case 0:case 11:case 15:case 22:Bh(3,
c);return;case 1:a=c.stateNode;c.effectTag&4&&(null===b?a.componentDidMount():(d=c.elementType===c.type?b.memoizedProps:aa(c.type,b.memoizedProps),a.componentDidUpdate(d,b.memoizedState,a.__reactInternalSnapshotBeforeUpdate)));b=c.updateQueue;null!==b&&Wg(c,b,a);return;case 3:b=c.updateQueue;if(null!==b){a=null;if(null!==c.child)switch(c.child.tag){case 5:a=c.child.stateNode;break;case 1:a=c.child.stateNode;}Wg(c,b,a);}return;case 5:a=c.stateNode;null===b&&c.effectTag&4&&lg(c.type,c.memoizedProps)&&
a.focus();return;case 6:return;case 4:return;case 12:return;case 13:null===c.memoizedState&&(c=c.alternate,null!==c&&(c=c.memoizedState,null!==c&&(c=c.dehydrated,null!==c&&bg(c))));return;case 19:case 17:case 20:case 21:return}throw Error(k(163));}function Ch(a,b,c){"function"===typeof Ne&&Ne(b);switch(b.tag){case 0:case 11:case 14:case 15:case 22:a=b.updateQueue;if(null!==a&&(a=a.lastEffect,null!==a)){var d=a.next;Da(97<c?97:c,function(){var a=d;do{var c=a.destroy;if(void 0!==c){var g=b;try{c();}catch(h){Za(g,
h);}}a=a.next;}while(a!==d)});}break;case 1:zh(b);c=b.stateNode;"function"===typeof c.componentWillUnmount&&mj(b,c);break;case 5:zh(b);break;case 4:Dh(a,b,c);}}function Eh(a){var b=a.alternate;a.return=null;a.child=null;a.memoizedState=null;a.updateQueue=null;a.dependencies=null;a.alternate=null;a.firstEffect=null;a.lastEffect=null;a.pendingProps=null;a.memoizedProps=null;a.stateNode=null;null!==b&&Eh(b);}function Fh(a){return 5===a.tag||3===a.tag||4===a.tag}function Gh(a){a:{for(var b=a.return;null!==
b;){if(Fh(b)){var c=b;break a}b=b.return;}throw Error(k(160));}b=c.stateNode;switch(c.tag){case 5:var d=!1;break;case 3:b=b.containerInfo;d=!0;break;case 4:b=b.containerInfo;d=!0;break;default:throw Error(k(161));}c.effectTag&16&&(Wb(b,""),c.effectTag&=-17);a:b:for(c=a;;){for(;null===c.sibling;){if(null===c.return||Fh(c.return)){c=null;break a}c=c.return;}c.sibling.return=c.return;for(c=c.sibling;5!==c.tag&&6!==c.tag&&18!==c.tag;){if(c.effectTag&2)continue b;if(null===c.child||4===c.tag)continue b;
else c.child.return=c,c=c.child;}if(!(c.effectTag&2)){c=c.stateNode;break a}}d?Oe(a,c,b):Pe(a,c,b);}function Oe(a,b,c){var d=a.tag,e=5===d||6===d;if(e)a=e?a.stateNode:a.stateNode.instance,b?8===c.nodeType?c.parentNode.insertBefore(a,b):c.insertBefore(a,b):(8===c.nodeType?(b=c.parentNode,b.insertBefore(a,c)):(b=c,b.appendChild(a)),c=c._reactRootContainer,null!==c&&void 0!==c||null!==b.onclick||(b.onclick=uc));else if(4!==d&&(a=a.child,null!==a))for(Oe(a,b,c),a=a.sibling;null!==a;)Oe(a,b,c),a=a.sibling;}
function Pe(a,b,c){var d=a.tag,e=5===d||6===d;if(e)a=e?a.stateNode:a.stateNode.instance,b?c.insertBefore(a,b):c.appendChild(a);else if(4!==d&&(a=a.child,null!==a))for(Pe(a,b,c),a=a.sibling;null!==a;)Pe(a,b,c),a=a.sibling;}function Dh(a,b,c){for(var d=b,e=!1,f,g;;){if(!e){e=d.return;a:for(;;){if(null===e)throw Error(k(160));f=e.stateNode;switch(e.tag){case 5:g=!1;break a;case 3:f=f.containerInfo;g=!0;break a;case 4:f=f.containerInfo;g=!0;break a}e=e.return;}e=!0;}if(5===d.tag||6===d.tag){a:for(var h=
a,m=d,n=c,l=m;;)if(Ch(h,l,n),null!==l.child&&4!==l.tag)l.child.return=l,l=l.child;else {if(l===m)break a;for(;null===l.sibling;){if(null===l.return||l.return===m)break a;l=l.return;}l.sibling.return=l.return;l=l.sibling;}g?(h=f,m=d.stateNode,8===h.nodeType?h.parentNode.removeChild(m):h.removeChild(m)):f.removeChild(d.stateNode);}else if(4===d.tag){if(null!==d.child){f=d.stateNode.containerInfo;g=!0;d.child.return=d;d=d.child;continue}}else if(Ch(a,d,c),null!==d.child){d.child.return=d;d=d.child;continue}if(d===
b)break;for(;null===d.sibling;){if(null===d.return||d.return===b)return;d=d.return;4===d.tag&&(e=!1);}d.sibling.return=d.return;d=d.sibling;}}function Qe(a,b){switch(b.tag){case 0:case 11:case 14:case 15:case 22:Ah(3,b);return;case 1:return;case 5:var c=b.stateNode;if(null!=c){var d=b.memoizedProps,e=null!==a?a.memoizedProps:d;a=b.type;var f=b.updateQueue;b.updateQueue=null;if(null!==f){c[vc]=d;"input"===a&&"radio"===d.type&&null!=d.name&&If(c,d);Vd(a,e);b=Vd(a,d);for(e=0;e<f.length;e+=2){var g=f[e],
h=f[e+1];"style"===g?gg(c,h):"dangerouslySetInnerHTML"===g?xh(c,h):"children"===g?Wb(c,h):Bd(c,g,h,b);}switch(a){case "input":Dd(c,d);break;case "textarea":Lf(c,d);break;case "select":b=c._wrapperState.wasMultiple,c._wrapperState.wasMultiple=!!d.multiple,a=d.value,null!=a?hb(c,!!d.multiple,a,!1):b!==!!d.multiple&&(null!=d.defaultValue?hb(c,!!d.multiple,d.defaultValue,!0):hb(c,!!d.multiple,d.multiple?[]:"",!1));}}}return;case 6:if(null===b.stateNode)throw Error(k(162));b.stateNode.nodeValue=b.memoizedProps;
return;case 3:b=b.stateNode;b.hydrate&&(b.hydrate=!1,bg(b.containerInfo));return;case 12:return;case 13:c=b;null===b.memoizedState?d=!1:(d=!0,c=b.child,Re=Y());if(null!==c)a:for(a=c;;){if(5===a.tag)f=a.stateNode,d?(f=f.style,"function"===typeof f.setProperty?f.setProperty("display","none","important"):f.display="none"):(f=a.stateNode,e=a.memoizedProps.style,e=void 0!==e&&null!==e&&e.hasOwnProperty("display")?e.display:null,f.style.display=fg("display",e));else if(6===a.tag)a.stateNode.nodeValue=d?
"":a.memoizedProps;else if(13===a.tag&&null!==a.memoizedState&&null===a.memoizedState.dehydrated){f=a.child.sibling;f.return=a;a=f;continue}else if(null!==a.child){a.child.return=a;a=a.child;continue}if(a===c)break;for(;null===a.sibling;){if(null===a.return||a.return===c)break a;a=a.return;}a.sibling.return=a.return;a=a.sibling;}Hh(b);return;case 19:Hh(b);return;case 17:return}throw Error(k(163));}function Hh(a){var b=a.updateQueue;if(null!==b){a.updateQueue=null;var c=a.stateNode;null===c&&(c=a.stateNode=
new pj);b.forEach(function(b){var d=qj.bind(null,a,b);c.has(b)||(c.add(b),b.then(d,d));});}}function Ih(a,b,c){c=Ea(c,null);c.tag=3;c.payload={element:null};var d=b.value;c.callback=function(){cd||(cd=!0,Se=d);Me(a,b);};return c}function Jh(a,b,c){c=Ea(c,null);c.tag=3;var d=a.type.getDerivedStateFromError;if("function"===typeof d){var e=b.value;c.payload=function(){Me(a,b);return d(e)};}var f=a.stateNode;null!==f&&"function"===typeof f.componentDidCatch&&(c.callback=function(){"function"!==typeof d&&
(null===La?La=new Set([this]):La.add(this),Me(a,b));var c=b.stack;this.componentDidCatch(b.value,{componentStack:null!==c?c:""});});return c}function ka(){return (p&(ca|ma))!==H?1073741821-(Y()/10|0):0!==dd?dd:dd=1073741821-(Y()/10|0)}function Va(a,b,c){b=b.mode;if(0===(b&2))return 1073741823;var d=Cc();if(0===(b&4))return 99===d?1073741823:1073741822;if((p&ca)!==H)return P;if(null!==c)a=Fc(a,c.timeoutMs|0||5E3,250);else switch(d){case 99:a=1073741823;break;case 98:a=Fc(a,150,100);break;case 97:case 96:a=
Fc(a,5E3,250);break;case 95:a=2;break;default:throw Error(k(326));}null!==U&&a===P&&--a;return a}function ed(a,b){a.expirationTime<b&&(a.expirationTime=b);var c=a.alternate;null!==c&&c.expirationTime<b&&(c.expirationTime=b);var d=a.return,e=null;if(null===d&&3===a.tag)e=a.stateNode;else for(;null!==d;){c=d.alternate;d.childExpirationTime<b&&(d.childExpirationTime=b);null!==c&&c.childExpirationTime<b&&(c.childExpirationTime=b);if(null===d.return&&3===d.tag){e=d.stateNode;break}d=d.return;}null!==e&&
(U===e&&(Kc(b),F===bd&&Ya(e,P)),yh(e,b));return e}function fd(a){var b=a.lastExpiredTime;if(0!==b)return b;b=a.firstPendingTime;if(!Kh(a,b))return b;var c=a.lastPingedTime;a=a.nextKnownPendingLevel;a=c>a?c:a;return 2>=a&&b!==a?0:a}function V(a){if(0!==a.lastExpiredTime)a.callbackExpirationTime=1073741823,a.callbackPriority=99,a.callbackNode=Og(Te.bind(null,a));else {var b=fd(a),c=a.callbackNode;if(0===b)null!==c&&(a.callbackNode=null,a.callbackExpirationTime=0,a.callbackPriority=90);else {var d=ka();
1073741823===b?d=99:1===b||2===b?d=95:(d=10*(1073741821-b)-10*(1073741821-d),d=0>=d?99:250>=d?98:5250>=d?97:95);if(null!==c){var e=a.callbackPriority;if(a.callbackExpirationTime===b&&e>=d)return;c!==Qg&&Rg(c);}a.callbackExpirationTime=b;a.callbackPriority=d;b=1073741823===b?Og(Te.bind(null,a)):Ng(d,Lh.bind(null,a),{timeout:10*(1073741821-b)-Y()});a.callbackNode=b;}}}function Lh(a,b){dd=0;if(b)return b=ka(),Ue(a,b),V(a),null;var c=fd(a);if(0!==c){b=a.callbackNode;if((p&(ca|ma))!==H)throw Error(k(327));
xb();a===U&&c===P||$a(a,c);if(null!==t){var d=p;p|=ca;var e=Mh();do try{rj();break}catch(h){Nh(a,h);}while(1);le();p=d;gd.current=e;if(F===hd)throw (b=id, $a(a,c), Ya(a,c), V(a), b);if(null===t)switch(e=a.finishedWork=a.current.alternate,a.finishedExpirationTime=c,d=F,U=null,d){case Xa:case hd:throw Error(k(345));case Oh:Ue(a,2<c?2:c);break;case ad:Ya(a,c);d=a.lastSuspendedTime;c===d&&(a.nextKnownPendingLevel=Ve(e));if(1073741823===ta&&(e=Re+Ph-Y(),10<e)){if(jd){var f=a.lastPingedTime;if(0===f||f>=c){a.lastPingedTime=
c;$a(a,c);break}}f=fd(a);if(0!==f&&f!==c)break;if(0!==d&&d!==c){a.lastPingedTime=d;break}a.timeoutHandle=We(ab.bind(null,a),e);break}ab(a);break;case bd:Ya(a,c);d=a.lastSuspendedTime;c===d&&(a.nextKnownPendingLevel=Ve(e));if(jd&&(e=a.lastPingedTime,0===e||e>=c)){a.lastPingedTime=c;$a(a,c);break}e=fd(a);if(0!==e&&e!==c)break;if(0!==d&&d!==c){a.lastPingedTime=d;break}1073741823!==Yb?d=10*(1073741821-Yb)-Y():1073741823===ta?d=0:(d=10*(1073741821-ta)-5E3,e=Y(),c=10*(1073741821-c)-e,d=e-d,0>d&&(d=0),d=
(120>d?120:480>d?480:1080>d?1080:1920>d?1920:3E3>d?3E3:4320>d?4320:1960*sj(d/1960))-d,c<d&&(d=c));if(10<d){a.timeoutHandle=We(ab.bind(null,a),d);break}ab(a);break;case Xe:if(1073741823!==ta&&null!==kd){f=ta;var g=kd;d=g.busyMinDurationMs|0;0>=d?d=0:(e=g.busyDelayMs|0,f=Y()-(10*(1073741821-f)-(g.timeoutMs|0||5E3)),d=f<=e?0:e+d-f);if(10<d){Ya(a,c);a.timeoutHandle=We(ab.bind(null,a),d);break}}ab(a);break;default:throw Error(k(329));}V(a);if(a.callbackNode===b)return Lh.bind(null,a)}}return null}function Te(a){var b=
a.lastExpiredTime;b=0!==b?b:1073741823;if((p&(ca|ma))!==H)throw Error(k(327));xb();a===U&&b===P||$a(a,b);if(null!==t){var c=p;p|=ca;var d=Mh();do try{tj();break}catch(e){Nh(a,e);}while(1);le();p=c;gd.current=d;if(F===hd)throw (c=id, $a(a,b), Ya(a,b), V(a), c);if(null!==t)throw Error(k(261));a.finishedWork=a.current.alternate;a.finishedExpirationTime=b;U=null;ab(a);V(a);}return null}function uj(){if(null!==bb){var a=bb;bb=null;a.forEach(function(a,c){Ue(c,a);V(c);});ha();}}function Qh(a,b){var c=p;p|=1;try{return a(b)}finally{p=
c,p===H&&ha();}}function Rh(a,b){var c=p;p&=-2;p|=Ye;try{return a(b)}finally{p=c,p===H&&ha();}}function $a(a,b){a.finishedWork=null;a.finishedExpirationTime=0;var c=a.timeoutHandle;-1!==c&&(a.timeoutHandle=-1,vj(c));if(null!==t)for(c=t.return;null!==c;){var d=c;switch(d.tag){case 1:d=d.type.childContextTypes;null!==d&&void 0!==d&&(q(G),q(B));break;case 3:tb();q(G);q(B);break;case 5:te(d);break;case 4:tb();break;case 13:q(D);break;case 19:q(D);break;case 10:me(d);}c=c.return;}U=a;t=Sa(a.current,null);
P=b;F=Xa;id=null;Yb=ta=1073741823;kd=null;Xb=0;jd=!1;}function Nh(a,b){do{try{le();Sc.current=Tc;if(Uc)for(var c=z.memoizedState;null!==c;){var d=c.queue;null!==d&&(d.pending=null);c=c.next;}Ia=0;J=K=z=null;Uc=!1;if(null===t||null===t.return)return F=hd,id=b,t=null;a:{var e=a,f=t.return,g=t,h=b;b=P;g.effectTag|=2048;g.firstEffect=g.lastEffect=null;if(null!==h&&"object"===typeof h&&"function"===typeof h.then){var m=h;if(0===(g.mode&2)){var n=g.alternate;n?(g.memoizedState=n.memoizedState,g.expirationTime=
n.expirationTime):g.memoizedState=null;}var l=0!==(D.current&1),k=f;do{var p;if(p=13===k.tag){var q=k.memoizedState;if(null!==q)p=null!==q.dehydrated?!0:!1;else {var w=k.memoizedProps;p=void 0===w.fallback?!1:!0!==w.unstable_avoidThisFallback?!0:l?!1:!0;}}if(p){var y=k.updateQueue;if(null===y){var r=new Set;r.add(m);k.updateQueue=r;}else y.add(m);if(0===(k.mode&2)){k.effectTag|=64;g.effectTag&=-2981;if(1===g.tag)if(null===g.alternate)g.tag=17;else {var O=Ea(1073741823,null);O.tag=Jc;Fa(g,O);}g.expirationTime=
1073741823;break a}h=void 0;g=b;var v=e.pingCache;null===v?(v=e.pingCache=new wj,h=new Set,v.set(m,h)):(h=v.get(m),void 0===h&&(h=new Set,v.set(m,h)));if(!h.has(g)){h.add(g);var x=xj.bind(null,e,m,g);m.then(x,x);}k.effectTag|=4096;k.expirationTime=b;break a}k=k.return;}while(null!==k);h=Error((na(g.type)||"A React component")+" suspended while rendering, but no fallback UI was specified.\n\nAdd a <Suspense fallback=...> component higher in the tree to provide a loading indicator or placeholder to display."+
td(g));}F!==Xe&&(F=Oh);h=Le(h,g);k=f;do{switch(k.tag){case 3:m=h;k.effectTag|=4096;k.expirationTime=b;var A=Ih(k,m,b);Ug(k,A);break a;case 1:m=h;var u=k.type,B=k.stateNode;if(0===(k.effectTag&64)&&("function"===typeof u.getDerivedStateFromError||null!==B&&"function"===typeof B.componentDidCatch&&(null===La||!La.has(B)))){k.effectTag|=4096;k.expirationTime=b;var H=Jh(k,m,b);Ug(k,H);break a}}k=k.return;}while(null!==k)}t=Sh(t);}catch(cj){b=cj;continue}break}while(1)}function Mh(a){a=gd.current;gd.current=
Tc;return null===a?Tc:a}function Vg(a,b){a<ta&&2<a&&(ta=a);null!==b&&a<Yb&&2<a&&(Yb=a,kd=b);}function Kc(a){a>Xb&&(Xb=a);}function tj(){for(;null!==t;)t=Th(t);}function rj(){for(;null!==t&&!yj();)t=Th(t);}function Th(a){var b=zj(a.alternate,a,P);a.memoizedProps=a.pendingProps;null===b&&(b=Sh(a));Uh.current=null;return b}function Sh(a){t=a;do{var b=t.alternate;a=t.return;if(0===(t.effectTag&2048)){b=hj(b,t,P);if(1===P||1!==t.childExpirationTime){for(var c=0,d=t.child;null!==d;){var e=d.expirationTime,
f=d.childExpirationTime;e>c&&(c=e);f>c&&(c=f);d=d.sibling;}t.childExpirationTime=c;}if(null!==b)return b;null!==a&&0===(a.effectTag&2048)&&(null===a.firstEffect&&(a.firstEffect=t.firstEffect),null!==t.lastEffect&&(null!==a.lastEffect&&(a.lastEffect.nextEffect=t.firstEffect),a.lastEffect=t.lastEffect),1<t.effectTag&&(null!==a.lastEffect?a.lastEffect.nextEffect=t:a.firstEffect=t,a.lastEffect=t));}else {b=lj(t);if(null!==b)return b.effectTag&=2047,b;null!==a&&(a.firstEffect=a.lastEffect=null,a.effectTag|=
2048);}b=t.sibling;if(null!==b)return b;t=a;}while(null!==t);F===Xa&&(F=Xe);return null}function Ve(a){var b=a.expirationTime;a=a.childExpirationTime;return b>a?b:a}function ab(a){var b=Cc();Da(99,Aj.bind(null,a,b));return null}function Aj(a,b){do xb();while(null!==Zb);if((p&(ca|ma))!==H)throw Error(k(327));var c=a.finishedWork,d=a.finishedExpirationTime;if(null===c)return null;a.finishedWork=null;a.finishedExpirationTime=0;if(c===a.current)throw Error(k(177));a.callbackNode=null;a.callbackExpirationTime=
0;a.callbackPriority=90;a.nextKnownPendingLevel=0;var e=Ve(c);a.firstPendingTime=e;d<=a.lastSuspendedTime?a.firstSuspendedTime=a.lastSuspendedTime=a.nextKnownPendingLevel=0:d<=a.firstSuspendedTime&&(a.firstSuspendedTime=d-1);d<=a.lastPingedTime&&(a.lastPingedTime=0);d<=a.lastExpiredTime&&(a.lastExpiredTime=0);a===U&&(t=U=null,P=0);1<c.effectTag?null!==c.lastEffect?(c.lastEffect.nextEffect=c,e=c.firstEffect):e=c:e=c.firstEffect;if(null!==e){var f=p;p|=ma;Uh.current=null;Ze=tc;var g=kg();if(Xd(g)){if("selectionStart"in
g)var h={start:g.selectionStart,end:g.selectionEnd};else a:{h=(h=g.ownerDocument)&&h.defaultView||window;var m=h.getSelection&&h.getSelection();if(m&&0!==m.rangeCount){h=m.anchorNode;var n=m.anchorOffset,q=m.focusNode;m=m.focusOffset;try{h.nodeType,q.nodeType;}catch(sb){h=null;break a}var ba=0,w=-1,y=-1,B=0,D=0,r=g,z=null;b:for(;;){for(var v;;){r!==h||0!==n&&3!==r.nodeType||(w=ba+n);r!==q||0!==m&&3!==r.nodeType||(y=ba+m);3===r.nodeType&&(ba+=r.nodeValue.length);if(null===(v=r.firstChild))break;z=r;
r=v;}for(;;){if(r===g)break b;z===h&&++B===n&&(w=ba);z===q&&++D===m&&(y=ba);if(null!==(v=r.nextSibling))break;r=z;z=r.parentNode;}r=v;}h=-1===w||-1===y?null:{start:w,end:y};}else h=null;}h=h||{start:0,end:0};}else h=null;$e={activeElementDetached:null,focusedElem:g,selectionRange:h};tc=!1;l=e;do try{Bj();}catch(sb){if(null===l)throw Error(k(330));Za(l,sb);l=l.nextEffect;}while(null!==l);l=e;do try{for(g=a,h=b;null!==l;){var x=l.effectTag;x&16&&Wb(l.stateNode,"");if(x&128){var A=l.alternate;if(null!==A){var u=
A.ref;null!==u&&("function"===typeof u?u(null):u.current=null);}}switch(x&1038){case 2:Gh(l);l.effectTag&=-3;break;case 6:Gh(l);l.effectTag&=-3;Qe(l.alternate,l);break;case 1024:l.effectTag&=-1025;break;case 1028:l.effectTag&=-1025;Qe(l.alternate,l);break;case 4:Qe(l.alternate,l);break;case 8:n=l,Dh(g,n,h),Eh(n);}l=l.nextEffect;}}catch(sb){if(null===l)throw Error(k(330));Za(l,sb);l=l.nextEffect;}while(null!==l);u=$e;A=kg();x=u.focusedElem;h=u.selectionRange;if(A!==x&&x&&x.ownerDocument&&jg(x.ownerDocument.documentElement,
x)){null!==h&&Xd(x)&&(A=h.start,u=h.end,void 0===u&&(u=A),"selectionStart"in x?(x.selectionStart=A,x.selectionEnd=Math.min(u,x.value.length)):(u=(A=x.ownerDocument||document)&&A.defaultView||window,u.getSelection&&(u=u.getSelection(),n=x.textContent.length,g=Math.min(h.start,n),h=void 0===h.end?g:Math.min(h.end,n),!u.extend&&g>h&&(n=h,h=g,g=n),n=ig(x,g),q=ig(x,h),n&&q&&(1!==u.rangeCount||u.anchorNode!==n.node||u.anchorOffset!==n.offset||u.focusNode!==q.node||u.focusOffset!==q.offset)&&(A=A.createRange(),
A.setStart(n.node,n.offset),u.removeAllRanges(),g>h?(u.addRange(A),u.extend(q.node,q.offset)):(A.setEnd(q.node,q.offset),u.addRange(A))))));A=[];for(u=x;u=u.parentNode;)1===u.nodeType&&A.push({element:u,left:u.scrollLeft,top:u.scrollTop});"function"===typeof x.focus&&x.focus();for(x=0;x<A.length;x++)u=A[x],u.element.scrollLeft=u.left,u.element.scrollTop=u.top;}tc=!!Ze;$e=Ze=null;a.current=c;l=e;do try{for(x=a;null!==l;){var F=l.effectTag;F&36&&oj(x,l.alternate,l);if(F&128){A=void 0;var E=l.ref;if(null!==
E){var G=l.stateNode;switch(l.tag){case 5:A=G;break;default:A=G;}"function"===typeof E?E(A):E.current=A;}}l=l.nextEffect;}}catch(sb){if(null===l)throw Error(k(330));Za(l,sb);l=l.nextEffect;}while(null!==l);l=null;Cj();p=f;}else a.current=c;if(ld)ld=!1,Zb=a,$b=b;else for(l=e;null!==l;)b=l.nextEffect,l.nextEffect=null,l=b;b=a.firstPendingTime;0===b&&(La=null);1073741823===b?a===af?ac++:(ac=0,af=a):ac=0;"function"===typeof bf&&bf(c.stateNode,d);V(a);if(cd)throw (cd=!1, a=Se, Se=null, a);if((p&Ye)!==H)return null;
ha();return null}function Bj(){for(;null!==l;){var a=l.effectTag;0!==(a&256)&&nj(l.alternate,l);0===(a&512)||ld||(ld=!0,Ng(97,function(){xb();return null}));l=l.nextEffect;}}function xb(){if(90!==$b){var a=97<$b?97:$b;$b=90;return Da(a,Dj)}}function Dj(){if(null===Zb)return !1;var a=Zb;Zb=null;if((p&(ca|ma))!==H)throw Error(k(331));var b=p;p|=ma;for(a=a.current.firstEffect;null!==a;){try{var c=a;if(0!==(c.effectTag&512))switch(c.tag){case 0:case 11:case 15:case 22:Ah(5,c),Bh(5,c);}}catch(d){if(null===
a)throw Error(k(330));Za(a,d);}c=a.nextEffect;a.nextEffect=null;a=c;}p=b;ha();return !0}function Vh(a,b,c){b=Le(c,b);b=Ih(a,b,1073741823);Fa(a,b);a=ed(a,1073741823);null!==a&&V(a);}function Za(a,b){if(3===a.tag)Vh(a,a,b);else for(var c=a.return;null!==c;){if(3===c.tag){Vh(c,a,b);break}else if(1===c.tag){var d=c.stateNode;if("function"===typeof c.type.getDerivedStateFromError||"function"===typeof d.componentDidCatch&&(null===La||!La.has(d))){a=Le(b,a);a=Jh(c,a,1073741823);Fa(c,a);c=ed(c,1073741823);null!==
c&&V(c);break}}c=c.return;}}function xj(a,b,c){var d=a.pingCache;null!==d&&d.delete(b);U===a&&P===c?F===bd||F===ad&&1073741823===ta&&Y()-Re<Ph?$a(a,P):jd=!0:Kh(a,c)&&(b=a.lastPingedTime,0!==b&&b<c||(a.lastPingedTime=c,V(a)));}function qj(a,b){var c=a.stateNode;null!==c&&c.delete(b);b=0;0===b&&(b=ka(),b=Va(b,a,null));a=ed(a,b);null!==a&&V(a);}function Ej(a){if("undefined"===typeof __REACT_DEVTOOLS_GLOBAL_HOOK__)return !1;var b=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(b.isDisabled||!b.supportsFiber)return !0;try{var c=
b.inject(a);bf=function(a,e){try{b.onCommitFiberRoot(c,a,void 0,64===(a.current.effectTag&64));}catch(f){}};Ne=function(a){try{b.onCommitFiberUnmount(c,a);}catch(e){}};}catch(d){}return !0}function Fj(a,b,c,d){this.tag=a;this.key=c;this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null;this.index=0;this.ref=null;this.pendingProps=b;this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null;this.mode=d;this.effectTag=0;this.lastEffect=this.firstEffect=this.nextEffect=
null;this.childExpirationTime=this.expirationTime=0;this.alternate=null;}function Ge(a){a=a.prototype;return !(!a||!a.isReactComponent)}function Gj(a){if("function"===typeof a)return Ge(a)?1:0;if(void 0!==a&&null!==a){a=a.$$typeof;if(a===rd)return 11;if(a===sd)return 14}return 2}function Sa(a,b){var c=a.alternate;null===c?(c=la(a.tag,b,a.key,a.mode),c.elementType=a.elementType,c.type=a.type,c.stateNode=a.stateNode,c.alternate=a,a.alternate=c):(c.pendingProps=b,c.effectTag=0,c.nextEffect=null,c.firstEffect=
null,c.lastEffect=null);c.childExpirationTime=a.childExpirationTime;c.expirationTime=a.expirationTime;c.child=a.child;c.memoizedProps=a.memoizedProps;c.memoizedState=a.memoizedState;c.updateQueue=a.updateQueue;b=a.dependencies;c.dependencies=null===b?null:{expirationTime:b.expirationTime,firstContext:b.firstContext,responders:b.responders};c.sibling=a.sibling;c.index=a.index;c.ref=a.ref;return c}function Oc(a,b,c,d,e,f){var g=2;d=a;if("function"===typeof a)Ge(a)&&(g=1);else if("string"===typeof a)g=
5;else a:switch(a){case Ma:return Ha(c.children,e,f,b);case Hj:g=8;e|=7;break;case of:g=8;e|=1;break;case ic:return a=la(12,c,b,e|8),a.elementType=ic,a.type=ic,a.expirationTime=f,a;case jc:return a=la(13,c,b,e),a.type=jc,a.elementType=jc,a.expirationTime=f,a;case qd:return a=la(19,c,b,e),a.elementType=qd,a.expirationTime=f,a;default:if("object"===typeof a&&null!==a)switch(a.$$typeof){case qf:g=10;break a;case pf:g=9;break a;case rd:g=11;break a;case sd:g=14;break a;case sf:g=16;d=null;break a;case rf:g=
22;break a}throw Error(k(130,null==a?a:typeof a,""));}b=la(g,c,b,e);b.elementType=a;b.type=d;b.expirationTime=f;return b}function Ha(a,b,c,d){a=la(7,a,d,b);a.expirationTime=c;return a}function qe(a,b,c){a=la(6,a,null,b);a.expirationTime=c;return a}function re(a,b,c){b=la(4,null!==a.children?a.children:[],a.key,b);b.expirationTime=c;b.stateNode={containerInfo:a.containerInfo,pendingChildren:null,implementation:a.implementation};return b}function Ij(a,b,c){this.tag=b;this.current=null;this.containerInfo=
a;this.pingCache=this.pendingChildren=null;this.finishedExpirationTime=0;this.finishedWork=null;this.timeoutHandle=-1;this.pendingContext=this.context=null;this.hydrate=c;this.callbackNode=null;this.callbackPriority=90;this.lastExpiredTime=this.lastPingedTime=this.nextKnownPendingLevel=this.lastSuspendedTime=this.firstSuspendedTime=this.firstPendingTime=0;}function Kh(a,b){var c=a.firstSuspendedTime;a=a.lastSuspendedTime;return 0!==c&&c>=b&&a<=b}function Ya(a,b){var c=a.firstSuspendedTime,d=a.lastSuspendedTime;
c<b&&(a.firstSuspendedTime=b);if(d>b||0===c)a.lastSuspendedTime=b;b<=a.lastPingedTime&&(a.lastPingedTime=0);b<=a.lastExpiredTime&&(a.lastExpiredTime=0);}function yh(a,b){b>a.firstPendingTime&&(a.firstPendingTime=b);var c=a.firstSuspendedTime;0!==c&&(b>=c?a.firstSuspendedTime=a.lastSuspendedTime=a.nextKnownPendingLevel=0:b>=a.lastSuspendedTime&&(a.lastSuspendedTime=b+1),b>a.nextKnownPendingLevel&&(a.nextKnownPendingLevel=b));}function Ue(a,b){var c=a.lastExpiredTime;if(0===c||c>b)a.lastExpiredTime=b;}
function md(a,b,c,d){var e=b.current,f=ka(),g=Vb.suspense;f=Va(f,e,g);a:if(c){c=c._reactInternalFiber;b:{if(Na(c)!==c||1!==c.tag)throw Error(k(170));var h=c;do{switch(h.tag){case 3:h=h.stateNode.context;break b;case 1:if(N(h.type)){h=h.stateNode.__reactInternalMemoizedMergedChildContext;break b}}h=h.return;}while(null!==h);throw Error(k(171));}if(1===c.tag){var m=c.type;if(N(m)){c=Gg(c,m,h);break a}}c=h;}else c=Ca;null===b.context?b.context=c:b.pendingContext=c;b=Ea(f,g);b.payload={element:a};d=void 0===
d?null:d;null!==d&&(b.callback=d);Fa(e,b);Ja(e,f);return f}function cf(a){a=a.current;if(!a.child)return null;switch(a.child.tag){case 5:return a.child.stateNode;default:return a.child.stateNode}}function Wh(a,b){a=a.memoizedState;null!==a&&null!==a.dehydrated&&a.retryTime<b&&(a.retryTime=b);}function df(a,b){Wh(a,b);(a=a.alternate)&&Wh(a,b);}function ef(a,b,c){c=null!=c&&!0===c.hydrate;var d=new Ij(a,b,c),e=la(3,null,null,2===b?7:1===b?3:0);d.current=e;e.stateNode=d;ne(e);a[Lb]=d.current;c&&0!==b&&
xi(a,9===a.nodeType?a:a.ownerDocument);this._internalRoot=d;}function bc(a){return !(!a||1!==a.nodeType&&9!==a.nodeType&&11!==a.nodeType&&(8!==a.nodeType||" react-mount-point-unstable "!==a.nodeValue))}function Jj(a,b){b||(b=a?9===a.nodeType?a.documentElement:a.firstChild:null,b=!(!b||1!==b.nodeType||!b.hasAttribute("data-reactroot")));if(!b)for(var c;c=a.lastChild;)a.removeChild(c);return new ef(a,0,b?{hydrate:!0}:void 0)}function nd(a,b,c,d,e){var f=c._reactRootContainer;if(f){var g=f._internalRoot;
if("function"===typeof e){var h=e;e=function(){var a=cf(g);h.call(a);};}md(b,g,a,e);}else {f=c._reactRootContainer=Jj(c,d);g=f._internalRoot;if("function"===typeof e){var m=e;e=function(){var a=cf(g);m.call(a);};}Rh(function(){md(b,g,a,e);});}return cf(g)}function Kj(a,b,c){var d=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null;return {$$typeof:cb,key:null==d?null:""+d,children:a,containerInfo:b,implementation:c}}function Xh(a,b){var c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null;
if(!bc(b))throw Error(k(200));return Kj(a,b,null,c)}if(!ea)throw Error(k(227));var ki=function(a,b,c,d,e,f,g,h,m){var n=Array.prototype.slice.call(arguments,3);try{b.apply(c,n);}catch(C){this.onError(C);}},yb=!1,gc=null,hc=!1,pd=null,li={onError:function(a){yb=!0;gc=a;}},xd=null,xf=null,mf=null,da=ea.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;da.hasOwnProperty("ReactCurrentDispatcher")||(da.ReactCurrentDispatcher={current:null});da.hasOwnProperty("ReactCurrentBatchConfig")||(da.ReactCurrentBatchConfig=
{suspense:null});var oi=/^(.*)[\\\/]/,Q="function"===typeof Symbol&&Symbol.for,Pc=Q?Symbol.for("react.element"):60103,cb=Q?Symbol.for("react.portal"):60106,Ma=Q?Symbol.for("react.fragment"):60107,of=Q?Symbol.for("react.strict_mode"):60108,ic=Q?Symbol.for("react.profiler"):60114,qf=Q?Symbol.for("react.provider"):60109,pf=Q?Symbol.for("react.context"):60110,Hj=Q?Symbol.for("react.concurrent_mode"):60111,rd=Q?Symbol.for("react.forward_ref"):60112,jc=Q?Symbol.for("react.suspense"):60113,qd=Q?Symbol.for("react.suspense_list"):
60120,sd=Q?Symbol.for("react.memo"):60115,sf=Q?Symbol.for("react.lazy"):60116,rf=Q?Symbol.for("react.block"):60121,nf="function"===typeof Symbol&&Symbol.iterator,kc=null,db={},lc=[],ud={},eb={},vd={},wa=!("undefined"===typeof window||"undefined"===typeof window.document||"undefined"===typeof window.document.createElement),M=ea.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.assign,wd=null,fb=null,gb=null,ee=function(a,b){return a(b)},eg=function(a,b,c,d,e){return a(b,c,d,e)},zd=function(){},Bf=
ee,Oa=!1,Ad=!1,Z=ea.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Scheduler,Lj=Z.unstable_cancelCallback,ff=Z.unstable_now,$f=Z.unstable_scheduleCallback,Mj=Z.unstable_shouldYield,Yh=Z.unstable_requestPaint,Pd=Z.unstable_runWithPriority,Nj=Z.unstable_getCurrentPriorityLevel,Oj=Z.unstable_ImmediatePriority,Zh=Z.unstable_UserBlockingPriority,ag=Z.unstable_NormalPriority,Pj=Z.unstable_LowPriority,Qj=Z.unstable_IdlePriority,qi=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
Cf=Object.prototype.hasOwnProperty,Ef={},Df={},E={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a){E[a]=new L(a,0,!1,a,null,!1);});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(a){var b=a[0];E[b]=new L(b,1,!1,a[1],null,!1);});["contentEditable","draggable","spellCheck","value"].forEach(function(a){E[a]=new L(a,
2,!1,a.toLowerCase(),null,!1);});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(a){E[a]=new L(a,2,!1,a,null,!1);});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a){E[a]=new L(a,3,!1,a.toLowerCase(),null,!1);});["checked","multiple","muted","selected"].forEach(function(a){E[a]=
new L(a,3,!0,a,null,!1);});["capture","download"].forEach(function(a){E[a]=new L(a,4,!1,a,null,!1);});["cols","rows","size","span"].forEach(function(a){E[a]=new L(a,6,!1,a,null,!1);});["rowSpan","start"].forEach(function(a){E[a]=new L(a,5,!1,a.toLowerCase(),null,!1);});var gf=/[\-:]([a-z])/g,hf=function(a){return a[1].toUpperCase()};"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a){var b=
a.replace(gf,hf);E[b]=new L(b,1,!1,a,null,!1);});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a){var b=a.replace(gf,hf);E[b]=new L(b,1,!1,a,"http://www.w3.org/1999/xlink",!1);});["xml:base","xml:lang","xml:space"].forEach(function(a){var b=a.replace(gf,hf);E[b]=new L(b,1,!1,a,"http://www.w3.org/XML/1998/namespace",!1);});["tabIndex","crossOrigin"].forEach(function(a){E[a]=new L(a,1,!1,a.toLowerCase(),null,!1);});E.xlinkHref=new L("xlinkHref",1,
!1,"xlink:href","http://www.w3.org/1999/xlink",!0);["src","href","action","formAction"].forEach(function(a){E[a]=new L(a,1,!1,a.toLowerCase(),null,!0);});var od,xh=function(a){return "undefined"!==typeof MSApp&&MSApp.execUnsafeLocalFunction?function(b,c,d,e){MSApp.execUnsafeLocalFunction(function(){return a(b,c,d,e)});}:a}(function(a,b){if("http://www.w3.org/2000/svg"!==a.namespaceURI||"innerHTML"in a)a.innerHTML=b;else {od=od||document.createElement("div");od.innerHTML="<svg>"+b.valueOf().toString()+
"</svg>";for(b=od.firstChild;a.firstChild;)a.removeChild(a.firstChild);for(;b.firstChild;)a.appendChild(b.firstChild);}}),Wb=function(a,b){if(b){var c=a.firstChild;if(c&&c===a.lastChild&&3===c.nodeType){c.nodeValue=b;return}}a.textContent=b;},ib={animationend:nc("Animation","AnimationEnd"),animationiteration:nc("Animation","AnimationIteration"),animationstart:nc("Animation","AnimationStart"),transitionend:nc("Transition","TransitionEnd")},Id={},Of={};wa&&(Of=document.createElement("div").style,"AnimationEvent"in
window||(delete ib.animationend.animation,delete ib.animationiteration.animation,delete ib.animationstart.animation),"TransitionEvent"in window||delete ib.transitionend.transition);var $h=oc("animationend"),ai=oc("animationiteration"),bi=oc("animationstart"),ci=oc("transitionend"),Db="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),
Pf=new ("function"===typeof WeakMap?WeakMap:Map),Ab=null,wi=function(a){if(a){var b=a._dispatchListeners,c=a._dispatchInstances;if(Array.isArray(b))for(var d=0;d<b.length&&!a.isPropagationStopped();d++)lf(a,b[d],c[d]);else b&&lf(a,b,c);a._dispatchListeners=null;a._dispatchInstances=null;a.isPersistent()||a.constructor.release(a);}},qc=[],Rd=!1,fa=[],xa=null,ya=null,za=null,Eb=new Map,Fb=new Map,Jb=[],Nd="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput close cancel copy cut paste click change contextmenu reset submit".split(" "),
yi="focus blur dragenter dragleave mouseover mouseout pointerover pointerout gotpointercapture lostpointercapture".split(" "),dg={},cg=new Map,Td=new Map,Rj=["abort","abort",$h,"animationEnd",ai,"animationIteration",bi,"animationStart","canplay","canPlay","canplaythrough","canPlayThrough","durationchange","durationChange","emptied","emptied","encrypted","encrypted","ended","ended","error","error","gotpointercapture","gotPointerCapture","load","load","loadeddata","loadedData","loadedmetadata","loadedMetadata",
"loadstart","loadStart","lostpointercapture","lostPointerCapture","playing","playing","progress","progress","seeking","seeking","stalled","stalled","suspend","suspend","timeupdate","timeUpdate",ci,"transitionEnd","waiting","waiting"];Sd("blur blur cancel cancel click click close close contextmenu contextMenu copy copy cut cut auxclick auxClick dblclick doubleClick dragend dragEnd dragstart dragStart drop drop focus focus input input invalid invalid keydown keyDown keypress keyPress keyup keyUp mousedown mouseDown mouseup mouseUp paste paste pause pause play play pointercancel pointerCancel pointerdown pointerDown pointerup pointerUp ratechange rateChange reset reset seeked seeked submit submit touchcancel touchCancel touchend touchEnd touchstart touchStart volumechange volumeChange".split(" "),
0);Sd("drag drag dragenter dragEnter dragexit dragExit dragleave dragLeave dragover dragOver mousemove mouseMove mouseout mouseOut mouseover mouseOver pointermove pointerMove pointerout pointerOut pointerover pointerOver scroll scroll toggle toggle touchmove touchMove wheel wheel".split(" "),1);Sd(Rj,2);(function(a,b){for(var c=0;c<a.length;c++)Td.set(a[c],b);})("change selectionchange textInput compositionstart compositionend compositionupdate".split(" "),0);var Hi=Zh,Gi=Pd,tc=!0,Kb={animationIterationCount:!0,
borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,
strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Sj=["Webkit","ms","Moz","O"];Object.keys(Kb).forEach(function(a){Sj.forEach(function(b){b=b+a.charAt(0).toUpperCase()+a.substring(1);Kb[b]=Kb[a];});});var Ii=M({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0}),ng="$",og="/$",$d="$?",Zd="$!",Ze=null,$e=null,We="function"===typeof setTimeout?setTimeout:void 0,vj="function"===
typeof clearTimeout?clearTimeout:void 0,jf=Math.random().toString(36).slice(2),Aa="__reactInternalInstance$"+jf,vc="__reactEventHandlers$"+jf,Lb="__reactContainere$"+jf,Ba=null,ce=null,wc=null;M(R.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():"unknown"!==typeof a.returnValue&&(a.returnValue=!1),this.isDefaultPrevented=xc);},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():"unknown"!==
typeof a.cancelBubble&&(a.cancelBubble=!0),this.isPropagationStopped=xc);},persist:function(){this.isPersistent=xc;},isPersistent:yc,destructor:function(){var a=this.constructor.Interface,b;for(b in a)this[b]=null;this.nativeEvent=this._targetInst=this.dispatchConfig=null;this.isPropagationStopped=this.isDefaultPrevented=yc;this._dispatchInstances=this._dispatchListeners=null;}});R.Interface={type:null,target:null,currentTarget:function(){return null},eventPhase:null,bubbles:null,cancelable:null,timeStamp:function(a){return a.timeStamp||
Date.now()},defaultPrevented:null,isTrusted:null};R.extend=function(a){function b(){return c.apply(this,arguments)}var c=this,d=function(){};d.prototype=c.prototype;d=new d;M(d,b.prototype);b.prototype=d;b.prototype.constructor=b;b.Interface=M({},c.Interface,a);b.extend=c.extend;sg(b);return b};sg(R);var Tj=R.extend({data:null}),Uj=R.extend({data:null}),Ni=[9,13,27,32],de=wa&&"CompositionEvent"in window,cc=null;wa&&"documentMode"in document&&(cc=document.documentMode);var Vj=wa&&"TextEvent"in window&&
!cc,xg=wa&&(!de||cc&&8<cc&&11>=cc),wg=String.fromCharCode(32),ua={beforeInput:{phasedRegistrationNames:{bubbled:"onBeforeInput",captured:"onBeforeInputCapture"},dependencies:["compositionend","keypress","textInput","paste"]},compositionEnd:{phasedRegistrationNames:{bubbled:"onCompositionEnd",captured:"onCompositionEndCapture"},dependencies:"blur compositionend keydown keypress keyup mousedown".split(" ")},compositionStart:{phasedRegistrationNames:{bubbled:"onCompositionStart",captured:"onCompositionStartCapture"},
dependencies:"blur compositionstart keydown keypress keyup mousedown".split(" ")},compositionUpdate:{phasedRegistrationNames:{bubbled:"onCompositionUpdate",captured:"onCompositionUpdateCapture"},dependencies:"blur compositionupdate keydown keypress keyup mousedown".split(" ")}},vg=!1,mb=!1,Wj={eventTypes:ua,extractEvents:function(a,b,c,d,e){var f;if(de)b:{switch(a){case "compositionstart":var g=ua.compositionStart;break b;case "compositionend":g=ua.compositionEnd;break b;case "compositionupdate":g=
ua.compositionUpdate;break b}g=void 0;}else mb?tg(a,c)&&(g=ua.compositionEnd):"keydown"===a&&229===c.keyCode&&(g=ua.compositionStart);g?(xg&&"ko"!==c.locale&&(mb||g!==ua.compositionStart?g===ua.compositionEnd&&mb&&(f=rg()):(Ba=d,ce="value"in Ba?Ba.value:Ba.textContent,mb=!0)),e=Tj.getPooled(g,b,c,d),f?e.data=f:(f=ug(c),null!==f&&(e.data=f)),lb(e),f=e):f=null;(a=Vj?Oi(a,c):Pi(a,c))?(b=Uj.getPooled(ua.beforeInput,b,c,d),b.data=a,lb(b)):b=null;return null===f?b:null===b?f:[f,b]}},Qi={color:!0,date:!0,
datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0},Ag={change:{phasedRegistrationNames:{bubbled:"onChange",captured:"onChangeCapture"},dependencies:"blur change click focus input keydown keyup selectionchange".split(" ")}},Mb=null,Nb=null,kf=!1;wa&&(kf=Tf("input")&&(!document.documentMode||9<document.documentMode));var Xj={eventTypes:Ag,_isInputEventSupported:kf,extractEvents:function(a,b,c,d,e){e=b?Pa(b):window;var f=
e.nodeName&&e.nodeName.toLowerCase();if("select"===f||"input"===f&&"file"===e.type)var g=Si;else if(yg(e))if(kf)g=Wi;else {g=Ui;var h=Ti;}else (f=e.nodeName)&&"input"===f.toLowerCase()&&("checkbox"===e.type||"radio"===e.type)&&(g=Vi);if(g&&(g=g(a,b)))return zg(g,c,d);h&&h(a,e,b);"blur"===a&&(a=e._wrapperState)&&a.controlled&&"number"===e.type&&Ed(e,"number",e.value);}},dc=R.extend({view:null,detail:null}),Yi={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"},di=0,ei=0,fi=!1,gi=!1,ec=dc.extend({screenX:null,
screenY:null,clientX:null,clientY:null,pageX:null,pageY:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,getModifierState:fe,button:null,buttons:null,relatedTarget:function(a){return a.relatedTarget||(a.fromElement===a.srcElement?a.toElement:a.fromElement)},movementX:function(a){if("movementX"in a)return a.movementX;var b=di;di=a.screenX;return fi?"mousemove"===a.type?a.screenX-b:0:(fi=!0,0)},movementY:function(a){if("movementY"in a)return a.movementY;var b=ei;ei=a.screenY;return gi?"mousemove"===
a.type?a.screenY-b:0:(gi=!0,0)}}),hi=ec.extend({pointerId:null,width:null,height:null,pressure:null,tangentialPressure:null,tiltX:null,tiltY:null,twist:null,pointerType:null,isPrimary:null}),fc={mouseEnter:{registrationName:"onMouseEnter",dependencies:["mouseout","mouseover"]},mouseLeave:{registrationName:"onMouseLeave",dependencies:["mouseout","mouseover"]},pointerEnter:{registrationName:"onPointerEnter",dependencies:["pointerout","pointerover"]},pointerLeave:{registrationName:"onPointerLeave",dependencies:["pointerout",
"pointerover"]}},Yj={eventTypes:fc,extractEvents:function(a,b,c,d,e){var f="mouseover"===a||"pointerover"===a,g="mouseout"===a||"pointerout"===a;if(f&&0===(e&32)&&(c.relatedTarget||c.fromElement)||!g&&!f)return null;f=d.window===d?d:(f=d.ownerDocument)?f.defaultView||f.parentWindow:window;if(g){if(g=b,b=(b=c.relatedTarget||c.toElement)?Bb(b):null,null!==b){var h=Na(b);if(b!==h||5!==b.tag&&6!==b.tag)b=null;}}else g=null;if(g===b)return null;if("mouseout"===a||"mouseover"===a){var m=ec;var n=fc.mouseLeave;
var l=fc.mouseEnter;var k="mouse";}else if("pointerout"===a||"pointerover"===a)m=hi,n=fc.pointerLeave,l=fc.pointerEnter,k="pointer";a=null==g?f:Pa(g);f=null==b?f:Pa(b);n=m.getPooled(n,g,c,d);n.type=k+"leave";n.target=a;n.relatedTarget=f;c=m.getPooled(l,b,c,d);c.type=k+"enter";c.target=f;c.relatedTarget=a;d=g;k=b;if(d&&k)a:{m=d;l=k;g=0;for(a=m;a;a=pa(a))g++;a=0;for(b=l;b;b=pa(b))a++;for(;0<g-a;)m=pa(m),g--;for(;0<a-g;)l=pa(l),a--;for(;g--;){if(m===l||m===l.alternate)break a;m=pa(m);l=pa(l);}m=null;}else m=
null;l=m;for(m=[];d&&d!==l;){g=d.alternate;if(null!==g&&g===l)break;m.push(d);d=pa(d);}for(d=[];k&&k!==l;){g=k.alternate;if(null!==g&&g===l)break;d.push(k);k=pa(k);}for(k=0;k<m.length;k++)be(m[k],"bubbled",n);for(k=d.length;0<k--;)be(d[k],"captured",c);return 0===(e&64)?[n]:[n,c]}},Qa="function"===typeof Object.is?Object.is:Zi,$i=Object.prototype.hasOwnProperty,Zj=wa&&"documentMode"in document&&11>=document.documentMode,Eg={select:{phasedRegistrationNames:{bubbled:"onSelect",captured:"onSelectCapture"},
dependencies:"blur contextmenu dragend focus keydown keyup mousedown mouseup selectionchange".split(" ")}},nb=null,he=null,Pb=null,ge=!1,ak={eventTypes:Eg,extractEvents:function(a,b,c,d,e,f){e=f||(d.window===d?d.document:9===d.nodeType?d:d.ownerDocument);if(!(f=!e)){a:{e=Jd(e);f=vd.onSelect;for(var g=0;g<f.length;g++)if(!e.has(f[g])){e=!1;break a}e=!0;}f=!e;}if(f)return null;e=b?Pa(b):window;switch(a){case "focus":if(yg(e)||"true"===e.contentEditable)nb=e,he=b,Pb=null;break;case "blur":Pb=he=nb=null;
break;case "mousedown":ge=!0;break;case "contextmenu":case "mouseup":case "dragend":return ge=!1,Dg(c,d);case "selectionchange":if(Zj)break;case "keydown":case "keyup":return Dg(c,d)}return null}},bk=R.extend({animationName:null,elapsedTime:null,pseudoElement:null}),ck=R.extend({clipboardData:function(a){return "clipboardData"in a?a.clipboardData:window.clipboardData}}),dk=dc.extend({relatedTarget:null}),ek={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",
Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},fk={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",
224:"Meta"},gk=dc.extend({key:function(a){if(a.key){var b=ek[a.key]||a.key;if("Unidentified"!==b)return b}return "keypress"===a.type?(a=Ac(a),13===a?"Enter":String.fromCharCode(a)):"keydown"===a.type||"keyup"===a.type?fk[a.keyCode]||"Unidentified":""},location:null,ctrlKey:null,shiftKey:null,altKey:null,metaKey:null,repeat:null,locale:null,getModifierState:fe,charCode:function(a){return "keypress"===a.type?Ac(a):0},keyCode:function(a){return "keydown"===a.type||"keyup"===a.type?a.keyCode:0},which:function(a){return "keypress"===
a.type?Ac(a):"keydown"===a.type||"keyup"===a.type?a.keyCode:0}}),hk=ec.extend({dataTransfer:null}),ik=dc.extend({touches:null,targetTouches:null,changedTouches:null,altKey:null,metaKey:null,ctrlKey:null,shiftKey:null,getModifierState:fe}),jk=R.extend({propertyName:null,elapsedTime:null,pseudoElement:null}),kk=ec.extend({deltaX:function(a){return "deltaX"in a?a.deltaX:"wheelDeltaX"in a?-a.wheelDeltaX:0},deltaY:function(a){return "deltaY"in a?a.deltaY:"wheelDeltaY"in a?-a.wheelDeltaY:"wheelDelta"in a?
-a.wheelDelta:0},deltaZ:null,deltaMode:null}),lk={eventTypes:dg,extractEvents:function(a,b,c,d,e){e=cg.get(a);if(!e)return null;switch(a){case "keypress":if(0===Ac(c))return null;case "keydown":case "keyup":a=gk;break;case "blur":case "focus":a=dk;break;case "click":if(2===c.button)return null;case "auxclick":case "dblclick":case "mousedown":case "mousemove":case "mouseup":case "mouseout":case "mouseover":case "contextmenu":a=ec;break;case "drag":case "dragend":case "dragenter":case "dragexit":case "dragleave":case "dragover":case "dragstart":case "drop":a=
hk;break;case "touchcancel":case "touchend":case "touchmove":case "touchstart":a=ik;break;case $h:case ai:case bi:a=bk;break;case ci:a=jk;break;case "scroll":a=dc;break;case "wheel":a=kk;break;case "copy":case "cut":case "paste":a=ck;break;case "gotpointercapture":case "lostpointercapture":case "pointercancel":case "pointerdown":case "pointermove":case "pointerout":case "pointerover":case "pointerup":a=hi;break;default:a=R;}b=a.getPooled(e,b,c,d);lb(b);return b}};(function(a){if(kc)throw Error(k(101));
kc=Array.prototype.slice.call(a);tf();})("ResponderEventPlugin SimpleEventPlugin EnterLeaveEventPlugin ChangeEventPlugin SelectEventPlugin BeforeInputEventPlugin".split(" "));(function(a,b,c){xd=a;xf=b;mf=c;})(ae,Hb,Pa);vf({SimpleEventPlugin:lk,EnterLeaveEventPlugin:Yj,ChangeEventPlugin:Xj,SelectEventPlugin:ak,BeforeInputEventPlugin:Wj});var ie=[],ob=-1,Ca={},B={current:Ca},G={current:!1},Ra=Ca,bj=Pd,je=$f,Rg=Lj,aj=Nj,Dc=Oj,Ig=Zh,Jg=ag,Kg=Pj,Lg=Qj,Qg={},yj=Mj,Cj=void 0!==Yh?Yh:function(){},qa=null,
Ec=null,ke=!1,ii=ff(),Y=1E4>ii?ff:function(){return ff()-ii},Ic={current:null},Hc=null,qb=null,Gc=null,Tg=0,Jc=2,Ga=!1,Vb=da.ReactCurrentBatchConfig,$g=(new ea.Component).refs,Mc={isMounted:function(a){return (a=a._reactInternalFiber)?Na(a)===a:!1},enqueueSetState:function(a,b,c){a=a._reactInternalFiber;var d=ka(),e=Vb.suspense;d=Va(d,a,e);e=Ea(d,e);e.payload=b;void 0!==c&&null!==c&&(e.callback=c);Fa(a,e);Ja(a,d);},enqueueReplaceState:function(a,b,c){a=a._reactInternalFiber;var d=ka(),e=Vb.suspense;
d=Va(d,a,e);e=Ea(d,e);e.tag=1;e.payload=b;void 0!==c&&null!==c&&(e.callback=c);Fa(a,e);Ja(a,d);},enqueueForceUpdate:function(a,b){a=a._reactInternalFiber;var c=ka(),d=Vb.suspense;c=Va(c,a,d);d=Ea(c,d);d.tag=Jc;void 0!==b&&null!==b&&(d.callback=b);Fa(a,d);Ja(a,c);}},Qc=Array.isArray,wb=ah(!0),Fe=ah(!1),Sb={},ja={current:Sb},Ub={current:Sb},Tb={current:Sb},D={current:0},Sc=da.ReactCurrentDispatcher,X=da.ReactCurrentBatchConfig,Ia=0,z=null,K=null,J=null,Uc=!1,Tc={readContext:W,useCallback:S,useContext:S,
useEffect:S,useImperativeHandle:S,useLayoutEffect:S,useMemo:S,useReducer:S,useRef:S,useState:S,useDebugValue:S,useResponder:S,useDeferredValue:S,useTransition:S},dj={readContext:W,useCallback:ih,useContext:W,useEffect:eh,useImperativeHandle:function(a,b,c){c=null!==c&&void 0!==c?c.concat([a]):null;return ze(4,2,gh.bind(null,b,a),c)},useLayoutEffect:function(a,b){return ze(4,2,a,b)},useMemo:function(a,b){var c=ub();b=void 0===b?null:b;a=a();c.memoizedState=[a,b];return a},useReducer:function(a,b,c){var d=
ub();b=void 0!==c?c(b):b;d.memoizedState=d.baseState=b;a=d.queue={pending:null,dispatch:null,lastRenderedReducer:a,lastRenderedState:b};a=a.dispatch=ch.bind(null,z,a);return [d.memoizedState,a]},useRef:function(a){var b=ub();a={current:a};return b.memoizedState=a},useState:xe,useDebugValue:Be,useResponder:ue,useDeferredValue:function(a,b){var c=xe(a),d=c[0],e=c[1];eh(function(){var c=X.suspense;X.suspense=void 0===b?null:b;try{e(a);}finally{X.suspense=c;}},[a,b]);return d},useTransition:function(a){var b=
xe(!1),c=b[0];b=b[1];return [ih(Ce.bind(null,b,a),[b,a]),c]}},ej={readContext:W,useCallback:Yc,useContext:W,useEffect:Xc,useImperativeHandle:hh,useLayoutEffect:fh,useMemo:jh,useReducer:Vc,useRef:dh,useState:function(a){return Vc(Ua)},useDebugValue:Be,useResponder:ue,useDeferredValue:function(a,b){var c=Vc(Ua),d=c[0],e=c[1];Xc(function(){var c=X.suspense;X.suspense=void 0===b?null:b;try{e(a);}finally{X.suspense=c;}},[a,b]);return d},useTransition:function(a){var b=Vc(Ua),c=b[0];b=b[1];return [Yc(Ce.bind(null,
b,a),[b,a]),c]}},fj={readContext:W,useCallback:Yc,useContext:W,useEffect:Xc,useImperativeHandle:hh,useLayoutEffect:fh,useMemo:jh,useReducer:Wc,useRef:dh,useState:function(a){return Wc(Ua)},useDebugValue:Be,useResponder:ue,useDeferredValue:function(a,b){var c=Wc(Ua),d=c[0],e=c[1];Xc(function(){var c=X.suspense;X.suspense=void 0===b?null:b;try{e(a);}finally{X.suspense=c;}},[a,b]);return d},useTransition:function(a){var b=Wc(Ua),c=b[0];b=b[1];return [Yc(Ce.bind(null,b,a),[b,a]),c]}},ra=null,Ka=null,Wa=
!1,gj=da.ReactCurrentOwner,ia=!1,Je={dehydrated:null,retryTime:0};var jj=function(a,b,c,d){for(c=b.child;null!==c;){if(5===c.tag||6===c.tag)a.appendChild(c.stateNode);else if(4!==c.tag&&null!==c.child){c.child.return=c;c=c.child;continue}if(c===b)break;for(;null===c.sibling;){if(null===c.return||c.return===b)return;c=c.return;}c.sibling.return=c.return;c=c.sibling;}};var ij=function(a,b,c,d,e){var f=a.memoizedProps;if(f!==d){var g=b.stateNode;Ta(ja.current);a=null;switch(c){case "input":f=
Cd(g,f);d=Cd(g,d);a=[];break;case "option":f=Fd(g,f);d=Fd(g,d);a=[];break;case "select":f=M({},f,{value:void 0});d=M({},d,{value:void 0});a=[];break;case "textarea":f=Gd(g,f);d=Gd(g,d);a=[];break;default:"function"!==typeof f.onClick&&"function"===typeof d.onClick&&(g.onclick=uc);}Ud(c,d);var h,m;c=null;for(h in f)if(!d.hasOwnProperty(h)&&f.hasOwnProperty(h)&&null!=f[h])if("style"===h)for(m in (g=f[h], g))g.hasOwnProperty(m)&&(c||(c={}),c[m]="");else "dangerouslySetInnerHTML"!==h&&"children"!==h&&"suppressContentEditableWarning"!==
h&&"suppressHydrationWarning"!==h&&"autoFocus"!==h&&(eb.hasOwnProperty(h)?a||(a=[]):(a=a||[]).push(h,null));for(h in d){var k=d[h];g=null!=f?f[h]:void 0;if(d.hasOwnProperty(h)&&k!==g&&(null!=k||null!=g))if("style"===h)if(g){for(m in g)!g.hasOwnProperty(m)||k&&k.hasOwnProperty(m)||(c||(c={}),c[m]="");for(m in k)k.hasOwnProperty(m)&&g[m]!==k[m]&&(c||(c={}),c[m]=k[m]);}else c||(a||(a=[]),a.push(h,c)),c=k;else "dangerouslySetInnerHTML"===h?(k=k?k.__html:void 0,g=g?g.__html:void 0,null!=k&&g!==k&&(a=a||
[]).push(h,k)):"children"===h?g===k||"string"!==typeof k&&"number"!==typeof k||(a=a||[]).push(h,""+k):"suppressContentEditableWarning"!==h&&"suppressHydrationWarning"!==h&&(eb.hasOwnProperty(h)?(null!=k&&oa(e,h),a||g===k||(a=[])):(a=a||[]).push(h,k));}c&&(a=a||[]).push("style",c);e=a;if(b.updateQueue=e)b.effectTag|=4;}};var kj=function(a,b,c,d){c!==d&&(b.effectTag|=4);};var pj="function"===typeof WeakSet?WeakSet:Set,wj="function"===typeof WeakMap?WeakMap:Map,sj=Math.ceil,gd=da.ReactCurrentDispatcher,
Uh=da.ReactCurrentOwner,H=0,Ye=8,ca=16,ma=32,Xa=0,hd=1,Oh=2,ad=3,bd=4,Xe=5,p=H,U=null,t=null,P=0,F=Xa,id=null,ta=1073741823,Yb=1073741823,kd=null,Xb=0,jd=!1,Re=0,Ph=500,l=null,cd=!1,Se=null,La=null,ld=!1,Zb=null,$b=90,bb=null,ac=0,af=null,dd=0,Ja=function(a,b){if(50<ac)throw (ac=0, af=null, Error(k(185)));a=ed(a,b);if(null!==a){var c=Cc();1073741823===b?(p&Ye)!==H&&(p&(ca|ma))===H?Te(a):(V(a),p===H&&ha()):V(a);(p&4)===H||98!==c&&99!==c||(null===bb?bb=new Map([[a,b]]):(c=bb.get(a),(void 0===c||c>b)&&bb.set(a,
b)));}};var zj=function(a,b,c){var d=b.expirationTime;if(null!==a){var e=b.pendingProps;if(a.memoizedProps!==e||G.current)ia=!0;else {if(d<c){ia=!1;switch(b.tag){case 3:sh(b);Ee();break;case 5:bh(b);if(b.mode&4&&1!==c&&e.hidden)return b.expirationTime=b.childExpirationTime=1,null;break;case 1:N(b.type)&&Bc(b);break;case 4:se(b,b.stateNode.containerInfo);break;case 10:d=b.memoizedProps.value;e=b.type._context;y(Ic,e._currentValue);e._currentValue=d;break;case 13:if(null!==b.memoizedState){d=b.child.childExpirationTime;
if(0!==d&&d>=c)return th(a,b,c);y(D,D.current&1);b=sa(a,b,c);return null!==b?b.sibling:null}y(D,D.current&1);break;case 19:d=b.childExpirationTime>=c;if(0!==(a.effectTag&64)){if(d)return vh(a,b,c);b.effectTag|=64;}e=b.memoizedState;null!==e&&(e.rendering=null,e.tail=null);y(D,D.current);if(!d)return null}return sa(a,b,c)}ia=!1;}}else ia=!1;b.expirationTime=0;switch(b.tag){case 2:d=b.type;null!==a&&(a.alternate=null,b.alternate=null,b.effectTag|=2);a=b.pendingProps;e=pb(b,B.current);rb(b,c);e=we(null,
b,d,a,e,c);b.effectTag|=1;if("object"===typeof e&&null!==e&&"function"===typeof e.render&&void 0===e.$$typeof){b.tag=1;b.memoizedState=null;b.updateQueue=null;if(N(d)){var f=!0;Bc(b);}else f=!1;b.memoizedState=null!==e.state&&void 0!==e.state?e.state:null;ne(b);var g=d.getDerivedStateFromProps;"function"===typeof g&&Lc(b,d,g,a);e.updater=Mc;b.stateNode=e;e._reactInternalFiber=b;pe(b,d,a,c);b=Ie(null,b,d,!0,f,c);}else b.tag=0,T(null,b,e,c),b=b.child;return b;case 16:a:{e=b.elementType;null!==a&&(a.alternate=
null,b.alternate=null,b.effectTag|=2);a=b.pendingProps;ni(e);if(1!==e._status)throw e._result;e=e._result;b.type=e;f=b.tag=Gj(e);a=aa(e,a);switch(f){case 0:b=He(null,b,e,a,c);break a;case 1:b=rh(null,b,e,a,c);break a;case 11:b=nh(null,b,e,a,c);break a;case 14:b=oh(null,b,e,aa(e.type,a),d,c);break a}throw Error(k(306,e,""));}return b;case 0:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:aa(d,e),He(a,b,d,e,c);case 1:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:aa(d,e),rh(a,b,d,e,c);
case 3:sh(b);d=b.updateQueue;if(null===a||null===d)throw Error(k(282));d=b.pendingProps;e=b.memoizedState;e=null!==e?e.element:null;oe(a,b);Qb(b,d,null,c);d=b.memoizedState.element;if(d===e)Ee(),b=sa(a,b,c);else {if(e=b.stateNode.hydrate)Ka=kb(b.stateNode.containerInfo.firstChild),ra=b,e=Wa=!0;if(e)for(c=Fe(b,null,d,c),b.child=c;c;)c.effectTag=c.effectTag&-3|1024,c=c.sibling;else T(a,b,d,c),Ee();b=b.child;}return b;case 5:return bh(b),null===a&&De(b),d=b.type,e=b.pendingProps,f=null!==a?a.memoizedProps:
null,g=e.children,Yd(d,e)?g=null:null!==f&&Yd(d,f)&&(b.effectTag|=16),qh(a,b),b.mode&4&&1!==c&&e.hidden?(b.expirationTime=b.childExpirationTime=1,b=null):(T(a,b,g,c),b=b.child),b;case 6:return null===a&&De(b),null;case 13:return th(a,b,c);case 4:return se(b,b.stateNode.containerInfo),d=b.pendingProps,null===a?b.child=wb(b,null,d,c):T(a,b,d,c),b.child;case 11:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:aa(d,e),nh(a,b,d,e,c);case 7:return T(a,b,b.pendingProps,c),b.child;case 8:return T(a,
b,b.pendingProps.children,c),b.child;case 12:return T(a,b,b.pendingProps.children,c),b.child;case 10:a:{d=b.type._context;e=b.pendingProps;g=b.memoizedProps;f=e.value;var h=b.type._context;y(Ic,h._currentValue);h._currentValue=f;if(null!==g)if(h=g.value,f=Qa(h,f)?0:("function"===typeof d._calculateChangedBits?d._calculateChangedBits(h,f):1073741823)|0,0===f){if(g.children===e.children&&!G.current){b=sa(a,b,c);break a}}else for(h=b.child,null!==h&&(h.return=b);null!==h;){var m=h.dependencies;if(null!==
m){g=h.child;for(var l=m.firstContext;null!==l;){if(l.context===d&&0!==(l.observedBits&f)){1===h.tag&&(l=Ea(c,null),l.tag=Jc,Fa(h,l));h.expirationTime<c&&(h.expirationTime=c);l=h.alternate;null!==l&&l.expirationTime<c&&(l.expirationTime=c);Sg(h.return,c);m.expirationTime<c&&(m.expirationTime=c);break}l=l.next;}}else g=10===h.tag?h.type===b.type?null:h.child:h.child;if(null!==g)g.return=h;else for(g=h;null!==g;){if(g===b){g=null;break}h=g.sibling;if(null!==h){h.return=g.return;g=h;break}g=g.return;}h=
g;}T(a,b,e.children,c);b=b.child;}return b;case 9:return e=b.type,f=b.pendingProps,d=f.children,rb(b,c),e=W(e,f.unstable_observedBits),d=d(e),b.effectTag|=1,T(a,b,d,c),b.child;case 14:return e=b.type,f=aa(e,b.pendingProps),f=aa(e.type,f),oh(a,b,e,f,d,c);case 15:return ph(a,b,b.type,b.pendingProps,d,c);case 17:return d=b.type,e=b.pendingProps,e=b.elementType===d?e:aa(d,e),null!==a&&(a.alternate=null,b.alternate=null,b.effectTag|=2),b.tag=1,N(d)?(a=!0,Bc(b)):a=!1,rb(b,c),Yg(b,d,e),pe(b,d,e,c),Ie(null,
b,d,!0,a,c);case 19:return vh(a,b,c)}throw Error(k(156,b.tag));};var bf=null,Ne=null,la=function(a,b,c,d){return new Fj(a,b,c,d)};ef.prototype.render=function(a){md(a,this._internalRoot,null,null);};ef.prototype.unmount=function(){var a=this._internalRoot,b=a.containerInfo;md(null,a,null,function(){b[Lb]=null;});};var Di=function(a){if(13===a.tag){var b=Fc(ka(),150,100);Ja(a,b);df(a,b);}};var Yf=function(a){13===a.tag&&(Ja(a,3),df(a,3));};var Bi=function(a){if(13===a.tag){var b=ka();b=Va(b,a,null);Ja(a,
b);df(a,b);}};wd=function(a,b,c){switch(b){case "input":Dd(a,c);b=c.name;if("radio"===c.type&&null!=b){for(c=a;c.parentNode;)c=c.parentNode;c=c.querySelectorAll("input[name="+JSON.stringify(""+b)+'][type="radio"]');for(b=0;b<c.length;b++){var d=c[b];if(d!==a&&d.form===a.form){var e=ae(d);if(!e)throw Error(k(90));Gf(d);Dd(d,e);}}}break;case "textarea":Lf(a,c);break;case "select":b=c.value,null!=b&&hb(a,!!c.multiple,b,!1);}};(function(a,b,c,d){ee=a;eg=b;zd=c;Bf=d;})(Qh,function(a,b,c,d,e){var f=p;p|=4;
try{return Da(98,a.bind(null,b,c,d,e))}finally{p=f,p===H&&ha();}},function(){(p&(1|ca|ma))===H&&(uj(),xb());},function(a,b){var c=p;p|=2;try{return a(b)}finally{p=c,p===H&&ha();}});var mk={Events:[Hb,Pa,ae,vf,ud,lb,function(a){Kd(a,Ki);},yf,zf,sc,pc,xb,{current:!1}]};(function(a){var b=a.findFiberByHostInstance;return Ej(M({},a,{overrideHookState:null,overrideProps:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:da.ReactCurrentDispatcher,findHostInstanceByFiber:function(a){a=Sf(a);
return null===a?null:a.stateNode},findFiberByHostInstance:function(a){return b?b(a):null},findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null}))})({findFiberByHostInstance:Bb,bundleType:0,version:"16.13.0",rendererPackageName:"react-dom"});I.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=mk;I.createPortal=Xh;I.findDOMNode=function(a){if(null==a)return null;if(1===a.nodeType)return a;var b=a._reactInternalFiber;if(void 0===
b){if("function"===typeof a.render)throw Error(k(188));throw Error(k(268,Object.keys(a)));}a=Sf(b);a=null===a?null:a.stateNode;return a};I.flushSync=function(a,b){if((p&(ca|ma))!==H)throw Error(k(187));var c=p;p|=1;try{return Da(99,a.bind(null,b))}finally{p=c,ha();}};I.hydrate=function(a,b,c){if(!bc(b))throw Error(k(200));return nd(null,a,b,!0,c)};I.render=function(a,b,c){if(!bc(b))throw Error(k(200));return nd(null,a,b,!1,c)};I.unmountComponentAtNode=function(a){if(!bc(a))throw Error(k(40));return a._reactRootContainer?
(Rh(function(){nd(null,null,a,!1,function(){a._reactRootContainer=null;a[Lb]=null;});}),!0):!1};I.unstable_batchedUpdates=Qh;I.unstable_createPortal=function(a,b){return Xh(a,b,2<arguments.length&&void 0!==arguments[2]?arguments[2]:null)};I.unstable_renderSubtreeIntoContainer=function(a,b,c,d){if(!bc(c))throw Error(k(200));if(null==a||void 0===a._reactInternalFiber)throw Error(k(38));return nd(a,b,c,!1,d)};I.version="16.13.0";}(ReactDOM,React));
const {__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,createPortal,findDOMNode,flushSync,hydrate,render,unmountComponentAtNode,unstable_batchedUpdates,unstable_createPortal,unstable_renderSubtreeIntoContainer,version}=ReactDOM;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

function componentWillMount() {
  // Call this.constructor.gDSFP to support sub-classes.
  var state = this.constructor.getDerivedStateFromProps(this.props, this.state);
  if (state !== null && state !== undefined) {
    this.setState(state);
  }
}

function componentWillReceiveProps(nextProps) {
  // Call this.constructor.gDSFP to support sub-classes.
  // Use the setState() updater to ensure state isn't stale in certain edge cases.
  function updater(prevState) {
    var state = this.constructor.getDerivedStateFromProps(nextProps, prevState);
    return state !== null && state !== undefined ? state : null;
  }
  // Binding "this" is important for shallow renderer support.
  this.setState(updater.bind(this));
}

function componentWillUpdate(nextProps, nextState) {
  try {
    var prevProps = this.props;
    var prevState = this.state;
    this.props = nextProps;
    this.state = nextState;
    this.__reactInternalSnapshotFlag = true;
    this.__reactInternalSnapshot = this.getSnapshotBeforeUpdate(
      prevProps,
      prevState
    );
  } finally {
    this.props = prevProps;
    this.state = prevState;
  }
}

// React may warn about cWM/cWRP/cWU methods being deprecated.
// Add a flag to suppress these warnings for this special case.
componentWillMount.__suppressDeprecationWarning = true;
componentWillReceiveProps.__suppressDeprecationWarning = true;
componentWillUpdate.__suppressDeprecationWarning = true;

function polyfill(Component) {
  var prototype = Component.prototype;

  if (!prototype || !prototype.isReactComponent) {
    throw new Error('Can only polyfill class components');
  }

  if (
    typeof Component.getDerivedStateFromProps !== 'function' &&
    typeof prototype.getSnapshotBeforeUpdate !== 'function'
  ) {
    return Component;
  }

  // If new component APIs are defined, "unsafe" lifecycles won't be called.
  // Error if any of these lifecycles are present,
  // Because they would work differently between older and newer (16.3+) versions of React.
  var foundWillMountName = null;
  var foundWillReceivePropsName = null;
  var foundWillUpdateName = null;
  if (typeof prototype.componentWillMount === 'function') {
    foundWillMountName = 'componentWillMount';
  } else if (typeof prototype.UNSAFE_componentWillMount === 'function') {
    foundWillMountName = 'UNSAFE_componentWillMount';
  }
  if (typeof prototype.componentWillReceiveProps === 'function') {
    foundWillReceivePropsName = 'componentWillReceiveProps';
  } else if (typeof prototype.UNSAFE_componentWillReceiveProps === 'function') {
    foundWillReceivePropsName = 'UNSAFE_componentWillReceiveProps';
  }
  if (typeof prototype.componentWillUpdate === 'function') {
    foundWillUpdateName = 'componentWillUpdate';
  } else if (typeof prototype.UNSAFE_componentWillUpdate === 'function') {
    foundWillUpdateName = 'UNSAFE_componentWillUpdate';
  }
  if (
    foundWillMountName !== null ||
    foundWillReceivePropsName !== null ||
    foundWillUpdateName !== null
  ) {
    var componentName = Component.displayName || Component.name;
    var newApiName =
      typeof Component.getDerivedStateFromProps === 'function'
        ? 'getDerivedStateFromProps()'
        : 'getSnapshotBeforeUpdate()';

    throw Error(
      'Unsafe legacy lifecycles will not be called for components using new component APIs.\n\n' +
        componentName +
        ' uses ' +
        newApiName +
        ' but also contains the following legacy lifecycles:' +
        (foundWillMountName !== null ? '\n  ' + foundWillMountName : '') +
        (foundWillReceivePropsName !== null
          ? '\n  ' + foundWillReceivePropsName
          : '') +
        (foundWillUpdateName !== null ? '\n  ' + foundWillUpdateName : '') +
        '\n\nThe above lifecycles should be removed. Learn more about this warning here:\n' +
        'https://fb.me/react-async-component-lifecycle-hooks'
    );
  }

  // React <= 16.2 does not support static getDerivedStateFromProps.
  // As a workaround, use cWM and cWRP to invoke the new static lifecycle.
  // Newer versions of React will ignore these lifecycles if gDSFP exists.
  if (typeof Component.getDerivedStateFromProps === 'function') {
    prototype.componentWillMount = componentWillMount;
    prototype.componentWillReceiveProps = componentWillReceiveProps;
  }

  // React <= 16.2 does not support getSnapshotBeforeUpdate.
  // As a workaround, use cWU to invoke the new lifecycle.
  // Newer versions of React will ignore that lifecycle if gSBU exists.
  if (typeof prototype.getSnapshotBeforeUpdate === 'function') {
    if (typeof prototype.componentDidUpdate !== 'function') {
      throw new Error(
        'Cannot polyfill getSnapshotBeforeUpdate() for components that do not define componentDidUpdate() on the prototype'
      );
    }

    prototype.componentWillUpdate = componentWillUpdate;

    var componentDidUpdate = prototype.componentDidUpdate;

    prototype.componentDidUpdate = function componentDidUpdatePolyfill(
      prevProps,
      prevState,
      maybeSnapshot
    ) {
      // 16.3+ will not execute our will-update method;
      // It will pass a snapshot value to did-update though.
      // Older versions will require our polyfilled will-update value.
      // We need to handle both cases, but can't just check for the presence of "maybeSnapshot",
      // Because for <= 15.x versions this might be a "prevContext" object.
      // We also can't just check "__reactInternalSnapshot",
      // Because get-snapshot might return a falsy value.
      // So check for the explicit __reactInternalSnapshotFlag flag to determine behavior.
      var snapshot = this.__reactInternalSnapshotFlag
        ? this.__reactInternalSnapshot
        : maybeSnapshot;

      componentDidUpdate.call(this, prevProps, prevState, snapshot);
    };
  }

  return Component;
}

var reactLifecyclesCompat_es = /*#__PURE__*/Object.freeze({
    __proto__: null,
    polyfill: polyfill
});

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var objectWithoutPropertiesLoose = _objectWithoutPropertiesLoose;

var _extends_1 = createCommonjsModule(function (module) {
function _extends() {
  module.exports = _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

module.exports = _extends;
});

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

var assertThisInitialized = _assertThisInitialized;

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var inheritsLoose = _inheritsLoose;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var defineProperty = _defineProperty;

var toStr = Object.prototype.toString;

var isArguments = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

var keysShim;
if (!Object.keys) {
	// modified from https://github.com/es-shims/es5-shim
	var has = Object.prototype.hasOwnProperty;
	var toStr$1 = Object.prototype.toString;
	var isArgs = isArguments; // eslint-disable-line global-require
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
	var dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	var equalsConstructorPrototype = function (o) {
		var ctor = o.constructor;
		return ctor && ctor.prototype === o;
	};
	var excludedKeys = {
		$applicationCache: true,
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$onmozfullscreenchange: true,
		$onmozfullscreenerror: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	var hasAutomationEqualityBug = (function () {
		/* global window */
		if (typeof window === 'undefined') { return false; }
		for (var k in window) {
			try {
				if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
					try {
						equalsConstructorPrototype(window[k]);
					} catch (e) {
						return true;
					}
				}
			} catch (e) {
				return true;
			}
		}
		return false;
	}());
	var equalsConstructorPrototypeIfNotBuggy = function (o) {
		/* global window */
		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
			return equalsConstructorPrototype(o);
		}
		try {
			return equalsConstructorPrototype(o);
		} catch (e) {
			return false;
		}
	};

	keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object';
		var isFunction = toStr$1.call(object) === '[object Function]';
		var isArguments = isArgs(object);
		var isString = isObject && toStr$1.call(object) === '[object String]';
		var theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}

		var skipProto = hasProtoEnumBug && isFunction;
		if (isString && object.length > 0 && !has.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}

		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}

		if (hasDontEnumBug) {
			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

			for (var k = 0; k < dontEnums.length; ++k) {
				if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
					theKeys.push(dontEnums[k]);
				}
			}
		}
		return theKeys;
	};
}
var implementation = keysShim;

var slice = Array.prototype.slice;


var origKeys = Object.keys;
var keysShim$1 = origKeys ? function keys(o) { return origKeys(o); } : implementation;

var originalKeys = Object.keys;

keysShim$1.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			var args = Object.keys(arguments);
			return args && args.length === arguments.length;
		}(1, 2));
		if (!keysWorksWithArguments) {
			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
				if (isArguments(object)) {
					return originalKeys(slice.call(object));
				}
				return originalKeys(object);
			};
		}
	} else {
		Object.keys = keysShim$1;
	}
	return Object.keys || keysShim$1;
};

var objectKeys = keysShim$1;

var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var toStr$2 = Object.prototype.toString;

var isStandardArguments = function isArguments(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return toStr$2.call(value) === '[object Arguments]';
};

var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		toStr$2.call(value) !== '[object Array]' &&
		toStr$2.call(value.callee) === '[object Function]';
};

var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

var isArguments$1 = supportsStandardArguments ? isStandardArguments : isLegacyArguments;

// http://www.ecma-international.org/ecma-262/6.0/#sec-object.is

var numberIsNaN = function (value) {
	return value !== value;
};

var objectIs = function is(a, b) {
	if (a === 0 && b === 0) {
		return 1 / a === 1 / b;
	}
	if (a === b) {
		return true;
	}
	if (numberIsNaN(a) && numberIsNaN(b)) {
		return true;
	}
	return false;
};

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice$1 = Array.prototype.slice;
var toStr$3 = Object.prototype.toString;
var funcType = '[object Function]';

var implementation$1 = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr$3.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice$1.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice$1.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice$1.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

var functionBind = Function.prototype.bind || implementation$1;

var src = functionBind.call(Function.call, Object.prototype.hasOwnProperty);

var regexExec = RegExp.prototype.exec;
var gOPD = Object.getOwnPropertyDescriptor;

var tryRegexExecCall = function tryRegexExec(value) {
	try {
		var lastIndex = value.lastIndex;
		value.lastIndex = 0;

		regexExec.call(value);
		return true;
	} catch (e) {
		return false;
	} finally {
		value.lastIndex = lastIndex;
	}
};
var toStr$4 = Object.prototype.toString;
var regexClass = '[object RegExp]';
var hasToStringTag$1 = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

var isRegex = function isRegex(value) {
	if (!value || typeof value !== 'object') {
		return false;
	}
	if (!hasToStringTag$1) {
		return toStr$4.call(value) === regexClass;
	}

	var descriptor = gOPD(value, 'lastIndex');
	var hasLastIndexDataProperty = descriptor && src(descriptor, 'value');
	if (!hasLastIndexDataProperty) {
		return false;
	}

	return tryRegexExecCall(value);
};

var toStr$5 = Object.prototype.toString;

var isArguments$2 = function isArguments(value) {
	var str = toStr$5.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr$5.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

var keysShim$2;
if (!Object.keys) {
	// modified from https://github.com/es-shims/es5-shim
	var has$1 = Object.prototype.hasOwnProperty;
	var toStr$6 = Object.prototype.toString;
	var isArgs$1 = isArguments$2; // eslint-disable-line global-require
	var isEnumerable$1 = Object.prototype.propertyIsEnumerable;
	var hasDontEnumBug$1 = !isEnumerable$1.call({ toString: null }, 'toString');
	var hasProtoEnumBug$1 = isEnumerable$1.call(function () {}, 'prototype');
	var dontEnums$1 = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	var equalsConstructorPrototype$1 = function (o) {
		var ctor = o.constructor;
		return ctor && ctor.prototype === o;
	};
	var excludedKeys$1 = {
		$applicationCache: true,
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$onmozfullscreenchange: true,
		$onmozfullscreenerror: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	var hasAutomationEqualityBug$1 = (function () {
		/* global window */
		if (typeof window === 'undefined') { return false; }
		for (var k in window) {
			try {
				if (!excludedKeys$1['$' + k] && has$1.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
					try {
						equalsConstructorPrototype$1(window[k]);
					} catch (e) {
						return true;
					}
				}
			} catch (e) {
				return true;
			}
		}
		return false;
	}());
	var equalsConstructorPrototypeIfNotBuggy$1 = function (o) {
		/* global window */
		if (typeof window === 'undefined' || !hasAutomationEqualityBug$1) {
			return equalsConstructorPrototype$1(o);
		}
		try {
			return equalsConstructorPrototype$1(o);
		} catch (e) {
			return false;
		}
	};

	keysShim$2 = function keys(object) {
		var isObject = object !== null && typeof object === 'object';
		var isFunction = toStr$6.call(object) === '[object Function]';
		var isArguments = isArgs$1(object);
		var isString = isObject && toStr$6.call(object) === '[object String]';
		var theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}

		var skipProto = hasProtoEnumBug$1 && isFunction;
		if (isString && object.length > 0 && !has$1.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}

		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has$1.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}

		if (hasDontEnumBug$1) {
			var skipConstructor = equalsConstructorPrototypeIfNotBuggy$1(object);

			for (var k = 0; k < dontEnums$1.length; ++k) {
				if (!(skipConstructor && dontEnums$1[k] === 'constructor') && has$1.call(object, dontEnums$1[k])) {
					theKeys.push(dontEnums$1[k]);
				}
			}
		}
		return theKeys;
	};
}
var implementation$2 = keysShim$2;

var slice$2 = Array.prototype.slice;


var origKeys$1 = Object.keys;
var keysShim$3 = origKeys$1 ? function keys(o) { return origKeys$1(o); } : implementation$2;

var originalKeys$1 = Object.keys;

keysShim$3.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			var args = Object.keys(arguments);
			return args && args.length === arguments.length;
		}(1, 2));
		if (!keysWorksWithArguments) {
			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
				if (isArguments$2(object)) {
					return originalKeys$1(slice$2.call(object));
				}
				return originalKeys$1(object);
			};
		}
	} else {
		Object.keys = keysShim$3;
	}
	return Object.keys || keysShim$3;
};

var objectKeys$1 = keysShim$3;

var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

var toStr$7 = Object.prototype.toString;
var concat = Array.prototype.concat;
var origDefineProperty = Object.defineProperty;

var isFunction$1 = function (fn) {
	return typeof fn === 'function' && toStr$7.call(fn) === '[object Function]';
};

var arePropertyDescriptorsSupported = function () {
	var obj = {};
	try {
		origDefineProperty(obj, 'x', { enumerable: false, value: obj });
		// eslint-disable-next-line no-unused-vars, no-restricted-syntax
		for (var _ in obj) { // jscs:ignore disallowUnusedVariables
			return false;
		}
		return obj.x === obj;
	} catch (e) { /* this is IE 8. */
		return false;
	}
};
var supportsDescriptors = origDefineProperty && arePropertyDescriptorsSupported();

var defineProperty$1 = function (object, name, value, predicate) {
	if (name in object && (!isFunction$1(predicate) || !predicate())) {
		return;
	}
	if (supportsDescriptors) {
		origDefineProperty(object, name, {
			configurable: true,
			enumerable: false,
			value: value,
			writable: true
		});
	} else {
		object[name] = value;
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = objectKeys$1(map);
	if (hasSymbols) {
		props = concat.call(props, Object.getOwnPropertySymbols(map));
	}
	for (var i = 0; i < props.length; i += 1) {
		defineProperty$1(object, props[i], map[props[i]], predicates[props[i]]);
	}
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

var defineProperties_1 = defineProperties;

/* eslint complexity: [2, 18], max-statements: [2, 33] */
var shams = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (sym in obj) { return false; } // eslint-disable-line no-restricted-syntax
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		var descriptor = Object.getOwnPropertyDescriptor(obj, sym);
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

var origSymbol = commonjsGlobal.Symbol;


var hasSymbols$1 = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return shams();
};

/* globals
	Atomics,
	SharedArrayBuffer,
*/

var undefined$1;

var $TypeError = TypeError;

var $gOPD = Object.getOwnPropertyDescriptor;

var throwTypeError = function () { throw new $TypeError(); };
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols$2 = hasSymbols$1();

var getProto = Object.getPrototypeOf || function (x) { return x.__proto__; }; // eslint-disable-line no-proto
var generatorFunction =  undefined$1;
var asyncFunction =  undefined$1;
var asyncGenFunction =  undefined$1;

var TypedArray = typeof Uint8Array === 'undefined' ? undefined$1 : getProto(Uint8Array);

var INTRINSICS = {
	'$ %Array%': Array,
	'$ %ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer,
	'$ %ArrayBufferPrototype%': typeof ArrayBuffer === 'undefined' ? undefined$1 : ArrayBuffer.prototype,
	'$ %ArrayIteratorPrototype%': hasSymbols$2 ? getProto([][Symbol.iterator]()) : undefined$1,
	'$ %ArrayPrototype%': Array.prototype,
	'$ %ArrayProto_entries%': Array.prototype.entries,
	'$ %ArrayProto_forEach%': Array.prototype.forEach,
	'$ %ArrayProto_keys%': Array.prototype.keys,
	'$ %ArrayProto_values%': Array.prototype.values,
	'$ %AsyncFromSyncIteratorPrototype%': undefined$1,
	'$ %AsyncFunction%': asyncFunction,
	'$ %AsyncFunctionPrototype%':  undefined$1,
	'$ %AsyncGenerator%':  undefined$1,
	'$ %AsyncGeneratorFunction%': asyncGenFunction,
	'$ %AsyncGeneratorPrototype%':  undefined$1,
	'$ %AsyncIteratorPrototype%':  undefined$1,
	'$ %Atomics%': typeof Atomics === 'undefined' ? undefined$1 : Atomics,
	'$ %Boolean%': Boolean,
	'$ %BooleanPrototype%': Boolean.prototype,
	'$ %DataView%': typeof DataView === 'undefined' ? undefined$1 : DataView,
	'$ %DataViewPrototype%': typeof DataView === 'undefined' ? undefined$1 : DataView.prototype,
	'$ %Date%': Date,
	'$ %DatePrototype%': Date.prototype,
	'$ %decodeURI%': decodeURI,
	'$ %decodeURIComponent%': decodeURIComponent,
	'$ %encodeURI%': encodeURI,
	'$ %encodeURIComponent%': encodeURIComponent,
	'$ %Error%': Error,
	'$ %ErrorPrototype%': Error.prototype,
	'$ %eval%': eval, // eslint-disable-line no-eval
	'$ %EvalError%': EvalError,
	'$ %EvalErrorPrototype%': EvalError.prototype,
	'$ %Float32Array%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array,
	'$ %Float32ArrayPrototype%': typeof Float32Array === 'undefined' ? undefined$1 : Float32Array.prototype,
	'$ %Float64Array%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array,
	'$ %Float64ArrayPrototype%': typeof Float64Array === 'undefined' ? undefined$1 : Float64Array.prototype,
	'$ %Function%': Function,
	'$ %FunctionPrototype%': Function.prototype,
	'$ %Generator%':  undefined$1,
	'$ %GeneratorFunction%': generatorFunction,
	'$ %GeneratorPrototype%':  undefined$1,
	'$ %Int8Array%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array,
	'$ %Int8ArrayPrototype%': typeof Int8Array === 'undefined' ? undefined$1 : Int8Array.prototype,
	'$ %Int16Array%': typeof Int16Array === 'undefined' ? undefined$1 : Int16Array,
	'$ %Int16ArrayPrototype%': typeof Int16Array === 'undefined' ? undefined$1 : Int8Array.prototype,
	'$ %Int32Array%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array,
	'$ %Int32ArrayPrototype%': typeof Int32Array === 'undefined' ? undefined$1 : Int32Array.prototype,
	'$ %isFinite%': isFinite,
	'$ %isNaN%': isNaN,
	'$ %IteratorPrototype%': hasSymbols$2 ? getProto(getProto([][Symbol.iterator]())) : undefined$1,
	'$ %JSON%': typeof JSON === 'object' ? JSON : undefined$1,
	'$ %JSONParse%': typeof JSON === 'object' ? JSON.parse : undefined$1,
	'$ %Map%': typeof Map === 'undefined' ? undefined$1 : Map,
	'$ %MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols$2 ? undefined$1 : getProto(new Map()[Symbol.iterator]()),
	'$ %MapPrototype%': typeof Map === 'undefined' ? undefined$1 : Map.prototype,
	'$ %Math%': Math,
	'$ %Number%': Number,
	'$ %NumberPrototype%': Number.prototype,
	'$ %Object%': Object,
	'$ %ObjectPrototype%': Object.prototype,
	'$ %ObjProto_toString%': Object.prototype.toString,
	'$ %ObjProto_valueOf%': Object.prototype.valueOf,
	'$ %parseFloat%': parseFloat,
	'$ %parseInt%': parseInt,
	'$ %Promise%': typeof Promise === 'undefined' ? undefined$1 : Promise,
	'$ %PromisePrototype%': typeof Promise === 'undefined' ? undefined$1 : Promise.prototype,
	'$ %PromiseProto_then%': typeof Promise === 'undefined' ? undefined$1 : Promise.prototype.then,
	'$ %Promise_all%': typeof Promise === 'undefined' ? undefined$1 : Promise.all,
	'$ %Promise_reject%': typeof Promise === 'undefined' ? undefined$1 : Promise.reject,
	'$ %Promise_resolve%': typeof Promise === 'undefined' ? undefined$1 : Promise.resolve,
	'$ %Proxy%': typeof Proxy === 'undefined' ? undefined$1 : Proxy,
	'$ %RangeError%': RangeError,
	'$ %RangeErrorPrototype%': RangeError.prototype,
	'$ %ReferenceError%': ReferenceError,
	'$ %ReferenceErrorPrototype%': ReferenceError.prototype,
	'$ %Reflect%': typeof Reflect === 'undefined' ? undefined$1 : Reflect,
	'$ %RegExp%': RegExp,
	'$ %RegExpPrototype%': RegExp.prototype,
	'$ %Set%': typeof Set === 'undefined' ? undefined$1 : Set,
	'$ %SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols$2 ? undefined$1 : getProto(new Set()[Symbol.iterator]()),
	'$ %SetPrototype%': typeof Set === 'undefined' ? undefined$1 : Set.prototype,
	'$ %SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer,
	'$ %SharedArrayBufferPrototype%': typeof SharedArrayBuffer === 'undefined' ? undefined$1 : SharedArrayBuffer.prototype,
	'$ %String%': String,
	'$ %StringIteratorPrototype%': hasSymbols$2 ? getProto(''[Symbol.iterator]()) : undefined$1,
	'$ %StringPrototype%': String.prototype,
	'$ %Symbol%': hasSymbols$2 ? Symbol : undefined$1,
	'$ %SymbolPrototype%': hasSymbols$2 ? Symbol.prototype : undefined$1,
	'$ %SyntaxError%': SyntaxError,
	'$ %SyntaxErrorPrototype%': SyntaxError.prototype,
	'$ %ThrowTypeError%': ThrowTypeError,
	'$ %TypedArray%': TypedArray,
	'$ %TypedArrayPrototype%': TypedArray ? TypedArray.prototype : undefined$1,
	'$ %TypeError%': $TypeError,
	'$ %TypeErrorPrototype%': $TypeError.prototype,
	'$ %Uint8Array%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array,
	'$ %Uint8ArrayPrototype%': typeof Uint8Array === 'undefined' ? undefined$1 : Uint8Array.prototype,
	'$ %Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray,
	'$ %Uint8ClampedArrayPrototype%': typeof Uint8ClampedArray === 'undefined' ? undefined$1 : Uint8ClampedArray.prototype,
	'$ %Uint16Array%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array,
	'$ %Uint16ArrayPrototype%': typeof Uint16Array === 'undefined' ? undefined$1 : Uint16Array.prototype,
	'$ %Uint32Array%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array,
	'$ %Uint32ArrayPrototype%': typeof Uint32Array === 'undefined' ? undefined$1 : Uint32Array.prototype,
	'$ %URIError%': URIError,
	'$ %URIErrorPrototype%': URIError.prototype,
	'$ %WeakMap%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap,
	'$ %WeakMapPrototype%': typeof WeakMap === 'undefined' ? undefined$1 : WeakMap.prototype,
	'$ %WeakSet%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet,
	'$ %WeakSetPrototype%': typeof WeakSet === 'undefined' ? undefined$1 : WeakSet.prototype
};


var $replace = functionBind.call(Function.call, String.prototype.replace);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : (number || match);
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var key = '$ ' + name;
	if (!(key in INTRINSICS)) {
		throw new SyntaxError('intrinsic ' + name + ' does not exist!');
	}

	// istanbul ignore if // hopefully this is impossible to test :-)
	if (typeof INTRINSICS[key] === 'undefined' && !allowMissing) {
		throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
	}

	return INTRINSICS[key];
};

var GetIntrinsic = function GetIntrinsic(name, allowMissing) {
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new TypeError('"allowMissing" argument must be a boolean');
	}

	var parts = stringToPath(name);

	if (parts.length === 0) {
		return getBaseIntrinsic(name, allowMissing);
	}

	var value = getBaseIntrinsic('%' + parts[0] + '%', allowMissing);
	for (var i = 1; i < parts.length; i += 1) {
		if (value != null) {
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, parts[i]);
				value = desc ? (desc.get || desc.value) : value[parts[i]];
			} else {
				value = value[parts[i]];
			}
		}
	}
	return value;
};

var $Function = GetIntrinsic('%Function%');
var $apply = $Function.apply;
var $call = $Function.call;

var callBind = function callBind() {
	return functionBind.apply($call, arguments);
};

var apply = function applyBind() {
	return functionBind.apply($apply, arguments);
};
callBind.apply = apply;

var $Object = Object;
var $TypeError$1 = TypeError;

var implementation$3 = function flags() {
	if (this != null && this !== $Object(this)) {
		throw new $TypeError$1('RegExp.prototype.flags getter called on non-object');
	}
	var result = '';
	if (this.global) {
		result += 'g';
	}
	if (this.ignoreCase) {
		result += 'i';
	}
	if (this.multiline) {
		result += 'm';
	}
	if (this.dotAll) {
		result += 's';
	}
	if (this.unicode) {
		result += 'u';
	}
	if (this.sticky) {
		result += 'y';
	}
	return result;
};

var supportsDescriptors$1 = defineProperties_1.supportsDescriptors;
var $gOPD$1 = Object.getOwnPropertyDescriptor;
var $TypeError$2 = TypeError;

var polyfill$1 = function getPolyfill() {
	if (!supportsDescriptors$1) {
		throw new $TypeError$2('RegExp.prototype.flags requires a true ES5 environment that supports property descriptors');
	}
	if ((/a/mig).flags === 'gim') {
		var descriptor = $gOPD$1(RegExp.prototype, 'flags');
		if (descriptor && typeof descriptor.get === 'function' && typeof (/a/).dotAll === 'boolean') {
			return descriptor.get;
		}
	}
	return implementation$3;
};

var supportsDescriptors$2 = defineProperties_1.supportsDescriptors;

var gOPD$1 = Object.getOwnPropertyDescriptor;
var defineProperty$2 = Object.defineProperty;
var TypeErr = TypeError;
var getProto$1 = Object.getPrototypeOf;
var regex = /a/;

var shim = function shimFlags() {
	if (!supportsDescriptors$2 || !getProto$1) {
		throw new TypeErr('RegExp.prototype.flags requires a true ES5 environment that supports property descriptors');
	}
	var polyfill = polyfill$1();
	var proto = getProto$1(regex);
	var descriptor = gOPD$1(proto, 'flags');
	if (!descriptor || descriptor.get !== polyfill) {
		defineProperty$2(proto, 'flags', {
			configurable: true,
			enumerable: false,
			get: polyfill
		});
	}
	return polyfill;
};

var flagsBound = callBind(implementation$3);

defineProperties_1(flagsBound, {
	getPolyfill: polyfill$1,
	implementation: implementation$3,
	shim: shim
});

var regexp_prototype_flags = flagsBound;

var getDay = Date.prototype.getDay;
var tryDateObject = function tryDateObject(value) {
	try {
		getDay.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

var toStr$8 = Object.prototype.toString;
var dateClass = '[object Date]';
var hasToStringTag$2 = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

var isDateObject = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) { return false; }
	return hasToStringTag$2 ? tryDateObject(value) : toStr$8.call(value) === dateClass;
};

var getTime = Date.prototype.getTime;

function deepEqual(actual, expected, options) {
  var opts = options || {};

  // 7.1. All identical values are equivalent, as determined by ===.
  if (opts.strict ? objectIs(actual, expected) : actual === expected) {
    return true;
  }

  // 7.3. Other pairs that do not both pass typeof value == 'object', equivalence is determined by ==.
  if (!actual || !expected || (typeof actual !== 'object' && typeof expected !== 'object')) {
    return opts.strict ? objectIs(actual, expected) : actual == expected;
  }

  /*
   * 7.4. For all other Object pairs, including Array objects, equivalence is
   * determined by having the same number of owned properties (as verified
   * with Object.prototype.hasOwnProperty.call), the same set of keys
   * (although not necessarily the same order), equivalent values for every
   * corresponding key, and an identical 'prototype' property. Note: this
   * accounts for both named and indexed properties on Arrays.
   */
  // eslint-disable-next-line no-use-before-define
  return objEquiv(actual, expected, opts);
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer(x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') {
    return false;
  }
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') {
    return false;
  }
  return true;
}

function objEquiv(a, b, opts) {
  /* eslint max-statements: [2, 50] */
  var i, key;
  if (typeof a !== typeof b) { return false; }
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b)) { return false; }

  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) { return false; }

  if (isArguments$1(a) !== isArguments$1(b)) { return false; }

  var aIsRegex = isRegex(a);
  var bIsRegex = isRegex(b);
  if (aIsRegex !== bIsRegex) { return false; }
  if (aIsRegex || bIsRegex) {
    return a.source === b.source && regexp_prototype_flags(a) === regexp_prototype_flags(b);
  }

  if (isDateObject(a) && isDateObject(b)) {
    return getTime.call(a) === getTime.call(b);
  }

  var aIsBuffer = isBuffer(a);
  var bIsBuffer = isBuffer(b);
  if (aIsBuffer !== bIsBuffer) { return false; }
  if (aIsBuffer || bIsBuffer) { // && would work too, because both are true or both false here
    if (a.length !== b.length) { return false; }
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) { return false; }
    }
    return true;
  }

  if (typeof a !== typeof b) { return false; }

  try {
    var ka = objectKeys(a);
    var kb = objectKeys(b);
  } catch (e) { // happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates hasOwnProperty)
  if (ka.length !== kb.length) { return false; }

  // the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  // ~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i]) { return false; }
  }
  // equivalent values for every corresponding key, and ~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) { return false; }
  }

  return true;
}

var deepEqual_1 = deepEqual;

/**!
 * @fileOverview Kickass library to create and place poppers near their reference elements.
 * @version 1.16.0
 * @license
 * Copyright (c) 2016 Federico Zivolo and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined';

var timeoutDuration = function () {
  var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
  for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
    if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
      return 1;
    }
  }
  return 0;
}();

function microtaskDebounce(fn) {
  var called = false;
  return function () {
    if (called) {
      return;
    }
    called = true;
    window.Promise.resolve().then(function () {
      called = false;
      fn();
    });
  };
}

function taskDebounce(fn) {
  var scheduled = false;
  return function () {
    if (!scheduled) {
      scheduled = true;
      setTimeout(function () {
        scheduled = false;
        fn();
      }, timeoutDuration);
    }
  };
}

var supportsMicroTasks = isBrowser && window.Promise;

/**
* Create a debounced version of a method, that's asynchronously deferred
* but called in the minimum time possible.
*
* @method
* @memberof Popper.Utils
* @argument {Function} fn
* @returns {Function}
*/
var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

/**
 * Check if the given variable is a function
 * @method
 * @memberof Popper.Utils
 * @argument {Any} functionToCheck - variable to check
 * @returns {Boolean} answer to: is a function?
 */
function isFunction$2(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

/**
 * Get CSS computed property of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Eement} element
 * @argument {String} property
 */
function getStyleComputedProperty(element, property) {
  if (element.nodeType !== 1) {
    return [];
  }
  // NOTE: 1 DOM access here
  var window = element.ownerDocument.defaultView;
  var css = window.getComputedStyle(element, null);
  return property ? css[property] : css;
}

/**
 * Returns the parentNode or the host of the element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} parent
 */
function getParentNode(element) {
  if (element.nodeName === 'HTML') {
    return element;
  }
  return element.parentNode || element.host;
}

/**
 * Returns the scrolling parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} scroll parent
 */
function getScrollParent(element) {
  // Return body, `getScroll` will take care to get the correct `scrollTop` from it
  if (!element) {
    return document.body;
  }

  switch (element.nodeName) {
    case 'HTML':
    case 'BODY':
      return element.ownerDocument.body;
    case '#document':
      return element.body;
  }

  // Firefox want us to check `-x` and `-y` variations as well

  var _getStyleComputedProp = getStyleComputedProperty(element),
      overflow = _getStyleComputedProp.overflow,
      overflowX = _getStyleComputedProp.overflowX,
      overflowY = _getStyleComputedProp.overflowY;

  if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
    return element;
  }

  return getScrollParent(getParentNode(element));
}

/**
 * Returns the reference node of the reference object, or the reference object itself.
 * @method
 * @memberof Popper.Utils
 * @param {Element|Object} reference - the reference element (the popper will be relative to this)
 * @returns {Element} parent
 */
function getReferenceNode(reference) {
  return reference && reference.referenceNode ? reference.referenceNode : reference;
}

var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

/**
 * Determines if the browser is Internet Explorer
 * @method
 * @memberof Popper.Utils
 * @param {Number} version to check
 * @returns {Boolean} isIE
 */
function isIE(version) {
  if (version === 11) {
    return isIE11;
  }
  if (version === 10) {
    return isIE10;
  }
  return isIE11 || isIE10;
}

/**
 * Returns the offset parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} offset parent
 */
function getOffsetParent(element) {
  if (!element) {
    return document.documentElement;
  }

  var noOffsetParent = isIE(10) ? document.body : null;

  // NOTE: 1 DOM access here
  var offsetParent = element.offsetParent || null;
  // Skip hidden elements which don't have an offsetParent
  while (offsetParent === noOffsetParent && element.nextElementSibling) {
    offsetParent = (element = element.nextElementSibling).offsetParent;
  }

  var nodeName = offsetParent && offsetParent.nodeName;

  if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
    return element ? element.ownerDocument.documentElement : document.documentElement;
  }

  // .offsetParent will return the closest TH, TD or TABLE in case
  // no offsetParent is present, I hate this job...
  if (['TH', 'TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
    return getOffsetParent(offsetParent);
  }

  return offsetParent;
}

function isOffsetContainer(element) {
  var nodeName = element.nodeName;

  if (nodeName === 'BODY') {
    return false;
  }
  return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
}

/**
 * Finds the root node (document, shadowDOM root) of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} node
 * @returns {Element} root node
 */
function getRoot(node) {
  if (node.parentNode !== null) {
    return getRoot(node.parentNode);
  }

  return node;
}

/**
 * Finds the offset parent common to the two provided nodes
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element1
 * @argument {Element} element2
 * @returns {Element} common offset parent
 */
function findCommonOffsetParent(element1, element2) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
    return document.documentElement;
  }

  // Here we make sure to give as "start" the element that comes first in the DOM
  var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
  var start = order ? element1 : element2;
  var end = order ? element2 : element1;

  // Get common ancestor container
  var range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, 0);
  var commonAncestorContainer = range.commonAncestorContainer;

  // Both nodes are inside #document

  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
    if (isOffsetContainer(commonAncestorContainer)) {
      return commonAncestorContainer;
    }

    return getOffsetParent(commonAncestorContainer);
  }

  // one of the nodes is inside shadowDOM, find which one
  var element1root = getRoot(element1);
  if (element1root.host) {
    return findCommonOffsetParent(element1root.host, element2);
  } else {
    return findCommonOffsetParent(element1, getRoot(element2).host);
  }
}

/**
 * Gets the scroll value of the given element in the given side (top and left)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {String} side `top` or `left`
 * @returns {number} amount of scrolled pixels
 */
function getScroll(element) {
  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

  var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
  var nodeName = element.nodeName;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    var html = element.ownerDocument.documentElement;
    var scrollingElement = element.ownerDocument.scrollingElement || html;
    return scrollingElement[upperSide];
  }

  return element[upperSide];
}

/*
 * Sum or subtract the element scroll values (left and top) from a given rect object
 * @method
 * @memberof Popper.Utils
 * @param {Object} rect - Rect object you want to change
 * @param {HTMLElement} element - The element from the function reads the scroll values
 * @param {Boolean} subtract - set to true if you want to subtract the scroll values
 * @return {Object} rect - The modifier rect object
 */
function includeScroll(rect, element) {
  var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var scrollTop = getScroll(element, 'top');
  var scrollLeft = getScroll(element, 'left');
  var modifier = subtract ? -1 : 1;
  rect.top += scrollTop * modifier;
  rect.bottom += scrollTop * modifier;
  rect.left += scrollLeft * modifier;
  rect.right += scrollLeft * modifier;
  return rect;
}

/*
 * Helper to detect borders of a given element
 * @method
 * @memberof Popper.Utils
 * @param {CSSStyleDeclaration} styles
 * Result of `getStyleComputedProperty` on the given element
 * @param {String} axis - `x` or `y`
 * @return {number} borders - The borders size of the given axis
 */

function getBordersSize(styles, axis) {
  var sideA = axis === 'x' ? 'Left' : 'Top';
  var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

  return parseFloat(styles['border' + sideA + 'Width'], 10) + parseFloat(styles['border' + sideB + 'Width'], 10);
}

function getSize(axis, body, html, computedStyle) {
  return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? parseInt(html['offset' + axis]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')]) + parseInt(computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')]) : 0);
}

function getWindowSizes(document) {
  var body = document.body;
  var html = document.documentElement;
  var computedStyle = isIE(10) && getComputedStyle(html);

  return {
    height: getSize('Height', body, html, computedStyle),
    width: getSize('Width', body, html, computedStyle)
  };
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty$3 = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Given element offsets, generate an output similar to getBoundingClientRect
 * @method
 * @memberof Popper.Utils
 * @argument {Object} offsets
 * @returns {Object} ClientRect like output
 */
function getClientRect(offsets) {
  return _extends({}, offsets, {
    right: offsets.left + offsets.width,
    bottom: offsets.top + offsets.height
  });
}

/**
 * Get bounding client rect of given element
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} element
 * @return {Object} client rect
 */
function getBoundingClientRect(element) {
  var rect = {};

  // IE10 10 FIX: Please, don't ask, the element isn't
  // considered in DOM in some circumstances...
  // This isn't reproducible in IE10 compatibility mode of IE11
  try {
    if (isIE(10)) {
      rect = element.getBoundingClientRect();
      var scrollTop = getScroll(element, 'top');
      var scrollLeft = getScroll(element, 'left');
      rect.top += scrollTop;
      rect.left += scrollLeft;
      rect.bottom += scrollTop;
      rect.right += scrollLeft;
    } else {
      rect = element.getBoundingClientRect();
    }
  } catch (e) {}

  var result = {
    left: rect.left,
    top: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };

  // subtract scrollbar size from sizes
  var sizes = element.nodeName === 'HTML' ? getWindowSizes(element.ownerDocument) : {};
  var width = sizes.width || element.clientWidth || result.width;
  var height = sizes.height || element.clientHeight || result.height;

  var horizScrollbar = element.offsetWidth - width;
  var vertScrollbar = element.offsetHeight - height;

  // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
  // we make this check conditional for performance reasons
  if (horizScrollbar || vertScrollbar) {
    var styles = getStyleComputedProperty(element);
    horizScrollbar -= getBordersSize(styles, 'x');
    vertScrollbar -= getBordersSize(styles, 'y');

    result.width -= horizScrollbar;
    result.height -= vertScrollbar;
  }

  return getClientRect(result);
}

function getOffsetRectRelativeToArbitraryNode(children, parent) {
  var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var isIE10 = isIE(10);
  var isHTML = parent.nodeName === 'HTML';
  var childrenRect = getBoundingClientRect(children);
  var parentRect = getBoundingClientRect(parent);
  var scrollParent = getScrollParent(children);

  var styles = getStyleComputedProperty(parent);
  var borderTopWidth = parseFloat(styles.borderTopWidth, 10);
  var borderLeftWidth = parseFloat(styles.borderLeftWidth, 10);

  // In cases where the parent is fixed, we must ignore negative scroll in offset calc
  if (fixedPosition && isHTML) {
    parentRect.top = Math.max(parentRect.top, 0);
    parentRect.left = Math.max(parentRect.left, 0);
  }
  var offsets = getClientRect({
    top: childrenRect.top - parentRect.top - borderTopWidth,
    left: childrenRect.left - parentRect.left - borderLeftWidth,
    width: childrenRect.width,
    height: childrenRect.height
  });
  offsets.marginTop = 0;
  offsets.marginLeft = 0;

  // Subtract margins of documentElement in case it's being used as parent
  // we do this only on HTML because it's the only element that behaves
  // differently when margins are applied to it. The margins are included in
  // the box of the documentElement, in the other cases not.
  if (!isIE10 && isHTML) {
    var marginTop = parseFloat(styles.marginTop, 10);
    var marginLeft = parseFloat(styles.marginLeft, 10);

    offsets.top -= borderTopWidth - marginTop;
    offsets.bottom -= borderTopWidth - marginTop;
    offsets.left -= borderLeftWidth - marginLeft;
    offsets.right -= borderLeftWidth - marginLeft;

    // Attach marginTop and marginLeft because in some circumstances we may need them
    offsets.marginTop = marginTop;
    offsets.marginLeft = marginLeft;
  }

  if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
    offsets = includeScroll(offsets, parent);
  }

  return offsets;
}

function getViewportOffsetRectRelativeToArtbitraryNode(element) {
  var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var html = element.ownerDocument.documentElement;
  var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
  var width = Math.max(html.clientWidth, window.innerWidth || 0);
  var height = Math.max(html.clientHeight, window.innerHeight || 0);

  var scrollTop = !excludeScroll ? getScroll(html) : 0;
  var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

  var offset = {
    top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
    left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
    width: width,
    height: height
  };

  return getClientRect(offset);
}

/**
 * Check if the given element is fixed or is inside a fixed parent
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {Element} customContainer
 * @returns {Boolean} answer to "isFixed?"
 */
function isFixed(element) {
  var nodeName = element.nodeName;
  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }
  if (getStyleComputedProperty(element, 'position') === 'fixed') {
    return true;
  }
  var parentNode = getParentNode(element);
  if (!parentNode) {
    return false;
  }
  return isFixed(parentNode);
}

/**
 * Finds the first parent of an element that has a transformed property defined
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} first transformed parent or documentElement
 */

function getFixedPositionOffsetParent(element) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element || !element.parentElement || isIE()) {
    return document.documentElement;
  }
  var el = element.parentElement;
  while (el && getStyleComputedProperty(el, 'transform') === 'none') {
    el = el.parentElement;
  }
  return el || document.documentElement;
}

/**
 * Computed the boundaries limits and return them
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} popper
 * @param {HTMLElement} reference
 * @param {number} padding
 * @param {HTMLElement} boundariesElement - Element used to define the boundaries
 * @param {Boolean} fixedPosition - Is in fixed position mode
 * @returns {Object} Coordinates of the boundaries
 */
function getBoundaries(popper, reference, padding, boundariesElement) {
  var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  // NOTE: 1 DOM access here

  var boundaries = { top: 0, left: 0 };
  var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));

  // Handle viewport case
  if (boundariesElement === 'viewport') {
    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
  } else {
    // Handle other cases based on DOM element used as boundaries
    var boundariesNode = void 0;
    if (boundariesElement === 'scrollParent') {
      boundariesNode = getScrollParent(getParentNode(reference));
      if (boundariesNode.nodeName === 'BODY') {
        boundariesNode = popper.ownerDocument.documentElement;
      }
    } else if (boundariesElement === 'window') {
      boundariesNode = popper.ownerDocument.documentElement;
    } else {
      boundariesNode = boundariesElement;
    }

    var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

    // In case of HTML, we need a different computation
    if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
      var _getWindowSizes = getWindowSizes(popper.ownerDocument),
          height = _getWindowSizes.height,
          width = _getWindowSizes.width;

      boundaries.top += offsets.top - offsets.marginTop;
      boundaries.bottom = height + offsets.top;
      boundaries.left += offsets.left - offsets.marginLeft;
      boundaries.right = width + offsets.left;
    } else {
      // for all the other DOM elements, this one is good
      boundaries = offsets;
    }
  }

  // Add paddings
  padding = padding || 0;
  var isPaddingNumber = typeof padding === 'number';
  boundaries.left += isPaddingNumber ? padding : padding.left || 0;
  boundaries.top += isPaddingNumber ? padding : padding.top || 0;
  boundaries.right -= isPaddingNumber ? padding : padding.right || 0;
  boundaries.bottom -= isPaddingNumber ? padding : padding.bottom || 0;

  return boundaries;
}

function getArea(_ref) {
  var width = _ref.width,
      height = _ref.height;

  return width * height;
}

/**
 * Utility used to transform the `auto` placement to the placement with more
 * available space.
 * @method
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
  var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

  if (placement.indexOf('auto') === -1) {
    return placement;
  }

  var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

  var rects = {
    top: {
      width: boundaries.width,
      height: refRect.top - boundaries.top
    },
    right: {
      width: boundaries.right - refRect.right,
      height: boundaries.height
    },
    bottom: {
      width: boundaries.width,
      height: boundaries.bottom - refRect.bottom
    },
    left: {
      width: refRect.left - boundaries.left,
      height: boundaries.height
    }
  };

  var sortedAreas = Object.keys(rects).map(function (key) {
    return _extends({
      key: key
    }, rects[key], {
      area: getArea(rects[key])
    });
  }).sort(function (a, b) {
    return b.area - a.area;
  });

  var filteredAreas = sortedAreas.filter(function (_ref2) {
    var width = _ref2.width,
        height = _ref2.height;
    return width >= popper.clientWidth && height >= popper.clientHeight;
  });

  var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

  var variation = placement.split('-')[1];

  return computedPlacement + (variation ? '-' + variation : '');
}

/**
 * Get offsets to the reference element
 * @method
 * @memberof Popper.Utils
 * @param {Object} state
 * @param {Element} popper - the popper element
 * @param {Element} reference - the reference element (the popper will be relative to this)
 * @param {Element} fixedPosition - is in fixed position mode
 * @returns {Object} An object containing the offsets which will be applied to the popper
 */
function getReferenceOffsets(state, popper, reference) {
  var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, getReferenceNode(reference));
  return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
}

/**
 * Get the outer sizes of the given element (offset size + margins)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Object} object containing width and height properties
 */
function getOuterSizes(element) {
  var window = element.ownerDocument.defaultView;
  var styles = window.getComputedStyle(element);
  var x = parseFloat(styles.marginTop || 0) + parseFloat(styles.marginBottom || 0);
  var y = parseFloat(styles.marginLeft || 0) + parseFloat(styles.marginRight || 0);
  var result = {
    width: element.offsetWidth + y,
    height: element.offsetHeight + x
  };
  return result;
}

/**
 * Get the opposite placement of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement
 * @returns {String} flipped placement
 */
function getOppositePlacement(placement) {
  var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash[matched];
  });
}

/**
 * Get offsets to the popper
 * @method
 * @memberof Popper.Utils
 * @param {Object} position - CSS position the Popper will get applied
 * @param {HTMLElement} popper - the popper element
 * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
 * @param {String} placement - one of the valid placement options
 * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
 */
function getPopperOffsets(popper, referenceOffsets, placement) {
  placement = placement.split('-')[0];

  // Get popper node sizes
  var popperRect = getOuterSizes(popper);

  // Add position, width and height to our offsets object
  var popperOffsets = {
    width: popperRect.width,
    height: popperRect.height
  };

  // depending by the popper placement we have to compute its offsets slightly differently
  var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
  var mainSide = isHoriz ? 'top' : 'left';
  var secondarySide = isHoriz ? 'left' : 'top';
  var measurement = isHoriz ? 'height' : 'width';
  var secondaryMeasurement = !isHoriz ? 'height' : 'width';

  popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
  if (placement === secondarySide) {
    popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
  } else {
    popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
  }

  return popperOffsets;
}

/**
 * Mimics the `find` method of Array
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function find(arr, check) {
  // use native find if supported
  if (Array.prototype.find) {
    return arr.find(check);
  }

  // use `filter` to obtain the same behavior of `find`
  return arr.filter(check)[0];
}

/**
 * Return the index of the matching object
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function findIndex(arr, prop, value) {
  // use native findIndex if supported
  if (Array.prototype.findIndex) {
    return arr.findIndex(function (cur) {
      return cur[prop] === value;
    });
  }

  // use `find` + `indexOf` if `findIndex` isn't supported
  var match = find(arr, function (obj) {
    return obj[prop] === value;
  });
  return arr.indexOf(match);
}

/**
 * Loop trough the list of modifiers and run them in order,
 * each of them will then edit the data object.
 * @method
 * @memberof Popper.Utils
 * @param {dataObject} data
 * @param {Array} modifiers
 * @param {String} ends - Optional modifier name used as stopper
 * @returns {dataObject}
 */
function runModifiers(modifiers, data, ends) {
  var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

  modifiersToRun.forEach(function (modifier) {
    if (modifier['function']) {
      // eslint-disable-line dot-notation
      console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
    }
    var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
    if (modifier.enabled && isFunction$2(fn)) {
      // Add properties to offsets to make them a complete clientRect object
      // we do this before each modifier to make sure the previous one doesn't
      // mess with these values
      data.offsets.popper = getClientRect(data.offsets.popper);
      data.offsets.reference = getClientRect(data.offsets.reference);

      data = fn(data, modifier);
    }
  });

  return data;
}

/**
 * Updates the position of the popper, computing the new offsets and applying
 * the new style.<br />
 * Prefer `scheduleUpdate` over `update` because of performance reasons.
 * @method
 * @memberof Popper
 */
function update() {
  // if popper is destroyed, don't perform any further update
  if (this.state.isDestroyed) {
    return;
  }

  var data = {
    instance: this,
    styles: {},
    arrowStyles: {},
    attributes: {},
    flipped: false,
    offsets: {}
  };

  // compute reference element offsets
  data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

  // store the computed placement inside `originalPlacement`
  data.originalPlacement = data.placement;

  data.positionFixed = this.options.positionFixed;

  // compute the popper offsets
  data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

  data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

  // run the modifiers
  data = runModifiers(this.modifiers, data);

  // the first `update` will call `onCreate` callback
  // the other ones will call `onUpdate` callback
  if (!this.state.isCreated) {
    this.state.isCreated = true;
    this.options.onCreate(data);
  } else {
    this.options.onUpdate(data);
  }
}

/**
 * Helper used to know if the given modifier is enabled.
 * @method
 * @memberof Popper.Utils
 * @returns {Boolean}
 */
function isModifierEnabled(modifiers, modifierName) {
  return modifiers.some(function (_ref) {
    var name = _ref.name,
        enabled = _ref.enabled;
    return enabled && name === modifierName;
  });
}

/**
 * Get the prefixed supported property name
 * @method
 * @memberof Popper.Utils
 * @argument {String} property (camelCase)
 * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
 */
function getSupportedPropertyName(property) {
  var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
  var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    var toCheck = prefix ? '' + prefix + upperProp : property;
    if (typeof document.body.style[toCheck] !== 'undefined') {
      return toCheck;
    }
  }
  return null;
}

/**
 * Destroys the popper.
 * @method
 * @memberof Popper
 */
function destroy() {
  this.state.isDestroyed = true;

  // touch DOM only if `applyStyle` modifier is enabled
  if (isModifierEnabled(this.modifiers, 'applyStyle')) {
    this.popper.removeAttribute('x-placement');
    this.popper.style.position = '';
    this.popper.style.top = '';
    this.popper.style.left = '';
    this.popper.style.right = '';
    this.popper.style.bottom = '';
    this.popper.style.willChange = '';
    this.popper.style[getSupportedPropertyName('transform')] = '';
  }

  this.disableEventListeners();

  // remove the popper if user explicitly asked for the deletion on destroy
  // do not use `remove` because IE11 doesn't support it
  if (this.options.removeOnDestroy) {
    this.popper.parentNode.removeChild(this.popper);
  }
  return this;
}

/**
 * Get the window associated with the element
 * @argument {Element} element
 * @returns {Window}
 */
function getWindow(element) {
  var ownerDocument = element.ownerDocument;
  return ownerDocument ? ownerDocument.defaultView : window;
}

function attachToScrollParents(scrollParent, event, callback, scrollParents) {
  var isBody = scrollParent.nodeName === 'BODY';
  var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
  target.addEventListener(event, callback, { passive: true });

  if (!isBody) {
    attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
  }
  scrollParents.push(target);
}

/**
 * Setup needed event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function setupEventListeners(reference, options, state, updateBound) {
  // Resize event listener on window
  state.updateBound = updateBound;
  getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

  // Scroll event listener on scroll parents
  var scrollElement = getScrollParent(reference);
  attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
  state.scrollElement = scrollElement;
  state.eventsEnabled = true;

  return state;
}

/**
 * It will add resize/scroll events and start recalculating
 * position of the popper element when they are triggered.
 * @method
 * @memberof Popper
 */
function enableEventListeners() {
  if (!this.state.eventsEnabled) {
    this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
  }
}

/**
 * Remove event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function removeEventListeners(reference, state) {
  // Remove resize event listener on window
  getWindow(reference).removeEventListener('resize', state.updateBound);

  // Remove scroll event listener on scroll parents
  state.scrollParents.forEach(function (target) {
    target.removeEventListener('scroll', state.updateBound);
  });

  // Reset state
  state.updateBound = null;
  state.scrollParents = [];
  state.scrollElement = null;
  state.eventsEnabled = false;
  return state;
}

/**
 * It will remove resize/scroll events and won't recalculate popper position
 * when they are triggered. It also won't trigger `onUpdate` callback anymore,
 * unless you call `update` method manually.
 * @method
 * @memberof Popper
 */
function disableEventListeners() {
  if (this.state.eventsEnabled) {
    cancelAnimationFrame(this.scheduleUpdate);
    this.state = removeEventListeners(this.reference, this.state);
  }
}

/**
 * Tells if a given input is a number
 * @method
 * @memberof Popper.Utils
 * @param {*} input to check
 * @return {Boolean}
 */
function isNumeric(n) {
  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Set the style to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the style to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setStyles(element, styles) {
  Object.keys(styles).forEach(function (prop) {
    var unit = '';
    // add unit if the value is numeric and is one of the following
    if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
      unit = 'px';
    }
    element.style[prop] = styles[prop] + unit;
  });
}

/**
 * Set the attributes to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the attributes to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setAttributes(element, attributes) {
  Object.keys(attributes).forEach(function (prop) {
    var value = attributes[prop];
    if (value !== false) {
      element.setAttribute(prop, attributes[prop]);
    } else {
      element.removeAttribute(prop);
    }
  });
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} data.styles - List of style properties - values to apply to popper element
 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The same data object
 */
function applyStyle(data) {
  // any property present in `data.styles` will be applied to the popper,
  // in this way we can make the 3rd party modifiers add custom styles to it
  // Be aware, modifiers could override the properties defined in the previous
  // lines of this modifier!
  setStyles(data.instance.popper, data.styles);

  // any property present in `data.attributes` will be applied to the popper,
  // they will be set as HTML attributes of the element
  setAttributes(data.instance.popper, data.attributes);

  // if arrowElement is defined and arrowStyles has some properties
  if (data.arrowElement && Object.keys(data.arrowStyles).length) {
    setStyles(data.arrowElement, data.arrowStyles);
  }

  return data;
}

/**
 * Set the x-placement attribute before everything else because it could be used
 * to add margins to the popper margins needs to be calculated to get the
 * correct popper offsets.
 * @method
 * @memberof Popper.modifiers
 * @param {HTMLElement} reference - The reference element used to position the popper
 * @param {HTMLElement} popper - The HTML element used as popper
 * @param {Object} options - Popper.js options
 */
function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
  // compute reference element offsets
  var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

  popper.setAttribute('x-placement', placement);

  // Apply `position` to popper before anything else because
  // without the position applied we can't guarantee correct computations
  setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

  return options;
}

/**
 * @function
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Boolean} shouldRound - If the offsets should be rounded at all
 * @returns {Object} The popper's position offsets rounded
 *
 * The tale of pixel-perfect positioning. It's still not 100% perfect, but as
 * good as it can be within reason.
 * Discussion here: https://github.com/FezVrasta/popper.js/pull/715
 *
 * Low DPI screens cause a popper to be blurry if not using full pixels (Safari
 * as well on High DPI screens).
 *
 * Firefox prefers no rounding for positioning and does not have blurriness on
 * high DPI screens.
 *
 * Only horizontal placement and left/right values need to be considered.
 */
function getRoundedOffsets(data, shouldRound) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;
  var round = Math.round,
      floor = Math.floor;

  var noRound = function noRound(v) {
    return v;
  };

  var referenceWidth = round(reference.width);
  var popperWidth = round(popper.width);

  var isVertical = ['left', 'right'].indexOf(data.placement) !== -1;
  var isVariation = data.placement.indexOf('-') !== -1;
  var sameWidthParity = referenceWidth % 2 === popperWidth % 2;
  var bothOddWidth = referenceWidth % 2 === 1 && popperWidth % 2 === 1;

  var horizontalToInteger = !shouldRound ? noRound : isVertical || isVariation || sameWidthParity ? round : floor;
  var verticalToInteger = !shouldRound ? noRound : round;

  return {
    left: horizontalToInteger(bothOddWidth && !isVariation && shouldRound ? popper.left - 1 : popper.left),
    top: verticalToInteger(popper.top),
    bottom: verticalToInteger(popper.bottom),
    right: horizontalToInteger(popper.right)
  };
}

var isFirefox = isBrowser && /Firefox/i.test(navigator.userAgent);

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeStyle(data, options) {
  var x = options.x,
      y = options.y;
  var popper = data.offsets.popper;

  // Remove this legacy support in Popper.js v2

  var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'applyStyle';
  }).gpuAcceleration;
  if (legacyGpuAccelerationOption !== undefined) {
    console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
  }
  var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

  var offsetParent = getOffsetParent(data.instance.popper);
  var offsetParentRect = getBoundingClientRect(offsetParent);

  // Styles
  var styles = {
    position: popper.position
  };

  var offsets = getRoundedOffsets(data, window.devicePixelRatio < 2 || !isFirefox);

  var sideA = x === 'bottom' ? 'top' : 'bottom';
  var sideB = y === 'right' ? 'left' : 'right';

  // if gpuAcceleration is set to `true` and transform is supported,
  //  we use `translate3d` to apply the position to the popper we
  // automatically use the supported prefixed version if needed
  var prefixedProperty = getSupportedPropertyName('transform');

  // now, let's make a step back and look at this code closely (wtf?)
  // If the content of the popper grows once it's been positioned, it
  // may happen that the popper gets misplaced because of the new content
  // overflowing its reference element
  // To avoid this problem, we provide two options (x and y), which allow
  // the consumer to define the offset origin.
  // If we position a popper on top of a reference element, we can set
  // `x` to `top` to make the popper grow towards its top instead of
  // its bottom.
  var left = void 0,
      top = void 0;
  if (sideA === 'bottom') {
    // when offsetParent is <html> the positioning is relative to the bottom of the screen (excluding the scrollbar)
    // and not the bottom of the html element
    if (offsetParent.nodeName === 'HTML') {
      top = -offsetParent.clientHeight + offsets.bottom;
    } else {
      top = -offsetParentRect.height + offsets.bottom;
    }
  } else {
    top = offsets.top;
  }
  if (sideB === 'right') {
    if (offsetParent.nodeName === 'HTML') {
      left = -offsetParent.clientWidth + offsets.right;
    } else {
      left = -offsetParentRect.width + offsets.right;
    }
  } else {
    left = offsets.left;
  }
  if (gpuAcceleration && prefixedProperty) {
    styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    styles[sideA] = 0;
    styles[sideB] = 0;
    styles.willChange = 'transform';
  } else {
    // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
    var invertTop = sideA === 'bottom' ? -1 : 1;
    var invertLeft = sideB === 'right' ? -1 : 1;
    styles[sideA] = top * invertTop;
    styles[sideB] = left * invertLeft;
    styles.willChange = sideA + ', ' + sideB;
  }

  // Attributes
  var attributes = {
    'x-placement': data.placement
  };

  // Update `data` attributes, styles and arrowStyles
  data.attributes = _extends({}, attributes, data.attributes);
  data.styles = _extends({}, styles, data.styles);
  data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

  return data;
}

/**
 * Helper used to know if the given modifier depends from another one.<br />
 * It checks if the needed modifier is listed and enabled.
 * @method
 * @memberof Popper.Utils
 * @param {Array} modifiers - list of modifiers
 * @param {String} requestingName - name of requesting modifier
 * @param {String} requestedName - name of requested modifier
 * @returns {Boolean}
 */
function isModifierRequired(modifiers, requestingName, requestedName) {
  var requesting = find(modifiers, function (_ref) {
    var name = _ref.name;
    return name === requestingName;
  });

  var isRequired = !!requesting && modifiers.some(function (modifier) {
    return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
  });

  if (!isRequired) {
    var _requesting = '`' + requestingName + '`';
    var requested = '`' + requestedName + '`';
    console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
  }
  return isRequired;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function arrow(data, options) {
  var _data$offsets$arrow;

  // arrow depends on keepTogether in order to work
  if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
    return data;
  }

  var arrowElement = options.element;

  // if arrowElement is a string, suppose it's a CSS selector
  if (typeof arrowElement === 'string') {
    arrowElement = data.instance.popper.querySelector(arrowElement);

    // if arrowElement is not found, don't run the modifier
    if (!arrowElement) {
      return data;
    }
  } else {
    // if the arrowElement isn't a query selector we must check that the
    // provided DOM node is child of its popper node
    if (!data.instance.popper.contains(arrowElement)) {
      console.warn('WARNING: `arrow.element` must be child of its popper element!');
      return data;
    }
  }

  var placement = data.placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isVertical = ['left', 'right'].indexOf(placement) !== -1;

  var len = isVertical ? 'height' : 'width';
  var sideCapitalized = isVertical ? 'Top' : 'Left';
  var side = sideCapitalized.toLowerCase();
  var altSide = isVertical ? 'left' : 'top';
  var opSide = isVertical ? 'bottom' : 'right';
  var arrowElementSize = getOuterSizes(arrowElement)[len];

  //
  // extends keepTogether behavior making sure the popper and its
  // reference have enough pixels in conjunction
  //

  // top/left side
  if (reference[opSide] - arrowElementSize < popper[side]) {
    data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
  }
  // bottom/right side
  if (reference[side] + arrowElementSize > popper[opSide]) {
    data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
  }
  data.offsets.popper = getClientRect(data.offsets.popper);

  // compute center of the popper
  var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

  // Compute the sideValue using the updated popper offsets
  // take popper margin in account because we don't have this info available
  var css = getStyleComputedProperty(data.instance.popper);
  var popperMarginSide = parseFloat(css['margin' + sideCapitalized], 10);
  var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width'], 10);
  var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

  // prevent arrowElement from being placed not contiguously to its popper
  sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

  data.arrowElement = arrowElement;
  data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty$3(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty$3(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

  return data;
}

/**
 * Get the opposite placement variation of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement variation
 * @returns {String} flipped placement variation
 */
function getOppositeVariation(variation) {
  if (variation === 'end') {
    return 'start';
  } else if (variation === 'start') {
    return 'end';
  }
  return variation;
}

/**
 * List of accepted placements to use as values of the `placement` option.<br />
 * Valid placements are:
 * - `auto`
 * - `top`
 * - `right`
 * - `bottom`
 * - `left`
 *
 * Each placement can have a variation from this list:
 * - `-start`
 * - `-end`
 *
 * Variations are interpreted easily if you think of them as the left to right
 * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
 * is right.<br />
 * Vertically (`left` and `right`), `start` is top and `end` is bottom.
 *
 * Some valid examples are:
 * - `top-end` (on top of reference, right aligned)
 * - `right-start` (on right of reference, top aligned)
 * - `bottom` (on bottom, centered)
 * - `auto-end` (on the side with more space available, alignment depends by placement)
 *
 * @static
 * @type {Array}
 * @enum {String}
 * @readonly
 * @method placements
 * @memberof Popper
 */
var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

// Get rid of `auto` `auto-start` and `auto-end`
var validPlacements = placements.slice(3);

/**
 * Given an initial placement, returns all the subsequent placements
 * clockwise (or counter-clockwise).
 *
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement - A valid placement (it accepts variations)
 * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
 * @returns {Array} placements including their variations
 */
function clockwise(placement) {
  var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var index = validPlacements.indexOf(placement);
  var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
  return counter ? arr.reverse() : arr;
}

var BEHAVIORS = {
  FLIP: 'flip',
  CLOCKWISE: 'clockwise',
  COUNTERCLOCKWISE: 'counterclockwise'
};

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function flip(data, options) {
  // if `inner` modifier is enabled, we can't use the `flip` modifier
  if (isModifierEnabled(data.instance.modifiers, 'inner')) {
    return data;
  }

  if (data.flipped && data.placement === data.originalPlacement) {
    // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
    return data;
  }

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

  var placement = data.placement.split('-')[0];
  var placementOpposite = getOppositePlacement(placement);
  var variation = data.placement.split('-')[1] || '';

  var flipOrder = [];

  switch (options.behavior) {
    case BEHAVIORS.FLIP:
      flipOrder = [placement, placementOpposite];
      break;
    case BEHAVIORS.CLOCKWISE:
      flipOrder = clockwise(placement);
      break;
    case BEHAVIORS.COUNTERCLOCKWISE:
      flipOrder = clockwise(placement, true);
      break;
    default:
      flipOrder = options.behavior;
  }

  flipOrder.forEach(function (step, index) {
    if (placement !== step || flipOrder.length === index + 1) {
      return data;
    }

    placement = data.placement.split('-')[0];
    placementOpposite = getOppositePlacement(placement);

    var popperOffsets = data.offsets.popper;
    var refOffsets = data.offsets.reference;

    // using floor because the reference offsets may contain decimals we are not going to consider here
    var floor = Math.floor;
    var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

    var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
    var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
    var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
    var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

    var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

    // flip the variation if required
    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;

    // flips variation if reference element overflows boundaries
    var flippedVariationByRef = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

    // flips variation if popper content overflows boundaries
    var flippedVariationByContent = !!options.flipVariationsByContent && (isVertical && variation === 'start' && overflowsRight || isVertical && variation === 'end' && overflowsLeft || !isVertical && variation === 'start' && overflowsBottom || !isVertical && variation === 'end' && overflowsTop);

    var flippedVariation = flippedVariationByRef || flippedVariationByContent;

    if (overlapsRef || overflowsBoundaries || flippedVariation) {
      // this boolean to detect any flip loop
      data.flipped = true;

      if (overlapsRef || overflowsBoundaries) {
        placement = flipOrder[index + 1];
      }

      if (flippedVariation) {
        variation = getOppositeVariation(variation);
      }

      data.placement = placement + (variation ? '-' + variation : '');

      // this object contains `position`, we want to preserve it along with
      // any additional property we may add in the future
      data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

      data = runModifiers(data.instance.modifiers, data, 'flip');
    }
  });
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function keepTogether(data) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var placement = data.placement.split('-')[0];
  var floor = Math.floor;
  var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
  var side = isVertical ? 'right' : 'bottom';
  var opSide = isVertical ? 'left' : 'top';
  var measurement = isVertical ? 'width' : 'height';

  if (popper[side] < floor(reference[opSide])) {
    data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
  }
  if (popper[opSide] > floor(reference[side])) {
    data.offsets.popper[opSide] = floor(reference[side]);
  }

  return data;
}

/**
 * Converts a string containing value + unit into a px value number
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} str - Value + unit string
 * @argument {String} measurement - `height` or `width`
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @returns {Number|String}
 * Value in pixels, or original string if no values were extracted
 */
function toValue(str, measurement, popperOffsets, referenceOffsets) {
  // separate value from unit
  var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
  var value = +split[1];
  var unit = split[2];

  // If it's not a number it's an operator, I guess
  if (!value) {
    return str;
  }

  if (unit.indexOf('%') === 0) {
    var element = void 0;
    switch (unit) {
      case '%p':
        element = popperOffsets;
        break;
      case '%':
      case '%r':
      default:
        element = referenceOffsets;
    }

    var rect = getClientRect(element);
    return rect[measurement] / 100 * value;
  } else if (unit === 'vh' || unit === 'vw') {
    // if is a vh or vw, we calculate the size based on the viewport
    var size = void 0;
    if (unit === 'vh') {
      size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    } else {
      size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    return size / 100 * value;
  } else {
    // if is an explicit pixel unit, we get rid of the unit and keep the value
    // if is an implicit unit, it's px, and we return just the value
    return value;
  }
}

/**
 * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} offset
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @argument {String} basePlacement
 * @returns {Array} a two cells array with x and y offsets in numbers
 */
function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
  var offsets = [0, 0];

  // Use height if placement is left or right and index is 0 otherwise use width
  // in this way the first offset will use an axis and the second one
  // will use the other one
  var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

  // Split the offset string to obtain a list of values and operands
  // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
  var fragments = offset.split(/(\+|\-)/).map(function (frag) {
    return frag.trim();
  });

  // Detect if the offset string contains a pair of values or a single one
  // they could be separated by comma or space
  var divider = fragments.indexOf(find(fragments, function (frag) {
    return frag.search(/,|\s/) !== -1;
  }));

  if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
    console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
  }

  // If divider is found, we divide the list of values and operands to divide
  // them by ofset X and Y.
  var splitRegex = /\s*,\s*|\s+/;
  var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

  // Convert the values with units to absolute pixels to allow our computations
  ops = ops.map(function (op, index) {
    // Most of the units rely on the orientation of the popper
    var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
    var mergeWithPrevious = false;
    return op
    // This aggregates any `+` or `-` sign that aren't considered operators
    // e.g.: 10 + +5 => [10, +, +5]
    .reduce(function (a, b) {
      if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
        a[a.length - 1] = b;
        mergeWithPrevious = true;
        return a;
      } else if (mergeWithPrevious) {
        a[a.length - 1] += b;
        mergeWithPrevious = false;
        return a;
      } else {
        return a.concat(b);
      }
    }, [])
    // Here we convert the string values into number values (in px)
    .map(function (str) {
      return toValue(str, measurement, popperOffsets, referenceOffsets);
    });
  });

  // Loop trough the offsets arrays and execute the operations
  ops.forEach(function (op, index) {
    op.forEach(function (frag, index2) {
      if (isNumeric(frag)) {
        offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
      }
    });
  });
  return offsets;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @argument {Number|String} options.offset=0
 * The offset value as described in the modifier description
 * @returns {Object} The data object, properly modified
 */
function offset(data, _ref) {
  var offset = _ref.offset;
  var placement = data.placement,
      _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var basePlacement = placement.split('-')[0];

  var offsets = void 0;
  if (isNumeric(+offset)) {
    offsets = [+offset, 0];
  } else {
    offsets = parseOffset(offset, popper, reference, basePlacement);
  }

  if (basePlacement === 'left') {
    popper.top += offsets[0];
    popper.left -= offsets[1];
  } else if (basePlacement === 'right') {
    popper.top += offsets[0];
    popper.left += offsets[1];
  } else if (basePlacement === 'top') {
    popper.left += offsets[0];
    popper.top -= offsets[1];
  } else if (basePlacement === 'bottom') {
    popper.left += offsets[0];
    popper.top += offsets[1];
  }

  data.popper = popper;
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function preventOverflow(data, options) {
  var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

  // If offsetParent is the reference element, we really want to
  // go one step up and use the next offsetParent as reference to
  // avoid to make this modifier completely useless and look like broken
  if (data.instance.reference === boundariesElement) {
    boundariesElement = getOffsetParent(boundariesElement);
  }

  // NOTE: DOM access here
  // resets the popper's position so that the document size can be calculated excluding
  // the size of the popper element itself
  var transformProp = getSupportedPropertyName('transform');
  var popperStyles = data.instance.popper.style; // assignment to help minification
  var top = popperStyles.top,
      left = popperStyles.left,
      transform = popperStyles[transformProp];

  popperStyles.top = '';
  popperStyles.left = '';
  popperStyles[transformProp] = '';

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

  // NOTE: DOM access here
  // restores the original style properties after the offsets have been computed
  popperStyles.top = top;
  popperStyles.left = left;
  popperStyles[transformProp] = transform;

  options.boundaries = boundaries;

  var order = options.priority;
  var popper = data.offsets.popper;

  var check = {
    primary: function primary(placement) {
      var value = popper[placement];
      if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
        value = Math.max(popper[placement], boundaries[placement]);
      }
      return defineProperty$3({}, placement, value);
    },
    secondary: function secondary(placement) {
      var mainSide = placement === 'right' ? 'left' : 'top';
      var value = popper[mainSide];
      if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
        value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
      }
      return defineProperty$3({}, mainSide, value);
    }
  };

  order.forEach(function (placement) {
    var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
    popper = _extends({}, popper, check[side](placement));
  });

  data.offsets.popper = popper;

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function shift(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var shiftvariation = placement.split('-')[1];

  // if shift shiftvariation is specified, run the modifier
  if (shiftvariation) {
    var _data$offsets = data.offsets,
        reference = _data$offsets.reference,
        popper = _data$offsets.popper;

    var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
    var side = isVertical ? 'left' : 'top';
    var measurement = isVertical ? 'width' : 'height';

    var shiftOffsets = {
      start: defineProperty$3({}, side, reference[side]),
      end: defineProperty$3({}, side, reference[side] + reference[measurement] - popper[measurement])
    };

    data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function hide(data) {
  if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
    return data;
  }

  var refRect = data.offsets.reference;
  var bound = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'preventOverflow';
  }).boundaries;

  if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === true) {
      return data;
    }

    data.hide = true;
    data.attributes['x-out-of-boundaries'] = '';
  } else {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === false) {
      return data;
    }

    data.hide = false;
    data.attributes['x-out-of-boundaries'] = false;
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function inner(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

  var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

  popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

  data.placement = getOppositePlacement(placement);
  data.offsets.popper = getClientRect(popper);

  return data;
}

/**
 * Modifier function, each modifier can have a function of this type assigned
 * to its `fn` property.<br />
 * These functions will be called on each update, this means that you must
 * make sure they are performant enough to avoid performance bottlenecks.
 *
 * @function ModifierFn
 * @argument {dataObject} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {dataObject} The data object, properly modified
 */

/**
 * Modifiers are plugins used to alter the behavior of your poppers.<br />
 * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
 * needed by the library.
 *
 * Usually you don't want to override the `order`, `fn` and `onLoad` props.
 * All the other properties are configurations that could be tweaked.
 * @namespace modifiers
 */
var modifiers = {
  /**
   * Modifier used to shift the popper on the start or end of its reference
   * element.<br />
   * It will read the variation of the `placement` property.<br />
   * It can be one either `-end` or `-start`.
   * @memberof modifiers
   * @inner
   */
  shift: {
    /** @prop {number} order=100 - Index used to define the order of execution */
    order: 100,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: shift
  },

  /**
   * The `offset` modifier can shift your popper on both its axis.
   *
   * It accepts the following units:
   * - `px` or unit-less, interpreted as pixels
   * - `%` or `%r`, percentage relative to the length of the reference element
   * - `%p`, percentage relative to the length of the popper element
   * - `vw`, CSS viewport width unit
   * - `vh`, CSS viewport height unit
   *
   * For length is intended the main axis relative to the placement of the popper.<br />
   * This means that if the placement is `top` or `bottom`, the length will be the
   * `width`. In case of `left` or `right`, it will be the `height`.
   *
   * You can provide a single value (as `Number` or `String`), or a pair of values
   * as `String` divided by a comma or one (or more) white spaces.<br />
   * The latter is a deprecated method because it leads to confusion and will be
   * removed in v2.<br />
   * Additionally, it accepts additions and subtractions between different units.
   * Note that multiplications and divisions aren't supported.
   *
   * Valid examples are:
   * ```
   * 10
   * '10%'
   * '10, 10'
   * '10%, 10'
   * '10 + 10%'
   * '10 - 5vh + 3%'
   * '-10px + 5vh, 5px - 6%'
   * ```
   * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
   * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
   * > You can read more on this at this [issue](https://github.com/FezVrasta/popper.js/issues/373).
   *
   * @memberof modifiers
   * @inner
   */
  offset: {
    /** @prop {number} order=200 - Index used to define the order of execution */
    order: 200,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: offset,
    /** @prop {Number|String} offset=0
     * The offset value as described in the modifier description
     */
    offset: 0
  },

  /**
   * Modifier used to prevent the popper from being positioned outside the boundary.
   *
   * A scenario exists where the reference itself is not within the boundaries.<br />
   * We can say it has "escaped the boundaries" — or just "escaped".<br />
   * In this case we need to decide whether the popper should either:
   *
   * - detach from the reference and remain "trapped" in the boundaries, or
   * - if it should ignore the boundary and "escape with its reference"
   *
   * When `escapeWithReference` is set to`true` and reference is completely
   * outside its boundaries, the popper will overflow (or completely leave)
   * the boundaries in order to remain attached to the edge of the reference.
   *
   * @memberof modifiers
   * @inner
   */
  preventOverflow: {
    /** @prop {number} order=300 - Index used to define the order of execution */
    order: 300,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: preventOverflow,
    /**
     * @prop {Array} [priority=['left','right','top','bottom']]
     * Popper will try to prevent overflow following these priorities by default,
     * then, it could overflow on the left and on top of the `boundariesElement`
     */
    priority: ['left', 'right', 'top', 'bottom'],
    /**
     * @prop {number} padding=5
     * Amount of pixel used to define a minimum distance between the boundaries
     * and the popper. This makes sure the popper always has a little padding
     * between the edges of its container
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='scrollParent'
     * Boundaries used by the modifier. Can be `scrollParent`, `window`,
     * `viewport` or any DOM element.
     */
    boundariesElement: 'scrollParent'
  },

  /**
   * Modifier used to make sure the reference and its popper stay near each other
   * without leaving any gap between the two. Especially useful when the arrow is
   * enabled and you want to ensure that it points to its reference element.
   * It cares only about the first axis. You can still have poppers with margin
   * between the popper and its reference element.
   * @memberof modifiers
   * @inner
   */
  keepTogether: {
    /** @prop {number} order=400 - Index used to define the order of execution */
    order: 400,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: keepTogether
  },

  /**
   * This modifier is used to move the `arrowElement` of the popper to make
   * sure it is positioned between the reference element and its popper element.
   * It will read the outer size of the `arrowElement` node to detect how many
   * pixels of conjunction are needed.
   *
   * It has no effect if no `arrowElement` is provided.
   * @memberof modifiers
   * @inner
   */
  arrow: {
    /** @prop {number} order=500 - Index used to define the order of execution */
    order: 500,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: arrow,
    /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
    element: '[x-arrow]'
  },

  /**
   * Modifier used to flip the popper's placement when it starts to overlap its
   * reference element.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   *
   * **NOTE:** this modifier will interrupt the current update cycle and will
   * restart it if it detects the need to flip the placement.
   * @memberof modifiers
   * @inner
   */
  flip: {
    /** @prop {number} order=600 - Index used to define the order of execution */
    order: 600,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: flip,
    /**
     * @prop {String|Array} behavior='flip'
     * The behavior used to change the popper's placement. It can be one of
     * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
     * placements (with optional variations)
     */
    behavior: 'flip',
    /**
     * @prop {number} padding=5
     * The popper will flip if it hits the edges of the `boundariesElement`
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='viewport'
     * The element which will define the boundaries of the popper position.
     * The popper will never be placed outside of the defined boundaries
     * (except if `keepTogether` is enabled)
     */
    boundariesElement: 'viewport',
    /**
     * @prop {Boolean} flipVariations=false
     * The popper will switch placement variation between `-start` and `-end` when
     * the reference element overlaps its boundaries.
     *
     * The original placement should have a set variation.
     */
    flipVariations: false,
    /**
     * @prop {Boolean} flipVariationsByContent=false
     * The popper will switch placement variation between `-start` and `-end` when
     * the popper element overlaps its reference boundaries.
     *
     * The original placement should have a set variation.
     */
    flipVariationsByContent: false
  },

  /**
   * Modifier used to make the popper flow toward the inner of the reference element.
   * By default, when this modifier is disabled, the popper will be placed outside
   * the reference element.
   * @memberof modifiers
   * @inner
   */
  inner: {
    /** @prop {number} order=700 - Index used to define the order of execution */
    order: 700,
    /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
    enabled: false,
    /** @prop {ModifierFn} */
    fn: inner
  },

  /**
   * Modifier used to hide the popper when its reference element is outside of the
   * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
   * be used to hide with a CSS selector the popper when its reference is
   * out of boundaries.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   * @memberof modifiers
   * @inner
   */
  hide: {
    /** @prop {number} order=800 - Index used to define the order of execution */
    order: 800,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: hide
  },

  /**
   * Computes the style that will be applied to the popper element to gets
   * properly positioned.
   *
   * Note that this modifier will not touch the DOM, it just prepares the styles
   * so that `applyStyle` modifier can apply it. This separation is useful
   * in case you need to replace `applyStyle` with a custom implementation.
   *
   * This modifier has `850` as `order` value to maintain backward compatibility
   * with previous versions of Popper.js. Expect the modifiers ordering method
   * to change in future major versions of the library.
   *
   * @memberof modifiers
   * @inner
   */
  computeStyle: {
    /** @prop {number} order=850 - Index used to define the order of execution */
    order: 850,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: computeStyle,
    /**
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3D transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties
     */
    gpuAcceleration: true,
    /**
     * @prop {string} [x='bottom']
     * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
     * Change this if your popper should grow in a direction different from `bottom`
     */
    x: 'bottom',
    /**
     * @prop {string} [x='left']
     * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
     * Change this if your popper should grow in a direction different from `right`
     */
    y: 'right'
  },

  /**
   * Applies the computed styles to the popper element.
   *
   * All the DOM manipulations are limited to this modifier. This is useful in case
   * you want to integrate Popper.js inside a framework or view library and you
   * want to delegate all the DOM manipulations to it.
   *
   * Note that if you disable this modifier, you must make sure the popper element
   * has its position set to `absolute` before Popper.js can do its work!
   *
   * Just disable this modifier and define your own to achieve the desired effect.
   *
   * @memberof modifiers
   * @inner
   */
  applyStyle: {
    /** @prop {number} order=900 - Index used to define the order of execution */
    order: 900,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: applyStyle,
    /** @prop {Function} */
    onLoad: applyStyleOnLoad,
    /**
     * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3D transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties
     */
    gpuAcceleration: undefined
  }
};

/**
 * The `dataObject` is an object containing all the information used by Popper.js.
 * This object is passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
 * @name dataObject
 * @property {Object} data.instance The Popper.js instance
 * @property {String} data.placement Placement applied to popper
 * @property {String} data.originalPlacement Placement originally defined on init
 * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
 * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper
 * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
 * @property {Object} data.styles Any CSS property defined here will be applied to the popper. It expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow. It expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.boundaries Offsets of the popper boundaries
 * @property {Object} data.offsets The measurements of popper, reference and arrow elements
 * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
 */

/**
 * Default options provided to Popper.js constructor.<br />
 * These can be overridden using the `options` argument of Popper.js.<br />
 * To override an option, simply pass an object with the same
 * structure of the `options` object, as the 3rd argument. For example:
 * ```
 * new Popper(ref, pop, {
 *   modifiers: {
 *     preventOverflow: { enabled: false }
 *   }
 * })
 * ```
 * @type {Object}
 * @static
 * @memberof Popper
 */
var Defaults = {
  /**
   * Popper's placement.
   * @prop {Popper.placements} placement='bottom'
   */
  placement: 'bottom',

  /**
   * Set this to true if you want popper to position it self in 'fixed' mode
   * @prop {Boolean} positionFixed=false
   */
  positionFixed: false,

  /**
   * Whether events (resize, scroll) are initially enabled.
   * @prop {Boolean} eventsEnabled=true
   */
  eventsEnabled: true,

  /**
   * Set to true if you want to automatically remove the popper when
   * you call the `destroy` method.
   * @prop {Boolean} removeOnDestroy=false
   */
  removeOnDestroy: false,

  /**
   * Callback called when the popper is created.<br />
   * By default, it is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onCreate}
   */
  onCreate: function onCreate() {},

  /**
   * Callback called when the popper is updated. This callback is not called
   * on the initialization/creation of the popper, but only on subsequent
   * updates.<br />
   * By default, it is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onUpdate}
   */
  onUpdate: function onUpdate() {},

  /**
   * List of modifiers used to modify the offsets before they are applied to the popper.
   * They provide most of the functionalities of Popper.js.
   * @prop {modifiers}
   */
  modifiers: modifiers
};

/**
 * @callback onCreate
 * @param {dataObject} data
 */

/**
 * @callback onUpdate
 * @param {dataObject} data
 */

// Utils
// Methods
var Popper = function () {
  /**
   * Creates a new Popper.js instance.
   * @class Popper
   * @param {Element|referenceObject} reference - The reference element used to position the popper
   * @param {Element} popper - The HTML / XML element used as the popper
   * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
   * @return {Object} instance - The generated Popper.js instance
   */
  function Popper(reference, popper) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, Popper);

    this.scheduleUpdate = function () {
      return requestAnimationFrame(_this.update);
    };

    // make update() debounced, so that it only runs at most once-per-tick
    this.update = debounce(this.update.bind(this));

    // with {} we create a new object with the options inside it
    this.options = _extends({}, Popper.Defaults, options);

    // init state
    this.state = {
      isDestroyed: false,
      isCreated: false,
      scrollParents: []
    };

    // get reference and popper elements (allow jQuery wrappers)
    this.reference = reference && reference.jquery ? reference[0] : reference;
    this.popper = popper && popper.jquery ? popper[0] : popper;

    // Deep merge modifiers options
    this.options.modifiers = {};
    Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
      _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
    });

    // Refactoring modifiers' list (Object => Array)
    this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
      return _extends({
        name: name
      }, _this.options.modifiers[name]);
    })
    // sort the modifiers by order
    .sort(function (a, b) {
      return a.order - b.order;
    });

    // modifiers have the ability to execute arbitrary code when Popper.js get inited
    // such code is executed in the same order of its modifier
    // they could add new properties to their options configuration
    // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
    this.modifiers.forEach(function (modifierOptions) {
      if (modifierOptions.enabled && isFunction$2(modifierOptions.onLoad)) {
        modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
      }
    });

    // fire the first update to position the popper in the right place
    this.update();

    var eventsEnabled = this.options.eventsEnabled;
    if (eventsEnabled) {
      // setup event listeners, they will take care of update the position in specific situations
      this.enableEventListeners();
    }

    this.state.eventsEnabled = eventsEnabled;
  }

  // We can't use class properties because they don't get listed in the
  // class prototype and break stuff like Sinon stubs


  createClass(Popper, [{
    key: 'update',
    value: function update$$1() {
      return update.call(this);
    }
  }, {
    key: 'destroy',
    value: function destroy$$1() {
      return destroy.call(this);
    }
  }, {
    key: 'enableEventListeners',
    value: function enableEventListeners$$1() {
      return enableEventListeners.call(this);
    }
  }, {
    key: 'disableEventListeners',
    value: function disableEventListeners$$1() {
      return disableEventListeners.call(this);
    }

    /**
     * Schedules an update. It will run on the next UI update available.
     * @method scheduleUpdate
     * @memberof Popper
     */


    /**
     * Collection of utilities useful when writing custom modifiers.
     * Starting from version 1.7, this method is available only if you
     * include `popper-utils.js` before `popper.js`.
     *
     * **DEPRECATION**: This way to access PopperUtils is deprecated
     * and will be removed in v2! Use the PopperUtils module directly instead.
     * Due to the high instability of the methods contained in Utils, we can't
     * guarantee them to follow semver. Use them at your own risk!
     * @static
     * @private
     * @type {Object}
     * @deprecated since version 1.8
     * @member Utils
     * @memberof Popper
     */

  }]);
  return Popper;
}();

/**
 * The `referenceObject` is an object that provides an interface compatible with Popper.js
 * and lets you use it as replacement of a real DOM node.<br />
 * You can use this method to position a popper relatively to a set of coordinates
 * in case you don't have a DOM node to use as reference.
 *
 * ```
 * new Popper(referenceObject, popperNode);
 * ```
 *
 * NB: This feature isn't supported in Internet Explorer 10.
 * @name referenceObject
 * @property {Function} data.getBoundingClientRect
 * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
 * @property {number} data.clientWidth
 * An ES6 getter that will return the width of the virtual reference element.
 * @property {number} data.clientHeight
 * An ES6 getter that will return the height of the virtual reference element.
 */


Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
Popper.placements = placements;
Popper.Defaults = Defaults;

var key = '__global_unique_id__';

var gud = function() {
  return commonjsGlobal[key] = (commonjsGlobal[key] || 0) + 1;
};

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var warning = function() {};

{
  var printWarning = function printWarning(format, args) {
    var len = arguments.length;
    args = new Array(len > 1 ? len - 1 : 0);
    for (var key = 1; key < len; key++) {
      args[key - 1] = arguments[key];
    }
    var argIndex = 0;
    var message = 'Warning: ' +
      format.replace(/%s/g, function() {
        return args[argIndex++];
      });
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  warning = function(condition, format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) {
      args[key - 2] = arguments[key];
    }
    if (format === undefined) {
      throw new Error(
          '`warning(condition, format, ...args)` requires a warning ' +
          'message argument'
      );
    }
    if (!condition) {
      printWarning.apply(null, [format].concat(args));
    }
  };
}

var warning_1 = warning;

var implementation$4 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;



var _react2 = _interopRequireDefault(React);



var _propTypes2 = _interopRequireDefault(propTypes);



var _gud2 = _interopRequireDefault(gud);



var _warning2 = _interopRequireDefault(warning_1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MAX_SIGNED_31_BIT_INT = 1073741823;

// Inlined Object.is polyfill.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
function objectIs(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}

function createEventEmitter(value) {
  var handlers = [];
  return {
    on: function on(handler) {
      handlers.push(handler);
    },
    off: function off(handler) {
      handlers = handlers.filter(function (h) {
        return h !== handler;
      });
    },
    get: function get() {
      return value;
    },
    set: function set(newValue, changedBits) {
      value = newValue;
      handlers.forEach(function (handler) {
        return handler(value, changedBits);
      });
    }
  };
}

function onlyChild(children) {
  return Array.isArray(children) ? children[0] : children;
}

function createReactContext(defaultValue, calculateChangedBits) {
  var _Provider$childContex, _Consumer$contextType;

  var contextProp = '__create-react-context-' + (0, _gud2.default)() + '__';

  var Provider = function (_Component) {
    _inherits(Provider, _Component);

    function Provider() {
      var _temp, _this, _ret;

      _classCallCheck(this, Provider);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.emitter = createEventEmitter(_this.props.value), _temp), _possibleConstructorReturn(_this, _ret);
    }

    Provider.prototype.getChildContext = function getChildContext() {
      var _ref;

      return _ref = {}, _ref[contextProp] = this.emitter, _ref;
    };

    Provider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
      if (this.props.value !== nextProps.value) {
        var oldValue = this.props.value;
        var newValue = nextProps.value;
        var changedBits = void 0;

        if (objectIs(oldValue, newValue)) {
          changedBits = 0; // No change
        } else {
          changedBits = typeof calculateChangedBits === 'function' ? calculateChangedBits(oldValue, newValue) : MAX_SIGNED_31_BIT_INT;
          {
            (0, _warning2.default)((changedBits & MAX_SIGNED_31_BIT_INT) === changedBits, 'calculateChangedBits: Expected the return value to be a ' + '31-bit integer. Instead received: %s', changedBits);
          }

          changedBits |= 0;

          if (changedBits !== 0) {
            this.emitter.set(nextProps.value, changedBits);
          }
        }
      }
    };

    Provider.prototype.render = function render() {
      return this.props.children;
    };

    return Provider;
  }(React.Component);

  Provider.childContextTypes = (_Provider$childContex = {}, _Provider$childContex[contextProp] = _propTypes2.default.object.isRequired, _Provider$childContex);

  var Consumer = function (_Component2) {
    _inherits(Consumer, _Component2);

    function Consumer() {
      var _temp2, _this2, _ret2;

      _classCallCheck(this, Consumer);

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _ret2 = (_temp2 = (_this2 = _possibleConstructorReturn(this, _Component2.call.apply(_Component2, [this].concat(args))), _this2), _this2.state = {
        value: _this2.getValue()
      }, _this2.onUpdate = function (newValue, changedBits) {
        var observedBits = _this2.observedBits | 0;
        if ((observedBits & changedBits) !== 0) {
          _this2.setState({ value: _this2.getValue() });
        }
      }, _temp2), _possibleConstructorReturn(_this2, _ret2);
    }

    Consumer.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
      var observedBits = nextProps.observedBits;

      this.observedBits = observedBits === undefined || observedBits === null ? MAX_SIGNED_31_BIT_INT // Subscribe to all changes by default
      : observedBits;
    };

    Consumer.prototype.componentDidMount = function componentDidMount() {
      if (this.context[contextProp]) {
        this.context[contextProp].on(this.onUpdate);
      }
      var observedBits = this.props.observedBits;

      this.observedBits = observedBits === undefined || observedBits === null ? MAX_SIGNED_31_BIT_INT // Subscribe to all changes by default
      : observedBits;
    };

    Consumer.prototype.componentWillUnmount = function componentWillUnmount() {
      if (this.context[contextProp]) {
        this.context[contextProp].off(this.onUpdate);
      }
    };

    Consumer.prototype.getValue = function getValue() {
      if (this.context[contextProp]) {
        return this.context[contextProp].get();
      } else {
        return defaultValue;
      }
    };

    Consumer.prototype.render = function render() {
      return onlyChild(this.props.children)(this.state.value);
    };

    return Consumer;
  }(React.Component);

  Consumer.contextTypes = (_Consumer$contextType = {}, _Consumer$contextType[contextProp] = _propTypes2.default.object, _Consumer$contextType);


  return {
    Provider: Provider,
    Consumer: Consumer
  };
}

exports.default = createReactContext;
module.exports = exports['default'];
});

unwrapExports(implementation$4);

var lib = createCommonjsModule(function (module, exports) {

exports.__esModule = true;



var _react2 = _interopRequireDefault(React);



var _implementation2 = _interopRequireDefault(implementation$4);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _react2.default.createContext || _implementation2.default;
module.exports = exports['default'];
});

var createContext = unwrapExports(lib);

var ManagerReferenceNodeContext = createContext();
var ManagerReferenceNodeSetterContext = createContext();

var Manager =
/*#__PURE__*/
function (_React$Component) {
  inheritsLoose(Manager, _React$Component);

  function Manager() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    defineProperty(assertThisInitialized(_this), "referenceNode", void 0);

    defineProperty(assertThisInitialized(_this), "setReferenceNode", function (newReferenceNode) {
      if (newReferenceNode && _this.referenceNode !== newReferenceNode) {
        _this.referenceNode = newReferenceNode;

        _this.forceUpdate();
      }
    });

    return _this;
  }

  var _proto = Manager.prototype;

  _proto.componentWillUnmount = function componentWillUnmount() {
    this.referenceNode = null;
  };

  _proto.render = function render() {
    return createElement(ManagerReferenceNodeContext.Provider, {
      value: this.referenceNode
    }, createElement(ManagerReferenceNodeSetterContext.Provider, {
      value: this.setReferenceNode
    }, this.props.children));
  };

  return Manager;
}(Component);

/**
 * Takes an argument and if it's an array, returns the first item in the array,
 * otherwise returns the argument. Used for Preact compatibility.
 */
var unwrapArray = function unwrapArray(arg) {
  return Array.isArray(arg) ? arg[0] : arg;
};
/**
 * Takes a maybe-undefined function and arbitrary args and invokes the function
 * only if it is defined.
 */

var safeInvoke$1 = function safeInvoke(fn) {
  if (typeof fn === "function") {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return fn.apply(void 0, args);
  }
};
/**
 * Does a shallow equality check of two objects by comparing the reference
 * equality of each value.
 */

var shallowEqual = function shallowEqual(objA, objB) {
  var aKeys = Object.keys(objA);
  var bKeys = Object.keys(objB);

  if (bKeys.length !== aKeys.length) {
    return false;
  }

  for (var i = 0; i < bKeys.length; i++) {
    var key = aKeys[i];

    if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
};
/**
 * Sets a ref using either a ref callback or a ref object
 */

var setRef = function setRef(ref, node) {
  // if its a function call it
  if (typeof ref === "function") {
    return safeInvoke$1(ref, node);
  } // otherwise we should treat it as a ref object
  else if (ref != null) {
      ref.current = node;
    }
};

var initialStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  opacity: 0,
  pointerEvents: 'none'
};
var initialArrowStyle = {};
var InnerPopper =
/*#__PURE__*/
function (_React$Component) {
  inheritsLoose(InnerPopper, _React$Component);

  function InnerPopper() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    defineProperty(assertThisInitialized(_this), "state", {
      data: undefined,
      placement: undefined
    });

    defineProperty(assertThisInitialized(_this), "popperInstance", void 0);

    defineProperty(assertThisInitialized(_this), "popperNode", null);

    defineProperty(assertThisInitialized(_this), "arrowNode", null);

    defineProperty(assertThisInitialized(_this), "setPopperNode", function (popperNode) {
      if (!popperNode || _this.popperNode === popperNode) return;
      setRef(_this.props.innerRef, popperNode);
      _this.popperNode = popperNode;

      _this.updatePopperInstance();
    });

    defineProperty(assertThisInitialized(_this), "setArrowNode", function (arrowNode) {
      _this.arrowNode = arrowNode;
    });

    defineProperty(assertThisInitialized(_this), "updateStateModifier", {
      enabled: true,
      order: 900,
      fn: function fn(data) {
        var placement = data.placement;

        _this.setState({
          data: data,
          placement: placement
        });

        return data;
      }
    });

    defineProperty(assertThisInitialized(_this), "getOptions", function () {
      return {
        placement: _this.props.placement,
        eventsEnabled: _this.props.eventsEnabled,
        positionFixed: _this.props.positionFixed,
        modifiers: _extends_1({}, _this.props.modifiers, {
          arrow: _extends_1({}, _this.props.modifiers && _this.props.modifiers.arrow, {
            enabled: !!_this.arrowNode,
            element: _this.arrowNode
          }),
          applyStyle: {
            enabled: false
          },
          updateStateModifier: _this.updateStateModifier
        })
      };
    });

    defineProperty(assertThisInitialized(_this), "getPopperStyle", function () {
      return !_this.popperNode || !_this.state.data ? initialStyle : _extends_1({
        position: _this.state.data.offsets.popper.position
      }, _this.state.data.styles);
    });

    defineProperty(assertThisInitialized(_this), "getPopperPlacement", function () {
      return !_this.state.data ? undefined : _this.state.placement;
    });

    defineProperty(assertThisInitialized(_this), "getArrowStyle", function () {
      return !_this.arrowNode || !_this.state.data ? initialArrowStyle : _this.state.data.arrowStyles;
    });

    defineProperty(assertThisInitialized(_this), "getOutOfBoundariesState", function () {
      return _this.state.data ? _this.state.data.hide : undefined;
    });

    defineProperty(assertThisInitialized(_this), "destroyPopperInstance", function () {
      if (!_this.popperInstance) return;

      _this.popperInstance.destroy();

      _this.popperInstance = null;
    });

    defineProperty(assertThisInitialized(_this), "updatePopperInstance", function () {
      _this.destroyPopperInstance();

      var _assertThisInitialize = assertThisInitialized(_this),
          popperNode = _assertThisInitialize.popperNode;

      var referenceElement = _this.props.referenceElement;
      if (!referenceElement || !popperNode) return;
      _this.popperInstance = new Popper(referenceElement, popperNode, _this.getOptions());
    });

    defineProperty(assertThisInitialized(_this), "scheduleUpdate", function () {
      if (_this.popperInstance) {
        _this.popperInstance.scheduleUpdate();
      }
    });

    return _this;
  }

  var _proto = InnerPopper.prototype;

  _proto.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
    // If the Popper.js options have changed, update the instance (destroy + create)
    if (this.props.placement !== prevProps.placement || this.props.referenceElement !== prevProps.referenceElement || this.props.positionFixed !== prevProps.positionFixed || !deepEqual_1(this.props.modifiers, prevProps.modifiers, {
      strict: true
    })) {
      // develop only check that modifiers isn't being updated needlessly
      {
        if (this.props.modifiers !== prevProps.modifiers && this.props.modifiers != null && prevProps.modifiers != null && shallowEqual(this.props.modifiers, prevProps.modifiers)) {
          console.warn("'modifiers' prop reference updated even though all values appear the same.\nConsider memoizing the 'modifiers' object to avoid needless rendering.");
        }
      }

      this.updatePopperInstance();
    } else if (this.props.eventsEnabled !== prevProps.eventsEnabled && this.popperInstance) {
      this.props.eventsEnabled ? this.popperInstance.enableEventListeners() : this.popperInstance.disableEventListeners();
    } // A placement difference in state means popper determined a new placement
    // apart from the props value. By the time the popper element is rendered with
    // the new position Popper has already measured it, if the place change triggers
    // a size change it will result in a misaligned popper. So we schedule an update to be sure.


    if (prevState.placement !== this.state.placement) {
      this.scheduleUpdate();
    }
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    setRef(this.props.innerRef, null);
    this.destroyPopperInstance();
  };

  _proto.render = function render() {
    return unwrapArray(this.props.children)({
      ref: this.setPopperNode,
      style: this.getPopperStyle(),
      placement: this.getPopperPlacement(),
      outOfBoundaries: this.getOutOfBoundariesState(),
      scheduleUpdate: this.scheduleUpdate,
      arrowProps: {
        ref: this.setArrowNode,
        style: this.getArrowStyle()
      }
    });
  };

  return InnerPopper;
}(Component);

defineProperty(InnerPopper, "defaultProps", {
  placement: 'bottom',
  eventsEnabled: true,
  referenceElement: undefined,
  positionFixed: false
});
function Popper$1(_ref) {
  var referenceElement = _ref.referenceElement,
      props = objectWithoutPropertiesLoose(_ref, ["referenceElement"]);

  return createElement(ManagerReferenceNodeContext.Consumer, null, function (referenceNode) {
    return createElement(InnerPopper, _extends_1({
      referenceElement: referenceElement !== undefined ? referenceElement : referenceNode
    }, props));
  });
}

var InnerReference =
/*#__PURE__*/
function (_React$Component) {
  inheritsLoose(InnerReference, _React$Component);

  function InnerReference() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    defineProperty(assertThisInitialized(_this), "refHandler", function (node) {
      setRef(_this.props.innerRef, node);
      safeInvoke$1(_this.props.setReferenceNode, node);
    });

    return _this;
  }

  var _proto = InnerReference.prototype;

  _proto.componentWillUnmount = function componentWillUnmount() {
    setRef(this.props.innerRef, null);
  };

  _proto.render = function render() {
    warning_1(Boolean(this.props.setReferenceNode), '`Reference` should not be used outside of a `Manager` component.');
    return unwrapArray(this.props.children)({
      ref: this.refHandler
    });
  };

  return InnerReference;
}(Component);

function Reference(props) {
  return createElement(ManagerReferenceNodeSetterContext.Consumer, null, function (setReferenceNode) {
    return createElement(InnerReference, _extends_1({
      setReferenceNode: setReferenceNode
    }, props));
  });
}

var interopRequireDefault = createCommonjsModule(function (module) {
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
});

unwrapExports(interopRequireDefault);

var hasClass_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.default = hasClass;

function hasClass(element, className) {
  if (element.classList) return !!className && element.classList.contains(className);else return (" " + (element.className.baseVal || element.className) + " ").indexOf(" " + className + " ") !== -1;
}

module.exports = exports["default"];
});

unwrapExports(hasClass_1);

var addClass_1 = createCommonjsModule(function (module, exports) {



exports.__esModule = true;
exports.default = addClass;

var _hasClass = interopRequireDefault(hasClass_1);

function addClass(element, className) {
  if (element.classList) element.classList.add(className);else if (!(0, _hasClass.default)(element, className)) if (typeof element.className === 'string') element.className = element.className + ' ' + className;else element.setAttribute('class', (element.className && element.className.baseVal || '') + ' ' + className);
}

module.exports = exports["default"];
});

unwrapExports(addClass_1);

function replaceClassName(origClass, classToRemove) {
  return origClass.replace(new RegExp('(^|\\s)' + classToRemove + '(?:\\s|$)', 'g'), '$1').replace(/\s+/g, ' ').replace(/^\s*|\s*$/g, '');
}

var removeClass = function removeClass(element, className) {
  if (element.classList) element.classList.remove(className);else if (typeof element.className === 'string') element.className = replaceClassName(element.className, className);else element.setAttribute('class', replaceClassName(element.className && element.className.baseVal || '', className));
};

var PropTypes = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.classNamesShape = exports.timeoutsShape = void 0;

var _propTypes = _interopRequireDefault(propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var timeoutsShape =  _propTypes.default.oneOfType([_propTypes.default.number, _propTypes.default.shape({
  enter: _propTypes.default.number,
  exit: _propTypes.default.number,
  appear: _propTypes.default.number
}).isRequired]) ;
exports.timeoutsShape = timeoutsShape;
var classNamesShape =  _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({
  enter: _propTypes.default.string,
  exit: _propTypes.default.string,
  active: _propTypes.default.string
}), _propTypes.default.shape({
  enter: _propTypes.default.string,
  enterDone: _propTypes.default.string,
  enterActive: _propTypes.default.string,
  exit: _propTypes.default.string,
  exitDone: _propTypes.default.string,
  exitActive: _propTypes.default.string
})]) ;
exports.classNamesShape = classNamesShape;
});

unwrapExports(PropTypes);
var PropTypes_1 = PropTypes.classNamesShape;
var PropTypes_2 = PropTypes.timeoutsShape;

var Transition_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.default = exports.EXITING = exports.ENTERED = exports.ENTERING = exports.EXITED = exports.UNMOUNTED = void 0;

var PropTypes$1 = _interopRequireWildcard(propTypes);

var _react = _interopRequireDefault(React);

var _reactDom = _interopRequireDefault(ReactDOM);





function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var UNMOUNTED = 'unmounted';
exports.UNMOUNTED = UNMOUNTED;
var EXITED = 'exited';
exports.EXITED = EXITED;
var ENTERING = 'entering';
exports.ENTERING = ENTERING;
var ENTERED = 'entered';
exports.ENTERED = ENTERED;
var EXITING = 'exiting';
/**
 * The Transition component lets you describe a transition from one component
 * state to another _over time_ with a simple declarative API. Most commonly
 * it's used to animate the mounting and unmounting of a component, but can also
 * be used to describe in-place transition states as well.
 *
 * ---
 *
 * **Note**: `Transition` is a platform-agnostic base component. If you're using
 * transitions in CSS, you'll probably want to use
 * [`CSSTransition`](https://reactcommunity.org/react-transition-group/css-transition)
 * instead. It inherits all the features of `Transition`, but contains
 * additional features necessary to play nice with CSS transitions (hence the
 * name of the component).
 *
 * ---
 *
 * By default the `Transition` component does not alter the behavior of the
 * component it renders, it only tracks "enter" and "exit" states for the
 * components. It's up to you to give meaning and effect to those states. For
 * example we can add styles to a component when it enters or exits:
 *
 * ```jsx
 * import { Transition } from 'react-transition-group';
 *
 * const duration = 300;
 *
 * const defaultStyle = {
 *   transition: `opacity ${duration}ms ease-in-out`,
 *   opacity: 0,
 * }
 *
 * const transitionStyles = {
 *   entering: { opacity: 0 },
 *   entered:  { opacity: 1 },
 * };
 *
 * const Fade = ({ in: inProp }) => (
 *   <Transition in={inProp} timeout={duration}>
 *     {state => (
 *       <div style={{
 *         ...defaultStyle,
 *         ...transitionStyles[state]
 *       }}>
 *         I'm a fade Transition!
 *       </div>
 *     )}
 *   </Transition>
 * );
 * ```
 *
 * There are 4 main states a Transition can be in:
 *  - `'entering'`
 *  - `'entered'`
 *  - `'exiting'`
 *  - `'exited'`
 *
 * Transition state is toggled via the `in` prop. When `true` the component
 * begins the "Enter" stage. During this stage, the component will shift from
 * its current transition state, to `'entering'` for the duration of the
 * transition and then to the `'entered'` stage once it's complete. Let's take
 * the following example (we'll use the
 * [useState](https://reactjs.org/docs/hooks-reference.html#usestate) hook):
 *
 * ```jsx
 * function App() {
 *   const [inProp, setInProp] = useState(false);
 *   return (
 *     <div>
 *       <Transition in={inProp} timeout={500}>
 *         {state => (
 *           // ...
 *         )}
 *       </Transition>
 *       <button onClick={() => setInProp(true)}>
 *         Click to Enter
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * When the button is clicked the component will shift to the `'entering'` state
 * and stay there for 500ms (the value of `timeout`) before it finally switches
 * to `'entered'`.
 *
 * When `in` is `false` the same thing happens except the state moves from
 * `'exiting'` to `'exited'`.
 */

exports.EXITING = EXITING;

var Transition =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Transition, _React$Component);

  function Transition(props, context) {
    var _this;

    _this = _React$Component.call(this, props, context) || this;
    var parentGroup = context.transitionGroup; // In the context of a TransitionGroup all enters are really appears

    var appear = parentGroup && !parentGroup.isMounting ? props.enter : props.appear;
    var initialStatus;
    _this.appearStatus = null;

    if (props.in) {
      if (appear) {
        initialStatus = EXITED;
        _this.appearStatus = ENTERING;
      } else {
        initialStatus = ENTERED;
      }
    } else {
      if (props.unmountOnExit || props.mountOnEnter) {
        initialStatus = UNMOUNTED;
      } else {
        initialStatus = EXITED;
      }
    }

    _this.state = {
      status: initialStatus
    };
    _this.nextCallback = null;
    return _this;
  }

  var _proto = Transition.prototype;

  _proto.getChildContext = function getChildContext() {
    return {
      transitionGroup: null // allows for nested Transitions

    };
  };

  Transition.getDerivedStateFromProps = function getDerivedStateFromProps(_ref, prevState) {
    var nextIn = _ref.in;

    if (nextIn && prevState.status === UNMOUNTED) {
      return {
        status: EXITED
      };
    }

    return null;
  }; // getSnapshotBeforeUpdate(prevProps) {
  //   let nextStatus = null
  //   if (prevProps !== this.props) {
  //     const { status } = this.state
  //     if (this.props.in) {
  //       if (status !== ENTERING && status !== ENTERED) {
  //         nextStatus = ENTERING
  //       }
  //     } else {
  //       if (status === ENTERING || status === ENTERED) {
  //         nextStatus = EXITING
  //       }
  //     }
  //   }
  //   return { nextStatus }
  // }


  _proto.componentDidMount = function componentDidMount() {
    this.updateStatus(true, this.appearStatus);
  };

  _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
    var nextStatus = null;

    if (prevProps !== this.props) {
      var status = this.state.status;

      if (this.props.in) {
        if (status !== ENTERING && status !== ENTERED) {
          nextStatus = ENTERING;
        }
      } else {
        if (status === ENTERING || status === ENTERED) {
          nextStatus = EXITING;
        }
      }
    }

    this.updateStatus(false, nextStatus);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this.cancelNextCallback();
  };

  _proto.getTimeouts = function getTimeouts() {
    var timeout = this.props.timeout;
    var exit, enter, appear;
    exit = enter = appear = timeout;

    if (timeout != null && typeof timeout !== 'number') {
      exit = timeout.exit;
      enter = timeout.enter; // TODO: remove fallback for next major

      appear = timeout.appear !== undefined ? timeout.appear : enter;
    }

    return {
      exit: exit,
      enter: enter,
      appear: appear
    };
  };

  _proto.updateStatus = function updateStatus(mounting, nextStatus) {
    if (mounting === void 0) {
      mounting = false;
    }

    if (nextStatus !== null) {
      // nextStatus will always be ENTERING or EXITING.
      this.cancelNextCallback();

      var node = _reactDom.default.findDOMNode(this);

      if (nextStatus === ENTERING) {
        this.performEnter(node, mounting);
      } else {
        this.performExit(node);
      }
    } else if (this.props.unmountOnExit && this.state.status === EXITED) {
      this.setState({
        status: UNMOUNTED
      });
    }
  };

  _proto.performEnter = function performEnter(node, mounting) {
    var _this2 = this;

    var enter = this.props.enter;
    var appearing = this.context.transitionGroup ? this.context.transitionGroup.isMounting : mounting;
    var timeouts = this.getTimeouts();
    var enterTimeout = appearing ? timeouts.appear : timeouts.enter; // no enter animation skip right to ENTERED
    // if we are mounting and running this it means appear _must_ be set

    if (!mounting && !enter) {
      this.safeSetState({
        status: ENTERED
      }, function () {
        _this2.props.onEntered(node);
      });
      return;
    }

    this.props.onEnter(node, appearing);
    this.safeSetState({
      status: ENTERING
    }, function () {
      _this2.props.onEntering(node, appearing);

      _this2.onTransitionEnd(node, enterTimeout, function () {
        _this2.safeSetState({
          status: ENTERED
        }, function () {
          _this2.props.onEntered(node, appearing);
        });
      });
    });
  };

  _proto.performExit = function performExit(node) {
    var _this3 = this;

    var exit = this.props.exit;
    var timeouts = this.getTimeouts(); // no exit animation skip right to EXITED

    if (!exit) {
      this.safeSetState({
        status: EXITED
      }, function () {
        _this3.props.onExited(node);
      });
      return;
    }

    this.props.onExit(node);
    this.safeSetState({
      status: EXITING
    }, function () {
      _this3.props.onExiting(node);

      _this3.onTransitionEnd(node, timeouts.exit, function () {
        _this3.safeSetState({
          status: EXITED
        }, function () {
          _this3.props.onExited(node);
        });
      });
    });
  };

  _proto.cancelNextCallback = function cancelNextCallback() {
    if (this.nextCallback !== null) {
      this.nextCallback.cancel();
      this.nextCallback = null;
    }
  };

  _proto.safeSetState = function safeSetState(nextState, callback) {
    // This shouldn't be necessary, but there are weird race conditions with
    // setState callbacks and unmounting in testing, so always make sure that
    // we can cancel any pending setState callbacks after we unmount.
    callback = this.setNextCallback(callback);
    this.setState(nextState, callback);
  };

  _proto.setNextCallback = function setNextCallback(callback) {
    var _this4 = this;

    var active = true;

    this.nextCallback = function (event) {
      if (active) {
        active = false;
        _this4.nextCallback = null;
        callback(event);
      }
    };

    this.nextCallback.cancel = function () {
      active = false;
    };

    return this.nextCallback;
  };

  _proto.onTransitionEnd = function onTransitionEnd(node, timeout, handler) {
    this.setNextCallback(handler);
    var doesNotHaveTimeoutOrListener = timeout == null && !this.props.addEndListener;

    if (!node || doesNotHaveTimeoutOrListener) {
      setTimeout(this.nextCallback, 0);
      return;
    }

    if (this.props.addEndListener) {
      this.props.addEndListener(node, this.nextCallback);
    }

    if (timeout != null) {
      setTimeout(this.nextCallback, timeout);
    }
  };

  _proto.render = function render() {
    var status = this.state.status;

    if (status === UNMOUNTED) {
      return null;
    }

    var _this$props = this.props,
        children = _this$props.children,
        childProps = _objectWithoutPropertiesLoose(_this$props, ["children"]); // filter props for Transtition


    delete childProps.in;
    delete childProps.mountOnEnter;
    delete childProps.unmountOnExit;
    delete childProps.appear;
    delete childProps.enter;
    delete childProps.exit;
    delete childProps.timeout;
    delete childProps.addEndListener;
    delete childProps.onEnter;
    delete childProps.onEntering;
    delete childProps.onEntered;
    delete childProps.onExit;
    delete childProps.onExiting;
    delete childProps.onExited;

    if (typeof children === 'function') {
      return children(status, childProps);
    }

    var child = _react.default.Children.only(children);

    return _react.default.cloneElement(child, childProps);
  };

  return Transition;
}(_react.default.Component);

Transition.contextTypes = {
  transitionGroup: PropTypes$1.object
};
Transition.childContextTypes = {
  transitionGroup: function transitionGroup() {}
};
Transition.propTypes =  {
  /**
   * A `function` child can be used instead of a React element. This function is
   * called with the current transition status (`'entering'`, `'entered'`,
   * `'exiting'`, `'exited'`, `'unmounted'`), which can be used to apply context
   * specific props to a component.
   *
   * ```jsx
   * <Transition in={this.state.in} timeout={150}>
   *   {state => (
   *     <MyComponent className={`fade fade-${state}`} />
   *   )}
   * </Transition>
   * ```
   */
  children: PropTypes$1.oneOfType([PropTypes$1.func.isRequired, PropTypes$1.element.isRequired]).isRequired,

  /**
   * Show the component; triggers the enter or exit states
   */
  in: PropTypes$1.bool,

  /**
   * By default the child component is mounted immediately along with
   * the parent `Transition` component. If you want to "lazy mount" the component on the
   * first `in={true}` you can set `mountOnEnter`. After the first enter transition the component will stay
   * mounted, even on "exited", unless you also specify `unmountOnExit`.
   */
  mountOnEnter: PropTypes$1.bool,

  /**
   * By default the child component stays mounted after it reaches the `'exited'` state.
   * Set `unmountOnExit` if you'd prefer to unmount the component after it finishes exiting.
   */
  unmountOnExit: PropTypes$1.bool,

  /**
   * Normally a component is not transitioned if it is shown when the `<Transition>` component mounts.
   * If you want to transition on the first mount set `appear` to `true`, and the
   * component will transition in as soon as the `<Transition>` mounts.
   *
   * > Note: there are no specific "appear" states. `appear` only adds an additional `enter` transition.
   */
  appear: PropTypes$1.bool,

  /**
   * Enable or disable enter transitions.
   */
  enter: PropTypes$1.bool,

  /**
   * Enable or disable exit transitions.
   */
  exit: PropTypes$1.bool,

  /**
   * The duration of the transition, in milliseconds.
   * Required unless `addEndListener` is provided.
   *
   * You may specify a single timeout for all transitions:
   *
   * ```jsx
   * timeout={500}
   * ```
   *
   * or individually:
   *
   * ```jsx
   * timeout={{
   *  appear: 500,
   *  enter: 300,
   *  exit: 500,
   * }}
   * ```
   *
   * - `appear` defaults to the value of `enter`
   * - `enter` defaults to `0`
   * - `exit` defaults to `0`
   *
   * @type {number | { enter?: number, exit?: number, appear?: number }}
   */
  timeout: function timeout(props) {
    var pt = PropTypes.timeoutsShape;
    if (!props.addEndListener) pt = pt.isRequired;

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    return pt.apply(void 0, [props].concat(args));
  },

  /**
   * Add a custom transition end trigger. Called with the transitioning
   * DOM node and a `done` callback. Allows for more fine grained transition end
   * logic. **Note:** Timeouts are still used as a fallback if provided.
   *
   * ```jsx
   * addEndListener={(node, done) => {
   *   // use the css transitionend event to mark the finish of a transition
   *   node.addEventListener('transitionend', done, false);
   * }}
   * ```
   */
  addEndListener: PropTypes$1.func,

  /**
   * Callback fired before the "entering" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * @type Function(node: HtmlElement, isAppearing: bool) -> void
   */
  onEnter: PropTypes$1.func,

  /**
   * Callback fired after the "entering" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntering: PropTypes$1.func,

  /**
   * Callback fired after the "entered" status is applied. An extra parameter
   * `isAppearing` is supplied to indicate if the enter stage is occurring on the initial mount
   *
   * @type Function(node: HtmlElement, isAppearing: bool) -> void
   */
  onEntered: PropTypes$1.func,

  /**
   * Callback fired before the "exiting" status is applied.
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExit: PropTypes$1.func,

  /**
   * Callback fired after the "exiting" status is applied.
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExiting: PropTypes$1.func,

  /**
   * Callback fired after the "exited" status is applied.
   *
   * @type Function(node: HtmlElement) -> void
   */
  onExited: PropTypes$1.func // Name the function so it is clearer in the documentation

} ;

function noop() {}

Transition.defaultProps = {
  in: false,
  mountOnEnter: false,
  unmountOnExit: false,
  appear: false,
  enter: true,
  exit: true,
  onEnter: noop,
  onEntering: noop,
  onEntered: noop,
  onExit: noop,
  onExiting: noop,
  onExited: noop
};
Transition.UNMOUNTED = 0;
Transition.EXITED = 1;
Transition.ENTERING = 2;
Transition.ENTERED = 3;
Transition.EXITING = 4;

var _default = (0, reactLifecyclesCompat_es.polyfill)(Transition);

exports.default = _default;
});

unwrapExports(Transition_1);
var Transition_2 = Transition_1.EXITING;
var Transition_3 = Transition_1.ENTERED;
var Transition_4 = Transition_1.ENTERING;
var Transition_5 = Transition_1.EXITED;
var Transition_6 = Transition_1.UNMOUNTED;

var CSSTransition_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.default = void 0;

var PropTypes$1 = _interopRequireWildcard(propTypes);

var _addClass = _interopRequireDefault(addClass_1);

var _removeClass = _interopRequireDefault(removeClass);

var _react = _interopRequireDefault(React);

var _Transition = _interopRequireDefault(Transition_1);



function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var addClass = function addClass(node, classes) {
  return node && classes && classes.split(' ').forEach(function (c) {
    return (0, _addClass.default)(node, c);
  });
};

var removeClass$1 = function removeClass(node, classes) {
  return node && classes && classes.split(' ').forEach(function (c) {
    return (0, _removeClass.default)(node, c);
  });
};
/**
 * A transition component inspired by the excellent
 * [ng-animate](http://www.nganimate.org/) library, you should use it if you're
 * using CSS transitions or animations. It's built upon the
 * [`Transition`](https://reactcommunity.org/react-transition-group/transition)
 * component, so it inherits all of its props.
 *
 * `CSSTransition` applies a pair of class names during the `appear`, `enter`,
 * and `exit` states of the transition. The first class is applied and then a
 * second `*-active` class in order to activate the CSSS transition. After the
 * transition, matching `*-done` class names are applied to persist the
 * transition state.
 *
 * ```jsx
 * function App() {
 *   const [inProp, setInProp] = useState(false);
 *   return (
 *     <div>
 *       <CSSTransition in={inProp} timeout={200} classNames="my-node">
 *         <div>
 *           {"I'll receive my-node-* classes"}
 *         </div>
 *       </CSSTransition>
 *       <button type="button" onClick={() => setInProp(true)}>
 *         Click to Enter
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * When the `in` prop is set to `true`, the child component will first receive
 * the class `example-enter`, then the `example-enter-active` will be added in
 * the next tick. `CSSTransition` [forces a
 * reflow](https://github.com/reactjs/react-transition-group/blob/5007303e729a74be66a21c3e2205e4916821524b/src/CSSTransition.js#L208-L215)
 * between before adding the `example-enter-active`. This is an important trick
 * because it allows us to transition between `example-enter` and
 * `example-enter-active` even though they were added immediately one after
 * another. Most notably, this is what makes it possible for us to animate
 * _appearance_.
 *
 * ```css
 * .my-node-enter {
 *   opacity: 0;
 * }
 * .my-node-enter-active {
 *   opacity: 1;
 *   transition: opacity 200ms;
 * }
 * .my-node-exit {
 *   opacity: 1;
 * }
 * .my-node-exit-active {
 *   opacity: 0;
 *   transition: opacity: 200ms;
 * }
 * ```
 *
 * `*-active` classes represent which styles you want to animate **to**.
 */


var CSSTransition =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(CSSTransition, _React$Component);

  function CSSTransition() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _this.onEnter = function (node, appearing) {
      var _this$getClassNames = _this.getClassNames(appearing ? 'appear' : 'enter'),
          className = _this$getClassNames.className;

      _this.removeClasses(node, 'exit');

      addClass(node, className);

      if (_this.props.onEnter) {
        _this.props.onEnter(node, appearing);
      }
    };

    _this.onEntering = function (node, appearing) {
      var _this$getClassNames2 = _this.getClassNames(appearing ? 'appear' : 'enter'),
          activeClassName = _this$getClassNames2.activeClassName;

      _this.reflowAndAddClass(node, activeClassName);

      if (_this.props.onEntering) {
        _this.props.onEntering(node, appearing);
      }
    };

    _this.onEntered = function (node, appearing) {
      var appearClassName = _this.getClassNames('appear').doneClassName;

      var enterClassName = _this.getClassNames('enter').doneClassName;

      var doneClassName = appearing ? appearClassName + " " + enterClassName : enterClassName;

      _this.removeClasses(node, appearing ? 'appear' : 'enter');

      addClass(node, doneClassName);

      if (_this.props.onEntered) {
        _this.props.onEntered(node, appearing);
      }
    };

    _this.onExit = function (node) {
      var _this$getClassNames3 = _this.getClassNames('exit'),
          className = _this$getClassNames3.className;

      _this.removeClasses(node, 'appear');

      _this.removeClasses(node, 'enter');

      addClass(node, className);

      if (_this.props.onExit) {
        _this.props.onExit(node);
      }
    };

    _this.onExiting = function (node) {
      var _this$getClassNames4 = _this.getClassNames('exit'),
          activeClassName = _this$getClassNames4.activeClassName;

      _this.reflowAndAddClass(node, activeClassName);

      if (_this.props.onExiting) {
        _this.props.onExiting(node);
      }
    };

    _this.onExited = function (node) {
      var _this$getClassNames5 = _this.getClassNames('exit'),
          doneClassName = _this$getClassNames5.doneClassName;

      _this.removeClasses(node, 'exit');

      addClass(node, doneClassName);

      if (_this.props.onExited) {
        _this.props.onExited(node);
      }
    };

    _this.getClassNames = function (type) {
      var classNames = _this.props.classNames;
      var isStringClassNames = typeof classNames === 'string';
      var prefix = isStringClassNames && classNames ? classNames + '-' : '';
      var className = isStringClassNames ? prefix + type : classNames[type];
      var activeClassName = isStringClassNames ? className + '-active' : classNames[type + 'Active'];
      var doneClassName = isStringClassNames ? className + '-done' : classNames[type + 'Done'];
      return {
        className: className,
        activeClassName: activeClassName,
        doneClassName: doneClassName
      };
    };

    return _this;
  }

  var _proto = CSSTransition.prototype;

  _proto.removeClasses = function removeClasses(node, type) {
    var _this$getClassNames6 = this.getClassNames(type),
        className = _this$getClassNames6.className,
        activeClassName = _this$getClassNames6.activeClassName,
        doneClassName = _this$getClassNames6.doneClassName;

    className && removeClass$1(node, className);
    activeClassName && removeClass$1(node, activeClassName);
    doneClassName && removeClass$1(node, doneClassName);
  };

  _proto.reflowAndAddClass = function reflowAndAddClass(node, className) {
    // This is for to force a repaint,
    // which is necessary in order to transition styles when adding a class name.
    if (className) {
      /* eslint-disable no-unused-expressions */
      node && node.scrollTop;
      /* eslint-enable no-unused-expressions */

      addClass(node, className);
    }
  };

  _proto.render = function render() {
    var props = _extends({}, this.props);

    delete props.classNames;
    return _react.default.createElement(_Transition.default, _extends({}, props, {
      onEnter: this.onEnter,
      onEntered: this.onEntered,
      onEntering: this.onEntering,
      onExit: this.onExit,
      onExiting: this.onExiting,
      onExited: this.onExited
    }));
  };

  return CSSTransition;
}(_react.default.Component);

CSSTransition.defaultProps = {
  classNames: ''
};
CSSTransition.propTypes =  _extends({}, _Transition.default.propTypes, {
  /**
   * The animation classNames applied to the component as it enters, exits or
   * has finished the transition. A single name can be provided and it will be
   * suffixed for each stage: e.g.
   *
   * `classNames="fade"` applies `fade-enter`, `fade-enter-active`,
   * `fade-enter-done`, `fade-exit`, `fade-exit-active`, `fade-exit-done`,
   * `fade-appear`, `fade-appear-active`, and `fade-appear-done`.
   *
   * **Note**: `fade-appear-done` and `fade-enter-done` will _both_ be applied.
   * This allows you to define different behavior for when appearing is done and
   * when regular entering is done, using selectors like
   * `.fade-enter-done:not(.fade-appear-done)`. For example, you could apply an
   * epic entrance animation when element first appears in the DOM using
   * [Animate.css](https://daneden.github.io/animate.css/). Otherwise you can
   * simply use `fade-enter-done` for defining both cases.
   *
   * Each individual classNames can also be specified independently like:
   *
   * ```js
   * classNames={{
   *  appear: 'my-appear',
   *  appearActive: 'my-active-appear',
   *  appearDone: 'my-done-appear',
   *  enter: 'my-enter',
   *  enterActive: 'my-active-enter',
   *  enterDone: 'my-done-enter',
   *  exit: 'my-exit',
   *  exitActive: 'my-active-exit',
   *  exitDone: 'my-done-exit',
   * }}
   * ```
   *
   * If you want to set these classes using CSS Modules:
   *
   * ```js
   * import styles from './styles.css';
   * ```
   *
   * you might want to use camelCase in your CSS file, that way could simply
   * spread them instead of listing them one by one:
   *
   * ```js
   * classNames={{ ...styles }}
   * ```
   *
   * @type {string | {
   *  appear?: string,
   *  appearActive?: string,
   *  appearDone?: string,
   *  enter?: string,
   *  enterActive?: string,
   *  enterDone?: string,
   *  exit?: string,
   *  exitActive?: string,
   *  exitDone?: string,
   * }}
   */
  classNames: PropTypes.classNamesShape,

  /**
   * A `<Transition>` callback fired immediately after the 'enter' or 'appear' class is
   * applied.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEnter: PropTypes$1.func,

  /**
   * A `<Transition>` callback fired immediately after the 'enter-active' or
   * 'appear-active' class is applied.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntering: PropTypes$1.func,

  /**
   * A `<Transition>` callback fired immediately after the 'enter' or
   * 'appear' classes are **removed** and the `done` class is added to the DOM node.
   *
   * @type Function(node: HtmlElement, isAppearing: bool)
   */
  onEntered: PropTypes$1.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit' class is
   * applied.
   *
   * @type Function(node: HtmlElement)
   */
  onExit: PropTypes$1.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit-active' is applied.
   *
   * @type Function(node: HtmlElement)
   */
  onExiting: PropTypes$1.func,

  /**
   * A `<Transition>` callback fired immediately after the 'exit' classes
   * are **removed** and the `exit-done` class is added to the DOM node.
   *
   * @type Function(node: HtmlElement)
   */
  onExited: PropTypes$1.func
}) ;
var _default = CSSTransition;
exports.default = _default;
module.exports = exports["default"];
});

unwrapExports(CSSTransition_1);

var ChildMapping = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.getChildMapping = getChildMapping;
exports.mergeChildMappings = mergeChildMappings;
exports.getInitialChildMapping = getInitialChildMapping;
exports.getNextChildMapping = getNextChildMapping;



/**
 * Given `this.props.children`, return an object mapping key to child.
 *
 * @param {*} children `this.props.children`
 * @return {object} Mapping of key to child
 */
function getChildMapping(children, mapFn) {
  var mapper = function mapper(child) {
    return mapFn && (0, React.isValidElement)(child) ? mapFn(child) : child;
  };

  var result = Object.create(null);
  if (children) React.Children.map(children, function (c) {
    return c;
  }).forEach(function (child) {
    // run the map function here instead so that the key is the computed one
    result[child.key] = mapper(child);
  });
  return result;
}
/**
 * When you're adding or removing children some may be added or removed in the
 * same render pass. We want to show *both* since we want to simultaneously
 * animate elements in and out. This function takes a previous set of keys
 * and a new set of keys and merges them with its best guess of the correct
 * ordering. In the future we may expose some of the utilities in
 * ReactMultiChild to make this easy, but for now React itself does not
 * directly have this concept of the union of prevChildren and nextChildren
 * so we implement it here.
 *
 * @param {object} prev prev children as returned from
 * `ReactTransitionChildMapping.getChildMapping()`.
 * @param {object} next next children as returned from
 * `ReactTransitionChildMapping.getChildMapping()`.
 * @return {object} a key set that contains all keys in `prev` and all keys
 * in `next` in a reasonable order.
 */


function mergeChildMappings(prev, next) {
  prev = prev || {};
  next = next || {};

  function getValueForKey(key) {
    return key in next ? next[key] : prev[key];
  } // For each key of `next`, the list of keys to insert before that key in
  // the combined list


  var nextKeysPending = Object.create(null);
  var pendingKeys = [];

  for (var prevKey in prev) {
    if (prevKey in next) {
      if (pendingKeys.length) {
        nextKeysPending[prevKey] = pendingKeys;
        pendingKeys = [];
      }
    } else {
      pendingKeys.push(prevKey);
    }
  }

  var i;
  var childMapping = {};

  for (var nextKey in next) {
    if (nextKeysPending[nextKey]) {
      for (i = 0; i < nextKeysPending[nextKey].length; i++) {
        var pendingNextKey = nextKeysPending[nextKey][i];
        childMapping[nextKeysPending[nextKey][i]] = getValueForKey(pendingNextKey);
      }
    }

    childMapping[nextKey] = getValueForKey(nextKey);
  } // Finally, add the keys which didn't appear before any key in `next`


  for (i = 0; i < pendingKeys.length; i++) {
    childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i]);
  }

  return childMapping;
}

function getProp(child, prop, props) {
  return props[prop] != null ? props[prop] : child.props[prop];
}

function getInitialChildMapping(props, onExited) {
  return getChildMapping(props.children, function (child) {
    return (0, React.cloneElement)(child, {
      onExited: onExited.bind(null, child),
      in: true,
      appear: getProp(child, 'appear', props),
      enter: getProp(child, 'enter', props),
      exit: getProp(child, 'exit', props)
    });
  });
}

function getNextChildMapping(nextProps, prevChildMapping, onExited) {
  var nextChildMapping = getChildMapping(nextProps.children);
  var children = mergeChildMappings(prevChildMapping, nextChildMapping);
  Object.keys(children).forEach(function (key) {
    var child = children[key];
    if (!(0, React.isValidElement)(child)) return;
    var hasPrev = key in prevChildMapping;
    var hasNext = key in nextChildMapping;
    var prevChild = prevChildMapping[key];
    var isLeaving = (0, React.isValidElement)(prevChild) && !prevChild.props.in; // item is new (entering)

    if (hasNext && (!hasPrev || isLeaving)) {
      // console.log('entering', key)
      children[key] = (0, React.cloneElement)(child, {
        onExited: onExited.bind(null, child),
        in: true,
        exit: getProp(child, 'exit', nextProps),
        enter: getProp(child, 'enter', nextProps)
      });
    } else if (!hasNext && hasPrev && !isLeaving) {
      // item is old (exiting)
      // console.log('leaving', key)
      children[key] = (0, React.cloneElement)(child, {
        in: false
      });
    } else if (hasNext && hasPrev && (0, React.isValidElement)(prevChild)) {
      // item hasn't changed transition states
      // copy over the last transition props;
      // console.log('unchanged', key)
      children[key] = (0, React.cloneElement)(child, {
        onExited: onExited.bind(null, child),
        in: prevChild.props.in,
        exit: getProp(child, 'exit', nextProps),
        enter: getProp(child, 'enter', nextProps)
      });
    }
  });
  return children;
}
});

unwrapExports(ChildMapping);
var ChildMapping_1 = ChildMapping.getChildMapping;
var ChildMapping_2 = ChildMapping.mergeChildMappings;
var ChildMapping_3 = ChildMapping.getInitialChildMapping;
var ChildMapping_4 = ChildMapping.getNextChildMapping;

var TransitionGroup_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.default = void 0;

var _propTypes = _interopRequireDefault(propTypes);

var _react = _interopRequireDefault(React);





function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

var values = Object.values || function (obj) {
  return Object.keys(obj).map(function (k) {
    return obj[k];
  });
};

var defaultProps = {
  component: 'div',
  childFactory: function childFactory(child) {
    return child;
  }
  /**
   * The `<TransitionGroup>` component manages a set of transition components
   * (`<Transition>` and `<CSSTransition>`) in a list. Like with the transition
   * components, `<TransitionGroup>` is a state machine for managing the mounting
   * and unmounting of components over time.
   *
   * Consider the example below. As items are removed or added to the TodoList the
   * `in` prop is toggled automatically by the `<TransitionGroup>`.
   *
   * Note that `<TransitionGroup>`  does not define any animation behavior!
   * Exactly _how_ a list item animates is up to the individual transition
   * component. This means you can mix and match animations across different list
   * items.
   */

};

var TransitionGroup =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(TransitionGroup, _React$Component);

  function TransitionGroup(props, context) {
    var _this;

    _this = _React$Component.call(this, props, context) || this;

    var handleExited = _this.handleExited.bind(_assertThisInitialized(_assertThisInitialized(_this))); // Initial children should all be entering, dependent on appear


    _this.state = {
      handleExited: handleExited,
      firstRender: true
    };
    return _this;
  }

  var _proto = TransitionGroup.prototype;

  _proto.getChildContext = function getChildContext() {
    return {
      transitionGroup: {
        isMounting: !this.appeared
      }
    };
  };

  _proto.componentDidMount = function componentDidMount() {
    this.appeared = true;
    this.mounted = true;
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this.mounted = false;
  };

  TransitionGroup.getDerivedStateFromProps = function getDerivedStateFromProps(nextProps, _ref) {
    var prevChildMapping = _ref.children,
        handleExited = _ref.handleExited,
        firstRender = _ref.firstRender;
    return {
      children: firstRender ? (0, ChildMapping.getInitialChildMapping)(nextProps, handleExited) : (0, ChildMapping.getNextChildMapping)(nextProps, prevChildMapping, handleExited),
      firstRender: false
    };
  };

  _proto.handleExited = function handleExited(child, node) {
    var currentChildMapping = (0, ChildMapping.getChildMapping)(this.props.children);
    if (child.key in currentChildMapping) return;

    if (child.props.onExited) {
      child.props.onExited(node);
    }

    if (this.mounted) {
      this.setState(function (state) {
        var children = _extends({}, state.children);

        delete children[child.key];
        return {
          children: children
        };
      });
    }
  };

  _proto.render = function render() {
    var _this$props = this.props,
        Component = _this$props.component,
        childFactory = _this$props.childFactory,
        props = _objectWithoutPropertiesLoose(_this$props, ["component", "childFactory"]);

    var children = values(this.state.children).map(childFactory);
    delete props.appear;
    delete props.enter;
    delete props.exit;

    if (Component === null) {
      return children;
    }

    return _react.default.createElement(Component, props, children);
  };

  return TransitionGroup;
}(_react.default.Component);

TransitionGroup.childContextTypes = {
  transitionGroup: _propTypes.default.object.isRequired
};
TransitionGroup.propTypes =  {
  /**
   * `<TransitionGroup>` renders a `<div>` by default. You can change this
   * behavior by providing a `component` prop.
   * If you use React v16+ and would like to avoid a wrapping `<div>` element
   * you can pass in `component={null}`. This is useful if the wrapping div
   * borks your css styles.
   */
  component: _propTypes.default.any,

  /**
   * A set of `<Transition>` components, that are toggled `in` and out as they
   * leave. the `<TransitionGroup>` will inject specific transition props, so
   * remember to spread them through if you are wrapping the `<Transition>` as
   * with our `<Fade>` example.
   *
   * While this component is meant for multiple `Transition` or `CSSTransition`
   * children, sometimes you may want to have a single transition child with
   * content that you want to be transitioned out and in when you change it
   * (e.g. routes, images etc.) In that case you can change the `key` prop of
   * the transition child as you change its content, this will cause
   * `TransitionGroup` to transition the child out and back in.
   */
  children: _propTypes.default.node,

  /**
   * A convenience prop that enables or disables appear animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  appear: _propTypes.default.bool,

  /**
   * A convenience prop that enables or disables enter animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  enter: _propTypes.default.bool,

  /**
   * A convenience prop that enables or disables exit animations
   * for all children. Note that specifying this will override any defaults set
   * on individual children Transitions.
   */
  exit: _propTypes.default.bool,

  /**
   * You may need to apply reactive updates to a child as it is exiting.
   * This is generally done by using `cloneElement` however in the case of an exiting
   * child the element has already been removed and not accessible to the consumer.
   *
   * If you do need to update a child as it leaves you can provide a `childFactory`
   * to wrap every child, even the ones that are leaving.
   *
   * @type Function(child: ReactElement) -> ReactElement
   */
  childFactory: _propTypes.default.func
} ;
TransitionGroup.defaultProps = defaultProps;

var _default = (0, reactLifecyclesCompat_es.polyfill)(TransitionGroup);

exports.default = _default;
module.exports = exports["default"];
});

unwrapExports(TransitionGroup_1);

var ReplaceTransition_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.default = void 0;

var _propTypes = _interopRequireDefault(propTypes);

var _react = _interopRequireDefault(React);



var _TransitionGroup = _interopRequireDefault(TransitionGroup_1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

/**
 * The `<ReplaceTransition>` component is a specialized `Transition` component
 * that animates between two children.
 *
 * ```jsx
 * <ReplaceTransition in>
 *   <Fade><div>I appear first</div></Fade>
 *   <Fade><div>I replace the above</div></Fade>
 * </ReplaceTransition>
 * ```
 */
var ReplaceTransition =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(ReplaceTransition, _React$Component);

  function ReplaceTransition() {
    var _this;

    for (var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++) {
      _args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(_args)) || this;

    _this.handleEnter = function () {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _this.handleLifecycle('onEnter', 0, args);
    };

    _this.handleEntering = function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return _this.handleLifecycle('onEntering', 0, args);
    };

    _this.handleEntered = function () {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return _this.handleLifecycle('onEntered', 0, args);
    };

    _this.handleExit = function () {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }

      return _this.handleLifecycle('onExit', 1, args);
    };

    _this.handleExiting = function () {
      for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        args[_key6] = arguments[_key6];
      }

      return _this.handleLifecycle('onExiting', 1, args);
    };

    _this.handleExited = function () {
      for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }

      return _this.handleLifecycle('onExited', 1, args);
    };

    return _this;
  }

  var _proto = ReplaceTransition.prototype;

  _proto.handleLifecycle = function handleLifecycle(handler, idx, originalArgs) {
    var _child$props;

    var children = this.props.children;

    var child = _react.default.Children.toArray(children)[idx];

    if (child.props[handler]) (_child$props = child.props)[handler].apply(_child$props, originalArgs);
    if (this.props[handler]) this.props[handler]((0, ReactDOM.findDOMNode)(this));
  };

  _proto.render = function render() {
    var _this$props = this.props,
        children = _this$props.children,
        inProp = _this$props.in,
        props = _objectWithoutPropertiesLoose(_this$props, ["children", "in"]);

    var _React$Children$toArr = _react.default.Children.toArray(children),
        first = _React$Children$toArr[0],
        second = _React$Children$toArr[1];

    delete props.onEnter;
    delete props.onEntering;
    delete props.onEntered;
    delete props.onExit;
    delete props.onExiting;
    delete props.onExited;
    return _react.default.createElement(_TransitionGroup.default, props, inProp ? _react.default.cloneElement(first, {
      key: 'first',
      onEnter: this.handleEnter,
      onEntering: this.handleEntering,
      onEntered: this.handleEntered
    }) : _react.default.cloneElement(second, {
      key: 'second',
      onEnter: this.handleExit,
      onEntering: this.handleExiting,
      onEntered: this.handleExited
    }));
  };

  return ReplaceTransition;
}(_react.default.Component);

ReplaceTransition.propTypes =  {
  in: _propTypes.default.bool.isRequired,
  children: function children(props, propName) {
    if (_react.default.Children.count(props[propName]) !== 2) return new Error("\"" + propName + "\" must be exactly two transition components.");
    return null;
  }
} ;
var _default = ReplaceTransition;
exports.default = _default;
module.exports = exports["default"];
});

unwrapExports(ReplaceTransition_1);

var reactTransitionGroup = createCommonjsModule(function (module) {

var _CSSTransition = _interopRequireDefault(CSSTransition_1);

var _ReplaceTransition = _interopRequireDefault(ReplaceTransition_1);

var _TransitionGroup = _interopRequireDefault(TransitionGroup_1);

var _Transition = _interopRequireDefault(Transition_1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  Transition: _Transition.default,
  TransitionGroup: _TransitionGroup.default,
  ReplaceTransition: _ReplaceTransition.default,
  CSSTransition: _CSSTransition.default
};
});

unwrapExports(reactTransitionGroup);
var reactTransitionGroup_1 = reactTransitionGroup.Transition;
var reactTransitionGroup_2 = reactTransitionGroup.TransitionGroup;
var reactTransitionGroup_3 = reactTransitionGroup.ReplaceTransition;
var reactTransitionGroup_4 = reactTransitionGroup.CSSTransition;

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** Detect if `React.createPortal()` API method does not exist. */
var cannotCreatePortal = !isFunction(createPortal);
var REACT_CONTEXT_TYPES = {
    blueprintPortalClassName: function (obj, key) {
        if (obj[key] != null && typeof obj[key] !== "string") {
            return new Error(PORTAL_CONTEXT_CLASS_NAME_STRING);
        }
        return undefined;
    },
};
/**
 * This component detaches its contents and re-attaches them to document.body.
 * Use it when you need to circumvent DOM z-stacking (for dialogs, popovers, etc.).
 * Any class names passed to this element will be propagated to the new container element on document.body.
 */
var Portal = /** @class */ (function (_super) {
    __extends(Portal, _super);
    function Portal() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { hasMounted: false };
        return _this;
    }
    Portal.prototype.render = function () {
        // Only render `children` once this component has mounted in a browser environment, so they are
        // immediately attached to the DOM tree and can do DOM things like measuring or `autoFocus`.
        // See long comment on componentDidMount in https://reactjs.org/docs/portals.html#event-bubbling-through-portals
        if (cannotCreatePortal || typeof document === "undefined" || !this.state.hasMounted) {
            return null;
        }
        else {
            return createPortal(this.props.children, this.portalElement);
        }
    };
    Portal.prototype.componentDidMount = function () {
        if (!this.props.container) {
            return;
        }
        this.portalElement = this.createContainerElement();
        this.props.container.appendChild(this.portalElement);
        this.setState({ hasMounted: true }, this.props.onChildrenMount);
        if (cannotCreatePortal) {
            this.unstableRenderNoPortal();
        }
    };
    Portal.prototype.componentDidUpdate = function (prevProps) {
        // update className prop on portal DOM element
        if (this.portalElement != null && prevProps.className !== this.props.className) {
            this.portalElement.classList.remove(prevProps.className);
            maybeAddClass(this.portalElement.classList, this.props.className);
        }
        if (cannotCreatePortal) {
            this.unstableRenderNoPortal();
        }
    };
    Portal.prototype.componentWillUnmount = function () {
        if (this.portalElement != null) {
            if (cannotCreatePortal) {
                unmountComponentAtNode(this.portalElement);
            }
            this.portalElement.remove();
        }
    };
    Portal.prototype.createContainerElement = function () {
        var container = document.createElement("div");
        container.classList.add(PORTAL);
        maybeAddClass(container.classList, this.props.className);
        if (this.context != null) {
            maybeAddClass(container.classList, this.context.blueprintPortalClassName);
        }
        return container;
    };
    Portal.prototype.unstableRenderNoPortal = function () {
        unstable_renderSubtreeIntoContainer(
        /* parentComponent */ this, createElement("div", null, this.props.children), this.portalElement);
    };
    Portal.displayName = DISPLAYNAME_PREFIX + ".Portal";
    Portal.contextTypes = REACT_CONTEXT_TYPES;
    Portal.defaultProps = {
        container: typeof document !== "undefined" ? document.body : null,
    };
    return Portal;
}(Component));
function maybeAddClass(classList, className) {
    if (className != null && className !== "") {
        classList.add.apply(classList, className.split(" "));
    }
}

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Overlay = /** @class */ (function (_super) {
    __extends(Overlay, _super);
    function Overlay(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.refHandlers = {
            container: function (ref) { return (_this.containerElement = findDOMNode(ref)); },
        };
        _this.maybeRenderChild = function (child) {
            if (child == null) {
                return null;
            }
            // add a special class to each child element that will automatically set the appropriate
            // CSS position mode under the hood. also, make the container focusable so we can
            // trap focus inside it (via `enforceFocus`).
            var decoratedChild = typeof child === "object" ? (cloneElement(child, {
                className: cx(child.props.className, OVERLAY_CONTENT),
                tabIndex: 0,
            })) : (createElement("span", { className: OVERLAY_CONTENT }, child));
            var _a = _this.props, onOpening = _a.onOpening, onOpened = _a.onOpened, onClosing = _a.onClosing, onClosed = _a.onClosed, transitionDuration = _a.transitionDuration, transitionName = _a.transitionName;
            return (createElement(reactTransitionGroup_4, { classNames: transitionName, onEntering: onOpening, onEntered: onOpened, onExiting: onClosing, onExited: onClosed, timeout: transitionDuration }, decoratedChild));
        };
        _this.handleBackdropMouseDown = function (e) {
            var _a = _this.props, backdropProps = _a.backdropProps, canOutsideClickClose = _a.canOutsideClickClose, enforceFocus = _a.enforceFocus, onClose = _a.onClose;
            if (canOutsideClickClose) {
                safeInvoke(onClose, e);
            }
            if (enforceFocus) {
                // make sure document.activeElement is updated before bringing the focus back
                _this.bringFocusInsideOverlay();
            }
            safeInvoke(backdropProps.onMouseDown, e);
        };
        _this.handleDocumentClick = function (e) {
            var _a = _this.props, canOutsideClickClose = _a.canOutsideClickClose, isOpen = _a.isOpen, onClose = _a.onClose;
            var eventTarget = e.target;
            var stackIndex = Overlay_1.openStack.indexOf(_this);
            var isClickInThisOverlayOrDescendant = Overlay_1.openStack
                .slice(stackIndex)
                .some(function (_a) {
                var elem = _a.containerElement;
                // `elem` is the container of backdrop & content, so clicking on that container
                // should not count as being "inside" the overlay.
                return elem && elem.contains(eventTarget) && !elem.isSameNode(eventTarget);
            });
            if (isOpen && canOutsideClickClose && !isClickInThisOverlayOrDescendant) {
                // casting to any because this is a native event
                safeInvoke(onClose, e);
            }
        };
        _this.handleDocumentFocus = function (e) {
            if (_this.props.enforceFocus &&
                _this.containerElement != null &&
                !_this.containerElement.contains(e.target)) {
                // prevent default focus behavior (sometimes auto-scrolls the page)
                e.preventDefault();
                e.stopImmediatePropagation();
                _this.bringFocusInsideOverlay();
            }
        };
        _this.handleKeyDown = function (e) {
            var _a = _this.props, canEscapeKeyClose = _a.canEscapeKeyClose, onClose = _a.onClose;
            if (e.which === ESCAPE && canEscapeKeyClose) {
                safeInvoke(onClose, e);
                // prevent browser-specific escape key behavior (Safari exits fullscreen)
                e.preventDefault();
            }
        };
        _this.state = { hasEverOpened: props.isOpen };
        return _this;
    }
    Overlay_1 = Overlay;
    Overlay.getDerivedStateFromProps = function (_a) {
        var hasEverOpened = _a.isOpen;
        if (hasEverOpened) {
            return { hasEverOpened: hasEverOpened };
        }
        return null;
    };
    Overlay.prototype.render = function () {
        var _a;
        // oh snap! no reason to render anything at all if we're being truly lazy
        if (this.props.lazy && !this.state.hasEverOpened) {
            return null;
        }
        var _b = this.props, children = _b.children, className = _b.className, usePortal = _b.usePortal, isOpen = _b.isOpen;
        // TransitionGroup types require single array of children; does not support nested arrays.
        // So we must collapse backdrop and children into one array, and every item must be wrapped in a
        // Transition element (no ReactText allowed).
        var childrenWithTransitions = isOpen ? Children.map(children, this.maybeRenderChild) : [];
        childrenWithTransitions.unshift(this.maybeRenderBackdrop());
        var containerClasses = cx(OVERLAY, (_a = {},
            _a[OVERLAY_OPEN] = isOpen,
            _a[OVERLAY_INLINE] = !usePortal,
            _a), className);
        var transitionGroup = (createElement(reactTransitionGroup_2, { appear: true, className: containerClasses, component: "div", onKeyDown: this.handleKeyDown, ref: this.refHandlers.container }, childrenWithTransitions));
        if (usePortal) {
            return (createElement(Portal, { className: this.props.portalClassName, container: this.props.portalContainer }, transitionGroup));
        }
        else {
            return transitionGroup;
        }
    };
    Overlay.prototype.componentDidMount = function () {
        if (this.props.isOpen) {
            this.overlayWillOpen();
        }
    };
    Overlay.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.isOpen && !this.props.isOpen) {
            this.overlayWillClose();
        }
        else if (!prevProps.isOpen && this.props.isOpen) {
            this.overlayWillOpen();
        }
    };
    Overlay.prototype.componentWillUnmount = function () {
        this.overlayWillClose();
    };
    /**
     * @public for testing
     * @internal
     */
    Overlay.prototype.bringFocusInsideOverlay = function () {
        var _this = this;
        // always delay focus manipulation to just before repaint to prevent scroll jumping
        return requestAnimationFrame(function () {
            // container ref may be undefined between component mounting and Portal rendering
            // activeElement may be undefined in some rare cases in IE
            if (_this.containerElement == null || document.activeElement == null || !_this.props.isOpen) {
                return;
            }
            var isFocusOutsideModal = !_this.containerElement.contains(document.activeElement);
            if (isFocusOutsideModal) {
                // element marked autofocus has higher priority than the other clowns
                var autofocusElement = _this.containerElement.querySelector("[autofocus]");
                var wrapperElement = _this.containerElement.querySelector("[tabindex]");
                if (autofocusElement != null) {
                    autofocusElement.focus();
                }
                else if (wrapperElement != null) {
                    wrapperElement.focus();
                }
            }
        });
    };
    Overlay.prototype.maybeRenderBackdrop = function () {
        var _a = this.props, backdropClassName = _a.backdropClassName, backdropProps = _a.backdropProps, hasBackdrop = _a.hasBackdrop, isOpen = _a.isOpen, transitionDuration = _a.transitionDuration, transitionName = _a.transitionName;
        if (hasBackdrop && isOpen) {
            return (createElement(reactTransitionGroup_4, { classNames: transitionName, key: "__backdrop", timeout: transitionDuration },
                createElement("div", __assign({}, backdropProps, { className: cx(OVERLAY_BACKDROP, backdropClassName, backdropProps.className), onMouseDown: this.handleBackdropMouseDown, tabIndex: this.props.canOutsideClickClose ? 0 : null }))));
        }
        else {
            return null;
        }
    };
    Overlay.prototype.overlayWillClose = function () {
        document.removeEventListener("focus", this.handleDocumentFocus, /* useCapture */ true);
        document.removeEventListener("mousedown", this.handleDocumentClick);
        var openStack = Overlay_1.openStack;
        var stackIndex = openStack.indexOf(this);
        if (stackIndex !== -1) {
            openStack.splice(stackIndex, 1);
            if (openStack.length > 0) {
                var lastOpenedOverlay = Overlay_1.getLastOpened();
                if (lastOpenedOverlay.props.enforceFocus) {
                    document.addEventListener("focus", lastOpenedOverlay.handleDocumentFocus, /* useCapture */ true);
                }
            }
            if (openStack.filter(function (o) { return o.props.usePortal && o.props.hasBackdrop; }).length === 0) {
                document.body.classList.remove(OVERLAY_OPEN);
            }
        }
    };
    Overlay.prototype.overlayWillOpen = function () {
        var openStack = Overlay_1.openStack;
        if (openStack.length > 0) {
            document.removeEventListener("focus", Overlay_1.getLastOpened().handleDocumentFocus, /* useCapture */ true);
        }
        openStack.push(this);
        if (this.props.autoFocus) {
            this.bringFocusInsideOverlay();
        }
        if (this.props.enforceFocus) {
            document.addEventListener("focus", this.handleDocumentFocus, /* useCapture */ true);
        }
        if (this.props.canOutsideClickClose && !this.props.hasBackdrop) {
            document.addEventListener("mousedown", this.handleDocumentClick);
        }
        if (this.props.hasBackdrop && this.props.usePortal) {
            // add a class to the body to prevent scrolling of content below the overlay
            document.body.classList.add(OVERLAY_OPEN);
        }
    };
    var Overlay_1;
    Overlay.displayName = DISPLAYNAME_PREFIX + ".Overlay";
    Overlay.defaultProps = {
        autoFocus: true,
        backdropProps: {},
        canEscapeKeyClose: true,
        canOutsideClickClose: true,
        enforceFocus: true,
        hasBackdrop: true,
        isOpen: false,
        lazy: true,
        transitionDuration: 300,
        transitionName: OVERLAY,
        usePortal: true,
    };
    Overlay.openStack = [];
    Overlay.getLastOpened = function () { return Overlay_1.openStack[Overlay_1.openStack.length - 1]; };
    Overlay = Overlay_1 = __decorate([
        polyfill
    ], Overlay);
    return Overlay;
}(AbstractPureComponent2));

/**
 * A collection of shims that provide minimal functionality of the ES6 collections.
 *
 * These implementations are not meant to be used outside of the ResizeObserver
 * modules as they cover only a limited range of use cases.
 */
/* eslint-disable require-jsdoc, valid-jsdoc */
var MapShim = (function () {
    if (typeof Map !== 'undefined') {
        return Map;
    }
    /**
     * Returns index in provided array that matches the specified key.
     *
     * @param {Array<Array>} arr
     * @param {*} key
     * @returns {number}
     */
    function getIndex(arr, key) {
        var result = -1;
        arr.some(function (entry, index) {
            if (entry[0] === key) {
                result = index;
                return true;
            }
            return false;
        });
        return result;
    }
    return /** @class */ (function () {
        function class_1() {
            this.__entries__ = [];
        }
        Object.defineProperty(class_1.prototype, "size", {
            /**
             * @returns {boolean}
             */
            get: function () {
                return this.__entries__.length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @param {*} key
         * @returns {*}
         */
        class_1.prototype.get = function (key) {
            var index = getIndex(this.__entries__, key);
            var entry = this.__entries__[index];
            return entry && entry[1];
        };
        /**
         * @param {*} key
         * @param {*} value
         * @returns {void}
         */
        class_1.prototype.set = function (key, value) {
            var index = getIndex(this.__entries__, key);
            if (~index) {
                this.__entries__[index][1] = value;
            }
            else {
                this.__entries__.push([key, value]);
            }
        };
        /**
         * @param {*} key
         * @returns {void}
         */
        class_1.prototype.delete = function (key) {
            var entries = this.__entries__;
            var index = getIndex(entries, key);
            if (~index) {
                entries.splice(index, 1);
            }
        };
        /**
         * @param {*} key
         * @returns {void}
         */
        class_1.prototype.has = function (key) {
            return !!~getIndex(this.__entries__, key);
        };
        /**
         * @returns {void}
         */
        class_1.prototype.clear = function () {
            this.__entries__.splice(0);
        };
        /**
         * @param {Function} callback
         * @param {*} [ctx=null]
         * @returns {void}
         */
        class_1.prototype.forEach = function (callback, ctx) {
            if (ctx === void 0) { ctx = null; }
            for (var _i = 0, _a = this.__entries__; _i < _a.length; _i++) {
                var entry = _a[_i];
                callback.call(ctx, entry[1], entry[0]);
            }
        };
        return class_1;
    }());
})();

/**
 * Detects whether window and document objects are available in current environment.
 */
var isBrowser$1 = typeof window !== 'undefined' && typeof document !== 'undefined' && window.document === document;

// Returns global object of a current environment.
var global$1 = (function () {
    if (typeof global !== 'undefined' && global.Math === Math) {
        return global;
    }
    if (typeof self !== 'undefined' && self.Math === Math) {
        return self;
    }
    if (typeof window !== 'undefined' && window.Math === Math) {
        return window;
    }
    // eslint-disable-next-line no-new-func
    return Function('return this')();
})();

/**
 * A shim for the requestAnimationFrame which falls back to the setTimeout if
 * first one is not supported.
 *
 * @returns {number} Requests' identifier.
 */
var requestAnimationFrame$1 = (function () {
    if (typeof requestAnimationFrame === 'function') {
        // It's required to use a bounded function because IE sometimes throws
        // an "Invalid calling object" error if rAF is invoked without the global
        // object on the left hand side.
        return requestAnimationFrame.bind(global$1);
    }
    return function (callback) { return setTimeout(function () { return callback(Date.now()); }, 1000 / 60); };
})();

// Defines minimum timeout before adding a trailing call.
var trailingTimeout = 2;
/**
 * Creates a wrapper function which ensures that provided callback will be
 * invoked only once during the specified delay period.
 *
 * @param {Function} callback - Function to be invoked after the delay period.
 * @param {number} delay - Delay after which to invoke callback.
 * @returns {Function}
 */
function throttle$1 (callback, delay) {
    var leadingCall = false, trailingCall = false, lastCallTime = 0;
    /**
     * Invokes the original callback function and schedules new invocation if
     * the "proxy" was called during current request.
     *
     * @returns {void}
     */
    function resolvePending() {
        if (leadingCall) {
            leadingCall = false;
            callback();
        }
        if (trailingCall) {
            proxy();
        }
    }
    /**
     * Callback invoked after the specified delay. It will further postpone
     * invocation of the original function delegating it to the
     * requestAnimationFrame.
     *
     * @returns {void}
     */
    function timeoutCallback() {
        requestAnimationFrame$1(resolvePending);
    }
    /**
     * Schedules invocation of the original function.
     *
     * @returns {void}
     */
    function proxy() {
        var timeStamp = Date.now();
        if (leadingCall) {
            // Reject immediately following calls.
            if (timeStamp - lastCallTime < trailingTimeout) {
                return;
            }
            // Schedule new call to be in invoked when the pending one is resolved.
            // This is important for "transitions" which never actually start
            // immediately so there is a chance that we might miss one if change
            // happens amids the pending invocation.
            trailingCall = true;
        }
        else {
            leadingCall = true;
            trailingCall = false;
            setTimeout(timeoutCallback, delay);
        }
        lastCallTime = timeStamp;
    }
    return proxy;
}

// Minimum delay before invoking the update of observers.
var REFRESH_DELAY = 20;
// A list of substrings of CSS properties used to find transition events that
// might affect dimensions of observed elements.
var transitionKeys = ['top', 'right', 'bottom', 'left', 'width', 'height', 'size', 'weight'];
// Check if MutationObserver is available.
var mutationObserverSupported = typeof MutationObserver !== 'undefined';
/**
 * Singleton controller class which handles updates of ResizeObserver instances.
 */
var ResizeObserverController = /** @class */ (function () {
    /**
     * Creates a new instance of ResizeObserverController.
     *
     * @private
     */
    function ResizeObserverController() {
        /**
         * Indicates whether DOM listeners have been added.
         *
         * @private {boolean}
         */
        this.connected_ = false;
        /**
         * Tells that controller has subscribed for Mutation Events.
         *
         * @private {boolean}
         */
        this.mutationEventsAdded_ = false;
        /**
         * Keeps reference to the instance of MutationObserver.
         *
         * @private {MutationObserver}
         */
        this.mutationsObserver_ = null;
        /**
         * A list of connected observers.
         *
         * @private {Array<ResizeObserverSPI>}
         */
        this.observers_ = [];
        this.onTransitionEnd_ = this.onTransitionEnd_.bind(this);
        this.refresh = throttle$1(this.refresh.bind(this), REFRESH_DELAY);
    }
    /**
     * Adds observer to observers list.
     *
     * @param {ResizeObserverSPI} observer - Observer to be added.
     * @returns {void}
     */
    ResizeObserverController.prototype.addObserver = function (observer) {
        if (!~this.observers_.indexOf(observer)) {
            this.observers_.push(observer);
        }
        // Add listeners if they haven't been added yet.
        if (!this.connected_) {
            this.connect_();
        }
    };
    /**
     * Removes observer from observers list.
     *
     * @param {ResizeObserverSPI} observer - Observer to be removed.
     * @returns {void}
     */
    ResizeObserverController.prototype.removeObserver = function (observer) {
        var observers = this.observers_;
        var index = observers.indexOf(observer);
        // Remove observer if it's present in registry.
        if (~index) {
            observers.splice(index, 1);
        }
        // Remove listeners if controller has no connected observers.
        if (!observers.length && this.connected_) {
            this.disconnect_();
        }
    };
    /**
     * Invokes the update of observers. It will continue running updates insofar
     * it detects changes.
     *
     * @returns {void}
     */
    ResizeObserverController.prototype.refresh = function () {
        var changesDetected = this.updateObservers_();
        // Continue running updates if changes have been detected as there might
        // be future ones caused by CSS transitions.
        if (changesDetected) {
            this.refresh();
        }
    };
    /**
     * Updates every observer from observers list and notifies them of queued
     * entries.
     *
     * @private
     * @returns {boolean} Returns "true" if any observer has detected changes in
     *      dimensions of it's elements.
     */
    ResizeObserverController.prototype.updateObservers_ = function () {
        // Collect observers that have active observations.
        var activeObservers = this.observers_.filter(function (observer) {
            return observer.gatherActive(), observer.hasActive();
        });
        // Deliver notifications in a separate cycle in order to avoid any
        // collisions between observers, e.g. when multiple instances of
        // ResizeObserver are tracking the same element and the callback of one
        // of them changes content dimensions of the observed target. Sometimes
        // this may result in notifications being blocked for the rest of observers.
        activeObservers.forEach(function (observer) { return observer.broadcastActive(); });
        return activeObservers.length > 0;
    };
    /**
     * Initializes DOM listeners.
     *
     * @private
     * @returns {void}
     */
    ResizeObserverController.prototype.connect_ = function () {
        // Do nothing if running in a non-browser environment or if listeners
        // have been already added.
        if (!isBrowser$1 || this.connected_) {
            return;
        }
        // Subscription to the "Transitionend" event is used as a workaround for
        // delayed transitions. This way it's possible to capture at least the
        // final state of an element.
        document.addEventListener('transitionend', this.onTransitionEnd_);
        window.addEventListener('resize', this.refresh);
        if (mutationObserverSupported) {
            this.mutationsObserver_ = new MutationObserver(this.refresh);
            this.mutationsObserver_.observe(document, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
        }
        else {
            document.addEventListener('DOMSubtreeModified', this.refresh);
            this.mutationEventsAdded_ = true;
        }
        this.connected_ = true;
    };
    /**
     * Removes DOM listeners.
     *
     * @private
     * @returns {void}
     */
    ResizeObserverController.prototype.disconnect_ = function () {
        // Do nothing if running in a non-browser environment or if listeners
        // have been already removed.
        if (!isBrowser$1 || !this.connected_) {
            return;
        }
        document.removeEventListener('transitionend', this.onTransitionEnd_);
        window.removeEventListener('resize', this.refresh);
        if (this.mutationsObserver_) {
            this.mutationsObserver_.disconnect();
        }
        if (this.mutationEventsAdded_) {
            document.removeEventListener('DOMSubtreeModified', this.refresh);
        }
        this.mutationsObserver_ = null;
        this.mutationEventsAdded_ = false;
        this.connected_ = false;
    };
    /**
     * "Transitionend" event handler.
     *
     * @private
     * @param {TransitionEvent} event
     * @returns {void}
     */
    ResizeObserverController.prototype.onTransitionEnd_ = function (_a) {
        var _b = _a.propertyName, propertyName = _b === void 0 ? '' : _b;
        // Detect whether transition may affect dimensions of an element.
        var isReflowProperty = transitionKeys.some(function (key) {
            return !!~propertyName.indexOf(key);
        });
        if (isReflowProperty) {
            this.refresh();
        }
    };
    /**
     * Returns instance of the ResizeObserverController.
     *
     * @returns {ResizeObserverController}
     */
    ResizeObserverController.getInstance = function () {
        if (!this.instance_) {
            this.instance_ = new ResizeObserverController();
        }
        return this.instance_;
    };
    /**
     * Holds reference to the controller's instance.
     *
     * @private {ResizeObserverController}
     */
    ResizeObserverController.instance_ = null;
    return ResizeObserverController;
}());

/**
 * Defines non-writable/enumerable properties of the provided target object.
 *
 * @param {Object} target - Object for which to define properties.
 * @param {Object} props - Properties to be defined.
 * @returns {Object} Target object.
 */
var defineConfigurable = (function (target, props) {
    for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
        var key = _a[_i];
        Object.defineProperty(target, key, {
            value: props[key],
            enumerable: false,
            writable: false,
            configurable: true
        });
    }
    return target;
});

/**
 * Returns the global object associated with provided element.
 *
 * @param {Object} target
 * @returns {Object}
 */
var getWindowOf = (function (target) {
    // Assume that the element is an instance of Node, which means that it
    // has the "ownerDocument" property from which we can retrieve a
    // corresponding global object.
    var ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;
    // Return the local global object if it's not possible extract one from
    // provided element.
    return ownerGlobal || global$1;
});

// Placeholder of an empty content rectangle.
var emptyRect = createRectInit(0, 0, 0, 0);
/**
 * Converts provided string to a number.
 *
 * @param {number|string} value
 * @returns {number}
 */
function toFloat(value) {
    return parseFloat(value) || 0;
}
/**
 * Extracts borders size from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @param {...string} positions - Borders positions (top, right, ...)
 * @returns {number}
 */
function getBordersSize$1(styles) {
    var positions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        positions[_i - 1] = arguments[_i];
    }
    return positions.reduce(function (size, position) {
        var value = styles['border-' + position + '-width'];
        return size + toFloat(value);
    }, 0);
}
/**
 * Extracts paddings sizes from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @returns {Object} Paddings box.
 */
function getPaddings(styles) {
    var positions = ['top', 'right', 'bottom', 'left'];
    var paddings = {};
    for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
        var position = positions_1[_i];
        var value = styles['padding-' + position];
        paddings[position] = toFloat(value);
    }
    return paddings;
}
/**
 * Calculates content rectangle of provided SVG element.
 *
 * @param {SVGGraphicsElement} target - Element content rectangle of which needs
 *      to be calculated.
 * @returns {DOMRectInit}
 */
function getSVGContentRect(target) {
    var bbox = target.getBBox();
    return createRectInit(0, 0, bbox.width, bbox.height);
}
/**
 * Calculates content rectangle of provided HTMLElement.
 *
 * @param {HTMLElement} target - Element for which to calculate the content rectangle.
 * @returns {DOMRectInit}
 */
function getHTMLElementContentRect(target) {
    // Client width & height properties can't be
    // used exclusively as they provide rounded values.
    var clientWidth = target.clientWidth, clientHeight = target.clientHeight;
    // By this condition we can catch all non-replaced inline, hidden and
    // detached elements. Though elements with width & height properties less
    // than 0.5 will be discarded as well.
    //
    // Without it we would need to implement separate methods for each of
    // those cases and it's not possible to perform a precise and performance
    // effective test for hidden elements. E.g. even jQuery's ':visible' filter
    // gives wrong results for elements with width & height less than 0.5.
    if (!clientWidth && !clientHeight) {
        return emptyRect;
    }
    var styles = getWindowOf(target).getComputedStyle(target);
    var paddings = getPaddings(styles);
    var horizPad = paddings.left + paddings.right;
    var vertPad = paddings.top + paddings.bottom;
    // Computed styles of width & height are being used because they are the
    // only dimensions available to JS that contain non-rounded values. It could
    // be possible to utilize the getBoundingClientRect if only it's data wasn't
    // affected by CSS transformations let alone paddings, borders and scroll bars.
    var width = toFloat(styles.width), height = toFloat(styles.height);
    // Width & height include paddings and borders when the 'border-box' box
    // model is applied (except for IE).
    if (styles.boxSizing === 'border-box') {
        // Following conditions are required to handle Internet Explorer which
        // doesn't include paddings and borders to computed CSS dimensions.
        //
        // We can say that if CSS dimensions + paddings are equal to the "client"
        // properties then it's either IE, and thus we don't need to subtract
        // anything, or an element merely doesn't have paddings/borders styles.
        if (Math.round(width + horizPad) !== clientWidth) {
            width -= getBordersSize$1(styles, 'left', 'right') + horizPad;
        }
        if (Math.round(height + vertPad) !== clientHeight) {
            height -= getBordersSize$1(styles, 'top', 'bottom') + vertPad;
        }
    }
    // Following steps can't be applied to the document's root element as its
    // client[Width/Height] properties represent viewport area of the window.
    // Besides, it's as well not necessary as the <html> itself neither has
    // rendered scroll bars nor it can be clipped.
    if (!isDocumentElement(target)) {
        // In some browsers (only in Firefox, actually) CSS width & height
        // include scroll bars size which can be removed at this step as scroll
        // bars are the only difference between rounded dimensions + paddings
        // and "client" properties, though that is not always true in Chrome.
        var vertScrollbar = Math.round(width + horizPad) - clientWidth;
        var horizScrollbar = Math.round(height + vertPad) - clientHeight;
        // Chrome has a rather weird rounding of "client" properties.
        // E.g. for an element with content width of 314.2px it sometimes gives
        // the client width of 315px and for the width of 314.7px it may give
        // 314px. And it doesn't happen all the time. So just ignore this delta
        // as a non-relevant.
        if (Math.abs(vertScrollbar) !== 1) {
            width -= vertScrollbar;
        }
        if (Math.abs(horizScrollbar) !== 1) {
            height -= horizScrollbar;
        }
    }
    return createRectInit(paddings.left, paddings.top, width, height);
}
/**
 * Checks whether provided element is an instance of the SVGGraphicsElement.
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
var isSVGGraphicsElement = (function () {
    // Some browsers, namely IE and Edge, don't have the SVGGraphicsElement
    // interface.
    if (typeof SVGGraphicsElement !== 'undefined') {
        return function (target) { return target instanceof getWindowOf(target).SVGGraphicsElement; };
    }
    // If it's so, then check that element is at least an instance of the
    // SVGElement and that it has the "getBBox" method.
    // eslint-disable-next-line no-extra-parens
    return function (target) { return (target instanceof getWindowOf(target).SVGElement &&
        typeof target.getBBox === 'function'); };
})();
/**
 * Checks whether provided element is a document element (<html>).
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
function isDocumentElement(target) {
    return target === getWindowOf(target).document.documentElement;
}
/**
 * Calculates an appropriate content rectangle for provided html or svg element.
 *
 * @param {Element} target - Element content rectangle of which needs to be calculated.
 * @returns {DOMRectInit}
 */
function getContentRect(target) {
    if (!isBrowser$1) {
        return emptyRect;
    }
    if (isSVGGraphicsElement(target)) {
        return getSVGContentRect(target);
    }
    return getHTMLElementContentRect(target);
}
/**
 * Creates rectangle with an interface of the DOMRectReadOnly.
 * Spec: https://drafts.fxtf.org/geometry/#domrectreadonly
 *
 * @param {DOMRectInit} rectInit - Object with rectangle's x/y coordinates and dimensions.
 * @returns {DOMRectReadOnly}
 */
function createReadOnlyRect(_a) {
    var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
    // If DOMRectReadOnly is available use it as a prototype for the rectangle.
    var Constr = typeof DOMRectReadOnly !== 'undefined' ? DOMRectReadOnly : Object;
    var rect = Object.create(Constr.prototype);
    // Rectangle's properties are not writable and non-enumerable.
    defineConfigurable(rect, {
        x: x, y: y, width: width, height: height,
        top: y,
        right: x + width,
        bottom: height + y,
        left: x
    });
    return rect;
}
/**
 * Creates DOMRectInit object based on the provided dimensions and the x/y coordinates.
 * Spec: https://drafts.fxtf.org/geometry/#dictdef-domrectinit
 *
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {number} width - Rectangle's width.
 * @param {number} height - Rectangle's height.
 * @returns {DOMRectInit}
 */
function createRectInit(x, y, width, height) {
    return { x: x, y: y, width: width, height: height };
}

/**
 * Class that is responsible for computations of the content rectangle of
 * provided DOM element and for keeping track of it's changes.
 */
var ResizeObservation = /** @class */ (function () {
    /**
     * Creates an instance of ResizeObservation.
     *
     * @param {Element} target - Element to be observed.
     */
    function ResizeObservation(target) {
        /**
         * Broadcasted width of content rectangle.
         *
         * @type {number}
         */
        this.broadcastWidth = 0;
        /**
         * Broadcasted height of content rectangle.
         *
         * @type {number}
         */
        this.broadcastHeight = 0;
        /**
         * Reference to the last observed content rectangle.
         *
         * @private {DOMRectInit}
         */
        this.contentRect_ = createRectInit(0, 0, 0, 0);
        this.target = target;
    }
    /**
     * Updates content rectangle and tells whether it's width or height properties
     * have changed since the last broadcast.
     *
     * @returns {boolean}
     */
    ResizeObservation.prototype.isActive = function () {
        var rect = getContentRect(this.target);
        this.contentRect_ = rect;
        return (rect.width !== this.broadcastWidth ||
            rect.height !== this.broadcastHeight);
    };
    /**
     * Updates 'broadcastWidth' and 'broadcastHeight' properties with a data
     * from the corresponding properties of the last observed content rectangle.
     *
     * @returns {DOMRectInit} Last observed content rectangle.
     */
    ResizeObservation.prototype.broadcastRect = function () {
        var rect = this.contentRect_;
        this.broadcastWidth = rect.width;
        this.broadcastHeight = rect.height;
        return rect;
    };
    return ResizeObservation;
}());

var ResizeObserverEntry = /** @class */ (function () {
    /**
     * Creates an instance of ResizeObserverEntry.
     *
     * @param {Element} target - Element that is being observed.
     * @param {DOMRectInit} rectInit - Data of the element's content rectangle.
     */
    function ResizeObserverEntry(target, rectInit) {
        var contentRect = createReadOnlyRect(rectInit);
        // According to the specification following properties are not writable
        // and are also not enumerable in the native implementation.
        //
        // Property accessors are not being used as they'd require to define a
        // private WeakMap storage which may cause memory leaks in browsers that
        // don't support this type of collections.
        defineConfigurable(this, { target: target, contentRect: contentRect });
    }
    return ResizeObserverEntry;
}());

var ResizeObserverSPI = /** @class */ (function () {
    /**
     * Creates a new instance of ResizeObserver.
     *
     * @param {ResizeObserverCallback} callback - Callback function that is invoked
     *      when one of the observed elements changes it's content dimensions.
     * @param {ResizeObserverController} controller - Controller instance which
     *      is responsible for the updates of observer.
     * @param {ResizeObserver} callbackCtx - Reference to the public
     *      ResizeObserver instance which will be passed to callback function.
     */
    function ResizeObserverSPI(callback, controller, callbackCtx) {
        /**
         * Collection of resize observations that have detected changes in dimensions
         * of elements.
         *
         * @private {Array<ResizeObservation>}
         */
        this.activeObservations_ = [];
        /**
         * Registry of the ResizeObservation instances.
         *
         * @private {Map<Element, ResizeObservation>}
         */
        this.observations_ = new MapShim();
        if (typeof callback !== 'function') {
            throw new TypeError('The callback provided as parameter 1 is not a function.');
        }
        this.callback_ = callback;
        this.controller_ = controller;
        this.callbackCtx_ = callbackCtx;
    }
    /**
     * Starts observing provided element.
     *
     * @param {Element} target - Element to be observed.
     * @returns {void}
     */
    ResizeObserverSPI.prototype.observe = function (target) {
        if (!arguments.length) {
            throw new TypeError('1 argument required, but only 0 present.');
        }
        // Do nothing if current environment doesn't have the Element interface.
        if (typeof Element === 'undefined' || !(Element instanceof Object)) {
            return;
        }
        if (!(target instanceof getWindowOf(target).Element)) {
            throw new TypeError('parameter 1 is not of type "Element".');
        }
        var observations = this.observations_;
        // Do nothing if element is already being observed.
        if (observations.has(target)) {
            return;
        }
        observations.set(target, new ResizeObservation(target));
        this.controller_.addObserver(this);
        // Force the update of observations.
        this.controller_.refresh();
    };
    /**
     * Stops observing provided element.
     *
     * @param {Element} target - Element to stop observing.
     * @returns {void}
     */
    ResizeObserverSPI.prototype.unobserve = function (target) {
        if (!arguments.length) {
            throw new TypeError('1 argument required, but only 0 present.');
        }
        // Do nothing if current environment doesn't have the Element interface.
        if (typeof Element === 'undefined' || !(Element instanceof Object)) {
            return;
        }
        if (!(target instanceof getWindowOf(target).Element)) {
            throw new TypeError('parameter 1 is not of type "Element".');
        }
        var observations = this.observations_;
        // Do nothing if element is not being observed.
        if (!observations.has(target)) {
            return;
        }
        observations.delete(target);
        if (!observations.size) {
            this.controller_.removeObserver(this);
        }
    };
    /**
     * Stops observing all elements.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.disconnect = function () {
        this.clearActive();
        this.observations_.clear();
        this.controller_.removeObserver(this);
    };
    /**
     * Collects observation instances the associated element of which has changed
     * it's content rectangle.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.gatherActive = function () {
        var _this = this;
        this.clearActive();
        this.observations_.forEach(function (observation) {
            if (observation.isActive()) {
                _this.activeObservations_.push(observation);
            }
        });
    };
    /**
     * Invokes initial callback function with a list of ResizeObserverEntry
     * instances collected from active resize observations.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.broadcastActive = function () {
        // Do nothing if observer doesn't have active observations.
        if (!this.hasActive()) {
            return;
        }
        var ctx = this.callbackCtx_;
        // Create ResizeObserverEntry instance for every active observation.
        var entries = this.activeObservations_.map(function (observation) {
            return new ResizeObserverEntry(observation.target, observation.broadcastRect());
        });
        this.callback_.call(ctx, entries, ctx);
        this.clearActive();
    };
    /**
     * Clears the collection of active observations.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.clearActive = function () {
        this.activeObservations_.splice(0);
    };
    /**
     * Tells whether observer has active observations.
     *
     * @returns {boolean}
     */
    ResizeObserverSPI.prototype.hasActive = function () {
        return this.activeObservations_.length > 0;
    };
    return ResizeObserverSPI;
}());

// Registry of internal observers. If WeakMap is not available use current shim
// for the Map collection as it has all required methods and because WeakMap
// can't be fully polyfilled anyway.
var observers = typeof WeakMap !== 'undefined' ? new WeakMap() : new MapShim();
/**
 * ResizeObserver API. Encapsulates the ResizeObserver SPI implementation
 * exposing only those methods and properties that are defined in the spec.
 */
var ResizeObserver = /** @class */ (function () {
    /**
     * Creates a new instance of ResizeObserver.
     *
     * @param {ResizeObserverCallback} callback - Callback that is invoked when
     *      dimensions of the observed elements change.
     */
    function ResizeObserver(callback) {
        if (!(this instanceof ResizeObserver)) {
            throw new TypeError('Cannot call a class as a function.');
        }
        if (!arguments.length) {
            throw new TypeError('1 argument required, but only 0 present.');
        }
        var controller = ResizeObserverController.getInstance();
        var observer = new ResizeObserverSPI(callback, controller, this);
        observers.set(this, observer);
    }
    return ResizeObserver;
}());
// Expose public methods of ResizeObserver.
[
    'observe',
    'unobserve',
    'disconnect'
].forEach(function (method) {
    ResizeObserver.prototype[method] = function () {
        var _a;
        return (_a = observers.get(this))[method].apply(_a, arguments);
    };
});

var index = (function () {
    // Export existing implementation if available.
    if (typeof global$1.ResizeObserver !== 'undefined') {
        return global$1.ResizeObserver;
    }
    return ResizeObserver;
})();

/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var ResizeSensor = /** @class */ (function (_super) {
    __extends(ResizeSensor, _super);
    function ResizeSensor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.element = null;
        _this.observer = new index(function (entries) { return safeInvoke(_this.props.onResize, entries); });
        return _this;
    }
    ResizeSensor.prototype.render = function () {
        // pass-through render of single child
        return Children.only(this.props.children);
    };
    ResizeSensor.prototype.componentDidMount = function () {
        this.observeElement();
    };
    ResizeSensor.prototype.componentDidUpdate = function (prevProps) {
        this.observeElement(this.props.observeParents !== prevProps.observeParents);
    };
    ResizeSensor.prototype.componentWillUnmount = function () {
        this.observer.disconnect();
    };
    /**
     * Observe the DOM element, if defined and different from the currently
     * observed element. Pass `force` argument to skip element checks and always
     * re-observe.
     */
    ResizeSensor.prototype.observeElement = function (force) {
        if (force === void 0) { force = false; }
        var element = this.getElement();
        if (!(element instanceof Element)) {
            // stop everything if not defined
            this.observer.disconnect();
            return;
        }
        if (element === this.element && !force) {
            // quit if given same element -- nothing to update (unless forced)
            return;
        }
        else {
            // clear observer list if new element
            this.observer.disconnect();
            // remember element reference for next time
            this.element = element;
        }
        // observer callback is invoked immediately when observing new elements
        this.observer.observe(element);
        if (this.props.observeParents) {
            var parent_1 = element.parentElement;
            while (parent_1 != null) {
                this.observer.observe(parent_1);
                parent_1 = parent_1.parentElement;
            }
        }
    };
    ResizeSensor.prototype.getElement = function () {
        try {
            // using findDOMNode for two reasons:
            // 1. cloning to insert a ref is unwieldy and not performant.
            // 2. ensure that we resolve to an actual DOM node (instead of any JSX ref instance).
            return findDOMNode(this);
        }
        catch (_a) {
            // swallow error if findDOMNode is run on unmounted component.
            return null;
        }
    };
    ResizeSensor.displayName = DISPLAYNAME_PREFIX + ".ResizeSensor";
    ResizeSensor = __decorate([
        polyfill
    ], ResizeSensor);
    return ResizeSensor;
}(AbstractPureComponent2));

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Tooltip = /** @class */ (function (_super) {
    __extends(Tooltip, _super);
    function Tooltip() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.popover = null;
        return _this;
    }
    Tooltip.prototype.render = function () {
        var _this = this;
        var _a = this.props, children = _a.children, intent = _a.intent, popoverClassName = _a.popoverClassName, restProps = __rest(_a, ["children", "intent", "popoverClassName"]);
        var classes$1 = cx(TOOLTIP, intentClass(intent), popoverClassName);
        return (createElement(Popover, __assign({ interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY }, restProps, { autoFocus: false, canEscapeKeyClose: false, enforceFocus: false, lazy: true, popoverClassName: classes$1, portalContainer: this.props.portalContainer, ref: function (ref) { return (_this.popover = ref); } }), children));
    };
    Tooltip.prototype.reposition = function () {
        if (this.popover != null) {
            this.popover.reposition();
        }
    };
    Tooltip.displayName = DISPLAYNAME_PREFIX + ".Tooltip";
    Tooltip.defaultProps = {
        hoverCloseDelay: 0,
        hoverOpenDelay: 100,
        transitionDuration: 100,
    };
    Tooltip = __decorate([
        polyfill
    ], Tooltip);
    return Tooltip;
}(AbstractPureComponent2));

/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Popper placement utils
// ======================
/** Converts a full placement to one of the four positions by stripping text after the `-`. */
function getPosition(placement) {
    return placement.split("-")[0];
}
/** Returns true if position is left or right. */
function isVerticalPosition(side) {
    return ["left", "right"].indexOf(side) !== -1;
}
/** Returns the opposite position. */
function getOppositePosition(side) {
    switch (side) {
        case "top":
            return "bottom";
        case "left":
            return "right";
        case "bottom":
            return "top";
        default:
            return "left";
    }
}
/** Returns the CSS alignment keyword corresponding to given placement. */
function getAlignment(placement) {
    var align = placement.split("-")[1];
    switch (align) {
        case "start":
            return "left";
        case "end":
            return "right";
        default:
            return "center";
    }
}
// Popper modifiers
// ================
/** Modifier helper function to compute popper transform-origin based on arrow position */
function getTransformOrigin(data) {
    var position = getPosition(data.placement);
    if (data.arrowElement == null) {
        return isVerticalPosition(position)
            ? getOppositePosition(position) + " " + getAlignment(position)
            : getAlignment(position) + " " + getOppositePosition(position);
    }
    else {
        var arrowSizeShift = data.arrowElement.clientHeight / 2;
        var arrow = data.offsets.arrow;
        // can use keyword for dimension without the arrow, to ease computation burden.
        // move origin by half arrow's height to keep it centered.
        return isVerticalPosition(position)
            ? getOppositePosition(position) + " " + (arrow.top + arrowSizeShift) + "px"
            : arrow.left + arrowSizeShift + "px " + getOppositePosition(position);
    }
}
// additional space between arrow and edge of target
var ARROW_SPACING = 4;
/** Popper modifier that offsets popper and arrow so arrow points out of the correct side */
var arrowOffsetModifier = function (data) {
    if (data.arrowElement == null) {
        return data;
    }
    // our arrows have equal width and height
    var arrowSize = data.arrowElement.clientWidth;
    // this logic borrowed from original Popper arrow modifier itself
    var position = getPosition(data.placement);
    var isVertical = isVerticalPosition(position);
    var len = isVertical ? "width" : "height";
    var offsetSide = isVertical ? "left" : "top";
    var arrowOffsetSize = Math.round(arrowSize / 2 / Math.sqrt(2));
    // offset popover by arrow size, offset arrow in the opposite direction
    if (position === "top" || position === "left") {
        // the "up & back" directions require negative popper offsets
        data.offsets.popper[offsetSide] -= arrowOffsetSize + ARROW_SPACING;
        // can only use left/top on arrow so gotta get clever with 100% + X
        data.offsets.arrow[offsetSide] = data.offsets.popper[len] - arrowSize + arrowOffsetSize;
    }
    else {
        data.offsets.popper[offsetSide] += arrowOffsetSize + ARROW_SPACING;
        data.offsets.arrow[offsetSide] = -arrowOffsetSize;
    }
    return data;
};

/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// these paths come from the Core Kit Sketch file
// https://github.com/palantir/blueprint/blob/develop/resources/sketch/Core%20Kit.sketch
var SVG_SHADOW_PATH = "M8.11 6.302c1.015-.936 1.887-2.922 1.887-4.297v26c0-1.378" +
    "-.868-3.357-1.888-4.297L.925 17.09c-1.237-1.14-1.233-3.034 0-4.17L8.11 6.302z";
var SVG_ARROW_PATH = "M8.787 7.036c1.22-1.125 2.21-3.376 2.21-5.03V0v30-2.005" +
    "c0-1.654-.983-3.9-2.21-5.03l-7.183-6.616c-.81-.746-.802-1.96 0-2.7l7.183-6.614z";
/** Modifier helper function to compute arrow rotate() transform */
function getArrowAngle(placement) {
    if (placement == null) {
        return 0;
    }
    // can only be top/left/bottom/right - auto is resolved internally
    switch (getPosition(placement)) {
        case "top":
            return -90;
        case "left":
            return 180;
        case "bottom":
            return 90;
        default:
            return 0;
    }
}
var PopoverArrow = function (_a) {
    var _b = _a.arrowProps, ref = _b.ref, style = _b.style, placement = _a.placement;
    return (createElement("div", { className: POPOVER_ARROW, ref: ref, style: isNaN(+style.left) ? {} : style },
        createElement("svg", { viewBox: "0 0 30 30", style: { transform: "rotate(" + getArrowAngle(placement) + "deg)" } },
            createElement("path", { className: POPOVER_ARROW + "-border", d: SVG_SHADOW_PATH }),
            createElement("path", { className: POPOVER_ARROW + "-fill", d: SVG_ARROW_PATH }))));
};
PopoverArrow.displayName = DISPLAYNAME_PREFIX + ".PopoverArrow";

/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * Convert a position to a placement.
 * @param position the position to convert
 */
function positionToPlacement(position) {
    /* istanbul ignore next */
    switch (position) {
        case Position.TOP_LEFT:
            return "top-start";
        case Position.TOP:
            return "top";
        case Position.TOP_RIGHT:
            return "top-end";
        case Position.RIGHT_TOP:
            return "right-start";
        case Position.RIGHT:
            return "right";
        case Position.RIGHT_BOTTOM:
            return "right-end";
        case Position.BOTTOM_RIGHT:
            return "bottom-end";
        case Position.BOTTOM:
            return "bottom";
        case Position.BOTTOM_LEFT:
            return "bottom-start";
        case Position.LEFT_BOTTOM:
            return "left-end";
        case Position.LEFT:
            return "left";
        case Position.LEFT_TOP:
            return "left-start";
        case "auto":
        case "auto-start":
        case "auto-end":
            // Return the string unchanged.
            return position;
        default:
            return assertNever(position);
    }
}
/* istanbul ignore next */
function assertNever(x) {
    throw new Error("Unexpected position: " + x);
}

/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var PopoverInteractionKind = {
    CLICK: "click",
    CLICK_TARGET_ONLY: "click-target",
    HOVER: "hover",
    HOVER_TARGET_ONLY: "hover-target",
};
var Popover = /** @class */ (function (_super) {
    __extends(Popover, _super);
    function Popover() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            hasDarkParent: false,
            isOpen: _this.getIsOpen(_this.props),
            transformOrigin: "",
        };
        // a flag that lets us detect mouse movement between the target and popover,
        // now that mouseleave is triggered when you cross the gap between the two.
        _this.isMouseInTargetOrPopover = false;
        // a flag that indicates whether the target previously lost focus to another
        // element on the same page.
        _this.lostFocusOnSamePage = true;
        _this.refHandlers = {
            popover: function (ref) {
                _this.popoverElement = ref;
                safeInvoke(_this.props.popoverRef, ref);
            },
            target: function (ref) { return (_this.targetElement = ref); },
        };
        /**
         * Instance method to instruct the `Popover` to recompute its position.
         *
         * This method should only be used if you are updating the target in a way
         * that does not cause it to re-render, such as changing its _position_
         * without changing its _size_ (since `Popover` already repositions when it
         * detects a resize).
         */
        _this.reposition = function () { return safeInvoke(_this.popperScheduleUpdate); };
        _this.renderPopover = function (popperProps) {
            var _a;
            var _b = _this.props, usePortal = _b.usePortal, interactionKind = _b.interactionKind;
            var transformOrigin = _this.state.transformOrigin;
            // Need to update our reference to this on every render as it will change.
            _this.popperScheduleUpdate = popperProps.scheduleUpdate;
            var popoverHandlers = {
                // always check popover clicks for dismiss class
                onClick: _this.handlePopoverClick,
            };
            if (interactionKind === PopoverInteractionKind.HOVER ||
                (!usePortal && interactionKind === PopoverInteractionKind.HOVER_TARGET_ONLY)) {
                popoverHandlers.onMouseEnter = _this.handleMouseEnter;
                popoverHandlers.onMouseLeave = _this.handleMouseLeave;
            }
            var popoverClasses = cx(POPOVER, (_a = {},
                _a[DARK] = _this.props.inheritDarkTheme && _this.state.hasDarkParent,
                _a[MINIMAL] = _this.props.minimal,
                _a), _this.props.popoverClassName);
            return (createElement("div", { className: TRANSITION_CONTAINER, ref: popperProps.ref, style: popperProps.style },
                createElement(ResizeSensor, { onResize: _this.reposition },
                    createElement("div", __assign({ className: popoverClasses, style: { transformOrigin: transformOrigin } }, popoverHandlers),
                        _this.isArrowEnabled() && (createElement(PopoverArrow, { arrowProps: popperProps.arrowProps, placement: popperProps.placement })),
                        createElement("div", { className: POPOVER_CONTENT }, _this.understandChildren().content)))));
        };
        _this.renderTarget = function (referenceProps) {
            var _a, _b;
            var _c = _this.props, fill = _c.fill, openOnTargetFocus = _c.openOnTargetFocus, targetClassName = _c.targetClassName, _d = _c.targetProps, targetProps = _d === void 0 ? {} : _d;
            var isOpen = _this.state.isOpen;
            var isControlled = _this.isControlled();
            var isHoverInteractionKind = _this.isHoverInteractionKind();
            var targetTagName = _this.props.targetTagName;
            if (fill) {
                targetTagName = "div";
            }
            var finalTargetProps = isHoverInteractionKind
                ? {
                    // HOVER handlers
                    onBlur: _this.handleTargetBlur,
                    onFocus: _this.handleTargetFocus,
                    onMouseEnter: _this.handleMouseEnter,
                    onMouseLeave: _this.handleMouseLeave,
                }
                : {
                    // CLICK needs only one handler
                    onClick: _this.handleTargetClick,
                };
            finalTargetProps.className = cx(POPOVER_TARGET, (_a = {}, _a[POPOVER_OPEN] = isOpen, _a), targetProps.className, targetClassName);
            finalTargetProps.ref = referenceProps.ref;
            var rawTarget = ensureElement(_this.understandChildren().target);
            var rawTabIndex = rawTarget.props.tabIndex;
            // ensure target is focusable if relevant prop enabled
            var tabIndex = rawTabIndex == null && openOnTargetFocus && isHoverInteractionKind ? 0 : rawTabIndex;
            var clonedTarget = cloneElement(rawTarget, {
                className: cx(rawTarget.props.className, (_b = {},
                    // this class is mainly useful for button targets; we should only apply it for uncontrolled popovers
                    // when they are opened by a user interaction
                    _b[ACTIVE] = isOpen && !isControlled && !isHoverInteractionKind,
                    _b)),
                // force disable single Tooltip child when popover is open (BLUEPRINT-552)
                disabled: isOpen && isElementOfType(rawTarget, Tooltip) ? true : rawTarget.props.disabled,
                tabIndex: tabIndex,
            });
            var target = createElement(targetTagName, __assign({}, targetProps, finalTargetProps), clonedTarget);
            return createElement(ResizeSensor, { onResize: _this.reposition }, target);
        };
        _this.isControlled = function () { return _this.props.isOpen !== undefined; };
        _this.handleTargetFocus = function (e) {
            if (_this.props.openOnTargetFocus && _this.isHoverInteractionKind()) {
                if (e.relatedTarget == null && !_this.lostFocusOnSamePage) {
                    // ignore this focus event -- the target was already focused but the page itself
                    // lost focus (e.g. due to switching tabs).
                    return;
                }
                _this.handleMouseEnter(e);
            }
            safeInvokeMember(_this.props.targetProps, "onFocus", e);
        };
        _this.handleTargetBlur = function (e) {
            if (_this.props.openOnTargetFocus && _this.isHoverInteractionKind()) {
                // if the next element to receive focus is within the popover, we'll want to leave the
                // popover open. e.relatedTarget ought to tell us the next element to receive focus, but if the user just
                // clicked on an element which is not focusable (either by default or with a tabIndex attribute),
                // it won't be set. So, we filter those out here and assume that a click handler somewhere else will
                // close the popover if necessary.
                if (e.relatedTarget != null && !_this.isElementInPopover(e.relatedTarget)) {
                    _this.handleMouseLeave(e);
                }
            }
            _this.lostFocusOnSamePage = e.relatedTarget != null;
            safeInvokeMember(_this.props.targetProps, "onBlur", e);
        };
        _this.handleMouseEnter = function (e) {
            _this.isMouseInTargetOrPopover = true;
            // if we're entering the popover, and the mode is set to be HOVER_TARGET_ONLY, we want to manually
            // trigger the mouse leave event, as hovering over the popover shouldn't count.
            if (!_this.props.usePortal &&
                _this.isElementInPopover(e.target) &&
                _this.props.interactionKind === PopoverInteractionKind.HOVER_TARGET_ONLY &&
                !_this.props.openOnTargetFocus) {
                _this.handleMouseLeave(e);
            }
            else if (!_this.props.disabled) {
                // only begin opening popover when it is enabled
                _this.setOpenState(true, e, _this.props.hoverOpenDelay);
            }
            safeInvokeMember(_this.props.targetProps, "onMouseEnter", e);
        };
        _this.handleMouseLeave = function (e) {
            _this.isMouseInTargetOrPopover = false;
            // wait until the event queue is flushed, because we want to leave the
            // popover open if the mouse entered the popover immediately after
            // leaving the target (or vice versa).
            _this.setTimeout(function () {
                if (_this.isMouseInTargetOrPopover) {
                    return;
                }
                // user-configurable closing delay is helpful when moving mouse from target to popover
                _this.setOpenState(false, e, _this.props.hoverCloseDelay);
            });
            safeInvokeMember(_this.props.targetProps, "onMouseLeave", e);
        };
        _this.handlePopoverClick = function (e) {
            var eventTarget = e.target;
            // an OVERRIDE inside a DISMISS does not dismiss, and a DISMISS inside an OVERRIDE will dismiss.
            var dismissElement = eventTarget.closest("." + POPOVER_DISMISS + ", ." + POPOVER_DISMISS_OVERRIDE);
            var shouldDismiss = dismissElement != null && dismissElement.classList.contains(POPOVER_DISMISS);
            var isDisabled = eventTarget.closest(":disabled, ." + DISABLED) != null;
            if (shouldDismiss && !isDisabled && !e.isDefaultPrevented()) {
                _this.setOpenState(false, e);
                if (_this.props.captureDismiss) {
                    e.preventDefault();
                }
            }
        };
        _this.handleOverlayClose = function (e) {
            var eventTarget = e.target;
            // if click was in target, target event listener will handle things, so don't close
            if (!elementIsOrContains(_this.targetElement, eventTarget) || e.nativeEvent instanceof KeyboardEvent) {
                _this.setOpenState(false, e);
            }
        };
        _this.handleTargetClick = function (e) {
            // ensure click did not originate from within inline popover before closing
            if (!_this.props.disabled && !_this.isElementInPopover(e.target)) {
                if (_this.props.isOpen == null) {
                    _this.setState(function (prevState) { return ({ isOpen: !prevState.isOpen }); });
                }
                else {
                    _this.setOpenState(!_this.props.isOpen, e);
                }
            }
            safeInvokeMember(_this.props.targetProps, "onClick", e);
        };
        /** Popper modifier that updates React state (for style properties) based on latest data. */
        _this.updatePopoverState = function (data) {
            // always set string; let shouldComponentUpdate determine if update is necessary
            _this.setState({ transformOrigin: getTransformOrigin(data) });
            return data;
        };
        return _this;
    }
    Popover.prototype.render = function () {
        var _a;
        // rename wrapper tag to begin with uppercase letter so it's recognized
        // as JSX component instead of intrinsic element. but because of its
        // type, tsc actually recognizes that it is _any_ intrinsic element, so
        // it can typecheck the HTML props!!
        var _b = this.props, className = _b.className, disabled = _b.disabled, fill = _b.fill;
        var isOpen = this.state.isOpen;
        var wrapperTagName = this.props.wrapperTagName;
        if (fill) {
            wrapperTagName = "div";
        }
        var isContentEmpty = ensureElement(this.understandChildren().content) == null;
        // need to do this check in render(), because `isOpen` is derived from
        // state, and state can't necessarily be accessed in validateProps.
        if (isContentEmpty && !disabled && isOpen !== false && !isNodeEnv("production")) {
            console.warn(POPOVER_WARN_EMPTY_CONTENT);
        }
        var wrapperClasses = cx(POPOVER_WRAPPER, className, (_a = {},
            _a[FILL] = fill,
            _a));
        var wrapper = createElement(wrapperTagName, { className: wrapperClasses }, createElement(Reference, { innerRef: this.refHandlers.target }, this.renderTarget), createElement(Overlay, { autoFocus: this.props.autoFocus, backdropClassName: POPOVER_BACKDROP, backdropProps: this.props.backdropProps, canEscapeKeyClose: this.props.canEscapeKeyClose, canOutsideClickClose: this.props.interactionKind === PopoverInteractionKind.CLICK, className: this.props.portalClassName, enforceFocus: this.props.enforceFocus, hasBackdrop: this.props.hasBackdrop, isOpen: isOpen && !isContentEmpty, onClose: this.handleOverlayClose, onClosed: this.props.onClosed, onClosing: this.props.onClosing, onOpened: this.props.onOpened, onOpening: this.props.onOpening, transitionDuration: this.props.transitionDuration, transitionName: POPOVER, usePortal: this.props.usePortal, portalContainer: this.props.portalContainer },
            createElement(Popper$1, { innerRef: this.refHandlers.popover, placement: positionToPlacement(this.props.position), modifiers: this.getPopperModifiers() }, this.renderPopover)));
        return createElement(Manager, null, wrapper);
    };
    Popover.prototype.componentDidMount = function () {
        this.updateDarkParent();
    };
    Popover.prototype.componentDidUpdate = function (_, __, snapshot) {
        _super.prototype.componentDidUpdate.call(this, _, __, snapshot);
        this.updateDarkParent();
        var nextIsOpen = this.getIsOpen(this.props);
        if (this.props.isOpen != null && nextIsOpen !== this.state.isOpen) {
            this.setOpenState(nextIsOpen);
            // tricky: setOpenState calls setState only if this.props.isOpen is
            // not controlled, so we need to invoke setState manually here.
            this.setState({ isOpen: nextIsOpen });
        }
        else if (this.props.disabled && this.state.isOpen && this.props.isOpen == null) {
            // special case: close an uncontrolled popover when disabled is set to true
            this.setOpenState(false);
        }
    };
    Popover.prototype.validateProps = function (props) {
        if (props.isOpen == null && props.onInteraction != null) {
            console.warn(POPOVER_WARN_UNCONTROLLED_ONINTERACTION);
        }
        if (props.hasBackdrop && !props.usePortal) {
            console.warn(POPOVER_WARN_HAS_BACKDROP_INLINE);
        }
        if (props.hasBackdrop && props.interactionKind !== PopoverInteractionKind.CLICK) {
            throw new Error(POPOVER_HAS_BACKDROP_INTERACTION);
        }
        var childrenCount = Children.count(props.children);
        var hasContentProp = props.content !== undefined;
        var hasTargetProp = props.target !== undefined;
        if (childrenCount === 0 && !hasTargetProp) {
            throw new Error(POPOVER_REQUIRES_TARGET);
        }
        if (childrenCount > 2) {
            console.warn(POPOVER_WARN_TOO_MANY_CHILDREN);
        }
        if (childrenCount > 0 && hasTargetProp) {
            console.warn(POPOVER_WARN_DOUBLE_TARGET);
        }
        if (childrenCount === 2 && hasContentProp) {
            console.warn(POPOVER_WARN_DOUBLE_CONTENT);
        }
    };
    Popover.prototype.updateDarkParent = function () {
        if (this.props.usePortal && this.state.isOpen) {
            var hasDarkParent = this.targetElement != null && this.targetElement.closest("." + DARK) != null;
            this.setState({ hasDarkParent: hasDarkParent });
        }
    };
    // content and target can be specified as props or as children. this method
    // normalizes the two approaches, preferring child over prop.
    Popover.prototype.understandChildren = function () {
        var _a = this.props, children = _a.children, contentProp = _a.content, targetProp = _a.target;
        // #validateProps asserts that 1 <= children.length <= 2 so content is optional
        var _b = Children.toArray(children), targetChild = _b[0], contentChild = _b[1];
        return {
            content: contentChild == null ? contentProp : contentChild,
            target: targetChild == null ? targetProp : targetChild,
        };
    };
    Popover.prototype.getIsOpen = function (props) {
        // disabled popovers should never be allowed to open.
        if (props.disabled) {
            return false;
        }
        else if (props.isOpen != null) {
            return props.isOpen;
        }
        else {
            return props.defaultIsOpen;
        }
    };
    Popover.prototype.getPopperModifiers = function () {
        var _a = this.props, boundary = _a.boundary, modifiers = _a.modifiers;
        var _b = modifiers.flip, flip = _b === void 0 ? {} : _b, _c = modifiers.preventOverflow, preventOverflow = _c === void 0 ? {} : _c;
        return __assign({}, modifiers, { arrowOffset: {
                enabled: this.isArrowEnabled(),
                fn: arrowOffsetModifier,
                order: 510,
            }, flip: __assign({ boundariesElement: boundary }, flip), preventOverflow: __assign({ boundariesElement: boundary }, preventOverflow), updatePopoverState: {
                enabled: true,
                fn: this.updatePopoverState,
                order: 900,
            } });
    };
    // a wrapper around setState({isOpen}) that will call props.onInteraction instead when in controlled mode.
    // starts a timeout to delay changing the state if a non-zero duration is provided.
    Popover.prototype.setOpenState = function (isOpen, e, timeout) {
        var _this = this;
        // cancel any existing timeout because we have new state
        safeInvoke(this.cancelOpenTimeout);
        if (timeout > 0) {
            this.cancelOpenTimeout = this.setTimeout(function () { return _this.setOpenState(isOpen, e); }, timeout);
        }
        else {
            if (this.props.isOpen == null) {
                this.setState({ isOpen: isOpen });
            }
            else {
                safeInvoke(this.props.onInteraction, isOpen, e);
            }
            if (!isOpen) {
                safeInvoke(this.props.onClose, e);
            }
        }
    };
    Popover.prototype.isArrowEnabled = function () {
        var _a = this.props, minimal = _a.minimal, arrow = _a.modifiers.arrow;
        // omitting `arrow` from `modifiers` uses Popper default, which does show an arrow.
        return !minimal && (arrow == null || arrow.enabled);
    };
    Popover.prototype.isElementInPopover = function (element) {
        return this.popoverElement != null && this.popoverElement.contains(element);
    };
    Popover.prototype.isHoverInteractionKind = function () {
        return (this.props.interactionKind === PopoverInteractionKind.HOVER ||
            this.props.interactionKind === PopoverInteractionKind.HOVER_TARGET_ONLY);
    };
    Popover.displayName = DISPLAYNAME_PREFIX + ".Popover";
    Popover.defaultProps = {
        boundary: "scrollParent",
        captureDismiss: false,
        defaultIsOpen: false,
        disabled: false,
        fill: false,
        hasBackdrop: false,
        hoverCloseDelay: 300,
        hoverOpenDelay: 150,
        inheritDarkTheme: true,
        interactionKind: PopoverInteractionKind.CLICK,
        minimal: false,
        modifiers: {},
        openOnTargetFocus: true,
        position: "auto",
        targetTagName: "span",
        transitionDuration: 300,
        usePortal: true,
        wrapperTagName: "span",
    };
    Popover = __decorate([
        polyfill
    ], Popover);
    return Popover;
}(AbstractPureComponent2));

/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 */
var IconSvgPaths16 = {
    "add": ["M10.99 6.99h-2v-2c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1zm-3-7c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.68 6-6 6z"],
    "add-column-left": ["M15 0H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-5 14H2V2h8v12zm4 0h-3V2h3v12zM4 9h1v1c0 .55.45 1 1 1s1-.45 1-1V9h1c.55 0 1-.45 1-1s-.45-1-1-1H7V6c0-.55-.45-1-1-1s-1 .45-1 1v1H4c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "add-column-right": ["M8 9h1v1c0 .55.45 1 1 1s1-.45 1-1V9h1c.55 0 1-.45 1-1s-.45-1-1-1h-1V6c0-.55-.45-1-1-1s-1 .45-1 1v1H8c-.55 0-1 .45-1 1s.45 1 1 1zm7-9H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM5 14H2V2h3v12zm9 0H6V2h8v12z"],
    "add-row-bottom": ["M6 11h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c.55 0 1-.45 1-1s-.45-1-1-1H9V8c0-.55-.45-1-1-1s-1 .45-1 1v1H6c-.55 0-1 .45-1 1s.45 1 1 1zm9-11H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 14H2V6h12v8zm0-9H2V2h12v3z"],
    "add-row-top": ["M15 0H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 14H2v-3h12v3zm0-4H2V2h12v8zM6 7h1v1c0 .55.45 1 1 1s1-.45 1-1V7h1c.55 0 1-.45 1-1s-.45-1-1-1H9V4c0-.55-.45-1-1-1s-1 .45-1 1v1H6c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "add-to-artifact": ["M14 4.01h-1v-1c0-.55-.45-1-1-1s-1 .45-1 1v1h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c.55 0 1-.45 1-1 0-.56-.45-1-1-1zm-13 2h6c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm8 6H1c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1 0-.56-.45-1-1-1zm0-4H1c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1 0-.56-.45-1-1-1z"],
    "add-to-folder": ["M.01 7V5H16v7c0 .55-.45 1-1 1H9.005v-2.99C8.974 8.332 7.644 7 5.996 7H.01zM15 2H7.416L5.706.29a.996.996 0 00-.71-.29H1C.45 0 0 .45 0 1v3h15.99V3c.01-.55-.44-1-.99-1zM5.997 9H2c-.55 0-1 .45-1 1s.45 1 1 1h1.589L.3 14.29a1.003 1.003 0 001.42 1.42l3.287-3.29v1.59c0 .55.45 1 1 1 .549 0 .999-.45.999-1v-4A1.02 1.02 0 005.996 9z"],
    "airplane": ["M16 1.5A1.498 1.498 0 0013.44.44L9.91 3.97 2 1 1 3l5.93 3.95L3.88 10H1l-1 1 3 2 2 3 1-1v-2.88l3.05-3.05L13 15l2-1-2.97-7.91 3.53-3.53c.27-.27.44-.65.44-1.06z"],
    "align-center": ["M4 4c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1H4zM1 3h14c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm13 10H2c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1zm1-6H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zm-5 5c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1h4z"],
    "align-justify": ["M15 12.98H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zm-14-10h14c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1 0 .56.45 1 1 1zm14 4H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zm0-3H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zm0 6H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "align-left": ["M13 13H1c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1zM1 3h14c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm0 3h8c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm14 1H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zM1 12h4c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "align-right": ["M15 12.98H3c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1zm-14-10h14c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1 0 .56.45 1 1 1zm14 1H7c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1zm0 6h-4c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1zm0-3H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "alignment-bottom": ["M10 12h3c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm5 2H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zM3 12h3c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1z"],
    "alignment-horizontal-center": ["M15 7h-1V6c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1v1H7V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v4H1c-.55 0-1 .45-1 1s.45 1 1 1h1v4c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V9h2v1c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V9h1c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "alignment-left": ["M9 9H5c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1zM1 0C.45 0 0 .45 0 1v14c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zm13 2H5c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1z"],
    "alignment-right": ["M11 9H7c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1zm4-9c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zm-4 2H2c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1z"],
    "alignment-top": ["M15 0H1C.45 0 0 .45 0 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zM6 4H3c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm7 0h-3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1z"],
    "alignment-vertical-center": ["M13 2H9V1c0-.55-.45-1-1-1S7 .45 7 1v1H3c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h4v2H6c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1H9V7h4c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1z"],
    "annotation": ["M15.52 2.77c.3-.29.48-.7.48-1.15C16 .73 15.27 0 14.38 0c-.45 0-.85.18-1.15.48l-1.34 1.34 2.3 2.3 1.33-1.35zM7.4 10.9l6.21-6.21-2.3-2.3L5.1 8.6l2.3 2.3zM14 14H2V2h6.34l2-2H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V5.66l-2 2V14zM3 13l3.58-1.29-2.29-2.27L3 13z"],
    "application": ["M3.5 7h7c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-7c-.28 0-.5.22-.5.5s.22.5.5.5zM15 1H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm-1 12H2V5h12v8zM3.5 9h4c.28 0 .5-.22.5-.5S7.78 8 7.5 8h-4c-.28 0-.5.22-.5.5s.22.5.5.5zm0 2h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-5c-.28 0-.5.22-.5.5s.22.5.5.5z"],
    "applications": ["M3.5 11h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-2c-.28 0-.5.22-.5.5s.22.5.5.5zm0-2h5c.28 0 .5-.22.5-.5S8.78 8 8.5 8h-5c-.28 0-.5.22-.5.5s.22.5.5.5zM11 4H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm-1 10H2V7h8v7zm5-14H5c-.55 0-1 .45-1 1v2h2V2h8v7h-1v2h2c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM3.5 13h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5z"],
    "archive": ["M13.382 0a1 1 0 01.894.553L16 4v11a1 1 0 01-1 1H1a1 1 0 01-1-1V4L1.724.553A1 1 0 012.618 0h10.764zM8 6c-.55 0-1 .45-1 1v2.59l-.29-.29-.081-.076A.97.97 0 006 9a1.003 1.003 0 00-.71 1.71l2 2 .096.084c.168.13.38.206.614.206.28 0 .53-.11.71-.29l2-2 .084-.096A1.003 1.003 0 009.29 9.29l-.29.3V7l-.007-.116A1.004 1.004 0 008 6zm5-4H3L2 4h12l-1-2z"],
    "arrow-bottom-left": ["M14 3a1.003 1.003 0 00-1.71-.71L4 10.59V6c0-.55-.45-1-1-1s-1 .45-1 1v7c0 .55.45 1 1 1h7c.55 0 1-.45 1-1s-.45-1-1-1H5.41l8.29-8.29c.19-.18.3-.43.3-.71z"],
    "arrow-bottom-right": ["M13 5c-.55 0-1 .45-1 1v4.59l-8.29-8.3a1.003 1.003 0 00-1.42 1.42l8.3 8.29H6c-.55 0-1 .45-1 1s.45 1 1 1h7c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"],
    "arrow-down": ["M13 8c-.3 0-.5.1-.7.3L9 11.6V2c0-.5-.4-1-1-1s-1 .5-1 1v9.6L3.7 8.3C3.5 8.1 3.3 8 3 8c-.5 0-1 .5-1 1 0 .3.1.5.3.7l5 5c.2.2.4.3.7.3s.5-.1.7-.3l5-5c.2-.2.3-.4.3-.7 0-.6-.4-1-1-1z"],
    "arrow-left": ["M13.99 6.99H4.41L7.7 3.7a1.003 1.003 0 00-1.42-1.42l-5 5a1.014 1.014 0 000 1.42l5 5a1.003 1.003 0 001.42-1.42L4.41 8.99H14c.55 0 1-.45 1-1s-.46-1-1.01-1z"],
    "arrow-right": ["M14.7 7.29l-5-5a.965.965 0 00-.71-.3 1.003 1.003 0 00-.71 1.71l3.29 3.29H1.99c-.55 0-1 .45-1 1s.45 1 1 1h9.59l-3.29 3.29a1.003 1.003 0 001.42 1.42l5-5c.18-.18.29-.43.29-.71s-.12-.52-.3-.7z"],
    "arrow-top-left": ["M13.71 12.29L5.41 4H10c.55 0 1-.45 1-1s-.45-1-1-1H3c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1V5.41l8.29 8.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71z"],
    "arrow-top-right": ["M13 2H6c-.55 0-1 .45-1 1s.45 1 1 1h4.59L2.3 12.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L12 5.41V10c0 .55.45 1 1 1s1-.45 1-1V3c0-.55-.45-1-1-1z"],
    "arrow-up": ["M13.7 6.3l-5-5C8.5 1.1 8.3 1 8 1s-.5.1-.7.3l-5 5c-.2.2-.3.4-.3.7 0 .6.5 1 1 1 .3 0 .5-.1.7-.3L7 4.4V14c0 .6.4 1 1 1s1-.4 1-1V4.4l3.3 3.3c.2.2.4.3.7.3.6 0 1-.4 1-1 0-.3-.1-.5-.3-.7z"],
    "arrows-horizontal": ["M15.7 7.3l-4-4c-.2-.2-.4-.3-.7-.3-.6 0-1 .5-1 1 0 .3.1.5.3.7L12.6 7H3.4l2.3-2.3c.2-.2.3-.4.3-.7 0-.5-.4-1-1-1-.3 0-.5.1-.7.3l-4 4c-.2.2-.3.4-.3.7s.1.5.3.7l4 4c.2.2.4.3.7.3.6 0 1-.4 1-1 0-.3-.1-.5-.3-.7L3.4 9h9.2l-2.3 2.3c-.2.2-.3.4-.3.7 0 .6.4 1 1 1 .3 0 .5-.1.7-.3l4-4c.2-.2.3-.4.3-.7s-.1-.5-.3-.7z"],
    "arrows-vertical": ["M12 10c-.3 0-.5.1-.7.3L9 12.6V3.4l2.3 2.3c.2.2.4.3.7.3.6 0 1-.4 1-1 0-.3-.1-.5-.3-.7l-4-4C8.5.1 8.3 0 8 0s-.5.1-.7.3l-4 4c-.2.2-.3.4-.3.7 0 .6.5 1 1 1 .3 0 .5-.1.7-.3L7 3.4v9.2l-2.3-2.3c-.2-.2-.4-.3-.7-.3-.5 0-1 .4-1 1 0 .3.1.5.3.7l4 4c.2.2.4.3.7.3s.5-.1.7-.3l4-4c.2-.2.3-.4.3-.7 0-.6-.4-1-1-1z"],
    "asterisk": ["M14.54 11.18l.01-.02L9.8 8l4.75-3.17-.01-.02c.27-.17.46-.46.46-.81 0-.55-.45-1-1-1-.21 0-.39.08-.54.18l-.01-.02L9 6.13V1c0-.55-.45-1-1-1S7 .45 7 1v5.13L2.55 3.17l-.01.01A.969.969 0 002 3c-.55 0-1 .45-1 1 0 .35.19.64.46.82l-.01.01L6.2 8l-4.75 3.17.01.02c-.27.17-.46.46-.46.81 0 .55.45 1 1 1 .21 0 .39-.08.54-.18l.01.02L7 9.87V15c0 .55.45 1 1 1s1-.45 1-1V9.87l4.45 2.96.01-.02c.15.11.33.19.54.19.55 0 1-.45 1-1 0-.35-.19-.64-.46-.82z"],
    "automatic-updates": ["M8 14c-3.31 0-6-2.69-6-6 0-1.77.78-3.36 2-4.46V5c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1H1C.45 0 0 .45 0 1s.45 1 1 1h1.74A7.95 7.95 0 000 8c0 4.42 3.58 8 8 8 .55 0 1-.45 1-1s-.45-1-1-1zM8 2a5.9 5.9 0 012.95.81l1.47-1.47A7.893 7.893 0 008 0c-.55 0-1 .45-1 1s.45 1 1 1zm2.71 6.71l5-5a1.003 1.003 0 00-1.42-1.42L10 6.59l-1.29-1.3a1.003 1.003 0 00-1.42 1.42l2 2c.18.18.43.29.71.29s.53-.11.71-.29zM16 8c0-.55-.06-1.08-.16-1.6l-1.87 1.87A5.966 5.966 0 0112 12.45V11c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1h-1.74A7.95 7.95 0 0016 8z"],
    "badge": ["M13.36 4.59c-.15-1.13.5-2.01 1.1-2.87L13.43.53c-1.72.88-4.12.65-5.63-.53-1.51 1.18-3.91 1.41-5.63.52l-1.03 1.2c.61.86 1.25 1.74 1.1 2.87-.3 2.29-2.45 4.17-1.32 6.68.45 1.14 1.44 1.9 2.72 2.2 1.56.36 3.52.72 4.16 2.53.64-1.81 2.6-2.16 4.16-2.54 1.28-.3 2.27-1.06 2.72-2.2 1.12-2.5-1.03-4.38-1.32-6.67z"],
    "ban-circle": ["M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3 9H5c-.55 0-1-.45-1-1s.45-1 1-1h6c.55 0 1 .45 1 1s-.45 1-1 1z"],
    "bank-account": ["M15.36 6.46l-.62-.14c-.31-1.12-.98-2.15-1.87-2.99l.4-1.77a.438.438 0 00-.49-.56c-.85.09-1.6.42-2.14.98-.84-.32-1.87-.51-2.85-.51-2.49 0-4.63 1.17-5.92 2.89-.18-.04-.36-.09-.53-.09-.76 0-1.34.61-1.34 1.4 0 .56.31 1.03.76 1.26-.05.33-.09.7-.09 1.07 0 1.68.71 3.17 1.83 4.34l-.27 1.59c-.09.56.35 1.07.89 1.07h.58c.45 0 .8-.33.89-.79l.04-.37c.94.42 2 .7 3.16.7 1.11 0 2.23-.23 3.16-.7l.05.37c.09.47.45.79.89.79h.58c.53 0 .98-.51.89-1.07l-.27-1.54c.62-.61 1.07-1.35 1.38-2.15l.8-.19c.4-.09.71-.47.71-.93V7.4c.09-.47-.22-.84-.62-.94zM12 8c-.6 0-1-.7-1-1.5S11.4 5 12 5s1 .7 1 1.5S12.6 8 12 8zM6.21 4.92c-.41.2-.91.04-1.12-.36-.21-.4-.04-.88.37-1.07 1.35-.65 2.73-.65 4.08 0 .41.2.58.68.37 1.07-.21.4-.71.56-1.12.36-.87-.43-1.71-.43-2.58 0z"],
    "barcode": ["M0 14h2V2H0v12zm6 0h1V2H6v12zm2 0h1V2H8v12zm-5 0h2V2H3v12zM15 2v12h1V2h-1zm-5 12h1V2h-1v12zm2 0h2V2h-2v12z"],
    "blank": [],
    "blocked-person": ["M9.39 12.69c-1.2-.53-1.04-.85-1.08-1.29-.01-.07-.01-.13-.02-.2.41-.37.75-.87.97-1.44 0 0 .01-.03.01-.04.05-.13.09-.26.13-.39.27-.06.43-.36.5-.63.01-.03.03-.08.05-.12C8.18 7.8 6.94 6.04 6.94 4c0-.32.04-.62.09-.92-.17-.03-.35-.08-.51-.08-.65 0-1.37.2-1.88.59-.5.38-.87.92-1.05 1.51-.04.14-.07.27-.09.41-.09.48-.14 1.23-.14 1.74v.06c-.19.08-.36.27-.4.68-.03.31.1.59.16.7.06.28.23.59.51.64.04.14.08.27.13.39 0 .01.01.02.01.02v.01c.22.59.57 1.1.99 1.46 0 .06-.01.12-.01.17-.04.44.08.76-1.12 1.29-1.2.53-3.01 1.1-3.38 1.95C-.12 15.5.03 16 .03 16h12.96s.15-.5-.22-1.36c-.37-.85-2.18-1.42-3.38-1.95zM11.97 0C9.75 0 7.94 1.79 7.94 4s1.8 4 4.03 4S16 6.21 16 4s-1.8-4-4.03-4zM9.96 4c0-1.1.9-2 2.01-2 .37 0 .72.11 1.02.28l-2.75 2.73c-.17-.3-.28-.64-.28-1.01zm2.01 2c-.37 0-.72-.11-1.02-.28l2.75-2.73c.18.3.28.64.28 1.01.01 1.1-.9 2-2.01 2z"],
    "bold": ["M11.7 7c.2-.4.3-1 .3-1.5v-.4V5c0-.1 0-.2-.1-.3v-.1C11.4 3.1 10.1 2 8.5 2H4c-.5 0-1 .4-1 1v10c0 .5.4 1 1 1h5c2.2 0 4-1.8 4-4 0-1.2-.5-2.3-1.3-3zM6 5h2c.6 0 1 .4 1 1s-.4 1-1 1H6V5zm3 6H6V9h3c.6 0 1 .4 1 1s-.4 1-1 1z"],
    "book": ["M2 1v14c0 .55.45 1 1 1h1V0H3c-.55 0-1 .45-1 1zm11-1h-1v7l-2-2-2 2V0H5v16h8c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "bookmark": ["M11.2.01h-.15C11.03.01 11.02 0 11 0H5c-.02 0-.03.01-.05.01H4.8c-.44 0-.8.37-.8.82v14.75c0 .45.25.56.57.24l2.87-2.94c.31-.32.82-.32 1.13 0l2.87 2.94c.31.32.57.21.57-.24V.83C12 .38 11.64.01 11.2.01z"],
    "box": ["M6 10h4c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1zm9.93-4.37v-.02L13.94.63C13.78.26 13.42 0 13 0H3c-.42 0-.78.26-.93.63L.08 5.61l-.01.02C.03 5.74 0 5.87 0 6v9c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V6c0-.13-.03-.26-.07-.37zM9 2h3.32l1.2 3H9V2zM3.68 2H7v3H2.48l1.2-3zM14 14H2V7h12v7z"],
    "briefcase": ["M15 3.98h-3v-2c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v2H1c-.55 0-1 .45-1 1v4h3v-1h2v1h6v-1h2v1h3v-4c0-.55-.45-1-1-1zm-5 0H6v-1h4v1zm3 7h-2v-1H5v1H3v-1H0v4c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-4h-3v1z"],
    "bring-data": ["M14 14a1 1 0 010 2H2a1 1 0 010-2h12zM7.995 3.005c.55 0 1 .45 1 .999v5.584l1.29-1.288a1.002 1.002 0 011.42 1.419l-3 2.996a1.015 1.015 0 01-1.42 0l-3-2.997A1.002 1.002 0 015.705 8.3l1.29 1.29V4.013c0-.55.45-1.009 1-1.009zM14 0a1 1 0 110 2 1 1 0 010-2zm-3 0a1 1 0 110 2 1 1 0 010-2zM8 0a1 1 0 110 2 1 1 0 010-2zM5 0a1 1 0 110 2 1 1 0 010-2zM2 0a1 1 0 110 2 1 1 0 010-2z"],
    "build": ["M15.39 12.41L7.7 6l1.07-1.1c.34-.34-.12-.63.12-1.26.88-2.17 3.41-2.35 3.41-2.35s.36-.37.71-.72C9.74-.81 7.53.53 6.54 1.4L3.12 4.9l-.71.72c-.39.4-.39 1.05 0 1.45l-.7.72c-.39-.4-1.02-.4-1.41 0s-.39 1.05 0 1.45l1.41 1.45c.39.4 1.02.4 1.41 0s.39-1.05 0-1.45l.71-.72c.39.4 1.02.4 1.41 0l.8-.82 6.39 7.67c.82.82 2.14.82 2.96 0 .81-.82.81-2.15 0-2.96z"],
    "calculator": ["M13 0H3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM6 14H4v-2h2v2zm0-3H4V9h2v2zm0-3H4V6h2v2zm3 6H7v-2h2v2zm0-3H7V9h2v2zm0-3H7V6h2v2zm3 6h-2V9h2v5zm0-6h-2V6h2v2zm0-3H4V2h8v3z"],
    "calendar": ["M11 3c.6 0 1-.5 1-1V1c0-.6-.4-1-1-1s-1 .4-1 1v1c0 .5.4 1 1 1zm3-2h-1v1c0 1.1-.9 2-2 2s-2-.9-2-2V1H6v1c0 1.1-.9 2-2 2s-2-.9-2-2V1H1c-.6 0-1 .5-1 1v12c0 .6.4 1 1 1h13c.6 0 1-.4 1-1V2c0-.6-.5-1-1-1zM5 13H2v-3h3v3zm0-4H2V6h3v3zm4 4H6v-3h3v3zm0-4H6V6h3v3zm4 4h-3v-3h3v3zm0-4h-3V6h3v3zM4 3c.6 0 1-.5 1-1V1c0-.6-.4-1-1-1S3 .4 3 1v1c0 .5.4 1 1 1z"],
    "camera": ["M15 3h-2.59L10.7 1.29A.956.956 0 0010 1H6c-.28 0-.53.11-.71.29L3.59 3H1c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h2.56c1.1 1.22 2.67 2 4.44 2s3.34-.78 4.44-2H15c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM3 6H1V5h2v1zm5 6c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"],
    "caret-down": ["M12 6.5c0-.28-.22-.5-.5-.5h-7a.495.495 0 00-.37.83l3.5 4c.09.1.22.17.37.17s.28-.07.37-.17l3.5-4c.08-.09.13-.2.13-.33z"],
    "caret-left": ["M9.5 4c-.13 0-.24.05-.33.13l-4 3.5c-.1.09-.17.22-.17.37s.07.28.17.37l4 3.5a.495.495 0 00.83-.37v-7c0-.28-.22-.5-.5-.5z"],
    "caret-right": ["M11 8c0-.15-.07-.28-.17-.37l-4-3.5A.495.495 0 006 4.5v7a.495.495 0 00.83.37l4-3.5c.1-.09.17-.22.17-.37z"],
    "caret-up": ["M11.87 9.17s.01 0 0 0l-3.5-4C8.28 5.07 8.15 5 8 5s-.28.07-.37.17l-3.5 4a.495.495 0 00.37.83h7a.495.495 0 00.37-.83z"],
    "cell-tower": ["M8.97 6.76c-.01-.05-.04-.08-.06-.13-.02-.05-.03-.1-.05-.15.08-.14.14-.3.14-.48 0-.55-.45-1-1-1s-1 .45-1 1c0 .18.06.34.14.48-.03.05-.03.1-.05.15-.02.05-.05.08-.06.13l-2 8c-.13.54.19 1.08.73 1.21a.995.995 0 001.21-.73L7.53 13h.94l.56 2.24a1 1 0 001.94-.48l-2-8zM3.72 1.7C4.1 1.3 4.09.67 3.7.28S2.67-.09 2.28.3c-3.05 3.12-3.05 8.28 0 11.4a.996.996 0 101.43-1.39c-2.28-2.35-2.28-6.27.01-8.61zM11.6 3.2c-.44-.33-1.07-.24-1.4.2-.33.44-.24 1.07.2 1.4.43.32.53 1.96-.04 2.43-.42.35-.48.98-.13 1.41.35.42.98.48 1.41.13 1.59-1.33 1.39-4.5-.04-5.57z",
        "M13.72.3c-.39-.4-1.02-.4-1.41-.02s-.41 1.02-.03 1.42c2.29 2.34 2.29 6.26 0 8.6-.39.39-.38 1.03.02 1.41s1.03.38 1.41-.02c3.05-3.11 3.05-8.27.01-11.39zM5.4 7.23c-.57-.47-.47-2.11-.04-2.43.44-.33.53-.96.2-1.4s-.96-.53-1.4-.2c-1.44 1.07-1.63 4.24-.04 5.57.42.35 1.05.3 1.41-.13.35-.42.29-1.06-.13-1.41z"],
    "changes": ["M8.29 7.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3a1.003 1.003 0 00-1.42-1.42L13 7.59V1c0-.55-.45-1-1-1s-1 .45-1 1v6.59l-1.29-1.3a1.003 1.003 0 00-1.42 1.42zM14.5 13h-13c-.83 0-1.5.67-1.5 1.5S.67 16 1.5 16h13c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zM1 5c.28 0 .53-.11.71-.29L3 3.41V10c0 .55.45 1 1 1s1-.45 1-1V3.41L6.29 4.7c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-3-3C4.53.11 4.28 0 4 0s-.53.11-.71.29l-3 3A1.003 1.003 0 001 5z"],
    "chart": ["M0 15c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V9.4L0 11v4zm6-5.5V15c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-5l-1 1-3-1.5zM13 7l-1 1v7c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V7.88c-.26.07-.58.12-1 .12-1.96 0-2-1-2-1zm2-6h-3c-.55 0-1 .45-1 1s.45 1 1 1h.59L8.8 6.78 5.45 5.11v.01C5.31 5.05 5.16 5 5 5s-.31.05-.44.11V5.1l-4 2v.01C.23 7.28 0 7.61 0 8c0 .55.45 1 1 1 .16 0 .31-.05.44-.11v.01L5 7.12 8.55 8.9v-.01c.14.06.29.11.45.11.28 0 .53-.11.71-.29L14 4.41V5c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1z"],
    "chat": ["M6 10c-1.1 0-2-.9-2-2V3H1c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1v2a1.003 1.003 0 001.71.71L5.41 13H10c.55 0 1-.45 1-1v-1.17l-.83-.83H6zm9-10H6c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h4.59l2.71 2.71c.17.18.42.29.7.29.55 0 1-.45 1-1V9c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "chevron-backward": ["M7.41 8l3.29-3.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L6 6.59V4c0-.55-.45-1-1-1s-1 .45-1 1v8c0 .55.45 1 1 1s1-.45 1-1V9.41l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L7.41 8z"],
    "chevron-down": ["M12 5c-.28 0-.53.11-.71.29L8 8.59l-3.29-3.3a1.003 1.003 0 00-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l4-4A1.003 1.003 0 0012 5z"],
    "chevron-forward": ["M10 3c-.55 0-1 .45-1 1v2.59l-3.29-3.3a1.003 1.003 0 00-1.42 1.42L7.59 8 4.3 11.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L9 9.41V12c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "chevron-left": ["M7.41 8l3.29-3.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-4 4C5.11 7.47 5 7.72 5 8c0 .28.11.53.29.71l4 4a1.003 1.003 0 001.42-1.42L7.41 8z"],
    "chevron-right": ["M10.71 7.29l-4-4a1.003 1.003 0 00-1.42 1.42L8.59 8 5.3 11.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l4-4c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"],
    "chevron-up": ["M12.71 9.29l-4-4C8.53 5.11 8.28 5 8 5s-.53.11-.71.29l-4 4a1.003 1.003 0 001.42 1.42L8 7.41l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71z"],
    "circle": ["M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 14c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"],
    "circle-arrow-down": ["M11 7c-.28 0-.53.11-.71.29L9 8.59V5c0-.55-.45-1-1-1s-1 .45-1 1v3.59l-1.29-1.3a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3A1.003 1.003 0 0011 7zM8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"],
    "circle-arrow-left": ["M11 7H7.41L8.7 5.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-3 3C4.11 7.47 4 7.72 4 8c0 .28.11.53.29.71l3 3a1.003 1.003 0 001.42-1.42L7.41 9H11c.55 0 1-.45 1-1s-.45-1-1-1zM8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"],
    "circle-arrow-right": ["M8.71 4.29a1.003 1.003 0 00-1.42 1.42L8.59 7H5c-.55 0-1 .45-1 1s.45 1 1 1h3.59L7.3 10.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-3-3zM8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"],
    "circle-arrow-up": ["M8.71 4.29C8.53 4.11 8.28 4 8 4s-.53.11-.71.29l-3 3a1.003 1.003 0 001.42 1.42L7 7.41V11c0 .55.45 1 1 1s1-.45 1-1V7.41l1.29 1.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-3-3zM8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"],
    "citation": ["M15.02 5c0-1.66-1.34-3-3-3s-3 1.34-3 3a2.996 2.996 0 003.6 2.94C12.1 9.76 11.14 11 10.02 11c-.55 0-1 .45-1 1s.45 1 1 1c2.76 0 5-3.13 5-7 0-.2-.02-.39-.04-.58.01-.14.04-.28.04-.42zm-11-3c-1.66 0-3 1.34-3 3a2.996 2.996 0 003.6 2.94C4.1 9.76 3.14 11 2.02 11c-.55 0-1 .45-1 1s.45 1 1 1c2.76 0 5-3.13 5-7 0-.2-.02-.39-.04-.58.01-.14.04-.28.04-.42 0-1.66-1.35-3-3-3z"],
    "clean": ["M12 8l-1.2 2.796-2.8 1.2 2.8 1.197L12 16l1.2-2.807L16 12l-2.8-1.204zM5 0L3.5 3.5 0 4.995 3.5 6.5 5 10l1.5-3.5L10 5 6.5 3.5z"],
    "clipboard": ["M11 2c0-.55-.45-1-1-1h.22C9.88.4 9.24 0 8.5 0S7.12.4 6.78 1H7c-.55 0-1 .45-1 1v1h5V2zm2 0h-1v2H5V2H4c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1z"],
    "cloud": ["M12 6c-.03 0-.07 0-.1.01A5 5 0 002 7c0 .11.01.22.02.33A3.51 3.51 0 000 10.5C0 12.43 1.57 14 3.5 14H12c2.21 0 4-1.79 4-4s-1.79-4-4-4z"],
    "cloud-download": ["M11 11c-.28 0-.53.11-.71.29L9 12.59V8c0-.55-.45-1-1-1s-1 .45-1 1v4.59L5.71 11.3A.965.965 0 005 11a1.003 1.003 0 00-.71 1.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3A1.003 1.003 0 0011 11zm1-7c-.03 0-.07 0-.1.01A5 5 0 002 5c0 .11.01.22.02.33A3.51 3.51 0 000 8.5c0 1.41.84 2.61 2.03 3.17C2.2 10.17 3.46 9 5 9c.06 0 .13.02.19.02C5.07 8.7 5 8.36 5 8c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .36-.07.7-.19 1.02.06 0 .13-.02.19-.02 1.48 0 2.7 1.07 2.95 2.47A3.964 3.964 0 0016 8c0-2.21-1.79-4-4-4z"],
    "cloud-upload": ["M8.71 7.29C8.53 7.11 8.28 7 8 7s-.53.11-.71.29l-3 3a1.003 1.003 0 001.42 1.42L7 10.41V15c0 .55.45 1 1 1s1-.45 1-1v-4.59l1.29 1.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-3-3zM12 4c-.03 0-.07 0-.1.01A5 5 0 002 5c0 .11.01.22.02.33a3.495 3.495 0 00.07 6.37c-.05-.23-.09-.46-.09-.7 0-.83.34-1.58.88-2.12l3-3a2.993 2.993 0 014.24 0l3 3c.54.54.88 1.29.88 2.12 0 .16-.02.32-.05.47C15.17 10.78 16 9.5 16 8c0-2.21-1.79-4-4-4z"],
    "code": ["M15.71 7.29l-3-3a1.003 1.003 0 00-1.42 1.42L13.59 8l-2.29 2.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71zM5 5a1.003 1.003 0 00-1.71-.71l-3 3C.11 7.47 0 7.72 0 8c0 .28.11.53.29.71l3 3a1.003 1.003 0 001.42-1.42L2.41 8 4.7 5.71c.19-.18.3-.43.3-.71zm4-3c-.48 0-.87.35-.96.81l-2 10c-.01.06-.04.12-.04.19 0 .55.45 1 1 1 .48 0 .87-.35.96-.81l2-10c.01-.06.04-.12.04-.19 0-.55-.45-1-1-1z"],
    "code-block": ["M15 3h-2V2c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1v1H7V2c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v1H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm-8.29 8.29a1.003 1.003 0 01-1.42 1.42l-3-3C2.11 9.53 2 9.28 2 9s.11-.53.29-.71l3-3a1.003 1.003 0 011.42 1.42L4.41 9l2.3 2.29zm7-1.58l-3 3a1.003 1.003 0 01-1.42-1.42L11.59 9l-2.3-2.29a1.003 1.003 0 011.42-1.42l3 3c.18.18.29.43.29.71s-.11.53-.29.71z"],
    "cog": ["M15.19 6.39h-1.85c-.11-.37-.27-.71-.45-1.04l1.36-1.36c.31-.31.31-.82 0-1.13l-1.13-1.13a.803.803 0 00-1.13 0l-1.36 1.36c-.33-.17-.67-.33-1.04-.44V.79c0-.44-.36-.8-.8-.8h-1.6c-.44 0-.8.36-.8.8v1.86c-.39.12-.75.28-1.1.47l-1.3-1.3c-.3-.3-.79-.3-1.09 0L1.82 2.91c-.3.3-.3.79 0 1.09l1.3 1.3c-.2.34-.36.7-.48 1.09H.79c-.44 0-.8.36-.8.8v1.6c0 .44.36.8.8.8h1.85c.11.37.27.71.45 1.04l-1.36 1.36c-.31.31-.31.82 0 1.13l1.13 1.13c.31.31.82.31 1.13 0l1.36-1.36c.33.18.67.33 1.04.44v1.86c0 .44.36.8.8.8h1.6c.44 0 .8-.36.8-.8v-1.86c.39-.12.75-.28 1.1-.47l1.3 1.3c.3.3.79.3 1.09 0l1.09-1.09c.3-.3.3-.79 0-1.09l-1.3-1.3c.19-.35.36-.71.48-1.1h1.85c.44 0 .8-.36.8-.8v-1.6a.816.816 0 00-.81-.79zm-7.2 4.6c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"],
    "collapse-all": ["M7.29 6.71c.18.18.43.29.71.29s.53-.11.71-.29l4-4a1.003 1.003 0 00-1.42-1.42L8 4.59l-3.29-3.3a1.003 1.003 0 00-1.42 1.42l4 4zm1.42 2.58C8.53 9.11 8.28 9 8 9s-.53.11-.71.29l-4 4a1.003 1.003 0 001.42 1.42L8 11.41l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-4-4z"],
    "column-layout": ["M15 1H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zM4 13H2V3h2v10zm3 0H5V3h2v10zm7 0H8V3h6v10z"],
    "comment": ["M14 1H1c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h2v3a1.003 1.003 0 001.71.71L8.41 12H14c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zM3.5 8C2.67 8 2 7.33 2 6.5S2.67 5 3.5 5 5 5.67 5 6.5 4.33 8 3.5 8zm4 0C6.67 8 6 7.33 6 6.5S6.67 5 7.5 5 9 5.67 9 6.5 8.33 8 7.5 8zm4 0c-.83 0-1.5-.67-1.5-1.5S10.67 5 11.5 5s1.5.67 1.5 1.5S12.33 8 11.5 8z"],
    "comparison": ["M7.99-.01c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1s1-.45 1-1v-14c0-.55-.45-1-1-1zm-3 3h-4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1zm10 0h-4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1zm0 3h-4v-2h4v2zm0 3h-4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1zm0 3h-4v-2h4v2zm-10-3h-4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1z"],
    "compass": ["M12 8c0 .14-.03.27-.08.39l-3 6.99c-.15.37-.51.62-.92.62s-.77-.25-.92-.61l-3-6.99a1.006 1.006 0 010-.79l3-6.99C7.23.25 7.59 0 8 0s.77.25.92.61l3 6.99c.05.13.08.26.08.4zM8 3.54L6.09 8h3.82L8 3.54z"],
    "compressed": ["M15.93 5.63v-.02L13.94.63C13.78.26 13.42 0 13 0H3c-.42 0-.78.26-.93.63L.08 5.61l-.01.02C.03 5.74 0 5.87 0 6v9c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V6c0-.13-.03-.26-.07-.37zM9 2h3.32l1.2 3H9V2zM3.68 2H7v3H2.48l1.2-3zM14 14H2V7h5v2.59l-1.29-1.3a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3a1.003 1.003 0 00-1.42-1.42L9 9.59V7h5v7z"],
    "confirm": ["M8.7 4.29a.965.965 0 00-.71-.3 1.003 1.003 0 00-.71 1.71l2 2c.18.18.43.29.71.29s.53-.11.71-.29l5-5a1.003 1.003 0 00-1.42-1.42l-4.29 4.3L8.7 4.29zm5.22 3.01c.03.23.07.45.07.69 0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6c.81 0 1.59.17 2.3.46l1.5-1.5A7.998 7.998 0 00-.01 7.99c0 4.42 3.58 8 8 8s8-3.58 8-8c0-.83-.13-1.64-.36-2.39l-1.71 1.7z"],
    "console": ["M15 15H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zM14 5H2v8h12V5zM4 6c.28 0 .53.11.71.29l2 2c.18.18.29.43.29.71s-.11.53-.29.71l-2 2a1.003 1.003 0 01-1.42-1.42L4.59 9l-1.3-1.29A1.003 1.003 0 014 6zm5 4h3c.55 0 1 .45 1 1s-.45 1-1 1H9c-.55 0-1-.45-1-1s.45-1 1-1z"],
    "contrast": ["M15.2 6.4h-1.44c-.13-.47-.32-.92-.56-1.34L14.26 4c.31-.31.31-.82 0-1.13l-1.13-1.13a.803.803 0 00-1.13 0L10.94 2.8c-.42-.24-.86-.42-1.34-.56V.8c0-.44-.36-.8-.8-.8H7.2c-.44 0-.8.36-.8.8v1.44c-.5.14-.96.34-1.4.59l-1-1c-.3-.3-.79-.3-1.09 0L1.83 2.91c-.3.3-.3.79 0 1.09l1 1c-.25.44-.45.9-.59 1.4H.8c-.44 0-.8.36-.8.8v1.6c0 .44.36.8.8.8h1.44c.13.47.32.92.56 1.34L1.74 12c-.31.31-.31.82 0 1.13l1.13 1.13c.31.31.82.31 1.13 0l1.06-1.06c.42.24.86.42 1.34.56v1.44c0 .44.36.8.8.8h1.6c.44 0 .8-.36.8-.8v-1.44c.5-.14.96-.33 1.4-.59l1 1c.3.3.79.3 1.09 0l1.09-1.09c.3-.3.3-.79 0-1.09l-1-1c.25-.43.45-.9.59-1.4h1.44c.44 0 .8-.36.8-.8V7.2a.818.818 0 00-.81-.8zM8 12c-2.21 0-4-1.79-4-4s1.79-4 4-4v8z"],
    "control": ["M13 8H8v5h5V8zm0-5H8v4h5V3zm2-3H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 14H2V2h12v12zM7 3H3v10h4V3z"],
    "credit-card": ["M14.99 2.95h-14c-.55 0-1 .45-1 1v1h16v-1c0-.55-.45-1-1-1zm-15 10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-6h-16v6zm5.5-2h5c.28 0 .5.22.5.5s-.22.5-.5.5h-5c-.28 0-.5-.22-.5-.5s.23-.5.5-.5zm-3 0h1c.28 0 .5.22.5.5s-.22.5-.5.5h-1c-.28 0-.5-.22-.5-.5s.23-.5.5-.5z"],
    "cross": ["M9.41 8l3.29-3.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L8 6.59l-3.29-3.3a1.003 1.003 0 00-1.42 1.42L6.59 8 3.3 11.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L8 9.41l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L9.41 8z"],
    "crown": ["M2 6l3 2 3-4 3 4 3-2-1 6H3L2 6zm6-5a1 1 0 110 2 1 1 0 010-2zM1 3a1 1 0 110 2 1 1 0 010-2zm14 0a1 1 0 110 2 1 1 0 010-2zM3 13h10v2H3v-2z"],
    "cube": ["M14.194 3.54L8 7.41 1.806 3.54 7.504.283a1 1 0 01.992 0l5.698 3.255zm.75.71a1 1 0 01.056.33v6.84a1 1 0 01-.504.868L8.5 15.714V8.277l6.444-4.027zm-13.888 0L7.5 8.277v7.437l-5.996-3.426A1 1 0 011 11.42V4.58a1 1 0 01.056-.33z"],
    "cube-add": ["M14 2h1a1 1 0 010 2h-1v1a1 1 0 01-2 0V4h-1a1 1 0 010-2h1V1a1 1 0 012 0v1zM9.136.65a3.001 3.001 0 00.992 5.222c.018.058.038.115.059.172L8 7.41 1.806 3.54 7.504.283a1 1 0 01.992 0l.64.365zM15 7.235v4.184a1 1 0 01-.504.868L8.5 15.714V8.277l2.187-1.367A2.994 2.994 0 0013 8c.768 0 1.47-.289 2-.764zM1.056 4.25L7.5 8.277v7.437l-5.996-3.426A1 1 0 011 11.42V4.58a1 1 0 01.056-.33z"],
    "cube-remove": ["M10.365 5.933L8 7.41 1.806 3.54 7.504.283a1 1 0 01.992 0l.64.365a3.001 3.001 0 001.228 5.283zM15 6v5.42a1 1 0 01-.504.868L8.5 15.714V8.277L12.143 6H15zM1.056 4.25L7.5 8.277v7.437l-5.996-3.426A1 1 0 011 11.42V4.58a1 1 0 01.056-.33zM11 2h4a1 1 0 010 2h-4a1 1 0 010-2z"],
    "curved-range-chart": ["M15 12H3.12l1.81-1.39c1.73 1.01 5.53-.03 9.08-2.61l-1.22-1.5C10.3 8.3 7.86 9.37 6.65 9.29L14.3 3.4l-.6-.8-7.83 6.03c-.01-1.07 1.8-3.19 4.47-5.13L9.12 2C5.38 4.7 3.34 8.1 4.25 9.87L2 11.6V3c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "cut": ["M13 2s.71-1.29 0-2L8.66 5.07l1.05 1.32L13 2zm.07 8c-.42 0-.82.09-1.18.26L3.31 0c-.69.71 0 2 0 2l3.68 5.02-2.77 3.24A2.996 2.996 0 000 13c0 1.66 1.34 3 3 3s3-1.34 3-3c0-.46-.11-.89-.29-1.27L8.1 8.54l2.33 3.19c-.18.39-.29.82-.29 1.27 0 1.66 1.31 3 2.93 3S16 14.66 16 13s-1.31-3-2.93-3zM3 14c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10.07 0c-.54 0-.98-.45-.98-1s.44-1 .98-1 .98.45.98 1-.44 1-.98 1z"],
    "dashboard": ["M5 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM4 7c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4-2c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-2 6c0 1.1.9 2 2 2s2-.9 2-2c0-.53-2-5-2-5s-2 4.47-2 5zM8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm4-9c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1zm0 2c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"],
    "data-lineage": ["M1.067 0C.477 0 0 .478 0 1.067V3.2c0 .59.478 1.067 1.067 1.067h2.24a5.342 5.342 0 002.9 3.734 5.337 5.337 0 00-2.9 3.733h-2.24C.477 11.733 0 12.21 0 12.8v2.133C0 15.523.478 16 1.067 16H6.4c.59 0 1.067-.478 1.067-1.067V12.8c0-.59-.478-1.067-1.067-1.067H4.401a4.27 4.27 0 013.92-3.194l.212-.006V9.6c0 .59.478 1.067 1.067 1.067h5.333c.59 0 1.067-.478 1.067-1.067V6.4c0-.59-.478-1.067-1.067-1.067H9.6c-.59 0-1.067.478-1.067 1.067v1.067a4.268 4.268 0 01-4.132-3.2H6.4c.59 0 1.067-.478 1.067-1.067V1.067C7.467.477 6.989 0 6.4 0H1.067z"],
    "database": ["M8 4c3.31 0 6-.9 6-2s-2.69-2-6-2C4.68 0 2 .9 2 2s2.68 2 6 2zm-6-.48V8c0 1.1 2.69 2 6 2s6-.9 6-2V3.52C12.78 4.4 10.56 5 8 5s-4.78-.6-6-1.48zm0 6V14c0 1.1 2.69 2 6 2s6-.9 6-2V9.52C12.78 10.4 10.56 11 8 11s-4.78-.6-6-1.48z"],
    "delete": ["M11.99 4.99a1.003 1.003 0 00-1.71-.71l-2.29 2.3L5.7 4.29a.965.965 0 00-.71-.3 1.003 1.003 0 00-.71 1.71l2.29 2.29-2.29 2.29A1.003 1.003 0 005.7 11.7l2.29-2.29 2.29 2.29a1.003 1.003 0 001.42-1.42L9.41 7.99 11.7 5.7c.18-.18.29-.43.29-.71zm-4-5c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.68 6-6 6z"],
    "delta": ["M8 0L0 16h16L8 0zM7 5l5 10H2L7 5z"],
    "derive-column": ["M6.08 6.67h-.84c.24-.92.56-1.6.96-2.03.24-.27.48-.4.71-.4.05 0 .08.01.11.04s.04.06.04.1c0 .04-.03.11-.1.21-.06.1-.1.2-.1.29 0 .13.05.24.15.33.1.09.23.14.39.14.17 0 .31-.06.42-.17A.58.58 0 008 4.73c0-.22-.09-.39-.26-.53-.17-.13-.44-.2-.81-.2-.59 0-1.12.16-1.59.48-.48.32-.93.85-1.36 1.59-.15.26-.29.42-.42.49s-.35.11-.64.1l-.19.65h.81l-1.19 4.37c-.2.72-.33 1.16-.4 1.33-.1.24-.26.45-.46.62-.08.07-.18.1-.3.1-.03 0-.06-.01-.08-.03l-.03-.04c0-.02.03-.06.09-.11.06-.06.09-.14.09-.26 0-.13-.05-.23-.14-.32a.6.6 0 00-.4-.13c-.21 0-.38.05-.51.16s-.21.25-.21.4c0 .16.08.3.23.42.16.12.4.18.74.18.53 0 .99-.13 1.4-.39.41-.26.76-.65 1.07-1.19.3-.54.62-1.4.94-2.59l.68-2.53h.82l.2-.63zM15 0H8c-.55 0-1 .45-1 1v2h2V2h5v12H9v-1H7v2c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM8.3 9.94c.18.52.33.89.46 1.13.13.24.28.4.44.51.17.1.37.16.62.16.24 0 .49-.08.74-.25.33-.21.66-.58 1.01-1.09l-.21-.11c-.23.31-.41.5-.52.57a.44.44 0 01-.26.07c-.12 0-.24-.07-.36-.21-.2-.24-.46-.91-.8-2 .3-.49.55-.81.75-.96.15-.11.3-.16.47-.16.06 0 .17.02.34.06.16.04.31.06.43.06.17 0 .31-.06.43-.17.1-.11.16-.25.16-.43 0-.19-.06-.33-.17-.44-.12-.11-.28-.16-.49-.16-.19 0-.37.04-.54.13-.17.09-.39.27-.65.56-.2.21-.48.58-.87 1.11-.15-.66-.41-1.26-.78-1.81l-2.05.33-.04.21c.15-.03.28-.04.39-.04.2 0 .37.08.5.25.21.26.5 1.03.88 2.33-.29.37-.49.61-.6.72-.18.18-.33.3-.44.36-.09.04-.19.07-.3.07-.09 0-.23-.04-.42-.13a.866.866 0 00-.36-.09c-.2 0-.36.06-.49.18a.59.59 0 00-.19.46c0 .17.06.32.18.43.12.11.28.16.48.16.2 0 .38-.04.55-.11.17-.08.39-.24.65-.49.24-.27.6-.66 1.06-1.21z"],
    "desktop": ["M15 0H1C.45 0 0 .45 0 1v10c0 .55.45 1 1 1h4.75l-.5 2H4c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1h-1.25l-.5-2H15c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 10H2V2h12v8z"],
    "diagram-tree": ["M15 8v3h-2V9H9v2H7V9H3v2H1V8a1 1 0 011-1h5V5h2v2h5a1 1 0 011 1zM1 12h2a1 1 0 011 1v2a1 1 0 01-1 1H1a1 1 0 01-1-1v-2a1 1 0 011-1zm12 0h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 011-1zm-6 0h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1v-2a1 1 0 011-1zM7 0h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V1a1 1 0 011-1z"],
    "direction-left": ["M16 1.99l-16 6 16 6-4-6z"],
    "direction-right": ["M16 7.99l-16-6 4 6-4 6z"],
    "disable": ["M7.99-.01c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-6 8c0-3.31 2.69-6 6-6 1.3 0 2.49.42 3.47 1.12l-8.35 8.35c-.7-.98-1.12-2.17-1.12-3.47zm6 6c-1.3 0-2.49-.42-3.47-1.12l8.35-8.35c.7.98 1.12 2.17 1.12 3.47 0 3.32-2.68 6-6 6z"],
    "document": ["M9 0H3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V5L9 0zm3 14H4V2h4v4h4v8z"],
    "document-open": ["M6 12c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1h1.59L1.3 12.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L6 10.41V12zm4-12H4c-.55 0-1 .45-1 1v4h2V2h4v4h4v8H5.24l-1.8 1.8c.16.12.35.2.56.2h10c.55 0 1-.45 1-1V5l-5-5z"],
    "document-share": ["M10 14H2V2h4v4h1c0-.83.36-1.55.91-2.09l-.03-.03.9-.9C8.3 2.45 8 1.77 8 1L7 0H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V8.22c-.53.48-1.23.78-2 .78v5zm5-14h-4c-.55 0-1 .45-1 1s.45 1 1 1h1.59l-3.3 3.29a1.003 1.003 0 001.42 1.42L14 3.41V5c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "dollar": ["M12.83 9.51c-.1-.3-.25-.58-.45-.84s-.45-.49-.75-.7c-.3-.2-.65-.36-1.05-.48-.16-.04-.43-.11-.8-.2-.35-.09-.73-.18-1.12-.28-.39-.1-.74-.19-1.06-.27-.31-.08-.49-.12-.54-.13-.43-.12-.78-.29-1.05-.52-.27-.23-.4-.55-.4-.95 0-.29.07-.53.21-.72.14-.19.32-.34.54-.46.22-.11.46-.19.72-.24.26-.05.52-.08.77-.08.74 0 1.35.15 1.83.46.48.3.75.83.81 1.56h2.14c0-.6-.13-1.13-.38-1.58-.25-.45-.59-.84-1.02-1.15-.43-.31-.93-.54-1.49-.7-.24-.06-.49-.1-.75-.14V1c0-.55-.45-1-1-1s-1 .45-1 1v1.08c-.23.03-.46.07-.68.13-.54.13-1.02.34-1.44.61-.42.28-.76.63-1.02 1.05-.26.43-.39.93-.39 1.5 0 .3.04.59.13.88.09.29.23.56.44.82.21.26.48.49.83.7.35.21.79.38 1.31.51.85.21 1.56.38 2.14.52.58.13 1.08.28 1.52.42.25.09.48.23.69.44.21.21.32.53.32.97 0 .21-.05.42-.14.63-.09.21-.24.39-.45.55-.21.16-.47.29-.81.39-.33.1-.73.15-1.2.15-.43 0-.84-.05-1.21-.14-.37-.09-.7-.24-.99-.43-.29-.2-.51-.45-.67-.76-.16-.31-.24-.68-.24-1.12H3c.01.71.15 1.32.43 1.84.27.52.64.94 1.1 1.27.46.33.99.58 1.61.74.27.07.56.12.85.16V15c0 .55.45 1 1 1s1-.45 1-1v-1.05c.3-.03.61-.08.9-.15.58-.13 1.1-.34 1.56-.63.46-.29.83-.66 1.11-1.11.28-.45.42-1 .42-1.64 0-.31-.05-.61-.15-.91z"],
    "dot": ["M8 5a3 3 0 100 6 3 3 0 100-6z"],
    "double-caret-horizontal": ["M13.71 7.29l-3-3A1.003 1.003 0 009 5v6a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71zM6 4c-.28 0-.53.11-.71.29l-3 3C2.11 7.47 2 7.72 2 8c0 .28.11.53.29.71l3 3A1.003 1.003 0 007 11V5c0-.55-.45-1-1-1z"],
    "double-caret-vertical": ["M5 7h6a1.003 1.003 0 00.71-1.71l-3-3C8.53 2.11 8.28 2 8 2s-.53.11-.71.29l-3 3A1.003 1.003 0 005 7zm6 2H5a1.003 1.003 0 00-.71 1.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3A1.003 1.003 0 0011 9z"],
    "double-chevron-down": ["M7.29 8.71c.18.18.43.29.71.29s.53-.11.71-.29l4-4a1.003 1.003 0 00-1.42-1.42L8 6.59l-3.29-3.3a1.003 1.003 0 00-1.42 1.42l4 4zM12 8c-.28 0-.53.11-.71.29L8 11.59l-3.29-3.3a1.003 1.003 0 00-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l4-4A1.003 1.003 0 0012 8z"],
    "double-chevron-left": ["M4.41 8L7.7 4.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-4 4C2.11 7.47 2 7.72 2 8c0 .28.11.53.29.71l4 4a1.003 1.003 0 001.42-1.42L4.41 8zm5 0l3.29-3.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-4 4C7.11 7.47 7 7.72 7 8c0 .28.11.53.29.71l4 4a1.003 1.003 0 001.42-1.42L9.41 8z"],
    "double-chevron-right": ["M9 8c0-.28-.11-.53-.29-.71l-4-4a1.003 1.003 0 00-1.42 1.42L6.59 8 3.3 11.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l4-4C8.89 8.53 9 8.28 9 8zm4.71-.71l-4-4a1.003 1.003 0 00-1.42 1.42L11.59 8 8.3 11.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l4-4c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"],
    "double-chevron-up": ["M4 8c.28 0 .53-.11.71-.29L8 4.41l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-4-4C8.53 2.11 8.28 2 8 2s-.53.11-.71.29l-4 4A1.003 1.003 0 004 8zm4.71-.71C8.53 7.11 8.28 7 8 7s-.53.11-.71.29l-4 4a1.003 1.003 0 001.42 1.42L8 9.41l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-4-4z"],
    "doughnut-chart": ["M11.86 7h4.05C15.45 3.39 12.61.52 9 .07v4.07A4 4 0 0111.86 7zM12 8c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4V0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8h-4z"],
    "download": ["M7.99-.01c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zM11.7 9.7l-3 3c-.18.18-.43.29-.71.29s-.53-.11-.71-.29l-3-3A1.003 1.003 0 015.7 8.28l1.29 1.29V3.99c0-.55.45-1 1-1s1 .45 1 1v5.59l1.29-1.29a1.003 1.003 0 011.71.71c0 .27-.11.52-.29.7z"],
    "drag-handle-horizontal": ["M2 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm8-2c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 2c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-4-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM6 5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"],
    "drag-handle-vertical": ["M6 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4-6c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zM6 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"],
    "draw": ["M14.9 11c-.3 0-.5.1-.7.3l-3 3c-.2.2-.3.4-.3.7 0 .6.5 1 1 1 .3 0 .5-.1.7-.3l3-3c.2-.2.3-.4.3-.7 0-.5-.4-1-1-1zm-1-1v-.2l-1-5c-.1-.3-.3-.6-.6-.7l-11-4-.3.3 5.8 5.8c.2-.1.4-.2.6-.2.8 0 1.5.7 1.5 1.5S8.3 9 7.4 9s-1.5-.7-1.5-1.5c0-.2.1-.4.2-.6L.3 1.1l-.3.3 4 11c.1.3.4.6.7.6l5 1h.2c.3 0 .5-.1.7-.3l3-3c.2-.2.3-.4.3-.7z"],
    "drive-time": ["M15.12 4.76h-1.05l-.76-2.12c-.19-.53-.76-1.08-1.27-1.24 0 0-1.32-.4-4.04-.4-2.72 0-4.04.4-4.04.4-.5.16-1.07.71-1.26 1.24l-.77 2.12H.88c-.48 0-.88.42-.88.94s.4.94.88.94h.38L1 7c-.03.69 0 1.44 0 2v5c0 .66.38 1 1 1s1-.34 1-1v-1h10v1c0 .66.38 1 1 1s1-.34 1-1V9c0-.56-.01-1.37 0-2l-.26-.37h.38c.48 0 .88-.42.88-.93 0-.52-.4-.94-.88-.94zM5 10H3V8h2v2zm8 0h-2V8h2v2zm0-4H3c-.18 0-.06-.82 0-1l.73-1.63C3.79 3.19 3.82 3 4 3h8c.18 0 .21.19.27.37L13 5c.06.18.18 1 0 1z"],
    "duplicate": ["M15 0H5c-.55 0-1 .45-1 1v2h2V2h8v7h-1v2h2c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-4 4H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm-1 10H2V6h8v8z"],
    "edit": ["M3.25 10.26l2.47 2.47 6.69-6.69-2.46-2.48-6.7 6.7zM.99 14.99l3.86-1.39-2.46-2.44-1.4 3.83zm12.25-14c-.48 0-.92.2-1.24.51l-1.44 1.44 2.47 2.47 1.44-1.44c.32-.32.51-.75.51-1.24.01-.95-.77-1.74-1.74-1.74z"],
    "eject": ["M4 9h8a1.003 1.003 0 00.71-1.71l-4-4C8.53 3.11 8.28 3 8 3s-.53.11-.71.29l-4 4A1.003 1.003 0 004 9zm8 1H4c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1z"],
    "endorsed": ["M15.86 7.5l-.81-1.42V4.5c0-.36-.19-.68-.49-.87l-1.37-.8-.81-1.41c-.19-.31-.51-.49-.86-.49H9.89L8.5.14a.948.948 0 00-1 0l-1.39.8H4.52a1 1 0 00-.86.49l-.8 1.37-1.44.83c-.3.19-.49.51-.49.87v1.65l-.8 1.37c-.08.15-.13.32-.13.49s.05.34.14.49l.8 1.37v1.65c0 .36.19.68.49.87l1.42.81.8 1.37c.19.31.51.49.86.49H6.1l1.39.8c.15.09.32.14.48.14s.34-.05.49-.14l1.39-.8h1.63a1 1 0 00.86-.49l.81-1.41 1.37-.8c.3-.19.49-.51.49-.87V9.93l.81-1.42a.89.89 0 00.04-1.01zm-4.12-.82l-4.01 4.01c-.18.18-.43.29-.71.29s-.53-.11-.71-.29l-2-2c-.18-.19-.3-.44-.3-.71a1.003 1.003 0 011.71-.71l1.3 1.3 3.3-3.3a1.003 1.003 0 011.71.71.95.95 0 01-.29.7z"],
    "envelope": ["M0 3.06v9.88L4.94 8 0 3.06zM14.94 2H1.06L8 8.94 14.94 2zm-6.41 8.53c-.14.14-.32.22-.53.22s-.39-.08-.53-.22L6 9.06 1.06 14h13.88L10 9.06l-1.47 1.47zM11.06 8L16 12.94V3.06L11.06 8z"],
    "equals": ["M3 5h10a1 1 0 010 2H3a1 1 0 110-2zm0 4h10a1 1 0 010 2H3a1 1 0 010-2z"],
    "eraser": ["M8.06 13.91l7.63-7.44c.41-.4.41-1.05 0-1.45L10.86.3c-.41-.4-1.08-.4-1.49 0L.31 9.13c-.41.4-.41 1.05 0 1.45l5.58 5.44h8.12v-.01c.55 0 1-.45 1-1s-.45-1-1-1H7.96l.1-.1zm-2.17.06L1.67 9.85l4.22-4.11 4.22 4.11-4.22 4.12z"],
    "error": ["M7.99-.01c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13h-2v-2h2v2zm0-3h-2v-7h2v7z"],
    "euro": ["M6.52 3.18c.51-.27 1.12-.4 1.83-.4.48 0 .91.06 1.27.18.37.12.68.29.96.51.18.14.3.33.44.51l1.53-1.53c-.12-.11-.23-.22-.36-.32a5.61 5.61 0 00-1.74-.83c-.66-.2-1.36-.3-2.1-.3-.99 0-1.88.18-2.66.53-.79.35-1.45.82-2 1.41-.55.58-.96 1.27-1.26 2.06H2c-.55 0-1 .45-1 1s.45 1 1 1h.04c-.01.17-.04.33-.04.5 0 .17.03.33.04.5H2c-.55 0-1 .45-1 1s.45 1 1 1h.43c0 .01 0 .02.01.02a6.2 6.2 0 001.25 2.07 5.77 5.77 0 002 1.4c.78.34 1.67.51 2.66.51.81 0 1.54-.12 2.21-.36.67-.24 1.25-.59 1.75-1.03l.03-.03-1.55-1.33c-.01.01-.02.03-.03.04-.29.3-.63.53-1.02.69-.4.17-.85.25-1.37.25-.71 0-1.32-.13-1.83-.4s-.93-.62-1.25-1.07c-.19-.24-.34-.49-.46-.76H9c.55 0 1-.45 1-1s-.45-1-1-1H4.35c-.01-.17-.03-.33-.03-.5 0-.17.02-.34.03-.5H10c.55 0 1-.45 1-1s-.45-1-1-1H4.83c.13-.27.27-.52.44-.76.32-.44.74-.8 1.25-1.06zM14 8.98v0z"],
    "exchange": ["M1.99 5.99c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.89-2-2-2zm4.15 1.86a.495.495 0 10.7-.7L5.7 5.99h5.79c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H5.7l1.15-1.15a.495.495 0 10-.7-.7l-2 2c-.1.09-.16.21-.16.35s.06.26.15.35l2 2.01zm7.85-1.86c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.89-2-2-2zM9.85 8.14a.533.533 0 00-.36-.15.495.495 0 00-.35.85l1.15 1.15h-5.8c-.28 0-.5.22-.5.5s.22.5.5.5h5.79l-1.15 1.15a.495.495 0 10.7.7l2-2c.09-.09.15-.22.15-.35s-.06-.26-.15-.35l-1.98-2z"],
    "exclude-row": ["M0 10a1.003 1.003 0 001.71.71L3 9.41l1.29 1.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L4.41 8 5.7 6.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L3 6.59l-1.29-1.3A1.003 1.003 0 00.29 6.71L1.59 8 .29 9.29C.11 9.47 0 9.72 0 10zm1-7h14c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm14 10H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zm-1-7H9c-1.1 0-2 .9-2 2s.9 2 2 2h5c1.1 0 2-.9 2-2s-.9-2-2-2z"],
    "expand-all": ["M4 7c.28 0 .53-.11.71-.29L8 3.41l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-4-4C8.53 1.11 8.28 1 8 1s-.53.11-.71.29l-4 4A1.003 1.003 0 004 7zm8 2c-.28 0-.53.11-.71.29L8 12.59l-3.29-3.3a1.003 1.003 0 00-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l4-4A1.003 1.003 0 0012 9z"],
    "export": ["M4 6c.28 0 .53-.11.71-.29L7 3.41V11c0 .55.45 1 1 1s1-.45 1-1V3.41l2.29 2.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-4-4C8.53.11 8.28 0 8 0s-.53.11-.71.29l-4 4A1.003 1.003 0 004 6zm11 5c-.55 0-1 .45-1 1v2H2v-2c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1z"],
    "eye-off": ["M16 7.97v-.02-.01-.02-.02a.672.672 0 00-.17-.36c-.49-.63-1.07-1.2-1.65-1.72l-3.16 2.26a2.978 2.978 0 01-2.98 2.9c-.31 0-.6-.06-.88-.15L5.09 12.3c.44.19.9.36 1.37.47.97.23 1.94.24 2.92.05.88-.17 1.74-.54 2.53-.98 1.25-.7 2.39-1.67 3.38-2.75.18-.2.37-.41.53-.62.09-.1.15-.22.17-.36v-.02-.02-.01-.02-.03c.01-.02.01-.03.01-.04zm-.43-4.17c.25-.18.43-.46.43-.8 0-.55-.45-1-1-1-.22 0-.41.08-.57.2l-.01-.01-2.67 1.91c-.69-.38-1.41-.69-2.17-.87a6.8 6.8 0 00-2.91-.05c-.88.18-1.74.54-2.53.99-1.25.7-2.39 1.67-3.38 2.75-.18.2-.37.41-.53.62-.23.29-.23.63-.01.92.51.66 1.11 1.25 1.73 1.79.18.16.38.29.56.44l-2.09 1.5.01.01c-.25.18-.43.46-.43.8 0 .55.45 1 1 1 .22 0 .41-.08.57-.2l.01.01 14-10-.01-.01zm-10.41 5a3.03 3.03 0 01-.11-.8 2.99 2.99 0 012.99-2.98c.62 0 1.19.21 1.66.53L5.16 8.8z"],
    "eye-on": ["M10.29 6.7c.18.18.43.29.71.29s.53-.11.71-.29l4-4c.17-.18.29-.43.29-.7a1.003 1.003 0 00-1.71-.71L11 4.58 9.71 3.29A.997.997 0 009 3c-.55 0-1 .44-1 1a1 1 0 00.3.7l1.99 2zM16 7.96v-.02-.01-.02-.02a.64.64 0 00-.17-.36c-.3-.4-.65-.76-1-1.12l-1.7 1.7c-.55.55-1.3.88-2.13.88-.06 0-.11-.01-.17-.02C10.42 10.15 9.32 11 8.01 11A3.005 3.005 0 016.4 5.46c-.24-.43-.39-.93-.39-1.46 0-.26.04-.5.1-.74-.7.2-1.37.5-2.01.86-1.26.7-2.4 1.68-3.4 2.77-.18.21-.36.41-.53.63-.22.29-.22.64 0 .93.51.67 1.12 1.27 1.73 1.81 1.33 1.17 2.85 2.15 4.53 2.55.97.23 1.95.24 2.92.05.89-.18 1.74-.54 2.54-.99 1.25-.71 2.4-1.69 3.39-2.78.18-.2.37-.41.54-.63.09-.1.15-.23.17-.37v-.02-.02-.01-.02-.03c.01-.01.01-.02.01-.03zM8.01 9c.48 0 .87-.35.96-.81a.55.55 0 01-.07-.09l-.02.01L7.8 7.03c-.45.1-.79.48-.79.96 0 .56.45 1.01 1 1.01z"],
    "eye-open": ["M8.002 7.003a1.003 1.003 0 000 2.005 1.003 1.003 0 000-2.005zm7.988.972v-.02-.01-.02-.02a.675.675 0 00-.17-.36c-.509-.673-1.118-1.264-1.737-1.806-1.328-1.173-2.846-2.155-4.523-2.546a6.702 6.702 0 00-2.925-.06c-.889.18-1.738.541-2.546.992C2.84 4.837 1.692 5.81.694 6.902c-.18.211-.36.411-.53.632a.742.742 0 000 .932c.51.672 1.119 1.264 1.738 1.805 1.328 1.173 2.846 2.156 4.523 2.547.968.23 1.947.24 2.925.04.889-.18 1.738-.542 2.546-.993 1.248-.712 2.397-1.684 3.395-2.777.18-.2.37-.411.54-.632.09-.1.149-.23.169-.36v-.02-.02-.01-.02-.03c0-.01-.01-.01-.01-.02zm-7.988 3.038a2.998 2.998 0 01-2.995-3.008 2.998 2.998 0 012.995-3.008 2.998 2.998 0 012.996 3.008 2.998 2.998 0 01-2.996 3.008z"],
    "fast-backward": ["M14 3c-.24 0-.44.09-.62.23l-.01-.01L9 6.72V4c0-.55-.45-1-1-1-.24 0-.44.09-.62.23v-.01l-5 4 .01.01C2.16 7.41 2 7.68 2 8s.16.59.38.77v.01l5 4 .01-.01c.17.14.37.23.61.23.55 0 1-.45 1-1V9.28l4.38 3.5.01-.01c.17.14.37.23.61.23.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "fast-forward": ["M15 8c0-.32-.16-.59-.38-.77l.01-.01-5-4-.01.01A.987.987 0 009 3c-.55 0-1 .45-1 1v2.72l-4.38-3.5v.01A.987.987 0 003 3c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1 .24 0 .44-.09.62-.23l.01.01L8 9.28V12c0 .55.45 1 1 1 .24 0 .44-.09.62-.23l.01.01 5-4-.01-.01c.22-.18.38-.45.38-.77z"],
    "feed": ["M1.99 11.99c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.89-2-2-2zm1-4c-.55 0-1 .45-1 1s.45 1 1 1c1.66 0 3 1.34 3 3 0 .55.45 1 1 1s1-.45 1-1c0-2.76-2.24-5-5-5zm0-4c-.55 0-1 .45-1 1s.45 1 1 1c3.87 0 7 3.13 7 7 0 .55.45 1 1 1s1-.45 1-1a9 9 0 00-9-9zm0-4c-.55 0-1 .45-1 1s.45 1 1 1c6.08 0 11 4.92 11 11 0 .55.45 1 1 1s1-.45 1-1c0-7.18-5.82-13-13-13z"],
    "feed-subscribed": ["M3 2c1.06 0 2.08.16 3.06.45.13-.71.52-1.32 1.05-1.76C5.82.25 4.44 0 3 0c-.55 0-1 .45-1 1s.45 1 1 1zM2 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8.32-6.33a.99.99 0 001.4 0l3.98-3.98c.19-.18.3-.42.3-.7 0-.55-.45-.99-1-.99-.28 0-.52.11-.7.29l-3.28 3.28-1.29-1.29a.99.99 0 00-.7-.29 1 1 0 00-1 .99c0 .27.11.52.29.7l2 1.99zm3.73.53l-.93.93-.02-.02c-.17.17-.35.33-.56.45C13.47 9.16 14 11.02 14 13c0 .55.45 1 1 1s1-.45 1-1c0-2.5-.73-4.82-1.95-6.8zM3 8c-.55 0-1 .45-1 1s.45 1 1 1c1.66 0 3 1.34 3 3 0 .55.45 1 1 1s1-.45 1-1c0-2.76-2.24-5-5-5zm5.91-.91l-.03.03-2-2 .03-.03c-.11-.11-.23-.2-.33-.33A8.9 8.9 0 003 4c-.55 0-1 .45-1 1s.45 1 1 1c3.87 0 7 3.13 7 7 0 .55.45 1 1 1s1-.45 1-1c0-1.87-.57-3.61-1.55-5.06-.61-.11-1.13-.42-1.54-.85z"],
    "film": ["M15 1h-5v2H6V1H1c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h5v-2h4v2h5c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zM4 13H2v-2h2v2zm0-3H2V8h2v2zm0-3H2V5h2v2zm0-3H2V2h2v2zm6 6H6V5h4v5zm4 3h-2v-2h2v2zm0-3h-2V8h2v2zm0-3h-2V5h2v2zm0-3h-2V2h2v2z"],
    "filter": ["M13.99.99h-12a1.003 1.003 0 00-.71 1.71l4.71 4.71V14a1.003 1.003 0 001.71.71l2-2c.18-.18.29-.43.29-.71V7.41L14.7 2.7a1.003 1.003 0 00-.71-1.71z"],
    "filter-keep": ["M15 10c-.28 0-.53.11-.71.29L12 12.59l-1.29-1.29A.965.965 0 0010 11a1.003 1.003 0 00-.71 1.71l2 2c.18.18.43.29.71.29s.53-.11.71-.29l3-3A1.003 1.003 0 0015 10zm-3-8c0-.55-.45-1-1-1H1a1.003 1.003 0 00-.71 1.71L4 6.41V12a1.003 1.003 0 001.71.71l2-2c.18-.18.29-.43.29-.71V6.41l3.71-3.71c.18-.17.29-.42.29-.7z"],
    "filter-list": ["M9 8c0 .55.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1h-5c-.55 0-1 .45-1 1zm3-6c0-.55-.45-1-1-1H1a1.003 1.003 0 00-.71 1.71L4 6.41V12a1.003 1.003 0 001.71.71l2-2c.18-.18.29-.43.29-.71V6.41l3.71-3.71c.18-.17.29-.42.29-.7zm3 8h-5c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1zm0 3h-5c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "filter-open": ["M15.707 10.293a1 1 0 010 1.414l-3 3c-.63.63-1.707.184-1.707-.707V8c0-.89 1.077-1.337 1.707-.707l3 3zM12 2c0 .28-.11.53-.29.7L8 6.41V10c0 .28-.11.53-.29.71l-2 2A1.003 1.003 0 014 12V6.41L.29 2.71A1.003 1.003 0 011 1h10c.55 0 1 .45 1 1z"],
    "filter-remove": ["M12 2c0-.55-.45-1-1-1H1a1.003 1.003 0 00-.71 1.71L4 6.41V12a1.003 1.003 0 001.71.71l2-2c.18-.18.29-.43.29-.71V6.41l3.71-3.71c.18-.17.29-.42.29-.7zm2.41 10l1.29-1.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L13 10.59 11.71 9.3A.965.965 0 0011 9a1.003 1.003 0 00-.71 1.71l1.3 1.29-1.29 1.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l1.29-1.3 1.29 1.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L14.41 12z"],
    "flag": ["M2.99 2.99c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1s1-.45 1-1v-11c0-.55-.45-1-1-1zm0-3c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm2 3.03v7.23c2.07-2.11 5.92 1.75 9 0V3.02c-3 2.07-6.94-2.03-9 0z"],
    "flame": ["M9.217 0c0 1.368.368 2.462 1.104 3.282C12.774 5.197 14 7.385 14 9.846c0 2.735-1.472 4.786-4.415 6.154 2.165-2.4 1.84-3.385-.368-6.4-2.342 1.2-1.967 2-1.592 3.6-.786 0-1.5 0-1.875-.4 0 .547.898 2 1.464 3.2-2.943-.82-6.092-5.744-4.988-6.154.736-.273 1.594-.137 2.575.41C3.575 5.333 5.047 1.915 9.217 0z"],
    "flash": ["M4 8c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1zm4-4c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1S7 .45 7 1v2c0 .55.45 1 1 1zM3.79 5.21a1.003 1.003 0 001.42-1.42l-1.5-1.5a1.003 1.003 0 00-1.42 1.42l1.5 1.5zm.71 5.29c-.28 0-.53.11-.71.29l-1.5 1.5a1.003 1.003 0 001.42 1.42l1.5-1.5a1.003 1.003 0 00-.71-1.71zm7-5c.28 0 .53-.11.71-.29l1.5-1.5a1.003 1.003 0 00-1.42-1.42l-1.5 1.5a1.003 1.003 0 00.71 1.71zm.71 5.29a1.003 1.003 0 00-1.42 1.42l1.5 1.5a1.003 1.003 0 001.42-1.42l-1.5-1.5zM15 7h-2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1zM8 5C6.34 5 5 6.34 5 8s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0 3c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1z"],
    "floppy-disk": ["M15.71 2.29l-2-2A.997.997 0 0013 0h-1v6H4V0H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V3c0-.28-.11-.53-.29-.71zM14 15H2V9c0-.55.45-1 1-1h10c.55 0 1 .45 1 1v6zM11 1H9v4h2V1z"],
    "flow-branch": ["M10.643 6.595c.22.418.344.894.344 1.399 0 .439-.094.855-.263 1.231l3.265 3.462-.002-1.75a.973.973 0 01.314-.68.99.99 0 011.388.048c.186.2.316.46.3.715l-.009 4.03a.959.959 0 01-.3.68.972.972 0 01-.698.266l-4.053.002a.97.97 0 01-.679-.314 1.031 1.031 0 01.05-1.42.972.972 0 01.698-.266l1.7-.001-3.305-3.35a2.998 2.998 0 01-4.228-1.653H.999a1 1 0 010-2h4.166a2.998 2.998 0 014.06-1.735l3.449-3.268-1.745.002a.979.979 0 01-.631-1.692c.199-.186.459-.316.713-.3l4.025.009c.247.008.493.1.679.3.186.2.274.451.265.7l.002 4.046a.972.972 0 01-.313.68 1.03 1.03 0 01-1.42-.05.973.973 0 01-.266-.7V3.295l-3.34 3.301z"],
    "flow-end": ["M9.702 7.31c.176.176.293.41.293.684a.976.976 0 01-.283.695c-1.888 1.91-2.892 2.918-3.011 3.027-.179.164-.42.284-.693.284a.995.995 0 01-.997-.985c0-.274.112-.541.292-.72.12-.12.624-.551 1.514-1.293H.98c-.536 0-.975-.47-.975-1.008 0-.537.439-.996.975-.996h5.837c-.895-.752-1.4-1.187-1.514-1.304a1.03 1.03 0 01-.292-.705C5.01 4.45 5.464 4 6 4c.272 0 .52.108.695.294A535.7 535.7 0 009.702 7.31zM13 11.002c-1.657 0-3-1.347-3-3.008a3.004 3.004 0 013-3.007c1.657 0 3 1.346 3 3.007a3.004 3.004 0 01-3 3.008z"],
    "flow-linear": ["M4.16 9.002H.977C.44 9.002 0 8.532 0 7.994c0-.537.44-.99.978-.99h3.18A3.01 3.01 0 016.995 5a3.01 3.01 0 012.839 2.004h2.98c-.898-.756-1.404-1.193-1.518-1.31a1.03 1.03 0 01-.293-.705c0-.538.454-.989.992-.989.274 0 .521.108.697.294.118.124 1.122 1.13 3.014 3.016a.96.96 0 01.293.684.975.975 0 01-.284.695l-3.018 3.027a.974.974 0 01-.694.284c-.553 0-1-.447-1-.985 0-.274.117-.545.293-.72l1.518-1.293H9.833A3.01 3.01 0 016.996 11 3.01 3.01 0 014.16 9.002z"],
    "flow-review": ["M5.175 7.004a3.003 3.003 0 012.83-2.001c1.305 0 2.416.835 2.83 2.001h1.985c-.896-.756-1.401-1.193-1.515-1.31a1.03 1.03 0 01-.292-.705c0-.538.453-.989.99-.989a.95.95 0 01.696.294c.117.124 1.12 1.13 3.008 3.016.176.176.293.41.293.684a.976.976 0 01-.283.695l-3.013 3.027a.995.995 0 01-1.691-.702c0-.273.116-.544.292-.72l1.515-1.292h-1.98a3.003 3.003 0 01-2.835 2.016A3.003 3.003 0 015.17 9.002H3.18l1.515 1.292c.176.176.292.447.292.72a.995.995 0 01-1.69.702L.282 8.69A.976.976 0 010 7.994c0-.273.117-.508.293-.684A535.858 535.858 0 003.3 4.294.95.95 0 013.997 4c.537 0 .99.45.99.989 0 .273-.12.528-.292.705-.114.117-.62.554-1.515 1.31h1.995z"],
    "flow-review-branch": ["M10.392 10.647A3.002 3.002 0 016.16 8.995H3.37l1.338 1.318c.172.178.287.41.282.683-.01.536-.524.995-.99.995-.465 0-.63-.187-.747-.294L.281 8.682A.956.956 0 010 7.994a.971.971 0 01.294-.687l3.01-3.028a.973.973 0 01.697-.27c.536.01.998.485.989 1.021a.971.971 0 01-.295.687L3.37 6.997h2.79a3.002 3.002 0 014.106-1.716l2.416-2.277-1.732.004a.99.99 0 01-.679-.329.978.978 0 01.05-1.378c.199-.186.459-.315.714-.3l4.012.005c.248.009.493.1.68.3.185.2.273.45.264.699L15.99 6.05a.973.973 0 01-.314.679 1.03 1.03 0 01-1.421-.048.971.971 0 01-.265-.699V4.29L11.65 6.602c.219.416.343.89.343 1.394 0 .451-.1.88-.279 1.263L14 11.68l-.004-1.73a.982.982 0 01.323-.68.978.978 0 011.378.049c.187.2.316.46.3.714l-.004 4.011a.983.983 0 01-.3.691.972.972 0 01-.7.265l-4.046-.001a.987.987 0 01-.679-.326 1.017 1.017 0 01.048-1.41.972.972 0 01.699-.265h1.693l-2.315-2.35z"],
    "flows": ["M13.5 6a2.5 2.5 0 00-2.45 2h-1.3L5.74 4l-.75.75L8.25 8h-3.3a2.5 2.5 0 100 1h3.3l-3.26 3.25.75.75 4.01-4h1.3a2.5 2.5 0 102.45-3z"],
    "folder-close": ["M-.01 14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V7h-16v7zm15-10H7.41L5.7 2.3a.965.965 0 00-.71-.3h-4c-.55 0-1 .45-1 1v3h16V5c0-.55-.45-1-1-1z"],
    "folder-new": ["M10.165 7a3.003 3.003 0 002.827 2 3.003 3.003 0 002.827-2H16v7c0 .55-.45 1-1 1H1.01c-.55 0-1-.45-1-1V7h10.155zM8.76 6H0V3c0-.55.45-1 1-1h1.998c.28 0 .53.11.71.29L5.417 4h2.578c0 .768.29 1.469.765 2zm6.23-3c.55 0 1 .45 1 1s-.45 1-1 1h-.999v1c0 .55-.45 1-1 1-.549 0-.998-.45-.998-1V5h-1c-.55 0-1-.45-1-1s.45-1 1-1h1V2c0-.55.45-1 .999-1 .55 0 1 .45 1 1v1h.999z"],
    "folder-open": ["M2.06 6.69c.14-.4.5-.69.94-.69h11V5c0-.55-.45-1-1-1H6.41l-1.7-1.71A.997.997 0 004 2H1c-.55 0-1 .45-1 1v9.84l2.05-6.15h.01zM16 8c0-.55-.45-1-1-1H4a.99.99 0 00-.94.69l-2 6c-.04.09-.06.2-.06.31 0 .55.45 1 1 1h11c.44 0 .81-.29.94-.69l2-6c.04-.09.06-.2.06-.31z"],
    "folder-shared": ["M8.76 5.98c-.47-.53-.77-1.22-.77-1.99h-.58L5.7 2.29a.965.965 0 00-.71-.3h-4c-.55 0-1 .45-1 1v3h8.76l.01-.01zm6.23-2.99h-4c-.55 0-1 .45-1 1s.45 1 1 1h1.59l-3.3 3.3a.99.99 0 00-.29.7 1.003 1.003 0 001.71.71l3.29-3.29V8c0 .55.45 1 1 1s1-.45 1-1V4c0-.56-.45-1.01-1-1.01zm-1.98 7.23l-.9.9-.01-.01c-.54.55-1.28.89-2.11.89-1.66 0-3-1.34-3-3 0-.77.3-1.47.78-2H-.01v7c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-3.18c-.31.11-.65.18-1 .18-.76-.01-1.45-.31-1.98-.78z"],
    "folder-shared-open": ["M13.02 10.22l-.9.9-.01-.01c-.54.55-1.28.89-2.11.89-1.66 0-3-1.34-3-3 0-.77.3-1.47.78-2H4a.99.99 0 00-.94.69l-2 6c-.04.09-.06.2-.06.31 0 .55.45 1 1 1h11c.44 0 .81-.29.94-.69l1.11-3.32c-.01 0-.03.01-.05.01-.77 0-1.45-.3-1.98-.78zM2.06 6.69c.14-.4.5-.69.94-.69h5.76l.01-.01C8.3 5.46 8 4.77 8 4H6.41l-1.7-1.71A.997.997 0 004 2H1c-.55 0-1 .45-1 1v9.84l2.05-6.15h.01zM15 3h-4c-.55 0-1 .45-1 1s.45 1 1 1h1.59l-3.3 3.29a1.003 1.003 0 001.42 1.42L14 6.41V8c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "follower": ["M9.37 12.69c-1.2-.53-1.04-.85-1.08-1.29-.01-.06-.01-.12-.01-.19.41-.37.75-.87.97-1.44 0 0 .01-.03.01-.04.05-.13.09-.26.12-.39.28-.06.44-.36.5-.63.06-.11.19-.39.16-.7-.04-.4-.2-.59-.38-.67v-.07c0-.52-.05-1.26-.14-1.74a2.72 2.72 0 00-.09-.43 3.02 3.02 0 00-1.04-1.51C7.87 3.2 7.15 3 6.5 3c-.64 0-1.36.2-1.87.59-.5.38-.87.92-1.05 1.51-.04.13-.07.27-.09.4-.09.49-.14 1.24-.14 1.75v.06c-.19.07-.36.26-.4.68-.03.31.1.59.16.7.06.28.23.59.51.64.04.14.08.27.13.39 0 .01.01.02.01.02v.01c.22.59.57 1.1.99 1.46 0 .06-.01.12-.01.17-.04.44.08.76-1.12 1.29-1.2.53-3.01 1.1-3.38 1.95C-.13 15.5.02 16 .02 16h12.96s.15-.5-.22-1.36c-.38-.85-2.19-1.42-3.39-1.95zm6.33-10.4l-2-2a1.003 1.003 0 00-1.42 1.42l.3.29H9.99c-.55 0-1 .45-1 1s.45 1 1 1h2.58l-.29.29a1.003 1.003 0 001.42 1.42l2-2c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"],
    "following": ["M9.37 12.69c-1.2-.53-1.04-.85-1.08-1.29-.01-.06-.01-.12-.01-.19.41-.37.75-.87.97-1.44 0 0 .01-.03.01-.04.05-.13.09-.26.12-.39.28-.06.44-.36.5-.63.06-.11.19-.39.16-.7-.04-.4-.2-.59-.38-.67v-.07c0-.52-.05-1.26-.14-1.74a2.72 2.72 0 00-.09-.43 3.02 3.02 0 00-1.04-1.51C7.87 3.2 7.15 3 6.5 3c-.64 0-1.36.2-1.87.59-.5.38-.87.92-1.05 1.51-.04.13-.07.27-.09.4-.09.49-.14 1.24-.14 1.75v.06c-.19.07-.36.26-.4.68-.03.31.1.59.16.7.06.28.23.59.51.64.04.14.08.27.13.39 0 .01.01.02.01.02v.01c.22.59.57 1.1.99 1.46 0 .06-.01.12-.01.17-.04.44.08.76-1.12 1.29-1.2.53-3.01 1.1-3.38 1.95C-.13 15.5.02 16 .02 16h12.96s.15-.5-.22-1.36c-.38-.85-2.19-1.42-3.39-1.95zM14.99 2h-2.58l.29-.29A1.003 1.003 0 0011.28.29l-2 2c-.17.18-.29.43-.29.71 0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42L12.41 4h2.58c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "font": ["M13.93 14.67L8.94.67h-.01C8.79.28 8.43 0 8 0s-.79.28-.93.67h-.01l-5 14h.01c-.04.1-.07.21-.07.33 0 .55.45 1 1 1 .43 0 .79-.28.93-.67h.01L5.49 11h5.02l1.55 4.34h.01c.14.38.5.66.93.66.55 0 1-.45 1-1 0-.12-.03-.23-.07-.33zM6.2 9L8 3.97 9.8 9H6.2z"],
    "fork": ["M13.7 9.29a1.003 1.003 0 00-1.42 1.42l.29.29H11.4l-5-5h6.17l-.29.29a1.003 1.003 0 001.42 1.42l2-2c.18-.18.29-.43.29-.71s-.11-.53-.29-.71l-2-2a1.003 1.003 0 00-1.42 1.42l.29.29H.99c-.55 0-1 .45-1 1s.45 1 1 1h2.59l6.71 6.71c.18.18.43.29.71.29h1.59l-.29.29a1.003 1.003 0 001.42 1.42l2-2c.18-.18.29-.43.29-.71s-.11-.53-.29-.71l-2.02-2z"],
    "form": ["M2 11v2h2v-2H2zM1 9h4c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1zm9-6h5c.55 0 1 .45 1 1s-.45 1-1 1h-5c-.55 0-1-.45-1-1s.45-1 1-1zM6 1a1.003 1.003 0 01.71 1.71l-3 4C3.53 6.89 3.28 7 3 7s-.53-.11-.71-.29l-2-2a1.003 1.003 0 011.42-1.42L3 4.59l2.29-3.3C5.47 1.11 5.72 1 6 1zm4 10h5c.55 0 1 .45 1 1s-.45 1-1 1h-5c-.55 0-1-.45-1-1s.45-1 1-1z"],
    "full-circle": ["M8 0a8 8 0 100 16A8 8 0 108 0z"],
    "full-stacked-chart": ["M13 12h1c.55 0 1-.45 1-1V8h-3v3c0 .55.45 1 1 1zM10 2c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v3h3V2zm0 4H7v3h3V6zm5-4c0-.55-.45-1-1-1h-1c-.55 0-1 .45-1 1v2h3V2zm0 3h-3v2h3V5zM5 5H2v3h3V5zm-2 7h1c.55 0 1-.45 1-1V9H2v2c0 .55.45 1 1 1zm12 1H2c-.55 0-1 .45-1 1s.45 1 1 1h13c.55 0 1-.45 1-1s-.45-1-1-1zM5 2c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v2h3V2zm3 10h1c.55 0 1-.45 1-1v-1H7v1c0 .55.45 1 1 1z"],
    "fullscreen": ["M3.41 2H5c.55 0 1-.45 1-1s-.45-1-1-1H1C.45 0 0 .45 0 1v4c0 .55.45 1 1 1s1-.45 1-1V3.41L5.29 6.7c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L3.41 2zM6 9c-.28 0-.53.11-.71.29L2 12.59V11c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1H3.41l3.29-3.29c.19-.18.3-.43.3-.71 0-.55-.45-1-1-1zm9 1c-.55 0-1 .45-1 1v1.59L10.71 9.3A.965.965 0 0010 9a1.003 1.003 0 00-.71 1.71l3.3 3.29H11c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1zm0-10h-4c-.55 0-1 .45-1 1s.45 1 1 1h1.59l-3.3 3.29a1.003 1.003 0 001.42 1.42L14 3.41V5c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "function": ["M8.12 4.74H6.98c.33-1.29.75-2.24 1.28-2.84.33-.37.64-.56.95-.56.06 0 .11.02.15.05.04.04.06.09.06.15 0 .05-.04.15-.13.29-.09.14-.13.28-.13.4 0 .18.07.33.2.46.14.13.31.19.52.19.22 0 .41-.08.56-.23.15-.16.23-.37.23-.63 0-.3-.11-.55-.34-.74C10.1 1.09 9.74 1 9.24 1c-.78 0-1.49.22-2.12.67-.64.45-1.24 1.2-1.81 2.23-.2.36-.38.59-.56.69-.18.1-.46.15-.85.15l-.26.9h1.08l-1.59 6.12c-.27 1.01-.44 1.63-.54 1.86-.14.34-.34.63-.62.87-.11.1-.24.15-.4.15a.15.15 0 01-.11-.04l-.04-.05c0-.03.04-.08.12-.16.08-.08.12-.2.12-.36 0-.18-.06-.33-.19-.44-.12-.12-.3-.18-.54-.18-.28 0-.51.08-.68.23-.16.14-.25.32-.25.53 0 .22.1.42.31.59.21.17.53.25.97.25.7 0 1.32-.18 1.87-.54.54-.36 1.02-.92 1.42-1.67.41-.75.82-1.96 1.25-3.63l.91-3.54h1.1l.29-.89zm5.43 1.52c.2-.15.41-.23.62-.23.08 0 .23.03.45.09s.41.09.57.09c.23 0 .42-.08.57-.23.16-.16.24-.36.24-.61 0-.26-.08-.47-.23-.62-.15-.15-.37-.23-.66-.23-.25 0-.5.06-.72.18-.23.12-.51.38-.86.78-.26.3-.64.81-1.15 1.55-.2-.91-.55-1.75-1.05-2.51l-2.72.46-.06.29c.2-.04.37-.06.51-.06.27 0 .49.11.67.34.28.36.67 1.45 1.17 3.26-.39.52-.66.85-.8 1.01-.24.26-.44.42-.59.5-.12.06-.25.09-.41.09-.11 0-.3-.06-.56-.18-.18-.08-.34-.12-.48-.12-.27 0-.48.08-.66.25-.17.17-.26.38-.26.64 0 .25.08.44.24.6.16.15.37.23.64.23.26 0 .5-.05.73-.16.23-.11.52-.34.86-.69.35-.35.82-.9 1.43-1.67.23.73.44 1.25.61 1.58s.37.57.59.71c.22.15.5.22.83.22.32 0 .65-.11.98-.34.44-.3.88-.81 1.34-1.53l-.26-.15c-.31.43-.54.7-.69.8-.1.07-.22.1-.35.1-.16 0-.32-.1-.48-.3-.27-.34-.62-1.27-1.06-2.8.4-.68.73-1.13 1-1.34z"],
    "gantt-chart": ["M10 10c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1zM6 7c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1zm9 5H2V3c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zM4 5h3c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "geolocation": ["M-.01 6.66l7.34 2 2 7.33 6.66-16z"],
    "geosearch": ["M8.82 12.4h.66c.23 0 .36-.17.36-.4v-1.48l.19-.18c-.27.03-.55.06-.83.06-.28 0-.56-.03-.84-.07.02.04.05.08.07.13V12c0 .23.15.4.39.4zM6.4 15.1A5.51 5.51 0 01.9 9.6c0-.49.06-.98.18-1.43.03 0 .05-.01.08-.01h.08v.44c0 .19.17.34.36.34.03 0 .07-.01.1-.01l.71.7c.07.07.19.07.26 0s.07-.19 0-.26l-.7-.72c0-.02.03-.03.03-.05v-.11c0-.15.08-.2.23-.33h.42c.08 0 .15-.01.22-.04h.02c.02-.02.03-.02.04-.04.01-.01.01-.01.02-.01l.02-.01.9-.9c-.13-.26-.24-.52-.34-.8h-.5v-.43c0-.01.05.05.04-.08h.31c-.03-.13-.06-.26-.08-.39h-.57c.16-.12.34-.24.51-.36-.02-.23-.04-.46-.04-.7 0-.12.01-.23.02-.34A6.385 6.385 0 000 9.6C0 13.13 2.87 16 6.4 16c3.1 0 5.67-2.22 6.26-5.15l-.78-.88c-.21 2.85-2.58 5.13-5.48 5.13zm-1.7-2.93v-.28h.12c.23 0 .39-.19.39-.42v-.54s.01-.01 0-.01L3.77 9.45h-.62c-.23 0-.38.19-.38.42v1.6c0 .23.14.42.38.42h.26v1.61c0 .23.22.41.45.41s.45-.18.45-.41v-.97H4.3c.24 0 .4-.13.4-.36zm11.07-2.34l-2.94-2.94c.11-.17.21-.34.3-.52.01-.03.03-.06.04-.09.08-.18.16-.36.22-.55v-.01c.06-.19.1-.38.14-.58.01-.05.01-.09.02-.14.03-.2.05-.4.05-.61a4.4 4.4 0 00-4.4-4.4C6.77 0 4.8 1.97 4.8 4.4s1.97 4.4 4.4 4.4c.21 0 .41-.02.61-.05.04 0 .09-.01.14-.02.2-.03.39-.08.58-.14h.01c.19-.06.37-.14.55-.22.03-.01.06-.03.09-.04.18-.09.35-.19.52-.3l2.94 2.94a.8.8 0 00.57.23c.44 0 .8-.36.8-.8a.895.895 0 00-.24-.57zM9.2 7.6C7.43 7.6 6 6.17 6 4.4c0-1.77 1.43-3.2 3.2-3.2s3.2 1.43 3.2 3.2c0 1.77-1.43 3.2-3.2 3.2zm1.54 4.26v-.52c0-.09-.1-.17-.19-.17s-.19.07-.19.17v.52c0 .09.1.17.19.17s.19-.07.19-.17z"],
    "git-branch": ["M12 1c-1.66 0-3 1.34-3 3 0 1.25.76 2.32 1.85 2.77A2.02 2.02 0 019 8H7c-.73 0-1.41.2-2 .55V5.82C6.16 5.4 7 4.3 7 3c0-1.66-1.34-3-3-3S1 1.34 1 3c0 1.3.84 2.4 2 2.82v4.37c-1.16.4-2 1.51-2 2.81 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.04-.53-1.95-1.32-2.49.35-.31.81-.51 1.32-.51h2c1.92 0 3.52-1.35 3.91-3.15A2.996 2.996 0 0012 1zM4 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm8-9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"],
    "git-commit": ["M15 7h-3.14c-.45-1.72-2-3-3.86-3S4.59 5.28 4.14 7H1c-.55 0-1 .45-1 1s.45 1 1 1h3.14c.45 1.72 2 3 3.86 3s3.41-1.28 3.86-3H15c.55 0 1-.45 1-1s-.45-1-1-1zm-7 3c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"],
    "git-merge": ["M12 6c-1.3 0-2.4.84-2.82 2H9c-1.62 0-3-.96-3.63-2.34C6.33 5.16 7 4.16 7 3c0-1.66-1.34-3-3-3S1 1.34 1 3c0 1.3.84 2.4 2 2.81v4.37C1.84 10.6 1 11.7 1 13c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.3-.84-2.4-2-2.82V8.43A5.89 5.89 0 009 10h.18A2.996 2.996 0 0015 9c0-1.66-1.34-3-3-3zm-8 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM4 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm8 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"],
    "git-new-branch": ["M14 2h-1V1c0-.55-.45-1-1-1s-1 .45-1 1v1h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1V4h1c.55 0 1-.45 1-1s-.45-1-1-1zm-3.18 4.8C10.51 7.51 9.82 8 9 8H7c-.73 0-1.41.2-2 .55V5.82C6.16 5.4 7 4.3 7 3c0-1.66-1.34-3-3-3S1 1.34 1 3c0 1.3.84 2.4 2 2.82v4.37c-1.16.4-2 1.51-2 2.81 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.04-.53-1.95-1.32-2.49.35-.31.81-.51 1.32-.51h2c1.9 0 3.49-1.33 3.89-3.11-.29.07-.58.11-.89.11-.41 0-.8-.08-1.18-.2zM4 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"],
    "git-pull": ["M3 1C1.34 1 0 2.34 0 4c0 1.3.84 2.4 2 2.82v3.37C.84 10.6 0 11.7 0 13c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.3-.84-2.4-2-2.82V6.82C5.16 6.4 6 5.3 6 4c0-1.66-1.34-3-3-3zm0 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm11 5.18V6c0-1.66-1.34-3-3-3H9.41l1.29-1.29c.19-.18.3-.43.3-.71A1.003 1.003 0 009.29.29l-3 3C6.11 3.47 6 3.72 6 4c0 .28.11.53.29.71l3 3a1.003 1.003 0 001.42-1.42L9.41 5H11c.55 0 1 .45 1 1v4.18A2.996 2.996 0 0013 16c1.66 0 3-1.34 3-3 0-1.3-.84-2.4-2-2.82zM13 14c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"],
    "git-push": ["M4 6h1V5H4v1zm9 3c0-.28-.11-.53-.29-.71l-3-3C9.53 5.11 9.28 5 9 5s-.53.11-.71.29l-3 3a1.003 1.003 0 001.42 1.42L8 8.41V15c0 .55.45 1 1 1s1-.45 1-1V8.41l1.29 1.29c.18.19.43.3.71.3.55 0 1-.45 1-1zM5 3H4v1h1V3zm10-3H1C.45 0 0 .45 0 1v13c0 .55.45 1 1 1h5v-2H2v-1h4v-1H3V2h11v9h-2v1h2v1h-2v2h3c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "git-repo": ["M5 9H4v1h1V9zm10-9H1C.45 0 0 .45 0 1v13c0 .55.45 1 1 1h3v1l2-1 2 1v-1h7c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM4 13H2v-1h2v1zm10 0H8v-1h6v1zm0-2H3V2h11v9zM5 3H4v1h1V3zm0 4H4v1h1V7zm0-2H4v1h1V5z"],
    "glass": ["M2 0v4c0 2.97 2.16 5.43 5 5.91V14H5c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1H9V9.91c2.84-.48 5-2.94 5-5.91V0H2z"],
    "globe": ["M4.45 7.83c-.26 0-.41.21-.41.46v1.75c0 .26.16.46.41.46h.29v1.77c0 .25.24.45.49.45s.49-.2.49-.45V11.2h-.01c.26 0 .44-.14.44-.4v-.3h.14c.26 0 .43-.2.43-.46v-.59s.01-.01 0-.01l-1.58-1.6h-.69zM8.51 3.9h.22c.06 0 .12-.01.12-.07 0-.06-.05-.07-.12-.07h-.22c-.06 0-.12.01-.12.07.01.06.06.07.12.07zm-2.33-.05c.07-.07.07-.19 0-.26l-.5-.5a.187.187 0 00-.26 0c-.07.07-.07.19 0 .26l.5.5c.07.07.19.07.26 0zm3.06.89c.07 0 .14-.06.14-.12v-.31c0-.07-.07-.12-.14-.12s-.14.06-.14.12v.31c0 .07.07.12.14.12zM8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-.55.1-1.07.23-1.57h.11v.47c0 .2.18.37.39.37.03 0 .08-.01.11-.02l.78.77c.08.08.2.08.28 0 .08-.08.08-.2 0-.28l-.75-.78c0-.02.04-.04.04-.06v-.12c0-.16.09-.22.25-.36h.46c.09 0 .17-.01.24-.05h.02c.02-.01.03-.02.05-.03.01-.01.01-.01.02-.01l.02-.02 1.59-1.58c.18-.18.18-.46 0-.64s-.47-.15-.65.03l-.3.34h-.57v-.48c0-.01.05.05.05-.09h.64c.12 0 .22-.09.22-.21s-.1-.21-.22-.21H4.1c.18-.15.34-.31.54-.44l.01-.01c.21-.14.45-.25.68-.37.15-.07.29-.15.44-.21.17-.07.35-.11.53-.17.18-.05.35-.12.53-.16a6.05 6.05 0 013.47.35c.05.02.1.05.16.08.25.11.48.24.71.39.25.16.49.34.71.55H10.6s0-.03-.01-.03c-.04 0-.09 0-.13.03l-.51.51a.17.17 0 000 .23c.06.06.17.06.23 0l.42-.44.01-.02h.25c0 .14-.07.09-.07.12v.07c0 .22-.15.37-.36.37h-.38c-.19 0-.38.21-.38.4v.17h-.1c-.12 0-.2.06-.2.18v.25h-.23c-.17 0-.3.11-.3.28 0 .17.13.26.3.26.07 0 .14.03.19-.11l.04.01.49-.46h.17l.39.37c.03.03.08.02.12-.01.03-.03.03-.12 0-.15l-.32-.35h.23l.09.12c.18.18.48.17.66-.01l.09-.1h.4c.02 0 .08.05.08.05v.24l-.05-.01h-.36c-.11 0-.21.1-.21.21 0 .11.09.21.21.21h.41v.15c-.14.21-.24.42-.45.42h-.94v-.01l-.44-.44a.47.47 0 00-.66 0l-.42.43v.01H8.6c-.26 0-.49.21-.49.46v.92c0 .26.23.45.49.45h.9c.34.14.57.35.72.69v1.68c0 .26.17.44.42.44h.72c.26 0 .4-.18.4-.44V9l.89-.86.03-.02.02-.01h.03c.07-.08.15-.19.15-.31v-.91c0-.18-.16-.32-.31-.46H13c.01.28.21.42.46.42h.42c.08.37.12.76.12 1.15 0 3.31-2.69 6-6 6zm4.54-4.27c-.1 0-.21.08-.21.18v.57c0 .1.11.18.21.18.1 0 .21-.08.21-.18v-.57c0-.1-.11-.18-.21-.18zM8.37 3.19c0-.25-.2-.42-.46-.42h-.54c-.25 0-.42.18-.42.43 0 .03-.1.04.05.08v.47c0 .15.06.27.21.27s.21-.12.21-.27v-.14h.5c.24 0 .45-.16.45-.42z"],
    "globe-network": ["M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm5.17 5h-2.44c-.21-1.11-.51-2.03-.91-2.69 1.43.46 2.61 1.43 3.35 2.69zM10 8c0 .73-.05 1.39-.12 2H6.12C6.05 9.39 6 8.73 6 8s.05-1.39.12-2h3.76c.07.61.12 1.27.12 2zM8 2c.67 0 1.36 1.1 1.73 3H6.27C6.64 3.1 7.33 2 8 2zm-1.82.31c-.4.66-.71 1.58-.91 2.69H2.83a6.025 6.025 0 013.35-2.69zM2 8c0-.7.13-1.37.35-2h2.76C5.04 6.62 5 7.28 5 8s.04 1.38.11 2H2.35C2.13 9.37 2 8.7 2 8zm.83 3h2.44c.21 1.11.51 2.03.91 2.69A6.025 6.025 0 012.83 11zM8 14c-.67 0-1.36-1.1-1.73-3h3.46c-.37 1.9-1.06 3-1.73 3zm1.82-.31c.4-.66.7-1.58.91-2.69h2.44a6.025 6.025 0 01-3.35 2.69zM13.65 10h-2.76c.07-.62.11-1.28.11-2s-.04-1.38-.11-2h2.76c.22.63.35 1.3.35 2s-.13 1.37-.35 2z"],
    "graph": ["M14 3c-1.06 0-1.92.83-1.99 1.88l-1.93.97A2.95 2.95 0 008 5c-.56 0-1.08.16-1.52.43L3.97 3.34C3.98 3.23 4 3.12 4 3c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2c.24 0 .47-.05.68-.13l2.51 2.09C5.08 7.29 5 7.63 5 8c0 .96.46 1.81 1.16 2.35l-.56 1.69c-.91.19-1.6.99-1.6 1.96 0 1.1.9 2 2 2s2-.9 2-2c0-.51-.2-.97-.51-1.32l.56-1.69A2.99 2.99 0 0011 8c0-.12-.02-.24-.04-.36l1.94-.97c.32.21.69.33 1.1.33 1.1 0 2-.9 2-2s-.9-2-2-2z"],
    "graph-remove": ["M12.89 8.11l-.01.01-.38-.38-.38.38-.02-.02c-.54.55-1.27.9-2.1.9-1.66 0-3-1.34-3-3 0-.83.35-1.56.9-2.1l-.02-.02.38-.38-.38-.38.01-.01C7.35 2.57 7 1.83 7 1c0-.34.07-.65.17-.96A8.004 8.004 0 000 8c0 4.42 3.58 8 8 8 4.14 0 7.54-3.14 7.96-7.17-.31.1-.62.17-.96.17-.83 0-1.57-.35-2.11-.89zm1.02-4.61l1.79-1.79c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-1.79 1.8L10.71.3A.965.965 0 0010 0a1.003 1.003 0 00-.71 1.71l1.79 1.79-1.79 1.79a1.003 1.003 0 001.42 1.42l1.79-1.79 1.79 1.79a1.003 1.003 0 001.42-1.42l-1.8-1.79z"],
    "greater-than": ["M2.713 5.958a1 1 0 01.574-1.916l10 3c.95.285.95 1.63 0 1.916l-10 3a1 1 0 01-.574-1.916L9.52 8 2.713 5.958z"],
    "greater-than-or-equal-to": ["M2.713 3.958a1 1 0 01.574-1.916l10 3c.95.285.95 1.63 0 1.916l-10 3a1 1 0 01-.574-1.916L9.52 6 2.713 3.958zM3 12h10a1 1 0 010 2H3a1 1 0 010-2z"],
    "grid": ["M15 9c.55 0 1-.45 1-1s-.45-1-1-1h-1V4h1c.55 0 1-.45 1-1s-.45-1-1-1h-1V1c0-.55-.45-1-1-1s-1 .45-1 1v1H9V1c0-.55-.45-1-1-1S7 .45 7 1v1H4V1c0-.55-.45-1-1-1S2 .45 2 1v1H1c-.55 0-1 .45-1 1s.45 1 1 1h1v3H1c-.55 0-1 .45-1 1s.45 1 1 1h1v3H1c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h3v1c0 .55.45 1 1 1s1-.45 1-1v-1h3v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c.55 0 1-.45 1-1s-.45-1-1-1h-1V9h1zm-8 3H4V9h3v3zm0-5H4V4h3v3zm5 5H9V9h3v3zm0-5H9V4h3v3z"],
    "grid-view": ["M0 1v6h7V0H1C.45 0 0 .45 0 1zm0 14c0 .55.45 1 1 1h6V9H0v6zM15 0H9v7h7V1c0-.55-.45-1-1-1zM9 16h6c.55 0 1-.45 1-1V9H9v7z"],
    "group-objects": ["M5 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-3H5C2.24 3 0 5.24 0 8s2.24 5 5 5h6c2.76 0 5-2.24 5-5s-2.24-5-5-5zm0 9H5c-2.21 0-4-1.79-4-4s1.79-4 4-4h6c2.21 0 4 1.79 4 4s-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"],
    "grouped-bar-chart": ["M10 12c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1s-1 .45-1 1v8c0 .55.45 1 1 1zm3 0c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55.45 1 1 1zm2 1H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zm-9-1c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1zm-3 0c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1v9c0 .55.45 1 1 1z"],
    "hand": ["M15 5c0-.55-.45-1-1-1-.41 0-.76.24-.91.59v.01s0 .01-.01.01L11.57 8h-.36l.78-4.84C12 3.11 12 3.05 12 3a1 1 0 00-1.99-.16v.01L9.18 8H9V1c0-.55-.45-1-1-1S7 .45 7 1v7h-.09l-.93-5.18A1 1 0 005 2c-.55 0-1 .45-1 1 0 .05 0 .11.01.16L5.26 11h-.04L2.83 7.44C2.65 7.18 2.35 7 2 7c-.55 0-1 .45-1 1 0 .17.04.33.12.47l3 5.69h.01v.01A5.002 5.002 0 0013 11v-.59l1.93-5.05c.05-.11.07-.23.07-.36z"],
    "hand-down": ["M14.72 7.87c-1.54-.67-2.99-2.68-3.7-3.95C10.11 1.95 9.93 0 6.14 0 4.05 0 2.71.61 1.92 2.12 1.27 3.36 1 5.21 1 7.83v.79c0 .65.6 1.18 1.35 1.18.34 0 .64-.11.88-.29.17.48.68.84 1.29.84.41 0 .78-.16 1.03-.42.23.37.67.63 1.19.63.57 0 1.05-.31 1.25-.74l.01.63v4.05c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V7.9c.58.41 1.55 1.21 2.47 1.29 1.57.14 1.82-1.07 1.25-1.32z"],
    "hand-left": ["M12.08 4.97c-1.26-.71-3.27-2.15-3.95-3.7C7.88.7 6.67.96 6.81 2.52c.09.93.89 1.9 1.3 2.48H1.5C.67 5 0 5.67 0 6.5S.67 8 1.5 8h4.05l.63.01c-.44.2-.75.69-.75 1.25 0 .52.26.96.63 1.19-.26.25-.42.61-.42 1.03 0 .61.35 1.12.84 1.29-.18.24-.29.54-.29.88 0 .75.54 1.35 1.19 1.35h.79c2.62 0 4.47-.28 5.71-.92 1.51-.79 2.12-2.14 2.12-4.22 0-3.79-1.95-3.97-3.92-4.89z"],
    "hand-right": ["M14.5 5H7.89c.41-.58 1.21-1.55 1.3-2.47C9.34.97 8.12.71 7.87 1.28c-.67 1.54-2.68 2.99-3.95 3.7C1.95 5.89 0 6.07 0 9.86c0 2.09.61 3.43 2.12 4.22 1.24.65 3.09.92 5.71.92h.79c.65 0 1.18-.6 1.18-1.35 0-.34-.11-.64-.29-.88.48-.17.84-.68.84-1.29 0-.41-.16-.78-.42-1.03.37-.23.63-.67.63-1.19 0-.57-.31-1.05-.74-1.25l.63-.01h4.05c.83 0 1.5-.67 1.5-1.5S15.33 5 14.5 5z"],
    "hand-up": ["M13.65 6.19c-.34 0-.64.11-.88.29-.17-.48-.68-.84-1.29-.84-.41 0-.78.16-1.03.42-.23-.37-.67-.63-1.19-.63-.57 0-1.05.31-1.25.74L8 5.55V1.5C8 .67 7.33 0 6.5 0S5 .67 5 1.5v6.61c-.58-.41-1.55-1.21-2.48-1.3C.96 6.67.7 7.88 1.28 8.13c1.54.67 2.99 2.68 3.7 3.95C5.89 14.05 6.07 16 9.86 16c2.09 0 3.43-.61 4.22-2.12.64-1.24.92-3.09.92-5.71v-.79c0-.65-.6-1.19-1.35-1.19z"],
    "header": ["M13 1c-.55 0-1 .45-1 1v5H4V2c0-.55-.45-1-1-1s-1 .45-1 1v12c0 .55.45 1 1 1s1-.45 1-1V9h8v5c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1z"],
    "header-one": ["M14.06 8c-.04.23-.12.44-.25.61-.13.17-.29.3-.48.41-.18.11-.39.18-.62.23-.23.04-.46.07-.71.07v1.03h1.74V16H15V8h-.94zM7 0c-.56 0-1 .45-1 1v4H2V1c0-.55-.45-1-1-1-.56 0-1 .45-1 1v10c0 .55.45 1 1 1 .56 0 1-.45 1-1V7h4v4c0 .55.45 1 1 1 .56 0 1-.45 1-1V1c0-.54-.45-1-1-1z"],
    "header-two": ["M13.17 13.93c-.17.15-.33.29-.46.44-.13.16-.22.32-.27.49h3.55V16H11c.01-.65.16-1.22.44-1.71s.67-.91 1.17-1.27c.24-.18.49-.36.75-.54.25-.18.49-.36.71-.57.21-.2.39-.42.53-.65.14-.24.21-.51.22-.82 0-.14-.02-.29-.05-.45-.03-.16-.09-.31-.18-.45a1.13 1.13 0 00-.37-.35c-.16-.09-.37-.14-.63-.14-.24 0-.43.05-.59.15-.16.1-.29.24-.38.42-.1.17-.17.38-.21.62-.05.24-.07.5-.08.77h-1.19c0-.43.05-.83.16-1.2s.27-.69.49-.96c.21-.25.48-.46.79-.62.31-.15.67-.23 1.07-.23.45 0 .82.08 1.11.23.3.16.55.36.73.6.19.24.32.5.39.79.08.28.12.54.12.79 0 .31-.04.6-.13.85s-.22.49-.37.7c-.15.21-.32.41-.52.59s-.4.35-.61.51l-.63.45c-.21.14-.39.28-.57.42zM0 1c0-.55.44-1 1-1 .55 0 1 .46 1 1v10c0 .55-.44 1-1 1-.55 0-1-.46-1-1V1zm6 0c0-.55.44-1 1-1 .55 0 1 .46 1 1v10c0 .55-.44 1-1 1-.55 0-1-.46-1-1V1zM2 5h4v2H2V5z"],
    "headset": ["M14.85 6.34C14.18 2.72 11.37 0 8 0S1.82 2.72 1.15 6.34C.47 6.9 0 8.1 0 9.5 0 11.43.9 13 2 13c0 1.1.9 2 2 2h2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1H4c-.55 0-1-.45-1-1 .55 0 1-.45 1-1V7c0-.45-.3-.81-.71-.94C3.97 3.7 5.81 2 8 2s4.03 1.7 4.71 4.06c-.41.13-.71.49-.71.94v5c0 .55.45 1 1 1h1c1.1 0 2-1.57 2-3.5 0-1.4-.47-2.6-1.15-3.16z"],
    "heart": ["M16 5.095c0-2.255-1.88-4.083-4.2-4.083-1.682 0-3.13.964-3.8 2.352a4.206 4.206 0 00-3.8-2.352C1.88 1.012 0 2.84 0 5.095c0 .066.007.13.01.194H.004c.001.047.01.096.014.143l.013.142c.07.8.321 1.663.824 2.573C2.073 10.354 4.232 12.018 8 15c3.767-2.982 5.926-4.647 7.144-6.854.501-.905.752-1.766.823-2.562.007-.055.012-.11.016-.164.003-.043.012-.088.013-.13h-.006c.003-.066.01-.13.01-.195z"],
    "heart-broken": ["M7.71 8.87L6.17 6.55l.02-.01A.906.906 0 016 6c0-.07.03-.13.04-.19h-.02l.78-3.92C6.09 1.34 5.19 1 4.2 1 1.88 1 0 2.83 0 5.09c0 .07.01.13.01.19H0c0 .05.01.1.01.14 0 .05.01.1.01.14.07.8.32 1.66.82 2.57 1.07 1.94 2.88 3.47 5.86 5.84l-.68-2.74h.02C6.03 11.16 6 11.08 6 11c0-.28.11-.53.29-.71l1.42-1.42zM16 5.09C16 2.83 14.12 1 11.8 1c-1.2 0-2.27.5-3.04 1.28l-.7 3.51 1.77 2.66-.01.01c.1.15.18.33.18.54 0 .28-.11.53-.29.71l-1.6 1.6.75 3.01c3.23-2.56 5.16-4.15 6.28-6.18.5-.91.75-1.77.82-2.56.01-.05.01-.11.02-.16 0-.04.01-.09.01-.13h-.01c.01-.07.02-.14.02-.2z"],
    "heat-grid": ["M0 10h5V7H0v3zm1-2h3v1H1V8zm14-5h-4v3h5V4c0-.55-.45-1-1-1zm0 2h-3V4h3v1zM0 4v2h5V3H1c-.55 0-1 .45-1 1zm0 9c0 .55.45 1 1 1h4v-3H0v2zm6-7h4V3H6v3zm0 8h4v-3H6v3zm1-2h2v1H7v-1zm4 2h4c.55 0 1-.45 1-1v-2h-5v3zm0-4h5V7h-5v3zm-5 0h4V7H6v3z"],
    "heatmap": ["M2 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm11-7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm3 4.5A2.5 2.5 0 0013.5 6c-.98 0-1.82.57-2.23 1.39-.6-.78-1.51-1.3-2.56-1.36.18-.49.29-.99.29-1.53C9 2.01 6.99 0 4.5 0S0 2.01 0 4.5 2.01 9 4.5 9c.19 0 .37-.03.56-.06-.03.19-.06.37-.06.56C5 11.43 6.57 13 8.5 13c1.63 0 2.98-1.11 3.37-2.62.44.38 1 .62 1.63.62A2.5 2.5 0 0016 8.5zM14.5 13c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"],
    "help": ["M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm1 13H7v-2h2v2zm1.93-6.52c-.14.32-.35.64-.62.97L9.25 8.83c-.12.15-.24.29-.28.42-.04.13-.09.3-.09.52V10H7.12V8.88s.05-.51.21-.71L8.4 6.73c.22-.26.35-.49.44-.68.09-.19.12-.38.12-.58 0-.3-.1-.55-.28-.75-.18-.19-.44-.28-.76-.28-.33 0-.59.1-.78.29-.19.19-.33.46-.4.81-.03.11-.1.15-.2.14l-1.7-.25c-.12-.01-.16-.08-.14-.19.12-.82.46-1.47 1.03-1.94.57-.48 1.32-.72 2.25-.72.47 0 .9.07 1.29.22s.72.34 1 .59c.28.25.49.55.65.89.15.35.22.72.22 1.12s-.07.75-.21 1.08z"],
    "helper-management": ["M13 5h-2v2h2V5zm0 6h-2v2h2v-2zm0-3h-2v2h2V8zm2-8H1C.4 0 0 .4 0 1v14c0 .6.4 1 1 1h14c.6 0 1-.4 1-1V1c0-.6-.4-1-1-1zm-1 14H2V2h12v12zm-7-3H5v2h2v-2zm3 0H8v2h2v-2z"],
    "highlight": ["M9.12 11.07l2-2.02.71.71 4-4.04L10.17 0l-4 4.04.71.71-2 2.02 4.24 4.3zM2 12.97h4c.28 0 .53-.11.71-.3l1-1.01-3.42-3.45-3 3.03c-.18.18-.29.44-.29.72 0 .55.45 1.01 1 1.01zm13 1.01H1c-.55 0-1 .45-1 1.01S.45 16 1 16h14c.55 0 1-.45 1-1.01s-.45-1.01-1-1.01z"],
    "history": ["M8 3c-.55 0-1 .45-1 1v4c0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42L9 7.59V4c0-.55-.45-1-1-1zm0-3a7.95 7.95 0 00-6 2.74V1c0-.55-.45-1-1-1S0 .45 0 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1H3.54C4.64 2.78 6.23 2 8 2c3.31 0 6 2.69 6 6 0 2.61-1.67 4.81-4 5.63v-.01c-.63.23-1.29.38-2 .38-3.31 0-6-2.69-6-6 0-.55-.45-1-1-1s-1 .45-1 1c0 4.42 3.58 8 8 8 .34 0 .67-.03 1-.07.02 0 .04-.01.06-.01C12.98 15.4 16 12.06 16 8c0-4.42-3.58-8-8-8z"],
    "home": ["M2 10v5c0 .55.45 1 1 1h3v-5h4v5h3c.55 0 1-.45 1-1v-5L8 4l-6 6zm13.71-2.71L14 5.59V2c0-.55-.45-1-1-1s-1 .45-1 1v1.59L8.71.29C8.53.11 8.28 0 8 0s-.53.11-.71.29l-7 7a1.003 1.003 0 001.42 1.42L8 2.41l6.29 6.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71z"],
    "horizontal-bar-chart": ["M4 5h7c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1zM1 1c-.55 0-1 .45-1 1v13c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1zm14 6H4c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h11c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1zm-6 5H4c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1z"],
    "horizontal-bar-chart-asc": ["M1 3h5c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm0 4h7c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm14 6H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zM1 11h10c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "horizontal-bar-chart-desc": ["M15 1H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zM8 9H1c-.55 0-1 .45-1 1s.45 1 1 1h7c.55 0 1-.45 1-1s-.45-1-1-1zm-2 4H1c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1zm5-8H1c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "horizontal-distribution": ["M2 0c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zm13 0c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zm-5 2H7c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1z"],
    "id-number": ["M2 5v7h12V5H2zm0-2h12c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z",
        "M7.9 10.48c-.14-.33-.84-.55-1.3-.75-.46-.2-.4-.33-.42-.5v-.07c.16-.14.29-.33.37-.56 0 0 0-.01.01-.02.02-.05.03-.1.05-.15.1-.01.16-.13.19-.23.03-.04.07-.15.06-.27-.02-.16-.08-.24-.15-.26v-.03c0-.2-.02-.48-.05-.67-.01-.05-.02-.1-.03-.16-.07-.23-.21-.44-.4-.58-.2-.15-.48-.23-.73-.23s-.53.08-.72.23c-.19.14-.33.35-.4.58-.02.05-.03.1-.03.16-.05.18-.06.47-.06.67v.03c-.07.03-.14.1-.15.26-.02.12.03.22.06.27.02.1.09.22.2.24.01.05.03.1.05.15v.01c.08.23.22.42.38.56v.07c-.02.17.03.29-.43.5-.46.2-1.16.42-1.3.75s-.09.52-.09.52H8c-.01 0 .05-.19-.1-.52zM10 6h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.55 0-1-.45-1-1s.45-1 1-1zM10 9h2c.55 0 1 .45 1 1s-.45 1-1 1h-2c-.55 0-1-.45-1-1s.45-1 1-1z"],
    "image-rotate-left": ["M13 2h-1.59l.29-.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-2 2C8.11 2.47 8 2.72 8 3c0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42l-.3-.29H13c.55 0 1 .45 1 1v3c0 .55.45 1 1 1s1-.45 1-1V5c0-1.66-1.34-3-3-3zm-5.5 9c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM10 7H1c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1zm-1 6.33L7 12l-1 1-2-3-2 2.67V9h7v4.33z"],
    "image-rotate-right": ["M5.71 5.71l2-2C7.89 3.53 8 3.28 8 3c0-.28-.11-.53-.29-.71l-2-2a1.003 1.003 0 00-1.42 1.42l.3.29H3C1.34 2 0 3.34 0 5v3c0 .55.45 1 1 1s1-.45 1-1V5c0-.55.45-1 1-1h1.59l-.3.29a1.003 1.003 0 001.42 1.42zM12.5 11c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM15 7H6c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1zm-1 6.33L12 12l-1 1-2-3-2 2.67V9h7v4.33z"],
    "import": ["M7.29 11.71c.18.18.43.29.71.29s.53-.11.71-.29l4-4a1.003 1.003 0 00-1.42-1.42L9 8.59V1c0-.55-.45-1-1-1S7 .45 7 1v7.59l-2.29-2.3a1.003 1.003 0 00-1.42 1.42l4 4zM15 11c-.55 0-1 .45-1 1v2H2v-2c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1z"],
    "inbox": ["M13.91 2.6c-.16-.36-.51-.61-.92-.61h-10c-.41 0-.77.25-.92.61L-.01 7.45v5.54c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V7.45L13.91 2.6zm-1.92 5.39c-.55 0-1 .45-1 1v1h-6v-1c0-.55-.45-1-1-1H1.94l1.71-4h8.68l1.71 4h-2.05z"],
    "inbox-filtered": ["M6.432 2c.094.14.202.273.324.394L8.42 4H3.66L1.95 8H4c.55 0 1 .45 1 1v1h6.557c.693 0 1.363-.262 1.837-.736l.103-.102.85-1.14a2.564 2.564 0 00.623-1.682V5.058L16 7.46V13c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V7.46l2.08-4.85C2.23 2.25 2.59 2 3 2h3.432zm9.048-2c.31 0 .52.26.52.57 0 .16-.06.3-.17.41l-2.86 2.73v2.63c0 .16-.06.3-.17.41l-.82 1.1c-.1.1-.25.17-.41.17-.31 0-.57-.26-.57-.57V3.71L8.17.98A.566.566 0 018 .57c0-.31.26-.57.57-.57h6.91z"],
    "inbox-geo": ["M6.341 2A5.99 5.99 0 006 4H3.66L1.95 8H4c.55 0 1 .45 1 1v1h7a5.978 5.978 0 004-1.528V13c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V7.46l2.08-4.85C2.23 2.25 2.59 2 3 2h3.341zm3.679 2.145c0-.125.075-.23.205-.225h.345l.79.8c.005 0 0 .005 0 .005v.295c0 .13-.085.23-.215.23h-.07v.15c0 .13-.09.2-.215.2v.535c0 .125-.12.225-.245.225s-.245-.1-.245-.225V5.25h-.145c-.125 0-.205-.1-.205-.23v-.875zm2.235-2.195c-.03 0-.055-.005-.06-.035 0-.03.03-.035.06-.035h.11c.035 0 .06.005.06.035 0 .03-.03.035-.06.035h-.11zm-1.165-.025a.094.094 0 01-.13 0l-.25-.25a.094.094 0 010-.13.094.094 0 01.13 0l.25.25a.094.094 0 010 .13zm1.53.445c-.035 0-.07-.025-.07-.06v-.155c0-.03.035-.06.07-.06s.07.025.07.06v.155c0 .03-.035.06-.07.06zM12 0c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 7c1.655 0 3-1.345 3-3 0-.195-.02-.39-.06-.575h-.21c-.125 0-.225-.07-.23-.21h-.215c.075.07.155.14.155.23V3.9c0 .06-.04.115-.075.155h-.015l-.01.005-.015.01-.445.43v.815c0 .13-.07.22-.2.22h-.36c-.125 0-.21-.09-.21-.22v-.84a.627.627 0 00-.36-.345h-.45c-.13 0-.245-.095-.245-.225v-.46c0-.125.115-.23.245-.23l.13-.005.21-.215c.09-.09.24-.09.33 0l.22.225h.47c.105 0 .155-.105.225-.21v-.075h-.205a.106.106 0 01-.105-.105.11.11 0 01.105-.105h.18l.025.005v-.12s-.03-.025-.04-.025h-.2l-.045.05a.235.235 0 01-.33.005l-.045-.06h-.115l.16.175c.015.015.015.06 0 .075-.02.015-.045.02-.06.005l-.195-.185h-.085l-.245.23-.02-.005c-.025.07-.06.055-.095.055-.085 0-.15-.045-.15-.13s.065-.14.15-.14h.115v-.125c0-.06.04-.09.1-.09h.05V2.36c0-.095.095-.2.19-.2h.19c.105 0 .18-.075.18-.185V1.94c0-.015.035.01.035-.06h-.125l-.005.01-.21.22a.085.085 0 01-.115 0 .085.085 0 010-.115l.255-.255c.02-.015.045-.015.065-.015.005 0 .005.015.005.015h.64a2.327 2.327 0 00-.355-.275 2.452 2.452 0 00-.355-.195c-.03-.015-.055-.03-.08-.04a3.025 3.025 0 00-1.735-.175c-.09.02-.175.055-.265.08-.09.03-.18.05-.265.085-.075.03-.145.07-.22.105-.115.06-.235.115-.34.185l-.005.005c-.1.065-.18.145-.27.22h.455c.06 0 .11.045.11.105s-.05.105-.11.105h-.32c0 .07-.025.04-.025.045v.24h.285l.15-.17c.09-.09.235-.105.325-.015.09.09.09.23 0 .32l-.795.79-.01.01c-.005 0-.005 0-.01.005l-.025.015h-.01a.235.235 0 01-.12.025h-.23c-.08.07-.125.1-.125.18v.06c0 .01-.02.02-.02.03l.375.39c.04.04.04.1 0 .14-.04.04-.1.04-.14 0l-.39-.385a.213.213 0 01-.055.01c-.105 0-.195-.085-.195-.185v-.235h-.055A3.1 3.1 0 009 4c0 1.655 1.345 3 3 3zm2.27-2.135c.05 0 .105.04.105.09v.285c0 .05-.055.09-.105.09-.05 0-.105-.04-.105-.09v-.285c0-.05.055-.09.105-.09zm-2.085-3.27c0 .13-.105.21-.225.21h-.25v.07c0 .075-.03.135-.105.135s-.105-.06-.105-.135V1.64c-.075-.02-.025-.025-.025-.04 0-.125.085-.215.21-.215h.27c.13 0 .23.085.23.21z"],
    "inbox-search": ["M5.639 2a5.391 5.391 0 00-.144 2H3.66L1.95 8H4c.55 0 1 .45 1 1v1h6V9c0-.088.012-.174.033-.255.12-.007.238-.019.39-.038.154-.008.252-.03.442-.077a5.34 5.34 0 00.24-.05h.05l.122-.04 1.266 1.271c.425.47 1.116.769 1.847.769.21 0 .414-.025.61-.071V13c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V7.46l2.08-4.85C2.23 2.25 2.59 2 3 2h2.639zM15.82 7.53c.1.12.17.27.18.44 0 .34-.27.61-.61.61a.57.57 0 01-.43-.18l-2.24-2.25c-.13.08-.26.16-.4.23-.02.01-.05.02-.07.03-.14.06-.27.12-.42.17h-.01c-.14.05-.29.08-.44.11-.04.01-.08.02-.11.02-.15.02-.3.04-.46.04-1.85 0-3.35-1.51-3.35-3.37S8.96.01 10.81 0c1.85 0 3.35 1.51 3.35 3.37 0 .16-.02.31-.04.47-.01.04-.01.07-.02.11-.02.15-.05.29-.1.44v.01c-.05.15-.11.28-.17.42-.01.02-.02.05-.03.07-.07.14-.14.27-.23.4l2.25 2.24zm-5.01-1.94c1.22 0 2.21-.99 2.21-2.22 0-1.23-.99-2.22-2.21-2.22S8.6 2.14 8.6 3.37c0 1.22.99 2.22 2.21 2.22z"],
    "inbox-update": ["M8.1 2a5.023 5.023 0 000 2H3.66L1.95 8H4c.55 0 1 .45 1 1v1h6V9c0-.55.45-1 1-1h2.05c.708 0 1.352-.241 1.905-.645L16 7.46V13c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V7.46l2.08-4.85C2.23 2.25 2.59 2 3 2h5.1zM13 6a3 3 0 110-6 3 3 0 010 6z"],
    "info-sign": ["M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zM7 3h2v2H7V3zm3 10H6v-1h1V7H6V6h3v6h1v1z"],
    "inheritance": ["M5 8c0 1.66 1.34 3 3 3h4.59L11.3 9.71A.965.965 0 0111 9a1.003 1.003 0 011.71-.71l3 3c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-3 3a1.003 1.003 0 01-1.42-1.42l1.3-1.29H8c-2.76 0-5-2.24-5-5H1a1 1 0 01-1-1V1a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5zM2 2v4h4V2H2z"],
    "inner-join": ["M6.6 3.3C5.3 4.4 4.5 6.1 4.5 8s.8 3.6 2.1 4.7c-.5.2-1 .3-1.6.3-2.8 0-5-2.2-5-5s2.2-5 5-5c.6 0 1.1.1 1.6.3zm-1.96 8.68C3.92 10.83 3.5 9.46 3.5 8s.42-2.83 1.14-3.98C2.6 4.2 1 5.91 1 8s1.6 3.8 3.64 3.98zM8 4c-1.2.9-2 2.4-2 4s.8 3.1 2 4c1.2-.9 2-2.3 2-4s-.8-3.1-2-4zm3-1c2.8 0 5 2.2 5 5s-2.2 5-5 5c-.6 0-1.1-.1-1.6-.3 1.3-1.1 2.1-2.9 2.1-4.7s-.8-3.5-2.1-4.7c.5-.2 1-.3 1.6-.3zm.35 1.02c.73 1.15 1.14 2.52 1.14 3.98s-.42 2.83-1.14 3.98c2.04-.18 3.64-1.9 3.64-3.98s-1.6-3.8-3.64-3.98z"],
    "insert": ["M5 9h2v2c0 .6.4 1 1 1s1-.4 1-1V9h2c.6 0 1-.4 1-1s-.4-1-1-1H9V5c0-.6-.4-1-1-1s-1 .4-1 1v2H5c-.6 0-1 .4-1 1s.4 1 1 1zm10-9H1C.4 0 0 .4 0 1v14c0 .6.4 1 1 1h14c.6 0 1-.4 1-1V1c0-.6-.4-1-1-1zm-1 14H2V2h12v12z"],
    "intersection": ["M10 3c-.92 0-1.76.26-2.5.69C6.76 3.26 5.92 3 5 3 2.24 3 0 5.24 0 8s2.24 5 5 5c.92 0 1.76-.26 2.5-.69.74.43 1.58.69 2.5.69 2.76 0 5-2.24 5-5s-2.24-5-5-5zm-4.1 7.85c-.29.09-.59.15-.9.15-1.66 0-3-1.34-3-3s1.34-3 3-3c.31 0 .61.06.9.15C5.33 5.96 5 6.94 5 8s.33 2.04.9 2.85zM10 11c-.31 0-.61-.06-.9-.15.57-.81.9-1.79.9-2.85s-.33-2.04-.9-2.85c.29-.09.59-.15.9-.15 1.66 0 3 1.34 3 3s-1.34 3-3 3z"],
    "ip-address": ["M5 2.66C5 4.14 8 8 8 8s3-3.86 3-5.34C10.99 1.2 9.66 0 8 0S5 1.2 5 2.66zM7 3c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zM10.5 10H8v5h1v-4h1v1H9v1h2v-3h-.5zM2 9h12c.55 0 1 .45 1 1v5c0 .55-.45 1-1 1H2c-.55 0-1-.45-1-1v-5c0-.55.45-1 1-1zm4 1v5h1v-5H6z"],
    "issue": ["M8 16A8 8 0 118 0a8 8 0 010 16zm0-2A6 6 0 108 2a6 6 0 000 12zm1-2H7v-2h2v2zm0-3H7V4h2v5z"],
    "issue-closed": ["M9.296.104a2.99 2.99 0 00-1.003.664 2.987 2.987 0 00-.75 1.25 6 6 0 106.28 4.527c.043-.039.085-.079.127-.12l1.456-1.456A8 8 0 119.296.105zm2.532 5.2a.997.997 0 01-.707-.294L9.707 3.596a1 1 0 011.414-1.414l.707.707 1.768-1.768a1 1 0 111.414 1.415L12.536 5.01a.997.997 0 01-.708.293zM9 12H7v-2h2v2zm0-3H7V4h2v5z"],
    "issue-new": ["M10.568.421c-.01.04-.018.08-.026.121-.837.156-1.53.73-1.85 1.497a6 6 0 105.27 5.273 2.51 2.51 0 001.496-1.854c.04-.008.081-.016.121-.026A8 8 0 1110.568.421zM9 12H7v-2h2v2zm0-3H7V4h2v5zm1-6c0-.55.45-1 1-1h1V1c0-.55.45-1 1-1s1 .45 1 1v1h1c.55 0 1 .45 1 1s-.45 1-1 1h-1v1.005c0 .55-.45 1-1 1s-1-.45-1-1V4h-1c-.55 0-1-.45-1-1z"],
    "italic": ["M9.8 4H11c.5 0 1-.4 1-1s-.4-1-1-1H7c-.5 0-1 .4-1 1s.4 1 1 1h.8l-1.6 8H5c-.5 0-1 .4-1 1s.4 1 1 1h4c.5 0 1-.4 1-1s-.4-1-1-1h-.8l1.6-8z"],
    "join-table": ["M15 5h-3V2c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h3v3c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm-5-1v2H6V4h4zm0 6H6V7h4v3zM2 4h3v2H2V4zm0 5V7h3v2H2zm4 4v-2h4v2H6zm8 0h-3v-2h3v2zm0-3h-3V8h3v2z"],
    "key": ["M11 0C8.24 0 6 2.24 6 5c0 1.02.31 1.96.83 2.75L.29 14.29a1.003 1.003 0 001.42 1.42L3 14.41l1.29 1.29c.18.19.43.3.71.3s.53-.11.71-.29l2-2c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71L6.41 11l1.83-1.83c.8.52 1.74.83 2.76.83 2.76 0 5-2.24 5-5s-2.24-5-5-5zm0 8c-.23 0-.45-.03-.66-.08-.01 0-.02-.01-.03-.01-.21-.05-.41-.12-.6-.21a3.014 3.014 0 01-1.62-2c0-.01-.01-.02-.01-.03C8.03 5.45 8 5.23 8 5c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3z"],
    "key-backspace": ["M15 2H6c-.28 0-.53.11-.71.29l-5 5C.11 7.47 0 7.72 0 8c0 .28.11.53.29.71l5 5c.18.18.43.29.71.29h9c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-2.29 7.29a1.003 1.003 0 01-1.42 1.42L10 9.41 8.71 10.7c-.18.19-.43.3-.71.3a1.003 1.003 0 01-.71-1.71L8.59 8l-1.3-1.29a1.003 1.003 0 011.42-1.42L10 6.59l1.29-1.29c.18-.19.43-.3.71-.3a1.003 1.003 0 01.71 1.71L11.41 8l1.3 1.29z"],
    "key-command": ["M12 9h-1V7h1c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3v1H7V4c0-1.66-1.34-3-3-3S1 2.34 1 4s1.34 3 3 3h1v2H4c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3v-1h2v1c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3zm0-6c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM4 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 4H7V7h2v2zm3 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"],
    "key-control": ["M12.71 5.29l-4-4C8.53 1.11 8.28 1 8 1s-.53.11-.71.29l-4 4a1.003 1.003 0 001.42 1.42L8 3.41l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71z"],
    "key-delete": ["M15.71 7.29l-5-5A.997.997 0 0010 2H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h9c.28 0 .53-.11.71-.29l5-5c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71zm-7 2a1.003 1.003 0 01-1.42 1.42L6 9.41 4.71 10.7c-.18.19-.43.3-.71.3a1.003 1.003 0 01-.71-1.71L4.59 8l-1.3-1.29a1.003 1.003 0 011.42-1.42L6 6.59 7.29 5.3c.18-.19.43-.3.71-.3a1.003 1.003 0 01.71 1.71L7.41 8l1.3 1.29z"],
    "key-enter": ["M14 2c-.55 0-1 .45-1 1v3c0 1.66-1.34 3-3 3H4.41L5.7 7.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-3 3c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l3 3a1.003 1.003 0 001.42-1.42L4.41 11H10c2.76 0 5-2.24 5-5V3c0-.55-.45-1-1-1z"],
    "key-escape": ["M2 7c.55 0 1-.45 1-1V4.41L7.29 8.7c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L4.41 3H6c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm7-5.9v2A5 5 0 113.1 9h-2c.49 3.39 3.38 6 6.9 6 3.87 0 7-3.13 7-7 0-3.52-2.61-6.41-6-6.9z"],
    "key-option": ["M11 4h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1s.45 1 1 1zm4 8h-3.43L5.86 2.49h-.02A.975.975 0 005 2H1c-.55 0-1 .45-1 1s.45 1 1 1h3.43l5.71 9.51.01-.01c.18.3.49.5.85.5h4c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "key-shift": ["M13.71 7.29l-5-5C8.53 2.11 8.28 2 8 2s-.53.11-.71.29l-5 5A1.003 1.003 0 003 9h2v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V9h2a1.003 1.003 0 00.71-1.71z"],
    "key-tab": ["M15 10H4.41L5.7 8.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L2 9.59V8c0-.55-.45-1-1-1s-1 .45-1 1v6c0 .55.45 1 1 1s1-.45 1-1v-1.59l2.29 2.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L4.41 12H15c.55 0 1-.45 1-1s-.45-1-1-1zm0-9c-.55 0-1 .45-1 1v1.59L11.71 1.3A.965.965 0 0011 1a1.003 1.003 0 00-.71 1.71L11.59 4H1c-.55 0-1 .45-1 1s.45 1 1 1h10.59L10.3 7.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L14 6.41V8c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1z"],
    "known-vehicle": ["M15 3a.997.997 0 00-.707.293L12 5.586l-1.293-1.293a1 1 0 10-1.414 1.414l2 2a.997.997 0 001.414 0l3-3A1 1 0 0015 3zm-.879 6.121l-.007-.007c-.313.309-.69.552-1.114.702V10h-.998H12h-1v-.184c-.424-.15-.8-.395-1.112-.704l-.01.01-2-2 .012-.012A2.978 2.978 0 017.184 6H3c-.176 0-.06-.824 0-1l.73-1.63C3.79 3.192 3.823 3 4 3H7.78C8.328 2.39 9.115 2 10 2c.768 0 1.461.293 1.987.77l.844-.844c-.238-.244-.524-.442-.794-.524C12.037 1.402 10.72 1 8 1c-2.72 0-4.037.402-4.037.402-.508.155-1.078.711-1.268 1.237l-.763 2.117H.88c-.484 0-.88.423-.88.939s.396.939.88.939h.375L1 7c-.034.685 0 1.436 0 2v5c0 .657.384 1 1 1s1-.343 1-1v-1h10v1c0 .657.384 1 1 1s1-.343 1-1V9l-.003-.754-.876.875zM5.001 10H3V8h2v2z"],
    "label": ["M11 2H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V7l-5-5zm3 10H2V4h8v2H3v1h7v1h4v4zm-3-5V4l3 3h-3zm-8 3h10V9H3v1z"],
    "layer": ["M16 8c0-.37-.21-.68-.51-.85l.01-.01-7-4-.01.01C8.34 3.06 8.18 3 8 3s-.34.06-.49.15l-.01-.02-7 4 .01.01C.21 7.32 0 7.63 0 8s.21.68.51.85l-.01.01 7 4 .01-.01c.15.09.31.15.49.15s.34-.06.49-.15l.01.01 7-4-.01-.01c.3-.17.51-.48.51-.85z"],
    "layers": ["M.55 4.89l7 3.5c.14.07.29.11.45.11s.31-.04.45-.11l7-3.5a.998.998 0 00-.06-1.81L8.4.08a1.006 1.006 0 00-.79 0l-6.99 3a.992.992 0 00-.07 1.81zM15 10c-.16 0-.31.04-.45.11L8 13.38 1.45 10.1c-.14-.06-.29-.1-.45-.1-.55 0-1 .45-1 1 0 .39.23.73.55.89l7 3.5c.14.07.29.11.45.11s.31-.04.45-.11l7-3.5c.32-.16.55-.5.55-.89 0-.55-.45-1-1-1zm0-3.5c-.16 0-.31.04-.45.11L8 9.88 1.45 6.61A.997.997 0 001 6.5c-.55 0-1 .45-1 1 0 .39.23.73.55.89l7 3.5c.14.07.29.11.45.11s.31-.04.45-.11l7-3.5c.32-.16.55-.5.55-.89 0-.55-.45-1-1-1z"],
    "layout": ["M14 4c-1.1 0-2 .9-2 2 0 .47.17.9.44 1.24l-.68.91A1.996 1.996 0 009.07 9.5H7.93C7.71 8.64 6.93 8 6 8c-.47 0-.9.17-1.24.44l-.91-.68c.1-.23.15-.49.15-.76 0-.37-.11-.71-.28-1.01l2.27-2.27c.3.17.64.28 1.01.28 1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2c0 .37.11.71.28 1.01L3.01 5.28C2.71 5.11 2.37 5 2 5 .9 5 0 5.9 0 7s.9 2 2 2c.47 0 .9-.17 1.24-.44l.91.68c-.1.23-.15.49-.15.76 0 .37.11.71.28 1.01l-1.27 1.27C2.71 12.11 2.37 12 2 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2c0-.37-.11-.71-.28-1.01l1.27-1.27c.3.17.64.28 1.01.28.93 0 1.71-.64 1.93-1.5h1.14c.22.86 1 1.5 1.93 1.5 1.1 0 2-.9 2-2 0-.47-.17-.9-.44-1.24l.68-.91c.23.1.49.15.76.15 1.1 0 2-.9 2-2s-.9-2-2-2z"],
    "layout-auto": ["M14 9.5c-.56 0-1.06.23-1.42.59L8.99 8l3.59-2.09A2.002 2.002 0 0016 4.5c0-1.1-.9-2-2-2s-2 .9-2 2c0 .19.03.37.08.54L8.5 7.13v-3.2c.86-.22 1.5-1 1.5-1.93 0-1.1-.9-2-2-2S6 .9 6 2c0 .93.64 1.71 1.5 1.93v3.2L3.92 5.04c.05-.17.08-.35.08-.54 0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2c.56 0 1.06-.23 1.42-.59L7.01 8l-3.59 2.09A2.002 2.002 0 000 11.5c0 1.1.9 2 2 2s2-.9 2-2c0-.19-.03-.37-.08-.54L7.5 8.87v3.2c-.86.22-1.5 1-1.5 1.93 0 1.1.9 2 2 2s2-.9 2-2c0-.93-.64-1.71-1.5-1.93v-3.2l3.58 2.09c-.05.17-.08.35-.08.54 0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2z"],
    "layout-balloon": ["M14 11c-.2 0-.38.04-.56.09L12.42 9.4c.36-.36.58-.85.58-1.4 0-.55-.22-1.04-.58-1.4l1.01-1.69c.19.05.37.09.57.09 1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2c0 .55.22 1.04.58 1.4l-1.01 1.69C11.38 6.04 11.2 6 11 6c-.93 0-1.71.64-1.93 1.5H6.93C6.71 6.64 5.93 6 5 6c-.2 0-.38.04-.56.09L3.42 4.4C3.78 4.04 4 3.55 4 3c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2c.2 0 .38-.04.56-.09L3.58 6.6C3.22 6.96 3 7.45 3 8c0 .55.22 1.04.58 1.4l-1.01 1.69C2.38 11.04 2.2 11 2 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2c0-.55-.22-1.04-.58-1.4l1.01-1.69c.19.05.37.09.57.09.93 0 1.71-.64 1.93-1.5h2.14c.22.86 1 1.5 1.93 1.5.2 0 .38-.04.56-.09l1.01 1.69c-.35.36-.57.85-.57 1.4 0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2z"],
    "layout-circle": ["M14.16 6.02c-.12-.36-.26-.7-.43-1.03.17-.29.27-.63.27-.99 0-1.1-.9-2-2-2-.36 0-.7.1-.99.27-.33-.17-.67-.31-1.03-.43A1.987 1.987 0 008 0C6.95 0 6.1.81 6.02 1.84c-.36.12-.7.26-1.03.43C4.7 2.1 4.36 2 4 2c-1.1 0-2 .9-2 2 0 .36.1.7.27.99-.17.33-.31.67-.43 1.03C.81 6.1 0 6.95 0 8c0 1.05.81 1.9 1.84 1.98.12.36.26.7.43 1.03-.17.29-.27.63-.27.99 0 1.1.9 2 2 2 .36 0 .7-.1.99-.27.33.17.67.32 1.03.43C6.1 15.19 6.95 16 8 16c1.05 0 1.9-.81 1.98-1.84.36-.12.7-.26 1.03-.43.29.17.63.27.99.27 1.1 0 2-.9 2-2 0-.36-.1-.7-.27-.99.17-.33.31-.67.43-1.03C15.19 9.9 16 9.05 16 8c0-1.05-.81-1.9-1.84-1.98zm-.99 3.79c-.05.16-.11.31-.17.46-.3-.17-.64-.27-1-.27-1.1 0-2 .9-2 2 0 .36.1.7.27 1-.15.07-.3.12-.46.17C9.5 12.48 8.81 12 8 12s-1.5.48-1.81 1.17c-.16-.06-.32-.11-.46-.17.17-.3.27-.64.27-1 0-1.1-.9-2-2-2-.36 0-.7.1-1 .27-.07-.15-.12-.3-.17-.46C3.52 9.5 4 8.81 4 8s-.48-1.5-1.17-1.81c.06-.16.11-.32.17-.46.3.17.64.27 1 .27 1.1 0 2-.9 2-2 0-.36-.1-.7-.27-1 .15-.07.3-.12.46-.17C6.5 3.52 7.19 4 8 4s1.5-.48 1.81-1.17c.16.06.32.11.46.17-.17.3-.27.64-.27 1 0 1.1.9 2 2 2 .36 0 .7-.1 1-.27.07.15.12.3.17.46C12.48 6.5 12 7.19 12 8s.48 1.5 1.17 1.81z"],
    "layout-grid": ["M2 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM8 0C6.9 0 6 .9 6 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM8 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"],
    "layout-group-by": ["M2 6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12-7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM2 1C.9 1 0 1.9 0 3s.9 2 2 2 2-.9 2-2-.9-2-2-2zm7 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm5 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"],
    "layout-hierarchy": ["M14.5 12.07V9.93c.86-.22 1.5-1 1.5-1.93 0-1.1-.9-2-2-2-.93 0-1.71.64-1.93 1.5H9.93c-.18-.7-.73-1.25-1.43-1.43V3.93c.86-.22 1.5-1 1.5-1.93 0-1.1-.9-2-2-2S6 .9 6 2c0 .93.64 1.71 1.5 1.93v2.14c-.7.18-1.25.73-1.43 1.43H3.93C3.71 6.64 2.93 6 2 6 .9 6 0 6.9 0 8c0 .93.64 1.71 1.5 1.93v2.14c-.86.22-1.5 1-1.5 1.93 0 1.1.9 2 2 2s2-.9 2-2c0-.93-.64-1.71-1.5-1.93V9.93c.7-.18 1.25-.73 1.43-1.43h2.14c.18.7.73 1.25 1.43 1.43v2.14c-.86.22-1.5 1-1.5 1.93 0 1.1.9 2 2 2s2-.9 2-2c0-.93-.64-1.71-1.5-1.93V9.93c.7-.18 1.25-.73 1.43-1.43h2.14c.18.7.73 1.25 1.43 1.43v2.14c-.86.22-1.5 1-1.5 1.93 0 1.1.9 2 2 2s2-.9 2-2c0-.93-.64-1.71-1.5-1.93z"],
    "layout-linear": ["M14 6c-.93 0-1.71.64-1.93 1.5H9.93C9.71 6.64 8.93 6 8 6s-1.71.64-1.93 1.5H3.93C3.71 6.64 2.93 6 2 6 .9 6 0 6.9 0 8s.9 2 2 2c.93 0 1.71-.64 1.93-1.5h2.13C6.29 9.36 7.07 10 8 10s1.71-.64 1.93-1.5h2.13c.22.86 1 1.5 1.93 1.5 1.1 0 2-.9 2-2C16 6.9 15.1 6 14 6z"],
    "layout-skew-grid": ["M2 6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12-2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM2 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM2 0C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM8 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"],
    "layout-sorted-clusters": ["M2 6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM2 0C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM8 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"],
    "learning": ["M8.441 1.104a.985.985 0 00-.882 0L.365 5c-.487.253-.487.747 0 1L7.56 9.896a.985.985 0 00.882 0L15.635 6c.487-.253.487-.747 0-1L8.44 1.104z",
        "M14 5.5l.016 4.514c.002.548.447.99.994.99a.99.99 0 00.99-.99V5.5h-2zM3.371 9.047l4.387 2.432a.5.5 0 00.485 0l4.39-2.432a.25.25 0 01.371.218v2.955a.25.25 0 01-.134.222l-4.635 2.436a.5.5 0 01-.466 0l-4.635-2.436A.25.25 0 013 12.22V9.265a.25.25 0 01.371-.218z"],
    "left-join": ["M6.6 3.3C6.1 3.1 5.6 3 5 3 2.2 3 0 5.2 0 8s2.2 5 5 5c.6 0 1.1-.1 1.6-.3C5.3 11.6 4.5 9.9 4.5 8s.8-3.6 2.1-4.7zM8 4c-1.2.9-2 2.4-2 4s.8 3.1 2 4c1.2-.9 2-2.3 2-4s-.8-3.1-2-4zm3-1c2.8 0 5 2.2 5 5s-2.2 5-5 5c-.6 0-1.1-.1-1.6-.3 1.3-1.1 2.1-2.9 2.1-4.7s-.8-3.5-2.1-4.7c.5-.2 1-.3 1.6-.3zm.35 1.02c.73 1.15 1.14 2.52 1.14 3.98s-.42 2.83-1.14 3.98c2.04-.18 3.64-1.9 3.64-3.98s-1.6-3.8-3.64-3.98z"],
    "less-than": ["M13.287 5.958a1 1 0 00-.574-1.916l-10 3c-.95.285-.95 1.631 0 1.916l10 3a1 1 0 00.574-1.916L6.48 8l6.807-2.042z"],
    "less-than-or-equal-to": ["M13.287 3.958a1 1 0 00-.575-1.916l-10 3c-.95.285-.95 1.63 0 1.916l10 3a1 1 0 00.575-1.916L6.48 6l6.807-2.042zM13 12H3a1 1 0 000 2h10a1 1 0 000-2z"],
    "lifesaver": ["M9.405 11.746C8.968 11.91 8.495 12 8 12c-.494 0-.968-.09-1.405-.254l-.702 1.873C6.548 13.865 7.258 14 8 14c.742 0 1.452-.135 2.107-.38l-.702-1.874zm2.341-2.341l1.873.702C13.865 9.452 14 8.742 14 8c0-.742-.135-1.452-.38-2.107l-1.874.702c.164.437.254.91.254 1.405 0 .494-.09.968-.254 1.405zM9.405 4.254l.702-1.873A5.987 5.987 0 008 2c-.742 0-1.452.135-2.107.38l.702 1.874C7.032 4.09 7.505 4 8 4c.494 0 .968.09 1.405.254zM4.254 6.595L2.38 5.893A5.987 5.987 0 002 8c0 .742.135 1.452.38 2.107l1.874-.702A3.991 3.991 0 014 8c0-.494.09-.968.254-1.405zM8 16A8 8 0 118 0a8 8 0 010 16zm0-6a2 2 0 100-4 2 2 0 000 4z"],
    "lightbulb": ["M9.01 14h-2c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1s-.44-1-1-1zm1-3h-4c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.44-1-1-1zm-2-11C5.26 0 3.03 1.95 3.03 4.35c0 2.37 1.63 2.64 1.94 5.22 0 .24.22.44.5.44h5.09c.28 0 .5-.19.5-.44C11.37 6.99 13 6.72 13 4.35 13 1.95 10.77 0 8.01 0z"],
    "link": ["M4.99 11.99c.28 0 .53-.11.71-.29l6-6a1.003 1.003 0 00-1.42-1.42l-6 6a1.003 1.003 0 00.71 1.71zm3.85-2.02L6.4 12.41l-1 1-.01-.01c-.36.36-.85.6-1.4.6-1.1 0-2-.9-2-2 0-.55.24-1.04.6-1.4l-.01-.01 1-1 2.44-2.44c-.33-.1-.67-.16-1.03-.16-1.1 0-2.09.46-2.81 1.19l-.02-.02-1 1 .02.02c-.73.72-1.19 1.71-1.19 2.81 0 2.21 1.79 4 4 4 1.1 0 2.09-.46 2.81-1.19l.02.02 1-1-.02-.02c.73-.72 1.19-1.71 1.19-2.81 0-.35-.06-.69-.15-1.02zm7.15-5.98c0-2.21-1.79-4-4-4-1.1 0-2.09.46-2.81 1.19l-.02-.02-1 1 .02.02c-.72.72-1.19 1.71-1.19 2.81 0 .36.06.69.15 1.02l2.44-2.44 1-1 .01.01c.36-.36.85-.6 1.4-.6 1.1 0 2 .9 2 2 0 .55-.24 1.04-.6 1.4l.01.01-1 1-2.43 2.45c.33.09.67.15 1.02.15 1.1 0 2.09-.46 2.81-1.19l.02.02 1-1-.02-.02a3.92 3.92 0 001.19-2.81z"],
    "list": ["M1 3h14c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm14 10H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zm0-4H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zm0-4H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "list-columns": ["M6 1c.55 0 1 .45 1 1s-.45 1-1 1H1c-.55 0-1-.45-1-1s.45-1 1-1h5zm0 4c.55 0 1 .45 1 1s-.45 1-1 1H1c-.55 0-1-.45-1-1s.45-1 1-1h5zm0 4c.55 0 1 .45 1 1s-.45 1-1 1H1c-.55 0-1-.45-1-1s.45-1 1-1h5zm0 4c.55 0 1 .45 1 1s-.45 1-1 1H1c-.55 0-1-.45-1-1s.45-1 1-1h5zm9-12c.55 0 1 .45 1 1s-.45 1-1 1h-5c-.55 0-1-.45-1-1s.45-1 1-1h5zm0 4c.55 0 1 .45 1 1s-.45 1-1 1h-5c-.55 0-1-.45-1-1s.45-1 1-1h5zm0 4c.55 0 1 .45 1 1s-.45 1-1 1h-5c-.55 0-1-.45-1-1s.45-1 1-1h5zm0 4c.55 0 1 .45 1 1s-.45 1-1 1h-5c-.55 0-1-.45-1-1s.45-1 1-1h5z"],
    "list-detail-view": ["M6 9H1c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1zm0 4H1c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1zm9-12h-5c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zM6 5H1c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1zm0-4H1c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "locate": ["M15 7h-.09A6.98 6.98 0 009 1.1V1c0-.55-.45-1-1-1S7 .45 7 1v.09A6.98 6.98 0 001.1 7H1c-.55 0-1 .45-1 1s.45 1 1 1h.1A6.969 6.969 0 007 14.91V15c0 .55.45 1 1 1s1-.45 1-1v-.09A6.98 6.98 0 0014.9 9h.1c.55 0 1-.45 1-1s-.45-1-1-1zm-6.02 5.9c-.05-.5-.46-.9-.98-.9s-.93.4-.98.9A5.017 5.017 0 013.1 8.98c.5-.05.9-.46.9-.98s-.4-.93-.9-.98A5.017 5.017 0 017.02 3.1c.05.5.46.9.98.9s.93-.4.98-.9c1.97.39 3.52 1.95 3.92 3.92-.5.05-.9.46-.9.98s.4.93.9.98a5.017 5.017 0 01-3.92 3.92zM8 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"],
    "lock": ["M13.96 7H12V3.95C12 1.77 10.21 0 8 0S4 1.77 4 3.95V7H1.96c-.55 0-.96.35-.96.9v6.91c0 .54.41 1.19.96 1.19h12c.55 0 1.04-.65 1.04-1.19V7.9c0-.55-.49-.9-1.04-.9zM6 7V3.95c0-1.09.9-1.97 2-1.97s2 .88 2 1.97V7H6z"],
    "log-in": ["M11 8c0-.28-.11-.53-.29-.71l-3-3a1.003 1.003 0 00-1.42 1.42L7.59 7H1c-.55 0-1 .45-1 1s.45 1 1 1h6.59L6.3 10.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71zm4-8H9c-.55 0-1 .45-1 1s.45 1 1 1h5v12H9c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "log-out": ["M7 14H2V2h5c.55 0 1-.45 1-1s-.45-1-1-1H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1zm8.71-6.71l-3-3a1.003 1.003 0 00-1.42 1.42L12.59 7H6c-.55 0-1 .45-1 1s.45 1 1 1h6.59l-1.29 1.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"],
    "manual": ["M15.99 1.13c-.02-.41-.33-.77-.78-.87C12.26-.36 9.84.13 8 1.7 6.16.13 3.74-.36.78.26.33.35.03.72.01 1.13H0v12c0 .08 0 .17.02.26.12.51.65.82 1.19.71 2.63-.55 4.59-.04 6.01 1.57.02.03.06.04.08.06.02.02.03.04.05.06.04.03.09.04.13.07.05.03.09.05.14.07.11.04.23.07.35.07h.04c.12 0 .24-.03.35-.07.05-.02.09-.05.14-.07.04-.02.09-.04.13-.07.02-.02.03-.04.05-.06.03-.02.06-.03.08-.06 1.42-1.6 3.39-2.12 6.01-1.57.54.11 1.07-.21 1.19-.71.04-.09.04-.18.04-.26l-.01-12zM7 12.99c-1.4-.83-3.07-1.14-5-.93V1.96c2.11-.28 3.75.2 5 1.46v9.57zm7-.92c-1.93-.21-3.6.1-5 .93V3.42c1.25-1.26 2.89-1.74 5-1.46v10.11z"],
    "manually-entered-data": ["M1 8h3.76l2-2H1c-.55 0-1 .45-1 1s.45 1 1 1zm14.49-4.01c.31-.32.51-.76.51-1.24C16 1.78 15.22 1 14.25 1c-.48 0-.92.2-1.24.51l-1.44 1.44 2.47 2.47 1.45-1.43zM1 4h7.76l2-2H1c-.55 0-1 .45-1 1s.45 1 1 1zm0 6c-.55 0-1 .45-1 1 0 .48.35.86.8.96L2.76 10H1zm9.95-6.43l-6.69 6.69 2.47 2.47 6.69-6.69-2.47-2.47zm4.25 2.47L13.24 8H15c.55 0 1-.45 1-1 0-.48-.35-.86-.8-.96zM2 15l3.86-1.39-2.46-2.44L2 15zm13-5h-3.76l-2 2H15c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "map": ["M15.55 3.17l-4.49-3A.975.975 0 009.99.15L5.53 2.82 1.56.17A1.003 1.003 0 000 1v11c0 .35.18.65.45.83l4.49 3a.975.975 0 001.07.02l4.46-2.67 3.97 2.65A1.003 1.003 0 0016 15V4c0-.35-.18-.65-.45-.83zM5 13.46l-3-2v-8.6l2.94 1.96c.02.02.04.03.06.04v8.6zm5-2.32s-.01 0-.01.01L6 13.53V4.86s.01 0 .01-.01L10 2.47v8.67zm4 1.99l-2.94-1.96c-.02-.01-.04-.02-.05-.03v-8.6l3 2v8.59z"],
    "map-create": ["M14 6.82v6.32l-2.94-1.96c-.02-.01-.04-.02-.05-.03V6.22c-.08-.07-.15-.16-.22-.24-.28-.02-.54-.08-.79-.16v5.32s-.01 0-.01.01L6 13.53V4.86s.01 0 .01-.01l2.05-1.23C8.02 3.42 8 3.21 8 3c0-.98.47-1.84 1.2-2.39l-3.67 2.2L1.56.17A1.003 1.003 0 000 1v11c0 .35.18.65.45.83l4.49 3a.975.975 0 001.07.02l4.46-2.67 3.97 2.65A1.003 1.003 0 0016 15V5.82c-.25.09-.52.14-.8.16-.33.36-.73.67-1.2.84zm-9 6.64l-3-2v-8.6l2.94 1.96c.02.02.04.03.06.04v8.6zM11 4h1v1c0 .55.45 1 1 1s1-.45 1-1V4h1c.55 0 1-.45 1-1s-.45-1-1-1h-1V1c0-.55-.45-1-1-1s-1 .45-1 1v1h-1c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "map-marker": ["M8.46 0C5.42 0 2.95 2.39 2.95 5.33 2.95 8.28 8.46 16 8.46 16s5.51-7.72 5.51-10.67C13.96 2.39 11.5 0 8.46 0zm0 8a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"],
    "maximize": ["M5.99 8.99c-.28 0-.53.11-.71.29l-3.29 3.29v-1.59c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1H3.41L6.7 10.7a1.003 1.003 0 00-.71-1.71zm9-9h-4c-.55 0-1 .45-1 1s.45 1 1 1h1.59l-3.3 3.3a.99.99 0 00-.29.7 1.003 1.003 0 001.71.71l3.29-3.29V5c0 .55.45 1 1 1s1-.45 1-1V1c0-.56-.45-1.01-1-1.01z"],
    "media": ["M11.99 6.99c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm3-5h-14c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-10c0-.55-.45-1-1-1zm-1 9l-5-3-1 2-3-4-3 5v-7h12v7z"],
    "menu": ["M1 4h14c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm14 8H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zm0-5H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "menu-closed": ["M14.99 6.99h-9c-.55 0-1 .45-1 1s.45 1 1 1h9c.55 0 1-.45 1-1s-.45-1-1-1zm-12-2c-.28 0-.53.11-.71.29l-2 2a1.014 1.014 0 000 1.42l2 2a1.003 1.003 0 001.71-.71v-4c0-.55-.45-1-1-1zm3-1h9c.55 0 1-.45 1-1s-.45-1-1-1h-9c-.55 0-1 .45-1 1s.45 1 1 1zm9 8h-9c-.55 0-1 .45-1 1s.45 1 1 1h9c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "menu-open": ["M9.99 11.99h-9c-.55 0-1 .45-1 1s.45 1 1 1h9c.55 0 1-.45 1-1s-.45-1-1-1zm0-5h-9c-.55 0-1 .45-1 1s.45 1 1 1h9c.55 0 1-.45 1-1s-.45-1-1-1zm0-5h-9c-.55 0-1 .45-1 1s.45 1 1 1h9c.55 0 1-.45 1-1s-.45-1-1-1zm5.71 5.3l-2-2a1.003 1.003 0 00-1.71.71v4a1.003 1.003 0 001.71.71l2-2c.18-.18.29-.43.29-.71s-.11-.53-.29-.71z"],
    "merge-columns": ["M5.71 5.29a1.003 1.003 0 00-1.42 1.42l.3.29H2V2h3v1.51c.52.06.99.29 1.34.65l.66.66V1c0-.55-.45-1-1-1H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-3.82l-.66.66c-.35.35-.82.59-1.34.65V14H2V9h2.59l-.3.29a1.003 1.003 0 001.42 1.42l2-2C7.89 8.53 8 8.28 8 8c0-.28-.11-.53-.29-.71l-2-2zM15 0h-5c-.55 0-1 .45-1 1v3.82l.66-.66c.35-.35.82-.59 1.34-.65V2h3v5h-2.59l.29-.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-2 2C8.11 7.47 8 7.72 8 8c0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42l-.3-.29H14v5h-3v-1.51c-.52-.06-.99-.29-1.34-.65L9 11.18V15c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "merge-links": ["M8 7c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6 3c-.93 0-1.71.64-1.93 1.5H11V3c0-1.66-1.34-3-3-3S5 1.34 5 3v4.5H3.93C3.71 6.64 2.93 6 2 6 .9 6 0 6.9 0 8s.9 2 2 2c.93 0 1.71-.64 1.93-1.5H5V13c0 1.66 1.34 3 3 3s3-1.34 3-3V8.5h1.07c.22.86 1 1.5 1.93 1.5 1.1 0 2-.9 2-2s-.9-2-2-2zm-4 7c0 1.1-.9 2-2 2s-2-.9-2-2V3c0-1.1.9-2 2-2s2 .9 2 2v10z"],
    "minimize": ["M15.99.99a1.003 1.003 0 00-1.71-.71l-3.29 3.29V1.99c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1H12.4l3.3-3.29c.18-.18.29-.43.29-.71zm-10 8h-4c-.55 0-1 .45-1 1s.45 1 1 1h1.59L.29 14.28a1.003 1.003 0 001.42 1.42L5 12.41V14c0 .55.45 1 1 1s1-.45 1-1v-4a1.02 1.02 0 00-1.01-1.01z"],
    "minus": ["M13 7H3c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "mobile-phone": ["M12 0H4c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM8 15c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3-3H5V3h6v9z"],
    "mobile-video": ["M15 4c-.28 0-.53.11-.71.29L12 6.59V4c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V9.41l2.29 2.29c.18.19.43.3.71.3.55 0 1-.45 1-1V5c0-.55-.45-1-1-1z"],
    "moon": ["M15 11.38A7.835 7.835 0 017.85 16C3.51 16 0 12.49 0 8.15 0 4.97 1.89 2.23 4.62 1c-.45.99-.7 2.08-.7 3.23a7.85 7.85 0 007.85 7.85c1.15 0 2.24-.25 3.23-.7z"],
    "more": ["M2 6.03a2 2 0 100 4 2 2 0 100-4zM14 6.03a2 2 0 100 4 2 2 0 100-4zM8 6.03a2 2 0 100 4 2 2 0 100-4z"],
    "mountain": ["M16 13H3l6-9h1l2 2h1l3 7zm-2.5-3.5l-1-2.5h-1l-2-2-3 4.5L9 8l1 1 1-1 2.5 1.5zM5.94 7l-4.122 6H0l5-6h.94z"],
    "move": ["M15.71 7.29l-2-2a1.003 1.003 0 00-1.42 1.42l.3.29H9V3.41l.29.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-2-2C8.53.11 8.28 0 8 0s-.53.11-.71.29l-2 2a1.003 1.003 0 001.42 1.42l.29-.3V7H3.41l.29-.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-2 2C.11 7.47 0 7.72 0 8c0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42L3.41 9H7v3.59l-.29-.29A.965.965 0 006 12a1.003 1.003 0 00-.71 1.71l2 2c.18.18.43.29.71.29s.53-.11.71-.29l2-2a1.003 1.003 0 00-1.42-1.42l-.29.3V9h3.59l-.29.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l2-2c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"],
    "mugshot": ["M15 0H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 14h-.15c-.03-.09-.04-.16-.08-.25-.34-.79-2.01-1.31-3.12-1.8-1.11-.49-.96-.79-1-1.2-.01-.06-.01-.12-.01-.18.38-.34.69-.8.89-1.33 0 0 .01-.03.01-.04.04-.12.08-.24.11-.36.25-.05.4-.33.46-.59.06-.1.18-.36.15-.65-.04-.37-.19-.55-.35-.62v-.06c0-.48-.04-1.16-.13-1.61-.02-.12-.05-.25-.08-.37-.16-.55-.51-1.05-.96-1.39C9.26 3.19 8.6 3 8 3c-.59 0-1.26.19-1.73.55-.45.35-.8.84-.96 1.39-.04.13-.06.25-.08.38-.09.45-.13 1.13-.13 1.61v.06c-.18.06-.33.24-.37.62-.03.29.09.54.15.65.06.26.21.54.47.59.03.12.07.25.11.36 0 .01.01.02.01.02v.01c.21.54.53 1.01.92 1.35 0 .05-.01.11-.01.16-.04.41.08.7-1.03 1.2-1.11.49-2.77 1.01-3.12 1.8-.04.09-.05.16-.08.25H2V2h12v12z"],
    "multi-select": ["M12 3.98H4c-.55 0-1 .45-1 1v1h8v5h1c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1zm3-3H7c-.55 0-1 .45-1 1v1h8v5h1c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1zm-6 6H1c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1zm-1 5H2v-3h6v3z"],
    "music": ["M15 0c-.07 0-.13.03-.19.04V.02l-10 2v.02C4.35 2.13 4 2.52 4 3v9.12c-.31-.07-.65-.12-1-.12-1.66 0-3 .9-3 2s1.34 2 3 2 3-.9 3-2V6.32l8-1.6v5.4c-.31-.07-.65-.12-1-.12-1.66 0-3 .9-3 2s1.34 2 3 2 3-.9 3-2V1c0-.55-.45-1-1-1z"],
    "new-drawing": ["M14.9 11c.6 0 1 .5 1 1 0 .257-.073.44-.22.614l-.08.086-3 3c-.2.2-.4.3-.7.3-.5 0-1-.4-1-1 0-.257.073-.44.22-.614l.08-.086 3-3c.2-.2.4-.3.7-.3zM1.3.1l6.734 2.45a3.005 3.005 0 002.095 3.322 3.005 3.005 0 003.401 2.081L13.9 9.8v.2c0 .257-.073.44-.22.614l-.08.086-3 3c-.171.171-.343.27-.577.294L9.9 14h-.2l-5-1-.1-.01c-.231-.05-.45-.26-.56-.49L4 12.4l-4-11 .3-.3 5.8 5.8c-.1.2-.2.4-.2.6 0 .8.6 1.5 1.5 1.5s1.5-.7 1.5-1.5S8.2 6 7.4 6c-.16 0-.32.064-.48.14l-.12.06L1 .4l.3-.3zM13 0c.55 0 1 .45 1 1v1h1c.55 0 1 .45 1 1s-.45 1-1 1h-1v1c0 .503-.376.922-.861.99l-.013.002A.999.999 0 0113 6l.097-.006-.027.004a1 1 0 01-.037.001L13 6c-.55 0-1-.45-1-1V4h-1a.993.993 0 01-.855-.482A1 1 0 0110 3c0-.55.45-1 1-1h1V1c0-.55.45-1 1-1z"],
    "new-grid-item": ["M6 0H1C.45 0 0 .45 0 1v5c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm5 14c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1s-.45-1-1-1zM6 9H1c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1zm9 4c-.55 0-1 .45-1 1-.55 0-1 .45-1 1s.45 1 1 1h1c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zm-4-4h-1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1s1-.45 1-1c.55 0 1-.45 1-1s-.45-1-1-1zm4-9h-5c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm0 9h-1c-.55 0-1 .45-1 1s.45 1 1 1c0 .55.45 1 1 1s1-.45 1-1v-1c0-.55-.45-1-1-1z"],
    "new-layer": ["M13.982 6.272l1.518.868-.01.01c.3.17.51.48.51.85s-.21.68-.51.85l.01.01-7 4-.01-.01A.94.94 0 018 13a.94.94 0 01-.49-.15l-.01.01-7-4 .01-.01A.977.977 0 010 8c0-.37.21-.68.51-.86L.5 7.13l7-4 .01.02A.94.94 0 018 3c.086 0 .168.014.246.038a2 2 0 105.736 3.234zM14 3c.55 0 1 .45 1 1s-.45 1-1 1h-1v1c0 .55-.45 1-1 1s-1-.45-1-1V5h-1c-.55 0-1-.45-1-1s.45-1 1-1h1V2c0-.55.45-1 1-1s1 .45 1 1v1h1z"],
    "new-layers": ["M13 3h2a1 1 0 010 2h-2v2a1 1 0 01-2 0V5H9a1 1 0 110-2h2V1a1 1 0 012 0v2zm-3-1.983V2H9a2 2 0 100 4h1v1c0 .279.057.544.16.785l-1.71.855c-.14.07-.29.11-.45.11-.16 0-.31-.04-.45-.11l-7-3.5a.992.992 0 01.07-1.81l6.99-3a1.006 1.006 0 01.79 0l1.6.687zm.91 7.66a2 2 0 003.085-1.54l.555-.277c.14-.07.29-.11.45-.11.55 0 1 .45 1 1 0 .39-.23.73-.55.89l-7 3.5c-.14.07-.29.11-.45.11-.16 0-.31-.04-.45-.11l-7-3.5C.23 8.48 0 8.14 0 7.75c0-.55.45-1 1-1 .16 0 .31.04.45.11L8 10.13l2.91-1.453zM15 10.25c.55 0 1 .45 1 1 0 .39-.23.73-.55.89l-7 3.5c-.14.07-.29.11-.45.11-.16 0-.31-.04-.45-.11l-7-3.5c-.32-.16-.55-.5-.55-.89 0-.55.45-1 1-1 .16 0 .31.04.45.1L8 13.63l6.55-3.27c.14-.07.29-.11.45-.11z"],
    "new-link": ["M15 3h-1V2c0-.55-.45-1-1-1s-1 .45-1 1v1h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1V5h1c.55 0 1-.45 1-1s-.45-1-1-1zm-3.5 6a2.5 2.5 0 00-2.45 2h-4.1a2.5 2.5 0 100 1h4.1a2.5 2.5 0 102.45-3z"],
    "new-object": ["M8 4c0 .6.4 1 1 1h2v2c0 .6.4 1 1 1s1-.4 1-1V5h2c.6 0 1-.4 1-1s-.4-1-1-1h-2V1c0-.6-.4-1-1-1s-1 .4-1 1v2H9c-.6 0-1 .5-1 1zm6.5 2.5V7c0 1.4-1.1 2.5-2.5 2.5S9.5 8.4 9.5 7v-.5H9C7.6 6.5 6.5 5.4 6.5 4S7.6 1.5 9 1.5h.5V1c0-.3.1-.6.1-.8C9.1.1 8.6 0 8 0 3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8c0-.6-.1-1.3-.2-1.9-.4.3-.8.4-1.3.4z"],
    "new-person": ["M9.12 12.69c-1.17-.53-1.01-.85-1.05-1.29-.01-.06-.01-.12-.01-.19.4-.37.73-.87.94-1.44 0 0 .01-.03.01-.04.05-.14.09-.27.12-.4.27-.06.43-.36.49-.63.06-.11.19-.39.16-.7-.04-.41-.2-.6-.38-.68v-.07c0-.51-.05-1.25-.14-1.74-.02-.13-.05-.27-.09-.4-.17-.6-.53-1.14-1.01-1.52C7.66 3.2 6.96 3 6.33 3c-.62 0-1.33.2-1.82.59-.49.38-.85.92-1.02 1.52-.04.13-.07.26-.09.4-.09.49-.13 1.23-.13 1.74v.06c-.19.08-.35.27-.39.68-.03.31.1.59.16.7.06.28.22.59.5.64.03.14.07.27.11.4 0 .01.01.02.01.02v.01c.22.59.55 1.1.96 1.46 0 .06-.01.12-.01.17-.04.44.08.76-1.09 1.29-1.17.53-2.93 1.1-3.29 1.95-.35.87-.2 1.37-.2 1.37h12.6s.15-.5-.22-1.36c-.36-.85-2.12-1.42-3.29-1.95zM14.89 2h-1V1c0-.55-.45-1-1-1s-1 .45-1 1v1h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1V4h1c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "new-prescription": ["M9.82 11.66l2.48-2.87c.12-.2.13-.37.04-.53-.11-.19-.3-.26-.52-.26h-1.29c-.27 0-.49.13-.63.34L8.44 9.9 6.95 8a.482.482 0 00-.08-.1L5.82 6.55c.57-.24 1.04-.57 1.42-1.01.49-.57.74-1.27.74-2.08 0-.51-.1-.99-.32-1.42-.21-.43-.51-.8-.89-1.11A4.1 4.1 0 005.42.24C4.91.08 4.34 0 3.72 0H.61C.26 0 0 .23 0 .56v9.89c0 .33.26.55.61.55h.8c.36 0 .61-.23.61-.56V6.99H3.3l3.73 4.74-2.71 3.48c-.12.2-.13.37-.04.53.11.19.3.26.52.26h1.27c.27 0 .51-.12.64-.34l1.69-2.15 1.66 2.14c.12.21.34.35.62.35h1.43c.2 0 .39-.08.5-.25.12-.18.09-.38-.02-.55l-2.77-3.54zM4.18 5H1.99V2.02h2.19c.62 0 1.08.13 1.38.37.29.22.44.62.44 1.08 0 .45-.15.94-.44 1.17-.31.23-.76.36-1.38.36zM15 2h-1V1c0-.55-.45-1-1-1s-1 .45-1 1v1h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1V4h1c.55 0 1-.45 1-1s-.45-1-1-1zM9.99 3.01c0 .02.01.04.01.06V2.95c0 .02-.01.04-.01.06z"],
    "new-text-box": ["M5 6.5c0 .28.22.5.5.5H7v3.5c0 .28.22.5.5.5s.5-.22.5-.5V7h1.5c.28 0 .5-.22.5-.5S9.78 6 9.5 6h-4c-.28 0-.5.22-.5.5zM15 2h-1V1c0-.55-.45-1-1-1s-1 .45-1 1v1h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1V4h1c.55 0 1-.45 1-1s-.45-1-1-1zm-2 5c-.55 0-1 .45-1 1v5H3V4h5c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h11c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1z"],
    "ninja": ["M16 5s-2.52 2.11-4.96 1.99C11.03 4.89 10.39.23 5 0c0 0 2.11 2.54 1.96 4.99C4.86 5.01.23 5.65 0 11c0 0 2.56-2.12 5.02-1.95.02 2.11.67 6.72 5.98 6.95 0 0-2.09-2.54-1.94-4.99 2.11-.02 6.71-.68 6.94-6.01zM8 9.5c-.83 0-1.5-.67-1.5-1.5S7.17 6.5 8 6.5s1.5.67 1.5 1.5S8.83 9.5 8 9.5z"],
    "not-equal-to": ["M7.58 5l.44-2.196a1 1 0 011.96.392L9.62 5H13a1 1 0 010 2H9.22l-.4 2H13a1 1 0 010 2H8.42l-.44 2.196a1 1 0 01-1.96-.392L6.38 11H3a1 1 0 010-2h3.78l.4-2H3a1 1 0 110-2h4.58z"],
    "notifications": ["M8 16c1.1 0 2-.9 2-2H6c0 1.1.9 2 2 2zm6-5c-.55 0-1-.45-1-1V6c0-2.43-1.73-4.45-4.02-4.9 0-.04.02-.06.02-.1 0-.55-.45-1-1-1S7 .45 7 1c0 .04.02.06.02.1A4.992 4.992 0 003 6v4c0 .55-.45 1-1 1s-1 .45-1 1 .45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "notifications-updated": ["M8 16c1.1 0 2-.9 2-2H6c0 1.1.9 2 2 2zm3.399-13.667l-.413.412A2.99 2.99 0 009 1.99a3 3 0 00-3 2.99c0 .8.32 1.558.876 2.114l2.002 1.992A2.99 2.99 0 0013 9.184V10c0 .55.45 1 1 1s1 .45 1 1-.45 1-1 1H2c-.55 0-1-.45-1-1s.45-1 1-1 1-.45 1-1V6c0-2.43 1.73-4.45 4.02-4.9 0-.04-.02-.06-.02-.1 0-.55.45-1 1-1s1 .45 1 1c0 .04-.02.06-.02.1a4.97 4.97 0 012.419 1.233zM10.29 7.67l-2-1.99a.99.99 0 01-.29-.7 1 1 0 011-.99c.27 0 .52.11.7.29l1.29 1.29 3.28-3.28c.18-.18.42-.29.7-.29.55 0 1 .44 1 .99 0 .28-.11.52-.3.7l-3.98 3.98a.99.99 0 01-1.4 0z"],
    "numbered-list": ["M2.76 7h1.26V0h-.94c-.04.21-.12.39-.25.54-.13.15-.29.27-.48.36-.18.09-.39.16-.62.2-.23.04-.46.06-.71.06v.9h1.74V7zm-.59 7.17c.18-.12.37-.25.58-.37a10.763 10.763 0 001.24-.83c.2-.16.37-.33.52-.51.15-.19.28-.39.37-.61.09-.22.14-.47.14-.74 0-.22-.04-.45-.12-.7-.08-.26-.21-.49-.4-.69-.18-.21-.43-.39-.72-.52-.3-.14-.68-.21-1.12-.21-.41 0-.77.07-1.08.2-.32.14-.58.32-.8.56-.22.23-.38.51-.49.84-.11.32-.16.67-.16 1.05h1.19c.01-.24.03-.47.08-.67.05-.21.11-.39.21-.54.09-.15.22-.27.38-.36.16-.09.35-.13.59-.13.26 0 .47.04.63.12.16.08.29.18.38.3.09.12.15.25.18.39s.05.27.05.4c-.01.27-.08.5-.22.71-.14.21-.32.4-.53.57-.22.18-.45.34-.71.49-.26.15-.51.31-.74.47-.5.31-.89.68-1.17 1.11-.3.41-.44.91-.45 1.48h5v-1H1.43c.05-.15.14-.29.27-.43.14-.13.29-.26.47-.38zM15.01 1.99h-7c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h7c.55 0 1-.45 1-1v-1c0-.55-.44-1-1-1zm0 9h-7c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h7c.55 0 1-.45 1-1v-1c0-.55-.44-1-1-1z"],
    "numerical": ["M2.79 4.61c-.13.17-.29.3-.48.41-.18.11-.39.18-.62.23-.23.04-.46.07-.71.07v1.03h1.74V12h1.26V4h-.94c-.04.23-.12.44-.25.61zm4.37 5.31c.18-.14.37-.28.58-.42l.63-.45c.21-.16.41-.33.61-.51s.37-.38.52-.59c.15-.21.28-.45.37-.7.09-.25.13-.54.13-.85 0-.25-.04-.52-.12-.8-.07-.29-.2-.55-.39-.79a2.18 2.18 0 00-.73-.6c-.29-.15-.66-.23-1.11-.23-.41 0-.77.08-1.08.23-.31.16-.58.37-.79.64-.22.27-.38.59-.49.96-.11.37-.16.77-.16 1.2h1.19c.01-.27.03-.53.08-.77.04-.24.11-.45.21-.62.09-.18.22-.32.38-.42.16-.1.35-.15.59-.15.26 0 .47.05.63.14.15.09.28.21.37.35.09.14.15.29.18.45.03.16.05.31.05.45-.01.31-.08.58-.22.82-.14.23-.32.45-.53.65-.22.21-.46.39-.71.57-.26.18-.51.36-.75.54-.5.36-.89.78-1.17 1.27-.28.49-.43 1.06-.44 1.71h5v-1.15H6.43c.05-.17.14-.33.27-.49.13-.15.29-.29.46-.44zm8.5-1.56c-.23-.35-.54-.57-.95-.65v-.02c.34-.13.6-.34.76-.63.16-.29.24-.63.24-1.02 0-.34-.06-.64-.19-.9s-.3-.47-.51-.64c-.21-.17-.45-.3-.72-.38-.27-.09-.54-.13-.82-.13-.36 0-.68.07-.96.2-.28.13-.53.32-.72.55-.2.23-.36.51-.47.83-.11.32-.18.66-.19 1.04h1.15c-.01-.2.01-.39.06-.58.05-.19.12-.36.22-.51.1-.15.22-.27.37-.36.15-.09.32-.13.53-.13.32 0 .59.1.79.3.21.2.31.46.31.79 0 .23-.05.43-.14.59-.09.16-.21.29-.35.38-.15.09-.32.16-.51.19-.19.04-.38.05-.57.04v.93c.23-.01.45 0 .67.02.22.02.42.08.59.17.18.09.32.23.43.4.11.18.16.41.16.71 0 .44-.13.78-.39 1.02s-.58.36-.97.36c-.45 0-.79-.16-1.02-.47-.23-.31-.33-.7-.32-1.17H11c.01.4.06.77.17 1.1.11.33.26.61.47.85.21.23.46.42.77.54.31.13.67.19 1.08.19.34 0 .66-.05.96-.16.3-.11.57-.27.8-.47.23-.2.41-.45.55-.74.13-.27.2-.6.2-.97 0-.5-.11-.92-.34-1.27z"],
    "office": ["M15 5h-3V1c0-.55-.45-1-1-1H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h3v-4h4v4h7c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zM5 10H2V7h3v3zm0-5H2V2h3v3zm5 5H7V7h3v3zm0-5H7V2h3v3zm4 9h-2v-2h2v2zm0-4h-2V7h2v3z"],
    "offline": ["M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zM6 14l1-5H4l6-7-1 5h3l-6 7z"],
    "oil-field": ["M15 14h-1.35l-3.34-7.51 2.46-.95 1.45 3.21c.09.2.36.3.6.23.1-.03.18-.08.24-.15.05-.08 1.23-1.56.87-4.2-.11-.79-.52-4.62-3.26-4.62-.93 0-1.68.62-1.67 1.37 0 .14.03.28.09.42l.87 1.92L.64 8.07v.01A.98.98 0 000 9c0 .55.45 1 1 1 .13 0 .25-.03.36-.07v.01l1.04-.4L3.67 14H2c-.55 0-1 .45-1 1s.45 1 1 1h13c.55 0 1-.45 1-1s-.45-1-1-1zM4.27 8.81L7.14 7.7 5.2 12.08l-.93-3.27zM6.54 14L9 8.46 11.46 14H6.54z"],
    "one-column": ["M11.99-.01h-3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-14c0-.55-.45-1-1-1zm-6 5c-.28 0-.53.11-.71.29l-2 2a1.014 1.014 0 000 1.42l2 2a1.003 1.003 0 001.71-.71v-4c0-.55-.45-1-1-1z"],
    "outdated": ["M8 0c4.42 0 8 3.58 8 8 0 4.06-3.02 7.4-6.94 7.92-.02 0-.04.01-.06.01-.33.04-.66.07-1 .07-4.42 0-8-3.58-8-8 0-.55.45-1 1-1s1 .45 1 1c0 3.31 2.69 6 6 6 .71 0 1.37-.15 2-.38v.01c2.33-.82 4-3.02 4-5.63 0-3.31-2.69-6-6-6-1.78 0-3.36.78-4.46 2H5c.55 0 1 .45 1 1s-.45 1-1 1H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1s1 .45 1 1v1.74A7.95 7.95 0 018 0zm1 12H7v-2h2v2zm0-3H7V4h2v5z"],
    "page-layout": ["M15 .95H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-12c0-.55-.45-1-1-1zm-9 12H2v-6h4v6zm8 0H7v-6h7v6zm0-7H2v-3h12v3z"],
    "panel-stats": ["M10 4h3v1h-3zM10 6h3v1h-3zM10 8h3v1h-3zM10 10h3v1h-3z",
        "M15 1H1c-.6 0-1 .4-1 1v11c0 .6.4 1 1 1h14c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1zM8 12H2V3h6v9zm6 0H9V3h5v9z"],
    "panel-table": ["M15 1H1c-.6 0-1 .4-1 1v11c0 .6.4 1 1 1h14c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1zM8 9H6V7h2v2zm0-3H6V4h2v2zm-6 6V3h3v9H2zm4 0v-2h2v2H6zm8 0H9v-2h5v2zm0-3H9V7h5v2zm0-3H9V4h5v2z"],
    "paperclip": ["M14.68 2.31A4.54 4.54 0 0011.46.99c-1.15 0-2.31.44-3.19 1.32L.95 9.63c-.63.63-.95 1.46-.95 2.28a3.21 3.21 0 003.23 3.22c.83 0 1.66-.31 2.3-.95l7.31-7.32c.76-.77.76-1.98.01-2.73s-1.99-.76-2.75 0l-6.07 6.08c-.24.25-.24.65.01.9s.65.25.91.01l6.07-6.08c.25-.25.67-.25.91-.01.25.25.25.67 0 .92l-7.31 7.32c-.75.75-2.04.74-2.76.01-.75-.75-.73-2.02.01-2.76L9.2 3.21c1.24-1.24 3.35-1.26 4.58-.03 1.24 1.24 1.24 3.36 0 4.6l-7.12 7.13c-.24.25-.24.64.01.88.24.24.63.24.88.01v.01l7.13-7.13A4.41 4.41 0 0016 5.51c0-1.16-.44-2.32-1.32-3.2z"],
    "paragraph": ["M13 1H6C3.8 1 2 2.8 2 5s1.8 4 4 4v5c0 .6.4 1 1 1s1-.5 1-1V3h2v11c0 .6.4 1 1 1s1-.5 1-1V3h1c.5 0 1-.4 1-1s-.4-1-1-1z"],
    "path": ["M14.5 0h-13C.67 0 0 .67 0 1.5S.67 3 1.5 3H7v3H3.5C2.67 6 2 6.67 2 7.5S2.67 9 3.5 9H7v3H5.5c-.83 0-1.5.67-1.5 1.5S4.67 15 5.5 15h5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H9V9h3.5c.83 0 1.5-.67 1.5-1.5S13.33 6 12.5 6H9V3h5.5c.83 0 1.5-.67 1.5-1.5S15.33 0 14.5 0z"],
    "path-search": ["M15 14.62l-4-2.4V9.77c-.32.09-.66.15-1 .18v2.27l-4 2.4V8.71c-.38-.31-.72-.66-1-1.06v6.97l-4-2.4V8c.55 0 1-.45 1-1s-.45-1-1-1V1.38l3.15 1.89c.08-.34.18-.66.32-.97L.76.07v.01A.496.496 0 00.5 0C.22 0 0 .22 0 .5v12c0 .18.1.33.25.42v.01l5 3v-.01c.07.05.16.08.25.08s.18-.03.25-.08v.01l4.74-2.85 4.74 2.85v-.01c.09.05.18.08.27.08.28 0 .5-.22.5-.5v-3.78c-.3.17-.63.28-1 .28v2.62zM2 5c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1zm6-1c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm7.75-.92l-1.19-.72c.18.43.29.9.36 1.38l.08.04v3.39l1 1V3.5c0-.18-.1-.33-.25-.42zM10 2c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm3.3 4.89c.44-.7.7-1.51.7-2.39C14 2.01 11.99 0 9.5 0S5 2.01 5 4.5 7.01 9 9.5 9c.88 0 1.69-.26 2.39-.7l2.41 2.41c.17.18.42.29.7.29a1.003 1.003 0 00.71-1.71l-2.41-2.4zM9.5 8C7.57 8 6 6.43 6 4.5S7.57 1 9.5 1 13 2.57 13 4.5 11.43 8 9.5 8z"],
    "pause": ["M6 3H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm6 0h-2c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "people": ["M13.69 13.98c-.05-.24-.14-.5-.25-.76-.36-.86-1.12-1.33-2.69-2-.14-.06-.59-.25-.6-.25-.21-.09-.36-.15-.5-.22.02-.1.02-.2.03-.31 0-.04.01-.08.01-.13-.07-.06-.13-.12-.19-.19.22-.32.4-.67.54-1.05.02-.06.02-.06.03-.1.29-.23.48-.57.59-.96.16-.33.25-.73.21-1.16-.03-.4-.16-.76-.37-1.03-.02-.53-.07-1.13-.15-1.54-.01-.06-.02-.12-.03-.19.23-.06.48-.09.72-.09.49 0 1.05.16 1.44.46.38.29.67.7.8 1.17.03.1.05.21.07.31.07.37.11.94.11 1.33v.05c.14.06.27.21.29.51.02.25-.07.45-.13.54-.05.21-.16.44-.38.48-.02.1-.05.2-.09.3 0 .01-.01.03-.01.03-.17.44-.43.83-.75 1.11v.14c.03.35-.09.59.83 1 .93.41 2.32.84 2.6 1.5.29.66.17 1.04.17 1.04h-2.3zm-1.17-.38c.37.86.22 1.36.22 1.36H.06s-.14-.5.22-1.36 2.13-1.43 3.31-1.96c1.17-.54 1.05-.86 1.09-1.3 0-.05.01-.11.01-.17-.41-.35-.75-.86-.97-1.45v-.01s-.01-.01-.01-.02c-.04-.12-.09-.26-.12-.39-.28-.05-.44-.36-.5-.64-.06-.12-.19-.39-.16-.71.04-.41.21-.6.39-.68v-.06c0-.51.05-1.26.14-1.74.02-.13.05-.27.09-.4.17-.6.54-1.13 1.02-1.51.5-.39 1.21-.6 1.84-.6s1.34.21 1.84.6c.48.38.85.91 1.02 1.52.04.13.07.27.09.4.09.48.14 1.22.14 1.73v.07c.18.08.34.27.37.67.03.32-.09.59-.16.71-.06.28-.21.58-.48.63-.03.13-.07.26-.12.39 0 .01-.01.04-.01.04-.22.58-.55 1.08-.95 1.45v.18c.04.45-.12.77 1.06 1.3 1.18.53 2.95 1.09 3.31 1.95z"],
    "percentage": ["M6 6V4c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2zM3.5 6c-.28 0-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5s.5.22.5.5v1c0 .28-.22.5-.5.5zM13 8h-1c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2zm0 3.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-1c0-.28.22-.5.5-.5s.5.22.5.5v1zM12 3a1.003 1.003 0 00-1.87-.5l-5.99 9.98c-.09.15-.14.33-.14.52a1.003 1.003 0 001.87.5l5.99-9.98c.09-.15.14-.33.14-.52z"],
    "person": ["M15.68 14.32c-.46-1.05-2.68-1.75-4.16-2.4-1.48-.65-1.28-1.05-1.33-1.59-.01-.07-.01-.15-.01-.23.51-.45.92-1.07 1.19-1.78 0 0 .01-.04.02-.05.06-.15.11-.32.15-.48.34-.07.54-.44.61-.78.08-.14.23-.48.2-.87-.05-.5-.25-.73-.47-.82v-.09c0-.63-.06-1.55-.17-2.15A3.671 3.671 0 0010.32.72C9.68.25 8.79-.01 8-.01c-.79 0-1.68.25-2.31.73-.61.47-1.06 1.13-1.28 1.86-.05.17-.09.33-.11.5-.12.6-.17 1.51-.17 2.15v.08c-.24.09-.45.32-.5.83-.03.38.13.72.2.86.08.35.28.72.63.78.04.17.09.33.15.49 0 .01.01.02.01.03l.01.01c.27.72.7 1.35 1.22 1.8 0 .07-.01.14-.01.21-.05.54.1.94-1.37 1.59-1.48.65-3.7 1.35-4.16 2.4-.46 1.05-.27 1.67-.27 1.67h15.92c-.01.01.18-.61-.28-1.66z"],
    "phone": ["M15.9 12.41c-.06-.06-3.37-2-3.48-2.05a.794.794 0 00-.32-.08c-.15 0-.34.11-.57.32-.23.22-.94 1.19-1.15 1.4-.21.22-.38.32-.52.32-.07 0-.15-.02-.25-.06-.1-.04-1.16-.58-3.36-2.52-2.2-1.93-2.49-3.2-2.5-3.55 0-.14.11-.31.32-.52.22-.21.45-.41.7-.6.25-.19.49-.4.7-.62.22-.23.32-.42.32-.57 0-.11-.03-.21-.08-.32C5.66 3.46 3.66.15 3.59.08 3.44-.07 2.85 0 2.55.16.16 1.46-.03 3.2 0 3.89c.04.71.49 4.46 4.16 7.95C8.72 16.17 11.89 16 12.1 16c.69 0 2.82-.38 3.72-2.55.13-.32.25-.87.08-1.04z"],
    "pie-chart": ["M7 1.08c-3.37.5-5.97 3.4-5.97 6.92 0 3.87 3.13 7 6.98 7 3.52 0 6.42-2.61 6.91-6H7V1.08z",
        "M8 0v8h8c0-4.42-3.58-8-8-8z"],
    "pin": ["M9.41.92c-.51.51-.41 1.5.15 2.56L4.34 7.54C2.8 6.48 1.45 6.05.92 6.58l3.54 3.54-3.54 4.95 4.95-3.54 3.54 3.54c.53-.53.1-1.88-.96-3.42l4.06-5.22c1.06.56 2.04.66 2.55.15L9.41.92z"],
    "pivot": ["M4.57 7.02L.3 11.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l4.27-4.27c-.58-.35-1.07-.84-1.41-1.42zM15 8c-.55 0-1 .45-1 1v.59l-2.57-2.57c-.34.58-.83 1.07-1.41 1.41L12.59 11H12c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-4-3c0-1.66-1.34-3-3-3S5 3.34 5 5s1.34 3 3 3 3-1.34 3-3zM8 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"],
    "pivot-table": ["M2 4H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm0-4H1C.45 0 0 .45 0 1v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm11.71 4.29C13.53 4.11 13.28 4 13 4s-.53.11-.71.29l-2 2a1.003 1.003 0 001.42 1.42l.29-.3V9c0 1.66-1.34 3-3 3H7.41l.29-.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-2 2c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42l-.3-.29H9c2.76 0 5-2.24 5-5V7.41l.29.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-2-2zM15 0H5c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "play": ["M12 8c0-.35-.19-.64-.46-.82l.01-.02-6-4-.01.02A.969.969 0 005 3c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1 .21 0 .39-.08.54-.18l.01.02 6-4-.01-.02c.27-.18.46-.47.46-.82z"],
    "plus": ["M13 7H9V3c0-.55-.45-1-1-1s-1 .45-1 1v4H3c-.55 0-1 .45-1 1s.45 1 1 1h4v4c0 .55.45 1 1 1s1-.45 1-1V9h4c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "polygon-filter": ["M14 5c-.24 0-.47.05-.68.13L9.97 2.34c.01-.11.03-.22.03-.34 0-1.1-.9-2-2-2S6 .9 6 2c0 .04.01.08.01.12L2.88 4.21C2.61 4.08 2.32 4 2 4 .9 4 0 4.9 0 6c0 .74.4 1.38 1 1.72v4.55c-.6.35-1 .99-1 1.73 0 1.1.9 2 2 2 .74 0 1.38-.4 1.72-1h4.55c.35.6.98 1 1.72 1 1.1 0 2-.9 2-2 0-.37-.11-.7-.28-1L14 9c1.11-.01 2-.9 2-2s-.9-2-2-2zm-4.01 7c-.73 0-1.37.41-1.71 1H3.73c-.18-.3-.43-.55-.73-.72V7.72c.6-.34 1-.98 1-1.72 0-.04-.01-.08-.01-.12l3.13-2.09c.27.13.56.21.88.21.24 0 .47-.05.68-.13l3.35 2.79c-.01.11-.03.22-.03.34 0 .37.11.7.28 1l-2.29 4z"],
    "power": ["M8 8c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1S7 .45 7 1v6c0 .55.45 1 1 1zm3-5.32v2.34c1.21.91 2 2.35 2 3.98 0 2.76-2.24 5-5 5s-5-2.24-5-5c0-1.63.79-3.06 2-3.98V2.68C2.64 3.81 1 6.21 1 9c0 3.87 3.13 7 7 7s7-3.13 7-7c0-2.79-1.64-5.19-4-6.32z"],
    "predictive-analysis": ["M16 6.41c0-1.01-.49-1.94-1.29-2.49-.43-1.92-2.07-3.28-4-3.28-.46 0-.92.08-1.35.24C8.83.31 8.11 0 7.34 0c-.9 0-1.74.44-2.28 1.16-.12-.01-.24-.02-.36-.02-1.31 0-2.42.89-2.77 2.17C.78 3.72 0 4.84 0 6.13c0 .38.07.76.21 1.12C.07 7.6 0 7.98 0 8.36c0 1.11.58 2.11 1.51 2.63.54.56 1.27.87 2.03.87.49 0 .95-.12 1.37-.36a2.85 2.85 0 002.18 1.04c.52 0 1.03-.14 1.47-.42.49.39 1.07.65 1.69.73 1.04 1.15 1.84 2.63 1.84 2.64 0 0 .28.49.26.49.77 0 1.41-.16 1.32-1.04 0 .02-.73-2.31-.73-2.31.41-.21.75-.55.97-.98.9-.52 1.47-1.53 1.47-2.61 0-.24-.03-.48-.08-.71.45-.52.7-1.21.7-1.92zm-1.23 1.02l-.15-.16-.61-.67c-.27-.29-.54-.94-.58-1.39l-.1-1.01c-.05-.59-.94-.58-.91.11 0 .02.1 1.01.1 1.01.03.29.12.62.24.93-.06-.01-.12-.02-.18-.02 0 0-2.06-.1-2.05-.11-.58-.02-.71.97-.04 1l2.05.11c.42.02 1.04.3 1.29.58l.49.54.02.05c.08.21.12.44.12.66 0 .74-.41 1.41-1.07 1.75l-.16.08-.07.18c-.15.38-.48.66-.88.74l-.54.11.7 2.2c-.38-.61-.95-1.43-1.62-2.14l-.12-.13-.17-.01c-.41-.03-.8-.17-1.14-.38l1.36-1.18c.35-.31.83-.44.99-.39 0 0 .63.17.62.18.63.16.83-.74.23-.97l-.62-.18c-.55-.16-1.33.18-1.79.58l-1.53 1.33-.31.26c-.35.29-.75.44-1.2.44-.64 0-1.23-.33-1.58-.86V9.15c0-.4.17-.79.27-.85 0 0 .52-.34.51-.35.71-.53.18-1.23-.49-.89 0-.01-.52.35-.52.35-.26.15-.45.44-.58.77-.11-.11-.22-.2-.34-.28 0 0-1.53-1.01-1.53-1.02-.65-.45-1.2.51-.49.89 0-.01 1.51 1.02 1.51 1.02.37.24.62.78.62 1.09v.67c-.34.19-.63.29-.99.29-.54 0-1.05-.23-1.41-.63l-.05-.06-.07-.04c-.65-.34-1.05-1-1.05-1.73 0-.3.07-.6.2-.87l.12-.25L1.15 7c-.13-.27-.2-.56-.2-.87 0-.9.61-1.68 1.48-1.89l.31-.08.05-.34a1.926 1.926 0 012.38-1.58l.32.08.18-.31c.35-.6.99-.97 1.67-.97.44 0 .86.15 1.2.42l-.36.36v-.01l-.25.26c-.33.27-.74.42-.89.4 0 0-.67-.1-.67-.11-.67-.13-.87.86-.14 1.02.01 0 .67.11.67.11.02 0 .05 0 .07.01-.11.37-.15.77-.1 1.12 0 0 .17.99.15.99.11.52 1.06.36.93-.18 0-.01-.15-.99-.15-.99-.05-.37.12-.94.36-1.19l.39-.4c.05-.05.1-.09.15-.14l.74-.76c.4-.18.83-.27 1.27-.27 1.55 0 2.86 1.12 3.11 2.67l.04.25.21.12c.61.35.98 1 .98 1.7 0 .36-.1.7-.28 1.01z"],
    "prescription": ["M10.91 8.34c.14-.21.36-.34.63-.34h1.29c.22 0 .41.07.52.26.09.16.08.33-.04.53l-2.49 2.87 2.77 3.54c.12.17.14.37.02.55-.11.17-.3.25-.5.25h-1.44a.69.69 0 01-.61-.35L9.4 13.51l-1.69 2.15c-.13.21-.36.34-.63.34H5.8c-.22 0-.41-.07-.52-.26-.09-.16-.08-.33.04-.53l2.71-3.48L4.3 6.99H3.03v3.47c0 .33-.26.56-.62.56h-.8c-.35-.01-.61-.23-.61-.56V.56c0-.33.26-.56.62-.56h3.11c.62 0 1.19.08 1.7.24.51.16.96.39 1.34.69a3.194 3.194 0 011.21 2.53c0 .81-.25 1.5-.74 2.08-.37.44-.84.77-1.42 1.01L7.88 7.9c.04.04.07.08.08.1l1.49 1.9 1.46-1.56zM5.18 5c.62 0 1.08-.13 1.39-.37.29-.23.44-.71.44-1.16s-.15-.87-.44-1.1C6.26 2.12 5.8 2 5.18 2H2.99v3h2.19z"],
    "presentation": ["M15 1H9c0-.55-.45-1-1-1S7 .45 7 1H1c-.55 0-1 .45-1 1s.45 1 1 1v8c0 .55.45 1 1 1h3.59L3.3 14.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L7 13.41V15c0 .55.45 1 1 1s1-.45 1-1v-1.59l2.29 2.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L10.41 12H14c.55 0 1-.45 1-1V3c.55 0 1-.45 1-1s-.45-1-1-1zm-2 9H3V3h10v7z"],
    "print": ["M12 2.02c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v1h8v-1zm3 2H1c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h1v-3h12v3h1c.55 0 1-.45 1-1v-6c0-.56-.45-1-1-1zm-1 3h-2v-1h2v1zm-3 6H5v-3H3v4c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-4h-2v3z"],
    "projects": ["M14 3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v1h12V3zm-2-3H4c-.55 0-1 .45-1 1h10c0-.55-.45-1-1-1zm3 5H1c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm-3 6c0 .55-.45 1-1 1H5c-.55 0-1-.45-1-1V9h1v2h6V9h1v2z"],
    "properties": ["M2 6C.9 6 0 6.9 0 8s.9 2 2 2 2-.9 2-2-.9-2-2-2zm4-3h9c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1zm-4 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm13-5H6c-.55 0-1 .45-1 1s.45 1 1 1h9c.55 0 1-.45 1-1s-.45-1-1-1zm0 6H6c-.55 0-1 .45-1 1s.45 1 1 1h9c.55 0 1-.45 1-1s-.45-1-1-1zM2 0C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"],
    "property": ["M3 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-.5-6.5a2.5 2.5 0 000 5 2.5 2.5 0 000-5zM7 3h8c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zm8 10H7c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1zM3 0C1.9 0 1 .9 1 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 6H7c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1z"],
    "publish-function": ["M12.16 3.76c.15-.11.3-.16.47-.16.06 0 .17.02.34.06.16.04.31.06.43.06a.58.58 0 00.6-.6c0-.19-.06-.33-.17-.44-.11-.11-.28-.16-.49-.16-.19 0-.37.04-.54.13-.17.09-.39.27-.65.55-.2.21-.48.58-.87 1.11a5.22 5.22 0 00-.78-1.79l-2.05.32-.04.21c.15-.03.28-.04.39-.04.2 0 .37.08.5.25.21.26.5 1.03.88 2.33-.29.36-.49.6-.6.71-.18.19-.33.31-.45.36-.09.04-.19.07-.3.07-.09 0-.23-.04-.42-.13a.904.904 0 00-.36-.09c-.2 0-.36.06-.49.18a.59.59 0 00-.19.46c0 .18.06.32.18.43.12.11.28.16.48.16.2 0 .38-.04.55-.12.17-.08.39-.24.65-.49s.62-.65 1.07-1.19c.18.52.33.89.46 1.13.13.24.28.4.44.51.17.1.37.16.62.16.24 0 .49-.08.74-.25.33-.21.66-.58 1.01-1.09l-.21-.11c-.23.31-.41.5-.52.57a.44.44 0 01-.26.07c-.12 0-.24-.07-.36-.21-.2-.24-.46-.91-.8-2 .29-.49.54-.81.74-.96zM6.37 5.83l.68-2.53h.83l.2-.64h-.84c.24-.91.56-1.59.96-2.01.24-.27.48-.4.71-.4.05 0 .08.01.11.04s.04.06.04.1c0 .04-.03.11-.1.21-.06.1-.1.2-.1.29 0 .13.05.24.15.33.1.09.23.14.39.14.17 0 .31-.06.42-.17.12-.12.18-.27.18-.46 0-.21-.08-.39-.25-.52C9.57.07 9.3 0 8.93 0c-.59 0-1.12.16-1.59.48-.48.32-.93.85-1.36 1.59-.15.26-.29.42-.42.49s-.35.11-.64.1l-.19.65h.81L4.35 7.68c-.2.72-.33 1.16-.4 1.33-.1.24-.26.45-.46.62a.48.48 0 01-.31.1c-.03 0-.06-.01-.08-.03l-.03-.03c0-.02.03-.06.09-.11.06-.06.09-.15.09-.26 0-.13-.05-.23-.14-.32-.1-.09-.23-.13-.41-.13-.21 0-.38.05-.51.16A.52.52 0 002 9.4c0 .16.08.3.23.42.16.12.4.18.74.18.53 0 .99-.13 1.4-.39.41-.26.76-.65 1.07-1.19.3-.53.61-1.39.93-2.59zm2.34 3.46A.997.997 0 008 9c-.28 0-.53.11-.71.29l-2 2a1.003 1.003 0 001.42 1.42l.29-.3V15c0 .55.45 1 1 1s1-.45 1-1v-2.59l.29.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-2-2z"],
    "pulse": ["M15 8h-1.46l-1.7-2.55-.02.01A.984.984 0 0011 5c-.43 0-.79.27-.93.65h-.01l-1.69 4.51-1.38-8.32h-.02A.989.989 0 006 1c-.41 0-.77.25-.92.61L2.34 8H1c-.55 0-1 .45-1 1s.45 1 1 1h2c.41 0 .77-.25.92-.61l1.65-3.86 1.44 8.63h.02c.08.47.47.84.97.84.43 0 .79-.27.93-.65h.01l2.31-6.17.92 1.38.02-.01c.17.26.46.45.81.45h2c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "random": ["M11.48 4h1.11l-.29.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l2-2c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-2-2a1.003 1.003 0 00-1.42 1.42l.3.29H11c-.32 0-.59.16-.77.38l-.01-.01L8.28 4.8l1.28 1.6L11.48 4zm2.23 6.29a1.003 1.003 0 00-1.42 1.42l.3.29h-1.11l-7.7-9.62h-.01A.996.996 0 003 2H1c-.55 0-1 .45-1 1s.45 1 1 1h1.52l7.7 9.62.01-.01c.18.23.45.39.77.39h1.59l-.29.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l2-2c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-2-2zM2.52 12H1c-.55 0-1 .45-1 1s.45 1 1 1h2c.32 0 .59-.16.77-.38l.01.01 1.94-2.42L4.44 9.6 2.52 12z"],
    "record": ["M8 3a5 5 0 100 10A5 5 0 108 3z"],
    "redo": ["M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm3.71-6.71l-3-3a1.003 1.003 0 00-1.42 1.42L12.59 4H5C2.24 4 0 6.24 0 9s2.24 5 5 5h4v-2H5c-1.66 0-3-1.34-3-3s1.34-3 3-3h7.59L11.3 7.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"],
    "refresh": ["M14.99 6.99c-.55 0-1 .45-1 1 0 3.31-2.69 6-6 6-1.77 0-3.36-.78-4.46-2h1.46c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1v-1.74a7.95 7.95 0 006 2.74c4.42 0 8-3.58 8-8 0-.55-.45-1-1-1zm0-7c-.55 0-1 .45-1 1v1.74a7.95 7.95 0 00-6-2.74c-4.42 0-8 3.58-8 8 0 .55.45 1 1 1s1-.45 1-1c0-3.31 2.69-6 6-6 1.77 0 3.36.78 4.46 2h-1.46c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1z"],
    "regression-chart": ["M13 6.5c0 .83.67 1.5 1.5 1.5S16 7.33 16 6.5 15.33 5 14.5 5 13 5.67 13 6.5zM8.5 5c.83 0 1.5-.67 1.5-1.5S9.33 2 8.5 2 7 2.67 7 3.5 7.67 5 8.5 5zM9 9.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5S11.33 8 10.5 8 9 8.67 9 9.5zM4.5 8C5.33 8 6 7.33 6 6.5S5.33 5 4.5 5 3 5.67 3 6.5 3.67 8 4.5 8zM15 12H3.26l12.03-8.59-.58-.81L2 11.67V3c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "remove": ["M10.99 6.99h-6c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1zm-3-7c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.68 6-6 6z"],
    "remove-column": ["M14 0H4c-.55 0-1 .45-1 1v3h2V2h3v12H5v-2H3v3c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 14h-3V2h3v12zm-8.71-3.29a1.003 1.003 0 001.42-1.42L4.41 8 5.7 6.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L3 6.59l-1.29-1.3A1.003 1.003 0 00.29 6.71L1.59 8 .29 9.29a1.003 1.003 0 001.42 1.42L3 9.41l1.29 1.3z"],
    "remove-column-left": ["M4 9h4c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zm11-9H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-5 14H2V2h8v12zm4 0h-3V2h3v12z"],
    "remove-column-right": ["M15 0H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM5 14H2V2h3v12zm9 0H6V2h8v12zM8 9h4c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "remove-row-bottom": ["M15 0H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 14H2V6h12v8zm0-9H2V2h12v3zm-8 6h4c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "remove-row-top": ["M15 0H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 14H2v-3h12v3zm0-4H2V2h12v8zM6 7h4c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "repeat": ["M10 5c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1s-1 .45-1 1v1.74A7.95 7.95 0 008 0C3.58 0 0 3.58 0 8c0 4.06 3.02 7.4 6.94 7.92.02 0 .04.01.06.01.33.04.66.07 1 .07 4.42 0 8-3.58 8-8 0-.55-.45-1-1-1s-1 .45-1 1c0 3.31-2.69 6-6 6-.71 0-1.37-.15-2-.38v.01C3.67 12.81 2 10.61 2 8c0-3.31 2.69-6 6-6 1.77 0 3.36.78 4.46 2H11c-.55 0-1 .45-1 1z"],
    "reset": ["M6 5c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1s1 .45 1 1v1.74A7.95 7.95 0 018 0c4.42 0 8 3.58 8 8 0 4.06-3.02 7.4-6.94 7.92-.02 0-.04.01-.06.01-.33.04-.66.07-1 .07-4.42 0-8-3.58-8-8 0-.55.45-1 1-1s1 .45 1 1c0 3.31 2.69 6 6 6 .71 0 1.37-.15 2-.38v.01c2.33-.82 4-3.02 4-5.63 0-3.31-2.69-6-6-6-1.77 0-3.36.78-4.46 2H5c.55 0 1 .45 1 1z"],
    "resolve": ["M6.6 3.3C6.1 3.1 5.6 3 5 3 2.2 3 0 5.2 0 8s2.2 5 5 5c.6 0 1.1-.1 1.6-.3C5.3 11.6 4.5 9.9 4.5 8s.8-3.6 2.1-4.7zM8 4c-1.2.9-2 2.4-2 4s.8 3.1 2 4c1.2-.9 2-2.3 2-4s-.8-3.1-2-4zm3-1c-.6 0-1.1.1-1.6.3 1.3 1.2 2.1 2.9 2.1 4.7s-.8 3.6-2.1 4.7c.5.2 1 .3 1.6.3 2.8 0 5-2.2 5-5s-2.2-5-5-5z"],
    "rig": ["M5.71 3c0 1.1.96 2 2.14 2C9.04 5 10 3.96 10 3c0-1.96-1.47-3-2.14-3H5c0 1.96 2.68 1.4.71 3zm2.5 3l.01.01s0-.01-.01-.01zm6.5 8.29L10 9.59V7c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1v2.58l-4.71 4.7c-.18.19-.29.44-.29.72a1.003 1.003 0 001.71.71L6 12.42V15c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.58l3.29 3.29a1.003 1.003 0 001.42-1.42z"],
    "right-join": ["M6.6 3.3C5.3 4.4 4.5 6.1 4.5 8s.8 3.6 2.1 4.7c-.5.2-1 .3-1.6.3-2.8 0-5-2.2-5-5s2.2-5 5-5c.6 0 1.1.1 1.6.3zm-1.96 8.68C3.92 10.83 3.5 9.46 3.5 8s.42-2.83 1.14-3.98C2.6 4.2 1 5.91 1 8s1.6 3.8 3.64 3.98zM8 4c-1.2.9-2 2.4-2 4s.8 3.1 2 4c1.2-.9 2-2.3 2-4s-.8-3.1-2-4zm3-1c2.8 0 5 2.2 5 5s-2.2 5-5 5c-.6 0-1.1-.1-1.6-.3 1.3-1.1 2.1-2.9 2.1-4.7s-.8-3.5-2.1-4.7c.5-.2 1-.3 1.6-.3z"],
    "ring": ["M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"],
    "rotate-document": ["M12 2h-1.59l.29-.29c.19-.18.3-.43.3-.71A1.003 1.003 0 009.29.29l-2 2C7.11 2.47 7 2.72 7 3c0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42l-.3-.29H12c.55 0 1 .45 1 1v3c0 .55.45 1 1 1s1-.45 1-1V5c0-1.66-1.34-3-3-3zM5.71 5.29A.997.997 0 005 5H1c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V9c0-.28-.11-.53-.29-.71l-3-3zM7 14H2V7h2v2c0 .55.45 1 1 1h2v4z"],
    "rotate-page": ["M8 6H2c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1zm-1 8H3V8h4v6zm5-12h-1.59l.29-.29c.19-.18.3-.43.3-.71A1.003 1.003 0 009.29.29l-2 2C7.11 2.47 7 2.72 7 3c0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42l-.3-.29H12c.55 0 1 .45 1 1v3c0 .55.45 1 1 1s1-.45 1-1V5c0-1.66-1.34-3-3-3z"],
    "satellite": ["M3 9c0-.6.4-1 1-1s1 .4 1 1c0 1.1.9 2 2 2 .6 0 1 .4 1 1s-.4 1-1 1c-2.2 0-4-1.8-4-4zM0 9c0-.6.4-1 1-1s1 .4 1 1c0 2.8 2.2 5 5 5 .6 0 1 .4 1 1s-.4 1-1 1c-3.9 0-7-3.1-7-7zm7 1c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm1.3-2.8c-.4-.4-.4-1 0-1.4l4.5-4.5c.4-.4 1-.4 1.4 0l.5.5c.4.4.4 1 0 1.4l-4.5 4.5c-.4.4-1 .4-1.4 0l-.5-.5zM5.2.3c.4-.4 1-.4 1.4 0l2.1 2.1c.4.4.4 1 0 1.4l-.9.9c-.4.4-1 .4-1.4 0L4.3 2.6c-.4-.4-.4-1 0-1.4l.9-.9zm7 7c.4-.4 1-.4 1.4 0l2.1 2.1c.4.4.4 1 0 1.4l-.9.9c-.4.4-1 .4-1.4 0l-2.1-2.1c-.4-.4-.4-1 0-1.4l.9-.9z"],
    "saved": ["M6.71 9.29a1.003 1.003 0 00-1.42 1.42l2 2a.997.997 0 001.6-.27h.01l2-4h-.01c.06-.13.11-.28.11-.44 0-.55-.45-1-1-1-.39 0-.72.23-.89.56H9.1l-1.38 2.76-1.01-1.03zM9 0H3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V5L9 0zm3 14H4V2h4v4h4v8z"],
    "scatter-plot": ["M15 12H2V3c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zm-.5-7c.83 0 1.5-.67 1.5-1.5S15.33 2 14.5 2 13 2.67 13 3.5 13.67 5 14.5 5zm-3 4c.83 0 1.5-.67 1.5-1.5S12.33 6 11.5 6 10 6.67 10 7.5 10.67 9 11.5 9zm-4-2C8.33 7 9 6.33 9 5.5S8.33 4 7.5 4 6 4.67 6 5.5 6.67 7 7.5 7zm-3 4c.83 0 1.5-.67 1.5-1.5S5.33 8 4.5 8 3 8.67 3 9.5 3.67 11 4.5 11z"],
    "search": ["M15.55 13.43l-2.67-2.68a6.94 6.94 0 001.11-3.76c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.39 0 2.68-.42 3.76-1.11l2.68 2.67a1.498 1.498 0 102.12-2.12zm-8.56-1.44c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"],
    "search-around": ["M13.5 11c-.51 0-.98.15-1.38.42l-2.4-2.41c.17-.3.28-.64.28-1.01s-.11-.71-.28-1.01l2.41-2.41c.39.27.86.42 1.37.42a2.5 2.5 0 000-5A2.5 2.5 0 0011 2.5c0 .51.15.98.42 1.38l-2.41 2.4C8.71 6.11 8.37 6 8 6s-.71.11-1.01.28l-2.41-2.4c.27-.4.42-.87.42-1.38a2.5 2.5 0 00-5 0A2.5 2.5 0 002.5 5c.51 0 .98-.15 1.38-.42l2.41 2.41C6.11 7.29 6 7.63 6 8s.11.71.28 1.01l-2.41 2.41c-.39-.27-.86-.42-1.37-.42a2.5 2.5 0 000 5A2.5 2.5 0 005 13.5c0-.51-.15-.98-.42-1.38l2.41-2.41c.3.18.64.29 1.01.29s.71-.11 1.01-.28l2.41 2.41c-.27.39-.42.86-.42 1.37a2.5 2.5 0 005 0 2.5 2.5 0 00-2.5-2.5zm0-10c.83 0 1.5.67 1.5 1.5S14.33 4 13.5 4 12 3.33 12 2.5 12.67 1 13.5 1zm-11 3C1.67 4 1 3.33 1 2.5S1.67 1 2.5 1 4 1.67 4 2.5 3.33 4 2.5 4zm0 11c-.83 0-1.5-.67-1.5-1.5S1.67 12 2.5 12s1.5.67 1.5 1.5S3.33 15 2.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"],
    "search-template": ["M15.55 13.43l-2.67-2.67c.7-1.09 1.11-2.38 1.11-3.77 0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.39 0 2.68-.41 3.77-1.11l2.67 2.67a1.498 1.498 0 102.12-2.12zm-8.56-1.44c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm2.5-6h-5c-.28 0-.5.22-.5.5s.22.5.5.5h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm0-2h-5c-.28 0-.5.22-.5.5s.22.5.5.5h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm0 4h-5c-.28 0-.5.22-.5.5s.22.5.5.5h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5z"],
    "search-text": ["M9 4H5c-.55 0-1 .45-1 1s.45 1 1 1h1v3c0 .55.45 1 1 1s1-.45 1-1V6h1c.55 0 1-.45 1-1s-.45-1-1-1zm6.56 9.44l-2.67-2.67C13.59 9.68 14 8.39 14 7c0-3.87-3.13-7-7-7S0 3.13 0 7s3.13 7 7 7c1.39 0 2.68-.41 3.77-1.11l2.67 2.67a1.498 1.498 0 102.12-2.12zM7 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"],
    "segmented-control": ["M15 4H1c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm-1 6H8V6h6v4z"],
    "select": ["M16 15c0-.28-.12-.52-.31-.69l.02-.02-3.12-3.12 3.41-.84-8.05-2.86c.03-.09.05-.17.05-.27V2c0-.55-.45-1-1-1H3c0-.55-.45-1-1-1S1 .45 1 1c-.55 0-1 .45-1 1s.45 1 1 1v4c0 .55.45 1 1 1h5.2c.1 0 .18-.02.27-.05L10.33 16l.85-3.41 3.12 3.12.02-.02c.16.19.4.31.68.31.04 0 .07-.02.1-.02s.06.02.1.02c.44 0 .8-.36.8-.8 0-.04-.02-.07-.02-.1s.02-.06.02-.1zM6 6H3V3h3v3z"],
    "selection": ["M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-9C6.34 5 5 6.34 5 8s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"],
    "send-to": ["M15 7.5c-.8 0-1.5-.4-2-1l-1.2 1.2c-.4.5-1.1.7-1.8.7-1.4.1-2.5-1-2.5-2.4 0-.7.3-1.3.7-1.8L9.5 3c-.6-.5-1-1.2-1-2 0-.3.1-.7.2-1H8C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8v-.7c-.3.1-.6.2-1 .2zM15 0h-4c-.6 0-1 .5-1 1s.4 1 1 1h1.6L9.3 5.3c-.2.2-.3.4-.3.7 0 .5.4 1 1 1 .3 0 .5-.1.7-.3L14 3.4V5c0 .6.4 1 1 1 .5 0 1-.4 1-1V1c0-.5-.4-1-1-1z"],
    "send-to-graph": ["M6 9H2c-.55 0-1 .45-1 1s.45 1 1 1h1.59L.3 14.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L5 12.41V14c0 .55.45 1 1 1s1-.45 1-1v-4c0-.55-.45-1-1-1zm8 .5c-.56 0-1.06.23-1.42.59l-2.13-1.24L8.99 8l3.59-2.09A2.002 2.002 0 0016 4.5c0-1.1-.9-2-2-2s-2 .9-2 2c0 .19.03.37.08.54L8.5 7.13v-3.2c.86-.22 1.5-1 1.5-1.93 0-1.1-.9-2-2-2S6 .9 6 2c0 .93.64 1.71 1.5 1.93v3.2l-.88-.52-2.7-1.57c.05-.17.08-.35.08-.54 0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2c.56 0 1.06-.23 1.42-.59l2.13 1.24 3.84 2.24 2.7 1.57c-.06.17-.09.35-.09.54 0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2z"],
    "send-to-map": ["M6 9H2c-.55 0-1 .45-1 1s.45 1 1 1h1.59L.3 14.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L5 12.41V14c0 .55.45 1 1 1s1-.45 1-1v-4c0-.55-.45-1-1-1zm9.55-5.83l-4.49-3A.975.975 0 009.99.15L5.53 2.82 1.56.17A1.003 1.003 0 000 1v6h2V2.87l2.94 1.96.06.03V7h1V4.86s.01 0 .01-.01L10 2.47v8.67s-.01 0-.01.01l-.99.58v2.33l1.47-.88 3.97 2.65A1.003 1.003 0 0016 15V4c0-.35-.18-.65-.45-.83zM14 13.13l-2.94-1.96c-.02-.01-.04-.02-.05-.03v-8.6l3 2v8.59z"],
    "series-add": ["M10.68 7.9c.44.54 1.07.92 1.79 1.05l-2.76 2.76c-.18.18-.43.29-.71.29s-.53-.11-.71-.3L5 8.41l-3 3V13h13c.55 0 1 .45 1 1s-.45 1-1 1H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1s1 .45 1 1v4.59l2.29-2.3C4.47 6.11 4.72 6 5 6s.53.11.71.29L9 9.59l1.68-1.69zM15 3c.55 0 1 .45 1 1s-.45 1-1 1h-1v1c0 .55-.45 1-1 1s-1-.45-1-1V5h-1c-.55 0-1-.45-1-1s.45-1 1-1h1V2c0-.55.45-1 1-1s1 .45 1 1v1h1z"],
    "series-configuration": ["M9.94 9.64c.65.23 1.34.36 2.06.36.14 0 .29-.01.43-.01L9.7 12.71c-.18.18-.43.29-.71.29-.28 0-.53-.11-.71-.3L5 9.41l-3 3V14h12.99c.55 0 1 .45 1 1s-.45 1-1 1H1c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1s1 .45 1 1v4.59l2.29-2.3C4.47 7.11 4.72 7 5 7c.28 0 .53.11.71.29L9 10.59l.94-.95zm4.73-6.44h.92c.22 0 .4.18.4.4v.8c0 .22-.18.4-.4.4h-.93c-.06.2-.14.38-.24.55l.66.65c.15.15.15.4 0 .55l-.54.55c-.15.15-.4.15-.55 0l-.65-.65c-.17.1-.36.18-.55.24v.91c0 .22-.18.4-.4.4h-.8c-.22 0-.4-.18-.4-.4v-.93c-.18-.06-.36-.13-.52-.22l-.68.68c-.15.16-.41.16-.57 0l-.56-.56a.417.417 0 010-.57l.68-.68c-.08-.16-.16-.33-.22-.52h-.93c-.22 0-.4-.18-.4-.4v-.8c0-.22.18-.4.4-.4h.93c.06-.2.14-.38.24-.55l-.65-.64a.392.392 0 010-.55l.54-.55a.38.38 0 01.54 0l.65.65c.18-.1.36-.18.55-.24V.4c0-.22.18-.4.4-.4h.8c.22 0 .4.18.4.4v.93c.18.06.35.14.52.22l.68-.68c.15-.16.41-.16.57 0l.57.57c.15.16.15.41 0 .57l-.68.68c.09.16.16.33.22.51zm-4.18.8c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5c-.82 0-1.5.67-1.5 1.5z"],
    "series-derived": ["M10.66 7.92c.44.54 1.07.91 1.8 1.03L9.71 11.7c-.18.19-.43.3-.71.3s-.53-.11-.71-.3L5 8.41l-3 3V13h13c.55 0 1 .45 1 1s-.45 1-1 1H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1s1 .45 1 1v4.59l2.29-2.3C4.47 6.11 4.72 6 5 6s.53.11.71.29L9 9.59l1.66-1.67zM12.3 5.3l.3-.3H8c-.6 0-1-.4-1-1s.4-1 1-1h4.6l-.3-.3c-.2-.2-.3-.4-.3-.7 0-.6.5-1 1-1 .3 0 .5.1.7.3l2 2c.2.2.3.4.3.7s-.1.5-.3.7l-2 2c-.2.2-.4.3-.7.3-.6 0-1-.4-1-1 0-.3.1-.5.3-.7z"],
    "series-filtered": ["M9.29 9.3c.3.62.8 1.12 1.42 1.41l-1 1c-.18.18-.43.29-.71.29s-.53-.11-.71-.3L5 8.41l-3 3V13h13c.55 0 1 .45 1 1s-.45 1-1 1H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1s1 .45 1 1v4.59l2.29-2.3C4.47 6.11 4.72 6 5 6s.53.11.71.29L9 9.59l.29-.29zM15.48 1c.31 0 .52.26.52.57 0 .16-.06.3-.17.41l-2.86 2.73v2.63c0 .16-.06.3-.17.41l-.82 1.1c-.1.1-.25.17-.41.17-.31 0-.57-.26-.57-.57V4.71L8.17 1.98A.566.566 0 018 1.57c0-.31.26-.57.57-.57h6.91z"],
    "series-search": ["M9.6 8.94a4.937 4.937 0 001.82.01c.1-.01.22-.04.39-.08l.23-.07c.04-.01.08-.02.11-.04l.22.22-2.7 2.72c-.18.19-.43.3-.71.3s-.53-.11-.71-.3L4.98 8.41l-2.99 3V13h12.94c.55 0 1 .45 1 1s-.45 1-1 1H1c-.55 0-1-.45-1-1V3.99c0-.55.45-1 1-1s1 .45 1 1v4.59l2.28-2.3c.17-.18.42-.29.7-.29s.53.11.7.29l3.28 3.3.64-.64zm6.22-.41c.1.12.17.27.18.44 0 .34-.27.61-.61.61a.57.57 0 01-.43-.18l-2.24-2.25c-.13.08-.26.16-.4.23-.02.01-.05.02-.07.03-.14.06-.27.12-.42.17h-.01c-.14.05-.29.08-.44.11-.04.01-.08.02-.11.02-.15.02-.3.04-.46.04-1.85 0-3.35-1.51-3.35-3.37S8.96 1.01 10.81 1c1.85 0 3.35 1.51 3.35 3.37 0 .16-.02.31-.04.47-.01.04-.01.07-.02.11-.02.15-.05.29-.1.44v.01c-.05.15-.11.28-.17.42-.01.02-.02.05-.03.07-.07.14-.14.27-.23.4l2.25 2.24zm-5.01-1.94c1.22 0 2.21-.99 2.21-2.22 0-1.23-.99-2.22-2.21-2.22S8.6 3.14 8.6 4.37c0 1.22.99 2.22 2.21 2.22z"],
    "settings": ["M3 1c0-.55-.45-1-1-1S1 .45 1 1v3h2V1zm0 4H1c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm12-4c0-.55-.45-1-1-1s-1 .45-1 1v2h2V1zM9 1c0-.55-.45-1-1-1S7 .45 7 1v6h2V1zM1 15c0 .55.45 1 1 1s1-.45 1-1v-5H1v5zM15 4h-2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm-2 11c0 .55.45 1 1 1s1-.45 1-1V9h-2v6zM9 8H7c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-2 7c0 .55.45 1 1 1s1-.45 1-1v-2H7v2z"],
    "share": ["M10.99 13.99h-9v-9h4.76l2-2H.99c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h11c.55 0 1-.45 1-1V7.24l-2 2v4.75zm4-14h-5c-.55 0-1 .45-1 1s.45 1 1 1h2.59L7.29 7.28a1 1 0 00-.3.71 1.003 1.003 0 001.71.71l5.29-5.29V6c0 .55.45 1 1 1s1-.45 1-1V1c0-.56-.45-1.01-1-1.01z"],
    "shield": ["M8 16c4.667-3.048 7-7.238 7-12.571-1.556 0-3.889-1.143-7-3.429-3.111 2.286-5.444 3.429-7 3.429C1 8.762 3.333 12.952 8 16zM8 2.121c2.005 1.388 3.715 2.304 5.186 2.735-.342 3.702-2.05 6.683-5.186 9.038V2.121z"],
    "shop": ["M3 2h10c.55 0 1-.45 1-1s-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1zm9 11H4v-3H2v5c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-5h-2v3zm4-6l-1.01-3.17C14.9 3.36 14.49 3 14 3H2c-.49 0-.9.36-.98.83L.01 7H0c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2c0 1.1.9 2 2 2s2-.9 2-2z"],
    "shopping-cart": ["M14 10H7.72l-.33-1H13c.39 0 .72-.23.89-.56h.01l2-4h-.01c.06-.13.11-.28.11-.44 0-.55-.45-1-1-1H5.39l-.44-1.32h-.01C4.8 1.29 4.44 1 4 1H1c-.55 0-1 .45-1 1s.45 1 1 1h2.28l2.33 7H4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2h6c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2zM6.05 5h7.33l-1 2H6.72l-.67-2z"],
    "signal-search": ["M5.474 7.971A5.31 5.31 0 006.66 8.9l.007.019.018.056c.015.038.038.06.045.098l1.5 5.999a.75.75 0 01-1.455.36l-.42-1.68h-.704l-.42 1.68a.746.746 0 01-.907.547.746.746 0 01-.547-.907l1.5-6c.007-.037.03-.06.044-.097.015-.037.015-.075.038-.112a.722.722 0 01-.105-.36c0-.207.084-.394.22-.53zM2.795 5.277a.763.763 0 00-.015-1.065.756.756 0 00-1.065.015c-2.286 2.34-2.286 6.21 0 8.549a.747.747 0 101.072-1.042c-1.709-1.763-1.709-4.702.008-6.457zM7.808 9.388a5.318 5.318 0 001.58.211 2.236 2.236 0 01-.656.98.756.756 0 01-1.057-.098.756.756 0 01.097-1.057l.036-.036zM11.544 9.105l.378.378a6.02 6.02 0 01-1.638 3.285c-.285.3-.757.3-1.057.015a.74.74 0 01-.015-1.057 4.52 4.52 0 001.185-2.24c.4-.083.785-.212 1.147-.381z",
        "M4.054 9.424c-.427-.352-.352-1.582-.03-1.822a.752.752 0 00.15-1.05.752.752 0 00-1.05-.15c-1.079.802-1.221 3.18-.03 4.177a.75.75 0 10.96-1.155zM9.318 0a4.318 4.318 0 014.317 4.318c0 .206-.02.402-.049.598-.01.05-.01.088-.02.138-.039.196-.078.382-.137.569v.01c-.059.186-.137.363-.216.54l-.039.087a5.285 5.285 0 01-.294.51l2.884 2.886a.878.878 0 01.236.559.787.787 0 01-.785.785.785.785 0 01-.56-.226L11.772 7.89a5.285 5.285 0 01-.51.295l-.089.039c-.176.079-.353.157-.54.216h-.01a3.701 3.701 0 01-.568.137c-.05.01-.099.02-.138.02-.196.03-.392.049-.598.049A4.318 4.318 0 015 4.327 4.332 4.332 0 019.318 0zm-.02 1.1A3.195 3.195 0 006.1 4.298a3.195 3.195 0 003.198 3.198 3.195 3.195 0 003.198-3.198A3.195 3.195 0 009.298 1.1z"],
    "sim-card": ["M13.71 4.29l-4-4A.997.997 0 009 0H3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V5c0-.28-.11-.53-.29-.71zM7 6h2v2H7V6zM4 6h2v2H4V6zm2 8H4v-2h2v2zm3 0H7v-2h2v2zm3 0h-2v-2h2v2zm0-3H4V9h8v2zm0-3h-2V6h2v2z"],
    "slash": ["M10 2a.99.99 0 00-.96.73l-2.99 9.96A1.003 1.003 0 007 14c.46 0 .85-.31.96-.73l2.99-9.96A1.003 1.003 0 0010 2z"],
    "small-cross": ["M9.41 8l2.29-2.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L8 6.59l-2.29-2.3a1.003 1.003 0 00-1.42 1.42L6.59 8 4.3 10.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L8 9.41l2.29 2.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L9.41 8z"],
    "small-minus": ["M11 7H5c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "small-plus": ["M11 7H9V5c0-.55-.45-1-1-1s-1 .45-1 1v2H5c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V9h2c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "small-tick": ["M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z"],
    "snowflake": ["M13.364 9l.879.879a1 1 0 11-1.415 1.414l-2.12-2.121A1.003 1.003 0 0110.568 9H9v1.604c.042.03.083.065.121.103l2.122 2.121a1 1 0 01-1.415 1.415L9 13.414V15a1 1 0 01-2 0v-1.636l-.879.879a1 1 0 11-1.414-1.415l2.121-2.12c.054-.054.111-.1.172-.139V9H5.38c-.038.06-.084.118-.137.172l-2.122 2.12A1 1 0 111.707 9.88L2.586 9H1a1 1 0 110-2h1.536l-.829-.828a1 1 0 011.414-1.415L5.243 6.88c.038.038.072.079.103.121H7V5.38a1.003 1.003 0 01-.172-.137L4.708 3.12A1 1 0 016.12 1.707L7 2.586V1a1 1 0 112 0v1.536l.828-.829a1 1 0 011.415 1.414L9.12 5.243A1.007 1.007 0 019 5.346V7h1.604c.03-.042.065-.083.103-.121l2.121-2.122a1 1 0 011.415 1.415L13.414 7H15a1 1 0 010 2h-1.636z"],
    "social-media": ["M9.5 4c.4 0 .8-.1 1.1-.3C12 4.5 12.9 6 13 7.6c0 .5.5.9 1 .9.6 0 1-.4 1-1v-.2c-.2-2.4-1.5-4.4-3.5-5.5-.1-1-.9-1.8-2-1.8s-2 .9-2 2 .9 2 2 2zM4 8.5c0-.7-.4-1.3-.9-1.7.3-1.4 1.2-2.6 2.5-3.3.3-.1.6-.4.6-.9s-.4-1-1-1c-.2 0-.3 0-.5.1-1.9 1-3.2 2.8-3.6 5C.4 7.1 0 7.8 0 8.5c0 1.1.9 2 2 2s2-.9 2-2zm8.8 1.2c-1.1 0-2 .9-2 2v.3c-.8.6-1.8.9-2.8.9-1.2 0-2.3-.4-3.2-1.1-.2-.2-.4-.3-.7-.3-.6 0-1 .4-1 1 0 .3.1.6.3.8C4.6 14.4 6.2 15 8 15c1.5 0 3-.5 4.1-1.3.2.1.5.1.7.1 1.1 0 2-.9 2-2s-.9-2.1-2-2.1z"],
    "sort": ["M5 12c-.28 0-.53.11-.71.29l-.29.3V9c0-.55-.45-1-1-1s-1 .45-1 1v3.59l-.29-.29A.965.965 0 001 12a1.003 1.003 0 00-.71 1.71l2 2c.18.18.43.29.71.29s.53-.11.71-.29l2-2A1.003 1.003 0 005 12zm3-9h7c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zm7 2H8c-.55 0-1 .45-1 1s.45 1 1 1h7c.55 0 1-.45 1-1s-.45-1-1-1zm0 8H8c-.55 0-1 .45-1 1s.45 1 1 1h7c.55 0 1-.45 1-1s-.45-1-1-1zm0-4H8c-.55 0-1 .45-1 1s.45 1 1 1h7c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "sort-alphabetical": ["M6 12c-.28 0-.53.11-.71.29l-.29.3V9c0-.55-.45-1-1-1s-1 .45-1 1v3.59l-.29-.29A.965.965 0 002 12a1.003 1.003 0 00-.71 1.71l2 2c.19.18.44.29.71.29.28 0 .53-.11.71-.29l2-2c.18-.18.29-.43.29-.71a.99.99 0 00-1-1zm7.93-.95v-1.04H9.25v1.11h2.94L9 14.96V16h5.02v-1.11h-3.27l3.18-3.84zm-1.42-4.84l.62 1.78H15L11.94.01H10.1L7 7.99h1.81l.64-1.78h3.06zm-1.52-4.24h.02l1.03 2.93H9.92l1.07-2.93z"],
    "sort-alphabetical-desc": ["M5.99 11.99c-.28 0-.53.11-.71.29l-.29.29V8.99c0-.55-.45-1-1-1s-1 .45-1 1v3.59l-.29-.29a1.003 1.003 0 00-1.42 1.42l2 2c.18.18.43.29.71.29.28 0 .53-.11.71-.29l2-2c.18-.18.29-.43.29-.71 0-.56-.45-1.01-1-1.01zM12.7 10h-1.38L9 15.99h1.36l.48-1.33h2.3l.46 1.33H15L12.7 10zm-1.51 3.67l.8-2.2h.02l.77 2.2h-1.59zm3.8-7.17h-4.57l4.45-5.12V0H8.34v1.48h4.1L7.99 6.59v1.39h7V6.5z"],
    "sort-asc": ["M8 7h3c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zm0-4h1c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zm0 8h5c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zm-3 1c-.28 0-.53.11-.71.29l-.29.3V9c0-.55-.45-1-1-1s-1 .45-1 1v3.59l-.29-.29A.965.965 0 001 12a1.003 1.003 0 00-.71 1.71l2 2c.18.18.43.29.71.29s.53-.11.71-.29l2-2A1.003 1.003 0 005 12zm10 1H8c-.55 0-1 .45-1 1s.45 1 1 1h7c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "sort-desc": ["M5 12c-.28 0-.53.11-.71.29l-.29.3V9c0-.55-.45-1-1-1s-1 .45-1 1v3.59l-.29-.29A.965.965 0 001 12a1.003 1.003 0 00-.71 1.71l2 2c.18.18.43.29.71.29s.53-.11.71-.29l2-2A1.003 1.003 0 005 12zm4 1H8c-.55 0-1 .45-1 1s.45 1 1 1h1c.55 0 1-.45 1-1s-.45-1-1-1zm4-8H8c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1zm-2 4H8c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1zm4-8H8c-.55 0-1 .45-1 1s.45 1 1 1h7c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "sort-numerical": ["M6 11.99c-.28 0-.53.11-.71.29l-.29.3V8.99c0-.55-.45-1-1-1s-1 .45-1 1v3.59l-.29-.29c-.18-.18-.43-.3-.71-.3a1.003 1.003 0 00-.71 1.71l2 2c.18.18.43.29.71.29.28 0 .53-.11.71-.29l2-2A1.003 1.003 0 006 11.99zm7.91-.08c-.06-.36-.17-.68-.33-.96-.16-.28-.37-.51-.64-.69-.27-.17-.61-.26-1.03-.26-.28 0-.54.06-.78.17-.23.11-.43.26-.6.45-.17.19-.3.41-.39.67a2.492 2.492 0 00-.04 1.52 1.623 1.623 0 00.89 1.03c.22.11.45.16.68.16.26 0 .5-.05.7-.15s.38-.26.53-.5l.02.02c-.01.16-.03.34-.07.54-.03.2-.09.4-.17.57-.08.18-.18.33-.31.45s-.29.19-.5.19a.63.63 0 01-.48-.21c-.13-.14-.21-.31-.25-.5H10.1c.03.25.1.48.19.68.1.2.22.37.38.5.16.14.33.24.54.31s.42.1.65.1c.39 0 .72-.09.99-.27.27-.18.49-.41.66-.7.17-.29.29-.61.37-.97.08-.36.12-.72.12-1.07 0-.36-.03-.72-.09-1.08zm-1.14.54c-.04.13-.09.24-.16.34a.78.78 0 01-.27.24c-.11.06-.24.09-.39.09a.75.75 0 01-.37-.09.777.777 0 01-.26-.25c-.07-.1-.12-.22-.15-.35-.03-.13-.05-.26-.05-.4 0-.13.02-.26.05-.39.04-.13.09-.24.16-.34.07-.1.16-.18.26-.24s.22-.09.35-.09c.14 0 .26.03.37.09.11.06.2.14.28.24a1.32 1.32 0 01.23.74c0 .15-.02.28-.05.41zm-1.56-4.47H13V0h-1.42c-.05.3-.16.56-.31.76-.16.21-.35.37-.58.5-.23.13-.49.21-.78.26-.3.05-.6.07-.91.06V2.8h2.21v5.18z"],
    "sort-numerical-desc": ["M6 11.99c-.28 0-.53.11-.71.29l-.29.3V8.99c0-.55-.45-1-1-1s-1 .45-1 1v3.59l-.29-.29a.982.982 0 00-.71-.3 1.003 1.003 0 00-.71 1.71l2 2c.18.18.43.29.71.29s.53-.11.71-.29l2-2A1.003 1.003 0 006 11.99zm7.86-9.45c-.09-.48-.26-.9-.5-1.28S12.8.58 12.4.35C12 .12 11.49 0 10.86 0c-.43 0-.82.07-1.17.22s-.65.35-.9.6-.44.55-.58.89c-.14.34-.2.71-.2 1.11 0 .31.05.61.15.91.1.3.26.57.48.8.23.24.52.43.85.58.33.14.68.21 1.03.21.4 0 .75-.07 1.05-.2.3-.13.57-.35.79-.66l.02.02c-.02.21-.05.45-.1.73-.05.27-.13.53-.25.76-.12.24-.27.44-.47.6-.19.16-.44.25-.75.25a.98.98 0 01-.72-.29c-.19-.18-.31-.4-.37-.66H8.15c.05.34.14.64.29.9.15.26.34.49.57.67.23.18.5.32.8.41.31.1.63.15.98.15.58 0 1.08-.12 1.48-.36.4-.24.73-.55.99-.93.26-.39.44-.82.56-1.29.12-.48.18-.96.18-1.44s-.05-.96-.14-1.44zm-1.71.72c-.05.17-.14.32-.24.46-.11.13-.24.24-.41.31-.16.08-.36.12-.58.12-.21 0-.39-.04-.55-.13-.16-.08-.29-.19-.39-.33-.12-.14-.19-.29-.24-.46-.05-.17-.08-.35-.08-.54 0-.18.03-.35.08-.52.06-.16.14-.31.25-.44.11-.13.24-.24.4-.32.16-.08.33-.12.52-.12.21 0 .4.04.56.12.16.08.3.19.41.32.11.14.2.29.26.46.06.17.09.35.09.52 0 .2-.03.38-.08.55zm-.46 7.31c-.12.15-.26.28-.44.37-.17.09-.37.16-.58.2-.22.04-.44.05-.67.05v.92h1.65v3.88h1.33V10h-1.06c-.03.23-.11.42-.23.57z"],
    "split-columns": ["M12 10a1.003 1.003 0 001.71.71l2-2c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-2-2a1.003 1.003 0 00-1.42 1.42l.3.29H9V2h3v1.71c.31-.13.64-.21 1-.21s.69.08 1 .21V1c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v2.71c.31-.13.64-.21 1-.21s.69.08 1 .21V2h3v5H3.41l.29-.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-2 2C.11 7.47 0 7.72 0 8c0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42L3.41 9H7v5H4v-1.71c-.31.13-.64.21-1 .21s-.69-.08-1-.21V15c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-2.71c-.31.13-.64.21-1 .21s-.69-.08-1-.21V14H9V9h3.59l-.29.29c-.19.18-.3.43-.3.71z"],
    "square": ["M15 0H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 14H2V2h12v12z"],
    "stacked-chart": ["M10 2c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v3h3V2zm3 10h1c.55 0 1-.45 1-1V8h-3v3c0 .55.45 1 1 1zm2-7c0-.55-.45-1-1-1h-1c-.55 0-1 .45-1 1v2h3V5zm-5 1H7v3h3V6zM5 7c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v1h3V7zm3 5h1c.55 0 1-.45 1-1v-1H7v1c0 .55.45 1 1 1zm7 1H2c-.55 0-1 .45-1 1s.45 1 1 1h13c.55 0 1-.45 1-1s-.45-1-1-1zM3 12h1c.55 0 1-.45 1-1V9H2v2c0 .55.45 1 1 1z"],
    "star": ["M8 0l2.5 5.3 5.5.8-4 4.1.9 5.8L8 13.3 3.1 16l.9-5.8-4-4.1 5.5-.8z"],
    "star-empty": ["M16 6.11l-5.53-.84L8 0 5.53 5.27 0 6.11l4 4.1L3.06 16 8 13.27 12.94 16 12 10.21l4-4.1zM4.91 13.2l.59-3.62L3 7.02l3.45-.53L8 3.2l1.55 3.29 3.45.53-2.5 2.56.59 3.62L8 11.49 4.91 13.2z"],
    "step-backward": ["M12 3c-.24 0-.44.09-.62.23l-.01-.01L7 6.72V4c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V9.28l4.38 3.5.01-.01c.17.14.37.23.61.23.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "step-chart": ["M15 12H2v-2h3c.55 0 1-.45 1-1V7h2v1c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V5h1c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1v3h-2V6c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v2H2V3c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "step-forward": ["M12 3h-1c-.55 0-1 .45-1 1v2.72l-4.38-3.5v.01A.987.987 0 005 3c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1 .24 0 .44-.09.62-.23l.01.01L10 9.28V12c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "stop": ["M12 3H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "stopwatch": ["M9 2v1.083A6.002 6.002 0 018 15 6 6 0 017 3.083V2H6a1 1 0 110-2h4a1 1 0 010 2H9zM8 5a4 4 0 104 4H8V5z"],
    "strikethrough": ["M14 7H8.65c-.38-.09-.73-.18-1.04-.26-.31-.08-.49-.13-.54-.14-.43-.11-.79-.29-1.05-.52-.27-.23-.4-.55-.4-.95 0-.29.07-.53.21-.72s.32-.34.54-.46c.22-.11.46-.19.72-.24.26-.05.52-.07.77-.07.74 0 1.36.15 1.84.46.32.2.55.5.68.9h2.22c-.06-.33-.17-.64-.32-.92-.25-.45-.59-.84-1.02-1.15-.43-.31-.93-.54-1.49-.7S8.59 2 7.95 2c-.55 0-1.1.07-1.63.2-.54.13-1.02.34-1.45.62-.42.28-.76.63-1.02 1.05-.26.42-.39.92-.39 1.5 0 .3.04.59.13.88.08.26.21.51.39.75H2c-.55 0-1 .45-1 1s.45 1 1 1h7.13c.25.07.49.14.71.22.25.09.48.23.7.44.21.21.32.53.32.97 0 .21-.05.43-.14.63-.09.21-.24.39-.45.55-.21.16-.48.29-.81.39-.33.1-.73.15-1.2.15-.44 0-.84-.05-1.21-.14-.37-.09-.7-.24-.99-.43-.29-.2-.51-.45-.67-.76-.01 0-.01-.01-.02-.02H3.14a3.68 3.68 0 001.39 2.03c.46.34 1 .58 1.62.74.61.15 1.27.23 1.97.23.61 0 1.2-.07 1.79-.2.58-.13 1.11-.34 1.56-.63.46-.29.83-.66 1.11-1.11.28-.45.42-1 .42-1.64 0-.3-.05-.6-.15-.9-.05-.19-.13-.36-.22-.52H14c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "style": ["M14 14H2V2h8.76l2-2H1C.45 0 0 .45 0 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V6.24l-2 2V14zm1.4-14L9.7 5.7l2.1 2.1L16 3.6V0h-.6zM4 11.92c2.33.15 4.42.15 6.15-1.5.82-.83.82-2.25 0-3.08-.45-.38-.98-.6-1.5-.6-.53 0-1.05.22-1.43.6-.82.91-1.27 3.38-3.22 4.58z"],
    "swap-horizontal": ["M0 7.02L.05 7H0v.02zm2-2.03h9.57l-1.29 1.29A1.003 1.003 0 0011.7 7.7l2.99-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-2.99-3a1.07 1.07 0 00-.71-.28 1.003 1.003 0 00-.71 1.71L11.57 3H2c-.55 0-1 .45-1 1a1 1 0 001 .99zM15.96 9H16v-.02l-.04.02zM14 11.01H4.43l1.29-1.29A1.003 1.003 0 004.3 8.3l-2.99 3a.99.99 0 00-.29.7c0 .28.11.53.29.71l2.99 3a1.003 1.003 0 001.42-1.42L4.43 13H14c.55 0 1-.45 1-1s-.45-.99-1-.99z"],
    "swap-vertical": ["M9 0h-.02L9 .04V0zM7 16h.02L7 15.95V16zM4.7 1.31c-.18-.18-.43-.29-.7-.29s-.53.11-.71.29l-3 2.99a1.003 1.003 0 001.42 1.42L3 4.43V14c0 .55.45 1 1 1s1-.45 1-1V4.43l1.29 1.29c.18.18.43.29.7.29A1.003 1.003 0 007.7 4.3l-3-2.99zM15 9.99c-.28 0-.53.11-.71.29L13 11.57V2c0-.55-.45-1-1-1s-1 .45-1 1v9.57l-1.29-1.29a.99.99 0 00-.7-.29 1.003 1.003 0 00-.71 1.71l3 2.99c.18.18.43.29.71.29.28 0 .53-.11.71-.29l3-2.99c.18-.18.29-.43.29-.71-.01-.55-.46-1-1.01-1z"],
    "symbol-circle": ["M8 3.01a5 5 0 100 10 5 5 0 100-10z"],
    "symbol-cross": ["M12 6.01h-2v-2c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1v2H4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1v-2c0-.56-.45-1-1-1z"],
    "symbol-diamond": ["M12 8.01c0-.19-.07-.36-.16-.51l.01-.01-3-5-.01.01c-.17-.29-.48-.49-.84-.49s-.67.2-.84.49l-.02-.01-3 5 .02.01c-.09.15-.16.32-.16.51s.07.36.16.51h-.02l3 5 .01-.01c.18.29.49.5.85.5s.67-.2.84-.49l.01.01 3-5-.01-.01c.09-.16.16-.32.16-.51z"],
    "symbol-square": ["M12 3.01H4c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-8c0-.56-.45-1-1-1z"],
    "symbol-triangle-down": ["M13 4.01c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 .16.05.31.11.44H3.1l4 8h.01c.16.33.49.56.89.56s.72-.23.89-.56h.01l4-8h-.01c.06-.14.11-.28.11-.44z"],
    "symbol-triangle-up": ["M12.89 11.56l-3.99-8h-.01c-.17-.32-.5-.55-.89-.55s-.72.23-.89.55H7.1l-4 8h.01c-.06.14-.11.29-.11.45 0 .55.45 1 1 1h8c.55 0 1-.45 1-1 0-.16-.05-.31-.11-.45z"],
    "tag": ["M1 3a2 2 0 012-2h4.584a2 2 0 011.414.586l5.413 5.412a2 2 0 010 2.829L9.827 14.41a2 2 0 01-2.829 0L1.586 8.998A2 2 0 011 7.584V3zm3.487-.007a1.494 1.494 0 100 2.988 1.494 1.494 0 000-2.988z"],
    "take-action": ["M9 11a1.003 1.003 0 001.71.71l4-4a1.003 1.003 0 00-1.42-1.42l-4 4c-.18.18-.29.43-.29.71zM4 6c.28 0 .53-.11.71-.29l4-4A1.003 1.003 0 007.29.29l-4 4A1.003 1.003 0 004 6zm4 4l5-5-.79-.79.5-.5a1.003 1.003 0 00-1.42-1.42l-.5.5L10 2 5 7l.79.79-5.5 5.5a1.003 1.003 0 001.42 1.42l5.5-5.5L8 10zm7 4H7c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "taxi": ["M15.12 6.63h-.38L15 7c-.01.3-.01.64 0 .98V8c0 .07-.03.13-.04.19h.02L14 13.1v.9c0 .55-.45 1-1 1s-1-.45-1-1v-1H4v1c0 .55-.45 1-1 1s-1-.45-1-1v-.9l-.98-4.9h.02C1.03 8.13 1 8.07 1 8H.99c0-.33 0-.67.01-1l.26-.37H.88C.4 6.63 0 6.21 0 5.69s.4-.94.88-.94h1.05l.77-2.11c.19-.53.76-1.08 1.26-1.24 0 0 .68-.2 2.05-.32C6.01 1.05 6 1.03 6 1c0-.55.45-1 1-1h2c.55 0 1 .45 1 1 0 .03-.01.05-.02.08 1.37.12 2.05.32 2.05.32.51.15 1.08.71 1.27 1.24l.76 2.12h1.05c.49 0 .89.42.89.93 0 .52-.4.94-.88.94zM11 10h2V8h-2v2zm-8 0h2V8H3v2zm10-5l-.73-1.63C12.21 3.19 12.18 3 12 3H4c-.18 0-.21.19-.27.37L3 5c-.06.18-.18 1 0 1h10c.18 0 .06-.82 0-1z"],
    "text-highlight": ["M9 10H2V6h7V4H1c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h8v-2zm4 3h-1V3h1c.55 0 1-.45 1-1s-.45-1-1-1h-1c-.37 0-.7.11-1 .28-.3-.17-.63-.28-1-.28H9c-.55 0-1 .45-1 1s.45 1 1 1h1v10H9c-.55 0-1 .45-1 1s.45 1 1 1h1c.37 0 .7-.11 1-.28.3.17.63.28 1 .28h1c.55 0 1-.45 1-1s-.45-1-1-1zm2-9h-2v2h1v4h-1v2h2c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1z"],
    "th": ["M15 1H1c-.6 0-1 .5-1 1v12c0 .6.4 1 1 1h14c.6 0 1-.4 1-1V2c0-.5-.4-1-1-1zM6 13H2v-2h4v2zm0-3H2V8h4v2zm0-3H2V5h4v2zm8 6H7v-2h7v2zm0-3H7V8h7v2zm0-3H7V5h7v2z"],
    "th-derived": ["M5.6 10l-.3.3c-.2.2-.3.4-.3.7 0 .6.4 1 1 1 .3 0 .5-.1.7-.3l2-2c.2-.2.3-.4.3-.7s-.1-.5-.3-.7l-2-2C6.5 6.1 6.3 6 6 6c-.5 0-1 .4-1 1 0 .3.1.5.3.7l.3.3H1c-.6 0-1 .4-1 1s.4 1 1 1h4.6zM15 1H2c-.5 0-1 .5-1 1v5h2V5h11v2H8.8l.6.6c.1.1.2.3.3.4H14v2H9.7c-.1.1-.2.3-.3.4l-.6.6H14v2H3v-2H1v3c0 .5.5 1 1 1h13c.6 0 1-.5 1-1V2c0-.5-.4-1-1-1z"],
    "th-disconnect": ["M12 1h3c.6 0 1 .5 1 1v12c0 .6-.4 1-1 1h-4.97l.286-2H14v-2h-3.398l.143-1H14V8h-2.97l.143-1H14V5h-2.541l.51-3.576C11.99 1.282 12 1.14 12 1zM5.97 1l-.572 4H2v2h3.112L4.97 8H2v2h2.684l-.143 1H2v2h2.255l-.225 1.576c-.02.142-.03.284-.03.424H1c-.6 0-1-.4-1-1V2c0-.5.4-1 1-1h4.97zM8.01.859a1 1 0 111.98.282l-2 14a1 1 0 11-1.98-.282l2-14z"],
    "th-filtered": ["M10 10h3l1.78-2.226a1 1 0 00.22-.625V4.3l1-.9V14c0 .6-.4 1-1 1H1c-.6 0-1-.4-1-1V2c0-.5.4-1 1-1h4.333L9 4.3V5H7v2h2v1H7v2h3zm-4 3v-2H2v2h4zm0-3V8H2v2h4zm0-3V5H2v2h4zm8 6v-2H7v2h7z",
        "M15.48 0c.31 0 .52.26.52.57 0 .16-.06.3-.17.41l-2.86 2.73v2.63c0 .16-.06.3-.17.41l-.82 1.1c-.1.1-.25.17-.41.17-.31 0-.57-.26-.57-.57V3.71L8.17.98A.566.566 0 018 .57c0-.31.26-.57.57-.57h6.91z"],
    "th-list": ["M15 1H1c-.6 0-1 .5-1 1v12c0 .6.4 1 1 1h14c.6 0 1-.4 1-1V2c0-.5-.4-1-1-1zm-1 12H2v-2h12v2zm0-3H2V8h12v2zm0-3H2V5h12v2z"],
    "thumbs-down": ["M2 2H0v7h2c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm13.99 4.38c.08-.58-.44-1.02-1.15-1.05-.25-.01-.52-.03-.81-.05.02 0 .05-.01.07-.01.7-.1 1.34-.49 1.41-1.07.06-.58-.46-.97-1.17-1.04-.25-.02-.52-.04-.79-.06.47-.15.84-.42.87-.93.04-.58-.79-1.03-1.5-1.09-.27-.02-.51-.04-.73-.05h-.09c-.23-.02-.43-.02-.62-.03C8.35.95 5.66 1.47 4 2.51v6c2.14 1.29 4.76 3.59 4.21 5.51-.18.59.31 1.05.98.98.81-.09 1.37-.91 1.4-1.78.04-1-.15-2.01-.5-2.91-.04-.25.01-.5.37-.53.49-.03 1.11-.06 1.59-.08.26 0 .51-.01.75-.02h.01c.41-.02.8-.05 1.13-.09.7-.09 1.35-.47 1.43-1.05.08-.58-.44-.97-1.15-1.05-.05-.01-.11-.01-.16-.02.17-.01.33-.03.49-.05.72-.08 1.37-.46 1.44-1.04z"],
    "thumbs-up": ["M15.99 9.62c-.08-.58-.73-.96-1.43-1.05-.15-.02-.32-.04-.49-.05.06-.01.11-.01.16-.02.71-.08 1.23-.47 1.15-1.05-.08-.58-.73-.96-1.43-1.05-.34-.04-.72-.07-1.13-.09h-.01c-.24-.01-.49-.02-.75-.02-.48-.02-1.11-.04-1.59-.08-.36-.03-.41-.28-.37-.53.35-.9.54-1.91.5-2.91-.04-.85-.6-1.68-1.41-1.77-.67-.07-1.16.39-.99.98C8.76 3.91 6.13 6.2 4 7.49v6c1.66 1.03 4.35 1.56 7.48 1.5.19 0 .39-.01.62-.02h.09c.22-.01.46-.03.73-.05.71-.06 1.54-.51 1.5-1.09-.03-.51-.4-.79-.87-.93.27-.02.54-.04.79-.06.71-.06 1.24-.45 1.17-1.04-.06-.58-.7-.97-1.41-1.07-.02 0-.05-.01-.07-.01.29-.02.57-.03.81-.05.71-.03 1.23-.47 1.15-1.05zM2 7H0v7h2c.55 0 1-.45 1-1V8c0-.56-.45-1-1-1z"],
    "tick": ["M14 3c-.28 0-.53.11-.71.29L6 10.59l-3.29-3.3a1.003 1.003 0 00-1.42 1.42l4 4c.18.18.43.29.71.29s.53-.11.71-.29l8-8A1.003 1.003 0 0014 3z"],
    "tick-circle": ["M8 16c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4-11c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z"],
    "time": ["M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm1-6.41V4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42L9 7.59z"],
    "timeline-area-chart": ["M15 2.59L9.91 7.68 6.6 5.2l-.01.01C6.42 5.09 6.23 5 6 5c-.24 0-.44.09-.62.23v-.01L3 7.12V11h12V2.59zM15 12H2V3c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "timeline-bar-chart": ["M8 12h1c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1zm5 0h1c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1h-1c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1zm2 1H2c-.55 0-1 .45-1 1s.45 1 1 1h13c.55 0 1-.45 1-1s-.45-1-1-1zM3 12h1c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1z"],
    "timeline-events": ["M8 11H7v1h1v-1zm-4 0H3v1h1v-1zm7-8c.6 0 1-.5 1-1V1c0-.5-.4-1-1-1s-1 .5-1 1v1c0 .5.5 1 1 1zM4 3c.5 0 1-.5 1-1V1c0-.5-.5-1-1-1S3 .5 3 1v1c0 .5.5 1 1 1zm10-2h-1v1c0 1.1-.9 2-2 2s-2-.9-2-2V1H6v1c0 1.1-.9 2-2 2s-2-.9-2-2V1H1c-.5 0-1 .5-1 1v12c0 .5.5 1 1 1h13c.6 0 1-.5 1-1V2c0-.5-.4-1-1-1zM5 13H2v-3h3v3zm0-4H2V6h3v3zm4 4H6v-3h3v3zm0-4H6V6h3v3zm4 4h-3v-3h3v3zm0-4h-3V6h3v3zm-1-2h-1v1h1V7z"],
    "timeline-line-chart": ["M15 12H2V9.41l3-3L8.29 9.7c.18.19.43.3.71.3s.53-.11.71-.29l6-6a1.003 1.003 0 00-1.42-1.42L9 7.59l-3.29-3.3C5.53 4.11 5.28 4 5 4s-.53.11-.71.29L2 6.59V3c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "tint": ["M7.88 1s-4.9 6.28-4.9 8.9c.01 2.82 2.34 5.1 4.99 5.1 2.65-.01 5.03-2.3 5.03-5.13C12.99 7.17 7.88 1 7.88 1z"],
    "torch": ["M5 15c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H5v1zm7-15H4c-.55 0-1 .45-1 1v1h10V1c0-.55-.45-1-1-1zM5 7v6h6V7l2-4H3l2 4zm2 0c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1V7z"],
    "tractor": ["M3.5 9a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm9.5 1a3 3 0 110 6 3 3 0 010-6zm-9.5 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm9.5 1a1 1 0 100 2 1 1 0 000-2zM5 0c1.46 0 2.527.668 3 2l.815 3.255a78.9 78.9 0 012.186.195L11 2h2l.001 3.688c.698.095 1.37.198 2.013.312.623.11.986.479.986 1v3.354a4.001 4.001 0 00-6.873 1.645H7.999l-.026-.002A4.5 4.5 0 00.659 9.01l-.654.001v-.829C.003 7.386.002 6.423 0 6.022 0 5.5.376 4.99 1 4.99V1a1 1 0 011-1h3zm1 2H3v2.99c1.29.024 2.554.069 3.781.135L6 2z"],
    "train": ["M13 14h-1l1 2H3l1-2H3c-1.1 0-2-.9-2-2V2C1 .9 4.13 0 8 0s7 .9 7 2v10c0 1.1-.9 2-2 2zm-2-2h2v-2h-2v2zM9 7h4V3H9v4zm-6 5h2v-2H3v2zm0-5h4V3H3v4z"],
    "translate": ["M15.89 14.56l-3.99-8h-.01c-.17-.33-.5-.56-.89-.56s-.72.23-.89.56h-.01L9 8.76 7.17 7.38l.23-.18C8.37 6.47 9 5.31 9 4V3h1c.55 0 1-.45 1-1s-.45-1-1-1H7c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1H1c-.55 0-1 .45-1 1s.45 1 1 1h6v1c0 .66-.32 1.25-.82 1.61l-.68.51-.68-.5C4.32 5.25 4 4.66 4 4H2c0 1.31.63 2.47 1.6 3.2l.23.17L1.4 9.2l.01.01C1.17 9.4 1 9.67 1 10c0 .55.45 1 1 1 .23 0 .42-.09.59-.21l.01.01 2.9-2.17 2.6 1.95-1.99 3.98h.01c-.07.13-.12.28-.12.44 0 .55.45 1 1 1 .39 0 .72-.23.89-.56h.01L8.62 14h4.76l.72 1.45h.01c.17.32.5.55.89.55.55 0 1-.45 1-1 0-.16-.05-.31-.11-.44zM9.62 12L11 9.24 12.38 12H9.62z"],
    "trash": ["M14.49 3.99h-13c-.28 0-.5.22-.5.5s.22.5.5.5h.5v10c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-10h.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm-8.5 9c0 .55-.45 1-1 1s-1-.45-1-1v-6c0-.55.45-1 1-1s1 .45 1 1v6zm3 0c0 .55-.45 1-1 1s-1-.45-1-1v-6c0-.55.45-1 1-1s1 .45 1 1v6zm3 0c0 .55-.45 1-1 1s-1-.45-1-1v-6c0-.55.45-1 1-1s1 .45 1 1v6zm2-12h-4c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1h-4c-.55 0-1 .45-1 1v1h14v-1c0-.55-.45-1-1-1z"],
    "tree": ["M9 11.857V16H7v-4.143L1 13l3.885-4.44L3 9l3.07-4.297L5 5l3-5 3 5-1.07-.297L13 9l-1.885-.44L15 13l-6-1.143z"],
    "trending-down": ["M15 7c-.55 0-1 .45-1 1v.59l-4.29-4.3A.997.997 0 009 4c-.16 0-.31.05-.44.11V4.1L5 5.88 1.45 4.11v.01C1.31 4.05 1.16 4 1 4c-.55 0-1 .45-1 1 0 .39.23.72.56.89v.01l4 2v-.01c.13.06.28.11.44.11s.31-.05.44-.11v.01L8.8 6.22 12.59 10H12c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1z"],
    "trending-up": ["M15 4h-3c-.55 0-1 .45-1 1s.45 1 1 1h.59L8.8 9.78 5.45 8.11v.01C5.31 8.05 5.16 8 5 8s-.31.05-.44.11V8.1l-4 2v.01c-.33.17-.56.5-.56.89 0 .55.45 1 1 1 .16 0 .31-.05.44-.11v.01L5 10.12l3.55 1.78v-.01c.14.06.29.11.45.11.28 0 .53-.11.71-.29L14 7.41V8c0 .55.45 1 1 1s1-.45 1-1V5c0-.55-.45-1-1-1z"],
    "truck": ["M12.5 0a.5.5 0 01.5.5V9a1 1 0 011 1v2h.5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5H13v1a1 1 0 01-2 0v-1H5v1a1 1 0 01-2 0v-1H1.5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5H2v-2a1 1 0 011-1V.5a.5.5 0 011 0V3a2 2 0 012-2h4a2 2 0 012 2V.5a.5.5 0 01.5-.5zM9 8H7a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1V9a1 1 0 00-1-1zm3.5 3h-1a.5.5 0 100 1h1a.5.5 0 100-1zm-8 0h-1a.5.5 0 100 1h1a.5.5 0 100-1zM9 9a.5.5 0 01.5.5v1l-.008.09A.5.5 0 019 11H7l-.09-.008a.5.5 0 01-.41-.492v-1l.008-.09A.5.5 0 017 9zm2-5H5v2h6V4z"],
    "two-columns": ["M3.99-.01h-3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-14c0-.55-.45-1-1-1zm11.71 7.3l-2-2a1.003 1.003 0 00-1.71.71v4a1.003 1.003 0 001.71.71l2-2c.18-.18.29-.43.29-.71s-.11-.53-.29-.71zM9.99-.01h-3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-14c0-.55-.45-1-1-1z"],
    "unarchive": ["M13.382 0a1 1 0 01.894.553L16 4v11a1 1 0 01-1 1H1a1 1 0 01-1-1V4L1.724.553A1 1 0 012.618 0h10.764zM8 6c-.28 0-.53.11-.71.29l-2 2-.084.096A1.003 1.003 0 006.71 9.71l.29-.3V12l.007.116c.058.496.482.884.993.884.55 0 1-.45 1-1V9.41l.29.29.081.076A.97.97 0 0010 10a1.003 1.003 0 00.71-1.71l-2-2-.096-.084A1.002 1.002 0 008 6zm5-4H3L2 4h12l-1-2z"],
    "underline": ["M8 14c2.8 0 5-2.2 5-5V3c0-.6-.4-1-1-1s-1 .4-1 1v6c0 1.7-1.3 3-3 3s-3-1.3-3-3V3c0-.6-.4-1-1-1s-1 .4-1 1v6c0 2.8 2.2 5 5 5zM13.5 15h-11c-.3 0-.5.2-.5.5s.2.5.5.5h11c.3 0 .5-.2.5-.5s-.2-.5-.5-.5z"],
    "undo": ["M4 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm7-7H3.41L4.7 2.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-3 3C.11 4.47 0 4.72 0 5c0 .28.11.53.29.71l3 3a1.003 1.003 0 001.42-1.42L3.41 6H11c1.66 0 3 1.34 3 3s-1.34 3-3 3H7v2h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"],
    "ungroup-objects": ["M3.5 5C1.57 5 0 6.57 0 8.5S1.57 12 3.5 12 7 10.43 7 8.5 5.43 5 3.5 5zm9 0C10.57 5 9 6.57 9 8.5s1.57 3.5 3.5 3.5S16 10.43 16 8.5 14.43 5 12.5 5z"],
    "unknown-vehicle": ["M10.507 9.75v-3.5c0-.089.023-.171.051-.25h-7.55c-.176 0-.061-.824 0-1l.729-1.63c.06-.177.095-.37.27-.37h4.5V1.01c-.166-.003-.32-.01-.5-.01-2.72 0-4.036.402-4.036.402-.508.155-1.079.711-1.268 1.237L1.94 4.756H.887c-.483 0-.88.423-.88.939s.397.939.88.939h.376L1.008 7c-.034.685 0 1.436 0 2v5c0 .657.384 1 1 1s1-.343 1-1v-1h10v1c0 .657.383 1 1 1s1-.343 1-1v-3.5h-3.75a.75.75 0 01-.75-.75zm-5.5.25h-2V8h2v2zm11-4.305zM15.34.826a2.807 2.807 0 00-.932-.598c-.386-.16-.868-.241-1.445-.241-.447 0-.851.076-1.213.228-.362.153-.67.364-.926.636s-.456.592-.598.963a3.535 3.535 0 00-.218 1.144V3h1.789c.003-.208.023-.405.069-.588.049-.193.124-.362.225-.506.102-.144.232-.259.39-.345.159-.087.348-.13.567-.13.325 0 .58.09.762.272.183.18.275.46.275.839.008.222-.031.407-.116.555a1.654 1.654 0 01-.335.408 7.4 7.4 0 01-.452.37c-.162.123-.316.27-.463.438a2.556 2.556 0 00-.384.611c-.11.239-.177.535-.2.889V6h1.645v-.1c.032-.248.111-.453.237-.618.126-.164.27-.31.433-.438.163-.128.335-.255.518-.383a2.413 2.413 0 00.878-1.117c.102-.255.152-.58.152-.975A2.241 2.241 0 0015.34.826zM12.007 7v2h2V7h-2z"],
    "unlock": ["M11.99-.01c-2.21 0-4 1.79-4 4v3h-7c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-7c0-.55-.45-1-1-1h-3v-3c0-1.1.9-2 2-2s2 .9 2 2v1c0 .55.45 1 1 1s1-.45 1-1v-1c0-2.21-1.79-4-4-4z"],
    "unpin": ["M9.39 1c-.5.5-.4 1.48.15 2.53L4.38 7.54C2.85 6.5 1.52 6.07 1 6.59l3.5 3.5c-.02.02-1.4 2.8-1.4 2.8l2.8-1.4 3.5 3.5c.53-.53.1-1.86-.95-3.38l4.02-5.16c1.04.55 2.01.65 2.51.14L9.39 1z"],
    "unresolve": ["M11 3c-.55 0-1.07.09-1.57.26a6.46 6.46 0 010 9.48c.5.17 1.02.26 1.57.26 2.76 0 5-2.24 5-5s-2.24-5-5-5zM9.78 9.38l.09-.27c.08-.36.13-.73.13-1.11s-.05-.75-.13-1.11l-.09-.27a5.32 5.32 0 00-.29-.79l-.12-.21c-.14-.27-.31-.52-.51-.76a.7.7 0 00-.08-.1c-.24-.27-.49-.52-.78-.74-.43-.32-.92-.58-1.45-.75l.01-.01c-.1-.03-.2-.05-.3-.08-.12-.03-.23-.07-.36-.09A5.28 5.28 0 005 3C2.24 3 0 5.24 0 8s2.24 5 5 5c.31 0 .61-.04.9-.09.12-.02.24-.06.36-.09.1-.03.21-.04.3-.08l-.01-.01c.88-.29 1.64-.8 2.22-1.49.03-.03.06-.07.09-.1.19-.24.36-.49.51-.76.04-.07.08-.14.11-.21.13-.25.23-.52.3-.79z"],
    "updated": ["M8 0a7.95 7.95 0 00-6 2.74V1c0-.55-.45-1-1-1S0 .45 0 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1H3.54C4.64 2.78 6.22 2 8 2c3.31 0 6 2.69 6 6 0 2.61-1.67 4.81-4 5.63-.63.22-1.29.37-2 .37-3.31 0-6-2.69-6-6 0-.55-.45-1-1-1s-1 .45-1 1c0 4.42 3.58 8 8 8 .34 0 .67-.03 1-.07.02 0 .04-.01.06-.01C12.98 15.4 16 12.06 16 8c0-4.42-3.58-8-8-8zm3 5c-.28 0-.53.11-.71.29L7 8.58 5.71 7.29a1.003 1.003 0 00-1.42 1.42l2 2c.18.18.43.29.71.29.28 0 .53-.11.71-.29l4-4A1.003 1.003 0 0011 5z"],
    "upload": ["M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3 8c-.28 0-.53-.11-.71-.29L9 6.41V12c0 .55-.45 1-1 1s-1-.45-1-1V6.41l-1.29 1.3a1.003 1.003 0 01-1.42-1.42l3-3C7.47 3.11 7.72 3 8 3s.53.11.71.29l3 3A1.003 1.003 0 0111 8z"],
    "user": ["M7.99-.01A7.998 7.998 0 00.03 8.77c.01.09.03.18.04.28.02.15.04.31.07.47.02.11.05.22.08.34.03.13.06.26.1.38.04.12.08.25.12.37.04.11.08.21.12.32a6.583 6.583 0 00.3.65c.07.14.14.27.22.4.04.07.08.13.12.2l.27.42.1.13a7.973 7.973 0 003.83 2.82c.03.01.05.02.07.03.37.12.75.22 1.14.29l.2.03c.39.06.79.1 1.2.1s.81-.04 1.2-.1l.2-.03c.39-.07.77-.16 1.14-.29.03-.01.05-.02.07-.03a8.037 8.037 0 003.83-2.82c.03-.04.06-.08.09-.13.1-.14.19-.28.28-.42.04-.07.08-.13.12-.2.08-.13.15-.27.22-.41.04-.08.08-.17.12-.26.06-.13.11-.26.17-.39.04-.1.08-.21.12-.32.04-.12.08-.24.12-.37.04-.13.07-.25.1-.38.03-.11.06-.22.08-.34.03-.16.05-.31.07-.47.01-.09.03-.18.04-.28.02-.26.04-.51.04-.78-.03-4.41-3.61-7.99-8.03-7.99zm0 14.4c-1.98 0-3.75-.9-4.92-2.31.67-.36 1.49-.66 2.14-.95 1.16-.52 1.04-.84 1.08-1.27.01-.06.01-.11.01-.17-.41-.36-.74-.86-.96-1.44v-.01c0-.01-.01-.02-.01-.02-.05-.13-.09-.26-.12-.39-.28-.05-.44-.35-.5-.63-.06-.11-.18-.38-.15-.69.04-.41.2-.59.38-.67v-.06c0-.51.05-1.24.14-1.72.02-.13.05-.26.09-.39.17-.59.53-1.12 1.01-1.49.49-.38 1.19-.59 1.82-.59.62 0 1.32.2 1.82.59.48.37.84.9 1.01 1.49.04.13.07.26.09.4.09.48.14 1.21.14 1.72v.07c.18.08.33.26.37.66.03.31-.1.58-.16.69-.06.27-.21.57-.48.62-.03.13-.07.26-.12.38 0 .01-.01.04-.01.04-.21.57-.54 1.06-.94 1.42 0 .06.01.13.01.19.04.43-.12.75 1.05 1.27.65.29 1.47.6 2.14.95a6.415 6.415 0 01-4.93 2.31z"],
    "variable": ["M3.94 3.15c.47-.66 1.05-1.24 1.76-1.73l.13-.4c-1.11.45-2.05 1.01-2.84 1.7-1.02.88-1.8 1.9-2.32 3.05C.22 6.76 0 7.75 0 8.75c0 1.75.66 3.5 1.99 5.25l.13-.42c-.39-.94-.59-1.82-.59-2.63 0-1.28.22-2.64.67-4.1.45-1.45 1.03-2.69 1.74-3.7zm7.51 6.41l-.27-.15c-.3.41-.52.66-.66.77-.09.06-.21.1-.33.1-.15 0-.3-.1-.45-.28-.25-.33-.59-1.22-1.01-2.69.38-.65.69-1.08.95-1.28.19-.15.39-.22.59-.22.08 0 .22.03.43.08.2.06.39.08.54.08.22 0 .4-.07.54-.22.15-.15.22-.34.22-.57 0-.25-.07-.45-.22-.59-.15-.15-.35-.22-.63-.22-.24 0-.47.06-.69.17-.21.11-.49.36-.82.74-.25.28-.61.78-1.1 1.48a6.72 6.72 0 00-.97-2.38l-2.59.44-.05.27c.19-.04.36-.06.49-.06.26 0 .47.11.64.33.26.34.63 1.38 1.11 3.12-.37.49-.63.81-.77.96-.23.24-.41.4-.56.47-.11.06-.24.09-.39.09-.11 0-.29-.06-.53-.18-.17-.07-.32-.11-.45-.11-.25 0-.46.08-.62.24-.16.16-.24.37-.24.61 0 .23.08.42.23.57.15.15.35.22.61.22.25 0 .48-.05.7-.15.22-.1.49-.32.82-.65.33-.33.78-.86 1.36-1.59.22.69.42 1.19.58 1.51.16.31.35.54.56.68.21.14.47.21.79.21.31 0 .62-.11.93-.33.4-.29.82-.77 1.26-1.47zm2.56-8.54l-.12.42c.39.95.59 1.82.59 2.64 0 1.09-.17 2.26-.5 3.51-.26.96-.6 1.87-1.02 2.71-.42.85-.82 1.51-1.21 1.98-.39.48-.87.92-1.44 1.32l-.14.4c1.11-.45 2.05-1.02 2.84-1.7 1.03-.89 1.81-1.91 2.33-3.05.44-.99.66-1.99.66-3 0-1.73-.66-3.48-1.99-5.23z"],
    "vertical-bar-chart-asc": ["M6 7c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1zM2 9c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1s1-.45 1-1v-5c0-.55-.45-1-1-1zm8-5c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1s1-.45 1-1V5c0-.55-.45-1-1-1zm4-4c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "vertical-bar-chart-desc": ["M6 4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1s1-.45 1-1V5c0-.55-.45-1-1-1zM2 0c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zm8 7c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1V8c0-.55-.45-1-1-1zm4 2c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1s1-.45 1-1v-5c0-.55-.45-1-1-1z"],
    "vertical-distribution": ["M1 2h14c.55 0 1-.45 1-1s-.45-1-1-1H1C.45 0 0 .45 0 1s.45 1 1 1zm14 11H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zM3 5c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1H3z"],
    "video": ["M15 2H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zM5 11V5l6 3-6 3z"],
    "volume-down": ["M9 2c-.28 0-.53.11-.71.29L5.59 5H3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h2.59l2.71 2.71c.17.18.42.29.7.29.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm3.57 1.44l-1.59 1.22C11.62 5.61 12 6.76 12 8s-.38 2.39-1.02 3.34l1.59 1.22C13.47 11.27 14 9.7 14 8c0-1.7-.53-3.27-1.43-4.56z"],
    "volume-off": ["M11 2c-.28 0-.53.11-.71.29L7.59 5H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h2.59l2.71 2.71c.17.18.42.29.7.29.55 0 1-.45 1-1V3c0-.55-.45-1-1-1z"],
    "volume-up": ["M7 1.86c-.28 0-.53.11-.71.29l-2.7 2.71H1c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h2.59l2.71 2.71a1.003 1.003 0 001.71-.71v-10c-.01-.55-.46-1-1.01-1zm6.74-.99l-1.58 1.22A9.985 9.985 0 0114 7.86c0 2.16-.69 4.15-1.85 5.78l1.58 1.22c1.42-1.97 2.26-4.38 2.26-7 .01-2.61-.84-5.02-2.25-6.99zM8.98 4.52C9.62 5.48 10 6.63 10 7.86s-.38 2.39-1.02 3.34l1.59 1.22c.9-1.29 1.43-2.86 1.43-4.56 0-1.7-.53-3.27-1.43-4.56L8.98 4.52z"],
    "walk": ["M13 8h-2c-.16 0-.31-.05-.44-.11v.01l-1.02-.51-.37 1.86 1.38.92-.01.02c.27.17.46.46.46.81v4c0 .55-.45 1-1 1s-1-.45-1-1v-3.46l-1.27-.85-1.8 4.67h-.01A.98.98 0 015 16c-.55 0-1-.45-1-1 0-.13.03-.25.07-.36h-.01L7.39 6H5.62l-.73 1.45h-.01C4.72 7.77 4.39 8 4 8c-.55 0-1-.45-1-1 0-.16.05-.31.11-.44H3.1l1-2h.01c.17-.33.5-.56.89-.56h3.16l.29-.75C8.17 2.9 8 2.47 8 2c0-1.1.9-2 2-2s2 .9 2 2c0 1-.73 1.82-1.69 1.97l-.5 1.32 1.43.71H13c.55 0 1 .45 1 1s-.45 1-1 1z"],
    "warning-sign": ["M15.84 13.5l.01-.01-7-12-.01.01c-.17-.3-.48-.5-.85-.5s-.67.2-.85.5l-.01-.01-7 12 .01.01c-.09.15-.15.31-.15.5 0 .55.45 1 1 1h14c.55 0 1-.45 1-1 0-.19-.06-.35-.15-.5zm-6.85-.51h-2v-2h2v2zm0-3h-2v-5h2v5z"],
    "waterfall-chart": ["M8 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-4 4h1c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1zm7-6c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1zm4-3h-1c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm0 10H2V3c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "widget": ["M13 11h2V5h-2v6zM3 5H1v6h2V5zm11-1c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM2 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5 3h6V1H5v2zM2 0C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm3 15h6v-2H5v2z"],
    "widget-button": ["M1 3h14c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1zm1 2v6h12V5H2zm3 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm3 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"],
    "widget-footer": ["M14 0H2c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 14H3v-3h10v3zm0-4H3V2h10v8z"],
    "widget-header": ["M14 0H2c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 14H3V6h10v8zm0-9H3V2h10v3z"],
    "wrench": ["M15.83 3.7l-3.06 3.05-2.84-.7-.7-2.83L12.29.17a5.004 5.004 0 00-4.83 1.29 4.967 4.967 0 00-1.12 5.36L.58 12.58c-.36.36-.58.86-.58 1.41 0 1.1.9 2 2 2 .55 0 1.05-.22 1.41-.59l5.77-5.77c1.79.69 3.91.33 5.35-1.12 1.32-1.3 1.74-3.15 1.3-4.81z"],
    "zoom-in": ["M7.99 5.99v-2c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1h-2zm7.56 7.44l-2.67-2.68a6.94 6.94 0 001.11-3.76c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.39 0 2.68-.42 3.76-1.11l2.68 2.67a1.498 1.498 0 102.12-2.12zm-8.56-1.44c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"],
    "zoom-out": ["M3.99 5.99c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1h-6zm11.56 7.44l-2.67-2.68a6.94 6.94 0 001.11-3.76c0-3.87-3.13-7-7-7s-7 3.13-7 7 3.13 7 7 7c1.39 0 2.68-.42 3.76-1.11l2.68 2.67a1.498 1.498 0 102.12-2.12zm-8.56-1.44c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"],
    "zoom-to-fit": ["M11 10a1.003 1.003 0 001.71.71l2-2c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-2-2a1.003 1.003 0 00-1.42 1.42L12.59 8 11.3 9.29c-.19.18-.3.43-.3.71zM1 5c.55 0 1-.45 1-1V2h2c.55 0 1-.45 1-1s-.45-1-1-1H1C.45 0 0 .45 0 1v3c0 .55.45 1 1 1zm4 1a1.003 1.003 0 00-1.71-.71l-2 2C1.11 7.47 1 7.72 1 8c0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42L3.41 8 4.7 6.71c.19-.18.3-.43.3-.71zm1-1c.28 0 .53-.11.71-.29L8 3.41 9.29 4.7c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-2-2C8.53 1.11 8.28 1 8 1s-.53.11-.71.29l-2 2A1.003 1.003 0 006 5zm9 6c-.55 0-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1zm0-11h-3c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zM4 14H2v-2c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1zm6-3c-.28 0-.53.11-.71.29L8 12.59 6.71 11.3A.965.965 0 006 11a1.003 1.003 0 00-.71 1.71l2 2c.18.18.43.29.71.29s.53-.11.71-.29l2-2A1.003 1.003 0 0010 11z"],
};
var IconSvgPaths20 = {
    "add": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm5-9h-4V5c0-.55-.45-1-1-1s-1 .45-1 1v4H5c-.55 0-1 .45-1 1s.45 1 1 1h4v4c0 .55.45 1 1 1s1-.45 1-1v-4h4c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "add-column-left": ["M4 11h2v2c0 .55.45 1 1 1s1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1H8V7c0-.55-.45-1-1-1s-1 .45-1 1v2H4c-.55 0-1 .45-1 1s.45 1 1 1zM19 0H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-7 18H2V2h10v16zm6 0h-5V2h5v16z"],
    "add-column-right": ["M10 11h2v2c0 .55.45 1 1 1s1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V7c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1zm9-11H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM7 18H2V2h5v16zm11 0H8V2h10v16z"],
    "add-row-bottom": ["M19 0H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 18H2V8h16v10zm0-11H2V2h16v5zM7 14h2v2c0 .55.45 1 1 1s1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1h-2v-2c0-.55-.45-1-1-1s-1 .45-1 1v2H7c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "add-row-top": ["M7 8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V4c0-.55-.45-1-1-1s-1 .45-1 1v2H7c-.55 0-1 .45-1 1s.45 1 1 1zm12-8H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 18H2v-5h16v5zm0-6H2V2h16v10z"],
    "add-to-artifact": ["M13 12H1c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1zm0 4H1c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1zM1 6h9c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm12 2H1c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1zm6-4h-2V2c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V6h2c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "add-to-folder": ["M.01 10V6H20v10c0 .55-.45 1-1 1H9.995v-3.99C9.965 11.332 8.635 10 6.987 10H.01zM19 3c.55 0 1 .45.99 1v1H0V2c0-.55.45-1 1-1h5.997c.28 0 .53.11.71.29L9.414 3H19zM6.987 12c.55 0 .999.45 1.009 1.01v5c0 .55-.45 1-1 1s-.999-.45-.999-1v-2.59l-4.288 4.29a1.003 1.003 0 01-1.42-1.42L4.579 14H1.989c-.55 0-1-.45-1-1s.45-1 1-1h4.998z"],
    "airplane": ["M20 2c0-1.1-.9-2-2-2-.55 0-1.05.22-1.41.59l-4.84 4.84L2 1 1 3l7.53 5.64L4.17 13H1l-1 1 4 2 2 4 1-1v-3.17l4.36-4.36L17 19l2-1-4.43-9.74 4.84-4.84c.37-.37.59-.87.59-1.42z"],
    "align-center": ["M5 5c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1H5zM1 3h18c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm12 12c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h6zm4 2H3c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zm2-8H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "align-justify": ["M1 3h18c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm18 14H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zm0-12H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zm0 4H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zm0 4H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "align-left": ["M1 7h10c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm0-4h18c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm14 14H1c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zm4-8H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zM1 15h6c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "align-right": ["M19 17H5c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1zM1 3h18c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm18 10h-6c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1zm0-4H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zm0-4H9c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "alignment-bottom": ["M12 16h4c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1zm7 2H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zM4 16h4c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1z"],
    "alignment-horizontal-center": ["M19 9h-2V7c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v2H9V3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v6H1c-.55 0-1 .45-1 1s.45 1 1 1h2v6c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-6h2v2c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "alignment-left": ["M1 0C.45 0 0 .45 0 1v18c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zm11 11H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h7c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1zm7-8H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "alignment-right": ["M19 0c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zm-4 11H8c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h7c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1zm0-8H1c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "alignment-top": ["M8 4H4c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm11-4H1C.45 0 0 .45 0 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zm-3 4h-4c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1z"],
    "alignment-vertical-center": ["M17 3h-6V1c0-.55-.45-1-1-1S9 .45 9 1v2H3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h6v2H7c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1v-2h2c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1h-2V9h6c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "annotation": ["M9.41 13.41l7.65-7.65-2.83-2.83-7.65 7.65 2.83 2.83zm10-10c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2-.55 0-1.05.22-1.41.59l-1.65 1.65 2.83 2.83 1.64-1.66zM18 18H2V2h8.93l2-2H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V7.07l-2 2V18zM4 16l4.41-1.59-2.81-2.79L4 16z"],
    "application": ["M3.5 9h9c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-9c-.28 0-.5.22-.5.5s.22.5.5.5zm0 2h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-5c-.28 0-.5.22-.5.5s.22.5.5.5zM19 1H1c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm-1 16H2V6h16v11zM3.5 13h7c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-7c-.28 0-.5.22-.5.5s.22.5.5.5z"],
    "applications": ["M15 5H1c-.55 0-1 .45-1 1v13c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm-1 13H2V8h12v10zM3.5 10h7c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-7c-.28 0-.5.22-.5.5s.22.5.5.5zm0 2h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-3c-.28 0-.5.22-.5.5s.22.5.5.5zm0 2h5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5h-5c-.28 0-.5.22-.5.5s.22.5.5.5zM19 0H5c-.55 0-1 .45-1 1v3h2V3h12v10h-1v2h2c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "archive": ["M16.434 0a1 1 0 01.857.486L20 5v14a1 1 0 01-1 1H1a1 1 0 01-1-1V5L2.709.486A1 1 0 013.566 0h12.868zM10 8c-.55 0-1 .45-1 1v4.58l-1.29-1.29-.081-.073A.996.996 0 007 11.99a1.003 1.003 0 00-.71 1.71l3 3 .096.084c.168.13.38.206.614.206.28 0 .53-.11.71-.29l3-3 .084-.096a1.003 1.003 0 00-1.504-1.324L11 13.58V9l-.007-.116A1.004 1.004 0 0010 8zm6-6H4L2 5.002h16L16 2z"],
    "arrow-bottom-left": ["M18 3a1.003 1.003 0 00-1.71-.71L4 14.59V7c0-.55-.45-1-1-1s-1 .45-1 1v10c0 .55.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1H5.41l12.3-12.29c.18-.18.29-.43.29-.71z"],
    "arrow-bottom-right": ["M17 6c-.55 0-1 .45-1 1v7.59L3.71 2.29a1.003 1.003 0 00-1.42 1.42L14.59 16H7c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1z"],
    "arrow-down": ["M16 11c-.3 0-.5.1-.7.3L11 15.6V2c0-.5-.4-1-1-1s-1 .5-1 1v13.6l-4.3-4.3c-.2-.2-.4-.3-.7-.3-.5 0-1 .4-1 1 0 .3.1.5.3.7l6 6c.2.2.4.3.7.3s.5-.1.7-.3l6-6c.2-.2.3-.4.3-.7 0-.6-.5-1-1-1z"],
    "arrow-left": ["M18 9H4.41L8.7 4.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-6 6c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l6 6a1.003 1.003 0 001.42-1.42L4.41 11H18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "arrow-right": ["M18.71 9.29l-6-6a1.003 1.003 0 00-1.42 1.42L15.59 9H2c-.55 0-1 .45-1 1s.45 1 1 1h13.59l-4.29 4.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l6-6c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"],
    "arrow-top-left": ["M17.71 16.29L5.41 4H13c.55 0 1-.45 1-1s-.45-1-1-1H3c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1s1-.45 1-1V5.41L16.29 17.7c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71z"],
    "arrow-top-right": ["M17 2H7c-.55 0-1 .45-1 1s.45 1 1 1h7.59L2.29 16.29a1.003 1.003 0 001.42 1.42L16 5.41V13c0 .55.45 1 1 1s1-.45 1-1V3c0-.55-.45-1-1-1z"],
    "arrow-up": ["M16.7 7.3l-6-6c-.2-.2-.4-.3-.7-.3s-.5.1-.7.3l-6 6c-.2.2-.3.4-.3.7 0 .6.5 1 1 1 .3 0 .5-.1.7-.3L9 4.4V18c0 .5.4 1 1 1s1-.5 1-1V4.4l4.3 4.3c.2.2.4.3.7.3.5 0 1-.4 1-1 0-.3-.1-.5-.3-.7z"],
    "arrows-horizontal": ["M19.7 9.3l-5-5c-.2-.2-.4-.3-.7-.3-.6 0-1 .4-1 1 0 .3.1.5.3.7L16.6 9H3.4l3.3-3.3c.2-.2.3-.4.3-.7 0-.6-.4-1-1-1-.3 0-.5.1-.7.3l-5 5c-.2.2-.3.4-.3.7s.1.5.3.7l5 5c.2.2.4.3.7.3.6 0 1-.4 1-1 0-.3-.1-.5-.3-.7L3.4 11h13.2l-3.3 3.3c-.2.2-.3.4-.3.7 0 .6.4 1 1 1 .3 0 .5-.1.7-.3l5-5c.2-.2.3-.4.3-.7s-.1-.5-.3-.7z"],
    "arrows-vertical": ["M15 13c-.3 0-.5.1-.7.3L11 16.6V3.4l3.3 3.3c.2.2.4.3.7.3.6 0 1-.4 1-1 0-.3-.1-.5-.3-.7l-5-5c-.2-.2-.4-.3-.7-.3s-.5.1-.7.3l-5 5c-.2.2-.3.4-.3.7 0 .6.4 1 1 1 .3 0 .5-.1.7-.3L9 3.4v13.2l-3.3-3.3c-.2-.2-.4-.3-.7-.3-.6 0-1 .4-1 1 0 .3.1.5.3.7l5 5c.2.2.4.3.7.3s.5-.1.7-.3l5-5c.2-.2.3-.4.3-.7 0-.5-.4-1-1-1z"],
    "asterisk": ["M18.52 14.17l.01-.02L11.89 10l6.64-4.15-.01-.02A.97.97 0 0019 5c0-.55-.45-1-1-1-.2 0-.37.07-.52.17l-.01-.02L11 8.2V1c0-.55-.45-1-1-1S9 .45 9 1v7.2L2.53 4.15l-.01.02A.922.922 0 002 4c-.55 0-1 .45-1 1 0 .36.2.66.48.83l-.01.02L8.11 10l-6.64 4.15.01.02A.97.97 0 001 15c0 .55.45 1 1 1 .2 0 .37-.07.52-.17l.01.02L9 11.8V19c0 .55.45 1 1 1s1-.45 1-1v-7.2l6.47 4.04.01-.02c.15.11.32.18.52.18.55 0 1-.45 1-1 0-.36-.2-.66-.48-.83z"],
    "automatic-updates": ["M10 18c-4.42 0-8-3.58-8-8 0-2.52 1.18-4.76 3-6.22V5c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1h2.06C1.61 3.82 0 6.71 0 10c0 5.52 4.48 10 10 10 .55 0 1-.45 1-1s-.45-1-1-1zm0-16c1.64 0 3.15.49 4.42 1.34l1.43-1.43A9.869 9.869 0 0010 0c-.55 0-1 .45-1 1s.45 1 1 1zm10 8c0-1.13-.2-2.21-.54-3.22L17.84 8.4A7.962 7.962 0 0115 16.22V15c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1h-2.06c2.45-1.82 4.06-4.71 4.06-8zm0-7a1.003 1.003 0 00-1.71-.71L12 8.59l-2.29-2.3a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l7-7c.18-.18.29-.43.29-.71z"],
    "badge": ["M16.94 5.73c-.19-1.41.62-2.52 1.38-3.59L17.03.65C14.89 1.76 11.88 1.48 10 0 8.12 1.48 5.11 1.76 2.97.65L1.68 2.14c.76 1.07 1.57 2.18 1.38 3.59C2.68 8.59 0 10.94 1.4 14.08c.56 1.43 1.81 2.37 3.4 2.75 1.95.46 4.4.91 5.2 3.17.8-2.26 3.25-2.71 5.2-3.17 1.6-.38 2.84-1.32 3.4-2.75 1.4-3.14-1.28-5.49-1.66-8.35z"],
    "ban-circle": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm5 11H5c-.55 0-1-.45-1-1s.45-1 1-1h10c.55 0 1 .45 1 1s-.45 1-1 1z"],
    "bank-account": ["M19.2 8.02l-.78-.18C18.03 6.4 17.2 5.08 16.08 4l.5-2.28c.11-.42-.22-.78-.61-.72-1.06.12-2 .54-2.67 1.26-1.06-.42-2.34-.66-3.56-.66-3.12 0-5.79 1.5-7.4 3.72-.23-.05-.45-.11-.67-.11C.72 5.21 0 5.98 0 7c0 .72.39 1.32.95 1.62-.06.42-.12.9-.12 1.38 0 2.16.89 4.08 2.28 5.58l-.33 2.04c-.11.72.45 1.38 1.12 1.38h.72c.56 0 1-.42 1.11-1.02l.06-.48c1.17.54 2.5.9 3.95.9 1.39 0 2.78-.3 3.95-.9l.06.48c.11.6.56 1.02 1.11 1.02h.72c.67 0 1.22-.66 1.11-1.38l-.33-1.98c.78-.78 1.34-1.74 1.73-2.76l1-.24c.5-.12.89-.6.89-1.2V9.22c.11-.6-.28-1.08-.78-1.2zM15 10c-.6 0-1-.7-1-1.5S14.4 7 15 7s1 .7 1 1.5-.4 1.5-1 1.5zM7.55 5.83a.99.99 0 01-1.38-.28.99.99 0 01.28-1.38c2.34-1.56 4.77-1.56 7.11 0 .46.31.58.93.28 1.39-.31.46-.93.58-1.39.28-1.67-1.12-3.23-1.12-4.9-.01z"],
    "barcode": ["M6 16.98h2v-14H6v14zm3 0h1v-14H9v14zm-6 0h2v-14H3v14zm-3 0h2v-14H0v14zm16 0h2v-14h-2v14zm-4 0h1v-14h-1v14zm7-14v14h1v-14h-1zm-5 14h1v-14h-1v14z"],
    "blank": [],
    "blocked-person": ["M11.55 15.92c-1.48-.65-1.28-1.05-1.33-1.59-.01-.07-.01-.15-.01-.23.51-.45.92-1.07 1.19-1.78 0 0 .01-.04.02-.05.06-.15.11-.32.15-.48.34-.07.54-.44.61-.78.06-.11.14-.35.17-.62C10.33 9.42 8.92 7.38 8.92 5c0-.3.05-.58.09-.87-.33-.08-.67-.13-.99-.13-.79 0-1.68.25-2.31.73-.61.47-1.07 1.13-1.29 1.86-.05.16-.09.33-.11.5-.12.6-.17 1.51-.17 2.14v.08c-.24.09-.45.32-.49.83-.04.39.12.73.2.87.08.35.28.72.63.78.04.17.09.33.15.48 0 .01.01.02.01.03l.01.01c.27.72.7 1.35 1.22 1.8 0 .07-.01.14-.01.21-.05.54.1.94-1.38 1.59C3 16.56.77 17.26.32 18.31-.15 19.38.04 20 .04 20h15.95s.18-.62-.27-1.67c-.46-1.06-2.69-1.75-4.17-2.41zM14.97 0c-2.78 0-5.03 2.24-5.03 5s2.25 5 5.03 5S20 7.76 20 5s-2.25-5-5.03-5zm-3.03 5c0-1.66 1.35-3 3.02-3 .47 0 .9.11 1.29.3l-4.01 3.99c-.18-.4-.3-.83-.3-1.29zm3.03 3c-.47 0-.9-.11-1.29-.3l4.01-3.99c.19.39.3.82.3 1.29 0 1.66-1.36 3-3.02 3z"],
    "bold": ["M14.3 9c.4-.8.7-1.6.7-2.5C15 4 13 2 10.5 2H5c-.6 0-1 .4-1 1v13c0 .6.4 1 1 1h6.5c2.5 0 4.5-2 4.5-4.5 0-1.4-.7-2.7-1.7-3.5zM7 5h3.5c.8 0 1.5.7 1.5 1.5S11.3 8 10.5 8H7V5zm4.5 9H7v-3h4.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5z"],
    "book": ["M3 1v18c0 .55.45 1 1 1h2V0H4c-.55 0-1 .45-1 1zm14-1h-2v8l-2-2-2 2V0H7v20h10c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "bookmark": ["M6 0c-.55 0-1 .45-1 1v18c0 .55.32.68.71.29L9.3 15.7a.996.996 0 011.41 0l3.59 3.59c.38.39.7.26.7-.29v-8-4.5V1c0-.55-.45-1-1-1H6z"],
    "box": ["M19.89 6.56l-2.99-6h-.01C16.72.23 16.39 0 16 0H4c-.39 0-.72.23-.89.56H3.1l-3 6h.01C.05 6.69 0 6.84 0 7v12c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V7c0-.16-.05-.31-.11-.44zM11 2h4.38l2 4H11V2zM4.62 2H9v4H2.62l2-4zM18 18H2V8h16v10zM8 12h4c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "briefcase": ["M19 5h-4V2c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1v3H1c-.55 0-1 .45-1 1v5h4v-1h2v1h8v-1h2v1h4V6c0-.55-.45-1-1-1zm-6 0H7V3h6v2zm3 8h-2v-1H6v1H4v-1H0v6c0 .55.45 1 1 1h18c.55 0 1-.45 1-1v-6h-4v1z"],
    "bring-data": ["M18 18a1 1 0 010 2H2a1 1 0 010-2h16zM9.995 3.005c.55 0 1 .45 1 .999v9.584l1.29-1.288a1.002 1.002 0 011.42 1.419l-3 2.996a1.015 1.015 0 01-1.42 0l-3-2.997a1.002 1.002 0 011.42-1.419l1.29 1.29V4.013c0-.55.45-1.009 1-1.009zM16 0a1 1 0 110 2 1 1 0 010-2zm-3 0a1 1 0 110 2 1 1 0 010-2zm-3 0a1 1 0 110 2 1 1 0 010-2zM7 0a1 1 0 110 2 1 1 0 010-2zM4 0a1 1 0 110 2 1 1 0 010-2z"],
    "build": ["M19.43 16.67L9.31 7.81l1.47-1.56c.41-.44-.15-.8.15-1.6 1.08-2.76 4.19-2.99 4.19-2.99s.45-.47.87-.92C11.98-1 9.26.7 8.04 1.8L3.83 6.25l-.86.92c-.48.51-.48 1.33 0 1.84l-.87.92c-.48-.51-1.26-.51-1.74 0s-.48 1.33 0 1.84l1.74 1.84c.48.51 1.26.51 1.74 0s.48-1.33 0-1.84l.87-.92c.48.51 1.26.51 1.74 0l1.41-1.49 8.81 10.07c.76.76 2 .76 2.76 0 .76-.76.76-2 0-2.76z"],
    "calculator": ["M16 0H4c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM7 18H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V8h2v2zm4 8H9v-2h2v2zm0-4H9v-2h2v2zm0-4H9V8h2v2zm4 8h-2v-6h2v6zm0-8h-2V8h2v2zm0-4H5V2h10v4z"],
    "calendar": ["M15 5c.6 0 1-.4 1-1V2c0-.5-.4-1-1-1s-1 .5-1 1v2c0 .6.4 1 1 1zM5 5c.6 0 1-.4 1-1V2c0-.5-.4-1-1-1s-1 .5-1 1v2c0 .6.4 1 1 1zm13-2h-1v1c0 1.1-.9 2-2 2s-2-.9-2-2V3H7v1c0 1.1-.9 2-2 2s-2-.9-2-2V3H2c-.5 0-1 .5-1 1v14c0 .5.5 1 1 1h16c.5 0 1-.5 1-1V4c0-.5-.5-1-1-1zM7 17H3v-4h4v4zm0-5H3V8h4v4zm5 5H8v-4h4v4zm0-5H8V8h4v4zm5 5h-4v-4h4v4zm0-5h-4V8h4v4z"],
    "camera": ["M10 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm9-4h-3.59L13.7 2.29A.956.956 0 0013 2H7c-.28 0-.53.11-.71.29L4.59 4H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h4.11c1.26 1.24 2.99 2 4.89 2s3.63-.76 4.89-2H19c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM4 8H2V6h2v2zm6 8c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"],
    "caret-down": ["M16 7c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1 0 .24.1.46.24.63l-.01.01 5 6 .01-.01c.19.22.45.37.76.37s.57-.15.76-.37l.01.01 5-6-.01-.01c.14-.17.24-.39.24-.63z"],
    "caret-left": ["M13 4c-.24 0-.46.1-.63.24l-.01-.01-6 5 .01.01c-.22.19-.37.45-.37.76s.15.57.37.76l-.01.01 6 5 .01-.01c.17.14.39.24.63.24.55 0 1-.45 1-1V5c0-.55-.45-1-1-1z"],
    "caret-right": ["M14 10c0-.31-.15-.57-.37-.76l.01-.01-6-5-.01.01C7.46 4.1 7.24 4 7 4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1 .24 0 .46-.1.63-.24l.01.01 6-5-.01-.01c.22-.19.37-.45.37-.76z"],
    "caret-up": ["M15.76 12.37l.01-.01-5-6-.01.01C10.57 6.15 10.31 6 10 6s-.57.15-.76.37l-.01-.01-5 6 .01.01c-.14.17-.24.39-.24.63 0 .55.45 1 1 1h10c.55 0 1-.45 1-1 0-.24-.1-.46-.24-.63z"],
    "cell-tower": ["M11.5 8.32c.31-.35.51-.81.51-1.32 0-1.1-.9-2-2-2s-2 .9-2 2c0 .51.2.97.51 1.32L5.06 18.69c-.17.52.11 1.09.63 1.26s1.09-.11 1.26-.63L8.39 15h3.23l1.44 4.32c.17.52.74.81 1.26.63s.81-.74.63-1.26L11.5 8.32zM10.95 13H9.06l.95-2.84.94 2.84zM5.31 10.73a.996.996 0 101.37-1.45c-1.4-1.33-1.28-3.35-.01-4.54.4-.38.43-1.01.05-1.41-.36-.41-1-.43-1.4-.06-2.09 1.95-2.28 5.3-.01 7.46z",
        "M4.6 12.2C3 11.1 2 9 2 7c0-2.1.9-3.9 2.6-5.2.5-.3.5-1 .2-1.4-.3-.5-1-.5-1.4-.2C1.2 1.9-.1 4.2 0 7c.1 2.7 1.4 5.3 3.4 6.8.2.1.4.2.6.2.3 0 .6-.1.8-.4.4-.5.3-1.1-.2-1.4zM13.27 10.69c.38.4 1.01.42 1.41.04 2.27-2.16 2.08-5.51-.01-7.46a.996.996 0 10-1.36 1.46c1.28 1.19 1.39 3.21-.01 4.54-.39.39-.41 1.02-.03 1.42z",
        "M16.6.2c-.4-.3-1.1-.3-1.4.2-.3.4-.3 1.1.2 1.4C17.1 3.1 18 4.9 18 7c0 2-1 4.1-2.6 5.2-.5.3-.6.9-.2 1.4.2.3.5.4.8.4.2 0 .4-.1.6-.2C18.7 12.3 20 9.7 20 7c.09-2.8-1.2-5.1-3.4-6.8z"],
    "changes": ["M18 16H2c-1.1 0-2 .9-2 2s.9 2 2 2h16c1.1 0 2-.9 2-2s-.9-2-2-2zM3 5c.28 0 .53-.11.71-.29L5 3.41V13c0 .55.45 1 1 1s1-.45 1-1V3.41L8.29 4.7c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-3-3C6.53.11 6.28 0 6 0s-.53.11-.71.29l-3 3A1.003 1.003 0 003 5zm7.29 5.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3a1.003 1.003 0 00-1.42-1.42L15 10.59V1c0-.55-.45-1-1-1s-1 .45-1 1v9.59L11.71 9.3A.965.965 0 0011 9a1.003 1.003 0 00-.71 1.71z"],
    "chart": ["M7 11v8c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-8l-2 2-4-2zm-7 8c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-8l-6 3v5zM17 7l-3 3v9c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V8.74c-.26.15-.58.26-1 .26-1.92 0-2-2-2-2zm2-6h-4c-.55 0-1 .45-1 1s.45 1 1 1h1.59L10.8 8.78 7.45 7.11v.01C7.31 7.05 7.16 7 7 7s-.31.05-.44.11V7.1l-6 3v.01c-.33.17-.56.5-.56.89 0 .55.45 1 1 1 .16 0 .31-.05.44-.11v.01L7 9.12l3.55 1.78v-.01c.14.06.29.11.45.11.28 0 .53-.11.71-.29L18 4.41V6c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1z"],
    "chat": ["M19 0H7c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h5.59l3.71 3.71c.17.18.42.29.7.29.55 0 1-.45 1-1v-3h1c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM7 13c-1.1 0-2-.9-2-2V4H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h1v3a1.003 1.003 0 001.71.71L7.41 16H13c.55 0 1-.45 1-1v-.17L12.17 13H7z"],
    "chevron-backward": ["M8.41 10l5.29-5.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L7 8.59V4c0-.55-.45-1-1-1s-1 .45-1 1v12c0 .55.45 1 1 1s1-.45 1-1v-4.59l5.29 5.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L8.41 10z"],
    "chevron-down": ["M16 6c-.28 0-.53.11-.71.29L10 11.59l-5.29-5.3a1.003 1.003 0 00-1.42 1.42l6 6c.18.18.43.29.71.29s.53-.11.71-.29l6-6A1.003 1.003 0 0016 6z"],
    "chevron-forward": ["M13 3c-.55 0-1 .45-1 1v4.59l-5.29-5.3a1.003 1.003 0 00-1.42 1.42l5.3 5.29-5.29 5.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l5.29-5.3V16c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "chevron-left": ["M8.41 10l5.29-5.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-6 6c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l6 6a1.003 1.003 0 001.42-1.42L8.41 10z"],
    "chevron-right": ["M13.71 9.29l-6-6a1.003 1.003 0 00-1.42 1.42l5.3 5.29-5.29 5.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l6-6c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"],
    "chevron-up": ["M16.71 12.29l-6-6C10.53 6.11 10.28 6 10 6s-.53.11-.71.29l-6 6a1.003 1.003 0 001.42 1.42L10 8.41l5.29 5.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71z"],
    "circle": ["M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"],
    "circle-arrow-down": ["M14 10c-.28 0-.53.11-.71.29L11 12.59V5c0-.55-.45-1-1-1s-1 .45-1 1v7.59L6.71 10.3A.965.965 0 006 10a1.003 1.003 0 00-.71 1.71l4 4c.18.18.43.29.71.29s.53-.11.71-.29l4-4A1.003 1.003 0 0014 10zM10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"],
    "circle-arrow-left": ["M15 9H7.41L9.7 6.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-4 4c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l4 4a1.003 1.003 0 001.42-1.42L7.41 11H15c.55 0 1-.45 1-1s-.45-1-1-1zm-5-9C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"],
    "circle-arrow-right": ["M15.71 9.29l-4-4a1.003 1.003 0 00-1.42 1.42L12.59 9H5c-.55 0-1 .45-1 1s.45 1 1 1h7.59l-2.29 2.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l4-4c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71zM10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"],
    "circle-arrow-up": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.71-13.71C10.53 4.11 10.28 4 10 4s-.53.11-.71.29l-4 4a1.003 1.003 0 001.42 1.42L9 7.41V15c0 .55.45 1 1 1s1-.45 1-1V7.41l2.29 2.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-4-4z"],
    "citation": ["M4 1C1.79 1 0 2.79 0 5s1.79 4 4 4c.1 0 .2-.01.3-.02C3.82 11.32 2.53 13 1 13c-.55 0-1 .45-1 1s.45 1 1 1c3.87 0 7-4.48 7-10 0-2.21-1.79-4-4-4zM16 1c-2.21 0-4 1.79-4 4s1.79 4 4 4c.1 0 .2-.01.3-.02C15.82 11.32 14.53 13 13 13c-.55 0-1 .45-1 1s.45 1 1 1c3.87 0 7-4.48 7-10 0-2.21-1.79-4-4-4z"],
    "clean": ["M7 0L5 5 0 6.998 5 9l2 5 2-5 5-1.995L9 5zM15 10l-1.5 3.496-3.5 1.499 3.5 1.498L15 20l1.5-3.507L20 15l-3.5-1.504z"],
    "clipboard": ["M13 2c0-.55-.45-1-1-1h-.78a1.98 1.98 0 00-3.44 0H7c-.55 0-1 .45-1 1v2h7V2z",
        "M16 2h-2v3H5V2H3c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h13c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1z"],
    "cloud": ["M15 7c-.12 0-.24.03-.36.04C13.83 4.69 11.62 3 9 3 5.69 3 3 5.69 3 9c0 .05.01.09.01.14A3.98 3.98 0 000 13c0 2.21 1.79 4 4 4h11c2.76 0 5-2.24 5-5s-2.24-5-5-5z"],
    "cloud-download": ["M15 4c-.12 0-.24.03-.36.04C13.83 1.69 11.62 0 9 0 5.69 0 3 2.69 3 6c0 .05.01.09.01.14A3.98 3.98 0 000 10c0 2.21 1.79 4 4 4h.78c.55-.61 1.34-1 2.22-1v-2c0-1.66 1.34-3 3-3s3 1.34 3 3v2c.88 0 1.66.38 2.2.98C17.87 13.87 20 11.69 20 9c0-2.76-2.24-5-5-5zm-2 11c-.28 0-.53.11-.71.29L11 16.59V11c0-.55-.45-1-1-1s-1 .45-1 1v5.59L7.71 15.3A.965.965 0 007 15a1.003 1.003 0 00-.71 1.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3A1.003 1.003 0 0013 15z"],
    "cloud-upload": ["M10.71 10.29c-.18-.18-.43-.29-.71-.29s-.53.11-.71.29l-3 3a1.003 1.003 0 001.42 1.42L9 13.41V19c0 .55.45 1 1 1s1-.45 1-1v-5.59l1.29 1.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-3-3zM15 4c-.12 0-.24.03-.36.04C13.83 1.69 11.62 0 9 0 5.69 0 3 2.69 3 6c0 .05.01.09.01.14A3.98 3.98 0 000 10c0 2.21 1.79 4 4 4 0-.83.34-1.58.88-2.12l3-3a2.993 2.993 0 014.24 0l3 3-.01.01c.52.52.85 1.23.87 2.02C18.28 13.44 20 11.42 20 9c0-2.76-2.24-5-5-5z"],
    "code": ["M6 6a1.003 1.003 0 00-1.71-.71l-4 4C.11 9.47 0 9.72 0 10c0 .28.11.53.29.71l4 4a1.003 1.003 0 001.42-1.42L2.41 10 5.7 6.71c.19-.18.3-.43.3-.71zm6-4c-.46 0-.83.31-.95.73l-4 14c-.02.09-.05.17-.05.27 0 .55.45 1 1 1 .46 0 .83-.31.95-.73l4-14c.02-.09.05-.17.05-.27 0-.55-.45-1-1-1zm7.71 7.29l-4-4a1.003 1.003 0 00-1.42 1.42l3.3 3.29-3.29 3.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l4-4c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"],
    "code-block": ["M19 5h-2V3c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1v2H9V3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v2H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zM8.71 15.29a1.003 1.003 0 01-1.42 1.42l-4-4C3.11 12.53 3 12.28 3 12s.11-.53.29-.71l4-4a1.003 1.003 0 011.42 1.42L5.41 12l3.3 3.29zm8-2.58l-4 4a1.003 1.003 0 01-1.42-1.42l3.3-3.29-3.29-3.29A.965.965 0 0111 8a1.003 1.003 0 011.71-.71l4 4c.18.18.29.43.29.71s-.11.53-.29.71z"],
    "cog": ["M19 8h-2.31c-.14-.46-.33-.89-.56-1.3l1.7-1.7a.996.996 0 000-1.41l-1.41-1.41a.996.996 0 00-1.41 0l-1.7 1.7c-.41-.22-.84-.41-1.3-.55V1c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v2.33c-.48.14-.94.34-1.37.58L5 2.28a.972.972 0 00-1.36 0L2.28 3.64c-.37.38-.37.99 0 1.36L3.9 6.62c-.24.44-.44.89-.59 1.38H1c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2.31c.14.46.33.89.56 1.3L2.17 15a.996.996 0 000 1.41l1.41 1.41c.39.39 1.02.39 1.41 0l1.7-1.7c.41.22.84.41 1.3.55V19c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.33c.48-.14.94-.35 1.37-.59L15 17.72c.37.37.98.37 1.36 0l1.36-1.36c.37-.37.37-.98 0-1.36l-1.62-1.62c.24-.43.45-.89.6-1.38H19c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-9 6c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"],
    "collapse-all": ["M9.29 8.71c.18.18.43.29.71.29s.53-.11.71-.29l6-6a1.003 1.003 0 00-1.42-1.42L10 6.59l-5.29-5.3a1.003 1.003 0 00-1.42 1.42l6 6zm1.42 2.58c-.18-.18-.43-.29-.71-.29s-.53.11-.71.29l-6 6a1.003 1.003 0 001.42 1.42l5.29-5.3 5.29 5.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-6-6z"],
    "column-layout": ["M19 1H1c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zM5 17H2V3h3v14zm4 0H6V3h3v14zm9 0h-8V3h8v14z"],
    "comment": ["M19 1H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3v4a1.003 1.003 0 001.71.71l4.7-4.71H19c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zM4 10c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"],
    "comparison": ["M6 8H1c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm13-6h-5c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm0 3h-5V3h5v2zM6 14H1c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1zM6 2H1c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm4-2c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zm9 14h-5c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1zm0 3h-5v-2h5v2zm0-9h-5c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm0 3h-5V9h5v2z"],
    "compass": ["M15 10c0 .14-.03.28-.09.4l-3.99 8.98-.01.02a.991.991 0 01-1.82 0l-.01-.02-3.99-8.98c-.06-.12-.09-.26-.09-.4s.03-.28.09-.4L9.08.62 9.09.6a.991.991 0 011.82 0l.01.02 3.99 8.98c.06.12.09.26.09.4zm-5-6.54L7.09 10h5.81L10 3.46z"],
    "compressed": ["M19.89 6.56l-2.99-6h-.01C16.72.23 16.39 0 16 0H4c-.39 0-.72.23-.89.56H3.1l-3 6h.01C.05 6.69 0 6.84 0 7v12c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V7c0-.16-.05-.31-.11-.44zM11 2h4.38l2 4H11V2zM4.62 2H9v4H2.62l2-4zM18 18H2V8h7v4.59L6.71 10.3A.965.965 0 006 10a1.003 1.003 0 00-.71 1.71l4 4c.18.18.43.29.71.29s.53-.11.71-.29l4-4a1.003 1.003 0 00-1.42-1.42L11 12.59V8h7v10z"],
    "confirm": ["M9.71 5.29a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l7-7a1.003 1.003 0 00-1.42-1.42L12 7.59l-2.29-2.3zm7.93 2.32c.23.75.36 1.56.36 2.39 0 4.42-3.58 8-8 8s-8-3.58-8-8a7.998 7.998 0 0111.8-7.04l1.46-1.46C13.73.56 11.93 0 10 0 4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10c0-1.4-.29-2.73-.81-3.95l-1.55 1.56z"],
    "console": ["M19 19H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h18c.55 0 1 .45 1 1v16c0 .55-.45 1-1 1zM18 6H2v11h16V6zM4 8c.28 0 .53.11.71.29l2 2c.18.18.29.43.29.71s-.11.53-.29.71l-2 2a1.003 1.003 0 01-1.42-1.42L4.59 11l-1.3-1.29A1.003 1.003 0 014 8zm5 4h3c.55 0 1 .45 1 1s-.45 1-1 1H9c-.55 0-1-.45-1-1s.45-1 1-1z"],
    "contrast": ["M19 8h-1.26c-.19-.73-.48-1.42-.85-2.06l.94-.94a.996.996 0 000-1.41l-1.41-1.41a.996.996 0 00-1.41 0l-.94.94c-.65-.38-1.34-.67-2.07-.86V1c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1.26c-.76.2-1.47.5-2.13.89L5 2.28a.972.972 0 00-1.36 0L2.28 3.64c-.37.38-.37.98 0 1.36l.87.87c-.39.66-.69 1.37-.89 2.13H1c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h1.26c.19.73.48 1.42.85 2.06l-.94.94a.996.996 0 000 1.41l1.41 1.41c.39.39 1.02.39 1.41 0l.94-.94c.64.38 1.33.66 2.06.85V19c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-1.26c.76-.2 1.47-.5 2.13-.89l.88.87c.37.37.98.37 1.36 0l1.36-1.36c.37-.38.37-.98 0-1.36l-.87-.87c.4-.65.7-1.37.89-2.13H19c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm-9 7c-2.76 0-5-2.24-5-5s2.24-5 5-5v10z"],
    "control": ["M17 10h-7v7h7v-7zm0-7h-7v6h7V3zM9 3H3v14h6V3zm10-3H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 18H2V2h16v16z"],
    "credit-card": ["M19 3H1c-.55 0-1 .45-1 1v2h20V4c0-.55-.45-1-1-1zM0 16c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V8H0v8zm6.5-2h7c.28 0 .5.22.5.5s-.22.5-.5.5h-7c-.28 0-.5-.22-.5-.5s.22-.5.5-.5zm-4 0h2c.28 0 .5.22.5.5s-.22.5-.5.5h-2c-.28 0-.5-.22-.5-.5s.22-.5.5-.5z"],
    "cross": ["M11.41 10l4.29-4.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L10 8.59l-4.29-4.3a1.003 1.003 0 00-1.42 1.42L8.59 10 4.3 14.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l4.29-4.3 4.29 4.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L11.41 10z"],
    "crown": ["M2 8l4 2 4-5 4 5 4-2-1 7H3L2 8zm8-6a1 1 0 110 2 1 1 0 010-2zM1 5a1 1 0 110 2 1 1 0 010-2zm18 0a1 1 0 110 2 1 1 0 010-2zM3 16h14v2H3v-2z"],
    "cube": ["M1.953 4.481l7.41-4.02c.394-.215.88-.215 1.275 0l7.409 4.02L10 9.22 1.953 4.48zm-.817.68L9.5 10.085v9.281a1.316 1.316 0 01-.138-.064l-7.714-4.186A1.211 1.211 0 011 14.057v-8.35c0-.193.048-.38.136-.547zm17.728 0c.088.166.136.353.136.546v8.35c0 .438-.247.842-.648 1.06l-7.714 4.186c-.045.024-.091.046-.138.064v-9.281l8.364-4.926z"],
    "cube-add": ["M17 3h2a1 1 0 010 2h-2v2a1 1 0 01-2 0V5h-2a1 1 0 010-2h2V1a1 1 0 012 0v2zm-3.969 4.435L10 9.22 1.953 4.48l7.41-4.02c.394-.215.88-.215 1.275 0l1.33.721A3.001 3.001 0 0013 7c0 .148.01.293.031.435zm.319.972A3 3 0 0019 7v7.057c0 .438-.247.842-.648 1.06l-7.714 4.186c-.045.024-.091.046-.138.064v-9.281l2.85-1.679zM1.136 5.16L9.5 10.086v9.281a1.316 1.316 0 01-.138-.064l-7.714-4.186A1.211 1.211 0 011 14.057v-8.35c0-.193.048-.38.136-.547z"],
    "cube-remove": ["M11.968 1.182A3.001 3.001 0 0013 7h.77L10 9.22 1.953 4.48l7.41-4.02c.394-.215.88-.215 1.275 0l1.33.721zM19 7v7.057c0 .438-.247.842-.648 1.06l-7.714 4.186c-.045.024-.091.046-.138.064v-9.281L15.74 7H19zM1.136 5.16L9.5 10.086v9.281a1.316 1.316 0 01-.138-.064l-7.714-4.186A1.211 1.211 0 011 14.057v-8.35c0-.193.048-.38.136-.547zM13 3h6a1 1 0 010 2h-6a1 1 0 010-2z"],
    "curved-range-chart": ["M19 16H3.02l2.14-1.74c2.25 1.7 7.33.46 11.83-2.99l-1.29-1.5c-3.56 2.74-7.31 4.03-8.93 3.19l10.55-8.57-.63-.78-10.59 8.6c-.64-1.64 1.46-4.91 5.09-7.7L9.9 3.01c-4.6 3.54-6.91 8.12-5.41 10.51L2 15.54V3c0-.55-.45-1-1-1s-1 .45-1 1v14a.998.998 0 001 1h18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "cut": ["M16 2s.72-1.28 0-2l-5.29 6.25 1.28 1.54L16 2zm.08 10c-.55 0-1.07.12-1.54.32L4.31 0c-.7.72 0 2 0 2l4.45 6.56-3.19 3.77C5.09 12.12 4.56 12 4 12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.65-.17-1.26-.45-1.8l2.54-3.67 2.49 3.67c-.27.54-.44 1.15-.44 1.8 0 2.21 1.76 4 3.92 4 2.17 0 3.92-1.79 3.92-4 .02-2.21-1.74-4-3.9-4zM4 18c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm12.08 0c-1.08 0-1.96-.9-1.96-2s.88-2 1.96-2 1.96.9 1.96 2-.88 2-1.96 2z"],
    "dashboard": ["M6 5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zM4 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6-4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-5C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm6-9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-8 5c0 1.1.9 2 2 2s2-.9 2-2c0-.33-2-8-2-8s-2 7.67-2 8zm6-9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"],
    "data-lineage": ["M1.053 0C.47 0 0 .471 0 1.053V4.21c0 .58.471 1.052 1.053 1.052h3.275a6.332 6.332 0 003.728 4.738 6.33 6.33 0 00-3.728 4.737l-3.275-.001C.47 14.737 0 15.208 0 15.789v3.158C0 19.53.471 20 1.053 20h7.435c.581 0 1.053-.471 1.053-1.053V15.79c0-.58-.472-1.052-1.053-1.052H5.406a5.293 5.293 0 015.195-4.21v2.105c0 .58.471 1.052 1.052 1.052h7.294c.582 0 1.053-.471 1.053-1.052V7.368c0-.58-.471-1.052-1.053-1.052h-7.294c-.581 0-1.052.471-1.052 1.052v2.106a5.293 5.293 0 01-5.194-4.21h3.081c.581 0 1.053-.472 1.053-1.053V1.053C9.54.47 9.069 0 8.488 0H1.053z"],
    "database": ["M2.01 5.1v5.4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5V5.1c-1.49 1.13-4.51 1.9-8 1.9-3.48 0-6.5-.77-8-1.9zm8 .9c4.42 0 8-1.12 8-2.5s-3.58-2.5-8-2.5-8 1.12-8 2.5S5.6 6 10.01 6zm-8 6.1v5.4c0 1.38 3.58 2.5 8 2.5s8-1.12 8-2.5v-5.4c-1.49 1.13-4.51 1.9-8 1.9-3.48 0-6.5-.77-8-1.9z"],
    "delete": ["M15 6a1.003 1.003 0 00-1.71-.71L10 8.59l-3.29-3.3a1.003 1.003 0 00-1.42 1.42L8.59 10 5.3 13.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3.29-3.3 3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L11.41 10l3.29-3.29c.19-.18.3-.43.3-.71zm-5-6C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"],
    "delta": ["M10 0L0 20h20L10 0zM9 6l6 12H3L9 6z"],
    "derive-column": ["M7.1 8.2h-.99c.28-1.11.66-1.92 1.12-2.43.28-.32.56-.48.83-.48.05 0 .1.02.13.05.03.03.05.07.05.12 0 .04-.04.13-.11.25a.64.64 0 00-.12.35c0 .15.06.28.18.39.12.11.27.16.45.16.2 0 .36-.07.49-.2s.2-.31.2-.54c0-.26-.1-.47-.3-.63-.19-.16-.51-.24-.95-.24-.68 0-1.3.19-1.85.58-.56.38-1.09 1.02-1.59 1.91-.17.3-.34.5-.49.59-.15.08-.4.13-.74.12l-.23.77h.95l-1.39 5.24c-.23.86-.39 1.39-.47 1.59-.12.29-.3.54-.54.75-.1.08-.21.12-.35.12-.04 0-.07-.01-.1-.03l-.03-.04c0-.02.03-.07.1-.13.07-.07.1-.17.1-.31 0-.15-.05-.28-.16-.38-.11-.1-.27-.15-.47-.15-.25 0-.44.07-.59.2-.15.12-.23.28-.23.46 0 .19.09.36.27.5.19.14.47.21.86.21.61 0 1.16-.15 1.63-.46.48-.31.89-.78 1.25-1.43.35-.64.72-1.68 1.09-3.11l.8-3.03h.96l.24-.77zM19 0h-9c-.55 0-1 .45-1 1v3h2V2h7v16h-7v-2H9v3c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-8.79 13.49c.15.28.32.49.52.61.19.12.44.19.73.19.28 0 .57-.1.86-.3.38-.25.77-.69 1.17-1.31l-.25-.14c-.27.37-.48.6-.61.69-.09.06-.19.09-.31.09-.14 0-.28-.09-.42-.26-.23-.29-.54-1.09-.93-2.4.35-.59.64-.97.87-1.15.17-.13.35-.2.55-.2.07 0 .2.03.39.08s.36.08.5.08c.2 0 .37-.07.5-.2.15-.14.22-.31.22-.52 0-.22-.07-.4-.2-.53s-.33-.2-.58-.2c-.22 0-.43.05-.63.15-.2.1-.45.32-.75.67-.23.25-.56.7-1.01 1.33a6.52 6.52 0 00-.91-2.15l-2.39.39-.05.25c.18-.03.33-.05.45-.05.24 0 .43.1.59.3.25.31.59 1.24 1.02 2.8-.34.44-.58.73-.7.87-.21.22-.38.36-.52.43-.1.05-.22.08-.35.08-.1 0-.26-.05-.49-.16a1.01 1.01 0 00-.42-.11c-.23 0-.42.07-.57.22-.15.14-.23.33-.23.55 0 .21.07.38.21.51.14.13.33.2.56.2.23 0 .44-.05.64-.14.2-.09.45-.29.75-.59s.72-.78 1.25-1.43c.21.61.39 1.06.54 1.35z"],
    "desktop": ["M19 0H1C.45 0 0 .45 0 1v13c0 .55.45 1 1 1h5.67l-.5 3H5c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1h-1.17l-.5-3H19c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 13H2V2h16v11z"],
    "diagram-tree": ["M19 10v5h-2v-4h-6v4H9v-4H3v4H1v-5a1 1 0 011-1h7V5h2v4h7a1 1 0 011 1zM1 16h2a1 1 0 011 1v2a1 1 0 01-1 1H1a1 1 0 01-1-1v-2a1 1 0 011-1zm16 0h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 011-1zm-8 0h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1v-2a1 1 0 011-1zM9 0h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V1a1 1 0 011-1z"],
    "direction-left": ["M20 3.02l-20 7 20 7-5-7z"],
    "direction-right": ["M20 10.02l-20-7 5 7-5 7z"],
    "disable": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zM2 10c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L3.69 14.9A7.902 7.902 0 012 10zm8 8c-1.85 0-3.55-.63-4.9-1.69L16.31 5.1A7.902 7.902 0 0118 10c0 4.42-3.58 8-8 8z"],
    "document": ["M11.98 0h-8c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h13c.55 0 1-.45 1-1V6l-6-6zm4 18h-11V2h6v5h5v11z"],
    "document-open": ["M8 15c0 .55.45 1 1 1s1-.45 1-1v-5c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1h2.59L1.3 16.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L8 12.41V15zm5-15H5c-.55 0-1 .45-1 1v6h2V2h6v5h5v11H6v-.76L4.04 19.2c.1.45.48.8.96.8h13c.55 0 1-.45 1-1V6l-6-6z"],
    "document-share": ["M14.09 10.09c-.31.31-.67.57-1.09.72V18H2V2h6v5h1.18c.15-.42.39-.8.7-1.11v-.01l2.45-2.45c-.42-.29-.78-.65-1.01-1.11L9 0H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h13c.55 0 1-.45 1-1V9.24l-.88.88-.03-.03zM19 0h-5c-.55 0-1 .45-1 1s.45 1 1 1h2.59L11.3 7.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L18 3.41V6c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "dollar": ["M15.57 11.19c-.27-.51-.63-.93-1.07-1.26-.44-.33-.95-.6-1.51-.79-.56-.2-1.14-.36-1.72-.5-.6-.14-1.19-.26-1.75-.38-.57-.13-1.07-.27-1.51-.44-.44-.17-.8-.38-1.07-.63s-.41-.59-.41-1c0-.33.09-.6.28-.81.19-.21.42-.36.69-.47.27-.11.57-.18.88-.22.31-.04.58-.06.8-.06.71 0 1.35.14 1.9.41.55.27.91.81 1.06 1.62h3.36c-.09-.84-.32-1.56-.69-2.16-.37-.6-.83-1.08-1.38-1.45-.56-.37-1.18-.64-1.86-.81-.19-.05-.38-.07-.57-.1V1c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v1.1c-.22.03-.43.05-.66.1-.73.13-1.39.37-1.98.71-.6.34-1.09.8-1.47 1.35-.39.56-.58 1.25-.58 2.08 0 .76.13 1.41.4 1.93.26.52.62.95 1.06 1.28.44.33.94.6 1.5.79.55.2 1.13.36 1.74.5.58.14 1.16.26 1.72.38s1.07.26 1.51.43c.44.17.8.39 1.09.66.28.27.43.63.45 1.06.02.43-.08.78-.3 1.04-.22.26-.49.47-.83.6-.34.14-.7.23-1.09.28-.39.05-.73.07-1.03.07-.87 0-1.61-.2-2.23-.59-.62-.39-.98-1.08-1.07-2.06H3c.02.9.19 1.68.52 2.34.33.66.78 1.21 1.35 1.65.57.44 1.25.77 2.03.98.35.1.71.16 1.08.21V19c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.13c.25-.04.5-.07.76-.13.77-.18 1.47-.46 2.1-.85.63-.39 1.14-.9 1.54-1.53.4-.63.59-1.39.59-2.29.01-.75-.13-1.37-.4-1.88z"],
    "dot": ["M10 6a4 4 0 100 8 4 4 0 100-8z"],
    "double-caret-horizontal": ["M8 4c-.24 0-.46.1-.63.24l-.01-.01-6 5 .01.01c-.22.19-.37.45-.37.76s.15.57.37.76l-.01.01 6 5 .01-.01c.17.14.39.24.63.24.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm11 6c0-.31-.15-.57-.37-.76l.01-.01-6-5-.01.01C12.46 4.1 12.24 4 12 4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1 .24 0 .46-.1.63-.24l.01.01 6-5-.01-.01c.22-.19.37-.45.37-.76z"],
    "double-caret-vertical": ["M5 9h10c.55 0 1-.45 1-1 0-.24-.1-.46-.24-.63l.01-.01-5-6-.01.01C10.57 1.15 10.31 1 10 1s-.57.15-.76.37l-.01-.01-5 6 .01.01C4.1 7.54 4 7.76 4 8c0 .55.45 1 1 1zm10 2H5c-.55 0-1 .45-1 1 0 .24.1.46.24.63l-.01.01 5 6 .01-.01c.19.22.45.37.76.37s.57-.15.76-.37l.01.01 5-6-.01-.01c.14-.17.24-.39.24-.63 0-.55-.45-1-1-1z"],
    "double-chevron-down": ["M9.29 10.71c.18.18.43.29.71.29s.53-.11.71-.29l6-6a1.003 1.003 0 00-1.42-1.42L10 8.59l-5.29-5.3a1.003 1.003 0 00-1.42 1.42l6 6zM16 9c-.28 0-.53.11-.71.29L10 14.59l-5.29-5.3a1.003 1.003 0 00-1.42 1.42l6 6c.18.18.43.29.71.29s.53-.11.71-.29l6-6A1.003 1.003 0 0016 9z"],
    "double-chevron-left": ["M5.41 10l5.29-5.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-6 6c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l6 6a1.003 1.003 0 001.42-1.42L5.41 10zm6 0l5.29-5.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-6 6c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l6 6a1.003 1.003 0 001.42-1.42L11.41 10z"],
    "double-chevron-right": ["M11 10c0-.28-.11-.53-.29-.71l-6-6a1.003 1.003 0 00-1.42 1.42L8.59 10 3.3 15.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l6-6c.18-.18.29-.43.29-.71zm5.71-.71l-6-6a1.003 1.003 0 00-1.42 1.42l5.3 5.29-5.29 5.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l6-6c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"],
    "double-chevron-up": ["M4 11c.28 0 .53-.11.71-.29L10 5.41l5.29 5.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-6-6A.997.997 0 0010 3c-.28 0-.53.11-.71.29l-6 6A1.003 1.003 0 004 11zm6.71-1.71A.997.997 0 0010 9c-.28 0-.53.11-.71.29l-6 6a1.003 1.003 0 001.42 1.42l5.29-5.3 5.29 5.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-6-6z"],
    "doughnut-chart": ["M16 10c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6V0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10h-4zm-.09-1h4.04C19.48 4.28 15.72.52 11 .05V4.1A5.98 5.98 0 0115.91 9z"],
    "download": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm4.71 11.71l-4 4c-.18.18-.43.29-.71.29s-.53-.11-.71-.29l-4-4a1.003 1.003 0 011.42-1.42L9 12.59V5c0-.55.45-1 1-1s1 .45 1 1v7.59l2.29-2.29c.18-.19.43-.3.71-.3a1.003 1.003 0 01.71 1.71z"],
    "drag-handle-horizontal": ["M7.5 11c-.83 0-1.5.67-1.5 1.5S6.67 14 7.5 14 9 13.33 9 12.5 8.33 11 7.5 11zm-5-5C1.67 6 1 6.67 1 7.5S1.67 9 2.5 9 4 8.33 4 7.5 3.33 6 2.5 6zm0 5c-.83 0-1.5.67-1.5 1.5S1.67 14 2.5 14 4 13.33 4 12.5 3.33 11 2.5 11zm15-2c.83 0 1.5-.67 1.5-1.5S18.33 6 17.5 6 16 6.67 16 7.5 16.67 9 17.5 9zm-5 2c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm5 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm-10-5C6.67 6 6 6.67 6 7.5S6.67 9 7.5 9 9 8.33 9 7.5 8.33 6 7.5 6zm5 0c-.83 0-1.5.67-1.5 1.5S11.67 9 12.5 9 14 8.33 14 7.5 13.33 6 12.5 6z"],
    "drag-handle-vertical": ["M7.5 6C6.67 6 6 6.67 6 7.5S6.67 9 7.5 9 9 8.33 9 7.5 8.33 6 7.5 6zm0 5c-.83 0-1.5.67-1.5 1.5S6.67 14 7.5 14 9 13.33 9 12.5 8.33 11 7.5 11zm0 5c-.83 0-1.5.67-1.5 1.5S6.67 19 7.5 19 9 18.33 9 17.5 8.33 16 7.5 16zm5-12c.83 0 1.5-.67 1.5-1.5S13.33 1 12.5 1 11 1.67 11 2.5 11.67 4 12.5 4zm-5-3C6.67 1 6 1.67 6 2.5S6.67 4 7.5 4 9 3.33 9 2.5 8.33 1 7.5 1zm5 10c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0 5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-10c-.83 0-1.5.67-1.5 1.5S11.67 9 12.5 9 14 8.33 14 7.5 13.33 6 12.5 6z"],
    "draw": ["M17.7 12.7c0-.1 0-.2-.1-.3l-2-7c-.1-.3-.3-.6-.6-.7L1.8 0l-.6.5L7.7 7c.3-.2.6-.3 1-.3 1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2c0-.4.1-.7.3-1L.5 1.2l-.5.6L4.7 15c.1.3.4.5.7.6l7 2c.1 0 .2.1.3.1.3 0 .5-.1.7-.3l4-4c.2-.2.3-.5.3-.7zm1 1c-.3 0-.5.1-.7.3l-4 4c-.2.2-.3.4-.3.7 0 .5.4 1 1 1 .3 0 .5-.1.7-.3l4-4c.2-.2.3-.4.3-.7 0-.6-.5-1-1-1z"],
    "drive-time": ["M20.01 7.7c0-.63-.5-1.14-1.1-1.14h-1.32l-.95-2.57c-.24-.64-.95-1.31-1.59-1.5 0 0-1.65-.49-5.05-.49s-5.04.49-5.04.49c-.63.19-1.35.86-1.59 1.5l-.95 2.57H1.1C.5 6.56 0 7.07 0 7.7c0 .63.5 1.14 1.1 1.14h.47l-.34.91c-.24.64-.43 1.72-.43 2.4v5.39c0 .8.63 1.45 1.4 1.45.77 0 1.4-.65 1.4-1.45v-.83h12.8v.83c0 .8.63 1.45 1.4 1.45s1.4-.65 1.4-1.45v-5.39c0-.68-.19-1.77-.43-2.4l-.34-.91h.47c.61 0 1.11-.51 1.11-1.14zm-16.47.34l1.12-3.16c.08-.22.32-.39.54-.39h9.6c.22 0 .46.17.54.39l1.12 3.16c.08.21-.04.39-.26.39H3.8c-.22-.01-.34-.18-.26-.39zm.96 4.94c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.68 1.5 1.5c0 .83-.67 1.5-1.5 1.5zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"],
    "duplicate": ["M15 4H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm-1 14H2V6h12v12zm5-18H5c-.55 0-1 .45-1 1v2h2V2h12v12h-1v2h2c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "edit": ["M4.59 12.59l2.83 2.83 7.65-7.65-2.83-2.83-7.65 7.65zM2 18l4.41-1.59-2.81-2.79L2 18zM16 2c-.55 0-1.05.22-1.41.59l-1.65 1.65 2.83 2.83 1.65-1.65A2.006 2.006 0 0016 2z"],
    "eject": ["M4 12h12c.55 0 1-.45 1-1 0-.25-.1-.47-.25-.64l.01-.01-6-7-.01.01C10.57 3.14 10.3 3 10 3s-.57.14-.75.36l-.01-.01-6 7 .01.01c-.15.17-.25.39-.25.64 0 .55.45 1 1 1zm12 1H4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1z"],
    "endorsed": ["M19.83 9.38L18.81 7.6V5.62c0-.45-.23-.85-.61-1.08l-1.71-1-1.02-1.76a1.25 1.25 0 00-1.08-.61h-2.03l-1.74-1c-.38-.23-.87-.23-1.25 0l-1.74 1H5.65c-.44 0-.85.23-1.08.61L3.58 3.5l-1.8 1.04c-.38.24-.62.64-.62 1.08v2.06L.17 9.4c-.11.19-.17.4-.17.61s.06.42.17.61l.99 1.72v2.06c0 .45.23.85.61 1.08l1.78 1.02.99 1.72c.23.38.63.61 1.08.61h1.99l1.74 1c.19.11.41.17.62.17.21 0 .42-.06.61-.17l1.74-1h2.03c.44 0 .85-.23 1.08-.61l1.02-1.76 1.71-1c.38-.23.61-.64.61-1.08v-1.97l1.02-1.78c.27-.38.27-.85.04-1.25zm-5.08-.71l-5.01 5.01c-.18.18-.43.29-.71.29-.28 0-.53-.11-.71-.29l-3.01-3.01a1.003 1.003 0 011.42-1.42l2.3 2.3 4.31-4.3a1.003 1.003 0 011.71.71c0 .28-.12.53-.3.71z"],
    "envelope": ["M0 4.01v11.91l6.27-6.27L0 4.01zm18.91-1.03H1.09L10 10.97l8.91-7.99zm-5.18 6.66L20 15.92V4.01l-6.27 5.63zm-3.23 2.9c-.13.12-.31.19-.5.19s-.37-.07-.5-.19l-2.11-1.89-6.33 6.33h17.88l-6.33-6.33-2.11 1.89z"],
    "equals": ["M4 7h12a1 1 0 010 2H4a1 1 0 110-2zm0 4h12a1 1 0 010 2H4a1 1 0 010-2z"],
    "eraser": ["M18.71 8.43c.39-.4.39-1.05 0-1.45l-5.53-5.72a.967.967 0 00-1.4 0L1.29 12.1c-.39.4-.39 1.05 0 1.45l4.25 4.39 2.13 2.05h9.27c.02 0 .03.01.05.01.55 0 1-.45 1-1s-.45-1-1-1H9.46l.05-.05h.01l.81-.84 8.38-8.68zM7.52 17.94l-4.95-5.12 4.46-4.61 4.95 5.12-4.46 4.61z"],
    "error": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 16H9v-2h2v2zm0-3H9V4h2v9z"],
    "euro": ["M8.89 4.47c.56-.31 1.23-.47 2.03-.47.44 0 .85.07 1.25.22.4.14.76.35 1.07.6.17.14.33.3.47.47l2.32-2.32c-.16-.15-.3-.32-.47-.46-.62-.49-1.33-.87-2.12-1.13-.8-.25-1.64-.38-2.52-.38-1.24 0-2.35.22-3.33.66-.99.44-1.82 1.05-2.49 1.82-.68.78-1.2 1.68-1.56 2.72-.09.26-.13.54-.2.8H2c-.55 0-1 .45-1 1s.45 1 1 1h1.04c-.01.2-.04.38-.04.58 0 .15.03.28.03.42H2c-.55 0-1 .45-1 1s.45 1 1 1h1.31c.07.3.13.6.23.89.36 1.02.88 1.92 1.56 2.67.68.76 1.51 1.35 2.49 1.79.98.43 2.09.65 3.33.65.99 0 1.9-.15 2.73-.46.83-.3 1.55-.74 2.17-1.32.03-.03.05-.06.08-.09l-2.41-2.15c-.01.01-.02.02-.02.03-.61.67-1.46 1-2.54 1-.8 0-1.47-.16-2.03-.47-.56-.31-1.01-.72-1.35-1.24-.28-.38-.47-.83-.63-1.3H12c.55 0 1-.45 1-1s-.45-1-1-1H6.56c0-.14-.02-.28-.02-.42 0-.2.02-.39.03-.58H13c.55 0 1-.45 1-1s-.45-1-1-1H6.94c.15-.46.34-.9.59-1.28.35-.52.8-.94 1.36-1.25zM18 11.38v0z"],
    "exchange": ["M2.5 8a2.5 2.5 0 000 5 2.5 2.5 0 000-5zm10.35 3.15a.495.495 0 10-.7.7L13.3 13H5.5c-.28 0-.5.22-.5.5s.22.5.5.5h7.79l-1.15 1.15c-.08.09-.14.21-.14.35a.495.495 0 00.85.35l2-2c.09-.09.15-.21.15-.35s-.06-.26-.15-.35l-2-2zM17.5 8a2.5 2.5 0 000 5 2.5 2.5 0 000-5zM7.15 9.85a.495.495 0 10.7-.7L6.71 8h7.79c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H6.71l1.15-1.15c.08-.09.14-.21.14-.35a.495.495 0 00-.85-.35l-2 2c-.09.09-.15.21-.15.35s.06.26.15.35l2 2z"],
    "exclude-row": ["M1 3h18c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zM0 13a1.003 1.003 0 001.71.71L4 11.41l2.29 2.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L5.41 10 7.7 7.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L4 8.59l-2.29-2.3A1.003 1.003 0 00.29 7.71L2.59 10 .3 12.29c-.19.18-.3.43-.3.71zm18-5h-7c-1.1 0-2 .9-2 2s.9 2 2 2h7c1.1 0 2-.9 2-2s-.9-2-2-2zm1 9H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "expand-all": ["M4 9c.28 0 .53-.11.71-.29L10 3.41l5.29 5.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-6-6C10.53 1.11 10.28 1 10 1s-.53.11-.71.29l-6 6A1.003 1.003 0 004 9zm12 2c-.28 0-.53.11-.71.29L10 16.59 4.71 11.3A.965.965 0 004 11a1.003 1.003 0 00-.71 1.71l6 6c.18.18.43.29.71.29s.53-.11.71-.29l6-6A1.003 1.003 0 0016 11z"],
    "export": ["M5 7c.28 0 .53-.11.71-.29L9 3.41V15c0 .55.45 1 1 1s1-.45 1-1V3.41l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-5-5C10.53.11 10.28 0 10 0s-.53.11-.71.29l-5 5A1.003 1.003 0 005 7zm14 7c-.55 0-1 .45-1 1v3H2v-3c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1h18c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1z"],
    "eye-off": ["M20 9.96v-.03-.01-.02-.02a.794.794 0 00-.21-.43c-.55-.69-1.19-1.3-1.85-1.87l-3.93 2.62a3.966 3.966 0 01-3.96 3.77c-.47 0-.91-.1-1.33-.24l-2.24 1.49c.52.21 1.05.39 1.6.51 1.21.27 2.43.28 3.64.05 1.11-.21 2.17-.64 3.17-1.18 1.56-.84 2.99-2 4.23-3.3.23-.24.46-.49.67-.75a.87.87 0 00.21-.43v-.02-.02-.01-.03V10v-.04zm-.46-5.14c.27-.18.46-.47.46-.82 0-.55-.45-1-1-1-.21 0-.39.08-.54.18l-.01-.02L15 5.46c-.95-.53-1.95-.96-3.01-1.2a9.158 9.158 0 00-3.65-.04c-1.11.21-2.17.64-3.17 1.18-1.56.84-2.99 2-4.23 3.3-.23.24-.46.48-.67.75-.27.34-.27.76 0 1.1.64.79 1.39 1.5 2.16 2.15.26.21.52.41.79.61L.44 15.16l.01.02A1 1 0 000 16c0 .55.45 1 1 1 .21 0 .39-.08.54-.18l.01.02 18-12-.01-.02zm-8.67 3.4c-.25-.12-.53-.2-.83-.2-1.1 0-1.99.89-1.99 1.99 0 .03.02.06.02.09l-1.78 1.19c-.14-.4-.22-.83-.22-1.28 0-2.19 1.78-3.97 3.98-3.97 1.01 0 1.91.38 2.61 1l-1.79 1.18z"],
    "eye-on": ["M13.3 8.71c.18.18.43.29.71.29s.53-.11.71-.29l4.99-5a1.003 1.003 0 00-1.42-1.42L14 6.58l-2.29-2.29a.956.956 0 00-.7-.29 1.003 1.003 0 00-.71 1.71l3 3zM20 9.96v-.03-.01-.02-.02a.823.823 0 00-.21-.44c-.44-.55-.94-1.05-1.46-1.52l-2.2 2.2c-.55.54-1.3.88-2.12.88-.05 0-.09-.01-.14-.01a3.978 3.978 0 01-3.86 3.02 4.007 4.007 0 01-1.66-7.65A2.97 2.97 0 018.02 5c0-.28.05-.54.12-.8-1.05.22-2.07.64-3.02 1.15-1.57.85-3 2.02-4.24 3.33-.23.25-.46.5-.67.76-.28.35-.28.77 0 1.12.64.8 1.4 1.52 2.17 2.17 1.66 1.41 3.56 2.58 5.66 3.06 1.21.27 2.43.29 3.65.05 1.11-.21 2.18-.65 3.18-1.19 1.57-.85 3-2.02 4.24-3.33.23-.24.46-.49.67-.76.11-.12.18-.27.21-.44v-.02-.02-.01-.03V10c.01-.01.01-.03.01-.04zm-9.99 2.05c1.03 0 1.87-.79 1.98-1.8l-.09-.09-.01.01-2.1-2.11c-1 .11-1.77.95-1.77 1.98-.01 1.11.89 2.01 1.99 2.01z"],
    "eye-open": ["M10.01 7.984A2.008 2.008 0 008.012 9.99c0 1.103.9 2.006 1.998 2.006a2.008 2.008 0 001.998-2.006c0-1.103-.9-2.006-1.998-2.006zM20 9.96v-.03-.01-.02-.02a.827.827 0 00-.21-.442c-.64-.802-1.398-1.514-2.168-2.166-1.658-1.404-3.566-2.587-5.664-3.058a8.982 8.982 0 00-3.656-.05c-1.11.2-2.178.641-3.177 1.183-1.569.852-2.997 2.016-4.246 3.33-.23.25-.46.49-.67.761-.279.351-.279.773 0 1.124.64.802 1.4 1.514 2.169 2.166 1.658 1.404 3.566 2.577 5.664 3.058 1.209.271 2.438.281 3.656.05 1.11-.21 2.178-.651 3.177-1.193 1.569-.852 2.997-2.016 4.246-3.33.23-.24.46-.49.67-.751.11-.12.179-.271.209-.442v-.02-.02-.01-.03V10v-.04zM10.01 14A4.003 4.003 0 016.014 9.99a4.003 4.003 0 013.996-4.011 4.003 4.003 0 013.996 4.011 4.003 4.003 0 01-3.996 4.011z"],
    "fast-backward": ["M18 3c-.23 0-.42.09-.59.21l-.01-.01L11 8V4c0-.55-.45-1-1-1-.23 0-.42.09-.59.21L9.4 3.2l-8 6 .01.01C1.17 9.4 1 9.67 1 10s.17.6.41.79l-.01.01 8 6 .01-.01c.17.12.36.21.59.21.55 0 1-.45 1-1v-4l6.4 4.8.01-.01c.17.12.36.21.59.21.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "fast-forward": ["M19 10c0-.33-.17-.6-.41-.79l.01-.01-8-6-.01.01C10.42 3.09 10.23 3 10 3c-.55 0-1 .45-1 1v4L2.6 3.2l-.01.01C2.42 3.09 2.23 3 2 3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1 .23 0 .42-.09.59-.21l.01.01L9 12v4c0 .55.45 1 1 1 .23 0 .42-.09.59-.21l.01.01 8-6-.01-.01c.24-.19.41-.46.41-.79z"],
    "feed": ["M2.5 15a2.5 2.5 0 000 5 2.5 2.5 0 000-5zm.5-5c-.55 0-1 .45-1 1s.45 1 1 1c2.76 0 5 2.24 5 5 0 .55.45 1 1 1s1-.45 1-1c0-3.87-3.13-7-7-7zM3 0c-.55 0-1 .45-1 1s.45 1 1 1c8.28 0 15 6.72 15 15 0 .55.45 1 1 1s1-.45 1-1C20 7.61 12.39 0 3 0zm0 5c-.55 0-1 .45-1 1s.45 1 1 1c5.52 0 10 4.48 10 10 0 .55.45 1 1 1s1-.45 1-1C15 10.37 9.63 5 3 5z"],
    "feed-subscribed": ["M2.5 15a2.5 2.5 0 000 5 2.5 2.5 0 000-5zM3 2c1.76 0 3.44.31 5.01.87.03-.71.31-1.35.75-1.85C6.96.37 5.03 0 3 0c-.55 0-1 .45-1 1s.45 1 1 1zm10.32 4.67a.99.99 0 001.4 0l4.98-4.98c.19-.17.3-.42.3-.7 0-.55-.45-1-1-1a.99.99 0 00-.7.29l-4.27 4.27-2.28-2.28a.99.99 0 00-.7-.29c-.55 0-.99.45-.99 1 0 .28.11.52.29.7l2.97 2.99zM3 10c-.55 0-1 .45-1 1s.45 1 1 1c2.76 0 5 2.24 5 5 0 .55.45 1 1 1s1-.45 1-1c0-3.87-3.13-7-7-7zm13.94-2.69l-.82.82-.02-.02c-.2.2-.42.37-.67.51A14.8 14.8 0 0118 17c0 .55.45 1 1 1s1-.45 1-1c0-3.61-1.14-6.94-3.06-9.69zM3 5c-.55 0-1 .45-1 1s.45 1 1 1c5.52 0 10 4.48 10 10 0 .55.45 1 1 1s1-.45 1-1C15 10.37 9.63 5 3 5z"],
    "film": ["M19 2h-5v3H6V2H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h5v-3h8v3h5c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zM4 17H2v-2h2v2zm0-3H2v-2h2v2zm0-3H2V9h2v2zm0-3H2V6h2v2zm0-3H2V3h2v2zm10 8H6V7h8v6zm4 4h-2v-2h2v2zm0-3h-2v-2h2v2zm0-3h-2V9h2v2zm0-3h-2V6h2v2zm0-3h-2V3h2v2z"],
    "filter": ["M18 1H2a1.003 1.003 0 00-.71 1.71L7 8.41V18a1.003 1.003 0 001.71.71l4-4c.18-.18.29-.43.29-.71V8.41l5.71-5.71c.18-.17.29-.42.29-.7 0-.55-.45-1-1-1z"],
    "filter-keep": ["M15 2c0-.55-.45-1-1-1H1a1.003 1.003 0 00-.71 1.71L5 7.41V16a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71V7.41l4.71-4.71c.18-.17.29-.42.29-.7zm4 11c-.28 0-.53.11-.71.29L15 16.59l-1.29-1.29A.965.965 0 0013 15a1.003 1.003 0 00-.71 1.71l2 2c.18.18.43.29.71.29s.53-.11.71-.29l4-4A1.003 1.003 0 0019 13z"],
    "filter-list": ["M15 2c0-.55-.45-1-1-1H1a1.003 1.003 0 00-.71 1.71L5 7.41V16a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71V7.41l4.71-4.71c.18-.17.29-.42.29-.7zm-4 8c0 .55.45 1 1 1h7c.55 0 1-.45 1-1s-.45-1-1-1h-7c-.55 0-1 .45-1 1zm8 7h-7c-.55 0-1 .45-1 1s.45 1 1 1h7c.55 0 1-.45 1-1s-.45-1-1-1zm0-4h-7c-.55 0-1 .45-1 1s.45 1 1 1h7c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "filter-open": ["M15 2c0 .28-.11.53-.29.7L10 7.41V13c0 .28-.11.53-.29.71l-3 3A1.003 1.003 0 015 16V7.41L.29 2.71A1.003 1.003 0 011 1h13c.55 0 1 .45 1 1zm4.707 11.293a1 1 0 010 1.414l-4 4c-.63.63-1.707.184-1.707-.707v-8c0-.89 1.077-1.337 1.707-.707l4 4z"],
    "filter-remove": ["M15 2c0-.55-.45-1-1-1H1a1.003 1.003 0 00-.71 1.71L5 7.41V16a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71V7.41l4.71-4.71c.18-.17.29-.42.29-.7zm2.91 13.5l1.79-1.79c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-1.79 1.79-1.79-1.79a1.003 1.003 0 00-1.42 1.42l1.79 1.79-1.79 1.79a1.003 1.003 0 001.42 1.42l1.79-1.79 1.79 1.79a1.003 1.003 0 001.42-1.42l-1.8-1.79z"],
    "flag": ["M3 3c-.55 0-1 .45-1 1v15c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1zm0-3c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm2 4.08v8.28c3.01-2.41 8.67 2.64 13 0V4.08C13.61 7.14 8.01 1 5 4.08z"],
    "flame": ["M11.622 0c0 1.71.49 3.077 1.472 4.103C16.364 6.496 18 9.23 18 12.308c0 3.418-1.962 5.983-5.887 7.692 2.887-3 2.453-4.23-.49-8C8.5 13.5 9 14.5 9.5 16.5c-1.048 0-2 0-2.5-.5 0 .684 1.197 2.5 1.952 4-3.924-1.026-8.123-7.18-6.651-7.692.981-.342 2.126-.171 3.434.513C4.1 6.667 6.062 2.393 11.622 0z"],
    "flash": ["M4.96 6.37a1.003 1.003 0 001.42-1.42l-2-2a1.07 1.07 0 00-.71-.28 1.003 1.003 0 00-.71 1.71l2 1.99zm9.37.3c.28 0 .53-.11.71-.29l2-2a1.003 1.003 0 00-1.42-1.42l-2 2a1.003 1.003 0 00.71 1.71zM10 5c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1S9 .45 9 1v3c0 .55.45 1 1 1zm-5 5c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1zm14-1h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1zm-9-3c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm5.04 1.63a1.003 1.003 0 00-1.42 1.42l2 2a1.003 1.003 0 001.42-1.42l-2-2zM10 15c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1s1-.45 1-1v-3c0-.55-.45-1-1-1zm-4.33-1.67c-.28 0-.53.11-.71.29l-2 2a1.003 1.003 0 001.42 1.42l2-2a1.003 1.003 0 00-.71-1.71z"],
    "floppy-disk": ["M14 1h-3v5h3V1zm5.71 2.29l-3-3A.997.997 0 0016 0h-1v7H5V0H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V4c0-.28-.11-.53-.29-.71zM17 19H3v-8c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v8z"],
    "flow-branch": ["M14.425 7.953a3.98 3.98 0 01.562 2.045 3.98 3.98 0 01-.583 2.08L18 15.671V12.98c0-.248.097-.496.29-.689.379-.379 1.047-.38 1.426 0a.94.94 0 01.283.696l-.001 5.049a.957.957 0 01-.276.69.955.955 0 01-.69.273h-5.059a.971.971 0 01-.689-.289 1.026 1.026 0 010-1.417.972.972 0 01.69-.29h2.702l-3.634-3.573a3.998 3.998 0 01-5.924-2.431H1a1 1 0 010-2h6.12a3.998 3.998 0 015.96-2.409L16.665 3l-2.694-.001a.972.972 0 01-.689-.29 1.035 1.035 0 010-1.425.94.94 0 01.696-.283l5.05.001c.248 0 .497.083.69.276a.954.954 0 01.272.69l.001 5.052a.971.971 0 01-.29.689 1.028 1.028 0 01-1.419 0 .972.972 0 01-.29-.69V4.323l-3.567 3.63z"],
    "flow-end": ["M12 9.919a3.998 3.998 0 014-3.92c2.21 0 4 1.79 4 3.997a3.998 3.998 0 01-4 3.996 3.998 3.998 0 01-4-3.916.967.967 0 01-.28.612L7.685 14.71a.958.958 0 01-.686.285c-.536 0-.994-.461-.994-.997 0-.273.107-.528.283-.704l2.379-2.302H.98c-.537 0-.976-.46-.976-.996s.44-.992.976-.992h7.676L6.287 6.687a.957.957 0 01-.283-.686c0-.536.458-.996.994-.996.274 0 .51.1.686.285l4.027 4.024c.159.158.27.365.29.605z"],
    "flow-linear": ["M5.125 10.997H.976C.439 10.997 0 10.537 0 10c0-.536.44-.993.976-.993h4.148a4.002 4.002 0 017.752 0h3.776L14.293 6.69a.962.962 0 01-.285-.687c0-.537.46-1.001.996-1.001a.96.96 0 01.698.3l4.005 4.015c.176.176.293.41.293.683a.972.972 0 01-.283.693L15.702 14.7a.997.997 0 01-.698.297c-.537 0-.996-.453-.996-.99 0-.273.107-.517.283-.692l2.371-2.318h-3.787a4.002 4.002 0 01-7.75 0z"],
    "flow-review": ["M6.13 9.004A4.005 4.005 0 0110.012 6c1.87 0 3.44 1.278 3.881 3.005h2.768l-2.354-2.317a.97.97 0 01-.283-.691c0-.536.462-.995 1-.995.273 0 .517.107.693.283l4 4.041a.97.97 0 01.284.692.956.956 0 01-.293.682l-3.991 3.997a.944.944 0 01-.694.292c-.537 0-1-.46-1-.997a.97.97 0 01.284-.692l2.345-2.29h-2.765a4.005 4.005 0 01-3.875 2.981 4.005 4.005 0 01-3.874-2.981H3.349l2.376 2.308a.97.97 0 01.283.691 1 1 0 01-.994.983.989.989 0 01-.713-.291L.293 10.699A.956.956 0 010 10.017a.97.97 0 01.283-.692l4.03-4.037a.996.996 0 01.701-.283c.537 0 .994.464.994 1a.97.97 0 01-.283.691L3.34 9.004h2.79z"],
    "flow-review-branch": ["M13.04 13.424c-.6.36-1.302.568-2.052.568a4 4 0 01-3.868-2.999H3.342l2.372 2.31c.176.176.283.42.283.694 0 .537-.452.998-.988.998a.935.935 0 01-.691-.289L.292 10.683A.96.96 0 010 9.999c0-.274.107-.518.283-.694l4.035-4.04a.973.973 0 01.691-.288c.536 0 .988.47.988 1.007a.975.975 0 01-.283.694L3.332 8.984h3.786a4 4 0 013.87-3.006c.771 0 1.492.22 2.102.599l3.565-3.57-2.538-.003a.974.974 0 01-.69-.29c-.38-.38-.38-1.052-.002-1.431A.94.94 0 0114.122 1l4.896.005a.96.96 0 01.69.277c.193.193.27.442.27.69l.005 4.9a.971.971 0 01-.289.69 1.023 1.023 0 01-1.416 0 .975.975 0 01-.29-.691l-.003-2.54-3.554 3.62c.351.596.553 1.291.553 2.034 0 .763-.213 1.477-.583 2.084l3.595 3.595.003-2.54c0-.249.097-.497.29-.69.38-.38 1.05-.381 1.429-.002a.94.94 0 01.282.697l-.005 4.9a.927.927 0 01-.277.675.974.974 0 01-.69.291L13.974 19a.97.97 0 01-.69-.29 1.03 1.03 0 01.002-1.42.974.974 0 01.69-.29l2.696-.003-3.632-3.573z"],
    "flows": ["M17.5 7.93a2.5 2.5 0 00-2.45 2h-2.3l-4.01-4-.75.75 3.26 3.25h-6.3a2.5 2.5 0 100 1h6.3l-3.26 3.25.75.75 4.01-4h2.3a2.5 2.5 0 102.45-3z"],
    "folder-close": ["M0 17c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V7H0v10zM19 4H9.41l-1.7-1.71A.997.997 0 007 2H1c-.55 0-1 .45-1 1v3h20V5c0-.55-.45-1-1-1z"],
    "folder-new": ["M12.994 7c0 1.655 1.344 3 2.998 3a3.002 3.002 0 002.999-3H20v10c0 .55-.45 1-1 1H1.01c-.55 0-1-.45-1-1V7h12.984zM10.76 6H0V3c0-.55.45-1 1-1h3.998c.28 0 .53.11.71.29L7.415 4h2.579c0 .768.29 1.469.765 2zm8.23-3c.55 0 1 .45 1 1s-.45 1-1 1h-1.998v2c0 .55-.45 1-1 1s-1-.45-1-1V5h-1.998c-.55 0-1-.45-1-1s.45-1 1-1h1.999V1c0-.55.45-1 .999-1 .55 0 1 .45 1 1v2h1.999z"],
    "folder-open": ["M20 9c0-.55-.45-1-1-1H5c-.43 0-.79.27-.93.65h-.01l-3 8h.01c-.04.11-.07.23-.07.35 0 .55.45 1 1 1h14c.43 0 .79-.27.93-.65h.01l3-8h-.01c.04-.11.07-.23.07-.35zM3.07 7.63C3.22 7.26 3.58 7 4 7h14V5c0-.55-.45-1-1-1H8.41l-1.7-1.71A.997.997 0 006 2H1c-.55 0-1 .45-1 1v12.31l3.07-7.68z"],
    "folder-shared": ["M11 4H9.41l-1.7-1.71A.997.997 0 007 2H1c-.55 0-1 .45-1 1v3h11.78C11.3 5.47 11 4.77 11 4zm8-1h-5c-.55 0-1 .45-1 1s.45 1 1 1h2.59L12.3 9.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L18 6.41V9c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1zm-2.46 7.7l-1.42 1.42a2.996 2.996 0 11-4.24-4.24l.88-.88H0v10c0 .55.45 1 1 1h18c.55 0 1-.45 1-1v-5.18c-.31.11-.65.18-1 .18-1.02 0-1.92-.52-2.46-1.3z"],
    "folder-shared-open": ["M3.07 7.63C3.22 7.26 3.58 7 4 7h7.76l.54-.54A2.97 2.97 0 0111 4H8.41l-1.7-1.71A.997.997 0 006 2H1c-.55 0-1 .45-1 1v12.31l3.07-7.68zm13.47 3.07l-1.42 1.42A2.996 2.996 0 0110 10c0-.77.3-1.47.78-2H5c-.43 0-.79.27-.93.65h-.01l-3 8h.01c-.04.11-.07.23-.07.35 0 .55.45 1 1 1h14c.43 0 .79-.27.93-.65h.01l2.01-5.36c-1-.01-1.88-.52-2.41-1.29zM19 3h-5c-.55 0-1 .45-1 1s.45 1 1 1h2.59L12.3 9.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L18 6.41V9c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "follower": ["M11.54 15.92c-1.48-.65-1.28-1.05-1.33-1.59-.01-.07-.01-.15-.01-.23.51-.45.92-1.07 1.19-1.78 0 0 .01-.04.02-.05.06-.15.11-.32.15-.48.34-.07.54-.44.61-.78.08-.14.23-.48.2-.87-.05-.5-.25-.73-.47-.82v-.09c0-.63-.06-1.55-.17-2.15-.02-.17-.06-.33-.11-.5a3.69 3.69 0 00-1.29-1.86C9.69 4.25 8.8 4 8.01 4c-.8 0-1.69.25-2.32.73-.61.47-1.06 1.13-1.28 1.86-.05.17-.09.33-.11.5-.12.6-.18 1.51-.18 2.14v.08c-.23.09-.44.32-.49.83-.04.39.12.73.2.87.08.35.28.72.63.78.04.17.09.33.15.48 0 .01.01.02.01.03l.01.01c.27.72.7 1.35 1.22 1.8 0 .07-.01.14-.01.21-.05.54.1.94-1.38 1.59-1.48.65-3.71 1.35-4.16 2.4C-.16 19.38.02 20 .02 20h15.95s.18-.62-.27-1.67c-.46-1.06-2.68-1.75-4.16-2.41zm8.15-12.63l-3-3a.956.956 0 00-.7-.29 1.003 1.003 0 00-.71 1.71L16.58 3H13c-.55 0-1 .45-1 1s.45 1 1 1h3.58l-1.29 1.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.3-.71z"],
    "following": ["M11.55 15.92c-1.48-.65-1.28-1.05-1.33-1.59-.01-.07-.01-.15-.01-.23.51-.45.92-1.07 1.19-1.78 0 0 .01-.04.02-.05.06-.15.11-.32.15-.48.34-.07.54-.44.61-.78.08-.14.23-.48.2-.87-.05-.5-.25-.73-.47-.82v-.09c0-.63-.06-1.55-.17-2.15-.02-.17-.06-.33-.11-.5a3.69 3.69 0 00-1.29-1.86C9.7 4.25 8.81 4 8.02 4c-.79 0-1.68.25-2.31.73-.61.47-1.07 1.13-1.29 1.86-.05.16-.09.33-.11.5-.12.6-.18 1.51-.18 2.14v.08c-.23.09-.44.32-.48.83-.04.39.12.73.2.87.08.35.28.72.63.78.04.17.09.33.15.48 0 .01.01.02.01.03l.01.01c.27.72.7 1.35 1.22 1.8 0 .07-.01.14-.01.21-.05.54.1.94-1.38 1.59C3 16.56.77 17.26.32 18.31-.15 19.38.04 20 .04 20h15.95s.18-.62-.27-1.67c-.46-1.06-2.69-1.75-4.17-2.41zM19 3h-3.58l1.29-1.29A1.003 1.003 0 0015.29.29l-3 3c-.17.18-.28.43-.28.71 0 .28.11.53.29.71l3 3c.18.18.43.29.7.29a1.003 1.003 0 00.71-1.71L15.42 5H19c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "font": ["M17.93 18.64l-7-18C10.78.27 10.42 0 10 0s-.78.27-.93.64l-7 18c-.04.11-.07.23-.07.36 0 .55.45 1 1 1 .42 0 .78-.27.93-.64L6.41 13h7.19l2.47 6.36c.15.37.51.64.93.64.55 0 1-.45 1-1 0-.13-.03-.25-.07-.36zM7.18 11L10 3.76 12.82 11H7.18z"],
    "fork": ["M16.71 11.29a1.003 1.003 0 00-1.42 1.42l1.3 1.29h-2.17l-8-8h10.17L15.3 7.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-3-3a1.003 1.003 0 00-1.42 1.42L16.59 4H1c-.55 0-1 .45-1 1s.45 1 1 1h2.59l9.71 9.71c.17.18.42.29.7.29h2.59l-1.29 1.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-3-3z"],
    "form": ["M2 13v4h4v-4H2zm-1-2h6c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1v-6c0-.55.45-1 1-1zm11-7h7c.55 0 1 .45 1 1s-.45 1-1 1h-7c-.55 0-1-.45-1-1s.45-1 1-1zM8 1a1.003 1.003 0 01.71 1.71l-5 6C3.53 8.89 3.28 9 3 9s-.53-.11-.71-.29l-2-2a1.003 1.003 0 011.42-1.42L3 6.59l4.29-5.3C7.47 1.11 7.72 1 8 1zm4 13h7c.55 0 1 .45 1 1s-.45 1-1 1h-7c-.55 0-1-.45-1-1s.45-1 1-1z"],
    "full-circle": ["M9.96 0a10 10 0 100 20 10 10 0 100-20z"],
    "full-stacked-chart": ["M15 16h2c.55 0 1-.45 1-1v-5h-4v5c0 .55.45 1 1 1zM12 2c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v4h4V2zm6 4h-4v3h4V6zm0-4c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1v3h4V2zm-6 5H8v5h4V7zm-9 9h2c.55 0 1-.45 1-1v-3H2v3c0 .55.45 1 1 1zm6 0h2c.55 0 1-.45 1-1v-2H8v2c0 .55.45 1 1 1zm10 1H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zM6 2c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v3h4V2zm0 4H2v5h4V6z"],
    "fullscreen": ["M3.41 2H6c.55 0 1-.45 1-1s-.45-1-1-1H1C.45 0 0 .45 0 1v5c0 .55.45 1 1 1s1-.45 1-1V3.41L7.29 8.7c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L3.41 2zM8 11c-.28 0-.53.11-.71.29L2 16.59V14c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1H3.41l5.29-5.29c.19-.18.3-.43.3-.71 0-.55-.45-1-1-1zM19 0h-5c-.55 0-1 .45-1 1s.45 1 1 1h2.59L11.3 7.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L18 3.41V6c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zm0 13c-.55 0-1 .45-1 1v2.59l-5.29-5.29A.965.965 0 0012 11a1.003 1.003 0 00-.71 1.71l5.3 5.29H14c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1z"],
    "function": ["M10.14 5.82H8.73c.4-1.66.94-2.87 1.6-3.64.4-.48.8-.72 1.18-.72.08 0 .14.02.19.07.05.05.07.1.07.18 0 .07-.05.19-.16.37s-.16.36-.16.52c0 .23.08.43.25.59a.9.9 0 00.64.25c.28 0 .51-.1.7-.3.19-.2.28-.47.28-.81 0-.39-.14-.7-.42-.94-.28-.24-.74-.36-1.36-.36-.97 0-1.86.29-2.65.87-.79.56-1.54 1.52-2.26 2.85-.24.46-.48.75-.7.88-.22.13-.57.19-1.06.19l-.32 1.15H5.9l-1.99 7.85c-.33 1.29-.56 2.09-.67 2.39-.17.44-.43.81-.77 1.12a.74.74 0 01-.5.19c-.05 0-.1-.02-.14-.05l-.04-.07c0-.03.05-.1.15-.2.1-.1.15-.26.15-.47 0-.23-.08-.42-.23-.57-.16-.15-.38-.23-.67-.23-.35 0-.63.1-.85.29-.21.2-.32.43-.32.7 0 .29.13.54.39.75.25.22.65.33 1.2.33.88 0 1.66-.23 2.33-.69.68-.46 1.27-1.17 1.78-2.14.51-.96 1.03-2.52 1.56-4.66l1.14-4.54H9.8l.34-1.15zm6.8 1.95c.25-.2.51-.29.78-.29.1 0 .29.04.56.11.27.08.51.11.72.11.29 0 .52-.1.72-.3.18-.19.28-.45.28-.77 0-.33-.1-.6-.29-.8-.19-.2-.47-.29-.82-.29-.32 0-.62.08-.9.23-.28.15-.64.49-1.08 1-.33.38-.81 1.05-1.44 2a9.712 9.712 0 00-1.31-3.22l-3.4.59-.07.37c.25-.05.47-.08.64-.08.34 0 .62.15.84.44.35.46.84 1.85 1.46 4.19-.49.66-.82 1.09-1 1.3-.3.33-.55.54-.74.64-.15.08-.32.12-.51.12-.14 0-.38-.08-.7-.24-.22-.1-.42-.16-.59-.16-.33 0-.6.11-.82.32-.21.22-.32.49-.32.83 0 .31.1.57.3.77.2.2.47.29.8.29.32 0 .63-.07.92-.21.29-.14.64-.43 1.08-.88.43-.45 1.03-1.16 1.79-2.14.29.93.55 1.61.76 2.03.21.42.46.73.74.91.28.19.62.28 1.04.28.4 0 .81-.15 1.23-.44.55-.38 1.1-1.04 1.68-1.97l-.35-.21c-.39.55-.68.89-.87 1.03-.12.09-.27.13-.44.13-.2 0-.4-.13-.59-.38-.33-.43-.77-1.63-1.33-3.6.47-.86.89-1.44 1.23-1.71z"],
    "gantt-chart": ["M4 7h5c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1zm3 2v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1zm12 3h-6c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zm0 4H2V3c0-.55-.45-1-1-1s-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "geolocation": ["M0 8.33l9.17 2.5 2.5 9.17L20 0z"],
    "geosearch": ["M8 18.88c-3.79 0-6.88-3.09-6.88-6.88 0-.61.08-1.22.23-1.79.03.01.06-.01.1-.01h.09v.55c0 .23.21.42.44.42.04 0 .09-.01.12-.02l.9.88c.09.09.23.09.32 0s.09-.23 0-.32l-.86-.9c0-.02.05-.04.05-.07v-.13c0-.18.1-.25.29-.41h.53c.1 0 .19-.01.27-.05.01-.01.02 0 .03-.01.02-.01.03-.02.05-.04.01-.01.02-.01.02-.02l.02-.02 1.13-1.13c-.16-.32-.3-.65-.42-.99h-.64v-.53c0-.01.06.06.06-.1h.38c-.04-.16-.08-.32-.1-.48h-.71c.2-.16.42-.31.64-.45C4.02 6.09 4 5.8 4 5.5c0-.14.01-.28.02-.43C1.62 6.46 0 9.04 0 12c0 4.41 3.59 8 8 8 3.87 0 7.09-2.77 7.82-6.44l-.97-1.1c-.26 3.57-3.23 6.42-6.85 6.42zm-2.12-3.67v-.35h.15c.29 0 .49-.23.49-.53v-.68c0-.01.01-.01 0-.02L4.71 11.8h-.77c-.29 0-.47.24-.47.53v2c0 .29.18.53.47.53h.33v2.02c0 .28.28.51.56.51s.56-.23.56-.51v-1.22h-.01c.29 0 .5-.16.5-.45zm13.83-2.92l-3.68-3.68c.14-.21.27-.42.38-.65.02-.04.04-.07.05-.11.11-.22.2-.45.28-.69v-.01c.07-.24.13-.48.17-.73l.03-.17c.04-.24.06-.49.06-.75C17 2.46 14.54 0 11.5 0S6 2.46 6 5.5 8.46 11 11.5 11c.26 0 .51-.02.76-.06l.17-.03c.25-.04.49-.1.73-.17h.01c.24-.08.47-.17.69-.28.04-.02.07-.04.11-.05.23-.11.44-.24.65-.38l3.68 3.68c.17.18.42.29.7.29a1.003 1.003 0 00.71-1.71zM11.5 9.5c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm1.93 5.33v-.65c0-.11-.13-.21-.24-.21-.11 0-.24.09-.24.21v.65c0 .11.13.21.24.21.11 0 .24-.1.24-.21zm-2.41.67h.83c.29 0 .46-.21.46-.5v-1.86l.23-.22c-.34.05-.69.08-1.04.08-.36 0-.7-.03-1.05-.08.03.05.06.1.08.16V15c.01.29.2.5.49.5z"],
    "git-branch": ["M15 2c-1.66 0-3 1.34-3 3 0 1.3.84 2.4 2 2.82V9c0 1.1-.9 2-2 2H8c-.73 0-1.41.21-2 .55V5.82C7.16 5.4 8 4.3 8 3c0-1.66-1.34-3-3-3S2 1.34 2 3c0 1.3.84 2.4 2 2.82v8.37C2.84 14.6 2 15.7 2 17c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.25-.77-2.3-1.85-2.75C6.45 13.52 7.16 13 8 13h4c2.21 0 4-1.79 4-4V7.82C17.16 7.4 18 6.3 18 5c0-1.66-1.34-3-3-3zM5 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 16c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM15 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"],
    "git-commit": ["M19 9h-4.1a5 5 0 00-9.8 0H1c-.55 0-1 .45-1 1s.45 1 1 1h4.1a5 5 0 009.8 0H19c.55 0 1-.45 1-1s-.45-1-1-1zm-9 4c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"],
    "git-merge": ["M15 8c-1.3 0-2.4.84-2.82 2H11c-2.49 0-4.54-1.83-4.92-4.21A2.995 2.995 0 005 0C3.34 0 2 1.34 2 3c0 1.3.84 2.4 2 2.81v8.37C2.84 14.6 2 15.7 2 17c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.3-.84-2.4-2-2.82V9.86C7.27 11.17 9.03 12 11 12h1.18A2.996 2.996 0 0018 11c0-1.66-1.34-3-3-3zM5 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM5 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"],
    "git-new-branch": ["M17 3h-1V2c0-.55-.45-1-1-1s-1 .45-1 1v1h-1c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1V5h1c.55 0 1-.45 1-1s-.45-1-1-1zm-3 4.86V9c0 1.1-.9 2-2 2H8c-.73 0-1.41.21-2 .55V5.82C7.16 5.4 8 4.3 8 3c0-1.66-1.34-3-3-3S2 1.34 2 3c0 1.3.84 2.4 2 2.82v8.37C2.84 14.6 2 15.7 2 17c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.25-.77-2.3-1.85-2.75C6.45 13.52 7.16 13 8 13h4c2.21 0 4-1.79 4-4V7.86c-.32.08-.65.14-1 .14s-.68-.06-1-.14zM5 2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 16c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"],
    "git-pull": ["M17 14.18V7c0-2.21-1.79-4-4-4h-2.59l1.29-1.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-3 3C7.11 3.47 7 3.72 7 4c0 .28.11.53.29.71l3 3a1.003 1.003 0 001.42-1.42L10.41 5H13c1.1 0 2 .9 2 2v7.18A2.996 2.996 0 0016 20c1.66 0 3-1.34 3-3 0-1.3-.84-2.4-2-2.82zM16 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM4 1C2.34 1 1 2.34 1 4c0 1.3.84 2.4 2 2.82v7.37C1.84 14.6 1 15.7 1 17c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.3-.84-2.4-2-2.82V6.82C6.16 6.4 7 5.3 7 4c0-1.66-1.34-3-3-3zm0 17c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM4 5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"],
    "git-push": ["M15 11c0-.28-.11-.53-.29-.71l-3-3C11.53 7.11 11.28 7 11 7s-.53.11-.71.29l-3 3a1.003 1.003 0 001.42 1.42l1.29-1.3V19c0 .55.45 1 1 1s1-.45 1-1v-8.59l1.29 1.29c.18.19.43.3.71.3.55 0 1-.45 1-1zm4-11H1C.45 0 0 .45 0 1v16c0 .55.45 1 1 1h7v-2H2v-2h6v-1H4V2h14v11h-4v1h4v2h-4v2h5c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM5 8h2V6H5v2zm2-5H5v2h2V3z"],
    "git-repo": ["M7 3H5v2h2V3zm0 6H5v2h2V9zm0-3H5v2h2V6zm12-6H1C.45 0 0 .45 0 1v16c0 .55.45 1 1 1h4v2l2-1 2 1v-2h10c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 16H9v-1H5v1H2v-2h16v2zm0-3H4V2h14v11z"],
    "glass": ["M17 6V0H3v6c0 3.53 2.61 6.43 6 6.92V18H6c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1h-3v-5.08c3.39-.49 6-3.39 6-6.92z"],
    "globe": ["M7.53 4.37c.1-.1.1-.26 0-.35l-.68-.68c-.1-.1-.25-.1-.35 0-.1.1-.1.26 0 .35l.68.68c.1.1.25.1.35 0zm3.17.06h.3c.09 0 .16-.01.16-.1 0-.09-.07-.1-.16-.1h-.3c-.09 0-.16.01-.16.1s.07.1.16.1zm.98 1.15c.09 0 .19-.08.19-.17v-.42c0-.09-.1-.17-.19-.17s-.19.08-.19.17v.42c0 .09.1.17.19.17zm-6.5 4.19c-.35 0-.56.28-.56.63v2.37c0 .35.21.62.56.62h.39v2.4c0 .34.33.61.67.61s.67-.27.67-.61v-1.44h-.02c.35 0 .6-.19.6-.54v-.41h.18c.35 0 .58-.28.58-.62v-.81c0-.01.01-.01 0-.02L6.1 9.77h-.92zM10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8 0-.74.11-1.46.3-2.14h.03v.65c0 .28.25.5.53.5.05 0 .1-.01.15-.02l1.05 1.05c.1.11.28.11.38 0 .1-.1.11-.27 0-.38L3.42 8.59c0-.03.05-.05.05-.08v-.16c0-.22.12-.3.34-.49h.63c.12 0 .23-.01.32-.07.01-.01.02 0 .03-.01.02-.02.04-.03.06-.04.01-.01.02-.01.03-.02l.02-.02 2.15-2.15c.24-.24.24-.63 0-.86-.23-.24-.62-.19-.86.04l-.41.46H5v-.64c0-.01.07.07.07-.12h.87c.17 0 .3-.12.3-.29 0-.17-.13-.29-.3-.29H4.88C6.27 2.7 8.05 2 10 2s3.73.7 5.12 1.86h-1.58l-.01-.04c-.06 0-.12 0-.17.04l-.71.7c-.09.09-.09.23 0 .31.09.09.23.09.32 0l.56-.6.01-.03h.34c0 .19-.1.13-.1.16v.1c0 .29-.2.5-.49.5h-.51c-.25 0-.52.28-.52.54v.23h-.12c-.16 0-.27.08-.27.24v.33h-.32c-.23 0-.41.15-.41.38 0 .22.18.35.41.35.1 0 .19.04.26-.16l.06.01.66-.59h.23l.53.5c.04.04.11.03.16-.01.04-.04.04-.16 0-.2L13 6.15h.32l.12.16c.25.25.65.23.89-.02l.12-.14H15c.02 0 .11.07.11.07v.33s-.06-.01-.07-.01h-.49c-.16 0-.28.13-.28.29 0 .16.13.29.28.29h.49c.01 0 .07-.01.07-.01v.2c-.19.28-.33.57-.62.57h-1.28s0-.01-.01-.01l-.58-.58a.622.622 0 00-.89 0l-.58.58s0 .01-.01.01h-.34c-.35 0-.67.28-.67.63v1.25c0 .35.32.61.67.61h1.22c.46.19.78.48.97.94v2.28c0 .35.23.6.58.6h.98c.35 0 .54-.25.54-.6v-2.2l1.21-1.17.04-.02.02-.01h.04c.1-.11.2-.26.2-.42V8.49c0-.25-.22-.44-.42-.63h.58c.02.38.29.57.63.57h.43c.13.51.18 1.03.18 1.57 0 4.42-3.58 8-8 8zm6.16-5.65c-.14 0-.29.11-.29.25v.77c0 .14.15.25.29.25.14 0 .29-.11.29-.25v-.77c0-.14-.15-.25-.29-.25zM10.5 3.48c0-.34-.28-.57-.62-.57h-.74c-.34 0-.57.25-.57.59 0 .05-.13.06.06.1v.64c0 .2.09.36.29.36.2 0 .29-.16.29-.36v-.19h.68c.33 0 .61-.23.61-.57z"],
    "globe-network": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm7.39 7h-3.63c-.31-1.99-.92-3.66-1.72-4.73 2.45.65 4.41 2.42 5.35 4.73zM13 10c0 .69-.04 1.36-.11 2H7.11a18.419 18.419 0 010-4h5.77c.08.64.12 1.31.12 2zm-3-8c1.07 0 2.25 2.05 2.75 5h-5.5c.5-2.95 1.68-5 2.75-5zm-2.04.27C7.16 3.34 6.55 5.01 6.24 7H2.61c.94-2.31 2.9-4.08 5.35-4.73zM2 10c0-.69.11-1.36.28-2h3.83a18.419 18.419 0 000 4H2.28c-.17-.64-.28-1.31-.28-2zm.61 3h3.63c.31 1.99.92 3.66 1.72 4.73A7.996 7.996 0 012.61 13zM10 18c-1.07 0-2.25-2.05-2.75-5h5.5c-.5 2.95-1.68 5-2.75 5zm2.04-.27c.79-1.07 1.4-2.74 1.72-4.73h3.63a7.996 7.996 0 01-5.35 4.73zM13.89 12a18.419 18.419 0 000-4h3.83c.17.64.28 1.31.28 2s-.11 1.36-.28 2h-3.83z"],
    "graph": ["M17.5 4A2.5 2.5 0 0015 6.5c0 .06.01.12.02.18l-1.9.84C12.38 6.6 11.27 6 10 6c-.83 0-1.59.25-2.23.68L4.91 4.14c.05-.21.09-.42.09-.64a2.5 2.5 0 00-5 0A2.5 2.5 0 002.5 6c.42 0 .81-.11 1.16-.3l2.79 2.48C6.17 8.73 6 9.34 6 10c0 1.41.73 2.64 1.83 3.35l-.56 1.67A2.498 2.498 0 005 17.5a2.5 2.5 0 005 0c0-.74-.32-1.39-.83-1.85l.56-1.68c.09.01.18.03.27.03 2.21 0 4-1.79 4-4 0-.22-.03-.44-.07-.65l2.02-.9c.43.34.96.55 1.55.55a2.5 2.5 0 000-5z"],
    "graph-remove": ["M17.41 4l2.29-2.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L16 2.59 13.71.3A.965.965 0 0013 0a1.003 1.003 0 00-.71 1.71L14.59 4 12.3 6.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L16 5.41l2.29 2.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L17.41 4zM19 10c-.83 0-1.55-.36-2.09-.91l-.03.03-.88-.88-.88.88a2.996 2.996 0 11-4.24-4.24l.88-.88-.88-.88.03-.03C10.36 2.55 10 1.83 10 1c0-.35.07-.68.18-.99-.06 0-.12-.01-.18-.01C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10c0-.06-.01-.12-.01-.18-.31.11-.64.18-.99.18z"],
    "greater-than": ["M12.838 10l-9.154 3.051a1 1 0 00.632 1.898l12-4c.912-.304.912-1.594 0-1.898l-12-4a1 1 0 00-.632 1.898L12.838 10z"],
    "greater-than-or-equal-to": ["M3.684 11.051a1 1 0 00.632 1.898l12-4c.912-.304.912-1.594 0-1.898l-12-4a1 1 0 00-.632 1.898L12.838 8l-9.154 3.051zM4 15h12a1 1 0 110 2H4a1 1 0 010-2z"],
    "grid": ["M19 11c.55 0 1-.45 1-1s-.45-1-1-1h-2V5h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V1c0-.55-.45-1-1-1s-1 .45-1 1v2h-4V1c0-.55-.45-1-1-1S9 .45 9 1v2H5V1c0-.55-.45-1-1-1S3 .45 3 1v2H1c-.55 0-1 .45-1 1s.45 1 1 1h2v4H1c-.55 0-1 .45-1 1s.45 1 1 1h2v4H1c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1v-2h4v2c0 .55.45 1 1 1s1-.45 1-1v-2h4v2c0 .55.45 1 1 1s1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1h-2v-4h2zM9 15H5v-4h4v4zm0-6H5V5h4v4zm6 6h-4v-4h4v4zm0-6h-4V5h4v4z"],
    "grid-view": ["M0 19c0 .55.45 1 1 1h8v-9H0v8zM0 1v8h9V0H1C.45 0 0 .45 0 1zm19-1h-8v9h9V1c0-.55-.45-1-1-1zm-8 20h8c.55 0 1-.45 1-1v-8h-9v9z"],
    "group-objects": ["M6 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm8-3H6c-3.31 0-6 2.69-6 6s2.69 6 6 6h8c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 11H6c-2.76 0-5-2.24-5-5s2.24-5 5-5h8c2.76 0 5 2.24 5 5s-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"],
    "grouped-bar-chart": ["M12 16h1c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1h-1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1zm7 1H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zm-3-1h1c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1h-1c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1zm-9 0h1c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1H7c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1zm-4 0h1c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v13c0 .55.45 1 1 1z"],
    "hand": ["M17 5c-.42 0-.79.27-.93.64L14.38 10h-.77l1.34-6.67c.03-.1.05-.21.05-.33a.998.998 0 00-1.98-.19h-.01L11.57 10H11V1c0-.55-.45-1-1-1S9 .45 9 1v9h-.2L6.97 2.76a.997.997 0 00-1.73-.41l-.03.03c-.01.02-.02.03-.03.04-.01.02-.01.03-.02.04v.01c-.01.01-.02.02-.02.03v.01c-.02.01-.02.02-.03.03 0 0 0 .01-.01.01 0 .01 0 .02-.01.03 0 0 0 .01-.01.01 0 .01-.01.02-.01.03 0 0 0 .01-.01.01 0 .01-.01.02-.01.03 0 .01 0 .01-.01.02 0 .01-.01.02-.01.03 0 .01 0 .01-.01.02 0 .01-.01.02-.01.03v.02c0 .01 0 .02-.01.03V3c0 .05 0 .09.01.14l1.45 10.25L6 12.7v.01L3.84 9.45h-.01A.98.98 0 003 9c-.55 0-1 .45-1 1 0 .2.06.39.17.55L6 18.44C7.06 19.4 8.46 20 10 20c3.31 0 6-2.69 6-6v-1.84l.01-.03v-.06l1.94-5.75A1.003 1.003 0 0017 5z"],
    "hand-down": ["M17.68 9.84C15.91 9 14.27 6.49 13.45 4.9 12.41 2.43 12.21 0 7.87 0 5.49 0 3.95.76 3.05 2.65 2.31 4.2 2 5.48 2 9.79v.99c0 .82.69 1.48 1.54 1.48.38 0 .73-.14 1-.36.19.6.78 1.05 1.47 1.05.47 0 .89-.2 1.17-.52.26.47.77.79 1.36.79.65 0 1.2-.39 1.43-.93l.03.77v5.44c0 .48.23.91.59 1.18.21.19.5.32.85.32h.06c.83 0 1.5-.67 1.5-1.5v-8.24l.01-.67c.85.98 1.92 1.76 3.24 1.89 1.79.19 2.09-1.33 1.43-1.64z"],
    "hand-left": ["M15.1 6.54c-1.58-.81-4.09-2.46-4.94-4.23-.31-.65-1.82-.35-1.64 1.43.13 1.33.91 2.4 1.89 3.24L9.74 7H1.5C.67 7 0 7.67 0 8.5v.06c0 .36.13.64.32.85.27.36.7.59 1.18.59h5.44l.78.01c-.54.23-.93.78-.93 1.43 0 .59.32 1.1.79 1.36-.32.28-.52.7-.52 1.17 0 .69.44 1.28 1.05 1.47-.22.27-.36.62-.36 1 0 .85.66 1.54 1.48 1.54h.99c4.31 0 5.59-.31 7.14-1.05 1.89-.9 2.65-2.44 2.65-4.82-.01-4.32-2.44-4.52-4.91-5.57z"],
    "hand-right": ["M20 8.5c0-.83-.67-1.5-1.5-1.5h-8.24l-.67-.01c.98-.85 1.76-1.92 1.89-3.24.18-1.79-1.33-2.08-1.65-1.43-.84 1.76-3.35 3.41-4.93 4.23C2.43 7.59 0 7.79 0 12.13c0 2.38.76 3.92 2.65 4.82C4.2 17.69 5.48 18 9.79 18h.99c.82 0 1.48-.69 1.48-1.54 0-.38-.14-.73-.36-1 .6-.19 1.05-.78 1.05-1.47 0-.47-.2-.89-.52-1.17.47-.26.79-.77.79-1.36 0-.65-.39-1.2-.93-1.43l.77-.03h5.44c.48 0 .91-.23 1.18-.59.19-.21.32-.49.32-.85v-.03-.03z"],
    "hand-up": ["M16.46 7.74c-.38 0-.73.14-1 .36-.19-.6-.78-1.05-1.47-1.05-.47 0-.89.2-1.17.52-.26-.47-.77-.79-1.36-.79-.65 0-1.2.39-1.43.93L10 6.94V1.5c0-.48-.23-.91-.59-1.18C9.2.13 8.92 0 8.56 0H8.5C7.67 0 7 .67 7 1.5v8.24l-.01.67c-.84-.98-1.92-1.76-3.24-1.89-1.79-.18-2.08 1.33-1.43 1.65 1.77.84 3.41 3.35 4.23 4.94 1.05 2.47 1.25 4.9 5.58 4.9 2.38 0 3.92-.76 4.82-2.65.74-1.56 1.05-2.84 1.05-7.15v-.99c0-.81-.69-1.48-1.54-1.48z"],
    "header": ["M16 1c-.55 0-1 .45-1 1v7H5V2c0-.55-.45-1-1-1s-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1v-7h10v7c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1z"],
    "header-one": ["M10 0c.55 0 1 .45 1 1v14c0 .55-.45 1-1 1s-1-.45-1-1V9H2v6c0 .55-.45 1-1 1s-1-.45-1-1V1c0-.55.45-1 1-1s1 .45 1 1v6h7V1c0-.55.45-1 1-1zm7.4 10.77c.17-.2.29-.46.34-.77H19v10h-1.5v-7.11H15v-1.24c.32 0 .63-.03.93-.08.31-.06.58-.16.83-.29.26-.12.47-.3.64-.51z"],
    "header-two": ["M16.6 17.41c-.22.17-.4.36-.56.55-.16.19-.27.4-.33.61h4.28V20H14c.01-.81.18-1.52.53-2.13.35-.6.81-1.13 1.41-1.58.28-.23.58-.46.89-.68.31-.22.59-.46.85-.71.26-.26.48-.53.63-.83.16-.3.25-.64.26-1.02 0-.18-.02-.37-.06-.57-.04-.2-.11-.39-.22-.56s-.26-.31-.45-.43-.44-.18-.75-.18c-.28 0-.52.06-.71.19s-.34.3-.45.52c-.11.22-.2.48-.25.78-.05.3-.08.62-.09.97h-1.43c0-.54.07-1.04.2-1.5.13-.47.32-.87.58-1.2.26-.34.58-.6.95-.78.37-.19.81-.29 1.3-.29.54 0 .99.09 1.35.29.36.19.65.44.87.74.22.29.38.62.47.97.09.35.14.68.14 1 0 .4-.05.75-.16 1.07-.11.32-.26.61-.44.88-.19.27-.4.52-.63.74-.24.22-.48.43-.73.63s-.5.38-.75.56c-.26.17-.5.35-.71.53zM10 0c.55 0 1 .45 1 1v14c0 .55-.45 1-1 1s-1-.45-1-1V9H2v6c0 .55-.45 1-1 1s-1-.45-1-1V1c0-.55.45-1 1-1s1 .45 1 1v6h7V1c0-.55.45-1 1-1z"],
    "headset": ["M18.97 9H19A9 9 0 001 9h.03C.41 9.73 0 10.8 0 12c0 1.74.84 3.2 2 3.76V16c0 1.66 1.34 3 3 3h3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1H5c-.55 0-1-.45-1-1 .55 0 1-.45 1-1V9c0-.55-.45-1-1-1h-.92C3.57 4.61 6.47 2 10 2s6.43 2.61 6.92 6H16c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h1c1.66 0 3-1.79 3-4 0-1.2-.41-2.27-1.03-3z"],
    "heart": ["M20 6.25C20 3.35 17.65 1 14.75 1c-1.02 0-1.95.31-2.75.82v-.04c-.09.06-.17.12-.26.19-.04.03-.09.06-.14.1-.68.51-1.24 1.18-1.6 1.96-.4-.86-1.04-1.57-1.8-2.1-.04-.02-.07-.05-.1-.08a7 7 0 00-.6-.33c-.13-.04-.23-.1-.35-.15-.05-.02-.1-.05-.15-.07v.02C6.45 1.13 5.87 1 5.25 1A5.25 5.25 0 000 6.25c0 .09.01.17.01.25H0c0 .06.01.12.02.18s.01.12.02.18C.13 7.89.44 9 1.07 10.17 2.23 12.33 4.1 14.11 7 16.53v.01c.9.75 1.89 1.55 3 2.46.71-.58 1.38-1.12 2-1.63 3.48-2.86 5.64-4.78 6.93-7.18.63-1.17.94-2.27 1.03-3.3.01-.07.01-.14.02-.21 0-.06.01-.11.02-.17h-.01c0-.09.01-.17.01-.26z"],
    "heart-broken": ["M8.11 7.45C8.05 7.31 8 7.16 8 7c0-.07.03-.13.04-.19h-.02l.86-4.32A5.159 5.159 0 005.25 1 5.25 5.25 0 000 6.25c0 .09.01.17.01.25H0c0 .06.01.12.02.18s.01.12.02.18C.13 7.89.44 9 1.07 10.17c1.38 2.58 3.76 4.6 7.71 7.83l-.76-3.8h.02c-.01-.07-.04-.13-.04-.2 0-.21.08-.39.18-.54l-.02-.01 1.68-2.52-1.73-3.48zM20 6.25C20 3.35 17.65 1 14.75 1c-1.54 0-2.92.67-3.88 1.73l-.83 4.13 1.85 3.69h-.01c.07.14.12.29.12.45 0 .21-.08.39-.18.54l.02.01-1.77 2.66.81 4.07c4.16-3.39 6.63-5.45 8.05-8.1.63-1.17.94-2.27 1.03-3.3.01-.07.01-.14.02-.21 0-.06.01-.11.02-.17h-.01c0-.08.01-.16.01-.25z"],
    "heat-grid": ["M14 12h6V8h-6v4zM0 12h6V8H0v4zm1-3h4v2H1V9zm-1 7c0 .55.45 1 1 1h5v-4H0v3zM19 3h-5v4h6V4c0-.55-.45-1-1-1zm0 3h-4V4h4v2zM0 4v3h6V3H1c-.55 0-1 .45-1 1zm7 3h6V3H7v4zm7 10h5c.55 0 1-.45 1-1v-3h-6v4zm-7 0h6v-4H7v4zm1-3h4v2H8v-2zm-1-2h6V8H7v4z"],
    "heatmap": ["M6 0a6 6 0 100 12A6 6 0 106 0z",
        "M10.5 8a4.5 4.5 0 100 9 4.5 4.5 0 100-9z",
        "M16.5 7a3.5 3.5 0 100 7 3.5 3.5 0 100-7zM18 16a2 2 0 100 4 2 2 0 100-4zM2.5 14a2.5 2.5 0 100 5 2.5 2.5 0 100-5zM16.5 0a2.5 2.5 0 100 5 2.5 2.5 0 100-5z"],
    "help": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zM7.41 4.62c.65-.54 1.51-.82 2.56-.82.54 0 1.03.08 1.48.25.44.17.83.39 1.14.68.32.29.56.63.74 1.02.17.39.26.82.26 1.27s-.08.87-.24 1.23c-.16.37-.4.73-.71 1.11l-1.21 1.58c-.14.17-.28.33-.32.48-.05.15-.11.35-.11.6v.97H9v-2s.06-.58.24-.81l1.21-1.64c.25-.3.41-.56.51-.77s.14-.44.14-.67c0-.35-.11-.63-.32-.85s-.5-.33-.88-.33c-.37 0-.67.11-.89.33-.22.23-.37.54-.46.94-.03.12-.11.17-.23.16l-1.95-.29c-.12-.01-.16-.08-.14-.22.13-.93.52-1.67 1.18-2.22zM9 14h2.02L11 16H9v-2z"],
    "helper-management": ["M17 10h-3v3h3v-3zm0 4h-3v3h3v-3zm0-8h-3v3h3V6zm2-6H1C.4 0 0 .4 0 1v18c0 .5.4 1 1 1h18c.5 0 1-.5 1-1V1c0-.6-.5-1-1-1zm-1 18H2V2h16v16zm-9-4H6v3h3v-3zm4 0h-3v3h3v-3z"],
    "highlight": ["M11.22 14.09l3.03-3.03.71.71L20 6.73l-5.71-5.71-5.04 5.04.71.71-3.02 3.04 4.28 4.28zm6.8 3.91h-16c-.55 0-1 .45-1 1s.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1zm-15-1h4.04c.28 0 .53-.11.71-.3l2.02-2.02-3.44-3.45-4.04 4.04c-.18.18-.3.44-.3.71.01.57.46 1.02 1.01 1.02z"],
    "history": ["M10 0C6.71 0 3.82 1.6 2 4.05V2c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1H3.76C5.23 3.17 7.47 2 10 2c4.42 0 8 3.58 8 8s-3.58 8-8 8-8-3.58-8-8c0-.55-.45-1-1-1s-1 .45-1 1c0 5.52 4.48 10 10 10s10-4.48 10-10S15.52 0 10 0zm0 3c-.55 0-1 .45-1 1v6c0 .28.11.53.29.71l3 3a1.003 1.003 0 001.42-1.42L11 9.59V4c0-.55-.45-1-1-1z"],
    "home": ["M2 12v7c0 .55.45 1 1 1h5v-7h4v7h5c.55 0 1-.45 1-1v-7l-8-8-8 8zm17.71-2.71L17 6.59V3c0-.55-.45-1-1-1s-1 .45-1 1v1.59L10.71.3C10.53.11 10.28 0 10 0s-.53.11-.71.29l-9 9a1.003 1.003 0 001.42 1.42L10 2.41l8.29 8.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71z"],
    "horizontal-bar-chart": ["M1 1c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1zm3 5h11c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1zm8 8H4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1zm7-6H4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h15c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z"],
    "horizontal-bar-chart-asc": ["M1 9h11c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1zm0-5h9c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1zm18 12H1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h18c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zM1 14h14c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1z"],
    "horizontal-bar-chart-desc": ["M10 16H1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h9c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zm2-5H1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h11c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zm3-5H1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1zm4-5H1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1z"],
    "horizontal-distribution": ["M12 2H8c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zM1 0C.45 0 0 .45 0 1v18c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zm18 0c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "id-number": ["M2 5v10h16V5H2zm0-2h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H2c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2z",
        "M8.88 12.38c-.17-.39-1.01-.66-1.56-.9-.56-.24-.48-.39-.5-.6v-.09c.19-.17.35-.4.45-.67 0 0 0-.02.01-.02l.06-.18c.13-.03.2-.17.23-.29.03-.05.09-.18.08-.33-.04-.18-.11-.27-.2-.3v-.03c0-.24-.02-.58-.06-.81-.01-.06-.02-.12-.04-.19-.08-.27-.25-.52-.48-.7C6.63 7.09 6.3 7 6 7s-.63.09-.87.27c-.23.17-.4.42-.48.7-.02.06-.03.13-.04.19-.04.22-.06.57-.06.81V9c-.09.03-.17.12-.19.31-.01.14.05.27.08.32.03.14.1.27.23.3.02.06.03.12.06.18v.01c.11.27.27.51.47.68v.08c-.02.2.04.35-.51.6-.56.24-1.39.51-1.56.9-.19.39-.12.62-.12.62h5.98c-.01 0 .06-.23-.11-.62zM12 7h4c.55 0 1 .45 1 1s-.45 1-1 1h-4c-.55 0-1-.45-1-1s.45-1 1-1zM12 11h4c.55 0 1 .45 1 1s-.45 1-1 1h-4c-.55 0-1-.45-1-1s.45-1 1-1z"],
    "image-rotate-left": ["M10.5 13c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM14 7H1c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h13c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1zm-1 10l-5-3-1 2-2-4-3 4.5V9h11v8zm3-15h-1.59l.29-.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-2 2c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42l-.3-.29H16c1.1 0 2 .9 2 2v3c0 .55.45 1 1 1s1-.45 1-1V6c0-2.21-1.79-4-4-4z"],
    "image-rotate-right": ["M5.29 4.29a1.003 1.003 0 001.42 1.42l2-2C8.89 3.53 9 3.28 9 3c0-.28-.11-.53-.29-.71l-2-2a1.003 1.003 0 00-1.42 1.42l.3.29H4C1.79 2 0 3.79 0 6v3c0 .55.45 1 1 1s1-.45 1-1V6c0-1.1.9-2 2-2h1.59l-.3.29zM15.5 13c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zM19 7H6c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h13c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1zm-1 10l-5-3-1 2-2-4-3 4.5V9h11v8z"],
    "import": ["M9.29 15.71c.18.18.43.29.71.29s.53-.11.71-.29l5-5a1.003 1.003 0 00-1.42-1.42L11 12.59V1c0-.55-.45-1-1-1S9 .45 9 1v11.59l-3.29-3.3a1.003 1.003 0 00-1.42 1.42l5 5zM19 14c-.55 0-1 .45-1 1v3H2v-3c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1h18c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1z"],
    "inbox": ["M16.92 3.56l-.01-.02c-.16-.35-.5-.6-.91-.6H4c-.41 0-.76.25-.91.6l-.01.02L0 10.49v6.46c0 .55.45 1 1 1h18c.55 0 1-.45 1-1v-6.46l-3.08-6.93zM15 10.95c-.55 0-1 .45-1 1v1H6v-1c0-.55-.45-1-1-1H1.98l2.67-6h10.7l2.67 6H15z"],
    "inbox-filtered": ["M10.262 3l1.958 1.958v.05H4.65l-2.67 5.997H5c.55 0 1 .45 1 .999v1h8v-1c0-.55.45-1 1-1h3.02l-.635-1.426.625-.63c.354-.353.598-.8.707-1.289L20 10.545v6.456c0 .55-.45.999-1 .999H1c-.55 0-1-.45-1-1v-6.455L3.08 3.62l.01-.02c.15-.35.5-.6.91-.6h6.262zm9.088-3a.642.642 0 01.46 1.1l-3.03 3.03v2.95c0 .18-.07.34-.19.46l-1.28 1.29c-.11.1-.27.17-.45.17-.35 0-.64-.29-.64-.64V4.13L11.19 1.1a.642.642 0 01.45-1.1h7.71z"],
    "inbox-geo": ["M7.427 3a7.467 7.467 0 00-.411 2.009H4.65l-2.67 5.996H5c.55 0 1 .45 1 .999v1h8V13c.165.01.332 0 .5 0a7.48 7.48 0 005.5-2.4V17c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1v-6.455L3.08 3.62l.01-.02c.15-.35.5-.6.91-.6h3.427zm5.715-.596a.133.133 0 01-.193 0l-.374-.374a.133.133 0 010-.193.133.133 0 01.193 0l.373.374a.133.133 0 010 .193zm1.743.033c-.05 0-.088-.006-.088-.055 0-.05.038-.056.088-.056h.165c.05 0 .088.006.088.055 0 .05-.038.056-.088.056h-.165zm.539.632c-.05 0-.104-.044-.104-.094v-.23c0-.05.054-.094.104-.094.05 0 .104.044.104.094v.23c0 .05-.055.094-.104.094zm-3.575 2.304h.506l1.182 1.2c.006.005 0 .005 0 .01v.446c0 .187-.126.341-.319.341h-.098v.226c0 .192-.138.296-.33.296h.01v.792c0 .188-.181.336-.368.336s-.369-.149-.369-.335v-1.32h-.214c-.193 0-.308-.149-.308-.341V5.72c0-.192.115-.346.308-.346zM14.5 0C17.536 0 20 2.464 20 5.5S17.536 11 14.5 11A5.502 5.502 0 019 5.5C9 2.464 11.464 0 14.5 0zm0 9.9c2.431 0 4.4-1.969 4.4-4.4 0-.297-.027-.583-.099-.864h-.236c-.188 0-.336-.104-.347-.313h-.319c.11.104.231.209.231.346v.705c0 .088-.055.17-.11.23h-.022l-.011.006-.022.011-.666.643v1.21c0 .193-.104.33-.296.33h-.54c-.192 0-.319-.137-.319-.33V6.221a.915.915 0 00-.533-.518h-.671c-.192 0-.368-.143-.368-.335V4.68c0-.192.176-.346.368-.346l.193-.005.319-.32a.342.342 0 01.489 0l.319.32c.005 0 .005.005.005.005h.704c.16 0 .237-.16.341-.313v-.11l-.038.005h-.27a.159.159 0 01-.153-.16c0-.087.066-.159.154-.159h.269l.039.006V3.42s-.05-.038-.061-.038h-.302l-.067.076a.342.342 0 01-.489.011l-.066-.088h-.176l.248.259c.021.022.021.088 0 .11-.028.022-.067.028-.088.006l-.292-.276h-.127l-.363.325-.033-.006c-.038.11-.087.089-.143.089-.126 0-.225-.072-.225-.193 0-.127.099-.209.225-.209h.176v-.182c0-.088.061-.131.149-.131h.066v-.127c0-.143.149-.297.286-.297h.28c.16 0 .27-.115.27-.275V2.42c0-.016.055.017.055-.088h-.187l-.005.017-.308.33a.123.123 0 01-.177 0c-.049-.044-.049-.121 0-.171l.391-.385c.027-.022.06-.022.094-.022l.005.022h.869A4.376 4.376 0 0014.5 1.1a4.402 4.402 0 00-2.816 1.018h.583c.094 0 .165.066.165.159s-.072.16-.165.16h-.478c0 .104-.039.06-.039.066v.351h.429l.226-.252c.132-.127.346-.155.473-.022a.332.332 0 010 .473l-1.183 1.182-.011.011c-.005.005-.011.005-.016.011a.115.115 0 00-.034.022c-.005.006-.01 0-.016.006a.309.309 0 01-.176.038h-.347c-.12.104-.187.148-.187.27v.088c0 .016-.027.027-.027.043l.561.589c.06.06.055.154 0 .209a.143.143 0 01-.209 0l-.578-.578a.425.425 0 01-.082.011c-.154 0-.292-.12-.292-.274v-.358h-.016c-.104.374-.165.77-.165 1.177 0 2.431 1.969 4.4 4.4 4.4zm3.388-3.107c.077 0 .16.06.16.137v.424c0 .077-.083.137-.16.137s-.16-.06-.16-.137V6.93c0-.077.083-.137.16-.137zm-3.113-4.879c0 .187-.154.314-.335.314h-.374v.104c0 .11-.05.198-.16.198s-.16-.088-.16-.198V1.98c-.104-.022-.033-.028-.033-.055 0-.187.127-.325.314-.325h.407c.187 0 .341.127.341.314z"],
    "inbox-search": ["M7.136 3a6.327 6.327 0 00-.098 2.009H4.65l-2.67 5.996H5c.55 0 1 .45 1 .999v1h8v-1c0-.55.45-1 1-1h1.076l1.14 1.14a2.767 2.767 0 001.974.806c.282 0 .554-.042.81-.12V17c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1v-6.455L3.08 3.62l.01-.02c.15-.35.5-.6.91-.6h3.136zm3.244 1.33c0 1.62 1.31 2.93 2.93 2.93s2.93-1.31 2.93-2.93-1.31-2.93-2.93-2.93-2.93 1.31-2.93 2.93zm6.47 2.43l2.89 2.85c.13.15.22.35.23.56 0 .43-.35.78-.78.78-.23 0-.42-.08-.56-.22l-2.87-2.87c-.17.1-.33.2-.51.29-.03.01-.06.03-.09.04-.18.07-.35.15-.55.21-.19.06-.37.11-.57.14-.05.01-.1.02-.14.02-.2.03-.39.05-.6.05A4.3 4.3 0 019 4.31C9 1.93 10.93.01 13.3 0c2.37 0 4.3 1.93 4.3 4.3 0 .21-.02.4-.05.6-.01.05-.01.09-.02.14-.04.2-.08.38-.14.58-.05.19-.13.36-.21.54-.01.03-.03.06-.04.09-.08.18-.18.34-.29.51z"],
    "inbox-update": ["M10.083 3a6.04 6.04 0 00.001 2.009H4.65l-2.67 5.996H5c.55 0 1 .45 1 .999v1h8v-1c0-.55.45-1 1-1h3.02l-.53-1.19a5.97 5.97 0 001.824-.811L20 10.545v6.456c0 .55-.45.999-1 .999H1c-.55 0-1-.45-1-1v-6.455L3.08 3.62l.01-.02c.15-.35.5-.6.91-.6h6.083zM16 8a4 4 0 110-8 4 4 0 010 8z"],
    "info-sign": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zM9 4h2v2H9V4zm4 12H7v-1h2V8H8V7h3v8h2v1z"],
    "inheritance": ["M6 10c0 2.21 1.79 4 4 4h6.59l-2.29-2.29A.965.965 0 0114 11a1.003 1.003 0 011.71-.71l4 4c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-4 4a1.003 1.003 0 01-1.42-1.42l2.3-2.29H10c-3.31 0-6-2.69-6-6H1a1 1 0 01-1-1V1a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1H6zM2 2v6h6V2H2z"],
    "inner-join": ["M8.7 4.7C7.4 6 6.5 7.9 6.5 10s.8 4 2.2 5.3c-.8.5-1.7.7-2.7.7-3.3 0-6-2.7-6-6s2.7-6 6-6c1 0 1.9.2 2.7.7zm-3.34 9.25c-.55-1.2-.86-2.54-.86-3.95s.31-2.75.86-3.95a4.001 4.001 0 000 7.9zM14 4c3.3 0 6 2.7 6 6s-2.7 6-6 6c-1 0-1.9-.2-2.7-.7 1.3-1.3 2.2-3.2 2.2-5.3s-.8-3.9-2.2-5.3C12.1 4.2 13 4 14 4zm.6 2.05c.55 1.2.86 2.54.86 3.95s-.31 2.75-.86 3.95c1.9-.31 3.36-1.96 3.36-3.95S16.5 6.36 14.6 6.05zM10 5.5C8.8 6.7 8 8.2 8 10s.8 3.3 2 4.4c1.2-1.1 2-2.7 2-4.5s-.8-3.3-2-4.4z"],
    "insert": ["M19 0H1C.4 0 0 .4 0 1v18c0 .5.4 1 1 1h18c.5 0 1-.5 1-1V1c0-.6-.5-1-1-1zm-1 18H2V2h16v16zM5 11h4v4c0 .6.4 1 1 1s1-.4 1-1v-4h4c.6 0 1-.4 1-1s-.4-1-1-1h-4V5c0-.6-.4-1-1-1s-1 .4-1 1v4H5c-.6 0-1 .4-1 1s.4 1 1 1z"],
    "intersection": ["M13 4c-1.31 0-2.51.43-3.5 1.14A5.977 5.977 0 006 4c-3.31 0-6 2.69-6 6s2.69 6 6 6c1.31 0 2.51-.43 3.5-1.14.99.71 2.19 1.14 3.5 1.14 3.31 0 6-2.69 6-6s-2.69-6-6-6zm-4.93 9.41c-.61.37-1.31.59-2.07.59-2.21 0-4-1.79-4-4s1.79-4 4-4c.76 0 1.46.22 2.07.59C7.4 7.56 7 8.73 7 10s.4 2.44 1.07 3.41zM13 14c-.76 0-1.46-.22-2.07-.59C11.6 12.44 12 11.27 12 10s-.4-2.44-1.07-3.41C11.54 6.22 12.24 6 13 6c2.21 0 4 1.79 4 4s-1.79 4-4 4z"],
    "ip-address": ["M6 3.66C6 5.69 10 11 10 11s4-5.31 4-7.34C13.99 1.64 12.21 0 10 0S6 1.64 6 3.66zM8 4c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zM14 13.5V13h-4v1h3v2h-2v1h3v-3.5zM3 12h14c.55 0 1 .45 1 1v6c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1v-6c0-.55.45-1 1-1zm4 1v6h1v-6H7zm3 1v5h1v-5h-1z"],
    "issue": ["M10 20C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm1-2H9v-2h2v2zm0-3H9V4h2v9z"],
    "issue-closed": ["M15.364 5.9a.997.997 0 01-.707-.293l-2.121-2.122a1 1 0 111.414-1.414l1.414 1.414L18.192.657a1 1 0 011.414 1.414l-3.535 3.536a.997.997 0 01-.707.292zM11.78.157a3.002 3.002 0 00-1.437 1.85 8 8 0 107.1 5.055l.042-.042 1.472-1.472A9.959 9.959 0 0120 10c0 5.523-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0c.608 0 1.202.054 1.78.158zM11 16H9v-2h2v2zm0-3H9V4h2v9z"],
    "issue-new": ["M13.167.512a2.98 2.98 0 00-.131.524c-.74.115-1.39.5-1.848 1.052a8 8 0 106.724 6.724 2.997 2.997 0 001.052-1.848 2.98 2.98 0 00.524-.13A9.99 9.99 0 0120 10c0 5.523-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0a9.99 9.99 0 013.167.512zM11 16H9v-2h2v2zm0-3H9V4h2v9zm6-10h1.5a1 1 0 010 2H17v1.5a1 1 0 01-2 0V5h-1.5a1 1 0 010-2H15V1.5a1 1 0 012 0V3z"],
    "italic": ["M11.7 4H14c.6 0 1-.4 1-1s-.4-1-1-1H7c-.6 0-1 .4-1 1s.4 1 1 1h2.2L7.3 15H5c-.6 0-1 .4-1 1s.4 1 1 1h7c.6 0 1-.4 1-1s-.4-1-1-1H9.8l1.9-11z"],
    "join-table": ["M19 6h-4V2c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h4v4c0 .55.45 1 1 1h13c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1zM6 12H2V9h4v3zm0-4H2V5h4v3zm7 9H7v-3h6v3zm0-4H7V9h6v4zm0-5H7V5h6v3zm5 9h-4v-3h4v3zm0-4h-4v-3h4v3z"],
    "key": ["M14 0c-3.31 0-6 2.69-6 6 0 1.11.32 2.14.85 3.03L.44 17.44a1.498 1.498 0 102.12 2.12l.79-.79.94.94c.18.18.43.29.71.29s.53-.11.71-.29l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-.94-.94 3.2-3.2A5.9 5.9 0 0014 12c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 9c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"],
    "key-backspace": ["M19 3H7c-.28 0-.53.11-.71.29l-6 6C.11 9.47 0 9.72 0 10c0 .28.11.53.29.71l6 6c.18.18.43.29.71.29h12c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm-2.29 9.29a1.003 1.003 0 01-1.42 1.42L13 11.41l-2.29 2.29c-.18.19-.43.3-.71.3a1.003 1.003 0 01-.71-1.71l2.3-2.29-2.3-2.29a1.003 1.003 0 011.42-1.42L13 8.59l2.29-2.29c.18-.19.43-.3.71-.3a1.003 1.003 0 01.71 1.71L14.41 10l2.3 2.29z"],
    "key-command": ["M15.5 12H14V8h1.5C17.43 8 19 6.43 19 4.5S17.43 1 15.5 1 12 2.57 12 4.5V6H8V4.5C8 2.57 6.43 1 4.5 1S1 2.57 1 4.5 2.57 8 4.5 8H6v4H4.5C2.57 12 1 13.57 1 15.5S2.57 19 4.5 19 8 17.43 8 15.5V14h4v1.5c0 1.93 1.57 3.5 3.5 3.5s3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0-9c.83 0 1.5.67 1.5 1.5S16.33 6 15.5 6 14 5.33 14 4.5 14.67 3 15.5 3zm-11 14c-.83 0-1.5-.67-1.5-1.5S3.67 14 4.5 14s1.5.67 1.5 1.5S5.33 17 4.5 17zm0-11C3.67 6 3 5.33 3 4.5S3.67 3 4.5 3 6 3.67 6 4.5 5.33 6 4.5 6zm7.5 6H8V8h4v4zm3.5 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"],
    "key-control": ["M16.71 7.29l-6-6C10.53 1.11 10.28 1 10 1s-.53.11-.71.29l-6 6a1.003 1.003 0 001.42 1.42L10 3.41l5.29 5.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71z"],
    "key-delete": ["M19.71 9.29l-6-6A.997.997 0 0013 3H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.28 0 .53-.11.71-.29l6-6c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71zm-9 3a1.003 1.003 0 01-1.42 1.42L7 11.41 4.71 13.7c-.18.19-.43.3-.71.3a1.003 1.003 0 01-.71-1.71L5.59 10l-2.3-2.29a1.003 1.003 0 011.42-1.42L7 8.59 9.29 6.3c.18-.19.43-.3.71-.3a1.003 1.003 0 01.71 1.71L8.41 10l2.3 2.29z"],
    "key-enter": ["M18 2c-.55 0-1 .45-1 1v5c0 2.21-1.79 4-4 4H4.41L6.7 9.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-4 4c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l4 4a1.003 1.003 0 001.42-1.42L4.41 14H13c3.31 0 6-2.69 6-6V3c0-.55-.45-1-1-1z"],
    "key-escape": ["M2 8c.55 0 1-.45 1-1V4.41l6.29 6.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L4.41 3H7c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1v5c0 .55.45 1 1 1zm9-6.94V3.1c3.39.49 6 3.38 6 6.9 0 3.87-3.13 7-7 7-3.52 0-6.41-2.61-6.9-6H1.06c.5 4.5 4.31 8 8.94 8a9 9 0 009-9c0-4.63-3.5-8.44-8-8.94z"],
    "key-option": ["M13 4h6c.55 0 1-.45 1-1s-.45-1-1-1h-6c-.55 0-1 .45-1 1s.45 1 1 1zm6 12h-4.42L6.87 2.5l-.02.01A.977.977 0 006 2H1c-.55 0-1 .45-1 1s.45 1 1 1h4.42l7.71 13.5.01-.01c.18.3.49.51.86.51h5c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "key-shift": ["M17.74 10.35l-6.99-8.01-.01.01C10.56 2.14 10.3 2 10 2s-.56.14-.74.35l-.01-.01-7 8 .01.01A.95.95 0 002 11c0 .55.45 1 1 1h3v5c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-5h3c.55 0 1-.45 1-1 0-.25-.1-.48-.26-.65z"],
    "key-tab": ["M19 13H4.41l2.29-2.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L2 12.59V10c0-.55-.45-1-1-1s-1 .45-1 1v8c0 .55.45 1 1 1s1-.45 1-1v-2.59l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L4.41 15H19c.55 0 1-.45 1-1s-.45-1-1-1zm0-12c-.55 0-1 .45-1 1v2.59L14.71 1.3A.965.965 0 0014 1a1.003 1.003 0 00-.71 1.71L15.59 5H1c-.55 0-1 .45-1 1s.45 1 1 1h14.59L13.3 9.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L18 7.41V10c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1z"],
    "known-vehicle": ["M19 4a.997.997 0 00-.707.293L14 8.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a.997.997 0 001.414 0l5-5A1 1 0 0019 4zm-2.048 7.291c.011.072.048.134.048.209a1.5 1.5 0 01-1.5 1.5c-.225 0-.433-.057-.624-.145-.279.085-.57.145-.876.145a2.99 2.99 0 01-2.121-.879l-3-3 .007-.007A3.027 3.027 0 018.184 8H4V7l1-3h10l.19.568 1.307-1.308c-.336-.356-.758-.658-1.165-.772 0 0-1.74-.488-5.332-.488s-5.332.488-5.332.488c-.67.188-1.424.864-1.674 1.502L2.99 4H3L2 7H1a1 1 0 000 2h.333l-.28.84L1 10v7.5a1.5 1.5 0 103 0V17h12v.5a1.5 1.5 0 003 0V10l-.19-.568-1.858 1.86zM4.5 13a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"],
    "label": ["M3 12h14v-1H3v1zm11-9H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V9l-6-6zm4 12H2V5h11v3H3v1h10v1h5v5zm-4-6V5l4 4h-4z"],
    "layer": ["M19.5 9.1l-9-5c-.2-.1-.3-.1-.5-.1s-.3 0-.5.1l-9 5c-.3.2-.5.5-.5.9s.2.7.5.9l9 5c.2.1.3.1.5.1s.3 0 .5-.1l9-5c.3-.2.5-.5.5-.9s-.2-.7-.5-.9z"],
    "layers": ["M.5 6.9l9 5c.2.1.3.1.5.1s.3 0 .5-.1l9-5c.3-.2.5-.5.5-.9s-.2-.7-.5-.9l-9-5c-.2-.1-.3-.1-.5-.1s-.3 0-.5.1l-9 5c-.3.2-.5.5-.5.9s.2.7.5.9z",
        "M19 9c-.2 0-.3 0-.5.1L10 13.9 1.5 9.1C1.3 9 1.2 9 1 9c-.6 0-1 .4-1 1 0 .4.2.7.5.9l9 5c.2.1.3.1.5.1s.3 0 .5-.1l9-5c.3-.2.5-.5.5-.9 0-.6-.4-1-1-1z",
        "M19 13c-.2 0-.3 0-.5.1L10 17.9l-8.5-4.7c-.2-.2-.3-.2-.5-.2-.6 0-1 .4-1 1 0 .4.2.7.5.9l9 5c.2.1.3.1.5.1s.3 0 .5-.1l9-5c.3-.2.5-.5.5-.9 0-.6-.4-1-1-1z"],
    "layout": ["M18 6c-1.1 0-2 .9-2 2 0 .37.11.71.28 1.01l-2.27 2.27c-.3-.17-.64-.28-1.01-.28-.93 0-1.71.64-1.93 1.5H8.93c-.22-.86-1-1.5-1.93-1.5-.37 0-.71.11-1.01.28L3.72 9.01C3.89 8.71 4 8.37 4 8c0-.34-.09-.66-.24-.94l3.66-3.38c.31.2.68.32 1.08.32 1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2c0 .34.09.66.24.94L3.08 6.32C2.77 6.12 2.4 6 2 6 .9 6 0 6.9 0 8s.9 2 2 2c.37 0 .71-.11 1.01-.28l2.27 2.27c-.17.3-.28.64-.28 1.01s.11.71.28 1.01l-2.27 2.27C2.71 16.11 2.37 16 2 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2c0-.37-.11-.71-.28-1.01l2.27-2.27c.3.17.64.28 1.01.28.93 0 1.71-.64 1.93-1.5h2.14c.22.86 1 1.5 1.93 1.5 1.1 0 2-.9 2-2 0-.37-.11-.71-.28-1.01l2.27-2.27c.3.17.64.28 1.01.28 1.1 0 2-.9 2-2s-.9-2-2-2z"],
    "layout-auto": ["M18 13c-.53 0-1.01.21-1.37.55L11.9 10.6c.06-.19.1-.39.1-.6s-.04-.41-.1-.6l4.72-2.95c.37.34.85.55 1.38.55 1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2c0 .21.04.41.1.6l-4.73 2.96c-.24-.23-.54-.4-.87-.48V3.93c.86-.22 1.5-1 1.5-1.93 0-1.1-.9-2-2-2S8 .9 8 2c0 .93.64 1.71 1.5 1.93v4.14c-.33.09-.63.26-.87.48L3.9 5.6c.06-.19.1-.39.1-.6 0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2c.53 0 1.01-.21 1.37-.55L8.1 9.4c-.06.19-.1.39-.1.6s.04.41.1.6l-4.72 2.95C3.01 13.21 2.53 13 2 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2c0-.21-.04-.41-.1-.6l4.73-2.96c.24.23.54.4.87.48v4.14C8.64 16.29 8 17.07 8 18c0 1.1.9 2 2 2s2-.9 2-2c0-.93-.64-1.71-1.5-1.93v-4.14c.33-.09.63-.26.87-.48l4.73 2.96c-.06.18-.1.38-.1.59 0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2z"],
    "layout-balloon": ["M18 16c-.14 0-.28.02-.42.05l-1.73-3.45c.69-.45 1.14-1.22 1.14-2.1s-.46-1.65-1.14-2.1l1.73-3.45c.14.03.28.05.42.05 1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2c0 .6.27 1.13.69 1.5l-1.77 3.54c-.14-.02-.28-.04-.42-.04a2.5 2.5 0 00-2.45 2h-4.1A2.5 2.5 0 005.5 8c-.14 0-.28.02-.42.04L3.31 4.5C3.73 4.13 4 3.6 4 3c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2c.14 0 .28-.02.42-.05L4.14 8.4C3.46 8.85 3 9.62 3 10.5s.46 1.65 1.14 2.1l-1.73 3.45A1.84 1.84 0 002 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2c0-.6-.27-1.13-.69-1.5l1.77-3.54c.14.02.28.04.42.04a2.5 2.5 0 002.45-2h4.1a2.5 2.5 0 002.45 2c.14 0 .28-.02.42-.04l1.77 3.54c-.42.37-.69.9-.69 1.5 0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2z"],
    "layout-circle": ["M18.3 8c-.2-.9-.6-1.7-1.1-2.5.2-.3.3-.7.3-1 0-1.1-.9-2-2-2-.4 0-.7.1-1 .3-.8-.5-1.6-.8-2.5-1.1-.1-1-1-1.7-2-1.7S8.2.8 8 1.7c-.9.3-1.7.6-2.5 1.1-.3-.2-.7-.3-1-.3-1.1 0-2 .9-2 2 0 .4.1.7.3 1-.5.8-.8 1.6-1.1 2.5C.8 8.2 0 9 0 10s.8 1.8 1.7 2c.2.9.6 1.7 1.1 2.5-.2.3-.3.7-.3 1 0 1.1.9 2 2 2 .4 0 .7-.1 1-.3.8.5 1.6.8 2.5 1.1.1 1 1 1.7 2 1.7s1.8-.8 2-1.7c.9-.2 1.7-.6 2.5-1.1.3.2.7.3 1 .3 1.1 0 2-.9 2-2 0-.4-.1-.7-.3-1 .5-.8.8-1.6 1.1-2.5 1-.1 1.7-1 1.7-2s-.8-1.8-1.7-2zm-1.8 5.8c-.3-.2-.6-.3-1-.3-1.1 0-2 .9-2 2 0 .4.1.7.3 1-.6.3-1.2.6-1.9.8-.3-.7-1-1.3-1.9-1.3-.8 0-1.6.5-1.9 1.3-.7-.2-1.3-.4-1.9-.8.2-.3.3-.6.3-1 0-1.1-.9-2-2-2-.4 0-.7.1-1 .3-.3-.6-.6-1.2-.8-1.9.8-.3 1.3-1.1 1.3-1.9s-.5-1.6-1.2-1.8c.2-.7.4-1.3.8-1.9.3.2.6.3 1 .3 1.1 0 2-.9 2-2 0-.4-.1-.7-.3-1 .6-.3 1.2-.6 1.9-.8.2.7 1 1.2 1.8 1.2s1.6-.5 1.9-1.3c.7.2 1.3.4 1.9.8-.2.3-.3.6-.3 1 0 1.1.9 2 2 2 .4 0 .7-.1 1-.3.3.6.6 1.2.8 1.9-.8.3-1.3 1.1-1.3 1.9s.5 1.6 1.2 1.8c-.1.7-.4 1.4-.7 2z"],
    "layout-grid": ["M2 0a2 2 0 100 4 2 2 0 100-4zM10 0a2 2 0 100 4 2 2 0 100-4zM18 0a2 2 0 100 4 2 2 0 100-4zM18 8a2 2 0 100 4 2 2 0 100-4zM18 16a2 2 0 100 4 2 2 0 100-4zM10 16a2 2 0 100 4 2 2 0 100-4zM2 16a2 2 0 100 4 2 2 0 100-4zM2 8a2 2 0 100 4 2 2 0 100-4zM10 8a2 2 0 100 4 2 2 0 100-4z"],
    "layout-group-by": ["M2 2a2 2 0 100 4 2 2 0 100-4zM18 0a2 2 0 100 4 2 2 0 100-4zM18 8a2 2 0 100 4 2 2 0 100-4zM18 16a2 2 0 100 4 2 2 0 100-4zM2 14a2 2 0 100 4 2 2 0 100-4zM2 8a2 2 0 100 4 2 2 0 100-4zM13 12a2 2 0 100 4 2 2 0 100-4zM13 4a2 2 0 100 4 2 2 0 100-4z"],
    "layout-hierarchy": ["M18.5 16.07v-4.14c.86-.22 1.5-1 1.5-1.93 0-1.1-.9-2-2-2-.93 0-1.71.64-1.93 1.5h-4.14c-.18-.7-.73-1.25-1.43-1.43V3.93c.86-.22 1.5-1 1.5-1.93 0-1.1-.9-2-2-2S8 .9 8 2c0 .93.64 1.71 1.5 1.93v4.14c-.7.18-1.25.73-1.43 1.43H3.93C3.71 8.64 2.93 8 2 8c-1.1 0-2 .9-2 2 0 .93.64 1.71 1.5 1.93v4.14c-.86.22-1.5 1-1.5 1.93 0 1.1.9 2 2 2s2-.9 2-2c0-.93-.64-1.71-1.5-1.93v-4.14c.7-.18 1.25-.73 1.43-1.43h4.14c.18.7.73 1.25 1.43 1.43v4.14c-.86.22-1.5 1-1.5 1.93 0 1.1.9 2 2 2s2-.9 2-2c0-.93-.64-1.71-1.5-1.93v-4.14c.7-.18 1.25-.73 1.43-1.43h4.14c.18.7.73 1.25 1.43 1.43v4.14c-.86.22-1.5 1-1.5 1.93 0 1.1.9 2 2 2s2-.9 2-2c0-.93-.64-1.71-1.5-1.93z"],
    "layout-linear": ["M16.5 7a2.5 2.5 0 00-2.45 2h-2.1a2.5 2.5 0 00-4.9 0h-2.1a2.5 2.5 0 100 1h2.1a2.5 2.5 0 004.9 0h2.1a2.5 2.5 0 102.45-3z"],
    "layout-skew-grid": ["M2 0a2 2 0 100 4 2 2 0 100-4zM18 0a2 2 0 100 4 2 2 0 100-4zM18 8a2 2 0 100 4 2 2 0 100-4zM18 16a2 2 0 100 4 2 2 0 100-4zM2 16a2 2 0 100 4 2 2 0 100-4zM2 8a2 2 0 100 4 2 2 0 100-4zM10 12a2 2 0 100 4 2 2 0 100-4zM10 4a2 2 0 100 4 2 2 0 100-4z"],
    "layout-sorted-clusters": ["M2 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM2 0C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm16 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"],
    "learning": ["M10.551 1.127a1.256 1.256 0 00-1.102 0L.456 5.89c-.608.309-.608.913 0 1.222l8.993 4.762c.334.17.767.17 1.102 0l8.992-4.762c.61-.309.61-.913 0-1.222l-8.992-4.762z",
        "M18 6.5l.016 4.514c.002.548.447.99.994.99a.99.99 0 00.99-.99V6.5h-2zM3.366 10.033l6.401 3.358a.5.5 0 00.465 0l6.406-3.358a.25.25 0 01.366.221v5.109a.25.25 0 01-.139.224l-6.64 3.302a.5.5 0 01-.446 0l-6.64-3.302A.25.25 0 013 15.363v-5.108a.25.25 0 01.366-.222z"],
    "left-join": ["M8.7 4.7C7.4 6 6.5 7.9 6.5 10s.8 4 2.2 5.3c-.8.5-1.7.7-2.7.7-3.3 0-6-2.7-6-6s2.7-6 6-6c1 0 1.9.2 2.7.7zM14 4c3.3 0 6 2.7 6 6s-2.7 6-6 6c-1 0-1.9-.2-2.7-.7 1.3-1.3 2.2-3.2 2.2-5.3s-.8-3.9-2.2-5.3C12.1 4.2 13 4 14 4zm.6 2.05c.55 1.2.86 2.54.86 3.95s-.31 2.75-.86 3.95c1.9-.31 3.36-1.96 3.36-3.95S16.5 6.36 14.6 6.05zM10 5.5C8.8 6.7 8 8.2 8 10s.8 3.3 2 4.4c1.2-1.1 2-2.7 2-4.5s-.8-3.3-2-4.4z"],
    "less-than": ["M7.162 10l9.154 3.052a1 1 0 01-.632 1.897l-12-4c-.912-.304-.912-1.594 0-1.897l12-4a1 1 0 01.632 1.897L7.162 10z"],
    "less-than-or-equal-to": ["M16.316 11.051L7.162 8l9.154-3.051a1 1 0 10-.632-1.898l-12 4c-.912.304-.912 1.594 0 1.898l12 4a1 1 0 10.632-1.898zM16 15H4a1 1 0 100 2h12a1 1 0 100-2z"],
    "lifesaver": ["M8.143 14.644L7.028 17.43c.919.368 1.922.57 2.972.57s2.053-.202 2.972-.57l-1.115-2.786A4.986 4.986 0 0110 15a4.986 4.986 0 01-1.857-.356zm-2.787-2.787A4.986 4.986 0 015 10c0-.656.126-1.283.356-1.857L2.57 7.028A7.978 7.978 0 002 10c0 1.05.202 2.053.57 2.972l2.786-1.115zm2.787-6.5A4.986 4.986 0 0110 5c.656 0 1.283.126 1.857.356l1.115-2.786A7.978 7.978 0 0010 2c-1.05 0-2.053.202-2.972.57l1.115 2.786zm6.5 2.786c.23.574.357 1.2.357 1.857 0 .656-.126 1.283-.356 1.857l2.786 1.115c.368-.919.57-1.922.57-2.972s-.202-2.053-.57-2.972l-2.786 1.115zM10 13a3 3 0 100-6 3 3 0 000 6zm0 7C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10z"],
    "lightbulb": ["M6.33 13.39c0 .34.27.61.6.61h6.13c.33 0 .6-.27.6-.61C14.03 9.78 16 9.4 16 6.09 16 2.72 13.31 0 10 0S4 2.72 4 6.09c0 3.31 1.97 3.69 2.33 7.3zM13 15H7c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1zm-1 3H8c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "link": ["M10.85 11.98l-4.44 4.44-1 1c-.36.36-.86.58-1.41.58-1.1 0-2-.9-2-2 0-.55.22-1.05.59-1.41l5.44-5.44C7.69 9.06 7.36 9 7 9c-1.11 0-2.09.46-2.82 1.18l-.01-.01-3 3 .01.01C.46 13.91 0 14.89 0 16c0 2.21 1.79 4 4 4 1.11 0 2.09-.46 2.82-1.18l.01.01 3-3-.01-.01C10.54 15.09 11 14.11 11 13c0-.36-.06-.69-.15-1.02zM20 4c0-2.21-1.79-4-4-4-1.11 0-2.09.46-2.82 1.18l-.01-.01-3 3 .01.01C9.46 4.91 9 5.89 9 7c0 .36.06.69.15 1.02l4.44-4.44 1-1c.36-.36.86-.58 1.41-.58 1.1 0 2 .9 2 2 0 .55-.22 1.05-.59 1.41l-5.44 5.44c.34.09.67.15 1.03.15 1.11 0 2.09-.46 2.82-1.18l.01.01 3-3-.01-.01C19.54 6.09 20 5.11 20 4zM5 14a1.003 1.003 0 001.71.71l8-8a1.003 1.003 0 00-1.42-1.42l-2 2-2 2-2 2-2 2c-.18.18-.29.43-.29.71z"],
    "list": ["M1.03 1C.46 1 0 1.46 0 2.03v.95C0 3.54.46 4 1.03 4h17.95C19.54 4 20 3.54 20 2.97v-.94C20 1.46 19.54 1 18.97 1H1.03zM0 17.97C0 18.54.46 19 1.03 19h17.95c.56 0 1.03-.46 1.03-1.03v-.95c0-.56-.46-1.03-1.03-1.03H1.03C.46 16 0 16.46 0 17.03v.94zM0 12.97C0 13.54.46 14 1.03 14h17.95c.56 0 1.03-.46 1.03-1.03v-.95c0-.56-.46-1.03-1.03-1.03H1.03C.46 11 0 11.46 0 12.03v.94zM0 7.97C0 8.54.46 9 1.03 9h17.95C19.54 9 20 8.54 20 7.97v-.94C20 6.46 19.54 6 18.97 6H1.03C.46 6 0 6.46 0 7.03v.94z"],
    "list-columns": ["M0 2.973v-.936C0 1.468.46 1.01 1.029 1H7.97C8.541 1 9 1.468 9 2.027v.946C9 3.542 8.53 4 7.971 4H1.03C.459 4 0 3.542 0 2.973zm0 5v-.936C0 6.468.46 6.01 1.029 6H7.97C8.541 6 9 6.468 9 7.027v.946C9 8.542 8.53 9 7.971 9H1.03C.459 9 0 8.542 0 7.973zm0 5v-.936C0 11.468.46 11.01 1.029 11H7.97C8.541 11 9 11.468 9 12.027v.946C9 13.542 8.53 14 7.971 14H1.03C.459 14 0 13.542 0 12.973zm0 5v-.936C0 16.468.46 16.01 1.029 16H7.97C8.541 16 9 16.468 9 17.027v.946C9 18.542 8.53 19 7.971 19H1.03C.459 19 0 18.542 0 17.973zm11-15v-.936c0-.569.46-1.027 1.029-1.037h6.942C19.541 1 20 1.468 20 2.027v.946C20 3.542 19.53 4 18.971 4H12.03C11.459 4 11 3.542 11 2.973zm0 5v-.936c0-.569.46-1.027 1.029-1.037h6.942C19.541 6 20 6.468 20 7.027v.946C20 8.542 19.53 9 18.971 9H12.03C11.459 9 11 8.542 11 7.973zm0 5v-.936c0-.569.46-1.027 1.029-1.037h6.942c.57 0 1.029.468 1.029 1.027v.946c0 .569-.47 1.027-1.029 1.027H12.03c-.57 0-1.029-.458-1.029-1.027zm0 5v-.936c0-.569.46-1.027 1.029-1.037h6.942c.57 0 1.029.468 1.029 1.027v.946c0 .569-.47 1.027-1.029 1.027H12.03c-.57 0-1.029-.458-1.029-1.027z"],
    "list-detail-view": ["M8 6H1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1zm0 5H1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h7c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zm0 5H1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h7c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zM8 1H1c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm11 0h-7c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1z"],
    "locate": ["M10 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 1h-1.07c-.45-3.61-3.32-6.45-6.93-6.91V1c0-.55-.45-1-1-1S9 .45 9 1v1.09C5.39 2.55 2.52 5.39 2.07 9H1c-.55 0-1 .45-1 1s.45 1 1 1h1.07c.45 3.61 3.32 6.45 6.93 6.91V19c0 .55.45 1 1 1s1-.45 1-1v-1.09c3.61-.46 6.48-3.29 6.93-6.91H19c.55 0 1-.45 1-1s-.45-1-1-1zm-4 2h.9a5.98 5.98 0 01-4.9 4.91V15c0-.55-.45-1-1-1s-1 .45-1 1v.91A5.98 5.98 0 014.1 11H5c.55 0 1-.45 1-1s-.45-1-1-1h-.9A5.98 5.98 0 019 4.09V5c0 .55.45 1 1 1s1-.45 1-1v-.91A5.98 5.98 0 0115.9 9H15c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "lock": ["M15.93 9H14V4.99c0-2.21-1.79-4-4-4s-4 1.79-4 4V9H3.93c-.55 0-.93.44-.93.99v8c0 .55.38 1.01.93 1.01h12c.55 0 1.07-.46 1.07-1.01v-8c0-.55-.52-.99-1.07-.99zM8 9V4.99c0-1.1.9-2 2-2s2 .9 2 2V9H8z"],
    "log-in": ["M19 0h-8c-.55 0-1 .45-1 1s.45 1 1 1h7v16h-7c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-4 10c0-.28-.11-.53-.29-.71l-5-5a1.003 1.003 0 00-1.42 1.42L11.59 9H1c-.55 0-1 .45-1 1s.45 1 1 1h10.59L8.3 14.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l5-5c.18-.18.29-.43.29-.71z"],
    "log-out": ["M19.71 9.29l-5-5a1.003 1.003 0 00-1.42 1.42L16.59 9H6c-.55 0-1 .45-1 1s.45 1 1 1h10.59l-3.29 3.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l5-5c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71zM9 18H2V2h7c.55 0 1-.45 1-1s-.45-1-1-1H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "manual": ["M20 1.1a.976.976 0 00-.83-.88C15.15-.43 12.07.34 10 2.5 7.93.34 4.85-.43.84.22.37.3.03.67 0 1.1v15.01c0 .07 0 .14.01.21.09.52.61.88 1.15.79 3.85-.62 6.4.16 8 2.46.02.02.03.04.05.07.02.02.04.04.06.07l.01.01a1.07 1.07 0 00.28.19c.01 0 .01.01.02.01.03.01.07.03.1.04.01 0 .02.01.04.01.03.01.07.02.1.02.01 0 .02 0 .04.01H10c.04 0 .09 0 .13-.01.01 0 .03 0 .04-.01.03-.01.06-.01.1-.02.01 0 .03-.01.04-.01.03-.01.07-.02.1-.04.01 0 .02-.01.03-.01.07-.03.13-.07.19-.11.01 0 .01-.01.02-.01.02-.02.04-.03.06-.05.01-.01.02-.02.03-.02l.05-.05c.01-.01.02-.02.02-.03.01-.02.02-.03.04-.05 1.61-2.3 4.15-3.09 8-2.46.54.09 1.06-.26 1.15-.79-.01-.05 0-.09 0-.13V1.1zM9 16.63c-1.78-1.31-4.12-1.83-7-1.55V2c3.26-.37 5.51.39 7 2.35v12.28zm9-1.56c-2.88-.28-5.22.24-7 1.55V4.34c1.49-1.96 3.74-2.71 7-2.35v13.08z"],
    "manually-entered-data": ["M1 12h4.34l2-2H1c-.55 0-1 .45-1 1s.45 1 1 1zm16.77-3.94l1.65-1.65c.36-.36.58-.86.58-1.41 0-1.1-.9-2-2-2-.55 0-1.05.22-1.41.59l-1.65 1.65 2.83 2.82zM1 4h12.34l2-2H1c-.55 0-1 .45-1 1s.45 1 1 1zM0 15c0 .55.45 1 1 1h.34l2-2H1c-.55 0-1 .45-1 1zm1-7h8.34l2-2H1c-.55 0-1 .45-1 1s.45 1 1 1zm18 2h-.34l-2 2H19c.55 0 1-.45 1-1s-.45-1-1-1zm0 4h-4.34l-2 2H19c.55 0 1-.45 1-1s-.45-1-1-1zM4 19l4.41-1.59-2.81-2.79L4 19zM14.23 5.94l-7.65 7.65 2.83 2.83 7.65-7.65-2.83-2.83z"],
    "map": ["M19.54 4.18l.01-.02-6-4-.01.02C13.39.08 13.21 0 13 0s-.39.08-.54.18l-.01-.02L7 3.8 1.55.17l-.01.01A.969.969 0 001 0C.45 0 0 .45 0 1v14c0 .35.19.64.46.82l-.01.02 6 4 .01-.02c.15.1.33.18.54.18s.39-.08.54-.18l.01.02L13 16.2l5.45 3.63.01-.02c.15.11.33.19.54.19.55 0 1-.45 1-1V5c0-.35-.19-.64-.46-.82zM6 17.13l-4-2.67V2.87l4 2.67v11.59zm6-2.67l-4 2.67V5.54l4-2.67v11.59zm6 2.67l-4-2.67V2.87l4 2.67v11.59z"],
    "map-create": ["M18 9.22v7.91l-4-2.67V9.22c-.61-.55-1-1.33-1-2.22-.35 0-.69-.07-1-.18v7.65l-4 2.67V5.54l2.02-1.35c0-.06-.02-.13-.02-.19 0-1.66 1.34-3 3-3 0-.34.07-.66.17-.97C13.12.02 13.06 0 13 0c-.21 0-.39.08-.54.18l-.01-.02L7 3.8 1.55.17l-.01.01A.969.969 0 001 0C.45 0 0 .45 0 1v14c0 .35.19.64.46.82l-.01.02 6 4 .01-.02c.15.1.33.18.54.18s.39-.08.54-.18l.01.02L13 16.2l5.45 3.63.01-.02c.15.11.33.19.54.19.55 0 1-.45 1-1V6.82c-.31.11-.65.18-1 .18 0 .89-.39 1.67-1 2.22zM6 17.13l-4-2.67V2.87l4 2.67v11.59zM12 4c0 .55.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V5h2c.55 0 1-.45 1-1s-.45-1-1-1h-2V1c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1z"],
    "map-marker": ["M9.98 0c-3.87 0-7 2.98-7 6.67 0 3.68 7 13.33 7 13.33s7-9.65 7-13.33c0-3.68-3.14-6.67-7-6.67zm0 10c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"],
    "maximize": ["M19 0h-5c-.55 0-1 .45-1 1s.45 1 1 1h2.59L11.3 7.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L18 3.41V6c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zM8 11c-.28 0-.53.11-.71.29L2 16.59V14c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1H3.41l5.29-5.29c.19-.18.3-.43.3-.71 0-.55-.45-1-1-1z"],
    "media": ["M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-5-2 2-4-5-4 8V4h16v11z"],
    "menu": ["M1 6h18c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1s.45 1 1 1zm18 3H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zm0 5H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "menu-closed": ["M8 6h11c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zM4 6c-.28 0-.53.11-.71.29l-3 3C.11 9.47 0 9.72 0 10c0 .28.11.53.29.71l3 3A1.003 1.003 0 005 13V7c0-.55-.45-1-1-1zm15 8H8c-.55 0-1 .45-1 1s.45 1 1 1h11c.55 0 1-.45 1-1s-.45-1-1-1zm0-5H8c-.55 0-1 .45-1 1s.45 1 1 1h11c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "menu-open": ["M12 9H1c-.55 0-1 .45-1 1s.45 1 1 1h11c.55 0 1-.45 1-1s-.45-1-1-1zm0 5H1c-.55 0-1 .45-1 1s.45 1 1 1h11c.55 0 1-.45 1-1s-.45-1-1-1zm0-10H1c-.55 0-1 .45-1 1s.45 1 1 1h11c.55 0 1-.45 1-1s-.45-1-1-1zm7.71 5.29l-3-3A1.003 1.003 0 0015 7v6a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"],
    "merge-columns": ["M6.71 6.29a1.003 1.003 0 00-1.42 1.42L6.59 9H2V2h5v2.18c.42.15.8.39 1.11.7l.01-.01.88.89V1c0-.55-.45-1-1-1H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h7c.55 0 1-.45 1-1v-4.76l-.88.88-.01-.01c-.31.31-.69.56-1.11.71V18H2v-7h4.59L5.3 12.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-3-3zM19 0h-7c-.55 0-1 .45-1 1v4.76l.88-.88.01.01c.31-.31.69-.55 1.11-.7V2h5v7h-4.59l1.29-1.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-3 3c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l3 3a1.003 1.003 0 001.42-1.42L13.41 11H18v7h-5v-2.18c-.42-.15-.8-.39-1.11-.7l-.01.01-.88-.89V19c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "merge-links": ["M10 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8-5c-.93 0-1.71.64-1.93 1.5H14V4c0-2.21-1.79-4-4-4S6 1.79 6 4v5.5H3.93C3.71 8.64 2.93 8 2 8c-1.1 0-2 .9-2 2s.9 2 2 2c.93 0 1.71-.64 1.93-1.5H6V16c0 2.21 1.79 4 4 4s4-1.79 4-4v-5.5h2.07c.22.86 1 1.5 1.93 1.5 1.1 0 2-.9 2-2s-.9-2-2-2zm-5 8c0 1.66-1.34 3-3 3s-3-1.34-3-3V4c0-1.66 1.34-3 3-3s3 1.34 3 3v12zM10 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"],
    "minimize": ["M8 11H3c-.55 0-1 .45-1 1s.45 1 1 1h2.59L.3 18.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L7 14.41V17c0 .55.45 1 1 1s1-.45 1-1v-5c0-.55-.45-1-1-1zM20 1a1.003 1.003 0 00-1.71-.71L13 5.59V3c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1h-2.59l5.29-5.29c.19-.18.3-.43.3-.71z"],
    "minus": ["M16 9H4c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "mobile-phone": ["M15 0H5c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-5 19c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4-3H6V3h8v13z"],
    "mobile-video": ["M19 5c-.28 0-.53.11-.71.29L15 8.59V5c0-.55-.45-1-1-1H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h13c.55 0 1-.45 1-1v-3.59l3.29 3.29c.18.19.43.3.71.3.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"],
    "moon": ["M19 14.15A9.94 9.94 0 019.94 20C4.45 20 0 15.55 0 10.06 0 6.03 2.4 2.56 5.85 1a9.811 9.811 0 00-.88 4.09c0 5.49 4.45 9.94 9.94 9.94 1.46 0 2.84-.31 4.09-.88z"],
    "more": ["M3.5 8a2.5 2.5 0 100 5 2.5 2.5 0 100-5zM17.5 8a2.5 2.5 0 100 5 2.5 2.5 0 100-5zM10.5 8a2.5 2.5 0 100 5 2.5 2.5 0 100-5z"],
    "mountain": ["M20 16H4l7-11h1l2 2h1l5 9zm-4-5l-1.5-3h-1l-1-1-1-1L8 11.5l3-1.5 1 1 1-1 3 1zM8.055 8L2.79 16H0l7-8h1.055z"],
    "move": ["M19.71 9.29l-3-3a1.003 1.003 0 00-1.42 1.42L16.59 9H11V3.41l1.29 1.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-3-3C10.53.11 10.28 0 10 0s-.53.11-.71.29l-3 3a1.003 1.003 0 001.42 1.42L9 3.41V9H3.41L4.7 7.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-3 3C.11 9.47 0 9.72 0 10c0 .28.11.53.29.71l3 3a1.003 1.003 0 001.42-1.42L3.41 11H9v5.59L7.71 15.3A.965.965 0 007 15a1.003 1.003 0 00-.71 1.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3a1.003 1.003 0 00-1.42-1.42L11 16.59V11h5.59l-1.29 1.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71z"],
    "mugshot": ["M19 0H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 18h-.07c-.05-.2-.12-.42-.22-.67-.46-1.05-2.68-1.75-4.16-2.4-1.48-.65-1.28-1.05-1.33-1.59-.01-.07-.01-.15-.01-.23.51-.45.92-1.07 1.19-1.78 0 0 .01-.04.02-.05.06-.15.11-.32.15-.48.34-.07.54-.44.61-.78.08-.14.23-.48.2-.87-.05-.5-.25-.73-.47-.82v-.09c0-.63-.06-1.55-.17-2.15-.02-.17-.06-.33-.11-.5a3.67 3.67 0 00-1.29-1.86C11.7 3.25 10.81 3 10.02 3s-1.68.25-2.31.73c-.61.47-1.07 1.13-1.29 1.86-.05.16-.09.33-.11.5-.12.6-.17 1.51-.17 2.14v.08c-.24.09-.44.32-.49.83-.04.39.12.73.2.87.08.35.28.72.63.78.04.17.09.33.15.48 0 .01.01.02.01.03l.01.01c.27.72.7 1.35 1.22 1.8 0 .07-.01.14-.01.21-.05.54.1.94-1.38 1.59-1.48.65-3.7 1.35-4.16 2.4-.12.27-.18.49-.23.69H2V2h16v16z"],
    "multi-select": ["M19 3H7c-.55 0-1 .45-1 1v1h12v6h1c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm-6 6H1c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zm-1 6H2v-4h10v4zm4-9H4c-.55 0-1 .45-1 1v1h12v6h1c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1z"],
    "music": ["M19 0c-.08 0-.16.03-.24.05V.03l-12 3v.02C6.33 3.16 6 3.53 6 4v11.35c-.59-.22-1.27-.35-2-.35-2.21 0-4 1.12-4 2.5S1.79 20 4 20c1.94 0 3.55-.86 3.92-2H8V7.78l10-2.5v7.07c-.59-.22-1.27-.35-2-.35-2.21 0-4 1.12-4 2.5s1.79 2.5 4 2.5c1.94 0 3.55-.86 3.92-2H20V1c0-.55-.45-1-1-1z"],
    "new-drawing": ["M18.7 13.7c.5 0 1 .4 1 1 0 .257-.073.44-.22.614l-.08.086-4 4c-.2.2-.4.3-.7.3-.6 0-1-.5-1-1 0-.257.073-.44.22-.614L14 18l4-4c.2-.2.4-.3.7-.3zM1.8 0l8.378 2.982A3.003 3.003 0 0013 7a3.003 3.003 0 003.877 2.87l.723 2.53.049.06a.41.41 0 01.051.24c0 .167-.07.403-.208.593l-.092.107-4 4c-.2.2-.4.3-.7.3-.075 0-.15-.056-.225-.084L12.4 17.6l-7-2-.112-.042c-.223-.094-.431-.244-.542-.45L4.7 15 0 1.8l.5-.6L7 7.7c-.2.3-.3.6-.3 1 0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2a1.68 1.68 0 00-.871.22L7.7 7 1.2.5l.6-.5zM16 0c.55 0 1 .45 1 1v2h2c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .432-.278.803-.664.941l-.01.004A.989.989 0 0116 8c-.55 0-1-.45-1-1V5h-2c-.55 0-1-.45-1-1l.007-.116C12.065 3.388 12.489 3 13 3h2V1c0-.55.45-1 1-1z"],
    "new-grid-item": ["M8 0H1C.45 0 0 .45 0 1v7c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm0 11H1c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h7c.55 0 1-.45 1-1v-7c0-.55-.45-1-1-1zm6 7h-1v-1c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1zm5-7h-2c-.55 0-1 .45-1 1s.45 1 1 1h1v1c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1zm0-11h-7c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-5 11h-2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1s1-.45 1-1v-1h1c.55 0 1-.45 1-1s-.45-1-1-1zm5 5c-.55 0-1 .45-1 1v1h-1c-.55 0-1 .45-1 1s.45 1 1 1h2c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1z"],
    "new-layer": ["M11.513 2.663A2 2 0 0013 6h1v1a2 2 0 104 0v-.733l1.5.833c.3.2.5.5.5.9s-.2.7-.5.9l-9 5c-.2.1-.3.1-.5.1s-.3 0-.5-.1l-9-5C.2 8.7 0 8.4 0 8s.2-.7.5-.9l9-5c.2-.1.3-.1.5-.1s.3 0 .5.1l1.013.563zM17 3h2a1 1 0 010 2h-2v2a1 1 0 01-2 0V5h-2a1 1 0 010-2h2V1a1 1 0 012 0v2z"],
    "new-layers": ["M17 3h2a1 1 0 010 2h-2v2a1 1 0 01-2 0V5h-2a1 1 0 010-2h2V1a1 1 0 012 0v2zm-1.252 5.984L10.5 11.9c-.2.1-.3.1-.5.1s-.3 0-.5-.1l-9-5C.2 6.7 0 6.4 0 6s.2-.7.5-.9l9-5c.2-.1.3-.1.5-.1s.3 0 .5.1L13.92 2H13a2 2 0 100 4h1v1a2 2 0 001.748 1.984zm2.07-1.15C17.935 7.58 18 7.298 18 7V6h1c.353 0 .684-.091.972-.251.018.078.028.162.028.251 0 .4-.2.7-.5.9l-1.682.934zM19 9c.6 0 1 .4 1 1 0 .4-.2.7-.5.9l-9 5c-.2.1-.3.1-.5.1s-.3 0-.5-.1l-9-5c-.3-.2-.5-.5-.5-.9 0-.6.4-1 1-1 .2 0 .3 0 .5.1l8.5 4.8 8.5-4.8c.2-.1.3-.1.5-.1zm0 4c.6 0 1 .4 1 1 0 .4-.2.7-.5.9l-9 5c-.2.1-.3.1-.5.1s-.3 0-.5-.1l-9-5c-.3-.2-.5-.5-.5-.9 0-.6.4-1 1-1 .2 0 .3 0 .5.2l8.5 4.7 8.5-4.8c.2-.1.3-.1.5-.1z"],
    "new-link": ["M14.5 12a2.5 2.5 0 00-2.45 2h-7.1a2.5 2.5 0 100 1h7.1a2.5 2.5 0 102.45-3zM19 5h-2V3c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V7h2c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "new-object": ["M12 4c0 .6.4 1 1 1h2v2c0 .6.4 1 1 1 .5 0 1-.4 1-1V5h2c.5 0 1-.4 1-1s-.5-1-1-1h-2V1c0-.6-.5-1-1-1-.6 0-1 .4-1 1v2h-2c-.6 0-1 .5-1 1zm7 3c0 1.7-1.3 3-3 3s-3-1.3-3-3c-1.7 0-3-1.3-3-3s1.3-3 3-3c0-.2 0-.4.1-.5-1-.3-2-.5-3.1-.5C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10c0-1.1-.2-2.1-.5-3H19z"],
    "new-person": ["M11.41 15.92c-1.46-.65-1.26-1.05-1.31-1.59-.01-.07-.01-.15-.01-.23.5-.45.91-1.07 1.18-1.78 0 0 .01-.04.02-.05.06-.15.11-.32.15-.48.33-.07.53-.44.6-.78.08-.14.23-.48.2-.87-.05-.5-.24-.73-.47-.82v-.09c0-.63-.06-1.55-.17-2.15-.02-.17-.06-.33-.11-.5-.22-.73-.67-1.4-1.27-1.86C9.58 4.25 8.7 4 7.92 4c-.78 0-1.66.25-2.28.73-.61.47-1.06 1.13-1.27 1.86-.05.16-.08.33-.11.5-.12.6-.18 1.51-.18 2.14v.08c-.23.09-.43.32-.48.83-.04.39.12.73.2.87.08.35.28.72.62.78.04.17.09.33.15.48 0 .01.01.02.01.03l.01.01c.27.72.69 1.35 1.21 1.8 0 .07-.01.14-.01.21-.05.54.1.94-1.36 1.59-1.46.65-3.66 1.35-4.11 2.4C-.14 19.38.04 20 .04 20h15.75s.18-.62-.27-1.67c-.45-1.06-2.65-1.75-4.11-2.41zM18.87 3h-2V1c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V5h2c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "new-prescription": ["M11.95 10.23c.16-.18.22-.22.46-.22h1.48c.25 0 .47.08.59.33.1.2.09.41-.05.66l-2.71 3.58L14.88 19c.13.21.16.46.03.69-.12.21-.34.31-.57.31H12.7c-.31 0-.56-.17-.7-.44l-1.9-2.67-1.93 2.68c-.15.27-.42.43-.73.43H5.98c-.25 0-.47-.08-.59-.33-.1-.2-.09-.41.05-.66l3.09-4.35L4.26 9H3v4.32c0 .41-.3.69-.7.69H.7c-.41 0-.7-.28-.7-.69V.69C0 .28.3 0 .7 0h4.42c.71 0 1.36.1 1.94.3.59.2 1.11.49 1.54.87.44.38.78.84 1.02 1.39.25.54.37 1.13.37 1.77 0 1.01-.28 1.88-.84 2.6-.43.54-1.35 1.29-2 1.59l3.09 3.94 1.71-2.23zM4.71 6.04c.71 0 1.45-.16 1.81-.46.33-.28.5-.69.5-1.25s-.17-.97-.5-1.25c-.35-.3-1.1-.46-1.81-.46h-1.7v3.42h1.7zM19 3c.55 0 1 .45 1 1s-.45 1-1 1h-2v2c0 .55-.45 1-1 1s-1-.45-1-1V5h-2c-.55 0-1-.45-1-1s.45-1 1-1h2V1c0-.55.45-1 1-1s1 .45 1 1v2h2z"],
    "new-text-box": ["M19 3h-2V1c0-.55-.45-1-1-1s-1 .45-1 1v2h-2c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V5h2c.55 0 1-.45 1-1s-.45-1-1-1zM5 7.5v1c0 .28.22.5.5.5s.5-.22.5-.5V8h2v7h-.5c-.28 0-.5.22-.5.5s.22.5.5.5h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H9V8h2v.5c0 .28.22.5.5.5s.5-.22.5-.5v-1c0-.28-.22-.5-.5-.5h-6c-.28 0-.5.22-.5.5zM16 9c-.55 0-1 .45-1 1v8H2V5h8c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1v15c0 .55.45 1 1 1h15c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1z"],
    "ninja": ["M20 6s-2.98 2.43-6.12 2.19C13.52 5.31 12.05 0 6 0c0 0 2.41 2.99 2.16 6.12C5.27 6.49 0 7.97 0 14c0 0 2.98-2.43 6.11-2.19C6.47 14.69 7.94 20 14 20c0 0-2.42-2.99-2.16-6.13C14.73 13.51 20 12.02 20 6zm-10 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"],
    "not-equal-to": ["M9.487 7l.532-3.196a1 1 0 011.962.392L11.513 7H16a1 1 0 010 2h-4.82l-.333 2H16a1 1 0 010 2h-5.487l-.532 3.196a1 1 0 01-1.962-.392L8.487 13H4a1 1 0 010-2h4.82l.333-2H4a1 1 0 110-2h5.487z"],
    "notifications": ["M10 20c1.1 0 2-.9 2-2H8c0 1.1.9 2 2 2zm7-5c-.55 0-1-.45-1-1V8c0-2.61-1.67-4.81-4-5.63V2c0-1.1-.9-2-2-2S8 .9 8 2v.37C5.67 3.19 4 5.39 4 8v6c0 .55-.45 1-1 1s-1 .45-1 1 .45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "notifications-updated": ["M10 20c1.1 0 2-.9 2-2H8c0 1.1.9 2 2 2zm2-17.834A2.994 2.994 0 008 4.99c0 .808.319 1.557.876 2.114l2.97 2.99a2.99 2.99 0 004.154.072V14c0 .55.45 1 1 1s1 .45 1 1-.45 1-1 1H3c-.55 0-1-.45-1-1s.45-1 1-1 1-.45 1-1V8c0-2.61 1.67-4.81 4-5.63V2c0-1.1.9-2 2-2s2 .9 2 2v.166zm1.26 6.514l-2.97-2.99a.973.973 0 01-.29-.7c0-.55.44-1 .99-1 .27 0 .52.11.7.29l2.28 2.28 4.27-4.27a.99.99 0 01.7-.29c.55 0 1 .45 1 1 0 .28-.11.53-.3.7l-4.98 4.98a.99.99 0 01-1.4 0z"],
    "numbered-list": ["M1.74 9.01h1.27V1h-.95c-.04.24-.12.45-.26.62-.13.17-.29.3-.47.41-.19.11-.4.18-.63.23-.23.04-.46.07-.71.07v1.03h1.75v5.65zm.43 7.93c.18-.14.37-.28.58-.43.21-.14.42-.29.63-.45.21-.16.41-.33.61-.5.2-.18.37-.38.52-.59.15-.21.28-.45.37-.7.09-.25.14-.54.14-.85 0-.25-.04-.52-.12-.8-.08-.28-.21-.54-.39-.78-.19-.24-.43-.44-.73-.59-.3-.17-.68-.25-1.12-.25-.41 0-.77.08-1.08.23-.32.16-.58.37-.8.64-.22.27-.38.59-.49.96-.11.37-.16.77-.16 1.21h1.19c.01-.28.03-.53.08-.77s.12-.45.21-.62c.09-.18.22-.31.38-.42.16-.1.35-.15.59-.15.26 0 .47.05.63.14.16.09.29.21.38.35.09.14.15.29.18.45.03.16.05.31.05.45-.01.31-.08.58-.22.81-.14.24-.32.45-.53.66-.22.2-.45.39-.71.57-.26.18-.51.36-.74.54-.5.36-.89.78-1.17 1.27-.3.47-.45 1.04-.46 1.69H5v-1.14H1.43c.05-.17.14-.33.27-.49.13-.15.29-.3.47-.44zM18 4.02H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-.56-.45-1-1-1zm0 9H8c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-1c0-.56-.45-1-1-1z"],
    "numerical": ["M2.39 5.75c-.17.21-.38.39-.63.52s-.52.23-.83.29c-.3.05-.61.08-.93.08v1.24h2.49V15h1.49V4.98H2.73c-.05.31-.17.57-.34.77zm17.2 4.71c-.27-.44-.65-.71-1.14-.82v-.02c.42-.16.72-.43.92-.79.2-.36.29-.79.29-1.27 0-.42-.08-.8-.23-1.12-.15-.33-.36-.59-.62-.8-.26-.21-.55-.37-.87-.48-.32-.11-.65-.16-.98-.16-.43 0-.82.08-1.16.25-.34.16-.63.39-.87.69-.24.29-.43.64-.57 1.04-.14.4-.22.83-.23 1.3h1.39c-.01-.25.02-.49.07-.72.06-.23.14-.44.26-.63s.27-.34.45-.45c.18-.11.39-.17.63-.17.39 0 .71.12.96.37s.37.58.37.99c0 .29-.05.54-.16.74-.11.2-.25.36-.43.47-.18.11-.38.19-.61.24-.23.05-.46.06-.68.05v1.17c.28-.01.55 0 .81.03s.5.1.71.21c.21.11.38.28.51.5.13.22.2.52.2.89 0 .55-.16.97-.47 1.27-.31.3-.7.45-1.17.45-.55 0-.95-.19-1.23-.58-.27-.39-.4-.88-.38-1.46h-1.39c.01.5.08.96.21 1.38.13.41.32.77.57 1.06.25.29.56.52.93.68.37.16.8.24 1.3.24.41 0 .79-.07 1.16-.21.37-.14.69-.33.96-.58.28-.25.5-.56.66-.92a3 3 0 00.24-1.23c0-.64-.14-1.17-.41-1.61zM8.58 12.41c.21-.18.45-.36.7-.53.25-.18.5-.36.75-.56.25-.2.49-.41.73-.63.23-.22.44-.47.63-.74.18-.27.33-.56.44-.88.11-.32.16-.67.16-1.07 0-.32-.05-.65-.14-1-.09-.35-.25-.68-.47-.97-.22-.3-.51-.55-.87-.74-.36-.2-.81-.29-1.35-.29-.49 0-.93.1-1.3.29-.37.18-.69.44-.95.78-.26.33-.45.73-.58 1.2-.13.46-.2.96-.2 1.5h1.43c.01-.35.04-.67.09-.97.05-.3.14-.56.25-.78.11-.22.26-.39.45-.52s.43-.19.71-.19c.31 0 .56.06.75.18.19.12.34.26.45.43.11.17.18.36.22.56.04.2.06.39.06.57-.01.38-.1.72-.26 1.02-.15.3-.37.57-.63.83-.26.25-.54.49-.85.71-.31.22-.61.45-.89.68-.6.45-1.06.98-1.41 1.58-.35.61-.52 1.32-.53 2.13h6.01v-1.43H7.69c.06-.21.17-.42.33-.61s.34-.38.56-.55z"],
    "office": ["M19 6h-5V1c0-.55-.45-1-1-1H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h4v-6h4v6h10c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1zM6 12H2V8h4v4zm0-6H2V2h4v4zm6 6H8V8h4v4zm0-6H8V2h4v4zm6 11h-4v-3h4v3zm0-5h-4V8h4v4z"],
    "offline": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zM7 18l2-7H5l8-9-2 7h4l-8 9z"],
    "oil-field": ["M19 17.99h-1.36l-4.35-9.57 2.91-.86 1.66 4.1c.11.27.43.4.72.31.12-.04.22-.11.28-.2.06-.11 1.47-2.08 1.05-5.6C19.79 5.12 19.3 0 16.01 0 14.89.01 13.99.83 14 1.84c0 .19.04.38.1.56l1.34 3.31L.72 10.03v.02c-.41.12-.72.49-.72.94 0 .55.45 1 1 1 .1 0 .19-.03.28-.06v.02l2-.59 1.47 6.63H3c-.55 0-1 .45-1 1s.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1zM5.2 10.8l3.95-1.16-2.83 6.22L5.2 10.8zm2.35 7.19l3.95-8.68 3.95 8.68h-7.9z"],
    "one-column": ["M14.94 0h-4c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-8 6c-.28 0-.53.11-.71.29l-3 3c-.18.18-.29.43-.29.71s.11.53.29.71l3 3A1.003 1.003 0 007.94 13V7c0-.55-.45-1-1-1z"],
    "outdated": ["M10 0c5.52 0 10 4.48 10 10s-4.48 10-10 10S0 15.52 0 10c0-.55.45-1 1-1s1 .45 1 1c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8C7.47 2 5.22 3.17 3.76 5H5c.55 0 1 .45 1 1s-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1s1 .45 1 1v2.05C3.82 1.6 6.71 0 10 0zm1 16H9v-2h2v2zm0-3H9V4h2v9z"],
    "page-layout": ["M19 1H1c-.55 0-1 .45-1 1v16c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zM7 17H2V8h5v9zm11 0H8V8h10v9zm0-10H2V3h16v4z"],
    "panel-stats": ["M1 1h18a1 1 0 011 1v15a1 1 0 01-1 1H1a1 1 0 01-1-1V2a1 1 0 011-1zm1 2v13h16V3H2zm9 0h1v13h-1V3zm2 7h3.952v1H13v-1zm0 2h3.952v1H13v-1zm0 2h3.952v1H13v-1zm0-6h3.952v1H13V8zm0-2h3.952v1H13V6zm0-2h3.952v1H13V4z"],
    "panel-table": ["M19 1H1c-.6 0-1 .4-1 1v15c0 .6.4 1 1 1h18c.6 0 1-.4 1-1V2c0-.6-.4-1-1-1zm-9 11H7V9h3v3zm0-4H7V5h3v3zm-8 8V3h4v13H2zm5 0v-3h3v3H7zm11 0h-7v-3h7v3zm0-4h-7V9h7v3zm0-4h-7V5h7v3z"],
    "paperclip": ["M18.35 2.67A5.664 5.664 0 0014.33 1c-1.44 0-2.89.56-3.99 1.67l-9.16 9.27C.4 12.73 0 13.78 0 14.83s.39 2.1 1.18 2.9c.78.79 1.82 1.18 2.85 1.18 1.04 0 2.07-.39 2.87-1.2l9.14-9.27c.96-.96.96-2.5.02-3.45-.94-.95-2.49-.96-3.44 0l-7.59 7.69c-.31.32-.3.83.01 1.14.31.31.81.31 1.13.02l7.59-7.69c.31-.31.84-.31 1.13-.02.31.31.31.85 0 1.16l-9.14 9.27c-.93.95-2.54.93-3.45.02-.94-.95-.92-2.55.02-3.49l9.16-9.25c1.55-1.56 4.18-1.59 5.72-.03 1.56 1.57 1.55 4.26 0 5.82l-8.89 9.02c-.3.31-.3.81.01 1.11.3.3.79.31 1.1.01v.01l8.91-9.02A5.645 5.645 0 0020 6.73c0-1.48-.55-2.94-1.65-4.06z"],
    "paragraph": ["M16.5 1H7C4.2 1 2 3.2 2 6s2.2 5 5 5v6.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V4h2v13.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V4h1.5c.8 0 1.5-.7 1.5-1.5S17.3 1 16.5 1z"],
    "path": ["M18 0H2C.9 0 0 .9 0 2s.9 2 2 2h7v4H4c-1.1 0-2 .9-2 2s.9 2 2 2h5v4H6c-1.1 0-2 .9-2 2s.9 2 2 2h8c1.1 0 2-.9 2-2s-.9-2-2-2h-3v-4h5c1.1 0 2-.9 2-2s-.9-2-2-2h-5V4h7c1.1 0 2-.9 2-2s-.9-2-2-2z"],
    "path-search": ["M4 7c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm15 11.69l-5-2.5v-3.63c-.32.11-.66.22-1 .29v3.32l-6 2.57v-7.25c-.36-.27-.69-.57-1-.9v8.1l-5-2.5V10c.55 0 1-.45 1-1s-.45-1-1-1V1.31l3.43 1.71c.11-.31.24-.62.39-.92L.72.05A.545.545 0 00.5 0C.22 0 0 .22 0 .5v16c0 .2.12.36.28.44l6 3c.07.04.14.06.22.06.07 0 .14-.01.2-.04l6.79-2.91 5.79 2.9c.07.03.14.05.22.05.28 0 .5-.22.5-.5v-4.21c-.31.13-.64.21-1 .21v3.19zM10 5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm3-1c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6.72-.94l-1.43-.72c.2.43.36.89.48 1.36l.23.11V5.5c-.55 0-1 .45-1 1s.45 1 1 1v1.96l1 1V3.5c0-.2-.12-.36-.28-.44zm-3.69 5.56c.14-.21.27-.42.38-.65.02-.04.04-.07.05-.11.11-.22.2-.45.28-.69v-.01c.07-.24.13-.48.17-.73l.03-.17c.04-.25.06-.5.06-.76C17 2.46 14.54 0 11.5 0S6 2.46 6 5.5 8.46 11 11.5 11c.26 0 .51-.02.76-.06l.17-.03c.25-.04.49-.1.73-.17h.01c.24-.08.47-.17.69-.28.04-.02.07-.03.11-.05.23-.11.44-.24.65-.38l.18.18 3.5 3.5c.17.18.42.29.7.29a1.003 1.003 0 00.71-1.71l-3.68-3.67zm-4.53.88c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"],
    "pause": ["M7 3H4c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zm9 0h-3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "people": ["M16.94 17a4.92 4.92 0 00-.33-1.06c-.45-.97-1.37-1.52-3.24-2.3-.17-.07-.76-.31-.77-.32-.1-.04-.2-.08-.28-.12.05-.14.04-.29.06-.45 0-.05.01-.11.01-.16-.25-.21-.47-.48-.65-.79.22-.34.41-.71.56-1.12l.04-.11c-.01.02-.01.02-.02.08l.06-.15c.36-.26.6-.67.72-1.13.18-.37.29-.82.25-1.3-.05-.5-.21-.92-.47-1.22-.02-.53-.06-1.11-.12-1.59.38-.17.83-.26 1.24-.26.59 0 1.26.19 1.73.55.46.35.8.85.97 1.4.04.13.07.25.08.38.08.45.13 1.14.13 1.61v.07c.16.07.31.24.35.62.02.29-.09.55-.15.65-.05.26-.2.53-.46.59-.03.12-.07.25-.11.36-.01.01-.01.04-.01.04-.2.53-.51 1-.89 1.34 0 .06 0 .12.01.17.04.41-.11.71 1 1.19 1.1.5 2.77 1.01 3.13 1.79.34.79.2 1.25.2 1.25h-3.04zm-5.42-3.06c1.47.66 3.7 1.35 4.18 2.39.45 1.05.27 1.67.27 1.67H.04s-.19-.62.27-1.67c.46-1.05 2.68-1.75 4.16-2.4 1.48-.65 1.33-1.05 1.38-1.59 0-.07.01-.14.01-.21-.52-.45-.95-1.08-1.22-1.8l-.01-.01c0-.01-.01-.02-.01-.03-.07-.15-.12-.32-.16-.49-.34-.06-.54-.43-.62-.78-.08-.14-.24-.48-.2-.87.05-.51.26-.74.49-.83v-.08c0-.64.05-1.55.17-2.15a3.648 3.648 0 011.4-2.36C6.32 2.25 7.21 2 8 2s1.68.25 2.31.73a3.63 3.63 0 011.4 2.36c.11.6.17 1.52.17 2.15v.09c.22.09.42.32.47.82.03.39-.12.73-.2.87-.07.34-.27.71-.61.78-.04.16-.09.33-.15.48-.01.01-.02.05-.02.05-.27.71-.68 1.33-1.19 1.78 0 .08 0 .16.01.23.05.55-.15.95 1.33 1.6z"],
    "percentage": ["M15 10c-1.66 0-3 1.34-3 3v2c0 1.66 1.34 3 3 3s3-1.34 3-3v-2c0-1.66-1.34-3-3-3zm1 5c0 .55-.45 1-1 1s-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2zM8 7V5c0-1.66-1.34-3-3-3S2 3.34 2 5v2c0 1.66 1.34 3 3 3s3-1.34 3-3zM4 7V5c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1zm11-4a1.003 1.003 0 00-1.88-.48L5.14 16.49a1.003 1.003 0 101.74.99l7.99-13.97c.08-.15.13-.32.13-.51z"],
    "person": ["M19.61 17.91c-.57-1.32-3.35-2.19-5.19-3.01-1.85-.82-1.59-1.31-1.66-1.99-.01-.09-.01-.19-.02-.29.63-.56 1.15-1.33 1.49-2.22 0 0 .02-.05.02-.06.07-.19.13-.39.19-.6.42-.09.67-.55.76-.98.1-.17.29-.6.25-1.08-.06-.62-.31-.91-.59-1.03v-.11c0-.79-.07-1.93-.22-2.68A4.55 4.55 0 0012.9.92C12.11.32 11 0 10.01 0s-2.1.32-2.89.92a4.55 4.55 0 00-1.74 2.94c-.14.75-.22 1.89-.22 2.68v.1c-.29.11-.55.4-.61 1.04-.04.48.15.91.25 1.08.1.44.35.91.79.98.05.21.12.41.19.6 0 .01.01.03.01.04l.01.02c.34.91.87 1.69 1.52 2.25 0 .09-.01.18-.02.26-.07.68.13 1.17-1.72 1.99S.96 16.59.39 17.91C-.18 19.23.05 20 .05 20h19.9s.23-.77-.34-2.09z"],
    "phone": ["M19.91 15.51c-.08-.08-4.21-2.5-4.35-2.57a.876.876 0 00-.4-.1c-.19 0-.42.13-.71.4-.28.27-1.17 1.49-1.43 1.76s-.48.4-.65.4c-.08 0-.19-.02-.32-.07s-1.45-.73-4.2-3.15-3.11-4-3.13-4.44c0-.17.13-.39.4-.65.28-.25.57-.51.89-.74.32-.24.61-.5.88-.78s.4-.52.4-.71c0-.13-.03-.27-.1-.4C7.12 4.32 4.62.19 4.53.1c-.19-.18-.92-.1-1.29.1C.25 1.82 0 4 .05 4.86c.05.89.61 5.58 5.2 9.93 5.7 5.41 9.66 5.2 9.92 5.2.87 0 3.52-.48 4.65-3.19.16-.38.31-1.07.09-1.29z"],
    "pie-chart": ["M9 .98c-4.5.5-8 4.31-8 8.94 0 4.97 4.03 9.04 9 9.04 4.63 0 8.44-3.96 8.94-7.96H9V.98z",
        "M10-.08V10h10C20 4 15.52-.08 10-.08z"],
    "pin": ["M11.77 1.16c-.81.81-.74 2.28.02 3.76L6.1 8.71c-2.17-1.46-4.12-2-4.94-1.18l4.95 4.95-4.95 6.36 6.36-4.95 4.95 4.95c.82-.82.27-2.77-1.19-4.94l3.8-5.69c1.47.76 2.94.84 3.76.02l-7.07-7.07z"],
    "pivot": ["M5.83 9.75L.29 15.29a1.003 1.003 0 001.42 1.42l5.54-5.54c-.57-.37-1.05-.85-1.42-1.42zM19 11c-.55 0-1 .45-1 1v1.59l-3.83-3.83c-.37.56-.85 1.04-1.41 1.41L16.59 15H15c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1zm-5-4c0-2.21-1.79-4-4-4S6 4.79 6 7s1.79 4 4 4 4-1.79 4-4zm-4 2c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"],
    "pivot-table": ["M3 5H1c-.55 0-1 .45-1 1v13c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm0-5H1C.45 0 0 .45 0 1v2c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm13.71 5.29C16.53 5.11 16.28 5 16 5s-.53.11-.71.29l-3 3a1.003 1.003 0 001.42 1.42L15 8.41V11c0 2.21-1.79 4-4 4H8.41l1.29-1.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-3 3c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l3 3a1.003 1.003 0 001.42-1.42L8.41 17H11c3.31 0 6-2.69 6-6V8.41l1.29 1.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-3-3zM19 0H6c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h13c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "play": ["M16 10c0-.36-.2-.67-.49-.84l.01-.01-10-6-.01.01A.991.991 0 005 3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1 .19 0 .36-.07.51-.16l.01.01 10-6-.01-.01c.29-.17.49-.48.49-.84z"],
    "plus": ["M16 9h-5V4c0-.55-.45-1-1-1s-1 .45-1 1v5H4c-.55 0-1 .45-1 1s.45 1 1 1h5v5c0 .55.45 1 1 1s1-.45 1-1v-5h5c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "polygon-filter": ["M18 7c-.27 0-.52.05-.75.15l-6.28-4.88c.01-.09.03-.18.03-.27 0-1.1-.9-2-2-2S7 .9 7 2c0 .06.01.12.02.19l-4.19 3C2.57 5.07 2.29 5 2 5 .9 5 0 5.9 0 7c0 .74.4 1.38 1 1.72v7.55c-.6.35-1 .99-1 1.73 0 1.1.9 2 2 2 .74 0 1.38-.4 1.72-1h7.55c.35.6.98 1 1.72 1 1.1 0 2-.9 2-2 0-.37-.11-.72-.29-1.02L18.03 11A2 2 0 0018 7zm-5.03 9c-.72.01-1.35.41-1.69 1H3.72c-.17-.3-.42-.55-.72-.72V8.72c.6-.34 1-.98 1-1.72 0-.06-.01-.12-.02-.19l4.19-3c.26.12.54.19.83.19.27 0 .52-.05.75-.15l6.28 4.88c-.01.09-.03.18-.03.27 0 .37.11.72.29 1.02L12.97 16z"],
    "power": ["M10 10c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1S9 .45 9 1v8c0 .55.45 1 1 1zm3-7.45v2.16c2.36 1.12 4 3.5 4 6.29 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.79 1.64-5.17 4-6.29V2.55C3.51 3.79 1 7.09 1 11a9 9 0 0018 0c0-3.91-2.51-7.21-6-8.45z"],
    "predictive-analysis": ["M20 8.01c0-1.26-.61-2.43-1.61-3.12C17.86 2.5 15.8.79 13.4.79c-.58 0-1.14.1-1.69.29A3.533 3.533 0 009.17 0C8.05 0 7 .55 6.32 1.45c-.15-.02-.3-.03-.45-.03-1.63 0-3.03 1.12-3.46 2.71C.97 4.65 0 6.05 0 7.66c0 .48.09.95.26 1.4-.17.44-.26.91-.26 1.39 0 1.38.72 2.64 1.89 3.29.67.7 1.59 1.09 2.54 1.09.61 0 1.19-.15 1.71-.45.68.82 1.68 1.3 2.73 1.3.66 0 1.28-.18 1.83-.52.61.49 1.34.81 2.11.91 1.3 1.43 2.3 3.28 2.31 3.3 0 0 .35.61.33.61.96-.01 1.77-.2 1.64-1.3.01.02-.92-2.89-.92-2.89.52-.26.94-.69 1.21-1.23 1.12-.66 1.84-1.91 1.84-3.26 0-.3-.03-.6-.1-.89.57-.64.88-1.51.88-2.4zm-1.54 1.28l-.18-.2-.77-.84c-.33-.37-.67-1.17-.73-1.73 0 0-.13-1.25-.13-1.26-.06-.74-1.17-.73-1.13.14 0 .02.13 1.26.13 1.26.04.36.15.77.3 1.17-.08-.01-.15-.02-.22-.02 0 0-2.57-.12-2.57-.13-.73-.03-.89 1.22-.05 1.25l2.57.13c.53.03 1.29.37 1.61.72l.61.67.02.06c.1.27.14.55.14.83 0 .93-.51 1.77-1.34 2.18l-.2.1-.09.23c-.19.48-.6.82-1.1.93l-.67.14.87 2.75c-.48-.76-1.19-1.79-2.02-2.67l-.15-.16-.21-.02c-.51-.04-.99-.21-1.42-.48l1.7-1.48c.44-.39 1.04-.55 1.24-.49 0 0 .78.22.78.23.78.2 1.03-.92.29-1.21l-.78-.23c-.69-.2-1.67.22-2.24.72l-1.91 1.66-.39.32c-.44.36-.93.55-1.5.55-.8 0-1.54-.41-1.97-1.07v-1.88c0-.5.21-.98.34-1.07 0 0 .65-.43.64-.43.87-.69.21-1.57-.64-1.14 0-.01-.65.43-.65.43-.31.2-.54.56-.7.97-.13-.13-.28-.25-.43-.35 0 0-1.91-1.26-1.91-1.28-.81-.56-1.5.63-.61 1.11 0-.02 1.89 1.28 1.89 1.28.46.31.77.97.77 1.36v.84c-.43.24-.78.36-1.24.36-.67 0-1.31-.29-1.77-.79l-.07-.08-.09-.05a2.425 2.425 0 01-1.31-2.16c0-.38.09-.74.25-1.08l.15-.31-.14-.33c-.17-.34-.25-.7-.25-1.08 0-1.13.76-2.1 1.85-2.37l.39-.09.07-.43a2.41 2.41 0 012.39-2.05c.19 0 .39.02.58.07l.4.1.22-.38A2.41 2.41 0 019.17 1.3c.55 0 1.08.19 1.5.53l-.44.45-.01-.01-.31.31c-.41.35-.92.53-1.11.5 0 0-.84-.13-.84-.14-.83-.15-1.09 1.08-.18 1.29.01 0 .84.14.84.14.03 0 .06 0 .09.01-.14.46-.18.96-.12 1.4 0 0 .21 1.24.19 1.23.13.65 1.32.44 1.16-.22 0-.01-.19-1.23-.19-1.23-.07-.48.15-1.19.45-1.5l.48-.5c.07-.06.13-.12.19-.18l.93-.95c.5-.23 1.04-.34 1.59-.34 1.93 0 3.57 1.4 3.89 3.34l.05.31.26.15a2.445 2.445 0 01.87 3.4z"],
    "prescription": ["M13.95 10.23c.16-.18.22-.22.46-.22h1.48c.25 0 .47.08.59.33.1.2.09.41-.05.66l-2.71 3.58L16.88 19c.13.21.16.46.03.69-.12.21-.34.31-.57.31H14.7c-.31 0-.56-.17-.7-.44l-1.9-2.67-1.93 2.68c-.15.27-.42.43-.73.43H7.98c-.25 0-.47-.08-.59-.33-.1-.2-.09-.41.05-.66l3.09-4.35L6.26 9H5v4.32c0 .41-.3.69-.7.69H2.7c-.41 0-.7-.28-.7-.69V.69c0-.41.3-.69.7-.69h4.42c.71 0 1.36.1 1.94.3.59.2 1.11.49 1.54.87.44.38.78.84 1.02 1.39.24.54.36 1.14.36 1.78 0 1.01-.28 1.88-.84 2.6-.43.54-1.35 1.29-2 1.59l3.09 3.94 1.72-2.24zM6.71 6.04c.71 0 1.45-.16 1.81-.46.33-.28.5-.69.5-1.25s-.17-.97-.5-1.25c-.35-.3-1.1-.46-1.81-.46h-1.7v3.42h1.7z"],
    "presentation": ["M19 1h-8c0-.55-.45-1-1-1S9 .45 9 1H1c-.55 0-1 .45-1 1s.45 1 1 1h1v11c0 .55.45 1 1 1h4.59L4.3 18.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L9 16.41V19c0 .55.45 1 1 1s1-.45 1-1v-2.59l3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L12.41 15H17c.55 0 1-.45 1-1V3h1c.55 0 1-.45 1-1s-.45-1-1-1zm-3 12H4V3h12v10z"],
    "print": ["M14 16H6v-4H4v5c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-5h-2v4zm2-13c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v1h12V3zm3 2H1c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1h2v-3h14v3h2c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm-1 4h-2V7h2v2z"],
    "projects": ["M18 4c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v2h16V4zm-2-3c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v1h12V1zm3 6H1c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1zm-5 7c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-2h1v2h6v-2h1v2z"],
    "properties": ["M2 15c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm5-4h12c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zM2 1C.9 1 0 1.9 0 3s.9 2 2 2 2-.9 2-2-.9-2-2-2zm17 8H7c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1zm0 7H7c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "property": ["M3 5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm5-1h11c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zM3 15c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm16 1H8c-.55 0-1 .45-1 1s.45 1 1 1h11c.55 0 1-.45 1-1s-.45-1-1-1zm-1-8H9c-1.1 0-2 .9-2 2s.9 2 2 2h9c1.1 0 2-.9 2-2s-.9-2-2-2zM3 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"],
    "publish-function": ["M7.01 10.11c.35-.64.72-1.68 1.09-3.11l.8-3.03h.96l.24-.77h-.99c.28-1.11.66-1.92 1.12-2.43.28-.32.56-.48.83-.48.05 0 .1.02.13.05.03.03.05.07.05.12 0 .04-.04.13-.11.25-.08.12-.11.24-.11.35 0 .15.06.28.18.39.12.11.27.16.45.16.2 0 .36-.07.49-.2s.2-.31.2-.54c0-.26-.1-.47-.3-.63-.2-.16-.52-.24-.96-.24-.68 0-1.3.19-1.86.58-.55.38-1.08 1.02-1.58 1.91-.17.3-.34.5-.49.59-.15.08-.4.13-.74.12l-.23.77h.95L5.74 9.21c-.23.86-.39 1.39-.47 1.59-.12.29-.3.54-.54.75-.1.08-.21.12-.35.12-.04 0-.07-.01-.1-.03l-.03-.04c0-.02.03-.07.1-.13.07-.07.1-.17.1-.31 0-.15-.05-.28-.16-.38-.11-.1-.27-.15-.47-.15-.25 0-.44.07-.59.2-.15.12-.23.28-.23.46 0 .19.09.36.27.5.19.14.47.21.86.21.61 0 1.16-.15 1.63-.46.48-.31.89-.79 1.25-1.43zm3.7 1.18c-.18-.18-.43-.29-.71-.29s-.53.11-.71.29l-3 3a1.003 1.003 0 001.42 1.42L9 14.41V19c0 .55.45 1 1 1s1-.45 1-1v-4.59l1.29 1.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-3-3zm4.15-6.78c.17-.13.36-.2.55-.2.07 0 .2.03.39.08s.36.08.5.08c.2 0 .37-.07.5-.2.13-.14.2-.31.2-.52 0-.22-.07-.4-.2-.53s-.33-.2-.58-.2c-.22 0-.43.05-.63.15-.2.1-.45.32-.75.67-.23.25-.56.7-1.01 1.33a6.52 6.52 0 00-.91-2.15l-2.38.39-.05.25c.18-.03.33-.05.45-.05.24 0 .43.1.59.3.25.31.59 1.24 1.02 2.79-.34.44-.58.73-.7.87-.21.22-.38.36-.52.43-.1.05-.22.08-.35.08-.1 0-.26-.05-.49-.16a1.01 1.01 0 00-.42-.11c-.23 0-.42.07-.57.22-.17.14-.24.32-.24.55 0 .21.07.38.21.51.14.13.33.2.56.2.23 0 .44-.05.64-.14.2-.09.45-.29.75-.59s.72-.78 1.25-1.43c.2.62.38 1.07.53 1.35.15.28.32.49.52.61.19.12.44.19.73.19.28 0 .57-.1.86-.3.38-.25.77-.69 1.17-1.31l-.25-.14c-.27.37-.48.6-.61.69-.09.06-.19.09-.31.09-.14 0-.28-.09-.42-.26-.23-.29-.54-1.09-.93-2.4.37-.58.66-.96.9-1.14z"],
    "pulse": ["M19 10h-2.38L14.9 6.55h-.01c-.17-.32-.5-.55-.89-.55-.43 0-.79.28-.93.66h-.01l-2.75 7.57L7.98 1.82h-.02A.978.978 0 007 1c-.44 0-.8.29-.94.69h-.01L3.28 10H1c-.55 0-1 .45-1 1s.45 1 1 1h3c.44 0 .8-.29.94-.69h.01l1.78-5.34 2.29 12.21h.02c.08.46.47.82.96.82.43 0 .79-.28.93-.66h.01l3.21-8.82.96 1.92h.01c.16.33.49.56.88.56h3c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "random": ["M14.47 5h2.12L15.3 6.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-3-3a1.003 1.003 0 00-1.42 1.42L16.59 3H14c-.31 0-.57.15-.76.37l-.01-.01-2.93 3.52 1.3 1.56L14.47 5zm2.24 7.29a1.003 1.003 0 00-1.42 1.42l1.3 1.29h-2.12L4.77 3.36l-.01.01A.998.998 0 004 3H1c-.55 0-1 .45-1 1s.45 1 1 1h2.53l9.7 11.64.01-.01c.19.22.45.37.76.37h2.59l-1.29 1.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-3-3zM3.53 15H1c-.55 0-1 .45-1 1s.45 1 1 1h3c.31 0 .57-.15.76-.37l.01.01 2.93-3.52-1.3-1.56L3.53 15z"],
    "record": ["M10 3a7 7 0 100 14 7 7 0 100-14z"],
    "redo": ["M19.71 5.29l-4-4a1.003 1.003 0 00-1.42 1.42L16.59 5H6c-3.31 0-6 2.69-6 6s2.69 6 6 6h5v-2H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h10.59L14.3 9.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l4-4c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71zM15 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"],
    "refresh": ["M19 1c-.55 0-1 .45-1 1v2.06C16.18 1.61 13.29 0 10 0 4.48 0 0 4.48 0 10c0 .55.45 1 1 1s1-.45 1-1c0-4.42 3.58-8 8-8 2.52 0 4.76 1.18 6.22 3H15c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm0 8c-.55 0-1 .45-1 1 0 4.42-3.58 8-8 8-2.52 0-4.76-1.18-6.22-3H5c.55 0 1-.45 1-1s-.45-1-1-1H1c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1v-2.06C3.82 18.39 6.71 20 10 20c5.52 0 10-4.48 10-10 0-.55-.45-1-1-1z"],
    "regression-chart": ["M19 16H3.1L19.31 3.39l-.61-.79L2 15.59V3c0-.55-.45-1-1-1s-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zm-9-9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-5 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm10-2c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm-5 4c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z"],
    "remove": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm5-9H5c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "remove-column": ["M19 0H5c-.55 0-1 .45-1 1v4h2V2h5v16H6v-3H4v4c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 18h-5V2h5v16zM6.29 13.71a1.003 1.003 0 001.42-1.42L5.41 10 7.7 7.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L4 8.59l-2.29-2.3A1.003 1.003 0 00.29 7.71L2.59 10 .3 12.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L4 11.41l2.29 2.3z"],
    "remove-column-left": ["M4 11h6c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1zM19 0H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-7 18H2V2h10v16zm6 0h-5V2h5v16z"],
    "remove-column-right": ["M19 0H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zM7 18H2V2h5v16zm11 0H8V2h10v16zm-8-7h6c.55 0 1-.45 1-1s-.45-1-1-1h-6c-.55 0-1 .45-1 1s.45 1 1 1z"],
    "remove-row-bottom": ["M7 14h6c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zM19 0H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 18H2V8h16v10zm0-11H2V2h16v5z"],
    "remove-row-top": ["M7 8h6c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1zm12-8H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 18H2v-5h16v5zm0-6H2V2h16v10z"],
    "repeat": ["M14 6c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1v2.05C16.18 1.6 13.29 0 10 0 4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10c0-.55-.45-1-1-1s-1 .45-1 1c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8c2.53 0 4.77 1.17 6.24 3H15c-.55 0-1 .45-1 1z"],
    "reset": ["M6 6c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1s1 .45 1 1v2.05C3.82 1.6 6.71 0 10 0c5.52 0 10 4.48 10 10s-4.48 10-10 10S0 15.52 0 10c0-.55.45-1 1-1s1 .45 1 1c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8C7.47 2 5.23 3.17 3.76 5H5c.55 0 1 .45 1 1z"],
    "resolve": ["M8.7 4.7C7.9 4.2 7 4 6 4c-3.3 0-6 2.7-6 6s2.7 6 6 6c1 0 1.9-.2 2.7-.7C7.3 14 6.5 12.1 6.5 10s.9-4 2.2-5.3zM14 4c-1 0-1.9.2-2.7.7 1.4 1.4 2.2 3.2 2.2 5.3s-.9 4-2.2 5.3c.8.5 1.7.7 2.7.7 3.3 0 6-2.7 6-6s-2.7-6-6-6zm-4 1.5C8.8 6.7 8 8.2 8 10s.8 3.3 2 4.4c1.2-1.1 2-2.7 2-4.5s-.8-3.3-2-4.4z"],
    "rig": ["M7 4.2C7 5.75 8.34 7 10 7s3-1.46 3-2.8C13 1.45 10.94 0 10 0H6c0 2.74 3.76 1.96 1 4.2zm11.71 14.09L13 12.59V9.01c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v3.58l-5.71 5.7a1.003 1.003 0 001.42 1.42L7 15.42V19c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-3.58l4.29 4.29a1.003 1.003 0 001.42-1.42zM10.21 8c.01 0 .01.01 0 0 .01.01.01 0 0 0z"],
    "right-join": ["M8.7 4.7C7.4 6 6.5 7.9 6.5 10s.8 4 2.2 5.3c-.8.5-1.7.7-2.7.7-3.3 0-6-2.7-6-6s2.7-6 6-6c1 0 1.9.2 2.7.7zm-3.34 9.25c-.55-1.2-.86-2.54-.86-3.95s.31-2.75.86-3.95a4.001 4.001 0 000 7.9zM14 4c3.3 0 6 2.7 6 6s-2.7 6-6 6c-1 0-1.9-.2-2.7-.7 1.3-1.3 2.2-3.2 2.2-5.3s-.8-3.9-2.2-5.3C12.1 4.2 13 4 14 4zm-4 1.5C8.8 6.7 8 8.2 8 10s.8 3.3 2 4.4c1.2-1.1 2-2.7 2-4.5s-.8-3.3-2-4.4z"],
    "ring": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"],
    "rotate-document": ["M8.71 6.29A.997.997 0 008 6H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h9c.55 0 1-.45 1-1v-8c0-.28-.11-.53-.29-.71l-4-4zM11 18H4V8h3v3c0 .55.45 1 1 1h3v6zm3-16h-1.59l.29-.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-2 2C9.11 2.47 9 2.72 9 3c0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42l-.3-.29H14c1.1 0 2 .9 2 2v3c0 .55.45 1 1 1s1-.45 1-1V6c0-2.21-1.79-4-4-4z"],
    "rotate-page": ["M14 2h-1.59l.29-.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-2 2C9.11 2.47 9 2.72 9 3c0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42l-.3-.29H14c1.1 0 2 .9 2 2v3c0 .55.45 1 1 1s1-.45 1-1V6c0-2.21-1.79-4-4-4zm-2 5H3c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1zm-1 11H4V9h7v9z"],
    "satellite": ["M9 18c.6 0 1 .4 1 1s-.4 1-1 1c-5 0-9-4-9-9 0-.6.4-1 1-1s1 .4 1 1c0 3.9 3.1 7 7 7zm0-4c.6 0 1 .4 1 1s-.4 1-1 1c-2.8 0-5-2.2-5-5 0-.6.4-1 1-1s1 .4 1 1c0 1.7 1.3 3 3 3zm5.7-3.7c.4-.4 1-.4 1.4 0l3.6 3.6c.4.4.4 1 0 1.4l-1.4 1.4c-.4.4-1 .4-1.4 0l-3.6-3.6c-.4-.4-.4-1 0-1.4l1.4-1.4zM4.7.3c.4-.4 1-.4 1.4 0l3.6 3.6c.4.4.4 1 0 1.4L8.3 6.7c-.4.4-1 .4-1.4 0L3.3 3.1c-.4-.4-.4-1 0-1.4L4.7.3zm11.1 1c.4-.4 1-.4 1.4 0l1.6 1.6c.4.4.4 1 0 1.4l-6.5 6.5c-.4.4-1 .4-1.4 0L9.3 9.2c-.4-.4-.4-1 0-1.4l6.5-6.5zM9 12c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"],
    "saved": ["M12 0H4c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h13c.55 0 1-.45 1-1V6l-6-6zm4 18H5V2h6v5h5v11zm-8.29-6.71a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29.32 0 .59-.16.77-.38l.01.01 4-5-.01-.01c.14-.18.23-.38.23-.62 0-.55-.45-1-1-1-.32 0-.59.16-.77.38l-.01-.01-3.3 4.13-2.21-2.21z"],
    "scatter-plot": ["M9 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm5 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1 10H2V3c0-.55-.45-1-1-1s-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zM5 15c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"],
    "search": ["M19.56 17.44l-4.94-4.94A8.004 8.004 0 0016 8c0-4.42-3.58-8-8-8S0 3.58 0 8s3.58 8 8 8c1.67 0 3.21-.51 4.5-1.38l4.94 4.94a1.498 1.498 0 102.12-2.12zM8 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"],
    "search-around": ["M9.9 6.9a3 3 0 100 6 3 3 0 100-6zM3 14c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM3 0C1.3 0 0 1.3 0 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM17 14c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM17 0c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm0 5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM10 10L5 5",
        "M5.379 4.671l5.02 5.02-.707.708-5.02-5.02zM10 10l5-5",
        "M14.621 4.671l.707.708-5.02 5.02-.707-.707z",
        "M10 10l5 5M10.379 9.671l5.02 5.02-.707.708-5.02-5.02z",
        "M10 10l-5 5M9.621 9.671l.707.708-5.02 5.02-.707-.707z"],
    "search-template": ["M13 8H5c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1zm0 3H5c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1zm0-6H5c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1zm6.56 12.44l-3.23-3.23A8.939 8.939 0 0018 9a9 9 0 10-9 9c1.94 0 3.74-.62 5.21-1.67l3.23 3.23a1.498 1.498 0 102.12-2.12zM9 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"],
    "search-text": ["M19.56 17.44l-3.23-3.23A8.939 8.939 0 0018 9a9 9 0 10-9 9c1.94 0 3.74-.62 5.21-1.67l3.23 3.23a1.498 1.498 0 102.12-2.12zM9 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm3.5-11h-7c-.28 0-.5.22-.5.5v2c0 .28.22.5.5.5s.5-.22.5-.5V7h2v6h-.5c-.28 0-.5.22-.5.5s.22.5.5.5h3c.28 0 .5-.22.5-.5s-.22-.5-.5-.5H10V7h2v.5c0 .28.22.5.5.5s.5-.22.5-.5v-2c0-.28-.22-.5-.5-.5z"],
    "segmented-control": ["M19 5H1c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm-1 8h-8V7h8v6z"],
    "select": ["M19.71 18.29l-4.25-4.25L20 12.91 9.93 9.33c.04-.1.07-.21.07-.33V3c0-.55-.45-1-1-1H4V1c0-.55-.45-1-1-1S2 .45 2 1v1H1c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 .55.45 1 1 1h6c.12 0 .23-.03.34-.07L12.91 20l1.14-4.54 4.25 4.25c.17.18.42.29.7.29a1.003 1.003 0 00.71-1.71zM8 8H4V4h4v4z"],
    "selection": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
        "M10 6a4 4 0 100 8 4 4 0 100-8z"],
    "send-to": ["M19 0h-5c-.6 0-1 .4-1 1s.4 1 1 1h2.6l-4.3 4.3c-.2.2-.3.4-.3.7 0 .6.4 1 1 1 .3 0 .5-.1.7-.3L18 3.4V6c0 .5.5 1 1 1s1-.5 1-1V1c0-.6-.5-1-1-1zm0 9c-1 0-1.9-.5-2.5-1.3l-1.4 1.4c-.5.6-1.3.9-2.1.9-1.7 0-3-1.3-3-3 0-.8.3-1.6.9-2.1l1.4-1.4C11.5 2.9 11 2 11 1c0-.3.1-.6.2-.9-.4-.1-.8-.1-1.2-.1C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10c0-.4 0-.8-.1-1.2-.3.1-.6.2-.9.2z"],
    "send-to-graph": ["M8 11H3c-.55 0-1 .45-1 1s.45 1 1 1h2.59L.3 18.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L7 14.41V17c0 .55.45 1 1 1s1-.45 1-1v-5c0-.55-.45-1-1-1zm10 2c-.53 0-1.01.21-1.37.55L11.9 10.6c.06-.19.1-.39.1-.6 0-.21-.04-.41-.1-.6l4.72-2.95c.37.34.85.55 1.38.55 1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2c0 .21.04.41.1.6l-4.73 2.96c-.24-.23-.54-.4-.87-.48V3.93c.86-.22 1.5-1 1.5-1.93 0-1.1-.9-2-2-2S8 .9 8 2c0 .93.64 1.71 1.5 1.93v4.14c-.33.09-.63.26-.87.48L7.6 7.91 5.42 6.55 3.9 5.6c.06-.19.1-.39.1-.6 0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2c.53 0 1.01-.21 1.37-.55L9 9.96V10h.06L12 11.84l.4.25 1.51.94 2.19 1.37c-.06.19-.1.39-.1.6 0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2zm-7-2.96l-.06-.04H11v.04z"],
    "send-to-map": ["M8 11H3c-.55 0-1 .45-1 1s.45 1 1 1h2.59L.3 18.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71L7 14.41V17c0 .55.45 1 1 1s1-.45 1-1v-5c0-.55-.45-1-1-1zm11.54-6.82l.01-.02-6-4-.01.02C13.39.08 13.21 0 13 0s-.39.08-.54.18l-.01-.02L7 3.8 1.55.17l-.01.01A.969.969 0 001 0C.45 0 0 .45 0 1v9c0-.55.45-1 1-1h1V2.87l4 2.67V9h2V5.54l4-2.67v11.6l-1 .67v2.4l2-1.33 5.45 3.63.01-.02c.15.1.33.18.54.18.55 0 1-.45 1-1V5c0-.35-.19-.64-.46-.82zM18 17.13l-4-2.67V2.87l4 2.67v11.59z"],
    "series-add": ["M13.29 9.29c.3.62.8 1.12 1.42 1.42l-3 3c-.18.18-.43.29-.71.29s-.53-.11-.71-.3L7 10.41l-5 5V17h17c.55 0 1 .45 1 1s-.45 1-1 1H1a.998.998 0 01-1-1V4c0-.55.45-1 1-1s1 .45 1 1v8.59l4.29-4.3C6.47 8.11 6.72 8 7 8s.53.11.71.29l3.29 3.3 2.29-2.3zM12 5c0-.5.4-1 1-1h2V2c0-.6.4-1 1-1 .5 0 1 .4 1 1v2h2c.5 0 1 .4 1 1s-.5 1-1 1h-2v2c0 .6-.5 1-1 1-.6 0-1-.4-1-1V6h-2c-.6 0-1-.4-1-1z"],
    "series-configuration": ["M11.91 10.67c.52.45 1.13.8 1.8 1.03l-2.01 2.01c-.18.18-.43.29-.71.29-.28 0-.53-.11-.71-.3L7 10.41l-5 5V17h16.99c.55 0 1 .45 1 1s-.45 1-1 1H1a.998.998 0 01-1-1V4c0-.55.45-1 1-1s1 .45 1 1v8.59l4.29-4.3C6.47 8.11 6.72 8 7 8c.28 0 .53.11.71.29l3.29 3.3.91-.92zM18.5 4.6h1.04c.25 0 .45.2.46.44v.9c0 .25-.2.45-.45.45h-1.04c-.07.22-.16.42-.27.62l.73.73c.17.17.17.44 0 .61l-.61.61c-.17.17-.44.17-.61 0l-.73-.73c-.2.11-.4.2-.62.26v1.05c0 .25-.2.45-.45.45h-.9c-.25 0-.45-.2-.45-.45V8.51c-.21-.06-.4-.15-.58-.25l-.76.77c-.17.17-.46.17-.64 0l-.64-.64a.465.465 0 010-.64l.76-.77c-.1-.19-.19-.38-.25-.59h-1.04c-.25 0-.45-.2-.45-.45v-.9c0-.25.2-.45.45-.45h1.04c.07-.22.16-.42.27-.61l-.73-.73a.429.429 0 010-.61l.61-.61c.17-.17.44-.17.61 0l.73.73c.2-.11.4-.2.62-.26V1.45a.44.44 0 01.44-.45h.9c.25 0 .45.2.45.45V2.5c.21.06.4.15.58.25l.76-.77c.17-.17.46-.17.64 0l.64.64c.17.17.17.46 0 .64l-.76.77c.1.17.19.36.25.57zm-4.69.9c0 .93.75 1.69 1.69 1.69.93 0 1.69-.75 1.69-1.69s-.75-1.69-1.69-1.69-1.69.76-1.69 1.69z"],
    "series-derived": ["M18.82 6.58c-.03.05-.07.09-.11.13 0 0 0-.01-.01-.01l-2 2c-.2.2-.4.3-.7.3-.6 0-1-.4-1-1 0-.3.1-.5.3-.7L16.6 6H11c-.6 0-1-.4-1-1s.4-1 1-1h5.6l-1.3-1.3c-.2-.2-.3-.4-.3-.7 0-.6.4-1 1-1 .3 0 .5.1.7.3l3 3c.2.2.3.4.3.7s-.1.5-.3.7l-.88.88zm-5.53 2.71c.3.62.8 1.12 1.42 1.42l-3 3c-.18.18-.43.29-.71.29s-.53-.11-.71-.3L7 10.41l-5 5V17h17c.55 0 1 .45 1 1s-.45 1-1 1H1a.998.998 0 01-1-1V4c0-.55.45-1 1-1s1 .45 1 1v8.59l4.29-4.3C6.47 8.11 6.72 8 7 8s.53.11.71.29l3.29 3.3 2.29-2.3z"],
    "series-filtered": ["M12.14 10.45c.21.67.65 1.23 1.22 1.61l-1.65 1.65c-.18.18-.43.29-.71.29s-.53-.11-.71-.3L7 10.41l-5 5V17h17c.55 0 1 .45 1 1s-.45 1-1 1H1a.998.998 0 01-1-1V4c0-.55.45-1 1-1s1 .45 1 1v8.59l4.29-4.3C6.47 8.11 6.72 8 7 8s.53.11.71.29l3.29 3.3 1.14-1.14zM19.35 1a.642.642 0 01.46 1.1l-3.03 3.03v2.95c0 .18-.07.34-.19.46l-1.28 1.29c-.11.1-.27.17-.45.17-.35 0-.64-.29-.64-.64V5.13L11.19 2.1a.642.642 0 01.45-1.1h7.71z"],
    "series-search": ["M11.28 11.31l-.28.28-3.29-3.3C7.53 8.11 7.28 8 7 8s-.53.11-.71.29L2 12.59V4c0-.55-.45-1-1-1s-1 .45-1 1v14a.998.998 0 001 1h18c.55 0 1-.45 1-1s-.45-1-1-1H2v-1.59l5-5 3.29 3.29c.18.19.43.3.71.3s.53-.11.71-.29l2.09-2.09c-.17.02-.34.02-.51.02-.7 0-1.38-.12-2.01-.33zm-.93-6c0-1.62 1.31-2.93 2.93-2.93s2.93 1.31 2.93 2.93-1.31 2.93-2.93 2.93-2.93-1.31-2.93-2.93zm6.47 2.43c.11-.17.21-.33.29-.51.01-.03.03-.06.04-.09.08-.18.16-.35.21-.54.06-.2.1-.38.14-.58.01-.05.01-.09.02-.14.03-.2.05-.39.05-.6 0-2.37-1.93-4.3-4.3-4.3-2.37.01-4.3 1.93-4.3 4.31s1.93 4.3 4.3 4.3c.21 0 .4-.02.6-.05.04 0 .09-.01.14-.02.2-.03.38-.08.57-.14.2-.06.37-.14.55-.21.03-.01.06-.03.09-.04.18-.09.34-.19.51-.29l2.87 2.87c.14.14.33.22.56.22.43 0 .78-.35.78-.78a.938.938 0 00-.23-.56l-2.89-2.85z"],
    "settings": ["M4 1c0-.55-.45-1-1-1S2 .45 2 1v5h2V1zM2 19c0 .55.45 1 1 1s1-.45 1-1v-6H2v6zm9-18c0-.55-.45-1-1-1S9 .45 9 1v8h2V1zm7 0c0-.55-.45-1-1-1s-1 .45-1 1v3h2V1zM9 19c0 .55.45 1 1 1s1-.45 1-1v-3H9v3zm9-14h-2c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1zm-2 14c0 .55.45 1 1 1s1-.45 1-1v-8h-2v8zM4 7H2c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1zm7 3H9c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1z"],
    "share": ["M15 18H2V5h8.76l2-2H1c-.55 0-1 .45-1 1v15c0 .55.45 1 1 1h15c.55 0 1-.45 1-1V7.24l-2 2V18zm4-18h-7c-.55 0-1 .45-1 1s.45 1 1 1h4.59l-7.3 7.29a1.003 1.003 0 001.42 1.42L18 3.41V8c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "shield": ["M10 20c6-3.81 9-9.048 9-15.714-2 0-5-1.429-9-4.286-4 2.857-7 4.286-9 4.286C1 10.952 4 16.19 10 20zm0-17.348c2.577 1.734 4.776 2.88 6.667 3.419-.44 4.627-2.636 8.353-6.667 11.297V2.652z"],
    "shop": ["M17.94 3.63c-.01-.02-.01-.03-.02-.04l-.03-.09h-.01c-.18-.3-.49-.5-.86-.5h-14c-.42 0-.77.25-.92.61L0 8.5h.02a2.5 2.5 0 005 0 2.5 2.5 0 005 0 2.5 2.5 0 005 0 2.5 2.5 0 005 0l-2.08-4.87zM3.02 2h14c.55 0 1-.45 1-1s-.45-1-1-1h-14c-.55 0-1 .45-1 1s.44 1 1 1zm13 14h-12v-4h-2v7c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-7h-2v4z"],
    "shopping-cart": ["M18 14H8.72l-.67-2H17c.44 0 .8-.29.94-.69h.01l2-6h-.01c.03-.1.06-.2.06-.31 0-.55-.45-1-1-1H5.39l-.44-1.32h-.01C4.8 2.29 4.44 2 4 2H1c-.55 0-1 .45-1 1s.45 1 1 1h2.28l3.33 10H5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2h9c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2zM6.05 6h11.56l-1.33 4H7.39L6.05 6z"],
    "signal-search": ["M7.15 10.33c.888.8 1.999 1.36 3.228 1.574l2.326 6.98a.846.846 0 01-.535 1.07.844.844 0 01-1.072-.535l-1.225-3.671H7.125L5.9 19.419a.85.85 0 01-1.072.536.85.85 0 01-.536-1.071l2.857-8.555zm1.353 1.305l-.808 2.413h1.607l-.8-2.413zM5 5.5c0 .76.13 1.49.37 2.17-.496 1.056-.313 2.356.704 3.29.385.353.404.94.038 1.311a.982.982 0 01-1.356.038c-2.183-2.01-2-5.125.01-6.94a.95.95 0 01.24-.156A6.421 6.421 0 005 5.5z",
        "M3.874 13.185c-1.346-.918-2.187-2.67-2.187-4.34 0-1.752.757-3.254 2.187-4.339.42-.25.42-.834.168-1.168-.252-.418-.84-.418-1.177-.167C1.014 4.59-.08 6.509.005 8.846c.084 2.253 1.177 4.423 2.86 5.675.168.083.336.166.504.166.253 0 .505-.083.673-.333.337-.418.253-.918-.168-1.169zM12.246 12.309a.98.98 0 01-1.354-.037.917.917 0 01-.206-.324 6.54 6.54 0 001.959-.049 5.125 5.125 0 01-.399.41zM14.631 11.476l1.228 1.229a6.6 6.6 0 01-1.723 1.816c-.169.083-.337.166-.505.166-.253 0-.505-.083-.673-.333-.337-.418-.253-.918.168-1.169.62-.422 1.133-1.022 1.505-1.709z",
        "M11.5 0C14.54 0 17 2.46 17 5.5c0 .26-.02.51-.06.75l-.03.17c-.04.25-.1.49-.17.73v.01c-.08.24-.17.47-.28.69-.01.04-.03.07-.05.11-.11.23-.24.44-.38.65l3.68 3.68A1.003 1.003 0 0119 14c-.28 0-.53-.11-.7-.29l-3.68-3.68c-.21.14-.42.27-.65.38-.04.01-.07.03-.11.05-.22.11-.45.2-.69.28h-.01c-.24.07-.48.13-.73.17l-.17.03c-.25.04-.5.06-.76.06C8.46 11 6 8.54 6 5.5S8.46 0 11.5 0zm0 1.5c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"],
    "sim-card": ["M16.71 5.29l-5-5A.997.997 0 0011 0H4c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6c0-.28-.11-.53-.29-.71zM9 7h2v3H9V7zM6 7h2v3H6V7zm2 11H6v-3h2v3zm3 0H9v-3h2v3zm3 0h-2v-3h2v3zm0-4H6v-3h8v3zm0-4h-2V7h2v3z"],
    "slash": ["M12 2c-.46 0-.85.32-.97.74L7.04 16.7c-.02.1-.04.2-.04.3 0 .55.45 1 1 1 .46 0 .85-.32.97-.74L12.96 3.3c.02-.1.04-.2.04-.3 0-.55-.45-1-1-1z"],
    "small-cross": ["M11.41 10l3.29-3.29c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71L10 8.59l-3.29-3.3a1.003 1.003 0 00-1.42 1.42L8.59 10 5.3 13.29c-.19.18-.3.43-.3.71a1.003 1.003 0 001.71.71l3.29-3.3 3.29 3.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71L11.41 10z"],
    "small-minus": ["M14 9H6c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "small-plus": ["M14 9h-3V6c0-.55-.45-1-1-1s-1 .45-1 1v3H6c-.55 0-1 .45-1 1s.45 1 1 1h3v3c0 .55.45 1 1 1s1-.45 1-1v-3h3c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "small-tick": ["M15 5c-.28 0-.53.11-.71.29L8 11.59l-2.29-2.3a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l7-7A1.003 1.003 0 0015 5z"],
    "snowflake": ["M11 11.776v2.81l2.31 2.242a.987.987 0 010 1.415c-.399.39-1.044.39-1.442 0L11 17.414V19a.99.99 0 01-.996 1A.996.996 0 019 19v-1.636l-.912.879c-.398.39-1.043.39-1.441 0a.987.987 0 010-1.415L9 14.536v-2.79l-2.548 1.435-.837 3.063c-.146.534-.705.85-1.248.707a.998.998 0 01-.721-1.224l.309-1.132-1.4.793a1.03 1.03 0 01-1.393-.366.99.99 0 01.373-1.366l1.445-.818-1.224-.322a.998.998 0 01-.72-1.225c.145-.533.704-.85 1.248-.707l3.193.84 2.462-1.395-2.532-1.434-3.123.82a1.022 1.022 0 01-1.249-.706.998.998 0 01.721-1.225L2.91 7.18l-1.4-.793a.99.99 0 01-.373-1.366 1.03 1.03 0 011.392-.366l1.445.818-.328-1.2a.998.998 0 01.72-1.225 1.022 1.022 0 011.25.707l.855 3.132L9 8.311V5.414L6.647 3.121a.987.987 0 010-1.414 1.033 1.033 0 011.441 0L9 2.586V1c0-.552.44-1 1.004-1A.99.99 0 0111 1l-.007 1.536.875-.829a1.033 1.033 0 011.441 0 .987.987 0 010 1.414L11 5.364v2.918l2.53-1.42.855-3.131c.146-.534.705-.85 1.249-.707a.998.998 0 01.72 1.224l-.327 1.2 1.4-.792a1.03 1.03 0 011.392.366.99.99 0 01-.373 1.366l-1.355.768 1.153.303a.998.998 0 01.721 1.225c-.146.533-.705.85-1.249.707l-3.123-.821-2.576 1.459 2.506 1.42 3.193-.84a1.022 1.022 0 011.249.707.998.998 0 01-.72 1.225l-1.224.322 1.4.793a.99.99 0 01.373 1.366 1.03 1.03 0 01-1.393.366l-1.356-.768.31 1.132a.998.998 0 01-.721 1.224 1.022 1.022 0 01-1.249-.707l-.837-3.063L11 11.776z"],
    "social-media": ["M11.5 5c.8 0 1.6-.4 2-1 2 1.2 3.3 3.3 3.5 5.7 0 .5.5.9 1 .9.6 0 1-.5 1-1v-.1c-.2-3.3-2.2-6.2-5.1-7.6C13.7.8 12.7 0 11.5 0 10.1 0 9 1.1 9 2.5S10.1 5 11.5 5zm5 7c-1.4 0-2.5 1.1-2.5 2.5 0 .4.1.7.2 1.1-1.1.9-2.6 1.4-4.2 1.4-1.9 0-3.6-.8-4.9-2-.2-.2-.5-.4-.8-.4-.5 0-1 .5-1 1 0 .3.1.5.3.7C5.3 18 7.5 19 10 19c2.2 0 4.2-.8 5.8-2.1.2.1.5.1.7.1 1.4 0 2.5-1.1 2.5-2.5S17.9 12 16.5 12zM5 10.5c0-1.1-.7-2.1-1.7-2.4.5-1.9 1.9-3.5 3.6-4.4.3-.2.6-.5.6-.9 0-.5-.4-1-1-1-.2 0-.4.1-.6.2-2.4 1.2-4.2 3.6-4.7 6.4C.5 8.9 0 9.6 0 10.5 0 11.9 1.1 13 2.5 13S5 11.9 5 10.5z"],
    "sort": ["M19 16h-9c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h9c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zm0-5h-9c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h9c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zM7 15c-.28 0-.53.11-.71.29L5 16.59V11c0-.55-.45-1-1-1s-1 .45-1 1v5.59L1.71 15.3A.965.965 0 001 15a1.003 1.003 0 00-.71 1.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3A1.003 1.003 0 007 15zM19 1h-9c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zm0 5h-9c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V7c0-.55-.45-1-1-1z"],
    "sort-alphabetical": ["M8 15c-.28 0-.53.11-.71.29L6 16.59v-5.58c0-.55-.45-1-1-1s-1 .45-1 1v5.58L2.71 15.3c-.18-.18-.43-.3-.71-.3a1.003 1.003 0 00-.71 1.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3A1.003 1.003 0 008 15zm8.89-.79v-1.22H11.3v1.3h3.51L11 18.78V20h5.99v-1.3h-3.91l3.81-4.49zM14.97 0h-1.95L9.01 11.01h1.89l.98-2.92h4.17l.98 2.92h1.96L14.97 0zm-2.59 6.63l1.58-4.74H14l1.57 4.74h-3.19z"],
    "sort-alphabetical-desc": ["M8.01 15c-.28 0-.53.11-.71.29L6 16.59v-5.58c0-.55-.45-1-1-1s-1 .45-1 1v5.58L2.71 15.3c-.18-.18-.43-.3-.71-.3a1.003 1.003 0 00-.71 1.71l3 3a1.014 1.014 0 001.42 0l3-3c.18-.18.29-.43.29-.71.01-.55-.44-1-.99-1zm4.44-5.65l6.4-7.88V0H10.5v1.67h5.91L10 9.44v1.57h9V9.35h-6.55zm1.27 3.64L11 20h1.59l.56-1.56h2.68l.55 1.56h1.64l-2.68-7.01h-1.62zm-.16 4.3l.93-2.57h.02l.9 2.57h-1.85z"],
    "sort-asc": ["M10 8h5c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1h-5c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1zm0 5h7c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1h-7c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1zm0-10h3c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1zm9 12h-9c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h9c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zM7 14c-.28 0-.53.11-.71.29L5 15.59V10c0-.55-.45-1-1-1s-1 .45-1 1v5.59L1.71 14.3A.965.965 0 001 14a1.003 1.003 0 00-.71 1.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3A1.003 1.003 0 007 14z"],
    "sort-desc": ["M13 15h-3c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zm-6-1c-.28 0-.53.11-.71.29L5 15.59V10c0-.55-.45-1-1-1s-1 .45-1 1v5.59L1.71 14.3A.965.965 0 001 14a1.003 1.003 0 00-.71 1.71l3 3c.18.18.43.29.71.29s.53-.11.71-.29l3-3A1.003 1.003 0 007 14zM19 0h-9c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-4 10h-5c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zm2-5h-7c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1h7c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"],
    "sort-numerical": ["M9 14.99c-.28 0-.53.11-.71.29L7 16.58v-5.59c0-.55-.45-1-1-1s-1 .45-1 1v5.59l-1.29-1.29a.965.965 0 00-.71-.3 1.003 1.003 0 00-.71 1.71l3 3c.18.18.43.29.71.29.28 0 .53-.11.71-.29l3-3c.18-.18.29-.43.29-.71a.99.99 0 00-1-1zm8.88.23c-.08-.42-.22-.79-.42-1.12-.2-.33-.47-.6-.8-.8-.33-.2-.76-.3-1.28-.3a2.333 2.333 0 00-1.72.71c-.21.22-.37.48-.49.78-.11.3-.17.62-.17.97 0 .27.04.54.13.8.08.26.22.5.4.7.19.21.43.38.71.5a2.142 2.142 0 001.72.02c.25-.12.47-.31.66-.58l.02.02c-.01.19-.04.4-.08.63-.04.24-.11.46-.21.67-.1.21-.23.38-.39.53a.92.92 0 01-.62.22c-.24 0-.44-.08-.6-.25-.16-.17-.27-.36-.31-.59h-1.31c.04.29.12.56.24.79.12.23.28.43.48.59.19.16.42.28.67.36.25.08.52.12.82.12.49 0 .9-.1 1.23-.31.34-.21.61-.48.82-.82.21-.34.37-.71.47-1.13.1-.42.15-.83.15-1.25 0-.43-.04-.85-.12-1.26zm-1.42.63c-.05.15-.11.28-.2.4-.09.12-.2.21-.34.27s-.3.1-.49.1c-.17 0-.33-.04-.46-.11s-.24-.17-.33-.29c-.08-.12-.15-.25-.19-.4-.04-.15-.06-.31-.06-.47 0-.15.02-.3.07-.45.05-.15.11-.28.2-.39.09-.12.2-.21.33-.28.13-.07.27-.11.44-.11.17 0 .33.04.47.11.14.07.25.17.34.28a1.387 1.387 0 01.28.86c.01.17-.02.33-.06.48zM15.32 11H17V0h-1.25c-.05.34-.17.62-.34.85-.17.23-.39.42-.63.57-.25.15-.52.25-.83.31-.3.06-.62.09-.94.09v1.41h2.31V11z"],
    "sort-numerical-desc": ["M9 15c-.28 0-.53.11-.71.29L7 16.59v-5.58c0-.55-.45-1-1-1s-1 .45-1 1v5.58L3.71 15.3c-.18-.18-.43-.3-.71-.3a1.003 1.003 0 00-.71 1.71l3 3c.18.18.43.29.71.29.28 0 .53-.11.71-.29l3-3A1.003 1.003 0 009 15zm6.7-1.33a1.5 1.5 0 01-.44.43c-.17.11-.37.19-.58.23-.22.04-.44.06-.67.05v1.07h1.66V20H17v-6.99h-1.06c-.04.26-.12.48-.24.66zm3.15-10.3c-.11-.68-.29-1.26-.55-1.76-.26-.5-.62-.89-1.08-1.18C16.75.14 16.17 0 15.46 0c-.54 0-1.03.09-1.46.27-.43.18-.79.44-1.09.76-.3.33-.52.71-.67 1.15-.16.44-.24.92-.24 1.43 0 .54.08 1.04.23 1.47.15.44.37.81.65 1.12.28.31.61.55 1 .72.39.17.82.26 1.3.26.46 0 .88-.11 1.26-.33.38-.22.68-.53.9-.94l.03.03c-.03.35-.07.74-.12 1.16-.05.42-.15.81-.29 1.18-.14.37-.35.68-.61.92-.26.25-.62.37-1.06.37-.43 0-.77-.13-1.03-.4-.25-.27-.4-.62-.44-1.05h-1.64c.02.43.11.83.29 1.18.17.35.39.66.67.91a3.027 3.027 0 002.07.8c.71 0 1.3-.17 1.79-.5.48-.33.87-.76 1.17-1.29.3-.53.51-1.12.64-1.76.13-.64.19-1.28.19-1.92.01-.77-.05-1.49-.15-2.17zM17.1 4.44c-.08.27-.19.5-.34.71-.15.21-.34.37-.57.49-.23.12-.5.18-.8.18-.3 0-.56-.06-.78-.19-.22-.13-.4-.29-.55-.49-.14-.2-.25-.44-.32-.7-.07-.27-.11-.55-.11-.84 0-.28.04-.55.11-.82.07-.26.18-.49.32-.7.14-.2.33-.36.55-.48.22-.12.48-.17.78-.17.31 0 .57.06.8.18.23.12.42.28.57.48.15.2.26.43.34.69.08.26.11.53.11.82 0 .29-.04.57-.11.84z"],
    "split-columns": ["M15 13a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-3-3a1.003 1.003 0 00-1.42 1.42L16.59 9H11V2h5v2c.77 0 1.47.3 2 .78V1c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v3.78C2.53 4.3 3.23 4 4 4V2h5v7H3.41L4.7 7.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-3 3C.11 9.47 0 9.72 0 10c0 .28.11.53.29.71l3 3a1.003 1.003 0 001.42-1.42L3.41 11H9v7H4v-2c-.77 0-1.47-.3-2-.78V19c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-3.78c-.53.48-1.23.78-2 .78v2h-5v-7h5.59l-1.29 1.29c-.19.18-.3.43-.3.71z"],
    "square": ["M19 0H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 18H2V2h16v16z"],
    "stacked-chart": ["M12 2c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v4h4V2zm3 14h2c.55 0 1-.45 1-1v-5h-4v5c0 .55.45 1 1 1zm3-10c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1v3h4V6zm-6 1H8v5h4V7zm-9 9h2c.55 0 1-.45 1-1v-3H2v3c0 .55.45 1 1 1zm16 1H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zM6 9c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v2h4V9zm3 7h2c.55 0 1-.45 1-1v-2H8v2c0 .55.45 1 1 1z"],
    "star": ["M10 0l3.1 6.6 6.9 1-5 5.1 1.2 7.3-6.2-3.4L3.8 20 5 12.7 0 7.6l6.9-1z"],
    "star-empty": ["M20 7.6l-6.9-1.1L10 0 6.9 6.6 0 7.6l5 5.1L3.8 20l6.2-3.4 6.2 3.4-1.2-7.2 5-5.2zM10 15l-4.5 2.4.9-5.2-3.6-3.6 5-.8L10 3.1l2.2 4.7 5 .8-3.6 3.7.9 5.2L10 15z"],
    "step-backward": ["M15 3c-.23 0-.42.09-.59.21l-.01-.01L8 8V4c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-4l6.4 4.8.01-.01c.17.12.36.21.59.21.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "step-chart": ["M19 16H2v-3h4c.55 0 1-.45 1-1V8h3v2c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V6h2c.55 0 1-.45 1-1s-.45-1-1-1h-3c-.55 0-1 .45-1 1v4h-3V7c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1v4H2V3c0-.55-.45-1-1-1s-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "step-forward": ["M15 3h-2c-.55 0-1 .45-1 1v4L5.6 3.2l-.01.01C5.42 3.09 5.23 3 5 3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1 .23 0 .42-.09.59-.21l.01.01L12 12v4c0 .55.45 1 1 1h2c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "stop": ["M16 3H4c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "stopwatch": ["M10 6a6 6 0 106 6h-6V6zm-.998-1.938A1.015 1.015 0 019 4V2H7a1 1 0 110-2h6a1 1 0 010 2h-2v2c0 .02 0 .041-.002.062A8.001 8.001 0 0110 20a8 8 0 01-.998-15.938z"],
    "strikethrough": ["M18 9h-4.46a4.7 4.7 0 00-.4-.14c-.19-.05-.51-.14-.96-.25-.45-.11-.9-.23-1.37-.35-.47-.12-.89-.23-1.27-.33s-.6-.16-.65-.17c-.53-.15-.95-.37-1.27-.66-.32-.28-.49-.68-.49-1.19 0-.36.09-.66.26-.9s.39-.43.65-.57c.26-.14.55-.24.87-.3s.63-.09.93-.09c.89 0 1.63.19 2.21.57.45.3.75.76.89 1.38h2.63c-.06-.52-.2-.98-.42-1.4-.3-.57-.71-1.05-1.23-1.43a5.33 5.33 0 00-1.79-.87c-.7-.2-1.42-.3-2.19-.3-.66 0-1.31.08-1.96.25s-1.22.43-1.73.77-.92.79-1.23 1.32c-.31.52-.46 1.15-.46 1.87 0 .37.05.74.15 1.1.1.36.28.7.53 1.02.18.24.41.47.69.67H2c-.55 0-1 .45-1 1s.45 1 1 1h10.14c.02.01.05.02.07.02.3.11.58.29.84.55.25.26.38.67.38 1.21 0 .27-.06.53-.17.79-.11.26-.29.49-.54.69-.25.2-.57.36-.97.49s-.88.19-1.44.19c-.52 0-1.01-.06-1.45-.17-.45-.11-.84-.29-1.19-.54s-.61-.56-.8-.95c-.05-.08-.09-.18-.12-.28H4.11c.09.43.22.82.4 1.18.33.65.77 1.18 1.32 1.59.55.41 1.2.72 1.94.92.74.2 1.53.3 2.37.3.73 0 1.44-.08 2.14-.25.7-.17 1.33-.43 1.88-.79.55-.36.99-.83 1.33-1.39.34-.56.51-1.25.51-2.05 0-.37-.06-.75-.18-1.12a3.12 3.12 0 00-.15-.39H18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "style": ["M18 18H2V2h12.3l2-2H1C.4 0 0 .4 0 1v18c0 .6.4 1 1 1h18c.6 0 1-.4 1-1V7.7l-2 2V18zm1.2-18l-7.6 7.6 2.8 2.8L20 4.8V0h-.8zM4 15.9c3.1.2 5.9.2 8.2-2 1.1-1.1 1.1-3 0-4.1-.6-.5-1.3-.8-2-.8s-1.4.3-1.9.8C7.2 11 6.6 14.3 4 15.9z"],
    "swap-horizontal": ["M16.02 10c-.01 0-.01 0 0 0H16h.02zM2 6h13.58l-2.29 2.29a1 1 0 00-.3.71 1.003 1.003 0 001.71.71l4-4c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-4-4a1.003 1.003 0 00-1.42 1.42L15.58 4H2c-.55 0-1 .45-1 1s.45 1 1 1zm2 4h-.02H4zm14 4H4.42l2.29-2.29a1 1 0 00.3-.71 1.003 1.003 0 00-1.71-.71l-4 4c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l4 4a1.003 1.003 0 001.42-1.42L4.42 16H18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "swap-vertical": ["M9.71 5.3l-4-4A.997.997 0 005 1.01c-.28 0-.53.11-.71.29l-4 4a1.003 1.003 0 001.42 1.42L4 4.42V18c0 .55.45 1 1 1s1-.45 1-1V4.42l2.29 2.29a1 1 0 00.71.3 1.003 1.003 0 00.71-1.71zM10 3.98c0 .01 0 .01 0 0V4v-.02zm0 12.04c0-.01 0-.01 0 0V16v.02zm9-3.03c-.28 0-.53.11-.71.29L16 15.58V2c0-.55-.45-1-1-1s-1 .45-1 1v13.58l-2.29-2.29a1.003 1.003 0 00-1.42 1.42l4 4c.18.18.43.29.71.29.28 0 .53-.11.71-.29l4-4c.18-.18.29-.43.29-.71 0-.56-.45-1.01-1-1.01z"],
    "symbol-circle": ["M10 4.01a6 6 0 100 12 6 6 0 100-12z"],
    "symbol-cross": ["M15 8.01h-3v-3c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v3H5c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h3v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-3h3c.55 0 1-.45 1-1v-2c0-.56-.45-1-1-1z"],
    "symbol-diamond": ["M15 10.01c0-.21-.08-.39-.18-.54l.02-.01-4-6-.02.01c-.18-.28-.47-.46-.82-.46s-.64.18-.82.45l-.01-.01-4 6 .02.01c-.11.16-.19.34-.19.55s.08.39.18.54l-.02.01 4 6 .02-.01c.18.27.47.46.82.46s.64-.19.82-.46l.02.01 4-6-.02-.01c.1-.16.18-.34.18-.54z"],
    "symbol-square": ["M15 4.01H5c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h10c.55 0 1-.45 1-1v-10c0-.56-.45-1-1-1z"],
    "symbol-triangle-down": ["M16 5c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1 0 .16.05.31.11.44H4.1l5 10h.01c.17.33.5.56.89.56s.72-.23.89-.56h.01l5-10h-.01c.06-.13.11-.28.11-.44z"],
    "symbol-triangle-up": ["M15.89 14.56l-4.99-10h-.01c-.17-.33-.5-.56-.89-.56s-.72.23-.89.56H9.1l-5 10h.01c-.06.13-.11.28-.11.44 0 .55.45 1 1 1h10c.55 0 1-.45 1-1 0-.16-.05-.31-.11-.44z"],
    "tag": ["M2 4a2 2 0 012-2h4.588a2 2 0 011.414.586l7.41 7.41a2 2 0 010 2.828l-4.588 4.588a2 2 0 01-2.829 0l-7.41-7.41A2 2 0 012 8.588V4zm3.489-.006a1.495 1.495 0 100 2.99 1.495 1.495 0 000-2.99z"],
    "take-action": ["M5 7c.28 0 .53-.11.71-.29l5-5A1.003 1.003 0 009.29.29l-5 5A1.003 1.003 0 005 7zm6 6a1.003 1.003 0 001.71.71l5-5a1.003 1.003 0 00-1.42-1.42l-5 5c-.18.18-.29.43-.29.71zm8 5h-1c0-.55-.45-1-1-1h-7c-.55 0-1 .45-1 1H8c-.55 0-1 .45-1 1s.45 1 1 1h11c.55 0 1-.45 1-1s-.45-1-1-1zm-9-6l6-6-1.29-1.29a1.003 1.003 0 00-1.42-1.42L12 2 6 8l1.29 1.29-7 7a1.003 1.003 0 001.42 1.42l7-7L10 12z"],
    "taxi": ["M19 9h-.33l.33 1v.5c0 .15-.03.3-.07.44h.01L17 17.23v.27c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V17H6v.5c0 .83-.67 1.5-1.5 1.5S3 18.33 3 17.5v-.27l-1.93-6.28h.01c-.05-.15-.08-.3-.08-.45V10s.02-.06.05-.16c.06-.17.16-.47.28-.84H1c-.55 0-1-.45-1-1s.45-1 1-1h1l1-3h-.01v-.01c.25-.64 1-1.31 1.67-1.5 0 0 .78-.21 2.33-.36V1c0-.55.45-1 1-1h4c.55 0 1 .45 1 1v1.13c1.55.14 2.33.36 2.33.36.67.19 1.42.86 1.67 1.5V4H17l1 3h1c.55 0 1 .45 1 1s-.45 1-1 1zM3 11.5c0 .83.67 1.5 1.5 1.5S6 12.33 6 11.5 5.33 10 4.5 10 3 10.67 3 11.5zM16 7l-1-3H5L4 7v1h12V7zm-.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"],
    "text-highlight": ["M16 17c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1s1-.45 1-1-.45-1-1-1c-.77 0-1.47.3-2 .78-.53-.48-1.23-.78-2-.78-.55 0-1 .45-1 1s.45 1 1 1 1 .45 1 1v12c0 .55-.45 1-1 1s-1 .45-1 1 .45 1 1 1c.77 0 1.47-.3 2-.78.53.48 1.23.78 2 .78.55 0 1-.45 1-1s-.45-1-1-1zm-4-4H2V7h10V5H1c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h11v-2zm7-8h-3v2h2v6h-2v2h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"],
    "th": ["M19 1H1c-.6 0-1 .5-1 1v16c0 .5.4 1 1 1h18c.5 0 1-.5 1-1V2c0-.5-.5-1-1-1zM7 17H2v-3h5v3zm0-4H2v-3h5v3zm0-4H2V6h5v3zm11 8H8v-3h10v3zm0-4H8v-3h10v3zm0-4H8V6h10v3z"],
    "th-derived": ["M5.3 13.3c-.2.2-.3.4-.3.7 0 .6.4 1 1 1 .3 0 .5-.1.7-.3l3-3c.2-.2.3-.4.3-.7s-.1-.5-.3-.7l-3-3C6.5 7.1 6.3 7 6 7c-.6 0-1 .4-1 1 0 .3.1.5.3.7L6.6 10H1c-.6 0-1 .4-1 1s.4 1 1 1h5.6l-1.3 1.3zM19 1H3c-.5 0-1 .5-1 1v6h1c0-1.7 1.3-3 3-3 .8 0 1.6.3 2.1.9l.1.1H9v.8l1 1V6h8v3h-6.8c.3.3.5.6.6 1H18v3h-6.8l-.1.1-.9.9H18v3h-8v-2.8l-1 1V17H4v-.8c-.6-.5-1-1.3-1-2.2H2v4c0 .5.5 1 1 1h16c.6 0 1-.5 1-1V2c0-.5-.5-1-1-1z"],
    "th-disconnect": ["M14.25 1H19c.5 0 1 .5 1 1v16c0 .5-.5 1-1 1h-7.221l.278-2H18v-3h-5.527l.14-1H18v-3h-4.971l.139-1H18V6h-4.416l.637-4.587c.02-.139.03-.277.03-.413zM8.221 1l-.694 5H2v3h5.11l-.139 1H2v3h4.555l-.14 1H2v3h3.999l-.22 1.587c-.02.139-.03.277-.03.413H1c-.6 0-1-.5-1-1V2c0-.5.4-1 1-1h7.221zM10.26.862a1 1 0 011.98.276l-2.5 18a1 1 0 01-1.98-.276l2.5-18z"],
    "th-filtered": ["M17.333 10l1.435-1.722a1 1 0 00.232-.64V4.85l1-.9V18c0 .5-.5 1-1 1H1c-.6 0-1-.5-1-1V2c0-.5.4-1 1-1h6.722L12 4.85V6H8v3h4v1H8v3h10v-3h-.667zM7 17v-3H2v3h5zm0-4v-3H2v3h5zm0-4V6H2v3h5zm11 8v-3H8v3h10z",
        "M19.35 0a.642.642 0 01.46 1.1l-3.03 3.03v2.95c0 .18-.07.34-.19.46l-1.28 1.29c-.11.1-.27.17-.45.17-.35 0-.64-.29-.64-.64V4.13L11.19 1.1a.642.642 0 01.45-1.1h7.71z"],
    "th-list": ["M19 1H1c-.6 0-1 .5-1 1v16c0 .5.4 1 1 1h18c.5 0 1-.5 1-1V2c0-.5-.5-1-1-1zm-1 16H2v-3h16v3zm0-4H2v-3h16v3zm0-4H2V6h16v3z"],
    "thumbs-down": ["M18.55 6.56c-.31-.01-.65-.03-1.02-.06.03 0 .06-.01.09-.01.88-.12 1.68-.63 1.76-1.37.08-.75-.58-1.25-1.46-1.33-.32-.03-.65-.05-.99-.08.59-.19 1.05-.54 1.09-1.2.05-.75-.99-1.32-1.87-1.41-.34-.03-.64-.05-.91-.07h-.11c-.28-.02-.54-.02-.77-.02-3.92-.08-7.29.6-9.36 1.93v7.72c2.67 1.66 5.95 4.61 5.26 7.08-.21.76.39 1.35 1.23 1.26 1.01-.11 1.71-1.18 1.75-2.28.05-1.29-.19-2.59-.62-3.74-.05-.32.01-.65.47-.68.61-.04 1.39-.08 1.99-.1.32 0 .64-.01.94-.03h.01c.52-.03 1-.07 1.42-.12.88-.11 1.69-.6 1.79-1.35.1-.75-.55-1.25-1.44-1.35-.07-.01-.13-.02-.2-.02.21-.02.42-.04.61-.06.88-.11 1.69-.6 1.79-1.35.09-.75-.56-1.31-1.45-1.36zM3 3H0v8h3c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "thumbs-up": ["M3 9H0v8h3c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zm16.99 3.09c-.1-.75-.91-1.24-1.79-1.35-.19-.02-.4-.05-.61-.06.07-.01.14-.01.2-.02.88-.1 1.53-.61 1.44-1.35-.1-.74-.91-1.24-1.79-1.35-.42-.05-.9-.09-1.42-.12h-.01l-.94-.03c-.6-.02-1.39-.05-1.99-.1-.45-.03-.51-.36-.47-.68.43-1.15.67-2.45.62-3.74-.04-1.11-.74-2.17-1.75-2.28-.84-.09-1.45.5-1.23 1.26.7 2.47-2.58 5.43-5.25 7.08v7.72c2.08 1.33 5.44 2.01 9.35 1.93.24 0 .49-.01.77-.02h.11c.27-.02.57-.04.91-.07.88-.08 1.92-.66 1.87-1.41-.04-.65-.5-1.01-1.09-1.2.34-.03.67-.05.99-.08.89-.08 1.55-.58 1.46-1.33-.08-.75-.88-1.25-1.76-1.37-.03 0-.06-.01-.09-.01.37-.02.71-.04 1.02-.06.91-.05 1.55-.61 1.45-1.36z"],
    "tick": ["M17 4c-.28 0-.53.11-.71.29L7 13.59 3.71 10.3A.965.965 0 003 10a1.003 1.003 0 00-.71 1.71l4 4c.18.18.43.29.71.29s.53-.11.71-.29l10-10A1.003 1.003 0 0017 4z"],
    "tick-circle": ["M10 20C4.48 20 0 15.52 0 10S4.48 0 10 0s10 4.48 10 10-4.48 10-10 10zm5-14c-.28 0-.53.11-.71.29L8 12.59l-2.29-2.3a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29.28 0 .53-.11.71-.29l7-7A1.003 1.003 0 0015 6z"],
    "time": ["M11 9.59V4c0-.55-.45-1-1-1s-1 .45-1 1v6c0 .28.11.53.29.71l3 3a1.003 1.003 0 001.42-1.42L11 9.59zM10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"],
    "timeline-area-chart": ["M19 16H2V3c0-.55-.45-1-1-1s-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zm0-13.41l-7.07 7.07-4.3-3.44-.01.01A.987.987 0 007 6c-.24 0-.46.1-.63.24l-.01-.01L3 9.03V15h16V2.59z"],
    "timeline-bar-chart": ["M19 17H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1zM9 16h2c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v13c0 .55.45 1 1 1zm6 0h2c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1zM3 16h2c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1z"],
    "timeline-events": ["M5 5c.6 0 1-.4 1-1V2c0-.5-.4-1-1-1s-1 .5-1 1v2c0 .6.4 1 1 1zm10 0c.6 0 1-.4 1-1V2c0-.5-.4-1-1-1s-1 .5-1 1v2c0 .6.4 1 1 1zm-9 9H4v2h2v-2zM17 3v1c0 1.1-.9 2-2 2s-2-.9-2-2V3H7v1c0 1.1-.9 2-2 2s-2-.9-2-2V3H2c-.5 0-1 .5-1 1v14c0 .5.5 1 1 1h16c.5 0 1-.5 1-1V4c0-.5-.5-1-1-1h-1zM7 17H3v-4h4v4zm0-5H3V8h4v4zm5 5H8v-4h4v4zm0-5H8V8h4v4zm5 5h-4v-4h4v4zm0-5h-4V8h4v4zm-6 2H9v2h2v-2zm5-5h-2v2h2V9z"],
    "timeline-line-chart": ["M19 16H2v-1.59l5-5 3.29 3.29c.18.19.43.3.71.3s.53-.11.71-.29l7-7a1.003 1.003 0 00-1.42-1.42L11 10.59l-3.29-3.3C7.53 7.11 7.28 7 7 7s-.53.11-.71.29L2 11.59V3c0-.55-.45-1-1-1s-1 .45-1 1v14a.998.998 0 001 1h18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "tint": ["M9.86 2S3.98 9.18 3.98 12.17C3.99 15.4 6.78 18 9.96 18c3.18-.01 6.04-2.63 6.03-5.86C15.99 9.05 9.86 2 9.86 2z"],
    "torch": ["M6.97 19c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-2h-6v2zm-3-15l3 4v8h6V8l3-4h-12zm5 5c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1V9zm6-9h-10c-.55 0-1 .45-1 1v2h12V1c0-.55-.45-1-1-1z"],
    "tractor": ["M4.5 11a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm11.499 1a4 4 0 110 8 4 4 0 010-8zm-11.5 1.571a1.928 1.928 0 100 3.857 1.928 1.928 0 000-3.857zM16 14.667a1.333 1.333 0 100 2.666 1.333 1.333 0 000-2.666zM5.999 0C7.46 0 8.527.668 9 2l.851 4.256c1.433.096 2.82.217 4.147.362V2h2L16 6.862c.962.13 1.886.275 2.767.435.779.141 1.232.614 1.232 1.284L20 13a4.995 4.995 0 00-4-1.997A5.001 5.001 0 0011.099 15h-1.12a5.499 5.499 0 00-5.478-4.994 5.482 5.482 0 00-3.377 1.157H.004v-1.18L0 7.327c-.002-.597.37-1.18.999-1.302V1a1 1 0 011-1h4zm1 2H3v4h.75c1.386.027 2.749.073 4.079.139L6.999 2z"],
    "train": ["M16 18h-2l2 2H4l.12-.12L6 18H4c-1.1 0-2-.9-2-2V2c0-1.1 3.58-2 8-2s8 .9 8 2v14c0 1.1-.9 2-2 2zM5.5 15c.83 0 1.5-.67 1.5-1.5S6.33 12 5.5 12 4 12.67 4 13.5 4.67 15 5.5 15zM9 3H4v6h5V3zm7 0h-5v6h5V3zm-1.5 9c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"],
    "translate": ["M19.89 18.56l-4.99-10h-.01c-.17-.33-.5-.56-.89-.56s-.72.23-.89.56h-.01l-1.73 3.46-2.8-2.3 1.99-1.64C11.44 7.34 12 6.23 12 5V4h1c.55 0 1-.45 1-1s-.45-1-1-1H8V1c0-.55-.45-1-1-1S6 .45 6 1v1H1c-.55 0-1 .45-1 1s.45 1 1 1h9v1c0 .62-.28 1.18-.73 1.54L7 8.42 4.73 6.54C4.28 6.18 4 5.62 4 5H2c0 1.23.56 2.34 1.44 3.07l1.99 1.64-3.06 2.52.01.01c-.23.18-.38.45-.38.76 0 .55.45 1 1 1 .24 0 .45-.1.63-.24l.01.01L7 11l3.36 2.77.01-.01c.02.02.05.03.08.05.01 0 .01.01.02.02l-2.36 4.73h.01c-.07.13-.12.28-.12.44 0 .55.45 1 1 1 .39 0 .72-.23.89-.56h.01L11.12 17h5.76l1.22 2.45h.01c.17.32.5.55.89.55.55 0 1-.45 1-1 0-.16-.05-.31-.11-.44zM12.12 15L14 11.24 15.88 15h-3.76z"],
    "trash": ["M17 1h-5c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1H3c-.55 0-1 .45-1 1v1h16V2c0-.55-.45-1-1-1zm.5 3h-15c-.28 0-.5.22-.5.5s.22.5.5.5H3v14c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5h.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zM7 16c0 .55-.45 1-1 1s-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v8zm4 0c0 .55-.45 1-1 1s-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v8zm4 0c0 .55-.45 1-1 1s-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v8z"],
    "tree": ["M11 15.542V20H9v-4.458L2 17l4.5-5.625L4 12l3.655-5.483L6 7l4-7 4 7-1.655-.483L16 12l-2.5-.625L18 17l-7-1.458z"],
    "trending-down": ["M19 10c-.55 0-1 .45-1 1v1.37l-6.25-7.03-.01.01A.971.971 0 0011 5c-.23 0-.42.09-.59.21l-.01-.01-3.43 2.58-5.42-3.61-.01.01A.969.969 0 001 4c-.55 0-1 .45-1 1 0 .35.19.64.46.82l-.01.01 6 4 .01-.02c.15.11.33.19.54.19.23 0 .42-.09.59-.21l.01.01 3.26-2.45L16.77 14H15c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1z"],
    "trending-up": ["M19 4h-4c-.55 0-1 .45-1 1s.45 1 1 1h1.77l-5.91 6.65L7.6 10.2l-.01.01C7.42 10.09 7.23 10 7 10c-.21 0-.39.08-.54.18l-.01-.02-6 4 .01.02c-.27.18-.46.47-.46.82 0 .55.45 1 1 1 .21 0 .39-.08.54-.18l.01.02 5.41-3.61 3.43 2.58.01-.01c.18.11.37.2.6.2.3 0 .56-.14.74-.34l.01.01L18 7.63V9c0 .55.45 1 1 1s1-.45 1-1V5c0-.55-.45-1-1-1z"],
    "truck": ["M16 0a1 1 0 011 1v11a1 1 0 011 1v3h.5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5H17v1a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1H6v1a1 1 0 01-1 1H4a1 1 0 01-1-1v-1H1.5a.5.5 0 01-.5-.5v-1a.5.5 0 01.5-.5H2v-3a1 1 0 011-1V1a1 1 0 112 0v3a2 2 0 012-2h6a2 2 0 012 2V1a1 1 0 011-1zm-4 10H8a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1v-4a1 1 0 00-1-1zm-7 4H4a1 1 0 000 2h1a1 1 0 000-2zm11 0h-1a1 1 0 000 2h1a1 1 0 000-2zm-4.5 0a.5.5 0 110 1h-3l-.09-.008A.5.5 0 018.5 14zm0-1.5a.5.5 0 110 1h-3l-.09-.008a.5.5 0 01.09-.992zm0-1.5a.5.5 0 110 1h-3l-.09-.008A.5.5 0 018.5 11zM14 5H6v3h8V5z"],
    "two-columns": ["M5 0H1C.45 0 0 .45 0 1v18c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm14.71 9.29l-3-3A1.003 1.003 0 0015 7v6a1.003 1.003 0 001.71.71l3-3c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71zM12 0H8c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "unarchive": ["M16.434 0a1 1 0 01.857.486L20 5v14a1 1 0 01-1 1H1a1 1 0 01-1-1V5L2.709.486A1 1 0 013.566 0h12.868zM10 8c-.28 0-.53.11-.71.29l-3 3-.084.096A1.003 1.003 0 007.71 12.71L9 11.41v4.58l.007.116c.058.496.482.884.993.884.55 0 1-.45 1-1v-4.58l1.29 1.29.081.073c.171.139.389.227.629.227a1.003 1.003 0 00.71-1.71l-3-3-.096-.084A1.002 1.002 0 0010 8zm6-6H4L2 5.002h16L16 2z"],
    "underline": ["M10 17c3.3 0 6-2.7 6-6V3.5c0-.8-.7-1.5-1.5-1.5S13 2.7 13 3.5V11c0 1.7-1.3 3-3 3s-3-1.3-3-3V3.5C7 2.7 6.3 2 5.5 2S4 2.7 4 3.5V11c0 3.3 2.7 6 6 6zM16.5 19h-13c-.3 0-.5.2-.5.5s.2.5.5.5h13c.3 0 .5-.2.5-.5s-.2-.5-.5-.5z"],
    "undo": ["M5 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9-9H3.41L5.7 2.71c.19-.18.3-.43.3-.71a1.003 1.003 0 00-1.71-.71l-4 4C.11 5.47 0 5.72 0 6c0 .28.11.53.29.71l4 4a1.003 1.003 0 001.42-1.42L3.41 7H14c2.21 0 4 1.79 4 4s-1.79 4-4 4H9v2h5c3.31 0 6-2.69 6-6s-2.69-6-6-6z"],
    "ungroup-objects": ["M4.5 6C2.01 6 0 8.01 0 10.5S2.01 15 4.5 15 9 12.99 9 10.5 6.99 6 4.5 6zm11 0C13.01 6 11 8.01 11 10.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5S17.99 6 15.5 6z"],
    "unknown-vehicle": ["M13 11.988v-4H4v-1l1-3h6V2.003a35.867 35.867 0 00-1-.015c-3.593 0-5.332.488-5.332.488-.67.188-1.424.864-1.674 1.503l-.004.009H3l-1 3H1a1 1 0 100 2h.333l-.28.84-.053.16v7.5a1.5 1.5 0 103 0v-.5h12v.5a1.5 1.5 0 103 0v-4.5h-5a1 1 0 01-1-1zm-8.5 1a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM19.83 2.782a2.392 2.392 0 00-.592-.853c-.276-.264-.64-.485-1.09-.663C17.695 1.09 17.132 1 16.457 1c-.523 0-.996.084-1.418.253a3.157 3.157 0 00-1.084.703c-.299.3-.532.656-.698 1.065-.166.41-.254.861-.264 1.353h2.096c0-.246.028-.476.085-.69.057-.214.145-.4.264-.56.119-.16.27-.287.456-.383.185-.095.406-.143.663-.143.38 0 .677.1.89.3.215.2.321.51.321.93.01.245-.035.45-.135.614-.1.164-.23.314-.392.45a8.598 8.598 0 01-.527.41 3.53 3.53 0 00-.542.485c-.171.187-.32.412-.45.676-.127.265-.206.592-.234.984v.614h1.924v-.519c.038-.273.13-.5.278-.683.147-.182.316-.343.506-.484a13.5 13.5 0 01.606-.424c.214-.14.408-.312.584-.512s.323-.442.442-.724.178-.642.178-1.079c0-.264-.059-.548-.178-.854zm-4.54 6.099v2.103h2.237V8.881H15.29z"],
    "unlock": ["M14 1c-2.21 0-4 1.79-4 4v4H2c-.55 0-1 .45-1 1v8c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-8c0-.55-.45-1-1-1h-2V5c0-1.1.9-2 2-2s2 .9 2 2v2c0 .55.45 1 1 1s1-.45 1-1V5c0-2.21-1.79-4-4-4z"],
    "unpin": ["M11.77 1.16c-.81.81-.74 2.28.02 3.76L6.1 8.71c-2.17-1.46-4.12-2-4.94-1.18l4.95 4.95-2.12 3.54 3.54-2.12 4.95 4.95c.82-.82.27-2.77-1.19-4.94l3.8-5.69c1.47.76 2.94.84 3.76.02l-7.08-7.08z"],
    "unresolve": ["M11.47 12.46c.16-.36.29-.74.38-1.14 0-.02.01-.04.01-.06.09-.4.14-.82.14-1.26 0-.44-.05-.86-.14-1.27 0-.02-.01-.04-.01-.06-.09-.4-.22-.78-.38-1.14-.01-.02-.02-.03-.02-.05a5.94 5.94 0 00-.61-1.03c0-.01-.01-.01-.01-.02a6.308 6.308 0 00-2.1-1.77c-.19-.1-.39-.18-.59-.26-.03-.01-.06-.02-.1-.03-.17-.07-.34-.12-.52-.17-.05-.01-.1-.03-.15-.04a4.34 4.34 0 00-.52-.09c-.05-.01-.11-.02-.17-.03C6.46 4.02 6.23 4 6 4c-3.31 0-6 2.69-6 6s2.69 6 6 6c.23 0 .46-.02.68-.04l.17-.03c.17-.02.34-.06.51-.09.05-.01.1-.03.15-.04.18-.05.36-.1.53-.17l.09-.03a5.973 5.973 0 002.68-2.04c0-.01.01-.01.01-.02.24-.32.44-.66.61-1.03.02-.01.03-.03.04-.05zM14 4c-.99 0-1.91.24-2.73.66a7.51 7.51 0 010 10.68c.82.42 1.74.66 2.73.66 3.31 0 6-2.69 6-6s-2.69-6-6-6z"],
    "updated": ["M10 0C6.71 0 3.82 1.6 2 4.05V2c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1H3.76C5.22 3.17 7.47 2 10 2c4.42 0 8 3.58 8 8s-3.58 8-8 8-8-3.58-8-8c0-.55-.45-1-1-1s-1 .45-1 1c0 5.52 4.48 10 10 10s10-4.48 10-10S15.52 0 10 0zm4 7c-.28 0-.53.11-.71.29L9 11.58 6.71 9.29a1.003 1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29.28 0 .53-.11.71-.29l5-5A1.003 1.003 0 0014 7z"],
    "upload": ["M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm4 10c-.28 0-.53-.11-.71-.29L11 7.41V15c0 .55-.45 1-1 1s-1-.45-1-1V7.41l-2.29 2.3a1.003 1.003 0 01-1.42-1.42l4-4c.18-.18.43-.29.71-.29s.53.11.71.29l4 4A1.003 1.003 0 0114 10z"],
    "user": ["M10 0C4.48 0 0 4.48 0 10c0 .33.02.65.05.97.01.12.03.23.05.35.03.2.05.4.09.59.03.14.06.28.1.42l.12.48c.05.16.1.31.15.46.05.13.09.27.15.4.06.16.13.32.21.48.05.11.1.22.16.33.09.17.17.34.27.5.05.09.1.17.15.25.11.18.22.35.34.52.04.06.08.11.12.17 1.19 1.62 2.85 2.86 4.78 3.53l.09.03c.46.15.93.27 1.42.36.08.01.17.03.25.04.49.07.99.12 1.5.12s1.01-.05 1.5-.12c.08-.01.17-.02.25-.04.49-.09.96-.21 1.42-.36l.09-.03c1.93-.67 3.59-1.91 4.78-3.53.04-.05.08-.1.12-.16.12-.17.23-.35.34-.53.05-.08.1-.16.15-.25.1-.17.19-.34.27-.51.05-.11.1-.21.15-.32.07-.16.14-.32.21-.49.05-.13.1-.26.14-.39.05-.15.11-.31.15-.46.05-.16.08-.32.12-.48.03-.14.07-.28.1-.42.04-.19.06-.39.09-.59.02-.12.04-.23.05-.35.05-.32.07-.64.07-.97 0-5.52-4.48-10-10-10zm0 18a7.94 7.94 0 01-6.15-2.89c.84-.44 1.86-.82 2.67-1.19 1.45-.65 1.3-1.05 1.35-1.59.01-.07.01-.14.01-.21-.51-.45-.93-1.08-1.2-1.8l-.01-.01c0-.01-.01-.02-.01-.03a4.42 4.42 0 01-.15-.48c-.33-.07-.53-.44-.61-.79-.08-.14-.23-.48-.2-.87.05-.51.26-.74.49-.83v-.08c0-.63.06-1.55.17-2.15.02-.17.06-.33.11-.5.21-.73.66-1.4 1.26-1.86.62-.47 1.5-.72 2.28-.72.78 0 1.65.25 2.27.73.6.46 1.05 1.12 1.26 1.86.05.16.08.33.11.5.11.6.17 1.51.17 2.15v.09c.22.1.42.33.46.82.04.39-.12.73-.2.87-.07.34-.27.71-.6.78-.04.16-.09.33-.15.48 0 .01-.02.05-.02.05-.26.71-.67 1.33-1.17 1.78 0 .08.01.16.01.23.05.54-.15.94 1.31 1.59.81.36 1.84.74 2.68 1.19A7.958 7.958 0 0110 18z"],
    "variable": ["M4.93 3.79a9.1 9.1 0 012.2-2.27L7.29 1c-1.38.59-2.57 1.33-3.55 2.22C2.46 4.39 1.49 5.72.83 7.23.28 8.51 0 9.81 0 11.12c0 2.28.83 4.57 2.49 6.86l.16-.55c-.49-1.23-.73-2.38-.73-3.44 0-1.67.28-3.46.84-5.36.55-1.9 1.28-3.51 2.17-4.84zm9.38 8.39l-.33-.2c-.37.54-.65.87-.82 1a.74.74 0 01-.42.12c-.19 0-.38-.12-.57-.37-.31-.42-.73-1.59-1.26-3.5.47-.85.86-1.41 1.19-1.67.23-.19.48-.29.74-.29.1 0 .28.04.53.11.26.07.48.11.68.11.27 0 .5-.1.68-.29.18-.19.27-.44.27-.75 0-.33-.09-.58-.27-.77-.18-.19-.44-.29-.78-.29-.3 0-.59.07-.86.22s-.61.47-1.02.97c-.31.37-.77 1.02-1.37 1.94a9.683 9.683 0 00-1.24-3.14l-3.24.59-.06.36c.24-.05.44-.07.61-.07.32 0 .59.14.8.43.33.45.8 1.8 1.39 4.07-.47.64-.78 1.06-.96 1.26-.28.32-.52.53-.7.62-.14.08-.3.11-.48.11-.14 0-.36-.08-.67-.23-.21-.1-.4-.15-.57-.15-.31 0-.57.11-.78.32s-.31.48-.31.8c0 .31.09.55.28.75.19.19.44.29.76.29.31 0 .6-.07.87-.2s.61-.42 1.02-.86c.41-.44.98-1.13 1.7-2.08.28.9.52 1.56.72 1.97.2.41.44.71.7.89.26.18.59.27.99.27.38 0 .77-.14 1.17-.43.54-.36 1.07-1 1.61-1.91zM17.51 1l-.15.54c.49 1.24.73 2.39.73 3.45 0 1.43-.21 2.96-.63 4.6-.33 1.26-.75 2.45-1.27 3.55-.52 1.11-1.02 1.97-1.51 2.6-.49.62-1.09 1.2-1.8 1.72l-.17.53c1.38-.59 2.57-1.34 3.55-2.23 1.29-1.17 2.26-2.5 2.91-4 .55-1.28.83-2.59.83-3.91 0-2.27-.83-4.56-2.49-6.85z"],
    "vertical-bar-chart-asc": ["M8 7H7c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1zM3 9H2c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1zm10-5h-1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm5-4h-1c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1z"],
    "vertical-bar-chart-desc": ["M3 0H2c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm5 4H7c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm5 3h-1c-.55 0-1 .45-1 1v11c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1zm5 2h-1c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1z"],
    "vertical-distribution": ["M1 2h18c.55 0 1-.45 1-1s-.45-1-1-1H1C.45 0 0 .45 0 1s.45 1 1 1zm2 5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1H3zm16 11H1c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "video": ["M19 2H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zM7 14V6l6 4-6 4z"],
    "volume-down": ["M15.92 3.93l-1.6 1.18A7.948 7.948 0 0116 10c0 1.84-.63 3.54-1.68 4.89l1.6 1.18A9.878 9.878 0 0018 10c0-2.29-.78-4.39-2.08-6.07zM11 3c-.28 0-.53.11-.71.29L7.59 6H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h4.59l2.71 2.71c.17.18.42.29.7.29.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "volume-off": ["M14 3c-.28 0-.53.11-.71.29L10.59 6H6c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h4.59l2.71 2.71c.17.18.42.29.7.29.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"],
    "volume-up": ["M9 3.43c-.28 0-.53.11-.71.29l-2.7 2.71H1c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h4.59l2.71 2.71a1.003 1.003 0 001.71-.71v-12c-.01-.55-.46-1-1.01-1zm8.31-1.56l-1.62 1.2C17.14 5.16 18 7.69 18 10.43s-.86 5.27-2.31 7.37l1.62 1.2C19 16.57 20 13.62 20 10.43c0-3.18-1-6.13-2.69-8.56zm-3.39 2.49l-1.6 1.18A7.948 7.948 0 0114 10.43c0 1.84-.63 3.54-1.68 4.89l1.6 1.18A9.94 9.94 0 0016 10.43c0-2.28-.78-4.38-2.08-6.07z"],
    "walk": ["M16 10h-2c-.23 0-.42-.09-.59-.21l-.01.01-1.69-1.27-.63 3.14 2.62 2.62c.19.18.3.43.3.71v4c0 .55-.45 1-1 1s-1-.45-1-1v-3.59L9.39 12.8l-2.45 6.55h-.01c-.14.38-.5.65-.93.65-.55 0-1-.45-1-1 0-.12.03-.24.07-.35h-.01L9.43 7h-2.9l-1.7 2.55-.01-.01c-.18.27-.47.46-.82.46-.55 0-1-.45-1-1 0-.21.08-.39.18-.54l-.01-.01 2-3 .02.01C5.36 5.19 5.65 5 6 5h4.18l.36-.96c-.33-.43-.54-.96-.54-1.54a2.5 2.5 0 015 0A2.5 2.5 0 0112.5 5c-.06 0-.12-.01-.18-.02l-.44 1.18L14.33 8H16c.55 0 1 .45 1 1s-.45 1-1 1z"],
    "warning-sign": ["M19.86 17.52l.01-.01-9-16-.01.01C10.69 1.21 10.37 1 10 1s-.69.21-.86.52l-.01-.01-9 16 .01.01c-.08.14-.14.3-.14.48 0 .55.45 1 1 1h18c.55 0 1-.45 1-1 0-.18-.06-.34-.14-.48zM11 17H9v-2h2v2zm0-3H9V6h2v8z"],
    "waterfall-chart": ["M13 7h2c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1zm-9 8h1c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1zm4-6h2c.55 0 1-.45 1-1s-.45-1-1-1H8c-.55 0-1 .45-1 1s.45 1 1 1zm11-5h-1c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h1c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zm0 12H2V3c0-.55-.45-1-1-1s-1 .45-1 1v14a.998.998 0 001 1h18c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "widget": ["M18 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM2 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm15-1h2V5h-2v10zM3 5H1v10h2V5zM2 0C.9 0 0 .9 0 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm3 3h10V1H5v2zm13 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5 19h10v-2H5v2z"],
    "widget-button": ["M1 4h18c.55 0 1 .45 1 1v10c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V5c0-.55.45-1 1-1zm1 2v8h16V6H2zm4 5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"],
    "widget-footer": ["M17 0H3c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 18H4v-4h12v4zm0-5H4V2h12v11z"],
    "widget-header": ["M17 0H3c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h14c.55 0 1-.45 1-1V1c0-.55-.45-1-1-1zm-1 18H4V7h12v11zm0-12H4V2h12v4z"],
    "wrench": ["M19.8 4.44L16.13 8.1l-3.55-.71-.71-3.53L15.54.21c-2.01-.53-4.23-.03-5.8 1.53-1.86 1.85-2.23 4.6-1.14 6.83L.59 16.59C.22 16.95 0 17.45 0 18a2 2 0 002 2c.55 0 1.05-.22 1.41-.59l8.03-8.04c2.23 1.05 4.97.67 6.82-1.16 1.57-1.56 2.07-3.77 1.54-5.77z"],
    "zoom-in": ["M19.56 17.44l-4.94-4.94A8.004 8.004 0 0016 8c0-4.42-3.58-8-8-8S0 3.58 0 8s3.58 8 8 8c1.67 0 3.21-.51 4.5-1.38l4.94 4.94a1.498 1.498 0 102.12-2.12zM8 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm3-7H9V5c0-.55-.45-1-1-1s-1 .45-1 1v2H5c-.55 0-1 .45-1 1s.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V9h2c.55 0 1-.45 1-1s-.45-1-1-1z"],
    "zoom-out": ["M11 7H5c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1zm8.56 10.44l-4.94-4.94A8.004 8.004 0 0016 8c0-4.42-3.58-8-8-8S0 3.58 0 8s3.58 8 8 8c1.67 0 3.21-.51 4.5-1.38l4.94 4.94a1.498 1.498 0 102.12-2.12zM8 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"],
    "zoom-to-fit": ["M1 7c.55 0 1-.45 1-1V2h4c.55 0 1-.45 1-1s-.45-1-1-1H1C.45 0 0 .45 0 1v5c0 .55.45 1 1 1zm5 1a1.003 1.003 0 00-1.71-.71l-2 2c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2 2a1.003 1.003 0 001.42-1.42L4.41 10 5.7 8.71c.19-.18.3-.43.3-.71zm2-2c.28 0 .53-.11.71-.29L10 4.41l1.29 1.29c.18.19.43.3.71.3a1.003 1.003 0 00.71-1.71l-2-2C10.53 2.11 10.28 2 10 2s-.53.11-.71.29l-2 2A1.003 1.003 0 008 6zM6 18H2v-4c0-.55-.45-1-1-1s-1 .45-1 1v5c0 .55.45 1 1 1h5c.55 0 1-.45 1-1s-.45-1-1-1zm8-6a1.003 1.003 0 001.71.71l2-2c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71l-2-2a1.003 1.003 0 00-1.42 1.42l1.3 1.29-1.29 1.29c-.19.18-.3.43-.3.71zm5-12h-5c-.55 0-1 .45-1 1s.45 1 1 1h4v4c0 .55.45 1 1 1s1-.45 1-1V1c0-.55-.45-1-1-1zm-7 14c-.28 0-.53.11-.71.29L10 15.59 8.71 14.3A.965.965 0 008 14a1.003 1.003 0 00-.71 1.71l2 2c.18.18.43.29.71.29s.53-.11.71-.29l2-2A1.003 1.003 0 0012 14zm7-1c-.55 0-1 .45-1 1v4h-4c-.55 0-1 .45-1 1s.45 1 1 1h5c.55 0 1-.45 1-1v-5c0-.55-.45-1-1-1z"],
};

/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Icon = /** @class */ (function (_super) {
    __extends(Icon, _super);
    function Icon() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Icon_1 = Icon;
    Icon.prototype.render = function () {
        var icon = this.props.icon;
        if (icon == null || typeof icon === "boolean") {
            return null;
        }
        else if (typeof icon !== "string") {
            return icon;
        }
        var _a = this.props, className = _a.className, color = _a.color, htmlTitle = _a.htmlTitle, _b = _a.iconSize, iconSize = _b === void 0 ? Icon_1.SIZE_STANDARD : _b, intent = _a.intent, _c = _a.title, title = _c === void 0 ? icon : _c, _d = _a.tagName, tagName = _d === void 0 ? "span" : _d, htmlprops = __rest(_a, ["className", "color", "htmlTitle", "iconSize", "intent", "title", "tagName"]);
        // choose which pixel grid is most appropriate for given icon size
        var pixelGridSize = iconSize >= Icon_1.SIZE_LARGE ? Icon_1.SIZE_LARGE : Icon_1.SIZE_STANDARD;
        // render path elements, or nothing if icon name is unknown.
        var paths = this.renderSvgPaths(pixelGridSize, icon);
        var classes$1 = cx(ICON, iconClass(icon), intentClass(intent), className);
        var viewBox = "0 0 " + pixelGridSize + " " + pixelGridSize;
        return createElement(tagName, __assign({}, htmlprops, { className: classes$1, title: htmlTitle }), createElement("svg", { fill: color, "data-icon": icon, width: iconSize, height: iconSize, viewBox: viewBox },
            title && createElement("desc", null, title),
            paths));
    };
    /** Render `<path>` elements for the given icon name. Returns `null` if name is unknown. */
    Icon.prototype.renderSvgPaths = function (pathsSize, iconName) {
        var svgPathsRecord = pathsSize === Icon_1.SIZE_STANDARD ? IconSvgPaths16 : IconSvgPaths20;
        var pathStrings = svgPathsRecord[iconName];
        if (pathStrings == null) {
            return null;
        }
        return pathStrings.map(function (d, i) { return createElement("path", { key: i, d: d, fillRule: "evenodd" }); });
    };
    var Icon_1;
    Icon.displayName = DISPLAYNAME_PREFIX + ".Icon";
    Icon.SIZE_STANDARD = 16;
    Icon.SIZE_LARGE = 20;
    Icon = Icon_1 = __decorate([
        polyfill
    ], Icon);
    return Icon;
}(AbstractPureComponent2));

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// see http://stackoverflow.com/a/18473154/3124288 for calculating arc path
var R = 45;
var SPINNER_TRACK$1 = "M 50,50 m 0,-" + R + " a " + R + "," + R + " 0 1 1 0," + R * 2 + " a " + R + "," + R + " 0 1 1 0,-" + R * 2;
// unitless total length of SVG path, to which stroke-dash* properties are relative.
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pathLength
// this value is the result of `<path d={SPINNER_TRACK} />.getTotalLength()` and works in all browsers:
var PATH_LENGTH = 280;
var MIN_SIZE = 10;
var STROKE_WIDTH = 4;
var MIN_STROKE_WIDTH = 16;
var Spinner = /** @class */ (function (_super) {
    __extends(Spinner, _super);
    function Spinner() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Spinner_1 = Spinner;
    Spinner.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.value !== this.props.value) {
            // IE/Edge: re-render after changing value to force SVG update
            this.forceUpdate();
        }
    };
    Spinner.prototype.render = function () {
        var _a;
        var _b = this.props, className = _b.className, intent = _b.intent, value = _b.value, _c = _b.tagName, tagName = _c === void 0 ? "div" : _c;
        var size = this.getSize();
        var classes$1 = cx(SPINNER, intentClass(intent), (_a = {}, _a[SPINNER_NO_SPIN] = value != null, _a), className);
        // keep spinner track width consistent at all sizes (down to about 10px).
        var strokeWidth = Math.min(MIN_STROKE_WIDTH, (STROKE_WIDTH * Spinner_1.SIZE_LARGE) / size);
        var strokeOffset = PATH_LENGTH - PATH_LENGTH * (value == null ? 0.25 : clamp(value, 0, 1));
        // multiple DOM elements around SVG are necessary to properly isolate animation:
        // - SVG elements in IE do not support anim/trans so they must be set on a parent HTML element.
        // - SPINNER_ANIMATION isolates svg from parent display and is always centered inside root element.
        return createElement(tagName, { className: classes$1 }, createElement(tagName, { className: SPINNER_ANIMATION }, createElement("svg", { width: size, height: size, strokeWidth: strokeWidth.toFixed(2), viewBox: this.getViewBox(strokeWidth) },
            createElement("path", { className: SPINNER_TRACK, d: SPINNER_TRACK$1 }),
            createElement("path", { className: SPINNER_HEAD, d: SPINNER_TRACK$1, pathLength: PATH_LENGTH, strokeDasharray: PATH_LENGTH + " " + PATH_LENGTH, strokeDashoffset: strokeOffset }))));
    };
    Spinner.prototype.validateProps = function (_a) {
        var _b = _a.className, className = _b === void 0 ? "" : _b, size = _a.size;
        if (size != null && (className.indexOf(SMALL) >= 0 || className.indexOf(LARGE) >= 0)) {
            console.warn(SPINNER_WARN_CLASSES_SIZE);
        }
    };
    /**
     * Resolve size to a pixel value.
     * Size can be set by className, props, default, or minimum constant.
     */
    Spinner.prototype.getSize = function () {
        var _a = this.props, _b = _a.className, className = _b === void 0 ? "" : _b, size = _a.size;
        if (size == null) {
            // allow Classes constants to determine default size.
            if (className.indexOf(SMALL) >= 0) {
                return Spinner_1.SIZE_SMALL;
            }
            else if (className.indexOf(LARGE) >= 0) {
                return Spinner_1.SIZE_LARGE;
            }
            return Spinner_1.SIZE_STANDARD;
        }
        return Math.max(MIN_SIZE, size);
    };
    /** Compute viewbox such that stroked track sits exactly at edge of image frame. */
    Spinner.prototype.getViewBox = function (strokeWidth) {
        var radius = R + strokeWidth / 2;
        var viewBoxX = (50 - radius).toFixed(2);
        var viewBoxWidth = (radius * 2).toFixed(2);
        return viewBoxX + " " + viewBoxX + " " + viewBoxWidth + " " + viewBoxWidth;
    };
    var Spinner_1;
    Spinner.displayName = DISPLAYNAME_PREFIX + ".Spinner";
    Spinner.SIZE_SMALL = 20;
    Spinner.SIZE_STANDARD = 50;
    Spinner.SIZE_LARGE = 100;
    Spinner = Spinner_1 = __decorate([
        polyfill
    ], Spinner);
    return Spinner;
}(AbstractPureComponent2));

/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var AbstractButton = /** @class */ (function (_super) {
    __extends(AbstractButton, _super);
    function AbstractButton() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isActive: false,
        };
        _this.refHandlers = {
            button: function (ref) {
                _this.buttonRef = ref;
                safeInvoke(_this.props.elementRef, ref);
            },
        };
        _this.currentKeyDown = null;
        // we're casting as `any` to get around a somewhat opaque safeInvoke error
        // that "Type argument candidate 'KeyboardEvent<T>' is not a valid type
        // argument because it is not a supertype of candidate
        // 'KeyboardEvent<HTMLElement>'."
        _this.handleKeyDown = function (e) {
            if (isKeyboardClick(e.which)) {
                e.preventDefault();
                if (e.which !== _this.currentKeyDown) {
                    _this.setState({ isActive: true });
                }
            }
            _this.currentKeyDown = e.which;
            safeInvoke(_this.props.onKeyDown, e);
        };
        _this.handleKeyUp = function (e) {
            if (isKeyboardClick(e.which)) {
                _this.setState({ isActive: false });
                _this.buttonRef.click();
            }
            _this.currentKeyDown = null;
            safeInvoke(_this.props.onKeyUp, e);
        };
        return _this;
    }
    AbstractButton.prototype.getCommonButtonProps = function () {
        var _a;
        var _b = this.props, alignText = _b.alignText, fill = _b.fill, large = _b.large, loading = _b.loading, minimal = _b.minimal, small = _b.small, tabIndex = _b.tabIndex;
        var disabled = this.props.disabled || loading;
        var className = cx(BUTTON, (_a = {},
            _a[ACTIVE] = this.state.isActive || this.props.active,
            _a[DISABLED] = disabled,
            _a[FILL] = fill,
            _a[LARGE] = large,
            _a[LOADING] = loading,
            _a[MINIMAL] = minimal,
            _a[SMALL] = small,
            _a), alignmentClass(alignText), intentClass(this.props.intent), this.props.className);
        return {
            className: className,
            disabled: disabled,
            onClick: disabled ? undefined : this.props.onClick,
            onKeyDown: this.handleKeyDown,
            onKeyUp: this.handleKeyUp,
            ref: this.refHandlers.button,
            tabIndex: disabled ? -1 : tabIndex,
        };
    };
    AbstractButton.prototype.renderChildren = function () {
        var _a = this.props, children = _a.children, icon = _a.icon, loading = _a.loading, rightIcon = _a.rightIcon, text = _a.text;
        return [
            loading && createElement(Spinner, { key: "loading", className: BUTTON_SPINNER, size: Icon.SIZE_LARGE }),
            createElement(Icon, { key: "leftIcon", icon: icon }),
            (!isReactNodeEmpty(text) || !isReactNodeEmpty(children)) && (createElement("span", { key: "text", className: BUTTON_TEXT },
                text,
                children)),
            createElement(Icon, { key: "rightIcon", icon: rightIcon }),
        ];
    };
    return AbstractButton;
}(AbstractPureComponent2));

/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Button = /** @class */ (function (_super) {
    __extends(Button, _super);
    function Button() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Button.prototype.render = function () {
        return (createElement("button", __assign({ type: "button" }, removeNonHTMLProps(this.props), this.getCommonButtonProps()), this.renderChildren()));
    };
    Button.displayName = DISPLAYNAME_PREFIX + ".Button";
    return Button;
}(AbstractButton));
var AnchorButton = /** @class */ (function (_super) {
    __extends(AnchorButton, _super);
    function AnchorButton() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnchorButton.prototype.render = function () {
        var _a = this.props, href = _a.href, _b = _a.tabIndex, tabIndex = _b === void 0 ? 0 : _b;
        var commonProps = this.getCommonButtonProps();
        return (createElement("a", __assign({ role: "button" }, removeNonHTMLProps(this.props), commonProps, { href: commonProps.disabled ? undefined : href, tabIndex: commonProps.disabled ? -1 : tabIndex }), this.renderChildren()));
    };
    AnchorButton.displayName = DISPLAYNAME_PREFIX + ".AnchorButton";
    return AnchorButton;
}(AbstractButton));

/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
function htmlElement(tagName, tagClassName) {
    return function (props) {
        var className = props.className, elementRef = props.elementRef, htmlProps = __rest(props, ["className", "elementRef"]);
        return createElement(tagName, __assign({}, htmlProps, { className: cx(tagClassName, className), ref: elementRef }));
    };
}
// the following components are linted by blueprint-html-components because
// they should rarely be used without the Blueprint classes/styles:
var H1 = htmlElement("h1", HEADING);
var H2 = htmlElement("h2", HEADING);
var H3 = htmlElement("h3", HEADING);
var H4 = htmlElement("h4", HEADING);
var H5 = htmlElement("h5", HEADING);
var H6 = htmlElement("h6", HEADING);
var Blockquote = htmlElement("blockquote", BLOCKQUOTE);
var Code = htmlElement("code", CODE);
var Pre = htmlElement("pre", CODE_BLOCK);
var Label = htmlElement("label", LABEL);
// these two are not linted by blueprint-html-components because there are valid
// uses of these elements without Blueprint styles:
var OL = htmlElement("ol", LIST);
var UL = htmlElement("ul", LIST);

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var MenuDivider = /** @class */ (function (_super) {
    __extends(MenuDivider, _super);
    function MenuDivider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MenuDivider.prototype.render = function () {
        var _a = this.props, className = _a.className, title = _a.title;
        if (title == null) {
            // simple divider
            return createElement("li", { className: cx(MENU_DIVIDER, className) });
        }
        else {
            // section header with title
            return (createElement("li", { className: cx(MENU_HEADER, className) },
                createElement(H6, null, title)));
        }
    };
    MenuDivider.displayName = DISPLAYNAME_PREFIX + ".MenuDivider";
    return MenuDivider;
}(Component));

/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Text = /** @class */ (function (_super) {
    __extends(Text, _super);
    function Text() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isContentOverflowing: false,
            textContent: "",
        };
        _this.textRef = null;
        return _this;
    }
    Text.prototype.componentDidMount = function () {
        this.update();
    };
    Text.prototype.componentDidUpdate = function () {
        this.update();
    };
    Text.prototype.render = function () {
        var _a;
        var _this = this;
        var classes$1 = cx((_a = {},
            _a[TEXT_OVERFLOW_ELLIPSIS] = this.props.ellipsize,
            _a), this.props.className);
        var _b = this.props, children = _b.children, _c = _b.tagName, tagName = _c === void 0 ? "div" : _c;
        return createElement(tagName, {
            className: classes$1,
            ref: function (ref) { return (_this.textRef = ref); },
            title: this.state.isContentOverflowing ? this.state.textContent : undefined,
        }, children);
    };
    Text.prototype.update = function () {
        if (this.textRef == null) {
            return;
        }
        var newState = {
            isContentOverflowing: this.props.ellipsize && this.textRef.scrollWidth > this.textRef.clientWidth,
            textContent: this.textRef.textContent,
        };
        this.setState(newState);
    };
    Text.displayName = DISPLAYNAME_PREFIX + ".Text";
    Text = __decorate([
        polyfill
    ], Text);
    return Text;
}(AbstractPureComponent2));

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var MenuItem = /** @class */ (function (_super) {
    __extends(MenuItem, _super);
    function MenuItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MenuItem.prototype.render = function () {
        var _a, _b;
        var _c = this.props, active = _c.active, className = _c.className, children = _c.children, disabled = _c.disabled, icon = _c.icon, intent = _c.intent, labelClassName = _c.labelClassName, labelElement = _c.labelElement, multiline = _c.multiline, popoverProps = _c.popoverProps, shouldDismissPopover = _c.shouldDismissPopover, text = _c.text, textClassName = _c.textClassName, _d = _c.tagName, tagName = _d === void 0 ? "a" : _d, htmlProps = __rest(_c, ["active", "className", "children", "disabled", "icon", "intent", "labelClassName", "labelElement", "multiline", "popoverProps", "shouldDismissPopover", "text", "textClassName", "tagName"]);
        var hasSubmenu = children != null;
        var intentClass$1 = intentClass(intent);
        var anchorClasses = cx(MENU_ITEM, intentClass$1, (_a = {},
            _a[ACTIVE] = active,
            _a[INTENT_PRIMARY] = active && intentClass$1 == null,
            _a[DISABLED] = disabled,
            // prevent popover from closing when clicking on submenu trigger or disabled item
            _a[POPOVER_DISMISS] = shouldDismissPopover && !disabled && !hasSubmenu,
            _a), className);
        var target = createElement(tagName, __assign({}, htmlProps, (disabled ? DISABLED_PROPS : {}), { className: anchorClasses }), createElement(Icon, { icon: icon }), createElement(Text, { className: cx(FILL, textClassName), ellipsize: !multiline }, text), this.maybeRenderLabel(labelElement), hasSubmenu ? createElement(Icon, { icon: "caret-right" }) : undefined);
        var liClasses = cx((_b = {}, _b[MENU_SUBMENU] = hasSubmenu, _b));
        return createElement("li", { className: liClasses }, this.maybeRenderPopover(target, children));
    };
    MenuItem.prototype.maybeRenderLabel = function (labelElement) {
        var _a = this.props, label = _a.label, labelClassName = _a.labelClassName;
        if (label == null && labelElement == null) {
            return null;
        }
        return (createElement("span", { className: cx(MENU_ITEM_LABEL, labelClassName) },
            label,
            labelElement));
    };
    MenuItem.prototype.maybeRenderPopover = function (target, children) {
        if (children == null) {
            return target;
        }
        var _a = this.props, disabled = _a.disabled, popoverProps = _a.popoverProps;
        return (createElement(Popover, __assign({ autoFocus: false, captureDismiss: false, disabled: disabled, enforceFocus: false, hoverCloseDelay: 0, interactionKind: PopoverInteractionKind.HOVER, modifiers: SUBMENU_POPOVER_MODIFIERS, position: Position.RIGHT_TOP, usePortal: false }, popoverProps, { content: createElement(Menu, null, children), minimal: true, popoverClassName: cx(MENU_SUBMENU, popoverProps.popoverClassName), target: target })));
    };
    MenuItem.defaultProps = {
        disabled: false,
        multiline: false,
        popoverProps: {},
        shouldDismissPopover: true,
        text: "",
    };
    MenuItem.displayName = DISPLAYNAME_PREFIX + ".MenuItem";
    MenuItem = __decorate([
        polyfill
    ], MenuItem);
    return MenuItem;
}(AbstractPureComponent2));
var SUBMENU_POPOVER_MODIFIERS = {
    // 20px padding - scrollbar width + a bit
    flip: { boundariesElement: "viewport", padding: 20 },
    // shift popover up 5px so MenuItems align
    offset: { offset: -5 },
    preventOverflow: { boundariesElement: "viewport", padding: 20 },
};
// props to ignore when disabled
var DISABLED_PROPS = {
    href: undefined,
    onClick: undefined,
    onMouseDown: undefined,
    onMouseEnter: undefined,
    onMouseLeave: undefined,
    tabIndex: -1,
};

/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Menu = /** @class */ (function (_super) {
    __extends(Menu, _super);
    function Menu() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Menu.prototype.render = function () {
        var _a;
        var _b = this.props, className = _b.className, children = _b.children, large = _b.large, ulRef = _b.ulRef, htmlProps = __rest(_b, ["className", "children", "large", "ulRef"]);
        var classes$1 = cx(MENU, (_a = {}, _a[LARGE] = large, _a), className);
        return (createElement("ul", __assign({}, htmlProps, { className: classes$1, ref: ulRef }), children));
    };
    Menu.displayName = DISPLAYNAME_PREFIX + ".Menu";
    Menu.Divider = MenuDivider;
    Menu.Item = MenuItem;
    Menu = __decorate([
        polyfill
    ], Menu);
    return Menu;
}(AbstractPureComponent2));

/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var DEFAULT_RIGHT_ELEMENT_WIDTH = 10;
var InputGroup = /** @class */ (function (_super) {
    __extends(InputGroup, _super);
    function InputGroup() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            rightElementWidth: DEFAULT_RIGHT_ELEMENT_WIDTH,
        };
        _this.refHandlers = {
            rightElement: function (ref) { return (_this.rightElement = ref); },
        };
        return _this;
    }
    InputGroup.prototype.render = function () {
        var _a;
        var _b = this.props, className = _b.className, disabled = _b.disabled, fill = _b.fill, intent = _b.intent, large = _b.large, small = _b.small, leftIcon = _b.leftIcon, round = _b.round;
        var classes$1 = cx(INPUT_GROUP, intentClass(intent), (_a = {},
            _a[DISABLED] = disabled,
            _a[FILL] = fill,
            _a[LARGE] = large,
            _a[SMALL] = small,
            _a[ROUND] = round,
            _a), className);
        var style = __assign({}, this.props.style, { paddingRight: this.state.rightElementWidth });
        return (createElement("div", { className: classes$1 },
            createElement(Icon, { icon: leftIcon }),
            createElement("input", __assign({ type: "text" }, removeNonHTMLProps(this.props), { className: INPUT, ref: this.props.inputRef, style: style })),
            this.maybeRenderRightElement()));
    };
    InputGroup.prototype.componentDidMount = function () {
        if (this.rightElement != null) {
            var clientWidth = this.rightElement.clientWidth;
            // small threshold to prevent infinite loops
            if (Math.abs(clientWidth - this.state.rightElementWidth) > 2) {
                this.setState({ rightElementWidth: clientWidth });
            }
        }
    };
    InputGroup.prototype.maybeRenderRightElement = function () {
        var rightElement = this.props.rightElement;
        if (rightElement == null) {
            return undefined;
        }
        return (createElement("span", { className: INPUT_ACTION, ref: this.refHandlers.rightElement }, rightElement));
    };
    InputGroup.displayName = DISPLAYNAME_PREFIX + ".InputGroup";
    InputGroup = __decorate([
        polyfill
    ], InputGroup);
    return InputGroup;
}(AbstractPureComponent2));

/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Tag = /** @class */ (function (_super) {
    __extends(Tag, _super);
    function Tag() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.onRemoveClick = function (e) {
            safeInvoke(_this.props.onRemove, e, _this.props);
        };
        return _this;
    }
    Tag.prototype.render = function () {
        var _a;
        var _b = this.props, active = _b.active, children = _b.children, className = _b.className, fill = _b.fill, icon = _b.icon, intent = _b.intent, interactive = _b.interactive, large = _b.large, minimal = _b.minimal, multiline = _b.multiline, onRemove = _b.onRemove, rightIcon = _b.rightIcon, round = _b.round, _c = _b.tabIndex, tabIndex = _c === void 0 ? 0 : _c, htmlProps = __rest(_b, ["active", "children", "className", "fill", "icon", "intent", "interactive", "large", "minimal", "multiline", "onRemove", "rightIcon", "round", "tabIndex"]);
        var isRemovable = isFunction(onRemove);
        var tagClasses = cx(TAG, intentClass(intent), (_a = {},
            _a[ACTIVE] = active,
            _a[FILL] = fill,
            _a[INTERACTIVE] = interactive,
            _a[LARGE] = large,
            _a[MINIMAL] = minimal,
            _a[ROUND] = round,
            _a), className);
        var isLarge = large || tagClasses.indexOf(LARGE) >= 0;
        var removeButton = isRemovable ? (createElement("button", { type: "button", className: TAG_REMOVE, onClick: this.onRemoveClick },
            createElement(Icon, { icon: "small-cross", iconSize: isLarge ? Icon.SIZE_LARGE : Icon.SIZE_STANDARD }))) : null;
        return (createElement("span", __assign({}, htmlProps, { className: tagClasses, tabIndex: interactive ? tabIndex : undefined }),
            createElement(Icon, { icon: icon }),
            !isReactNodeEmpty(children) && (createElement(Text, { className: FILL, ellipsize: !multiline, tagName: "span" }, children)),
            createElement(Icon, { icon: rightIcon }),
            removeButton));
    };
    Tag.displayName = DISPLAYNAME_PREFIX + ".Tag";
    Tag = __decorate([
        polyfill
    ], Tag);
    return Tag;
}(AbstractPureComponent2));

/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** special value for absence of active tag */
var NONE = -1;
var TagInput = /** @class */ (function (_super) {
    __extends(TagInput, _super);
    function TagInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            activeIndex: NONE,
            inputValue: _this.props.inputValue || "",
            isInputFocused: false,
        };
        _this.refHandlers = {
            input: function (ref) {
                _this.inputElement = ref;
                safeInvoke(_this.props.inputRef, ref);
            },
        };
        _this.addTags = function (value, method) {
            if (method === void 0) { method = "default"; }
            var _a = _this.props, inputValue = _a.inputValue, onAdd = _a.onAdd, onChange = _a.onChange, values = _a.values;
            var newValues = _this.getValues(value);
            var shouldClearInput = safeInvoke(onAdd, newValues, method) !== false && inputValue === undefined;
            // avoid a potentially expensive computation if this prop is omitted
            if (isFunction(onChange)) {
                shouldClearInput = onChange(values.concat(newValues)) !== false && shouldClearInput;
            }
            // only explicit return false cancels text clearing
            if (shouldClearInput) {
                _this.setState({ inputValue: "" });
            }
        };
        _this.maybeRenderTag = function (tag, index) {
            if (!tag) {
                return null;
            }
            var _a = _this.props, large = _a.large, tagProps = _a.tagProps;
            var props = isFunction(tagProps) ? tagProps(tag, index) : tagProps;
            return (createElement(Tag, __assign({ active: index === _this.state.activeIndex, "data-tag-index": index, key: tag + "__" + index, large: large, onRemove: _this.props.disabled ? null : _this.handleRemoveTag }, props), tag));
        };
        _this.handleContainerClick = function () {
            if (_this.inputElement != null) {
                _this.inputElement.focus();
            }
        };
        _this.handleContainerBlur = function (_a) {
            var currentTarget = _a.currentTarget;
            requestAnimationFrame(function () {
                // we only care if the blur event is leaving the container.
                // defer this check using rAF so activeElement will have updated.
                if (!currentTarget.contains(document.activeElement)) {
                    if (_this.props.addOnBlur && _this.state.inputValue !== undefined && _this.state.inputValue.length > 0) {
                        _this.addTags(_this.state.inputValue, "blur");
                    }
                    _this.setState({ activeIndex: NONE, isInputFocused: false });
                }
            });
        };
        _this.handleInputFocus = function (event) {
            _this.setState({ isInputFocused: true });
            safeInvoke(_this.props.inputProps.onFocus, event);
        };
        _this.handleInputChange = function (event) {
            _this.setState({ activeIndex: NONE, inputValue: event.currentTarget.value });
            safeInvoke(_this.props.onInputChange, event);
            safeInvoke(_this.props.inputProps.onChange, event);
        };
        _this.handleInputKeyDown = function (event) {
            var _a = event.currentTarget, selectionEnd = _a.selectionEnd, value = _a.value;
            var activeIndex = _this.state.activeIndex;
            var activeIndexToEmit = activeIndex;
            if (event.which === ENTER && value.length > 0) {
                _this.addTags(value, "default");
            }
            else if (selectionEnd === 0 && _this.props.values.length > 0) {
                // cursor at beginning of input allows interaction with tags.
                // use selectionEnd to verify cursor position and no text selection.
                if (event.which === ARROW_LEFT || event.which === ARROW_RIGHT) {
                    var nextActiveIndex = _this.getNextActiveIndex(event.which === ARROW_RIGHT ? 1 : -1);
                    if (nextActiveIndex !== activeIndex) {
                        event.stopPropagation();
                        activeIndexToEmit = nextActiveIndex;
                        _this.setState({ activeIndex: nextActiveIndex });
                    }
                }
                else if (event.which === BACKSPACE) {
                    _this.handleBackspaceToRemove(event);
                }
            }
            _this.invokeKeyPressCallback("onKeyDown", event, activeIndexToEmit);
        };
        _this.handleInputKeyUp = function (event) {
            _this.invokeKeyPressCallback("onKeyUp", event, _this.state.activeIndex);
        };
        _this.handleInputPaste = function (event) {
            var separator = _this.props.separator;
            var value = event.clipboardData.getData("text");
            if (!_this.props.addOnPaste || value.length === 0) {
                return;
            }
            // special case as a UX nicety: if the user pasted only one value with no delimiters in it, leave that value in
            // the input field so that the user can refine it before converting it to a tag manually.
            if (separator === false || value.split(separator).length === 1) {
                return;
            }
            event.preventDefault();
            _this.addTags(value, "paste");
        };
        _this.handleRemoveTag = function (event) {
            // using data attribute to simplify callback logic -- one handler for all children
            var index = +event.currentTarget.parentElement.getAttribute("data-tag-index");
            _this.removeIndexFromValues(index);
        };
        return _this;
    }
    TagInput.getDerivedStateFromProps = function (props, state) {
        if (props.inputValue !== state.prevInputValueProp) {
            return {
                inputValue: props.inputValue,
                prevInputValueProp: props.inputValue,
            };
        }
        return null;
    };
    TagInput.prototype.render = function () {
        var _a;
        var _b = this.props, className = _b.className, disabled = _b.disabled, fill = _b.fill, inputProps = _b.inputProps, intent = _b.intent, large = _b.large, leftIcon = _b.leftIcon, placeholder = _b.placeholder, values = _b.values;
        var classes$1 = cx(INPUT, TAG_INPUT, (_a = {},
            _a[ACTIVE] = this.state.isInputFocused,
            _a[DISABLED] = disabled,
            _a[FILL] = fill,
            _a[LARGE] = large,
            _a), intentClass(intent), className);
        var isLarge = classes$1.indexOf(LARGE) > NONE;
        // use placeholder prop only if it's defined and values list is empty or contains only falsy values
        var isSomeValueDefined = values.some(function (val) { return !!val; });
        var resolvedPlaceholder = placeholder == null || isSomeValueDefined ? inputProps.placeholder : placeholder;
        return (createElement("div", { className: classes$1, onBlur: this.handleContainerBlur, onClick: this.handleContainerClick },
            createElement(Icon, { className: TAG_INPUT_ICON, icon: leftIcon, iconSize: isLarge ? Icon.SIZE_LARGE : Icon.SIZE_STANDARD }),
            createElement("div", { className: TAG_INPUT_VALUES },
                values.map(this.maybeRenderTag),
                this.props.children,
                createElement("input", __assign({ value: this.state.inputValue }, inputProps, { onFocus: this.handleInputFocus, onChange: this.handleInputChange, onKeyDown: this.handleInputKeyDown, onKeyUp: this.handleInputKeyUp, onPaste: this.handleInputPaste, placeholder: resolvedPlaceholder, ref: this.refHandlers.input, className: cx(INPUT_GHOST, inputProps.className), disabled: disabled }))),
            this.props.rightElement));
    };
    TagInput.prototype.getNextActiveIndex = function (direction) {
        var activeIndex = this.state.activeIndex;
        if (activeIndex === NONE) {
            // nothing active & moving left: select last defined value. otherwise select nothing.
            return direction < 0 ? this.findNextIndex(this.props.values.length, -1) : NONE;
        }
        else {
            // otherwise, move in direction and clamp to bounds.
            // note that upper bound allows going one beyond last item
            // so focus can move off the right end, into the text input.
            return this.findNextIndex(activeIndex, direction);
        }
    };
    TagInput.prototype.findNextIndex = function (startIndex, direction) {
        var values = this.props.values;
        var index = startIndex + direction;
        while (index > 0 && index < values.length && !values[index]) {
            index += direction;
        }
        return clamp(index, 0, values.length);
    };
    /**
     * Splits inputValue on separator prop,
     * trims whitespace from each new value,
     * and ignores empty values.
     */
    TagInput.prototype.getValues = function (inputValue) {
        var separator = this.props.separator;
        // NOTE: split() typings define two overrides for string and RegExp.
        // this does not play well with our union prop type, so we'll just declare it as a valid type.
        return (separator === false ? [inputValue] : inputValue.split(separator))
            .map(function (val) { return val.trim(); })
            .filter(function (val) { return val.length > 0; });
    };
    TagInput.prototype.handleBackspaceToRemove = function (event) {
        var previousActiveIndex = this.state.activeIndex;
        // always move leftward one item (this will focus last item if nothing is focused)
        this.setState({ activeIndex: this.getNextActiveIndex(-1) });
        // delete item if there was a previous valid selection (ignore first backspace to focus last item)
        if (this.isValidIndex(previousActiveIndex)) {
            event.stopPropagation();
            this.removeIndexFromValues(previousActiveIndex);
        }
    };
    /** Remove the item at the given index by invoking `onRemove` and `onChange` accordingly. */
    TagInput.prototype.removeIndexFromValues = function (index) {
        var _a = this.props, onChange = _a.onChange, onRemove = _a.onRemove, values = _a.values;
        safeInvoke(onRemove, values[index], index);
        if (isFunction(onChange)) {
            onChange(values.filter(function (_, i) { return i !== index; }));
        }
    };
    TagInput.prototype.invokeKeyPressCallback = function (propCallbackName, event, activeIndex) {
        safeInvoke(this.props[propCallbackName], event, activeIndex === NONE ? undefined : activeIndex);
        safeInvoke(this.props.inputProps[propCallbackName], event);
    };
    /** Returns whether the given index represents a valid item in `this.props.values`. */
    TagInput.prototype.isValidIndex = function (index) {
        return index !== NONE && index < this.props.values.length;
    };
    TagInput.displayName = DISPLAYNAME_PREFIX + ".TagInput";
    TagInput.defaultProps = {
        addOnBlur: false,
        addOnPaste: true,
        inputProps: {},
        separator: /[,\n\r]/,
        tagProps: {},
    };
    TagInput = __decorate([
        polyfill
    ], TagInput);
    return TagInput;
}(AbstractPureComponent2));

export { CALLOUT as $, AbstractPureComponent2 as A, Button as B, CONTEXT_MENU_POPOVER_TARGET as C, DARK as D, BREADCRUMB_CURRENT as E, FOCUS_DISABLED as F, DISABLED as G, H4 as H, Icon as I, shallowCompareKeys as J, OVERFLOW_LIST_OBSERVE_PARENTS_CHANGED as K, OVERFLOW_LIST as L, OVERFLOW_LIST_SPACER as M, BREADCRUMBS as N, Overlay as O, Popover as P, BREADCRUMBS_COLLAPSED as Q, ResizeSensor as R, Menu as S, MenuItem as T, BUTTON_GROUP as U, FILL as V, LARGE as W, MINIMAL as X, VERTICAL as Y, alignmentClass as Z, __extends as _, __assign as a, removeNonHTMLProps as a$, intentClass as a0, CALLOUT_ICON as a1, Intent as a2, CARD as a3, INTERACTIVE as a4, elevationClass as a5, Elevation as a6, COLLAPSE as a7, COLLAPSE_BODY as a8, COLLAPSIBLE_LIST as a9, CONTROL_INDICATOR_CHILD as aA, SWITCH_INNER_TEXT as aB, SWITCH as aC, RADIO as aD, CHECKBOX as aE, CONTROL as aF, INLINE as aG, CONTROL_INDICATOR as aH, FILE_INPUT as aI, FILE_INPUT_HAS_SELECTION as aJ, FILE_UPLOAD_INPUT as aK, FILE_UPLOAD_INPUT_CUSTOM_TEXT as aL, getClassNamespace as aM, LABEL as aN, TEXT_MUTED as aO, FORM_CONTENT as aP, FORM_HELPER_TEXT as aQ, FORM_GROUP as aR, NUMERIC_INPUT as aS, NUMERIC_INPUT_MIN_MAX as aT, NUMERIC_INPUT_STEP_SIZE_NULL as aU, NUMERIC_INPUT_STEP_SIZE_NON_POSITIVE as aV, NUMERIC_INPUT_MINOR_STEP_SIZE_NON_POSITIVE as aW, NUMERIC_INPUT_MAJOR_STEP_SIZE_NON_POSITIVE as aX, NUMERIC_INPUT_MINOR_STEP_SIZE_BOUND as aY, NUMERIC_INPUT_MAJOR_STEP_SIZE_BOUND as aZ, FIXED as a_, isElementOfType as aa, COLLAPSIBLE_LIST_INVALID_CHILD as ab, isFunction as ac, CONTEXTMENU_WARN_DECORATOR_NO_METHOD as ad, CONTEXTMENU_WARN_DECORATOR_NEEDS_REACT_ELEMENT as ae, getDisplayName as af, findDOMNode as ag, DIVIDER as ah, DRAWER as ai, positionClass as aj, isPositionHorizontal as ak, OVERLAY_CONTAINER as al, DRAWER_VERTICAL_IS_IGNORED as am, getPositionIgnoreAngles as an, DRAWER_ANGLE_POSITIONS_ARE_CASTED as ao, DRAWER_HEADER as ap, EDITABLE_TEXT as aq, EDITABLE_TEXT_EDITING as ar, EDITABLE_TEXT_PLACEHOLDER as as, MULTILINE as at, EDITABLE_TEXT_CONTENT as au, EDITABLE_TEXT_INPUT as av, clamp as aw, ESCAPE as ax, ENTER as ay, CONTROL_GROUP as az, Position as b, arraysEqual as b$, InputGroup as b0, isKeyboardClick as b1, ARROW_UP as b2, ARROW_DOWN as b3, countDecimalPlaces as b4, RADIOGROUP_WARN_CHILDREN_OPTIONS_MUTEX as b5, INPUT as b6, SMALL as b7, HTML_SELECT as b8, HTML_TABLE as b9, Text as bA, HEADING as bB, PANEL_STACK_HEADER_BACK as bC, PANEL_STACK as bD, reactTransitionGroup_2 as bE, PANEL_STACK_INITIAL_PANEL_STACK_MUTEX as bF, PANEL_STACK_REQUIRES_PANEL as bG, reactTransitionGroup_4 as bH, PROGRESS_BAR as bI, PROGRESS_NO_ANIMATION as bJ, PROGRESS_NO_STRIPES as bK, PROGRESS_METER as bL, ARROW_LEFT as bM, ARROW_RIGHT as bN, SLIDER_HANDLE as bO, ACTIVE as bP, SLIDER_LABEL as bQ, SLIDER as bR, SLIDER_TRACK as bS, SLIDER_AXIS as bT, SLIDER_ZERO_STEP as bU, SLIDER_ZERO_LABEL_STEP as bV, MULTISLIDER_INVALID_CHILD as bW, approxEqual as bX, SLIDER_PROGRESS as bY, START as bZ, END as b_, HTML_TABLE_BORDERED as ba, HTML_TABLE_CONDENSED as bb, HTML_TABLE_STRIPED as bc, KEY_COMBO as bd, KEY as be, MODIFIER_KEY as bf, HOTKEY as bg, HOTKEY_LABEL as bh, PORTAL as bi, HOTKEY_DIALOG as bj, DIALOG_BODY as bk, HOTKEYS_WARN_DECORATOR_NO_METHOD as bl, HOTKEYS_WARN_DECORATOR_NEEDS_REACT_ELEMENT as bm, HOTKEY_COLUMN as bn, HOTKEYS_HOTKEY_CHILDREN as bo, NAVBAR_DIVIDER as bp, NAVBAR_GROUP as bq, Alignment as br, NAVBAR_HEADING as bs, NAVBAR as bt, FIXED_TOP as bu, NON_IDEAL_STATE as bv, ensureElement as bw, NON_IDEAL_STATE_VISUAL as bx, PANEL_STACK_VIEW as by, PANEL_STACK_HEADER as bz, __decorate as c, RANGESLIDER_NULL_VALUE as c0, TAB_PANEL as c1, TAB as c2, FLEX_EXPANDER as c3, TAB_INDICATOR_WRAPPER as c4, TAB_INDICATOR as c5, TABS as c6, TAB_LIST as c7, TOAST as c8, TOAST_MESSAGE as c9, H3 as cA, H5 as cB, H6 as cC, Blockquote as cD, Code as cE, Pre as cF, Label as cG, OL as cH, UL as cI, MenuDivider as cJ, PopoverInteractionKind as cK, Portal as cL, Spinner as cM, Tag as cN, TagInput as cO, Tooltip as cP, safeInvokeMember as cQ, TAB$1 as cR, BACKSPACE as cS, TAG_REMOVE as cT, AnchorButton as ca, TOAST_CONTAINER as cb, TOASTER_MAX_TOASTS_INVALID as cc, TOASTER_WARN_INLINE as cd, TOASTER_CREATE_NULL as ce, TREE_NODE as cf, TREE_NODE_SELECTED as cg, TREE_NODE_EXPANDED as ch, TREE_NODE_CONTENT as ci, TREE_NODE_ICON as cj, TREE_NODE_LABEL as ck, TREE_NODE_CARET as cl, TREE_NODE_CARET_OPEN as cm, TREE_NODE_CARET_CLOSED as cn, TREE_NODE_CARET_NONE as co, TREE_NODE_SECONDARY_LABEL as cp, TREE as cq, TREE_ROOT as cr, TREE_NODE_LIST as cs, classes as ct, keys as cu, utils as cv, AbstractComponent2 as cw, isPositionVertical as cx, H1 as cy, H2 as cz, CONTEXT_MENU as d, OVERLAY_SCROLL_CONTAINER as e, DIALOG_CONTAINER as f, DIALOG as g, DIALOG_WARN_NO_HEADER_ICON as h, isNodeEnv as i, DIALOG_WARN_NO_HEADER_CLOSE_BUTTON as j, DIALOG_CLOSE_BUTTON as k, DIALOG_HEADER as l, DISPLAYNAME_PREFIX as m, __rest as n, ALERT as o, polyfill as p, ALERT_BODY as q, render as r, safeInvoke as s, ALERT_CONTENTS as t, unmountComponentAtNode as u, ALERT_FOOTER as v, ALERT_WARN_CANCEL_PROPS as w, ALERT_WARN_CANCEL_ESCAPE_KEY as x, ALERT_WARN_CANCEL_OUTSIDE_CLICK as y, BREADCRUMB as z };
