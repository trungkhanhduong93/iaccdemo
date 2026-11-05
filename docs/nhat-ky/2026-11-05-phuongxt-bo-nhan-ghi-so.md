# Bỏ nhãn trạng thái ghi sổ ở đầu form chứng từ (T744)

- Ngày: 05/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/ChungTuForm.tsx`: khối `meta` ở đầu form bỏ nhãn Chưa ghi sổ, Đã ghi sổ, Lỗi hạch toán ở mọi phiếu, mọi gói. Bỏ import `TT_CT` không còn dùng. Vẫn giữ nhãn nguồn, cửa hàng, Đã khoá sổ, trạng thái xuất nhập của phiếu sản xuất.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở phiếu Xuất huỷ gói Plus bằng Playwright: không còn chữ ghi sổ ở đầu form, nguồn và cửa hàng vẫn hiện.

## Dở dang, việc tiếp theo

- Form Xuất bán POS (`ChungTuBanHang.tsx`) còn nhãn Đã đồng bộ (T613), là trạng thái đồng bộ FABi nên chưa bỏ. Cần bỏ thì làm việc mới.
- Điện thoại `MXemPhieu.tsx` vẫn có chip trạng thái, file đang trong T497, T498 của Trum.
- Cột Trạng thái ở danh sách chứng từ vẫn giữ.

## Bẫy, quyết định mới

- Không.
