const PENDING = Symbol('pending');
const FULFILLED = Symbol('fulfilled');
const REJECTED = Symbol('rejected');

class MyPromise {
    constructor(fn) {
        this.status = PENDING;
        try {
            fn.call(this, resolve.bind(this), reject.bind(this));
        } catch (e) {
            this.error = e;
        }

        function resolve(val) {
            this.status = FULFILLED;
            this.value = val;
            if (this.resolveFunc) {
                // using setTimeout to simulate micro task
                setTimeout(() => {
                    this.resolveFunc(val);
                }, 0);
            }
        }
        function reject(err) {
            this.status = REJECTED;
            this.error = err;
            if (this.rejectFunc) {
                setTimeout(() => {
                    this.rejectFunc(err);
                }, 0);
            }
        }
    }

    then(resolveFunc, rejectFunc) {
        resolveFunc = typeof resolveFunc === 'function' ? resolveFunc : function () { };
        rejectFunc = typeof rejectFunc === 'function' ? rejectFunc : function () { };
        return new MyPromise((resolve, reject) => {
            this.resolveFunc = ((...args) => { let res = resolveFunc.apply(this, args); resolve(res); }).bind(this);
            this.rejectFunc = ((...args) => { let res = rejectFunc.apply(this, args); reject(res); }).bind(this);
            if (this.status === FULFILLED) {
                setTimeout(() => {
                    this.resolveFunc(this.value);
                }, 0);
            } else if (this.status === REJECTED) {
                setTimeout(() => {
                    this.rejectFunc(this.error);
                }, 0);
            }
        });
    }

    catch(rejectFunc) {

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

module.exports = MyPromise;