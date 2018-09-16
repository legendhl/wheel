class MyPromise {
    constructor(fn) {
        this.status = 'pending';
        fn.call(this, resolve.bind(this), reject.bind(this));

        function resolve(val) {
            this.status = 'resolved';
            this.value = val;
            if (this.resolveFunc) {
                // async work
                setTimeout(() => {
                    this.resolveFunc(val);
                }, 0);
            }
        }
        function reject(err) {
            this.status = 'rejected';
            this.error = err;
            if (this.rejectFunc) {
                setTimeout(() => {
                    this.rejectFunc(err);
                }, 0);
            }
        }
    }

    then(resolveFunc, rejectFunc) {
        if (this.status === 'resolved') {
            setTimeout(() => {
                resolveFunc(this.value);
            }, 0);
        } else if (this.status === 'rejected') {
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