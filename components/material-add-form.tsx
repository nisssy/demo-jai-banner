"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronLeft, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { useCaseStore } from "@/lib/case-store";
import type { ProposalSlot, BannerType } from "@/lib/types";

interface MaterialAddFormProps {
  caseId: string;
  onBack: () => void;
}

const circledNumbers =
  "\u2460\u2461\u2462\u2463\u2464\u2465\u2466\u2467\u2468\u2469";

const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = String(i).padStart(2, "0");
  return `${hour}:00`;
});

function calculateDuration(start: string, end: string): string {
  if (!start || !end) return "";
  const [sh] = start.split(":").map(Number);
  const [eh] = end.split(":").map(Number);
  let diff = eh - sh;
  if (diff < 0) diff += 24;
  return `${diff}時間00分`;
}

interface MaterialFormItem {
  id: string;
  isOpen: boolean;
  category: string;
  eventType: string;
  materialName: string;
  implementDate: string;
  startTime: string;
  endTime: string;
  mustSeeFlag: string;
  mustSeePublish: string;
  mustSeeDate: string;
  mustSeeTime: string;
  reportRequired: string;
  companionCount: number;
  companions: string[];
  exclusiveCount: number;
  exclusives: string[];
  billingAmount: number;
}

function createEmptyMaterial(id: string): MaterialFormItem {
  return {
    id,
    isOpen: true,
    category: "event",
    eventType: "trinity",
    materialName: "",
    implementDate: "",
    startTime: "10:00",
    endTime: "18:00",
    mustSeeFlag: "0",
    mustSeePublish: "不要",
    mustSeeDate: "",
    mustSeeTime: "",
    reportRequired: "要",
    companionCount: 2,
    companions: ["未定", "未定"],
    exclusiveCount: 0,
    exclusives: [],
    billingAmount: 0,
  };
}

const bannerTypeMap: Record<string, BannerType> = {
  trinity: "メインバナー",
  campaign: "サブバナー",
  seasonal: "お知らせバナー",
};

export function MaterialAddForm({ caseId, onBack }: MaterialAddFormProps) {
  const { addProposalSlot } = useCaseStore();

  const [materials, setMaterials] = useState<MaterialFormItem[]>([
    createEmptyMaterial("new-1"),
  ]);

  const toggleMaterial = (id: string) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isOpen: !m.isOpen } : m))
    );
  };

  const updateMaterial = (
    id: string,
    field: keyof MaterialFormItem,
    value: string | number
  ) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const addMoreMaterial = () => {
    const newId = `new-${Date.now()}`;
    setMaterials((prev) => [...prev, createEmptyMaterial(newId)]);
  };

  const handleSubmit = () => {
    let addedCount = 0;
    for (const mat of materials) {
      const implementDate = mat.implementDate
        ? new Date(mat.implementDate)
        : new Date();

      const slot: ProposalSlot = {
        id: `slot-${Date.now()}-${addedCount}`,
        startDate: implementDate,
        endDate: implementDate,
        startTime: mat.startTime || "10:00",
        endTime: mat.endTime || "18:00",
        bannerType: bannerTypeMap[mat.eventType] || "メインバナー",
      };

      addProposalSlot(caseId, slot);
      addedCount++;
    }

    onBack();
  };

  const totalAmount = materials.reduce((sum, m) => sum + m.billingAmount, 0);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold">商材追加</h1>
      </div>

      {/* ===== 商材情報セクション ===== */}
      {materials.map((material, idx) => (
        <Card key={material.id} className="overflow-hidden">
          <Collapsible
            open={material.isOpen}
            onOpenChange={() => toggleMaterial(material.id)}
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/10 transition-colors">
                <h2 className="text-lg font-bold">
                  商材情報
                  {circledNumbers[idx] || `(${idx + 1})`}
                </h2>
                {material.isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-6">
                {/* 基本情報サブセクション */}
                <div>
                  <h3 className="font-semibold mb-1">基本情報</h3>
                  <Separator />
                </div>

                {/* カテゴリ / イベント区分 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm">カテゴリ</Label>
                    <Select
                      value={material.category}
                      onValueChange={(val) =>
                        updateMaterial(material.id, "category", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="event">イベント</SelectItem>
                        <SelectItem value="banner">バナー</SelectItem>
                        <SelectItem value="movie">動画</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">イベント区分</Label>
                    <Select
                      value={material.eventType}
                      onValueChange={(val) =>
                        updateMaterial(material.id, "eventType", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="イベント区分を検索..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trinity">
                          トリニティガール
                        </SelectItem>
                        <SelectItem value="campaign">キャンペーン</SelectItem>
                        <SelectItem value="seasonal">季節イベント</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* イベント商材名 / 実施日 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm">イベント商材名</Label>
                    <Input
                      value={material.materialName}
                      onChange={(e) =>
                        updateMaterial(
                          material.id,
                          "materialName",
                          e.target.value
                        )
                      }
                      placeholder="商材名を入力..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">実施日</Label>
                    <Input
                      type="date"
                      value={material.implementDate}
                      onChange={(e) =>
                        updateMaterial(
                          material.id,
                          "implementDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                {/* 開始時間 / 終了時間 / 開催時間数 */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm">開始時間</Label>
                    <Select
                      value={material.startTime}
                      onValueChange={(val) =>
                        updateMaterial(material.id, "startTime", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">終了時間</Label>
                    <Select
                      value={material.endTime}
                      onValueChange={(val) =>
                        updateMaterial(material.id, "endTime", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">開催時間数</Label>
                    <Input
                      value={calculateDuration(
                        material.startTime,
                        material.endTime
                      )}
                      readOnly
                      className="bg-muted/30"
                      placeholder="0時間00分"
                    />
                  </div>
                </div>

                {/* 必見フラグ / 必見掲載 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm">必見フラグ</Label>
                    <Select
                      value={material.mustSeeFlag}
                      onValueChange={(val) =>
                        updateMaterial(material.id, "mustSeeFlag", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">必見掲載</Label>
                    <Select
                      value={material.mustSeePublish}
                      onValueChange={(val) =>
                        updateMaterial(material.id, "mustSeePublish", val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="不要">不要</SelectItem>
                        <SelectItem value="必要">必要</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 必見掲載日 / 必見掲載時刻 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm">必見掲載日</Label>
                    <Input
                      type="date"
                      value={material.mustSeeDate}
                      onChange={(e) =>
                        updateMaterial(
                          material.id,
                          "mustSeeDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">必見掲載時刻</Label>
                    <Input
                      type="time"
                      value={material.mustSeeTime}
                      onChange={(e) =>
                        updateMaterial(
                          material.id,
                          "mustSeeTime",
                          e.target.value
                        )
                      }
                      placeholder="--:--"
                    />
                  </div>
                </div>

                {/* レポート要否 */}
                <div className="max-w-[200px] space-y-2">
                  <Label className="text-sm">レポート要否</Label>
                  <Select
                    value={material.reportRequired}
                    onValueChange={(val) =>
                      updateMaterial(material.id, "reportRequired", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="要">要</SelectItem>
                      <SelectItem value="不要">不要</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* キャスティング情報サブセクション */}
                <div>
                  <h3 className="font-semibold mb-1">キャスティング情報</h3>
                  <Separator />
                </div>

                {/* コンパニオン */}
                <Card className="p-4 bg-muted/10 border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-base">コンパニオン</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        人数:
                      </span>
                      <Input
                        type="number"
                        value={material.companionCount}
                        onChange={(e) =>
                          updateMaterial(
                            material.id,
                            "companionCount",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-16 h-8 text-center"
                        min={0}
                      />
                    </div>
                  </div>
                  {material.companions.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {material.companions.map((name, i) => (
                        <Card
                          key={`companion-${material.id}-${i}`}
                          className="p-3 bg-muted/20 border"
                        >
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {name}
                          </p>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>

                {/* 専属 */}
                <Card className="p-4 bg-muted/10 border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-base">専属</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        人数:
                      </span>
                      <Input
                        type="number"
                        value={material.exclusiveCount}
                        onChange={(e) =>
                          updateMaterial(
                            material.id,
                            "exclusiveCount",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-16 h-8 text-center"
                        min={0}
                      />
                    </div>
                  </div>
                  {material.exclusives.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {material.exclusives.map((name, i) => (
                        <Card
                          key={`exclusive-${material.id}-${i}`}
                          className="p-3 bg-muted/20 border"
                        >
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {name}
                          </p>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}

      {/* 合計金額 */}
      <Card className="p-6 border-blue-200 bg-blue-50/30">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">合計金額</h2>
          <span className="text-2xl font-bold text-blue-600">
            ¥{totalAmount.toLocaleString()}
          </span>
        </div>
      </Card>

      {/* フッターアクション */}
      <div className="flex items-center justify-center gap-4 pb-8">
        <Button
          variant="outline"
          onClick={addMoreMaterial}
          className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" />
          商材を追加
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          登録
        </Button>
      </div>
    </div>
  );
}
