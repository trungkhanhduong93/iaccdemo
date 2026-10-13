# Kế hoạch giao diện điện thoại theo IVT Pro (T170)

Tài liệu này dành cho agent nhận một đợt trong mục 7. Đọc mục 0 tới 6 trước khi làm bất kỳ đợt nào. Mỗi đợt ở mục 7 ghi đủ điều kiện bắt đầu, các bước, file, việc không làm và cách nghiệm thu.

## 0. Đọc trước

1. `AGENTS.md`: luật repo, các bước trước khi push, cuối phiên.
2. `docs/QUYET-DINH.md` mục QD54: quyết định gốc của việc này.
3. `docs/KIEN-TRUC.md`, `docs/BAY.md`: quy ước code, bẫy đã gặp.
4. Nhật ký các đợt trước: `docs/nhat-ky/*-mobile-*.md`, `docs/nhat-ky/2026-10-12-trum-ke-hoach-mobile-ivt.md`.

Nhận đợt theo `AGENTS.md` mục "Đầu phiên" bước 5: thêm dòng vào `docs/TIEN-DO.md` với mã kế tiếp, tên việc bắt đầu bằng `Điện thoại đợt N:`. Ghi vào cột Ghi chú các file dùng chung sẽ sửa (`App.tsx`, `Screen.tsx`, `VoucherScreen.tsx`, `CatalogScreen.tsx`, `app.css`).

## 1. Mục tiêu và phạm vi

Mở iaccdemo trên điện thoại (màn rộng dưới 768px) thì ra giao diện giống app IVT Pro (iPOS Inventory). Khách dùng cả hai app thấy cùng một hệ sinh thái iPOS.

Trong phạm vi:

- Khung app, thanh dưới, trang chủ, lưới nghiệp vụ, danh sách, xem phiếu, lập phiếu, form danh mục, báo cáo, đăng nhập, cho mọi phân hệ.
- Dùng lại biểu tượng, hình minh hoạ, câu chữ, bố cục của IVT Pro.

Ngoài phạm vi:

- Bản máy tính (màn rộng từ 768px trở lên). Không được đổi một điểm ảnh nào.
- Dữ liệu, `src/app/registry.ts`, `src/app/features.json`, khoá theo gói, chế độ kế toán. Bản điện thoại đọc chung nguồn với bản máy tính.
- Trợ lý, chat, gọi điện, quét mã, giọng nói, thanh toán bản quyền của IVT. iaccdemo chưa có các tính năng này.
- Máy tính bảng. Màn 768px trở lên dùng bản máy tính.
- App cài đặt (PWA, Android, iOS).

## 2. Quyết định đã chốt

Không bàn lại các điểm sau. Muốn đổi thì hỏi Trum.

| Điểm | Chốt |
|---|---|
| Ngưỡng | `max-width: 767px` là điện thoại |
| Địa chỉ | Giữ `#/app/<phân hệ>/<màn>/<id>` như bản máy tính. Không làm `/m/...` |
| Chuyển khung | `useLaMobile()` đúng thì dùng `MobileShell`, sai thì dùng `Shell` cũ |
| Thư mục | Mọi component điện thoại nằm ở `src/ui/mobile/`. Biểu tượng, hình IVT dùng thật thì chép vào `src/assets/ivt/` |
| Đặt tên | Component bắt đầu bằng `M` + tiếng Việt không dấu, vd `MDanhSach`. Lớp CSS bắt đầu bằng `m-` |
| CSS | Mỗi đợt một mục riêng cuối `src/styles/app.css`, tiêu đề `/* ── Điện thoại đợt N (Txxx) ── */`. Lớp `m-` không được đè lên lớp của bản máy tính |
| Màu | Dùng biến `:root` có sẵn (mục 5). Không thêm biến màu |
| Phông | Bản điện thoại: `-apple-system, 'Be Vietnam Pro', 'Segoe UI', Roboto, sans-serif`. Không đưa file SF Pro lên web vì giấy phép Apple |
| Biểu tượng thao tác | Tìm, lọc, thêm, quay lại, đóng dùng `Icon.tsx` có sẵn. Biểu tượng nghiệp vụ, thanh dưới, màn trống dùng SVG của IVT |
| File dùng chung đang nóng | `ChungTuForm.tsx`, `VoucherScreen.tsx`, `CatalogScreen.tsx` chỉ được thêm export hoặc tách hook, không sửa giao diện bản máy tính. Giao diện điện thoại viết trong `src/ui/mobile/` |
| Màn chưa có bản điện thoại | Hiện `MChiMayTinh`: thẻ "Màn này chưa có trên điện thoại. Mở trên máy tính để dùng." kèm nút về Nghiệp vụ |

Còn mở, chốt ở đợt 0 khi có ảnh chụp:

- Nhãn tab thứ 3, thứ 4 của thanh dưới IVT. Chuỗi trong app có "Trang chủ", "Nghiệp vụ", "Trợ lý", "Khác", "Tài khoản", "Quản trị". Tạm dùng: Trang chủ, Nghiệp vụ, Báo cáo, Khác.
- Số đo kích thước (mục 5.2).

## 3. Tài nguyên IVT trong repo

APK gốc không nằm trong git (`.gitignore` chặn `*.apk`). Tài nguyên cần dùng đã rút sẵn vào `docs/ivt-tai-nguyen/`:

| Đường dẫn | Có gì |
|---|---|
| `docs/ivt-tai-nguyen/icons/` | 222 biểu tượng SVG của IVT |
| `docs/ivt-tai-nguyen/images/` | 15 hình màn trống SVG (`img_empty_*`, `img_ro`, `img_po_dashboard`, `img_wait_export`), hình tìm không ra `img_search_no_result.png`, ảnh nền trang chủ `img_bg_top_dashboard_1.png` |
| `docs/ivt-tai-nguyen/cau-chu.txt` | 1.640 câu chữ tiếng Việt lấy từ app, mỗi dòng một câu. Tra ở đây trước khi tự đặt nhãn |
| `docs/ivt-tai-nguyen/ten-man.txt` | 239 tên màn (`...Screen`, `...Page`) của IVT |
| `docs/ivt-anh/` | Ảnh chụp IVT Pro, có sau đợt 0 |

Biểu tượng PNG, ảnh nền khác, phông, nhạc chuông không rút vì nặng hoặc không dùng. Cần thì xin Trum file `mobile/IVT Pro(STG).apk`, giải nén bằng Python `zipfile`. Không mở, không chép thư mục `assets/flutter_assets/assets/config/`: chứa file `.env` cấu hình máy chủ, có thể có khoá.

Cách dùng SVG trong code:

- Hình tĩnh (màn trống, ô nghiệp vụ): `import hinh from '../../assets/ivt/img_empty_data.svg'` rồi `<img src={hinh} alt="" />`.
- Biểu tượng cần đổi màu theo trạng thái (thanh dưới): `import raw from '../../assets/ivt/ic_navigation_tab_1_v2.svg?raw'`, thay `#1A1A1A` bằng `currentColor`, gắn bằng `dangerouslySetInnerHTML`. SVG thanh dưới của IVT vẽ nét màu cứng `#1A1A1A`, dùng `<img>` thì không đổi màu được.

## 4. Bản đồ app IVT Pro

IVT Pro viết bằng Flutter. Không có file bố cục để đọc, bố cục chỉ biết qua ảnh chụp. Các khung màn dùng chung của IVT, lấy từ `ten-man.txt`:

| Khung IVT | Việc của khung | Khung điện thoại iaccdemo |
|---|---|---|
| `MainScreen` | Thanh dưới 4 tab và nút Trợ lý (`ic_navigation_tab_1_v2` … `4_v2`) | `MobileShell` |
| `DashboardScreen`, `DashboardTabAdminScreen`, `DashboardTabFollowScreen` | Trang chủ: ảnh nền kho, thẻ số liệu, truy cập nhanh (`ic_quick_access_*`), việc cần xử lý | `MTrangChu` |
| `BusinessHomeScreen` | Lưới ô nghiệp vụ (`ic_business_*`) | `MNghiepVu` |
| `BaseListWithFilterScreen`, `BaseListScreen` | Danh sách: ô tìm, nút lọc, chip trạng thái, thẻ từng dòng, nút thêm | `MDanhSach` |
| `FilterScreen` | Màn lọc toàn màn, nút Áp dụng | `MLoc` |
| `BaseReceiptDetailScreen` | Xem phiếu: đầu phiếu, trạng thái, dòng hàng dạng thẻ, thanh thao tác dưới | `MXemPhieu` |
| `CreateNewReceiptScreen`, `PickItemToReceiptScreen`, `CartScreen` | Lập phiếu: chọn hàng như giỏ hàng, sửa số lượng | `MLapPhieu` |
| `BaseCatalogDetailScreen`, `BaseFormScreen` | Xem, thêm, sửa danh mục, nút Lưu dính đáy | `MFormDm` |
| `ChooseDropdownItemScreen`, `ChooseListWarehouseScreen` | Chọn trong danh sách, tấm trượt từ dưới lên | `MChon` |
| `ReportHomeScreen`, `ReportTypeTabScreen` | Báo cáo chia nhóm, mỗi dòng tên và mô tả | `MBaoCao` |
| `MoreScreen`, `ProfileScreen` | Danh mục và thiết lập, tài khoản, đăng xuất | `MKhac` |
| `EmptyScreen`, `ErrorScreen` | Màn trống, màn lỗi có hình | `MTrong` |
| `LoginScreen`, `CompanySelectScreen` | Đăng nhập, chọn công ty | Đợt 8 |

## 5. Bộ nhận diện

### 5.1 Màu

Đếm theo số lần xuất hiện trong SVG của IVT. iaccdemo đã dùng cùng màu chính, nên chỉ dùng biến có sẵn:

| Vai trò | IVT Pro | Biến dùng |
|---|---|---|
| Màu chính, tab đang chọn, nút chính | `#0560A6` | `var(--blue)` |
| Màu chính đậm | `#0F6FBA` | `var(--blue-d)` |
| Nền nhạt màu chính | | `var(--tint)` |
| Màu nhấn cam | `#F89523`, `#F48220` | `var(--orange)` |
| Chữ đậm | `#263238`, `#1A1A1A` | `var(--ink)` |
| Chữ thân | `#363636` | `var(--body)` |
| Chữ phụ | `#666666`, `#AAAAAA` | `var(--muted)`, `var(--faint)` |
| Viền | `#DBDBDB`, `#D8DFE6` | `var(--line)` |
| Nền trang | `#F5F5F5` | `var(--bg)` |
| Đỏ, vàng, xanh lá | `#F83D23`, `#FEC100` | `var(--red)`, `var(--amber)`, `var(--green)` |

Chip trạng thái chứng từ lấy theo `TT_CT` ở `src/ui/generic/gen.ts`: `ok` xanh lá, `warn` vàng, `err` đỏ, `dim` xám. Dùng lại lớp `St` có sẵn nếu hợp, không đặt màu mới.

### 5.2 Kích thước

Số tạm, đợt 0 thay bằng số đo từ ảnh. Khai một lần thành biến trong mục CSS đợt 1, vd `--m-thanh-tren: 56px`. Đợt sau chỉ dùng biến, không ghi số trực tiếp.

| Thành phần | Số tạm | Số đo (đợt 0 điền) |
|---|---|---|
| Thanh trên: cao, cỡ chữ tiêu đề | 56px, 17px đậm 600 | |
| Thanh dưới: cao (chưa tính vùng an toàn), biểu tượng, chữ nhãn | 60px, 24px, 11px | |
| Chữ thân, chữ phụ, chữ số tiền | 15px, 13px, 15px đậm 600 | |
| Lề hai bên màn | 16px | |
| Thẻ danh sách: lề trong, bo góc, khoảng cách giữa thẻ | 12px 16px, 12px, 8px | |
| Chip trạng thái: cao, bo góc, cỡ chữ | 22px, 11px, 12px | |
| Nút chính: cao, bo góc | 44px, 8px | |
| Ô nhập: cao, viền | 44px, 1px `var(--line)` | |
| Tấm trượt: bo góc trên | 16px | |
| Nút thêm nổi: cỡ, cách đáy | 56px tròn, 16px trên thanh dưới | |

Thanh dưới cộng thêm `env(safe-area-inset-bottom)` để không bị thanh vuốt của iPhone che. `index.html` dòng 5 hiện chưa có `viewport-fit=cover`, đợt 1 thêm vào thẻ `meta viewport`.

## 6. Kiến trúc

### 6.1 File mới

```
src/ui/mobile/
  useLaMobile.ts      hook ngưỡng 767px
  MobileShell.tsx     khung: thanh trên, Outlet, thanh dưới
  ThanhDuoi.tsx       4 tab
  MTrangChu.tsx
  MNghiepVu.tsx
  MKhac.tsx
  MDanhSach.tsx       danh sách dùng chung (thẻ, tìm, chip, nút thêm)
  MLoc.tsx
  MXemPhieu.tsx
  MLapPhieu.tsx
  MChon.tsx           tấm trượt chọn
  MFormDm.tsx
  MBaoCao.tsx
  MTrong.tsx
  MChiMayTinh.tsx
  manMobile.ts        bảng tra: màn nào dùng component điện thoại nào
src/app/KhungApp.tsx  chọn Shell hay MobileShell
src/assets/ivt/       SVG chép từ docs/ivt-tai-nguyen khi dùng tới
```

Tạo file nào thì tạo đúng đợt cần nó, không tạo trước.

### 6.2 Hook ngưỡng

```ts
// src/ui/mobile/useLaMobile.ts
import { useSyncExternalStore } from 'react'

const MQ = '(max-width: 767px)'
const dangKy = (bao: () => void) => {
  const m = window.matchMedia(MQ)
  m.addEventListener('change', bao)
  return () => m.removeEventListener('change', bao)
}
export const useLaMobile = () => useSyncExternalStore(dangKy, () => window.matchMedia(MQ).matches)
```

### 6.3 Chọn khung

`src/app/KhungApp.tsx` trả `useLaMobile() ? <MobileShell /> : <Shell />`. Ở `src/App.tsx` đổi `<Route path="/app" element={<Shell />}>` thành `element={<KhungApp />}`. Không sửa gì khác trong `Shell.tsx`.

`MobileShell` phải giữ các việc `Shell` đang làm, ngoài phần giao diện:

- Chưa đăng nhập (`!s.loggedIn`) thì `<Navigate to="/dang-nhap" replace />`.
- Ghi lịch sử màn: `useEffect(() => { if (s.loggedIn) ghiGanDay(loc.pathname) }, [loc.pathname, s.loggedIn])`, import `ghiGanDay` từ `src/app/CommandPalette.tsx`.
- Gắn `<OnboardFabi />` (popup khởi tạo từ FABi).
- Thanh trên có chọn chi nhánh. Số liệu nhiều màn lọc theo `s.chiNhanh`, đổi bằng `set({ chiNhanh: c.id })` như `src/app/Topbar.tsx` dòng 63–66. Chọn đơn vị, đổi gói, đăng xuất đặt ở `MKhac`, làm y như `Topbar.tsx` dòng 36, 84, 104.

### 6.4 Chọn màn

Ở `src/app/Screen.tsx`, hàm `ScreenRoute`, dòng `const C = sc.comp ?? GENERIC[sc.kind]`:

```ts
const laMobile = useLaMobile()   // gọi ở đầu hàm, trước mọi return, đúng luật hook
...
const C = laMobile ? manMobile(sc, mod) : (sc.comp ?? GENERIC[sc.kind])
```

`manMobile` ở `src/ui/mobile/manMobile.ts` tra theo thứ tự:

1. Bảng riêng theo `mod.key + '/' + sc.slug`, vd `'trang-chu/tong-quan': MTrangChu`.
2. Theo `sc.kind`: `voucher` ra `MChungTu`, `catalog` ra `MDanhMuc`, `report` và `baocao` ra `MSoBaoCao`.
3. Không có thì ra `MChiMayTinh`.

Đợt nào làm xong component thì thêm vào bảng đúng đợt đó. Các nhánh trước `const C` trong `ScreenRoute` (chuyển báo cáo, trang khoá theo gói, báo cáo chưa có mẫu) giữ nguyên cho cả hai bản.

Các tab Nghiệp vụ, Khác không phải phân hệ. Thêm route tĩnh trong `App.tsx`, đặt trước `:mod`: `<Route path="nghiep-vu" element={<MNghiepVu />} />`, `<Route path="khac" element={<MKhac />} />`. Bản máy tính vào hai địa chỉ này thì `<Navigate to="/app" replace />`.

### 6.5 Dữ liệu

Không viết nguồn dữ liệu mới. Lấy đúng chỗ bản máy tính lấy:

| Màn | Lấy dữ liệu |
|---|---|
| Danh sách chứng từ | Bốn dòng đầu `VoucherScreen` (`cfg`, `tatCa`, `useDaXoa`, `rows`) ở `src/ui/generic/VoucherScreen.tsx` khoảng dòng 70–76. Đợt 3 tách thành hook `export function useDongChungTu(sc, mod)` trong cùng file, `VoucherScreen` gọi lại hook đó. Hành vi bản máy tính không đổi |
| Dòng của một phiếu | `r._dong` nếu có, không thì `dongCua(theoLoai(cfg, r.loai), \`${sc.code ?? sc.slug}-${r.id}\`)`. Kiểu `Dong` ở `gen.ts` dòng 23 |
| Trạng thái, nguồn phiếu | `TT_CT`, `NGUON` ở `gen.ts` |
| Lưu phiếu mới, sửa phiếu | `themPhieu`, `suaPhieu`, `soKeTiep` ở `src/ui/generic/daXoa.ts`, khoá màn là `` `${mod.key}/${sc.slug}` `` |
| Danh mục | `cfg.rows(s.cheDo, ky)` rồi lọc `cfg.locGoi`, cột `cfg.cols` (có thể là hàm theo gói, chế độ), như `CatalogScreen.tsx` dòng 33–48 |
| Lưu danh mục | Bản máy tính chỉ hiện toast "Đã lưu". Bản điện thoại làm giống, không lưu thật (việc T09) |
| Trang chủ | `tinhToanTongQuan` ở `src/modules/home/chiSo.ts` |
| Danh sách phân hệ, màn | `MODULES`, `hienPhanHe`, `tabCua`, `hienMan`, `moDuoc`, `duongDan` ở `src/app/registry.ts` |
| Chi nhánh | `CHI_NHANH` ở `src/data/mock.ts`, `chiNhanhHienTai(s)` ở `src/app/session.tsx` |

### 6.6 Thẻ danh sách

Mỗi dòng danh sách là một thẻ, bấm vào mở chi tiết theo đúng địa chỉ bản máy tính dùng.

Thẻ chứng từ:

```
┌──────────────────────────────────────┐
│ PC2610-0258            12.500.000    │  số phiếu (đậm)          tổng tiền (đậm, phải)
│ Công ty Hải Nam        [Đã ghi sổ]   │  đối tượng (doiTuong)    chip theo TT_CT[r.tt]
│ 07/10/2026 09:15 · Chi tiền mặt      │  ngày, giờ, tenLoai nếu có (chữ phụ)
└──────────────────────────────────────┘
```

Thẻ danh mục: dòng 1 `ten` (đậm), dòng 2 `ma` (chữ phụ), bên phải cột số đầu tiên của `cols` nếu có, chip Đang dùng hoặc Ngừng dùng theo `r._tt`.

## 7. Các đợt

Làm theo thứ tự. Đợt sau cần đợt trước đã push.

### Đợt 0. Chụp ảnh, đo số

- Người làm: Trum chụp, agent đo.
- Bắt đầu khi: luôn bắt đầu được.
- Bước:
  1. Trum chụp 16 ảnh ở mục 8 trên điện thoại thật, bỏ vào `docs/ivt-anh/`, tên đúng như mục 8.
  2. Agent ghi vào đầu mục 8 tên máy và độ phân giải ảnh. Tính hệ số điểm ảnh: bề rộng ảnh chia bề rộng logic của máy (iPhone 13: 1170 / 390 = 3).
  3. Đo từng mục trong bảng 5.2 trên ảnh bằng Python `PIL`, chia cho hệ số, điền cột "Số đo".
  4. Chốt nhãn thanh dưới theo ảnh 01, sửa mục 2 phần "Còn mở".
  5. Đối chiếu bảng mục 4 với ảnh, sửa chỗ sai.
- Không làm: không sửa `src/`.
- Nghiệm thu: bảng 5.2 không còn ô trống; mục 2 hết phần "Còn mở".

### Đợt 1. Khung, thanh trên, thanh dưới

- Bắt đầu khi: đợt 0 xong. Chưa có ảnh thì làm bằng số tạm ở 5.2, ghi rõ vào nhật ký.
- Bước:
  1. Tạo `useLaMobile.ts` (6.2), `KhungApp.tsx` (6.3), sửa `App.tsx`.
  2. Tạo `MobileShell.tsx`: thanh trên (tên màn hiện tại: lấy `mod`, `slug` từ địa chỉ, gọi `timMan` rồi `tenMan(sc)` ở `registry.ts`; tab Nghiệp vụ, Khác ghi tên tab; nút quay lại khi không ở tab gốc, nút chọn chi nhánh), `<Outlet />` cuộn được, `ThanhDuoi`.
  3. `ThanhDuoi.tsx`: 4 tab Trang chủ (`/app` để `HomeRedirect` chọn màn theo vai trò), Nghiệp vụ (`/app/nghiep-vu`), Báo cáo (`/app/bao-cao/tat-ca`), Khác (`/app/khac`). Biểu tượng `ic_navigation_tab_1_v2` … `4_v2`, đổi màu theo 3.
  4. Tab sáng theo địa chỉ: `/app/trang-chu/*` là Trang chủ; `/app/bao-cao/*` là Báo cáo; `/app/khac`, `/app/danh-muc/*`, `/app/he-thong/*` là Khác; còn lại là Nghiệp vụ.
  5. Thêm `manMobile.ts` (6.4) và `MChiMayTinh.tsx`. Sửa `Screen.tsx` như 6.4. Lúc này mọi màn trên điện thoại ra `MChiMayTinh`.
  6. Thêm tạm route `nghiep-vu`, `khac` ra `MChiMayTinh`. Đợt 2 thay bằng màn thật.
  7. Thêm cờ `--dien-thoai` cho `tools/kiem_tra.py`: mở trang ở khung 390×844, đi qua 4 tab và màn đầu của mọi phân hệ đang hiện, báo lỗi console, trang trắng, tràn ngang (`document.documentElement.scrollWidth > innerWidth`).
- File: `App.tsx`, `Screen.tsx`, `src/app/KhungApp.tsx`, `src/ui/mobile/*`, `src/assets/ivt/`, `app.css`, `index.html`, `tools/kiem_tra.py`.
- Không làm: không sửa `Shell.tsx`, `Topbar.tsx`, `Sidebar`.
- Nghiệm thu:
  1. Trước khi sửa, chạy `python tools/kiem_tra.py` rồi chép `tools/shots` sang `backup/shots-truoc`. Sau khi sửa, chạy lại, so từng cặp ảnh bằng `PIL.ImageChops.difference(a, b).getbbox()`. Mọi cặp phải ra `None`, trừ vùng đồng hồ nếu có.
  2. `python tools/kiem_tra.py --nhanh` in `Không có lỗi.`
  3. `python tools/kiem_tra.py --dien-thoai` in `Không có lỗi.`
  4. Mở Chrome DevTools, chế độ thiết bị iPhone 12 Pro (390×844): thấy thanh dưới, bấm đủ 4 tab, đổi chi nhánh được.
  5. Kéo cửa sổ qua lại mốc 768px: khung đổi theo, không lỗi console.

### Đợt 2. Trang chủ, Nghiệp vụ, Khác

- Bắt đầu khi: đợt 1 đã push.
- Bước:
  1. `MTrangChu`: ảnh nền `img_bg_top_dashboard_1.png` ở đầu, lời chào và tên đơn vị trên ảnh. Dưới ảnh là thẻ số liệu lấy từ `tinhToanTongQuan`: doanh thu, chi phí, lợi nhuận, tiền. Tiếp theo là hàng truy cập nhanh 4 ô: Thu tiền, Chi tiền, Nhập kho, Xuất kho, dùng `ic_quick_access_*` nếu hợp. Cuối là khối "Cần xử lý": phiếu chưa ghi sổ, lỗi hạch toán. Gắn vào bảng `manMobile` cho `trang-chu/tong-quan` và `trang-chu/ban-lam-viec`.
  2. `MNghiepVu`: lưới 3 cột, mỗi phân hệ đang hiện (`hienPhanHe(m, s.goi)`) một ô, trừ `trang-chu`, `bao-cao`, `danh-muc`, `he-thong`. Bấm ô thì mở danh sách màn của phân hệ (`tabCua(m)` lọc `hienMan`). Màn ngoài gói có ổ khoá, bấm vào ra trang khoá như QD05.
  3. Biểu tượng ô phân hệ (sửa theo ảnh 02 nếu khác): `tien` `ic_amount`, `ban-hang` `ic_shortcut_gi_sale`, `mua-hang` `ic_shortcut_gr_purchase`, `kho` `ic_business_import`, `gia-thanh` `ic_business_price_cost`, `ccdc` `ic_calendar_renew`, `tscd` `ic_goods`, `thue` `ic_document`, `tong-hop` `ic_task_chungtu`, `tien-ich` `ic_setting`. Phân hệ mới chưa có trong bảng thì dùng `Icon` theo `m.icon`.
  4. `MKhac`: thẻ người dùng (tên, email, vai trò), nhóm "Danh mục & thiết lập" liệt kê màn của `danh-muc`, `he-thong`, nhóm "Đơn vị" (chọn đơn vị, gói), nút Đăng xuất màu đỏ.
- Không làm: biểu đồ của trang chủ bản máy tính, tuỳ chỉnh khối trang chủ.
- Nghiệm thu: ở 390×844, bấm hết ô Nghiệp vụ, mọi màn mở ra đúng địa chỉ bản máy tính; đổi gói Free, Standard, Plus, Pro thì ô và ổ khoá đổi theo; `--dien-thoai` sạch.

### Đợt 3. Danh sách chứng từ, danh mục, lọc, màn trống

- Bắt đầu khi: đợt 2 đã push.
- Bước:
  1. Tách hook `useDongChungTu` ở `VoucherScreen.tsx` (6.5). Chạy lại nghiệm thu so ảnh của đợt 1 để chắc bản máy tính không đổi.
  2. `MDanhSach`: props `{ rows, the: (r) => ReactNode, timTheo, chip?, onMo, onThem? }`. Ô tìm dính đầu, hàng chip cuộn ngang, danh sách thẻ, nút thêm nổi góc dưới phải, `MTrong` khi rỗng.
  3. `MChungTu`: có `id` trên địa chỉ thì để đợt 4 xử lý (tạm ra `MChiMayTinh`). Không có `id` thì gọi `useDongChungTu`, lọc theo `s.chiNhanh` giống `VoucherList` (tìm `cnChon` trong file đó), thẻ như 6.6. Chip: Tất cả, Chưa ghi sổ, Đã ghi sổ, Lỗi hạch toán. Màn nhiều loại phiếu (`cfg.loai`) thêm hàng chip loại phiếu. Bấm thẻ mở `` `${duongDan(mod, sc)}/${r.id}` ``. Nút thêm mở `/moi`, chọn loại bằng `MChon` nếu có `cfg.loai`. Không có nút thêm khi `cfg.khongThem`.
  4. `MLoc`: màn toàn màn, chọn khoảng ngày (Hôm nay, Tuần này, Tháng này, Tháng trước), đối tượng, nguồn. Nút Đặt lại, Áp dụng dính đáy.
  5. `MDanhMuc`: dữ liệu như 6.5, thẻ như 6.6, lọc nhóm theo `cfg.nhomLoc` bằng chip. Bấm thẻ tạm hiện toast, đợt 6 làm form.
  6. `MTrong`: hình theo màn (`img_empty_item` cho hàng hoá, `img_empty_supplier` cho nhà cung cấp, `img_search_no_result` khi tìm không ra, mặc định `img_empty_data`), một dòng chữ.
- Không làm: chọn nhiều, xoá hàng loạt, in hàng loạt, tuỳ chỉnh cột.
- Nghiệm thu: Thu chi, Mua hàng, Bán hàng, Kho (nhập, xuất, kiểm kê), Hàng hoá, Kho, Nhà cung cấp hiện thẻ; tìm, chip, lọc ra đúng số dòng như bản máy tính cùng điều kiện; bản máy tính không đổi.

### Đợt 4. Xem phiếu

- Bắt đầu khi: đợt 3 đã push.
- Bước:
  1. `MXemPhieu` mở khi địa chỉ có `id` khác `moi`. Thứ tự từ trên xuống:
     - Thẻ đầu phiếu: số phiếu, chip trạng thái, ngày giờ, đối tượng, chi nhánh, kho, diễn giải.
     - Dòng phiếu dạng thẻ: tên hàng, số lượng × đơn giá, thành tiền.
     - Khối tổng: tiền hàng, thuế, tổng.
     - Khối Hạch toán thu gọn, bấm để mở. Dùng lại `HachToan` của `ChungTuForm.tsx` nếu hiển thị ổn ở 390px, không thì tự vẽ bảng Nợ, Có, Số tiền.
     - Lịch sử: dùng lại `LichSu`.
  2. Thanh thao tác dính đáy: Sửa, Sao chép, In (mở in như bản máy tính), menu "…" cho Xoá. Ẩn nút theo đúng điều kiện bản máy tính (phiếu đã khoá sổ không sửa).
  3. Phiếu có tham chiếu (điều chuyển, sản xuất, kiểm kê, thanh toán) hiện dòng "Tham chiếu" bấm sang phiếu kia.
- Không làm: sửa ngay trên màn xem.
- Nghiệm thu: mở phiếu chi, phiếu nhập kho, phiếu kiểm kê, phiếu xuất điều chuyển; số liệu khớp bản máy tính cùng phiếu.

### Đợt 5. Lập, sửa phiếu

- Bắt đầu khi: đợt 4 đã push.
- Bước:
  1. `MChon`: tấm trượt từ dưới lên, có ô tìm, danh sách, đóng bằng vuốt xuống hoặc chạm nền. Dùng cho chọn đối tượng, kho, hàng hoá, lý do, loại phiếu.
  2. `MLapPhieu` mở ở `/moi` và ở chế độ sửa. Bước 1 đầu phiếu (ngày, đối tượng, kho, diễn giải). Bước 2 chọn hàng kiểu giỏ: danh sách hàng có nút cộng trừ số lượng, thanh dưới hiện số dòng và tổng tiền. Bước 3 xem lại rồi Lưu.
  3. Lưu bằng `themPhieu` hoặc `suaPhieu`, số phiếu `soKeTiep`, ghi nhật ký `ghiNhatKy` như `ChungTuForm.tsx`. Lưu xong về `MXemPhieu` của phiếu vừa lưu.
  4. Phiếu thu, chi không có hàng: bước 2 là các dòng lý do, số tiền.
- Không làm: phiếu kiểm kê, điều chỉnh, sản xuất, điều chuyển trên điện thoại. Các loại này ra `MChiMayTinh` ở `/moi`.
- Nghiệm thu: lập được phiếu chi, phiếu nhập kho, phiếu bán hàng trên 390px; phiếu mới hiện đầu danh sách ở cả bản điện thoại và bản máy tính khi chưa tải lại trang.

### Đợt 6. Form danh mục

- Bắt đầu khi: đợt 3 đã push.
- Bước:
  1. `MFormDm`: dùng lại `CatalogPanel` (`CatalogScreen.tsx` dòng 302) với cùng props bản máy tính truyền ở dòng 280–295. Ép panel thành toàn màn bằng CSS trong `.m-app`, nút Lưu dính đáy.
  2. `CatalogPanel` vỡ ở 390px chỗ nào thì sửa bằng CSS trong `.m-app`. Không đổi markup của panel.
- Không làm: thêm hàng loạt (`cfg.hangLoat`).
- Nghiệm thu: thêm, sửa hàng hoá, kho, nhà cung cấp, tài khoản trên 390px; ô nào cũng gõ được, không tràn ngang.

### Đợt 7. Báo cáo

- Bắt đầu khi: đợt 3 đã push.
- Bước:
  1. `MBaoCao` cho `bao-cao/tat-ca`: nhóm theo phân hệ, mỗi báo cáo một dòng tên và mã, ô tìm báo cáo.
  2. `MSoBaoCao` cho `report` và `baocao`: thanh chọn kỳ dính đầu (dùng `KY_CHON` ở `ReportScreen.tsx`), bảng cuộn ngang trong khung riêng, cột đầu đứng yên, dòng Tổng dính đáy. Bảng lấy lại `RptTable` nếu được.
  3. Báo cáo tài chính, tờ khai (giấy A4) giữ tờ giấy, thu nhỏ vừa bề rộng, chạm để phóng to.
- Không làm: thiết kế mẫu in, tuỳ chỉnh báo cáo, xuất Excel trên điện thoại.
- Lưu ý: từ T171 (13/10/2026) chỉ còn Sổ quỹ tiền mặt 2.2.1, Sổ ngân hàng 2.2.3 ở mọi chế độ; TT58 giữ thêm bộ sổ, báo cáo tài chính TT58. Đọc `giuBC` ở `src/modules/bao-cao/danh-sach.ts` trước khi làm.
- Nghiệm thu: xuất nhập tồn (màn của Kho), sổ quỹ tiền mặt, sổ ngân hàng, một báo cáo tài chính TT58 đọc được trên 390px; trang không tràn ngang, chỉ khung bảng cuộn ngang.

### Đợt 8. Đăng nhập, chọn đơn vị, popup

- Bắt đầu khi: đợt 2 đã push.
- Bước:
  1. CSS điện thoại cho `Login`, `QuenMatKhau`, `ChonDonVi` (`src/modules/auth/`), `KhoiTao`, `KhoiTaoFabi`. Các màn này nằm ngoài `/app` nên không qua `MobileShell`. Bọc CSS bằng `@media (max-width: 767px)`, không đổi markup.
  2. `OnboardFabi` và các hộp thoại khác hiện toàn màn khi ở điện thoại.
  3. Rà màn `kind: 'custom'` (lệnh `grep -rn "kind: 'custom'" src/modules`), liệt kê màn đang ra `MChiMayTinh` vào `docs/TIEN-DO.md`, mỗi màn hoặc nhóm màn một việc.
- Nghiệm thu: đi trọn từ đăng nhập, chọn đơn vị, tới lập một phiếu chi trên 390px không gặp chỗ tràn hay nút bị che.

## 8. Ảnh cần chụp từ IVT Pro

Máy chụp: _(đợt 0 điền)_. Độ phân giải ảnh: _(đợt 0 điền)_. Hệ số điểm ảnh: _(đợt 0 điền)_.

Cách chụp:

1. Dùng một điện thoại cho cả bộ ảnh, cầm dọc. Chụp cả màn hình, không cắt, không phóng to.
2. Để giao diện sáng (không bật chế độ tối), ngôn ngữ tiếng Việt, cỡ chữ hệ thống mặc định.
3. Đăng nhập IVT Pro bằng tài khoản thử có dữ liệu (bản STG). Ảnh sẽ nằm trong repo, nên không dùng tài khoản có dữ liệu khách thật.
4. Màn nào có chữ "Xem thêm", số đếm, chip trạng thái thì chụp lúc đang có dữ liệu, không chụp lúc trống (trừ ảnh 14).
5. Gửi ảnh về máy tính, đổi tên đúng cột "Tên file", bỏ vào `D:\IACC-CLOUD\Web\docs\ivt-anh\`. Định dạng PNG hoặc JPG đều được, giữ nguyên độ phân giải gốc.

| Tên file | Mở màn nào | Ảnh phải thấy |
|---|---|---|
| `01-trang-chu.png` | Mở app, đứng ở tab đầu của thanh dưới | Thanh trên, ảnh nền đầu trang, các thẻ số liệu, thanh dưới đủ tab và nhãn |
| `01b-trang-chu-cuoi.png` | Trang chủ, vuốt xuống tới cuối | Các khối dưới: truy cập nhanh, việc cần xử lý, thanh dưới |
| `02-nghiep-vu.png` | Bấm tab Nghiệp vụ | Toàn bộ lưới ô nghiệp vụ, biểu tượng, nhãn dưới ô |
| `03-ds-nhap-kho.png` | Nghiệp vụ, Nhập kho | Ô tìm, nút lọc, hàng chip trạng thái, ít nhất 3 thẻ phiếu, nút thêm |
| `04-loc.png` | Danh sách nhập kho, bấm nút lọc | Toàn màn lọc: chọn ngày, kho, trạng thái, nút Áp dụng, Đặt lại |
| `05-xem-phieu.png` | Bấm một phiếu nhập kho đã duyệt | Phần đầu phiếu: số phiếu, chip trạng thái, ngày, kho, nhà cung cấp, vài dòng hàng |
| `05b-xem-phieu-cuoi.png` | Cùng phiếu, vuốt xuống tới cuối | Dòng tổng tiền, thanh nút thao tác dưới đáy |
| `06-chon-hang.png` | Danh sách nhập kho, bấm thêm phiếu, tới bước chọn hàng | Danh sách hàng có nút cộng trừ, ô tìm hàng, thanh dưới đếm số dòng, tổng tiền |
| `07-gio-hang.png` | Chọn 2 tới 3 mặt hàng, mở giỏ hàng | Các dòng đã chọn, ô số lượng, nút Lưu hoặc Tạo phiếu |
| `08-tam-truot.png` | Trong phiếu đang lập, bấm ô chọn kho hoặc nhà cung cấp | Tấm trượt từ dưới lên: thanh kéo, tiêu đề, ô tìm, danh sách |
| `09-ds-hang-hoa.png` | Danh mục, Hàng hoá | Danh sách hàng, ô tìm, nút thêm |
| `10-form-hang-hoa.png` | Danh sách hàng hoá, bấm thêm | Các ô nhập, nhãn ô, ô bắt buộc, nút Lưu |
| `11-bao-cao.png` | Bấm tab Báo cáo | Nhóm báo cáo, tên và mô tả từng báo cáo |
| `12-xem-bao-cao.png` | Mở báo cáo xuất nhập tồn | Chọn kỳ, bảng số liệu, dòng tổng |
| `13-khac.png` | Bấm tab cuối của thanh dưới | Thẻ tài khoản, danh sách mục cài đặt, nút Đăng xuất |
| `14-trong.png` | Danh sách hàng hoá, gõ tìm một chữ không có, vd `zzzz` | Hình minh hoạ, câu báo không có kết quả |

## 9. Rủi ro và cách chặn

| Rủi ro | Chặn bằng |
|---|---|
| Đổi khung ở `App.tsx`, `Screen.tsx` làm hỏng bản máy tính | So ảnh trước, sau ở đợt 1 và đợt 3. `useLaMobile` sai thì mọi thứ chạy như cũ |
| Xung đột git với người đang sửa `ChungTuForm.tsx`, `VoucherScreen.tsx`, `CatalogScreen.tsx` | Chỉ thêm export hoặc tách hook trong các file này. Ghi file vào cột Ghi chú khi nhận việc, thấy việc khác ghi cùng file thì hỏi người đó |
| Lệch số liệu giữa hai bản | Không viết nguồn dữ liệu mới (6.5). Nghiệm thu đợt 3, 4, 7 so số với bản máy tính |
| Màn mới thêm sau này không có bản điện thoại | `manMobile` tự rơi về `MChiMayTinh`, không trắng trang |
| Lộ khoá trong APK | Không mở `assets/flutter_assets/assets/config/`. Không commit APK |
| Phông SF Pro | Không đưa lên web (mục 2) |
