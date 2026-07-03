"use client";

import { Server, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  onSelectDemo: () => void;
  onSelectConnect: () => void;
}

export function WelcomeStep({ onSelectDemo, onSelectConnect }: Props) {
  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
            S
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">SCP Console</h1>
        </div>
        <p className="mx-auto max-w-md text-slate-500">
          The human control plane for the Shopper Context Protocol. See exactly what your SCP
          endpoint exposes to AI, control it, and prove every request.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card
          className="cursor-pointer border-2 transition-colors hover:border-blue-400"
          onClick={onSelectDemo}
        >
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Try the Demo</CardTitle>
            <CardDescription>
              Zero setup. Explore with <strong>Acme Outdoor Co.</strong> — a bundled reference
              merchant with 5 fake shoppers, instant start.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={onSelectDemo}>
              Launch Demo
            </Button>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer border-2 transition-colors hover:border-green-400"
          onClick={onSelectConnect}
        >
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <Server className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle className="text-lg">Connect My SCP Server</CardTitle>
            <CardDescription>
              Point to your own SCP endpoint. The Console will discover it, verify it responds,
              and let you govern it from the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={onSelectConnect}>
              Connect Endpoint
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-slate-400">
        Self-hosted · No account required · No data leaves your environment
      </p>
    </div>
  );
}
