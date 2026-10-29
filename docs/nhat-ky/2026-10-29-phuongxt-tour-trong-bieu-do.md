# Tour khoanh trọn biểu đồ, nút Quay lại onboarding điện thoại, khung khen viền xanh (T138)

- Ngày: 29/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- `src/modules/home/HuongDan.tsx`: tour web đo chỗ trống theo khung `main` (thanh trên, thanh tab nằm ngoài khung cuộn), chỉ chừa lề 12px thay 130px. Khối Kết quả kinh doanh kèm biểu đồ 13 tháng giờ được khoanh trọn. Điện thoại giữ cách cũ.
- `src/modules/home/HuongDan.tsx`: bong bóng khen ở Trang chủ và bong bóng "Thông tin kê khai đã xong" có thêm class `hdan-khen`.
- `src/modules/onboarding/KhoiTaoFabi.tsx`: điện thoại, từ trang 2 có nút Quay lại cạnh nút Tiếp.
- `src/styles/app.css`: mục T138 cuối file cho nút Quay lại và `.hdan-khen` (điện thoại: viền xanh như `.hdan-khen-tk`).

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_van.py src/modules/onboarding/KhoiTaoFabi.tsx`: 0 ĐỎ, 1 VÀNG (câu gợi ý gói Plus, Pro có sẵn từ trước).
- `python tools/kiem_tra.py --nhanh`: 1 lỗi `[PR] #/app/kho/5-2-11: tràn ngang ở ['.main']`, ngoài phần đã sửa. PhuongXT bảo push luôn.
- Xem trên trình duyệt: cửa sổ 1500x860, khung khoanh bọc trọn khối KQKD; khổ điện thoại 375, nút Quay lại hiện ở trang 2.
- `python tools/xuat_bao_cao_he_thong.py`: lỗi thiếu module `build_present` (cần thư mục `Present/tools` cạnh repo, máy này không có), chưa làm mới file xlsx.
- Chưa xem tận mắt bong bóng khen viền xanh trên điện thoại (phải đi hết một việc mới hiện).

## Dở dang, việc tiếp theo

- PhuongXT xem bản online, nhất là bong bóng khen trên điện thoại. Các mục dở của nhật ký T138 ngày 29/10 vẫn còn.
- Lỗi tràn ngang màn kho 5-2-11 (gói Pro) chưa rõ do việc nào, cần xem.

## Bẫy, quyết định mới

- Không.
