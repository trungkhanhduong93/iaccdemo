# Form Thêm người sử dụng gọn lại (T809)

- Ngày: 12/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `truong-dm.ts`: thêm `KhoiDM.chiKhiXem` (khối chỉ hiện khi mở dòng có sẵn, ẩn khi thêm mới) và `CauHinhDM.anPhuDeMoi` (bỏ dòng phụ dưới tên panel khi thêm mới).
- `CatalogScreen.tsx`: `dsKhoi` lọc khối `chiKhiXem` khi chưa `dangSua`; panel cạnh không vẽ dòng phụ khi `anPhuDeMoi` và đang thêm mới.
- `HeThong.tsx` (`CAU_HINH_NGUOI_DUNG`): bật `anPhuDeMoi`; khối Thông tin hệ thống gắn `chiKhiXem`, Đăng nhập gần nhất chuyển xuống cuối khối này; bỏ khối Đồng ý, ô Đồng ý chia sẻ thông tin cá nhân chuyển vào khối Trạng thái, đổi sang công tắc như Đang sử dụng, Xác thực.

## Đã kiểm

- `npm run typecheck`: không lỗi.
- `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `python tools/kiem_van.py` cho 3 file đã sửa: sạch.
- Chưa chụp màn hình form vì cổng 5180 đang có server của phiên khác.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần `../Present/tools/build_present.py`, máy này không có thư mục đó.

## Dở dang, việc tiếp theo

- Không.
- Câu hỏi cho Trum: nút Xác thực trên form hiện chỉ là cờ (cột Xác thực, bộ lọc), chưa rõ là xác thực email hay xác thực hai lớp.

## Bẫy, quyết định mới

- Không.
