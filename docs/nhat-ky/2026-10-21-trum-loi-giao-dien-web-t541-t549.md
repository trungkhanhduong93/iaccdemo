# Lỗi giao diện web gom từ Trum (T541–T549)

- Ngày: 21/10/2026
- Người: Trum, agent: Claude Code điều phối, 2 Antigravity Windows làm code
- Trạng thái cuối phiên: Xong

## Đã làm

- T541: ô Thời gian trong Bộ lọc nâng cao bỏ đè chữ: tay kéo lùi ra ngoài ô, chữ ngày 12px. Mục cuối `app.css` (T541).
- T542: menu Thêm theo loại đổi `cashin`, `cashout` sang `download`, `upload` bằng bảng `ICON_NET_MENU` trong `CongCuDs.tsx`. Khai báo loại ở `src/modules/tien/index.ts` giữ nguyên.
- T543: cột Số chứng từ Xuất bán POS vẽ nút `ds-link-so`, bấm mở `<đường màn>/<id>` (`ChungTuBanHang.tsx`).
- T544: `NutExcel`, `NutXuatExcel` mặc định `IconFigmaSheet`, xoá `LogoExcel` (`CongCuDs.tsx`); `NutTuyChinhCot` mặc định `IconFigmaSliders` (`LocNangCao.tsx`).
- T545: phần web hộp Chọn cửa hàng dùng khung `ds-hop ds-hop-nho` (`ChonCuaHangTruoc.tsx`). Phần điện thoại giữ nguyên.
- T546: nút chọn kiểu chiết khấu ghi "%", "đ" (`ApDauBang.tsx`); ô nhập hai kiểu cùng rộng 130px, chữ đơn vị rộng 16px. Mục cuối `app.css` (T546).
- T547: ô ĐVT trong `BangSua.tsx` thành `Select`: ĐVT chính của mã hàng và ĐVT quy đổi lấy qua `quyDoiTuDanhMuc`. Đổi ĐVT không đổi số lượng, đơn giá. Dòng chưa có mã hàng khoá ô, hiện "—".
- T548: nền hàng tiêu đề, hàng Tổng cộng bảng `.fsf` đổi `#eef1f5`, viết đè ở mục cuối `app.css` (T548). Biến `--hdb-chan` giữ nguyên.
- T549: huy hiệu số nút phễu nằm góc trên phải (mục cuối `app.css`, T549). Màn danh mục chỉ tính Trạng thái là đang lọc khi khác `hd` (`CatalogScreen.tsx`).

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, chỉ có cảnh báo cỡ gói như cũ.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Anti tự chụp màn hình từng việc. Anti đo toạ độ chữ Chiết khấu trước và sau khi đổi kiểu, hai lần bằng nhau.

## Dở dang, việc tiếp theo

- Không. Phần điện thoại của ô ĐVT để ở T550, làm sau T539 vì T539 đang giữ `MLapPhieu.tsx`, `MLapPhieuKho.tsx`.
- Hộp Chọn cửa hàng còn vài `style` viết thẳng trong JSX. Các lớp `ccht-*` của phần web giờ không dùng nữa. Dọn khi có việc đụng lại file này.

## Bẫy, quyết định mới

- Không.
