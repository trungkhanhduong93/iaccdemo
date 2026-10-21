# Phần đầu báo cáo mới cho mọi sổ, báo cáo (T576)

- Ngày: 21/10/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- `ThanhChon.tsx`: báo cáo dùng đầu mới vẽ đường dẫn `‹ Báo cáo / nhóm`, tên báo cáo (ô đổi nhanh) kèm sao ghim (dùng chung `bc-ghim` với Tất cả báo cáo, `docGhim`, `luuGhim` xuất từ `TrungTam.tsx`), chừa chỗ `.bc-dau-mo-ta`, `.bc-dau-nut`.
- `ReportScreen.tsx` (`ReportToolbar`): đưa dòng thông số và nút Xuất (chỉ biểu tượng), Tuỳ chỉnh, In (biểu tượng Figma) vào chỗ chừa bằng portal; thanh lọc khung riêng; ô Tìm chỉ ở thanh ngang (không vào phễu, hộp hỏi lọc); dòng thông số mặc định theo thứ tự kỳ · cửa hàng · điều kiện lọc; nút Lọc báo chấm cam cả khi đổi ngày trong cùng tháng (nhớ khoảng ngày lúc bấm Lọc).
- `ReportScreen.tsx` (`ReportPaper`): bỏ tiêu đề, dòng điều kiện lọc trên bảng dữ liệu; đầu tờ in theo thứ tự Tên, Thời gian, Cửa hàng: …, chi tiết khác, không lặp; tên cửa hàng góc trái chỉ theo thanh trên; điều kiện của ô lọc không còn hiện thì không áp nữa (`locHienCo`).
- Ô Cửa hàng (khoá `cuaHang`, `K_CUA_HANG` trong `danh-sach.ts`) khi thanh trên xem tất cả cửa hàng: tên gốc cửa hàng, chọn nhiều, luôn nằm ngoài thanh sau Thời gian. Có ở báo cáo `theoCn` hoặc bảng có cột cửa hàng. Số liệu tính lại theo cửa hàng chọn: sổ (`renderReport` kiểu `so`, tổng hợp), bảng kê `theoCn` cộng từng cửa hàng (`gopTheoCuaHang`), Sổ quỹ (`SoQuy.tsx`). Chọn đủ mọi cửa hàng thì như xem tất cả (`chonCuaHang`).
- `danh-sach.ts`: `laDauBcMoi` áp mọi báo cáo, muốn giữ đầu cũ thì thêm mã vào `DAU_BC_CU`; Sổ quỹ bỏ ô Cửa hàng tự sinh (tên ngắn).
- `app.css`: mục cuối file `(T576)`.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi. `python tools/kiem_tra.py --nhanh`: Không có lỗi. `kiem_van` các file sửa: không mục ĐỎ.
- Mở từng báo cáo ở Free TT152, Standard TT58, Standard TT152, PL TT133, PR TT99: báo cáo có số liệu đều đủ 3 nút, dòng thông số. KQKD ở TT133, TT99 vẫn "chưa có mẫu" như trước.
- `python tools/xuat_bao_cao_he_thong.py` chưa chạy được: máy này thiếu thư mục `Present/tools` cạnh repo (`ModuleNotFoundError: build_present`), file `IACC-Cloud-Chi-Tiet-He-Thong.xlsx` chưa làm mới.
- Lọc 1 cửa hàng ở ô Cửa hàng ra cùng số với chọn cửa hàng đó trên thanh trên ở 15 báo cáo. Chọn đủ mọi cửa hàng khớp xem tất cả.

## Dở dang, việc tiếp theo

- Công nợ nhà cung cấp, khách hàng chọn 2 cửa hàng thì cộng trùng số dư đầu kỳ, do dữ liệu giả công nợ mỗi cửa hàng mang số dư cả công ty.
- Chưa có ô Cửa hàng (dữ liệu giả chưa tách theo cửa hàng): Tổng hợp quỹ tiền, Báo cáo dòng tiền, Xuất nhập tồn, Thẻ kho, Sổ chi phí, Sổ doanh thu, KQKD Free, bộ sổ TT58.
- T577: ô Cửa hàng cho danh sách chứng từ, sửa `VoucherScreen.tsx`, hỏi Trum trước.
- T578: bỏ ô "Ẩn dòng không phát sinh" web và điện thoại, báo cáo luôn ẩn dòng không phát sinh.

## Bẫy, quyết định mới

- Không.
