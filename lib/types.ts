// ========== 新マスタデータ型定義 ==========

export type CompanyData = {
  id: number
  companyId: string
  name: string
  email?: string
}

export type HallData = {
  id: number
  hallId: string
  name: string
  salesPersonName: string
  companyId: number
  discountAmount: number
  address?: string
  email?: string
  prefecture?: string
}

export type EmployeeData = {
  id: number
  name: string
  email: string
  department?: string
}

// ========== 従業員マスタ（50人） ==========

export const initialEmployees: EmployeeData[] = [
  { id: 1, name: "山田 太郎", email: "yamada@example.com", department: "営業部" },
  { id: 2, name: "佐藤 次郎", email: "sato@example.com", department: "営業部" },
  { id: 3, name: "鈴木 三郎", email: "suzuki@example.com", department: "営業部" },
  { id: 4, name: "高橋 四郎", email: "takahashi@example.com", department: "営業部" },
  { id: 5, name: "伊藤 五郎", email: "ito@example.com", department: "営業部" },
  { id: 6, name: "渡辺 六郎", email: "watanabe@example.com", department: "営業部" },
  { id: 7, name: "中村 七郎", email: "nakamura@example.com", department: "営業部" },
  { id: 8, name: "小林 八郎", email: "kobayashi@example.com", department: "営業部" },
  { id: 9, name: "加藤 九郎", email: "kato@example.com", department: "営業部" },
  { id: 10, name: "松本 十郎", email: "matsumoto@example.com", department: "営業部" },
  { id: 11, name: "井上 十一", email: "inoue@example.com", department: "営業部" },
  { id: 12, name: "木村 十二", email: "kimura@example.com", department: "営業部" },
  { id: 13, name: "林 十三", email: "hayashi@example.com", department: "営業部" },
  { id: 14, name: "斎藤 十四", email: "saito@example.com", department: "営業部" },
  { id: 15, name: "清水 十五", email: "shimizu@example.com", department: "営業部" },
  { id: 16, name: "山本 十六", email: "yamamoto@example.com", department: "営業部" },
  { id: 17, name: "森 十七", email: "mori@example.com", department: "営業部" },
  { id: 18, name: "池田 十八", email: "ikeda@example.com", department: "営業部" },
  { id: 19, name: "橋本 十九", email: "hashimoto@example.com", department: "営業部" },
  { id: 20, name: "石川 二十", email: "ishikawa@example.com", department: "営業部" },
  { id: 21, name: "田中 一郎", email: "tanaka@example.com", department: "営業部" },
  { id: 22, name: "佐々木 二郎", email: "sasaki@example.com", department: "営業部" },
  { id: 23, name: "山口 三郎", email: "yamaguchi@example.com", department: "営業部" },
  { id: 24, name: "松井 四郎", email: "matsui@example.com", department: "営業部" },
  { id: 25, name: "村上 五郎", email: "murakami@example.com", department: "営業部" },
  { id: 26, name: "前田 六郎", email: "maeda@example.com", department: "営業部" },
  { id: 27, name: "長谷川 七郎", email: "hasegawa@example.com", department: "営業部" },
  { id: 28, name: "藤田 八郎", email: "fujita@example.com", department: "営業部" },
  { id: 29, name: "近藤 九郎", email: "kondo@example.com", department: "営業部" },
  { id: 30, name: "遠藤 十郎", email: "endo@example.com", department: "営業部" },
  { id: 31, name: "青木 花子", email: "aoki@example.com", department: "管理部" },
  { id: 32, name: "新井 美咲", email: "arai@example.com", department: "管理部" },
  { id: 33, name: "荒井 さくら", email: "arai2@example.com", department: "管理部" },
  { id: 34, name: "石井 みゆき", email: "ishii@example.com", department: "管理部" },
  { id: 35, name: "上田 あかり", email: "ueda@example.com", department: "管理部" },
  { id: 36, name: "内田 ゆい", email: "uchida@example.com", department: "管理部" },
  { id: 37, name: "江藤 まい", email: "eto@example.com", department: "管理部" },
  { id: 38, name: "大野 りん", email: "ono@example.com", department: "管理部" },
  { id: 39, name: "小野 なな", email: "ono2@example.com", department: "管理部" },
  { id: 40, name: "尾崎 はるか", email: "ozaki@example.com", department: "管理部" },
  { id: 41, name: "岡田 健", email: "okada@example.com", department: "経理部" },
  { id: 42, name: "奥田 誠", email: "okuda@example.com", department: "経理部" },
  { id: 43, name: "片山 智", email: "katayama@example.com", department: "経理部" },
  { id: 44, name: "金田 勇", email: "kaneda@example.com", department: "経理部" },
  { id: 45, name: "川上 剛", email: "kawakami@example.com", department: "経理部" },
  { id: 46, name: "河野 進", email: "kono@example.com", department: "経理部" },
  { id: 47, name: "菊地 優", email: "kikuchi@example.com", department: "経理部" },
  { id: 48, name: "工藤 大", email: "kudo@example.com", department: "経理部" },
  { id: 49, name: "久保 翔", email: "kubo@example.com", department: "経理部" },
  { id: 50, name: "黒田 亮", email: "kuroda@example.com", department: "経理部" },
]

// ========== 法人マスタ（10社） ==========

export const initialCompanies: CompanyData[] = [
  { id: 1, companyId: "CORP-001", name: "株式会社マルハン", email: "maruhan@example.com" },
  { id: 2, companyId: "CORP-002", name: "株式会社ダイナム", email: "dynam@example.com" },
  { id: 3, companyId: "CORP-003", name: "株式会社ガイア", email: "gaia@example.com" },
  { id: 4, companyId: "CORP-004", name: "株式会社エース", email: "ace@example.com" },
  { id: 5, companyId: "CORP-005", name: "株式会社サンライズ", email: "sunrise@example.com" },
  { id: 6, companyId: "CORP-006", name: "株式会社ビッグエース", email: "bigace@example.com" },
  { id: 7, companyId: "CORP-007", name: "株式会社パチンコランド", email: "pachinkoland@example.com" },
  { id: 8, companyId: "CORP-008", name: "株式会社エースパチンコ", email: "acepachinko@example.com" },
  { id: 9, companyId: "CORP-009", name: "株式会社パチンコワールド", email: "pachinkoworld@example.com" },
  { id: 10, companyId: "CORP-010", name: "株式会社ビッグパチンコ", email: "bigpachinko@example.com" },
]

// ========== ホールデータ生成（10法人 × 20ホール = 200ホール） ==========

const hallLocations = [
  "本店", "渋谷店", "新宿店", "池袋店", "上野店",
  "錦糸町店", "新橋店", "横浜店", "川崎店", "大宮店",
  "千葉店", "船橋店", "柏店", "立川店", "八王子店",
  "町田店", "相模原店", "厚木店", "藤沢店", "鎌倉店",
]

const prefectures = [
  "東京都", "東京都", "東京都", "東京都", "東京都",
  "東京都", "東京都", "神奈川県", "神奈川県", "埼玉県",
  "千葉県", "千葉県", "千葉県", "東京都", "東京都",
  "東京都", "神奈川県", "神奈川県", "神奈川県", "神奈川県",
]

function generateRandomDiscount(): number {
  return (Math.floor(Math.random() * 10) + 1) * 5000
}

export const generateInitialHalls = (): HallData[] => {
  const halls: HallData[] = []
  let hallCounter = 1
  const employeeNames = initialEmployees.map((e) => e.name)
  initialCompanies.forEach((company, companyIndex) => {
    for (let i = 1; i <= 20; i++) {
      const salesPersonIndex = (companyIndex * 20 + i - 1) % employeeNames.length
      const hallNumber = String(i).padStart(2, "0")
      const location = hallLocations[i - 1]
      halls.push({
        id: hallCounter,
        hallId: `${company.companyId}-HALL-${hallNumber}`,
        name: `${company.name.replace("株式会社", "")}${location}`,
        address: `${prefectures[i - 1]}サンプル市${hallCounter}丁目`,
        email: `${company.companyId.toLowerCase()}-hall-${hallNumber}@example.com`,
        salesPersonName: employeeNames[salesPersonIndex],
        companyId: company.id,
        discountAmount: generateRandomDiscount(),
        prefecture: prefectures[i - 1],
      })
      hallCounter++
    }
  })
  return halls
}

export const initialHalls: HallData[] = generateInitialHalls()

// ========== 検索ロジック（純粋関数） ==========

export function searchHalls(halls: HallData[], query: string, companyId?: number): HallData[] {
  let filtered = halls
  if (companyId !== undefined) {
    filtered = filtered.filter((h) => h.companyId === companyId)
  }
  if (!query) return filtered
  const q = query.toLowerCase()
  return filtered.filter((h) => h.name.toLowerCase().includes(q))
}

export function searchCompanies(companies: CompanyData[], query: string): CompanyData[] {
  if (!query) return companies
  const q = query.toLowerCase()
  return companies.filter(
    (c) => c.name.toLowerCase().includes(q) || c.companyId.toLowerCase().includes(q)
  )
}

export function findCompanyByCompanyId(companies: CompanyData[], companyId: string): CompanyData | null {
  return companies.find((c) => c.companyId === companyId) || null
}

export function getHallsByCompanyId(halls: HallData[], companyId: number): HallData[] {
  return halls.filter((h) => h.companyId === companyId)
}

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

// 掲載枠の予約（既存）
export interface SlotBooking {
  id: string;
  areaSlotId: string;
  bannerType: BannerType;
  hallName: string;
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

// 既存の予約
export const mockBookings: SlotBooking[] = [
  { id: "bk-1", areaSlotId: "area-1", bannerType: "メインバナー", hallName: "マルハン渋谷店", startDate: new Date("2026-02-01"), endDate: new Date("2026-02-07"), startHour: 0, endHour: 24, bookingStatus: "確定" },
  { id: "bk-2", areaSlotId: "area-1", bannerType: "ローテーションバナー", hallName: "ダイナム渋谷店", startDate: new Date("2026-02-10"), endDate: new Date("2026-02-22"), startHour: 0, endHour: 24, bookingStatus: "確定" },
  { id: "bk-3", areaSlotId: "area-2", bannerType: "お知らせバナー", hallName: "ガイア渋谷店", startDate: new Date("2026-02-05"), endDate: new Date("2026-02-14"), startHour: 0, endHour: 24, bookingStatus: "確定" },
  { id: "bk-4", areaSlotId: "area-3", bannerType: "スプラッシュバナー", hallName: "エース新宿店", startDate: new Date("2026-02-01"), endDate: new Date("2026-02-10"), startHour: 0, endHour: 24, bookingStatus: "仮押さえ" },
  { id: "bk-5", areaSlotId: "area-5", bannerType: "サブバナー", hallName: "マルハン池袋店", startDate: new Date("2026-02-15"), endDate: new Date("2026-02-25"), startHour: 0, endHour: 24, bookingStatus: "確定" },
  { id: "bk-6", areaSlotId: "area-6", bannerType: "動画バナー", hallName: "サンライズ池袋店", startDate: new Date("2026-03-01"), endDate: new Date("2026-03-10"), startHour: 0, endHour: 24, bookingStatus: "仮押さえ" },
  { id: "bk-7", areaSlotId: "area-7", bannerType: "取材来店バナー", hallName: "ビッグエース品川店", startDate: new Date("2026-02-08"), endDate: new Date("2026-02-18"), startHour: 0, endHour: 24, bookingStatus: "確定" },
  { id: "bk-8", areaSlotId: "area-9", bannerType: "都道府県バナー", hallName: "ダイナム横浜店", startDate: new Date("2026-02-03"), endDate: new Date("2026-02-12"), startHour: 0, endHour: 24, bookingStatus: "確定" },
  { id: "bk-9", areaSlotId: "area-11", bannerType: "マイページバナー", hallName: "マルハン梅田店", startDate: new Date("2026-02-10"), endDate: new Date("2026-02-20"), startHour: 0, endHour: 24, bookingStatus: "仮押さえ" },
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
        bannerType: "ローテーションバナー",
      },
    ],
    aiRecommendedSlots: [
      {
        id: "ai-slot-1",
        startDate: new Date("2026-02-10"),
        endDate: new Date("2026-02-20"),
        startTime: "10:00",
        endTime: "17:00",
        bannerType: "サブバナー",
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
        bannerType: "お知らせバナー",
      },
      {
        id: "slot-2b",
        areaSlotId: "area-5",
        areaName: "池袋エリアA枠",
        startDate: new Date("2026-02-10"),
        endDate: new Date("2026-02-25"),
        startTime: "00:00",
        endTime: "23:59",
        bannerType: "スプラッシュバナー",
      },
      {
        id: "slot-2c",
        areaSlotId: "area-9",
        areaName: "横浜エリアA枠",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-03-15"),
        startTime: "08:00",
        endTime: "20:00",
        bannerType: "動画バナー",
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
        bannerType: "取材来店バナー",
      },
      {
        id: "slot-3b",
        areaSlotId: "area-7",
        areaName: "品川エリアA枠",
        startDate: new Date("2026-03-05"),
        endDate: new Date("2026-03-20"),
        startTime: "09:00",
        endTime: "21:00",
        bannerType: "都道府県バナー",
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
        bannerType: "【FP課】マイページバナー",
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
        bannerType: "メインバナー",
      },
    ],
    adminReviewStatus: "rejected",
    adminReviewComment: "画像サイズが規定に合っていません。1200x628pxに修正してください。",
  },
];
