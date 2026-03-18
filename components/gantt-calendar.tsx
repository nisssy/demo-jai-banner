"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProposalSlot, BannerType } from "@/lib/types";
import {
  mockBookings,
  mockAreaSlots,
  initialHalls,
  bannerTypeOptions,
} from "@/lib/types";
import {
  format,
  addDays,
  subDays,
  isSameDay,
  isWithinInterval,
  isSaturday,
  isSunday,
  differenceInDays,
  startOfDay,
  max as dateMax,
  min as dateMin,
} from "date-fns";
import { ja } from "date-fns/locale";

interface GanttCalendarProps {
  proposalSlots: ProposalSlot[];
  onSelectSlot?: (slotId: string) => void;
}

const TOTAL_DAYS = 28;
const DAY_COL_WIDTH = 36; // px per day column
const LEFT_PANEL_WIDTH = 280; // px for left label panel

// Booking bar color palette by banner type
const bannerColorMap: Record<string, string> = {
  "メインバナー": "bg-blue-500",
  "サブバナー": "bg-green-500",
  "お知らせバナー": "bg-yellow-500",
  "スプラッシュバナー": "bg-purple-500",
  "マイページバナー": "bg-pink-500",
  "ローテーションバナー": "bg-orange-500",
  "動画バナー": "bg-red-500",
  "取材来店バナー": "bg-teal-500",
  "都道府県バナー": "bg-indigo-500",
  "【FP課】マイページバナー": "bg-cyan-500",
  "バナー各種": "bg-gray-500",
};

// Unique prefectures from halls
const allPrefectures = Array.from(
  new Set(initialHalls.map((h) => h.prefecture).filter(Boolean))
) as string[];

export function GanttCalendar({
  proposalSlots,
  onSelectSlot,
}: GanttCalendarProps) {
  const today = startOfDay(new Date());

  // State: start date of the visible range
  const [rangeStart, setRangeStart] = useState(() => {
    // Default: start ~3 days before today so today is visible
    return subDays(today, 3);
  });

  // Filters
  const [prefectureFilter, setPrefectureFilter] = useState<string>("all");
  const [bannerTypeFilter, setBannerTypeFilter] = useState<string>("all");
  const [displayFilter, setDisplayFilter] = useState<string>("all");

  // Date range
  const rangeEnd = addDays(rangeStart, TOTAL_DAYS - 1);
  const days = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < TOTAL_DAYS; i++) {
      result.push(addDays(rangeStart, i));
    }
    return result;
  }, [rangeStart]);

  // Navigation
  const goToPrev = () => setRangeStart((d) => subDays(d, 7));
  const goToNext = () => setRangeStart((d) => addDays(d, 7));
  const goToToday = () => setRangeStart(subDays(today, 3));

  // Combine proposalSlots and mockBookings into a unified booking list
  const allBookings = useMemo(() => {
    // From mockBookings
    const fromBookings = mockBookings.map((bk) => {
      const areaSlot = mockAreaSlots.find((a) => a.id === bk.areaSlotId);
      const hall = initialHalls.find((h) =>
        bk.hallName.includes(h.name.replace("株式会社", "").substring(0, 4))
      );
      return {
        id: bk.id,
        bannerType: bk.bannerType,
        hallName: bk.hallName,
        hallId: hall?.hallId || "",
        prefecture: areaSlot?.prefecture || hall?.prefecture || "",
        startDate: bk.startDate,
        endDate: bk.endDate,
        status: bk.bookingStatus as string,
        isProposal: false,
        areaName: areaSlot?.area || "",
      };
    });

    // From proposalSlots
    const fromProposals = proposalSlots.map((ps) => {
      const areaSlot = mockAreaSlots.find((a) => a.id === ps.areaSlotId);
      return {
        id: ps.id,
        bannerType: ps.bannerType,
        hallName: ps.areaName || areaSlot?.area || "未設定",
        hallId: ps.recordNumber || "",
        prefecture: areaSlot?.prefecture || "",
        startDate: ps.startDate,
        endDate: ps.endDate,
        status: "提案" as string,
        isProposal: true,
        areaName: ps.areaName || areaSlot?.area || "",
      };
    });

    return [...fromBookings, ...fromProposals];
  }, [proposalSlots]);

  // Group bookings by banner type
  const groupedBookings = useMemo(() => {
    let filtered = allBookings;

    // Apply filters
    if (prefectureFilter !== "all") {
      filtered = filtered.filter((b) => b.prefecture === prefectureFilter);
    }
    if (bannerTypeFilter !== "all") {
      filtered = filtered.filter((b) => b.bannerType === bannerTypeFilter);
    }
    if (displayFilter === "confirmed") {
      filtered = filtered.filter((b) => b.status === "確定");
    } else if (displayFilter === "tentative") {
      filtered = filtered.filter((b) => b.status === "仮押さえ");
    } else if (displayFilter === "proposal") {
      filtered = filtered.filter((b) => b.isProposal);
    }

    // Group by bannerType
    const groups: Record<
      string,
      typeof filtered
    > = {};
    filtered.forEach((b) => {
      if (!groups[b.bannerType]) {
        groups[b.bannerType] = [];
      }
      groups[b.bannerType].push(b);
    });

    return groups;
  }, [allBookings, prefectureFilter, bannerTypeFilter, displayFilter]);

  // Total record count
  const totalCount = useMemo(() => {
    return Object.values(groupedBookings).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
  }, [groupedBookings]);

  // Compute booking bar position
  function getBarPosition(startDate: Date, endDate: Date) {
    const visibleStart = dateMax([startDate, rangeStart]);
    const visibleEnd = dateMin([endDate, rangeEnd]);

    if (visibleStart > rangeEnd || visibleEnd < rangeStart) {
      return null; // not visible
    }

    const leftDays = differenceInDays(visibleStart, rangeStart);
    const spanDays = differenceInDays(visibleEnd, visibleStart) + 1;

    return {
      left: leftDays * DAY_COL_WIDTH,
      width: spanDays * DAY_COL_WIDTH - 2,
    };
  }

  // Month labels for the header
  const monthLabels = useMemo(() => {
    const labels: { label: string; span: number; startIndex: number }[] = [];
    let currentLabel = "";
    let span = 0;
    let startIndex = 0;

    days.forEach((day, index) => {
      const label = format(day, "yyyy年M月", { locale: ja });
      if (label !== currentLabel) {
        if (currentLabel) {
          labels.push({ label: currentLabel, span, startIndex });
        }
        currentLabel = label;
        span = 1;
        startIndex = index;
      } else {
        span++;
      }
    });
    if (currentLabel) {
      labels.push({ label: currentLabel, span, startIndex });
    }
    return labels;
  }, [days]);

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      {/* Title */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">
          広告掲載ガントチャート ({totalCount}件)
        </h2>
      </div>

      {/* Filter bar */}
      <div className="px-4 py-3 border-b flex flex-wrap items-center gap-3 bg-gray-50/50">
        <Filter className="h-4 w-4 text-gray-500" />

        <Select value={prefectureFilter} onValueChange={setPrefectureFilter}>
          <SelectTrigger className="w-[160px] h-8 text-sm">
            <SelectValue placeholder="全都道府県" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全都道府県</SelectItem>
            {allPrefectures.map((pref) => (
              <SelectItem key={pref} value={pref}>
                {pref}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={bannerTypeFilter} onValueChange={setBannerTypeFilter}>
          <SelectTrigger className="w-[180px] h-8 text-sm">
            <SelectValue placeholder="全掲載枠" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全掲載枠</SelectItem>
            {bannerTypeOptions.map((bt) => (
              <SelectItem key={bt} value={bt}>
                {bt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={displayFilter} onValueChange={setDisplayFilter}>
          <SelectTrigger className="w-[150px] h-8 text-sm">
            <SelectValue placeholder="すべて表示" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて表示</SelectItem>
            <SelectItem value="confirmed">確定のみ</SelectItem>
            <SelectItem value="tentative">仮押さえのみ</SelectItem>
            <SelectItem value="proposal">提案のみ</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button variant="outline" size="sm" className="text-sm">
            期間を選択してレコード作成
          </Button>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="px-4 py-2 border-b flex items-center justify-center gap-4 bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrev}
          className="text-sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          前
        </Button>
        <Button variant="outline" size="sm" onClick={goToToday} className="text-sm">
          今日
        </Button>
        <span className="text-sm font-medium text-gray-700 min-w-[220px] text-center">
          {format(rangeStart, "yyyy-MM-dd")} 〜{" "}
          {format(rangeEnd, "yyyy-MM-dd")}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          className="text-sm"
        >
          次
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Gantt chart area */}
      <div className="overflow-x-auto">
        <div
          style={{
            minWidth: LEFT_PANEL_WIDTH + TOTAL_DAYS * DAY_COL_WIDTH + 2,
          }}
        >
          {/* Calendar header */}
          <div className="flex border-b sticky top-0 z-10 bg-white">
            {/* Left panel header */}
            <div
              className="shrink-0 border-r bg-gray-100 flex items-end px-2 py-1"
              style={{ width: LEFT_PANEL_WIDTH }}
            >
              <span className="text-xs text-gray-500 font-medium">
                掲載枠 / 店舗名
              </span>
            </div>

            {/* Date columns */}
            <div className="flex flex-col">
              {/* Month row */}
              <div className="flex">
                {monthLabels.map((ml) => (
                  <div
                    key={ml.label + ml.startIndex}
                    className="text-center text-xs font-semibold text-gray-700 border-b border-r bg-gray-100 py-1"
                    style={{ width: ml.span * DAY_COL_WIDTH }}
                  >
                    {ml.label}
                  </div>
                ))}
              </div>
              {/* Day number row */}
              <div className="flex">
                {days.map((day, i) => {
                  const isToday = isSameDay(day, today);
                  const isSat = isSaturday(day);
                  const isSun = isSunday(day);
                  return (
                    <div
                      key={i}
                      className={cn(
                        "text-center border-r py-0.5 flex flex-col items-center justify-center",
                        isToday && "bg-amber-100",
                        !isToday && isSat && "bg-blue-50",
                        !isToday && isSun && "bg-red-50"
                      )}
                      style={{ width: DAY_COL_WIDTH }}
                    >
                      <span
                        className={cn(
                          "text-[10px] leading-tight font-medium",
                          isSat && "text-blue-600",
                          isSun && "text-red-500",
                          isToday && "text-amber-700 font-bold"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] leading-tight",
                          isSat && "text-blue-500",
                          isSun && "text-red-400",
                          isToday && "text-amber-600"
                        )}
                      >
                        {format(day, "E", { locale: ja })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Data rows */}
          {Object.keys(groupedBookings).length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
              表示するデータがありません
            </div>
          ) : (
            Object.entries(groupedBookings).map(
              ([bannerType, bookings]) => (
                <div key={bannerType}>
                  {/* Banner type group header */}
                  <div className="flex border-b">
                    <div
                      className="shrink-0 border-r bg-blue-600 text-white px-3 py-1.5 flex items-center"
                      style={{ width: LEFT_PANEL_WIDTH }}
                    >
                      <span className="text-xs font-bold truncate">
                        {bannerType}
                      </span>
                      <Badge
                        variant="secondary"
                        className="ml-2 bg-blue-500 text-white text-[10px] px-1.5 py-0"
                      >
                        {bookings.length}
                      </Badge>
                    </div>
                    <div
                      className="bg-blue-600"
                      style={{
                        width: TOTAL_DAYS * DAY_COL_WIDTH,
                      }}
                    />
                  </div>

                  {/* Individual booking rows */}
                  {bookings.map((booking, rowIndex) => {
                    const bar = getBarPosition(
                      booking.startDate,
                      booking.endDate
                    );
                    const isEven = rowIndex % 2 === 0;

                    return (
                      <div
                        key={booking.id}
                        className={cn(
                          "flex border-b hover:bg-gray-50 transition-colors cursor-pointer",
                          isEven ? "bg-white" : "bg-gray-50/50"
                        )}
                        onClick={() => onSelectSlot?.(booking.id)}
                      >
                        {/* Left label */}
                        <div
                          className="shrink-0 border-r px-2 py-1.5 flex items-center gap-1.5 overflow-hidden"
                          style={{ width: LEFT_PANEL_WIDTH }}
                        >
                          <span className="text-[10px] text-gray-400 font-mono shrink-0">
                            [{booking.hallId || "---"}]
                          </span>
                          <span className="text-xs text-gray-800 truncate font-medium">
                            {booking.hallName}
                          </span>
                          {booking.prefecture && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 shrink-0 border-gray-300 text-gray-500"
                            >
                              {booking.prefecture}
                            </Badge>
                          )}
                          {booking.status === "仮押さえ" && (
                            <Badge className="text-[9px] px-1 py-0 shrink-0 bg-amber-100 text-amber-700 border-amber-300">
                              先行
                            </Badge>
                          )}
                          {booking.isProposal && (
                            <Badge className="text-[9px] px-1 py-0 shrink-0 bg-green-100 text-green-700 border-green-300">
                              提案
                            </Badge>
                          )}
                        </div>

                        {/* Calendar grid cells with bar */}
                        <div
                          className="relative"
                          style={{
                            width: TOTAL_DAYS * DAY_COL_WIDTH,
                            height: 32,
                          }}
                        >
                          {/* Grid lines and weekend/today highlights */}
                          <div className="absolute inset-0 flex">
                            {days.map((day, i) => {
                              const isToday = isSameDay(day, today);
                              const isSat = isSaturday(day);
                              const isSun = isSunday(day);
                              return (
                                <div
                                  key={i}
                                  className={cn(
                                    "border-r h-full",
                                    isToday && "bg-amber-50",
                                    !isToday && isSat && "bg-blue-50/50",
                                    !isToday && isSun && "bg-red-50/50"
                                  )}
                                  style={{ width: DAY_COL_WIDTH }}
                                />
                              );
                            })}
                          </div>

                          {/* Booking bar */}
                          {bar && (
                            <div
                              className={cn(
                                "absolute top-1 rounded-sm shadow-sm flex items-center px-1.5 overflow-hidden",
                                bannerColorMap[booking.bannerType] ||
                                  "bg-gray-400",
                                booking.isProposal &&
                                  "border-2 border-dashed border-white/60"
                              )}
                              style={{
                                left: bar.left + 1,
                                width: bar.width,
                                height: 22,
                              }}
                              title={`${booking.hallName} (${format(booking.startDate, "M/d")}〜${format(booking.endDate, "M/d")})`}
                            >
                              <span className="text-[10px] text-white font-medium truncate">
                                {booking.hallName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t bg-gray-50 flex flex-wrap items-center gap-3">
        <span className="text-xs text-gray-500 font-medium">凡例:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300" />
          <span className="text-[10px] text-gray-600">今日</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-200" />
          <span className="text-[10px] text-gray-600">土曜</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red-50 border border-red-200" />
          <span className="text-[10px] text-gray-600">日曜</span>
        </div>
        <div className="border-l pl-3 ml-1 flex items-center gap-2">
          {Object.entries(bannerColorMap)
            .filter(([key]) =>
              Object.keys(groupedBookings).includes(key)
            )
            .map(([key, colorClass]) => (
              <div key={key} className="flex items-center gap-1">
                <div className={cn("w-3 h-3 rounded-sm", colorClass)} />
                <span className="text-[10px] text-gray-600">{key}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
