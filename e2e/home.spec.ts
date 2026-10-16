import AxeBuilder from '@axe-core/playwright';
import { contactData as enContact } from '@content/data/en';
import { contactData as esContact } from '@content/data/es';
import { expect, test } from '@playwright/test';

const requiredSections = [
  'hero',
  'overview',
  'experience',
  'projects',
  'skills',
  'academics',
  'contact',
];

test.describe('Home Page (English)', () => {
  test('renders landmarks, headings, and all 7 sections', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('footer.site-footer')).toBeVisible();

    for (const sectionId of requiredSections) {
      await expect(page.locator(`#${sectionId}`)).toBeAttached();
    }

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('passes WCAG 2.2 AA automated accessibility scan with Axe', async ({
    page,
  }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('renders valid machine-readable datetime attributes on time elements', async ({
    page,
  }) => {
    await page.goto('/');

    const timeLocators = page.locator('time');
    const count = await timeLocators.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const dt = await timeLocators.nth(i).getAttribute('datetime');
      if (dt !== null) {
        expect(dt).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/);
      }
    }

    const experienceText = await page.locator('#experience').innerText();
    expect(experienceText).toContain('Ultranic');
  });

  test('renders contact section with copy email bar, mailto button, and socials', async ({
    page,
  }) => {
    await page.goto('/');

    const contact = page.locator('#contact');
    await expect(contact).toBeVisible();

    const copyBtn = contact.locator('button#copy-email-btn');
    await expect(copyBtn).toHaveAttribute('data-value', enContact.email);
    await expect(copyBtn).toContainText(enContact.email);

    const mailtoLink = contact.locator('a[href^="mailto:"]');
    await expect(mailtoLink).toHaveAttribute(
      'href',
      `mailto:${enContact.email}`,
    );

    const socialLinks = contact.locator('.contact-socials a');
    await expect(socialLinks).toHaveCount(enContact.socials.length);
    for (const social of enContact.socials) {
      await expect(
        contact.locator(`.contact-socials a[href="${social.url}"]`),
      ).toBeVisible();
    }
  });

  test('copies email to clipboard and provides feedback on interaction', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');

    const copyBtn = page.locator('#contact button#copy-email-btn');
    await expect(copyBtn).toBeVisible();
    await expect(copyBtn).toHaveAttribute('data-state', 'idle');

    await copyBtn.click();
    await expect(copyBtn).toHaveAttribute('data-state', 'copied');
    await expect(copyBtn.locator('[role="status"]')).toHaveText('Copied');

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboardText).toBe(enContact.email);
  });

  test('renders upgraded standalone footer with copyright, AI attribution, and back-to-top', async ({
    page,
  }) => {
    await page.goto('/');

    const footer = page.locator('footer.site-footer');
    await expect(footer).toBeVisible();

    const copyright = footer.locator('.footer-copyright');
    await expect(copyright).toContainText('Werlyn.');
    await expect(copyright.locator('time')).toHaveText(
      String(new Date().getFullYear()),
    );

    const attribution = footer.locator('.footer-attribution');
    await expect(attribution).toHaveText(
      'Designed with AI (Artesanal Inteligence)',
    );

    const toTopBtn = footer.locator('a.btn-to-top');
    await expect(toTopBtn).toHaveAttribute('href', '#hero');
    await expect(toTopBtn).toHaveAttribute('aria-label', 'Back to top of page');
  });
});

test.describe('Home Page (Spanish)', () => {
  test('renders landmarks and all 7 sections with lang="es"', async ({
    page,
  }) => {
    await page.goto('/es/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('footer.site-footer')).toBeVisible();

    for (const sectionId of requiredSections) {
      await expect(page.locator(`#${sectionId}`)).toBeAttached();
    }

    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);
  });

  test('passes WCAG 2.2 AA automated accessibility scan with Axe', async ({
    page,
  }) => {
    await page.goto('/es/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('renders valid machine-readable datetime attributes on time elements', async ({
    page,
  }) => {
    await page.goto('/es/');

    const timeLocators = page.locator('time');
    const count = await timeLocators.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const dt = await timeLocators.nth(i).getAttribute('datetime');
      if (dt !== null) {
        expect(dt).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/);
      }
    }

    const experienceText = await page.locator('#experience').innerText();
    expect(experienceText).toContain('Ultranic');
  });

  test('renders contact section in Spanish with copy email bar, mailto button, and socials', async ({
    page,
  }) => {
    await page.goto('/es/');

    const contact = page.locator('#contact');
    await expect(contact).toBeVisible();

    const copyBtn = contact.locator('button#copy-email-btn');
    await expect(copyBtn).toHaveAttribute('data-value', esContact.email);
    await expect(copyBtn).toContainText(esContact.email);

    const mailtoLink = contact.locator('a[href^="mailto:"]');
    await expect(mailtoLink).toHaveAttribute(
      'href',
      `mailto:${esContact.email}`,
    );

    const socialLinks = contact.locator('.contact-socials a');
    await expect(socialLinks).toHaveCount(esContact.socials.length);
  });

  test('renders upgraded standalone footer with copyright, AI attribution, and back-to-top (es)', async ({
    page,
  }) => {
    await page.goto('/es/');

    const footer = page.locator('footer.site-footer');
    await expect(footer).toBeVisible();

    const copyright = footer.locator('.footer-copyright');
    await expect(copyright).toContainText('Werlyn.');
    await expect(copyright.locator('time')).toHaveText(
      String(new Date().getFullYear()),
    );

    const attribution = footer.locator('.footer-attribution');
    await expect(attribution).toHaveText(
      'Diseñado con IA (Inteligencia Artesanal)',
    );

    const toTopBtn = footer.locator('a.btn-to-top');
    await expect(toTopBtn).toHaveAttribute('href', '#hero');
    await expect(toTopBtn).toHaveAttribute(
      'aria-label',
      'Volver al inicio de la página',
    );
  });
});

test.describe('Bilingual navigation flow', () => {
  test('switches language between English and Spanish', async ({ page }) => {
    await page.goto('/');

    const esLink = page.getByRole('link', { name: 'ES', exact: true });
    await expect(esLink).toBeVisible();
    await esLink.click();

    await expect(page).toHaveURL(/\/es\/?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    const enLink = page.getByRole('link', { name: 'EN', exact: true });
    await expect(enLink).toBeVisible();
    await enLink.click();

    await expect(page).toHaveURL(/\/(#.*)?$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test.describe('Technical-Editorial Design System', () => {
  test('renders CAD frames, section hierarchy elements, and bento grid', async ({
    page,
  }) => {
    await page.goto('/');

    // Check CAD frames
    const cadFrames = page.locator('.cad-frame');
    expect(await cadFrames.count()).toBeGreaterThanOrEqual(5);

    // Check section prefix elements exist across sections
    const sectionPrefixes = page.locator('.section-prefix');
    expect(await sectionPrefixes.count()).toBeGreaterThanOrEqual(6);

    // Check section subtitle elements exist across sections
    const subtitles = page.locator('.section-subtitle');
    expect(await subtitles.count()).toBeGreaterThanOrEqual(6);

    // Check Projects Explorer in Projects
    await expect(page.locator('#projects .projects-explorer')).toBeVisible();
    const projectPanels = page.locator('#projects .project-panel');
    expect(await projectPanels.count()).toBeGreaterThan(0);

    // Check micro-interaction buttons
    const cadButtons = page.locator('.btn-cad');
    expect(await cadButtons.count()).toBeGreaterThanOrEqual(4);
  });

  test('maintains responsive layout without horizontal overflow on mobile', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });

    expect(hasHorizontalOverflow).toBe(false);
  });
});
