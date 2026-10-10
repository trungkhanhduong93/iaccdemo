# Lọc kho, hàng hoá, cột kho ở danh sách mua, bán; nút Tuỳ chỉnh giao diện (T94, T95)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `VoucherScreen.tsx`: dòng mua, bán có thêm `_khoDs` (kho của phiếu) và `_maHang` (mã hàng trên dòng), lấy từ `_dong` hoặc dòng sinh như form. Gói dưới Pro: kho là kho đầu phiếu `_kho`, chưa có thì kho đầu tiên của chi nhánh. Gói Pro: kho từng dòng, dòng chưa có kho thì theo kho mặc định như form.
- Bộ lọc nâng cao thêm Kho, Hàng hoá (hiện tên hàng), lựa chọn lấy từ các phiếu của màn; đưa ra ngoài được ở Cấu hình tham số lọc.
- Danh sách mua hàng gói dưới Pro thêm cột Kho (hiện sẵn, sau Chi nhánh), lọc cột kiểu chọn.
- `LocNangCao.tsx` `sapXepCot`: cột mới chưa có trong thứ tự cột người dùng đã lưu thì đứng ngay sau cột đứng trước nó theo mặc định, không dồn xuống cuối.
- T95 `ChungTuForm.tsx`: khi xem phiếu, nút Tuỳ chỉnh giao diện ở thanh đáy ngay trước nút In; bỏ mục này khỏi menu Tiện ích. Khi đang sửa phiếu thanh đáy không có nút In nên cũng không có nút này.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Gói Plus, tất cả chi nhánh: cột Kho ghi đúng kho theo chi nhánh. Lọc Kho bếp Lê Lợi còn 7 phiếu, đều kho đó. Thêm Hàng hoá NVL003 Bánh phở tươi còn 2 phiếu, mở khung chi tiết cả hai đều có NVL003.
- Giả lập thứ tự cột đã lưu chưa có cột Kho: cột Kho vẫn đứng sau Chi nhánh. Gói Pro không có cột Kho.
- T95: phiếu mua gói Plus, thanh đáy có Tuỳ chỉnh giao diện, In, Tiện ích; menu Tiện ích còn Sao chép, Thanh toán ngay, Xuất Excel, Xoá chứng từ; bấm nút mở đúng panel.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
