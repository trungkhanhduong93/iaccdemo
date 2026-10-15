# Bỏ thẻ ánh xạ POS, tính giá xuất kho gói Free, bỏ Excel ở Phương thức thanh toán (T268)

- Ngày: 15/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `he-thong/HeThong.tsx`: Cấu hình kế toán bỏ thẻ "Chi nhánh và ánh xạ POS". Thông tin đơn vị: ô Phương pháp tính giá xuất kho gói Free chỉ còn "Bình quân gia quyền cuối kỳ"; gói khác vẫn đủ 3 lựa chọn.
- `ui/mobile/MHeThong.tsx`: ô Tính giá xuất kho trên điện thoại làm giống.
- `modules/types.ts`: cấu hình danh mục thêm `khongExcel` (gói không có nút Nhập, Xuất Excel). `CatalogScreen.tsx` ẩn hai nút theo trường này. `danh-muc/index.ts`: Phương thức thanh toán gói Free, Standard bỏ hai nút (lấy từ FABi, không thêm mới, như `khongThem`).

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Bản dev: gói Free ô tính giá chỉ còn một lựa chọn, gói Plus còn 3; Cấu hình kế toán không còn thẻ ánh xạ POS; Phương thức thanh toán gói Free không còn nút Excel, gói Plus còn. Phiên ở Phố Mây gói Plus.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: script cần file Excel nguồn chỉ có trên máy Trum.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
