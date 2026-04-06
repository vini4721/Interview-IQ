// Use backend API to execute code (avoids CORS issues)

import axios from "./axios.js";

const LANGUAGE_VERSIONS = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
};

/**
 * @param {string} language - programming language
 * @param {string} code - source code to executed
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    if (!LANGUAGE_VERSIONS[language]) {
      return {
        success: false,
        error: `Unsupported language: ${language}`,
      };
    }

    const response = await axios.post("/execute", {
      language,
      code,
    });

    return response.data;
  } catch (error) {
    console.error("Error executing code:", error);
    return {
      success: false,
      error:
        error.response?.data?.error ||
        `Failed to execute code: ${error.message}`,
    };
  }
}
