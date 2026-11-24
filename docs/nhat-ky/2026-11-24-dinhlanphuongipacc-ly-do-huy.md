# Lý do huỷ trên phiếu xuất huỷ (T914)

- Ngày: 24/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: phiếu xuất huỷ (5.1.2-3) đầu phiếu hàng 1 Kho xuất, Lý do huỷ; hàng 2 Người thực hiện, Ghi chú mỗi ô nửa hàng.
- Lý do huỷ lấy từ `LY_DO` có Dùng cho Xuất kho, mặc định lý do đầu (Xuất huỷ hàng hỏng), bắt buộc khi lưu, lưu vào `_lyDo`.
- Người thực hiện ở xuất huỷ là ô gõ chữ tự do, không chọn từ danh mục nhân viên, vẫn lưu `_nhanVien`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi. Một lần chạy báo hết giờ ở tour điện thoại Kiểm kê, chạy lại thì sạch.
- `python tools/kiem_van.py ChungTuForm.tsx`: 0 ĐỎ.
- Mở phiếu XH2610-0259 trên trình duyệt, xem và sửa đều đúng bố cục.
- Chưa chạy được `tools/xuat_bao_cao_he_thong.py`: máy thiếu `Present/tools/build_present.py`, file Excel báo cáo chưa làm mới.
- Chưa làm: bản điện thoại, mẫu in, cột danh sách Xuất huỷ chưa có Lý do huỷ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
