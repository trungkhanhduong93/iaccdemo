# Điện thoại: trang chủ CH, lập phiếu thu chi (T538), đổi mã T537

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MTrangChu.tsx`, `MTrangChuFree.tsx`: chip chọn cửa hàng ghi "CH:" thay "CN:".
- `MDtThuChiLap.tsx`: dải số tiền và dòng đọc số thành `label` gắn ô nhập, bấm đâu cũng nhập được. Chữ "đ" bị `.m-tc-don-vi { flex: 1 }` của màn khác kéo giãn, mục cuối `app.css` đặt lại `flex: none`.
- `MDtThuChiLap.tsx`: sheet chọn đối tượng đọc `getAllCatalogRows('1.5')` (gồm đối tượng thêm trong phiên), bỏ 12 đối tượng gõ sẵn và vòng tròn chữ tắt. Dòng phụ ghi mã · loại, tìm được theo tên, mã, MST. Địa chỉ mẫu theo mã nằm ở `DIA_CHI_DT` vì danh mục giả chưa có địa chỉ.
- Sheet chọn đối tượng: hàng biểu tượng ⊕ (mở `MFormDm` thêm đối tượng, lưu xong chọn luôn) và ↻ thay nút "Thêm đối tượng mới" cuối sheet; bỏ chữ "GẦN ĐÂY"; ô tìm 16px.
- Form lập phiếu: bỏ nhãn Tự điền ở Địa chỉ, chú thích đổi thành "Lấy từ danh mục đối tượng". Tháng ghi nhận chi phí và nhãn Chi phí chỉ hiện khi phiếu chi có lý do trong `LY_CHI_PHI`. "Diễn giải" đổi thành "Ghi chú" (ô phiếu và ô dòng chi tiết).
- Commit cũ chưa push "T512: phiếu mua hàng đưa ô Chiết khấu…" đổi mã thành T537, vì T512 là việc của dinhlanphuongipacc.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- Bản chạy thử cỡ 375px: dải tiền rộng 323/343px; sheet đủ 20 đối tượng; ⊕ mở form, lưu đối tượng mới thì phiếu chọn đúng, địa chỉ điền đúng, đối tượng hiện trong danh sách; phiếu thu không có ô tháng; phiếu chi lý do "Chi phí giặt là" có ô tháng, "Thanh Toán Công Nợ Nhà Cung Cấp" không có.
- Chưa thử trên iPhone thật việc hết phóng to và hết bấm lọt sang màn thêm phiếu.

## Dở dang, việc tiếp theo

- Không.
- Bà Nguyễn Thị Hạnh, Ông Trần Văn Lộc (cho thuê nhà, có trong phiếu mẫu `modules/tien/index.ts`) chưa có trong danh mục Đối tượng nên không chọn được ở sheet. Cần thì thêm vào `KHACH` hoặc nhóm đối tượng khác trong `src/data/mock.ts`.

## Bẫy, quyết định mới

- `docs/BAY.md`: iPhone tự phóng to khi bấm vào ô nhập chữ dưới 16px.
