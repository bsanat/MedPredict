import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { copies } from '../i18n';
import { localizedDemoModel } from '../config/indicator';
import { createReportPdf, reportFilename, type ReportAssets } from './report';

const assets: ReportAssets = {
  regular: readFileSync('public/fonts/NotoSans-Regular.ttf').toString('base64'),
  bold: readFileSync('public/fonts/NotoSans-Bold.ttf').toString('base64'),
  medpredict: readFileSync('public/logo.png').toString('base64'),
  aitu: readFileSync('public/logo.png').toString('base64'),
};
const date = new Date(2026, 9, 15, 9, 7);
const model = localizedDemoModel(copies.kk);
const report = { model, input: { age: 52, sex: 'female', bmi: 27.4, totalCholesterol: 5.6, glucose: 5.9 },
  result: { predictedValue: 134.2, unit: model.unit }, demo: true, language: 'kk' as const };

describe('PDF report', () => {
  it('uses a local calendar date in the download filename', () => {
    expect(reportFilename(date)).toBe('medpredict-report-2026-10-15-0907.pdf');
  });
  it('creates an A4 text document with embedded Unicode fonts', () => {
    const pdf = createReportPdf(report, assets, date);
    expect(pdf.getNumberOfPages()).toBe(1);
    expect(pdf.internal.pageSize.getWidth()).toBeCloseTo(210);
    expect(pdf.internal.pageSize.getHeight()).toBeCloseTo(297);
    const data = pdf.output();
    expect(data).toMatch(/^%PDF-/);
    expect(data).toContain('/ToUnicode');
    expect(data).toContain('/FontFile2');
  });
  it('paginates long table cells and many rows without losing the result', () => {
    const pdf = createReportPdf({ ...report, model: { ...model,
      fields: [{ key: 'sex', type: 'select', required: true, label: 'Ә Ғ Қ Ң Ө Ұ Ү Һ І '.repeat(400),
        options: [{ value: 'female', label: 'Әйел' }] },
      ...Array.from({ length: 50 }, (_, index) => ({ key: 'age', label: `Ұзын көрсеткіш ${index}`, type: 'number' as const, unit: 'жыл', required: true }))],
    } }, assets, date);
    expect(pdf.getNumberOfPages()).toBeGreaterThan(3);
  });
  it('refuses nonfinite results, mismatched units and invalid input', () => {
    expect(() => createReportPdf({ ...report, result: { predictedValue: NaN, unit: model.unit } }, assets, date)).toThrow();
    expect(() => createReportPdf({ ...report, demo: false, result: { predictedValue: 1, unit: 'wrong' } }, assets, date)).toThrow();
    expect(() => createReportPdf({ ...report, input: { sex: 'unknown' } }, assets, date)).toThrow();
  });
  it('exports localized demo units while retaining the original response unit', () => {
    const pdf = createReportPdf({ ...report, result: { predictedValue: 134.2, unit: 'мм рт. ст.' } }, assets, date);
    expect(pdf.getNumberOfPages()).toBe(1);
  });
});
