import { R as React, C as Component } from './common/source.production-86e2832f.js';
import { b as assign, P as PropTypes } from './common/index-ed166f27.js';
import { c as cx } from './common/index-330529d6.js';

function callIfExists(func) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    return typeof func === 'function' && func.apply(undefined, args);
}

function hasOwnProp(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}

function uniqueId() {
    return Math.random().toString(36).substring(7);
}

var cssClasses = {
    menu: 'react-contextmenu',
    menuVisible: 'react-contextmenu--visible',
    menuWrapper: 'react-contextmenu-wrapper',
    menuItem: 'react-contextmenu-item',
    menuItemActive: 'react-contextmenu-item--active',
    menuItemDisabled: 'react-contextmenu-item--disabled',
    menuItemDivider: 'react-contextmenu-item--divider',
    menuItemSelected: 'react-contextmenu-item--selected',
    subMenu: 'react-contextmenu-submenu'
};

var store = {};

var canUseDOM = Boolean(typeof window !== 'undefined' && window.document && window.document.createElement);

var MENU_SHOW = 'REACT_CONTEXTMENU_SHOW';
var MENU_HIDE = 'REACT_CONTEXTMENU_HIDE';

function dispatchGlobalEvent(eventName, opts) {
    var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;

    // Compatibale with IE
    // @see http://stackoverflow.com/questions/26596123/internet-explorer-9-10-11-event-constructor-doesnt-work
    var event = void 0;

    if (typeof window.CustomEvent === 'function') {
        event = new window.CustomEvent(eventName, { detail: opts });
    } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(eventName, false, true, opts);
    }

    if (target) {
        target.dispatchEvent(event);
        assign(store, opts);
    }
}

function showMenu() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var target = arguments[1];

    dispatchGlobalEvent(MENU_SHOW, assign({}, opts, { type: MENU_SHOW }), target);
}

function hideMenu() {
    var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var target = arguments[1];

    dispatchGlobalEvent(MENU_HIDE, assign({}, opts, { type: MENU_HIDE }), target);
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GlobalEventListener = function GlobalEventListener() {
    var _this = this;

    _classCallCheck(this, GlobalEventListener);

    this.handleShowEvent = function (event) {
        for (var id in _this.callbacks) {
            if (hasOwnProp(_this.callbacks, id)) _this.callbacks[id].show(event);
        }
    };

    this.handleHideEvent = function (event) {
        for (var id in _this.callbacks) {
            if (hasOwnProp(_this.callbacks, id)) _this.callbacks[id].hide(event);
        }
    };

    this.register = function (showCallback, hideCallback) {
        var id = uniqueId();

        _this.callbacks[id] = {
            show: showCallback,
            hide: hideCallback
        };

        return id;
    };

    this.unregister = function (id) {
        if (id && _this.callbacks[id]) {
            delete _this.callbacks[id];
        }
    };

    this.callbacks = {};

    if (canUseDOM) {
        window.addEventListener(MENU_SHOW, this.handleShowEvent);
        window.addEventListener(MENU_HIDE, this.handleHideEvent);
    }
};

var listener = new GlobalEventListener();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MenuItem = function (_Component) {
    _inherits(MenuItem, _Component);

    function MenuItem() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck$1(this, MenuItem);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = MenuItem.__proto__ || Object.getPrototypeOf(MenuItem)).call.apply(_ref, [this].concat(args))), _this), _this.handleClick = function (event) {
            if (event.button !== 0 && event.button !== 1) {
                event.preventDefault();
            }

            if (_this.props.disabled || _this.props.divider) return;

            callIfExists(_this.props.onClick, event, assign({}, _this.props.data, store.data), store.target);

            if (_this.props.preventClose) return;

            hideMenu();
        }, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(MenuItem, [{
        key: 'render',
        value: function render() {
            var _cx,
                _this2 = this;

            var _props = this.props,
                attributes = _props.attributes,
                children = _props.children,
                className = _props.className,
                disabled = _props.disabled,
                divider = _props.divider,
                selected = _props.selected;


            var menuItemClassNames = cx(className, cssClasses.menuItem, attributes.className, (_cx = {}, _defineProperty(_cx, cx(cssClasses.menuItemDisabled, attributes.disabledClassName), disabled), _defineProperty(_cx, cx(cssClasses.menuItemDivider, attributes.dividerClassName), divider), _defineProperty(_cx, cx(cssClasses.menuItemSelected, attributes.selectedClassName), selected), _cx));

            return React.createElement(
                'div',
                _extends({}, attributes, { className: menuItemClassNames,
                    role: 'menuitem', tabIndex: '-1', 'aria-disabled': disabled ? 'true' : 'false',
                    'aria-orientation': divider ? 'horizontal' : null,
                    ref: function ref(_ref2) {
                        _this2.ref = _ref2;
                    },
                    onMouseMove: this.props.onMouseMove, onMouseLeave: this.props.onMouseLeave,
                    onTouchEnd: this.handleClick, onClick: this.handleClick }),
                divider ? null : children
            );
        }
    }]);

    return MenuItem;
}(Component);

MenuItem.propTypes = {
    attributes: PropTypes.object,
    children: PropTypes.node,
    className: PropTypes.string,
    data: PropTypes.object,
    disabled: PropTypes.bool,
    divider: PropTypes.bool,
    onClick: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onMouseMove: PropTypes.func,
    preventClose: PropTypes.bool,
    selected: PropTypes.bool
};
MenuItem.defaultProps = {
    attributes: {},
    children: null,
    className: '',
    data: {},
    disabled: false,
    divider: false,
    onClick: function onClick() {
        return null;
    },

    onMouseMove: function onMouseMove() {
        return null;
    },
    onMouseLeave: function onMouseLeave() {
        return null;
    },
    preventClose: false,
    selected: false
};

function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$1(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AbstractMenu = function (_Component) {
    _inherits$1(AbstractMenu, _Component);

    function AbstractMenu(props) {
        _classCallCheck$2(this, AbstractMenu);

        var _this = _possibleConstructorReturn$1(this, (AbstractMenu.__proto__ || Object.getPrototypeOf(AbstractMenu)).call(this, props));

        _initialiseProps.call(_this);

        _this.seletedItemRef = null;
        _this.state = {
            selectedItem: null,
            forceSubMenuOpen: false
        };
        return _this;
    }

    return AbstractMenu;
}(Component);

AbstractMenu.propTypes = {
    children: PropTypes.node.isRequired
};

var _initialiseProps = function _initialiseProps() {
    var _this2 = this;

    this.handleKeyNavigation = function (e) {
        // check for isVisible strictly here as it might be undefined when this code executes in the context of SubMenu
        // but we only need to check when it runs in the ContextMenu context
        if (_this2.state.isVisible === false) {
            return;
        }

        switch (e.keyCode) {
            case 37: // left arrow
            case 27:
                // escape
                e.preventDefault();
                _this2.hideMenu(e);
                break;
            case 38:
                // up arrow
                e.preventDefault();
                _this2.selectChildren(true);
                break;
            case 40:
                // down arrow
                e.preventDefault();
                _this2.selectChildren(false);
                break;
            case 39:
                // right arrow
                _this2.tryToOpenSubMenu(e);
                break;
            case 13:
                // enter
                e.preventDefault();
                _this2.tryToOpenSubMenu(e);
                {
                    // determine the selected item is disabled or not
                    var disabled = _this2.seletedItemRef && _this2.seletedItemRef.props && _this2.seletedItemRef.props.disabled;

                    if (_this2.seletedItemRef && _this2.seletedItemRef.ref instanceof HTMLElement && !disabled) {
                        _this2.seletedItemRef.ref.click();
                    } else {
                        _this2.hideMenu(e);
                    }
                }
                break;
            // do nothing
        }
    };

    this.handleForceClose = function () {
        _this2.setState({ forceSubMenuOpen: false });
    };

    this.tryToOpenSubMenu = function (e) {
        if (_this2.state.selectedItem && _this2.state.selectedItem.type === _this2.getSubMenuType()) {
            e.preventDefault();
            _this2.setState({ forceSubMenuOpen: true });
        }
    };

    this.selectChildren = function (forward) {
        var selectedItem = _this2.state.selectedItem;

        var children = [];
        var disabledChildrenCount = 0;
        var disabledChildIndexes = {};

        var childCollector = function childCollector(child, index) {
            // child can be empty in case you do conditional rendering of components, in which
            // case it should not be accounted for as a real child
            if (!child) {
                return;
            }

            if ([MenuItem, _this2.getSubMenuType()].indexOf(child.type) < 0) {
                // Maybe the MenuItem or SubMenu is capsuled in a wrapper div or something else
                React.Children.forEach(child.props.children, childCollector);
            } else if (!child.props.divider) {
                if (child.props.disabled) {
                    ++disabledChildrenCount;
                    disabledChildIndexes[index] = true;
                }

                children.push(child);
            }
        };

        React.Children.forEach(_this2.props.children, childCollector);
        if (disabledChildrenCount === children.length) {
            // All menu items are disabled, so none can be selected, don't do anything
            return;
        }

        function findNextEnabledChildIndex(currentIndex) {
            var i = currentIndex;
            var incrementCounter = function incrementCounter() {
                if (forward) {
                    --i;
                } else {
                    ++i;
                }

                if (i < 0) {
                    i = children.length - 1;
                } else if (i >= children.length) {
                    i = 0;
                }
            };

            do {
                incrementCounter();
            } while (i !== currentIndex && disabledChildIndexes[i]);

            return i === currentIndex ? null : i;
        }

        var currentIndex = children.indexOf(selectedItem);
        var nextEnabledChildIndex = findNextEnabledChildIndex(currentIndex);

        if (nextEnabledChildIndex !== null) {
            _this2.setState({
                selectedItem: children[nextEnabledChildIndex],
                forceSubMenuOpen: false
            });
        }
    };

    this.onChildMouseMove = function (child) {
        if (_this2.state.selectedItem !== child) {
            _this2.setState({ selectedItem: child, forceSubMenuOpen: false });
        }
    };

    this.onChildMouseLeave = function () {
        _this2.setState({ selectedItem: null, forceSubMenuOpen: false });
    };

    this.renderChildren = function (children) {
        return React.Children.map(children, function (child) {
            var props = {};
            if (!React.isValidElement(child)) return child;
            if ([MenuItem, _this2.getSubMenuType()].indexOf(child.type) < 0) {
                // Maybe the MenuItem or SubMenu is capsuled in a wrapper div or something else
                props.children = _this2.renderChildren(child.props.children);
                return React.cloneElement(child, props);
            }
            props.onMouseLeave = _this2.onChildMouseLeave.bind(_this2);
            if (child.type === _this2.getSubMenuType()) {
                // special props for SubMenu only
                props.forceOpen = _this2.state.forceSubMenuOpen && _this2.state.selectedItem === child;
                props.forceClose = _this2.handleForceClose;
                props.parentKeyNavigationHandler = _this2.handleKeyNavigation;
            }
            if (!child.props.divider && _this2.state.selectedItem === child) {
                // special props for selected item only
                props.selected = true;
                props.ref = function (ref) {
                    _this2.seletedItemRef = ref;
                };
                return React.cloneElement(child, props);
            }
            // onMouseMove is only needed for non selected items
            props.onMouseMove = function () {
                return _this2.onChildMouseMove(child);
            };
            return React.cloneElement(child, props);
        });
    };
};

var _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$2(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$2(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SubMenu = function (_AbstractMenu) {
    _inherits$2(SubMenu, _AbstractMenu);

    function SubMenu(props) {
        _classCallCheck$3(this, SubMenu);

        var _this = _possibleConstructorReturn$2(this, (SubMenu.__proto__ || Object.getPrototypeOf(SubMenu)).call(this, props));

        _this.getMenuPosition = function () {
            var _window = window,
                innerWidth = _window.innerWidth,
                innerHeight = _window.innerHeight;

            var rect = _this.subMenu.getBoundingClientRect();
            var position = {};

            if (rect.bottom > innerHeight) {
                position.bottom = 0;
            } else {
                position.top = 0;
            }

            if (rect.right < innerWidth) {
                position.left = '100%';
            } else {
                position.right = '100%';
            }

            return position;
        };

        _this.getRTLMenuPosition = function () {
            var _window2 = window,
                innerHeight = _window2.innerHeight;

            var rect = _this.subMenu.getBoundingClientRect();
            var position = {};

            if (rect.bottom > innerHeight) {
                position.bottom = 0;
            } else {
                position.top = 0;
            }

            if (rect.left < 0) {
                position.left = '100%';
            } else {
                position.right = '100%';
            }

            return position;
        };

        _this.hideSubMenu = function (e) {
            // avoid closing submenus of a different menu tree
            if (e.detail && e.detail.id && _this.menu && e.detail.id !== _this.menu.id) {
                return;
            }

            if (_this.props.forceOpen) {
                _this.props.forceClose();
            }
            _this.setState({ visible: false, selectedItem: null });
            _this.unregisterHandlers();
        };

        _this.handleClick = function (event) {
            event.preventDefault();

            if (_this.props.disabled) return;

            callIfExists(_this.props.onClick, event, assign({}, _this.props.data, store.data), store.target);

            if (!_this.props.onClick || _this.props.preventCloseOnClick) return;

            hideMenu();
        };

        _this.handleMouseEnter = function () {
            if (_this.closetimer) clearTimeout(_this.closetimer);

            if (_this.props.disabled || _this.state.visible) return;

            _this.opentimer = setTimeout(function () {
                return _this.setState({
                    visible: true,
                    selectedItem: null
                });
            }, _this.props.hoverDelay);
        };

        _this.handleMouseLeave = function () {
            if (_this.opentimer) clearTimeout(_this.opentimer);

            if (!_this.state.visible) return;

            _this.closetimer = setTimeout(function () {
                return _this.setState({
                    visible: false,
                    selectedItem: null
                });
            }, _this.props.hoverDelay);
        };

        _this.menuRef = function (c) {
            _this.menu = c;
        };

        _this.subMenuRef = function (c) {
            _this.subMenu = c;
        };

        _this.registerHandlers = function () {
            document.removeEventListener('keydown', _this.props.parentKeyNavigationHandler);
            document.addEventListener('keydown', _this.handleKeyNavigation);
        };

        _this.unregisterHandlers = function (dismounting) {
            document.removeEventListener('keydown', _this.handleKeyNavigation);
            if (!dismounting) {
                document.addEventListener('keydown', _this.props.parentKeyNavigationHandler);
            }
        };

        _this.state = assign({}, _this.state, {
            visible: false
        });
        return _this;
    }

    _createClass$1(SubMenu, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.listenId = listener.register(function () {}, this.hideSubMenu);
        }
    }, {
        key: 'getSubMenuType',
        value: function getSubMenuType() {
            // eslint-disable-line class-methods-use-this
            return SubMenu;
        }
    }, {
        key: 'shouldComponentUpdate',
        value: function shouldComponentUpdate(nextProps, nextState) {
            this.isVisibilityChange = (this.state.visible !== nextState.visible || this.props.forceOpen !== nextProps.forceOpen) && !(this.state.visible && nextProps.forceOpen) && !(this.props.forceOpen && nextState.visible);
            return true;
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            var _this2 = this;

            if (!this.isVisibilityChange) return;
            if (this.props.forceOpen || this.state.visible) {
                var wrapper = window.requestAnimationFrame || setTimeout;
                wrapper(function () {
                    var styles = _this2.props.rtl ? _this2.getRTLMenuPosition() : _this2.getMenuPosition();

                    _this2.subMenu.style.removeProperty('top');
                    _this2.subMenu.style.removeProperty('bottom');
                    _this2.subMenu.style.removeProperty('left');
                    _this2.subMenu.style.removeProperty('right');

                    if (hasOwnProp(styles, 'top')) _this2.subMenu.style.top = styles.top;
                    if (hasOwnProp(styles, 'left')) _this2.subMenu.style.left = styles.left;
                    if (hasOwnProp(styles, 'bottom')) _this2.subMenu.style.bottom = styles.bottom;
                    if (hasOwnProp(styles, 'right')) _this2.subMenu.style.right = styles.right;
                    _this2.subMenu.classList.add(cssClasses.menuVisible);

                    _this2.registerHandlers();
                    _this2.setState({ selectedItem: null });
                });
            } else {
                var cleanup = function cleanup() {
                    _this2.subMenu.removeEventListener('transitionend', cleanup);
                    _this2.subMenu.style.removeProperty('bottom');
                    _this2.subMenu.style.removeProperty('right');
                    _this2.subMenu.style.top = 0;
                    _this2.subMenu.style.left = '100%';
                    _this2.unregisterHandlers();
                };
                this.subMenu.addEventListener('transitionend', cleanup);
                this.subMenu.classList.remove(cssClasses.menuVisible);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.listenId) {
                listener.unregister(this.listenId);
            }

            if (this.opentimer) clearTimeout(this.opentimer);

            if (this.closetimer) clearTimeout(this.closetimer);

            this.unregisterHandlers(true);
        }
    }, {
        key: 'render',
        value: function render() {
            var _cx;

            var _props = this.props,
                children = _props.children,
                attributes = _props.attributes,
                disabled = _props.disabled,
                title = _props.title,
                selected = _props.selected;
            var visible = this.state.visible;

            var menuProps = {
                ref: this.menuRef,
                onMouseEnter: this.handleMouseEnter,
                onMouseLeave: this.handleMouseLeave,
                className: cx(cssClasses.menuItem, cssClasses.subMenu, attributes.listClassName),
                style: {
                    position: 'relative'
                }
            };
            var menuItemProps = {
                className: cx(cssClasses.menuItem, attributes.className, (_cx = {}, _defineProperty$1(_cx, cx(cssClasses.menuItemDisabled, attributes.disabledClassName), disabled), _defineProperty$1(_cx, cx(cssClasses.menuItemActive, attributes.visibleClassName), visible), _defineProperty$1(_cx, cx(cssClasses.menuItemSelected, attributes.selectedClassName), selected), _cx)),
                onMouseMove: this.props.onMouseMove,
                onMouseOut: this.props.onMouseOut,
                onClick: this.handleClick
            };
            var subMenuProps = {
                ref: this.subMenuRef,
                style: {
                    position: 'absolute',
                    transition: 'opacity 1ms', // trigger transitionend event
                    top: 0,
                    left: '100%'
                },
                className: cx(cssClasses.menu, this.props.className)
            };

            return React.createElement(
                'nav',
                _extends$1({}, menuProps, { role: 'menuitem', tabIndex: '-1', 'aria-haspopup': 'true' }),
                React.createElement(
                    'div',
                    _extends$1({}, attributes, menuItemProps),
                    title
                ),
                React.createElement(
                    'nav',
                    _extends$1({}, subMenuProps, { role: 'menu', tabIndex: '-1' }),
                    this.renderChildren(children)
                )
            );
        }
    }]);

    return SubMenu;
}(AbstractMenu);

SubMenu.propTypes = {
    children: PropTypes.node.isRequired,
    attributes: PropTypes.object,
    title: PropTypes.node.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    hoverDelay: PropTypes.number,
    rtl: PropTypes.bool,
    selected: PropTypes.bool,
    onMouseMove: PropTypes.func,
    onMouseOut: PropTypes.func,
    forceOpen: PropTypes.bool,
    forceClose: PropTypes.func,
    parentKeyNavigationHandler: PropTypes.func
};
SubMenu.defaultProps = {
    disabled: false,
    hoverDelay: 500,
    attributes: {},
    className: '',
    rtl: false,
    selected: false,
    onMouseMove: function onMouseMove() {
        return null;
    },
    onMouseOut: function onMouseOut() {
        return null;
    },
    forceOpen: false,
    forceClose: function forceClose() {
        return null;
    },
    parentKeyNavigationHandler: function parentKeyNavigationHandler() {
        return null;
    }
};

var _createClass$2 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty$2(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$3(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$3(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ContextMenu = function (_AbstractMenu) {
    _inherits$3(ContextMenu, _AbstractMenu);

    function ContextMenu(props) {
        _classCallCheck$4(this, ContextMenu);

        var _this = _possibleConstructorReturn$3(this, (ContextMenu.__proto__ || Object.getPrototypeOf(ContextMenu)).call(this, props));

        _this.registerHandlers = function () {
            document.addEventListener('mousedown', _this.handleOutsideClick);
            document.addEventListener('touchstart', _this.handleOutsideClick);
            if (!_this.props.preventHideOnScroll) document.addEventListener('scroll', _this.handleHide);
            if (!_this.props.preventHideOnContextMenu) document.addEventListener('contextmenu', _this.handleHide);
            document.addEventListener('keydown', _this.handleKeyNavigation);
            if (!_this.props.preventHideOnResize) window.addEventListener('resize', _this.handleHide);
        };

        _this.unregisterHandlers = function () {
            document.removeEventListener('mousedown', _this.handleOutsideClick);
            document.removeEventListener('touchstart', _this.handleOutsideClick);
            document.removeEventListener('scroll', _this.handleHide);
            document.removeEventListener('contextmenu', _this.handleHide);
            document.removeEventListener('keydown', _this.handleKeyNavigation);
            window.removeEventListener('resize', _this.handleHide);
        };

        _this.handleShow = function (e) {
            if (e.detail.id !== _this.props.id || _this.state.isVisible) return;

            var _e$detail$position = e.detail.position,
                x = _e$detail$position.x,
                y = _e$detail$position.y;


            _this.setState({ isVisible: true, x: x, y: y });
            _this.registerHandlers();
            callIfExists(_this.props.onShow, e);
        };

        _this.handleHide = function (e) {
            if (_this.state.isVisible && (!e.detail || !e.detail.id || e.detail.id === _this.props.id)) {
                _this.unregisterHandlers();
                _this.setState({ isVisible: false, selectedItem: null, forceSubMenuOpen: false });
                callIfExists(_this.props.onHide, e);
            }
        };

        _this.handleOutsideClick = function (e) {
            if (!_this.menu.contains(e.target)) hideMenu();
        };

        _this.handleMouseLeave = function (event) {
            event.preventDefault();

            callIfExists(_this.props.onMouseLeave, event, assign({}, _this.props.data, store.data), store.target);

            if (_this.props.hideOnLeave) hideMenu();
        };

        _this.handleContextMenu = function (e) {
            _this.handleHide(e);
        };

        _this.hideMenu = function (e) {
            if (e.keyCode === 27 || e.keyCode === 13) {
                // ECS or enter
                hideMenu();
            }
        };

        _this.getMenuPosition = function () {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var menuStyles = {
                top: y,
                left: x
            };

            if (!_this.menu) return menuStyles;

            var _window = window,
                innerWidth = _window.innerWidth,
                innerHeight = _window.innerHeight;

            var rect = _this.menu.getBoundingClientRect();

            if (y + rect.height > innerHeight) {
                menuStyles.top -= rect.height;
            }

            if (x + rect.width > innerWidth) {
                menuStyles.left -= rect.width;
            }

            if (menuStyles.top < 0) {
                menuStyles.top = rect.height < innerHeight ? (innerHeight - rect.height) / 2 : 0;
            }

            if (menuStyles.left < 0) {
                menuStyles.left = rect.width < innerWidth ? (innerWidth - rect.width) / 2 : 0;
            }

            return menuStyles;
        };

        _this.getRTLMenuPosition = function () {
            var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            var menuStyles = {
                top: y,
                left: x
            };

            if (!_this.menu) return menuStyles;

            var _window2 = window,
                innerWidth = _window2.innerWidth,
                innerHeight = _window2.innerHeight;

            var rect = _this.menu.getBoundingClientRect();

            // Try to position the menu on the left side of the cursor
            menuStyles.left = x - rect.width;

            if (y + rect.height > innerHeight) {
                menuStyles.top -= rect.height;
            }

            if (menuStyles.left < 0) {
                menuStyles.left += rect.width;
            }

            if (menuStyles.top < 0) {
                menuStyles.top = rect.height < innerHeight ? (innerHeight - rect.height) / 2 : 0;
            }

            if (menuStyles.left + rect.width > innerWidth) {
                menuStyles.left = rect.width < innerWidth ? (innerWidth - rect.width) / 2 : 0;
            }

            return menuStyles;
        };

        _this.menuRef = function (c) {
            _this.menu = c;
        };

        _this.state = assign({}, _this.state, {
            x: 0,
            y: 0,
            isVisible: false
        });
        return _this;
    }

    _createClass$2(ContextMenu, [{
        key: 'getSubMenuType',
        value: function getSubMenuType() {
            // eslint-disable-line class-methods-use-this
            return SubMenu;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.listenId = listener.register(this.handleShow, this.handleHide);
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            var _this2 = this;

            var wrapper = window.requestAnimationFrame || setTimeout;
            if (this.state.isVisible) {
                wrapper(function () {
                    var _state = _this2.state,
                        x = _state.x,
                        y = _state.y;

                    var _ref = _this2.props.rtl ? _this2.getRTLMenuPosition(x, y) : _this2.getMenuPosition(x, y),
                        top = _ref.top,
                        left = _ref.left;

                    wrapper(function () {
                        if (!_this2.menu) return;
                        _this2.menu.style.top = top + 'px';
                        _this2.menu.style.left = left + 'px';
                        _this2.menu.style.opacity = 1;
                        _this2.menu.style.pointerEvents = 'auto';
                    });
                });
            } else {
                wrapper(function () {
                    if (!_this2.menu) return;
                    _this2.menu.style.opacity = 0;
                    _this2.menu.style.pointerEvents = 'none';
                });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.listenId) {
                listener.unregister(this.listenId);
            }

            this.unregisterHandlers();
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                children = _props.children,
                className = _props.className,
                style = _props.style;
            var isVisible = this.state.isVisible;

            var inlineStyle = assign({}, style, { position: 'fixed', opacity: 0, pointerEvents: 'none' });
            var menuClassnames = cx(cssClasses.menu, className, _defineProperty$2({}, cssClasses.menuVisible, isVisible));

            return React.createElement(
                'nav',
                {
                    role: 'menu', tabIndex: '-1', ref: this.menuRef, style: inlineStyle, className: menuClassnames,
                    onContextMenu: this.handleContextMenu, onMouseLeave: this.handleMouseLeave },
                this.renderChildren(children)
            );
        }
    }]);

    return ContextMenu;
}(AbstractMenu);

ContextMenu.propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    data: PropTypes.object,
    className: PropTypes.string,
    hideOnLeave: PropTypes.bool,
    rtl: PropTypes.bool,
    onHide: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onShow: PropTypes.func,
    preventHideOnContextMenu: PropTypes.bool,
    preventHideOnResize: PropTypes.bool,
    preventHideOnScroll: PropTypes.bool,
    style: PropTypes.object
};
ContextMenu.defaultProps = {
    className: '',
    data: {},
    hideOnLeave: false,
    rtl: false,
    onHide: function onHide() {
        return null;
    },
    onMouseLeave: function onMouseLeave() {
        return null;
    },
    onShow: function onShow() {
        return null;
    },

    preventHideOnContextMenu: false,
    preventHideOnResize: false,
    preventHideOnScroll: false,
    style: {}
};

var _createClass$3 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$4(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$4(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ContextMenuTrigger = function (_Component) {
    _inherits$4(ContextMenuTrigger, _Component);

    function ContextMenuTrigger() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck$5(this, ContextMenuTrigger);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn$4(this, (_ref = ContextMenuTrigger.__proto__ || Object.getPrototypeOf(ContextMenuTrigger)).call.apply(_ref, [this].concat(args))), _this), _this.touchHandled = false, _this.handleMouseDown = function (event) {
            if (_this.props.holdToDisplay >= 0 && event.button === 0) {
                event.persist();
                event.stopPropagation();

                _this.mouseDownTimeoutId = setTimeout(function () {
                    return _this.handleContextClick(event);
                }, _this.props.holdToDisplay);
            }
            callIfExists(_this.props.attributes.onMouseDown, event);
        }, _this.handleMouseUp = function (event) {
            if (event.button === 0) {
                clearTimeout(_this.mouseDownTimeoutId);
            }
            callIfExists(_this.props.attributes.onMouseUp, event);
        }, _this.handleMouseOut = function (event) {
            if (event.button === 0) {
                clearTimeout(_this.mouseDownTimeoutId);
            }
            callIfExists(_this.props.attributes.onMouseOut, event);
        }, _this.handleTouchstart = function (event) {
            _this.touchHandled = false;

            if (_this.props.holdToDisplay >= 0) {
                event.persist();
                event.stopPropagation();

                _this.touchstartTimeoutId = setTimeout(function () {
                    _this.handleContextClick(event);
                    _this.touchHandled = true;
                }, _this.props.holdToDisplay);
            }
            callIfExists(_this.props.attributes.onTouchStart, event);
        }, _this.handleTouchEnd = function (event) {
            if (_this.touchHandled) {
                event.preventDefault();
            }
            clearTimeout(_this.touchstartTimeoutId);
            callIfExists(_this.props.attributes.onTouchEnd, event);
        }, _this.handleContextMenu = function (event) {
            if (event.button === _this.props.mouseButton) {
                _this.handleContextClick(event);
            }
            callIfExists(_this.props.attributes.onContextMenu, event);
        }, _this.handleMouseClick = function (event) {
            if (event.button === _this.props.mouseButton) {
                _this.handleContextClick(event);
            }
            callIfExists(_this.props.attributes.onClick, event);
        }, _this.handleContextClick = function (event) {
            if (_this.props.disable) return;
            if (_this.props.disableIfShiftIsPressed && event.shiftKey) return;

            event.preventDefault();
            event.stopPropagation();

            var x = event.clientX || event.touches && event.touches[0].pageX;
            var y = event.clientY || event.touches && event.touches[0].pageY;

            if (_this.props.posX) {
                x -= _this.props.posX;
            }
            if (_this.props.posY) {
                y -= _this.props.posY;
            }

            hideMenu();

            var data = callIfExists(_this.props.collect, _this.props);
            var showMenuConfig = {
                position: { x: x, y: y },
                target: _this.elem,
                id: _this.props.id
            };
            if (data && typeof data.then === 'function') {
                // it's promise
                data.then(function (resp) {
                    showMenuConfig.data = assign({}, resp, {
                        target: event.target
                    });
                    showMenu(showMenuConfig);
                });
            } else {
                showMenuConfig.data = assign({}, data, {
                    target: event.target
                });
                showMenu(showMenuConfig);
            }
        }, _this.elemRef = function (c) {
            _this.elem = c;
        }, _temp), _possibleConstructorReturn$4(_this, _ret);
    }

    _createClass$3(ContextMenuTrigger, [{
        key: 'render',
        value: function render() {
            var _props = this.props,
                renderTag = _props.renderTag,
                attributes = _props.attributes,
                children = _props.children;

            var newAttrs = assign({}, attributes, {
                className: cx(cssClasses.menuWrapper, attributes.className),
                onContextMenu: this.handleContextMenu,
                onClick: this.handleMouseClick,
                onMouseDown: this.handleMouseDown,
                onMouseUp: this.handleMouseUp,
                onTouchStart: this.handleTouchstart,
                onTouchEnd: this.handleTouchEnd,
                onMouseOut: this.handleMouseOut,
                ref: this.elemRef
            });

            return React.createElement(renderTag, newAttrs, children);
        }
    }]);

    return ContextMenuTrigger;
}(Component);

ContextMenuTrigger.propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    attributes: PropTypes.object,
    collect: PropTypes.func,
    disable: PropTypes.bool,
    holdToDisplay: PropTypes.number,
    posX: PropTypes.number,
    posY: PropTypes.number,
    renderTag: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    mouseButton: PropTypes.number,
    disableIfShiftIsPressed: PropTypes.bool
};
ContextMenuTrigger.defaultProps = {
    attributes: {},
    collect: function collect() {
        return null;
    },

    disable: false,
    holdToDisplay: 1000,
    renderTag: 'div',
    posX: 0,
    posY: 0,
    mouseButton: 2, // 0 is left click, 2 is right click
    disableIfShiftIsPressed: false
};

var _extends$2 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass$4 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn$5(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits$5(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// collect ContextMenuTrigger's expected props to NOT pass them on as part of the context
var ignoredTriggerProps = [].concat(_toConsumableArray(Object.keys(ContextMenuTrigger.propTypes)), ['children']);

// expect the id of the menu to be responsible for as outer parameter
function connectMenu (menuId) {
    // expect menu component to connect as inner parameter
    // <Child/> is presumably a wrapper of <ContextMenu/>
    return function connect(Child) {
        // return wrapper for <Child/> that forwards the ContextMenuTrigger's additional props
        return function (_Component) {
            _inherits$5(ConnectMenu, _Component);

            function ConnectMenu(props) {
                _classCallCheck$6(this, ConnectMenu);

                var _this = _possibleConstructorReturn$5(this, (ConnectMenu.__proto__ || Object.getPrototypeOf(ConnectMenu)).call(this, props));

                _this.handleShow = function (e) {
                    if (e.detail.id !== menuId) return;

                    // the onShow event's detail.data object holds all ContextMenuTrigger props
                    var data = e.detail.data;

                    var filteredData = {};

                    for (var key in data) {
                        // exclude props the ContextMenuTrigger is expecting itself
                        if (!ignoredTriggerProps.includes(key)) {
                            filteredData[key] = data[key];
                        }
                    }
                    _this.setState({ trigger: filteredData });
                };

                _this.handleHide = function () {
                    _this.setState({ trigger: null });
                };

                _this.state = { trigger: null };
                return _this;
            }

            _createClass$4(ConnectMenu, [{
                key: 'componentDidMount',
                value: function componentDidMount() {
                    this.listenId = listener.register(this.handleShow, this.handleHide);
                }
            }, {
                key: 'componentWillUnmount',
                value: function componentWillUnmount() {
                    if (this.listenId) {
                        listener.unregister(this.listenId);
                    }
                }
            }, {
                key: 'render',
                value: function render() {
                    return React.createElement(Child, _extends$2({}, this.props, { id: menuId, trigger: this.state.trigger }));
                }
            }]);

            return ConnectMenu;
        }(Component);
    };
}

export { ContextMenu, ContextMenuTrigger, MenuItem, SubMenu, connectMenu, hideMenu, showMenu };
