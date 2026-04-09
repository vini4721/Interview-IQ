import { spawn } from "child_process";
import { unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const LANGUAGE_VERSIONS = {
  javascript: { language: "javascript", version: "latest" },
  python: { language: "python", version: "latest" },
  java: { language: "java", version: "latest" },
};

function getFileExtension(language) {
  const extensions = {
    javascript: "js",
    python: "py",
    java: "java",
  };

  return extensions[language] || "txt";
}

async function executeJavaScript(code) {
  return new Promise((resolve) => {
    // Execute JavaScript code using Node.js
    const tempFile = join(tmpdir(), `code-${Date.now()}.js`);
    let resolved = false;

    try {
      writeFileSync(tempFile, code);

      const child = spawn("node", [tempFile], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      let error = "";

      // Set a timeout to kill the process if it takes too long
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          child.kill("SIGTERM");
          try {
            unlinkSync(tempFile);
          } catch (e) {
            // ignore
          }
          resolve({
            success: false,
            error: "Code execution timeout (exceeded 5 seconds)",
          });
        }
      }, 5000);

      child.stdout.on("data", (data) => {
        output += data.toString();
      });

      child.stderr.on("data", (data) => {
        error += data.toString();
      });

      child.on("close", (exitCode) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);

          try {
            unlinkSync(tempFile);
          } catch (e) {
            // ignore
          }

          // Check exit code, not stderr presence
          if (exitCode !== 0 && error) {
            resolve({
              success: false,
              output: output,
              error: error,
            });
          } else {
            resolve({
              success: true,
              output: output || "No output",
            });
          }
        }
      });

      child.on("error", (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);

          try {
            unlinkSync(tempFile);
          } catch (e) {
            // ignore
          }

          resolve({
            success: false,
            error: err.message,
          });
        }
      });
    } catch (error) {
      if (!resolved) {
        resolved = true;
        try {
          unlinkSync(tempFile);
        } catch (e) {
          // ignore
        }

        resolve({
          success: false,
          error: error.message,
        });
      }
    }
  });
}

async function executePython(code) {
  return new Promise((resolve) => {
    const tempFile = join(tmpdir(), `code-${Date.now()}.py`);
    let resolved = false;

    try {
      writeFileSync(tempFile, code);

      const child = spawn("python3", [tempFile], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let output = "";
      let error = "";

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          child.kill("SIGTERM");
          try {
            unlinkSync(tempFile);
          } catch (e) {
            // ignore
          }
          resolve({
            success: false,
            error: "Code execution timeout (exceeded 5 seconds)",
          });
        }
      }, 5000);

      child.stdout.on("data", (data) => {
        output += data.toString();
      });

      child.stderr.on("data", (data) => {
        error += data.toString();
      });

      child.on("close", (exitCode) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);

          try {
            unlinkSync(tempFile);
          } catch (e) {
            // ignore
          }

          if (exitCode !== 0 && error) {
            resolve({
              success: false,
              output: output,
              error: error,
            });
          } else {
            resolve({
              success: true,
              output: output || "No output",
            });
          }
        }
      });

      child.on("error", (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);

          try {
            unlinkSync(tempFile);
          } catch (e) {
            // ignore
          }

          resolve({
            success: false,
            error: err.message,
          });
        }
      });
    } catch (error) {
      if (!resolved) {
        resolved = true;
        try {
          unlinkSync(tempFile);
        } catch (e) {
          // ignore
        }

        resolve({
          success: false,
          error: error.message,
        });
      }
    }
  });
}

async function executeJava(code) {
  return new Promise((resolve) => {
    const timestamp = Date.now();
    const tempDir = tmpdir();
    // Extract class name from code, default to "Solution"
    const classNameMatch = code.match(/public\s+class\s+(\w+)/);
    const className = classNameMatch ? classNameMatch[1] : "Solution";
    const tempFile = join(tempDir, `${className}.java`);
    let resolved = false;

    try {
      writeFileSync(tempFile, code);

      const child = spawn("javac", [tempFile], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: tempDir,
      });

      let compileError = "";

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          child.kill("SIGTERM");
          try {
            unlinkSync(tempFile);
            unlinkSync(join(tempDir, `${className}.class`));
          } catch (e) {
            // ignore
          }
          resolve({
            success: false,
            error: "Code compilation timeout",
          });
        }
      }, 5000);

      child.stderr.on("data", (data) => {
        compileError += data.toString();
      });

      child.on("close", (code) => {
        if (!resolved) {
          if (compileError) {
            resolved = true;
            clearTimeout(timeout);
            try {
              unlinkSync(tempFile);
              unlinkSync(join(tempDir, `${className}.class`));
            } catch (e) {
              // ignore
            }
            resolve({
              success: false,
              error: compileError,
            });
            return;
          }

          // Now run the compiled class
          const runChild = spawn("java", ["-cp", tempDir, className], {
            stdio: ["pipe", "pipe", "pipe"],
            cwd: tempDir,
          });

          let output = "";
          let runError = "";

          const runTimeout = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              runChild.kill("SIGTERM");
              try {
                unlinkSync(tempFile);
                unlinkSync(join(tempDir, `${className}.class`));
              } catch (e) {
                // ignore
              }
              resolve({
                success: false,
                error: "Code execution timeout",
              });
            }
          }, 5000);

          runChild.stdout.on("data", (data) => {
            output += data.toString();
          });

          runChild.stderr.on("data", (data) => {
            runError += data.toString();
          });

          runChild.on("close", (exitCode) => {
            if (!resolved) {
              resolved = true;
              clearTimeout(runTimeout);

              try {
                unlinkSync(tempFile);
                unlinkSync(join(tempDir, `${className}.class`));
              } catch (e) {
                // ignore
              }

              // Check exit code, not stderr presence
              if (exitCode !== 0 && runError) {
                resolve({
                  success: false,
                  output: output,
                  error: runError,
                });
              } else {
                resolve({
                  success: true,
                  output: output || "No output",
                });
              }
            }
          });

          runChild.on("error", (err) => {
            if (!resolved) {
              resolved = true;
              clearTimeout(runTimeout);

              try {
                unlinkSync(tempFile);
                unlinkSync(join(tempDir, `${className}.class`));
              } catch (e) {
                // ignore
              }

              resolve({
                success: false,
                error: err.message,
              });
            }
          });
        }
      });

      child.on("error", (err) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);

          try {
            unlinkSync(tempFile);
          } catch (e) {
            // ignore
          }

          resolve({
            success: false,
            error: err.message,
          });
        }
      });
    } catch (error) {
      if (!resolved) {
        resolved = true;
        try {
          unlinkSync(tempFile);
        } catch (e) {
          // ignore
        }

        resolve({
          success: false,
          error: error.message,
        });
      }
    }
  });
}

export async function executeCode(req, res) {
  try {
    const { language, code } = req.body;

    console.log("Execute request:", { language, codeLength: code?.length });

    if (!language || !code) {
      console.log("Missing language or code");
      return res.status(400).json({
        success: false,
        error: "Language and code are required",
      });
    }

    const languageConfig = LANGUAGE_VERSIONS[language];

    if (!languageConfig) {
      console.log("Unsupported language:", language);
      return res.status(400).json({
        success: false,
        error: `Unsupported language: ${language}. Supported: javascript, python, java`,
      });
    }

    let result;

    // Execute based on language
    if (language === "javascript") {
      console.log("Executing JavaScript code...");
      result = await executeJavaScript(code);
    } else if (language === "python") {
      console.log("Executing Python code...");
      result = await executePython(code);
    } else if (language === "java") {
      console.log("Executing Java code...");
      result = await executeJava(code);
    }

    console.log("Execution result:", result.success ? "Success" : "Failed");
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in executeCode controller:", error);
    return res.status(500).json({
      success: false,
      error: `Failed to execute code: ${error.message}`,
    });
  }
}
