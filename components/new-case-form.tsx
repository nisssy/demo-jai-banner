"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronUp, ChevronDown, Plus } from "lucide-react";
import { mockAnniversaryPacks } from "@/lib/types";
import type { CompanyData, HallData } from "@/lib/types";
import { CompanyHallCombobox } from "@/components/company-hall-combobox";
import { useCaseStore } from "@/lib/case-store";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface MaterialItem {
  id: string;
  category: string;
  eventType: string;
  isOpen: boolean;
  usageMethod: "anniversary" | "single" | "";
  selectedPackId: string;
  billingAmount: string;
}

interface NewCaseFormProps {
  onBack: () => void;
  onCaseCreated: (caseId: string) => void;
}

export function NewCaseForm({ onBack, onCaseCreated }: NewCaseFormProps) {
  const { createCase } = useCaseStore();

  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [selectedHall, setSelectedHall] = useState<HallData | null>(null);
  const [caseName, setCaseName] = useState("");
  const [staffName, setStaffName] = useState("");
  const [requestDate, setRequestDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const [materials, setMaterials] = useState<MaterialItem[]>([
    { id: "1", category: "", eventType: "", isOpen: true, usageMethod: "", selectedPackId: "", billingAmount: "" },
  ]);

  const corpId = selectedCompany?.companyId ?? "";
  const hallId = selectedHall?.hallId ?? "";
  const hallSalesPerson = selectedHall?.salesPersonName ?? "";

  const addMaterial = () => {
    setMaterials([
      ...materials,
      {
        id: String(Date.now()),
        category: "",
        eventType: "",
        isOpen: true,
        usageMethod: "",
        selectedPackId: "",
        billingAmount: "",
      },
    ]);
  };

  const toggleMaterial = (id: string) => {
    setMaterials(
      materials.map((m) => (m.id === id ? { ...m, isOpen: !m.isOpen } : m))
    );
  };

  const updateMaterial = (id: string, field: keyof MaterialItem, value: string) => {
    setMaterials(
      materials.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const updateMaterialFields = (id: string, updates: Partial<MaterialItem>) => {
    setMaterials(
      materials.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  // 選択中の法人に紐づく周年パック（mockAnniversaryPacksのcorporationIdは旧形式"corp-1"等）
  const legacyCorporationId = selectedCompany
    ? `corp-${selectedCompany.id}`
    : null;
  const corporationPacks = legacyCorporationId
    ? mockAnniversaryPacks
        .filter((p) => p.corporationId === legacyCorporationId)
        .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())
    : [];
  const hasPacks = corporationPacks.length > 0;
  const nearestPack = corporationPacks.length > 0 ? corporationPacks[0] : null;

  const handleSubmit = () => {
    if (!selectedCompany || !selectedHall) return;
    const newCase = createCase(selectedCompany.name, selectedHall.name);
    onCaseCreated(newCase.id);
  };

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
        <h1 className="text-2xl font-bold">新規案件作成</h1>
      </div>

      {/* 基本情報カード */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-6">基本情報</h2>

        <div className="space-y-5">
          {/* 法人名・ホール名（コンボボックス） */}
          <div className="space-y-2">
            <Label className="text-sm">法人名・ホール名</Label>
            <CompanyHallCombobox
              selectedCompany={selectedCompany}
              selectedHall={selectedHall}
              onSelectCompany={setSelectedCompany}
              onSelectHall={setSelectedHall}
            />
          </div>

          {/* 法人ID / ホールID */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm">法人ID</Label>
              <Input
                value={corpId}
                readOnly
                className="bg-muted/30"
                placeholder=""
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">ホールID</Label>
              <Input
                value={hallId}
                readOnly
                className="bg-muted/30"
                placeholder=""
              />
            </div>
          </div>

          {/* 案件名 */}
          <div className="space-y-2">
            <Label className="text-sm">案件名</Label>
            <Input
              placeholder="例: マルハン渋谷店 - 山田 太郎"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
            />
          </div>

          {/* ホール担当営業 / 依頼日 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm">ホール担当営業</Label>
              <Input
                placeholder="ホールを選択すると自動入力されます"
                value={hallSalesPerson || staffName}
                readOnly={!!hallSalesPerson}
                className={hallSalesPerson ? "bg-muted/30" : ""}
                onChange={(e) => {
                  if (!hallSalesPerson) setStaffName(e.target.value);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">依頼日</Label>
              <Input
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* 商材情報セクション */}
      {materials.map((material, idx) => (
        <Card key={material.id} className="overflow-hidden">
          <Collapsible open={material.isOpen} onOpenChange={() => toggleMaterial(material.id)}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/10 transition-colors">
                <h2 className="text-lg font-bold">
                  商材情報{"\u2460\u2461\u2462\u2463\u2464\u2465\u2466\u2467\u2468\u2469"[idx] || `(${idx + 1})`}
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
                {/* ===== カテゴリ・イベント区分・利用方法 ===== */}
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">カテゴリ</Label>
                      <Select
                        value={material.category || undefined}
                        onValueChange={(val) =>
                          updateMaterialFields(material.id, {
                            category: val,
                            eventType: "",
                            usageMethod: "",
                            selectedPackId: "",
                            billingAmount: "",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="event">イベント</SelectItem>
                          <SelectItem value="option">オプション</SelectItem>
                          <SelectItem value="point">ポイント</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">イベント区分</Label>
                      <Select
                        value={material.eventType || undefined}
                        onValueChange={(val) => {
                          const defaultMethod = hasPacks ? "anniversary" : "single";
                          const defaultPack = hasPacks && nearestPack ? nearestPack.id : "";
                          updateMaterialFields(material.id, {
                            eventType: val,
                            usageMethod: defaultMethod,
                            selectedPackId: defaultPack,
                            billingAmount: "",
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選択してください" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="【FP課】マイページバナー">【FP課】マイページバナー</SelectItem>
                          <SelectItem value="お知らせバナー">お知らせバナー</SelectItem>
                          <SelectItem value="サブバナー">サブバナー</SelectItem>
                          <SelectItem value="スプラッシュバナー">スプラッシュバナー</SelectItem>
                          <SelectItem value="マイページバナー">マイページバナー</SelectItem>
                          <SelectItem value="メインバナー">メインバナー</SelectItem>
                          <SelectItem value="ローテーションバナー">ローテーションバナー</SelectItem>
                          <SelectItem value="動画バナー">動画バナー</SelectItem>
                          <SelectItem value="取材来店バナー">取材来店バナー</SelectItem>
                          <SelectItem value="都道府県バナー">都道府県バナー</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 利用方法（イベント区分選択後に表示） */}
                  {material.eventType ? (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">利用方法</Label>
                        <RadioGroup
                          value={material.usageMethod}
                          onValueChange={(val) => {
                            const updates: Partial<MaterialItem> = {
                              usageMethod: val as "anniversary" | "single",
                            };
                            if (val === "anniversary" && nearestPack) {
                              updates.selectedPackId = nearestPack.id;
                              updates.billingAmount = "";
                            } else if (val === "single") {
                              updates.selectedPackId = "";
                            }
                            updateMaterialFields(material.id, updates);
                          }}
                          className="space-y-3"
                        >
                          {/* 周年パックで実施 */}
                          <div
                            className={`flex items-start gap-3 rounded-lg border p-4 ${
                              material.usageMethod === "anniversary"
                                ? "border-blue-300 bg-blue-50/50"
                                : "border-muted"
                            } ${!hasPacks ? "opacity-50" : ""}`}
                          >
                            <RadioGroupItem
                              value="anniversary"
                              id={`new-usage-anniversary-${material.id}`}
                              disabled={!hasPacks}
                              className="mt-0.5"
                            />
                            <div className="flex-1 space-y-3">
                              <Label
                                htmlFor={`new-usage-anniversary-${material.id}`}
                                className={`text-sm font-medium ${!hasPacks ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                周年パックで実施
                              </Label>
                              {!hasPacks && (
                                <p className="text-xs text-muted-foreground">
                                  この法人は周年パックを購入していません
                                </p>
                              )}

                              {material.usageMethod === "anniversary" && hasPacks && (
                                <div className="space-y-2 pt-1">
                                  {corporationPacks.map((pack) => (
                                    <label
                                      key={pack.id}
                                      className={`flex items-center justify-between rounded-md border p-3 cursor-pointer transition-colors ${
                                        material.selectedPackId === pack.id
                                          ? "border-blue-400 bg-blue-50"
                                          : "border-muted hover:bg-muted/30"
                                      }`}
                                      onClick={() =>
                                        updateMaterialFields(material.id, {
                                          selectedPackId: pack.id,
                                        })
                                      }
                                    >
                                      <div className="flex items-center gap-3">
                                        <div
                                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                            material.selectedPackId === pack.id
                                              ? "border-blue-500"
                                              : "border-muted-foreground/40"
                                          }`}
                                        >
                                          {material.selectedPackId === pack.id && (
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                          )}
                                        </div>
                                        <span className="text-sm font-medium">
                                          {pack.title}
                                        </span>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        有効期限: {format(pack.expiryDate, "yyyy/MM/dd", { locale: ja })}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 単発で実施 */}
                          <div
                            className={`flex items-start gap-3 rounded-lg border p-4 ${
                              material.usageMethod === "single"
                                ? "border-blue-300 bg-blue-50/50"
                                : "border-muted"
                            }`}
                          >
                            <RadioGroupItem
                              value="single"
                              id={`new-usage-single-${material.id}`}
                              className="mt-0.5"
                            />
                            <div className="flex-1 space-y-3">
                              <Label
                                htmlFor={`new-usage-single-${material.id}`}
                                className="text-sm font-medium cursor-pointer"
                              >
                                単発で実施
                              </Label>

                              {material.usageMethod === "single" && (
                                <div className="space-y-2 pt-1">
                                  <Label className="text-xs text-muted-foreground">
                                    請求額
                                  </Label>
                                  <div className="relative max-w-xs">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                      ¥
                                    </span>
                                    <Input
                                      type="text"
                                      inputMode="numeric"
                                      placeholder="0"
                                      className="pl-7"
                                      value={material.billingAmount}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, "");
                                        updateMaterialFields(material.id, { billingAmount: val });
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                      <Separator />
                    </>
                  ) : (
                    <div className="bg-muted/30 rounded-md p-4 text-sm text-muted-foreground">
                      まず「イベント区分」を選択してください。選択後に、利用方法や請求額などの入力項目が表示されます。
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}

      {/* フッターアクション */}
      <div className="flex items-center justify-center gap-4 pb-8">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            addMaterial();
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          商材を追加
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedCompany || !selectedHall}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          案件を作成
        </Button>
      </div>
    </div>
  );
}
