
var operators = [
  { symbol: '+', isSymmetric: true,  precendence: 1, apply: function( a, b ) { return a + b } },
  { symbol: '-', isSymmetric: false, precendence: 1, apply: function( a, b ) { return a - b } },
  { symbol: '*', isSymmetric: true,  precendence: 2, apply: function( a, b ) { return a * b } },
  { symbol: '/', isSymmetric: false, precendence: 2, apply: function( a, b ) { return a / b } }
]

var self = this

function addExpressionValue( expressionValueMap, expressionValue, expression ) {
  var expressions = expressionValueMap.get( expressionValue )
  if( expressions == null ) {
      expressionValueMap.set( expressionValue, [ expression ] )
  // } else {
  //   var existingExpressionIndex = expressions.findIndex( ( acceptedExpression ) => acceptedExpression.operatorsString == expression.operatorsString )
  //   if( existingExpressionIndex >= 0 && expression.expressionString.length < expressions[existingExpressionIndex].expressionString.length) {
  //       expressions.splice( existingExpressionIndex, 1, expression )
  //   } else if( existingExpressionIndex == -1 ) {
  //       expressions.push( expression )
  //   } else {
  //     // console.log( `Redundant ${expression.expressionString}`)
  //   }
  // }
  } else if (expressions.indexOf( expression.expressionString ) == -1 ) {
      expressions.push( expression )
  }
}

function foo( listOfNumbers ) {
  var expressionEvaluations = new Map();
  enumerateEquations( listOfNumbers, listOfNumbers.length, '', 0, 0, expressionEvaluations, [])
  return expressionEvaluations
}

function enumerateEquations( listOfNumbers, listOfNumbersCount, currentExpression, openLeftParens, closedRightParens, expressionEvaluations, selectedOperators ) {
  if( listOfNumbers.length == 1) {
    var rightParensRequired = openLeftParens - closedRightParens
    if( willRightParensChangeEvaluation( currentExpression, null, rightParensRequired )) {
      var expression = {
        expressionString: `${currentExpression} ${listOfNumbers[0]}${')'.repeat(rightParensRequired)}`.trim(),
        operatorsString: selectedOperators.map( (operator) => operator.symbol ).join( '' )
      }
      var expressionValue = eval( expression.expressionString )
      addExpressionValue( expressionEvaluations, expressionValue, expression )
    }
  } else {
    enumerateLeftParens( listOfNumbers, listOfNumbersCount, currentExpression, openLeftParens, closedRightParens, expressionEvaluations, selectedOperators )
    enumerateRightParens( listOfNumbers, listOfNumbersCount, currentExpression, openLeftParens, closedRightParens, expressionEvaluations, selectedOperators )
  }
}


function enumerateLeftParens( listOfNumbers, listOfNumbersCount, currentExpression, openLeftParens, closedRightParens, expressionEvaluations, selectedOperators ) {
  var firstNumber = listOfNumbers.slice(0, 1)
  var restOfNumbers = listOfNumbers.slice( 1 )

// you can't count the openLeftParens twice, that's what's happening
  for( var newOpenLeftParens = 0; newOpenLeftParens + openLeftParens <= restOfNumbers.length; newOpenLeftParens++ ) {
    operators.forEach( (operator) => {
      enumerateEquations(
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

// Assumes that expression ends in an operator and the invoking function wants
// true if adding some right parens will cause an expression to evaluate earlier
// than regular precendence rules if no parens were present.
function willRightParensChangeEvaluation( expression, operator, totalRightParensToAppend ) {
  for( var rightParensBeingAppended = 1; rightParensBeingAppended <= totalRightParensToAppend; rightParensBeingAppended++ ) {
    if( !self.willRightParenChangeEvaluation( expression, operator, rightParensBeingAppended, false, Number.MAX_SAFE_INTEGER) ) {
      return false
    }
  }

  return true
}

self.willRightParenChangeEvaluation = function( expression, operatorFollowingExpression, imbalancedRightParens, containsAsymmetricOperator, lowestOperatorPrecedence ) {
  var lastChar = expression.charAt( expression.length - 1)

  if( imbalancedRightParens == 0 ) {
    var operatorPrecedingExpression = getOperatorFromChar( lastChar )
    if( operatorPrecedingExpression ) {
      // if the expression had is preceded by an asymmetric operator and there was an operator in this expression, implying
      // that this expression is just not a second or more set of redundant parens around an expression
      return (!operatorPrecedingExpression.isSymmetric && lowestOperatorPrecedence < Number.MAX_SAFE_INTEGER)
          || doesExpressionContainLowerPrecedenceOperator( lowestOperatorPrecedence, operatorPrecedingExpression.precendence )
          || ( operatorFollowingExpression != null && doesExpressionContainLowerPrecedenceOperator( lowestOperatorPrecedence, operatorFollowingExpression.precendence ) )
          || containsAsymmetricOperator
    } else if( lastChar == '(') {
      return ( operatorFollowingExpression != null && doesExpressionContainLowerPrecedenceOperator( lowestOperatorPrecedence, operatorFollowingExpression.precendence ) )
    } else if( expression.length > 0 ) {
      return this.willRightParenChangeEvaluation(  expression.slice( 0, expression.length - 1),
            operatorFollowingExpression, imbalancedRightParens, containsAsymmetricOperator, lowestOperatorPrecedence)
    } else if( operatorFollowingExpression ){ // We've reached the left end of the string, there is no preceding operator
      return doesExpressionContainLowerPrecedenceOperator( lowestOperatorPrecedence, operatorFollowingExpression.precendence )
    } else { // These parens enclose the whole expression
      return false
    }

  } else if( lastChar == '(' ) {
    return this.willRightParenChangeEvaluation(  expression.slice( 0, expression.length -1 ),
          operatorFollowingExpression,
          imbalancedRightParens - 1,
          containsAsymmetricOperator,
          lowestOperatorPrecedence )

  } else if( lastChar == ')' ) {
    return this.willRightParenChangeEvaluation(  expression.slice( 0, expression.length -1 ),
          operatorFollowingExpression,
          imbalancedRightParens + 1,
          containsAsymmetricOperator,
          lowestOperatorPrecedence )

  } else {
    var operatorInExpression = getOperatorFromChar( lastChar )

    if( operatorInExpression && imbalancedRightParens == 1 ) {
      return this.willRightParenChangeEvaluation( expression.slice( 0, expression.length -1 ),
            operatorFollowingExpression,
            imbalancedRightParens,
            containsAsymmetricOperator || !operatorInExpression.isSymmetric,
            operatorInExpression.precendence < lowestOperatorPrecedence ? operatorInExpression.precendence : lowestOperatorPrecedence )
    } else {
      return this.willRightParenChangeEvaluation( expression.slice( 0, expression.length - 1),
            operatorFollowingExpression, imbalancedRightParens, containsAsymmetricOperator, lowestOperatorPrecedence)
    }
  }
}

function doesExpressionContainLowerPrecedenceOperator( lowestOperatorPrecedence, preOrPostOperatorPrecedence ) {
  return lowestOperatorPrecedence < preOrPostOperatorPrecedence
}

function getOperatorFromChar( c ) {
  return operators.find( (op) => op.symbol == c )
}

// need function for saying if we should bother closing a paren,
// (1) is this right paren just wrapping the first expression?
// (2) is this right par

function wouldRightParenBeRendundant( currentExpression ) {
  // need to account for adding more than one paren at a time
  if( !currentExpression.endsWith(')')) {
    return false
  }

  var parensBalance = 1
  var expressionIndex = currentExpression.length - 2
  while( parensBalance > 0 && expressionIndex > 0) {
    var currentExpressionCharacter = currentExpression.charAt( expressionIndex )
    if( currentExpressionCharacter == ')') {
      parensBalance++
    } else if( currentExpressionCharacter == '(') {
      parensBalance--
    }

    expressionIndex--
  }

  return expressionIndex >= 0 && currentExpression.charAt( expressionIndex ) == '('
}

function enumerateRightParens( listOfNumbers, listOfNumbersCount, currentExpression, openLeftParens, closedRightParens, expressionEvaluations, selectedOperators ) {
  var firstNumber = listOfNumbers.slice(0, 1)
  var restOfNumbers = listOfNumbers.slice( 1 )

  for( var newClosedRightParens = 0; newClosedRightParens + closedRightParens <= openLeftParens && openLeftParens > 0; newClosedRightParens++ ) {
      operators.forEach( (operator) => {
          if( willRightParensChangeEvaluation( currentExpression, operator, newClosedRightParens )) {
            enumerateEquations(
              restOfNumbers,
              listOfNumbersCount,
              `${currentExpression} ${firstNumber}${')'.repeat(newClosedRightParens)} ${operator.symbol}`,
              openLeftParens,
              newClosedRightParens + closedRightParens,
              expressionEvaluations,
              selectedOperators.concat( operator )
            );
          }
      })
  }
}


// expressionValueRepresentation
// { n: [ expression strings ] }
function addExpressionParenthesis( expression ) {
  return expression.length == 1 ? expression : `(${expression})`
}

// ( a b c )
// ( a b ) c
// a ( b c )

// window size
// window index

//

function crossExpressions( leftExpressionsEvaluations, rightExpressionEvaluations) {
  var crossedExpressionsMap = new Map();
  leftExpressionsEvaluations.forEach( ( lhsExpressions, lhsValue ) => {
    rightExpressionEvaluations.forEach( ( rhsExpressions, rhsValue ) => {
      operators.forEach( (operator) => {
        var crossedValue = operator.apply( lhsValue, rhsValue );
        var crossedExpressions = [];

        lhsExpressions.forEach(( lhsExpression ) => {
          rhsExpressions.forEach(( rhsExpression ) => {
            var crossedExpression =
              `${addExpressionParenthesis(lhsExpression)} ${operator.symbol} ${addExpressionParenthesis(rhsExpression)}`
            crossedExpressions.push( crossedExpression );
          });
        });

        var existingCrossedExpressions = crossedExpressionsMap.get( crossedValue );
        if( existingCrossedExpressions ) {
            crossedExpressionsMap.set( crossedValue,
              existingCrossedExpressions.concat( crossedExpressions ) );
        } else {
            crossedExpressionsMap.set( crossedValue, crossedExpressions );
        }

      })
    })
  })
  return crossedExpressionsMap;
}

var findValidEquations = (listOfNumbers) => {
  var validEquations = [];

  for (var equalSignSplitIndex = 1; equalSignSplitIndex < listOfNumbers.length; equalSignSplitIndex++) {
    var leftHandNumbers  = listOfNumbers.slice(0, equalSignSplitIndex );
    var rightHandNumbers = listOfNumbers.slice( equalSignSplitIndex );

    var leftHandExpressionEvaluations = foo( leftHandNumbers );
    var rightHandExpressionEvaluations = foo( rightHandNumbers );

    // console.log( `${leftHandNumbers} = ${rightHandNumbers}`)

    // var leftHandExpressionEvaluations = enumerateExpressionAssociations( leftHandNumbers );
    // var rightHandExpressionEvaluations = enumerateExpressionAssociations( rightHandNumbers );

    // console.log( 'left');
    // console.log( leftHandExpressionEvaluations )
    // console.log( 'right' )
    // console.log( rightHandExpressionEvaluations )

    leftHandExpressionEvaluations.forEach( (lhsExpressions, lhsValue ) => {
        if( rightHandExpressionEvaluations.has( lhsValue ) ) {
          lhsExpressions.forEach( ( lhsExpression ) => {
            rightHandExpressionEvaluations.get( lhsValue ).forEach( ( rhsExpression ) => {
                validEquations.push( `${lhsExpression.expressionString} = ${rhsExpression.expressionString}` )
            })
          })
        }
    })

    // for( leftHandExpressionValue in leftHandExpressionEvaluations ) {
    //   if( rightHandExpressionEvaluations[leftHandExpressionValue] != undefined ) {
    //       validEquations.push(
    //         leftHandExpressionEvaluations[leftHandExpressionValue] + ' = ' +
    //         rightHandExpressionEvaluations[leftHandExpressionValue]
    //       )
    //   }
    // }
  }

  return validEquations;
}

function enumerateExpressionAssociations( numbers ) {
  // console.log( `enumerating ${numbers}`)
  if( numbers.length == 1 ) {
    return getSingleNumberExpressionMap( numbers[0] );

  } else if( numbers.length == 2 ) {
    var lhsExpressionEvaluations = getSingleNumberExpressionMap( numbers[0] )
    var rhsExpressionEvaluations = getSingleNumberExpressionMap( numbers[1] )

    return crossExpressions( lhsExpressionEvaluations, rhsExpressionEvaluations )

  } else {
    var crossedExpressions = new Map();
    for( var associationWindowSize = 1; associationWindowSize < numbers.length; associationWindowSize++ ) {
      var lhsNumbers = numbers.slice( 0, associationWindowSize );
      var rhsNumbers = numbers.slice( associationWindowSize );

      // console.log( `lhsNumbers: ${lhsNumbers} rhsNumbers: ${rhsNumbers}`);

      // need to combine results of the successive cross expressions, then return
      // the aggregated results, returning before we can explore other windows

      crossExpressions(
        enumerateExpressionAssociations( numbers.slice( 0, associationWindowSize )),
        enumerateExpressionAssociations( numbers.slice( associationWindowSize ))
      ).forEach(( expressions, value ) => {
        if( crossedExpressions.has( value ) ) {
          crossedExpressions.get( value ).concat( expressions );
        } else {
          crossedExpressions.set( value, expressions );
        }
      });
    }
    return crossedExpressions;
  }
}

function getSingleNumberExpressionMap( number ) {
    var expressionEvaluations = new Map();
    expressionEvaluations.set( number, [`${number}`])
    return expressionEvaluations
}

function enumerateOperatorAssociations( numbers ) {
  if( numbers.length == 1 ) {
    return getSingleNumberExpressionMap( numbers[0] );

  } else if( numbers.length == 2 ) {
    var lhsExpressionEvaluations = getSingleNumberExpressionMap( numbers[0] )
    var rhsExpressionEvaluations = getSingleNumberExpressionMap( numbers[1] )

    return crossExpressions( lhsExpressionEvaluations, rhsExpressionEvaluations )
  }
}

module.exports = {
  findValidEquations: findValidEquations,
  crossExpressions: crossExpressions,
  addExpressionValue: addExpressionValue,
  enumerateEquations: enumerateEquations,
  wouldRightParenBeRendundant: wouldRightParenBeRendundant,
  getOperatorFromChar: getOperatorFromChar,
  willRightParensChangeEvaluation: willRightParensChangeEvaluation,
  willRightParenChangeEvaluation: self.willRightParenChangeEvaluation
}
