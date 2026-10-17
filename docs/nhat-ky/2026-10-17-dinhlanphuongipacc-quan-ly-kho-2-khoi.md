# Quản lý kho trang chủ Free gộp còn 2 khối (T307)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code. Làm ở máy HAN-IPOS381
- Trạng thái cuối phiên: Xong

## Đã làm

- Thử bố cục gộp thay 3 khối của T304: hàng dưới còn 2 cột thẳng với Quản lý lãi lỗ, Quỹ tiền (mỗi khối là một `section.bbt-cot` trong lưới `bbt-e-luoi-2`, bỏ khung chung "Quản lý kho"). Tiêu đề in hoa như hàng trên.
- `home/BaBaiToanFree.tsx`:
  - MUA HÀNG & CÔNG NỢ NCC: link Bảng kê hàng hoá (4.2.7 gom mã hàng, Tổng hợp), Báo cáo công nợ (4.2.3); hai số lớn cạnh nhau Tổng nhập trong tháng, Còn nợ nhà cung cấp; câu so cùng kỳ và tỷ lệ trên doanh thu; dòng chảy Nợ đầu kỳ + Mua nợ − Trả hàng, đã thanh toán = Nợ cuối kỳ (khớp dòng Tổng cộng báo cáo 4.2.3), nợ cũ chưa trả; hai danh sách cạnh nhau Nhập nhiều tiền nhất (mã trước tên), Nợ nhiều nhất (nút Trả nợ); nút Tạo phiếu mua hàng, Thanh toán NCC.
  - HAO HỤT KIỂM KÊ: số mặt hàng lệch, thiếu, thừa, đã kiểm n/n; Tiến độ kiểm kê theo cửa hàng (thanh tiến độ, số đã kiểm/12, lệch hoặc chưa kiểm kê); hai danh sách Thiếu nhiều nhất, Thừa nhiều nhất; nút Kiểm kê ngay.
- `home/khoFree.ts`: công nợ thêm `dau`, `traHang`, `thanhToan`, `cuoiRong` (cộng cả NCC trả trước, số âm), `soNccTraTruoc`; kiểm kê thêm `theoCn` (số đã kiểm từng cửa hàng), `topThua`.
- dinhlanphuongipacc thấy nhiều chữ, rút gọn: link tiêu đề còn Bảng kê, Công nợ, Báo cáo; nhãn số lớn Tổng nhập tháng, Còn nợ NCC, Mặt hàng lệch tháng này; so cùng kỳ gộp vào dòng phụ "22 phiếu · ▲ 69,3% cùng kỳ" (rê chuột xem chi tiết); bỏ câu tỷ lệ trên doanh thu, dòng nợ cũ, chú thích trả hàng; dòng chảy còn Nợ đầu kỳ, + Mua nợ, − Đã trả, = Nợ cuối kỳ; danh sách bỏ số lượng, tên cửa hàng (rê chuột xem cửa hàng); tiến độ kiểm kê ghi tên cửa hàng ngắn, "chưa kiểm". Hai khối còn cao 406px (trước 465px). Bỏ nút Trả nợ từng dòng ở danh sách Nợ nhiều nhất, trả nợ dùng nút Thanh toán NCC cuối khối hoặc Thanh toán ngay ở báo cáo công nợ.
- dinhlanphuongipacc thấy Mua nợ (387 tr) lớn hơn Tổng nhập (183,9 tr), vô lý. Nguyên nhân: báo cáo 4.2.3 Công nợ NCC tự sinh số mua hàng ngẫu nhiên, không đọc phiếu mua. Sửa `bao-cao/cong-no.tsx` (của T185): với NCC, tháng có phiếu mua mẫu (9, 10) thì Tiền mua hàng lấy đúng tổng tiền (gồm thuế) các phiếu mua 4.1.1 của NCC đó, theo cửa hàng (`phieuMuaNcc`, khớp theo `maDt`); phiếu mẫu còn lại chỉ là trả hàng, thanh toán, tổng không vượt số đang nợ, ngày không quá ngày phiếu mua cuối. Tháng chưa có phiếu mua mẫu giữ cách sinh cũ. Công nợ khách hàng 3.2.9 không đổi. Kết quả: tháng 10 mua nợ = tổng nhập 183.893.580 đ, tháng 9 = 456.351.580 đ, từng cửa hàng cũng khớp; không còn NCC số âm; popup Lịch sử công nợ hiện số phiếu mua thật (MH2609-0003...).
- Còn lệch có từ trước: nợ đầu kỳ tháng sau không bằng nợ cuối kỳ tháng trước (mỗi tháng sinh nợ đầu kỳ riêng), vd đầu tháng 10 196,6 tr, cuối tháng 9 316,2 tr. Chưa sửa.
- `app.css` mục T307 cuối file. `tools/kiem_tra.py` bài T293 web đổi thành kiểm 2 khối `.bbt-kho2`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Xem trên `npm run dev` gói Free 1460×900: hai khối trùng mép, bề rộng hai cột trên, cao bằng nhau 406px. Đối chiếu số: tháng 10, 9 và từng cửa hàng, mua nợ trong báo cáo 4.2.3 bằng tổng nhập trang chủ; không NCC nào số âm.
- Chưa chạy `--dien-thoai` (chỉ sửa bản máy tính). Chưa làm mới file Excel báo cáo hệ thống: máy này thiếu thư mục `Present`.

## Dở dang, việc tiếp theo

- Không. Có thể làm sau: nợ đầu kỳ tháng sau bằng nợ cuối kỳ tháng trước ở báo cáo 4.2.3; dọn CSS bản 3 khối T304 không còn dùng (`bbt-kho-luoi`, `bbt-kho-khoi`, `bbt-kho-dau`, `bbt-kho-dong-gon`, `bbt-kho-cau`) và component `CotNho`; thêm chỉ tiêu số ngày trả nợ bình quân (DPO).

## Bẫy, quyết định mới

- Không.
