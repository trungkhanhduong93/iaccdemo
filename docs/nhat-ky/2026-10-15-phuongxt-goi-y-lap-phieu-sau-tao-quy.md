# Gợi ý lập phiếu thu, chi sau khi tạo quỹ từ trang chủ (T250)

- Ngày: 15/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/generic/GoiYLapPhieu.tsx` (mới): hộp "Đã tạo quỹ …" có nút Lập phiếu thu, Lập phiếu chi, Để sau. Quỹ ngân hàng đổi thành Lập báo có, Lập UNC. Mở phiếu kèm state `tuTrangChu`, `goiYVeTrangChu`.
- `CatalogScreen.tsx`: tham số `?goiY=thuchi` (cùng `?moi=1`) bật gợi ý; lưu quỹ mới (không phải sửa, không phải Lưu và thêm) thì hiện hộp.
- `MDanhMuc.tsx` (điện thoại): trước chưa đọc `?moi=1`, nay mở thẳng form thêm và có cùng gợi ý.
- `BaBaiToanFree.tsx`, `MTrangChu.tsx`: nút Tạo quỹ thêm `&goiY=thuchi`.
- `ChungTuForm.tsx`: phiếu mở từ gợi ý, lưu phiếu mới xong hỏi "Về trang chủ" hay "Ở lại phiếu".
- `LocNangCao.tsx`: xuất `useDongEsc`; `HopXacNhan` thêm `nutDo` (mặc định true), `false` thì nút chính màu xanh.
- Trang chủ Free máy tính: bỏ dòng "IACC Free giúp bạn nắm 3 việc…", chọn Năm, Tháng đưa lên bên phải thanh tab qua `LenThanhTab` mới trong `ModuleTabs.tsx` (ô `#mtabs-phai`).
- Thẻ Hao hụt kiểm kê (máy tính, điện thoại): dòng phụ đổi thành "Các mặt hàng thừa thiếu trong kỳ", bỏ số phiếu `soPhieuHH` không còn dùng.
- `app.css`: mục T250 cuối file (hộp gợi ý, hộp nhỏ giữa màn trên điện thoại, ô phải thanh tab).
- `tools/kiem_tra.py`: ảnh kiểm T238 trước ghi vào đường dẫn máy Trum (`C:/Users/trung.duong/...`), máy khác báo lỗi quyền và dừng script; đổi sang `tools/shots`.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` cho GoiYLapPhieu, BaBaiToanFree, MTrangChu, ChungTuForm: 0 ĐỎ (1 VÀNG cũ ở ChungTuForm dòng 1273, không thuộc việc này).
- Bản dev gói Free: trang chủ → Tạo quỹ → lưu → Lập phiếu thu → lưu → Về trang chủ chạy đúng; đổi tháng trên thanh tab đổi số liệu; điện thoại hộp gợi ý hiện giữa màn. Đã trả phiên về Phố Mây gói Plus.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `xuat_bao_cao_he_thong.py` cần `Dự kiến tính năng IACC Cloud.xlsx` chỉ có trên máy Trum.

## Dở dang, việc tiếp theo

- Không. Hạn chế: phiếu mở từ gợi ý chưa chọn sẵn quỹ vừa tạo, vì danh mục quỹ là dữ liệu giả, quỹ mới không vào danh sách quỹ của phiếu.

## Bẫy, quyết định mới

- Không.
