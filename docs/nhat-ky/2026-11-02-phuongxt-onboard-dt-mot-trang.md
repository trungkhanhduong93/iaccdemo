# Màn mở từ FABi trên điện thoại gộp thành 1 trang (T138)

- Ngày: 02/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang (T138 còn việc khác, phần này xong)

## Đã làm

- `KhoiTaoFabi.tsx`, điện thoại: gộp 2 trang giới thiệu thành 1, bỏ chấm chuyển trang, vuốt, nút Tiếp, Quay lại, tiêu đề "Quán bạn được gì".
- Bỏ câu mô tả dưới tiêu đề và ảnh app trên điện thoại. Hàng cam kết điện thoại còn Miễn phí, Dữ liệu an toàn. Máy tính giữ nguyên.

## Đã kiểm

- typecheck, build, `kiem_tra.py --nhanh` không lỗi; `kiem_van.py` 0 ĐỎ (1 VÀNG câu nâng cấp Plus, Pro có sẵn từ trước).
- Xem bằng mắt ở khổ 375x812: vừa một màn, không phải cuộn.

## Dở dang, việc tiếp theo

- Không với phần này. CSS các trang cũ (`.ktf-b1-cham`, `.ktf-b1-tieu`, `.ktf-lui`) giờ không dùng ở màn này, chưa xoá.

## Bẫy, quyết định mới

- Không.
