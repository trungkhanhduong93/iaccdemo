# Danh mục gói Plus, panel công thức chế biến (T722)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Đơn vị tính (1.3) có nút Đồng bộ FABi: `nutPhu` ở `src/modules/danh-muc/index.ts`, thêm 1.3 vào `laDongBoFabi` (`CatalogScreen.tsx`) và `CAC_DM_FABI` (`MDanhMuc.tsx`).
- Quy đổi ĐVT (1.4): cột Từ ĐVT, Đến ĐVT hiện "MÃ - Tên" (`maTenDvt` ở `danh-muc/index.ts`). Bộ lọc bỏ Tỷ lệ, Diễn giải qua tuỳ chọn mới `khongLoc` của catalog (`types.ts`, `CatalogScreen.tsx`).
- Bỏ cột Chức năng ở Hàng hoá, Đối tượng, Kho: xoá khai báo `chucNang` ở `danh-muc/index.ts`. Phần vẽ cột trong `CatalogScreen.tsx` giữ nguyên.
- Màn danh sách công thức bỏ dải giải thích "Chế biến là gộp" (`CongThuc.tsx`). Màn phiếu sơ chế, chế biến vẫn giữ.
- Form công thức (`FormCongThuc` ở `src/modules/kho/CongThuc.tsx`) thành panel bên phải (`pn-hop`) như form Hàng hoá, danh sách hiện phía sau: bỏ Mã công thức, Tổng chi phí, cột Đơn giá, Chi phí, Trạng thái dòng NVL; Sản phẩm (2 cột) và ĐVT hàng trên, Ngày, Cửa hàng, Kênh hàng dưới; khối Trạng thái "Đang sử dụng" ở cuối, thêm mới bật sẵn.
- ĐVT công thức chọn lại được khi hàng có quy đổi (`quyDoiTuDanhMuc`), lưu ở trường mới `dvt` của `CongThucCb`, `CongThucSc` (`san-xuat.ts`), cột Đơn vị tính danh sách đọc trường này.
- Thêm hàng loạt NVL dùng lại `ThemHangLoat`. Hộp tự portal ra body với z-index 50, thấp hơn panel 60: thêm mục CSS cuối `app.css` nâng hộp lên 70.
- Công thức áp dụng theo cửa hàng: trường `kho` đổi thành `cuaHang` (kiểu, dữ liệu mẫu đổi kho bếp sang cửa hàng của kho đó), `tenCuaHangAd`, `apDungCuaHang` thay `tenKhoAd`, `apDungKho`; form, cột, bộ lọc, màn điện thoại `MCongThuc.tsx`.
- `ChonHaiCot.tsx`: xét "cửa hàng" trước "hàng" khi ghi đơn vị chữ rút gọn, trước đây "Cửa hàng áp dụng" hiện "+2 hàng hoá".

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi." (một lần báo trắng trang ở `tien/2-1-1` gói Pro, chạy lại thì qua, màn này không sửa).
- `python tools/kiem_van.py` cho `CongThuc.tsx`, `san-xuat.ts`, `MCongThuc.tsx`, `danh-muc/index.ts`: sạch.
- Xem trên trình duyệt gói Plus: panel CTCB004, thêm mới, Thêm hàng loạt (thêm 1 NVL ra đúng 1 dòng), ĐVT chọn Lít, ml, Huỷ đóng panel.
- Chưa xem màn điện thoại Công thức và form công thức sơ chế ở Kho bằng mắt.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần `../Present/tools/build_present.py` và file `Dự kiến tính năng IACC Cloud.xlsx`, máy này không có.

## Dở dang, việc tiếp theo

- Không.
- Class CSS cũ `sx-ct-*` (đầu form toàn màn công thức) không còn dùng, chưa xoá khỏi `app.css`.

## Bẫy, quyết định mới

- Không.
