// Simple test script to validate file type filtering
const { IndexSystem } = require("./packages/backend/src/core/IndexSystem");

async function testFileTypeFiltering() {
  console.log("=== Testing File Type Filtering ===");

  // Create a mock index system
  const indexSystem = new IndexSystem();

  // Add some mock repositories with different file types
  indexSystem.index = {
    repositories: [
      {
        name: "react-app",
        languages: ["javascript", "typescript"],
        frameworks: ["react"],
        tags: ["react", "javascript", "typescript", "frontend", "jsx", "tsx"],
        lastAnalyzed: new Date()
      },
      {
        name: "python-api",
        languages: ["python"],
        frameworks: ["django"],
        tags: ["python", "django", "backend", "api", "py"],
        lastAnalyzed: new Date()
      },
      {
        name: "node-server",
        languages: ["javascript"],
        frameworks: ["express"],
        tags: ["nodejs", "javascript", "express", "backend", "js"],
        lastAnalyzed: new Date()
      }
    ],
    relationships: [],
    tags: [],
    lastUpdated: new Date()
  };

  // Test different file type queries
  const testCases = [
    { fileTypes: [".js"] },
    { fileTypes: [".ts"] },
    { fileTypes: [".py"] },
    { fileTypes: [".jsx"] },
    { fileTypes: [".js", ".ts"] }
  ];

  for (const query of testCases) {
    console.log(`\n--- Testing query: ${JSON.stringify(query)} ---`);
    const results = await indexSystem.searchRepositories(query);
    console.log(`Found ${results.length} repositories:`);
    results.forEach((result) => {
      console.log(`- ${result.repository.name} (score: ${result.score})`);
      result.matches.forEach((match) => {
        console.log(`  ${match.field}: ${match.value} (+${match.score})`);
      });
    });
  }
}

testFileTypeFiltering().catch(console.error);
