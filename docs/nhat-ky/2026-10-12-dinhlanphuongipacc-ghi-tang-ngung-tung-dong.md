# Thẻ chi phí: chỉ còn Ghi tăng, ngày bắt đầu và ngừng phân bổ theo dòng, link chứng từ gốc (T159)

- Ngày: 12/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ccdc/the-phan-bo.tsx`: kiểu thẻ `the` có `goi: []`, mọi gói không còn nút ghi tăng từng thẻ (kiểu này chỉ còn dùng để mở thẻ có sẵn, tạo thẻ từ phiếu chi).
- `ccdc/index.ts`, `ccdc/GhiTangHangLoat.tsx`: Ghi tăng hàng loạt đổi tên thành Ghi tăng, là nút chính ở mọi gói; menu còn Ghi tăng, Thẻ chi phí phân bổ dư đầu kỳ. Tiêu đề form: Ghi tăng thẻ chi phí phân bổ.
- `ccdc/the-phan-bo.tsx`: bỏ Ngày bắt đầu phân bổ, công tắc Ngừng phân bổ ở Thông tin chung. Mỗi dòng chi tiết có `ngayPb`, `ngung`, `ngayNgung`. Khi sửa thẻ có cột tích Ngừng phân bổ; có dòng tích thì hiện cột Ngày ngừng phân bổ (Free, Pro) hoặc Tháng ngừng phân bổ (Standard, Plus: gõ mm/yyyy, lưu ngày cuối tháng). Kiểm khi lưu: ngày ngừng sau hoặc bằng ngày bắt đầu phân bổ của dòng. Thẻ cũ chưa có `ngayPb` ở dòng thì lấy `ngayPb` của thẻ.
- `ccdc/the-phan-bo.tsx`: Thông tin mua của thẻ ghi tăng chỉ xem, số chứng từ là link mở chứng từ gốc; thẻ dư đầu kỳ vẫn nhập tay.
- `ccdc/index.ts`: thẻ mẫu có `ngayPb` theo dòng và chứng từ gốc (`GOC_MAU`) trỏ tới phiếu chi, uỷ nhiệm chi mẫu có sẵn ở Thu, chi tiền.
- File dùng chung: `danh-muc/truong-dm.ts` thêm tham số `goi` cho `bang(v, doi, goi)`; `ui/generic/CatalogScreen.tsx` truyền `s.goi`.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py --loai giao-dien` cho `the-phan-bo.tsx`, `index.ts`, `GhiTangHangLoat.tsx`, `truong-dm.ts`: sạch.
- Thử tay trên trình duyệt: Free, Pro nút Ghi tăng mở form hàng loạt; Free tích ngừng dòng 2 hiện cột ngày, gõ ngày trước ngày bắt đầu thì báo lỗi; Plus hiện Tháng ngừng phân bổ 10/2026, tab Đã phân bổ ngừng từ kỳ 31/10/2026; bấm UNC2610-0252 ở Thông tin mua mở đúng phiếu.
- `python tools/xuat_bao_cao_he_thong.py`: không chạy được trên máy này, báo thiếu `build_present` (script cần thư mục `Present/tools` nằm ngoài repo). File Excel báo cáo chưa làm mới, người có thư mục đó chạy lại.

## Dở dang, việc tiếp theo

- Chờ Trum hoặc người dùng chốt: tháng ngừng 10/2026 hiện tính là không phân bổ tháng 10 (ngừng từ kỳ 31/10). Muốn vẫn phân bổ tháng 10 thì so sánh kỳ `>` ngày ngừng thay vì `>=` trong `lichDong`.
- Phiếu chi mẫu chỉ có từ 24/09/2026, nên thẻ mẫu ghi tăng tháng 1 đến 8 trỏ tạm tới phiếu muộn hơn ngày ghi tăng.

## Bẫy, quyết định mới

- Không.
