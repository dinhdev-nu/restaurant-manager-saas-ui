import { Header } from "./components/header";
import { SettingsSection } from "./components/setting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import "./profile.css"
export default function ProfilePage() {
    const navigate = useNavigate();

    const quickAccessCards = [
        {
            id: "feed",
            title: "Bảng tin khách hàng",
            description: "Xem hoạt động khách hàng và các nội dung mới nhất.",
            cta: "Mở Feed",
            path: "/feed",
        },
        {
            id: "new",
            title: "Tạo nhà hàng mới",
            description: "Khởi tạo nhanh một nhà hàng mới với đầy đủ thông tin cơ bản.",
            cta: "Đi tới New",
            path: "/new",
        },
        {
            id: "restaurant-selector",
            title: "Chọn nhà hàng",
            description: "Chọn nhà hàng để vào đúng dashboard và luồng làm việc.",
            cta: "Chọn nhà hàng",
            path: "/restaurant-selector",
        },
    ];

    const leftCards = quickAccessCards.slice(0, 2);
    const rightCards = quickAccessCards.slice(2);


    return (
        <div className={`profile-page flex flex-col min-h-screen bg-background`}>
            <Header />
            <div className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_280px] gap-6">
                    <aside className="hidden xl:block space-y-4">
                        {leftCards.map((item) => {
                            return (
                                <Card key={item.id} className="border-border bg-card">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">{item.title}</CardTitle>
                                        <CardDescription>{item.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-between"
                                            onClick={() => navigate(item.path)}
                                        >
                                            {item.cta}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </aside>

                    <main className="w-full max-w-5xl xl:max-w-none mx-auto">
                        <Card className="border-border bg-card mb-6 xl:hidden">
                            <CardHeader>
                                <CardTitle className="text-base">Điều hướng nhanh</CardTitle>
                                <CardDescription>Truy cập Feed, New và Chọn nhà hàng.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {quickAccessCards.map((item) => {
                                    return (
                                        <Button
                                            key={item.id}
                                            variant="outline"
                                            className="justify-between"
                                            onClick={() => navigate(item.path)}
                                        >
                                            {item.title}
                                        </Button>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        <SettingsSection />
                    </main>

                    <aside className="hidden xl:block space-y-4">
                        {rightCards.map((item) => {
                            return (
                                <Card key={item.id} className="border-border bg-card sticky top-24">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">{item.title}</CardTitle>
                                        <CardDescription>{item.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-between"
                                            onClick={() => navigate(item.path)}
                                        >
                                            {item.cta}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </aside>
                </div>
            </div>
        </div>
    );
}
