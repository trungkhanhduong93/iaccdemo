# Công thức chế biến Plus theo mẫu B (T760)

- Ngày: 07/11/2026
- Người: Trum, agent: Claude Code, OpenCode
- Trạng thái cuối phiên: Xong

## Đã làm

- Vẽ và chốt mẫu trên artifact https://claude.ai/artifact/6uTUETgK1SJvzGEqD45Mxq. Spec ở `backup/spec-T760.md` (không lên git).
- Danh sách web gói Plus mỗi nguyên vật liệu một dòng, cột khác gộp ô; thanh lọc theo danh mục hàng hoá; 2 chip trạng thái: `CongThucPlus.tsx`.
- Form mẫu B hai khối, mỗi khối 3 dòng; Thêm dòng, Thêm hàng loạt; đơn vị nguyên vật liệu đổi được, giữ nguyên số; hàng lọc theo `tr.loc-hang`: `CongThucPlusForm.tsx`, cuối `app.css`.
- Bỏ trạng thái Nháp của công thức ở mọi gói và điện thoại, dòng đã lưu còn Nháp đọc thành Không hoạt động: `san-xuat.ts`, `CongThuc.tsx`, `MCongThuc.tsx`.
- Lịch chọn ngày: 4 nút chân rộng theo chữ, Đầu tháng không lấn viền: cuối `app.css`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: Không có lỗi.
- Script Playwright riêng cho T760, 37 ca đạt: chip, số đếm, tìm kiếm, ẩn cột nhóm, form ở rộng 1440 và 1024, đổi đơn vị giữ số, Thêm dòng, Thêm hàng loạt, nút Đầu tháng, gói Pro, điện thoại. Xem ảnh danh sách và form ở 1440.
- Chưa kiểm: `kiem_tra.py` đủ 3 gói (bản `--nhanh` chỉ gói Pro), nút Đầu tháng ở danh sách chứng từ (chỉ đo ở form công thức, cùng một thành phần), màn sơ chế gói Pro. Chưa có worker review chéo vì Trum cần nhanh.

## Dở dang, việc tiếp theo

- Không.

## Bẫy, quyết định mới

- `docs/QUYET-DINH.md`: QD100.
- CSS còn sót lớp không dùng `.ctpl-dong-o`, `.ctpl-dong-doi` của T759, chưa xoá.
