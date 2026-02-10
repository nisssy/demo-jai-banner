"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SlotCalendar } from "@/components/slot-calendar";
import { ApplicationUpload } from "@/components/application-upload";
import { MaterialUpload } from "@/components/material-upload";
import { useCaseStore } from "@/lib/case-store";
import type { Case, MaterialFile, ProposalSlot } from "@/lib/types";
import {
  Send,
  StopCircle,
  AlertCircle,
  Play,
  Edit,
  ImagePlus,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface Step2PublishingProps {
  caseData: Case;
  onCancel: () => void;
}

export function Step2Publishing({ caseData, onCancel }: Step2PublishingProps) {
  const {
    updateCase,
    uploadApplicationDocument,
    addMaterial,
    removeMaterial,
    requestAdminReview,
    startPublishing,
    requestStopPublishing,
    confirmStopPublishing, // Declare the variable here
  } = useCaseStore();

  const [showStopDialog, setShowStopDialog] = useState(false);
  const [stopReason, setStopReason] = useState("");
  const [isContentEditing, setIsContentEditing] = useState(false);
  const [isMaterialAdding, setIsMaterialAdding] = useState(false);

  const isReviewPending = caseData.adminReviewStatus === "pending";
  const isReviewApproved = caseData.adminReviewStatus === "approved";
  const isReviewRejected = caseData.adminReviewStatus === "rejected";
  const isPublishing = caseData.status === "掲載中";

  const handleUploadApplication = (url: string) => {
    uploadApplicationDocument(caseData.id, url);
  };

  const handleRemoveApplication = () => {
    updateCase(caseData.id, { applicationDocumentUrl: undefined });
  };

  const handleAddMaterial = (material: MaterialFile) => {
    addMaterial(caseData.id, material);
  };

  const handleRemoveMaterial = (materialId: string) => {
    removeMaterial(caseData.id, materialId);
  };

  const handleRequestReview = () => {
    requestAdminReview(caseData.id);
    setIsContentEditing(false);
    setIsMaterialAdding(false);
  };

  const handleStartPublishing = () => {
    startPublishing(caseData.id);
  };

  const handleRequestStop = () => {
    requestStopPublishing(caseData.id, stopReason);
    setShowStopDialog(false);
    setStopReason("");
  };

  const handleContentEditClick = () => {
    setIsContentEditing(true);
    // 編集モードにするため、ステータスをリセット
    updateCase(caseData.id, { adminReviewStatus: undefined });
  };

  const handleMaterialAddClick = () => {
    setIsMaterialAdding(true);
    // 編集モードにするため、ステータスをリセット
    updateCase(caseData.id, { adminReviewStatus: undefined });
  };

  const handleStopPublishing = () => {
    confirmStopPublishing(caseData.id);
    setShowStopDialog(false);
    setStopReason("");
  };

  // 最終期限と動画期限のテキスト
  const deadlineText =
    "最終期限は1営業日前の15時必着。動画の期限は6営業日前";

  // バナー種別の色
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

  return (
    <div className="space-y-6">
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

      {/* 基本情報 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                基本情報
                {isReviewPending && (
                  <Badge className="bg-purple-100 text-purple-800">
                    事務確認中
                  </Badge>
                )}
                {isReviewRejected && (
                  <Badge variant="destructive">差し戻し</Badge>
                )}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 申込書 */}
          <ApplicationUpload
            documentUrl={caseData.applicationDocumentUrl}
            onUpload={handleUploadApplication}
            onRemove={handleRemoveApplication}
            readOnly={isReviewPending}
            alwaysShowData={true}
          />

          {/* 掲載内容 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">掲載内容</CardTitle>
                  <CardDescription>
                    提案時に入力した掲載日程とバナー種別
                  </CardDescription>
                </div>
                {isPublishing && !isContentEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleContentEditClick}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    内容変更
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 選択された提案日程の表示 */}
              {caseData.proposalSlots && caseData.proposalSlots.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    選択された提案日程
                  </h4>
                  <div className="space-y-2">
                    {caseData.proposalSlots.map((slot: ProposalSlot) => (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm font-medium">
                              {format(slot.startDate, "yyyy/MM/dd", { locale: ja })} 
                              {slot.startTime && ` ${slot.startTime}`}
                              {" - "}
                              {format(slot.endDate, "yyyy/MM/dd", { locale: ja })}
                              {slot.endTime && ` ${slot.endTime}`}
                            </p>
                          </div>
                        </div>
                        <Badge className={getBannerTypeColor(slot.bannerType)}>
                          {slot.bannerType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* カレンダー表示 */}
              <SlotCalendar
                selectedSlots={caseData.proposalSlots}
                onAddSlot={() => {}}
                onRemoveSlot={() => {}}
                readOnly={!isContentEditing}
              />
            </CardContent>
          </Card>

          {/* 掲載素材 */}
          <div className="relative">
            {isPublishing && !isMaterialAdding && (
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMaterialAddClick}
                >
                  <ImagePlus className="mr-2 h-4 w-4" />
                  画像追加
                </Button>
              </div>
            )}
            <MaterialUpload
              materials={caseData.materials || []}
              proposalSlots={caseData.proposalSlots}
              onAddMaterial={handleAddMaterial}
              onRemoveMaterial={handleRemoveMaterial}
              readOnly={isReviewPending && !isMaterialAdding}
              deadlineText={deadlineText}
            />
          </div>
        </CardContent>
      </Card>

      {/* アクションボタン */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>

        <div className="flex gap-3">
          {/* 事務へ確認依頼ボタン */}
          {(!isReviewPending && !isPublishing) || isContentEditing || isMaterialAdding ? (
            <Button onClick={handleRequestReview}>
              <Send className="mr-2 h-4 w-4" />
              事務へ確認依頼
            </Button>
          ) : null}

          {/* 掲載を開始ボタン（事務確認後に表示） */}
          {isReviewApproved && !isPublishing && (
            <Button onClick={handleStartPublishing} className="bg-green-600 hover:bg-green-700 text-white">
              <Play className="mr-2 h-4 w-4" />
              掲載を開始
            </Button>
          )}
        </div>
      </div>

      {/* 掲載停止セクション（掲載中のみ表示） */}
      {isPublishing && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-base text-orange-800">掲載停止</CardTitle>
            <CardDescription className="text-orange-700">
              掲載を停止すると、管理画面の設定を削除しカレンダーの枠を解放します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 自動生成された停止内容 */}
            <div className="rounded-lg border border-orange-200 bg-white p-4">
              <h4 className="text-sm font-medium mb-2">停止対象の掲載情報</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>案件ID: {caseData.id}</p>
                <p>法人名: {caseData.corporateName}</p>
                <p>店舗名: {caseData.storeName}</p>
                {caseData.proposalSlots && caseData.proposalSlots.length > 0 && (
                  <p>
                    掲載期間: {format(caseData.proposalSlots[0].startDate, "yyyy/MM/dd", { locale: ja })} 〜{" "}
                    {format(caseData.proposalSlots[0].endDate, "yyyy/MM/dd", { locale: ja })}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowStopDialog(true)}
            >
              <StopCircle className="mr-2 h-4 w-4" />
              掲載を停止する
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 掲載停止確認ダイアログ */}
      <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>本当に掲載停止してよろしいですか？</DialogTitle>
            <DialogDescription>
              掲載を停止すると、管理画面の設定を削除しカレンダーの枠を解放します。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="stop-reason">停止理由（任意）</Label>
              <Textarea
                id="stop-reason"
                placeholder="停止理由を入力してください..."
                value={stopReason}
                onChange={(e) => setStopReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStopDialog(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleStopPublishing}>
              掲載を停止する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
