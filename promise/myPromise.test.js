const { MyPromise, PENDING, FULFILLED, REJECTED } = require('./myPromise.js');
const expect = require('chai').expect;

describe('MyPromise的测试', function (done) {
    it('同步resolve获取数据', function () {
        new MyPromise((resolve, reject) => { resolve('done') })
            .then(val => {
                expect(val).to.be.equal('done');
            });
    });
    it('异步resolve获取数据', function (done) {
        new MyPromise((resolve, reject) => { setTimeout(() => resolve('timeout'), 100) })
            .then(val => {
                expect(val).to.be.equal('timeout')
                done();
            });
    });
    it('同步reject', function () {
        new MyPromise((resolve, reject) => { reject('fail') })
            .then(null, error => {
                expect(error).to.be.equal('fail');
            });
    });
    it('异步reject', function (done) {
        new MyPromise((resolve, reject) => { setTimeout(() => reject('fail'), 100) })
            .then(null, error => {
                expect(error).to.be.equal('fail');
                done();
            });
    });
    it('promise的执行顺序：promise建立后立即执行', function () {
        let arr = [];
        let p = new MyPromise((resolve, reject) => { arr.push(1); resolve() });
        p.then(val => { arr.push(3); expect(arr).to.deep.equal([1, 2, 3]) });
        arr.push(2);
    });
    it('then函数返回一个新的promise', function (done) {
        let p1 = new MyPromise((resolve, reject) => { resolve('done') });
        let p2 = p1.then(val => {
            expect(val).to.be.equal('done');
            done();
        });
        expect(p1).to.not.be.equal(p2);
    });
    // it('promise的状态可以传递', function (done) {
    //     let p1 = new MyPromise((resolve, reject) => { setTimeout(() => reject('fail'), 100) });
    //     let p2 = new MyPromise((resolve, reject) => { resolve(p1) });
    //     p2.then(val => {
    //         expect(val).to.not.be.ok;
    //         done();
    //     }, error => {
    //         expect(error).to.be.equal('fail');
    //         done();
    //     });
    // });
    it('then可以链式传递参数', function (done) {
        let p1 = new MyPromise((resolve, reject) => { resolve('first') });
        p1.then(val => { expect(val).to.be.equal('first'); return 'second'; })
            .then(val => {
                expect(val).to.be.equal('second');
                done();
            });
    });
});
