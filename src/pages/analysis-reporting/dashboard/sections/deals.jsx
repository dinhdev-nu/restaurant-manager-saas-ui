import { useState, useMemo } from "react";
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
    Package,
} from "lucide-react";
import { useOrderStore } from "../../../../stores/order.store";

const ITEMS_PER_PAGE = 10;

const orderStatusConfig = {
    completed: { icon: CheckCircle2, color: "text-success", label: "Hoàn thành" },
    pending: { icon: Clock, color: "text-warning", label: "Chờ xử lý" },
    processing: { icon: Package, color: "text-blue-500", label: "Đang xử lý" },
    cancelled: { icon: XCircle, color: "text-destructive", label: "Đã hủy" },
};

const paymentStatusConfig = {
    paid: { icon: CheckCircle2, color: "text-success", label: "Đã thanh toán" },
    unpaid: { icon: Clock, color: "text-warning", label: "Chưa thanh toán" },
    refunded: { icon: XCircle, color: "text-destructive", label: "Đã hoàn tiền" },
};

export function DealsSection() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Get orders from store
    const orders = useOrderStore((state) => state.orders);

    // Filter orders
    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesSearch =
                order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.table?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.staff?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.customer?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = selectedFilter === "all" || order.status === selectedFilter;
            return matchesSearch && matchesFilter;
        });
    }, [orders, searchQuery, selectedFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentOrders = filteredOrders.slice(startIndex, endIndex);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount || 0);
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <p className="text-sm text-muted-foreground">Xem và quản lý tất cả đơn hàng của bạn tại một nơi</p>
            </div>

            {/* Filters and search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Tìm đơn hàng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 h-9 pl-9 pr-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent transition-all duration-200"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {["all", "pending", "processing", "completed", "cancelled"].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => {
                                    setSelectedFilter(filter);
                                    setCurrentPage(1);
                                }}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
                                    selectedFilter === filter
                                        ? "bg-accent text-white"
                                        : "bg-secondary text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {filter === "all" ? "Tất cả" : orderStatusConfig[filter]?.label || filter}
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
                                        Mã đơn hàng
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Khách hàng</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bàn</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                                        Tổng tiền
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Số món</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thanh toán</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nhân viên</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ngày tạo</th>
                                <th className="w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="py-8 text-center text-sm text-muted-foreground">
                                        Không tìm thấy đơn hàng nào
                                    </td>
                                </tr>
                            ) : (
                                currentOrders.map((order, index) => {
                                    const orderStatus = orderStatusConfig[order.status] || orderStatusConfig.pending;
                                    const paymentStatus = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.unpaid;
                                    const OrderStatusIcon = orderStatus.icon;
                                    const PaymentStatusIcon = paymentStatus.icon;
                                    const customerInitial = order.customer ? order.customer.charAt(0).toUpperCase() : "K";

                                    return (
                                        <tr
                                            key={order._id}
                                            className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors duration-150 cursor-pointer animate-in fade-in slide-in-from-left-2"
                                            style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                                        >
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground ">
                                                        {customerInitial}
                                                    </div>

                                                    <span className="text-xs font-medium text-foreground">{order.orderId || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="text-xs text-foreground">{order.customer || "Khách vãn lai"}</p>
                                                    {(order.customerPhone || order.email) && (
                                                        <p className="text-xs text-muted-foreground">{order.customerPhone || order.email}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-xs text-foreground">{order.table || "N/A"}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-xs font-semibold text-foreground">
                                                    {formatCurrency(order.total)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="px-2 py-1 rounded-md bg-secondary text-xs font-medium text-foreground inline-flex items-center gap-1">
                                                    <Package className="w-3 h-3" />
                                                    {order.items?.length || 0}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                                                    orderStatus.color
                                                )}>
                                                    <OrderStatusIcon className="w-3 h-3" />
                                                    {orderStatus.label}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium", paymentStatus.color)}>
                                                    <PaymentStatusIcon className="w-3 h-3" />
                                                    {paymentStatus.label}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-xs text-muted-foreground">{order.staff || "Chưa phân công"}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-xs text-muted-foreground">{formatDate(order.createdAt || order.timestamp)}</span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-200">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredOrders.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-secondary/30">
                        <span className="text-sm text-muted-foreground">
                            Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} trên {filteredOrders.length} đơn hàng
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm transition-colors duration-200",
                                    currentPage === 1
                                        ? "text-muted-foreground/50 cursor-not-allowed"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                )}
                            >
                                Trước
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNumber;
                                if (totalPages <= 5) {
                                    pageNumber = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNumber = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNumber = totalPages - 4 + i;
                                } else {
                                    pageNumber = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-lg text-sm transition-colors duration-200",
                                            currentPage === pageNumber
                                                ? "bg-accent text-white font-medium"
                                                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                        )}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            })}
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage >= totalPages}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-sm transition-colors duration-200",
                                    currentPage >= totalPages
                                        ? "text-muted-foreground/50 cursor-not-allowed"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                )}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
