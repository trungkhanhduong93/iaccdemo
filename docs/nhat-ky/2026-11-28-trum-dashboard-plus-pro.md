# Dashboard nhà hàng Plus, Pro theo bản mẫu (T956)

- Ngày: 28/11/2026
- Người: Trum, agent: Claude Code điều phối, 2 Antigravity (web, điện thoại)
- Trạng thái cuối phiên: Xong

## Đã làm

- Bản mẫu Trum chốt chép vào `docs/thiet-ke/T956-dashboard-plus-pro.html`.
- `soLieuDashboardNhaHang.ts`: kênh, cơ cấu chi phí, quỹ, nhóm hao hụt mới; `coCauThang(k, i)` gom 4 mục lớn + Khác (hao hụt 2 + Khác), màu đậm nhạt theo thứ hạng; `NGUON_HAO_HUT` cho hộp nguồn hao hụt; lợi nhuận cửa hàng lệch nhẹ theo tháng.
- `VanhKhuyenNhaHang.tsx` (mới): vành khuyên kèm bảng, `IconKpi` 4 biểu tượng thẻ số. Web và điện thoại dùng chung.
- `Charts.tsx`: `CotDuongChart`, `SparkDinhMuc` vẽ lại theo mẫu (cột bo tròn, dải tháng đang chọn, đường cong, tooltip cố định). Chỉ 2 dashboard nhà hàng dùng hai hàm này.
- `DashboardNhaHang.tsx` (anti A), `MDashboardNhaHang.tsx` (anti B): bố cục theo mẫu. CSS hai mục T956 cuối `app.css`.
- Claude sửa thêm: biểu đồ 13 tháng trên điện thoại bị kéo lên 520px (luật `.dnh-cv svg` của web), thêm `.m-app .dnh-cv svg { min-width: 0 }`; điện thoại tô tháng đang chọn.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: dừng ở ca T870 Thẻ kho (lỗi có sẵn, ghi ở T933), chưa in "Không có lỗi.". `kiem_tra.py` chưa có ca dashboard nhà hàng.
- Ca khói riêng (Playwright, gói PL và PR, khung 1440, 390, 360): đủ 4 vành khuyên, không tràn ngang, 0 lỗi console.
- So ảnh với bản mẫu khung 1440: số mọi khối khớp từng đồng. Phiên có định mức (NVL 32/32/31%, hao hụt 2,4%) ra định mức 31,8%, hao hụt vượt định mức 18.460.312 đ, 11/13 tháng, đúng như mẫu.
- `kiem_van.py` 3 file tsx: 0 ĐỎ.

## Dở dang, việc tiếp theo

- Không. Nhánh tạm `T956-chuan-bi` trên GitHub chỉ dùng để giao anti, xoá sau khi push `main`.

## Bẫy, quyết định mới

- Không.
