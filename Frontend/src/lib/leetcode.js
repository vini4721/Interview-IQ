import axios from "./axios.js";

/**
 * Fetch a LeetCode question by problem slug or ID
 * @param {string} questionIdOrSlug - LeetCode question ID or slug (e.g., "1" or "two-sum")
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
export async function fetchLeetCodeQuestion(questionIdOrSlug) {
  try {
    const response = await axios.post("/leetcode/question", {
      questionIdOrSlug,
    });

    return response.data;
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.error ||
        `Failed to fetch question: ${error.message}`,
    };
  }
}
