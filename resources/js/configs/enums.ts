export const GENDER_OPTIONS = [
    { value: 'Homme', label: 'Homme' },
    { value: 'Femme', label: 'Femme' },
];

export const MARITAL_STATUS_OPTIONS = [
    { value: 1, label: 'Célibataire' },
    { value: 2, label: 'Marié(e)' },
    { value: 3, label: 'Divorcé(e)' },
    { value: 4, label: 'Veuf(ve)' },
    { value: 5, label: 'Séparé(e)' },
];

export type Gender = typeof GENDER_OPTIONS[number]['value'];
export type MaritalStatus = typeof MARITAL_STATUS_OPTIONS[number]['value'];
