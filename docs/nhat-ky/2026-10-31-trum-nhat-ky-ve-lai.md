# Nhật ký thao tác vẽ lại theo artifact bản 10 (T693)

- Ngày: 31/10/2026
- Người: Trum, agent: Claude Code điều phối, 3 Antigravity (web, điện thoại, CSS điện thoại)
- Trạng thái cuối phiên: Xong

## Đã làm

- Bản vẽ: artifact https://claude.ai/artifact/4oq5kMF3x7wjVj8C5ueABD, Trum duyệt bản 10.
- `src/modules/he-thong/nhatKyMau.ts`: viết lại dữ liệu mẫu. Mỗi dòng có `g` (gói thấp nhất có thao tác đó) và `noiDung` (lịch sử thao tác ghi thành câu). Bỏ Xem báo cáo, Xuất Excel, In, Đăng xuất, bỏ các trường số tiền, diễn giải, phiên, màn hình, thay đổi, lịch sử phiếu. Thêm `THAO_TAC_GOI`, `HOM_NAY`, `laHomNay`, `dongTu`, `doiTuongTT`, `vietTat`. `useNhatKyDayDu(goi)` lọc theo gói.
- `src/modules/tien-ich/TienIch.tsx` (`NhatKyThaoTac`): thanh lọc kiểu danh sách chứng từ (phễu, chip Hôm nay, Thao tác theo gói, Cửa hàng, tìm, chọn cột), bảng 9 cột rộng cố định 1394px cuộn ngang, side panel phải 520px đè lên bảng: câu "ai đã làm gì", Thông tin chi tiết, Chứng từ (gói Standard ẩn Trạng thái), Lịch sử thao tác, nút Đóng.
- `src/ui/mobile/MHeThong.tsx` (`MNhatKyThaoTac`): thẻ hôm nay, chạm thẻ mở bảng chi tiết trượt từ dưới lên `.m-nk-ct`, cùng nội dung như web.
- `src/styles/app.css`: thay 2 mục T689 bằng mục web và mục điện thoại T693.
- `src/modules/he-thong/huong-dan.ts`: tour Nhật ký bỏ bước Cần chú ý và bước ghi chú, gộp vào bước khung chi tiết.
- `tools/kiem_tra.py` đợt 11A: bấm thẻ ra `.m-nk-ct`, nút Đóng tắt bảng, gói Standard không có chữ Trạng thái.

## Đã kiểm

- `npm run typecheck`, `npm run build`: qua.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `kiem_tra_dot_11_a()`: phần Nhật ký qua. Còn lỗi cũ "Gói thuê bao: thiếu 4 thẻ gói dịch vụ dọc" (T690).
- Chụp màn web 1440px gói Pro: khớp bản vẽ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Gói Standard không có ghi sổ (`kieuGhiSoDv`), khoá sổ (10.1.6), duyệt (11.5 chỉ Pro), nên nhật ký gói này chỉ có Thêm mới, Sửa, Xoá, Đăng nhập và không hiện Trạng thái chứng từ.
