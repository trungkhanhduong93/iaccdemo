# Tuỳ chỉnh đầu phiếu, chân phiếu (T87)

- Ngày: 10/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `BangSua.tsx` `HopCotPhieu`: panel chia ba khối Đầu phiếu, Cột bảng chi tiết, Chân phiếu, mỗi khối đếm số mục đang hiện. Tham số mới `dsDau`, `dsChan`. Mục đầu phiếu, chân phiếu lưu chung danh sách ẩn với cột bảng, có tiền tố `dau:`, `chan:`.
- `ChungTuForm.tsx`: `hienDau`, `hienChan`. Ô bật tắt được: người giao dịch (nhãn theo loại phiếu), địa chỉ, nhân viên thực hiện, mã số thuế, hạn thanh toán, ghi chú; chỉ liệt kê ô phiếu đó có. Ẩn ô thì ô sau dồn lên; ẩn cả mã số thuế và hạn thanh toán thì bỏ cả hàng.
- Chân phiếu: dòng Tổng cộng cuối bảng (`khongTong`), khối tổng tiền dưới bảng; phiếu thu chi chỉ có Tổng tiền ở dải đáy.
- Bổ sung QD33: luật hai cột trái đều hàng không áp khi người dùng tự ẩn ô.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- Gói Plus, phiếu mua MH2610-0019: panel có 6 ô đầu phiếu, 12 cột, 2 mục chân phiếu. Tắt Địa chỉ, Mã số thuế, Hạn thanh toán, dòng Tổng cộng, khối tổng tiền: ô còn lại dồn lên, dòng tổng và khối tổng ẩn.
- Phiếu uỷ nhiệm chi: panel có 4 ô đầu phiếu, 5 cột, mục Tổng tiền ở dải đáy; tắt thì dải đáy hết Tổng tiền. Đã trả máy thử về mặc định.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- QD33 bổ sung ý T87.
