"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { NewCaseDialog } from "@/components/new-case-dialog";
import { useCaseStore } from "@/lib/case-store";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Eye, Calendar, MapPin, DollarSign } from "lucide-react";

interface CaseListProps {
  onSelectCase: (caseId: string) => void;
}

// 案件ID生成（表示用）
function getCaseDisplayId(index: number): string {
  return `P${String(index + 1).padStart(3, "0")}`;
}

export function CaseList({ onSelectCase }: CaseListProps) {
  const { cases } = useCaseStore();

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">案件一覧</h1>
          <p className="text-sm text-muted-foreground mt-1">
            全ての案件を管理・確認できます
          </p>
        </div>
        <NewCaseDialog onCaseCreated={onSelectCase} />
      </div>

      {/* 案件カード一覧 */}
      <div className="space-y-4">
        {cases.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              案件がありません。新規案件を作成してください。
            </p>
          </Card>
        ) : (
          cases.map((caseItem, index) => (
            <Card
              key={caseItem.id}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  {/* ID とステータス */}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-sm px-3 py-1">
                      {getCaseDisplayId(index)}
                    </Badge>
                    <StatusBadge status={caseItem.status} />
                  </div>

                  {/* 法人名 / 店舗名 */}
                  <h3 className="text-lg font-semibold text-foreground">
                    {caseItem.corporateName} / {caseItem.storeName}
                  </h3>

                  {/* メタ情報 */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {caseItem.proposalSlots.length > 0
                          ? format(caseItem.proposalSlots[0].startDate, "yyyy-MM-dd", { locale: ja })
                          : format(caseItem.createdAt, "yyyy-MM-dd", { locale: ja })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>東京都</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4" />
                      <span>¥350,000</span>
                    </div>
                  </div>

                  {/* 作成日 */}
                  <p className="text-sm text-muted-foreground">
                    作成日: {format(caseItem.createdAt, "yyyy-MM-dd", { locale: ja })}
                  </p>
                </div>

                {/* 詳細ボタン */}
                <Button
                  variant="outline"
                  onClick={() => onSelectCase(caseItem.id)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  詳細
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
