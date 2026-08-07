// Sample data ported verbatim from design/pages/admin.html <script> block.
// Sample content only — no real learner data.

export const titles = {
  overview: 'All-schools overview',
  schools: 'Schools',
  users: 'Users',
  imports: 'Bulk onboarding',
  curriculum: 'Curriculum authoring',
  media: 'Media library',
  announcements: 'Announcements to parents',
  scoring: 'Scoring configuration',
  ai: 'AI services',
  monitoring: 'Monitoring',
  security: 'Security & Audit',
}

export const regions = ['Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Enugu']

export const schoolNames = [
  'Bright Future Academy', 'Unity College', 'Hillcrest Schools', 'Greenfield Model',
  'Sunrise International', 'Cornerstone Academy', 'Royal Heritage', 'Peace Model School',
  'New Era College', 'Little Stars School', 'Excel Academy', 'Trinity International',
  'Grace Foundation', 'Kings & Queens', 'Pathfinder School', 'Beacon Light',
  'Crown Academy', 'Harmony Schools', 'Nobel Model', 'Zenith College',
]

// Computed schools rows (matches the forEach in the source)
export const schools = schoolNames.map((n, i) => {
  const cov = 68 + ((i * 7) % 30)
  const st = cov < 75 ? 'b-amber' : 'b-green'
  const stt = cov < 75 ? 'Needs attention' : 'Active'
  return {
    name: n,
    region: regions[i % regions.length],
    teachers: (2 + (i % 4)) + '/' + (3 + (i % 4)),
    learners: 380 + i * 23,
    cov,
    st,
    stt,
  }
})

export const users = [
  ['Zonayed Ahamad', 'Platform Admin', '—', 'Active', 'now'],
  ['Funke Okafor', 'Teacher', 'Bright Future', 'Active', '8 min'],
  ['Adewale Balogun', 'Teacher', 'Bright Future', 'Active', '24 min'],
  ['Ngozi Bello', 'Principal', 'Unity College', 'Active', '1 hr'],
  ['Chinedu Nwosu', 'Teacher', 'Hillcrest', 'Suspended', '2 days'],
  ['Aisha Bello', 'Teacher', 'Greenfield', 'Active', '15 min'],
  ['Emeka Obi', 'Curriculum Admin', '—', 'Active', '40 min'],
  ['Tunde Ade', 'Parent', 'Bright Future', 'Active', '3 hr'],
]

export const dims = [
  ['Coding', '#2563EB', 15],
  ['Creativity', '#7C3AED', 10],
  ['Collaboration', '#14B8A6', 10],
  ['Communication', '#EC4899', 10],
  ['Critical Thinking', '#0891B2', 10],
  ['Problem Solving', '#16A34A', 10],
  ['Attendance', '#F59E0B', 10],
  ['Digital Literacy', '#6366F1', 10],
  ['Robotics', '#E11D48', 8],
  ['STEAM', '#059669', 7],
]

export const media = [
  ['Scratch demo', 'mp4', '#7c3aed', 'demo.mp4'],
  ['Loops worksheet', 'pdf', '#ef4444', 'loops.pdf'],
  ['Robot wiring', 'pdf', '#ef4444', 'wiring.pdf'],
  ['Starter project', 'sb3', '#2563EB', 'start.sb3'],
  ['Python intro', 'mp4', '#7c3aed', 'py.mp4'],
  ['Sensors guide', 'pdf', '#ef4444', 'sensors.pdf'],
  ['Sprites pack', 'png', '#14b8a6', 'sprites.png'],
  ['Assessment key', 'pdf', '#ef4444', 'key.pdf'],
]

export const audit = [
  ['Curriculum v4 published', 'E. Obi', 'Digital Innovation', 'Today 10:24', 'OK'],
  ['Bulk import 320 learners', 'Z. Ahamad', 'Unity College', 'Today 09:41', 'OK'],
  ['Role changed → Principal', 'Z. Ahamad', 'N. Bello', 'Yesterday 16:15', 'OK'],
  ['LQS rubric v2 activated', 'E. Obi', 'Scoring', 'Yesterday 14:02', 'OK'],
  ['Login failed ×3', 'unknown', 'c.nwosu', 'Yesterday 08:03', 'Blocked'],
  ['Data export', 'N. Bello', 'Unity roster', 'Mon 11:20', 'OK'],
]

export const monVals = [210, 240, 265, 230, 280, 190, 150]
export const monDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const initialAnnPosts = [
  ['Term 3 kits ready for collection', "Please collect your child's Little Genius Kit from the front office by Friday.", 'All parents', '2 days ago'],
  ['Robotics showcase — 30 July', 'Parents are invited to the end-of-term Smart Invention showcase.', 'All parents', 'Last week'],
]
