require("dotenv").config();
const connectDB = require("../config/db");
const mongoose = require("mongoose");
const Question = require("../models/Question");
const Assessment = require("../models/Assessment");
const Job = require("../models/Job");

const APTITUDE_QUESTIONS = [
  { question: "If a train travels 300km in 5 hours, what is its average speed?", options: ["50 km/h", "60 km/h", "55 km/h", "65 km/h"], correctAnswerIndex: 1, category: "aptitude", topic: "Quantitative", difficulty: "easy", explanation: "300 / 5 = 60 km/h" },
  { question: "Find the next number in the series: 2, 6, 12, 20, 30, ?", options: ["40", "42", "44", "36"], correctAnswerIndex: 1, category: "aptitude", topic: "Quantitative", difficulty: "medium", explanation: "Differences increase by 2: +4,+6,+8,+10,+12" },
  { question: "All cats are animals. Some animals are pets. Which conclusion is valid?", options: ["All cats are pets", "Some cats may be pets", "No cats are pets", "All pets are cats"], correctAnswerIndex: 1, category: "aptitude", topic: "Logical Reasoning", difficulty: "medium", explanation: "Only a possibility can be concluded, not certainty." },
  { question: "Choose the word most nearly opposite to 'Frugal':", options: ["Thrifty", "Wasteful", "Careful", "Modest"], correctAnswerIndex: 1, category: "aptitude", topic: "Verbal", difficulty: "easy", explanation: "Frugal means economical; the opposite is wasteful." },
  { question: "A table shows sales of 100, 150, 120 units over 3 months. What is the average monthly sale?", options: ["120", "123.3", "125", "130"], correctAnswerIndex: 1, category: "aptitude", topic: "Data Interpretation", difficulty: "easy", explanation: "(100+150+120)/3 = 123.3" },
];

const TECHNICAL_QUESTIONS = [
  { question: "What is the time complexity of binary search on a sorted array?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctAnswerIndex: 1, category: "technical", topic: "DSA", difficulty: "easy", explanation: "Binary search halves the search space each step." },
  { question: "Which data structure uses FIFO order?", options: ["Stack", "Queue", "Tree", "Graph"], correctAnswerIndex: 1, category: "technical", topic: "DSA", difficulty: "easy", explanation: "Queue is First-In-First-Out." },
  { question: "Which SQL clause is used to filter grouped results?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], correctAnswerIndex: 1, category: "technical", topic: "SQL", difficulty: "medium", explanation: "HAVING filters after aggregation; WHERE filters before." },
  { question: "What does normalization in DBMS primarily reduce?", options: ["Query speed", "Data redundancy", "Number of tables", "Index size"], correctAnswerIndex: 1, category: "technical", topic: "DBMS", difficulty: "medium", explanation: "Normalization reduces redundancy and update anomalies." },
  { question: "In OOP, which principle allows a subclass to provide a specific implementation of a method?", options: ["Encapsulation", "Polymorphism", "Abstraction", "Composition"], correctAnswerIndex: 1, category: "technical", topic: "Programming", difficulty: "medium", explanation: "Method overriding is a form of polymorphism." },
];

const BEGINNER_APTITUDE_QUESTIONS = [
  { question: "If 12 notebooks cost ₹240, what is the cost of 1 notebook?", options: ["₹10", "₹15", "₹20", "₹25"], correctAnswerIndex: 2, category: "aptitude", topic: "Arithmetic", difficulty: "easy", explanation: "240 / 12 = 20." },
  { question: "The sum of two numbers is 18 and their difference is 4. What are the numbers?", options: ["7 and 11", "6 and 12", "8 and 10", "5 and 13"], correctAnswerIndex: 0, category: "aptitude", topic: "Algebra", difficulty: "easy", explanation: "x + y = 18, x - y = 4 => x = 11, y = 7." },
  { question: "Which word is the opposite of 'expand'?", options: ["Increase", "Stretch", "Contract", "Enlarge"], correctAnswerIndex: 2, category: "aptitude", topic: "Verbal", difficulty: "easy", explanation: "Contract is the opposite of expand." },
  { question: "Find the missing number: 3, 6, 9, 12, ?", options: ["14", "15", "16", "18"], correctAnswerIndex: 1, category: "aptitude", topic: "Number Series", difficulty: "easy", explanation: "The sequence increases by 3 each time." },
  { question: "A bag has 3 red and 2 blue balls. What is the chance of picking a red ball?", options: ["1/5", "2/5", "3/5", "4/5"], correctAnswerIndex: 2, category: "aptitude", topic: "Probability", difficulty: "easy", explanation: "There are 3 red out of 5 total balls." },
];

const INTERMEDIATE_TECHNICAL_QUESTIONS = [
  { question: "Which JavaScript method returns a new array without mutating the original?", options: ["push()", "splice()", "map()", "sort()"], correctAnswerIndex: 2, category: "technical", topic: "JavaScript", difficulty: "medium", explanation: "map() creates a new array and does not mutate the source." },
  { question: "What is the purpose of an index in a database?", options: ["To duplicate data", "To speed up lookup", "To format output", "To secure the database"], correctAnswerIndex: 1, category: "technical", topic: "Database", difficulty: "medium", explanation: "Indexes speed up searches and lookups on columns." },
  { question: "Which HTTP status code means 'Not Found'?", options: ["200", "201", "404", "500"], correctAnswerIndex: 2, category: "technical", topic: "Web", difficulty: "medium", explanation: "HTTP 404 indicates the resource was not found." },
  { question: "Which OOP concept hides internal implementation details?", options: ["Inheritance", "Encapsulation", "Polymorphism", "Abstraction"], correctAnswerIndex: 1, category: "technical", topic: "Programming", difficulty: "medium", explanation: "Encapsulation hides implementation details behind public methods." },
  { question: "Which SQL statement removes all records from a table?", options: ["DELETE FROM table", "DROP TABLE", "TRUNCATE TABLE", "REMOVE FROM table"], correctAnswerIndex: 2, category: "technical", topic: "SQL", difficulty: "medium", explanation: "TRUNCATE TABLE quickly removes all rows while preserving the table structure." },
];

const ADVANCED_TECHNICAL_QUESTIONS = [
  { question: "In a balanced BST, the average time complexity for search is:", options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"], correctAnswerIndex: 1, category: "technical", topic: "DSA", difficulty: "hard", explanation: "A balanced binary search tree provides logarithmic search time on average." },
  { question: "Which of these is a good reason to use a JOIN in SQL?", options: ["To delete duplicates", "To combine rows from related tables", "To sort columns", "To encrypt data"], correctAnswerIndex: 1, category: "technical", topic: "SQL", difficulty: "hard", explanation: "JOIN combines related rows from multiple tables." },
  { question: "What happens when a promise rejects and no catch is attached?", options: ["The app crashes immediately", "Unhandled rejection error may occur", "The promise resolves", "The request is retried automatically"], correctAnswerIndex: 1, category: "technical", topic: "JavaScript", difficulty: "hard", explanation: "A rejected promise without a catch can result in an unhandled rejection." },
  { question: "Which design principle is most closely associated with reducing dependencies between modules?", options: ["Coupling", "Cohesion", "Low coupling", "Inheritance"], correctAnswerIndex: 2, category: "technical", topic: "Software Design", difficulty: "hard", explanation: "Low coupling reduces dependency between modules and makes code easier to change." },
  { question: "What is the main advantage of using asynchronous I/O in a server?", options: ["It always increases CPU speed", "It allows better scalability under concurrent requests", "It disables networking", "It removes the need for a database"], correctAnswerIndex: 1, category: "technical", topic: "Systems", difficulty: "hard", explanation: "Async I/O helps handle more concurrent requests efficiently." },
];

async function ensureQuestionSet(seedQuestions) {
  const created = [];

  for (const question of seedQuestions) {
    const existing = await Question.findOne({ question: question.question, category: question.category });
    if (existing) {
      created.push(existing);
      continue;
    }

    const doc = await Question.create(question);
    created.push(doc);
  }

  return created;
}

async function seedDefaultAssessments() {
  const aptitudeDocs = await ensureQuestionSet(APTITUDE_QUESTIONS);
  const technicalDocs = await ensureQuestionSet(TECHNICAL_QUESTIONS);
  const beginnerAptitudeDocs = await ensureQuestionSet(BEGINNER_APTITUDE_QUESTIONS);
  const intermediateTechnicalDocs = await ensureQuestionSet(INTERMEDIATE_TECHNICAL_QUESTIONS);
  const advancedTechnicalDocs = await ensureQuestionSet(ADVANCED_TECHNICAL_QUESTIONS);

  const assessmentDefinitions = [
    {
      title: "General Aptitude Assessment",
      category: "aptitude",
      difficulty: "medium",
      duration: 20,
      questions: aptitudeDocs,
    },
    {
      title: "Core Technical Assessment",
      category: "technical",
      difficulty: "medium",
      duration: 25,
      questions: technicalDocs,
    },
    {
      title: "Beginner Aptitude Challenge",
      category: "aptitude",
      difficulty: "easy",
      duration: 15,
      questions: beginnerAptitudeDocs,
    },
    {
      title: "Intermediate Technical Challenge",
      category: "technical",
      difficulty: "medium",
      duration: 25,
      questions: intermediateTechnicalDocs,
    },
    {
      title: "Advanced Technical Mastery Test",
      category: "technical",
      difficulty: "hard",
      duration: 30,
      questions: advancedTechnicalDocs,
    },
  ];

  for (const definition of assessmentDefinitions) {
    await Assessment.updateOne(
      { title: definition.title },
      {
        $set: {
          title: definition.title,
          category: definition.category,
          difficulty: definition.difficulty,
          duration: definition.duration,
          active: true,
          questions: definition.questions.map((q) => q._id),
        },
      },
      { upsert: true }
    );
  }
}

async function seedJobs() {
  const jobCount = await Job.countDocuments();
  if (jobCount > 0) return;

  await Job.insertMany([
    {
      title: "Software Developer",
      company: "Sample Tech Co.",
      description: "We are looking for a Software Developer skilled in DSA, Programming, SQL, Git, and problem solving to build scalable web applications.",
      requiredSkills: ["DSA", "Programming", "SQL", "Git"],
      preferredSkills: ["Docker", "AWS", "React"],
      education: "B.Tech / B.E. in Computer Science or related field",
      experience: "0-2 years",
      responsibilities: ["Write clean, maintainable code", "Collaborate with cross-functional teams", "Debug and resolve production issues"],
      location: "Remote",
      jobType: "Full-time",
      source: "admin",
    },
    {
      title: "Data Analyst",
      company: "Sample Analytics Inc.",
      description: "Seeking a Data Analyst with strong SQL, Statistics, Python, and Data Visualization skills to derive business insights.",
      requiredSkills: ["SQL", "Statistics", "Python", "Data Visualization"],
      preferredSkills: ["Power BI", "Tableau", "Excel"],
      education: "Bachelor's in a quantitative field",
      experience: "0-2 years",
      responsibilities: ["Analyze large datasets", "Build dashboards", "Present insights to stakeholders"],
      location: "Bengaluru, India",
      jobType: "Full-time",
      source: "admin",
    },
  ]);
}

async function seedDatabase() {
  await connectDB();
  await seedDefaultAssessments();
  await seedJobs();
  console.log("[seed] Sample questions and assessments ready.");
}

if (require.main === module) {
  seedDatabase()
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error("[seed] failed:", err.message);
      mongoose.disconnect();
      process.exit(1);
    });
}

module.exports = {
  seedDatabase,
  seedDefaultAssessments,
  ensureQuestionSet,
  APTITUDE_QUESTIONS,
  TECHNICAL_QUESTIONS,
  BEGINNER_APTITUDE_QUESTIONS,
  INTERMEDIATE_TECHNICAL_QUESTIONS,
  ADVANCED_TECHNICAL_QUESTIONS,
};
