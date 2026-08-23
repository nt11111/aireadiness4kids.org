/* ============================================================
   ARK site content. Edit copy here; pages read from this file.
   ============================================================ */

export const ORG = {
  name: "ARK",
  fullName: "AI Readiness for Kids",
  tagline: "Think. Prompt. Responsibly.",
  email: "hello@aireadiness4kids.org",
  mission:
    "ARK is a 501(c)(3) nonprofit dedicated to equipping K-12 students with the knowledge, skills, and ethical grounding to use artificial intelligence responsibly, safely, and thoughtfully, for themselves, their communities, and the world.",
  vision:
    "A future where every child, no matter their background or zip code, understands the AI tools shaping their world and has the confidence to use them with intention and integrity.",
};

export const TRUST = [
  "No student logins, no data collected",
  "Every lesson reviewed by classroom teachers",
  "100% free for students and schools",
  "Bilingual: English and Spanish",
];

/* Impact figures. These are launch-year targets; swap for live numbers as they come in. */
export const IMPACT = [
  { value: 17, suffix: "", label: "Free classroom modules" },
  { value: 3, suffix: "", label: "Grade-banded K-12 tracks" },
  { value: 6, suffix: "", label: "Programs and workshop formats" },
  { value: 100, suffix: "%", label: "Free to schools, always" },
];

export const TRACKS = [
  {
    id: "explorers", short: "K-5", label: "AI Explorers", grades: "Grades K-5", focus: "Discovery and Awareness", modules: 5, color: "#45D2FF",
    blurb: "Young learners discover that AI is all around them, how it helps and sometimes confuses us, and what it means to be a thoughtful user of technology.",
    folder: "https://drive.google.com/drive/folders/1RYQ5lLN-0gKUg4ef3VwQKcWJTPnEaKiR",
    list: [
      { t: "What Is AI?", d: "Discovering artificial intelligence through familiar everyday examples.", deck: "https://drive.google.com/file/d/1Zsk14_M7XfqQ_FAu7MNALF4LoUIJoYjM/view", topics: ["What makes something \"intelligent\"", "Examples of AI kids already use (Siri, Netflix, autocorrect)", "AI versus robots versus computers", "How AI learns from examples, a simple intro to training data"] },
      { t: "AI Helpers, and When They Get It Wrong", d: "Building early critical thinking about trusting technology.", deck: "https://drive.google.com/file/d/1iznODGb8DDAJumMA2PXNNAncAXWidqm6/view", topics: ["AI errors and why they happen", "Stories of AI being wrong or unfair", "When should we trust AI? When should we double-check?", "Who is responsible when AI makes a mistake?"] },
      { t: "Being a Smart AI User", d: "Asking good questions, evaluating answers, knowing when to ask a human.", deck: "https://drive.google.com/file/d/16AfnS-xr_hx022mmdIIYfSyM8rcmQee2/view", topics: ["What is a prompt? Giving AI good instructions", "Checking AI answers, is it always right?", "Asking a real person versus asking AI", "AI as a tool, not a replacement for thinking"] },
      { t: "Kindness, Feelings and AI", d: "How AI-generated content can affect emotions and relationships.", deck: "https://drive.google.com/file/d/16xiDyT6PHCDUTh3vj6cF0yu5FAcHjacw/view", topics: ["Can AI be kind or unkind?", "Cyberbullying and AI-generated content", "How seeing AI-made images affects how we feel", "Treating others kindly online, even when talking to a bot"] },
      { t: "My Digital Footprint", d: "What it means that AI tools collect and remember information.", deck: "https://drive.google.com/file/d/1RYbLbLHwLRpE_rclLNijLlNRRi-0K2Q-/view", topics: ["What is a digital footprint?", "What information AI can see or remember", "Keeping personal information private", "Simple rules for staying safe online"] },
    ],
  },
  {
    id: "investigators", short: "6-8", label: "AI Investigators", grades: "Grades 6-8", focus: "Critical Thinking and Ethics", modules: 6, color: "#2F8FE6",
    blurb: "Going deeper. How does AI actually work, what are its real-world consequences, and what does responsible use look like in school and daily life?",
    folder: "https://drive.google.com/drive/folders/1yp7PwpzLostPpjQt3sKvzkiMISs6vFF4",
    list: [
      { t: "How AI Actually Works", d: "A non-technical but accurate introduction to machine learning.", deck: "https://drive.google.com/file/d/14lBVS5vqATsPsrUnPw0yVS4rDpiryw8T/view", topics: ["Training data and how AI learns from examples", "Pattern recognition versus true understanding", "The difference between AI, machine learning, and algorithms", "Inputs, outputs, and feedback loops"] },
      { t: "Bias in AI", d: "How bias enters AI systems, with real-world examples of harm.", deck: "https://drive.google.com/file/d/1IQUN-oLoW1I0Xd0OFtDKMBES9eGuY_Hn/view", topics: ["What is bias, and how does it get into training data?", "Real cases: facial recognition, hiring algorithms, predictive policing", "Who is most affected by biased AI?", "What can be done to reduce AI bias?"] },
      { t: "AI and Schoolwork, Where Is the Line?", d: "Responsible use versus academic dishonesty in the age of ChatGPT.", deck: "https://drive.google.com/file/d/1HwB2KsYAosDHuC5mKgQSGODy5Ezl56N3/view", topics: ["How students are currently using AI for homework", "Plagiarism versus AI assistance", "When AI use helps learning versus when it undermines it", "School policies and why they exist"] },
      { t: "Deepfakes and Misinformation", d: "Spotting AI-generated content and thinking critically about media.", deck: "https://drive.google.com/file/d/1C--5TdobXzpUnMC7kPPPFTZ52l-oiBS_/view", topics: ["What are deepfakes and how are they made?", "How to spot AI-generated images, video, and audio", "Why people create and spread misinformation", "Tools and habits for fact-checking"] },
      { t: "Privacy and Your Data", d: "How AI companies collect data, and how to protect yourself.", deck: "https://drive.google.com/file/d/1bu1Pr4AH3eJBpUQkPE_lyqI4BwBT2UWL/view", topics: ["What data AI apps collect about users", "Data brokers and how personal information is sold", "Reading privacy policies, and why almost no one does", "Practical steps: settings, permissions, and habits"] },
      { t: "Ethical Dilemmas in AI", d: "Debating real scenarios with a structured decision-making framework.", deck: "https://drive.google.com/file/d/1wVYqADZR6dqTZkCmpR_KptBGwf4p8TDL/view", topics: ["Fairness, accountability, transparency", "Scenario: AI in hiring decisions", "Scenario: AI content moderation on social media", "Scenario: AI surveillance in public spaces", "How to reason through ethical trade-offs"] },
    ],
  },
  {
    id: "architects", short: "9-12", label: "AI Architects", grades: "Grades 9-12", focus: "Agency, Policy and Action", modules: 6, color: "#0D1F33",
    blurb: "For students ready to think seriously about AI's role in society and their own role in shaping it. Modules move from understanding to agency and action.",
    folder: "https://drive.google.com/drive/folders/1olHGh5ks8SIQfz5mnZci9R3pCgBxlcxi",
    list: [
      { t: "The AI Landscape Today", d: "What is real versus hype, what is possible now, and what is coming.", deck: "https://drive.google.com/file/d/1xDrLlIEts8zwkT8EZCEexY9CzoCs0HR8/view", topics: ["Generative AI and large language models", "The gap between AI marketing claims and reality", "Industries being transformed by AI right now", "What \"AGI\" means and why it matters"] },
      { t: "AI Ethics and Who Makes the Rules", d: "The policy landscape: who regulates AI, and where the gaps are.", deck: "https://drive.google.com/file/d/1850j2UeY50boTWGTijsjcUDeMePcOudO/view", topics: ["Major frameworks: EU AI Act, US executive orders, voluntary commitments", "Who has power over AI development", "The accountability gap: when AI causes harm, who is responsible?", "The student role in shaping norms and policy"] },
      { t: "Algorithmic Bias and Systemic Justice", d: "How algorithmic systems can reinforce or amplify inequity.", deck: "https://drive.google.com/file/d/109I2XQqV-OwA-yE9ZhgmLd1G-2Q6xF8E/view", topics: ["How historical inequity gets encoded in training data", "Case studies: criminal justice, healthcare, education, housing", "Intersectionality and compound algorithmic harm", "Auditing AI: how researchers and journalists hold it accountable"] },
      { t: "AI and the Future of Work", d: "How AI is changing job markets and what skills will matter.", deck: "https://drive.google.com/file/d/1zfsrItHexjCnuXBPWfEfaLmq7IwV6hnd/view", topics: ["Jobs AI is automating versus augmenting", "Skills that remain distinctly human", "AI and economic inequality", "Career planning in an AI-transformed world"] },
      { t: "Building Responsibly: Design Thinking with AI", d: "Students become AI designers and work through ethical decisions.", deck: "https://drive.google.com/file/d/1ns4kiAX4oADhTY2KF2Wzbau_MNAMRPcY/view", topics: ["Who is this for? Who could it harm?", "Stakeholder mapping and unintended consequences", "Red-teaming an AI system for misuse", "Project: design a responsible AI product for a real community need"] },
      { t: "Advocacy and Action", d: "A concrete action plan for advancing responsible AI, the capstone.", deck: "https://drive.google.com/file/d/1PVxz0pvkBfqL9CC-Vk7B1MINKPNbKl89/view", topics: ["Forms of advocacy: writing, organizing, building, speaking", "How to write a policy brief or op-ed on AI", "Real examples of youth AI advocacy", "Capstone: a one-page action plan presented to peers"] },
    ],
  },
];

export const PROGRAMS = [
  { key: "curriculum", title: "Free Curriculum Library", desc: "Classroom-ready lesson plans, slide decks, facilitator guides, and worksheets for every grade band. No login. No paywall. Updated every year.", to: "/curriculum" },
  { key: "workshops", title: "In-School Workshops", desc: "60-minute Express sessions, 3-hour Half-Day programs, and 6-hour Full-Day Immersives delivered by trained facilitators at your school.", to: "/programs#workshops" },
  { key: "parents", title: "Parent Information Nights", desc: "90-minute evening sessions, in English and Spanish, that help families understand what AI is, how kids use it, and how to talk about it at home.", to: "/programs#parents" },
  { key: "ambassadors", title: "Student Ambassador Program", desc: "High schoolers trained to run workshops for their peers. One teen can reach hundreds of classmates without a staff facilitator present.", to: "/get-involved#ambassadors" },
  { key: "pd", title: "Teacher Professional Development", desc: "Half-day and full-day sessions that certify educators to deliver ARK curriculum confidently, with a facilitator kit and ongoing access.", to: "/programs#pd" },
  { key: "summit", title: "Annual Student Summit", desc: "A yearly gathering of students, teachers, parents, and AI professionals with keynotes, student-led panels, and a project showcase.", to: "/programs#summit" },
];

export const VALUES = [
  { word: "Transparency", desc: "We help kids understand how AI works, not just how to use it." },
  { word: "Equity", desc: "Free curriculum and no-cost workshops, always. Bilingual resources and intentional outreach to underserved communities." },
  { word: "Empowerment", desc: "Students become informed participants, not passive consumers. Future builders, critics, and policy-makers." },
  { word: "Community", desc: "Built with parents, teachers, and students, not just for them. Real change happens in schools, families, and neighborhoods." },
  { word: "Ethics First", desc: "Every lesson grounds AI use in human values and real-world consequences." },
];

export const TESTIMONIALS = [
  { quote: "For the first time, my students were the ones explaining to me how the recommendation algorithm worked. The lessons gave them language they did not have before.", name: "Middle school teacher", role: "Pilot classroom, AI Investigators track" },
  { quote: "The parent night changed the conversation at our dinner table. I finally understood what my daughter was actually doing with these apps, and we set rules together.", name: "Parent", role: "Parent Information Night attendee" },
  { quote: "Leading a workshop for younger kids at my own school made me realize how much I had learned. It felt like real responsibility.", name: "Student Ambassador", role: "Grade 11" },
];

export const ROADMAP = [
  { phase: "Year 1", title: "Foundation", items: ["File 501(c)(3) and build the core team", "Launch the curriculum across all three tracks", "Deliver workshops in 3 to 5 regional districts", "Secure a founding grant"] },
  { phase: "Year 2", title: "Regional scale", items: ["Expand to 10+ districts", "Launch the ambassador program and teacher PD certification", "Host the first annual student summit", "Reach $250K revenue"] },
  { phase: "Year 3", title: "National", items: ["Partner with 3+ states", "National ambassador network", "Full Spanish-language curriculum", "Publish the first research report"] },
  { phase: "Year 5", title: "Model organization", items: ["Curriculum adopted nationwide", "100+ trained ambassadors", "50,000+ students reached annually", "A recognized voice on AI education policy"] },
];

export const LEADERSHIP = [
  { role: "Executive Director", desc: "Sets strategic direction, oversees operations, and leads fundraising and external partnerships. (Founder)" },
  { role: "Board of Directors", desc: "Five to seven members: educators, tech professionals, child development experts, and community leaders. Meets quarterly." },
  { role: "Advisory Council", desc: "AI researchers, school principals, curriculum designers, and parents. Meets twice a year." },
];

export const TEAMS = [
  { name: "Curriculum and Education", desc: "Develops and maintains all three K-12 tracks with content developers and active classroom-teacher advisors." },
  { name: "Workshops and Programs", desc: "Schedules and runs in-school workshops and manages facilitator training and certification." },
  { name: "Marketing and Communications", desc: "Owns brand voice, digital presence, and telling the impact story through data and testimonials." },
  { name: "Partnerships and Fundraising", desc: "Secures grants, corporate sponsors, individual donors, and district contracts." },
  { name: "Technology", desc: "Maintains the website and platform, hosts the curriculum, and tracks impact data." },
  { name: "Ambassadors and Volunteers", desc: "A national team of college students plus high-school Student Ambassadors running peer workshops." },
];

export const TIERS = [
  { name: "Community Supporter", amount: "$1,000 to $9,999", perks: ["Website listing", "Event acknowledgment"] },
  { name: "Program Sponsor", amount: "$10,000 to $24,999", perks: ["Program-level naming", "Logo on website and event materials", "Annual report acknowledgment"], featured: true },
  { name: "Founding Partner", amount: "$25,000+", perks: ["Named recognition", "Board advisory seat", "Employee volunteer opportunities"] },
];

export const FAQ = [
  { q: "Is the curriculum really free?", a: "Yes, completely. There is no login, no paywall, and no catch. Teachers, parents, and homeschoolers can download every lesson plan, slide deck, worksheet, and facilitator guide at any time. Donations and grants keep it that way." },
  { q: "Who can request a workshop?", a: "Schools, districts, libraries, YMCAs, Boys and Girls Clubs, and after-school programs. We offer 60-minute Express sessions, 3-hour Half-Day programs, and 6-hour Full-Day Immersives." },
  { q: "Do I need a technical background to teach this?", a: "Not at all. Every module includes a facilitator guide written for non-specialists, and our Teacher Professional Development program certifies educators to deliver the curriculum confidently." },
  { q: "Which grades does the curriculum cover?", a: "All of K-12 across three tracks: AI Explorers (K-5), AI Investigators (6-8), and AI Architects (9-12). Modules are standalone and can be taught in any order." },
  { q: "Is content available in Spanish?", a: "Parent Information Nights are available in English and Spanish today. Full Spanish-language curriculum is on our Year-3 roadmap." },
];
