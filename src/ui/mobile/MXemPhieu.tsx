import { useEffect, useMemo, useState, type FC } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { kieuGhiSo, type Goi } from '../../app/plan'
import { money, soLuong } from '../format'
import { NGUON, TT_CT, dongCua, doanLyDoThuChi, ttNghiepVu, type Dong } from '../generic/gen'
import { boO, nhomCua, theoLoai } from '../generic/nhom'
import { useDongChungTu } from '../generic/VoucherScreen'
import { useDsPhieuDcn } from '../../modules/kho/BangDieuChuyen'
import { useDsPhieuSx } from '../../modules/kho/BangSanXuat'
import { SX, TT_SX } from '../../modules/kho/san-xuat'
import { DCN } from '../../modules/kho/dieu-chuyen'
import { MAN_DC } from '../../modules/kho/dieu-chinh'
import { CUA_HANG, KHOAN_MUC, TK_NGAN_HANG, daKhoaSo } from '../../data/mock'
import { ctTtCon, dsDcCon, dsTtCon, ghiNhatKy, soDaTra, soKeTiep, suaPhieu, themPhieu, ttThamChieu, xoaPhieu } from '../generic/daXoa'
import { LichSu, MAN_THU_CHI, TEN_CT_TT, TIEN_TO_CT_TT, lyDoKhongXoaTheCuaPhieu, theCuaPhieu, xoaTheCuaPhieu } from '../generic/ChungTuForm'
import { loaiXuLy } from '../generic/BangKiemKe'
import { HopXacNhan } from '../LocNangCao'
import { HopInChungTu, type PhieuIn } from '../bao-cao/InChungTu'
import { LichDon } from '../ChonNgay'
import { Icon } from '../Icon'
import { MChon } from './MChon'
import { MTrong } from './MTrong'
import { chieuTien } from './chieuTien'
import { tinhButToan } from './butToan'

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
  const rows = cfgMan.dieuChuyen ? rowsDcn : cfgMan.sanXuat ? rowsSx : rowsGoc

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
  const { s, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const cfgMan = sc.voucher ?? { prefix: 'CT', doiTuong: 'none', dienGiai: [tenMan(sc)], tien: [0, 0] }

  const [sp] = useSearchParams()
  const [tab, setTab] = useState<TabKey>('chitiet')
  const [moMenu, setMoMenu] = useState(false)
  const [moThanhToan, setMoThanhToan] = useState(() => sp.get('thanhtoan') === '1')
  const [timHangHoa, setTimHangHoa] = useState('')
  const [hoiXoa, setHoiXoa] = useState(false)
  const [hoiKhongSua, setHoiKhongSua] = useState(false)   // phiếu chi còn thẻ chi phí (T475)
  const [hoiBoGhi, setHoiBoGhi] = useState(false)
  const [phieuIn, setPhieuIn] = useState<PhieuIn[] | null>(null)
  const [phieuChiVuaLap, setPhieuChiVuaLap] = useState<{ so: string; id: string } | null>(null)

  const loai = cfgMan.loai?.find(x => x.k === row.loai) ?? cfgMan.loai?.[0]
  const cfg = theoLoai(cfgMan, loai?.k)
  const nhom = nhomCua(mod.key, cfg, loai?.k)
  const bo = boO(nhom, cfg)
  const chieu = chieuTien(mod.key, cfg, row)

  const laKk = Boolean(cfg.kiemKe)
  const laDc = Boolean(cfg.dieuChinh)
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
  const kieu = kieuGhiSo(s.cheDo)
  const ghi = kieuGhiSo(s.goi) !== 'khong' && s.goi !== 'F'

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
  const dsDong: Dong[] = useMemo(() => {
    return (row._dong as Dong[] | undefined) ?? dongCua(cfg, idSeed)
  }, [row, cfg, idSeed])

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
  const coHanTt = Boolean(bo.tt) && s.goi !== 'F' && s.goi !== 'S'
  const hanTt = (coHanTt && nhomMb) ? String(row._hanTt ?? nv?.hanTt ?? '') : ''

  // Kho
  const kho = String(
    row._kho ??
      row.kho ??
      (row._khoDs as string[] | undefined)?.[0] ??
      dsDong.find(d => d.kho)?.kho ??
      '',
  )

  // Tính tổng
  const tongTien = dsDong.reduce((a, d) => a + (Number(d.tien) || 0), 0)
  const tongCk = dsDong.reduce((a, d) => a + (Number(d.ck) || 0), 0)
  const tongThue = dsDong.reduce((a, d) => a + (Number(d.thue) || 0), 0)
  const tongThanhToan = laKk ? 0 : tongTien - tongCk + tongThue

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
    if (s.goi === 'F') return []
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

  // Lập thanh toán từ sheet
  function lapThanhToan(ht: 'tienmat' | 'chuyenkhoan', quyTt: string, ngay: string, tien: number, dg: string) {
    const loaiMoi = ht === 'tienmat' ? 'chi' : 'unc'
    const soMoi = soKeTiep(MAN_THU_CHI, `${TIEN_TO_CT_TT[loaiMoi]}2610-`)
    const idMoi = `moi-${Date.now()}-tt`
    const ly = 'Thanh toán tiền cho nhà cung cấp'
    themPhieu(MAN_THU_CHI, {
      id: idMoi,
      so: soMoi,
      cn: cuaHangTen,
      nguon: 'tay',
      tt: kieu === 'khong' ? 'ghi' : 'nhap',
      loai: loaiMoi,
      tenLoai: TEN_CT_TT[loaiMoi],
      ngay,
      thang: Number(ngay.split('/')[1]) || 10,
      doiTuong: String(row.doiTuong ?? ''),
      dienGiai: dg,
      tien,
      thue: 0,
      tong: tien,
      _quy: quyTt,
      _lyDo: ly,
      _ghiChu: dg,
      _thamChieu: soCt,
      _thamChieuDi: `${path}/${row.id}`,
      _dong: [{ ma: '', ten: dg, dvt: '', sl: 1, gia: tien, tien, ts: 0, thue: 0, ly, dt: String(row.doiTuong ?? ''), km: '', cv: '' }],
    }, s.ten)
    ghiNhatKy(MAN_THU_CHI, idMoi, soMoi, s.ten, `Thêm mới chứng từ, thanh toán cho ${soCt}`)
    const man = `${mod.key}/${sc.slug}`
    suaPhieu(man, String(row.id), { _dsTt: [...dsTt, { id: idMoi, so: soMoi, loai: loaiMoi, tien, ngay, quy: quyTt }] })
    ghiNhatKy(man, String(row.id), soCt, s.ten, `Thanh toán ngay ${money(tien)} bằng ${soMoi}`)

    setPhieuChiVuaLap({ so: soMoi, id: idMoi })
    setMoThanhToan(false)
    setTab('thanhtoan')
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

  const thucHienIn = () => {
    setPhieuIn([
      {
        sc,
        cfg,
        loai,
        row: {
          ...row,
          id: row.id,
          so: soCt,
          ngay: row.ngay,
          cn: row.cn,
          doiTuong: row.doiTuong,
          dienGiai: row.dienGiai,
          loai: loai?.k,
          tien: tongTien,
          thue: tongThue,
          tong: tongThanhToan,
        },
      },
    ])
  }

  // Danh sách các tab hiển thị theo từng phân hệ
  const dsTab = useMemo(() => {
    if (laTien) {
      if (s.goi === 'F') {
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
      const soBt = Math.round(dsButToan.length / 2)
      if (s.goi === 'F') {
        return [
          { k: 'chitiet' as TabKey, ten: 'Chi tiết' },
          { k: 'thanhtoan' as TabKey, ten: dsTt.length ? `Thanh toán (${dsTt.length})` : 'Thanh toán' },
          { k: 'lichsu' as TabKey, ten: 'Lịch sử' },
        ]
      }
      return [
        { k: 'chitiet' as TabKey, ten: 'Chi tiết' },
        { k: 'thanhtoan' as TabKey, ten: dsTt.length ? `Thanh toán (${dsTt.length})` : 'Thanh toán' },
        { k: 'buttoan' as TabKey, ten: `Hạch toán (${soBt})` },
        { k: 'lichsu' as TabKey, ten: 'Lịch sử' },
      ]
    }
    if (laKk) {
      return [
        { k: 'chitiet' as TabKey, ten: 'Chi tiết' },
        { k: 'lichsu' as TabKey, ten: 'Lịch sử' },
      ]
    }
    return [
      { k: 'chitiet' as TabKey, ten: 'Chi tiết' },
      { k: 'hanghoa' as TabKey, ten: `Chi tiết (${dsDong.length})` },
      { k: 'lichsu' as TabKey, ten: 'Lịch sử' },
    ]
  }, [laTien, nhomMb, laKk, s.goi, dsButToan.length, dsDong.length, dsTt.length])

  // Sửa phiếu: phiếu chi đã có thẻ chi phí phân bổ thì không sửa, báo xoá thẻ trước như bản máy tính (T475, theo T439)
  const moSua = () => { if (theCuaPhieu(row).length) setHoiKhongSua(true); else nav(`${path}/${row.id}?sua=1`) }

  // Nút hành động chính và phụ ở chân màn hình
  const coNutGhiSo = kieu !== 'khong' && s.goi !== 'F' && !laDc
  const coTheSua = !laDc && (s.goi === 'F' || !coNutGhiSo || row.tt !== 'ghi')
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
  } else if (s.goi === 'F') {
    nutChinh = {
      nhan: 'Sửa phiếu',
      action: moSua,
    }
  } else if (coNutGhiSo) {
    if (row.tt === 'ghi') {
      nutPhu = {
        nhan: 'Bỏ ghi sổ',
        action: () => setHoiBoGhi(true),
      }
      nutChinh = {
        nhan: 'In phiếu',
        action: thucHienIn,
      }
    } else {
      nutChinh = {
        nhan: 'Ghi sổ',
        action: () => toast('Đã ghi sổ'),
      }
    }
  } else if (!laDc) {
    nutChinh = {
      nhan: 'Sửa phiếu',
      action: moSua,
    }
  }

  // Menu ba chấm
  const dsMenu = [
    ...(!laDc && nhomMb !== 'mua' ? [{ k: 'sua', ten: 'Sửa chứng từ' }] : []),
    { k: 'in', ten: 'In chứng từ' },
    ...(!laDc ? [{ k: 'copy', ten: 'Sao chép chứng từ' }] : []),
    ...(!laDc ? [{ k: 'xoa', ten: 'Xoá chứng từ' }] : []),
  ]

  const handleMenuChon = (k: string) => {
    if (k === 'sua') {
      moSua()
    } else if (k === 'thanhtoan') {
      setMoThanhToan(true)
    } else if (k === 'in') {
      thucHienIn()
    } else if (k === 'copy') {
      toast('Đã sao chép chứng từ')
      nav(`${path}/moi${row.loai ? `?loai=${row.loai}` : ''}`, { state: { saoChep: row } })
    } else if (k === 'xoa') {
      if (daKhoaSo(String(row.ngay))) {
        toast(`${row.so} thuộc kỳ đã khoá sổ, không xoá được`)
      } else if (kieu !== 'khong' && row.tt !== 'nhap') {
        toast(`${row.so} đã ghi sổ, bỏ ghi sổ rồi mới xoá`)
      } else if (lyDoKhongXoaTheCuaPhieu(row)) {
        toast(lyDoKhongXoaTheCuaPhieu(row)!)   // thẻ chi phí của phiếu thuộc kỳ đã khoá sổ (T475, theo T439)
      } else if (ttThamChieu(row)) {
        toast(`${row.so} có phiếu ${ttThamChieu(row)!.so} tham chiếu, xoá ${ttThamChieu(row)!.so} trước`)
      } else if (((laSx && !sxNhap) || dcn === 'xdc') && row._phieuNhap) {
        toast(`${row.so} đã có phiếu nhập ${(row._phieuNhap as { so: string }).so}, xoá phiếu nhập trước`)
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
  if (nhomMb === 'mua') {
    if (daTra >= tongGoc && tongGoc > 0) {
      chipTt = { kieu: 'dang', ten: 'Đã thanh toán' }
    } else if (daTra > 0 && conLai > 0) {
      chipTt = { kieu: 'cho', ten: 'Thanh toán 1 phần' }
    } else {
      chipTt = { kieu: 'cho', ten: 'Chưa thanh toán' }
    }
  } else if (s.goi !== 'F') {
    if (row.tt === 'ghi') {
      chipTt = { kieu: 'dang', ten: 'Đã ghi sổ' }
    } else {
      chipTt = { kieu: 'cho', ten: 'Chưa ghi sổ' }
    }
  }

  const dsDongLocMua = useMemo(() => {
    if (!timHangHoa.trim()) return dsDong
    const q = timHangHoa.trim().toLowerCase()
    return dsDong.filter(d => (d.ten || '').toLowerCase().includes(q) || (d.ma || '').toLowerCase().includes(q))
  }, [dsDong, timHangHoa])

  const renderDsHangHoaMua = () => (
    <div>
      <div className="m-pb-nhom">DANH SÁCH HÀNG HOÁ</div>
      <div className="m-t449-tim">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <input
          type="text"
          aria-label="Tìm hàng hoá"
          placeholder="Nhập tên, mã hàng hoá"
          value={timHangHoa}
          onChange={e => setTimHangHoa(e.target.value)}
        />
      </div>

      <div className="m-t449-hang-ds">
        {dsDongLocMua.map((d, idx) => {
          const tongDong = (Number(d.tien) || 0) - (Number(d.ck) || 0) + (Number(d.thue) || 0)
          return (
            <div key={idx} className="m-t449-hang-the">
              <div className="m-t449-hang-dau">
                <div className="m-t449-hang-ten">
                  {idx + 1}. {d.ten || 'Mặt hàng'}
                  {d.ma ? <span className="m-t449-hang-ma">-{d.ma}</span> : null}
                </div>
              </div>
              <div className="m-t449-hang-than">
                <div className="m-t449-hang-dong">
                  <span className="lbl">Số lượng:</span>
                  <span className="val bold">{d.sl ?? 1} {d.dvt || 'Cái'}</span>
                </div>
                <div className="m-t449-hang-dong">
                  <span className="lbl">Đơn giá:</span>
                  <span className="val">{money(d.gia || 0)} đ</span>
                </div>
                <div className="m-t449-hang-dong">
                  <span className="lbl">Giảm giá ({d.ptCk ?? 0}%):</span>
                  <span className="val">{money(d.ck || 0)} đ</span>
                </div>
                <div className="m-t449-hang-dong">
                  <span className="lbl">VAT ({d.ts ?? 0}%):</span>
                  <span className="val">{money(d.thue || 0)} đ</span>
                </div>
                <div className="m-t449-hang-dong">
                  <span className="lbl">Tổng tiền:</span>
                  <span className="val bold">{money(tongDong)} đ</span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Thẻ tổng */}
        <div className="m-t449-the-tong">
          <div className="m-t449-tong-dong">
            <span>Thành tiền mặt hàng:</span>
            <span className="bold">{money(tongTien)} đ</span>
          </div>
          <div className="m-t449-gach" />
          <div className="m-t449-tong-dong">
            <span>Tổng tiền giảm giá:</span>
            <span className="bold">{money(tongCk)} đ</span>
          </div>
          <div className="m-t449-gach" />
          <div className="m-t449-tong-dong">
            <span>Tổng tiền thuế:</span>
            <span className="bold">{money(tongThue)} đ</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="m-pb-man">
      {/* ── THANH ĐẦU MÀN HÌNH ── */}
      <header className="m-pb-thanh-dau">
        <button type="button" className="m-pb-btn-back" onClick={quayLai} aria-label="Quay lại">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="m-pb-tieu-de">{soCt}</h2>
        <span className="m-pb-thanh-dau-phai" />
      </header>

      {/* ── NỘI DUNG CUỘN ── */}
      <div className="m-pb-noi-dung">
        {/* Thông báo vừa lập phiếu chi thanh toán */}
        {phieuChiVuaLap && (
          <div className="tt-toast">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12l5 5 9-10" />
            </svg>
            <span>
              Đã lập phiếu chi <b>{phieuChiVuaLap.so}</b>
            </span>
            <button
              type="button"
              className="tt-toast-xem"
              onClick={() => nav(`/app/tien/2-1-1/${phieuChiVuaLap.id}`)}
            >
              Xem
            </button>
          </div>
        )}

        {/* 1. THẺ TỔNG QUAN */}
        <div className="m-pb-the m-pb-the-tong-quan">
          <div className="m-pb-hang-chip">
            <span className="m-pb-chip-loai">{tenLoai}</span>
            {chipTt && <span className={`m-pb-chip-tt ${chipTt.kieu}`}>{chipTt.ten}</span>}
          </div>

          <div className="m-pb-ten-the">{tenChinhThe}</div>

          <div className="m-pb-dong-cn">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="1.8" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>{cuaHangTen}</span>
          </div>

          {/* Số tiền lớn */}
          {laTien ? (
            <div>
              <div className="m-pb-nhan-gt">{chieu === 'vao' ? 'Số tiền thu' : 'Số tiền chi'}</div>
              <div className={`m-pb-so-gt${chieu === 'ra' ? ' cam' : ''}`}>
                {money(tongTien || Number(row.tong) || 0)} đ
              </div>
            </div>
          ) : nhomMb === 'mua' ? (
            <div>
              <div className="m-pb-nhan-gt">Tổng thanh toán</div>
              <div className={`m-pb-so-gt${conLai > 0 ? ' cam' : ''}`}>{money(tongGoc)} đ</div>
            </div>
          ) : laKk ? (
            <div>
              <div className="m-pb-nhan-gt">Tổng kiểm kê</div>
              <div className="m-pb-so-gt">{dsDong.length} mặt hàng</div>
            </div>
          ) : (
            <div>
              <div className="m-pb-nhan-gt">Tổng thanh toán</div>
              <div className="m-pb-so-gt">{money(tongThanhToan)} đ</div>
            </div>
          )}

          {/* Ô thống kê quỹ thu/chi rộng hết hàng (T424) */}
          {laTien ? (
            <div className="m-pb-o-stat da">
              <div className="m-pb-o-stat-nhan">{chieu === 'vao' ? 'Quỹ thu tiền' : 'Quỹ chi tiền'}</div>
              <div className="m-pb-o-stat-so da">{triQuy}</div>
            </div>
          ) : nhomMb === 'mua' ? (
            <div className="m-t449-luoi-stat">
              <div className="m-t449-stat-da">
                <div className="m-t449-stat-nhan">Đã trả</div>
                <div className="m-t449-stat-so da">{money(daTra)} đ</div>
              </div>
              <div className="m-t449-stat-con">
                <div className="m-t449-stat-nhan">Còn phải trả</div>
                <div className="m-t449-stat-so con">{money(conLai)} đ</div>
              </div>
            </div>
          ) : laKk ? (
            <div className="m-pb-luoi-stat">
              <div className="m-pb-o-stat xanh">
                <div className="m-pb-o-stat-nhan">Thừa thực tế</div>
                <div className="m-pb-o-stat-so xanh">
                  +{hangThua.length} hàng{slThua > 0 ? ` (+${soLuong(slThua)} ${dvtChinhKho})` : ''}
                </div>
              </div>
              <div className="m-pb-o-stat do">
                <div className="m-pb-o-stat-nhan">Thiếu thực tế</div>
                <div className="m-pb-o-stat-so do">
                  -{hangThieu.length} hàng{slThieu > 0 ? ` (-${soLuong(slThieu)} ${dvtChinhKho})` : ''}
                </div>
              </div>
            </div>
          ) : (
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
                    <span className="n">Thời gian lập</span>
                    <span className="g">{[row.ngay, row.gio].filter(Boolean).join(' ')}</span>
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
                            Thẻ chi phí {so}
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
                {s.goi !== 'F' && dsButToan.length > 0 && (
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
                <div className="m-pb-nhom">THÔNG TIN HOÁ ĐƠN & MUA HÀNG</div>
                <div className="m-pb-the m-pb-the-gon">
                  <div className="m-pb-dong">
                    <span className="n">Thời gian lập</span>
                    <span className="g">{[row.ngay, row.gio].filter(Boolean).join(' ')}</span>
                  </div>
                  {soHd && (
                    <div className="m-pb-dong">
                      <span className="n">Số hoá đơn</span>
                      <span className="g">{soHd}{kyHieuHd ? ` (${kyHieuHd})` : ''}</span>
                    </div>
                  )}
                  {ngayHd && (
                    <div className="m-pb-dong">
                      <span className="n">Ngày hoá đơn</span>
                      <span className="g">{ngayHd}</span>
                    </div>
                  )}
                  <div className="m-pb-dong">
                    <span className="n">Kho nhận hàng</span>
                    <span className="g">{kho || 'Kho trung tâm'}</span>
                  </div>
                  {mst && (
                    <div className="m-pb-dong">
                      <span className="n">Mã số thuế</span>
                      <span className="g">{mst}</span>
                    </div>
                  )}
                  {hanTt && (
                    <div className="m-pb-dong">
                      <span className="n">Hạn thanh toán</span>
                      <span className="g cam">
                        {hanTt}{tinhSoNgayCon(hanTt) ? ` · ${tinhSoNgayCon(hanTt)}` : ''}
                      </span>
                    </div>
                  )}
                  {(row.dienGiai || row._ghiChu) && (
                    <div className="m-pb-dong">
                      <span className="n">Diễn giải</span>
                      <span className="g">{String(row.dienGiai || row._ghiChu)}</span>
                    </div>
                  )}
                  <div className="m-pb-dong">
                    <span className="n">Nguồn chứng từ</span>
                    <span className="g">{NGUON[row.nguon]?.[1] ?? 'Thủ công'}</span>
                  </div>
                </div>

                {renderDsHangHoaMua()}
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
                      <span className="n">Xử lý chênh lệch</span>
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
            ) : (
              <>
                <div className="m-pb-nhom">THÔNG TIN CHỨNG TỪ</div>
                <div className="m-pb-the m-pb-the-gon">
                  <div className="m-pb-dong">
                    <span className="n">Thời gian</span>
                    <span className="g">{[row.ngay, row.gio].filter(Boolean).join(' ')}</span>
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
                  {(row.dienGiai || row._ghiChu) && (
                    <div className="m-pb-dong">
                      <span className="n">Diễn giải</span>
                      <span className="g">{String(row.dienGiai || row._ghiChu)}</span>
                    </div>
                  )}
                </div>
                <div className="m-pb-nhom">DANH SÁCH CHI TIẾT ({dsDong.length})</div>
                {dsDong.map((d, idx) => (
                  <div key={idx} className="m-pb-the m-pb-muc-dong">
                    <div className="m-pb-muc-hang1">
                      <span className="m-pb-muc-ten">{d.ten || 'Mặt hàng'}</span>
                      <b className="m-pb-muc-tong">{money(d.tien || 0)} đ</b>
                    </div>
                    <div className="m-pb-muc-hang2">
                      <span>{d.sl ?? 0} {d.dvt || ''} × {money(d.gia ?? 0)}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* Tab Mặt hàng / Hàng hoá */}
        {tab === 'hanghoa' && (
          <>
            <div className="m-pb-nhom">
              {laKk ? `CHI TIẾT MẶT HÀNG (${dsDong.length})` : `DANH SÁCH MẶT HÀNG (${dsDong.length})`}
            </div>
            {laKk ? (
              dsDong.map((d, idx) => {
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
              })
            ) : nhomMb === 'mua' ? (
              renderDsHangHoaMua()
            ) : (
              <>
                {dsDong.map((d, idx) => {
                  const thueTxt = d.ts !== undefined ? ` · Thuế ${d.ts}%` : d.thue ? ` · VAT ${money(d.thue)} đ` : ''
                  const giamTxt = d.ck ? `Giảm ${money(d.ck)} đ` : (d.thue && d.ts ? `VAT ${money(d.thue)} đ` : 'Giảm 0 đ')
                  return (
                    <div key={idx} className="m-pb-the m-pb-muc-dong">
                      <div className="m-pb-muc-hang1">
                        <span className="m-pb-muc-ten">{d.ten || 'Mặt hàng'}</span>
                        <b className="m-pb-muc-tong">{money(d.tien || 0)} đ</b>
                      </div>
                      <div className="m-pb-muc-hang2">
                        <span>{d.sl ?? 0} {d.dvt || ''} × {money(d.gia ?? 0)}{thueTxt}</span>
                        <span>{giamTxt}</span>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </>
        )}

        {/* Tab Bút toán / Hạch toán */}
        {tab === 'buttoan' && (
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
          <>
            <div className="m-pb-nhom">NHẬT KÝ THAO TÁC</div>
            <div className="m-pb-the m-pb-the-gon" style={{ padding: '8px 14px' }}>
              <LichSu goi={s.goi} moi={false} man={`${mod.key}/${sc.slug}`} id={String(row.id)} />
            </div>
          </>
        )}
      </div>

      {/* ── CHÂN GHIM ĐÁY ── */}
      <div className="m-pb-day">
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

        {nutPhu && (
          <button type="button" className="m-pb-btn-phu" onClick={nutPhu.action}>
            {nutPhu.nhan}
          </button>
        )}

        {nutChinh && (
          <button
            type="button"
            className={`m-pb-btn-sua${nutChinh.laThanhToan ? ' tt-nut' : ''}`}
            onClick={nutChinh.action}
          >
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
        <HopXacNhan
          tieuDe={`Bỏ ghi sổ ${soCt}?`}
          nut="Bỏ ghi sổ"
          onDong={() => setHoiBoGhi(false)}
          onDongY={() => {
            setHoiBoGhi(false)
            toast('Đã bỏ ghi sổ')
          }}
        >
          Bỏ ghi sổ sẽ huỷ các bút toán và cập nhật lại số dư sổ sách liên quan.
        </HopXacNhan>
      )}

      {/* Phiếu chi còn thẻ chi phí phân bổ: không sửa, mở thẻ để xoá; xoá thẻ xong về phiếu ở chế độ sửa (T475, theo T439) */}
      {hoiKhongSua && (
        <HopXacNhan tieuDe={`Không sửa được ${soCt}`} nut="Mở thẻ" nutHuy="Đóng" nutDo={false}
          onDong={() => setHoiKhongSua(false)}
          onDongY={() => { setHoiKhongSua(false); nav(`/app/ccdc/8-1-1?mo=${theCuaPhieu(row)[0]}`, { state: { veGoc: `${path}/${row.id}` } }) }}>
          Phiếu đã có thẻ chi phí phân bổ {theCuaPhieu(row).join(', ')}. Xoá thẻ trước rồi mới sửa được phiếu. Thẻ chỉ xoá được khi kỳ khoá sổ còn trước tháng bắt đầu phân bổ của thẻ.
        </HopXacNhan>
      )}

      {/* Hộp xác nhận xoá */}
      {hoiXoa && (
        <HopXacNhan
          tieuDe={`Xoá ${soCt}?`}
          nut="Xoá phiếu"
          onDong={() => setHoiXoa(false)}
          onDongY={thucHienXoa}
        >
          Phiếu đã xoá không lấy lại được.
          {laKk && dsDc.length > 0 && <> Phiếu điều chỉnh {dsDc.map(c => c.so).join(', ')} cũng bị xoá theo.</>}
        </HopXacNhan>
      )}

      {/* Hộp in chứng từ */}
      {phieuIn && <HopInChungTu ds={phieuIn} onDong={() => setPhieuIn(null)} />}

      {/* Sheet thanh toán phiếu mua */}
      <MThanhToanSheet
        mo={moThanhToan}
        onDong={() => setMoThanhToan(false)}
        soCt={soCt}
        nccTen={String(row.doiTuong ?? 'Nhà cung cấp')}
        conLai={conLai}
        cuaHangTen={cuaHangTen}
        goi={s.goi}
        onLuu={lapThanhToan}
      />
    </div>
  )
}

/** Bottom sheet thanh toán phiếu mua hàng theo phương án D (T449) */
function MThanhToanSheet({
  mo,
  onDong,
  soCt,
  nccTen,
  conLai,
  cuaHangTen,
  onLuu,
}: {
  mo: boolean
  onDong: () => void
  soCt: string
  nccTen: string
  conLai: number
  cuaHangTen: string
  goi: Goi
  onLuu: (ht: 'tienmat' | 'chuyenkhoan', quy: string, ngay: string, tien: number, dg: string) => void
}) {
  const [soTien, setSoTien] = useState(conLai)
  const [focusTien, setFocusTien] = useState(false)
  const [strTien, setStrTien] = useState(money(conLai))
  const [hinhThuc, setHinhThuc] = useState<'tienmat' | 'chuyenkhoan'>('tienmat')
  const [ngayChi, setNgayChi] = useState('18/10/2026')
  const [moLich, setMoLich] = useState(false)
  const [dienGiai, setDienGiai] = useState(`Chi tiền mua hàng theo ${soCt}`)

  // Danh sách quỹ với số dư theo mock
  const cuaHangNgan = CUA_HANG.find(c => c.ten === cuaHangTen)?.ngan ?? 'Lê Lợi'
  const dsQuy = useMemo(() => [
    { ma: 'TM01', ten: `Quỹ tiền mặt ${cuaHangNgan}`, loai: 'tm' as const, soDu: 25_140_000, ht: 'tienmat' as const },
    { ma: 'TM02', ten: `Quỹ tiền mặt ${cuaHangNgan === 'Nguyễn Trãi' ? 'Lê Lợi' : 'Nguyễn Trãi'}`, loai: 'tm' as const, soDu: 18_393_500, ht: 'tienmat' as const },
    { ma: 'NH01', ten: 'Techcombank 1903 4455 6677 88', loai: 'nh' as const, soDu: 319_850_000, ht: 'chuyenkhoan' as const },
    { ma: 'NH02', ten: 'VPBank, chi nhánh Quận 1', loai: 'nh' as const, soDu: 3_320_000, ht: 'chuyenkhoan' as const },
    { ma: 'NH03', ten: 'Vietcombank 0071 0012 3456', loai: 'nh' as const, soDu: 85_200_000, ht: 'chuyenkhoan' as const },
  ], [cuaHangNgan])

  const [quyChon, setQuyChon] = useState(dsQuy[0].ma)

  useEffect(() => {
    if (mo) {
      setSoTien(conLai)
      setStrTien(money(conLai))
      setHinhThuc('tienmat')
      setNgayChi('18/10/2026')
      setDienGiai(`Chi tiền mua hàng theo ${soCt}`)
      setQuyChon(dsQuy[0].ma)
    }
  }, [mo, conLai, soCt, dsQuy])

  if (!mo) return null

  const dsLocTheoHt = dsQuy.filter(q => q.ht === hinhThuc)
  const qHienTai = dsQuy.find(q => q.ma === quyChon) ?? dsLocTheoHt[0] ?? dsQuy[0]

  const doiHinhThuc = (ht: 'tienmat' | 'chuyenkhoan') => {
    setHinhThuc(ht)
    const quyDau = dsQuy.find(q => q.ht === ht)
    if (quyDau) setQuyChon(quyDau.ma)
  }

  const handleLuu = () => {
    if (soTien <= 0 || soTien > conLai) return
    onLuu(qHienTai.ht, qHienTai.ten, ngayChi, soTien, dienGiai)
  }

  return (
    <div className="m-t449-sheet-nen">
      <div className="m-t449-sheet-mo" onClick={onDong} />
      <div className="m-t449-sheet-hop" onClick={e => e.stopPropagation()}>
        <div className="m-t449-sheet-keo" />
        <div className="m-t449-sheet-dau">
          <div className="m-t449-sheet-tieu-de">Thanh toán cho nhà cung cấp</div>
          <div className="m-t449-sheet-phu">{soCt} · {nccTen}</div>
        </div>

        <div className="m-t449-sheet-than">
          {/* Ô số tiền chi trả lớn */}
          <div className="m-t449-tt-hop-lon">
            <div className="m-t449-tt-hop-dau">
              <span className="lbl">Số tiền chi trả</span>
              <span className="no">Còn nợ <b>{money(conLai)} đ</b></span>
            </div>
            <div className="m-t449-tt-hop-so">
              <input
                type="text"
                aria-label="Số tiền trả"
                value={focusTien ? strTien : money(soTien)}
                onFocus={() => {
                  setFocusTien(true)
                  setStrTien(String(soTien))
                }}
                onChange={e => {
                  const val = Number(e.target.value.replace(/\D/g, '')) || 0
                  setStrTien(String(val))
                  setSoTien(val)
                }}
                onBlur={() => setFocusTien(false)}
              />
              <span className="dv">đ</span>
            </div>
          </div>

          {/* Hình thức thanh toán */}
          <div>
            <div className="m-t449-tt-nhom">HÌNH THỨC THANH TOÁN</div>
            <div className="m-t449-tt-luoi-ht">
              <button
                type="button"
                className={`m-t449-tt-btn-ht${hinhThuc === 'tienmat' ? ' on' : ''}`}
                onClick={() => doiHinhThuc('tienmat')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
                <span>Tiền mặt</span>
              </button>
              <button
                type="button"
                className={`m-t449-tt-btn-ht${hinhThuc === 'chuyenkhoan' ? ' on' : ''}`}
                onClick={() => doiHinhThuc('chuyenkhoan')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 10l9-6 9 6M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18" />
                </svg>
                <span>Chuyển khoản</span>
              </button>
            </div>
          </div>

          {/* Chọn quỹ */}
          <div>
            <div className="m-t449-tt-nhom">TRẢ TỪ QUỸ</div>
            <div className="m-t449-tt-ds-quy">
              {dsLocTheoHt.map(q => {
                const laChon = q.ma === quyChon
                const conLaiQuy = q.soDu - soTien
                return (
                  <div
                    key={q.ma}
                    className={`m-t449-tt-the-quy${laChon ? ' on' : ''}`}
                    onClick={() => setQuyChon(q.ma)}
                  >
                    <div>
                      <div className="ten">{q.ten}</div>
                      <div className="phu">
                        {laChon ? `Số dư ${money(q.soDu)} đ → còn ${money(conLaiQuy)} đ` : `Số dư ${money(q.soDu)} đ`}
                      </div>
                    </div>
                    <div className={`m-t449-tt-radio${laChon ? ' on' : ''}`} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ngày chi & Cửa hàng */}
          <div className="m-t449-tt-luoi-2">
            <div>
              <label className="m-t449-nhan-ncc">Ngày chi</label>
              <div className="m-t449-tt-o m-t449-cur-pointer" onClick={() => setMoLich(true)}>
                <span>{ngayChi}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                </svg>
              </div>
            </div>
            <div>
              <label className="m-t449-nhan-ncc">Cửa hàng</label>
              <div className="m-t449-tt-o xam">
                <span>{cuaHangTen || 'Phố Mây Lê Lợi'}</span>
              </div>
            </div>
          </div>

          {/* Diễn giải */}
          <div>
            <label className="m-t449-nhan-ncc">Diễn giải chi tiền</label>
            <input
              type="text"
              aria-label="Diễn giải chi tiền"
              className="m-t449-tt-inp-dg"
              value={dienGiai}
              onChange={e => setDienGiai(e.target.value)}
            />
          </div>
        </div>

        {/* Chân: Đóng / Lập phiếu chi */}
        <div className="m-t449-sheet-chan">
          <button type="button" className="m-t449-btn-huy" onClick={onDong}>
            Đóng
          </button>
          <button
            type="button"
            className="m-t449-btn-luu"
            disabled={soTien <= 0 || soTien > conLai}
            onClick={handleLuu}
          >
            Lập phiếu chi
          </button>
        </div>

        {moLich && (
          <LichDon
            value={ngayChi}
            onChange={v => {
              setNgayChi(v)
              setMoLich(false)
            }}
            onDong={() => setMoLich(false)}
          />
        )}
      </div>
    </div>
  )
}
