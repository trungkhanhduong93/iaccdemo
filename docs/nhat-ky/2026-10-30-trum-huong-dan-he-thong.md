# Hướng dẫn nhanh phân hệ Hệ thống (T685)

- Ngày: 30/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity viết code
- Trạng thái cuối phiên: Xong

## Đã làm

- Tạo `src/modules/he-thong/huong-dan.ts`: Hướng dẫn nhanh (QD86, tour QD88) cho 7 màn Người dùng, Vai trò và phân quyền, Nhật ký thao tác, Thông tin đơn vị, Cấu hình kế toán, Khoá sổ, Gói thuê bao. Không ghi `goi`, màn nào hiện ở gói nào theo `he-thong/index.ts`.
- Gắn `data-hd` cho chỗ tour khoanh: `HeThong.tsx`, `GoiThueBao.tsx`, `KhoaSoStandard.tsx`, hàm `NhatKyThaoTac` trong `TienIch.tsx`. Cấu hình kế toán thêm 2 thẻ `div` bọc khối định khoản, bảng đánh số; còn lại chỉ thêm thuộc tính.
- Soát nội dung với code màn, sửa 5 chỗ anti viết sai hoặc không có căn cứ.
- Chỗ đã sửa: bỏ gói Enterprise không có trong app, "xuất báo cáo" thành "xuất Excel" theo nhật ký mẫu, bỏ "Thông tư 152" đoán, bỏ 2 câu lưu ý không có trong code.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_van.py src/modules/he-thong/huong-dan.ts`: sạch.
- Script tour tạm (`%TEMP%\test_t685_tour.py`): bấm Hướng dẫn, đi hết bước ở 6 màn gói Pro và 4 màn gói Standard. Mỗi bước, tâm chỗ khoanh nằm trên đúng phần tử `data-hd`, bong bóng trong màn, không lỗi console. 10/10 màn đạt.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Chưa kiểm gói Plus riêng: màn Hệ thống của Plus giống Pro.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
