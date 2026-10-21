# Xem phiếu xuất, nhập điều chỉnh trên điện thoại (T603)

- Ngày: 21/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/mobile/MXemPhieu.tsx`, chỉ áp cho phiếu điều chỉnh (`laDc`):
  - Thẻ tổng quan: nhãn nguồn chứng từ cạnh tên cửa hàng như xem thu chi; bỏ Tổng thanh toán, bỏ ô Cửa hàng, Nguồn chứng từ.
  - Thông tin chứng từ: thêm dòng Tham chiếu, bấm mở phiếu kiểm kê gốc (`_thamChieu`, `_thamChieuDi`); Diễn giải đổi thành Ghi chú, nhãn trên, nội dung dòng dưới, cách xa dòng trên.
  - Danh sách chi tiết: bên phải chỉ số lượng kèm đơn vị, không đơn giá, số tiền, không in đậm.
  - Menu ba chấm chỉ còn Xuất Excel (báo "Đã xuất Excel" như xem thu chi).
- `src/styles/app.css`: mục cuối file (T603).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py src/ui/mobile/MXemPhieu.tsx`: Sạch.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không. Ghi chú: link xem trên máy phải có `#/`, vd `http://localhost:5180/#/app/kho/dieu-chinh`.
- Chưa chạy được `tools/xuat_bao_cao_he_thong.py`: máy thiếu file `Dự kiến tính năng IACC Cloud.xlsx`, báo cáo hệ thống chưa làm mới.
