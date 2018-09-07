// --------------------------------------
// 
//    _  _ _/ .  _  _/ /_ _  _  _        
//   /_|/_ / /|//_  / / //_ /_// /_/     
//   http://activetheory.net     _/      
// 
// --------------------------------------
//   2/14/18 6:14p
// --------------------------------------

window.Global = {};
window.getURL = function(url, target) {
    if (!target) {
        target = "_blank"
    }
    window.open(url, target)
}
;
if (typeof (console) === "undefined") {
    window.console = {};
    console.log = console.error = console.info = console.debug = console.warn = console.trace = function() {}
}
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
        return window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
            window.setTimeout(callback, 1000 / 60)
        }
    }
    )()
}
window.performance = (function() {
    if (window.performance && window.performance.now) {
        return window.performance
    } else {
        return Date
    }
}
)();
Date.now = Date.now || function() {
    return +new Date
}
;
window.Class = function(_class, _type) {
    var _this = this || window;
    var _string = _class.toString();
    var _name = _class.toString().match(/function ([^\(]+)/)[1];
    var _static = null;
    if (typeof _type === "function") {
        _static = _type;
        _type = null
    }
    _type = (_type || "").toLowerCase();
    _class.prototype.__call = function() {
        if (this.events) {
            this.events.scope(this)
        }
    }
    ;
    if (!_type) {
        _this[_name] = _class;
        _static && _static()
    } else {
        if (_type == "static") {
            _this[_name] = new _class()
        } else {
            if (_type == "singleton") {
                _this[_name] = (function() {
                    var __this = {};
                    var _instance;
                    __this.instance = function() {
                        if (!_instance) {
                            _instance = new _class()
                        }
                        return _instance
                    }
                    ;
                    return __this
                }
                )()
            }
        }
    }
    if (this !== window) {
        if (!this.__namespace) {
            this.__namespace = this.constructor.toString().match(/function ([^\(]+)/)[1]
        }
        this[_name]._namespace = this.__namespace
    }
}
;
window.Inherit = function(child, parent, param) {
    if (typeof param === "undefined") {
        param = child
    }
    var p = new parent(param,true);
    var save = {};
    for (var method in p) {
        child[method] = p[method];
        save[method] = p[method]
    }
    if (child.__call) {
        child.__call()
    }
    defer(function() {
        for (method in p) {
            if ((child[method] && save[method]) && child[method] !== save[method]) {
                child["_" + method] = save[method]
            }
        }
        p = save = null;
        child = parent = param = null
    })
}
;
window.Implement = function(cl, intr) {
    Render.nextFrame(function() {
        var intrface = new intr();
        for (var property in intrface) {
            if (typeof cl[property] === "undefined") {
                throw "Interface Error: Missing Property: " + property + " ::: " + intr
            } else {
                var type = typeof intrface[property];
                if (typeof cl[property] != type) {
                    throw "Interface Error: Property " + property + " is Incorrect Type ::: " + intr
                }
            }
        }
    })
}
;
window.Namespace = function(name) {
    if (typeof name === "string") {
        window[name] = {
            Class: window.Class
        }
    } else {
        name.Class = window.Class
    }
}
;
window.Interface = function(display) {
    var name = display.toString().match(/function ([^\(]+)/)[1];
    Hydra.INTERFACES[name] = display
}
;
window.THREAD = false;
Class(function HydraObject(_selector, _type, _exists, _useFragment) {
    this._children = new LinkedList();
    this.__useFragment = _useFragment;
    this._initSelector(_selector, _type, _exists)
}, function() {
    var prototype = HydraObject.prototype;
    prototype._initSelector = function(_selector, _type, _exists) {
        if (_selector && typeof _selector !== "string") {
            this.div = _selector
        } else {
            var first = _selector ? _selector.charAt(0) : null;
            var name = _selector ? _selector.slice(1) : null;
            if (first != "." && first != "#") {
                name = _selector;
                first = "."
            }
            if (!_exists) {
                this._type = _type || "div";
                if (this._type == "svg") {
                    this.div = document.createElementNS("http://www.w3.org/2000/svg", this._type);
                    this.div.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink")
                } else {
                    this.div = document.createElement(this._type);
                    if (first) {
                        if (first == "#") {
                            this.div.id = name
                        } else {
                            this.div.className = name
                        }
                    }
                }
            } else {
                if (first != "#") {
                    throw "Hydra Selectors Require #ID"
                }
                this.div = document.getElementById(name)
            }
        }
        this.div.hydraObject = this
    }
    ;
    prototype.addChild = prototype.add = function(child) {
        var div = this.div;
        var createFrag = function() {
            if (this.__useFragment) {
                if (!this._fragment) {
                    this._fragment = document.createDocumentFragment();
                    var _this = this;
                    defer(function() {
                        if (!_this._fragment || !_this.div) {
                            return _this._fragment = null
                        }
                        _this.div.appendChild(_this._fragment);
                        _this._fragment = null
                    })
                }
                div = this._fragment
            }
        };
        if (child.element && child.element instanceof HydraObject) {
            createFrag();
            div.appendChild(child.element.div);
            this._children.push(child.element);
            child.element._parent = this;
            child.element.div.parentNode = this.div
        } else {
            if (child.div) {
                createFrag();
                div.appendChild(child.div);
                this._children.push(child);
                child._parent = this;
                child.div.parentNode = this.div
            } else {
                if (child.nodeName) {
                    createFrag();
                    div.appendChild(child);
                    child.parentNode = this.div
                }
            }
        }
        return this
    }
    ;
    prototype.clone = function() {
        return $(this.div.cloneNode(true))
    }
    ;
    prototype.create = function(name, type) {
        var $obj = $(name, type);
        this.addChild($obj);
        if (this.__root) {
            this.__root.__append[name] = $obj;
            $obj.__root = this.__root
        }
        return $obj
    }
    ;
    prototype.empty = function() {
        var child = this._children.start();
        while (child) {
            if (child && child.remove) {
                child.remove()
            }
            child = this._children.next()
        }
        this.div.innerHTML = "";
        return this
    }
    ;
    prototype.parent = function() {
        return this._parent
    }
    ;
    prototype.children = function() {
        return this.div.children ? this.div.children : this.div.childNodes
    }
    ;
    prototype.append = function(callback, params) {
        if (!this.__root) {
            this.__root = this;
            this.__append = {}
        }
        return callback.apply(this, params)
    }
    ;
    prototype.removeChild = function(object, keep) {
        try {
            object.div.parentNode.removeChild(object.div)
        } catch (e) {}
        if (!keep) {
            this._children.remove(object)
        }
    }
    ;
    prototype.remove = prototype.destroy = function() {
        this.removed = true;
        var parent = this._parent;
        if (!!(parent && !parent.removed && parent.removeChild)) {
            parent.removeChild(this, true)
        }
        var child = this._children.start();
        while (child) {
            if (child && child.remove) {
                child.remove()
            }
            child = this._children.next()
        }
        this._children.destroy();
        this.div.hydraObject = null;
        Utils.nullObject(this)
    }
});
Class(function Hydra() {
    var _this = this;
    var _inter, _pool;
    var _readyCallbacks = [];
    this.READY = false;
    this.HASH = window.location.hash.slice(1);
    this.LOCAL = location.hostname.indexOf("local") > -1 || location.hostname.split(".")[0] == "10" || location.hostname.split(".")[0] == "192";
    (function() {
        initLoad()
    }
    )();
    function initLoad() {
        if (!document || !window) {
            return setTimeout(initLoad, 1)
        }
        if (window._NODE_) {
            _this.addEvent = "addEventListener";
            _this.removeEvent = "removeEventListener";
            return setTimeout(loaded, 1)
        }
        if (window.addEventListener) {
            _this.addEvent = "addEventListener";
            _this.removeEvent = "removeEventListener";
            window.addEventListener("load", loaded, false)
        } else {
            _this.addEvent = "attachEvent";
            _this.removeEvent = "detachEvent";
            window.attachEvent("onload", loaded)
        }
    }
    function loaded() {
        if (window.removeEventListener) {
            window.removeEventListener("load", loaded, false)
        }
        for (var i = 0; i < _readyCallbacks.length; i++) {
            _readyCallbacks[i]()
        }
        _readyCallbacks = null;
        _this.READY = true;
        if (window.Main) {
            Hydra.Main = new window.Main()
        }
    }
    this.development = function(flag, array) {
        var matchArray = function(prop) {
            if (!array) {
                return false
            }
            for (var i = 0; i < array.length; i++) {
                if (prop.strpos(array[i])) {
                    return true
                }
            }
            return false
        };
        clearInterval(_inter);
        if (flag) {
            _inter = setInterval(function() {
                for (var prop in window) {
                    if (prop.strpos("webkit")) {
                        continue
                    }
                    var obj = window[prop];
                    if (typeof obj !== "function" && prop.length > 2) {
                        if (prop.strpos("_ga") || prop.strpos("_typeface_js") || matchArray(prop)) {
                            continue
                        }
                        var char1 = prop.charAt(0);
                        var char2 = prop.charAt(1);
                        if (char1 == "_" || char1 == "$") {
                            if (char2 !== char2.toUpperCase()) {
                                console.log(window[prop]);
                                throw "Hydra Warning:: " + prop + " leaking into global scope"
                            }
                        }
                    }
                }
            }, 1000)
        }
    }
    ;
    this.getArguments = function(value) {
        var saved = this.arguments;
        var args = [];
        for (var i = 1; i < saved.length; i++) {
            if (saved[i] !== null) {
                args.push(saved[i])
            }
        }
        return args
    }
    ;
    this.getClassName = function(obj) {
        return obj.constructor.name || obj.constructor.toString().match(/function ([^\(]+)/)[1]
    }
    ;
    this.ready = function(callback) {
        if (this.READY) {
            return callback()
        }
        _readyCallbacks.push(callback)
    }
    ;
    this.$ = function(selector, type, exists) {
        return new HydraObject(selector,type,exists)
    }
    ;
    this.__triggerReady = function() {
        loaded()
    }
    ;
    this.INTERFACES = {};
    this.HTML = {};
    this.JSON = {};
    this.$.fn = HydraObject.prototype;
    window.$ = this.$;
    window.ready = this.ready
}, "Static");
Hydra.ready(function() {
    window.__window = $(window);
    window.__document = $(document);
    window.__body = $(document.getElementsByTagName("body")[0]);
    window.Stage = __body.create("#Stage");
    Stage.size("100%");
    Stage.__useFragment = true;
    Stage.width = document.body.clientWidth || document.documentElement.offsetWidth || window.innerWidth;
    Stage.height = document.body.clientHeight || document.documentElement.offsetHeight || window.innerHeight;
    (function() {
        var _time = Date.now();
        var _last;
        setTimeout(function() {
            var list = ["hidden", "msHidden", "webkitHidden"];
            var hidden, eventName;
            (function() {
                for (var key in list) {
                    if (document[list[key]] !== "undefined") {
                        hidden = list[key];
                        switch (hidden) {
                        case "hidden":
                            eventName = "visibilitychange";
                            break;
                        case "msHidden":
                            eventName = "msvisibilitychange";
                            break;
                        case "webkitHidden":
                            eventName = "webkitvisibilitychange";
                            break
                        }
                        return
                    }
                }
            }
            )();
            if (typeof document[hidden] === "undefined") {
                if (Device.browser.ie) {
                    document.onfocus = onfocus;
                    document.onblur = onblur
                } else {
                    window.onfocus = onfocus;
                    window.onblur = onblur
                }
            } else {
                document.addEventListener(eventName, function() {
                    var time = Date.now();
                    if (time - _time > 10) {
                        if (document[hidden] === false) {
                            onfocus()
                        } else {
                            onblur()
                        }
                    }
                    _time = time
                })
            }
        }, 250);
        function onfocus() {
            if (_last != "focus") {
                HydraEvents._fireEvent(HydraEvents.BROWSER_FOCUS, {
                    type: "focus"
                })
            }
            _last = "focus"
        }
        function onblur() {
            if (_last != "blur") {
                HydraEvents._fireEvent(HydraEvents.BROWSER_FOCUS, {
                    type: "blur"
                })
            }
            _last = "blur"
        }
    }
    )();
    window.onresize = function() {
        if (!Device.mobile) {
            Stage.width = document.body.clientWidth || document.documentElement.offsetWidth || window.innerWidth;
            Stage.height = document.body.clientHeight || document.documentElement.offsetHeight || window.innerHeight;
            HydraEvents._fireEvent(HydraEvents.RESIZE)
        }
    }
});
(function() {
    $.fn.text = function(text) {
        if (typeof text !== "undefined") {
            this.div.textContent = text;
            return this
        } else {
            return this.div.textContent
        }
    }
    ;
    $.fn.html = function(text, force) {
        if (text && !text.strpos("<") && !force) {
            return this.text(text)
        }
        if (typeof text !== "undefined") {
            this.div.innerHTML = text;
            return this
        } else {
            return this.div.innerHTML
        }
    }
    ;
    $.fn.hide = function() {
        this.div.style.display = "none";
        return this
    }
    ;
    $.fn.show = function() {
        this.div.style.display = "";
        return this
    }
    ;
    $.fn.visible = function() {
        this.div.style.visibility = "visible";
        return this
    }
    ;
    $.fn.invisible = function() {
        this.div.style.visibility = "hidden";
        return this
    }
    ;
    $.fn.setZ = function(z) {
        this.div.style.zIndex = z;
        return this
    }
    ;
    $.fn.clearAlpha = function() {
        this.div.style.opacity = "";
        return this
    }
    ;
    $.fn.size = function(w, h, noScale) {
        if (typeof w === "string") {
            if (typeof h === "undefined") {
                h = "100%"
            } else {
                if (typeof h !== "string") {
                    h = h + "px"
                }
            }
            this.div.style.width = w;
            this.div.style.height = h
        } else {
            this.div.style.width = w + "px";
            this.div.style.height = h + "px";
            if (!noScale) {
                this.div.style.backgroundSize = w + "px " + h + "px"
            }
        }
        this.width = w;
        this.height = h;
        return this
    }
    ;
    $.fn.mouseEnabled = function(bool) {
        this.div.style.pointerEvents = bool ? "auto" : "none";
        return this
    }
    ;
    $.fn.fontStyle = function(family, size, color, style) {
        var font = {};
        if (family) {
            font.fontFamily = family
        }
        if (size) {
            font.fontSize = size
        }
        if (color) {
            font.color = color
        }
        if (style) {
            font.fontStyle = style
        }
        this.css(font);
        return this
    }
    ;
    $.fn.bg = function(src, x, y, repeat) {
        if (!src) {
            return this
        }
        if (src.strpos(".")) {
            src = Images.getPath(src)
        }
        if (!src.strpos(".")) {
            this.div.style.backgroundColor = src
        } else {
            this.div.style.backgroundImage = "url(" + src + ")"
        }
        if (typeof x !== "undefined") {
            x = typeof x == "number" ? x + "px" : x;
            y = typeof y == "number" ? y + "px" : y;
            this.div.style.backgroundPosition = x + " " + y
        }
        if (repeat) {
            this.div.style.backgroundSize = "";
            this.div.style.backgroundRepeat = repeat
        }
        if (x == "cover" || x == "contain") {
            this.div.style.backgroundSize = x;
            this.div.style.backgroundPosition = typeof y != "undefined" ? y + " " + repeat : "center"
        }
        return this
    }
    ;
    $.fn.center = function(x, y, noPos) {
        var css = {};
        if (typeof x === "undefined") {
            css.left = "50%";
            css.top = "50%";
            css.marginLeft = -this.width / 2;
            css.marginTop = -this.height / 2
        } else {
            if (x) {
                css.left = "50%";
                css.marginLeft = -this.width / 2
            }
            if (y) {
                css.top = "50%";
                css.marginTop = -this.height / 2
            }
        }
        if (noPos) {
            delete css.left;
            delete css.top
        }
        this.css(css);
        return this
    }
    ;
    $.fn.mask = function(arg, x, y, w, h) {
        this.div.style[CSS.prefix("Mask")] = (arg.strpos(".") ? "url(" + arg + ")" : arg) + " no-repeat";
        return this
    }
    ;
    $.fn.blendMode = function(mode, bg) {
        if (bg) {
            this.div.style["background-blend-mode"] = mode
        } else {
            this.div.style["mix-blend-mode"] = mode
        }
        return this
    }
    ;
    $.fn.css = function(obj, value) {
        if (typeof value == "boolean") {
            skip = value;
            value = null
        }
        if (typeof obj !== "object") {
            if (!value) {
                var style = this.div.style[obj];
                if (typeof style !== "number") {
                    if (style.strpos("px")) {
                        style = Number(style.slice(0, -2))
                    }
                    if (obj == "opacity") {
                        style = !isNaN(Number(this.div.style.opacity)) ? Number(this.div.style.opacity) : 1
                    }
                }
                if (!style) {
                    style = 0
                }
                return style
            } else {
                this.div.style[obj] = value;
                return this
            }
        }
        TweenManager.clearCSSTween(this);
        for (var type in obj) {
            var val = obj[type];
            if (!(typeof val === "string" || typeof val === "number")) {
                continue
            }
            if (typeof val !== "string" && type != "opacity" && type != "zIndex") {
                val += "px"
            }
            this.div.style[type] = val
        }
        return this
    }
    ;
    $.fn.transform = function(props) {
        if (this.multiTween && this._cssTweens.length > 1 && this.__transformTime && Render.TIME - this.__transformTime < 15) {
            return
        }
        this.__transformTime = Render.TIME;
        TweenManager.clearCSSTween(this);
        if (Device.tween.css2d) {
            if (!props) {
                props = this
            } else {
                for (var key in props) {
                    if (typeof props[key] === "number") {
                        this[key] = props[key]
                    }
                }
            }
            var transformString;
            if (!this._matrix) {
                transformString = TweenManager.parseTransform(props)
            } else {
                if (this._matrix.type == "matrix2") {
                    this._matrix.setTRS(this.x, this.y, this.rotation, this.scaleX || this.scale, this.scaleY || this.scale)
                } else {
                    this._matrix.setTRS(this.x, this.y, this.z, this.rotationX, this.rotationY, this.rotationZ, this.scaleX || this.scale, this.scaleY || this.scale, this.scaleZ || this.scale)
                }
                transformString = this._matrix.getCSS()
            }
            if (this.__transformCache != transformString) {
                this.div.style[Device.styles.vendorTransform] = transformString;
                this.__transformCache = transformString
            }
        }
        return this
    }
    ;
    $.fn.useMatrix3D = function() {
        this._matrix = new Matrix4();
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.scale = 1;
        return this
    }
    ;
    $.fn.useMatrix2D = function() {
        this._matrix = new Matrix2();
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.scale = 1;
        return this
    }
    ;
    $.fn.willChange = function(props) {
        if (typeof props === "boolean") {
            if (props === true) {
                this._willChangeLock = true
            } else {
                this._willChangeLock = false
            }
        } else {
            if (this._willChangeLock) {
                return
            }
        }
        var string = typeof props === "string";
        if ((!this._willChange || string) && typeof props !== "null") {
            this._willChange = true;
            this.div.style["will-change"] = string ? props : Device.transformProperty + ", opacity"
        } else {
            this._willChange = false;
            this.div.style["will-change"] = ""
        }
    }
    ;
    $.fn.backfaceVisibility = function(visible) {
        if (visible) {
            this.div.style[CSS.prefix("BackfaceVisibility")] = "visible"
        } else {
            this.div.style[CSS.prefix("BackfaceVisibility")] = "hidden"
        }
    }
    ;
    $.fn.enable3D = function(perspective, x, y) {
        this.div.style[CSS.prefix("TransformStyle")] = "preserve-3d";
        if (perspective) {
            this.div.style[CSS.prefix("Perspective")] = perspective + "px"
        }
        if (typeof x !== "undefined") {
            x = typeof x === "number" ? x + "px" : x;
            y = typeof y === "number" ? y + "px" : y;
            this.div.style[CSS.prefix("PerspectiveOrigin")] = x + " " + y
        }
        return this
    }
    ;
    $.fn.disable3D = function() {
        this.div.style[CSS.prefix("TransformStyle")] = "";
        this.div.style[CSS.prefix("Perspective")] = "";
        return this
    }
    ;
    $.fn.transformPoint = function(x, y, z) {
        var origin = "";
        if (typeof x !== "undefined") {
            origin += (typeof x === "number" ? x + "px " : x + " ")
        }
        if (typeof y !== "undefined") {
            origin += (typeof y === "number" ? y + "px " : y + " ")
        }
        if (typeof z !== "undefined") {
            origin += (typeof z === "number" ? z + "px" : z)
        }
        this.div.style[CSS.prefix("TransformOrigin")] = origin;
        return this
    }
    ;
    $.fn.tween = function(props, time, ease, delay, callback, manual) {
        if (typeof delay === "boolean") {
            manual = delay;
            delay = 0;
            callback = null
        } else {
            if (typeof delay === "function") {
                callback = delay;
                delay = 0
            }
        }
        if (typeof callback === "boolean") {
            manual = callback;
            callback = null
        }
        if (!delay) {
            delay = 0
        }
        return TweenManager._detectTween(this, props, time, ease, delay, callback, manual)
    }
    ;
    $.fn.clearTransform = function() {
        if (typeof this.x === "number") {
            this.x = 0
        }
        if (typeof this.y === "number") {
            this.y = 0
        }
        if (typeof this.z === "number") {
            this.z = 0
        }
        if (typeof this.scale === "number") {
            this.scale = 1
        }
        if (typeof this.scaleX === "number") {
            this.scaleX = 1
        }
        if (typeof this.scaleY === "number") {
            this.scaleY = 1
        }
        if (typeof this.rotation === "number") {
            this.rotation = 0
        }
        if (typeof this.rotationX === "number") {
            this.rotationX = 0
        }
        if (typeof this.rotationY === "number") {
            this.rotationY = 0
        }
        if (typeof this.rotationZ === "number") {
            this.rotationZ = 0
        }
        if (typeof this.skewX === "number") {
            this.skewX = 0
        }
        if (typeof this.skewY === "number") {
            this.skewY = 0
        }
        this.div.style[Device.styles.vendorTransform] = "";
        return this
    }
    ;
    $.fn.stopTween = function() {
        if (this._cssTween) {
            this._cssTween.stop()
        }
        if (this._mathTween) {
            this._mathTween.stop()
        }
        return this
    }
    ;
    $.fn.keypress = function(callback) {
        this.div.onkeypress = function(e) {
            e = e || window.event;
            e.code = e.keyCode ? e.keyCode : e.charCode;
            if (callback) {
                callback(e)
            }
        }
    }
    ;
    $.fn.keydown = function(callback) {
        this.div.onkeydown = function(e) {
            e = e || window.event;
            e.code = e.keyCode;
            if (callback) {
                callback(e)
            }
        }
    }
    ;
    $.fn.keyup = function(callback) {
        this.div.onkeyup = function(e) {
            e = e || window.event;
            e.code = e.keyCode;
            if (callback) {
                callback(e)
            }
        }
    }
    ;
    $.fn.attr = function(attr, value) {
        if (attr && value) {
            if (value == "") {
                this.div.removeAttribute(attr)
            } else {
                this.div.setAttribute(attr, value)
            }
        } else {
            if (attr) {
                return this.div.getAttribute(attr)
            }
        }
        return this
    }
    ;
    $.fn.val = function(value) {
        if (typeof value === "undefined") {
            return this.div.value
        } else {
            this.div.value = value
        }
        return this
    }
    ;
    $.fn.change = function(callback) {
        var _this = this;
        if (this._type == "select") {
            this.div.onchange = function() {
                callback({
                    object: _this,
                    value: _this.div.value || ""
                })
            }
        }
    }
    ;
    $.fn.svgSymbol = function(id, width, height) {
        var config = SVG.getSymbolConfig(id);
        var svgHTML = '<svg viewBox="0 0 ' + config.width + " " + config.height + '" width="' + width + '" height="' + height + '"><use xlink:href="#' + config.id + '" x="0" y="0" /></svg>';
        this.html(svgHTML, true)
    }
}
)();
(function() {
    var windowsPointer = !!window.MSGesture;
    var translateEvent = function(evt) {
        if (Hydra.addEvent == "attachEvent") {
            switch (evt) {
            case "click":
                return "onclick";
                break;
            case "mouseover":
                return "onmouseover";
                break;
            case "mouseout":
                return "onmouseleave";
                break;
            case "mousedown":
                return "onmousedown";
                break;
            case "mouseup":
                return "onmouseup";
                break;
            case "mousemove":
                return "onmousemove";
                break
            }
        }
        if (windowsPointer) {
            switch (evt) {
            case "touchstart":
                return "pointerdown";
                break;
            case "touchmove":
                return "MSGestureChange";
                break;
            case "touchend":
                return "pointerup";
                break
            }
        }
        return evt
    };
    $.fn.click = function(callback) {
        var _this = this;
        function click(e) {
            if (!_this.div) {
                return false
            }
            if (Mouse._preventClicks) {
                return false
            }
            e.object = _this.div.className == "hit" ? _this.parent() : _this;
            e.action = "click";
            if (!e.pageX) {
                e.pageX = e.clientX;
                e.pageY = e.clientY
            }
            if (callback) {
                callback(e)
            }
            if (Mouse.autoPreventClicks) {
                Mouse.preventClicks()
            }
        }
        this.div[Hydra.addEvent](translateEvent("click"), click, true);
        this.div.style.cursor = "pointer";
        return this
    }
    ;
    $.fn.hover = function(callback) {
        var _this = this;
        var _over = false;
        var _time;
        function hover(e) {
            if (!_this.div) {
                return false
            }
            var time = Date.now();
            var original = e.toElement || e.relatedTarget;
            if (_time && (time - _time) < 5) {
                _time = time;
                return false
            }
            _time = time;
            e.object = _this.div.className == "hit" ? _this.parent() : _this;
            switch (e.type) {
            case "mouseout":
                e.action = "out";
                break;
            case "mouseleave":
                e.action = "out";
                break;
            default:
                e.action = "over";
                break
            }
            if (_over) {
                if (Mouse._preventClicks) {
                    return false
                }
                if (e.action == "over") {
                    return false
                }
                if (e.action == "out") {
                    if (isAChild(_this.div, original)) {
                        return false
                    }
                }
                _over = false
            } else {
                if (e.action == "out") {
                    return false
                }
                _over = true
            }
            if (!e.pageX) {
                e.pageX = e.clientX;
                e.pageY = e.clientY
            }
            if (callback) {
                callback(e)
            }
        }
        function isAChild(div, object) {
            var len = div.children.length - 1;
            for (var i = len; i > -1; i--) {
                if (object == div.children[i]) {
                    return true
                }
            }
            for (i = len; i > -1; i--) {
                if (isAChild(div.children[i], object)) {
                    return true
                }
            }
        }
        this.div[Hydra.addEvent](translateEvent("mouseover"), hover, true);
        this.div[Hydra.addEvent](translateEvent("mouseout"), hover, true);
        return this
    }
    ;
    $.fn.press = function(callback) {
        var _this = this;
        function press(e) {
            if (!_this.div) {
                return false
            }
            e.object = _this.div.className == "hit" ? _this.parent() : _this;
            switch (e.type) {
            case "mousedown":
                e.action = "down";
                break;
            default:
                e.action = "up";
                break
            }
            if (!e.pageX) {
                e.pageX = e.clientX;
                e.pageY = e.clientY
            }
            if (callback) {
                callback(e)
            }
        }
        this.div[Hydra.addEvent](translateEvent("mousedown"), press, true);
        this.div[Hydra.addEvent](translateEvent("mouseup"), press, true);
        return this
    }
    ;
    $.fn.bind = function(evt, callback) {
        if (!this._events) {
            this._events = {}
        }
        if (windowsPointer && this == __window) {
            return Stage.bind(evt, callback)
        }
        if (evt == "touchstart") {
            if (!Device.mobile) {
                if (Device.touchCapable) {
                    this.bind("mousedown", callback)
                } else {
                    evt = "mousedown"
                }
            }
        } else {
            if (evt == "touchmove") {
                if (!Device.mobile) {
                    if (Device.touchCapable) {
                        this.bind("mousemove", callback)
                    } else {
                        evt = "mousemove"
                    }
                }
                if (windowsPointer && !this.div.msGesture) {
                    this.div.msGesture = new MSGesture();
                    this.div.msGesture.target = this.div
                }
            } else {
                if (evt == "touchend") {
                    if (!Device.mobile) {
                        if (Device.touchCapable) {
                            this.bind("mouseup", callback)
                        } else {
                            evt = "mouseup"
                        }
                    }
                }
            }
        }
        this._events["bind_" + evt] = this._events["bind_" + evt] || [];
        var _events = this._events["bind_" + evt];
        var e = {};
        var target = this.div;
        e.callback = callback;
        e.target = this.div;
        _events.push(e);
        function touchEvent(e) {
            if (windowsPointer && target.msGesture && evt == "touchstart") {
                target.msGesture.addPointer(e.pointerId)
            }
            var touch = Utils.touchEvent(e);
            if (windowsPointer) {
                var windowsEvt = e;
                e = {};
                e.x = Number(windowsEvt.pageX || windowsEvt.clientX);
                e.y = Number(windowsEvt.pageY || windowsEvt.clientY);
                e.target = windowsEvt.target;
                e.currentTarget = windowsEvt.currentTarget;
                e.path = [];
                var node = e.target;
                while (node) {
                    e.path.push(node);
                    node = node.parentElement || null
                }
                e.windowsPointer = true
            } else {
                e.x = touch.x;
                e.y = touch.y
            }
            for (var i = 0; i < _events.length; i++) {
                var ev = _events[i];
                if (ev.target == e.currentTarget) {
                    ev.callback(e)
                }
            }
        }
        if (!this._events["fn_" + evt]) {
            this._events["fn_" + evt] = touchEvent;
            this.div[Hydra.addEvent](translateEvent(evt), touchEvent, true)
        }
        return this
    }
    ;
    $.fn.unbind = function(evt, callback) {
        if (!this._events) {
            this._events = {}
        }
        if (windowsPointer && this == __window) {
            return Stage.unbind(evt, callback)
        }
        if (evt == "touchstart") {
            if (!Device.mobile) {
                if (Device.touchCapable) {
                    this.unbind("mousedown", callback)
                } else {
                    evt = "mousedown"
                }
            }
        } else {
            if (evt == "touchmove") {
                if (!Device.mobile) {
                    if (Device.touchCapable) {
                        this.unbind("mousemove", callback)
                    } else {
                        evt = "mousemove"
                    }
                }
            } else {
                if (evt == "touchend") {
                    if (!Device.mobile) {
                        if (Device.touchCapable) {
                            this.unbind("mouseup", callback)
                        } else {
                            evt = "mouseup"
                        }
                    }
                }
            }
        }
        var _events = this._events["bind_" + evt];
        if (!_events) {
            return this
        }
        for (var i = 0; i < _events.length; i++) {
            var ev = _events[i];
            if (ev.callback == callback) {
                _events.splice(i, 1)
            }
        }
        if (this._events["fn_" + evt] && !_events.length) {
            this.div[Hydra.removeEvent](translateEvent(evt), this._events["fn_" + evt], Device.mobile ? {
                passive: true
            } : true);
            this._events["fn_" + evt] = null
        }
        return this
    }
    ;
    $.fn.interact = function(overCallback, clickCallback) {
        if (!this.hit) {
            this.hit = $(".hit");
            this.hit.css({
                width: "100%",
                height: "100%",
                zIndex: 99999,
                top: 0,
                left: 0,
                position: "absolute"
            });
            this.addChild(this.hit)
        }
        if (!Device.mobile) {
            this.hit.hover(overCallback).click(clickCallback)
        } else {
            this.hit.touchClick(overCallback, clickCallback)
        }
    }
    ;
    $.fn.touchSwipe = function(callback, distance) {
        if (!window.addEventListener) {
            return this
        }
        var _this = this;
        var _distance = distance || 75;
        var _startX, _startY;
        var _moving = false;
        var _move = {};
        if (Device.mobile) {
            this.div.addEventListener(translateEvent("touchstart"), touchStart, {
                passive: true
            });
            this.div.addEventListener(translateEvent("touchend"), touchEnd, {
                passive: true
            });
            this.div.addEventListener(translateEvent("touchcancel"), touchEnd, {
                passive: true
            })
        }
        function touchStart(e) {
            var touch = Utils.touchEvent(e);
            if (!_this.div) {
                return false
            }
            if (e.touches.length == 1) {
                _startX = touch.x;
                _startY = touch.y;
                _moving = true;
                _this.div.addEventListener(translateEvent("touchmove"), touchMove, {
                    passive: true
                })
            }
        }
        function touchMove(e) {
            if (!_this.div) {
                return false
            }
            if (_moving) {
                var touch = Utils.touchEvent(e);
                var dx = _startX - touch.x;
                var dy = _startY - touch.y;
                _move.direction = null;
                _move.moving = null;
                _move.x = null;
                _move.y = null;
                _move.evt = e;
                if (Math.abs(dx) >= _distance) {
                    touchEnd();
                    if (dx > 0) {
                        _move.direction = "left"
                    } else {
                        _move.direction = "right"
                    }
                } else {
                    if (Math.abs(dy) >= _distance) {
                        touchEnd();
                        if (dy > 0) {
                            _move.direction = "up"
                        } else {
                            _move.direction = "down"
                        }
                    } else {
                        _move.moving = true;
                        _move.x = dx;
                        _move.y = dy
                    }
                }
                if (callback) {
                    callback(_move, e)
                }
            }
        }
        function touchEnd(e) {
            if (!_this.div) {
                return false
            }
            _startX = _startY = _moving = false;
            _this.div.removeEventListener(translateEvent("touchmove"), touchMove)
        }
        return this
    }
    ;
    $.fn.touchClick = function(hover, click) {
        if (!window.addEventListener) {
            return this
        }
        var _this = this;
        var _time, _move;
        var _start = {};
        var _touch = {};
        if (Device.mobile) {
            this.div.addEventListener(translateEvent("touchmove"), touchMove, {
                passive: true
            });
            this.div.addEventListener(translateEvent("touchstart"), touchStart, {
                passive: true
            });
            this.div.addEventListener(translateEvent("touchend"), touchEnd, {
                passive: true
            })
        }
        function touchMove(e) {
            if (!_this.div) {
                return false
            }
            _touch = Utils.touchEvent(e);
            if (Utils.findDistance(_start, _touch) > 5) {
                _move = true
            } else {
                _move = false
            }
        }
        function setTouch(e) {
            var touch = Utils.touchEvent(e);
            e.touchX = touch.x;
            e.touchY = touch.y;
            _start.x = e.touchX;
            _start.y = e.touchY
        }
        function touchStart(e) {
            if (!_this.div) {
                return false
            }
            _time = Date.now();
            e.action = "over";
            e.object = _this.div.className == "hit" ? _this.parent() : _this;
            setTouch(e);
            if (hover && !_move) {
                hover(e)
            }
        }
        function touchEnd(e) {
            if (!_this.div) {
                return false
            }
            var time = Date.now();
            var clicked = false;
            e.object = _this.div.className == "hit" ? _this.parent() : _this;
            setTouch(e);
            if (_time && time - _time < 750) {
                if (Mouse._preventClicks) {
                    return false
                }
                if (click && !_move) {
                    clicked = true;
                    e.action = "click";
                    if (click && !_move) {
                        click(e)
                    }
                    if (Mouse.autoPreventClicks) {
                        Mouse.preventClicks()
                    }
                }
            }
            if (hover) {
                e.action = "out";
                if (!Mouse._preventFire) {
                    hover(e)
                }
            }
            _move = false
        }
        return this
    }
}
)();
Class(function MVC() {
    Inherit(this, Events);
    var _setters = {};
    var _active = {};
    var _timers = [];
    this.classes = {};
    function defineSetter(_this, prop) {
        _setters[prop] = {};
        Object.defineProperty(_this, prop, {
            set: function(v) {
                if (_setters[prop] && _setters[prop].s) {
                    _setters[prop].s.call(_this, v)
                }
                v = null
            },
            get: function() {
                if (_setters[prop] && _setters[prop].g) {
                    return _setters[prop].g.apply(_this)
                }
            }
        })
    }
    this.set = function(prop, callback) {
        if (!_setters[prop]) {
            defineSetter(this, prop)
        }
        _setters[prop].s = callback
    }
    ;
    this.get = function(prop, callback) {
        if (!_setters[prop]) {
            defineSetter(this, prop)
        }
        _setters[prop].g = callback
    }
    ;
    this.delayedCall = function(callback, time, params) {
        var _this = this;
        var timer = Timer.create(function() {
            if (_this.destroy) {
                callback(params)
            }
            _this = callback = null
        }, time || 0);
        _timers.push(timer);
        if (_timers.length > 20) {
            _timers.shift()
        }
        return timer
    }
    ;
    this.initClass = function(clss, a, b, c, d, e, f, g) {
        var name = Utils.timestamp();
        if (window.Hydra) {
            Hydra.arguments = arguments
        }
        var child = new clss(a,b,c,d,e,f,g);
        if (window.Hydra) {
            Hydra.arguments = null
        }
        child.parent = this;
        if (child.destroy) {
            this.classes[name] = child;
            this.classes[name].__id = name
        }
        var lastArg = arguments[arguments.length - 1];
        if (Array.isArray(lastArg) && lastArg.length == 1 && lastArg[0]instanceof HydraObject) {
            lastArg[0].addChild(child)
        } else {
            if (this.element && lastArg !== null) {
                this.element.addChild(child)
            }
        }
        return child
    }
    ;
    this.destroy = function() {
        if (this.onDestroy) {
            this.onDestroy()
        }
        for (var i in this.classes) {
            var clss = this.classes[i];
            if (clss && clss.destroy) {
                clss.destroy()
            }
        }
        this.clearTimers && this.clearTimers();
        this.classes = null;
        if (this.events) {
            this.events = this.events.destroy()
        }
        if (this.element && this.element.remove) {
            this.element = this.container = this.element.remove()
        }
        if (this.parent && this.parent.__destroyChild) {
            this.parent.__destroyChild(this.__id)
        }
        return Utils.nullObject(this)
    }
    ;
    this.clearTimers = function() {
        for (i = 0; i < _timers.length; i++) {
            clearTimeout(_timers[i])
        }
        _timers.length = 0
    }
    ;
    this.active = function(name, value, time) {
        if (typeof value !== "undefined") {
            _active[name] = value;
            if (time) {
                this.delayedCall(function() {
                    _active[name] = !_active[name]
                }, time)
            }
        } else {
            return _active[name]
        }
    }
    ;
    this.__destroyChild = function(name) {
        delete this.classes[name]
    }
});
Class(function Model(name) {
    Inherit(this, MVC);
    var _storage = {};
    this.push = function(name, val) {
        _storage[name] = val
    }
    ;
    this.pull = function(name) {
        return _storage[name]
    }
    ;
    this.initWithData = function(data) {
        this.STATIC_DATA = data;
        for (var key in this) {
            var model = this[key];
            var init = false;
            for (var i in data) {
                if (i.toLowerCase().replace(/-/g, "") == key.toLowerCase()) {
                    init = true;
                    if (model.init) {
                        model.init(data[i])
                    }
                }
            }
            if (!init && model.init) {
                model.init()
            }
        }
    }
    ;
    this.loadData = function(url, callback) {
        var _this = this;
        XHR.get(url + "?" + Utils.timestamp(), function(d) {
            defer(function() {
                _this.initWithData(d);
                callback(d)
            })
        })
    }
    ;
    this.Class = function(model) {
        var name = model.toString().match(/function ([^\(]+)/)[1];
        this[name] = new model()
    }
});
Class(function View(_child) {
    Inherit(this, MVC);
    var _resize;
    var name = Hydra.getClassName(_child);
    this.element = $("." + name);
    this.element.__useFragment = true;
    this.css = function(obj) {
        this.element.css(obj);
        return this
    }
    ;
    this.transform = function(obj) {
        this.element.transform(obj || this);
        return this
    }
    ;
    this.tween = function(props, time, ease, delay, callback, manual) {
        return this.element.tween(props, time, ease, delay, callback, manual)
    }
    ;
    var inter = Hydra.INTERFACES[name] || Hydra.INTERFACES[name + "UI"];
    if (inter) {
        this.ui = {};
        var params = Hydra.getArguments();
        params.push(_child);
        _resize = this.element.append(inter, params);
        var append = this.element.__append;
        for (var key in append) {
            this.ui[key] = append[key]
        }
        if (_resize) {
            this.resize = function() {
                _resize.apply(this.ui, arguments)
            }
        }
    }
    this.__call = function() {
        this.events.scope(this)
    }
});
Class(function Controller(name) {
    Inherit(this, MVC);
    name = Hydra.getClassName(name);
    this.element = this.container = $("#" + name);
    this.element.__useFragment = true;
    this.css = function(obj) {
        this.container.css(obj)
    }
});
Class(function Component() {
    Inherit(this, MVC);
    this.__call = function() {
        this.events.scope(this);
        delete this.__call
    }
});
Class(function Utils() {
    var _this = this;
    if (typeof Float32Array == "undefined") {
        Float32Array = Array
    }
    function rand(min, max) {
        return lerp(Math.random(), min, max)
    }
    function lerp(ratio, start, end) {
        return start + (end - start) * ratio
    }
    this.doRandom = function(min, max) {
        return Math.round(rand(min - 0.5, max + 0.5))
    }
    ;
    this.headsTails = function(heads, tails) {
        return !_this.doRandom(0, 1) ? heads : tails
    }
    ;
    this.toDegrees = function(rad) {
        return rad * (180 / Math.PI)
    }
    ;
    this.toRadians = function(deg) {
        return deg * (Math.PI / 180)
    }
    ;
    this.findDistance = function(p1, p2) {
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy)
    }
    ;
    this.timestamp = function() {
        var num = Date.now() + _this.doRandom(0, 99999);
        return num.toString()
    }
    ;
    this.hitTestObject = function(obj1, obj2) {
        var x1 = obj1.x
          , y1 = obj1.y
          , w = obj1.width
          , h = obj1.height;
        var xp1 = obj2.x
          , yp1 = obj2.y
          , wp = obj2.width
          , hp = obj2.height;
        var x2 = x1 + w
          , y2 = y1 + h
          , xp2 = xp1 + wp
          , yp2 = yp1 + hp;
        if (xp1 >= x1 && xp1 <= x2) {
            if (yp1 >= y1 && yp1 <= y2) {
                return true
            } else {
                if (y1 >= yp1 && y1 <= yp2) {
                    return true
                }
            }
        } else {
            if (x1 >= xp1 && x1 <= xp2) {
                if (yp1 >= y1 && yp1 <= y2) {
                    return true
                } else {
                    if (y1 >= yp1 && y1 <= yp2) {
                        return true
                    }
                }
            }
        }
        return false
    }
    ;
    this.randomColor = function() {
        var color = "#" + Math.floor(Math.random() * 16777215).toString(16);
        if (color.length < 7) {
            color = this.randomColor()
        }
        return color
    }
    ;
    this.touchEvent = function(e) {
        var touchEvent = {};
        touchEvent.x = 0;
        touchEvent.y = 0;
        if (e.windowsPointer) {
            return e
        }
        if (!e) {
            return touchEvent
        }
        if (e.touches || e.changedTouches) {
            if (e.touches.length) {
                touchEvent.x = e.touches[0].pageX;
                touchEvent.y = e.touches[0].pageY - Mobile.scrollTop
            } else {
                touchEvent.x = e.changedTouches[0].pageX;
                touchEvent.y = e.changedTouches[0].pageY - Mobile.scrollTop
            }
        } else {
            touchEvent.x = e.pageX;
            touchEvent.y = e.pageY
        }
        if (Mobile.orientationSet && Mobile.orientation !== Mobile.orientationSet) {
            if (window.orientation == 90 || window.orientation === 0) {
                var x = touchEvent.y;
                touchEvent.y = touchEvent.x;
                touchEvent.x = Stage.width - x
            }
            if (window.orientation == -90 || window.orientation === 180) {
                var y = touchEvent.x;
                touchEvent.x = touchEvent.y;
                touchEvent.y = Stage.height - y
            }
        }
        return touchEvent
    }
    ;
    this.clamp = function(num, min, max) {
        return Math.min(Math.max(num, min), max)
    }
    ;
    this.constrain = function(num, min, max) {
        return Math.min(Math.max(num, Math.min(min, max)), Math.max(min, max))
    }
    ;
    this.nullObject = function(object) {
        if (object.destroy || object.div) {
            for (var key in object) {
                if (typeof object[key] !== "undefined") {
                    object[key] = null
                }
            }
        }
        return null
    }
    ;
    this.convertRange = this.range = function(oldValue, oldMin, oldMax, newMin, newMax, clamped) {
        var oldRange = (oldMax - oldMin);
        var newRange = (newMax - newMin);
        var newValue = (((oldValue - oldMin) * newRange) / oldRange) + newMin;
        if (clamped) {
            return _this.clamp(newValue, Math.min(newMin, newMax), Math.max(newMin, newMax))
        }
        return newValue
    }
    ;
    String.prototype.strpos = function(str) {
        if (Array.isArray(str)) {
            for (var i = 0; i < str.length; i++) {
                if (this.indexOf(str[i]) > -1) {
                    return true
                }
            }
            return false
        } else {
            return this.indexOf(str) != -1
        }
    }
    ;
    String.prototype.clip = function(num, end) {
        return this.length > num ? this.slice(0, num) + end : this
    }
    ;
    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1)
    }
    ;
    Array.prototype.findAndRemove = function(reference) {
        var index = this.indexOf(reference);
        if (index > -1) {
            return this.splice(index, 1)
        }
    }
}, "Static");
Class(function CSS() {
    var _this = this;
    var _obj, _style, _needsUpdate;
    Hydra.ready(function() {
        _style = "";
        _obj = document.createElement("style");
        _obj.type = "text/css";
        document.getElementsByTagName("head")[0].appendChild(_obj)
    });
    function objToCSS(key) {
        var match = key.match(/[A-Z]/);
        var camelIndex = match ? match.index : null;
        if (camelIndex) {
            var start = key.slice(0, camelIndex);
            var end = key.slice(camelIndex);
            key = start + "-" + end.toLowerCase()
        }
        return key
    }
    function cssToObj(key) {
        var match = key.match(/\-/);
        var camelIndex = match ? match.index : null;
        if (camelIndex) {
            var start = key.slice(0, camelIndex);
            var end = key.slice(camelIndex).slice(1);
            var letter = end.charAt(0);
            end = end.slice(1);
            end = letter.toUpperCase() + end;
            key = start + end
        }
        return key
    }
    function setHTML() {
        _obj.innerHTML = _style;
        _needsUpdate = false
    }
    this._read = function() {
        return _style
    }
    ;
    this._write = function(css) {
        _style = css;
        if (!_needsUpdate) {
            _needsUpdate = true;
            Render.nextFrame(setHTML)
        }
    }
    ;
    this._toCSS = objToCSS;
    this.style = function(selector, obj) {
        var s = selector + " {";
        for (var key in obj) {
            var prop = objToCSS(key);
            var val = obj[key];
            if (typeof val !== "string" && key != "opacity") {
                val += "px"
            }
            s += prop + ":" + val + "!important;"
        }
        s += "}";
        _obj.innerHTML += s
    }
    ;
    this.get = function(selector, prop) {
        var values = new Object();
        var string = _obj.innerHTML.split(selector + " {");
        for (var i = 0; i < string.length; i++) {
            var str = string[i];
            if (!str.length) {
                continue
            }
            var split = str.split("!important;");
            for (var j in split) {
                if (split[j].strpos(":")) {
                    var fsplit = split[j].split(":");
                    if (fsplit[1].slice(-2) == "px") {
                        fsplit[1] = Number(fsplit[1].slice(0, -2))
                    }
                    values[cssToObj(fsplit[0])] = fsplit[1]
                }
            }
        }
        if (!prop) {
            return values
        } else {
            return values[prop]
        }
    }
    ;
    this.textSize = function($obj) {
        var $clone = $obj.clone();
        $clone.css({
            position: "relative",
            cssFloat: "left",
            styleFloat: "left",
            marginTop: -99999,
            width: "",
            height: ""
        });
        __body.addChild($clone);
        var width = $clone.div.offsetWidth;
        var height = $clone.div.offsetHeight;
        $clone.remove();
        return {
            width: width,
            height: height
        }
    }
    ;
    this.prefix = function(style) {
        return Device.styles.vendor == "" ? style.charAt(0).toLowerCase() + style.slice(1) : Device.styles.vendor + style
    }
}, "Static");
Class(function Device() {
    var _this = this;
    var _tagDiv;
    this.agent = navigator.userAgent.toLowerCase();
    this.detect = function(array) {
        if (typeof array === "string") {
            array = [array]
        }
        for (var i = 0; i < array.length; i++) {
            if (this.agent.strpos(array[i])) {
                return true
            }
        }
        return false
    }
    ;
    var prefix = (function() {
        var pre = "";
        if (!window._NODE_) {
            var styles = window.getComputedStyle(document.documentElement, "");
            pre = (Array.prototype.slice.call(styles).join("").match(/-(moz|webkit|ms)-/) || (styles.OLink === "" && ["", "o"]))[1];
            var dom = ("WebKit|Moz|MS|O").match(new RegExp("(" + pre + ")","i"))[1]
        } else {
            pre = "webkit"
        }
        var IE = _this.detect("trident");
        return {
            unprefixed: IE && !_this.detect("msie 9"),
            dom: dom,
            lowercase: pre,
            css: "-" + pre + "-",
            js: (IE ? pre[0] : pre[0].toUpperCase()) + pre.substr(1)
        }
    }
    )();
    function checkForTag(prop) {
        var div = _tagDiv || document.createElement("div")
          , vendors = "Khtml ms O Moz Webkit".split(" ")
          , len = vendors.length;
        _tagDiv = div;
        if (prop in div.style) {
            return true
        }
        prop = prop.replace(/^[a-z]/, function(val) {
            return val.toUpperCase()
        });
        while (len--) {
            if (vendors[len] + prop in div.style) {
                return true
            }
        }
        return false
    }
    this.mobile = !window._NODE_ && (!!(("ontouchstart"in window) || ("onpointerdown"in window)) && this.detect(["ios", "iphone", "ipad", "windows", "android", "blackberry"])) ? {} : false;
    if (this.mobile && this.detect("windows") && !this.detect("touch")) {
        this.mobile = false
    }
    if (this.mobile) {
        this.mobile.tablet = Math.max(screen.width, screen.height) > 800;
        this.mobile.phone = !this.mobile.tablet
    }
    this.browser = {};
    this.browser.ie = (function() {
        if (_this.detect("msie")) {
            return true
        }
        if (_this.detect("trident") && _this.detect("rv:")) {
            return true
        }
        if (_this.detect("windows") && _this.detect("edge")) {
            return true
        }
    }
    )();
    this.browser.chrome = !this.browser.ie && this.detect("chrome");
    this.browser.safari = !this.browser.chrome && !this.browser.ie && this.detect("safari");
    this.browser.firefox = this.detect("firefox");
    this.browser.version = (function() {
        try {
            if (_this.browser.chrome) {
                return Number(_this.agent.split("chrome/")[1].split(".")[0])
            }
            if (_this.browser.firefox) {
                return Number(_this.agent.split("firefox/")[1].split(".")[0])
            }
            if (_this.browser.safari) {
                return Number(_this.agent.split("version/")[1].split(".")[0].charAt(0))
            }
            if (_this.browser.ie) {
                if (_this.detect("msie")) {
                    return Number(_this.agent.split("msie ")[1].split(".")[0])
                }
                if (_this.detect("rv:")) {
                    return Number(_this.agent.split("rv:")[1].split(".")[0])
                }
                return Number(_this.agent.split("edge/")[1].split(".")[0])
            }
        } catch (e) {
            return -1
        }
    }
    )();
    this.vendor = prefix.css;
    this.transformProperty = (function() {
        switch (prefix.lowercase) {
        case "moz":
            return "-moz-transform";
            break;
        case "webkit":
            return "-webkit-transform";
            break;
        case "o":
            return "-o-transform";
            break;
        case "ms":
            return "-ms-transform";
            break;
        default:
            return "transform";
            break
        }
    }
    )();
    this.system = {};
    this.system.retina = window.devicePixelRatio > 1;
    this.system.webworker = typeof window.Worker !== "undefined";
    this.system.offline = typeof window.applicationCache !== "undefined";
    if (!window._NODE_) {
        this.system.geolocation = typeof navigator.geolocation !== "undefined";
        this.system.pushstate = typeof window.history.pushState !== "undefined"
    }
    this.system.webcam = !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    this.system.language = window.navigator.userLanguage || window.navigator.language;
    this.system.webaudio = typeof window.AudioContext !== "undefined";
    try {
        this.system.localStorage = typeof window.localStorage !== "undefined"
    } catch (e) {
        this.system.localStorage = false
    }
    this.system.fullscreen = typeof document[prefix.lowercase + "CancelFullScreen"] !== "undefined";
    this.system.os = (function() {
        if (_this.detect("mac os")) {
            return "mac"
        } else {
            if (_this.detect("windows nt 6.3")) {
                return "windows8.1"
            } else {
                if (_this.detect("windows nt 6.2")) {
                    return "windows8"
                } else {
                    if (_this.detect("windows nt 6.1")) {
                        return "windows7"
                    } else {
                        if (_this.detect("windows nt 6.0")) {
                            return "windowsvista"
                        } else {
                            if (_this.detect("windows nt 5.1")) {
                                return "windowsxp"
                            } else {
                                if (_this.detect("windows")) {
                                    return "windows"
                                } else {
                                    if (_this.detect("linux")) {
                                        return "linux"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return "undetected"
    }
    )();
    this.pixelRatio = window.devicePixelRatio;
    this.touchCapable = !!("ontouchstart"in window);
    this.media = {};
    this.media.audio = (function() {
        if (!!document.createElement("audio").canPlayType) {
            return _this.detect(["firefox", "opera"]) ? "ogg" : "mp3"
        } else {
            return false
        }
    }
    )();
    this.media.video = (function() {
        var vid = document.createElement("video");
        if (!!vid.canPlayType) {
            if (Device.mobile) {
                return "mp4"
            }
            if (_this.browser.chrome) {
                return "webm"
            }
            if (_this.browser.firefox || _this.browser.opera) {
                if (vid.canPlayType('video/webm; codecs="vorbis,vp8"')) {
                    return "webm"
                }
                return "ogv"
            }
            return "mp4"
        } else {
            return false
        }
    }
    )();
    this.graphics = {};
    this.graphics.webgl = (function() {
        try {
            var gl;
            var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
            var canvas = document.createElement("canvas");
            for (var i = 0; i < names.length; i++) {
                gl = canvas.getContext(names[i]);
                if (gl) {
                    break
                }
            }
            var info = gl.getExtension("WEBGL_debug_renderer_info");
            var output = {};
            if (info) {
                var gpu = info.UNMASKED_RENDERER_WEBGL;
                output.gpu = gl.getParameter(gpu).toLowerCase()
            }
            output.renderer = gl.getParameter(gl.RENDERER).toLowerCase();
            output.version = gl.getParameter(gl.VERSION).toLowerCase();
            output.glsl = gl.getParameter(gl.SHADING_LANGUAGE_VERSION).toLowerCase();
            return output
        } catch (e) {
            return false
        }
    }
    )();
    this.graphics.canvas = (function() {
        var canvas = document.createElement("canvas");
        return canvas.getContext ? true : false
    }
    )();
    this.styles = {};
    this.styles.filter = checkForTag("filter");
    this.styles.blendMode = checkForTag("mix-blend-mode");
    this.styles.vendor = prefix.unprefixed ? "" : prefix.js;
    this.styles.vendorTransition = this.styles.vendor.length ? this.styles.vendor + "Transition" : "transition";
    this.styles.vendorTransform = this.styles.vendor.length ? this.styles.vendor + "Transform" : "transform";
    this.tween = {};
    this.tween.transition = checkForTag("transition");
    this.tween.css2d = checkForTag("transform");
    this.tween.css3d = checkForTag("perspective");
    this.tween.complete = (function() {
        if (prefix.unprefixed) {
            return "transitionend"
        }
        return prefix.lowercase + "TransitionEnd"
    }
    )();
    this.test = function(name, test) {
        this[name] = test()
    }
    ;
    this.detectGPU = function(matches) {
        var gpu = _this.graphics.webgl;
        if (gpu.gpu && gpu.gpu.strpos(matches)) {
            return true
        }
        if (gpu.version && gpu.version.strpos(matches)) {
            return true
        }
        return false
    }
    ;
    function checkFullscreen() {
        if (!_this.getFullscreen()) {
            HydraEvents._fireEvent(HydraEvents.FULLSCREEN, {
                fullscreen: false
            });
            Render.stop(checkFullscreen)
        }
    }
    this.openFullscreen = function(obj) {
        obj = obj || __body;
        if (obj && _this.system.fullscreen) {
            if (obj == __body) {
                obj.css({
                    top: 0
                })
            }
            obj.div[prefix.lowercase + "RequestFullScreen"]();
            HydraEvents._fireEvent(HydraEvents.FULLSCREEN, {
                fullscreen: true
            });
            Render.start(checkFullscreen, 10)
        }
    }
    ;
    this.closeFullscreen = function() {
        if (_this.system.fullscreen) {
            document[prefix.lowercase + "CancelFullScreen"]()
        }
        Render.stop(checkFullscreen)
    }
    ;
    this.getFullscreen = function() {
        if (_this.browser.firefox) {
            return document.mozFullScreen
        }
        return document[prefix.lowercase + "IsFullScreen"]
    }
}, "Static");
Class(function DynamicObject(_properties) {
    var prototype = DynamicObject.prototype;
    if (_properties) {
        for (var key in _properties) {
            this[key] = _properties[key]
        }
    }
    this._tweens = {};
    if (typeof prototype.tween !== "undefined") {
        return
    }
    prototype.tween = function(properties, time, ease, delay, update, complete) {
        if (typeof delay !== "number") {
            complete = update;
            update = delay;
            delay = 0
        }
        if (!this.multiTween) {
            this.stopTween()
        }
        if (typeof complete !== "function") {
            complete = null
        }
        if (typeof update !== "function") {
            update = null
        }
        this._tween = TweenManager.tween(this, properties, time, ease, delay, complete, update);
        return this._tween
    }
    ;
    prototype.stopTween = function(tween) {
        var _tween = tween || this._tween;
        if (_tween && _tween.stop) {
            _tween.stop()
        }
    }
    ;
    prototype.pause = function() {
        var _tween = this._tween;
        if (_tween && _tween.pause) {
            _tween.pause()
        }
    }
    ;
    prototype.resume = function() {
        var _tween = this._tween;
        if (_tween && _tween.resume) {
            _tween.resume()
        }
    }
    ;
    prototype.copy = function(pool) {
        var c = pool && pool.get ? pool.get() : new DynamicObject();
        for (var key in this) {
            if (typeof this[key] === "number") {
                c[key] = this[key]
            }
        }
        return c
    }
    ;
    prototype.copyFrom = function(obj) {
        for (var key in obj) {
            if (typeof obj[key] == "number") {
                this[key] = obj[key]
            }
        }
    }
    ;
    prototype.copyTo = function(obj) {
        for (var key in obj) {
            if (typeof this[key] == "number") {
                obj[key] = this[key]
            }
        }
    }
    ;
    prototype.clear = function() {
        for (var key in this) {
            if (typeof this[key] !== "function") {
                delete this[key]
            }
        }
        return this
    }
});
Class(function ObjectPool(_type, _number) {
    Inherit(this, Component);
    var _this = this;
    var _pool = [];
    (function() {
        if (_type) {
            _number = _number || 10;
            _type = _type || Object;
            for (var i = 0; i < _number; i++) {
                _pool.push(new _type())
            }
        }
    }
    )();
    this.get = function() {
        return _pool.shift()
    }
    ;
    this.empty = function() {
        _pool.length = 0
    }
    ;
    this.put = function(obj) {
        if (obj) {
            _pool.push(obj)
        }
    }
    ;
    this.insert = function(array) {
        if (typeof array.push === "undefined") {
            array = [array]
        }
        for (var i = 0; i < array.length; i++) {
            _pool.push(array[i])
        }
    }
    ;
    this.onDestroy = function() {
        for (var i = 0; i < _pool.length; i++) {
            if (_pool[i].destroy) {
                _pool[i].destroy()
            }
        }
        _pool = null
    }
});
Class(function LinkedList() {
    var prototype = LinkedList.prototype;
    this.length = 0;
    this.first = null;
    this.last = null;
    this.current = null;
    this.prev = null;
    if (typeof prototype.push !== "undefined") {
        return
    }
    prototype.push = function(obj) {
        if (!this.first) {
            this.first = obj;
            this.last = obj;
            obj.__prev = obj;
            obj.__next = obj
        } else {
            obj.__next = this.first;
            obj.__prev = this.last;
            this.last.__next = obj;
            this.last = obj
        }
        this.length++
    }
    ;
    prototype.remove = function(obj) {
        if (!obj || !obj.__next) {
            return
        }
        if (this.length <= 1) {
            this.empty()
        } else {
            if (obj == this.first) {
                this.first = obj.__next;
                this.last.__next = this.first;
                this.first.__prev = this.last
            } else {
                if (obj == this.last) {
                    this.last = obj.__prev;
                    this.last.__next = this.first;
                    this.first.__prev = this.last
                } else {
                    obj.__prev.__next = obj.__next;
                    obj.__next.__prev = obj.__prev
                }
            }
            this.length--
        }
        obj.__prev = null;
        obj.__next = null
    }
    ;
    prototype.empty = function() {
        this.first = null;
        this.last = null;
        this.current = null;
        this.prev = null;
        this.length = 0
    }
    ;
    prototype.start = function() {
        this.current = this.first;
        this.prev = this.current;
        return this.current
    }
    ;
    prototype.next = function() {
        if (!this.current) {
            return
        }
        this.current = this.current.__next;
        if (this.length == 1 || this.prev.__next == this.first) {
            return
        }
        this.prev = this.current;
        return this.current
    }
    ;
    prototype.destroy = function() {
        Utils.nullObject(this);
        return null
    }
});
Class(function Pact() {
    var _this = this;
    Namespace(this);
    (function() {}
    )();
    this.create = function() {
        return new _this.Broadcaster(arguments)
    }
    ;
    this.batch = function() {
        return new _this.Batch()
    }
}, "Static");
Pact.Class(function Broadcaster(_arguments) {
    var _this = this;
    var _success, _error;
    var _fired;
    var _callbacks = [];
    this._fire = this.fire = function() {
        if (_fired) {
            return
        }
        _fired = true;
        var args = arguments;
        var fired = false;
        Render.nextFrame(function() {
            if (_error || _success) {
                var arg0 = args[0];
                var arg1 = args[1];
                if (arg0 instanceof Error) {
                    if (_error) {
                        _error.apply(_this, [arg0])
                    }
                    fired = true
                } else {
                    if (arg1 instanceof Error) {
                        if (_error) {
                            _error.apply(_this, [arg1])
                        }
                        fired = true
                    } else {
                        if (!arg0 && arg1 && _success) {
                            _success.apply(_this, [arg1]);
                            fired = true
                        }
                        if (!arg1 && arg0 && _success) {
                            _success.apply(_this, [arg0]);
                            fired = true
                        }
                    }
                }
            }
            if (!fired && _callbacks.length) {
                var callback = _callbacks.shift();
                callback.apply(_this, args);
                if (_callbacks.length) {
                    _fired = false
                }
            }
        })
    }
    ;
    this.exec = function() {
        exec(arguments);
        return this
    }
    ;
    this.then = function(callback) {
        _callbacks.push(callback);
        return this
    }
    ;
    this.error = function(error) {
        _error = error;
        return this
    }
    ;
    this.success = function(success) {
        _success = success;
        return this
    }
    ;
    function exec(argz) {
        var args = [];
        var fn = argz[0];
        for (var i = 1; i < argz.length; i++) {
            args.push(argz[i])
        }
        args.push(_this._fire);
        fn.apply(fn, args)
    }
    if (_arguments.length) {
        exec(_arguments)
    }
});
Pact.Class(function Batch() {
    Inherit(this, Events);
    var _this = this;
    var _count = 0;
    var _complete = [];
    var _success = [];
    var _error = [];
    var _emitters = [];
    this.push = function(emitter) {
        emitter.then(thenHandler).error(errorHandler).success(successHandler);
        _emitters.push(emitter)
    }
    ;
    this.timeout = function() {
        _this.events.fire(HydraEvents.COMPLETE, {
            complete: _complete,
            success: _success,
            error: _error
        })
    }
    ;
    function successHandler() {
        this.data = arguments;
        _success.push(this);
        checkComplete();
        _this.events.fire(HydraEvents.UPDATE)
    }
    function errorHandler() {
        this.data = arguments;
        _error.push(this);
        checkComplete();
        _this.events.fire(HydraEvents.UPDATE)
    }
    function thenHandler() {
        this.data = arguments;
        _complete.push(this);
        checkComplete();
        _this.events.fire(HydraEvents.UPDATE)
    }
    function checkComplete() {
        _count++;
        if (_count == _emitters.length) {
            _this.events.fire(HydraEvents.COMPLETE, {
                complete: _complete,
                success: _success,
                error: _error
            })
        }
    }
});
Class(function Mouse() {
    var _this = this;
    var _capturing;
    this.x = 0;
    this.y = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.moveX = 0;
    this.moveY = 0;
    this.autoPreventClicks = false;
    function moved(e) {
        _this.lastX = _this.x;
        _this.lastY = _this.y;
        _this.ready = true;
        if (e.windowsPointer) {
            _this.x = e.x;
            _this.y = e.y
        } else {
            var convert = Utils.touchEvent(e);
            _this.x = convert.x;
            _this.y = convert.y
        }
        _this.moveX = _this.x - _this.lastX;
        _this.moveY = _this.y - _this.lastY;
        defer(resetMove)
    }
    this.capture = function(x, y) {
        if (_capturing) {
            return false
        }
        _capturing = true;
        _this.x = x || 0;
        _this.y = y || 0;
        if (!Device.mobile) {
            __window.bind("mousemove", moved)
        } else {
            __window.bind("touchmove", moved);
            __window.bind("touchstart", moved)
        }
    }
    ;
    this.stop = function() {
        if (!_capturing) {
            return false
        }
        _capturing = false;
        _this.x = 0;
        _this.y = 0;
        if (!Device.mobile) {
            __window.unbind("mousemove", moved)
        } else {
            __window.unbind("touchmove", moved);
            __window.unbind("touchstart", moved)
        }
    }
    ;
    this.preventClicks = function() {
        _this._preventClicks = true;
        Timer.create(function() {
            _this._preventClicks = false
        }, 300)
    }
    ;
    this.preventFireAfterClick = function() {
        _this._preventFire = true
    }
    ;
    function resetMove() {
        _this.moveX = 0;
        _this.moveY = 0
    }
}, "Static");
Class(function Render() {
    var _this = this;
    var _timer, _last, _timerName;
    var _render = [];
    var _time = Date.now();
    var _list0 = new LinkedList();
    var _list1 = new LinkedList();
    var _list = _list0;
    var _timeSinceRender = 0;
    this.TIME = Date.now();
    this.TARGET_FPS = 60;
    (function() {
        if (!THREAD) {
            requestAnimationFrame(render);
            Hydra.ready(addListeners)
        }
    }
    )();
    function render() {
        var t = Date.now();
        var timeSinceLoad = t - _time;
        var diff = 0;
        var fps = 60;
        if (_last) {
            diff = t - _last;
            fps = 1000 / diff
        }
        _last = t;
        _this.FPS = fps;
        _this.TIME = t;
        _this.DELTA = diff;
        _this.TSL = timeSinceLoad;
        for (var i = _render.length - 1; i > -1; i--) {
            var callback = _render[i];
            if (!callback) {
                continue
            }
            if (callback.fps) {
                _timeSinceRender += diff > 200 ? 0 : diff;
                if (_timeSinceRender < (1000 / callback.fps)) {
                    continue
                }
                _timeSinceRender -= (1000 / callback.fps)
            }
            callback(t, timeSinceLoad, diff, fps, callback.frameCount++)
        }
        if (_list.length) {
            fireCallbacks()
        }
        if (!THREAD) {
            requestAnimationFrame(render)
        }
    }
    function fireCallbacks() {
        var list = _list;
        _list = _list == _list0 ? _list1 : _list0;
        var callback = list.start();
        while (callback) {
            var last = callback;
            callback();
            callback = list.next();
            last.__prev = last.__next = last = null
        }
        list.empty()
    }
    function addListeners() {
        HydraEvents._addEvent(HydraEvents.BROWSER_FOCUS, focus, _this)
    }
    function focus(e) {
        if (e.type == "focus") {
            _last = Date.now()
        }
    }
    this.startRender = this.start = function(callback, fps) {
        var allowed = true;
        var count = _render.length - 1;
        if (this.TARGET_FPS < 60) {
            fps = this.TARGET_FPS
        }
        if (typeof fps == "number") {
            callback.fps = fps
        }
        callback.frameCount = 0;
        if (_render.indexOf(callback) == -1) {
            _render.push(callback)
        }
    }
    ;
    this.stopRender = this.stop = function(callback) {
        var i = _render.indexOf(callback);
        if (i > -1) {
            _render.splice(i, 1)
        }
    }
    ;
    this.startTimer = function(name) {
        _timerName = name || "Timer";
        if (console.time && !window._NODE_) {
            console.time(_timerName)
        } else {
            _timer = Date.now()
        }
    }
    ;
    this.stopTimer = function() {
        if (console.time && !window._NODE_) {
            console.timeEnd(_timerName)
        } else {
            console.log("Render " + _timerName + ": " + (Date.now() - _timer))
        }
    }
    ;
    this.nextFrame = function(callback) {
        _list.push(callback)
    }
    ;
    this.setupTween = function(callback) {
        _this.nextFrame(function() {
            _this.nextFrame(callback)
        })
    }
    ;
    this.tick = function() {
        render()
    }
    ;
    this.onIdle = function(callback, max) {
        if (window.requestIdleCallback && false) {
            if (max) {
                max = {
                    timeout: max
                }
            }
            return window.requestIdleCallback(callback, max)
        } else {
            var start = _this.TIME;
            return defer(function() {
                callback({
                    didTimeout: false,
                    timeRemaining: function() {
                        return Math.max(0, 50 - (_this.TIME - start))
                    }
                })
            })
        }
    }
    ;
    window.defer = this.nextFrame;
    window.nextFrame = this.setupTween;
    window.onIdle = this.onIdle
}, "Static");
Class(function HydraEvents() {
    var _events = [];
    var _e = {};
    this.BROWSER_FOCUS = "hydra_focus";
    this.HASH_UPDATE = "hydra_hash_update";
    this.COMPLETE = "hydra_complete";
    this.PROGRESS = "hydra_progress";
    this.UPDATE = "hydra_update";
    this.LOADED = "hydra_loaded";
    this.END = "hydra_end";
    this.FAIL = "hydra_fail";
    this.SELECT = "hydra_select";
    this.ERROR = "hydra_error";
    this.READY = "hydra_ready";
    this.RESIZE = "hydra_resize";
    this.CLICK = "hydra_click";
    this.HOVER = "hydra_hover";
    this.MESSAGE = "hydra_message";
    this.ORIENTATION = "orientation";
    this.BACKGROUND = "background";
    this.BACK = "hydra_back";
    this.PREVIOUS = "hydra_previous";
    this.NEXT = "hydra_next";
    this.RELOAD = "hydra_reload";
    this.FULLSCREEN = "hydra_fullscreen";
    this._checkDefinition = function(evt) {
        if (typeof evt == "undefined") {
            throw "Undefined event"
        }
    }
    ;
    this._addEvent = function(e, callback, object) {
        if (this._checkDefinition) {
            this._checkDefinition(e)
        }
        var add = new Object();
        add.evt = e;
        add.object = object;
        add.callback = callback;
        _events.push(add)
    }
    ;
    this._removeEvent = function(eventString, callback) {
        if (this._checkDefinition) {
            this._checkDefinition(eventString)
        }
        defer(function() {
            for (var i = _events.length - 1; i > -1; i--) {
                if (_events[i].evt == eventString && _events[i].callback == callback) {
                    _events[i] = null;
                    _events.splice(i, 1)
                }
            }
        })
    }
    ;
    this._destroyEvents = function(object) {
        for (var i = _events.length - 1; i > -1; i--) {
            if (_events[i].object == object) {
                _events[i] = null;
                _events.splice(i, 1)
            }
        }
    }
    ;
    this._fireEvent = function(eventString, obj) {
        if (this._checkDefinition) {
            this._checkDefinition(eventString)
        }
        var fire = true;
        obj = obj || _e;
        obj.cancel = function() {
            fire = false
        }
        ;
        for (var i = 0; i < _events.length; i++) {
            if (_events[i].evt == eventString) {
                if (fire) {
                    _events[i].callback(obj)
                } else {
                    return false
                }
            }
        }
    }
    ;
    this._consoleEvents = function() {
        console.log(_events)
    }
    ;
    this.createLocalEmitter = function(child) {
        var events = new HydraEvents();
        child.on = events._addEvent;
        child.off = events._removeEvent;
        child.fire = events._fireEvent
    }
}, "Static");
Class(function Events(_this) {
    this.events = {};
    var _events = {};
    var _e = {};
    this.events.subscribe = function(evt, callback) {
        HydraEvents._addEvent(evt, !!callback._fire ? callback._fire : callback, _this);
        return callback
    }
    ;
    this.events.unsubscribe = function(evt, callback) {
        HydraEvents._removeEvent(evt, !!callback._fire ? callback._fire : callback)
    }
    ;
    this.events.fire = function(evt, obj, skip) {
        obj = obj || _e;
        HydraEvents._checkDefinition(evt);
        if (_events[evt]) {
            obj.target = obj.target || _this;
            _events[evt](obj);
            obj.target = null
        } else {
            if (!skip) {
                HydraEvents._fireEvent(evt, obj)
            }
        }
    }
    ;
    this.events.add = function(evt, callback) {
        HydraEvents._checkDefinition(evt);
        _events[evt] = !!callback._fire ? callback._fire : callback;
        return callback
    }
    ;
    this.events.remove = function(evt) {
        HydraEvents._checkDefinition(evt);
        if (_events[evt]) {
            delete _events[evt]
        }
    }
    ;
    this.events.bubble = function(object, evt) {
        HydraEvents._checkDefinition(evt);
        var _this = this;
        object.events.add(evt, function(e) {
            _this.fire(evt, e)
        })
    }
    ;
    this.events.scope = function(ref) {
        _this = ref
    }
    ;
    this.events.destroy = function() {
        HydraEvents._destroyEvents(_this);
        _events = null;
        _this = null;
        return null
    }
});
Class(function Dispatch() {
    var _this = this;
    var _callbacks = {};
    function empty() {}
    this.register = function(object, method) {
        defer(function() {
            _callbacks[Hydra.getClassName(object) + "-" + method] = object[method]
        })
    }
    ;
    this.find = function(object, method, args) {
        var path = object.toString().match(/function ([^\(]+)/)[1] + "-" + method;
        if (_callbacks[path]) {
            return _callbacks[path]
        } else {
            delete _callbacks[path];
            return empty
        }
    }
}, "static");
Class(function Mobile() {
    Inherit(this, Component);
    var _this = this;
    var _lastTime;
    var _cancelScroll = true;
    var _scrollTarget = {};
    var _hideNav, _iMax, _iFull, _iLock, _iLast, _orientationPrevent, _type;
    this.sleepTime = 10000;
    this.scrollTop = 0;
    this.autoResizeReload = true;
    if (Device.mobile) {
        for (var b in Device.browser) {
            Device.browser[b] = false
        }
        setInterval(checkTime, 250);
        this.phone = Device.mobile.phone;
        this.tablet = Device.mobile.tablet;
        this.orientation = Math.abs(window.orientation) == 90 ? "landscape" : "portrait";
        this.os = (function() {
            if (Device.detect("windows", "iemobile")) {
                return "Windows"
            }
            if (Device.detect(["ipad", "iphone"])) {
                return "iOS"
            }
            if (Device.detect(["android", "kindle"])) {
                return "Android"
            }
            if (Device.detect("blackberry")) {
                return "Blackberry"
            }
            return "Unknown"
        }
        )();
        this.version = (function() {
            try {
                if (_this.os == "iOS") {
                    var num = Device.agent.split("os ")[1].split("_");
                    var main = num[0];
                    var sub = num[1].split(" ")[0];
                    return Number(main + "." + sub)
                }
                if (_this.os == "Android") {
                    var version = Device.agent.split("android ")[1].split(";")[0];
                    if (version.length > 3) {
                        version = version.slice(0, -2)
                    }
                    return Number(version)
                }
                if (_this.os == "Windows") {
                    if (Device.agent.strpos("rv:11")) {
                        return 11
                    }
                    return Number(Device.agent.split("windows phone ")[1].split(";")[0])
                }
            } catch (e) {}
            return -1
        }
        )();
        this.browser = (function() {
            if (_this.os == "iOS") {
                if (Device.detect(["twitter", "fbios"])) {
                    return "Social"
                }
                if (Device.detect("crios")) {
                    return "Chrome"
                }
                if (Device.detect("safari")) {
                    return "Safari"
                }
                return "Unknown"
            }
            if (_this.os == "Android") {
                if (Device.detect("chrome")) {
                    return "Chrome"
                }
                if (Device.detect("firefox")) {
                    return "Firefox"
                }
                return "Browser"
            }
            if (_this.os == "Windows") {
                return "IE"
            }
            return "Unknown"
        }
        )();
        Hydra.ready(function() {
            window.onresize = resizeHandler;
            if (_this.browser == "Safari" && (!_this.NativeCore || !_this.NativeCore.active)) {
                document.body.scrollTop = 0;
                __body.css({
                    height: "101%"
                })
            }
            setHeight();
            _this.orientation = Stage.width > Stage.height ? "landscape" : "portrait";
            if (!(_this.NativeCore && _this.NativeCore.active)) {
                window.addEventListener("touchstart", touchStart)
            } else {
                Stage.css({
                    overflow: "hidden"
                })
            }
            determineType();
            _type = _this.phone ? "phone" : "tablet"
        });
        function determineType() {
            Device.mobile.tablet = (function() {
                if (Stage.width > Stage.height) {
                    return document.body.clientWidth > 800
                } else {
                    return document.body.clientHeight > 800
                }
            }
            )();
            Device.mobile.phone = !Device.mobile.tablet;
            _this.phone = Device.mobile.phone;
            _this.tablet = Device.mobile.tablet
        }
        function setHeight() {
            Stage.width = document.body.clientWidth;
            Stage.height = document.body.clientHeight
        }
        function resizeHandler() {
            clearTimeout(_this.fireResize);
            if (!_this.allowScroll) {
                document.body.scrollTop = 0
            }
            _this.fireResize = _this.delayedCall(function() {
                setHeight();
                determineType();
                var type = _this.phone ? "phone" : "tablet";
                if (_this.os == "iOS" && type != _type && _this.autoResizeReload) {
                    window.location.reload()
                }
                _this.orientation = Stage.width > Stage.height ? "landscape" : "portrait";
                _this.events.fire(HydraEvents.RESIZE)
            }, 32)
        }
        function orientationChange() {
            _this.delayedCall(function() {
                Stage.width = document.body.clientWidth;
                Stage.height = document.body.clientHeight;
                HydraEvents._fireEvent(HydraEvents.ORIENTATION, {
                    orientation: _this.orientation
                })
            }, 32);
            if (_this.tablet && _this.browser == "Chrome" && _iMax) {
                _iMax = document.body.clientHeight
            }
            if (_this.phone && _iMax) {
                _iMax = Stage.height;
                if (_this.orientation == "portrait" && _this.browser == "Safari") {
                    _iFull = false;
                    document.body.scrollTop = 0;
                    checkHeight(true);
                    _orientationPrevent = true;
                    _this.delayedCall(function() {
                        _orientationPrevent = false
                    }, 100)
                }
            }
        }
        function touchStart(e) {
            var touch = Utils.touchEvent(e);
            var target = e.target;
            var inputElement = target.nodeName == "INPUT" || target.nodeName == "TEXTAREA" || target.nodeName == "SELECT" || target.nodeName == "A";
            if (_this.allowScroll || inputElement) {
                return
            }
            if (_iMax) {
                if (!_iFull) {
                    return
                }
                if (_this.browser == "Chrome" && touch.y < 50) {
                    e.stopPropagation();
                    return
                }
            }
            if (_cancelScroll) {
                return e.preventDefault()
            }
            var prevent = true;
            target = e.target;
            while (target.parentNode) {
                if (target._scrollParent) {
                    prevent = false;
                    _scrollTarget.target = target;
                    _scrollTarget.y = touch.y;
                    target.hydraObject.__preventY = touch.y
                }
                target = target.parentNode
            }
            if (prevent) {
                e.preventDefault()
            }
        }
    }
    function checkTime() {
        var time = Date.now();
        if (_lastTime) {
            if (time - _lastTime > _this.sleepTime) {
                _this.events.fire(HydraEvents.BACKGROUND)
            }
        }
        _lastTime = time
    }
    function initIOSFullscreen() {
        _hideNav = true;
        _cancelScroll = false;
        _iMax = Stage.height;
        __body.css({
            height: Stage.height * 3
        });
        Stage.css({
            position: "fixed"
        });
        __window.bind("scroll", scrollHandler);
        setInterval(checkHeight, 1000)
    }
    function scrollHandler(e) {
        if (_orientationPrevent) {
            return
        }
        Stage.width = document.body.clientWidth;
        Stage.height = document.body.clientHeight;
        _this.scrollTop = document.body.scrollTop;
        if (Stage.height != _iLast) {
            _this.events.fire(HydraEvents.RESIZE)
        }
        _iLast = Stage.height;
        if (_this.scrollTop > 20) {
            if (!_iFull) {
                _this.events.fire(HydraEvents.FULLSCREEN, {
                    fullscreen: true
                })
            }
            _iFull = true;
            clearTimeout(_this.changeHeight);
            _this.changeHeight = _this.delayedCall(function() {
                _iMax = Stage.height
            }, 100)
        }
        checkHeight()
    }
    function checkHeight(force) {
        if ((document.body.clientHeight < _iMax && _iFull) || force) {
            Stage.height = document.body.clientHeight;
            _iFull = false;
            _iMax = Stage.height;
            document.body.scrollTop = 0;
            resizeHandler();
            _this.events.fire(HydraEvents.FULLSCREEN, {
                fullscreen: false
            })
        }
    }
    this.Class = window.Class;
    this.fullscreen = function() {
        if (_this.NativeCore && _this.NativeCore.active) {
            return
        }
        if (_this.os == "Android") {
            __window.bind("touchstart", function() {
                Device.openFullscreen()
            });
            return true
        } else {
            if (_this.os == "iOS" && _this.version >= 7) {
                if (_this.browser == "Chrome" || _this.browser == "Safari") {
                    initIOSFullscreen();
                    return true
                }
            }
        }
        return false
    }
    ;
    this.overflowScroll = function($object, dir) {
        if (!Device.mobile) {
            return false
        }
        var x = !!dir.x;
        var y = !!dir.y;
        var overflow = {
            "-webkit-overflow-scrolling": "touch"
        };
        if ((!x && !y) || (x && y)) {
            overflow.overflow = "scroll"
        }
        if (!x && y) {
            overflow.overflowY = "scroll";
            overflow.overflowX = "hidden"
        }
        if (x && !y) {
            overflow.overflowX = "scroll";
            overflow.overflowY = "hidden"
        }
        $object.css(overflow);
        $object.div._scrollParent = true;
        _cancelScroll = false;
        $object.div._preventEvent = function(e) {
            if ($object.maxScroll) {
                var touch = Utils.touchEvent(e);
                var delta = touch.y - $object.__preventY < 0 ? 1 : -1;
                if ($object.div.scrollTop < 2) {
                    if (delta == -1) {
                        e.preventDefault()
                    } else {
                        e.stopPropagation()
                    }
                } else {
                    if ($object.div.scrollTop > $object.maxScroll - 2) {
                        if (delta == 1) {
                            e.preventDefault()
                        } else {
                            e.stopPropagation()
                        }
                    }
                }
            } else {
                e.stopPropagation()
            }
        }
        ;
        $object.div.addEventListener("touchmove", $object.div._preventEvent)
    }
    ;
    this.removeOverflowScroll = function($object) {
        $object.css({
            overflow: "hidden",
            overflowX: "",
            overflowY: "",
            "-webkit-overflow-scrolling": ""
        });
        $object.div.removeEventListener("touchmove", $object.div._preventEvent)
    }
    ;
    this.setOrientation = function(type) {
        if (_this.System && _this.NativeCore.active) {
            _this.System.orientation = _this.System[type.toUpperCase()];
            return
        }
        if (window.screen && Device.mobile) {
            if (window.screen.lockOrientation) {
                if (type == "landscape") {
                    window.screen.lockOrientation("landscape-primary", "landscape-secondary")
                } else {
                    window.screen.lockOrientation("portrait-primary", "portrait-secondary")
                }
            }
            if (window.screen.orientation && window.screen.orientation.lock) {
                if (type == "landscape") {
                    window.screen.orientation.lock("landscape-primary", "landscape-secondary")
                } else {
                    window.screen.orientation.lock("portrait-primary", "portrait-secondary")
                }
            }
        }
    }
    ;
    this.isNative = function() {
        return _this.NativeCore && _this.NativeCore.active
    }
}, "Static");
Class(function Modules() {
    var _this = this;
    var _modules = {};
    (function() {
        defer(exec)
    }
    )();
    function exec() {
        for (var m in _modules) {
            for (var key in _modules[m]) {
                var module = _modules[m][key];
                if (module._ready) {
                    continue
                }
                module._ready = true;
                if (module.exec) {
                    module.exec()
                }
            }
        }
    }
    function requireModule(root, path) {
        var module = _modules[root][path];
        if (!module._ready) {
            module._ready = true;
            if (module.exec) {
                module.exec()
            }
        }
        return module
    }
    this.push = function(module) {}
    ;
    this.Module = function(module) {
        var m = new module();
        var name = module.toString().slice(0, 100).match(/function ([^\(]+)/);
        if (name) {
            m._ready = true;
            name = name[1];
            _modules[name] = {
                index: m
            }
        } else {
            if (!_modules[m.module]) {
                _modules[m.module] = {}
            }
            _modules[m.module][m.path] = m
        }
    }
    ;
    this.require = function(path) {
        var root;
        if (!path.strpos("/")) {
            root = path;
            path = "index"
        } else {
            root = path.split("/")[0];
            path = path.replace(root + "/", "")
        }
        return requireModule(root, path).exports
    }
    ;
    window.Module = this.Module;
    if (!window._NODE_) {
        window.requireNative = window.require;
        window.require = this.require
    }
}, "Static");
Class(function Timer() {
    var _this = this;
    var _clearTimeout;
    var _callbacks = [];
    (function() {
        Render.start(loop)
    }
    )();
    function loop(t, tsl, delta) {
        for (var i = 0; i < _callbacks.length; i++) {
            var c = _callbacks[i];
            c.current += delta;
            if (c.current >= c.time) {
                c();
                _callbacks.findAndRemove(c)
            }
        }
    }
    function find(ref) {
        for (var i = _callbacks.length - 1; i > -1; i--) {
            var c = _callbacks[i];
            if (c.ref == ref) {
                return c
            }
        }
    }
    _clearTimeout = window.clearTimeout;
    window.clearTimeout = function(ref) {
        var c = find(ref);
        if (c) {
            _callbacks.findAndRemove(c)
        } else {
            _clearTimeout(ref)
        }
    }
    ;
    this.create = function(callback, time) {
        callback.time = time;
        callback.current = 0;
        callback.ref = Utils.timestamp();
        _callbacks.push(callback);
        return callback.ref
    }
}, "static");
Class(function Color(_value) {
    Inherit(this, Component);
    var _this = this;
    var _hsl, _array;
    this.r = 1;
    this.g = 1;
    this.b = 1;
    (function() {
        set(_value)
    }
    )();
    function set(value) {
        if (value instanceof Color) {
            copy(value)
        } else {
            if (typeof value === "number") {
                setHex(value)
            } else {
                if (Array.isArray(value)) {
                    setRGB(value)
                } else {
                    setHex(Number("0x" + value.slice(1)))
                }
            }
        }
    }
    function copy(color) {
        _this.r = color.r;
        _this.g = color.g;
        _this.b = color.b
    }
    function setHex(hex) {
        hex = Math.floor(hex);
        _this.r = (hex >> 16 & 255) / 255;
        _this.g = (hex >> 8 & 255) / 255;
        _this.b = (hex & 255) / 255
    }
    function setRGB(values) {
        _this.r = values[0];
        _this.g = values[1];
        _this.b = values[2]
    }
    function hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1
        }
        if (t > 1) {
            t -= 1
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t
        }
        if (t < 1 / 2) {
            return q
        }
        if (t < 2 / 3) {
            return p + (q - p) * 6 * (2 / 3 - t)
        }
        return p
    }
    this.set = function(value) {
        set(value);
        return this
    }
    ;
    this.setRGB = function(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
        return this
    }
    ;
    this.setHSL = function(h, s, l) {
        if (s === 0) {
            this.r = this.g = this.b = l
        } else {
            var p = l <= 0.5 ? l * (1 + s) : l + s - (l * s);
            var q = (2 * l) - p;
            this.r = hue2rgb(q, p, h + 1 / 3);
            this.g = hue2rgb(q, p, h);
            this.b = hue2rgb(q, p, h - 1 / 3)
        }
        return this
    }
    ;
    this.offsetHSL = function(h, s, l) {
        var hsl = this.getHSL();
        hsl.h += h;
        hsl.s += s;
        hsl.l += l;
        this.setHSL(hsl.h, hsl.s, hsl.l);
        return this
    }
    ;
    this.getStyle = function() {
        return "rgb(" + ((this.r * 255) | 0) + "," + ((this.g * 255) | 0) + "," + ((this.b * 255) | 0) + ")"
    }
    ;
    this.getHex = function() {
        return (this.r * 255) << 16 ^ (this.g * 255) << 8 ^ (this.b * 255) << 0
    }
    ;
    this.getHexString = function() {
        return "#" + ("000000" + this.getHex().toString(16)).slice(-6)
    }
    ;
    this.getHSL = function() {
        _hsl = _hsl || {
            h: 0,
            s: 0,
            l: 0
        };
        var hsl = _hsl;
        var r = this.r
          , g = this.g
          , b = this.b;
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var hue, saturation;
        var lightness = (min + max) / 2;
        if (min === max) {
            hue = 0;
            saturation = 0
        } else {
            var delta = max - min;
            saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);
            switch (max) {
            case r:
                hue = (g - b) / delta + (g < b ? 6 : 0);
                break;
            case g:
                hue = (b - r) / delta + 2;
                break;
            case b:
                hue = (r - g) / delta + 4;
                break
            }
            hue /= 6
        }
        hsl.h = hue;
        hsl.s = saturation;
        hsl.l = lightness;
        return hsl
    }
    ;
    this.add = function(color) {
        this.r += color.r;
        this.g += color.g;
        this.b += color.b
    }
    ;
    this.mix = function(color, percent) {
        this.r = this.r * (1 - percent) + (color.r * percent);
        this.g = this.g * (1 - percent) + (color.g * percent);
        this.b = this.b * (1 - percent) + (color.b * percent)
    }
    ;
    this.addScalar = function(s) {
        this.r += s;
        this.g += s;
        this.b += s
    }
    ;
    this.multiply = function(color) {
        this.r *= color.r;
        this.g *= color.g;
        this.b *= color.b
    }
    ;
    this.multiplyScalar = function(s) {
        this.r *= s;
        this.g *= s;
        this.b *= s
    }
    ;
    this.clone = function() {
        return new Color([this.r, this.g, this.b])
    }
    ;
    this.toArray = function() {
        if (!_array) {
            _array = []
        }
        _array[0] = this.r;
        _array[1] = this.g;
        _array[2] = this.b;
        return _array
    }
});
Class(function Matrix2() {
    var _this = this;
    var prototype = Matrix2.prototype;
    var a11, a12, a13, a21, a22, a23, a31, a32, a33;
    var b11, b12, b13, b21, b22, b23, b31, b32, b33;
    this.type = "matrix2";
    this.data = new Float32Array(9);
    (function() {
        identity()
    }
    )();
    function identity(d) {
        d = d || _this.data;
        d[0] = 1,
        d[1] = 0,
        d[2] = 0;
        d[3] = 0,
        d[4] = 1,
        d[5] = 0;
        d[6] = 0,
        d[7] = 0,
        d[8] = 1
    }
    function noE(n) {
        n = Math.abs(n) < 0.000001 ? 0 : n;
        return n
    }
    if (typeof prototype.identity !== "undefined") {
        return
    }
    prototype.identity = function(d) {
        identity(d);
        return this
    }
    ;
    prototype.transformVector = function(v) {
        var d = this.data;
        var x = v.x;
        var y = v.y;
        v.x = d[0] * x + d[1] * y + d[2];
        v.y = d[3] * x + d[4] * y + d[5];
        return v
    }
    ;
    prototype.setTranslation = function(tx, ty, m) {
        var d = m || this.data;
        d[0] = 1,
        d[1] = 0,
        d[2] = tx;
        d[3] = 0,
        d[4] = 1,
        d[5] = ty;
        d[6] = 0,
        d[7] = 0,
        d[8] = 1;
        return this
    }
    ;
    prototype.getTranslation = function(v) {
        var d = this.data;
        v = v || new Vector2();
        v.x = d[2];
        v.y = d[5];
        return v
    }
    ;
    prototype.setScale = function(sx, sy, m) {
        var d = m || this.data;
        d[0] = sx,
        d[1] = 0,
        d[2] = 0;
        d[3] = 0,
        d[4] = sy,
        d[5] = 0;
        d[6] = 0,
        d[7] = 0,
        d[8] = 1;
        return this
    }
    ;
    prototype.setShear = function(sx, sy, m) {
        var d = m || this.data;
        d[0] = 1,
        d[1] = sx,
        d[2] = 0;
        d[3] = sy,
        d[4] = 1,
        d[5] = 0;
        d[6] = 0,
        d[7] = 0,
        d[8] = 1;
        return this
    }
    ;
    prototype.setRotation = function(a, m) {
        var d = m || this.data;
        var r0 = Math.cos(a);
        var r1 = Math.sin(a);
        d[0] = r0,
        d[1] = -r1,
        d[2] = 0;
        d[3] = r1,
        d[4] = r0,
        d[5] = 0;
        d[6] = 0,
        d[7] = 0,
        d[8] = 1;
        return this
    }
    ;
    prototype.setTRS = function(tx, ty, a, sx, sy) {
        var d = this.data;
        var r0 = Math.cos(a);
        var r1 = Math.sin(a);
        d[0] = r0 * sx,
        d[1] = -r1 * sy,
        d[2] = tx;
        d[3] = r1 * sx,
        d[4] = r0 * sy,
        d[5] = ty;
        d[6] = 0,
        d[7] = 0,
        d[8] = 1;
        return this
    }
    ;
    prototype.translate = function(tx, ty) {
        this.identity(Matrix2.__TEMP__);
        this.setTranslation(tx, ty, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__)
    }
    ;
    prototype.rotate = function(a) {
        this.identity(Matrix2.__TEMP__);
        this.setTranslation(a, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__)
    }
    ;
    prototype.scale = function(sx, sy) {
        this.identity(Matrix2.__TEMP__);
        this.setScale(sx, sy, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__)
    }
    ;
    prototype.shear = function(sx, sy) {
        this.identity(Matrix2.__TEMP__);
        this.setRotation(sx, sy, Matrix2.__TEMP__);
        return this.multiply(Matrix2.__TEMP__)
    }
    ;
    prototype.multiply = function(m) {
        var a = this.data;
        var b = m.data || m;
        a11 = a[0],
        a12 = a[1],
        a13 = a[2];
        a21 = a[3],
        a22 = a[4],
        a23 = a[5];
        a31 = a[6],
        a32 = a[7],
        a33 = a[8];
        b11 = b[0],
        b12 = b[1],
        b13 = b[2];
        b21 = b[3],
        b22 = b[4],
        b23 = b[5];
        b31 = b[6],
        b32 = b[7],
        b33 = b[8];
        a[0] = a11 * b11 + a12 * b21 + a13 * b31;
        a[1] = a11 * b12 + a12 * b22 + a13 * b32;
        a[2] = a11 * b13 + a12 * b23 + a13 * b33;
        a[3] = a21 * b11 + a22 * b21 + a23 * b31;
        a[4] = a21 * b12 + a22 * b22 + a23 * b32;
        a[5] = a21 * b13 + a22 * b23 + a23 * b33;
        return this
    }
    ;
    prototype.inverse = function(m) {
        m = m || this;
        var a = m.data;
        var b = this.data;
        a11 = a[0],
        a12 = a[1],
        a13 = a[2];
        a21 = a[3],
        a22 = a[4],
        a23 = a[5];
        a31 = a[6],
        a32 = a[7],
        a33 = a[8];
        var det = m.determinant();
        if (Math.abs(det) < 1e-7) {}
        var invdet = 1 / det;
        b[0] = (a22 * a33 - a32 * a23) * invdet;
        b[1] = (a13 * a32 - a12 * a33) * invdet;
        b[2] = (a12 * a23 - a13 * a22) * invdet;
        b[3] = (a23 * a31 - a21 * a33) * invdet;
        b[4] = (a11 * a33 - a13 * a31) * invdet;
        b[5] = (a21 * a13 - a11 * a23) * invdet;
        b[6] = (a21 * a32 - a31 * a22) * invdet;
        b[7] = (a31 * a12 - a11 * a32) * invdet;
        b[8] = (a11 * a22 - a21 * a12) * invdet;
        return m
    }
    ;
    prototype.determinant = function() {
        var a = this.data;
        a11 = a[0],
        a12 = a[1],
        a13 = a[2];
        a21 = a[3],
        a22 = a[4],
        a23 = a[5];
        a31 = a[6],
        a32 = a[7],
        a33 = a[8];
        return a11 * (a22 * a33 - a32 * a23) - a12 * (a21 * a33 - a23 * a31) + a13 * (a21 * a32 * a22 * a31)
    }
    ;
    prototype.copyTo = function(m) {
        var a = this.data;
        var b = m.data || m;
        b[0] = a[0],
        b[1] = a[1],
        b[2] = a[2];
        b[3] = a[3],
        b[4] = a[4],
        b[5] = a[5];
        b[6] = a[6],
        b[7] = a[7],
        b[8] = a[8];
        return m
    }
    ;
    prototype.copyFrom = function(m) {
        var a = this.data;
        var b = m.data || m;
        b[0] = a[0],
        b[1] = a[1],
        b[2] = a[2];
        b[3] = a[3],
        b[4] = a[4],
        b[5] = a[5];
        b[6] = a[6],
        b[7] = a[7],
        b[8] = a[8];
        return this
    }
    ;
    prototype.getCSS = function(force2D) {
        var d = this.data;
        if (Device.tween.css3d && !force2D) {
            return "matrix3d(" + noE(d[0]) + ", " + noE(d[3]) + ", 0, 0, " + noE(d[1]) + ", " + noE(d[4]) + ", 0, 0, 0, 0, 1, 0, " + noE(d[2]) + ", " + noE(d[5]) + ", 0, 1)"
        } else {
            return "matrix(" + noE(d[0]) + ", " + noE(d[3]) + ", " + noE(d[1]) + ", " + noE(d[4]) + ", " + noE(d[2]) + ", " + noE(d[5]) + ")"
        }
    }
}, function() {
    Matrix2.__TEMP__ = new Matrix2().data
});
Class(function Matrix4() {
    var _this = this;
    var prototype = Matrix4.prototype;
    this.type = "matrix4";
    this.data = new Float32Array(16);
    (function() {
        identity()
    }
    )();
    function identity(m) {
        var d = m || _this.data;
        d[0] = 1,
        d[4] = 0,
        d[8] = 0,
        d[12] = 0;
        d[1] = 0,
        d[5] = 1,
        d[9] = 0,
        d[13] = 0;
        d[2] = 0,
        d[6] = 0,
        d[10] = 1,
        d[14] = 0;
        d[3] = 0,
        d[7] = 0,
        d[11] = 0,
        d[15] = 1
    }
    function noE(n) {
        return Math.abs(n) < 0.000001 ? 0 : n
    }
    if (typeof prototype.identity !== "undefined") {
        return
    }
    prototype.identity = function() {
        identity();
        return this
    }
    ;
    prototype.transformVector = function(v, pv) {
        var d = this.data;
        var x = v.x
          , y = v.y
          , z = v.z
          , w = v.w;
        pv = pv || v;
        pv.x = d[0] * x + d[4] * y + d[8] * z + d[12] * w;
        pv.y = d[1] * x + d[5] * y + d[9] * z + d[13] * w;
        pv.z = d[2] * x + d[6] * y + d[10] * z + d[14] * w;
        return pv
    }
    ;
    prototype.multiply = function(m, d) {
        var a = this.data;
        var b = m.data || m;
        var a00, a01, a02, a03, a04, a05, a06, a07, a08, a09, a10, a11, a12, a13, a14, a15;
        var b00, b01, b02, b03, b04, b05, b06, b07, b08, b09, b10, b11, b12, b13, b14, b15;
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3];
        a04 = a[4],
        a05 = a[5],
        a06 = a[6],
        a07 = a[7];
        a08 = a[8],
        a09 = a[9],
        a10 = a[10],
        a11 = a[11];
        a12 = a[12],
        a13 = a[13],
        a14 = a[14],
        a15 = a[15];
        b00 = b[0],
        b01 = b[1],
        b02 = b[2],
        b03 = b[3];
        b04 = b[4],
        b05 = b[5],
        b06 = b[6],
        b07 = b[7];
        b08 = b[8],
        b09 = b[9],
        b10 = b[10],
        b11 = b[11];
        b12 = b[12],
        b13 = b[13],
        b14 = b[14],
        b15 = b[15];
        a[0] = a00 * b00 + a04 * b01 + a08 * b02 + a12 * b03;
        a[1] = a01 * b00 + a05 * b01 + a09 * b02 + a13 * b03;
        a[2] = a02 * b00 + a06 * b01 + a10 * b02 + a14 * b03;
        a[3] = a03 * b00 + a07 * b01 + a11 * b02 + a15 * b03;
        a[4] = a00 * b04 + a04 * b05 + a08 * b06 + a12 * b07;
        a[5] = a01 * b04 + a05 * b05 + a09 * b06 + a13 * b07;
        a[6] = a02 * b04 + a06 * b05 + a10 * b06 + a14 * b07;
        a[7] = a03 * b04 + a07 * b05 + a11 * b06 + a15 * b07;
        a[8] = a00 * b08 + a04 * b09 + a08 * b10 + a12 * b11;
        a[9] = a01 * b08 + a05 * b09 + a09 * b10 + a13 * b11;
        a[10] = a02 * b08 + a06 * b09 + a10 * b10 + a14 * b11;
        a[11] = a03 * b08 + a07 * b09 + a11 * b10 + a15 * b11;
        a[12] = a00 * b12 + a04 * b13 + a08 * b14 + a12 * b15;
        a[13] = a01 * b12 + a05 * b13 + a09 * b14 + a13 * b15;
        a[14] = a02 * b12 + a06 * b13 + a10 * b14 + a14 * b15;
        a[15] = a03 * b12 + a07 * b13 + a11 * b14 + a15 * b15;
        return this
    }
    ;
    prototype.setTRS = function(tx, ty, tz, rx, ry, rz, sx, sy, sz, m) {
        m = m || this;
        var d = m.data;
        identity(m);
        var six = Math.sin(rx);
        var cox = Math.cos(rx);
        var siy = Math.sin(ry);
        var coy = Math.cos(ry);
        var siz = Math.sin(rz);
        var coz = Math.cos(rz);
        d[0] = (coy * coz + siy * six * siz) * sx;
        d[1] = (-coy * siz + siy * six * coz) * sx;
        d[2] = siy * cox * sx;
        d[4] = siz * cox * sy;
        d[5] = coz * cox * sy;
        d[6] = -six * sy;
        d[8] = (-siy * coz + coy * six * siz) * sz;
        d[9] = (siz * siy + coy * six * coz) * sz;
        d[10] = coy * cox * sz;
        d[12] = tx;
        d[13] = ty;
        d[14] = tz;
        return m
    }
    ;
    prototype.setScale = function(sx, sy, sz, m) {
        m = m || this;
        var d = m.data || m;
        identity(m);
        d[0] = sx,
        d[5] = sy,
        d[10] = sz;
        return m
    }
    ;
    prototype.setTranslation = function(tx, ty, tz, m) {
        m = m || this;
        var d = m.data || m;
        identity(m);
        d[12] = tx,
        d[13] = ty,
        d[14] = tz;
        return m
    }
    ;
    prototype.setRotation = function(rx, ry, rz, m) {
        m = m || this;
        var d = m.data || m;
        identity(m);
        var sx = Math.sin(rx);
        var cx = Math.cos(rx);
        var sy = Math.sin(ry);
        var cy = Math.cos(ry);
        var sz = Math.sin(rz);
        var cz = Math.cos(rz);
        d[0] = cy * cz + sy * sx * sz;
        d[1] = -cy * sz + sy * sx * cz;
        d[2] = sy * cx;
        d[4] = sz * cx;
        d[5] = cz * cx;
        d[6] = -sx;
        d[8] = -sy * cz + cy * sx * sz;
        d[9] = sz * sy + cy * sx * cz;
        d[10] = cy * cx;
        return m
    }
    ;
    prototype.setLookAt = function(eye, center, up, m) {
        m = m || this;
        var d = m.data || m;
        var f = D3.m4v31;
        var s = D3.m4v32;
        var u = D3.m4v33;
        f.subVectors(center, eye).normalize();
        s.cross(f, up).normalize();
        u.cross(s, f);
        d[0] = s.x;
        d[1] = u.x;
        d[2] = -f.x;
        d[3] = 0;
        d[4] = s.y;
        d[5] = u.y;
        d[6] = -f.y;
        d[7] = 0;
        d[8] = s.z;
        d[9] = u.z;
        d[10] = -f.z;
        d[11] = 0;
        d[12] = 0;
        d[13] = 0;
        d[14] = 0;
        d[15] = 1;
        this.translate(-eye.x, -eye.y, -eye.z);
        return this
    }
    ;
    prototype.setPerspective = function(fovy, aspect, near, far, m) {
        var e, rd, s, ct;
        if (near === far || aspect === 0) {
            throw "null frustum"
        }
        if (near <= 0) {
            throw "near <= 0"
        }
        if (far <= 0) {
            throw "far <= 0"
        }
        fovy = Math.PI * fovy / 180 / 2;
        s = Math.sin(fovy);
        if (s === 0) {
            throw "null frustum"
        }
        rd = 1 / (far - near);
        ct = Math.cos(fovy) / s;
        e = m ? (m.data || m) : this.data;
        e[0] = ct / aspect;
        e[1] = 0;
        e[2] = 0;
        e[3] = 0;
        e[4] = 0;
        e[5] = ct;
        e[6] = 0;
        e[7] = 0;
        e[8] = 0;
        e[9] = 0;
        e[10] = -(far + near) * rd;
        e[11] = -1;
        e[12] = 0;
        e[13] = 0;
        e[14] = -2 * near * far * rd;
        e[15] = 0
    }
    ;
    prototype.perspective = function(fov, aspect, near, far) {
        this.setPerspective(fov, aspect, near, far, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    }
    ;
    prototype.lookAt = function(eye, center, up) {
        this.setLookAt(eye, center, up, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    }
    ;
    prototype.translate = function(tx, ty, tz) {
        this.setTranslation(tx, ty, tz, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    }
    ;
    prototype.rotate = function(rx, ry, rz) {
        this.setRotation(rx, ry, rz, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    }
    ;
    prototype.scale = function(sx, sy, sz) {
        this.setScale(sx, sy, sz, Matrix4.__TEMP__);
        return this.multiply(Matrix4.__TEMP__)
    }
    ;
    prototype.copyTo = function(m) {
        var a = this.data;
        var b = m.data || m;
        for (var i = 0; i < 16; i++) {
            b[i] = a[i]
        }
    }
    ;
    prototype.copyFrom = function(m) {
        var a = this.data;
        var b = m.data || m;
        for (var i = 0; i < 16; i++) {
            a[i] = b[i]
        }
        return this
    }
    ;
    prototype.copyRotationTo = function(m) {
        var a = this.data;
        var b = m.data || m;
        b[0] = a[0];
        b[1] = a[1];
        b[2] = a[2];
        b[3] = a[4];
        b[4] = a[5];
        b[5] = a[6];
        b[6] = a[8];
        b[7] = a[9];
        b[8] = a[10];
        return m
    }
    ;
    prototype.copyPosition = function(m) {
        var to = this.data;
        var from = m.data || m;
        to[12] = from[12];
        to[13] = from[13];
        to[14] = from[14];
        return this
    }
    ;
    prototype.getCSS = function() {
        var d = this.data;
        return "matrix3d(" + noE(d[0]) + "," + noE(d[1]) + "," + noE(d[2]) + "," + noE(d[3]) + "," + noE(d[4]) + "," + noE(d[5]) + "," + noE(d[6]) + "," + noE(d[7]) + "," + noE(d[8]) + "," + noE(d[9]) + "," + noE(d[10]) + "," + noE(d[11]) + "," + noE(d[12]) + "," + noE(d[13]) + "," + noE(d[14]) + "," + noE(d[15]) + ")"
    }
    ;
    prototype.extractPosition = function(v) {
        v = v || new Vector3();
        var d = this.data;
        v.set(d[12], d[13], d[14]);
        return v
    }
    ;
    prototype.determinant = function() {
        var d = this.data;
        return d[0] * (d[5] * d[10] - d[9] * d[6]) + d[4] * (d[9] * d[2] - d[1] * d[10]) + d[8] * (d[1] * d[6] - d[5] * d[2])
    }
    ;
    prototype.inverse = function(m) {
        var d = this.data;
        var a = (m) ? m.data || m : this.data;
        var det = this.determinant();
        if (Math.abs(det) < 0.0001) {
            console.warn("Attempt to inverse a singular Matrix4. ", this.data);
            console.trace();
            return m
        }
        var d0 = d[0]
          , d4 = d[4]
          , d8 = d[8]
          , d12 = d[12]
          , d1 = d[1]
          , d5 = d[5]
          , d9 = d[9]
          , d13 = d[13]
          , d2 = d[2]
          , d6 = d[6]
          , d10 = d[10]
          , d14 = d[14];
        det = 1 / det;
        a[0] = (d5 * d10 - d9 * d6) * det;
        a[1] = (d8 * d6 - d4 * d10) * det;
        a[2] = (d4 * d9 - d8 * d5) * det;
        a[4] = (d9 * d2 - d1 * d10) * det;
        a[5] = (d0 * d10 - d8 * d2) * det;
        a[6] = (d8 * d1 - d0 * d9) * det;
        a[8] = (d1 * d6 - d5 * d2) * det;
        a[9] = (d4 * d2 - d0 * d6) * det;
        a[10] = (d0 * d5 - d4 * d1) * det;
        a[12] = -(d12 * a[0] + d13 * a[4] + d14 * a[8]);
        a[13] = -(d12 * a[1] + d13 * a[5] + d14 * a[9]);
        a[14] = -(d12 * a[2] + d13 * a[6] + d14 * a[10]);
        return m
    }
    ;
    prototype.transpose = function(m) {
        var d = this.data;
        var a = m ? m.data || m : this.data;
        var d0 = d[0]
          , d4 = d[4]
          , d8 = d[8]
          , d1 = d[1]
          , d5 = d[5]
          , d9 = d[9]
          , d2 = d[2]
          , d6 = d[6]
          , d10 = d[10];
        a[0] = d0;
        a[1] = d4;
        a[2] = d8;
        a[4] = d1;
        a[5] = d5;
        a[6] = d9;
        a[8] = d2;
        a[9] = d6;
        a[10] = d10
    }
}, function() {
    Matrix4.__TEMP__ = new Matrix4().data
});
Class(function Vector2(_x, _y) {
    var _this = this;
    var prototype = Vector2.prototype;
    this.x = typeof _x == "number" ? _x : 0;
    this.y = typeof _y == "number" ? _y : 0;
    this.type = "vector2";
    if (typeof prototype.set !== "undefined") {
        return
    }
    prototype.set = function(x, y) {
        this.x = x;
        this.y = y;
        return this
    }
    ;
    prototype.clear = function() {
        this.x = 0;
        this.y = 0;
        return this
    }
    ;
    prototype.copyTo = function(v) {
        v.x = this.x;
        v.y = this.y;
        return this
    }
    ;
    prototype.copyFrom = prototype.copy = function(v) {
        this.x = v.x;
        this.y = v.y;
        return this
    }
    ;
    prototype.addVectors = function(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        return this
    }
    ;
    prototype.subVectors = function(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        return this
    }
    ;
    prototype.multiplyVectors = function(a, b) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        return this
    }
    ;
    prototype.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        return this
    }
    ;
    prototype.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        return this
    }
    ;
    prototype.multiply = function(v) {
        this.x *= v;
        this.y *= v;
        return this
    }
    ;
    prototype.divide = function(v) {
        this.x /= v;
        this.y /= v;
        return this
    }
    ;
    prototype.lengthSq = function() {
        return (this.x * this.x + this.y * this.y) || 0.00001
    }
    ;
    prototype.length = function() {
        return Math.sqrt(this.lengthSq())
    }
    ;
    prototype.setLength = function(length) {
        this.normalize().multiply(length);
        return this
    }
    ;
    prototype.normalize = function() {
        var length = this.length();
        this.x /= length;
        this.y /= length;
        return this
    }
    ;
    prototype.perpendicular = function(a, b) {
        var tx = this.x;
        var ty = this.y;
        this.x = -ty;
        this.y = tx;
        return this
    }
    ;
    prototype.lerp = function(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        return this
    }
    ;
    prototype.interp = function(v, alpha, ease) {
        var a = 0;
        var f = TweenManager.Interpolation.convertEase(ease);
        var calc = Vector2.__TEMP__;
        calc.subVectors(this, v);
        var dist = Utils.clamp(Utils.range(calc.lengthSq(), 0, (5000 * 5000), 1, 0), 0, 1) * (alpha / 10);
        if (typeof f === "function") {
            a = f(dist)
        } else {
            a = TweenManager.Interpolation.solve(f, dist)
        }
        this.x += (v.x - this.x) * a;
        this.y += (v.y - this.y) * a
    }
    ;
    prototype.setAngleRadius = function(a, r) {
        this.x = Math.cos(a) * r;
        this.y = Math.sin(a) * r;
        return this
    }
    ;
    prototype.addAngleRadius = function(a, r) {
        this.x += Math.cos(a) * r;
        this.y += Math.sin(a) * r;
        return this
    }
    ;
    prototype.clone = function() {
        return new Vector2(this.x,this.y)
    }
    ;
    prototype.dot = function(a, b) {
        b = b || this;
        return (a.x * b.x + a.y * b.y)
    }
    ;
    prototype.distanceTo = function(v, noSq) {
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        if (!noSq) {
            return Math.sqrt(dx * dx + dy * dy)
        }
        return dx * dx + dy * dy
    }
    ;
    prototype.solveAngle = function(a, b) {
        if (!b) {
            b = this
        }
        return Math.atan2(a.y - b.y, a.x - b.x)
    }
    ;
    prototype.equals = function(v) {
        return this.x == v.x && this.y == v.y
    }
    ;
    prototype.console = function() {
        console.log(this.x, this.y)
    }
}, function() {
    Vector2.__TEMP__ = new Vector2()
});
Class(function Vector3(_x, _y, _z, _w) {
    var _this = this;
    var prototype = Vector3.prototype;
    this.x = typeof _x === "number" ? _x : 0;
    this.y = typeof _y === "number" ? _y : 0;
    this.z = typeof _z === "number" ? _z : 0;
    this.w = typeof _w === "number" ? _w : 1;
    this.type = "vector3";
    if (typeof prototype.set !== "undefined") {
        return
    }
    prototype.set = function(x, y, z, w) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = w || 1;
        return this
    }
    ;
    prototype.clear = function() {
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 1;
        return this
    }
    ;
    prototype.copyTo = function(p) {
        p.x = this.x;
        p.y = this.y;
        p.z = this.z;
        p.w = this.w;
        return p
    }
    ;
    prototype.copyFrom = prototype.copy = function(p) {
        this.x = p.x || 0;
        this.y = p.y || 0;
        this.z = p.z || 0;
        this.w = p.w || 1;
        return this
    }
    ;
    prototype.lengthSq = function() {
        return this.x * this.x + this.y * this.y + this.z * this.z
    }
    ;
    prototype.length = function() {
        return Math.sqrt(this.lengthSq())
    }
    ;
    prototype.normalize = function() {
        var m = 1 / this.length();
        this.set(this.x * m, this.y * m, this.z * m);
        return this
    }
    ;
    prototype.setLength = function(length) {
        this.normalize().multiply(length);
        return this
    }
    ;
    prototype.addVectors = function(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this
    }
    ;
    prototype.subVectors = function(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this
    }
    ;
    prototype.multiplyVectors = function(a, b) {
        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;
        return this
    }
    ;
    prototype.add = function(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this
    }
    ;
    prototype.sub = function(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this
    }
    ;
    prototype.multiply = function(v) {
        this.x *= v;
        this.y *= v;
        this.z *= v;
        return this
    }
    ;
    prototype.divide = function(v) {
        this.x /= v;
        this.y /= v;
        this.z /= v;
        return this
    }
    ;
    prototype.limit = function(max) {
        if (this.length() > max) {
            this.normalize();
            this.multiply(max)
        }
    }
    ;
    prototype.heading2D = function() {
        var angle = Math.atan2(-this.y, this.x);
        return -angle
    }
    ;
    prototype.lerp = function(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        this.z += (v.z - this.z) * alpha;
        return this
    }
    ;
    prototype.deltaLerp = function(v, alpha, delta) {
        delta = delta || 1;
        for (var i = 0; i < delta; i++) {
            var f = alpha;
            this.x += ((v.x - this.x) * alpha);
            this.y += ((v.y - this.y) * alpha);
            this.z += ((v.z - this.z) * alpha)
        }
        return this
    }
    ;
    prototype.interp = function(v, alpha, ease, dist) {
        if (!Vector3.__TEMP__) {
            Vector3.__TEMP__ = new Vector3()
        }
        dist = dist || 5000;
        var a = 0;
        var f = TweenManager.Interpolation.convertEase(ease);
        var calc = Vector3.__TEMP__;
        calc.subVectors(this, v);
        var dist = Utils.clamp(Utils.range(calc.lengthSq(), 0, (dist * dist), 1, 0), 0, 1) * (alpha / 10);
        if (typeof f === "function") {
            a = f(dist)
        } else {
            a = TweenManager.Interpolation.solve(f, dist)
        }
        this.x += (v.x - this.x) * a;
        this.y += (v.y - this.y) * a;
        this.z += (v.z - this.z) * a
    }
    ;
    prototype.setAngleRadius = function(a, r) {
        this.x = Math.cos(a) * r;
        this.y = Math.sin(a) * r;
        this.z = Math.sin(a) * r;
        return this
    }
    ;
    prototype.addAngleRadius = function(a, r) {
        this.x += Math.cos(a) * r;
        this.y += Math.sin(a) * r;
        this.z += Math.sin(a) * r;
        return this
    }
    ;
    prototype.dot = function(a, b) {
        b = b || this;
        return a.x * b.x + a.y * b.y + a.z * b.z
    }
    ;
    prototype.clone = function() {
        return new Vector3(this.x,this.y,this.z)
    }
    ;
    prototype.cross = function(a, b) {
        if (!b) {
            b = this
        }
        var x = a.y * b.z - a.z * b.y;
        var y = a.z * b.x - a.x * b.z;
        var z = a.x * b.y - a.y * b.x;
        this.set(x, y, z, this.w);
        return this
    }
    ;
    prototype.distanceTo = function(v, noSq) {
        var dx = this.x - v.x;
        var dy = this.y - v.y;
        var dz = this.z - v.z;
        if (!noSq) {
            return Math.sqrt(dx * dx + dy * dy + dz * dz)
        }
        return dx * dx + dy * dy + dz * dz
    }
    ;
    prototype.solveAngle = function(a, b) {
        if (!b) {
            b = this
        }
        return Math.acos(a.dot(b) / (a.length() * b.length()))
    }
    ;
    prototype.equals = function(v) {
        return this.x == v.x && this.y == v.y && this.z == v.z
    }
    ;
    prototype.console = function() {
        console.log(this.x, this.y, this.z)
    }
}, function() {
    Vector3.__TEMP__ = new Vector3()
});
Mobile.Class(function Accelerometer() {
    var _this = this;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.toRadians = Mobile.os == "iOS" ? Math.PI / 180 : 1;
    function updateAccel(e) {
        switch (window.orientation) {
        case 0:
            _this.x = -e.accelerationIncludingGravity.x;
            _this.y = e.accelerationIncludingGravity.y;
            _this.z = e.accelerationIncludingGravity.z;
            if (e.rotationRate) {
                _this.alpha = e.rotationRate.beta * _this.toRadians;
                _this.beta = -e.rotationRate.alpha * _this.toRadians;
                _this.gamma = e.rotationRate.gamma * _this.toRadians
            }
            break;
        case 180:
            _this.x = e.accelerationIncludingGravity.x;
            _this.y = -e.accelerationIncludingGravity.y;
            _this.z = e.accelerationIncludingGravity.z;
            if (e.rotationRate) {
                _this.alpha = -e.rotationRate.beta * _this.toRadians;
                _this.beta = e.rotationRate.alpha * _this.toRadians;
                _this.gamma = e.rotationRate.gamma * _this.toRadians
            }
            break;
        case 90:
            _this.x = e.accelerationIncludingGravity.y;
            _this.y = e.accelerationIncludingGravity.x;
            _this.z = e.accelerationIncludingGravity.z;
            if (e.rotationRate) {
                _this.alpha = e.rotationRate.alpha * _this.toRadians;
                _this.beta = e.rotationRate.beta * _this.toRadians;
                _this.gamma = e.rotationRate.gamma * _this.toRadians
            }
            break;
        case -90:
            _this.x = -e.accelerationIncludingGravity.y;
            _this.y = -e.accelerationIncludingGravity.x;
            _this.z = e.accelerationIncludingGravity.z;
            if (e.rotationRate) {
                _this.alpha = -e.rotationRate.alpha * _this.toRadians;
                _this.beta = -e.rotationRate.beta * _this.toRadians;
                _this.gamma = e.rotationRate.gamma * _this.toRadians
            }
            break
        }
    }
    this.capture = function() {
        window.ondevicemotion = updateAccel
    }
    ;
    this.stop = function() {
        window.ondevicemotion = null;
        _this.x = _this.y = _this.z = 0
    }
}, "Static");
Class(function ParticlePhysics(_integrator) {
    Inherit(this, Component);
    var _this = this;
    _integrator = _integrator || new EulerIntegrator();
    var _timestep = 1 / 60;
    var _time = 0;
    var _step = 0;
    var _clock = null;
    var _buffer = 0;
    var _toDelete = [];
    this.friction = 1;
    this.maxSteps = 1;
    this.emitters = new LinkedList();
    this.initializers = new LinkedList();
    this.behaviors = new LinkedList();
    this.particles = new LinkedList();
    this.springs = new LinkedList();
    function init(p) {
        var i = _this.initializers.start();
        while (i) {
            i(p);
            i = _this.initializers.next()
        }
    }
    function updateSprings(dt) {
        var s = _this.springs.start();
        while (s) {
            s.update(dt);
            s = _this.springs.next()
        }
    }
    function deleteParticles() {
        for (var i = _toDelete.length - 1; i > -1; i--) {
            var particle = _toDelete[i];
            _this.particles.remove(particle);
            particle.system = null
        }
        _toDelete.length = 0
    }
    function updateParticles(dt) {
        var index = 0;
        var p = _this.particles.start();
        while (p) {
            if (!p.disabled) {
                var b = _this.behaviors.start();
                while (b) {
                    b.applyBehavior(p, dt, index);
                    b = _this.behaviors.next()
                }
                if (p.behaviors.length) {
                    p.update(dt, index)
                }
            }
            index++;
            p = _this.particles.next()
        }
    }
    function integrate(dt) {
        updateParticles(dt);
        if (_this.springs.length) {
            updateSprings(dt)
        }
        if (!_this.skipIntegration) {
            _integrator.integrate(_this.particles, dt, _this.friction)
        }
    }
    this.addEmitter = function(emitter) {
        if (!(emitter instanceof Emitter)) {
            throw "Emitter must be Emitter"
        }
        this.emitters.push(emitter);
        emitter.parent = emitter.system = this
    }
    ;
    this.removeEmitter = function(emitter) {
        if (!(emitter instanceof Emitter)) {
            throw "Emitter must be Emitter"
        }
        this.emitters.remove(emitter);
        emitter.parent = emitter.system = null
    }
    ;
    this.addInitializer = function(init) {
        if (typeof init !== "function") {
            throw "Initializer must be a function"
        }
        this.initializers.push(init)
    }
    ;
    this.removeInitializer = function(init) {
        this.initializers.remove(init)
    }
    ;
    this.addBehavior = function(b) {
        this.behaviors.push(b);
        b.system = this
    }
    ;
    this.removeBehavior = function(b) {
        this.behaviors.remove(b)
    }
    ;
    this.addParticle = function(p) {
        if (!_integrator.type) {
            if (typeof p.pos.z === "number") {
                _integrator.type = "3D"
            } else {
                _integrator.type = "2D"
            }
        }
        p.system = this;
        this.particles.push(p);
        if (this.initializers.length) {
            init(p)
        }
    }
    ;
    this.removeParticle = function(p) {
        p.system = null;
        _toDelete.push(p)
    }
    ;
    this.addSpring = function(s) {
        s.system = this;
        this.springs.push(s)
    }
    ;
    this.removeSpring = function(s) {
        s.system = null;
        this.springs.remove(s)
    }
    ;
    this.update = function(force) {
        if (!_clock) {
            _clock = THREAD ? Date.now() : Render.TIME
        }
        var time = THREAD ? Date.now() : Render.TIME;
        var delta = time - _clock;
        if (!force && delta <= 0) {
            return
        }
        delta *= 0.001;
        _clock = time;
        _buffer += delta;
        if (!force) {
            var i = 0;
            while (_buffer >= _timestep && i++ < _this.maxSteps) {
                integrate(_timestep);
                _buffer -= _timestep;
                _time += _timestep
            }
        } else {
            integrate(0.016)
        }
        _step = Date.now() - time;
        if (_toDelete.length) {
            deleteParticles()
        }
    }
});
Class(function Particle(_pos, _mass, _radius) {
    var _this = this;
    var _vel, _acc, _old;
    var prototype = Particle.prototype;
    this.mass = _mass || 1;
    this.massInv = 1 / this.mass;
    this.radius = _radius || 1;
    this.radiusSq = this.radius * this.radius;
    this.behaviors = new LinkedList();
    this.fixed = false;
    (function() {
        initVectors()
    }
    )();
    function initVectors() {
        var Vector = typeof _pos.z === "number" ? Vector3 : Vector2;
        _pos = _pos || new Vector();
        _vel = new Vector();
        _acc = new Vector();
        _old = {};
        _old.pos = new Vector();
        _old.acc = new Vector();
        _old.vel = new Vector();
        _old.pos.copyFrom(_pos);
        _this.pos = _this.position = _pos;
        _this.vel = _this.velocity = _vel;
        _this.acc = _this.acceleration = _acc;
        _this.old = _old
    }
    this.moveTo = function(pos) {
        _pos.copyFrom(pos);
        _old.pos.copyFrom(_pos);
        _acc.clear();
        _vel.clear()
    }
    ;
    if (typeof prototype.setMass !== "undefined") {
        return
    }
    prototype.setMass = function(mass) {
        this.mass = mass || 1;
        this.massInv = 1 / this.mass
    }
    ;
    prototype.setRadius = function(radius) {
        this.radius = radius;
        this.radiusSq = radius * radius
    }
    ;
    prototype.update = function(dt) {
        if (!this.behaviors.length) {
            return
        }
        var b = this.behaviors.start();
        while (b) {
            b.applyBehavior(this, dt);
            b = this.behaviors.next()
        }
    }
    ;
    prototype.applyForce = function(force) {
        this.acc.add(force)
    }
    ;
    prototype.addBehavior = function(behavior) {
        if (!behavior || typeof behavior.applyBehavior === "undefined") {
            throw "Behavior must have applyBehavior method"
        }
        this.behaviors.push(behavior)
    }
    ;
    prototype.removeBehavior = function(behavior) {
        if (!behavior || typeof behavior.applyBehavior === "undefined") {
            throw "Behavior must have applyBehavior method"
        }
        this.behaviors.remove(behavior)
    }
});
Class(function Spring(_p1, _p2, _damping, _friction) {
    Inherit(this, Component);
    var _this = this;
    var Vector = typeof _p1.z !== "undefined" ? Vector3 : Vector2;
    var _dist = new Vector();
    var _acc = new Vector();
    var _vel = new Vector();
    function zero(num) {
        if (Math.abs(num) < 0.001) {
            return 0
        }
        return num
    }
    this.update = function() {
        _dist.subVectors(_p2, _p1);
        _acc.copyFrom(_dist).multiply(_damping);
        _vel.add(_acc).multiply(_friction);
        _p1.add(_vel)
    }
    ;
    this.getDistance = function() {
        return zero(_dist.length())
    }
    ;
    this.getDistanceSq = function() {
        return zero(_dist.lengthSq())
    }
    ;
    this.set("position", function(p) {
        _p1 = p
    });
    this.get("position", function() {
        return _p1
    });
    this.set("target", function(p) {
        _p2 = p
    });
    this.get("target", function() {
        return _p2
    });
    this.set("damping", function(v) {
        _damping = v
    });
    this.get("damping", function() {
        return _damping
    });
    this.set("friction", function(v) {
        _friction = v
    });
    this.get("friction", function() {
        return friction
    })
});
Class(function EulerIntegrator() {
    Inherit(this, Component);
    var _this = this;
    var _vel, _accel;
    this.useDeltaTime = false;
    (function() {}
    )();
    function createVectors() {
        var Vector = _this.type == "3D" ? Vector3 : Vector2;
        _vel = new Vector();
        _accel = new Vector()
    }
    this.integrate = function(particles, dt, drag) {
        if (!_vel) {
            createVectors()
        }
        var dtSq = dt * dt;
        var p = particles.start();
        while (p) {
            if (!p.fixed && !p.disabled) {
                p.old.pos.copyFrom(p.pos);
                p.acc.multiply(p.massInv);
                _vel.copyFrom(p.vel);
                _accel.copyFrom(p.acc);
                if (this.useDeltaTime) {
                    p.pos.add(_vel.multiply(dt)).add(_accel.multiply(0.5 * dtSq));
                    p.vel.add(p.acc.multiply(dt))
                } else {
                    p.pos.add(_vel).add(_accel.multiply(0.5));
                    p.vel.add(p.acc)
                }
                if (drag) {
                    p.vel.multiply(drag)
                }
                p.acc.clear()
            }
            if (p.saveTo) {
                p.pos.copyTo(p.saveTo)
            }
            p = particles.next()
        }
    }
});
Class(function Emitter(_position, _startNumber) {
    Inherit(this, Component);
    var _this = this;
    var _pool;
    var _total = 0;
    var Vector = _position.type == "vector3" ? Vector3 : Vector2;
    this.initializers = [];
    this.position = _position;
    this.autoEmit = 1;
    (function() {
        initObjectPool();
        if (_startNumber != 0) {
            addParticles(_startNumber || 100)
        }
    }
    )();
    function initObjectPool() {
        _pool = _this.initClass(ObjectPool)
    }
    function addParticles(total) {
        _total += total;
        var particles = [];
        for (var i = 0; i < total; i++) {
            particles.push(new Particle())
        }
        _pool.insert(particles)
    }
    this.addInitializer = function(callback) {
        if (typeof callback !== "function") {
            throw "Initializer must be a function"
        }
        this.initializers.push(callback)
    }
    ;
    this.removeInitializer = function(callback) {
        var index = this.initializers.indexOf(callback);
        if (index > -1) {
            this.initializers.splice(index, 1)
        }
    }
    ;
    this.emit = function(num) {
        if (!this.parent) {
            throw "Emitter needs to be added to a System"
        }
        num = num || this.autoEmit;
        for (var i = 0; i < num; i++) {
            var p = _pool.get();
            if (!p) {
                return
            }
            p.moveTo(this.position);
            p.emitter = this;
            if (!p.system) {
                this.parent.addParticle(p)
            }
            for (var j = 0; j < this.initializers.length; j++) {
                this.initializers[j](p)
            }
        }
    }
    ;
    this.remove = function(particle) {
        _pool.put(particle);
        _this.parent.removeParticle(particle)
    }
    ;
    this.addToPool = function(particle) {
        _pool.put(particle)
    }
});
Class(function D3() {
    Namespace(this);
    if (THREAD) {
        return
    }
    this.CSS3D = Device.tween.css3d;
    this.m4v31 = new Vector3();
    this.m4v32 = new Vector3();
    this.m4v33 = new Vector3();
    this.UP = new Vector3(0,1,0);
    this.FWD = new Vector3(0,0,-1);
    this.CENTER = new Vector3(0,0,0);
    this.translate = function(x, y, z) {
        x = typeof x == "string" ? x : (x || 0) + "px";
        y = typeof y == "string" ? y : (y || 0) + "px";
        z = typeof z == "string" ? z : (z || 0) + "px";
        if (Device.browser.ie) {
            x = 0;
            y = 0
        }
        return "translate3d(" + x + "," + y + "," + z + ")"
    }
}, "Static");
D3.Class(function Camera(_fov, _near, _far) {
    Inherit(this, D3.Object3D);
    var _this = this;
    var _v3, _mat, _v, _m2;
    this.inverseWorldMatrix = new Matrix4();
    (function() {
        defer(function() {
            _this.scene.setProjection(_fov, _near, _far)
        })
    }
    )();
    this.set("fov", function(fov) {
        _fov = fov;
        _this.scene.setProjection(_fov, _near, _far)
    });
    this.computeInverseMatrix = function() {
        this.worldMatrix.inverse(this.inverseWorldMatrix);
        return this.inverseWorldMatrix
    }
    ;
    this.unproject = function(v) {
        if (!_v3) {
            _v = new Vector3();
            _v3 = new Vector3();
            _mat = new Matrix4();
            _m2 = new Matrix4()
        }
        var uniforms = _this.uniforms;
        _v3.set((v.x / uniforms.width) * 2 - 1, -(v.y / uniforms.height) * 2 + 1, 40);
        _m2.identity();
        _mat.copyFrom(_this.worldMatrix).multiply(uniforms.projection.inverse(_m2));
        var x = _v3.x
          , y = _v3.y
          , z = _v3.z;
        var e = _mat.data;
        var d = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
        _v3.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * d;
        _v3.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * d;
        _v3.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * d;
        var pos = _this.position;
        _v3.sub(pos).normalize();
        var dist = (-pos.z / _v3.z);
        _v.copyFrom(pos).add(_v3.multiply(dist));
        return _v
    }
    ;
    this.render = function() {}
});
D3.Class(function CSSMaterial($material) {
    Inherit(this, Component);
    var _this = this;
    var $light, $element;
    var _matrix, _mvp, _v3, _fog, _normal, _dist, _position;
    var _visible = true;
    this.material = $material;
    this.width = $material.width;
    this.height = $material.height;
    (function() {
        initMVP();
        initMaterial()
    }
    )();
    function initMVP() {
        _position = new Vector3();
        _dist = new Vector3();
        if (Device.browser.ie) {
            $material.css({
                marginLeft: -$material.width / 2,
                marginTop: -$material.height / 2
            })
        }
        if (D3.CSS3D) {
            return false
        }
        _matrix = new Matrix2();
        _mvp = new Matrix4();
        _v3 = new Vector3()
    }
    function initMaterial() {
        $element = $material.element || $material;
        if ($material.element) {
            Render.nextFrame(function() {
                $material.material = _this;
                $material.object = _this.object
            })
        }
    }
    function renderFog(uniforms) {
        var fog = _this.object._scene.fog;
        _dist.subVectors(uniforms.camera.position, _position);
        var dist = _dist.length();
        if (dist > fog) {
            var max = (fog * 2) - fog;
            dist -= fog;
            var opacity = Utils.convertRange(dist, 0, max, 0, 1);
            opacity = Utils.clamp(opacity, 0, 1);
            _fog = 1 - opacity;
            $element.div.style.opacity = _fog
        } else {
            if (_fog < 1) {
                $element.div.style.opacity = 1;
                _fog = 1
            }
        }
    }
    this.set("visible", function(visible) {
        _visible = visible;
        if (visible) {
            $material.show()
        } else {
            $material.hide()
        }
    });
    this.draw = function(scene) {
        scene.renderer.addChild($material)
    }
    ;
    this.remove = function() {
        if ($material.destroy) {
            $material.destroy()
        } else {
            if ($material.remove) {
                $material.remove(true)
            }
        }
    }
    ;
    this.render = function(uniforms) {
        if (!_visible) {
            return
        }
        _this.object.worldMatrix.extractPosition(_position);
        if (_this.object && _this.object._scene && _this.object._scene.fog) {
            renderFog(uniforms)
        }
        if (D3.CSS3D) {
            var translate = D3.translate("-50%", "-50%", uniforms.cssDistance);
            var ps = "perspective(" + uniforms.cssDistance + "px)";
            var p = translate + " " + _this.object.viewMatrix.getCSS();
            if (Device.browser.ie) {
                $element.div.style[CSS.prefix("Transform")] = ps + p
            } else {
                $element.div.style[CSS.prefix("Transform")] = p
            }
        } else {
            uniforms.projection.copyTo(_mvp);
            _mvp.multiply(_this.object.viewMatrix);
            _v3.set(0, 0, 0);
            _mvp.transformVector(_v3);
            _v3.x = _v3.x / _v3.z * uniforms.centerX;
            _v3.y = _v3.y / _v3.z * uniforms.centerY;
            var scale = 1 / (_v3.z / uniforms.cssDistance);
            var rotation = _this.object.rotation.z;
            _matrix.setTRS(_v3.x, _v3.y, rotation, scale, scale);
            _dist.subVectors(uniforms.camera.position, _position);
            var dist = _dist.length();
            $material.setZ(~~(999999 - dist)).matrix("translate(-50%, -50%) " + _matrix.getCSS());
            if (_v3.z <= 0 && !$material._meshHidden) {
                $material._meshHidden = true;
                $material.hide()
            } else {
                if (_v3.z > 0 && $material._meshHidden) {
                    $material._meshHidden = false;
                    $material.show()
                }
            }
        }
    }
});
D3.Class(function Object3D(_material) {
    Inherit(this, Component);
    var _this = this;
    var _lookDirection, _lookTarget, _scene;
    var _enabled = true;
    var _tempMatrix = new Matrix4();
    var _globalPosition = new Vector3();
    this.id = Utils.timestamp();
    this.directMatrix = false;
    this.billboard = false;
    this.material = _material || null;
    this.position = new Vector3(0,0,0);
    this.rotation = new Vector3(0,0,0);
    this.scale = new Vector3(1,1,1);
    this.matrix = new Matrix4();
    this.worldMatrix = new Matrix4();
    this.viewMatrix = new Matrix4();
    this.children = new LinkedList();
    (function() {
        if (_this.material) {
            _this.material.object = _this
        }
    }
    )();
    this.get("numChildren", function() {
        return _this.children.length
    });
    this.get("depth", function() {
        return _this.viewMatrix.data[14]
    });
    this.get("globalPosition", function() {
        _this.worldMatrix.extractPosition(_globalPosition);
        return _globalPosition
    });
    this.get("enabled", function() {
        return _enabled
    });
    this.set("enabled", function(enabled) {
        _enabled = enabled;
        if (_this.material) {
            _this.material.visibility(_enabled)
        }
        var child = _this.children.start();
        while (child) {
            child.enabled = enabled;
            child = _this.children.next()
        }
    });
    this.set("scene", function(scene) {
        if (!scene) {
            return false
        }
        _scene = _this._scene = scene;
        if (_this.material) {
            _this.material.draw(scene)
        }
    });
    this.add = function(obj) {
        if (!(obj instanceof D3.Object3D)) {
            throw "Can only add D3.Object3D"
        }
        obj._parent = this;
        this.children.push(obj);
        Render.nextFrame(function() {
            obj.scene = _scene
        })
    }
    ;
    this.remove = function(obj) {
        if (!(obj instanceof D3.Object3D)) {
            throw "Can only remove D3.Object3D"
        }
        obj._parent = null;
        obj.removed();
        this.children.remove(obj)
    }
    ;
    this.removed = function() {
        if (this.material) {
            this.material.remove()
        }
    }
    ;
    this.empty = function() {
        var obj = this.children.start();
        while (obj) {
            obj._parent = null;
            obj.removed();
            obj = this.children.next()
        }
        this.children.empty()
    }
    ;
    this.updateMatrix = function() {
        if (!this.directMatrix) {
            var p = this.position;
            var r = this.rotation;
            var s = this.scale;
            this.matrix.setTRS(p.x, p.y, p.z, r.x, r.y, r.z, s.x, s.y, s.z)
        }
        if (_lookDirection) {
            this.matrix.setLookAt(_lookDirection, D3.CENTER, D3.UP)
        }
        if (this._parent && this._parent.worldMatrix) {
            this._parent.worldMatrix.copyTo(this.worldMatrix);
            this.worldMatrix.multiply(this.matrix)
        } else {
            this.matrix.copyTo(this.worldMatrix)
        }
        if (_lookTarget) {
            this.worldMatrix.setLookAt(_lookTarget.globalPosition, D3.CENTER, D3.UP)
        }
        var child = this.children.start();
        while (child) {
            child.updateMatrix();
            child = this.children.next()
        }
    }
    ;
    this.updateView = function(inverse) {
        if (!_enabled) {
            return false
        }
        if (this.billboard) {
            inverse.copyTo(_tempMatrix);
            _tempMatrix.transpose();
            _tempMatrix.copyPosition(this.worldMatrix);
            _tempMatrix.scale(this.scale.x, this.scale.y, this.scale.z);
            _tempMatrix.data[3] = 0;
            _tempMatrix.data[7] = 0;
            _tempMatrix.data[11] = 0;
            _tempMatrix.data[15] = 1;
            _tempMatrix.copyTo(this.worldMatrix)
        }
        inverse.copyTo(this.viewMatrix);
        this.viewMatrix.multiply(this.worldMatrix);
        var child = this.children.start();
        while (child) {
            child.updateView(inverse);
            child = this.children.next()
        }
    }
    ;
    this.render = function(uniforms) {
        if (!_enabled) {
            return false
        }
        if (this.material) {
            this.material.render(uniforms)
        }
        var child = this.children.start();
        while (child) {
            child.render(uniforms);
            child = this.children.next()
        }
    }
    ;
    this.lookAt = function(target) {
        if (target instanceof Vector3) {
            _lookDirection = target
        } else {
            _lookTarget = target
        }
    }
    ;
    this.destroy = function() {
        if (!this._destroy) {
            return
        }
        this.empty();
        if (this._parent && this._parent.remove) {
            this._parent.remove(this)
        }
        return this._destroy()
    }
});
D3.Class(function PerspectiveProjection() {
    var _this = this;
    var prototype = PerspectiveProjection.prototype;
    this.data = new Float32Array(16);
    (function() {
        identity()
    }
    )();
    function identity() {
        var m = _this.data;
        m[0] = 1,
        m[1] = 0,
        m[2] = 0,
        m[3] = 0;
        m[4] = 0,
        m[5] = 1,
        m[6] = 0,
        m[7] = 0;
        m[8] = 0,
        m[9] = 0,
        m[10] = 1,
        m[11] = 0;
        m[12] = 0,
        m[13] = 0,
        m[14] = 0,
        m[15] = 1
    }
    prototype.identity = function() {
        identity();
        return this
    }
    ;
    prototype.perspective = function(fov, aspect, near, far) {
        var m = this.data;
        var t = near * Math.tan(fov * Math.PI / 360);
        var n = far - near;
        m[0] = near / (t * aspect);
        m[4] = 0;
        m[8] = 0;
        m[12] = 0;
        m[1] = 0;
        m[5] = near / t;
        m[9] = 0;
        m[13] = 0;
        m[2] = 0;
        m[6] = 0;
        m[10] = -(far + near) / n;
        m[14] = -(2 * far * near) / n;
        m[3] = 0;
        m[7] = 0;
        m[11] = -1;
        m[15] = 0
    }
    ;
    prototype.transformVector = function(v, pv) {
        var x = v.x
          , y = v.y
          , z = v.z
          , w = v.w;
        var m = this.data;
        pv = pv || v;
        pv.x = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
        pv.y = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
        pv.z = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
        return pv
    }
    ;
    prototype.inverse = function(m) {
        var mat = this.data;
        m = m || this.data;
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3], a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7], a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11], a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15], b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12, b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32, d = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06), invDet;
        if (!d) {
            return null
        }
        m[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
        m[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
        m[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
        m[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
        m[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
        m[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
        m[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
        m[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
        m[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
        m[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
        m[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
        m[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
        m[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
        m[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
        m[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
        m[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
        return m
    }
    ;
    prototype.copyTo = function(m) {
        var a = this.data;
        var b = m.data || m;
        for (var i = 0; i < 16; i++) {
            b[i] = a[i]
        }
        return m
    }
});
D3.Class(function Scene(_w, _h) {
    Inherit(this, Component);
    var _this = this;
    var _uniforms;
    var $container, $renderer;
    var _fov, _near, _far, _interact;
    this.children = new LinkedList();
    this.center = new Vector3(0,0,0);
    (function() {
        initContainer();
        initUniforms();
        setSize()
    }
    )();
    function initContainer() {
        if (!_w || !_h) {
            throw "D3.Scene requires width, height"
        }
        if (!THREAD) {
            $container = $("#Scene3D");
            $renderer = $container.create("Renderer");
            $renderer.center();
            _this.container = $container;
            _this.renderer = $renderer
        }
    }
    function initUniforms() {
        _uniforms = {};
        _uniforms.projection = new D3.PerspectiveProjection();
        _uniforms.scene = _this;
        _uniforms.offsetX = 0;
        _uniforms.offsetY = 0;
        _this.uniforms = _uniforms
    }
    function setSize() {
        _uniforms.width = _w;
        _uniforms.height = _h;
        _uniforms.aspect = _w / _h;
        _uniforms.centerX = _w / 2;
        _uniforms.centerY = _h / 2;
        if ($container) {
            $container.size(_w, _h)
        }
    }
    this.get("numChildren", function() {
        return _this.children.length
    });
    this.get("distance", function() {
        return _uniforms.cssDistance
    });
    this.setProjection = function(fov, near, far) {
        _fov = fov || (_fov || 30);
        _near = near || 0.1;
        _far = far || 1000;
        _uniforms.cssDistance = 0.5 / Math.tan(_fov * Math.PI / 360) * _uniforms.height;
        _uniforms.projection.perspective(_fov, _uniforms.width / _uniforms.height, _near, _far);
        if ($container) {
            $container.div.style[CSS.prefix("Perspective")] = _uniforms.cssDistance + "px";
            $renderer.div.style[CSS.prefix("TransformStyle")] = "preserve-3d"
        }
    }
    ;
    this.resize = function(w, h) {
        _w = w;
        _h = h;
        setSize();
        _this.setProjection()
    }
    ;
    this.add = function(obj) {
        if (!(obj instanceof D3.Object3D) && !(obj instanceof D3.Camera)) {
            throw "Can only add D3.Object3D"
        }
        obj._parent = this;
        obj.scene = this;
        this.children.push(obj)
    }
    ;
    this.remove = function(obj) {
        if (!(obj instanceof D3.Object3D) && !(obj instanceof D3.Camera)) {
            throw "Can only remove D3.Object3D"
        }
        obj.removed();
        obj._parent = null;
        this.children.remove(obj)
    }
    ;
    this.empty = function() {
        var obj = this.children.start();
        while (obj) {
            obj.removed();
            obj = this.children.next()
        }
        this.children.empty()
    }
    ;
    this.offset = function(x, y) {
        _uniforms.offsetX = x;
        _uniforms.offsetY = y
    }
    ;
    this.render = function(camera) {
        camera.updateMatrix();
        _uniforms.camera = camera;
        _uniforms.viewMatrix = camera.computeInverseMatrix();
        camera.uniforms = _uniforms;
        var obj = this.children.start();
        while (obj) {
            obj.updateMatrix();
            obj.updateView(_uniforms.viewMatrix);
            obj.render(_uniforms);
            obj = this.children.next()
        }
    }
});
Class(function SplitTextfield() {
    var _style = {
        display: "block",
        position: "relative",
        padding: 0,
        margin: 0,
        cssFloat: "left",
        styleFloat: "left",
        width: "auto",
        height: "auto"
    };
    function splitLetter($obj) {
        var _array = [];
        var text = $obj.div.innerHTML;
        var split = text.split("");
        $obj.div.innerHTML = "";
        for (var i = 0; i < split.length; i++) {
            if (split[i] == " ") {
                split[i] = "&nbsp;"
            }
            var letter = $("t", "span");
            letter.html(split[i], true).css(_style);
            _array.push(letter);
            $obj.addChild(letter)
        }
        return _array
    }
    function splitWord($obj) {
        var _array = [];
        var text = $obj.div.innerHTML;
        var split = text.split(" ");
        $obj.empty();
        for (var i = 0; i < split.length; i++) {
            var word = $("t", "span");
            var empty = $("t", "span");
            word.html(split[i]).css(_style);
            empty.html("&nbsp", true).css(_style);
            _array.push(word);
            _array.push(empty);
            $obj.addChild(word);
            $obj.addChild(empty)
        }
        return _array
    }
    this.split = function($obj, by) {
        if (by == "word") {
            return splitWord($obj)
        } else {
            return splitLetter($obj)
        }
    }
}, "Static");
Class(function CSSFilter($object, _vert, _frag) {
    Inherit(this, Component);
    var _this = this;
    var _filter = "";
    var _filters = ["grayscale", "sepia", "saturate", "hue", "invert", "opacity", "brightness", "contrast", "blur"];
    var _killTween, _tween;
    function checkFilter(key) {
        for (var i = _filters.length - 1; i > -1; i--) {
            if (_filters[i] == key) {
                return true
            }
        }
        return false
    }
    function buildFilters() {
        var str = "";
        var len = _filters.length - 1;
        for (var key in _this) {
            if (!checkFilter(key)) {
                continue
            }
            var filter = key;
            var value = _this[key];
            if (typeof value === "number") {
                filter = filter == "hue" ? "hue-rotate" : filter;
                value = filter == "hue-rotate" ? value + "deg" : value;
                value = filter == "blur" ? value + "px" : value;
                str += filter + "(" + value + ") "
            }
        }
        _filter = str
    }
    function clearTween() {
        if (_tween || !$object || !$object.div) {
            return false
        }
        $object.div.style[CSS.prefix("Transition")] = ""
    }
    this.apply = function() {
        buildFilters();
        $object.div.style[CSS.prefix("Filter")] = _filter
    }
    ;
    this.tween = function(props, time, ease, delay, callback) {
        if (typeof delay === "function") {
            callback = delay;
            delay = 0
        }
        delay = delay || 0;
        _killTween = false;
        var filter = "-" + Device.styles.vendor.toLowerCase() + "-filter";
        $object.willChange(filter);
        Render.setupTween(function() {
            if (_killTween) {
                return
            }
            $object.div.style[CSS.prefix("Transition")] = filter + " " + time + "ms " + TweenManager.getEase(ease) + " " + delay + "ms";
            for (var key in props) {
                _this[key] = props[key]
            }
            _tween = _this.delayedCall(function() {
                $object.willChange(null);
                if (callback) {
                    callback()
                }
            }, time + delay);
            _this.apply()
        })
    }
    ;
    this.stopTween = function() {
        clearTimeout(_tween);
        _killTween = true;
        clearTween()
    }
    ;
    this.clear = function() {
        for (var key in _this) {
            if (checkFilter(key)) {
                delete _this[key]
            }
        }
        if (_tween) {
            this.stopTween()
        }
        this.apply()
    }
    ;
    this.destroy = function() {
        this.clear();
        $object = null;
        _tween = null;
        return this._destroy()
    }
});
Class(function CSSAnimation() {
    Inherit(this, Component);
    var _this = this;
    var _name = "a" + Utils.timestamp();
    var _frames, _timer, _started;
    var _duration = 1000;
    var _ease = "linear";
    var _delay = 0;
    var _loop = false;
    var _count = 1;
    var _steps = null;
    var _applyTo = [];
    (function() {}
    )();
    function complete() {
        _this.playing = false;
        if (_this.events) {
            _this.events.fire(HydraEvents.COMPLETE, null, true)
        }
    }
    function updateCSS() {
        var css = CSS._read();
        var id = "/*" + _name + "*/";
        var keyframe = "@" + Device.vendor + "keyframes " + _name + " {\n";
        var string = id + keyframe;
        if (css.strpos(_name)) {
            var split = css.split(id);
            css = css.replace(id + split[1] + id, "")
        }
        var steps = _frames.length - 1;
        var perc = Math.round(100 / steps);
        var total = 0;
        for (var i = 0; i < _frames.length; i++) {
            var frame = _frames[i];
            if (i == _frames.length - 1) {
                total = 100
            }
            string += (frame.percent || total) + "% {\n";
            var hasTransform = false;
            var transforms = {};
            var styles = {};
            for (var key in frame) {
                if (TweenManager.checkTransform(key)) {
                    transforms[key] = frame[key];
                    hasTransform = true
                } else {
                    styles[key] = frame[key]
                }
            }
            if (hasTransform) {
                string += Device.vendor + "transform: " + TweenManager.parseTransform(transforms) + ";"
            }
            for (key in styles) {
                var val = styles[key];
                if (typeof val !== "string" && key != "opacity" && key != "zIndex") {
                    val += "px"
                }
                string += CSS._toCSS(key) + ": " + val + ";"
            }
            string += "\n}\n";
            total += perc
        }
        string += "}" + id;
        css += string;
        CSS._write(css)
    }
    function destroy() {
        var css = CSS._read();
        var id = "/*" + _name + "*/";
        if (css.strpos(_name)) {
            var split = css.split(id);
            css = css.replace(id + split[1] + id, "")
        }
        CSS._write(css)
    }
    function applyTo(callback) {
        for (var i = _applyTo.length - 1; i > -1; i--) {
            callback(_applyTo[i])
        }
    }
    this.set("frames", function(frames) {
        _frames = frames;
        updateCSS()
    });
    this.set("steps", function(steps) {
        _steps = steps;
        if (_this.playing) {
            applyTo(function($obj) {
                $obj.div.style[CSS.prefix("AnimationTimingFunction")] = "steps(" + steps + ")"
            })
        }
    });
    this.set("duration", function(duration) {
        _duration = Math.round(duration);
        if (_this.playing) {
            applyTo(function($obj) {
                $obj.div.style[CSS.prefix("AnimationDuration")] = _this.duration + "ms"
            })
        }
    });
    this.get("duration", function() {
        return _duration
    });
    this.set("ease", function(ease) {
        _ease = ease;
        if (_this.playing) {
            applyTo(function($obj) {
                $obj.div.style[CSS.prefix("AnimationTimingFunction")] = TweenManager.getEase(_ease)
            })
        }
    });
    this.get("ease", function() {
        return _ease
    });
    this.set("loop", function(loop) {
        _loop = loop;
        if (_this.playing) {
            applyTo(function($obj) {
                $obj.div.style[CSS.prefix("AnimationIterationCount")] = _loop ? "infinite" : _count
            })
        }
    });
    this.get("loop", function() {
        return _loop
    });
    this.set("count", function(count) {
        _count = count;
        if (_this.playing) {
            applyTo(function($obj) {
                $obj.div.style[CSS.prefix("AnimationIterationCount")] = _loop ? "infinite" : _count
            })
        }
    });
    this.get("count", function() {
        return _count
    });
    this.set("delay", function(delay) {
        _delay = delay;
        if (_this.playing) {
            applyTo(function($obj) {
                $obj.div.style[CSS.prefix("AnimationDelay")] = _delay + "ms"
            })
        }
    });
    this.get("delay", function() {
        return _delay
    });
    this.play = function() {
        applyTo(function($obj) {
            $obj.div.style[CSS.prefix("AnimationName")] = _name;
            $obj.div.style[CSS.prefix("AnimationDuration")] = _this.duration + "ms";
            $obj.div.style[CSS.prefix("AnimationTimingFunction")] = _steps ? "steps(" + _steps + ")" : TweenManager.getEase(_ease);
            $obj.div.style[CSS.prefix("AnimationIterationCount")] = _loop ? "infinite" : _count;
            $obj.div.style[CSS.prefix("AnimationPlayState")] = "running";
            $obj.div.style[CSS.prefix("AnimationDelay")] = _delay + "ms"
        });
        _this.playing = true;
        clearTimeout(_timer);
        if (!_this.loop) {
            _started = Date.now();
            _timer = _this.delayedCall(complete, _count * _duration)
        }
    }
    ;
    this.pause = function() {
        _this.playing = false;
        clearTimeout(_timer);
        applyTo(function($obj) {
            $obj.div.style[CSS.prefix("AnimationPlayState")] = "paused"
        })
    }
    ;
    this.stop = function() {
        _this.playing = false;
        clearTimeout(_timer);
        applyTo(function($obj) {
            $obj.div.style[CSS.prefix("AnimationName")] = ""
        })
    }
    ;
    this.applyTo = function($obj) {
        _applyTo.push($obj);
        if (_this.playing) {
            $obj.div.style[CSS.prefix("AnimationName")] = _name;
            $obj.div.style[CSS.prefix("AnimationDuration")] = _this.duration + "ms";
            $obj.div.style[CSS.prefix("AnimationTimingFunction")] = _steps ? "steps(" + _steps + ")" : TweenManager.getEase(_ease);
            $obj.div.style[CSS.prefix("AnimationIterationCount")] = _loop ? "infinite" : _count;
            $obj.div.style[CSS.prefix("AnimationPlayState")] = "running"
        }
    }
    ;
    this.remove = function($obj) {
        $obj.div.style[CSS.prefix("AnimationName")] = "";
        var i = _applyTo.indexOf($obj);
        if (i > -1) {
            _applyTo.splice(i, 1)
        }
    }
    ;
    this.destroy = function() {
        this.stop();
        _frames = null;
        destroy();
        return this._destroy()
    }
});
Class(function Warp($object, _useCSS) {
    Inherit(this, Component);
    var _this = this;
    var _time, _setupCSS, _complete;
    this.useCSS = _useCSS;
    this.points = [new Vector2(), new Vector2(), new Vector2(), new Vector2()];
    this.tl = this.points[0];
    this.tr = this.points[1];
    this.bl = this.points[2];
    this.br = this.points[3];
    function setDefaultPoints() {
        if (_this.points[1].x == 0) {
            _this.points[1].x = _this.width
        }
        if (_this.points[2].y == 0) {
            _this.points[2].y = _this.height
        }
        if (_this.points[3].x == 0) {
            _this.points[3].x = _this.width
        }
        if (_this.points[3].y == 0) {
            _this.points[3].y = _this.height
        }
    }
    function general2DProjection(x1s, y1s, x1d, y1d, x2s, y2s, x2d, y2d, x3s, y3s, x3d, y3d, x4s, y4s, x4d, y4d) {
        var s = basisToPoints(x1s, y1s, x2s, y2s, x3s, y3s, x4s, y4s);
        var d = basisToPoints(x1d, y1d, x2d, y2d, x3d, y3d, x4d, y4d);
        return multmm(d, adj(s))
    }
    function basisToPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
        var m = [x1, x2, x3, y1, y2, y3, 1, 1, 1];
        var v = multmv(adj(m), [x4, y4, 1]);
        return multmm(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]])
    }
    function adj(m) {
        return [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]]
    }
    function multmm(a, b) {
        var c = Array(9);
        for (var i = 0; i != 3; ++i) {
            for (var j = 0; j != 3; ++j) {
                var cij = 0;
                for (var k = 0; k != 3; ++k) {
                    cij += a[3 * i + k] * b[3 * k + j]
                }
                c[3 * i + j] = cij
            }
        }
        return c
    }
    function multmv(m, v) {
        return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]]
    }
    function transform2d(points, w, h) {
        var x1 = points[0].x;
        var y1 = points[0].y;
        var x2 = points[1].x;
        var y2 = points[1].y;
        var x3 = points[2].x;
        var y3 = points[2].y;
        var x4 = points[3].x;
        var y4 = points[3].y;
        var t = general2DProjection(0, 0, x1, y1, w, 0, x2, y2, 0, h, x3, y3, w, h, x4, y4);
        for (var i = 0; i < 9; i++) {
            t[i] = t[i] / t[8]
        }
        t = [t[0], t[3], 0, t[6], t[1], t[4], 0, t[7], 0, 0, 1, 0, t[2], t[5], 0, t[8]];
        if (Mobile.os == "iOS" || Device.browser.safari) {
            for (var i = 0; i < t.length; i++) {
                t[i] = t[i].toFixed(8)
            }
        }
        t = "matrix3d(" + t.join(", ") + ")";
        return t
    }
    function applyCSS(time, ease) {
        _setupCSS = false;
        var transform = transform2d(_this.points, _this.width, _this.height);
        var tween = Device.transformProperty + " " + time + "ms " + TweenManager.getEase(ease) + " 0ms";
        $object.div.style[Device.styles.vendorTransition] = tween;
        $object.div.style[Device.styles.vendorTransform] = transform;
        _this.delayedCall(function() {
            if (_complete) {
                _complete()
            }
            _complete = null;
            if ($object.willChange) {
                $object.willChange(false);
                $object.div.style[Device.styles.vendorTransition] = ""
            }
        }, time)
    }
    (function() {}
    )();
    this.render = function() {
        var t = Render.TIME;
        if (t - _time < 5 || !_this.points || !$object.div) {
            return false
        }
        _time = t;
        if (!_this.width) {
            _this.width = $object.width;
            _this.height = $object.height;
            $object.transformPoint(0, 0);
            if (!_this.width) {
                throw "Warp requires width and height"
            }
            setDefaultPoints()
        }
        $object.div.style[CSS.prefix("Transform")] = transform2d(_this.points, _this.width, _this.height)
    }
    ;
    this.tween = function(point, properties, time, ease, delay, complete) {
        if (!this.points) {
            return
        }
        if (typeof delay !== "number") {
            complete = delay;
            delay = 0
        }
        var p;
        switch (point) {
        case "tl":
            p = this.points[0];
            break;
        case "tr":
            p = this.points[1];
            break;
        case "bl":
            p = this.points[2];
            break;
        case "br":
            p = this.points[3];
            break;
        default:
            throw point + "not found on WarpView. Only tl, tr, bl, br accepted.";
            break
        }
        if (this.useCSS) {
            if (!_setupCSS) {
                $object.willChange(Device.transformProperty);
                _setupCSS = true;
                _this.render();
                Render.setupTween(function() {
                    applyCSS(time, ease)
                })
            }
            if (complete) {
                _complete = complete
            }
            p.copyFrom(properties)
        } else {
            return TweenManager.tween(p, properties, time, ease, delay, complete, this.render)
        }
    }
    ;
    this.destroy = function() {
        this.points.forEach(function(p) {
            TweenManager.clearTween(p)
        });
        return this._destroy()
    }
});
Class(function Canvas(_width, _height, _retina) {
    Inherit(this, Component);
    var _this = this;
    var _interactive, _over, _down, _local, _imgData;
    this.children = [];
    this.offset = {
        x: 0,
        y: 0
    };
    this.retina = _retina;
    (function() {
        if (_retina instanceof HydraObject) {
            initAsBackground(_retina)
        } else {
            initAsElement()
        }
        _this.width = _width;
        _this.height = _height;
        _this.context._matrix = new Matrix2();
        resize(_width, _height, _retina)
    }
    )();
    function initAsBackground() {
        var id = "c" + Utils.timestamp();
        _this.context = document.getCSSCanvasContext("2d", id, _width, _height);
        _this.background = "-" + Device.styles.vendor.toLowerCase() + "-canvas(" + id + ")";
        _retina.css({
            backgroundImage: _this.background
        });
        _retina = null
    }
    function initAsElement() {
        _this.div = document.createElement("canvas");
        _this.context = _this.div.getContext("2d");
        _this.object = $(_this.div)
    }
    function resize(w, h, retina) {
        var ratio = retina && Device.system.retina ? 2 : 1;
        if (_this.div) {
            _this.div.width = w * ratio;
            _this.div.height = h * ratio
        }
        _this.width = w;
        _this.height = h;
        _this.scale = ratio;
        if (_this.object) {
            _this.object.size(_this.width, _this.height)
        }
        if (Device.system.retina && retina) {
            _this.context.scale(ratio, ratio);
            _this.div.style.width = w + "px";
            _this.div.style.height = h + "px"
        }
    }
    function findHit(e) {
        e = Utils.touchEvent(e);
        e.x -= _this.offset.x;
        e.y -= _this.offset.y;
        e.width = 1;
        e.height = 1;
        for (var i = _this.children.length - 1; i > -1; i--) {
            var hit = _this.children[i].hit(e);
            if (hit) {
                return hit
            }
        }
        return false
    }
    function touchStart(e) {
        var hit = findHit(e);
        if (!hit) {
            return _this.interacting = false
        }
        _this.interacting = true;
        _down = hit;
        if (Device.mobile) {
            hit.events.fire(HydraEvents.HOVER, {
                action: "over"
            }, true);
            hit.__time = Date.now()
        }
    }
    function touchMove(e) {
        var hit = findHit(e);
        if (hit) {
            _this.interacting = true
        } else {
            _this.interacting = false
        }
        if (!Device.mobile) {
            if (hit && _over) {
                if (hit != _over) {
                    _over.events.fire(HydraEvents.HOVER, {
                        action: "out"
                    }, true);
                    hit.events.fire(HydraEvents.HOVER, {
                        action: "over"
                    }, true);
                    _over = hit
                }
            } else {
                if (hit && !_over) {
                    _over = hit;
                    hit.events.fire(HydraEvents.HOVER, {
                        action: "over"
                    }, true)
                } else {
                    if (!hit && _over) {
                        if (_over) {
                            _over.events.fire(HydraEvents.HOVER, {
                                action: "out"
                            }, true)
                        }
                        _over = null
                    }
                }
            }
        }
    }
    function touchEnd(e) {
        var hit = findHit(e);
        if (hit) {
            _this.interacting = true
        } else {
            _this.interacting = false
        }
        if (!_down && !hit) {
            return
        }
        if (!Device.mobile) {
            if (hit && hit == _down) {
                hit.events.fire(HydraEvents.CLICK, {
                    action: "click"
                }, true)
            }
        } else {
            if (_down) {
                _down.events.fire(HydraEvents.HOVER, {
                    action: "out"
                }, true)
            }
            if (hit == _down) {
                if (Date.now() - _down.__time < 750) {
                    hit.events.fire(HydraEvents.CLICK, {
                        action: "click"
                    }, true)
                }
            }
        }
        _down = null
    }
    this.set("interactive", function(val) {
        if (!_interactive && val) {
            Stage.bind("touchstart", touchStart);
            Stage.bind("touchmove", touchMove);
            Stage.bind("touchend", touchEnd)
        } else {
            if (_interactive && !val) {
                Stage.unbind("touchstart", touchStart);
                Stage.unbind("touchmove", touchMove);
                Stage.unbind("touchend", touchEnd)
            }
        }
        _interactive = val
    });
    this.get("interactive", function() {
        return _interactive
    });
    this.toDataURL = function(type, quality) {
        return _this.div.toDataURL(type, quality)
    }
    ;
    this.sort = function() {
        _objects.sort(function(a, b) {
            return a.z - b.z
        })
    }
    ;
    this.render = function(noClear) {
        if (!(typeof noClear === "boolean" && noClear)) {
            _this.clear()
        }
        var len = _this.children.length;
        for (var i = 0; i < len; i++) {
            _this.children[i].render()
        }
    }
    ;
    this.clear = function() {
        _this.context.clearRect(0, 0, _this.div.width, _this.div.height)
    }
    ;
    this.add = function(display) {
        display.setCanvas(this);
        display._parent = this;
        this.children.push(display);
        display._z = this.children.length
    }
    ;
    this.remove = function(display) {
        display._canvas = null;
        display._parent = null;
        var i = this.children.indexOf(display);
        if (i > -1) {
            this.children.splice(i, 1)
        }
    }
    ;
    this.destroy = function() {
        if (_interactive) {
            Stage.unbind("touchstart", touchStart);
            Stage.unbind("touchmove", touchMove);
            Stage.unbind("touchend", touchEnd)
        }
        this.stopRender();
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].destroy) {
                this.children[i].destroy()
            }
        }
        return this._destroy()
    }
    ;
    this.startRender = function() {
        Render.startRender(_this.render)
    }
    ;
    this.stopRender = function() {
        Render.stopRender(_this.render)
    }
    ;
    this.getImageData = function(x, y, w, h) {
        this.imageData = this.context.getImageData(x || 0, y || 0, w || this.width, h || this.height);
        return this.imageData
    }
    ;
    this.getPixel = function(x, y, dirty) {
        if (!this.imageData || dirty) {
            _this.getImageData(0, 0, _this.width, _this.height)
        }
        if (!_imgData) {
            _imgData = {}
        }
        var index = (x + y * _this.width) * 4;
        var pixels = this.imageData.data;
        _imgData.r = pixels[index];
        _imgData.g = pixels[index + 1];
        _imgData.b = pixels[index + 2];
        _imgData.a = pixels[index + 3];
        return _imgData
    }
    ;
    this.texture = function(src) {
        var img = new Image();
        img.src = src;
        return img
    }
    ;
    this.localizeMouse = function() {
        _local = _local || {};
        _local.x = Mouse.x - _this.offset.x;
        _local.y = Mouse.y - _this.offset.y;
        return _local
    }
    ;
    this.size = resize
});
Class(function CanvasTexture(_texture, _w, _h, _force) {
    Inherit(this, CanvasObject);
    var _this = this;
    var _mask;
    this.width = _w || 0;
    this.height = _h || 0;
    (function() {
        initTexture()
    }
    )();
    function initTexture() {
        if (typeof _texture === "string") {
            _texture = CanvasTexture.createImage(_texture, _force);
            if (_texture.width > 0) {
                setDimensions()
            } else {
                _texture.onload = setDimensions
            }
        } else {
            setDimensions()
        }
        _this.texture = _texture
    }
    function setDimensions() {
        if (_this.onload) {
            _this.onload()
        }
        if (!_this.width && !_this.height) {
            _this.width = _texture.width / (_this._canvas && _this._canvas.retina ? 2 : 1);
            _this.height = _texture.height / (_this._canvas && _this._canvas.retina ? 2 : 1)
        }
    }
    this.set("texture", function(img) {
        _texture = img
    });
    this.draw = function(override) {
        var context = this._canvas.context;
        if (this.isMask() && !override) {
            return false
        }
        if (_texture) {
            this.startDraw(this.anchor.tx, this.anchor.ty, override);
            context.drawImage(_texture, -this.anchor.tx, -this.anchor.ty, this.width, this.height);
            this.endDraw()
        }
        if (_mask) {
            context.globalCompositeOperation = "source-in";
            _mask.render(true);
            context.globalCompositeOperation = "source-over"
        }
    }
    ;
    this.mask = function(object) {
        if (!object) {
            return _mask = null
        }
        if (!this._parent) {
            throw "CanvasTexture :: Must add to parent before masking."
        }
        var siblings = this._parent.children;
        var canMask = false;
        for (var i = 0; i < siblings.length; i++) {
            if (object == siblings[i]) {
                canMask = true
            }
        }
        if (canMask) {
            _mask = object;
            object.masked = this
        } else {
            throw "CanvasGraphics :: Can only mask a sibling"
        }
    }
}, function() {
    var _images = {};
    CanvasTexture.createImage = function(src, force) {
        if (!_images[src] || force) {
            var img = Images.createImg(src);
            if (force) {
                return img
            }
            _images[src] = img
        }
        return _images[src]
    }
});
Class(function CanvasGraphics(_w, _h) {
    Inherit(this, CanvasObject);
    var _this = this;
    var _props = {};
    var _draw = [];
    var _pool, _mask;
    this.width = _w || 0;
    this.height = _h || 0;
    (function() {
        initArrayPool()
    }
    )();
    function setProperties(context) {
        for (var key in _props) {
            var val = _props[key];
            if (val instanceof Color) {
                context[key] = val.getHexString()
            } else {
                context[key] = val
            }
        }
    }
    function initArrayPool() {
        _pool = new ObjectPool(Array,25)
    }
    function draw() {
        var array = _pool.get() || [];
        for (var i = 0; i < arguments.length; i++) {
            array[i] = arguments[i]
        }
        _draw.push(array)
    }
    this.set("strokeStyle", function(val) {
        _props.strokeStyle = val
    });
    this.get("strokeStyle", function() {
        return _props.strokeStyle
    });
    this.set("fillStyle", function(val) {
        _props.fillStyle = val
    });
    this.get("fillStyle", function() {
        return _props.fillStyle
    });
    this.set("lineWidth", function(val) {
        _props.lineWidth = val
    });
    this.get("lineWidth", function() {
        return _props.lineWidth
    });
    this.set("lineWidth", function(val) {
        _props.lineWidth = val
    });
    this.get("lineWidth", function() {
        return _props.lineWidth
    });
    this.set("lineCap", function(val) {
        _props.lineCap = val
    });
    this.get("lineCap", function() {
        return _props.lineCap
    });
    this.set("lineDashOffset", function(val) {
        _props.lineDashOffset = val
    });
    this.get("lineDashOffset", function() {
        return _props.lineDashOffset
    });
    this.set("lineJoin", function(val) {
        _props.lineJoin = val
    });
    this.get("lineJoin", function() {
        return _props.lineJoin
    });
    this.set("lineJoin", function(val) {
        _props.lineJoin = val
    });
    this.get("lineJoin", function() {
        return _props.lineJoin
    });
    this.set("lineJoin", function(val) {
        _props.lineJoin = val
    });
    this.get("lineJoin", function() {
        return _props.lineJoin
    });
    this.set("miterLimit", function(val) {
        _props.miterLimit = val
    });
    this.get("miterLimit", function() {
        return _props.miterLimit
    });
    this.set("font", function(val) {
        _props.font = val
    });
    this.get("font", function(val) {
        return _props.font
    });
    this.set("textAlign", function(val) {
        _props.textAlign = val
    });
    this.get("textAlign", function(val) {
        return _props.textAlign
    });
    this.set("textBaseline", function(val) {
        _props.textBaseline = val
    });
    this.get("textBaseline", function(val) {
        return _props.textBaseline
    });
    this.draw = function(override) {
        if (this.isMask() && !override) {
            return false
        }
        var context = this._canvas.context;
        this.startDraw(-this.anchor.tx, -this.anchor.ty);
        setProperties(context);
        for (var i = 0; i < _draw.length; i++) {
            var cmd = _draw[i];
            if (!cmd) {
                continue
            }
            var fn = cmd.shift();
            context[fn].apply(context, cmd);
            cmd.unshift(fn)
        }
        this.endDraw();
        if (_mask) {
            context.save();
            context.clip();
            _mask.render(true);
            context.restore()
        }
    }
    ;
    this.clear = function() {
        for (var i = 0; i < _draw.length; i++) {
            _draw[i].length = 0;
            _pool.put(_draw[i])
        }
        _draw.length = 0
    }
    ;
    this.arc = function(x, y, endAngle, radius, startAngle, anti) {
        if (x && !y) {
            endAngle = x;
            x = 0;
            y = 0
        }
        x = x || 0;
        y = y || 0;
        endAngle = endAngle || 0;
        endAngle -= 90;
        anti = anti || false;
        startAngle = startAngle || 0;
        startAngle -= 90;
        radius = radius ? radius : this.radius || this.width / 2;
        draw("beginPath");
        draw("arc", x, y, radius, Utils.toRadians(startAngle), Utils.toRadians(endAngle), anti)
    }
    ;
    this.quadraticCurveTo = function(cpx, cpy, x, y) {
        draw("quadraticCurveTo", cpx, cpy, x, y)
    }
    ;
    this.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
        draw("bezierCurveTo", cp1x, cp1y, cp2x, cp2y, x, y)
    }
    ;
    this.fillRect = function(x, y, w, h) {
        draw("fillRect", x, y, w, h)
    }
    ;
    this.clearRect = function(x, y, w, h) {
        draw("clearRect", x, y, w, h)
    }
    ;
    this.strokeRect = function(x, y, w, h) {
        draw("strokeRect", x, y, w, h)
    }
    ;
    this.moveTo = function(x, y) {
        draw("moveTo", x, y)
    }
    ;
    this.lineTo = function(x, y) {
        draw("lineTo", x, y)
    }
    ;
    this.stroke = function() {
        draw("stroke")
    }
    ;
    this.fill = function() {
        if (!_mask) {
            draw("fill")
        }
    }
    ;
    this.beginPath = function() {
        draw("beginPath")
    }
    ;
    this.closePath = function() {
        draw("closePath")
    }
    ;
    this.fillText = function(text, x, y, maxWidth) {
        draw("fillText", text, x, y, maxWidth)
    }
    ;
    this.strokeText = function(text, x, y, maxWidth) {
        draw("strokeText", text, x, y, maxWidth)
    }
    ;
    this.setLineDash = function(value) {
        draw("setLineDash", value)
    }
    ;
    this.mask = function(object) {
        if (!object) {
            return _mask = null
        }
        if (!this._parent) {
            throw "CanvasTexture :: Must add to parent before masking."
        }
        var siblings = this._parent.children;
        var canMask = false;
        for (var i = 0; i < siblings.length; i++) {
            if (object == siblings[i]) {
                canMask = true
            }
        }
        if (canMask) {
            _mask = object;
            object.masked = this;
            for (i = 0; i < _draw.length; i++) {
                if (_draw[i][0] == "fill" || _draw[i][0] == "stroke") {
                    _draw[i].length = 0;
                    _pool.put(_draw[i]);
                    _draw.splice(i, 1)
                }
            }
        } else {
            throw "CanvasGraphics :: Can only mask a sibling"
        }
    }
});
Class(function CanvasObject() {
    Inherit(this, Component);
    var _this = this;
    this.alpha = 1;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.rotation = 0;
    this.scale = 1;
    this.visible = true;
    this.anchor = {
        x: 0.5,
        y: 0.5
    };
    this.values = new CanvasValues();
    this.styles = new CanvasValues(true);
    this.children = [];
    this.blendMode = "normal";
    this.updateValues = function() {
        this.anchor.tx = this.anchor.x <= 1 && !this.anchor.full ? this.anchor.x * this.width : this.anchor.x;
        this.anchor.ty = this.anchor.y <= 1 && !this.anchor.full ? this.anchor.y * this.height : this.anchor.y;
        this.values.setTRSA(this.x, this.y, Utils.toRadians(this.rotation), this.scaleX || this.scale, this.scaleY || this.scale, this.alpha);
        if (this._parent.values) {
            this.values.calculate(this._parent.values)
        }
        if (this._parent.styles) {
            this.styles.calculateStyle(this._parent.styles)
        }
    }
    ;
    this.render = function(override) {
        if (!this.visible) {
            return false
        }
        this.updateValues();
        if (this.draw) {
            this.draw(override)
        }
        var len = this.children.length;
        for (var i = 0; i < len; i++) {
            this.children[i].render(override)
        }
    }
    ;
    this.startDraw = function(ox, oy, override) {
        var context = this._canvas.context;
        var v = this.values.data;
        var x = v[0] + (ox || 0);
        var y = v[1] + (oy || 0);
        if (this.styles.styled) {
            context.save()
        }
        context._matrix.setTRS(x, y, v[2], v[3], v[4]);
        if (!override) {
            context.globalCompositeOperation = this.blendMode || "normal"
        }
        var m = context._matrix.data;
        context.transform(m[0], m[3], m[1], m[4], m[2], m[5]);
        context.globalAlpha = v[5];
        if (this.styles.styled) {
            var values = this.styles.values;
            for (var key in values) {
                var val = values[key];
                if (val instanceof Color) {
                    context[key] = val.getHexString()
                } else {
                    context[key] = val
                }
            }
        }
    }
    ;
    this.endDraw = function() {
        var context = this._canvas.context;
        context._matrix.inverse();
        var m = context._matrix.data;
        if (this.styles.styled) {
            context.restore()
        } else {
            context.transform(m[0], m[3], m[1], m[4], m[2], m[5])
        }
    }
    ;
    this.add = function(display) {
        display._canvas = this._canvas;
        display._parent = this;
        this.children.push(display);
        display._z = this.children.length
    }
    ;
    this.setCanvas = function(canvas) {
        this._canvas = canvas;
        for (var i = this.children.length - 1; i > -1; i--) {
            var child = this.children[i];
            child.setCanvas(canvas)
        }
    }
    ;
    this.remove = function(display) {
        display._canvas = null;
        display._parent = null;
        var i = this.children.indexOf(display);
        if (i > -1) {
            this.children.splice(i, 1)
        }
    }
    ;
    this.isMask = function() {
        var obj = this;
        while (obj) {
            if (obj.masked) {
                return true
            }
            obj = obj._parent
        }
        return false
    }
    ;
    this.unmask = function() {
        this.masked.mask(null);
        this.masked = null
    }
    ;
    this.setZ = function(z) {
        if (!this._parent) {
            throw "CanvasObject :: Must add to parent before setZ"
        }
        this._z = z;
        this._parent.children.sort(function(a, b) {
            return a._z - b._z
        })
    }
    ;
    this.hit = function(e) {
        if (!this.ignoreHit) {
            var hit = Utils.hitTestObject(e, this.values.hit(this));
            if (hit) {
                return this
            }
        }
        for (var i = this.children.length - 1; i > -1; i--) {
            var child = this.children[i];
            hit = child.hit(e);
            if (hit) {
                return child
            }
        }
        return false
    }
    ;
    this.destroy = function() {
        for (var i = 0; i < this.children.length; i++) {
            if (this.children[i].destroy) {
                this.children[i].destroy()
            }
        }
        return Utils.nullObject(this)
    }
});
Class(function CanvasValues(_style) {
    Inherit(this, Component);
    var _this = this;
    var _styles = {};
    var _hit = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    if (!_style) {
        this.data = new Float32Array(6)
    } else {
        this.styled = false
    }
    this.set("shadowOffsetX", function(val) {
        _this.styled = true;
        _styles.shadowOffsetX = val
    });
    this.get("shadowOffsetX", function() {
        return _styles.shadowOffsetX
    });
    this.set("shadowOffsetY", function(val) {
        _this.styled = true;
        _styles.shadowOffsetY = val
    });
    this.get("shadowOffsetY", function() {
        return _styles.shadowOffsetY
    });
    this.set("shadowBlur", function(val) {
        _this.styled = true;
        _styles.shadowBlur = val
    });
    this.get("shadowBlur", function() {
        return _styles.shadowBlur
    });
    this.set("shadowColor", function(val) {
        _this.styled = true;
        _styles.shadowColor = val
    });
    this.get("shadowColor", function() {
        _this.styled = true;
        return _styles.shadowColor
    });
    this.get("values", function() {
        return _styles
    });
    this.setTRSA = function(x, y, r, sx, sy, a) {
        var m = this.data;
        m[0] = x;
        m[1] = y;
        m[2] = r;
        m[3] = sx;
        m[4] = sy;
        m[5] = a
    }
    ;
    this.calculate = function(values) {
        var v = values.data;
        var m = this.data;
        m[0] = m[0] + v[0];
        m[1] = m[1] + v[1];
        m[2] = m[2] + v[2];
        m[3] = m[3] * v[3];
        m[4] = m[4] * v[4];
        m[5] = m[5] * v[5]
    }
    ;
    this.calculateStyle = function(parent) {
        if (!parent.styled) {
            return false
        }
        this.styled = true;
        var values = parent.values;
        for (var key in values) {
            if (!_styles[key]) {
                _styles[key] = values[key]
            }
        }
    }
    ;
    this.hit = function(object) {
        _hit.x = this.data[0];
        _hit.y = this.data[1];
        _hit.width = object.width;
        _hit.height = object.height;
        return _hit
    }
});
Class(function GLStage(_width, _height, _retina, _options) {
    Inherit(this, Component);
    var _this = this;
    var _canvas, _gl, _composer;
    var _texture, _utils, _extensions;
    this.children = [];
    this.retina = _retina;
    (function() {
        initCanvas();
        resize(_width, _height, _retina);
        getContext();
        addListeners();
        HydraEvents.createLocalEmitter(_this)
    }
    )();
    function initCanvas() {
        _canvas = document.createElement("canvas");
        _this.div = _canvas;
        _this.object = $(_canvas)
    }
    function getContext() {
        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        for (var i = 0; i < names.length; i++) {
            try {
                _gl = _canvas.getContext(names[i], _options)
            } catch (e) {}
            if (_gl) {
                break
            }
        }
        for (i = 0; i < _this.children.length; i++) {
            _this.children[i].gl(_gl, _this)
        }
        if (_composer) {
            _composer.gl(_gl, _this)
        }
        _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA);
        _gl.enable(_gl.BLEND);
        _gl.disable(_gl.DEPTH_TEST);
        if (_this.fire && _this.context != _gl) {
            _this.fire("context", {
                gl: _gl
            })
        }
        _this.context = _gl;
        if (_extensions) {
            _extensions.forEach(function(ext) {
                _gl.getExtension(ext)
            })
        }
    }
    function resize(w, h, retina) {
        var ratio = retina && Device.system.retina ? 2 : 1;
        if (_this.div) {
            _this.div.width = w * ratio;
            _this.div.height = h * ratio
        }
        _this.width = w;
        _this.height = h;
        _this.scale = ratio;
        if (_this.object) {
            _this.object.size(_this.width, _this.height, true)
        }
        if (_gl) {
            _gl.viewport(0, 0, w * ratio, h * ratio)
        }
        if (_composer) {
            _composer.resize(_this.width, _this.height)
        }
    }
    function addListeners() {
        _canvas.addEventListener("webglcontextlost", contextLost);
        _canvas.addEventListener("webglcontextrestored", getContext)
    }
    function contextLost() {
        _gl = null
    }
    this.size = function(width, height, retina) {
        resize(width, height, retina);
        _this.fire("resize")
    }
    ;
    this.startRender = function() {
        Render.startRender(_this.render)
    }
    ;
    this.stopRender = function() {
        Render.stopRender(_this.render)
    }
    ;
    this.add = function(obj) {
        obj.gl(_gl, this);
        obj._parent = this;
        this.children.push(obj);
        obj._z = this.children.length
    }
    ;
    this.remove = function(obj) {
        var index = this.children.indexOf(obj);
        if (index > -1) {
            obj._parent = null;
            this.children.splice(index, 1)
        }
    }
    ;
    this.render = function(fbo) {
        if (!_gl) {
            return
        }
        fbo = fbo && typeof fbo !== "number" ? fbo : null;
        if (fbo) {
            fbo._startDraw(_gl, _this)
        }
        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BIT);
        _this.renderChildren();
        if (fbo) {
            fbo._endDraw()
        }
    }
    ;
    this.renderChildren = function() {
        for (var i = 0; i < _this.children.length; i++) {
            var obj = _this.children[i];
            if (obj.render) {
                obj.render()
            }
        }
    }
    ;
    this.setClearColor = function(color, alpha) {
        _gl.clearColor(color.r, color.g, color.b, alpha)
    }
    ;
    this.enableExtension = function(ext) {
        if (!_extensions) {
            _extensions = []
        }
        _extensions.push(ext);
        _gl.getExtension(ext)
    }
    ;
    this._draw = function(obj) {
        if (_gl.program != obj.shader.program) {
            _gl.program = obj.shader.program;
            _gl.useProgram(_gl.program)
        }
        if (obj.blending == GLObject.ADDITIVE_BLENDING) {
            _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE)
        } else {
            _gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA)
        }
        _gl.uniform2f(_gl.getUniformLocation(_gl.program, "resolution"), _this.width, _this.height);
        obj.geometry.setupBuffers(_gl);
        obj.setupMatrices();
        obj.shader.update();
        obj.draw();
        var drawMode;
        switch (obj.getDrawMode()) {
        case "points":
            drawMode = _gl.POINTS;
            break;
        case "wireframe":
            drawMode = _gl.LINE_STRIP;
            break;
        default:
            drawMode = _gl.TRIANGLES;
            break
        }
        _gl.drawArrays(drawMode, 0, obj.geometry._vertexCount)
    }
    ;
    this.destroy = function() {
        if (!this._destroy) {
            return
        }
        _this.object.remove();
        this.stopRender();
        return this._destroy()
    }
});
Class(function GLPlaneGeometry(_width, _height, _rows, _cols) {
    Inherit(this, GLGeometry);
    var _this = this;
    this.width = _width;
    this.height = _height;
    this.rows = _rows || 1;
    this.cols = _cols || 1;
    this.vertices = [];
    (function() {
        initVertices()
    }
    )();
    function initVertices() {
        if (!_this.vertexAttribute) {
            _this.vertexAttribute = new GLAttribute("position",getTris(),3);
            _this.uvAttribute = new GLAttribute("uv",getUV(),2);
            _this.addBuffer(_this.vertexAttribute);
            _this.addBuffer(_this.uvAttribute)
        } else {
            _this.vertexAttribute.array = getTris();
            _this.uvAttribute.array = getUV();
            _this.vertexAttribute.needsUpdate = true;
            _this.uvAttribute.needsUpdate = true
        }
    }
    function findVertex(x, y) {
        for (var i = _this.vertices.length - 1; i > -1; i--) {
            var v = _this.vertices[i];
            if (v.x == x && v.y == y) {
                return v
            }
        }
        v = new Vector3(x,y,0);
        v.updateX = [];
        v.updateY = [];
        v.updateZ = [];
        _this.vertices.push(v);
        return v
    }
    function getTris() {
        var w = _this.width;
        var h = _this.height;
        var xseg = _this.rows;
        var yseg = _this.cols;
        var x = 0;
        var y = 0;
        var xw = w / xseg;
        var yh = h / yseg;
        var tris = [];
        var total = xseg * yseg;
        var x1, y1, x2, y2, v;
        for (var i = 0; i < total; i++) {
            x1 = x;
            x2 = x + xw;
            y1 = y;
            y2 = y + yh;
            x1 = parseFloat(x1.toFixed(1));
            x2 = parseFloat(x2.toFixed(1));
            y1 = parseFloat(y1.toFixed(1));
            y2 = parseFloat(y2.toFixed(1));
            tris.push(x1);
            tris.push(y1);
            tris.push(0);
            v = findVertex(x1, y1);
            v.updateX.push(tris.length - 3);
            v.updateY.push(tris.length - 2);
            v.updateZ.push(tris.length - 1);
            tris.push(x2);
            tris.push(y1);
            tris.push(0);
            v = findVertex(x2, y1);
            v.updateX.push(tris.length - 3);
            v.updateY.push(tris.length - 2);
            v.updateZ.push(tris.length - 1);
            tris.push(x1);
            tris.push(y2);
            tris.push(0);
            v = findVertex(x1, y2);
            v.updateX.push(tris.length - 3);
            v.updateY.push(tris.length - 2);
            v.updateZ.push(tris.length - 1);
            tris.push(x1);
            tris.push(y2);
            tris.push(0);
            v = findVertex(x1, y2);
            v.updateX.push(tris.length - 3);
            v.updateY.push(tris.length - 2);
            v.updateZ.push(tris.length - 1);
            tris.push(x2);
            tris.push(y1);
            tris.push(0);
            v = findVertex(x2, y1);
            v.updateX.push(tris.length - 3);
            v.updateY.push(tris.length - 2);
            v.updateZ.push(tris.length - 1);
            tris.push(x2);
            tris.push(y2);
            tris.push(0);
            v = findVertex(x2, y2);
            v.updateX.push(tris.length - 3);
            v.updateY.push(tris.length - 2);
            v.updateZ.push(tris.length - 1);
            x += xw;
            if (x > w - 1) {
                x = 0;
                y += yh
            }
        }
        x = _this.width / 2 - w / 2;
        y = _this.height / 2 - h / 2;
        var count = 0;
        for (i = 0; i < tris.length; i++) {
            if (i % 3 == 0) {
                continue
            }
            if (count % 2 == 0) {
                tris[i] += x
            } else {
                tris[i] += y
            }
            count++
        }
        _this._num = tris.length / 3;
        return new Float32Array(tris)
    }
    function getUV() {
        var w = _this.width;
        var h = _this.height;
        var xseg = _this.rows;
        var yseg = _this.cols;
        var x = 0;
        var y = 0;
        var xw = w / xseg;
        var yh = h / yseg;
        var tris = [];
        var total = xseg * yseg;
        var x1, y1, x2, y2, v;
        for (var i = 0; i < total; i++) {
            x1 = x;
            x2 = x + xw;
            y1 = y;
            y2 = y + yh;
            tris.push(x1);
            tris.push(y1);
            tris.push(x2);
            tris.push(y1);
            tris.push(x1);
            tris.push(y2);
            tris.push(x1);
            tris.push(y2);
            tris.push(x2);
            tris.push(y1);
            tris.push(x2);
            tris.push(y2);
            x += xw;
            if (x > w - 1) {
                x = 0;
                y += yh
            }
        }
        x = _this.width / 2 - w / 2;
        y = _this.height / 2 - h / 2;
        for (i = 0; i < tris.length; i++) {
            if (i % 2 == 0) {
                tris[i] /= w
            } else {
                tris[i] /= h
            }
        }
        return new Float32Array(tris)
    }
    this.updateVertices = function() {
        var array = _this.vertexAttribute.array;
        for (var i = _this.vertices.length - 1; i > -1; i--) {
            var v = _this.vertices[i];
            for (var x = v.updateX.length - 1; x > -1; x--) {
                array[v.updateX[x]] = v.x
            }
            for (var y = v.updateY.length - 1; y > -1; y--) {
                array[v.updateY[y]] = v.y
            }
            for (var z = v.updateZ.length - 1; z > -1; z--) {
                array[v.updateZ[z]] = v.z
            }
        }
        _this.vertexAttribute.needsUpdate = true
    }
    ;
    this.setOrigin = function(x, y) {
        var w = _this.width * x;
        var h = _this.height * y;
        for (var i = _this.vertices.length - 1; i > -1; i--) {
            var v = _this.vertices[i];
            v.copyFrom(v.origin);
            v.x -= w;
            v.y -= h
        }
        _this.updateVertices()
    }
    ;
    this.resize = function(width, height) {
        _width = _this.width = width;
        _height = _this.height = height;
        _this.vertices.length = [];
        initVertices()
    }
});
Class(function GLObject() {
    Inherit(this, Component);
    var _this = this;
    var _gl, _stage;
    this.children = [];
    this.position = new Vector3();
    this.rotation = new Vector3();
    this.scale = new Vector3(1,1,1);
    this.alpha = 1;
    this.globalAlpha = 1;
    this.matrix = new Matrix4();
    this.worldMatrix = new Matrix4();
    this.visible = true;
    this.useMatrix = true;
    function visible() {
        var parent = _this._parent;
        while (parent && !(parent instanceof GLStage)) {
            if (!parent.visible) {
                return false
            }
            parent = parent._parent
        }
        return _this.visible
    }
    this.gl = this.init = function(gl, stage) {
        _this = this;
        _gl = gl;
        _stage = stage;
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].gl(_gl, stage)
        }
    }
    ;
    this.updateMatrix = function(force) {
        if (!this.useMatrix && !force) {
            return
        }
        var p = this.position;
        var r = this.rotation;
        var s = this.scale;
        this.matrix.setTRS(p.x, p.y, p.z, r.x, r.y, r.z, s.x, s.y, s.z);
        if (this._parent && this._parent.worldMatrix) {
            this._parent.worldMatrix.copyTo(this.worldMatrix);
            this.worldMatrix.multiply(this.matrix);
            this.globalAlpha = this._parent.globalAlpha * this.alpha
        } else {
            this.matrix.copyTo(this.worldMatrix);
            this.globalAlpha = this.alpha
        }
    }
    ;
    this.setupMatrices = function() {
        var transformMatrix = _gl.getUniformLocation(_gl.program, "transformMatrix");
        _gl.uniformMatrix4fv(transformMatrix, false, _this.worldMatrix.data);
        if (this.uniformMatrix) {
            for (var key in this.uniformMatrix) {
                var loc = _gl.getUniformLocation(_gl.program, key);
                _gl.uniformMatrix4fv(loc, false, this.uniformMatrix[key])
            }
        }
        var alpha = _gl.getUniformLocation(_gl.program, "alpha");
        _gl.uniform1f(alpha, false, _this.globalAlpha)
    }
    ;
    this.add = function(obj) {
        obj.gl(_gl, _stage);
        obj._parent = this;
        this.children.push(obj);
        obj._z = this.children.length
    }
    ;
    this.remove = function(obj) {
        var index = this.children.indexOf(obj);
        if (index > -1) {
            obj._parent = null;
            this.children.splice(index, 1)
        }
    }
    ;
    this.setZ = function(z) {
        if (!this._parent) {
            return
        }
        this._z = z;
        this._parent.children.sort(function(a, b) {
            if (a._z == b._z) {
                if (a == this) {
                    return a
                }
                return b
            }
            return a._z - b._z
        })
    }
    ;
    this.render = function() {
        this.updateMatrix();
        if (this.shader && visible()) {
            _stage._draw(this)
        }
        for (var i = 0; i < this.children.length; i++) {
            var obj = this.children[i];
            obj.render()
        }
    }
}, function() {
    GLObject.ADDITIVE_BLENDING = 1
});
Class(function GLMesh(_texture, _geometry, _shader) {
    Inherit(this, GLObject);
    var _this = this;
    var _gl, _stage;
    _shader = _shader || new GLShader();
    this.texture = _texture;
    this.geometry = _geometry;
    this.shader = _shader;
    (function() {
        if (!_geometry) {
            throw "GLMesh requires geometry"
        }
        _this.uniforms = _this.shader.uniforms
    }
    )();
    this.gl = function(gl, stage) {
        _gl = gl;
        _stage = stage;
        _this.texture.gl(gl, stage);
        _this.shader.gl(gl, stage);
        _this.init(gl, stage)
    }
    ;
    this.draw = function() {
        if (_this.texture) {
            _this.texture.drawTexture(_gl, "uTexture", 0)
        }
    }
    ;
    this.getDrawMode = function() {
        if (this.wireframe) {
            return "wireframe"
        }
        return "triangle"
    }
});
Class(function GLParticles(_geometry, _shader) {
    Inherit(this, GLObject);
    var _this = this;
    var _gl, _stage;
    this.geometry = _geometry;
    this.shader = _shader || new GLShader();
    (function() {
        if (!_geometry) {
            throw "GLMesh reqires geometry"
        }
        _this.uniforms = _this.shader.uniforms;
        _shader.processShader = processShader
    }
    )();
    function processShader(type, string) {
        if (type == "vertex") {
            string = string.replace("varying vec2 vUv;", "");
            string = string.replace("attribute vec2 uv;", "")
        } else {
            string = string.replace("varying vec2 vUv;", "")
        }
        return string
    }
    this.gl = function(gl, stage) {
        _gl = gl;
        _stage = stage;
        _shader.gl(gl, stage);
        _this.init(gl, stage)
    }
    ;
    this.draw = function() {}
    ;
    this.getDrawMode = function() {
        return "points"
    }
});
Class(function TweenManager() {
    Namespace(this);
    var _this = this;
    var _tweens = [];
    (function() {
        if (window.Hydra) {
            Hydra.ready(initPools)
        }
        if (window.Render) {
            Render.startRender(updateTweens)
        }
    }
    )();
    function initPools() {
        _this._dynamicPool = new ObjectPool(DynamicObject,100);
        _this._arrayPool = new ObjectPool(Array,100);
        _this._dynamicPool.debug = true
    }
    function updateTweens(time) {
        for (var i = 0; i < _tweens.length; i++) {
            _tweens[i].update(time)
        }
    }
    function stringToValues(str) {
        var values = str.split("(")[1].slice(0, -1).split(",");
        for (var i = 0; i < values.length; i++) {
            values[i] = parseFloat(values[i])
        }
        return values
    }
    function findEase(name) {
        var eases = _this.CSSEases;
        for (var i = eases.length - 1; i > -1; i--) {
            if (eases[i].name == name) {
                return eases[i]
            }
        }
        return false
    }
    this._addMathTween = function(tween) {
        _tweens.push(tween)
    }
    ;
    this._removeMathTween = function(tween) {
        _tweens.findAndRemove(tween)
    }
    ;
    this._detectTween = function(object, props, time, ease, delay, callback) {
        if (ease === "spring") {
            return new SpringTween(object,props,time,ease,delay,callback)
        }
        if (!_this.useCSSTrans(props, ease, object)) {
            return new FrameTween(object,props,time,ease,delay,callback)
        } else {
            if (Device.tween.webAnimation) {
                return new CSSWebAnimation(object,props,time,ease,delay,callback)
            } else {
                return new CSSTransition(object,props,time,ease,delay,callback)
            }
        }
    }
    ;
    this.tween = function(obj, props, time, ease, delay, complete, update, manual) {
        if (typeof delay !== "number") {
            update = complete;
            complete = delay;
            delay = 0
        }
        if (ease === "spring") {
            return new SpringTween(obj,props,time,ease,delay,update,complete)
        } else {
            return new MathTween(obj,props,time,ease,delay,update,complete,manual)
        }
    }
    ;
    this.iterate = function(array, props, time, ease, offset, delay, callback) {
        if (typeof delay !== "number") {
            callback = delay;
            delay = 0
        }
        props = new DynamicObject(props);
        if (!array.length) {
            throw "TweenManager.iterate :: array is empty"
        }
        var len = array.length;
        for (var i = 0; i < len; i++) {
            var obj = array[i];
            var complete = i == len - 1 ? callback : null;
            obj.tween(props.copy(), time, ease, delay + (offset * i), complete)
        }
    }
    ;
    this.clearTween = function(obj) {
        if (obj._mathTween && obj._mathTween.stop) {
            obj._mathTween.stop()
        }
        if (obj._mathTweens) {
            var tweens = obj._mathTweens;
            for (var i = 0; i < tweens.length; i++) {
                var tw = tweens[i];
                if (tw && tw.stop) {
                    tw.stop()
                }
            }
            obj._mathTweens = null
        }
    }
    ;
    this.clearCSSTween = function(obj) {
        if (obj && !obj._cssTween && obj.div._transition) {
            obj.div.style[Device.styles.vendorTransition] = "";
            obj.div._transition = false;
            obj._cssTween = null
        }
    }
    ;
    this.checkTransform = function(key) {
        var index = _this.Transforms.indexOf(key);
        return index > -1
    }
    ;
    this.addCustomEase = function(ease) {
        var add = true;
        if (typeof ease !== "object" || !ease.name || !ease.curve) {
            throw "TweenManager :: addCustomEase requires {name, curve}"
        }
        for (var i = _this.CSSEases.length - 1; i > -1; i--) {
            if (ease.name == _this.CSSEases[i].name) {
                add = false
            }
        }
        if (add) {
            if (ease.curve.charAt(0).toLowerCase() == "m") {
                ease.path = new EasingPath(ease.curve)
            } else {
                ease.values = stringToValues(ease.curve)
            }
            _this.CSSEases.push(ease)
        }
        return ease
    }
    ;
    this.getEase = function(name, values) {
        if (Array.isArray(name)) {
            var c1 = findEase(name[0]);
            var c2 = findEase(name[1]);
            if (!c1 || !c2) {
                throw "Multi-ease tween missing values " + JSON.stringify(name)
            }
            if (!c1.values) {
                c1.values = stringToValues(c1.curve)
            }
            if (!c2.values) {
                c2.values = stringToValues(c2.curve)
            }
            if (values) {
                return [c1.values[0], c1.values[1], c2.values[2], c2.values[3]]
            }
            return "cubic-bezier(" + c1.values[0] + "," + c1.values[1] + "," + c2.values[2] + "," + c2.values[3] + ")"
        } else {
            var ease = findEase(name);
            if (!ease) {
                return false
            }
            if (values) {
                return ease.path ? ease.path.solve : ease.values
            } else {
                return ease.curve
            }
        }
    }
    ;
    this.inspectEase = function(name) {
        return findEase(name)
    }
    ;
    this.getAllTransforms = function(object) {
        var obj = {};
        for (var i = _this.Transforms.length - 1; i > -1; i--) {
            var tf = _this.Transforms[i];
            var val = object[tf];
            if (val !== 0 && typeof val === "number") {
                obj[tf] = val
            }
        }
        return obj
    }
    ;
    this.parseTransform = function(props) {
        var transforms = "";
        var translate = "";
        if (props.perspective > 0) {
            transforms += "perspective(" + props.perspective + "px)"
        }
        if (typeof props.x !== "undefined" || typeof props.y !== "undefined" || typeof props.z !== "undefined") {
            var x = (props.x || 0);
            var y = (props.y || 0);
            var z = (props.z || 0);
            translate += x + "px, ";
            translate += y + "px";
            if (Device.tween.css3d) {
                translate += ", " + z + "px";
                transforms += "translate3d(" + translate + ")"
            } else {
                transforms += "translate(" + translate + ")"
            }
        }
        if (typeof props.scale !== "undefined") {
            transforms += "scale(" + props.scale + ")"
        } else {
            if (typeof props.scaleX !== "undefined") {
                transforms += "scaleX(" + props.scaleX + ")"
            }
            if (typeof props.scaleY !== "undefined") {
                transforms += "scaleY(" + props.scaleY + ")"
            }
        }
        if (typeof props.rotation !== "undefined") {
            transforms += "rotate(" + props.rotation + "deg)"
        }
        if (typeof props.rotationX !== "undefined") {
            transforms += "rotateX(" + props.rotationX + "deg)"
        }
        if (typeof props.rotationY !== "undefined") {
            transforms += "rotateY(" + props.rotationY + "deg)"
        }
        if (typeof props.rotationZ !== "undefined") {
            transforms += "rotateZ(" + props.rotationZ + "deg)"
        }
        if (typeof props.skewX !== "undefined") {
            transforms += "skewX(" + props.skewX + "deg)"
        }
        if (typeof props.skewY !== "undefined") {
            transforms += "skewY(" + props.skewY + "deg)"
        }
        return transforms
    }
    ;
    this.interpolate = function(num, alpha, ease) {
        var fn = _this.Interpolation.convertEase(ease);
        return num * (typeof fn == "function" ? fn(alpha) : _this.Interpolation.solve(fn, alpha))
    }
    ;
    this.interpolateValues = function(start, end, alpha, ease) {
        var fn = _this.Interpolation.convertEase(ease);
        return start + (end - start) * (typeof fn == "function" ? fn(alpha) : _this.Interpolation.solve(fn, alpha))
    }
}, "Static");
(function() {
    TweenManager.Transforms = ["scale", "scaleX", "scaleY", "x", "y", "z", "rotation", "rotationX", "rotationY", "rotationZ", "skewX", "skewY", "perspective", ];
    TweenManager.CSSEases = [{
        name: "easeOutCubic",
        curve: "cubic-bezier(0.215, 0.610, 0.355, 1.000)"
    }, {
        name: "easeOutQuad",
        curve: "cubic-bezier(0.250, 0.460, 0.450, 0.940)"
    }, {
        name: "easeOutQuart",
        curve: "cubic-bezier(0.165, 0.840, 0.440, 1.000)"
    }, {
        name: "easeOutQuint",
        curve: "cubic-bezier(0.230, 1.000, 0.320, 1.000)"
    }, {
        name: "easeOutSine",
        curve: "cubic-bezier(0.390, 0.575, 0.565, 1.000)"
    }, {
        name: "easeOutExpo",
        curve: "cubic-bezier(0.190, 1.000, 0.220, 1.000)"
    }, {
        name: "easeOutCirc",
        curve: "cubic-bezier(0.075, 0.820, 0.165, 1.000)"
    }, {
        name: "easeOutBack",
        curve: "cubic-bezier(0.175, 0.885, 0.320, 1.275)"
    }, {
        name: "easeInCubic",
        curve: "cubic-bezier(0.550, 0.055, 0.675, 0.190)"
    }, {
        name: "easeInQuad",
        curve: "cubic-bezier(0.550, 0.085, 0.680, 0.530)"
    }, {
        name: "easeInQuart",
        curve: "cubic-bezier(0.895, 0.030, 0.685, 0.220)"
    }, {
        name: "easeInQuint",
        curve: "cubic-bezier(0.755, 0.050, 0.855, 0.060)"
    }, {
        name: "easeInSine",
        curve: "cubic-bezier(0.470, 0.000, 0.745, 0.715)"
    }, {
        name: "easeInCirc",
        curve: "cubic-bezier(0.600, 0.040, 0.980, 0.335)"
    }, {
        name: "easeInBack",
        curve: "cubic-bezier(0.600, -0.280, 0.735, 0.045)"
    }, {
        name: "easeInOutCubic",
        curve: "cubic-bezier(0.645, 0.045, 0.355, 1.000)"
    }, {
        name: "easeInOutQuad",
        curve: "cubic-bezier(0.455, 0.030, 0.515, 0.955)"
    }, {
        name: "easeInOutQuart",
        curve: "cubic-bezier(0.770, 0.000, 0.175, 1.000)"
    }, {
        name: "easeInOutQuint",
        curve: "cubic-bezier(0.860, 0.000, 0.070, 1.000)"
    }, {
        name: "easeInOutSine",
        curve: "cubic-bezier(0.445, 0.050, 0.550, 0.950)"
    }, {
        name: "easeInOutExpo",
        curve: "cubic-bezier(1.000, 0.000, 0.000, 1.000)"
    }, {
        name: "easeInOutCirc",
        curve: "cubic-bezier(0.785, 0.135, 0.150, 0.860)"
    }, {
        name: "easeInOutBack",
        curve: "cubic-bezier(0.680, -0.550, 0.265, 1.550)"
    }, {
        name: "easeInOut",
        curve: "cubic-bezier(.42,0,.58,1)"
    }, {
        name: "linear",
        curve: "linear"
    }];
    TweenManager.useCSSTrans = function(props, ease, object) {
        if (props.math) {
            return false
        }
        if (typeof ease === "string" && (ease.strpos("Elastic") || ease.strpos("Bounce"))) {
            return false
        }
        if (object.multiTween || TweenManager.inspectEase(ease).path) {
            return false
        }
        if (!Device.tween.transition) {
            return false
        }
        return true
    }
}
)();
Class(function CSSTransition(_object, _props, _time, _ease, _delay, _callback) {
    var _this = this;
    var _transformProps, _transitionProps, _stack, _totalStacks;
    var _startTransform, _startProps;
    this.playing = true;
    (function() {
        if (typeof _time !== "number") {
            throw "CSSTween Requires object, props, time, ease"
        }
        initProperties();
        if (typeof _ease == "object" && !Array.isArray(_ease)) {
            initStack()
        } else {
            initCSSTween()
        }
    }
    )();
    function killed() {
        return !_this || _this.kill || !_object || !_object.div
    }
    function initProperties() {
        var transform = TweenManager.getAllTransforms(_object);
        var properties = [];
        for (var key in _props) {
            if (TweenManager.checkTransform(key)) {
                transform.use = true;
                transform[key] = _props[key];
                delete _props[key]
            } else {
                if (typeof _props[key] === "number" || key.strpos("-")) {
                    properties.push(key)
                }
            }
        }
        if (transform.use) {
            properties.push(Device.transformProperty)
        }
        delete transform.use;
        _transformProps = transform;
        _transitionProps = properties
    }
    function initStack() {
        initStart();
        var prevTime = 0;
        var interpolate = function(start, end, alpha, ease, prev, ke) {
            var last = prev[key];
            if (last) {
                start += last
            }
            return TweenManager.interpolateValues(start, end, alpha, ease)
        };
        _stack = [];
        _totalStacks = 0;
        for (var p in _ease) {
            var perc = p.strpos("%") ? Number(p.replace("%", "")) / 100 : ((Number(p) + 1) / _ease.length);
            if (isNaN(perc)) {
                continue
            }
            var ease = _ease[p];
            _totalStacks++;
            var transform = {};
            var props = {};
            var last = _stack[_stack.length - 1];
            var pr = last ? last.props : {};
            var zeroOut = !last;
            for (var key in _transformProps) {
                if (!_startTransform[key]) {
                    _startTransform[key] = key.strpos("scale") ? 1 : 0
                }
                transform[key] = interpolate(_startTransform[key], _transformProps[key], perc, ease, pr, key);
                if (zeroOut) {
                    pr[key] = _startTransform[key]
                }
            }
            for (key in _props) {
                props[key] = interpolate(_startProps[key], _props[key], perc, ease, pr, key);
                if (zeroOut) {
                    pr[key] = _startProps[key]
                }
            }
            var time = (perc * _time) - prevTime;
            prevTime += time;
            _stack.push({
                percent: perc,
                ease: ease,
                transform: transform,
                props: props,
                delay: _totalStacks == 1 ? _delay : 0,
                time: time
            })
        }
        initCSSTween(_stack.shift())
    }
    function initStart() {
        _startTransform = TweenManager.getAllTransforms(_object);
        var transform = TweenManager.parseTransform(_startTransform);
        if (!transform.length) {
            for (var i = TweenManager.Transforms.length - 1; i > -1; i--) {
                var key = TweenManager.Transforms[i];
                _startTransform[key] = key == "scale" ? 1 : 0
            }
        }
        _startProps = {};
        for (key in _props) {
            _startProps[key] = _object.css(key)
        }
    }
    function initCSSTween(values) {
        if (killed()) {
            return
        }
        if (_object._cssTween) {
            _object._cssTween.kill = true
        }
        _object._cssTween = _this;
        _object.div._transition = true;
        var strings = (function() {
            if (!values) {
                return buildStrings(_time, _ease, _delay)
            } else {
                return buildStrings(values.time, values.ease, values.delay)
            }
        }
        )();
        _object.willChange(strings.props);
        var time = values ? values.time : _time;
        var delay = values ? values.delay : _delay;
        var props = values ? values.props : _props;
        var transformProps = values ? values.transform : _transformProps;
        Render.setupTween(function() {
            if (killed()) {
                return
            }
            _object.div.style[Device.styles.vendorTransition] = strings.transition;
            _this.playing = true;
            if (Device.browser.safari) {
                Render.setupTween(function() {
                    if (killed()) {
                        return
                    }
                    _object.css(props);
                    _object.transform(transformProps)
                })
            } else {
                _object.css(props);
                _object.transform(transformProps)
            }
            Timer.create(function() {
                if (killed()) {
                    return
                }
                if (!_stack) {
                    clearCSSTween();
                    if (_callback) {
                        _callback()
                    }
                } else {
                    executeNextInStack()
                }
            }, time + delay)
        })
    }
    function executeNextInStack() {
        if (killed()) {
            return
        }
        var values = _stack.shift();
        if (!values) {
            clearCSSTween();
            if (_callback) {
                _callback
            }
        } else {
            var strings = buildStrings(values.time, values.ease, values.delay);
            _object.div.style[Device.styles.vendorTransition] = strings.transition;
            _object.css(values.props);
            _object.transform(values.transform);
            Timer.create(executeNextInStack, values.time)
        }
    }
    function buildStrings(time, ease, delay) {
        var props = "";
        var str = "";
        var len = _transitionProps.length;
        for (var i = 0; i < len; i++) {
            var transitionProp = _transitionProps[i];
            props += (props.length ? ", " : "") + transitionProp;
            str += (str.length ? ", " : "") + transitionProp + " " + time + "ms " + TweenManager.getEase(ease) + " " + delay + "ms"
        }
        return {
            props: props,
            transition: str
        }
    }
    function clearCSSTween() {
        if (killed()) {
            return
        }
        _this.playing = false;
        _object._cssTween = null;
        _object.willChange(null);
        _object = _props = null;
        _this = null;
        Utils.nullObject(this)
    }
    function tweenComplete() {
        if (!_callback && _this.playing) {
            clearCSSTween()
        }
    }
    this.stop = function() {
        if (!this.playing) {
            return
        }
        this.kill = true;
        this.playing = false;
        _object.div.style[Device.styles.vendorTransition] = "";
        _object.div._transition = false;
        _object.willChange(null);
        _object._cssTween = null;
        _this = null;
        Utils.nullObject(this)
    }
});
Class(function FrameTween(_object, _props, _time, _ease, _delay, _callback, _manual) {
    var _this = this;
    var _endValues, _transformEnd, _transformStart, _startValues;
    var _isTransform, _isCSS, _transformProps;
    var _cssTween, _transformTween;
    this.playing = true;
    (function() {
        if (typeof _ease === "object") {
            _ease = "easeOutCubic"
        }
        if (_object && _props) {
            if (typeof _time !== "number") {
                throw "FrameTween Requires object, props, time, ease"
            }
            initValues();
            startTween()
        }
    }
    )();
    function killed() {
        return _this.kill || !_object || !_object.div
    }
    function initValues() {
        if (_props.math) {
            delete _props.math
        }
        if (Device.tween.transition && _object.div._transition) {
            _object.div.style[Device.styles.vendorTransition] = "";
            _object.div._transition = false
        }
        _endValues = new DynamicObject();
        _transformEnd = new DynamicObject();
        _transformStart = new DynamicObject();
        _startValues = new DynamicObject();
        if (!_object.multiTween) {
            if (typeof _props.x === "undefined") {
                _props.x = _object.x
            }
            if (typeof _props.y === "undefined") {
                _props.y = _object.y
            }
            if (typeof _props.z === "undefined") {
                _props.z = _object.z
            }
        }
        for (var key in _props) {
            if (TweenManager.checkTransform(key)) {
                _isTransform = true;
                _transformStart[key] = _object[key] || (key == "scale" ? 1 : 0);
                _transformEnd[key] = _props[key]
            } else {
                _isCSS = true;
                var v = _props[key];
                if (typeof v === "string") {
                    _object.div.style[key] = v
                } else {
                    if (typeof v === "number") {
                        _startValues[key] = Number(_object.css(key));
                        _endValues[key] = v
                    }
                }
            }
        }
    }
    function startTween() {
        if (_object._cssTween && !_manual && !_object.multiTween) {
            _object._cssTween.kill = true
        }
        if (_object.multiTween) {
            if (!_object._cssTweens) {
                _object._cssTweens = []
            }
            _object._cssTweens.push(_this)
        }
        _object._cssTween = _this;
        _this.playing = true;
        _props = _startValues.copy();
        _transformProps = _transformStart.copy();
        if (_isCSS) {
            _cssTween = TweenManager.tween(_props, _endValues, _time, _ease, _delay, tweenComplete, update, _manual)
        }
        if (_isTransform) {
            _transformTween = TweenManager.tween(_transformProps, _transformEnd, _time, _ease, _delay, (!_isCSS ? tweenComplete : null), (!_isCSS ? update : null), _manual)
        }
    }
    function clear() {
        if (_object._cssTweens) {
            _object._cssTweens.findAndRemove(_this)
        }
        _this.playing = false;
        _object._cssTween = null;
        _object = _props = null
    }
    function update() {
        if (killed()) {
            return
        }
        if (_isCSS) {
            _object.css(_props)
        }
        if (_isTransform) {
            if (_object.multiTween) {
                for (var key in _transformProps) {
                    if (typeof _transformProps[key] === "number") {
                        _object[key] = _transformProps[key]
                    }
                }
                _object.transform()
            } else {
                _object.transform(_transformProps)
            }
        }
    }
    function tweenComplete() {
        if (_this.playing) {
            clear();
            if (_callback) {
                _callback()
            }
        }
    }
    this.stop = function() {
        if (!this.playing) {
            return
        }
        if (_cssTween && _cssTween.stop) {
            _cssTween.stop()
        }
        if (_transformTween && _transformTween.stop) {
            _transformTween.stop()
        }
        clear()
    }
    ;
    this.interpolate = function(elapsed) {
        if (_cssTween) {
            _cssTween.interpolate(elapsed)
        }
        if (_transformTween) {
            _transformTween.interpolate(elapsed)
        }
        update()
    }
    ;
    this.setEase = function(ease) {
        if (_cssTween) {
            _cssTween.setEase(ease)
        }
        if (_transformTween) {
            _transformTween.setEase(ease)
        }
    }
});
Class(function CSSWebAnimation(_object, _props, _time, _ease, _delay, _callback) {
    var _this = this;
    var _transform, _start, _end, _tween;
    var _properties, _killed, _transformValues, _startTransform;
    (function() {
        if (_object._cssTween) {
            _object._cssTween.stop()
        }
        initProperties();
        initTransform();
        initStart();
        initEnd();
        Render.setupTween(initAnimation)
    }
    )();
    function initProperties() {
        var properties = [];
        var transform = false;
        for (var key in _props) {
            if (TweenManager.checkTransform(key)) {
                transform = true
            } else {
                if (typeof _props[key] === "number" || key.strpos("-")) {
                    properties.push(key)
                }
            }
        }
        if (transform) {
            properties.push(Device.transformProperty)
        }
        _object.willChange(properties);
        if (_object._cssTween) {
            _object._cssTween.kill = true
        }
        _object._cssTween = _this;
        _object.div._transition = true
    }
    function initTransform() {
        var transform = TweenManager.getAllTransforms(_object);
        for (var key in _props) {
            if (TweenManager.checkTransform(key)) {
                transform[key] = _props[key];
                delete _props[key]
            }
        }
        _transformValues = transform;
        _transform = TweenManager.parseTransform(transform)
    }
    function initStart() {
        _startTransform = TweenManager.getAllTransforms(_object);
        var transform = TweenManager.parseTransform(_startTransform);
        if (!transform.length) {
            transform = "translate3d(0, 0, 0)";
            for (var i = TweenManager.Transforms.length - 1; i > -1; i--) {
                var key = TweenManager.Transforms[i];
                _startTransform[key] = key == "scale" ? 1 : 0
            }
        }
        _start = {};
        if (_transform) {
            _start.transform = transform
        }
        for (var key in _props) {
            _start[key] = _object.css(key)
        }
    }
    function initEnd() {
        _end = {};
        if (_transform) {
            _end.transform = _transform
        }
        for (var key in _props) {
            _end[key] = _props[key]
        }
    }
    function initAnimation() {
        _this.playing = true;
        _tween = _object.div.animate([_start, _end], {
            duration: _time,
            delay: _delay,
            easing: TweenManager.getEase(_ease),
            fill: "forwards"
        });
        _tween.addEventListener("finish", tweenComplete)
    }
    function killed() {
        return !_this || _this.kill || !_object || !_object.div
    }
    function clear() {
        _this.playing = false;
        _object = _props = null;
        _this = null;
        _tween = null;
        Utils.nullObject(this)
    }
    function applyValues() {
        _object.css(_props);
        _object.transform(_transformValues)
    }
    function interpolate(start, end, alpha) {
        return TweenManager.interpolate(start + (end - start), alpha, _ease)
    }
    function stopValues() {
        if (!_tween) {
            return
        }
        var elapsed = _tween.currentTime / _time;
        var transform = {};
        var css = {};
        for (var key in _transformValues) {
            transform[key] = interpolate(_startTransform[key], _transformValues[key], elapsed)
        }
        for (key in _props) {
            css[key] = TweenManager.interpolate(_start[key], _props[key], elapsed)
        }
        _object.css(css);
        _object.transform(transform)
    }
    function tweenComplete() {
        if (killed()) {
            return
        }
        applyValues();
        _object.willChange(null);
        if (_callback) {
            Render.nextFrame(_callback)
        }
        clear()
    }
    this.stop = function() {
        if (!_this || !_this.playing) {
            return
        }
        stopValues();
        _this.kill = true;
        _this.playing = false;
        _object.willChange(null);
        _tween.pause();
        clear()
    }
});
TweenManager.Class(function Interpolation() {
    function calculateBezier(aT, aA1, aA2) {
        return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT
    }
    function getTForX(aX, mX1, mX2) {
        var aGuessT = aX;
        for (var i = 0; i < 4; i++) {
            var currentSlope = getSlope(aGuessT, mX1, mX2);
            if (currentSlope == 0) {
                return aGuessT
            }
            var currentX = calculateBezier(aGuessT, mX1, mX2) - aX;
            aGuessT -= currentX / currentSlope
        }
        return aGuessT
    }
    function getSlope(aT, aA1, aA2) {
        return 3 * A(aA1, aA2) * aT * aT + 2 * B(aA1, aA2) * aT + C(aA1)
    }
    function A(aA1, aA2) {
        return 1 - 3 * aA2 + 3 * aA1
    }
    function B(aA1, aA2) {
        return 3 * aA2 - 6 * aA1
    }
    function C(aA1) {
        return 3 * aA1
    }
    this.convertEase = function(ease) {
        var fn = (function() {
            switch (ease) {
            case "easeInQuad":
                return TweenManager.Interpolation.Quad.In;
                break;
            case "easeInCubic":
                return TweenManager.Interpolation.Cubic.In;
                break;
            case "easeInQuart":
                return TweenManager.Interpolation.Quart.In;
                break;
            case "easeInQuint":
                return TweenManager.Interpolation.Quint.In;
                break;
            case "easeInSine":
                return TweenManager.Interpolation.Sine.In;
                break;
            case "easeInExpo":
                return TweenManager.Interpolation.Expo.In;
                break;
            case "easeInCirc":
                return TweenManager.Interpolation.Circ.In;
                break;
            case "easeInElastic":
                return TweenManager.Interpolation.Elastic.In;
                break;
            case "easeInBack":
                return TweenManager.Interpolation.Back.In;
                break;
            case "easeInBounce":
                return TweenManager.Interpolation.Bounce.In;
                break;
            case "easeOutQuad":
                return TweenManager.Interpolation.Quad.Out;
                break;
            case "easeOutCubic":
                return TweenManager.Interpolation.Cubic.Out;
                break;
            case "easeOutQuart":
                return TweenManager.Interpolation.Quart.Out;
                break;
            case "easeOutQuint":
                return TweenManager.Interpolation.Quint.Out;
                break;
            case "easeOutSine":
                return TweenManager.Interpolation.Sine.Out;
                break;
            case "easeOutExpo":
                return TweenManager.Interpolation.Expo.Out;
                break;
            case "easeOutCirc":
                return TweenManager.Interpolation.Circ.Out;
                break;
            case "easeOutElastic":
                return TweenManager.Interpolation.Elastic.Out;
                break;
            case "easeOutBack":
                return TweenManager.Interpolation.Back.Out;
                break;
            case "easeOutBounce":
                return TweenManager.Interpolation.Bounce.Out;
                break;
            case "easeInOutQuad":
                return TweenManager.Interpolation.Quad.InOut;
                break;
            case "easeInOutCubic":
                return TweenManager.Interpolation.Cubic.InOut;
                break;
            case "easeInOutQuart":
                return TweenManager.Interpolation.Quart.InOut;
                break;
            case "easeInOutQuint":
                return TweenManager.Interpolation.Quint.InOut;
                break;
            case "easeInOutSine":
                return TweenManager.Interpolation.Sine.InOut;
                break;
            case "easeInOutExpo":
                return TweenManager.Interpolation.Expo.InOut;
                break;
            case "easeInOutCirc":
                return TweenManager.Interpolation.Circ.InOut;
                break;
            case "easeInOutElastic":
                return TweenManager.Interpolation.Elastic.InOut;
                break;
            case "easeInOutBack":
                return TweenManager.Interpolation.Back.InOut;
                break;
            case "easeInOutBounce":
                return TweenManager.Interpolation.Bounce.InOut;
                break;
            case "linear":
                return TweenManager.Interpolation.Linear.None;
                break
            }
        }
        )();
        if (!fn) {
            var curve = TweenManager.getEase(ease, true);
            if (curve) {
                fn = curve
            } else {
                fn = TweenManager.Interpolation.Cubic.Out
            }
        }
        return fn
    }
    ;
    this.solve = function(values, elapsed) {
        if (values[0] == values[1] && values[2] == values[3]) {
            return elapsed
        }
        return calculateBezier(getTForX(elapsed, values[0], values[2]), values[1], values[3])
    }
    ;
    this.Linear = {
        None: function(k) {
            return k
        }
    };
    this.Quad = {
        In: function(k) {
            return k * k
        },
        Out: function(k) {
            return k * (2 - k)
        },
        InOut: function(k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k
            }
            return -0.5 * (--k * (k - 2) - 1)
        }
    };
    this.Cubic = {
        In: function(k) {
            return k * k * k
        },
        Out: function(k) {
            return --k * k * k + 1
        },
        InOut: function(k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k
            }
            return 0.5 * ((k -= 2) * k * k + 2)
        }
    };
    this.Quart = {
        In: function(k) {
            return k * k * k * k
        },
        Out: function(k) {
            return 1 - --k * k * k * k
        },
        InOut: function(k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k
            }
            return -0.5 * ((k -= 2) * k * k * k - 2)
        }
    };
    this.Quint = {
        In: function(k) {
            return k * k * k * k * k
        },
        Out: function(k) {
            return --k * k * k * k * k + 1
        },
        InOut: function(k) {
            if ((k *= 2) < 1) {
                return 0.5 * k * k * k * k * k
            }
            return 0.5 * ((k -= 2) * k * k * k * k + 2)
        }
    };
    this.Sine = {
        In: function(k) {
            return 1 - Math.cos(k * Math.PI / 2)
        },
        Out: function(k) {
            return Math.sin(k * Math.PI / 2)
        },
        InOut: function(k) {
            return 0.5 * (1 - Math.cos(Math.PI * k))
        }
    };
    this.Expo = {
        In: function(k) {
            return k === 0 ? 0 : Math.pow(1024, k - 1)
        },
        Out: function(k) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
        },
        InOut: function(k) {
            if (k === 0) {
                return 0
            }
            if (k === 1) {
                return 1
            }
            if ((k *= 2) < 1) {
                return 0.5 * Math.pow(1024, k - 1)
            }
            return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2)
        }
    };
    this.Circ = {
        In: function(k) {
            return 1 - Math.sqrt(1 - k * k)
        },
        Out: function(k) {
            return Math.sqrt(1 - --k * k)
        },
        InOut: function(k) {
            if ((k *= 2) < 1) {
                return -0.5 * (Math.sqrt(1 - k * k) - 1)
            }
            return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1)
        }
    };
    this.Elastic = {
        In: function(k) {
            var s, a = 0.1, p = 0.4;
            if (k === 0) {
                return 0
            }
            if (k === 1) {
                return 1
            }
            if (!a || a < 1) {
                a = 1;
                s = p / 4
            } else {
                s = p * Math.asin(1 / a) / (2 * Math.PI)
            }
            return -(a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p))
        },
        Out: function(k) {
            var s, a = 0.1, p = 0.4;
            if (k === 0) {
                return 0
            }
            if (k === 1) {
                return 1
            }
            if (!a || a < 1) {
                a = 1;
                s = p / 4
            } else {
                s = p * Math.asin(1 / a) / (2 * Math.PI)
            }
            return (a * Math.pow(2, -10 * k) * Math.sin((k - s) * (2 * Math.PI) / p) + 1)
        },
        InOut: function(k) {
            var s, a = 0.1, p = 0.4;
            if (k === 0) {
                return 0
            }
            if (k === 1) {
                return 1
            }
            if (!a || a < 1) {
                a = 1;
                s = p / 4
            } else {
                s = p * Math.asin(1 / a) / (2 * Math.PI)
            }
            if ((k *= 2) < 1) {
                return -0.5 * (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p))
            }
            return a * Math.pow(2, -10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p) * 0.5 + 1
        }
    };
    this.Back = {
        In: function(k) {
            var s = 1.70158;
            return k * k * ((s + 1) * k - s)
        },
        Out: function(k) {
            var s = 1.70158;
            return --k * k * ((s + 1) * k + s) + 1
        },
        InOut: function(k) {
            var s = 1.70158 * 1.525;
            if ((k *= 2) < 1) {
                return 0.5 * (k * k * ((s + 1) * k - s))
            }
            return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2)
        }
    };
    this.Bounce = {
        In: function(k) {
            return 1 - this.Bounce.Out(1 - k)
        },
        Out: function(k) {
            if (k < (1 / 2.75)) {
                return 7.5625 * k * k
            } else {
                if (k < (2 / 2.75)) {
                    return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75
                } else {
                    if (k < (2.5 / 2.75)) {
                        return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375
                    } else {
                        return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375
                    }
                }
            }
        },
        InOut: function(k) {
            if (k < 0.5) {
                return this.Bounce.In(k * 2) * 0.5
            }
            return this.Bounce.Out(k * 2 - 1) * 0.5 + 0.5
        }
    }
}, "Static");
Class(function EasingPath(_curve) {
    Inherit(this, Component);
    var _this = this;
    var _path, _boundsStartIndex, _pathLength, _pool;
    var _precompute = 1450;
    var _step = 1 / _precompute;
    var _rect = 100;
    var _approximateMax = 5;
    var _eps = 0.001;
    var _boundsPrevProgress = -1;
    var _prevBounds = {};
    var _newPoint = {};
    var _samples = [];
    var _using = [];
    (function() {
        initPool();
        initPath();
        preSample()
    }
    )();
    function initPool() {
        _pool = _this.initClass(ObjectPool, Object, 100)
    }
    function initPath() {
        _path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        _path.setAttributeNS(null, "d", normalizePath(_curve));
        _pathLength = _path.getTotalLength()
    }
    function preSample() {
        var i, j, length, point, progress, ref;
        for (i = j = 0,
        ref = _precompute; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            progress = i * _step;
            length = _pathLength * progress;
            point = _path.getPointAtLength(length);
            _samples.push({
                point: point,
                length: length,
                progress: progress
            })
        }
    }
    function normalizePath(path) {
        var svgRegex = /[M|L|H|V|C|S|Q|T|A]/gim;
        var points = path.split(svgRegex);
        points.shift();
        var commands = path.match(svgRegex);
        var startIndex = 0;
        points[startIndex] = normalizeSegment(points[startIndex], 0);
        var endIndex = points.length - 1;
        points[endIndex] = normalizeSegment(points[endIndex], _rect);
        return joinNormalizedPath(commands, points)
    }
    function normalizeSegment(segment, value) {
        value = value || 0;
        segment = segment.trim();
        var nRgx = /(-|\+)?((\d+(\.(\d|\e(-|\+)?)+)?)|(\.?(\d|\e|(\-|\+))+))/gim;
        var pairs = getSegmentPairs(segment.match(nRgx));
        var lastPoint = pairs[pairs.length - 1];
        var x = lastPoint[0];
        var parsedX = Number(x);
        if (parsedX !== value) {
            segment = "";
            lastPoint[0] = value;
            for (var i = 0; i < pairs.length; i++) {
                var point = pairs[i];
                var space = i === 0 ? "" : " ";
                segment += "" + space + point[0] + "," + point[1]
            }
        }
        return segment
    }
    function joinNormalizedPath(commands, points) {
        var normalizedPath = "";
        for (var i = 0; i < commands.length; i++) {
            var command = commands[i];
            var space = i === 0 ? "" : " ";
            normalizedPath += "" + space + command + (points[i].trim())
        }
        return normalizedPath
    }
    function getSegmentPairs(array) {
        if (array.length % 2 !== 0) {
            throw "EasingPath :: Failed to parse path -- segment pairs are not even."
        }
        var newArray = [];
        for (var i = 0; i < array.length; i += 2) {
            var value = array[i];
            var pair = [array[i], array[i + 1]];
            newArray.push(pair)
        }
        return newArray
    }
    function findBounds(array, p) {
        if (p == _boundsPrevProgress) {
            return _prevBounds
        }
        if (!_boundsStartIndex) {
            _boundsStartIndex = 0
        }
        var len = array.length;
        var loopEnd, direction, start;
        if (_boundsPrevProgress > p) {
            loopEnd = 0;
            direction = "reverse"
        } else {
            loopEnd = len;
            direction = "forward"
        }
        if (direction == "forward") {
            start = array[0];
            end = array[array.length - 1]
        } else {
            start = array[array.length - 1];
            end = array[0]
        }
        var i, j, ref, ref1, buffer;
        for (i = j = ref = _boundsStartIndex,
        ref1 = loopEnd; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
            var value = array[i];
            var pointX = value.point.x / _rect;
            var pointP = p;
            if (direction == "reverse") {
                buffer = pointX;
                pointX = pointP;
                pointP = buffer
            }
            if (pointX < pointP) {
                start = value;
                _boundsStartIndex = i
            } else {
                end = value;
                break
            }
        }
        _boundsPrevProgress = p;
        _prevBounds.start = start;
        _prevBounds.end = end;
        return _prevBounds
    }
    function checkIfBoundsCloseEnough(p, bounds) {
        var point;
        var y = checkIfPointCloseEnough(p, bounds.start.point);
        if (y) {
            return y
        }
        return checkIfPointCloseEnough(p, bounds.end.point)
    }
    function findApproximate(p, start, end, approximateMax) {
        approximateMax = approximateMax || _approximateMax;
        var approximation = approximate(start, end, p);
        var point = _path.getPointAtLength(approximation);
        var x = point.x / _rect;
        if (closeEnough(p, x)) {
            return resolveY(point)
        } else {
            if (approximateMax-- < 1) {
                return resolveY(point)
            }
            var newPoint = _pool.get();
            newPoint.point = point;
            newPoint.length = approximation;
            _using.push(newPoint);
            if (p < x) {
                return findApproximate(p, start, newPoint, approximateMax)
            } else {
                return findApproximate(p, newPoint, end, approximateMax)
            }
        }
    }
    function approximate(start, end, p) {
        var deltaP = end.point.x - start.point.x;
        var percentP = (p - (start.point.x / _rect)) / (deltaP / _rect);
        return start.length + percentP * (end.length - start.length)
    }
    function checkIfPointCloseEnough(p, point) {
        if (closeEnough(p, point.x / _rect)) {
            return resolveY(point)
        }
    }
    function closeEnough(n1, n2) {
        return Math.abs(n1 - n2) < _eps
    }
    function resolveY(point) {
        return 1 - (point.y / _rect)
    }
    function cleanUpObjects() {
        for (var i = _using.length - 1; i > -1; i--) {
            _pool.put(_using[i])
        }
        _using.length = 0
    }
    this.solve = function(p) {
        p = Utils.clamp(p, 0, 1);
        var bounds = findBounds(_samples, p);
        var res = checkIfBoundsCloseEnough(p, bounds);
        var output = res;
        if (!output) {
            output = findApproximate(p, bounds.start, bounds.end)
        }
        cleanUpObjects();
        return output
    }
});
Class(function MathTween(_object, _props, _time, _ease, _delay, _update, _callback, _manual) {
    var _this = this;
    var _startTime, _startValues, _endValues, _currentValues;
    var _easeFunction, _paused, _newEase, _stack, _current;
    var _elapsed = 0;
    (function() {
        if (_object && _props) {
            if (typeof _time !== "number") {
                throw "MathTween Requires object, props, time, ease"
            }
            start();
            if (typeof _ease == "object" && !Array.isArray(_ease)) {
                initStack()
            }
        }
    }
    )();
    function start() {
        if (!_object.multiTween && _object._mathTween && !_manual) {
            TweenManager.clearTween(_object)
        }
        if (!_manual) {
            TweenManager._addMathTween(_this)
        }
        _object._mathTween = _this;
        if (_object.multiTween) {
            if (!_object._mathTweens) {
                _object._mathTweens = []
            }
            _object._mathTweens.push(_this)
        }
        if (typeof _ease == "string") {
            _ease = TweenManager.Interpolation.convertEase(_ease);
            _easeFunction = typeof _ease === "function"
        } else {
            if (Array.isArray(_ease)) {
                _easeFunction = false;
                _ease = TweenManager.getEase(_ease, true)
            }
        }
        _startTime = Date.now();
        _startTime += _delay;
        _endValues = _props;
        _startValues = {};
        _this.startValues = _startValues;
        for (var prop in _endValues) {
            if (typeof _object[prop] === "number") {
                _startValues[prop] = _object[prop]
            }
        }
    }
    function initStack() {
        var prevTime = 0;
        var interpolate = function(start, end, alpha, ease, prev, key) {
            var last = prev[key];
            if (last) {
                start += last
            }
            return TweenManager.interpolateValues(start, end, alpha, ease)
        };
        _stack = [];
        for (var p in _ease) {
            var perc = p.strpos("%") ? Number(p.replace("%", "")) / 100 : ((Number(p) + 1) / _ease.length);
            if (isNaN(perc)) {
                continue
            }
            var ease = _ease[p];
            var last = _stack[_stack.length - 1];
            var props = {};
            var pr = last ? last.end : {};
            var zeroOut = !last;
            for (var key in _startValues) {
                props[key] = interpolate(_startValues[key], _endValues[key], perc, ease, pr, key);
                if (zeroOut) {
                    pr[key] = _startValues[key]
                }
            }
            var time = (perc * _time) - prevTime;
            prevTime += time;
            _stack.push({
                percent: perc,
                ease: ease,
                start: pr,
                end: props,
                time: time
            })
        }
        _currentValues = _stack.shift()
    }
    function clear() {
        if (!_object && !_props) {
            return false
        }
        _object._mathTween = null;
        TweenManager._removeMathTween(_this);
        Utils.nullObject(_this);
        if (_object._mathTweens) {
            _object._mathTweens.findAndRemove(_this)
        }
    }
    function updateSingle(time) {
        _elapsed = (time - _startTime) / _time;
        _elapsed = _elapsed > 1 ? 1 : _elapsed;
        var delta = _easeFunction ? _ease(_elapsed) : TweenManager.Interpolation.solve(_ease, _elapsed);
        for (var prop in _startValues) {
            if (typeof _startValues[prop] === "number") {
                var start = _startValues[prop];
                var end = _endValues[prop];
                _object[prop] = start + (end - start) * delta
            }
        }
        if (_update) {
            _update(delta)
        }
        if (_elapsed == 1) {
            if (_callback) {
                _callback()
            }
            clear()
        }
    }
    function updateStack(time) {
        var v = _currentValues;
        if (!v.elapsed) {
            v.elapsed = 0;
            v.timer = 0
        }
        v.timer += Render.DELTA;
        v.elapsed = v.timer / v.time;
        if (v.elapsed < 1) {
            for (var prop in v.start) {
                _object[prop] = TweenManager.interpolateValues(v.start[prop], v.end[prop], v.elapsed, v.ease)
            }
            if (_update) {
                _update(v.elapsed)
            }
        } else {
            _currentValues = _stack.shift();
            if (!_currentValues) {
                if (_callback) {
                    _callback()
                }
                clear()
            }
        }
    }
    this.update = function(time) {
        if (_paused || time < _startTime) {
            return
        }
        if (_stack) {
            updateStack(time)
        } else {
            updateSingle(time)
        }
    }
    ;
    this.pause = function() {
        _paused = true
    }
    ;
    this.resume = function() {
        _paused = false;
        _startTime = Date.now() - (_elapsed * _time)
    }
    ;
    this.stop = function() {
        _this.stopped = true;
        clear();
        return null
    }
    ;
    this.setEase = function(ease) {
        if (_newEase != ease) {
            _newEase = ease;
            _ease = TweenManager.Interpolation.convertEase(ease);
            _easeFunction = typeof _ease === "function"
        }
    }
    ;
    this.interpolate = function(elapsed) {
        var delta = _easeFunction ? _ease(elapsed) : TweenManager.Interpolation.solve(_ease, elapsed);
        for (var prop in _startValues) {
            if (typeof _startValues[prop] === "number" && typeof _endValues[prop] === "number") {
                var start = _startValues[prop];
                var end = _endValues[prop];
                _object[prop] = start + (end - start) * delta
            }
        }
    }
});
Class(function SpringTween(_object, _props, _friction, _ease, _delay, _update, _callback) {
    var _this = this;
    var _startTime, _velocityValues, _endValues, _startValues;
    var _damping, _friction, _count, _paused;
    (function() {
        if (_object && _props) {
            if (typeof _friction !== "number") {
                throw "SpringTween Requires object, props, time, ease"
            }
            start()
        }
    }
    )();
    function start() {
        TweenManager.clearTween(_object);
        _object._mathTween = _this;
        TweenManager._addMathTween(_this);
        _startTime = Date.now();
        _startTime += _delay;
        _endValues = {};
        _startValues = {};
        _velocityValues = {};
        if (_props.x || _props.y || _props.z) {
            if (typeof _props.x === "undefined") {
                _props.x = _object.x
            }
            if (typeof _props.y === "undefined") {
                _props.y = _object.y
            }
            if (typeof _props.z === "undefined") {
                _props.z = _object.z
            }
        }
        _count = 0;
        _damping = _props.damping || 0.5;
        delete _props.damping;
        for (var prop in _props) {
            if (typeof _props[prop] === "number") {
                _velocityValues[prop] = 0;
                _endValues[prop] = _props[prop]
            }
        }
        for (prop in _props) {
            if (typeof _object[prop] === "number") {
                _startValues[prop] = _object[prop] || 0;
                _props[prop] = _startValues[prop]
            }
        }
    }
    function clear(stop) {
        if (_object) {
            _object._mathTween = null;
            if (!stop) {
                for (var prop in _endValues) {
                    if (typeof _endValues[prop] === "number") {
                        _object[prop] = _endValues[prop]
                    }
                }
                if (_object.transform) {
                    _object.transform()
                }
            }
        }
        TweenManager._removeMathTween(_this)
    }
    this.update = function(time) {
        if (time < _startTime || _paused) {
            return
        }
        var vel;
        for (var prop in _startValues) {
            if (typeof _startValues[prop] === "number") {
                var start = _startValues[prop];
                var end = _endValues[prop];
                var val = _props[prop];
                var d = end - val;
                var a = d * _damping;
                _velocityValues[prop] += a;
                _velocityValues[prop] *= _friction;
                _props[prop] += _velocityValues[prop];
                _object[prop] = _props[prop];
                vel = _velocityValues[prop]
            }
        }
        if (Math.abs(vel) < 0.1) {
            _count++;
            if (_count > 30) {
                if (_callback) {
                    _callback.apply(_object)
                }
                clear()
            }
        }
        if (_update) {
            _update(time)
        }
        if (_object.transform) {
            _object.transform()
        }
    }
    ;
    this.pause = function() {
        _paused = true
    }
    ;
    this.stop = function() {
        clear(true);
        return null
    }
});
Class(function TweenTimeline() {
    Inherit(this, Component);
    var _this = this;
    var _tween;
    var _total = 0;
    var _tweens = [];
    this.elapsed = 0;
    (function() {}
    )();
    function calculate() {
        _tweens.sort(function(a, b) {
            var ta = a.time + a.delay;
            var tb = b.time + b.delay;
            return tb - ta
        });
        var first = _tweens[0];
        _total = first.time + first.delay
    }
    function loop() {
        var time = _this.elapsed * _total;
        for (var i = _tweens.length - 1; i > -1; i--) {
            var t = _tweens[i];
            var relativeTime = time - t.delay;
            var elapsed = Utils.clamp(relativeTime / t.time, 0, 1);
            t.interpolate(elapsed)
        }
    }
    this.add = function(object, props, time, ease, delay) {
        var tween;
        if (object instanceof HydraObject) {
            tween = new FrameTween(object,props,time,ease,delay,null,true)
        } else {
            tween = new MathTween(object,props,time,ease,delay,null,null,true)
        }
        _tweens.push(tween);
        tween.time = time;
        tween.delay = delay || 0;
        calculate();
        return tween
    }
    ;
    this.tween = function(to, time, ease, delay, callback) {
        this.stopTween();
        _tween = TweenManager.tween(_this, {
            elapsed: to
        }, time, ease, delay, callback, loop)
    }
    ;
    this.stopTween = function() {
        if (_tween && _tween.stop) {
            _tween.stop()
        }
    }
    ;
    this.startRender = function() {
        Render.startRender(loop)
    }
    ;
    this.stopRender = function() {
        Render.stopRender(loop)
    }
    ;
    this.update = function() {
        loop()
    }
    ;
    this.calculateRemainingTime = function() {
        return _total - (_this.elapsed * _total)
    }
    ;
    this.destroy = function() {
        Render.stopRender(loop);
        for (var i = 0; i < _tweens.length; i++) {
            _tweens[i].stop()
        }
        return this._destroy()
    }
});
Class(function Shaders() {
    var _this = this;
    (function() {}
    )();
    function parseCompiled(shaders) {
        var split = shaders.split("{@}");
        split.shift();
        for (var i = 0; i < split.length; i += 2) {
            var name = split[i];
            var text = split[i + 1];
            _this[name] = text
        }
    }
    function parseRequirements() {
        for (var key in _this) {
            var obj = _this[key];
            if (typeof obj === "string") {
                _this[key] = require(obj)
            }
        }
    }
    function require(shader) {
        if (!shader.strpos("require")) {
            return shader
        }
        shader = shader.replace(/# require/g, "#require");
        while (shader.strpos("#require")) {
            var split = shader.split("#require(");
            var name = split[1].split(")")[0];
            name = name.replace(/ /g, "");
            if (!_this[name]) {
                throw "Shader required " + name + ", but not found in compiled shaders.\n" + shader
            }
            shader = shader.replace("#require(" + name + ")", _this[name])
        }
        return shader
    }
    this.parse = function(code, file) {
        if (!code.strpos("{@}")) {
            file = file.split("/");
            file = file[file.length - 1];
            _this[file] = code
        } else {
            parseCompiled(code);
            parseRequirements()
        }
    }
    ;
    this.getShader = function(string) {
        if (_this.FALLBACKS) {
            if (_this.FALLBACKS[string]) {
                string = _this.FALLBACKS[string]
            }
        }
        return _this[string]
    }
}, "static");
Class(function Video(_params) {
    Inherit(this, Component);
    var _this = this;
    var _inter, _time, _lastTime, _buffering, _seekTo, _loop, _forceRender;
    var _tick = 0;
    var _event = {};
    this.loop = false;
    this.playing = false;
    this.width = _params.width || 0;
    this.height = _params.height || 0;
    (function() {
        createDiv();
        if (_params.preload !== false) {
            preload()
        }
    }
    )();
    function createDiv() {
        var src = _params.src;
        if (src && !src.strpos("webm") && !src.strpos("mp4") && !src.strpos("ogv")) {
            src += "." + Device.media.video
        }
        _this.div = document.createElement("video");
        if (src) {
            _this.div.src = src
        }
        _this.div.controls = _params.controls;
        _this.div.id = _params.id || "";
        _this.div.width = _params.width;
        _this.div.height = _params.height;
        _loop = _this.div.loop = _params.loop;
        if (Mobile.os == "iOS" && Mobile.version >= 9 && !_this.div.controls) {
            _this.div.autoplay = true;
            _this.div.load()
        }
        _this.object = $(_this.div);
        _this.width = _params.width;
        _this.height = _params.height;
        _this.object.size(_this.width, _this.height);
        if (Mobile.isNative() && Mobile.os == "iOS") {
            _this.object.attr("webkit-playsinline", true)
        }
    }
    function preload() {
        if (Device.mobile) {
            return
        }
        _this.div.preload = "none";
        _this.div.load();
        _this.div.addEventListener("canplaythrough", function() {
            if (_this.div && !_this.playing && !_this.div.preloadThroguh) {
                _this.div.play();
                _this.div.pause();
                _this.div.preloadThrough = true
            }
        })
    }
    function tick() {
        if (!_this.div || !_this.events) {
            return Render.stopRender(tick)
        }
        _this.duration = _this.div.duration;
        _this.time = _this.div.currentTime;
        if (_this.div.currentTime == _lastTime) {
            _tick++;
            if (_tick > 30 && !_buffering) {
                _buffering = true;
                _this.events.fire(HydraEvents.ERROR, null, true)
            }
        } else {
            _tick = 0;
            if (_buffering) {
                _this.events.fire(HydraEvents.READY, null, true);
                _buffering = false
            }
        }
        _lastTime = _this.div.currentTime;
        if (_this.div.currentTime >= (_this.duration || _this.div.duration) - 0.001) {
            if (!_loop) {
                if (!_forceRender) {
                    Render.stopRender(tick)
                }
                _this.events.fire(HydraEvents.COMPLETE, null, true)
            }
        }
        _event.time = _this.div.currentTime;
        _event.duration = _this.div.duration;
        _this.events.fire(HydraEvents.UPDATE, _event, true)
    }
    function checkReady() {
        if (!_this.div) {
            return false
        }
        if (!Device.mobile) {
            if (!_seekTo) {
                _this.buffered = _this.div.readyState == _this.div.HAVE_ENOUGH_DATA
            } else {
                var max = -1;
                var seekable = _this.div.seekable;
                if (seekable) {
                    for (var i = 0; i < seekable.length; i++) {
                        if (seekable.start(i) < _seekTo) {
                            max = seekable.end(i) - 0.5
                        }
                    }
                    if (max >= _seekTo) {
                        _this.buffered = true
                    }
                } else {
                    _this.buffered = true
                }
            }
        } else {
            _this.buffered = true
        }
        if (_this.buffered) {
            Render.stopRender(checkReady);
            _this.events.fire(HydraEvents.READY, null, true)
        }
    }
    this.set("loop", function(bool) {
        if (!_this.div) {
            return
        }
        _loop = bool;
        _this.div.loop = bool
    });
    this.get("loop", function() {
        return _loop
    });
    this.set("src", function(src) {
        if (src && !src.strpos("webm") && !src.strpos("mp4") && !src.strpos("ogv")) {
            src += "." + Device.media.video
        }
        _this.div.src = src
    });
    this.get("src", function() {
        return _this.div.src
    });
    this.play = function() {
        if (!_this.div) {
            return false
        }
        _this.playing = true;
        _this.div.play();
        Render.startRender(tick)
    }
    ;
    this.pause = function() {
        if (!_this.div) {
            return false
        }
        _this.playing = false;
        _this.div.pause();
        Render.stopRender(tick)
    }
    ;
    this.stop = function() {
        _this.playing = false;
        Render.stopRender(tick);
        if (!_this.div) {
            return false
        }
        _this.div.pause();
        if (_this.ready()) {
            _this.div.currentTime = 0
        }
    }
    ;
    this.volume = function(v) {
        if (!_this.div) {
            return false
        }
        _this.div.volume = v
    }
    ;
    this.seek = function(t) {
        if (!_this.div) {
            return false
        }
        if (_this.div.readyState <= 1) {
            Render.nextFrame(function() {
                _this.seek && _this.seek(t)
            });
            return
        }
        _this.div.currentTime = t
    }
    ;
    this.canPlayTo = function(t) {
        _seekTo = null;
        if (t) {
            _seekTo = t
        }
        if (!_this.div) {
            return false
        }
        if (!_this.buffered) {
            Render.startRender(checkReady)
        }
        return this.buffered
    }
    ;
    this.ready = function() {
        if (!_this.div) {
            return false
        }
        return _this.div.readyState >= 2
    }
    ;
    this.size = function(w, h) {
        if (!_this.div) {
            return false
        }
        this.div.width = this.width = w;
        this.div.height = this.height = h;
        this.object.css({
            width: w,
            height: h
        })
    }
    ;
    this.forceRender = function() {
        _forceRender = true;
        Render.startRender(tick)
    }
    ;
    this.destroy = function() {
        this.stop();
        this.object.remove();
        this.div.src = "";
        return this._destroy()
    }
});
Class(function Webcam(_width, _height, _audio) {
    Inherit(this, Component);
    var _this = this;
    (function() {
        createVideo();
        initUserMedia()
    }
    )();
    function createVideo() {
        _this.div = document.createElement("video");
        _this.div.width = _width;
        _this.div.height = _height;
        _this.div.autoplay = true;
        _this.element = $(_this.div)
    }
    function initUserMedia() {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        navigator.getUserMedia({
            video: true,
            audio: _audio
        }, success, error)
    }
    function success(stream) {
        _this.div.src = window.URL.createObjectURL(stream);
        _this.events.fire(HydraEvents.READY, null, true);
        _this.element.show()
    }
    function error() {
        _this.events.fire(HydraEvents.ERROR, null, true)
    }
    this.size = function(w, h) {
        _this.div.width = _width = w;
        _this.div.height = _height = h;
        if (_this.canvas) {
            _this.canvas.resize(w, h)
        }
    }
    ;
    this.getPixels = function() {
        if (!_this.canvas) {
            _this.canvas = _this.initClass(Canvas, _width, _height, null)
        }
        _this.canvas.context.drawImage(_this.div, 0, 0, _width, _height);
        return _this.canvas.context.getImageData(0, 0, _width, _height)
    }
    ;
    this.ready = function() {
        return _this.div.readyState > 0
    }
    ;
    this.destroy = function() {
        success = error = null;
        return this._destroy()
    }
});
Class(function SVG() {
    var _symbols = [];
    (function() {
        (function(g) {
            var b = ["SVGSVGElement", "SVGGElement"]
              , d = document.createElement("dummy");
            if (!b[0]in g) {
                return !1
            }
            if (Object.defineProperty) {
                var e = {
                    get: function() {
                        d.innerHTML = "";
                        Array.prototype.slice.call(this.childNodes).forEach(function(a) {
                            d.appendChild(a.cloneNode(!0))
                        });
                        return d.innerHTML
                    },
                    set: function(a) {
                        var b = this
                          , e = Array.prototype.slice.call(b.childNodes)
                          , f = function(a, c) {
                            if (1 !== c.nodeType) {
                                return !1
                            }
                            var b = document.createElementNS("http://www.w3.org/2000/svg", c.nodeName.toLowerCase());
                            Array.prototype.slice.call(c.attributes).forEach(function(a) {
                                b.setAttribute(a.name, a.value)
                            });
                            "TEXT" === c.nodeName && (b.textContent = c.innerHTML);
                            a.appendChild(b);
                            c.childNodes.length && Array.prototype.slice.call(c.childNodes).forEach(function(a) {
                                f(b, a)
                            })
                        }
                          , a = a.replace(/<(\w+)([^<]+?)\/>/, "<$1$2></$1>");
                        e.forEach(function(a) {
                            a.parentNode.removeChild(a)
                        });
                        d.innerHTML = a;
                        Array.prototype.slice.call(d.childNodes).forEach(function(a) {
                            f(b, a)
                        })
                    },
                    enumerable: !0,
                    configurable: !0
                };
                try {
                    b.forEach(function(a) {
                        Object.defineProperty(window[a].prototype, "innerHTML", e)
                    })
                } catch (h) {}
            } else {
                Object.prototype.__defineGetter__ && b.forEach(function(a) {
                    window[a].prototype.__defineSetter__("innerHTML", e.set);
                    window[a].prototype.__defineGetter__("innerHTML", e.get)
                })
            }
        }
        )(window)
    }());
    function checkID(id) {
        for (var i = 0; i < _symbols.length; i++) {
            if (_symbols[i].id == id) {
                return true
            }
        }
    }
    function getConfig(id) {
        for (var i = 0; i < _symbols.length; i++) {
            if (_symbols[i].id == id) {
                return _symbols[i]
            }
        }
    }
    this.defineSymbol = function(id, width, height, innerHTML) {
        if (checkID(id)) {
            throw "SVG symbol " + id + " is already defined"
        }
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("style", "display: none;");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);
        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        svg.innerHTML = '<symbol id="' + id + '">' + innerHTML + "</symbol>";
        document.body.insertBefore(svg, document.body.firstChild);
        _symbols.push({
            id: id,
            width: width,
            height: height
        })
    }
    ;
    this.getSymbolConfig = function(id) {
        var config = getConfig(id);
        if (typeof config == "undefined") {
            throw "SVG symbol " + id + " is not defined"
        }
        return config
    }
}, "Static");
Class(function AssetLoader(_assets, _complete) {
    Inherit(this, Component);
    var _this = this;
    var _total = 0;
    var _loaded = 0;
    var _added = 0;
    var _triggered = 0;
    var _lastTriggered = 0;
    var _queue, _qLoad;
    var _output, _loadedFiles;
    (function() {
        _queue = [];
        _loadedFiles = [];
        prepareAssets();
        defer(startLoading)
    }
    )();
    function prepareAssets() {
        for (var i = 0; i < _assets.length; i++) {
            if (typeof _assets[i] !== "undefined") {
                _total++;
                _queue.push(_assets[i])
            }
        }
    }
    function startLoading() {
        _qLoad = Math.round(_total * 0.5);
        for (var i = 0; i < _qLoad; i++) {
            loadAsset(_queue[i])
        }
    }
    function missingFiles() {
        if (!_queue) {
            return
        }
        var missing = [];
        for (var i = 0; i < _queue.length; i++) {
            var loaded = false;
            for (var j = 0; j < _loadedFiles.length; j++) {
                if (_loadedFiles[j] == _queue[i]) {
                    loaded = true
                }
            }
            if (!loaded) {
                missing.push(_queue[i])
            }
        }
        if (missing.length) {
            console.log("AssetLoader Files Failed To Load:");
            console.log(missing)
        }
    }
    function loadAsset(asset) {
        if (!asset) {
            return
        }
        var name = asset.split("/");
        name = name[name.length - 1];
        var split = name.split(".");
        var ext = split[split.length - 1].split("?")[0];
        switch (ext) {
        case "html":
            XHR.get(asset, function(contents) {
                Hydra.HTML[split[0]] = contents;
                assetLoaded(asset)
            }, "text");
            break;
        case "js":
        case "php":
        case undefined:
            XHR.get(asset, function(script) {
                script = script.replace("use strict", "");
                eval.call(window, script);
                assetLoaded(asset)
            }, "text");
            break;
        case "csv":
        case "json":
            XHR.get(asset, function(contents) {
                Hydra.JSON[split[0]] = contents;
                assetLoaded(asset)
            }, ext == "csv" ? "text" : null);
            break;
        case "fs":
        case "vs":
            XHR.get(asset, function(contents) {
                Shaders.parse(contents, asset);
                assetLoaded(asset)
            }, "text");
            break;
        default:
            var image = Images.createImg(asset);
            image.onload = function() {
                assetLoaded(asset)
            }
            ;
            break
        }
    }
    function checkQ() {
        if (_loaded == _qLoad && _loaded < _total) {
            var start = _qLoad;
            _qLoad *= 2;
            for (var i = start; i < _qLoad; i++) {
                if (_queue[i]) {
                    loadAsset(_queue[i])
                }
            }
        }
    }
    function assetLoaded(asset) {
        if (_queue) {
            _loaded++;
            _this.events.fire(HydraEvents.PROGRESS, {
                percent: _loaded / _total
            });
            _loadedFiles.push(asset);
            clearTimeout(_output);
            checkQ();
            if (_loaded == _total) {
                _this.complete = true;
                Render.nextFrame(function() {
                    if (_this.events) {
                        _this.events.fire(HydraEvents.COMPLETE, null, true)
                    }
                    if (_complete) {
                        _complete()
                    }
                })
            } else {
                _output = _this.delayedCall(missingFiles, 5000)
            }
        }
    }
    this.add = function(num) {
        _total += num;
        _added += num
    }
    ;
    this.trigger = function(num) {
        num = num || 1;
        for (var i = 0; i < num; i++) {
            assetLoaded("trigger")
        }
    }
    ;
    this.triggerPercent = function(percent, num) {
        num = num || _added;
        var trigger = Math.ceil(num * percent);
        if (trigger > _lastTriggered) {
            this.trigger(trigger - _lastTriggered)
        }
        _lastTriggered = trigger
    }
    ;
    this.destroy = function() {
        _assets = null;
        _loaded = null;
        _queue = null;
        _qLoad = null;
        return this._destroy()
    }
}, function() {
    AssetLoader.loadAllAssets = function(callback, cdn) {
        cdn = cdn || "";
        var list = [];
        for (var i = 0; i < ASSETS.length; i++) {
            list.push(cdn + ASSETS[i])
        }
        var assets = new AssetLoader(list,function() {
            if (callback) {
                callback()
            }
            assets = assets.destroy()
        }
        )
    }
    ;
    AssetLoader.loadAssets = function(list, callback) {
        var assets = new AssetLoader(list,function() {
            if (callback) {
                callback()
            }
            assets = assets.destroy()
        }
        )
    }
});
Class(function Images() {
    var _this = this;
    this.inMemory = false;
    this.store = {};
    function parseResolution(path) {
        if (!ASSETS.RES) {
            return path
        }
        var res = ASSETS.RES[path];
        if (res) {
            if (res["x" + Device.pixelRatio]) {
                var split = path.split("/");
                var file = split[split.length - 1];
                split = file.split(".");
                return path.replace(file, split[0] + "-" + Device.pixelRatio + "x." + split[1])
            } else {
                return path
            }
        } else {
            return path
        }
    }
    this.getPath = function(path) {
        if (path.strpos("http")) {
            return path
        }
        path = parseResolution(path);
        return (Hydra.CDN || "") + path
    }
    ;
    this.createImg = function(path, cors) {
        if (!path.strpos("http")) {
            path = parseResolution(path);
            path = (Hydra.CDN || "") + path
        }
        var img = new Image();
        if (cors) {
            img.crossOrigin = ""
        }
        img.src = path;
        if (this.store) {
            this.storeImg(img)
        }
        return img
    }
    ;
    this.storeImg = function(img) {
        if (this.inMemory) {
            this.store[img.src] = img
        }
    }
    ;
    this.releaseImg = function(path) {
        path = path.src ? path.src : path;
        delete this.store[path]
    }
}, "static");
Class(function PushState(_force) {
    var _this = this;
    if (typeof _force !== "boolean") {
        _force = Hydra.LOCAL
    }
    this.locked = false;
    this.dispatcher = new StateDispatcher(_force);
    this.getState = function() {
        return this.dispatcher.getState()
    }
    ;
    this.setState = function(hash) {
        this.dispatcher.setState(hash)
    }
    ;
    this.replaceState = function(hash) {
        this.dispatcher.replaceState(hash)
    }
    ;
    this.setTitle = function(title) {
        this.dispatcher.setTitle(title)
    }
    ;
    this.lock = function() {
        this.locked = true;
        this.dispatcher.lock()
    }
    ;
    this.unlock = function() {
        this.locked = false;
        this.dispatcher.unlock()
    }
    ;
    this.setPathRoot = function(root) {
        this.dispatcher.setPathRoot(root)
    }
});
Class(function StateDispatcher(_forceHash) {
    Inherit(this, Events);
    var _this = this;
    var _initHash, _storeHash;
    var _root = "/";
    this.locked = false;
    (function() {
        createListener();
        _initHash = getHash();
        _storeHash = _initHash
    }
    )();
    function createListener() {
        if (!Device.system.pushstate || _forceHash) {
            window.addEventListener("hashchange", function() {
                handleHashChange(getHash())
            }, false)
        } else {
            window.onpopstate = history.onpushstate = handleStateChange
        }
    }
    function getHash() {
        if (!Device.system.pushstate || _forceHash) {
            var value = window.location.hash;
            value = value.slice(3);
            return String(value)
        } else {
            var hash = location.pathname.toString();
            hash = _root != "/" ? hash.split(_root)[1] : hash.slice(1);
            hash = hash || "";
            return hash
        }
    }
    function handleStateChange() {
        var hash = location.pathname;
        if (!_this.locked && hash != _storeHash) {
            hash = _root != "/" ? hash.split(_root)[1] : hash.slice(1);
            hash = hash || "";
            _storeHash = hash;
            _this.events.fire(HydraEvents.UPDATE, {
                value: hash,
                split: hash.split("/")
            })
        } else {
            if (hash != _storeHash) {
                if (_storeHash) {
                    window.history.pushState(null, null, _root + hash)
                }
            }
        }
    }
    function handleHashChange(hash) {
        if (!_this.locked && hash != _storeHash) {
            _storeHash = hash;
            _this.events.fire(HydraEvents.UPDATE, {
                value: hash,
                split: hash.split("/")
            })
        } else {
            if (hash != _storeHash) {
                if (_storeHash) {
                    window.location.hash = "!/" + _storeHash
                }
            }
        }
    }
    this.getState = function() {
        if (Mobile.NativeCore && Mobile.NativeCore.active) {
            return Storage.get("app_state") || ""
        }
        return getHash()
    }
    ;
    this.setPathRoot = function(root) {
        if (root.charAt(0) == "/") {
            _root = root
        } else {
            _root = "/" + root
        }
    }
    ;
    this.setState = function(hash) {
        if (Mobile.NativeCore && Mobile.NativeCore.active) {
            Storage.set("app_state", hash)
        }
        if (!Device.system.pushstate || _forceHash) {
            if (hash != _storeHash) {
                window.location.hash = "!/" + hash;
                _storeHash = hash
            }
        } else {
            if (hash != _storeHash) {
                window.history.pushState(null, null, _root + hash);
                _storeHash = hash
            }
        }
    }
    ;
    this.replaceState = function(hash) {
        if (!Device.system.pushstate || _forceHash) {
            if (hash != _storeHash) {
                window.location.hash = "!/" + hash;
                _storeHash = hash
            }
        } else {
            if (hash != _storeHash) {
                window.history.replaceState(null, null, _root + hash);
                _storeHash = hash
            }
        }
    }
    ;
    this.setTitle = function(title) {
        document.title = title
    }
    ;
    this.lock = function() {
        this.locked = true
    }
    ;
    this.unlock = function() {
        this.locked = false
    }
    ;
    this.forceHash = function() {
        _forceHash = true
    }
});
Class(function GATracker() {
    this.trackPage = function(page) {
        if (typeof ga !== "undefined") {
            ga("send", "pageview", page)
        }
    }
    ;
    this.trackEvent = function(category, action, label, value) {
        if (typeof ga !== "undefined") {
            ga("send", "event", category, action, label, (value || 0))
        }
    }
}, "Static");
Class(function XHR() {
    var _this = this;
    var _serial;
    var _android = window.location.href.strpos("file://");
    this.headers = {};
    function serialize(key, data) {
        if (typeof data === "object") {
            for (var i in data) {
                var newKey = key + "[" + i + "]";
                if (typeof data[i] === "object") {
                    serialize(newKey, data[i])
                } else {
                    _serial.push(newKey + "=" + data[i])
                }
            }
        } else {
            _serial.push(key + "=" + data)
        }
    }
    this.get = function(url, data, callback, type) {
        if (typeof data === "function") {
            type = callback;
            callback = data;
            data = null
        } else {
            if (typeof data === "object") {
                var string = "?";
                for (var key in data) {
                    string += key + "=" + data[key] + "&"
                }
                string = string.slice(0, -1);
                url += string
            }
        }
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        for (var key in _this.headers) {
            xhr.setRequestHeader(key, _this.headers)
        }
        xhr.send();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && (_android || xhr.status == 200)) {
                if (typeof callback === "function") {
                    var data = xhr.responseText;
                    if (type == "text") {
                        callback(data)
                    } else {
                        try {
                            callback(JSON.parse(data))
                        } catch (e) {
                            console.error(e)
                        }
                    }
                }
                xhr = null
            }
        }
    }
    ;
    this.post = function(url, data, callback, type, header) {
        if (typeof data === "function") {
            header = type;
            type = callback;
            callback = data;
            data = null
        } else {
            if (typeof data === "object") {
                if (callback == "json" || type == "json" || header == "json") {
                    data = JSON.stringify(data)
                } else {
                    _serial = new Array();
                    for (var key in data) {
                        serialize(key, data[key])
                    }
                    data = _serial.join("&");
                    data = data.replace(/\[/g, "%5B");
                    data = data.replace(/\]/g, "%5D");
                    _serial = null
                }
            }
        }
        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        switch (header) {
        case "upload":
            header = "application/upload";
            break;
        default:
            header = "application/x-www-form-urlencoded";
            break
        }
        xhr.setRequestHeader("Content-type", header);
        for (var key in _this.headers) {
            xhr.setRequestHeader(key, _this.headers)
        }
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && (_android || xhr.status == 200)) {
                if (typeof callback === "function") {
                    var data = xhr.responseText;
                    if (type == "text") {
                        callback(data)
                    } else {
                        try {
                            callback(JSON.parse(data))
                        } catch (e) {
                            console.error(e)
                        }
                    }
                }
                xhr = null
            }
        }
        ;
        xhr.send(data)
    }
}, "Static");
Class(function Storage() {
    var _this = this;
    var _storage;
    (function() {
        testStorage()
    }
    )();
    function testStorage() {
        try {
            if (window.localStorage) {
                try {
                    window.localStorage.test = 1;
                    window.localStorage.removeItem("test");
                    _storage = true
                } catch (e) {
                    _storage = false
                }
            } else {
                _storage = false
            }
        } catch (e) {
            _storage = false
        }
    }
    function cookie(key, value, expires) {
        var options;
        if (arguments.length > 1 && (value === null || typeof value !== "object")) {
            options = {};
            options.path = "/";
            options.expires = expires || 1;
            if (value === null) {
                options.expires = -1
            }
            if (typeof options.expires === "number") {
                var days = options.expires
                  , t = options.expires = new Date();
                t.setDate(t.getDate() + days)
            }
            return (document.cookie = [encodeURIComponent(key), "=", options.raw ? String(value) : encodeURIComponent(String(value)), options.expires ? "; expires=" + options.expires.toUTCString() : "", options.path ? "; path=" + options.path : "", options.domain ? "; domain=" + options.domain : "", options.secure ? "; secure" : ""].join(""))
        }
        options = value || {};
        var result, decode = options.raw ? function(s) {
            return s
        }
        : decodeURIComponent;
        return (result = new RegExp("(?:^|; )" + encodeURIComponent(key) + "=([^;]*)").exec(document.cookie)) ? decode(result[1]) : null
    }
    this.setCookie = function(key, value, expires) {
        cookie(key, value, expires)
    }
    ;
    this.getCookie = function(key) {
        return cookie(key)
    }
    ;
    this.set = function(key, value) {
        if (typeof value === "object") {
            value = JSON.stringify(value)
        }
        if (_storage) {
            if (typeof value === "null") {
                window.localStorage.removeItem(key)
            } else {
                window.localStorage[key] = value
            }
        } else {
            cookie(key, value, 365)
        }
    }
    ;
    this.get = function(key) {
        var val;
        if (_storage) {
            val = window.localStorage[key]
        } else {
            val = cookie(key)
        }
        if (val) {
            var char0;
            if (val.charAt) {
                char0 = val.charAt(0)
            }
            if (char0 == "{" || char0 == "[") {
                val = JSON.parse(val)
            }
        }
        return val
    }
}, "Static");
Class(function Thread(_class) {
    Inherit(this, Component);
    var _this = this;
    var _worker, _callbacks, _path, _mvc;
    (function() {
        init();
        importClasses();
        addListeners()
    }
    )();
    function init() {
        _path = Thread.PATH;
        _callbacks = {};
        _worker = new Worker(_path + "assets/js/hydra/hydra-thread.js")
    }
    function importClasses() {
        importClass(Utils);
        importClass(MVC);
        importClass(Component);
        importClass(Events);
        importClass(_class, true)
    }
    function importClass(_class, scoped) {
        if (!_class) {
            return
        }
        var code, namespace;
        if (!scoped) {
            if (typeof _class !== "function") {
                namespace = _class.constructor._namespace ? _class.constructor._namespace + "." : "";
                code = namespace + "Class(" + _class.constructor.toString() + ', "static");'
            } else {
                namespace = _class._namespace ? _class._namespace + "." : "";
                code = namespace + "Class(" + _class.toString() + ");"
            }
        } else {
            code = _class.toString().replace("{", "!!!");
            code = code.split("!!!")[1];
            var splitChar = window._MINIFIED_ ? "=" : " ";
            while (code.strpos("this")) {
                var split = code.slice(code.indexOf("this."));
                var name = split.split("this.")[1].split(splitChar)[0];
                code = code.replace("this", "self");
                createMethod(name)
            }
            code = code.slice(0, -1)
        }
        _worker.postMessage({
            code: code
        })
    }
    function createMethod(name) {
        _this[name] = function(message, callback) {
            _this.send(name, message, callback)
        }
    }
    function addListeners() {
        _worker.addEventListener("message", workerMessage)
    }
    function workerMessage(e) {
        if (e.data.console) {
            console.log(e.data.message)
        } else {
            if (e.data.id) {
                var callback = _callbacks[e.data.id];
                if (callback) {
                    callback(e.data.message)
                }
                delete _callbacks[e.data.id]
            } else {
                if (e.data.emit) {
                    var callback = _callbacks[e.data.evt];
                    if (callback) {
                        callback(e.data.msg)
                    }
                } else {
                    var callback = _callbacks.transfer;
                    if (callback) {
                        callback(e.data)
                    }
                }
            }
        }
    }
    this.on = function(evt, callback) {
        _callbacks[evt] = callback
    }
    ;
    this.off = function(evt) {
        delete _callbacks[evt]
    }
    ;
    this.loadFunctions = function() {
        for (var i = 0; i < arguments.length; i++) {
            this.loadFunction(arguments[i])
        }
    }
    ;
    this.loadFunction = function(code) {
        code = code.toString();
        code = code.replace("(", "!!!");
        var split = code.split("!!!");
        var name = split[0].split(" ")[1];
        code = "self." + name + " = function(" + split[1];
        _worker.postMessage({
            code: code
        });
        createMethod(name)
    }
    ;
    this.importScript = function(path) {
        _worker.postMessage({
            path: path,
            importScript: true
        })
    }
    ;
    this.importClass = function() {
        for (var i = 0; i < arguments.length; i++) {
            var code = arguments[i];
            importClass(code)
        }
    }
    ;
    this.send = function(name, message, callback) {
        if (typeof name === "string") {
            var fn = name;
            message = message || {};
            message.fn = name
        } else {
            callback = message;
            message = name
        }
        var id = Utils.timestamp();
        if (callback) {
            _callbacks[id] = callback
        }
        if (message.transfer) {
            message.msg.id = id;
            message.msg.fn = message.fn;
            message.msg.transfer = true;
            _worker.postMessage(message.msg, message.buffer)
        } else {
            _worker.postMessage({
                message: message,
                id: id
            })
        }
    }
    ;
    this.destroy = function() {
        if (_worker.terminate) {
            _worker.terminate()
        }
        return this._destroy()
    }
}, function() {
    Thread.PATH = ""
});
Class(function Dev() {
    var _this = this;
    var _post, _alert;
    (function() {
        if (Hydra.LOCAL) {
            Hydra.development(true)
        }
    }
    )();
    function catchErrors() {
        window.onerror = function(message, file, line) {
            var string = message + " ::: " + file + " : " + line;
            if (_alert) {
                alert(string)
            }
            if (_post) {
                XHR.post(_post + "/api/data/debug", getDebugInfo(string), "json")
            }
        }
    }
    function getDebugInfo(string) {
        var obj = {};
        obj.err = string;
        obj.ua = Device.agent;
        obj.browser = {
            width: Stage.width,
            height: Stage.height
        };
        return obj
    }
    this.alertErrors = function(url) {
        _alert = true;
        if (typeof url === "string") {
            url = [url]
        }
        for (var i = 0; i < url.length; i++) {
            if (location.href.strpos(url[i]) || location.hash.strpos(url[i])) {
                return catchErrors()
            }
        }
    }
    ;
    this.postErrors = function(url, post) {
        _post = post;
        if (typeof url === "string") {
            url = [url]
        }
        for (var i = 0; i < url.length; i++) {
            if (location.href.strpos(url[i])) {
                return catchErrors()
            }
        }
    }
    ;
    this.expose = function(name, val, force) {
        if (Hydra.LOCAL || force) {
            window[name] = val
        }
    }
}, "Static");
window.ASSETS = ["assets/images/face/eyes_left.png", "assets/images/face/eyes_right.png", "assets/images/face/mouth_1.png", "assets/images/face/mouth_2.png", "assets/images/loader/tutorial.gif", "assets/images/ui/pause.png", "assets/images/ui/play.png", "assets/images/ui/replay.png", "assets/js/lib/GestureLibrary.js", "assets/js/lib/simplify.js", "assets/js/lib/three.js", "assets/shaders/compiled.vs"];
Class(function Config() {
    var _this = this;
    this.SCHEME = 0;
    this.COLORS = {
        0: {
            line: 4961441,
            triangle: 9880638,
            circle: 4823220
        },
        1: {
            line: 16094279,
            triangle: 16013633,
            circle: 16104774
        },
        2: {
            line: 10766255,
            triangle: 8415171,
            circle: 15351171
        }
    };
    this.DATA_API = (function() {
        return "assets/data/data.json"
    }
    )();
    this.ALLOWED_LINES = (function() {
        if (Mobile.phone) {
            return 10
        }
        if (Mobile.tablet) {
            return 15
        }
        return 22
    }
    )();
    this.USE_GOO = Device.browser.chrome;
    this.USE_WOBBLE = !Device.browser.ie
}, "Static");
var GESTURES = {
    circleCounter: [458, 120, 455, 119, 450, 117, 444, 116, 440, 116, 430, 116, 411, 119, 399, 124, 387, 129, 375, 137, 362, 148, 357, 154, 351, 161, 348, 166, 341, 181, 338, 192, 336, 203, 335, 215, 335, 225, 336, 238, 337, 245, 338, 252, 343, 268, 347, 277, 352, 288, 358, 296, 364, 303, 370, 309, 374, 312, 386, 321, 402, 330, 412, 334, 424, 337, 437, 340, 451, 340, 463, 338, 471, 336, 492, 331, 511, 326, 520, 322, 532, 314, 542, 306, 550, 299, 554, 295, 560, 286, 565, 273, 569, 260, 571, 248, 571, 236, 571, 226, 568, 213, 566, 206, 561, 194, 550, 172, 544, 162, 537, 155, 525, 143, 515, 135, 503, 128, 496, 125, 485, 121, 463, 116, 449, 115, 436, 114, 423, 115],
    circleClock: [502, 139, 504, 138, 508, 138, 510, 138, 514, 138, 519, 138, 524, 138, 530, 139, 536, 141, 541, 142, 546, 145, 552, 149, 554, 150, 558, 154, 563, 158, 567, 163, 571, 168, 573, 173, 576, 179, 578, 185, 579, 189, 581, 194, 582, 202, 582, 209, 582, 216, 582, 223, 582, 231, 581, 237, 579, 243, 578, 246, 576, 251, 573, 259, 570, 265, 567, 271, 564, 276, 561, 280, 557, 284, 556, 286, 550, 291, 544, 296, 537, 300, 530, 303, 523, 306, 516, 308, 503, 310, 499, 310, 481, 311, 466, 312, 454, 312, 444, 311, 434, 309, 422, 305, 412, 300, 409, 298, 398, 289, 387, 278, 381, 269, 376, 259, 373, 252, 371, 241, 370, 229, 370, 224, 371, 216, 375, 197, 381, 186, 388, 176, 397, 167, 411, 155, 421, 147, 429, 142, 438, 138, 458, 131, 477, 127, 489, 126, 504, 127, 514, 129, 522, 131, 522, 131],
    triangleCounter: [442, 94, 434, 105, 428, 113, 416, 130, 398, 149, 387, 162, 374, 177, 357, 196, 347, 208, 338, 219, 333, 223, 324, 235, 317, 242, 313, 247, 309, 251, 306, 254, 304, 257, 304, 258, 303, 259, 302, 260, 302, 261, 302, 263, 303, 263, 306, 264, 312, 265, 324, 266, 360, 265, 395, 263, 428, 261, 462, 259, 495, 258, 524, 256, 538, 255, 550, 256, 566, 256, 574, 257, 582, 258, 587, 258, 591, 258, 594, 258, 595, 258, 597, 258, 599, 258, 601, 258, 602, 257, 602, 255, 601, 251, 598, 246, 594, 236, 580, 212, 565, 193, 550, 173, 541, 161, 523, 145, 503, 127, 487, 116, 472, 105, 451, 89, 441, 78, 436, 73],
    triangleClock: [486, 119, 490, 125, 511, 148, 530, 173, 547, 194, 561, 211, 571, 221, 581, 231, 586, 238, 594, 245, 599, 250, 602, 253, 604, 256, 606, 258, 607, 260, 606, 263, 605, 263, 584, 267, 546, 269, 517, 269, 485, 269, 456, 269, 429, 270, 407, 271, 393, 271, 371, 272, 361, 274, 356, 274, 353, 274, 351, 274, 350, 274, 350, 273, 352, 267, 370, 242, 400, 207, 424, 177, 445, 151, 465, 123, 480, 102, 484, 97, 487, 95],
    squareCounter: [341, 105, 341, 113, 341, 133, 340, 149, 338, 171, 333, 198, 330, 215, 327, 229, 325, 240, 324, 247, 324, 252, 324, 253, 324, 256, 324, 258, 324, 261, 325, 263, 327, 265, 332, 267, 344, 269, 369, 273, 413, 277, 444, 279, 473, 281, 499, 284, 516, 286, 529, 287, 535, 288, 540, 289, 543, 289, 544, 289, 547, 289, 548, 287, 549, 285, 550, 283, 551, 281, 552, 274, 554, 260, 555, 247, 556, 234, 557, 213, 557, 199, 557, 185, 557, 174, 555, 155, 553, 136, 553, 126, 552, 119, 552, 112, 552, 107, 552, 105, 551, 104, 549, 102, 545, 99, 534, 94, 514, 91, 487, 88, 466, 89, 443, 90, 433, 90, 408, 90, 392, 92, 381, 93, 361, 95],
    squareClock: [345, 110, 348, 111, 364, 111, 385, 110, 401, 109, 433, 108, 459, 107, 485, 106, 507, 105, 520, 105, 526, 105, 532, 106, 533, 106, 536, 107, 538, 108, 540, 110, 541, 113, 542, 118, 544, 132, 546, 162, 546, 176, 544, 211, 542, 237, 541, 253, 541, 260, 541, 265, 542, 268, 542, 270, 542, 271, 542, 273, 541, 274, 536, 274, 512, 269, 484, 263, 460, 258, 446, 256, 419, 252, 394, 251, 371, 251, 357, 251, 343, 251, 335, 251, 331, 251, 329, 251, 327, 251, 325, 251, 324, 250, 323, 248, 322, 241, 321, 221, 319, 204, 317, 183, 317, 165, 318, 156, 318, 149, 318, 143, 318, 142],
};
Class(function KandinskyEvents() {
    var _this = this;
    this.UNDO = "undo";
    this.PLAY_PAUSE = "play_pause";
    this.CHANGE_SOUND = "change_sound";
    this.EMPTY_GROUP = "empty_group";
    this.EXPORT_VIDEO = "export_video";
    this.SOUNDS_LOADED = "sounds_loaded"
}, "Static");
Class(function AssetUtil() {
    var _this = this;
    var _assets = {};
    var _exclude = ["!!!"];
    this.PATH = "";
    function canInclude(asset) {
        for (var i = 0; i < _exclude.length; i++) {
            var excl = _exclude[i];
            if (asset.strpos(excl)) {
                return false
            }
        }
        return true
    }
    this.loadAssets = function(list) {
        var assets = this.get(list);
        var output = [];
        for (var i = assets.length - 1; i > -1; i--) {
            var asset = assets[i];
            if (!_assets[asset]) {
                output.push(_this.PATH + asset);
                _assets[asset] = 1
            }
        }
        return output
    }
    ;
    this.get = function(list) {
        if (!Array.isArray(list)) {
            list = [list]
        }
        var assets = [];
        for (var i = ASSETS.length - 1; i > -1; i--) {
            var asset = ASSETS[i];
            for (var j = list.length - 1; j > -1; j--) {
                var match = list[j];
                if (asset.strpos(match)) {
                    if (canInclude(asset)) {
                        assets.push(asset)
                    }
                }
            }
        }
        return assets
    }
    ;
    this.exclude = function(list) {
        if (!Array.isArray(list)) {
            list = [list]
        }
        for (var i = 0; i < list.length; i++) {
            _exclude.push(list[i])
        }
    }
    ;
    this.loadAllAssets = function(list) {
        var assets = _this.loadAssets(list || "/");
        var loader = new AssetLoader(assets)
    }
}, "Static");
Class(function LineOptim() {
    Inherit(this, Component);
    var _this = this;
    var simplify;
    var _simplifyAmount = 1;
    var _smoothDistance = 6;
    this.simplify = function(oldVerts) {
        if (!simplify) {
            simplify = require("simplify")
        }
        return simplify(oldVerts, oldVerts.length > 5 ? _simplifyAmount : _simplifyAmount * 0.2, true)
    }
    ;
    this.smooth = function(oldVerts) {
        var newVerts = [];
        oldVerts.every(function(v, i) {
            newVerts.push(v);
            if (i == oldVerts.length - 1) {
                return true
            }
            var point0 = oldVerts[i === 0 ? i : i - 1];
            var point1 = v;
            var point2 = oldVerts[i > oldVerts.length - 2 ? oldVerts.length - 1 : i + 1];
            var point3 = oldVerts[i > oldVerts.length - 3 ? oldVerts.length - 1 : i + 2];
            var distance = point1.distanceTo(point2);
            var segments = Math.floor(distance / _smoothDistance);
            for (var i = 1; i < segments; i++) {
                var weight = i / segments;
                newVerts.push(new THREE.Vector3(THREE.CurveUtils.interpolate(point0.x, point1.x, point2.x, point3.x, weight),THREE.CurveUtils.interpolate(point0.y, point1.y, point2.y, point3.y, weight),0));
                newVerts[newVerts.length - 1].velocity = point1.velocity * (1 - weight) + point2.velocity * weight
            }
            return true
        });
        return newVerts
    }
}, "static");
Class(function Gesture() {
    var _this = this;
    var _r = new DollarRecognizer();
    (function() {
        initGestures()
    }
    )();
    function initGestures() {
        for (var key in GESTURES) {
            var g = GESTURES[key];
            var points = [];
            for (var i = 0; i < g.length; i += 2) {
                points.push(new Point(g[i],g[i + 1]))
            }
            _r.AddGesture(key, points)
        }
    }
    function parseName(name) {
        if (name.strpos("square")) {
            return "square"
        }
        if (name.strpos("triangle")) {
            return "triangle"
        }
        if (name.strpos("line")) {
            return "line"
        }
        if (name.strpos("circle")) {
            return "circle"
        }
    }
    this.calculate = function(vertices) {
        try {
            var points = [];
            var output = "[";
            vertices.forEach(function(v) {
                points.push(new Point(v.x,v.y));
                output += v.x + ", " + v.y + ", "
            });
            output = output.slice(0, -2) + "]";
            var result = _r.Recognize(points);
            if (result.Name.strpos("square")) {
                return null
            }
            return result && result.Score > 0.75 ? parseName(result.Name) : null
        } catch (e) {}
    }
}, "Singleton");
Class(function BasicPass() {
    Inherit(this, NukePass);
    var _this = this;
    this.fragmentShader = ["varying vec2 vUv;", "uniform sampler2D tDiffuse;", "void main() {", "gl_FragColor = texture2D(tDiffuse, vUv);", "}"];
    this.init(this.fragmentShader)
});
Class(function Nuke(_stage, _params) {
    Inherit(this, Component);
    var _this = this;
    if (!_params.renderer) {
        console.error("Nuke :: Must define renderer")
    }
    _this.stage = _stage;
    _this.renderer = _params.renderer;
    _this.camera = _params.camera;
    _this.scene = _params.scene;
    _this.rtt = _params.rtt;
    _this.enabled = _params.enabled || true;
    _this.passes = _params.passes || [];
    var _dpr = _params.dpr || 1;
    var _rttPing, _rttPong, _nukeScene, _nukeMesh, _rttCamera;
    var _parameters = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false
    };
    (function() {
        initNuke();
        addListeners()
    }
    )();
    function initNuke() {
        var width = _this.stage.width * _dpr;
        var height = _this.stage.height * _dpr;
        _rttPing = new THREE.WebGLRenderTarget(width,height,_parameters);
        _rttPong = new THREE.WebGLRenderTarget(width,height,_parameters);
        _rttCamera = new THREE.OrthographicCamera(_this.stage.width / -2,_this.stage.width / 2,_this.stage.height / 2,_this.stage.height / -2,1,1000);
        _nukeScene = new THREE.Scene();
        var geoPass = new THREE.PlaneBufferGeometry(2,2,1,1);
        _nukeMesh = new THREE.Mesh(geoPass,new THREE.MeshBasicMaterial());
        _nukeScene.add(_nukeMesh)
    }
    function finalRender(scene, camera) {
        if (_this.rtt) {
            _this.renderer.render(scene, camera || _this.camera, _this.rtt)
        } else {
            _this.renderer.render(scene, camera || _this.camera)
        }
    }
    function addListeners() {
        _this.events.subscribe(HydraEvents.RESIZE, resizeHandler)
    }
    function resizeHandler() {
        var width = _this.stage.width * _dpr;
        var height = _this.stage.height * _dpr;
        if (_rttPing) {
            _rttPing.dispose()
        }
        if (_rttPong) {
            _rttPong.dispose()
        }
        _rttPing = new THREE.WebGLRenderTarget(width,height,_parameters);
        _rttPong = new THREE.WebGLRenderTarget(width,height,_parameters);
        _rttCamera.left = _this.stage.width / -2;
        _rttCamera.right = _this.stage.width / 2;
        _rttCamera.top = _this.stage.height / 2;
        _rttCamera.bottom = _this.stage.height / -2;
        _rttCamera.updateProjectionMatrix()
    }
    _this.add = function(pass, index) {
        if (typeof index == "number") {
            _this.passes.splice(index, 0, pass);
            return
        }
        _this.passes.push(pass)
    }
    ;
    _this.remove = function(pass) {
        if (typeof pass == "number") {
            _this.passes.splice(pass)
        } else {
            _this.passes.findAndRemove(pass)
        }
    }
    ;
    _this.renderToTexture = function(clear, rtt) {
        _this.renderer.render(_this.scene, _this.camera, rtt || _rttPing, typeof clear == "boolean" ? clear : true)
    }
    ;
    _this.render = function() {
        if (!_this.enabled || !_this.passes.length) {
            finalRender(_this.scene);
            return
        }
        if (!_this.multiRender) {
            _this.renderer.render(_this.scene, _this.camera, _rttPing, true)
        }
        var pingPong = true;
        for (var i = 0; i < _this.passes.length - 1; i++) {
            _nukeMesh.material = _this.passes[i].pass;
            _nukeMesh.material.uniforms.tDiffuse.value = pingPong ? _rttPing : _rttPong;
            _this.renderer.render(_nukeScene, _rttCamera, pingPong ? _rttPong : _rttPing);
            pingPong = !pingPong
        }
        _nukeMesh.material = _this.passes[_this.passes.length - 1].pass;
        _nukeMesh.material.uniforms.tDiffuse.value = pingPong ? _rttPing : _rttPong;
        finalRender(_nukeScene, _rttCamera)
    }
    ;
    _this.set("dpr", function(v) {
        _dpr = v || Device.pixelRatio;
        resizeHandler()
    });
    this.get("dpr", function() {
        return _dpr
    })
});
Class(function NukePass(_fs, _vs) {
    Inherit(this, Component);
    var _this = this;
    this.init = function(fs) {
        _this = this;
        var name = fs || this.constructor.toString().match(/function ([^\(]+)/)[1];
        var fragmentShader = Array.isArray(fs) ? fs.join("") : null;
        _this.uniforms = _this.uniforms || {};
        _this.uniforms.tDiffuse = {
            type: "t",
            value: null
        };
        _this.pass = new THREE.ShaderMaterial({
            uniforms: _this.uniforms,
            vertexShader: typeof _vs === "string" ? Shaders[name + ".vs"] : "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }",
            fragmentShader: fragmentShader || Shaders[name + ".fs"]
        });
        _this.uniforms = _this.pass.uniforms
    }
    ;
    this.set = function(key, value) {
        TweenManager.clearTween(_this.uniforms[key]);
        this.uniforms[key].value = value
    }
    ;
    this.tween = function(key, value, time, ease, delay, callback, update) {
        TweenManager.tween(_this.uniforms[key], {
            value: value
        }, time, ease, delay, callback, update)
    }
    ;
    if (typeof _fs === "string") {
        this.init(_fs)
    }
});
Class(function Raycaster(_camera) {
    Inherit(this, Component);
    var _this = this;
    var _mouse = new THREE.Vector3();
    var _raycaster = new THREE.Raycaster();
    var _debug = null;
    (function() {}
    )();
    function intersect(objects) {
        var hit;
        if (Array.isArray(objects)) {
            hit = _raycaster.intersectObjects(objects)
        } else {
            hit = _raycaster.intersectObject(objects)
        }
        if (_debug) {
            updateDebug()
        }
        return hit
    }
    function updateDebug() {
        var vertices = _debug.geometry.vertices;
        vertices[0].copy(_raycaster.ray.origin.clone());
        vertices[1].copy(_raycaster.ray.origin.clone().add(_raycaster.ray.direction.clone().multiplyScalar(10000)));
        vertices[0].x += 1;
        _debug.geometry.verticesNeedUpdate = true
    }
    this.set("camera", function(camera) {
        _camera = camera
    });
    this.debug = function(scene) {
        var geom = new THREE.Geometry();
        geom.vertices.push(new THREE.Vector3(-100,0,0));
        geom.vertices.push(new THREE.Vector3(100,0,0));
        var mat = new THREE.LineBasicMaterial({
            color: 16711680
        });
        _debug = new THREE.Line(geom,mat);
        scene.add(_debug)
    }
    ;
    this.checkHit = function(objects, mouse) {
        mouse = mouse || Mouse;
        var rect = _this.rect || Stage;
        _mouse.x = (mouse.x / rect.width) * 2 - 1;
        _mouse.y = -(mouse.y / rect.height) * 2 + 1;
        _raycaster.setFromCamera(_mouse, _camera);
        return intersect(objects)
    }
    ;
    this.checkFromValues = function(objects, origin, direction) {
        _raycaster.set(origin, direction, 0, Number.POSITIVE_INFINITY);
        return intersect(objects)
    }
});
Class(function ScreenProjection(_camera) {
    Inherit(this, Component);
    var _this = this;
    var _v3 = new THREE.Vector3();
    var _value = new THREE.Vector3();
    (function() {}
    )();
    this.set("camera", function(v) {
        _camera = v
    });
    this.unproject = function(mouse) {
        var rect = _this.rect || Stage;
        _v3.set((mouse.x / rect.width) * 2 - 1, -(mouse.y / rect.height) * 2 + 1, 0.5);
        _v3.unproject(_camera);
        var pos = _camera.position;
        _v3.sub(pos).normalize();
        var dist = -pos.z / _v3.z;
        _value.copy(pos).add(_v3.multiplyScalar(dist));
        return _value
    }
    ;
    this.project = function(pos, screen) {
        screen = screen || Stage;
        if (pos instanceof THREE.Object3D) {
            pos.updateMatrixWorld();
            _v3.set(0, 0, 0).setFromMatrixPosition(pos.matrixWorld)
        } else {
            _v3.copy(pos)
        }
        _v3.project(_camera);
        _v3.x = (_v3.x + 1) / 2 * screen.width;
        _v3.y = -(_v3.y - 1) / 2 * screen.height;
        return _v3
    }
});
Class(function RandomEulerRotation(_container) {
    var _this = this;
    var _euler = ["x", "y", "z"];
    var _rot;
    this.speed = 1;
    (function() {
        initRotation()
    }
    )();
    function initRotation() {
        _rot = {};
        _rot.x = Utils.doRandom(0, 2);
        _rot.y = Utils.doRandom(0, 2);
        _rot.z = Utils.doRandom(0, 2);
        _rot.vx = Utils.doRandom(-5, 5) * 0.0025;
        _rot.vy = Utils.doRandom(-5, 5) * 0.0025;
        _rot.vz = Utils.doRandom(-5, 5) * 0.0025
    }
    this.update = function() {
        var time = Render.TIME;
        for (var i = 0; i < 3; i++) {
            var v = _euler[i];
            switch (_rot[v]) {
            case 0:
                _container.rotation[v] += Math.cos(Math.sin(time * 0.25)) * _rot["v" + v] * _this.speed;
                break;
            case 1:
                _container.rotation[v] += Math.cos(Math.sin(time * 0.25)) * _rot["v" + v] * _this.speed;
                break;
            case 2:
                _container.rotation[v] += Math.cos(Math.cos(time * 0.25)) * _rot["v" + v] * _this.speed;
                break
            }
        }
    }
});
Class(function Shader(_vertexShader, _fragmentShader, _name, _material) {
    Inherit(this, Component);
    var _this = this;
    (function() {
        if (Hydra.LOCAL && _name) {
            expose()
        }
        if (_material) {
            _this.uniforms = _material.uniforms;
            _this.attributes = _material.attributes
        }
    }
    )();
    function expose() {
        Dev.expose(_name, _this)
    }
    this.get("material", function() {
        if (!_material) {
            var params = {};
            params.vertexShader = Shaders.getShader(_vertexShader + ".vs");
            params.fragmentShader = Shaders.getShader(_fragmentShader + ".fs");
            if (_this.attributes) {
                params.attributes = _this.attributes
            }
            if (_this.uniforms) {
                params.uniforms = _this.uniforms
            }
            _material = new THREE.ShaderMaterial(params);
            _material.shader = _this
        }
        return _material
    });
    this.set = function(key, value) {
        if (typeof value !== "undefined") {
            _this.uniforms[key].value = value
        }
        return _this.uniforms[key].value
    }
    ;
    this.getValues = function() {
        var out = {};
        for (var key in _this.uniforms) {
            out[key] = _this.uniforms[key].value
        }
        return out
    }
    ;
    this.copyUniformsTo = function(obj) {
        for (var key in _this.uniforms) {
            obj.uniforms[key] = _this.uniforms[key]
        }
    }
    ;
    this.tween = function(key, value, time, ease, delay, callback, update) {
        TweenManager.tween(_this.uniforms[key], {
            value: value
        }, time, ease, delay, callback, update)
    }
    ;
    this.clone = function(name) {
        return new Shader(_vertexShader,_fragmentShader,name || _name,_this.material.clone())
    }
});
Class(function Utils3D() {
    var _this = this;
    var _objectLoader, _geomLoader, _bufferGeomLoader;
    var _textures = {};
    this.PATH = "";
    this.decompose = function(local, world) {
        local.matrixWorld.decompose(world.position, world.quaternion, world.scale)
    }
    ;
    this.createDebug = function(size, color) {
        var geom = new THREE.IcosahedronGeometry(size || 40,1);
        var mat = color ? new THREE.MeshBasicMaterial({
            color: color
        }) : new THREE.MeshNormalMaterial();
        return new THREE.Mesh(geom,mat)
    }
    ;
    this.createRT = function(width, height) {
        var params = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };
        return new THREE.WebGLRenderTarget(width,height,params)
    }
    ;
    this.getTexture = function(path) {
        if (!_textures[path]) {
            var img = new Image();
            img.crossOrigin = "";
            img.src = _this.PATH + path;
            var texture = new THREE.Texture(img);
            img.onload = function() {
                texture.needsUpdate = true;
                if (texture.onload) {
                    texture.onload();
                    texture.onload = null
                }
                if (!THREE.Math.isPowerOfTwo(img.width * img.height)) {
                    texture.minFilter = THREE.LinearFilter
                }
            }
            ;
            _textures[path] = texture
        }
        return _textures[path]
    }
    ;
    this.setInfinity = function(v) {
        var inf = Number.POSITIVE_INFINITY;
        v.set(inf, inf, inf);
        return v
    }
    ;
    this.freezeMatrix = function(mesh) {
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix()
    }
    ;
    this.getCubemap = function(src) {
        var path = "cube_" + (Array.isArray(src) ? src[0] : src);
        if (!_textures[path]) {
            var images = [];
            for (var i = 0; i < 6; i++) {
                var img = new Image();
                img.crossOrigin = "";
                img.src = _this.PATH + (Array.isArray(src) ? src[i] : src);
                images.push(img);
                img.onload = function() {
                    _textures[path].needsUpdate = true
                }
            }
            _textures[path] = new THREE.Texture();
            _textures[path].image = images;
            _textures[path].minFilter = THREE.LinearFilter
        }
        return _textures[path]
    }
    ;
    this.loadObject = function(name) {
        if (!_objectLoader) {
            _objectLoader = new THREE.ObjectLoader()
        }
        return _objectLoader.parse(Hydra.JSON[name])
    }
    ;
    this.loadGeometry = function(name) {
        if (!_geomLoader) {
            _geomLoader = new THREE.JSONLoader()
        }
        if (!_bufferGeomLoader) {
            _bufferGeomLoader = new THREE.BufferGeometryLoader()
        }
        var json = Hydra.JSON[name];
        if (json.type == "BufferGeometry") {
            return _bufferGeomLoader.parse(json)
        } else {
            return _geomLoader.parse(json.data).geometry
        }
    }
    ;
    this.disposeAllTextures = function() {
        for (var key in _textures) {
            _textures[key].dispose()
        }
    }
    ;
    this.disableWarnings = function() {
        window.console.warn = function(str, msg) {}
        ;
        window.console.error = function() {}
    }
    ;
    this.getGPUDetails = function(renderer) {
        var gl = renderer.context;
        var info = gl.getExtension("WEBGL_debug_renderer_info");
        var output = {};
        if (info) {
            var gpu = info.UNMASKED_RENDERER_WEBGL;
            output.gpu = gl.getParameter(gpu).toLowerCase()
        }
        output.renderer = gl.getParameter(gl.RENDERER).toLowerCase();
        output.version = gl.getParameter(gl.VERSION).toLowerCase();
        output.glsl = gl.getParameter(gl.SHADING_LANGUAGE_VERSION).toLowerCase();
        _this.GPU_INFO = output;
        return output
    }
    ;
    this.detectGPU = function(matches) {
        var gpu = _this.GPU_INFO;
        if (gpu.gpu && gpu.gpu.strpos(matches)) {
            return true
        }
        if (gpu.version && gpu.version.strpos(matches)) {
            return true
        }
        return false
    }
}, "static");
Namespace("SVG");
SVG.Class(function Animation(props, time, ease, delay, callback, manual) {
    Inherit(this, SVG.Base);
    var _this = this;
    this.id = "Animate_" + Utils.timestamp();
    this.object = new SVG.Object(this.id,"animate");
    this.object.attr({
        attributeName: "intercept",
        fill: "#fff"
    });
    this.add = function(obj) {
        this.object.elementNS.appendChild(obj.elementNS)
    }
    ;
    this.mask = function(obj) {
        obj = obj.elementNS ? obj : obj.object;
        obj.attr({
            mask: "url(#" + _this.id + ")"
        })
    }
});
SVG.Class(function Base() {
    Inherit(this, Component);
    var _this = this;
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.rotation = 0;
    this.scale = 1;
    this.children = [];
    this.add = function(child) {
        this.children.push(child);
        this.object && this.object.elementNS.appendChild(child.object.elementNS)
    }
    ;
    this.remove = function(child) {
        this.children.findAndRemove(child);
        this.object && this.object.elementNS.removeChild(child.object.elementNS)
    }
    ;
    this.transform = function(obj) {
        if (!this.object) {
            return
        }
        this.object.element.transform(obj || _this);
        return this
    }
    ;
    this.css = function(p0, p1) {
        if (!this.object) {
            return
        }
        this.object.element.css(p0, p1);
        return this
    }
    ;
    this.hide = function() {
        this.object.element.hide();
        return this
    }
    ;
    this.show = function() {
        this.object.element.show();
        return this
    }
    ;
    this.tween = function(props, time, ease, delay, callback, manual) {
        if (!this.object) {
            return
        }
        return this.object.element.tween(props, time, ease, delay, callback, manual)
    }
    ;
    this.addFilter = function(filter) {
        if (!this.object) {
            return
        }
        this.object.elementNS.setAttribute("filter", "url(#" + filter.id + ")")
    }
    ;
    this.attr = function(params) {
        if (!this.object) {
            return
        }
        this.object.attr(params)
    }
    ;
    this.setValue = function(prop, param) {
        if (!this.object) {
            return
        }
        this.elementNS.setAttribute(prop, param);
        return this
    }
});
SVG.Class(function Object(_name, _elm, _type) {
    var _this = this;
    this.initElement(_name, _elm);
    this.attributes = {};
    this.type = _type
}, function() {
    var prototype = SVG.Object.prototype;
    prototype.initElement = function(name, elm) {
        this.element = this.create(name, elm)
    }
    ;
    prototype.setAttr = function(params) {
        for (var prop in params) {
            this.attributes[prop] = params[prop];
            this.elementNS.setAttribute(prop, params[prop])
        }
        return this
    }
    ;
    prototype.setValue = function(prop, param) {
        this.attributes[prop] = param;
        this.elementNS.setAttribute(prop, param);
        return this
    }
    ;
    prototype.create = function(name, elm) {
        var ns = "http://www.w3.org/2000/svg";
        this.elementNS = document.createElementNS(ns, elm);
        if (name !== null) {
            this.elementNS.id = name
        }
        return $(this.elementNS)
    }
    ;
    prototype.add = function(child) {
        this.elementNS.appendChild(child.elementNS ? child.elementNS : child)
    }
    ;
    prototype.transform = function(obj) {
        this.element.transform(obj || _this);
        return this
    }
    ;
    prototype.css = function(p0, p1) {
        this.element.css(p0, p1);
        return this
    }
    ;
    prototype.hide = function() {
        this.element.hide();
        return this
    }
    ;
    prototype.show = function() {
        this.element.show();
        return this
    }
    ;
    prototype.tween = function(props, time, ease, delay, callback, manual) {
        if (this.type) {
            if (this.type === "filter") {
                return new SVG.Animation(props,time,ease,delay,callback,manual)
            }
        }
        return this.element.tween(props, time, ease, delay, callback, manual)
    }
    ;
    prototype.interact = function(over, click) {
        var _this = this;
        this.elementNS.onclick = function() {
            click({
                target: _this
            })
        }
        ;
        this.elementNS.addEventListener("touchend", function() {
            click({
                target: _this
            })
        });
        if (!over) {
            return
        }
        this.elementNS.onmouseover = function() {
            over({
                action: "over"
            });
            _this.element.css({
                cursor: "pointer"
            })
        }
        ;
        this.elementNS.onmouseout = function() {
            over({
                action: "out"
            });
            _this.element.css({
                cursor: "auto"
            })
        }
    }
});
SVG.Class(function Canvas(_width, _height) {
    Inherit(this, Component);
    var _this = this;
    var $container;
    this.width = _width || 0;
    this.height = _height || 0;
    this.children = [];
    (function() {
        initContainer();
        initDefs()
    }
    )();
    function initContainer() {
        _this.object = new SVG.Object("Canvas","svg");
        if (_width) {
            _this.object.setAttr({
                viewBox: "0 0 " + _width + " " + _height
            })
        }
        _this.element = _this.object.element
    }
    function initDefs() {
        _this.defs = new SVG.Object("Defs","defs");
        _this.object.add(_this.defs)
    }
    this.add = function(child) {
        if (child instanceof SVG.Mask || child instanceof SVG.Filter) {
            this.defs.add(child.object.elementNS)
        } else {
            this.children.push(child);
            this.object && this.object.add(child.object.elementNS)
        }
    }
    ;
    this.remove = function(child) {
        this.children.findAndRemove(child);
        this.object && this.object.elementNS.removeChild(child.object.elementNS)
    }
    ;
    this.viewBox = function(params) {
        this.object.setAttr({
            viewBox: params
        })
    }
});
SVG.Class(function Element(_name, _append) {
    Inherit(this, Component);
    var _this = this;
    var _element;
    _this.children = [];
    _this.attr = {};
    (function() {
        initElement()
    }
    )();
    function initElement() {
        _element = _this.element
    }
    function appendElement(obj) {}
    function addAttributes(params) {}
    this.attr = addAttributes;
    this.append = appendElement
}, function() {
    var prototype = SVG.Element.prototype
});
SVG.Class(function Path(_path) {
    Inherit(this, SVG.Base);
    var _this = this;
    this.path = [];
    this.id = "Path_" + Utils.timestamp();
    this.object = new SVG.Object(_this.id,"path");
    if (_path) {
        this.object.setAttr({
            d: _path
        })
    }
    this.fill("none");
    this.stroke("#000")
}, function() {
    var prototype = SVG.Path.prototype;
    prototype.moveTo = function(x, y) {
        this.path.length = 0;
        this.path.push("M" + x + " " + y)
    }
    ;
    prototype.lineTo = function(x, y) {
        this.path.push("L " + x + " " + y)
    }
    ;
    prototype.quadraticCurveTo = function(x, y, cx, cy) {
        this.path.push("Q " + x + " " + y + " " + cx + " " + cy)
    }
    ;
    prototype.draw = function() {
        var str = this.path.join(" ");
        this.object.setAttr({
            d: str
        })
    }
    ;
    prototype.stroke = function(color) {
        this.object.setAttr({
            stroke: color
        })
    }
    ;
    prototype.fill = function(color) {
        this.object.setAttr({
            fill: color
        })
    }
    ;
    prototype.strokeWidth = function(width) {
        this.object.setAttr({
            "stroke-width": width
        })
    }
    ;
    prototype.lineJoin = function(join) {
        this.object.setAttr({
            "stroke-linejoin": join
        })
    }
    ;
    prototype.closePath = function() {
        this.path.push("z")
    }
});
SVG.Class(function Shape(_type) {
    Inherit(this, SVG.Base);
    var _this = this;
    var type = _type || "g";
    this.object = new SVG.Object("Graphics",type)
}, function() {
    var prototype = SVG.Shape.prototype;
    prototype.clear = function() {
        var svg = this.object.elementNS;
        while (svg.lastChild) {
            svg.removeChild(svg.lastChild)
        }
    }
    ;
    prototype.circle = function(x, y, radius) {
        var name = "circle_" + Utils.timestamp();
        var obj = new SVG.Object(name,"circle");
        obj.setAttr({
            cx: x,
            cy: y,
            r: radius
        });
        this.object.add(obj);
        return obj
    }
    ;
    prototype.ellipse = function(rx, ry, cx, cy) {
        var name = "ellipse_" + Utils.timestamp();
        var obj = new SVG.Object(name,"ellipse");
        obj.setAttr({
            rx: rx,
            ry: ry,
            cx: cx,
            cy: cy
        });
        this.object.add(obj);
        return obj
    }
    ;
    prototype.rect = function(x, y, width, height, r) {
        var name = "rect_" + Utils.timestamp();
        var obj = new SVG.Object(name,"rect");
        obj.setAttr({
            x: x,
            y: y,
            width: width,
            height: height
        });
        if (r) {
            obj.setAttr({
                rx: r,
                ry: r
            })
        }
        this.object.add(obj);
        return obj
    }
    ;
    prototype.polygon = function(pts) {
        var name = "polygon_" + Utils.timestamp();
        var obj = new SVG.Object(name,"polygon");
        obj.setAttr("points", pts.join());
        this.object.add(obj);
        return obj
    }
    ;
    prototype.mask = function(obj) {
        console.log(this.getAttribute("id"))
    }
    ;
    prototype.clone = function() {}
    ;
    prototype.bringToFront = function(obj) {
        this.object.elementNS.removeChild(obj.elementNS);
        this.object.elementNS.appendChild(obj.elementNS)
    }
});
SVG.Class(function Filter(_name) {
    Inherit(this, SVG.Base);
    var _this = this;
    this.filters = [];
    this.id = _name || "filter_" + Utils.timestamp();
    this.object = new SVG.Object(this.id,"filter");
    (function() {}
    )()
}, function() {
    var prototype = SVG.Filter.prototype;
    prototype.blurFilter = function(input, amount) {
        if (!amount) {
            amount = input;
            input = "SourceGraphic"
        }
        var name = "blur_" + Utils.timestamp();
        var obj = new SVG.Object(name,"feGaussianBlur","filter");
        var props = {
            "in": input,
            stdDeviation: amount,
            result: name
        };
        return this.createFilter(props, obj)
    }
    ;
    prototype.blendFilter = function(input1, input2, mode) {
        var name = "blend_" + Utils.timestamp();
        var obj = new SVG.Object(name,"feBlend","filter");
        var props = {
            "in": input1,
            in2: input2,
            mode: mode,
            result: name
        };
        return this.createFilter(props, obj)
    }
    ;
    prototype.colorMatrixFilter = function(input, type, values) {
        if (!values) {
            type = input;
            input = "SourceGraphic"
        }
        var name = "color-matrix_" + Utils.timestamp();
        var obj = new SVG.Object(name,"feColorMatrix","filter");
        var props = {
            input1: input,
            type: type,
            values: values,
            result: name
        };
        return this.createFilter(props, obj)
    }
    ;
    prototype.compositeFilter = function(input1, input2, operation) {
        var name = "composite_" + Utils.timestamp();
        var obj = new SVG.Object(name,"feComposite","filter");
        var props = {
            "in": input1,
            in2: input2,
            operator: operation,
            result: name
        };
        this.createFilter(props, obj)
    }
    ;
    prototype.displacementFilter = function(x, y, input1, input2) {
        var name = "composite_" + Utils.timestamp();
        var obj = new SVG.Object(name,"feComposite","filter");
        var props = {
            x: x,
            y: y,
            "in": input1,
            in2: input2,
            result: name
        };
        return this.createFilter(props, obj)
    }
    ;
    prototype.offsetFilter = function() {}
    ;
    prototype.tileFilter = function() {}
    ;
    prototype.turbulenceFilter = function(type, frequency, octaves) {
        var name = "turbulence_" + Utils.timestamp();
        var obj = new SVG.Object(name,"feTurbulence","filter");
        var props = {
            type: type,
            baseFrequency: frequency,
            numOctaves: octaves,
            result: name
        };
        return this.createFilter(props, obj)
    }
    ;
    prototype.createFilter = function(props, obj) {
        for (var item in props) {
            if (!item) {
                return
            }
            if ((item === "in" || item === "in2") && item.elementNS) {
                props[item] = props[item].attributes.result
            }
            obj.setValue(item, props[item])
        }
        this.object.add(obj);
        this.filters.push(obj);
        return obj
    }
    ;
    prototype.merge = function(array) {
        this.feMerge = new SVG.Object(null,"feMerge");
        this.object.add(this.feMerge);
        var filters = array || this.filters;
        for (var i = 0; i < filters.length; i++) {
            var filter = filters[i];
            if (filter.attributes.result) {
                var node = new SVG.Object(null,"feMergeNode");
                node.setAttr({
                    "in": filter.elementNS.id
                });
                this.feMerge.add(node)
            }
        }
    }
    ;
    prototype.apply = function(obj) {
        obj = obj.elementNS ? obj : obj.object;
        obj.elementNS.setAttribute("filter", "url(#" + this.id + ")")
    }
});
SVG.Class(function Mask() {
    Inherit(this, SVG.Base);
    var _this = this;
    this.id = "Mask_" + Utils.timestamp();
    this.object = new SVG.Object(this.id,"mask");
    this.object.setAttr({
        maskUnits: "objectBoundingBox"
    });
    this.type = "mask";
    this.add = function(obj) {
        this.object.elementNS.appendChild(obj.elementNS)
    }
    ;
    this.mask = function(obj) {
        obj = obj.elementNS ? obj : obj.object;
        obj.setAttr({
            mask: "url(#" + _this.id + ")"
        })
    }
});
SVG.Class(function Utils() {
    function convertCircle(path) {
        var cx, cy, r, r2;
        cx = path.substr(path.indexOf("cx=") + 4, (path.indexOf("cy=") - 2) - (path.indexOf("cx=") + 4));
        cy = path.substr(path.indexOf("cy=") + 4, (path.indexOf("r=") - 2) - (path.indexOf("cy=") + 4));
        r = path.substr(path.indexOf("r=") + 3, (path.length - 6) - path.indexOf("r="));
        r2 = parseFloat(r * 2);
        return 'd="M' + cx + ", " + cy + " m" + (-r) + ", 0 a " + r + ", " + r + " 0 1,0 " + r2 + ",0 a " + r + ", " + r + " 0 1,0 " + (-r2) + ',0"'
    }
    function convertLine(path) {
        var x1, x2, y1, y2;
        x1 = path.substr(path.indexOf("x1=") + 4, (path.indexOf("y1=") - 2) - (path.indexOf("x1=") + 4));
        y1 = path.substr(path.indexOf("y1=") + 4, (path.indexOf("x2=") - 2) - (path.indexOf("y1=") + 4));
        x2 = path.substr(path.indexOf("x2=") + 4, (path.indexOf("y2=") - 2) - (path.indexOf("x2=") + 4));
        y2 = path.substr(path.indexOf("y2=") + 4, (path.length - 7) - path.indexOf("y2="));
        return 'd="M' + x1 + "," + y1 + " " + x2 + "," + y2 + '"'
    }
    function convertPolygon(path) {
        var start = (path.indexOf("points=") + 8);
        var end = path.lastIndexOf('"') - start;
        return 'd="M' + path.substr(start, end) + '"'
    }
    function convertRect(path) {
        var x1, x2, y1, y2;
        x1 = path.substr(path.indexOf("x=") + 3, (path.indexOf("y=") - 2) - (path.indexOf("x=") + 3));
        y1 = path.substr(path.indexOf("y=") + 3, (path.indexOf("width=") - 2) - (path.indexOf("y=") + 3));
        x2 = path.substr(path.indexOf("width=") + 7, (path.indexOf("height=") - 2) - (path.indexOf("width=") + 7));
        y2 = path.substr(path.indexOf("height=") + 8, (path.length - 7) - (path.indexOf("height=") + 4));
        x2 = Number(x2) + Number(x1);
        y2 = Number(y2) + Number(y1);
        y2 = y2.toFixed(2);
        return 'd="M' + x1 + "," + y1 + " " + x2 + "," + y1 + " " + x2 + "," + y2 + " " + x1 + "," + y2 + " " + x1 + "," + y1 + '"'
    }
    function convertElipses(path) {
        var cx, cy, rx, ry;
        cx = path.substr(path.indexOf("cx=") + 4, (path.indexOf("cy=") - 2) - (path.indexOf("cx=") + 4));
        cy = path.substr(path.indexOf("cy=") + 4, (path.indexOf("rx=") - 2) - (path.indexOf("cy=") + 4));
        rx = path.substr(path.indexOf("rx=") + 4, (path.indexOf("ry=") - 2) - path.indexOf("rx=") + 4);
        ry = path.substr(path.indexOf("ry=") + 4, (path.length - 7) - path.indexOf("ry=") + 4);
        return 'd="M' + cx + ", " + cy + " m" + (-rx) + ", 0 a " + rx + ", " + ry + " 0 1,0 " + rx * 2 + ",0 a " + rx + ", " + ry + " 0 1,0 " + (-rx * 2) + ',0 "'
    }
    this.convert = function(path, type) {
        var attr = "d"
          , offset = 3;
        switch (type) {
        case "polygon":
            path = convertPolygon(path);
            break;
        case "polyline":
            attr = "points";
            offset = 8;
            break;
        case "line":
            path = convertLine(path);
            break;
        case "circle":
            path = convertCircle(path);
            break;
        case "rect":
            path = convertRect(path);
            break;
        case "elipses":
            path = convertElipses(path);
            break
        }
        var start = (path.indexOf(attr + "=") + offset);
        var end = path.lastIndexOf('"') - start;
        path = path.substr(start, end);
        if (type === "polyline") {
            attr = "d";
            path = "M" + path
        }
        return path
    }
}, "static");
Class(function Data() {
    Inherit(this, Model);
    var _this = this;
    (function() {}
    )()
}, "Static");
Data.Class(function Metronome() {
    Inherit(this, Model);
    var _this = this;
    var _callback, _max;
    var _time = 0;
    (function() {}
    )();
    function loop(t, dt, delta) {
        _time += delta;
        if (_time >= _max) {
            _callback();
            _time = 0
        }
    }
    this.start = function(time, callback) {
        _this.isPlaying = true;
        _time = 0;
        _max = time;
        _callback = callback;
        Render.startRender(loop)
    }
    ;
    this.stop = function() {
        _this.isPlaying = false;
        _callback = null;
        Render.stopRender(loop)
    }
});
Class(function Sound() {
    Inherit(this, Model);
    var _this = this;
    var _instruments = ["percussion", "tonal", "voice"];
    var _schemes = [0, 1, 2];
    var _shapes = {
        circle: _instruments[2],
        triangle: _instruments[0],
        line: _instruments[1]
    };
    (function() {}
    )();
    function loadData() {
        XHR.get(Config.DATA_API, function(data) {
            _this.data = data;
            _this.data.total = getTotal();
            init()
        })
    }
    function getTotal() {
        var total = 0;
        _instruments.forEach(function(instr) {
            _schemes.forEach(function(i) {
                total += _this.data[instr][i].length
            })
        });
        return total
    }
    function init() {
        addListeners();
        initNoop();
        loadInitialSounds(function() {
            _this.events.fire(KandinskyEvents.SOUNDS_LOADED);
            loadAllSounds(function() {
                console.log("All sounds loaded")
            })
        })
    }
    function initNoop() {
        _instruments.forEach(function(instr) {
            _schemes.forEach(function(i) {
                _this.data[instr][i].forEach(function(sound) {
                    sound.sound = {
                        _rate: 1,
                        play: function() {}
                    }
                })
            })
        })
    }
    function loadInitialSounds(callback) {
        var loadList = [].concat(_this.data[_instruments[0]][0], _this.data[_instruments[1]][0], _this.data[_instruments[2]][0]);
        var total = loadList.length;
        var count = 0;
        var tally = function() {
            count++;
            if (count == total && typeof callback == "function") {
                callback()
            }
        };
        loadList.forEach(function(item) {
            item.sound = new Howl({
                urls: [item.url],
                onload: tally
            })
        })
    }
    function loadAllSounds(callback) {
        var total = _this.data.total;
        var count = 0;
        var tally = function() {
            count++;
            if (count == total && typeof callback == "function") {
                callback()
            }
        };
        _instruments.forEach(function(instr) {
            _schemes.forEach(function(i) {
                _this.data[instr][i].forEach(function(item) {
                    item.sound = new Howl({
                        urls: [item.url],
                        onload: tally
                    })
                })
            })
        })
    }
    function addListeners() {
        _this.events.subscribe(HydraEvents.BROWSER_FOCUS, focusHandler)
    }
    function focusHandler(e) {
        if (e.type == "blur") {
            _this.forced = Howler.volume();
            _this.mute()
        } else {
            if (_this.forced) {
                _this.unmute()
            }
        }
    }
    this.loadData = loadData;
    this.mute = function() {
        if (!Howler) {
            return
        }
        Howler.mute()
    }
    ;
    this.unmute = function() {
        if (!Howler) {
            return
        }
        Howler.unmute()
    }
    ;
    this.play = function(shape, y, volume) {
        var sounds = _this.data[_shapes[shape]][Config.SCHEME];
        if (sounds.length < 1) {
            return
        }
        var yPerc = (y - Stage.height * 0.05) / (Stage.height * 0.8);
        yPerc = Math.max(0, Math.min(1, yPerc));
        var item = sounds[Math.round(yPerc * (sounds.length - 1))];
        item.sound.volume(volume);
        item.sound.play()
    }
    ;
    this.getSound = function(shape, y, volume) {
        var sounds = _this.data[_shapes[shape]][Config.SCHEME];
        if (sounds.length < 1) {
            return
        }
        var yPerc = (y - Stage.height * 0.05) / (Stage.height * 0.8);
        yPerc = Math.max(0, Math.min(1, yPerc));
        var item = sounds[Math.round(yPerc * (sounds.length - 1))];
        return item;
    }

}, "Static");
