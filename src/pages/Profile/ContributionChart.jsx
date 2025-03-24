import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarIcon, FlameIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function ContributionChart({ activityData }) {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [dates, setDates] = useState([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [pastStreak, setPastStreak] = useState(0);
  const [yearlyContributions, setYearlyContributions] = useState({});
  const [availableYears, setAvailableYears] = useState([]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = ["Mon", "", "Wed", "", "Fri", ""];

  const getColor = (count) => {
    if (count === 0 || count === undefined)
      return "bg-gray-100 dark:bg-gray-800";
    if (count < 3) return "bg-emerald-200 dark:bg-emerald-800";
    if (count < 6) return "bg-emerald-300 dark:bg-emerald-700";
    if (count < 10) return "bg-emerald-400 dark:bg-emerald-600";
    return "bg-emerald-500 dark:bg-emerald-500";
  };

  // array of all dates for the selected year.
  useEffect(() => {
    const result = [];
    const startDate = new Date(`${selectedYear}-01-01`);
    const endDate = new Date(`${selectedYear}-12-31`);
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      result.push(d.toISOString().split("T")[0]);
    }
    setDates(result);
  }, [selectedYear]);

  useEffect(() => {
    let total = 0;
    let current = 0;
    let past = 0;
    let currentStreak = 0;
    let pastStreak = 0;
    const yearlyTotal = {};

    const sortedDates = Object.keys(activityData).sort(
      (a, b) => new Date(b) - new Date(a)
    );
    const today = new Date().toISOString().split("T")[0];

    sortedDates.forEach((date, index) => {
      const count = activityData[date];
      const year = date.split("-")[0];
      yearlyTotal[year] = (yearlyTotal[year] || 0) + count;

      if (date.startsWith(selectedYear)) {
        total += count;
      }

      if (count > 0) {
        if (date === today) {
          currentStreak++;
        } else if (
          index === 0 ||
          new Date(sortedDates[index - 1]) - new Date(date) === 86400000
        ) {
          currentStreak++;
        } else {
          if (currentStreak > pastStreak) {
            pastStreak = currentStreak;
          }
          currentStreak = 1;
        }
      } else {
        if (currentStreak > pastStreak) {
          pastStreak = currentStreak;
        }
        currentStreak = 0;
      }
    });

    current = currentStreak;
    past = pastStreak;

    setTotalSubmissions(total);
    setCurrentStreak(current);
    setPastStreak(past);
    setYearlyContributions(yearlyTotal);
  }, [selectedYear, activityData]);

  useEffect(() => {
    setAvailableYears(
      Object.keys(yearlyContributions).sort((a, b) => b.localeCompare(a))
    );
  }, [yearlyContributions]);

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          {totalSubmissions} Contributions in {selectedYear}
        </CardTitle>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year}>
                <div className="flex items-center justify-between w-full">
                  <span className="flex gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {year}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <ScrollArea className="w-full overflow-x-auto">
          <div className="min-w-[780px]">
            <div className="flex mb-2">
              {months.map((month) => (
                <span
                  key={month}
                  className="text-xs sm:text-sm text-muted-foreground flex-1 text-center whitespace-nowrap"
                >
                  {month}
                </span>
              ))}
            </div>
            <div className="flex">
              <div className="flex flex-col mr-2 sm:mr-4 justify-between h-[90px] sm:h-[120px]">
                {days.map((day) => (
                  <span
                    key={day}
                    className="text-xs sm:text-sm text-muted-foreground"
                  >
                    {day}
                  </span>
                ))}
              </div>
              <div className="grid grid-rows-7 grid-flow-col gap-[2px] sm:gap-1 flex-grow pb-4">
                <TooltipProvider>
                  {dates.map((date) => (
                    <Tooltip key={date}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${getColor(
                            activityData[date] || 0
                          )} cursor-pointer transition-transform duration-200 ease-in-out hover:scale-150`}
                          aria-label={`${date}: ${
                            activityData[date] || 0
                          } contributions`}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover text-popover-foreground">
                        <p className="text-sm font-medium">
                          {!activityData[date] || activityData[date] === 0
                            ? "No contributions"
                            : activityData[date] === 1
                            ? "1 contribution"
                            : `${activityData[date]} contributions`}{" "}
                          on{" "}
                          {new Date(date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Less
            </span>
            <div className="flex">
              {[0, 2, 5, 9, 10].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-sm ${getColor(
                    level
                  )} mr-1`}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">
              More
            </span>
          </div>
          <div className="flex gap-4">
            <p className="text-sm sm:text-base font-medium flex items-center gap-1">
              <FlameIcon className="w-4 h-4 text-orange-500" />
              Current streak: {currentStreak} days
            </p>
            <p className="text-sm sm:text-base font-medium flex items-center gap-1">
              <FlameIcon className="w-4 h-4 text-blue-500" />
              Past streak: {pastStreak} days
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
