// entry point
const { greet } = require('./greet.js');
const { add } = require('./utils/math.js');

console.log(greet());
console.log(`1 + 2 = ${add(1, 2)}`);
