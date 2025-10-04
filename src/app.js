/**
 * Main application orchestrator - refactored for maintainability
 */
import { loadAppData } from './services/data.service.js';
import { computeScores } from './services/scoring.service.js';
import { computeFlags } from './services/flags.service.js';
import { selectOneThing, selectDomainActions, recommendVideos, recommendArticles, } from './services/recommendation.service.js';
import { exportResultsAsJSON, generateLLMPrompt, copyToClipboard, } from './services/export.service.js';
import { renderIntroView, renderQuestionView, renderResultsView } from './views/app.views.js';
import { clearElement } from './utils/dom.utils.js';
/**
 * Main Application Class
 */
class LearningApp {
    constructor(root) {
        this.appData = null;
        this.answers = {};
        this.isMetaPhase = false;
        this.root = root;
    }
    /**
     * Initialize the application
     */
    async init() {
        try {
            this.appData = await loadAppData();
            this.showIntro();
        }
        catch (error) {
            console.error('Failed to load app data:', error);
            this.root.innerHTML = '<div class="card"><p>Failed to load app data. Please refresh the page.</p></div>';
        }
    }
    /**
     * Show introduction screen
     */
    showIntro() {
        this.answers = {};
        this.isMetaPhase = false;
        clearElement(this.root);
        const introView = renderIntroView(() => this.showQuestion(0));
        this.root.appendChild(introView);
    }
    /**
     * Show a question by index
     */
    showQuestion(index) {
        if (!this.appData)
            return;
        const questions = !this.isMetaPhase
            ? this.appData.coreQuestions
            : this.appData.metaQuestions;
        const question = questions[index];
        if (!question) {
            // Finished this phase
            if (!this.isMetaPhase) {
                // Move to meta phase
                this.isMetaPhase = true;
                this.showQuestion(0);
            }
            else {
                // All done
                this.computeAndShowResults();
            }
            return;
        }
        const total = this.appData.coreQuestions.length + this.appData.metaQuestions.length;
        const currentNum = !this.isMetaPhase
            ? index + 1
            : this.appData.coreQuestions.length + index + 1;
        // Ensure default answer is set
        if (this.answers[question.id] === undefined) {
            this.answers[question.id] = question.type === 'likert5' ? 3 : 'maybe';
        }
        clearElement(this.root);
        const questionView = renderQuestionView(question, currentNum, total, this.answers[question.id], (answer) => {
            this.answers[question.id] = answer;
        }, () => {
            // Ensure answer is set before moving forward
            if (this.answers[question.id] === undefined) {
                this.answers[question.id] = question.type === 'likert5' ? 3 : 'maybe';
            }
            this.showQuestion(index + 1);
        }, () => this.showQuestion(index - 1));
        this.root.appendChild(questionView);
    }
    /**
     * Compute results and show results screen
     */
    computeAndShowResults() {
        if (!this.appData)
            return;
        // Compute scores
        const { scores, metaScores, overall } = computeScores(this.appData.coreQuestions, this.appData.metaQuestions, this.answers);
        // Compute flags
        const allQuestions = [...this.appData.coreQuestions, ...this.appData.metaQuestions];
        const flags = computeFlags(scores, metaScores, this.answers, allQuestions);
        // Generate recommendations
        const oneThing = selectOneThing(flags, scores);
        const domainActions = selectDomainActions(scores);
        const recommendedVideos = recommendVideos(this.appData.videos, flags);
        const recommendedArticles = recommendArticles(this.appData.articles, flags);
        // Create results object
        const results = {
            answers: this.answers,
            scores,
            metaScores,
            flags,
            overall,
            oneThing,
            domainActions,
            recommendedVideos,
            recommendedArticles,
        };
        // Render results
        clearElement(this.root);
        const resultsView = renderResultsView(scores, overall, oneThing, domainActions, recommendedVideos, recommendedArticles, () => this.handleExport(results), () => this.handleCopyPrompt(results));
        this.root.appendChild(resultsView);
    }
    /**
     * Handle export button click
     */
    handleExport(results) {
        try {
            exportResultsAsJSON(results);
        }
        catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export results');
        }
    }
    /**
     * Handle copy prompt button click
     */
    async handleCopyPrompt(results) {
        try {
            const prompt = generateLLMPrompt(results.scores, results.metaScores, results.flags, results.oneThing, results.domainActions, results.recommendedVideos, results.recommendedArticles);
            await copyToClipboard(prompt);
            alert('Prompt copied to clipboard!');
        }
        catch (error) {
            console.error('Copy failed:', error);
            alert('Failed to copy prompt');
        }
    }
}
/**
 * Bootstrap the app when DOM is ready
 */
window.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('app');
    if (!root) {
        console.error('Root element not found');
        return;
    }
    const app = new LearningApp(root);
    app.init();
});
