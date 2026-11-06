# Công thức chế biến Plus theo mẫu B (T760)

- Ngày: 07/11/2026
- Người: Trum, agent: Claude Code, OpenCode
- Trạng thái cuối phiên: Xong

## Đã làm

- Vẽ và chốt mẫu trên artifact https://claude.ai/artifact/6uTUETgK1SJvzGEqD45Mxq. Spec ở `backup/spec-T760.md` (không lên git).
- Danh sách web gói Plus mỗi nguyên vật liệu một dòng, cột khác gộp ô; thanh lọc theo danh mục hàng hoá; 2 chip trạng thái: `CongThucPlus.tsx`.
- Form mẫu B hai khối, mỗi khối 3 dòng; Thêm dòng, Thêm hàng loạt; đơn vị nguyên vật liệu đổi được, giữ nguyên số; hàng lọc theo `tr.loc-hang`: `CongThucPlusForm.tsx`, cuối `app.css`.
- Bỏ trạng thái Nháp của công thức ở mọi gói và điện thoại, dòng đã lưu còn Nháp đọc thành Không hoạt động: `san-xuat.ts`, `CongThuc.tsx`, `MCongThuc.tsx`.
- Sau lần push đầu: phễu danh sách đổi sang `BoLoc` dùng chung; khối phải của form đổi thành Sản phẩm, Đơn vị tính + Ngày áp dụng, Mô tả; đơn vị tính hiện cả mã và tên qua `maDvt`, nguyên vật liệu 1 đơn vị không khoá; dòng mới bỏ `chiMa`.
- Bộ lọc nâng cao thêm Nguyên vật liệu, Kênh áp dụng; 4 ô chọn dùng `ChonHaiCot` có tìm kiếm. Đơn vị tính sản phẩm 1 đơn vị không khoá. Dòng mới có ô chọn ở cả cột mã và tên, thêm prop `goiYTim` cho `ChonDanhMuc`.
- Sửa `Popover` dùng chung: chỉ bỏ qua cú bấm trong `.pop` nằm sau nó trong DOM, nên hai ô chọn trong Bộ lọc không còn cùng mở. Panel Thêm hàng hoá nổi trên lớp nền của form. Nhãn thứ hai khối phải rộng 130px.
- Lịch chọn ngày: 4 nút chân rộng theo chữ, Đầu tháng không lấn viền: cuối `app.css`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Script Playwright riêng cho T760, 40 ca đạt: chip, số đếm, tìm kiếm, ẩn cột nhóm, form ở rộng 1440 và 1024, đổi đơn vị giữ số, Thêm dòng, Thêm hàng loạt, nút Đầu tháng, gói Pro, điện thoại. Xem ảnh danh sách và form ở 1440.
- Chưa kiểm: `kiem_tra.py` đủ 3 gói (bản `--nhanh` chỉ gói Pro), nút Đầu tháng ở danh sách chứng từ (chỉ đo ở form công thức, cùng một thành phần), màn sơ chế gói Pro. Commit đầu không có review chéo vì Trum cần nhanh; commit sửa sau được subagent đọc diff.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD100.
- `docs/BAY.md`: cập nhật mục khung bật ra lồng nhau.
- CSS còn sót lớp không dùng `.ctpl-dong-o`, `.ctpl-dong-doi` của T759, chưa xoá.
