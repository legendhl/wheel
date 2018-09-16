let deps = [];

class MyVue {
    constructor(options) {
        this.el = options.el;
        this.data = options.data;
        this.methods = options.methods;
        this.computed = options.computed;

        this.proxyKeys();
        new Observer(this.data);
        new Compile(this.el, this);
    }

    proxyKeys() {
        let that = this;
        let keys = Object.keys(this.data);
        keys.forEach(key => {
            Object.defineProperty(this, key, {
                get: function porxyGetter() {
                    return that.data[key]; //console.log(this);
                },
                set: function proxySetter(newValue) {
                    that.data[key] = newValue;
                }
            })
        })
        keys = Object.keys(this.computed);
        keys.forEach(key => {
            if (typeof this.computed[key] === 'function') {
                Object.defineProperty(this, key, {
                    get: that.computed[key].bind(that)
                })
            }
        })
    }
}

class Observer {
    constructor(data) {
        this.data = data;
        this.walk(data);
    }

    walk(data) {
        let keys = Object.keys(data);
        keys.forEach(key => {
            if (typeof data[key] === 'object') {    //数组
                this.walk(data[key])
            } else {
                this.defineReactive(data, key, data[key])
            }
        })
    }

    defineReactive(data, key, value) {
        let dep = new Dep();
        deps.push(dep);
        Object.defineProperty(data, key, {
            configurable: true,
            enumerable: false,
            get: function () {
                //获取依赖关系
                if (Dep.target) {
                    dep.addSub(Dep.target);
                }
                return value;
            },
            set: function (newValue) {
                if (value !== newValue) {
                    value = newValue;
                    //触发响应
                    dep.notify();
                }
            }
        })
    }
}

// function observe(data) {
//     let keys = Object.keys(data);
//     keys.forEach(key => {
//         if (typeof data[key] === 'object') {
//             observe(data[key])
//         } else {
//             defineReactive(data, key, data[key])
//         }
//     })
// }

// function defineReactive(data, key, value) {
//     let dep = new Dep();
//     deps.push(dep);
//     Object.defineProperty(data, key, {
//         configurable: true,
//         enumerable: false,
//         get: function() {
//             //获取依赖关系
//             if (Dep.target) {
//                 dep.addSub(Dep.target);
//             }
//             return value;
//         },
//         set: function(newValue) {
//             if (value !== newValue) {
//                 value = newValue;
//                 //触发响应
//                 dep.notify();
//             }
//         }
//     })
// }

//消息订阅器
class Dep {
    constructor() {
        this.subs = [];
    }

    addSub(sub) {
        //添加订阅者
        this.subs.push(sub);
    }

    notify() {
        this.subs.forEach(sub => {
            sub.update();
        })
    }
}

//订阅者
class Watcher {
    constructor(vm, exp, cb) {
        this.vm = vm;
        this.exp = exp;
        this.cb = cb;
        this.type = typeof this.vm.computed[this.exp] === 'function' ? 'computed' : 'data';
        this.value = this.get();//将自己添加到订阅器
    }

    get() {
        Dep.target = this;
        let value;
        //触发get
        if (this.type === 'computed') {
            value = this.vm.computed[this.exp].call(this.vm);
        } else {
            value = this.vm.data[this.exp];
        }
        Dep.target = null;
        return value;
    }

    update() {
        let value;
        if (this.type === 'computed') {
            value = this.vm.computed[this.exp].call(this.vm);
        } else {
            value = this.vm.data[this.exp];
        }
        let oldValue = this.value;
        if (value !== oldValue) {
            this.value = value;
            this.cb.call(this.vm, value, oldValue);
        }
    }
}

class Compile {
    constructor(el, vm) {
        this.el = document.querySelector(el);
        this.vm = vm;
        this.fragment = null;
        this.init();
    }

    init() {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        }
    }

    nodeToFragment(el) {
        let fragment = document.createDocumentFragment();
        let child = el.firstChild;
        while (child) {
            fragment.appendChild(child);
            child = el.firstChild;
        }
        return fragment;
    }

    compileElement(el) {
        let childNodes = el.childNodes;
        Array.from(childNodes).forEach(node => {
            let reg = /\{\{(.*)\}\}/;
            let text = node.textContent;
            if (this.isElementNode(node)) {
                this.compile(node);
            } else if (this.isTextNode(node) && reg.test(text)) {
                this.compileText(node, reg.exec(text)[1]);
            }
            if (node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        })
    }

    compile(node) {
        let nodeAttrs = node.attributes;
        Array.from(nodeAttrs).forEach(attr => {
            let attrName = attr.name;
            if (this.isDirective(attrName)) {
                let exp = attr.value;
                let dir = attrName.substring(2);
                if (this.isEventDirect(dir)) {
                    this.compileEvent(node, this.vm, exp, dir);
                } else {  // v-model 指令
                    this.compileModel(node, this.vm, exp, dir);
                }
                node.removeAttribute(attrName);
            }
        })
    }

    compileText(node, exp) {
        let initText = typeof this.vm.computed[exp] === 'function' ? this.vm.computed[exp].call(this.vm) : this.vm[exp];
        this.updateText(node, initText);
        new Watcher(this.vm, exp, value => {
            this.updateText(node, value)
        })
    }

    compileEvent(node, vm, exp, dir) {
        let eventType = dir.split(':')[1];
        let func = vm.methods && vm.methods[exp];
        if (eventType && func) {
            node.addEventListener(eventType, func.bind(vm), false);
        }
    }

    compileModel(node, vm, exp, dir) {
        let val = this.vm[exp];
        this.modelUpdate(node, val);
        new Watcher(this.vm, exp, value => {
            this.modelUpdate(node, value);
        });

        node.addEventListener('input', e => {
            let newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            this.vm[exp] = newValue;
            val = newValue;
        });
    }

    modelUpdate(node, value, oldValue) {
        node.value = value || '';
    }

    updateText(node, text) {
        node.textContent = text || '';
    }

    isElementNode(node) {
        return node.nodeType === 1;
    }

    isTextNode(node) {
        return node.nodeType === 3;
    }

    isDirective(attr) {
        return attr.indexOf('v-') === 0;
    }

    isEventDirect(dir) {
        return dir.indexOf('on:') === 0;
    }
}