# Form bảng giá mua, bán bố trí lại (T812)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/danh-muc/ThemBangGia.tsx`: loại giá Giá mua, Giá bán. Đầu form 2 hàng thẳng cột: Loại, Tên, Cửa hàng; Áp dụng cho (Mọi, Một nhà cung cấp hoặc khách hàng), ô chọn đối tượng dưới ô Tên. Góc phải Số bảng giá (chỉ khi sửa) và Thời gian áp dụng hai ô `ONgay` gõ được. Bỏ chữ giải thích dưới các ô.
- Đối tượng khai ở đầu form, lưu vào `dtMa` mọi dòng; rỗng là giá chung. Lưới bỏ cột đối tượng, thêm Giá sau thuế, Ghi chú (lưu `ghiChu`, danh sách có cột Ghi chú). Không ghi hệ số quy đổi dưới ô ĐVT vì một hàng có nhiều quy đổi; thay vào đó ghi chú trống (hoặc do form tự điền, cờ `ghiTu`) thì tự ghi "1 <ĐVT> = <hệ số> <ĐVT chính>" khi chọn hàng, đổi ĐVT; người dùng đã gõ ghi chú thì giữ. Cột đầu của đầu form rộng cố định 300px để đổi Giá mua, Giá bán các ô không xê dịch. Trùng chỉ khi cùng mặt hàng và ĐVT; chọn hàng đã có dòng khác thì lấy ĐVT chưa khai đầu tiên.
- Ô Mặt hàng dùng `ChonDanhMuc` như phiếu mua (tìm mã, tên, thêm hàng tại form), không `chiMa` nên hiện cả mã và tên. Hàng thêm tại form giữ trong `hangThem`.
- Như phiếu thu chi: `dangSua` (thêm mới thì sửa ngay, bảng có sẵn mở ở chế độ xem), nhãn `giua` Thêm mới, Chi tiết bảng giá, Đang chỉnh sửa kèm số; chế độ xem khoá đầu form bằng `fieldset disabled`, lưới hiện chữ; chân xem có Tiện ích (Sao chép, Xoá bảng giá) và Sửa; chân sửa Huỷ (trả ảnh `anhCu`), Lưu (về chế độ xem), Lưu và thêm (giữ loại, thời gian, cửa hàng, đối tượng). Số bảng giá chỉ ở nhãn giữa đầu form. `footClass="fsf-f-xem"`, `iconNet`, bọc thân form bằng `ct-co-dinh` để bảng chi tiết kéo hết chiều cao như phiếu thu chi.
- Dữ liệu mẫu: BG0001, BG0003 là giá chung; BG0004 giá mua một nhà cung cấp, mỗi mặt hàng 2 ĐVT.
- `src/ui/generic/CatalogScreen.tsx`, `src/modules/types.ts`: tuỳ chọn `locKhoangNgay` lọc cột "dd/mm/yyyy - dd/mm/yyyy" bằng Từ ngày, Đến ngày (giữ dòng có khoảng giao). `danh-muc/index.ts` bật cho cột Thời gian áp dụng, đổi tab Giá nhập thành Giá mua, nhà cung cấp trống hiện "Tất cả nhà cung cấp".
- CSS mục T812 cuối `app.css`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi (lần chạy đầu có 1 lỗi Esc form phiếu thu, chạy lại thì hết, không dính file đã sửa).
- `python tools/kiem_van.py` cho `ThemBangGia.tsx`, `CatalogScreen.tsx`, `danh-muc/index.ts`: Sạch.
- Thử trên máy gói Plus: sửa BG0004 đủ 6 dòng 2 ĐVT; ô hàng gõ "gao" ra Gạo tấm; thêm dòng chọn lại hàng đã đủ ĐVT thì lưu báo trùng; Lưu và thêm mới ra form mới; lọc 01/02/2027 - 10/02/2027 còn BG0003 (8/27 dòng); thêm mới không hiện số bảng giá, ô nhà cung cấp thẳng cột ô Tên.

## Dở dang, việc tiếp theo

- `python tools/xuat_bao_cao_he_thong.py` lỗi `No module named 'build_present'` (thiếu thư mục `Present/tools` cạnh repo), chưa làm mới file Excel.
- Commit chỉ nằm trên máy, chưa push: người dùng dặn khi nào bảo mới push.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: thêm ý T812 vào QD101, chờ Trum duyệt.
