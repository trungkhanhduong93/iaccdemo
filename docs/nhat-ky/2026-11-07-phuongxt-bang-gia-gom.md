# Bảng giá gom theo lần khai giá (T761)

- Ngày: 07/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/danh-muc/ThemBangGia.tsx`: form Thêm bảng giá dùng cả để sửa (`sua`). Thêm ô Mã bảng giá (tự sinh `BGxxxx`), Tên bảng giá. Lưu một dòng bảng giá giữ cả lưới trong `dong`, tóm tắt `soHang`, `hang`, `ncc`, `kh`. Sửa thì `suaCatalogRow`, nút Xoá xoá cả bảng. Kiểm trùng mặt hàng với bảng khác (cùng loại, đối tượng, ĐVT, giao thời gian, cửa hàng) thì hỏi "Vẫn lưu". Dữ liệu mẫu 3 bảng giá BG0001 đến BG0003 gieo vào kho phiên.
- `src/ui/generic/danhMucStore.ts`: thêm `gieoCatalogRows` đưa dữ liệu mẫu vào kho phiên một lần, để sửa, xoá như dòng thêm mới.
- `src/ui/generic/CatalogScreen.tsx`: màn có `formThem` thì bấm dòng mở form đó để sửa thay panel cũ.
- `src/modules/types.ts`: `formThem` nhận thêm `sua`.
- `src/modules/danh-muc/index.ts`: cột danh sách 1.14 theo bảng giá, `rows` trả rỗng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/danh-muc/ThemBangGia.tsx`: Sạch.
- Thử trên máy (gói Plus, Phố Mây): danh sách 3 bảng giá theo tab; mở BG0003 hiện đủ 8 dòng, đổi giá, xoá 1 dòng, lưu còn 7; Thêm mới ra BG0004, trùng Xương ống bò với BG0003 thì hỏi lại, Vẫn lưu được; xoá bảng giá.

## Dở dang, việc tiếp theo

- `python tools/xuat_bao_cao_he_thong.py` lỗi trên máy PhuongXT: thiếu thư mục `Present/tools` cạnh repo (`build_present`), chưa làm mới file Excel.
- Chờ Trum duyệt QD101, nhất là luật bảng bắt đầu muộn hơn được ưu tiên.
- Cấu hình panel cũ `'1.14'` trong `src/modules/danh-muc/truong-dm.ts` không còn đường vào, để nguyên.
- Đổi trạng thái bằng chấm tròn ở danh sách vẫn chỉ ghi đè trong màn (như các danh mục khác), kiểm trùng chưa biết bảng vừa tắt.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD101 Bảng giá gom theo lần khai giá, chờ Trum duyệt.
