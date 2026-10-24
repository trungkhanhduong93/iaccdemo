# Chặn sửa phiếu mua đã thanh toán trên điện thoại (T658)

- Ngày: 24/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MXemPhieu.tsx`: phiếu mua đã trả một phần hoặc trả đủ, bấm Sửa phiếu không vào màn sửa mà hiện hộp "Không sửa được", ghi số phiếu chi đã trả, nút Mở phiếu chi để xoá phiếu chi trước. Phiếu mẫu không có phiếu chi kèm thì chỉ báo, nút Đã hiểu.
- `daXoa.ts` (`soDaTra`): phiếu trả ngay mà phiếu chi, thu kèm đã xoá thì tính là chưa trả. Trước đây xoá phiếu chi rồi phiếu mua vẫn hiện Đã thanh toán. Hàm dùng chung nên màn web cũng hiện đúng theo.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Khổ 375px, gói S: MH2610-0014 (trả đủ) và MH2610-0017 (trả một phần) bấm Sửa phiếu hiện hộp báo kèm số phiếu chi; Mở phiếu chi mở đúng PC2610-0009; xoá phiếu chi xong phiếu mua về Chưa thanh toán, bấm Sửa phiếu vào màn sửa.
- `python tools/xuat_bao_cao_he_thong.py`: không chạy được, script import `build_present` mà repo không có file này. Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.
- Gói Plus, PR: phiếu đã ghi sổ không có nút Sửa phiếu (như cũ). Chưa xem trên điện thoại thật.

## Dở dang, việc tiếp theo

- Không. Màn web (`ChungTuForm.tsx`) chưa chặn sửa phiếu mua đã thanh toán, chưa làm vì PhuongXT chỉ nói điện thoại.

## Bẫy, quyết định mới

- Không.
