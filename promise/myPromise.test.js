const MyPromise = require('./myPromise.js');
const expect = require('chai').expect;

describe('MyPromise的测试', function () {
    it('同步resolve获取数据', function () {
        new MyPromise((resolve, reject) => { resolve('done') })
            .then(val => expect(val).to.be.equal('done'));
    });
    it('异步resolve获取数据', function () {
        new MyPromise((resolve, reject) => { setTimeout(() => resolve('timeout'), 1000) })
            .then(val => expect(val).to.be.equal('timeout'));
    });
    it('同步reject', function () {
        new MyPromise((resolve, reject) => { reject('fail') })
            .then(null, error => expect(error).to.be.equal('fail'));
    });
    it('异步reject', function () {
        new MyPromise((resolve, reject) => { setTimeout(() => reject('fail'), 1000) })
            .then(null, error => expect(error).to.be.equal('fail'));
    });
});



// let p1 = new MyPromise((resolve, reject) => { setTimeout(() => resolve('p1'), 2000) });
// let p2 = new MyPromise((resolve, reject) => { resolve('p2') });
// let p3 = p1.then(val => { console.log(`p1 val is ${val}`); return 123; });
// p2.then(val => { console.log(`p2 val is ${val}`); return 456; }).then(val => console.log(`another p2 val is ${val}`));
// p3.then(val => console.log(`p3 val is ${val}`));
// p1 = new MyPromise((resolve, reject) => {
//     throw new Error('err');
//     resolve('start');
// });
// p2 = p1.then(data => console.log(data));
// console.log(p1, p2);