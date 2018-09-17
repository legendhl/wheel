const PENDING = Symbol('pending');
const FULFILLED = Symbol('fulfilled');
const REJECTED = Symbol('rejected');

class MyPromise {
    constructor(fn) {
        this.status = PENDING;
        fn.call(this, resolve.bind(this), reject.bind(this));

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

let p1 = new MyPromise((resolve, reject) => { setTimeout(() => resolve('p1'), 2000) });
let p2 = new MyPromise((resolve, reject) => { resolve('p2') });
let p3 = p1.then(val => { console.log(`p1 val is ${val}`); return 123; });
p2.then(val => { console.log(`p2 val is ${val}`); return 456; }).then(val => console.log(`another p2 val is ${val}`));
p3.then(val => console.log(`p3 val is ${val}`));