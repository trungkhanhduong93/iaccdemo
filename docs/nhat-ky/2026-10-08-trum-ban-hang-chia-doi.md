# Màn chứng từ bán hàng 3.1.1 chia đôi như 3.1.2 (T29)

- Ngày: 08/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity (gemini-3.8-flash-high) sửa code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/ban-hang/ChungTuBanHang.tsx`: hàm `DanhSach` dựng lại theo khung `page-voucher` của `VoucherScreen`. Nửa trên là danh sách có phân trang 20 dòng, nửa dưới là chi tiết chứng từ đang chọn. Bấm dòng thì đổi chi tiết, đúp chuột hoặc nút "Xem chi tiết" thì mở form.
- Tách thân 4 tab của form (Hàng bán, Hạch toán hoặc Ghi sổ, Thanh toán, Đơn POS gốc) thành `NoiDungTab`. Form và khung dưới cùng dùng component này, form hiển thị như cũ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: in `Không có lỗi.`
- Playwright ở 1440x900: `.main` không cuộn dọc. Bấm dòng 2 thì khung dưới hiện "Chi tiết BH2609-Q5-30". Đúp chuột mở form "Chứng từ bán hàng BH2609-Q5-30", Esc về `/app/ban-hang/3-1-1`.

## Dở dang, việc tiếp theo

- Không.
- Ở 1440px, cột Trạng thái của 3.1.1 và cột Xuất hoá đơn của 3.1.2 bị cắt mép phải, phải cuộn ngang trong bảng mới thấy đủ.

## Bẫy, quyết định mới

- Không.
