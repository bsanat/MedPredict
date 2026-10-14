import { expect, test } from '@playwright/test';
import { expectNoOverflow, fillExample } from './helpers';

test('complete demo journey, repeat request and invalidate a stale result', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle('MedPredict — учебный прогноз');
  await expect(page.getByText('Демонстрационный режим', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expectNoOverflow(page);
  await page.getByRole('button', { name: 'Перейти к форме' }).click();
  await expect(page.getByLabel('Возраст')).toBeFocused();
  await fillExample(page);
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await expect(page.getByRole('button', { name: 'Обрабатываем запрос…' })).toBeDisabled();
  await expect(page.getByText('134,2', { exact: true })).toBeVisible();
  await expect(page.getByText('Фиксированный демонстрационный пример')).toBeVisible();
  await expect(page.getByText('Версия демопримера: demo-example')).toBeVisible();
  await expectNoOverflow(page);
  await page.getByRole('button', { name: 'Изменить данные' }).click();
  await expect(page.getByLabel('Возраст')).toHaveValue('52');
  await expect(page.getByText('134,2', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await expect(page.getByText('134,2', { exact: true })).toBeVisible();
  await page.getByLabel('Глюкоза').fill('6');
  await expect(page.getByText('134,2', { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test('empty required fields and malformed numeric input have linked errors', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await expect(page.getByText('Заполните обязательное поле.', { exact: true })).toHaveCount(5);
  await expect(page.getByLabel('Возраст')).toBeFocused();
  await expect(page.getByLabel('Возраст')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Возраст')).toHaveAttribute('aria-describedby', /field-age-error/);
  await fillExample(page);
  await page.getByLabel('Возраст').fill('не число');
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await expect(page.getByText('Введите число, например 27,4. Буквы и другие символы недопустимы.', { exact: true })).toBeVisible();
  await expect(page.getByText('134,2', { exact: true })).toHaveCount(0);
});

test('keyboard navigation, submit and edit remain usable', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Перейти к основному содержимому' })).toBeFocused();
  await page.getByRole('button', { name: 'Перейти к форме' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Возраст')).toBeFocused();
  await page.keyboard.type('52');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Пол', { exact: false })).toBeFocused();
  // shortcut: macOS headless Chromium lacks native select keyboard menus; remove when supported.
  if (process.platform === 'darwin' && !testInfo.project.use.isMobile) {
    await page.getByLabel('Пол', { exact: false }).selectOption('male');
  } else {
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
  }
  await expect(page.getByLabel('Пол', { exact: false })).toHaveValue('male');
  await page.keyboard.press('Tab');
  await page.keyboard.type('27,4');
  await page.keyboard.press('Tab');
  await page.keyboard.type('5.6');
  await page.keyboard.press('Tab');
  await page.keyboard.type('5,9');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Получить учебный прогноз' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('134,2', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Систолическое давление', exact: true })).toBeFocused();
});

test('cancel and editing in flight never show an old result', async ({ page }) => {
  await page.goto('/');
  await fillExample(page);
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await page.getByRole('button', { name: 'Отменить запрос' }).click();
  await expect(page.getByRole('status')).toHaveText('Запрос отменён. Можно изменить данные или отправить их снова.');
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await page.getByLabel('Возраст').fill('53');
  await expect(page.getByRole('heading', { name: 'Здесь появится прогноз' })).toBeVisible();
  // Wait longer than the fixture latency to prove the cancelled response cannot reappear.
  await page.waitForTimeout(1100);
  await expect(page.getByText('134,2', { exact: true })).toHaveCount(0);
});
