// Form chứng từ toàn màn hình theo bố cục AMIS
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps, VoucherCfg } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { cuaHangHienTai, useSession, cheDoHienTai, ngayDauNam, truocDauNam, donViHienTai, loaiHinhDv } from '../../app/session'
import { kieuGhiSo, type Goi } from '../../app/plan'
import { CHE_DO, type CheDo } from '../../app/che-do'
import { tkTheoCheDo } from '../../modules/tong-hop/so-cai'
import { CUA_HANG, KHACH, KHO, KHOA_SO_DEN, LY_CAN_DOI_TUONG, LY_CHI_PHI, LY_DO, NCC, NHAN_VIEN, TK_NGAN_HANG, daKhoaSo } from '../../data/mock'
import { DS_PTTT } from '../../modules/danh-muc/data'
import { HopXacNhan } from '../LocNangCao'
import { bayGio, ctTtCon, dsDcCon, dsTtCon, ghiNhatKy, soDaTra, soKeTiep, suaPhieu, themPhieu, ttThamChieu, useNhatKy, xoaPhieu, type CtTt, type PhieuTt } from './daXoa'
import { Icon } from '../Icon'
import { HopPhimTat, phimDong } from '../BangPhimTat'
import { Card, Note } from '../Page'
import { FormToanMan, useDong } from '../FormToanMan'
import { Dropdown, MenuHead, MenuItem, Popover, Select } from '../Dropdown'
import { LichDon, ONgay } from '../ChonNgay'
import { ChonDanhMuc } from '../ChonDanhMuc'
import { heSoZoom } from '../zoom'
import { St, Table } from '../Table'
import { fold, money, moneyD } from '../format'
import { NGUON, TT_CT, dongCua, tkTheoLyDo, ttNghiepVu, type Dong } from './gen'
import { boO, nhomCua, theoLoai } from './nhom'
import { BangKiemKe, COT_KK } from './BangKiemKe'
import { MAN_DC, phieuDieuChinh, type LoaiDc } from '../../modules/kho/dieu-chinh'
import { BangSanXuat, OThamChieuSx, cotSx } from '../../modules/kho/BangSanXuat'
import { SX, TT_SX, dongNhapTuXuat, type DongSx } from '../../modules/kho/san-xuat'
import { BangDieuChuyen, DauDieuChuyen, cotDcn } from '../../modules/kho/BangDieuChuyen'
import { DCN, dongNhapDc, type DongDcn } from '../../modules/kho/dieu-chuyen'
import { BangSua, DS_DOI_TUONG, HopCotPhieu, cotTuyChon } from './BangSua'
import { HopInChungTu, type PhieuIn } from '../bao-cao/InChungTu'
import { createPortal } from 'react-dom'
import { theMauTheoGoc } from '../../modules/ccdc'

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
  // Phiếu thu, chi đồng bộ từ FABi chỉ xem: sửa, xoá ở FABi (T283)
  const tuFabi = mod.key === 'tien' && row?.nguon === 'FABi'
  const khoaKy = !moi && !!row && daKhoaSo(row.ngay)   // phiếu thuộc tháng đã khoá sổ: chỉ xem, không sửa, không xoá (T315)
  const [dangSua, setDangSua] = useState(moi || (sp.get('sua') === '1' && !tuFabi && !khoaKy))
  const [tab, setTab] = useState('ct')
  const [moLoc, setMoLoc] = useState(false)   // hàng lọc của bảng chi tiết, bấm nút Lọc mới hiện (T383)
  const [hienTk, setHienTk] = useState(false)
  const [modalPhim, setModalPhim] = useState(false)
  const [phieuIn, setPhieuIn] = useState<PhieuIn[] | null>(null)
  const [hoiXoa, setHoiXoa] = useState(false)
  const [hoiDong, setHoiDong] = useState(false)   // phiếu đang thêm mới: hỏi lại trước khi Huỷ, đóng (T125)

  const loai = cfgMan.loai?.find(x => x.k === (row?.loai ?? sp.get('loai'))) ?? cfgMan.loai?.[0]
  const cfg = theoLoai(cfgMan, loai?.k)
  const nhom = nhomCua(mod.key, cfg, loai?.k)
  const bo = boO(nhom, cfg)
  const laKk = Boolean(cfg.kiemKe)   // phiếu kiểm kê: bỏ đối tượng, kho ở đầu phiếu, bảng tồn hệ thống, tồn thực tế (T124)
  const laDc = Boolean(cfg.dieuChinh)   // phiếu xuất, nhập điều chỉnh sinh từ kiểm kê (T126)
  const khoaSua = laDc || tuFabi || khoaKy   // không sửa, không xoá (T129, T283, T315)
  // Phiếu sản xuất theo iPOS Inventory (T152): đầu phiếu gọn như kiểm kê, bảng dòng riêng; phiếu nhập bắt buộc tham chiếu phiếu xuất
  const sx = cfg.sanXuat
  const laSx = Boolean(sx)
  const sxNhap = sx ? SX[sx].nhap : false
  // Điều chuyển kho (T155): xuất, nhập điều chuyển giữa cửa hàng; chuyển kho trong cửa hàng, không hạch toán. Đầu phiếu, bảng dòng riêng
  const dcn = cfg.dieuChuyen
  const laDcn = Boolean(dcn)
  // Phiếu nhập bắt buộc tham chiếu phiếu xuất (sản xuất T152, điều chuyển T155); manDoi là màn của phiếu xuất
  const coTcNhap = sxNhap || dcn === 'ndc'
  const manDoi = sx ? SX[SX[sx].doi!].man : dcn === 'ndc' ? DCN.xdc.man : ''
  const coTtXn = laSx || dcn === 'xdc' || dcn === 'ndc'   // có trạng thái Chờ nhập, Đã nhập, Đã huỷ
  const gonDau = laKk || laDc || laSx || laDcn    // đầu phiếu gọn: Kho, Nhân viên thực hiện; Ghi chú
  // Phiếu điều chỉnh (T131): không có thuế; gói Free không hiện giá trị (đơn giá, thành tiền, tổng tiền)
  const anDc = laDc ? ['ts', 'thue', ...(s.goi === 'F' ? ['gia', 'tien'] : [])] : []
  const nv = useMemo(() => (row ? ttNghiepVu(row) : null), [row])

  const path = duongDan(mod, sc)
  const dongForm = useDong(path)
  // Phiếu đang thêm mới chưa lưu: Huỷ, nút X, Esc đều hỏi lại trước khi bỏ (T125)
  const dongMoi = () => (moi ? setHoiDong(true) : dongForm())
  const kieu = kieuGhiSo(s.cheDo)
  const coTkGoi = kieuGhiSo(s.cheDo) === 'noco'

  // Trạng thái thanh toán cho mua/bán
  const [hinhThucTt, setHinhThucTt] = useState<'congno' | 'tienmat' | 'chuyenkhoan'>(
    (row?._httt as 'congno' | 'tienmat' | 'chuyenkhoan' | undefined) ?? (nv?.ttTien === 'da' ? 'tienmat' : 'congno')
  )
  const [pttt, setPttt] = useState<string>((row?._pttt as string | undefined) ?? 'Tiền mặt')
  // Phiếu đã lưu trong phiên giữ đủ các ô đầu phiếu ở row._xxx (T69), không lấy lại dữ liệu mẫu
  const luuCu = (k: string) => (row?.[`_${k}`] as string | undefined)
  const [nhanKemHd, setNhanKemHd] = useState(row?._nhanKemHd !== undefined ? Boolean(row._nhanKemHd) : nv?.ttHd === 'da' || row?.nguon === 'HĐ')

  // Dữ liệu dòng
  const idSeed = row ? `${sc.code ?? sc.slug}-${row.id}` : 'moi'
  const dongGoc = useMemo(() => (
    moi ? (laSx || laDcn ? [] : dongCua(cfg, `mau-${loai?.k ?? ''}`).slice(0, 1)) : (row?._dong as Dong[] | undefined) ?? dongCua(cfg, idSeed)   // phiếu sản xuất mới chưa có dòng tới khi chọn kho, tham chiếu (T152)
  ), [idSeed, loai?.k, moi])

  const [dsDong, setDsDong] = useState<Dong[]>(dongGoc)
  useEffect(() => {
    setDsDong(dongGoc)
  }, [dongGoc])

  const laTien = mod.key === 'tien'
  // Cập nhật TK nợ/có trên dòng theo hình thức thanh toán
  const tkDoiUng = hinhThucTt === 'tienmat' ? '1111' : hinhThucTt === 'chuyenkhoan' ? '1121' : (nhom === 'mua' ? '331' : '131')
  const nhanTkDong: [string, string] = laTien
    ? ['TK Nợ', 'TK Có']
    : nhom === 'mua'
      ? [bo.tk[0], hinhThucTt === 'congno' ? 'TK công nợ (331)' : hinhThucTt === 'tienmat' ? 'TK tiền mặt (1111)' : 'TK tiền gửi (1121)']
      : [hinhThucTt === 'congno' ? 'TK công nợ (131)' : hinhThucTt === 'tienmat' ? 'TK tiền mặt (1111)' : 'TK tiền gửi (1121)', bo.tk[1]]

  // Thông tin chung
  const [ngayCt, setNgayCt] = useState(row?.ngay ? String(row.ngay) : laSx || laDcn ? bayGio() : '07/10/2026')   // phiếu sản xuất ghi cả giờ xuất, nhập như IVT (T152)
  const [soCt, setSoCt] = useState(row?.so ? String(row.so) : soKeTiep(`${mod.key}/${sc.slug}`, `${cfg.prefix}2610-`))
  // Cửa hàng không sửa trên form: phiếu cũ giữ cửa hàng đã lập, phiếu mới theo cửa hàng chọn trên thanh trên
  // Thêm mới có ?cn=mã cửa hàng (vd Thanh toán ngay ở dòng cửa hàng của báo cáo công nợ NCC, T308) thì lập cho cửa hàng đó, không hỏi chọn
  const cnChon = (moi && CUA_HANG.find(c => c.id === sp.get('cn'))) || cuaHangHienTai(s)
  const cuaHang = row?.cn ? String(row.cn) : cnChon?.ten ?? ''
  const canChonCn = moi && !cnChon
  // Thêm mới có ?dt=tên đối tượng (vd Thanh toán ngay ở báo cáo công nợ, T304) thì điền sẵn đối tượng đó
  const [doiTuong, setDoiTuong] = useState(row?.doiTuong ? String(row.doiTuong) : (moi && sp.get('dt')) || (cfg.doiTuong === 'ncc' ? NCC[0].ten : cfg.doiTuong === 'kh' ? KHACH[0].ten : ''))
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
  // Lý do mặc định khi thêm mới: theo mã lý do trên đường dẫn (?ly=mã lý do Chi phí chờ phân bổ, vd mở từ sơ đồ Chi phí phân bổ), không có thì đoán từ diễn giải
  const lyUrl = moi ? LY_DO.find(x => x.ma === sp.get('ly'))?.ten : undefined
  const lyGoc = (dg: string) => lyUrl && oLy?.ds?.includes(lyUrl) ? lyUrl : lyMacDinh(oLy?.ds ?? [], dg)
  const [hoiThe, setHoiThe] = useState<{ moMoi: boolean; idMoi: string; tu: Record<string, unknown> } | null>(null)
  // Lập phiếu từ gợi ý sau khi tạo quỹ ở trang chủ: lưu xong hỏi quay lại trang chủ làm tiếp (T250)
  const [goiYVe] = useState(() => Boolean((loc.state as { goiYVeTrangChu?: boolean } | null)?.goiYVeTrangChu))
  const [hoiVe, setHoiVe] = useState<{ moMoi: boolean; idMoi: string } | null>(null)
  const [lyDo, setLyDo] = useState(() => row?._lyDo ? String(row._lyDo) : lyGoc(dienGiai))
  const canDt = LY_CAN_DOI_TUONG.includes(lyDo)   // lý do bắt buộc chọn đối tượng (T330)
  // Phiếu chuyển quỹ: quỹ đi và quỹ đến. Rút tiền ngân hàng thì đi từ tài khoản về quỹ tiền mặt
  const quyTm = `Quỹ tiền mặt ${CUA_HANG.find(c => c.ten === cuaHang)?.ngan ?? CUA_HANG[0].ngan}`
  const rut = fold(dienGiai).includes('rut tien')
  const [tuQuy, setTuQuy] = useState(rut ? QUY_TIEN[CUA_HANG.length] : quyTm)
  const [denQuy, setDenQuy] = useState(rut ? quyTm : QUY_TIEN[CUA_HANG.length])
  useEffect(() => {
    setLyDo(row?._lyDo ? String(row._lyDo) : lyGoc(row?.dienGiai ? String(row.dienGiai) : cfg.dienGiai[0]))
  }, [loai?.k, row?.id])
  // Thu chi tiền mặt và ngân hàng (T346)
  const laThuChiTien = laTien && (loai?.k === 'thu' || loai?.k === 'chi' || loai?.k === 'bc' || loai?.k === 'unc')
  const khoaLyDtFree = s.goi === 'F' && laThuChiTien

  // Gói Free phiếu thu, chi (T346): khi mở xem vẫn hiện đúng dữ liệu đã lưu; khi bấm Sửa hoặc thêm mới thì các dòng lấy theo giá trị phía trên; đổi ô phía trên thì các dòng đổi theo ngay
  useEffect(() => {
    if (khoaLyDtFree && (dangSua || moi)) {
      setDsDong(ds => ds.map(d => ({ ...d, ly: lyDo, dt: doiTuong })))
    }
  }, [khoaLyDtFree, dangSua, moi, lyDo, doiTuong])

  // Phiếu thu, chi (T49): dòng chi tiết có cột lý do theo lý do đầu phiếu; gán thêm tài khoản theo lý do (T233)
  const coTkTheoLy = Boolean(oLy) && loai?.k !== 'cq'
  const loaiPhieuTien = (loai?.k || nhom) as string
  useEffect(() => {
    if (coTkTheoLy) {
      const tkMoi = tkTheoLyDo(loaiPhieuTien, lyDo)
      setDsDong(ds => ds.map(d => ({
        ...d,
        ly: lyDo,
        ...(tkMoi.tkNo ? { tkNo: tkMoi.tkNo } : {}),
        ...(tkMoi.tkCo ? { tkCo: tkMoi.tkCo } : {}),
      })))
    } else if (oLy) {
      setDsDong(ds => ds.map(d => ({ ...d, ly: lyDo })))
    }
  }, [dongGoc, lyDo, coTkTheoLy, loaiPhieuTien])   // không đưa oLy vào: object tạo lại mỗi lần vẽ làm effect chạy lặp
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
  const ghiChuGoc = () => row?._ghiChu ? String(row._ghiChu) : !oLy ? (row?.dienGiai ? String(row.dienGiai) : cfg.dienGiai[0]) : row?._lyDo ? String(row._lyDo) : lyGoc(row?.dienGiai ? String(row.dienGiai) : cfg.dienGiai[0])
  const [ghiChu, setGhiChu] = useState(ghiChuGoc)
  useEffect(() => { setGhiChu(ghiChuGoc()) }, [loai?.k, row?.id])
  function chonLyDo(v: string) {
    setLyDo(v)
    setDienGiai(v)
    setGhiChu(v)
    if (khoaLyDtFree) {
      setDsDong(ds => ds.map(d => ({ ...d, ly: v })))
    }
  }
  // Ô đối tượng chọn từ danh mục theo loại phiếu, thêm mới được ngay tại form (T65)
  const dmDt = laTien ? 'doiTuong' : cfg.doiTuong ?? 'doiTuong'
  const dsDt = laTien ? DS_DOI_TUONG : cfg.doiTuong === 'ncc' ? NCC.map(x => x.ten) : cfg.doiTuong === 'kh' ? KHACH.map(x => x.ten)
    : cfg.doiTuong === 'nv' ? NHAN_VIEN.map(x => x.ten) : cfg.doiTuong === 'cn' ? CUA_HANG.map(x => x.ten) : DS_DOI_TUONG
  // Chọn đối tượng từ danh mục thì điền mã số thuế
  function chonDoiTuong(v: string) {
    setDoiTuong(v)
    const dt = [...KHACH, ...NCC].find(x => x.ten === v)
    if (dt) setMst(dt.mst)
    if (khoaLyDtFree) {
      setDsDong(ds => ds.map(d => ({ ...d, dt: v })))
    }
  }
  // Gói Free: tháng hạch toán lãi lỗ, mặc định tháng của ngày chứng từ, chọn được các tháng trước chưa khoá sổ (T49)
  // Quỹ của phiếu (T51): phiếu tiền mặt chỉ chọn quỹ tiền mặt của cửa hàng lập phiếu, phiếu ngân hàng chọn tài khoản ngân hàng
  // Mua, bán trả tiền ngay (T78): tiền mặt chọn quỹ tiền mặt, chuyển khoản chọn quỹ ngân hàng
  const dsQuy = nhom === 'thu' || nhom === 'chi' || (bo.tt && hinhThucTt === 'tienmat') ? [quyTm]
    : nhom === 'nhthu' || nhom === 'nhchi' || (bo.tt && hinhThucTt === 'chuyenkhoan') ? QUY_TIEN.slice(CUA_HANG.length) : []
  const [quy, setQuy] = useState(() => row?._quy ? String(row._quy) : dsQuy.includes(quyTm) ? quyTm : dsQuy[0] ?? '')
  useEffect(() => { setQuy(row?._quy ? String(row._quy) : dsQuy.includes(quyTm) ? quyTm : dsQuy[0] ?? '') }, [loai?.k, row?.id])
  useEffect(() => { if (!dsQuy.includes(quy)) setQuy(dsQuy[0] ?? '') }, [hinhThucTt])
  // Kho của phiếu mua, bán (T83): gói dưới Pro chọn một kho ở đầu phiếu, gói Pro chọn kho trên từng dòng.
  // Cửa hàng chỉ có một kho thì phiếu mới lấy luôn kho đó
  const dsKhoCn = CUA_HANG.find(c => c.ten === cuaHang)?.kho ?? KHO
  const khoMotCn = dsKhoCn.length === 1 ? dsKhoCn[0] : ''
  const khoDau = bo.kho === 'dong' && (nhom === 'mua' || nhom === 'ban') && s.goi !== 'PR'
  const [kho, setKho] = useState(() => luuCu('kho') ?? (moi ? khoMotCn : dongGoc.find(d => d.kho)?.kho ?? dsKhoCn[0] ?? ''))
  useEffect(() => {
    if (khoDau) setDsDong(ds => ds.map(d => ({ ...d, kho })))
  }, [dongGoc, kho, khoDau])
  // Phiếu nhập sản xuất (T152): chọn phiếu xuất cùng loại đang chờ nhập, lấy kho và dòng kế hoạch theo phiếu xuất, công thức
  const [thamChieuSx, setThamChieuSx] = useState({ id: String(row?._thamChieuId ?? ''), so: String(row?._thamChieu ?? '') })
  // Điều chuyển (T155): cửa hàng, kho nhận của phiếu xuất, chuyển kho; phiếu nhập giữ cửa hàng, kho xuất theo phiếu tham chiếu
  const [khoNhan, setKhoNhan] = useState(String(row?._khoNhan ?? ''))
  const [cnNhan, setCnNhan] = useState(String(row?._cnNhan ?? ''))
  const [nguonDc, setNguonDc] = useState({ cn: String(row?._cnXuat ?? ''), kho: String(row?._khoXuat ?? '') })
  function chonThamChieuSx(px: Row) {
    setThamChieuSx({ id: String(px.id), so: String(px.so) })
    if (laDcn) {   // nhập điều chuyển: kho nhận theo phiếu xuất, thực nhận mặc định bằng số xuất (T155)
      setKho(String(px._khoNhan ?? ''))
      setNguonDc({ cn: String(px.cn ?? ''), kho: String(px._kho ?? '') })
      setDsDong(dongNhapDc(px))
      return
    }
    setKho(String(px._kho ?? ''))
    setDsDong(dongNhapTuXuat(sx!, px))
  }
  const truocThue = nhom === 'mua' && Boolean(bo.tongNhap)   // phiếu mua: các số tiền ở dòng, khối tổng chỉ Tổng tiền (T84)
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
  // Hộ kinh doanh không khấu trừ thuế GTGT đầu vào: Giá trị nhập kho = tiền trước thuế + tiền thuế (T164)
  const hkd = loaiHinhDv(s, donViHienTai(s)) === 'hkd'
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

  // Mua, bán trả tiền ngay (T85): lưu phiếu thì sinh phiếu thu, chi bên Thu chi 2.1.1, phiếu gốc giữ tham chiếu ở _ctTt.
  // Mua, trả lại hàng bán thì chi; bán, trả lại hàng mua thì thu. Đổi hình thức thanh toán thì bỏ chứng từ cũ, về Chưa thanh toán thì xoá
  const ctTtCu = ctTtCon(row)
  const traLai = cfg.prefix === 'TLN' || cfg.prefix === 'TL'
  const chiTt = (nhom === 'mua') !== traLai
  const loaiTt = !bo.tt ? '' : hinhThucTt === 'tienmat' ? (chiTt ? 'chi' : 'thu') : hinhThucTt === 'chuyenkhoan' ? (chiTt ? 'unc' : 'bc') : ''
  const viecTt = nhom === 'mua' ? (traLai ? 'trả lại hàng mua' : 'mua hàng') : (traLai ? 'trả lại hàng bán' : 'bán hàng')
  const dgTt = `${chiTt ? 'Chi' : 'Thu'} tiền ${viecTt} theo ${soCt}`
  const lyTt = nhom === 'mua' ? (traLai ? 'Thu khác' : 'Thanh toán tiền cho nhà cung cấp') : (traLai ? 'Chi phí khác' : 'Thu tiền bán hàng')
  function dongBoCtTt(idGoc: string): CtTt | undefined {
    if (!bo.tt) return ctTtCu
    if (ctTtCu && ctTtCu.loai !== loaiTt) xoaPhieu(MAN_THU_CHI, [{ id: ctTtCu.id, so: ctTtCu.so }], s.ten)
    if (!loaiTt) return undefined
    const dg = dgTt, ly = lyTt
    const nd = {
      ngay: ngayCt, thang: Number(ngayCt.split('/')[1]) || 10, doiTuong, dienGiai: dg, tien: tongThanhToan, thue: 0, tong: tongThanhToan,
      _quy: quy, _lyDo: ly, _ghiChu: dg, _thamChieu: soCt, _thamChieuDi: `${path}/${idGoc}`,   // đường dẫn mở phiếu gốc từ cột Tham chiếu (T127)
      _dong: [{ ma: '', ten: dg, dvt: '', sl: 1, gia: tongThanhToan, tien: tongThanhToan, ts: 0, thue: 0, ly, dt: doiTuong, km: '', cv: '' }],
    }
    if (ctTtCu && ctTtCu.loai === loaiTt) {
      suaPhieu(MAN_THU_CHI, ctTtCu.id, nd)
      return ctTtCu
    }
    const so = soKeTiep(MAN_THU_CHI, `${TIEN_TO_CT_TT[loaiTt]}2610-`)
    const id = `moi-${Date.now()}-tt`
    themPhieu(MAN_THU_CHI, { id, so, cn: cuaHang, nguon: 'tay', tt: kieu === 'khong' ? 'ghi' : 'nhap', loai: loaiTt, tenLoai: TEN_CT_TT[loaiTt], ...nd }, s.ten)
    ghiNhatKy(MAN_THU_CHI, id, so, s.ten, `Thêm mới chứng từ, sinh từ ${soCt}`)
    return { id, so, loai: loaiTt }
  }

  // Kiểm kê (T126): lưu phiếu thì sinh, sửa hoặc xoá phiếu xuất điều chỉnh (dòng thiếu), nhập điều chỉnh (dòng thừa) cho khớp chênh lệch.
  // Phiếu điều chỉnh vào màn Điều chỉnh kho, ghi tham chiếu hai chiều
  function dongBoDc(idKk: string): CtTt[] {
    const cu = dsDcCon(row)
    const kk = { id: idKk, so: soCt, ngay: ngayCt, cn: cuaHang, kho }
    const ra: CtTt[] = []
    for (const l of ['xdc', 'ndc'] as LoaiDc[]) {
      const c = cu.find(x => x.loai === l)
      const p = phieuDieuChinh(kk, dsDong, l, c?.id ?? `moi-${Date.now()}-${l}`)
      if (!p) {
        if (c) xoaPhieu(MAN_DC, [{ id: c.id, so: c.so }], s.ten)
        continue
      }
      if (c) suaPhieu(MAN_DC, c.id, p)
      else {
        themPhieu(MAN_DC, p, s.ten)
        ghiNhatKy(MAN_DC, String(p.id), String(p.so), s.ten, `Thêm mới chứng từ, sinh từ ${soCt}`)
      }
      ra.push({ id: String(p.id), so: String(p.so), loai: l })
    }
    return ra
  }

  // Thanh toán sau (T91): phiếu chưa thanh toán hoặc thanh toán một phần lập thêm phiếu thu, chi theo quỹ chọn, lưu ở _dsTt
  const [hopTt, setHopTt] = useState(false)
  const dsTt = dsTtCon(row)
  const tongGoc = Number(row?.tong) || 0
  const daTra = row ? soDaTra(row) : 0
  const conLai = Math.max(0, tongGoc - daTra)
  const coThanhToanSau = Boolean(bo.tt) && Boolean(row) && hinhThucTt === 'congno' && !dangSua && conLai > 0
  const tenThanhToan = chiTt ? 'Thanh toán ngay' : 'Thu tiền ngay'
  function lapThanhToan(ht: 'tienmat' | 'chuyenkhoan', quyTt: string, ngay: string, tien: number, dg: string) {
    if (!row) return
    const loai = ht === 'tienmat' ? (chiTt ? 'chi' : 'thu') : (chiTt ? 'unc' : 'bc')
    const so = soKeTiep(MAN_THU_CHI, `${TIEN_TO_CT_TT[loai]}2610-`)
    const id = `moi-${Date.now()}-tt`
    themPhieu(MAN_THU_CHI, {
      id, so, cn: cuaHang, nguon: 'tay', tt: kieu === 'khong' ? 'ghi' : 'nhap', loai, tenLoai: TEN_CT_TT[loai],
      ngay, thang: Number(ngay.split('/')[1]) || 10, doiTuong, dienGiai: dg, tien, thue: 0, tong: tien,
      _quy: quyTt, _lyDo: lyTt, _ghiChu: dg, _thamChieu: soCt, _thamChieuDi: `${path}/${row.id}`,
      _dong: [{ ma: '', ten: dg, dvt: '', sl: 1, gia: tien, tien, ts: 0, thue: 0, ly: lyTt, dt: doiTuong, km: '', cv: '' }],
    }, s.ten)
    ghiNhatKy(MAN_THU_CHI, id, so, s.ten, `Thêm mới chứng từ, thanh toán cho ${soCt}`)
    const man = `${mod.key}/${sc.slug}`
    suaPhieu(man, String(row.id), { _dsTt: [...((row._dsTt as PhieuTt[] | undefined) ?? []), { id, so, loai, tien }] })
    ghiNhatKy(man, String(row.id), soCt, s.ten, `${tenThanhToan} ${money(tien)} bằng ${so}`)
    toast(`Đã lập ${so}, ${chiTt ? 'trả' : 'thu'} ${money(tien)} đ`)
    setHopTt(false)
  }

  function luu(moMoi = false) {
    // Chứng từ thêm mới không được có ngày trước ngày đầu năm của đơn vị (Thông tin đơn vị)
    if (moi && truocDauNam(s, ngayCt.split(' ')[0])) {
      toast(`Ngày chứng từ phải từ ngày đầu năm ${ngayDauNam(s)} trở đi`)
      return
    }
    // Phiếu thu, chi chỉ bắt buộc đối tượng khi lý do là thu nợ, đi vay, chi công nợ, cho vay (T330)
    if (laTien && canDt && !doiTuong.trim()) { toast(`Chọn đối tượng cho lý do ${lyDo}`); return }
    // Phiếu sản xuất (T152): bắt buộc kho, phiếu nhập bắt buộc tham chiếu, phải có dòng
    if (laSx) {
      const thieu = sxNhap && !thamChieuSx.id ? 'Chọn phiếu tham chiếu' : !kho ? `Chọn ${sxNhap ? 'Kho nhập' : 'Kho xuất'}` : !dsDong.length ? 'Phiếu chưa có dòng hàng nào' : ''
      if (thieu) { toast(thieu); return }
    }
    // Điều chuyển (T155): đủ kho, cửa hàng hai đầu; chuyển kho thì kho nhận khác kho xuất
    if (laDcn) {
      const thieu = dcn === 'ndc' && !thamChieuSx.id ? 'Chọn phiếu tham chiếu' : !kho ? `Chọn ${dcn === 'ndc' ? 'Kho nhận' : 'Kho xuất'}`
        : dcn === 'xdc' && !cnNhan ? 'Chọn Cửa hàng nhận' : dcn !== 'ndc' && !khoNhan ? 'Chọn Kho nhận'
          : dcn === 'ck' && khoNhan === kho ? 'Kho nhận phải khác kho xuất' : !dsDong.length ? 'Phiếu chưa có dòng hàng nào' : ''
      if (thieu) { toast(thieu); return }
    }
    const idMoi = `moi-${Date.now()}`
    const ctTt = dongBoCtTt(moi ? idMoi : String(row?.id))
    const dsDc = laKk ? dongBoDc(moi ? idMoi : String(row?.id)) : undefined
    // Bản mẫu chưa có backend: phiếu mới lên đầu danh sách, phiếu sửa hiện nội dung mới, tới khi tải lại trang (T49)
    const dongLuu = khoaLyDtFree
      ? dsDong.map(d => ({ ...d, ly: lyDo, dt: doiTuong }))
      : dsDong
    const noiDung = {
      ngay: ngayCt, thang: Number(ngayCt.split('/')[1]) || 10, doiTuong, dienGiai,
      tien: tongTien - tongCk, thue: tongThue, tong: tongThanhToan, _dong: dongLuu, _lyDo: lyDo, _ghiChu: ghiChu, _quy: quy, _kho: kho,
      _nguoiGiao: nguoiGiao, _nhanVien: nhanVien, _diaChi: diaChi, _mst: mst, _hanTt: hanTt,
      _nhanKemHd: nhanKemHd, _soHd: soHd, _ngayHd: ngayHd, _kyHieuHd: kyHieuHd, _httt: hinhThucTt, _ctTt: ctTt,
      ...(nhom === 'ban' && hinhThucTt !== 'congno' ? { _pttt: pttt } : {}),
      ...(dsDc ? { _dsDc: dsDc } : {}),
      // Phiếu sản xuất (T152): tham chiếu phiếu xuất, người cập nhật; phiếu xuất mới chờ nhập, phiếu nhập lưu là đã nhập
      ...(laSx ? {
        ttSx: row?.ttSx ?? (sxNhap ? 'da' : 'cho'),
        ...(moi ? {} : { _ngayCapNhat: bayGio(), _nguoiCapNhat: s.ten }),
        ...(sxNhap ? { _thamChieu: thamChieuSx.so, _thamChieuId: thamChieuSx.id, _thamChieuDi: `/app/${SX[SX[sx!].doi!].man}/${thamChieuSx.id}` } : {}),
      } : {}),
      // Điều chuyển (T155): phiếu xuất mới chờ nhập, phiếu nhập lưu là đã nhập; chuyển kho không có trạng thái
      ...(laDcn ? {
        ...(dcn !== 'ck' ? { ttSx: row?.ttSx ?? (dcn === 'ndc' ? 'da' : 'cho') } : {}),
        ...(moi ? {} : { _ngayCapNhat: bayGio(), _nguoiCapNhat: s.ten }),
        ...(dcn === 'xdc' ? { doiTuong: cnNhan, _cnNhan: cnNhan } : {}),
        ...(dcn === 'ndc' ? { doiTuong: nguonDc.cn, _cnXuat: nguonDc.cn, _khoXuat: nguonDc.kho,
          _thamChieu: thamChieuSx.so, _thamChieuId: thamChieuSx.id, _thamChieuDi: `/app/${manDoi}/${thamChieuSx.id}` } : { _khoNhan: khoNhan }),
      } : {}),
    }
    const man = `${mod.key}/${sc.slug}`
    if (moi) {
      themPhieu(man, {
        id: idMoi, so: soCt, cn: cuaHang, nguon: 'tay', tt: kieu === 'khong' ? 'ghi' : 'nhap',
        loai: loai?.k, tenLoai: loai?.ten, ...noiDung,
      }, s.ten)
      ghiNhatKy(man, idMoi, soCt, s.ten, 'Thêm mới chứng từ')
    } else if (row) {
      suaPhieu(man, String(row.id), noiDung)
      const g = goc.current, m = chupNd()
      const doi = ([['ngay', 'Ngày chứng từ'], ['doiTuong', 'Đối tượng'], ['quy', 'Quỹ'], ['kho', 'Kho'], ['lyDo', 'Lý do'], ['dienGiai', 'Diễn giải'], ['ghiChu', 'Ghi chú'], ['dong', 'Dòng chi tiết']] as const)
        .filter(([k]) => g[k] !== m[k]).map(([, ten]): string => ten)
      if (g.tong !== m.tong) doi.push(`Tổng tiền ${money(g.tong)} → ${money(m.tong)}`)
      if (doi.length) ghiNhatKy(man, String(row.id), soCt, s.ten, `Sửa chứng từ: ${doi.join(', ')}`)
    }
    // Lưu phiếu nhập sản xuất: phiếu xuất tham chiếu chuyển Đã nhập; đổi tham chiếu thì phiếu xuất cũ về Chờ nhập (T152). Nhập điều chuyển cũng vậy (T155)
    if (coTcNhap) {
      const manXuat = manDoi, cu = String(row?._thamChieuId ?? '')
      if (cu && cu !== thamChieuSx.id) suaPhieu(manXuat, cu, { ttSx: 'cho', _phieuNhap: undefined })
      suaPhieu(manXuat, thamChieuSx.id, { ttSx: 'da', _phieuNhap: { id: moi ? idMoi : String(row?.id), so: soCt } })
    }
    toast(moi ? `Đã lưu ${soCt}` : `Đã lưu thay đổi ${soCt}`)
    // Phiếu chi mới lý do Chi phí chờ phân bổ: báo rồi mở màn tạo thẻ chi phí phân bổ, điền sẵn từ phiếu (T419: thông báo, không hỏi)
    // Mỗi dòng phiếu có lý do Chi phí chờ phân bổ thành một dòng chi tiết của thẻ (tên = diễn giải, số tiền = thành tiền)
    const dongCho = oLy ? dsDong.filter(d => (d.ly ?? lyDo) === LY_CHO_PHAN_BO) : []
    if (moi && dongCho.length) {
      setHoiThe({ moMoi, idMoi, tu: {
        dong: dongCho.map(d => ({ ten: d.ten, gt: String(d.tien), sl: 1 })),
        soCt, ngayCt, ghiChuCt: ghiChu, ngay: ngayCt, ngayPb: ngayCt, _goc: `${path}/${idMoi}`,
      } })
      return
    }
    if (moi && goiYVe && !moMoi) { setHoiVe({ moMoi, idMoi }); return }
    sauLuu(moMoi, idMoi)
  }

  function sauLuu(moMoi: boolean, idMoi: string) {
    if (moMoi) {
      nav(`${path}/moi${loai ? `?loai=${loai.k}` : ''}`, { replace: true })
    } else if (moi) {
      // Lưu phiếu mới: ở lại form, xem chi tiết phiếu vừa lưu; bấm đóng mới về danh sách (T51)
      nav(`${path}/${idMoi}`, { replace: true })
    } else {
      setDangSua(false)
    }
  }

  // Xoá chứng từ (Tiện ích, Ctrl+Delete): cùng luật xoá với danh sách (QD32): kỳ đã khoá sổ không xoá, gói có ghi sổ chỉ xoá phiếu chưa ghi
  function thuXoa() {
    if (!row || khoaSua) return
    if (daKhoaSo(row.ngay)) toast(`${row.so} thuộc kỳ đã khoá sổ, không xoá được`)
    else if (kieu !== 'khong' && row.tt !== 'nhap') toast(`${row.so} đã ghi sổ, bỏ ghi sổ rồi mới xoá`)
    else if (ttThamChieu(row)) toast(`${row.so} có phiếu ${ttThamChieu(row)!.so} tham chiếu, xoá ${ttThamChieu(row)!.so} trước`)   // T85, T91
    else if (((laSx && !sxNhap) || dcn === 'xdc') && row._phieuNhap) toast(`${row.so} đã có phiếu nhập ${(row._phieuNhap as { so: string }).so}, xoá phiếu nhập trước`)   // T152
    else setHoiXoa(true)
  }

  // In: lấy dữ liệu đang có trên form, phiếu mới chưa lưu cũng in được
  function moIn() {
    setPhieuIn([{
      sc, cfg, loai,
      row: { ...row, id: row?.id ?? 'moi', so: soCt, ngay: ngayCt, cn: cuaHang, doiTuong, dienGiai, loai: loai?.k, tien: tongTien, thue: tongThue, tong: tongThanhToan },
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
        if (!khoaSua) setDangSua(true)   // phiếu điều chỉnh, phiếu FABi chỉ xem (T129, T283)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') {
        // Huỷ thay đổi như nút Huỷ (T297)
        e.preventDefault()
        if (dangSua) { if (moi) setHoiDong(true); else setDangSua(false) }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        // Sao chép chứng từ như mục Sao chép ở Tiện ích (T297)
        e.preventDefault()
        if (!dangSua && row && !laDc) toast('Đã sao chép chứng từ')
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Delete' && !dangSua) {
        // Ctrl+Delete xoá chứng từ khi đang xem, hỏi lại trước (T297)
        e.preventDefault()
        thuXoa()
      } else if (dangSua && phimDong(e)) {
        // Ctrl+Insert thêm dòng, Alt+Delete xoá dòng đang đứng (T297)
      } else if (e.key === 'Escape' && !modalPhim) {
        // FormToanMan tự xử lý Esc đóng form
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [modalPhim, soCt, moi, dangSua, row, laDc])

  // Tiêu đề form mọi phiếu chỉ là tên phiếu; trạng thái và số phiếu ở giữa đầu form (T49, T61)
  const tenPhieu = loai?.ten ?? (cfg.them?.startsWith('Thêm ') ? cfg.them.charAt(5).toUpperCase() + cfg.them.slice(6) : tenMan(sc))

  // Đang xem tất cả cửa hàng thì phải chọn một cửa hàng trước khi lập chứng từ mới
  if (canChonCn) {
    return (
      <FormToanMan icon={mod.icon} onClose={dongForm} title={tenPhieu}
        foot={<button type="button" className="btn" onClick={dongForm}>Huỷ</button>}>
        <section className="card chon-cn">
          <b>Chọn cửa hàng lập chứng từ</b>
          <p className="muted">Bạn đang xem tất cả cửa hàng. Chứng từ mới lập cho một cửa hàng và không đổi được sau khi lập.</p>
          <div className="chon-cn-ds">
            {CUA_HANG.map(c => (
              <button key={c.id} type="button" className="btn" onClick={() => set({ cuaHang: c.id })}>
                <Icon n="cuahang" className="ic sm" />{c.ten}
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
    ...(laTien || laKk || dcn === 'ck' || kieu === 'khong' ? [] :   // phiếu kiểm kê, chuyển kho không có tab Hạch toán (T124, T155)
      [['ht', kieu === 'noco' ? 'Hạch toán' : 'Ghi sổ'] as [string, string]]),
    ...(s.goi === 'F' ? [] : [['dk', 'Đính kèm'] as [string, string]]),   // gói Free không có đính kèm (T52)
    ['ls', 'Lịch sử'],
  ]

  // Tuỳ chỉnh giao diện phiếu (T89): ô đầu phiếu không bắt buộc và tổng chân phiếu bật tắt được, nhớ chung khoá với cột bảng (tiền tố dau:, chan:)
  const hienDau = (k: string) => !anCot.includes(`dau:${k}`)
  // Phiếu thu, chi tiền (2.1.1) không có ô Mã số thuế; chuyển quỹ cũng không (T168)
  const coMst = nhom !== 'cq' && !(laTien && sc.code === '2.1.1')
  const coHanTt = Boolean(bo.tt) && s.goi !== 'F' && s.goi !== 'S'   // gói Free, Standard ẩn hạn thanh toán (T180)
  const hienChan = (k: string) => !anCot.includes(`chan:${k}`)
  const muaBan = nhom === 'mua' || nhom === 'ban'
  const nhanNguoi = nhom === 'cq' ? 'Người thực hiện' : laTien || muaBan ? 'Người giao dịch' : 'Người giao / nhận'   // mua, bán ghi Người giao dịch (T90)
  const dsDau: [string, string][] = gonDau ? [...(laDcn ? [] : [['nhanVien', 'Nhân viên thực hiện'] as [string, string]]), ['ghiChu', 'Ghi chú']] : [
    ['nguoi', nhanNguoi],
    ...(nhom !== 'cq' ? [['diaChi', 'Địa chỉ'] as [string, string]] : []),
    ...(!laTien && !muaBan ? [['nhanVien', 'Nhân viên thực hiện'] as [string, string]] : []),
    ...(coMst ? [['mst', 'Mã số thuế'] as [string, string]] : []),
    ...(coHanTt ? [['hanTt', 'Hạn thanh toán'] as [string, string]] : []),
    ['ghiChu', 'Ghi chú'],
  ]
  const dsChan: [string, string][] = laKk || dcn === 'ck' ? [['dongTong', 'Dòng Tổng cộng cuối bảng']] : [
    ...(laTien && chiTien ? [] : [['dongTong', 'Dòng Tổng cộng cuối bảng'] as [string, string]]),
    ['tongTien', laTien && chiTien ? 'Tổng tiền ở dải đáy' : 'Khối tổng tiền dưới bảng'],
  ]

  // Đầu phiếu thu chi, chuyển quỹ: bỏ ô Diễn giải vì Ghi chú chép sang, Địa chỉ lên cột giữa, Ghi chú kéo dài qua hai cột (T77)
  // Gói dưới Pro: một kho cho cả phiếu, chọn trong kho của cửa hàng lập phiếu (T83); trả lại hàng mua thì xuất, trả lại hàng bán thì nhập
  const oKhoDau = (
    <div className="f">
      <label>{(nhom === 'ban') !== (cfg.prefix === 'TLN' || cfg.prefix === 'TL') ? 'Kho xuất' : 'Kho nhập'} <em>*</em></label>
      {dangSua ? (
        <ChonDanhMuc dm="kho" nhan="kho" value={kho} onChange={setKho} ds={!kho || dsKhoCn.includes(kho) ? dsKhoCn : [kho, ...dsKhoCn]} />
      ) : <input className="inp" readOnly value={kho} />}
    </div>
  )
  const oDiaChi = hienDau('diaChi') && (
    <div className="f">
      <label>Địa chỉ</label>
      <input className="inp" readOnly={!dangSua} value={diaChi} onChange={e => setDiaChi(e.target.value)} />
    </div>
  )
  // Chuyển quỹ: ô quỹ đi, quỹ đến và người thực hiện
  const oQuyCq = (nhan: string, v: string, setV: (v: string) => void) => (
    <div className="f">
      <label>{nhan} <em>*</em></label>
      {dangSua ? <ChonDanhMuc dm="quy" nhan="quỹ" value={v} onChange={setV} ds={QUY_TIEN} khongThem /> : <input className="inp" readOnly value={v} />}
    </div>
  )
  const oNguoiTh = hienDau('nguoi') && (
    <div className="f">
      <label>Người thực hiện</label>
      <input className="inp" readOnly={!dangSua} value={nguoiGiao} onChange={e => setNguoiGiao(e.target.value)} />
    </div>
  )
  // Ghi chú ở mọi phiếu (T69), gõ ghi chú thì diễn giải chép theo (T49, T78)
  // Phân hệ Thu chi (trừ chuyển quỹ): Địa chỉ ở cột giữa, Ghi chú kéo dài qua hai cột trái (T77).
  // Phiếu khác: Địa chỉ ở cột trái, Ghi chú ở cột giữa cùng hàng Địa chỉ (T78). Hai cột trái luôn đều hàng
  // Mua, bán (T90): hàng 1 Đối tượng, Mã số thuế; hàng 2 Địa chỉ, Người giao dịch; Ghi chú kéo dài như thu chi; bỏ Nhân viên thực hiện
  // Thu chi (trừ chuyển quỹ) từ T168: Địa chỉ, Ghi chú ở cột giữa dưới Lý do, đầu phiếu gọn 3 hàng; Ghi chú chỉ còn kéo dài ở mua, bán
  const tcGiua = laTien && nhom !== 'cq'
  // Ô kho đứng đầu cột 1 (T248) làm cột 1 dài thêm một hàng: Ghi chú lên cột giữa dưới Người giao dịch, đầu phiếu vẫn 3 hàng
  const keoGc = muaBan && !khoDau
  const oNguoi = hienDau('nguoi') && (
    <div className="f">
      <label>{nhanNguoi}</label>
      <input className="inp" readOnly={!dangSua} value={nguoiGiao} onChange={e => setNguoiGiao(e.target.value)} />
    </div>
  )
  const oGhiChu = hienDau('ghiChu') && (
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
      onClose={dongMoi}
      day={laKk || dcn === 'ck' || (laDc && s.goi === 'F') || !hienChan('tongTien') ? undefined
        : laTien && chiTien ? <TongDay tong={tongThanhToan} soDong={dsDong.length} />
          // Phần tổng thành dải cố định ở đáy form, cuộn bảng vẫn thấy (T105); phiếu mua chỉ Tổng tiền vì số khác đã có trên dòng (T84)
          : <DaiTong tong={tongThanhToan} muc={chiTien || truocThue || laDc || laSx || laDcn ? [] : [
            ['Tiền hàng', tongTien],
            ...(bo.ck ? [['Chiết khấu', tongCk ? -tongCk : 0] as [string, number]] : []),
            ['Tiền thuế GTGT', tongThue],
            ...(bo.tongNhap ? [['Giá trị nhập kho', tongTien - tongCk + (hkd ? tongThue : 0)] as [string, number]] : []),
          ]} />}
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
      phai={<>
        {/* Tuỳ chỉnh giao diện phiếu: nút vuông nhỏ chỉ biểu tượng ở góc trên phải, như nút Tuỳ chỉnh cột ở danh sách (T297) */}
        <button type="button" className={`nut-vuong ds-nut-cot${hopCot ? ' on' : ''}`} onClick={() => setHopCot(true)}
          title="Tuỳ chỉnh giao diện: bật tắt ô đầu phiếu, cột bảng chi tiết, tổng chân phiếu" aria-label="Tuỳ chỉnh giao diện">
          <Icon n="chinh" className="ic sm" />
        </button>
        <button
          type="button"
          className="icon-btn"
          title="Xem phím tắt" aria-label="Xem phím tắt"
          onClick={() => setModalPhim(m => !m)}
        >
          <Icon n="keyboard" />
        </button>
      </>}
      meta={
        row ? (
          <>
            {/* Gói Free lưu là duyệt luôn, không có trạng thái ghi sổ (QD32) */}
            {kieu !== 'khong' && (() => {
              const [c, tx] = TT_CT[row.tt] ?? ['warn', 'Chưa ghi sổ']
              return <St k={c}>{tx}</St>
            })()}
            {/* Trạng thái xuất, nhập của phiếu sản xuất (T152) */}
            {coTtXn && TT_SX[String(row.ttSx)] && <St k={TT_SX[String(row.ttSx)][0]}>{TT_SX[String(row.ttSx)][1]}</St>}
            <span className={`src ${NGUON[row.nguon]?.[0] ?? 'tay'}`}>
              {NGUON[row.nguon]?.[1] ?? 'Thủ công'}
            </span>
            {cuaHang && <span className="chip info" title="Cửa hàng lập chứng từ, không sửa được"><Icon n="cuahang" className="ic sm" />{cuaHang}</span>}
            {khoaKy && <span className="chip warn" title="Phiếu thuộc tháng đã khoá sổ: chỉ xem, không sửa, không xoá. Mở khoá ở màn Khoá sổ"><Icon n="lock" className="ic sm" />Đã khoá sổ</span>}
          </>
        ) : (
          <>
            <span className="chip info" title="Theo cửa hàng chọn trên thanh trên, không sửa được"><Icon n="cuahang" className="ic sm" />{cuaHang}</span>
          </>
        )
      }
      foot={
        dangSua ? (
          <>
            <button
              type="button"
              className="btn"
              onClick={() => { if (moi) setHoiDong(true); else { setDangSua(false); if (khoaLyDtFree) setDsDong(dongGoc); } }}
            >
              Huỷ
            </button>
            <span className="grow" />
            {coTkGoi && dcn !== 'ck' && (   // chuyển kho không hạch toán (T155)
              <button
                type="button"
                className={`btn btn-tk-toggle ${hienTk ? 'on' : ''}`}
                onClick={() => setHienTk(!hienTk)}
                title={hienTk ? 'Bấm để ẩn cột tài khoản Nợ/Có trên dòng' : 'Bấm để hiển thị cột tài khoản Nợ/Có trên dòng'}
              >
                <Icon n="book" className="ic sm" />
                <span>{hienTk ? 'Ẩn cột tài khoản' : 'Hiện cột tài khoản'}</span>
                <span className={`tk-badge ${hienTk ? 'on' : ''}`}>{hienTk ? 'Đang hiện' : 'Đang ẩn'}</span>
              </button>
            )}
            {/* Nút Tuỳ chỉnh giao diện ở góc trên phải đầu form (T297); hộp vẫn mở cả khi thêm mới, sửa (T161) */}
            {hopCot && (
              <HopCotPhieu dsDau={dsDau} dsChan={dsChan} ds={laKk ? COT_KK : laSx ? cotSx(sx!) : laDcn ? cotDcn(dcn!) : cotTuyChon(cfg, { coNhomHhdv: nhom === 'mua' && nhanKemHd && (s.goi === 'PL' || s.goi === 'PR'), coKho: Boolean(bo.kho) && !khoDau && !laDc, coLo: nhom === 'mua' && s.goi === 'PR', coCk: Boolean(bo.ck), coKm: kieu !== 'khong', coLy: Boolean(oLy), coNhapKho: truocThue }).filter(([k]) => !anDc.includes(k))}
                an={anCot} onDoi={doiAnCot} onDong={() => setHopCot(false)} />
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
                className="btn"
                disabled={!coTruoc}
                onClick={veTruoc}
                title="Chứng từ trước"
              >
                <Icon n="chevl" className="ic sm" />Trước
              </button>
              <button
                type="button"
                className="btn"
                disabled={!coSau}
                onClick={veSau}
                title="Chứng từ sau"
              >
                Sau<Icon n="chevr" className="ic sm" />
              </button>
            </div>
            {coTkGoi && !laKk && dcn !== 'ck' && (   // phiếu kiểm kê, chuyển kho không hạch toán nên không có nút Cột tài khoản (T124, T155)
              <button
                type="button"
                className={`btn btn-tk-toggle ${hienTk ? 'on' : ''}`}
                onClick={() => setHienTk(!hienTk)}
                title={hienTk ? 'Bấm để ẩn cột tài khoản Nợ/Có trên dòng' : 'Bấm để hiển thị cột tài khoản Nợ/Có trên dòng'}
              >
                <Icon n="book" className="ic sm" />
                <span>Cột tài khoản</span>
                <span className={`tk-badge ${hienTk ? 'on' : ''}`}>{hienTk ? 'Đang hiện' : 'Đang ẩn'}</span>
              </button>
            )}
            <span className="grow" />
            <button type="button" className="btn" onClick={moIn}>
              <Icon n="printer" className="ic sm" />In
            </button>
            <Dropdown
              btnClass="btn"
              align="end"
              width={180}
              label={<><Icon n="more" className="ic sm" />Tiện ích</>}
            >
              {dong => <>
              {/* Phiếu điều chỉnh sinh từ kiểm kê chỉ xem: không sao chép, sửa, xoá (T129) */}
              {!laDc && (
                <MenuItem icon="copy" onClick={() => toast('Đã sao chép chứng từ')}>
                  Sao chép
                </MenuItem>
              )}
              {coThanhToanSau && (
                <MenuItem icon="wallet" onClick={() => { dong(); setHopTt(true) }}>
                  {tenThanhToan}
                </MenuItem>
              )}
              <MenuItem icon="doc" onClick={() => toast('Đã xuất mẫu Excel')}>
                Xuất Excel
              </MenuItem>
              {row && !khoaSua && (
                <MenuItem icon="trash" danger onClick={thuXoa}>
                  Xoá chứng từ
                </MenuItem>
              )}
              </>}
            </Dropdown>
            {hopCot && (
              <HopCotPhieu dsDau={dsDau} dsChan={dsChan} ds={laKk ? COT_KK : laSx ? cotSx(sx!) : laDcn ? cotDcn(dcn!) : cotTuyChon(cfg, { coNhomHhdv: nhom === 'mua' && nhanKemHd && (s.goi === 'PL' || s.goi === 'PR'), coKho: Boolean(bo.kho) && !khoDau && !laDc, coLo: nhom === 'mua' && s.goi === 'PR', coCk: Boolean(bo.ck), coKm: kieu !== 'khong', coLy: Boolean(oLy), coNhapKho: truocThue }).filter(([k]) => !anDc.includes(k))}
                an={anCot} onDoi={doiAnCot} onDong={() => setHopCot(false)} />
            )}
            {hopTt && row && (
              <HopThanhToan tieuDe={`${tenThanhToan} cho ${soCt}`} chiTt={chiTt} conLai={conLai} quyTm={quyTm} ngay0={ngayCt} dg0={dgTt}
                onDong={() => setHopTt(false)} onLuu={lapThanhToan} />
            )}
            {hoiXoa && row && (
              <HopXacNhan tieuDe={`Xoá ${row.so}?`} nut="Xoá phiếu" onDong={() => setHoiXoa(false)}
                onDongY={() => { setHoiXoa(false); xoaPhieu(`${mod.key}/${sc.slug}`, [{ id: String(row.id), so: soCt }], s.ten); xoaTheCuaPhieu([row], s.ten); if (coTcNhap && row._thamChieuId) suaPhieu(manDoi, String(row._thamChieuId), { ttSx: 'cho', _phieuNhap: undefined }); if (laKk) xoaPhieu(MAN_DC, dsDcCon(row).map(c => ({ id: c.id, so: c.so })), s.ten); toast(`Đã xoá ${row.so}`); dongForm() }}>
                {theCuaPhieu(row).length > 0 ? 'Xoá phiếu chi này sẽ xoá thẻ chi phí đã tạo. Bạn có muốn thực hiện không? ' : ''}Phiếu đã xoá không lấy lại được.{laKk && dsDcCon(row).length > 0 && <> Phiếu điều chỉnh {dsDcCon(row).map(c => c.so).join(', ')} cũng bị xoá theo.</>}
              </HopXacNhan>
            )}
            {kieu !== 'khong' && row && (
              <button
                type="button"
                className="btn"
                onClick={() => toast(row.tt === 'ghi' ? 'Đã bỏ ghi sổ' : 'Đã ghi sổ')}
              >
                {row.tt === 'ghi' ? 'Bỏ ghi sổ' : 'Ghi sổ'}
              </button>
            )}
            {!khoaSua && (
              <button
                type="button"
                className="btn pri"
                onClick={() => setDangSua(true)}
              >
                <Icon n="edit" className="ic sm" />Sửa (Ctrl+E)
              </button>
            )}
            <button type="button" className="btn" onClick={dongForm}>
              Đóng (Esc)
            </button>
          </>
        )
      }
    >
      {phieuIn && <HopInChungTu ds={phieuIn} onDong={() => setPhieuIn(null)} />}
      {/* Hộp hướng dẫn phím tắt, dùng chung với form thẻ chi phí (T297) */}
      {modalPhim && <HopPhimTat onDong={() => setModalPhim(false)} />}

      {/* Phần trên: Thông tin chung kiểu AMIS. Đầu phiếu đứng yên, chỉ vùng bảng chi tiết cuộn (T105) */}
      <div className="stack ct-co-dinh" style={{ gap: 10 }}>   {/* khối cách nhau 10px cho bảng chi tiết nhiều chỗ (T336) */}
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
                      className="inp sm" style={O_TT} value={quy} onChange={setQuy} ds={dsQuy} khongThem />
                  ) : <input className="inp sm" style={O_TT} readOnly value={quy} />}
                </div>
              )}

              {/* Phương thức thanh toán cho nhóm bán khi thu tiền ngay (T137) */}
              {nhom === 'ban' && hinhThucTt !== 'congno' && (
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--muted)', whiteSpace: 'nowrap' }}>Phương thức:</span>
                  <Select
                    className="inp sm"
                    style={{ minWidth: 150 }}
                    disabled={!dangSua}
                    aria-label="Phương thức thanh toán"
                    value={pttt}
                    onChange={e => setPttt(e.target.value)}
                    ds={DS_PTTT.filter(p => p._tt !== 0).map(p => ({ v: p.ten, t: p.ten }))}
                  />
                </div>
              )}

              {/* Phiếu còn nợ (T91): số đã trả, đã thu, các phiếu thu, chi lập sau, nút thanh toán ngay */}
              {bo.tt && row && hinhThucTt === 'congno' && (
                <span className="row" style={{ gap: 8, fontSize: 12.5, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--muted)' }}>{chiTt ? 'Đã trả' : 'Đã thu'}: <b style={{ color: 'var(--ink)' }}>{money(daTra)}</b> / {money(tongGoc)}</span>
                  {dsTt.map(c => <Link key={c.id} className="ds-link-so" to={`/app/tien/2-1-1/${c.id}`} title={`${TEN_CT_TT[c.loai]} ${money(c.tien)}`}>{c.so}</Link>)}
                  {coThanhToanSau && (
                    <button type="button" className="btn sm" onClick={() => setHopTt(true)}>
                      <Icon n="wallet" className="ic sm" />{tenThanhToan}
                    </button>
                  )}
                </span>
              )}

              {/* Chứng từ thu, chi sinh từ phiếu mua, bán đã lưu (T85) */}
              {loaiTt && ctTtCu && ctTtCu.loai === loaiTt && (
                <span className="row" style={{ gap: 6, fontSize: 12.5, alignItems: 'center' }}>
                  <span style={{ color: 'var(--muted)' }}>{TEN_CT_TT[loaiTt]}:</span>
                  <Link className="ds-link-so" to={`/app/tien/2-1-1/${ctTtCu.id}`}>{ctTtCu.so}</Link>
                </span>
              )}

              <span className="grow" />

              {/* Ô tích kèm hoá đơn chỉ khi thêm mới, sửa; xem chi tiết thì bỏ, thông tin hoá đơn vẫn hiện ở đầu phiếu (T162) */}
              {dangSua && <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  className="bat-tat"
                  checked={nhanKemHd}
                  onChange={e => setNhanKemHd(e.target.checked)}
                />
                {nhom === 'mua' ? 'Nhận kèm hoá đơn' : 'Lập kèm hoá đơn'}
              </label>}
            </div>
          </section>
        )}

        {/* Khối thông tin chung 3 cột: Đối tượng / Thông tin phụ / Chứng từ; ct-ttc nhãn bên trái ô cho khối thấp xuống (T335) */}
        <section className="card ct-ttc" style={{ padding: '8px 16px' }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: gonDau ? 'minmax(0, 1fr) 300px' : coHdDau ? 'minmax(0, 1.4fr) minmax(0, 1.2fr) 260px 300px' : 'minmax(0, 1.4fr) minmax(0, 1.2fr) 300px',   // cột ngày, số phiếu 300px vì nhãn nằm bên trái ô (T335)
              gap: 16,
              alignItems: 'start',
            }}
          >
            {/* Cột 1: Đối tượng; phiếu chuyển quỹ thì là quỹ đi, quỹ đến. Phiếu kiểm kê không có đối tượng (T124) */}
            {/* Ô kho của phiếu (gói dưới Pro) đứng đầu, trước nhà cung cấp, khách hàng (T248) */}
            {!gonDau && <div className="stack" style={{ gap: 10 }}>
              {khoDau && oKhoDau}
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
                      value={quy} onChange={setQuy} ds={dsQuy} khongThem />
                  ) : (
                    <input className="inp" readOnly value={quy} />
                  )}
                </div>
              )}
              <div className="f">
                <label>{laTien ? 'Đối tượng' : cfg.nhan ?? 'Đối tượng'} {(!laTien || canDt) && <em>*</em>}</label>
                {dangSua ? (
                  <ChonDanhMuc dm={dmDt} nhan={(laTien ? 'đối tượng' : cfg.nhan ?? 'đối tượng').toLowerCase()} value={doiTuong} onChange={chonDoiTuong}
                    ds={dsDt.includes(doiTuong) || !doiTuong ? dsDt : [doiTuong, ...dsDt]} />
                ) : (
                  <input className="inp" readOnly value={doiTuong} />
                )}
              </div>
              {!muaBan && oNguoi}
              {!tcGiua && oDiaChi}
              </>)}
            </div>}

            {/* Cột 2: lý do, nhân viên, mã số thuế, hạn thanh toán */}
            <div className="stack" style={{ gap: 10 }}>
              {oLy && (
                <div className="f">
                  {/* Lý do chi được tích Là chi phí (danh mục Lý do nghiệp vụ) thì hiện nhãn Chi phí cạnh tên ô (T246) */}
                  <label>{oLy.nhan}</label>
                  {/* Lý do được tích Là chi phí: nhãn Chi phí nằm cuối ô lý do (T246, T419) */}
                  <div className={`ly-o${LY_CHI_PHI.includes(lyDo) ? ' co-cp' : ''}${dangSua ? ' sua' : ''}`}>
                    {dangSua ? (
                      <ChonDanhMuc dm={`ly:${oLy.nhan}`} nhan={oLy.nhan.toLowerCase()} value={lyDo} onChange={chonLyDo} ds={oLy.ds!} />
                    ) : (
                      <input className="inp" readOnly value={lyDo} />
                    )}
                    {LY_CHI_PHI.includes(lyDo) && <span className="chip ok ly-cp" title="Lý do nghiệp vụ được tích Là chi phí: khoản chi tính vào Chi phí trong tháng">Chi phí</span>}
                  </div>
                  {/* T419: phiếu mới có khoản chờ phân bổ thì nhắc trước, lưu xong sẽ mở màn tạo thẻ */}
                  {moi && dangSua && dsDong.some(d => (d.ly ?? lyDo) === LY_CHO_PHAN_BO) && (
                    <div className="ly-nhac-the"><Icon n="info" className="ic sm" />Lưu phiếu xong sẽ tạo Thẻ chi phí phân bổ</div>
                  )}
                </div>
              )}
              {/* Chuyển quỹ: hàng 1 Từ quỹ, Đến quỹ; hàng 2 Người thực hiện, Ghi chú (T77) */}
              {nhom === 'cq' && oQuyCq('Đến quỹ', denQuy, setDenQuy)}
              {tcGiua && oDiaChi}
              {/* Phiếu kiểm kê: hàng 1 Kho kiểm kê, Nhân viên thực hiện; hàng 2 Ghi chú (T124) */}
              {gonDau && !laDcn && (
                <div className="row" style={{ gap: 10 }}>
                  <div className="f" style={{ flex: 1 }}>
                    <label>{laKk ? 'Kho kiểm kê' : (laDc && loai?.k === 'ndc') || sxNhap ? 'Kho nhập' : 'Kho xuất'} <em>*</em></label>
                    {dangSua ? (
                      <ChonDanhMuc dm="kho" nhan="kho" value={kho} onChange={setKho} ds={!kho || dsKhoCn.includes(kho) ? dsKhoCn : [kho, ...dsKhoCn]} />
                    ) : <input className="inp" readOnly value={kho} />}
                  </div>
                  {hienDau('nhanVien') && (
                    <div className="f" style={{ flex: 1 }}>
                      <label>Nhân viên thực hiện</label>
                      {dangSua ? (
                        <ChonDanhMuc dm="nv" nhan="nhân viên" value={nhanVien} onChange={setNhanVien}
                          ds={NHAN_VIEN.map(n => ({ v: n.ten, t: `${n.ten} (${n.bp})` }))} />
                      ) : <input className="inp" readOnly value={nhanVien} />}
                    </div>
                  )}
                </div>
              )}
              {/* Điều chuyển (T155): xuất có kho xuất, cửa hàng nhận, kho nhận; nhập có tham chiếu, kho nhận; chuyển kho có kho xuất, kho nhận */}
              {laDcn && (
                <DauDieuChuyen loai={dcn!} sua={dangSua} cuaHang={cuaHang} kho={kho} setKho={setKho} khoNhan={khoNhan} setKhoNhan={setKhoNhan}
                  cnNhan={cnNhan} setCnNhan={setCnNhan} nguon={nguonDc} thamChieu={thamChieuSx} onChonTc={chonThamChieuSx} />
              )}
              {/* Phiếu nhập sản xuất: tham chiếu bắt buộc, chọn phiếu xuất cùng loại đang chờ nhập (T152) */}
              {sxNhap && (
                <div className="f">
                  <label>Tham chiếu <em>*</em></label>
                  {dangSua ? <OThamChieuSx loai={sx!} cn={cuaHang} value={thamChieuSx.id} onChon={chonThamChieuSx} />
                    : <div className="sx-tc-xem">{thamChieuSx.id ? <Link className="ds-link-so" to={`/app/${SX[SX[sx!].doi!].man}/${thamChieuSx.id}`}>{thamChieuSx.so}</Link> : <span className="dim">Chưa có</span>}</div>}
                </div>
              )}
              {!gonDau && !laTien && !muaBan && hienDau('nhanVien') && (
                <div className="f">
                  <label>Nhân viên thực hiện</label>
                  {dangSua ? (
                    <ChonDanhMuc dm="nv" nhan="nhân viên" value={nhanVien} onChange={setNhanVien}
                      ds={NHAN_VIEN.map(n => ({ v: n.ten, t: `${n.ten} (${n.bp})` }))} />
                  ) : <input className="inp" readOnly value={nhanVien} />}
                </div>
              )}
              {!gonDau && nhom !== 'cq' && ((coMst && hienDau('mst')) || (coHanTt && hinhThucTt === 'congno' && hienDau('hanTt'))) && <div className="row" style={{ gap: 10 }}>
                {coMst && hienDau('mst') && <div className="f" style={{ flex: 1 }}>
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
                </div>}
                {coHanTt && hinhThucTt === 'congno' && hienDau('hanTt') && (
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
              {muaBan && oNguoi}
              {!keoGc && oGhiChu}
            </div>

            {/* Mua tích Nhận kèm hoá đơn, bán tích Lập kèm hoá đơn: thông tin hoá đơn thành một cột trước cột ngày, số phiếu, ba hàng đều với hai cột trái (T62, T68, T83) */}
            {coHdDau && (
              <div className="stack ct-hd-dau" style={{ gap: 10, gridRow: keoGc ? 'span 2' : undefined }}>
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

            {/* Cột 3: Ngày chứng từ, số chứng từ. Cửa hàng hiện trên đầu form. Ghi chú kéo dài thì cột này chiếm cả hàng Ghi chú (T78) */}
            <div className="stack" style={{ gap: 10, gridRow: keoGc ? 'span 2' : undefined }}>
              <div className="f">
                <label>{laSx ? (sxNhap ? 'Thời gian nhập' : 'Thời gian xuất') : laDcn ? 'Thời gian' : 'Ngày chứng từ'} <em>*</em></label>
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
                <label>{laSx || laDcn ? 'Mã phiếu' : bo.so ?? 'Số chứng từ'}</label>
                <input className="inp code" readOnly value={soCt} />
              </div>
              {/* T419: chỉ hiện khi phiếu có lý do được tích Là chi phí */}
              {coThangLl && dsDong.some(d => LY_CHI_PHI.includes(d.ly ?? lyDo)) && (
                <div className="f">
                  <label>Tháng ghi nhận chi phí</label>
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
          {/* Chứng từ tham chiếu ở dòng dưới đầu phiếu; thêm loại tham chiếu mới thì nối vào đây.
              Phiếu chi có dòng Chi phí chờ phân bổ đã tạo thẻ: Thẻ chi phí, số thẻ bấm mở thẻ (T168) */}
          {/* T436: hiện cả thẻ mẫu trỏ về phiếu, không bắt buộc dòng lý do Chi phí chờ phân bổ */}
          {oLy && theCuaPhieu(row).length > 0 && (
            <div className="row ct-tham-chieu">
              <span className="dim">Thẻ chi phí:</span>
              {theCuaPhieu(row).map(so => <Link key={so} className="ds-link-so" to={`/app/ccdc/8-1-1?mo=${so}`} title="Mở thẻ chi phí phân bổ">{so}</Link>)}
            </div>
          )}
          {/* Tham chiếu kiểm kê và phiếu điều chỉnh (T126) */}
          {laKk && dsDcCon(row).length > 0 && (
            <div className="row ct-tham-chieu">
              <span className="dim">Chứng từ xử lý chênh lệch:</span>
              {dsDcCon(row).map(c => <Link key={c.id} className="ds-link-so" to={`/app/${MAN_DC}/${c.id}`}>{c.so}</Link>)}
            </div>
          )}
          {laDc && row?._thamChieu && (
            <div className="row ct-tham-chieu">
              <span className="dim">Theo phiếu kiểm kê:</span>
              <Link className="ds-link-so" to={`/app/kho/5-1-10/${String(row._kkId)}`}>{String(row._thamChieu)}</Link>
            </div>
          )}
        </section>

        {/* Khối Tabs chi tiết: vùng duy nhất cuộn trong form (T105) */}
        <section className={`card ct-than-card${nhom === 'mua' ? ' ct-mua-hang' : ''}`}>
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
            {/* Phễu lọc ngay sau tab cuối (T383): bấm mới hiện hàng lọc như danh sách chứng từ, bật thì về tab Chi tiết */}
            {!laSx && !laDcn && (
              <button type="button" className={`ct-nut-loc${moLoc ? ' on' : ''}`} aria-pressed={moLoc}
                title={moLoc ? 'Ẩn bộ lọc dòng chi tiết' : 'Lọc dòng chi tiết'} aria-label="Lọc dòng chi tiết"
                onClick={() => { if (!moLoc) setTab('ct'); setMoLoc(v => !v) }}>
                <Icon n="filter" className="ic sm" />
              </button>
            )}
          </div>

          <div className="ct-than">
          {/* Tab 1: Chi tiết / Hàng tiền */}
          {tab === 'ct' && laKk && <BangKiemKe dong={dsDong} onChange={setDsDong} cheDo={dangSua ? 'sua' : 'xem'} an={anCot} khongTong={!hienChan('dongTong')} hienLoc={moLoc} />}
          {tab === 'ct' && laSx && (
            <BangSanXuat loai={sx!} dong={dsDong as DongSx[]} onChange={setDsDong} cheDo={dangSua ? 'sua' : 'xem'} coTk={hienTk} an={anCot}
              khongTong={!hienChan('dongTong')} kho={kho} coThamChieu={Boolean(thamChieuSx.id)} />
          )}
          {tab === 'ct' && laDcn && (
            <BangDieuChuyen loai={dcn!} dong={dsDong as DongDcn[]} onChange={setDsDong} cheDo={dangSua ? 'sua' : 'xem'} coTk={hienTk} an={anCot}
              khongTong={!hienChan('dongTong')} kho={kho} coThamChieu={Boolean(thamChieuSx.id)} />
          )}
          {tab === 'ct' && !laKk && !laSx && !laDcn && (
            <BangSua
              cfg={cfg}
              dong={dsDong}
              onChange={setDsDong}
              cheDo={dangSua ? 'sua' : 'xem'}
              coTk={hienTk}
              nhanTk={nhanTkDong}
              tkTheoLy={coTkTheoLy ? (ly => tkTheoLyDo(loaiPhieuTien, ly)) : undefined}
              coKho={Boolean(bo.kho) && !khoDau && !laDc}   // phiếu điều chỉnh: kho ở đầu phiếu (T126)
              khoMacDinh={khoMotCn || 'Kho tổng'}
              coNhapKho={nhom === 'mua' && Boolean(bo.tongNhap)}
              themGon={nhom === 'mua'}
              gtnkCoThue={hkd}
              coNhomHhdv={nhom === 'mua' && nhanKemHd && (s.goi === 'PL' || s.goi === 'PR')}   // T162
              coCk={Boolean(bo.ck)}
              coLo={nhom === 'mua' && s.goi === 'PR'}   // số lô, hạn dùng chỉ có ở gói Pro (T68)
              coKm={kieu !== 'khong'}
              lyDo={oLy ? { nhan: oLy.nhan, ds: oLy.ds!, macDinh: lyDo } : undefined}
              dtMacDinh={laTien ? doiTuong : ''}
              an={[...anCot, ...anDc, ...(khoaLyDtFree ? ['ly', 'dt'] : [])]}   // gói Free phiếu thu, chi: lý do, đối tượng chỉ ở phần trên, bảng chi tiết bỏ hai cột này (T448)
              khongTong={(laTien && chiTien) || !hienChan('dongTong')}
              chiXemLy={khoaLyDtFree}
              chiXemDt={khoaLyDtFree}
              hienLoc={moLoc}
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
                  <ONgay value={ngayHd} onChange={setNgayHd} disabled={!dangSua} />
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
                dt={dcn === 'xdc' ? cnNhan : dcn === 'ndc' ? nguonDc.cn : doiTuong}
                cn={cuaHang}
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
          </div>

        </section>

        {children}
      </div>
      {hoiDong && (
        <HopXacNhan tieuDe="Xác nhận đóng phiếu!" nut="Xác nhận" nutHuy="Bỏ qua"
          onDong={() => setHoiDong(false)} onDongY={() => { setHoiDong(false); dongForm() }}>
          Bạn chưa lưu phiếu. Bạn có chắc chắn muốn đóng phiếu này không?
        </HopXacNhan>
      )}
      {hoiThe && (
        <HopXacNhan tieuDe="Tạo thẻ chi phí phân bổ" nut="Tiếp tục" nutHuy={null} nutDo={false}
          onDong={() => { const h = hoiThe; setHoiThe(null); sauLuu(h.moMoi, h.idMoi) }}
          onDongY={() => { const h = hoiThe; setHoiThe(null); nav('/app/ccdc/8-1-1?moi=the', { state: { tuPhieu: h.tu } }) }}>
          {soCt} có khoản Chi phí chờ phân bổ. Phần mềm mở màn Tạo thẻ chi phí phân bổ, điền sẵn tên, số tiền, ngày, chứng từ gốc từ phiếu. Bạn vẫn sửa lại được.
        </HopXacNhan>
      )}
      {hoiVe && (
        <HopXacNhan tieuDe={`Đã lưu ${soCt}`} nut="Về trang chủ" nutHuy="Ở lại phiếu" nutDo={false}
          onDong={() => { const h = hoiVe; setHoiVe(null); sauLuu(h.moMoi, h.idMoi) }}
          onDongY={() => { setHoiVe(null); nav('/app/trang-chu/tong-quan') }}>
          Quay lại trang chủ để xem tồn quỹ và làm tiếp các việc khác?
        </HopXacNhan>
      )}
    </FormToanMan>
  )
}

/** Các quỹ chuyển qua lại trên phiếu chuyển quỹ: quỹ tiền mặt từng cửa hàng, rồi tài khoản ngân hàng */
export const QUY_TIEN = [
  ...CUA_HANG.map(c => `Quỹ tiền mặt ${c.ngan}`),
  ...TK_NGAN_HANG.map(t => `${t.nh.split(',')[0]} ${t.so}`),
]

/** Đoán lý do thu, chi từ diễn giải; không khớp thì lấy lý do cuối danh sách (Thu khác, Chi phí khác) */
/** Thẻ chi phí phân bổ của phiếu chi: thẻ tạo khi lưu phiếu (_theCp, T168) và thẻ mẫu trỏ về phiếu (_goc, T436) */
export const theCuaPhieu = (r: Row | undefined): string[] => !r ? [] : [...new Set([
  ...(Array.isArray(r._theCp) ? (r._theCp as string[]) : []),
  ...theMauTheoGoc(`/app/tien/2-1-1/${r.id}`),
])]
/** Xoá phiếu chi đã tạo thẻ thì xoá luôn các thẻ đó (T436); danh sách thẻ ẩn dòng có số thẻ trong dm/8-1-1 */
export function xoaTheCuaPhieu(ds: (Row | undefined)[], ai: string) {
  const so = ds.flatMap(theCuaPhieu)
  if (so.length) xoaPhieu('dm/8-1-1', so.map(x => ({ id: x, so: x })), ai)
}

/** Lý do chi đưa vào chi phí chờ phân bổ (MA_LY_CHO_PHAN_BO): lưu phiếu xong báo rồi mở màn tạo thẻ chi phí phân bổ (T419) */
export const LY_CHO_PHAN_BO = 'Chi phí chờ phân bổ'

export const LY_THEO_DG: [string, string][] = [
  ['thue', 'Chi phí khác'], ['no khach', 'Thu Nợ'], ['tra no', 'Thu Nợ'], ['ban hang', 'Thu tiền bán hàng'],
  ['dat tiec', 'Thu tiền bán hàng'], ['tien don', 'Thu tiền bán hàng'], ['tam ung', 'Tạm ứng cho nhân viên'], ['tra tien', 'Thanh toán tiền cho nhà cung cấp'],
  ['mua', 'Chi phí nguyên liệu phụ'], ['luong', 'Thanh toán tiền lương'],   // tên lý do theo danh sách FABi (T269)
]

/** Tổng tiền ở dải đáy form, số thẳng mép cột Thành tiền của bảng chi tiết; không thấy bảng thì nằm sát phải (T49) */
/** Dải tổng cố định ở đáy form (T105): các khoản bên trái, khoản bằng 0 hiện mờ; Tổng tiền bên phải.
 *  tren: các khoản xếp thành hàng ngay trên Tổng tiền ở góc phải (T106) */
export function DaiTong({ muc, tong, nhan = 'Tổng tiền', tren = [] }: { muc: [string, number][]; tong: number; nhan?: string; tren?: [string, number][] }) {
  const so = (v: number) => (v < 0 ? `-${money(-v)}` : money(v))
  return (
    <div className="pos-day">
      {muc.map(([t, v]) => (
        <span key={t} className={`pos-day-o${v ? '' : ' khong'}${v < 0 ? ' am' : ''}`}><small>{t}</small><b>{so(v)}</b></span>
      ))}
      {tren.length > 0 ? (
        <span className="pos-day-cot">
          {tren.map(([t, v]) => <Fragment key={t}><small>{t}</small><b className={v < 0 ? 'am' : ''}>{so(v)}</b></Fragment>)}
          <small>{nhan}</small><b className="lon">{moneyD(tong)}</b>
        </span>
      ) : (
        <span className="pos-day-tong"><small>{nhan}</small><b>{moneyD(tong)}</b></span>
      )}
    </div>
  )
}

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

/** Tháng ghi nhận chi phí chọn được: tháng của ngày chứng từ rồi lùi về các tháng trước, dừng ở tháng đã khoá sổ */
export function thangLaiLo(ngay: string): string[] {
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

/** Hộp thanh toán ngay cho phiếu mua, bán còn nợ (T91): chọn hình thức, quỹ, ngày, số tiền; lưu thì sinh phiếu thu, chi */
function HopThanhToan({ tieuDe, chiTt, conLai, quyTm, ngay0, dg0, onDong, onLuu }: {
  tieuDe: string; chiTt: boolean; conLai: number; quyTm: string; ngay0: string; dg0: string
  onDong: () => void; onLuu: (ht: 'tienmat' | 'chuyenkhoan', quy: string, ngay: string, tien: number, dg: string) => void
}) {
  const [ht, setHt] = useState<'tienmat' | 'chuyenkhoan'>('tienmat')
  const dsQ = ht === 'tienmat' ? [quyTm] : QUY_TIEN.slice(CUA_HANG.length)
  const [quy, setQuy] = useState(quyTm)
  const [ngay, setNgay] = useState(ngay0)
  const [tien, setTien] = useState(conLai)
  const [dg, setDg] = useState(dg0)
  useEffect(() => { setQuy(dsQ[0] ?? '') }, [ht])
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onDong() } }
    document.addEventListener('keydown', key, true)
    return () => document.removeEventListener('keydown', key, true)
  }, [onDong])
  const loai = ht === 'tienmat' ? (chiTt ? 'chi' : 'thu') : (chiTt ? 'unc' : 'bc')
  const loi = tien <= 0 ? 'Số tiền phải lớn hơn 0' : tien > conLai ? `Không vượt số còn phải ${chiTt ? 'trả' : 'thu'} ${money(conLai)} đ` : !quy ? 'Chọn quỹ' : ''
  return createPortal(
    <div className="overlay ds-hop-nen" onMouseDown={e => { if (e.target === e.currentTarget) onDong() }}>
      <div className="ds-hop" role="dialog" aria-modal="true" aria-label={tieuDe} style={{ width: 480 }}>
        <div className="ds-hop-dau"><b>{tieuDe}</b></div>
        <div className="stack" style={{ gap: 12, padding: '4px 18px 14px' }}>
          <div className="row" style={{ gap: 16, fontSize: 13 }}>
            <label className="row" style={{ gap: 6, cursor: 'pointer' }}><input type="radio" checked={ht === 'tienmat'} onChange={() => setHt('tienmat')} />Tiền mặt</label>
            <label className="row" style={{ gap: 6, cursor: 'pointer' }}><input type="radio" checked={ht === 'chuyenkhoan'} onChange={() => setHt('chuyenkhoan')} />Chuyển khoản</label>
          </div>
          <div className="f">
            <label>{ht === 'tienmat' ? 'Quỹ tiền mặt' : 'Quỹ ngân hàng'} <em>*</em></label>
            <ChonDanhMuc dm={ht === 'tienmat' ? 'quyTm' : 'tkNh'} nhan={ht === 'tienmat' ? 'quỹ tiền mặt' : 'quỹ ngân hàng'} value={quy} onChange={setQuy} ds={dsQ} khongThem />
          </div>
          <div className="row" style={{ gap: 10 }}>
            <div className="f" style={{ flex: 1 }}>
              <label>Ngày chứng từ <em>*</em></label>
              <ONgay value={ngay} onChange={setNgay} />
            </div>
            <div className="f" style={{ flex: 1 }}>
              <label>Số tiền <em>*</em></label>
              <input className="inp num" value={money(tien)} onChange={e => setTien(Number(e.target.value.replace(/\D/g, '')) || 0)} />
            </div>
          </div>
          <div className="f">
            <label>Diễn giải</label>
            <input className="inp" value={dg} onChange={e => setDg(e.target.value)} />
          </div>
          <small className="muted">Còn phải {chiTt ? 'trả' : 'thu'} {money(conLai)} đ. Lưu sẽ lập phiếu {TEN_CT_TT[loai].toLowerCase()} bên Thu chi.</small>
          {loi && <small style={{ color: 'var(--red)' }}>{loi}</small>}
        </div>
        <div className="ds-chan">
          <span className="grow" />
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          <button type="button" className="btn pri" disabled={Boolean(loi)} onClick={() => onLuu(ht, quy, ngay, tien, dg)}>Lập phiếu {TEN_CT_TT[loai].toLowerCase()}</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/** Chứng từ thu, chi sinh từ phiếu mua, bán trả tiền ngay (T85), theo loại phiếu của màn Thu chi 2.1.1 */
export const MAN_THU_CHI = 'tien/2-1-1'
/** Ô chọn quỹ trên hàng Thanh toán: chữ và chiều cao như phần còn lại của hàng */
const O_TT = { fontSize: 13, height: 30, minWidth: 220 }
export const TEN_CT_TT: Record<string, string> = { chi: 'Chi tiền mặt', unc: 'Chi ngân hàng', thu: 'Thu tiền mặt', bc: 'Thu ngân hàng' }
export const TIEN_TO_CT_TT: Record<string, string> = { chi: 'PC', unc: 'UNC', thu: 'PT', bc: 'BC' }

export function lyMacDinh(ds: string[], dg: string) {
  const l = fold(dg)
  return LY_THEO_DG.find(([tu, ly]) => l.includes(tu) && ds.includes(ly))?.[1] ?? ds[ds.length - 1] ?? ''
}

export function layButToan(
  cfg: VoucherCfg,
  tien: number,
  thue: number,
  dt: string,
  cn: string,
  cdMa: CheDo,
  tkDoiUng?: string,
) {
  const mau = cfg.noCo ?? [['642', '111', 'Chi phí']]
  return mau.map(([no, co, dg]) => {
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
    return { no: tkTheoCheDo(noFinal, cdMa).so, co: tkTheoCheDo(coFinal, cdMa).so, dg, tien: v, dt, cn }
  }).filter(r => r.tien > 0)
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

  const rows = layButToan(cfg, tien, thue, dt, cn, cd.ma, tkDoiUng)

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
          { k: 'cn', t: 'Cửa hàng', cls: 'dim' },
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
