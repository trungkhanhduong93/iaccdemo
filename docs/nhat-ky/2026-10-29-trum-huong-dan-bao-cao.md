# Hướng dẫn nhanh cho màn báo cáo ẩn thanh tab (T674)

- Ngày: 29/10/2026
- Người: Trum, agent: Claude Code (phiên trên mây)
- Trạng thái cuối phiên: Xong

## Đã làm

- Nguyên nhân mất nút: mọi báo cáo giờ dùng đầu mới `bc-chon bc-dau-moi` (`DAU_BC_CU` trong `danh-sach.ts` đang rỗng), lớp này ẩn thanh tab. Lớp `bc-chon-phan-he` chỉ còn ở đầu cũ nên báo cáo mở từ tab Báo cáo của phân hệ cũng mất nút, cả gói Pro (vd `/app/tien/2-2-1`). Báo cáo là tab riêng của phân hệ (vd `/app/tong-hop/10-2-3` gói Pro) không có thanh chọn nên vẫn giữ thanh tab, nút ở đó như cũ.
- `src/modules/bao-cao/ThanhChon.tsx`: đầu mới bọc `.bc-dau-nut` trong `.bc-dau-phai`, nút la bàn đứng sau nút In. Đầu cũ chỉ gắn nút khi không ở trong phân hệ (phân hệ giữ thanh tab).
- `src/modules/bao-cao/TrungTam.tsx`: Tất cả báo cáo và nhóm báo cáo của phân hệ Báo cáo có nút sau ô Tìm báo cáo. Tab Báo cáo của phân hệ không gắn vì đã có nút ở thanh tab.
- `src/ui/HuongDanNhanh.tsx`: `NutHuongDan` thêm `ngoaiThanhTab`. Nút ngoài thanh tab đang hiện thì nút cuối thanh tab (bị ẩn theo thanh tab) thôi gắn, mỗi màn đúng một nút trong DOM. Bộ chung mới cho Tất cả báo cáo, nhóm báo cáo. Báo cáo ở `/app/bao-cao/<slug>` lấy Đi tiếp theo sơ đồ của phân hệ gốc (`sc.goc`); nội dung riêng vẫn tra theo phân hệ gốc như trước.
- `src/modules/tien/huong-dan.ts`: hướng dẫn riêng gói Standard cho Sổ quỹ tiền mặt 2-2-1, dùng cả ở `/app/tien/2-2-1` và `/app/bao-cao/2-2-1`. Bước 5 có nút Mở Thu chi tiền mặt.
- `src/styles/app.css`: mục cuối file (T674). Khung nằm ngoài thanh tab thì `top: 56px`, đặt lại `white-space: normal` vì đầu báo cáo không cho xuống dòng.
- `docs/QUYET-DINH.md`: QD86 ghi chỗ đặt nút khi thanh tab ẩn, theo lời Trum giao ở T674.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: "Không có lỗi." Máy trên mây trỏ `/opt/google/chrome/chrome` sang Chromium có sẵn, cài gói Python `playwright` 1.63.0.
- Script thử riêng (không đưa vào repo) đếm nút trong DOM, bấm mở khung, đo vị trí: đúng 1 nút ở `/app/bao-cao/tat-ca`, `/app/bao-cao/nhom-tien`, `/app/bao-cao/2-2-1`, `2-2-3`, `4-2-3`, `5-2-1`, `5-2-3`, `10-2-3` (gói Standard), `10-4-3`, `/app/tien/2-2-1` gói Standard và Pro, `/app/tong-hop/10-2-3`, `/app/tong-hop/bao-cao`, `/app/tien/2-1-1`. Khung ẩn thanh tab nằm sát đáy thanh trên, không che nút In, Xuất báo cáo, Tuỳ chỉnh; Đi tiếp sáng đúng ô của báo cáo. Chuyển Thu chi sang Sổ quỹ rồi quay lại, Esc đóng khung: không lỗi console.
- `python tools/kiem_van.py` cho `src/ui/HuongDanNhanh.tsx`, `src/modules/tien/huong-dan.ts` và nhật ký này: sạch. `CHANGELOG.md`, `docs/QUYET-DINH.md`, `docs/luu-tru/TIEN-DO-xong.md`: không có mục ĐỎ, dòng mới thêm không bị nhắc.
- Bỏ qua `python tools/xuat_bao_cao_he_thong.py` theo lời Trum dặn: lệnh chỉ chạy được trên máy Trum. File Excel báo cáo chưa làm mới, chạy lại trên máy Trum.

## Dở dang, việc tiếp theo

- Chữ hướng dẫn Sổ quỹ tiền mặt, Tất cả báo cáo do Clau soạn, Trum hoặc PhuongXT duyệt lại trên bản online.
- Báo cáo chưa có mẫu theo chế độ đang chọn (vd `/app/bao-cao/10-2-3` ở gói Pro) chỉ hiện trang "Báo cáo chưa có mẫu", không có nút la bàn. Để nguyên vì màn không có gì để hướng dẫn.

## Bẫy, quyết định mới

- QD86 thêm một dòng. Không có bẫy mới.
