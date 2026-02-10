"use client";

import { useState, useEffect } from "react";
import { CaseList } from "@/components/case-list";
import { CaseDetail } from "@/components/case-detail";
import { useCaseStore } from "@/lib/case-store";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, List } from "lucide-react";

export default function Home() {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
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
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* トップヘッダー */}
      <header className="bg-background border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 border rounded-md text-sm font-medium">
            営業・インサイト
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="role-switch" className="text-sm text-muted-foreground">
              ロール切り替え
            </Label>
            <Switch
              id="role-switch"
              checked={isAdminMode}
              onCheckedChange={setIsAdminMode}
            />
          </div>
          <button type="button" className="relative p-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </button>
        </div>
      </header>

      <div className="flex">
        {/* サイドバー */}
        <aside className="w-64 bg-background border-r min-h-[calc(100vh-57px)] p-4">
          <div className="mb-6">
            <h2 className="font-bold text-lg">JAS Event Manager</h2>
            <p className="text-sm text-muted-foreground">各種バナー</p>
          </div>

          <nav className="space-y-1">
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-muted"
            >
              <List className="h-4 w-4" />
              案件一覧
            </button>
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 p-8">
          <div className="max-w-5xl">
            {selectedCase ? (
              <CaseDetail caseData={selectedCase} onBack={handleBack} />
            ) : (
              <CaseList onSelectCase={handleSelectCase} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
