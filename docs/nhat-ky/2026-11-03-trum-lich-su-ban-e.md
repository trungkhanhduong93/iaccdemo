# Lịch sử phiếu bản E, web và app (T715)

- Ngày: 03/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MLichSu.tsx`: `DongLichSu` thêm `noiDung`, `lyDo`, `tongCu`, `tongMoi`; `TruongDoi` thêm `xoa`. Bỏ `vietTatTen`, `dinhDangNgay`.
- `MLichSu.tsx`: lịch sử mẫu điền đủ câu Tạo, Sửa (3 chỗ sửa, xoá dòng 7, tổng 4.748.550 → 4.778.550, có lý do), Lưu hoặc Ghi sổ theo `kieuGhiSo(goi)`.
- `MLichSu.tsx`: `tachDoi` tách riêng hàng "Tổng tiền: cũ → mới" thành `tongCu`, `tongMoi`. Nhật ký trong phiên đặt `noiDung` bằng câu `viec`.
- `MLichSu.tsx`: phiếu vừa thêm trong phiên (nhật ký có câu bắt đầu "Thêm mới chứng từ" hoặc "Lập mới chứng từ") không hiện lịch sử mẫu nữa.
- `MLichSu.tsx`: app vẽ lại theo bản E. Mỗi thao tác một thẻ, mỗi chỗ sửa một khối Trước đỏ nhạt, Sau xanh lá nhạt, có khối Tổng tiền và khối Lý do.
- `src/ui/generic/ChungTuForm.tsx`, hàm `LichSu`: bỏ cột lọc T714, vẽ thẻ theo bản E, bảng 3 cột Chỗ sửa, Trước khi sửa, Sau khi sửa, hàng Tổng tiền có số chênh.
- `src/ui/mobile/MThePhanBo.tsx`: lịch sử mẫu thẻ phân bổ đổi `ghiChu` thành `noiDung`.
- `src/styles/app.css`: mục T714 cuối file thay lớp `ls-b-*` bằng `ls-e-*`, lớp `m-ls-*` vẽ lại theo bản E.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- Playwright, gói S, `#/app/tien/2-1-1/chi-3`. Web 1440x900: 3 thẻ, thẻ Sửa có bảng 3 cột, 4 hàng, có Lý do sửa, nhãn Đã xoá dòng. App 390x844: 3 khối Trước/Sau, có Lý do sửa, không tràn ngang.
- `python tools/kiem_van.py` cho `MLichSu.tsx`, `ChungTuForm.tsx`: 0 ĐỎ.
- Chưa kiểm bằng trình duyệt ca thêm mới rồi sửa phiếu trong phiên. Mới soát bằng đọc code: câu nhật ký hiện đúng ở dòng Nội dung.

## Dở dang, việc tiếp theo

- Không. Hộp bắt nhập lý do khi sửa, xoá, huỷ phiếu vẫn là việc riêng, chờ Trum chốt có bắt buộc hay không.

## Bẫy, quyết định mới

- Không.
