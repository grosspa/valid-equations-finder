
var getInputs = () => process.argv.slice(2)

var getInputNumbers = () => {
  var listOfNumberStrings = getInputs();
  var listOfNumbers = listOfNumberStrings.map( ( numberString ) => parseInt( numberString ) );
  return listOfNumbers;
}

var validateInputNumbers = (listOfNumbers) => {
  if( !hasTwoOrMoreNumbers( listOfNumbers ) ) {
    console.log ( "Two or more numbers required in list" )
    return false;
  }

  if( !hasValidNumberValues( listOfNumbers ) ) {
    console.log( "Invalid number input")
    return false;
  }

  return true;
}

var hasTwoOrMoreNumbers = ( listOfNumbers ) => listOfNumbers.length > 1;
var hasValidNumberValues = ( listOfNumbers ) => listOfNumbers.find( (number) => isNaN(number) ) == null

module.exports = {
  getInputNumbers: getInputNumbers,
  validateInputNumbers: validateInputNumbers
}
