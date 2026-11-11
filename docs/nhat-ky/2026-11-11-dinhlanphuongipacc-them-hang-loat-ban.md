# Thêm hàng loạt ở chứng từ bán hàng, bắt buộc kho xuất (T790)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/BangHangBan.tsx`: nút Thêm hàng loạt cạnh Thêm dòng, mở hộp `ThemHangLoat` dùng chung với phiếu mua hàng; mỗi hàng tích thành một dòng `dongTuHang` (số lượng 1, giá bán, thuế suất theo danh mục).
- `src/ui/generic/ChungTuForm.tsx`: lưu phiếu mua, bán có kho ở đầu phiếu (`khoDau`) mà chưa chọn kho thì báo, không lưu. Trước đây ô có dấu * nhưng vẫn lưu được kho trống, mở xem lại thì ô Kho xuất trống.
- `ChungTuForm.tsx`: phiếu đã lưu với `_kho` rỗng thì lấy kho theo dòng hàng hoặc kho đầu của cửa hàng (`||` thay `??`).
- `ChungTuBanHang.tsx` `MAU_TAY`: thêm 6 chứng từ lập tay tháng 10 ở cuối mảng (id `tay-4` tới `tay-9`, id theo vị trí nên không chèn lên đầu). Đánh lại số BH2610-0001 tới 0009 theo thứ tự ngày. Phiếu mẫu có `_kho` là kho đầu của cửa hàng.
- `hddt.tsx` `HD_MAU`: `tay-6`, `tay-8`, `tay-9` đã xuất hoá đơn số 123, 122, 121 (nhỏ hơn 124 của `tay-0` vì ngày sớm hơn). `tay-4`, `tay-5`, `tay-7` chưa xuất.
- `ChungTuForm.tsx` cột hoá đơn (`ct-hd-dau`, nhánh `hdDienTu`): ô Email dưới Số hoá đơn, sửa thẳng `khachHd.email` nên khớp popup Thay đổi thông tin VAT. Người mua không lấy hoá đơn thì trống, khoá; hoá đơn đã xuất thì chỉ xem.
- `ChungTuBanHang.tsx` `hangTay`: giảm thuế GTGT tính từng dòng bằng `giamThueHang` như form, thay `giamThueHkd` một tỷ lệ cả phiếu. Hoá đơn mẫu (`hdMau`) ghi tiền trước thuế là doanh thu tính thuế, mẫu 2 ô giữa là giảm trừ thuế. Trước đây BH2610-0008 hiện hoá đơn 2.885.309, giảm trừ 0, lệch tổng thanh toán 2.886.745.
- Người dùng có hỏi đổi chỗ Mã số thuế, Người giao dịch, Kênh bán trên form bán hàng, sau đó bỏ, form giữ nguyên.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`
- Chưa xem bằng mắt trên trình duyệt: trình duyệt của agent không mở được trang dev.
- `tools/xuat_bao_cao_he_thong.py` vẫn lỗi thiếu module `build_present` trên máy này, chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
