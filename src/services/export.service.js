/**
 * Export service - handles data export and LLM prompt generation
 */
import { APP_CONFIG } from '../config/app.config.js';
/**
 * Export diagnostic results as JSON file
 */
export function exportResultsAsJSON(results) {
    const data = {
        answers: results.answers,
        scores: results.scores,
        metaScores: results.metaScores,
        flags: results.flags,
        overall: results.overall,
        oneThing: results.oneThing,
        domainActions: results.domainActions,
        recommendedVideos: results.recommendedVideos.map((v) => v.id),
        recommendedArticles: results.recommendedArticles.map((a) => a.id),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'learning-report.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
/**
 * Generate LLM prompt from results
 */
export function generateLLMPrompt(scores, metaScores, flags, oneThing, domainActions, videos, articles) {
    const coreDomains = APP_CONFIG.CORE_DOMAINS;
    const coreString = coreDomains.map((d) => `${d}: ${scores[d] ?? 0}`).join(', ');
    const metaDomains = Object.keys(metaScores)
        .map((d) => `${d}: ${metaScores[d] ?? 0}`)
        .join(', ');
    const flagsString = flags.join(', ');
    const articleIds = articles.map((a) => a.id).join(', ');
    const videoIds = videos.map((v) => v.id).join(', ');
    return (`You are an evidence-based learning coach.\n` +
        `My core domain scores are: ${coreString}.\n` +
        `My meta domain scores are: ${metaDomains}.\n` +
        `Overall flags: ${flagsString}.\n` +
        `The one thing recommended is: ${oneThing.title} – ${oneThing.description}.\n` +
        `Domain actions: ${coreDomains
            .map((d) => `${d}: ${domainActions[d].slice(0, 2).join('; ')}`)
            .join(' | ')}.\n` +
        `Recommended videos: ${videoIds}. Recommended articles: ${articleIds}.\n` +
        `Please provide a concise study plan based on these results with actionable next steps.`);
}
/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    }
    catch (error) {
        console.error('Failed to copy to clipboard:', error);
        throw new Error('Failed to copy to clipboard');
    }
}
