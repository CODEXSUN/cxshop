import { BrandsRepository } from "./brands.repository.js";
import type { BrandsSavePayload } from "./brands.types.js";

export const brandsSeed = {
  description: "Seed Brands records.",
  key: "core.common.products.brands.seed"
};

export async function seedBrands() {
  const repository = new BrandsRepository();
  const existing = await repository.list();
  for (let index = 0; index < seeds.length; index += 1) {
    const seed = seeds[index]!;
    const match = existing.find((record) => identity(record.name) === identity(seed.name));
    const payload = { ...seed, isActive: true, sortOrder: index + 1 };
    if (!match) await repository.create(payload);
    else if (seed.logoUrl && shouldRefreshLogo(match.logoUrl))
      await repository.update(match.id, payload);
  }
}

const seeds: BrandsSavePayload[] = [
  {
    name: "-"
  },
  {
    name: "General"
  },
  {
    logoUrl: "https://cdn.simpleicons.org/acer/83B81A",
    name: "Acer",
    showOnStorefront: true
  },
  {
    logoUrl: "https://cdn.simpleicons.org/asus/000000",
    name: "ASUS",
    showOnStorefront: true
  },
  {
    logoUrl: "https://cdn.simpleicons.org/dell/0672CE",
    name: "Dell",
    showOnStorefront: true
  },
  {
    logoUrl: "https://cdn.simpleicons.org/hp/0096D6",
    name: "HP",
    showOnStorefront: true
  },
  {
    logoUrl: "https://cdn.simpleicons.org/lenovo/E2231A",
    name: "Lenovo",
    showOnStorefront: true
  },
  {
    logoUrl: "https://cdn.worldvectorlogo.com/logos/logitech-2.svg",
    name: "Logitech",
    showOnStorefront: true
  },
  {
    logoUrl: "https://cdn.simpleicons.org/samsung/1428A0",
    name: "Samsung",
    showOnStorefront: true
  }
];

function identity(value: unknown) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  return normalized;
}

function shouldRefreshLogo(value: string) {
  return !value || value === "https://cdn.simpleicons.org/logitech/00B8FC";
}
