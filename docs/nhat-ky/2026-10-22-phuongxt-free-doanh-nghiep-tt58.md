# Gói Free, doanh nghiệp dùng TT58, báo cáo theo dõi S1-DNSN (T632)

- Ngày: 22/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/app/che-do.ts`: thêm `CHE_DO_DN_FREE` (TT58); `chuanHoaCheDo` nhận TT58 cho gói Free. `CHE_DO_HOP_LE.F` vẫn chỉ TT152 để màn khởi tạo không hiện ô chọn chế độ.
- `src/app/session.tsx`: thêm `chuanHoaFree`, chạy khi đọc phiên và mỗi lần `set`. Gói Free: hộ kinh doanh TT152; doanh nghiệp TT58, thuế GTGT, TNDN theo tỷ lệ % doanh thu (trường hợp 1). Phiên cũ đang Free doanh nghiệp TT152 tự chuyển sang TT58.
- `src/modules/he-thong/HeThong.tsx`, `src/ui/mobile/MHeThong.tsx`: Thông tin đơn vị gói Free chọn Doanh nghiệp thì Thông tư áp dụng hiện TT58, khoá; hai ô phương pháp thuế khoá ở "% doanh thu"; web hiện dòng "Trường hợp 1: S1-DNSN". Bỏ dòng "Quản lý lãi lỗ, không theo thông tư".
- `src/modules/bao-cao/danh-sach.ts`, `src/app/registry.ts`: thêm `anSoTT58GoiFree`, gói Free TT58 ẩn các sổ TT58 khác (S4c, S3b, S2b-DNSN...), chỉ giữ 3.2.5 S1-DNSN; báo cáo theo iFaster vẫn mở. Báo cáo theo dõi ở Kê khai thuế điện thoại chỉ còn S1-DNSN.
- `src/modules/tong-hop/BaoCaoTaiChinh.tsx`: Báo cáo kết quả kinh doanh gói Free giữ bản đơn giản một cột như cũ, không chuyển sang B02-DNSN.
- `src/modules/onboarding/OnboardFabi.tsx`: màn khởi tạo FABi, doanh nghiệp chọn gói Free thì chế độ TT58, mô tả gói đổi theo.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/modules/onboarding/OnboardFabi.tsx`: Sạch.
- Mở thử trên máy, gói Free, Phố Mây: Thông tin đơn vị web và điện thoại hiện TT58, khoá; Kê khai thuế điện thoại, Báo cáo theo dõi chỉ có "Sổ doanh thu bán hàng hoá, dịch vụ (S1-DNSN)". Đổi loại hình sang hộ kinh doanh vẫn TT152, sổ S1a-HKD. Đã trả phiên về Phố Mây gói Plus.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md` QD79: doanh nghiệp gói Free dùng TT58 trường hợp 1, PhuongXT chốt 22/10/2026.
