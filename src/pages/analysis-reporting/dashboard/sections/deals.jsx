import { useState } from "react";
import { cn } from "../../../../utils/cn";
import {
    Search,
    Filter,
    ArrowUpDown,
    CheckCircle2,
    Clock,
    XCircle,
    MoreHorizontal,
    ChevronDown,
} from "lucide-react";

const deals = [
    { id: "1", company: "Acme Corporation", contact: "Nguyễn Văn A", email: "nva@acme.com", value: 125000000, stage: "Đàm phán", status: "won", closeDate: "15/01/2024", rep: "Nguyễn A." },
    { id: "2", company: "TechStart VN", contact: "Trần Thị B", email: "ttb@techstart.vn", value: 89500000, stage: "Báo giá", status: "pending", closeDate: "22/01/2024", rep: "Trần B." },
    { id: "3", company: "GlobalFin VN", contact: "Lê Văn C", email: "lvc@globalfin.vn", value: 245000000, stage: "Đủ điều kiện", status: "pending", closeDate: "01/02/2024", rep: "Lê C." },
    { id: "4", company: "DataSync Solutions", contact: "Phạm Thị D", email: "ptd@datasync.vn", value: 67800000, stage: "Tiếp cận", status: "lost", closeDate: "10/01/2024", rep: "Phạm D." },
    { id: "5", company: "CloudBase VN", contact: "Hoàng Văn E", email: "hve@cloudbase.vn", value: 178000000, stage: "Đàm phán", status: "won", closeDate: "18/01/2024", rep: "Nguyễn A." },
    { id: "6", company: "Innovate Labs", contact: "Vũ Thị F", email: "vtf@innovate.vn", value: 156000000, stage: "Báo giá", status: "pending", closeDate: "28/01/2024", rep: "Hoàng E." },
    { id: "7", company: "NextGen Systems", contact: "Đinh Văn G", email: "dvg@nextgen.vn", value: 203000000, stage: "Đủ điều kiện", status: "pending", closeDate: "05/02/2024", rep: "Trần B." },
    { id: "8", company: "Prime Analytics", contact: "Bùi Thị H", email: "bth@primeanalytics.vn", value: 94500000, stage: "Tiếp cận", status: "pending", closeDate: "10/02/2024", rep: "Lê C." },
];

const statusConfig = {
    won: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Thành công" },
    pending: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Đang chờ" },
    lost: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Thất bại" },
};

export function DealsSection() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");

    const filteredDeals = deals.filter((deal) => {
        const matchesSearch =
            deal.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            deal.contact.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = selectedFilter === "all" || deal.status === selectedFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-sm text-muted-foreground">Xem và quản lý tất cả giao dịch của bạn tại một nơi</p>
            </div>

            {/* Filters and search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Tìm giao dịch..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {["all", "won", "pending", "lost"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                                    selectedFilter === filter
                                        ? "bg-accent text-white"
                                        : "bg-secondary text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
                    <Filter className="w-4 h-4" />
                    Thêm bộ lọc
                    <ChevronDown className="w-3 h-3" />
                </button>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-secondary/50">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                                        Công ty
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Liên hệ</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                                        Giá trị
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Giai đoạn</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phụ trách</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ngày chốt</th>
                                <th className="w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeals.map((deal, index) => {
                                const status = statusConfig[deal.status];
                                const StatusIcon = status.icon;

                                return (
                                    <tr
                                        key={deal.id}
                                        className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors duration-150 cursor-pointer animate-in fade-in slide-in-from-left-2"
                                        style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                                    {deal.company.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-foreground">{deal.company}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div>
                                                <p className="text-sm text-foreground">{deal.contact}</p>
                                                <p className="text-xs text-muted-foreground">{deal.email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm font-semibold text-foreground">
                                                ${deal.value.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium text-foreground">
                                                {deal.stage}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium", status.bg, status.color)}>
                                                <StatusIcon className="w-3 h-3" />
                                                {status.label}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-muted-foreground">{deal.rep}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-muted-foreground">{deal.closeDate}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
                    <span className="text-sm text-muted-foreground">
                        Hiển thị {filteredDeals.length} trên {deals.length} giao dịch
                    </span>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
                            Trước
                        </button>
                        <button className="px-3 py-1.5 rounded-lg text-sm bg-accent text-white font-medium">
                            1
                        </button>
                        <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
                            2
                        </button>
                        <button className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200">
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
