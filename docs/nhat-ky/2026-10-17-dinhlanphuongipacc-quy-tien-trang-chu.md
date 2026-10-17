# Khối Quỹ tiền trang chủ Free: nút Tạo quỹ, link sổ quỹ, bỏ kẻ đôi (T325)

- Ngày: 17/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `home/BaBaiToanFree.tsx`, khối Quỹ tiền:
  - Góc trên phải có 2 link Sổ quỹ tiền mặt (báo cáo 2.2.1) và Sổ ngân hàng (2.2.3). Link mở đúng tháng đang xem qua `datLocDaXem`.
  - Nút Tạo quỹ chuyển từ tiêu đề xuống dưới vòng tồn quỹ.
- `app.css`, mục cuối T325:
  - `.bbt-quy-tao`. Màn rộng hơn 900px thì kéo nút lên chỗ trống dưới vòng, ngang dòng quỹ cuối, chỉ rộng bằng nút.
  - Bỏ kẻ dưới của dòng ngay trước dòng tổng (Lợi nhuận, = Nợ cuối kỳ), hết cảnh hai đường kẻ song song ở khối Kết quả kinh doanh và Mua hàng.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van --loai giao-dien` cho `BaBaiToanFree.tsx`: sạch.
- Thử tay ở 1366x900 và 1100x800:
  - Nút Tạo quỹ không chồng vòng, không che danh sách quỹ.
  - Đoạn mã dò trên trang không còn chỗ nào có hai đường kẻ sát nhau.
  - Link sổ quỹ mở đúng tháng.
- `xuat_bao_cao_he_thong.py` không chạy được trên máy này (thiếu `Present/tools`).

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
