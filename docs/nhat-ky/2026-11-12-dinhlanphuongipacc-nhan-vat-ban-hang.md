# Nhãn VAT, cột Thao tác danh sách Bán hàng (T802)

- Ngày: 12/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: bỏ cột Trạng thái xuất HĐĐT (`ttPh`).
- Số chứng từ có nhãn VAT khi dòng có hoá đơn; cột Số hoá đơn thành link mở `HopXemHd`.
- Dòng Xuất bán POS lấy hoá đơn FABi từ `donPosCua(x).hoaDon` (hàm `hdFabi`), giữ ở `_hdPos` chứ không ở `_hd`, để menu Hoá đơn điện tử, tờ khai không đếm. Hàm `hdDong` gộp `_hd` và `_hdPos`.
- Tab Bán hàng thêm cột Thao tác (menu ⋯ như màn Hoá đơn điện tử): Xuất HĐĐT cho chứng từ bán hàng chưa xuất, Xem hoá đơn. Tích chọn rồi bấm Xuất HĐĐT trên thanh công cụ giữ như cũ.
- Số chứng từ Xuất bán POS ở danh sách chỉ hiện 5 ký tự cuối, có `...` đứng trước, rê chuột xem đủ.
- `src/styles/app.css`: mục cuối T802, class `.ds-so-vat`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa xem bằng mắt: trình duyệt trong app không mở được trang trên máy.

## Dở dang, việc tiếp theo

- Không. Form chi tiết chứng từ POS vẫn hiện đủ số chứng từ 12 ký tự, chưa rút gọn.

## Bẫy, quyết định mới

- Không. Lưu ý: hoá đơn FABi ở danh sách Bán hàng nằm ở `_hdPos`, không dùng `hdCua` cho dòng POS.
