const PENDING = Symbol('pending');
const FULFILLED = Symbol('fulfilled');
const REJECTED = Symbol('rejected');

// using setTimeout to simulate micro task
function microTask(fn) {
    setTimeout(fn, 0);
}

class MyPromise {
    constructor(handler) {
        this._status = PENDING;
        this._fulfilledQueues = [];
        this._rejectedQueues = [];
        try {
            handler.call(this, resolve.bind(this), reject.bind(this));
        } catch (e) {
            reject.call(this, e);
        }

        function resolve(val) {
            if (this._status !== PENDING) return;
            let run = () => {
                if (val instanceof MyPromise) {
                    let prePro = val;
                    prePro.then(val => {
                        this._status = FULFILLED;
                        this._value = val;
                        while (this._fulfilledQueues.length) {
                            let cb = this._fulfilledQueues.shift();
                            cb(this._value);
                        }
                    }, error => {
                        this._status = REJECTED;
                        this._value = error;
                        while (this._rejectedQueues.length) {
                            let cb = this._rejectedQueues.shift();
                            cb(this._value);
                        }
                    })
                } else {
                    this._status = FULFILLED;
                    this._value = val;
                    while (this._fulfilledQueues.length) {
                        let cb = this._fulfilledQueues.shift();
                        cb(this._value);
                    }
                }
            }
            microTask(() => { run() });
        }
        function reject(err) {
            if (this._status !== PENDING) return;
            this._status = REJECTED;
            this._value = err;
            let run = () => {
                while (this._rejectedQueues.length) {
                    let cb = this._rejectedQueues.shift();
                    cb(this._value);
                }
            }
            microTask(() => { run() });
        }
    }

    then(onFulfilled, onRejected) {
        return new MyPromise((resolve, reject) => {
            let fulfilled = value => {
                try {
                    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function () { };
                    let res = onFulfilled(value);
                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }
            let rejected = value => {
                try {
                    onRejected = typeof onRejected === 'function' ? onRejected : function () { };
                    let res = onRejected(value);
                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }
            const { _status, _value } = this;
            switch (_status) {
                case PENDING:
                    this._fulfilledQueues.push(fulfilled);
                    this._rejectedQueues.push(rejected);
                    break;
                case FULFILLED:
                    microTask(() => { fulfilled(_value) });
                    break;
                case REJECTED:
                    microTask(() => { rejected(_value) });
                    break;
            }
        });
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }

    finally(onFinally) {
        return this.then(
            value => MyPromise.resolve(onFinally()).then(() => value),
            reason => MyPromise.resolve(onFinally()).then(() => { throw reason })
        );
    }

    static all(promises) {
        promises = promises.map(promise => MyPromise.resolve(promise));
        return new MyPromise((resolve, reject) => {
            let size = promises.length;
            const results = Array(size);
            promises.forEach((promise, index) => {
                promise.then(val => {
                    results[index] = val;
                    size--;
                    if (size === 0) { resolve(results) }
                }, err => {
                    reject(err);
                })
            })
        });
    }

    static race(promises) {
        promises = promises.map(promise => MyPromise.resolve(promise));
        return new MyPromise((resolve, reject) => {
            promises.forEach(promise => {
                promise.then(val => {
                    resolve(val);
                }, err => {
                    reject(err);
                })
            })
        })
    }

    static resolve(obj) {
        if (obj instanceof MyPromise) {
            return obj;
        } else if (obj && typeof obj.then === 'function') {
            return new MyPromise(obj.then);
        } else {
            return new Promise((resolve, reject) => { resolve(obj) });
        }
    }

    static reject(reason) {
        return new Promise((resolve, reject) => { reject(reason) });
    }
}

module.exports = { MyPromise, PENDING, FULFILLED, REJECTED };