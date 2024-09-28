import expressionGenerator from "./lib/expressionGenerator.js";
import evaluateExpression from "./lib/solveExpression.js";
import OptionsGenerator from "./lib/OptionsGenerator.js";
const mcqGenerator=(config,totalQuestions=1)=>{
    let i=0;
    let questions=[];
    
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
export default mcqGenerator;