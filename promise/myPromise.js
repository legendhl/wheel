function MyPromise(fn) {
    let that = this;
    this.status = 'pending';
    function resolve(val) {
        that.status = 'resolved';
        that.value = val;
        if (that.resolveFunc) {
            setTimeout(() => {
                that.resolveFunc(val);
            }, 0);
        }
    }
    function reject(err) {
        that.status = 'rejected';
        that.error = err;
        if (that.rejectFunc) {
            setTimeout(() => {
                that.rejectFunc(err);
            }, 0);
        }
    }
    fn.call(this, resolve, reject);
}

MyPromise.prototype.then = function (resolveFunc, rejectFunc) {
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

let p1 = new MyPromise((resolve, reject) => { setTimeout(() => resolve('p1'), 2000) });
let p2 = new MyPromise((resolve, reject) => { resolve('p2') });
p1.then(val => console.log(`p1 val is ${val}`));
p2.then(val => console.log(`p2 val is ${val}`));