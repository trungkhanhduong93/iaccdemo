# Danh mục nhóm, đồng ý chia sẻ thông tin, phương thức thanh toán (T136, T137)

- Ngày: 11/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code qua Orca
- Trạng thái cuối phiên: Xong

## Đã làm

- T136: 5 màn nhóm ngoài Excel ở `danh-muc/index.ts`: nhóm hàng hoá, nhóm đối tượng, nhóm mục chi phí, nhóm công việc, nhóm kho. Dữ liệu mẫu ở `danh-muc/data.ts`, ô panel ở `truong-dm.ts`.
- T136: ô Nhóm của hàng hoá, đối tượng, mục chi phí, công việc, kho chọn từ màn nhóm. Ô "Loại kho" đổi tên thành "Nhóm kho".
- T136: hàng hoá thêm ô Mục chi phí, Phương pháp tính giá. Đổi nhóm thì tự điền theo nhóm qua `CauHinhDM.hoiDoi` mới. Ô trống điền luôn, ô khác giá trị thì hỏi.
- T136: kho thêm khối Ngầm định (mục chi phí, công việc) và khối Liên hệ.
- T136: ô bắt buộc `dongY` "Đã đồng ý chia sẻ thông tin cá nhân" ở Đối tượng và Người dùng. `CatalogScreen` bắt ô tích `batBuoc` phải tích mới lưu.
- T136: tách `CatalogPanel` khỏi `CatalogScreen.tsx`. Màn Người dùng (`he-thong/HeThong.tsx`) dùng lại panel này để Thêm, Sửa.
- T137: màn Danh mục phương thức thanh toán sau Quỹ tiền, dữ liệu `DS_PTTT`. Danh sách phương thức ở `ChungTuBanHang.tsx` lấy tên từ đây.
- T137: `ChungTuForm.tsx` có ô Phương thức cho phiếu nhóm `ban` khi thu tiền ngay, lưu ở `row._pttt`.
- T137: `HopDongBo.tsx` thêm prop `tichPhu` (ô tích thứ hai). Hai hộp đồng bộ POS (`ChungTuBanHang.tsx`, `TienIch.tsx`) có tích "Tự động hạch toán chứng từ theo phương thức thanh toán", toast báo số phiếu thu sinh ra.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi, sau cả T136 và T137.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi.", 228 lượt mở màn. Trên Windows phải đặt `PYTHONIOENCODING=utf-8`, không thì script lỗi `UnicodeEncodeError` khi in.
- `python tools/kiem_van.py` các file src đã sửa: 0 ĐỎ. `ChungTuForm.tsx` có 1 VÀNG ở dòng 1137, câu cũ, không thuộc việc này.
- Chưa bấm thử bằng tay trên trình duyệt luồng đổi nhóm hàng hoá có hỏi và luồng Người dùng.

## Dở dang, việc tiếp theo

- Không. Hai việc tách ra: T139 (phiếu kho lấy mục chi phí, công việc theo kho), T140 (đồng bộ POS sinh phiếu thu thật thay cho toast).

## Bẫy, quyết định mới

- Ghi QD47 trong `docs/QUYET-DINH.md`.
- Không ghi `docs/BAY.md`.
