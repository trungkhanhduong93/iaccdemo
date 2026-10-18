# Thêm nguyên vật liệu mới ngay tại form, hộp nhỏ 4 ô (T388)

- Ngày: 18/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong, chưa push (người dùng dặn chưa push)

## Đã làm

- `ui/ChonDanhMuc.tsx`: thêm prop `gon`. Có `gon` thì bấm Thêm … mới mở hộp nhỏ giữa màn (`HopThemHang`, kiểu hộp thêm nhanh có sẵn) thay panel nửa màn bên phải: Mã hàng (tự sinh theo loại, sửa được), Tên hàng, Đơn vị tính, Loại hàng hoá. Loại hàng hoá khoá theo màn, không chọn loại khác: Mua hàng, Kiểm kê là Nguyên vật liệu, Chi phí trả trước là Khác (Công cụ dụng cụ). Đổi ô thì chạy quy tắc `doi` của danh mục Hàng hoá. Phần lưu vào danh mục tách thành `luuMuc`, dùng chung với panel đầy đủ.
- `ui/generic/danhMucStore.ts`: thêm hàng từ ô công cụ dụng cụ mặc định Theo dõi tồn kho (trước là không). Nguyên vật liệu vẫn mặc định loại Nguyên vật liệu, theo dõi tồn.
- Dùng hộp gọn ở: phiếu Mua hàng (`BangSua.tsx` prop `themGon`, `ChungTuForm.tsx` bật khi nhóm mua), Kiểm kê (`BangKiemKe.tsx`), Chi phí trả trước (`ccdc/the-phan-bo.tsx`, `ccdc/GhiTangHangLoat.tsx`, loại mặc định Khác (Công cụ dụng cụ)).
- Các màn khác (bán hàng, kho, sản xuất, công thức) giữ hộp đầy đủ như cũ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Gói Plus, Hoá đơn mua hàng: Thêm nguyên vật liệu mới mở hộp nhỏ 4 ô, Loại hàng hoá sẵn Nguyên vật liệu, mã tự sinh NVL013; lưu xong hộp đóng, dòng nhận mã mới. Phiếu kiểm kê mới: mở đúng hộp nhỏ.
- Ô Loại hàng hoá ở phiếu mua: Nguyên vật liệu, bị khoá. Giá trị sẵn của ô công cụ dụng cụ (đọc `getDmMeta` trên dev server): Khác (Công cụ dụng cụ), theo dõi tồn kho, mã tự sinh CCDC01. Chưa bấm thử hộp trên màn chi phí trả trước.

## Dở dang, việc tiếp theo

- Chưa push: chờ người dùng bảo.

## Bẫy, quyết định mới

- Không.
