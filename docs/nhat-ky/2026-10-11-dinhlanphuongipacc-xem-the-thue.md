# Xem thẻ trước khi sửa, phương pháp thuế ở Thông tin đơn vị (T150)

- Ngày: 11/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Danh sách thẻ chi phí: cột Số thẻ là link xanh (`ds-link-so` như danh sách thu chi), bấm mở thẻ. Tuỳ chọn mới `dsChungTu.cotSo` (`types.ts`, `CatalogScreen.tsx`); sửa lại chú thích đặt nhầm chỗ của `tich`, `dsChungTu` trong `types.ts`.
- Form toàn màn hình (`CatalogPanel` trong `CatalogScreen.tsx`): mở dòng có sẵn ở chế độ xem. Đầu form tên thẻ, giữa "Chi tiết thẻ chi phí phân bổ <số>"; ô nhập khoá bằng `fieldset disabled` (lớp `pn-fs`, nền xám), ẩn Thêm dòng, Xoá hết, xoá dòng; chân form Sửa (Ctrl+E), Đóng (Esc). Huỷ khi đang sửa thì về xem, bỏ thay đổi. Thêm mới vẫn vào thẳng chế độ nhập.
- Thông tin đơn vị (`HeThong.tsx`, màn của PhuongXT T145): phương pháp thuế lên khối Thông tin kê khai, sau Loại hình (hộ kinh doanh sau Nhóm doanh thu).
  - Hộ kinh doanh: GTGT chỉ trực tiếp (% doanh thu), khoá; TNCN nhóm 1 theo doanh thu, nhóm 2 chọn, nhóm 3, 4 theo lợi nhuận tính thuế.
  - Doanh nghiệp: GTGT chọn trực tiếp hoặc khấu trừ; TNDN chọn theo doanh thu hoặc theo lợi nhuận tính thuế. GTGT khấu trừ thì TNDN chỉ theo lợi nhuận, khoá. Gói Plus, Pro: GTGT khấu trừ, TNDN theo lợi nhuận, cả hai khoá.
  - Phương pháp thuế ghi khi bấm Lưu (trước đây ô TT58 ghi ngay). Khối Chế độ kế toán bỏ ô thuế, doanh nghiệp TT58 giữ dòng mô tả bộ sổ.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` (228 lượt mở màn).
- `kiem_van.py --loai giao-dien` HeThong.tsx, ccdc/index.ts: sạch.
- Bấm thử: số thẻ mở thẻ; xem, Ctrl+E sửa, Huỷ về xem; Thông tin đơn vị hộ kinh doanh nhóm 1, 2, doanh nghiệp gói Free (đổi GTGT sang khấu trừ thì TNDN khoá), gói Plus. Không bấm Lưu khi thử.

## Dở dang, việc tiếp theo

- Form thẻ chưa có nút Trước / Sau như phiếu chi.
- Phương pháp thuế GTGT, TNDN của doanh nghiệp đang lưu chung ở phiên (`ppGtgt`, `ppTndn`), chưa theo từng đơn vị.

## Bẫy, quyết định mới

- Bẫy: bọc khối bằng `fieldset` (dù `display: contents`) làm hỏng các luật CSS dùng `>` con trực tiếp; đã thêm nhánh `> .pn-fs >` cho các luật bố cục form thẻ.
- Không ghi `docs/QUYET-DINH.md`; quy tắc phương pháp thuế theo loại hình, nhóm, gói do dinhlanphuongipacc chốt, chờ Trum xem để ghi QD.
