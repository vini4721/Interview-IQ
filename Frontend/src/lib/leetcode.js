// LeetCode API utility to fetch questions by ID/slug

const LEETCODE_GRAPHQL_API = "https://leetcode.com/graphql";

/**
 * Fetch a LeetCode question by problem slug or ID
 * @param {string} questionIdOrSlug - LeetCode question ID or slug (e.g., "1" or "two-sum")
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function fetchLeetCodeQuestion(questionIdOrSlug) {
  try {
    // Try with the slug first
    const query = `
      query getQuestion($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          title
          difficulty
          description
          content
          categoryTitle
          exampleTestcases
          sampleTestCase
          codeSnippets {
            lang
            langSlug
            code
          }
        }
      }
    `;

    const response = await fetch(LEETCODE_GRAPHQL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      body: JSON.stringify({
        query,
        variables: { titleSlug: questionIdOrSlug },
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.errors) {
      return {
        success: false,
        error: data.errors[0]?.message || "Failed to fetch question",
      };
    }

    if (!data.data?.question) {
      return {
        success: false,
        error: "Question not found",
      };
    }

    const question = data.data.question;

    return {
      success: true,
      data: {
        id: question.questionId,
        title: question.title,
        difficulty: question.difficulty.toLowerCase(),
        category: question.categoryTitle,
        description: question.content || question.description,
        examples: parseExamples(question.exampleTestcases || ""),
        constraints: [],
        starterCode: generateStarterCode(question.codeSnippets || []),
        expectedOutput: {},
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch question: ${error.message}`,
    };
  }
}

/**
 * Parse example test cases from LeetCode format
 */
function parseExamples(testcases) {
  if (!testcases) return [];

  const lines = testcases.split("\n").filter((line) => line.trim());
  const examples = [];
  let currentExample = {};

  lines.forEach((line) => {
    if (line.startsWith("Input:")) {
      if (Object.keys(currentExample).length > 0) {
        examples.push(currentExample);
      }
      currentExample = { input: line.replace("Input:", "").trim() };
    } else if (line.startsWith("Output:")) {
      currentExample.output = line.replace("Output:", "").trim();
    } else if (line.startsWith("Explanation:")) {
      currentExample.explanation = line.replace("Explanation:", "").trim();
    }
  });

  if (Object.keys(currentExample).length > 0) {
    examples.push(currentExample);
  }

  return examples;
}

/**
 * Generate starter code from LeetCode code snippets
 */
function generateStarterCode(codeSnippets) {
  const starterCode = {
    javascript: "",
    python: "",
    java: "",
  };

  codeSnippets.forEach((snippet) => {
    if (snippet.langSlug === "javascript") {
      starterCode.javascript = snippet.code;
    } else if (snippet.langSlug === "python3") {
      starterCode.python = snippet.code;
    } else if (snippet.langSlug === "java") {
      starterCode.java = snippet.code;
    }
  });

  return starterCode;
}
