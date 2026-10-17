# Báo cáo điện thoại: bộ lọc 80% và 50%, chỉ dạng dòng, ngày đậm, tổng ngày bảng kê, chip điều kiện (T343)

- Ngày: 17/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MBaoCaoLoc.tsx`: bảng lọc chính cao 80% màn hình; bảng điều kiện con (Kỳ báo cáo, Cửa hàng, điều kiện riêng) cao 50%, đè lên bảng chính, có nền mờ; chạm nền mờ thì huỷ thay đổi của bảng con. Nút ở đáy cả hai bảng. Giữ nút Đặt lại ở bảng chính.
- `src/ui/mobile/MSoBaoCao.tsx`: bỏ nút Dạng dòng/Bảng, báo cáo có dạng dòng thì luôn hiện dạng dòng. Hàng chip thêm mọi điều kiện lọc riêng đang chọn ("Đối tượng: ..."), chip vẫn chỉ hiển thị (T312).
- `src/ui/mobile/MBaoCaoDong.tsx`: tiêu đề mỗi ngày ghi tổng tiền của ngày bên phải; ngày và số tổng 16px, đậm.
- `src/styles/app.css`: mục cuối T343.
- Các báo cáo chưa có dạng dòng vẫn hiện bảng: 2.2.2, 2.2.4, 2.2.6, 2.2.7, 3.2.1–3.2.5, 4.2.4, 4.2.5, 5.2.2, 5.2.4–5.2.8, 5.2.13–5.2.15, nhóm 6.2, 7.2, 8.2, 9.2, 10.2.1, 10.2.2, 10.2.4, 10.2.5, 10.3.1, 10.4.1, 10.4.2.
- Coordinator sửa lại 3 chỗ worker làm thừa: worker đổi thứ tự cột tiền của dòng (lấy tổng có VAT trước) làm số mỗi dòng đổi, đã trả về như cũ và cho tổng ngày dùng cùng thứ tự; worker đổi nút Đặt lại thành Huỷ, đã trả lại; bỏ ép kiểu `as any` khi đọc nhãn điều kiện.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Playwright 390x844 gói PL, Bảng kê mua hàng theo hàng hoá tháng 9: ngày 30/09 tổng 11.198.000 = 792.000 + 480.000 + 3.380.000 + 3.570.000 + 2.976.000; không còn nút Bảng; bộ lọc còn nút Đặt lại. Worker đo bảng chính 675px (80%), bảng con 422px (50%), chip Đối tượng hiện khi lọc.

## Dở dang, việc tiếp theo

- Các báo cáo trong danh sách chưa có dạng dòng ở trên: nếu cần chỉ dạng dòng thì phải làm khuôn dạng dòng cho từng báo cáo.

## Bẫy, quyết định mới

- Không.
