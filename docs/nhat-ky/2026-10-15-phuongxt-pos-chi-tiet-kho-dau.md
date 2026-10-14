# Xuất bán POS chỉ kéo chi tiết, ô Kho đứng đầu phiếu (T247, T248)

- Ngày: 15/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T247: `ChungTuBanHang.tsx` danh sách luôn theo hoá đơn (`theoDon`); bỏ nhãn Tổng hợp, dải đối soát (cùng hàm `loiDongBo`), nút và hộp Đồng bộ POS; ô lọc Phương thức thanh toán luôn có.
- T247: bỏ trường `dongBoFabi` ở `session.tsx`; bỏ thẻ chọn cách đồng bộ ở `HeThong.tsx`, `MHeThong.tsx`; `OnboardFabi.tsx` mặc định chi tiết; `TienIch.tsx` ghi chú phiếu thu theo hoá đơn; `MXuatBanPos.tsx` theo hoá đơn, bỏ nút đồng bộ; `SoChungTu.tsx` dò số POS theo hoá đơn.
- T248: `ChungTuForm.tsx` ô kho đầu phiếu (`oKhoDau`) lên đầu cột 1; mua, bán có ô kho thì Ghi chú ở cột giữa (`keoGc`). `ChungTuBanHang.tsx` đầu phiếu POS thêm Kho xuất, Ghi chú một ô.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `kiem_tra.py --nhanh`: Không có lỗi. Chạy bằng bản sao tạm đổi đường dẫn ảnh, vì T243 chưa sửa.
- `kiem_van.py` các file đã sửa: không ĐỎ.
- Trình duyệt khổ 1280: danh sách Xuất bán POS 3.850 chứng từ, không còn nhãn, dải, nút đồng bộ; phiếu mua hàng Kho nhập trên Nhà cung cấp, Ghi chú cột giữa, đầu phiếu 3 hàng; phiếu POS Kho xuất đứng đầu, 8 ô trong 2 hàng.
- Chưa kiểm bản điện thoại.

## Dở dang, việc tiếp theo

- Không. Việc nối tiếp: T249 báo cáo bán hàng đọc chứng từ POS theo hoá đơn.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD62 đồng bộ FABi chỉ kéo chi tiết theo hoá đơn.
