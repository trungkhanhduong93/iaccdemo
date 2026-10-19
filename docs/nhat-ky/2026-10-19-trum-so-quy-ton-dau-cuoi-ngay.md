# Sổ quỹ điện thoại tồn đầu, cuối ngày (T433)

- Ngày: 19/10/2026
- Người: Trum, agent: Claude Code điều phối, Antigravity code
- Trạng thái cuối phiên: Xong

## Đã làm

- `MSoBaoCao.tsx`: tách thẻ tổng đầu màn của Sổ quỹ tiền mặt và Sổ tiền gửi ngân hàng thành 4 ô riêng cùng một hàng gồm Tồn đầu, Thu, Chi, Tồn cuối; giữ nguyên 3 ô cho sổ công nợ và các sổ khác.
- `MSoBaoCao.tsx`: thiết kế lại danh sách theo ngày cho sổ quỹ và sổ ngân hàng; đầu nhóm hiển thị ngày bên trái, Tồn đầu ngày bên phải; giữ các dòng thu chi; cuối nhóm hiển thị Tồn cuối ngày bên trái và số tiền in đậm bên phải.
- `MSoBaoCao.tsx`: tính lũy kế tồn đầu ngày bằng tồn cuối ngày trước (ngày đầu kỳ bằng tồn đầu kỳ), tồn cuối ngày bằng tồn đầu ngày cộng thu trừ chi trong ngày; đối chiếu tồn cuối ngày cuối cùng khớp ô Tồn cuối trên thẻ tổng.
- `src/styles/app.css`: thêm mục CSS `/* ── Sổ quỹ điện thoại tồn đầu, cuối ngày (T433) ── */` định dạng lưới 4 ô tổng, dòng đầu nhóm và chân nhóm tồn cuối ngày.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: in dòng `Không có lỗi.`
- `python tools/kiem_van.py`: các file đã sửa đạt 0 ĐỎ.
- Review chéo: XANH.
- Số đối chiếu Sổ quỹ T9/2026 Lê Lợi: tồn đầu 41.455.000, thu 391.045.000, chi 417.522.000, tồn cuối 14.978.000.
- Ảnh trong thư mục `backup/` (`T433-*.png`): sổ quỹ đầu trang 4 ô và 2 ngày đầu, sổ quỹ cuộn tới ngày cuối, sổ tiền gửi ngân hàng, sổ công nợ.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
