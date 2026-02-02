import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/Card";
import Button from "../../../../components/ui/Button";
import Input from "../../../../components/ui/Input";
import { Label } from "../../../../components/ui/Label";
import { Switch } from "../../../../components/ui/Switch";
import { Badge } from "../../../../components/ui/Badge";
import { Avatar } from "../../../../components/ui/Avatar";
import {
    User,
    Bell,
    Shield,
    Palette,
    Link2,
    Database,
    Mail,
    Smartphone,
    Globe,
    Key,
    RefreshCw,
    Check,
    ExternalLink,
    Zap,
} from "lucide-react";

const integrations = [
    {
        id: "salesforce",
        name: "Salesforce",
        description: "Đồng bộ liên hệ và cơ hội",
        connected: true,
        lastSync: "2 giờ trước",
    },
    {
        id: "hubspot",
        name: "HubSpot",
        description: "Tự động hóa marketing và CRM",
        connected: true,
        lastSync: "5 phút trước",
    },
    {
        id: "slack",
        name: "Slack",
        description: "Thông báo và cảnh báo nhóm",
        connected: true,
        lastSync: "Thời gian thực",
    },
    {
        id: "gmail",
        name: "Gmail",
        description: "Theo dõi và đồng bộ email",
        connected: false,
        lastSync: null,
    },
    {
        id: "calendar",
        name: "Google Calendar",
        description: "Lịch hẹn",
        connected: false,
        lastSync: null,
    },
    {
        id: "zoom",
        name: "Zoom",
        description: "Tích hợp họi nghị trực tuyến",
        connected: true,
        lastSync: "1 giờ trước",
    },
];

const notificationSettings = [
    {
        id: "deal_updates",
        label: "Cập nhật giao dịch",
        description: "Nhận thông báo khi giao dịch thay đổi trạng thái",
        email: true,
        push: true,
    },
    {
        id: "team_activity",
        label: "Hoạt động nhóm",
        description: "Cập nhật về hiệu suất và mốc quan trọng của nhóm",
        email: true,
        push: false,
    },
    {
        id: "pipeline_alerts",
        label: "Cảnh báo quy trình",
        description: "Cảnh báo thay đổi và rủi ro quy trình",
        email: true,
        push: true,
    },
    {
        id: "forecast_updates",
        label: "Cập nhật dự báo",
        description: "Báo cáo tổng kết dự báo hàng tuần",
        email: true,
        push: false,
    },
    {
        id: "customer_health",
        label: "Sức khỏe khách hàng",
        description: "Cảnh báo khi điểm sức khỏe khách hàng giảm",
        email: false,
        push: true,
    },
];

export function SettingsSection() {
    const [activeTab, setActiveTab] = useState("profile");
    const [notifications, setNotifications] = useState(notificationSettings);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    const toggleNotification = (id, type) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, [type]: !n[type] } : n))
        );
    };

    const tabs = [
        { id: "profile", label: "Hồ sơ", icon: User },
        { id: "notifications", label: "Thông báo", icon: Bell },
        { id: "integrations", label: "Tích hợp", icon: Link2 },
        { id: "security", label: "Bảo mật", icon: Shield },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-foreground">Cài đặt</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Quản lý tùy chọn tài khoản và tích hợp
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-secondary border border-border rounded-lg w-fit">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-card text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Thông tin cá nhân</CardTitle>
                            <CardDescription>Cập nhật thông tin và tùy chọn cá nhân</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="w-20 h-20 bg-secondary">
                                    <div className="w-full h-full flex items-center justify-center bg-accent text-white text-2xl font-semibold">
                                        JD
                                    </div>
                                </Avatar>
                                <div className="space-y-2">
                                    <Button variant="outline" size="sm">
                                        Thay đổi ảnh đại diện
                                    </Button>
                                    <p className="text-xs text-muted-foreground">JPG, PNG hoặc GIF. Tối đa 2MB.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Họ</Label>
                                    <Input
                                        id="firstName"
                                        defaultValue="Nguyễn Văn"
                                        className="bg-secondary border-border focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Tên</Label>
                                    <Input
                                        id="lastName"
                                        defaultValue="An"
                                        className="bg-secondary border-border focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        defaultValue="an.nguyen@congty.vn"
                                        className="bg-secondary border-border focus:border-accent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Vai trò</Label>
                                    <select
                                        id="role"
                                        defaultValue="manager"
                                        className="w-full h-9 px-3 rounded-lg bg-secondary border border-border text-sm"
                                    >
                                        <option value="admin">Quản trị viên</option>
                                        <option value="manager">Quản lý bán hàng</option>
                                        <option value="rep">Nhân viên bán hàng</option>
                                        <option value="viewer">Người xem</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timezone">Múi giờ</Label>
                                <select
                                    id="timezone"
                                    defaultValue="ict"
                                    className="w-full md:w-[300px] h-9 px-3 rounded-lg bg-secondary border border-border text-sm"
                                >
                                    <option value="ict">Giờ Đông Dương (ICT)</option>
                                    <option value="jst">Giờ Nhật Bản (JST)</option>
                                    <option value="cst">Giờ Trung Quốc (CST)</option>
                                    <option value="ist">Giờ Ấn Độ (IST)</option>
                                    <option value="utc">UTC</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Tùy chọn hiển thị</CardTitle>
                            <CardDescription>Tùy chỉnh cách hiển thị dữ liệu</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Palette className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-foreground">Chế độ tối</p>
                                        <p className="text-sm text-muted-foreground">Sử dụng giao diện tối</p>
                                    </div>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-foreground">Định dạng tiền tệ</p>
                                        <p className="text-sm text-muted-foreground">Hiển thị tiền tệ theo khu vực</p>
                                    </div>
                                </div>
                                <select
                                    defaultValue="vnd"
                                    className="w-[120px] h-9 px-3 rounded-lg bg-secondary border border-border text-sm"
                                >
                                    <option value="vnd">VND (₫)</option>
                                    <option value="usd">USD ($)</option>
                                    <option value="eur">EUR (€)</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Database className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium text-foreground">Giao diện gọn</p>
                                        <p className="text-sm text-muted-foreground">Hiển thị nhiều dữ liệu hơn trong không gian nhỏ hơn</p>
                                    </div>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSave}
                            className="bg-accent hover:bg-accent/90 text-white"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Đang lưu...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Lưu thay đổi
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Tùy chọn thông báo</CardTitle>
                            <CardDescription>Chọn cách và khi nào bạn muốn nhận thông báo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <div className="grid grid-cols-[1fr,80px,80px] gap-4 pb-3 border-b border-border text-sm text-muted-foreground">
                                    <span>Loại thông báo</span>
                                    <span className="text-center flex items-center justify-center gap-1.5">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </span>
                                    <span className="text-center flex items-center justify-center gap-1.5">
                                        <Smartphone className="w-4 h-4" />
                                        Push
                                    </span>
                                </div>
                                {notifications.map((notification, index) => (
                                    <div
                                        key={notification.id}
                                        className="grid grid-cols-[1fr,80px,80px] gap-4 py-4 border-b border-border last:border-0 animate-in fade-in slide-in-from-left-2"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div>
                                            <p className="font-medium text-foreground">{notification.label}</p>
                                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <Switch
                                                checked={notification.email}
                                                onCheckedChange={() => toggleNotification(notification.id, "email")}
                                            />
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <Switch
                                                checked={notification.push}
                                                onCheckedChange={() => toggleNotification(notification.id, "push")}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Dịch vụ đã kết nối</CardTitle>
                            <CardDescription>Quản lý các tích hợp bên thứ ba</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {integrations.map((integration, index) => (
                                    <div
                                        key={integration.id}
                                        className={`p-4 rounded-lg border transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${integration.connected
                                            ? "bg-secondary/50 border-border hover:border-accent/50"
                                            : "bg-secondary/20 border-border hover:border-muted-foreground/30"
                                            }`}
                                        style={{ animationDelay: `${index * 75}ms` }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${integration.connected ? "bg-accent/20" : "bg-muted"
                                                        }`}
                                                >
                                                    <Zap
                                                        className={`w-5 h-5 ${integration.connected ? "text-accent" : "text-muted-foreground"
                                                            }`}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{integration.name}</p>
                                                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                                                </div>
                                            </div>
                                            <Badge
                                                className={
                                                    integration.connected
                                                        ? "bg-accent/20 text-accent border-accent/30"
                                                        : "bg-muted text-muted-foreground border-border"
                                                }
                                            >
                                                {integration.connected ? "Kết nối" : "Chưa kết nối"}
                                            </Badge>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            {integration.connected ? (
                                                <>
                                                    <span className="text-xs text-muted-foreground">
                                                        Đồng bộ lần cuối: {integration.lastSync}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="sm" className="h-8">
                                                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                                            Đồng bộ
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive">
                                                            Ngắt kết nối
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="text-xs text-muted-foreground">Chưa cấu hình</span>
                                                    <Button
                                                        size="sm"
                                                        className="h-8 bg-accent hover:bg-accent/90 text-white"
                                                    >
                                                        Kết nối
                                                        <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Mật khẩu & Xác thực</CardTitle>
                            <CardDescription>Quản lý cài đặt bảo mật tài khoản</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        className="bg-secondary border-border focus:border-accent max-w-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        className="bg-secondary border-border focus:border-accent max-w-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        className="bg-secondary border-border focus:border-accent max-w-md"
                                    />
                                </div>
                                <Button variant="outline">Cập nhật mật khẩu</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Xác thực hai yếu tố</CardTitle>
                            <CardDescription>Thêm lớp bảo mật bổ sung cho tài khoản</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                                        <Key className="w-5 h-5 text-accent" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Ứng dụng xác thực</p>
                                        <p className="text-sm text-muted-foreground">
                                            Sử dụng ứng dụng xác thực cho mã 2FA
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className="bg-accent/20 text-accent border-accent/30">Đã bật</Badge>
                                    <Button variant="outline" size="sm">
                                        Quản lý
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Phiên hoạt động</CardTitle>
                            <CardDescription>Quản lý thiết bị đang đăng nhập</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { device: "MacBook Pro", location: "TP. Hồ Chí Minh", current: true, time: "Bây giờ" },
                                    { device: "iPhone 15", location: "TP. Hồ Chí Minh", current: false, time: "2 giờ trước" },
                                    { device: "Chrome on Windows", location: "Hà Nội", current: false, time: "1 ngày trước" },
                                ].map((session, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border animate-in fade-in slide-in-from-left-2"
                                        style={{ animationDelay: `${index * 75}ms` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                                                <Globe className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {session.device}
                                                    {session.current && (
                                                        <Badge className="ml-2 bg-accent/20 text-accent border-accent/30 text-xs">
                                                            Hiện tại
                                                        </Badge>
                                                    )}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {session.location} • {session.time}
                                                </p>
                                            </div>
                                        </div>
                                        {!session.current && (
                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                                Thu hồi
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
