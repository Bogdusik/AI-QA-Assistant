"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  Sparkles,
  FileText,
  Bug,
  Braces,
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface RecentDoc {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: Date;
}

interface Props {
  total: number;
  byType: {
    TEST_CASE_SET: number;
    CHECKLIST: number;
    BUG_REPORT: number;
    API_TEST_SET: number;
  };
  byReview: { PENDING: number; ACCEPTED: number; REJECTED: number };
  recentDocs: RecentDoc[];
}

// ─── Animation variants ────────────────────────────────────────────────────────

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

// ─── Artifact card config ──────────────────────────────────────────────────────

const ARTIFACT_CARDS = [
  {
    key: "TEST_CASE_SET" as const,
    label: "Test Cases",
    href: "/generate/test-cases",
    icon: CheckSquare,
    accent: "from-blue-600 to-indigo-700",
    glow: "group-hover:shadow-blue-500/20",
    span: "col-span-2",
    description:
      "Generate structured positive, negative, and edge-case test scenarios from requirements."
  },
  {
    key: "CHECKLIST" as const,
    label: "Checklists",
    href: "/generate/checklist",
    icon: FileText,
    accent: "from-violet-600 to-purple-700",
    glow: "group-hover:shadow-violet-500/20",
    span: "col-span-1",
    description: "Build review-ready QA checklists mapped to feature requirements."
  },
  {
    key: "BUG_REPORT" as const,
    label: "Bug Reports",
    href: "/generate/bug-report",
    icon: Bug,
    accent: "from-rose-600 to-red-700",
    glow: "group-hover:shadow-rose-500/20",
    span: "col-span-1",
    description: "Turn vague bug descriptions into structured, reproducible reports."
  },
  {
    key: "API_TEST_SET" as const,
    label: "API Test Ideas",
    href: "/generate/api-ideas",
    icon: Braces,
    accent: "from-emerald-600 to-teal-700",
    glow: "group-hover:shadow-emerald-500/20",
    span: "col-span-2",
    description: "Explore validation, auth, and edge-case scenarios for your API endpoints."
  }
] as const;

// ─── Component ─────────────────────────────────────────────────────────────────

export function DashboardClient({ total, byType, byReview, recentDocs }: Props) {
  return (
    <div className="space-y-8">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-7 shadow-xl"
      >
        {/* Background grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"
        />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
              Dashboard
            </p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">Welcome back</h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-400">
              Build QA artifacts faster with reviewable, explainable AI suggestions. Everything
              starts as <strong className="text-slate-300">Pending</strong> until you approve.
            </p>
          </div>

          {/* Review stats */}
          <div className="flex flex-wrap gap-2">
            <Badge tone="pending">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {byReview.PENDING} Pending
              </span>
            </Badge>
            <Badge tone="accepted">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                {byReview.ACCEPTED} Accepted
              </span>
            </Badge>
            <Badge tone="rejected">
              <span className="inline-flex items-center gap-1.5">
                <XCircle className="h-3 w-3" />
                {byReview.REJECTED} Rejected
              </span>
            </Badge>
          </div>
        </div>

        {/* Total docs counter */}
        <div className="relative mt-6 flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
            <TrendingUp className="h-4 w-4 text-brand-400" />
            <span className="text-sm font-medium text-white">{total}</span>
            <span className="text-xs text-slate-400">total documents</span>
          </div>
        </div>
      </motion.section>

      {/* ── Bento grid ───────────────────────────────────────────────────── */}
      <section>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-4 text-xs font-medium uppercase tracking-widest text-slate-500"
        >
          Generate
        </motion.p>

        <motion.div variants={container} initial="hidden" animate="show">
          <BentoGrid>
            {ARTIFACT_CARDS.map((card) => {
              const Icon = card.icon;
              const count = byType[card.key];

              return (
                <motion.div key={card.key} variants={fadeUp} className={card.span}>
                  <BentoGridItem
                    className={`h-full bg-gradient-to-br from-slate-900/95 to-slate-800/95 shadow-lg transition-shadow duration-300 ${card.glow}`}
                  >
                    {/* Coloured accent strip */}
                    <div
                      className={`absolute left-0 top-0 h-px w-full bg-gradient-to-r ${card.accent} opacity-60`}
                    />

                    <div className="flex h-full flex-col p-6">
                      {/* Icon + count row */}
                      <div className="flex items-start justify-between">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent} shadow-lg`}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold tabular-nums text-white">{count}</span>
                      </div>

                      {/* Label + description */}
                      <div className="mt-4 flex-1">
                        <h3 className="text-base font-semibold text-white">{card.label}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-400">
                          {card.description}
                        </p>
                      </div>

                      {/* CTA */}
                      <Link href={card.href} className="mt-5 block">
                        <motion.div
                          whileHover={{ x: 4 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Generate
                          <ArrowRight className="h-3.5 w-3.5" />
                        </motion.div>
                      </Link>
                    </div>
                  </BentoGridItem>
                </motion.div>
              );
            })}
          </BentoGrid>
        </motion.div>
      </section>

      {/* ── Recent documents ─────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="space-y-3"
      >
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-semibold text-white">
            Recent documents
          </h2>
          <Link href="/documents">
            <Button
              variant="outline"
              className="border-white/20 bg-transparent text-xs text-slate-300 hover:bg-white/10 hover:text-white"
            >
              View all
            </Button>
          </Link>
        </div>

        {recentDocs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-800/60 p-6 text-center backdrop-blur-sm">
            <p className="text-sm font-medium text-slate-300">No documents yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Generate your first QA artifact from the section above.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentDocs.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.38 + i * 0.06, duration: 0.3 }}
              >
                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-800/60 px-4 py-3 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:shadow-md hover:shadow-indigo-500/10">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{doc.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{doc.type.replace(/_/g, " ")}</p>
                  </div>
                  <Link href={`/documents/${doc.id}`}>
                    <Button
                      variant="outline"
                      className="shrink-0 border-white/20 bg-transparent text-xs text-slate-300 hover:bg-white/10 hover:text-white"
                    >
                      Open
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
