import { test, expect } from '@playwright/test';

/**
 * E2E Test: Complete Quiz Flow
 * Tests the full user journey from intro through quiz to results
 */
test.describe('Quiz Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
  });

  test('should complete full quiz flow and display results', async ({ page }) => {
    // Step 1: Intro page should be visible
    await expect(page.getByRole('heading', { name: /learning diagnostic/i })).toBeVisible();
    
    // Step 2: Start the quiz
    await page.getByRole('button', { name: /start diagnostic/i }).click();
    
    // Step 3: Verify we're on the quiz
    await expect(page.getByText(/question 1 of/i)).toBeVisible();
    
    // Step 4: Answer all questions (28 core + 11 meta = 39 total)
    const totalQuestions = 39;
    
    for (let i = 0; i < totalQuestions; i++) {
      // Wait for question to be visible
      await expect(page.getByText(new RegExp(`question ${i + 1} of ${totalQuestions}`, 'i'))).toBeVisible();
      
      // Check if it's a likert5 or ynm question
      const hasSlider = await page.locator('input[type="range"]').count();
      const hasRadio = await page.locator('input[type="radio"]').count();
      
      if (hasSlider > 0) {
        // Answer likert5 question (just use the default middle value)
        // Already defaulted to 3, so just click next
      } else if (hasRadio > 0) {
        // Answer ynm question by clicking the first radio option
        await page.locator('input[type="radio"]').first().check();
      }
      
      // Click next button (or finish on last question)
      const isLastQuestion = i === totalQuestions - 1;
      const buttonText = isLastQuestion ? /finish/i : /next/i;
      await page.getByRole('button', { name: buttonText }).click();
    }
    
    // Step 5: Verify we're on results page
    await expect(page.getByRole('heading', { name: /personalised report/i })).toBeVisible();
    
    // Step 6: Verify results sections are present
    await expect(page.getByRole('heading', { name: /the one thing/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /domain-specific actions/i })).toBeVisible();
    
    // Step 7: Verify all domain scores are displayed (including encoding!)
    // Match the exact format of domain headings which include scores: "Priming (50%)"
    await expect(page.getByRole('heading', { name: /priming \(\d+%\)/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /encoding \(\d+%\)/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /reference \(\d+%\)/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /retrieval \(\d+%\)/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /overlearning \(\d+%\)/i })).toBeVisible();
    
    // Step 8: Verify action buttons are present
    await expect(page.getByRole('button', { name: /export results/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /copy llm prompt/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /view history/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /take quiz again/i }).first()).toBeVisible();
  });

  test('should allow navigating back through questions', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start diagnostic/i }).click();
    
    // Answer first question
    await expect(page.getByText(/question 1 of/i)).toBeVisible();
    await page.getByRole('button', { name: /next/i }).click();
    
    // Now on question 2
    await expect(page.getByText(/question 2 of/i)).toBeVisible();
    
    // Go back to question 1
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page.getByText(/question 1 of/i)).toBeVisible();
  });

  test('should allow canceling the quiz', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start diagnostic/i }).click();
    
    // Cancel the quiz
    await page.getByRole('button', { name: /cancel/i }).click();
    
    // Should be back on intro page
    await expect(page.getByRole('heading', { name: /learning diagnostic/i })).toBeVisible();
  });

  test('should show previous answers when retaking quiz', async ({ page }) => {
    // Complete first quiz
    await page.goto('/');
    await page.getByRole('button', { name: /start diagnostic/i }).click();
    
    // Answer first few questions with specific values
    await page.locator('input[type="range"]').first().fill('5');
    await page.getByRole('button', { name: /next/i }).click();
    
    await page.locator('input[type="range"]').first().fill('4');
    await page.getByRole('button', { name: /next/i }).click();
    
    // Quickly finish the rest of the quiz
    for (let i = 2; i < 39; i++) {
      const hasSlider = await page.locator('input[type="range"]').count();
      const hasRadio = await page.locator('input[type="radio"]').count();
      
      if (hasSlider > 0) {
        await page.locator('input[type="range"]').first().fill('3');
      } else if (hasRadio > 0) {
        await page.locator('input[type="radio"]').first().check();
      }
      
      await page.getByRole('button', { name: i === 38 ? /finish/i : /next/i }).click();
    }
    
    // Wait for results
    await expect(page.getByRole('heading', { name: /personalised report/i })).toBeVisible();
    
    // Start quiz again - this takes us back to intro first
    await page.getByRole('button', { name: /take quiz again/i }).first().click();
    
    // Now we're back at intro, start the quiz
    await expect(page.getByRole('heading', { name: /learning diagnostic/i })).toBeVisible();
    await page.getByRole('button', { name: /start diagnostic/i }).click();
    
    // Wait for first question to load
    await expect(page.getByText(/question 1 of/i)).toBeVisible();
    
    // Should see "Last time" indicator showing "Always" (value 5)
    await expect(page.getByText(/last time.*always/i)).toBeVisible();
  });

  test('should handle different answer types correctly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /start diagnostic/i }).click();
    
    // Test likert5 slider
    const slider = page.locator('input[type="range"]').first();
    await slider.fill('1');
    await expect(page.getByText(/never/i)).toBeVisible();
    
    await slider.fill('3');
    await expect(page.getByText(/sometimes/i)).toBeVisible();
    
    await slider.fill('5');
    await expect(page.getByText(/always/i)).toBeVisible();
  });
});
