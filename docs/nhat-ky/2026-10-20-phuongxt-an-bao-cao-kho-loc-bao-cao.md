# Ẩn báo cáo kho gói Free, bộ lọc báo cáo, thẻ gói thuê bao, quy trình kho (T506, T507, T508, T509)

- Ngày: 20/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T506: gói Free ẩn Thẻ kho 5.2.1 khỏi danh sách báo cáo, menu, tìm kiếm (vẫn mở được khi bấm hàng ở Xuất nhập tồn); ẩn hẳn Tổng hợp xuất kho 5.2.11, Chi tiết xuất kho 5.2.12. Hai danh sách mới `CHI_MO_TU_BC_GOI`, `AN_BC_GOI` trong `src/modules/bao-cao/danh-sach.ts`, áp ở `hienMan` (`src/app/registry.ts`), `TrungTam.tsx`, `MBaoCaoTheoDoi.tsx`. Thẻ "Mặt hàng giá vốn cao" trang chủ Free đổi link sang Xuất nhập tồn.
- T507: màn Gói thuê bao, dòng Chế độ kế toán của mỗi gói hiện đủ các thông tư trong `CHE_DO_HOP_LE` (Standard: TT58, TT152; Plus, Pro: TT133, TT99). `GoiThueBao.tsx`, `MGoiThueBao.tsx`.
- T508: bộ lọc màn xem báo cáo (máy tính) bỏ ô Tìm trong báo cáo, bỏ bộ lọc Đơn vị tính tự sinh; Ẩn dòng không phát sinh mặc định bật, chỉ áp cho báo cáo có `anKhongPS`. `ReportScreen.tsx`, `tuyChinhBC.ts`.
- T509: quy trình kho gói Free bỏ bước Theo dõi nhập xuất. `src/modules/kho/quy-trinh.ts`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi, chạy lại sau khi lấy bản mới của Trum.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Chưa bấm tay trên trình duyệt.

## Dở dang, việc tiếp theo

- Không. Có thể hỏi PhuongXT: bộ lọc báo cáo bản điện thoại có làm giống T508 không; Tổng hợp, Chi tiết nhập kho gói Free có ẩn luôn không.

## Bẫy, quyết định mới

- Không.