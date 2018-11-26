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

    finally(finalFunc) {

    }

    static all(promiseArr) {

    }

    static race(promiseArr) {

    }

    static resolve(obj) {

    }

    static reject(obj) {

    }
}

module.exports = { MyPromise, PENDING, FULFILLED, REJECTED };