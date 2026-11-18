const {test} = require('node:test'); const assert = require('node:assert/strict'); const {score} = require('./server');
test('scores matching dice by multiplying their sum',()=>{assert.equal(score([[3,3], [6,6,6], [1,2,3]]),72)});
test('scores empty boards',()=>assert.equal(score([[],[],[]]),0));
