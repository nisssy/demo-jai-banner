"use client";

import React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileImage, AlertCircle, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MaterialFile, ProposalSlot } from "@/lib/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface MaterialUploadProps {
  materials: MaterialFile[];
  proposalSlots?: ProposalSlot[];
  onAddMaterial: (material: MaterialFile) => void;
  onRemoveMaterial: (materialId: string) => void;
  readOnly?: boolean;
  deadlineText?: string;
}

// 素材のバリデーション
const validateMaterial = (file: File): string[] => {
  const errors: string[] = [];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (file.size > maxSize) {
    errors.push(`ファイルサイズが10MBを超えています（現在: ${(file.size / 1024 / 1024).toFixed(2)}MB）`);
  }

  const allowedFormats = ["image/jpeg", "image/png", "image/gif", "video/mp4"];
  if (!allowedFormats.includes(file.type)) {
    errors.push(`対応していないファイル形式です（対応形式: JPEG, PNG, GIF, MP4）`);
  }

  return errors;
};

// サンプル素材データ生成
const createSampleMaterial = (slotId: string): MaterialFile => ({
  id: `sample-${slotId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  slotId,
  name: `banner_sample_${slotId}.jpg`,
  url: "/placeholder.svg?height=250&width=300",
  size: 256 * 1024,
  format: "image/jpeg",
  uploadedAt: new Date(),
  validationErrors: undefined,
});

// 掲載枠ごとのアップロード行
function SlotUploadRow({
  slot,
  materials,
  onAddMaterial,
  onRemoveMaterial,
  readOnly,
}: {
  slot: ProposalSlot;
  materials: MaterialFile[];
  onAddMaterial: (material: MaterialFile) => void;
  onRemoveMaterial: (materialId: string) => void;
  readOnly: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const slotMaterials = materials.filter((m) => m.slotId === slot.id);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const errors = validateMaterial(file);
      const material: MaterialFile = {
        id: `material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        slotId: slot.id,
        name: file.name,
        url: URL.createObjectURL(file),
        size: file.size,
        format: file.type,
        uploadedAt: new Date(),
        validationErrors: errors.length > 0 ? errors : undefined,
      };
      onAddMaterial(material);
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      {/* 枠の日程情報ヘッダー */}
      <div className="flex items-center gap-4 border-b bg-muted/30 px-4 py-3">
        <div className="grid grid-cols-4 gap-3 flex-1">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">掲載開始日</p>
            <p className="text-sm font-medium">
              {format(slot.startDate, "yyyy-MM-dd", { locale: ja })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">開始時刻</p>
            <p className="text-sm font-medium">{slot.startTime || "00:00"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">掲載終了日</p>
            <p className="text-sm font-medium">
              {format(slot.endDate, "yyyy-MM-dd", { locale: ja })}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">終了時刻</p>
            <p className="text-sm font-medium">{slot.endTime || "23:59"}</p>
          </div>
        </div>
        <Badge variant="secondary" className="flex-shrink-0">
          {slot.bannerType}
        </Badge>
        {slot.areaName && (
          <Badge variant="outline" className="flex-shrink-0">
            {slot.areaName}
          </Badge>
        )}
      </div>

      {/* 画像素材アップロード領域 */}
      <div className="p-4">
        {/* アップロード済み素材 */}
        {slotMaterials.length > 0 && (
          <div className="space-y-2 mb-3">
            {slotMaterials.map((material) => (
              <div
                key={material.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-2",
                  material.validationErrors && material.validationErrors.length > 0
                    ? "border-red-200 bg-red-50"
                    : "bg-muted/20"
                )}
              >
                <div className="flex-shrink-0">
                  {material.format?.startsWith("image/") ? (
                    <img
                      src={material.url || "/placeholder.svg"}
                      alt={material.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                      <FileImage className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{material.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(material.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                {material.validationErrors && material.validationErrors.length > 0 ? (
                  <div className="flex-shrink-0 flex items-center gap-1">
                    <Badge variant="destructive" className="text-xs">
                      エラー
                    </Badge>
                    {material.validationErrors.map((err, i) => (
                      <span key={i} className="text-xs text-red-600 hidden lg:inline">
                        {err}
                      </span>
                    ))}
                  </div>
                ) : (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 flex-shrink-0">
                    <Check className="h-3 w-3 mr-1" />
                    OK
                  </Badge>
                )}
                {!readOnly && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => onRemoveMaterial(material.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* アップロードエリア */}
        {!readOnly && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFileSelect(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              ファイルをドラッグ＆ドロップ、またはクリックして選択
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              対応形式: JPEG, PNG, GIF, MP4（最大10MB）
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,video/mp4"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        )}

        {slotMaterials.length === 0 && readOnly && (
          <p className="text-sm text-muted-foreground text-center py-3">
            素材未アップロード
          </p>
        )}
      </div>
    </div>
  );
}

export function MaterialUpload({
  materials,
  proposalSlots,
  onAddMaterial,
  onRemoveMaterial,
  readOnly = false,
  deadlineText,
}: MaterialUploadProps) {
  const handleApplySample = () => {
    if (!proposalSlots || proposalSlots.length === 0) return;
    for (const slot of proposalSlots) {
      onAddMaterial(createSampleMaterial(slot.id));
    }
  };

  const slots = proposalSlots && proposalSlots.length > 0 ? proposalSlots : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">掲載素材</CardTitle>
            <CardDescription>
              バナー素材をアップロードしてください
            </CardDescription>
          </div>
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleApplySample}
              className="gap-2 bg-transparent"
            >
              <Sparkles className="h-4 w-4" />
              サンプルを反映
            </Button>
          )}
        </div>
        {deadlineText && (
          <p className="text-sm text-amber-600 font-medium mt-2">{deadlineText}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {slots.length > 0 ? (
          <div className="space-y-4">
            {slots.map((slot) => (
              <SlotUploadRow
                key={slot.id}
                slot={slot}
                materials={materials}
                onAddMaterial={onAddMaterial}
                onRemoveMaterial={onRemoveMaterial}
                readOnly={readOnly}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
            提案日程が設定されていません。ステップ1で掲載枠を選択してください。
          </div>
        )}
      </CardContent>
    </Card>
  );
}
