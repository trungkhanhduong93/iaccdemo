# Giao diện sơ đồ Quy trình hội tụ (T38)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code điều phối, worker Claude (opus, effort high) sửa code qua 2 lượt
- Trạng thái cuối phiên: Xong

## Đã làm

- Trum chọn hướng A "Làn gọn + dòng chảy", chỉ áp cho sơ đồ hội tụ. Logic sơ đồ giữ nguyên.
- `QuyTrinhScreen.tsx`, `SoDoHoiTu`:
  - Mỗi làn là một hàng cao 56px. Nhãn làn có ô biểu tượng theo màu của làn.
  - Nút nghiệp vụ dùng component mới `NutNgang`, biểu tượng nằm cạnh chữ, logic khoá theo gói như `ONut`.
  - Khối Sổ sách rộng 260px, nền chuyển màu nhạt.
- Lượt 2, theo nhận xét của Trum (đường nối mảnh, không liền, không đều):
  - Toàn bộ đường nối vẽ trong một `<svg class="qt-ht-svg">`, đo vị trí thật bằng `getBoundingClientRect`, đo lại bằng `ResizeObserver`.
  - Nét 2px màu `#b8c7da`. Làn đầu và làn cuối bo góc 10px vào trục, làn giữa nối chữ T. Mũi tên đặc 8x10px.
- `types.ts`: `LanQT` có thêm `tone?` để đặt màu cho làn. `tien/quy-trinh.ts`: điền màu 5 làn, Sổ quỹ tiền mặt đổi biểu tượng sang `wallet`.
- `app.css`: viết lại các rule `.qt-ht*`, bỏ `.qt-lan-noi` và phần vẽ đường bằng CSS cũ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`
- Chụp ở tỉ lệ 2x cho gói A, M, S, F (1440x900) và gói A (1366x768). Nét đều, không khe, góc bo đều.
- Sơ đồ trục ngang của Danh mục và Bán hàng chụp trước và sau khớp nhau.

## Dở dang, việc tiếp theo

- Không.
- Nhãn làn rộng 200px để "Phân bổ chi phí chuỗi" không bị cắt. Lưới sơ đồ tối thiểu 920px, hẹp hơn thì cuộn ngang trong khung.

## Bẫy, quyết định mới

- Không.
