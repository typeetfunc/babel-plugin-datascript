import {encodeJson, parse} from 'jsedn'
import {helpers, mori} from 'datascript-mori'
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
  cache: false,
}

const PARSER = {
  Q: `parse_query`,
  Pull: `parse_pull`,
}

const mapping = {
  Vector: `vector`,
  List: `list`,
  Symbol: `symbol`,
  Keyword: `keyword`,
  Set: `set`,
  Map: `hashMap`,
}

const PARSE_FUNC = {
  cached: {
    namespace: `helpers`,
    func: `memoized_parse`,
  },
  nonCached: {
    namespace: `mori`,
    func: `parse`,
  },
}

const IMPORTED_LIBRARY = {
  [MORI]: `*`,
}

const makeMessage = {
  ednError: ast => `Unexcepted AST of datascript query ${JSON.stringify(ast)}`,
  optLibraryError: () => `${PLUGIN_NAME} option library must be mori or datascript-mori`, // eslint-disable-line max-len
  optCacheError: () => `${PLUGIN_NAME} option cache may be true if library=datascript-mori`, // eslint-disable-line max-len
}

const prepareArgs = {
  keyword: args => args.substring(1),
  set: (args, t) => t.arrayExpression([args]),
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

function makeCall(t, libraryNamespace, name, args) {
  const moriFunc = mapping[name]
  const mappedArgs = prepareArgs.hasOwnProperty(moriFunc) ?
    prepareArgs[moriFunc](args, t) :
    args

  return t.callExpression(
    t.memberExpression(libraryNamespace, t.identifier(moriFunc)),
    typeOf(mappedArgs) === ARRAY ?
      mappedArgs :
      [typeOf(mappedArgs) === STRING ?
        t.stringLiteral(mappedArgs) :
        mappedArgs]
  )
}

function babelify(ast, t, libraryNamespace) {
  const typeNode = typeOf(ast)
  if (literalMaker.hasOwnProperty(typeNode)) {
    return literalMaker[typeNode](t, ast)
  } else if (typeNode === OBJECT) {
    const key = getFirstKey(ast)
    const val = ast[key]
    const typeVal = typeOf(val)
    if (typeVal === STRING) {
      return makeCall(t, libraryNamespace, key, val)
    } else if (typeVal === ARRAY || typeVal === OBJECT) {
      const args = typeVal === OBJECT && getFirstKey(val) === KEY_VAL ?
        val[KEY_VAL] :
        val

      return makeCall(t, libraryNamespace, key,
        args.map(item => babelify(item, t, libraryNamespace))
      )
    }
  }
  throw new SyntaxError(makeMessage.ednError(ast))
}

function checkQuery(query, type) {
  const parsed = mori.parse(query)
  if (PARSER.hasOwnProperty(type)) {
    helpers[PARSER[type]](parsed)
  }
}

const visitorTagLiteral = {
  TaggedTemplateExpression(path) {
    const t = this.types
    const rawTag = path.get(`tag`)
    const {hub: {file}} = path
    const [tag, type] = rawTag.isMemberExpression() ?
      [rawTag.get(`object`), rawTag.get(`property`).node.name] :
      [rawTag]

    if (tag.isIdentifier({name: this.tag})) {
      if (!this.libraryNamespace) {
        this.libraryNamespace = file.addImport(
          this.library.path,
          this.library.imported || this.library.namespace,
          this.library.namespace
        )
      }
      if (path.node.quasi.quasis.length !== 1) {
        path.replaceWith(
          t.callExpression(
            t.memberExpression(
              this.libraryNamespace,
              t.identifier(this.library.func)
            ),
            [path.node.quasi]
          )
        )
      } else {
        const value = path.node.quasi.quasis[0].value.cooked
        let ast

        try {
          checkQuery(value, type)
          const parsed = JSON.parse(encodeJson(parse(value)))
          ast = babelify(parsed, t, this.libraryNamespace)
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
        const {tag, library, cache} = {...DEFAULT_OPTIONS, ...state.opts}
        if (library !== MORI && library !== DS_MORI) {
          throw new Error(makeMessage.optLibraryError())
        }
        if (cache && library !== DS_MORI) {
          throw new Error(makeMessage.optCacheError())
        }
        const innerState = {
          types,
          tag,
          library: {
            path: library,
            ...(cache ? PARSE_FUNC.cached : PARSE_FUNC.nonCached),
            ...(IMPORTED_LIBRARY[library] ?
              {imported: IMPORTED_LIBRARY[library]} :
              {}),
          },
        }

        path.traverse(visitorTagLiteral, innerState)
      },
    },
  }
}
