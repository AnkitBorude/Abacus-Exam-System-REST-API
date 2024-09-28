import expressionGenerator from "./lib/expressionGenerator.js";
import evaluateExpression from "./lib/solveExpression.js";
import OptionsGenerator from "./lib/OptionsGenerator.js";

/**
 * Generates multiple-choice questions (MCQs) based on the provided configuration.
 * 
 * @param {Object} config - The configuration object for generating MCQs.
 * @param {number} config.maxTerms - The maximum number of terms in each question.
 * @param {number} config.minNumber - The minimum value of numbers in each question.
 * @param {number} config.maxNumber - The maximum value of numbers in each question.
 * @param {string[]} config.operators - The allowed operators for the questions.
 * @param {number} [totalQuestions=1] - The total number of MCQs to generate. Default is 1.
 * 
 * @returns {Object[]} - An array of objects representing the MCQs. Each object contains the question and possible answers.
 */

const mcqGenerator=(config,totalQuestions=1)=>{
    let i=0;
    let questions=[];
  
    //validation
    validateConfig(config);
while(i<totalQuestions)
{
  const queryString = expressionGenerator(config); //generating the question
  const expressionAnswer=evaluateExpression(queryString); //evaluting question

  if(expressionAnswer>5)//if the answer is greter than 5 then add to questions list only
  //otherswise the double multiple options could be generated back to back
  {
    let options=OptionsGenerator(expressionAnswer);//generating nearby options with one answer putten randomly
    let questionObj={
      question:queryString,
      option_1:options[0],
      option_2:options[1],
      option_3:options[2],
      option_4:options[3],
      answer:expressionAnswer
    }
    questions.push(questionObj);
    i++;
  }
}
return questions;
}

const validateConfig=(config)=>{
  if (typeof config !== 'object' || config === null) {
    throw new Error('Invalid config: must be a non-null object.');
  }

  // Validate maxTerms (must be between 2 and 14)
  if (config.maxTerms < 2 || config.maxTerms > 14) {
    throw new Error('Invalid maxTerms: must be a number between 2 and 14.');
  }

  // Validate minNumber (must be greater than 1 and non-negative)
  if (config.minNumber <= 1) {
    throw new Error('Invalid minNumber: must be a number greater than 1 and non-negative.');
  }

  // Validate maxNumber (must be greater than or equal to minNumber and less than 1000)
  if (config.maxNumber > config.minNumber || config.maxNumber >= 1000) {
    throw new Error('Invalid maxNumber: must be a number greater than or equal to minNumber and less than 1000.');
  }

  // Validate operators (must only include "+", "-", "*", "/")
  const allowableOperators = ["+", "-", "*", "/"];
  if (!Array.isArray(config.operators) || config.operators.length === 0) {
    throw new Error('Invalid operators: must be a non-empty array.');
  }
  
  // Ensure all operators are valid
  for (const operator of config.operators) {
    if (typeof operator !== 'string' || !allowableOperators.includes(operator)) {
      throw new Error(`Invalid operator: "${operator}" is not one of the allowed operators: ${allowableOperators.join(", ")}.`);
    }
  }

  // Validate totalQuestions (must be greater than or equal to 1)
  if (config.totalQuestions < 1) {
    throw new Error('Invalid totalQuestions: must be a number greater than or equal to 1.');
  }
}
export default mcqGenerator;