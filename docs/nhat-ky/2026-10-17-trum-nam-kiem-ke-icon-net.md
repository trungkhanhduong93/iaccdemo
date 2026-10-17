# Ô chọn năm trang chủ Free điện thoại, cột tồn ở báo cáo kiểm kê, icon thao tác dạng nét (T342, T345, T348)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code (T345, T348), Antigravity (T342)
- Trạng thái cuối phiên: Xong

## Đã làm

- T342 `src/ui/mobile/MTrangChuFree.tsx`: ô chọn năm bị `disabled` và rộng 96px nên bấm không phản hồi, chữ bị cắt; bỏ `disabled`, rộng 112px. Nút Tuỳ chỉnh thao tác nhanh mở modal bằng lớp `m-tam-nen` không có CSS nên modal rơi xuống ngoài màn; đổi sang `m-tam-overlay` như gói PL. Năm chỉ có 2026 như bản web Free.
- T345 `src/modules/kho/bao-cao.ts` (`baoCaoKiemKe`): thêm cột Tồn đầu, Nhập trong kỳ, Xuất trong kỳ, Tồn cuối hệ thống (từ `xnt(thang, kho)`, cùng nguồn báo cáo Xuất nhập tồn), Tồn cuối thực tế = tồn hệ thống + thừa − thiếu; 7 cột số dùng `wCung` để bảng vừa khung.
- T345 `app.css`: cột `wCung` nằm dưới hàng tiêu đề nhóm bị luật `.tbl thead tr.tbl-nhom + tr.tbl-cot th { white-space: nowrap }` đè luật xuống dòng của T287; thêm luật riêng cho trường hợp này.
- T348: icon dạng nét ở `Note` (`src/ui/Page.tsx`, mọi khung báo), `MenuItem` (`src/ui/Dropdown.tsx`, mọi menu thả xuống), ô Cửa hàng trên thanh trên (`src/app/Topbar.tsx`), nút Mở khoá, Khoá sổ (`KhoaSoFree.tsx`, `CuoiKy.tsx`). Dùng tham số `kieu="net"`, không sửa `Icon.tsx`, `icon-dac.ts` của T340.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Báo cáo kiểm kê gói F tháng 9: Xương ống bò kho bếp Lê Lợi 27 + 177 − 202 = 2; bảng không còn cuộn ngang (1336/1336px).
- Menu chọn cửa hàng, khung báo trang Khoá sổ: không icon nào trống.
- Worker T342 bấm thử chọn năm, Tuỳ chỉnh, Lưu: đạt, không lỗi console.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
