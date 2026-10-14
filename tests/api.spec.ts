import { expect, test } from '@playwright/test';
import { demoModelInfo } from '../src/config/indicator';
import { expectNoOverflow, fillExample, mockModel } from './helpers';

test.beforeEach(async ({ page }) => mockModel(page));

test('typed real adapter sends the exact payload, guards rapid submission and preserves precision', async ({ page }) => {
  let count = 0;
  await page.route('**/api/v1/predictions', async (route) => {
    count++;
    expect(route.request().postDataJSON()).toEqual({ age: 52, sex: 'male', bmi: 27.4, totalCholesterol: 5.6, glucose: 5.9 });
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.fulfill({ json: { predictedValue: 134.23456, unit: 'мм рт. ст.', modelVersion: '1.0.0', disclaimer: 'Ограничение сервера.' } });
  });
  await page.goto('/#/predict');
  await expect(page.getByText('Подключение к API', { exact: true })).toBeVisible();
  await fillExample(page);
  await page.locator('form').evaluate((form: HTMLFormElement) => { form.requestSubmit(); form.requestSubmit(); form.requestSubmit(); });
  await expect(page.getByText('134,23456', { exact: true })).toBeVisible();
  expect(count).toBe(1);
  await expect(page.getByText('Версия модели: 1.0.0')).toBeVisible();
  await expect(page.getByText('Ограничение сервера.')).toBeVisible();
  await expect(page.getByText('Фиксированный демонстрационный пример')).toHaveCount(0);
  await expectNoOverflow(page);
});

test('server field validation preserves input and allows corrected retry', async ({ page }) => {
  let count = 0;
  await page.route('**/api/v1/predictions', (route) => {
    count++;
    return route.fulfill(count === 1 ? { status: 400, json: { error: 'VALIDATION_ERROR', fields: [{ field: 'age', message: 'Возраст должен быть от 18 до 90 лет' }] } }
      : { json: { predictedValue: 135.5, unit: 'мм рт. ст.' } });
  });
  await page.goto('/#/predict');
  await fillExample(page);
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await expect(page.getByText('Возраст должен быть от 18 до 90 лет', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Возраст')).toBeFocused();
  await expect(page.getByLabel('Глюкоза')).toHaveValue('5,9');
  await page.getByLabel('Возраст').fill('53');
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await expect(page.getByText('135,5', { exact: true })).toBeVisible();
});

for (const kind of ['network', 'server', 'unknown', 'malformed', 'unit', 'timeout'] as const) {
  test(`${kind} failure shows a general error and never falls back to demo`, async ({ page }) => {
    await page.route('**/api/v1/predictions', async (route) => {
      if (kind === 'network') return route.abort('failed');
      if (kind === 'server') return route.fulfill({ status: 503, body: 'Unavailable' });
      if (kind === 'unknown') return route.fulfill({ status: 400, json: { error: 'VALIDATION_ERROR', fields: [{ field: 'missing_field', message: 'Server error' }] } });
      if (kind === 'timeout') return;
      if (kind === 'unit') return route.fulfill({ json: { predictedValue: 134.2, unit: 'wrong unit' } });
      return route.fulfill({ json: { predictedValue: '134.2', unit: 'мм рт. ст.' } });
    });
    await page.goto('/#/predict');
    await fillExample(page);
    await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
    await expect(page.getByRole('heading', { name: 'Прогноз не получен' })).toBeVisible();
    const messages = {
      network: 'Не удалось связаться с сервером.', server: 'Сервис временно недоступен.',
      unknown: 'Сервер сообщил об ошибке неизвестного поля.', malformed: 'Сервер вернул неожиданный ответ.',
      unit: 'Сервер вернул неожиданный ответ.', timeout: 'Сервер не ответил вовремя.',
    };
    await expect(page.locator('.result-content')).toContainText(messages[kind]);
    await expect(page.getByLabel('Индекс массы тела')).toHaveValue('27,4');
    await expect(page.getByRole('button', { name: 'Повторить запрос' })).toBeEnabled();
    await expect(page.getByText('134,2', { exact: true })).toHaveCount(0);
    await expectNoOverflow(page);
  });
}

test('metadata failure blocks form and can be retried', async ({ page }) => {
  let available = false;
  await page.route('**/api/v1/model/info', (route) => {
    return route.fulfill(available ? { json: demoModelInfo } : { json: { incomplete: true } });
  });
  await page.goto('/#/predict');
  await expect(page.getByRole('heading', { name: 'Не удалось загрузить описание модели' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Получить учебный прогноз' })).toHaveCount(0);
  available = true;
  await page.getByRole('button', { name: 'Попробовать снова' }).click();
  await expect(page.getByLabel('Возраст')).toBeVisible();
});

test('only server-supplied ranges and changed field configuration are used', async ({ page }) => {
  const fields = [{ key: 'measurement', label: 'Новый показатель', type: 'number', unit: 'ед.', required: true, min: 2, max: 10 }];
  await page.route('**/api/v1/model/info', (route) => route.fulfill({ json: {
    indicatorName: 'Другой прогноз', unit: 'ед.', decimalPlaces: 2, fields,
  } }));
  await page.route('**/api/v1/predictions', (route) => {
    expect(route.request().postDataJSON()).toEqual({ measurement: 2.5 });
    return route.fulfill({ json: { predictedValue: 3, unit: 'ед.' } });
  });
  await page.goto('/#/predict');
  await page.getByLabel('Новый показатель').fill('1');
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await expect(page.getByText('Значение должно быть не меньше 2.', { exact: true })).toBeVisible();
  await page.getByLabel('Новый показатель').fill('2,5');
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await expect(page.getByRole('heading', { name: 'Другой прогноз', exact: true })).toBeVisible();
  await expect(page.getByText('3,00', { exact: true })).toBeVisible();
});

test('real PDF exports the existing response without another prediction or demo fallback', async ({ page }, testInfo) => {
  let requests = 0;
  await page.addInitScript(() => { window.print = () => { throw new Error('Printing must not be called'); }; });
  await page.route('**/api/v1/predictions', (route) => {
    requests++;
    return route.fulfill({ json: { predictedValue: 141.98765, unit: 'мм рт. ст.' } });
  });
  await page.goto('/#/predict');
  await fillExample(page);
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await expect(page.getByText('141,98765', { exact: true })).toBeVisible();
  for (let index = 0; index < 2; index++) {
    const pending = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Скачать PDF', exact: true }).click();
    const download = await pending;
    await download.saveAs(testInfo.outputPath(`report-real-${index}.pdf`));
    expect(await download.failure()).toBeNull();
  }
  expect(requests).toBe(1);
  await expect(page.locator('.model-version')).toHaveCount(0);
  await page.getByLabel('Возраст').fill('53');
  await expect(page.getByRole('button', { name: 'Скачать PDF', exact: true })).toHaveCount(0);
});
