# Xem báo cáo gom nhóm dạng Tổng hợp, Chi tiết (T289)

- Ngày: 16/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/ui/bao-cao/tuyChinhBC.ts`:
  - `TuyChinhLuu` thêm `xemNhom` ('tongHop' | 'chiTiet'). Thiếu là chi tiết, lưu cùng tuỳ chỉnh báo cáo theo đơn vị.
  - `bienDoiBang` nhận `tongHop`. Đang gom nhóm và chọn Tổng hợp thì trả bảng mới: chỉ còn cột gom nhóm và các cột số (bỏ đơn giá), mỗi nhóm một dòng đã cộng.
  - Gom 2 cấp thì dòng cấp 1 in đậm kèm tổng, các dòng cấp 2 nằm dưới. Cuối bảng có dòng Tổng cộng. Dòng đầu, dòng tổng sẵn có của mẫu bỏ ở dạng này.
- `src/ui/generic/ReportScreen.tsx`:
  - `ReportToolbar` hiện nút chuyển Tổng hợp | Chi tiết ở đầu thanh khi báo cáo đang gom nhóm (Tuỳ chỉnh › Gom nhóm, báo cáo không khoá).
  - `ReportPaper` truyền `tongHop` vào cả bảng đang xem lẫn bảng xuất file.
- `src/styles/app.css`: mục cuối "Xem báo cáo gom nhóm dạng Tổng hợp, Chi tiết (T289)".

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` 2 file đã sửa: sạch.
- Trên máy, gói Plus, báo cáo Chi tiết mua hàng 4.2.1:
  - Gom nhóm theo Nhà cung cấp rồi bấm Tổng hợp: 7 dòng nhà cung cấp và dòng Tổng cộng 456.351.580, các cột Nhà cung cấp, Thành tiền, Chiết khấu, Tiền trước thuế, Thuế GTGT, Tổng tiền.
  - Thêm cấp 2 là Ngày: dòng nhà cung cấp in đậm, dưới là từng ngày.
  - Bấm Chi tiết: về bảng đủ dòng như cũ.
- Chưa sửa bản điện thoại (T281 của Trum đang sửa `src/ui/mobile/*`). Cột số kiểu luỹ kế (vd Tồn ở sổ quỹ) cũng bị cộng ở dạng Tổng hợp, giống cách dòng Cộng nhóm đang tính.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
