// Deterministic keyword dictionary used for resume/job-description skill extraction
// when no AI key is configured (and as a validation cross-check when it is).
const SKILLS_DICTIONARY = [
  "JavaScript","TypeScript","Python","Java","C++","C","C#","Go","Rust","Ruby","PHP","Kotlin","Swift",
  "React","React.js","Redux","Vue","Angular","Next.js","Node.js","Express","Express.js","Nest.js",
  "MongoDB","Mongoose","MySQL","PostgreSQL","SQL","SQLite","Redis","Firebase","GraphQL",
  "HTML","CSS","Tailwind","Tailwind CSS","Bootstrap","SASS",
  "Git","GitHub","Docker","Kubernetes","AWS","Azure","GCP","CI/CD","Jenkins","Linux",
  "DSA","Data Structures","Algorithms","OOP","DBMS","Operating Systems","Computer Networks",
  "Machine Learning","Deep Learning","NLP","Pandas","NumPy","Scikit-learn","TensorFlow","PyTorch",
  "Data Analysis","Data Visualization","Power BI","Tableau","Excel","Statistics",
  "REST API","Microservices","Agile","Scrum","Testing","Jest","Unit Testing",
  "Communication","Leadership","Teamwork","Problem Solving","Time Management","Critical Thinking",
];

function extractSkillsFromText(text = "") {
  const lower = text.toLowerCase();
  const found = new Set();
  for (const skill of SKILLS_DICTIONARY) {
    const pattern = skill.toLowerCase();
    if (lower.includes(pattern)) found.add(skill);
  }
  return Array.from(found);
}

module.exports = { SKILLS_DICTIONARY, extractSkillsFromText };
