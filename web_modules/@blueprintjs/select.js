import { aM as getClassNamespace, ac as isFunction, J as shallowCompareKeys, s as safeInvoke, m as DISPLAYNAME_PREFIX, S as Menu, b2 as ARROW_UP, b3 as ARROW_DOWN, ay as ENTER, cw as AbstractComponent2, O as Overlay, b0 as InputGroup, cQ as safeInvokeMember, P as Popover, b as Position, cO as TagInput, ax as ESCAPE, cR as TAB, cS as BACKSPACE, bM as ARROW_LEFT, bN as ARROW_RIGHT, cT as TAG_REMOVE, B as Button } from '../common/tagInput-831102ab.js';
import { c as createElement, P as PureComponent } from '../common/source.production-86e2832f.js';
import '../common/index-ed166f27.js';
import { c as cx } from '../common/index-330529d6.js';

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
var NS = getClassNamespace();
var MULTISELECT = NS + "-multi-select";
var MULTISELECT_POPOVER = MULTISELECT + "-popover";
var MULTISELECT_TAG_INPUT_INPUT = MULTISELECT + "-tag-input-input";
var OMNIBAR = NS + "-omnibar";
var OMNIBAR_OVERLAY = OMNIBAR + "-overlay";
var SELECT = NS + "-select";
var SELECT_POPOVER = SELECT + "-popover";

var classes = /*#__PURE__*/Object.freeze({
    __proto__: null,
    MULTISELECT: MULTISELECT,
    MULTISELECT_POPOVER: MULTISELECT_POPOVER,
    MULTISELECT_TAG_INPUT_INPUT: MULTISELECT_TAG_INPUT_INPUT,
    OMNIBAR: OMNIBAR,
    OMNIBAR_OVERLAY: OMNIBAR_OVERLAY,
    SELECT: SELECT,
    SELECT_POPOVER: SELECT_POPOVER
});

/*!
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
 * `ItemListRenderer` helper method for rendering each item in `filteredItems`,
 * with optional support for `noResults` (when filtered items is empty)
 * and `initialContent` (when query is empty).
 */
function renderFilteredItems(props, noResults, initialContent) {
    if (props.query.length === 0 && initialContent !== undefined) {
        return initialContent;
    }
    var items = props.filteredItems.map(props.renderItem).filter(function (item) { return item != null; });
    return items.length > 0 ? items : noResults;
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
/**
 * Utility function for executing the {@link IListItemsProps#itemsEqual} prop to test
 * for equality between two items.
 * @return `true` if the two items are equivalent according to `itemsEqualProp`.
 */
function executeItemsEqual(itemsEqualProp, itemA, itemB) {
    // Use strict equality if:
    // A) Default equality check is necessary because itemsEqualProp is undefined.
    // OR
    // B) Either item is null/undefined. Note that null represents "no item", while
    //    undefined represents an uncontrolled prop. This strict equality check ensures
    //    nothing will ever be considered equivalent to an uncontrolled prop.
    if (itemsEqualProp === undefined || itemA == null || itemB == null) {
        return itemA === itemB;
    }
    if (isFunction(itemsEqualProp)) {
        // itemsEqualProp is an equality comparator function, so use it
        return itemsEqualProp(itemA, itemB);
    }
    else {
        // itemsEqualProp is a property name, so strictly compare the values of the property.
        return itemA[itemsEqualProp] === itemB[itemsEqualProp];
    }
}

/*!
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
/** Returns an instance of a "Create Item" object. */
function getCreateNewItem() {
    return { __blueprintCreateNewItemBrand: "blueprint-create-new-item" };
}
/**
 * Type guard returning `true` if the provided item (e.g. the current
 * `activeItem`) is a "Create Item" option.
 */
function isCreateNewItem(item) {
    if (item == null) {
        return false;
    }
    // see if the provided item exactly matches the `ICreateNewItem` object,
    // with no superfluous keys.
    var keys = Object.keys(item);
    if (keys.length !== 1 || keys[0] !== "__blueprintCreateNewItemBrand") {
        return false;
    }
    return item.__blueprintCreateNewItemBrand === "blueprint-create-new-item";
}
/**
 * Returns the type of the the current active item. This will be a no-op unless
 * the `activeItem` is `undefined` or a "Create Item" option, in which case
 * `null` will be returned instead.
 */
function getActiveItem(activeItem) {
    return activeItem == null || isCreateNewItem(activeItem) ? null : activeItem;
}

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
var QueryList = /** @class */ (function (_super) {
    __extends(QueryList, _super);
    function QueryList(props, context) {
        var _this = _super.call(this, props, context) || this;
        _this.refHandlers = {
            itemsParent: function (ref) { return (_this.itemsParentRef = ref); },
        };
        /**
         * Flag indicating that we should check whether selected item is in viewport
         * after rendering, typically because of keyboard change. Set to `true` when
         * manipulating state in a way that may cause active item to scroll away.
         */
        _this.shouldCheckActiveItemInViewport = false;
        /**
         * The item that we expect to be the next selected active item (based on click
         * or key interactions). When scrollToActiveItem = false, used to detect if
         * an unexpected external change to the active item has been made.
         */
        _this.expectedNextActiveItem = null;
        /** default `itemListRenderer` implementation */
        _this.renderItemList = function (listProps) {
            var _a = _this.props, initialContent = _a.initialContent, noResults = _a.noResults;
            // omit noResults if createNewItemFromQuery and createNewItemRenderer are both supplied, and query is not empty
            var maybeNoResults = _this.isCreateItemRendered() ? null : noResults;
            var menuContent = renderFilteredItems(listProps, maybeNoResults, initialContent);
            var createItemView = _this.isCreateItemRendered() ? _this.renderCreateItemMenuItem(_this.state.query) : null;
            if (menuContent == null && createItemView == null) {
                return null;
            }
            return (createElement(Menu, { ulRef: listProps.itemsParentRef },
                menuContent,
                createItemView));
        };
        /** wrapper around `itemRenderer` to inject props */
        _this.renderItem = function (item, index) {
            if (_this.props.disabled !== true) {
                var _a = _this.state, activeItem = _a.activeItem, query = _a.query;
                var matchesPredicate = _this.state.filteredItems.indexOf(item) >= 0;
                var modifiers = {
                    active: executeItemsEqual(_this.props.itemsEqual, getActiveItem(activeItem), item),
                    disabled: isItemDisabled(item, index, _this.props.itemDisabled),
                    matchesPredicate: matchesPredicate,
                };
                return _this.props.itemRenderer(item, {
                    handleClick: function (e) { return _this.handleItemSelect(item, e); },
                    index: index,
                    modifiers: modifiers,
                    query: query,
                });
            }
            return null;
        };
        _this.renderCreateItemMenuItem = function (query) {
            var activeItem = _this.state.activeItem;
            var handleClick = function (evt) {
                _this.handleItemCreate(query, evt);
            };
            var isActive = isCreateNewItem(activeItem);
            return safeInvoke(_this.props.createNewItemRenderer, query, isActive, handleClick);
        };
        _this.handleItemCreate = function (query, evt) {
            // we keep a cached createNewItem in state, but might as well recompute
            // the result just to be sure it's perfectly in sync with the query.
            var item = safeInvoke(_this.props.createNewItemFromQuery, query);
            if (item != null) {
                safeInvoke(_this.props.onItemSelect, item, evt);
                _this.setQuery("", true);
            }
        };
        _this.handleItemSelect = function (item, event) {
            _this.setActiveItem(item);
            safeInvoke(_this.props.onItemSelect, item, event);
            if (_this.props.resetOnSelect) {
                _this.setQuery("", true);
            }
        };
        _this.handlePaste = function (queries) {
            var _a = _this.props, createNewItemFromQuery = _a.createNewItemFromQuery, onItemsPaste = _a.onItemsPaste;
            var nextActiveItem;
            var nextQueries = [];
            // Find an exising item that exactly matches each pasted value, or
            // create a new item if possible. Ignore unmatched values if creating
            // items is disabled.
            var pastedItemsToEmit = [];
            for (var _i = 0, queries_1 = queries; _i < queries_1.length; _i++) {
                var query = queries_1[_i];
                var equalItem = getMatchingItem(query, _this.props);
                if (equalItem !== undefined) {
                    nextActiveItem = equalItem;
                    pastedItemsToEmit.push(equalItem);
                }
                else if (_this.canCreateItems()) {
                    var newItem = safeInvoke(createNewItemFromQuery, query);
                    if (newItem !== undefined) {
                        pastedItemsToEmit.push(newItem);
                    }
                }
                else {
                    nextQueries.push(query);
                }
            }
            // UX nicety: combine all unmatched queries into a single
            // comma-separated query in the input, so we don't lose any information.
            // And don't reset the active item; we'll do that ourselves below.
            _this.setQuery(nextQueries.join(", "), false);
            // UX nicety: update the active item if we matched with at least one
            // existing item.
            if (nextActiveItem !== undefined) {
                _this.setActiveItem(nextActiveItem);
            }
            safeInvoke(onItemsPaste, pastedItemsToEmit);
        };
        _this.handleKeyDown = function (event) {
            var keyCode = event.keyCode;
            if (keyCode === ARROW_UP || keyCode === ARROW_DOWN) {
                event.preventDefault();
                var nextActiveItem = _this.getNextActiveItem(keyCode === ARROW_UP ? -1 : 1);
                if (nextActiveItem != null) {
                    _this.setActiveItem(nextActiveItem);
                }
            }
            safeInvoke(_this.props.onKeyDown, event);
        };
        _this.handleKeyUp = function (event) {
            var onKeyUp = _this.props.onKeyUp;
            var activeItem = _this.state.activeItem;
            // using keyup for enter to play nice with Button's keyboard clicking.
            // if we were to process enter on keydown, then Button would click itself on keyup
            // and the popvoer would re-open out of our control :(.
            if (event.keyCode === ENTER) {
                event.preventDefault();
                if (activeItem == null || isCreateNewItem(activeItem)) {
                    _this.handleItemCreate(_this.state.query, event);
                }
                else {
                    _this.handleItemSelect(activeItem, event);
                }
            }
            safeInvoke(onKeyUp, event);
        };
        _this.handleQueryChange = function (event) {
            var query = event == null ? "" : event.target.value;
            _this.setQuery(query);
            safeInvoke(_this.props.onQueryChange, query, event);
        };
        var _a = props.query, query = _a === void 0 ? "" : _a;
        var createNewItem = safeInvoke(props.createNewItemFromQuery, query);
        var filteredItems = getFilteredItems(query, props);
        _this.state = {
            activeItem: props.activeItem !== undefined
                ? props.activeItem
                : getFirstEnabledItem(filteredItems, props.itemDisabled),
            createNewItem: createNewItem,
            filteredItems: filteredItems,
            query: query,
        };
        return _this;
    }
    QueryList.ofType = function () {
        return QueryList;
    };
    QueryList.prototype.render = function () {
        var _a = this.props, className = _a.className, items = _a.items, renderer = _a.renderer, _b = _a.itemListRenderer, itemListRenderer = _b === void 0 ? this.renderItemList : _b;
        var _c = this.state, createNewItem = _c.createNewItem, spreadableState = __rest(_c, ["createNewItem"]);
        return renderer(__assign({}, spreadableState, { className: className, handleItemSelect: this.handleItemSelect, handleKeyDown: this.handleKeyDown, handleKeyUp: this.handleKeyUp, handlePaste: this.handlePaste, handleQueryChange: this.handleQueryChange, itemList: itemListRenderer(__assign({}, spreadableState, { items: items, itemsParentRef: this.refHandlers.itemsParent, renderItem: this.renderItem })) }));
    };
    QueryList.prototype.componentDidUpdate = function (prevProps) {
        var _this = this;
        if (this.props.activeItem !== undefined && this.props.activeItem !== this.state.activeItem) {
            this.shouldCheckActiveItemInViewport = true;
            this.setState({ activeItem: this.props.activeItem });
        }
        if (this.props.query != null && this.props.query !== prevProps.query) {
            // new query
            this.setQuery(this.props.query, this.props.resetOnQuery, this.props);
        }
        else if (
        // same query (or uncontrolled query), but items in the list changed
        !shallowCompareKeys(this.props, prevProps, {
            include: ["items", "itemListPredicate", "itemPredicate"],
        })) {
            this.setQuery(this.state.query);
        }
        if (this.shouldCheckActiveItemInViewport) {
            // update scroll position immediately before repaint so DOM is accurate
            // (latest filteredItems) and to avoid flicker.
            requestAnimationFrame(function () { return _this.scrollActiveItemIntoView(); });
            // reset the flag
            this.shouldCheckActiveItemInViewport = false;
        }
    };
    QueryList.prototype.scrollActiveItemIntoView = function () {
        var scrollToActiveItem = this.props.scrollToActiveItem !== false;
        var externalChangeToActiveItem = !executeItemsEqual(this.props.itemsEqual, getActiveItem(this.expectedNextActiveItem), getActiveItem(this.props.activeItem));
        this.expectedNextActiveItem = null;
        if (!scrollToActiveItem && externalChangeToActiveItem) {
            return;
        }
        var activeElement = this.getActiveElement();
        if (this.itemsParentRef != null && activeElement != null) {
            var activeTop = activeElement.offsetTop, activeHeight = activeElement.offsetHeight;
            var _a = this.itemsParentRef, parentOffsetTop = _a.offsetTop, parentScrollTop = _a.scrollTop, parentHeight = _a.clientHeight;
            // compute padding on parent element to ensure we always leave space
            var _b = this.getItemsParentPadding(), paddingTop = _b.paddingTop, paddingBottom = _b.paddingBottom;
            // compute the two edges of the active item for comparison, including parent padding
            var activeBottomEdge = activeTop + activeHeight + paddingBottom - parentOffsetTop;
            var activeTopEdge = activeTop - paddingTop - parentOffsetTop;
            if (activeBottomEdge >= parentScrollTop + parentHeight) {
                // offscreen bottom: align bottom of item with bottom of viewport
                this.itemsParentRef.scrollTop = activeBottomEdge + activeHeight - parentHeight;
            }
            else if (activeTopEdge <= parentScrollTop) {
                // offscreen top: align top of item with top of viewport
                this.itemsParentRef.scrollTop = activeTopEdge - activeHeight;
            }
        }
    };
    QueryList.prototype.setQuery = function (query, resetActiveItem, props) {
        if (resetActiveItem === void 0) { resetActiveItem = this.props.resetOnQuery; }
        if (props === void 0) { props = this.props; }
        var createNewItemFromQuery = props.createNewItemFromQuery;
        this.shouldCheckActiveItemInViewport = true;
        var hasQueryChanged = query !== this.state.query;
        if (hasQueryChanged) {
            safeInvoke(props.onQueryChange, query);
        }
        var filteredItems = getFilteredItems(query, props);
        var createNewItem = createNewItemFromQuery != null && query !== "" ? createNewItemFromQuery(query) : undefined;
        this.setState({ createNewItem: createNewItem, filteredItems: filteredItems, query: query });
        // always reset active item if it's now filtered or disabled
        var activeIndex = this.getActiveIndex(filteredItems);
        var shouldUpdateActiveItem = resetActiveItem ||
            activeIndex < 0 ||
            isItemDisabled(getActiveItem(this.state.activeItem), activeIndex, props.itemDisabled);
        if (shouldUpdateActiveItem) {
            this.setActiveItem(getFirstEnabledItem(filteredItems, props.itemDisabled));
        }
    };
    QueryList.prototype.getActiveElement = function () {
        var activeItem = this.state.activeItem;
        if (this.itemsParentRef != null) {
            if (isCreateNewItem(activeItem)) {
                return this.itemsParentRef.children.item(this.state.filteredItems.length);
            }
            else {
                var activeIndex = this.getActiveIndex();
                return this.itemsParentRef.children.item(activeIndex);
            }
        }
        return undefined;
    };
    QueryList.prototype.getActiveIndex = function (items) {
        if (items === void 0) { items = this.state.filteredItems; }
        var activeItem = this.state.activeItem;
        if (activeItem == null || isCreateNewItem(activeItem)) {
            return -1;
        }
        // NOTE: this operation is O(n) so it should be avoided in render(). safe for events though.
        for (var i = 0; i < items.length; ++i) {
            if (executeItemsEqual(this.props.itemsEqual, items[i], activeItem)) {
                return i;
            }
        }
        return -1;
    };
    QueryList.prototype.getItemsParentPadding = function () {
        // assert ref exists because it was checked before calling
        var _a = getComputedStyle(this.itemsParentRef), paddingTop = _a.paddingTop, paddingBottom = _a.paddingBottom;
        return {
            paddingBottom: pxToNumber(paddingBottom),
            paddingTop: pxToNumber(paddingTop),
        };
    };
    /**
     * Get the next enabled item, moving in the given direction from the start
     * index. A `null` return value means no suitable item was found.
     * @param direction amount to move in each iteration, typically +/-1
     * @param startIndex item to start iteration
     */
    QueryList.prototype.getNextActiveItem = function (direction, startIndex) {
        if (startIndex === void 0) { startIndex = this.getActiveIndex(); }
        if (this.isCreateItemRendered()) {
            var reachedCreate = (startIndex === 0 && direction === -1) ||
                (startIndex === this.state.filteredItems.length - 1 && direction === 1);
            if (reachedCreate) {
                return getCreateNewItem();
            }
        }
        return getFirstEnabledItem(this.state.filteredItems, this.props.itemDisabled, direction, startIndex);
    };
    QueryList.prototype.setActiveItem = function (activeItem) {
        this.expectedNextActiveItem = activeItem;
        if (this.props.activeItem === undefined) {
            // indicate that the active item may need to be scrolled into view after update.
            this.shouldCheckActiveItemInViewport = true;
            this.setState({ activeItem: activeItem });
        }
        if (isCreateNewItem(activeItem)) {
            safeInvoke(this.props.onActiveItemChange, null, true);
        }
        else {
            safeInvoke(this.props.onActiveItemChange, activeItem, false);
        }
    };
    QueryList.prototype.isCreateItemRendered = function () {
        return (this.canCreateItems() &&
            this.state.query !== "" &&
            // this check is unfortunately O(N) on the number of items, but
            // alas, hiding the "Create Item" option when it exactly matches an
            // existing item is much clearer.
            !this.wouldCreatedItemMatchSomeExistingItem());
    };
    QueryList.prototype.canCreateItems = function () {
        return this.props.createNewItemFromQuery != null && this.props.createNewItemRenderer != null;
    };
    QueryList.prototype.wouldCreatedItemMatchSomeExistingItem = function () {
        var _this = this;
        // search only the filtered items, not the full items list, because we
        // only need to check items that match the current query.
        return this.state.filteredItems.some(function (item) {
            return executeItemsEqual(_this.props.itemsEqual, item, _this.state.createNewItem);
        });
    };
    QueryList.displayName = DISPLAYNAME_PREFIX + ".QueryList";
    QueryList.defaultProps = {
        disabled: false,
        resetOnQuery: true,
    };
    return QueryList;
}(AbstractComponent2));
function pxToNumber(value) {
    return value == null ? 0 : parseInt(value.slice(0, -2), 10);
}
function getMatchingItem(query, _a) {
    var items = _a.items, itemPredicate = _a.itemPredicate;
    if (isFunction(itemPredicate)) {
        // .find() doesn't exist in ES5. Alternative: use a for loop instead of
        // .filter() so that we can return as soon as we find the first match.
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (itemPredicate(query, item, i, true)) {
                return item;
            }
        }
    }
    return undefined;
}
function getFilteredItems(query, _a) {
    var items = _a.items, itemPredicate = _a.itemPredicate, itemListPredicate = _a.itemListPredicate;
    if (isFunction(itemListPredicate)) {
        // note that implementations can reorder the items here
        return itemListPredicate(query, items);
    }
    else if (isFunction(itemPredicate)) {
        return items.filter(function (item, index) { return itemPredicate(query, item, index); });
    }
    return items;
}
/** Wrap number around min/max values: if it exceeds one bound, return the other. */
function wrapNumber(value, min, max) {
    if (value < min) {
        return max;
    }
    else if (value > max) {
        return min;
    }
    return value;
}
function isItemDisabled(item, index, itemDisabled) {
    if (itemDisabled == null || item == null) {
        return false;
    }
    else if (isFunction(itemDisabled)) {
        return itemDisabled(item, index);
    }
    return !!item[itemDisabled];
}
/**
 * Get the next enabled item, moving in the given direction from the start
 * index. A `null` return value means no suitable item was found.
 * @param items the list of items
 * @param itemDisabled callback to determine if a given item is disabled
 * @param direction amount to move in each iteration, typically +/-1
 * @param startIndex which index to begin moving from
 */
function getFirstEnabledItem(items, itemDisabled, direction, startIndex) {
    if (direction === void 0) { direction = 1; }
    if (startIndex === void 0) { startIndex = items.length - 1; }
    if (items.length === 0) {
        return null;
    }
    // remember where we started to prevent an infinite loop
    var index = startIndex;
    var maxIndex = items.length - 1;
    do {
        // find first non-disabled item
        index = wrapNumber(index + direction, 0, maxIndex);
        if (!isItemDisabled(items[index], index, itemDisabled)) {
            return items[index];
        }
    } while (index !== startIndex && startIndex !== -1);
    return null;
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
var Omnibar = /** @class */ (function (_super) {
    __extends(Omnibar, _super);
    function Omnibar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.TypedQueryList = QueryList.ofType();
        _this.renderQueryList = function (listProps) {
            var _a = _this.props, _b = _a.inputProps, inputProps = _b === void 0 ? {} : _b, isOpen = _a.isOpen, _c = _a.overlayProps, overlayProps = _c === void 0 ? {} : _c;
            var handleKeyDown = listProps.handleKeyDown, handleKeyUp = listProps.handleKeyUp;
            var handlers = isOpen ? { onKeyDown: handleKeyDown, onKeyUp: handleKeyUp } : {};
            return (createElement(Overlay, __assign({ hasBackdrop: true }, overlayProps, { isOpen: isOpen, className: cx(OMNIBAR_OVERLAY, overlayProps.className), onClose: _this.handleOverlayClose }),
                createElement("div", __assign({ className: cx(OMNIBAR, listProps.className) }, handlers),
                    createElement(InputGroup, __assign({ autoFocus: true, large: true, leftIcon: "search", placeholder: "Search..." }, inputProps, { onChange: listProps.handleQueryChange, value: listProps.query })),
                    listProps.itemList)));
        };
        _this.handleOverlayClose = function (event) {
            safeInvokeMember(_this.props.overlayProps, "onClose", event);
            safeInvoke(_this.props.onClose, event);
        };
        return _this;
    }
    Omnibar.ofType = function () {
        return Omnibar;
    };
    Omnibar.prototype.render = function () {
        // omit props specific to this component, spread the rest.
        var _a = this.props, _b = _a.initialContent, initialContent = _b === void 0 ? null : _b, isOpen = _a.isOpen, inputProps = _a.inputProps, overlayProps = _a.overlayProps, restProps = __rest(_a, ["initialContent", "isOpen", "inputProps", "overlayProps"]);
        return createElement(this.TypedQueryList, __assign({}, restProps, { initialContent: initialContent, renderer: this.renderQueryList }));
    };
    Omnibar.displayName = DISPLAYNAME_PREFIX + ".Omnibar";
    return Omnibar;
}(PureComponent));

/*
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
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
var MultiSelect = /** @class */ (function (_super) {
    __extends(MultiSelect, _super);
    function MultiSelect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isOpen: (_this.props.popoverProps && _this.props.popoverProps.isOpen) || false,
        };
        _this.TypedQueryList = QueryList.ofType();
        _this.input = null;
        _this.queryList = null;
        _this.refHandlers = {
            input: function (ref) {
                _this.input = ref;
                safeInvokeMember(_this.props.tagInputProps, "inputRef", ref);
            },
            queryList: function (ref) { return (_this.queryList = ref); },
        };
        _this.renderQueryList = function (listProps) {
            var _a = _this.props, fill = _a.fill, _b = _a.tagInputProps, tagInputProps = _b === void 0 ? {} : _b, _c = _a.popoverProps, popoverProps = _c === void 0 ? {} : _c, _d = _a.selectedItems, selectedItems = _d === void 0 ? [] : _d, placeholder = _a.placeholder;
            var handlePaste = listProps.handlePaste, handleKeyDown = listProps.handleKeyDown, handleKeyUp = listProps.handleKeyUp;
            if (fill) {
                popoverProps.fill = true;
                tagInputProps.fill = true;
            }
            // add our own inputProps.className so that we can reference it in event handlers
            var _e = tagInputProps.inputProps, inputProps = _e === void 0 ? {} : _e;
            inputProps.className = cx(inputProps.className, MULTISELECT_TAG_INPUT_INPUT);
            var handleTagInputAdd = function (values, method) {
                if (method === "paste") {
                    handlePaste(values);
                }
            };
            return (createElement(Popover, __assign({ autoFocus: false, canEscapeKeyClose: true, enforceFocus: false, isOpen: _this.state.isOpen, position: Position.BOTTOM_LEFT }, popoverProps, { className: cx(listProps.className, popoverProps.className), onInteraction: _this.handlePopoverInteraction, popoverClassName: cx(MULTISELECT_POPOVER, popoverProps.popoverClassName), onOpened: _this.handlePopoverOpened }),
                createElement("div", { onKeyDown: _this.getTagInputKeyDownHandler(handleKeyDown), onKeyUp: _this.getTagInputKeyUpHandler(handleKeyUp) },
                    createElement(TagInput, __assign({ placeholder: placeholder }, tagInputProps, { className: cx(MULTISELECT, tagInputProps.className), inputRef: _this.refHandlers.input, inputProps: inputProps, inputValue: listProps.query, onAdd: handleTagInputAdd, onInputChange: listProps.handleQueryChange, values: selectedItems.map(_this.props.tagRenderer) }))),
                createElement("div", { onKeyDown: handleKeyDown, onKeyUp: handleKeyUp }, listProps.itemList)));
        };
        _this.handleItemSelect = function (item, evt) {
            if (_this.input != null) {
                _this.input.focus();
            }
            safeInvoke(_this.props.onItemSelect, item, evt);
        };
        _this.handleQueryChange = function (query, evt) {
            _this.setState({ isOpen: query.length > 0 || !_this.props.openOnKeyDown });
            safeInvoke(_this.props.onQueryChange, query, evt);
        };
        _this.handlePopoverInteraction = function (nextOpenState) {
            // deferring to rAF to get properly updated document.activeElement
            return requestAnimationFrame(function () {
                if (_this.input != null && _this.input !== document.activeElement) {
                    // the input is no longer focused so we can close the popover
                    _this.setState({ isOpen: false });
                }
                else if (!_this.props.openOnKeyDown) {
                    // open the popover when focusing the tag input
                    _this.setState({ isOpen: true });
                }
                safeInvokeMember(_this.props.popoverProps, "onInteraction", nextOpenState);
            });
        };
        _this.handlePopoverOpened = function (node) {
            if (_this.queryList != null) {
                // scroll active item into view after popover transition completes and all dimensions are stable.
                _this.queryList.scrollActiveItemIntoView();
            }
            safeInvokeMember(_this.props.popoverProps, "onOpened", node);
        };
        _this.getTagInputKeyDownHandler = function (handleQueryListKeyDown) {
            return function (e) {
                var which = e.which;
                if (which === ESCAPE || which === TAB) {
                    // By default the escape key will not trigger a blur on the
                    // input element. It must be done explicitly.
                    if (_this.input != null) {
                        _this.input.blur();
                    }
                    _this.setState({ isOpen: false });
                }
                else if (!(which === BACKSPACE || which === ARROW_LEFT || which === ARROW_RIGHT)) {
                    _this.setState({ isOpen: true });
                }
                var isTargetingTagRemoveButton = e.target.closest("." + TAG_REMOVE) != null;
                if (_this.state.isOpen && !isTargetingTagRemoveButton) {
                    safeInvoke(handleQueryListKeyDown, e);
                }
            };
        };
        _this.getTagInputKeyUpHandler = function (handleQueryListKeyUp) {
            return function (e) {
                var isTargetingInput = e.target.classList.contains(MULTISELECT_TAG_INPUT_INPUT);
                // only handle events when the focus is on the actual <input> inside the TagInput, as that's
                // what QueryList is designed to do
                if (_this.state.isOpen && isTargetingInput) {
                    safeInvoke(handleQueryListKeyUp, e);
                }
            };
        };
        return _this;
    }
    MultiSelect.ofType = function () {
        return MultiSelect;
    };
    MultiSelect.prototype.render = function () {
        // omit props specific to this component, spread the rest.
        var _a = this.props, openOnKeyDown = _a.openOnKeyDown, popoverProps = _a.popoverProps, tagInputProps = _a.tagInputProps, restProps = __rest(_a, ["openOnKeyDown", "popoverProps", "tagInputProps"]);
        return (createElement(this.TypedQueryList, __assign({}, restProps, { onItemSelect: this.handleItemSelect, onQueryChange: this.handleQueryChange, ref: this.refHandlers.queryList, renderer: this.renderQueryList })));
    };
    MultiSelect.displayName = DISPLAYNAME_PREFIX + ".MultiSelect";
    MultiSelect.defaultProps = {
        fill: false,
        placeholder: "Search...",
    };
    return MultiSelect;
}(PureComponent));

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
var Select = /** @class */ (function (_super) {
    __extends(Select, _super);
    function Select() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { isOpen: false };
        _this.TypedQueryList = QueryList.ofType();
        _this.input = null;
        _this.queryList = null;
        _this.refHandlers = {
            input: function (ref) {
                _this.input = ref;
                safeInvokeMember(_this.props.inputProps, "inputRef", ref);
            },
            queryList: function (ref) { return (_this.queryList = ref); },
        };
        _this.renderQueryList = function (listProps) {
            // not using defaultProps cuz they're hard to type with generics (can't use <T> on static members)
            var _a = _this.props, _b = _a.filterable, filterable = _b === void 0 ? true : _b, _c = _a.disabled, disabled = _c === void 0 ? false : _c, _d = _a.inputProps, inputProps = _d === void 0 ? {} : _d, _e = _a.popoverProps, popoverProps = _e === void 0 ? {} : _e;
            var input = (createElement(InputGroup, __assign({ leftIcon: "search", placeholder: "Filter...", rightElement: _this.maybeRenderClearButton(listProps.query) }, inputProps, { inputRef: _this.refHandlers.input, onChange: listProps.handleQueryChange, value: listProps.query })));
            var handleKeyDown = listProps.handleKeyDown, handleKeyUp = listProps.handleKeyUp;
            return (createElement(Popover, __assign({ autoFocus: false, enforceFocus: false, isOpen: _this.state.isOpen, disabled: disabled, position: Position.BOTTOM_LEFT }, popoverProps, { className: cx(listProps.className, popoverProps.className), onInteraction: _this.handlePopoverInteraction, popoverClassName: cx(SELECT_POPOVER, popoverProps.popoverClassName), onOpening: _this.handlePopoverOpening, onOpened: _this.handlePopoverOpened, onClosing: _this.handlePopoverClosing }),
                createElement("div", { onKeyDown: _this.state.isOpen ? handleKeyDown : _this.handleTargetKeyDown, onKeyUp: _this.state.isOpen ? handleKeyUp : undefined }, _this.props.children),
                createElement("div", { onKeyDown: handleKeyDown, onKeyUp: handleKeyUp },
                    filterable ? input : undefined,
                    listProps.itemList)));
        };
        _this.handleTargetKeyDown = function (event) {
            // open popover when arrow key pressed on target while closed
            if (event.which === ARROW_UP || event.which === ARROW_DOWN) {
                event.preventDefault();
                _this.setState({ isOpen: true });
            }
        };
        _this.handleItemSelect = function (item, event) {
            _this.setState({ isOpen: false });
            safeInvoke(_this.props.onItemSelect, item, event);
        };
        _this.handlePopoverInteraction = function (isOpen) {
            _this.setState({ isOpen: isOpen });
            safeInvokeMember(_this.props.popoverProps, "onInteraction", isOpen);
        };
        _this.handlePopoverOpening = function (node) {
            // save currently focused element before popover steals focus, so we can restore it when closing.
            _this.previousFocusedElement = document.activeElement;
            if (_this.props.resetOnClose) {
                _this.resetQuery();
            }
            safeInvokeMember(_this.props.popoverProps, "onOpening", node);
        };
        _this.handlePopoverOpened = function (node) {
            // scroll active item into view after popover transition completes and all dimensions are stable.
            if (_this.queryList != null) {
                _this.queryList.scrollActiveItemIntoView();
            }
            requestAnimationFrame(function () {
                var _a = _this.props.inputProps, inputProps = _a === void 0 ? {} : _a;
                // autofocus is enabled by default
                if (inputProps.autoFocus !== false && _this.input != null) {
                    _this.input.focus();
                }
            });
            safeInvokeMember(_this.props.popoverProps, "onOpened", node);
        };
        _this.handlePopoverClosing = function (node) {
            // restore focus to saved element.
            // timeout allows popover to begin closing and remove focus handlers beforehand.
            requestAnimationFrame(function () {
                if (_this.previousFocusedElement !== undefined) {
                    _this.previousFocusedElement.focus();
                    _this.previousFocusedElement = undefined;
                }
            });
            safeInvokeMember(_this.props.popoverProps, "onClosing", node);
        };
        _this.resetQuery = function () { return _this.queryList && _this.queryList.setQuery("", true); };
        return _this;
    }
    Select.ofType = function () {
        return Select;
    };
    Select.prototype.render = function () {
        // omit props specific to this component, spread the rest.
        var _a = this.props, filterable = _a.filterable, inputProps = _a.inputProps, popoverProps = _a.popoverProps, restProps = __rest(_a, ["filterable", "inputProps", "popoverProps"]);
        return (createElement(this.TypedQueryList, __assign({}, restProps, { onItemSelect: this.handleItemSelect, ref: this.refHandlers.queryList, renderer: this.renderQueryList })));
    };
    Select.prototype.componentDidUpdate = function (_prevProps, prevState) {
        if (this.state.isOpen && !prevState.isOpen && this.queryList != null) {
            this.queryList.scrollActiveItemIntoView();
        }
    };
    Select.prototype.maybeRenderClearButton = function (query) {
        return query.length > 0 ? createElement(Button, { icon: "cross", minimal: true, onClick: this.resetQuery }) : undefined;
    };
    Select.displayName = DISPLAYNAME_PREFIX + ".Select";
    return Select;
}(PureComponent));

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
var Suggest = /** @class */ (function (_super) {
    __extends(Suggest, _super);
    function Suggest() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            isOpen: (_this.props.popoverProps != null && _this.props.popoverProps.isOpen) || false,
            selectedItem: _this.getInitialSelectedItem(),
        };
        _this.TypedQueryList = QueryList.ofType();
        _this.input = null;
        _this.queryList = null;
        _this.refHandlers = {
            input: function (ref) {
                _this.input = ref;
                safeInvokeMember(_this.props.inputProps, "inputRef", ref);
            },
            queryList: function (ref) { return (_this.queryList = ref); },
        };
        _this.renderQueryList = function (listProps) {
            var _a = _this.props, fill = _a.fill, _b = _a.inputProps, inputProps = _b === void 0 ? {} : _b, _c = _a.popoverProps, popoverProps = _c === void 0 ? {} : _c;
            var _d = _this.state, isOpen = _d.isOpen, selectedItem = _d.selectedItem;
            var handleKeyDown = listProps.handleKeyDown, handleKeyUp = listProps.handleKeyUp;
            var _e = inputProps.autoComplete, autoComplete = _e === void 0 ? "off" : _e, _f = inputProps.placeholder, placeholder = _f === void 0 ? "Search..." : _f;
            var selectedItemText = selectedItem ? _this.props.inputValueRenderer(selectedItem) : "";
            // placeholder shows selected item while open.
            var inputPlaceholder = isOpen && selectedItemText ? selectedItemText : placeholder;
            // value shows query when open, and query remains when closed if nothing is selected.
            // if resetOnClose is enabled, then hide query when not open. (see handlePopoverOpening)
            var inputValue = isOpen
                ? listProps.query
                : selectedItemText || (_this.props.resetOnClose ? "" : listProps.query);
            if (fill) {
                popoverProps.fill = true;
                inputProps.fill = true;
            }
            return (createElement(Popover, __assign({ autoFocus: false, enforceFocus: false, isOpen: isOpen, position: Position.BOTTOM_LEFT }, popoverProps, { className: cx(listProps.className, popoverProps.className), onInteraction: _this.handlePopoverInteraction, popoverClassName: cx(SELECT_POPOVER, popoverProps.popoverClassName), onOpening: _this.handlePopoverOpening, onOpened: _this.handlePopoverOpened }),
                createElement(InputGroup, __assign({ autoComplete: autoComplete, disabled: _this.props.disabled }, inputProps, { inputRef: _this.refHandlers.input, onChange: listProps.handleQueryChange, onFocus: _this.handleInputFocus, onKeyDown: _this.getTargetKeyDownHandler(handleKeyDown), onKeyUp: _this.getTargetKeyUpHandler(handleKeyUp), placeholder: inputPlaceholder, value: inputValue })),
                createElement("div", { onKeyDown: handleKeyDown, onKeyUp: handleKeyUp }, listProps.itemList)));
        };
        _this.selectText = function () {
            // wait until the input is properly focused to select the text inside of it
            requestAnimationFrame(function () {
                if (_this.input != null) {
                    _this.input.setSelectionRange(0, _this.input.value.length);
                }
            });
        };
        _this.handleInputFocus = function (event) {
            _this.selectText();
            // TODO can we leverage Popover.openOnTargetFocus for this?
            if (!_this.props.openOnKeyDown) {
                _this.setState({ isOpen: true });
            }
            safeInvokeMember(_this.props.inputProps, "onFocus", event);
        };
        _this.handleItemSelect = function (item, event) {
            var nextOpenState;
            if (!_this.props.closeOnSelect) {
                if (_this.input != null) {
                    _this.input.focus();
                }
                _this.selectText();
                nextOpenState = true;
            }
            else {
                if (_this.input != null) {
                    _this.input.blur();
                }
                nextOpenState = false;
            }
            // the internal state should only change when uncontrolled.
            if (_this.props.selectedItem === undefined) {
                _this.setState({
                    isOpen: nextOpenState,
                    selectedItem: item,
                });
            }
            else {
                // otherwise just set the next open state.
                _this.setState({ isOpen: nextOpenState });
            }
            safeInvoke(_this.props.onItemSelect, item, event);
        };
        _this.handlePopoverInteraction = function (nextOpenState) {
            return requestAnimationFrame(function () {
                if (_this.input != null && _this.input !== document.activeElement) {
                    // the input is no longer focused so we can close the popover
                    _this.setState({ isOpen: false });
                }
                safeInvokeMember(_this.props.popoverProps, "onInteraction", nextOpenState);
            });
        };
        _this.handlePopoverOpening = function (node) {
            // reset query before opening instead of when closing to prevent flash of unfiltered items.
            // this is a limitation of the interactions between QueryList state and Popover transitions.
            if (_this.props.resetOnClose && _this.queryList) {
                _this.queryList.setQuery("", true);
            }
            safeInvokeMember(_this.props.popoverProps, "onOpening", node);
        };
        _this.handlePopoverOpened = function (node) {
            // scroll active item into view after popover transition completes and all dimensions are stable.
            if (_this.queryList != null) {
                _this.queryList.scrollActiveItemIntoView();
            }
            safeInvokeMember(_this.props.popoverProps, "onOpened", node);
        };
        _this.getTargetKeyDownHandler = function (handleQueryListKeyDown) {
            return function (evt) {
                var which = evt.which;
                if (which === ESCAPE || which === TAB) {
                    if (_this.input != null) {
                        _this.input.blur();
                    }
                    _this.setState({ isOpen: false });
                }
                else if (_this.props.openOnKeyDown &&
                    which !== BACKSPACE &&
                    which !== ARROW_LEFT &&
                    which !== ARROW_RIGHT) {
                    _this.setState({ isOpen: true });
                }
                if (_this.state.isOpen) {
                    safeInvoke(handleQueryListKeyDown, evt);
                }
                safeInvokeMember(_this.props.inputProps, "onKeyDown", evt);
            };
        };
        _this.getTargetKeyUpHandler = function (handleQueryListKeyUp) {
            return function (evt) {
                if (_this.state.isOpen) {
                    safeInvoke(handleQueryListKeyUp, evt);
                }
                safeInvokeMember(_this.props.inputProps, "onKeyUp", evt);
            };
        };
        return _this;
    }
    Suggest.ofType = function () {
        return Suggest;
    };
    Suggest.prototype.render = function () {
        // omit props specific to this component, spread the rest.
        var _a = this.props, disabled = _a.disabled, inputProps = _a.inputProps, popoverProps = _a.popoverProps, restProps = __rest(_a, ["disabled", "inputProps", "popoverProps"]);
        return (createElement(this.TypedQueryList, __assign({}, restProps, { onItemSelect: this.handleItemSelect, ref: this.refHandlers.queryList, renderer: this.renderQueryList })));
    };
    Suggest.prototype.componentDidUpdate = function (_prevProps, prevState) {
        // If the selected item prop changes, update the underlying state.
        if (this.props.selectedItem !== undefined && this.props.selectedItem !== this.state.selectedItem) {
            this.setState({ selectedItem: this.props.selectedItem });
        }
        if (this.state.isOpen && !prevState.isOpen && this.queryList != null) {
            this.queryList.scrollActiveItemIntoView();
        }
    };
    Suggest.prototype.getInitialSelectedItem = function () {
        // controlled > uncontrolled > default
        if (this.props.selectedItem !== undefined) {
            return this.props.selectedItem;
        }
        else if (this.props.defaultSelectedItem !== undefined) {
            return this.props.defaultSelectedItem;
        }
        else {
            return null;
        }
    };
    Suggest.displayName = DISPLAYNAME_PREFIX + ".Suggest";
    Suggest.defaultProps = {
        closeOnSelect: true,
        fill: false,
        openOnKeyDown: false,
        resetOnClose: false,
    };
    return Suggest;
}(PureComponent));

export { classes as Classes, MultiSelect, Omnibar, QueryList, Select, Suggest, executeItemsEqual, getActiveItem, getCreateNewItem, getFirstEnabledItem, isCreateNewItem, renderFilteredItems };
