# Nhật ký thao tác: bộ lọc nâng cao, chọn khoảng ngày, lọc trên điện thoại (T695)

- Ngày: 31/10/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/he-thong/nhatKyMau.ts`: thêm `LocNK`, `locNKMacDinh`, `khopLocNK`, `luaChonNK`, `ngayTT` dùng chung web và điện thoại. Bỏ `laHomNay`. Thêm 4 dòng mẫu từ 01/10 đến 05/10 để thử lọc khoảng ngày.
- `src/modules/tien-ich/TienIch.tsx` (`NhatKyThaoTac`): thanh lọc dùng `BoLoc chiNutPheu`. Ngoài thanh: Ngày thao tác (`ChonKhoangNgay kieu="chip"`), Thao tác, Cửa hàng. Trong phễu: Tài khoản, Tên chứng từ, Ngày chứng từ (hai ô `ONgay`, để trống là không lọc).
- `src/ui/mobile/MHeThong.tsx` (`MNhatKyThaoTac`): mở màn chưa có thẻ. Phễu mở bảng `.m-nk-loc` trượt lên với 6 điều kiện, nút Đặt lại và Lọc.
- `src/styles/app.css`: mục mới T695. Mục điện thoại T693 có 21 selector trần (`.chon`, `.so`, `.ds`, `.hd`, `.av`, `.mt`…) áp lên cả app, đã gỡ, chỉ giữ bản có `.m-nk-ct` đứng trước.
- `src/modules/he-thong/huong-dan.ts`: câu hướng dẫn bước thanh lọc.
- `tools/kiem_tra.py` đợt 11A: kiểm chưa Lọc thì không có thẻ, phễu mở bảng lọc đủ 6 ô, bấm Lọc mới có thẻ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: qua. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Đợt 11A chạy riêng: chỉ còn lỗi cũ T690.
- Playwright gói Plus: Lọc hôm nay 10 dòng; Tuần này 12 dòng; thêm Ngày chứng từ 01/10–05/10 còn 3 dòng, ẩn dòng Khoá sổ.
- `kiem_van.py` 4 file: sạch.

## Dở dang, việc tiếp theo

- T696: `kiem_tra.py --dien-thoai` dừng ở đợt 5, không thấy `.m-xp-nut-menu`. Chưa rõ có từ trước hay không, không dính file của T695.

## Bẫy, quyết định mới

- CSS do agent viết dạng `.m-nk-ct .hd,\n.hd {` làm rò kiểu ra toàn app. Soát mục CSS mới bằng cách tìm dòng bắt đầu bằng class không có tiền tố của việc.
