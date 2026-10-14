# Bộ lọc báo cáo mua, bán, kho; xuất nhập tồn mở thẻ kho (T205, T206, T207, T211)

- Ngày: 14/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- T205: Mua hàng theo ngày (4.2.6) bỏ cột Đã thanh toán, Còn nợ (`src/modules/mua-hang/bao-cao.ts`).
- T206: ô lọc trên thanh công cụ báo cáo (Kho ở Xuất nhập tồn, Kho, Mặt hàng ở Thẻ kho) để nhãn cùng hàng với ô chọn, không xuống dòng. Mục CSS mới cuối `src/styles/app.css`.
- T207: file mới `src/modules/bao-cao/loc-nguon.ts`: bộ lọc Kho, Hàng hoá, Nhóm hàng hoá, Đối tượng (khoá `locKho`, `locHang`, `locNhomHang`, `locDt`). Lọc trên phiếu, dòng hàng trước khi cộng: `phieuThang` (mua), `dongBan` (bán), `dongKho` (kho). `ReportCfg.rows` nhận thêm `loc` (`types.ts`); `ReportScreen.tsx` truyền `loc` và gắn giá trị đang lọc vào dòng (`ganLocNguon`) để khung lọc chung không bỏ dòng.
- T207: khai bộ lọc ở `bao-cao/danh-sach.ts`: mua 4.2.1, 4.2.2, 4.2.6, 4.2.7 (Kho, Hàng hoá, Nhóm hàng hoá, Đối tượng); bán 3.2.6, 3.2.7, 3.2.8 (Hàng hoá, Nhóm hàng hoá, Đối tượng, không Kho vì đơn POS không ghi kho, PhuongXT chọn); kho 5.2.9 đến 5.2.12 (Kho, Hàng hoá, Nhóm hàng hoá); 5.2.3 Hàng hoá, Nhóm hàng hoá (`XuatNhapTon.tsx` đọc bộ lọc đã áp).
- T207: Mua hàng theo ngày bỏ hai bộ lọc cũ Nhà cung cấp, Phương thức TT (lọc theo khoá dòng không có nên bảng rỗng). Bấm nhà cung cấp ở Tổng hợp mua hàng mở Chi tiết lọc bằng `locDt`, giữ kho, hàng hoá, nhóm đang lọc.
- T211: Xuất nhập tồn bấm mã hoặc tên hàng mở Thẻ kho cùng kho, kỳ. Thẻ kho 5.2.1 mở cho gói Free (`THEO_ROADMAP` ở `plan.ts`) và thêm vào `MO_IFASTER` (từ T171 bị ẩn ở mọi gói nên liên kết cũ không chạy).

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong, không lỗi.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.`
- `python tools/kiem_van.py` các file đã sửa: Sạch.
- Trình duyệt: Mua hàng theo ngày lọc nhóm Thịt, cá ra 198.680.000, khớp tính trực tiếp; tổng 3 kho bếp bằng tổng không lọc; nút phễu các báo cáo không trùng bộ lọc; Tổng hợp mua hàng bấm nhà cung cấp mở Chi tiết đúng nhà cung cấp; gói Free bấm Xương ống bò ở Xuất nhập tồn mở Thẻ kho NVL002, tồn đầu 27 khớp.

## Dở dang, việc tiếp theo

- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: `tools/xuat_bao_cao_he_thong.py` cần file `Dự kiến tính năng IACC Cloud.xlsx` và thư mục `Present/tools` ngoài repo, chỉ máy Trum có. Trum chạy lại script để Excel có Thẻ kho mở lại (T211).
- Phiếu mua mẫu không ghi kho nên lọc Kho bar ở báo cáo mua ra 0 (mọi dòng vào kho đầu của chi nhánh, giống danh sách phiếu mua).
- Bán hàng theo ngày: cột Số hoá đơn vẫn đếm mọi đơn POS trong ngày khi đang lọc hàng hoá, nhóm, đối tượng.
- Báo cáo bán hàng lọc Đối tượng: dòng món POS đều là Khách lẻ POS, chọn khách khác thì bảng rỗng.

## Bẫy, quyết định mới

- Không ghi `docs/BAY.md`. Ghi nhớ: khung lọc chung (`bienDoiBang`) bỏ mọi dòng không có cột trùng khoá bộ lọc, nên bộ lọc lọc ở nguồn phải gắn giá trị vào dòng (`ganLocNguon`). Bộ lọc tự sinh từ cột chỉ bỏ khi trùng nhãn, nên nhãn Đối tượng giữ đúng chữ này.
