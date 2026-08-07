import { getCategories, getProducts } from "../src/modules/catalog/catalog-api";
import { CustomerPortal } from "../src/modules/customer/portal/customer-portal";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  return <CustomerPortal categories={categories} products={products}/>;
}
