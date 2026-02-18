"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Send,
  X,
  Play,
  AlertCircle,
  StopCircle,
  Calendar,
  Check,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SlotCalendar } from "@/components/slot-calendar";
import { ApplicationUpload } from "@/components/application-upload";
import { MaterialUpload } from "@/components/material-upload";
import { useCaseStore } from "@/lib/case-store";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import type { Case, ProposalSlot, MaterialFile } from "@/lib/types";
import { mockCorporations, mockAnniversaryPacks } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface CaseDetailProps {
  caseData: Case;
  onBack: () => void;
}

const circledNumbers =
  "\u2460\u2461\u2462\u2463\u2464\u2465\u2466\u2467\u2468\u2469";

interface MaterialState {
  id: string;
  isOpen: boolean;
  implementationPolicy: string;
  category: string;
  eventType: string;
  usageMethod: "anniversary" | "single" | "";
  selectedPackId: string;
  billingAmount: string;
}

export function CaseDetail({ caseData, onBack }: CaseDetailProps) {
  const {
    addProposalSlot,
    removeProposalSlot,
    updateCase,
    addMaterial,
    removeMaterial,
    uploadApplicationDocument,
    requestAdminReview,
    startPublishing,
    proceedToPublishing,
    skipProposal,
    confirmStopPublishing,
    approveCase,
    rejectCase,
    viewMode,
  } = useCaseStore();

  const [caseName, setCaseName] = useState(
    `${caseData.corporateName}キャンペーン`
  );
  const [staffName, setStaffName] = useState("荒井 さくら");
  const [requestDate, setRequestDate] = useState(
    format(caseData.createdAt, "yyyy-MM-dd")
  );

  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showProceedDialog, setShowProceedDialog] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [stopReason, setStopReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const initialTab =
    caseData.status === "提案中" || caseData.status === "見送り"
      ? "proposal"
      : "publishing";
  const [activeTab, setActiveTab] = useState(initialTab);

  const isAdmin = viewMode === "admin";
  const isReviewPending = caseData.adminReviewStatus === "pending";
  const isReviewApproved = caseData.adminReviewStatus === "approved";
  const isReviewRejected = caseData.adminReviewStatus === "rejected";
  const isPublishing = caseData.status === "掲載中";

  const handleApprove = () => {
    approveCase(caseData.id);
  };

  const handleReject = () => {
    if (!rejectComment.trim()) return;
    rejectCase(caseData.id, rejectComment);
    setShowRejectDialog(false);
    setRejectComment("");
  };

  const statusLabel = (() => {
    switch (caseData.status) {
      case "提案中":
        return "提案中";
      case "配信準備中":
        return "配信準備中";
      case "事務確認中":
        return "事務確認中";
      case "掲載中":
        return "掲載中";
      case "差し戻し":
        return "差し戻し";
      case "見送り":
        return "見送り";
      default:
        return caseData.status;
    }
  })();

  // 法人IDから周年パック取得
  const corpForPacks = mockCorporations.find(
    (c) => c.name === caseData.corporateName
  );
  const corporationPacks = corpForPacks
    ? mockAnniversaryPacks
        .filter((p) => p.corporationId === corpForPacks.id)
        .sort(
          (a, b) => a.expiryDate.getTime() - b.expiryDate.getTime()
        )
    : [];
  const hasPacks = corporationPacks.length > 0;
  const nearestPack = corporationPacks.length > 0 ? corporationPacks[0] : null;

  const [materialStates, setMaterialStates] = useState<MaterialState[]>(() => {
    if (caseData.proposalSlots.length === 0) return [];
    return caseData.proposalSlots.map((slot, idx) => ({
      id: slot.id,
      isOpen: idx === 0,
      implementationPolicy: caseData.implementationPolicy || "",
      category: "",
      eventType: "",
      usageMethod: "",
      selectedPackId: "",
      billingAmount: "",
    }));
  });

  const toggleMaterial = (id: string) => {
    setMaterialStates((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isOpen: !m.isOpen } : m))
    );
  };

  const updateMaterialField = (
    id: string,
    updates: Partial<MaterialState>
  ) => {
    setMaterialStates((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const handleAddMaterial = () => {
    const newSlotId = `slot-${Date.now()}`;
    const now = new Date();
    const newSlot: ProposalSlot = {
      id: newSlotId,
      startDate: now,
      endDate: now,
      startTime: "10:00",
      endTime: "18:00",
      bannerType: "メインバナー",
    };
    addProposalSlot(caseData.id, newSlot);
    setMaterialStates((prev) => [
      ...prev,
      {
        id: newSlotId,
        isOpen: true,
        implementationPolicy: "",
        category: "",
        eventType: "",
        usageMethod: "",
        selectedPackId: "",
        billingAmount: "",
      },
    ]);
  };

  /* ---------- Step 1 handlers ---------- */
  const handleAddSlot = (slot: ProposalSlot) => {
    addProposalSlot(caseData.id, slot);
  };

  const handleRemoveSlot = (slotId: string) => {
    removeProposalSlot(caseData.id, slotId);
  };

  const handleSavePolicy = (materialId: string) => {
    const ms = materialStates.find((m) => m.id === materialId);
    if (ms) {
      updateCase(caseData.id, { implementationPolicy: ms.implementationPolicy });
    }
  };

  const handleProceed = () => {
    materialStates.forEach((m) => {
      if (m.implementationPolicy) {
        updateCase(caseData.id, {
          implementationPolicy: m.implementationPolicy,
        });
      }
    });
    proceedToPublishing(caseData.id);
    setShowProceedDialog(false);
    setActiveTab("publishing");
  };

  const handleSkip = () => {
    skipProposal(caseData.id);
    setShowSkipDialog(false);
  };

  /* ---------- Step 2 handlers ---------- */
  const handleUploadApplication = (url: string) => {
    uploadApplicationDocument(caseData.id, url);
  };

  const handleRemoveApplication = () => {
    updateCase(caseData.id, { applicationDocumentUrl: undefined });
  };

  const handleAddMaterialFile = (material: MaterialFile) => {
    addMaterial(caseData.id, material);
  };

  const handleRemoveMaterialFile = (materialId: string) => {
    removeMaterial(caseData.id, materialId);
  };

  const handleRequestReview = () => {
    requestAdminReview(caseData.id);
  };

  const handleStartPublishing = () => {
    startPublishing(caseData.id);
  };

  const generateStopRequestText = () => {
    const slotLines = caseData.proposalSlots
      .map(
        (s) =>
          `  - ${s.areaName || "未設定"} / ${format(s.startDate, "yyyy/MM/dd", { locale: ja })} ${s.startTime || ""} 〜 ${format(s.endDate, "yyyy/MM/dd", { locale: ja })} ${s.endTime || ""} (${s.bannerType})`
      )
      .join("\n");
    return `以下の案件について掲載停止を依頼いたします。\n\n案件ID: ${caseData.id}\n法人名: ${caseData.corporateName}\n店舗名: ${caseData.storeName}\n\n対象掲載枠:\n${slotLines || "  （掲載枠なし）"}\n\n管理画面の設定を削除し、カレンダーの枠を解放してください。`;
  };

  const handleStopPublishing = () => {
    confirmStopPublishing(caseData.id);
    setShowStopDialog(false);
    setStopReason("");
  };

  const getBannerTypeColor = (type: string) => {
    switch (type) {
      case "静止画":
        return "bg-blue-100 text-blue-800";
      case "動画":
        return "bg-red-100 text-red-800";
      case "GIF":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const corpIndex = mockCorporations.findIndex(
    (c) => c.name === caseData.corporateName
  );
  const corpId =
    corpIndex >= 0
      ? `CORP-${String(corpIndex + 10).padStart(3, "0")}`
      : "CORP-001";
  const hallId = `${corpId}-HALL-03`;

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
        <h1 className="text-2xl font-bold">案件編集</h1>
        <Badge
          variant="secondary"
          className={
            caseData.status === "掲載中"
              ? "bg-green-600 text-white"
              : caseData.status === "差し戻し"
                ? "bg-red-100 text-red-800"
                : caseData.status === "事務確認中"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-blue-100 text-blue-800"
          }
        >
          {statusLabel}
        </Badge>
      </div>

      {/* 差し戻し通知 */}
      {isReviewRejected && caseData.adminReviewComment && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>不備内容</AlertTitle>
          <AlertDescription className="mt-2">
            {caseData.adminReviewComment}
          </AlertDescription>
        </Alert>
      )}

      {/* ===== 基本情報カード ===== */}
      <Card className="p-6">
        <h2 className="text-lg font-bold mb-6">基本情報</h2>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm">法人名</Label>
              <Select defaultValue={caseData.corporateName}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockCorporations.map((corp) => (
                    <SelectItem key={corp.id} value={corp.name}>
                      {corp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">法人ID</Label>
              <Input value={corpId} readOnly className="bg-muted/30" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm">ホール名</Label>
              <Select defaultValue={caseData.storeName}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={caseData.storeName}>
                    {caseData.storeName}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">ホールID</Label>
              <Input value={hallId} readOnly className="bg-muted/30" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">案件名</Label>
            <Input
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm">ホール担当営業</Label>
              <Input
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
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

      {/* ===== 商材情報セクション ===== */}
      {materialStates.map((material, idx) => {
        const thisSlot = caseData.proposalSlots.find(
          (s) => s.id === material.id
        );
        const slotMaterials = (caseData.materials || []).filter(
          (m) => m.slotId === material.id
        );

        return (
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
                  {/* ===== カテゴリ・イベント区分・利用方法 ===== */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">カテゴリ</Label>
                        <Select
                          value={material.category || undefined}
                          onValueChange={(val) =>
                            updateMaterialField(material.id, {
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
                        <Label className="text-sm font-medium">
                          イベント区分
                        </Label>
                        <Select
                          value={material.eventType || undefined}
                          onValueChange={(val) => {
                            const defaultMethod = hasPacks
                              ? "anniversary"
                              : "single";
                            const defaultPack =
                              hasPacks && nearestPack ? nearestPack.id : "";
                            updateMaterialField(material.id, {
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
                            <SelectItem value="未定">未定</SelectItem>
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
                    {material.eventType && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <Label className="text-sm font-medium">
                            利用方法
                          </Label>
                          <RadioGroup
                            value={material.usageMethod}
                            onValueChange={(val) => {
                              const updates: Partial<MaterialState> = {
                                usageMethod: val as "anniversary" | "single",
                              };
                              if (val === "anniversary" && nearestPack) {
                                updates.selectedPackId = nearestPack.id;
                                updates.billingAmount = "";
                              } else if (val === "single") {
                                updates.selectedPackId = "";
                              }
                              updateMaterialField(material.id, updates);
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
                                id={`usage-anniversary-${material.id}`}
                                disabled={!hasPacks}
                                className="mt-0.5"
                              />
                              <div className="flex-1 space-y-3">
                                <Label
                                  htmlFor={`usage-anniversary-${material.id}`}
                                  className={`text-sm font-medium ${!hasPacks ? "cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                  周年パックで実施
                                </Label>
                                {!hasPacks && (
                                  <p className="text-xs text-muted-foreground">
                                    この法人は周年パックを購入していません
                                  </p>
                                )}

                                {/* パック選択（周年パック選択時 & パックがある場合） */}
                                {material.usageMethod === "anniversary" &&
                                  hasPacks && (
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
                                            updateMaterialField(material.id, {
                                              selectedPackId: pack.id,
                                            })
                                          }
                                        >
                                          <div className="flex items-center gap-3">
                                            <div
                                              className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                                material.selectedPackId ===
                                                pack.id
                                                  ? "border-blue-500"
                                                  : "border-muted-foreground/40"
                                              }`}
                                            >
                                              {material.selectedPackId ===
                                                pack.id && (
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                              )}
                                            </div>
                                            <span className="text-sm font-medium">
                                              {pack.title}
                                            </span>
                                          </div>
                                          <span className="text-xs text-muted-foreground">
                                            有効期限:{" "}
                                            {format(
                                              pack.expiryDate,
                                              "yyyy/MM/dd",
                                              { locale: ja }
                                            )}
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
                                id={`usage-single-${material.id}`}
                                className="mt-0.5"
                              />
                              <div className="flex-1 space-y-3">
                                <Label
                                  htmlFor={`usage-single-${material.id}`}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  単発で実施
                                </Label>

                                {/* 請求額（単発選択時に表示） */}
                                {material.usageMethod === "single" && (
                                  <div className="space-y-2 pt-1">
                                    <Label
                                      htmlFor={`billing-${material.id}`}
                                      className="text-xs text-muted-foreground"
                                    >
                                      請求額
                                    </Label>
                                    <div className="relative max-w-xs">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                        ¥
                                      </span>
                                      <Input
                                        id={`billing-${material.id}`}
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="0"
                                        className="pl-7"
                                        value={material.billingAmount}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(
                                            /[^0-9]/g,
                                            ""
                                          );
                                          updateMaterialField(material.id, {
                                            billingAmount: val,
                                          });
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
                    )}
                  </div>

                  {/* ===== Step1/Step2 タブ ===== */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="proposal">
                        ステップ1 提案
                      </TabsTrigger>
                      <TabsTrigger value="publishing">
                        ステップ2 掲載
                      </TabsTrigger>
                    </TabsList>

                    {/* ===== ステップ1 提案 ===== */}
                    <TabsContent value="proposal" className="space-y-6 mt-6">
                      {/* 提案内容 - 掲載日時とバナー種別 */}
                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          掲載日時とバナー種別
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          カレンダー上でドラッグしてバナー種別の選択と期間の選択ができます（複数選択可能）
                        </p>
                        <SlotCalendar
                          selectedSlots={caseData.proposalSlots}
                          onAddSlot={handleAddSlot}
                          onRemoveSlot={handleRemoveSlot}
                          aiRecommendedSlots={caseData.aiRecommendedSlots}
                        />
                      </div>

                      {/* フッターボタン（登録/キャンセル） */}
                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={onBack}>
                          キャンセル
                        </Button>
                        <Button
                          onClick={() => handleSavePolicy(material.id)}
                        >
                          登録
                        </Button>
                      </div>

                      {/* 実施方針 */}
                      <Card className="p-0 border">
                        <div className="p-6 space-y-4">
                          <div>
                            <h3 className="text-base font-semibold">
                              実施方針
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              顧客からの回答を記録してください
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`policy-${material.id}`}>
                              顧客回答
                            </Label>
                            <Textarea
                              id={`policy-${material.id}`}
                              placeholder="顧客からの回答内容を入力してください..."
                              value={material.implementationPolicy}
                              onChange={(e) =>
                                setMaterialStates((prev) =>
                                  prev.map((m) =>
                                    m.id === material.id
                                      ? {
                                          ...m,
                                          implementationPolicy: e.target.value,
                                        }
                                      : m
                                  )
                                )
                              }
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={() => setShowProceedDialog(true)}
                              className="flex-1"
                            >
                              <Send className="mr-2 h-4 w-4" />
                              配信を進める
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowSkipDialog(true)}
                              className="flex-1"
                            >
                              <X className="mr-2 h-4 w-4" />
                              見送る
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </TabsContent>

                    {/* ===== ステップ2 掲載 ===== */}
                    <TabsContent value="publishing" className="space-y-6 mt-6">
                      {isAdmin ? (
                        <>
                          {/* ===== 事務側 ===== */}
                          <Card className="border">
                            <div className="p-6 space-y-6">
                              <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold flex items-center gap-2">
                                  基本情報
                                  <Badge className="bg-purple-100 text-purple-800">
                                    {caseData.status === "事務確認中"
                                      ? "確認待ち"
                                      : isReviewApproved
                                        ? "承認済み"
                                        : isReviewRejected
                                          ? "差し戻し済み"
                                          : caseData.status}
                                  </Badge>
                                </h3>
                              </div>

                              {/* 申込書（読み取り専用） */}
                              {(() => {
                                const isAnniversary = material.usageMethod === "anniversary";
                                const selectedPack = isAnniversary
                                  ? corporationPacks.find((p) => p.id === material.selectedPackId)
                                  : null;
                                return (
                                  <ApplicationUpload
                                    documentUrl={caseData.applicationDocumentUrl}
                                    onUpload={() => {}}
                                    onRemove={() => {}}
                                    readOnly={true}
                                    alwaysShowData={true}
                                    isAnniversaryPack={isAnniversary}
                                    anniversaryPackTitle={selectedPack?.title}
                                    anniversaryPackExpiry={
                                      selectedPack
                                        ? format(selectedPack.expiryDate, "yyyy/MM/dd", { locale: ja })
                                        : undefined
                                    }
                                  />
                                );
                              })()}
                            </div>
                          </Card>

                          {/* 掲載内容（カレンダーUI・読み取り専用） */}
                          <Card className="border">
                            <div className="p-6 space-y-4">
                              <div>
                                <h3 className="text-base font-semibold">掲載内容</h3>
                                <p className="text-sm text-muted-foreground">
                                  営業が入力した掲載日程とバナー種別
                                </p>
                              </div>
                              {thisSlot && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    選択された提案日程
                                  </h4>
                                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                                    <p className="text-sm font-medium">
                                      {format(thisSlot.startDate, "yyyy/MM/dd", { locale: ja })}
                                      {thisSlot.startTime && ` ${thisSlot.startTime}`}
                                      {" - "}
                                      {format(thisSlot.endDate, "yyyy/MM/dd", { locale: ja })}
                                      {thisSlot.endTime && ` ${thisSlot.endTime}`}
                                    </p>
                                    <Badge className={getBannerTypeColor(thisSlot.bannerType)}>
                                      {thisSlot.bannerType}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                              <SlotCalendar
                                selectedSlots={thisSlot ? [thisSlot] : []}
                                onAddSlot={() => {}}
                                onRemoveSlot={() => {}}
                                readOnly={true}
                              />
                            </div>
                          </Card>

                          {/* 掲載素材（読み取り専用） */}
                          <MaterialUpload
                            materials={slotMaterials}
                            proposalSlots={thisSlot ? [thisSlot] : []}
                            onAddMaterial={() => {}}
                            onRemoveMaterial={() => {}}
                            readOnly={true}
                          />

                          {/* 承認・差し戻しボタン */}
                          {isReviewPending && (
                            <div className="flex justify-between pt-4 border-t">
                              <Button variant="outline" onClick={onBack}>
                                戻る
                              </Button>
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowRejectDialog(true)}
                                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <AlertCircle className="mr-2 h-4 w-4" />
                                  差し戻し
                                </Button>
                                <Button
                                  onClick={handleApprove}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  承認
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* 承認済み / 差し戻し済みの場合 */}
                          {!isReviewPending && (
                            <div className="flex justify-between pt-4 border-t">
                              <Button variant="outline" onClick={onBack}>
                                戻る
                              </Button>
                              {isReviewApproved && (
                                <Badge className="bg-green-100 text-green-800 text-sm px-4 py-2">
                                  <Check className="mr-1.5 h-4 w-4" />
                                  承認済み
                                </Badge>
                              )}
                              {isReviewRejected && (
                                <Badge variant="destructive" className="text-sm px-4 py-2">
                                  <AlertCircle className="mr-1.5 h-4 w-4" />
                                  差し戻し済み
                                </Badge>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          {/* ===== 営業側 ===== */}
                          {/* 差し戻し通知 */}
                          {isReviewRejected && caseData.adminReviewComment && (
                            <Alert variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertTitle className="flex items-center gap-2">
                                不備内容
                              </AlertTitle>
                              <AlertDescription className="mt-2">
                                {caseData.adminReviewComment}
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* 基本情報（申込書 + ステータス） */}
                          <Card className="border">
                            <div className="p-6 space-y-6">
                              <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold flex items-center gap-2">
                                  基本情報
                                  {isReviewPending && (
                                    <Badge className="bg-purple-100 text-purple-800">
                                      事務確認中
                                    </Badge>
                                  )}
                                  {isReviewRejected && (
                                    <Badge variant="destructive">差し戻し</Badge>
                                  )}
                                </h3>
                              </div>

                              {/* 申込書 */}
                              {(() => {
                                const isAnniversary = material.usageMethod === "anniversary";
                                const selectedPack = isAnniversary
                                  ? corporationPacks.find((p) => p.id === material.selectedPackId)
                                  : null;
                                return (
                                  <ApplicationUpload
                                    documentUrl={caseData.applicationDocumentUrl}
                                    onUpload={handleUploadApplication}
                                    onRemove={handleRemoveApplication}
                                    readOnly={isReviewPending}
                                    alwaysShowData={true}
                                    isAnniversaryPack={isAnniversary}
                                    anniversaryPackTitle={selectedPack?.title}
                                    anniversaryPackExpiry={
                                      selectedPack
                                        ? format(selectedPack.expiryDate, "yyyy/MM/dd", { locale: ja })
                                        : undefined
                                    }
                                  />
                                );
                              })()}
                            </div>
                          </Card>

                          {/* 掲載内容 */}
                          <Card className="border">
                            <div className="p-6 space-y-4">
                              <div>
                                <h3 className="text-base font-semibold">
                                  掲載内容
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  提案時に入力した掲載日程とバナー種別
                                </p>
                              </div>

                              {thisSlot && (
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    選択された提案日程
                                  </h4>
                                  <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                                    <p className="text-sm font-medium">
                                      {format(thisSlot.startDate, "yyyy/MM/dd", {
                                        locale: ja,
                                      })}
                                      {thisSlot.startTime &&
                                        ` ${thisSlot.startTime}`}
                                      {" - "}
                                      {format(thisSlot.endDate, "yyyy/MM/dd", {
                                        locale: ja,
                                      })}
                                      {thisSlot.endTime && ` ${thisSlot.endTime}`}
                                    </p>
                                    <Badge
                                      className={getBannerTypeColor(
                                        thisSlot.bannerType
                                      )}
                                    >
                                      {thisSlot.bannerType}
                                    </Badge>
                                  </div>
                                </div>
                              )}

                              <SlotCalendar
                                selectedSlots={thisSlot ? [thisSlot] : []}
                                onAddSlot={() => {}}
                                onRemoveSlot={() => {}}
                                readOnly={true}
                              />
                            </div>
                          </Card>

                          {/* 掲載素材 */}
                          <MaterialUpload
                            materials={slotMaterials}
                            proposalSlots={thisSlot ? [thisSlot] : []}
                            onAddMaterial={handleAddMaterialFile}
                            onRemoveMaterial={handleRemoveMaterialFile}
                            readOnly={isReviewPending}
                            deadlineText="最終期限は1営業日前の15時必着。動画の期限は6営業日前"
                          />

                          {/* アクションボタン */}
                          <div className="flex justify-between pt-4 border-t">
                            <Button variant="outline" onClick={onBack}>
                              キャンセル
                            </Button>
                            <div className="flex gap-3">
                              {!isReviewPending && !isPublishing && (
                                <Button onClick={handleRequestReview}>
                                  <Send className="mr-2 h-4 w-4" />
                                  事務へ確認依頼
                                </Button>
                              )}
                              {isReviewApproved && !isPublishing && (
                                <Button
                                  onClick={handleStartPublishing}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  掲載を開始
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* 掲載停止セクション（掲載中のみ表示） */}
                          {isPublishing && (
                            <Card className="border-orange-200 bg-orange-50">
                              <div className="p-6 space-y-4">
                                <div>
                                  <h3 className="text-base font-semibold text-orange-800">
                                    掲載停止
                                  </h3>
                                  <p className="text-sm text-orange-700">
                                    事務へ掲載停止を依頼します。依頼後、管理画面の設定が削除されカレンダーの枠が解放されます。
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-orange-800">
                                    事務への掲載停止依頼文（自動生成）
                                  </Label>
                                  <Textarea
                                    value={stopReason || generateStopRequestText()}
                                    onChange={(e) => setStopReason(e.target.value)}
                                    rows={8}
                                    className="bg-white border-orange-200 text-sm"
                                  />
                                </div>

                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    if (!stopReason) {
                                      setStopReason(generateStopRequestText());
                                    }
                                    setShowStopDialog(true);
                                  }}
                                >
                                  <StopCircle className="mr-2 h-4 w-4" />
                                  事務へ掲載停止を依頼
                                </Button>
                              </div>
                            </Card>
                          )}
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

      {/* 商材がない場合のメッセージ */}
      {materialStates.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground text-sm">
            商材が登録されていません。「商材を追加」ボタンから商材を追加してください。
          </p>
        </Card>
      )}

      {/* 商材追加ボタン */}
      <div className="flex justify-center pb-8">
        <Button
          variant="outline"
          onClick={handleAddMaterial}
          className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" />
          商材を追加
        </Button>
      </div>

      {/* ===== 確認ダイアログ群 ===== */}

      {/* 見送り確認 */}
      <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>案件を見送りますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この案件を見送りにすると、一覧で「見送り」のラベルが表示されます。この操作は後から取り消すことができます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleSkip}>見送る</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 配信進める確認 */}
      <AlertDialog
        open={showProceedDialog}
        onOpenChange={setShowProceedDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>配信準備に進みますか？</AlertDialogTitle>
            <AlertDialogDescription>
              申込書送付のステップに進みます。一覧で「配信準備中」のラベルが表示されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleProceed}>
              進める
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 掲載停止確認 */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>本当に掲載停止してよろしいですか？</DialogTitle>
            <DialogDescription>
              以下の内容が実行されます。この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* 削除・解放される内容 */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <StopCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>管理画面の掲載設定を<span className="font-semibold text-red-600">削除</span>します</span>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                  <span>カレンダーの掲載枠を<span className="font-semibold text-orange-600">解放</span>します</span>
                </div>
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">案件ID:</span> {caseData.id}</p>
                <p><span className="font-medium text-foreground">法人名:</span> {caseData.corporateName}</p>
                <p><span className="font-medium text-foreground">店舗名:</span> {caseData.storeName}</p>
                {caseData.proposalSlots.length > 0 && (
                  <div>
                    <p className="font-medium text-foreground mb-1">対象掲載枠:</p>
                    {caseData.proposalSlots.map((s) => (
                      <p key={s.id} className="ml-3">
                        {s.areaName || "未設定"} / {format(s.startDate, "yyyy/MM/dd", { locale: ja })} 〜 {format(s.endDate, "yyyy/MM/dd", { locale: ja })} ({s.bannerType})
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStopDialog(false)}
            >
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleStopPublishing}>
              掲載を停止する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 差し戻しモーダル（事務側） */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>差し戻し</DialogTitle>
            <DialogDescription>
              不備内容を入力して営業へ差し戻してください。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reject-comment">不備内容</Label>
              <Textarea
                id="reject-comment"
                placeholder="不備の内容を具体的に入力してください..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectComment("");
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectComment.trim()}
            >
              差し戻す
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
