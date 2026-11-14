// Chứng từ bán hàng: mỗi cửa hàng một chứng từ mỗi ngày, gom từ đơn POS trên FABi. Số khớp KQKD, Tổng quan.
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Col, Row, ScreenProps, VoucherCfg } from '../types'
import { duongDan, tenMan } from '../../app/registry'
import { cuaHangHienTai, gtgtTyLe, useSession } from '../../app/session'
import { kieuGhiSo, kieuGhiSoDv } from '../../app/plan'
import { CHE_DO } from '../../app/che-do'
import { CUA_HANG, DAILY, HANG, KHACH, cnTen, soBH } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { NutPhimTat } from '../../ui/BangPhimTat'
import { Card, Note, PageHead } from '../../ui/Page'
import { FormToanMan, useDong } from '../../ui/FormToanMan'
import { BaoCaoDoRongCtx, St, Table, useDoRongCot } from '../../ui/Table'
import { dmy, fold, money, moneyD, rng } from '../../ui/format'
import { ChonHaiCot, type MucHaiCot } from '../../ui/ChonHaiCot'
import { OChonMot } from '../../ui/OChonMot'
import { Dropdown } from '../../ui/Dropdown'
import { PhanTrang } from '../../ui/PhanTrang'
import { dsTraBanCon, useDaXoa } from '../../ui/generic/daXoa'
import { ChonKhoangNgay, docNgay, thangMacDinh, trongKhoang, type KhoangNgay } from '../../ui/ChonNgay'
import { NutDongBo, NutExcel, NutThemMoiSplit } from '../../ui/CongCuDs'
import { HopDongBo } from '../../ui/HopDongBo'
import { IconFigmaSearch, IconFigmaSheet } from '../../ui/IconFigma'
import { dangLoc, dsGiaTri, khopLoc, type GiaTriLoc, type KieuLoc, type LocCot } from '../../ui/LocCot'
import {
  BoLoc, ChipTrangThai, NutTuyChinhCot, cotChon, useCauHinhLoc, useCotDs, useLocNhap, type Chip, type OLocDef,
} from '../../ui/LocNangCao'
import { HopInChungTu, type PhieuIn } from '../../ui/bao-cao/InChungTu'
import { giaVonBq, tienVon, useGiaVonBq } from '../kho/tinh-gia-von/giaVonBq'
import { NGUON, TT_CT, tomTatTenHang, type Dong } from '../../ui/generic/gen'
import { ChungTuForm } from '../../ui/generic/ChungTuForm'
import { dongTuHang, dtDong, tinhDong } from './BangHangBan'
import { HopCotPhieu } from '../../ui/generic/BangSua'
import { DS_PTTT } from '../danh-muc/data'
import { cauHinhGiamVat, giamThueHang, giamThueHkd, hangDuocGiam } from './giam-thue'
import {
  HopXemHd, HopXuatHddt, TEN_LOAI_CT, dauDong, dkCtMau, dsHdMoiCon, hdCua, hdGocCua, hdMau, laHdMoiCua, loaiCtCua, mauTuGoc, soHdMau, tenHd, thayTheNhap, ttHdGoc,
  KHACH_TRONG, type CtLq, type HdDaXuat, type HdGoc,
} from './hddt'

/** Bán hàng ngoài POS: tiệc mang về, khách công ty đặt trước. Lập tay, không qua FABi; là tab Bán hàng 3.1.7 từ gói Plus (T52) */
export const NGOAI_POS: VoucherCfg = {
  prefix: 'BH', doiTuong: 'kh', nhan: 'Khách hàng', them: 'Thêm phiếu bán hàng', dong: 'hang', tien: [0, 0], nguon: 'tay', soPhieu: 80, soTT58: 'Sổ doanh thu bán hàng hoá, dịch vụ',
  dienGiai: ['Bán tiệc mang về cho khách công ty', 'Bán set quà Trung thu'], noCo: [['1111', '5111', 'Doanh thu'], ['1111', '33311', 'Thuế GTGT đầu ra'], ['632', '152', 'Giá vốn']],
}

/** Gói Plus (T753): màn Xuất bán POS gọi là Bán hàng, lưu chứng từ FABi, Thủ công, Excel; lập tay theo form chung,
 *  dòng hàng như Xuất bán POS. Chứng từ FABi giữ như gói Standard: chỉ xem */
export const BAN_TAY: VoucherCfg = { ...NGOAI_POS, them: 'Thêm chứng từ bán hàng', dongPos: true, dienGiai: ['Bán tiệc cho khách công ty', 'Bán set quà Trung thu', 'Bán suất ăn hội nghị'] }
const laPlus = (goi: string) => goi === 'PL'
/** Màn chứng từ bán hàng lập tay gói Plus: nơi lưu hoá đơn thay thế, huỷ bán, hoá đơn điều chỉnh (T787) */
export const MAN_BAN = 'ban-hang/3-1-1'
/** Chứng từ mẫu lập tay, nhập từ Excel: số, số ngày lùi so với ngày cuối dữ liệu, giờ, cửa hàng thứ mấy, khách, diễn giải, nguồn,
 *  dòng hàng [hàng thứ mấy, số lượng, % giảm giá, % CK, % phí dịch vụ] */
const MAU_TAY: [string, number, string, number, number, string, string, [number, number, number, number, number][]][] = [
  ['BH2610-0008', 1, '18:30', 0, 1, 'Bán tiệc cuối năm cho khách công ty', 'tay', [[1, 30, 0, 5, 5], [8, 30, 0, 5, 5]]],
  ['BH2610-0004', 3, '11:00', 1, 2, 'Bán suất ăn hội nghị', 'excel', [[2, 40, 10, 0, 0], [6, 40, 0, 0, 0]]],
  ['BH2610-0001', 6, '09:15', 0, 0, 'Bán set quà Trung thu', 'excel', [[3, 12, 0, 0, 0]]],
  ['BH2609-0004', 9, '19:45', 0, 3, 'Đặt bàn sinh nhật, thu phí dịch vụ', 'tay', [[0, 15, 0, 0, 10], [5, 15, 0, 0, 10]]],
  // Thêm 6 chứng từ lập tay tháng 10 (T790): tay-6, tay-8, tay-9 đã xuất HĐĐT (HD_MAU ở hddt.tsx), tay-4, tay-5, tay-7 chưa xuất
  ['BH2610-0009', 0, '20:15', 0, 3, 'Bán suất ăn tối cho văn phòng', 'tay', [[0, 20, 0, 0, 0], [4, 20, 0, 0, 0]]],
  ['BH2610-0007', 1, '17:40', 1, 1, 'Bán set quà tặng khách hàng', 'tay', [[3, 25, 5, 0, 0]]],
  ['BH2610-0006', 2, '12:10', 0, 2, 'Bán tiệc tất niên phòng kinh doanh', 'tay', [[1, 18, 0, 0, 5], [5, 18, 0, 0, 5], [7, 36, 0, 0, 5]]],
  ['BH2610-0005', 3, '15:30', 0, 4, 'Bán bánh trung thu cho đối tác', 'tay', [[3, 50, 10, 0, 0]]],
  ['BH2610-0003', 4, '19:00', 0, 1, 'Bán tiệc khai trương chi nhánh', 'tay', [[0, 40, 0, 5, 0], [2, 40, 0, 5, 0], [6, 40, 0, 5, 0]]],
  ['BH2610-0002', 5, '11:30', 0, 5, 'Bán suất ăn hội thảo', 'tay', [[2, 60, 0, 0, 0], [8, 60, 0, 0, 0]]],
  // Chứng từ gốc có hoá đơn thay thế, điều chỉnh mẫu (T795): tay-10 bị thay thế, tay-11 bị điều chỉnh, tay-12 có thay thế dự thảo, tay-13 có điều chỉnh dự thảo
  ['BH2610-0010', 6, '10:20', 0, 1, 'Bán tiệc hội nghị khách hàng', 'tay', [[0, 25, 0, 0, 0], [2, 25, 0, 0, 0]]],
  ['BH2610-0011', 6, '16:45', 0, 2, 'Bán suất ăn đào tạo nhân viên', 'tay', [[1, 30, 0, 0, 0], [6, 30, 0, 0, 0]]],
  ['BH2610-0012', 1, '12:30', 0, 4, 'Bán set quà tặng đối tác', 'tay', [[3, 20, 0, 0, 0]]],
  ['BH2610-0013', 1, '19:10', 0, 1, 'Bán tiệc mừng thọ', 'tay', [[0, 12, 0, 0, 5], [5, 12, 0, 0, 5]]],
  // Hoá đơn gốc kỳ 6 tháng đầu năm 2026 đã nộp tờ khai, có điều chỉnh phát hành tháng 8 (T788): tay-14, ngày 26/06/2026
  ['BH2606-0003', 103, '11:20', 0, 2, 'Bán suất ăn hội nghị khách hàng', 'tay', [[2, 30, 0, 0, 0], [6, 30, 0, 0, 0]]],
  // Hoá đơn máy tính tiền mẫu (T799): cửa hàng thứ hai, ký hiệu C26MAB; tay-15, 16 có thay thế, điều chỉnh đã phát hành chưa gửi CQT, tay-17, 18 có dự thảo
  ['BH2610-0014', 5, '12:15', 1, 3, 'Bán suất ăn trưa cho văn phòng', 'tay', [[0, 15, 0, 0, 0], [4, 15, 0, 0, 0]]],
  ['BH2610-0015', 5, '18:40', 1, 1, 'Bán tiệc sinh nhật tại quán', 'tay', [[1, 20, 0, 0, 5], [5, 20, 0, 0, 5]]],
  ['BH2610-0016', 4, '11:50', 1, 2, 'Bán set quà tặng khách hàng', 'tay', [[3, 10, 0, 0, 0]]],
  ['BH2610-0017', 4, '19:30', 1, 4, 'Bán tiệc liên hoan phòng ban', 'tay', [[0, 18, 0, 0, 0], [2, 18, 0, 0, 0]]],
]
/** Hoá đơn thay thế, điều chỉnh mẫu (T795): id, số chứng từ, loại, chứng từ gốc, lý do; điều chỉnh giảm kèm dòng giảm [hàng thứ mấy, số lượng];
 *  ngày lập, bỏ trống là ngày cuối dữ liệu. Có số hoá đơn ở HD_MAU (hddt.tsx) là đã phát hành, không có là dự thảo. Thay thế sinh kèm huỷ bán như khi lập trên form */
const MAU_HD_MOI: [string, string, 'HDTHAYTHE' | 'HDDIEUCHINH', string, string, [number, number][], string?][] = [
  ['tay-tt1', 'HDTT2610-0001', 'HDTHAYTHE', 'tay-10', 'Sai tên đơn vị người mua', []],
  ['tay-dc1', 'HDDC2610-0001', 'HDDIEUCHINH', 'tay-11', 'Giảm số lượng suất ăn khách trả lại', [[1, 5]]],
  ['tay-tt2', 'HDTT2610-0002', 'HDTHAYTHE', 'tay-12', 'Sai mã số thuế người mua', []],
  ['tay-dc2', 'HDDC2610-0002', 'HDDIEUCHINH', 'tay-13', 'Giảm giá theo thoả thuận sau bán', [[0, 2]]],
  // Điều chỉnh hoá đơn kỳ đã nộp tờ khai: màn Kê khai thuế nhắc lập tờ khai bổ sung (T788)
  ['tay-dc3', 'HDDC2608-0001', 'HDDIEUCHINH', 'tay-14', 'Giảm số suất ăn hội nghị không phục vụ', [[2, 5]], '14/08/2026'],
  // Hoá đơn máy tính tiền (T799): tay-tt3, tay-dc4 đã phát hành chưa gửi CQT; tay-tt4, tay-dc5 dự thảo
  ['tay-tt3', 'HDTT2610-0003', 'HDTHAYTHE', 'tay-15', 'Sai địa chỉ người mua', []],
  ['tay-dc4', 'HDDC2610-0003', 'HDDIEUCHINH', 'tay-16', 'Giảm số lượng khách huỷ đặt', [[1, 4]]],
  ['tay-tt4', 'HDTT2610-0004', 'HDTHAYTHE', 'tay-17', 'Sai tên người mua', []],
  ['tay-dc5', 'HDDC2610-0004', 'HDDIEUCHINH', 'tay-18', 'Giảm số suất ăn trả lại', [[0, 3]]],
]
/** Giờ lập của từng hoá đơn mới mẫu, theo thứ tự MAU_HD_MOI */
const GIO_HD_MOI = ['09:30', '10:15', '14:00', '15:20', '08:45', '10:40', '11:05', '16:10', '16:35']
let mauTayDa: Row[] | null = null
export function mauTay(): Row[] {
  if (mauTayDa) return mauTayDa
  const cuoi = DAILY.reduce((a, x) => (x.date > a ? x.date : a), DAILY[0].date)
  const ds0: Row[] = MAU_TAY.map(([so, lui, gio, cn, kh, dienGiai, nguon, ds], i) => {
    const ngay = new Date(cuoi.getFullYear(), cuoi.getMonth(), cuoi.getDate() - lui)
    const ch = CUA_HANG[cn % CUA_HANG.length]
    const dong: Dong[] = ds.map(([h, sl, pt, ptCk, ptPhiDv]) => tinhDong(dongTuHang(HANG[h % HANG.length], sl), { pt, ptCk, ptPhiDv }))
    return { id: `tay-${i}`, so, ngay: `${dmy(ngay)} ${gio}`, cn: ch.ten, doiTuong: KHACH[kh % KHACH.length].ten, dienGiai, nguon, tt: 'ghi', _dong: dong, kenh: ['Tại quán', 'Mang về', 'GrabFood'][i % 3],
      _httt: i % 2 ? 'congno' : 'tienmat', _kho: ch.kho?.[0] ?? '', _ngayTao: `${dmy(ngay)} ${gio}`, _nguoiTao: nguon === 'excel' ? 'Nhập từ Excel' : 'Hồ Thị Mai' }
  })
  // Hoá đơn mới lập ngày cuối dữ liệu; hoá đơn gốc ghi mẫu số trống để hdMau điền theo gói (mẫu 1 hoặc 2), ký hiệu theo cửa hàng
  const ngayMoi = dmy(cuoi), them: Row[] = []
  MAU_HD_MOI.forEach(([id, so, loai, idGoc, lyDo, giam, ngayLap = ngayMoi], i) => {
    const goc = ds0.find(r => r.id === idGoc)!
    const hdGoc: HdGoc = { id: idGoc, so: String(goc.so), hd: { mau: '', kyHieu: '', so: String(soHdMau(idGoc)).padStart(8, '0'), ngay: String(goc.ngay).split(' ')[0], ma: '' } }
    const dongGoc = goc._dong as Dong[]
    const dong = loai === 'HDTHAYTHE' ? dongGoc
      : dauDong(giam.map(([h, sl]) => tinhDong(dongTuHang(HANG[h % HANG.length], sl), {})), -1)
    const chung = { cn: goc.cn, doiTuong: goc.doiTuong, kenh: goc.kenh, _httt: goc._httt, _kho: goc._kho, nguon: 'tay', tt: 'ghi',
      ngay: `${ngayLap} ${GIO_HD_MOI[i]}`, _ngayTao: `${ngayLap} ${GIO_HD_MOI[i]}`, _nguoiTao: 'Hồ Thị Mai' }
    const moi: Row = { ...chung, id, so, dienGiai: lyDo, _dong: dong, _loaiCt: loai, _hdGoc: hdGoc, _lyDoHd: lyDo, _ngayHd: ngayLap,
      ...(loai === 'HDDIEUCHINH' ? { _dcLoai: 'giam' } : {}) }
    const ct: CtLq[] = [{ id, so, loai }]
    if (loai === 'HDTHAYTHE') {
      const idHb = `${id}-hb`, soHb = `HBH2610-000${them.filter(r => loaiCtCua(r) === 'HUYBAN').length + 1}`
      moi._huyBan = { id: idHb, so: soHb, loai: 'HUYBAN' }
      them.push({ ...chung, id: idHb, so: soHb, _loaiCt: 'HUYBAN', _hdGoc: hdGoc, _hdTt: ct[0], _dong: dauDong(dongGoc, -1),
        dienGiai: `Do thay thế hoá đơn ${hdGoc.hd.so}`, _ghiChu: `Do thay thế hoá đơn ${hdGoc.hd.so}` })
      ct.push(moi._huyBan as CtLq)
    }
    goc._dsHdMoi = ct
    them.push(moi)
  })
  mauTayDa = [...them, ...ds0]
  return mauTayDa
}
// Hoá đơn gốc mẫu xét Bị thay thế, Bị điều chỉnh theo hoá đơn mới mẫu đã phát hành (T795); hangTay gắn hoá đơn có sẵn
let mauTayHd: Row[] | null = null
dkCtMau(MAN_BAN, () => (mauTayHd ??= mauTay().map(r => hangTay(r, false))))
/** Chứng từ lập tay, nhập Excel đổi sang dòng danh sách: tiền tính lại từ dòng hàng, tên món ở cột Diễn giải */
export function hangTay(r: Row, tyLe: boolean): Row {
  const dong = (r._dong as Dong[] | undefined) ?? []
  const dt = dong.reduce((a, d) => a + dtDong(d), 0)
  const thue = dong.reduce((a, d) => a + (d.thue || 0), 0)
  // Giảm thuế GTGT tính từng dòng theo tỷ lệ % GTGT của hàng như form, không lấy chung một tỷ lệ cho cả phiếu (T790)
  const giam = tyLe ? dong.reduce((a, d) => a + giamThueHang(dtDong(d), d.ma), 0) : 0
  // Hoá đơn mẫu đã phát hành (T786): tiền trước thuế là doanh thu tính thuế; mẫu 2 ô giữa là giảm trừ thuế, mẫu 1 là tiền thuế (T790)
  r = hdMau(r, { truoc: dt, thue: tyLe ? giam : thue, tong: tyLe ? dt - giam : dt + thue }, tyLe)
  const ngay = String(r.ngay ?? '')
  return { ...r, ngay: ngay.includes(' ') ? ngay : `${ngay} ${String(r._ngayTao ?? '').split(' ')[1] ?? ''}`.trim(),
    _cnId: CUA_HANG.find(c => c.ten === r.cn)?.id ?? '', kenh: r.kenh ?? '',
    tenHang: tomTatTenHang(dong.map(d => d.ten)), _tenHangDu: [...new Set(dong.map(d => d.ten))].join(', '),
    tien: dt, thue: tyLe ? 0 : thue, giamThue: giam, tong: tyLe ? dt - giam : dt + thue,
    mauKhHd: (h => (h ? h.mau + h.kyHieu : ''))(hdCua(r)), hddt: hdCua(r)?.so ?? '',   // T763, T765, T785; tách Mẫu số - Ký hiệu, Số hoá đơn (T791)
    // Loại chứng từ, trạng thái xuất HĐĐT, tham chiếu của hoá đơn thay thế, huỷ bán, hoá đơn điều chỉnh (T787)
    ttPh: loaiCtCua(r) === 'HUYBAN' ? 'Không xuất HĐ' : hdCua(r) ? 'Đã xuất' : laHdMoiCua(r) ? 'Dự thảo' : 'Chưa xuất',
    tenLoaiCt: TEN_LOAI_CT[loaiCtCua(r)],
    thamChieu: [hdGocCua(r)?.so, (r._huyBan as CtLq | undefined)?.so, (r._hdTt as CtLq | undefined)?.so, ...dsHdMoiCon(MAN_BAN, r).map(c => c.so), ...dsTraBanCon(r).map(c => c.so)].filter(Boolean).join(', '),   // hàng bán trả lại (T815)
    ngayTao: r.ngayTao ?? r._ngayTao, nguoiTao: r.nguoiTao ?? r._nguoiTao }
}

const TY_LE = [0.21, 0.09, 0.12, 0.14, 0.07, 0.15, 0.1, 0.09, 0.03]   // cơ cấu doanh thu theo món trong HANG

/** Giảm giá theo món trên đơn POS (mẫu): tỷ lệ theo vị trí món trong HANG */
const GIAM = [0, 0, 0.1, 0, 0.05, 0, 0, 0.1, 0]

/** Dòng món của chứng từ có giảm giá (T102): đơn giá là giá món trong danh mục, thành tiền = số lượng × đơn giá,
 *  tiền giảm đúng tỷ lệ khuyến mãi. Tổng tiền các dòng cộng lại vẫn bằng doanh thu ngày: phần chênh dồn vào món cuối
 *  (món vốn nhận phần dư khi chia doanh thu theo món) */
function dongMonGiam(dt: number, vat: number) {
  const ds = dongMon(dt).map((d, i) => {
    const r = GIAM[i] ?? 0
    if (!r) return { ...d, thanh: d.tien, giam: 0, pt: 0, ghiChu: '' }
    // món khuyến mãi: số lượng tính lại để doanh thu sau giảm sát doanh thu của món
    const sl = Math.max(1, Math.round(d.tien / (d.gia * (1 - r))))
    const thanh = sl * d.gia
    const giam = Math.round(thanh * r / 100) * 100
    const tien = thanh - giam
    return { ...d, sl, thanh, giam, tien, thue: Math.round(tien * d.ts / 100), pt: r * 100, ghiChu: 'Khuyến mãi giờ vàng' }
  })
  const cuoi = ds[ds.length - 1]
  const lech = dt - ds.reduce((a, d) => a + d.tien, 0)
  cuoi.tien += lech
  cuoi.thanh += lech
  cuoi.thue = Math.round(cuoi.tien * cuoi.ts / 100)
  // Thuế từng món cộng lại bằng thuế GTGT của ngày (T103): phần lệch làm tròn dồn vào món có thuế lớn nhất
  const lon = ds.reduce((a, d) => (d.thue > a.thue ? d : a), ds[0])
  lon.thue += vat - ds.reduce((a, d) => a + d.thue, 0)
  // Các khoản của đơn POS theo từng món (T106); dữ liệu mẫu bằng 0. Bảng không có cột Tổng tiền, tổng ở dải đáy
  // Doanh thu tính thuế = thành tiền − giảm giá − chiết khấu + phí dịch vụ + phí vận chuyển; cộng lại bằng doanh thu ngày
  return ds.map(d => {
    const o = { ptCk: 0, ck: 0, ptPhiDv: 0, phiDv: 0, giamThue: 0, phiVc: 0 }
    return { ...d, ...o, dtTruocThue: d.thanh - d.giam - o.ck + o.phiDv + o.phiVc }
  })
}

/** Dòng món của một hoá đơn FABi (T113): 1 tới 3 món, món cuối nhận phần dư; không giảm giá; thuế chia theo tiền món */
function dongMonDon(x: XPos) {
  const r = rng(`mon-${x.seed}`)
  const k = 1 + Math.floor(r() * 3)
  const chon: typeof HANG = []
  while (chon.length < k) { const h = HANG[Math.floor(r() * HANG.length)]; if (!chon.includes(h)) chon.push(h) }
  let con = x.dt
  const ds = chon.map((h, i) => {
    let sl = 1 + Math.floor(r() * 2), tien = sl * h.gia
    if (i === chon.length - 1 || tien >= con) { tien = con; sl = Math.max(1, Math.round(con / h.gia)) }
    con -= tien
    return { h, sl, tien }
  }).filter(d => d.tien > 0)
  const thue = chiaTheo(x.vat, ds.map(d => d.tien), 1)
  return ds.map((d, i) => ({
    ...d.h, stt: i + 1, sl: d.sl, tien: d.tien, thanh: d.tien, giam: 0, pt: 0, ghiChu: '', thue: thue[i],
    ptCk: 0, ck: 0, ptPhiDv: 0, phiDv: 0, giamThue: 0, phiVc: 0, dtTruocThue: d.tien,
  }))
}

export type NgayPOS = (typeof DAILY)[number]

/** Dòng món của chứng từ: hoá đơn FABi lấy món của đơn, chứng từ gộp chia doanh thu theo cơ cấu món */
export function dongCuaPhieu(x: NgayPOS) {
  return (x as XPos).loai === 'don' ? dongMonDon(x as XPos) : dongMonGiam(x.dt, x.vat)
}

/** Giảm thuế GTGT của một phiếu POS theo từng món (T780): tổng giảm thuế từng dòng hàng đúng QD97 */
export function giamThuePhieu(x: NgayPOS): number {
  return dongCuaPhieu(x).reduce((a, d) => a + giamThueHang(d.dtTruocThue, d.ma), 0)
}

export { giamThueHkd }
/** GTGT theo % doanh thu không có VAT (T450): chia lại tiền các phương thức thanh toán theo tổng = doanh thu − giảm thuế GTGT (T353, T780) */
export function ttHkd<T extends NgayPOS>(x: T): T {
  const cu = x.tm + x.ck + x.the + x.app || 1
  const [tm, ck, the, app] = chiaTheo(x.dt - giamThuePhieu(x), [x.tm / cu, x.ck / cu, x.the / cu, x.app / cu], 1)
  return { ...x, tm, ck, the, app }
}

/** Cột theo phương pháp GTGT (T163, T450): theo % doanh thu bỏ Thuế suất, Tiền thuế, luôn hiện Giảm thuế GTGT; khấu trừ luôn hiện Thuế suất, Tiền thuế */
const anTheoLoai = (an: string[], tyLe: boolean) => tyLe ? [...an.filter(k => k !== 'giamThue'), 'ts', 'thue'] : an.filter(k => k !== 'ts' && k !== 'thue')

function dongMon(dt: number) {
  let con = dt
  return HANG.map((h, i) => {
    const tien = i === HANG.length - 1 ? con : Math.round(dt * TY_LE[i] / h.gia) * h.gia
    con -= tien
    const sl = Math.max(1, Math.round(tien / h.gia))
    return { ...h, sl, tien, thue: Math.round(tien * h.ts / 100), stt: i + 1 }
  })
}

// ── Cách đồng bộ bán hàng FABi (T113): mỗi hoá đơn một chứng từ, hoặc tổng hợp theo kênh mỗi ngày, cửa hàng ──
/** Một chứng từ Xuất bán POS: số liệu của phần doanh thu ngày mà chứng từ gánh; loai 'don' là một hoá đơn FABi */
export type XPos = NgayPOS & { kenh: string; gio: string; loai: 'don' | 'kenh'; seed: string }
const KENH: [string, string][] = [['tq', 'Tại quán'], ['mv', 'Mang về'], ['app', 'App giao đồ ăn']]
const KT_FABI = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
/** Số hoá đơn FABi 12 ký tự, cố định theo hạt giống */
export function soFabi(seed: string) {
  const r = rng(seed)
  return Array.from({ length: 12 }, () => KT_FABI[Math.floor(r() * KT_FABI.length)]).join('')
}
/** Chia doanh thu ngày cho các phần theo tỷ lệ; phần cuối nhận số dư để cộng lại đúng số ngày */
export function chiaTheo(tong: number, ty: number[], tron = 1000) {
  const s = ty.reduce((a, b) => a + b, 0) || 1
  let con = tong
  return ty.map((t, i) => {
    if (i === ty.length - 1) return con
    const v = Math.round(tong * t / s / tron) * tron
    con -= v
    return v
  })
}
/** Khách lấy hoá đơn GTGT trên đơn POS (mẫu, T613) */
const KHACH_VAT = [
  { ten: 'HỘ KINH DOANH NGUYỄN THỊ MAI TRANG 83', diaChi: '16 Tuệ Tĩnh, Phường Hai Bà Trưng, Thành phố Hà Nội', mst: '001183043719', nguoiMua: 'Nguyễn Văn An' },
  { ten: 'CÔNG TY TNHH THƯƠNG MẠI MINH PHÁT', diaChi: '25 Lý Thường Kiệt, Phường Cửa Nam, Thành phố Hà Nội', mst: '0108765432', nguoiMua: 'Trần Thu Hà' },
  { ten: 'CÔNG TY CỔ PHẦN TRUYỀN THÔNG SAO VIỆT', diaChi: '88 Láng Hạ, Phường Láng, Thành phố Hà Nội', mst: '0105123987', nguoiMua: 'Lê Minh Quân' },
]
/** Thông tin đơn POS của một hoá đơn FABi (T613): số đơn trên bill theo thứ tự trong ngày; khoảng một phần ba đơn khách lấy hoá đơn GTGT */
export function donPosCua(x: XPos) {
  const r = rng(`hd-${x.seed}`)
  const soDon = String(Number(x.seed.split('-').pop()) + 1).padStart(4, '0')
  if (x.loai !== 'don' || r() > 0.35) return { soDon, khach: null, hoaDon: null }
  const khach = KHACH_VAT[Math.floor(r() * KHACH_VAT.length)]
  const nam = String(x.date.getFullYear()).slice(2)
  const maTraCuu = `MANAGER_${1000000 + Math.floor(r() * 9000000)}${Array.from({ length: 10 }, () => KT_FABI[Math.floor(r() * KT_FABI.length)]).join('')}`
  return { soDon, khach, hoaDon: { so: String(1 + Math.floor(r() * 9999)).padStart(8, '0'), kyHieu: `1C${nam}TPM`, ngay: dmy(x.date), maTraCuu } }
}
/** Hoá đơn FABi đã xuất tại máy POS (T802): nhãn VAT, cột Số hoá đơn bấm xem như chứng từ lập tay.
 *  Giữ ở _hdPos, không phải _hd, để menu Hoá đơn điện tử, tờ khai không đếm hoá đơn FABi */
export function hdFabi(x: XPos, tyLe: boolean): Row {
  const { khach, hoaDon } = donPosCua(x)
  if (!hoaDon) return {}
  const giam = tyLe ? giamThuePhieu(x) : 0
  const hd: HdDaXuat = { mau: hoaDon.kyHieu[0], kyHieu: hoaDon.kyHieu.slice(1), so: hoaDon.so, ngay: hoaDon.ngay, ma: `M${hoaDon.kyHieu.slice(2, 4)}-${(0x2b1c07 + Number(hoaDon.so) * 7919).toString(16).toUpperCase()}`, traCuu: hoaDon.maTraCuu,
    nguoiMua: khach?.nguoiMua, truoc: x.dt, thue: tyLe ? giam : x.vat, tong: tyLe ? x.dt - giam : x.dt + x.vat }
  return { _hdPos: hd, mauKhHd: hoaDon.kyHieu, hddt: hoaDon.so, _dong: dongCuaPhieu(x), _khongLayHd: !khach,
    ...(khach ? { _khachHd: { ...KHACH_TRONG, loai: 'cty', tenDv: khach.ten, mst: khach.mst, diaChi: khach.diaChi, tenNm: khach.nguoiMua } } : {}) }
}
/** Hoá đơn của dòng danh sách: hoá đơn phát hành ở phần mềm, hoặc hoá đơn FABi xuất tại máy POS (T802) */
const hdDong = (r: Row) => hdCua(r) ?? (r._hdPos as HdDaXuat | undefined)
/** Tổng hợp theo kênh: tại quán, mang về chia phần thu tại quầy 70/30; app giao đồ ăn theo tiền app */
export function theoKenh(x: NgayPOS): XPos[] {
  const tt = x.tm + x.ck + x.the + x.app || 1
  const ty = [(1 - x.app / tt) * 0.7, (1 - x.app / tt) * 0.3, x.app / tt]
  const dt = chiaTheo(x.dt, ty), vat = chiaTheo(x.vat, ty, 1), don = chiaTheo(x.don, ty, 1), gv = chiaTheo(x.gv, ty)
  const quay = x.tm + x.ck + x.the || 1
  return KENH.map(([ma, ten], i) => {
    const tien = dt[i] + vat[i]
    const app = ma === 'app' ? tien : 0
    const [tm, ck, the] = ma === 'app' ? [0, 0, 0] : chiaTheo(tien, [x.tm / quay, x.ck / quay, x.the / quay])
    return { ...x, dt: dt[i], vat: vat[i], don: don[i], gv: gv[i], tm, ck, the, app, kenh: ten, gio: '23:30', loai: 'kenh' as const, seed: `${x.cn}-${dmy(x.date)}-${ma}` }
  }).filter(p => p.dt > 0)
}
/** Chi tiết: mỗi đơn POS một hoá đơn; giờ trải từ 09:00 tới 22:00, kênh và phương thức theo tỷ lệ của ngày */
export function theoDon(x: NgayPOS): XPos[] {
  const r = rng(`don-${x.cn}-${dmy(x.date)}`)
  const n = Math.max(1, x.don)
  const w = Array.from({ length: n }, () => 0.4 + r())
  const dt = chiaTheo(x.dt, w), vat = chiaTheo(x.vat, w, 1), gv = chiaTheo(x.gv, w)
  const tt = x.tm + x.ck + x.the + x.app || 1
  return dt.map((d, i) => {
    const p = r() * tt
    const pt = p < x.app ? 'app' : p < x.app + x.tm ? 'tm' : p < x.app + x.tm + x.ck ? 'ck' : 'the'
    const kenh = pt === 'app' ? 'App giao đồ ăn' : r() < 0.7 ? 'Tại quán' : 'Mang về'
    const phut = 9 * 60 + Math.floor((i + r()) * 13 * 60 / n)
    const tien = d + vat[i]
    return {
      ...x, dt: d, vat: vat[i], gv: gv[i], don: 1, tm: pt === 'tm' ? tien : 0, ck: pt === 'ck' ? tien : 0, the: pt === 'the' ? tien : 0, app: pt === 'app' ? tien : 0,
      kenh, gio: `${String(Math.floor(phut / 60)).padStart(2, '0')}:${String(phut % 60).padStart(2, '0')}`, loai: 'don' as const, seed: `${x.cn}-${dmy(x.date)}-${i}`,
    }
  })
}

export function ChungTuBanHang({ sc, mod }: ScreenProps) {
  const { id } = useParams()
  const { s, toast } = useSession()
  const loc = useLocation()
  const [sp] = useSearchParams()
  const { ban, laDaXoa, phieuMoi, apSua } = useDaXoa(`${mod.key}/${sc.slug}`)
  const [moHd, setMoHd] = useState(false)   // popup xuất hoá đơn điện tử ở chi tiết chứng từ lập tay (T763)
  const tyLe = gtgtTyLe(s)
  const plus = laPlus(s.goi)
  const scHien = plus ? { ...sc, ten: 'Bán hàng' } : sc
  const tatCa = useMemo(() => DAILY.filter(x => x.date.getMonth() >= 8).slice().reverse().flatMap(x => theoDon(x).reverse())   // đồng bộ FABi chỉ kéo chi tiết, mỗi hoá đơn một chứng từ (T247)
   
    .map((x, i) => ({
      id: String(i), so: soFabi(`fabi-${x.seed}`), ngay: dmy(x.date), gio: x.gio, thang: x.date.getMonth() + 1, cn: cnTen(x.cn), x, kenh: x.kenh,
      dienGiai: x.loai === 'don' ? `Hoá đơn FABi ${x.kenh.toLowerCase()} ${x.gio} ngày ${dmy(x.date).slice(0, 5)}` : `Doanh thu ${x.kenh.toLowerCase()} ${x.don} đơn POS ngày ${dmy(x.date).slice(0, 5)}`,
      doiTuong: donPosCua(x).khach?.ten ?? 'Khách lẻ POS',
      tenHang: tomTatTenHang(monCua(x).map(m => m.ten)), _tenHangDu: [...new Set(monCua(x).map(m => m.ten))].join(', '),   // cột Diễn giải là tên món trong phiếu (T286)
      // GTGT theo % doanh thu: không tiền thuế, tổng tiền = doanh thu − giảm thuế GTGT (T163, T780)
      tien: x.dt, thue: tyLe ? 0 : x.vat, giamThue: tyLe ? giamThuePhieu(x) : 0, tong: tyLe ? x.dt - giamThuePhieu(x) : x.dt + x.vat, nguon: 'FABi', tt: i < 3 ? 'nhap' : 'ghi',
      tenLoaiCt: 'Xuất bán POS',   // chứng từ FABi đồng bộ về, cột Loại chứng từ (T791)
      ngayTao: `${dmy(x.date)} 23:30`, nguoiTao: 'Hệ thống',   // tạo khi đồng bộ FABi cuối ngày (T132)
      ...hdFabi(x, tyLe),
    })), [tyLe])
  // Gói Plus: thêm chứng từ lập tay, nhập Excel; xếp chung với chứng từ FABi theo ngày mới nhất trước (T753)
  const rows = useMemo(() => {
    const tay = plus ? [...phieuMoi, ...mauTay()].map(apSua).map(r => hangTay(r, tyLe)) : []
    const ds = [...tay, ...tatCa].filter(r => !laDaXoa(r.id))
    if (!tay.length) return ds
    const t = (r: Row) => { const [d, g = ''] = String(r.ngay).split(' '); return docNgay(d).getTime() + (Number(g.slice(0, 2)) * 60 + Number(g.slice(3, 5)) || 0) * 60000 }
    return ds.map((r, i) => ({ r, i, t: t(r) })).sort((a, b) => b.t - a.t || a.i - b.i).map(x => x.r)
  }, [tatCa, ban, plus, tyLe])   // eslint-disable-line react-hooks/exhaustive-deps
  const dongXem = id && id !== 'moi' ? rows.find(r => r.id === id) : undefined
  // Lập hoá đơn thay thế, điều chỉnh từ menu Hoá đơn điện tử (T787): ?lap=tt|dc&goc=id chứng từ gốc đã phát hành hoá đơn
  const lap = sp.get('lap'), gocLap = rows.find(r => String(r.id) === sp.get('goc'))
  if (id === 'moi' && plus && (lap === 'tt' || lap === 'dc')) {
    if (!gocLap || !hdCua(gocLap)) return <Navigate to={duongDan(mod, sc)} replace />
    return <ChungTuForm key={loc.key} sc={scHien} mod={mod} cfg={BAN_TAY} rows={rows} hdDienTu lapHd={mauTuGoc(gocLap, lap === 'tt' ? 'HDTHAYTHE' : 'HDDIEUCHINH')} />
  }
  if (id === 'moi') return plus ? <ChungTuForm key={loc.key} sc={scHien} mod={mod} cfg={BAN_TAY} rows={rows} hdDienTu />
    : <Navigate to={duongDan(mod, sc)} replace />   // gói Standard không lập tay Xuất bán POS (T52)
  if (dongXem && dongXem.nguon !== 'FABi') {
    const hd = hdCua(dongXem)
    // Hoá đơn gốc: Bị thay thế, Bị điều chỉnh khi hoá đơn mới đã phát hành; còn dự thảo thì nhắc (T787)
    const ttGoc = ttHdGoc(MAN_BAN, dongXem), nhapTt = thayTheNhap(MAN_BAN, dongXem)
    return (
      // phát hành xong vẽ lại form để ô Số hoá đơn, Ký hiệu, Ngày hoá đơn lấy số mới (T763)
      // Đã xuất: nhãn mã tra cứu ở thanh Thanh toán, số hoá đơn ở cột hoá đơn nên bỏ chip HĐ đầu form (T785)
      <ChungTuForm key={`${loc.key}-${hd?.so ?? ''}`} sc={scHien} mod={mod} cfg={BAN_TAY} row={dongXem} rows={rows} hdDienTu
        metaThem={ttGoc ? <span className="chip warn">{ttGoc}</span> : nhapTt ? <span className="chip">Đang có hoá đơn thay thế dự thảo {nhapTt.so}</span> : undefined}
        chanThem={!hd && loaiCtCua(dongXem) === 'XBAN' && <button type="button" className="xp-btn-outline" onClick={() => setMoHd(true)}><Icon n="receipt" className="ic sm" /><span>Xuất HĐĐT</span></button>}>
        {moHd && <HopXuatHddt s={s} man={`${mod.key}/${sc.slug}`} ds={[dongXem]} onDong={() => setMoHd(false)} toast={toast} />}
      </ChungTuForm>
    )
  }
  if (id) return <ChiTiet sc={scHien} mod={mod} row={dongXem ?? rows.find(r => r.x) ?? rows[0]} />
  return <DanhSach sc={scHien} mod={mod} rows={rows} />
}

/** Cột cố định hai đầu, không ẩn, không kéo đổi thứ tự */
const COT_CO_DINH = new Set(['chk', 'stt', 'ngay', 'so'])
/** Cột lọc bằng cách chọn trong danh sách giá trị */
const COT_CHON = new Set(['cn', 'nguon', 'kenh', 'tenLoaiCt', 'ttPh'])

/** Giá trị các ô lọc ngoài và trong Bộ lọc nâng cao. Chuỗi rỗng là tất cả */
/** Ô chọn nhiều kiểu hộp tích như Mua hàng, mảng rỗng là tất cả (T801) */
interface GtLoc { thoiGian: KhoangNgay; tim: string; cn: string[]; nguon: string[]; loaiCt: string[]; kh: string; kenh: string[]; pttt: string[]; hang: string[]; tonKho: string[] }
/** Lựa chọn ô lọc Loại chứng từ (T801) */
const LOAI_CT_LOC: MucHaiCot[] = [{ v: 'POS', t: 'Xuất bán POS' }, { v: 'XBAN', t: 'Xuất bán' }, { v: 'HDDIEUCHINH', t: 'Hoá đơn điều chỉnh' }, { v: 'HDTHAYTHE', t: 'Hoá đơn thay thế' }, { v: 'HUYBAN', t: 'Huỷ bán hàng' }]
const locMacDinh = (): GtLoc => ({ thoiGian: thangMacDinh(), tim: '', cn: [], nguon: [], loaiCt: [], kh: '', kenh: [], pttt: [], hang: [], tonKho: [] })
/** Món của chứng từ để lọc theo hàng hoá, theo dõi tồn kho; nhớ lại để không tính lại mỗi lần lọc */
const MON_CUA = new WeakMap<object, { ma: string; ten: string; tonKho: boolean }[]>()
function monCua(x: NgayPOS) {
  let ds = MON_CUA.get(x)
  if (!ds) { ds = dongCuaPhieu(x).map(d => ({ ma: d.ma, ten: d.ten, tonKho: Boolean(d.tonKho) })); MON_CUA.set(x, ds) }
  return ds
}
/** Phương thức thanh toán của chứng từ theo số tiền thu được (T116, T137) */
export const PTTT: [keyof NgayPOS, string][] = [
  ['tm', DS_PTTT.find(p => p.ma === 'TM')?.ten ?? 'Tiền mặt'],
  ['ck', DS_PTTT.find(p => p.ma === 'CK')?.ten ?? 'Chuyển khoản, QR'],
  ['the', DS_PTTT.find(p => p.ma === 'THE')?.ten ?? 'Thẻ'],
  ['app', DS_PTTT.find(p => p.ma === 'APP')?.ten ?? 'App giao đồ ăn'],
]
export const ptttCua = (x: NgayPOS) => PTTT.filter(([k]) => Number(x[k]) > 0).map(([, t]) => t)

// Dữ liệu mẫu đồng bộ POS (T697 theo bản mẫu artifact 5)
export const MON_POS: Record<string, [string, string, number]> = {
  'CF-SD': ['Cà phê sữa đá', 'Ly', 29000], 'TD-CS': ['Trà đào cam sả', 'Ly', 45000], 'TS-TC': ['Trà sữa trân châu', 'Ly', 42000],
  'NC-CAM': ['Nước cam ép', 'Ly', 39000], 'BM-TN': ['Bánh mì thịt nướng', 'Ổ', 35000], 'PH-BO': ['Phở bò tái', 'Tô', 65000],
  'CM-GA': ['Cơm gà xối mỡ', 'Đĩa', 59000], 'BF-01': ['Bánh flan caramel', 'Cái', 25000], 'TDCS-L': ['Trà đào cam sả size L', 'Ly', 55000],
}

export const POS_OK_MAU: [string, string, string, string, string, number, string][] = [
  ['XBPOS261007-001', 'FBA4Z9K2LQ7M', '07/10/2026 07:12', 'Phố Mây Lê Lợi', 'CF-SD', 2, 'Tiền mặt'],
  ['XBPOS261007-001', 'FBA4Z9K2LQ7M', '07/10/2026 07:12', 'Phố Mây Lê Lợi', 'BM-TN', 2, 'Tiền mặt'],
  ['XBPOS261007-002', 'FBX7D1R8NW3C', '07/10/2026 07:38', 'Phố Mây Thảo Điền', 'PH-BO', 1, 'Chuyển khoản'],
  ['XBPOS261007-002', 'FBX7D1R8NW3C', '07/10/2026 07:38', 'Phố Mây Thảo Điền', 'NC-CAM', 1, 'Chuyển khoản'],
  ['XBPOS261007-003', 'FBQ3H6T1BV9K', '07/10/2026 08:05', 'Phố Mây Nguyễn Trãi', 'TS-TC', 3, 'Thẻ'],
  ['XBPOS261007-003', 'FBQ3H6T1BV9K', '07/10/2026 08:05', 'Phố Mây Nguyễn Trãi', 'TD-CS', 2, 'Thẻ'],
  ['XBPOS261007-004', 'FBL8M2W5CZ4J', '07/10/2026 08:41', 'Phố Mây Lê Lợi', 'CM-GA', 2, 'Chuyển khoản'],
  ['XBPOS261007-005', 'FBF1N9Q7XR6D', '07/10/2026 09:17', 'Phố Mây Thảo Điền', 'PH-BO', 4, 'Tiền mặt'],
  ['XBPOS261007-005', 'FBF1N9Q7XR6D', '07/10/2026 09:17', 'Phố Mây Thảo Điền', 'CF-SD', 4, 'Tiền mặt'],
  ['XBPOS261007-006', 'FBV6C3K8TM2P', '07/10/2026 10:02', 'Phố Mây Nguyễn Trãi', 'BF-01', 3, 'Tiền mặt'],
  ['XBPOS261007-007', 'FBJ2T7X4HQ8W', '07/10/2026 11:26', 'Phố Mây Lê Lợi', 'CM-GA', 6, 'Thẻ'],
  ['XBPOS261007-007', 'FBJ2T7X4HQ8W', '07/10/2026 11:26', 'Phố Mây Lê Lợi', 'NC-CAM', 6, 'Thẻ'],
  ['XBPOS261007-008', 'FBS9W5L1DK3N', '07/10/2026 11:58', 'Phố Mây Thảo Điền', 'TS-TC', 5, 'Chuyển khoản'],
  ['XBPOS261007-009', 'FBR4B8M6ZC1T', '07/10/2026 12:20', 'Phố Mây Lê Lợi', 'PH-BO', 3, 'Tiền mặt'],
]

export const POS_LOI_MAU: [string, string, string, string, number, string, 'hang' | 'pttt' | 'kho' | 'khoa', string][] = [
  ['FBH3Q8N5TW1Z', '07/10/2026 09:44', 'Phố Mây Lê Lợi', 'TDCS-L', 4, 'Chuyển khoản', 'hang', 'Mã TDCS-L chưa có ở Danh mục hàng hoá'],
  ['FBW6D2K9XM4R', '07/10/2026 10:31', 'Phố Mây Thảo Điền', 'BF-01', 6, 'Tiền mặt', 'hang', 'Mã BF-01 chưa khai ở danh mục của Thảo Điền'],
  ['FBT9L4C7QH2V', '07/10/2026 11:12', 'Phố Mây Nguyễn Trãi', 'CM-GA', 3, 'Ví MoMo', 'pttt', 'Ví MoMo của Nguyễn Trãi chưa gán tài khoản nhận tiền'],
  ['FBT9L4C7QH2V', '07/10/2026 11:12', 'Phố Mây Nguyễn Trãi', 'TS-TC', 3, 'Ví MoMo', 'pttt', 'Ví MoMo của Nguyễn Trãi chưa gán tài khoản nhận tiền'],
  ['FBK1R5X8VN6J', '07/10/2026 13:02', 'Phố Mây Thảo Điền', 'TD-CS', 2, 'Tiền mặt', 'kho', 'Cửa hàng chưa chọn kho xuất cho món pha chế'],
  ['FBB7M3W1ZQ9C', '30/09/2026 22:48', 'Phố Mây Lê Lợi', 'PH-BO', 5, 'Thẻ', 'khoa', 'Tháng 09/2026 của Lê Lợi đã khoá sổ'],
  ['FBB7M3W1ZQ9C', '30/09/2026 22:48', 'Phố Mây Lê Lợi', 'CF-SD', 3, 'Thẻ', 'khoa', 'Tháng 09/2026 của Lê Lợi đã khoá sổ'],
]

/** Tab đang đứng của từng danh sách, giữ khi mở phiếu rồi quay lại (T791) */
const TAB_NHO = new Map<string, 'all' | 'pos' | 'tay'>()

function DanhSach({ sc, mod, rows }: ScreenProps & { rows: Row[] }) {
  const { s, toast } = useSession()
  const tyLe = gtgtTyLe(s)
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const loc0 = useLocNhap(locMacDinh)
  const { nhap, dat, ap } = loc0
  const [locCot, setLocCot] = useState<Record<string, GiaTriLoc>>({})
  const [chipTab, setChipTab] = useState<'all' | 'pos' | 'tay'>(() => TAB_NHO.get(path) ?? 'all')
  useEffect(() => { TAB_NHO.set(path, chipTab) }, [path, chipTab])   // mở phiếu rồi đóng thì về đúng tab đang đứng (T791)
  const [moHopDongBo, setMoHopDongBo] = useState(false)
  const [chon, setChon] = useState<Set<string>>(new Set())   // chọn nhiều chứng từ để xuất hoá đơn điện tử (T763)
  const [moHd, setMoHd] = useState(false)
  const [xuatMot, setXuatMot] = useState<Row | null>(null)   // bấm Xuất trên dòng chưa xuất (T785)
  const [xemHd, setXemHd] = useState<Row | null>(null)   // bấm số hoá đơn ở cột Trạng thái xuất HĐĐT (T785)
  const [trang, setTrang] = useState(1)
  const [coTrang, setCoTrang] = useState(20)
  const kieu = kieuGhiSoDv(s)
  const ghi = kieu !== 'khong'   // gói Standard, Plus hộ kinh doanh đồng bộ là xong, không ghi sổ (QD81)
  // Cửa hàng chọn trên thanh trên (QD17): lọc theo cửa hàng đó, bỏ cột và ô lọc cửa hàng
  const cnChon = cuaHangHienTai(s)
  const plus = laPlus(s.goi)
  // Chứng từ lập tay, nhập Excel không có dữ liệu đơn POS: cửa hàng, món, phương thức lấy từ chứng từ (T753)
  const cnCua = (r: Row) => String(r.x?.cn ?? r._cnId ?? '')
  const monR = (r: Row) => r.x ? monCua(r.x) : ((r._dong as Dong[] | undefined) ?? []).map(d => ({ ma: d.ma, ten: d.ten, tonKho: Boolean(HANG.find(h => h.ma === d.ma)?.tonKho) }))
  const ptttR = (r: Row) => r.x ? ptttCua(r.x) : r._pttt ? [String(r._pttt)] : []

  const tenTT = (r: Row) => r.tt === 'nhap' && ghi ? 'Chưa ghi sổ' : 'Đã ghi sổ'
  const cotSo = useMemo(() => {
    const m = new Map<string, boolean>()
    return (k: string) => { if (!m.has(k)) m.set(k, typeof rows.find(r => r[k] !== undefined && r[k] !== '' && r[k] !== null)?.[k] === 'number'); return m.get(k)! }
  }, [rows])
  const kieuCot = (k: string): KieuLoc =>
    k === 'ngay' ? 'ngay' : COT_CHON.has(k) || k === 'nguyenNhan' || k === 'pttt' || k === 'dvt' ? 'chon' : k === 'tien' || k === 'thue' || k === 'tong' || k === 'sl' || k === 'dt' || cotSo(k) ? 'so' : 'chon'
  const chuCot = (k: string, r: Row): string => {
    if (k === 'tt') return tenTT(r)
    if (k === 'nguon') return (NGUON[String(r.nguon)] ?? NGUON.tay)[1]
    if (k === 'nguyenNhan') {
      const LY_TEN: Record<string, string> = {
        hang: 'Món chưa có trong danh mục',
        pttt: 'PTTT chưa map tài khoản',
        kho: 'Chưa chọn kho xuất',
        khoa: 'Kỳ đã khoá sổ',
      }
      return LY_TEN[String(r.lyDo)] ?? String(r.lyDo ?? '')
    }
    const v = r[k]
    return typeof v === 'number' ? `${money(v)} ${v}` : String(v ?? '')
  }
  const layLuaChon = (k: string) => dsGiaTri(rows, r => chuCot(k, r))   // chỉ tính khi mở ô lọc (T466)

  // Ô lọc: giá trị nháp, bấm Lọc mới áp dụng (T41)
  const apLoc = () => { loc0.loc(); setTrang(1) }
  // Ô chọn nhiều có hộp tích, ô Khách hàng gõ tìm, như bộ lọc Mua hàng (T801)
  const chonO = (k: 'cn' | 'nguon' | 'loaiCt' | 'kenh' | 'pttt' | 'hang' | 'tonKho', ten: string, ds: MucHaiCot[]) => (
    <ChonHaiCot chip ds={ds} value={nhap[k]} onChange={v => dat(k, v)} nhan={ten} goiY={`Chọn ${ten.toLowerCase()}`} btnClass="ds-o-sel" />
  )
  const oLoc: OLocDef[] = [
    { k: 'thoiGian', ten: 'Thời gian', o: <ChonKhoangNgay value={nhap.thoiGian} onChange={k => dat('thoiGian', k)} /> },
    {
      k: 'tim', ten: 'Tìm kiếm', coGiaTri: Boolean(nhap.tim.trim()), o: <input className="ds-o-inp" value={nhap.tim} placeholder="Số, diễn giải" title="Tìm theo số chứng từ, diễn giải" aria-label="Tìm kiếm"
        onChange={e => dat('tim', e.target.value)} onKeyDown={e => { if (e.key === 'Enter') apLoc() }} />,
    },
    ...(cnChon ? [] : [{ k: 'cn', ten: 'Cửa hàng', coGiaTri: nhap.cn.length > 0, o: chonO('cn', 'Cửa hàng', CUA_HANG.map(c => ({ v: c.id, t: c.ten }))) }]),
    ...(plus ? [{ k: 'nguon', ten: 'Nguồn', coGiaTri: nhap.nguon.length > 0, o: chonO('nguon', 'Nguồn', [{ v: 'FABi', t: 'FABi' }, { v: 'tay', t: 'Thủ công' }, { v: 'excel', t: 'Excel' }]) }] : []),
    // Loại chứng từ: Xuất bán POS là chứng từ FABi, còn lại theo loại chứng từ lập tay (T801)
    ...(plus ? [{ k: 'loaiCt', ten: 'Loại chứng từ', coGiaTri: nhap.loaiCt.length > 0, o: chonO('loaiCt', 'Loại chứng từ', LOAI_CT_LOC) }] : []),
    // Khách hàng, kênh bán, phương thức thanh toán; lựa chọn lấy từ chính các chứng từ (T116)
    { k: 'kh', ten: 'Khách hàng', coGiaTri: Boolean(nhap.kh), o: <OChonMot ds={[...new Set(rows.map(r => String(r.doiTuong ?? '')).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi')).map(v => ({ v, t: v }))}
      value={nhap.kh} onChange={v => dat('kh', v)} nhan="Khách hàng" goiY="Chọn khách hàng" /> },
    { k: 'kenh', ten: 'Kênh bán', coGiaTri: nhap.kenh.length > 0, o: chonO('kenh', 'Kênh bán', [...new Set(rows.map(r => String(r.kenh ?? '')).filter(Boolean))].map(v => ({ v }))) },
    // Lọc theo phương thức thanh toán: mỗi chứng từ là một hoá đơn FABi (T116, T247)
    { k: 'pttt', ten: 'Phương thức thanh toán', coGiaTri: nhap.pttt.length > 0, o: chonO('pttt', 'Phương thức thanh toán', PTTT.map(([, t]) => ({ v: t }))) },
    // Hàng hoá có trong chứng từ; Theo dõi tồn kho: chứng từ có món theo dõi hoặc có món không theo dõi tồn kho (T118)
    { k: 'hang', ten: 'Hàng hoá', coGiaTri: nhap.hang.length > 0, o: chonO('hang', 'Hàng hoá', HANG.map(h => ({ v: h.ma, t: h.ten, ma: h.ma }))) },
    { k: 'tonKho', ten: 'Theo dõi tồn kho', coGiaTri: nhap.tonKho.length > 0, o: chonO('tonKho', 'Theo dõi tồn kho', [{ v: 'co', t: 'Có theo dõi tồn kho' }, { v: 'khong', t: 'Không theo dõi tồn kho' }]) },
  ]
  const [cauHinhLoc, datCauHinhLoc] = useCauHinhLoc(path, oLoc.map(o => o.k), ['thoiGian', 'tim', 'cn', 'loaiCt'])

  // Lọc theo các ô đã áp dụng, cửa hàng trên thanh trên, hàng lọc từng cột; chip trạng thái lọc sau cùng để đếm số trên chip
  const truocTT = rows.filter(r => {
    const d = r.x?.date instanceof Date ? r.x.date : docNgay(String(r.ngay).split(' ')[0])   // chứng từ lập tay ghi cả giờ (T753)
    if (!trongKhoang(d, ap.thoiGian)) return false
    if (cnChon && cnCua(r) !== cnChon.id) return false
    if (ap.cn.length && !ap.cn.includes(cnCua(r))) return false
    if (ap.nguon.length && !ap.nguon.includes(String(r.nguon ?? 'tay'))) return false
    if (ap.loaiCt.length && !ap.loaiCt.includes(r.nguon === 'FABi' ? 'POS' : loaiCtCua(r))) return false
    if (ap.kh && r.doiTuong !== ap.kh) return false
    if (ap.kenh.length && !ap.kenh.includes(String(r.kenh ?? ''))) return false
    if (ap.hang.length && !monR(r).some(m => ap.hang.includes(m.ma))) return false
    if (ap.tonKho.length && !monR(r).some(m => ap.tonKho.includes(m.tonKho ? 'co' : 'khong'))) return false
    if (ap.pttt.length && !ptttR(r).some(p => ap.pttt.includes(p))) return false
    if (ap.tim.trim() && !fold(`${r.so} ${r.dienGiai} ${r._tenHangDu}`).includes(fold(ap.tim.trim()))) return false
    for (const [k, g] of Object.entries(locCot)) {
      if (dangLoc(g) && !khopLoc(kieuCot(k), g, chuCot(k, r), typeof r[k] === 'number' ? r[k] : undefined, k === 'ngay' ? d : undefined)) return false
    }
    return true
  })
  // Bỏ chip trạng thái ghi sổ: dải đối soát đơn POS thay cho phần lọc này (T118)
  const list = truocTT
  // Gói Plus chia tab Xuất bán POS (hoá đơn FABi) và Bán hàng (lập tay, nhập Excel), thay chip Đã, Chưa đồng bộ (T762)
  const laPos = (r: Row) => r.nguon === 'FABi'
  const hienThiList = chipTab === 'pos' ? list.filter(laPos) : chipTab === 'tay' ? list.filter(r => !laPos(r)) : list
  const [activeId, setActiveId] = useState<string>(() => hienThiList[0]?.id ?? '')

  // Phân trang
  const soTrang = Math.max(1, Math.ceil(hienThiList.length / coTrang))
  const trangHienTai = Math.min(trang, soTrang)
  const pagedRows = useMemo(() => {
    const batDau = (trangHienTai - 1) * coTrang
    return hienThiList.slice(batDau, batDau + coTrang).map((r, i): Row => ({ ...r, stt: batDau + i + 1 }))
  }, [hienThiList, trangHienTai, coTrang])

  const sum = (k: string) => pagedRows.reduce((a, r) => a + Number(r[k] || 0), 0)
  const tongDs = (k: string) => hienThiList.reduce((a, r) => a + Number((r as Row)[k] || 0), 0)

  const chips: Chip[] = [
    { k: 'all', ten: 'Tất cả', mau: 'var(--blue)', so: list.length },
    { k: 'pos', ten: 'Đồng bộ từ POS', mau: 'var(--green)', so: list.filter(laPos).length },
    { k: 'tay', ten: 'Lập thủ công', mau: 'var(--orange)', so: list.filter(r => !laPos(r)).length },
  ]
  const cols: Col[] = [
    ...(plus && chipTab === 'tay' ? [cotChon(pagedRows, chon, setChon)] : []),   // chọn để phát hành HĐĐT, chỉ ở tab Bán hàng (T765)
    { k: 'stt', t: 'STT', w: 46, c: true, dinh: 'trai' },
    { k: 'ngay', t: 'Ngày', w: 100, dinh: 'trai' },
    {
      k: 'so',
      t: 'Số chứng từ',
      cls: 'code',
      w: 150,
      dinh: 'trai',
      r: r => (
        <button
          type="button"
          className="ds-link-so"
          title={String(r.so ?? '')}
          onClick={e => {
            e.stopPropagation()
            nav(`${path}/${r.id}`)
          }}
        >
          {/* Chứng từ Xuất bán POS: số FABi 12 ký tự chỉ hiện 5 ký tự cuối, rê chuột xem đủ (T802) */}
          {r.nguon === 'FABi' ? `...${String(r.so).slice(-5)}` : r.so}
          {/* Đã xuất hoá đơn điện tử: nhãn VAT trên số chứng từ, thay cột Trạng thái xuất HĐĐT (T802) */}
          {hdDong(r) && <span className="ds-so-vat" title={`Đã xuất hoá đơn ${tenHd(hdDong(r)!)}`}>VAT</span>}
        </button>
      ),
    },
    // Loại chứng từ: Bán hàng, Hoá đơn thay thế, Huỷ bán, Hoá đơn điều chỉnh, lọc ở hàng lọc của cột (T787)
    ...(plus ? [{ k: 'tenLoaiCt', t: 'Loại chứng từ', w: 150 } as Col] : []),
    // T286: Diễn giải là tên món trong phiếu, diễn giải cũ đổi tên Ghi chú
    { k: 'doiTuong', t: 'Khách hàng', w: 200 },   // T785
    { k: 'tenHang', t: 'Diễn giải', w: 260, r: r => <span title={String(r._tenHangDu ?? '')}>{r.tenHang}</span> },
    { k: 'dienGiai', t: 'Ghi chú' },
    { k: 'kenh', t: 'Kênh bán', w: 140 },   // T113
    ...(cnChon ? [] : [{ k: 'cn', t: 'Cửa hàng', cls: 'dim' } as Col]),
    { k: 'tien', t: 'Doanh thu tính thuế', num: true, w: 160 },
    tyLe ? { k: 'giamThue', t: 'Giảm thuế GTGT', num: true, w: 130 } : { k: 'thue', t: 'Tiền thuế', num: true, w: 120 },   // T163
    // bỏ cột Nguồn: Xuất bán POS chỉ có nguồn FABi (T115); gói Plus có thêm chứng từ lập tay, nhập Excel nên hiện lại (T753)
    // Hoá đơn điện tử của chứng từ lập tay (T763); hoá đơn FABi xuất tại máy POS lấy theo đơn POS (T802)
    // T765: Số hoá đơn tách cột riêng; Trạng thái phát hành ở cuối, sau Tổng tiền
    // T791: Mẫu số - Ký hiệu và Số hoá đơn tách 2 cột
    ...(plus ? [{ k: 'mauKhHd', t: 'Mẫu số - Ký hiệu', w: 140 } as Col,
      // Số hoá đơn bấm mở xem hoá đơn điện tử (T802)
      { k: 'hddt', t: 'Số hoá đơn', w: 110, r: (r: Row) => hdDong(r) ? <button type="button" className="ds-link-so" title={`Xem hoá đơn ${tenHd(hdDong(r)!)}`}
        onClick={e => { e.stopPropagation(); setXemHd(r) }}>{r.hddt}</button> : null } as Col] : []),
    ...(plus ? [{ k: 'nguon', t: 'Nguồn', w: 90, r: (r: Row) => { const [c, t] = NGUON[String(r.nguon)] ?? NGUON.tay; return <span className={`src ${c}`}>{t}</span> } } as Col] : []),
    // Chứng từ gốc, hoá đơn thay thế, huỷ bán, hoá đơn điều chỉnh tham chiếu lẫn nhau (T787)
    ...(plus ? [{ k: 'thamChieu', t: 'Tham chiếu', w: 220, r: (r: Row) => <span title={String(r.thamChieu ?? '')}>{r.thamChieu}</span> } as Col] : []),
    { k: 'ngayTao', t: 'Ngày tạo', w: 140 }, { k: 'nguoiTao', t: 'Người tạo', w: 130 },   // T132
    { k: 'tong', t: 'Tổng tiền', num: true, w: 120, dinh: 'phai' },   // Tổng tiền là cột cuối (T48), cố định bên phải (T239)
    // T802: bỏ cột Trạng thái xuất HĐĐT (đã xuất thấy qua nhãn VAT, cột Số hoá đơn). Tab Bán hàng có cột Thao tác như màn Hoá đơn điện tử:
    // Xuất HĐĐT cho chứng từ bán hàng chưa xuất, Xem hoá đơn khi đã xuất; huỷ bán, hoá đơn thay thế, điều chỉnh không xuất ở đây (T787)
    ...(plus && chipTab === 'tay' ? [{ k: 'thaoTac', t: 'Thao tác', w: 76, c: true, dinh: 'phai', r: (r: Row) => {
      const hd = hdCua(r)
      const lyXuat = hd ? 'Chứng từ đã xuất hoá đơn điện tử' : loaiCtCua(r) !== 'XBAN' ? `${TEN_LOAI_CT[loaiCtCua(r)]} không xuất hoá đơn ở danh sách này` : null
      const viec: [string, string, string, string | null, () => void][] = [
        ['xuat', 'Xuất HĐĐT', 'receipt', lyXuat, () => setXuatMot(r)],
        ['xem', 'Xem hoá đơn', 'eye', hd ? null : 'Chứng từ chưa có hoá đơn điện tử', () => setXemHd(r)],
      ]
      return (
        <span className="hddt-menu" onClick={e => e.stopPropagation()}>
          <Dropdown btnClass="icon-btn sm" align="end" width={200} title={`Thao tác với chứng từ ${r.so}`} label={<Icon n="more" className="ic sm" />}>
            {dong => viec.map(([v, ten, ic, ly, lam]) => (
              <button key={v} type="button" data-mi className="mi" disabled={Boolean(ly)} title={ly ?? undefined} onClick={() => { dong(); lam() }}>
                <span className="mi-ic"><Icon n={ic} kieu="net" className="ic sm" /></span><span className="mi-t"><b>{ten}</b></span>
              </button>
            ))}
          </Dropdown>
        </span>
      ) } } as Col] : []),
  ]
  // Thứ tự, ẩn hiện, độ rộng cột lưu theo màn (T41)
  const cot = useCotDs(path, cols, COT_CO_DINH)

  return (
    <div className="page page-voucher">
      <h1 className="sr-only">{tenMan(sc)}</h1>
      <div className="voucher-split">
        <section className="card voucher-top">
          {/* Thanh công cụ: hàng 1 BoLoc chiNutPheu, hàng 2 Tuỳ chỉnh cột và Excel bên phải (T351, T511) */}
          <div className="ds-toolbar-figma">
            <BoLoc
              ds={oLoc}
              cauHinh={cauHinhLoc}
              datCauHinh={datCauHinhLoc}
              dangLoc={loc0.dangLoc}
              khacNhap={loc0.khacNhap}
              onLoc={apLoc}
              onXoaHet={loc0.xoaNhap}
              chiNutPheu
              ngoaiRieng={{
                tim: (
                  <div key="tim" className="ds-tim-figma">
                    <IconFigmaSearch size={16} />
                    <input
                      value={nhap.tim}
                      placeholder="Số, diễn giải"
                      title="Tìm theo số chứng từ, diễn giải"
                      aria-label="Tìm kiếm"
                      onChange={e => dat('tim', e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') apLoc()
                      }}
                    />
                  </div>
                ),
              }}
            />
            {/* Gói Plus lập tay chứng từ bán hàng (T753) */}
            {plus && <div className="ds-toolbar-phai"><NutThemMoiSplit toMoi={`${path}/moi`} /></div>}
          </div>
          <div className="ds-hang-trang-thai">
            {/* Gói Plus chia tab Xuất bán POS, Bán hàng (T762); gói khác chỉ có hoá đơn FABi nên không chia */}
            {plus && (
              <ChipTrangThai
                ds={chips}
                chon={chipTab}
                onChon={k => {
                  setChipTab(k as 'all' | 'pos' | 'tay')
                  setTrang(1)
                  setChon(new Set())
                }}
              />
            )}
            <div className="ds-toolbar-phai ds-cong-cu-h2">
              {plus && chipTab === 'tay' && (
                <button type="button" className="btn sm" title="Xuất hoá đơn điện tử cho các chứng từ lập tay đã chọn"
                  onClick={() => {
                    // T785: chỉ chọn dòng đã xuất thì báo; chọn lẫn thì bỏ qua dòng đã xuất, báo số dòng bỏ qua, mở popup cho phần còn lại
                    const ds = rows.filter(r => chon.has(String(r.id)))
                    const da = ds.filter(r => hdCua(r) || r.nguon === 'FABi' || loaiCtCua(r) !== 'XBAN')   // hoá đơn thay thế, điều chỉnh, huỷ bán không xuất ở đây (T787)
                    if (!ds.length) toast('Chọn chứng từ bán hàng lập tay cần xuất hoá đơn điện tử')
                    else if (da.length === ds.length) toast(da.length === 1 ? `Chứng từ ${da[0].so} đã xuất hoá đơn điện tử.` : `${da.length} chứng từ đã chọn đều đã xuất hoá đơn điện tử.`)
                    else { if (da.length) toast(`Bỏ qua ${da.length} chứng từ đã xuất hoá đơn điện tử`); setMoHd(true) }
                  }}>
                  <Icon n="receipt" className="ic sm" />Xuất HĐĐT
                </button>
              )}
              <NutDongBo ten="máy POS" onDongBo={() => setMoHopDongBo(true)} />
              <NutExcel
                onNhap={() => toast('Nhập chứng từ bán hàng từ file Excel')}
                onXuat={() => toast(`Đã xuất ${hienThiList.length} chứng từ ra Excel`)}
              />
              <NutTuyChinhCot
                cols={cot.colsDu}
                an={cot.an}
                coDinh={COT_CO_DINH}
                macDinh={cot.macDinh}
                dongBang={cot.dongBang}
                onLuu={cot.luu}
                onDoRongTuDong={cot.datDoRongTuDong}
              />
            </div>
          </div>
          {hienThiList.length ? (
            <>
              <Table
                cols={cot.colsHien}
                rows={pagedRows}
                motDong
                keDoc
                doRong={cot.doRong}
                loc={{ gt: locCot, dat: (k, g) => { setLocCot(x => ({ ...x, [k]: g })); setTrang(1) }, bo: new Set(['stt', 'chk', 'action']),
                  kieu: c => kieuCot(c.k), layLuaChon }}
                onRow={r => setActiveId(r.id)}
                onDbl={r => nav(`${path}/${r.id}`)}
                rowCls={r => [
                  r.id === activeId ? 'dang-chon' : '',
                  r.tt === 'nhap' && ghi ? 'chua-ghi' : '',
                ].filter(Boolean).join(' ')}
                sum={{ ngay: 'Tổng trang', tien: sum('tien'), thue: sum('thue'), giamThue: sum('giamThue'), tong: sum('tong') }}
              />
              <PhanTrang
                tong={hienThiList.length}
                tongCong={{ tien: tongDs('tien'), thue: tongDs('thue'), giamThue: tongDs('giamThue'), tong: tongDs('tong') }}
                trang={trangHienTai}
                coTrang={coTrang}
                onTrang={setTrang}
                onCoTrang={ct => { setCoTrang(ct); setTrang(1) }}
              />
            </>
          ) : (
            <div className="empty" style={{ margin: 'auto' }}>
              <b>Không có chứng từ khớp bộ lọc</b>
              <button
                type="button"
                className="btn sm"
                style={{ marginTop: 10 }}
                onClick={() => { loc0.xoaHet(); setLocCot({}); setTrang(1) }}
              >
                Xoá bộ lọc
              </button>
            </div>
          )}
          <div className="ct-panel" style={{ display: 'none' }} aria-hidden="true" />
        </section>

      </div>
      {moHd && <HopXuatHddt s={s} man={`${mod.key}/${sc.slug}`} ds={rows.filter(r => chon.has(String(r.id)))} toast={toast} nhieu
        onDong={() => { setMoHd(false); setChon(new Set()) }} />}
      {xuatMot && <HopXuatHddt s={s} man={`${mod.key}/${sc.slug}`} ds={[xuatMot]} toast={toast} onDong={() => setXuatMot(null)} />}
      {xemHd && hdDong(xemHd) && <HopXemHd s={s} r={xemHd} hd={hdDong(xemHd)!} toast={toast} onDong={() => setXemHd(null)} />}
      {moHopDongBo && (
        <HopDongBo
          tieuDe="Đồng bộ dữ liệu bán hàng từ máy POS"
          phu="Chọn khoảng thời gian và cửa hàng cần lấy lại hoá đơn FABi về sổ kế toán."
          nhanDs="Cửa hàng đồng bộ"
          ds={CUA_HANG.map(c => ({ ma: c.id, ten: c.ten, phu: `Mã POS ${c.id}` }))}
          chonSan={CUA_HANG.map(c => c.id)}
          coMon
          dsMon={Object.values(MON_POS).map(m => m[0])}
          nhanLamLai="Đồng bộ lại hoá đơn đã có"
          ghiChuLamLai="Lấy lại hoá đơn đã vào sổ trong kỳ, không nhân đôi"
          nutChinh="Đồng bộ ngay"
          onDong={() => setMoHopDongBo(false)}
          onDongBo={({ tu, den, chon, lamLai }) => {
            setMoHopDongBo(false)
            toast(`Đang đồng bộ hoá đơn bán hàng ${chon.length} cửa hàng, ${dmy(tu)} đến ${dmy(den)}${lamLai ? ', lấy lại cả chứng từ đã có' : ''}`)
          }}
        />
      )}
    </div>
  )
}

/** Cột bật tắt được của bảng Hàng bán Xuất bán POS (T106, T780); Giảm thuế GTGT, Phí vận chuyển, Giảm thuế theo quy định ẩn sẵn, cần thì bật ở Tuỳ chỉnh giao diện */
const COT_POS: [string, string][] = [
  ['ma', 'Mã hàng'], ['dvt', 'ĐVT'], ['sl', 'Số lượng'], ['gia', 'Đơn giá'], ['thanh', 'Thành tiền'], ['pt', 'Giảm giá (%)'], ['giam', 'Tiền giảm giá'],
  ['ptCk', '% CK'], ['ck', 'Tiền CK'], ['ptPhiDv', '% Phí dịch vụ'], ['phiDv', 'Phí dịch vụ'], ['giamThue', 'Giảm thuế GTGT'], ['phiVc', 'Phí vận chuyển'],
  ['dtTruocThue', 'Doanh thu tính thuế'], ['ts', 'Thuế suất'], ['thue', 'Tiền thuế'], ['giamVat', 'Giảm thuế theo quy định'], ['giaVon', 'Giá vốn'], ['tienVon', 'Tiền vốn'], ['tonKho', 'Theo dõi tồn kho'],
]
const AN_POS_MAC_DINH = ['giamThue', 'phiVc', 'giamVat']

function NoiDungTab({ x, tab, kieu, an: an0 = AN_POS_MAC_DINH, tyLe = false, hienLoc = false }: { x: (typeof DAILY)[number]; tab: string; kieu: ReturnType<typeof kieuGhiSo>; an?: string[]; tyLe?: boolean; hienLoc?: boolean }) {
  const { s } = useSession()
  const an = anTheoLoai(an0, tyLe)
  useGiaVonBq()
  // Giá vốn bình quân của tháng bán, áp từ Tính giá vốn (5.1.7); tháng chưa tính thì trống
  const dong0 = dongCuaPhieu(x).map(d => { const giaVon = giaVonBq(d.ma, x.date); return { ...d, giaVon, tienVon: tienVon(giaVon, d.sl) } })
  const doRong = useDoRongCot(`xuat-ban-pos:${tab}`)   // kéo giãn cột, nhớ riêng từng tab (T618)
  // GTGT theo % doanh thu: giảm thuế GTGT theo từng món đúng QD97 (T780)
  const dong = tyLe ? dong0.map(d => ({ ...d, giamThue: giamThueHang(d.dtTruocThue, d.ma) })) : dong0
  // Giá vốn hạch toán = tổng Tiền vốn các món (giá vốn bình quân × số lượng); tháng chưa tính giá vốn thì chưa có bút toán 632
  const tongVon = dong0.some(d => d.tienVon !== undefined) ? dong0.reduce((a, d) => a + (d.tienVon ?? 0), 0) : undefined
  const ht = [
    { dg: 'Thu tiền mặt', no: '1111', co: tyLe ? '5111' : '5111, 33311', tien: x.tm },
    { dg: 'Thu chuyển khoản, QR, thẻ', no: '1121', co: tyLe ? '5111' : '5111, 33311', tien: x.ck + x.the },
    { dg: 'Phải thu app giao đồ ăn', no: '131', co: tyLe ? '5111' : '5111, 33311', tien: x.app },
    ...(tongVon === undefined ? [] : [{ dg: 'Giá vốn xuất bán theo định lượng', no: '632', co: '152', tien: tongVon }]),
  ]
  const rowsSo = [
    { so: 'Sổ doanh thu bán hàng hoá, dịch vụ', tien: x.dt },
    { so: 'Sổ theo dõi thuế GTGT', tien: x.vat },
    { so: 'Sổ tiền mặt', tien: x.tm },
    { so: 'Sổ tiền gửi ngân hàng', tien: x.ck + x.the },
  ]
  const coGiam = tyLe && cauHinhGiamVat(s).bat
  const colsCt = ([
            // Thông tin hàng hoá đứng yên bên trái khi cuộn ngang (T106)
            { k: 'stt', t: '#', w: 40, cls: 'dim', dinh: 'trai' },
            { k: 'ma', t: 'Mã hàng', cls: 'code', w: 90, dinh: 'trai' },
            { k: 'ten', t: 'Hàng hoá', w: 200, dinh: 'trai' },
            { k: 'dvt', t: 'ĐVT', w: 70, dinh: 'trai' },
            { k: 'sl', t: 'Số lượng', num: true, w: 90 },
            { k: 'gia', t: 'Đơn giá', num: true, w: 110 },
            { k: 'thanh', t: 'Thành tiền', num: true, w: 120 },
            { k: 'pt', t: 'Giảm giá (%)', num: true, w: 100, r: r => r.pt ? `${r.pt}%` : '' },
            { k: 'giam', t: 'Tiền giảm giá', num: true, w: 120 },
            // Các khoản của đơn POS đưa lên bảng chi tiết (T106)
            { k: 'ptCk', t: '% CK', num: true, w: 70, r: r => r.ptCk ? `${r.ptCk}%` : '' },
            { k: 'ck', t: 'Tiền CK', num: true, w: 110 },
            { k: 'ptPhiDv', t: '% Phí dịch vụ', num: true, w: 110, r: r => r.ptPhiDv ? `${r.ptPhiDv}%` : '' },
            { k: 'phiDv', t: 'Phí dịch vụ', num: true, w: 110 },
            { k: 'giamThue', t: 'Giảm thuế GTGT', num: true, w: 125 },
            { k: 'phiVc', t: 'Phí vận chuyển', num: true, w: 120 },
            { k: 'dtTruocThue', t: 'Doanh thu tính thuế', num: true, w: 150 },
            { k: 'ts', t: 'Thuế suất', num: true, w: 80, r: r => `${r.ts}%` },
            { k: 'thue', t: 'Tiền thuế', num: true, w: 110 },
            ...(coGiam ? [{
              k: 'giamVat', t: 'Giảm thuế theo quy định', c: true, w: 140,
              r: (r: (typeof dong)[number]) => <input type="checkbox" className="o-tich-xem" checked={hangDuocGiam(s, r.ma)} readOnly tabIndex={-1} aria-label="Giảm thuế theo quy định" />,
            }] : []),
            { k: 'giaVon', t: 'Giá vốn', num: true, w: 110, r: r => r.giaVon === undefined ? '' : money(r.giaVon) },
            { k: 'tienVon', t: 'Tiền vốn', num: true, w: 120, r: r => r.tienVon === undefined ? '' : money(r.tienVon) },
            // Theo danh mục hàng hoá: tích là mặt hàng theo dõi tồn kho, chỉ xem; cột cuối, cố định phải (T114)
            { k: 'tonKho', t: 'Theo dõi tồn kho', c: true, w: 120, dinh: 'phai', r: r => <input type="checkbox" className="o-tich-xem" checked={Boolean(r.tonKho)} readOnly tabIndex={-1} aria-label="Theo dõi tồn kho" /> },
          ] as Col[]).filter(c => !an.includes(c.k))
  // Lọc hàng bán (T383): bấm phễu sau tab mới hiện hàng lọc như danh sách; tổng cộng vẫn cộng mọi dòng
  const [gtLoc, setGtLoc] = useState<Record<string, GiaTriLoc>>({})
  useEffect(() => { if (!hienLoc) setGtLoc({}) }, [hienLoc])
  const kieuCt = (c: Col): KieuLoc => c.num ? 'so' : 'chon'   // cột chữ lọc kiểu chọn (T466)
  const giaTri = (r: (typeof dong)[number], k: string) => (r as unknown as Record<string, unknown>)[k]
  const locCt: LocCot | undefined = hienLoc ? { gt: gtLoc, dat: (k, g) => setGtLoc(t => ({ ...t, [k]: g })), bo: new Set(['stt', 'tonKho', 'giamVat']), kieu: kieuCt,
    layLuaChon: k => dsGiaTri(dong, r => String(giaTri(r, k) ?? '')) } : undefined
  const dongLoc = !hienLoc ? dong : dong.filter(r => colsCt.every(c => !dangLoc(gtLoc[c.k])
    || khopLoc(kieuCt(c), gtLoc[c.k], String(giaTri(r, c.k) ?? ''), typeof giaTri(r, c.k) === 'number' ? giaTri(r, c.k) as number : undefined)))
  return (
    <BaoCaoDoRongCtx.Provider value={doRong}>
      {tab === 'ct' && (
        <Table
          cols={colsCt}
          loc={locCt}
          rows={dongLoc}
          sum={{
            ten: `Tổng cộng (${dong.length} dòng)`,   // nhãn ở cột Hàng hoá để cột # cố định không giãn (T106)
            ...Object.fromEntries((['sl', 'thanh', 'giam', 'ck', 'phiDv', 'giamThue', 'phiVc', 'dtTruocThue', 'thue'] as const)
              .map(k => [k, dong.reduce((a, r) => a + r[k], 0)])),
            ...(dong.some(r => r.tienVon !== undefined) ? { tienVon: dong.reduce((a, r) => a + (r.tienVon ?? 0), 0) } : {}),
          }}
        />
      )}
      {tab === 'ht' && (
        <div style={{ padding: 14 }}>
          {kieu === 'khong' && <Note kind="gray">Gói Standard không hạch toán. Doanh thu vào báo cáo kết quả kinh doanh, tiền mặt vào sổ quỹ.</Note>}
          {kieu === 'so' && (
            <>
              <Note icon="book">{CHE_DO.TT58.soHieu}: ghi vào sổ doanh thu và sổ tiền, không dùng tài khoản.</Note>
              <div style={{ marginTop: 10 }}>
                <Table
                  cols={[{ k: 'so', t: 'Ghi vào sổ' }, { k: 'tien', t: 'Số tiền', num: true }]}
                  rows={rowsSo}
                  sum={{ so: `Tổng cộng (${rowsSo.length} dòng)`, tien: rowsSo.reduce((a, r) => a + r.tien, 0) }}
                />
              </div>
            </>
          )}
          {kieu === 'noco' && (
            <Table
              cols={[{ k: 'dg', t: 'Diễn giải' }, { k: 'no', t: 'TK Nợ', cls: 'code' }, { k: 'co', t: 'TK Có', cls: 'code' }, { k: 'tien', t: 'Số tiền', num: true }]}
              rows={ht}
              sum={{ dg: `Doanh thu ${moneyD(x.dt)} · thuế ${moneyD(x.vat)}`, tien: x.tm + x.ck + x.the + x.app + (tongVon ?? 0) }}
            />
          )}
        </div>
      )}
      {tab === 'tt' && (
        <Table
          cols={[{ k: 'ht', t: 'Hình thức' }, { k: 'tien', t: 'Số tiền', num: true }]}
          rows={[
            { ht: 'Tiền mặt', tien: x.tm },
            { ht: 'Chuyển khoản, QR', tien: x.ck },
            { ht: 'Thẻ', tien: x.the },
            { ht: 'GrabFood, ShopeeFood', tien: x.app },
          ]}
          sum={{ ht: 'Tổng', tien: x.tm + x.ck + x.the + x.app }}
        />
      )}
      {tab === 'goc' && (
        <Table
          cols={[{ k: 'ca', t: 'Ca' }, { k: 'gio', t: 'Giờ chốt' }, { k: 'don', t: 'Số đơn', num: true }, { k: 'tn', t: 'Thu ngân' }]}
          rows={[
            { ca: 'Ca sáng', gio: '14:00', don: Math.round(x.don * 0.45), tn: 'Hồ Thị Mai' },
            { ca: 'Ca tối', gio: '22:30', don: x.don - Math.round(x.don * 0.45), tn: 'Hồ Thị Mai' },
          ]}
          sum={{ ca: 'Tổng: 2 ca', don: x.don }}
        />
      )}
    </BaoCaoDoRongCtx.Provider>
  )
}

/** Chứng từ Xuất bán POS (T102): vẽ theo form chung IACC, đủ thông tin như chi tiết đơn POS của iFaster.
 *  Phiếu đồng bộ từ FABi, chỉ xem: không sửa, trả hàng, huỷ ở đây */
function ChiTiet({ sc, mod, row }: ScreenProps & { row: Row }) {
  const { s, toast } = useSession()
  const dong0 = useDong(duongDan(mod, sc))
  const [tab, setTab] = useState('ct')
  const [moLoc, setMoLoc] = useState(false)   // hàng lọc của bảng Hàng bán (T383)
  const [phieuIn, setPhieuIn] = useState<PhieuIn[] | null>(null)
  // Cột ẩn của bảng Hàng bán, nhớ trên máy người dùng; chưa chỉnh thì ẩn Giảm thuế GTGT, Phí vận chuyển (T106)
  const khoaCot = 'iacc-cot-phieu:ban-hang/3-1-1'
  const [anCot, setAnCot] = useState<string[]>(() => {
    try { const v = JSON.parse(localStorage.getItem(khoaCot) ?? 'null'); return Array.isArray(v) ? v : AN_POS_MAC_DINH } catch { return AN_POS_MAC_DINH }
  })
  // Cột thuế theo loại hình đơn vị, cố định nên không có trong Tuỳ chỉnh giao diện (T163)
  const tyLe = gtgtTyLe(s)
  // Giảm thuế theo quy định chỉ có khi theo % doanh thu và bật giảm thuế, không thì bỏ khỏi hộp chọn cột (T780)
  const cotChinh = [...(tyLe ? ['ts', 'thue', 'giamThue'] : ['ts', 'thue']), ...(tyLe && cauHinhGiamVat(s).bat ? [] : ['giamVat'])]
  const [hopCot, setHopCot] = useState(false)
  const doiAnCot = (an: string[]) => {
    setAnCot(an)
    try { localStorage.setItem(khoaCot, JSON.stringify(an)) } catch { /* trình duyệt chặn lưu thì chỉ giữ trong phiên */ }
  }
  const x = tyLe ? ttHkd(row.x) : row.x
  const kieu = kieuGhiSoDv(s)
  // Chân phiếu dạng phép tính (T613), cộng từ đúng các dòng Hàng bán nên khớp dòng Tổng cộng của lưới
  const cong = (k: 'thanh' | 'giam' | 'ck' | 'phiDv' | 'phiVc' | 'dtTruocThue') => dongCuaPhieu(x).reduce((a, d) => a + d[k], 0)
  const dtTinhThue = cong('dtTruocThue'), phiVc = cong('phiVc')
  // GTGT theo % doanh thu: tổng thanh toán = doanh thu − giảm thuế GTGT, không cộng tiền thuế (T163, T780); khấu trừ cộng thuế GTGT
  const giamThue = tyLe ? giamThuePhieu(x) : 0
  const tong = tyLe ? dtTinhThue - giamThue : dtTinhThue + x.vat
  const phepTinh: [string, string, number][] = [
    ['', 'Tiền hàng', cong('thanh')], ['−', 'Giảm giá', cong('giam')], ['−', 'Chiết khấu', cong('ck')], ['+', 'Phí dịch vụ', cong('phiDv')],
    ...(phiVc ? [['+', 'Phí vận chuyển', phiVc] as [string, string, number]] : []),
  ]
  const dp = donPosCua(x as XPos)
  const [daChep, setDaChep] = useState(false)
  const chepMa = (ma: string) => {
    navigator.clipboard?.writeText(ma).then(() => toast('Đã chép mã tra cứu'), () => toast('Trình duyệt chặn sao chép, chọn mã rồi chép tay'))
    setDaChep(true)
    setTimeout(() => setDaChep(false), 1500)
  }
  const pttt = PTTT.filter(([k]) => Number(x[k]) > 0).map(([, t]) => t).join(', ')
  const kenh = (x as XPos).kenh ?? (x.app > 0 ? 'Tại quán, Mang về, App giao đồ ăn' : 'Tại quán, Mang về')
  // In: bảng kê lấy đúng các món của chứng từ, không sinh dòng giả
  const moIn = () => setPhieuIn([{
    sc, row, cfg: NGOAI_POS,
    dong: dongCuaPhieu(x).map(d => ({ stt: d.stt, ma: d.ma, ten: d.ten, dvt: d.dvt, sl: d.sl, slCt: d.sl, gia: d.gia, tien: d.tien, thue: d.thue, ts: d.ts })),
  }])
  // Phiếu đồng bộ xong từ FABi ghi "Đã đồng bộ" thay cho "Đã ghi sổ" (T613)
  const [cTt, tTt] = kieu === 'khong' || row.tt === 'ghi' ? ['ok', 'Đã đồng bộ'] : TT_CT[row.tt] ?? ['warn', 'Chưa ghi sổ']
  return (
    <FormToanMan icon={mod.icon} iconNet onClose={dong0} title="Xuất bán POS"
      footClass="fsf-f-xem fsf-f-pos"
      giua={<span className="fsf-tt xem">Chi tiết phiếu <b>{row.so}</b></span>}
      meta={<><St k={cTt}>{tTt}</St><span className="src">FABi</span><span className="chip info"><Icon n="cuahang" className="ic sm" />{row.cn}</span></>}
      // Tuỳ chỉnh giao diện: nút vuông nhỏ ở góc trên phải như form chứng từ khác (T297)
      phai={<>
        <button type="button" className={`nut-vuong ds-nut-cot${hopCot ? ' on' : ''}`} onClick={() => setHopCot(true)}
          title="Tuỳ chỉnh giao diện: bật tắt cột bảng Hàng bán" aria-label="Tuỳ chỉnh giao diện"><Icon n="chinh" className="ic sm" /></button>
        {/* Phiếu POS chỉ xem: phím tắt chỉ có Esc đóng (T297) */}
        <NutPhimTat ds={[['Đóng form', 'Esc']]} />
      </>}
      foot={<>
        <div className="xp-footer-trai">
          <button type="button" className="xp-btn-in" onClick={moIn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12H2.66667C2.31304 12 1.97391 11.8595 1.72386 11.6095C1.47381 11.3594 1.33333 11.0203 1.33333 10.6667V7.33333C1.33333 6.97971 1.47381 6.64057 1.72386 6.39052C1.97391 6.14048 2.31304 6 2.66667 6H13.3333C13.687 6 14.0261 6.14048 14.2761 6.39052C14.5262 6.64057 14.6667 6.97971 14.6667 7.33333V10.6667C14.6667 11.0203 14.5262 11.3594 14.2761 11.6095C14.0261 11.8595 13.687 12 13.3333 12H12" />
              <path d="M4 6V2C4 1.82319 4.07024 1.65362 4.19526 1.5286C4.32029 1.40357 4.48986 1.33333 4.66667 1.33333H11.3333C11.5101 1.33333 11.6797 1.40357 11.8047 1.5286C11.9298 1.65362 12 1.82319 12 2V6" />
              <path d="M4.66667 9.33333H11.3333C11.7015 9.33333 12 9.63181 12 10V14C12 14.3682 11.7015 14.6667 11.3333 14.6667H4.66667C4.29848 14.6667 4 14.3682 4 14V10C4 9.63181 4.29848 9.33333 4.66667 9.33333Z" />
            </svg>
            <span>In phiếu</span>
          </button>
        </div>
        {/* Dải phép tính giữa nút In phiếu và dải phải (T613, T637: bỏ nút Đóng) */}
        <div className="pos-phep">
          {phepTinh.map(([dau, nhan, so]) => (
            <span key={nhan} className="pos-phep-cum">
              {dau && <span className="pos-phep-dau">{dau}</span>}
              <span className="pos-phep-o"><small>{nhan}</small><b>{money(so)}</b></span>
            </span>
          ))}
          <span className="pos-phep-cum">
            <span className="pos-phep-dau">=</span>
            <span className="pos-phep-o nen"><small>Doanh thu tính thuế</small><b>{money(dtTinhThue)}</b></span>
          </span>
          <span className="pos-phep-cum">
            <span className="pos-phep-dau">{tyLe ? '−' : '+'}</span>
            <span className="pos-phep-o"><small>{tyLe ? 'Giảm trừ thuế' : 'Thuế GTGT'}</small><b>{money(tyLe ? giamThue : x.vat)}</b></span>
          </span>
          <span className="pos-phep-cum">
            <span className="pos-phep-dau">=</span>
            <span className="pos-phep-o tong"><small>Tổng thanh toán</small><b>{moneyD(tong)}</b></span>
          </span>
        </div>
      </>}>
      <div className="stack ct-co-dinh" style={{ gap: 14 }}>
        <p className="pos-nhac"><Icon n="info" className="ic sm" />Chứng từ đồng bộ từ FABi: không sửa, trả hàng, xoá trên phiếu này. Sửa đơn trên FABi rồi đồng bộ lại.</p>
        {/* Đầu phiếu 3 nhóm kiểu nhãn trái ô phải (T637): Đơn hàng POS, Thông tin khách hàng, Hoá đơn.
            T641: ô ngắn gom 2 ô một hàng (.xp637-cap), bỏ Ngày chứng từ (trùng Thời gian xuất), Ghi chú dời vào nhóm Hoá đơn */}
        <section className="xp637-dau">
          <div className="xp637-nhom xp637-nhom-pos">
            <div className="xp637-tieu">ĐƠN HÀNG POS</div>
            <div className="xp637-ds">
              <div className="xp637-o">
                <span className="xp637-nhan">Mã đơn POS</span>
                <div className="xp637-tri">{row.so ? <span className="xp637-code">{row.so}</span> : <span className="xp637-trong">—</span>}</div>
              </div>
              <div className="xp637-cap">
                <div className="xp637-o">
                  <span className="xp637-nhan">Số đơn POS</span>
                  <div className="xp637-tri">{dp.soDon ? <span className="xp637-code">{dp.soDon}</span> : <span className="xp637-trong">—</span>}</div>
                </div>
                <div className="xp637-o xp637-o-phu xp637-o-rong">
                  <span className="xp637-nhan">Ngày xuất</span>
                  <div className="xp637-tri"><span>{dmy(x.date)}</span></div>
                </div>
              </div>
              <div className="xp637-o">
                <span className="xp637-nhan">Cửa hàng</span>
                <div className="xp637-tri">{row.cn ? <span title={String(row.cn)}>{row.cn}</span> : <span className="xp637-trong">—</span>}</div>
              </div>
              <div className="xp637-cap">
                <div className="xp637-o">
                  <span className="xp637-nhan">Kênh bán hàng</span>
                  <div className="xp637-tri">{kenh ? <span title={kenh}>{kenh}</span> : <span className="xp637-trong">—</span>}</div>
                </div>
                {/* Hoá đơn có một cách thanh toán; chứng từ tổng hợp theo kênh gộp nhiều cách nên bỏ (T116) */}
                {(x as XPos).loai === 'don' && (
                  <div className="xp637-o xp637-o-phu">
                    <span className="xp637-nhan" title="Phương thức thanh toán">Thanh toán</span>
                    <div className="xp637-tri">{pttt ? <span title={pttt}>{pttt}</span> : <span className="xp637-trong">—</span>}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="xp637-nhom xp637-nhom-khach">
            <div className="xp637-tieu">THÔNG TIN KHÁCH HÀNG</div>
            <div className="xp637-ds">
              <div className="xp637-o">
                <span className="xp637-nhan">Khách hàng</span>
                <div className="xp637-tri"><span title={dp.khach?.ten ?? 'Khách lẻ POS'}>{dp.khach?.ten ?? 'Khách lẻ POS'}</span></div>
              </div>
              <div className="xp637-o">
                <span className="xp637-nhan">Địa chỉ</span>
                <div className="xp637-tri">{dp.khach?.diaChi ? <span title={dp.khach.diaChi}>{dp.khach.diaChi}</span> : <span className="xp637-trong">—</span>}</div>
              </div>
              <div className="xp637-o">
                <span className="xp637-nhan">Mã số thuế</span>
                <div className="xp637-tri">{dp.khach?.mst ? <span className="xp637-code">{dp.khach.mst}</span> : <span className="xp637-trong">—</span>}</div>
              </div>
              <div className="xp637-o">
                <span className="xp637-nhan">Người mua hàng</span>
                <div className="xp637-tri">{dp.khach?.nguoiMua ? <span title={dp.khach.nguoiMua}>{dp.khach.nguoiMua}</span> : <span className="xp637-trong">—</span>}</div>
              </div>
            </div>
          </div>

          <div className="xp637-nhom xp637-nhom-hd">
            <div className="xp637-tieu">
              <span>HOÁ ĐƠN</span>
              {!dp.hoaDon && <span className="xp637-nhan-khong">Không có thông tin HĐĐT</span>}
            </div>
            <div className="xp637-ds">
              <div className="xp637-cap">
                <div className="xp637-o xp637-o-rong">
                  <span className="xp637-nhan">Số hoá đơn</span>
                  <div className="xp637-tri">{dp.hoaDon?.so ? <span className="xp637-code">{dp.hoaDon.so}</span> : <span className="xp637-trong">—</span>}</div>
                </div>
                <div className="xp637-o xp637-o-phu">
                  <span className="xp637-nhan">Ký hiệu</span>
                  <div className="xp637-tri">{dp.hoaDon?.kyHieu ? <span className="xp637-code">{dp.hoaDon.kyHieu}</span> : <span className="xp637-trong">—</span>}</div>
                </div>
              </div>
              <div className="xp637-o">
                <span className="xp637-nhan">Ngày hoá đơn</span>
                <div className="xp637-tri">{dp.hoaDon?.ngay ? <span>{dp.hoaDon.ngay}</span> : <span className="xp637-trong">—</span>}</div>
              </div>
              <div className="xp637-o">
                <span className="xp637-nhan">Mã tra cứu</span>
                {dp.hoaDon?.maTraCuu ? (
                  <div className="xp637-tri xp637-tri-ma">
                    <span className="xp637-code" title={dp.hoaDon.maTraCuu}>{dp.hoaDon.maTraCuu}</span>
                    <button type="button" className={`xp637-chep${daChep ? ' xp637-da-chep' : ''}`} onClick={() => chepMa(dp.hoaDon!.maTraCuu)}
                      title={daChep ? 'Đã chép mã tra cứu' : 'Sao chép mã tra cứu'} aria-label="Sao chép mã tra cứu">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></svg>
                    </button>
                  </div>
                ) : (
                  <div className="xp637-tri"><span className="xp637-trong">—</span></div>
                )}
              </div>
              <div className="xp637-o">
                <span className="xp637-nhan">Ghi chú</span>
                <div className="xp637-tri">{row.dienGiai ? <span title={String(row.dienGiai)}>{row.dienGiai}</span> : <span className="xp637-trong">—</span>}</div>
              </div>
            </div>
          </div>
        </section>
        <section className="card ct-than-card">
          <div className="tabs">
            {/* Bỏ tab Ghi sổ, chỉ chế độ nợ có còn tab Hạch toán (T640) */}
            {[['ct', 'Hàng bán'], ...(kieu === 'noco' ? [['ht', 'Hạch toán']] : [])].map(([k, l]) => <button key={k} type="button" className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
            {/* Phễu lọc ngay sau tab cuối như phiếu chung (T383) */}
            <button type="button" className={`ct-nut-loc${moLoc ? ' on' : ''}`} aria-pressed={moLoc} title={moLoc ? 'Ẩn bộ lọc hàng bán' : 'Lọc hàng bán'} aria-label="Lọc hàng bán"
              onClick={() => { if (!moLoc) setTab('ct'); setMoLoc(v => !v) }}><Icon n="filter" className="ic sm" /></button>
          </div>
          <div className="ct-than"><NoiDungTab x={x} tab={tab} kieu={kieu} an={anCot} tyLe={tyLe} hienLoc={moLoc} /></div>
        </section>
      </div>
      {phieuIn && <HopInChungTu ds={phieuIn} onDong={() => setPhieuIn(null)} />}
      {hopCot && <HopCotPhieu ds={COT_POS.filter(([k]) => !cotChinh.includes(k))} an={anCot} macDinh={AN_POS_MAC_DINH} onDoi={doiAnCot} onDong={() => setHopCot(false)} />}
    </FormToanMan>
  )
}
