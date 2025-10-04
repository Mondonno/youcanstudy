/**
 * Test fixtures - sample data for testing
 */
export const mockQuestions = [
    {
        id: 'Q1',
        text: 'Test question 1',
        type: 'likert5',
        domain: 'priming',
    },
    {
        id: 'Q2',
        text: 'Test question 2',
        type: 'likert5',
        domain: 'retrieval',
        reverse: true,
    },
    {
        id: 'Q3',
        text: 'Test question 3',
        type: 'ynm',
        domain: 'encoding',
    },
    {
        id: 'Q15',
        text: 'Do you minimise the usage of linear notes?',
        type: 'likert5',
        domain: 'reference',
    },
    {
        id: 'Q17',
        text: 'Do you write many notes that you do not read again?',
        type: 'likert5',
        domain: 'reference',
        reverse: true,
    },
];
export const mockMetaQuestions = [
    {
        id: 'M1',
        text: 'Meta question 1',
        type: 'likert5',
        domain: 'mindset_fixed',
    },
    {
        id: 'M2',
        text: 'Meta question 2',
        type: 'ynm',
        domain: 'resourcefulness',
    },
];
export const mockVideos = [
    {
        id: 'V1',
        title: 'Video about priming',
        url: 'https://example.com/v1',
        maps_to: ['low_priming'],
        tldr: 'Learn about priming techniques',
        duration_minutes: 5,
    },
    {
        id: 'V2',
        title: 'Video about retrieval',
        url: 'https://example.com/v2',
        maps_to: ['low_retrieval', 'low_encoding'],
        tldr: 'Learn about retrieval practice',
        duration_minutes: 10,
    },
    {
        id: 'V3',
        title: 'Short video about mindset',
        url: 'https://example.com/v3',
        maps_to: ['risk_fixed_mindset'],
        tldr: 'Growth mindset basics',
        duration_minutes: 3,
    },
];
export const mockArticles = [
    {
        id: 'A1',
        title: 'Article about learning',
        authors: 'Smith et al.',
        year: 2020,
        source: 'Journal of Learning',
        url: 'https://example.com/a1',
        maps_to: ['low_priming', 'low_retrieval'],
        est_minutes: 5,
        tldr: ['Key point 1', 'Key point 2'],
        try_tomorrow: ['Action 1', 'Action 2'],
    },
    {
        id: 'A2',
        title: 'Article about notes',
        authors: 'Jones',
        year: 2021,
        source: 'Education Review',
        url: 'https://example.com/a2',
        maps_to: ['linear_notes', 'weak_reference'],
        est_minutes: 8,
        tldr: ['Note-taking strategies'],
        try_tomorrow: ['Try concept maps'],
    },
];
export const mockAnswers = {
    Q1: 3,
    Q2: 4,
    Q3: 'yes',
    Q15: 2,
    Q17: 4,
    M1: 2,
    M2: 'maybe',
};
export const mockScores = {
    priming: 50,
    retrieval: 75,
    encoding: 0,
    reference: 25,
    overlearning: 40,
};
export const mockMetaScores = {
    mindset_fixed: 50,
    resourcefulness: 75,
    big_picture: 80,
};
