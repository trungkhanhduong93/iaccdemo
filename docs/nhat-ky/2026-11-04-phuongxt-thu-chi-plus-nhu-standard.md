# Màn thu chi gói Plus giống Standard, thêm tab Đính kèm (T733)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong (trừ màn lập phiếu điện thoại, tách thành T734)

## Đã làm

- `src/app/plan.ts`: thêm `tcNhuStandard(goi)` (gói Standard hoặc Plus). `kieuGhiSoDv(s, modKey)` nhận thêm phân hệ: Plus ở phân hệ `tien` trả `'khong'`, không ghi sổ như Standard. Phân hệ khác của Plus giữ nguyên.
- `src/ui/generic/ChungTuForm.tsx`: phiếu thu chi gói Plus chọn lý do, đối tượng ở đầu phiếu (bảng chi tiết bỏ hai cột này), có chi trả nợ nhà cung cấp, có ô Tháng tính chi phí, không có nút Ghi sổ. Tab vẫn có Đính kèm.
- `src/ui/generic/VoucherScreen.tsx`: danh sách thu chi gói Plus không còn trạng thái ghi sổ.
- `src/ui/mobile/MChungTu.tsx`, `MDtThuChiDs.tsx`: danh sách thu chi điện thoại gói Plus có tab Tất cả, Tiền mặt, Ngân hàng, Chuyển quỹ như Standard, không ghi sổ.
- `src/ui/mobile/MDtThuChiXem.tsx`: xem phiếu thu chi điện thoại gói Plus bỏ khối bút toán, giữ tab Đính kèm.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Mở trên máy `#/app/tien/2-1-1/moi?loai=chi&goi=PL`: có Tháng tính chi phí, tab Chi tiết, Đính kèm, Lịch sử, bảng chỉ còn Diễn giải, Thành tiền, không có Ghi sổ.
- Chưa mở thử màn điện thoại bằng trình duyệt, chỉ kiểm qua `kiem_tra.py`.

## Dở dang, việc tiếp theo

- T734: `src/ui/mobile/MDtThuChiLap.tsx` (lập phiếu thu chi điện thoại) đang trong T552 của Trum nên chưa sửa. Gói Plus ở màn này còn lưu phiếu dạng nháp (dòng `tt: row?.tt ?? (s.goi === 'S' ? 'ghi' : 'nhap')`), còn khối hạch toán và gán `tkNo`, `tkCo`, chưa có chi trả nợ nhà cung cấp (`traNoMode`). Hỏi Trum rồi đổi các điều kiện `s.goi === 'S'` / `!== 'S'` sang `tcNhuStandard(s.goi)`; nút mở rộng dòng (dòng gần `m-tc-lap-mo-rong`) xem lại có giữ cho Plus không.

## Bẫy, quyết định mới

- Không. Quyết định "thu chi Plus như Standard" do PhuongXT chốt, ghi ở chú thích `tcNhuStandard` trong `plan.ts`.
