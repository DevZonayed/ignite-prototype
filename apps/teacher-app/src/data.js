// Data shapes for the teacher app. All arrays start empty — the API layer
// (see apps/README) will populate them; screens show empty states until then.

// units: [title, state('done'|'cur'|''), [lesson titles]]
export const units = [];

// learners: [name, initials, bgColor, textColor]
export const lr = [];

// rubric dims: [name, color, defaultScore]
export const dims = [];

// attendance: [name, initials, bg, textColor, status('p'|'a'|'l'|'')]
export const att = [];

// assessment default scores by index (falls back to 3)
export const assessScores = [];

// lesson media videos: [title, duration, section, color]
export const vids = [];

// homework attach media: [title, kind, color]
export const hwMedia = [];

// homework review 2-way thread: [side('me'|'o'), label, text]
export const tThreadInit = [];
