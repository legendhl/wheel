const PENDING = Symbol('pending');
const FULFILLED = Symbol('fulfilled');
const REJECTED = Symbol('rejected');

// using setTimeout to simulate micro task
function microTask(fn) {
    setTimeout(fn, 0);
}

class MyPromise {
    constructor(fn) {
        this.status = PENDING;
        try {
            fn.call(this, resolve.bind(this), reject.bind(this));
        } catch (e) {
            this.error = e;
        }

        function resolve(val) {
            if (val instanceof MyPromise) {
                let prePro = val;
                prePro.then(value => {
                    this.value = val;
                    if (this.resolveFunc) {
                        microTask(() => { this.resolveFunc(val) });
                    }
                }, error => {
                    this.status = REJECTED;
                    this.error = error;
                    if (this.rejectFunc) {
                        microTask(() => { this.rejectFunc(error) });
                    }
                })
                return;
            }
            this.status = FULFILLED;
            this.value = val;
            if (this.resolveFunc) {
                microTask(() => { this.resolveFunc(val) });
            }
        }
        function reject(err) {
            this.status = REJECTED;
            this.error = err;
            if (this.rejectFunc) {
                microTask(() => { this.rejectFunc(err) });
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
                microTask(() => { this.resolveFunc(this.value) });
            } else if (this.status === REJECTED) {
                microTask(() => { this.rejectFunc(this.error) });
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

module.exports = { MyPromise, PENDING, FULFILLED, REJECTED };