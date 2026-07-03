export interface Order {
  orderId: string;
  product: string;
  date: string;
  price: number;
  status: "delivered" | "processing" | "shipped";
}

export interface LoyaltyData {
  tier: "bronze" | "silver" | "gold";
  points: number;
  memberSince: string;
}

export interface Preferences {
  shoeSize?: string;
  preferredActivities: string[];
  newsletter: boolean;
}

export interface PaymentMethod {
  type: "card";
  last4: string;
  brand: string;
}

export interface Shopper {
  id: string;
  displayName: string;
  orderHistory: Order[];
  loyalty: LoyaltyData;
  preferences: Preferences;
  paymentMethods: PaymentMethod[];
}

export const FAKE_SHOPPERS: Shopper[] = [
  {
    id: "shopper_001",
    displayName: "Alex Rivera",
    orderHistory: [
      {
        orderId: "ORD-2024-001",
        product: "Trail Running Shoes — Cascade Pro",
        date: "2024-11-15",
        price: 149.99,
        status: "delivered",
      },
      {
        orderId: "ORD-2024-002",
        product: "Hydration Pack 2L",
        date: "2024-12-01",
        price: 59.99,
        status: "delivered",
      },
    ],
    loyalty: { tier: "gold", points: 12500, memberSince: "2022-03-10" },
    preferences: {
      shoeSize: "10",
      preferredActivities: ["trail_running", "hiking"],
      newsletter: true,
    },
    paymentMethods: [{ type: "card", last4: "4242", brand: "Visa" }],
  },
  {
    id: "shopper_002",
    displayName: "Sam Chen",
    orderHistory: [
      {
        orderId: "ORD-2024-003",
        product: "Camping Tent — Summit 2P",
        date: "2024-09-20",
        price: 299.99,
        status: "delivered",
      },
      {
        orderId: "ORD-2024-004",
        product: "Sleeping Bag -10°C",
        date: "2024-09-20",
        price: 189.99,
        status: "delivered",
      },
    ],
    loyalty: { tier: "silver", points: 4200, memberSince: "2023-01-15" },
    preferences: {
      shoeSize: "9",
      preferredActivities: ["camping", "backpacking"],
      newsletter: false,
    },
    paymentMethods: [{ type: "card", last4: "1111", brand: "Mastercard" }],
  },
  {
    id: "shopper_003",
    displayName: "Jordan Park",
    orderHistory: [
      {
        orderId: "ORD-2024-005",
        product: "Rock Climbing Harness — Vertex",
        date: "2024-10-05",
        price: 89.99,
        status: "delivered",
      },
    ],
    loyalty: { tier: "bronze", points: 890, memberSince: "2024-06-01" },
    preferences: {
      shoeSize: "11",
      preferredActivities: ["rock_climbing"],
      newsletter: true,
    },
    paymentMethods: [{ type: "card", last4: "9999", brand: "Amex" }],
  },
  {
    id: "shopper_004",
    displayName: "Morgan Lewis",
    orderHistory: [
      {
        orderId: "ORD-2024-006",
        product: "Kayak Paddle Set — River Pro",
        date: "2024-07-12",
        price: 249.99,
        status: "delivered",
      },
      {
        orderId: "ORD-2024-007",
        product: "Life Jacket XL — Coast Guard",
        date: "2024-07-12",
        price: 79.99,
        status: "delivered",
      },
      {
        orderId: "ORD-2024-008",
        product: "Dry Bag 30L",
        date: "2024-08-18",
        price: 45.99,
        status: "delivered",
      },
    ],
    loyalty: { tier: "gold", points: 18900, memberSince: "2021-05-22" },
    preferences: {
      shoeSize: "8",
      preferredActivities: ["kayaking", "water_sports"],
      newsletter: true,
    },
    paymentMethods: [{ type: "card", last4: "5555", brand: "Visa" }],
  },
  {
    id: "shopper_005",
    displayName: "Taylor Kim",
    orderHistory: [],
    loyalty: { tier: "bronze", points: 100, memberSince: "2025-01-10" },
    preferences: {
      shoeSize: "7",
      preferredActivities: [],
      newsletter: false,
    },
    paymentMethods: [],
  },
];

export const SHOPPER_MAP = new Map(FAKE_SHOPPERS.map((s) => [s.id, s]));
