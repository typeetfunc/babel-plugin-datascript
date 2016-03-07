import { mori as _mori } from "datascript-mori";

var q1 = _mori.vector(_mori.keyword("find"), _mori.list(_mori.symbol("sum"), _mori.symbol("?heads")), _mori.list(_mori.symbol("min"), _mori.symbol("?heads")), _mori.list(_mori.symbol("max"), _mori.symbol("?heads")), _mori.list(_mori.symbol("count"), _mori.symbol("?heads")), _mori.list(_mori.symbol("count-distinct"), _mori.symbol("?heads")), _mori.keyword("with"), _mori.symbol("?monster"), _mori.keyword("in"), _mori.vector(_mori.vector(_mori.symbol("?monster"), _mori.symbol("?heads"))));

var q2 = _mori.vector(_mori.keyword("find"), _mori.symbol("?color"), _mori.list(_mori.symbol("max"), _mori.symbol("?amount"), _mori.symbol("?x")), _mori.list(_mori.symbol("min"), _mori.symbol("?amount"), _mori.symbol("?x")), _mori.keyword("in"), _mori.vector(_mori.vector(_mori.symbol("?color"), _mori.symbol("?x"))), _mori.symbol("?amount"));

var q3 = _mori.vector(_mori.keyword("find"), _mori.symbol("?e"), _mori.symbol("?age"), _mori.symbol("?height"), _mori.keyword("where"), _mori.vector(_mori.symbol("?e"), _mori.keyword("age"), _mori.symbol("?age")), _mori.vector(_mori.list(_mori.symbol("get-else"), _mori.symbol("$"), _mori.symbol("?e"), _mori.keyword("height"), 300), _mori.symbol("?height")));

var q3 = _mori.vector(_mori.keyword("find"), _mori.symbol("?e1"), _mori.symbol("?e2"), _mori.keyword("where"), _mori.vector(_mori.symbol("?e1"), _mori.keyword("age"), _mori.symbol("?a1")), _mori.vector(_mori.symbol("?e2"), _mori.keyword("age"), _mori.symbol("?a2")), _mori.vector(_mori.list(_mori.symbol("<"), _mori.symbol("?a1"), 18, _mori.symbol("?a2"))));

var q4 = _mori.vector(_mori.keyword("find"), _mori.symbol("?e1"), _mori.symbol("?e2"), _mori.symbol("?e3"), _mori.keyword("where"), _mori.vector(_mori.symbol("?e1"), _mori.keyword("age"), _mori.symbol("?a1")), _mori.vector(_mori.symbol("?e2"), _mori.keyword("age"), _mori.symbol("?a2")), _mori.vector(_mori.symbol("?e3"), _mori.keyword("age"), _mori.symbol("?a3")), _mori.vector(_mori.list(_mori.symbol("+"), _mori.symbol("?a1"), _mori.symbol("?a2")), _mori.symbol("?a12")), _mori.vector(_mori.list(_mori.symbol("="), _mori.symbol("?a12"), _mori.symbol("?a3"))));
