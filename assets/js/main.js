Class(function Container() {
    Inherit(this, Controller);
    var _this = this;
    var $container, _renderer, _ui;
    (function() {
        initContainer();
        initViews()
    }
    )();
    function initContainer() {
        $container = _this.container;
        $container.css({
            position: "static"
        });
        Stage.add($container)
    }
    function initViews() {
        _renderer = _this.initClass(Renderer);
        $container.add(_renderer.container);
        _ui = _this.initClass(UI);
        $container.add(_ui);
        Playback.instance()
    }
}, "singleton");
Class(function Drawing() {
    Inherit(this, Component);
    var _this = this;
    this.lines = _this.initClass(LinkedList);
    this.groups = _this.initClass(LinkedList);
    var _container, _currentLine, _lastPoint, _amountMoved, _mode, _playTimer;
    this.object3D = new THREE.Object3D();
    (function() {
        resize();
        drawActivatingline();
        drawActivatingFace()
    }
    )();
    function newLine() {
        _currentLine = _this.initClass(Line, _this.object3D);
        _this.lines.push(_currentLine)
    }
    function checkForHit() {
        var hits = [];
        var line = _this.lines.start();
        while (line) {
            if (line.hitTest(Mouse)) {
                hits.push(line)
            }
            line = _this.lines.next()
        }
        return hits
    }
    function fadeOutLines() {
        if (_this.lines.length < Config.ALLOWED_LINES) {
            return
        }
        var l = _this.lines.start();
        _this.lines.remove(l);
        l.fadeOut()
    }
    function checkGroupOverlap() {
        var g = _this.groups.start();
        while (g) {
            if (g.hitTestLine(_currentLine)) {
                break
            }
            g = _this.groups.next()
        }
        return g
    }
    function addListeners(element) {
        _container = $(element);
        _this.events.subscribe(HydraEvents.RESIZE, resize);
        _container.bind("touchstart", down);
        _this.events.subscribe(KandinskyEvents.UNDO, undo);
        _this.events.subscribe(KandinskyEvents.EMPTY_GROUP, removeGroup)
    }
    function resize() {
        var nextLine = _this.lines.start();
        var line;
        while (nextLine) {
            line = nextLine;
            nextLine = _this.lines.next();
            line.destroy()
        }
        _this.lines.empty();
        _this.events.fire(KandinskyEvents.PLAY_PAUSE, {
            type: "pause"
        })
    }
    function down(e) {
        Mouse.x = e.x;
        Mouse.y = e.y;
        e.preventDefault();
        _container.unbind("touchstart", down);
        __window.bind("touchmove", move);
        __window.bind("touchend", end);
        _amountMoved = 0;
        _mode = false;
        _lastPoint = e
    }
    function move(e) {
        var x = e.x - _lastPoint.x;
        var y = e.y - _lastPoint.y;
        var diff = Math.sqrt(x * x + y * y);
        _lastPoint = e;
        _amountMoved += diff;
        if (_amountMoved < 10) {
            return
        }
        if (!_mode) {
            _mode = "draw";
            newLine()
        }
        var velocity = Math.min(1, 2 * diff / (Math.max(Stage.width, Stage.height) * 0.1));
        _currentLine.addPoint(e, velocity);
        _currentLine.calculateLine()
    }
    function end(e) {
        __window.unbind("touchmove", move);
        __window.unbind("touchend", end);
        _container.bind("touchstart", down);
        if (!_mode) {
            checkForHit().forEach(function(line) {
                line.play()
            });
            return
        }
        if (_currentLine.simplifyLine() == "too_short") {
            _this.lines.remove(_currentLine);
            _currentLine.destroy();
            _currentLine = _this.lines.last;
            return
        }
        var gesture = Gesture.instance().calculate(_currentLine.geometry.vertices);
        if (gesture) {
            _currentLine.setGesture(gesture)
        }
        var overlappedGroup = checkGroupOverlap();
        _currentLine.smoothLine();
        _currentLine.center();
        _currentLine.calculateLine(true);
        _currentLine.initAnimator();
        if (overlappedGroup) {
            overlappedGroup.addLine(_currentLine);
            _currentLine.group = overlappedGroup
        } else {
            var group = _this.initClass(LineGroup);
            group.addLine(_currentLine);
            _currentLine.group = group;
            _this.groups.push(group)
        }
        fadeOutLines();
        _currentLine.completed = true;
        if (Data.Metronome.isPlaying) {
            Playback.instance().updateGroups();
            _currentLine.play("silent")
        } else {
            _currentLine.play()
        }
    }
    function undo() {
        if (_this.lines.length === 0) {
            return
        }
        if (!_currentLine.completed) {
            return
        }
        _this.lines.remove(_currentLine);
        _currentLine.undo();
        _currentLine = _this.lines.last
    }
    function removeGroup(group) {
        _this.groups.remove(group)
    }
    function drawActivatingline() {
        var line = _this.initClass(Line, _this.object3D);
        for (var i = 0; i < 10; i++) {
            line.addPoint({
                x: 50 + i * 15,
                y: -50
            }, 0.2)
        }
        line.calculateLine();
        _this.delayedCall(function() {
            line.undo()
        }, 100)
    }
    function drawActivatingFace() {
        var face = _this.initClass(Face);
        _this.object3D.add(face.object3D);
        _this.delayedCall(function() {
            _this.object3D.remove(face.object3D);
            face.destroy()
        }, 100)
    }
    this.addListeners = addListeners
}, "singleton");
Class(function LineAnimation() {
    Inherit(this, Component);
    var _this = this;
    var _thread;
    var _touch = {};
    var _callbacks = {};
    var _recycle = {
        msg: {},
        transfer: true,
        buffer: []
    };
    (function() {
        initThread();
        Render.start(loop)
    }
    )();
    function initThread() {
        _thread = _this.initClass(Thread, LineAnimationThread);
        _thread.importClass(Vector2, ParticlePhysics, LinkedList, LineAnimationObject, Particle, EulerIntegrator, ObjectPool, LineAnimationBehavior, Render, Timer, Spring, TweenManager, TweenManager.Interpolation, HydraEvents, MathTween, SpringTween);
        _thread.init();
        _thread.on("transfer", receive)
    }
    function loop() {
        _touch.x = Mouse.x;
        _touch.y = Mouse.y;
        _touch.mobile = !!Device.mobile;
        _thread.setTouch(_touch);
        _thread.render()
    }
    function receive(e) {
        var callback = _callbacks[e.__id];
        if (!callback) {
            return
        }
        callback.receive(e.array, e.__id, e.type);
        _recycle.transfer = true;
        _recycle.buffer.length = 0;
        _recycle.msg.array = e.array;
        _recycle.msg.__id = e.__id;
        _recycle.buffer.push(e.array.buffer);
        _thread.recycle(_recycle)
    }
    this.upload = function(line, array, animator) {
        line.curve.mesh.geometry.computeBoundingSphere();
        _thread.upload({
            transfer: true,
            msg: {
                array: array,
                __id: line.__id,
                pos: line.curve.mesh.position,
                radius: line.curve.mesh.geometry.boundingSphere.radius,
                face: line.faceVectors
            },
            buffer: [array.buffer]
        });
        _callbacks[line.__id] = animator
    }
    ;
    this.remove = function(id) {
        delete _callbacks[id];
        _thread.remove({
            __id: id
        })
    }
    ;
    this.hit = function(line) {
        _thread.hit({
            line: line.__id
        })
    }
}, "singleton");
Class(function LineAnimationBehavior() {
    Inherit(this, Component);
    var _this = this;
    var _touch = new Vector2();
    var _calc = new Vector2();
    var _target = new Vector2();
    var _velocity = new Vector2();
    (function() {
        _velocity.multiplier = 0
    }
    )();
    this.update = function() {
        _velocity.subVectors(Global.TOUCH, _touch);
        _velocity.len = _velocity.length();
        var mult = Utils.range(_velocity.len, 2, 5, 0, 1, true);
        _velocity.multiplier += (mult - _velocity.multiplier) * 0.5;
        _touch.copy(Global.TOUCH)
    }
    ;
    this.applyBehavior = function(p) {
        var target = p.spring.target;
        var origin = p.origin;
        var screen = p.screen;
        var boundingSphere = p.boundingSphere;
        if (!Global.MOBILE) {
            _calc.subVectors(_touch, screen);
            var len = _calc.lengthSq();
            if (len < boundingSphere * boundingSphere) {
                len = Math.sqrt(len);
                p.lineObject.active = true;
                var angle = Math.atan2(_calc.y, _calc.x);
                _target.copy(origin);
                var sizeMultiplier = Utils.range(boundingSphere, 100, 200, 1, 0.2, true);
                if (sizeMultiplier > 1) {
                    sizeMultiplier = 1
                }
                var dist = (boundingSphere - len) * 0.4 * sizeMultiplier * (p.face ? 1 : _velocity.multiplier);
                _target.x -= Math.cos(angle) * dist;
                _target.y -= Math.sin(angle) * dist;
                target.lerp(_target, 0.07)
            } else {
                target.copy(p.origin)
            }
        }
        p.spring.update();
        p.distance = p.spring.getDistanceSq()
    }
});
Class(function LineAnimationObject(_array, _id, _parentPos, _boundingSphere, _face) {
    Inherit(this, Component);
    var _this = this;
    var _pool, _timer, _clicked, _facePool;
    var _particles = [];
    var NUM = 2;
    var DAMPING = Utils.doRandom(25, 35) / 100;
    var FRICTION = Utils.doRandom(75, 85) / 100;
    this.id = _id;
    this.active = false;
    (function() {
        initParticles();
        if (_face) {
            initFace()
        }
        click()
    }
    )();
    function initProperties(p) {
        p.parentPos = _parentPos;
        p.screen = new Vector2().copy(p.pos).add(_parentPos);
        p.origin = new Vector2().copy(p.pos);
        p.boundingSphere = _boundingSphere;
        p.spring = new Spring(p.pos,p.origin.clone(),DAMPING,FRICTION)
    }
    function initFace() {
        _face.forEach(function(f, index) {
            _face[index] = new Vector2(f.x,f.y);
            var p = new Particle(new Vector2(f.x,f.y));
            p.face = true;
            initProperties(p);
            Global.physics.addParticle(p);
            _face[index].particle = p;
            p.lineObject = _this
        })
    }
    function initObjectPool() {
        _pool = _this.initClass(ObjectPool);
        for (var i = 0; i < 5; i++) {
            var array = new Float32Array(_particles.length * NUM);
            _pool.insert(array)
        }
        if (_face) {
            _facePool = _this.initClass(ObjectPool);
            for (var i = 0; i < 5; i++) {
                _facePool.insert(new Float32Array(6))
            }
        }
    }
    function initParticles() {
        for (var i = 0; i < _array.length + 1; i += 2) {
            var p = new Particle(new Vector2(_array[i],_array[i + 1]));
            initProperties(p);
            _particles.push(p);
            Global.physics.addParticle(p);
            p.lineObject = _this
        }
        initObjectPool();
        _array = null
    }
    function checkIfActive() {
        if (_clicked) {
            return
        }
        var active = false;
        for (var i = _particles.length - 1; i > -1; i--) {
            var p = _particles[i];
            if (p.distance > 0) {
                active = true
            }
        }
        if (active) {
            _this.active = true
        } else {
            _this.active = false
        }
    }
    function click() {
        _clicked = true;
        _this.active = true;
        for (var i = _particles.length - 1; i > -1; i--) {
            var p = _particles[i];
            p.pos.copy(p.origin).multiply(2 * Utils.range(Math.sin(i * 0.2 + Date.now() * 0.01), -1, 1, 0.7, 1, true) * Utils.range(Math.sin(i * 0.02 + Date.now() * 0.02), -1, 1, 0.7, 1.1, true))
        }
        if (_face) {
            for (i = _face.length - 1; i > -1; i--) {
                p = _face[i].particle;
                p.pos.copy(p.origin).multiply(Utils.doRandom(15, 19) / 10)
            }
        }
        _this.delayedCall(function() {
            _clicked = false
        }, 250)
    }
    this.render = function() {
        if (!this.active) {
            return
        }
        var array = _pool.get() || new Float32Array(_particles.length * NUM);
        var len = _particles.length - 1;
        for (var i = 0; i < len; i++) {
            var p = _particles[i];
            array[i * NUM + 0] = p.pos.x;
            array[i * NUM + 1] = p.pos.y
        }
        Global.send(array, _id);
        if (_face) {
            array = _facePool.get() || new Float32Array(6);
            for (i = 0; i < 3; i++) {
                p = _face[i].particle;
                array[i * NUM + 0] = p.pos.x;
                array[i * NUM + 1] = p.pos.y
            }
            Global.send(array, _id, "face")
        }
        checkIfActive()
    }
    ;
    this.recycle = function(array) {
        if (_face && array.length == 6) {
            _facePool.put(array)
        } else {
            _pool.put(array)
        }
    }
    ;
    this.hit = function() {
        click()
    }
    ;
    this.onDestroy = function() {
        for (var i = _particles.length - 1; i > -1; i--) {
            var p = _particles[i];
            Global.physics.removeParticle(p)
        }
        _particles = null
    }
});
Class(function LineAnimationThread() {
    Inherit(this, Component);
    var _this = this;
    var _objects, _physics, _behavior;
    var _buffer = [];
    var _msg = {};
    Global.TOUCH = {};
    this.init = function() {
        _objects = new LinkedList();
        _physics = new ParticlePhysics();
        _physics.skipIntegration = true;
        _behavior = new LineAnimationBehavior();
        _physics.addBehavior(_behavior);
        Global.physics = _physics;
        TweenManager.Interpolation = Interpolation
    }
    ;
    this.render = function() {
        Render.tick();
        Global.TIME = Date.now();
        _physics.update();
        _behavior.update();
        var obj = _objects.start();
        while (obj) {
            obj.render();
            obj = _objects.next()
        }
    }
    ;
    this.setTouch = function(data) {
        Global.TOUCH.x = data.x;
        Global.TOUCH.y = data.y;
        Global.MOBILE = data.mobile
    }
    ;
    this.upload = function(data) {
        var obj = new LineAnimationObject(data.array,data.__id,data.pos,data.radius,data.face);
        _objects.push(obj)
    }
    ;
    this.recycle = function(data) {
        var obj = _objects.start();
        while (obj) {
            if (obj.id == data.__id) {
                obj.recycle(data.array)
            }
            obj = _objects.next()
        }
    }
    ;
    this.remove = function(data) {
        var removeObj = function(obj) {
            _objects.remove(obj);
            obj.destroy()
        };
        var obj = _objects.start();
        while (obj) {
            if (obj.id == data.__id) {
                return removeObj(obj)
            }
            obj = _objects.next()
        }
    }
    ;
    this.hit = function(data) {
        var obj = _objects.start();
        while (obj) {
            if (obj.id == data.line) {
                obj.hit()
            }
            obj = _objects.next()
        }
    }
    ;
    Global.send = function(array, id, type) {
        _buffer.length = 0;
        _buffer.push(array.buffer);
        _msg.type = type || null;
        _msg.array = array;
        _msg.__id = id;
        emit("transfer", _msg, _buffer)
    }
});
Class(function Loader() {
    Inherit(this, Controller);
    var _this = this;
    var $container, _view, _loader;
    (function() {
        initContainer();
        style();
        initView();
        initLoader();
        addListeners()
    }
    )();
    function initContainer() {
        $container = _this.container;
        Stage.add($container)
    }
    function style() {
        $container.size("100%").css({
            background: "#fff"
        }).setZ(1)
    }
    function initView() {
        _view = _this.initClass(LoaderView)
    }
    function initLoader() {
        var paths = AssetUtil.loadAssets(["assets"]);
        _loader = _this.initClass(AssetLoader, paths)
    }
    function addListeners() {
        _loader.events.add(HydraEvents.PROGRESS, progress);
        _loader.events.add(HydraEvents.COMPLETE, loadComplete);
        _this.events.subscribe(KandinskyEvents.SOUNDS_LOADED, soundsLoaded)
    }
    function progress(e) {
        _view.update(e.percent)
    }
    function loadComplete() {
        if (window.parent) {
            window.parent.postMessage("loaded", "*");
            if (Mobile.os == "iOS") {
                __window.bind("touchend", checkIosTouch)
            } else {
                window.parent.postMessage("ready", "*")
            }
        }
        Sound.loadData();
        _this.delayedCall(function() {
            _this.minimumTimePassed = true
        }, 2000)
    }
    function soundsLoaded() {
        Container.instance();
        _this.isSoundLoaded = true;
        if (Mobile.os == "iOS" && !_this.isIosReady) {
            return
        }
        if (!_this.minimumTimePassed) {
            _this.delayedCall(function() {
                hideLoader()
            }, 2000);
            return
        }
        hideLoader()
    }
    function checkIosTouch() {
        _this.delayedCall(function() {
            if (Howler._iOSEnabled) {
                __window.unbind("touchend", checkIosTouch);
                iosReady()
            }
        }, 100)
    }
    function iosReady() {
        _this.isIosReady = true;
        window.parent.postMessage("ready", "*");
        if (!_this.isSoundLoaded) {
            return
        }
        if (!_this.minimumTimePassed) {
            _this.delayedCall(function() {
                hideLoader()
            }, 2000);
            return
        }
        hideLoader()
    }
    function hideLoader() {
        $container.tween({
            opacity: 0
        }, 700, "easeInCubic", function() {
            _this.events.fire(Loader.COMPLETE);
            _this.destroy()
        })
    }
}, function() {
    Loader.COMPLETE = "loader_complete"
});
Class(function Playback() {
    Inherit(this, Controller);
    var _this = this;
    var _min, _max, _threshold, _restart;
    var _trigger = 0;
    var _chords = [];
    (function() {
        addListeners()
    }
    )();
    function calculateBounds() {
        _min = 9999;
        _max = 0;
        var l = Drawing.instance().lines.start();
        while (l) {
            if (!l.isUndo) {
                _min = Math.min(_min, l.x);
                _max = Math.max(_max, l.x)
            }
            l = Drawing.instance().lines.next()
        }
        _threshold = (_max - _min) * 0.07
    }
    function calculateGroups() {
        _chords.length = 0;
        var ordered = [];
        var l = Drawing.instance().lines.start();
        while (l) {
            if (!l.isUndo) {
                ordered.push(l)
            }
            l = Drawing.instance().lines.next()
        }
        ordered.sort(function(a, b) {
            return a.x - b.x
        });
        ordered.forEach(function(l) {
            var newChord = true;
            _chords.forEach(function(c) {
                if (Math.abs(c[0].x - l.x) < _threshold) {
                    newChord = false;
                    c.push(l)
                }
            });
            if (newChord) {
                _chords.push([l])
            }
        })
    }
    function startMetronome() {
        _trigger = 0;
        var ms = (function(l) {
            if (l <= 2) {
                return 1000
            }
            if (l == 3) {
                return 1330
            }
            if (l == 4) {
                return 1446
            }
            if (l == 5) {
                return 1665
            }
            return 308 * l
        }
        )(_chords.length);
        var time = ms / _chords.length;
        Data.Metronome.start(time, hit);
        hit()
    }
    function hit() {
        if (_restart) {
            _restart = false;
            Data.Metronome.stop();
            startMetronome();
            return;
            return hit()
        }
        if (_chords[_trigger]) {
            _chords[_trigger].forEach(function(line) {
                line.play()
            })
        }
        _trigger++;
        if (_trigger == _chords.length) {
            _trigger = 0
        }
    }
    function addListeners() {
        _this.events.subscribe(KandinskyEvents.PLAY_PAUSE, playPause)
    }
    function playPause(e) {
        if (e.type == "play") {
            calculateBounds();
            calculateGroups();
            startMetronome()
        } else {
            Data.Metronome.stop()
        }
    }
    this.updateGroups = function() {
        calculateBounds();
        calculateGroups();
        _restart = true
    }
}, "Singleton");
Class(function Playground() {
    Inherit(this, Controller);
    var _this = this;
    var $container;
    var _scene, _renderer, _camera, _view;
    (function() {
        Global.PLAYGROUND = true;
        initContainer();
        initThree();
        initView();
        addListeners();
        Render.start(loop)
    }
    )();
    function initContainer() {
        $container = _this.container;
        $container.css({
            position: "static"
        });
        Stage.add($container)
    }
    function initThree() {
        _scene = new THREE.Scene();
        _camera = new THREE.OrthographicCamera(0,Stage.width,0,Stage.height,1,1000);
        _renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        _renderer.setPixelRatio(2);
        _renderer.setSize(Stage.width, Stage.height);
        _this.scene = _scene;
        _renderer.setClearColor(15658734);
        _camera.position.z = 10;
        $container.add(_renderer.domElement)
    }
    function initView() {
        var hash = Hydra.HASH.split("/")[1].split("?")[0];
        var view = "Playground" + hash;
        if (!hash) {
            throw "No view for Playground found on Hash"
        }
        if (!window[view]) {
            throw "No Playground class " + view + " found."
        }
        _view = _this.initClass(window[view], _camera);
        _view.object3D && _scene.add(_view.object3D)
    }
    function loop() {
        _renderer.render(_scene, _camera)
    }
    function addListeners() {
        _this.events.subscribe(HydraEvents.RESIZE, resizeHandler)
    }
    function resizeHandler() {
        _camera.left = 0;
        _camera.right = Stage.width;
        _camera.top = 0;
        _camera.bottom = Stage.height;
        _camera.updateProjectionMatrix();
        _renderer.setSize(Stage.width, Stage.height);
        if (!_camera.custom) {
            _camera.aspect = Stage.width / Stage.height;
            _camera.updateProjectionMatrix()
        }
    }
}, "singleton");
Class(function Renderer() {
    Inherit(this, Component);
    var _this = this;
    var _scene, _renderer, _camera, _dpr;
    var _disable = 0;
    (function() {
        initThree();
        initView();
        addListeners();
        resizeHandler();
        Render.start(loop)
    }
    )();
    function initThree() {
        _scene = new THREE.Scene();
        _camera = new THREE.OrthographicCamera(0,Stage.width,0,Stage.height,1,1000);
        _renderer = new THREE.WebGLRenderer({
            antialias: checkIfAntialias(),
            preserveDrawingBuffer: true
        });
        _renderer.setPixelRatio(getPixelRatio());
        _renderer.setSize(Stage.width, Stage.height);
        _this.scene = _scene;
        _renderer.setClearColor(16777215);
        _camera.position.z = 10;
        _this.container = _renderer.domElement
    }
    function initView() {
        Drawing.instance().addListeners(_this.container);
        _scene.add(Drawing.instance().object3D)
    }
    function loop() {
        _renderer.clear();
        _renderer.render(_scene, _camera);
        if (Render.FPS < 50) {
            _disable++;
            if (_disable > 60) {
                _dpr = 1;
                resizeHandler()
            }
        } else {
            _disable--;
            if (_disable < 0) {
                _disable = 0
            }
        }
    }
    function checkIfAntialias() {
        if (Device.mobile) {
            return true
        }
        if (Device.system.os.strpos("windows")) {
            return false
        }
        if (Device.detectGPU("intel")) {
            return false
        }
        return true
    }
    function getPixelRatio() {
        if (_dpr) {
            return _dpr
        }
        if (Device.detectGPU("intel") || Device.system.os.strpos("windows")) {
            if (Stage.width > 2000) {
                return 1
            }
        }
        return 2
    }
    function addListeners() {
        _this.events.subscribe(HydraEvents.RESIZE, resizeHandler)
    }
    function resizeHandler() {
        _camera.left = 0;
        _camera.right = Stage.width;
        _camera.top = 0;
        _camera.bottom = Stage.height;
        _camera.updateProjectionMatrix();
        _renderer.setPixelRatio(getPixelRatio());
        _renderer.setSize(Stage.width, Stage.height);
        if (!_camera.custom) {
            _camera.aspect = Stage.width / Stage.height;
            _camera.updateProjectionMatrix()
        }
    }
});
Class(function UI() {
    Inherit(this, Controller);
    var _this = this;
    var $container;
    var _view;
    (function() {
        initContainer();
        initView();
        addListeners()
    }
    )();
    function initContainer() {
        $container = _this.container;
        $container.css({
            position: "static"
        }).hide()
    }
    function initView() {
        _view = _this.initClass(BtnContainer)
    }
    function addListeners() {
        _this.events.subscribe(Loader.COMPLETE, animateIn)
    }
    function animateIn() {
        _view.animateIn();
        $container.show()
    }
});
Class(function Line(_object3D) {
    Inherit(this, Component);
    var _this = this;
    var _animator, _geoHandler, _face;
    var _lineWidth = 0.04;
    var _v2 = new Vector2();
    var _gesture = "line";
    (function() {
        init();
        addListeners()
    }
    )();
    function init() {
        _this.geometry = new THREE.Geometry();
        _this.curve = new THREE.MeshLine();
        _this.material = new THREE.MeshLineMaterial({
            useMap: 0,
            color: new THREE.Color(Config.COLORS[Config.SCHEME].line),
            sizeAttenuation: 0,
            lineWidth: _lineWidth,
            resolution: new THREE.Vector2(Stage.width,Stage.height),
            transparent: true
        });
        _geoHandler = _this.initClass(LineGeometry, _this, _object3D);
        _this.addPoint = _geoHandler.addPoint;
        _this.calculateLine = _geoHandler.calculateLine;
        _this.simplifyLine = _geoHandler.simplifyLine;
        _this.smoothLine = _geoHandler.smoothLine;
        _this.center = _geoHandler.center;
        _this.updatePosition = _geoHandler.updatePosition
    }
    function addListeners() {
        _this.events.subscribe(KandinskyEvents.CHANGE_SOUND, changeColor)
    }
    function changeColor(e) {
        if (_this.isUndo) {
            return
        }
        if (_this.isChangingColor) {
            _this.material.uniforms.color.value = _this.material.uniforms.color2.value.clone()
        }
        _this.isChangingColor = true;
        _this.material.uniforms.color2.value = new THREE.Color(Config.COLORS[Config.SCHEME][_gesture]);
        _this.material.uniforms.colorTransition.value = 0;
        if (_this.material.uniforms.colorTransition.stopTween) {
            _this.material.uniforms.colorTransition.stopTween()
        }
        TweenManager.tween(_this.material.uniforms.colorTransition, {
            value: 3.2
        }, e == "local" ? 1000 : 2000, "easeOutCubic", 0, function() {
            if (_this.isUndo || !_this.material) {
                return
            }
            _this.material.uniforms.color.value = _this.material.uniforms.color2.value.clone();
            _this.material.uniforms.colorTransition.value = 0;
            _this.isChangingColor = false
        });
        if (_face) {
            _face.changeColor()
        }
    }
    function addFace() {
        _this.curve.mesh.geometry.computeBoundingSphere();
        if (_this.curve.mesh.geometry.boundingSphere.radius < 40) {
            return
        }
        _face = _this.initClass(Face, _this);
        _object3D.add(_face.object3D);
        _this.faceVectors = _face.getPositions();
        _this.updateFace = _face.updatePositions
    }
    this.resize = function() {
        _this.material.uniforms.resolution.value.set(Stage.width, Stage.height)
    }
    ;
    this.initAnimator = function() {
        _animator = _this.initClass(LineAnimator, _this);
        _this.animator = _animator
    }
    ;
    this.setGesture = function(shape) {
        _gesture = shape;
        _this.isGesture = true;
        changeColor("local");
        if (_gesture == "circle") {
            defer(addFace)
        }
    }
    ;
    this.undo = function() {
        _this.isUndo = true;
        var transition = {
            x: 1
        };
        var total = _this.geometry.vertices.length;
        TweenManager.tween(transition, {
            x: 0
        }, 200 + total * 5, "easeOutCubic", 0, function() {
            _this.destroy()
        }, function() {
            var index = Math.round(transition.x * total);
            _this.geometry.vertices.splice(index, total);
            _this.calculateLine(true)
        });
        if (_face) {
            _face.animateOut()
        }
    }
    ;
    this.fadeOut = function() {
        _this.isUndo = true;
        var transition = {
            x: 1
        };
        TweenManager.tween(transition, {
            x: 0
        }, 700, "easeOutCubic", 0, function() {
            _this.destroy()
        }, function() {
            _this.material.uniforms.fadeOut.value = transition.x
        });
        if (_face) {
            _face.animateOut()
        }
    }
    ;
    this.hitTest = function(mouse) {
        if (_this.isGesture) {
            var radius = _this.geometry.boundingSphere.radius;
            _v2.subVectors(mouse, _this.curve.mesh.position);
            return _v2.lengthSq() < radius * radius
        }
        return _geoHandler.lineHitTest(mouse)
    }
    ;
    this.play = function(type) {
        _animator.hit();
        _animator.startWobble(300);
        if (_face) {
            _face.play()
        }
        if (type !== "silent") {
            Sound.play(_gesture, _this.curve.mesh.position.y, 1)
        }
    }
    ;
    this.getSound = function() {
        return Sound.getSound(_gesture, _this.curve.mesh.position.y, 1);
    };
    this.onDestroy = function() {
        _this.isUndo = true;
        if (_this.material && _this.material.uniforms.colorTransition.stopTween) {
            _this.material.uniforms.colorTransition.stopTween()
        }
        if (_this.curve.mesh) {
            _object3D.remove(_this.curve.mesh)
        }
        if (_this.group) {
            _this.group.removeLine(_this)
        }
        if (_face) {
            _object3D.remove(_face.object3D)
        }
    }
});
Class(function LineGroup() {
    Inherit(this, Component);
    var _this = this;
    var _lines = [];
    this.object3D = new THREE.Object3D();
    this.x = null;
    var _hitTest = new Vector2();
    (function() {}
    )();
    function calculateX() {
        _this.x = 0;
        _lines.forEach(function(line) {
            _this.x += line.curve.mesh.position.x
        });
        _this.x /= _lines.length
    }
    this.addLine = function(line) {
        _lines.push(line);
        calculateX()
    }
    ;
    this.tap = function() {
        if (_this.hasPlayed) {
            return
        }
        _this.hasPlayed = true;
        _lines.forEach(function(line) {
            line.play()
        });
        defer(function() {
            _this.hasPlayed = false
        })
    }
    ;
    this.hitTestLine = function(newLine) {
        var hit = false;
        _lines.every(function(line) {
            newLine.geometry.vertices.every(function(v) {
                _hitTest.copyFrom(v);
                hit = line.hitTest(_hitTest);
                return !hit
            });
            return !hit
        });
        return hit
    }
    ;
    this.removeLine = function(line) {
        _lines.findAndRemove(line);
        if (_lines.length === 0) {
            _this.events.fire(KandinskyEvents.EMPTY_GROUP, _this)
        }
    }
});
Class(function LineAnimator(line) {
    Inherit(this, Component);
    var _this = this;
    var _wobbleFade = {
        value: 0
    };
    (function() {
        LineAnimation.instance();
        defer(init)
    }
    )();
    function init() {
        var vertices = line.geometry.vertices;
        var array = new Float32Array(vertices.length * 2);
        for (var i = 0; i < vertices.length; i++) {
            var v = vertices[i];
            array[i * 2 + 0] = v.x;
            array[i * 2 + 1] = v.y
        }
        LineAnimation.instance().upload(line, array, _this)
    }
    function sineAnim(t, min, max) {
        var range = max - min;
        return min + range * 0.5 * (Math.sin(t) + 1)
    }
    function wobble(t, dt) {
        var width = line.curve.geometry.attributes.width;
        var drawwidth = line.curve.geometry.attributes.drawwidth;
        var speed = 0.08;
        var waveLength = 0.02;
        for (var i = 0; i < width.array.length; i += 2) {
            var t = (i + dt * speed) * waveLength;
            var value = drawwidth.array[i] * sineAnim(dt * 0.04, 0.6, 1.3) * 0.7 * (Math.sin(t) * Math.sin(t * 3) * Math.sin(t * 8) + 0.2);
            width.array[i] = drawwidth.array[i] + _wobbleFade.value * value;
            width.array[i + 1] = drawwidth.array[i] + _wobbleFade.value * value
        }
        width.needsUpdate = true
    }
    this.receive = function(data, id, type) {
        if (type == "face") {
            if (line.updateFace) {
                line.updateFace(data)
            }
        } else {
            var vertices = line.geometry.vertices;
            for (var i = 0; i < vertices.length; i++) {
                var v = vertices[i];
                v.x = data[i * 2 + 0];
                v.y = data[i * 2 + 1]
            }
            line.updatePosition()
        }
    }
    ;
    this.hit = function() {
        LineAnimation.instance().hit(line)
    }
    ;
    this.startWobble = function(stopDelay) {
        Render.start(wobble);
        TweenManager.tween(_wobbleFade, {
            value: 1
        }, 200, "easeOutCubic");
        if (typeof stopDelay == "number") {
            _this.delayedCall(_this.stopWobble, stopDelay)
        }
    }
    ;
    this.stopWobble = function() {
        TweenManager.tween(_wobbleFade, {
            value: 0
        }, 500, "easeInOutCubic", function() {
            Render.stop(wobble)
        })
    }
    ;
    this.onDestroy = function() {
        Render.stop(wobble);
        LineAnimation.instance().remove(line.__id)
    }
});
Class(function Face(_line) {
    Inherit(this, Component);
    var _this = this;
    var _mouth, _leftEye, _rightEye, _leftEyeShader, _rightEyeShader, _mouthShader, _distance, _scale, _animation, _colorTween;
    this.object3D = new THREE.Object3D();
    var _origin = new Vector3();
    var _rotation = Utils.doRandom(-10, 10) * Math.PI / 180;
    (function() {
        getPosition();
        addEyes();
        addMouth();
        initAnimation();
        animateIn()
    }
    )();
    function getPosition() {
        if (!_line) {
            return temporaryFace()
        }
        _this.object3D.position.copy(_line.curve.mesh.position);
        _origin.copyFrom(_line.curve.mesh.position);
        _this.object3D.rotation.z = _rotation;
        var r = _line.curve.mesh.geometry.boundingSphere.radius;
        _scale = Utils.range(r, 60, 200, 1, 3, true);
        _distance = Utils.range(r, 40, 200, 6, 50)
    }
    function temporaryFace() {
        _this.object3D.position.set(-100, -100, 0);
        _origin.copyFrom(_this.object3D.position);
        _scale = 1;
        _distance = 10
    }
    function addEyes() {
        var geometry = new THREE.PlaneBufferGeometry(40 * _scale,40 * _scale,1,1);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));
        _leftEyeShader = _this.initClass(Shader, "eyes", "eyes");
        _leftEyeShader.uniforms = {
            map: {
                type: "t",
                value: Utils3D.getTexture("assets/images/face/eyes_left.png")
            },
            color: {
                type: "c",
                value: new THREE.Color(Config.COLORS[Config.SCHEME].circle)
            },
            offset: {
                type: "v2",
                value: new THREE.Vector2()
            },
            opacity: {
                type: "f",
                value: 0
            }
        };
        _leftEyeShader.material.transparent = true;
        _leftEyeShader.material.depthTest = false;
        _rightEyeShader = _leftEyeShader.clone();
        _rightEyeShader.uniforms.map.value = Utils3D.getTexture("assets/images/face/eyes_right.png");
        _leftEye = new THREE.Mesh(geometry,_leftEyeShader.material);
        _rightEye = new THREE.Mesh(geometry,_rightEyeShader.material);
        _this.object3D.add(_leftEye);
        _this.object3D.add(_rightEye);
        _leftEye.position.y = -_distance;
        _rightEye.position.y = -_distance;
        var closeness = Utils.doRandom(70, 140) / 100;
        _leftEye.position.x = -_distance * closeness;
        _rightEye.position.x = _distance * closeness
    }
    function addMouth() {
        var geometry = new THREE.PlaneBufferGeometry(70 * _scale,70 * _scale,1,1);
        geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));
        _mouthShader = _this.initClass(Shader, "mouth", "mouth");
        _mouthShader.version = Utils.doRandom(1, 2);
        _mouthShader.uniforms = {
            map: {
                type: "t",
                value: Utils3D.getTexture("assets/images/face/mouth_" + _mouthShader.version + ".png")
            },
            offset: {
                type: "v2",
                value: new THREE.Vector2()
            },
            opacity: {
                type: "f",
                value: 0
            }
        };
        if (!_line) {
            _mouthShader.uniforms.upload1 = {
                type: "t",
                value: Utils3D.getTexture("assets/images/face/mouth_1.png")
            };
            _mouthShader.uniforms.upload2 = {
                type: "t",
                value: Utils3D.getTexture("assets/images/face/mouth_2.png")
            }
        }
        _mouthShader.material.transparent = true;
        _mouthShader.material.depthTest = false;
        _mouth = new THREE.Mesh(geometry,_mouthShader.material);
        _this.object3D.add(_mouth);
        var closeness = Utils.doRandom(60, 120) / 100;
        _mouth.position.y = Math.max(7, _distance * closeness)
    }
    function initAnimation() {
        _animation = _this.initClass(FaceAnimation, _leftEyeShader, _rightEyeShader, _mouthShader);
        _this.play = _animation.play
    }
    function animateIn() {
        _leftEyeShader.tween("opacity", 1, 500, "easeOutCubic");
        _rightEyeShader.tween("opacity", 1, 500, "easeOutCubic");
        _mouthShader.tween("opacity", 1, 500, "easeOutCubic")
    }
    function animateOut() {
        _leftEyeShader.tween("opacity", 0, 500, "easeOutCubic");
        _rightEyeShader.tween("opacity", 0, 500, "easeOutCubic");
        _mouthShader.tween("opacity", 0, 500, "easeOutCubic")
    }
    this.changeColor = function() {
        if (_line.isUndo) {
            return
        }
        var temp = {
            x: 0
        };
        var oldColor = _leftEyeShader.uniforms.color.value;
        var newColor = new THREE.Color(Config.COLORS[Config.SCHEME].circle);
        var onUpdate = function() {
            if (!_leftEyeShader || !_leftEyeShader.uniforms || !_leftEyeShader.uniforms.color) {
                return
            }
            _leftEyeShader.uniforms.color.value.r = Utils.range(temp.x, 0, 1, oldColor.r, newColor.r);
            _leftEyeShader.uniforms.color.value.g = Utils.range(temp.x, 0, 1, oldColor.g, newColor.g);
            _leftEyeShader.uniforms.color.value.b = Utils.range(temp.x, 0, 1, oldColor.b, newColor.b);
            _rightEyeShader.uniforms.color.value.r = Utils.range(temp.x, 0, 1, oldColor.r, newColor.r);
            _rightEyeShader.uniforms.color.value.g = Utils.range(temp.x, 0, 1, oldColor.g, newColor.g);
            _rightEyeShader.uniforms.color.value.b = Utils.range(temp.x, 0, 1, oldColor.b, newColor.b)
        };
        var onComplete = function() {};
        _colorTween = TweenManager.tween(temp, {
            x: 1
        }, 2000, "easeInOutCubic", onComplete, onUpdate)
    }
    ;
    this.getPositions = function() {
        return [_leftEye.position, _rightEye.position, _mouth.position]
    }
    ;
    this.updatePositions = function(data) {
        _leftEye.position.set(data[0], data[1], 0);
        _rightEye.position.set(data[2], data[3], 0);
        _mouth.position.set(data[4], data[5], 0)
    }
    ;
    this.animateOut = animateOut;
    this.onDestroy = function() {
        if (_colorTween && _colorTween.stopTween) {
            _colorTween.stopTween()
        }
    }
});
Class(function FaceAnimation(_leftEyeShader, _rightEyeShader, _mouthShader) {
    Inherit(this, Component);
    var _this = this;
    var _eyesTween, _mouthTween, _idleTimer;
    var _animations = {
        eyes: {
            blink: {
                frames: [0, 1, 2, 2, 2, 1, 0],
                duration: 200
            },
            blink2: {
                frames: [6, 7, 8, 8, 7, 6],
                duration: 200
            },
            blink4: {
                frames: [0, 1, 2, 1, 5],
                duration: 200
            },
            close: {
                frames: [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0],
                duration: 500
            },
            close2: {
                frames: [7, 8, 8, 8, 8, 8, 8, 8, 2, 2, 7, 6],
                duration: 500
            },
        },
        mouth: {
            sing: {
                frames: [0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 9],
                duration: 500
            },
            sing2: {
                frames: [4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 3, 9],
                duration: 500
            },
        }
    };
    var _selections = {
        idleEyes: ["blink", "blink2", "blink4", ],
        playEyes: ["close", "close2", ],
        playMouth: ["sing", "sing2", ]
    };
    (function() {
        _idleTimer = _this.delayedCall(idle, Utils.doRandom(3000, 7000));
        defer(play)
    }
    )();
    function animate(type, animation, callback) {
        if (_this.isPlayingSound) {
            return
        }
        var anim = _animations[type][animation];
        anim.x = 0;
        anim.index = 0;
        anim.lastIndex = -1;
        var onUpdate = function() {
            anim.index = Math.round(anim.x);
            if (anim.frames[anim.index] === anim.frames[anim.lastIndex]) {
                return
            }
            anim.lastIndex = anim.index;
            updateSprite(anim.frames[anim.index], type)
        };
        var onComplete = function() {
            anim.x = 0;
            if (typeof callback == "function") {
                callback()
            }
        };
        if (type == "eyes") {
            if (_eyesTween && _eyesTween.stop) {
                _eyesTween.stop()
            }
            _eyesTween = TweenManager.tween(anim, {
                x: anim.frames.length - 1
            }, anim.duration, "linear", onComplete, onUpdate)
        } else {
            if (_mouthTween && _mouthTween.stop) {
                _mouthTween.stop()
            }
            _mouthTween = TweenManager.tween(anim, {
                x: anim.frames.length - 1
            }, anim.duration, "linear", onComplete, onUpdate)
        }
    }
    function updateSprite(index, type) {
        if (!_leftEyeShader || !_leftEyeShader.uniforms) {
            return
        }
        var x = (index / 3) % 1;
        var y = 0.666666 - (Math.floor(index / 3) / 3);
        if (type == "eyes") {
            _leftEyeShader.uniforms.offset.value.set(x, y);
            _rightEyeShader.uniforms.offset.value.set(x, y)
        } else {
            _mouthShader.uniforms.offset.value.set(x, y)
        }
    }
    function idle() {
        var sel = _selections.idleEyes;
        var randomAnim = sel[Utils.doRandom(0, sel.length - 1)];
        animate("eyes", randomAnim);
        _idleTimer = _this.delayedCall(idle, Utils.doRandom(3000, 7000))
    }
    function play() {
        _this.isPlayingSound = false;
        var sel = _selections.playEyes;
        var randomAnim = sel[Utils.doRandom(0, sel.length - 1)];
        animate("eyes", randomAnim);
        sel = _selections.playMouth;
        randomAnim = sel[Utils.doRandom(0, sel.length - 1)];
        animate("mouth", randomAnim, function() {
            _this.isPlayingSound = false
        });
        _this.isPlayingSound = true
    }
    this.play = play;
    this.onDestroy = function() {
        if (_eyesTween && _eyesTween.stop) {
            _eyesTween.stop()
        }
        if (_mouthTween && _mouthTween.stop) {
            _mouthTween.stop()
        }
    }
});
Class(function LineGeometry(_line, _object3D) {
    Inherit(this, Component);
    var _this = this;
    var _v2 = new Vector2();
    var _v2Pos = new Vector2();
    (function() {}
    )();
    this.addPoint = function(p, velocity) {
        var v = new THREE.Vector3(p.x,p.y,0);
        v.velocity = velocity;
        _line.geometry.vertices.push(v)
    }
    ;
    this.calculateLine = function(smoothed) {
        var calculateLineThickness = function(percentage, i, total) {
            var taper = (function() {
                var startTaper = smoothed ? 10 : 6;
                var endTaper = smoothed ? 10 : 6;
                if (smoothed && total < startTaper) {
                    startTaper *= (total / startTaper)
                }
                if (smoothed && total < endTaper) {
                    endTaper *= (total / endTaper)
                }
                var amount = Math.min(Math.min(1, i / startTaper), Math.min(1, (total - i - 1) / endTaper));
                amount -= 1;
                amount *= amount;
                return 1 - amount
            }
            )();
            return taper * (0.8 + 1.5 * (1 - _line.geometry.vertices[i].velocity))
        };
        _line.curve.setGeometry(_line.geometry, calculateLineThickness);
        if (!_this.added && _line.geometry.vertices.length > 2 && !_line.curve.mesh) {
            _line.curve.mesh = new THREE.Mesh(_line.curve.geometry,_line.material);
            _line.curve.mesh.frustumCulled = false;
            _object3D.add(_line.curve.mesh);
            _this.added = true
        }
    }
    ;
    this.simplifyLine = function() {
        if (!_line.curve.mesh) {
            return "too_short"
        }
        _line.geometry.vertices = LineOptim.simplify(_line.geometry.vertices)
    }
    ;
    this.smoothLine = function() {
        _line.geometry.vertices = LineOptim.smooth(_line.geometry.vertices)
    }
    ;
    this.center = function() {
        _line.geometry.computeBoundingSphere();
        var center = _line.geometry.boundingSphere.center;
        var centerClone = center.clone();
        var matrix = new THREE.Matrix4();
        matrix.set(1, 0, 0, -center.x, 0, 1, 0, -center.y, 0, 0, 1, -center.z, 0, 0, 0, 1);
        _line.geometry.applyMatrix(matrix);
        _line.curve.mesh.position.set(centerClone.x, centerClone.y, 0);
        _line.x = _line.curve.mesh.position.x;
        _line.geometryClone = _line.geometry.clone()
    }
    ;
    this.updatePosition = function() {
        if (_this.isUndo) {
            return
        }
        var copyToBufferIndex = function(v, buffer, i) {
            if (_line.isUndo) {
                return
            }
            buffer.array[(i * 2 + 0) * 3 + 0] = v.x;
            buffer.array[(i * 2 + 0) * 3 + 1] = v.y;
            buffer.array[(i * 2 + 0) * 3 + 2] = v.z;
            buffer.array[(i * 2 + 1) * 3 + 0] = v.x;
            buffer.array[(i * 2 + 1) * 3 + 1] = v.y;
            buffer.array[(i * 2 + 1) * 3 + 2] = v.z
        };
        var position = _line.curve.geometry.attributes.position;
        var next = _line.curve.geometry.attributes.next;
        var previous = _line.curve.geometry.attributes.previous;
        copyToBufferIndex(_line.geometry.vertices[0], previous, 0);
        var l = _line.geometry.vertices.length;
        for (var i = 0; i < l; i++) {
            var v = _line.geometry.vertices[i];
            copyToBufferIndex(v, position, i);
            if (i !== l - 1) {
                copyToBufferIndex(v, previous, i + 1)
            }
            if (i !== 0) {
                copyToBufferIndex(v, next, i - 1)
            }
        }
        copyToBufferIndex(_line.geometry.vertices[l - 1], next, l - 1);
        position.needsUpdate = true;
        next.needsUpdate = true;
        previous.needsUpdate = true
    }
    ;
    this.lineHitTest = function(mouse) {
        var hit = false;
        _line.geometryClone.vertices.every(function(v) {
            _v2Pos.copyFrom(v);
            _v2Pos.add(_line.curve.mesh.position);
            _v2.subVectors(mouse, _v2Pos);
            hit = _v2.lengthSq() < 1000;
            return !hit
        });
        return hit
    }
});
Class(function LoaderView() {
    Inherit(this, View);
    var _this = this;
    var $this, $gif, $spinner;
    var _loaded = 0;
    var _loadedTarget = 0;
    (function() {
        initHTML();
        initSVG();
        style();
        Render.start(loop)
    }
    )();
    function initHTML() {
        $this = _this.element;
        $gif = $this.create("LoaderGif");
        $spinner = $this.create("Spinner")
    }
    function initSVG() {
        var ns = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(ns, "svg");
        svg.setAttributeNS(null, "width", 100);
        svg.setAttributeNS(null, "height", 100);
        svg.setAttributeNS(null, "viewBox", "-50 -50 100 100");
        $spinner.add(svg);
        var circle = document.createElementNS(ns, "circle");
        svg.appendChild(circle);
        circle.setAttributeNS(null, "cx", 0);
        circle.setAttributeNS(null, "cy", 0);
        circle.setAttributeNS(null, "r", 26);
        circle.setAttributeNS(null, "stroke", "#ccc");
        circle.setAttributeNS(null, "stroke-width", "4");
        circle.setAttributeNS(null, "stroke-linecap", "round");
        circle.setAttributeNS(null, "fill", "none");
        $(svg).css({
            width: "100%",
            height: "100%"
        })
    }
    function style() {
        $this.css({
            position: "static"
        });
        $gif.size(190, 190).center().bg("assets/images/loader/tutorial.gif", "cover").css({
            top: "40%"
        });
        $spinner.size(120, 120).center().css({
            top: "70%"
        })
    }
    function loop() {
        _loaded += (_loadedTarget - _loaded) * 0.2;
        if (Math.round(100 * _loaded) == 100) {
            Render.stop(loop);
            _this.events.fire(HydraEvents.COMPLETE)
        }
    }
    this.update = function(e) {
        _loadedTarget = e
    }
});
Class(function PlaygroundDraw() {
    Inherit(this, Component);
    var _this = this;
    this.object3D = new THREE.Object3D();
    (function() {
        init()
    }
    )();
    function init() {
        var drawing = _this.initClass(Drawing);
        _this.object3D.add(drawing.object3D)
    }
});
Class(function BtnContainer() {
    Inherit(this, View);
    var _this = this;
    var $this;
    var _playBtn, _undoBtn, _videoBtn, _colorContainer;
    (function() {
        initHTML();
        initViews();
        addHandlers();
        resize()
    }
    )();
    function initHTML() {
        $this = _this.element;
        $this.size(240, 105).css({
            right: 0,
            left: 0,
            bottom: 25,
            margin: "auto",
            transformOrigin: "50% 100%"
        })
    }
    function initViews() {
        _colorContainer = _this.initClass(ColorContainer);
        _playBtn = _this.initClass(PlayBtn);
        _undoBtn = _this.initClass(UndoBtn);
        _videoBtn = _this.initClass(VideoBtn);
    }
    function addHandlers() {
        _this.events.subscribe(HydraEvents.RESIZE, resize)
    }
    function resize() {
        var s = Utils.range(Stage.width, 300, 800, 0.6, 1, true);
        $this.transform({
            scale: s
        })
    }
    this.animateIn = function() {
        _playBtn.animateIn();
        _undoBtn.animateIn();
        _videoBtn.animateIn();
        _colorContainer.animateIn()
    }
});
Class(function ColorBtn(_index) {
    Inherit(this, View);
    var _this = this;
    var $this, $left, $right;
    this.index = _index;
    (function() {
        initHTML();
        style();
        addListeners()
    }
    )();
    function initHTML() {
        $this = _this.element;
        $this.mouseEnabled(false);
        $left = $this.create("Left");
        $right = $this.create("Left")
    }
    function style() {
        $this.size(50, 50);
        $left.size("50%", "100%").css({
            left: 0,
            top: 0,
            background: "#" + Config.COLORS[_index].triangle.toString(16),
            borderRadius: "1000px 0 0 1000px"
        });
        $right.size("50%", "100%").css({
            right: 0,
            top: 0,
            background: "#" + Config.COLORS[_index].circle.toString(16),
            borderRadius: "0 1000px 1000px 0"
        })
    }
    function addListeners() {
        $this.interact(null, click);
        $this.hit.css({
            borderRadius: "1000px"
        })
    }
    function click(e) {
        _this.events.fire(HydraEvents.CLICK, {
            index: _index
        })
    }
    this.activate = function() {
        $this.mouseEnabled(true);
        $this.setZ(10)
    }
    ;
    this.deactivate = function() {
        $this.mouseEnabled(false);
        $this.setZ(1)
    }
    ;
    this.hit = function() {
        $this.stopTween().transform({
            scale: 1.25
        });
        $this.tween({
            scale: 1,
            damping: 0.4
        }, 0.75, "spring")
    }
});
Class(function ColorContainer() {
    Inherit(this, View);
    var _this = this;
    var $this, _current, _svg;
    var _btns = [];
    TweenManager.addCustomEase({
        name: "easeOutBrad",
        curve: "cubic-bezier(.36,1.91,.56,1)"
    });
    TweenManager.addCustomEase({
        name: "easeInBrad",
        curve: "cubic-bezier(.53,-0.85,.58,1)"
    });
    (function() {
        initHTML();
        initBtns();
        style();
        addListeners()
    }
    )();
    function initHTML() {
        $this = _this.element;
        $this.hide()
    }
    function initBtns() {
        for (var i = 0; i < 3; i++) {
            var btn = _this.initClass(ColorBtn, i, null);
            $this.add(btn);
            _btns.push(btn);
            if (i > 0) {
                btn.element.hide()
            }
        }
        _current = _btns[0];
        _current.activate()
    }
    function style() {
        $this.size(50, 50).center().css({
            marginLeft: -120
        })
    }
    function addListeners() {
        _btns.forEach(function(btn) {
            btn.events.add(HydraEvents.CLICK, buttonClick)
        })
    }
    function buttonClick(e) {
        var index = e.index;
        if (!_this.isOpen) {
            if (index == _current.index) {
                open();
                _current.hit()
            }
            return
        }
        if (_current == _btns[index]) {
            return
        }
        _current = _btns[index];
        Config.SCHEME = index;
        _this.events.fire(KandinskyEvents.CHANGE_SOUND)
    }
    function open() {
        _this.isOpen = true;
        var i = 0;
        _btns.every(function(btn) {
            if (btn == _current) {
                return true
            }
            i++;
            btn.element.show();
            btn.activate();
            _current.css({
                zIndex: 100
            });
            btn.element.stopTween().transform({
                y: 0,
                scale: 0.5
            });
            btn.tween({
                y: -(i * 58.5),
                scale: 1
            }, 300, "easeOutBrad", 75 * (2 - i));
            return true
        });
        Stage.bind("touchend", deferClose)
    }
    function deferClose() {
        Stage.unbind("touchend", deferClose);
        defer(close)
    }
    function close() {
        _this.isOpen = false;
        _btns.forEach(function(btn, i) {
            if (_current != btn) {
                btn.deactivate()
            } else {
                btn.activate()
            }
            btn.tween({
                y: 0
            }, 275, "easeInBrad", 50 * (i), function() {
                if (_current != btn) {
                    btn.element.hide()
                }
            })
        })
    }
    this.animateIn = function() {
        $this.show();
        $this.transform({
            scale: 0
        });
        $this.tween({
            scale: 1,
            damping: 0.2
        }, 0.75, "spring", 120)
    }
});
Class(function ColorContainerSVG() {
    Inherit(this, View);
    var _this = this;
    var $this;
    var _svg, _left, _right;
    var _open = false;
    (function() {
        initHTML();
        initSVG();
        addListener();
        style()
    }
    )();
    function initHTML() {
        $this = _this.element;
        $this.hide()
    }
    function style() {
        $this.size(50, 50).center().css({
            marginLeft: -120
        })
    }
    function initSVG() {
        _svg = _this.initClass(SVG.Canvas, 50, 50 * 4);
        _svg.element.css({
            bottom: 0
        });
        _left = _this.initClass(GooeyCircles, _svg, "left");
        _right = _this.initClass(GooeyCircles, _svg, "right")
    }
    function addListener() {
        _left.events.add(HydraEvents.CLICK, handleClick);
        _right.events.add(HydraEvents.CLICK, handleClick)
    }
    function handleClick(e) {
        if (_open) {
            _left.currentLayer(e.index);
            _right.currentLayer(e.index);
            _open = false;
            _left.animateOff();
            _right.animateOff();
            if (e.index != Config.SCHEME) {
                Config.SCHEME = e.index;
                _this.events.fire(KandinskyEvents.CHANGE_SOUND)
            }
        } else {
            _open = true;
            _left.animateOn();
            _right.animateOn()
        }
    }
    this.animateIn = function() {
        $this.show();
        $this.transform({
            scale: 0
        });
        $this.tween({
            scale: 1,
            damping: 0.2
        }, 0.75, "spring", 120)
    }
});
Class(function PlayBtn() {
    Inherit(this, View);
    var _this = this;
    var $this, $bg, $play, $pause;
    var _circle;
    TweenManager.addCustomEase({
        name: "easeOutBrad",
        curve: "cubic-bezier(.36,1.91,.56,1)"
    });
    (function() {
        initHTML();
        if (Config.USE_WOBBLE) {
            initCircle()
        }
        addListeners();
        style();
        changeColor()
    }
    )();
    function initHTML() {
        $this = _this.element;
        $this.hide();
        if (!Config.USE_WOBBLE) {
            $bg = $this.create("bg")
        }
        $pause = $this.create("pause");
        $play = $this.create("play")
    }
    function style() {
        $this.size(105, 105).center();
        $bg && $bg.size("100%", "100%").css({
            background: "#" + Config.COLORS[0].circle.toString(16),
            borderRadius: "1000px"
        });
        $pause.size("100%", "100%").bg("assets/images/ui/pause.png").css({
            backgroundSize: "75%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center"
        }).setZ(2);
        $play.size("100%", "100%").bg("assets/images/ui/play.png").css({
            backgroundSize: "60%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "60% 50%"
        }).setZ(2);
        $pause.hide();
        $this.hit.css({
            borderRadius: "1000px"
        })
    }
    function initCircle() {
        _circle = _this.initClass(WobblyCircle, 105)
    }
    function hit() {
        $this.stopTween().transform({
            scale: 1.25
        });
        $this.tween({
            scale: 1,
            damping: 0.2
        }, 0.75, "spring")
    }
    function addListeners() {
        _this.events.subscribe(KandinskyEvents.PLAY_PAUSE, playPause);
        $this.interact(over, click);
        _this.events.subscribe(KandinskyEvents.CHANGE_SOUND, changeColor);
        __window.keyup(keyPress)
    }
    function keyPress(e) {
        if (e.keyCode == 32) {
            click()
        }
    }
    function over(e) {
        _circle && _circle[e.action]()
    }
    function click() {
        _circle && _circle.click();
        $play.stopTween().transform({
            scale: 1.25
        });
        $play.tween({
            scale: 1,
            damping: 0.2
        }, 0.75, "spring");
        $pause.stopTween().transform({
            scale: 1.25
        });
        $pause.tween({
            scale: 1,
            damping: 0.2
        }, 0.75, "spring");
        if ($bg) {
            $bg.stopTween().transform({
                scale: 1.25
            });
            $bg.tween({
                scale: 1,
                damping: 0.2
            }, 0.75, "spring")
        }
        if (Drawing.instance().lines.length < 1) {
            return
        }
        _this.events.fire(KandinskyEvents.PLAY_PAUSE, {
            type: _this.playing ? "pause" : "play"
        })
    }
    function playPause(e) {
        _this.playing = e.type == "play";
        if (e.type == "play") {
            $play.hide();
            $pause.show()
        } else {
            $play.show();
            $pause.hide()
        }
    }
    function changeColor() {
        $bg && $bg.css({
            background: "#" + Config.COLORS[Config.SCHEME].circle.toString(16)
        });
        _circle && _circle.changeColor("#" + Config.COLORS[Config.SCHEME].circle.toString(16))
    }
    this.animateIn = function() {
        $this.show();
        $this.transform({
            scale: 0
        });
        $play.transform({
            scale: 0
        });
        $this.tween({
            scale: 1,
            damping: 0.2
        }, 0.75, "spring");
        $play.tween({
            opacity: 1,
            scale: 1,
            damping: 0.2
        }, 0.7, "spring", 100)
    }
});
Class(function VideoBtn() {
    Inherit(this, View);
    this.exportingVideo=false;
    var _this = this;
    var $this, $bg, $play, $pause;
    var _circle;
    TweenManager.addCustomEase({
        name: "easeOutBrad",
        curve: "cubic-bezier(.36,1.91,.56,1)"
    });
    (function() {
        initHTML();
        if (Config.USE_WOBBLE) {
            initCircle()
        }
        addListeners();
        style();
        changeColor()
    }
    )();
    function initHTML() {
        $this = _this.element;
        $this.hide();
        if (!Config.USE_WOBBLE) {
            $bg = $this.create("bg")
        }
        $pause = $this.create("pause");
        $play = $this.create("play")
    }
    function style() {
        $this.size(105, 105).center().css({
            "margin-left": "150px"
        });
        $bg && $bg.size("100%", "100%").css({
            background: "#" + Config.COLORS[0].circle.toString(16),
            borderRadius: "1000px"
        });
        $pause.size("100%", "100%").bg("assets/images/ui/pause.png").css({
            backgroundSize: "30%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center"
        }).setZ(2);
        $play.size("100%", "100%").css({
            background:'url("'+"data:image/svg+xml,%3Csvg class='icon' viewBox='0 0 1024 1024' xmlns='http://www.w3.org/2000/svg' width='30' height='30'%3E%3Cdefs%3E%3Cstyle/%3E%3C/defs%3E%3Cpath fill='%23FFFFFF' d='M332.32 464.112l144 160a47.952 47.952 0 0 0 71.36 0l144-160a48 48 0 0 0-71.36-64.224L560 466.912V176a48 48 0 1 0-96 0v290.912l-60.32-67.024a48 48 0 1 0-71.36 64.224zM880 560a48 48 0 0 0-48 48v192H192V608a48 48 0 1 0-96 0v240a48 48 0 0 0 48 48h736a48 48 0 0 0 48-48V608a48 48 0 0 0-48-48z'/%3E%3C/svg%3E"+'")',
            backgroundSize: "30% 60%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center"
        }).setZ(2);
        $pause.hide();
        $this.hit.css({
            borderRadius: "1000px"
        })
    }
    function initCircle() {
        _circle = _this.initClass(WobblyCircle, 50)
    }
    function hit() {
        $this.stopTween().transform({
            scale: 1.25
        });
        $this.tween({
            scale: 1,
            damping: 0.2
        }, 0.75, "spring")
    }
    function addListeners() {
        _this.events.subscribe(KandinskyEvents.EXPORT_VIDEO, playPause);
        $this.interact(over, click);
        _this.events.subscribe(KandinskyEvents.CHANGE_SOUND, changeColor);
        __window.keyup(keyPress)
    }
    function keyPress(e) {
        if (e.keyCode == 32) {
            click()
        }
    }
    function over(e) {
        _circle && _circle[e.action]()
    }
    function click() {
        _circle && _circle.click();
        $play.stopTween().transform({
            scale: 1.25
        });
        $play.tween({
            scale: 1,
            damping: 0.2
        }, 0.75, "spring");
        $pause.stopTween().transform({
            scale: 1.25
        });
        $pause.tween({
            scale: 1,
            damping: 0.2
        }, 0.75, "spring");
        if ($bg) {
            $bg.stopTween().transform({
                scale: 1.25
            });
            $bg.tween({
                scale: 1,
                damping: 0.2
            }, 0.75, "spring")
        }
        if (Drawing.instance().lines.length < 1) {
            return
        }
        _this.events.fire(KandinskyEvents.EXPORT_VIDEO, {
            type: _this.exportingVideo ? "pause" : "play"
        })
        //playPause({type: _this.playing ? "pause" : "play"});
    }
    function playPause(e) {
        _this.exportingVideo = e.type == "play";
        if (e.type == "play") {
            $play.hide();
            $pause.show();
            exportingVideo();
        } else {
            if(window.isExportingVideo){
                _this.exportingVideo=true;
            }else{
                $play.show();
                $pause.hide();    
            }
        }
    }
    function changeColor() {
        $bg && $bg.css({
            background: "#" + Config.COLORS[Config.SCHEME].circle.toString(16)
        });
        _circle && _circle.changeColor("#" + Config.COLORS[Config.SCHEME].circle.toString(16))
    }
    this.animateIn = function() {
        $this.show();
        $this.transform({
            scale: 0
        });
        $play.transform({
            scale: 0
        });
        $this.tween({
            scale: 1,
            damping: 0.2
        }, 0.75, "spring");
        $play.tween({
            opacity: 1,
            scale: 1,
            damping: 0.2
        }, 0.7, "spring", 100)
    }
});

Class(function UndoBtn() {
    Inherit(this, View);
    var _this = this;
    var $this, $bg, $icon;
    var _circle;
    TweenManager.addCustomEase({
        name: "quickSlow",
        curve: "cubic-bezier(.45,-0.15,.36,1.16)"
    });
    (function() {
        initHTML();
        if (Config.USE_WOBBLE) {
            initCircle()
        }
        addHandlers();
        style();
        changeColor()
    }
    )();
    function initHTML() {
        $this = _this.element;
        if (!Config.USE_WOBBLE) {
            $bg = $this.create("bg")
        }
        $icon = $this.create("undo-icon")
    }
    function style() {
        $this.size(50, 50).center().css({
            marginLeft: 70
        });
        if (!Config.USE_WOBBLE) {
            $bg.size("100%", "100%").css({
                background: "#" + Config.COLORS[0].circle.toString(16),
                borderRadius: "1000px"
            })
        }
        $icon.size("100%", "100%").bg("assets/images/ui/replay.png").css({
            backgroundSize: "80%",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center"
        }).setZ(2);
        $this.hit.css({
            borderRadius: "1000px"
        })
    }
    function initCircle() {
        _circle = _this.initClass(WobblyCircle, 50)
    }
    function hit() {
        if ($bg) {
            $bg.stopTween().transform({
                scale: 1.25
            });
            $bg.tween({
                scale: 1,
                damping: 0.2
            }, 0.75, "spring")
        }
        $icon.stopTween().transform({
            scale: 1.25
        });
        $icon.tween({
            scale: 1,
            damping: 0.2
        }, 0.75, "spring");
        _circle && _circle.click()
    }
    function addHandlers() {
        $this.interact(over, click);
        _this.events.subscribe(KandinskyEvents.CHANGE_SOUND, changeColor)
    }
    function over(e) {
        _circle && _circle[e.action]()
    }
    function click() {
        _this.events.fire(KandinskyEvents.PLAY_PAUSE, {
            type: "pause"
        });
        _this.events.fire(KandinskyEvents.UNDO);
        hit()
    }
    function changeColor() {
        if ($bg) {
            $bg.css({
                background: "#" + Config.COLORS[Config.SCHEME].circle.toString(16)
            })
        }
        _circle && _circle.changeColor("#" + Config.COLORS[Config.SCHEME].circle.toString(16))
    }
    this.animateIn = function() {
        $this.transform({
            scale: 0
        });
        $icon.transform({
            scale: 0
        });
        $this.tween({
            scale: 1,
            damping: 0.2
        }, 0.75, "spring", 100);
        $icon.tween({
            opacity: 1,
            scale: 1,
            damping: 0.2
        }, 0.7, "spring", 200)
    }
});
Class(function GooeyCircles(_svg, _style) {
    Inherit(this, Component);
    var _this = this;
    var $this;
    var _shape, _clip, _ref, _filter, _current;
    var _circles = [];
    var _height = 50 * 4;
    var _blur = 10;
    var _dynamic = new DynamicObject({
        blur: _blur,
        alpha: 19,
        offset: -9
    });
    (function() {
        initCircles()
    }
    )();
    function initCircles() {
        _filter = _this.initClass(SVG.Filter, null);
        _clip = _this.initClass(SVG.Mask, null);
        _shape = _this.initClass(SVG.Shape, null);
        _ref = _this.initClass(SVG.Shape, null);
        var rect = _ref.rect(0, 0, 25, _height);
        rect.setAttr({
            fill: "#fff"
        }).transform({
            x: _style === "left" ? 0 : 25
        });
        _filter.blur = _filter.blurFilter(_blur);
        _filter.color = _filter.colorMatrixFilter(_filter.blur, "matrix", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9");
        _filter.composite = _filter.compositeFilter("SourceGraphic", _filter.color, "atop");
        _svg.add(_shape);
        _svg.add(_clip);
        _svg.add(_filter);
        _clip.add(rect);
        _clip.mask(_shape);
        _filter.apply(_shape);
        for (var i = 0; i < 3; i++) {
            var circle = _shape.circle(25, 0, 25);
            circle.transform({
                y: _height - 25
            });
            circle.setAttr({
                fill: _style === "left" ? "#" + Config.COLORS[i].triangle.toString(16) : "#" + Config.COLORS[i].circle.toString(16)
            });
            circle.interact(over, click);
            circle.index = i;
            _circles.push(circle)
        }
        _current = _circles[0];
        _shape.bringToFront(_current)
    }
    function animateOn() {
        var num = 0;
        _circles.forEach(function(elm) {
            if (_current.index === elm.index) {
                return true
            }
            num += 1;
            elm.tween({
                y: (_height - 25) - (num * 55)
            }, 300, "easeInOutQuart", 10 * (2 - num))
        });
        _dynamic.stopTween();
        _dynamic.tween({
            blur: 0,
            alpha: 1,
            offset: 0
        }, 800, "easeOutCubic", 300, function() {
            _filter.blur.setAttr({
                stdDeviation: _dynamic.blur
            });
            _filter.color.setAttr({
                values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 " + _dynamic.alpha + " " + _dynamic.offset
            })
        })
    }
    function animateOff() {
        var num = 1;
        _circles.forEach(function(elm, i) {
            elm.tween({
                y: _height - 25
            }, 250, "easeOutQuart", i * 40);
            num += 1
        });
        _dynamic.stopTween();
        _dynamic.tween({
            blur: _blur,
            alpha: 19,
            offset: -9
        }, 300, "easeInQuart", 0, function() {
            _filter.blur.setAttr({
                stdDeviation: _dynamic.blur
            });
            _filter.color.setAttr({
                values: "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 " + _dynamic.alpha + " " + _dynamic.offset
            })
        })
    }
    function animateIn() {}
    function over(e) {}
    function click(e) {
        _this.events.fire(HydraEvents.CLICK, e.target)
    }
    function setLayer(num) {
        if (_current == _current[num]) {
            return
        }
        _current = _circles[num];
        _shape.bringToFront(_current)
    }
    this.animateIn = animateIn;
    this.animateOn = animateOn;
    this.animateOff = animateOff;
    this.currentLayer = setLayer
});
Class(function WobblyCircle(_size) {
    Inherit(this, View);
    var _this = this;
    var $this;
    var _svg, _path, _draw, _color;
    var _canvasSize = _size * 1.3;
    var _vertices = [];
    var _rect = {
        needsUpdate: true
    };
    var _mouse = new Vector2();
    var _calc = new Vector2();
    var _interactRadius = _size * 0.5;
    var _dynamicObject = new DynamicObject({
        v: 0
    });
    (function() {
        initHTML();
        initSVG();
        initVertices();
        draw();
        addListeners()
    }
    )();
    function initHTML() {
        $this = _this.element;
        $this.size(_canvasSize, _canvasSize).center()
    }
    function initSVG() {
        _svg = _this.initClass(SVG.Canvas, _canvasSize, _canvasSize);
        _path = _this.initClass(SVG.Path);
        _path.stroke("none");
        _path.fill("#ff0000");
        _path.strokeWidth(3);
        _path.lineJoin("round");
        _path.transform({
            x: _canvasSize / 2,
            y: _canvasSize / 2
        });
        _svg.add(_path)
    }
    function initVertices() {
        var radius = _size * 0.5;
        var num = 30;
        var inc = Math.PI * 2 / num;
        var angle = 0;
        for (var i = 0; i < num; i++) {
            var x = Math.cos(angle) * radius;
            var y = Math.sin(angle) * radius;
            var v = new Vector2(x,y);
            v.spring = new Spring(v,v.clone(),0.2,0.8);
            v.origin = v.clone();
            _vertices.push(v);
            angle += inc
        }
        _draw = _vertices.slice(0);
        _draw.push(_vertices[0])
    }
    function draw() {
        for (var i = 0; i < _vertices.length; i++) {
            var v = _vertices[i];
            v.spring.update()
        }
        _path.moveTo(_draw[0].x, _draw[0].y);
        for (var i = 1; i < _draw.length - 2; i++) {
            var xc = (_draw[i].x + _draw[i + 1].x) / 2;
            var yc = (_draw[i].y + _draw[i + 1].y) / 2;
            _path.quadraticCurveTo(_draw[i].x.toFixed(8), _draw[i].y.toFixed(8), xc.toFixed(8), yc.toFixed(8))
        }
        _path.quadraticCurveTo(_draw[i].x.toFixed(8), _draw[i].y.toFixed(8), _draw[i + 1].x.toFixed(8), _draw[i + 1].y.toFixed(8));
        _path.draw();
        if (!checkIfActive()) {
            Render.stop(draw)
        }
    }
    function pop() {
        _this.active("popped", true, 250);
        for (var i = 0; i < _vertices.length; i++) {
            var v = _vertices[i];
            var scale = 1.2 + Utils.range(Math.sin(i), -1, 1, 0, 0.2);
            v.copy(v.origin).multiply(scale)
        }
    }
    function out() {
        if (_this.active("popped")) {
            return
        }
        for (var i = 0; i < _vertices.length; i++) {
            var v = _vertices[i];
            v.spring.target.copy(v.origin)
        }
    }
    function addListeners() {
        _this.events.subscribe(HydraEvents.RESIZE, resizeHandler)
    }
    function resizeHandler() {
        _rect.needsUpdate = true
    }
    function touchMove(e) {
        var tx = e.x - _rect.x - (_canvasSize / 2);
        var ty = e.y - _rect.y - (_canvasSize / 2);
        _mouse.set(tx, ty);
        for (var i = 0; i < _vertices.length; i++) {
            var v = _vertices[i];
            var len = _calc.subVectors(_mouse, v).lengthSq();
            if (len < _interactRadius * _interactRadius) {
                var angle = Math.atan2(_calc.y, _calc.x);
                len = Math.sqrt(len);
                v.spring.target.copy(v.origin);
                var radius = (_interactRadius - len) * 0.2;
                v.spring.target.x -= Math.cos(angle) * radius;
                v.spring.target.y -= Math.sin(angle) * radius
            } else {
                v.spring.target.copy(v.origin)
            }
        }
    }
    function updateBoundingRect() {
        var r = $this.div.getBoundingClientRect();
        _rect.needsUpdate = false;
        _rect.x = r.left;
        _rect.y = r.top
    }
    function checkIfActive() {
        var active = false;
        for (var i = _vertices.length - 1; i > -1; i--) {
            var v = _vertices[i];
            if (v.spring.getDistanceSq() > 0) {
                active = true
            }
        }
        return active
    }
    this.over = function() {
        Render.start(draw);
        if (Device.mobile) {
            return
        }
        if (_rect.needsUpdate) {
            updateBoundingRect()
        }
        Stage.bind("touchmove", touchMove)
    }
    ;
    this.out = function() {
        if (Device.mobile) {
            return
        }
        Stage.unbind("touchmove", touchMove);
        out()
    }
    ;
    this.click = function() {
        Render.start(draw);
        pop()
    }
    ;
    this.changeColor = function(color) {
        if (!_color) {
            _color = new Color(color);
            _path.fill(_color.getHexString())
        } else {
            var c = new Color(color);
            _dynamicObject.stopTween();
            _dynamicObject.v = 0;
            _dynamicObject.tween({
                v: 1
            }, 500, "easeInOutSine", function() {
                _color.mix(c, _dynamicObject.v);
                _path.fill(_color.getHexString())
            })
        }
    }
});
Class(function Main() {
    Inherit(this, Component);
    var _this = this;
    (function() {
        Mouse.capture();
        init()
    }
    )();
    function init() {
        if (Hydra.HASH.toLowerCase().strpos("playground")) {
            Playground.instance();
            return
        }
        _this.initClass(Loader)
    }
});
//window._MINIFIED_ = true;
