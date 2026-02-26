"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Clock, Sparkles, X, Filter, MousePointerClick, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProposalSlot, BannerType, AreaSlot } from "@/lib/types";
import { mockAreaSlots, mockBookings, findOverlappingSlots } from "@/lib/types";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  isBefore,
  isSameDay,
  startOfDay,
  isAfter,
} from "date-fns";
import { ja } from "date-fns/locale";

interface SlotCalendarProps {
  selectedSlots: ProposalSlot[];
  onAddSlot: (slot: ProposalSlot) => void;
  onRemoveSlot: (slotId: string) => void;
  aiRecommendedSlots?: ProposalSlot[];
  readOnly?: boolean;
}

const allBannerTypes: BannerType[] = [
  "バナー各種",
];

// 絞り込み用のバナー種別リスト
const filterBannerOptions: (BannerType | "すべて")[] = [
  "すべて",
  ...allBannerTypes,
];


export function SlotCalendar({
  selectedSlots,
  onAddSlot,
  onRemoveSlot,
  aiRecommendedSlots = [],
  readOnly = false,
}: SlotCalendarProps) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(now));

  // Filters
  const [prefectureFilter, setPrefectureFilter] = useState<string>("all");
  const [bannerTypeFilter, setBannerTypeFilter] = useState<string>("すべて");
  const [statusFilter, setStatusFilter] = useState<string>("すべて");

  // Selection dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAreaSlot, setSelectedAreaSlot] = useState<AreaSlot | null>(null);
  const [selectionStartDay, setSelectionStartDay] = useState<number | null>(null);
  const [selectionEndDay, setSelectionEndDay] = useState<number | null>(null);
  const [selectedBannerType, setSelectedBannerType] = useState<BannerType>("バナー各種");

  // Overlap error
  const [overlapError, setOverlapError] = useState<string | null>(null);

  // Dragging
  const [isDragging, setIsDragging] = useState(false);
  const [dragAreaId, setDragAreaId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const daysInMonth = getDaysInMonth(currentMonth);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Prefectures for filtering
  const prefectures = useMemo(() => {
    const set = new Set(mockAreaSlots.map((a) => a.prefecture));
    return Array.from(set);
  }, []);

  // Filtered area slots
  const filteredAreaSlots = useMemo(() => {
    let slots = mockAreaSlots;
    if (prefectureFilter !== "all") {
      slots = slots.filter((a) => a.prefecture === prefectureFilter);
    }
    return slots;
  }, [prefectureFilter]);

  // Filter bookings by status and banner type
  const getFilteredBookings = useCallback(
    (areaSlotId: string) => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      let bookings = mockBookings.filter(
        (b) =>
          b.areaSlotId === areaSlotId &&
          !isAfter(b.startDate, monthEnd) &&
          !isBefore(b.endDate, monthStart)
      );
      if (statusFilter !== "すべて") {
        bookings = bookings.filter((b) => b.bookingStatus === statusFilter);
      }
      if (bannerTypeFilter !== "すべて") {
        bookings = bookings.filter((b) => b.bannerType === bannerTypeFilter);
      }
      return bookings;
    },
    [currentMonth, statusFilter, bannerTypeFilter]
  );

  // Check if a date is in the past
  const isPastDate = useCallback(
    (day: number) => {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return isBefore(date, startOfDay(now));
    },
    [currentMonth, now]
  );

  // Get proposal slots for an area
  const getProposalSlotsForArea = useCallback(
    (areaSlotId: string) => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      let slots = selectedSlots.filter(
        (s) =>
          s.areaSlotId === areaSlotId &&
          !isAfter(s.startDate, monthEnd) &&
          !isBefore(s.endDate, monthStart)
      );
      if (bannerTypeFilter !== "すべて") {
        slots = slots.filter((s) => s.bannerType === bannerTypeFilter);
      }
      return slots;
    },
    [currentMonth, selectedSlots, bannerTypeFilter]
  );

  // Get AI recommended slots for area
  const getAiSlotsForArea = useCallback(
    (areaSlotId: string) => {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      return aiRecommendedSlots.filter(
        (s) =>
          s.areaSlotId === areaSlotId &&
          !isAfter(s.startDate, monthEnd) &&
          !isBefore(s.endDate, monthStart)
      );
    },
    [currentMonth, aiRecommendedSlots]
  );

  // Calculate bar position within the month grid
  const getBarStyle = (start: Date, end: Date) => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const effectiveStart = isBefore(start, monthStart) ? 1 : start.getDate();
    const effectiveEnd = isAfter(end, monthEnd) ? daysInMonth : end.getDate();

    const left = ((effectiveStart - 1) / daysInMonth) * 100;
    const width = ((effectiveEnd - effectiveStart + 1) / daysInMonth) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  // Handle cell click in month view
  const handleCellMouseDown = (areaSlot: AreaSlot, day: number) => {
    if (readOnly || isPastDate(day)) return;
    setDragAreaId(areaSlot.id);
    setSelectedAreaSlot(areaSlot);
    setSelectionStartDay(day);
    setSelectionEndDay(day);
    setIsDragging(true);
  };

  const handleCellMouseEnter = (areaSlotId: string, day: number) => {
    if (!isDragging || readOnly || areaSlotId !== dragAreaId) return;
    if (isPastDate(day)) return;
    if (selectionStartDay !== null && day >= selectionStartDay) {
      setSelectionEndDay(day);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || selectionStartDay === null || selectionEndDay === null) {
      setIsDragging(false);
      return;
    }
    setIsDragging(false);

    const sDay = Math.min(selectionStartDay, selectionEndDay);
    const eDay = Math.max(selectionStartDay, selectionEndDay);
    setSelectionStartDay(sDay);
    setSelectionEndDay(eDay);
    setIsDialogOpen(true);
  };

  const handleConfirmSelection = () => {
    if (!selectedAreaSlot || selectionStartDay === null || selectionEndDay === null) return;

    const sDay = Math.min(selectionStartDay, selectionEndDay);
    const eDay = Math.max(selectionStartDay, selectionEndDay);

    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), sDay);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), eDay);

    // 重複チェック
    const overlapping = findOverlappingSlots(selectedSlots, startDate, endDate);
    if (overlapping.length > 0) {
      const overlapNames = overlapping
        .map((s) => `${s.areaName || "枠"} (${format(s.startDate, "M/d")}〜${format(s.endDate, "M/d")})`)
        .join(", ");
      setOverlapError(`日程が重複しています: ${overlapNames}`);
      return;
    }

    const newSlot: ProposalSlot = {
      id: `slot-${Date.now()}`,
      areaSlotId: selectedAreaSlot.id,
      areaName: selectedAreaSlot.area,
      startDate,
      endDate,
      bannerType: selectedBannerType,
    };
    onAddSlot(newSlot);
    resetSelection();
  };

  const resetSelection = () => {
    setSelectionStartDay(null);
    setSelectionEndDay(null);
    setSelectedAreaSlot(null);
    setDragAreaId(null);
    setSelectedBannerType("バナー各種");
    setOverlapError(null);
    setIsDialogOpen(false);
  };

  // Check if a day is in current selection range
  const isInSelection = (areaSlotId: string, day: number) => {
    if (!isDragging && !isDialogOpen) return false;
    if (areaSlotId !== dragAreaId) return false;
    if (selectionStartDay === null || selectionEndDay === null) return false;
    const sDay = Math.min(selectionStartDay, selectionEndDay);
    const eDay = Math.max(selectionStartDay, selectionEndDay);
    return day >= sDay && day <= eDay;
  };

  return (
    <div className="space-y-4">
      {/* 選択された提案日程 */}
      {selectedSlots.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">提案日程</Label>
          <div className="flex flex-wrap gap-2">
            {selectedSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm"
              >
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {slot.areaName && <span className="font-medium">{slot.areaName} | </span>}
                  {format(slot.startDate, "M/d", { locale: ja })} -{" "}
                  {format(slot.endDate, "M/d", { locale: ja })}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {slot.bannerType}
                </Badge>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onRemoveSlot(slot.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* カレンダーヘッダー */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold">掲載枠カレンダー</h3>
            <Badge variant="outline" className="gap-1 text-xs">
              <Sparkles className="h-3 w-3" />
              AI
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {/* 月ナビゲーション */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                {format(currentMonth, "yyyy年M月", { locale: ja })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 絞り込みフィルター行 */}
        <div className="flex items-center gap-3 border-b px-4 py-2 bg-muted/10">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">絞り込み:</span>

          {/* 都道府県フィルター */}
          <Select value={prefectureFilter} onValueChange={setPrefectureFilter}>
            <SelectTrigger className="w-[130px] h-7 text-xs">
              <SelectValue placeholder="都道府県" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {prefectures.map((pref) => (
                <SelectItem key={pref} value={pref}>
                  {pref}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* バナー種別フィルター */}
          <Select value={bannerTypeFilter} onValueChange={setBannerTypeFilter}>
            <SelectTrigger className="w-[200px] h-7 text-xs">
              <SelectValue placeholder="バナー種別" />
            </SelectTrigger>
            <SelectContent>
              {filterBannerOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ステータスフィルター */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] h-7 text-xs">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="すべて">すべて</SelectItem>
              <SelectItem value="確定">確定</SelectItem>
              <SelectItem value="仮押さえ">仮押さえ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 月表示 */}
        {(
          <div
            ref={scrollRef}
            className="overflow-x-auto"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* 日付ヘッダー行 */}
            <div className="flex border-b min-w-[900px]">
              <div className="w-[140px] shrink-0 px-3 py-2 text-xs font-medium text-muted-foreground border-r bg-muted/20">
                掲載枠
              </div>
              <div className="flex-1 flex">
                {daysArray.map((day) => {
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const isToday = isSameDay(date, now);
                  const isPast = isPastDate(day);
                  return (
                    <div
                      key={day}
                      className={cn(
                        "flex-1 text-center py-2 text-xs border-r last:border-r-0 min-w-[28px]",
                        isToday && "bg-blue-50 font-bold text-blue-700",
                        isPast && "text-muted-foreground/50"
                      )}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* エリア行 */}
            {filteredAreaSlots.map((areaSlot) => {
              const bookings = getFilteredBookings(areaSlot.id);
              const proposals = getProposalSlotsForArea(areaSlot.id);
              const aiSlots = getAiSlotsForArea(areaSlot.id);

              return (
                <div key={areaSlot.id} className="flex border-b last:border-b-0 min-w-[900px]">
                  {/* エリア名 */}
                  <div className="w-[140px] shrink-0 px-3 py-4 text-sm font-medium border-r bg-muted/10 flex items-center">
                    {areaSlot.area}
                  </div>

                  {/* ガントチャート領域 */}
                  <div className="flex-1 relative" style={{ minHeight: "56px" }}>
                    {/* 日のセル */}
                    <div className="flex absolute inset-0">
                      {daysArray.map((day) => {
                        const past = isPastDate(day);
                        const selected = isInSelection(areaSlot.id, day);
                        return (
                          <div
                            key={day}
                            className={cn(
                              "flex-1 border-r last:border-r-0 min-w-[28px]",
                              !readOnly && !past && "cursor-pointer hover:bg-blue-50/50",
                              past && "bg-muted/20 cursor-not-allowed",
                              selected && "bg-red-100"
                            )}
                            onMouseDown={() => handleCellMouseDown(areaSlot, day)}
                            onMouseEnter={() => handleCellMouseEnter(areaSlot.id, day)}
                          />
                        );
                      })}
                    </div>

                    {/* 既存予約バー */}
                    {bookings.map((booking) => {
                      const style = getBarStyle(booking.startDate, booking.endDate);
                      return (
                        <div
                          key={booking.id}
                          className={cn(
                            "absolute top-1 h-[calc(50%-4px)] rounded-sm text-xs flex items-center px-2 overflow-hidden pointer-events-none z-10",
                            booking.bookingStatus === "確定"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-amber-100 text-amber-800 border border-dashed border-amber-400"
                          )}
                          style={style}
                          title={`${booking.bannerType} / ${booking.hallName}`}
                        >
                          <span className="truncate">{booking.bannerType} / {booking.hallName}</span>
                        </div>
                      );
                    })}

                    {/* 新規案件バー */}
                    {proposals.map((slot) => {
                      const style = getBarStyle(slot.startDate, slot.endDate);
                      return (
                        <div
                          key={slot.id}
                          className="absolute bottom-1 h-[calc(50%-4px)] rounded-sm bg-red-100 border-2 border-red-500 text-red-700 text-xs flex items-center gap-1 px-2 overflow-hidden z-10 group/bar"
                          style={style}
                          title={`新規: ${slot.bannerType}`}
                        >
                          <span className="truncate">{slot.bannerType}</span>
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => onRemoveSlot(slot.id)}
                              className="shrink-0 opacity-0 group-hover/bar:opacity-100 transition-opacity hover:text-red-900"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}

                    {/* AI推奨バー */}
                    {aiSlots.map((slot) => {
                      const style = getBarStyle(slot.startDate, slot.endDate);
                      return (
                        <div
                          key={slot.id}
                          className="absolute bottom-1 h-[calc(50%-4px)] rounded-sm border-2 border-dashed border-amber-400 bg-amber-50 text-amber-700 text-xs flex items-center px-2 overflow-hidden pointer-events-none z-10"
                          style={style}
                        >
                          <span className="truncate">AI推奨</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 凡例 */}
        <div className="p-3 border-t flex flex-wrap items-center gap-4 text-xs text-muted-foreground bg-muted/20">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-6 rounded-sm bg-blue-200 border border-blue-300" />
            <span>確定</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-6 rounded-sm bg-amber-100 border border-dashed border-amber-400" />
            <span>仮押さえ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-6 rounded-sm bg-red-100 border-2 border-red-500" />
            <span>新規案件</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-6 rounded-sm border-2 border-dashed border-amber-400 bg-amber-50" />
            <span>AI推奨枠</span>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-1.5 ml-auto text-blue-600">
              <MousePointerClick className="h-3.5 w-3.5" />
              <span>カレンダー上をドラッグして枠を追加</span>
            </div>
          )}
        </div>
      </div>

      {/* 期間・バナー種別選択ダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetSelection(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>掲載枠の設定</DialogTitle>
            <DialogDescription>
              選択した枠の期間とバナー種別を設定してください。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* エリア名 */}
            {selectedAreaSlot && (
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">掲載枠:</Label>
                <span className="font-medium">{selectedAreaSlot.area}</span>
              </div>
            )}

            {/* 期間表示 */}
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm">
                {selectionStartDay !== null && selectionEndDay !== null && (
                  <>
                    {format(currentMonth, "M月", { locale: ja })}
                    {Math.min(selectionStartDay, selectionEndDay)}日 - {format(currentMonth, "M月", { locale: ja })}
                    {Math.max(selectionStartDay, selectionEndDay)}日
                  </>
                )}
              </div>
            </div>

            {/* バナー種別 */}
            <div className="space-y-2">
              <Label>バナー種別</Label>
              <Select
                value={selectedBannerType}
                onValueChange={(value) => setSelectedBannerType(value as BannerType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allBannerTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 重複エラー表示 */}
            {overlapError && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{overlapError}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetSelection}>
              キャンセル
            </Button>
            <Button onClick={handleConfirmSelection}>追加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
