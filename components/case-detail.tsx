"use client";

import { Button } from "@/components/ui/button";
import { CaseStepper } from "@/components/case-stepper";
import { StatusBadge } from "@/components/status-badge";
import { Step1Proposal } from "@/components/step1-proposal";
import { Step2Publishing } from "@/components/step2-publishing";
import { AdminReview } from "@/components/admin-review";
import { useCaseStore } from "@/lib/case-store";
import type { Case } from "@/lib/types";
import { ArrowLeft, Building2, Store } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CaseDetailProps {
  caseData: Case;
  onBack: () => void;
}

export function CaseDetail({ caseData, onBack }: CaseDetailProps) {
  const { currentStep, setCurrentStep, viewMode, setViewMode } = useCaseStore();

  // ステータスに基づいて適切なステップを決定
  const getStepFromStatus = () => {
    switch (caseData.status) {
      case "提案中":
      case "見送り":
        return 1;
      case "配信準備中":
      case "事務確認中":
      case "差し戻し":
      case "掲載中":
      case "掲載停止依頼中":
      case "掲載停止":
        return 2;
      default:
        return 1;
    }
  };

  const effectiveStep = getStepFromStatus();

  // 事務側で確認が必要なステータスかどうか
  const needsAdminReview =
    caseData.status === "事務確認中" || caseData.status === "掲載停止依頼中";

  const handleStepClick = (step: number) => {
    // 常にステップ間を行き来できる
    setCurrentStep(step);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">案件詳細</h1>
              <StatusBadge status={caseData.status} />
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {caseData.corporateName}
              </span>
              <span className="flex items-center gap-1">
                <Store className="h-4 w-4" />
                {caseData.storeName}
              </span>
            </div>
          </div>
        </div>

        {/* 営業/事務切り替え（ステップ2のときのみ表示） */}
        {(currentStep || effectiveStep) === 2 && (
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "sales" | "admin")}>
            <TabsList>
              <TabsTrigger value="sales">営業側</TabsTrigger>
              <TabsTrigger value="admin">事務側</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {/* ステッパー */}
      <CaseStepper
        currentStep={currentStep || effectiveStep}
        onStepClick={handleStepClick}
      />

      {/* コンテンツ */}
      {viewMode === "admin" ? (
        <AdminReview caseData={caseData} onBack={onBack} />
      ) : (currentStep || effectiveStep) === 1 ? (
        <Step1Proposal caseData={caseData} onCancel={onBack} />
      ) : (
        <Step2Publishing caseData={caseData} onCancel={onBack} />
      )}
    </div>
  );
}
