import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * E2E Test: Export Functionality
 * Tests PDF and JSON export, and JSON import
 */
test.describe('Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  async function completeQuiz(page: Page) {
    await page.getByRole('button', { name: /start diagnostic/i }).click();
    
    // Quickly complete the quiz
    for (let i = 0; i < 39; i++) {
      const hasSlider = await page.locator('input[type="range"]').count();
      const hasRadio = await page.locator('input[type="radio"]').count();
      
      if (hasSlider > 0) {
        await page.locator('input[type="range"]').first().fill('4');
      } else if (hasRadio > 0) {
        await page.locator('input[type="radio"]').first().check();
      }
      
      const buttonText = i === 38 ? /finish/i : /next/i;
      await page.getByRole('button', { name: buttonText }).click();
    }
    
    await expect(page.getByRole('heading', { name: /personalised report/i })).toBeVisible();
  }

  test('should show export modal when clicking export button', async ({ page }) => {
    await completeQuiz(page);
    
    // Click export button
    await page.getByRole('button', { name: /export results/i }).click();
    
    // Modal should appear
    await expect(page.getByRole('heading', { name: /export results/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export as json/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /export as pdf/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('should close export modal when clicking cancel', async ({ page }) => {
    await completeQuiz(page);
    
    await page.getByRole('button', { name: /export results/i }).click();
    await expect(page.getByRole('heading', { name: /export results/i })).toBeVisible();
    
    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).last().click();
    
    // Modal should close
    await expect(page.getByRole('heading', { name: /export results/i })).not.toBeVisible();
  });

  test('should trigger JSON download when clicking export JSON', async ({ page }) => {
    await completeQuiz(page);
    
    // Listen for download
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.getByRole('button', { name: /export results/i }).click();
    await page.getByRole('button', { name: /export as json/i }).click();
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/learning-report-.*\.json/);
    
    // Save and verify the JSON structure
    const downloadPath = path.join('/tmp', download.suggestedFilename());
    await download.saveAs(downloadPath);
    
    // Read and verify JSON content
    const content = fs.readFileSync(downloadPath, 'utf-8');
    const data = JSON.parse(content);
    
    // Should be an array with one history entry
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    
    // Verify history entry structure
    const entry = data[0];
    expect(entry.id).toBeDefined();
    expect(entry.timestamp).toBeDefined();
    expect(entry.date).toBeDefined();
    expect(entry.results).toBeDefined();
    expect(entry.results.scores).toBeDefined();
    expect(entry.results.scores.encoding).toBeDefined();
    
    // Clean up
    fs.unlinkSync(downloadPath);
  });

  test('exported JSON should be importable via history', async ({ page }) => {
    await completeQuiz(page);
    
    // Export JSON
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export results/i }).click();
    await page.getByRole('button', { name: /export as json/i }).click();
    const download = await downloadPromise;
    
    // Save the file
    const downloadPath = await download.path();
    
    // Clear history
    await page.evaluate(() => localStorage.clear());
    
    // Go to history page
    await page.goto('/');
    await page.getByRole('button', { name: /view history/i }).click();
    
    // Should see empty history message
    await expect(page.getByRole('heading', { name: /no quiz history/i })).toBeVisible();
    
    // Import the JSON file by clicking the import button and handling the file chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByRole('button', { name: /import history/i }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(downloadPath);
    
    // Wait for import to complete and alert
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('imported successfully');
      await dialog.accept();
    });
    
    await page.waitForTimeout(500);
    
    // History should now show the imported entry
    await expect(page.getByRole('heading', { name: /no quiz history/i })).not.toBeVisible();
    
    // Verify the entry exists
    const historyData = await page.evaluate(() => {
      const data = localStorage.getItem('youcanstudy_history');
      return data ? JSON.parse(data) : null;
    });
    
    expect(historyData).toBeTruthy();
    expect(historyData.length).toBeGreaterThan(0);
    expect(historyData[0].results.scores.encoding).toBeDefined();
    
    // Clean up
    // Note: download.path() returns a temp file, but we'll leave it for Playwright to clean up
  });

  test('should trigger PDF print dialog when clicking export PDF', async ({ page }) => {
    await completeQuiz(page);
    
    // Click export button
    await page.getByRole('button', { name: /export results/i }).click();
    
    // Mock window.open to capture the call
    const popupPromise = page.waitForEvent('popup');
    
    // Click PDF export
    await page.getByRole('button', { name: /export as pdf/i }).click();
    
    // Verify a new window was opened (for print preview)
    const popup = await popupPromise;
    expect(popup).toBeTruthy();
    
    // Verify the popup has the report content
    await popup.waitForLoadState();
    const content = await popup.content();
    
    expect(content).toContain('Your Personalised Learning Report');
    expect(content).toContain('Domain Scores');
    expect(content).toContain('The One Thing');
    
    await popup.close();
  });

  test('should copy LLM prompt to clipboard', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    
    await completeQuiz(page);
    
    // Click copy prompt button
    await page.getByRole('button', { name: /copy llm prompt/i }).click();
    
    // Wait for alert
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('copied to clipboard');
      await dialog.accept();
    });
    
    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    
    expect(clipboardText).toContain('learning coach');
    expect(clipboardText).toContain('core domain scores');
    expect(clipboardText).toContain('encoding');
    expect(clipboardText).toContain('priming');
    expect(clipboardText).toContain('retrieval');
  });
});
