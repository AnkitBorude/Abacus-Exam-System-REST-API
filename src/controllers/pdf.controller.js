import createPdf from '../utils/pdf/generator.pdf.js';
// eslint-disable-next-line no-unused-vars
import { Pdftemplet } from '../utils/pdf/pdf.class.js';
import Apierror from '../utils/apierror.util.js';
/***
 * @async
 * @param {Request} req
 * @param {Response} res
 * @param {Pdftemplet} pdfTemplet
 */
const getPdf = async (req, res, pdfTemplet) => {
    try {
        const pdfBuffer = createPdf(pdfTemplet);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=report.pdf`
        );
        res.setHeader('Content-Type', 'application/pdf');
        
        // eslint-disable-next-line no-undef
        res.status(200).send(Buffer.from(pdfBuffer));
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Apierror(489, 'error while generating pdf' + error.message);
    }
};

export { getPdf };
