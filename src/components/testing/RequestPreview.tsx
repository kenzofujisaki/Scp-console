"use client";

import { SCOPE_TO_METHOD, type SCPScope } from "@/lib/scp/types";

interface Props {
  shopperId: string;
  scopes: string[];
  endpointUrl: string;
}

export function RequestPreview({ shopperId, scopes, endpointUrl }: Props) {
  if (!shopperId || scopes.length === 0) return null;

  const tokenUrl = `${endpointUrl}/token`;
  const rpcUrl = `${endpointUrl}/rpc`;

  const rpcCalls = scopes.flatMap((scope, i) => {
    const method = SCOPE_TO_METHOD[scope as SCPScope] ?? `scp.get_${scope}`;
    const body = JSON.stringify({
      jsonrpc: "2.0",
      id: i + 1,
      method,
      params: { shopper_id: shopperId },
    });
    return [
      `# ${scope}`,
      `curl -s "${rpcUrl}" \\`,
      `  -H "Authorization: Bearer $TOKEN" \\`,
      `  -H "Content-Type: application/json" \\`,
      `  -d '${body}'`,
      ``,
    ];
  });

  const curlLines = [
    `# 1. Obtain an access token (demo auto-approves)`,
    `TOKEN=$(curl -s -X POST "${tokenUrl}" \\`,
    `  -H "Content-Type: application/x-www-form-urlencoded" \\`,
    `  -d "grant_type=authorization_code&client_id=scp-console&code=demo" \\`,
    `  | jq -r .access_token)`,
    ``,
    `# 2. Fetch shopper context — one JSON-RPC call per scope`,
    ...rpcCalls,
  ]
    .join("\n")
    .trimEnd();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[hsl(224_40%_8%)] shadow-card">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </span>
        <span className="ml-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          Request Preview
        </span>
      </div>
      <pre className="overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-100">
        <code>{curlLines}</code>
      </pre>
    </div>
  );
}
