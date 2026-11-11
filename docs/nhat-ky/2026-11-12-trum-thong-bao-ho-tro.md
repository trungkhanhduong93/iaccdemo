# Thông báo, hỗ trợ, ngôn ngữ ở thanh trên và điện thoại (T803)

- Ngày: 12/11/2026
- Người: Trum, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Dựng theo bản thiết kế "Thông báo IACC Cloud" của Trum: https://claude.ai/artifact/WKJMseeaoH53WMsf6r38tp (11 khung: 6 web, 5 điện thoại).
- `src/app/thong-bao/data.ts`: 13 thông báo mẫu, 3 thẻ, 6 loại, 13 loại bật tắt được, kho dùng chung lưu ở localStorage khoá `iacc-thong-bao` (đã đọc, cài đặt, ngôn ngữ).
- `src/app/thong-bao/chung.tsx`: mảnh dùng chung cho web và điện thoại: dòng thông báo, công tắc, thanh phân đoạn, cờ tròn, mã QR mẫu, khung hộp thoại.
- `src/app/thong-bao/ThanhTren.tsx`: cụm nút Hỗ trợ, tải ứng dụng, ngôn ngữ, chuông; khung thông báo; hộp Cài đặt thông báo, Góp ý, Mã hỗ trợ, Phím tắt. Phím `?` mở bảng phím tắt khi không đứng trong ô nhập.
- `src/app/thong-bao/TatCaThongBao.tsx`: trang `/app/thong-bao` trên web.
- `src/ui/mobile/MThongBao.tsx`: màn Thông báo, màn Cài đặt thông báo (`/app/thong-bao/cai-dat`), tấm trượt Góp ý, Mã hỗ trợ, nút đổi ngôn ngữ.
- `src/app/Topbar.tsx`: thay nút chuông cũ (mở Cảnh báo số liệu 11.6, ẩn ở gói Standard) bằng cụm nút mới, mọi gói đều có.
- `src/App.tsx`: thêm 2 đường dẫn. `src/ui/mobile/MobileShell.tsx`: tiêu đề, ẩn thanh dưới, ẩn chip cửa hàng cho 2 màn mới.
- `src/ui/mobile/MKhac.tsx`: thêm dòng Cài đặt thông báo ở Thiết lập, nhóm Hỗ trợ, nút ngôn ngữ ở chân màn.
- `src/ui/mobile/MTrangChu.tsx`, `MTrangChuStandard.tsx`: nút chuông mở màn Thông báo (trước đó bấm không có gì).
- `src/ui/BangPhimTat.tsx`: xuất hằng `PHIM` để hộp Phím tắt mới dùng chung danh sách.
- `src/styles/app.css`: mục cuối "Thông báo, hỗ trợ, ngôn ngữ ở thanh trên và điện thoại (T803)".

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`
- Script Playwright riêng (không đưa vào repo), 28 ca ở 1280, 1440 và điện thoại 390x844: thanh trên không tràn, không đè; chuông hiện 5 chưa đọc, bấm một dòng còn 4; hộp Cài đặt có 14 công tắc, Esc đóng hộp rồi quay lại khung thông báo; menu Hỗ trợ 4 mục; nút Gửi góp ý khoá khi chưa điền; mã hỗ trợ 7 ký tự; phím `?` mở 9 dòng phím tắt; trang Xem tất cả 11 dòng, không tràn ngang; điện thoại không tràn ngang, tấm trượt sát đáy, menu ngôn ngữ nằm trong màn; không lỗi console. Tất cả đạt.
- `python tools/kiem_van.py` cho 6 file có chữ giao diện: 0 ĐỎ. Mục VÀNG là đường vẽ SVG và câu thông báo mẫu lấy nguyên từ bản thiết kế.
- Chưa xem bằng mắt, chưa chụp màn hình. Trum nên mở bản online so với bản thiết kế.
- Chưa chạy bộ soát `pre-push-qa`.

## Dở dang, việc tiếp theo

- Không.
- Việc có thể làm sau nếu Trum muốn: đổi ngôn ngữ mới lưu lựa chọn, chưa dịch giao diện; góp ý và mã hỗ trợ chưa gửi đi đâu vì chưa có backend; link Tài liệu đang trỏ `https://docs.gitbook.com`, đổi ở hằng `LINK_TAI_LIEU` trong `data.ts` khi có trang thật; bản thiết kế có dòng "Phiên bản 2.14.0" ở chân màn Khác, chưa đưa vào vì repo chưa có số phiên bản thật; số trên chuông trang chủ điện thoại gói Pro vẫn đếm việc theo dõi, chưa đếm thông báo chưa đọc.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD108.
- Bẫy khi đo bằng script: ở bề rộng 1280 app thu nhỏ 0,83 lần (`heSoZoom`), `getBoundingClientRect` trả số đã nhân hệ số. Khung rộng 420 đo ra 349 là đúng.
