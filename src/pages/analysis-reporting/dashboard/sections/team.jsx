import { useState, useEffect, memo } from "react";
import { cn } from "../../../../utils/cn";
import { Trophy, Target, TrendingUp, TrendingDown, Mail, Phone, MoreHorizontal } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const teamMembers = [
    { id: "1", name: "Nguyễn Văn An", role: "Chuyên viên cấp cao", email: "an.nguyen@congty.vn", avatar: "NA", deals: 24, revenue: 12187500000, quota: 11250000000, change: 15, rank: 1 },
    { id: "2", name: "Trần Minh Tuấn", role: "Chuyên viên kinh doanh", email: "tuan.tran@congty.vn", avatar: "TT", deals: 19, revenue: 8905000000, quota: 10000000000, change: 8, rank: 2 },
    { id: "3", name: "Lê Thị Mai", role: "Chuyên viên cấp cao", email: "mai.le@congty.vn", avatar: "LM", deals: 17, revenue: 7820000000, quota: 8750000000, change: 12, rank: 3 },
    { id: "4", name: "Phạm Hoàng Nam", role: "Chuyên viên kinh doanh", email: "nam.pham@congty.vn", avatar: "PN", deals: 15, revenue: 7235000000, quota: 8750000000, change: -5, rank: 4 },
    { id: "5", name: "Hoàng Thị Lan", role: "Chuyên viên kinh doanh", email: "lan.hoang@congty.vn", avatar: "HL", deals: 14, revenue: 6677500000, quota: 7500000000, change: 9, rank: 5 },
];

const performanceData = [
    { name: "An", revenue: 12187, quota: 11250 },
    { name: "Tuấn", revenue: 8905, quota: 10000 },
    { name: "Mai", revenue: 7820, quota: 8750 },
    { name: "Nam", revenue: 7235, quota: 8750 },
    { name: "Lan", revenue: 6677, quota: 7500 },
];

const TeamMemberCard = memo(function TeamMemberCard({ member, index }) {
    const quotaPercentage = (member.revenue / member.quota) * 100;
    const isAboveQuota = quotaPercentage >= 100;

    return (
        <div
            className="group bg-card border border-border rounded-xl p-5 hover:border-accent/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/80 to-chart-1 flex items-center justify-center text-sm font-bold text-white">
                            {member.avatar}
                        </div>
                        {member.rank <= 3 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-warning flex items-center justify-center">
                                <Trophy className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">{member.name}</h4>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                </div>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Doanh thu</p>
                    <p className="text-lg font-bold text-foreground">{(member.revenue / 1000000000).toFixed(1)} tỷ</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Giao dịch chốt</p>
                    <p className="text-lg font-bold text-foreground">{member.deals}</p>
                </div>
            </div>

            {/* Quota progress */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Đạt chỉ tiêu</span>
                    <span className={cn("font-medium", isAboveQuota ? "text-success" : "text-foreground")}>
                        {quotaPercentage.toFixed(0)}%
                    </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className={cn("h-full rounded-full transition-all duration-700", isAboveQuota ? "bg-success" : "bg-accent")}
                        style={{ width: `${Math.min(quotaPercentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Change indicator */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                        <Mail className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                        <Phone className="w-4 h-4" />
                    </button>
                </div>
                <div className={cn("flex items-center gap-1 text-sm font-medium", member.change >= 0 ? "text-success" : "text-destructive")}>
                    {member.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {member.change >= 0 ? "+" : ""}{member.change}%
                </div>
            </div>
        </div>
    );
});

export function TeamSection() {
    const [chartLoaded, setChartLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setChartLoaded(true), 400);
        return () => clearTimeout(timer);
    }, []);

    const totalRevenue = teamMembers.reduce((acc, m) => acc + m.revenue, 0);
    const totalDeals = teamMembers.reduce((acc, m) => acc + m.deals, 0);
    const avgQuotaAttainment = teamMembers.reduce((acc, m) => acc + (m.revenue / m.quota) * 100, 0) / teamMembers.length;

    return (
        <div className="space-y-6">
            {/* Header stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                            <Target className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-sm text-muted-foreground">Doanh thu đội</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{(totalRevenue / 1000000000).toFixed(1)} tỷ</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-chart-1" />
                        </div>
                        <span className="text-sm text-muted-foreground">Tổng giao dịch</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{totalDeals}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-success" />
                        </div>
                        <span className="text-sm text-muted-foreground">Đạt chỉ tiêu TB</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{avgQuotaAttainment.toFixed(0)}%</p>
                </div>
            </div>

            {/* Performance chart */}
            <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-base font-semibold text-foreground">Doanh thu vs Chỉ tiêu</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">So sánh hiệu suất cá nhân</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-chart-1" />
                            <span className="text-muted-foreground">Doanh thu (tr)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                            <span className="text-muted-foreground">Chỉ tiêu (tr)</span>
                        </div>
                    </div>
                </div>
                <div className={`h-[250px] transition-opacity duration-700 ${chartLoaded ? 'opacity-100' : 'opacity-0'}`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 260)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                                tickFormatter={(value) => `${value}tr`}
                                dx={-10}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "oklch(0.12 0.005 260)",
                                    border: "1px solid oklch(0.22 0.005 260)",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                                labelStyle={{ color: "oklch(0.95 0 0)", fontWeight: 600 }}
                                itemStyle={{ color: "oklch(0.65 0 0)" }}
                                formatter={(value) => [`${value} triệu`, ""]}
                            />
                            <Bar dataKey="quota" fill="oklch(0.65 0 0 / 0.2)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="revenue" fill="oklch(0.7 0.18 220)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Team members grid */}
            <div>
                <h3 className="text-base font-semibold text-foreground mb-4">Thành viên đội</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers.map((member, index) => (
                        <TeamMemberCard key={member.id} member={member} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
