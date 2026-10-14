# Điện thoại đợt 11: màn tác vụ, quy trình, hệ thống, danh mục tài khoản, chi nhánh (T190, T210, T191, T187)

- Ngày: 14/10/2026
- Người: Trum, agent: Claude Code điều phối và kiểm; Anti B (Antigravity WSL) làm T190, T210; Anti A (Antigravity Windows) làm T191, T187
- Trạng thái cuối phiên: Xong

## Đã làm

- Kế hoạch phần còn lại: `docs/ke-hoach-mobile-dot-11.md`. Rà bằng `manMobile()` trên mọi màn: 54 màn còn ra `MChiMayTinh`, thêm 4 loại phiếu kho chưa lập được.
- T190 `MTacVu.tsx` (mới): một màn chung cho 23 màn `kind: 'tool'`, thêm Kiểm tra cuối kỳ 10.1.4, Khoá sổ 10.1.6. Có mô tả, cài đặt tham số, lần chạy gần đây, nút Thực hiện dính đáy.
- T210 `MQuyTrinh.tsx` (mới): sơ đồ quy trình 11 phân hệ thành danh sách bước dọc, số thứ tự trong vòng tròn, bấm bước mở màn, bước ngoài gói có khoá.
- T191 `MHeThong.tsx`, `MGoiThueBao.tsx` (mới): Người dùng, Vai trò và phân quyền, Nhật ký thao tác (dùng cho cả X2), Gói thuê bao, Thông tin đơn vị, Cấu hình kế toán.
- T187 `MTaiKhoan.tsx`, `MChiNhanh.tsx` (mới): cây tài khoản thu gọn theo cấp, ô tìm; danh sách chi nhánh dạng thẻ, đồng bộ POS, thêm từ FABi.
- File máy tính chỉ thêm `export`: `CuoiKy.tsx` (`KIEM`), `HeThong.tsx` (`VAI_TRO`, `CAU_HINH_NGUOI_DUNG`, `QUYEN`, `MAC_DINH`), `DanhMucChiNhanh.tsx` (`HopThemChiNhanh`).
- `manMobile.ts` có dòng mốc riêng cho Anti A, Anti B để hai bên thêm luật không đè nhau.
- `tools/kiem_tra.py`: `kiem_tra_dot_11_a`, `kiem_tra_dot_11_b`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `kiem_tra.py --nhanh`, `--dien-thoai` (cổng 5181): Không có lỗi.
- 35 màn tác vụ và quy trình mở ở điện thoại, không màn nào ra `MChiMayTinh`. Tìm "111" ở Danh mục tài khoản còn 7 trên 125 tài khoản.
- Xem 15 ảnh 390px của đợt 11.
- Chưa thử trên điện thoại thật.

## Dở dang, việc tiếp theo

- Đợt 12: T209 lập phiếu kho (Anti B); T186 Xuất bán POS, T188 Công thức, T189 Số dư ban đầu (Anti A).
- Nút Lưu ở Cấu hình kế toán nổi giữa màn, nội dung bên dưới lộ ra. Sửa ở T208.

## Bẫy, quyết định mới

- Bước kiểm do Anti B viết mở Tính khấu hao 7.1.3 ở gói Plus, nhưng TSCĐ chỉ có ở gói Pro nên màn hiện thẻ mời nâng cấp. Đổi địa chỉ `?goi=` thì phải `pg.reload()`, đổi hash không nạp lại phiên.
