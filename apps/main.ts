/**
 * Calculates the factorial of a non-negative integer.
 * @param {number} n - The number to calculate the factorial of.
 * @returns {number|string} - The factorial result or an error message.
 */
function calculateFactorial(n) {
    // Error handling for negative numbers
    if (n < 0) {
        return "Error: Factorial is not defined for negative numbers.";
    }
    
    // Base case: factorial of 0 or 1 is 1
    if (n === 0 || n === 1) {
        return 1;
    }
    
    // Recursive calculation
    return n * calculateFactorial(n - 1);
}

// Example usage:
const number = 5;
const result = calculateFactorial(number);

console.log(`The factorial of ${number} is: ${result}`);
// Output: The factorial of 5 is: 120