const transform = (str) => {
  return require('babel-core').transform(str, {
    plugins: ['./src']
  }).code;
};
const code = 'var b = "aaaa";var c = 123; var a = edn`[:find ?a :where [?e "age" ?a]]`;';

//const code = 'const example = "Hello";';
console.log(transform(code));
