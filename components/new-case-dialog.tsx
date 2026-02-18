"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NewCaseDialogProps {
  onCaseCreated?: (caseId: string) => void;
  onOpenCreateForm?: () => void;
}

export function NewCaseDialog({ onOpenCreateForm }: NewCaseDialogProps) {
  return (
    <Button
      variant="ghost"
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium h-auto py-2"
      onClick={onOpenCreateForm}
    >
      <Plus className="mr-1 h-4 w-4" />
      新規案件作成
    </Button>
  );
}
