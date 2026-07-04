"use client";

import type {
  SCPShopper,
  SCPOrder,
  SCPLoyalty,
  SCPOffer,
  SCPPreferences,
} from "@/lib/scp/types";

/**
 * Human-readable rendering of an SCPShopper payload — the "clean view"
 * alternative to raw JSON. Only sections present in the data are shown.
 * Styled for the dark response panel it lives inside.
 */

/** Narrowing guard: is this payload shopper-shaped enough to render as a table? */
export function isShopperShaped(data: unknown): data is SCPShopper {
  if (!data || typeof data !== "object") return false;
  return ["orders", "loyalty", "offers", "preferences"].some((k) => k in data);
}

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25",
  shipped: "bg-sky-500/15 text-sky-300 ring-sky-400/25",
  processing: "bg-amber-500/15 text-amber-300 ring-amber-400/25",
};

const TIER_STYLES: Record<string, string> = {
  gold: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
  silver: "bg-slate-300/15 text-slate-200 ring-slate-300/30",
  bronze: "bg-orange-500/15 text-orange-300 ring-orange-400/30",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</h4>
      {children}
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-slate-200 ring-1 ring-inset ring-white/10">
      {children}
    </span>
  );
}

function OrdersTable({ orders }: { orders: SCPOrder[] }) {
  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-inset ring-white/10">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-3 py-2 font-medium">Product</th>
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 text-right font-medium">Price</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Tracking</th>
          </tr>
        </thead>
        <tbody className="text-slate-200">
          {orders.map((o) => (
            <tr key={o.order_id} className="border-b border-white/5 last:border-0">
              <td className="px-3 py-2 font-medium text-slate-100">{o.product}</td>
              <td className="px-3 py-2 tabular-nums text-slate-400">{o.date}</td>
              <td className="px-3 py-2 text-right tabular-nums">{money(o.price)}</td>
              <td className="px-3 py-2">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
                    STATUS_STYLES[o.status] ?? "bg-white/10 text-slate-300 ring-white/10"
                  }`}
                >
                  {o.status}
                </span>
              </td>
              <td className="px-3 py-2 font-mono text-xs text-slate-400">{o.tracking ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoyaltyCard({ loyalty }: { loyalty: SCPLoyalty }) {
  const { points } = loyalty;
  return (
    <div className="space-y-3 rounded-lg p-3.5 ring-1 ring-inset ring-white/10">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-slate-100">{loyalty.program_name}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ring-1 ring-inset ${
            TIER_STYLES[loyalty.tier] ?? "bg-white/10 text-slate-300 ring-white/10"
          }`}
        >
          {loyalty.tier}
        </span>
        <span className="ml-auto font-mono text-xs text-slate-500">{loyalty.member_id}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-xs text-slate-400">Points</dt>
          <dd className="tabular-nums text-slate-100">{points.current.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Lifetime</dt>
          <dd className="tabular-nums text-slate-100">{points.lifetime.toLocaleString()}</dd>
        </div>
        {points.expiring != null && (
          <div>
            <dt className="text-xs text-slate-400">Expiring</dt>
            <dd className="tabular-nums text-amber-300">
              {points.expiring.toLocaleString()}
              {points.expiring_date ? (
                <span className="ml-1 text-xs text-slate-500">· {points.expiring_date}</span>
              ) : null}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-slate-400">Member since</dt>
          <dd className="tabular-nums text-slate-100">{loyalty.member_since}</dd>
        </div>
      </dl>
      {loyalty.benefits && loyalty.benefits.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-white/10 pt-2.5">
          {loyalty.benefits.map((b) => (
            <Chip key={b}>{b}</Chip>
          ))}
        </div>
      )}
    </div>
  );
}

function OffersTable({ offers }: { offers: SCPOffer[] }) {
  const formatDiscount = (o: SCPOffer) =>
    o.discount_type === "percentage" ? `${o.discount_value}% off` : `${money(o.discount_value)} off`;
  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-inset ring-white/10">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-[11px] uppercase tracking-wide text-slate-400">
            <th className="px-3 py-2 font-medium">Offer</th>
            <th className="px-3 py-2 font-medium">Code</th>
            <th className="px-3 py-2 font-medium">Discount</th>
            <th className="px-3 py-2 font-medium">Valid until</th>
            <th className="px-3 py-2 font-medium">Conditions</th>
          </tr>
        </thead>
        <tbody className="text-slate-200">
          {offers.map((o) => (
            <tr key={o.code} className="border-b border-white/5 last:border-0">
              <td className="px-3 py-2 font-medium text-slate-100">{o.title}</td>
              <td className="px-3 py-2">
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-emerald-300">
                  {o.code}
                </code>
              </td>
              <td className="px-3 py-2 tabular-nums">{formatDiscount(o)}</td>
              <td className="px-3 py-2 tabular-nums text-slate-400">{o.valid_until}</td>
              <td className="px-3 py-2 text-xs text-slate-400">
                {[
                  o.min_purchase ? `min ${money(o.min_purchase)}` : null,
                  o.applies_to ?? null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PreferencesCard({ prefs }: { prefs: SCPPreferences }) {
  const sizes = prefs.sizes
    ? Object.entries(prefs.sizes).filter(([, v]) => v != null)
    : [];
  const comms = prefs.communication
    ? Object.entries(prefs.communication).filter(([, v]) => v)
    : [];
  return (
    <div className="grid gap-3 rounded-lg p-3.5 ring-1 ring-inset ring-white/10 sm:grid-cols-2">
      {sizes.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-400">Sizes</p>
          <div className="flex flex-wrap gap-1.5">
            {sizes.map(([k, v]) => (
              <Chip key={k}>
                <span className="capitalize text-slate-400">{k}</span> {v}
              </Chip>
            ))}
          </div>
        </div>
      )}
      {prefs.favorite_brands && prefs.favorite_brands.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-400">Favorite brands</p>
          <div className="flex flex-wrap gap-1.5">
            {prefs.favorite_brands.map((b) => (
              <Chip key={b}>{b}</Chip>
            ))}
          </div>
        </div>
      )}
      {prefs.preferred_activities && prefs.preferred_activities.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-400">Activities</p>
          <div className="flex flex-wrap gap-1.5">
            {prefs.preferred_activities.map((a) => (
              <Chip key={a}>{a}</Chip>
            ))}
          </div>
        </div>
      )}
      {comms.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-slate-400">Opted in to</p>
          <div className="flex flex-wrap gap-1.5">
            {comms.map(([k]) => (
              <Chip key={k}>
                <span className="capitalize">{k}</span>
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ShopperDataView({ data }: { data: SCPShopper }) {
  const hasAny =
    (data.orders?.length ?? 0) > 0 ||
    !!data.loyalty ||
    (data.offers?.length ?? 0) > 0 ||
    !!data.preferences;

  if (!hasAny) {
    return (
      <p className="p-4 text-sm text-slate-400">No structured fields were returned for this shopper.</p>
    );
  }

  return (
    <div className="space-y-5 p-4">
      {data.orders && data.orders.length > 0 && (
        <Section title={`Orders · ${data.orders.length}`}>
          <OrdersTable orders={data.orders} />
        </Section>
      )}
      {data.loyalty && (
        <Section title="Loyalty">
          <LoyaltyCard loyalty={data.loyalty} />
        </Section>
      )}
      {data.offers && data.offers.length > 0 && (
        <Section title={`Offers · ${data.offers.length}`}>
          <OffersTable offers={data.offers} />
        </Section>
      )}
      {data.preferences && (
        <Section title="Preferences">
          <PreferencesCard prefs={data.preferences} />
        </Section>
      )}
    </div>
  );
}
