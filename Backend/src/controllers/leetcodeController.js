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
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function isStructuralHeadingLine(text = "") {
  const normalized = String(text)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return (
    /^examples?\s*:?$/i.test(normalized) ||
    /^examples?\s+\d+\s*:?$/i.test(normalized) ||
    /^constraints\s*:?$/i.test(normalized)
  );
}

function parseDescription(content = "") {
  const contentWithoutPreAndUl = content
    .replace(/<pre>[\s\S]*?<\/pre>/gi, "")
    .replace(/<ul>[\s\S]*?<\/ul>/gi, "");

  const paragraphMatches = [
    ...contentWithoutPreAndUl.matchAll(/<p>([\s\S]*?)<\/p>/gi),
  ];

  const paragraphs = paragraphMatches
    .map((match) => stripHtml(match[1]))
    .map((text) => text.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((text) => !isStructuralHeadingLine(text));

  if (paragraphs.length > 0) {
    return {
      text: paragraphs[0],
      notes: paragraphs.slice(1),
    };
  }

  const fallback = stripHtml(contentWithoutPreAndUl)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const cleanedFallback = fallback.filter(
    (line) => !isStructuralHeadingLine(line),
  );

  return {
    text: cleanedFallback[0] || "",
    notes: cleanedFallback.slice(1),
  };
}

function parseExamples(content = "", exampleTestcases = "") {
  const examples = [];
  const blocks = content.match(/<pre>[\s\S]*?<\/pre>/gi) || [];

  blocks.forEach((block) => {
    const text = stripHtml(block);
    const inputMatch = text.match(/Input:\s*([\s\S]*?)\s*Output:/i);
    const outputMatch = text.match(
      /Output:\s*([\s\S]*?)(?:\s*Explanation:|$)/i,
    );
    const explanationMatch = text.match(/Explanation:\s*([\s\S]*?)$/i);

    const input = inputMatch?.[1]?.trim() || "";
    const output = outputMatch?.[1]?.trim() || "";
    const explanation = explanationMatch?.[1]?.trim() || "";

    if (input || output || explanation) {
      examples.push({
        input,
        output,
        explanation,
      });
    }
  });

  if (examples.length === 0 && exampleTestcases) {
    const lines = String(exampleTestcases)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 3);

    lines.forEach((line) => {
      examples.push({
        input: line,
        output: "",
        explanation: "",
      });
    });
  }

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

    const extractQuestionSlug = (value) => {
      const match = String(value).match(/leetcode\.com\/problems\/([^/?#]+)/i);

      if (match?.[1]) {
        return decodeURIComponent(match[1]).trim();
      }

      return String(value).trim();
    };

    const normalizedInput = extractQuestionSlug(trimmed);
    const isNumeric = /^\d+$/.test(normalizedInput);

    const titleSlug = isNumeric
      ? await resolveSlugFromFrontendId(normalizedInput)
      : normalizedInput;

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
    const examples = parseExamples(content, question.exampleTestcases);
    const constraints = parseConstraints(content);
    const description = parseDescription(content);

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
        description,
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
