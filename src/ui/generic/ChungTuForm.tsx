// Form chứng từ toàn màn hình theo bố cục AMIS
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps, VoucherCfg } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { chiNhanhHienTai, useSession, cheDoHienTai } from '../../app/session'
import { kieuGhiSo, type Goi } from '../../app/plan'
import { CHE_DO } from '../../app/che-do'
import { tkTheoCheDo } from '../../modules/tong-hop/so-cai'
import { CHI_NHANH, KHACH, KHO, KHOA_SO_DEN, NCC, NHAN_VIEN, TK_NGAN_HANG, daKhoaSo } from '../../data/mock'
import { HopXacNhan } from '../LocNangCao'
import { ghiNhatKy, soKeTiep, suaPhieu, themPhieu, useNhatKy, xoaPhieu } from './daXoa'
import { Icon } from '../Icon'
import { Card, Note } from '../Page'
import { FormToanMan, useDong } from '../FormToanMan'
import { Dropdown, MenuHead, MenuItem, Popover, Select } from '../Dropdown'
import { LichDon } from '../ChonNgay'
import { ChonDanhMuc } from '../ChonDanhMuc'
import { heSoZoom } from '../zoom'
import { St, Table } from '../Table'
import { fold, money, moneyD } from '../format'
import { NGUON, TT_CT, dongCua, ttNghiepVu, type Dong } from './gen'
import { boO, nhomCua, theoLoai } from './nhom'
import { BangSua, DS_DOI_TUONG, HopCotPhieu, cotTuyChon } from './BangSua'
import { HopInChungTu, type PhieuIn } from '../bao-cao/InChungTu'

export interface ChungTuFormProps extends ScreenProps {
  cfg: VoucherCfg
  row?: Row
  rows?: Row[]
  children?: React.ReactNode
}

export function ChungTuForm({ sc, mod, cfg: cfgMan, row, rows, children }: ChungTuFormProps) {
  const { s, set, toast } = useSession()
  const nav = useNavigate()
  const loc = useLocation()
  const [sp, setSp] = useSearchParams()

  const moi = !row
  const [dangSua, setDangSua] = useState(moi || sp.get('sua') === '1')
  const [tab, setTab] = useState('ct')
  const [hienTk, setHienTk] = useState(false)
  const [modalPhim, setModalPhim] = useState(false)
  const [phieuIn, setPhieuIn] = useState<PhieuIn[] | null>(null)
  const [hoiXoa, setHoiXoa] = useState(false)

  const loai = cfgMan.loai?.find(x => x.k === (row?.loai ?? sp.get('loai'))) ?? cfgMan.loai?.[0]
  const cfg = theoLoai(cfgMan, loai?.k)
  const nhom = nhomCua(mod.key, cfg, loai?.k)
  const bo = boO(nhom, cfg)
  const nv = useMemo(() => (row ? ttNghiepVu(row) : null), [row])

  const path = duongDan(mod, sc)
  const dongForm = useDong(path)
  const kieu = kieuGhiSo(s.cheDo)
  const coTkGoi = kieuGhiSo(s.cheDo) === 'noco'

  // Trạng thái thanh toán cho mua/bán
  const [hinhThucTt, setHinhThucTt] = useState<'congno' | 'tienmat' | 'chuyenkhoan'>(
    (row?._httt as 'congno' | 'tienmat' | 'chuyenkhoan' | undefined) ?? (nv?.ttTien === 'da' ? 'tienmat' : 'congno')
  )
  // Phiếu đã lưu trong phiên giữ đủ các ô đầu phiếu ở row._xxx (T69), không lấy lại dữ liệu mẫu
  const luuCu = (k: string) => (row?.[`_${k}`] as string | undefined)
  const [nhanKemHd, setNhanKemHd] = useState(row?._nhanKemHd !== undefined ? Boolean(row._nhanKemHd) : nv?.ttHd === 'da' || row?.nguon === 'HĐ')

  // Dữ liệu dòng
  const idSeed = row ? `${sc.code ?? sc.slug}-${row.id}` : 'moi'
  const dongGoc = useMemo(() => (
    moi ? dongCua(cfg, `mau-${loai?.k ?? ''}`).slice(0, 1) : (row?._dong as Dong[] | undefined) ?? dongCua(cfg, idSeed)
  ), [idSeed, loai?.k, moi])

  const [dsDong, setDsDong] = useState<Dong[]>(dongGoc)
  useEffect(() => {
    setDsDong(dongGoc)
  }, [dongGoc])

  // Cập nhật TK nợ/có trên dòng theo hình thức thanh toán
  const tkDoiUng = hinhThucTt === 'tienmat' ? '1111' : hinhThucTt === 'chuyenkhoan' ? '1121' : (nhom === 'mua' ? '331' : '131')
  const nhanTkDong: [string, string] = nhom === 'mua'
    ? [bo.tk[0], hinhThucTt === 'congno' ? 'TK công nợ (331)' : hinhThucTt === 'tienmat' ? 'TK tiền mặt (1111)' : 'TK tiền gửi (1121)']
    : [hinhThucTt === 'congno' ? 'TK công nợ (131)' : hinhThucTt === 'tienmat' ? 'TK tiền mặt (1111)' : 'TK tiền gửi (1121)', bo.tk[1]]

  // Thông tin chung
  const [ngayCt, setNgayCt] = useState(row?.ngay ? String(row.ngay) : '07/10/2026')
  const [soCt, setSoCt] = useState(row?.so ? String(row.so) : soKeTiep(`${mod.key}/${sc.slug}`, `${cfg.prefix}2610-`))
  // Chi nhánh không sửa trên form: phiếu cũ giữ chi nhánh đã lập, phiếu mới theo chi nhánh chọn trên thanh trên
  const cnChon = chiNhanhHienTai(s)
  const chiNhanh = row?.cn ? String(row.cn) : cnChon?.ten ?? ''
  const canChonCn = moi && !cnChon
  const [doiTuong, setDoiTuong] = useState(row?.doiTuong ? String(row.doiTuong) : (cfg.doiTuong === 'ncc' ? NCC[0].ten : cfg.doiTuong === 'kh' ? KHACH[0].ten : ''))
  const [dienGiai, setDienGiai] = useState(row?.dienGiai ? String(row.dienGiai) : cfg.dienGiai[0])
  const [nguoiGiao, setNguoiGiao] = useState(luuCu('nguoiGiao') ?? nv?.nguoi ?? NHAN_VIEN[0].ten)
  const [nhanVien, setNhanVien] = useState(luuCu('nhanVien') ?? NHAN_VIEN[0].ten)
  const [diaChi, setDiaChi] = useState(luuCu('diaChi') ?? nv?.dc ?? '45 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM')
  const [mst, setMst] = useState(luuCu('mst') ?? nv?.mst ?? '0319880101')
  const [soHd, setSoHd] = useState(luuCu('soHd') ?? nv?.soHd ?? '0012345')
  const [ngayHd, setNgayHd] = useState(luuCu('ngayHd') ?? nv?.ngayHd ?? '07/10/2026')
  const [kyHieuHd, setKyHieuHd] = useState(luuCu('kyHieuHd') ?? nv?.kyHieuHd ?? '1C26TMM')
  const [hanTt, setHanTt] = useState(luuCu('hanTt') ?? nv?.hanTt ?? '06/11/2026')
  // Lý do thu, chi ở đầu phiếu (danh mục 1.16), chỉ có ở phân hệ tiền
  const oLy = mod.key === 'tien' ? bo.a.find(o => o.k === 'ly') : undefined
  const [lyDo, setLyDo] = useState(() => row?._lyDo ? String(row._lyDo) : lyMacDinh(oLy?.ds ?? [], dienGiai))
  // Phiếu chuyển quỹ: quỹ đi và quỹ đến. Rút tiền ngân hàng thì đi từ tài khoản về quỹ tiền mặt
  const quyTm = `Quỹ tiền mặt ${CHI_NHANH.find(c => c.ten === chiNhanh)?.ngan ?? CHI_NHANH[0].ngan}`
  const rut = fold(dienGiai).includes('rut tien')
  const [tuQuy, setTuQuy] = useState(rut ? QUY_TIEN[CHI_NHANH.length] : quyTm)
  const [denQuy, setDenQuy] = useState(rut ? quyTm : QUY_TIEN[CHI_NHANH.length])
  useEffect(() => {
    setLyDo(row?._lyDo ? String(row._lyDo) : lyMacDinh(oLy?.ds ?? [], row?.dienGiai ? String(row.dienGiai) : cfg.dienGiai[0]))
  }, [loai?.k, row?.id])
  // Phiếu thu, chi (T49): dòng chi tiết có cột lý do theo lý do đầu phiếu
  const laTien = mod.key === 'tien'
  useEffect(() => {
    if (oLy) setDsDong(ds => ds.map(d => ({ ...d, ly: lyDo })))
  }, [dongGoc, lyDo])
  // Đối tượng đầu phiếu đổi thì đối tượng mọi dòng đổi theo, vẫn sửa lại được từng dòng
  useEffect(() => {
    if (laTien && cfg.doiTuong !== 'none') setDsDong(ds => ds.map(d => ({ ...d, dt: doiTuong })))
  }, [dongGoc, doiTuong])
  // Cột ẩn ở bảng chi tiết, nhớ theo màn trên máy người dùng
  const khoaCot = `iacc-cot-phieu:${mod.key}/${sc.slug}`
  const [anCot, setAnCot] = useState<string[]>(() => {
    try { const v = JSON.parse(localStorage.getItem(khoaCot) ?? '[]'); return Array.isArray(v) ? v : [] } catch { return [] }
  })
  const [hopCot, setHopCot] = useState(false)
  function doiAnCot(an: string[]) {
    setAnCot(an)
    try { localStorage.setItem(khoaCot, JSON.stringify(an)) } catch { /* trình duyệt chặn lưu thì chỉ giữ trong phiên */ }
  }
  // Chọn lý do: diễn giải và lý do mọi dòng theo lý do, vẫn sửa lại được
  // Mọi phiếu không có ô Diễn giải ở đầu phiếu, Ghi chú chép sang diễn giải (T77, T78). Phiếu có ô lý do: Ghi chú mặc định theo lý do; phiếu khác: mặc định là diễn giải
  const ghiChuGoc = () => row?._ghiChu ? String(row._ghiChu) : !oLy ? (row?.dienGiai ? String(row.dienGiai) : cfg.dienGiai[0]) : row?._lyDo ? String(row._lyDo) : lyMacDinh(oLy?.ds ?? [], row?.dienGiai ? String(row.dienGiai) : cfg.dienGiai[0])
  const [ghiChu, setGhiChu] = useState(ghiChuGoc)
  useEffect(() => { setGhiChu(ghiChuGoc()) }, [loai?.k, row?.id])
  function chonLyDo(v: string) {
    setLyDo(v)
    setDienGiai(v)
    setGhiChu(v)
  }
  // Ô đối tượng chọn từ danh mục theo loại phiếu, thêm mới được ngay tại form (T65)
  const dmDt = laTien ? 'doiTuong' : cfg.doiTuong ?? 'doiTuong'
  const dsDt = laTien ? DS_DOI_TUONG : cfg.doiTuong === 'ncc' ? NCC.map(x => x.ten) : cfg.doiTuong === 'kh' ? KHACH.map(x => x.ten)
    : cfg.doiTuong === 'nv' ? NHAN_VIEN.map(x => x.ten) : cfg.doiTuong === 'cn' ? CHI_NHANH.map(x => x.ten) : DS_DOI_TUONG
  // Chọn đối tượng từ danh mục thì điền mã số thuế
  function chonDoiTuong(v: string) {
    setDoiTuong(v)
    const dt = [...KHACH, ...NCC].find(x => x.ten === v)
    if (dt) setMst(dt.mst)
  }
  // Gói Free: tháng hạch toán lãi lỗ, mặc định tháng của ngày chứng từ, chọn được các tháng trước chưa khoá sổ (T49)
  // Quỹ của phiếu (T51): phiếu tiền mặt chỉ chọn quỹ tiền mặt của chi nhánh lập phiếu, phiếu ngân hàng chọn tài khoản ngân hàng
  // Mua, bán trả tiền ngay (T78): tiền mặt chọn quỹ tiền mặt, chuyển khoản chọn quỹ ngân hàng
  const dsQuy = nhom === 'thu' || nhom === 'chi' || (bo.tt && hinhThucTt === 'tienmat') ? [quyTm]
    : nhom === 'nhthu' || nhom === 'nhchi' || (bo.tt && hinhThucTt === 'chuyenkhoan') ? QUY_TIEN.slice(CHI_NHANH.length) : []
  const [quy, setQuy] = useState(() => row?._quy ? String(row._quy) : dsQuy.includes(quyTm) ? quyTm : dsQuy[0] ?? '')
  useEffect(() => { setQuy(row?._quy ? String(row._quy) : dsQuy.includes(quyTm) ? quyTm : dsQuy[0] ?? '') }, [loai?.k, row?.id])
  useEffect(() => { if (!dsQuy.includes(quy)) setQuy(dsQuy[0] ?? '') }, [hinhThucTt])
  // Kho của phiếu mua, bán (T83): gói dưới Pro chọn một kho ở đầu phiếu, gói Pro chọn kho trên từng dòng.
  // Chi nhánh chỉ có một kho thì phiếu mới lấy luôn kho đó
  const dsKhoCn = CHI_NHANH.find(c => c.ten === chiNhanh)?.kho ?? KHO
  const khoMotCn = dsKhoCn.length === 1 ? dsKhoCn[0] : ''
  const khoDau = bo.kho === 'dong' && (nhom === 'mua' || nhom === 'ban') && s.goi !== 'PR'
  const [kho, setKho] = useState(() => luuCu('kho') ?? (moi ? khoMotCn : dongGoc.find(d => d.kho)?.kho ?? dsKhoCn[0] ?? ''))
  useEffect(() => {
    if (khoDau) setDsDong(ds => ds.map(d => ({ ...d, kho })))
  }, [dongGoc, kho, khoDau])
  const coHdDau = (nhom === 'mua' || nhom === 'ban') && Boolean(bo.hd) && nhanKemHd
  const coThangLl = laTien && s.goi === 'F' && nhom !== 'cq'   // chuyển quỹ không ảnh hưởng lãi lỗ
  const dsThangLl = useMemo(() => thangLaiLo(ngayCt), [ngayCt])
  const [thangLl, setThangLl] = useState(dsThangLl[0])
  useEffect(() => { setThangLl(dsThangLl[0]) }, [dsThangLl])

  // Tính tổng
  const tongTien = dsDong.reduce((a, d) => a + (d.tien || 0), 0)
  const tongCk = dsDong.reduce((a, d) => a + (d.ck || 0), 0)
  const tongThue = dsDong.reduce((a, d) => a + (d.thue || 0), 0)
  const tongThanhToan = tongTien - tongCk + tongThue
  // Phiếu thu, chi không có thuế, chiết khấu: khối tổng chỉ cần một dòng
  const chiTien = cfg.dong === 'tien' && tongThue === 0 && !bo.ck

  // Điều hướng Trước / Sau
  const curIdx = rows && row ? rows.findIndex(r => r.id === row.id) : -1
  const coTruoc = curIdx > 0
  const coSau = curIdx >= 0 && rows ? curIdx < rows.length - 1 : false

  function veTruoc() {
    if (coTruoc && rows) nav(`${path}/${rows[curIdx - 1].id}`, { replace: true, state: { chuyenPhieu: true } })
  }
  function veSau() {
    if (coSau && rows) nav(`${path}/${rows[curIdx + 1].id}`, { replace: true, state: { chuyenPhieu: true } })
  }

  // Lưu chứng từ
  // Nội dung lúc bắt đầu sửa, để nhật ký ghi ô nào đổi (T51)
  const chupNd = () => ({ ngay: ngayCt, doiTuong, dienGiai, tong: tongThanhToan, lyDo, ghiChu, quy, kho, dong: JSON.stringify(dsDong) })
  const goc = useRef(chupNd())
  useEffect(() => { if (dangSua) goc.current = chupNd() }, [dangSua])

  function luu(moMoi = false) {
    // Bản mẫu chưa có backend: phiếu mới lên đầu danh sách, phiếu sửa hiện nội dung mới, tới khi tải lại trang (T49)
    const noiDung = {
      ngay: ngayCt, thang: Number(ngayCt.split('/')[1]) || 10, doiTuong, dienGiai,
      tien: tongTien - tongCk, thue: tongThue, tong: tongThanhToan, _dong: dsDong, _lyDo: lyDo, _ghiChu: ghiChu, _quy: quy, _kho: kho,
      _nguoiGiao: nguoiGiao, _nhanVien: nhanVien, _diaChi: diaChi, _mst: mst, _hanTt: hanTt,
      _nhanKemHd: nhanKemHd, _soHd: soHd, _ngayHd: ngayHd, _kyHieuHd: kyHieuHd, _httt: hinhThucTt,
    }
    const idMoi = `moi-${Date.now()}`
    const man = `${mod.key}/${sc.slug}`
    if (moi) {
      themPhieu(man, {
        id: idMoi, so: soCt, cn: chiNhanh, nguon: 'tay', tt: kieu === 'khong' ? 'ghi' : 'nhap',
        loai: loai?.k, tenLoai: loai?.ten, ...noiDung,
      })
      ghiNhatKy(man, idMoi, soCt, s.ten, 'Thêm mới chứng từ')
    } else if (row) {
      suaPhieu(man, String(row.id), noiDung)
      const g = goc.current, m = chupNd()
      const doi = ([['ngay', 'Ngày chứng từ'], ['doiTuong', 'Đối tượng'], ['quy', 'Quỹ'], ['kho', 'Kho'], ['lyDo', 'Lý do'], ['dienGiai', 'Diễn giải'], ['ghiChu', 'Ghi chú'], ['dong', 'Dòng chi tiết']] as const)
        .filter(([k]) => g[k] !== m[k]).map(([, ten]): string => ten)
      if (g.tong !== m.tong) doi.push(`Tổng tiền ${money(g.tong)} → ${money(m.tong)}`)
      if (doi.length) ghiNhatKy(man, String(row.id), soCt, s.ten, `Sửa chứng từ: ${doi.join(', ')}`)
    }
    toast(moi ? `Đã lưu ${soCt}` : `Đã lưu thay đổi ${soCt}`)
    if (moMoi) {
      nav(`${path}/moi${loai ? `?loai=${loai.k}` : ''}`, { replace: true })
    } else if (moi) {
      // Lưu phiếu mới: ở lại form, xem chi tiết phiếu vừa lưu; bấm đóng mới về danh sách (T51)
      nav(`${path}/${idMoi}`, { replace: true })
    } else {
      setDangSua(false)
    }
  }

  // In: lấy dữ liệu đang có trên form, phiếu mới chưa lưu cũng in được
  function moIn() {
    setPhieuIn([{
      sc, cfg, loai,
      row: { ...row, id: row?.id ?? 'moi', so: soCt, ngay: ngayCt, cn: chiNhanh, doiTuong, dienGiai, loai: loai?.k, tien: tongTien, thue: tongThue, tong: tongThanhToan },
    }])
  }

  // Phím tắt
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (e.shiftKey) luu(true)
        else luu(false)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        setDangSua(true)
      } else if (e.key === 'Escape' && !modalPhim) {
        // FormToanMan tự xử lý Esc đóng form
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modalPhim, soCt, moi])

  // Tiêu đề form mọi phiếu chỉ là tên phiếu; trạng thái và số phiếu ở giữa đầu form (T49, T61)
  const tenPhieu = loai?.ten ?? (cfg.them?.startsWith('Thêm ') ? cfg.them.charAt(5).toUpperCase() + cfg.them.slice(6) : tenMan(sc))

  // Đang xem tất cả chi nhánh thì phải chọn một chi nhánh trước khi lập chứng từ mới
  if (canChonCn) {
    return (
      <FormToanMan icon={mod.icon} onClose={dongForm} title={tenPhieu}
        foot={<button type="button" className="btn" onClick={dongForm}>Huỷ</button>}>
        <section className="card chon-cn">
          <b>Chọn chi nhánh lập chứng từ</b>
          <p className="muted">Bạn đang xem tất cả chi nhánh. Chứng từ mới lập cho một chi nhánh và không đổi được sau khi lập.</p>
          <div className="chon-cn-ds">
            {CHI_NHANH.map(c => (
              <button key={c.id} type="button" className="btn" onClick={() => set({ chiNhanh: c.id })}>
                <Icon n="store" className="ic sm" />{c.ten}
              </button>
            ))}
          </div>
        </section>
      </FormToanMan>
    )
  }

  const tabs: [string, string][] = [
    ['ct', bo.tabDau ?? 'Chi tiết'],
    // Mua hàng: thông tin hoá đơn nằm ở đầu phiếu khi tích Nhận kèm hoá đơn, không có tab Hoá đơn (T62)
    ...(bo.hd && nhom !== 'mua' && nhom !== 'ban' ? [['hd', 'Hoá đơn'] as [string, string]] : []),   // mua, bán: hoá đơn ở đầu phiếu khi tích kèm hoá đơn (T83)
    // Phiếu thu chi bỏ tab hạch toán (T49); gói Free không ghi sổ nên không có tab Ghi sổ (T62)
    ...(laTien || kieu === 'khong' ? [] : [['ht', kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ'] as [string, string]]),
    ...(s.goi === 'F' ? [] : [['dk', 'Đính kèm'] as [string, string]]),   // gói Free không có đính kèm (T52)
    ['ls', 'Lịch sử'],
  ]

  // Đầu phiếu thu chi, chuyển quỹ: bỏ ô Diễn giải vì Ghi chú chép sang, Địa chỉ lên cột giữa, Ghi chú kéo dài qua hai cột (T77)
  const oDiaChi = (
    <div className="f">
      <label>Địa chỉ</label>
      <input className="inp" readOnly={!dangSua} value={diaChi} onChange={e => setDiaChi(e.target.value)} />
    </div>
  )
  // Chuyển quỹ: ô quỹ đi, quỹ đến và người thực hiện
  const oQuyCq = (nhan: string, v: string, setV: (v: string) => void) => (
    <div className="f">
      <label>{nhan} <em>*</em></label>
      {dangSua ? <ChonDanhMuc dm="quy" nhan="quỹ" value={v} onChange={setV} ds={QUY_TIEN} /> : <input className="inp" readOnly value={v} />}
    </div>
  )
  const oNguoiTh = (
    <div className="f">
      <label>Người thực hiện</label>
      <input className="inp" readOnly={!dangSua} value={nguoiGiao} onChange={e => setNguoiGiao(e.target.value)} />
    </div>
  )
  // Ghi chú ở mọi phiếu (T69), gõ ghi chú thì diễn giải chép theo (T49, T78)
  // Phân hệ Thu chi (trừ chuyển quỹ): Địa chỉ ở cột giữa, Ghi chú kéo dài qua hai cột trái (T77).
  // Phiếu khác: Địa chỉ ở cột trái, Ghi chú ở cột giữa cùng hàng Địa chỉ (T78). Hai cột trái luôn đều hàng
  const keoGc = laTien && nhom !== 'cq'
  const oGhiChu = (
    <div className="f" style={keoGc ? { gridColumn: '1 / 3' } : undefined}>
      <label>Ghi chú</label>
      <input className="inp" readOnly={!dangSua} value={ghiChu} placeholder={dangSua ? 'Ghi chú thêm cho phiếu' : ''}
        onChange={e => { setGhiChu(e.target.value); setDienGiai(e.target.value) }} />
    </div>
  )

  return (
    <FormToanMan
      icon={mod.icon}
      tinh={Boolean((loc.state as { chuyenPhieu?: boolean } | null)?.chuyenPhieu)}
      onClose={dongForm}
      day={laTien && chiTien ? <TongDay tong={tongThanhToan} soDong={dsDong.length} /> : undefined}
      giua={(
        moi ? <span className="fsf-tt moi">Thêm mới</span>
          : dangSua ? <span className="fsf-tt sua">Đang chỉnh sửa <b>{soCt}</b></span>
            : <span className="fsf-tt xem">Chi tiết phiếu <b>{soCt}</b></span>
      )}
      title={tenPhieu}
      trai={
        !moi && (
          <button
            type="button"
            className="icon-btn"
            title="Xem lịch sử thao tác"
            onClick={() => setTab('ls')}
          >
            <Icon n="history" />
          </button>
        )
      }
      phai={
        <button
          type="button"
          className="icon-btn"
          title="Phím tắt: Ctrl+S lưu, Ctrl+Shift+S lưu và thêm, Ctrl+E sửa, Esc đóng"
          onClick={() => setModalPhim(m => !m)}
        >
          <Icon n="keyboard" />
        </button>
      }
      meta={
        row ? (
          <>
            {/* Gói Free lưu là duyệt luôn, không có trạng thái ghi sổ (QD32) */}
            {kieu !== 'khong' && (() => {
              const [c, tx] = TT_CT[row.tt] ?? ['warn', 'Chưa ghi sổ']
              return <St k={c}>{tx}</St>
            })()}
            <span className={`src ${NGUON[row.nguon]?.[0] ?? 'tay'}`}>
              {NGUON[row.nguon]?.[1] ?? 'Thủ công'}
            </span>
            {chiNhanh && <span className="chip info" title="Chi nhánh lập chứng từ, không sửa được"><Icon n="store" className="ic sm" />{chiNhanh}</span>}
          </>
        ) : (
          <>
            <span className="chip info" title="Theo chi nhánh chọn trên thanh trên, không sửa được"><Icon n="store" className="ic sm" />{chiNhanh}</span>
          </>
        )
      }
      foot={
        dangSua ? (
          <>
            <button
              type="button"
              className="btn"
              onClick={() => (moi ? dongForm() : setDangSua(false))}
            >
              Huỷ
            </button>
            <span className="grow" />
            {coTkGoi && (
              <button
                type="button"
                className={`btn sm btn-tk-toggle ${hienTk ? 'on' : ''}`}
                onClick={() => setHienTk(!hienTk)}
                title={hienTk ? 'Bấm để ẩn cột tài khoản Nợ/Có trên dòng' : 'Bấm để hiển thị cột tài khoản Nợ/Có trên dòng'}
              >
                <Icon n="book" className="ic sm" />
                <span>{hienTk ? 'Ẩn cột tài khoản' : 'Hiện cột tài khoản'}</span>
                <span className={`tk-badge ${hienTk ? 'on' : ''}`}>{hienTk ? 'Đang hiện' : 'Đang ẩn'}</span>
              </button>
            )}
            <button type="button" className="btn" onClick={() => luu(false)}>
              Lưu (Ctrl+S)
            </button>
            <button type="button" className="btn pri" onClick={() => luu(true)}>
              Lưu và thêm (Ctrl+Shift+S)
            </button>
          </>
        ) : (
          <>
            <div className="btn-group">
              <button
                type="button"
                className="btn sm"
                disabled={!coTruoc}
                onClick={veTruoc}
                title="Chứng từ trước"
              >
                <Icon n="chevl" className="ic sm" />Trước
              </button>
              <button
                type="button"
                className="btn sm"
                disabled={!coSau}
                onClick={veSau}
                title="Chứng từ sau"
              >
                Sau<Icon n="chevr" className="ic sm" />
              </button>
            </div>
            {coTkGoi && (
              <button
                type="button"
                className={`btn sm btn-tk-toggle ${hienTk ? 'on' : ''}`}
                onClick={() => setHienTk(!hienTk)}
                title={hienTk ? 'Bấm để ẩn cột tài khoản Nợ/Có trên dòng' : 'Bấm để hiển thị cột tài khoản Nợ/Có trên dòng'}
              >
                <Icon n="book" className="ic sm" />
                <span>Cột tài khoản</span>
                <span className={`tk-badge ${hienTk ? 'on' : ''}`}>{hienTk ? 'Đang hiện' : 'Đang ẩn'}</span>
              </button>
            )}
            <span className="grow" />
            <button type="button" className="btn sm" onClick={moIn}>
              <Icon n="printer" className="ic sm" />In
            </button>
            <Dropdown
              btnClass="btn sm"
              align="end"
              width={180}
              label={<><Icon n="more" className="ic sm" />Tiện ích</>}
            >
              {dong => <>
              <MenuItem icon="copy" onClick={() => toast('Đã sao chép chứng từ')}>
                Sao chép
              </MenuItem>
              <MenuItem icon="chinh" onClick={() => { dong(); setHopCot(true) }}>
                Tuỳ chỉnh giao diện phiếu
              </MenuItem>
              <MenuItem icon="doc" onClick={() => toast('Đã xuất mẫu Excel')}>
                Xuất Excel
              </MenuItem>
              {row && (
                <MenuItem icon="trash" danger onClick={() => {
                  // Cùng luật xoá với danh sách (QD32): kỳ đã khoá sổ không xoá, gói có ghi sổ chỉ xoá phiếu chưa ghi
                  if (daKhoaSo(row.ngay)) toast(`${row.so} thuộc kỳ đã khoá sổ, không xoá được`)
                  else if (kieu !== 'khong' && row.tt !== 'nhap') toast(`${row.so} đã ghi sổ, bỏ ghi sổ rồi mới xoá`)
                  else setHoiXoa(true)
                }}>
                  Xoá chứng từ
                </MenuItem>
              )}
              </>}
            </Dropdown>
            {hopCot && (
              <HopCotPhieu ds={cotTuyChon(cfg, { coKho: Boolean(bo.kho) && !khoDau, coLo: nhom === 'mua' && s.goi === 'PR', coCk: Boolean(bo.ck), coKm: kieu !== 'khong', coLy: Boolean(oLy) })}
                an={anCot} onDoi={doiAnCot} onDong={() => setHopCot(false)} />
            )}
            {hoiXoa && row && (
              <HopXacNhan tieuDe={`Xoá ${row.so}?`} nut="Xoá phiếu" onDong={() => setHoiXoa(false)}
                onDongY={() => { setHoiXoa(false); xoaPhieu(`${mod.key}/${sc.slug}`, [{ id: String(row.id), so: soCt }], s.ten); toast(`Đã xoá ${row.so}`); dongForm() }}>
                Phiếu đã xoá không lấy lại được.
              </HopXacNhan>
            )}
            {kieu !== 'khong' && row && (
              <button
                type="button"
                className="btn sm"
                onClick={() => toast(row.tt === 'ghi' ? 'Đã bỏ ghi sổ' : 'Đã ghi sổ')}
              >
                {row.tt === 'ghi' ? 'Bỏ ghi sổ' : 'Ghi sổ'}
              </button>
            )}
            <button
              type="button"
              className="btn sm pri"
              onClick={() => setDangSua(true)}
            >
              <Icon n="edit" className="ic sm" />Sửa (Ctrl+E)
            </button>
            <button type="button" className="btn sm" onClick={dongForm}>
              Đóng (Esc)
            </button>
          </>
        )
      }
    >
      {phieuIn && <HopInChungTu ds={phieuIn} onDong={() => setPhieuIn(null)} />}
      {/* Modal hướng dẫn phím tắt */}
      {modalPhim && (
        <div
          className="pop-backdrop"
          onClick={() => setModalPhim(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 100,
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div
            className="card"
            style={{ width: 360, padding: 18 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <b>Phím tắt thao tác</b>
              <button
                type="button"
                className="icon-btn sm"
                onClick={() => setModalPhim(false)}
              >
                <Icon n="x" />
              </button>
            </div>
            <div className="stack" style={{ gap: 8, fontSize: 13 }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>Lưu chứng từ:</span>
                <kbd style={{ padding: '2px 6px', background: 'var(--tint)', borderRadius: 4 }}>Ctrl + S</kbd>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>Lưu và thêm mới:</span>
                <kbd style={{ padding: '2px 6px', background: 'var(--tint)', borderRadius: 4 }}>Ctrl + Shift + S</kbd>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>Chuyển sang sửa:</span>
                <kbd style={{ padding: '2px 6px', background: 'var(--tint)', borderRadius: 4 }}>Ctrl + E</kbd>
              </div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>Đóng form:</span>
                <kbd style={{ padding: '2px 6px', background: 'var(--tint)', borderRadius: 4 }}>Esc</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phần trên: Thông tin chung kiểu AMIS */}
      <div className="stack" style={{ gap: 14 }}>
        {/* Hàng chọn hình thức thanh toán & hoá đơn cho nhóm mua/bán */}
        {bo.tt && (
          <section className="card" style={{ padding: '10px 16px' }}>
            <div className="row" style={{ gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Thanh toán:</span>
                <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="radio"
                    name="hinhThucTt"
                    disabled={!dangSua}
                    checked={hinhThucTt === 'congno'}
                    onChange={() => setHinhThucTt('congno')}
                  />
                  Chưa thanh toán
                </label>
                <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="radio"
                    name="hinhThucTt"
                    disabled={!dangSua}
                    checked={hinhThucTt === 'tienmat'}
                    onChange={() => setHinhThucTt('tienmat')}
                  />
                  Tiền mặt ngay
                </label>
                <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="radio"
                    name="hinhThucTt"
                    disabled={!dangSua}
                    checked={hinhThucTt === 'chuyenkhoan'}
                    onChange={() => setHinhThucTt('chuyenkhoan')}
                  />
                  Chuyển khoản ngay
                </label>
              </div>

              {/* Trả tiền ngay: chọn quỹ tiền mặt hoặc quỹ ngân hàng (T78) */}
              {hinhThucTt !== 'congno' && (
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{hinhThucTt === 'tienmat' ? 'Quỹ tiền mặt' : 'Quỹ ngân hàng'}:</span>
                  {dangSua ? (
                    <ChonDanhMuc dm={hinhThucTt === 'tienmat' ? 'quyTm' : 'tkNh'} nhan={hinhThucTt === 'tienmat' ? 'quỹ tiền mặt' : 'quỹ ngân hàng'}
                      className="inp sm" value={quy} onChange={setQuy} ds={dsQuy} />
                  ) : <input className="inp sm" readOnly value={quy} />}
                </div>
              )}

              <span className="grow" />

              <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  disabled={!dangSua}
                  checked={nhanKemHd}
                  onChange={e => setNhanKemHd(e.target.checked)}
                />
                {nhom === 'mua' ? 'Nhận kèm hoá đơn' : 'Lập kèm hoá đơn'}
              </label>
            </div>
          </section>
        )}

        {/* Khối thông tin chung 3 cột: Đối tượng / Thông tin phụ / Chứng từ */}
        <section className="card" style={{ padding: '14px 16px' }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: coHdDau ? 'minmax(0, 1.4fr) minmax(0, 1.2fr) 260px 280px' : 'minmax(0, 1.4fr) minmax(0, 1.2fr) 280px',
              gap: 16,
              alignItems: 'start',
            }}
          >
            {/* Cột 1: Đối tượng; phiếu chuyển quỹ thì là quỹ đi, quỹ đến */}
            <div className="stack" style={{ gap: 10 }}>
              {nhom === 'cq' ? (
                <>
                  {oQuyCq('Từ quỹ', tuQuy, setTuQuy)}
                  {oNguoiTh}
                </>
              ) : (<>
              {laTien && dsQuy.length > 0 && (
                <div className="f">
                  <label>{nhom === 'thu' || nhom === 'chi' ? 'Quỹ tiền mặt' : 'Quỹ ngân hàng'} <em>*</em></label>   {/* thu, chi ngân hàng ghi Quỹ ngân hàng (T77, T78) */}
                  {dangSua ? (
                    <ChonDanhMuc dm={nhom === 'thu' || nhom === 'chi' ? 'quyTm' : 'tkNh'} nhan={nhom === 'thu' || nhom === 'chi' ? 'quỹ tiền mặt' : 'quỹ ngân hàng'}
                      value={quy} onChange={setQuy} ds={dsQuy} />
                  ) : (
                    <input className="inp" readOnly value={quy} />
                  )}
                </div>
              )}
              <div className="f">
                <label>{laTien ? 'Đối tượng' : cfg.nhan ?? 'Đối tượng'} <em>*</em></label>
                {dangSua ? (
                  <ChonDanhMuc dm={dmDt} nhan={(laTien ? 'đối tượng' : cfg.nhan ?? 'đối tượng').toLowerCase()} value={doiTuong} onChange={chonDoiTuong}
                    ds={dsDt.includes(doiTuong) || !doiTuong ? dsDt : [doiTuong, ...dsDt]} />
                ) : (
                  <input className="inp" readOnly value={doiTuong} />
                )}
              </div>
              <div className="f">
                <label>{laTien ? 'Người giao dịch' : nhom === 'mua' ? 'Người giao hàng' : nhom === 'ban' ? 'Người mua hàng' : 'Người giao / nhận'}</label>
                {dangSua ? (
                  <input
                    className="inp"
                    value={nguoiGiao}
                    onChange={e => setNguoiGiao(e.target.value)}
                  />
                ) : (
                  <input className="inp" readOnly value={nguoiGiao} />
                )}
              </div>
              {!keoGc && oDiaChi}
              </>)}
            </div>

            {/* Cột 2: lý do, nhân viên, mã số thuế, hạn thanh toán */}
            <div className="stack" style={{ gap: 10 }}>
              {oLy && (
                <div className="f">
                  <label>{oLy.nhan}</label>
                  {dangSua ? (
                    <ChonDanhMuc dm={`ly:${oLy.nhan}`} nhan={oLy.nhan.toLowerCase()} value={lyDo} onChange={chonLyDo} ds={oLy.ds!} />
                  ) : (
                    <input className="inp" readOnly value={lyDo} />
                  )}
                </div>
              )}
              {/* Chuyển quỹ: hàng 1 Từ quỹ, Đến quỹ; hàng 2 Người thực hiện, Ghi chú (T77) */}
              {nhom === 'cq' && oQuyCq('Đến quỹ', denQuy, setDenQuy)}
              {keoGc && oDiaChi}
              {!laTien && (
                <div className="f">
                  <label>Nhân viên thực hiện</label>
                  {dangSua ? (
                    <ChonDanhMuc dm="nv" nhan="nhân viên" value={nhanVien} onChange={setNhanVien}
                      ds={NHAN_VIEN.map(n => ({ v: n.ten, t: `${n.ten} (${n.bp})` }))} />
                  ) : <input className="inp" readOnly value={nhanVien} />}
                </div>
              )}
              {nhom !== 'cq' && <div className="row" style={{ gap: 10 }}>
                <div className="f" style={{ flex: 1 }}>
                  <label>Mã số thuế</label>
                  {dangSua ? (
                    <input
                      className="inp"
                      value={mst}
                      onChange={e => setMst(e.target.value)}
                    />
                  ) : (
                    <input className="inp" readOnly value={mst} />
                  )}
                </div>
                {bo.tt && hinhThucTt === 'congno' && (
                  <div className="f" style={{ flex: 1 }}>
                    <label>Hạn thanh toán</label>
                    {dangSua ? (
                      <input
                        className="inp"
                        value={hanTt}
                        onChange={e => setHanTt(e.target.value)}
                      />
                    ) : (
                      <input className="inp" readOnly value={hanTt} />
                    )}
                  </div>
                )}
              </div>}
              {!keoGc && oGhiChu}
            </div>

            {/* Mua tích Nhận kèm hoá đơn, bán tích Lập kèm hoá đơn: thông tin hoá đơn thành một cột trước cột ngày, số phiếu, ba hàng đều với hai cột trái (T62, T68, T83) */}
            {coHdDau && (
              <div className="stack ct-hd-dau" style={{ gap: 10 }}>
                <div className="row" style={{ gap: 10 }}>
                  <div className="f" style={{ flex: 1 }}>
                    <label>Mẫu số HĐ <em>*</em></label>
                    <input className="inp" defaultValue="1" readOnly={!dangSua} />
                  </div>
                  <div className="f" style={{ flex: 1 }}>
                    <label>Ký hiệu HĐ <em>*</em></label>
                    <input className="inp code" value={kyHieuHd} onChange={e => setKyHieuHd(e.target.value)} readOnly={!dangSua} />
                  </div>
                </div>
                <div className="f">
                  <label>Số hoá đơn <em>*</em></label>
                  <input className="inp code" value={soHd} onChange={e => setSoHd(e.target.value)} readOnly={!dangSua} />
                </div>
                <div className="f">
                  <label>Ngày hoá đơn <em>*</em></label>
                  {dangSua ? <ONgay value={ngayHd} onChange={setNgayHd} /> : <input className="inp" readOnly value={ngayHd} />}
                </div>
              </div>
            )}

            {/* Cột 3: Ngày chứng từ, số chứng từ. Chi nhánh hiện trên đầu form. Ghi chú kéo dài thì cột này chiếm cả hàng Ghi chú (T78) */}
            <div className="stack" style={{ gap: 10, gridRow: keoGc ? 'span 2' : undefined }}>
              <div className="f">
                <label>Ngày chứng từ <em>*</em></label>
                {dangSua && laTien ? (
                  <ONgay value={ngayCt} onChange={setNgayCt} />
                ) : dangSua ? (
                  <input
                    className="inp"
                    value={ngayCt}
                    onChange={e => setNgayCt(e.target.value)}
                  />
                ) : (
                  <input className="inp" readOnly value={ngayCt} />
                )}
              </div>
              <div className="f">
                <label>{bo.so ?? 'Số chứng từ'}</label>
                <input className="inp code" readOnly value={soCt} />
              </div>
              {/* Gói dưới Pro: một kho cho cả phiếu, chọn trong kho của chi nhánh lập phiếu (T83) */}
              {khoDau && (
                <div className="f">
                  <label>{(nhom === 'ban') !== (cfg.prefix === 'TLN' || cfg.prefix === 'TL') ? 'Kho xuất' : 'Kho nhập'} <em>*</em></label>   {/* trả lại hàng mua thì xuất, trả lại hàng bán thì nhập */}
                  {dangSua ? (
                    <ChonDanhMuc dm="kho" nhan="kho" value={kho} onChange={setKho} ds={!kho || dsKhoCn.includes(kho) ? dsKhoCn : [kho, ...dsKhoCn]} />
                  ) : <input className="inp" readOnly value={kho} />}
                </div>
              )}
              {coThangLl && (
                <div className="f">
                  <label>Tháng hạch toán lãi lỗ</label>
                  {dangSua ? (
                    <Select className="inp" value={thangLl} onChange={e => setThangLl(e.target.value)}>
                      {dsThangLl.map(x => <option key={x} value={x}>Tháng {x}</option>)}
                    </Select>
                  ) : (
                    <input className="inp" readOnly value={`Tháng ${thangLl}`} />
                  )}
                </div>
              )}
            </div>
            {keoGc && oGhiChu}
          </div>
        </section>

        {/* Khối Tabs chi tiết */}
        <section className="card">
          <div className="tabs">
            {tabs.map(([k, l]) => (
              <button
                key={k}
                type="button"
                className={tab === k ? 'on' : ''}
                onClick={() => setTab(k)}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Tab 1: Chi tiết / Hàng tiền */}
          {tab === 'ct' && (
            <BangSua
              cfg={cfg}
              dong={dsDong}
              onChange={setDsDong}
              cheDo={dangSua ? 'sua' : 'xem'}
              coTk={hienTk}
              nhanTk={nhanTkDong}
              coKho={Boolean(bo.kho) && !khoDau}
              khoMacDinh={khoMotCn || 'Kho tổng'}
              coNhapKho={nhom === 'mua' && Boolean(bo.tongNhap)}
              coCk={Boolean(bo.ck)}
              coLo={nhom === 'mua' && s.goi === 'PR'}   // số lô, hạn dùng chỉ có ở gói Pro (T68)
              coKm={kieu !== 'khong'}
              lyDo={oLy ? { nhan: oLy.nhan, ds: oLy.ds!, macDinh: lyDo } : undefined}
              dtMacDinh={laTien ? doiTuong : ''}
              an={anCot}
              khongTong={laTien && chiTien}
            />
          )}

          {/* Tab 2: Hoá đơn */}
          {tab === 'hd' && (
            <div style={{ padding: 16 }}>
              <div className="form-grid" style={{ maxWidth: 720 }}>
                <div className="f">
                  <label>Mẫu số hoá đơn</label>
                  <input className="inp" defaultValue="1" disabled={!dangSua} />
                </div>
                <div className="f">
                  <label>Ký hiệu hoá đơn</label>
                  <input className="inp code" value={kyHieuHd} onChange={e => setKyHieuHd(e.target.value)} disabled={!dangSua} />
                </div>
                <div className="f">
                  <label>Số hoá đơn</label>
                  <input className="inp code" value={soHd} onChange={e => setSoHd(e.target.value)} disabled={!dangSua} />
                </div>
                <div className="f">
                  <label>Ngày hoá đơn</label>
                  <input className="inp" value={ngayHd} onChange={e => setNgayHd(e.target.value)} disabled={!dangSua} />
                </div>
                <div className="f c2">
                  <label>Nhà phát hành / Cơ quan thuế</label>
                  <input className="inp" defaultValue="iPOS Invoice điện tử có mã của cơ quan thuế" readOnly />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Hạch toán */}
          {tab === 'ht' && (
            <div style={{ padding: 14 }}>
              <HachToan
                cfg={cfg}
                tien={tongTien - tongCk}
                thue={tongThue}
                dt={doiTuong}
                cn={chiNhanh}
                tkDoiUng={tkDoiUng}
              />
            </div>
          )}

          {/* Tab 4: Đính kèm */}
          {tab === 'dk' && (
            <div className="empty" style={{ padding: 32 }}>
              <div style={{ marginBottom: 8, opacity: 0.5 }}><Icon n="upload" className="ic lg" /></div>
              <b>Chưa có tệp đính kèm</b>
              Kéo thả hoá đơn điện tử, phiếu giao nhận vào đây (PDF, XML, JPG)
            </div>
          )}

          {/* Tab 5: Lịch sử thao tác */}
          {tab === 'ls' && <LichSu goi={s.goi} moi={moi} man={`${mod.key}/${sc.slug}`} id={String(row?.id ?? '')} />}

          {/* Khối tổng cộng góc dưới phải; phiếu thu chi để Tổng tiền ở dải đáy form */}
          {chiTien && laTien ? null : chiTien ? (
            <div className="tot" style={{ borderTop: '1px solid var(--line)', marginTop: 12 }}>
              <span>Tổng tiền</span>
              <b className="big" style={{ color: 'var(--blue)' }}>{moneyD(tongThanhToan)}</b>
            </div>
          ) : (
          <div className="tot" style={{ borderTop: '1px solid var(--line)', marginTop: 12 }}>
            <span>Tiền hàng</span>
            <b>{moneyD(tongTien)}</b>
            {bo.ck && tongCk > 0 && (
              <>
                <span>Chiết khấu</span>
                <b style={{ color: 'var(--red)' }}>-{moneyD(tongCk)}</b>
              </>
            )}
            {tongThue > 0 && (
              <>
                <span>Tiền thuế GTGT</span>
                <b>{moneyD(tongThue)}</b>
              </>
            )}
            {bo.tongNhap && (
              <>
                <span>Giá trị nhập kho</span>
                <b>{moneyD(tongTien - tongCk)}</b>
              </>
            )}
            <span>Tổng thanh toán</span>
            <b className="big" style={{ color: 'var(--blue)' }}>{moneyD(tongThanhToan)}</b>
          </div>
          )}
        </section>

        {children}
      </div>
    </FormToanMan>
  )
}

/** Các quỹ chuyển qua lại trên phiếu chuyển quỹ: quỹ tiền mặt từng chi nhánh, rồi tài khoản ngân hàng */
const QUY_TIEN = [
  ...CHI_NHANH.map(c => `Quỹ tiền mặt ${c.ngan}`),
  ...TK_NGAN_HANG.map(t => `${t.nh.split(',')[0]} ${t.so}`),
]

/** Đoán lý do thu, chi từ diễn giải; không khớp thì lấy lý do cuối danh sách (Thu khác, Chi phí khác) */
const LY_THEO_DG: [string, string][] = [
  ['thue', 'Chi phí khác'], ['no khach', 'Thu nợ khách hàng'], ['tra no', 'Thu nợ khách hàng'], ['ban hang', 'Thu tiền bán hàng'],
  ['dat tiec', 'Thu tiền bán hàng'], ['tien don', 'Thu tiền bán hàng'], ['tam ung', 'Chi tạm ứng'], ['tra tien', 'Trả tiền nhà cung cấp'],
  ['mua', 'Chi mua nguyên vật liệu'], ['luong', 'Chi trả lương'],
]
/** Ô ngày chứng từ: gõ dd/mm/yyyy hoặc bấm biểu tượng lịch để chọn (T49) */
function ONgay({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const o = useRef<HTMLDivElement>(null)
  const [mo, setMo] = useState(false)
  return (
    <div className="ct-ngay" ref={o}>
      <input className="inp" value={value} placeholder="dd/mm/yyyy" onChange={e => onChange(e.target.value)} onClick={() => setMo(true)} />
      <button type="button" className="ct-ngay-nut" title="Chọn ngày" aria-label="Chọn ngày" onClick={() => setMo(m => !m)}>
        <Icon n="calendar" className="ic sm" />
      </button>
      <Popover anchor={o} open={mo} onClose={() => setMo(false)} align="start" width={272} className="dp-pop">
        <LichDon value={value} onChange={v => { onChange(v); setMo(false) }} onDong={() => setMo(false)} />
      </Popover>
    </div>
  )
}

/** Tổng tiền ở dải đáy form, số thẳng mép cột Thành tiền của bảng chi tiết; không thấy bảng thì nằm sát phải (T49) */
function TongDay({ tong, soDong }: { tong: number; soDong: number }) {
  const o = useRef<HTMLSpanElement>(null)
  const [phai, setPhai] = useState<number>()
  useEffect(() => {
    const day = o.current?.parentElement
    const than = day?.parentElement?.querySelector<HTMLElement>('.fsf-b')
    if (!day || !than) return
    const tinh = () => {
      const th = [...than.querySelectorAll<HTMLElement>('table thead th')].find(x => x.textContent?.trim() === 'Thành tiền')
      if (!th) { setPhai(undefined); return }
      const r = th.getBoundingClientRect(), d = day.getBoundingClientRect()
      setPhai((d.right - r.right) / heSoZoom() + (parseFloat(getComputedStyle(th).paddingRight) || 0))
    }
    tinh()
    const ro = new ResizeObserver(tinh)
    ro.observe(than)
    const bang = than.querySelector('table')
    if (bang) ro.observe(bang)
    const mo = new MutationObserver(tinh)
    mo.observe(than, { childList: true, subtree: true })
    than.addEventListener('scroll', tinh, { capture: true, passive: true })
    return () => { ro.disconnect(); mo.disconnect(); than.removeEventListener('scroll', tinh, { capture: true }) }
  }, [])
  return (
    <span ref={o} className="fsf-day-tong" style={phai !== undefined ? { right: phai } : undefined}>
      Tổng tiền ({soDong} dòng) <b>{money(tong)}</b>
    </span>
  )
}

/** Tháng hạch toán lãi lỗ chọn được: tháng của ngày chứng từ rồi lùi về các tháng trước, dừng ở tháng đã khoá sổ */
function thangLaiLo(ngay: string): string[] {
  const [, m0, y0] = ngay.split('/').map(Number)
  if (!m0 || !y0) return []
  const ds: string[] = []
  for (let m = m0, y = y0; ds.length < 24; m--) {
    if (m === 0) { m = 12; y-- }
    if (ds.length && (y < KHOA_SO_DEN.nam || (y === KHOA_SO_DEN.nam && m <= KHOA_SO_DEN.thang))) break
    ds.push(`${String(m).padStart(2, '0')}/${y}`)
  }
  return ds
}

export function lyMacDinh(ds: string[], dg: string) {
  const l = fold(dg)
  return LY_THEO_DG.find(([tu, ly]) => l.includes(tu) && ds.includes(ly))?.[1] ?? ds[ds.length - 1] ?? ''
}

/** Hạch toán theo chế độ: TT152 không hạch toán, TT58 ghi sổ, TT133/TT99 Nợ/Có */
export function HachToan({
  cfg,
  tien,
  thue,
  dt,
  cn,
  tkDoiUng,
}: {
  cfg: VoucherCfg
  tien: number
  thue: number
  dt: string
  cn: string
  tkDoiUng?: string
}) {
  const { s } = useSession()
  const cd = cheDoHienTai(s)
  const kieu = kieuGhiSo(cd.ma)
  if (kieu === 'khong') {
    return (
      <Note kind="gray" icon="info">
        Gói Free chưa áp chế độ kế toán nên phiếu không sinh bút toán. Số tiền vẫn vào sổ quỹ và sổ công nợ.{' '}
        <Link to="/app/he-thong/goi-thue-bao">So sánh gói</Link>
      </Note>
    )
  }

  if (kieu === 'so') {
    const rowsTT58 = [
      { so: cfg.soTT58 ?? 'Sổ chi phí sản xuất, kinh doanh', cot: 'Phát sinh', tien },
      ...(thue ? [{ so: 'Sổ theo dõi thuế', cot: 'Thuế GTGT', tien: thue }] : []),
      { so: 'Sổ tiền', cot: 'Thu, chi', tien: tien + thue },
    ]
    return (
      <div className="stack" style={{ gap: 10 }}>
        <Note icon="book">Gói Standard theo {CHE_DO.TT58.soHieu}: không dùng tài khoản Nợ/Có. Phiếu ghi thẳng vào sổ.</Note>
        <Table
          cols={[{ k: 'so', t: 'Ghi vào sổ' }, { k: 'cot', t: 'Cột' }, { k: 'tien', t: 'Số tiền', num: true }]}
          rows={rowsTT58}
          sum={{ so: 'Cộng', tien: rowsTT58.reduce((a, x) => a + x.tien, 0) }}
        />
      </div>
    )
  }

  const mau = cfg.noCo ?? [['642', '111', 'Chi phí']]
  const rows = mau.map(([no, co, dg]) => {
    const l = fold(dg)
    const v = l.includes('thue')
      ? thue
      : l.includes('gia von')
      ? Math.round(tien * 0.35)
      : l.includes('thanh toan')
      ? tien + thue
      : tien

    // Nếu có tkDoiUng thì thay thế TK công nợ
    let noFinal = no
    let coFinal = co
    if (tkDoiUng) {
      if (co === '331' || co === '111' || co === '112') coFinal = tkDoiUng
      if (no === '131' || no === '111' || no === '112') noFinal = tkDoiUng
    }

    // Số hiệu hiển thị theo chế độ: bộ định khoản lưu theo TT133
    return { no: tkTheoCheDo(noFinal, cd.ma).so, co: tkTheoCheDo(coFinal, cd.ma).so, dg, tien: v, dt, cn }
  }).filter(r => r.tien > 0)

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row" style={{ fontSize: 12.5 }}>
        <Icon n="book" className="ic sm" />Định khoản theo bộ mặc định ngành F&B, chế độ {cd.soHieu}. Sửa được trước khi ghi sổ.
      </div>
      <Table
        cols={[
          { k: 'dg', t: 'Diễn giải' },
          { k: 'no', t: 'TK Nợ', cls: 'code', w: 80 },
          { k: 'co', t: 'TK Có', cls: 'code', w: 80 },
          { k: 'tien', t: 'Số tiền', num: true },
          { k: 'dt', t: 'Đối tượng', cls: 'dim' },
          { k: 'cn', t: 'Chi nhánh', cls: 'dim' },
        ]}
        rows={rows}
        sum={{ dg: 'Cộng', tien: rows.reduce((a, r) => a + r.tien, 0) }}
      />
    </div>
  )
}

/** Nhật ký từng phiếu ghi nhận ở mọi gói, kể cả Free: thêm mới, sửa, xoá trong phiên ở trên, lịch sử mẫu ở dưới (T51).
 *  Màn Nhật ký thao tác chung (X2) vẫn theo gói */
export function LichSu({ goi, moi, man, id }: { goi: Goi; moi: boolean; man: string; id: string }) {
  const phien = useNhatKy(man, id)
  if (moi) return <div className="empty"><b>Chứng từ chưa lưu</b></div>
  return (
    <Table
      cols={[{ k: 'luc', t: 'Thời điểm', w: 140 }, { k: 'ai', t: 'Người làm' }, { k: 'viec', t: 'Thao tác' }]}
      rows={[
        ...phien,
        // Phiếu thêm trong phiên chỉ có nhật ký thật; phiếu có sẵn kèm lịch sử mẫu
        ...(id.startsWith('moi-') ? [] : [
        { luc: '07/10/2026 10:05', ai: 'Lê Quốc Bảo', viec: kieuGhiSo(goi) === 'khong' ? 'Lưu chứng từ' : 'Ghi sổ' },
        { luc: '07/10/2026 09:58', ai: 'Lê Quốc Bảo', viec: 'Sửa diễn giải' },
        { luc: '06/10/2026 23:30', ai: 'Đồng bộ tự động', viec: 'Tạo chứng từ từ dữ liệu đồng bộ' },
        ]),
      ]}
    />
  )
}

// Giữ tương thích với VoucherDetail
export const VoucherDetail = ChungTuForm
