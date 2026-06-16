/**
 * Escapes single quotes in a string for safe OData $filter interpolation.
 * OData spec: a literal single-quote inside a string value is represented by two single-quotes.
 * Apply to every user-supplied string that is interpolated into a filter expression.
 */
export function escapeOData(value) {
    return value.replace(/'/g, "''");
}
/**
 * Validates and returns a Kazakhstan chart-of-accounts code.
 * Accepted formats: "8110", "3310", "3310.01", "8112.02", "1210.001"
 * Throws if the format does not match — prevents OData filter injection.
 */
export function validateAccountCode(code) {
    if (!/^\d{4}(\.\d{1,4})?$/.test(code)) {
        throw new Error(`Invalid account code "${code}". Expected 4 digits with optional sub-account (e.g. "8110", "3310.01").`);
    }
    return code;
}
//# sourceMappingURL=utils.js.map