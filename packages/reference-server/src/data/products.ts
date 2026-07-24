import type { SCPIntent, SCPProduct } from "@scp/protocol";

/**
 * Acme Outdoor Co.'s product catalog — the brand's own merchandising data.
 * When shopper intent flows back via SCP, the storefront merchandises against
 * this catalog so a returning shopper lands on a warm, pre-filtered page.
 * `category` is matched against intent.category; `useCases` against the
 * occasion/summary; `colors`/`material`/`sizes`/`gender` against attributes.
 */
export type Product = SCPProduct;

export const PRODUCTS: Product[] = [
  {
    id: "acme-cimarron-boot",
    name: "Cimarron Western Boot",
    category: "boots",
    useCases: ["rodeo", "western", "ranch", "casual"],
    gender: "men",
    colors: ["brown", "tan", "black"],
    material: "leather",
    sizes: ["8", "9", "10", "11", "12", "13"],
    price: 219.99,
    blurb: "Hand-tooled leather with a stacked heel — built for the arena.",
  },
  {
    id: "acme-belle-rodeo-boot",
    name: "Belle Rodeo Boot",
    category: "boots",
    useCases: ["rodeo", "western", "casual"],
    gender: "women",
    colors: ["brown", "red", "tan"],
    material: "leather",
    sizes: ["6", "7", "8", "9", "10", "11"],
    price: 199.99,
    blurb: "Embroidered shaft, all-day comfort insole. A rodeo staple.",
  },
  {
    id: "acme-foreman-work-boot",
    name: "Foreman Steel-Toe Work Boot",
    category: "boots",
    useCases: ["work", "construction", "ranch"],
    gender: "men",
    colors: ["brown", "black"],
    material: "leather",
    sizes: ["8", "9", "10", "11", "12", "13"],
    price: 169.99,
    blurb: "ASTM-rated steel toe, oil-resistant outsole. Job-site ready.",
  },
  {
    id: "acme-summit-hiking-boot",
    name: "Summit Hiking Boot",
    category: "boots",
    useCases: ["hiking", "trail", "backpacking"],
    gender: "unisex",
    colors: ["gray", "green", "brown"],
    material: "nubuck",
    sizes: ["6", "7", "8", "9", "10", "11", "12", "13"],
    price: 179.99,
    blurb: "Waterproof membrane and a grippy lugged sole for the backcountry.",
  },
  {
    id: "acme-ranch-hand-jacket",
    name: "Ranch Hand Denim Jacket",
    category: "jacket",
    useCases: ["western", "casual", "ranch", "rodeo"],
    gender: "men",
    colors: ["blue", "black"],
    material: "denim",
    sizes: ["S", "M", "L", "XL", "XXL"],
    price: 89.99,
    blurb: "Blanket-lined denim with a classic western yoke.",
  },
  {
    id: "acme-western-felt-hat",
    name: "Drover Felt Hat",
    category: "hat",
    useCases: ["rodeo", "western", "ranch"],
    gender: "unisex",
    colors: ["tan", "brown", "black"],
    material: "wool felt",
    sizes: ["S", "M", "L", "XL"],
    price: 129.99,
    blurb: "Wool-felt cattleman's crease — shade for the stands.",
  },
  {
    id: "acme-rodeo-buckle",
    name: "Champion Belt Buckle",
    category: "accessory",
    useCases: ["rodeo", "western"],
    gender: "unisex",
    colors: ["silver"],
    material: "metal",
    sizes: ["one-size"],
    price: 74.99,
    blurb: "Antiqued silver-tone buckle with a hand-set centerpiece.",
  },
  {
    id: "acme-trailhead-rain-jacket",
    name: "Trailhead Rain Jacket",
    category: "jacket",
    useCases: ["hiking", "trail", "travel"],
    gender: "unisex",
    colors: ["blue", "black"],
    material: "nylon",
    sizes: ["S", "M", "L", "XL"],
    price: 109.99,
    blurb: "Packable 2.5-layer shell that stuffs into its own pocket.",
  },
  {
    id: "acme-cascade-trail-shoe",
    name: "Cascade Trail Running Shoe",
    category: "shoes",
    useCases: ["trail", "running", "hiking"],
    gender: "unisex",
    colors: ["gray", "orange"],
    material: "mesh",
    sizes: ["6", "7", "8", "9", "10", "11", "12"],
    price: 149.99,
    blurb: "Rock plate underfoot, sticky rubber lugs. Fast on technical trail.",
  },
  {
    id: "acme-alpine-parka",
    name: "Alpine Down Parka",
    category: "jacket",
    useCases: ["winter", "skiing", "travel"],
    gender: "unisex",
    colors: ["black", "red"],
    material: "down",
    sizes: ["S", "M", "L", "XL"],
    price: 249.99,
    blurb: "800-fill down with a storm hood for deep-cold days.",
  },
  {
    id: "acme-daypack-20l",
    name: "Daypack 20L",
    category: "backpack",
    useCases: ["hiking", "travel", "commuting"],
    gender: "unisex",
    colors: ["green", "gray", "black"],
    material: "ripstop",
    sizes: ["one-size"],
    price: 79.99,
    blurb: "Ventilated back panel, hydration sleeve, all-day 20-liter haul.",
  },
  {
    id: "acme-work-gloves",
    name: "Ranch Work Gloves",
    category: "gloves",
    useCases: ["work", "ranch"],
    gender: "unisex",
    colors: ["brown"],
    material: "leather",
    sizes: ["M", "L", "XL"],
    price: 24.99,
    blurb: "Goatskin palm, reinforced fingertips. Grip that lasts a season.",
  },
  {
    id: "acme-merino-baselayer",
    name: "Merino Base Layer",
    category: "apparel",
    useCases: ["hiking", "winter", "skiing"],
    gender: "unisex",
    colors: ["gray", "black"],
    material: "merino wool",
    sizes: ["S", "M", "L", "XL"],
    price: 59.99,
    blurb: "Odor-resistant 200gsm merino for cold, active days.",
  },
  {
    id: "acme-hiking-socks",
    name: "Waterproof Hiking Sock (3-pack)",
    category: "apparel",
    useCases: ["hiking", "trail", "backpacking"],
    gender: "unisex",
    colors: ["gray"],
    material: "merino blend",
    sizes: ["M", "L", "XL"],
    price: 27.99,
    blurb: "Cushioned, blister-fighting crew socks. Three pairs.",
  },
  {
    id: "acme-camp-chair",
    name: "Basecamp Folding Chair",
    category: "furniture",
    useCases: ["camping", "tailgating"],
    gender: "unisex",
    colors: ["blue", "green"],
    material: "aluminum",
    sizes: ["one-size"],
    price: 49.99,
    blurb: "Packs to the size of a water bottle, holds 300 lb.",
  },
];

export const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.id, p]));

/**
 * Deterministically rank the catalog against a stored intent. Category and
 * use-case (occasion) matches dominate so a "boots for the rodeo" intent
 * surfaces western boots first; concrete attributes (color, material, gender,
 * size) break ties. Only products that clear a relevance floor are returned,
 * so an off-target catalog item never shows up as a "match".
 */
export function matchProducts(intent: SCPIntent, limit = 6): Product[] {
  const category = intent.category.toLowerCase();
  const haystack = [
    intent.occasion ?? "",
    intent.summary,
    ...intent.attributes.map((a) => `${a.name} ${a.value}`),
  ]
    .join(" ")
    .toLowerCase();

  const attrValues = intent.attributes.map((a) => a.value.toLowerCase());

  const scored = PRODUCTS.map((product) => {
    let score = 0;

    // Category is the strongest signal (substring match either direction).
    const pc = product.category.toLowerCase();
    if (pc === category || pc.includes(category) || category.includes(pc)) {
      score += 5;
    }

    // Use-case / occasion match (e.g. intent occasion "Houston Rodeo" → "rodeo").
    if (product.useCases.some((u) => haystack.includes(u.toLowerCase()))) {
      score += 4;
    }

    // Concrete attribute matches.
    if (product.colors.some((c) => attrValues.includes(c.toLowerCase()))) score += 2;
    if (product.material && attrValues.includes(product.material.toLowerCase())) score += 2;
    if (product.sizes.some((s) => attrValues.includes(s.toLowerCase()))) score += 2;
    if (
      attrValues.some((v) => v.startsWith(product.gender)) ||
      (product.gender === "men" && attrValues.some((v) => v.includes("men's"))) ||
      (product.gender === "women" && attrValues.some((v) => v.includes("women's")))
    ) {
      score += 1;
    }

    return { product, score };
  });

  return scored
    .filter((s) => s.score >= 4) // must match category or occasion to count
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.product);
}
