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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, Clock, Sparkles, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProposalSlot, BannerType, AreaSlot, SlotBooking } from "@/lib/types";
import { mockAreaSlots, mockBookings } from "@/lib/types";
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
  addDays,
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
  "未定",
  "【FP課】マイページバナー",
  "お知らせバナー",
  "サブバナー",
  "スプラッシュバナー",
  "マイページバナー",
  "メインバナー",
  "ローテーションバナー",
  "動画バナー",
  "取材来店バナー",
  "都道府県バナー",
];

const filterBannerTypes = ["すべて", ...allBannerTypes.filter(t => t !== "未定")];

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(),
  label: `${i.toString().padStart(2, "0")}:00`,
}));

export function SlotCalendar({
  selectedSlots,
  onAddSlot,
  onRemoveSlot,
  aiRecommendedSlots = [],
  readOnly = false,
}: SlotCalendarProps) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(now));
  const [viewMode, setViewMode] = useState<"month" | "day">("month");
  const [selectedDay, setSelectedDay] = useState<Date>(now);

  // Filters
  const [prefectureFilter, setPrefectureFilter] = useState<string>("all");
  const [bannerTypeFilter, setBannerTypeFilter] = useState<string>("すべて");
  const [statusFilter, setStatusFilter] = useState<string>("すべて");

  // Selection dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAreaSlot, setSelectedAreaSlot] = useState<AreaSlot | null>(null);
  const [selectionStartDay, setSelectionStartDay] = useState<number | null>(null);
  const [selectionEndDay, setSelectionEndDay] = useState<number | null>(null);
  const [startHour, setStartHour] = useState("13");
  const [endHour, setEndHour] = useState("14");
  const [selectedBannerType, setSelectedBannerType] = useState<BannerType>("未定");

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

  // Filter bookings by status
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
      return bookings;
    },
    [currentMonth, statusFilter]
  );

  // Check if a date is in the past
  const isPastDate = useCallback(
    (day: number) => {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      return isBefore(date, startOfDay(now));
    },
    [currentMonth, now]
  );

  // Check if a date is past including hour for day view
  const isPastDateTime = useCallback(
    (day: number, hour: number) => {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, hour);
      return isBefore(date, now);
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
    setStartHour("13");
    setEndHour("14");
    setIsDialogOpen(true);
  };

  const handleConfirmSelection = () => {
    if (!selectedAreaSlot || selectionStartDay === null || selectionEndDay === null) return;

    const sDay = Math.min(selectionStartDay, selectionEndDay);
    const eDay = Math.max(selectionStartDay, selectionEndDay);
    const sHour = parseInt(startHour);
    const eHour = parseInt(endHour);

    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), sDay);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), eDay);

    if (isSameDay(startDate, endDate) && eHour <= sHour) {
      return;
    }

    const newSlot: ProposalSlot = {
      id: `slot-${Date.now()}`,
      areaSlotId: selectedAreaSlot.id,
      areaName: selectedAreaSlot.area,
      startDate,
      endDate,
      startTime: `${startHour.padStart(2, "0")}:00`,
      endTime: `${endHour.padStart(2, "0")}:00`,
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
    setSelectedBannerType("未定");
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

  // Valid end hour options (must be after start hour with 1hr gap)
  const validEndHourOptions = useMemo(() => {
    const sHour = parseInt(startHour);
    return hourOptions.filter((h) => parseInt(h.value) > sHour);
  }, [startHour]);

  // When start hour changes, adjust end hour if needed
  const handleStartHourChange = (value: string) => {
    setStartHour(value);
    const sHour = parseInt(value);
    const eHour = parseInt(endHour);
    if (eHour <= sHour) {
      setEndHour(Math.min(sHour + 1, 23).toString());
    }
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
                  {format(slot.startDate, "M/d", { locale: ja })} {slot.startTime} -{" "}
                  {format(slot.endDate, "M/d", { locale: ja })} {slot.endTime}
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
            {/* 日/月切り替え */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "month" | "day")}>
              <TabsList className="h-8">
                <TabsTrigger value="day" className="text-xs px-3 h-6">
                  日
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs px-3 h-6">
                  月
                </TabsTrigger>
              </TabsList>
            </Tabs>

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
              {filterBannerTypes.map((type) => (
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
        {viewMode === "month" && (
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
                        >
                          <span className="truncate">{booking.clientName}</span>
                        </div>
                      );
                    })}

                    {/* 新規案件バー */}
                    {proposals.map((slot) => {
                      const style = getBarStyle(slot.startDate, slot.endDate);
                      return (
                        <div
                          key={slot.id}
                          className="absolute bottom-1 h-[calc(50%-4px)] rounded-sm bg-red-100 border-2 border-red-500 text-red-700 text-xs flex items-center px-2 overflow-hidden z-10"
                          style={style}
                        >
                          <span className="truncate">新規案件</span>
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

        {/* 日表示（24時間タイムライン） */}
        {viewMode === "day" && (
          <div>
            {/* 日付ナビゲーション */}
            <div className="flex items-center justify-center gap-2 border-b py-2 bg-muted/10">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSelectedDay(addDays(selectedDay, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {format(selectedDay, "yyyy年M月d日(E)", { locale: ja })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setSelectedDay(addDays(selectedDay, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* 時間ヘッダー */}
            <div className="flex border-b overflow-x-auto min-w-[900px]">
              <div className="w-[140px] shrink-0 px-3 py-2 text-xs font-medium text-muted-foreground border-r bg-muted/20">
                掲載枠
              </div>
              <div className="flex-1 flex">
                {Array.from({ length: 24 }, (_, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center py-2 text-xs border-r last:border-r-0 min-w-[32px]"
                  >
                    {i.toString().padStart(2, "0")}
                  </div>
                ))}
              </div>
            </div>

            {/* エリア行（日表示） */}
            {filteredAreaSlots.map((areaSlot) => {
              const bookings = mockBookings.filter(
                (b) =>
                  b.areaSlotId === areaSlot.id &&
                  !isAfter(b.startDate, selectedDay) &&
                  !isBefore(b.endDate, selectedDay)
              );
              const filteredDayBookings = statusFilter !== "すべて"
                ? bookings.filter((b) => b.bookingStatus === statusFilter)
                : bookings;
              const proposals = selectedSlots.filter(
                (s) =>
                  s.areaSlotId === areaSlot.id &&
                  !isAfter(s.startDate, selectedDay) &&
                  !isBefore(s.endDate, selectedDay)
              );

              return (
                <div key={areaSlot.id} className="flex border-b last:border-b-0 min-w-[900px]">
                  <div className="w-[140px] shrink-0 px-3 py-4 text-sm font-medium border-r bg-muted/10 flex items-center">
                    {areaSlot.area}
                  </div>
                  <div className="flex-1 relative" style={{ minHeight: "56px" }}>
                    {/* 時間セル */}
                    <div className="flex absolute inset-0">
                      {Array.from({ length: 24 }, (_, i) => {
                        const past = isPastDateTime(selectedDay.getDate(), i);
                        return (
                          <div
                            key={i}
                            className={cn(
                              "flex-1 border-r last:border-r-0 min-w-[32px]",
                              past && "bg-muted/20"
                            )}
                          />
                        );
                      })}
                    </div>

                    {/* 既存予約 */}
                    {filteredDayBookings.map((booking) => {
                      const left = `${(booking.startHour / 24) * 100}%`;
                      const width = `${((booking.endHour - booking.startHour) / 24) * 100}%`;
                      return (
                        <div
                          key={booking.id}
                          className={cn(
                            "absolute top-1 h-[calc(50%-4px)] rounded-sm text-xs flex items-center px-2 overflow-hidden pointer-events-none z-10",
                            booking.bookingStatus === "確定"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-amber-100 text-amber-800 border border-dashed border-amber-400"
                          )}
                          style={{ left, width }}
                        >
                          <span className="truncate">{booking.clientName}</span>
                        </div>
                      );
                    })}

                    {/* 新規案件 */}
                    {proposals.map((slot) => {
                      const sHour = parseInt(slot.startTime.split(":")[0]);
                      const eHour = parseInt(slot.endTime.split(":")[0]);
                      const left = `${(sHour / 24) * 100}%`;
                      const width = `${((eHour - sHour) / 24) * 100}%`;
                      return (
                        <div
                          key={slot.id}
                          className="absolute bottom-1 h-[calc(50%-4px)] rounded-sm bg-red-100 border-2 border-red-500 text-red-700 text-xs flex items-center px-2 overflow-hidden z-10"
                          style={{ left, width }}
                        >
                          <span className="truncate">新規案件</span>
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

            {/* 時間選択（1時間単位） */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>開始時刻</Label>
                <Select value={startHour} onValueChange={handleStartHourChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hourOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>終了時刻</Label>
                <Select value={endHour} onValueChange={setEndHour}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {validEndHourOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
