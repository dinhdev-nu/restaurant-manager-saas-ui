import { useState, useEffect, memo } from "react";
import { cn } from "../../../../utils/cn";
import {
    FileText,
    Download,
    Calendar,
    TrendingUp,
    PieChart as PieChartIcon,
    BarChart3,
    Clock,
    ChevronRight,
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

const conversionData = [
    { month: "Th1", rate: 18 },
    { month: "Th2", rate: 22 },
    { month: "Th3", rate: 19 },
    { month: "Th4", rate: 25 },
    { month: "Th5", rate: 23 },
    { month: "Th6", rate: 28 },
    { month: "Th7", rate: 26 },
    { month: "Th8", rate: 31 },
    { month: "Th9", rate: 29 },
    { month: "Th10", rate: 32 },
    { month: "Th11", rate: 35 },
    { month: "Th12", rate: 38 },
];

const sourceData = [
    { name: "Trực tiếp", value: 35, color: "oklch(0.7 0.18 220)" },
    { name: "Giới thiệu", value: 25, color: "oklch(0.7 0.18 145)" },
    { name: "Tự nhiên", value: 20, color: "oklch(0.75 0.18 55)" },
    { name: "Quảng cáo", value: 15, color: "oklch(0.65 0.2 25)" },
    { name: "Mạng XH", value: 5, color: "oklch(0.7 0.15 300)" },
];

const reports = [
    { id: "1", name: "Tổng kết bán hàng tháng", type: "Bán hàng", date: "20/01/2024", status: "ready" },
    { id: "2", name: "Phân tích hiệu suất Quý 4", type: "Hiệu suất", date: "18/01/2024", status: "ready" },
    { id: "3", name: "Dự báo quy trình", type: "Dự báo", date: "15/01/2024", status: "ready" },
    { id: "4", name: "Báo cáo năng suất đội", type: "Đội nhóm", date: "12/01/2024", status: "generating" },
    { id: "5", name: "Phân tích nguồn khách hàng tiềm năng", type: "Marketing", date: "10/01/2024", status: "ready" },
];

const ReportCard = memo(function ReportCard({ title, description, icon: Icon, color, index }) {
    return (
        <div
            className="group bg-card border border-border rounded-xl p-5 hover:border-accent/50 cursor-pointer transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
        >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4", color)}>
                <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground mb-4">{description}</p>
            <button className="flex items-center gap-1 text-xs text-accent font-medium group-hover:gap-2 transition-all duration-200">
                Xem báo cáo
                <ChevronRight className="w-3 h-3" />
            </button>
        </div>
    );
});

export function ReportsSection() {
    const [chartsLoaded, setChartsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setChartsLoaded(true), 400);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-6">
            {/* Quick report cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <ReportCard
                    title="Tổng kết bán hàng"
                    description="Doanh thu và chỉ số giao dịch tháng"
                    icon={BarChart3}
                    color="bg-chart-1/10 text-chart-1"
                    index={0}
                />
                <ReportCard
                    title="Tỉ lệ chuyển đổi"
                    description="Phân tích hiệu suất kênh"
                    icon={TrendingUp}
                    color="bg-accent/10 text-accent"
                    index={1}
                />
                <ReportCard
                    title="Nguồn khách hàng tiềm năng"
                    description="Phân bổ theo kênh"
                    icon={PieChartIcon}
                    color="bg-chart-3/10 text-chart-3"
                    index={2}
                />
                <ReportCard
                    title="Dự báo"
                    description="Dự đoán doanh thu & chỉ tiêu"
                    icon={Calendar}
                    color="bg-chart-5/10 text-chart-5"
                    index={3}
                />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion rate trend */}
                <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-base font-semibold text-foreground">Xu hướng tỉ lệ chuyển đổi</h3>
                            <p className="text-sm text-muted-foreground mt-0.5">Chuyển đổi từ khách tiềm năng thành giao dịch</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-success font-medium">
                            <TrendingUp className="w-4 h-4" />
                            +111% YoY
                        </div>
                    </div>
                    <div className={`h-[250px] transition-opacity duration-700 ${chartsLoaded ? 'opacity-100' : 'opacity-0'}`}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={conversionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.005 260)" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "oklch(0.65 0 0)", fontSize: 12 }}
                                    tickFormatter={(value) => `${value}%`}
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
                                    formatter={(value) => [`${value}%`, "Tỉ lệ chuyển đổi"]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="rate"
                                    stroke="oklch(0.7 0.18 145)"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Lead sources pie chart */}
                <div className="bg-card border border-border rounded-xl p-5 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-foreground">Nguồn khách tiềm năng</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Khách tiềm năng đến từ đâu</p>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className={`w-[180px] h-[180px] transition-opacity duration-700 ${chartsLoaded ? 'opacity-100' : 'opacity-0'}`}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={sourceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {sourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-3">
                            {sourceData.map((source, index) => (
                                <div
                                    key={source.name}
                                    className="flex items-center justify-between animate-in fade-in slide-in-from-right-2"
                                    style={{ animationDelay: `${(index + 5) * 100}ms`, animationFillMode: "both" }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                                        <span className="text-sm text-foreground">{source.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-foreground">{source.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent reports table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div>
                        <h3 className="text-base font-semibold text-foreground">Báo cáo gần đây</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">Báo cáo đã tạo của bạn</p>
                    </div>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                        <FileText className="w-4 h-4" />
                        Tạo mới
                    </button>
                </div>
                <div className="divide-y divide-border">
                    {reports.map((report, index) => (
                        <div
                            key={report.id}
                            className="flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors duration-150 cursor-pointer animate-in fade-in slide-in-from-left-2"
                            style={{ animationDelay: `${(index + 6) * 50}ms`, animationFillMode: "both" }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">{report.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="px-1.5 py-0.5 rounded bg-secondary">{report.type}</span>
                                        <span>•</span>
                                        <span>{report.date}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {report.status === "generating" ? (
                                    <div className="flex items-center gap-2 text-xs text-warning">
                                        <Clock className="w-4 h-4 animate-pulse" />
                                        Đang tạo...
                                    </div>
                                ) : (
                                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
                                        <Download className="w-4 h-4" />
                                        Tải xuống
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
