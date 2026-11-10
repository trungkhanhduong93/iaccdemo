# Thiết kế luồng hoá đơn điện tử (T784, T785, T786)

- Ngày: 10/11/2026
- Người: dinhlanphuongipacc, agent: Claude Code
- Trạng thái cuối phiên: Dở dang

## Đã làm

- Thiết kế đủ luồng hoá đơn điện tử trên Artifact https://claude.ai/artifact/PSzKNtzwTpuy2574UbmwQX, chốt qua nhiều vòng góp ý. Bản lưu `docs/thiet-ke/T784-T786-hoa-don-dien-tu.html`.
- Ghi QD106 trong `docs/QUYET-DINH.md`, thay một phần QD102.
- Nhận việc T784, T785, T786 trong `docs/TIEN-DO.md`.

## Đã kiểm

- `python tools/kiem_van.py docs/QUYET-DINH.md`: 0 ĐỎ.
- Chưa sửa code nên chưa chạy typecheck, build, kiem_tra.

## Dở dang, việc tiếp theo

- Phiên này quá 60 lần gọi công cụ (QD75), dừng ở thiết kế. Code làm ở phiên mới, mỗi việc một phiên, theo thứ tự T784, T785, T786.
- T784: sửa `src/modules/ban-hang/hddt.tsx` (`NCC_HDDT`, `CauHinhHddt`, `TheCauHinhHddt`, `KY_HIEU_DUNG` nhận chữ M) và thẻ Hoá đơn điện tử ở `src/modules/he-thong/HeThong.tsx:734`. Thêm người mua mặc định, mẫu số, ký hiệu chung, bật giảm thuế, bảng mẫu số, ký hiệu theo cửa hàng.
- T785: `ChungTuForm.tsx` (ô tích Lập kèm hoá đơn dòng 1097, cột hoá đơn dòng 1264, chân form dòng 858), `ChungTuBanHang.tsx` (cột `ttPh` dòng 498, popup `HopHangLoat` trong `hddt.tsx`).
- T786: menu mới trong `src/app/registry.ts`, `SidebarFlyout.tsx`; bỏ tab 3.1.5, 3.1.6 ở `src/modules/ban-hang/index.ts`.
- `tools/xuat_bao_cao_he_thong.py` vẫn lỗi thiếu module `build_present` trên máy này, chưa làm mới `docs/IACC-Cloud-Chi-Tiet-He-Thong.xlsx`.

## Bẫy, quyết định mới

- QD106 (chờ Trum duyệt).
