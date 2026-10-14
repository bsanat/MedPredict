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
  await expect(page.getByRole('button', { name: 'Получить учебный прогноз' })).toBeDisabled();
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

test('language picker translates the demo without losing input, errors or an in-flight result', async ({ page }) => {
  await page.goto('/');
  const logo = page.locator('.brand').getByRole('img', { name: 'MedPredict', exact: true });
  await expect(logo).toHaveAttribute('src', '/logo.png');
  expect(await logo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await fillExample(page);
  await page.getByLabel('Возраст').fill('abc');
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await expect(page.locator('.language-picker summary img')).toHaveAttribute('src', '/flags/ru.svg');
  await page.getByText('Рус', { exact: true }).click();
  const flags = page.locator('.language-options img');
  await expect(flags).toHaveCount(3);
  expect(await flags.evaluateAll((images) => images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
  await expect(page.getByRole('button', { name: 'Русский', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Қазақша', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'kk');
  await expect(page).toHaveTitle('MedPredict — оқу мақсатындағы болжам');
  await expect(page.getByLabel('Жас', { exact: false })).toHaveValue('abc');
  await expect(page.getByText('Сан енгізіңіз, мысалы 27,4. Әріптер мен басқа таңбаларды қолдануға болмайды.', { exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Тіл', exact: true })).toBeHidden();
  await expectNoOverflow(page);

  await page.getByText('Қаз', { exact: true }).click();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('textbox', { name: /^Age/ })).toHaveValue('abc');
  await expect(page.getByText('Enter a number, for example 27.4. Letters and other characters are not allowed.', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: /^Age/ }).fill('52');
  await expect(page.getByLabel('Sex', { exact: false })).toHaveValue('male');
  await page.getByRole('button', { name: 'Get an educational prediction', exact: true }).click();
  await page.getByText('Eng', { exact: true }).click();
  await page.getByRole('button', { name: 'Қазақша', exact: true }).click();
  await expect(page.getByText('134,2', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Систолалық қан қысымы', exact: true })).toBeVisible();
  await expect(page.locator('.prediction-unit')).toHaveText('мм сын. бағ.');
  await expect(page.locator('.server-disclaimer')).toHaveCount(0);

  await page.getByText('Қаз', { exact: true }).click();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByText('134.2', { exact: true })).toBeVisible();
  await expect(page.locator('.prediction-unit')).toHaveText('mmHg');
  await expect(page.getByRole('textbox', { name: /^Age/ })).toHaveValue('52');
  await expectNoOverflow(page);
  await page.getByText('Eng', { exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('group', { name: 'Language', exact: true })).toBeHidden();
  await expect(page.locator('.language-picker summary')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('group', { name: 'Language', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'MedPredict — home', exact: true }).click();
  await expect(page.getByRole('group', { name: 'Language', exact: true })).toBeHidden();
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});


test('mobile header keeps the same rows in every language and flags fill their frames', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 390, 540, 768, 980]) {
    await page.setViewportSize({ width, height: 844 });
    for (const label of ['Русский', 'Қазақша', 'English']) {
      await page.locator('.language-picker summary').click();
      await page.getByRole('button', { name: label, exact: true }).click();
      const layout = await page.locator('.header-inner').evaluate((header) => {
        const rect = (selector: string) => header.querySelector(selector)!.getBoundingClientRect();
        const brand = rect('.brand');
        const picker = rect('.language-picker');
        const nav = rect('nav');
        const mode = rect('.mode-label');
        return {
          sameRow: Math.abs((brand.top + brand.bottom) / 2 - (picker.top + picker.bottom) / 2) < 1,
          separated: brand.right <= picker.left,
          navBelow: nav.top >= Math.max(brand.bottom, picker.bottom),
          modeBelow: mode.top >= nav.bottom,
          linksOnOneLine: [...header.querySelectorAll('nav a')].every((link) => link.getBoundingClientRect().height < 30),
        };
      });
      expect(layout).toEqual({ sameRow: true, separated: true, navBelow: true, modeBelow: true, linksOnOneLine: true });
      await expectNoOverflow(page);
    }
  }
  for (const flag of ['ru', 'kz', 'gb']) {
    const response = await page.request.get(`/flags/${flag}.svg`);
    expect(response.ok()).toBe(true);
    expect(await response.text()).toMatch(/<svg[^>]+preserveAspectRatio="none"/);
    expect(await response.text()).toMatch(/<svg[^>]+viewBox=/);
  }
});

test('PDF downloads directly, blocks duplicate export, retries asset failure and follows the chosen language', async ({ page }, testInfo) => {
  await page.addInitScript(() => { window.print = () => { throw new Error('Printing must not be called'); }; });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Скачать PDF', exact: true })).toHaveCount(0);
  const logos = page.locator('.project-logos img');
  await expect(logos).toHaveCount(2);
  expect(await logos.evaluateAll((images) => images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
  await expect(page.getByText('Учебный проект студентов Astana IT University', { exact: true })).toBeVisible();
  await expect(page.getByText('Astana IT University студенттерінің оқу жобасы', { exact: true })).toBeVisible();
  await fillExample(page);
  await page.getByRole('button', { name: 'Получить учебный прогноз' }).click();
  await expect(page.getByText('134,2', { exact: true })).toBeVisible();
  let fail = true;
  let fontWaiting = false;
  let release: () => void = () => {};
  await page.route('**/fonts/NotoSans-Regular.ttf', async (route) => {
    if (fail) return route.fulfill({ status: 503, body: 'Unavailable' });
    fontWaiting = true;
    await new Promise<void>((resolve) => { release = resolve; });
    await route.continue();
  });
  await page.getByRole('button', { name: 'Скачать PDF', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Не удалось подготовить PDF');
  fail = false;
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Скачать PDF', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Скачать PDF', exact: true })).toBeDisabled();
  await expect(page.locator('.pdf-status')).toHaveText('Подготавливаем PDF…');
  await expect.poll(() => fontWaiting).toBe(true);
  release();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^medpredict-report-\d{4}-\d{2}-\d{2}-\d{4}\.pdf$/);
  await download.saveAs(testInfo.outputPath('report-ru.pdf'));
  expect(await download.failure()).toBeNull();
  await expect(page.getByRole('button', { name: 'Скачать PDF', exact: true })).toBeEnabled();
  await page.unroute('**/fonts/NotoSans-Regular.ttf');
  await page.getByText('Рус', { exact: true }).click();
  await page.getByRole('button', { name: 'Қазақша', exact: true }).click();
  const repeatPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'PDF жүктеу', exact: true }).click();
  await (await repeatPromise).saveAs(testInfo.outputPath('report-kk.pdf'));
  await page.getByLabel('Глюкоза').fill('6');
  await expect(page.getByRole('button', { name: 'PDF жүктеу', exact: true })).toHaveCount(0);
});
