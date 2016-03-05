import * as fs from 'fs'
const transform = (str, options = {}) => {
  return require('babel-core').transform(str, {
    plugins: [['./src', options]]
  }).code;
};

fs.readFile('./src/spec/test-cases/withOtherSymbol/input.js', 'utf8', (err, data) => {
  if (err) {
    return console.log(err);
  }
  console.log(data);
  console.log(transform(data, {library: 'mori', tag: 'Ds'}));
});
