"use client";

interface Props {
  shopperId: string;
  scopes: string[];
  endpointUrl: string;
}

export function RequestPreview({ shopperId, scopes, endpointUrl }: Props) {
  if (!shopperId || scopes.length === 0) return null;

  const contextUrl = `${endpointUrl}/context/${shopperId}?scopes=${scopes.join(",")}`;
  const tokenUrl = `${endpointUrl}/oauth/token`;

  const curlLines = [
    `# 1. Obtain an access token`,
    `curl -s -X POST "${tokenUrl}" \\`,
    `  -H "Content-Type: application/json" \\`,
    `  -d '{"grant_type":"client_credentials","client_id":"console","client_secret":"demo"}' \\`,
    `  | jq -r .access_token`,
    ``,
    `# 2. Fetch shopper context`,
    `curl -s "${contextUrl}" \\`,
    `  -H "Authorization: Bearer <access_token>"`,
  ].join("\n");

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900">
      <div className="border-b border-slate-700 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Request Preview
        </span>
      </div>
      <pre className="overflow-auto p-4 font-mono text-xs leading-relaxed text-green-400">
        {curlLines}
      </pre>
    </div>
  );
}
