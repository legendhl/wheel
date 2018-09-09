/** 主任务函数 **/
function* flow() {
    var file1 = yield readFile('file1.txt');
    console.log('file1的内容是: ' + file1);
    console.log(yield sleep(2000))
    // sleep 2s
    var file2 = yield readFile(file1);
    console.log('file2的内容是: ' + file2);
}

co(flow); // 运行

function readFile(filename) {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            resolve('file2.txt')
        }, 0);
    });
}

function sleep(ms) {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            resolve('sleeped ' + ms + 'ms!');
        }, ms);
    });
}

function co(generator) {
    var gen = generator();
    function next(data) {
        var ret = gen.next(data);
        if (ret.done) {
            return;
        } else {
            // 异步阻塞在这里
            ret.value.then(data => {
                next(data);
            }).catch(error => {
                throw(error);
            })
        }
    }
    next();
}