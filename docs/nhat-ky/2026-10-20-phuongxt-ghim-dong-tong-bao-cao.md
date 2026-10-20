# Ghim dòng tổng cộng, dòng đầu kỳ khi cuộn báo cáo (T494)

- Ngày: 20/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/bao-cao/ToGiay.tsx`: màn xem bảng dữ liệu báo cáo (web) gắn class `bc-dong-ghim` cho các dòng tổng `_t` liền nhau cuối bảng (`dongTongBang`), `bc-dong-ghim-tren` cho các dòng `_b` đầu bảng có chữ "đầu kỳ" (Tồn đầu kỳ, Số dư đầu kỳ). `useLayoutEffect` đo cao từng dòng, đặt biến `--ghim-duoi`, `--ghim-tren` để nhiều dòng xếp chồng không đè nhau; dòng đầu kỳ nằm dưới tiêu đề cột.
- Cuối `src/styles/app.css`, mục T494: ô của hai loại dòng trên `position: sticky`, nền `--giay-tong`.
- Điện thoại đã ghim dòng tổng từ trước (`.m-sbc-bang-wrap ... tr.t`), không sửa.

## Đã kiểm

- Sổ quỹ tiền mặt (`#/app/bao-cao/2-2-1`, 1440x900): cuộn giữa bảng, hai dòng Cộng phát sinh, Số tồn cuối kỳ dính sát đáy khung, dòng Số tồn đầu kỳ dính ngay dưới tiêu đề cột.
- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
