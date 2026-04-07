const LEETCODE_GRAPHQL_API = "https://leetcode.com/graphql";

async function fetchGraphQL(query, variables) {
  const response = await fetch(LEETCODE_GRAPHQL_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`LeetCode request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (data.errors?.length) {
    throw new Error(data.errors[0].message || "LeetCode request failed");
  }

  return data.data;
}

function stripHtml(html = "") {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

function parseExamples(content) {
  const examples = [];
  const blocks = content.match(/<pre>[\s\S]*?<\/pre>/gi) || [];

  blocks.forEach((block) => {
    const text = stripHtml(block);
    const inputMatch = text.match(/Input:\s*([\s\S]*?)\s*Output:/i);
    const outputMatch = text.match(
      /Output:\s*([\s\S]*?)(?:\s*Explanation:|$)/i,
    );
    const explanationMatch = text.match(/Explanation:\s*([\s\S]*?)$/i);

    if (inputMatch || outputMatch) {
      examples.push({
        input: inputMatch?.[1]?.trim() || "",
        output: outputMatch?.[1]?.trim() || "",
        explanation: explanationMatch?.[1]?.trim() || "",
      });
    }
  });

  return examples;
}

function parseConstraints(content) {
  const constraintsMatch = content.match(
    /<strong>Constraints:\s*<\/strong><\/p>\s*<ul>([\s\S]*?)<\/ul>/i,
  );
  const listContent = constraintsMatch?.[1] || "";
  const matches = listContent.match(/<li>([\s\S]*?)<\/li>/gi) || [];

  return matches.map((item) => stripHtml(item.replace(/<li>|<\/li>/gi, "")));
}

async function resolveSlugFromFrontendId(frontendId) {
  const listQuery = `
    query problemsetQuestionListV2($categorySlug: String, $limit: Int, $skip: Int) {
      problemsetQuestionListV2(categorySlug: $categorySlug, limit: $limit, skip: $skip) {
        questions {
          titleSlug
          questionFrontendId
          title
          difficulty
        }
      }
    }
  `;

  const pageSize = 100;
  for (let skip = 0; skip < 5000; skip += pageSize) {
    const data = await fetchGraphQL(listQuery, {
      categorySlug: "algorithms",
      limit: pageSize,
      skip,
    });

    const questions = data?.problemsetQuestionListV2?.questions || [];
    const match = questions.find(
      (question) => String(question.questionFrontendId) === String(frontendId),
    );

    if (match) {
      return match.titleSlug;
    }

    if (questions.length < pageSize) {
      break;
    }
  }

  return null;
}

async function fetchQuestionDetails(titleSlug) {
  const query = `
    query getQuestion($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        difficulty
        content
        exampleTestcases
        codeSnippets {
          lang
          langSlug
          code
        }
        topicTags {
          name
          slug
        }
      }
    }
  `;

  const data = await fetchGraphQL(query, { titleSlug });
  return data?.question || null;
}

export async function fetchLeetCodeQuestion(req, res) {
  try {
    const { questionIdOrSlug } = req.body;

    if (!questionIdOrSlug) {
      return res
        .status(400)
        .json({ success: false, error: "Question ID or slug is required" });
    }

    const trimmed = String(questionIdOrSlug).trim();
    const isNumeric = /^\d+$/.test(trimmed);

    const titleSlug = isNumeric
      ? await resolveSlugFromFrontendId(trimmed)
      : trimmed;

    if (!titleSlug) {
      return res
        .status(404)
        .json({ success: false, error: "Question not found" });
    }

    const question = await fetchQuestionDetails(titleSlug);

    if (!question) {
      return res
        .status(404)
        .json({ success: false, error: "Question not found" });
    }

    const content = question.content || "";
    const examples = parseExamples(content);
    const constraints = parseConstraints(content);

    const starterCode = {
      javascript: "",
      python: "",
      java: "",
    };

    (question.codeSnippets || []).forEach((snippet) => {
      if (snippet.langSlug === "javascript")
        starterCode.javascript = snippet.code;
      if (snippet.langSlug === "python3") starterCode.python = snippet.code;
      if (snippet.langSlug === "java") starterCode.java = snippet.code;
    });

    return res.status(200).json({
      success: true,
      data: {
        id: question.questionId,
        title: question.title,
        slug: question.titleSlug,
        difficulty: question.difficulty?.toLowerCase?.() || "easy",
        category: (question.topicTags || []).map((tag) => tag.name).join(" • "),
        description: content,
        examples,
        constraints,
        starterCode,
        expectedOutput: {},
      },
    });
  } catch (error) {
    console.error("Error fetching LeetCode question:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch question",
    });
  }
}
