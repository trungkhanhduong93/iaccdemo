# Bổ sung chi nhánh từ FABi khi đang dùng (T142)

- Ngày: 11/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- PhuongXT chốt: gói Free khi dùng thử được chọn cửa hàng; đang dùng muốn thêm chi nhánh thì thêm từ cửa hàng FABi. Bỏ phần giới hạn số điểm bán theo gói.
- `src/modules/onboarding/cua-hang-fabi.ts` (mới): danh sách cửa hàng trên tài khoản FABi (mẫu: 3 cửa hàng Phố Mây và 1 Góc Nhỏ đã dùng kế toán, 4 cửa hàng mới ở TP.HCM, Hà Nội chưa dùng), `cuaHangChuaDung(s)` trừ cả cửa hàng đã lên sổ trong phiên.
- `src/app/session.tsx`: `cnThem` lưu chi nhánh lên sổ thêm theo từng đơn vị (`CnThem`: id, tên, khu vực, ngày bắt đầu lên sổ, `banDau` là chọn lúc khởi tạo).
- Danh mục chi nhánh thành màn riêng `src/modules/danh-muc/DanhMucChiNhanh.tsx` (khai ở `danh-muc/index.ts`): bảng có cột Khu vực, Kho, Lên sổ từ, Nguồn; chi nhánh bổ sung có nhãn Mới lên sổ. Nút Thêm chi nhánh từ FABi mở hộp chọn: chỉ cửa hàng FABi chưa dùng kế toán (danh sách nhóm theo khu vực của T138), Ngày bắt đầu lên sổ (doanh thu FABi đồng bộ từ ngày này), tích Khai số dư ban đầu cho chi nhánh mới. Lên sổ xong mà có tích thì mở Số dư ban đầu (gói Free ở Thu chi, gói khác ở Tổng hợp) với `?cnMoi=`, tab tiền chèn sẵn dòng quỹ tiền mặt của từng chi nhánh mới.
- `src/modules/tong-hop/SoDuBanDau.tsx`: quỹ tiền mặt của chi nhánh lên sổ thêm có trong ô chọn quỹ; đọc `?cnMoi=`.
- `src/modules/home/BanLamViec.tsx`: việc cần xử lý "FABi có N cửa hàng mới chưa lên sổ kế toán", nút Lên sổ mở thẳng hộp chọn (`/app/danh-muc/chi-nhanh?them=1`).
- Màn giới thiệu khi mở từ FABi (`KhoiTaoFabi.tsx`, thuộc T138) có Chọn cửa hàng dùng thử, mặc định tất cả; cửa hàng chọn điền sẵn bước Chi nhánh của popup, khởi tạo xong thành chi nhánh của đơn vị mới. Thêm đơn vị kế toán cũng ghi chi nhánh đã chọn vào `cnThem`, để cửa hàng đó không còn hiện là chưa dùng.

- Chi nhánh theo đơn vị (`dsChiNhanh` ở `session.tsx`): thanh chọn chi nhánh, số chi nhánh ở Bàn làm việc đọc theo đơn vị; đơn vị dùng thử ghi chi nhánh đã chọn ngay khi bấm Dùng thử. Đơn vị dùng thử coi là tài khoản FABi riêng: cửa hàng chưa lên sổ là cửa hàng bỏ tích lúc dùng thử.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `PYTHONIOENCODING=utf-8 python tools/kiem_tra.py --nhanh`: Không có lỗi.
- `kiem_van.py` các file đã sửa: không có mục ĐỎ.
- Bấm thử ở Phố Mây gói Plus: Bàn làm việc nhắc 4 cửa hàng mới; Lên sổ mở hộp chọn; bỏ Cầu Giấy, lên sổ 3, mở Số dư ban đầu tab tiền có sẵn 3 dòng quỹ tiền mặt mới; Danh mục chi nhánh có 3 dòng Mới lên sổ từ 07/10/2026; Bàn làm việc còn nhắc 1 cửa hàng.
- Dùng thử từ FABi: chọn 2 trong 3 cửa hàng, bước Chi nhánh điền sẵn đúng 2, khởi tạo xong Danh mục chi nhánh của đơn vị mới có 2 chi nhánh.
- Thử xong trả phiên về Phố Mây gói Plus.

## Dở dang, việc tiếp theo

- Số liệu doanh thu, chứng từ vẫn dùng 3 chi nhánh mẫu; chi nhánh lên sổ thêm chưa có số bán mẫu, chọn chi nhánh đó trên thanh trên thì số liệu hiện như xem tất cả.
- Chi nhánh lên sổ thêm, số dư sửa trên màn chỉ giữ trong phiên trình duyệt.

## Bẫy, quyết định mới

- Không ghi `docs/BAY.md`, `docs/QUYET-DINH.md`.
