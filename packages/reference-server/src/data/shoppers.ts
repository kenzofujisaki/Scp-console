import type { SCPOrder, SCPLoyalty, SCPOffer, SCPPreferences } from "@scp/protocol";

export interface Shopper {
  id: string;
  displayName: string;
  orders: SCPOrder[];
  loyalty: SCPLoyalty;
  offers: SCPOffer[];
  preferences: SCPPreferences;
}

export const FAKE_SHOPPERS: Shopper[] = [
  {
    id: "shopper_001",
    displayName: "Alex Rivera",
    orders: [
      {
        order_id: "ORD-2024-001",
        product: "Trail Running Shoes — Cascade Pro",
        date: "2024-11-15",
        price: 149.99,
        status: "delivered",
        tracking: "1Z999AA10123456784",
      },
      {
        order_id: "ORD-2024-002",
        product: "Hydration Pack 2L",
        date: "2024-12-01",
        price: 59.99,
        status: "delivered",
      },
    ],
    loyalty: {
      program_name: "Acme Peaks Rewards",
      member_id: "PKS-001-ALEX",
      tier: "gold",
      points: { current: 12500, lifetime: 38200, expiring: 500, expiring_date: "2025-03-31" },
      member_since: "2022-03-10",
      benefits: ["Free standard shipping", "Early access to sales", "10% on all gear"],
    },
    offers: [
      {
        type: "percentage",
        title: "Gold Member Spring Sale",
        code: "GOLD20",
        discount_value: 20,
        discount_type: "percentage",
        valid_until: "2025-04-30",
        min_purchase: 100,
        applies_to: "All outdoor apparel",
      },
    ],
    preferences: {
      sizes: { shoe: "10", shirt: "M" },
      favorite_brands: ["Patagonia", "Arc'teryx", "Salomon"],
      preferred_activities: ["trail_running", "hiking"],
      communication: { email: true, sms: false, push: true },
    },
  },
  {
    id: "shopper_002",
    displayName: "Sam Chen",
    orders: [
      {
        order_id: "ORD-2024-003",
        product: "Camping Tent — Summit 2P",
        date: "2024-09-20",
        price: 299.99,
        status: "delivered",
      },
      {
        order_id: "ORD-2024-004",
        product: "Sleeping Bag -10°C",
        date: "2024-09-20",
        price: 189.99,
        status: "delivered",
      },
    ],
    loyalty: {
      program_name: "Acme Peaks Rewards",
      member_id: "PKS-002-SAM",
      tier: "silver",
      points: { current: 4200, lifetime: 12000 },
      member_since: "2023-01-15",
      benefits: ["Free standard shipping", "5% on camping gear"],
    },
    offers: [
      {
        type: "fixed",
        title: "Silver Member Loyalty Bonus",
        code: "SILVER15",
        discount_value: 15,
        discount_type: "fixed_amount",
        valid_until: "2025-06-30",
        applies_to: "Camping gear",
      },
    ],
    preferences: {
      sizes: { shoe: "9", shirt: "S" },
      favorite_brands: ["MSR", "Big Agnes"],
      preferred_activities: ["camping", "backpacking"],
      communication: { email: false, push: false },
    },
  },
  {
    id: "shopper_003",
    displayName: "Jordan Park",
    orders: [
      {
        order_id: "ORD-2024-005",
        product: "Rock Climbing Harness — Vertex",
        date: "2024-10-05",
        price: 89.99,
        status: "delivered",
      },
    ],
    loyalty: {
      program_name: "Acme Peaks Rewards",
      member_id: "PKS-003-JORDAN",
      tier: "bronze",
      points: { current: 890, lifetime: 890 },
      member_since: "2024-06-01",
      benefits: ["Free standard shipping on orders over $75"],
    },
    offers: [
      {
        type: "free_shipping",
        title: "Welcome — Free Shipping",
        code: "WELCOME_FREE",
        discount_value: 0,
        discount_type: "fixed_amount",
        valid_until: "2025-12-31",
      },
    ],
    preferences: {
      sizes: { shoe: "11" },
      preferred_activities: ["rock_climbing"],
      communication: { email: true },
    },
  },
  {
    id: "shopper_004",
    displayName: "Morgan Lewis",
    orders: [
      {
        order_id: "ORD-2024-006",
        product: "Kayak Paddle Set — River Pro",
        date: "2024-07-12",
        price: 249.99,
        status: "delivered",
      },
      {
        order_id: "ORD-2024-007",
        product: "Life Jacket XL — Coast Guard",
        date: "2024-07-12",
        price: 79.99,
        status: "delivered",
      },
      {
        order_id: "ORD-2024-008",
        product: "Dry Bag 30L",
        date: "2024-08-18",
        price: 45.99,
        status: "delivered",
      },
    ],
    loyalty: {
      program_name: "Acme Peaks Rewards",
      member_id: "PKS-004-MORGAN",
      tier: "gold",
      points: { current: 18900, lifetime: 64000, expiring: 2000, expiring_date: "2025-02-28" },
      member_since: "2021-05-22",
      benefits: ["Free priority shipping", "Early access to sales", "10% on all gear", "Free returns"],
    },
    offers: [
      {
        type: "bogo",
        title: "Buy One Get One — Water Sports Accessories",
        code: "BOGO_WATER",
        discount_value: 50,
        discount_type: "percentage",
        valid_until: "2025-05-31",
        applies_to: "Water sports accessories under $60",
      },
      {
        type: "percentage",
        title: "Loyalty VIP Exclusive",
        code: "VIP25",
        discount_value: 25,
        discount_type: "percentage",
        valid_until: "2025-03-31",
        min_purchase: 200,
      },
    ],
    preferences: {
      sizes: { shoe: "8", shirt: "L" },
      favorite_brands: ["NRS", "Kokatat", "Werner"],
      preferred_activities: ["kayaking", "water_sports"],
      communication: { email: true, sms: true, push: true },
    },
  },
  {
    id: "shopper_005",
    displayName: "Taylor Kim",
    orders: [],
    loyalty: {
      program_name: "Acme Peaks Rewards",
      member_id: "PKS-005-TAYLOR",
      tier: "bronze",
      points: { current: 100, lifetime: 100 },
      member_since: "2025-01-10",
      benefits: ["Free standard shipping on orders over $75"],
    },
    offers: [
      {
        type: "percentage",
        title: "New Member Welcome Offer",
        code: "NEW10",
        discount_value: 10,
        discount_type: "percentage",
        valid_until: "2025-07-10",
        applies_to: "First purchase",
      },
    ],
    preferences: {
      preferred_activities: [],
      communication: { email: false },
    },
  },
];

export const SHOPPER_MAP = new Map(FAKE_SHOPPERS.map((s) => [s.id, s]));
