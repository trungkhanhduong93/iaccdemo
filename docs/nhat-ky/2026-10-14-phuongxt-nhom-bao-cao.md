# Nhóm báo cáo theo gói, nhóm Công nợ, KQKD gói Free, Sổ chi phí lý do (T216 đến T221)

- Ngày: 14/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T216: gói Free tạm ẩn Bán hàng theo ngày, Tổng hợp, Chi tiết bán hàng, Công nợ khách hàng: `goi: ['S', 'PL', 'PR']` ở `baoCaoMoi` (`src/modules/ban-hang/index.ts`). Sổ doanh thu 3.2.5 ở nhóm Sổ sách giữ nguyên.
- T217: nhóm báo cáo Công nợ riêng sau Mua hàng (`NHOM_CONG_NO` ở `bao-cao/danh-sach.ts`): 4.2.3 rồi 3.2.9, rời nhóm Mua hàng, Bán hàng. `TrungTam.tsx` (`layNhomBaoCao`) chèn nhóm, `registry.ts` thêm màn `nhom-cong-no` và luật hiện nhóm, `SidebarFlyout.tsx` thêm mục Công nợ.
- T218: `AN_NHOM_BC` (`danh-sach.ts`): gói Free ẩn hẳn nhóm Bán hàng, Kê khai thuế ở màn Báo cáo, menu phụ, tab Báo cáo của phân hệ (`registry.ts` `conBaoCao`).
- T219: `DAU_NHOM_BC` (`danh-sach.ts`): nhóm Kho đưa Xuất nhập tồn lên trước Thẻ kho; `TrungTam.tsx` xếp theo danh sách này.
- T220: `dongKqkd` (`tong-hop/BaoCaoTaiChinh.tsx`) gói Free TT152: Chi phí NVL, Chi phí trong tháng, dòng mới Chi phí phân bổ hàng tháng (`cp.ccdc + cp.khauHao`, tách khỏi chi phí trong tháng), bỏ Thu nhập, chi phí khác khỏi bảng và lợi nhuận; ghi chú đầu báo cáo đổi theo.
- T221: Sổ chi phí 10.4.3 (`bao-cao/so-bo-sung.ts`) thêm cột Lý do, dữ liệu mẫu gán lý do chi; `danh-sach.ts` thêm bộ lọc Lý do (danh mục lý do chi) và gom nhóm theo lý do.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` các file đã sửa: Sạch.
- Trình duyệt: gói Free màn Báo cáo còn Thu chi, Mua hàng, Công nợ (1), Kho, Chi phí phân bổ, Tổng hợp; gói Plus có Bán hàng (3), Công nợ (2) sau Mua hàng, trang `nhom-cong-no` mở được; nhóm Kho Xuất nhập tồn đứng đầu; KQKD gói Free tháng 9: chi phí trong tháng 1.322.250.000 = 1.372.100.000 − 49.850.000, lợi nhuận 431.227.000 = 432.977.000 − 1.750.000; Sổ chi phí lọc Chi trả lương còn 3 dòng, tổng 166.000.000.

## Dở dang, việc tiếp theo

- KQKD gói Free: lợi nhuận lệch Tổng quan đúng bằng thu nhập, chi phí khác (PhuongXT chọn bỏ khoản khác).
- KQKD gói Plus (TT133) vẫn báo "Báo cáo chưa có mẫu" như trước, không thuộc việc này.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: script cần file Excel tính năng và `Present/tools` chỉ máy Trum có.

## Bẫy, quyết định mới

- Không ghi `docs/BAY.md`. Nhóm báo cáo ở màn Báo cáo sinh theo phân hệ (`layNhomBaoCao`, `nhom-<khoá phân hệ>`); nhóm không theo phân hệ như Công nợ phải thêm cả ở `layNhomBaoCao` và `registry.ts` (`conBaoCao`), không thì trang nhóm bị ẩn.
