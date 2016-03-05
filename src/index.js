import {encodeJson, parse} from 'jsedn'
import typeOf from 'typeof'

const MORI = 'mori';
const DS_MORI = 'datascript-mori';
const PLUGIN_NAME = 'babel-plugin-datascript-query';

const mapping = {
  Vector: 'vector',
  List: 'list',
  Symbol: 'symbol',
  Keyword: 'keyword',
  Set: 'set',
  Map: 'hashMap'
};

const prepareArgs = {
  keyword: args => args.substring(1),
  set: (args, t) => t.arrayExpression([args])
};


const libraryMakeImport = {
  [MORI]: (uid, t) => t.importDeclaration(
    [t.importNamespaceSpecifier(uid)],
    t.stringLiteral(MORI)
  ),
  [DS_MORI]: (uid, t) => t.importDeclaration(
    [t.importSpecifier(
      uid,
      t.identifier(MORI)
    )],
    t.stringLiteral(DS_MORI)
  )
};

const literalMaker = {
  number: (t, literal) => t.numericLiteral(literal),
  string: (t, literal) => t.stringLiteral(literal),
  boolean: (t, literal) => t.booleanLiteral(literal),
  null: (t, literal) => t.nullLiteral(literal)
};

function isString (obj) { return typeOf(obj) === 'string' }
function isNumber (obj) { return typeOf(obj) === 'number' }
function isObject (obj) { return typeOf(obj) === 'object' }
function isArray (obj) { return typeOf(obj) === 'array' }

function makeCall(t, moriUID, name, args) {
  const moriFunc = mapping[name];
  const mappedArgs = prepareArgs.hasOwnProperty(moriFunc) ? prepareArgs[moriFunc](args, t) : args;

  return t.callExpression(
    t.memberExpression(moriUID, t.identifier(moriFunc)),
    isArray(mappedArgs) ?
      mappedArgs :
      [isString(mappedArgs) ?
        t.stringLiteral(mappedArgs) :
        mappedArgs]
  );
}

function babelify(ast, t, moriUID) {
  const typeNode = typeOf(ast);
  if (literalMaker.hasOwnProperty(typeNode)) {
    return literalMaker[typeNode](t, ast);
  } else if (isObject(ast)) {
    var key = Object.keys(ast)[0];
    var val = ast[key];
    if (isString(val)) {
      return makeCall(t, moriUID, key, val);
    } else if (isArray(val) || isObject(val)) {
      const args = isObject(val) && Object.keys(val)[0] === 'val' ?
        val.val :
        val;

      return makeCall(t, moriUID, key, args.map(item => babelify(item, t, moriUID)));
    }
  }
  throw new Error('Unexcepted AST of datascript query ' + JSON.stringify(ast));
}

const statementVisitor = {
  Statement(path) {
    path.insertBefore(
      libraryMakeImport[this.library](this.moriUID, this.types)
    );
    path.stop();
  }
}

const visitorTagLiteral = {
  TaggedTemplateExpression(path) {
    const t = this.types;
    let tag = path.get('tag');
    let type;
    if (tag.isMemberExpression()) {
      tag = tag.get('object');
      type = tag.get('property').name;
    }

    if (tag.isIdentifier({name: this.tag})) {
      if (!this.moriUID) {
        this.moriUID = this.program.scope.generateUidIdentifier('mori');
        this.program.traverse(statementVisitor, this);
      }
      if (path.node.quasi.quasis.length !== 1) {
        path.replaceWith(
          t.callExpression(
            t.memberExpression(this.moriUID, t.identifier('parse')),
            [path.node.quasi]
          )
        )
      } else {
        const value = path.node.quasi.quasis[0].value.cooked;
        let parsed;

        try {
          parsed = JSON.parse(encodeJson(parse(value)));
        } catch (e) {
          throw path.buildCodeFrameError(e);
        }

        path.replaceWith(
          babelify(parsed, t, this.moriUID)
        );
      }
    }
  }
};



export default function({ types }) {
  return {
    visitor: {
      Program(path, state) {
        const { tag = 'Datalog', library = 'datascript-mori' } = state.opts;
        if (library !== MORI && library !== DS_MORI) {
          throw new Error(PLUGIN_NAME + ' option library must be mori or datascript-mori');
        }
        const innerState = {
          types,
          tag,
          library,
          program: path
        };

        path.traverse(visitorTagLiteral, innerState);
      }
    }
  };
}
