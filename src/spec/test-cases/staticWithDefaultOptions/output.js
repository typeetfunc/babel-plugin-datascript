import { mori as _mori } from 'datascript-mori';
import { datascript } from 'datascript-mori';
import React from 'react';

const { core: ds } = datascript;

var Datalog = _mori.vector(_mori.keyword('find'), _mori.symbol('?e'), _mori.symbol('?email'), _mori.keyword('in'), _mori.symbol('$'), _mori.vector(_mori.vector(_mori.symbol('?n'), _mori.symbol('?email'))), _mori.keyword('where'), _mori.vector(_mori.symbol('?e'), _mori.keyword('name'), _mori.symbol('?n')));
var result = ds.q(_mori.vector(_mori.keyword('find'), _mori.symbol('?id'), _mori.keyword('in'), _mori.symbol('$'), _mori.vector(_mori.symbol('?id'), _mori.symbol('...')), _mori.keyword('where'), _mori.vector(_mori.symbol('?id'), _mori.keyword('age'), _mori.symbol('_'))));
ds.q(_mori.vector(_mori.keyword('find'), _mori.symbol('?k'), _mori.symbol('?x'), _mori.keyword('in'), _mori.vector(_mori.vector(_mori.symbol('?k'), _mori.vector(_mori.symbol('?min'), _mori.symbol('?max'))), _mori.symbol('...')), _mori.symbol('?range'), _mori.keyword('where'), _mori.vector(_mori.list(_mori.symbol('?range'), _mori.symbol('?min'), _mori.symbol('?max')), _mori.vector(_mori.symbol('?x'), _mori.symbol('...'))), _mori.vector(_mori.list(_mori.symbol('even?'), _mori.symbol('?x')))));
