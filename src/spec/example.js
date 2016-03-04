var  ast = {
    "Vector": {
        "val": [
            {
                "Keyword": ":find"
            },
            {
                "Symbol": "?n"
            },
            {
                "Symbol": "?a"
            },
            {
                "Keyword": ":where"
            },
            {
                "Vector": {
                    "val": [
                        {
                            "Symbol": "?e"
                        },
                        "name",
                        {
                            "Symbol": "?n"
                        }
                    ]
                }
            },
            {
                "Vector": {
                    "val": [
                        {
                            "Symbol": "?e"
                        },
                        "age",
                        {
                            "Symbol": "?a"
                        }
                    ]
                }
            }
        ]
    }
};

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


function stringify(ast, type) {
  if (isString(ast)) {
    return '"' + (type === 'Keyword' ? ast.substring(1) : ast) + '"';
  } else if(isObject(ast)) {
    var key = Object.keys(ast)[0];
    if (key === 'val') {
      return ast[key].map(function (item) {
        return stringify(item, key);
      }).join(', ');
    } else {
      return mapping[key]
        + '(' + stringify(ast[key], key) + ')'
    }
  }
}

module.exports = {
  stringify: stringify,
  ast: ast,
  mapping: mapping,
  isString: isString,
  isObject: isObject
};
