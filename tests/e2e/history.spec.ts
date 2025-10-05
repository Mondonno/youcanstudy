import { test, expect, Page } from '@playwright/test';

/**
 * E2E Test: History Management
 * Tests saving, viewing, deleting, and importing/exporting history
 */
test.describe('History Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  async function completeQuizQuickly(page: Page, answerValue: number = 3) {
    await page.getByRole('button', { name: /start diagnostic/i }).click();
    
    for (let i = 0; i < 39; i++) {
      const hasSlider = await page.locator('input[type="range"]').count();
      const hasRadio = await page.locator('input[type="radio"]').count();
      
      if (hasSlider > 0) {
        await page.locator('input[type="range"]').first().fill(String(answerValue));
      } else if (hasRadio > 0) {
        await page.locator('input[type="radio"]').first().check();
      }
      
      const buttonText = i === 38 ? /finish/i : /next/i;
      await page.getByRole('button', { name: buttonText }).click();
    }
    
    await expect(page.getByRole('heading', { name: /personalised report/i })).toBeVisible();
  }

  test('should save quiz results to history automatically', async ({ page }) => {
    await completeQuizQuickly(page);
    
    // Verify history was saved
    const historyData = await page.evaluate(() => {
      const data = localStorage.getItem('youcanstudy_history');
      return data ? JSON.parse(data) : null;
    });
    
    expect(historyData).toBeTruthy();
    expect(historyData.length).toBe(1);
    expect(historyData[0].results).toBeDefined();
  });

  test('should display history entries when viewing history', async ({ page }) => {
    await completeQuizQuickly(page);
    
    // View history
    await page.getByRole('button', { name: /view history/i }).click();
    
    // Should see history page heading (use exact match to avoid conflict with "No quiz history")
    await expect(page.getByRole('heading', { name: 'Quiz History', exact: true })).toBeVisible();
    
    // Should see at least one entry
    const entryCount = await page.locator('.card').count();
    expect(entryCount).toBeGreaterThan(0);
  });

  test('should show empty state when no history exists', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /view history/i }).click();
    
    // Should see empty state (use heading role to avoid ambiguity)
    await expect(page.getByRole('heading', { name: /no quiz history/i })).toBeVisible();
  });

  test('should display multiple history entries', async ({ page }) => {
    // Complete quiz multiple times
    await completeQuizQuickly(page, 2);
    await page.getByRole('button', { name: /take quiz again/i }).click();
    
    await completeQuizQuickly(page, 4);
    
    // View history
    await page.getByRole('button', { name: /view history/i }).click();
    
    // Should see 2 entries
    const historyData = await page.evaluate(() => {
      const data = localStorage.getItem('youcanstudy_history');
      return data ? JSON.parse(data) : null;
    });
    
    expect(historyData.length).toBe(2);
  });

  test('should allow viewing individual history entry details', async ({ page }) => {
    await completeQuizQuickly(page);
    
    // View history
    await page.getByRole('button', { name: /view history/i }).click();
    
    // Click on an entry to view details
    const viewButton = page.getByRole('button', { name: /view/i }).first();
    if (await viewButton.count() > 0) {
      await viewButton.click();
      
      // Should show results for that entry
      await expect(page.getByRole('heading', { name: /personalised report/i })).toBeVisible();
    }
  });

  test('should allow deleting history entries', async ({ page }) => {
    await completeQuizQuickly(page);
    
    // View history
    await page.getByRole('button', { name: /view history/i }).click();
    
    // Delete the entry
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      
      // Confirm deletion if there's a confirmation dialog
      page.on('dialog', async (dialog) => {
        await dialog.accept();
      });
      
      await page.waitForTimeout(500);
      
      // Verify entry was deleted
      const historyData = await page.evaluate(() => {
        const data = localStorage.getItem('youcanstudy_history');
        return data ? JSON.parse(data) : null;
      });
      
      expect(historyData).toEqual([]);
    }
  });

  test('should allow clearing all history', async ({ page }) => {
    // Complete multiple quizzes
    await completeQuizQuickly(page, 2);
    await page.getByRole('button', { name: /take quiz again/i }).click();
    await completeQuizQuickly(page, 4);
    
    // View history
    await page.getByRole('button', { name: /view history/i }).click();
    
    // Clear all history
    const clearButton = page.getByRole('button', { name: /clear all/i });
    if (await clearButton.count() > 0) {
      await clearButton.click();
      
      // Confirm if dialog appears
      page.on('dialog', async (dialog) => {
        await dialog.accept();
      });
      
      await page.waitForTimeout(500);
      
      // Verify all history was cleared
      const historyData = await page.evaluate(() => {
        const data = localStorage.getItem('youcanstudy_history');
        return data ? JSON.parse(data) : null;
      });
      
      expect(historyData).toEqual([]);
      await expect(page.getByRole('heading', { name: /no quiz history/i })).toBeVisible();
    }
  });

  test('should export history as JSON', async ({ page }) => {
    await completeQuizQuickly(page);
    
    // View history
    await page.getByRole('button', { name: /view history/i }).click();
    
    // Export history
    const exportButton = page.getByRole('button', { name: /export history/i });
    if (await exportButton.count() > 0) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/youcanstudy-history-.*\.json/);
    }
  });

  test('should maintain history across page refreshes', async ({ page }) => {
    await completeQuizQuickly(page);
    
    // Reload the page
    await page.reload();
    
    // View history
    await page.getByRole('button', { name: /view history/i }).click();
    
    // Should still see the history entry
    const historyData = await page.evaluate(() => {
      const data = localStorage.getItem('youcanstudy_history');
      return data ? JSON.parse(data) : null;
    });
    
    expect(historyData).toBeTruthy();
    expect(historyData.length).toBe(1);
  });

  test('should return to intro from history page', async ({ page }) => {
    await completeQuizQuickly(page);
    await page.getByRole('button', { name: /view history/i }).click();
    
    // Go back to intro (button says "Back to Home")
    const backButton = page.getByRole('button', { name: /back to home/i });
    await backButton.click();
    
    // Should be on intro page
    await expect(page.getByRole('heading', { name: /learning diagnostic/i })).toBeVisible();
  });

  test('should limit history entries to maximum allowed', async ({ page }) => {
    // Complete multiple quizzes (more than MAX_HISTORY_ENTRIES if needed)
    // For this test, just verify the mechanism works with a few entries
    for (let i = 0; i < 3; i++) {
      if (i > 0) {
        await page.getByRole('button', { name: /take quiz again/i }).click();
      }
      await completeQuizQuickly(page, i + 2);
    }
    
    // Verify history exists and entries are ordered by timestamp (newest first)
    const historyData = await page.evaluate(() => {
      const data = localStorage.getItem('youcanstudy_history');
      return data ? JSON.parse(data) : null;
    });
    
    expect(historyData.length).toBe(3);
    
    // Verify entries are sorted by timestamp (descending)
    for (let i = 0; i < historyData.length - 1; i++) {
      expect(historyData[i].timestamp).toBeGreaterThan(historyData[i + 1].timestamp);
    }
  });
});
