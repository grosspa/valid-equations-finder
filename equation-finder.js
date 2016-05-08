
var operators = [
  { symbol: '+', isSymmetric: true,  precendence: 1, apply: function( a, b ) { return a + b } },
  { symbol: '-', isSymmetric: false, precendence: 1, apply: function( a, b ) { return a - b } },
  { symbol: '*', isSymmetric: true,  precendence: 2, apply: function( a, b ) { return a * b } },
  { symbol: '/', isSymmetric: false, precendence: 2, apply: function( a, b ) { return a / b } }
]

function findValidEquations (listOfNumbers) {
  var validEquations = [];

  // Iterate through the locations of the equal sign in splitting the numbers
  for (var equalSignSplitIndex = 1; equalSignSplitIndex < listOfNumbers.length; equalSignSplitIndex++) {
    var leftHandNumbers  = listOfNumbers.slice(0, equalSignSplitIndex );
    var rightHandNumbers = listOfNumbers.slice( equalSignSplitIndex );

    // Generate all possible values, and corresponding simplified expressions,
    // for the list of numbers provided.
    var leftHandExpressionEvaluations = enumerateExpressions( leftHandNumbers );
    var rightHandExpressionEvaluations = enumerateExpressions( rightHandNumbers );

    // For each value generated on the left hand side, if the same value was generated
    // for the right hand side then we have some equivalent expressions
    leftHandExpressionEvaluations.forEach( (lhsExpressions, lhsValue ) => {
        if( rightHandExpressionEvaluations.has( lhsValue ) ) {

          // For each each of the left hand expressions, pair it with each of the
          // right hand expressions (cross product) to generate valid equations.
          lhsExpressions.forEach( ( lhsExpression ) => {
            rightHandExpressionEvaluations.get( lhsValue ).forEach( ( rhsExpression ) => {
                validEquations.push( `${lhsExpression.expressionString} = ${rhsExpression.expressionString}` )
            })
          })
        }
    })
  }

  return validEquations;
}


function enumerateExpressions ( listOfNumbers ) {
  var expressionEvaluations = new Map();
  enumerateExpressions_helper( listOfNumbers, listOfNumbers.length, '', 0, 0, expressionEvaluations, [])
  return expressionEvaluations
}

// Recursive helper that accumulates evaluated expressions
function enumerateExpressions_helper( listOfNumbers, listOfNumbersCount, currentExpression, openLeftParens, closedRightParens, expressionEvaluations, selectedOperators ) {
  if( listOfNumbers.length == 1) {
    var rightParensRequired = openLeftParens - closedRightParens
    var expression = {
      // The string we will evaluate and display
      expressionString: `${currentExpression} ${listOfNumbers[0]}${')'.repeat(rightParensRequired)}`.trim(),
      // This represents a unique operators signature. The assumption is that by removing all values and
      // parens we create a way to compare two expression strings and determine they are effectively the
      // same. Building on this, we assume that there exists only one simplified expression string that
      // evaluates to a value: all other distributions of parenthesis either evaluate to a different value
      // or can be simplified. Also, we assume the simplified expression string is the shortest.
      // NOTE: this assumption is wrong:
      // 2 - ( 3 - ( 5 + 7 ))
      // 2 - ( 3 - 5 ) + 7
      operatorsString: selectedOperators.map( (operator) => operator.symbol ).join( '' )
    }
    var expressionValue = eval( expression.expressionString )

    addExpressionValue( expressionEvaluations, expressionValue, expression )
  } else {
    enumerateLeftParens( listOfNumbers, listOfNumbersCount, currentExpression, openLeftParens, closedRightParens, expressionEvaluations, selectedOperators )
    enumerateRightParens( listOfNumbers, listOfNumbersCount, currentExpression, openLeftParens, closedRightParens, expressionEvaluations, selectedOperators )
  }
}

function addExpressionValue( expressionValueMap, expressionValue, expression ) {
  var expressions = expressionValueMap.get( expressionValue )

  if( expressions == null ) {
      expressionValueMap.set( expressionValue, [ expression ] )
  } else {
    var existingExpressionIndex = expressions.findIndex( ( acceptedExpression ) => acceptedExpression.operatorsString == expression.operatorsString )

    // if another expression already exists with the same operators signature, and
    // this new expression shorter than the one already stored
    if( existingExpressionIndex >= 0 && expression.expressionString.length < expressions[existingExpressionIndex].expressionString.length) {
        expressions.splice( existingExpressionIndex, 1, expression )
    } else if( existingExpressionIndex == -1 ) {
        expressions.push( expression )
    } else {
      // This was redundant, a simplified equation existed that whose expression string was shorter
      // and had the same operators signature
    }
  }
}

function enumerateLeftParens( listOfNumbers, listOfNumbersCount, currentExpression, openLeftParens, closedRightParens, expressionEvaluations, selectedOperators ) {
  var firstNumber = listOfNumbers.slice(0, 1)     // car
  var restOfNumbers = listOfNumbers.slice( 1 )    // cdr

  // Try adding as many left parens as are valid for given how many left parens are already present and how many numbers are left
  for( var newOpenLeftParens = 0; newOpenLeftParens + openLeftParens <= restOfNumbers.length; newOpenLeftParens++ ) {
    operators.forEach( (operator) => {
      enumerateExpressions_helper(
        restOfNumbers,
        listOfNumbersCount,
        `${currentExpression} ${'('.repeat(newOpenLeftParens)}${firstNumber} ${operator.symbol}`,
        openLeftParens + newOpenLeftParens,
        closedRightParens,
        expressionEvaluations,
        selectedOperators.concat( operator )
      );
    })
  }
}

function enumerateRightParens( listOfNumbers, listOfNumbersCount, currentExpression, openLeftParens, closedRightParens, expressionEvaluations, selectedOperators ) {
  var firstNumber = listOfNumbers.slice(0, 1)     // car
  var restOfNumbers = listOfNumbers.slice( 1 )    // cdr

  // Iterate through closing all left parens currently in the expression
  for( var newClosedRightParens = 0; newClosedRightParens + closedRightParens <= openLeftParens && openLeftParens > 0; newClosedRightParens++ ) {
      operators.forEach( (operator) => {
          enumerateExpressions_helper(
            restOfNumbers,
            listOfNumbersCount,
            `${currentExpression} ${firstNumber}${')'.repeat(newClosedRightParens)} ${operator.symbol}`,
            openLeftParens,
            newClosedRightParens + closedRightParens,
            expressionEvaluations,
            selectedOperators.concat( operator )
          );
      })
  }
}

module.exports = {
  findValidEquations: findValidEquations
}
