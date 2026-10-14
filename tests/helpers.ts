import { expect, type Page } from '@playwright/test';
import { demoModelInfo } from '../src/config/indicator';

export async function fillExample(page: Page) {
  await page.getByLabel('Возраст').fill('52');
  await page.getByLabel('Пол', { exact: false }).selectOption('male');
  await page.getByLabel('Индекс массы тела').fill('27,4');
  await page.getByLabel('Общий холестерин').fill('5.6');
  await page.getByLabel('Глюкоза').fill('5,9');
}

export async function mockModel(page: Page) {
  await page.route('**/api/v1/model/info', (route) => route.fulfill({ json: {
    ...demoModelInfo, decimalPlaces: null, modelVersion: '1.0.0',
  } }));
}

export async function expectNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}
