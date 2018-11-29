const { MyPromise, PENDING, FULFILLED, REJECTED } = require('./myPromise.js');
const expect = require('chai').expect;

describe('MyPromise的测试', function (done) {
    it('同步resolve获取数据', function () {
        new MyPromise((resolve, reject) => { resolve('done') })
            .then(val => {
                console.log(val === 'done');
                expect(val).to.be.equal('done');
            });
    });
    it('多个同步resolve获取数据', function (done) {
        let p1 = new MyPromise((resolve, reject) => { resolve('done') })
        let p2 = p1.then(val => {
            console.log(val === 'done');
            expect(val).to.be.equal('done');
            return 'hello p1';
        });
        p2.then(val => {
            console.log(val === 'hello p1');
            expect(val).to.be.equal('hello p1');
            done();
        });
    });
    it('异步resolve获取数据', function (done) {
        new MyPromise((resolve, reject) => { setTimeout(() => resolve('timeout'), 100) })
            .then(val => {
                console.log(val === 'timeout');
                expect(val).to.be.equal('timeout')
                done();
            });
    });
    it('多个异步resolve获取数据', function (done) {
        let p1 = new MyPromise((resolve, reject) => { setTimeout(() => resolve('timeout1'), 100) })
        let p2 = p1.then(val => {
            console.log(val === 'timeout1');
            expect(val).to.be.equal('timeout1');
            return new MyPromise((resolve, reject) => { setTimeout(() => resolve('timeout2'), 100) });
        });
        p2.then(val => {
            console.log(val === 'timeout2');
            expect(val).to.be.equal('timeout2');
            done();
        });
    });
    it('同步reject', function () {
        new MyPromise((resolve, reject) => { reject('fail') })
            .then(null, error => {
                console.log(val === 'fail');
                expect(error).to.be.equal('fail');
            });
    });
    it('异步reject', function (done) {
        new MyPromise((resolve, reject) => { setTimeout(() => reject('fail'), 100) })
            .then(null, error => {
                console.log(error === 'fail');
                expect(error).to.be.equal('fail');
                done();
            });
    });
    it('promise的执行顺序：promise建立后立即执行', function () {
        let arr = [];
        let p = new MyPromise((resolve, reject) => { arr.push(1); resolve() });
        p.then(val => {
            arr.push(3);
            expect(arr).to.deep.equal([1, 2, 3]);
            console.log(arr[0] === 1 && arr[1] === 2 && arr[2] === 3);
        });
        arr.push(2);
    });
    it('then函数返回一个新的promise', function (done) {
        let p1 = new MyPromise((resolve, reject) => { resolve('done') });
        let p2 = p1.then(val => {
            console.log(val === 'done');
            expect(val).to.be.equal('done');
            done();
        });
        expect(p1).to.not.be.equal(p2);
    });
    it('promise的状态可以传递', function (done) {
        let p1 = new MyPromise((resolve, reject) => { setTimeout(() => reject('fail'), 100) });
        let p2 = new MyPromise((resolve, reject) => { resolve(p1) });
        p2.then(val => {
        }, error => {
            console.log(error === 'fail');
            expect(error).to.be.equal('fail');
            done();
        });
    });
    it('then可以链式传递参数', function (done) {
        let p1 = new MyPromise((resolve, reject) => { resolve('first') });
        p1.then(val => {
            console.log(val === 'first');
            expect(val).to.be.equal('first');
            return 'second';
        }).then(val => {
            console.log(val === 'second');
            expect(val).to.be.equal('second');
            done();
        });
    });
    it('promise.prototype.catch', function () {
        let p = new MyPromise((resolve, reject) => {
            throw new Error('catch');
        });
        p.catch(error => {
            expect(Object.prototype.toString.call(error)).to.be.equal('[object Error]');
            expect(error.message).to.include('catch');
            console.log(error.message === 'catch');
        });
    });
    it('Promise.all', function () {
        let promises = [1, 2, 3, 4, 5].map(val => new MyPromise((resolve, reject) => { resolve(val * 2) }));
        let p = MyPromise.all(promises);
        p.then(val => {
            console.log(val[0] === 2 && val[1] === 4 && val[2] === 6);
            expect(val).to.eql([2, 4, 6, 8, 10]);
        });
    });
    it('Promise.race', function () {
        let promises = [1, 2, 3, 4, 5].map(val => new MyPromise((resolve, reject) => { reject(val * 2) }));
        let p = MyPromise.race(promises);
        p.then(val => {
        }, err => {
            console.log(err === 2);
            expect(err).to.be.equal(2);
        });
    });
});
