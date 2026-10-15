# Ẩn nhóm báo cáo không có báo cáo (T252)

- Ngày: 15/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/bao-cao/TrungTam.tsx`: cột nhóm bên trái bỏ nhóm có 0 báo cáo hiện được; danh sách nhóm bỏ nhóm trống cả khi không tìm kiếm (trước vẫn hiện kèm dòng "Chưa có báo cáo"); bỏ dòng "Chưa có báo cáo" trong nhóm.
- `src/ui/mobile/MBaoCao.tsx`: thẻ nhóm A, B, C… bỏ nhóm không có báo cáo, chữ cái đánh liền.
- Gói Free (sau T251) không còn nhóm Chi phí phân bổ. Gói khác báo cáo ngoài gói vẫn hiện kèm khoá nên gần như không đổi.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Bản dev gói Free: máy tính và điện thoại không còn nhóm Chi phí phân bổ. Đã trả phiên về gói Plus.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: script cần file Excel nguồn chỉ có trên máy Trum.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
