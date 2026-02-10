"use client";

import { Badge } from "@/components/ui/badge";
import type { CaseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

const statusConfig: Record<CaseStatus, { label: string; className: string }> = {
  "提案中": {
    label: "提案中",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  "配信準備中": {
    label: "進行中",
    className: "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-100",
  },
  "事務確認中": {
    label: "事務確認中",
    className: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  },
  "差し戻し": {
    label: "差し戻し",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  "掲載中": {
    label: "確定",
    className: "bg-green-600 text-white hover:bg-green-600",
  },
  "見送り": {
    label: "見送り",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  "却下": {
    label: "却下",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  "掲載停止依頼中": {
    label: "掲載停止依頼中",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
  "掲載停止": {
    label: "掲載停止",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge
      variant="secondary"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
