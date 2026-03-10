import { useState, useEffect } from 'react';
import { 
  format, 
  getISOWeek, 
  getISOWeeksInYear,
  getYear, 
  getDayOfYear,
  getDaysInYear,
  startOfISOWeek,
  endOfISOWeek,
  getDay
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion } from 'motion/react';
import { CalendarDays, Clock, Sun, Moon } from 'lucide-react';
import { Lunar } from 'lunar-javascript';

export default function App() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Solar (Gregorian) Calculations ---
  const solarYear = getYear(now);
  const solarWeek = getISOWeek(now);
  const solarTotalWeeks = getISOWeeksInYear(now);
  const solarDayOfYear = getDayOfYear(now);
  const solarDaysInYear = getDaysInYear(now);
  const solarYearProgress = (solarDayOfYear / solarDaysInYear) * 100;
  
  // --- Lunar Calculations ---
  const lunar = Lunar.fromDate(now);
  const lunarYearStr = lunar.getYearInGanZhi() + '年 (' + lunar.getYearShengXiao() + '年)';
  const lunarDateStr = lunar.getMonthInChinese() + '月' + lunar.getDayInChinese();
  
  const lunarYearStart = Lunar.fromYmd(lunar.getYear(), 1, 1);
  const solarOfLunarStart = lunarYearStart.getSolar();
  const lunarStartDate = new Date(solarOfLunarStart.getYear(), solarOfLunarStart.getMonth() - 1, solarOfLunarStart.getDay());
  
  const nextLunarYearStart = Lunar.fromYmd(lunar.getYear() + 1, 1, 1);
  const solarOfNextLunarStart = nextLunarYearStart.getSolar();
  const nextLunarStartDate = new Date(solarOfNextLunarStart.getYear(), solarOfNextLunarStart.getMonth() - 1, solarOfNextLunarStart.getDay());
  
  const lunarTotalDays = Math.round((nextLunarStartDate.getTime() - lunarStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const lunarPassedDays = Math.floor((now.getTime() - lunarStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const lunarWeek = Math.floor((lunarPassedDays - 1) / 7) + 1;
  const lunarTotalWeeks = Math.ceil(lunarTotalDays / 7);
  const lunarYearProgress = (lunarPassedDays / lunarTotalDays) * 100;

  // Current week days
  const dayOfWeek = getDay(now) === 0 ? 7 : getDay(now); // 1-7 (Mon-Sun)
  const startOfWeek = startOfISOWeek(now);
  const endOfWeek = endOfISOWeek(now);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl w-full flex flex-col gap-8">
        
        {/* Header / Clock */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between"
        >
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">自然周追踪器</h1>
            <p className="text-zinc-400 mt-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              {format(now, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
              <span className="mx-2 opacity-50">|</span>
              农历{lunarDateStr}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="text-4xl md:text-5xl font-mono font-light tracking-tighter text-emerald-400 flex items-center gap-3">
              <Clock className="w-6 h-6 md:w-8 md:h-8 text-emerald-500/50" />
              {format(now, 'HH:mm:ss')}
            </div>
          </div>
        </motion.div>

        {/* Current Week Days */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <span className="text-emerald-400 font-bold text-xl">{solarWeek}</span>
              </div>
              <div>
                <div className="text-sm text-zinc-400">本周日期</div>
                <div className="font-medium text-zinc-200">
                  {format(startOfWeek, 'MM月dd日')} - {format(endOfWeek, 'MM月dd日')}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between w-full md:w-auto md:gap-8">
              {['一', '二', '三', '四', '五', '六', '日'].map((day, idx) => {
                const isToday = dayOfWeek === idx + 1;
                const isPast = dayOfWeek > idx + 1;
                return (
                  <div key={day} className="flex flex-col items-center gap-3">
                    <span className={`text-sm font-medium ${isToday ? 'text-emerald-400' : isPast ? 'text-zinc-500' : 'text-zinc-600'}`}>
                      周{day}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${isToday ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]' : isPast ? 'bg-zinc-600' : 'bg-zinc-800'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Dual Timelines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Solar Year Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Sun className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xl font-medium text-zinc-200">阳历年 (公历)</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-white">{solarYear}年</div>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-7xl font-bold tracking-tighter text-white">{solarWeek}</span>
              <span className="text-2xl font-medium text-zinc-500">/ {solarTotalWeeks} 周</span>
            </div>

            {/* Week Timeline Visualization */}
            <div className="mb-10">
              <div className="flex justify-between text-xs text-zinc-500 mb-3">
                <span>第 1 周</span>
                <span className="text-blue-400 font-medium">当前: 第 {solarWeek} 周</span>
                <span>第 {solarTotalWeeks} 周</span>
              </div>
              <div className="flex gap-[2px] h-6 w-full">
                {Array.from({ length: solarTotalWeeks }).map((_, i) => {
                  const isPast = i + 1 < solarWeek;
                  const isCurrent = i + 1 === solarWeek;
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-sm transition-all ${
                        isCurrent ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)] scale-y-125 z-10' : 
                        isPast ? 'bg-blue-900/40' : 'bg-zinc-800/80'
                      }`}
                      title={`第 ${i + 1} 周`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Year Progress */}
            <div className="space-y-3 mt-auto">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>全年进度</span>
                <span className="font-mono text-blue-400">{solarYearProgress.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${solarYearProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                />
              </div>
              <div className="text-xs text-zinc-500 text-right mt-2">
                {solarDayOfYear} / {solarDaysInYear} 天
              </div>
            </div>
          </motion.div>

          {/* Lunar Year Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <Moon className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-xl font-medium text-zinc-200">农历年 (阴历)</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-white">{lunarYearStr}</div>
              </div>
            </div>

            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-7xl font-bold tracking-tighter text-white">{lunarWeek}</span>
              <span className="text-2xl font-medium text-zinc-500">/ {lunarTotalWeeks} 周</span>
            </div>

            {/* Week Timeline Visualization */}
            <div className="mb-10">
              <div className="flex justify-between text-xs text-zinc-500 mb-3">
                <span>第 1 周</span>
                <span className="text-amber-400 font-medium">当前: 第 {lunarWeek} 周</span>
                <span>第 {lunarTotalWeeks} 周</span>
              </div>
              <div className="flex gap-[2px] h-6 w-full">
                {Array.from({ length: lunarTotalWeeks }).map((_, i) => {
                  const isPast = i + 1 < lunarWeek;
                  const isCurrent = i + 1 === lunarWeek;
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-sm transition-all ${
                        isCurrent ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] scale-y-125 z-10' : 
                        isPast ? 'bg-amber-900/40' : 'bg-zinc-800/80'
                      }`}
                      title={`第 ${i + 1} 周`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Year Progress */}
            <div className="space-y-3 mt-auto">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>全年进度</span>
                <span className="font-mono text-amber-400">{lunarYearProgress.toFixed(1)}%</span>
              </div>
              <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${lunarYearProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                />
              </div>
              <div className="text-xs text-zinc-500 text-right mt-2">
                {lunarPassedDays} / {lunarTotalDays} 天
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
