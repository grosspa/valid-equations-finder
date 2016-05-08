# valid-equations-finder

Primary implementation in `equation-finder.js`. Notes and other approaches are found in `sandbox.js` and test cases are written against the sandbox as I iterated over ideas.

For [2, 3, 5, 7, 11] this will find only 9 equations as a flawed assumption is used to remove rendundant equations. Specifically, when adding `2 - ( 3 - 5 + 7 ))` it will drop that expression in favor of `2 - (3 - 5) + 7` because (1) they have the same operators in the same order and (2) the second expression is shorter.
