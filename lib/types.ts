// 案件のステータス
export type CaseStatus = 
  | "提案中" 
  | "配信準備中" 
  | "事務確認中" 
  | "差し戻し" 
  | "掲載中" 
  | "見送り" 
  | "却下" 
  | "掲載停止依頼中"
  | "掲載停止";

// バナー種別
export type BannerType =
  | "未定"
  | "【FP課】マイページバナー"
  | "お知らせバナー"
  | "サブバナー"
  | "スプラッシュバナー"
  | "マイページバナー"
  | "メインバナー"
  | "ローテーションバナー"
  | "動画バナー"
  | "取材来店バナー"
  | "都道府県バナー";

// エリア
export interface AreaSlot {
  id: string;
  area: string; // "渋谷エリアA枠" etc.
  areaGroup: string; // "渋谷" "新宿" "池袋" etc.
  prefecture: string; // "東京都" etc.
}

// 掲載枠の予約（既存クライアント）
export interface SlotBooking {
  id: string;
  areaSlotId: string;
  clientName: string;
  startDate: Date;
  endDate: Date;
  startHour: number;
  endHour: number;
  bookingStatus: "確定" | "仮押さえ";
}

// 提案日程
export interface ProposalSlot {
  id: string;
  areaSlotId?: string;
  areaName?: string;
  startDate: Date;
  endDate: Date;
  startTime: string; // "HH:mm" format
  endTime: string; // "HH:mm" format
  bannerType: BannerType;
}

// 案件
export interface Case {
  id: string;
  corporateName: string;
  storeName: string;
  status: CaseStatus;
  createdAt: Date;
  updatedAt: Date;
  proposalSlots: ProposalSlot[];
  billingAmount?: number | null;
  anniversaryPackCode?: string;
  isAnniversaryPack?: boolean;
  implementationPolicy?: string;
  applicationDocument?: File | null;
  applicationDocumentUrl?: string;
  publishingContent?: string;
  materials?: MaterialFile[];
  aiRecommendedSlots?: ProposalSlot[];
  adminReviewStatus?: "pending" | "approved" | "rejected";
  adminReviewComment?: string;
  stopPublishingRequest?: string;
}

// 素材ファイル
export interface MaterialFile {
  id: string;
  slotId?: string; // 紐づく掲載枠のProposalSlot id
  name: string;
  url: string;
  size: number;
  width?: number;
  height?: number;
  format?: string;
  colorMode?: string;
  uploadedAt: Date;
  validationErrors?: string[];
}

// 法人
export interface Corporation {
  id: string;
  name: string;
  stores: Store[];
}

// 店舗
export interface Store {
  id: string;
  name: string;
  corporationId: string;
}

// 周年パック
export interface AnniversaryPack {
  id: string;
  corporationId: string;
  title: string; // "5万円プラン" | "10万円プラン" | "20万円プラン"
  expiryDate: Date;
  remainingAmount: number;
}

// 周年パックモックデータ
export const mockAnniversaryPacks: AnniversaryPack[] = [
  {
    id: "pack-1",
    corporationId: "corp-1",
    title: "10万円プラン",
    expiryDate: new Date("2026-06-30"),
    remainingAmount: 75000,
  },
  {
    id: "pack-2",
    corporationId: "corp-1",
    title: "5万円プラン",
    expiryDate: new Date("2026-03-31"),
    remainingAmount: 30000,
  },
  {
    id: "pack-3",
    corporationId: "corp-2",
    title: "20万円プラン",
    expiryDate: new Date("2026-12-31"),
    remainingAmount: 150000,
  },
];

// モックデータ
export const mockCorporations: Corporation[] = [
  {
    id: "corp-1",
    name: "株式会社サンプル",
    stores: [
      { id: "store-1", name: "東京本店", corporationId: "corp-1" },
      { id: "store-2", name: "大阪支店", corporationId: "corp-1" },
      { id: "store-3", name: "名古屋支店", corporationId: "corp-1" },
    ],
  },
  {
    id: "corp-2",
    name: "株式会社テスト",
    stores: [
      { id: "store-4", name: "渋谷店", corporationId: "corp-2" },
      { id: "store-5", name: "新宿店", corporationId: "corp-2" },
    ],
  },
  {
    id: "corp-3",
    name: "ABC商事株式会社",
    stores: [
      { id: "store-6", name: "銀座店", corporationId: "corp-3" },
    ],
  },
];

// エリア枠マスタ
export const mockAreaSlots: AreaSlot[] = [
  { id: "area-1", area: "渋谷エリアA枠", areaGroup: "渋谷", prefecture: "東京都" },
  { id: "area-2", area: "渋谷エリアB枠", areaGroup: "渋谷", prefecture: "東京都" },
  { id: "area-3", area: "新宿エリアA枠", areaGroup: "新宿", prefecture: "東京都" },
  { id: "area-4", area: "新宿エリアB枠", areaGroup: "新宿", prefecture: "東京都" },
  { id: "area-5", area: "池袋エリアA枠", areaGroup: "池袋", prefecture: "東京都" },
  { id: "area-6", area: "池袋エリアB枠", areaGroup: "池袋", prefecture: "東京都" },
  { id: "area-7", area: "品川エリアA枠", areaGroup: "品川", prefecture: "東京都" },
  { id: "area-8", area: "品川エリアB枠", areaGroup: "品川", prefecture: "東京都" },
  { id: "area-9", area: "横浜エリアA枠", areaGroup: "横浜", prefecture: "神奈川県" },
  { id: "area-10", area: "横浜エリアB枠", areaGroup: "横浜", prefecture: "神奈川県" },
  { id: "area-11", area: "梅田エリアA枠", areaGroup: "梅田", prefecture: "大阪府" },
  { id: "area-12", area: "梅田エリアB枠", areaGroup: "梅田", prefecture: "大阪府" },
];

// 既存クライアントの予約
export const mockBookings: SlotBooking[] = [
  { id: "bk-1", areaSlotId: "area-1", clientName: "クライアントA", startDate: new Date("2026-02-01"), endDate: new Date("2026-02-07"), startHour: 0, endHour: 24, bookingStatus: "確定" },
  { id: "bk-2", areaSlotId: "area-1", clientName: "クライアントB", startDate: new Date("2026-02-10"), endDate: new Date("2026-02-22"), startHour: 0, endHour: 24, bookingStatus: "確定" },
  { id: "bk-3", areaSlotId: "area-2", clientName: "クライアントC", startDate: new Date("2026-02-05"), endDate: new Date("2026-02-14"), startHour: 0, endHour: 24, bookingStatus: "確定" },
  { id: "bk-4", areaSlotId: "area-3", clientName: "クライアントD", startDate: new Date("2026-02-01"), endDate: new Date("2026-02-10"), startHour: 0, endHour: 24, bookingStatus: "仮押さえ" },
  { id: "bk-5", areaSlotId: "area-5", clientName: "クライアントE", startDate: new Date("2026-02-15"), endDate: new Date("2026-02-25"), startHour: 0, endHour: 24, bookingStatus: "確定" },
  { id: "bk-6", areaSlotId: "area-6", clientName: "クライアントF", startDate: new Date("2026-03-01"), endDate: new Date("2026-03-10"), startHour: 0, endHour: 24, bookingStatus: "仮押さえ" },
  { id: "bk-7", areaSlotId: "area-7", clientName: "クライアントG", startDate: new Date("2026-02-08"), endDate: new Date("2026-02-18"), startHour: 0, endHour: 24, bookingStatus: "確定" },
  { id: "bk-8", areaSlotId: "area-9", clientName: "クライアントH", startDate: new Date("2026-02-03"), endDate: new Date("2026-02-12"), startHour: 0, endHour: 24, bookingStatus: "確定" },
  { id: "bk-9", areaSlotId: "area-11", clientName: "クライアントI", startDate: new Date("2026-02-10"), endDate: new Date("2026-02-20"), startHour: 0, endHour: 24, bookingStatus: "仮押さえ" },
];

export const mockCases: Case[] = [
  {
    id: "case-1",
    corporateName: "株式会社サンプル",
    storeName: "東京本店",
    status: "提案中",
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date("2026-01-20"),
    proposalSlots: [
      {
        id: "slot-1",
        areaSlotId: "area-1",
        areaName: "渋谷エリアA枠",
        startDate: new Date("2026-02-01"),
        endDate: new Date("2026-02-15"),
        startTime: "09:00",
        endTime: "18:00",
        bannerType: "メインバナー",
      },
      {
        id: "slot-1b",
        areaSlotId: "area-3",
        areaName: "新宿エリアA枠",
        startDate: new Date("2026-02-05"),
        endDate: new Date("2026-02-20"),
        startTime: "10:00",
        endTime: "22:00",
        bannerType: "サブバナー",
      },
    ],
    aiRecommendedSlots: [
      {
        id: "ai-slot-1",
        startDate: new Date("2026-02-10"),
        endDate: new Date("2026-02-20"),
        startTime: "10:00",
        endTime: "17:00",
        bannerType: "動画バナー",
      },
    ],
  },
  {
    id: "case-2",
    corporateName: "株式会社テスト",
    storeName: "渋谷店",
    status: "配信準備中",
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-01-25"),
    proposalSlots: [
      {
        id: "slot-2a",
        areaSlotId: "area-2",
        areaName: "渋谷エリアB枠",
        startDate: new Date("2026-02-05"),
        endDate: new Date("2026-02-28"),
        startTime: "10:00",
        endTime: "20:00",
        bannerType: "動画バナー",
      },
      {
        id: "slot-2b",
        areaSlotId: "area-5",
        areaName: "池袋エリアA枠",
        startDate: new Date("2026-02-10"),
        endDate: new Date("2026-02-25"),
        startTime: "00:00",
        endTime: "23:59",
        bannerType: "メインバナー",
      },
      {
        id: "slot-2c",
        areaSlotId: "area-9",
        areaName: "横浜エリアA枠",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-03-15"),
        startTime: "08:00",
        endTime: "20:00",
        bannerType: "お知らせバナー",
      },
    ],
  },
  {
    id: "case-3",
    corporateName: "ABC商事株式会社",
    storeName: "銀座店",
    status: "事務確認中",
    createdAt: new Date("2026-01-05"),
    updatedAt: new Date("2026-01-30"),
    proposalSlots: [
      {
        id: "slot-3a",
        areaSlotId: "area-1",
        areaName: "渋谷エリアA枠",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-03-15"),
        startTime: "08:00",
        endTime: "22:00",
        bannerType: "ローテーションバナー",
      },
      {
        id: "slot-3b",
        areaSlotId: "area-7",
        areaName: "品川エリアA枠",
        startDate: new Date("2026-03-05"),
        endDate: new Date("2026-03-20"),
        startTime: "09:00",
        endTime: "21:00",
        bannerType: "スプラッシュバナー",
      },
    ],
    adminReviewStatus: "pending",
  },
  {
    id: "case-4",
    corporateName: "株式会社サンプル",
    storeName: "大阪支店",
    status: "掲載中",
    createdAt: new Date("2025-12-20"),
    updatedAt: new Date("2026-01-15"),
    proposalSlots: [
      {
        id: "slot-4a",
        areaSlotId: "area-11",
        areaName: "梅田エリアA枠",
        startDate: new Date("2026-01-15"),
        endDate: new Date("2026-02-15"),
        startTime: "09:00",
        endTime: "21:00",
        bannerType: "マイページバナー",
      },
      {
        id: "slot-4b",
        areaSlotId: "area-12",
        areaName: "梅田エリアB枠",
        startDate: new Date("2026-01-20"),
        endDate: new Date("2026-02-20"),
        startTime: "10:00",
        endTime: "20:00",
        bannerType: "取材来店バナー",
      },
    ],
    adminReviewStatus: "approved",
  },
  {
    id: "case-5",
    corporateName: "株式会社テスト",
    storeName: "新宿店",
    status: "見送り",
    createdAt: new Date("2025-12-15"),
    updatedAt: new Date("2026-01-10"),
    proposalSlots: [],
  },
  {
    id: "case-6",
    corporateName: "株式会社サンプル",
    storeName: "名古屋支店",
    status: "差し戻し",
    createdAt: new Date("2026-01-08"),
    updatedAt: new Date("2026-01-28"),
    proposalSlots: [
      {
        id: "slot-6a",
        areaSlotId: "area-4",
        areaName: "新宿エリアB枠",
        startDate: new Date("2026-02-20"),
        endDate: new Date("2026-03-05"),
        startTime: "12:00",
        endTime: "18:00",
        bannerType: "サブバナー",
      },
      {
        id: "slot-6b",
        areaSlotId: "area-6",
        areaName: "池袋エリアB枠",
        startDate: new Date("2026-02-25"),
        endDate: new Date("2026-03-10"),
        startTime: "09:00",
        endTime: "23:00",
        bannerType: "都道府県バナー",
      },
    ],
    adminReviewStatus: "rejected",
    adminReviewComment: "画像サイズが規定に合っていません。1200x628pxに修正してください。",
  },
];
