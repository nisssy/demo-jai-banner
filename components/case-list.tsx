"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { NewCaseDialog } from "@/components/new-case-dialog";
import { useCaseStore } from "@/lib/case-store";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  Search,
  X,
  Plus,
  Check,
  ChevronsUpDown,
  Save,
  Trash2,
  Edit,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  FilePlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  initialCompanies,
  initialHalls,
  areaRegionOptions,
  materialCategoryOptions,
  materialNameOptions,
  type CaseStatus,
  type SearchConditions,
  type SavedSearchCondition,
  type Case,
  type ProposalSlot,
} from "@/lib/types";

interface CaseListProps {
  onSelectCase: (caseId: string) => void;
  onOpenCreateForm?: () => void;
  onAddMaterial?: (caseId: string) => void;
  onSelectRecord?: (caseId: string, slotId: string) => void;
  onAddNewMaterial?: (caseId: string, materialCategory: string, materialName: string) => void;
  searchConditionsFromParent?: Partial<SearchConditions>;
}

const defaultConditions: SearchConditions = {
  corporate: "",
  hall: "",
  area: "",
  statuses: [],
  materialCategory: "",
  materialName: "",
  dateStart: "",
  dateEnd: "",
  staff: "山田太郎",
  caseNo: "",
  caseName: "",
  caseNumber: "",
  recordNumber: "",
};

export function CaseList({ onSelectCase, onOpenCreateForm, onAddMaterial, onSelectRecord, onAddNewMaterial, searchConditionsFromParent }: CaseListProps) {
  const { cases } = useCaseStore();
  const [corporateOpen, setCorporateOpen] = useState(false);
  const [hallOpen, setHallOpen] = useState(false);
  const [materialNameOpen, setMaterialNameOpen] = useState(false);

  // 新規商材追加モーダル
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [addMaterialStep, setAddMaterialStep] = useState<1 | 2>(1);
  const [selectedCaseForMaterial, setSelectedCaseForMaterial] = useState<string | null>(null);
  const [newMaterialCategory, setNewMaterialCategory] = useState("");
  const [newMaterialName, setNewMaterialName] = useState("");
  const [materialModalSearch, setMaterialModalSearch] = useState({
    corporate: "",
    hall: "",
    category: "",
    event: "",
    dateStart: "",
    dateEnd: "",
    staff: "",
    caseNo: "",
    caseName: "",
  });
  const [modalCorporateOpen, setModalCorporateOpen] = useState(false);
  const [modalMaterialNameOpen, setModalMaterialNameOpen] = useState(false);

  // 検索条件の状態
  const [searchConditions, setSearchConditions] = useState<SearchConditions>({
    ...defaultConditions,
    ...searchConditionsFromParent,
  });

  // 保存済み検索条件
  const [savedConditions, setSavedConditions] = useState<SavedSearchCondition[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveConditionName, setSaveConditionName] = useState("");
  const [editingConditionId, setEditingConditionId] = useState<string | null>(null);
  const [showSavedList, setShowSavedList] = useState(false);

  // ステータス複数選択用
  const [statusOpen, setStatusOpen] = useState(false);

  const statusOptions: CaseStatus[] = [
    "提案中",
    "配信準備中",
    "事務確認中",
    "差し戻し",
    "掲載中",
    "見送り",
    "却下",
    "掲載停止依頼中",
    "掲載停止",
  ];

  const toggleStatus = (status: string) => {
    setSearchConditions(prev => {
      const current = prev.statuses;
      if (current.includes(status)) {
        return { ...prev, statuses: current.filter(s => s !== status) };
      }
      return { ...prev, statuses: [...current, status] };
    });
  };

  // レコード一覧データ生成（案件をフラット化）
  type RecordRow = {
    caseItem: Case;
    slot: ProposalSlot;
    caseIndex: number;
  };

  const allRecords: RecordRow[] = cases.flatMap((caseItem, caseIndex) =>
    caseItem.proposalSlots.map(slot => ({
      caseItem,
      slot,
      caseIndex,
    }))
  );

  // フィルタリング
  const filteredRecords = allRecords.filter(({ caseItem, slot }) => {
    if (searchConditions.area && searchConditions.area !== "all") {
      if (caseItem.areaRegion !== searchConditions.area) return false;
    }
    if (searchConditions.statuses.length > 0) {
      if (!searchConditions.statuses.includes(caseItem.status)) return false;
    }
    if (searchConditions.corporate && searchConditions.corporate !== "all") {
      const company = initialCompanies.find(c => String(c.id) === searchConditions.corporate);
      if (company && caseItem.corporateName !== company.name) return false;
    }
    if (searchConditions.hall && searchConditions.hall !== "all") {
      const hall = initialHalls.find(h => String(h.id) === searchConditions.hall);
      if (hall && caseItem.storeName !== hall.name) return false;
    }
    if (searchConditions.materialCategory && searchConditions.materialCategory !== "all") {
      if (slot.materialCategory !== searchConditions.materialCategory) return false;
    }
    if (searchConditions.materialName && searchConditions.materialName !== "all") {
      if (slot.materialName !== searchConditions.materialName) return false;
    }
    if (searchConditions.caseNumber) {
      if (!caseItem.caseNumber?.toLowerCase().includes(searchConditions.caseNumber.toLowerCase())) return false;
    }
    if (searchConditions.recordNumber) {
      if (!slot.recordNumber?.toLowerCase().includes(searchConditions.recordNumber.toLowerCase())) return false;
    }
    if (searchConditions.caseName) {
      const name = caseItem.caseName || `${caseItem.corporateName} キャンペーン`;
      if (!name.toLowerCase().includes(searchConditions.caseName.toLowerCase())) return false;
    }
    return true;
  });

  // 案件のないケース（proposalSlotsが空）も表示するために、フィルタ済み案件を取得
  const filteredCasesWithoutSlots = cases.filter(c => {
    if (c.proposalSlots.length > 0) return false;
    if (searchConditions.statuses.length > 0 && !searchConditions.statuses.includes(c.status)) return false;
    if (searchConditions.corporate && searchConditions.corporate !== "all") {
      const company = initialCompanies.find(co => String(co.id) === searchConditions.corporate);
      if (company && c.corporateName !== company.name) return false;
    }
    return true;
  });

  const clearSearch = () => {
    setSearchConditions({ ...defaultConditions });
  };

  // 検索条件保存
  const handleSaveCondition = () => {
    if (!saveConditionName.trim()) return;
    if (editingConditionId) {
      setSavedConditions(prev => prev.map(sc =>
        sc.id === editingConditionId
          ? { ...sc, name: saveConditionName, conditions: { ...searchConditions } }
          : sc
      ));
    } else {
      const newCondition: SavedSearchCondition = {
        id: `saved-${Date.now()}`,
        name: saveConditionName,
        conditions: { ...searchConditions },
        createdAt: new Date(),
      };
      setSavedConditions(prev => [...prev, newCondition]);
    }
    setShowSaveDialog(false);
    setSaveConditionName("");
    setEditingConditionId(null);
  };

  const handleDeleteCondition = (id: string) => {
    setSavedConditions(prev => prev.filter(sc => sc.id !== id));
  };

  const handleLoadCondition = (condition: SavedSearchCondition) => {
    setSearchConditions({ ...condition.conditions });
    setShowSavedList(false);
  };

  const handleEditCondition = (condition: SavedSearchCondition) => {
    setEditingConditionId(condition.id);
    setSaveConditionName(condition.name);
    setSearchConditions({ ...condition.conditions });
    setShowSaveDialog(true);
  };

  // エクスポート（JSON）
  const handleExportConditions = () => {
    const data = JSON.stringify(savedConditions, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "search-conditions.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCurrentCondition = () => {
    const data = JSON.stringify(searchConditions, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "current-search-condition.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const getDaysCount = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダーと新規作成ボタン */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="font-bold text-2xl">案件一覧</h2>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => {
              setShowAddMaterialModal(true);
              setAddMaterialStep(1);
              setSelectedCaseForMaterial(null);
              setNewMaterialCategory("");
              setNewMaterialName("");
            }}
          >
            <Plus className="h-4 w-4" />
            新規商材追加
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
            onClick={onOpenCreateForm}
          >
            <Plus className="h-4 w-4" />
            新規案件作成
          </Button>
        </div>
      </div>

      {/* 検索エリア */}
      <Card className="p-6 bg-muted/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold text-lg">案件検索</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavedList(!showSavedList)}
                className="gap-1"
              >
                <ChevronDown className="h-3 w-3" />
                保存済み条件 ({savedConditions.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingConditionId(null);
                  setSaveConditionName("");
                  setShowSaveDialog(true);
                }}
                className="gap-1"
              >
                <Save className="h-3 w-3" />
                条件を保存
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCurrentCondition}
                className="gap-1"
              >
                <Download className="h-3 w-3" />
                エクスポート
              </Button>
            </div>
          </div>

          {/* 保存済み条件一覧 */}
          {showSavedList && savedConditions.length > 0 && (
            <Card className="p-4 bg-background">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">保存済み検索条件</h3>
                <Button variant="outline" size="sm" onClick={handleExportConditions} className="gap-1">
                  <Download className="h-3 w-3" />
                  一括エクスポート
                </Button>
              </div>
              <div className="space-y-2">
                {savedConditions.map(sc => (
                  <div key={sc.id} className="flex items-center justify-between p-2 rounded border hover:bg-muted/20">
                    <button
                      type="button"
                      className="text-sm font-medium text-blue-600 hover:underline"
                      onClick={() => handleLoadCondition(sc)}
                    >
                      {sc.name}
                    </button>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCondition(sc)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteCondition(sc.id)}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <p className="text-sm text-muted-foreground">
            複数の条件で案件を絞り込むことができます
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 法人 */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">法人</Label>
              <Popover open={corporateOpen} onOpenChange={setCorporateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={corporateOpen}
                    className="w-full justify-between font-normal"
                  >
                    {searchConditions.corporate && searchConditions.corporate !== ""
                      ? searchConditions.corporate === "all"
                        ? "すべて"
                        : initialCompanies.find((c) => String(c.id) === searchConditions.corporate)?.name ?? "法人を検索..."
                      : "法人を検索..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="法人名で検索..." />
                    <CommandList>
                      <CommandEmpty>該当する法人がありません</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="すべて"
                          onSelect={() => {
                            setSearchConditions({...searchConditions, corporate: "all", hall: ""});
                            setCorporateOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", searchConditions.corporate === "all" ? "opacity-100" : "opacity-0")} />
                          すべて
                        </CommandItem>
                        {initialCompanies.map((corp) => (
                          <CommandItem
                            key={String(corp.id)}
                            value={corp.name}
                            onSelect={() => {
                              setSearchConditions({...searchConditions, corporate: String(corp.id), hall: ""});
                              setCorporateOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", searchConditions.corporate === String(corp.id) ? "opacity-100" : "opacity-0")} />
                            {corp.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* ホール */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">ホール</Label>
              <Popover open={hallOpen} onOpenChange={setHallOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={hallOpen}
                    className="w-full justify-between font-normal"
                  >
                    {searchConditions.hall && searchConditions.hall !== ""
                      ? searchConditions.hall === "all"
                        ? "すべて"
                        : initialHalls.find((h) => String(h.id) === searchConditions.hall)?.name ?? "ホールを検索..."
                      : "ホールを検索..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="ホール名で検索..." />
                    <CommandList>
                      <CommandEmpty>該当するホールがありません</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="すべて"
                          onSelect={() => {
                            setSearchConditions({...searchConditions, hall: "all"});
                            setHallOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", searchConditions.hall === "all" ? "opacity-100" : "opacity-0")} />
                          すべて
                        </CommandItem>
                        {(searchConditions.corporate && searchConditions.corporate !== "all"
                          ? initialHalls.filter((h) => h.companyId === Number(searchConditions.corporate))
                          : initialHalls
                        ).map((hall) => (
                          <CommandItem
                            key={String(hall.id)}
                            value={hall.name}
                            onSelect={() => {
                              setSearchConditions({...searchConditions, hall: String(hall.id)});
                              setHallOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", searchConditions.hall === String(hall.id) ? "opacity-100" : "opacity-0")} />
                            {hall.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* 部やエリア */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">部やエリア</Label>
              <Select
                value={searchConditions.area}
                onValueChange={(val) => setSearchConditions({...searchConditions, area: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="エリアを選択..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {areaRegionOptions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ステータス（複数選択） */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">ステータス</Label>
              <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                  >
                    {searchConditions.statuses.length === 0
                      ? "ステータスを選択..."
                      : searchConditions.statuses.length === 1
                        ? searchConditions.statuses[0]
                        : `${searchConditions.statuses.length}件選択中`}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {statusOptions.map((status) => (
                          <CommandItem
                            key={status}
                            value={status}
                            onSelect={() => toggleStatus(status)}
                          >
                            <Check className={cn("mr-2 h-4 w-4", searchConditions.statuses.includes(status) ? "opacity-100" : "opacity-0")} />
                            {status}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* 商材区分 */}
            <div className="space-y-2">
              <Label htmlFor="materialCategory" className="text-xs font-bold">商材区分</Label>
              <Select
                value={searchConditions.materialCategory}
                onValueChange={(val) => setSearchConditions({...searchConditions, materialCategory: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {materialCategoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 商材名（input+selectコンボボックス） */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">商材名</Label>
              <Popover open={materialNameOpen} onOpenChange={setMaterialNameOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={materialNameOpen}
                    className="w-full justify-between font-normal"
                  >
                    {searchConditions.materialName && searchConditions.materialName !== "" && searchConditions.materialName !== "all"
                      ? searchConditions.materialName
                      : "商材名を検索..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="商材名を入力..."
                      onValueChange={(val) => {
                        // input入力でも検索可能
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>該当する商材名がありません</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="すべて"
                          onSelect={() => {
                            setSearchConditions({...searchConditions, materialName: "all"});
                            setMaterialNameOpen(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", searchConditions.materialName === "all" ? "opacity-100" : "opacity-0")} />
                          すべて
                        </CommandItem>
                        {materialNameOptions.map((name) => (
                          <CommandItem
                            key={name}
                            value={name}
                            onSelect={() => {
                              setSearchConditions({...searchConditions, materialName: name});
                              setMaterialNameOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", searchConditions.materialName === name ? "opacity-100" : "opacity-0")} />
                            {name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* 期間 */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">期間</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="date"
                  value={searchConditions.dateStart}
                  onChange={(e) => setSearchConditions({...searchConditions, dateStart: e.target.value})}
                  className="flex-1"
                />
                <span>-</span>
                <Input
                  type="date"
                  value={searchConditions.dateEnd}
                  onChange={(e) => setSearchConditions({...searchConditions, dateEnd: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>

            {/* ホール担当 */}
            <div className="space-y-2">
              <Label htmlFor="staff" className="text-xs font-bold">ホール担当</Label>
              <Select
                value={searchConditions.staff}
                onValueChange={(val) => setSearchConditions({...searchConditions, staff: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="担当者を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="山田太郎">山田太郎</SelectItem>
                  <SelectItem value="鈴木一郎">鈴木一郎</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 案件No */}
            <div className="space-y-2">
              <Label htmlFor="caseNo" className="text-xs font-bold">案件No</Label>
              <Input
                id="caseNo"
                placeholder="案件Noを入力..."
                value={searchConditions.caseNo}
                onChange={(e) => setSearchConditions({...searchConditions, caseNo: e.target.value})}
              />
            </div>

            {/* 案件番号 */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">案件番号</Label>
              <Input
                placeholder="案件番号を入力..."
                value={searchConditions.caseNumber}
                onChange={(e) => setSearchConditions({...searchConditions, caseNumber: e.target.value})}
              />
            </div>

            {/* レコード番号 */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">レコード番号</Label>
              <Input
                placeholder="レコード番号を入力..."
                value={searchConditions.recordNumber}
                onChange={(e) => setSearchConditions({...searchConditions, recordNumber: e.target.value})}
              />
            </div>
          </div>

          {/* 案件名（全幅） */}
          <div className="space-y-2">
            <Label htmlFor="caseName" className="text-xs font-bold">案件名</Label>
            <Input
              id="caseName"
              placeholder="案件名を入力..."
              value={searchConditions.caseName}
              onChange={(e) => setSearchConditions({...searchConditions, caseName: e.target.value})}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="text-muted-foreground">検索条件:</span>
              {searchConditions.area && searchConditions.area !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1 font-normal">
                  エリア: {searchConditions.area}
                  <button
                    onClick={() => setSearchConditions({...searchConditions, area: ""})}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchConditions.statuses.length > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1 font-normal">
                  ステータス: {searchConditions.statuses.join(", ")}
                  <button
                    onClick={() => setSearchConditions({...searchConditions, statuses: []})}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchConditions.materialCategory && searchConditions.materialCategory !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1 font-normal">
                  商材区分: {searchConditions.materialCategory}
                  <button
                    onClick={() => setSearchConditions({...searchConditions, materialCategory: ""})}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchConditions.materialName && searchConditions.materialName !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1 font-normal">
                  商材名: {searchConditions.materialName}
                  <button
                    onClick={() => setSearchConditions({...searchConditions, materialName: ""})}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchConditions.staff && (
                <Badge variant="secondary" className="flex items-center gap-1 font-normal">
                  ホール担当: {searchConditions.staff}
                  <button
                    onClick={() => setSearchConditions({...searchConditions, staff: ""})}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchConditions.caseNumber && (
                <Badge variant="secondary" className="flex items-center gap-1 font-normal">
                  案件番号: {searchConditions.caseNumber}
                  <button
                    onClick={() => setSearchConditions({...searchConditions, caseNumber: ""})}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {searchConditions.recordNumber && (
                <Badge variant="secondary" className="flex items-center gap-1 font-normal">
                  レコード番号: {searchConditions.recordNumber}
                  <button
                    onClick={() => setSearchConditions({...searchConditions, recordNumber: ""})}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={clearSearch}>
              すべてクリア
            </Button>
          </div>
        </div>
      </Card>

      {/* レコードテーブル一覧 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b">
                <th className="text-left p-3 font-semibold whitespace-nowrap">案件番号</th>
                <th className="text-left p-3 font-semibold whitespace-nowrap">ステータス</th>
                <th className="text-left p-3 font-semibold whitespace-nowrap">レコード番号</th>
                <th className="text-left p-3 font-semibold whitespace-nowrap">商材区分</th>
                <th className="text-left p-3 font-semibold whitespace-nowrap">商材名</th>
                <th className="text-left p-3 font-semibold whitespace-nowrap">法人名</th>
                <th className="text-left p-3 font-semibold whitespace-nowrap">ホール名</th>
                <th className="text-left p-3 font-semibold whitespace-nowrap">掲載開始日</th>
                <th className="text-left p-3 font-semibold whitespace-nowrap">掲載終了日</th>
                <th className="text-right p-3 font-semibold whitespace-nowrap">掲載日数</th>
                <th className="text-left p-3 font-semibold whitespace-nowrap">バナー種別</th>
                <th className="text-left p-3 font-semibold whitespace-nowrap">担当営業</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 && filteredCasesWithoutSlots.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-muted-foreground">
                    {cases.length === 0
                      ? "案件がありません。新規案件を作成してください。"
                      : "条件に一致するレコードがありません。"}
                  </td>
                </tr>
              ) : (
                <>
                  {filteredRecords.map(({ caseItem, slot }) => (
                    <tr key={`${caseItem.id}-${slot.id}`} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="p-3">
                        <button
                          type="button"
                          className="text-blue-600 hover:underline font-medium"
                          onClick={() => onSelectCase(caseItem.id)}
                        >
                          {caseItem.caseNumber || "-"}
                        </button>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={caseItem.status} />
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          className="text-blue-600 hover:underline font-mono"
                          onClick={() => onSelectRecord?.(caseItem.id, slot.id)}
                        >
                          {slot.recordNumber || "-"}
                        </button>
                      </td>
                      <td className="p-3">
                        {slot.materialCategory && (
                          <Badge variant="outline" className="font-normal">
                            {slot.materialCategory}
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 whitespace-nowrap">{slot.materialName || "-"}</td>
                      <td className="p-3 whitespace-nowrap">{caseItem.corporateName}</td>
                      <td className="p-3 whitespace-nowrap">{caseItem.storeName}</td>
                      <td className="p-3 whitespace-nowrap">
                        {format(slot.startDate, "yyyy-MM-dd", { locale: ja })}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {format(slot.endDate, "yyyy-MM-dd", { locale: ja })}
                      </td>
                      <td className="p-3 text-right">
                        {getDaysCount(slot.startDate, slot.endDate)}日間
                      </td>
                      <td className="p-3 whitespace-nowrap">{slot.bannerType}</td>
                      <td className="p-3 whitespace-nowrap">{caseItem.salesPersonName || "山田 太郎"}</td>
                    </tr>
                  ))}
                  {/* 商材のない案件 */}
                  {filteredCasesWithoutSlots.map((caseItem) => (
                    <tr key={caseItem.id} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="p-3">
                        <button
                          type="button"
                          className="text-blue-600 hover:underline font-medium"
                          onClick={() => onSelectCase(caseItem.id)}
                        >
                          {caseItem.caseNumber || "-"}
                        </button>
                      </td>
                      <td className="p-3">
                        <StatusBadge status={caseItem.status} />
                      </td>
                      <td className="p-3 text-muted-foreground">-</td>
                      <td className="p-3">-</td>
                      <td className="p-3">-</td>
                      <td className="p-3 whitespace-nowrap">{caseItem.corporateName}</td>
                      <td className="p-3 whitespace-nowrap">{caseItem.storeName}</td>
                      <td className="p-3">-</td>
                      <td className="p-3">-</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3">-</td>
                      <td className="p-3 whitespace-nowrap">{caseItem.salesPersonName || "山田 太郎"}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t bg-muted/10 text-sm text-muted-foreground">
          {filteredRecords.length + filteredCasesWithoutSlots.length} 件表示
        </div>
      </Card>

      {/* 保存ダイアログ */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingConditionId ? "検索条件を編集" : "検索条件を保存"}</DialogTitle>
            <DialogDescription>
              現在の検索条件に名前をつけて保存します
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>条件名</Label>
              <Input
                value={saveConditionName}
                onChange={(e) => setSaveConditionName(e.target.value)}
                placeholder="例: 関東エリア進行中案件"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>キャンセル</Button>
            <Button onClick={handleSaveCondition} disabled={!saveConditionName.trim()}>
              {editingConditionId ? "更新" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新規商材追加モーダル */}
      <Dialog open={showAddMaterialModal} onOpenChange={(open) => {
        setShowAddMaterialModal(open);
        if (!open) {
          setAddMaterialStep(1);
          setSelectedCaseForMaterial(null);
          setNewMaterialCategory("");
          setNewMaterialName("");
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {addMaterialStep === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle>追加先案件を選択</DialogTitle>
              </DialogHeader>

              {/* モーダル内検索フォーム */}
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-3 gap-4">
                  {/* 法人/ホール */}
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">法人/ホール</Label>
                    <Popover open={modalCorporateOpen} onOpenChange={setModalCorporateOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-sm">
                          {materialModalSearch.corporate
                            ? initialCompanies.find(c => String(c.id) === materialModalSearch.corporate)?.name ?? "法人名を検索..."
                            : "法人名を検索..."}
                          <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="法人名で検索..." />
                          <CommandList>
                            <CommandEmpty>該当なし</CommandEmpty>
                            <CommandGroup>
                              {initialCompanies.map(corp => (
                                <CommandItem key={String(corp.id)} value={corp.name} onSelect={() => {
                                  setMaterialModalSearch(prev => ({ ...prev, corporate: String(corp.id) }));
                                  setModalCorporateOpen(false);
                                }}>
                                  <Check className={cn("mr-2 h-4 w-4", materialModalSearch.corporate === String(corp.id) ? "opacity-100" : "opacity-0")} />
                                  {corp.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* 商品カテゴリ */}
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">商品カテゴリ</Label>
                    <Select value={materialModalSearch.category} onValueChange={val => setMaterialModalSearch(prev => ({ ...prev, category: val }))}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="すべて" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">すべて</SelectItem>
                        {materialCategoryOptions.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* イベント区分 */}
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">イベント区分</Label>
                    <Select value={materialModalSearch.event} onValueChange={val => setMaterialModalSearch(prev => ({ ...prev, event: val }))}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="すべて" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">すべて</SelectItem>
                        {materialNameOptions.map(name => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 期間 */}
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">期間</Label>
                    <div className="flex items-center gap-1">
                      <Select defaultValue="date">
                        <SelectTrigger className="w-[80px] text-xs">
                          <SelectValue placeholder="実施日" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">実施日</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input type="date" className="text-xs" value={materialModalSearch.dateStart} onChange={e => setMaterialModalSearch(prev => ({ ...prev, dateStart: e.target.value }))} />
                      <span className="text-xs">~</span>
                      <Input type="date" className="text-xs" value={materialModalSearch.dateEnd} onChange={e => setMaterialModalSearch(prev => ({ ...prev, dateEnd: e.target.value }))} />
                    </div>
                  </div>

                  {/* ホール担当 */}
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">ホール担当</Label>
                    <Input placeholder="ホール担当を検索..." className="text-sm" value={materialModalSearch.staff} onChange={e => setMaterialModalSearch(prev => ({ ...prev, staff: e.target.value }))} />
                  </div>

                  {/* 案件No */}
                  <div className="space-y-1">
                    <Label className="text-xs font-bold">案件No</Label>
                    <Input placeholder="案件Noを入力..." className="text-sm" value={materialModalSearch.caseNo} onChange={e => setMaterialModalSearch(prev => ({ ...prev, caseNo: e.target.value }))} />
                  </div>
                </div>

                {/* 案件名 */}
                <div className="space-y-1">
                  <Label className="text-xs font-bold">案件名</Label>
                  <Input placeholder="案件名を入力..." className="text-sm w-1/3" value={materialModalSearch.caseName} onChange={e => setMaterialModalSearch(prev => ({ ...prev, caseName: e.target.value }))} />
                </div>
              </div>

              {/* 案件テーブル（案件番号、案件名、案件Noのみ） */}
              <div className="border rounded-lg overflow-hidden mt-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      <th className="w-10 p-2"></th>
                      <th className="text-left p-2 font-semibold text-xs whitespace-nowrap">ステータス</th>
                      <th className="text-left p-2 font-semibold text-xs whitespace-nowrap">レコードタイトル</th>
                      <th className="text-left p-2 font-semibold text-xs whitespace-nowrap">発注日</th>
                      <th className="text-left p-2 font-semibold text-xs whitespace-nowrap">レコード番号</th>
                      <th className="text-left p-2 font-semibold text-xs whitespace-nowrap">店舗コード</th>
                      <th className="text-left p-2 font-semibold text-xs whitespace-nowrap">店舗名</th>
                      <th className="text-left p-2 font-semibold text-xs whitespace-nowrap">掲載開始希望日</th>
                      <th className="text-left p-2 font-semibold text-xs whitespace-nowrap">掲載終了日</th>
                      <th className="text-right p-2 font-semibold text-xs whitespace-nowrap">掲載日数</th>
                      <th className="text-right p-2 font-semibold text-xs whitespace-nowrap">実NET額</th>
                      <th className="text-right p-2 font-semibold text-xs whitespace-nowrap">日予算</th>
                      <th className="text-left p-2 font-semibold text-xs whitespace-nowrap">キャンペーン目的</th>
                      <th className="text-left p-2 font-semibold text-xs whitespace-nowrap">課金方式</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const modalFilteredCases = cases.filter(c => {
                        if (materialModalSearch.corporate && materialModalSearch.corporate !== "all") {
                          const company = initialCompanies.find(co => String(co.id) === materialModalSearch.corporate);
                          if (company && c.corporateName !== company.name) return false;
                        }
                        if (materialModalSearch.caseName && !c.caseName?.toLowerCase().includes(materialModalSearch.caseName.toLowerCase()) && !c.corporateName.toLowerCase().includes(materialModalSearch.caseName.toLowerCase())) return false;
                        if (materialModalSearch.caseNo && !c.caseNumber?.toLowerCase().includes(materialModalSearch.caseNo.toLowerCase())) return false;
                        return true;
                      });

                      // Flatten to records
                      const modalRecords = modalFilteredCases.flatMap(caseItem =>
                        caseItem.proposalSlots.length > 0
                          ? caseItem.proposalSlots.map(slot => ({ caseItem, slot }))
                          : [{ caseItem, slot: null as ProposalSlot | null }]
                      );

                      if (modalRecords.length === 0) {
                        return (
                          <tr>
                            <td colSpan={14} className="p-6 text-center text-muted-foreground text-sm">
                              案件がありません
                            </td>
                          </tr>
                        );
                      }

                      return modalRecords.map(({ caseItem, slot }, idx) => {
                        const netAmount = caseItem.billingAmount || (slot ? 50000 : 0);
                        const days = slot ? getDaysCount(slot.startDate, slot.endDate) : 0;
                        const dailyBudget = days > 0 ? Math.round(netAmount / days) : 0;
                        return (
                          <tr
                            key={`${caseItem.id}-${slot?.id || "no-slot"}-${idx}`}
                            className={cn(
                              "border-b hover:bg-muted/10 cursor-pointer transition-colors",
                              selectedCaseForMaterial === caseItem.id && "bg-blue-50"
                            )}
                            onClick={() => setSelectedCaseForMaterial(caseItem.id)}
                          >
                            <td className="p-2 text-center">
                              <div className={cn(
                                "w-4 h-4 rounded border-2 mx-auto flex items-center justify-center",
                                selectedCaseForMaterial === caseItem.id ? "border-blue-600 bg-blue-600" : "border-gray-300"
                              )}>
                                {selectedCaseForMaterial === caseItem.id && <Check className="h-3 w-3 text-white" />}
                              </div>
                            </td>
                            <td className="p-2">
                              <StatusBadge status={caseItem.status} />
                            </td>
                            <td className="p-2 text-xs whitespace-nowrap">レコードNo.{slot?.recordNumber || "-"}...</td>
                            <td className="p-2 text-xs whitespace-nowrap">
                              {format(caseItem.createdAt, "yyyy-MM-dd")}
                            </td>
                            <td className="p-2 text-xs font-mono">{slot?.recordNumber || "-"}</td>
                            <td className="p-2">
                              <span className="text-blue-600 text-xs">{caseItem.hallId || `P${String(idx + 1).padStart(5, "0")}`}</span>
                            </td>
                            <td className="p-2 text-xs whitespace-nowrap">{caseItem.storeName?.substring(0, 3)}...</td>
                            <td className="p-2 text-xs whitespace-nowrap">
                              {slot ? format(slot.startDate, "yyyy-MM-dd") : "-"}
                            </td>
                            <td className="p-2 text-xs whitespace-nowrap">
                              {slot ? format(slot.endDate, "yyyy-MM-dd") : "-"}
                            </td>
                            <td className="p-2 text-xs text-right">{days > 0 ? `${days} 日間` : "-"}</td>
                            <td className="p-2 text-xs text-right">¥ {netAmount.toLocaleString()}</td>
                            <td className="p-2 text-xs text-right">¥ {dailyBudget.toLocaleString()}</td>
                            <td className="p-2 text-xs">ウェブサイトアクセス</td>
                            <td className="p-2 text-xs">CPC</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setShowAddMaterialModal(false)}>
                  キャンセル
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!selectedCaseForMaterial}
                  onClick={() => setAddMaterialStep(2)}
                >
                  次へ
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              {/* ステップ2: 商材の設定 */}
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAddMaterialStep(1)}
                    className="p-1 hover:bg-muted rounded-md transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <DialogTitle>商材の設定</DialogTitle>
                </div>
              </DialogHeader>

              <div className="py-8 space-y-6">
                {/* 商材区分 */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold">商材区分</Label>
                  <Select value={newMaterialCategory} onValueChange={setNewMaterialCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialCategoryOptions.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">イベント、ポイント、オプション</p>
                </div>

                {/* 商材名 */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold">商材名</Label>
                  <Popover open={modalMaterialNameOpen} onOpenChange={setModalMaterialNameOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                        {newMaterialName || "商材名を選択または入力..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="商材名を入力..." onValueChange={(val) => setNewMaterialName(val)} />
                        <CommandList>
                          <CommandEmpty>
                            <button
                              type="button"
                              className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded"
                              onClick={() => setModalMaterialNameOpen(false)}
                            >
                              「{newMaterialName}」を使用
                            </button>
                          </CommandEmpty>
                          <CommandGroup>
                            {materialNameOptions.map(name => (
                              <CommandItem key={name} value={name} onSelect={() => {
                                setNewMaterialName(name);
                                setModalMaterialNameOpen(false);
                              }}>
                                <Check className={cn("mr-2 h-4 w-4", newMaterialName === name ? "opacity-100" : "opacity-0")} />
                                {name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">トリニティーガール、合同抽選会、LINE広告、お知らせバナー、メインバナーなど</p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddMaterialModal(false)}>
                  キャンセル
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!newMaterialCategory || !newMaterialName}
                  onClick={() => {
                    if (selectedCaseForMaterial && newMaterialCategory && newMaterialName) {
                      onAddNewMaterial?.(selectedCaseForMaterial, newMaterialCategory, newMaterialName);
                      setShowAddMaterialModal(false);
                      setAddMaterialStep(1);
                      setSelectedCaseForMaterial(null);
                      setNewMaterialCategory("");
                      setNewMaterialName("");
                    }
                  }}
                >
                  追加
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
