# Báo cáo xuất nhập tồn hiện dạng bảng; logo về trang chủ; bỏ tab Cần theo dõi (T309)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code. Làm ở máy HAN-IPOS381
- Trạng thái cuối phiên: Xong

## Đã làm

- Hiện tượng: báo cáo 5.2.3 Xuất nhập tồn mở ra là tờ in (khổ giấy, tên đơn vị, tiêu đề in hoa), không phải bảng dữ liệu như các báo cáo khác.
- Nguyên nhân: `kho/XuatNhapTon.tsx` tự vẽ `<table className="rpt">` để có tiêu đề 2 tầng. `ToGiay` chỉ nhận ra bảng dữ liệu khi con là `RptTable`, không thấy thì vẽ tờ in.
- Sửa: dùng `RptTable` với cột có `nhom` (Đầu kỳ, Nhập trong kỳ, Xuất trong kỳ, Cuối kỳ, mỗi nhóm SL, Giá trị), dòng Tổng cộng chỉ cộng giá trị như cũ. Mã, tên hàng vẫn bấm mở thẻ kho.

- `app/Shell.tsx`: bấm logo thanh bên về trang chủ (gói Free, chủ đơn vị: Tổng quan; còn lại Bàn làm việc, như trang mặc định), trước là mở Gói thuê bao. Bấm riêng nhãn gói (Free, Standard...) vẫn mở Gói thuê bao.
- `home/BaBaiToanFree.tsx`: trang chủ Free bản web bỏ tab Cần theo dõi (T274), chỉ còn nội dung Tổng quan; thanh đầu còn Thao tác nhanh, vẫn nằm bên phải (`app.css` mục T309: `margin-left: auto`). Bỏ số liệu `layDuLieuCanTheoDoi`, `LuoiCanTheoDoi` khỏi trang này (hàm vẫn còn ở `soLieuBieuDoFree`, `BieuDoFree`, điện thoại vẫn dùng). Đường dẫn cũ `?tab=theo-doi` giờ ra Tổng quan. Bản điện thoại gói Free vẫn còn tab Cần theo dõi.
- `tools/kiem_tra.py` bài T274 web: bỏ kiểm 2 tab, thẻ cảnh báo; thêm kiểm không còn tab Cần theo dõi.
- Khối Quỹ tiền trang chủ (`VongQuy`, `tenQuyDanhMuc`): tên quỹ hiện như Danh mục Quỹ tiền 1.12 (`DS_QUY_TIEN_112`), vd "Vietcombank, chi nhánh Sài Gòn", "Techcombank, nhận tiền QR", không kèm số tài khoản; ở chú thích và bảng Tất cả quỹ, rê chuột xem tên sổ. 2 quỹ mẫu ngân hàng đổi tên "MB Bank, chi nhánh Phú Nhuận", "VPBank, chi nhánh Thủ Đức". Khoá quỹ vẫn là tên sổ (`tenTkNh`, có số tài khoản) để mở đúng quỹ.
- Còn lệch có từ trước, chưa sửa: Sổ ngân hàng, Lịch sử thu chi, hộp quỹ vẫn ghi "Vietcombank 0071 0012 34567" (`tenTkNh` từ `TK_NGAN_HANG`); `TK_NGAN_HANG` ghi Techcombank "chi nhánh Thảo Điền", số 1903 4455 6677 88, còn danh mục 1.12 ghi "nhận tiền QR", số 1903 6655 8899.

## Đã kiểm

- Xem trên `npm run dev` gói Free, Kho bếp Lê Lợi tháng 9: màn chính dạng bảng, tiêu đề 2 tầng, số khớp bản cũ (NVL001 đầu kỳ 22 / 7.040.000, tổng cuối kỳ 99.106.400). Bấm In: bản xem trước vẫn đủ tiêu đề 2 tầng, 1 trang. Bấm logo ra `#/app/trang-chu/tong-quan`, bấm nhãn Free ra `#/app/he-thong/goi-thue-bao`.
- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` `--dien-thoai`: 1 lỗi không thuộc việc này (Chứng từ chưa ghi sổ không bật sẵn chip Chưa ghi sổ), ghi thành T314.

## Dở dang, việc tiếp theo

- Không. Có thể làm sau: tên quỹ ở Sổ ngân hàng, Lịch sử thu chi, hộp quỹ khớp Danh mục Quỹ tiền; bỏ tab Cần theo dõi ở điện thoại nếu dinhlanphuongipacc muốn.

## Bẫy, quyết định mới

- Báo cáo tự vẽ bảng HTML sẽ hiện dạng tờ in ở màn chính. Muốn dạng bảng thì dùng `RptTable` (tiêu đề 2 tầng khai `nhom` ở cột). Chưa ghi `BAY.md`.
