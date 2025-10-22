// Mock data for nearby restaurants
export const MOCK_NEARBY_RESTAURANTS = [
    { id: 1, name: "Sài Gòn Xưa", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200", rating: 4.8, distance: "0.5km", verified: true },
    { id: 2, name: "The Coffee House", image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=200", rating: 4.7, distance: "1.2km", verified: true },
    { id: 3, name: "Lẩu Thái", image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=200", rating: 4.9, distance: "2.1km", verified: false },
    { id: 4, name: "BBQ Garden", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=200", rating: 4.6, distance: "3.5km", verified: true },
];

// Mock data for posts
export const MOCK_POSTS = [
    {
        id: 1,
        restaurant: {
            name: "Nhà hàng Sài Gòn Xưa",
            avatar: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100",
            verified: true,
            location: "Quận 1, TP.HCM"
        },
        type: "promotion",
        content: "🎉 KHUYẾN MÃI ĐẶC BIỆT CUỐI TUẦN! Giảm ngay 30% cho tất cả các món ăn Việt Nam truyền thống. Áp dụng từ thứ 6 đến Chủ nhật. Đặt bàn ngay để không bỏ lỡ!",
        images: [
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
        ],
        likes: 1234,
        comments: 156,
        shares: 89,
        timestamp: "2 giờ trước",
        liked: false,
        bookmarked: false,
        tags: ["Khuyến mãi", "Món Việt", "Cuối tuần"],
        promotion: {
            discount: "30%",
            validUntil: "Chủ nhật, 24/10"
        }
    },
    {
        id: 2,
        restaurant: {
            name: "The Coffee House Premium",
            avatar: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=100",
            verified: true,
            location: "Quận 3, TP.HCM"
        },
        type: "new_menu",
        content: "☕ RA MẮT MENU MÙA ĐÔNG ĐẶC BIỆT! Thưởng thức các loại cà phê đặc sản từ Đà Lạt với hương vị đậm đà, giữ ấm những ngày se lạnh. Combo cà phê + bánh ngọt chỉ từ 89K!",
        images: [
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
        ],
        likes: 2156,
        comments: 234,
        shares: 123,
        timestamp: "5 giờ trước",
        liked: true,
        bookmarked: true,
        tags: ["Menu mới", "Cà phê", "Đà Lạt", "Mùa đông"]
    },
    {
        id: 3,
        restaurant: {
            name: "Lẩu Thái Tomyum Đặc Biệt",
            avatar: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=100",
            verified: true,
            location: "Quận 7, TP.HCM"
        },
        type: "feedback",
        content: "🌟 CẢM ƠN QUÝ KHÁCH ĐÃ TIN TƯỞNG! Rất vui khi nhận được những đánh giá 5 sao từ khách hàng về món lẩu Tomyum đặc biệt của chúng tôi. Cảm ơn sự ủng hộ!",
        images: [
            "https://images.unsplash.com/photo-1559847844-d721426d6edc?w=800",
        ],
        customerFeedback: {
            name: "Nguyễn Thị Mai",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            rating: 5,
            comment: "Lẩu rất ngon, nước lẩu đậm đà chính gốc Thái Lan! Hải sản tươi sống, rau củ đầy đủ. Nhân viên phục vụ nhiệt tình, chu đáo. Không gian rộng rãi, thoáng mát. Nhất định sẽ quay lại và giới thiệu bạn bè!"
        },
        likes: 876,
        comments: 92,
        shares: 45,
        timestamp: "1 ngày trước",
        liked: false,
        bookmarked: false,
        tags: ["Review", "Lẩu", "5 sao"]
    },
    {
        id: 4,
        restaurant: {
            name: "BBQ Garden Restaurant",
            avatar: "https://images.unsplash.com/photo-1544025162-d76694265947?w=100",
            verified: true,
            location: "Quận 2, TP.HCM"
        },
        type: "event",
        content: "🎊 SỰ KIỆN ĐẶC BIỆT - BUFFET NƯỚNG KHÔNG GIỚI HẠN! Chỉ 299K/người với hơn 50 món ăn đa dạng. Áp dụng từ 18:00 - 22:00 hàng ngày. Free nước uống không giới hạn. Đặt chỗ ngay!",
        images: [
            "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800",
            "https://images.unsplash.com/photo-1558030006-450675393462?w=800",
            "https://images.unsplash.com/photo-1544025162-d76694265947?w=800",
        ],
        likes: 3421,
        comments: 445,
        shares: 267,
        timestamp: "3 giờ trước",
        liked: true,
        bookmarked: false,
        tags: ["Sự kiện", "Buffet", "Nướng", "299K"],
        event: {
            price: "299K/người",
            time: "18:00 - 22:00",
            special: "Free nước uống"
        }
    },
    {
        id: 5,
        restaurant: {
            name: "Phở Hà Nội Truyền Thống",
            avatar: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=100",
            verified: true,
            location: "Quận 5, TP.HCM"
        },
        type: "experience",
        content: "🍜 CHIA SẺ KINH NGHIỆM: Bí quyết nấu phở bò truyền thống nấu theo công thức gia truyền 50 năm. Nước dùng thanh ngọt từ xương hầm 12 tiếng, thịt bò tươi ngon nhập khẩu. Hãy đến và trải nghiệm hương vị phở Hà Nội chính gốc!",
        images: [
            "https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=800",
        ],
        likes: 1567,
        comments: 178,
        shares: 94,
        timestamp: "6 giờ trước",
        liked: false,
        bookmarked: true,
        tags: ["Món Việt", "Phở", "Truyền thống", "Hà Nội"]
    }
];
