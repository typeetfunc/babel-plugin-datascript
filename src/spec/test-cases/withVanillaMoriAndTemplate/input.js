import * as mori from 'mori';

var a = '[?e :age 18]';
var parsed = Datalog.Q`[:find  ?e ?email
                          :in    $ [[?n ?email]]
                          :where [?e :name ?n] ${a}]`;
