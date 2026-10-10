# Thanh toán ngay cho phiếu mua, bán còn nợ; cột hoá đơn, công nợ ở danh sách (T91, T92, T93)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `daXoa.ts`: `dsTtCon` (phiếu thu, chi lập sau còn chưa xoá, lưu ở `_dsTt` của phiếu gốc), `ttThamChieu` (gộp với phiếu trả ngay của T85), `soDaTra`, `ttTienTheoTra`. Phiếu mẫu Thanh toán một phần chưa có số liệu nên tạm coi đã trả 40% tổng tiền.
- `ChungTuForm.tsx`: phiếu mua, bán ở Chưa thanh toán có trên hàng Thanh toán số đã trả trên tổng, mã các phiếu đã lập (bấm mở được), nút Thanh toán ngay (bán: Thu tiền ngay) khi còn nợ; menu Tiện ích có cùng mục.
- Hộp `HopThanhToan`: Tiền mặt hoặc Chuyển khoản, quỹ (tiền mặt của chi nhánh hoặc tài khoản ngân hàng), ngày, số tiền mặc định là số còn nợ, không cho vượt, diễn giải. Lưu thì lập phiếu thu, chi bên Thu chi 2.1.1, chiều tiền như T85, ghi nhật ký cả hai phiếu.
- `VoucherScreen.tsx`: cột, bộ lọc trạng thái thanh toán tính theo `ttTienTheoTra`.
- `LocNangCao.tsx`, form: còn phiếu thu, chi lập sau thì chưa xoá được phiếu gốc.
- T92 `types.ts`: cột có cờ `an` là cột mặc định ẩn. `useCotDs` nhớ cột mặc định ẩn mà người dùng đã bật ở khoá `iacc-cot-hien:<màn>`, tách khỏi danh sách ẩn; nút Mặc định trong hộp Cột hiển thị ẩn lại.
- T92 `VoucherScreen.tsx`: danh sách mua, bán thêm cột Ký hiệu HĐ, Số hoá đơn, Ngày hoá đơn (trống khi chưa có hoá đơn), Hạn thanh toán, Đã trả hoặc Đã thu, Còn phải trả hoặc Còn phải thu (tính bằng `soDaTra`); lọc được theo số ở hai cột tiền.
- T93 `VoucherScreen.tsx`: `cotCong`, `congCot` cộng Tổng tiền, Tiền thuế và với mua, bán thêm Đã trả, Còn phải trả, cho dòng Tổng trang, Tổng cộng mọi trang và tổng khi gom nhóm.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Gói Plus, MH2610-0022 (4.778.550, chưa thanh toán): trả 2.000.000 tiền mặt sinh PC2610-0261, hàng Thanh toán ghi 2.000.000 / 4.778.550. Lần hai hộp tự điền 2.778.550, chọn chuyển khoản sinh UNC2610-0261; nút ẩn, danh sách ghi Đã thanh toán.
- Xoá hàng loạt MH2610-0022 bị chặn. Xoá UNC2610-0261 thì MH2610-0022 về Thanh toán một phần.
- Hoá đơn bán hàng chưa thu: hiện Đã thu 0 / 8.412.520 và nút Thu tiền ngay.
- T92: danh sách Mua hàng mở ra chưa có sáu cột mới (hộp Cột hiển thị ghi 10/16). Hiện tất cả: MH2610-0022 có ký hiệu 1C26TMM, số 0027159, hạn 06/11/2026, còn phải trả 4.778.550. Bấm Mặc định thì sáu cột ẩn lại.
- T93: bật Đã trả, Còn phải trả ở danh sách Mua hàng gói Plus, chi nhánh Nguyễn Trãi: dòng Tổng và Tổng cộng ghi 31.896.900 và 23.784.470, khớp cộng tay từng dòng, cộng lại bằng Tổng tiền 55.681.370, thẳng cột.

## Dở dang, việc tiếp theo

- Chưa có thanh toán nhiều phiếu một lần ở danh sách.

## Bẫy, quyết định mới

- Không.
