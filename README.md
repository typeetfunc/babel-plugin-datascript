## Babel plugin DataScript [![Build Status](https://travis-ci.org/typeetfunc/babel-plugin-datascript.svg?branch=master)](https://travis-ci.org/typeetfunc/babel-plugin-datascript)

Plugin for precompile static DataScript query to Mori structs. Also plugin checks query in compile-time with Datascript parse-query API.

## Example

### Input:

```JavaScript
var Datalog = Datalog.Q`[:find  ?e ?email
                          :in    $ [[?n ?email]]
                          :where [?e :name ?n]]`;
```

### Output:

```JavaScript
import { mori as _mori } from 'datascript-mori';
var Datalog = _mori.vector(_mori.keyword('find'), _mori.symbol('?e'), _mori.symbol('?email'), _mori.keyword('in'), _mori.symbol('$'), _mori.vector(_mori.vector(_mori.symbol('?n'), _mori.symbol('?email'))), _mori.keyword('where'), _mori.vector(_mori.symbol('?e'), _mori.keyword('name'), _mori.symbol('?n')));
```


## Options

 - library: [datascript-mori](https://github.com/typeetfunc/datascript-mori) or [mori](https://github.com/swannodette/mori). Used for automatic add `import` in file with queries. By default `datascript-mori`
 - tag: Tag used for mark DataScript query(plugin use TemplateTagLiteral from Ecmascript 2015). By default `Datalog`. Also plugin reserved all tag like `TAG.ANYTHING` (i.e `Datalog.Pull`, `Datalog.Q` etc.)

### Why?

Datalog query is a ClojureScript data structures, not a string. In JS API Datalog query is a string which [convert to CLJS data structures in runtime](https://github.com/tonsky/datascript/blob/master/src/datascript/js.cljs#L70)
Babel-plugin transfers this convertaion in compile-time. Conversion in compile-time has two advantages:
 - check query during compilation. Example:

  ```JavaScript
  var q1 = Datalog`[ :find (sum ?heads)
               :with ?monster
               :in   [[?monster ?heads]]`;
  ```

  This code doesnt compile because in EDN string missing closing bracket `]`.
  Also query with tag `Datalog.Q` and `Datalog.Pull` checks with [parse-query](https://github.com/tonsky/datascript/blob/master/src/datascript/parser.cljc#L732) and [parse-pull](https://github.com/tonsky/datascript/blob/master/src/datascript/pull_parser.cljc#L217) API.

  ```JavaScript
  var q1 = Datalog.Q`[:find ?e :with ?f :where [?e]]`;;
  ```
  This code doesnt compile because in query variable `?f` is unknown.

 - minimize runtime overhead of parse string to EDN in runtime
