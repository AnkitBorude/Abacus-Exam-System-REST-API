import { Random } from 'random-js';
const random = new Random();

const generateQueryString = (config) => {
    const { maxTerms, minNumber, maxNumber, operators } = config;

    const termCount = random.integer(2, maxTerms);
    let expression = '';

    for (let i = 0; i < termCount; i++) {
        // Add a number
        expression += random.integer(minNumber, maxNumber);

        // Add an operator if this isn't the last term
        if (i < termCount - 1) {
            expression += random.pick(operators);
        }
    }
    return expression;
};
export default generateQueryString;
