// 接收命令行参数, 提供基础信息提示功能
const commander = require('commander');

// 内部模块
const { existsSync } = require('fs');
const { resolve } = require('path');
const { version } = require('../package.json');

require('colors');

commander.version(version)
  .parse(process.argv);

const [todo = ''] = commander.args;

if (existsSync(resolve(__dirname, `command/${todo}/index.js`))) {
  require(`./command/${todo}/index.js`);
} else {
  console.log(
    `错误的脚手架指令...`.red,
  );
  process.exit(-1);
}