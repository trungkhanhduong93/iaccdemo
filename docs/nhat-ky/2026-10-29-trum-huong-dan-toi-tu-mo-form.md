# Hướng dẫn nhanh: làm tối quanh khung cam, tự mở form, nút bóng đèn (T680)

- Ngày: 29/10/2026
- Người: Trum, agent: Claude Code (phiên trên mây)
- Trạng thái cuối phiên: Xong

## Đã làm

Sửa theo 4 góp ý của Trum sau T676:

- Khung cam quanh hàng tab bị cắt cạnh trên. Nguyên nhân: lớp số cam nằm trong `.mtabs` (z-index 20), thấp hơn thanh trên (25), khung lại vẽ lố ra ngoài 3px. Sửa trong `src/ui/HuongDanNhanh.tsx`: ô sát mép trên thì khung vẽ vào trong theo chiều dọc (`khung()`).
- Làm tối quanh khung cam: thêm `.hdn-toi` trong lớp số cam, đặt đúng chỗ bước đang xem, `box-shadow` phủ phần còn lại. Muốn phủ cả sidebar, thanh trên thì dải, số cam, khung đủ được gắn thẳng vào `body` bằng portal. Thứ tự lớp: số cam 31, dải 32, trên sidebar 30. Lúc form mở thì vẫn nằm trong form như T676, dải có z-index 40 để nằm trên lớp tối.
- `src/styles/app.css` mục T679, T674: luật dựa vào phần tử cha đổi sang class. `:not(.mtabs) > .hdn-dai` thành `.hdn-dai.ngoai`, `.shell.gon .hdn-dai` thành `.hdn-dai.gon`, `.shell:has(.hdn-dai) > .main` thành `:root:has(.hdn-dai) .shell > .main`, khung đủ dùng `.hdn-khung.ngoai`. Mục mới cuối file (T680) cho lớp tối, nút mới.
- Tự mở, đóng form: hàm `diToi` dùng cho Bước kế, Bước trước, bấm bước trong khung đủ.
  - Vào bước trong form mà form chưa mở thì mở form theo nút làm ngay của bước trước gần nhất. Không có thì mở Thêm mới của màn chứng từ.
  - Vào bước ở màn danh sách mà form đang mở thì đóng form, không hỏi (Trum chốt: đây là bản demo).
  - Nút tắt trên dải là bỏ qua: tắt hướng dẫn, đóng luôn form do dải mở.
  - Bỏ nút làm ngay dự phòng ở bước trong form của T676 vì form đã tự mở.
- Đóng không hỏi: `src/ui/huongDanForm.ts` thêm `dongFormTren()`. `src/ui/FormToanMan.tsx` thêm prop `dongNgay` (đóng không hỏi). `src/ui/generic/ChungTuForm.tsx` truyền `dongNgay={dongForm}`, Huỷ, nút X, Esc vẫn hỏi như cũ.
- Nút Hướng dẫn: Trum chọn kiểu B trong 5 kiểu gửi ảnh so sánh, gồm bóng đèn kèm chữ Hướng dẫn, nền cam nhạt; rê chuột hoặc đang mở thì cam đặc. Thêm icon `bong-den` vào `src/ui/Icon.tsx`, không sửa `la-ban` vì Trang chủ (T138) còn dùng. Đầu dải, đầu khung đủ cũng đổi sang bóng đèn.
- `tools/kiem_tra.py` (`kiem_tra_t676_huong_dan`):
  - bỏ việc bấm hộ nút làm ngay, đóng hộ form: Bước kế phải tự mở, tự đóng form;
  - kiểm thêm lớp tối, khung cam không lố lên thanh trên, không còn hộp thoại khi ra ngoài form;
  - Thu chi kiểm Bước trước mở lại form, nút tắt đóng luôn form.
- `docs/QUYET-DINH.md` QD87, `docs/KIEN-TRUC.md`, `CHANGELOG.md` ghi phần mới.

## Đã kiểm

- `npm run typecheck`, `npm run build`: không lỗi.
- `python tools/kiem_tra.py --nhanh`: lần đầu báo 1 lỗi "[PR] #/app/tien/2-2-3: tràn ngang ở .main". Không tái hiện được: đo riêng màn đó, chuyển màn 12 lần như bước kiểm, đi đúng thứ tự các màn Thu chi gói Pro 3 vòng đều không tràn. Thanh tab tự đo lại khi nút rộng ra nên không do nút mới. Chạy lại toàn bộ: "Không có lỗi.", bước T676, T680 in "đúng". Lần sau gặp lại lỗi này thì ghi vào `docs/BAY.md`.
- Thử trả khung hàng tab về kiểu cũ, tắt tự mở form: bước kiểm báo đúng "Thu chi bước 1: khung cam lố lên thanh trên", "Xuất bán POS bước 4: khung cam lố lên thanh trên", thiếu số cam ở bước trong form. Đã trả code lại.
- Script thử riêng, màn 1440, gói Standard:
  - Thu chi: Bước kế 2 sang 3 tự mở phiếu chi; 5 sang 6 đóng form không hỏi; Bước trước về 5 mở lại form; nút tắt đóng form và dải.
  - Sổ quỹ, Tất cả báo cáo: dải ngay dưới thanh trên. Sidebar thu gọn: dải sát mép sidebar. Khung đủ dưới dải.
  - Không lỗi console.
- Chụp 2 ảnh xem bằng mắt: Thu chi bước 1 khung cam đủ 4 cạnh, màn tối trừ hàng tab và dải; bước 3 trong form tối trừ khối đầu form và dải.
- `python tools/kiem_van.py` cho file có chữ đã sửa: không có mục ĐỎ.
- Bỏ qua `python tools/xuat_bao_cao_he_thong.py` theo lời Trum dặn: lệnh chỉ chạy được trên máy Trum.

## Dở dang, việc tiếp theo

- Không. Chú thích "nút la bàn" còn ở `src/app/ModuleTabs.tsx`, `src/modules/bao-cao/ThanhChon.tsx`, `src/modules/tien/huong-dan.ts`, chỉ là chú thích, không đổi giao diện.

## Bẫy, quyết định mới

- QD87 thêm nút Hướng dẫn, làm tối, tự mở đóng form. Không ghi `docs/BAY.md` (tìm ra nguyên nhân dưới 15 phút). Người sau cần biết: phần tử fixed nằm trong `.mtabs` không nổi được lên thanh trên, sidebar dù đặt z-index cao, vì `.mtabs` tự tạo lớp xếp riêng ở z-index 20.
