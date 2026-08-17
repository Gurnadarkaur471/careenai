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

(async () => {
  await connectDB();

  const aptitudeDocs = await Question.insertMany(APTITUDE_QUESTIONS);
  const technicalDocs = await Question.insertMany(TECHNICAL_QUESTIONS);

  await Assessment.create({
    title: "General Aptitude Assessment",
    category: "aptitude",
    difficulty: "medium",
    questions: aptitudeDocs.map((q) => q._id),
    duration: 20,
  });

  await Assessment.create({
    title: "Core Technical Assessment",
    category: "technical",
    difficulty: "medium",
    questions: technicalDocs.map((q) => q._id),
    duration: 25,
  });

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

  console.log("[seed] Sample questions, assessments, and jobs created.");
  await mongoose.disconnect();
})();
