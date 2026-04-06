"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { ChevronLeft, ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  initialCompanies,
  initialHalls,
  materialCategoryOptions,
  materialNameOptions,
} from "@/lib/types";
import type {
  CompanyData,
  HallData,
  SearchConditions,
  ProposalSlot,
  MaterialCategory,
  BannerType,
} from "@/lib/types";
import { CompanyHallCombobox } from "@/components/company-hall-combobox";
import { GanttCalendar } from "@/components/gantt-calendar";
import { useCaseStore } from "@/lib/case-store";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

// レコード（商材）入力用の型
interface RecordItem {
  id: string;
  recordNumber: string;
  materialCategory: string;
  materialName: string;
  bannerType: string;
  startDate: string;
  endDate: string;
  areaName: string;
  implementationPolicy: string;
  isOpen: boolean;
}

interface NewCaseFormProps {
  onBack: () => void;
  onCaseCreated: (caseId: string) => void;
  searchConditions?: SearchConditions;
}

function generateRecordNumber(idx: number) {
  return String(13828 + idx + Math.floor(Math.random() * 1000));
}

export function NewCaseForm({ onBack, onCaseCreated, searchConditions }: NewCaseFormProps) {
  const { createCase } = useCaseStore();

  // 検索条件から法人・ホールを自動入力
  const initialCompany = searchConditions?.corporate && searchConditions.corporate !== "all"
    ? initialCompanies.find(c => String(c.id) === searchConditions.corporate) ?? null
    : null;
  const initialHallData = searchConditions?.hall && searchConditions.hall !== "all"
    ? initialHalls.find(h => String(h.id) === searchConditions.hall) ?? null
    : null;

  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(initialCompany);
  const [selectedHall, setSelectedHall] = useState<HallData | null>(initialHallData);
  const [caseName, setCaseName] = useState(initialHallData?.name || initialCompany?.name || "");
  const [staffName, setStaffName] = useState(searchConditions?.staff || "");
  const [requestDate, setRequestDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [corpIdInput, setCorpIdInput] = useState(initialCompany?.companyId ?? "");
  const [hallIdInput, setHallIdInput] = useState(initialHallData?.hallId ?? "");

  // 商材（レコード）一覧
  const [records, setRecords] = useState<RecordItem[]>([]);

  // アクティブなレコード（テーブルクリックで選択 → 下の詳細セクションをスクロール）
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

  const corpId = selectedCompany?.companyId ?? corpIdInput;
  const hallId = selectedHall?.hallId ?? hallIdInput;
  const hallSalesPerson = selectedHall?.salesPersonName ?? "";

  const handleHallIdChange = (value: string) => {
    setHallIdInput(value);
    const matched = initialHalls.find((h) => h.hallId === value);
    if (matched) {
      setSelectedHall(matched);
      const company = initialCompanies.find((c) => c.id === matched.companyId) ?? null;
      setSelectedCompany(company);
    }
  };

  const handleCorpIdChange = (value: string) => {
    setCorpIdInput(value);
    const matched = initialCompanies.find((c) => c.companyId === value);
    if (matched) {
      setSelectedCompany(matched);
      setSelectedHall(null);
      setHallIdInput("");
    }
  };

  // 商材を追加
  const handleAddRecord = () => {
    const now = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const newRec: RecordItem = {
      id: `rec-${Date.now()}`,
      recordNumber: generateRecordNumber(records.length),
      materialCategory: "",
      materialName: "",
      bannerType: "メインバナー",
      startDate: format(now, "yyyy-MM-dd"),
      endDate: format(weekLater, "yyyy-MM-dd"),
      areaName: "",
      implementationPolicy: "",
      isOpen: true,
    };
    // 既存のレコードは閉じて、新しいのだけ開く
    setRecords(prev => [
      ...prev.map(r => ({ ...r, isOpen: false })),
      newRec,
    ]);
    setActiveRecordId(newRec.id);
  };

  // レコード更新
  const updateRecord = (id: string, updates: Partial<RecordItem>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  // レコード削除
  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    if (activeRecordId === id) setActiveRecordId(null);
  };

  // レコードの開閉トグル
  const toggleRecord = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, isOpen: !r.isOpen } : r));
  };

  // records→ProposalSlots変換（ガントチャート用）
  const proposalSlots: ProposalSlot[] = records
    .filter(r => r.startDate && r.endDate)
    .map(r => ({
      id: r.id,
      recordNumber: r.recordNumber,
      startDate: new Date(r.startDate),
      endDate: new Date(r.endDate),
      bannerType: (r.materialName || r.bannerType || "バナー各種") as BannerType,
      materialCategory: (r.materialCategory || undefined) as MaterialCategory | undefined,
      materialName: r.materialName || undefined,
      areaName: r.areaName || undefined,
    }));

  const isFormValid = !!selectedCompany && !!caseName.trim();

  const handleSubmit = () => {
    if (!isFormValid || !selectedCompany) return;

    const slots = records.map(r => ({
      id: `slot-${Date.now()}-${r.id}`,
      recordNumber: r.recordNumber,
      startDate: new Date(r.startDate),
      endDate: new Date(r.endDate),
      bannerType: (r.materialName || r.bannerType || "バナー各種") as BannerType,
      materialCategory: (r.materialCategory || undefined) as MaterialCategory | undefined,
      materialName: r.materialName || undefined,
      areaName: r.areaName || undefined,
    }));

    const newCase = createCase(selectedCompany.name, selectedHall?.name ?? "", {
      caseName: caseName.trim() || undefined,
      companyId: selectedCompany.companyId,
      hallId: selectedHall?.hallId,
      salesPersonName: hallSalesPerson || staffName || undefined,
      proposalSlots: slots,
    });
    onCaseCreated(newCase.id);
  };

  const circledNumbers = "\u2460\u2461\u2462\u2463\u2464\u2465\u2466\u2467\u2468\u2469";

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
          <div className="space-y-2">
            <Label className="text-sm">法人名・ホール名</Label>
            <CompanyHallCombobox
              selectedCompany={selectedCompany}
              selectedHall={selectedHall}
              onSelectCompany={(company) => {
                setSelectedCompany(company);
                setCorpIdInput(company?.companyId ?? "");
                if (!company) {
                  setSelectedHall(null);
                  setHallIdInput("");
                  setCaseName("");
                } else {
                  setCaseName(company.name);
                }
              }}
              onSelectHall={(hall) => {
                setSelectedHall(hall);
                setHallIdInput(hall?.hallId ?? "");
                if (hall && selectedCompany) {
                  setCaseName(hall.name);
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm">法人ID</Label>
              <Input
                value={corpId}
                onChange={(e) => handleCorpIdChange(e.target.value)}
                placeholder="法人IDを入力..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">ホールID</Label>
              <Input
                value={hallId}
                onChange={(e) => handleHallIdChange(e.target.value)}
                placeholder="ホールIDを入力..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">案件名</Label>
            <Input
              placeholder="例: マルハン渋谷店 - 山田 太郎"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
            />
          </div>

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

      {/* ガントチャート（追加済みレコードを表示） */}
      <GanttCalendar
        proposalSlots={proposalSlots}
        onCreateRecord={(startDate, endDate) => {
          const newRec: RecordItem = {
            id: `rec-${Date.now()}`,
            recordNumber: generateRecordNumber(records.length),
            materialCategory: "",
            materialName: "",
            bannerType: "メインバナー",
            startDate: format(startDate, "yyyy-MM-dd"),
            endDate: format(endDate, "yyyy-MM-dd"),
            areaName: "",
            implementationPolicy: "",
            isOpen: true,
          };
          setRecords(prev => [
            ...prev.map(r => ({ ...r, isOpen: false })),
            newRec,
          ]);
          setActiveRecordId(newRec.id);
        }}
      />

      {/* ===== 商材一覧テーブル ===== */}
      <Card className="overflow-hidden">
        <div className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              商材一覧
              <Badge variant="secondary" className="font-normal">
                {records.length}件
              </Badge>
            </h2>
            <Button
              variant="default"
              size="sm"
              onClick={handleAddRecord}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              商材を追加
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-y">
                <th className="text-left p-3 font-semibold">レコード番号</th>
                <th className="text-left p-3 font-semibold">商材区分</th>
                <th className="text-left p-3 font-semibold">商材名</th>
                <th className="text-left p-3 font-semibold">バナー種別</th>
                <th className="text-left p-3 font-semibold">掲載開始日</th>
                <th className="text-left p-3 font-semibold">掲載終了日</th>
                <th className="text-left p-3 font-semibold">エリア</th>
                <th className="text-left p-3 font-semibold">ステータス</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    商材が登録されていません
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr
                    key={rec.id}
                    className="border-b hover:bg-muted/10 transition-colors cursor-pointer"
                    onClick={() => {
                      setActiveRecordId(rec.id);
                      setRecords(prev => prev.map(r => ({
                        ...r,
                        isOpen: r.id === rec.id ? true : r.isOpen,
                      })));
                    }}
                  >
                    <td className="p-3">
                      <span className="text-blue-600 hover:underline font-mono">
                        {rec.recordNumber || "-"}
                      </span>
                    </td>
                    <td className="p-3">
                      {rec.materialCategory && (
                        <Badge variant="outline" className="font-normal">{rec.materialCategory}</Badge>
                      )}
                    </td>
                    <td className="p-3">{rec.materialName || "-"}</td>
                    <td className="p-3">{rec.materialName || rec.bannerType}</td>
                    <td className="p-3">
                      {rec.startDate ? format(new Date(rec.startDate), "yyyy/MM/dd", { locale: ja }) : "-"}
                    </td>
                    <td className="p-3">
                      {rec.endDate ? format(new Date(rec.endDate), "yyyy/MM/dd", { locale: ja }) : "-"}
                    </td>
                    <td className="p-3">{rec.areaName || "-"}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-normal">提案中</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ===== 商材情報セクション（詳細入力） ===== */}
      {records.map((rec, idx) => (
        <Card key={rec.id} className="overflow-hidden">
          <Collapsible open={rec.isOpen} onOpenChange={() => toggleRecord(rec.id)}>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/10 transition-colors">
                <h2 className="text-lg font-bold">
                  商材情報{circledNumbers[idx] || `(${idx + 1})`}
                </h2>
                {rec.isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6 space-y-6">
                {/* 商材区分・商材名 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">商材区分</Label>
                    <Select
                      value={rec.materialCategory || undefined}
                      onValueChange={(val) => updateRecord(rec.id, { materialCategory: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialCategoryOptions.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">商材名</Label>
                    <Select
                      value={rec.materialName || undefined}
                      onValueChange={(val) => updateRecord(rec.id, { materialName: val, bannerType: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialNameOptions.map(name => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* 掲載期間 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">掲載開始日</Label>
                    <Input
                      type="date"
                      value={rec.startDate}
                      onChange={(e) => updateRecord(rec.id, { startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">掲載終了日</Label>
                    <Input
                      type="date"
                      value={rec.endDate}
                      onChange={(e) => updateRecord(rec.id, { endDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* エリア */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">エリア</Label>
                  <Input
                    placeholder="例: 渋谷エリアA枠"
                    value={rec.areaName}
                    onChange={(e) => updateRecord(rec.id, { areaName: e.target.value })}
                  />
                </div>

                <Separator />

                {/* 実施方針 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">実施方針</Label>
                  <Textarea
                    placeholder="ターゲット層、配信目的、期待する効果などを記載してください..."
                    value={rec.implementationPolicy}
                    onChange={(e) => updateRecord(rec.id, { implementationPolicy: e.target.value })}
                    rows={4}
                  />
                </div>

                {/* 削除ボタン */}
                <div className="flex justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700 gap-1"
                    onClick={() => deleteRecord(rec.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    この商材を削除
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}

      {/* フッターアクション */}
      <div className="flex items-center justify-center gap-4 pb-8">
        <Button variant="outline" onClick={onBack}>
          キャンセル
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          案件を作成
        </Button>
      </div>
    </div>
  );
}
