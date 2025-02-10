export class Pdftemplet {
    /**
     *
     * @param {string} title
     * @param {string} subTitle
     * @param {string} generatedBy
     * @param {string} reportId
     * @param {string[]} headers
     * @param {string[]} body
     */
    constructor(title, subTitle, generatedBy, reportId, headers, body) {
        this.title = title;
        this.subTitle = subTitle;
        this.generatedBy = generatedBy;
        this.reportId = reportId;
        this.headers = headers;
        this.body = body;
    }
}
