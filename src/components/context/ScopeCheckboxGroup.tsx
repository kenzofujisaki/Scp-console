"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SCP_SCOPES, SCOPE_META, type SCPScope } from "@/lib/scp/types";

interface Props {
  value: SCPScope[];
  onChange: (scopes: SCPScope[]) => void;
}

export function ScopeCheckboxGroup({ value, onChange }: Props) {
  const selectedSet = new Set(value);

  const toggle = (scope: SCPScope) => {
    const next = new Set(selectedSet);
    if (next.has(scope)) {
      next.delete(scope);
    } else {
      next.add(scope);
    }
    onChange(Array.from(next) as SCPScope[]);
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Scopes</p>
      {SCP_SCOPES.map((scope) => {
        const meta = SCOPE_META[scope];
        return (
          <div key={scope} className="flex items-start gap-2">
            <Checkbox
              id={`scope-${scope}`}
              checked={selectedSet.has(scope)}
              onCheckedChange={() => toggle(scope)}
              className="mt-0.5"
            />
            <div>
              <Label htmlFor={`scope-${scope}`} className="cursor-pointer font-medium">
                {meta.label}
              </Label>
              <p className="text-xs text-slate-400">{meta.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
