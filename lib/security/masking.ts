export function maskTransaction(description: string): string {
  // Mask number sequences that may represent account numbers, phone numbers, or identifiers.
  return description.replace(/\d{4,}/g, "****");
}
