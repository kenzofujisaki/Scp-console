"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export const PRESET_SHOPPERS = [
  { id: "shopper_001", name: "Alex Rivera — Gold · Trail Runner" },
  { id: "shopper_002", name: "Sam Chen — Silver · Camper" },
  { id: "shopper_003", name: "Jordan Park — Bronze · Climber" },
  { id: "shopper_004", name: "Morgan Lewis — Gold · Kayaker" },
  { id: "shopper_005", name: "Taylor Kim — Bronze · New member" },
];

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export function ShopperSelector({ value, onChange }: Props) {
  const [mode, setMode] = useState<"preset" | "custom">("preset");

  const isPreset = PRESET_SHOPPERS.some((s) => s.id === value);

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Shopper
      </Label>
      <Select
        value={isPreset ? value : "custom"}
        onValueChange={(v) => {
          if (v === "custom") {
            setMode("custom");
          } else {
            setMode("preset");
            onChange(v);
          }
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a shopper…" />
        </SelectTrigger>
        <SelectContent>
          {PRESET_SHOPPERS.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom shopper ID…</SelectItem>
        </SelectContent>
      </Select>

      {(mode === "custom" || !isPreset) && (
        <Input
          placeholder="shopper_006"
          value={isPreset ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
        />
      )}

      <p className="text-xs text-muted-foreground/80">
        ID: <code className="font-mono text-muted-foreground">{value || "—"}</code>
      </p>
    </div>
  );
}
