# Trang Quản lý đơn vị kế toán (T906)

- Ngày: 23/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Trang mới `/don-vi` ở tầng tài khoản FABi, ngoài khung đơn vị (không thanh bên, không tab Hệ thống), theo bản mẫu artifact "Quản lý đơn vị kế toán". File `src/modules/don-vi/QuanLyDonVi.tsx` (chuyển từ `he-thong/DanhSachDonVi.tsx` của T904), `src/modules/don-vi/TabCuaHang.tsx`.
- Thanh trên trang: logo, tài khoản FABi, nút Quay lại đơn vị đang mở. Dòng phụ dưới tiêu đề ghi số đơn vị, số cửa hàng. Bỏ hàng ô tổng hợp theo góp ý.
- Tab Đơn vị kế toán: bảng như T904, nút Vào làm việc (đơn vị đang mở ghi Đang mở), nút Thêm đơn vị kế toán, chân bảng báo cửa hàng FABi chưa gán.
- Hộp sửa đơn vị: cửa hàng đã có chứng từ tạo thủ công hiện ổ khoá, không bớt được. Cửa hàng thêm mới lên sổ từ ngày bắt đầu làm việc của đơn vị.
- Tab Cửa hàng FABi: mọi cửa hàng trên tài khoản, lọc Tất cả, Đã gán, Chưa gán; cột Mã POS, Khu vực, Trạng thái, Thuộc đơn vị, Lên sổ từ, Chứng từ tạo thủ công. Nút Gán vào đơn vị (chưa gán), Chuyển đơn vị (mờ khi đã có chứng từ tạo thủ công).
- Hộp Chuyển đơn vị, Gán vào đơn vị: chọn đơn vị nhận; ngày lên sổ chỉ đọc, lấy theo Ngày bắt đầu làm việc của đơn vị nhận.
- Luật người dùng chốt trong phiên: chỉ chuyển, bớt cửa hàng chưa có chứng từ phát sinh; chỉ đếm chứng từ tạo thủ công, không đếm Xuất bán POS, thu tiền bán hàng, thu chi từ FABi. Cửa hàng FABi nào cũng có mã POS.
- `cua-hang-fabi.ts`: mã POS mọi cửa hàng, số chứng từ tạo thủ công mẫu `CT_TAY_MAU`, hàm `ctThuCong`, `cuaHangTaiKhoan`, `chuyenCuaHang`. `daXoa.ts`: `demPhieuMoiCuaHang` đếm phiếu lập trong phiên. `session.tsx`: `ngayLamViecDv`.
- Lối vào: menu đơn vị thanh trên đổi "Xem tất cả đơn vị" thành "Quản lý đơn vị kế toán"; menu avatar thêm mục cùng tên. Bỏ màn `he-thong/don-vi`.
- CSS mục `Trang Quản lý đơn vị kế toán (T906)` cuối `app.css`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` các file giao diện đã sửa: sạch.
- Trình duyệt, vai trò owner: chuyển Trà Lá Thủ Đức sang Góc Nhỏ rồi về lại Trà Lá đúng; nút Chuyển đơn vị của Phố Mây Lê Lợi mờ, không mở hộp; hộp sửa Trà Lá khoá 2 cửa hàng có chứng từ. Vai trò kế toán trưởng: không có nút thao tác, không có Thêm đơn vị.
- Chưa làm bản điện thoại. Chưa chạy `xuat_bao_cao_he_thong.py` (máy thiếu `Present/tools`).

## Dở dang, việc tiếp theo

- Không.
- Số chứng từ tạo thủ công là số mẫu cố định cho cửa hàng có sẵn của đơn vị mẫu, cộng phiếu lập tay trong phiên. Chưa đếm từ dữ liệu chứng từ thật.
- Còn chờ chốt: chứng từ tự sinh đã có ở đơn vị cũ giữ lại hay chuyển theo cửa hàng. Trang đang ghi là giữ ở đơn vị cũ.

## Bẫy, quyết định mới

- Không ghi QD. Bố cục và luật chuyển cửa hàng do dinhlanphuongipacc chốt trong phiên, cần Trum duyệt rồi ghi QD.
