// Exact data ported from design/pages/learner.html <script>

// gradients expressed as [startColor, endColor] for 135deg linear-gradient
export const projects = [
  {
    t: 'Maze Game',
    f: 'scratch · maze.sb3',
    c: ['#3B82F6', '#2563EB'],
    code: 'when green flag clicked\n  repeat 10\n    move 10 steps',
    desc: 'A maze where the sprite walks using loops.',
    skills: 'Coding · Creativity',
  },
  {
    t: 'Number Guesser',
    f: 'python · guess.py',
    c: ['#22C55E', '#16A34A'],
    code: 'n = random(1,10)\nwhile guess != n:\n  guess = input()',
    desc: 'A Python game that guesses a number.',
    skills: 'Coding · Problem Solving',
  },
  {
    t: 'Line Robot',
    f: 'robotics · build',
    c: ['#F43F5E', '#E11D48'],
    code: 'if sensor == black:\n  turn left',
    desc: 'A robot that follows a black line.',
    skills: 'Robotics · STEAM',
  },
  {
    t: 'My Digital Hero',
    f: 'design · poster',
    c: ['#A78BFA', '#7C3AED'],
    code: '',
    desc: 'A poster about a digital innovator.',
    skills: 'Creativity · Communication',
  },
  {
    t: 'Catch the Star',
    f: 'scratch · game.sb3',
    c: ['#60A5FA', '#2563EB'],
    code: 'forever\n  if touching star\n    change score',
    desc: 'A catching game with a score.',
    skills: 'Coding · Critical Thinking',
  },
  {
    t: 'Robot Demo',
    f: 'video · mp4',
    c: ['#2DD4BF', '#14B8A6'],
    code: '',
    desc: 'A video of my robot working.',
    skills: 'Robotics · Communication',
  },
];

// [label, value(0..1), color, level]
export const dims = [
  ['Coding', 0.85, '#2563EB', 'Secure'],
  ['Creativity', 0.9, '#7C3AED', 'Secure'],
  ['Collab.', 0.7, '#14B8A6', 'Developing'],
  ['Comm.', 0.75, '#EC4899', 'Secure'],
  ['Critical', 0.65, '#0891B2', 'Developing'],
  ['Problem', 0.8, '#16A34A', 'Secure'],
  ['Attend.', 0.95, '#F59E0B', 'Secure'],
  ['Digital', 0.85, '#6366F1', 'Secure'],
  ['Robotics', 0.6, '#E11D48', 'Developing'],
  ['STEAM', 0.7, '#059669', 'Developing'],
];

// [name, earned(1/0)]
export const badges = [
  ['First Scratch', 1],
  ['Loop Master', 1],
  ['Robotics Rookie', 1],
  ['Python Starter', 1],
  ['Debugger', 0],
  ['Inventor', 0],
];

// Recent work thumbnail colors (from script: ['#2563EB','#16A34A','#E11D48'])
export const recentColors = ['#2563EB', '#16A34A', '#E11D48'];

// Derive the recent-work "tag" glyph, matching the source logic:
// tag = f.split(' · ')[1] || f ; then tag.indexOf('.')>=0 ? tag.slice(from '.') : '◎'
export function recentTag(f) {
  const parts = f.split(' · ');
  const tag = parts[1] || f;
  const dot = tag.indexOf('.');
  return dot >= 0 ? tag.slice(dot) : '◎';
}

// Portfolio thumbnail selection, matching thumbFor() in the source.
// Returns { kind, badge }
export function thumbFor(f) {
  if (f.indexOf('video') >= 0) return { kind: 'video', badge: 'mp4' };
  if (f.indexOf('python') >= 0) return { kind: 'python', badge: '.py' };
  if (f.indexOf('robot') >= 0) return { kind: 'robot', badge: 'robot' };
  if (f.indexOf('design') >= 0 || f.indexOf('poster') >= 0)
    return { kind: 'design', badge: 'img' };
  return { kind: 'code', badge: '.sb3' };
}
