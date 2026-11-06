# Web gói Plus, Công thức chế biến theo itax (T759)

- Ngày: 06/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code, OpenCode viết script kiểm
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/kho/CongThucPlus.tsx`: danh sách 7 cột, ô tìm mã, Áp dụng từ ngày, bộ lọc Trạng thái, Sản phẩm, Cửa hàng.
- `src/modules/kho/CongThucPlusForm.tsx`: form toàn trang một cột giữa, khối Phạm vi áp dụng, bảng nguyên vật liệu lọc từng cột, thêm dòng qua hộp tích nhiều dòng, cảnh báo khi đóng lúc đã đổi.
- `src/modules/danh-muc/index.ts`: `congThucCheBien` đổi `comp` sang `CongThucPlusScreen`.
- `src/modules/kho/CongThuc.tsx`: chỉ thêm `export` cho `MAN`, `mucHang`, `OSo`.
- `src/styles/app.css`: mục T759 cuối file.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in "Không có lỗi."
- Script Playwright tạm ngoài repo, mục a-i đều PASS: cột bảng, lọc, form phủ cả màn, nền ô, lọc rồi sửa đúng dòng, giữ `tang` `giam`, cảnh báo khi đóng, thêm mới, Pro và điện thoại không đổi, không lỗi console.
- Bài điện thoại T756 a-h vẫn đạt.
- Review chéo của worker không xong, Trum giao Claude tự review. Dò nơi gọi bằng grep: điện thoại nhận màn theo `slug`, gói Plus không mở được `kho/9-1-3` vì mã này nằm trong `CHI_GOI_PRO`.
- Tự review sửa 3 lỗi: `sed` đổi nhầm 6 luật màu của màn khác; đóng form để thừa mục lịch sử, đổi sang `useDong`; Esc không đóng form vì menu tab Khác luôn nằm sẵn trong DOM ở dạng ẩn.
- Sau 3 sửa, chạy trên bản `dist` tĩnh vì dev server bị tắt do thiếu RAM: `kiem_tra.py --nhanh` không lỗi, bài đóng form 9/9, bài T756 đạt. Bài T759 có mục e, i FAIL do script đọc `/src/ui/generic/daXoa.ts`, file chỉ có trên dev server; hai mục này đã đạt trên dev server trước các sửa.
- Chưa thử trên trình duyệt thật ngoài Playwright.

## Khác itax

- Không có nút Xoá ở form.
- Giữ tên "Công thức chế biến", giữ Cửa hàng và Kênh áp dụng thay cho Kho áp dụng.
- Chưa có màn trống kèm nút Tải lên tệp Excel, vì dữ liệu mẫu luôn có công thức.
- Thẻ tab ngang và màu theo repo.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD99.
- App có `zoom`, đo bề rộng bằng `bounding_box` sẽ nhỏ hơn số trong CSS. Ô số `OSo` đổi giá trị lúc focus nên Playwright phải bấm rồi gõ, `fill` ghép chuỗi sai.

