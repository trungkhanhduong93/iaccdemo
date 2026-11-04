# Gói Plus hiện màn nghiệp vụ, báo cáo theo roadmap (T721)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- So tab Tính năng của roadmap (lọc "Mới ở Plus", PhuongXT gửi ảnh) với các màn gói Plus đang mở.
- `src/app/plan.ts`, `THEO_ROADMAP`: mở cho gói Plus Hoá đơn bán hàng 3.1.2, Xuất hoá đơn điện tử 3.1.5, Hoá đơn điều chỉnh, thay thế 3.1.6, Xuất, nhập điều chuyển kho 5.1.4 (kèm Nhập điều chuyển, Chuyển kho), Tự động đồng bộ dữ liệu kho 11.3, Nhận hoá đơn đầu vào 11.4. Trước đây chỉ gói Pro có.
- Cùng file, `DA_BO`: bỏ 3.2.1, 3.2.3 ra khỏi danh sách màn bỏ hẳn. PhuongXT mở lại Báo cáo bán hàng, Báo cáo doanh thu (đảo lại T99), có ở gói Plus, Pro theo Excel.
- `src/modules/bao-cao/danh-sach.ts`, `MO_IFASTER`: thêm 3.2.1, 3.2.2, 3.2.3, 5.2.5 để Báo cáo bán hàng, Đối soát bán hàng với POS, Báo cáo doanh thu, Đối chiếu xuất kho với định lượng hiện ở mọi chế độ. Trước đây Đối soát và Đối chiếu có trong gói Plus nhưng bị lọc theo chế độ nên không hiện.
- Báo cáo nhập kho, xuất kho 5.2.2 của roadmap: PhuongXT chốt dùng Tổng hợp xuất kho 5.2.11, Chi tiết xuất kho 5.2.12, hai màn này gói Plus đã có. 5.2.2 vẫn bỏ (T624).
- Gói Standard không đổi.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Bản chạy trên máy, gói Plus: mở được 3.1.2, 3.1.5, 3.1.6, 5.1.4, 11.3, 11.4, 3.2.1, 3.2.2, 3.2.3, 5.2.5, không hiện mời nâng cấp; Báo cáo bán hàng có số liệu. `hienMan` gói Plus đúng cả TT58 lẫn TT152, gói Standard vẫn ẩn.

## Dở dang, việc tiếp theo

- Không.
- Roadmap ghi 3.1.2 là "Bán hàng"; đang mở theo mã là Hoá đơn bán hàng 3.1.2. Bán hàng lập tay 3.1.7 vẫn chỉ gói Pro. Cần thì PhuongXT chốt lại.
- Tự động xuất kho định lượng 11.2 roadmap xếp Plus, chưa mở lại (vẫn bỏ theo T100).
- Gói Plus còn mở 8 màn roadmap không ghi "Mới ở Plus": 5.1.8, 10.1.1, 2.2.8, 2.2.9, 4.2.6, 10.4.3, 11.13, X3. Giữ nguyên vì chưa biết roadmap xếp gói Standard hay Pro.
- Màn gói Pro vẫn hiện khoá ở gói Plus để mời nâng cấp như cũ.

## Bẫy, quyết định mới

- Không.
