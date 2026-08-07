// Exact sample data arrays ported from design/pages/teacher.html <script>

// units: [title, state('done'|'cur'), [lesson titles]]
export const units = [
  [
    'Unit 1 · Getting Started with Scratch',
    'done',
    ['What is coding?', 'The Scratch stage', 'First sprite', 'Say & think blocks'],
  ],
  [
    'Unit 2 · Sprites & Events',
    'done',
    ['Green flag', 'Key events', 'Broadcasting', 'Mini project'],
  ],
  [
    'Unit 3 · Loops & Motion',
    'done',
    ['Repeat blocks', 'Forever & wait', 'Move & glide', 'Motion + loops', 'Loops & Motion project', 'Debugging loops'],
  ],
  [
    'Unit 4 · Intro to Python',
    'done',
    ['Print & variables', 'Input', 'If statements', 'Loops in Python'],
  ],
  [
    'Unit 5 · Robotics · Little Genius Lab™',
    'cur',
    ['What is robotics?', 'Sensors & actuators', 'The Arduino board', 'Connecting Arduino', 'Build a Smart Reading Lamp', 'Line-follower robot'],
  ],
];

// learners: [name, initials, bgColor, textColor]
export const lr = [
  ['Amara Eze', 'AE', '#e0e7ff', '#4338ca'],
  ['Chidi Okonkwo', 'CO', '#dcfce7', '#166534'],
  ['Ngozi Bello', 'NB', '#fef9c3', '#a16207'],
  ['Emeka Nwosu', 'EN', '#fee2e2', '#b91c1c'],
  ['Fatima Sani', 'FS', '#dcfce7', '#166534'],
  ['Tunde Adeyemi', 'TA', '#e0e7ff', '#4338ca'],
  ['Zainab Yusuf', 'ZY', '#f3e8ff', '#7c3aed'],
];

// rubric dims: [name, color, defaultScore]
export const dims = [
  ['Coding', '#2563EB', 4],
  ['Creativity', '#7C3AED', 4],
  ['Collaboration', '#14B8A6', 3],
  ['Communication', '#EC4899', 3],
  ['Critical Thinking', '#0891B2', 3],
  ['Problem Solving', '#16A34A', 3],
  ['Attendance', '#F59E0B', 4],
  ['Digital Literacy', '#6366F1', 3],
  ['Robotics', '#E11D48', 2],
  ['STEAM', '#059669', 3],
];

// attendance: [name, initials, bg, textColor, status('p'|'a'|'l'|'')]
export const att = [
  ['Amara Eze', 'AE', '#dcfce7', '#166534', 'p'],
  ['Chidi Okonkwo', 'CO', '#dcfce7', '#166534', 'p'],
  ['Ngozi Bello', 'NB', '#fef9c3', '#a16207', 'l'],
  ['Emeka Nwosu', 'EN', '#fee2e2', '#b91c1c', 'a'],
  ['Fatima Sani', 'FS', '#dcfce7', '#166534', 'p'],
  ['Tunde Adeyemi', 'TA', '#e0e7ff', '#4338ca', ''],
];

// assessment default scores by index (falls back to 3)
export const assessScores = [4, 4, 3, 2, 4, 3];

// lesson media videos: [title, duration, section, color]
export const vids = [
  ['Components overview', '2:40', 'Components', '#1e293b'],
  ['Wiring the breadboard', '3:15', 'Wiring', '#0f766e'],
  ['Writing the PictoBlox program', '4:05', 'Programming', '#2563EB'],
  ['Uploading to Arduino', '1:50', 'Upload', '#7c3aed'],
  ['Testing your lamp', '2:20', 'Testing', '#b45309'],
  ['Challenge: 5-second timer', '2:35', 'Challenge', '#be123c'],
];

// homework attach media = vids (as MP4) + two extra image entries: [title, kind, color]
export const hwMedia = vids
  .map((v) => [v[0], 'MP4', v[3]])
  .concat([
    ['Button-press demo', 'GIF', '#7c3aed'],
    ['LG-305 wiring diagram', 'JPG', '#0ea5e9'],
  ]);

// homework review 2-way thread: [side('me'|'o'), label, text]
export const tThreadInit = [
  ['me', 'You', 'Great start on the wiring! In the video, ask the learner to point to the button as they press it.'],
  ['o', 'Parent · Mr. Eze', "Thank you — we'll film it this evening."],
];
