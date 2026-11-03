# Danh mục gói Plus theo bộ gói Standard, thêm 4 danh mục (T719)

- Ngày: 03/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/danh-muc/index.ts`: gói Plus ẩn khỏi tab, menu các danh mục ngoài bộ gói Standard (`AN_GOI_PLUS`: tài khoản, mục chi phí, công việc, tiền tệ, tỷ giá, loại thuế, bút toán tự động; nhóm mục chi phí, nhóm công việc, nhóm kho). Dùng `anTab` nên đường dẫn cũ vẫn mở được.
- Cùng file: cột theo gói Standard cho gói Plus. Hàng hoá bỏ cột Giá bán, Kho bỏ cột Nhóm kho, không thêm kho, có ghi chú mỗi cửa hàng một kho mặc định. Quỹ tiền có cột Số dư ban đầu.
- Cùng file: thêm màn `cong-thuc-che-bien` (chỉ gói Plus) dùng lại `CongThucScreen` của Kho, cùng dữ liệu với tab Công thức chế biến ở Kho. Tab nằm sau Quy đổi ĐVT.
- `src/modules/danh-muc/truong-dm.ts`: ô Số dư ban đầu trong form quỹ mở cho gói Plus.
- `src/modules/danh-muc/truong-dm.ts`: form hàng hoá gói Plus bỏ ĐVT phụ, Mã vạch, Giá mua, Giá bán, khối Hạch toán, Kho mặc định, Tồn tối thiểu, Tồn tối đa, khối Nhà cung cấp. Gói Pro vẫn giữ.
- `src/app/SidebarFlyout.tsx`: menu Danh mục thêm Công thức chế biến (gói khác tự ẩn).
- Thanh tab Danh mục gói Plus giờ là: Hàng hoá, Nhóm hàng hoá, Đơn vị tính, Quy đổi ĐVT, Công thức chế biến, Đối tượng, Nhóm đối tượng, Kho, Cửa hàng, Quỹ tiền, Phương thức thanh toán, Bảng giá, Lý do nghiệp vụ, Nhóm lý do nghiệp vụ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở bản chạy trên máy gói Plus: thanh tab đúng danh sách trên, màn Công thức chế biến ở Danh mục hiện đủ công thức.

## Dở dang, việc tiếp theo

- Không.
- Chưa đổi: Danh mục cửa hàng gói Plus không có cột Cách tính chi phí NVL như gói Standard (gói Plus có Kho, công thức chế biến). Lý do nghiệp vụ gói Plus vẫn có lý do nhập, xuất kho. Form hàng hoá gói Plus vẫn có Kho theo dõi, khối Quy đổi đơn vị tính. Menu Danh mục gói Plus vẫn còn dòng Tài sản cố định (màn của phân hệ TSCĐ).

## Bẫy, quyết định mới

- Không.
