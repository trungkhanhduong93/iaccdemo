# Điện thoại: dòng nâng cấp gói, quỹ thẳng hàng, trang chủ báo đang đồng bộ (T138, T687)

- Ngày: 30/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong phần này, T138 vẫn Dở dang

## Đã làm

- `src/modules/onboarding/KhoiTaoFabi.tsx`: dòng "Dễ dàng nâng cấp… Plus… Pro…" hiện cả trên điện thoại, ở trang 2.
- `src/styles/app.css` (mục T138 điện thoại): `.ktf-pop .ktf-pttt` thành lưới, hai dòng dùng subgrid nên mũi tên, tên quỹ thẳng hàng; khoảng cách đặt ở khung cha, cột mũi tên `auto` để không đè chữ.
- `src/modules/home/NhacDonViMoi.tsx`: chip lợi nhuận đổi "Đang đồng bộ, tạm tính" thành "Đang tính toán" (web và điện thoại).
- `src/ui/mobile/MTrangChuStandard.tsx`: nối `useDongBoFabi` như bản web: doanh thu, chi phí, quỹ tăng dần; dòng Doanh thu có `DongDongBo`; thẻ Quỹ tiền có một dòng gộp phiếu thu mọi quỹ (vòng quỹ điện thoại là SVG, không có dòng từng quỹ).
- `src/styles/app.css` cuối file: mục T687 điện thoại `.m-tcf-kqkd-hang.co-db`, `.m-tcf-db-quy`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` 3 file tsx: 0 ĐỎ.
- Trình duyệt 375x812: đo vị trí cột hai dòng quỹ trùng nhau, cách mũi tên 10px; trang chủ hiện "Đang đồng bộ 1.948 / 3.850 chứng từ" ở Doanh thu và "50 / 63" ở Quỹ tiền. Chưa nhìn trọn thẻ Quỹ tiền vì popup chào mừng che.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
