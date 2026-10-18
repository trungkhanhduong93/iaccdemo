# Tiêu đề cột nút trong hộp Cột hiển thị (T428)

- Ngày: 18/10/2026
- Người: Trum, agent: Antigravity
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/LocNangCao.tsx`: trong `HopCot`, thêm dòng tiêu đề cố định `.ds-hop-cot-tieu-de` nằm giữa đầu hộp và danh sách cột cuộn. Chữ nằm thẳng cột nút tương ứng: "Gom nhóm" (chỉ hiện khi có prop `gom`), "Đóng băng" (phủ cặp nút đóng băng trái, phải), "Hiện" (trên cột công tắc). Đổi title nút gom chưa bật thành "Gom nhóm theo cột này".
- `src/styles/app.css`: thêm mục cuối file "Tiêu đề cột nút trong hộp Cột hiển thị (T428)". Dòng cao 24px, viền dưới mảnh, chữ 10px màu phụ. Tinh chỉnh canh lề để tâm chữ trùng tâm nút với độ lệch < 1px.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh` (dev server cổng 5190): `Không có lỗi.`
- `python tools/kiem_van.py src/ui/LocNangCao.tsx`: Sạch (0 ĐỎ, 0 VÀNG).
- Playwright đo độ lệch tâm:
  - Thu chi (có gom): lệch tâm Gom 0.91px, Đóng băng 0.91px, Hiện 0.37px (chuẩn ≤ 3px).
  - Hàng hoá (không gom): lệch tâm Đóng băng 0.91px, Hiện 0.37px (chuẩn ≤ 3px).
  - Ảnh lưu tại `backup/T428-thu-chi.png`, `backup/T428-hang-hoa.png`.

## Dở dang, việc tiếp theo

- Không. Sẵn sàng tiếp tục T431 (vòng lặp nút back trên điện thoại) và T432 (báo cáo S1a-HKD điện thoại).

## Bẫy, quyết định mới

- Không.
