import { useMemo, useState, type FC, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { cuaHangHienTai, gtgtTyLe, useSession } from '../../app/session'
import { kieuGhiSoDv } from '../../app/plan'
import { CUA_HANG, DAILY, HANG, cnTen } from '../../data/mock'
import { docNgay, thangNay, trongKhoang, type KhoangNgay } from '../ChonNgay'
import { Icon } from '../Icon'
import { dmy, fold, money, moneyD, soLuong } from '../format'
import { MChon } from './MChon'
import { MChonKhoangNgay } from './MChonKhoangNgay'
import {
  PTTT,
  chiaTheo,
  dongCuaPhieu,
  donPosCua,
  giamThueHkd,
  ptttCua,
  soFabi,
  theoDon,
  POS_OK_MAU,
  POS_LOI_MAU,
  MON_POS,
  type XPos,
} from '../../modules/ban-hang/ChungTuBanHang'
import { useDaXoa } from '../generic/daXoa'
import { MDsChungTuChuan, MDsDongPhieu, HangTabsBanHang, layMaKh } from './MDsChungTuChuan'
import { quayLaiMobile } from './quayLai'
import { MBaoCaoTheoDoi } from './MBaoCaoTheoDoi'

type KhoaLoc = 'cn' | 'kh' | 'kenh' | 'pttt' | 'hang' | 'tonKho' | 'trangThai' | 'monBan' | 'nguyenNhan'
const LOC_TRONG: Record<KhoaLoc, string> = { cn: '', kh: '', kenh: '', pttt: '', hang: '', tonKho: '', trangThai: '', monBan: '', nguyenNhan: '' }

export const MXuatBanPos: FC<ScreenProps> = ({ sc, mod }) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const { ban, laDaXoa } = useDaXoa(`${mod.key}/${sc.slug}`)
  const tyLe = gtgtTyLe(s)   // GTGT theo % doanh thu: Giảm thuế GTGT thay VAT (T163, T450)
  const kieu = kieuGhiSoDv(s)
  const ghi = kieu !== 'khong'   // gói Standard, Plus hộ kinh doanh đồng bộ là xong, không ghi sổ (QD81)
  const cnChon = cuaHangHienTai(s)

  // Khoảng ngày lọc
  const [thoiGian, setThoiGian] = useState<KhoangNgay>(() => thangNay())
  // Ô lọc như danh sách Xuất bán POS trên web (T570); chuỗi rỗng là tất cả
  const [tim, setTim] = useState('')
  const [loc, setLoc] = useState<Record<KhoaLoc, string>>(LOC_TRONG)
  const [moLoc, setMoLoc] = useState(false)
  const [moChon, setMoChon] = useState<KhoaLoc | null>(null)
  const [moTheoDoi, setMoTheoDoi] = useState(false)
  // Tấm chi tiết đơn
  const [donDangXem, setDonDangXem] = useState<Row | null>(null)
  const [timHang, setTimHang] = useState('')   // ô tìm hàng hoá trong chi tiết đơn (T573)
  const [daChep, setDaChep] = useState(false)   // nút chép mã tra cứu vừa bấm (T651)

  // Danh sách chứng từ theo cách đồng bộ FABi
  const tatCa = useMemo(() => {
    return DAILY.filter(x => x.date.getMonth() >= 8)
      .slice()
      .reverse()
      .flatMap(x => theoDon(x).reverse())   // FABi kéo chi tiết theo hoá đơn (T247)
      .map((x, i) => ({
        id: String(i),
        so: soFabi(`fabi-${x.seed}`),
        ngay: `${dmy(x.date)} ${x.gio}`,
        thang: x.date.getMonth() + 1,
        cn: cnTen(x.cn),
        x,
        kenh: x.kenh,
        dienGiai:
          x.loai === 'don'
            ? `Hoá đơn FABi ${x.kenh.toLowerCase()} ${x.gio} ngày ${dmy(x.date).slice(0, 5)}`
            : `Doanh thu ${x.kenh.toLowerCase()} ${x.don} đơn POS ngày ${dmy(x.date).slice(0, 5)}`,
        doiTuong: 'Khách lẻ POS',
        tien: x.dt,
        thue: tyLe ? 0 : x.vat,
        giamThue: tyLe ? giamThueHkd(x.dt) : 0,
        tong: tyLe ? x.dt - giamThueHkd(x.dt) : x.dt + x.vat,
        nguon: 'FABi',
        tt: i < 3 ? 'nhap' : 'ghi',
        ngayTao: `${dmy(x.date)} 23:30`,
        nguoiTao: 'Hệ thống',
        mon: dongCuaPhieu(x).map(d => ({ ma: d.ma, ten: d.ten, tonKho: Boolean(d.tonKho) })),   // lọc theo hàng hoá, tồn kho, tìm theo tên món
      }))
  }, [tyLe])

  const rows = useMemo(() => tatCa.filter(r => !laDaXoa(r.id)), [tatCa, ban, laDaXoa])

  // Lọc theo khoảng ngày, ô tìm, các ô chọn; cửa hàng chọn trên thanh trên thì bỏ ô Cửa hàng
  const list = useMemo(() => {
    const q = fold(tim.trim())
    return rows.filter(r => {
      const d = r.x?.date instanceof Date ? r.x.date : docNgay(r.ngay)
      if (!trongKhoang(d, thoiGian)) return false
      if (cnChon && r.x?.cn !== cnChon.id) return false
      if (loc.cn && r.x?.cn !== loc.cn) return false
      if (loc.kh && r.doiTuong !== loc.kh) return false
      if (loc.kenh && r.kenh !== loc.kenh) return false
      if (loc.pttt && !ptttCua(r.x).includes(loc.pttt)) return false
      if (loc.hang && !r.mon.some(m => m.ma === loc.hang)) return false
      if (loc.tonKho && !r.mon.some(m => m.tonKho === (loc.tonKho === 'co'))) return false
      if (q && !fold(`${r.so} ${r.dienGiai} ${r.mon.map(m => m.ten).join(' ')}`).includes(q)) return false
      return true
    })
  }, [rows, thoiGian, cnChon, loc, tim])

  // Lựa chọn từng ô; khách hàng, kênh lấy từ chính các chứng từ như web (T116)
  const tuDs = (ds: string[]) => [...new Set(ds.filter(Boolean))].map(v => ({ k: v, ten: v }))

  const rowsPosOk = useMemo(() => {
    return POS_OK_MAU.map(([soCt, soHd, ngay, cn, maMon, sl, pttt], i) => {
      const infoMon = MON_POS[maMon] ?? [maMon, 'Cốc', 0]
      const dt = (infoMon[2] || 0) * sl
      const tong = Math.round(dt * 1.08)
      return {
        id: `pos_ok_${i + 1}`,
        soCt,
        soFabi: soHd,
        so: soHd,
        ngay,
        gio: ngay.split(' ')[1] || '',
        cn,
        maMon,
        tenMon: infoMon[0],
        dvt: infoMon[1],
        sl,
        pttt,
        dt,
        tong,
        tien: tong,
      }
    })
  }, [])

  const rowsPosLoi = useMemo(() => {
    const LY_MAP: Record<string, string> = {
      hang: 'Món chưa có trong danh mục',
      pttt: 'PTTT chưa map tài khoản',
      kho: 'Chưa chọn kho xuất',
      khoa: 'Kỳ đã khoá sổ',
    }
    return POS_LOI_MAU.map(([soHd, ngay, cn, maMon, sl, pttt, lyDo, chiTiet], i) => {
      const infoMon = MON_POS[maMon] ?? [maMon, 'Cốc', 0]
      const dt = (infoMon[2] || 0) * sl
      const tong = Math.round(dt * 1.08)
      const lyDoTieuDe = LY_MAP[lyDo] ?? 'Lỗi đồng bộ'
      return {
        id: `pos_loi_${i + 1}`,
        soFabi: soHd,
        so: soHd,
        ngay,
        gio: ngay.split(' ')[1] || '',
        cn,
        maMon,
        tenMon: infoMon[0],
        dvt: infoMon[1],
        sl,
        pttt,
        tong,
        tien: tong,
        lyDo,
        lyDoTieuDe,
        lyDoChiTiet: chiTiet,
      }
    })
  }, [])

  const dsMonBan = useMemo(() => {
    const set = new Set<string>()
    rowsPosOk.forEach(m => set.add(m.tenMon))
    rowsPosLoi.forEach(m => set.add(m.tenMon))
    return Array.from(set).map(ten => ({ k: ten, ten }))
  }, [rowsPosOk, rowsPosLoi])

  const dsNguyenNhan = useMemo(() => {
    const map = new Map<string, string>()
    rowsPosLoi.forEach(m => {
      if (!map.has(m.lyDoTieuDe)) map.set(m.lyDoTieuDe, m.lyDoTieuDe)
    })
    return Array.from(map.entries()).map(([k, ten]) => ({ k, ten }))
  }, [rowsPosLoi])

  const oLoc = useMemo(() => {
    const o: { k: KhoaLoc; nhan: string; tieuDe: string; tatCa: string; ds: { k: string; ten: string }[]; tim?: boolean }[] = [
      { k: 'trangThai', nhan: 'Trạng thái', tieuDe: 'Chọn trạng thái', tatCa: 'Tất cả trạng thái', ds: [{ k: 'da-db', ten: 'Đã đồng bộ' }, { k: 'chua-db', ten: 'Chưa đồng bộ' }] },
      { k: 'monBan', nhan: 'Món bán', tieuDe: 'Chọn món bán', tatCa: 'Tất cả món bán', ds: dsMonBan, tim: true },
      { k: 'kh', nhan: 'Khách hàng', tieuDe: 'Chọn khách hàng', tatCa: 'Tất cả khách hàng', ds: tuDs(rows.map(r => String(r.doiTuong ?? ''))) },
      { k: 'kenh', nhan: 'Kênh', tieuDe: 'Chọn kênh bán hàng', tatCa: 'Tất cả kênh', ds: tuDs(rows.map(r => String(r.kenh ?? ''))) },
      { k: 'pttt', nhan: 'Thanh toán', tieuDe: 'Chọn phương thức thanh toán', tatCa: 'Tất cả phương thức', ds: PTTT.map(([, t]) => ({ k: t, ten: t })) },
      { k: 'hang', nhan: 'Hàng hoá', tieuDe: 'Chọn hàng hoá', tatCa: 'Tất cả hàng hoá', ds: HANG.map(h => ({ k: h.ma, ten: `${h.ma} - ${h.ten}` })), tim: true },
      { k: 'tonKho', nhan: 'Tồn kho', tieuDe: 'Theo dõi tồn kho', tatCa: 'Tất cả', ds: [{ k: 'co', ten: 'Có theo dõi tồn kho' }, { k: 'khong', ten: 'Không theo dõi tồn kho' }] },
    ]
    if (loc.trangThai === 'chua-db') {
      o.splice(2, 0, { k: 'nguyenNhan', nhan: 'Nguyên nhân', tieuDe: 'Chọn nguyên nhân lỗi', tatCa: 'Tất cả nguyên nhân', ds: dsNguyenNhan })
    }
    if (!cnChon) o.unshift({ k: 'cn', nhan: 'Kho/CN', tieuDe: 'Chọn cửa hàng', tatCa: 'Tất cả cửa hàng', ds: CUA_HANG.map(c => ({ k: c.id, ten: c.ten })) })
    return o
  }, [rows, cnChon, dsMonBan, dsNguyenNhan, loc.trangThai])
  const oDangMo = oLoc.find(o => o.k === moChon)
  // Chip ghi ngắn: hàng hoá chỉ hiện mã
  const tenChip = (o: (typeof oLoc)[number]) => !loc[o.k] ? 'Tất cả' : o.k === 'hang' ? loc.hang : o.ds.find(d => d.k === loc[o.k])?.ten ?? 'Tất cả'
  const dangLoc = Boolean(tim.trim()) || Object.values(loc).some(Boolean)

  const pad = (n: number) => String(n).padStart(2, '0')
  const chuoiKhoangNgay = `${pad(thoiGian.tu.getDate())}/${pad(thoiGian.tu.getMonth() + 1)} – ${pad(thoiGian.den.getDate())}/${pad(thoiGian.den.getMonth() + 1)}/${thoiGian.den.getFullYear()}`
  const nhanCn = cnChon ? cnChon.ten : (loc.cn ? CUA_HANG.find(c => c.id === loc.cn)?.ten ?? 'Kho/CN: Tất cả' : 'Kho/CN: Tất cả')

  const chipsLoc = useMemo(() => {
    const arr: ReactNode[] = []
    arr.push(<span key="kn" className="m-chip-xem">{chuoiKhoangNgay}</span>)
    arr.push(<span key="cn" className="m-chip-xem">{cnChon ? nhanCn : `Kho/CN: ${loc.cn ? CUA_HANG.find(c => c.id === loc.cn)?.ten ?? 'Tất cả' : 'Tất cả'}`}</span>)
    if (loc.trangThai) arr.push(<span key="trangThai" className="m-chip-xem">Trạng thái: {loc.trangThai === 'da-db' ? 'Đã đồng bộ' : 'Chưa đồng bộ'}</span>)
    if (loc.monBan) arr.push(<span key="monBan" className="m-chip-xem">Món: {loc.monBan}</span>)
    if (loc.nguyenNhan) arr.push(<span key="nguyenNhan" className="m-chip-xem">Lỗi: {loc.nguyenNhan}</span>)
    if (loc.kh) arr.push(<span key="kh" className="m-chip-xem">Khách: {loc.kh}</span>)
    if (loc.kenh) arr.push(<span key="kenh" className="m-chip-xem">Kênh: {loc.kenh}</span>)
    if (loc.pttt) arr.push(<span key="pttt" className="m-chip-xem">Thanh toán: {loc.pttt}</span>)
    if (loc.hang) arr.push(<span key="hang" className="m-chip-xem">Hàng: {loc.hang}</span>)
    if (loc.tonKho) arr.push(<span key="tonKho" className="m-chip-xem">{loc.tonKho === 'co' ? 'Có tồn kho' : 'Không tồn kho'}</span>)
    return arr
  }, [chuoiKhoangNgay, cnChon, nhanCn, loc])

  // Mở đơn xem chi tiết
  const xemDon = (r: Row) => {
    setDonDangXem(r)
    setTimHang('')
  }

  // Dòng món của đơn đang xem
  const dsMon = useMemo(() => {
    if (!donDangXem?.x) return []
    const x = donDangXem.x as XPos
    const dong0 = dongCuaPhieu(x)
    if (!tyLe) return dong0
    const giam = chiaTheo(giamThueHkd(x.dt), dong0.map(d => d.dtTruocThue), 1)
    return dong0.map((d, i) => ({ ...d, giamThue: giam[i] }))
  }, [donDangXem, tyLe])

  // Thông tin bổ trợ cho đơn đang xem
  const tenKhoDon = useMemo(() => {
    if (!donDangXem) return ''
    return CUA_HANG.find(c => c.ten === donDangXem.cn)?.kho[0] ?? 'Kho mặc định'
  }, [donDangXem])

  const ptttTen = useMemo(() => {
    if (!donDangXem?.x) return ''
    const x = donDangXem.x
    const ds = PTTT.filter(([k]) => Number(x[k]) > 0).map(([, t]) => t)
    return ds.length ? ds.join(', ') : 'Tiền mặt'
  }, [donDangXem])

  // Các khoản của biên lai (T573): cộng theo dòng món như dải tổng web; thuế theo phương pháp GTGT
  const khoan = useMemo(() => {
    const cong = (k: 'sl' | 'thanh' | 'giam' | 'ck' | 'phiDv' | 'phiVc' | 'dtTruocThue' | 'thue') => dsMon.reduce((a, m) => a + (Number(m[k]) || 0), 0)
    return {
      sl: cong('sl'), tienHang: cong('thanh'), giam: cong('giam'), ck: cong('ck'), phiDv: cong('phiDv'), phiVc: cong('phiVc'),
      dtTruocThue: cong('dtTruocThue'), thue: cong('thue'), giamThue: Number(donDangXem?.giamThue || 0),
    }
  }, [dsMon, donDangXem])

  // Đơn hàng POS, khách lấy hoá đơn GTGT, hoá đơn điện tử: cùng nguồn với chi tiết web (T651)
  const dp = useMemo(() => (donDangXem?.x ? donPosCua(donDangXem.x as XPos) : null), [donDangXem])
  const chepMa = (ma: string) => {
    navigator.clipboard?.writeText(ma).then(() => toast('Đã chép mã tra cứu'), () => toast('Trình duyệt chặn sao chép, chọn mã rồi chép tay'))
    setDaChep(true)
    setTimeout(() => setDaChep(false), 1500)
  }

  const qHang = fold(timHang.trim())
  const dsMonLoc = qHang ? dsMon.filter(m => fold(`${m.ten} ${m.ma}`).includes(qHang)) : dsMon

  // T628: Tách mỗi phiếu thành các dòng hàng, mỗi thẻ là một dòng hàng
  const listDong = useMemo(() => {
    return list.flatMap(r => {
      const dsDong = r.x ? dongCuaPhieu(r.x as XPos) : []
      const dongLoc1 = loc.hang ? dsDong.filter(d => d.ma === loc.hang) : dsDong
      const dongLoc = loc.tonKho ? dongLoc1.filter(d => Boolean(d.tonKho) === (loc.tonKho === 'co')) : dongLoc1
      const maKh = layMaKh(r.doiTuong)
      return dongLoc.map((d, dIdx) => ({
        id: `${r.id}_${dIdx}`,
        phieu: r,
        so: r.so,
        ngay: r.ngay,
        tenHang: d.ten,
        maHang: d.ma,
        dvt: d.dvt,
        sl: d.sl,
        tien: d.tien ?? d.thanh ?? (d.sl * d.gia),
        tong: d.tien ?? d.thanh ?? (d.sl * d.gia),
        maKh,
        dienGiai: r.dienGiai,
        cn: r.cn,
        doiTuong: maKh,
        dongPhu: `${maKh} · ${r.so}`,   // ngày đã ở đầu thẻ ngày (T653)
        laDongMon: false,
      }))
    })
  }, [list, loc.hang, loc.tonKho])

  const listPosDaDb = useMemo(() => {
    if (loc.trangThai !== 'da-db') return []
    const q = fold(tim.trim())
    return rowsPosOk.filter(r => {
      const d = docNgay(r.ngay.split(' ')[0])
      if (!trongKhoang(d, thoiGian)) return false
      if (cnChon && r.cn !== cnChon.ten) return false
      if (loc.cn) {
        const cnTenChon = CUA_HANG.find(c => c.id === loc.cn)?.ten
        if (cnTenChon && r.cn !== cnTenChon) return false
      }
      if (loc.pttt && r.pttt !== loc.pttt) return false
      if (loc.monBan && r.tenMon !== loc.monBan) return false
      if (q && !fold(`${r.soFabi} ${r.soCt} ${r.tenMon} ${r.maMon} ${r.cn}`).includes(q)) return false
      return true
    }).map((r, i) => ({
      id: `pos_ok_${i}_${r.soFabi}_${r.maMon}`,
      so: r.soFabi,
      soFabi: r.soFabi,
      ngay: r.ngay,
      gio: r.gio,
      cn: r.cn,
      tenMon: r.tenMon,
      maMon: r.maMon,
      dvt: r.dvt,
      sl: r.sl,
      pttt: r.pttt,
      tien: r.tong,
      tong: r.tong,
      dienGiai: '',
      doiTuong: '',
      laDongMon: true,
      laLoi: false,
    }))
  }, [loc.trangThai, rowsPosOk, loc.cn, loc.pttt, loc.monBan, thoiGian, cnChon, tim])

  const listPosChuaDb = useMemo(() => {
    if (loc.trangThai !== 'chua-db') return []
    const q = fold(tim.trim())
    return rowsPosLoi.filter(r => {
      const d = docNgay(r.ngay.split(' ')[0])
      if (!trongKhoang(d, thoiGian)) return false
      if (cnChon && r.cn !== cnChon.ten) return false
      if (loc.cn) {
        const cnTenChon = CUA_HANG.find(c => c.id === loc.cn)?.ten
        if (cnTenChon && r.cn !== cnTenChon) return false
      }
      if (loc.pttt && r.pttt !== loc.pttt) return false
      if (loc.monBan && r.tenMon !== loc.monBan) return false
      if (loc.nguyenNhan && r.lyDoTieuDe !== loc.nguyenNhan) return false
      if (q && !fold(`${r.soFabi} ${r.tenMon} ${r.maMon} ${r.cn} ${r.lyDoTieuDe}`).includes(q)) return false
      return true
    }).map((r, i) => ({
      id: `pos_loi_${i}_${r.id}`,
      so: r.soFabi,
      soFabi: r.soFabi,
      ngay: r.ngay,
      gio: r.gio,
      cn: r.cn,
      tenMon: r.tenMon,
      maMon: r.maMon,
      dvt: r.dvt,
      sl: r.sl,
      pttt: r.pttt,
      tien: r.tong,
      tong: r.tong,
      lyDo: `${r.lyDoTieuDe} · ${r.lyDoChiTiet}`,
      dienGiai: '',
      doiTuong: '',
      laDongMon: true,
      laLoi: true,
    }))
  }, [loc.trangThai, rowsPosLoi, loc.cn, loc.pttt, loc.monBan, loc.nguyenNhan, thoiGian, cnChon, tim])

  const rowsHienThi = useMemo(() => {
    if (loc.trangThai === 'da-db') return listPosDaDb
    if (loc.trangThai === 'chua-db') return listPosChuaDb
    return listDong
  }, [loc.trangThai, listPosDaDb, listPosChuaDb, listDong])

  return (
    <>
      <MDsChungTuChuan
        tieuDe="Bán hàng"
        hangTabs={<HangTabsBanHang sc={sc} onMoTheoDoi={() => setMoTheoDoi(true)} />}
        onQuayLai={() => quayLaiMobile(nav, '/app/nghiep-vu')}
        tuKhoa={tim}
        onTuKhoaChange={setTim}
        timPlaceholder="Số, diễn giải, tên hàng..."
        onMoLoc={() => setMoLoc(true)}
        coLoc={dangLoc}
        chipsLoc={chipsLoc}
        chuoiKhoangNgay={chuoiKhoangNgay}
        hienTien={true}
        rows={rowsHienThi}
        renderDong={(r, i) => {
          if (r.laDongMon) {
            return (
              <MDsDongPhieu
                key={r.id ?? i}
                so={r.soFabi}
                tieuDe={<span>{r.tenMon} <span className="m-ma">{r.maMon}</span></span>}
                soLuong={r.sl}
                dvt={r.dvt}
                dongPhu={`${r.soFabi} · ${r.cn} · ${r.gio}`}
                tien={Number(r.tong ?? 0)}
                hienTien={true}
                lyDo={r.lyDo}
                onClick={() => {}}
              />
            )
          }
          return (
            <MDsDongPhieu
              key={r.id ?? i}
              so={r.so}
              tieuDe={r.tenHang}
              soLuong={r.sl}
              dvt={r.dvt}
              dongPhu={r.dongPhu}
              tien={Number(r.tien ?? 0)}
              hienTien={true}
              onClick={() => xemDon(r.phieu ?? r)}
            />
          )
        }}
        thongBaoTrong={loc.trangThai === 'chua-db' ? 'Không có dòng món lỗi chưa đồng bộ' : 'Không có đơn xuất bán POS'}
      />

      {/* Sheet bộ lọc nâng cao */}
      {moLoc && (
        <div className="m-loc-overlay" onClick={() => setMoLoc(false)}>
          <div className="m-loc-tam" onClick={e => e.stopPropagation()}>
            <div className="m-tam-keo" />
            <div className="m-loc-dau">
              <h2 className="m-loc-tieu-de">Bộ lọc</h2>
              <button type="button" className="m-loc-btn-dong" onClick={() => setMoLoc(false)} aria-label="Đóng">
                <Icon n="x" className="ic sm" />
              </button>
            </div>

            <div className="m-loc-than">
              {/* Dòng Thời gian (T571) */}
              <MChonKhoangNgay
                value={thoiGian}
                onChange={setThoiGian}
                nut={moLich => (
                  <div className="m-loc-dong" onClick={moLich}>
                    <div className="m-loc-dong-trai">
                      <span className="m-loc-dong-nhan">Thời gian</span>
                      <span className="m-loc-dong-tri">{dmy(thoiGian.tu)} - {dmy(thoiGian.den)}</span>
                    </div>
                    <Icon n="chevr" className="ic sm m-loc-dong-ic" />
                  </div>
                )}
              />

              {/* Các ô lọc từ T570 */}
              {oLoc.map(o => (
                <div
                  key={o.k}
                  className="m-loc-dong"
                  onClick={() => setMoChon(o.k)}
                >
                  <div className="m-loc-dong-trai">
                    <span className="m-loc-dong-nhan">{o.nhan}</span>
                    <span className="m-loc-dong-tri">{tenChip(o)}</span>
                  </div>
                  <Icon n="chevr" className="ic sm m-loc-dong-ic" />
                </div>
              ))}
            </div>

            <div className="m-loc-day">
              <button
                type="button"
                className="m-loc-btn-reset"
                onClick={() => {
                  setTim('')
                  setLoc(LOC_TRONG)
                  setThoiGian(thangNay())
                }}
              >
                Đặt lại
              </button>
              <button
                type="button"
                className="m-loc-btn-apply"
                onClick={() => setMoLoc(false)}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sheet chọn của ô lọc đang mở */}
      {oDangMo && (
        <MChon
          mo
          onDong={() => setMoChon(null)}
          tieuDe={oDangMo.tieuDe}
          ds={[{ k: '', ten: oDangMo.tatCa }, ...oDangMo.ds]}
          chon={loc[oDangMo.k]}
          onChon={v => setLoc(l => ({ ...l, [oDangMo.k]: v, ...(oDangMo.k === 'trangThai' && v !== 'chua-db' ? { nguyenNhan: '' } : {}) }))}
          tim={oDangMo.tim}
        />
      )}

      {/* Chi tiết đơn hàng (T425: theo khuôn thẻ phân bổ, thanh đầu sát mép trên full-width).
          T651 theo mẫu A Trum chốt: 3 thẻ Đơn hàng POS, Khách hàng, Hoá đơn như 3 nhóm của web; dòng hàng có STT, mã cạnh tên,
          3 dòng chi tiết thụt vào, tiền cùng cột tổng dòng; khung tổng nền xám; chỉ một nút Đóng */}
      {donDangXem && (
        <div className="m-pb-man m-pos-ct-man">
          <header className="m-pb-thanh-dau m-pos-ct-dau">
            <button
              type="button"
              className="m-pos-ct-x"
              onClick={() => setDonDangXem(null)}
              aria-label="Đóng"
            >
              <Icon n="x" />
            </button>
            <div className="m-pos-ct-td">
              <b>Xuất bán POS</b>
              <small className="code">{donDangXem.so}</small>
            </div>
            <span className="m-pos-ct-x-placeholder" />
          </header>

          <div className="m-pb-noi-dung m-pos-ct-than">
            <p className="m-xb651-nhac">
              <Icon n="info" className="ic sm" />
              <span>Đồng bộ từ FABi: không sửa, trả hàng, xoá trên phiếu này. Sửa đơn trên FABi rồi đồng bộ lại.</span>
            </p>

            <section className="m-xb651-the">
              <div className="m-xb651-dau">
                <h3>Đơn hàng POS</h3>
                <span className="m-xb651-chips">
                  {/* Như web (T613): phiếu đã ghi hoặc gói không ghi sổ là "Đã đồng bộ" */}
                  {!ghi || donDangXem.tt !== 'nhap'
                    ? <span className="m-xb651-chip xanh">Đã đồng bộ</span>
                    : <span className="m-xb651-chip vang">Chưa ghi sổ</span>}
                  <span className="m-xb651-chip cam">FABi</span>
                </span>
              </div>
              <div className="m-xb651-luoi">
                <O nhan="Số đơn POS" ma>{dp?.soDon}</O>
                <O nhan="Thời gian xuất">{donDangXem.ngay}</O>
                <O nhan="Cửa hàng">{donDangXem.cn}</O>
                <O nhan="Kho xuất">{tenKhoDon}</O>
                <O nhan="Kênh bán hàng">{donDangXem.kenh}</O>
                <O nhan="Thanh toán">{ptttTen}</O>
              </div>
            </section>

            <section className="m-xb651-the">
              <div className="m-xb651-dau"><h3>Khách hàng</h3></div>
              <div className="m-xb651-luoi">
                <O nhan="Tên khách hàng" full>{dp?.khach?.ten ?? 'Khách lẻ POS'}</O>
                <O nhan="Mã số thuế" ma>{dp?.khach?.mst}</O>
                <O nhan="Người mua hàng">{dp?.khach?.nguoiMua}</O>
                <O nhan="Địa chỉ" full>{dp?.khach?.diaChi}</O>
              </div>
            </section>

            <section className="m-xb651-the">
              <div className="m-xb651-dau">
                <h3>Hoá đơn</h3>
                {!dp?.hoaDon && <span className="m-xb651-chip xam">Không có thông tin HĐĐT</span>}
              </div>
              <div className="m-xb651-luoi">
                {dp?.hoaDon && (
                  <>
                    <O nhan="Số hoá đơn" ma>{dp.hoaDon.so}</O>
                    <O nhan="Ký hiệu" ma>{dp.hoaDon.kyHieu}</O>
                    <O nhan="Ngày hoá đơn">{dp.hoaDon.ngay}</O>
                    <O nhan="Mã đơn POS" ma>{donDangXem.so}</O>
                    <div className="m-xb651-o full m-xb651-o-chep">
                      <div>
                        <small>Mã tra cứu</small>
                        <b className="code">{dp.hoaDon.maTraCuu}</b>
                      </div>
                      <button type="button" className={`m-xb651-chep${daChep ? ' da-chep' : ''}`} onClick={() => chepMa(dp.hoaDon!.maTraCuu)}
                        aria-label={daChep ? 'Đã chép mã tra cứu' : 'Sao chép mã tra cứu'}>
                        {daChep
                          ? <Icon n="check" className="ic sm" />
                          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></svg>}
                      </button>
                    </div>
                  </>
                )}
                <O nhan="Ghi chú" full>{donDangXem.dienGiai}</O>
              </div>
            </section>

            <div className="m-pos-b-tieu-de">DANH SÁCH HÀNG HOÁ ({dsMon.length})</div>
            <label className="m-pos-b-tim">
              <Icon n="search" className="ic sm" />
              <input type="text" value={timHang} onChange={e => setTimHang(e.target.value)} placeholder="Nhập tên, mã hàng hoá" aria-label="Tìm hàng hoá" />
            </label>
            <section className="m-xb651-the m-xb651-hang">
              {dsMonLoc.length === 0 && <div className="m-pos-b-trong">Không có hàng hoá khớp</div>}
              {dsMonLoc.map((m, idx) => {
                // Tổng dòng = doanh thu trước thuế + thuế; GTGT theo % doanh thu thì trừ giảm thuế, không có VAT (T163, T450)
                const giamThue = Number(m.giamThue) || 0
                const tong = m.dtTruocThue + (tyLe ? -giamThue : m.thue)
                return (
                  <div key={m.ma + idx} className="m-xb651-mon">
                    <div className="m-xb651-mon-dau">
                      <span className="m-xb651-stt">{m.stt ?? idx + 1}.</span>
                      <b>{m.ten}</b>
                      <span className="m-xb651-ma code">{m.ma}</span>
                      <span className="m-xb651-tong num">{moneyD(tong)}</span>
                    </div>
                    <div className="m-xb651-mon-ct num">
                      <div><span>{soLuong(m.sl)} {m.dvt} × {money(m.gia)}</span><span>{moneyD(m.thanh)}</span></div>
                      <div><span>Giảm giá</span><span>{moneyD(m.giam)}</span></div>
                      {m.ck > 0 && <div><span>Chiết khấu</span><span>{moneyD(m.ck)}</span></div>}
                      {m.phiDv > 0 && <div><span>Phí dịch vụ</span><span>{moneyD(m.phiDv)}</span></div>}
                      {tyLe
                        ? <div><span>Giảm thuế GTGT</span><span>{moneyD(giamThue)}</span></div>
                        : <div><span>VAT {m.ts}% - Thuế</span><span>{moneyD(m.thue)}</span></div>}
                    </div>
                  </div>
                )
              })}
            </section>

            <section className="m-xb651-tong-khung num">
              <div><span>Tiền hàng ({dsMon.length} món, SL {soLuong(khoan.sl)})</span><span>{money(khoan.tienHang)}</span></div>
              <div><span>Giảm giá</span><span>{money(khoan.giam)}</span></div>
              <div><span>Chiết khấu</span><span>{money(khoan.ck)}</span></div>
              <div><span>Phí dịch vụ</span><span>{money(khoan.phiDv)}</span></div>
              {khoan.phiVc > 0 && <div><span>Phí vận chuyển</span><span>{money(khoan.phiVc)}</span></div>}
              <div className="dam"><span>Doanh thu tính thuế</span><span>{money(khoan.dtTruocThue)}</span></div>
              {tyLe
                ? <div><span>Giảm thuế GTGT</span><span>{money(khoan.giamThue)}</span></div>
                : <div><span>Thuế GTGT</span><span>{money(khoan.thue)}</span></div>}
              <div className="tong"><span>Tổng thanh toán</span><span>{moneyD(Number(donDangXem.tong))}</span></div>
            </section>
          </div>

          {/* Chân: chỉ một nút "Đóng" rộng hết. KHÔNG có nút In phiếu, Xem hạch toán (T573, T651) */}
          <div className="m-pos-ct-chan">
            <button
              type="button"
              className="btn pri m-pos-ct-nut-dong"
              onClick={() => setDonDangXem(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Báo cáo theo dõi */}
      <MBaoCaoTheoDoi
        mo={moTheoDoi}
        onDong={() => setMoTheoDoi(false)}
        modKey="ban-hang"
      />
    </>
  )
}

/** Một ô nhãn trên, giá trị dưới trong thẻ chi tiết Xuất bán POS (T651); trống thì ghi — như web */
function O({ nhan, children, full, ma }: { nhan: string; children?: ReactNode; full?: boolean; ma?: boolean }) {
  const trong = children === undefined || children === null || children === ''
  return (
    <div className={`m-xb651-o${full ? ' full' : ''}`}>
      <small>{nhan}</small>
      {trong ? <b className="trong">—</b> : <b className={ma ? 'code' : undefined}>{children}</b>}
    </div>
  )
}
