"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCaseStore } from "@/lib/case-store";
import type { Case } from "@/lib/types";
import { ApplicationUpload } from "@/components/application-upload";
import { SlotCalendar } from "@/components/slot-calendar";
import { MaterialUpload } from "@/components/material-upload";
import { Check, X, FileText, Calendar, ImageIcon } from "lucide-react";

interface AdminReviewProps {
  caseData: Case;
  onBack: () => void;
}

export function AdminReview({ caseData, onBack }: AdminReviewProps) {
  const { approveCase, rejectCase } = useCaseStore();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const isPendingReview = caseData.adminReviewStatus === "pending";

  const handleApprove = () => {
    approveCase(caseData.id);
  };

  const handleReject = () => {
    rejectCase(caseData.id, rejectComment);
    setShowRejectDialog(false);
    setRejectComment("");
  };

  // ダミーハンドラ（事務側は読み取り専用）
  const noop = () => {};

  return (
    <div className="space-y-6">
      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 申込書 - 全フィールド表示（編集不可） */}
          <ApplicationUpload
            documentUrl={caseData.applicationDocumentUrl}
            onUpload={noop}
            onRemove={noop}
            readOnly={true}
            alwaysShowData={true}
          />

          <Separator />

          {/* 掲載内容 - カレンダーUIで表示 */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              掲載内容
            </Label>
            <SlotCalendar
              selectedSlots={caseData.proposalSlots || []}
              onAddSlot={noop}
              onRemoveSlot={noop}
              readOnly={true}
            />
          </div>

          <Separator />

          {/* 掲載素材 - 枠ごとのセット表示 */}
          <MaterialUpload
            materials={caseData.materials || []}
            proposalSlots={caseData.proposalSlots}
            onAddMaterial={noop}
            onRemoveMaterial={noop}
            readOnly={true}
          />
        </CardContent>
      </Card>

      {/* 承認・差し戻しボタン（レビュー待ちの場合） */}
      {isPendingReview && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                onClick={() => setShowRejectDialog(true)}
              >
                <X className="mr-2 h-4 w-4" />
                差し戻し
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApprove}
              >
                <Check className="mr-2 h-4 w-4" />
                承認
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 差し戻しダイアログ */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
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
                placeholder="修正が必要な内容を入力してください..."
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectComment.trim()}
            >
              差し戻し
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
