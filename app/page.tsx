"use client";

import { useState, useEffect } from "react";
import { CaseList } from "@/components/case-list";
import { CaseDetail } from "@/components/case-detail";
import { NewCaseForm } from "@/components/new-case-form";
import { useCaseStore } from "@/lib/case-store";
import { Badge } from "@/components/ui/badge";
import { List, RefreshCw, ArrowRightLeft, Crown } from "lucide-react";

type ViewMode = "list" | "detail" | "create";

export default function Home() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [viewMode, setLocalViewMode] = useState<ViewMode>("list");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { cases, setSelectedCase, setCurrentStep, setViewMode } = useCaseStore();

  const selectedCase = cases.find((c) => c.id === selectedCaseId);

  useEffect(() => {
    if (selectedCase) {
      setSelectedCase(selectedCase);
    }
  }, [selectedCase, setSelectedCase]);

  useEffect(() => {
    setViewMode(isAdminMode ? "admin" : "sales");
  }, [isAdminMode, setViewMode]);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setLocalViewMode("detail");
    const caseItem = cases.find((c) => c.id === caseId);
    if (caseItem) {
      if (caseItem.status === "提案中" || caseItem.status === "見送り") {
        setCurrentStep(1);
      } else {
        setCurrentStep(2);
      }
    }
  };

  const handleBack = () => {
    setSelectedCaseId(null);
    setSelectedCase(null);
    setLocalViewMode("list");
  };

  const handleOpenCreateForm = () => {
    setLocalViewMode("create");
  };

  const handleCaseCreated = (caseId: string) => {
    handleSelectCase(caseId);
  };

  const handleDemoReset = () => {
    window.location.reload();
  };

  const toggleRole = () => {
    setIsAdminMode(!isAdminMode);
  };

  const isListView = viewMode === "list";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* トップヘッダー */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-base">
            J
          </div>
          <span className="font-bold text-lg tracking-tight">DMM</span>
          <span className="text-sm text-muted-foreground ml-1">Demo</span>
        </div>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={handleDemoReset}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            デモ初期化
          </button>
          <Badge className="bg-blue-600 hover:bg-blue-600 text-white px-3 py-1 gap-1.5 text-sm font-medium">
            <Crown className="h-3.5 w-3.5" />
            {isAdminMode ? "事務" : "営業"}
          </Badge>
          <button
            type="button"
            onClick={toggleRole}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRightLeft className="h-4 w-4" />
            ロールを変更
          </button>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー（一覧表示時のみ表示） */}
        {isListView && (
          <aside className="w-64 bg-background border-r min-h-[calc(100vh-57px)] p-4">
            <div className="mb-6">
              <h2 className="font-bold text-lg">JAS Event Manager</h2>
              <p className="text-sm text-muted-foreground">各種バナー</p>
            </div>

            <nav className="space-y-1">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-muted"
                onClick={handleBack}
              >
                <List className="h-4 w-4" />
                案件一覧
              </button>
            </nav>
          </aside>
        )}

        {/* メインコンテンツ */}
        <main className={`flex-1 p-8 ${isListView ? "" : "max-w-5xl mx-auto"}`}>
          {viewMode === "detail" && selectedCase ? (
            <CaseDetail caseData={selectedCase} onBack={handleBack} />
          ) : viewMode === "create" ? (
            <NewCaseForm onBack={handleBack} onCaseCreated={handleCaseCreated} />
          ) : (
            <div className="max-w-5xl">
              <CaseList
                onSelectCase={handleSelectCase}
                onOpenCreateForm={handleOpenCreateForm}
                onAddMaterial={handleSelectCase}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
