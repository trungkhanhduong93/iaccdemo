# Cảnh báo khi huỷ, đóng phiếu đang thêm mới (T125)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ChungTuForm.tsx`: phiếu đang thêm mới (`moi`) bấm Huỷ, nút X hoặc Esc thì mở `HopXacNhan` "Xác nhận đóng phiếu!", nội dung "Bạn chưa lưu phiếu. Bạn có chắc chắn muốn đóng phiếu này không?" (chữ theo mẫu PhuongXT gửi). Bấm "Xác nhận" thì đóng, "Bỏ qua" hoặc Esc thì ở lại. Phiếu đã lưu, đang xem hoặc đang sửa giữ như cũ.
- Áp dụng cho mọi phiếu dùng form chung (thu chi, mua, bán, kho...). Màn chọn chi nhánh trước khi lập phiếu chưa có nội dung nên không hỏi.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trên trình duyệt: phiếu mua hàng mới bấm Esc ra hộp hỏi, bấm Xác nhận thì về danh sách; phiếu kiểm kê mới bấm Huỷ ra hộp hỏi.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `../Present/tools/build_present`), chưa làm mới file Excel.

## Dở dang, việc tiếp theo

- Không. Form riêng ngoài form chung (vd thẻ chi phí phân bổ) chưa có cảnh báo này.

## Bẫy, quyết định mới

- Không.
