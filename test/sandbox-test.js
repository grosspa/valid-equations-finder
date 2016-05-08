var chai = require( 'chai' )
var expect = chai.expect;
var sinon = require( 'sinon' )

var app = require( '../sandbox' )

describe( 'findValidEquations', function() {
  var f = [2, 3, 5, 7, 11]
  var e = [ '2 - 3 + 5 + 7 = 11', '2 = ( 3 * 5 + 7 ) / 11' ] // 12 total

  it('should find two equations for [5, 2, 3]', function() {
      var listOfNumbers = [5, 2, 3];
      var validEquations = app.findValidEquations( listOfNumbers );

      expect( validEquations ).to.have.length(2);
      expect( validEquations ).to.contain( '5 = 2 + 3');
      expect( validEquations ).to.contain( '5 - 2 = 3');
  })

  it('should find two equations for [6, 2, 3]', function() {
      var listOfNumbers = [6, 2, 3];
      var validEquations = app.findValidEquations( listOfNumbers );

      expect( validEquations ).to.have.length(2);
      expect( validEquations ).to.contain( '6 = 2 * 3');
      expect( validEquations ).to.contain( '6 / 2 = 3');
  })

  it('should find 12 equations for [2 3 5 7 11]', function() {
    var listOfNumbers = [2, 3, 5, 7, 11]
    var validEquations = app.findValidEquations( listOfNumbers );
    console.log( validEquations )
    expect( validEquations ).to.have.length( 12 );
  });
})

describe( 'crossExpressions', function() {
  it('should apply all operators to create new expressions', function() {
    var leftHandExpressionEvalutions = new Map();
    leftHandExpressionEvalutions.set(5, ['5']);

    var rightHandExpressionEvaluations = new Map();
    rightHandExpressionEvaluations.set( 2, ['2']);

    var result = app.crossExpressions( leftHandExpressionEvalutions, rightHandExpressionEvaluations)

    expect( result.size ).to.equal( 4 );
    expect( result.get(7) ).to.contain( '5 + 2' );
    expect( result.get(3) ).to.contain( '5 - 2' );
    expect( result.get(10) ).to.contain( '5 * 2' );
    expect( result.get(2.5) ).to.contain( '5 / 2' );
  })

  it('should put parenthesis around expressions longer than a single number', function() {
    var leftHandExpressionEvalutions = new Map();
    leftHandExpressionEvalutions.set(5, ['2 + 3']);

    var rightHandExpressionEvaluations = new Map();
    rightHandExpressionEvaluations.set( 2, ['2']);

    var result = app.crossExpressions( leftHandExpressionEvalutions, rightHandExpressionEvaluations)

    expect( result.size ).to.equal( 4 );
    expect( result.get(7) ).to.contain( '(2 + 3) + 2' );
    expect( result.get(3) ).to.contain( '(2 + 3) - 2' );
    expect( result.get(10) ).to.contain( '(2 + 3) * 2' );
    expect( result.get(2.5) ).to.contain( '(2 + 3) / 2' );
  })

  it('should store all expressions that evaluate to a value', function() {
    var leftHandExpressionEvalutions = new Map();
    leftHandExpressionEvalutions.set(1, ['1']);
    leftHandExpressionEvalutions.set(3, ['3']);

    var rightHandExpressionEvaluations = new Map();
    rightHandExpressionEvaluations.set( 2, ['2']);
    rightHandExpressionEvaluations.set( 6, ['6']);

    var result = app.crossExpressions( leftHandExpressionEvalutions, rightHandExpressionEvaluations)
    expect( result.get(6) ).to.contain( '3 * 2' )
    expect( result.get(6) ).to.contain( '1 * 6' )
  })
})

describe( 'addExpressionValue', function() {
    var expressionsValueMap

    beforeEach( function() {
      expressionsValueMap = new Map()
    })

    it( 'should add a new value to the expressionsValueMap if the key does not exist', function() {
      var expressionValue = 5
      var expression = '2 + 3'

      app.addExpressionValue( expressionsValueMap, expressionValue, expression )

      expect( expressionsValueMap.get( expressionValue )).to.contain( expression )
    })

    it( 'should append an expression to an existing list if the key already exists', function() {
        var expressionValue = 6
        var existingExpression = '3 * 2'
        expressionsValueMap.set( 6, ['3 * 2'] )

        var expressionToAppend = '4 + 2'

        app.addExpressionValue( expressionsValueMap, expressionValue, expressionToAppend )

        expect( expressionsValueMap.get( expressionValue )).to.be.length( 2 )
        expect( expressionsValueMap.get( expressionValue )).to.contain( existingExpression )
        expect( expressionsValueMap.get( expressionValue )).to.contain( expressionToAppend )

    })
})

describe( 'enumerateEquations', function() {
    var expressionsValueMap

    beforeEach( function() {
      expressionsValueMap = new Map()
    })

    it( 'should do stuff', function() {
      var expressionValue = 5
      var expression = '2 + 3'

      app.enumerateEquations( [2, 3], 2, '', 0, 0, expressionsValueMap, [] )

      console.log( expressionsValueMap )


      expect( expressionsValueMap.get( expressionValue )).to.contain( expression )
    })

    it( 'should do more stuff', function() {
      app.enumerateEquations( [3, 5, 7, 11], 4, '', 0, 0, expressionsValueMap, [] )
      // console.log( expressionsValueMap )
      console.log( expressionsValueMap.get(2) )
      console.log( `length: ${expressionsValueMap.get(2).length}`)
    })

    it( 'should return true if right paren would be redundant', function() {
      expect( app.wouldRightParenBeRendundant( '((3 * 5 + 7)')).to.be.true
    })

    it( 'should return false if right paren would not be redundant', function() {
      expect( app.wouldRightParenBeRendundant( '(3 * (5 + 7)')).to.be.false
    })

    it( 'should get the operator', function() {
        expect( app.getOperatorFromChar( '*' ).symbol ).to.equal( '*' )
    })

    it( 'should return undefined if no operator for symbol', function() {
        expect( app.getOperatorFromChar( '%')).to.be.undefined
    })
})

describe( 'willRightParenChangeEvaluation', function() {

  var functionSpy

  beforeEach( function() {
    functionSpy = sinon.spy( app, 'willRightParenChangeEvaluation')
  })

  afterEach( function() {
    app.willRightParenChangeEvaluation.restore()
  })

  describe( 'if the parens are balanced', function() {
    var imbalancedRightParens = 0

    describe( 'and the last char is an operator', function() {
      it( 'should return true if the lowestOperatorPrecedence is less than the preceding operator precendence', function() {
        expect( app.willRightParenChangeEvaluation( '3 *', {}, imbalancedRightParens, false, 1 )).to.be.true
      })

      it( 'should return true if the lowestOperatorPrecedence is less than the following operator precendence', function() {
        expect( app.willRightParenChangeEvaluation( '3 +', {precendence: 2}, imbalancedRightParens, false, 1 )).to.be.true
      })

      it( 'should return true if the expression contains an asymmetric operator', function() {
        expect( app.willRightParenChangeEvaluation( '3 +', {precendence: 1}, imbalancedRightParens, true, 1 )).to.be.true
      })

      it( 'should return false if the expression had no asymmetric operator or lower precedence operations', function() {
        expect( app.willRightParenChangeEvaluation( '3 +', {precendence: 1}, imbalancedRightParens, false, 1 )).to.be.false
      })
    })

    describe( 'and the last char is not an operator', function() {
      it( 'should recurse removing the last character of the expression', function() {
          app.willRightParenChangeEvaluation( '3 + ', {}, imbalancedRightParens, true, 1)
          expect( functionSpy.calledWith( '3 +', {}, imbalancedRightParens, true, 1 )).to.be.true
      })
    })

    describe( 'and there are no characters left in the expression', function() {
      it( 'should return true if the lowestOperatorPrecedence is less than the following operator precendence', function() {
          expect( app.willRightParenChangeEvaluation(  '', {precendence: 2}, imbalancedRightParens, true, 1)).to.be.true
      })

      it( 'should return false if the lowestOperatorPrecedence is equal to the following operator precendence', function() {
          expect( app.willRightParenChangeEvaluation( '', {precendence: 1}, imbalancedRightParens, false, 1 )).to.be.false
      })

      it( 'should return false if there is no following operator', function() {
          expect( app.willRightParenChangeEvaluation( '', null, imbalancedRightParens, false, 1 )).to.be.false
      })
    })
  })

  describe( 'if the last char is a left paren', function() {
    describe( 'it should recurse', function() {
      it( 'and remove the last character of the expression', function() {
        app.willRightParenChangeEvaluation( '3 + (', {}, 1, true, 1)
        expect( functionSpy.calledWith( '3 + ')).to.be.true
      })

      it('and decrement the imbalancedRightParens', function() {
        app.willRightParenChangeEvaluation( '3 + (', {}, 1, true, 1)
        expect( functionSpy.calledWith( '3 + ', {}, 0)).to.be.true
      })
    })
  })

  describe( 'if the last char is a right paren', function() {
    describe( 'it should recurse', function() {
      it( 'and remove the last character of the expression', function() {
        app.willRightParenChangeEvaluation( '3 + ( 4 / ( 2 + 3 )', {}, 1, true, 1)
        expect( functionSpy.calledWith( '3 + ( 4 / ( 2 + 3 ')).to.be.true
      })

      it('and increment the imbalancedRightParens', function() {
        app.willRightParenChangeEvaluation( '3 + ( 4 / ( 2 + 3 )', {}, 1, true, 1)
        expect( functionSpy.calledWith( '3 + ( 4 / ( 2 + 3 ', {}, 2)).to.be.true
      })
    })
  })

  describe( 'if the last character is an operator', function() {
    describe( 'and number of imbalanced right parens is 1', function() {
      var imbalancedRightParens = 1

      describe( 'it should recurse', function() {
        it( 'and remove the last character of the expression', function() {
          app.willRightParenChangeEvaluation( '3 + ( 4 / ( 2 -', {}, imbalancedRightParens, true, 1)
          expect( functionSpy.calledWith( '3 + ( 4 / ( 2 ')).to.be.true
        })

        it( 'and set containsAsymmetricOperator to true if the operator is asymmetric', function() {
          app.willRightParenChangeEvaluation( '3 + ( 4 / ( 2 -', {}, imbalancedRightParens, false, 1)
          expect( functionSpy.calledWith( '3 + ( 4 / ( 2 ', {}, 1, true)).to.be.true
        })

        it( 'and leave containsAsymmetricOperator as false if the operator is symmetric', function() {
          app.willRightParenChangeEvaluation( '3 + ( 4 / ( 2 +', {}, imbalancedRightParens, false, 1)
          expect( functionSpy.calledWith( '3 + ( 4 / ( 2 ', {}, 1, false)).to.be.true
        })

        it( 'and leave containsAsymmetricOperator as true if the operator is symmetric', function() {
          app.willRightParenChangeEvaluation( '3 + ( 4 / ( 2 +', {}, imbalancedRightParens, true, 1)
          expect( functionSpy.calledWith( '3 + ( 4 / ( 2 ', {}, 1, true)).to.be.true
        })
      })
    })

    describe( 'and the number of imbalanced parens is greater than 1', function() {
      describe( 'it should recurse', function() {
        it( 'and remove the last character of the expression', function() {
          app.willRightParenChangeEvaluation( '3 + ( 4 / ( 2 -', {}, 2, true, 1)
          expect( functionSpy.calledWith( '3 + ( 4 / ( 2 ', {}, 2, true, 1)).to.be.true
        })
      })
    })
  })

  describe( 'if the last character is not a paren', function() {
    describe( 'it should recurse', function() {
      it( 'and remove the last character of the expression', function() {
        app.willRightParenChangeEvaluation( '3 + ( 4 / ( 2', {}, 2, true, 1)
        expect( functionSpy.calledWith( '3 + ( 4 / ( ', {}, 2, true, 1)).to.be.true
      })
    })

    it( 'should test', function() {
      //'3 - 5 - (7 - 11)'
      // 2 - (3 - ( 5 + 
      expect( app.willRightParensChangeEvaluation( '2 - ( 3 - ( 5 + ', null, 1) ).to.be.true
      // var x = app.willRightParenChangeEvaluation( '3 - 5 - (7 - ', null, 1, false, 10)
      // expect( x ).to.be.true
    })
  })
})

/*
a   b   c
  1   2         (a b) c
  2   1         a (b c)

a   b   c   d
  1   2   3     ((a b) c) d
  1   3   2     (a b) (c d)
  2   1   3     (a (b c)) d
  2   3   1     (a b) (c d)
  3   1   2     a ((b c) d)
  3   2   1     a (b (c d))
*/
