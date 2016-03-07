import { datascript } from 'datascript-mori';
import React from 'react';

const { core: ds } = datascript;

var Datalog = Datalog.Q`[:find  ?e ?email
                          :in    $ [[?n ?email]]
                          :where [?e :name ?n]]`;
var result = ds.q(Datalog`[:find ?id
              :in $ [?id ...]
              :where [?id :age _]
            ]`);
ds.q(Datalog`[:find  ?k ?x
              :in    [[?k [?min ?max]] ...] ?range
              :where [(?range ?min ?max) [?x ...]]
                     [(even? ?x)]]`);
