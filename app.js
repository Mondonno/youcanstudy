"use strict";
/*
 * Main script for the Learning Diagnostic App.
 * This file uses vanilla TypeScript and DOM APIs to implement
 * a lightweight questionnaire and reporting system without external
 * frameworks. Data for questions, videos and articles are fetched
 * from local JSON files at runtime. After answering all questions
 * the user receives a tailored report including charts, recommended
 * actions, videos and articles. A JSON export and LLM prompt copy
 * are provided for easy reuse.
 */
// Utility to create a DOM element with attributes and children
function el(tag, attrs, ...children) {
    const element = document.createElement(tag);
    if (attrs) {
        for (const key of Object.keys(attrs)) {
            const val = attrs[key];
            if (key === 'class' && val) {
                element.className = val;
            }
            else if (key.startsWith('on') && typeof val === 'function') {
                element[key.toLowerCase()] = val;
            }
            else if (val !== null && val !== undefined) {
                element.setAttribute(key, val);
            }
        }
    }
    for (const child of children) {
        if (child === null || child === undefined)
            continue;
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        }
        else {
            element.appendChild(child);
        }
    }
    return element;
}
class LearningApp {
    constructor(root) {
        this.coreQuestions = [];
        this.metaQuestions = [];
        this.videos = [];
        this.articles = [];
        this.currentIndex = 0;
        this.answers = {};
        this.isMetaPhase = false;
        this.maxCore = 0;
        this.maxAll = 0;
        this.root = root;
    }
    // Load JSON resources and initialise the app
    async init() {
        // Fetch data in parallel
        const [coreQ, metaQ, videos, articles] = await Promise.all([
            fetch('data/questions-core.json').then((r) => r.json()),
            fetch('data/questions-meta.json').then((r) => r.json()),
            fetch('data/videos.json').then((r) => r.json()),
            fetch('data/articles.json').then((r) => r.json()),
        ]);
        this.coreQuestions = coreQ;
        this.metaQuestions = metaQ;
        this.videos = videos;
        this.articles = articles;
        this.maxCore = this.coreQuestions.length;
        this.maxAll = this.coreQuestions.length + this.metaQuestions.length;
        this.showIntro();
    }
    // Render introduction screen
    showIntro() {
        this.currentIndex = 0;
        this.answers = {};
        this.isMetaPhase = false;
        this.root.innerHTML = '';
        const title = el('h1', null, 'Learning Diagnostic');
        const desc = el('p', null, 'Welcome to the learning diagnostic tool. Answer a few short questions to receive personalised recommendations on how to study more effectively.');
        const startBtn = el('button', {
            class: 'button',
            onclick: () => this.showQuestion(0),
        }, 'Start');
        this.root.appendChild(el('div', { class: 'card' }, title, desc, startBtn));
    }
    // Render a question by index
    showQuestion(index) {
        var _a, _b;
        this.currentIndex = index;
        const question = !this.isMetaPhase
            ? this.coreQuestions[index]
            : this.metaQuestions[index];
        if (!question) {
            // Finished this phase
            if (!this.isMetaPhase) {
                // move to meta phase
                this.isMetaPhase = true;
                this.showQuestion(0);
            }
            else {
                // All done
                this.computeAndShowResults();
            }
            return;
        }
        this.root.innerHTML = '';
        const total = this.coreQuestions.length + this.metaQuestions.length;
        const currentQuestionNumber = !this.isMetaPhase
            ? index + 1
            : this.coreQuestions.length + index + 1;
        const progress = ((currentQuestionNumber - 1) / total) * 100;
        const qCard = el('div', { class: 'card' });
        const qNumber = el('h2', null, `Question ${currentQuestionNumber} of ${total}`);
        const qText = el('p', null, question.text);
        // Create input according to type
        let inputNode;
        if (question.type === 'likert5') {
            // scale 1-5
            const stored = (_a = this.answers[question.id]) !== null && _a !== void 0 ? _a : 3;
            const input = el('input', {
                type: 'range',
                min: '1',
                max: '5',
                step: '1',
                value: String(stored),
                oninput: (ev) => {
                    const target = ev.target;
                    this.answers[question.id] = parseInt(target.value, 10);
                    valueLabel.textContent = labels[parseInt(target.value, 10) - 1];
                },
            });
            // Label for qualitative positions
            const labels = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
            const currentValue = labels[(stored !== null && stored !== void 0 ? stored : 3) - 1];
            const valueLabel = el('div', { class: 'subtitle' }, currentValue);
            inputNode = el('div', null, input, valueLabel);
        }
        else {
            // Yes/No/Maybe radio buttons
            const stored = (_b = this.answers[question.id]) !== null && _b !== void 0 ? _b : 'maybe';
            const options = [
                ['yes', 'Yes'],
                ['no', 'No'],
                ['maybe', 'Maybe'],
            ];
            inputNode = el('div', { class: 'radio-group' }, ...options.map(([value, label]) => {
                const id = `${question.id}-${value}`;
                const radio = el('input', {
                    type: 'radio',
                    name: question.id,
                    id,
                    value,
                    checked: stored === value ? 'checked' : null,
                    onchange: () => {
                        this.answers[question.id] = value;
                    },
                });
                const lbl = el('label', { for: id }, label);
                return el('div', { class: 'radio-option' }, radio, lbl);
            }));
        }
        // Progress bar
        const bar = el('div', { class: 'progress-bar' }, el('div', { class: 'progress-bar-inner', style: `width: ${progress}%` }));
        // Buttons
        const controls = el('div', { style: 'margin-top:1rem; display:flex; justify-content: space-between;' });
        if (currentQuestionNumber > 1) {
            const backBtn = el('button', {
                class: 'button',
                onclick: () => this.showQuestion(index - 1),
            }, 'Back');
            controls.appendChild(backBtn);
        }
        else {
            controls.appendChild(el('div', null));
        }
        const isLastQuestion = currentQuestionNumber === total;
        const nextBtn = el('button', {
            class: 'button',
            onclick: () => {
                // ensure answer stored
                if (question.type === 'likert5' && this.answers[question.id] == null) {
                    this.answers[question.id] = 3;
                }
                if (question.type === 'ynm' && this.answers[question.id] == null) {
                    this.answers[question.id] = 'maybe';
                }
                this.showQuestion(index + 1);
            },
        }, isLastQuestion ? 'Finish' : 'Next');
        controls.appendChild(nextBtn);
        qCard.appendChild(qNumber);
        qCard.appendChild(qText);
        qCard.appendChild(inputNode);
        qCard.appendChild(bar);
        qCard.appendChild(controls);
        this.root.appendChild(qCard);
    }
    // Compute scores and show results
    computeAndShowResults() {
        const { scores, overall, metaScores } = this.computeScores();
        const flags = this.computeFlags(scores, metaScores);
        const oneThing = this.selectOneThing(flags, scores);
        const domainActions = this.selectDomainActions(scores);
        const recommendedVideos = this.recommendVideos(flags);
        const recommendedArticles = this.recommendArticles(flags);
        this.renderResults(scores, overall, metaScores, flags, oneThing, domainActions, recommendedVideos, recommendedArticles);
    }
    // Map answers to scores per domain
    computeScores() {
        var _a;
        const sums = {};
        const counts = {};
        // Score core questions
        for (const q of this.coreQuestions) {
            const ans = this.answers[q.id];
            if (ans === undefined)
                continue;
            const score = this.scoreAnswer(q, ans);
            if (!sums[q.domain]) {
                sums[q.domain] = 0;
                counts[q.domain] = 0;
            }
            sums[q.domain] += score;
            counts[q.domain] += 1;
        }
        const scores = {};
        for (const d of Object.keys(sums)) {
            scores[d] = Math.round(sums[d] / counts[d]);
        }
        // Compute meta domains separately
        const metaSums = {};
        const metaCounts = {};
        for (const q of this.metaQuestions) {
            const ans = this.answers[q.id];
            if (ans === undefined)
                continue;
            const score = this.scoreAnswer(q, ans);
            if (!metaSums[q.domain]) {
                metaSums[q.domain] = 0;
                metaCounts[q.domain] = 0;
            }
            metaSums[q.domain] += score;
            metaCounts[q.domain] += 1;
        }
        const metaScores = {};
        for (const d of Object.keys(metaSums)) {
            metaScores[d] = Math.round(metaSums[d] / metaCounts[d]);
        }
        // Weights: emphasise priming and retrieval equally, encoding and reference equal, overlearning slightly less
        const weights = {
            priming: 1,
            retrieval: 1,
            encoding: 1,
            reference: 1,
            overlearning: 0.8,
        };
        let weightedSum = 0;
        let totalWeight = 0;
        for (const d of Object.keys(scores)) {
            const w = (_a = weights[d]) !== null && _a !== void 0 ? _a : 1;
            weightedSum += scores[d] * w;
            totalWeight += w;
        }
        const overall = Math.round(weightedSum / totalWeight);
        return { scores, overall, metaScores };
    }
    // Score an individual answer 0–100
    scoreAnswer(q, ans) {
        let value = 0;
        if (q.type === 'likert5') {
            // ans is 1..5
            const numeric = typeof ans === 'number' ? ans : parseInt(ans, 10);
            value = (numeric - 1) / 4; // 0..1
        }
        else {
            // yes/no/maybe
            const map = { yes: 0, maybe: 0.5, no: 1 };
            value = map[String(ans).toLowerCase()];
        }
        if (q.reverse) {
            value = 1 - value;
        }
        return Math.round(value * 100);
    }
    // Compute flags based on core and meta scores and answers
    computeFlags(scores, metaScores) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const flags = [];
        // Core domain based flags
        if (((_a = scores.priming) !== null && _a !== void 0 ? _a : 100) < 50)
            flags.push('low_priming');
        if (((_b = scores.retrieval) !== null && _b !== void 0 ? _b : 100) < 60)
            flags.push('low_retrieval');
        if (((_c = scores.encoding) !== null && _c !== void 0 ? _c : 100) < 60)
            flags.push('low_encoding');
        if (((_d = scores.reference) !== null && _d !== void 0 ? _d : 100) < 50)
            flags.push('weak_reference');
        if (((_e = scores.overlearning) !== null && _e !== void 0 ? _e : 0) > 60 && ((_f = scores.priming) !== null && _f !== void 0 ? _f : 100) < 60)
            flags.push('overlearning_early');
        // Note-taking behaviours
        const q15 = this.answers['Q15'];
        const q17 = this.answers['Q17'];
        if (q15 !== undefined && this.scoreAnswer(this.getQuestionById('Q15'), q15) < 50) {
            flags.push('linear_notes');
        }
        if (q17 !== undefined && this.scoreAnswer(this.getQuestionById('Q17'), q17) > 50) {
            flags.push('linear_notes');
        }
        // Meta domains
        if (((_g = metaScores.mindset_fixed) !== null && _g !== void 0 ? _g : 100) < 60)
            flags.push('risk_fixed_mindset');
        if (((_h = metaScores.resourcefulness) !== null && _h !== void 0 ? _h : 100) < 60)
            flags.push('low_resourcefulness');
        if (((_j = metaScores.big_picture) !== null && _j !== void 0 ? _j : 100) < 60)
            flags.push('needs_big_picture');
        return Array.from(new Set(flags));
    }
    getQuestionById(id) {
        return this.coreQuestions.find((q) => q.id === id) || this.metaQuestions.find((q) => q.id === id);
    }
    // Determine the one thing to focus on based on flags and scores
    selectOneThing(flags, scores) {
        // Primary priority: low priming
        if (flags.includes('low_priming')) {
            return {
                title: 'Establish a Priming and Brain-Dump Routine',
                description: 'Start every learning session by previewing the topic, asking questions, and connecting new ideas to what you already know. Then summarise from memory immediately after.',
                steps: [
                    'Before class: skim headings and bold terms to get the big picture.',
                    'Write down three questions you expect to answer and one analogy or connection.',
                    'After class: do a 2–3 minute brain dump without notes to consolidate and uncover gaps.',
                ],
            };
        }
        // Secondary: low retrieval
        if (flags.includes('low_retrieval')) {
            return {
                title: 'Implement Daily Micro-Retrieval',
                description: 'Spaced, low-stakes recall strengthens memory better than re-reading. Engage in short recall sessions each day to test your knowledge and reveal misunderstandings.',
                steps: [
                    'Write three practice questions at the end of each study session.',
                    'The next day, answer those questions from memory without looking at notes.',
                    'Check your answers and identify areas that need more work.',
                ],
            };
        }
        // Next: weak reference / linear notes
        if (flags.includes('weak_reference') || flags.includes('linear_notes')) {
            return {
                title: 'Switch to Concept-Map Based Note-Taking',
                description: 'Rethink your notes: separate facts from concepts and use non-linear structures to map relationships instead of transcribing everything linearly.',
                steps: [
                    'Use a blank page: centre the main idea and branch out related concepts, causes, examples and implications.',
                    'Keep isolated facts in a small fact-bank separate from conceptual maps.',
                    'Review your maps regularly and update them with new insights.',
                ],
            };
        }
        // Next: risk fixed mindset
        if (flags.includes('risk_fixed_mindset')) {
            return {
                title: 'Cultivate a Growth Mindset',
                description: 'Believing that intelligence can grow increases motivation and resilience. Reframe mistakes as opportunities and focus on effort and strategy.',
                steps: [
                    'Reflect on a time when persistence led to success.',
                    "Replace 'I can't' with 'I can't yet' in your self-talk.",
                    'Seek feedback and view challenges as ways to strengthen your brain.',
                ],
            };
        }
        // Default: interleaving improvement
        return {
            title: 'Practice Interleaving and Spaced Revision',
            description: 'Mix different topics and problem types within a study session and distribute your practice over time to improve discrimination and long-term retention.',
            steps: [
                'Alternate between different subjects or problem types instead of studying one in isolation.',
                'Schedule multiple short review sessions over several days instead of one long cram.',
                'Include problems that combine multiple concepts to encourage transfer.',
            ],
        };
    }
    // Domain-specific recommended actions
    selectDomainActions(scores) {
        const actions = {};
        actions['priming'] = [
            'Preview material before class by skimming headings and summaries.',
            'Write down what you already know and generate questions to guide your learning.',
            'Create analogies to relate new concepts to familiar experiences.',
            'Pause during study to reorganise and summarise what you have learned so far.',
        ];
        actions['encoding'] = [
            'Teach the material to someone else or record yourself explaining it.',
            'Break complex ideas into smaller chunks and relate them to examples.',
            'Use diagrams or flowcharts to illustrate processes and relationships.',
            'Make connections across topics to deepen understanding.',
        ];
        actions['reference'] = [
            'Separate conceptual maps from fact banks: use non-linear structures for concepts and lists for facts.',
            'Minimise verbatim note-taking; focus on relationships and synthesis.',
            'Organise notes using colours or shapes to group related ideas.',
            'Regularly prune your notes, keeping only what aids understanding.',
        ];
        actions['retrieval'] = [
            'Self-test within 24 hours of learning new material to identify gaps.',
            'Use flashcards or quizzes for isolated facts and open-ended questions for concepts.',
            'Practice recalling information in different ways: writing, drawing and explaining verbally.',
            'Incorporate cumulative questions that combine topics to encourage transfer.',
        ];
        actions['overlearning'] = [
            'Delay intensive drilling until you have built a solid understanding through priming, encoding and retrieval.',
            'Use high-volume practice strategically for core skills that require speed or automaticity.',
            'Balance repetition with reflection to avoid rote memorisation without understanding.',
        ];
        return actions;
    }
    // Recommend videos based on flags
    recommendVideos(flags) {
        const scored = [];
        for (const v of this.videos) {
            let s = 0;
            for (const tag of v.maps_to) {
                if (flags.includes(tag))
                    s += 2;
            }
            // slight bonus for shorter videos
            s += Math.max(0, 5 - v.duration_minutes) * 0.1;
            if (s > 0)
                scored.push({ vid: v, score: s });
        }
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, 3).map((s) => s.vid);
    }
    // Recommend articles based on flags
    recommendArticles(flags) {
        const scored = [];
        for (const a of this.articles) {
            let s = 0;
            for (const tag of a.maps_to) {
                if (flags.includes(tag))
                    s += 2;
            }
            // favour easy and medium reads (≤8 minutes)
            s += Math.max(0, 10 - a.est_minutes) * 0.1;
            if (s > 0)
                scored.push({ art: a, score: s });
        }
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, 4).map((s) => s.art);
    }
    // Render results page with charts and recommendations
    renderResults(scores, overall, metaScores, flags, oneThing, domainActions, videos, articles) {
        var _a;
        this.root.innerHTML = '';
        const resultCard = el('div', { class: 'card' });
        resultCard.appendChild(el('h1', null, 'Your Personalised Report'));
        resultCard.appendChild(el('h2', null, `Overall Score: ${overall}%`));
        // Chart container
        const chartDiv = el('div', { class: 'chart-container' });
        // Create donut chart canvas
        const donutCanvas = el('canvas', { width: '300', height: '300' });
        chartDiv.appendChild(donutCanvas);
        // Draw donut chart
        this.drawDonutChart(donutCanvas, scores);
        // Radar chart canvas
        const radarCanvas = el('canvas', { width: '300', height: '300' });
        chartDiv.appendChild(radarCanvas);
        this.drawRadarChart(radarCanvas, scores);
        resultCard.appendChild(chartDiv);
        // One thing
        const oneThingCard = el('div', { class: 'card' });
        oneThingCard.appendChild(el('h2', null, 'The One Thing'));
        oneThingCard.appendChild(el('h3', null, oneThing.title));
        oneThingCard.appendChild(el('p', null, oneThing.description));
        const stepsList = el('ul', { class: 'info-list' });
        oneThing.steps.forEach((s) => {
            stepsList.appendChild(el('li', null, s));
        });
        oneThingCard.appendChild(stepsList);
        resultCard.appendChild(oneThingCard);
        // Domain actions
        const domainSection = el('div', { class: 'card' });
        domainSection.appendChild(el('h2', null, 'Domain-Specific Actions'));
        for (const domain of ['priming', 'encoding', 'reference', 'retrieval', 'overlearning']) {
            const domainScore = (_a = scores[domain]) !== null && _a !== void 0 ? _a : 0;
            const heading = el('h3', null, `${domain.charAt(0).toUpperCase() + domain.slice(1)} (${domainScore}%)`);
            domainSection.appendChild(heading);
            const list = el('ul', { class: 'info-list' });
            domainActions[domain].forEach((a) => list.appendChild(el('li', null, a)));
            domainSection.appendChild(list);
        }
        resultCard.appendChild(domainSection);
        // Recommended videos
        const videoSection = el('div', { class: 'card' });
        videoSection.appendChild(el('h2', null, 'Recommended Videos'));
        videos.forEach((vid) => {
            const card = el('div', { class: 'card' });
            card.style.marginBottom = '1rem';
            card.appendChild(el('h3', null, vid.title));
            card.appendChild(el('p', null, vid.tldr));
            const watch = el('a', { href: vid.url, target: '_blank', class: 'button', style: 'margin-top:0.5rem;' }, 'Watch');
            card.appendChild(watch);
            videoSection.appendChild(card);
        });
        resultCard.appendChild(videoSection);
        // Recommended articles
        const articleSection = el('div', { class: 'card' });
        articleSection.appendChild(el('h2', null, 'Recommended Articles'));
        articles.forEach((art) => {
            const card = el('div', { class: 'card' });
            card.style.marginBottom = '1rem';
            card.appendChild(el('h3', null, art.title));
            const meta = el('p', { class: 'subtitle' }, `${art.authors} (${art.year}) – ${art.source}`);
            card.appendChild(meta);
            const tldrList = el('ul', { class: 'info-list' });
            art.tldr.forEach((t) => tldrList.appendChild(el('li', null, t)));
            card.appendChild(tldrList);
            const tryList = el('ul', { class: 'info-list' });
            art.try_tomorrow.forEach((t) => tryList.appendChild(el('li', null, t)));
            card.appendChild(el('p', null, 'Try Tomorrow:'));
            card.appendChild(tryList);
            const readBtn = el('a', { href: art.url, target: '_blank', class: 'button', style: 'margin-top:0.5rem;' }, 'Read');
            card.appendChild(readBtn);
            articleSection.appendChild(card);
        });
        resultCard.appendChild(articleSection);
        // Export and copy section
        const exportDiv = el('div', { class: 'export-buttons' });
        const exportBtn = el('button', {
            class: 'button',
            onclick: () => this.handleExport(scores, metaScores, flags, oneThing, domainActions, videos, articles),
        }, 'Export JSON');
        const copyBtn = el('button', {
            class: 'button',
            onclick: () => this.handleCopyPrompt(scores, metaScores, flags, oneThing, domainActions, videos, articles),
        }, 'Copy LLM Prompt');
        exportDiv.appendChild(exportBtn);
        exportDiv.appendChild(copyBtn);
        resultCard.appendChild(exportDiv);
        this.root.appendChild(resultCard);
    }
    // Draw donut chart using canvas API
    drawDonutChart(canvas, scores) {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const domains = ['priming', 'encoding', 'reference', 'retrieval', 'overlearning'];
        const values = domains.map((d) => { var _a; return (_a = scores[d]) !== null && _a !== void 0 ? _a : 0; });
        const total = values.reduce((a, b) => a + b, 0);
        const colors = ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa'];
        const radius = Math.min(canvas.width, canvas.height) / 2 - 10;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let startAngle = -Math.PI / 2;
        values.forEach((val, index) => {
            const sliceAngle = (val / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            startAngle += sliceAngle;
        });
        // Hollow centre
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        // Labels
        ctx.fillStyle = '#1f2937';
        ctx.font = '16px sans-serif';
        let angle = -Math.PI / 2;
        values.forEach((val, index) => {
            const sliceAngle = (val / total) * Math.PI * 2;
            const midAngle = angle + sliceAngle / 2;
            const labelX = centerX + Math.cos(midAngle) * (radius + 20);
            const labelY = centerY + Math.sin(midAngle) * (radius + 20);
            ctx.textAlign = labelX > centerX ? 'left' : 'right';
            const label = `${domains[index]} (${val}%)`;
            ctx.fillText(label, labelX, labelY);
            angle += sliceAngle;
        });
    }
    // Draw radar chart
    drawRadarChart(canvas, scores) {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        const domains = ['priming', 'encoding', 'reference', 'retrieval', 'overlearning'];
        const values = domains.map((d) => { var _a; return ((_a = scores[d]) !== null && _a !== void 0 ? _a : 0) / 100; });
        const numAxes = domains.length;
        const radius = Math.min(canvas.width, canvas.height) / 2 - 20;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        // Draw grid
        const rings = 4;
        ctx.strokeStyle = '#e5e7eb';
        for (let r = 1; r <= rings; r++) {
            const rRadius = (radius * r) / rings;
            ctx.beginPath();
            for (let i = 0; i <= numAxes; i++) {
                const angle = (Math.PI * 2 * i) / numAxes;
                const x = centerX + Math.cos(angle) * rRadius;
                const y = centerY + Math.sin(angle) * rRadius;
                if (i === 0)
                    ctx.moveTo(x, y);
                else
                    ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        // Draw axes and labels
        ctx.strokeStyle = '#d1d5db';
        ctx.fillStyle = '#4b5563';
        ctx.font = '12px sans-serif';
        for (let i = 0; i < numAxes; i++) {
            const angle = (Math.PI * 2 * i) / numAxes;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();
            // Label slightly outside
            const lx = centerX + Math.cos(angle) * (radius + 10);
            const ly = centerY + Math.sin(angle) * (radius + 10);
            ctx.textAlign = lx > centerX ? 'left' : lx < centerX ? 'right' : 'center';
            ctx.textBaseline = ly > centerY ? 'top' : ly < centerY ? 'bottom' : 'middle';
            ctx.fillText(domains[i], lx, ly);
        }
        // Draw polygon
        ctx.beginPath();
        values.forEach((val, i) => {
            const angle = (Math.PI * 2 * i) / numAxes;
            const x = centerX + Math.cos(angle) * radius * val;
            const y = centerY + Math.sin(angle) * radius * val;
            if (i === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(124, 58, 237, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#7c3aed';
        ctx.stroke();
    }
    // Export data as JSON file
    handleExport(scores, metaScores, flags, oneThing, domainActions, videos, articles) {
        const data = {
            answers: this.answers,
            scores,
            metaScores,
            flags,
            oneThing,
            domainActions,
            recommendedVideos: videos.map((v) => v.id),
            recommendedArticles: articles.map((a) => a.id),
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
    // Copy LLM prompt to clipboard
    handleCopyPrompt(scores, metaScores, flags, oneThing, domainActions, videos, articles) {
        const prompt = this.generatePrompt(scores, metaScores, flags, oneThing, domainActions, videos, articles);
        navigator.clipboard
            .writeText(prompt)
            .then(() => {
            alert('Prompt copied to clipboard!');
        })
            .catch(() => {
            alert('Failed to copy prompt');
        });
    }
    // Generate LLM prompt from results
    generatePrompt(scores, metaScores, flags, oneThing, domainActions, videos, articles) {
        const coreDomains = ['priming', 'encoding', 'reference', 'retrieval', 'overlearning'];
        const coreString = coreDomains
            .map((d) => { var _a; return `${d}: ${(_a = scores[d]) !== null && _a !== void 0 ? _a : 0}`; })
            .join(', ');
        const metaDomains = Object.keys(metaScores)
            .map((d) => { var _a; return `${d}: ${(_a = metaScores[d]) !== null && _a !== void 0 ? _a : 0}`; })
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
}
// Bootstrap the app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('app');
    if (!root)
        return;
    const app = new LearningApp(root);
    app.init().catch((err) => {
        console.error(err);
        root.innerHTML = '<p>Failed to load app data.</p>';
    });
});
