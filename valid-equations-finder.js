var inputs = require( './inputs');
var equationFinder = require( './equation-finder' );

var listOfNumbers = inputs.getInputNumbers()
var areNumbersValid = inputs.validateInputNumbers( listOfNumbers );

if( !areNumbersValid ) {
  return 0;
}

var validEquations = equationFinder.findValidEquations( listOfNumbers );

if( validEquations.length == 0 ) {
  console.log( 'No valid equations found');
} else {
  validEquations.forEach ( function ( equation ) {
    console.log( equation );
  })
  console.log( `Found ${validEquations.length} equations`)
}
