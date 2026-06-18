import { getDailyTasks, getDashboardStats, getActivityHeatmap, getUserStreaks } from "@/lib/data/dashboard";
import { WelcomeBanner } from "./WelcomeBanner";
import { StatCards } from "./StatCards";
import { DailyTasks } from "./DailyTasks";
import { StreakCards } from "./StreakCards";
import { Heatmap } from "./Heatmap";

export async function LoggedInDashboard({ userId, userName }: { userId: string; userName: string | null }) {
  // Fetch data in parallel
  const [tasks, stats, heatmap, streaks] = await Promise.all([
    getDailyTasks(userId),
    getDashboardStats(userId),
    getActivityHeatmap(userId),
    getUserStreaks(userId),
  ]);

  const completedTasks = tasks.filter((t) => t.isComplete).length;

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <WelcomeBanner 
        name={userName} 
        stats={stats}
        completedTasks={completedTasks} 
        totalTasks={tasks.length} 
      />
      
      <StreakCards streaks={streaks} />
      
      <StatCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col">
          <Heatmap data={heatmap} />
        </div>
        
        <div className="lg:col-span-1">
          <DailyTasks initialTasks={tasks} />
        </div>
      </div>
    </div>
  );
}
