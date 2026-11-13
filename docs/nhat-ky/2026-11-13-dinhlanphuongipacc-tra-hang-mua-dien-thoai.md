# Trả hàng ở phiếu mua trên điện thoại (T819)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MXemPhieu.tsx`: menu ba chấm của phiếu mua dòng NVL (không phải phiếu trả lại, gói mở được màn 4.1.4) có Trả hàng. Bấm dựng `TraTu` như web (`moTraHang` ở `ChungTuForm.tsx`), mỗi dòng `slMax` bằng số lượng đã mua, mở `/app/mua-hang/4-1-4/moi` kèm `state.traTu`. Đang xem Tất cả cửa hàng thì đặt luôn cửa hàng của phiếu mua để khỏi hỏi chọn cửa hàng. Dòng Tham chiếu thêm các phiếu trả lại (`dsTraCon`).
- `src/ui/mobile/MLapPhieu.tsx`: đọc `state.traTu`, dựng `gocTra` làm dữ liệu gốc (nhà cung cấp, MST, địa chỉ, kho, dòng hàng, ghi chú "Trả lại hàng mua theo ..."), không chép hoá đơn. `chiSl` (lập từ phiếu mua, hoặc sửa phiếu có `_traTuMua`): ẩn Thêm dòng, thẻ hàng `TheHangMua` chỉ còn ô số lượng (tự hạ về `slMax`), dòng "Đã mua ...", đơn giá và tổng chỉ xem, nút xoá. Lưu kiểm số lượng > 0 và không quá `slMax`, ghi `_thamChieu`, `_thamChieuDi`, `_traTuMua`, thêm phiếu vào `_dsTra` của phiếu mua. Tiêu đề "Lập phiếu trả lại hàng mua".
- `src/ui/generic/ChungTuForm.tsx`: export `TraTu`.
- `src/styles/app.css`: mục T819 cuối file, class `.m-t601-tra-max`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Script Playwright tạm (390x844, gói Plus): mở phiếu mua đầu ở `mua-hang/4-1-1`, menu có Trả hàng, lập phiếu điền sẵn 3 dòng, không có nút Thêm dòng, gõ 99999 tự về 12 (số đã mua), lưu ra TLN2610-0261, phiếu mua hiện TLN2610-0261 ở Tham chiếu. Không có lỗi trang.
- Chưa thử gói Pro, chưa thử sửa lại phiếu trả lại đã lưu.

## Dở dang, việc tiếp theo

- Không.
- Phiếu trả lại trên điện thoại vẫn có ô Đã thanh toán; chọn thì lưu ra phiếu chi "Chi tiền mua hàng" như phiếu mua (có từ trước T819). Trả lại hàng mua đúng ra là thu tiền nhà cung cấp, cần hỏi Trum.
- Nhãn "Kho nhập" ở phiếu trả lại chưa đổi.
- Số lượng tối đa chưa trừ số đã trả ở các phiếu trả lại trước (như web T815, T816).
- `MXemPhieu.tsx`, `MLapPhieu.tsx` Trum đang giữ ở T497, T498, T552.
- `python tools/xuat_bao_cao_he_thong.py` chưa chạy được (thiếu `build_present`, như các phiên trước).

## Bẫy, quyết định mới

- Không.
