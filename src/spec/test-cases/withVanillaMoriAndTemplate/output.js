import * as _mori from 'mori';
import * as mori from 'mori';

var a = '[?e :age 18]';
var parsed = _mori.parse(`[:find  ?e ?email
                          :in    $ [[?n ?email]]
                          :where [?e :name ?n] ${ a }]`);
