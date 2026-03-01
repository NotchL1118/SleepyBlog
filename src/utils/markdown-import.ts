"use client";

/**
 * Result of markdown import operation
 */
export interface MarkdownImportResult {
  success: boolean;
  content?: string;
  title?: string;
  error?: string;
}

/**
 * Error messages for markdown import
 */
const ERROR_MESSAGES = {
  INVALID_EXTENSION: "Invalid file format, please select .md or .markdown file",
  READ_ERROR: "Cannot read file, please check if the file is corrupted",
  NO_CONTENT: "File content is empty",
  UNKNOWN_ERROR: "Import failed, please try again",
};

/**
 * Validate if file is a valid markdown file
 * @param file - File to validate
 * @returns true if valid markdown file
 */
function isValidMarkdownFile(file: File): boolean {
  if (!file) {
    return false;
  }

  // Check file extension (case-insensitive)
  const fileName = file.name.toLowerCase();
  const isMarkdown = fileName.endsWith(".md") || fileName.endsWith(".markdown");

  return isMarkdown;
}

/**
 * Read and parse a markdown file
 * @param file - The markdown file to import
 * @returns Promise with import result
 */
async function importMarkdownFile(file: File): Promise<MarkdownImportResult> {
  return new Promise((resolve) => {
    // Validate file
    if (!isValidMarkdownFile(file)) {
      resolve({
        success: false,
        error: ERROR_MESSAGES.INVALID_EXTENSION,
      });
      return;
    }

    // Create FileReader
    const reader = new FileReader();

    // Handle successful read
    reader.onload = (e) => {
      const content = e.target?.result as string;

      if (!content || content.trim().length === 0) {
        resolve({
          success: false,
          error: ERROR_MESSAGES.NO_CONTENT,
        });
        return;
      }

      // Extract title from filename (remove .md or .markdown extension)
      const fileName = file.name;
      const title = fileName.replace(/\.(md|markdown)$/i, "");

      resolve({
        success: true,
        content: content,
        title: title,
      });
    };

    // Handle read error
    reader.onerror = () => {
      resolve({
        success: false,
        error: ERROR_MESSAGES.READ_ERROR,
      });
    };

    // Handle abort
    reader.onabort = () => {
      resolve({
        success: false,
        error: ERROR_MESSAGES.UNKNOWN_ERROR,
      });
    };

    // Read file as text (UTF-8)
    try {
      reader.readAsText(file, "UTF-8");
    } catch (error) {
      resolve({
        success: false,
        error: ERROR_MESSAGES.READ_ERROR,
      });
    }
  });
}

/**
 * Trigger markdown file selection dialog and import
 * This is a complete utility function that handles the entire import flow:
 * 1. Creates and triggers a file input dialog
 * 2. Validates the selected file
 * 3. Reads and returns the file content
 *
 * @returns Promise with import result
 *
 * @example
 * const result = await triggerMarkdownImport();
 * if (result.success && result.content) {
 *   // Handle successful import
 *   console.log(result.content);
 * } else {
 *   // Handle error
 *   console.error(result.error);
 * }
 */
export default async function triggerMarkdownImport(): Promise<MarkdownImportResult> {
  return new Promise((resolve) => {
    // Create hidden file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".md,.markdown";
    input.style.display = "none";

    // Handle file selection
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      if (!file) {
        resolve({
          success: false,
          error: "No file selected",
        });
        return;
      }

      // Validate and import file
      const result = await importMarkdownFile(file);
      resolve(result);
    };

    // Handle dialog cancel
    input.oncancel = () => {
      resolve({
        success: false,
        error: "Import cancelled",
      });
    };

    // Trigger file selection dialog
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
}
