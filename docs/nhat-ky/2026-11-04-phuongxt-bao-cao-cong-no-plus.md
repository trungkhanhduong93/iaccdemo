# Báo cáo công nợ ở tab Báo cáo Thu chi gói Plus (T735)

- Ngày: 04/11/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/types.ts`: `QuyTrinhDef` thêm trường `baoCaoPlus: { them, bo }`, khai báo cáo gói Plus thêm và bỏ ở tab Báo cáo phân hệ.
- `src/modules/bao-cao/cuaPhanHe.ts`: `baoCaoCuaPhanHe` ở gói Plus lấy thêm `them`, bỏ `bo`, kể cả báo cáo có sẵn trong nhóm phân hệ. Khối Sổ sách, báo cáo cuối sơ đồ hội tụ lấy cùng danh sách này (T731), nên đổi theo.
- `src/modules/tien/quy-trinh.ts`: gói Plus thêm Công nợ khách hàng (`ban-hang/3-2-9`), Công nợ nhà cung cấp (`mua-hang/4-2-3`), bỏ Sổ công nợ S4a-DNSN (`2-2-5`).
- Gói Standard, Pro không đổi. Lúc đầu làm nhầm cho gói Standard, đã trả lại bản cũ trước khi commit.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở tab Báo cáo Thu chi bằng script: Standard 3 báo cáo như cũ, Plus 6 báo cáo (Sổ quỹ, Sổ ngân hàng, Tổng hợp quỹ tiền, Báo cáo dòng tiền, Công nợ khách hàng, Công nợ nhà cung cấp), Pro không đổi.

## Dở dang, việc tiếp theo

- Không. Sổ công nợ vẫn xem được ở màn Báo cáo chung gói Plus.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần `Present/tools` ở thư mục cha của repo và file Excel `Dự kiến tính năng IACC Cloud.xlsx`, máy PhuongXT không có.

## Bẫy, quyết định mới

- Sổ công nợ 2.2.5 thuộc nhóm báo cáo Thu chi, nên tab Báo cáo Thu chi lấy nó từ nhóm phân hệ chứ không chỉ từ `baoCao` của sơ đồ. Xoá khỏi `baoCao` như T729 không đủ, phải lọc trong `baoCaoCuaPhanHe`.
