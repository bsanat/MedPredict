import tokenCss from '../styles/tokens.css?raw';
import { jsPDF } from 'jspdf';
import { copies, type Language } from '../i18n';
import type { ModelInfo, Prediction, PredictionInput } from '../types';
import { formatPrediction } from '../validation';

const reportColors = Object.fromEntries([...tokenCss.matchAll(/--([a-z-]+):\s*(#[a-f0-9]+)/gi)]
  .map((match) => [match[1], match[2]]));

export interface Report {
  model: ModelInfo;
  result: Prediction;
  input: PredictionInput;
  demo: boolean;
  language: Language;
}

export interface ReportAssets {
  regular: string;
  bold: string;
  medpredict: string;
  aitu: string;
}

async function loadAsset(path: string, signal: AbortSignal): Promise<string> {
  const response = await fetch(path, { signal });
  if (!response.ok) throw new Error('PDF asset unavailable');
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('PDF asset unreadable'));
    reader.readAsDataURL(blob);
  });
}

async function rasterize(data: string): Promise<string> {
  const image = new Image();
  image.src = data;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth * 2;
  canvas.height = image.naturalHeight * 2;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('PDF logo unavailable');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

export async function generateReport(report: Report, signal: AbortSignal) {
  const [regular, bold, medpredict, aitu] = await Promise.all([
    loadAsset('/fonts/NotoSans-Regular.ttf', signal), loadAsset('/fonts/NotoSans-Bold.ttf', signal),
    loadAsset('/logo.png', signal).then(rasterize), loadAsset('/aitu-logo.svg', signal).then(rasterize),
  ]);
  signal.throwIfAborted();
  const date = new Date();
  return { pdf: createReportPdf(report, { regular, bold, medpredict, aitu }, date), filename: reportFilename(date) };
}

export function reportFilename(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `medpredict-report-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}.pdf`;
}

export function createReportPdf(report: Report, assets: ReportAssets, date: Date): jsPDF {
  const { model, result, input, demo, language } = report;
  if (!Number.isFinite(result.predictedValue) || (!demo && result.unit !== model.unit)) throw new Error('Invalid PDF result');
  const copy = copies[language];
  const doc = new jsPDF({ format: 'a4', unit: 'mm', compress: true, putOnlyUsedFonts: true });
  for (const [style, data] of [['normal', assets.regular], ['bold', assets.bold]] as const) {
    doc.addFileToVFS(`${style}.ttf`, data.includes(',') ? data.slice(data.indexOf(',') + 1) : data);
    doc.addFont(`${style}.ttf`, 'NotoSans', style);
  }
  doc.setProperties({ title: copy.reportTitle, creator: 'MedPredict' });
  let y = 49;
  function header() {
    // Original image proportions include the supplied transparent margins.
    doc.addImage(assets.medpredict, 'PNG', 11, 5, 78, 78 * 414 / 994);
    doc.addImage(assets.aitu, 'PNG', 151, 13, 41, 41 * 228 / 522);
    doc.setDrawColor(reportColors.border!).line(18, 39, 192, 39);
  }
  function nextPage() { doc.addPage(); header(); y = 49; }
  function font(size: number, bold = false) {
    doc.setFont('NotoSans', bold ? 'bold' : 'normal');
    doc.setFontSize(size).setTextColor(bold ? reportColors.primary! : reportColors.text!);
  }
  function paragraph(text: string, size = 10, bold = false) {
    font(size, bold);
    const lines: string[] = doc.splitTextToSize(text, 174);
    const height = size * 0.5;
    for (const line of lines) {
      if (y + height > 275) nextPage();
      doc.text(line, 18, y);
      y += height;
    }
    y += 4;
  }
  header();
  paragraph(copy.reportTitle, 23, true);
  paragraph(copy.studentProject, 10);
  paragraph(`${copy.reportDate}: ${date.toLocaleString(language === 'kk' ? 'kk-KZ' : language === 'ru' ? 'ru-RU' : 'en-GB')}`, 9);
  if (demo) paragraph(copy.reportDemo, 11, true);
  paragraph(model.indicatorName, 15, true);
  paragraph(copy.formTitle, 12, true);

  const widths = [91, 38, 45];
  const columns = [18, 109, 147];
  function row(cells: string[], bold = false) {
    font(9, bold);
    const lines = cells.map((cell, index) => doc.splitTextToSize(cell, widths[index]! - 6) as string[]);
    const total = Math.max(...lines.map((cell) => cell.length));
    const height = total * 5 + 6;
    if (y + height > 273 && height < 215) { nextPage(); tableHeader(); font(9, bold); }
    let offset = 0;
    while (offset < total) {
      const count = Math.min(total - offset, Math.floor((273 - y - 6) / 5));
      if (count < 1) { nextPage(); tableHeader(); font(9, bold); continue; }
      const chunkHeight = count * 5 + 6;
      doc.setDrawColor(reportColors.border!);
      for (let col = 0; col < 3; col++) {
        doc.rect(columns[col]!, y - 4, widths[col]!, chunkHeight);
        lines[col]!.slice(offset, offset + count).forEach((line, index) => doc.text(line, columns[col]! + 3, y + 1 + index * 5));
      }
      y += chunkHeight;
      offset += count;
    }
  }
  function tableHeader() { row([copy.reportField, copy.reportValue, copy.reportUnit], true); }
  tableHeader();
  for (const field of model.fields) {
    const value = input[field.key];
    if (value === undefined) continue;
    const display = field.type === 'select'
      ? field.options.find((option) => option.value === value)?.label
      : typeof value === 'number' ? formatPrediction(value, null, language) : undefined;
    if (display === undefined) throw new Error('Invalid PDF input');
    row([field.label, display, field.type === 'number' ? field.unit : '']);
  }
  y += 12;
  if (y + 35 > 275) nextPage();
  paragraph(copy.resultTitle, 12, true);
  paragraph(`${formatPrediction(result.predictedValue, model.decimalPlaces, language)} ${demo ? model.unit : result.unit}`, 22, true);
  if (result.modelVersion) paragraph(`${demo ? copy.demoVersion : copy.modelVersion}: ${result.modelVersion}`, 9);
  y += 4;
  paragraph(`${copy.disclaimer}.`, 10);
  if (!demo && result.disclaimer && result.disclaimer !== copy.disclaimer) paragraph(result.disclaimer, 9);
  for (let page = 1; page <= doc.getNumberOfPages(); page++) {
    doc.setPage(page); font(9);
    doc.text(String(page), 192, 286, { align: 'right' });
  }
  return doc;
}
