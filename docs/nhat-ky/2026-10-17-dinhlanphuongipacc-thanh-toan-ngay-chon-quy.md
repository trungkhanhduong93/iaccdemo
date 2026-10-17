# Thanh toán ngay chọn tiền mặt hoặc ngân hàng (T329)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/bao-cao/cong-no.tsx`: nút Thanh toán ngay ở báo cáo Công nợ nhà cung cấp (cột Thanh toán và hộp Lịch sử công nợ) đổi thành nút xổ 2 mục: Tiền mặt mở phiếu chi tiền mặt (`loai=chi`), Ngân hàng mở uỷ nhiệm chi (`loai=unc`). Cả hai vẫn điền sẵn nhà cung cấp, lý do CHI02, cửa hàng của dòng.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Trên localhost, báo cáo 4.2.3: bấm Thanh toán ngay hiện 2 mục; chọn Ngân hàng mở Chi ngân hàng, chọn cửa hàng xong có Quỹ ngân hàng, đối tượng là nhà cung cấp của dòng, lý do Thanh toán công nợ nhà cung cấp.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
