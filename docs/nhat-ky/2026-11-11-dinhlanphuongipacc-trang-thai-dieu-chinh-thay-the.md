# Trạng thái, nút thao tác hoá đơn ở tab Điều chỉnh thay thế (T798)

- Ngày: 11/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `src/modules/hoa-don/HoaDonDienTu.tsx`, hàm `DieuChinhThayThe`: khu Hoá đơn điều chỉnh, thay thế thêm cột Trạng thái HĐĐT (chip `ph-tt`), cột Trạng thái thuế dùng chip `hddt-thue` như tab Hoá đơn điện tử; dự thảo để trống trạng thái thuế. `CapHd` thêm trường `ttHd`.
- Cột Thao tác đổi nút Gửi CQT thành menu ⋯: dự thảo có Phát hành, Gửi CQT, Phát hành và Gửi CQT; đã phát hành chỉ Gửi CQT. Lý do mờ lấy theo hàm `lyDo` của tab Hoá đơn điện tử (Gửi CQT chỉ hoá đơn máy tính tiền). Phát hành gọi `phatHanhNhap` như `lam('ph')` ở `DsHoaDon`.
- Hoá đơn dự thảo: số 00000000 thành link, mở popup `HopXemHd` xem mẫu dựng từ chứng từ (hàm `hdNhap`).
- Người dùng nhờ thêm giữa phiên: cột Thao tác cố định bên phải khi cuộn ngang. `app.css` mục mới cuối file (T798), class `hddt-dctt` trên khung bảng. Mục T786 sửa số thứ tự cột kẻ đậm nhóm (thêm 1 cột nên 11, 12 thành 12, 13).
- `src/modules/ban-hang/hddt.tsx`, `HopXemHd` thêm prop `nhap`: mở thẳng bản hoá đơn, không kiểm nhà cung cấp, tiêu đề ghi Dự thảo thay Hợp lệ.

## Đã kiểm

- `npm run typecheck`, `npm run build`: chạy xong, không lỗi.
- Trình duyệt gói Plus, `/#/app/hoa-don/dieu-chinh`: 4 cặp mẫu hiện đúng cột trạng thái; menu dự thảo có 3 mục, đã phát hành chỉ Gửi CQT; Phát hành HDTT2610-0002 cấp số 00000129, chuyển Đã phát hành, Hợp lệ; bấm 00000000 của HDDC2610-0002 mở mẫu hoá đơn ghi Dự thảo.
- Chưa thử Gửi CQT, Phát hành và Gửi CQT bấm được: cặp mẫu đều ký hiệu C26TAA (không phải máy tính tiền) nên hai mục này mờ đúng luật.

- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần thư mục `Present/tools` (`build_present`) nằm cạnh repo, máy này không có.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- Không.
