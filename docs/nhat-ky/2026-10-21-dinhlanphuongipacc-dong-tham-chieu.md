# Dòng Tham chiếu chung trên chi tiết chứng từ (T585)

- Ngày: 21/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ChungTuForm.tsx`: gom ba dòng tham chiếu riêng (Thẻ chi phí, Chứng từ xử lý chênh lệch, Theo phiếu kiểm kê) thành một dòng "Tham chiếu" cuối phần thông tin chung. Danh sách tính ở `dsThamChieu`: phiếu thu, chi của phiếu mua, bán (trả ngay `_ctTt`, trả sau `_dsTt`); thẻ chi phí của phiếu chi; phiếu điều chỉnh của kiểm kê; phiếu nhập của phiếu xuất sản xuất, xuất điều chuyển (`_phieuNhap`); phiếu gốc của phiếu sinh ra (`_thamChieu`, `_thamChieuDi`). Rê chuột lên số thấy loại chứng từ (và số tiền với phiếu trả sau).
- Phiếu nhập sản xuất, nhập điều chuyển không hiện dòng này vì đã có ô chọn phiếu tham chiếu ở đầu phiếu.
- Thanh Thanh toán của phiếu mua, bán bỏ số phiếu thu, chi (đã chuyển xuống dòng Tham chiếu), giữ "Đã trả x / y" và nút thanh toán.
- `app.css`: mục cuối "Dòng Tham chiếu chung trên chi tiết chứng từ (T585)", nhãn cột 112px như `.ct-ttc .f`, số chứng từ lùi 11px thẳng chữ trong ô.
- Bản mẫu duyệt trên artifact trước khi sửa, nhãn chung "Tham chiếu" theo người dùng chốt.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở PC2610-0261 gói PR: dòng "Tham chiếu TPB2610-0011" thẳng cột nhãn.
- Chưa mở thử từng loại kiểm kê, sản xuất, điều chuyển trên trình duyệt.

## Dở dang, việc tiếp theo

- Phiếu mua, bán mẫu đã thanh toán (vd MH2610-0004) chưa có phiếu chi, thu đi kèm trong dữ liệu giả nên chưa hiện dòng Tham chiếu. Ghi thành T586.

## Bẫy, quyết định mới

- Không.
