# Trang chủ Free: vùng Top tách riêng, danh sách quỹ, trục và đường biểu đồ 13 tháng (T331)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `home/BaBaiToanFree.tsx`:
  - Khối Mua hàng và Hao hụt kiểm kê: vùng Top nằm trong ô nền nhạt riêng. Có khoảng trống co giãn (`bbt-kho2-gian`) đẩy vùng Top xuống đáy, nên hai khối thẳng hàng. Tiêu đề đổi thành Top mua hàng, Top công nợ, Top kiểm kê thiếu, Top kiểm kê thừa.
  - Danh sách quỹ: tên quỹ bên trái, số tiền bên phải, bỏ tỷ trọng (rê chuột vào dòng thì giữa vòng vẫn hiện %).
  - Nút Tạo quỹ thành dòng cuối danh sách quỹ (prop `cuoi` của `VongQuy`), không còn chồng lên vòng.
  - Hai biểu đồ 13 tháng truyền cùng `duoi0`, để đường 0 thẳng hàng.
  - Chú thích Lãi, Lỗ gộp thành Lợi nhuận, vẽ đoạn thẳng thay chấm tròn.
- `ui/Charts.tsx`:
  - `trucLaiLo`: bước số đẹp cho khoảng 5 vạch. Trục lên tới bội số đầu tiên vượt số lớn nhất, bỏ phần cộng 4%.
  - `LaiLoChart`:
    - Nhận `duoi0`.
    - Nhãn tháng chỉ ghi năm ở tháng đầu, tháng cuối và tháng 1. Vạch đứt tách năm, tháng cuối in đậm.
    - Đường lợi nhuận màu `--bd-ln`, bỏ chấm tròn từng tháng, chỉ tháng đang rê chuột có chấm.
- `app.css`: mục cuối T331. Bỏ quy tắc kéo nút Tạo quỹ lên và lớp `.bbt-quy-tao` của T325.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van --loai giao-dien` cho `BaBaiToanFree.tsx`: sạch.
- Thử tay ở 1366x607 và 1100x800:
  - Vùng Top hai khối cùng đỉnh, cùng đáy.
  - Tên quỹ hiện đủ.
  - Đường 0 hai biểu đồ cùng độ cao. Trục Dòng tiền của Lê Lợi từ 1 tỷ xuống 800tr.
  - Không còn chấm tròn từng tháng.
- `xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `Present/tools`).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
