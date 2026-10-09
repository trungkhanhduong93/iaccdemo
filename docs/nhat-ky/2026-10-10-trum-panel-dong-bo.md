# Panel bên phải, hộp đồng bộ, hệ thống tài khoản (T70, T76, T79, T81)

- Ngày: 10/10/2026
- Người: Trum, agent: Claude Code (điều phối Antigravity tới T79, sau đó tự làm vì Antigravity hết token)
- Trạng thái cuối phiên: Dở dang (T80, T73 chưa làm)

## Đã làm

- T76 `HeThongTaiKhoan.tsx`, `he-thong-tk.ts`, `he-thong-tk-en.ts`: cây tài khoản TT133 (125), TT99 (224), panel đủ trường DM_ACCOUNT.
- T70 `CatalogScreen.tsx`, `truong-dm.ts`, `TuyChinhBC.tsx`, `DoiSoat.tsx`: panel rộng min(880px, 72vw), lưới 3 cột, trường theo bảng DM_. Coordinator sửa `.pn-khoi { flex: none }` (khối bị co, cắt mất trường).
- T79 `HopDongBo.tsx`, `TienIch.tsx`: hộp đồng bộ kiểu iPOS Inventory cho 11.1, 11.4.
- T81: `CatalogScreen.tsx` ghi nhớ dòng, cột, bảng; bấm dòng gán form cùng lượt vẽ; thân panel vẽ sau (`useDeferredValue`); thay `<select>` gốc bằng `Select` (tham số mới `ds`, ô tìm khi trên 8 lựa chọn). `HeThongTaiKhoan.tsx` tương tự, thân vẽ sau khi trượt xong (`onAnimationEnd`). Hiệu ứng trượt chỉ dùng transform. `TuyChinhBC.tsx` hai cột. `BangSua.tsx` HopCotPhieu thành panel, Esc chỉ đóng panel. `ChungTuForm.tsx`: menu Tiện ích đóng khi bấm Tuỳ chỉnh giao diện phiếu.
- Sửa lẻ: hover mọi cột bảng, viền dưới dòng tổng, sidebar 232px, nút tìm Ctrl K vào sidebar, thanh công cụ báo cáo bề rộng cố định, pill Tờ in / Khổ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Đo mở panel (Playwright, Chrome có giao diện, 1440x900): danh mục 1.2 từ 331ms còn khoảng 60ms tới khung đầu; Tuỳ chỉnh báo cáo khoảng 50ms. Panel tài khoản 1.1: khung đầu khoảng 45ms nhưng còn một khung hở 120-160ms lúc nội dung hiện (đo cả bản build), JS chỉ khoảng 25ms, còn lại là trình duyệt vẽ.
- Hộp đồng bộ: chọn 2 kho, đếm đúng, bấm đồng bộ ra thông báo.

## Dở dang, việc tiếp theo

- T80 hộp tìm Ctrl K kiểu iPOS Inventory: spec viết sẵn trong phiên (Vừa mở, Gợi ý, thanh phím tắt; lịch sử khoá `cmdk-gan-day`). Sửa `src/app/CommandPalette.tsx`.
- T73 tối ưu phản hồi: bắt đầu từ panel tài khoản (khung hở 120-160ms), thử giảm số phần tử thân panel, chỉ dựng khối đang mở.
- Ô Nhóm hàng hoá trong panel hàng hoá chưa điền sẵn giá trị của dòng đang sửa.
- Mật khẩu ivtstag đã lộ trong lịch sử phiên ngày 09/10: Trum đổi mật khẩu.

## Bẫy, quyết định mới

- Bẫy: panel nằm cùng component với bảng danh sách thì mỗi lần mở panel hay gõ trong panel, cả bảng vẽ lại. Ghi nhớ bảng bằng `useMemo`.
- Bẫy: `git add` file CSS khi agent khác đang sửa cùng file có thể kéo theo phần dở của agent đó; dùng `git hash-object` và `git update-index --cacheinfo` để chỉ đưa đúng khối của mình.
