# Quản lý kho trang chủ Free chia 3 khối (T304)

- Ngày: 16/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code. Làm ở máy HAN-IPOS381
- Trạng thái cuối phiên: Xong

## Đã làm

- `modules/home/khoFree.ts` (mới): số liệu ba khối. Gói Free công nợ không có hạn thanh toán, kiểm kê chỉ theo dõi số lượng (dinhlanphuongipacc chốt).
  - Mua hàng `soLieuMua`: tổng nhập gồm thuế GTGT, số đơn, số nhà cung cấp, so cùng kỳ tháng trước (tháng 10 có phiếu đến 07/10 thì so với 1–7/9), tỷ lệ trên doanh thu, 3 mặt hàng nhập nhiều tiền nhất (số lượng kèm ĐVT), nhập mua 6 tháng. Phiếu mua mẫu chỉ có tháng 9, 10 nên tháng 5–8 là số mẫu theo trung bình nhân hệ số, cột nhạt, rê chuột ghi "số mẫu".
  - Công nợ phải trả NCC `soLieuCongNo`: nợ cuối kỳ, số NCC còn nợ, mua chịu thêm trong tháng, đã trả, nợ cũ chưa trả (phần nợ đầu kỳ chưa trả hết trong tháng), 3 NCC nợ nhiều nhất, nợ cuối 6 tháng (số thật từ `rowsCongNo`).
  - Hao hụt kiểm kê `soLieuKiemKe`: so tồn sổ sách `tonHt` với tồn thực tế `tonTt` từng dòng phiếu kiểm kê 5.1.10 trong tháng; số mặt hàng thiếu, thừa, tỷ lệ lệch trên số mặt hàng đã kiểm, 3 mặt hàng thiếu nhiều nhất (số lượng, ĐVT, cửa hàng), cửa hàng chưa kiểm kê, số mặt hàng lệch theo cửa hàng. Không có số tiền.
- `home/BaBaiToanFree.tsx`: khối Quản lý kho thay 3 thẻ cũ bằng 3 khối ngang, mỗi khối: tiêu đề và link mở màn (Danh sách mua, Báo cáo công nợ 4.2.3, Báo cáo kiểm kê 5.2.15), câu hỏi, số lớn, dòng phụ, dòng kê, biểu đồ cột nhỏ `CotNho` (đo bề rộng thật bằng `KhungVua`). NCC nợ nhiều có nút Trả nợ mở phiếu chi lý do CHI02 Thanh toán công nợ nhà cung cấp (chưa điền sẵn NCC vì form chưa nhận tham số này). Bỏ import, biến cũ của khối kho.
- `app.css` mục T304 cuối file.
- Link tiêu đề khối Mua hàng đổi thành "Bảng kê theo hàng hoá ›": mở báo cáo 4.2.7 Bảng kê mua hàng theo hàng hoá, gom nhóm theo mã hàng, xem dạng Tổng hợp (ghi cấu hình báo cáo bằng `luuTuyChinh`, giữ cấu hình khác của người dùng), đúng tháng đang xem, không bật hộp lọc (`datLocDaXem`). Đường dẫn phải là `/app/bao-cao/4-2-7`: mở `/app/mua-hang/4-2-7` thì bị chuyển sang `/app/bao-cao/...` và mất kỳ đã đặt. Tổng tiền báo cáo tháng 10 (183.893.580 đ) khớp số lớn khối Mua hàng.
- `ui/bao-cao/tuyChinhBC.ts` (`bienDoiBang`, phần Tổng hợp của T289): gom một cấp thì giữ thêm các cột chữ có cùng giá trị trong mọi nhóm, nên gom theo Mã hàng hiện cả Tên hàng, ĐVT. Áp dụng cho mọi báo cáo xem Tổng hợp gom một cấp; cột khác nhau trong nhóm (ngày, số phiếu, NCC) vẫn bỏ như cũ.
- Danh sách "Nhập nhiều tiền nhất", "Thiếu nhiều nhất" ở trang chủ ghi mã hàng trước tên hàng (vd NVL001 Thịt bò thăn) theo quy định mã trước tên.
- Khối Hao hụt kiểm kê bỏ tỷ lệ %, ghi số lượng: "Thiếu 4 · thừa 2 · đã kiểm 8/12 mặt hàng" (số mặt hàng cần kiểm = danh mục nguyên vật liệu `NVL` nhân số cửa hàng đang xem).
- Nút tiện ích cuối khối: Mua hàng có "+ Tạo phiếu mua hàng" (`/app/mua-hang/4-1-1/moi`), Hao hụt kiểm kê có "+ Kiểm kê ngay" (`/app/kho/5-1-10/moi`), dồn đáy cho thẳng hàng.
- Tạm bỏ biểu đồ cột nhỏ dưới ba khối theo ý dinhlanphuongipacc; ba khối còn cao 306px. Giữ component `CotNho` và số `bieuDo` trong `khoFree.ts` để bật lại.
- Tiện ích Thanh toán ngay: báo cáo 4.2.3 Công nợ nhà cung cấp (`bao-cao/cong-no.tsx`) thêm cột Thanh toán, dòng còn nợ có nút Thanh toán ngay; popup Lịch sử công nợ NCC còn nợ cũng có nút này. Mở phiếu chi `?loai=chi&ly=CHI02&dt=<tên NCC>`. `ChungTuForm.tsx` thêm mới có `?dt=` thì điền sẵn đối tượng (một dòng). Nút Trả nợ ở trang chủ cũng truyền `dt`. Chưa điền sẵn số tiền nợ. Cột Thanh toán chỉ hiện trên màn hình: `Col` thêm cờ `chiManHinh` (`modules/types.ts`); `ToGiay.tsx` bỏ cột có cờ này khi xem trước, in, mẫu in; `ReportScreen.tsx` bỏ khi xuất Excel; `tuyChinhBC.ts` không đưa vào cột kèm của Tổng hợp. Đã thử bấm In: bản xem trước chỉ còn 8 cột từ # đến Nợ cuối kỳ.
- dinhlanphuongipacc thấy khối Mua hàng khó hiểu, viết lại: nhãn số lớn "Tổng nhập trong tháng", dòng phụ "22 phiếu nhập từ 7 nhà cung cấp", câu so sánh đủ nghĩa "▲ Tăng 69,3% so với cùng 7 ngày đầu tháng 9 (108,6 tr)", câu "Bằng 29,8% doanh thu tháng này", tiêu đề danh sách "Nhập nhiều tiền nhất" (mỗi mặt hàng một hàng kèm số lượng), biểu đồ có dòng phụ "T10 mới tính đến 07/10 · cột nhạt là số mẫu". Hai khối còn lại thêm tiêu đề danh sách "Nợ nhiều nhất", "Thiếu nhiều nhất". Tiêu đề ba khối to, rõ hơn: chữ 16px đậm, vạch màu bên trái theo màu biểu đồ khối (xanh dương, cam, đỏ san hô; lớp `bbt-kho-mua`, `bbt-kho-no`, `bbt-kho-hh`), gạch chân tách khỏi chi tiết.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Xem trên `npm run dev` gói Free 1460×900: ba khối cao bằng nhau, nút cuối khối thẳng hàng, không tràn ngang. Link Bảng kê theo hàng hoá mở 4.2.7 tháng 10, gom theo mã hàng, Tổng hợp, tổng 183.893.580 đ khớp trang chủ (tất cả cửa hàng). Thanh toán ngay mở phiếu chi đã điền NCC, lý do; bản xem trước in không còn cột Thanh toán.
- Chưa chạy `--dien-thoai` (việc chỉ sửa bản máy tính). Chưa làm mới file Excel báo cáo hệ thống: máy này thiếu thư mục `Present` cạnh repo.

## Dở dang, việc tiếp theo

- Không. Có thể làm sau: Thanh toán ngay điền sẵn số tiền nợ còn lại; bật lại biểu đồ cột nhỏ dưới ba khối nếu cần (`CotNho`, `bieuDo` còn giữ).

## Bẫy, quyết định mới

- Không.
