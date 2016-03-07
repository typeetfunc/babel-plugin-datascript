import {encodeJson, parse} from 'jsedn'
import typeOf from 'typeof'

const MORI = `mori`
const DS_MORI = `datascript-mori`
const PLUGIN_NAME = `babel-plugin-datascript`
const ARRAY = `array`
const OBJECT = `object`
const STRING = `string`
const KEY_VAL = `val`

const DEFAULT_OPTIONS = {
  tag: `Datalog`,
  library: `datascript-mori`,
}

const mapping = {
  Vector: `vector`,
  List: `list`,
  Symbol: `symbol`,
  Keyword: `keyword`,
  Set: `set`,
  Map: `hashMap`,
}

const makeMessage = {
  ednError: ast => `Unexcepted AST of datascript query ${JSON.stringify(ast)}`,
  optionError: () => `${PLUGIN_NAME} option library must be mori or datascript-mori`, // eslint-disable-line max-len
}

const prepareArgs = {
  keyword: args => args.substring(1),
  set: (args, t) => t.arrayExpression([args]),
}

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
  ),
}

const literalMaker = {
  number: (t, literal) => t.numericLiteral(literal),
  string: (t, literal) => t.stringLiteral(literal),
  boolean: (t, literal) => t.booleanLiteral(literal),
  null: (t, literal) => t.nullLiteral(literal),
}

function getFirstKey(object) {
  return Object.keys(object)[0]
}

function makeCall(t, moriUID, name, args) {
  const moriFunc = mapping[name]
  const mappedArgs = prepareArgs.hasOwnProperty(moriFunc) ?
    prepareArgs[moriFunc](args, t) :
    args

  return t.callExpression(
    t.memberExpression(moriUID, t.identifier(moriFunc)),
    typeOf(mappedArgs) === ARRAY ?
      mappedArgs :
      [typeOf(mappedArgs) === STRING ?
        t.stringLiteral(mappedArgs) :
        mappedArgs]
  )
}

function babelify(ast, t, moriUID) {
  const typeNode = typeOf(ast)
  if (literalMaker.hasOwnProperty(typeNode)) {
    return literalMaker[typeNode](t, ast)
  } else if (typeNode === OBJECT) {
    const key = getFirstKey(ast)
    const val = ast[key]
    const typeVal = typeOf(val)
    if (typeVal === STRING) {
      return makeCall(t, moriUID, key, val)
    } else if (typeVal === ARRAY || typeVal === OBJECT) {
      const args = typeVal === OBJECT && getFirstKey(val) === KEY_VAL ?
        val[KEY_VAL] :
        val

      return makeCall(t, moriUID, key,
        args.map(item => babelify(item, t, moriUID))
      )
    }
  }
  throw new SyntaxError(makeMessage.ednError(ast))
}

const statementVisitor = {
  Statement(path) {
    path.insertBefore(
      libraryMakeImport[this.library](this.moriUID, this.types)
    )
    path.stop()
  },
}

const visitorTagLiteral = {
  TaggedTemplateExpression(path) {
    const t = this.types
    let tag = path.get(`tag`)
    let type // eslint-disable-line
    if (tag.isMemberExpression()) {
      tag = tag.get(`object`)
      type = tag.get(`property`).name
    }

    if (tag.isIdentifier({name: this.tag})) {
      if (!this.moriUID) {
        this.moriUID = this.program.scope.generateUidIdentifier(`mori`)
        this.program.traverse(statementVisitor, this)
      }
      if (path.node.quasi.quasis.length !== 1) {
        path.replaceWith(
          t.callExpression(
            t.memberExpression(this.moriUID, t.identifier(`parse`)),
            [path.node.quasi]
          )
        )
      } else {
        const value = path.node.quasi.quasis[0].value.cooked
        let ast

        try {
          const parsed = JSON.parse(encodeJson(parse(value)))
          ast = babelify(parsed, t, this.moriUID)
        } catch (e) {
          throw path.buildCodeFrameError(e)
        }

        path.replaceWith(ast)
      }
    }
  },
}

export default function({types}) {
  return {
    visitor: {
      Program(path, state) {
        const {tag, library} = {...DEFAULT_OPTIONS, ...state.opts}
        if (library !== MORI && library !== DS_MORI) {
          throw new Error(makeMessage.optionError())
        }
        const innerState = {
          types,
          tag,
          library,
          program: path,
        }

        path.traverse(visitorTagLiteral, innerState)
      },
    },
  }
}
