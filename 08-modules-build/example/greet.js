const { name } = require('./name.js');
const { add } = require('./utils/math.js'); // math.js ถูก require จาก 2 ที่ แต่ต้องรันแค่ครั้งเดียว

module.exports.greet = () => `สวัสดี ${name}! (อายุ ${add(20, 5)})`;
