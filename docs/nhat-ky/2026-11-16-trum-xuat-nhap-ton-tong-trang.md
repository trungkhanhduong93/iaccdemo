# Xuất nhập tồn gói Standard, Tổng trang ở Bảng dữ liệu báo cáo (T865-T867)

- Ngày: 16/11/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code và review
- Trạng thái cuối phiên: Xong

## Đã làm

- T865: `src/modules/kho/XuatNhapTon.tsx`, gói Standard bỏ `nhom` ở 4 cột số lượng, tên cột là Đầu kỳ, Nhập trong kỳ, Xuất trong kỳ, Cuối kỳ. Tiêu đề còn 1 tầng ở màn, tờ in, Excel.
- T866: cùng file, gói Standard có dòng Tổng cộng cộng 4 cột số lượng. Gói Plus, Pro cộng thêm cột số lượng bên cạnh cột giá trị.
- T867: `src/ui/bao-cao/ToGiay.tsx`, Bảng dữ liệu luôn hiện thanh phân trang (100, 200, 500). Báo cáo có dòng tổng thì ghim cuối mỗi trang dòng Tổng trang, rồi dòng tổng cả báo cáo. Báo cáo chỉ 1 dòng tổng thì dòng đó đổi nhãn thành Tổng báo cáo. Báo cáo nhiều dòng tổng (Cộng phát sinh, Số dư cuối kỳ) giữ nguyên các dòng đó.
- CSS mục T867 cuối `src/styles/app.css`: nền, chữ đậm 2 dòng tổng.
- Sửa QD60, QD78 theo chốt của Trum.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Review chéo (pre-push-qa, Playwright): XANH. Đã soát Xuất nhập tồn gói Standard và Pro, Sổ quỹ (nhiều dòng tổng), 3.2.8 trang 2, 5.2.5 không dòng tổng, tờ in và Excel không có Tổng trang. Ảnh ở `backup/review-T865/`.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD60: Bảng dữ liệu có Tổng trang và Tổng báo cáo, thanh phân trang luôn hiện.
- QD78: gói Standard có dòng tổng số lượng, Trum chốt dù khác đơn vị tính.
