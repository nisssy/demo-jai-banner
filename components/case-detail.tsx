"use client";

import { useState, useEffect, useRef } from "react";
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
  FileText,
  ClipboardList,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ApplicationUpload } from "@/components/application-upload";
import { MaterialUpload } from "@/components/material-upload";
import { CaseChat } from "@/components/case-chat";
import { StatusBadge } from "@/components/status-badge";
import { useCaseStore } from "@/lib/case-store";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import type { Case, ProposalSlot, MaterialFile } from "@/lib/types";
import {
  mockAnniversaryPacks,
  initialCompanies,
  initialHalls,
  findOverlappingSlots,
  bannerTypeOptions,
  eventTypeOptions,
} from "@/lib/types";
import type { CompanyData, HallData } from "@/lib/types";
import { CompanyHallCombobox } from "@/components/company-hall-combobox";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface CaseDetailProps {
  caseData: Case;
  onBack: () => void;
  onBackToList?: () => void;
  initialSlotId?: string | null;
  viewType?: "case" | "record";
  onOpenRecord?: (slotId: string) => void;
  onDuplicate?: (newCaseId: string) => void;
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

export function CaseDetail({ caseData, onBack, onBackToList, initialSlotId, viewType = "case", onOpenRecord, onDuplicate }: CaseDetailProps) {
  const {
    addProposalSlot,
    removeProposalSlot,
    updateProposalSlot,
    updateCase,
    addMaterial,
    removeMaterial,
    uploadApplicationDocument,
    requestAdminReview,
    startPublishing,
    proceedToPublishing,
    skipProposal,
    confirmStopPublishing,
    requestStopPublishing,
    approveCase,
    rejectCase,
    duplicateCase,
    viewMode,
  } = useCaseStore();

  const [caseName, setCaseName] = useState(
    `${caseData.corporateName}キャンペーン`
  );
  const [staffName, setStaffName] = useState("荒井 さくら");
  const [requestDate, setRequestDate] = useState(
    format(caseData.createdAt, "yyyy-MM-dd")
  );

  const matchedCompany = initialCompanies.find(
    (c) => c.name === caseData.corporateName
  ) ?? null;
  const matchedHall = initialHalls.find(
    (h) => h.name === caseData.storeName && (matchedCompany ? h.companyId === matchedCompany.id : true)
  ) ?? null;
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(matchedCompany);
  const [selectedHall, setSelectedHall] = useState<HallData | null>(matchedHall);

  // 法人名・ホール名の変更をストアに同期
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const updates: Partial<Case> = {};
    if (selectedCompany && selectedCompany.name !== caseData.corporateName) {
      updates.corporateName = selectedCompany.name;
    }
    if (selectedHall && selectedHall.name !== caseData.storeName) {
      updates.storeName = selectedHall.name;
    }
    if (Object.keys(updates).length > 0) {
      updateCase(caseData.id, updates);
    }
  }, [selectedCompany, selectedHall]);

  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showProceedDialog, setShowProceedDialog] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [stopReason, setStopReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [showApplicationInfoModal, setShowApplicationInfoModal] = useState(false);
  const [publishingAdditionalRows, setPublishingAdditionalRows] = useState<number[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});
  const [uploadedImageUrls, setUploadedImageUrls] = useState<Record<string, string>>({});
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [activeRecordSlotId, setActiveRecordSlotId] = useState<string | null>(initialSlotId ?? null);

  useEffect(() => {
    setActiveRecordSlotId(initialSlotId ?? null);
  }, [initialSlotId]);

  // materialStatesにエントリがないスロットを動的に追加
  useEffect(() => {
    if (!activeRecordSlotId) return;
    setMaterialStates((prev) => {
      if (prev.some((m) => m.id === activeRecordSlotId)) return prev;
      return [
        ...prev,
        {
          id: activeRecordSlotId,
          isOpen: true,
          implementationPolicy: caseData.implementationPolicy || "",
          category: "",
          eventType: "",
          usageMethod: "" as "" | "anniversary" | "single",
          selectedPackId: "",
          billingAmount: "",
        },
      ];
    });
  }, [activeRecordSlotId, caseData.implementationPolicy]);

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
    startPublishing(caseData.id);
    onBack();
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

  // 法人IDから周年パック取得（mockAnniversaryPacksのcorporationIdは旧形式"corp-1"等）
  const legacyCorporationId = selectedCompany
    ? `corp-${selectedCompany.id}`
    : null;
  const corporationPacks = legacyCorporationId
    ? mockAnniversaryPacks
        .filter((p) => p.corporationId === legacyCorporationId)
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
    setMaterialStates((prev) => {
      const newStates = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));

      // 請求額・周年パック情報をストアに同期
      if ("billingAmount" in updates || "usageMethod" in updates || "selectedPackId" in updates) {
        const totalBilling = newStates.reduce((sum, m) => {
          const amount = m.billingAmount ? Number(m.billingAmount) : 0;
          return sum + amount;
        }, 0);
        const hasAnniversary = newStates.some((m) => m.usageMethod === "anniversary");
        const anniversaryPackId = newStates.find((m) => m.selectedPackId)?.selectedPackId;
        updateCase(caseData.id, {
          billingAmount: totalBilling || undefined,
          isAnniversaryPack: hasAnniversary || undefined,
          anniversaryPackCode: anniversaryPackId || undefined,
        });
      }

      return newStates;
    });
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

  const handleUpdateSlot = (slotId: string, updates: Partial<ProposalSlot>) => {
    // 日付変更時に重複チェック
    if (updates.startDate || updates.endDate) {
      const currentSlot = caseData.proposalSlots.find((s) => s.id === slotId);
      if (currentSlot) {
        const newStart = updates.startDate || currentSlot.startDate;
        const newEnd = updates.endDate || currentSlot.endDate;
        const overlapping = findOverlappingSlots(
          caseData.proposalSlots,
          newStart,
          newEnd,
          slotId
        );
        if (overlapping.length > 0) {
          alert("他の枠と日程が重複しています。別の日程を選択してください。");
          return;
        }
      }
    }
    updateProposalSlot(caseData.id, slotId, updates);
  };

  const handleAddSlotFromMaterial = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newSlot: ProposalSlot = {
      id: `slot-${Date.now()}`,
      startDate: today,
      endDate: tomorrow,
      bannerType: "メインバナー",
    };

    // 重複チェック
    const overlapping = findOverlappingSlots(
      caseData.proposalSlots,
      newSlot.startDate,
      newSlot.endDate
    );
    if (overlapping.length > 0) {
      alert("デフォルトの日程が既存枠と重複しています。追加後に日程を調整してください。");
    }

    addProposalSlot(caseData.id, newSlot);
  };

  const handleSavePolicy = (materialId: string) => {
    const ms = materialStates.find((m) => m.id === materialId);
    if (ms) {
      updateCase(caseData.id, { implementationPolicy: ms.implementationPolicy });
    }
  };

  const handleRegisterProposal = (materialId: string) => {
    handleSavePolicy(materialId);
    updateCase(caseData.id, { status: "提案中" });
    onBack();
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
    if (isAdmin) {
      confirmStopPublishing(caseData.id);
    } else {
      const reason = stopReason || generateStopRequestText();
      requestStopPublishing(caseData.id, reason);
    }
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

  const corpId = selectedCompany?.companyId ?? "";
  const hallId = selectedHall?.hallId ?? "";
  const hallSalesPerson = selectedHall?.salesPersonName ?? "";

  // レコード詳細表示の対象スロット
  const activeSlot = activeRecordSlotId
    ? caseData.proposalSlots.find(s => s.id === activeRecordSlotId)
    : null;

  // ステッパーのステップ定義
  const stepperSteps = [
    { label: "実施方針", done: caseData.status !== "提案中" && caseData.status !== "提案前" && caseData.status !== "見送り" },
    { label: "申込書送付", done: !!caseData.applicationDocumentUrl || caseData.status === "掲載中" || caseData.status === "掲載停止" || caseData.status === "掲載停止依頼中" },
    { label: "掲載", done: caseData.status === "掲載中" || caseData.status === "掲載停止" || caseData.status === "掲載停止依頼中" },
  ];

  // 商材詳細のアクティブステップ
  const [activeStepperStep, setActiveStepperStep] = useState(() => {
    const firstIncomplete = stepperSteps.findIndex(s => !s.done);
    return firstIncomplete === -1 ? stepperSteps.length - 1 : firstIncomplete;
  });

  const projectStatusColor = (() => {
    switch (caseData.projectStatus) {
      case "提案中": return "bg-yellow-100 text-yellow-800";
      case "進行中": return "bg-blue-100 text-blue-800";
      case "完了": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  })();

  // レコード詳細ビュー
  if (viewType === "record" && activeSlot) {
    const slotMaterialState = materialStates.find(m => m.id === activeSlot.id);

    return (
      <div className="space-y-6">
        {/* ステッパー + ステータス + 申し込み情報ボタン（固定表示） */}
        <div className="sticky top-0 z-10 bg-white border-b pb-4 pt-2 -mx-8 px-8 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-1 hover:bg-muted rounded-md transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-bold">
                レコード詳細
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  #{activeSlot.recordNumber || "-"}
                </span>
              </h1>
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
            <div className="flex items-center gap-2">
              {caseData.applicationDocumentUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApplicationInfoModal(true)}
                  className="gap-1"
                >
                  <ClipboardList className="h-4 w-4" />
                  申し込み情報
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onBackToList || onBack}>
                一覧に戻る
              </Button>
            </div>
          </div>

          {/* ステッパー（添付3のデザイン） */}
          <div className="flex items-center justify-center gap-0 mt-2">
            {stepperSteps.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveStepperStep(i)}
                  className="flex flex-col items-center gap-2 min-w-[140px]"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-colors",
                    i === activeStepperStep
                      ? step.done
                        ? "border-green-500 text-green-600 bg-green-50 ring-2 ring-green-200"
                        : "border-blue-500 text-blue-600 bg-blue-50 ring-2 ring-blue-200"
                      : step.done
                        ? "border-green-500 text-green-600 bg-white"
                        : "border-gray-300 text-gray-400 bg-white"
                  )}>
                    {i + 1}
                  </div>
                  <span className={cn(
                    "text-xs font-medium text-center",
                    i === activeStepperStep
                      ? step.done ? "text-green-700 font-bold" : "text-blue-700 font-bold"
                      : step.done ? "text-green-600" : "text-gray-400"
                  )}>
                    {step.label}
                  </span>
                </button>
                {i < stepperSteps.length - 1 && (
                  <div className={cn("w-16 h-0.5 mb-6", step.done ? "bg-green-400" : "bg-gray-200")} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 左メインカラム + 右チャットカラム */}
        <div className="flex gap-6">
        <div className="flex-1 min-w-0 space-y-6">

        {/* レコード基本情報 */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">レコード情報</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">レコード番号:</span>
              <span className="ml-2 font-mono font-medium">{activeSlot.recordNumber || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">案件番号:</span>
              <button
                type="button"
                className="ml-2 text-blue-600 hover:underline font-medium"
                onClick={onBack}
              >
                {caseData.caseNumber || "-"}
              </button>
            </div>
            <div>
              <span className="text-muted-foreground">商材区分:</span>
              <span className="ml-2">{activeSlot.materialCategory || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">商材名:</span>
              <span className="ml-2">{activeSlot.materialName || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">バナー種別:</span>
              <span className="ml-2">{activeSlot.bannerType}</span>
            </div>
            <div>
              <span className="text-muted-foreground">エリア:</span>
              <span className="ml-2">{activeSlot.areaName || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">掲載開始日:</span>
              <span className="ml-2">{format(activeSlot.startDate, "yyyy/MM/dd", { locale: ja })}</span>
            </div>
            <div>
              <span className="text-muted-foreground">掲載終了日:</span>
              <span className="ml-2">{format(activeSlot.endDate, "yyyy/MM/dd", { locale: ja })}</span>
            </div>
            <div>
              <span className="text-muted-foreground">法人名:</span>
              <span className="ml-2">{caseData.corporateName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ホール名:</span>
              <span className="ml-2">{caseData.storeName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">担当営業:</span>
              <span className="ml-2">{caseData.salesPersonName || "山田 太郎"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">依頼日:</span>
              <span className="ml-2">{format(caseData.createdAt, "yyyy/MM/dd", { locale: ja })}</span>
            </div>
          </div>
        </Card>

        {/* ステッパーに対応したコンテンツ */}
        {slotMaterialState && (
          <div className="space-y-6">
            {/* ステップ1: 実施方針 */}
            {activeStepperStep === 0 && (
              <Card className="p-6 space-y-6">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  実施方針
                  {isReviewPending && <Badge className="bg-purple-100 text-purple-800">事務確認中</Badge>}
                  {isReviewRejected && <Badge variant="destructive">差し戻し</Badge>}
                </h3>
                <p className="text-sm text-muted-foreground">顧客からの回答を記録してください</p>

                <div className="space-y-3">
                  <Textarea
                    placeholder="顧客からの回答内容を入力..."
                    value={slotMaterialState.implementationPolicy || ""}
                    onChange={(e) => updateMaterialField(slotMaterialState.id, { implementationPolicy: e.target.value })}
                    rows={6}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowSkipDialog(true)}>
                    見送る
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setActiveStepperStep(1)}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    配信を進める
                  </Button>
                </div>
              </Card>
            )}

            {/* ステップ2: 申込書送付 + 基本情報登録 */}
            {activeStepperStep === 1 && (
              <Card className="p-6 space-y-6">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  申込書送付
                </h3>

                {/* 顧客へメール送信 */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    顧客へメール送信
                  </h4>
                  <div className="bg-blue-50 border border-blue-100 rounded px-3 py-2 text-sm flex items-center justify-between">
                    <span className="text-blue-700 underline cursor-pointer">📎 LINE広告申込書.xlsx</span>
                    <span className="text-xs text-muted-foreground">(クリックでプレビュー)</span>
                  </div>
                  <div className="border rounded p-3 text-sm whitespace-pre-line bg-white">
                    {`お世話になっております。\n\nLINE広告のお申し込みについて、添付の申込書にご記入の上、\nご返送いただけますようお願いいたします。\n\nご不明点がございましたら、お気軽にお問い合わせください。\n\nよろしくお願いいたします。`}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => setEmailSent(true)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {emailSent ? "送信済み" : "送信"}
                    </Button>
                  </div>
                </div>

                {/* 基本情報登録（申込書アップロード） */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    基本情報登録
                  </h4>
                  <p className="text-xs text-muted-foreground">顧客から返送された申込書をアップロード</p>
                  {(() => {
                    const isAnniversary = slotMaterialState.usageMethod === "anniversary";
                    const selectedPack = isAnniversary
                      ? corporationPacks.find((p) => p.id === slotMaterialState.selectedPackId)
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

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setActiveStepperStep(0)}>戻る</Button>
                  <Button onClick={() => setActiveStepperStep(2)}>
                    次へ（掲載へ）
                  </Button>
                </div>
              </Card>
            )}

            {/* （旧）ステップ詳細: 商材区分・利用方法 — hidden in new flow */}
            {false && activeStepperStep === 0 && (
              <Card className="p-6 space-y-6">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  提案 - 実施方針
                  {isReviewPending && <Badge className="bg-purple-100 text-purple-800">事務確認中</Badge>}
                  {isReviewRejected && <Badge variant="destructive">差し戻し</Badge>}
                </h3>

                {/* 実施方針 */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">実施方針</Label>
                  <Textarea
                    placeholder="この商材の実施方針を入力してください..."
                    value={slotMaterialState.implementationPolicy || ""}
                    onChange={(e) => updateMaterialField(slotMaterialState.id, { implementationPolicy: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">ターゲット層、配信目的、期待する効果などを記載してください</p>
                </div>

                <Separator />

                {/* 商材区分・商材名（設定済みなら変更不可） */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">商材区分</Label>
                    {activeSlot.materialCategory ? (
                      <Input value={activeSlot.materialCategory} readOnly className="bg-muted/30" />
                    ) : (
                      <Select
                        value={slotMaterialState.category || undefined}
                        onValueChange={(val) => {
                          updateMaterialField(slotMaterialState.id, { category: val });
                          updateProposalSlot(caseData.id, activeSlot.id, { materialCategory: val as import("@/lib/types").MaterialCategory });
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="イベント">イベント</SelectItem>
                          <SelectItem value="ポイント">ポイント</SelectItem>
                          <SelectItem value="オプション">オプション</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">商材名</Label>
                    {activeSlot.materialName ? (
                      <Input value={activeSlot.materialName} readOnly className="bg-muted/30" />
                    ) : (
                      <Select
                        value={slotMaterialState.eventType || undefined}
                        onValueChange={(val) => {
                          updateMaterialField(slotMaterialState.id, { eventType: val });
                          updateProposalSlot(caseData.id, activeSlot.id, { materialName: val });
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
                        <SelectContent>
                          {eventTypeOptions.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* 利用方法（商材名選択後に表示） */}
                {(activeSlot.materialName || slotMaterialState.eventType) && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">利用方法</Label>
                      <RadioGroup
                        value={slotMaterialState.usageMethod}
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
                          updateMaterialField(slotMaterialState.id, updates);
                        }}
                        className="space-y-3"
                      >
                        {/* 周年パックで実施 */}
                        <div
                          className={`flex items-start gap-3 rounded-lg border p-4 ${
                            slotMaterialState.usageMethod === "anniversary"
                              ? "border-blue-300 bg-blue-50/50"
                              : "border-muted"
                          } ${!hasPacks ? "opacity-50" : ""}`}
                        >
                          <RadioGroupItem
                            value="anniversary"
                            id={`usage-anniversary-record-${slotMaterialState.id}`}
                            disabled={!hasPacks}
                            className="mt-0.5"
                          />
                          <div className="flex-1 space-y-3">
                            <Label
                              htmlFor={`usage-anniversary-record-${slotMaterialState.id}`}
                              className={`text-sm font-medium ${!hasPacks ? "cursor-not-allowed" : "cursor-pointer"}`}
                            >
                              周年パックで実施
                            </Label>
                            {!hasPacks && (
                              <p className="text-xs text-muted-foreground">
                                この法人は周年パックを購入していません
                              </p>
                            )}
                            {slotMaterialState.usageMethod === "anniversary" && hasPacks && (
                              <div className="space-y-2 pt-1">
                                {corporationPacks.map((pack) => (
                                  <label
                                    key={pack.id}
                                    className={`flex items-center justify-between rounded-md border p-3 cursor-pointer transition-colors ${
                                      slotMaterialState.selectedPackId === pack.id
                                        ? "border-blue-400 bg-blue-50"
                                        : "border-muted hover:bg-muted/30"
                                    }`}
                                    onClick={() =>
                                      updateMaterialField(slotMaterialState.id, {
                                        selectedPackId: pack.id,
                                      })
                                    }
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                                          slotMaterialState.selectedPackId === pack.id
                                            ? "border-blue-500"
                                            : "border-muted-foreground/40"
                                        }`}
                                      >
                                        {slotMaterialState.selectedPackId === pack.id && (
                                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        )}
                                      </div>
                                      <span className="text-sm font-medium">{pack.title}</span>
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
                            slotMaterialState.usageMethod === "single"
                              ? "border-blue-300 bg-blue-50/50"
                              : "border-muted"
                          }`}
                        >
                          <RadioGroupItem
                            value="single"
                            id={`usage-single-record-${slotMaterialState.id}`}
                            className="mt-0.5"
                          />
                          <div className="flex-1 space-y-3">
                            <Label
                              htmlFor={`usage-single-record-${slotMaterialState.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              単発で実施
                            </Label>
                            {slotMaterialState.usageMethod === "single" && (
                              <div className="space-y-2 pt-1">
                                <Label className="text-xs text-muted-foreground">請求額</Label>
                                <div className="relative max-w-xs">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">¥</span>
                                  <Input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    className="pl-7"
                                    value={slotMaterialState.billingAmount}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/[^0-9]/g, "");
                                      updateMaterialField(slotMaterialState.id, { billingAmount: val });
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

                {/* 申込書 */}
                {(() => {
                  const isAnniversary = slotMaterialState.usageMethod === "anniversary";
                  const selectedPack = isAnniversary
                    ? corporationPacks.find((p) => p.id === slotMaterialState.selectedPackId)
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

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={onBack}>キャンセル</Button>
                  <div className="flex gap-3">
                    {!isReviewPending && !isPublishing && (
                      <Button onClick={handleRequestReview}>
                        <Send className="mr-2 h-4 w-4" />
                        事務へ確認依頼
                      </Button>
                    )}
                    <Button onClick={() => setActiveStepperStep(1)}>
                      次へ（掲載へ）
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* ステップ3: 掲載 */}
            {activeStepperStep === 2 && (
              <Card className="p-6 space-y-6">
                <h3 className="text-base font-semibold">掲載</h3>

                {/* 掲載素材（kintone風テーブル - 時刻削除、行追加・画像アップロード対応） */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">掲載素材</h4>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#5b9bd5] text-white">
                          <th className="p-2 text-left font-medium text-xs whitespace-nowrap border-r border-blue-400">掲載開始日</th>
                          <th className="p-2 text-left font-medium text-xs whitespace-nowrap border-r border-blue-400">掲載終了日</th>
                          <th className="p-2 text-left font-medium text-xs whitespace-nowrap border-r border-blue-400">画像素材</th>
                          <th className="p-2 text-left font-medium text-xs whitespace-nowrap border-r border-blue-400">備考</th>
                          <th className="p-2 text-center font-medium text-xs whitespace-nowrap border-r border-blue-400">素材未着</th>
                          <th className="p-2 text-center font-medium text-xs whitespace-nowrap border-r border-blue-400">掲載処理</th>
                          <th className="p-2 text-center font-medium text-xs whitespace-nowrap border-r border-blue-400">最終チェック</th>
                          <th className="p-2 text-center font-medium text-xs whitespace-nowrap">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {caseData.proposalSlots
                          .filter(s => s.id === activeSlot.id)
                          .map((slot, rowIdx) => (
                            <tr key={`${slot.id}-${rowIdx}`} className="border-t hover:bg-muted/5">
                              <td className="p-2 border-r">
                                <Input
                                  type="date"
                                  defaultValue={format(slot.startDate, "yyyy-MM-dd")}
                                  className="h-8 text-xs w-[130px]"
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleUpdateSlot(slot.id, { startDate: new Date(e.target.value) });
                                    }
                                  }}
                                />
                              </td>
                              <td className="p-2 border-r">
                                <Input
                                  type="date"
                                  defaultValue={format(slot.endDate, "yyyy-MM-dd")}
                                  className="h-8 text-xs w-[130px]"
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleUpdateSlot(slot.id, { endDate: new Date(e.target.value) });
                                    }
                                  }}
                                />
                              </td>
                              <td className="p-2 border-r">
                                <div className="space-y-1">
                                  {uploadedImages[`${slot.id}-${rowIdx}`] ? (
                                    <div className="flex items-center gap-2">
                                      {uploadedImageUrls[`${slot.id}-${rowIdx}`] && (
                                        <img
                                          src={uploadedImageUrls[`${slot.id}-${rowIdx}`]}
                                          alt="thumb"
                                          className="h-10 w-10 object-cover rounded border cursor-pointer"
                                          onClick={() => setImagePreviewUrl(uploadedImageUrls[`${slot.id}-${rowIdx}`])}
                                        />
                                      )}
                                      <span className="text-xs text-green-600">✓</span>
                                      <button
                                        type="button"
                                        className="text-red-500 text-xs hover:underline"
                                        onClick={() => {
                                          const newImages = { ...uploadedImages };
                                          delete newImages[`${slot.id}-${rowIdx}`];
                                          setUploadedImages(newImages);
                                          const newUrls = { ...uploadedImageUrls };
                                          delete newUrls[`${slot.id}-${rowIdx}`];
                                          setUploadedImageUrls(newUrls);
                                        }}
                                      >
                                        削除
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="cursor-pointer">
                                      <span className="text-blue-600 text-xs hover:underline">画像をアップロード</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            const url = URL.createObjectURL(file);
                                            setUploadedImages(prev => ({
                                              ...prev,
                                              [`${slot.id}-${rowIdx}`]: file.name,
                                            }));
                                            setUploadedImageUrls(prev => ({
                                              ...prev,
                                              [`${slot.id}-${rowIdx}`]: url,
                                            }));
                                            setImagePreviewUrl(url);
                                          }
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 border-r">
                                <Input className="h-8 text-xs w-[120px]" placeholder="" />
                              </td>
                              <td className="p-2 border-r text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <input type="checkbox" className="h-3.5 w-3.5" />
                                  <span className="text-xs text-muted-foreground">未着</span>
                                </div>
                              </td>
                              <td className="p-2 border-r text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <input type="checkbox" className="h-3.5 w-3.5" />
                                  <span className="text-xs text-muted-foreground">完了</span>
                                </div>
                              </td>
                              <td className="p-2 border-r text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <input type="checkbox" className="h-3.5 w-3.5" />
                                  <span className="text-xs text-muted-foreground">完了</span>
                                </div>
                              </td>
                              <td className="p-2 text-center">
                                <span className="text-xs text-muted-foreground">-</span>
                              </td>
                            </tr>
                          ))}
                        {/* 追加行 */}
                        {publishingAdditionalRows.map((rowId, addIdx) => (
                          <tr key={`add-${rowId}`} className="border-t hover:bg-muted/5">
                            <td className="p-2 border-r"><Input type="date" className="h-8 text-xs w-[130px]" /></td>
                            <td className="p-2 border-r"><Input type="date" className="h-8 text-xs w-[130px]" /></td>
                            <td className="p-2 border-r">
                              <div className="space-y-1">
                                {uploadedImages[`add-${rowId}`] ? (
                                  <div className="flex items-center gap-2">
                                    {uploadedImageUrls[`add-${rowId}`] && (
                                      <img
                                        src={uploadedImageUrls[`add-${rowId}`]}
                                        alt="thumb"
                                        className="h-10 w-10 object-cover rounded border cursor-pointer"
                                        onClick={() => setImagePreviewUrl(uploadedImageUrls[`add-${rowId}`])}
                                      />
                                    )}
                                    <span className="text-xs text-green-600">✓</span>
                                    <button
                                      type="button"
                                      className="text-red-500 text-xs hover:underline"
                                      onClick={() => {
                                        const newImages = { ...uploadedImages };
                                        delete newImages[`add-${rowId}`];
                                        setUploadedImages(newImages);
                                        const newUrls = { ...uploadedImageUrls };
                                        delete newUrls[`add-${rowId}`];
                                        setUploadedImageUrls(newUrls);
                                      }}
                                    >
                                      削除
                                    </button>
                                  </div>
                                ) : (
                                  <label className="cursor-pointer">
                                    <span className="text-blue-600 text-xs hover:underline">画像をアップロード</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const url = URL.createObjectURL(file);
                                          setUploadedImages(prev => ({
                                            ...prev,
                                            [`add-${rowId}`]: file.name,
                                          }));
                                          setUploadedImageUrls(prev => ({
                                            ...prev,
                                            [`add-${rowId}`]: url,
                                          }));
                                          setImagePreviewUrl(url);
                                        }
                                      }}
                                    />
                                  </label>
                                )}
                              </div>
                            </td>
                            <td className="p-2 border-r"><Input className="h-8 text-xs w-[120px]" placeholder="" /></td>
                            <td className="p-2 border-r text-center">
                              <div className="flex items-center justify-center gap-1">
                                <input type="checkbox" className="h-3.5 w-3.5" />
                                <span className="text-xs text-muted-foreground">未着</span>
                              </div>
                            </td>
                            <td className="p-2 border-r text-center">
                              <div className="flex items-center justify-center gap-1">
                                <input type="checkbox" className="h-3.5 w-3.5" />
                                <span className="text-xs text-muted-foreground">完了</span>
                              </div>
                            </td>
                            <td className="p-2 border-r text-center">
                              <div className="flex items-center justify-center gap-1">
                                <input type="checkbox" className="h-3.5 w-3.5" />
                                <span className="text-xs text-muted-foreground">完了</span>
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                className="text-red-500 text-xs hover:underline"
                                onClick={() => setPublishingAdditionalRows(prev => prev.filter(id => id !== rowId))}
                              >
                                削除
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPublishingAdditionalRows(prev => [...prev, Date.now()])}
                    className="gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    行を追加
                  </Button>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setActiveStepperStep(1)}>戻る</Button>
                  <div className="flex gap-3">
                    {!isReviewPending && !isPublishing && (
                      <Button onClick={handleRequestReview}>
                        <Send className="mr-2 h-4 w-4" />
                        事務へ確認依頼
                      </Button>
                    )}
                    <Button variant="outline" onClick={onBack}>完了</Button>
                  </div>
                </div>
              </Card>
            )}

          </div>
        )}

        {/* 画像プレビューモーダル（掲載素材アップロード時） */}
        <Dialog open={!!imagePreviewUrl} onOpenChange={(open) => !open && setImagePreviewUrl(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>画像プレビュー</DialogTitle>
              <DialogDescription>アップロードした画像のプレビューです</DialogDescription>
            </DialogHeader>
            {imagePreviewUrl && (
              <div className="flex justify-center">
                <img src={imagePreviewUrl} alt="preview" className="max-h-[60vh] object-contain rounded border" />
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setImagePreviewUrl(null)}>閉じる</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 営業/事務 別コンテンツ（実施方針・掲載ステップでは非表示） */}
        {slotMaterialState && activeStepperStep === 1 && (
          <div className="space-y-6">
            {isAdmin ? (
              <>
                {/* 事務側: 基本情報（読み取り専用） */}
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
                    {(() => {
                      const isAnniversary = slotMaterialState.usageMethod === "anniversary";
                      const selectedPack = isAnniversary
                        ? corporationPacks.find((p) => p.id === slotMaterialState.selectedPackId)
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

                {/* 事務側: 掲載素材（読み取り専用） */}
                <MaterialUpload
                  materials={caseData.materials || []}
                  proposalSlots={caseData.proposalSlots}
                  onAddMaterial={() => {}}
                  onRemoveMaterial={() => {}}
                  readOnly={true}
                />

                {/* 承認・差し戻しボタン */}
                {isReviewPending && (
                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={onBack}>戻る</Button>
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
                        承認して掲載を開始
                      </Button>
                    </div>
                  </div>
                )}
                {!isReviewPending && (
                  <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={onBack}>戻る</Button>
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
                {/* 営業側: 差し戻し通知 */}
                {isReviewRejected && caseData.adminReviewComment && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="flex items-center gap-2">不備内容</AlertTitle>
                    <AlertDescription className="mt-2">{caseData.adminReviewComment}</AlertDescription>
                  </Alert>
                )}

                {/* 営業側: 基本情報（申込書） */}
                <Card className="border">
                  <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold flex items-center gap-2">
                        基本情報
                        {isReviewPending && <Badge className="bg-purple-100 text-purple-800">事務確認中</Badge>}
                        {isReviewRejected && <Badge variant="destructive">差し戻し</Badge>}
                      </h3>
                    </div>
                    {(() => {
                      const isAnniversary = slotMaterialState.usageMethod === "anniversary";
                      const selectedPack = isAnniversary
                        ? corporationPacks.find((p) => p.id === slotMaterialState.selectedPackId)
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

                {/* 営業側: 掲載素材 */}
                <MaterialUpload
                  materials={caseData.materials || []}
                  proposalSlots={caseData.proposalSlots}
                  onAddMaterial={handleAddMaterialFile}
                  onRemoveMaterial={handleRemoveMaterialFile}
                  onAddSlot={handleAddSlotFromMaterial}
                  onUpdateSlot={handleUpdateSlot}
                  onRemoveSlot={handleRemoveSlot}
                  readOnly={isReviewPending}
                  deadlineText="最終期限は1営業日前の15時必着。動画の期限は6営業日前"
                />

                {/* 営業側: アクションボタン */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" onClick={onBack}>キャンセル</Button>
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
              </>
            )}
          </div>
        )}

        {/* 掲載停止依頼セクション（営業側・掲載中） */}
        {isPublishing && !isAdmin && (
          <Card className="border-orange-200 bg-orange-50">
            <div className="p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-orange-800">掲載停止</h3>
                <p className="text-xs text-orange-600">掲載を停止する場合は事務へ依頼してください</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setStopReason("");
                  setShowStopDialog(true);
                }}
              >
                <StopCircle className="mr-2 h-4 w-4" />
                掲載停止を依頼
              </Button>
            </div>
          </Card>
        )}
        {/* 掲載停止依頼中の表示（営業側） */}
        {caseData.status === "掲載停止依頼中" && !isAdmin && (
          <Card className="border-orange-200 bg-orange-50">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <StopCircle className="h-4 w-4 text-orange-600" />
                <h3 className="text-sm font-semibold text-orange-800">掲載停止依頼中</h3>
              </div>
              <p className="text-xs text-orange-600">事務の承認を待っています。承認され次第、掲載が停止されます。</p>
              {caseData.stopPublishingRequest && (
                <div className="rounded-lg border border-orange-200 bg-white p-3">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{caseData.stopPublishingRequest}</p>
                </div>
              )}
            </div>
          </Card>
        )}
        {/* 掲載停止依頼（事務側） */}
        {caseData.status === "掲載停止依頼中" && isAdmin && caseData.stopPublishingRequest && (
          <Card className="border-orange-200 bg-orange-50">
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-base font-semibold text-orange-800">掲載停止依頼</h3>
                <p className="text-sm text-orange-700">営業から掲載停止の依頼が届いています</p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-white p-4">
                <h4 className="text-sm font-medium mb-2">営業からの依頼内容</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{caseData.stopPublishingRequest}</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowStopDialog(true)}
              >
                <StopCircle className="mr-2 h-4 w-4" />
                掲載を停止する
              </Button>
            </div>
          </Card>
        )}

        </div>
        {/* 右チャットカラム（固定表示） */}
        <div className="w-[320px] flex-shrink-0">
          <div className="sticky top-[180px]">
            <CaseChat caseData={caseData} slotId={activeSlot.id} />
          </div>
        </div>
        </div>

        {/* 申し込み情報モーダル */}
        <Dialog open={showApplicationInfoModal} onOpenChange={setShowApplicationInfoModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>申し込み情報</DialogTitle>
              <DialogDescription>この商材の申し込み情報です</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">法人名:</span>
                  <p className="font-medium">{caseData.corporateName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">ホール名:</span>
                  <p className="font-medium">{caseData.storeName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">商材名:</span>
                  <p className="font-medium">{activeSlot?.materialName || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">バナー種別:</span>
                  <p className="font-medium">{activeSlot?.bannerType || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">掲載開始日:</span>
                  <p className="font-medium">{activeSlot ? format(activeSlot.startDate, "yyyy/MM/dd", { locale: ja }) : "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">掲載終了日:</span>
                  <p className="font-medium">{activeSlot ? format(activeSlot.endDate, "yyyy/MM/dd", { locale: ja }) : "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">請求額:</span>
                  <p className="font-medium">¥{caseData.billingAmount?.toLocaleString() || "0"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">担当営業:</span>
                  <p className="font-medium">{caseData.salesPersonName || "山田 太郎"}</p>
                </div>
              </div>
              {caseData.applicationDocumentUrl && (
                <div className="pt-2 border-t">
                  <span className="text-sm text-muted-foreground">申込書:</span>
                  <p className="text-sm text-blue-600">アップロード済み</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowApplicationInfoModal(false)}>閉じる</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToList || onBack}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold">
          {caseData.storeName} - {caseData.salesPersonName || "山田 太郎"}
        </h1>
        <span className="text-sm text-muted-foreground">案件No: {caseData.caseNumber || "-"}</span>
        <Badge
          variant="secondary"
          className={projectStatusColor}
        >
          {caseData.projectStatus || "提案中"}
        </Badge>
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

      {/* ===== 案件詳細2カラムレイアウト（添付1準拠） ===== */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-6">

      {/* 左カラム: 案件情報 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">案件情報</h2>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => onBack?.()}>
            <FileText className="h-3.5 w-3.5" />
            編集
          </Button>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-muted-foreground shrink-0 mt-0.5">🏢</span>
            <div>
              <p className="text-xs text-muted-foreground">法人</p>
              <p className="font-medium">{caseData.corporateName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-muted-foreground shrink-0 mt-0.5">📍</span>
            <div>
              <p className="text-xs text-muted-foreground">ホール</p>
              <p className="font-medium">{caseData.storeName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-muted-foreground shrink-0 mt-0.5">👤</span>
            <div>
              <p className="text-xs text-muted-foreground">担当営業</p>
              <p className="font-medium">{caseData.salesPersonName || "山田 太郎"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-muted-foreground shrink-0 mt-0.5">📅</span>
            <div>
              <p className="text-xs text-muted-foreground">依頼日</p>
              <p className="font-medium">{format(caseData.createdAt, "yyyy-MM-dd", { locale: ja })}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 右カラム: 商材一覧 */}
      <Card className="overflow-hidden">
        <div className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              商材一覧
              <Badge variant="secondary" className="font-normal">
                {caseData.proposalSlots.length}件
              </Badge>
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allSlotIds = caseData.proposalSlots.map((s) => s.id);
                  const newCase = duplicateCase(caseData.id, allSlotIds);
                  if (newCase && onDuplicate) {
                    onDuplicate(newCase.id);
                  }
                }}
                className="gap-1"
              >
                <Copy className="h-4 w-4" />
                複製
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleAddMaterial}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                商材を追加
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-y">
                <th className="text-left p-3 font-semibold text-xs">ステータス</th>
                <th className="text-left p-3 font-semibold text-xs">レコード番号</th>
                <th className="text-left p-3 font-semibold text-xs">商材名</th>
                <th className="text-left p-3 font-semibold text-xs">店舗名</th>
                <th className="text-left p-3 font-semibold text-xs">掲載開始日</th>
                <th className="text-left p-3 font-semibold text-xs">掲載終了日</th>
                <th className="text-right p-3 font-semibold text-xs">実NET額</th>
              </tr>
            </thead>
            <tbody>
              {caseData.proposalSlots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    商材が登録されていません
                  </td>
                </tr>
              ) : (
                caseData.proposalSlots.map((slot) => (
                  <tr key={slot.id} className="border-b hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => onOpenRecord ? onOpenRecord(slot.id) : setActiveRecordSlotId(slot.id)}>
                    <td className="p-3">
                      <StatusBadge status={caseData.status} />
                    </td>
                    <td className="p-3">
                      <span className="text-blue-600 hover:underline font-mono font-medium">{slot.recordNumber || "-"}</span>
                    </td>
                    <td className="p-3 text-xs">{slot.materialName || "-"}</td>
                    <td className="p-3 text-xs">{caseData.storeName?.substring(0, 10) || "-"}</td>
                    <td className="p-3 text-xs">{format(slot.startDate, "yyyy-MM-dd", { locale: ja })}</td>
                    <td className="p-3 text-xs">{format(slot.endDate, "yyyy-MM-dd", { locale: ja })}</td>
                    <td className="p-3 text-xs text-right">¥{(caseData.billingAmount || 50000).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      </div>


      {/* ===== 商材数サマリ ===== */}
      <Card className="p-6">
        <h3 className="text-sm text-muted-foreground mb-1">商材数</h3>
        <p className="text-3xl font-bold">{caseData.proposalSlots.length}</p>
      </Card>

      {/* ===== (以下は旧商材情報セクション - 非表示) ===== */}
      {false && materialStates.map((material, idx) => {
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
                  {/* ===== 商材区分・商材名・利用方法 ===== */}
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">商材区分</Label>
                        {/* 商材区分設定済みの場合は変更不可 */}
                        {thisSlot?.materialCategory ? (
                          <Input value={thisSlot.materialCategory} readOnly className="bg-muted/30" />
                        ) : (
                          <Select
                            value={material.category || undefined}
                            onValueChange={(val) => {
                              updateMaterialField(material.id, {
                                category: val,
                                eventType: "",
                                usageMethod: "",
                                selectedPackId: "",
                                billingAmount: "",
                              });
                              // 商材区分をスロットに保存して変更不可にする
                              const catMap: Record<string, string> = { event: "イベント", option: "オプション", point: "ポイント" };
                              updateProposalSlot(caseData.id, material.id, {
                                materialCategory: (catMap[val] || val) as import("@/lib/types").MaterialCategory,
                              });
                            }}
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
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          商材名
                        </Label>
                        {/* 商材名設定済みの場合は変更不可 */}
                        {thisSlot?.materialName ? (
                          <Input value={thisSlot.materialName} readOnly className="bg-muted/30" />
                        ) : (
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
                              // 商材名をスロットに保存して変更不可にする
                              updateProposalSlot(caseData.id, material.id, {
                                bannerType: val as import("@/lib/types").BannerType,
                                materialName: val,
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              {eventTypeOptions.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>

                    {/* 利用方法（商材名選択後に表示） */}
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

                  {/* ===== コンテンツ ===== */}
                  <div className="space-y-6">
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

                          {/* 掲載素材（読み取り専用） */}
                          <MaterialUpload
                            materials={caseData.materials || []}
                            proposalSlots={caseData.proposalSlots}
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
                                  承認して掲載を開始
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

                          {/* 掲載停止セクション（営業から掲載停止依頼があった場合） */}
                          {caseData.status === "掲載停止依頼中" && caseData.stopPublishingRequest && (
                            <Card className="border-orange-200 bg-orange-50">
                              <div className="p-6 space-y-4">
                                <div>
                                  <h3 className="text-base font-semibold text-orange-800">
                                    掲載停止依頼
                                  </h3>
                                  <p className="text-sm text-orange-700">
                                    営業から掲載停止の依頼が届いています
                                  </p>
                                </div>
                                <div className="rounded-lg border border-orange-200 bg-white p-4">
                                  <h4 className="text-sm font-medium mb-2">営業からの依頼内容</h4>
                                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {caseData.stopPublishingRequest}
                                  </p>
                                </div>
                                <Button
                                  variant="destructive"
                                  onClick={() => setShowStopDialog(true)}
                                >
                                  <StopCircle className="mr-2 h-4 w-4" />
                                  掲載を停止する
                                </Button>
                              </div>
                            </Card>
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

                          {/* 掲載素材 */}
                          <MaterialUpload
                            materials={caseData.materials || []}
                            proposalSlots={caseData.proposalSlots}
                            onAddMaterial={handleAddMaterialFile}
                            onRemoveMaterial={handleRemoveMaterialFile}
                            onAddSlot={handleAddSlotFromMaterial}
                            onUpdateSlot={handleUpdateSlot}
                            onRemoveSlot={handleRemoveSlot}
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

                          {/* 掲載停止依頼セクション（営業側） */}
                          {isPublishing && !isAdmin && (
                            <Card className="border-orange-200 bg-orange-50">
                              <div className="p-4 flex items-center justify-between">
                                <div>
                                  <h3 className="text-sm font-semibold text-orange-800">掲載停止</h3>
                                  <p className="text-xs text-orange-600">掲載を停止する場合は事務へ依頼してください</p>
                                </div>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    setStopReason("");
                                    setShowStopDialog(true);
                                  }}
                                >
                                  <StopCircle className="mr-2 h-4 w-4" />
                                  掲載停止を依頼
                                </Button>
                              </div>
                            </Card>
                          )}
                          {/* 掲載停止依頼中の表示（営業側） */}
                          {caseData.status === "掲載停止依頼中" && !isAdmin && (
                            <Card className="border-orange-200 bg-orange-50">
                              <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                  <StopCircle className="h-4 w-4 text-orange-600" />
                                  <h3 className="text-sm font-semibold text-orange-800">掲載停止依頼中</h3>
                                </div>
                                <p className="text-xs text-orange-600">事務の承認を待っています。承認され次第、掲載が停止されます。</p>
                                {caseData.stopPublishingRequest && (
                                  <div className="rounded-lg border border-orange-200 bg-white p-3">
                                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{caseData.stopPublishingRequest}</p>
                                  </div>
                                )}
                              </div>
                            </Card>
                          )}
                        </>
                      )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}

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
          {isAdmin ? (
            <>
              <DialogHeader>
                <DialogTitle>本当に掲載停止してよろしいですか？</DialogTitle>
                <DialogDescription>
                  掲載を停止すると、管理画面の設定を削除しカレンダーの枠を解放します
                </DialogDescription>
              </DialogHeader>
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
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>掲載停止を依頼</DialogTitle>
                <DialogDescription>
                  停止理由を入力して事務へ掲載停止を依頼してください。事務が承認すると掲載が停止されます。
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">停止理由</Label>
                  <Textarea
                    value={stopReason}
                    onChange={(e) => setStopReason(e.target.value)}
                    rows={5}
                    placeholder="掲載停止の理由を入力してください..."
                    className="text-sm"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowStopDialog(false)}
                >
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const reason = stopReason || generateStopRequestText();
                    setStopReason(reason);
                    handleStopPublishing();
                  }}
                  disabled={!stopReason.trim()}
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  掲載停止を依頼
                </Button>
              </DialogFooter>
            </>
          )}
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
