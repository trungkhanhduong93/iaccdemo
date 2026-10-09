# Phân hệ Báo cáo, chế độ kế toán, mẫu in (T47)

- Ngày: 09/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity và Claude Code làm từng đợt
- Trạng thái cuối phiên: Xong

## Đã làm

Kế hoạch ở `docs/ke-hoach-bao-cao.md`, Trum duyệt theo mặc định 17 điểm (QD31). Mỗi đợt một commit.

- Đợt 1: tách chế độ kế toán khỏi gói. `src/app/che-do.ts`, `cheDo` trong phiên, chọn ở Cấu hình kế toán và Khởi tạo.
- Đợt 2: phân hệ Báo cáo, Trung tâm báo cáo, ô đổi báo cáo cùng phân hệ, đường dẫn cũ tự chuyển (`src/modules/bao-cao/`, `registry.ts`, `Screen.tsx`).
- Đợt 3: tờ A4 chia trang, zoom, khổ, in (`src/ui/bao-cao/ToGiay.tsx`).
- Đợt 4: mẫu chuẩn theo chế độ: Mẫu số, căn cứ, hàng ký hiệu cột, cộng chuyển trang, ô ký, số hiệu tài khoản TT99 (`danh-sach.ts`, `so-cai.ts`).
- Đợt 5: 17 mẫu in chứng từ, hộp in, In ở form, dòng, hàng loạt (`mau-in.ts`, `duLieuIn.ts`, `InChungTu.tsx`, `docSoTien`).
- Đợt 6: tiện ích Thiết kế mẫu in 11.11, mẫu riêng, lõi tuỳ chỉnh `src/ui/thiet-ke/`.
- Đợt 8: 10 sổ theo thông tư trong `BO_SUNG`, mở báo cáo TSCĐ cho Plus, ẩn sổ không áp dụng ở gói cao.
- Đợt 9: xuất Excel (exceljs), CSV, PDF, HTML, XML.
- Đợt 7 và 10 làm chung: bộ lọc riêng từng báo cáo, khung Tuỳ chỉnh (cột, gom nhóm, người ký, cỡ chữ) làm một lớp chung ở `ReportPaper`.
- Tài liệu: KIEN-TRUC, QD31, BAY, CHANGELOG.

## Đã kiểm

- `npm run typecheck`, `npm run build` sau từng đợt: không lỗi.
- `python tools/kiem_tra.py` bản đủ 4 gói sau các đợt 1, 2, 4, 8 và cuối phiên: `Không có lỗi.`
- Đối chiếu số: sổ tiền vay 2.2.6 = dư 341 trên cân đối số phát sinh (600.000.000); sổ chi tiết tiền 2.2.7 = 1111 + 1121 cuối kỳ (1.566.208.181); sổ doanh thu 3.2.5 = báo cáo doanh thu 3.2.3 tháng 9 (2.786.386.000 và thuế 229.598.205); vốn 411 = 1.500.000.000.
- Xuất thử Excel kết quả kinh doanh gói Pro: đủ đầu trang, Mẫu số B02-DN, hàng ký hiệu cột, số là kiểu số, ô ký.
- Ký hiệu mẫu chưa đối chiếu văn bản gốc, chưa có kế toán trưởng duyệt (T04).

## Dở dang, việc tiếp theo

- Không. Việc mở: T04 duyệt ký hiệu mẫu; T33 Trum cập nhật Excel cho 10 mã trong `BO_SUNG` rồi xoá các dòng đó.

## Bẫy, quyết định mới

- QD31 trong `docs/QUYET-DINH.md`, QD08 ghi bỏ ý "chưa làm mục Báo cáo chung".
- `docs/BAY.md`: vòng import làm sập app, khung đo ẩn trong tờ báo cáo, hai agent chạy script kiểm cùng lúc.
