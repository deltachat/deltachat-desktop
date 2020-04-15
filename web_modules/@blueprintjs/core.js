import { F as FOCUS_DISABLED, _ as __extends, i as isNodeEnv, D as DARK, C as CONTEXT_MENU_POPOVER_TARGET, P as Popover, a as __assign, b as Position, s as safeInvoke, c as __decorate, p as polyfill, A as AbstractPureComponent2, d as CONTEXT_MENU, r as render, u as unmountComponentAtNode, O as Overlay, e as OVERLAY_SCROLL_CONTAINER, f as DIALOG_CONTAINER, g as DIALOG, h as DIALOG_WARN_NO_HEADER_ICON, j as DIALOG_WARN_NO_HEADER_CLOSE_BUTTON, B as Button, k as DIALOG_CLOSE_BUTTON, I as Icon, l as DIALOG_HEADER, H as H4, m as DISPLAYNAME_PREFIX, n as __rest, o as ALERT, q as ALERT_BODY, t as ALERT_CONTENTS, v as ALERT_FOOTER, w as ALERT_WARN_CANCEL_PROPS, x as ALERT_WARN_CANCEL_ESCAPE_KEY, y as ALERT_WARN_CANCEL_OUTSIDE_CLICK, z as BREADCRUMB, E as BREADCRUMB_CURRENT, G as DISABLED, J as shallowCompareKeys, K as OVERFLOW_LIST_OBSERVE_PARENTS_CHANGED, L as OVERFLOW_LIST, M as OVERFLOW_LIST_SPACER, R as ResizeSensor, N as BREADCRUMBS, Q as BREADCRUMBS_COLLAPSED, S as Menu, T as MenuItem, U as BUTTON_GROUP, V as FILL, W as LARGE, X as MINIMAL, Y as VERTICAL, Z as alignmentClass, $ as CALLOUT, a0 as intentClass, a1 as CALLOUT_ICON, a2 as Intent, a3 as CARD, a4 as INTERACTIVE, a5 as elevationClass, a6 as Elevation, a7 as COLLAPSE, a8 as COLLAPSE_BODY, a9 as COLLAPSIBLE_LIST, aa as isElementOfType, ab as COLLAPSIBLE_LIST_INVALID_CHILD, ac as isFunction, ad as CONTEXTMENU_WARN_DECORATOR_NO_METHOD, ae as CONTEXTMENU_WARN_DECORATOR_NEEDS_REACT_ELEMENT, af as getDisplayName, ag as findDOMNode, ah as DIVIDER, ai as DRAWER, aj as positionClass, ak as isPositionHorizontal, al as OVERLAY_CONTAINER, am as DRAWER_VERTICAL_IS_IGNORED, an as getPositionIgnoreAngles, ao as DRAWER_ANGLE_POSITIONS_ARE_CASTED, ap as DRAWER_HEADER, aq as EDITABLE_TEXT, ar as EDITABLE_TEXT_EDITING, as as EDITABLE_TEXT_PLACEHOLDER, at as MULTILINE, au as EDITABLE_TEXT_CONTENT, av as EDITABLE_TEXT_INPUT, aw as clamp, ax as ESCAPE, ay as ENTER, az as CONTROL_GROUP, aA as CONTROL_INDICATOR_CHILD, aB as SWITCH_INNER_TEXT, aC as SWITCH, aD as RADIO, aE as CHECKBOX, aF as CONTROL, aG as INLINE, aH as CONTROL_INDICATOR, aI as FILE_INPUT, aJ as FILE_INPUT_HAS_SELECTION, aK as FILE_UPLOAD_INPUT, aL as FILE_UPLOAD_INPUT_CUSTOM_TEXT, aM as getClassNamespace, aN as LABEL, aO as TEXT_MUTED, aP as FORM_CONTENT, aQ as FORM_HELPER_TEXT, aR as FORM_GROUP, aS as NUMERIC_INPUT, aT as NUMERIC_INPUT_MIN_MAX, aU as NUMERIC_INPUT_STEP_SIZE_NULL, aV as NUMERIC_INPUT_STEP_SIZE_NON_POSITIVE, aW as NUMERIC_INPUT_MINOR_STEP_SIZE_NON_POSITIVE, aX as NUMERIC_INPUT_MAJOR_STEP_SIZE_NON_POSITIVE, aY as NUMERIC_INPUT_MINOR_STEP_SIZE_BOUND, aZ as NUMERIC_INPUT_MAJOR_STEP_SIZE_BOUND, a_ as FIXED, a$ as removeNonHTMLProps, b0 as InputGroup, b1 as isKeyboardClick, b2 as ARROW_UP, b3 as ARROW_DOWN, b4 as countDecimalPlaces, b5 as RADIOGROUP_WARN_CHILDREN_OPTIONS_MUTEX, b6 as INPUT, b7 as SMALL, b8 as HTML_SELECT, b9 as HTML_TABLE, ba as HTML_TABLE_BORDERED, bb as HTML_TABLE_CONDENSED, bc as HTML_TABLE_STRIPED, bd as KEY_COMBO, be as KEY, bf as MODIFIER_KEY, bg as HOTKEY, bh as HOTKEY_LABEL, bi as PORTAL, bj as HOTKEY_DIALOG, bk as DIALOG_BODY, bl as HOTKEYS_WARN_DECORATOR_NO_METHOD, bm as HOTKEYS_WARN_DECORATOR_NEEDS_REACT_ELEMENT, bn as HOTKEY_COLUMN, bo as HOTKEYS_HOTKEY_CHILDREN, bp as NAVBAR_DIVIDER, bq as NAVBAR_GROUP, br as Alignment, bs as NAVBAR_HEADING, bt as NAVBAR, bu as FIXED_TOP, bv as NON_IDEAL_STATE, bw as ensureElement, bx as NON_IDEAL_STATE_VISUAL, by as PANEL_STACK_VIEW, bz as PANEL_STACK_HEADER, bA as Text, bB as HEADING, bC as PANEL_STACK_HEADER_BACK, bD as PANEL_STACK, bE as reactTransitionGroup_2, bF as PANEL_STACK_INITIAL_PANEL_STACK_MUTEX, bG as PANEL_STACK_REQUIRES_PANEL, bH as reactTransitionGroup_4, bI as PROGRESS_BAR, bJ as PROGRESS_NO_ANIMATION, bK as PROGRESS_NO_STRIPES, bL as PROGRESS_METER, bM as ARROW_LEFT, bN as ARROW_RIGHT, bO as SLIDER_HANDLE, bP as ACTIVE, bQ as SLIDER_LABEL, bR as SLIDER, bS as SLIDER_TRACK, bT as SLIDER_AXIS, bU as SLIDER_ZERO_STEP, bV as SLIDER_ZERO_LABEL_STEP, bW as MULTISLIDER_INVALID_CHILD, bX as approxEqual, bY as SLIDER_PROGRESS, bZ as START, b_ as END, b$ as arraysEqual, c0 as RANGESLIDER_NULL_VALUE, c1 as TAB_PANEL, c2 as TAB, c3 as FLEX_EXPANDER, c4 as TAB_INDICATOR_WRAPPER, c5 as TAB_INDICATOR, c6 as TABS, c7 as TAB_LIST, c8 as TOAST, c9 as TOAST_MESSAGE, ca as AnchorButton, cb as TOAST_CONTAINER, cc as TOASTER_MAX_TOASTS_INVALID, cd as TOASTER_WARN_INLINE, ce as TOASTER_CREATE_NULL, cf as TREE_NODE, cg as TREE_NODE_SELECTED, ch as TREE_NODE_EXPANDED, ci as TREE_NODE_CONTENT, cj as TREE_NODE_ICON, ck as TREE_NODE_LABEL, cl as TREE_NODE_CARET, cm as TREE_NODE_CARET_OPEN, cn as TREE_NODE_CARET_CLOSED, co as TREE_NODE_CARET_NONE, cp as TREE_NODE_SECONDARY_LABEL, cq as TREE, cr as TREE_ROOT, cs as TREE_NODE_LIST } from '../common/tagInput-831102ab.js';
export { cw as AbstractComponent2, A as AbstractPureComponent2, br as Alignment, ca as AnchorButton, cD as Blockquote, B as Button, ct as Classes, cE as Code, m as DISPLAYNAME_PREFIX, a6 as Elevation, cy as H1, cz as H2, cA as H3, H as H4, cB as H5, cC as H6, I as Icon, b0 as InputGroup, a2 as Intent, cu as Keys, cG as Label, S as Menu, cJ as MenuDivider, T as MenuItem, cH as OL, O as Overlay, P as Popover, cK as PopoverInteractionKind, cL as Portal, b as Position, cF as Pre, R as ResizeSensor, cM as Spinner, cN as Tag, cO as TagInput, bA as Text, cP as Tooltip, cI as UL, cv as Utils, an as getPositionIgnoreAngles, ak as isPositionHorizontal, cx as isPositionVertical, a$ as removeNonHTMLProps } from '../common/tagInput-831102ab.js';
import { C as Component, P as PureComponent, c as createElement, a as Children, b as cloneElement, i as isValidElement } from '../common/source.production-86e2832f.js';
import '../common/index-ed166f27.js';
import { c as cx } from '../common/index-330529d6.js';

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
var TAB_KEY_CODE = 9;
/* istanbul ignore next */
/**
 * A nifty little class that maintains event handlers to add a class to the container element
 * when entering "mouse mode" (on a `mousedown` event) and remove it when entering "keyboard mode"
 * (on a `tab` key `keydown` event).
 */
var InteractionModeEngine = /** @class */ (function () {
    // tslint:disable-next-line:no-constructor-vars
    function InteractionModeEngine(container, className) {
        var _this = this;
        this.container = container;
        this.className = className;
        this.isRunning = false;
        this.handleKeyDown = function (e) {
            if (e.which === TAB_KEY_CODE) {
                _this.reset();
                _this.container.addEventListener("mousedown", _this.handleMouseDown);
            }
        };
        this.handleMouseDown = function () {
            _this.reset();
            _this.container.classList.add(_this.className);
            _this.container.addEventListener("keydown", _this.handleKeyDown);
        };
    }
    /** Returns whether the engine is currently running. */
    InteractionModeEngine.prototype.isActive = function () {
        return this.isRunning;
    };
    /** Enable behavior which applies the given className when in mouse mode. */
    InteractionModeEngine.prototype.start = function () {
        this.container.addEventListener("mousedown", this.handleMouseDown);
        this.isRunning = true;
    };
    /** Disable interaction mode behavior and remove className from container. */
    InteractionModeEngine.prototype.stop = function () {
        this.reset();
        this.isRunning = false;
    };
    InteractionModeEngine.prototype.reset = function () {
        this.container.classList.remove(this.className);
        this.container.removeEventListener("keydown", this.handleKeyDown);
        this.container.removeEventListener("mousedown", this.handleMouseDown);
    };
    return InteractionModeEngine;
}());

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
/* istanbul ignore next */
var fakeFocusEngine = {
    isActive: function () { return true; },
    start: function () { return true; },
    stop: function () { return true; },
};
var focusEngine = typeof document !== "undefined"
    ? new InteractionModeEngine(document.documentElement, FOCUS_DISABLED)
    : fakeFocusEngine;
var FocusStyleManager = {
    alwaysShowFocus: function () { return focusEngine.stop(); },
    isActive: function () { return focusEngine.isActive(); },
    onlyShowFocusOnTabs: function () { return focusEngine.start(); },
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
/**
 * An abstract component that Blueprint components can extend
 * in order to add some common functionality like runtime props validation.
 * @deprecated componentWillReceiveProps is deprecated in React 16.9; use AbstractComponent2 instead
 */
var AbstractComponent = /** @class */ (function (_super) {
    __extends(AbstractComponent, _super);
    function AbstractComponent(props, context) {
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
    AbstractComponent.prototype.componentWillReceiveProps = function (nextProps) {
        if (!isNodeEnv("production")) {
            this.validateProps(nextProps);
        }
    };
    AbstractComponent.prototype.componentWillUnmount = function () {
        this.clearTimeouts();
    };
    /**
     * Set a timeout and remember its ID.
     * All stored timeouts will be cleared when component unmounts.
     * @returns a "cancel" function that will clear timeout when invoked.
     */
    AbstractComponent.prototype.setTimeout = function (callback, timeout) {
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
    AbstractComponent.prototype.validateProps = function (_) {
        // implement in subclass
    };
    return AbstractComponent;
}(Component));

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
/**
 * An abstract component that Blueprint components can extend
 * in order to add some common functionality like runtime props validation.
 * @deprecated componentWillReceiveProps is deprecated in React 16.9; use AbstractPureComponent2 instead
 */
var AbstractPureComponent = /** @class */ (function (_super) {
    __extends(AbstractPureComponent, _super);
    function AbstractPureComponent(props, context) {
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
    AbstractPureComponent.prototype.componentWillReceiveProps = function (nextProps) {
        if (!isNodeEnv("production")) {
            this.validateProps(nextProps);
        }
    };
    AbstractPureComponent.prototype.componentWillUnmount = function () {
        this.clearTimeouts();
    };
    /**
     * Set a timeout and remember its ID.
     * All stored timeouts will be cleared when component unmounts.
     * @returns a "cancel" function that will clear timeout when invoked.
     */
    AbstractPureComponent.prototype.setTimeout = function (callback, timeout) {
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
    AbstractPureComponent.prototype.validateProps = function (_props) {
        // implement in subclass
    };
    return AbstractPureComponent;
}(PureComponent));

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
/** Boundary of a one-dimensional interval. */
var Boundary = {
    START: "start",
    // tslint:disable-next-line:object-literal-sort-keys
    END: "end",
};

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
var Colors = {
    BLACK: "#10161A",
    BLUE1: "#0E5A8A",
    BLUE2: "#106BA3",
    BLUE3: "#137CBD",
    BLUE4: "#2B95D6",
    BLUE5: "#48AFF0",
    COBALT1: "#1F4B99",
    COBALT2: "#2458B3",
    COBALT3: "#2965CC",
    COBALT4: "#4580E6",
    COBALT5: "#669EFF",
    DARK_GRAY1: "#182026",
    DARK_GRAY2: "#202B33",
    DARK_GRAY3: "#293742",
    DARK_GRAY4: "#30404D",
    DARK_GRAY5: "#394B59",
    FOREST1: "#1D7324",
    FOREST2: "#238C2C",
    FOREST3: "#29A634",
    FOREST4: "#43BF4D",
    FOREST5: "#62D96B",
    GOLD1: "#A67908",
    GOLD2: "#BF8C0A",
    GOLD3: "#D99E0B",
    GOLD4: "#F2B824",
    GOLD5: "#FFC940",
    GRAY1: "#5C7080",
    GRAY2: "#738694",
    GRAY3: "#8A9BA8",
    GRAY4: "#A7B6C2",
    GRAY5: "#BFCCD6",
    GREEN1: "#0A6640",
    GREEN2: "#0D8050",
    GREEN3: "#0F9960",
    GREEN4: "#15B371",
    GREEN5: "#3DCC91",
    INDIGO1: "#5642A6",
    INDIGO2: "#634DBF",
    INDIGO3: "#7157D9",
    INDIGO4: "#9179F2",
    INDIGO5: "#AD99FF",
    LIGHT_GRAY1: "#CED9E0",
    LIGHT_GRAY2: "#D8E1E8",
    LIGHT_GRAY3: "#E1E8ED",
    LIGHT_GRAY4: "#EBF1F5",
    LIGHT_GRAY5: "#F5F8FA",
    LIME1: "#728C23",
    LIME2: "#87A629",
    LIME3: "#9BBF30",
    LIME4: "#B6D94C",
    LIME5: "#D1F26D",
    ORANGE1: "#A66321",
    ORANGE2: "#BF7326",
    ORANGE3: "#D9822B",
    ORANGE4: "#F29D49",
    ORANGE5: "#FFB366",
    RED1: "#A82A2A",
    RED2: "#C23030",
    RED3: "#DB3737",
    RED4: "#F55656",
    RED5: "#FF7373",
    ROSE1: "#A82255",
    ROSE2: "#C22762",
    ROSE3: "#DB2C6F",
    ROSE4: "#F5498B",
    ROSE5: "#FF66A1",
    SEPIA1: "#63411E",
    SEPIA2: "#7D5125",
    SEPIA3: "#96622D",
    SEPIA4: "#B07B46",
    SEPIA5: "#C99765",
    TURQUOISE1: "#008075",
    TURQUOISE2: "#00998C",
    TURQUOISE3: "#00B3A4",
    TURQUOISE4: "#14CCBD",
    TURQUOISE5: "#2EE6D6",
    VERMILION1: "#9E2B0E",
    VERMILION2: "#B83211",
    VERMILION3: "#D13913",
    VERMILION4: "#EB532D",
    VERMILION5: "#FF6E4A",
    VIOLET1: "#5C255C",
    VIOLET2: "#752F75",
    VIOLET3: "#8F398F",
    VIOLET4: "#A854A8",
    VIOLET5: "#C274C2",
    WHITE: "#FFFFFF",
};

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
var POPPER_MODIFIERS = {
    preventOverflow: { boundariesElement: "viewport" },
};
var TRANSITION_DURATION = 100;
/* istanbul ignore next */
var ContextMenu = /** @class */ (function (_super) {
    __extends(ContextMenu, _super);
    function ContextMenu() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isDarkTheme: false,
            isOpen: false,
            menu: null,
            offset: null,
        };
        _this.cancelContextMenu = function (e) { return e.preventDefault(); };
        _this.handleBackdropContextMenu = function (e) {
            // React function to remove from the event pool, useful when using a event within a callback
            e.persist();
            e.preventDefault();
            // wait for backdrop to disappear so we can find the "real" element at event coordinates.
            // timeout duration is equivalent to transition duration so we know it's animated out.
            _this.setTimeout(function () {
                // retrigger context menu event at the element beneath the backdrop.
                // if it has a `contextmenu` event handler then it'll be invoked.
                // if it doesn't, no native menu will show (at least on OSX) :(
                var newTarget = document.elementFromPoint(e.clientX, e.clientY);
                newTarget.dispatchEvent(new MouseEvent("contextmenu", e));
            }, TRANSITION_DURATION);
        };
        _this.handlePopoverInteraction = function (nextOpenState) {
            if (!nextOpenState) {
                // delay the actual hiding till the event queue clears
                // to avoid flicker of opening twice
                requestAnimationFrame(function () { return _this.hide(); });
            }
        };
        return _this;
    }
    ContextMenu.prototype.render = function () {
        var _a;
        // prevent right-clicking in a context menu
        var content = createElement("div", { onContextMenu: this.cancelContextMenu }, this.state.menu);
        var popoverClassName = cx((_a = {}, _a[DARK] = this.state.isDarkTheme, _a));
        // HACKHACK: workaround until we have access to Popper#scheduleUpdate().
        // https://github.com/palantir/blueprint/issues/692
        // Generate key based on offset so a new Popover instance is created
        // when offset changes, to force recomputing position.
        var key = this.state.offset == null ? "" : this.state.offset.left + "x" + this.state.offset.top;
        // wrap the popover in a positioned div to make sure it is properly
        // offset on the screen.
        return (createElement("div", { className: CONTEXT_MENU_POPOVER_TARGET, style: this.state.offset },
            createElement(Popover, __assign({}, this.props, { backdropProps: { onContextMenu: this.handleBackdropContextMenu }, content: content, enforceFocus: false, key: key, hasBackdrop: true, isOpen: this.state.isOpen, minimal: true, modifiers: POPPER_MODIFIERS, onInteraction: this.handlePopoverInteraction, position: Position.RIGHT_TOP, popoverClassName: popoverClassName, target: createElement("div", null), transitionDuration: TRANSITION_DURATION }))));
    };
    ContextMenu.prototype.show = function (menu, offset, onClose, isDarkTheme) {
        this.setState({ isOpen: true, menu: menu, offset: offset, onClose: onClose, isDarkTheme: isDarkTheme });
    };
    ContextMenu.prototype.hide = function () {
        safeInvoke(this.state.onClose);
        this.setState({ isOpen: false, onClose: undefined });
    };
    ContextMenu = __decorate([
        polyfill
    ], ContextMenu);
    return ContextMenu;
}(AbstractPureComponent2));
var contextMenuElement;
var contextMenu;
/**
 * Show the given menu element at the given offset from the top-left corner of the viewport.
 * The menu will appear below-right of this point and will flip to below-left if there is not enough
 * room onscreen. The optional callback will be invoked when this menu closes.
 */
function show(menu, offset, onClose, isDarkTheme) {
    if (contextMenuElement == null) {
        contextMenuElement = document.createElement("div");
        contextMenuElement.classList.add(CONTEXT_MENU);
        document.body.appendChild(contextMenuElement);
        contextMenu = render(createElement(ContextMenu, { onClosed: remove }), contextMenuElement);
    }
    contextMenu.show(menu, offset, onClose, isDarkTheme);
}
/** Hide the open context menu. */
function hide() {
    if (contextMenu != null) {
        contextMenu.hide();
    }
}
/** Return whether a context menu is currently open. */
function isOpen() {
    return contextMenu != null && contextMenu.state.isOpen;
}
function remove() {
    if (contextMenuElement != null) {
        unmountComponentAtNode(contextMenuElement);
        contextMenuElement.remove();
        contextMenuElement = null;
        contextMenu = null;
    }
}

var contextMenu$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    show: show,
    hide: hide,
    isOpen: isOpen
});

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
var Dialog = /** @class */ (function (_super) {
    __extends(Dialog, _super);
    function Dialog() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Dialog.prototype.render = function () {
        return (createElement(Overlay, __assign({}, this.props, { className: OVERLAY_SCROLL_CONTAINER, hasBackdrop: true }),
            createElement("div", { className: DIALOG_CONTAINER },
                createElement("div", { className: cx(DIALOG, this.props.className), style: this.props.style },
                    this.maybeRenderHeader(),
                    this.props.children))));
    };
    Dialog.prototype.validateProps = function (props) {
        if (props.title == null) {
            if (props.icon != null) {
                console.warn(DIALOG_WARN_NO_HEADER_ICON);
            }
            if (props.isCloseButtonShown != null) {
                console.warn(DIALOG_WARN_NO_HEADER_CLOSE_BUTTON);
            }
        }
    };
    Dialog.prototype.maybeRenderCloseButton = function () {
        // show close button if prop is undefined or null
        // this gives us a behavior as if the default value were `true`
        if (this.props.isCloseButtonShown !== false) {
            return (createElement(Button, { "aria-label": "Close", className: DIALOG_CLOSE_BUTTON, icon: createElement(Icon, { icon: "small-cross", iconSize: Icon.SIZE_LARGE }), minimal: true, onClick: this.props.onClose }));
        }
        else {
            return undefined;
        }
    };
    Dialog.prototype.maybeRenderHeader = function () {
        var _a = this.props, icon = _a.icon, title = _a.title;
        if (title == null) {
            return undefined;
        }
        return (createElement("div", { className: DIALOG_HEADER },
            createElement(Icon, { icon: icon, iconSize: Icon.SIZE_LARGE }),
            createElement(H4, null, title),
            this.maybeRenderCloseButton()));
    };
    Dialog.defaultProps = {
        canOutsideClickClose: true,
        isOpen: false,
    };
    Dialog.displayName = DISPLAYNAME_PREFIX + ".Dialog";
    Dialog = __decorate([
        polyfill
    ], Dialog);
    return Dialog;
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
var Alert = /** @class */ (function (_super) {
    __extends(Alert, _super);
    function Alert() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleCancel = function (evt) { return _this.internalHandleCallbacks(false, evt); };
        _this.handleConfirm = function (evt) { return _this.internalHandleCallbacks(true, evt); };
        return _this;
    }
    Alert.prototype.render = function () {
        var _a = this.props, canEscapeKeyCancel = _a.canEscapeKeyCancel, canOutsideClickCancel = _a.canOutsideClickCancel, children = _a.children, className = _a.className, icon = _a.icon, intent = _a.intent, cancelButtonText = _a.cancelButtonText, confirmButtonText = _a.confirmButtonText, onClose = _a.onClose, overlayProps = __rest(_a, ["canEscapeKeyCancel", "canOutsideClickCancel", "children", "className", "icon", "intent", "cancelButtonText", "confirmButtonText", "onClose"]);
        return (createElement(Dialog, __assign({}, overlayProps, { className: cx(ALERT, className), canEscapeKeyClose: canEscapeKeyCancel, canOutsideClickClose: canOutsideClickCancel, onClose: this.handleCancel, portalContainer: this.props.portalContainer }),
            createElement("div", { className: ALERT_BODY },
                createElement(Icon, { icon: icon, iconSize: 40, intent: intent }),
                createElement("div", { className: ALERT_CONTENTS }, children)),
            createElement("div", { className: ALERT_FOOTER },
                createElement(Button, { intent: intent, text: confirmButtonText, onClick: this.handleConfirm }),
                cancelButtonText && createElement(Button, { text: cancelButtonText, onClick: this.handleCancel }))));
    };
    Alert.prototype.validateProps = function (props) {
        if (props.onClose == null && (props.cancelButtonText == null) !== (props.onCancel == null)) {
            console.warn(ALERT_WARN_CANCEL_PROPS);
        }
        var hasCancelHandler = props.onCancel != null || props.onClose != null;
        if (props.canEscapeKeyCancel && !hasCancelHandler) {
            console.warn(ALERT_WARN_CANCEL_ESCAPE_KEY);
        }
        if (props.canOutsideClickCancel && !hasCancelHandler) {
            console.warn(ALERT_WARN_CANCEL_OUTSIDE_CLICK);
        }
    };
    Alert.prototype.internalHandleCallbacks = function (confirmed, evt) {
        var _a = this.props, onCancel = _a.onCancel, onClose = _a.onClose, onConfirm = _a.onConfirm;
        safeInvoke(confirmed ? onConfirm : onCancel, evt);
        safeInvoke(onClose, confirmed, evt);
    };
    Alert.defaultProps = {
        canEscapeKeyCancel: false,
        canOutsideClickCancel: false,
        confirmButtonText: "OK",
        isOpen: false,
    };
    Alert.displayName = DISPLAYNAME_PREFIX + ".Alert";
    Alert = __decorate([
        polyfill
    ], Alert);
    return Alert;
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
var Breadcrumb = function (breadcrumbProps) {
    var _a;
    var classes$1 = cx(BREADCRUMB, (_a = {},
        _a[BREADCRUMB_CURRENT] = breadcrumbProps.current,
        _a[DISABLED] = breadcrumbProps.disabled,
        _a), breadcrumbProps.className);
    var icon = breadcrumbProps.icon != null ? createElement(Icon, { icon: breadcrumbProps.icon }) : undefined;
    if (breadcrumbProps.href == null && breadcrumbProps.onClick == null) {
        return (createElement("span", { className: classes$1 },
            icon,
            breadcrumbProps.text,
            breadcrumbProps.children));
    }
    return (createElement("a", { className: classes$1, href: breadcrumbProps.href, onClick: breadcrumbProps.disabled ? null : breadcrumbProps.onClick, tabIndex: breadcrumbProps.disabled ? null : 0, target: breadcrumbProps.target },
        icon,
        breadcrumbProps.text,
        breadcrumbProps.children));
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
/** @internal - do not expose this type */
var OverflowDirection;
(function (OverflowDirection) {
    OverflowDirection[OverflowDirection["NONE"] = 0] = "NONE";
    OverflowDirection[OverflowDirection["GROW"] = 1] = "GROW";
    OverflowDirection[OverflowDirection["SHRINK"] = 2] = "SHRINK";
})(OverflowDirection || (OverflowDirection = {}));
var OverflowList = /** @class */ (function (_super) {
    __extends(OverflowList, _super);
    function OverflowList() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            direction: OverflowDirection.NONE,
            lastOverflowCount: 0,
            overflow: [],
            visible: _this.props.items,
        };
        /** A cache containing the widths of all elements being observed to detect growing/shrinking */
        _this.previousWidths = new Map();
        _this.spacer = null;
        _this.resize = function (entries) {
            // if any parent is growing, assume we have more room than before
            var growing = entries.some(function (entry) {
                var previousWidth = _this.previousWidths.get(entry.target) || 0;
                return entry.contentRect.width > previousWidth;
            });
            _this.repartition(growing);
            entries.forEach(function (entry) { return _this.previousWidths.set(entry.target, entry.contentRect.width); });
        };
        return _this;
    }
    OverflowList.ofType = function () {
        return OverflowList;
    };
    OverflowList.prototype.componentDidMount = function () {
        this.repartition(false);
    };
    OverflowList.prototype.shouldComponentUpdate = function (_nextProps, nextState) {
        // We want this component to always re-render, even when props haven't changed, so that
        // changes in the renderers' behavior can be reflected.
        // The following statement prevents re-rendering only in the case where the state changes
        // identity (i.e. setState was called), but the state is still the same when
        // shallow-compared to the previous state.
        return !(this.state !== nextState && shallowCompareKeys(this.state, nextState));
    };
    OverflowList.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (prevProps.observeParents !== this.props.observeParents) {
            console.warn(OVERFLOW_LIST_OBSERVE_PARENTS_CHANGED);
        }
        if (prevProps.collapseFrom !== this.props.collapseFrom ||
            prevProps.items !== this.props.items ||
            prevProps.minVisibleItems !== this.props.minVisibleItems ||
            prevProps.overflowRenderer !== this.props.overflowRenderer ||
            prevProps.visibleItemRenderer !== this.props.visibleItemRenderer) {
            // reset visible state if the above props change.
            this.setState({
                direction: OverflowDirection.GROW,
                lastOverflowCount: 0,
                overflow: [],
                visible: this.props.items,
            });
        }
        if (!shallowCompareKeys(prevState, this.state)) {
            this.repartition(false);
        }
        var _a = this.state, direction = _a.direction, overflow = _a.overflow, lastOverflowCount = _a.lastOverflowCount;
        if (
        // if a resize operation has just completed (transition to NONE)
        direction === OverflowDirection.NONE &&
            direction !== prevState.direction &&
            overflow.length !== lastOverflowCount) {
            safeInvoke(this.props.onOverflow, overflow);
        }
    };
    OverflowList.prototype.render = function () {
        var _this = this;
        var _a = this.props, className = _a.className, collapseFrom = _a.collapseFrom, observeParents = _a.observeParents, style = _a.style, _b = _a.tagName, tagName = _b === void 0 ? "div" : _b, visibleItemRenderer = _a.visibleItemRenderer;
        var overflow = this.maybeRenderOverflow();
        var list = createElement(tagName, {
            className: cx(OVERFLOW_LIST, className),
            style: style,
        }, collapseFrom === Boundary.START ? overflow : null, this.state.visible.map(visibleItemRenderer), collapseFrom === Boundary.END ? overflow : null, createElement("div", { className: OVERFLOW_LIST_SPACER, ref: function (ref) { return (_this.spacer = ref); } }));
        return (createElement(ResizeSensor, { onResize: this.resize, observeParents: observeParents }, list));
    };
    OverflowList.prototype.maybeRenderOverflow = function () {
        var overflow = this.state.overflow;
        if (overflow.length === 0) {
            return null;
        }
        return this.props.overflowRenderer(overflow);
    };
    OverflowList.prototype.repartition = function (growing) {
        var _this = this;
        if (this.spacer == null) {
            return;
        }
        if (growing) {
            this.setState(function (state) { return ({
                direction: OverflowDirection.GROW,
                // store last overflow if this is the beginning of a resize (for check in componentDidUpdate).
                lastOverflowCount: state.direction === OverflowDirection.NONE ? state.overflow.length : state.lastOverflowCount,
                overflow: [],
                visible: _this.props.items,
            }); });
        }
        else if (this.spacer.getBoundingClientRect().width < 0.9) {
            // spacer has flex-shrink and width 1px so if it's much smaller then we know to shrink
            this.setState(function (state) {
                if (state.visible.length <= _this.props.minVisibleItems) {
                    return null;
                }
                var collapseFromStart = _this.props.collapseFrom === Boundary.START;
                var visible = state.visible.slice();
                var next = collapseFromStart ? visible.shift() : visible.pop();
                if (next === undefined) {
                    return null;
                }
                var overflow = collapseFromStart ? state.overflow.concat([next]) : [next].concat(state.overflow);
                return {
                    // set SHRINK mode unless a GROW is already in progress.
                    // GROW shows all items then shrinks until it settles, so we
                    // preserve the fact that the original trigger was a GROW.
                    direction: state.direction === OverflowDirection.NONE ? OverflowDirection.SHRINK : state.direction,
                    overflow: overflow,
                    visible: visible,
                };
            });
        }
        else {
            // repartition complete!
            this.setState({ direction: OverflowDirection.NONE });
        }
    };
    OverflowList.displayName = DISPLAYNAME_PREFIX + ".OverflowList";
    OverflowList.defaultProps = {
        collapseFrom: Boundary.START,
        minVisibleItems: 0,
    };
    return OverflowList;
}(Component));

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
var Breadcrumbs = /** @class */ (function (_super) {
    __extends(Breadcrumbs, _super);
    function Breadcrumbs() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderOverflow = function (items) {
            var collapseFrom = _this.props.collapseFrom;
            var position = collapseFrom === Boundary.END ? Position.BOTTOM_RIGHT : Position.BOTTOM_LEFT;
            var orderedItems = items;
            if (collapseFrom === Boundary.START) {
                // If we're collapsing from the start, the menu should be read from the bottom to the
                // top, continuing with the breadcrumbs to the right. Since this means the first
                // breadcrumb in the props must be the last in the menu, we need to reverse the overlow
                // order.
                orderedItems = items.slice().reverse();
            }
            return (createElement("li", null,
                createElement(Popover, __assign({ position: position }, _this.props.popoverProps),
                    createElement("span", { className: BREADCRUMBS_COLLAPSED }),
                    createElement(Menu, null, orderedItems.map(_this.renderOverflowBreadcrumb)))));
        };
        _this.renderOverflowBreadcrumb = function (props, index) {
            var isClickable = props.href != null || props.onClick != null;
            return createElement(MenuItem, __assign({ disabled: !isClickable }, props, { text: props.text, key: index }));
        };
        _this.renderBreadcrumbWrapper = function (props, index) {
            var isCurrent = _this.props.items[_this.props.items.length - 1] === props;
            return createElement("li", { key: index }, _this.renderBreadcrumb(props, isCurrent));
        };
        return _this;
    }
    Breadcrumbs.prototype.render = function () {
        var _a = this.props, className = _a.className, collapseFrom = _a.collapseFrom, items = _a.items, minVisibleItems = _a.minVisibleItems, _b = _a.overflowListProps, overflowListProps = _b === void 0 ? {} : _b;
        return (createElement(OverflowList, __assign({ collapseFrom: collapseFrom, minVisibleItems: minVisibleItems, tagName: "ul" }, overflowListProps, { className: cx(BREADCRUMBS, overflowListProps.className, className), items: items, overflowRenderer: this.renderOverflow, visibleItemRenderer: this.renderBreadcrumbWrapper })));
    };
    Breadcrumbs.prototype.renderBreadcrumb = function (props, isCurrent) {
        if (isCurrent && this.props.currentBreadcrumbRenderer != null) {
            return this.props.currentBreadcrumbRenderer(props);
        }
        else if (this.props.breadcrumbRenderer != null) {
            return this.props.breadcrumbRenderer(props);
        }
        else {
            return createElement(Breadcrumb, __assign({}, props, { current: isCurrent }));
        }
    };
    Breadcrumbs.defaultProps = {
        collapseFrom: Boundary.START,
    };
    Breadcrumbs = __decorate([
        polyfill
    ], Breadcrumbs);
    return Breadcrumbs;
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
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var ButtonGroup = /** @class */ (function (_super) {
    __extends(ButtonGroup, _super);
    function ButtonGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ButtonGroup.prototype.render = function () {
        var _a;
        var _b = this.props, alignText = _b.alignText, className = _b.className, fill = _b.fill, minimal = _b.minimal, large = _b.large, vertical = _b.vertical, htmlProps = __rest(_b, ["alignText", "className", "fill", "minimal", "large", "vertical"]);
        var buttonGroupClasses = cx(BUTTON_GROUP, (_a = {},
            _a[FILL] = fill,
            _a[LARGE] = large,
            _a[MINIMAL] = minimal,
            _a[VERTICAL] = vertical,
            _a), alignmentClass(alignText), className);
        return (createElement("div", __assign({}, htmlProps, { className: buttonGroupClasses }), this.props.children));
    };
    ButtonGroup.displayName = DISPLAYNAME_PREFIX + ".ButtonGroup";
    ButtonGroup = __decorate([
        polyfill
    ], ButtonGroup);
    return ButtonGroup;
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
var Callout = /** @class */ (function (_super) {
    __extends(Callout, _super);
    function Callout() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Callout.prototype.render = function () {
        var _a;
        var _b = this.props, className = _b.className, children = _b.children, icon = _b.icon, intent = _b.intent, title = _b.title, htmlProps = __rest(_b, ["className", "children", "icon", "intent", "title"]);
        var iconName = this.getIconName(icon, intent);
        var classes$1 = cx(CALLOUT, intentClass(intent), (_a = {}, _a[CALLOUT_ICON] = iconName != null, _a), className);
        return (createElement("div", __assign({ className: classes$1 }, htmlProps),
            iconName && createElement(Icon, { icon: iconName, iconSize: Icon.SIZE_LARGE }),
            title && createElement(H4, null, title),
            children));
    };
    Callout.prototype.getIconName = function (icon, intent) {
        // 1. no icon
        if (icon === null) {
            return undefined;
        }
        // 2. defined iconName prop
        if (icon !== undefined) {
            return icon;
        }
        // 3. default intent icon
        switch (intent) {
            case Intent.DANGER:
                return "error";
            case Intent.PRIMARY:
                return "info-sign";
            case Intent.WARNING:
                return "warning-sign";
            case Intent.SUCCESS:
                return "tick";
            default:
                return undefined;
        }
    };
    Callout.displayName = DISPLAYNAME_PREFIX + ".Callout";
    Callout = __decorate([
        polyfill
    ], Callout);
    return Callout;
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
var Card = /** @class */ (function (_super) {
    __extends(Card, _super);
    function Card() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Card.prototype.render = function () {
        var _a;
        var _b = this.props, className = _b.className, elevation = _b.elevation, interactive = _b.interactive, htmlProps = __rest(_b, ["className", "elevation", "interactive"]);
        var classes$1 = cx(CARD, (_a = {}, _a[INTERACTIVE] = interactive, _a), elevationClass(elevation), className);
        return createElement("div", __assign({ className: classes$1 }, htmlProps));
    };
    Card.displayName = DISPLAYNAME_PREFIX + ".Card";
    Card.defaultProps = {
        elevation: Elevation.ZERO,
        interactive: false,
    };
    Card = __decorate([
        polyfill
    ], Card);
    return Card;
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
/**
 * `Collapse` can be in one of six states, enumerated here.
 * When changing the `isOpen` prop, the following happens to the states:
 * isOpen={true}  : CLOSED -> OPEN_START -> OPENING -> OPEN
 * isOpen={false} : OPEN -> CLOSING_START -> CLOSING -> CLOSED
 */
var AnimationStates;
(function (AnimationStates) {
    /**
     * The body is re-rendered, height is set to the measured body height and
     * the body Y is set to 0.
     */
    AnimationStates[AnimationStates["OPEN_START"] = 0] = "OPEN_START";
    /**
     * Animation begins, height is set to auto. This is all animated, and on
     * complete, the state changes to OPEN.
     */
    AnimationStates[AnimationStates["OPENING"] = 1] = "OPENING";
    /**
     * The collapse height is set to auto, and the body Y is set to 0 (so the
     * element can be seen as normal).
     */
    AnimationStates[AnimationStates["OPEN"] = 2] = "OPEN";
    /**
     * Height has been changed from auto to the measured height of the body to
     * prepare for the closing animation in CLOSING.
     */
    AnimationStates[AnimationStates["CLOSING_START"] = 3] = "CLOSING_START";
    /**
     * Height is set to 0 and the body Y is at -height. Both of these properties
     * are transformed, and then after the animation is complete, the state
     * changes to CLOSED.
     */
    AnimationStates[AnimationStates["CLOSING"] = 4] = "CLOSING";
    /**
     * The contents of the collapse is not rendered, the collapse height is 0,
     * and the body Y is at -height (so that the bottom of the body is at Y=0).
     */
    AnimationStates[AnimationStates["CLOSED"] = 5] = "CLOSED";
})(AnimationStates || (AnimationStates = {}));
var Collapse = /** @class */ (function (_super) {
    __extends(Collapse, _super);
    function Collapse() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            animationState: _this.props.isOpen ? AnimationStates.OPEN : AnimationStates.CLOSED,
            height: "0px",
        };
        _this.contentsRefHandler = function (el) {
            _this.contents = el;
            if (el != null) {
                _this.setState({
                    animationState: _this.props.isOpen ? AnimationStates.OPEN : AnimationStates.CLOSED,
                    height: _this.contents.clientHeight + "px",
                });
            }
        };
        return _this;
    }
    Collapse.getDerivedStateFromProps = function (props, state) {
        var isOpen = props.isOpen;
        var animationState = state.animationState;
        if (isOpen) {
            switch (animationState) {
                case AnimationStates.OPENING:
                    // allow Collapse#onDelayedStateChange() to handle the transition here
                    break;
                case AnimationStates.OPEN:
                    break;
                default:
                    return { animationState: AnimationStates.OPEN_START };
            }
        }
        else {
            switch (animationState) {
                case AnimationStates.CLOSING:
                    // allow Collapse#onDelayedStateChange() to handle the transition here
                    break;
                case AnimationStates.CLOSED:
                    break;
                default:
                    return { animationState: AnimationStates.CLOSING_START };
            }
        }
        return null;
    };
    Collapse.prototype.render = function () {
        var isContentVisible = this.state.animationState !== AnimationStates.CLOSED;
        var shouldRenderChildren = isContentVisible || this.props.keepChildrenMounted;
        var displayWithTransform = isContentVisible && this.state.animationState !== AnimationStates.CLOSING;
        var isAutoHeight = this.state.height === "auto";
        var containerStyle = {
            height: isContentVisible ? this.state.height : undefined,
            overflowY: (isAutoHeight ? "visible" : undefined),
            transition: isAutoHeight ? "none" : undefined,
        };
        var contentsStyle = {
            transform: displayWithTransform ? "translateY(0)" : "translateY(-" + this.state.height + "px)",
            transition: isAutoHeight ? "none" : undefined,
        };
        return createElement(this.props.component, {
            className: cx(COLLAPSE, this.props.className),
            style: containerStyle,
        }, createElement("div", { className: COLLAPSE_BODY, ref: this.contentsRefHandler, style: contentsStyle, "aria-hidden": !isContentVisible && this.props.keepChildrenMounted }, shouldRenderChildren ? this.props.children : null));
    };
    Collapse.prototype.componentDidMount = function () {
        this.forceUpdate();
        if (this.props.isOpen) {
            this.setState({ animationState: AnimationStates.OPEN, height: "auto" });
        }
        else {
            this.setState({ animationState: AnimationStates.CLOSED });
        }
    };
    Collapse.prototype.componentDidUpdate = function () {
        var _this = this;
        var height;
        if (this.contents != null && this.contents.clientHeight !== 0) {
            height = this.contents.clientHeight;
        }
        var transitionDuration = this.props.transitionDuration;
        var animationState = this.state.animationState;
        if (animationState === AnimationStates.CLOSING_START) {
            this.setTimeout(function () {
                return _this.setState({
                    animationState: AnimationStates.CLOSING,
                    height: "0px",
                });
            });
            this.setTimeout(function () { return _this.onDelayedStateChange(); }, transitionDuration);
        }
        else if (animationState === AnimationStates.OPEN_START) {
            this.setState({
                animationState: AnimationStates.OPENING,
                height: height !== undefined ? height + "px" : this.state.height,
            });
            this.setTimeout(function () { return _this.onDelayedStateChange(); }, transitionDuration);
        }
    };
    Collapse.prototype.onDelayedStateChange = function () {
        switch (this.state.animationState) {
            case AnimationStates.OPENING:
                this.setState({ animationState: AnimationStates.OPEN, height: "auto" });
                break;
            case AnimationStates.CLOSING:
                this.setState({ animationState: AnimationStates.CLOSED });
                break;
        }
    };
    Collapse.displayName = DISPLAYNAME_PREFIX + ".Collapse";
    Collapse.defaultProps = {
        component: "div",
        isOpen: false,
        keepChildrenMounted: false,
        transitionDuration: 200,
    };
    Collapse = __decorate([
        polyfill
    ], Collapse);
    return Collapse;
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
/** @deprecated use `<OverflowList>` for automatic overflow based on available space. */
var CollapsibleList = /** @class */ (function (_super) {
    __extends(CollapsibleList, _super);
    function CollapsibleList() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CollapsibleList.prototype.render = function () {
        var _this = this;
        var collapseFrom = this.props.collapseFrom;
        var childrenLength = Children.count(this.props.children);
        var _a = this.partitionChildren(), visibleChildren = _a[0], collapsedChildren = _a[1];
        var visibleItems = visibleChildren.map(function (child, index) {
            var absoluteIndex = collapseFrom === Boundary.START ? childrenLength - 1 - index : index;
            return (createElement("li", { className: _this.props.visibleItemClassName, key: absoluteIndex }, _this.props.visibleItemRenderer(child.props, absoluteIndex)));
        });
        if (collapseFrom === Boundary.START) {
            // reverse START list so separators appear before items
            visibleItems.reverse();
        }
        // construct dropdown menu for collapsed items
        var collapsedPopover;
        if (collapsedChildren.length > 0) {
            var position = collapseFrom === Boundary.END ? Position.BOTTOM_RIGHT : Position.BOTTOM_LEFT;
            collapsedPopover = (createElement("li", { className: this.props.visibleItemClassName },
                createElement(Popover, __assign({ content: createElement(Menu, null, collapsedChildren), position: position }, this.props.dropdownProps), this.props.dropdownTarget)));
        }
        return (createElement("ul", { className: cx(COLLAPSIBLE_LIST, this.props.className) },
            collapseFrom === Boundary.START ? collapsedPopover : null,
            visibleItems,
            collapseFrom === Boundary.END ? collapsedPopover : null));
    };
    // splits the list of children into two arrays: visible and collapsed
    CollapsibleList.prototype.partitionChildren = function () {
        if (this.props.children == null) {
            return [[], []];
        }
        var childrenArray = Children.map(this.props.children, function (child, index) {
            if (!isElementOfType(child, MenuItem)) {
                throw new Error(COLLAPSIBLE_LIST_INVALID_CHILD);
            }
            return cloneElement(child, { key: "visible-" + index });
        });
        if (this.props.collapseFrom === Boundary.START) {
            // reverse START list so we can always slice visible items from the front of the list
            childrenArray.reverse();
        }
        var visibleItemCount = this.props.visibleItemCount;
        return [childrenArray.slice(0, visibleItemCount), childrenArray.slice(visibleItemCount)];
    };
    CollapsibleList.displayName = DISPLAYNAME_PREFIX + ".CollapsibleList";
    CollapsibleList.defaultProps = {
        collapseFrom: Boundary.START,
        dropdownTarget: null,
        visibleItemCount: 3,
        visibleItemRenderer: null,
    };
    return CollapsibleList;
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
function isDarkTheme(element) {
    return element instanceof Element && element.closest("." + DARK) != null;
}

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
function ContextMenuTarget(WrappedComponent) {
    var _a;
    if (!isFunction(WrappedComponent.prototype.renderContextMenu)) {
        console.warn(CONTEXTMENU_WARN_DECORATOR_NO_METHOD);
    }
    return _a = /** @class */ (function (_super) {
            __extends(ContextMenuTargetClass, _super);
            function ContextMenuTargetClass() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            ContextMenuTargetClass.prototype.render = function () {
                var _this = this;
                var element = _super.prototype.render.call(this);
                if (element == null) {
                    // always return `element` in case caller is distinguishing between `null` and `undefined`
                    return element;
                }
                if (!isValidElement(element)) {
                    console.warn(CONTEXTMENU_WARN_DECORATOR_NEEDS_REACT_ELEMENT);
                    return element;
                }
                var oldOnContextMenu = element.props.onContextMenu;
                var onContextMenu = function (e) {
                    // support nested menus (inner menu target would have called preventDefault())
                    if (e.defaultPrevented) {
                        return;
                    }
                    if (isFunction(_this.renderContextMenu)) {
                        var menu = _this.renderContextMenu(e);
                        if (menu != null) {
                            var darkTheme = isDarkTheme(findDOMNode(_this));
                            e.preventDefault();
                            show(menu, { left: e.clientX, top: e.clientY }, _this.onContextMenuClose, darkTheme);
                        }
                    }
                    safeInvoke(oldOnContextMenu, e);
                };
                return cloneElement(element, { onContextMenu: onContextMenu });
            };
            return ContextMenuTargetClass;
        }(WrappedComponent)),
        _a.displayName = "ContextMenuTarget(" + getDisplayName(WrappedComponent) + ")",
        _a;
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
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var Divider = /** @class */ (function (_super) {
    __extends(Divider, _super);
    function Divider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Divider.prototype.render = function () {
        var _a = this.props, className = _a.className, _b = _a.tagName, tagName = _b === void 0 ? "div" : _b, htmlProps = __rest(_a, ["className", "tagName"]);
        var classes = cx(DIVIDER, className);
        return createElement(tagName, __assign({}, htmlProps, { className: classes }));
    };
    Divider.displayName = DISPLAYNAME_PREFIX + ".Divider";
    Divider = __decorate([
        polyfill
    ], Divider);
    return Divider;
}(AbstractPureComponent2));

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
var Drawer = /** @class */ (function (_super) {
    __extends(Drawer, _super);
    function Drawer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Drawer.prototype.render = function () {
        var _a, _b;
        var _c = this.props, size = _c.size, style = _c.style, position = _c.position, vertical = _c.vertical;
        var realPosition = position ? getPositionIgnoreAngles(position) : null;
        var classes$1 = cx(DRAWER, (_a = {},
            _a[VERTICAL] = !realPosition && vertical,
            _a[realPosition ? positionClass(realPosition) : ""] = true,
            _a), this.props.className);
        var styleProp = size == null
            ? style
            : __assign({}, style, (_b = {}, _b[(realPosition ? isPositionHorizontal(realPosition) : vertical) ? "height" : "width"] = size, _b));
        return (createElement(Overlay, __assign({}, this.props, { className: OVERLAY_CONTAINER }),
            createElement("div", { className: classes$1, style: styleProp },
                this.maybeRenderHeader(),
                this.props.children)));
    };
    Drawer.prototype.validateProps = function (props) {
        if (props.title == null) {
            if (props.icon != null) {
                console.warn(DIALOG_WARN_NO_HEADER_ICON);
            }
            if (props.isCloseButtonShown != null) {
                console.warn(DIALOG_WARN_NO_HEADER_CLOSE_BUTTON);
            }
        }
        if (props.position != null) {
            if (props.vertical) {
                console.warn(DRAWER_VERTICAL_IS_IGNORED);
            }
            if (props.position !== getPositionIgnoreAngles(props.position)) {
                console.warn(DRAWER_ANGLE_POSITIONS_ARE_CASTED);
            }
        }
    };
    Drawer.prototype.maybeRenderCloseButton = function () {
        // `isCloseButtonShown` can't be defaulted through default props because of props validation
        // so this check actually defaults it to true (fails only if directly set to false)
        if (this.props.isCloseButtonShown !== false) {
            return (createElement(Button, { "aria-label": "Close", className: DIALOG_CLOSE_BUTTON, icon: createElement(Icon, { icon: "small-cross", iconSize: Icon.SIZE_LARGE }), minimal: true, onClick: this.props.onClose }));
        }
        else {
            return null;
        }
    };
    Drawer.prototype.maybeRenderHeader = function () {
        var _a = this.props, icon = _a.icon, title = _a.title;
        if (title == null) {
            return null;
        }
        return (createElement("div", { className: DRAWER_HEADER },
            createElement(Icon, { icon: icon, iconSize: Icon.SIZE_LARGE }),
            createElement(H4, null, title),
            this.maybeRenderCloseButton()));
    };
    Drawer.displayName = DISPLAYNAME_PREFIX + ".Drawer";
    Drawer.defaultProps = {
        canOutsideClickClose: true,
        isOpen: false,
        position: null,
        style: {},
        vertical: false,
    };
    Drawer.SIZE_SMALL = "360px";
    Drawer.SIZE_STANDARD = "50%";
    Drawer.SIZE_LARGE = "90%";
    Drawer = __decorate([
        polyfill
    ], Drawer);
    return Drawer;
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
var userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
var browser = {
    isEdge: /Edge/.test(userAgent),
    isInternetExplorer: /Trident|rv:11/.test(userAgent),
    isWebkit: /AppleWebKit/.test(userAgent),
};
var Browser = {
    isEdge: function () { return browser.isEdge; },
    isInternetExplorer: function () { return browser.isInternetExplorer; },
    isWebkit: function () { return browser.isWebkit; },
};

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
var BUFFER_WIDTH_EDGE = 5;
var BUFFER_WIDTH_IE = 30;
var EditableText = /** @class */ (function (_super) {
    __extends(EditableText, _super);
    function EditableText(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.refHandlers = {
            content: function (spanElement) {
                _this.valueElement = spanElement;
            },
            input: function (input) {
                if (input != null) {
                    _this.inputElement = input;
                    // temporary fix for #3882
                    if (!_this.props.alwaysRenderInput) {
                        _this.inputElement.focus();
                    }
                    if (_this.state != null && _this.state.isEditing) {
                        var supportsSelection = inputSupportsSelection(input);
                        if (supportsSelection) {
                            var length_1 = input.value.length;
                            input.setSelectionRange(_this.props.selectAllOnFocus ? 0 : length_1, length_1);
                        }
                        if (!supportsSelection || !_this.props.selectAllOnFocus) {
                            input.scrollLeft = input.scrollWidth;
                        }
                    }
                }
            },
        };
        _this.cancelEditing = function () {
            var _a = _this.state, lastValue = _a.lastValue, value = _a.value;
            _this.setState({ isEditing: false, value: lastValue });
            if (value !== lastValue) {
                safeInvoke(_this.props.onChange, lastValue);
            }
            safeInvoke(_this.props.onCancel, lastValue);
        };
        _this.toggleEditing = function () {
            if (_this.state.isEditing) {
                var value = _this.state.value;
                _this.setState({ isEditing: false, lastValue: value });
                safeInvoke(_this.props.onConfirm, value);
            }
            else if (!_this.props.disabled) {
                _this.setState({ isEditing: true });
            }
        };
        _this.handleFocus = function () {
            var _a = _this.props, alwaysRenderInput = _a.alwaysRenderInput, disabled = _a.disabled, selectAllOnFocus = _a.selectAllOnFocus;
            if (!disabled) {
                _this.setState({ isEditing: true });
            }
            if (alwaysRenderInput && selectAllOnFocus && _this.inputElement != null) {
                var length_2 = _this.inputElement.value.length;
                _this.inputElement.setSelectionRange(0, length_2);
            }
        };
        _this.handleTextChange = function (event) {
            var value = event.target.value;
            // state value should be updated only when uncontrolled
            if (_this.props.value == null) {
                _this.setState({ value: value });
            }
            safeInvoke(_this.props.onChange, value);
        };
        _this.handleKeyEvent = function (event) {
            var altKey = event.altKey, ctrlKey = event.ctrlKey, metaKey = event.metaKey, shiftKey = event.shiftKey, which = event.which;
            if (which === ESCAPE) {
                _this.cancelEditing();
                return;
            }
            var hasModifierKey = altKey || ctrlKey || metaKey || shiftKey;
            if (which === ENTER) {
                // prevent IE11 from full screening with alt + enter
                // shift + enter adds a newline by default
                if (altKey || shiftKey) {
                    event.preventDefault();
                }
                if (_this.props.confirmOnEnterKey && _this.props.multiline) {
                    if (event.target != null && hasModifierKey) {
                        insertAtCaret(event.target, "\n");
                        _this.handleTextChange(event);
                    }
                    else {
                        _this.toggleEditing();
                    }
                }
                else if (!_this.props.multiline || hasModifierKey) {
                    _this.toggleEditing();
                }
            }
        };
        var value = props.value == null ? props.defaultValue : props.value;
        _this.state = {
            inputHeight: 0,
            inputWidth: 0,
            isEditing: props.isEditing === true && props.disabled === false,
            lastValue: value,
            value: value,
        };
        return _this;
    }
    EditableText.prototype.render = function () {
        var _a;
        var _b = this.props, alwaysRenderInput = _b.alwaysRenderInput, disabled = _b.disabled, multiline = _b.multiline;
        var value = this.props.value == null ? this.state.value : this.props.value;
        var hasValue = value != null && value !== "";
        var classes$1 = cx(EDITABLE_TEXT, intentClass(this.props.intent), (_a = {},
            _a[DISABLED] = disabled,
            _a[EDITABLE_TEXT_EDITING] = this.state.isEditing,
            _a[EDITABLE_TEXT_PLACEHOLDER] = !hasValue,
            _a[MULTILINE] = multiline,
            _a), this.props.className);
        var contentStyle;
        if (multiline) {
            // set height only in multiline mode when not editing
            // otherwise we're measuring this element to determine appropriate height of text
            contentStyle = { height: !this.state.isEditing ? this.state.inputHeight : null };
        }
        else {
            // minWidth only applies in single line mode (multiline == width 100%)
            contentStyle = {
                height: this.state.inputHeight,
                lineHeight: this.state.inputHeight != null ? this.state.inputHeight + "px" : null,
                minWidth: this.props.minWidth,
            };
        }
        // If we are always rendering an input, then NEVER make the container div focusable.
        // Otherwise, make container div focusable when not editing, so it can still be tabbed
        // to focus (when the input is rendered, it is itself focusable so container div doesn't need to be)
        var tabIndex = alwaysRenderInput || this.state.isEditing || disabled ? null : 0;
        // we need the contents to be rendered while editing so that we can measure their height
        // and size the container element responsively
        var shouldHideContents = alwaysRenderInput && !this.state.isEditing;
        return (createElement("div", { className: classes$1, onFocus: this.handleFocus, tabIndex: tabIndex },
            alwaysRenderInput || this.state.isEditing ? this.renderInput(value) : undefined,
            shouldHideContents ? (undefined) : (createElement("span", { className: EDITABLE_TEXT_CONTENT, ref: this.refHandlers.content, style: contentStyle }, hasValue ? value : this.props.placeholder))));
    };
    EditableText.prototype.componentDidMount = function () {
        this.updateInputDimensions();
    };
    EditableText.prototype.componentDidUpdate = function (prevProps, prevState) {
        var state = {};
        if (this.props.value != null && this.props.value !== prevProps.value) {
            state.value = this.props.value;
        }
        if (this.props.isEditing != null && this.props.isEditing !== prevProps.isEditing) {
            state.isEditing = this.props.isEditing;
        }
        if (this.props.disabled || (this.props.disabled == null && prevProps.disabled)) {
            state.isEditing = false;
        }
        this.setState(state);
        if (this.state.isEditing && !prevState.isEditing) {
            safeInvoke(this.props.onEdit, this.state.value);
        }
        this.updateInputDimensions();
    };
    EditableText.prototype.renderInput = function (value) {
        var _a = this.props, maxLength = _a.maxLength, multiline = _a.multiline, type = _a.type, placeholder = _a.placeholder;
        var props = {
            className: EDITABLE_TEXT_INPUT,
            maxLength: maxLength,
            onBlur: this.toggleEditing,
            onChange: this.handleTextChange,
            onKeyDown: this.handleKeyEvent,
            placeholder: placeholder,
            value: value,
        };
        var _b = this.state, inputHeight = _b.inputHeight, inputWidth = _b.inputWidth;
        if (inputHeight !== 0 && inputWidth !== 0) {
            props.style = {
                height: inputHeight,
                lineHeight: !multiline && inputHeight != null ? inputHeight + "px" : null,
                width: multiline ? "100%" : inputWidth,
            };
        }
        return multiline ? (createElement("textarea", __assign({ ref: this.refHandlers.input }, props))) : (createElement("input", __assign({ ref: this.refHandlers.input, type: type }, props)));
    };
    EditableText.prototype.updateInputDimensions = function () {
        if (this.valueElement != null) {
            var _a = this.props, maxLines = _a.maxLines, minLines = _a.minLines, minWidth = _a.minWidth, multiline = _a.multiline;
            var _b = this.valueElement, parentElement_1 = _b.parentElement, textContent = _b.textContent;
            var _c = this.valueElement, scrollHeight_1 = _c.scrollHeight, scrollWidth = _c.scrollWidth;
            var lineHeight = getLineHeight(this.valueElement);
            // add one line to computed <span> height if text ends in newline
            // because <span> collapses that trailing whitespace but <textarea> shows it
            if (multiline && this.state.isEditing && /\n$/.test(textContent)) {
                scrollHeight_1 += lineHeight;
            }
            if (lineHeight > 0) {
                // line height could be 0 if the isNaN block from getLineHeight kicks in
                scrollHeight_1 = clamp(scrollHeight_1, minLines * lineHeight, maxLines * lineHeight);
            }
            // Chrome's input caret height misaligns text so the line-height must be larger than font-size.
            // The computed scrollHeight must also account for a larger inherited line-height from the parent.
            scrollHeight_1 = Math.max(scrollHeight_1, getFontSize(this.valueElement) + 1, getLineHeight(parentElement_1));
            // IE11 & Edge needs a small buffer so text does not shift prior to resizing
            if (Browser.isEdge()) {
                scrollWidth += BUFFER_WIDTH_EDGE;
            }
            else if (Browser.isInternetExplorer()) {
                scrollWidth += BUFFER_WIDTH_IE;
            }
            this.setState({
                inputHeight: scrollHeight_1,
                inputWidth: Math.max(scrollWidth, minWidth),
            });
            // synchronizes the ::before pseudo-element's height while editing for Chrome 53
            if (multiline && this.state.isEditing) {
                this.setTimeout(function () { return (parentElement_1.style.height = scrollHeight_1 + "px"); });
            }
        }
    };
    EditableText.displayName = DISPLAYNAME_PREFIX + ".EditableText";
    EditableText.defaultProps = {
        alwaysRenderInput: false,
        confirmOnEnterKey: false,
        defaultValue: "",
        disabled: false,
        maxLines: Infinity,
        minLines: 1,
        minWidth: 80,
        multiline: false,
        placeholder: "Click to Edit",
        type: "text",
    };
    EditableText = __decorate([
        polyfill
    ], EditableText);
    return EditableText;
}(AbstractPureComponent2));
function getFontSize(element) {
    var fontSize = getComputedStyle(element).fontSize;
    return fontSize === "" ? 0 : parseInt(fontSize.slice(0, -2), 10);
}
function getLineHeight(element) {
    // getComputedStyle() => 18.0001px => 18
    var lineHeight = parseInt(getComputedStyle(element).lineHeight.slice(0, -2), 10);
    // this check will be true if line-height is a keyword like "normal"
    if (isNaN(lineHeight)) {
        // @see http://stackoverflow.com/a/18430767/6342931
        var line = document.createElement("span");
        line.innerHTML = "<br>";
        element.appendChild(line);
        var singleLineHeight = element.offsetHeight;
        line.innerHTML = "<br><br>";
        var doubleLineHeight = element.offsetHeight;
        element.removeChild(line);
        // this can return 0 in edge cases
        lineHeight = doubleLineHeight - singleLineHeight;
    }
    return lineHeight;
}
function insertAtCaret(el, text) {
    var selectionEnd = el.selectionEnd, selectionStart = el.selectionStart, value = el.value;
    if (selectionStart >= 0) {
        var before_1 = value.substring(0, selectionStart);
        var after_1 = value.substring(selectionEnd, value.length);
        var len = text.length;
        el.value = "" + before_1 + text + after_1;
        el.selectionStart = selectionStart + len;
        el.selectionEnd = selectionStart + len;
    }
}
function inputSupportsSelection(input) {
    switch (input.type) {
        // HTMLTextAreaElement
        case "textarea":
            return true;
        // HTMLInputElement
        // see https://html.spec.whatwg.org/multipage/input.html#do-not-apply
        case "text":
        case "search":
        case "tel":
        case "url":
        case "password":
            return true;
        default:
            return false;
    }
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
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var ControlGroup = /** @class */ (function (_super) {
    __extends(ControlGroup, _super);
    function ControlGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ControlGroup.prototype.render = function () {
        var _a;
        var _b = this.props, children = _b.children, className = _b.className, fill = _b.fill, vertical = _b.vertical, htmlProps = __rest(_b, ["children", "className", "fill", "vertical"]);
        var rootClasses = cx(CONTROL_GROUP, (_a = {},
            _a[FILL] = fill,
            _a[VERTICAL] = vertical,
            _a), className);
        return (createElement("div", __assign({}, htmlProps, { className: rootClasses }), children));
    };
    ControlGroup.displayName = DISPLAYNAME_PREFIX + ".ControlGroup";
    ControlGroup = __decorate([
        polyfill
    ], ControlGroup);
    return ControlGroup;
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
/**
 * Renders common control elements, with additional props to customize appearance.
 * This component is not exported and is only used in this file for `Checkbox`, `Radio`, and `Switch` below.
 */
var Control = function (_a) {
    var _b;
    var alignIndicator = _a.alignIndicator, children = _a.children, className = _a.className, indicatorChildren = _a.indicatorChildren, inline = _a.inline, inputRef = _a.inputRef, label = _a.label, labelElement = _a.labelElement, large = _a.large, style = _a.style, type = _a.type, typeClassName = _a.typeClassName, _c = _a.tagName, tagName = _c === void 0 ? "label" : _c, htmlProps = __rest(_a, ["alignIndicator", "children", "className", "indicatorChildren", "inline", "inputRef", "label", "labelElement", "large", "style", "type", "typeClassName", "tagName"]);
    var classes$1 = cx(CONTROL, typeClassName, (_b = {},
        _b[DISABLED] = htmlProps.disabled,
        _b[INLINE] = inline,
        _b[LARGE] = large,
        _b), alignmentClass(alignIndicator), className);
    return createElement(tagName, { className: classes$1, style: style }, createElement("input", __assign({}, htmlProps, { ref: inputRef, type: type })), createElement("span", { className: CONTROL_INDICATOR }, indicatorChildren), label, labelElement, children);
};
var Switch = /** @class */ (function (_super) {
    __extends(Switch, _super);
    function Switch() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Switch.prototype.render = function () {
        var _a = this.props, innerLabelChecked = _a.innerLabelChecked, innerLabel = _a.innerLabel, controlProps = __rest(_a, ["innerLabelChecked", "innerLabel"]);
        var switchLabels = innerLabel || innerLabelChecked
            ? [
                createElement("div", { key: "checked", className: CONTROL_INDICATOR_CHILD },
                    createElement("div", { className: SWITCH_INNER_TEXT }, innerLabelChecked ? innerLabelChecked : innerLabel)),
                createElement("div", { key: "unchecked", className: CONTROL_INDICATOR_CHILD },
                    createElement("div", { className: SWITCH_INNER_TEXT }, innerLabel)),
            ]
            : null;
        return (createElement(Control, __assign({}, controlProps, { type: "checkbox", typeClassName: SWITCH, indicatorChildren: switchLabels })));
    };
    Switch.displayName = DISPLAYNAME_PREFIX + ".Switch";
    Switch = __decorate([
        polyfill
    ], Switch);
    return Switch;
}(AbstractPureComponent2));
var Radio = /** @class */ (function (_super) {
    __extends(Radio, _super);
    function Radio() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Radio.prototype.render = function () {
        return createElement(Control, __assign({}, this.props, { type: "radio", typeClassName: RADIO }));
    };
    Radio.displayName = DISPLAYNAME_PREFIX + ".Radio";
    Radio = __decorate([
        polyfill
    ], Radio);
    return Radio;
}(AbstractPureComponent2));
var Checkbox = /** @class */ (function (_super) {
    __extends(Checkbox, _super);
    function Checkbox() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            indeterminate: _this.props.indeterminate || _this.props.defaultIndeterminate || false,
        };
        _this.handleChange = function (evt) {
            var indeterminate = evt.target.indeterminate;
            // update state immediately only if uncontrolled
            if (_this.props.indeterminate == null) {
                _this.setState({ indeterminate: indeterminate });
            }
            // otherwise wait for props change. always invoke handler.
            safeInvoke(_this.props.onChange, evt);
        };
        _this.handleInputRef = function (ref) {
            _this.input = ref;
            safeInvoke(_this.props.inputRef, ref);
        };
        return _this;
    }
    Checkbox.getDerivedStateFromProps = function (_a) {
        var indeterminate = _a.indeterminate;
        // put props into state if controlled by props
        if (indeterminate != null) {
            return { indeterminate: indeterminate };
        }
        return null;
    };
    Checkbox.prototype.render = function () {
        var _a = this.props, defaultIndeterminate = _a.defaultIndeterminate, indeterminate = _a.indeterminate, controlProps = __rest(_a, ["defaultIndeterminate", "indeterminate"]);
        return (createElement(Control, __assign({}, controlProps, { inputRef: this.handleInputRef, onChange: this.handleChange, type: "checkbox", typeClassName: CHECKBOX })));
    };
    Checkbox.prototype.componentDidMount = function () {
        this.updateIndeterminate();
    };
    Checkbox.prototype.componentDidUpdate = function () {
        this.updateIndeterminate();
    };
    Checkbox.prototype.updateIndeterminate = function () {
        if (this.input != null) {
            this.input.indeterminate = this.state.indeterminate;
        }
    };
    Checkbox.displayName = DISPLAYNAME_PREFIX + ".Checkbox";
    Checkbox = __decorate([
        polyfill
    ], Checkbox);
    return Checkbox;
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
// TODO: write tests (ignoring for now to get a build passing quickly)
/* istanbul ignore next */
var FileInput = /** @class */ (function (_super) {
    __extends(FileInput, _super);
    function FileInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleInputChange = function (e) {
            safeInvoke(_this.props.onInputChange, e);
            safeInvoke(_this.props.inputProps.onChange, e);
        };
        return _this;
    }
    FileInput.prototype.render = function () {
        var _a, _b, _c;
        var _d = this.props, buttonText = _d.buttonText, className = _d.className, disabled = _d.disabled, fill = _d.fill, hasSelection = _d.hasSelection, inputProps = _d.inputProps, large = _d.large, onInputChange = _d.onInputChange, text = _d.text, htmlProps = __rest(_d, ["buttonText", "className", "disabled", "fill", "hasSelection", "inputProps", "large", "onInputChange", "text"]);
        var rootClasses = cx(FILE_INPUT, (_a = {},
            _a[FILE_INPUT_HAS_SELECTION] = hasSelection,
            _a[DISABLED] = disabled,
            _a[FILL] = fill,
            _a[LARGE] = large,
            _a), className);
        var NS = getClassNamespace();
        var uploadProps = (_b = {},
            _b[NS + "-button-text"] = buttonText,
            _b.className = cx(FILE_UPLOAD_INPUT, (_c = {},
                _c[FILE_UPLOAD_INPUT_CUSTOM_TEXT] = !!buttonText,
                _c)),
            _b);
        return (createElement("label", __assign({}, htmlProps, { className: rootClasses }),
            createElement("input", __assign({}, inputProps, { onChange: this.handleInputChange, type: "file", disabled: disabled })),
            createElement("span", __assign({}, uploadProps), text)));
    };
    FileInput.displayName = DISPLAYNAME_PREFIX + ".FileInput";
    FileInput.defaultProps = {
        hasSelection: false,
        inputProps: {},
        text: "Choose file...",
    };
    FileInput = __decorate([
        polyfill
    ], FileInput);
    return FileInput;
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
var FormGroup = /** @class */ (function (_super) {
    __extends(FormGroup, _super);
    function FormGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FormGroup.prototype.render = function () {
        var _a = this.props, children = _a.children, contentClassName = _a.contentClassName, helperText = _a.helperText, label = _a.label, labelFor = _a.labelFor, labelInfo = _a.labelInfo, style = _a.style;
        return (createElement("div", { className: this.getClassName(), style: style },
            label && (createElement("label", { className: LABEL, htmlFor: labelFor },
                label,
                " ",
                createElement("span", { className: TEXT_MUTED }, labelInfo))),
            createElement("div", { className: cx(FORM_CONTENT, contentClassName) },
                children,
                helperText && createElement("div", { className: FORM_HELPER_TEXT }, helperText))));
    };
    FormGroup.prototype.getClassName = function () {
        var _a;
        var _b = this.props, className = _b.className, disabled = _b.disabled, inline = _b.inline, intent = _b.intent;
        return cx(FORM_GROUP, intentClass(intent), (_a = {},
            _a[DISABLED] = disabled,
            _a[INLINE] = inline,
            _a), className);
    };
    FormGroup.displayName = DISPLAYNAME_PREFIX + ".FormGroup";
    FormGroup = __decorate([
        polyfill
    ], FormGroup);
    return FormGroup;
}(AbstractPureComponent2));

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
function clampValue(value, min, max) {
    // defaultProps won't work if the user passes in null, so just default
    // to +/- infinity here instead, as a catch-all.
    var adjustedMin = min != null ? min : -Infinity;
    var adjustedMax = max != null ? max : Infinity;
    return clamp(value, adjustedMin, adjustedMax);
}
function getValueOrEmptyValue(value) {
    if (value === void 0) { value = ""; }
    return value.toString();
}
/** Returns `true` if the string represents a valid numeric value, like "1e6". */
function isValueNumeric(value) {
    // checking if a string is numeric in Typescript is a big pain, because
    // we can't simply toss a string parameter to isFinite. below is the
    // essential approach that jQuery uses, which involves subtracting a
    // parsed numeric value from the string representation of the value. we
    // need to cast the value to the `any` type to allow this operation
    // between dissimilar types.
    return value != null && value - parseFloat(value) + 1 >= 0;
}
function isValidNumericKeyboardEvent(e) {
    // unit tests may not include e.key. don't bother disabling those events.
    if (e.key == null) {
        return true;
    }
    // allow modified key strokes that may involve letters and other
    // non-numeric/invalid characters (Cmd + A, Cmd + C, Cmd + V, Cmd + X).
    if (e.ctrlKey || e.altKey || e.metaKey) {
        return true;
    }
    // keys that print a single character when pressed have a `key` name of
    // length 1. every other key has a longer `key` name (e.g. "Backspace",
    // "ArrowUp", "Shift"). since none of those keys can print a character
    // to the field--and since they may have important native behaviors
    // beyond printing a character--we don't want to disable their effects.
    var isSingleCharKey = e.key.length === 1;
    if (!isSingleCharKey) {
        return true;
    }
    // now we can simply check that the single character that wants to be printed
    // is a floating-point number character that we're allowed to print.
    return isFloatingPointNumericCharacter(e.key);
}
/**
 * A regex that matches a string of length 1 (i.e. a standalone character)
 * if and only if it is a floating-point number character as defined by W3C:
 * https://www.w3.org/TR/2012/WD-html-markup-20120329/datatypes.html#common.data.float
 *
 * Floating-point number characters are the only characters that can be
 * printed within a default input[type="number"]. This component should
 * behave the same way when this.props.allowNumericCharactersOnly = true.
 * See here for the input[type="number"].value spec:
 * https://www.w3.org/TR/2012/WD-html-markup-20120329/input.number.html#input.number.attrs.value
 */
var FLOATING_POINT_NUMBER_CHARACTER_REGEX = /^[Ee0-9\+\-\.]$/;
function isFloatingPointNumericCharacter(character) {
    return FLOATING_POINT_NUMBER_CHARACTER_REGEX.test(character);
}
/**
 * Round the value to have _up to_ the specified maximum precision.
 *
 * This differs from `toFixed(5)` in that trailing zeroes are not added on
 * more precise values, resulting in shorter strings.
 */
function toMaxPrecision(value, maxPrecision) {
    // round the value to have the specified maximum precision (toFixed is the wrong choice,
    // because it would show trailing zeros in the decimal part out to the specified precision)
    // source: http://stackoverflow.com/a/18358056/5199574
    var scaleFactor = Math.pow(10, maxPrecision);
    return Math.round(value * scaleFactor) / scaleFactor;
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
var IncrementDirection;
(function (IncrementDirection) {
    IncrementDirection[IncrementDirection["DOWN"] = -1] = "DOWN";
    IncrementDirection[IncrementDirection["UP"] = 1] = "UP";
})(IncrementDirection || (IncrementDirection = {}));
var NON_HTML_PROPS = [
    "allowNumericCharactersOnly",
    "buttonPosition",
    "clampValueOnBlur",
    "className",
    "majorStepSize",
    "minorStepSize",
    "onButtonClick",
    "onValueChange",
    "selectAllOnFocus",
    "selectAllOnIncrement",
    "stepSize",
];
var NumericInput = /** @class */ (function (_super) {
    __extends(NumericInput, _super);
    function NumericInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            shouldSelectAfterUpdate: false,
            stepMaxPrecision: NumericInput_1.getStepMaxPrecision(_this.props),
            value: getValueOrEmptyValue(_this.props.value),
        };
        // updating these flags need not trigger re-renders, so don't include them in this.state.
        _this.didPasteEventJustOccur = false;
        _this.delta = 0;
        _this.inputElement = null;
        _this.intervalId = null;
        _this.incrementButtonHandlers = _this.getButtonEventHandlers(IncrementDirection.UP);
        _this.decrementButtonHandlers = _this.getButtonEventHandlers(IncrementDirection.DOWN);
        _this.inputRef = function (input) {
            _this.inputElement = input;
            safeInvoke(_this.props.inputRef, input);
        };
        _this.handleButtonClick = function (e, direction) {
            var delta = _this.updateDelta(direction, e);
            var nextValue = _this.incrementValue(delta);
            _this.invokeValueCallback(nextValue, _this.props.onButtonClick);
        };
        _this.stopContinuousChange = function () {
            _this.delta = 0;
            _this.clearTimeouts();
            clearInterval(_this.intervalId);
            document.removeEventListener("mouseup", _this.stopContinuousChange);
        };
        _this.handleContinuousChange = function () {
            var nextValue = _this.incrementValue(_this.delta);
            _this.invokeValueCallback(nextValue, _this.props.onButtonClick);
        };
        // Callbacks - Input
        // =================
        _this.handleInputFocus = function (e) {
            // update this state flag to trigger update for input selection (see componentDidUpdate)
            _this.setState({ shouldSelectAfterUpdate: _this.props.selectAllOnFocus });
            safeInvoke(_this.props.onFocus, e);
        };
        _this.handleInputBlur = function (e) {
            // always disable this flag on blur so it's ready for next time.
            _this.setState({ shouldSelectAfterUpdate: false });
            if (_this.props.clampValueOnBlur) {
                var value = e.target.value;
                var sanitizedValue = _this.getSanitizedValue(value);
                _this.setState({ value: sanitizedValue });
            }
            safeInvoke(_this.props.onBlur, e);
        };
        _this.handleInputKeyDown = function (e) {
            if (_this.props.disabled || _this.props.readOnly) {
                return;
            }
            var keyCode = e.keyCode;
            var direction;
            if (keyCode === ARROW_UP) {
                direction = IncrementDirection.UP;
            }
            else if (keyCode === ARROW_DOWN) {
                direction = IncrementDirection.DOWN;
            }
            if (direction != null) {
                // when the input field has focus, some key combinations will modify
                // the field's selection range. we'll actually want to select all
                // text in the field after we modify the value on the following
                // lines. preventing the default selection behavior lets us do that
                // without interference.
                e.preventDefault();
                var delta = _this.updateDelta(direction, e);
                _this.incrementValue(delta);
            }
            safeInvoke(_this.props.onKeyDown, e);
        };
        _this.handleInputKeyPress = function (e) {
            // we prohibit keystrokes in onKeyPress instead of onKeyDown, because
            // e.key is not trustworthy in onKeyDown in all browsers.
            if (_this.props.allowNumericCharactersOnly && !isValidNumericKeyboardEvent(e)) {
                e.preventDefault();
            }
            safeInvoke(_this.props.onKeyPress, e);
        };
        _this.handleInputPaste = function (e) {
            _this.didPasteEventJustOccur = true;
            safeInvoke(_this.props.onPaste, e);
        };
        _this.handleInputChange = function (e) {
            var value = e.target.value;
            var nextValue = value;
            if (_this.props.allowNumericCharactersOnly && _this.didPasteEventJustOccur) {
                _this.didPasteEventJustOccur = false;
                var valueChars = value.split("");
                var sanitizedValueChars = valueChars.filter(isFloatingPointNumericCharacter);
                var sanitizedValue = sanitizedValueChars.join("");
                nextValue = sanitizedValue;
            }
            _this.setState({ shouldSelectAfterUpdate: false, value: nextValue });
        };
        return _this;
    }
    NumericInput_1 = NumericInput;
    NumericInput.getDerivedStateFromProps = function (props, state) {
        var nextState = { prevMinProp: props.min, prevMaxProp: props.max, prevValueProp: props.value };
        var didMinChange = props.min !== state.prevMinProp;
        var didMaxChange = props.max !== state.prevMaxProp;
        var didBoundsChange = didMinChange || didMaxChange;
        var didValuePropChange = props.value !== state.prevValueProp;
        var value = getValueOrEmptyValue(didValuePropChange ? props.value : state.value);
        var sanitizedValue = value !== NumericInput_1.VALUE_EMPTY
            ? NumericInput_1.getSanitizedValue(value, /* delta */ 0, props.min, props.max)
            : NumericInput_1.VALUE_EMPTY;
        var stepMaxPrecision = NumericInput_1.getStepMaxPrecision(props);
        // if a new min and max were provided that cause the existing value to fall
        // outside of the new bounds, then clamp the value to the new valid range.
        if (didBoundsChange && sanitizedValue !== state.value) {
            return __assign({}, nextState, { stepMaxPrecision: stepMaxPrecision, value: sanitizedValue });
        }
        else {
            return __assign({}, nextState, { stepMaxPrecision: stepMaxPrecision, value: value });
        }
    };
    // Value Helpers
    // =============
    NumericInput.getStepMaxPrecision = function (props) {
        if (props.minorStepSize != null) {
            return countDecimalPlaces(props.minorStepSize);
        }
        else {
            return countDecimalPlaces(props.stepSize);
        }
    };
    NumericInput.getSanitizedValue = function (value, stepMaxPrecision, min, max, delta) {
        if (delta === void 0) { delta = 0; }
        if (!isValueNumeric(value)) {
            return NumericInput_1.VALUE_EMPTY;
        }
        var nextValue = toMaxPrecision(parseFloat(value) + delta, stepMaxPrecision);
        return clampValue(nextValue, min, max).toString();
    };
    NumericInput.prototype.render = function () {
        var _a;
        var _b = this.props, buttonPosition = _b.buttonPosition, className = _b.className, fill = _b.fill, large = _b.large;
        var containerClasses = cx(NUMERIC_INPUT, (_a = {}, _a[LARGE] = large, _a), className);
        var buttons = this.renderButtons();
        return (createElement(ControlGroup, { className: containerClasses, fill: fill },
            buttonPosition === Position.LEFT && buttons,
            this.renderInput(),
            buttonPosition === Position.RIGHT && buttons));
    };
    NumericInput.prototype.componentDidUpdate = function (prevProps, prevState) {
        _super.prototype.componentDidUpdate.call(this, prevProps, prevState);
        if (this.state.shouldSelectAfterUpdate) {
            this.inputElement.setSelectionRange(0, this.state.value.length);
        }
        var didControlledValueChange = this.props.value !== prevProps.value;
        if (!didControlledValueChange && this.state.value !== prevState.value) {
            this.invokeValueCallback(this.state.value, this.props.onValueChange);
        }
    };
    NumericInput.prototype.validateProps = function (nextProps) {
        var majorStepSize = nextProps.majorStepSize, max = nextProps.max, min = nextProps.min, minorStepSize = nextProps.minorStepSize, stepSize = nextProps.stepSize;
        if (min != null && max != null && min > max) {
            throw new Error(NUMERIC_INPUT_MIN_MAX);
        }
        if (stepSize == null) {
            throw new Error(NUMERIC_INPUT_STEP_SIZE_NULL);
        }
        if (stepSize <= 0) {
            throw new Error(NUMERIC_INPUT_STEP_SIZE_NON_POSITIVE);
        }
        if (minorStepSize && minorStepSize <= 0) {
            throw new Error(NUMERIC_INPUT_MINOR_STEP_SIZE_NON_POSITIVE);
        }
        if (majorStepSize && majorStepSize <= 0) {
            throw new Error(NUMERIC_INPUT_MAJOR_STEP_SIZE_NON_POSITIVE);
        }
        if (minorStepSize && minorStepSize > stepSize) {
            throw new Error(NUMERIC_INPUT_MINOR_STEP_SIZE_BOUND);
        }
        if (majorStepSize && majorStepSize < stepSize) {
            throw new Error(NUMERIC_INPUT_MAJOR_STEP_SIZE_BOUND);
        }
    };
    // Render Helpers
    // ==============
    NumericInput.prototype.renderButtons = function () {
        var intent = this.props.intent;
        var disabled = this.props.disabled || this.props.readOnly;
        return (createElement(ButtonGroup, { className: FIXED, key: "button-group", vertical: true },
            createElement(Button, __assign({ disabled: disabled, icon: "chevron-up", intent: intent }, this.incrementButtonHandlers)),
            createElement(Button, __assign({ disabled: disabled, icon: "chevron-down", intent: intent }, this.decrementButtonHandlers))));
    };
    NumericInput.prototype.renderInput = function () {
        var inputGroupHtmlProps = removeNonHTMLProps(this.props, NON_HTML_PROPS, true);
        return (createElement(InputGroup, __assign({ autoComplete: "off" }, inputGroupHtmlProps, { intent: this.props.intent, inputRef: this.inputRef, large: this.props.large, leftIcon: this.props.leftIcon, onFocus: this.handleInputFocus, onBlur: this.handleInputBlur, onChange: this.handleInputChange, onKeyDown: this.handleInputKeyDown, onKeyPress: this.handleInputKeyPress, onPaste: this.handleInputPaste, rightElement: this.props.rightElement, value: this.state.value })));
    };
    // Callbacks - Buttons
    // ===================
    NumericInput.prototype.getButtonEventHandlers = function (direction) {
        var _this = this;
        return {
            // keydown is fired repeatedly when held so it's implicitly continuous
            onKeyDown: function (evt) {
                if (isKeyboardClick(evt.keyCode)) {
                    _this.handleButtonClick(evt, direction);
                }
            },
            onMouseDown: function (evt) {
                _this.handleButtonClick(evt, direction);
                _this.startContinuousChange();
            },
        };
    };
    NumericInput.prototype.startContinuousChange = function () {
        var _this = this;
        // The button's onMouseUp event handler doesn't fire if the user
        // releases outside of the button, so we need to watch all the way
        // from the top.
        document.addEventListener("mouseup", this.stopContinuousChange);
        // Initial delay is slightly longer to prevent the user from
        // accidentally triggering the continuous increment/decrement.
        this.setTimeout(function () {
            _this.intervalId = window.setInterval(_this.handleContinuousChange, NumericInput_1.CONTINUOUS_CHANGE_INTERVAL);
        }, NumericInput_1.CONTINUOUS_CHANGE_DELAY);
    };
    NumericInput.prototype.invokeValueCallback = function (value, callback) {
        safeInvoke(callback, +value, value);
    };
    NumericInput.prototype.incrementValue = function (delta) {
        // pretend we're incrementing from 0 if currValue is empty
        var currValue = this.state.value || NumericInput_1.VALUE_ZERO;
        var nextValue = this.getSanitizedValue(currValue, delta);
        this.setState({ shouldSelectAfterUpdate: this.props.selectAllOnIncrement, value: nextValue });
        return nextValue;
    };
    NumericInput.prototype.getIncrementDelta = function (direction, isShiftKeyPressed, isAltKeyPressed) {
        var _a = this.props, majorStepSize = _a.majorStepSize, minorStepSize = _a.minorStepSize, stepSize = _a.stepSize;
        if (isShiftKeyPressed && majorStepSize != null) {
            return direction * majorStepSize;
        }
        else if (isAltKeyPressed && minorStepSize != null) {
            return direction * minorStepSize;
        }
        else {
            return direction * stepSize;
        }
    };
    NumericInput.prototype.getSanitizedValue = function (value, delta) {
        if (delta === void 0) { delta = 0; }
        return NumericInput_1.getSanitizedValue(value, this.state.stepMaxPrecision, this.props.min, this.props.max, delta);
    };
    NumericInput.prototype.updateDelta = function (direction, e) {
        this.delta = this.getIncrementDelta(direction, e.shiftKey, e.altKey);
        return this.delta;
    };
    var NumericInput_1;
    NumericInput.displayName = DISPLAYNAME_PREFIX + ".NumericInput";
    NumericInput.VALUE_EMPTY = "";
    NumericInput.VALUE_ZERO = "0";
    NumericInput.defaultProps = {
        allowNumericCharactersOnly: true,
        buttonPosition: Position.RIGHT,
        clampValueOnBlur: false,
        large: false,
        majorStepSize: 10,
        minorStepSize: 0.1,
        selectAllOnFocus: false,
        selectAllOnIncrement: false,
        stepSize: 1,
        value: NumericInput_1.VALUE_EMPTY,
    };
    NumericInput.CONTINUOUS_CHANGE_DELAY = 300;
    NumericInput.CONTINUOUS_CHANGE_INTERVAL = 100;
    NumericInput = NumericInput_1 = __decorate([
        polyfill
    ], NumericInput);
    return NumericInput;
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
var counter = 0;
function nextName() {
    return RadioGroup.displayName + "-" + counter++;
}
var RadioGroup = /** @class */ (function (_super) {
    __extends(RadioGroup, _super);
    function RadioGroup() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // a unique name for this group, which can be overridden by `name` prop.
        _this.autoGroupName = nextName();
        return _this;
    }
    RadioGroup.prototype.render = function () {
        var label = this.props.label;
        return (createElement("div", { className: this.props.className },
            label == null ? null : createElement("label", { className: LABEL }, label),
            Array.isArray(this.props.options) ? this.renderOptions() : this.renderChildren()));
    };
    RadioGroup.prototype.validateProps = function () {
        if (this.props.children != null && this.props.options != null) {
            console.warn(RADIOGROUP_WARN_CHILDREN_OPTIONS_MUTEX);
        }
    };
    RadioGroup.prototype.renderChildren = function () {
        var _this = this;
        return Children.map(this.props.children, function (child) {
            if (isElementOfType(child, Radio)) {
                return cloneElement(child, _this.getRadioProps(child.props));
            }
            else {
                return child;
            }
        });
    };
    RadioGroup.prototype.renderOptions = function () {
        var _this = this;
        return this.props.options.map(function (option) { return (createElement(Radio, __assign({}, _this.getRadioProps(option), { key: option.value, labelElement: option.label || option.value }))); });
    };
    RadioGroup.prototype.getRadioProps = function (optionProps) {
        var name = this.props.name;
        var className = optionProps.className, disabled = optionProps.disabled, value = optionProps.value;
        return {
            checked: value === this.props.selectedValue,
            className: className,
            disabled: disabled || this.props.disabled,
            inline: this.props.inline,
            name: name == null ? this.autoGroupName : name,
            onChange: this.props.onChange,
            value: value,
        };
    };
    RadioGroup.displayName = DISPLAYNAME_PREFIX + ".RadioGroup";
    RadioGroup = __decorate([
        polyfill
    ], RadioGroup);
    return RadioGroup;
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
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var TextArea = /** @class */ (function (_super) {
    __extends(TextArea, _super);
    function TextArea() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {};
        _this.handleChange = function (e) {
            if (_this.props.growVertically) {
                _this.setState({
                    height: e.target.scrollHeight,
                });
            }
            if (_this.props.onChange != null) {
                _this.props.onChange(e);
            }
        };
        // hold an internal ref for growVertically
        _this.handleInternalRef = function (ref) {
            _this.internalTextAreaRef = ref;
            if (_this.props.inputRef != null) {
                _this.props.inputRef(ref);
            }
        };
        return _this;
    }
    TextArea.prototype.componentDidMount = function () {
        if (this.props.growVertically) {
            this.setState({
                height: this.internalTextAreaRef.scrollHeight,
            });
        }
    };
    TextArea.prototype.render = function () {
        var _a;
        var _b = this.props, className = _b.className, fill = _b.fill, inputRef = _b.inputRef, intent = _b.intent, large = _b.large, small = _b.small, growVertically = _b.growVertically, htmlProps = __rest(_b, ["className", "fill", "inputRef", "intent", "large", "small", "growVertically"]);
        var rootClasses = cx(INPUT, intentClass(intent), (_a = {},
            _a[FILL] = fill,
            _a[LARGE] = large,
            _a[SMALL] = small,
            _a), className);
        // add explicit height style while preserving user-supplied styles if they exist
        var _c = htmlProps.style, style = _c === void 0 ? {} : _c;
        if (growVertically && this.state.height != null) {
            // this style object becomes non-extensible when mounted (at least in the enzyme renderer),
            // so we make a new one to add a property
            style = __assign({}, style, { height: this.state.height + "px" });
        }
        return (createElement("textarea", __assign({}, htmlProps, { className: rootClasses, onChange: this.handleChange, ref: this.handleInternalRef, style: style })));
    };
    TextArea.displayName = DISPLAYNAME_PREFIX + ".TextArea";
    TextArea = __decorate([
        polyfill
    ], TextArea);
    return TextArea;
}(AbstractPureComponent2));

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
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var HTMLSelect = /** @class */ (function (_super) {
    __extends(HTMLSelect, _super);
    function HTMLSelect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HTMLSelect.prototype.render = function () {
        var _a;
        var _b = this.props, className = _b.className, disabled = _b.disabled, elementRef = _b.elementRef, fill = _b.fill, iconProps = _b.iconProps, large = _b.large, minimal = _b.minimal, _c = _b.options, options = _c === void 0 ? [] : _c, htmlProps = __rest(_b, ["className", "disabled", "elementRef", "fill", "iconProps", "large", "minimal", "options"]);
        var classes = cx(HTML_SELECT, (_a = {},
            _a[DISABLED] = disabled,
            _a[FILL] = fill,
            _a[LARGE] = large,
            _a[MINIMAL] = minimal,
            _a), className);
        var optionChildren = options.map(function (option) {
            var props = typeof option === "object" ? option : { value: option };
            return createElement("option", __assign({}, props, { key: props.value, children: props.label || props.value }));
        });
        return (createElement("div", { className: classes },
            createElement("select", __assign({ disabled: disabled, ref: elementRef }, htmlProps, { multiple: false }),
                optionChildren,
                htmlProps.children),
            createElement(Icon, __assign({ icon: "double-caret-vertical" }, iconProps))));
    };
    HTMLSelect = __decorate([
        polyfill
    ], HTMLSelect);
    return HTMLSelect;
}(AbstractPureComponent2));

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
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var HTMLTable = /** @class */ (function (_super) {
    __extends(HTMLTable, _super);
    function HTMLTable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HTMLTable.prototype.render = function () {
        var _a;
        var _b = this.props, bordered = _b.bordered, className = _b.className, condensed = _b.condensed, elementRef = _b.elementRef, interactive = _b.interactive, small = _b.small, striped = _b.striped, htmlProps = __rest(_b, ["bordered", "className", "condensed", "elementRef", "interactive", "small", "striped"]);
        var classes$1 = cx(HTML_TABLE, (_a = {},
            _a[HTML_TABLE_BORDERED] = bordered,
            _a[HTML_TABLE_CONDENSED] = condensed,
            _a[HTML_TABLE_STRIPED] = striped,
            _a[INTERACTIVE] = interactive,
            _a[SMALL] = small,
            _a), className);
        // tslint:disable-next-line:blueprint-html-components
        return createElement("table", __assign({}, htmlProps, { ref: elementRef, className: classes$1 }));
    };
    HTMLTable = __decorate([
        polyfill
    ], HTMLTable);
    return HTMLTable;
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
var KeyCodes = {
    8: "backspace",
    9: "tab",
    13: "enter",
    20: "capslock",
    27: "esc",
    32: "space",
    33: "pageup",
    34: "pagedown",
    35: "end",
    36: "home",
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    45: "ins",
    46: "del",
    // number keys
    48: "0",
    49: "1",
    50: "2",
    51: "3",
    52: "4",
    53: "5",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
    // alphabet
    65: "a",
    66: "b",
    67: "c",
    68: "d",
    69: "e",
    70: "f",
    71: "g",
    72: "h",
    73: "i",
    74: "j",
    75: "k",
    76: "l",
    77: "m",
    78: "n",
    79: "o",
    80: "p",
    81: "q",
    82: "r",
    83: "s",
    84: "t",
    85: "u",
    86: "v",
    87: "w",
    88: "x",
    89: "y",
    90: "z",
    // punctuation
    106: "*",
    107: "+",
    109: "-",
    110: ".",
    111: "/",
    186: ";",
    187: "=",
    188: ",",
    189: "-",
    190: ".",
    191: "/",
    192: "`",
    219: "[",
    220: "\\",
    221: "]",
    222: "'",
};
var Modifiers = {
    16: "shift",
    17: "ctrl",
    18: "alt",
    91: "meta",
    93: "meta",
    224: "meta",
};
var ModifierBitMasks = {
    alt: 1,
    ctrl: 2,
    meta: 4,
    shift: 8,
};
var Aliases = {
    cmd: "meta",
    command: "meta",
    escape: "esc",
    minus: "-",
    mod: isMac() ? "meta" : "ctrl",
    option: "alt",
    plus: "+",
    return: "enter",
    win: "meta",
};
// alph sorting is unintuitive here
// tslint:disable object-literal-sort-keys
var ShiftKeys = {
    "~": "`",
    "!": "1",
    "@": "2",
    "#": "3",
    $: "4",
    "%": "5",
    "^": "6",
    "&": "7",
    "*": "8",
    "(": "9",
    ")": "0",
    _: "-",
    "+": "=",
    "{": "[",
    "}": "]",
    "|": "\\",
    ":": ";",
    '"': "'",
    "<": ",",
    ">": ".",
    "?": "/",
};
// tslint:enable object-literal-sort-keys
// Function keys
for (var i = 1; i <= 12; ++i) {
    KeyCodes[111 + i] = "f" + i;
}
// Numpad
for (var i = 0; i <= 9; ++i) {
    KeyCodes[96 + i] = "num" + i.toString();
}
function comboMatches(a, b) {
    return a.modifiers === b.modifiers && a.key === b.key;
}
/**
 * Converts a key combo string into a key combo object. Key combos include
 * zero or more modifier keys, such as `shift` or `alt`, and exactly one
 * action key, such as `A`, `enter`, or `left`.
 *
 * For action keys that require a shift, e.g. `@` or `|`, we inlude the
 * necessary `shift` modifier and automatically convert the action key to the
 * unshifted version. For example, `@` is equivalent to `shift+2`.
 */
var parseKeyCombo = function (combo) {
    var pieces = combo
        .replace(/\s/g, "")
        .toLowerCase()
        .split("+");
    var modifiers = 0;
    var key = null;
    for (var _i = 0, pieces_1 = pieces; _i < pieces_1.length; _i++) {
        var piece = pieces_1[_i];
        if (piece === "") {
            throw new Error("Failed to parse key combo \"" + combo + "\".\n                Valid key combos look like \"cmd + plus\", \"shift+p\", or \"!\"");
        }
        if (Aliases[piece] != null) {
            piece = Aliases[piece];
        }
        if (ModifierBitMasks[piece] != null) {
            modifiers += ModifierBitMasks[piece];
        }
        else if (ShiftKeys[piece] != null) {
            // tslint:disable-next-line no-string-literal
            modifiers += ModifierBitMasks["shift"];
            key = ShiftKeys[piece];
        }
        else {
            key = piece.toLowerCase();
        }
    }
    return { modifiers: modifiers, key: key };
};
/**
 * Converts a keyboard event into a valid combo prop string
 */
var getKeyComboString = function (e) {
    var keys = [];
    // modifiers first
    if (e.ctrlKey) {
        keys.push("ctrl");
    }
    if (e.altKey) {
        keys.push("alt");
    }
    if (e.shiftKey) {
        keys.push("shift");
    }
    if (e.metaKey) {
        keys.push("meta");
    }
    var which = e.which;
    if (Modifiers[which] != null) ;
    else if (KeyCodes[which] != null) {
        keys.push(KeyCodes[which]);
    }
    else {
        keys.push(String.fromCharCode(which).toLowerCase());
    }
    // join keys with plusses
    return keys.join(" + ");
};
/**
 * Determines the key combo object from the given keyboard event. Again, a key
 * combo includes zero or more modifiers (represented by a bitmask) and one
 * action key, which we determine from the `e.which` property of the keyboard
 * event.
 */
var getKeyCombo = function (e) {
    var key = null;
    var which = e.which;
    if (Modifiers[which] != null) ;
    else if (KeyCodes[which] != null) {
        key = KeyCodes[which];
    }
    else {
        key = String.fromCharCode(which).toLowerCase();
    }
    var modifiers = 0;
    // tslint:disable no-string-literal
    if (e.altKey) {
        modifiers += ModifierBitMasks["alt"];
    }
    if (e.ctrlKey) {
        modifiers += ModifierBitMasks["ctrl"];
    }
    if (e.metaKey) {
        modifiers += ModifierBitMasks["meta"];
    }
    if (e.shiftKey) {
        modifiers += ModifierBitMasks["shift"];
    }
    // tslint:enable
    return { modifiers: modifiers, key: key };
};
/**
 * Splits a key combo string into its constituent key values and looks up
 * aliases, such as `return` -> `enter`.
 *
 * Unlike the parseKeyCombo method, this method does NOT convert shifted
 * action keys. So `"@"` will NOT be converted to `["shift", "2"]`).
 */
var normalizeKeyCombo = function (combo, platformOverride) {
    var keys = combo.replace(/\s/g, "").split("+");
    return keys.map(function (key) {
        var keyName = Aliases[key] != null ? Aliases[key] : key;
        return keyName === "meta" ? (isMac(platformOverride) ? "cmd" : "ctrl") : keyName;
    });
};
/* tslint:enable:no-string-literal */
function isMac(platformOverride) {
    var platform = platformOverride != null ? platformOverride : typeof navigator !== "undefined" ? navigator.platform : undefined;
    return platform == null ? false : /Mac|iPod|iPhone|iPad/.test(platform);
}

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
var KeyIcons = {
    alt: "key-option",
    cmd: "key-command",
    ctrl: "key-control",
    delete: "key-delete",
    down: "arrow-down",
    enter: "key-enter",
    left: "arrow-left",
    meta: "key-command",
    right: "arrow-right",
    shift: "key-shift",
    up: "arrow-up",
};
var KeyCombo = /** @class */ (function (_super) {
    __extends(KeyCombo, _super);
    function KeyCombo() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.renderKey = function (key, index) {
            var icon = KeyIcons[key];
            var reactKey = "key-" + index;
            return icon == null ? (createElement("kbd", { className: KEY, key: reactKey }, key)) : (createElement("kbd", { className: cx(KEY, MODIFIER_KEY), key: reactKey },
                createElement(Icon, { icon: icon }),
                " ",
                key));
        };
        _this.renderMinimalKey = function (key, index) {
            var icon = KeyIcons[key];
            return icon == null ? key : createElement(Icon, { icon: icon, key: "key-" + index });
        };
        return _this;
    }
    KeyCombo.prototype.render = function () {
        var _a = this.props, className = _a.className, combo = _a.combo, minimal = _a.minimal;
        var keys = normalizeKeyCombo(combo)
            .map(function (key) { return (key.length === 1 ? key.toUpperCase() : key); })
            .map(minimal ? this.renderMinimalKey : this.renderKey);
        return createElement("span", { className: cx(KEY_COMBO, className) }, keys);
    };
    KeyCombo.displayName = DISPLAYNAME_PREFIX + ".KeyCombo";
    KeyCombo = __decorate([
        polyfill
    ], KeyCombo);
    return KeyCombo;
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
var Hotkey = /** @class */ (function (_super) {
    __extends(Hotkey, _super);
    function Hotkey() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Hotkey.prototype.render = function () {
        var _a = this.props, label = _a.label, className = _a.className, spreadableProps = __rest(_a, ["label", "className"]);
        var rootClasses = cx(HOTKEY, className);
        return (createElement("div", { className: rootClasses },
            createElement("div", { className: HOTKEY_LABEL }, label),
            createElement(KeyCombo, __assign({}, spreadableProps))));
    };
    Hotkey.prototype.validateProps = function (props) {
        if (props.global !== true && props.group == null) {
            throw new Error("non-global <Hotkey>s must define a group");
        }
    };
    Hotkey.displayName = DISPLAYNAME_PREFIX + ".Hotkey";
    Hotkey.defaultProps = {
        allowInInput: false,
        disabled: false,
        global: false,
        preventDefault: false,
        stopPropagation: false,
    };
    Hotkey = __decorate([
        polyfill
    ], Hotkey);
    return Hotkey;
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
/**
 * The delay before showing or hiding the dialog. Should be long enough to
 * allow all registered hotkey listeners to execute first.
 */
var DELAY_IN_MS = 10;
var HotkeysDialog = /** @class */ (function () {
    function HotkeysDialog() {
        var _this = this;
        this.componentProps = {
            globalHotkeysGroup: "Global hotkeys",
        };
        this.hotkeysQueue = [];
        this.isDialogShowing = false;
        this.show = function () {
            _this.isDialogShowing = true;
            _this.render();
        };
        this.hide = function () {
            _this.isDialogShowing = false;
            _this.render();
        };
    }
    HotkeysDialog.prototype.render = function () {
        if (this.container == null) {
            this.container = this.getContainer();
        }
        render(this.renderComponent(), this.container);
    };
    HotkeysDialog.prototype.unmount = function () {
        if (this.container != null) {
            unmountComponentAtNode(this.container);
            this.container.remove();
            delete this.container;
        }
    };
    /**
     * Because hotkeys can be registered globally and locally and because
     * event ordering cannot be guaranteed, we use this debouncing method to
     * allow all hotkey listeners to fire and add their hotkeys to the dialog.
     *
     * 10msec after the last listener adds their hotkeys, we render the dialog
     * and clear the queue.
     */
    HotkeysDialog.prototype.enqueueHotkeysForDisplay = function (hotkeys) {
        this.hotkeysQueue.push(hotkeys);
        // reset timeout for debounce
        window.clearTimeout(this.showTimeoutToken);
        this.showTimeoutToken = window.setTimeout(this.show, DELAY_IN_MS);
    };
    HotkeysDialog.prototype.hideAfterDelay = function () {
        window.clearTimeout(this.hideTimeoutToken);
        this.hideTimeoutToken = window.setTimeout(this.hide, DELAY_IN_MS);
    };
    HotkeysDialog.prototype.isShowing = function () {
        return this.isDialogShowing;
    };
    HotkeysDialog.prototype.getContainer = function () {
        if (this.container == null) {
            this.container = document.createElement("div");
            this.container.classList.add(PORTAL);
            document.body.appendChild(this.container);
        }
        return this.container;
    };
    HotkeysDialog.prototype.renderComponent = function () {
        return (createElement(Dialog, __assign({}, this.componentProps, { className: cx(HOTKEY_DIALOG, this.componentProps.className), isOpen: this.isDialogShowing, onClose: this.hide }),
            createElement("div", { className: DIALOG_BODY }, this.renderHotkeys())));
    };
    HotkeysDialog.prototype.renderHotkeys = function () {
        var _this = this;
        var hotkeys = this.emptyHotkeyQueue();
        var elements = hotkeys.map(function (hotkey, index) {
            var group = hotkey.global === true && hotkey.group == null ? _this.componentProps.globalHotkeysGroup : hotkey.group;
            return createElement(Hotkey, __assign({ key: index }, hotkey, { group: group }));
        });
        return createElement(Hotkeys, null, elements);
    };
    HotkeysDialog.prototype.emptyHotkeyQueue = function () {
        // flatten then empty the hotkeys queue
        var hotkeys = this.hotkeysQueue.reduce(function (arr, queued) { return arr.concat(queued); }, []);
        this.hotkeysQueue.length = 0;
        return hotkeys;
    };
    return HotkeysDialog;
}());
// singleton instance
var HOTKEYS_DIALOG = new HotkeysDialog();
function isHotkeysDialogShowing() {
    return HOTKEYS_DIALOG.isShowing();
}
function setHotkeysDialogProps(props) {
    for (var key in props) {
        if (props.hasOwnProperty(key)) {
            HOTKEYS_DIALOG.componentProps[key] = props[key];
        }
    }
}
function showHotkeysDialog(hotkeys) {
    HOTKEYS_DIALOG.enqueueHotkeysForDisplay(hotkeys);
}
function hideHotkeysDialog() {
    HOTKEYS_DIALOG.hide();
}
/**
 * Use this function instead of `hideHotkeysDialog` if you need to ensure that all hotkey listeners
 * have time to execute with the dialog in a consistent open state. This can avoid flickering the
 * dialog between open and closed states as successive listeners fire.
 */
function hideHotkeysDialogAfterDelay() {
    HOTKEYS_DIALOG.hideAfterDelay();
}

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
var SHOW_DIALOG_KEY = "?";
var HotkeyScope;
(function (HotkeyScope) {
    HotkeyScope["LOCAL"] = "local";
    HotkeyScope["GLOBAL"] = "global";
})(HotkeyScope || (HotkeyScope = {}));
var HotkeysEvents = /** @class */ (function () {
    function HotkeysEvents(scope) {
        var _this = this;
        this.scope = scope;
        this.actions = [];
        this.handleKeyDown = function (e) {
            var combo = getKeyCombo(e);
            var isTextInput = _this.isTextInput(e);
            if (!isTextInput && comboMatches(parseKeyCombo(SHOW_DIALOG_KEY), combo)) {
                if (isHotkeysDialogShowing()) {
                    hideHotkeysDialogAfterDelay();
                }
                else {
                    showHotkeysDialog(_this.actions.map(function (action) { return action.props; }));
                }
                return;
            }
            else if (isHotkeysDialogShowing()) {
                return;
            }
            _this.invokeNamedCallbackIfComboRecognized(combo, "onKeyDown", e);
        };
        this.handleKeyUp = function (e) {
            if (isHotkeysDialogShowing()) {
                return;
            }
            _this.invokeNamedCallbackIfComboRecognized(getKeyCombo(e), "onKeyUp", e);
        };
    }
    HotkeysEvents.prototype.count = function () {
        return this.actions.length;
    };
    HotkeysEvents.prototype.clear = function () {
        this.actions = [];
    };
    HotkeysEvents.prototype.setHotkeys = function (props) {
        var _this = this;
        var actions = [];
        Children.forEach(props.children, function (child) {
            if (isElementOfType(child, Hotkey) && _this.isScope(child.props)) {
                actions.push({
                    combo: parseKeyCombo(child.props.combo),
                    props: child.props,
                });
            }
        });
        this.actions = actions;
    };
    HotkeysEvents.prototype.invokeNamedCallbackIfComboRecognized = function (combo, callbackName, e) {
        var isTextInput = this.isTextInput(e);
        for (var _i = 0, _a = this.actions; _i < _a.length; _i++) {
            var action = _a[_i];
            var shouldIgnore = (isTextInput && !action.props.allowInInput) || action.props.disabled;
            if (!shouldIgnore && comboMatches(action.combo, combo)) {
                if (action.props.preventDefault) {
                    e.preventDefault();
                }
                if (action.props.stopPropagation) {
                    // set a flag just for unit testing. not meant to be referenced in feature work.
                    e.isPropagationStopped = true;
                    e.stopPropagation();
                }
                safeInvoke(action.props[callbackName], e);
            }
        }
    };
    HotkeysEvents.prototype.isScope = function (props) {
        return (props.global ? HotkeyScope.GLOBAL : HotkeyScope.LOCAL) === this.scope;
    };
    HotkeysEvents.prototype.isTextInput = function (e) {
        var elem = e.target;
        // we check these cases for unit testing, but this should not happen
        // during normal operation
        if (elem == null || elem.closest == null) {
            return false;
        }
        var editable = elem.closest("input, textarea, [contenteditable=true]");
        if (editable == null) {
            return false;
        }
        // don't let checkboxes, switches, and radio buttons prevent hotkey behavior
        if (editable.tagName.toLowerCase() === "input") {
            var inputType = editable.type;
            if (inputType === "checkbox" || inputType === "radio") {
                return false;
            }
        }
        // don't let read-only fields prevent hotkey behavior
        if (editable.readOnly) {
            return false;
        }
        return true;
    };
    return HotkeysEvents;
}());

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
function HotkeysTarget(WrappedComponent) {
    var _a;
    if (!isFunction(WrappedComponent.prototype.renderHotkeys)) {
        console.warn(HOTKEYS_WARN_DECORATOR_NO_METHOD);
    }
    return _a = /** @class */ (function (_super) {
            __extends(HotkeysTargetClass, _super);
            function HotkeysTargetClass() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                /** @internal */
                _this.globalHotkeysEvents = new HotkeysEvents(HotkeyScope.GLOBAL);
                /** @internal */
                _this.localHotkeysEvents = new HotkeysEvents(HotkeyScope.LOCAL);
                return _this;
            }
            HotkeysTargetClass.prototype.componentDidMount = function () {
                if (_super.prototype.componentDidMount != null) {
                    _super.prototype.componentDidMount.call(this);
                }
                // attach global key event listeners
                document.addEventListener("keydown", this.globalHotkeysEvents.handleKeyDown);
                document.addEventListener("keyup", this.globalHotkeysEvents.handleKeyUp);
            };
            HotkeysTargetClass.prototype.componentWillUnmount = function () {
                if (_super.prototype.componentWillUnmount != null) {
                    _super.prototype.componentWillUnmount.call(this);
                }
                document.removeEventListener("keydown", this.globalHotkeysEvents.handleKeyDown);
                document.removeEventListener("keyup", this.globalHotkeysEvents.handleKeyUp);
                this.globalHotkeysEvents.clear();
                this.localHotkeysEvents.clear();
            };
            HotkeysTargetClass.prototype.render = function () {
                var _this = this;
                var element = _super.prototype.render.call(this);
                if (element == null) {
                    // always return `element` in case caller is distinguishing between `null` and `undefined`
                    return element;
                }
                if (!isValidElement(element)) {
                    console.warn(HOTKEYS_WARN_DECORATOR_NEEDS_REACT_ELEMENT);
                    return element;
                }
                if (isFunction(this.renderHotkeys)) {
                    var hotkeys = this.renderHotkeys();
                    if (this.localHotkeysEvents) {
                        this.localHotkeysEvents.setHotkeys(hotkeys.props);
                    }
                    if (this.globalHotkeysEvents) {
                        this.globalHotkeysEvents.setHotkeys(hotkeys.props);
                    }
                    if (this.localHotkeysEvents.count() > 0) {
                        var tabIndex = hotkeys.props.tabIndex === undefined ? 0 : hotkeys.props.tabIndex;
                        var _a = element.props, existingKeyDown_1 = _a.onKeyDown, existingKeyUp_1 = _a.onKeyUp;
                        var handleKeyDownWrapper = function (e) {
                            _this.localHotkeysEvents.handleKeyDown(e.nativeEvent);
                            safeInvoke(existingKeyDown_1, e);
                        };
                        var handleKeyUpWrapper = function (e) {
                            _this.localHotkeysEvents.handleKeyUp(e.nativeEvent);
                            safeInvoke(existingKeyUp_1, e);
                        };
                        return cloneElement(element, {
                            onKeyDown: handleKeyDownWrapper,
                            onKeyUp: handleKeyUpWrapper,
                            tabIndex: tabIndex,
                        });
                    }
                }
                return element;
            };
            return HotkeysTargetClass;
        }(WrappedComponent)),
        _a.displayName = "HotkeysTarget(" + getDisplayName(WrappedComponent) + ")",
        _a;
}

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
var Hotkeys = /** @class */ (function (_super) {
    __extends(Hotkeys, _super);
    function Hotkeys() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Hotkeys.prototype.render = function () {
        var hotkeys = Children.map(this.props.children, function (child) { return child.props; });
        // sort by group label alphabetically, prioritize globals
        hotkeys.sort(function (a, b) {
            if (a.global === b.global) {
                return a.group.localeCompare(b.group);
            }
            return a.global ? -1 : 1;
        });
        var lastGroup = null;
        var elems = [];
        for (var _i = 0, hotkeys_1 = hotkeys; _i < hotkeys_1.length; _i++) {
            var hotkey = hotkeys_1[_i];
            var groupLabel = hotkey.group;
            if (groupLabel !== lastGroup) {
                elems.push(createElement(H4, { key: "group-" + elems.length }, groupLabel));
                lastGroup = groupLabel;
            }
            elems.push(createElement(Hotkey, __assign({ key: elems.length }, hotkey)));
        }
        var rootClasses = cx(HOTKEY_COLUMN, this.props.className);
        return createElement("div", { className: rootClasses }, elems);
    };
    Hotkeys.prototype.validateProps = function (props) {
        Children.forEach(props.children, function (child) {
            if (!isElementOfType(child, Hotkey)) {
                throw new Error(HOTKEYS_HOTKEY_CHILDREN);
            }
        });
    };
    Hotkeys.displayName = DISPLAYNAME_PREFIX + ".Hotkeys";
    Hotkeys.defaultProps = {
        tabIndex: 0,
    };
    Hotkeys = __decorate([
        polyfill
    ], Hotkeys);
    return Hotkeys;
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
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var NavbarDivider = /** @class */ (function (_super) {
    __extends(NavbarDivider, _super);
    function NavbarDivider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NavbarDivider.prototype.render = function () {
        var _a = this.props, className = _a.className, htmlProps = __rest(_a, ["className"]);
        return createElement("div", __assign({ className: cx(NAVBAR_DIVIDER, className) }, htmlProps));
    };
    NavbarDivider.displayName = DISPLAYNAME_PREFIX + ".NavbarDivider";
    NavbarDivider = __decorate([
        polyfill
    ], NavbarDivider);
    return NavbarDivider;
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
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var NavbarGroup = /** @class */ (function (_super) {
    __extends(NavbarGroup, _super);
    function NavbarGroup() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NavbarGroup.prototype.render = function () {
        var _a = this.props, align = _a.align, children = _a.children, className = _a.className, htmlProps = __rest(_a, ["align", "children", "className"]);
        var classes$1 = cx(NAVBAR_GROUP, alignmentClass(align), className);
        return (createElement("div", __assign({ className: classes$1 }, htmlProps), children));
    };
    NavbarGroup.displayName = DISPLAYNAME_PREFIX + ".NavbarGroup";
    NavbarGroup.defaultProps = {
        align: Alignment.LEFT,
    };
    NavbarGroup = __decorate([
        polyfill
    ], NavbarGroup);
    return NavbarGroup;
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
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var NavbarHeading = /** @class */ (function (_super) {
    __extends(NavbarHeading, _super);
    function NavbarHeading() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NavbarHeading.prototype.render = function () {
        var _a = this.props, children = _a.children, className = _a.className, htmlProps = __rest(_a, ["children", "className"]);
        return (createElement("div", __assign({ className: cx(NAVBAR_HEADING, className) }, htmlProps), children));
    };
    NavbarHeading.displayName = DISPLAYNAME_PREFIX + ".NavbarHeading";
    NavbarHeading = __decorate([
        polyfill
    ], NavbarHeading);
    return NavbarHeading;
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
// this component is simple enough that tests would be purely tautological.
/* istanbul ignore next */
var Navbar = /** @class */ (function (_super) {
    __extends(Navbar, _super);
    function Navbar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Navbar.prototype.render = function () {
        var _a;
        var _b = this.props, children = _b.children, className = _b.className, fixedToTop = _b.fixedToTop, htmlProps = __rest(_b, ["children", "className", "fixedToTop"]);
        var classes$1 = cx(NAVBAR, (_a = {}, _a[FIXED_TOP] = fixedToTop, _a), className);
        return (createElement("div", __assign({ className: classes$1 }, htmlProps), children));
    };
    Navbar.displayName = DISPLAYNAME_PREFIX + ".Navbar";
    Navbar.Divider = NavbarDivider;
    Navbar.Group = NavbarGroup;
    Navbar.Heading = NavbarHeading;
    Navbar = __decorate([
        polyfill
    ], Navbar);
    return Navbar;
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
var NonIdealState = /** @class */ (function (_super) {
    __extends(NonIdealState, _super);
    function NonIdealState() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NonIdealState.prototype.render = function () {
        var _a = this.props, action = _a.action, children = _a.children, className = _a.className, description = _a.description, title = _a.title;
        return (createElement("div", { className: cx(NON_IDEAL_STATE, className) },
            this.maybeRenderVisual(),
            title && createElement(H4, null, title),
            description && ensureElement(description, "div"),
            action,
            children));
    };
    NonIdealState.prototype.maybeRenderVisual = function () {
        var icon = this.props.icon;
        if (icon == null) {
            return null;
        }
        else {
            return (createElement("div", { className: NON_IDEAL_STATE_VISUAL },
                createElement(Icon, { icon: icon, iconSize: Icon.SIZE_LARGE * 3 })));
        }
    };
    NonIdealState.displayName = DISPLAYNAME_PREFIX + ".NonIdealState";
    NonIdealState = __decorate([
        polyfill
    ], NonIdealState);
    return NonIdealState;
}(AbstractPureComponent2));

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
var PanelView = /** @class */ (function (_super) {
    __extends(PanelView, _super);
    function PanelView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleClose = function () { return _this.props.onClose(_this.props.panel); };
        return _this;
    }
    PanelView.prototype.render = function () {
        var _a = this.props, panel = _a.panel, onOpen = _a.onOpen;
        // two <span> tags in header ensure title is centered as long as
        // possible, due to `flex: 1` magic.
        return (createElement("div", { className: PANEL_STACK_VIEW },
            this.maybeRenderHeader(),
            createElement(panel.component, __assign({ openPanel: onOpen, closePanel: this.handleClose }, panel.props))));
    };
    PanelView.prototype.maybeRenderHeader = function () {
        if (!this.props.showHeader) {
            return null;
        }
        return (createElement("div", { className: PANEL_STACK_HEADER },
            createElement("span", null, this.maybeRenderBack()),
            createElement(Text, { className: HEADING, ellipsize: true }, this.props.panel.title),
            createElement("span", null)));
    };
    PanelView.prototype.maybeRenderBack = function () {
        if (this.props.previousPanel === undefined) {
            return null;
        }
        return (createElement(Button, { className: PANEL_STACK_HEADER_BACK, icon: "chevron-left", minimal: true, onClick: this.handleClose, small: true, text: this.props.previousPanel.title }));
    };
    PanelView = __decorate([
        polyfill
    ], PanelView);
    return PanelView;
}(AbstractPureComponent2));

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
var PanelStack = /** @class */ (function (_super) {
    __extends(PanelStack, _super);
    function PanelStack() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            direction: "push",
            stack: _this.props.stack != null ? _this.props.stack.slice().reverse() : [_this.props.initialPanel],
        };
        _this.handlePanelClose = function (panel) {
            var stack = _this.state.stack;
            // only remove this panel if it is at the top and not the only one.
            if (stack[0] !== panel || stack.length <= 1) {
                return;
            }
            safeInvoke(_this.props.onClose, panel);
            if (_this.props.stack == null) {
                _this.setState(function (state) { return ({
                    direction: "pop",
                    stack: state.stack.filter(function (p) { return p !== panel; }),
                }); });
            }
        };
        _this.handlePanelOpen = function (panel) {
            safeInvoke(_this.props.onOpen, panel);
            if (_this.props.stack == null) {
                _this.setState(function (state) { return ({
                    direction: "push",
                    stack: [panel].concat(state.stack),
                }); });
            }
        };
        return _this;
    }
    PanelStack.prototype.componentDidUpdate = function (prevProps, _prevState, _snapshot) {
        _super.prototype.componentDidUpdate.call(this, prevProps, _prevState, _snapshot);
        // Always update local stack if stack prop changes
        if (this.props.stack !== prevProps.stack && prevProps.stack != null) {
            this.setState({ stack: this.props.stack.slice().reverse() });
        }
        // Only update animation direction if stack length changes
        var stackLength = this.props.stack != null ? this.props.stack.length : 0;
        var prevStackLength = prevProps.stack != null ? prevProps.stack.length : 0;
        if (stackLength !== prevStackLength && prevProps.stack != null) {
            this.setState({ direction: prevProps.stack.length - this.props.stack.length < 0 ? "push" : "pop" });
        }
    };
    PanelStack.prototype.render = function () {
        var classes$1 = cx(PANEL_STACK, PANEL_STACK + "-" + this.state.direction, this.props.className);
        return (createElement(reactTransitionGroup_2, { className: classes$1, component: "div" }, this.renderCurrentPanel()));
    };
    PanelStack.prototype.validateProps = function (props) {
        if ((props.initialPanel == null && props.stack == null) ||
            (props.initialPanel != null && props.stack != null)) {
            throw new Error(PANEL_STACK_INITIAL_PANEL_STACK_MUTEX);
        }
        if (props.stack != null && props.stack.length === 0) {
            throw new Error(PANEL_STACK_REQUIRES_PANEL);
        }
    };
    PanelStack.prototype.renderCurrentPanel = function () {
        var _a = this.props.showPanelHeader, showPanelHeader = _a === void 0 ? true : _a;
        var stack = this.state.stack;
        if (stack.length === 0) {
            return null;
        }
        var activePanel = stack[0], previousPanel = stack[1];
        return (createElement(reactTransitionGroup_4, { classNames: PANEL_STACK, key: stack.length, timeout: 400 },
            createElement(PanelView, { onClose: this.handlePanelClose, onOpen: this.handlePanelOpen, panel: activePanel, previousPanel: previousPanel, showHeader: showPanelHeader })));
    };
    PanelStack = __decorate([
        polyfill
    ], PanelStack);
    return PanelStack;
}(AbstractPureComponent2));

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
/** `Position` with `"auto"` values, used by `Popover` and `Tooltip`. */
var PopoverPosition = __assign({}, Position, { AUTO: "auto", AUTO_END: "auto-end", AUTO_START: "auto-start" });

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
var ProgressBar = /** @class */ (function (_super) {
    __extends(ProgressBar, _super);
    function ProgressBar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProgressBar.prototype.render = function () {
        var _a;
        var _b = this.props, _c = _b.animate, animate = _c === void 0 ? true : _c, className = _b.className, intent = _b.intent, _d = _b.stripes, stripes = _d === void 0 ? true : _d, value = _b.value;
        var classes$1 = cx(PROGRESS_BAR, intentClass(intent), (_a = {}, _a[PROGRESS_NO_ANIMATION] = !animate, _a[PROGRESS_NO_STRIPES] = !stripes, _a), className);
        // don't set width if value is null (rely on default CSS value)
        var width = value == null ? null : 100 * clamp(value, 0, 1) + "%";
        return (createElement("div", { className: classes$1 },
            createElement("div", { className: PROGRESS_METER, style: { width: width } })));
    };
    ProgressBar.displayName = DISPLAYNAME_PREFIX + ".ProgressBar";
    ProgressBar = __decorate([
        polyfill
    ], ProgressBar);
    return ProgressBar;
}(AbstractPureComponent2));

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
var HandleType = {
    /** A full handle appears as a small square. */
    FULL: "full",
    /** A start handle appears as the left or top half of a square. */
    START: "start",
    /** An end handle appears as the right or bottom half of a square. */
    END: "end",
};
var HandleInteractionKind = {
    /** Locked handles prevent other handles from being dragged past then. */
    LOCK: "lock",
    /** Push handles move overlapping handles with them as they are dragged. */
    PUSH: "push",
    /**
     * Handles marked "none" are not interactive and do not appear in the UI.
     * They serve only to break the track into subsections that can be colored separately.
     */
    NONE: "none",
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
/** Helper function for formatting ratios as CSS percentage values. */
function formatPercentage(ratio) {
    return (ratio * 100).toFixed(2) + "%";
}
/**
 * Mutates the values array by filling all the values between start and end index (inclusive) with the fill value.
 */
function fillValues(values, startIndex, endIndex, fillValue) {
    var inc = startIndex < endIndex ? 1 : -1;
    for (var index = startIndex; index !== endIndex + inc; index += inc) {
        values[index] = fillValue;
    }
}
/**
 * Returns the minimum element of an array as determined by comparing the results of calling the arg function on each
 * element of the array. The function will only be called once per element.
 */
function argMin(values, argFn) {
    if (values.length === 0) {
        return undefined;
    }
    var minValue = values[0];
    var minArg = argFn(minValue);
    for (var index = 1; index < values.length; index++) {
        var value = values[index];
        var arg = argFn(value);
        if (arg < minArg) {
            minValue = value;
            minArg = arg;
        }
    }
    return minValue;
}

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
// props that require number values, for validation
var NUMBER_PROPS = ["max", "min", "stepSize", "tickSize", "value"];
/** Internal component for a Handle with click/drag/keyboard logic to determine a new value. */
var Handle = /** @class */ (function (_super) {
    __extends(Handle, _super);
    function Handle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isMoving: false,
        };
        _this.refHandlers = {
            handle: function (el) { return (_this.handleElement = el); },
        };
        _this.beginHandleMovement = function (event) {
            document.addEventListener("mousemove", _this.handleHandleMovement);
            document.addEventListener("mouseup", _this.endHandleMovement);
            _this.setState({ isMoving: true });
            _this.changeValue(_this.clientToValue(_this.mouseEventClientOffset(event)));
        };
        _this.beginHandleTouchMovement = function (event) {
            document.addEventListener("touchmove", _this.handleHandleTouchMovement);
            document.addEventListener("touchend", _this.endHandleTouchMovement);
            document.addEventListener("touchcancel", _this.endHandleTouchMovement);
            _this.setState({ isMoving: true });
            _this.changeValue(_this.clientToValue(_this.touchEventClientOffset(event)));
        };
        _this.endHandleMovement = function (event) {
            _this.handleMoveEndedAt(_this.mouseEventClientOffset(event));
        };
        _this.endHandleTouchMovement = function (event) {
            _this.handleMoveEndedAt(_this.touchEventClientOffset(event));
        };
        _this.handleMoveEndedAt = function (clientPixel) {
            _this.removeDocumentEventListeners();
            _this.setState({ isMoving: false });
            // always invoke onRelease; changeValue may call onChange if value is different
            var onRelease = _this.props.onRelease;
            var finalValue = _this.changeValue(_this.clientToValue(clientPixel));
            safeInvoke(onRelease, finalValue);
        };
        _this.handleHandleMovement = function (event) {
            _this.handleMovedTo(_this.mouseEventClientOffset(event));
        };
        _this.handleHandleTouchMovement = function (event) {
            _this.handleMovedTo(_this.touchEventClientOffset(event));
        };
        _this.handleMovedTo = function (clientPixel) {
            if (_this.state.isMoving && !_this.props.disabled) {
                _this.changeValue(_this.clientToValue(clientPixel));
            }
        };
        _this.handleKeyDown = function (event) {
            var _a = _this.props, stepSize = _a.stepSize, value = _a.value;
            var which = event.which;
            if (which === ARROW_DOWN || which === ARROW_LEFT) {
                _this.changeValue(value - stepSize);
                // this key event has been handled! prevent browser scroll on up/down
                event.preventDefault();
            }
            else if (which === ARROW_UP || which === ARROW_RIGHT) {
                _this.changeValue(value + stepSize);
                event.preventDefault();
            }
        };
        _this.handleKeyUp = function (event) {
            if ([ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT].indexOf(event.which) >= 0) {
                safeInvoke(_this.props.onRelease, _this.props.value);
            }
        };
        return _this;
    }
    Handle.prototype.componentDidMount = function () {
        // The first time this component renders, it has no ref to the handle and thus incorrectly centers the handle.
        // Therefore, on the first mount, force a re-render to center the handle with the ref'd component.
        this.forceUpdate();
    };
    Handle.prototype.render = function () {
        var _a;
        var _b = this.props, className = _b.className, disabled = _b.disabled, label = _b.label, min = _b.min, tickSizeRatio = _b.tickSizeRatio, value = _b.value, vertical = _b.vertical;
        var isMoving = this.state.isMoving;
        // The handle midpoint of RangeSlider is actually shifted by a margin to
        // be on the edge of the visible handle element. Because the midpoint
        // calculation does not take this margin into account, we instead
        // measure the long side (which is equal to the short side plus the
        // margin).
        var handleMidpoint = this.getHandleMidpointAndOffset(this.handleElement, true).handleMidpoint;
        var offsetRatio = (value - min) * tickSizeRatio;
        var offsetCalc = "calc(" + formatPercentage(offsetRatio) + " - " + handleMidpoint + "px)";
        var style = vertical ? { bottom: offsetCalc } : { left: offsetCalc };
        return (createElement("span", { className: cx(SLIDER_HANDLE, (_a = {}, _a[ACTIVE] = isMoving, _a), className), onKeyDown: disabled ? null : this.handleKeyDown, onKeyUp: disabled ? null : this.handleKeyUp, onMouseDown: disabled ? null : this.beginHandleMovement, onTouchStart: disabled ? null : this.beginHandleTouchMovement, ref: this.refHandlers.handle, style: style, tabIndex: 0 }, label == null ? null : createElement("span", { className: SLIDER_LABEL }, label)));
    };
    Handle.prototype.componentWillUnmount = function () {
        this.removeDocumentEventListeners();
    };
    /** Convert client pixel to value between min and max. */
    Handle.prototype.clientToValue = function (clientPixel) {
        var _a = this.props, stepSize = _a.stepSize, tickSize = _a.tickSize, value = _a.value, vertical = _a.vertical;
        if (this.handleElement == null) {
            return value;
        }
        // #1769: this logic doesn't work perfectly when the tick size is
        // smaller than the handle size; it may be off by a tick or two.
        var clientPixelNormalized = vertical ? window.innerHeight - clientPixel : clientPixel;
        var handleCenterPixel = this.getHandleElementCenterPixel(this.handleElement);
        var pixelDelta = clientPixelNormalized - handleCenterPixel;
        if (isNaN(pixelDelta)) {
            return value;
        }
        // convert pixels to range value in increments of `stepSize`
        return value + Math.round(pixelDelta / (tickSize * stepSize)) * stepSize;
    };
    Handle.prototype.mouseEventClientOffset = function (event) {
        return this.props.vertical ? event.clientY : event.clientX;
    };
    Handle.prototype.touchEventClientOffset = function (event) {
        var touch = event.changedTouches[0];
        return this.props.vertical ? touch.clientY : touch.clientX;
    };
    Handle.prototype.validateProps = function (props) {
        for (var _i = 0, NUMBER_PROPS_1 = NUMBER_PROPS; _i < NUMBER_PROPS_1.length; _i++) {
            var prop = NUMBER_PROPS_1[_i];
            if (typeof props[prop] !== "number") {
                throw new Error("[Blueprint] <Handle> requires number value for " + prop + " prop");
            }
        }
    };
    /** Clamp value and invoke callback if it differs from current value */
    Handle.prototype.changeValue = function (newValue, callback) {
        if (callback === void 0) { callback = this.props.onChange; }
        newValue = this.clamp(newValue);
        if (!isNaN(newValue) && this.props.value !== newValue) {
            safeInvoke(callback, newValue);
        }
        return newValue;
    };
    /** Clamp value between min and max props */
    Handle.prototype.clamp = function (value) {
        return clamp(value, this.props.min, this.props.max);
    };
    Handle.prototype.getHandleElementCenterPixel = function (handleElement) {
        var _a = this.getHandleMidpointAndOffset(handleElement), handleMidpoint = _a.handleMidpoint, handleOffset = _a.handleOffset;
        return handleOffset + handleMidpoint;
    };
    Handle.prototype.getHandleMidpointAndOffset = function (handleElement, useOppositeDimension) {
        if (useOppositeDimension === void 0) { useOppositeDimension = false; }
        if (handleElement == null) {
            return { handleMidpoint: 0, handleOffset: 0 };
        }
        var vertical = this.props.vertical;
        // getBoundingClientRect().height includes border size; clientHeight does not.
        var handleRect = handleElement.getBoundingClientRect();
        var sizeKey = vertical
            ? useOppositeDimension
                ? "width"
                : "height"
            : useOppositeDimension
                ? "height"
                : "width";
        // "bottom" value seems to be consistently incorrect, so explicitly
        // calculate it using the window offset instead.
        var handleOffset = vertical ? window.innerHeight - (handleRect.top + handleRect[sizeKey]) : handleRect.left;
        return { handleMidpoint: handleRect[sizeKey] / 2, handleOffset: handleOffset };
    };
    Handle.prototype.removeDocumentEventListeners = function () {
        document.removeEventListener("mousemove", this.handleHandleMovement);
        document.removeEventListener("mouseup", this.endHandleMovement);
        document.removeEventListener("touchmove", this.handleHandleTouchMovement);
        document.removeEventListener("touchend", this.endHandleTouchMovement);
        document.removeEventListener("touchcancel", this.endHandleTouchMovement);
    };
    Handle.displayName = DISPLAYNAME_PREFIX + ".SliderHandle";
    Handle = __decorate([
        polyfill
    ], Handle);
    return Handle;
}(AbstractPureComponent2));

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
/**
 * SFC used to pass slider handle props to a `MultiSlider`.
 * This element is not rendered directly.
 */
var MultiSliderHandle = function () { return null; };
MultiSliderHandle.displayName = DISPLAYNAME_PREFIX + ".MultiSliderHandle";
var MultiSlider = /** @class */ (function (_super) {
    __extends(MultiSlider, _super);
    function MultiSlider() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            labelPrecision: getLabelPrecision(_this.props),
            tickSize: 0,
            tickSizeRatio: 0,
        };
        _this.handleElements = [];
        _this.addHandleRef = function (ref) {
            if (ref != null) {
                _this.handleElements.push(ref);
            }
        };
        _this.maybeHandleTrackClick = function (event) {
            if (_this.canHandleTrackEvent(event)) {
                var foundHandle = _this.nearestHandleForValue(_this.handleElements, function (handle) {
                    return handle.mouseEventClientOffset(event);
                });
                if (foundHandle) {
                    foundHandle.beginHandleMovement(event);
                }
            }
        };
        _this.maybeHandleTrackTouch = function (event) {
            if (_this.canHandleTrackEvent(event)) {
                var foundHandle = _this.nearestHandleForValue(_this.handleElements, function (handle) {
                    return handle.touchEventClientOffset(event);
                });
                if (foundHandle) {
                    foundHandle.beginHandleTouchMovement(event);
                }
            }
        };
        _this.canHandleTrackEvent = function (event) {
            var target = event.target;
            // ensure event does not come from inside the handle
            return !_this.props.disabled && target.closest("." + SLIDER_HANDLE) == null;
        };
        _this.getHandlerForIndex = function (index, callback) {
            return function (newValue) {
                safeInvoke(callback, _this.getNewHandleValues(newValue, index));
            };
        };
        _this.handleChange = function (newValues) {
            var handleProps = getSortedInteractiveHandleProps(_this.props);
            var oldValues = handleProps.map(function (handle) { return handle.value; });
            if (!arraysEqual(newValues, oldValues)) {
                safeInvoke(_this.props.onChange, newValues);
                handleProps.forEach(function (handle, index) {
                    if (oldValues[index] !== newValues[index]) {
                        safeInvoke(handle.onChange, newValues[index]);
                    }
                });
            }
        };
        _this.handleRelease = function (newValues) {
            var handleProps = getSortedInteractiveHandleProps(_this.props);
            safeInvoke(_this.props.onRelease, newValues);
            handleProps.forEach(function (handle, index) {
                safeInvoke(handle.onRelease, newValues[index]);
            });
        };
        return _this;
    }
    MultiSlider_1 = MultiSlider;
    MultiSlider.getDerivedStateFromProps = function (props) {
        return { labelPrecision: MultiSlider_1.getLabelPrecision(props) };
    };
    MultiSlider.getLabelPrecision = function (_a) {
        var labelPrecision = _a.labelPrecision, stepSize = _a.stepSize;
        // infer default label precision from stepSize because that's how much the handle moves.
        return labelPrecision == null ? countDecimalPlaces(stepSize) : labelPrecision;
    };
    MultiSlider.prototype.getSnapshotBeforeUpdate = function (prevProps) {
        var prevHandleProps = getSortedInteractiveHandleProps(prevProps);
        var newHandleProps = getSortedInteractiveHandleProps(this.props);
        if (newHandleProps.length !== prevHandleProps.length) {
            // clear refs
            this.handleElements = [];
        }
        return null;
    };
    MultiSlider.prototype.render = function () {
        var _a;
        var _this = this;
        var classes$1 = cx(SLIDER, (_a = {},
            _a[DISABLED] = this.props.disabled,
            _a[SLIDER + "-unlabeled"] = this.props.labelRenderer === false,
            _a[VERTICAL] = this.props.vertical,
            _a), this.props.className);
        return (createElement("div", { className: classes$1, onMouseDown: this.maybeHandleTrackClick, onTouchStart: this.maybeHandleTrackTouch },
            createElement("div", { className: SLIDER_TRACK, ref: function (ref) { return (_this.trackElement = ref); } }, this.renderTracks()),
            createElement("div", { className: SLIDER_AXIS }, this.renderLabels()),
            this.renderHandles()));
    };
    MultiSlider.prototype.componentDidMount = function () {
        this.updateTickSize();
    };
    MultiSlider.prototype.componentDidUpdate = function (prevProps, prevState, ss) {
        _super.prototype.componentDidUpdate.call(this, prevProps, prevState, ss);
        this.updateTickSize();
    };
    MultiSlider.prototype.validateProps = function (props) {
        if (props.stepSize <= 0) {
            throw new Error(SLIDER_ZERO_STEP);
        }
        if (props.labelStepSize <= 0) {
            throw new Error(SLIDER_ZERO_LABEL_STEP);
        }
        var anyInvalidChildren = false;
        Children.forEach(props.children, function (child) {
            // allow boolean coercion to omit nulls and false values
            if (child && !isElementOfType(child, MultiSlider_1.Handle)) {
                anyInvalidChildren = true;
            }
        });
        if (anyInvalidChildren) {
            throw new Error(MULTISLIDER_INVALID_CHILD);
        }
    };
    MultiSlider.prototype.formatLabel = function (value) {
        var labelRenderer = this.props.labelRenderer;
        if (labelRenderer === false) {
            return null;
        }
        else if (isFunction(labelRenderer)) {
            return labelRenderer(value);
        }
        else {
            return value.toFixed(this.state.labelPrecision);
        }
    };
    MultiSlider.prototype.renderLabels = function () {
        if (this.props.labelRenderer === false) {
            return null;
        }
        var _a = this.props, labelStepSize = _a.labelStepSize, max = _a.max, min = _a.min;
        var labels = [];
        var stepSizeRatio = this.state.tickSizeRatio * labelStepSize;
        // step size lends itself naturally to a `for` loop
        // tslint:disable-next-line:one-variable-per-declaration ban-comma-operator
        for (var i = min, offsetRatio = 0; i < max || approxEqual(i, max); i += labelStepSize, offsetRatio += stepSizeRatio) {
            var offsetPercentage = formatPercentage(offsetRatio);
            var style = this.props.vertical ? { bottom: offsetPercentage } : { left: offsetPercentage };
            labels.push(createElement("div", { className: SLIDER_LABEL, key: i, style: style }, this.formatLabel(i)));
        }
        return labels;
    };
    MultiSlider.prototype.renderTracks = function () {
        var trackStops = getSortedHandleProps(this.props);
        trackStops.push({ value: this.props.max });
        // render from current to previous, then increment previous
        var previous = { value: this.props.min };
        var handles = [];
        for (var index = 0; index < trackStops.length; index++) {
            var current = trackStops[index];
            handles.push(this.renderTrackFill(index, previous, current));
            previous = current;
        }
        return handles;
    };
    MultiSlider.prototype.renderTrackFill = function (index, start, end) {
        // ensure startRatio <= endRatio
        var _a = [this.getOffsetRatio(start.value), this.getOffsetRatio(end.value)].sort(function (left, right) { return left - right; }), startRatio = _a[0], endRatio = _a[1];
        var startOffset = formatPercentage(startRatio);
        var endOffset = formatPercentage(1 - endRatio);
        var style = this.props.vertical
            ? { bottom: startOffset, top: endOffset, left: 0 }
            : { left: startOffset, right: endOffset, top: 0 };
        var classes$1 = cx(SLIDER_PROGRESS, intentClass(this.getTrackIntent(start, end)));
        return createElement("div", { key: "track-" + index, className: classes$1, style: style });
    };
    MultiSlider.prototype.renderHandles = function () {
        var _this = this;
        var _a = this.props, disabled = _a.disabled, max = _a.max, min = _a.min, stepSize = _a.stepSize, vertical = _a.vertical;
        var handleProps = getSortedInteractiveHandleProps(this.props);
        if (handleProps.length === 0) {
            return null;
        }
        return handleProps.map(function (_a, index) {
            var _b;
            var value = _a.value, type = _a.type;
            return (createElement(Handle, { className: cx((_b = {},
                    _b[START] = type === HandleType.START,
                    _b[END] = type === HandleType.END,
                    _b)), disabled: disabled, key: index + "-" + handleProps.length, label: _this.formatLabel(value), max: max, min: min, onChange: _this.getHandlerForIndex(index, _this.handleChange), onRelease: _this.getHandlerForIndex(index, _this.handleRelease), ref: _this.addHandleRef, stepSize: stepSize, tickSize: _this.state.tickSize, tickSizeRatio: _this.state.tickSizeRatio, value: value, vertical: vertical }));
        });
    };
    MultiSlider.prototype.nearestHandleForValue = function (handles, getOffset) {
        return argMin(handles, function (handle) {
            var offset = getOffset(handle);
            var offsetValue = handle.clientToValue(offset);
            var handleValue = handle.props.value;
            return Math.abs(offsetValue - handleValue);
        });
    };
    MultiSlider.prototype.getNewHandleValues = function (newValue, oldIndex) {
        var handleProps = getSortedInteractiveHandleProps(this.props);
        var oldValues = handleProps.map(function (handle) { return handle.value; });
        var newValues = oldValues.slice();
        newValues[oldIndex] = newValue;
        newValues.sort(function (left, right) { return left - right; });
        var newIndex = newValues.indexOf(newValue);
        var lockIndex = this.findFirstLockedHandleIndex(oldIndex, newIndex);
        if (lockIndex === -1) {
            fillValues(newValues, oldIndex, newIndex, newValue);
        }
        else {
            // If pushing past a locked handle, discard the new value and only make the updates to clamp values against the lock.
            var lockValue = oldValues[lockIndex];
            fillValues(oldValues, oldIndex, lockIndex, lockValue);
            return oldValues;
        }
        return newValues;
    };
    MultiSlider.prototype.findFirstLockedHandleIndex = function (startIndex, endIndex) {
        var inc = startIndex < endIndex ? 1 : -1;
        var handleProps = getSortedInteractiveHandleProps(this.props);
        for (var index = startIndex + inc; index !== endIndex + inc; index += inc) {
            if (handleProps[index].interactionKind !== HandleInteractionKind.PUSH) {
                return index;
            }
        }
        return -1;
    };
    MultiSlider.prototype.getOffsetRatio = function (value) {
        return clamp((value - this.props.min) * this.state.tickSizeRatio, 0, 1);
    };
    MultiSlider.prototype.getTrackIntent = function (start, end) {
        if (!this.props.showTrackFill) {
            return Intent.NONE;
        }
        if (start.intentAfter !== undefined) {
            return start.intentAfter;
        }
        else if (end !== undefined && end.intentBefore !== undefined) {
            return end.intentBefore;
        }
        return this.props.defaultTrackIntent;
    };
    MultiSlider.prototype.updateTickSize = function () {
        if (this.trackElement != null) {
            var trackSize = this.props.vertical ? this.trackElement.clientHeight : this.trackElement.clientWidth;
            var tickSizeRatio = 1 / (this.props.max - this.props.min);
            var tickSize = trackSize * tickSizeRatio;
            this.setState({ tickSize: tickSize, tickSizeRatio: tickSizeRatio });
        }
    };
    var MultiSlider_1;
    MultiSlider.defaultSliderProps = {
        disabled: false,
        labelStepSize: 1,
        max: 10,
        min: 0,
        showTrackFill: true,
        stepSize: 1,
        vertical: false,
    };
    MultiSlider.defaultProps = __assign({}, MultiSlider_1.defaultSliderProps, { defaultTrackIntent: Intent.NONE });
    MultiSlider.displayName = DISPLAYNAME_PREFIX + ".MultiSlider";
    MultiSlider.Handle = MultiSliderHandle;
    MultiSlider = MultiSlider_1 = __decorate([
        polyfill
    ], MultiSlider);
    return MultiSlider;
}(AbstractPureComponent2));
function getLabelPrecision(_a) {
    var labelPrecision = _a.labelPrecision, stepSize = _a.stepSize;
    // infer default label precision from stepSize because that's how much the handle moves.
    return labelPrecision == null ? countDecimalPlaces(stepSize) : labelPrecision;
}
function getSortedInteractiveHandleProps(props) {
    return getSortedHandleProps(props, function (childProps) { return childProps.interactionKind !== HandleInteractionKind.NONE; });
}
function getSortedHandleProps(_a, predicate) {
    var children = _a.children;
    if (predicate === void 0) { predicate = function () { return true; }; }
    var maybeHandles = Children.map(children, function (child) {
        return isElementOfType(child, MultiSlider.Handle) && predicate(child.props) ? child.props : null;
    });
    var handles = maybeHandles != null ? maybeHandles : [];
    handles = handles.filter(function (handle) { return handle !== null; });
    handles.sort(function (left, right) { return left.value - right.value; });
    return handles;
}

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
var RangeIndex;
(function (RangeIndex) {
    RangeIndex[RangeIndex["START"] = 0] = "START";
    RangeIndex[RangeIndex["END"] = 1] = "END";
})(RangeIndex || (RangeIndex = {}));
var RangeSlider = /** @class */ (function (_super) {
    __extends(RangeSlider, _super);
    function RangeSlider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RangeSlider.prototype.render = function () {
        var _a = this.props, value = _a.value, props = __rest(_a, ["value"]);
        return (createElement(MultiSlider, __assign({}, props),
            createElement(MultiSlider.Handle, { value: value[RangeIndex.START], type: "start", intentAfter: Intent.PRIMARY }),
            createElement(MultiSlider.Handle, { value: value[RangeIndex.END], type: "end" })));
    };
    RangeSlider.prototype.validateProps = function (props) {
        var value = props.value;
        if (value == null || value[RangeIndex.START] == null || value[RangeIndex.END] == null) {
            throw new Error(RANGESLIDER_NULL_VALUE);
        }
    };
    RangeSlider.defaultProps = __assign({}, MultiSlider.defaultSliderProps, { value: [0, 10] });
    RangeSlider.displayName = DISPLAYNAME_PREFIX + ".RangeSlider";
    RangeSlider = __decorate([
        polyfill
    ], RangeSlider);
    return RangeSlider;
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
var Slider = /** @class */ (function (_super) {
    __extends(Slider, _super);
    function Slider() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Slider.prototype.render = function () {
        var _a = this.props, initialValue = _a.initialValue, value = _a.value, onChange = _a.onChange, onRelease = _a.onRelease, props = __rest(_a, ["initialValue", "value", "onChange", "onRelease"]);
        return (createElement(MultiSlider, __assign({}, props),
            createElement(MultiSlider.Handle, { value: value, intentAfter: value < initialValue ? Intent.PRIMARY : undefined, intentBefore: value >= initialValue ? Intent.PRIMARY : undefined, onChange: onChange, onRelease: onRelease }),
            createElement(MultiSlider.Handle, { value: initialValue, interactionKind: "none" })));
    };
    Slider.defaultProps = __assign({}, MultiSlider.defaultSliderProps, { initialValue: 0, value: 0 });
    Slider.displayName = DISPLAYNAME_PREFIX + ".Slider";
    Slider = __decorate([
        polyfill
    ], Slider);
    return Slider;
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
var Tab = /** @class */ (function (_super) {
    __extends(Tab, _super);
    function Tab() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // this component is never rendered directly; see Tabs#renderTabPanel()
    /* istanbul ignore next */
    Tab.prototype.render = function () {
        var _a = this.props, className = _a.className, panel = _a.panel;
        return (createElement("div", { className: cx(TAB_PANEL, className), role: "tablist" }, panel));
    };
    Tab.defaultProps = {
        disabled: false,
        id: undefined,
    };
    Tab.displayName = DISPLAYNAME_PREFIX + ".Tab";
    Tab = __decorate([
        polyfill
    ], Tab);
    return Tab;
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
var TabTitle = /** @class */ (function (_super) {
    __extends(TabTitle, _super);
    function TabTitle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleClick = function (e) { return _this.props.onClick(_this.props.id, e); };
        return _this;
    }
    TabTitle.prototype.render = function () {
        var _a = this.props, className = _a.className, children = _a.children, disabled = _a.disabled, id = _a.id, parentId = _a.parentId, selected = _a.selected, title = _a.title, htmlProps = __rest(_a, ["className", "children", "disabled", "id", "parentId", "selected", "title"]);
        return (createElement("div", __assign({}, removeNonHTMLProps(htmlProps), { "aria-controls": generateTabPanelId(parentId, id), "aria-disabled": disabled, "aria-expanded": selected, "aria-selected": selected, className: cx(TAB, className), "data-tab-id": id, id: generateTabTitleId(parentId, id), onClick: disabled ? undefined : this.handleClick, role: "tab", tabIndex: disabled ? undefined : 0 }),
            title,
            children));
    };
    TabTitle.displayName = DISPLAYNAME_PREFIX + ".TabTitle";
    TabTitle = __decorate([
        polyfill
    ], TabTitle);
    return TabTitle;
}(AbstractPureComponent2));
function generateTabPanelId(parentId, tabId) {
    return TAB_PANEL + "_" + parentId + "_" + tabId;
}
function generateTabTitleId(parentId, tabId) {
    return TAB + "-title_" + parentId + "_" + tabId;
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
var Expander = function () { return createElement("div", { className: FLEX_EXPANDER }); };
var TAB_SELECTOR = "." + TAB;
var Tabs = /** @class */ (function (_super) {
    __extends(Tabs, _super);
    function Tabs(props) {
        var _this = _super.call(this, props) || this;
        _this.refHandlers = {
            tablist: function (tabElement) { return (_this.tablistElement = tabElement); },
        };
        _this.handleKeyDown = function (e) {
            var focusedElement = document.activeElement.closest(TAB_SELECTOR);
            // rest of this is potentially expensive and futile, so bail if no tab is focused
            if (focusedElement == null) {
                return;
            }
            // must rely on DOM state because we have no way of mapping `focusedElement` to a JSX.Element
            var enabledTabElements = _this.getTabElements().filter(function (el) { return el.getAttribute("aria-disabled") === "false"; });
            var focusedIndex = enabledTabElements.indexOf(focusedElement);
            var direction = _this.getKeyCodeDirection(e);
            if (focusedIndex >= 0 && direction !== undefined) {
                e.preventDefault();
                var length_1 = enabledTabElements.length;
                // auto-wrapping at 0 and `length`
                var nextFocusedIndex = (focusedIndex + direction + length_1) % length_1;
                enabledTabElements[nextFocusedIndex].focus();
            }
        };
        _this.handleKeyPress = function (e) {
            var targetTabElement = e.target.closest(TAB_SELECTOR);
            if (targetTabElement != null && isKeyboardClick(e.which)) {
                e.preventDefault();
                targetTabElement.click();
            }
        };
        _this.handleTabClick = function (newTabId, event) {
            safeInvoke(_this.props.onChange, newTabId, _this.state.selectedTabId, event);
            if (_this.props.selectedTabId === undefined) {
                _this.setState({ selectedTabId: newTabId });
            }
        };
        _this.renderTabPanel = function (tab) {
            var _a = tab.props, className = _a.className, panel = _a.panel, id = _a.id, panelClassName = _a.panelClassName;
            if (panel === undefined) {
                return undefined;
            }
            return (createElement("div", { "aria-labelledby": generateTabTitleId(_this.props.id, id), "aria-hidden": id !== _this.state.selectedTabId, className: cx(TAB_PANEL, className, panelClassName), id: generateTabPanelId(_this.props.id, id), key: id, role: "tabpanel" }, panel));
        };
        _this.renderTabTitle = function (child) {
            if (isTabElement(child)) {
                var id = child.props.id;
                return (createElement(TabTitle, __assign({}, child.props, { parentId: _this.props.id, onClick: _this.handleTabClick, selected: id === _this.state.selectedTabId })));
            }
            return child;
        };
        var selectedTabId = _this.getInitialSelectedTabId();
        _this.state = { selectedTabId: selectedTabId };
        return _this;
    }
    Tabs.getDerivedStateFromProps = function (_a) {
        var selectedTabId = _a.selectedTabId;
        if (selectedTabId !== undefined) {
            // keep state in sync with controlled prop, so state is canonical source of truth
            return { selectedTabId: selectedTabId };
        }
        return null;
    };
    Tabs.prototype.render = function () {
        var _a, _b;
        var _c = this.state, indicatorWrapperStyle = _c.indicatorWrapperStyle, selectedTabId = _c.selectedTabId;
        var tabTitles = Children.map(this.props.children, this.renderTabTitle);
        var tabPanels = this.getTabChildren()
            .filter(this.props.renderActiveTabPanelOnly ? function (tab) { return tab.props.id === selectedTabId; } : function () { return true; })
            .map(this.renderTabPanel);
        var tabIndicator = this.props.animate ? (createElement("div", { className: TAB_INDICATOR_WRAPPER, style: indicatorWrapperStyle },
            createElement("div", { className: TAB_INDICATOR }))) : null;
        var classes$1 = cx(TABS, (_a = {}, _a[VERTICAL] = this.props.vertical, _a), this.props.className);
        var tabListClasses = cx(TAB_LIST, (_b = {},
            _b[LARGE] = this.props.large,
            _b));
        return (createElement("div", { className: classes$1 },
            createElement("div", { className: tabListClasses, onKeyDown: this.handleKeyDown, onKeyPress: this.handleKeyPress, ref: this.refHandlers.tablist, role: "tablist" },
                tabIndicator,
                tabTitles),
            tabPanels));
    };
    Tabs.prototype.componentDidMount = function () {
        this.moveSelectionIndicator();
    };
    Tabs.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (this.state.selectedTabId !== prevState.selectedTabId) {
            this.moveSelectionIndicator();
        }
        else if (prevState.selectedTabId != null) {
            // comparing React nodes is difficult to do with simple logic, so
            // shallowly compare just their props as a workaround.
            var didChildrenChange = !arraysEqual(this.getTabChildrenProps(prevProps), this.getTabChildrenProps(), shallowCompareKeys);
            if (didChildrenChange) {
                this.moveSelectionIndicator();
            }
        }
    };
    Tabs.prototype.getInitialSelectedTabId = function () {
        // NOTE: providing an unknown ID will hide the selection
        var _a = this.props, defaultSelectedTabId = _a.defaultSelectedTabId, selectedTabId = _a.selectedTabId;
        if (selectedTabId !== undefined) {
            return selectedTabId;
        }
        else if (defaultSelectedTabId !== undefined) {
            return defaultSelectedTabId;
        }
        else {
            // select first tab in absence of user input
            var tabs = this.getTabChildren();
            return tabs.length === 0 ? undefined : tabs[0].props.id;
        }
    };
    Tabs.prototype.getKeyCodeDirection = function (e) {
        if (isEventKeyCode(e, ARROW_LEFT, ARROW_UP)) {
            return -1;
        }
        else if (isEventKeyCode(e, ARROW_RIGHT, ARROW_DOWN)) {
            return 1;
        }
        return undefined;
    };
    Tabs.prototype.getTabChildrenProps = function (props) {
        if (props === void 0) { props = this.props; }
        return this.getTabChildren(props).map(function (child) { return child.props; });
    };
    /** Filters children to only `<Tab>`s */
    Tabs.prototype.getTabChildren = function (props) {
        if (props === void 0) { props = this.props; }
        return Children.toArray(props.children).filter(isTabElement);
    };
    /** Queries root HTML element for all tabs with optional filter selector */
    Tabs.prototype.getTabElements = function (subselector) {
        if (subselector === void 0) { subselector = ""; }
        if (this.tablistElement == null) {
            return [];
        }
        return Array.from(this.tablistElement.querySelectorAll(TAB_SELECTOR + subselector));
    };
    /**
     * Calculate the new height, width, and position of the tab indicator.
     * Store the CSS values so the transition animation can start.
     */
    Tabs.prototype.moveSelectionIndicator = function () {
        if (this.tablistElement == null || !this.props.animate) {
            return;
        }
        var tabIdSelector = TAB_SELECTOR + "[data-tab-id=\"" + this.state.selectedTabId + "\"]";
        var selectedTabElement = this.tablistElement.querySelector(tabIdSelector);
        var indicatorWrapperStyle = { display: "none" };
        if (selectedTabElement != null) {
            var clientHeight = selectedTabElement.clientHeight, clientWidth = selectedTabElement.clientWidth, offsetLeft = selectedTabElement.offsetLeft, offsetTop = selectedTabElement.offsetTop;
            indicatorWrapperStyle = {
                height: clientHeight,
                transform: "translateX(" + Math.floor(offsetLeft) + "px) translateY(" + Math.floor(offsetTop) + "px)",
                width: clientWidth,
            };
        }
        this.setState({ indicatorWrapperStyle: indicatorWrapperStyle });
    };
    /** Insert a `Tabs.Expander` between any two children to right-align all subsequent children. */
    Tabs.Expander = Expander;
    Tabs.Tab = Tab;
    Tabs.defaultProps = {
        animate: true,
        large: false,
        renderActiveTabPanelOnly: false,
        vertical: false,
    };
    Tabs.displayName = DISPLAYNAME_PREFIX + ".Tabs";
    Tabs = __decorate([
        polyfill
    ], Tabs);
    return Tabs;
}(AbstractPureComponent2));
function isEventKeyCode(e) {
    var codes = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        codes[_i - 1] = arguments[_i];
    }
    return codes.indexOf(e.which) >= 0;
}
function isTabElement(child) {
    return isElementOfType(child, Tab);
}

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
var Toast = /** @class */ (function (_super) {
    __extends(Toast, _super);
    function Toast() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleActionClick = function (e) {
            safeInvoke(_this.props.action.onClick, e);
            _this.triggerDismiss(false);
        };
        _this.handleCloseClick = function () { return _this.triggerDismiss(false); };
        _this.startTimeout = function () {
            _this.clearTimeouts();
            if (_this.props.timeout > 0) {
                _this.setTimeout(function () { return _this.triggerDismiss(true); }, _this.props.timeout);
            }
        };
        return _this;
    }
    Toast.prototype.render = function () {
        var _a = this.props, className = _a.className, icon = _a.icon, intent = _a.intent, message = _a.message;
        return (createElement("div", { className: cx(TOAST, intentClass(intent), className), onBlur: this.startTimeout, onFocus: this.clearTimeouts, onMouseEnter: this.clearTimeouts, onMouseLeave: this.startTimeout, tabIndex: 0 },
            createElement(Icon, { icon: icon }),
            createElement("span", { className: TOAST_MESSAGE }, message),
            createElement(ButtonGroup, { minimal: true },
                this.maybeRenderActionButton(),
                createElement(Button, { icon: "cross", onClick: this.handleCloseClick }))));
    };
    Toast.prototype.componentDidMount = function () {
        this.startTimeout();
    };
    Toast.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.timeout !== this.props.timeout) {
            if (this.props.timeout > 0) {
                this.startTimeout();
            }
            else {
                this.clearTimeouts();
            }
        }
    };
    Toast.prototype.componentWillUnmount = function () {
        this.clearTimeouts();
    };
    Toast.prototype.maybeRenderActionButton = function () {
        var action = this.props.action;
        if (action == null) {
            return undefined;
        }
        else {
            return createElement(AnchorButton, __assign({}, action, { intent: undefined, onClick: this.handleActionClick }));
        }
    };
    Toast.prototype.triggerDismiss = function (didTimeoutExpire) {
        this.clearTimeouts();
        safeInvoke(this.props.onDismiss, didTimeoutExpire);
    };
    Toast.defaultProps = {
        className: "",
        message: "",
        timeout: 5000,
    };
    Toast.displayName = DISPLAYNAME_PREFIX + ".Toast";
    Toast = __decorate([
        polyfill
    ], Toast);
    return Toast;
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
var Toaster = /** @class */ (function (_super) {
    __extends(Toaster, _super);
    function Toaster() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            toasts: [],
        };
        // auto-incrementing identifier for un-keyed toasts
        _this.toastId = 0;
        _this.getDismissHandler = function (toast) { return function (timeoutExpired) {
            _this.dismiss(toast.key, timeoutExpired);
        }; };
        _this.handleClose = function (e) {
            // NOTE that `e` isn't always a KeyboardEvent but that's the only type we care about
            if (e.which === ESCAPE) {
                _this.clear();
            }
        };
        return _this;
    }
    Toaster_1 = Toaster;
    /**
     * Create a new `Toaster` instance that can be shared around your application.
     * The `Toaster` will be rendered into a new element appended to the given container.
     */
    Toaster.create = function (props, container) {
        if (container === void 0) { container = document.body; }
        if (props != null && props.usePortal != null && !isNodeEnv("production")) {
            console.warn(TOASTER_WARN_INLINE);
        }
        var containerElement = document.createElement("div");
        container.appendChild(containerElement);
        var toaster = render(createElement(Toaster_1, __assign({}, props, { usePortal: false })), containerElement);
        if (toaster == null) {
            throw new Error(TOASTER_CREATE_NULL);
        }
        return toaster;
    };
    Toaster.prototype.show = function (props, key) {
        if (this.props.maxToasts) {
            // check if active number of toasts are at the maxToasts limit
            this.dismissIfAtLimit();
        }
        var options = this.createToastOptions(props, key);
        if (key === undefined || this.isNewToastKey(key)) {
            this.setState(function (prevState) { return ({
                toasts: [options].concat(prevState.toasts),
            }); });
        }
        else {
            this.setState(function (prevState) { return ({
                toasts: prevState.toasts.map(function (t) { return (t.key === key ? options : t); }),
            }); });
        }
        return options.key;
    };
    Toaster.prototype.dismiss = function (key, timeoutExpired) {
        if (timeoutExpired === void 0) { timeoutExpired = false; }
        this.setState(function (_a) {
            var toasts = _a.toasts;
            return ({
                toasts: toasts.filter(function (t) {
                    var matchesKey = t.key === key;
                    if (matchesKey) {
                        safeInvoke(t.onDismiss, timeoutExpired);
                    }
                    return !matchesKey;
                }),
            });
        });
    };
    Toaster.prototype.clear = function () {
        this.state.toasts.map(function (t) { return safeInvoke(t.onDismiss, false); });
        this.setState({ toasts: [] });
    };
    Toaster.prototype.getToasts = function () {
        return this.state.toasts;
    };
    Toaster.prototype.render = function () {
        // $pt-transition-duration * 3 + $pt-transition-duration / 2
        var classes$1 = cx(TOAST_CONTAINER, this.getPositionClasses(), this.props.className);
        return (createElement(Overlay, { autoFocus: this.props.autoFocus, canEscapeKeyClose: this.props.canEscapeKeyClear, canOutsideClickClose: false, className: classes$1, enforceFocus: false, hasBackdrop: false, isOpen: this.state.toasts.length > 0 || this.props.children != null, onClose: this.handleClose, transitionDuration: 350, transitionName: TOAST, usePortal: this.props.usePortal },
            this.state.toasts.map(this.renderToast, this),
            this.props.children));
    };
    Toaster.prototype.validateProps = function (props) {
        // maximum number of toasts should not be a number less than 1
        if (props.maxToasts < 1) {
            throw new Error(TOASTER_MAX_TOASTS_INVALID);
        }
    };
    Toaster.prototype.isNewToastKey = function (key) {
        return this.state.toasts.every(function (toast) { return toast.key !== key; });
    };
    Toaster.prototype.dismissIfAtLimit = function () {
        if (this.state.toasts.length === this.props.maxToasts) {
            // dismiss the oldest toast to stay within the maxToasts limit
            this.dismiss(this.state.toasts[this.state.toasts.length - 1].key);
        }
    };
    Toaster.prototype.renderToast = function (toast) {
        return createElement(Toast, __assign({}, toast, { onDismiss: this.getDismissHandler(toast) }));
    };
    Toaster.prototype.createToastOptions = function (props, key) {
        if (key === void 0) { key = "toast-" + this.toastId++; }
        // clone the object before adding the key prop to avoid leaking the mutation
        return __assign({}, props, { key: key });
    };
    Toaster.prototype.getPositionClasses = function () {
        var positions = this.props.position.split("-");
        // NOTE that there is no -center class because that's the default style
        return positions.map(function (p) { return TOAST_CONTAINER + "-" + p.toLowerCase(); });
    };
    var Toaster_1;
    Toaster.displayName = DISPLAYNAME_PREFIX + ".Toaster";
    Toaster.defaultProps = {
        autoFocus: false,
        canEscapeKeyClear: true,
        position: Position.TOP,
        usePortal: true,
    };
    Toaster = Toaster_1 = __decorate([
        polyfill
    ], Toaster);
    return Toaster;
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
var TreeNode = /** @class */ (function (_super) {
    __extends(TreeNode, _super);
    function TreeNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.handleCaretClick = function (e) {
            e.stopPropagation();
            var _a = _this.props, isExpanded = _a.isExpanded, onCollapse = _a.onCollapse, onExpand = _a.onExpand;
            safeInvoke(isExpanded ? onCollapse : onExpand, _this, e);
        };
        _this.handleClick = function (e) {
            safeInvoke(_this.props.onClick, _this, e);
        };
        _this.handleContentRef = function (element) {
            safeInvoke(_this.props.contentRef, _this, element);
        };
        _this.handleContextMenu = function (e) {
            safeInvoke(_this.props.onContextMenu, _this, e);
        };
        _this.handleDoubleClick = function (e) {
            safeInvoke(_this.props.onDoubleClick, _this, e);
        };
        _this.handleMouseEnter = function (e) {
            safeInvoke(_this.props.onMouseEnter, _this, e);
        };
        _this.handleMouseLeave = function (e) {
            safeInvoke(_this.props.onMouseLeave, _this, e);
        };
        return _this;
    }
    TreeNode.ofType = function () {
        return TreeNode;
    };
    TreeNode.prototype.render = function () {
        var _a;
        var _b = this.props, children = _b.children, className = _b.className, disabled = _b.disabled, icon = _b.icon, isExpanded = _b.isExpanded, isSelected = _b.isSelected, label = _b.label;
        var classes$1 = cx(TREE_NODE, (_a = {},
            _a[DISABLED] = disabled,
            _a[TREE_NODE_SELECTED] = isSelected,
            _a[TREE_NODE_EXPANDED] = isExpanded,
            _a), className);
        var contentClasses = cx(TREE_NODE_CONTENT, TREE_NODE_CONTENT + "-" + this.props.depth);
        var eventHandlers = disabled === true
            ? {}
            : {
                onClick: this.handleClick,
                onContextMenu: this.handleContextMenu,
                onDoubleClick: this.handleDoubleClick,
                onMouseEnter: this.handleMouseEnter,
                onMouseLeave: this.handleMouseLeave,
            };
        return (createElement("li", { className: classes$1 },
            createElement("div", __assign({ className: contentClasses, ref: this.handleContentRef }, eventHandlers),
                this.maybeRenderCaret(),
                createElement(Icon, { className: TREE_NODE_ICON, icon: icon }),
                createElement("span", { className: TREE_NODE_LABEL }, label),
                this.maybeRenderSecondaryLabel()),
            createElement(Collapse, { isOpen: isExpanded }, children)));
    };
    TreeNode.prototype.maybeRenderCaret = function () {
        var _a = this.props, children = _a.children, isExpanded = _a.isExpanded, disabled = _a.disabled, _b = _a.hasCaret, hasCaret = _b === void 0 ? Children.count(children) > 0 : _b;
        if (hasCaret) {
            var caretClasses = cx(TREE_NODE_CARET, isExpanded ? TREE_NODE_CARET_OPEN : TREE_NODE_CARET_CLOSED);
            var onClick = disabled === true ? undefined : this.handleCaretClick;
            return createElement(Icon, { className: caretClasses, onClick: onClick, icon: "chevron-right" });
        }
        return createElement("span", { className: TREE_NODE_CARET_NONE });
    };
    TreeNode.prototype.maybeRenderSecondaryLabel = function () {
        if (this.props.secondaryLabel != null) {
            return createElement("span", { className: TREE_NODE_SECONDARY_LABEL }, this.props.secondaryLabel);
        }
        else {
            return undefined;
        }
    };
    TreeNode.displayName = DISPLAYNAME_PREFIX + ".TreeNode";
    return TreeNode;
}(Component));

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
var Tree = /** @class */ (function (_super) {
    __extends(Tree, _super);
    function Tree() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.nodeRefs = {};
        _this.handleNodeCollapse = function (node, e) {
            _this.handlerHelper(_this.props.onNodeCollapse, node, e);
        };
        _this.handleNodeClick = function (node, e) {
            _this.handlerHelper(_this.props.onNodeClick, node, e);
        };
        _this.handleContentRef = function (node, element) {
            if (element != null) {
                _this.nodeRefs[node.props.id] = element;
            }
            else {
                // don't want our object to get bloated with old keys
                delete _this.nodeRefs[node.props.id];
            }
        };
        _this.handleNodeContextMenu = function (node, e) {
            _this.handlerHelper(_this.props.onNodeContextMenu, node, e);
        };
        _this.handleNodeDoubleClick = function (node, e) {
            _this.handlerHelper(_this.props.onNodeDoubleClick, node, e);
        };
        _this.handleNodeExpand = function (node, e) {
            _this.handlerHelper(_this.props.onNodeExpand, node, e);
        };
        _this.handleNodeMouseEnter = function (node, e) {
            _this.handlerHelper(_this.props.onNodeMouseEnter, node, e);
        };
        _this.handleNodeMouseLeave = function (node, e) {
            _this.handlerHelper(_this.props.onNodeMouseLeave, node, e);
        };
        return _this;
    }
    Tree.ofType = function () {
        return Tree;
    };
    Tree.nodeFromPath = function (path, treeNodes) {
        if (path.length === 1) {
            return treeNodes[path[0]];
        }
        else {
            return Tree.nodeFromPath(path.slice(1), treeNodes[path[0]].childNodes);
        }
    };
    Tree.prototype.render = function () {
        return (createElement("div", { className: cx(TREE, this.props.className) }, this.renderNodes(this.props.contents, [], TREE_ROOT)));
    };
    /**
     * Returns the underlying HTML element of the `Tree` node with an id of `nodeId`.
     * This element does not contain the children of the node, only its label and controls.
     * If the node is not currently mounted, `undefined` is returned.
     */
    Tree.prototype.getNodeContentElement = function (nodeId) {
        return this.nodeRefs[nodeId];
    };
    Tree.prototype.renderNodes = function (treeNodes, currentPath, className) {
        var _this = this;
        if (treeNodes == null) {
            return null;
        }
        var nodeItems = treeNodes.map(function (node, i) {
            var elementPath = currentPath.concat(i);
            var TypedTreeNode = TreeNode.ofType();
            return (createElement(TypedTreeNode, __assign({}, node, { key: node.id, contentRef: _this.handleContentRef, depth: elementPath.length - 1, onClick: _this.handleNodeClick, onContextMenu: _this.handleNodeContextMenu, onCollapse: _this.handleNodeCollapse, onDoubleClick: _this.handleNodeDoubleClick, onExpand: _this.handleNodeExpand, onMouseEnter: _this.handleNodeMouseEnter, onMouseLeave: _this.handleNodeMouseLeave, path: elementPath }), _this.renderNodes(node.childNodes, elementPath)));
        });
        return createElement("ul", { className: cx(TREE_NODE_LIST, className) }, nodeItems);
    };
    Tree.prototype.handlerHelper = function (handlerFromProps, node, e) {
        if (isFunction(handlerFromProps)) {
            var nodeData = Tree.nodeFromPath(node.props.path, this.props.contents);
            handlerFromProps(nodeData, node.props.path, e);
        }
    };
    Tree.displayName = DISPLAYNAME_PREFIX + ".Tree";
    return Tree;
}(Component));

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
var ContextMenu$1 = contextMenu$1;

export { AbstractComponent, AbstractPureComponent, Alert, AnimationStates, Boundary, Breadcrumb, Breadcrumbs, ButtonGroup, Callout, Card, Checkbox, Collapse, CollapsibleList, Colors, ContextMenu$1 as ContextMenu, ContextMenuTarget, ControlGroup, Dialog, Divider, Drawer, EditableText, Expander, FileInput, FocusStyleManager, FormGroup, HTMLSelect, HTMLTable, HandleInteractionKind, HandleType, Hotkey, Hotkeys, HotkeysTarget, KeyCombo, MultiSlider, Navbar, NavbarDivider, NavbarGroup, NavbarHeading, NonIdealState, NumericInput, OverflowDirection, OverflowList, PanelStack, PopoverPosition, ProgressBar, Radio, RadioGroup, RangeSlider, Slider, Switch, Tab, Tabs, TextArea, Toast, Toaster, Tree, TreeNode, comboMatches, getKeyCombo, getKeyComboString, hideHotkeysDialog, parseKeyCombo, setHotkeysDialogProps };
