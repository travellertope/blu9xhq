"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";

export interface SetupChecklistData {
  hasClient: boolean;
  hasService: boolean;
  hasBankDetails: boolean;
  hasStripe: boolean;
  hasPaystack: boolean;
  hasSequence: boolean;
  hasPortalInvite: boolean;
}

const CHECKLIST_ITEMS: { key: keyof SetupChecklistData; label: string }[] = [
  { key: "hasClient", label: "Create your first client" },
  { key: "hasService", label: "Set up a service" },
  { key: "hasBankDetails", label: "Add bank transfer details" },
  { key: "hasStripe", label: "Connect Stripe for card payments" },
  { key: "hasPaystack", label: "Connect Paystack for local payments" },
  { key: "hasSequence", label: "Create an email sequence" },
  { key: "hasPortalInvite", label: "Configure app URL for portal invites" },
];

interface SetupChecklistProps {
  checklist: SetupChecklistData;
}

export function SetupChecklist({ checklist }: SetupChecklistProps) {
  const completedCount = CHECKLIST_ITEMS.filter((item) => checklist[item.key]).length;
  const total = CHECKLIST_ITEMS.length;

  if (completedCount === total) return null;

  const progressPercent = Math.round((completedCount / total) * 100);

  return (
    <Card className="border-indigo-200 bg-indigo-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-indigo-900">
          Getting started — {completedCount}/{total} complete
        </CardTitle>
        <div className="h-2 w-full bg-indigo-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {CHECKLIST_ITEMS.map((item) => {
            const done = checklist[item.key];
            return (
              <li key={item.key} className="flex items-center gap-2.5">
                {done ? (
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-300 shrink-0" />
                )}
                <span
                  className={
                    done
                      ? "text-sm text-slate-400 line-through"
                      : "text-sm text-slate-700"
                  }
                >
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
