const expect = require('chai').expect;

function myAdd(a, b) {
    return a + b;
}

describe("test sample", function(){
    it("test1", function(){
        let actual = myAdd(100, 100);

        expect(actual).to.equal(200);
    });

    it("test2", function(){
        let actual = myAdd(-100, 100);

        expect(actual).to.equal(0);
    });
});
