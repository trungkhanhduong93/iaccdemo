# Gói Free gọn theo hộ kinh doanh, đổi tên phân hệ, Xuất bán POS (T52)

- Ngày: 09/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `plan.ts` (`THEO_ROADMAP`): gói Free bỏ 5.2.4 Tồn kho tức thời; mở 4.1.1 Mua hàng. `BO_SUNG`: 3.2.5, 5.2.8, 10.4.1 bỏ gói Free; thêm 3.1.7 Bán hàng (Plus, Pro) chèn sau 3.1.1 và 4.2.3 Sổ công nợ nhà cung cấp (mọi gói) chèn sau 4.2.2.
- `registry.ts`: `AN_PHAN_HE` ẩn phân hệ Tổng hợp ở gói Free, Báo cáo kết quả kinh doanh 10.2.3 vẫn xem ở phân hệ Báo cáo. Thứ tự phân hệ: Kê khai thuế sau Công cụ dụng cụ, Danh mục trước Hệ thống; `Shell.tsx` đặt đường kẻ trước Danh mục.
- Đổi tên: Kế toán tiền thành Thu chi (sơ đồ "Nghiệp vụ thu chi"), Thuế GTGT thành Kê khai thuế, Công cụ dụng cụ thành Chi phí phân bổ (`index.ts` từng phân hệ, `SidebarFlyout.tsx`).
- Bán hàng: tab 3.1.1 tên Xuất bán POS, bỏ Thêm mới, chỉ nút Tải từ FABi, đường dẫn `/moi` quay về danh sách; ô sơ đồ đổi theo. Tab Bán hàng 3.1.7 dùng `NGOAI_POS` (lập tay, 80 phiếu mẫu).
- Mua hàng: màn 4.2.3 Sổ công nợ nhà cung cấp (sổ tổng hợp theo nhà cung cấp, theo chi nhánh).
- `ChungTuForm.tsx`: gói Free không có tab Đính kèm.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py` bản đầy đủ 4 gói: 701 lượt mở màn, gói Free 43 màn không màn nào khoá, `Không có lỗi.`
- `python tools/kiem_van.py` các file có chữ đã sửa: sạch.
- Playwright: thanh bên trái gói Free và Plus; tab Bán hàng gói Free, Standard, Plus; phân hệ Báo cáo gói Free.

## Dở dang, việc tiếp theo

- Không.
- Trum cập nhật Excel tính năng theo QD35 (các dòng T52 trong `THEO_ROADMAP`, `BO_SUNG`), chạy lại `tools/xuat_tinh_nang.py` rồi xoá các dòng đó.
- Gói Free không còn cách ghi doanh thu bán ngoài POS (Bán hàng 3.1.7 và Hoá đơn bán hàng từ gói Plus); PhuongXT chưa chốt có cần không.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD35.
- Danh sách chứng từ mẫu 26 phiếu trải từ đầu tháng 9 nên lọc tháng 10 cộng một chi nhánh có thể trống; màn mới nên đặt `soPhieu: 80`.
