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
                // async work
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
        resolveFunc = typeof resolveFunc === 'function' ? resolveFunc : function() {};
        rejectFunc = typeof rejectFunc === 'function' ? rejectFunc : function() {};
        if (this.status === FULFILLED) {
            setTimeout(() => {
                resolveFunc(this.value);
            }, 0);
        } else if (this.status === REJECTED) {
            setTimeout(() => {
                rejectFunc(this.error);
            }, 0);
        } else {
            this.resolveFunc = resolveFunc;
            this.rejectFunc = rejectFunc;
        }
    }
}

let p1 = new MyPromise((resolve, reject) => { setTimeout(() => resolve('p1'), 2000) });
let p2 = new MyPromise((resolve, reject) => { resolve('p2') });
p1.then(val => console.log(`p1 val is ${val}`));
p2.then(val => console.log(`p2 val is ${val}`));