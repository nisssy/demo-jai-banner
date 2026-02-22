"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { NewCaseDialog } from "@/components/new-case-dialog";
import { useCaseStore } from "@/lib/case-store";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { 
  Eye, 
  Calendar as CalendarIcon, 
  MapPin, 
  DollarSign, 
  Search, 
  X, 
  FileText, 
  Plus, 
  Edit, 
  FilePlus 
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { initialCompanies, initialHalls, mockAreaSlots, type CaseStatus } from "@/lib/types";

interface CaseListProps {
  onSelectCase: (caseId: string) => void;
  onOpenCreateForm?: () => void;
  onAddMaterial?: (caseId: string) => void;
}

// 案件ID生成（表示用）
function getCaseDisplayId(index: number): string {
  return `${index + 1}`;
}

export function CaseList({ onSelectCase, onOpenCreateForm, onAddMaterial }: CaseListProps) {
  const { cases } = useCaseStore();
  const [activeTab, setActiveTab] = useState("list");

  // 検索条件の状態（UIのみ、機能は未実装）
  const [searchConditions, setSearchConditions] = useState({
    corporate: "",
    hall: "",
    area: "",
    status: "",
    category: "",
    event: "",
    dateStart: "",
    dateEnd: "",
    staff: "山田太郎",
    caseNo: "",
    caseName: "",
  });

  const areaGroups = [...new Set(mockAreaSlots.map((s) => s.areaGroup))];

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

  const clearSearch = () => {
    setSearchConditions({
      corporate: "",
      hall: "",
      area: "",
      status: "",
      category: "",
      event: "",
      dateStart: "",
      dateEnd: "",
      staff: "",
      caseNo: "",
      caseName: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* タブと新規作成ボタン */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between w-full border-b pb-0">
            <TabsList className="bg-transparent p-0 h-auto space-x-6">
              <TabsTrigger 
                value="list" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 py-2"
              >
                案件一覧
              </TabsTrigger>
              <TabsTrigger 
                value="request" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 py-2"
              >
                修正確認依頼
              </TabsTrigger>
              <TabsTrigger 
                value="unavailable" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 py-2"
              >
                仮押さえ不可
              </TabsTrigger>
            </TabsList>
            <NewCaseDialog onOpenCreateForm={onOpenCreateForm} />
          </div>
        </Tabs>
      </div>

      {/* 検索エリア */}
      <Card className="p-6 bg-muted/10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold text-lg">案件検索</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            複数の条件で案件を絞り込むことができます
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 法人 */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">法人</Label>
              <Select 
                value={searchConditions.corporate} 
                onValueChange={(val) => setSearchConditions({...searchConditions, corporate: val, hall: ""})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="法人を選択..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {initialCompanies.map((corp) => (
                    <SelectItem key={String(corp.id)} value={String(corp.id)}>
                      {corp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ホール */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">ホール</Label>
              <Select 
                value={searchConditions.hall} 
                onValueChange={(val) => setSearchConditions({...searchConditions, hall: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ホールを選択..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {(searchConditions.corporate && searchConditions.corporate !== "all"
                    ? initialHalls.filter((h) => h.companyId === Number(searchConditions.corporate))
                    : initialHalls
                  ).map((hall) => (
                    <SelectItem key={String(hall.id)} value={String(hall.id)}>
                      {hall.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {areaGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ステータス */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">ステータス</Label>
              <Select 
                value={searchConditions.status} 
                onValueChange={(val) => setSearchConditions({...searchConditions, status: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ステータスを選択..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 商品カテゴリ */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-bold">商品カテゴリ</Label>
              <Select 
                value={searchConditions.category} 
                onValueChange={(val) => setSearchConditions({...searchConditions, category: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="banner">バナー</SelectItem>
                  <SelectItem value="movie">動画</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* イベント区分 */}
            <div className="space-y-2">
              <Label htmlFor="event" className="text-xs font-bold">イベント区分</Label>
              <Select 
                value={searchConditions.event} 
                onValueChange={(val) => setSearchConditions({...searchConditions, event: val})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="イベント区分を検索..." />
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

            {/* 期間 */}
            <div className="space-y-2">
              <Label className="text-xs font-bold">期間</Label>
              <div className="flex gap-2 items-center">
                <Select defaultValue="date">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="実施日" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">実施日</SelectItem>
                    <SelectItem value="created">作成日</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1">
                    <Input 
                      placeholder="年 / 月 / 日" 
                      className="pl-8"
                      value={searchConditions.dateStart}
                      onChange={(e) => setSearchConditions({...searchConditions, dateStart: e.target.value})}
                    />
                    <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  <span>-</span>
                  <div className="relative flex-1">
                    <Input 
                      placeholder="年 / 月 / 日" 
                      className="pl-8"
                      value={searchConditions.dateEnd}
                      onChange={(e) => setSearchConditions({...searchConditions, dateEnd: e.target.value})}
                    />
                    <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
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
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">検索条件:</span>
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
            </div>
            <Button variant="outline" size="sm" onClick={clearSearch}>
              すべてクリア
            </Button>
          </div>
        </div>
      </Card>

      {/* 案件カード一覧 */}
      <div className="space-y-6">
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
              className="overflow-hidden border shadow-sm"
            >
              {/* カードヘッダー部分 */}
              <div className="p-6 border-b bg-card">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  {/* 左側：案件基本情報 */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                          {caseItem.corporateName} キャンペーン
                          <span className="text-lg font-normal text-muted-foreground">
                            案件No: {getCaseDisplayId(index)}
                          </span>
                          <Badge variant="secondary" className="font-normal text-xs">
                            {caseItem.proposalSlots.length}件の商材
                          </Badge>
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-20">法人名:</span>
                        <span className="font-medium">{caseItem.corporateName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-20">法人ID:</span>
                        <span className="font-mono">CORP-{String(index + 10).padStart(3, '0')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-20">ホール名:</span>
                        <span className="font-medium">{caseItem.storeName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-20">ホールID:</span>
                        <span className="font-mono">HALL-{String(index + 10).padStart(3, '0')}-01</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-20">担当営業:</span>
                        <span className="font-medium">山田 太郎</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-20">依頼日:</span>
                        <span className="font-medium">
                          {format(caseItem.createdAt, "yyyy/MM/dd", { locale: ja })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 右側：アクションボタン */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectCase(caseItem.id)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      案件を編集
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      見積書作成
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => onAddMaterial?.(caseItem.id)}
                    >
                      <Plus className="h-4 w-4" />
                      商材を追加
                    </Button>
                  </div>
                </div>
              </div>

              {/* 商材リスト部分（展開済みとして表示） */}
              <div className="bg-muted/5">
                {caseItem.proposalSlots.length > 0 ? (
                  <div className="divide-y">
                    {caseItem.proposalSlots.map((slot, slotIndex) => (
                      <div key={slot.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                          {/* 商材名・ステータス */}
                          <div className="col-span-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm truncate" title={slot.bannerType}>
                                {caseItem.corporateName} キャンペーン {slotIndex + 1}
                              </span>
                              <StatusBadge status={caseItem.status} />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              案件NO: {getCaseDisplayId(index)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {caseItem.storeName}
                            </div>
                          </div>

                          {/* 日付 */}
                          <div className="col-span-2 text-sm">
                            <div className="text-muted-foreground text-xs">実施日</div>
                            <div className="font-medium flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {format(slot.startDate, "yyyy/MM/dd", { locale: ja })}
                            </div>
                          </div>

                          {/* カテゴリ */}
                          <div className="col-span-2 text-sm">
                            <div className="text-muted-foreground text-xs">商材カテゴリ</div>
                            <div>{slot.bannerType}</div>
                          </div>

                          {/* イベント区分 */}
                          <div className="col-span-2 text-sm">
                            <div className="text-muted-foreground text-xs">イベント区分</div>
                            <div>イベント</div>
                          </div>

                          {/* 金額 */}
                          <div className="col-span-2 text-sm">
                            <div className="text-muted-foreground text-xs">見積金額</div>
                            <div className="font-bold">¥{caseItem.billingAmount?.toLocaleString() || "0"}</div>
                          </div>
                          
                          {/* 担当 */}
                          <div className="col-span-1 text-sm text-right">
                            <div className="text-muted-foreground text-xs">担当営業</div>
                            <div>山田 太郎</div>
                          </div>
                        </div>

                        {/* 受注済みスイッチ */}
                        <div className="ml-4 pl-4 border-l flex flex-col items-center gap-1">
                          <span className="text-xs text-muted-foreground">受注済み</span>
                          <Switch 
                            checked={caseItem.status === "掲載中"} 
                            onCheckedChange={() => {}} // ダミーハンドラ
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    商材が登録されていません
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
