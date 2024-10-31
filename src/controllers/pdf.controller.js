/***********
 * ref:https://chatgpt.com/c/671c792f-07c8-800d-97d4-1dac4c9a59a0
 * 
 */
import generateStudentResultPDF from "../pdftemplets/studentResult.pdf.js";
import Apierror from "../utils/apierror.util.js";
import Apiresponse from "../utils/apiresponse.util.js";
const generatePDF = async (req, res) => {
    try {
        const pdfBuffer = generateStudentResultPDF({name:"Ankit Borude",grade:"15"});
        res.setHeader('Content-Disposition', `attachment; filename=student-report.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        res.status(200).send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Apierror(489,"error while generating pdf"+error);
    }

    // res.status(200).json(new Apiresponse("Reached successfully to pdf controller"));
};

export { generatePDF };