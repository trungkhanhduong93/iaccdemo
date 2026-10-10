# Sơ đồ Bán hàng gói Free kiểu hội tụ; bỏ hai báo cáo bán hàng (T98, T99)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `types.ts`: `QuyTrinhDef.hoiTuFree` (sơ đồ hội tụ riêng cho gói Free), `NutQT.noi` (chữ trên mũi tên từ ô trước tới ô này trong làn).
- `QuyTrinhScreen.tsx`: gói Free có `hoiTuFree` thì dùng thay sơ đồ chung; ô có `noi` vẽ mũi tên kèm chữ trước ô.
- `ban-hang/quy-trinh.ts`: làn Bán hàng từ FABi gồm Đơn POS từ FABi, mũi tên chữ đồng bộ, Xuất bán POS; khối Báo cáo gồm Sổ doanh thu bán hàng 3.2.5, Báo cáo bán hàng 3.2.1, Báo cáo doanh thu 3.2.3. Ba báo cáo đang khoá ở gói Free nên chưa hiện; T97 của Trum mở cho Free thì tự hiện.
- T99 `plan.ts`: `DA_BO` bỏ 3.2.1 Báo cáo bán hàng, 3.2.3 Báo cáo doanh thu khỏi danh sách tính năng ở mọi gói. Liên kết cũ (thanh bên, Tổng quan, Báo cáo tài chính, danh mục hàng hoá) trỏ sang 3.2.5. Cấu hình hai báo cáo trong `ban-hang/index.ts`, `bao-cao/danh-sach.ts` để nguyên vì không còn màn dùng; `danh-sach.ts` Trum đang sửa (T97).
- `app.css` mục cuối T98: `.qt-ht-noi`, chữ 11px màu nhạt, mũi tên cùng màu đường nối sơ đồ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Gói Free: sơ đồ một làn về khối Báo cáo (hiện chỉ có Tất cả báo cáo), mũi tên đồng bộ rõ, chữ nhỏ mờ. Gói Standard giữ sơ đồ trục ngang cũ.
- T99: màn Tất cả báo cáo gói Pro, nhóm Kế toán bán hàng còn 3 báo cáo (3.2.2, 3.2.4, 3.2.5); kiểm nhanh mở đủ màn, không lỗi.

## Dở dang, việc tiếp theo

- T97 của Trum định mở 3.2.1, 3.2.3 cho gói Free; T99 đã bỏ hai mã này, cần báo Trum. Báo cáo khác cho khối Báo cáo gói Free thì thêm vào `hoiTuFree.ra` ở `ban-hang/quy-trinh.ts`.

## Bẫy, quyết định mới

- Không.
