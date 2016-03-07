
var q1 = Datalog`[ :find (sum ?heads) (min ?heads) (max ?heads) (count ?heads) (count-distinct ?heads)
               :with ?monster
               :in   [[?monster ?heads]] ]`;

var q2 = Datalog`[ :find ?color (max ?amount ?x) (min ?amount ?x)
                    :in   [[?color ?x]] ?amount ]`

var q3 = Datalog`[:find ?e ?age ?height
              :where [?e :age ?age]
                     [(get-else $ ?e :height 300) ?height]]`;


var q3 = Datalog`[:find  ?e1 ?e2
              :where [?e1 :age ?a1]
                     [?e2 :age ?a2]
                     [(< ?a1 18 ?a2)]]`;


var q4 = Datalog`[:find  ?e1 ?e2 ?e3
              :where [?e1 :age ?a1]
                     [?e2 :age ?a2]
                     [?e3 :age ?a3]
                     [(+ ?a1 ?a2) ?a12]
                     [(= ?a12 ?a3)]]`;
