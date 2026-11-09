# Lịch phân bổ thẻ dư đầu kỳ theo ngày bắt đầu làm việc (T782)

- Ngày: 09/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `app/session.tsx`: thêm `ngayLamViecHienTai()`, `SessionProvider` ghi lại Ngày bắt đầu làm việc (ô ở Hệ thống, Thông tin đơn vị, hàm `ngayLamViec` của T767, khác Ngày đầu năm tài chính) mỗi lần vẽ, cho hàm ngoài React dùng.
- `ccdc/the-phan-bo.tsx`: `ngayBd` của thẻ dư đầu kỳ luôn lấy Ngày bắt đầu làm việc, nên kỳ đầu của lịch là tháng của ngày đó. Số kỳ = Số tháng PB − Số tháng đã PB, mỗi kỳ = (Số tiền − Giá trị đã PB khai trên thẻ) ÷ số kỳ còn, kỳ cuối nhận phần lẻ (giữ như cũ).
- Cột Ngày bắt đầu PB của thẻ dư đầu kỳ chỉ xem, không gõ được nữa. Thẻ ghi tăng trong kỳ giữ nguyên.
- Điện thoại `MThePhanBo.tsx`: dùng `ngayBd` (xuất từ `the-phan-bo.tsx`) cho Ngày bắt đầu phân bổ ở chi tiết, dòng "Phân bổ: n tháng từ", lịch sử mẫu, kiểm khi lưu. Form sửa thẻ dư đầu kỳ hiện ngày chỉ xem, không mở lịch chọn ngày.
- Điện thoại, form sửa thẻ: ô số tiền, số tháng, ô ngày (ghi tăng, bắt đầu, ngừng phân bổ) đổi cùng kiểu phiếu thu chi: ô viền trắng cao 38px, "đ" và "tháng" nằm trong ô, ô ngày chữ xanh kèm mũi tên xuống (`ONgayO`, mục CSS T782 cuối `app.css`).
- Điện thoại, form Thêm thẻ chi phí (`MCcdc.tsx`, Trum đồng ý sửa dù đang giữ ở T552): ô Số tiền, Giá trị đã phân bổ, Số tháng, ô Ngày ghi tăng, Ngày bắt đầu phân bổ, Ngày chứng từ cùng kiểu phiếu thu chi. Thẻ dư đầu kỳ: Ngày bắt đầu phân bổ chỉ xem.
- Điện thoại, form Sửa thẻ dư đầu kỳ (`MThePhanBo.tsx`): mỗi mục hiện đủ Số tiền, Giá trị đã phân bổ, còn cần phân bổ, số tháng phân bổ, đã phân bổ, còn phân bổ, mỗi tháng, ngày bắt đầu như màn Thêm mới; mục Thông tin mua sửa được (Số chứng từ, Ngày chứng từ, Ghi chú). Ô số, ô ngày rộng 150px, nhãn vẫn nằm một dòng.
- Dữ liệu mẫu điện thoại thêm thẻ dư đầu kỳ TPBDK2512-0001 loại Chi phí trả trước (cùng số liệu bên web), để gói Free cũng có thẻ dư đầu kỳ thử.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trình duyệt: đặt Ngày bắt đầu làm việc 01/10/2026, thẻ TPBDK2512-0001 (120 tr, đã PB 60 tr, 24 tháng, đã PB 12 tháng) ra 12 kỳ từ 31/10/2026, mỗi kỳ 5.000.000.
- Điện thoại 375x812: thẻ TPB2601-0012 (dư đầu kỳ) hiện Ngày bắt đầu phân bổ 01/10/2026, còn 16 tháng, mỗi tháng 1.025.000.

## Dở dang, việc tiếp theo

- `tools/xuat_bao_cao_he_thong.py` lỗi thiếu module `build_present` trên máy này, chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.

## Bẫy, quyết định mới

- Không. Lưu ý: Ngày bắt đầu làm việc (`ngayLamViec`) khác Ngày đầu năm tài chính (`ngayDauNam`). Lúc đầu lấy nhầm `ngayDauNam` nên lịch vẫn chạy từ tháng 1; đã sửa. Form Thêm thẻ dư đầu kỳ trên điện thoại và dòng "PB từ" ở danh sách thẻ điện thoại cũng lấy `ngayLamViec`.
