import axios, { AxiosError, AxiosResponse } from 'axios';
import xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import ExcelJS from 'exceljs';

interface ApiTestCase {
  'Execution': string;
  'Application Name': string;
  'Scenario Name': string;
  'Test Case ID': string;
  'Base URI': string;
  'Headers': string;
  'Query Path': string;
  'Query Parameter'?: string;
  'Http Method': string;
  'Body': string;
  'StatusCode'?: number;
  'ContentToVerify'?: string;
}

const DYNAMIC_STORE_PATH = path.join(process.cwd(), 'dynamic-data.json');
const REPORT_PATH = path.join(process.cwd(), 'TestExecutionReport.xlsx');
const ARCHIVE_DIR = path.join(process.cwd(), 'archive');

class ApiHelper {
  private static testData: ApiTestCase[] = [];
  private static reportData: any[] = [];
  private static isArchived = false;

  private static loadExcelData(): void {
    if (this.testData.length === 0) {
      const filePath = path.join(process.cwd(), 'APIData.xlsx');
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets['BookerAPI'];
      const data = xlsx.utils.sheet_to_json<ApiTestCase>(sheet);
      this.testData = data.filter(d => d.Execution === 'Y');
    }
  }

  private static getTestCase(id: string): ApiTestCase {
    this.loadExcelData();
    const test = this.testData.find(tc => tc['Test Case ID'] === id);
    if (!test) throw new Error(`Test case '${id}' not found or marked 'N'`);
    return test;
  }

  private static parseHeaders(headerStr: string): Record<string, string> {
    const headers: Record<string, string> = {};
    if (!headerStr) return headers;

    const headerPairs = headerStr.split('|');
    for (const pair of headerPairs) {
      const [keyPart, valuePart] = pair.split(',');
      const key = keyPart?.replace(/"/g, '').trim();
      const value = valuePart?.replace(/"/g, '').trim();
      if (key && value) headers[key] = value;
    }

    return headers;
  }

  private static parseQueryParams(paramStr: string | undefined): Record<string, string> | undefined {
    if (!paramStr || paramStr.trim() === 'NA') return undefined;

    const params: Record<string, string> = {};
    const pairs = paramStr.split('|');
    for (const pair of pairs) {
      const [keyPart, valuePart] = pair.split(',');
      const key = keyPart?.replace(/"/g, '').trim();
      const value = valuePart?.replace(/"/g, '').trim();
      if (key && value) params[key] = value;
    }

    return params;
  }

  private static injectDynamicVariables(input: string): string {
    if (!fs.existsSync(DYNAMIC_STORE_PATH)) return input;
    const stored = JSON.parse(fs.readFileSync(DYNAMIC_STORE_PATH, 'utf-8'));
    return input.replace(/<(.+?)>/g, (_, key) => stored[key] ?? `<${key}>`);
  }

  public static storeDynamicData(newData: Record<string, any>) {
    let existing = {};
    if (fs.existsSync(DYNAMIC_STORE_PATH)) {
      existing = JSON.parse(fs.readFileSync(DYNAMIC_STORE_PATH, 'utf-8'));
    }
    const updated = { ...existing, ...newData };
    fs.writeFileSync(DYNAMIC_STORE_PATH, JSON.stringify(updated, null, 2));
  }

  private static addToReport(testCase: ApiTestCase, status: string) {
    this.reportData.push({
      Execution: 'Y',
      'Application Name': testCase['Application Name'] || 'BookerAPI',
      'Test Case ID': testCase['Test Case ID'],
      'Scenario Name': testCase['Scenario Name'] || `${testCase['Http Method']}-Booker`,
      Status: status.toUpperCase()
    });
  }

  private static archivePreviousReport(): void {
    if (!this.isArchived && fs.existsSync(REPORT_PATH)) {
      if (!fs.existsSync(ARCHIVE_DIR)) {
        fs.mkdirSync(ARCHIVE_DIR);
      }
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveName = `TestExecutionReport_${timestamp}.xlsx`;
      const archivePath = path.join(ARCHIVE_DIR, archiveName);
      try {
        fs.renameSync(REPORT_PATH, archivePath);
        console.log(`📁 Archived previous report to: ${archivePath}`);
      } catch (err) {
        console.warn(`⚠️ Failed to archive report: ${(err as Error).message}`);
      }
      this.isArchived = true;
    }
  }

  public static async writeReportToExcel(): Promise<void> {
    this.archivePreviousReport();
    
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');

    const columns = ['Execution', 'Application Name', 'Test Case ID', 'Scenario Name', 'Status'];
    const headerRow = sheet.addRow(columns);

    const greenFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } };
    const redFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } };
    const yellowFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFACD' } };

    headerRow.eachCell(cell => (cell.fill = yellowFill));

    this.reportData.forEach(rowData => {
      const row = sheet.addRow(columns.map(col => rowData[col]));
      const fillColor = rowData.Status === 'PASSED' ? greenFill : redFill;
      row.eachCell(cell => (cell.fill = fillColor));
    });

    await workbook.xlsx.writeFile(REPORT_PATH);
    console.log(`📄 Test execution report saved to ${REPORT_PATH}`);
  }

  static async runApi(testCaseId: string): Promise<AxiosResponse | void> {
    const data = this.getTestCase(testCaseId);
    const headers = this.parseHeaders(data.Headers);
    const queryParams = this.parseQueryParams(data['Query Parameter']);
    const rawUrl = `${data['Base URI']}${data['Query Path']}`;
    const url = this.injectDynamicVariables(rawUrl);
    const method = data['Http Method'].toLowerCase() as 'get' | 'post' | 'put' | 'delete';
    const expectedStatus = Number(data.StatusCode) || 200;
    const contentToVerify = data.ContentToVerify;

    let body;
    try {
      const rawBody = this.injectDynamicVariables(data.Body || '');
      body = rawBody ? JSON.parse(rawBody) : undefined;
    } catch (err) {
      console.warn('⚠️ Invalid JSON body. Check Excel format:', data.Body);
      body = undefined;
    }

    console.log('============= Request ===============');
    console.log(`🔍 Executing API: ${testCaseId}`);
    console.log(`➡️ ${method.toUpperCase()} ${url}`);
    console.log('🧾 Request Headers:', headers);
    if (body) console.log('📦 Request Body:', body);
    if (queryParams) console.log('🔗 Query Params:', queryParams);
    console.log('============= Response ===============');

    const startTime = Date.now();

    try {
      const response = await axios({
        method,
        url,
        headers,
        params: queryParams,
        data: body,
        validateStatus: () => true
      });

      const duration = Date.now() - startTime;

      console.log(`✅ Status: ${response.status} ${response.statusText}`);
      console.log(`⏱️ Time Taken: ${duration} ms`);
      //console.log('📥 Response Headers:', response.headers);
      console.log('📨 Response Body:', response.data);
      console.log('============= Validation ===============');

      if (response.status == expectedStatus) {
        console.log(`Actual Status Code = ${response.status}, is equals Expected Status Code = ${expectedStatus}`);
        this.addToReport(data, 'PASSED');
        await this.writeReportToExcel();
      }else{
        this.addToReport(data, 'FAILED');
        await this.writeReportToExcel();
        throw new Error(`❌ Expected status ${expectedStatus}, but got ${response.status}`);
      }

      if (contentToVerify) {
        const verifyParts = contentToVerify.split(',').map(p => p.trim().replace(/"/g, ''));
        const field = verifyParts[0]; // e.g. firstname
        const value = verifyParts[1]; // e.g. Dark
        const bodyString = JSON.stringify(response.data);
        if (bodyString.includes(`"${field}":"${value}"`)) {
          console.log(`Response body include expected content: ${field} = ${value}`);
        }else{
          throw new Error(`❌ Response body does not include expected content: ${field} = ${value}`);
        }
      }

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
        const err = error as AxiosError;
        console.error('❌ API Request Failed');
        console.error(`Status: ${err.response?.status}`);
        console.error('Headers:', err.response?.headers);
        console.error('Data:', err.response?.data);
      } else {
        console.error('❌ Unexpected Error:', error);
      }

      console.log(`⏱️ Time Taken: ${duration} ms`);
      console.log('============================');
    }
  }
}

export default ApiHelper;
