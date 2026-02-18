"use client";

import React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, X, Download, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationData {
  applicationType: string;
  companyName: string;
  storeName: string;
  contractAmount: string;
  startDate: string;
  endDate: string;
  bannerType: string;
  contactPerson: string;
  contactEmail: string;
  notes: string;
}

const APPLICATION_TYPES = [
  "【マルハン様用】LINE広告お申込書Ver1.0（友だちオーディエンス）",
  "【マルハン様用】LINE広告お申込書Ver2.0_1018",
  "LINE広告お申込書（電話番号ターゲティング）Ver1.0_0604",
  "LINE広告お申込書Ver1.0（友だちオーディエンス）",
  "LINE広告お申込書Ver2.0_1018",
  "LINE広告お申込書ベガス米沢店0125",
  "LINE広告友だち追加申込書Ver2.0_1018",
];

interface ApplicationUploadProps {
  documentUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  readOnly?: boolean;
  /** trueの場合、初期状態でサンプルデータを展開して表示 */
  alwaysShowData?: boolean;
  /** 周年パックかどうか */
  isAnniversaryPack?: boolean;
  /** 使用中の周年パック名 */
  anniversaryPackTitle?: string;
  /** 周年パックの有効期限 */
  anniversaryPackExpiry?: string;
}

const sampleApplicationData: ApplicationData = {
  applicationType: APPLICATION_TYPES[0],
  companyName: "株式会社サンプル",
  storeName: "東京本店",
  contractAmount: "450,000",
  startDate: "2026-02-01",
  endDate: "2026-02-28",
  bannerType: "メインバナー",
  contactPerson: "山田太郎",
  contactEmail: "yamada@sample.co.jp",
  notes: "特記事項なし",
};

export function ApplicationUpload({
  documentUrl,
  onUpload,
  onRemove,
  readOnly = false,
  alwaysShowData = false,
  isAnniversaryPack = false,
  anniversaryPackTitle,
  anniversaryPackExpiry,
}: ApplicationUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(
    alwaysShowData ? "sample_application.pdf" : null
  );
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(
    alwaysShowData ? { ...sampleApplicationData } : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 周年パックの場合、契約金額を0にする
  useEffect(() => {
    if (isAnniversaryPack && applicationData && applicationData.contractAmount !== "0") {
      setApplicationData((prev) => (prev ? { ...prev, contractAmount: "0" } : null));
    }
  }, [isAnniversaryPack, applicationData]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    setApplicationData({ ...sampleApplicationData });
    const url = URL.createObjectURL(file);
    onUpload(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemove = () => {
    setFileName(null);
    setApplicationData(null);
    onRemove();
  };

  const handleApplySample = () => {
    setApplicationData({ ...sampleApplicationData });
    setFileName("sample_application.pdf");
    onUpload("sample-url");
  };

  const handleDataChange = (field: keyof ApplicationData, value: string) => {
    if (applicationData) {
      setApplicationData({ ...applicationData, [field]: value });
    }
  };

  const hasData = documentUrl || applicationData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">申込書</CardTitle>
            <CardDescription>申込書の内容確認中</CardDescription>
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
      </CardHeader>
      <CardContent className="space-y-4">
        {/* アップロード領域: readOnlyでなくデータがない場合のみ表示 */}
        {!hasData && !readOnly && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground text-center">
              申込書をドラッグ＆ドロップ、またはクリックして選択
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              対応形式: PDF, Word, Excel
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        )}

        {/* ファイル情報 */}
        {hasData && (
          <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {fileName || "申込書.pdf"}
              </p>
              <p className="text-xs text-muted-foreground">アップロード済み</p>
            </div>
            <div className="flex items-center gap-2">
              {documentUrl && (
                <>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a href={documentUrl} download>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </>
              )}
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 申込書データ: 常に展開して表示 */}
        {applicationData && (
          <div className="rounded-lg border p-4 space-y-4">
            <h4 className="text-sm font-medium">申込書の内容</h4>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">申込書タイプ</Label>
              <Select
                value={applicationData.applicationType}
                onValueChange={(value) => handleDataChange("applicationType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="申込書タイプを選択" />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">法人名</Label>
                <Input
                  value={applicationData.companyName}
                  onChange={(e) => handleDataChange("companyName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">店舗名</Label>
                <Input
                  value={applicationData.storeName}
                  onChange={(e) => handleDataChange("storeName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">契約金額</Label>
                <Input
                  value={applicationData.contractAmount}
                  onChange={(e) => handleDataChange("contractAmount", e.target.value)}
                  disabled={isAnniversaryPack}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">ホール請求額</Label>
                {isAnniversaryPack ? (
                  <div className="space-y-2">
                    <Input value="¥0" readOnly className="bg-muted/30 font-medium" />
                    {anniversaryPackTitle && (
                      <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
                        <p className="text-xs font-medium text-blue-800">
                          周年パック適用中: {anniversaryPackTitle}
                        </p>
                        {anniversaryPackExpiry && (
                          <p className="text-xs text-blue-600 mt-0.5">
                            有効期限: {anniversaryPackExpiry}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    value={applicationData.contractAmount}
                    onChange={(e) => handleDataChange("contractAmount", e.target.value)}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">バナー種別</Label>
                <Input
                  value={applicationData.bannerType}
                  onChange={(e) => handleDataChange("bannerType", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">開始日</Label>
                <Input
                  type="date"
                  value={applicationData.startDate}
                  onChange={(e) => handleDataChange("startDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">終了日</Label>
                <Input
                  type="date"
                  value={applicationData.endDate}
                  onChange={(e) => handleDataChange("endDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">担当者名</Label>
                <Input
                  value={applicationData.contactPerson}
                  onChange={(e) => handleDataChange("contactPerson", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">連絡先メール</Label>
                <Input
                  type="email"
                  value={applicationData.contactEmail}
                  onChange={(e) => handleDataChange("contactEmail", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">備考</Label>
              <Input
                value={applicationData.notes}
                onChange={(e) => handleDataChange("notes", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* データもドキュメントもない場合の表示（readOnly時） */}
        {!hasData && readOnly && (
          <p className="text-sm text-muted-foreground text-center py-4">
            申込書はまだアップロードされていません
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          掲載を停止すると、管理画面の設定を削除しカレンダーの枠を解放します
        </p>
      </CardContent>
    </Card>
  );
}
