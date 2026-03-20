import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { Label } from "../../../components/ui/Label";
import { Switch } from "../../../components/ui/Switch";
import { Badge } from "../../../components/ui/Badge";
import {
    User,
    Bell,
    Shield,
    Link2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../../../components/ui/Avatar";
import { useProfile } from "../hooks/use-profile";
import {
    changePasswordApi,
    disable2faApi,
    enable2faApi,
    getSessionsApi,
    logoutAllApi,
    logoutApi,
    revokeSessionApi,
} from "../../../api/auth";
import { useAuthStore } from "../../../stores/auth.store";
import { useToast } from "../../../hooks/use-toast";
import { validatePassword } from "../../../utils/validators";

// Helper function to get initials from name
const getInitials = (name) => {
    if (!name) return "U";
    return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

// Helper function to format session time
const formatSessionTime = (dateString) => {
    if (!dateString) return "Không rõ";

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;

    return date.toLocaleDateString("vi-VN");
};

// Role labels mapping
const ROLE_LABEL = {
    owner: "Chủ quán",
    manager: "Quản lý",
    staff: "Nhân viên",
    cashier: "Thu ngân",
    waiter: "Phục vụ",
    user: "Người dùng",
};

export function SettingsSection() {
    const {
        profile,
        isLoading,
        refetch,
        updateProfile: updateProfileApi,
        updatePreferences: updatePreferencesApi,
    } = useProfile();
    const navigate = useNavigate();
    const { toast } = useToast();
    const logoutStore = useAuthStore((state) => state.logout);

    const [activeTab, setActiveTab] = useState("profile");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Sessions state
    const [sessions, setSessions] = useState([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isToggling2fa, setIsToggling2fa] = useState(false);

    // Notification preferences state from profile
    const [notificationPrefs, setNotificationPrefs] = useState({
        email: true,
        sms: true,
        push: true,
    });

    // Personal information states
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");

    // Preference states
    const [theme, setTheme] = useState("light");
    const [language, setLanguage] = useState("vi");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [twoFaPassword, setTwoFaPassword] = useState("");

    const unwrapData = (response) => response?.data ?? response;

    // Initialize states from profile data
    useEffect(() => {
        if (profile) {
            const nameParts = profile.full_name?.split(" ") || [];
            setFirstName(nameParts[0] || "");
            setLastName(nameParts.slice(1).join(" ") || "");

            // Format date_of_birth from API (ISO string) to YYYY-MM-DD
            if (profile.date_of_birth) {
                const date = new Date(profile.date_of_birth);
                const formatted = date.toISOString().split("T")[0];
                setDateOfBirth(formatted);
            }

            setGender(profile.gender || "");
            setTheme(profile.preferences?.theme || "light");
            setLanguage(profile.preferences?.language || "vi");

            // Initialize notification preferences from profile
            if (profile.preferences?.notifications) {
                setNotificationPrefs(profile.preferences.notifications);
            }
        }
    }, [profile]);

    // Load sessions when security tab is active
    useEffect(() => {
        if (activeTab === "security") {
            loadSessions();
        }
    }, [activeTab]);

    const loadSessions = async () => {
        setIsLoadingSessions(true);
        try {
            const response = await getSessionsApi();
            const payload = unwrapData(response);
            setSessions(payload?.sessions || []);
        } catch (error) {
            console.error("Failed to load sessions:", error);
            toast({
                variant: "destructive",
                title: "Không thể tải phiên hoạt động",
                description: error.response?.data?.message || error.message || "Vui lòng thử lại sau.",
            });
        } finally {
            setIsLoadingSessions(false);
        }
    };

    const handleRevokeSession = async (sessionId) => {
        try {
            await revokeSessionApi(sessionId);
            // Reload sessions after revoke
            await loadSessions();
            toast({ title: "Đã thu hồi phiên", description: "Phiên đăng nhập đã bị vô hiệu hóa." });
        } catch (error) {
            console.error("Failed to revoke session:", error);
            toast({
                variant: "destructive",
                title: "Thu hồi thất bại",
                description: error.response?.data?.message || error.message || "Vui lòng thử lại.",
            });
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logoutApi();
        } catch (error) {
            console.error("Logout API failed, fallback to local logout:", error);
        } finally {
            logoutStore();
            navigate("/auth");
            setIsLoggingOut(false);
        }
    };

    const handleLogoutAll = async () => {
        setIsLoggingOutAll(true);
        try {
            await logoutAllApi();
            toast({
                title: "Đã đăng xuất tất cả",
                description: "Các phiên đăng nhập đã được thu hồi.",
            });
            await loadSessions();
        } catch (error) {
            console.error("Failed to logout all sessions:", error);
            toast({
                variant: "destructive",
                title: "Không thể đăng xuất tất cả",
                description: error.response?.data?.message || error.message || "Vui lòng thử lại.",
            });
        } finally {
            setIsLoggingOutAll(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast({
                variant: "destructive",
                title: "Thiếu thông tin",
                description: "Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.",
            });
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            toast({
                variant: "destructive",
                title: "Mật khẩu mới không hợp lệ",
                description: passwordError,
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Xác nhận mật khẩu không khớp",
                description: "Vui lòng nhập lại mật khẩu mới trùng khớp.",
            });
            return;
        }

        setIsChangingPassword(true);
        try {
            await changePasswordApi({
                current_password: currentPassword,
                new_password: newPassword,
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast({ title: "Đổi mật khẩu thành công", description: "Mật khẩu của bạn đã được cập nhật." });
        } catch (error) {
            console.error("Failed to change password:", error);
            toast({
                variant: "destructive",
                title: "Đổi mật khẩu thất bại",
                description: error.response?.data?.message || error.message || "Vui lòng thử lại.",
            });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleToggle2fa = async () => {
        if (!twoFaPassword) {
            toast({
                variant: "destructive",
                title: "Thiếu mật khẩu",
                description: "Vui lòng nhập mật khẩu để xác nhận thao tác 2FA.",
            });
            return;
        }

        setIsToggling2fa(true);
        try {
            if (profile?.two_factor_enabled) {
                await disable2faApi(twoFaPassword);
                toast({ title: "Đã tắt 2FA", description: "Xác thực hai yếu tố đã được vô hiệu hóa." });
            } else {
                await enable2faApi(twoFaPassword);
                toast({ title: "Đã bật 2FA", description: "Tài khoản của bạn đã được bật xác thực hai yếu tố." });
            }
            setTwoFaPassword("");
            await refetch();
        } catch (error) {
            console.error("Failed to toggle 2FA:", error);
            toast({
                variant: "destructive",
                title: "Cập nhật 2FA thất bại",
                description: error.response?.data?.message || error.message || "Vui lòng kiểm tra lại mật khẩu.",
            });
        } finally {
            setIsToggling2fa(false);
        }
    };

    // Get status badge
    const statusBadge = profile?.status ? {
        label: profile.status === "active" ? "Hoạt động" : "Không hoạt động",
        className: profile.status === "active"
            ? "bg-success/20 text-success border-success/30"
            : "bg-muted text-muted-foreground border-border"
    } : null;

    const handleSave = async () => {
        setIsSavingProfile(true);
        try {
            const full_name = `${firstName} ${lastName}`.trim();
            const updateData = {
                full_name,
                ...(dateOfBirth && { date_of_birth: dateOfBirth }),
                ...(gender && gender !== "_none" && { gender }),
            };

            const result = await updateProfileApi(updateData);

            if (result.success) {
                console.log("Profile updated successfully");
            } else {
                console.error("Failed to update profile:", result.error);
            }
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setIsSavingProfile(false);
        }
    };

    // Save preferences when theme or language changes
    const handlePreferenceChange = async (key, value) => {
        try {
            await updatePreferencesApi({ [key]: value });
        } catch (error) {
            console.error("Failed to update preferences:", error);
        }
    };

    const toggleNotification = async (type) => {
        const newValue = !notificationPrefs[type];
        setNotificationPrefs((prev) => ({
            ...prev,
            [type]: newValue,
        }));

        // Save to API
        try {
            await updatePreferencesApi({
                notifications: {
                    ...notificationPrefs,
                    [type]: newValue,
                }
            });
        } catch (error) {
            console.error("Failed to update notification preference:", error);
            // Revert on error
            setNotificationPrefs((prev) => ({
                ...prev,
                [type]: !newValue,
            }));
        }
    };

    const tabs = [
        { id: "profile", label: "Hồ sơ", icon: User },
        { id: "notifications", label: "Thông báo", icon: Bell },
        { id: "integrations", label: "Tích hợp", icon: Link2 },
        { id: "security", label: "Bảo mật", icon: Shield },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Cài đặt</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Quản lý tùy chọn tài khoản và tích hợp
                    </p>
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleLogout}
                    loading={isLoggingOut}
                    disabled={isLoggingOut}
                >
                    Đăng xuất
                </Button>
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
                            <CardDescription>Cập nhật thông tin cá nhân và tùy chọn của bạn</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Avatar + meta */}
                            <div className="flex items-center gap-6">
                                <Avatar className="w-20 h-20">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                                        {getInitials(profile?.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {statusBadge && (
                                            <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                                        )}
                                        {profile?.system_role && (
                                            <Badge variant="outline" className="text-xs">
                                                {ROLE_LABEL[profile.system_role] ?? profile.system_role}
                                            </Badge>
                                        )}
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Đổi ảnh đại diện
                                    </Button>
                                    <p className="text-xs text-muted-foreground">JPG, PNG hoặc GIF. Tối đa 2MB.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* First Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Tên</Label>
                                    <Input
                                        id="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                {/* Last Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Họ và tên đệm</Label>
                                    <Input
                                        id="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile?.email ?? ""}
                                        readOnly
                                        className="bg-secondary/50 cursor-default"
                                    />
                                </div>
                                {/* Phone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input
                                        id="phone"
                                        value={profile?.phone ?? ""}
                                        readOnly
                                        placeholder="Chưa cập nhật"
                                        className="bg-secondary/50 cursor-default"
                                    />
                                </div>
                                {/* Date of Birth */}
                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                    <Input
                                        id="dateOfBirth"
                                        type="date"
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                    />
                                </div>
                                {/* Gender */}
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Giới tính</Label>
                                    <Select
                                        id="gender"
                                        value={gender || "_none"}
                                        onChange={(v) => setGender(v === "_none" ? "" : v)}
                                        options={[
                                            { value: "_none", label: "Không muốn chia sẻ" },
                                            { value: "male", label: "Nam" },
                                            { value: "female", label: "Nữ" },
                                            { value: "other", label: "Khác" },
                                        ]}
                                        placeholder="Không muốn chia sẻ"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Tùy chọn hiển thị</CardTitle>
                            <CardDescription>Tùy chỉnh cách hiển thị thông tin trên giao diện</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">Chế độ tối</p>
                                    <p className="text-sm text-muted-foreground">Sử dụng giao diện tối cho hệ thống</p>
                                </div>
                                <Switch
                                    checked={theme === "dark"}
                                    onCheckedChange={(checked) => {
                                        const newTheme = checked ? "dark" : "light";
                                        setTheme(newTheme);
                                        handlePreferenceChange("theme", newTheme);
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">Ngôn ngữ</p>
                                    <p className="text-sm text-muted-foreground">Ngôn ngữ hiển thị của giao diện</p>
                                </div>
                                <Select
                                    value={language}
                                    onChange={(v) => {
                                        setLanguage(v);
                                        handlePreferenceChange("language", v);
                                    }}
                                    options={[
                                        { value: "en", label: "Tiếng Anh" },
                                        { value: "vi", label: "Tiếng Việt" },
                                    ]}
                                    className="w-[120px]"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-foreground">Hiển thị thu gọn</p>
                                    <p className="text-sm text-muted-foreground">Hiển thị nhiều dữ liệu hơn trong cùng không gian</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            onClick={handleSave}
                            disabled={isSavingProfile || isLoading}
                        >
                            {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
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
                            <div className="space-y-4">
                                {/* Email Notifications */}
                                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                                    <div>
                                        <p className="font-medium text-foreground">Thông báo Email</p>
                                        <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                                    </div>
                                    <Switch
                                        checked={notificationPrefs.email}
                                        onCheckedChange={() => toggleNotification("email")}
                                    />
                                </div>

                                {/* SMS Notifications */}
                                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                                    <div>
                                        <p className="font-medium text-foreground">Thông báo SMS</p>
                                        <p className="text-sm text-muted-foreground">Nhận thông báo qua tin nhắn điện thoại</p>
                                    </div>
                                    <Switch
                                        checked={notificationPrefs.sms}
                                        onCheckedChange={() => toggleNotification("sms")}
                                    />
                                </div>

                                {/* Push Notifications */}
                                <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border">
                                    <div>
                                        <p className="font-medium text-foreground">Thông báo Push</p>
                                        <p className="text-sm text-muted-foreground">Nhận thông báo đẩy trên trình duyệt</p>
                                    </div>
                                    <Switch
                                        checked={notificationPrefs.push}
                                        onCheckedChange={() => toggleNotification("push")}
                                    />
                                </div>
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
                            <CardTitle className="text-base font-medium">Tích hợp bên thứ ba</CardTitle>
                            <CardDescription>Quản lý các kết nối với dịch vụ bên ngoài</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-foreground font-medium mb-2">Chưa có tích hợp nào</p>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                    Tích hợp với các dịch vụ bên thứ ba sẽ được cập nhật trong phiên bản tiếp theo
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Integrations Tab - OLD VERSION TO DELETE
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
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="bg-secondary border-border focus:border-accent max-w-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="bg-secondary border-border focus:border-accent max-w-md"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="bg-secondary border-border focus:border-accent max-w-md"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleChangePassword}
                                    loading={isChangingPassword}
                                    disabled={isChangingPassword}
                                >
                                    Cập nhật mật khẩu
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Xác thực hai yếu tố</CardTitle>
                            <CardDescription>Thêm lớp bảo mật bổ sung cho tài khoản của bạn</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                                <div>
                                    <div>
                                        <p className="font-medium text-foreground">Xác thực hai yếu tố</p>
                                        <p className="text-sm text-muted-foreground">
                                            Thêm bảo mật bổ sung cho tài khoản của bạn
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={profile?.two_factor_enabled
                                        ? "bg-accent/20 text-accent border-accent/30"
                                        : "bg-muted text-muted-foreground border-border"
                                    }>
                                        {profile?.two_factor_enabled ? "Đã bật" : "Chưa bật"}
                                    </Badge>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleToggle2fa}
                                        loading={isToggling2fa}
                                        disabled={isToggling2fa}
                                    >
                                        {profile?.two_factor_enabled ? "Tắt 2FA" : "Bật 2FA"}
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 max-w-md space-y-2">
                                <Label htmlFor="twoFaPassword">Mật khẩu xác nhận</Label>
                                <Input
                                    id="twoFaPassword"
                                    type="password"
                                    value={twoFaPassword}
                                    onChange={(e) => setTwoFaPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu để bật/tắt 2FA"
                                    className="bg-secondary border-border focus:border-accent"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-base font-medium">Phiên hoạt động</CardTitle>
                            <CardDescription>Quản lý thiết bị đang đăng nhập</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-end mb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogoutAll}
                                    loading={isLoggingOutAll}
                                    disabled={isLoggingOutAll}
                                >
                                    Đăng xuất tất cả phiên
                                </Button>
                            </div>
                            {isLoadingSessions ? (
                                <div className="flex items-center justify-center py-8">
                                    <p className="text-sm text-muted-foreground">Đang tải phiên hoạt động...</p>
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <p className="text-foreground font-medium">Không có phiên hoạt động</p>
                                    <p className="text-sm text-muted-foreground">Bạn chưa đăng nhập trên thiết bị nào</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sessions.map((session, index) => {
                                        const deviceName = session.device_info?.device || session.device_info?.browser || "Thiết bị không rõ";
                                        const timeAgo = formatSessionTime(session.created_at);

                                        return (
                                            <div
                                                key={session.session_id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border animate-in fade-in slide-in-from-left-2"
                                                style={{ animationDelay: `${index * 75}ms` }}
                                            >
                                                <div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">
                                                            {deviceName} - {session.device_info?.browser || ""}
                                                            {session.is_current && (
                                                                <Badge className="ml-2 bg-accent/20 text-accent border-accent/30 text-xs">
                                                                    Hiện tại
                                                                </Badge>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {session.ip_address} • {timeAgo}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!session.is_current && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleRevokeSession(session.session_id)}
                                                    >
                                                        Thu hồi
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
