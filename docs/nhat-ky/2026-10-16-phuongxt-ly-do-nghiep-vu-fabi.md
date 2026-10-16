# Danh mục Lý do nghiệp vụ theo danh sách FABi (T269)

- Ngày: 16/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- PhuongXT gửi file `danh_sach_thu_chi (2).xlsx` (44 lý do FABi: mã, tên, IN/OUT) và chốt: thay danh mục bằng danh sách này, giữ 4 lý do hệ thống (Chi phí chờ phân bổ, Xuất huỷ hàng hỏng, Xuất dùng nội bộ, Nhập hàng khách trả lại), cờ "Là chi phí" theo đề xuất; sau đó đánh lại mã: thu THU01..THU10, chi CHI01..CHI35 theo thứ tự file, kho XK01, XK02, NK01; danh mục xếp thu, chi, kho.
- `src/data/mock.ts`: `LY_DO` mới; `LY_LA_CHI_PHI` 24 lý do chi (không tính thanh toán, công nợ nhà cung cấp, chuyển tiền nhà hàng, nộp thuế, trả nợ, tạm ứng, cho vay, trả vay, Chi tiền khác, TSCĐ, đầu tư mở rộng). Thêm `MA_LY_CHO_PHAN_BO` (CHI35); sơ đồ Chi phí phân bổ (`ccdc/quy-trinh.ts`) mở phiếu chi `?ly=` theo hằng này thay cho LD17.
- Đổi tên lý do cũ sang tên mới ở chỗ dùng làm lý do: `gen.ts` (đoán lý do theo diễn giải, thêm nộp thuế, điện, nước, internet, vận chuyển, quảng cáo, sửa chữa, phế liệu, đặt cọc; tài khoản đối ứng theo lý do), `ChungTuForm.tsx` (gợi ý lý do, lý do thanh toán), `so-bo-sung.ts` (Sổ chi phí mẫu), Chi phí trong tháng web và điện thoại (Thanh toán tiền lương, Chi tiền thuê nhà). Rút tiền ngân hàng nhập quỹ không còn, đoán thành Thu khác.
- `tools/kiem_tra.py`: bài 17A và T233 đổi "Chi trả lương" thành "Thanh toán tiền lương" (vẫn kiểm TK Nợ 334).

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` `kiem_van.py` mock, gen, Chi phí trong tháng: sạch.
- Bản dev gói Free: danh mục 45 dòng THU01..THU10, CHI01..CHI35; cột Là chi phí đúng; sơ đồ Chi phí phân bổ mở phiếu chi `?ly=CHI35`, lý do tự điền Chi phí chờ phân bổ; Chi phí trong tháng vẫn có số. Phiên ở Phố Mây gói Plus.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: script cần file Excel nguồn chỉ có trên máy Trum.

## Dở dang, việc tiếp theo

- Lý do mới có tài khoản riêng (nộp thuế, lãi vay, vay, cho vay, đặt cọc…) chưa khai tài khoản đối ứng, đang lấy mặc định 6422; cần kế toán trưởng chốt.

## Bẫy, quyết định mới

- Không.
