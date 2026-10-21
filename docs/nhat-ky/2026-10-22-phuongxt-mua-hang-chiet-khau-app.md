# Phiếu mua điện thoại: bỏ mặc định nhận kèm hoá đơn, đổi Giảm giá thành Chiết khấu (T614)

- Ngày: 22/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MLapPhieu.tsx`: phiếu mua thêm mới mặc định tắt Nhận kèm hoá đơn; phiếu đã có số hoá đơn (`_soHd` hoặc `soHd` dữ liệu mẫu) vẫn bật.
- `MLapPhieu.tsx`: thẻ mặt hàng phiếu mua (`TheHangMua`) ghi Chiết khấu thay Giảm giá, kể cả nhãn đọc màn hình; ô áp chung ghi Chiết khấu; khối tổng ghi Tiền chiết khấu.
- `MXemPhieu.tsx`: màn xem phiếu mua, từng mặt hàng và khối tổng ghi Tiền chiết khấu.
- Phiếu bán, phiếu khác (`TheHangMoi`) giữ chữ Giảm giá.
- Cùng commit có sửa T556 PhuongXT làm từ trước: `MChon.tsx` bảng chọn có ô tìm giữ chiều cao, báo Không tìm thấy kết quả phù hợp; mục T556 trong `app.css`.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho `MLapPhieu.tsx`, `MXemPhieu.tsx`, `MChon.tsx`: 0 ĐỎ.
- `python tools/xuat_bao_cao_he_thong.py`: không chạy được trên máy này, thiếu thư mục `Present/tools` ngoài repo (`build_present`). File `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx` chưa làm mới.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
