# Thông báo dùng chung ThongBao (T889)

- Ngày: 19/11/2026
- Người: Trum, agent: Claude Code (5 subagent Claude chia nhóm file). Đã giao 5 Antigravity trước đó, 20 phút chưa sửa dòng nào nên dừng.
- Trạng thái cuối phiên: Xong

## Đã làm

- Tạo `src/ui/ThongBao.tsx`: 6 loại (chan, xoa, canhBao, hoi, xong, thongTin), khối dữ kiện, khối ảnh hưởng, bước gỡ, nút chính, phụ, thêm. Prop `hinh` cho biểu tượng riêng (khoá, mở khoá, lưu, cửa hàng). `nut` bỏ trống được khi hộp chỉ có nút phụ.
- `src/app/session.tsx`: `toast(m, { loai, phu, nut })`. Không truyền thì `xong` 3 giây; `loi`, `thongTin` 5 giây; `canhBao` đứng tới khi bấm đóng.
- `HopXacNhan` ở `LocNangCao.tsx` gọi lại `ThongBao`, bỏ `nutDo`. Xoá hàng loạt theo Xoa.html hộp 2, mỗi phiếu giữ lại đếm một lý do.
- Đổi 45 chỗ hộp trong Kiểm kê của spec sang `ThongBao`, bỏ 5 hộp tự dựng (td-hop, KhungHop, GoiYLapPhieu, m-lp-hop-hoi-the, ChonCuaHangTruoc 2 bản).
- Máy tính: sửa phiếu mua đã có phiếu chi trả sau thì hiện hộp chặn. Đóng phiếu chưa lưu có Bỏ thay đổi, Ở lại sửa, Lưu rồi đóng. Đã lưu có Lập phiếu mới, Ở lại phiếu, Về trang chủ.
- Toast chặn có số phiếu thành hộp chặn ở `ChungTuForm.tsx`, `MXemPhieu.tsx`, `MCcdc.tsx`, `CatalogScreen.tsx`. Toast báo thiếu, sai ô gắn loại `loi`. `tt-toast` ở `MXemPhieu.tsx` gộp vào toast có nút Xem.
- Khoá sổ giữ nghiệp vụ cũ: còn bước chưa xong vẫn khoá được. Hộp liệt kê 5 bước, bước thiếu có Làm ngay.
- CSS: mục `/* ── Thông báo dùng chung ThongBao (T889) ── */` cuối `app.css`, sửa `.toast`. Xoá CSS hộp cũ không còn chỗ dùng (ds-hop-than, ds-nut-xoa, td-hop-giua, td-bieu-tuong, m-lp-hop-hoi-the, tt-toast, goiy-lap-phieu, ks-hop-rong, ks-hop-ls, ks-nut, ks-pham).
- QD113 viết xong trong `docs/QUYET-DINH.md`.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi."
- `python tools/kiem_van.py` cho mọi file đã sửa: 0 ĐỎ.
- Ảnh ghép mẫu và app ở `backup/review-T889/*.png` (script `chup.py`): Chan-1, SoSach-2, LuuDong-3, CanhBao-4, Toast-3 máy tính và điện thoại, Toast-2. Đã sửa các lệch thấy được: biểu tượng riêng, nút Bỏ thay đổi kiểu chữ, cột bước khoá sổ, mô tả trên điện thoại tràn ngang, nhãn loại thừa đệm.
- Bảng đối chiếu `backup/review-T889/doi-chieu.md`: không còn dòng Lệch thiếu lý do. Ô bỏ vì không có hàm ghi trong cột riêng.
- Soát diff logic: 0 ĐỎ, 5 VÀNG đã sửa (Lưu rồi đóng khi có gợi ý về trang chủ, 2 toast chặn còn sót, ô giá trị tồn đầu tự tính, câu bước mở khoá, đếm chồng ở xoá hàng loạt).
- Chưa chụp được Xoa-1, Xoa-2: dữ liệu mẫu không có phiếu chưa ghi sổ dễ chọn. Chưa bấm thử hết từng nút trên cả 3 gói.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD113 trong `docs/QUYET-DINH.md`.
- Class `.tb-nhan` đã có từ trước (chip nhãn), mục T889 phải đặt lại padding, nền.
