# Khung lý do mở khoá sổ lên ngay dưới nút (T327)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/tong-hop/KhoaSoFree.tsx`: khung Mở khoá tháng (ô lý do, nút Huỷ, Mở khoá) chuyển từ cuối cột trái lên ngay dưới hàng nút Mở khoá, Khoá sổ ở đầu trang; ô lý do tự chọn sẵn để gõ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở Hệ thống › Khoá sổ gói Free trên localhost, bấm Mở khoá tháng 8/2026: khung lý do hiện ngay dưới hàng nút, trên dòng Đã khoá sổ đến hết tháng.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
