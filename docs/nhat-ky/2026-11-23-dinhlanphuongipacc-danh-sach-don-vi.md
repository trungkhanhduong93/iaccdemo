# Màn Danh sách đơn vị (T904)

- Ngày: 23/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- File mới `src/modules/he-thong/DanhSachDonVi.tsx`: bảng đơn vị gồm Mã số thuế, Tên đơn vị, Địa chỉ, Danh sách cửa hàng, Loại hình, Gói dịch vụ (Standard, Plus, Pro đang dùng), Thao tác. Hộp sửa có ô Gói dịch vụ chỉ đọc. Có ô tìm, dòng tổng, phân trang. Nút chuyển sang làm việc ở đơn vị khác, dòng đơn vị đang mở thì nút mờ. Nhãn nhỏ "Đang làm việc" sau tên. Cột Thao tác ghim bên phải.
- Hộp sửa đơn vị: tên, MST (10 hoặc 13 số, không trùng đơn vị khác), địa chỉ. Thêm cửa hàng chọn từ cửa hàng FABi chưa gán, bớt cửa hàng bằng nút x. Bấm Lưu mới áp dụng. Đơn vị cần ít nhất một cửa hàng.
- Quyền: vai trò Chủ doanh nghiệp (role `owner`, coi là FABi Owner) được sửa. Vai trò khác chỉ xem, ô chỉ đọc, không có nút Lưu. Người dùng chốt trong phiên.
- `src/modules/he-thong/index.ts`: thêm màn `he-thong/don-vi`, ẩn tab ở mọi gói.
- `src/app/Topbar.tsx`: mục "Xem tất cả đơn vị" mở màn mới thay cho `/chon-don-vi`.
- `src/app/session.tsx`: trường mới `cnBo` (cửa hàng có sẵn đã bớt theo đơn vị), `dsCuaHang` ẩn cửa hàng đã bớt.
- `src/modules/onboarding/cua-hang-fabi.ts`: thêm 3 cửa hàng mẫu Trà Lá; hàm `cuaHangCuaDv`; `cuaHangChuaDung` tính cả cửa hàng đã bớt.
- CSS mục `Danh sách đơn vị (T904)` cuối `src/styles/app.css`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` file màn mới: sạch.
- Trình duyệt: vai trò owner sửa MST, thêm Phố Mây Quận 7, bớt Trà Lá Thủ Đức cho Trà Lá, lưu đúng; MST "123" báo lỗi. Vai trò kế toán trưởng chỉ xem.
- Chưa làm bản điện thoại.
- `python tools/xuat_bao_cao_he_thong.py` không chạy được trên máy này: thiếu module `build_present` ở thư mục `Present/tools` cạnh repo. Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.

## Dở dang, việc tiếp theo

- Không.
- Số "điểm bán" ở menu đơn vị thanh trên vẫn lấy số cố định `diem` trong `DON_VI`, chưa theo số cửa hàng thật sau khi thêm, bớt.

## Bẫy, quyết định mới

- Không.
