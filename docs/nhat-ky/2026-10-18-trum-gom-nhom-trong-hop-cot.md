# Gom nhóm chuyển vào hộp Cột hiển thị (T420)

- Ngày: 18/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/LocNangCao.tsx`: hộp Cột hiển thị bỏ đoạn giải thích. Thêm prop tuỳ chọn `gom` cho `NutTuyChinhCot`, `HopCot`. Dòng cột gom được có nút gom trước 2 nút đóng băng, đang gom hiện số cấp. Tối đa 5 cấp, quá thì báo "Gom nhóm tối đa 5 cấp". Gom áp khi bấm Xong. Tắt cột đang gom thì bỏ gom cột đó. Khôi phục mặc định xoá gom. Đang gom thì nút tuỳ chỉnh cột sáng.
- `src/ui/generic/VoucherScreen.tsx`: bỏ thanh Gom nhóm trên bảng. Danh sách cột gom được lấy từ mọi cột, trừ Ô chọn, STT, Số, Diễn giải, Tên hàng, Thuế, Tổng tiền.
- `src/styles/app.css`: mục cuối file "Gom nhóm trong hộp Cột hiển thị (T420)".
- Màn không truyền `gom` (bán hàng, danh mục, phiếu sản xuất, công thức) giữ hộp như cũ, không có nút gom.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` (dev server cổng 5190, `KIEM_TRA_URL`): `Không có lỗi.`
- `python tools/kiem_van.py src/ui/LocNangCao.tsx`: Sạch.
- Playwright màn Mua hàng: gom Nhà cung cấp, Cửa hàng ra 2 cấp; cột thứ 6 không vào, có thông báo; nút gom thẳng hàng.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không. CSS cũ `.ds-groupzone`, `.ds-hop-huong-dan` để lại, không còn chỗ dùng.
