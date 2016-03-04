import {encodeJson, parse} from 'jsedn'

const TAG = 'edn';
const PLUGIN_NAME = 'babel-plugin-datascript-query';


var mapping = {
  Vector: 'vector',
  Symbol: 'symbol',
  Keyword: 'keyword'
};

function toS (obj) { return Object.prototype.toString.call(obj) }
function isDate (obj) { return toS(obj) === '[object Date]' }
function isRegExp (obj) { return toS(obj) === '[object RegExp]' }
function isError (obj) { return toS(obj) === '[object Error]' }
function isBoolean (obj) { return toS(obj) === '[object Boolean]' }
function isNumber (obj) { return toS(obj) === '[object Number]' }
function isString (obj) { return toS(obj) === '[object String]' }
function isObject (obj) { return toS(obj) === '[object Object]' }
function isArray (obj) { return toS(obj) === '[object Array]' }


function babelify(ast, t) {
  if (isString(ast)) {
    return t.stringLiteral(ast);
  } else if(isObject(ast)) {
    var key = Object.keys(ast)[0];
    var val = ast[key];
    if (key === 'val') {
      return ast[key].map(function (item) {
        return babelify(item, t);
      });
    } else if (isString(val)) {
      return t.callExpression(
        t.identifier(mapping[key]),
        [t.stringLiteral(mapping[key] === 'keyword' ? val.substring(1) : val)]
      );
    } else {
      var args = babelify(val, t);
      return t.callExpression(
        t.identifier(mapping[key]),
        isArray(args) ? args : [args]
      );
    }
  }
}



export default function({ types: t }) {
  return {
    visitor: {
      TaggedTemplateExpression(path) {
        if (t.isIdentifier(path.node.tag, { name: TAG })) {
          if (path.node.quasi.quasis.length !== 1) {
            //console.log(path.node);
            path.replaceWith(
              t.callExpression(
                t.identifier('parse'),
                [path.node.quasi]
              )
            )
          } else {
            const value = path.node.quasi.quasis[0].value.cooked;
            const parsed = JSON.parse(encodeJson(parse(value)));

            path.replaceWith(
              babelify(parsed, t)
            );
          }
        }
      }
    }
  };
}
