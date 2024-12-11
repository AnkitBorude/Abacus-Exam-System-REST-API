import {jsPDF} from "jspdf";
import autoTable from "jspdf-autotable";
import { Pdftemplet } from "./pdf.class.js";

/**
 * 
 * @param {Pdftemplet} pdfTemplet 
 * @returns {ArrayBuffer}
 */
const createPdf = (pdfTemplet) => {
   
     let theaders;
    // let headers=['Product Name', 'Quantity', 'Price', 'Total',"extra"];
    //let headers=null;
    if (pdfTemplet.headers==null)
    {
        theaders=null;
    }else
    {
        theaders=[pdfTemplet.headers];
    }
    
    let body=[
        ['Product A', '100', '$50.00', '$5,000.00',"12"],
        ['Product B', '75', '$40.00', '$3,000.00',"13"],
        ['Total', '', '', '$8,000.00',"35"]
    ];
    const doc = new jsPDF();
    let yPos = 20;
        
        // Add company header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(pdfTemplet.title, doc.internal.pageSize.width/2, yPos, { align: 'center' });
        
        // Add report title
        yPos += 10;
        doc.setFontSize(16);
        doc.text(pdfTemplet.subTitle, doc.internal.pageSize.width/2, yPos, { align: 'center' });
        
        // Add report details
        yPos += 20;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Left side details
        doc.text(`Report ID: ${pdfTemplet.reportId}`, 20, yPos);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos + 6);
        
        doc.text(`Generated By: ${pdfTemplet.generatedBy}`, doc.internal.pageSize.width - 20, yPos + 6, { align: 'right' });
        
        // Add table
        yPos += 20;
        const tableData = {
            head: theaders,
            body: pdfTemplet.body
        };
        
        doc.autoTable({
            startY: yPos,
            head: tableData.head,
            body: tableData.body,
            theme: 'grid',
            headStyles: {
                fillColor: [82, 86, 89],
                textColor: 255,
                fontStyle: 'bold'
            },
            footStyles: {
                fillColor: [240, 240, 240],
                textColor: 0,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 10,
                cellPadding: 3,
                halign: 'center'
            }
        });
        
        // Add system generated line at the bottom
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        const generatedText = `This is a system generated report. Generated on ${new Date().toLocaleString()}`;
        
        doc.text(generatedText, doc.internal.pageSize.width/2, pageHeight - 20, { align: 'center' });
    return doc.output('arraybuffer');
};

export default createPdf;