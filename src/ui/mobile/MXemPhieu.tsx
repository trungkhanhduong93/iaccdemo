import { useEffect, useMemo, useState, type FC } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan, moDuoc, tenMan, timMan } from '../../app/registry'
import { dsCuaHang, useSession } from '../../app/session'
import { type Goi, kieuGhiSoDv } from '../../app/plan'
import { money, soLuong } from '../format'
import { NGUON, TT_CT, dongCua, doanLyDoThuChi, nguoiTaoMau, ttNghiepVu, type Dong } from '../generic/gen'
import { boO, nhomCua, theoLoai } from '../generic/nhom'
import { laLyChiPhi } from '../generic/danhMucStore'
import { giamGtgtCua, giamThueTheoDong, useDongChungTu } from '../generic/VoucherScreen'
import { dtDong } from '../../modules/ban-hang/BangHangBan'
import { giamThueHang } from '../../modules/ban-hang/giam-thue'
import { useDsPhieuDcn } from '../../modules/kho/BangDieuChuyen'
import { useDsPhieuSx } from '../../modules/kho/BangSanXuat'
import { rowTuPhieuXdl, useDsPhieuXdl } from '../../modules/kho/xuat-dinh-luong'
import { SX, TT_SX } from '../../modules/kho/san-xuat'
import { DCN } from '../../modules/kho/dieu-chuyen'
import { MAN_DC } from '../../modules/kho/dieu-chinh'
import { CUA_HANG, KHOAN_MUC, LY_DO, TK_NGAN_HANG, daKhoaSo, khoaSoDenCua } from '../../data/mock'
import { apKhoPhieu, ctTtCon, dsDcCon, dsTraCon, dsTtCon, MAN_TRA_MUA, ghiNhatKy, soDaTra, soKeTiep, suaPhieu, themPhieu, ttThamChieu, xoaPhieu } from '../generic/daXoa'
import { MAN_THU_CHI, TEN_CT_TT, TIEN_TO_CT_TT, lyDoKhongXoaTheCuaPhieu, theCuaPhieu, xoaTheCuaPhieu, type TraTu } from '../generic/ChungTuForm'
import { MLichSu } from './MLichSu'
import { loaiXuLy } from '../generic/BangKiemKe'
import { ThongBao, type ThongBaoProps } from '../ThongBao'
import { LichDon } from '../ChonNgay'
import { Icon } from '../Icon'
import { MChon } from './MChon'
import { MTrong } from './MTrong'
import { chieuTien } from './chieuTien'
import { tinhButToan } from './butToan'
import { MDtThuChiXem } from './MDtThuChiXem'
import { MThanhToanNgay, lapPhieuChiTraNcc, type ThongTinTt } from './MThanhToanNgay'

export interface MXemPhieuProps extends ScreenProps {
  id?: string
}

// Dòng thu chi lưu mã khoản mục, bản máy tính hiện tên
const tenKm = (ma: string) => KHOAN_MUC.find(x => x.ma === ma)?.ten ?? ma

// Tính số ngày còn lại của hạn thanh toán
function tinhSoNgayCon(hanTtStr?: string): string {
  if (!hanTtStr) return ''
  try {
    const parts = hanTtStr.split('/')
    if (parts.length < 3) return ''
    const d = Number(parts[0])
    const m = Number(parts[1])
    const y = Number(parts[2])
    const dHan = new Date(y, m - 1, d)
    const dHienTai = new Date(2026, 9, 18) // mốc 18/10/2026 của bản mẫu
    const diffDays = Math.round((dHan.getTime() - dHienTai.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays > 0) return `còn ${diffDays} ngày`
    if (diffDays === 0) return 'hôm nay'
    return `quá hạn ${Math.abs(diffDays)} ngày`
  } catch {
    return ''
  }
}

export const MXemPhieu: FC<MXemPhieuProps> = ({ sc, mod, id }) => {
  const nav = useNavigate()
  const path = duongDan(mod, sc)

  const cfgMan = sc.voucher ?? { prefix: 'CT', doiTuong: 'none', dienGiai: [tenMan(sc)], tien: [0, 0] }
  const { rows: rowsGoc } = useDongChungTu(sc, mod)
  const rowsDcn = useDsPhieuDcn(cfgMan.dieuChuyen ?? 'xdc')
  const rowsSx = useDsPhieuSx(cfgMan.sanXuat ?? 'xsc')
  // Xuất kho định lượng (T936): phiếu sinh từ chứng từ bán hàng lập tay không nằm trong dữ liệu chung, đọc từ danh sách riêng
  const laXdl = cfgMan.prefix === 'XDL'
  const phieuXdl = useDsPhieuXdl()
  const rowsXdl = useMemo<Row[]>(() => !laXdl ? [] : phieuXdl.filter(p => p.so).map(rowTuPhieuXdl), [laXdl, phieuXdl])
  const rows = laXdl ? rowsXdl : cfgMan.dieuChuyen ? rowsDcn : cfgMan.sanXuat ? rowsSx : rowsGoc

  const row = useMemo(() => rows.find(r => String(r.id) === String(id)), [rows, id])

  // Trường hợp không tìm thấy phiếu
  if (!row) {
    return (
      <div className="m-xp-trong">
        <MTrong tieuDe="Không tìm thấy chứng từ" moTa="Chứng từ không tồn tại hoặc đã bị xoá" />
        <div className="m-xp-trong-nut">
          <button type="button" className="btn pri" onClick={() => nav(path, { replace: true })}>
            Về danh sách
          </button>
        </div>
      </div>
    )
  }
  // Tách lớp trong để phiếu bị xoá giữa chừng không làm đổi số hook
  return <ThanPhieu key={String(row.id)} sc={sc} mod={mod} row={row} />
}

type TabKey = 'chitiet' | 'hanghoa' | 'buttoan' | 'thanhtoan' | 'lichsu'

const ThanPhieu: FC<ScreenProps & { row: Row }> = ({ sc, mod, row }) => {
  const { s, set, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const cfgMan = sc.voucher ?? { prefix: 'CT', doiTuong: 'none', dienGiai: [tenMan(sc)], tien: [0, 0] }

  const [sp] = useSearchParams()
  const [tab, setTab] = useState<TabKey>('chitiet')
  const [moMenu, setMoMenu] = useState(false)
  const [moThanhToan, setMoThanhToan] = useState(() => sp.get('thanhtoan') === '1')
  const [hoiXoa, setHoiXoa] = useState(false)
  const [hoiKhongSua, setHoiKhongSua] = useState(false)   // phiếu chi còn thẻ chi phí (T475)
  const [hoiKhongSuaTt, setHoiKhongSuaTt] = useState(false)   // phiếu mua đã thanh toán (T658)
  const [hoiBoGhi, setHoiBoGhi] = useState(false)
  const [chan, setChan] = useState<Omit<ThongBaoProps, 'loai' | 'onDong'> | null>(null)   // hộp chặn xoá thay toast (T889)
  const [moLichSuTt, setMoLichSuTt] = useState(false)

  const loai = cfgMan.loai?.find(x => x.k === row.loai) ?? cfgMan.loai?.[0]
  const cfg = theoLoai(cfgMan, loai?.k)
  const nhom = nhomCua(mod.key, cfg, loai?.k)
  const bo = boO(nhom, cfg)
  const chieu = chieuTien(mod.key, cfg, row)

  const laKk = Boolean(cfg.kiemKe)
  const laDc = Boolean(cfg.dieuChinh)
  const laNk = sc.code === '5.1.1'   // phiếu Nhập kho (T824, như web T818)
  const laHuy = sc.code === '5.1.2-3'   // phiếu Xuất huỷ xem như Nhập kho, phiếu mua: tiêu đề tên phiếu và số, cửa hàng và nguồn lên đầu, có Lý do huỷ (T927)
  const laXdl = cfgMan.prefix === 'XDL'   // Xuất kho định lượng: xem theo khuôn Nhập kho, ghi theo tiền vốn, chỉ xem không sửa không xoá
  const kieuVon = laHuy || laXdl
  const khoChuanXem = (mod.key === 'kho' || laXdl) && !laKk   // khuôn xem chuẩn cho phiếu kho (T930)
  const laCtth = mod.key === 'tong-hop'   // Chứng từ tổng hợp theo khuôn Nhập mua (T930)
  const khoGonXem = khoChuanXem
  const laTraBan = sc.code === '3.1.4'   // Hàng bán trả lại (T830): bỏ diễn giải ở đầu phiếu, Chi tiết đủ ô như web
  const sx = cfg.sanXuat
  const laSx = Boolean(sx)
  const sxNhap = sx ? SX[sx].nhap : false
  const dcn = cfg.dieuChuyen
  const laDcn = Boolean(dcn)
  const coTcNhap = sxNhap || dcn === 'ndc'
  const manDoi = sx ? SX[SX[sx].doi!].man : dcn === 'ndc' ? DCN.xdc.man : ''
  const coTtXn = laSx || dcn === 'xdc' || dcn === 'ndc'
  const laTien = mod.key === 'tien'
  const nhomMb = mod.key === 'mua-hang' ? 'mua' : mod.key === 'ban-hang' ? 'ban' : null
  const kieu = kieuGhiSoDv(s)
  const ghi = kieu !== 'khong'

  // Nghiệp vụ (đối tượng, địa chỉ, mst, hoá đơn, hạn tt)
  const nv = useMemo(() => (row ? ttNghiepVu(row) : null), [row])

  // Thu chi 2.1.1
  const laThuChi211 = sc.code === '2.1.1' || sc.slug === '2-1-1'
  const cuaHangTen = String(row.cn ?? CUA_HANG[0].ten)
  const quyTm = `Quỹ tiền mặt ${CUA_HANG.find(c => c.ten === cuaHangTen)?.ngan ?? CUA_HANG[0].ngan}`
  const quyNhMacDinh = TK_NGAN_HANG[0] ? `${TK_NGAN_HANG[0].nh.split(',')[0]} ${TK_NGAN_HANG[0].so}` : 'Vietcombank 0071000888999'

  // Quỹ
  let triQuy = ''
  if (laThuChi211 || laTien) {
    if (nhom === 'cq') {
      triQuy = String(row._tuQuy ?? row._quy ?? quyTm)
    } else if (loai?.k === 'bc' || loai?.k === 'unc' || nhom === 'nhthu' || nhom === 'nhchi') {
      triQuy = String(row._quy ?? quyNhMacDinh)
    } else {
      triQuy = String(row._quy ?? quyTm)
    }
  }

  // Dòng chi tiết
  const idSeed = `${sc.code ?? sc.slug}-${row.id}`
  // Hàng bán trả lại khi GTGT theo % doanh thu (T885): dòng không có VAT, trừ Giảm thuế GTGT theo từng dòng như web
  const giamTraBan = laTraBan && giamGtgtCua(mod, cfg, s)
  const dsDongGoc: Dong[] = useMemo(() => {
    return (row._dong as Dong[] | undefined) ?? dongCua(cfg, idSeed)
  }, [row, cfg, idSeed])
  const dsDong: Dong[] = useMemo(() => giamTraBan ? dsDongGoc.map(d => ({ ...d, ts: 0, thue: 0 })) : dsDongGoc, [dsDongGoc, giamTraBan])

  // Lý do thu / chi
  let triLyDo = ''
  if (laThuChi211 || laTien) {
    triLyDo = String(row._lyDo ?? dsDong[0]?.ly ?? doanLyDoThuChi(loai?.k ?? '', String(row.dienGiai || '')) ?? '')
  }

  // Người giao dịch / Người thực hiện
  let triNguoiGiaoDich = ''
  if (laThuChi211) {
    triNguoiGiaoDich = String(row._nguoiGiao ?? row._nguoi ?? nv?.nguoi ?? '')
  }

  // Thông tin hoá đơn
  const manCoHd = ['3.1.2', '3.1.3', '3.1.4', '4.1.1', '4.1.2', '4.1.3', '4.1.4', '4.1.5', '4.1.6', '6.1.1', '6.1.2'].includes(String(sc.code ?? sc.slug)) || Boolean(bo.hd)
  const coHd = manCoHd && (row._nhanKemHd !== undefined ? Boolean(row._nhanKemHd) : nv?.ttHd === 'da')
  const soHd = coHd ? String(row._soHd ?? nv?.soHd ?? '') : ''
  const kyHieuHd = coHd ? String(row._kyHieuHd ?? nv?.kyHieuHd ?? '') : ''
  const ngayHd = coHd ? String(row._ngayHd ?? nv?.ngayHd ?? '') : ''

  // Mã số thuế và Hạn thanh toán
  const coMst = nhom !== 'cq' && !(laTien && laThuChi211) && Boolean(row.doiTuong)
  const mst = coMst ? String(row._mst ?? nv?.mst ?? '') : ''
  const coHanTt = Boolean(bo.tt) && s.goi === 'PR'
  const hanTt = (coHanTt && nhomMb) ? String(row._hanTt ?? nv?.hanTt ?? '') : ''

  // Kho
  // Nhập kho (T824): phiếu mẫu chưa lưu kho thì lấy kho đầu của cửa hàng, như bản in web T818
  // Xuất huỷ cũng vậy, như web (T927)
  const khoMacDinh = nhomMb === 'mua' || sc.code === '5.1.1' || sc.code === '5.1.2-3' ?(CUA_HANG.find(c => c.ten === cuaHangTen)?.kho[0] ?? 'Kho hàng') : ''
  const kho = String(
    row._kho ??
      row.kho ??
      (row._khoDs as string[] | undefined)?.[0] ??
      dsDong.find(d => d.kho)?.kho ??
      khoMacDinh,
  )
  const tuKho = String(dcn === 'ndc' ? (row._khoXuat ?? kho) : (row._kho ?? kho))
  const denKho = String(dcn === 'ndc' ? (row._kho ?? kho) : (row._khoNhan ?? ''))
  const tenPhieuKho = () => {
    const t = loai?.ten ?? tenMan(sc)
    return t.toLowerCase().startsWith('phiếu') ? `${t} ${soCt}` : `Phiếu ${t.toLowerCase()} ${soCt}`
  }

  const nhanKemHd = row._nhanKemHd !== undefined ? Boolean(row._nhanKemHd) : Boolean(row._soHd || nv?.soHd)

  // Tính tổng
  const tongTien = dsDong.reduce((a, d) => a + (Number(d.tien) || 0), 0)
  const tongCk = dsDong.reduce((a, d) => a + (Number(d.ck) || 0), 0)
  const tongThue = dsDong.reduce((a, d) => a + (Number(d.thue) || 0), 0)
  const tongGiamThue = giamTraBan ? giamThueTheoDong(dsDongGoc, cfg.dongPos) : 0
  // Hàng bán trả lại: tổng như danh sách, form web (T885): tiền sau giảm giá, chiết khấu, phí dịch vụ của từng dòng, trừ giảm thuế
  const tongThanhToan = laKk ? 0 : laTraBan && cfg.dongPos ? dsDong.reduce((a, d) => a + dtDong(d) + (Number(d.thue) || 0), 0) - tongGiamThue : tongTien - tongCk + tongThue

  // Tính toán thanh toán phiếu mua
  const tongGoc = Number(row.tong) || tongThanhToan || 0
  const daTra = soDaTra(row)
  const conLai = Math.max(0, tongGoc - daTra)
  const dsTt = dsTtCon(row)

  // Thống kê kiểm kê
  const hangThua = dsDong.filter(d => (Number(d.tonTt) || 0) > (Number(d.tonHt) || 0))
  const hangThieu = dsDong.filter(d => (Number(d.tonTt) || 0) < (Number(d.tonHt) || 0))
  const hangKhop = dsDong.filter(d => (Number(d.tonTt) || 0) === (Number(d.tonHt) || 0))
  const slThua = hangThua.reduce((a, d) => a + ((Number(d.tonTt) || 0) - (Number(d.tonHt) || 0)), 0)
  const slThieu = hangThieu.reduce((a, d) => a + ((Number(d.tonHt) || 0) - (Number(d.tonTt) || 0)), 0)
  const dvtChinhKho = dsDong.find(d => d.dvt)?.dvt || 'kg'

  // Bút toán hạch toán
  const dsButToan = useMemo(() => {
    if (s.goi === 'S') return []
    const hinhThucTt = (row._httt as 'congno' | 'tienmat' | 'chuyenkhoan' | undefined) ?? (nv?.ttTien === 'da' ? 'tienmat' : 'congno')
    return tinhButToan(
      cfg,
      dsDong,
      tongTien,
      tongCk,
      tongThue,
      String(row.doiTuong ?? ''),
      String(row.cn ?? ''),
      s.cheDo,
      nhom,
      hinhThucTt,
    )
  }, [cfg, dsDong, tongTien, tongCk, tongThue, row, nv, s.cheDo, nhom, s.goi])

  const capButToan = useMemo(() => {
    const caps: { no: { so: string; ten: string }; co: { so: string; ten: string }; dg: string; tien: number }[] = []
    for (let i = 0; i < dsButToan.length; i += 2) {
      const no = dsButToan[i]
      const co = dsButToan[i + 1]
      if (no && co) {
        const dg = no.so.startsWith('133') ? 'Thuế GTGT được khấu trừ' : 'Giá trị hàng nhập kho'
        caps.push({ no, co, dg, tien: no.tien })
      }
    }
    return caps
  }, [dsButToan])
  const tongNoCo = useMemo(() => capButToan.reduce((a, c) => a + c.tien, 0), [capButToan])

  const danhSachThamChieu = useMemo(() => {
    const ds: { so: string; url: string }[] = []
    if (dsTt && dsTt.length > 0) {
      for (const tt of dsTt) {
        ds.push({ so: tt.so, url: `/app/tien/2-1-1/${tt.id}` })
      }
    }
    if (row._phieuTra) {
      const tra = row._phieuTra as { id: string; so: string }
      ds.push({ so: tra.so, url: `/app/mua-hang/4-3-1/${tra.id}` })
    }
    if (Array.isArray(row._theCp)) {
      for (const cp of row._theCp as string[]) {
        ds.push({ so: cp, url: `/app/ccdc/8-1-1?mo=${cp}` })
      }
    }
    for (const c of dsTraCon(row)) ds.push({ so: c.so, url: `/app/${MAN_TRA_MUA}/${c.id}` })   // phiếu trả lại lập từ phiếu mua (T819)
    // Hoá đơn mua hàng: thẻ chi phí phân bổ lập từ hoá đơn (T826, như web T821)
    if (cfg.khongKho) for (const so of theCuaPhieu(row)) if (!ds.some(x => x.so === so)) ds.push({ so, url: `/app/ccdc/8-1-1?mo=${so}` })
    if (row._thamChieu && !ds.some(x => x.so === row._thamChieu)) {
      ds.push({ so: String(row._thamChieu), url: String(row._thamChieuDi || path) })
    }
    return ds
  }, [dsTt, row, path, cfg.khongKho])

  // Thanh toán từ sheet: lập luôn phiếu chi hoặc uỷ nhiệm chi, không mở form điền lại (T655, thay T610)
  const handleLapPhieuChi = (tt: ThongTinTt) => {
    setMoThanhToan(false)
    const soMoi = lapPhieuChiTraNcc(tt, {
      man: `${mod.key}/${sc.slug}`,
      id: String(row.id),
      so: soCt,
      di: `${path}/${row.id}`,
      dsTtCu: dsTt,
      cn: row.cn,
      doiTuong: String(row.doiTuong ?? ''),
      diaChi: String(row.diaChi ?? row._diaChi ?? ''),
      nguoiGiaoDich: String(row._nguoiGiao ?? row._nguoi ?? ''),
      goi: s.goi,
      ai: s.ten,
    })
    toast(`Đã lập ${soMoi}, trả ${money(tt.soTien)} đ`, {
      nut: { ten: 'Xem', onClick: () => { const p = apKhoPhieu(MAN_THU_CHI, []).find(r => r.so === soMoi); if (p) nav(`/app/${MAN_THU_CHI}/${p.id}`) } },
    })
  }

  // Tên loại phiếu và số phiếu
  const tenLoai = loai?.ten ?? (row.tenLoai ? String(row.tenLoai) : tenMan(sc))
  const soCt = String(row.so)

  // Chip trạng thái
  const ttCtInfo = TT_CT[row.tt] ?? ['dim', row.tt]
  const ttSxInfo = coTtXn && row.ttSx ? TT_SX[String(row.ttSx)] : null

  // Tham chiếu
  const ctTtCu = ctTtCon(row)
  const dsDc = dsDcCon(row)

  // Danh sách các tab hiển thị theo từng phân hệ
  const dsTab = useMemo(() => {
    if (laTien) {
      if (kieu === 'khong') {   // gói Standard, Plus hộ kinh doanh không có tab bút toán (QD81)
        return [
          { k: 'chitiet' as TabKey, ten: 'Chi tiết' },
          { k: 'lichsu' as TabKey, ten: 'Lịch sử' },
        ]
      }
      return [
        { k: 'chitiet' as TabKey, ten: 'Chi tiết' },
        { k: 'buttoan' as TabKey, ten: `Bút toán (${Math.round(dsButToan.length / 2)})` },
        { k: 'lichsu' as TabKey, ten: 'Lịch sử' },
      ]
    }
    if (nhomMb === 'mua') {
      if (kieu !== 'noco') {   // chỉ chế độ Nợ/Có (gói Pro) có tab Hạch toán, như bản web (T726, T820)
        return [
          { k: 'chitiet' as TabKey, ten: 'Chi tiết' },
          { k: 'lichsu' as TabKey, ten: 'Lịch sử' },
        ]
      }
      return [
        { k: 'chitiet' as TabKey, ten: 'Chi tiết' },
        { k: 'buttoan' as TabKey, ten: 'Hạch toán' },
        { k: 'lichsu' as TabKey, ten: 'Lịch sử' },
      ]
    }
    if (laKk) {
      return [
        { k: 'chitiet' as TabKey, ten: 'Chi tiết' },
        { k: 'lichsu' as TabKey, ten: 'Lịch sử' },
      ]
    }
    // Các phiếu kho khác (xuất kho, chuyển kho, điều chỉnh...): chỉ 2 tab Chi tiết, Lịch sử (T527)
    return [
      { k: 'chitiet' as TabKey, ten: 'Chi tiết' },
      { k: 'lichsu' as TabKey, ten: 'Lịch sử' },
    ]
  }, [laTien, nhomMb, laKk, kieu, dsButToan.length, dsDong.length, dsTt.length])

  // Sửa phiếu: phiếu chi đã có thẻ chi phí phân bổ thì không sửa, báo xoá thẻ trước như bản máy tính (T475, theo T439)
  // Phiếu mua đã trả (một phần hoặc đủ) thì không sửa, báo xoá phiếu chi trước (T658)
  // ctTtCu có thể đã nằm trong dsTt: lọc trùng theo số phiếu để không lặp mã (T661)
  const dsChiMua = nhomMb === 'mua'
    ? [...(ctTtCu ? [ctTtCu] : []), ...dsTt].filter((c, i, ds) => ds.findIndex(x => x.so === c.so) === i)
    : []
  const moSua = () => {
    if (theCuaPhieu(row).length) setHoiKhongSua(true)
    else if (nhomMb === 'mua' && daTra > 0) setHoiKhongSuaTt(true)
    else nav(`${path}/${row.id}?sua=1`)
  }

  // Nút hành động chính và phụ ở chân màn hình
  const coNutGhiSo = kieu !== 'khong' && !laDc   // gói Standard, Plus hộ kinh doanh không ghi sổ (QD81)
  // Phiếu kiểm kê đã sinh phiếu Xuất, Nhập điều chỉnh thì không sửa nữa (T657)
  const khoaKk = laKk && dsDc.length > 0
  const coTheSua = !laDc && !khoaKk && (!coNutGhiSo || row.tt !== 'ghi')
  let nutPhu: { nhan: string; action: () => void } | null = null
  let nutChinh: { nhan: string; laThanhToan?: boolean; action: () => void } | null = null

  if (nhomMb === 'mua') {
    if (coTheSua) {
      nutPhu = {
        nhan: 'Sửa phiếu',
        action: moSua,
      }
    }
    if (conLai > 0) {
      nutChinh = {
        nhan: 'Thanh toán',
        laThanhToan: true,
        action: () => setMoThanhToan(true),
      }
    } else if (coTheSua) {
      nutChinh = {
        nhan: 'Sửa phiếu',
        action: moSua,
      }
      nutPhu = null
    }
  } else if (s.goi === 'S') {
    if (!laKk && !laDc) nutChinh = {   // phiếu điều chỉnh không sửa (T660)
      nhan: 'Sửa phiếu',
      action: moSua,
    }
  } else if (coNutGhiSo) {
    if (row.tt === 'ghi') {
      nutPhu = {
        nhan: 'Bỏ ghi sổ',
        action: () => setHoiBoGhi(true),
      }
    } else {
      nutChinh = {
        nhan: 'Ghi sổ',
        action: () => toast('Đã ghi sổ'),
      }
    }
  } else if (!laDc && !laKk) {
    nutChinh = {
      nhan: 'Sửa phiếu',
      action: moSua,
    }
  }

  // Trả hàng ở phiếu mua có dòng hàng (T819, như web T727): mở lập phiếu trả lại hàng mua điền sẵn từ phiếu này
  const manTra = timMan('mua-hang', '4-1-4').sc
  const coTraHang = nhomMb === 'mua' && cfg.prefix !== 'TLN' && cfg.dong === 'nvl' && !cfg.khongKho && Boolean(manTra) && moDuoc(manTra!, s.goi)   // hoá đơn mua hàng không có Trả hàng (T826)
  const moTraHang = () => {
    const tu: TraTu = {
      id: String(row.id), so: soCt, man: `${mod.key}/${sc.slug}`, di: `${path}/${row.id}`, cn: cuaHangTen,
      doiTuong: String(row.doiTuong ?? ''), mst: String(row._mst ?? nv?.mst ?? ''), diaChi: String(row._diaChi ?? row.diaChi ?? nv?.dc ?? ''), kho,
      dong: dsDong.filter(d => Number(d.sl) > 0).map(d => ({ ...d, slMax: Number(d.sl) })), dsTra: dsTraCon(row),
    }
    // Đang xem Tất cả cửa hàng: lấy luôn cửa hàng của phiếu mua, không hỏi chọn cửa hàng (T418)
    const cn = CUA_HANG.find(c => c.ten === cuaHangTen)
    if ((!s.cuaHang || s.cuaHang === 'all') && cn && dsCuaHang(s).some(c => c.id === cn.id)) set({ cuaHang: cn.id })
    nav(`/app/${MAN_TRA_MUA}/moi`, { state: { traTu: tu } })
  }

  // Menu ba chấm
  // Điện thoại bỏ Xuất Excel; phiếu điều chỉnh không còn thao tác nào (T603, T660)
  const dsMenu = laDc
    ? []
    : [
        // Phiếu kiểm kê: Xoá, Sao chép, Sửa nằm ở thanh dưới, không mở menu này (T660)
        ...(nhomMb !== 'mua' && !laKk ? [{ k: 'sua', ten: 'Sửa chứng từ' }] : []),
        ...(!laKk ? [{ k: 'copy', ten: 'Sao chép chứng từ' }] : []),
        ...(coTraHang ? [{ k: 'tra', ten: 'Trả hàng' }] : []),
        { k: 'xoa', ten: 'Xoá chứng từ' },
      ]

  const handleMenuChon = (k: string) => {
    if (k === 'lichsu_tt') {
      setMoLichSuTt(true)
    } else if (k === 'sua') {
      moSua()
    } else if (k === 'thanhtoan') {
      setMoThanhToan(true)
    } else if (k === 'tra') {
      moTraHang()
    } else if (k === 'copy') {
      toast('Đã sao chép chứng từ')
      nav(`${path}/moi${row.loai ? `?loai=${row.loai}` : ''}`, { state: { saoChep: row } })
    } else if (k === 'xoa') {
      // Lỗi chặn có chứng từ: hộp chặn thay toast (T889, Chan.html hộp 5, 6)
      const ngayCt = String(row.ngay ?? '').split(' ')[0]
      const kk = khoaSoDenCua(row.cn)
      const thangKhoa = `${String(kk.thang).padStart(2, '0')}/${kk.nam}`
      const moKhoaSo = { ten: 'Mở màn khoá sổ', onClick: () => { setChan(null); nav(s.goi === 'PR' ? '/app/tong-hop/10-1-6' : '/app/he-thong/khoa-so') } }
      const dong = { ten: 'Đóng', onClick: () => setChan(null) }
      if (daKhoaSo(String(row.ngay), row.cn)) {
        setChan({
          nhan: 'Không xoá được', tieuDe: `${row.so} nằm trong tháng đã khoá sổ`,
          moTa: `Báo cáo tháng ${ngayCt.slice(3)} đã chốt. Xoá phiếu sẽ làm báo cáo đã nộp khác số trên phần mềm.`,
          duKien: [{ nhan: 'Ngày phiếu', gt: ngayCt }, { nhan: 'Đã khoá sổ đến', gt: `Tháng ${thangKhoa}` }],
          buoc: [`Mở khoá sổ về trước tháng ${ngayCt.slice(3)}.`, 'Xoá phiếu, rồi khoá sổ lại.'],
          nut: moKhoaSo,
        })
      } else if (coNutGhiSo && row.tt !== 'nhap') {
        setChan({
          nhan: 'Không xoá được', tieuDe: `${row.so} đã ghi sổ`,
          moTa: 'Phiếu đã có bút toán trong sổ. Bỏ ghi sổ trước rồi mới xoá được.',
          buoc: ['Bỏ ghi sổ phiếu.', 'Xoá phiếu.'],
          nut: { ten: 'Bỏ ghi sổ', onClick: () => { setChan(null); setHoiBoGhi(true) } },
        })
      } else if (lyDoKhongXoaTheCuaPhieu(row)) {
        // thẻ chi phí của phiếu thuộc kỳ đã khoá sổ (T475, theo T439)
        setChan({
          nhan: 'Không xoá được', tieuDe: `Thẻ chi phí của ${row.so} thuộc kỳ đã khoá sổ`,
          moTa: lyDoKhongXoaTheCuaPhieu(row)!,
          duKien: [{ nhan: 'Phiếu đang mở', gt: row.so }, { nhan: 'Đã khoá sổ đến', gt: `Tháng ${thangKhoa}` }],
          nut: moKhoaSo,
        })
      } else if (ttThamChieu(row)) {
        const tc = ttThamChieu(row)!
        setChan({
          nhan: 'Không xoá được', tieuDe: `${row.so} đang có phiếu ${tc.so} tham chiếu`,
          duKien: [{ nhan: 'Phiếu đang mở', gt: row.so }, { nhan: 'Tham chiếu bởi', gt: tc.so }],
          buoc: [`Xoá phiếu ${tc.so}.`, 'Quay lại xoá phiếu này.'],
          nut: dong, nutPhu: null,
        })
      } else if (((laSx && !sxNhap) || dcn === 'xdc') && row._phieuNhap) {
        const pn = row._phieuNhap as { id: string; so: string }
        const manNhap = sx ? SX[SX[sx].doi!].man : DCN.ndc.man
        setChan({
          nhan: 'Không xoá được',
          tieuDe: dcn === 'xdc' ? 'Cửa hàng nhận đã nhập phiếu điều chuyển này' : `${row.so} đã có phiếu nhập`,
          moTa: dcn === 'xdc' ? 'Xoá phiếu xuất thì tồn kho bên nhận còn hàng nhưng bên xuất không trừ.' : undefined,
          duKien: [{ nhan: 'Phiếu xuất', gt: row.so }, { nhan: 'Phiếu nhập', gt: pn.so, chip: 'Đã nhập' }],
          buoc: [`Xoá phiếu nhập ${pn.so}${dcn === 'xdc' ? ' ở cửa hàng nhận' : ''}.`, 'Quay lại xoá phiếu xuất này.'],
          nut: { ten: 'Mở phiếu nhập', onClick: () => { setChan(null); nav(`/app/${manNhap}/${pn.id}`) } },
        })
      } else {
        setHoiXoa(true)
      }
    }
  }

  const thucHienXoa = () => {
    setHoiXoa(false)
    xoaPhieu(`${mod.key}/${sc.slug}`, [{ id: String(row.id), so: soCt }], s.ten)
    xoaTheCuaPhieu([row], s.ten)   // phiếu chi đã tạo thẻ chi phí: xoá luôn thẻ như bản máy tính (T475, theo T436)
    if (coTcNhap && row._thamChieuId) {
      suaPhieu(manDoi, String(row._thamChieuId), { ttSx: 'cho', _phieuNhap: undefined })
    }
    if (laKk) {
      xoaPhieu(
        MAN_DC,
        dsDcCon(row).map(c => ({ id: c.id, so: c.so })),
        s.ten,
      )
    }
    toast(`Đã xoá ${soCt}`)
    nav(path, { replace: true })
  }

  const quayLai = () => {
    if (window.history.state && window.history.state.idx > 0) {
      nav(-1)
    } else {
      nav(path, { replace: true })
    }
  }

  // Tên chính hiển thị trên thẻ tổng quan
  const tenChinhThe = laTien
    ? String(row.dienGiai || row._ghiChu || row.doiTuong || tenLoai)
    : nhomMb === 'mua'
    ? String(row.doiTuong || row.dienGiai || 'Nhà cung cấp')
    : laKk
    ? String(kho || 'Kho bếp Lê Lợi')
    : String(row.dienGiai || row.doiTuong || tenLoai)

  // Chip trạng thái thẻ tổng quan
  let chipTt: { kieu: string; ten: string } | null = null
  if (nhomMb === 'mua' || laTraBan) {   // Hàng bán trả lại: tình trạng trả tiền khách như phiếu mua (T841)
    if (daTra >= tongGoc && tongGoc > 0) {
      chipTt = { kieu: 'da', ten: 'Đã thanh toán' }
    } else if (daTra > 0 && conLai > 0) {
      chipTt = { kieu: 'mot-phan', ten: 'Thanh toán một phần' }
    } else {
      chipTt = { kieu: 'chua', ten: 'Chưa thanh toán' }
    }
  } else if (coNutGhiSo) {
    if (row.tt === 'ghi') {
      chipTt = { kieu: 'dang', ten: 'Đã ghi sổ' }
    } else {
      chipTt = { kieu: 'cho', ten: 'Chưa ghi sổ' }
    }
  }

  // Xuất kho định lượng: mỗi món bán một thẻ, bên trong các NVL xuất cho món đó, cuối thẻ tiền vốn món
  type NvlXdl = { ma: string; ten: string; dvt: string; sl: number; gia: number; tien: number; lyDo?: { text: string } }
  type MonXdl = { ma: string; ten: string; sl: number; maCt?: string; ctId?: string; nvl: NvlXdl[] }
  const renderMonXdl = () => {
    const ds = (row._mon as MonXdl[] | undefined) ?? []
    if (!ds.length) return null
    const congThuc = s.goi === 'PL' ? '/app/danh-muc/cong-thuc-che-bien' : '/app/kho/9-1-3'
    const tongSl = ds.reduce((a, m) => a + m.sl, 0)
    const tongVon = ds.reduce((a, m) => a + m.nvl.reduce((b, n) => b + n.tien, 0), 0)
    return (
      <div>
        <div className="m-pb-nhom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>MÓN BÁN, NGUYÊN VẬT LIỆU XUẤT</span>
          <span style={{ color: 'var(--muted)', fontWeight: 'normal', textTransform: 'none', fontSize: 13 }}>{ds.length} món</span>
        </div>
        <div className="m-t449-hang-ds">
          {ds.map((m, i) => (
            <div key={i} className="m-t449-hang-the">
              <div className="m-t449-hang-dau">
                <div className="m-t449-hang-ten">{i + 1}. {m.ten} <span className="m-t449-hang-ma" style={{ color: 'var(--muted)', fontWeight: 'normal' }}>{m.ma}</span></div>
              </div>
              <div className="m-t449-hang-than">
                <div className="m-t449-hang-dong"><span className="lbl">Số lượng bán:</span><span className="val bold num">{soLuong(m.sl)}</span></div>
                {m.maCt && (
                  <div className="m-t449-hang-dong"><span className="lbl">Công thức:</span>
                    <span className="val">{m.ctId ? <Link to={`${congThuc}/${m.ctId}`} style={{ color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}>{m.maCt}</Link> : m.maCt}</span></div>
                )}
                <div style={{ borderTop: '1px solid var(--line)', margin: '6px 0 2px' }} />
                {m.nvl.map((n, j) => (
                  <div key={j} style={{ padding: '6px 0', borderBottom: j < m.nvl.length - 1 ? '1px dashed var(--line)' : undefined }}>
                    <div style={{ fontWeight: 600 }}>{n.ten} <span style={{ color: 'var(--muted)', fontWeight: 'normal' }}>· {n.ma}</span></div>
                    <div className="m-t449-hang-dong" style={{ color: 'var(--muted)' }}>
                      <span className="lbl">{soLuong(n.sl)} {n.dvt} × <span style={n.lyDo ? { color: 'var(--amber)' } : undefined} title={n.lyDo?.text}>{money(n.gia)}</span></span>
                      <span className="val bold num" style={{ color: 'var(--ink)' }}>{money(n.tien)} đ</span>
                    </div>
                  </div>
                ))}
                <div className="m-t449-hang-dong" style={{ borderTop: '1px solid var(--line)', paddingTop: 6 }}>
                  <span className="lbl">Tiền vốn món:</span>
                  <span className="val bold num">{money(m.nvl.reduce((b, n) => b + n.tien, 0))} đ</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="m-t600-the-tong">
          <div className="m-t600-tong-tieu"><span>Tổng cộng ({ds.length} món)</span></div>
          <div className="m-t600-tong-dong"><span>Tổng số lượng món</span><span className="num">{soLuong(tongSl)}</span></div>
          <div className="m-t600-tong-dong tong-chinh"><span>Tổng tiền vốn</span><span className="bold num">{money(tongVon)} đ</span></div>
        </div>
      </div>
    )
  }

  const renderDsHangHoaMua = () => laXdl ? renderMonXdl() : (   // phiếu XDL toàn món lỗi: không có dòng xuất, chỉ hiện mục Món chưa xuất được
    <div>
      <div className="m-pb-nhom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>HÀNG HOÁ, DỊCH VỤ</span>
        <span style={{ color: 'var(--muted)', fontWeight: 'normal', textTransform: 'none', fontSize: 13 }}>
          {dsDong.length} dòng
        </span>
      </div>

      <div className="m-t449-hang-ds">
        {dsDong.map((d, idx) => {
          // Hàng bán trả lại GTGT theo % doanh thu: giảm thuế từng dòng như xem Bán hàng, cộng các dòng khớp tổng ở trên (T885)
          const giamDong = giamTraBan ? giamThueHang(cfg.dongPos ? dtDong(d) : (Number(d.tien) || 0) - (Number(d.ck) || 0), d.ma) : 0
          const tongDong = (Number(d.tien) || 0) - (Number(d.ck) || 0) + (Number(d.thue) || 0) - giamDong
          const vatNhan = !d.ts || d.ts === 0 ? 'KCT' : `${d.ts}%`

          return (
            <div key={idx} className="m-t449-hang-the">
              <div className="m-t449-hang-dau">
                <div className="m-t449-hang-ten">
                  {idx + 1}. {d.ten || 'Mặt hàng'}
                  {d.ma ? <> <span className="m-t449-hang-ma" style={{ color: 'var(--muted)', fontWeight: 'normal' }}>{d.ma}</span></> : null}
                </div>
              </div>
              <div className="m-t449-hang-than">
                <div className="m-t449-hang-dong">
                  <span className="lbl">Số lượng:</span>
                  <span className="val bold num">{d.sl ?? 1} {d.dvt || 'Cái'}</span>
                </div>
                <div className="m-t449-hang-dong">
                  <span className="lbl">{kieuVon ? 'Giá vốn:' : 'Đơn giá:'}</span>
                  <span className="val num">{money(d.gia || 0)} đ</span>
                </div>
                {/* Dòng không có số tiền thì ẩn */}
                {Number(d.ck) > 0 && (
                  <div className="m-t449-hang-dong">
                    <span className="lbl">Tiền chiết khấu:</span>
                    <span className="val num">{money(d.ck || 0)} đ</span>
                  </div>
                )}
                {Number(d.thue) > 0 && (
                  <div className="m-t449-hang-dong">
                    <span className="lbl">VAT ({vatNhan}):</span>
                    <span className="val num">{money(d.thue || 0)} đ</span>
                  </div>
                )}
                {giamDong > 0 && (
                  <div className="m-t449-hang-dong">
                    <span className="lbl">Giảm thuế GTGT:</span>
                    <span className="val num">{money(giamDong)} đ</span>
                  </div>
                )}
                <div className="m-t449-hang-dong">
                  <span className="lbl">{laNk ? 'Thành tiền:' : kieuVon ? 'Tiền vốn:' : 'Tổng tiền:'}</span>
                  <span className="val bold num">{money(tongDong)} đ</span>
                </div>
              </div>
            </div>
          )
        })}

        {/* A6: Khối Tổng cộng (N dòng) cuối danh sách hàng, cuộn theo nội dung, CHỈ 5 dòng */}
        <div className="m-t600-the-tong">
          <div className="m-t600-tong-tieu">
            <span>Tổng cộng ({dsDong.length} dòng)</span>
          </div>
          {/* Xuất huỷ (T927): Tổng cộng chỉ Tổng số lượng, Tổng tiền vốn */}
          {kieuVon ? (
            <div className="m-t600-tong-dong">
              <span>Tổng số lượng</span>
              <span className="num">{soLuong(dsDong.reduce((a, d) => a + (Number(d.sl) || 0), 0))}</span>
            </div>
          ) : (
            <div className="m-t600-tong-dong">
              <span>Thành tiền</span>
              <span className="num">{money(tongTien)}</span>
            </div>
          )}
          {tongCk > 0 && (
            <div className="m-t600-tong-dong">
              <span>Tiền chiết khấu</span>
              <span className="num">{money(tongCk)}</span>
            </div>
          )}
          {tongThue > 0 && (
            <div className="m-t600-tong-dong">
              <span>Tiền thuế</span>
              <span className="num">{money(tongThue)}</span>
            </div>
          )}
          {tongGiamThue > 0 && (
            <div className="m-t600-tong-dong">
              <span>Giảm thuế GTGT</span>
              <span className="num">{money(tongGiamThue)}</span>
            </div>
          )}
          <div className="m-t600-tong-dong tong-chinh">
            <span>{kieuVon ? 'Tổng tiền vốn' : 'Tổng tiền'}</span>
            <span className="bold num">{money(tongThanhToan)} đ</span>
          </div>
        </div>
      </div>
    </div>
  )

  const hopChan = chan && <ThongBao loai="chan" {...chan} onDong={() => setChan(null)} />

  if (laTien) {
    return (
      <>
      {hopChan}
      <MDtThuChiXem
        sc={sc}
        mod={mod}
        row={row}
        moSua={moSua}
        thucHienXoa={thucHienXoa}
        hoiBoGhi={hoiBoGhi}
        setHoiBoGhi={setHoiBoGhi}
        hoiKhongSua={hoiKhongSua}
        setHoiKhongSua={setHoiKhongSua}
        hoiXoa={hoiXoa}
        setHoiXoa={setHoiXoa}
        handleMenuChon={handleMenuChon}
        quayLai={quayLai}
        dsDong={dsDong}
        triQuy={triQuy}
        triLyDo={triLyDo}
        triNguoiGiaoDich={triNguoiGiaoDich}
        cuaHangTen={cuaHangTen}
      />
      </>
    )
  }

  return (
    <div className={`m-pb-man${nhomMb === 'mua' ? ' m-xp-mua' : ''}`}>
      {/* ── THANH ĐẦU MÀN HÌNH ── */}
      <header className="m-pb-thanh-dau">
        <button type="button" className="m-pb-btn-back" onClick={quayLai} aria-label="Quay lại">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="m-pb-tieu-de">
          {cfg.khongKho
            ? `Hoá đơn mua hàng ${soCt}`
            : nhomMb === 'mua'
              ? `Phiếu mua hàng ${soCt}`
              : laCtth
                ? `Chứng từ tổng hợp ${soCt}`
                : khoChuanXem
                  ? tenPhieuKho()
                  : soCt}
        </h2>
        <span className="m-pb-thanh-dau-phai" />
      </header>

      {/* ── NỘI DUNG CUỘN ── */}
      <div className="m-pb-noi-dung">
        {/* 1. THẺ TỔNG QUAN (A2) */}
        {/* Hàng bán trả lại dùng thẻ đầu như phiếu mua: cửa hàng, nguồn, tổng tiền, khung thanh toán (T841) */}
        {nhomMb === 'mua' || laTraBan ? (
          <div className="m-t600-the-dau m-t655-dau">
            {/* Hàng đầu như chi tiết thu chi: cửa hàng bên trái, nguồn bên phải; bỏ chip trạng thái và tên nhà cung cấp (T655) */}
            <div className="m-tc-xem-dong-cn">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>{cuaHangTen}</span>
              <span className="m-tc-badge-nguon m-tc-xem-nguon">
                {laTraBan ? (NGUON[row.nguon]?.[1] ?? 'Thủ công') : row.nguon === 'excel' ? 'Excel' : row.nguon === 'pos' ? 'POS' : 'Thủ công'}
              </span>
            </div>

            <div>
              <div className="m-t600-tong-tien-nhan">Tổng tiền</div>
              <div className={`m-t600-tong-tien-so ${chipTt?.kieu === 'da' ? 'xanh' : 'cam'}`}>
                {money(tongGoc)} đ
              </div>
            </div>

            <div className="m-t600-khung-tt">
              <div className="m-t600-tt-tien-do-khu">
                <div className="m-t600-tt-tien-do-hang">
                  <span>Thanh toán</span>
                  <span className={`m-t600-chip-tt ${chipTt?.kieu || 'chua'}`}>
                    {chipTt?.ten || 'Chưa thanh toán'}
                  </span>
                </div>
                <div className="m-t600-tt-tien-do-hang">
                  <span>Đã trả</span>
                  <b>{money(daTra)} / {money(tongGoc)}</b>
                </div>
                <div className="m-t600-thanh-tien-do">
                  <div
                    className="m-t600-tien-do-fill"
                    style={{ width: `${tongGoc > 0 ? Math.min(100, Math.round((daTra / tongGoc) * 100)) : 0}%` }}
                  />
                </div>
                {s.goi !== 'S' && hanTt && (
                  <div className="m-t600-han-tt-dong">
                    Hạn {hanTt}{tinhSoNgayCon(hanTt) ? ` · ${tinhSoNgayCon(hanTt)}` : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : khoChuanXem || laCtth ? (
          <div className="m-t600-the-dau m-t655-dau">
            <div className="m-tc-xem-dong-cn">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>{cuaHangTen}</span>
              <span className="m-tc-badge-nguon m-tc-xem-nguon">
                {NGUON[row.nguon]?.[1] ?? 'Thủ công'}
              </span>
            </div>

            <div>
              <div className="m-t600-tong-tien-nhan">{laCtth ? 'Tổng tiền' : laXdl ? 'Tổng tiền vốn' : 'Tổng giá trị'}</div>
              <div className="m-t600-tong-tien-so">
                {money(laCtth ? (dsDong.reduce((a, d) => a + (Number(d.tien) || 0), 0) || Number(row.tien) || 0) : (Number(laXdl ? row.tong : row.tien) || 0))} đ
              </div>
            </div>
          </div>
        ) : (
        <div className="m-pb-the m-pb-the-tong-quan">
          {/* Nhập kho (T824): như phiếu mua, cửa hàng và nguồn lên dòng đầu, bỏ tên thẻ (diễn giải đã có ở Chi tiết), bỏ ô Cửa hàng, Nguồn chứng từ */}
          {khoGonXem && (
            <div className="m-tc-xem-dong-cn">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>{cuaHangTen}</span>
              <span className="m-tc-badge-nguon m-tc-xem-nguon">{NGUON[row.nguon]?.[1] ?? 'Thủ công'}</span>
            </div>
          )}
          {!khoGonXem && <div className="m-pb-hang-chip">
            <span className="m-pb-chip-loai">{tenLoai}</span>
            {chipTt && <span className={`m-pb-chip-tt ${chipTt.kieu}`}>{chipTt.ten}</span>}
          </div>}

          {!khoGonXem && !laTraBan && <div className="m-pb-ten-the">{tenChinhThe}</div>}

          {!khoGonXem && <div className="m-pb-dong-cn">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.8" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>{cuaHangTen}</span>
            {/* Phiếu điều chỉnh: nguồn chứng từ cạnh cửa hàng như xem thu chi (T603) */}
            {laDc && <span className="m-tc-badge-nguon m-tc-xem-nguon">{NGUON[row.nguon]?.[1] ?? 'Thủ công'}</span>}
          </div>}

          {/* Số tiền lớn */}
          {laDc ? null : laTien ? (
            <div>
              <div className="m-pb-nhan-gt">{chieu === 'vao' ? 'Số tiền thu' : 'Số tiền chi'}</div>
              <div className={`m-pb-so-gt${chieu === 'ra' ? ' cam' : ''}`}>
                {money(tongTien || Number(row.tong) || 0)} đ
              </div>
            </div>
          ) : laKk ? (
            <div>
              <div className="m-pb-nhan-gt">Tổng kiểm kê</div>
              <div className="m-pb-so-gt">{dsDong.length} mặt hàng</div>
            </div>
          ) : (
            <div>
              <div className="m-pb-nhan-gt">{laNk ? 'Tổng tiền' : laHuy ? 'Tổng tiền vốn' : 'Tổng thanh toán'}</div>{/* Nhập kho ghi theo giá nhập kho, không thuế, chiết khấu (T824) */}
              <div className="m-pb-so-gt">{money(tongThanhToan)} đ</div>
            </div>
          )}

          {/* Ô thống kê quỹ thu/chi rộng hết hàng (T424) */}
          {laTien ? (
            <div className="m-pb-o-stat da">
              <div className="m-pb-o-stat-nhan">{chieu === 'vao' ? 'Quỹ thu tiền' : 'Quỹ chi tiền'}</div>
              <div className="m-pb-o-stat-so da">{triQuy}</div>
            </div>
          ) : laKk ? (
            <div className="m-pb-luoi-stat m-t468-luoi-kk">
              <div className="m-pb-o-stat do">
                <div className="m-pb-o-stat-nhan">Thiếu</div>
                <div className="m-pb-o-stat-so do">
                  {hangThieu.length} mặt hàng
                </div>
              </div>
              <div className="m-pb-o-stat xanh">
                <div className="m-pb-o-stat-nhan">Thừa</div>
                <div className="m-pb-o-stat-so xanh">
                  {hangThua.length} mặt hàng
                </div>
              </div>
              <div className="m-pb-o-stat khop">
                <div className="m-pb-o-stat-nhan">Khớp</div>
                <div className="m-pb-o-stat-so khop">
                  {hangKhop.length} mặt hàng
                </div>
              </div>
            </div>
          ) : laDc || khoGonXem ? null : (
            <div className="m-pb-luoi-stat">
              <div className="m-pb-o-stat da">
                <div className="m-pb-o-stat-nhan">Cửa hàng</div>
                <div className="m-pb-o-stat-so da">{cuaHangTen}</div>
              </div>
              <div className="m-pb-o-stat con">
                <div className="m-pb-o-stat-nhan">Nguồn chứng từ</div>
                <div className="m-pb-o-stat-so con">{NGUON[row.nguon]?.[1] ?? 'Thủ công'}</div>
              </div>
            </div>
          )}
        </div>

        )}

        {/* 2. TABS SEGMENTED */}
        <div className="m-pb-tabs" role="tablist">
          {dsTab.map(t => (
            <button
              key={t.k}
              type="button"
              role="tab"
              aria-selected={tab === t.k}
              className={`m-pb-tab-btn${tab === t.k ? ' on' : ''}`}
              onClick={() => setTab(t.k)}
            >
              {t.ten}
            </button>
          ))}
        </div>

        {/* 3. NỘI DUNG THEO TAB */}
        {tab === 'chitiet' && (
          <>
            {/* Nhóm thông tin phiếu */}
            {laTien ? (
              <>
                <div className="m-pb-nhom">
                  {chieu === 'vao' ? 'THÔNG TIN PHIẾU THU' : 'THÔNG TIN PHIẾU CHI'}
                </div>
                <div className="m-pb-the m-pb-the-gon">
                  <div className="m-pb-dong">
                    <span className="n">Ngày lập</span>
                    <span className="g">{String(row.ngay ?? '').split(' ')[0]}</span>
                  </div>
                  {row.doiTuong && (
                    <div className="m-pb-dong">
                      <span className="n">{chieu === 'vao' ? 'Người nộp' : 'Người nhận'}</span>
                      <span className="g">{String(row.doiTuong)}</span>
                    </div>
                  )}
                  {triNguoiGiaoDich && (
                    <div className="m-pb-dong">
                      <span className="n">{nhom === 'cq' ? 'Người thực hiện' : 'Người giao dịch'}</span>
                      <span className="g">{triNguoiGiaoDich}</span>
                    </div>
                  )}
                  {triLyDo && (
                    <div className="m-pb-dong">
                      <span className="n">{chieu === 'vao' ? 'Lý do thu' : 'Lý do chi'}</span>
                      <span className="g">{triLyDo}</span>
                    </div>
                  )}
                  {(row.dienGiai || row._ghiChu) && (
                    <div className="m-pb-dong">
                      <span className="n">Diễn giải</span>
                      <span className="g">{String(row.dienGiai || row._ghiChu)}</span>
                    </div>
                  )}
                  {/* Tham chiếu thẻ chi phí phân bổ */}
                  {Array.isArray(row._theCp) && (row._theCp as string[]).length > 0 && (
                    <div className="m-pb-dong">
                      <span className="n">Tham chiếu</span>
                      <span className="g link">
                        {(row._theCp as string[]).map(so => (
                          <Link key={so} to={`/app/ccdc/8-1-1?mo=${so}`} className="m-pb-dong g link" style={{ display: 'inline' }}>
                            {so}
                          </Link>
                        ))}
                      </span>
                    </div>
                  )}
                  <div className="m-pb-dong">
                    <span className="n">Nguồn chứng từ</span>
                    <span className="g">{NGUON[row.nguon]?.[1] ?? 'Thủ công'}</span>
                  </div>
                </div>

                {/* Hạch toán mở sẵn ở tab chi tiết nếu có */}
                {s.goi !== 'S' && dsButToan.length > 0 && (
                  <>
                    <div className="m-pb-nhom">HẠCH TOÁN</div>
                    <div className="m-pb-the m-pb-the-gon">
                      {dsButToan.map((bt, idx) => (
                        <div key={idx} className="m-ht-dong">
                          <span className="m-ht-tk">
                            {bt.kieu === 'no' ? 'Nợ' : 'Có'} {bt.so} <i className="m-ht-ten">{bt.ten}</i>
                          </span>
                          <span className="m-ht-so">{money(bt.tien)} đ</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Chi tiết mục thu / chi */}
                <div className="m-pb-nhom">
                  {chieu === 'vao' ? `CHI TIẾT MỤC THU (${dsDong.length})` : `CHI TIẾT MỤC CHI (${dsDong.length})`}
                </div>
                {dsDong.map((d, idx) => {
                  const tieuDe = d.ten || d.ly || row.dienGiai || 'Tiền chi'
                  const dong2Parts = [
                    d.ly && d.ly !== tieuDe ? d.ly : '',
                    d.dt && d.dt !== row.doiTuong ? `Đối tượng: ${d.dt}` : '',
                    d.km ? `Khoản mục: ${tenKm(d.km)}` : '',
                    d.cv ? `Công việc: ${d.cv}` : '',
                    d.ghiChu,
                  ].filter(Boolean)
                  const dong2 = dong2Parts.join(' · ') || (d.ly ? d.ly : '1 Khoản · Chi phí chờ phân bổ')

                  return (
                    <div key={idx} className="m-pb-the m-pb-muc-dong">
                      <div className="m-pb-muc-hang1">
                        <span className="m-pb-muc-ten">{tieuDe}</span>
                      </div>
                      <div className="m-pb-muc-hang2">
                        <span>{dong2}</span>
                        <b className="m-pb-muc-tong">{money(d.tien || 0)} đ</b>
                      </div>
                    </div>
                  )
                })}
              </>
            ) : nhomMb === 'mua' ? (
              <>
                {/* Thông tin chung: gộp nhà cung cấp với ngày, kho, ghi chú; bỏ số phiếu nhập (T655) */}
                <div className="m-pb-nhom">THÔNG TIN CHUNG</div>
                <div className="m-pb-the m-pb-the-gon m-t655-gon">
                  <div className="m-pb-dong">
                    <span className="n">Nhà cung cấp</span>
                    <span className="g bold">{String(row.doiTuong || '')}</span>
                  </div>
                  <div className="m-pb-dong">
                    <span className="n">Ngày chứng từ</span>
                    <span className="g">{row.ngay}</span>
                  </div>
                  {cfg.khongKho ? (
                    /* Hoá đơn mua hàng: Lý do nghiệp vụ thay Kho nhập, lý do tích Là chi phí có nhãn Chi phí (T826) */
                    <div className="m-pb-dong">
                      <span className="n">Lý do</span>
                      <span className="g">
                        {String(row._lyDo ?? dsDong[0]?.ly ?? '')}
                        {laLyChiPhi(String(row._lyDo ?? dsDong[0]?.ly ?? ''), s) && <span className="m-t826-cp">Chi phí</span>}
                      </span>
                    </div>
                  ) : (
                  <div className="m-pb-dong">
                    <span className="n">Kho nhập</span>
                    <span className="g">{kho}</span>
                  </div>
                  )}
                  {(row.dienGiai || row._ghiChu) && (
                    <div className="m-pb-dong">
                      <span className="n">Ghi chú</span>
                      <span className="g">{String(row.dienGiai || row._ghiChu)}</span>
                    </div>
                  )}
                  {danhSachThamChieu.length > 0 && (
                    <div className="m-pb-dong">
                      <span className="n">Tham chiếu</span>
                      <span className="g link" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
                        {danhSachThamChieu.map((tc, idx) => (
                          <Link
                            key={idx}
                            to={tc.url}
                            style={{ color: 'var(--blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                          >
                            <span>{tc.so}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                              <path d="M9 6l6 6-6 6" />
                            </svg>
                          </Link>
                        ))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thông tin hoá đơn tách riêng khi phiếu nhận kèm hoá đơn (T655) */}
                {nhanKemHd && (
                  <>
                    <div className="m-pb-nhom">THÔNG TIN HOÁ ĐƠN</div>
                    <div className="m-pb-the m-pb-the-gon m-t655-gon">
                      <div className="m-pb-dong">
                        <span className="n">Số hoá đơn</span>
                        <span className="g">{soHd}</span>
                      </div>
                      <div className="m-pb-dong">
                        <span className="n">Ký hiệu</span>
                        <span className="g">{kyHieuHd}</span>
                      </div>
                      <div className="m-pb-dong">
                        <span className="n">Ngày hoá đơn</span>
                        <span className="g">{ngayHd}</span>
                      </div>
                    </div>
                  </>
                )}

                {renderDsHangHoaMua()}
              </>
            ) : khoChuanXem ? (
              <>
                <div className="m-pb-nhom">THÔNG TIN CHUNG</div>
                <div className="m-pb-the m-pb-the-gon m-t655-gon">
                  <div className="m-pb-dong">
                    <span className="n">Ngày</span>
                    <span className="g">{String(row.ngay ?? '').split(' ')[0]}</span>
                  </div>
                  <div className="m-pb-dong">
                    <span className="n">Số phiếu</span>
                    <span className="g">{soCt}</span>
                  </div>
                  {laDcn ? (
                    <>
                      <div className="m-pb-dong">
                        <span className="n">Từ kho</span>
                        <span className="g">{tuKho}</span>
                      </div>
                      <div className="m-pb-dong">
                        <span className="n">Đến kho</span>
                        <span className="g">{denKho}</span>
                      </div>
                    </>
                  ) : (
                    <div className="m-pb-dong">
                      <span className="n">{laHuy || laXdl ? 'Kho xuất' : laNk ? 'Kho nhập' : 'Kho'}</span>
                      <span className="g">{kho}</span>
                    </div>
                  )}
                  {!laXdl && (Boolean(row.doiTuong) || sc.code === '5.1.2-4') && (
                    <div className="m-pb-dong">
                      <span className="n">{sc.code === '5.1.2-4' ? 'Người nhận' : 'Đối tượng'}</span>
                      <span className="g">{String(row.doiTuong || '')}</span>
                    </div>
                  )}
                  {laHuy && (
                    <div className="m-pb-dong">
                      <span className="n">Lý do huỷ</span>
                      <span className="g">{String(row._lyDo || LY_DO.find(x => x.dung === 'Xuất kho')?.ten || '')}</span>
                    </div>
                  )}
                  {/* Nhập kho, Xuất huỷ: có Người thực hiện (T824, T927, như web T818) */}
                  {(laNk || laHuy || laXdl) && (
                    <div className="m-pb-dong">
                      <span className="n">Người thực hiện</span>
                      <span className="g">{String(row._nhanVien ?? row._nguoiTao ?? nguoiTaoMau(row.so))}</span>
                    </div>
                  )}
                  {(row.dienGiai || row._ghiChu) && (
                    <div className="m-pb-dong">
                      <span className="n">Diễn giải</span>
                      <span className="g">{String(row.dienGiai || row._ghiChu)}</span>
                    </div>
                  )}
                  {danhSachThamChieu.length > 0 && (
                    <div className="m-pb-dong">
                      <span className="n">Tham chiếu</span>
                      <span className="g link" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
                        {danhSachThamChieu.map((tc, idx) => (
                          <Link
                            key={idx}
                            to={tc.url}
                            style={{ color: 'var(--blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}
                          >
                            <span>{tc.so}</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                              <path d="M9 6l6 6-6 6" />
                            </svg>
                          </Link>
                        ))}
                      </span>
                    </div>
                  )}
                </div>

                {renderDsHangHoaMua()}
                {/* Xuất kho định lượng: món không trừ được NVL, như tab Lỗi trên web */}
                {laXdl && ((row._loi as { ma: string; ten: string; sl: number; lyDo: string }[] | undefined) ?? []).length > 0 && (
                  <div>
                    <div className="m-pb-nhom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>MÓN CHƯA XUẤT ĐƯỢC</span>
                      <span style={{ color: 'var(--muted)', fontWeight: 'normal', textTransform: 'none', fontSize: 13 }}>{(row._loi as unknown[]).length} món</span>
                    </div>
                    <div className="m-t449-hang-ds">
                      {(row._loi as { ma: string; ten: string; sl: number; lyDo: string }[]).map((m, idx) => (
                        <div key={idx} className="m-t449-hang-the">
                          <div className="m-t449-hang-dau">
                            <div className="m-t449-hang-ten">{idx + 1}. {m.ten} <span className="m-t449-hang-ma" style={{ color: 'var(--muted)', fontWeight: 'normal' }}>{m.ma}</span></div>
                          </div>
                          <div className="m-t449-hang-than">
                            <div className="m-t449-hang-dong"><span className="lbl">Số lượng:</span><span className="val bold num">{soLuong(m.sl)}</span></div>
                            <div className="m-t449-hang-dong"><span className="lbl">Lý do:</span><span className="val" style={{ color: 'var(--red)' }}>{m.lyDo}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : laCtth ? (
              <>
                <div className="m-pb-nhom">THÔNG TIN CHUNG</div>
                <div className="m-pb-the m-pb-the-gon m-t655-gon">
                  <div className="m-pb-dong">
                    <span className="n">Ngày</span>
                    <span className="g">{String(row.ngay ?? '').split(' ')[0]}</span>
                  </div>
                  <div className="m-pb-dong">
                    <span className="n">Số chứng từ</span>
                    <span className="g">{soCt}</span>
                  </div>
                  {(row.dienGiai || row._ghiChu) && (
                    <div className="m-pb-dong">
                      <span className="n">Diễn giải</span>
                      <span className="g">{String(row.dienGiai || row._ghiChu)}</span>
                    </div>
                  )}
                </div>

                <div className="m-pb-nhom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>BÚT TOÁN</span>
                  <span style={{ color: 'var(--muted)', fontWeight: 'normal', textTransform: 'none', fontSize: 13 }}>
                    {dsDong.length} bút toán
                  </span>
                </div>

                {dsDong.map((d, idx) => {
                  const dg = d.ten || d.ly || row.dienGiai || `Bút toán ${idx + 1}`
                  const dt = d.dt || ''
                  return (
                    <div key={idx} className="m-pb-the m-pb-the-gon m-t655-gon">
                      <div className="m-pb-dong">
                        <span className="n">Diễn giải</span>
                        <span className="g bold">{dg}</span>
                      </div>
                      <div className="m-pb-dong">
                        <span className="n">TK Nợ</span>
                        <span className="g">{d.tkNo || '6421'}</span>
                      </div>
                      <div className="m-pb-dong">
                        <span className="n">TK Có</span>
                        <span className="g">{d.tkCo || '242'}</span>
                      </div>
                      <div className="m-pb-dong">
                        <span className="n">Số tiền</span>
                        <span className="g bold num">{money(Number(d.tien) || 0)} đ</span>
                      </div>
                      {Boolean(dt) && (
                        <div className="m-pb-dong">
                          <span className="n">Đối tượng</span>
                          <span className="g">{String(dt)}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            ) : laKk ? (
              <>
                <div className="m-pb-nhom">THÔNG TIN KIỂM KÊ</div>
                <div className="m-pb-the m-pb-the-gon">
                  <div className="m-pb-dong">
                    <span className="n">Thời gian kiểm</span>
                    <span className="g">{[row.ngay, row.gio].filter(Boolean).join(' ')}</span>
                  </div>
                  <div className="m-pb-dong">
                    <span className="n">Kho kiểm kê</span>
                    <span className="g">{kho || 'Kho'}</span>
                  </div>
                  <div className="m-pb-dong">
                    <span className="n">Người kiểm</span>
                    <span className="g">{String(row.doiTuong || row._nguoiGiao || row._nguoi || 'Trần Thu Hà')}</span>
                  </div>
                  {(row.dienGiai || row._ghiChu) && (
                    <div className="m-pb-dong">
                      <span className="n">Diễn giải</span>
                      <span className="g">{String(row.dienGiai || row._ghiChu)}</span>
                    </div>
                  )}
                  {dsDc.length > 0 && (
                    <div className="m-pb-dong">
                      <span className="n">Tham chiếu</span>
                      <span className="g link">
                        {dsDc.map(c => (
                          <Link key={c.id} to={`/app/${MAN_DC}/${c.id}`} style={{ color: 'var(--blue)', textDecoration: 'none', marginLeft: 4 }}>
                            {c.so}
                          </Link>
                        ))}
                      </span>
                    </div>
                  )}
                </div>

                {/* Danh sách mặt hàng kiểm kê */}
                <div className="m-pb-nhom">CHI TIẾT MẶT HÀNG ({dsDong.length})</div>
                {dsDong.map((d, idx) => {
                  const chenh = Math.round(((d.tonTt ?? 0) - (d.tonHt ?? 0)) * 100) / 100
                  const loaiKk = loaiXuLy(d) || (chenh > 0 ? 'Nhập điều chỉnh' : chenh < 0 ? 'Xuất điều chỉnh' : 'Khớp')
                  const chipKkClass = chenh > 0 ? 'nhap' : chenh < 0 ? 'xuat' : 'khop'
                  const dvtTxt = d.dvt || 'kg'

                  return (
                    <div key={idx} className="m-pb-the m-pb-muc-dong">
                      <div className="m-pb-muc-hang1">
                        <span className="m-pb-muc-ten kk-ten">
                          <b>{d.ten || 'Mặt hàng'}</b>
                          {d.ma && <small>{d.ma}</small>}
                        </span>
                        <span className={`chip-kk ${chipKkClass}`}>{loaiKk}</span>
                      </div>
                      <div className="m-kk-o3 kk4">
                        <div className="m-kk-o3-item kk-o-dvt">
                          <span className="m-kk-o3-nhan">ĐVT</span>
                          <span className="kk-dvt-btn">{dvtTxt}</span>
                        </div>
                        <div className="m-kk-o3-item">
                          <span className="m-kk-o3-nhan">Tồn sổ</span>
                          <span className="m-kk-o3-so">{soLuong(d.tonHt ?? 0)}</span>
                        </div>
                        <div className="m-kk-o3-item">
                          <span className="m-kk-o3-nhan">Thực tế</span>
                          <span className="m-kk-o3-so">{soLuong(d.tonTt ?? 0)}</span>
                        </div>
                        <div className="m-kk-o3-item">
                          <span className="m-kk-o3-nhan">Chênh lệch</span>
                          <span className={`m-kk-o3-so ${chenh > 0 ? 'xanh' : chenh < 0 ? 'do' : ''}`}>
                            {chenh > 0 ? `+${soLuong(chenh)}` : soLuong(chenh)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Tổng hợp kiểm kê */}
                <div className="m-pb-nhom">TỔNG HỢP KIỂM KÊ</div>
                <div className="m-pb-the m-pb-the-gon">
                  <div className="m-pb-dong">
                    <span className="n">Tổng số mặt hàng</span>
                    <span className="g">{dsDong.length} hàng (Khớp {hangKhop.length} · Lệch {hangThua.length + hangThieu.length})</span>
                  </div>
                  <div className="m-pb-dong">
                    <span className="n">Tổng hàng thừa (nhập điều chỉnh)</span>
                    <span className="g" style={{ color: 'var(--green)', fontWeight: 700 }}>
                      {slThua > 0 ? `+${soLuong(slThua)} ${dvtChinhKho}` : '0'}
                    </span>
                  </div>
                  <div className="m-pb-dong">
                    <span className="n">Tổng hàng thiếu (xuất điều chỉnh)</span>
                    <span className="g" style={{ color: 'var(--red)', fontWeight: 700 }}>
                      {slThieu > 0 ? `-${soLuong(slThieu)} ${dvtChinhKho}` : '0'}
                    </span>
                  </div>
                </div>
              </>
            ) : laTraBan ? (() => {
              // Hàng bán trả lại (T830): ô như đầu phiếu web; trả tiền ngay thì kèm phiếu chi ở Tham chiếu
              const httt = String(row._httt ?? (nv?.ttTien === 'da' ? 'tienmat' : 'congno'))
              const ctTt = ctTtCon(row)
              const dsTc = [...(ctTt && !danhSachThamChieu.some(x => x.so === ctTt.so) ? [{ so: ctTt.so, url: `/app/tien/2-1-1/${ctTt.id}` }] : []), ...danhSachThamChieu]
              const dongTt = (n: string, g: string) => g ? <div className="m-pb-dong"><span className="n">{n}</span><span className="g">{g}</span></div> : null
              return (
                <>
                  <div className="m-pb-nhom">THÔNG TIN CHUNG</div>
                  <div className="m-pb-the m-pb-the-gon m-t655-gon">
                    <div className="m-pb-dong">
                      <span className="n">Khách hàng</span>
                      <span className="g bold">{String(row.doiTuong || '')}</span>
                    </div>
                    {/* Gọn như phiếu mua: bỏ Địa chỉ, Mã số thuế, Người giao dịch; Thanh toán đã ở thẻ đầu (T841) */}
                    {dongTt('Kho nhập', kho)}
                    {dongTt('Kênh bán hàng', String(row.kenh ?? ''))}   {/* như màn xem Bán hàng (T855) */}
                    {dongTt('Ngày chứng từ', String(row.ngay ?? '').split(' ')[0])}
                    {httt !== 'congno' && dongTt('Quỹ', String(row._quy ?? ''))}
                    {/* Bỏ Phương thức (T841): form lập cũng đã ẩn ô này (T842) */}
                    {httt === 'congno' && dongTt('Hạn thanh toán', hanTt)}
                    {dongTt('Ghi chú', String(row._ghiChu ?? row.dienGiai ?? ''))}
                    {dsTc.length > 0 && (
                      <div className="m-pb-dong">
                        <span className="n">Tham chiếu</span>
                        <span className="g link" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end' }}>
                          {dsTc.map(tc => <Link key={tc.so} to={tc.url} style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>{tc.so}</Link>)}
                        </span>
                      </div>
                    )}
                  </div>
                  {coHd && (
                    <>
                      <div className="m-pb-nhom">HOÁ ĐƠN</div>
                      <div className="m-pb-the m-pb-the-gon">
                        {dongTt('Số hoá đơn', soHd)}
                        {dongTt('Ký hiệu', kyHieuHd)}
                        {dongTt('Ngày hoá đơn', ngayHd)}
                      </div>
                    </>
                  )}
                  {/* Mặt hàng và khối Tổng cộng cuối phiếu như xem phiếu mua (T884) */}
                  {renderDsHangHoaMua()}
                </>
              )
            })() : (
              <>
                <div className="m-pb-nhom">THÔNG TIN CHỨNG TỪ</div>
                <div className="m-pb-the m-pb-the-gon">
                  <div className="m-pb-dong">
                    <span className="n">Ngày chứng từ</span>
                    <span className="g">{String(row.ngay ?? '').split(' ')[0]}</span>
                  </div>
                  {row.doiTuong && (
                    <div className="m-pb-dong">
                      <span className="n">Đối tượng</span>
                      <span className="g">{String(row.doiTuong)}</span>
                    </div>
                  )}
                  {kho && (
                    <div className="m-pb-dong">
                      <span className="n">Kho</span>
                      <span className="g">{kho}</span>
                    </div>
                  )}
                  {/* Phiếu điều chỉnh: tham chiếu về phiếu kiểm kê gốc (T603) */}
                  {laDc && row._thamChieu && (
                    <div className="m-pb-dong">
                      <span className="n">Tham chiếu</span>
                      <Link to={String(row._thamChieuDi)} className="g link" style={{ color: 'var(--blue)', textDecoration: 'none' }}>
                        {String(row._thamChieu)}
                      </Link>
                    </div>
                  )}
                  {(row.dienGiai || row._ghiChu) && (
                    // Phiếu điều chỉnh: Ghi chú xuống dòng riêng, cách xa dòng trên (T603)
                    <div className={`m-pb-dong${laDc ? ' m-t603-ghi-chu' : ''}`}>
                      <span className="n">{laDc ? 'Ghi chú' : 'Diễn giải'}</span>
                      <span className="g">{String(row.dienGiai || row._ghiChu)}</span>
                    </div>
                  )}
                </div>
                <div className="m-pb-nhom">DANH SÁCH CHI TIẾT ({dsDong.length})</div>
                {dsDong.map((d, idx) => (
                  <div key={idx} className={`m-pb-the m-pb-muc-dong${laDc ? ' m-t603-dc' : ''}`}>
                    <div className="m-pb-muc-hang1">
                      <span className="m-pb-muc-ten">{d.ten || 'Mặt hàng'}</span>
                      {/* Phiếu điều chỉnh chỉ có số lượng, không đơn giá, số tiền (T603) */}
                      <b className="m-pb-muc-tong">{laDc ? `${soLuong(d.sl ?? 0)} ${d.dvt || ''}`.trim() : `${money(d.tien || 0)} đ`}</b>
                    </div>
                    {!laDc && (
                      <div className="m-pb-muc-hang2">
                        <span>{d.sl ?? 0} {d.dvt || ''} × {money(d.gia ?? 0)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </>
        )}



        {/* Tab Bút toán / Hạch toán */}
        {tab === 'buttoan' && (
          nhomMb === 'mua' ? (
            <div style={{ padding: '0 4px' }}>
              <div className="m-t600-nhom-tieu" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>BÚT TOÁN</span>
                <span style={{ color: 'var(--muted)', fontWeight: 'normal', textTransform: 'none', fontSize: 13 }}>
                  {capButToan.length} cặp · tự sinh khi lưu
                </span>
              </div>
              {capButToan.length === 0 ? (
                <div className="m-card" style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', background: '#fff', borderRadius: 10, marginTop: 8 }}>
                  Không có bút toán hạch toán
                </div>
              ) : (
                capButToan.map((cap, i) => (
                  <div key={i} className="m-t600-bt-the">
                    <div className="m-t600-bt-hang-dau">
                      <span>{cap.dg}</span>
                      <b className="num">{money(cap.tien)}</b>
                    </div>
                    <div className="m-t600-bt-dong-tk">
                      <span className="m-t600-chip-no">Nợ</span>
                      <b>{cap.no.so}</b>
                      <span className="m-t600-ten-tk">{cap.no.ten}</span>
                    </div>
                    <div className="m-t600-bt-dong-tk">
                      <span className="m-t600-chip-co">Có</span>
                      <b>{cap.co.so}</b>
                      <span className="m-t600-ten-tk">{cap.co.ten}</span>
                    </div>
                  </div>
                ))
              )}
              {capButToan.length > 0 && (
                <div className="m-t600-tong-but-toan">
                  <span>Tổng Nợ = Tổng Có</span>
                  <b className="num">{money(tongNoCo)} đ</b>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="m-pb-nhom">HẠCH TOÁN</div>
              <div className="m-pb-the m-pb-the-gon">
                {dsButToan.length === 0 ? (
                  <div className="m-pb-dong" style={{ justifyContent: 'center', color: 'var(--muted)' }}>
                    Không có bút toán hạch toán
                  </div>
                ) : (
                  dsButToan.map((bt, idx) => (
                    <div key={idx} className="m-ht-dong">
                      <span className="m-ht-tk">
                        {bt.kieu === 'no' ? 'Nợ' : 'Có'} {bt.so} <i className="m-ht-ten">{bt.ten}</i>
                      </span>
                      <span className="m-ht-so">{money(bt.tien)} đ</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )
        )}

        {/* Tab Thanh toán */}
        {tab === 'thanhtoan' && (
          <>
            <div className="m-pb-nhom">LẦN THANH TOÁN</div>
            {dsTt.length === 0 ? (
              <div className="m-pb-the m-pb-the-gon">
                <div className="m-pb-dong" style={{ justifyContent: 'center', color: 'var(--muted)', minHeight: 60 }}>
                  Chưa có phiếu thanh toán nào
                </div>
              </div>
            ) : (
              dsTt.map(c => (
                <div key={c.id} className="m-pb-the m-pb-muc-dong">
                  <div className="m-pb-muc-hang1">
                    <span className="m-pb-muc-ten">
                      <Link to={`/app/tien/2-1-1/${c.id}`} style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>
                        {c.so} ›
                      </Link>
                    </span>
                    <b className="m-pb-muc-tong">{money(c.tien)} đ</b>
                  </div>
                  <div className="m-pb-muc-hang2">
                    <span>{(c as { ngay?: string }).ngay || row.ngay} · {(c as { quy?: string }).quy || 'Quỹ tiền mặt'}</span>
                    <span>{conLai === 0 ? 'Trả hết' : 'Trả một phần'}</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* Tab Lịch sử */}
        {tab === 'lichsu' && (
          <MLichSu goi={s.goi} man={`${mod.key}/${sc.slug}`} id={String(row.id)} />
        )}
      </div>

      {/* ── CHÂN GHIM ĐÁY (A7); phiếu điều chỉnh không có thao tác nên không có chân (T660) ── */}
      {!laDc && !laXdl && (
      <div className="m-pb-day">
        <div className="m-pb-day-nut">
          {!laKk && !khoChuanXem && !laCtth && dsMenu.length > 0 && (
            <button
              type="button"
              className="m-pb-btn-more"
              onClick={() => setMoMenu(true)}
              aria-label="Thao tác khác"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>
          )}

          {/* Phiếu kiểm kê: bỏ nút ba chấm, Xoá, Sao chép, Sửa ngay thanh dưới; đã sinh phiếu điều chỉnh thì không sửa (T657, T660) */}
          {laKk && (
            <button type="button" className="m-pb-btn-phu m-t660-nut m-t660-xoa" onClick={() => handleMenuChon('xoa')}>
              Xoá
            </button>
          )}
          {laKk && (
            <button type="button" className="m-pb-btn-phu m-t660-nut" onClick={() => handleMenuChon('copy')}>
              Sao chép
            </button>
          )}
          {laKk && !khoaKk && (
            <button type="button" className={nutChinh ? 'm-pb-btn-phu m-t660-nut' : 'm-pb-btn-sua'} onClick={moSua}>
              Sửa
            </button>
          )}

          {/* Phiếu kho, CTTH: chân 2 nút Sửa phiếu (chính) + Xoá (phụ đỏ) (T930) */}
          {(khoChuanXem || laCtth) && !laXdl && (
            <>
              <button
                type="button"
                className="m-pb-btn-phu m-t660-nut m-t660-xoa"
                onClick={() => handleMenuChon('xoa')}
              >
                Xoá
              </button>
              {coTheSua && (
                <button
                  type="button"
                  className="m-pb-btn-sua m-t660-nut"
                  onClick={moSua}
                >
                  <span>Sửa phiếu</span>
                </button>
              )}
            </>
          )}

          {!khoChuanXem && !laCtth && nutPhu && (
            <button type="button" className="m-pb-btn-phu" onClick={nutPhu.action}>
              {nhomMb === 'mua' && nutPhu.nhan === 'Sửa phiếu' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              )}
              {nutPhu.nhan}
            </button>
          )}

          {!khoChuanXem && !laCtth && nutChinh && (
            <button
              type="button"
              className={`m-pb-btn-sua${nutChinh.laThanhToan ? ' tt-nut' : ''}`}
              onClick={nutChinh.action}
            >
              {nhomMb === 'mua' && nutChinh.nhan === 'Sửa phiếu' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              )}
              {nutChinh.laThanhToan && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="6" width="20" height="13" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              )}
              <span>{nutChinh.nhan}</span>
            </button>
          )}
        </div>
      </div>
      )}

      {/* Tấm trượt menu ba chấm */}
      <MChon
        mo={moMenu}
        onDong={() => setMoMenu(false)}
        tieuDe="Thao tác chứng từ"
        ds={dsMenu}
        onChon={handleMenuChon}
      />

      {/* Hộp xác nhận bỏ ghi sổ */}
      {hoiBoGhi && (
        <ThongBao
          loai="canhBao"
          nhan="Bỏ ghi sổ"
          tieuDe={`Bỏ ghi sổ ${soCt}?`}
          moTa={`Bút toán của phiếu bị huỷ. Báo cáo tháng ${String(row.ngay ?? '').split(' ')[0].slice(3)} không tính phiếu này tới khi ghi sổ lại.`}
          nut={{
            ten: 'Bỏ ghi sổ',
            onClick: () => {
              setHoiBoGhi(false)
              toast('Đã bỏ ghi sổ')
            },
          }}
          onDong={() => setHoiBoGhi(false)}
        />
      )}

      {/* Phiếu chi còn thẻ chi phí phân bổ: không sửa, mở thẻ để xoá; xoá thẻ xong về phiếu ở chế độ sửa (T475, theo T439) */}
      {hoiKhongSua && (() => {
        const kk = khoaSoDenCua(row.cn)
        const moThe = () => { setHoiKhongSua(false); nav(`/app/ccdc/8-1-1?mo=${theCuaPhieu(row)[0]}`, { state: { veGoc: `${path}/${row.id}` } }) }
        return (
          <ThongBao
            loai="chan"
            tieuDe="Phiếu đã sinh thẻ chi phí phân bổ"
            moTa="Số tiền trên phiếu đang được chia dần vào chi phí các tháng. Sửa phiếu thì lịch phân bổ sai theo."
            duKien={[
              { nhan: 'Phiếu đang mở', gt: soCt },
              { nhan: 'Thẻ phân bổ', gt: theCuaPhieu(row).join(', '), di: moThe },
              { nhan: 'Đã khoá sổ đến', gt: `Tháng ${String(kk.thang).padStart(2, '0')}/${kk.nam}` },
            ]}
            buoc={[
              `Mở thẻ ${theCuaPhieu(row)[0]}, bấm Xoá. Thẻ chỉ xoá được khi tháng bắt đầu phân bổ chưa khoá sổ.`,
              'Quay lại phiếu, sửa rồi lưu. Phần mềm hỏi tạo lại thẻ.',
            ]}
            nut={{ ten: `Mở thẻ ${theCuaPhieu(row)[0]}`, onClick: moThe }}
            onDong={() => setHoiKhongSua(false)}
          />
        )
      })()}

      {/* Phiếu mua đã thanh toán: không sửa, mở phiếu chi để xoá trước (T658) */}
      {hoiKhongSuaTt && (() => {
        const moChi = (id: string) => { setHoiKhongSuaTt(false); nav(`/app/tien/2-1-1/${id}`) }
        return (
          <ThongBao
            loai="chan"
            tieuDe="Phiếu mua đã có phiếu chi trả nợ"
            moTa="Phiếu đã trả tiền cho nhà cung cấp. Sửa số lượng, đơn giá lúc này sẽ lệch công nợ."
            duKien={[
              { nhan: 'Phiếu đang mở', gt: soCt },
              ...dsChiMua.map(c => ({ nhan: 'Bị khoá bởi', gt: c.so, di: () => moChi(c.id), chip: 'Đã chi' })),
              { nhan: 'Số tiền đã trả', gt: money(daTra) },
            ]}
            buoc={[
              dsChiMua.length ? `Mở phiếu chi ${dsChiMua.map(c => c.so).join(', ')}, bấm Xoá.` : 'Mở phiếu chi của phiếu này, bấm Xoá.',
              'Quay lại phiếu mua, sửa rồi lưu.',
              'Lập lại phiếu chi theo số tiền mới.',
            ]}
            nut={dsChiMua.length
              ? { ten: `Mở phiếu chi ${dsChiMua[0].so}`, onClick: () => moChi(dsChiMua[0].id) }
              : { ten: 'Đóng', onClick: () => setHoiKhongSuaTt(false) }}
            nutPhu={dsChiMua.length ? undefined : null}
            onDong={() => setHoiKhongSuaTt(false)}
          />
        )
      })()}

      {/* Hộp xác nhận xoá: liệt kê chứng từ xoá theo (thẻ chi phí, phiếu điều chỉnh của kiểm kê) */}
      {hoiXoa && (() => {
        const kem = [
          ...theCuaPhieu(row).map(so => ({ nhan: 'Thẻ chi phí phân bổ', gt: so })),
          ...(laKk ? dsDc.map(c => ({ nhan: 'Phiếu điều chỉnh', gt: c.so })) : []),
        ]
        return (
          <ThongBao
            loai="xoa"
            tieuDe={`Xoá phiếu ${soCt}?`}
            moTa={kem.length ? 'Xoá xong không lấy lại được. Các chứng từ dưới đây xoá theo:' : 'Xoá xong không lấy lại được.'}
            duKien={kem}
            nut={{ ten: kem.length ? `Xoá phiếu và ${kem.length} chứng từ kèm` : 'Xoá phiếu', onClick: thucHienXoa }}
            onDong={() => setHoiXoa(false)}
          />
        )
      })()}

      {hopChan}

      {/* ── SHEET LỊCH SỬ THANH TOÁN (A3) ── */}
      {moLichSuTt && (
        <div className="m-tam-overlay" onClick={() => setMoLichSuTt(false)}>
          <div className="m-tam-hop m-t600-sheet-85" onClick={e => e.stopPropagation()}>
            <div className="m-tam-dau">
              <h2 className="m-tam-tieu">Lịch sử thanh toán</h2>
              <button type="button" className="m-tam-dong-btn" onClick={() => setMoLichSuTt(false)}>
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="m-t600-sheet-than" style={{ padding: '8px 16px' }}>
              {dsTt.length === 0 ? (
                <div className="m-pb-the m-pb-the-gon" style={{ marginTop: 12 }}>
                  <div className="m-pb-dong" style={{ justifyContent: 'center', color: 'var(--muted)', minHeight: 60 }}>
                    Chưa có phiếu thanh toán nào
                  </div>
                </div>
              ) : (
                dsTt.map(c => (
                  <div key={c.id} className="m-pb-the m-pb-muc-dong">
                    <div className="m-pb-muc-hang1">
                      <span className="m-pb-muc-ten">
                        <Link to={`/app/tien/2-1-1/${c.id}`} style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>
                          {c.so} ›
                        </Link>
                      </span>
                      <b className="m-pb-muc-tong">{money(c.tien)} đ</b>
                    </div>
                    <div className="m-pb-muc-hang2">
                      <span>{(c as { ngay?: string }).ngay || row.ngay} · {(c as { quy?: string }).quy || 'Quỹ tiền mặt'}</span>
                      <span>{conLai === 0 ? 'Trả hết' : 'Trả một phần'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="m-t600-sheet-day">
              <button
                type="button"
                className="btn pri"
                style={{ width: '100%', height: 44, borderRadius: 8 }}
                onClick={() => setMoLichSuTt(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sheet thanh toán phiếu mua theo canvas T600 (T610) */}
      <MThanhToanNgay
        mo={moThanhToan}
        onDong={() => setMoThanhToan(false)}
        soPhieu={soCt}
        nccTen={String(row.doiTuong ?? 'Nhà cung cấp')}
        conNo={conLai}
        cuaHang={cuaHangTen}
        onLapPhieuChi={handleLapPhieuChi}
      />
    </div>
  )
}
