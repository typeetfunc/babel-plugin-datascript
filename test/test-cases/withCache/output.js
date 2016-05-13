import { helpers as _helpers } from 'datascript-mori';
var a = '[?e :age 18]';
var parsed = _helpers.memoized_parse(`[:find  ?e ?email
                          :in    $ [[?n ?email]]
                          :where [?e :name ?n] ${ a }]`);
