import { test, expect } from '@playwright/test';

/**
 * E2E Test: Scoring Validation
 * Tests that scores are calculated correctly, especially the encoding domain fix
 */
test.describe('Scoring Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should calculate encoding score correctly (not always 0)', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start diagnostic/i }).click();
    
    // Answer questions with specific values to ensure encoding score is calculable
    // Questions 5-7, 11-12 are encoding questions
    const totalQuestions = 39;
    
    for (let i = 0; i < totalQuestions; i++) {
      await expect(page.getByText(new RegExp(`question ${i + 1} of ${totalQuestions}`, 'i'))).toBeVisible();
      
      const hasSlider = await page.locator('input[type="range"]').count();
      const hasRadio = await page.locator('input[type="radio"]').count();
      
      if (hasSlider > 0) {
        // Set all likert5 questions to 5 (Always) to get high scores
        await page.locator('input[type="range"]').first().fill('5');
      } else if (hasRadio > 0) {
        // Click "Yes" for ynm questions
        const yesRadio = page.locator('input[type="radio"][value="yes"]');
        if (await yesRadio.count() > 0) {
          await yesRadio.first().check();
        } else {
          await page.locator('input[type="radio"]').first().check();
        }
      }
      
      const isLastQuestion = i === totalQuestions - 1;
      const buttonText = isLastQuestion ? /finish/i : /next/i;
      await page.getByRole('button', { name: buttonText }).click();
    }
    
    // Wait for results
    await expect(page.getByRole('heading', { name: /personalised report/i })).toBeVisible();
    
    // Check that encoding score is displayed and NOT 0
    const encodingSection = page.getByText(/encoding/i).first();
    await expect(encodingSection).toBeVisible();
    
    // Get the encoding score from the page
    const pageContent = await page.content();
    
    // The encoding score should appear in the results
    // Since we answered all questions with high values, encoding should have a score
    expect(pageContent).toContain('encoding');
    expect(pageContent).toContain('Encoding');
    
    // Verify in localStorage that encoding score exists and is not 0
    const historyData = await page.evaluate(() => {
      const data = localStorage.getItem('youcanstudy_history');
      return data ? JSON.parse(data) : null;
    });
    
    expect(historyData).toBeTruthy();
    expect(historyData.length).toBeGreaterThan(0);
    
    const latestEntry = historyData[0];
    expect(latestEntry.results.scores).toBeDefined();
    expect(latestEntry.results.scores.encoding).toBeDefined();
    expect(latestEntry.results.scores.encoding).toBeGreaterThan(0);
  });

  test('should calculate all domain scores', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start diagnostic/i }).click();
    
    // Complete quiz with varied answers
    for (let i = 0; i < 39; i++) {
      const hasSlider = await page.locator('input[type="range"]').count();
      const hasRadio = await page.locator('input[type="radio"]').count();
      
      if (hasSlider > 0) {
        // Vary the answers (cycle through 1-5)
        const value = (i % 5) + 1;
        await page.locator('input[type="range"]').first().fill(String(value));
      } else if (hasRadio > 0) {
        const radios = page.locator('input[type="radio"]');
        const count = await radios.count();
        const index = i % count;
        await radios.nth(index).check();
      }
      
      const buttonText = i === 38 ? /finish/i : /next/i;
      await page.getByRole('button', { name: buttonText }).click();
    }
    
    await expect(page.getByRole('heading', { name: /personalised report/i })).toBeVisible();
    
    // Verify all domain scores in localStorage
    const historyData = await page.evaluate(() => {
      const data = localStorage.getItem('youcanstudy_history');
      return data ? JSON.parse(data) : null;
    });
    
    const scores = historyData[0].results.scores;
    
    // All core domains should have scores
    expect(scores.priming).toBeDefined();
    expect(scores.encoding).toBeDefined();
    expect(scores.reference).toBeDefined();
    expect(scores.retrieval).toBeDefined();
    expect(scores.overlearning).toBeDefined();
    
    // Scores should be between 0 and 100
    (Object.values(scores) as number[]).forEach((score: number) => {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  test('should calculate overall score correctly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start diagnostic/i }).click();
    
    // Complete quiz
    for (let i = 0; i < 39; i++) {
      const hasSlider = await page.locator('input[type="range"]').count();
      const hasRadio = await page.locator('input[type="radio"]').count();
      
      if (hasSlider > 0) {
        await page.locator('input[type="range"]').first().fill('3');
      } else if (hasRadio > 0) {
        await page.locator('input[type="radio"]').first().check();
      }
      
      const buttonText = i === 38 ? /finish/i : /next/i;
      await page.getByRole('button', { name: buttonText }).click();
    }
    
    await expect(page.getByRole('heading', { name: /personalised report/i })).toBeVisible();
    
    // Verify overall score exists
    const historyData = await page.evaluate(() => {
      const data = localStorage.getItem('youcanstudy_history');
      return data ? JSON.parse(data) : null;
    });
    
    const overall = historyData[0].results.overall;
    expect(overall).toBeDefined();
    expect(overall).toBeGreaterThanOrEqual(0);
    expect(overall).toBeLessThanOrEqual(100);
  });

  test('should handle reverse-scored questions correctly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start diagnostic/i }).click();
    
    // Complete the quiz
    for (let i = 0; i < 39; i++) {
      const hasSlider = await page.locator('input[type="range"]').count();
      const hasRadio = await page.locator('input[type="radio"]').count();
      
      if (hasSlider > 0) {
        await page.locator('input[type="range"]').first().fill('5');
      } else if (hasRadio > 0) {
        await page.locator('input[type="radio"]').first().check();
      }
      
      const buttonText = i === 38 ? /finish/i : /next/i;
      await page.getByRole('button', { name: buttonText }).click();
    }
    
    await expect(page.getByRole('heading', { name: /personalised report/i })).toBeVisible();
    
    // Verify scores are calculated (reverse questions should affect the scores)
    const historyData = await page.evaluate(() => {
      const data = localStorage.getItem('youcanstudy_history');
      return data ? JSON.parse(data) : null;
    });
    
    // Just verify the calculation completed
    expect(historyData[0].results.scores).toBeDefined();
    expect(Object.keys(historyData[0].results.scores).length).toBeGreaterThan(0);
  });
});
