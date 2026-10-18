# Rút gọn mô tả thẻ Kết quả kinh doanh, trang chủ Free (T390)

- Ngày: 18/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `home/BaBaiToanFree.tsx`, thẻ Kết quả kinh doanh (máy tính):
  - Doanh thu: bỏ dòng mô tả "Tiền bán hàng trong tháng".
  - Giá vốn nguyên vật liệu: dùng `moTaCachNgan` mới trong `home/chi-phi-nvl.ts`. Một cách tính thì ghi cách đó (vd Theo giá thành iPOS Inventory), nhiều cách thì ghi "n cửa hàng, m cách tính".
  - Chi phí hoạt động: chỉ còn "Lớn nhất: <khoản> <số tiền>", chưa có số liệu thì "Lương, mặt bằng, điện nước".
  - Chi phí phân bổ, khấu hao: "Công cụ, tài sản chia dần".
- Bản điện thoại (`ui/mobile/MTrangChuFree.tsx`) chưa đổi.
- Kèm sửa lỗi của T388 (`ui/ChonDanhMuc.tsx`): thêm hàng mới từ ô NVL thì mục bị ghi 2 lần vào danh sách `nvl`, React báo trùng khoá. `themMucDanhMuc` giờ bỏ qua mục đã có.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trang chủ Free, bề rộng 1280px: 3 dòng mô tả hiện đủ, không bị cắt "…". Ở 1024px vẫn cắt bớt dòng Giá vốn, Chi phí hoạt động.
- Phiếu mua hàng: thêm NVL mới rồi mở lại ô chọn, 13 mục, không mã trùng.

## Dở dang, việc tiếp theo

- Muốn đồng bộ thì rút gọn tương tự ở `ui/mobile/MTrangChuFree.tsx`.

## Bẫy, quyết định mới

- Không.
