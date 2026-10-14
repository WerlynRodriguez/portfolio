import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('ThemeSwitcher E2E & A11y Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('renders theme switcher trigger and opens popover menu on click (AC5)', async ({
    page,
  }) => {
    await page.goto('/');

    const trigger = page.locator('#theme-trigger-btn');
    await expect(trigger).toBeVisible();

    const menu = page.locator('#theme-menu');

    // Click trigger to open menu
    await trigger.click();
    await expect(menu).toBeVisible();

    // Verify all 4 theme options exist
    const systemBtn = menu.locator('[data-theme-option="system"]');
    const lightBtn = menu.locator('[data-theme-option="light"]');
    const darkBtn = menu.locator('[data-theme-option="dark"]');
    const eclipseBtn = menu.locator('[data-theme-option="eclipse"]');

    await expect(systemBtn).toBeVisible();
    await expect(lightBtn).toBeVisible();
    await expect(darkBtn).toBeVisible();
    await expect(eclipseBtn).toBeVisible();
  });

  test('switches themes, updates DOM and persists across page reload (AC7)', async ({
    page,
  }) => {
    await page.goto('/');

    const trigger = page.locator('#theme-trigger-btn');
    const menu = page.locator('#theme-menu');
    const meta = page.locator('meta[name="color-scheme"]');

    // Select Light theme
    await trigger.click();
    await menu.locator('[data-theme-option="light"]').click();
    await expect(menu).toBeHidden();
    await expect(meta).toHaveAttribute('content', 'light');
    await expect(page.locator('html')).not.toHaveAttribute(
      'data-theme',
      'eclipse',
    );

    // Verify localStorage has 'light'
    const storedLight = await page.evaluate(() =>
      localStorage.getItem('theme'),
    );
    expect(storedLight).toBe('light');

    // Reload page and check persistence
    await page.reload();
    await expect(meta).toHaveAttribute('content', 'light');

    // Select Eclipse theme
    await trigger.click();
    await menu.locator('[data-theme-option="eclipse"]').click();
    await expect(menu).toBeHidden();
    await expect(meta).toHaveAttribute('content', 'light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'eclipse');

    const storedEclipse = await page.evaluate(() =>
      localStorage.getItem('theme'),
    );
    expect(storedEclipse).toBe('eclipse');

    // Select Dark theme
    await trigger.click();
    await menu.locator('[data-theme-option="dark"]').click();
    await expect(menu).toBeHidden();
    await expect(meta).toHaveAttribute('content', 'dark');
    await expect(page.locator('html')).not.toHaveAttribute(
      'data-theme',
      'eclipse',
    );

    const storedDark = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedDark).toBe('dark');
  });

  test('selecting system theme removes storage key and follows OS preference (AC8)', async ({
    page,
  }) => {
    await page.goto('/');

    const trigger = page.locator('#theme-trigger-btn');
    const menu = page.locator('#theme-menu');
    const meta = page.locator('meta[name="color-scheme"]');

    // First set to dark
    await trigger.click();
    await menu.locator('[data-theme-option="dark"]').click();
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(
      'dark',
    );

    // Then switch back to system
    await trigger.click();
    await menu.locator('[data-theme-option="system"]').click();
    await expect(menu).toBeHidden();

    // Verify storage key is removed
    const stored = await page.evaluate(() => localStorage.getItem('theme'));
    expect(stored).toBeNull();
    await expect(meta).toHaveAttribute('content', 'light dark');
  });

  test('eclipse theme renders dark containers inside light page (AC9)', async ({
    page,
  }) => {
    await page.goto('/');

    const trigger = page.locator('#theme-trigger-btn');
    const menu = page.locator('#theme-menu');

    await trigger.click();
    await menu.locator('[data-theme-option="eclipse"]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'eclipse');

    // Check header color-scheme evaluates to dark
    const headerColorScheme = await page
      .locator('.site-header')
      .evaluate((el) => window.getComputedStyle(el).colorScheme);
    expect(headerColorScheme).toBe('dark');

    // Check footer color-scheme evaluates to dark
    const footerColorScheme = await page
      .locator('.site-footer')
      .evaluate((el) => window.getComputedStyle(el).colorScheme);
    expect(footerColorScheme).toBe('dark');
  });

  test('supports keyboard navigation (Arrow keys, Home, End, Esc) (AC10)', async ({
    page,
  }) => {
    await page.goto('/');

    const trigger = page.locator('#theme-trigger-btn');
    const menu = page.locator('#theme-menu');

    // Focus trigger and open via click/enter
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(menu).toBeVisible();

    // Focus first option and navigate with ArrowDown
    const options = menu.locator('[data-theme-option]');
    await options.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(options.nth(1)).toBeFocused();

    // Navigate to end with End key
    await page.keyboard.press('End');
    await expect(options.last()).toBeFocused();

    // Navigate to top with Home key
    await page.keyboard.press('Home');
    await expect(options.first()).toBeFocused();

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
  });

  test('passes WCAG 2.2 AA automated accessibility scan across all 4 themes (AC10)', async ({
    page,
  }) => {
    await page.goto('/');

    const themes = ['system', 'light', 'dark', 'eclipse'] as const;
    const trigger = page.locator('#theme-trigger-btn');
    const menu = page.locator('#theme-menu');

    for (const theme of themes) {
      if (theme !== 'system') {
        await trigger.click();
        await menu.locator(`[data-theme-option="${theme}"]`).click();
      }

      const scanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(
        scanResults.violations,
        `Accessibility violations found for theme: ${theme}`,
      ).toEqual([]);
    }
  });

  test('light mode maintains button text contrast on hover without washout (Spec 017 AC2)', async ({
    page,
  }) => {
    await page.goto('/');
    const trigger = page.locator('#theme-trigger-btn');
    const menu = page.locator('#theme-menu');

    await trigger.click();
    await menu.locator('[data-theme-option="light"]').click();

    const contactCta = page.locator('a.btn-cad[href="#contact"]');
    await contactCta.hover();

    const color = await contactCta.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    const bgColor = await contactCta.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    // Text color and background must not be identical (e.g. #fff on #fff)
    expect(color).not.toBe(bgColor);
  });

  test('eclipse mode renders hero section as a CAD command deck with dark surface (Spec 017 AC3)', async ({
    page,
  }) => {
    await page.goto('/');
    const trigger = page.locator('#theme-trigger-btn');
    const menu = page.locator('#theme-menu');

    await trigger.click();
    await menu.locator('[data-theme-option="eclipse"]').click();

    const heroSection = page.locator('#hero');
    await expect(heroSection).toHaveClass(/hero-console/);
    await expect(heroSection).toHaveClass(/cad-frame/);

    const heroColorScheme = await heroSection.evaluate(
      (el) => window.getComputedStyle(el).colorScheme,
    );
    expect(heroColorScheme).toBe('dark');

    const heroBg = await heroSection.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    expect(heroBg).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('persists menu radio selection state across page reload (Spec 018 AC4)', async ({
    page,
  }) => {
    await page.goto('/');
    const trigger = page.locator('#theme-trigger-btn');
    const menu = page.locator('#theme-menu');

    // Select Eclipse
    await trigger.click();
    await menu.locator('[data-theme-option="eclipse"]').click();
    await expect(menu).toBeHidden();

    // Reload the page
    await page.reload();

    // Open menu again
    await trigger.click();
    await expect(menu).toBeVisible();

    // Check that Eclipse is aria-checked and has is-active class, and system is NOT aria-checked
    const eclipseOption = menu.locator('[data-theme-option="eclipse"]');
    const systemOption = menu.locator('[data-theme-option="system"]');

    await expect(eclipseOption).toHaveAttribute('aria-checked', 'true');
    await expect(eclipseOption).toHaveClass(/is-active/);
    await expect(systemOption).toHaveAttribute('aria-checked', 'false');
  });

  test('ButtonCopy preserves high-contrast text and icon colors on hover in dark mode (Spec 018 AC1)', async ({
    page,
  }) => {
    await page.goto('/');
    const trigger = page.locator('#theme-trigger-btn');
    const menu = page.locator('#theme-menu');

    // Set dark mode
    await trigger.click();
    await menu.locator('[data-theme-option="dark"]').click();

    const copyBtn = page.locator('#copy-email-btn');
    await copyBtn.hover();

    const color = await copyBtn.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    const bgColor = await copyBtn.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    // Color must NOT be pitch black (rgb(5, 5, 5)) in dark mode
    expect(color).not.toBe('rgb(5, 5, 5)');
    expect(color).not.toBe(bgColor);
  });

  test('ThemeSwitcher trigger button maintains high-contrast icon on hover and does not turn black in dark mode (Spec 019 AC3)', async ({
    page,
  }) => {
    await page.goto('/');
    const trigger = page.locator('#theme-trigger-btn');
    const menu = page.locator('#theme-menu');

    // Set dark mode
    await trigger.click();
    await menu.locator('[data-theme-option="dark"]').click();

    // Hover trigger
    await trigger.hover();

    const icon = trigger.locator('.icon-theme.icon-dark');
    const iconColor = await icon.evaluate(
      (el) => window.getComputedStyle(el).color,
    );
    const triggerBg = await trigger.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );

    // Icon color must NOT be pitch black (rgb(5, 5, 5)) in dark mode
    expect(iconColor).not.toBe('rgb(5, 5, 5)');
    expect(iconColor).not.toBe(triggerBg);
  });

  test('primary buttons and ThemeSwitcher button display punctual dashed outline on hover (Spec 019 AC1, AC2)', async ({
    page,
  }) => {
    await page.goto('/');

    // 1. ThemeSwitcher trigger button
    const themeBtn = page.locator('#theme-trigger-btn');
    await themeBtn.hover();
    await page.waitForTimeout(150);
    const themeOutline = await themeBtn.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        style: style.outlineStyle,
        offset: style.outlineOffset,
      };
    });
    expect(themeOutline.style).toBe('dashed');
    expect(themeOutline.offset).toBe('2px');

    // 2. Send Email button (.btn-mailto)
    const sendEmailBtn = page.locator('a.btn-mailto');
    await sendEmailBtn.hover();
    await page.waitForTimeout(150);
    const sendEmailOutline = await sendEmailBtn.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        style: style.outlineStyle,
        offset: style.outlineOffset,
      };
    });
    expect(sendEmailOutline.style).toBe('dashed');
    expect(sendEmailOutline.offset).toBe('2px');
  });

  test('prevents FOUC/FOIT when reloading light mode under dark OS preference (Spec 020 AC1)', async ({
    page,
  }) => {
    // Emulate Dark Mode OS preference
    await page.emulateMedia({ colorScheme: 'dark' });

    // Store 'light' theme preference before document loads
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'light');
    });

    await page.goto('/');

    // 1. Meta tag must have id="cs" and content="light"
    const meta = page.locator('#cs');
    await expect(meta).toHaveAttribute('content', 'light');

    // 2. html root must have data-active-theme="light"
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-active-theme', 'light');

    // 3. Body computed background must be light (#fbfbfa / rgb(251, 251, 250)), never dark (#050505 / rgb(5, 5, 5))
    const bodyBg = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(bodyBg).toBe('rgb(251, 251, 250)');
  });

  test('prevents FOUC/FOIT when reloading eclipse mode under dark OS preference (Spec 020 AC2)', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.addInitScript(() => {
      localStorage.setItem('theme', 'eclipse');
    });

    await page.goto('/');

    const meta = page.locator('#cs');
    await expect(meta).toHaveAttribute('content', 'light');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'eclipse');
    await expect(html).toHaveAttribute('data-active-theme', 'eclipse');

    // Header and CAD frames in eclipse should evaluate to dark
    const headerColorScheme = await page
      .locator('.site-header')
      .evaluate((el) => window.getComputedStyle(el).colorScheme);
    expect(headerColorScheme).toBe('dark');
  });

  test('prevents FOUC/FOIT when reloading dark mode under light OS preference (Spec 020 AC3)', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });

    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });

    await page.goto('/');

    const meta = page.locator('#cs');
    await expect(meta).toHaveAttribute('content', 'dark');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-active-theme', 'dark');

    const bodyBg = await page.locator('body').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(bodyBg).toBe('rgb(5, 5, 5)');
  });
});
