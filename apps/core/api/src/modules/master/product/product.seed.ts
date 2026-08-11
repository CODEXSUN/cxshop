import { randomBytes } from "node:crypto";
import { sql } from "kysely";
import { getCoreDatabase } from "../../../database/core-database.js";
export async function seedProductModule() {
  await sql`INSERT IGNORE INTO core_products (uuid, name, status) VALUES (${randomBytes(4).toString("hex")}, '-', 'active')`.execute(
    getCoreDatabase()
  );
  await sql`UPDATE core_products SET
    product_type_id=COALESCE(product_type_id,(SELECT id FROM core_product_types WHERE status='active' ORDER BY CASE WHEN TRIM(name)='-' THEN 0 ELSE 1 END,id LIMIT 1)),
    product_category_id=COALESCE(product_category_id,(SELECT id FROM core_product_categories WHERE status='active' ORDER BY CASE WHEN TRIM(name)='-' THEN 0 ELSE 1 END,id LIMIT 1)),
    hsn_code_id=COALESCE(hsn_code_id,(SELECT id FROM core_hsn_codes WHERE status='active' ORDER BY CASE WHEN TRIM(code)='-' THEN 0 ELSE 1 END,id LIMIT 1)),
    unit_id=COALESCE(unit_id,(SELECT id FROM core_units WHERE status='active' ORDER BY CASE WHEN TRIM(name)='-' THEN 0 ELSE 1 END,id LIMIT 1)),
    gst_tax_id=COALESCE(gst_tax_id,(SELECT id FROM core_taxes WHERE status='active' ORDER BY CASE WHEN TRIM(description)='-' THEN 0 ELSE 1 END,id LIMIT 1))
    WHERE name='-'`.execute(getCoreDatabase());
  for (const product of catalogProducts) {
    await sql`INSERT INTO core_products
      (uuid,name,product_type_id,product_category_id,hsn_code_id,unit_id,gst_tax_id,opening_qty,opening_price,status,created_by)
      SELECT ${randomBytes(4).toString("hex")},${product.name},type.id,category.id,hsn.id,unit.id,tax.id,
        ${product.stock},${product.price},'active','system:catalog-seed'
      FROM core_product_types type,core_product_categories category,core_hsn_codes hsn,core_units unit,core_taxes tax
      WHERE type.name='Goods' AND category.name=${product.category} AND hsn.code='0000' AND unit.name='Nos'
        AND tax.rate_percent=18 AND NOT EXISTS (SELECT 1 FROM core_products WHERE name=${product.name})
      LIMIT 1`.execute(getCoreDatabase());
  }
}

const catalogProducts = [
  { category: "Laptops", name: "Acer Aspire 5 15 Laptop", price: 54990, stock: 18 },
  { category: "Laptops", name: "ASUS Vivobook 15 OLED", price: 66990, stock: 14 },
  { category: "Laptops", name: "Lenovo IdeaPad Slim 5", price: 71990, stock: 12 },
  { category: "Desktop Computers", name: "Dell Inspiron Compact Desktop", price: 62990, stock: 8 },
  { category: "Monitors", name: "Samsung ViewFinity 27 Monitor", price: 24990, stock: 20 },
  {
    category: "Computer Accessories",
    name: "Logitech MX Master Wireless Mouse",
    price: 8995,
    stock: 35
  },
  {
    category: "Computer Accessories",
    name: "Logitech MX Keys Wireless Keyboard",
    price: 11995,
    stock: 24
  },
  { category: "Computer Accessories", name: "HP USB-C Universal Hub", price: 6490, stock: 30 }
] as const;
