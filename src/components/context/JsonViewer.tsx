"use client";

interface Props {
  data: unknown;
  placeholder?: string;
}

function highlight(json: string): string {
  return json.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      if (/^"/.test(match)) {
        return /:$/.test(match)
          ? `<span style="color:#7dd3fc">${match}</span>` // key
          : `<span style="color:#86efac">${match}</span>`; // string value
      }
      if (/true|false/.test(match)) return `<span style="color:#fdba74">${match}</span>`;
      if (/null/.test(match)) return `<span style="color:#94a3b8">${match}</span>`;
      return `<span style="color:#c084fc">${match}</span>`; // number
    },
  );
}

export function JsonViewer({ data, placeholder = "No data" }: Props) {
  if (data === null || data === undefined) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-400">
        {placeholder}
      </div>
    );
  }

  const json = JSON.stringify(data, null, 2);

  return (
    <pre
      className="h-full min-h-[300px] overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-sm leading-relaxed text-slate-100"
      // highlight() only inserts controlled span tags with inline styles — no user content
      dangerouslySetInnerHTML={{ __html: highlight(json) }}
    />
  );
}
