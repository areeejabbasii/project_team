// Simulated task data - in real app this would come from database
export const dailyTasks = [
  {
    id: 1,
    title: "Master REST API Design Principles",
    description: "Learn the fundamental principles of designing RESTful APIs including proper HTTP methods, status codes, and resource naming conventions.",
    difficulty: "Intermediate",
    estimatedTime: "25 minutes",
    category: "Backend Development"
  },
  {
    id: 2,
    title: "Understand Database Indexing",
    description: "Explore how database indexes work, when to use them, and their impact on query performance and storage.",
    difficulty: "Intermediate",
    estimatedTime: "30 minutes",
    category: "Database"
  },
  {
    id: 3,
    title: "Learn Docker Containerization",
    description: "Get hands-on with Docker containers, understand the difference between containers and VMs, and learn basic Docker commands.",
    difficulty: "Beginner",
    estimatedTime: "35 minutes",
    category: "DevOps"
  },
  {
    id: 4,
    title: "Explore Machine Learning Basics",
    description: "Introduction to supervised vs unsupervised learning, common algorithms, and when to use each approach.",
    difficulty: "Beginner",
    estimatedTime: "20 minutes",
    category: "AI/ML"
  },
  {
    id: 5,
    title: "Security Best Practices",
    description: "Learn about common security vulnerabilities (OWASP Top 10), authentication vs authorization, and secure coding practices.",
    difficulty: "Intermediate",
    estimatedTime: "30 minutes",
    category: "Cybersecurity"
  },
  {
    id: 6,
    title: "System Design Fundamentals",
    description: "Understand scalability, load balancing, caching strategies, and how to design systems that handle millions of users.",
    difficulty: "Advanced",
    estimatedTime: "40 minutes",
    category: "Architecture"
  },
  {
    id: 7,
    title: "Frontend Performance Optimization",
    description: "Learn techniques to optimize web application performance including lazy loading, code splitting, and caching strategies.",
    difficulty: "Intermediate",
    estimatedTime: "25 minutes",
    category: "Frontend"
  }
];

// Simulated user progress data
export const getUserProgress = (userId) => {
  return {
    currentStreak: 1,
    totalTasksCompleted: 0,
    lastCompletedDate: null,
    completedTasks: []
  };
};

export const updateUserProgress = (userId, taskId) => {
  // In real app, this would update DynamoDB
  console.log(`Task ${taskId} completed by user ${userId}`);
  return {
    success: true,
    newStreak: 2
  };
};