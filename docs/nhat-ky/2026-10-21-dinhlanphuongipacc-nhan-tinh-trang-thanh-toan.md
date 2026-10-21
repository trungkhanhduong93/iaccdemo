# Nhãn tình trạng thanh toán trên chi tiết phiếu mua hàng (T580)

- Ngày: 21/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ChungTuForm.tsx`: thanh Thanh toán của phiếu mua đã lưu có thêm nhãn Chưa thanh toán, Thanh toán một phần, Đã thanh toán, đặt sát lề phải, cùng dòng các ô thanh toán. Trạng thái lấy theo `ttTienTheoTra`, nhãn lấy theo `TT_TIEN.mua`, khớp cột trạng thái ở danh sách chứng từ.
- `app.css`: mục cuối file "Nhãn tình trạng thanh toán trên chi tiết phiếu mua (T580)", lớp `.ct-nhan-tt`: chữ 14px, nền màu nhạt, không có chấm tròn như `.stt`.
- Người dùng duyệt bản mẫu trên artifact trước khi sửa code: chỉ hiện nhãn, không ghi chữ "Tình trạng thanh toán", không ghi số còn nợ.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Mở phiếu MH2610-0022 gói PR trên trình duyệt: nhãn "Chưa thanh toán" hiện sát lề phải thanh Thanh toán.

## Dở dang, việc tiếp theo

- Không. Phiếu bán hàng chưa có nhãn này. Muốn thêm thì bỏ điều kiện `nhom === 'mua'`, dùng `TT_TIEN[nhom]`.

## Bẫy, quyết định mới

- Không.
