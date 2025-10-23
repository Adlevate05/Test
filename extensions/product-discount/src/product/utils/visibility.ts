export function passesVisibility(
  productId: string,
  mode: "all" | "specific" | "except" | "collections" | "bundle_specific" | "bundle_except",
  specificIds: string[],
  exceptIds: string[],
  collectionIds: string[],
  /**
   * Given a product id, return the collection ids the product belongs to.
   * In our callsite we pass a getter that reads from the ProductVariant.product.inCollections.
   */
  getProductCollectionIds: (productId: string) => string[]
) {
  if (mode === "specific") return specificIds.includes(productId);
  if (mode === "except") return !exceptIds.includes(productId);
  if (mode === "collections") {
    const inCols = getProductCollectionIds(productId);
    return inCols.some((id) => collectionIds.includes(id));
  }
  return true; // "all"
}
