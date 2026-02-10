"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SlotCalendar } from "@/components/slot-calendar";
import { useCaseStore } from "@/lib/case-store";
import type { Case, ProposalSlot } from "@/lib/types";
import { Send, X, Link } from "lucide-react";

interface Step1ProposalProps {
  caseData: Case;
  onCancel: () => void;
}

export function Step1Proposal({ caseData, onCancel }: Step1ProposalProps) {
  const { updateCase, addProposalSlot, removeProposalSlot, proceedToPublishing, skipProposal } =
    useCaseStore();
  const [implementationPolicy, setImplementationPolicy] = useState(
    caseData.implementationPolicy || ""
  );
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [showProceedDialog, setShowProceedDialog] = useState(false);
  const [billingAmount, setBillingAmount] = useState<number | null>(caseData.billingAmount ?? null);
  const [isAnniversaryPack, setIsAnniversaryPack] = useState(caseData.isAnniversaryPack ?? false);
  const [anniversaryPackCode, setAnniversaryPackCode] = useState(caseData.anniversaryPackCode ?? "");
  const [isLinking, setIsLinking] = useState(false);

  const handleAddSlot = (slot: ProposalSlot) => {
    addProposalSlot(caseData.id, slot);
  };

  const handleRemoveSlot = (slotId: string) => {
    removeProposalSlot(caseData.id, slotId);
  };

  const handleLinkAnniversaryPack = () => {
    if (!anniversaryPackCode) return;
    setIsLinking(true);
    // シミュレーション: コードから金額を取得
    setTimeout(() => {
      const mockAmount = anniversaryPackCode === "AP-001" ? 500000 : anniversaryPackCode === "AP-002" ? 800000 : 350000;
      setBillingAmount(mockAmount);
      setIsLinking(false);
    }, 800);
  };

  const handleSave = () => {
    updateCase(caseData.id, {
      implementationPolicy,
      billingAmount,
      isAnniversaryPack,
      anniversaryPackCode: isAnniversaryPack ? anniversaryPackCode : undefined,
    });
  };

  const handleProceed = () => {
    handleSave();
    proceedToPublishing(caseData.id);
  };

  const handleSkip = () => {
    skipProposal(caseData.id);
    onCancel();
  };

  return (
    <div className="space-y-6">
      {/* 提案内容 */}
      <Card>
        <CardHeader>
          <CardTitle>提案内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 請求額 */}
          <div className="space-y-3">
            <Label className="text-base font-medium">請求額</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">¥</span>
              <Input
                type="text"
                placeholder="金額"
                value={billingAmount != null ? billingAmount.toLocaleString() : ""}
                disabled={isAnniversaryPack}
                onChange={(e) => {
                  if (!isAnniversaryPack) {
                    const val = e.target.value.replace(/,/g, "");
                    const num = Number.parseInt(val, 10);
                    setBillingAmount(Number.isNaN(num) ? null : num);
                  }
                }}
                className="max-w-xs"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="anniversary-pack"
                  checked={isAnniversaryPack}
                  onCheckedChange={(checked) => {
                    const val = checked === true;
                    setIsAnniversaryPack(val);
                    if (!val) {
                      setBillingAmount(caseData.billingAmount ?? null);
                    }
                  }}
                />
                <Label htmlFor="anniversary-pack" className="text-sm cursor-pointer">
                  周年パック連携
                </Label>
              </div>
              {isAnniversaryPack && (
                <div className="flex items-center gap-2 pl-6">
                  <Input
                    type="text"
                    placeholder="周年パックコード（例: AP-001）"
                    value={anniversaryPackCode}
                    onChange={(e) => setAnniversaryPackCode(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!anniversaryPackCode || isLinking}
                    onClick={handleLinkAnniversaryPack}
                  >
                    <Link className="mr-1.5 h-3.5 w-3.5" />
                    {isLinking ? "連携中..." : "連携"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 掲載枠カレンダー */}
          <div className="space-y-2">
            <Label className="text-base font-medium">掲載日時とバナー種別</Label>
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

          {/* フッターボタン */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onCancel}>
              キャンセル
            </Button>
            <Button onClick={handleSave}>登録</Button>
          </div>
        </CardContent>
      </Card>

      {/* 実施方針 */}
      <Card>
        <CardHeader>
          <CardTitle>実施方針</CardTitle>
          <CardDescription>顧客からの回答を記録してください</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="implementation-policy">顧客回答</Label>
            <Textarea
              id="implementation-policy"
              placeholder="顧客からの回答内容を入力してください..."
              value={implementationPolicy}
              onChange={(e) => setImplementationPolicy(e.target.value)}
              rows={4}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowProceedDialog(true)} className="flex-1">
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
        </CardContent>
      </Card>

      {/* 見送り確認ダイアログ */}
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

      {/* 配信進める確認ダイアログ */}
      <AlertDialog open={showProceedDialog} onOpenChange={setShowProceedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>配信準備に進みますか？</AlertDialogTitle>
            <AlertDialogDescription>
              申込書送付のステップに進みます。一覧で「配信準備中」のラベルが表示されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleProceed}>進める</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
