# Báo cáo trên sơ đồ quy trình gói Free; màn chi tiết trang chủ chỉ cuộn danh sách (T262, T263)

- Ngày: 15/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

T262, báo cáo trên sơ đồ quy trình gói Free (gói khác giữ nguyên):

- `src/modules/types.ts`: thêm `raFree` (khối báo cáo riêng gói Free của sơ đồ hội tụ, làn giữ nguyên). `QuyTrinhScreen.tsx` thay khối `ra` khi gói Free có `raFree`.
- Thu chi (`tien/quy-trinh.ts`): Sổ quỹ tiền mặt, Sổ ngân hàng, thêm Công nợ nhà cung cấp (`mua-hang/4-2-3`).
- Mua hàng (`mua-hang/quy-trinh.ts`): Bảng kê mua hàng theo hàng hoá (4-2-7), Báo cáo xuất nhập tồn (kho/5-2-3), Tổng hợp nhập kho (5-2-9), Chi tiết nhập kho (5-2-10), Công nợ nhà cung cấp (4-2-3). "Tổng hợp nhập, chi tiết nhập" dùng bản kho vì gói Free mở được.
- Bán hàng (`ban-hang/quy-trinh.ts`, `hoiTuFree.ra`): bỏ Sổ doanh thu bán hàng, thay bằng Báo cáo xuất nhập tồn, Tổng hợp xuất kho (5-2-11), Chi tiết xuất kho (5-2-12).
- Kiểm kê (`kho/quy-trinh.ts`, `baoCaoFree` ở khung Báo cáo): xuất nhập tồn, Báo cáo kiểm kê (5-2-15), tổng hợp, chi tiết xuất kho, tổng hợp, chi tiết nhập kho.

T263, màn chi tiết mở từ trang chủ Free (máy tính):

- `ChiPhiThang.tsx`, `LichSuQuy.tsx`, `ChiPhiNvl.tsx`: trang thêm lớp `cpt-trang`, phần dưới thẻ tổng bọc trong `cpt-cuon`. Phần đầu (quay lại, tiêu đề, Excel, lập phiếu) và thẻ tổng đứng yên, chỉ `cpt-cuon` cuộn.
- Chi phí NVL xem một chi nhánh: hai tab, dòng Cách tính, nút Đổi cách tính cũng đứng yên, chỉ bảng (`.tbl-wrap`) cuộn, dòng tiêu đề cột dính trên.
- `app.css`: mục T263 cuối file.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` `kiem_van.py` 4 file quy-trinh: sạch.
- Bản dev gói Free: 4 sơ đồ hiện đúng danh sách báo cáo; gói Plus giữ báo cáo cũ. Lịch sử thu chi Vietcombank cuộn 600px, tiêu đề, thẻ số dư đứng yên; Chi phí NVL Lê Lợi cuộn bảng, tab và Cách tính đứng yên (cả tab tiêu hao). Đã trả phiên về Phố Mây gói Plus.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: script cần file Excel nguồn chỉ có trên máy Trum.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
