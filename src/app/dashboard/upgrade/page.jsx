"use client";

import { useState } from "react";
import {
  Sparkles,
  GraduationCap,
  BadgeCheck,
  BarChart3,
  CreditCard,
  Users,
  ShieldCheck,
  Check,
  ArrowRight,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const pillars = [
  {
    icon: GraduationCap,
    title: "Course Marketplace",
    desc: "Sell courses, bundles, and learning paths—built into your LMS (no duct tape).",
  },
  {
    icon: CreditCard,
    title: "Payments & Access",
    desc: "Gate content by purchase, subscription, cohort, or role—clean access control.",
  },
  {
    icon: BadgeCheck,
    title: "Certificates & Progress",
    desc: "Completion certificates, progress tracking, and structured milestones.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Track engagement, completion rate, drop-off points, and cohort performance.",
  },
  {
    icon: Users,
    title: "Teams & Roles",
    desc: "Instructor tools, assistants, department roles—made for real organizations.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Compliance",
    desc: "Audit logs, activity history, and safer account controls for enterprises.",
  },
];

const comingFirst = [
  "Course publishing (draft → review → publish)",
  "Paid access (one-time purchase + enroll rules)",
  "Certificates (templates + auto issue on completion)",
  "Instructor dashboard (student list + progress + messaging)",
  "Basic analytics (views, completion, average time)",
];

const later = [
  "Subscriptions / membership plans",
  "Affiliate codes & coupons",
  "Cohort-based courses (schedule + drip content)",
  "Advanced analytics (funnels + retention)",
  "Integrations (Google, Zoom, SSO, etc.)",
];

export default function UpgradePage() {
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);

    // TODO: integrate to your backend waitlist endpoint
    // await apiFetch("/waitlist", { method: "POST", body: JSON.stringify({ email, org }) })
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* HERO */}
      <Card className="relative overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Coming Soon
              </Badge>
              <Badge className="bg-black text-white hover:bg-black/90">
                LMS COMMERCE
              </Badge>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              LMS Marketplace & Pro Tools
            </h1>

            <p className="text-sm text-muted-foreground sm:text-base">
              We’re building features to let you{" "}
              <span className="font-medium text-foreground">sell courses</span>,
              manage instructors, issue certificates, and track learning
              outcomes—inside your LMS. No pricing yet. We’re focusing on
              shipping the product first (wild concept, I know).
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline">Course Publishing</Badge>
              <Badge variant="outline">Paid Access</Badge>
              <Badge variant="outline">Certificates</Badge>
              <Badge variant="outline">Analytics</Badge>
              <Badge variant="outline">Instructor Tools</Badge>
            </div>
          </div>

          {/* WAITLIST CARD */}
          <div className="w-full max-w-none lg:w-[420px] rounded-xl border bg-background p-4">
            <div className="mb-2 text-sm font-medium">
              Get notified when it launches
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Put your email here. We’ll notify you when features are ready. No
              spam. We’re busy building.
            </p>

            {submitted ? (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                ✅ You’re on the list. Now we go ship it.
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-2">
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  type="email"
                />
                <Input
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="Organization (optional)"
                />
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button type="submit" className="gap-1 sm:w-full">
                    Join Waitlist <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:w-full"
                    disabled
                  >
                    Request Demo (soon)
                  </Button>
                </div>
              </form>
            )}

            <Separator className="my-4" />

            <div className="grid gap-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span className="font-medium text-foreground">
                  In development
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pricing</span>
                <span className="font-medium text-foreground">
                  Not announced
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* subtle bg blob */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-muted/50 blur-3xl" />
      </Card>

      {/* FEATURES GRID */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pillars.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title} className="p-5">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-muted/30">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-semibold">{p.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </Card>
          );
        })}
      </div>

      {/* ROADMAP */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-lg font-semibold">What’s coming first</div>
              <p className="text-sm text-muted-foreground">
                Core features that make “sell courses in LMS” actually possible.
              </p>
            </div>
            <Badge variant="secondary">Phase 1</Badge>
          </div>

          <Separator className="my-4" />

          <ul className="space-y-2 text-sm">
            {comingFirst.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-lg font-semibold">Later improvements</div>
              <p className="text-sm text-muted-foreground">
                Nice-to-have features after the core workflow is stable.
              </p>
            </div>
            <Badge variant="outline">Phase 2+</Badge>
          </div>

          <Separator className="my-4" />

          <ul className="space-y-2 text-sm">
            {later.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* FAQ MINI */}
      <Card className="p-6">
        <div className="text-lg font-semibold">FAQ</div>
        <p className="text-sm text-muted-foreground">
          The usual questions. The honest answers.
        </p>

        <Separator className="my-4" />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <div className="font-medium">
              Will this replace the current LMS features?
            </div>
            <div className="text-sm text-muted-foreground">
              No. This adds commerce + advanced tools on top of your existing
              LMS.
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-medium">When will pricing be available?</div>
            <div className="text-sm text-muted-foreground">
              Not announced yet. We’ll decide after we validate the feature set
              and usage.
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-medium">
              Can I sell courses like other platforms?
            </div>
            <div className="text-sm text-muted-foreground">
              That’s the goal: publish courses, gate access, track progress, and
              scale.
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-medium">How do I get early access?</div>
            <div className="text-sm text-muted-foreground">
              Join the waitlist above. We’ll invite early users when it’s
              stable.
            </div>
          </div>
        </div>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        Tip: If you want this shipped faster, bribe your future self with coffee
        and fewer side quests.
      </div>
    </div>
  );
}
