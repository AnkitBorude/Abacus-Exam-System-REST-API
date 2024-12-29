const evaluateExpression = (expression) => {
    // Remove all whitespace from the expression
    expression = expression.replace(/\s/g, '');

    // Split the expression into an array of numbers and operators
    const tokens = expression.match(/(\d+\.?\d*|\+|-|\*|\/)/g);

    if (!tokens) {
        throw new Error('Invalid expression');
    }

    // Function to perform a single operation
    function operate(a, b, operator) {
        switch (operator) {
            case '+':
                return a + b;
            case '-':
                return a - b;
            case '*':
                return a * b;
            case '/':
                if (b === 0) throw new Error('Division by zero');
                return a / b;
            default:
                throw new Error('Invalid operator');
        }
    }

    // First, handle multiplication and division
    for (let i = 1; i < tokens.length; i += 2) {
        if (tokens[i] === '*' || tokens[i] === '/') {
            const result = operate(
                parseInt(tokens[i - 1]),
                parseInt(tokens[i + 1]),
                tokens[i]
            );
            tokens.splice(i - 1, 3, result.toString());
            i -= 2;
        }
    }

    // Then, handle addition and subtraction
    let result = parseInt(tokens[0]);
    for (let i = 1; i < tokens.length; i += 2) {
        result = operate(result, parseInt(tokens[i + 1]), tokens[i]);
    }

    return Math.round(result);
};

export default evaluateExpression;
