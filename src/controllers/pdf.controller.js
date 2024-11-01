/***********
 * ref:https://chatgpt.com/c/671c792f-07c8-800d-97d4-1dac4c9a59a0
 * 
 */
import generatePDF from "../pdftemplets/generator.pdf.js";
import Apierror from "../utils/apierror.util.js";
import Apiresponse from "../utils/apiresponse.util.js";
const generatePDF = async (req, res,pdfTemplet) => {
    try {

        const pdfBuffer = generatePDF(pdfTemplet);
        res.setHeader('Content-Disposition', `attachment; filename=student-report.pdf`);
        res.setHeader('Content-Type', 'application/pdf');
        res.status(200).send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Apierror(489,"error while generating pdf"+error.message);
    }

    // res.status(200).json(new Apiresponse("Reached successfully to pdf controller"));
};

export { generatePDF };