# Lỗi giao diện điện thoại: nút thêm mua hàng, quay lại, tab, phiếu thu chi, S1a, KQKD, Sổ quỹ (T555, T562-T568)

- Ngày: 21/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (làn Windows) code
- Trạng thái cuối phiên: Xong

## Đã làm

- T562: danh sách chứng từ mua hàng (`MChungTu.tsx`) dùng nút Thêm mới cùng class với Thu chi (`m-tc-fab m-nut-them-fab m-ds-fab`), có chữ "Thêm mới".
- T563: gốc lỗi là nút quay lại gọi `nav('/đường-dẫn')`, đẩy thêm 1 bước vào lịch sử nên back lặp A ↔ B; thẻ CCDC mở không đổi địa chỉ. Gom về `quayLaiMobile` trong `src/ui/mobile/quayLai.ts` (lùi 1 bước, hết lịch sử thì về màn cha bằng `replace`). Dùng ở `MChungTu`, `MDtThuChiDs`, `MDtThuChiLap` (nút Đóng, Huỷ), `MBaoCao`, `MBaoCaoDau`, `MSoBaoCao`, `MCcdc`. Thẻ CCDC mở bằng `?mo=<số thẻ>`.
- T564: hàng tab trong `MChungTu.tsx` đổi sang `.m-tc-tabs`, `.m-tc-tab-btn` như danh sách Thu chi.
- T565: phiếu thu chi lập mới và sửa, ô loại phiếu và ô cửa hàng chỉ hiện, không bấm đổi. Lập mới lấy cửa hàng đang chọn.
- T555: phần CHI TIẾT và nút Thêm dòng hiện ở mọi gói, trừ chuyển quỹ. Gói Free mỗi dòng chỉ Diễn giải, Số tiền. Từ 2 dòng ô Số tiền đầu phiếu khoá. Lưu `_dong` theo từng dòng thật.
- T566: thêm `tenBCNgan` trong `danh-sach.ts`, S1a hiện "Sổ doanh thu bán hàng" ở thanh đầu và danh sách báo cáo điện thoại. Thẻ tiêu đề, bản in, web giữ tên đủ.
- T567: báo cáo 10.2.3 điện thoại, khối chỉ tiêu nền trắng (lớp `m-bcd-1023`, cuối `app.css`).
- T568: Sổ quỹ, Sổ ngân hàng dùng thẻ `.m-stat-pill` như Lịch sử thu chi, số có "đ", bỏ dòng ngày và "Phát sinh trong kỳ".

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh` (dev cổng 5181, `KIEM_TRA_URL`): in "Không có lỗi."
- Chưa bấm thử bằng tay trên điện thoại thật luồng back nhiều màn. Trum xem trên https://iaccdemo.pages.dev.

## Dở dang, việc tiếp theo

- Không.
- Hộp chọn loại phiếu, chọn cửa hàng trong `MDtThuChiLap.tsx` (`moChonLoai`, `moChonCn`) giờ không còn nút mở. Dọn khi có việc đụng lại file này.
- `.m-tab-chu` còn dùng ở `MCcdc.tsx`, chữ tab CCDC vẫn cỡ cũ.

## Bẫy, quyết định mới

- Không.
