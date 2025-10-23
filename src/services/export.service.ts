/**
 * Export service - handles data export and LLM prompt generation
 */

import type { DiagnosticResults, Scores, OneThing, VideoRec, ArticleRec, Question } from '../models/types.js';
import type { HistoryEntry } from './history.service.js';
import { APP_CONFIG } from '../config/app.config.js';

/**
 * Export diagnostic results as importable JSON (compatible with history format)
 */
export function exportResultsAsJSON(results: DiagnosticResults): void {
  const timestamp = Date.now();
  const entry: HistoryEntry = {
    id: `entry-${timestamp}`,
    timestamp,
    date: new Date(timestamp).toLocaleString(),
    results,
  };

  const blob = new Blob([JSON.stringify([entry], null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `learning-report-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export diagnostic results as PDF
 */
export function exportResultsAsPDF(results: DiagnosticResults): void {
  // Generate printable HTML content
  const html = generatePrintableHTML(results);
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Failed to open print window. Please allow popups.');
  }

  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    // Note: User can choose "Save as PDF" in print dialog
  };
}

/**
 * Generate printable HTML for PDF export
 */
function generatePrintableHTML(results: DiagnosticResults): string {
  const coreDomains = APP_CONFIG.CORE_DOMAINS;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Learning Diagnostic Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #7c3aed; margin-bottom: 10px; }
    h2 { color: #6366f1; margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
    h3 { color: #4f46e5; margin-top: 20px; }
    .score { font-weight: bold; color: #7c3aed; }
    .domain-scores { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .domain-item { padding: 10px; background: #f9fafb; border-radius: 5px; }
    ul { margin: 10px 0; padding-left: 25px; }
    li { margin: 5px 0; }
    .flags { background: #fef3c7; padding: 10px; border-radius: 5px; margin: 15px 0; }
    .video, .article { background: #f3f4f6; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .subtitle { color: #6b7280; font-size: 0.9em; }
    @media print {
      body { padding: 10px; }
      .pagebreak { page-break-before: always; }
    }
  </style>
</head>
<body>
  <h1>Your Personalised Learning Report</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
  <p><strong>Overall Score:</strong> <span class="score">${results.overall}%</span></p>

  <h2>Domain Scores</h2>
  <div class="domain-scores">
    ${coreDomains.map(domain => `
      <div class="domain-item">
        <strong>${domain.charAt(0).toUpperCase() + domain.slice(1)}:</strong>
        <span class="score">${results.scores[domain] ?? 0}%</span>
      </div>
    `).join('')}
  </div>

  ${results.flags.length > 0 ? `
    <div class="flags">
      <strong>Key Areas for Improvement:</strong> ${results.flags.join(', ')}
    </div>
  ` : ''}

  <h2>The One Thing</h2>
  <h3>${results.oneThing.title}</h3>
  <p>${results.oneThing.description}</p>
  <ul>
    ${results.oneThing.steps.map(step => `<li>${step}</li>`).join('')}
  </ul>

  <div class="pagebreak"></div>
  <h2>Domain-Specific Actions</h2>
  ${coreDomains.map(domain => `
    <h3>${domain.charAt(0).toUpperCase() + domain.slice(1)} (${results.scores[domain] ?? 0}%)</h3>
    <ul>
      ${(results.domainActions[domain] || []).map(action => `<li>${action}</li>`).join('')}
    </ul>
  `).join('')}

  ${results.recommendedVideos.length > 0 ? `
    <div class="pagebreak"></div>
    <h2>Recommended Videos</h2>
    ${results.recommendedVideos.map(video => `
      <div class="video">
        <h3>${video.title}</h3>
        <p>${video.tldr}</p>
        <p class="subtitle">Duration: ${video.duration_minutes} minutes</p>
        <p><strong>URL:</strong> ${video.url}</p>
      </div>
    `).join('')}
  ` : ''}

  ${results.recommendedArticles.length > 0 ? `
    <div class="pagebreak"></div>
    <h2>Recommended Articles</h2>
    ${results.recommendedArticles.map(article => `
      <div class="article">
        <h3>${article.title}</h3>
        <p class="subtitle">${article.authors} (${article.year}) – ${article.source}</p>
        <p><strong>Key Points:</strong></p>
        <ul>
          ${article.tldr.map(point => `<li>${point}</li>`).join('')}
        </ul>
        <p><strong>Try Tomorrow:</strong></p>
        <ul>
          ${article.try_tomorrow.map(action => `<li>${action}</li>`).join('')}
        </ul>
        <p><strong>URL:</strong> ${article.url}</p>
      </div>
    `).join('')}
  ` : ''}
</body>
</html>
  `;
}

/**
 * Generate LLM prompt from results
 */
export function generateLLMPrompt(
  scores: Scores,
  metaScores: Scores,
  flags: string[],
  oneThing: OneThing,
  domainActions: Record<string, string[]>,
  videos: VideoRec[],
  articles: ArticleRec[],
  allQuestions?: Question[],
  answers?: Record<string, number | string>
): string {
  const coreDomains = APP_CONFIG.CORE_DOMAINS;
  const coreString = coreDomains.map((d) => `${d}: ${scores[d] ?? 0}`).join(', ');
  const metaDomains = Object.keys(metaScores)
    .map((d) => `${d}: ${metaScores[d] ?? 0}`)
    .join(', ');
  const flagsString = flags.join(', ');
  const articleIds = articles.map((a) => a.id).join(', ');
  const videoIds = videos.map((v) => v.id).join(', ');

  // Build answers section if questions and answers are provided
  let answersSection = '';
  if (allQuestions && answers) {
    answersSection = '\n\nDetailed Question Responses:\n';
    answersSection += allQuestions.map(q => {
      const answer = answers[q.id];
      if (answer === undefined) return '';
      
      // Determine if answer is positive (high score) or negative (low score)
      // For likert5: 4-5 is positive, 1-2 is negative, 3 is neutral
      // For ynm: yes (1) is positive, no (0) or maybe (0.5) is neutral/negative
      let sentiment = '';
      if (typeof answer === 'number') {
        if (q.reverse) {
          // For reverse-scored questions, low answers are positive
          sentiment = answer >= 4 ? '❌ (negative pattern)' : answer >= 3 ? '⚠️ (neutral)' : '✅ (positive pattern)';
        } else {
          // For normal questions, high answers are positive
          sentiment = answer >= 4 ? '✅ (positive pattern)' : answer >= 3 ? '⚠️ (neutral)' : '❌ (negative pattern)';
        }
      }
      
      return `- Q: ${q.text}\n  Answer: ${answer} ${sentiment}`;
    }).filter(line => line).join('\n');
  }

  return (
    // PERSONA & CONTEXT (Tip #3: Utilize contextual prompts)
    `You are an expert evidence-based learning coach who specializes in meta-learning and study skill optimization. ` +
    `Your role is to help students maximize their learning ROI by focusing on high-impact interventions.\n\n` +
    
    // SITUATION (Tip #2: Be as specific as possible)
    `STUDENT'S DIAGNOSTIC PROFILE:\n` +
    `Core Learning Skills: ${coreString}\n` +
    `Meta-Learning Skills: ${metaDomains}\n` +
    `Key Areas for Improvement: ${flagsString || 'None identified'}\n\n` +
    
    // PRIORITY FOCUS (Tip #2 & #5: Specificity and highest ROI)
    `HIGHEST-ROI PRIORITY:\n` +
    `Focus Area: "${oneThing.title}"\n` +
    `Why This Matters: ${oneThing.description}\n` +
    `Quick Wins to Start Today: ${oneThing.steps.slice(0, 2).join('; ')}\n\n` +
    
    // DOMAIN-SPECIFIC ACTIONS (Tip #4: Provide examples)
    `TARGETED ACTIONS BY DOMAIN:\n` +
    `${coreDomains
      .map((d) => `• ${d.charAt(0).toUpperCase() + d.slice(1)} (Current: ${scores[d] ?? 0}%): ${domainActions[d].slice(0, 2).join(' → ')}`)
      .join('\n')}\n\n` +
    
    // SUPPORTING RESOURCES
    `RECOMMENDED LEARNING RESOURCES:\n` +
    `Videos to watch: ${videoIds || 'None recommended'}\n` +
    `Articles to read: ${articleIds || 'None recommended'}\n` +
    
    // DETAILED RESPONSES (Tip #4 & #6: Examples and chain-of-thought)
    answersSection +
    
    // CHAIN-OF-THOUGHT PROMPT (Tip #6: Break down complex reasoning)
    `\n\n---\n` +
    `ANALYSIS FRAMEWORK - Think through this systematically:\n` +
    `1. CURRENT STATE: Which meta-learning skills are strongest? Which are weakest?\n` +
    `2. ROOT CAUSES: Why might the low-scoring areas be challenging?\n` +
    `3. QUICK WINS: What's one small change with high ROI that could be implemented TODAY?\n` +
    `4. 30-DAY PLAN: What's a realistic sequence of improvements for the next month?\n` +
    `5. SUCCESS METRICS: How would we know if these changes are working?\n` +
    `\n` +
    `---\n` +
    `DELIVERABLE:\n` +
    `Please create a personalized study plan that:\n` +
    `• Prioritizes "${oneThing.title}" as the primary focus\n` +
    `• Identifies 2-3 specific, actionable steps to implement this week\n` +
    `• Explains why each step will have high ROI for meta-learning improvement\n` +
    `• Includes realistic timeframes and success indicators\n` +
    `• Connects recommendations to the diagnostic results above`
  );
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  }
}
