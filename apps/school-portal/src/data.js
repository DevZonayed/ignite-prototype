export const titles = {
  overview: 'Overview',
  teachers: 'Teachers',
  learners: 'Learners',
  classes: 'Classes',
  curriculum: 'Curriculum coverage',
  homework: 'Homework compliance',
  attendance: 'Attendance & assessment',
  reports: 'Reports',
  settings: 'Settings',
}

// overview tiles (exact PRD set)
export const tiles = [
  ['Teachers active', '12/14', '#16a34a', 'updated 4 min ago'],
  ['Children reached', '486', '#7c3aed', 'of 512 enrolled'],
  ['Lessons completed today', '37', '#2563EB', 'started & completed'],
  ['Media uploaded', '148', '#14b8a6', 'this week'],
  ['Projects completed', '64', '#f97316', 'Scratch · Python · robotics'],
  ['Curriculum completion', '88%', '#2563EB', '= done ÷ published'],
  ['Learner engagement', '92%', '#16a34a', 'active this week'],
  ['Schools active', '1', '#4f46e5', 'this campus'],
]

// teachers
export const tch = [
  ['Adewale Balogun', 'JSS 1, JSS 2', 28, 92, 'Today 10:24', 'Active'],
  ['Funke Okafor', 'JSS 1', 24, 90, 'Today 08:57', 'Active'],
  ['Chinedu Nwosu', 'JSS 3', 19, 75, 'Yesterday', 'Active'],
  ['Aisha Bello', 'P 5, P 6', 22, 88, 'Today 09:40', 'Active'],
  ['Ibrahim Musa', 'JSS 2', 16, 70, '2 days', 'On leave'],
]

// learners
export const names = ['Amara Eze', 'Chidi Okonkwo', 'Ngozi Bello', 'Emeka Nwosu', 'Fatima Sani', 'Tunde Adeyemi', 'Zainab Yusuf', 'Kelechi Obi', 'Blessing Ade', 'David Okoro']

// classes
export const cls = [
  ['JSS 1', 'Mr. Balogun', 32, 95],
  ['JSS 2', 'Mr. Musa', 29, 88],
  ['JSS 3', 'Mr. Nwosu', 27, 75],
  ['P 6', 'Ms. Bello', 34, 91],
  ['P 5', 'Ms. Bello', 31, 83],
  ['P 4', 'Mrs. Okafor', 30, 86],
]

// curriculum accordion
export const units = [
  ['Unit 1 · Getting Started with Scratch', 100, ['What is coding?', 'The Scratch stage', 'First sprite', 'Say & think blocks']],
  ['Unit 2 · Sprites & Events', 100, ['Green flag', 'Key events', 'Broadcasting', 'Mini project']],
  ['Unit 3 · Loops & Motion', 72, ['Repeat blocks', 'Forever & wait', 'Move & glide', 'Loops & Motion project', 'Debugging loops']],
  ['Unit 4 · Intro to Python', 20, ['Print & variables', 'Input', 'If statements', 'Loops in Python']],
  ['Unit 5 · Robotics Basics', 0, ['Meet the robot', 'Motors', 'Sensors', 'Line follower']],
]

// heat table
export const weeks = [
  ['Wk 1', 96, 92, 88],
  ['Wk 2', 94, 89, 91],
  ['Wk 3', 98, 95, 93],
  ['Wk 4', 90, 86, 89],
  ['Wk 5', 97, 94, 96],
  ['Wk 6', 93, 91, 87],
]

export function heatColor(v) {
  return v >= 95 ? '#16a34a' : v >= 88 ? '#86efac' : '#dcfce7'
}

// homework compliance
export const hwTiles = [
  ['On-time rate', '84%', '#16a34a', '+3% vs last week'],
  ['Pending', '22', '#f59e0b', 'across 5 classes'],
  ['Late', '9', '#ef4444', 'reminders available'],
  ['Not started', '5', '#ef4444', 'JSS 3 highest'],
]

export const hwClasses = [
  ['JSS 1', 32, 28, 3, 1, 88],
  ['JSS 2', 30, 24, 4, 2, 80],
  ['JSS 3', 28, 19, 6, 3, 68],
  ['P 6', 26, 24, 1, 1, 92],
  ['P 5', 24, 20, 3, 1, 83],
]

export function otColor(v) {
  return v >= 85 ? 'var(--success)' : v >= 75 ? 'var(--warning)' : 'var(--danger,#ef4444)'
}

export const hwAlerts = [
  ['Chidi Okonkwo', 'JSS 3', 'Smart Reading Lamp', '3 days late', '#ef4444'],
  ['Amara Eze', 'JSS 3', 'Smart Reading Lamp', 'Not started', '#ef4444'],
  ['Tunde Bello', 'JSS 2', 'Smart Reading Lamp', '1 day late', 'var(--warning)'],
]

export const hwSubs = [
  ['Ngozi Adeyemi', 'P 6', 'Smart Reading Lamp', 'Today, 09:12', 'On time', 'var(--success)'],
  ['Emeka Obi', 'JSS 1', 'Smart Reading Lamp', 'Today, 08:40', 'On time', 'var(--success)'],
  ['Bola Ade', 'JSS 2', 'Smart Reading Lamp', 'Yesterday', 'Late', 'var(--warning)'],
  ['Chidi Okonkwo', 'JSS 3', 'Smart Reading Lamp', '—', 'Pending', '#ef4444'],
]

export function initials(s) {
  return s
    .replace(/^Mr\/Mrs\s/, '')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
