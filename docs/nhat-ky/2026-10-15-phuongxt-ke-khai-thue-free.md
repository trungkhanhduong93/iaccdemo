# Kê khai thuế gói Free theo iFaster (T261)

- Ngày: 15/10/2026
- Người: PhuongXT, agent: Claude Code
- Trạng thái cuối phiên: Xong

## Đã làm

- Đọc phần Kê khai thuế của iFaster (itaxdev.ipos.vn, PhuongXT đăng nhập, chỉ xem): tab Quy trình 5 bước, Danh sách tờ khai (mã, kỳ, loại lần đầu/bổ sung, trạng thái), hộp Thiết lập thông tin, hộp Lập tờ khai (nhóm doanh thu khoá, năm, kỳ 6 tháng, tên tờ khai "…doanh thu dưới 1 tỷ (TT89/2026)"), hộp tờ khai 4 bước (thông tin HKD và điểm bán; doanh thu, GTGT, TNCN theo nhóm ngành; phụ lục 01/BK-STK; xem PDF, Tải XML, Đã nộp CQT). Không lưu, không nộp gì. Lưu ý: bấm qua tên các bước của TK000129 làm thanh "Hoàn thành" từ 1/4 thành 4/4 trên màn, trạng thái vẫn Chưa nộp; chưa rõ con số này có lưu lên máy chủ không.
- `src/modules/thue/ToKhaiHKD.tsx` (mới), màn "Danh sách tờ khai" chỉ gói Free (`goi: ['F']`, `thue/to-khai`): bảng tờ khai, tìm, lọc năm; hộp Lập tờ khai (lập trùng kỳ thành bổ sung lần tiếp theo); hộp tờ khai 4 bước như iFaster. `?buoc=n` mở tờ khai chưa nộp mới nhất ở bước n, chưa có thì mở hộp Lập tờ khai.
- Thuế: ngành Dịch vụ ăn uống (nganh-nghe.ts, GTGT 3%, TNCN 1,5%). TNCN tính trên phần doanh thu cộng dồn từ đầu năm vượt 1 tỷ, PhuongXT chốt. Doanh thu tháng 7–10/2026 từ dữ liệu mẫu, tháng trước đó lấy trung bình tháng 7–9 nhân hệ số mùa vụ như biểu đồ T255.
- `src/modules/thue/quy-trinh.ts`: gói Free có sơ đồ ngang 4 ô theo 4 bước (luongFree), tiêu đề "Quy trình lập tờ khai thuế" (`tenFree` mới), dòng mô tả, ẩn Danh mục liên quan (`anDuoiFree` mới), khung Báo cáo là sổ TT152 hộ kinh doanh (`baoCaoFree` mới; chỉ hiện sổ đơn vị mở được).
- `QuyTrinhScreen.tsx`: đọc `tenFree`, `anDuoiFree`, `baoCaoFree`; sơ đồ luồng thẳng một hàng (mỗi cột một ô, không chữ trên mũi tên) có lớp `gon`: giãn đều hết bề ngang, thêm mũi tên từ ô cuối chỉ sang khung Báo cáo; khung Báo cáo hiện mã mẫu báo cáo (vd S1a-HKD) ở mọi phân hệ.
- `app.css`: mục T261 cuối file (màn tờ khai, hộp, sơ đồ `gon`, `.qt-bc-ma`); quy trình không có khung Báo cáo thì sơ đồ rộng hết trang.
- Qua các vòng PhuongXT xem: sơ đồ 5 bước iFaster → 4 bước của hộp tờ khai → thử sơ đồ hội tụ → quay lại sơ đồ ngang, đẩy xuống, thêm mũi tên sang Báo cáo, thêm mã báo cáo.

## Đã kiểm

- `npm run typecheck`: không lỗi. `npm run build`: chạy xong.
- `python tools/kiem_tra.py --nhanh`: `Không có lỗi.` `kiem_van.py` ToKhaiHKD, quy-trinh, QuyTrinhScreen: sạch.
- Bản dev gói Free (đơn vị Phố Mây và hộ kinh doanh Góc Nhỏ): lập tờ khai, đi qua 4 bước, Đã nộp CQT đổi trạng thái; ô sơ đồ mở đúng bước; khung Báo cáo hiện Sổ doanh thu bán hàng S1a-HKD với Góc Nhỏ; sơ đồ vừa khung từ 1300px. Gói Plus giữ phân hệ thuế GTGT cũ. Điện thoại báo "chưa có trên điện thoại". Đã trả phiên về Phố Mây gói Plus.
- Chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`: script cần file Excel nguồn chỉ có trên máy Trum.

## Dở dang, việc tiếp theo

- Không. Có thể làm sau: hộp Thiết lập thông tin (PhuongXT chưa chọn); bản điện thoại; đơn vị mẫu Phố Mây doanh thu khoảng 9,3 tỷ/6 tháng, vênh với nhãn "Nhóm 1 (Dưới 1 tỷ đồng/năm)".

## Bẫy, quyết định mới

- Bẫy nhỏ: Vite đôi khi giữ đường dẫn module cũ (`?t=…`) sau nhiều lần sửa liền nhau, trang trắng với lỗi "does not provide an export named"; khởi động lại `npm run dev` là hết. Không ghi BAY.md vì mất dưới 15 phút.
- Không có quyết định mới.
