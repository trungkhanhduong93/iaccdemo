# Khởi tạo FABi chỉ mở bán gói Standard, tách Quản lý và Kê khai thuế (T663)

- Ngày: 26/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `plan.ts`: thêm `GOI_MO` (gói đang mở bán, hiện chỉ Standard), dùng chung cho popup khởi tạo và màn Gói thuê bao.
- `OnboardFabi.tsx`, bước 1: chỉ hiện gói trong `GOI_MO`, tiêu đề "Gói đang mở bán", dòng "Gói Plus, Pro sắp ra mắt. Xem so sánh gói" mở Gói thuê bao ở tab trình duyệt mới (`?chi-xem`, tab đó không hiện popup).
- Dưới thẻ gói có hai lớp: Quản lý kinh doanh luôn tích xanh; Kê khai thuế tích xanh hoặc cảnh báo vàng theo `KE_KHAI`. Standard kê khai được: HKD nhóm 1, nhóm 2 theo % doanh thu, doanh nghiệp theo % doanh thu. Không chặn đi tiếp.
- Doanh nghiệp thêm câu hỏi cách tính thuế GTGT, TNDN (lưu chung `ppHkd`). Đổi sang HKD nhóm 2 mặc định theo % doanh thu.
- Chọn nhóm HKD chia 2 hàng × 2 cột, bỏ nhãn "Theo doanh thu FABi" trong thẻ.
- Khung "Bạn sẽ có gì": đầu mục mới theo `DIEM_NOI_BAT.S`; sổ HKD ghi (S1a), (S2a) theo nhóm, nhóm 3, 4 ẩn; sổ S1-DNSN chỉ với doanh nghiệp; dòng Kê khai thuế chỉ hiện khi kê khai được; bỏ dòng chế độ kế toán (đã có nhãn).
- Danh sách tính năng gói ở khởi tạo: nhóm Thuế GTGT gọi là Kê khai thuế; kê khai được thì thêm Tờ khai thuế 6.2.3, không thì bỏ cả nhóm; số đếm đổi theo.
- `plan.ts`: `DOI_TEN` đổi tên 5.1.10 thành "Kiểm kê số lượng", 8.1.1 thành "Quản lý chi phí phân bổ nhiều kỳ" (đè tên Excel).
- `GoiThueBao.tsx`: gói chưa mở bán gắn nhãn "Sắp ra mắt", thay nút Nâng cấp bằng ô "Chưa mở bán".
- CSS cuối `app.css`, mục T663.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho `OnboardFabi.tsx`, `GoiThueBao.tsx`, `plan.ts`: sạch.
- `python tools/xuat_bao_cao_he_thong.py`: không chạy được trên máy PhuongXT, thiếu file nguồn `Dự kiến tính năng IACC Cloud.xlsx`. Báo cáo Excel chưa làm mới.
- Xem trên trình duyệt: HKD nhóm 1, 2, 3, doanh nghiệp theo hai cách tính thuế, link Xem so sánh gói, thẻ Gói thuê bao.

## Dở dang, việc tiếp theo

- Không.
- Màn ngoài gói (`src/modules/Screen.tsx`) vẫn có nút "Nâng cấp lên Plus/Pro" dẫn tới thẻ "Chưa mở bán". Màn khởi tạo cũ `KhoiTao.tsx` vẫn hiện đủ 3 gói.
- Trum cập nhật Excel tên 5.1.10, 8.1.1 thì xoá dòng trong `DOI_TEN`.

## Bẫy, quyết định mới

- Không ghi QD. PhuongXT chốt phạm vi kê khai của Standard, ghi trong chú thích `KE_KHAI` (`OnboardFabi.tsx`).
