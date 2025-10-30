const XLSX = require("xlsx");

/**
 * Safely parses submission data
 */
function parseSubmissionData(data) {
  if (!data) return { no_data: "No data submitted" };

  if (typeof data === "object" && data !== null) return data;

  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return { invalid_json: data };
    }
  }

  return { unexpected_type: typeof data, value: String(data) };
}

/**
 * Flattens nested objects for Excel export
 */
function flattenObject(obj, prefix = "") {
  let flattened = {};

  if (Array.isArray(obj)) {
    flattened[prefix || "array_data"] = obj
      .map((item) =>
        typeof item === "object" && item !== null
          ? JSON.stringify(item)
          : String(item)
      )
      .join("; ");
  } else if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (Array.isArray(value)) {
        flattened[newKey] = value
          .map((item) =>
            typeof item === "object" && item !== null
              ? JSON.stringify(item)
              : String(item)
          )
          .join("; ");
      } else if (typeof value === "object" && value !== null) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
  } else {
    flattened[prefix || "value"] = obj;
  }

  return flattened;
}

/**
 * Converts object keys to uppercase
 */
function upperCaseKeys(obj) {
  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key.toUpperCase()] = obj[key];
    }
  }
  return newObj;
}

/**
 * Export submissions to Excel
 */
function exportSubmissionsToExcel(rows, formTitle) {
  // Flatten + clean submissions
  const submissions = rows.map((row) => {
    const parsedData = parseSubmissionData(row.data);
    const flat = flattenObject(parsedData);

    // Remove Submission_ID and ensure date included
    const result = {
      ...flat,
      Submitted_At: new Date(row.submitted_at).toLocaleString(),
    };

    return upperCaseKeys(result); // Convert all keys to uppercase here
  });

  // Ensure consistent headers
  const allKeys = [...new Set(submissions.flatMap((obj) => Object.keys(obj)))];
  const normalized = submissions.map((s) =>
    Object.fromEntries(allKeys.map((k) => [k, s[k] ?? ""]))
  );

  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(normalized);

  // Auto-size columns
  ws["!cols"] = allKeys.map((key) => ({
    wch: Math.min(Math.max(key.length + 2, 15), 40),
  }));

  XLSX.utils.book_append_sheet(wb, ws, "Submissions");

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

module.exports = {
  parseSubmissionData,
  flattenObject,
  exportSubmissionsToExcel,
};
