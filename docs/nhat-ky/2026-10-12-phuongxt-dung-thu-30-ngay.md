# Dùng thử 30 ngày, khởi tạo 3 bước bắt buộc (T158)

- Ngày: 12/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- PhuongXT chốt: dùng thử 30 ngày, áp cho mọi gói kể cả Free; bỏ bước Đồng bộ bán hàng ở popup khởi tạo; 3 bước khởi tạo bắt buộc mới dùng được phần mềm.
- `src/app/session.tsx`: `dungThu` lưu ngày bắt đầu dùng thử của đơn vị mới (dùng thử từ FABi, Thêm đơn vị kế toán); `SO_NGAY_DUNG_THU = 30`, `batDauDungThu()`, `dungThuDv(s)` trả số ngày còn lại, ngày hết hạn. 3 đơn vị mẫu không dùng thử.
- `src/modules/onboarding/OnboardFabi.tsx`: popup còn 3 bước (Loại hình và gói, Đơn vị, Chi nhánh), cách đồng bộ để mặc định tổng hợp theo kênh, sửa ở Cấu hình kế toán; bỏ nút đóng, phím Esc, thẻ nhắc Tiếp tục (popup không đóng được tới khi xong); đầu popup có nhãn "Dùng thử 30 ngày · đến dd/mm/yyyy" và dòng "Hoàn tất 3 bước để bắt đầu dùng phần mềm"; khung Bạn sẽ có gì ghi miễn phí 30 ngày rồi mới tới giá. Thêm đơn vị kế toán cũng bắt đầu dùng thử.
- `src/modules/onboarding/KhoiTaoFabi.tsx`: màn chào, màn giới thiệu ghi dùng thử miễn phí 30 ngày.
- `src/app/Topbar.tsx`: nhãn "Dùng thử · còn N ngày" cạnh Trải nghiệm gói, còn 7 ngày trở xuống đổi màu vàng, bấm mở Gói thuê bao.
- CSS mục cuối `app.css` "Dùng thử 30 ngày (T158)"; bỏ CSS thẻ nhắc `.ktf-dai`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` các file đã sửa: không có mục ĐỎ.
- Dùng thử từ FABi: màn chào, giới thiệu ghi 30 ngày; popup 3 bước, nhãn đến 06/11/2026, Esc không đóng; bước 3 có nút Hoàn tất; xong vào Danh mục, thanh trên "Dùng thử · còn 30 ngày". Phố Mây gói Plus không có nhãn. Thử xong trả phiên như cũ.

## Dở dang, việc tiếp theo

- Hết hạn dùng thử chưa có màn chặn, mời mua gói.

## Bẫy, quyết định mới

- Không.
