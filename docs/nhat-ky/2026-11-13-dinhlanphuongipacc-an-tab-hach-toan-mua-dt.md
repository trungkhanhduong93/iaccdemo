# Ẩn tab Hạch toán phiếu mua điện thoại ở gói dưới Pro (T820)

- Ngày: 13/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MXemPhieu.tsx` (`dsTab`, nhánh `nhomMb === 'mua'`): tab Hạch toán chỉ hiện khi `kieu === 'noco'` (chế độ Nợ/Có, gói Pro), như bản web `ChungTuForm.tsx` (T726). Trước đây chỉ ẩn khi `kieu === 'khong'`, nên gói Plus doanh nghiệp TT58 (`kieu === 'so'`) vẫn có tab.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Script Playwright tạm (390x844) mở phiếu đầu tiên ở `mua-hang/4-1-1`: gói PL có Chi tiết, Lịch sử; gói PR có Chi tiết, Hạch toán, Lịch sử.

## Dở dang, việc tiếp theo

- Không.
- Loại phiếu khác trên điện thoại cùng lỗi: xem phiếu thu chi (`MXemPhieu.tsx`, nhánh `laTien`) gói Plus TT58 còn tab "Bút toán (n)", tab Chi tiết còn khối HẠCH TOÁN (điều kiện `s.goi !== 'S'`, kể cả Plus hộ kinh doanh); lập phiếu thu chi (`MLapPhieu.tsx` `coHachToan`) còn khối Hạch toán. Phần này nằm trong T734 (thu chi điện thoại gói Plus như Standard), chưa sửa, chờ người dùng.
- Phiếu kho, kiểm kê trên điện thoại không có tab Hạch toán, đúng.
- `MXemPhieu.tsx` Trum đang giữ ở T497, T498, T552: commit chỉ đổi 1 dòng.

## Bẫy, quyết định mới

- Không.
