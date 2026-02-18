"use client";

import React, { useState, useRef, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileImage, AlertCircle, Check, Sparkles, ChevronLeft, ChevronRight, Download, ZoomIn } from "lucide-react";
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
const createSampleMaterial = (slotId: string): MaterialFile => {
  // ランダムな色を生成
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const bgColor = getRandomColor();
  const textColor = "#FFFFFF";
  const text = "Sample Banner";
  
  // SVGデータURIを生成
  const svg = `
    <svg width="300" height="250" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" font-family="Arial" font-size="24" font-weight="bold" fill="${textColor}" text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `;
  const url = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

  return {
    id: `sample-${slotId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    slotId,
    name: `banner_sample_${slotId}.jpg`,
    url: url,
    size: 256 * 1024,
    format: "image/jpeg",
    uploadedAt: new Date(),
    validationErrors: undefined,
  };
};

// 掲載枠ごとのアップロード行
function SlotUploadRow({
  slot,
  materials,
  onAddMaterial,
  onRemoveMaterial,
  onPreview,
  readOnly,
}: {
  slot: ProposalSlot;
  materials: MaterialFile[];
  onAddMaterial: (material: MaterialFile) => void;
  onRemoveMaterial: (materialId: string) => void;
  onPreview: (materialId: string) => void;
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
          <div className="space-y-3 mb-3">
            {slotMaterials.map((material) => (
              <div
                key={material.id}
                className={cn(
                  "rounded-lg border overflow-hidden",
                  material.validationErrors && material.validationErrors.length > 0
                    ? "border-red-200 bg-red-50"
                    : "bg-muted/20"
                )}
              >
                {/* 画像プレビュー（大きく表示） */}
                {material.format?.startsWith("image/") ? (
                  <div
                    className="relative group cursor-pointer bg-muted/30 flex items-center justify-center"
                    onClick={() => onPreview(material.id)}
                  >
                    <img
                      src={material.url || "/placeholder.svg"}
                      alt={material.name}
                      className="w-full h-36 object-contain transition-opacity group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity">
                      <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-white text-xs font-medium">
                        <ZoomIn className="h-3.5 w-3.5" />
                        拡大表示
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-36 items-center justify-center bg-muted/30">
                    <FileImage className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}

                {/* ファイル情報バー */}
                <div className="flex items-center gap-3 px-3 py-2 border-t">
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
  const [previewMaterialId, setPreviewMaterialId] = useState<string | null>(null);

  // プレビュー用に並べ替えられた全素材リストを作成
  const sortedMaterials = useMemo(() => {
    if (!proposalSlots) return materials;
    const sorted: MaterialFile[] = [];
    proposalSlots.forEach(slot => {
      const slotMaterials = materials.filter(m => m.slotId === slot.id);
      sorted.push(...slotMaterials);
    });
    // スロットに紐付かない素材があれば最後に追加
    const unassigned = materials.filter(m => !proposalSlots.find(s => s.id === m.slotId));
    sorted.push(...unassigned);
    return sorted;
  }, [materials, proposalSlots]);

  const currentPreviewIndex = useMemo(() => {
    if (!previewMaterialId) return -1;
    return sortedMaterials.findIndex(m => m.id === previewMaterialId);
  }, [previewMaterialId, sortedMaterials]);

  const currentMaterial = currentPreviewIndex >= 0 ? sortedMaterials[currentPreviewIndex] : null;

  const handlePreview = (materialId: string) => {
    setPreviewMaterialId(materialId);
  };

  const handleClosePreview = () => {
    setPreviewMaterialId(null);
  };

  const handlePrevPreview = () => {
    if (currentPreviewIndex > 0) {
      setPreviewMaterialId(sortedMaterials[currentPreviewIndex - 1].id);
    }
  };

  const handleNextPreview = () => {
    if (currentPreviewIndex < sortedMaterials.length - 1) {
      setPreviewMaterialId(sortedMaterials[currentPreviewIndex + 1].id);
    }
  };

  // キーボード操作対応
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewMaterialId) return;
      if (e.key === "Escape") handleClosePreview();
      if (e.key === "ArrowLeft") handlePrevPreview();
      if (e.key === "ArrowRight") handleNextPreview();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewMaterialId, currentPreviewIndex, sortedMaterials]);

  const handleApplySample = () => {
    if (!proposalSlots || proposalSlots.length === 0) return;
    for (const slot of proposalSlots) {
      onAddMaterial(createSampleMaterial(slot.id));
    }
  };

  const slots = proposalSlots && proposalSlots.length > 0 ? proposalSlots : [];

  return (
    <>
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
                  onPreview={handlePreview}
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

      {/* プレビューモーダル */}
      {previewMaterialId && currentMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          {/* 閉じるボタン */}
          <button
            onClick={handleClosePreview}
            className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {/* メイン画像 */}
          <div className="relative flex h-full w-full items-center justify-center p-4 md:p-10" onClick={handleClosePreview}>
            <div onClick={(e) => e.stopPropagation()} className="relative max-h-full max-w-full">
              {currentMaterial.format?.startsWith("image/") ? (
                <img
                  src={currentMaterial.url}
                  alt={currentMaterial.name}
                  className="max-h-[80vh] max-w-full object-contain shadow-2xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-white p-10 bg-white/10 rounded-lg">
                  <FileImage className="h-20 w-20 mb-4 opacity-50" />
                  <p className="text-lg">プレビューできません</p>
                  <p className="text-sm text-gray-400">{currentMaterial.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* ナビゲーションボタン */}
          {currentPreviewIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevPreview(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}
          {currentPreviewIndex < sortedMaterials.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNextPreview(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          {/* 下部情報バー */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 text-white">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <div className="flex flex-col">
                <span className="font-medium text-lg truncate max-w-[300px]">{currentMaterial.name}</span>
                <span className="text-sm text-gray-400">
                  {(currentMaterial.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {currentPreviewIndex + 1} / {sortedMaterials.length}
                </span>
                <a
                  href={currentMaterial.url}
                  download={currentMaterial.name}
                  className="flex items-center gap-2 rounded bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="h-4 w-4" />
                  ダウンロード
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
