import { TrophyIcon, UsersIcon } from "lucide-react";

function StatsCards({ activeSessionsCount, recentSessionsCount }) {
  return (
    <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
      {/* Active Count */}
      <div className="card bg-base-100/90 border border-primary/30 shadow-lg hover:shadow-xl transition-all">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-linear-to-br from-primary/15 to-primary/5 rounded-2xl">
              <UsersIcon className="w-7 h-7 text-primary" />
            </div>
            <div className="badge badge-primary badge-outline">Live</div>
          </div>
          <div className="text-4xl font-black mb-1 tracking-tight">
            {activeSessionsCount}
          </div>
          <div className="text-sm opacity-70">Active Sessions</div>
        </div>
      </div>

      {/* Recent Count */}
      <div className="card bg-base-100/90 border border-secondary/30 shadow-lg hover:shadow-xl transition-all">
        <div className="card-body p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-linear-to-br from-secondary/15 to-secondary/5 rounded-2xl">
              <TrophyIcon className="w-7 h-7 text-secondary" />
            </div>
            <div className="badge badge-secondary badge-outline">History</div>
          </div>
          <div className="text-4xl font-black mb-1 tracking-tight">
            {recentSessionsCount}
          </div>
          <div className="text-sm opacity-70">Total Sessions</div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
