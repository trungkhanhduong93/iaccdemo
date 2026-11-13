// Form chứng từ toàn màn hình theo bố cục AMIS
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps, VoucherCfg } from '../../modules/types'
import { duongDan, moDuoc, tenMan, timMan } from '../../app/registry'
import { cuaHangHienTai, useSession, cheDoHienTai, ngayDauNam, truocDauNam, donViHienTai, loaiHinhDv, gtgtTyLe } from '../../app/session'
import { giamThueHang } from '../../modules/ban-hang/giam-thue'
import { ApDauBangBan, BangHangBan, COT_BHB, dongTuHang, dtDong, theoChieu } from '../../modules/ban-hang/BangHangBan'
import { kieuGhiSo, type Goi, kieuGhiSoDv, tcNhuStandard } from '../../app/plan'
import { CHE_DO, type CheDo } from '../../app/che-do'
import { tkTheoCheDo } from '../../modules/tong-hop/so-cai'
import { CUA_HANG, HANG, HOM_NAY, KHACH, KHO, LY_CAN_DOI_TUONG, LY_DO, NCC, NHAN_VIEN, TK_NGAN_HANG, daKhoaSo, khoaSoDenCua } from '../../data/mock'
import { laLyChiPhi, laLyPhanBo } from './danhMucStore'
import { DS_PTTT } from '../../modules/danh-muc/data'
import { HopXacNhan } from '../LocNangCao'
import { bayGio, ctTtCon, dsDcCon, dsTraBanCon, dsTraCon, dsTtCon, MAN_TRA_BAN, MAN_TRA_MUA, ghiNhatKy, laDaXoa, soDaTra, soKeTiep, suaPhieu, themPhieu, ttThamChieu, ttTienTheoTra, useBanPhieu, useNhatKy, xoaPhieu, type CtTt, type PhieuTt } from './daXoa'
import { Icon } from '../Icon'
import { HopPhimTat, phimDong } from '../BangPhimTat'
import { Card, Note } from '../Page'
import { FormToanMan, useDong } from '../FormToanMan'
import { baoDaLuu, huongDanDangChay } from '../huongDanForm'
import { Dropdown, MenuHead, MenuItem, Popover, Select } from '../Dropdown'
import { LichDon, ONgay } from '../ChonNgay'
import { ChonDanhMuc } from '../ChonDanhMuc'
import { heSoZoom } from '../zoom'
import { BaoCaoDoRongCtx, St, Table, useDoRongCot } from '../Table'
import { chuanKyHieuHd, chuanSoHd, dmy, fold, money, moneyD } from '../format'
import { NGUON, dongCua, tkTheoLyDo, ttNghiepVu, type Dong } from './gen'
import { boO, nhomCua, theoLoai, TT_TIEN } from './nhom'
import { BangKiemKe, COT_KK } from './BangKiemKe'
import { MAN_DC, phieuDieuChinh, type LoaiDc } from '../../modules/kho/dieu-chinh'
import { BangSanXuat, OThamChieuSx, cotSx } from '../../modules/kho/BangSanXuat'
import { SX, TT_SX, dongNhapTuXuat, type DongSx } from '../../modules/kho/san-xuat'
import { BangDieuChuyen, DauDieuChuyen, cotDcn } from '../../modules/kho/BangDieuChuyen'
import { DCN, dongNhapDc, type DongDcn } from '../../modules/kho/dieu-chuyen'
import { BangSua, DS_DOI_TUONG, HopCotPhieu, cotTuyChon } from './BangSua'
import { ApDauBang } from './ApDauBang'
import { OChiPhiMua } from './ChiPhiMuaHang'
import { BangTraNoNcc, ghiTraNo, phieuMuaConNo, type TraNo } from './BangTraNoNcc'
import { HopInChungTu, type PhieuIn } from '../bao-cao/InChungTu'
import { createPortal } from 'react-dom'
import { theMauTheoGoc, theMauTheoSo } from '../../modules/ccdc'
import { useDongLichSu, nhomTheoNgay, IconLoai } from '../mobile/MLichSu'
import { lyDoKhongXoaThe } from '../../modules/ccdc/the-phan-bo'
import { xongViecHuongDan } from '../../modules/home/HuongDan'
import { KENH_BAN } from '../../modules/bao-cao/tt152'
import {
  HopNguoiMua, HopXemHd, OKyHieu, TEN_LOAI_CT, TIEN_TO_CT, cauHinhHddt, dauDong, dsHdMoiCon, hdCua, hdGocCua, huyBanTu, khachTheoTen, kyHieuDung, kyHieuTheoCh,
  laKhachCty, loaiCtCua, phatHanhHd, soCtMoi, thieuKhach, ttHdGoc, type CtLq, type TtKhach,
} from '../../modules/ban-hang/hddt'

export interface ChungTuFormProps extends ScreenProps {
  cfg: VoucherCfg
  row?: Row
  rows?: Row[]
  children?: React.ReactNode
  anIn?: boolean
  chanThem?: React.ReactNode   // nút thêm ở chân form lúc xem, sau In phiếu (vd Xuất hoá đơn điện tử, T763)
  metaThem?: React.ReactNode   // nhãn thêm ở đầu form lúc xem (vd số hoá đơn đã phát hành, T763)
  hdDienTu?: boolean   // số, ký hiệu, ngày hoá đơn chỉ có khi đã phát hành HĐĐT: chưa phát hành thì ẩn, đã phát hành thì chỉ xem; bỏ ô tích Lập kèm hoá đơn (T763)
  lapHd?: Row   // lập hoá đơn thay thế, điều chỉnh: mẫu chép từ chứng từ gốc (mauTuGoc, T787)
}

export function ChungTuForm({ sc, mod, cfg: cfgMan, row, rows, children, anIn, chanThem, metaThem, hdDienTu, lapHd }: ChungTuFormProps) {
  const { s, set, toast } = useSession()
  const nav = useNavigate()
  const loc = useLocation()
  const [sp, setSp] = useSearchParams()

  const moi = !row
  // Hoá đơn thay thế, điều chỉnh, huỷ bán (QD107, T787): lập mới thì các ô lấy theo mẫu chép từ chứng từ gốc
  const r0 = row ?? lapHd
  const loaiCt = hdDienTu ? loaiCtCua(r0) : 'XBAN'
  const laHdMoi = loaiCt === 'HDTHAYTHE' || loaiCt === 'HDDIEUCHINH'
  const laHuyBan = loaiCt === 'HUYBAN'
  const hdGoc = hdGocCua(r0)
  const [dcLoai, setDcLoai] = useState<'giam' | 'tang'>((r0?._dcLoai as 'giam' | 'tang' | undefined) ?? 'giam')
  const dauDc: 1 | -1 = loaiCt === 'HDDIEUCHINH' && dcLoai === 'giam' ? -1 : 1
  const [lyDoHd, setLyDoHd] = useState(String(r0?._lyDoHd ?? ''))
  const [thuLuuHd, setThuLuuHd] = useState(false)
  const [xemGoc, setXemGoc] = useState(false)
  // Phiếu thu, chi đồng bộ từ FABi chỉ xem: sửa, xoá ở FABi (T283)
  const tuFabi = mod.key === 'tien' && row?.nguon === 'FABi'
  const khoaKy = !moi && !!row && daKhoaSo(row.ngay, row.cn)   // phiếu thuộc tháng đã khoá sổ của cửa hàng (T19): chỉ xem, không sửa, không xoá (T315)
  const khoaDc = dsDcCon(row).length > 0   // phiếu kiểm kê đã sinh phiếu Xuất, Nhập điều chỉnh: không sửa, vẫn xoá được (T657)
  // Phiếu nhập điều chuyển chờ nhập (T748): mở ra là sửa được thực nhận, bấm Nhập kho; không có nút Sửa, Huỷ
  const ndcCho = cfgMan.dieuChuyen === 'ndc' && row?.ttSx === 'cho'
  const [dangSua, setDangSua] = useState(moi || (ndcCho && !khoaKy) || (sp.get('sua') === '1' && !tuFabi && !khoaKy && !khoaDc))
  // Hoá đơn điều chỉnh không điều chỉnh thông tin (QD107): khối thông tin chung chỉ xem; ngày, ký hiệu hoá đơn, ngày chứng từ, lý do vẫn sửa (dinhlanphuongipacc 11/11/2026)
  const suaTtc = dangSua && loaiCt !== 'HDDIEUCHINH'
  const [tab, setTab] = useState('ct')
  const [moLoc, setMoLoc] = useState(false)   // hàng lọc của bảng chi tiết, bấm nút Lọc mới hiện (T383)
  const [hienTk, setHienTk] = useState(false)
  const [modalPhim, setModalPhim] = useState(false)
  const [phieuIn, setPhieuIn] = useState<PhieuIn[] | null>(null)
  const [hoiXoa, setHoiXoa] = useState(false)
  const [hoiKhongSua, setHoiKhongSua] = useState(false)   // phiếu đã có thẻ chi phí phân bổ: không sửa, xoá thẻ trước (T439)
  const [hoiDong, setHoiDong] = useState(false)   // phiếu đang thêm mới: hỏi lại trước khi Huỷ, đóng (T125)

  const loai = cfgMan.loai?.find(x => x.k === (row?.loai ?? sp.get('loai'))) ?? cfgMan.loai?.[0]
  const cfg = theoLoai(cfgMan, loai?.k)
  const nhom = nhomCua(mod.key, cfg, loai?.k)
  const bo = boO(nhom, cfg)
  const laKk = Boolean(cfg.kiemKe)   // phiếu kiểm kê: bỏ đối tượng, kho ở đầu phiếu, bảng tồn hệ thống, tồn thực tế (T124)
  const laDc = Boolean(cfg.dieuChinh)   // phiếu xuất, nhập điều chỉnh sinh từ kiểm kê (T126)
  const xdcDaNhap = cfgMan.dieuChuyen === 'xdc' && row?.ttSx === 'da'   // phiếu xuất điều chuyển đã nhập (T748)
  const hdDaXuat = hdDienTu && row ? hdCua(row) : undefined   // chứng từ bán hàng lập tay đã xuất HĐĐT: không sửa, không xoá (QD106, T785)
  const khoaSua = laDc || tuFabi || khoaKy || xdcDaNhap || Boolean(hdDaXuat) || laHuyBan   // không sửa, không xoá (T129, T283, T315, T748, T785); huỷ bán sửa, xoá ở hoá đơn thay thế (T787)
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
  const laNk = sc.code === '5.1.1'   // phiếu nhập khác: bỏ đối tượng, kho nhập ở đầu phiếu, chi tiết chỉ số lượng, đơn giá, thành tiền (T737)
  const laXh = sc.code === '5.1.2-3' || sc.code === '5.1.2-4'   // phiếu xuất huỷ (T741), xuất khác (T745) như nhập khác, kho xuất ở đầu phiếu, chi tiết Giá vốn, Tiền vốn
  const khoGon = laNk || laXh   // một kho ở đầu phiếu, bỏ đối tượng, bỏ thuế
  const giaVon = laXh || laDc   // xuất huỷ, xuất khác, xuất và nhập điều chỉnh: Đơn giá, Thành tiền gọi là Giá vốn, Tiền vốn (T741, T747)
  const gonDau = laKk || laDc || laSx || laDcn || khoGon    // đầu phiếu gọn: Kho, Nhân viên thực hiện; Ghi chú
  // Phiếu điều chỉnh (T131), nhập khác (T737), xuất huỷ (T741): không có thuế; gói Free không hiện giá trị phiếu điều chỉnh (đơn giá, thành tiền, tổng tiền)
  const anDc = laDc ? ['ts', 'thue', ...(s.goi === 'S' ? ['gia', 'tien'] : [])] : khoGon ? ['ts', 'thue'] : []
  const nv = useMemo(() => (r0 ? ttNghiepVu(r0) : null), [r0])
  // Phiếu trả lại hàng mua lập từ Tiện ích Trả hàng của phiếu mua (T727): điền sẵn nhà cung cấp, kho, dòng hàng, tham chiếu phiếu mua
  const traTu = moi ? (loc.state as { traTu?: TraTu } | null)?.traTu : undefined
  // Hàng bán trả lại (T815), trả lại hàng mua (T816) lập từ Tiện ích Trả hàng: không thêm hàng, chỉ sửa số lượng (không quá số trên chứng từ gốc), xoá dòng
  const traBan = Boolean(traTu) || Boolean(row?._traTuBan) || Boolean(row?._traTuMua)
  const nhanTra = traTu?.ban ? `Hàng bán trả lại theo ${traTu.so}` : `Trả lại hàng mua theo ${traTu?.so}`

  const path = duongDan(mod, sc)
  const dongForm = useDong(path)
  // Độ rộng cột đã kéo: lưới chi tiết nhớ theo màn, bảng ở tab khác nhớ riêng từng tab (T618)
  const doRongCt = useDoRongCot(path)
  const doRongTab = useDoRongCot(`${path}:${tab}`)
  // Phiếu đang thêm mới chưa lưu: Huỷ, nút X, Esc đều hỏi lại trước khi bỏ (T125)
  const dongMoi = () => (moi ? setHoiDong(true) : dongForm())
  const kieu = kieuGhiSoDv(s, mod.key)
  // Gói Standard, Plus hộ kinh doanh lưu là xong, không có Chưa ghi sổ, tab, nút Ghi sổ; Plus doanh nghiệp ghi sổ TT58, Pro hạch toán Nợ/Có (QD81)
  const coGhiSo = kieu !== 'khong'
  const coTkGoi = kieu === 'noco'

  // Trạng thái thanh toán cho mua/bán
  const [hinhThucTt, setHinhThucTt] = useState<'congno' | 'tienmat' | 'chuyenkhoan'>(
    (r0?._httt as 'congno' | 'tienmat' | 'chuyenkhoan' | undefined) ?? traTu?.httt ?? (nv?.ttTien === 'da' ? 'tienmat' : 'congno')
  )
  const [pttt, setPttt] = useState<string>((r0?._pttt as string | undefined) ?? traTu?.pttt ?? 'Tiền mặt')
  // Phiếu đã lưu trong phiên giữ đủ các ô đầu phiếu ở row._xxx (T69), không lấy lại dữ liệu mẫu
  const luuCu = (k: string) => (r0?.[`_${k}`] as string | undefined)
  const [nhanKemHd, setNhanKemHd] = useState(row?._nhanKemHd !== undefined ? Boolean(row._nhanKemHd) : nv?.ttHd === 'da' || row?.nguon === 'HĐ')

  // Dữ liệu dòng
  const idSeed = row ? `${sc.code ?? sc.slug}-${row.id}` : 'moi'
  const dongGoc = useMemo(() => (
    lapHd ? dauDong((lapHd._dong as Dong[] | undefined) ?? [], loaiCt === 'HDDIEUCHINH' ? -1 : 1)   // điều chỉnh mặc định giảm, ghi âm (T787)
    : moi ? traTu ? traTu.dong : (laSx || laDcn ? [] : cfg.dongPos ? [dongTuHang(HANG[0])] : dongCua(cfg, `mau-${loai?.k ?? ''}`).slice(0, 1)) : (row?._dong as Dong[] | undefined) ?? dongCua(cfg, idSeed)   // phiếu sản xuất mới chưa có dòng tới khi chọn kho, tham chiếu (T152)
  ), [idSeed, loai?.k, moi])

  const [dsDong, setDsDong] = useState<Dong[]>(dongGoc)
  // Chi phí mua hàng (T757): tích cạnh Nhận kèm hoá đơn thì dải đáy có ô số tiền, nút Phân bổ
  const [cpMua, setCpMua] = useState(Number(row?._cpMua) || 0)
  const [batCp, setBatCp] = useState(Boolean(row?._cpMua))
  useEffect(() => {
    setDsDong(dongGoc)
    setCpMua(Number(row?._cpMua) || 0)
    setBatCp(Boolean(row?._cpMua))
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
  const [ngayCt, setNgayCt] = useState(r0?.ngay ? String(r0.ngay) : laSx || laDcn ? bayGio() : '07/10/2026')   // phiếu sản xuất ghi cả giờ xuất, nhập như IVT (T152)
  const [soCt, setSoCt] = useState(row?.so ? String(row.so) : lapHd ? soCtMoi(rows ?? [], TIEN_TO_CT[loaiCt]) : soKeTiep(`${mod.key}/${sc.slug}`, `${cfg.prefix}2610-`))
  // Cửa hàng không sửa trên form: phiếu cũ giữ cửa hàng đã lập, phiếu mới theo cửa hàng chọn trên thanh trên
  // Thêm mới có ?cn=mã cửa hàng (vd Thanh toán ngay ở dòng cửa hàng của báo cáo công nợ NCC, T308) thì lập cho cửa hàng đó, không hỏi chọn
  // Trả hàng từ phiếu mua (T727) lập cho cửa hàng của phiếu mua
  const cnChon = (moi && (CUA_HANG.find(c => c.ten === traTu?.cn) || CUA_HANG.find(c => c.id === sp.get('cn')))) || cuaHangHienTai(s)
  const cuaHang = r0?.cn ? String(r0.cn) : cnChon?.ten ?? ''   // hoá đơn thay thế, điều chỉnh theo cửa hàng của chứng từ gốc (T787)
  const canChonCn = moi && !cnChon && !lapHd
  // Thêm mới có ?dt=tên đối tượng (vd Thanh toán ngay ở báo cáo công nợ, T304) thì điền sẵn đối tượng đó
  const [doiTuong, setDoiTuong] = useState(r0?.doiTuong ? String(r0.doiTuong) : traTu?.doiTuong || (moi && sp.get('dt')) || (cfg.doiTuong === 'ncc' ? NCC[0].ten : cfg.doiTuong === 'kh' ? KHACH[0].ten : ''))
  const [dienGiai, setDienGiai] = useState(r0?.dienGiai ? String(r0.dienGiai) : traTu ? nhanTra : cfg.dienGiai[0])
  const [nguoiGiao, setNguoiGiao] = useState(luuCu('nguoiGiao') ?? nv?.nguoi ?? NHAN_VIEN[0].ten)
  const [nhanVien, setNhanVien] = useState(luuCu('nhanVien') ?? NHAN_VIEN[0].ten)
  const [diaChi, setDiaChi] = useState(luuCu('diaChi') ?? traTu?.diaChi ?? nv?.dc ?? '45 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM')
  const [mst, setMst] = useState(luuCu('mst') ?? traTu?.mst ?? nv?.mst ?? '0319880101')
  const [soHd, setSoHd] = useState(luuCu('soHd') ?? nv?.soHd ?? '0012345')
  const [ngayHd, setNgayHd] = useState(luuCu('ngayHd') ?? nv?.ngayHd ?? '07/10/2026')
  const [kyHieuHd, setKyHieuHd] = useState(luuCu('kyHieuHd') ?? nv?.kyHieuHd ?? '1C26TMM')
  const [hanTt, setHanTt] = useState(luuCu('hanTt') ?? nv?.hanTt ?? '06/11/2026')
  // Chứng từ bán hàng lập tay (T785): công tắc Phát hành HĐĐT thay ô tích Lập kèm hoá đơn; thêm mới mặc định bật khi đã khai báo hoá đơn điện tử.
  // Ngày hoá đơn mặc định hôm nay, ký hiệu theo cửa hàng rồi khai báo chung; người mua thừa kế từ khách, khách lẻ, cá nhân tự tích Người mua không lấy hoá đơn
  const cauHd = useMemo(() => (hdDienTu ? cauHinhHddt(s) : undefined), [hdDienTu, s])
  const [phatHd, setPhatHd] = useState(Boolean(hdDienTu && ((moi && cauHd?.bat) || laHdMoi)))   // hoá đơn thay thế, điều chỉnh luôn có hoá đơn (T787)
  const [khachHd, setKhachHd] = useState<TtKhach>(() => (r0?._khachHd as TtKhach | undefined) ?? khachTheoTen(doiTuong, nguoiGiao))
  const [khongLayHd, setKhongLayHd] = useState(() => (r0?._khongLayHd !== undefined ? Boolean(r0._khongLayHd) : !laKhachCty(doiTuong)))
  const [moNguoiMua, setMoNguoiMua] = useState(false)
  const [moXemHd, setMoXemHd] = useState(false)
  useEffect(() => {
    if (!hdDienTu || hdDaXuat) return
    setNgayHd(c => (r0?._hd || r0?._khachHd ? c : dmy(HOM_NAY)))
    setKyHieuHd(c => (r0?._khachHd ? c : kyHieuTheoCh(s, cuaHang)))
  }, [hdDienTu])   // eslint-disable-line react-hooks/exhaustive-deps
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
  // Phiếu đã lưu Từ quỹ, Đến quỹ thì mở lại đúng quỹ đã chọn (T779)
  const [tuQuy, setTuQuy] = useState(() => row?._tuQuy ? String(row._tuQuy) : rut ? QUY_TIEN[CUA_HANG.length] : quyTm)
  const [denQuy, setDenQuy] = useState(() => row?._denQuy ? String(row._denQuy) : rut ? quyTm : QUY_TIEN[CUA_HANG.length])
  useEffect(() => {
    setLyDo(row?._lyDo ? String(row._lyDo) : lyGoc(row?.dienGiai ? String(row.dienGiai) : cfg.dienGiai[0]))
  }, [loai?.k, row?.id])
  // Thu chi tiền mặt và ngân hàng (T346)
  const laThuChiTien = laTien && (loai?.k === 'thu' || loai?.k === 'chi' || loai?.k === 'bc' || loai?.k === 'unc')
  const khoaLyDtStandard = tcNhuStandard(s.goi) && laThuChiTien   // gói Plus như Standard (T733)

  // Gói Free phiếu thu, chi (T346): khi mở xem vẫn hiện đúng dữ liệu đã lưu; khi bấm Sửa hoặc thêm mới thì các dòng lấy theo giá trị phía trên; đổi ô phía trên thì các dòng đổi theo ngay
  useEffect(() => {
    if (khoaLyDtStandard && (dangSua || moi)) {
      setDsDong(ds => ds.map(d => ({ ...d, ly: lyDo, dt: doiTuong })))
    }
  }, [khoaLyDtStandard, dangSua, moi, lyDo, doiTuong])

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
  // Gói Standard phiếu chi, UNC lý do Thanh toán công nợ nhà cung cấp (T718): tab Chi tiết chọn phiếu mua còn nợ để trả,
  // mỗi phiếu mua chọn thành một dòng chi tiết. Phiếu mẫu chưa chọn phiếu mua thì khi xem vẫn hiện bảng dòng như cũ
  const traNoNcc = tcNhuStandard(s.goi) && laTien && (loai?.k === 'chi' || loai?.k === 'unc') && lyDo === LY_DO.find(x => x.ma === 'CHI02')?.ten
  const [traNo, setTraNo] = useState<TraNo[]>(() => (row?._traNo as TraNo[] | undefined) ?? [])
  useEffect(() => { setTraNo((row?._traNo as TraNo[] | undefined) ?? []) }, [row?.id])
  const hienTraNo = traNoNcc && (dangSua || Boolean(row?._traNo))
  const banPhieu = useBanPhieu()
  const dsTraNo = useMemo(() => traNoNcc && dangSua ? phieuMuaConNo(doiTuong, cuaHang, row ? String(row.id) : undefined) : [],
    [traNoNcc, dangSua, doiTuong, cuaHang, row?.id, banPhieu])
  useEffect(() => {
    if (!traNoNcc || !dangSua) return
    setTraNo(c => c.filter(x => dsTraNo.some(d => d.id === x.id)))   // đổi nhà cung cấp thì bỏ phiếu không còn trong danh sách
  }, [dsTraNo])
  useEffect(() => {
    if (!traNoNcc || !dangSua) return
    const tk = tkTheoLyDo(loaiPhieuTien, lyDo)
    setDsDong(traNo.map(x => ({ ma: '', ten: `Thanh toán ${x.so}`, dvt: '', sl: 1, gia: x.tien, tien: x.tien, ts: 0, thue: 0, ly: lyDo, dt: doiTuong, ...tk })))
  }, [traNoNcc, dangSua, traNo, doiTuong])
  // Đối tượng đầu phiếu đổi thì đối tượng mọi dòng đổi theo, vẫn sửa lại được từng dòng
  useEffect(() => {
    if (laTien && cfg.doiTuong !== 'none') setDsDong(ds => ds.map(d => ({ ...d, dt: doiTuong })))
  }, [dongGoc, doiTuong])
  // Cột ẩn ở bảng chi tiết, nhớ theo màn trên máy người dùng
  const khoaCot = `iacc-cot-phieu:${mod.key}/${sc.slug}`
  // Hàng bán trả lại (T758): đủ cột như phiếu bán hàng, mặc định chỉ hiện Số lượng, Đơn giá, Thành tiền (kèm Mã, Tên, ĐVT); bật cột khác ở Tuỳ chỉnh giao diện
  const boCotBan = sc.code === '3.1.4' ? ['phiVc'] : []   // hàng bán trả lại không có Phí vận chuyển (T758)
  const anMacDinh = sc.code === '3.1.4' ? COT_BHB.map(([k]) => k).filter(k => !['ma', 'dvt', 'sl', 'gia', 'thanh'].includes(k)) : cfg.dongPos ? ['phiVc'] : []
  const [anCot, setAnCot] = useState<string[]>(() => {
    try { const g = localStorage.getItem(khoaCot); if (g === null) return anMacDinh; const v = JSON.parse(g); return Array.isArray(v) ? v : anMacDinh } catch { return anMacDinh }
  })
  const [hopCot, setHopCot] = useState(false)
  function doiAnCot(an: string[]) {
    setAnCot(an)
    try { localStorage.setItem(khoaCot, JSON.stringify(an)) } catch { /* trình duyệt chặn lưu thì chỉ giữ trong phiên */ }
  }
  // Chọn lý do: diễn giải và lý do mọi dòng theo lý do, vẫn sửa lại được
  // Mọi phiếu không có ô Diễn giải ở đầu phiếu, Ghi chú chép sang diễn giải (T77, T78). Phiếu có ô lý do: Ghi chú mặc định theo lý do; phiếu khác: mặc định là diễn giải
  const ghiChuGoc = () => r0?._ghiChu ? String(r0._ghiChu) : traTu ? nhanTra : !oLy ? (r0?.dienGiai ? String(r0.dienGiai) : cfg.dienGiai[0]) : r0?._lyDo ? String(r0._lyDo) : lyGoc(r0?.dienGiai ? String(r0.dienGiai) : cfg.dienGiai[0])
  const [ghiChu, setGhiChu] = useState(ghiChuGoc)
  // Kênh bán của chứng từ bán hàng lập tay (T785), bắt buộc: sau này là điều kiện lên kê khai thuế
  const [kenh, setKenh] = useState(String(r0?.kenh ?? (hdDienTu && moi ? KENH_BAN[0] : '')))
  useEffect(() => { setGhiChu(ghiChuGoc()) }, [loai?.k, row?.id])
  function chonLyDo(v: string) {
    setLyDo(v)
    setDienGiai(v)
    setGhiChu(v)
    if (khoaLyDtStandard) {
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
    // Đổi khách thì người mua trên hoá đơn đổi theo; khách lẻ, cá nhân tự tích Người mua không lấy hoá đơn (T785)
    if (hdDienTu) { setKhachHd(khachTheoTen(v, nguoiGiao)); setKhongLayHd(!laKhachCty(v)) }
    if (khoaLyDtStandard) {
      setDsDong(ds => ds.map(d => ({ ...d, dt: v })))
    }
  }
  // Gói Free: tháng hạch toán lãi lỗ, mặc định tháng của ngày chứng từ, chọn được các tháng trước chưa khoá sổ (T49)
  // Quỹ của phiếu (T51): phiếu tiền mặt chỉ chọn quỹ tiền mặt của cửa hàng lập phiếu, phiếu ngân hàng chọn tài khoản ngân hàng
  // Mua, bán trả tiền ngay (T78): tiền mặt chọn quỹ tiền mặt, chuyển khoản chọn quỹ ngân hàng
  const dsQuy = nhom === 'thu' || nhom === 'chi' || (bo.tt && hinhThucTt === 'tienmat') ? [quyTm]
    : nhom === 'nhthu' || nhom === 'nhchi' || (bo.tt && hinhThucTt === 'chuyenkhoan') ? QUY_TIEN.slice(CUA_HANG.length) : []
  const [quy, setQuy] = useState(() => r0?._quy ? String(r0._quy) : dsQuy.includes(quyTm) ? quyTm : dsQuy[0] ?? '')
  useEffect(() => { setQuy(row?._quy ? String(row._quy) : dsQuy.includes(quyTm) ? quyTm : dsQuy[0] ?? '') }, [loai?.k, row?.id])
  useEffect(() => { if (!dsQuy.includes(quy)) setQuy(dsQuy[0] ?? '') }, [hinhThucTt])
  // Kho của phiếu mua, bán (T83): gói dưới Pro chọn một kho ở đầu phiếu, gói Pro chọn kho trên từng dòng.
  // Cửa hàng chỉ có một kho thì phiếu mới lấy luôn kho đó
  const dsKhoCn = CUA_HANG.find(c => c.ten === cuaHang)?.kho ?? KHO
  const khoMotCn = dsKhoCn.length === 1 ? dsKhoCn[0] : ''
  const khoDau = bo.kho === 'dong' && (nhom === 'mua' || nhom === 'ban') && s.goi !== 'PR'
  const [kho, setKho] = useState(() => luuCu('kho') || (moi ? traTu?.kho || khoMotCn : dongGoc.find(d => d.kho)?.kho ?? dsKhoCn[0] ?? ''))
  useEffect(() => {
    if (khoDau || khoGon) setDsDong(ds => ds.map(d => ({ ...d, kho })))
  }, [dongGoc, kho, khoDau, khoGon])
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
  const coHdDau = hdDienTu ? Boolean(hdDaXuat) || ((dangSua || laHdMoi) && phatHd) : (nhom === 'mua' || nhom === 'ban') && Boolean(bo.hd) && nhanKemHd
  const coThangLl = laTien && tcNhuStandard(s.goi) && nhom !== 'cq'   // chuyển quỹ không ảnh hưởng lãi lỗ
  const dsThangLl = useMemo(() => thangLaiLo(ngayCt, cuaHang), [ngayCt, cuaHang])
  const [thangLl, setThangLl] = useState(dsThangLl[0])
  useEffect(() => { setThangLl(dsThangLl[0]) }, [dsThangLl])

  // Hoá đơn điều chỉnh (T787): người dùng nhập số dương, phần mềm tự đổi dấu theo loại điều chỉnh
  const doiDong = (ds: Dong[]) => setDsDong(loaiCt === 'HDDIEUCHINH' ? theoChieu(ds, dauDc, dsDong) : ds)   // gõ âm hay dương ở số lượng, đơn giá, ô tiền đều được, dòng tự theo chiều tăng, giảm
  // Tính tổng
  const tongTien =dsDong.reduce((a, d) => a + (d.tien || 0), 0)
  // Dòng kiểu Xuất bán POS (T753): giảm giá gộp vào phần trừ cùng chiết khấu, phí dịch vụ cộng vào doanh thu
  const tongGiamGia = cfg.dongPos ? dsDong.reduce((a, d) => a + (d.giam || 0), 0) : 0
  const tongPhiDv = cfg.dongPos ? dsDong.reduce((a, d) => a + (d.phiDv || 0), 0) : 0
  const tongCk = dsDong.reduce((a, d) => a + (d.ck || 0), 0) + tongGiamGia - tongPhiDv
  // Chứng từ bán hàng khi GTGT theo % doanh thu (T450): không tiền thuế, trừ Giảm thuế GTGT tính trên tiền sau chiết khấu từng dòng
  // theo % GTGT của hàng và cấu hình giảm thuế ở Cấu hình kế toán (T754)
  const giamGtgt = nhom === 'ban' && cfg.thue !== 0 && gtgtTyLe(s)
  const tongThue = giamGtgt ? 0 : dsDong.reduce((a, d) => a + (d.thue || 0), 0)
  const tongGiam = giamGtgt ? dsDong.reduce((a, d) => a + giamThueHang(cfg.dongPos ? dtDong(d) : (d.tien || 0) - (d.ck || 0), d.ma), 0) : 0
  const tongPhiVc = cfg.dongPos ? dsDong.reduce((a, d) => a + (d.phiVc || 0), 0) : 0   // T758
  const tongThanhToan = tongTien - tongCk + tongThue - tongGiam + tongPhiVc
  // Tiền tạm tính trên hoá đơn (T785): trước thuế là doanh thu tính thuế; thuế theo % doanh thu thì ghi giảm trừ thuế
  const tienHdTam = { truoc: tongTien - tongCk + tongPhiVc, thue: giamGtgt ? tongGiam : tongThue, tong: tongThanhToan }
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
  const coCpMua = truocThue && !traLai && !laKk && !laSx && !laDcn   // phiếu mua hàng nhập kho có ô tích Chi phí mua hàng (T757)
  const cpCo = coCpMua && batCp   // đang tích: hiện ô ở dải đáy và cột Chi phí mua hàng trên bảng
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
    themPhieu(MAN_THU_CHI, { id, so, cn: cuaHang, nguon: 'tay', tt: coGhiSo ? 'nhap' : 'ghi', loai: loaiTt, tenLoai: TEN_CT_TT[loaiTt], ...nd }, s.ten)
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
  // Chứng từ liên quan cho dòng Tham chiếu (T585): phiếu thu, chi của phiếu mua, bán; thẻ chi phí; phiếu điều chỉnh của kiểm kê;
  // phiếu nhập của phiếu xuất sản xuất, điều chuyển; phiếu gốc của phiếu sinh ra. Phiếu nhập sản xuất, điều chuyển đã có ô chọn tham chiếu
  const dsThamChieu: { so: string; to: string; ten: string; state?: unknown }[] = !row ? [] : [
    ...(ctTtCu ? [{ so: ctTtCu.so, to: `/app/tien/2-1-1/${ctTtCu.id}`, ten: TEN_CT_TT[ctTtCu.loai] ?? '' }] : []),
    ...dsTt.map(c => ({ so: c.so, to: `/app/tien/2-1-1/${c.id}`, ten: `${TEN_CT_TT[c.loai] ?? ''} ${money(c.tien)}` })),
    ...(oLy ? theCuaPhieu(row).map(so => ({ so, to: `/app/ccdc/8-1-1?mo=${so}`, ten: 'Thẻ chi phí phân bổ', state: { veGoc: `${path}/${row.id}` } })) : []),
    ...(laKk ? dsDcCon(row).map(c => ({ so: c.so, to: `/app/${MAN_DC}/${c.id}`, ten: 'Phiếu điều chỉnh' })) : []),
    ...(((laSx && !sxNhap) || dcn === 'xdc') && row._phieuNhap ? [(pn => ({ so: pn.so, to: `/app/${sx ? manDoi : DCN.ndc.man}/${pn.id}`, ten: 'Phiếu nhập' }))(row._phieuNhap as { id: string; so: string })] : []),
    ...dsTraCon(row).map(c => ({ so: c.so, to: `/app/${MAN_TRA_MUA}/${c.id}`, ten: 'Phiếu trả lại hàng mua' })),   // T727
    ...dsTraBanCon(row).map(c => ({ so: c.so, to: `/app/${MAN_TRA_BAN}/${c.id}`, ten: 'Hàng bán trả lại' })),   // T815
    ...(row._thamChieu && row._thamChieuDi && !sxNhap && dcn !== 'ndc' ? [{ so: String(row._thamChieu), to: String(row._thamChieuDi), ten: row._traTuMua ? 'Phiếu mua hàng' : row._traTuBan ? 'Chứng từ bán hàng' : 'Chứng từ gốc' }] : []),
    // Chứng từ gốc, hoá đơn thay thế, huỷ bán, hoá đơn điều chỉnh tham chiếu lẫn nhau (QD107, T787)
    ...(hdGoc ? [{ so: hdGoc.so, to: `${path}/${hdGoc.id}`, ten: 'Chứng từ gốc' }] : []),
    ...([row._huyBan, row._hdTt] as (CtLq | undefined)[]).filter((c): c is CtLq => Boolean(c) && !laDaXoa(`${mod.key}/${sc.slug}`, c!.id))
      .map(c => ({ so: c.so, to: `${path}/${c.id}`, ten: TEN_LOAI_CT[c.loai] })),
    ...(hdDienTu ? dsHdMoiCon(`${mod.key}/${sc.slug}`, row).map(c => ({ so: c.so, to: `${path}/${c.id}`, ten: TEN_LOAI_CT[c.loai] })) : []),
  ]
  // Tiện ích Trả hàng ở phiếu mua có dòng hàng (T727): mở Thêm phiếu trả lại hàng mua điền sẵn từ phiếu này
  const manTra = timMan('mua-hang', '4-1-4').sc
  const coTraHang = Boolean(row) && nhom === 'mua' && !traLai && cfg.dong === 'nvl' && Boolean(manTra) && moDuoc(manTra!, s.goi)
  // Chứng từ bán hàng lập tay (T815): Trả hàng mở Thêm hàng bán trả lại; trừ huỷ bán, hoá đơn điều chỉnh, hoá đơn đã bị thay thế
  const manTraBan = timMan('ban-hang', '3-1-4').sc
  const coTraBan = Boolean(row) && Boolean(hdDienTu) && (loaiCt === 'XBAN' || loaiCt === 'HDTHAYTHE') && row?.nguon !== 'FABi'
    && ttHdGoc(`${mod.key}/${sc.slug}`, row!) !== 'Bị thay thế' && Boolean(manTraBan) && moDuoc(manTraBan!, s.goi)
  function moTraHang() {
    if (!row) return
    // Hàng bán trả lại chép mọi thông tin trừ ngày, số chứng từ, số hoá đơn; số lượng tối đa mỗi dòng là số lượng đã bán
    const tu: TraTu = {
      id: String(row.id), so: soCt, man: `${mod.key}/${sc.slug}`, di: `${path}/${row.id}`, cn: cuaHang,
      doiTuong, mst, diaChi, kho, dong: dsDong.filter(d => d.sl > 0).map(d => ({ ...d, slMax: d.sl })),
      dsTra: coTraBan ? dsTraBanCon(row) : dsTraCon(row), ...(coTraBan ? { ban: true, httt: hinhThucTt, pttt } : {}),
    }
    nav(`/app/${coTraBan ? MAN_TRA_BAN : MAN_TRA_MUA}/moi`, { state: { traTu: tu } })
  }
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
      id, so, cn: cuaHang, nguon: 'tay', tt: coGhiSo ? 'nhap' : 'ghi', loai, tenLoai: TEN_CT_TT[loai],
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

  function luu(moMoi = false, phNgay = false) {
    // Chứng từ thêm mới không được có ngày trước ngày đầu năm của đơn vị (Thông tin đơn vị)
    if (moi && truocDauNam(s, ngayCt.split(' ')[0])) {
      toast(`Ngày chứng từ phải từ ngày đầu năm ${ngayDauNam(s)} trở đi`)
      return
    }
    // Phiếu thu, chi chỉ bắt buộc đối tượng khi lý do là thu nợ, đi vay, chi công nợ, cho vay (T330)
    if (laTien && canDt && !doiTuong.trim()) { toast(`Chọn đối tượng cho lý do ${lyDo}`); return }
    if (traNoNcc && !traNo.length) { toast('Chọn phiếu mua cần thanh toán ở tab Chi tiết'); return }   // T718
    if (khoGon && !kho) { toast(laNk ? 'Chọn Kho nhập' : 'Chọn Kho xuất'); return }   // T737, T741
    if (khoDau && !kho) { toast((nhom === 'ban') !== (cfg.prefix === 'TLN' || cfg.prefix === 'TL') ? 'Chọn Kho xuất' : 'Chọn Kho nhập'); return }   // kho đầu phiếu mua, bán có dấu * (T790)
    if (hdDienTu && !kenh) { toast('Chọn Kênh bán'); return }   // T785
    // Phiếu sản xuất (T152): bắt buộc kho, phiếu nhập bắt buộc tham chiếu, phải có dòng
    if (laSx) {
      const thieu = sxNhap && !thamChieuSx.id ? 'Chọn phiếu tham chiếu' : !kho ? `Chọn ${sxNhap ? 'Kho nhập' : 'Kho xuất'}` : !dsDong.length ? 'Phiếu chưa có dòng hàng nào' : ''
      if (thieu) { toast(thieu); return }
    }
    // Điều chuyển (T155): đủ kho, cửa hàng hai đầu; chuyển kho thì kho nhận khác kho xuất
    if (laDcn) {
      const thieu = dcn === 'ndc' && !thamChieuSx.id ? 'Chọn phiếu tham chiếu' : !kho ? `Chọn ${dcn === 'ndc' ? 'Kho nhận' : 'Kho xuất'}`
        : dcn !== 'ndc' && !khoNhan ? 'Chọn Kho nhận'
          : dcn === 'ck' && khoNhan === kho ? 'Kho nhận phải khác kho xuất' : !dsDong.length ? 'Phiếu chưa có dòng hàng nào' : ''
      if (thieu) { toast(thieu); return }
    }
    // Hàng bán trả lại (T815), trả lại hàng mua (T816): phải còn dòng, số lượng trả lớn hơn 0 và không quá số trên chứng từ gốc
    if (traBan) {
      const sai = dsDong.find(d => !(d.sl > 0) || (d.slMax !== undefined && d.sl > d.slMax))
      if (!dsDong.length) { toast('Chứng từ chưa có dòng hàng nào'); return }
      if (sai) { toast(sai.sl > 0 ? `Số lượng trả lại của ${sai.ten} không được quá ${sai.slMax} (số lượng đã ${nhom === 'mua' ? 'mua' : 'bán'})` : `Nhập số lượng trả lại của ${sai.ten}`); return }
    }
    // Hoá đơn thay thế, điều chỉnh (T787): bắt buộc lý do; Lưu dự thảo chưa phát hành, Lưu và phát hành thì phát hành luôn
    if (laHdMoi && !lyDoHd.trim()) { setThuLuuHd(true); toast(`Nhập lý do ${loaiCt === 'HDTHAYTHE' ? 'thay thế' : 'điều chỉnh'}`); return }
    // Lưu và phát hành (T785): kiểm ngày, ký hiệu hoá đơn, người mua trước khi lưu
    const phatHanh = laHdMoi ? phNgay : Boolean(hdDienTu && phatHd && !hdDaXuat)
    if (phatHanh) {
      const thieuNm = khongLayHd ? null : thieuKhach(khachHd)
      const thieu = !ngayHd ? 'Chọn Ngày hoá đơn' : !kyHieuDung(kyHieuHd) ? 'Ký hiệu hoá đơn gồm 7 ký tự, vd 1C26TAA' : thieuNm ? `${thieuNm} trên hoá đơn, bấm Sửa ở ô Xuất HĐ cho` : ''
      if (thieu) { toast(thieu); return }
    }
    const idMoi = `moi-${Date.now()}`
    const ctTt = dongBoCtTt(moi ? idMoi : String(row?.id))
    const dsDc = laKk ? dongBoDc(moi ? idMoi : String(row?.id)) : undefined
    // Bản mẫu chưa có backend: phiếu mới lên đầu danh sách, phiếu sửa hiện nội dung mới, tới khi tải lại trang (T49)
    const dongLuu = khoaLyDtStandard
      ? dsDong.map(d => ({ ...d, ly: lyDo, dt: doiTuong }))
      : dsDong
    const noiDung = {
      ngay: ngayCt, thang: Number(ngayCt.split('/')[1]) || 10, doiTuong, dienGiai,
      tien: tongTien - tongCk, thue: tongThue, tong: tongThanhToan, _dong: dongLuu, _lyDo: lyDo, _ghiChu: ghiChu, _quy: quy, _kho: kho,
      _nguoiGiao: nguoiGiao, _nhanVien: nhanVien, _diaChi: diaChi, _mst: mst, _hanTt: hanTt,
      _nhanKemHd: nhanKemHd, _soHd: soHd, _ngayHd: ngayHd, _kyHieuHd: kyHieuHd, _httt: hinhThucTt, _ctTt: ctTt,
      ...(nhom === 'ban' && hinhThucTt !== 'congno' ? { _pttt: pttt } : {}),
      ...(nhom === 'cq' ? { _tuQuy: tuQuy, _denQuy: denQuy } : {}),   // T779
      ...(hdDienTu ? { _khachHd: khachHd, _khongLayHd: khongLayHd, kenh } : {}),   // người mua trên hoá đơn (T785)
      // Hoá đơn thay thế, điều chỉnh (T787): ghi sổ ngay khi lưu kể cả dự thảo, giữ hoá đơn gốc, lý do, tiền hoá đơn để phát hành sau
      ...(laHdMoi ? { tt: 'ghi', _loaiCt: loaiCt, _hdGoc: hdGoc, _lyDoHd: lyDoHd.trim(), _tienHd: tienHdTam, ...(loaiCt === 'HDDIEUCHINH' ? { _dcLoai: dcLoai } : {}) } : {}),
      ...(dsDc ? { _dsDc: dsDc } : {}),
      ...(coCpMua ? { _cpMua: cpCo ? cpMua : 0 } : {}),
      ...(traTu ? { _thamChieu: traTu.so, _thamChieuDi: traTu.di, ...(traTu.ban ? { _traTuBan: traTu.id } : { _traTuMua: traTu.id }) } : {}),   // T727, T815
      ...(laTien ? { _traNo: traNoNcc ? traNo : undefined } : {}),
      // Phiếu sản xuất (T152): tham chiếu phiếu xuất, người cập nhật; phiếu xuất mới chờ nhập, phiếu nhập lưu là đã nhập
      ...(laSx ? {
        ttSx: row?.ttSx ?? (sxNhap ? 'da' : 'cho'),
        ...(moi ? {} : { _ngayCapNhat: bayGio(), _nguoiCapNhat: s.ten }),
        ...(sxNhap ? { _thamChieu: thamChieuSx.so, _thamChieuId: thamChieuSx.id, _thamChieuDi: `/app/${SX[SX[sx!].doi!].man}/${thamChieuSx.id}` } : {}),
      } : {}),
      // Điều chuyển (T155): phiếu xuất mới chờ nhập, phiếu nhập lưu là đã nhập; chuyển kho không có trạng thái
      ...(laDcn ? {
        // Phiếu nhập chờ (sinh kèm phiếu xuất, T748): Nhập kho thì Đã nhập, ghi sổ
        ...(dcn !== 'ck' ? { ttSx: dcn === 'ndc' ? (row?.ttSx === 'huy' ? 'huy' : 'da') : row?.ttSx ?? 'cho' } : {}),
        ...(ndcCho ? { tt: 'ghi' } : {}),
        ...(moi ? {} : { _ngayCapNhat: bayGio(), _nguoiCapNhat: s.ten }),
        ...(dcn === 'xdc' ? { doiTuong: cnNhan, _cnNhan: cnNhan } : {}),
        ...(dcn === 'ndc' ? { doiTuong: nguonDc.cn, _cnXuat: nguonDc.cn, _khoXuat: nguonDc.kho,
          _thamChieu: thamChieuSx.so, _thamChieuId: thamChieuSx.id, _thamChieuDi: `/app/${manDoi}/${thamChieuSx.id}` } : { _khoNhan: khoNhan }),
      } : {}),
    }
    const man = `${mod.key}/${sc.slug}`
    if (moi) {
      themPhieu(man, {
        id: idMoi, so: soCt, cn: cuaHang, nguon: 'tay', tt: coGhiSo ? 'nhap' : 'ghi',
        loai: loai?.k, tenLoai: loai?.ten, ...noiDung,
      }, s.ten)
      ghiNhatKy(man, idMoi, soCt, s.ten, traTu ? `Thêm mới chứng từ, trả lại hàng của ${traTu.so}` : 'Thêm mới chứng từ')
      // Phiếu mua ghi lại phiếu trả lại này để hiện ở Tham chiếu và chặn xoá phiếu mua khi còn phiếu trả (T727)
      if (traTu) {
        const dsMoi = [...traTu.dsTra, { id: idMoi, so: soCt, loai: 'tra' }]
        suaPhieu(traTu.man, traTu.id, traTu.ban ? { _dsTraBan: dsMoi } : { _dsTra: dsMoi })
        ghiNhatKy(traTu.man, traTu.id, traTu.so, s.ten, `Trả lại hàng bằng ${soCt}`)
      }
    } else if (row) {
      suaPhieu(man, String(row.id), noiDung)
      const g = goc.current, m = chupNd()
      const doi = ([['ngay', 'Ngày chứng từ'], ['doiTuong', 'Đối tượng'], ['quy', 'Quỹ'], ['kho', 'Kho'], ['lyDo', 'Lý do'], ['dienGiai', 'Diễn giải'], ['ghiChu', 'Ghi chú'], ['dong', 'Dòng chi tiết']] as const)
        .filter(([k]) => g[k] !== m[k]).map(([, ten]): string => ten)
      if (g.tong !== m.tong) doi.push(`Tổng tiền ${money(g.tong)} → ${money(m.tong)}`)
      if (ndcCho) ghiNhatKy(man, String(row.id), soCt, s.ten, doi.length ? `Nhập kho, sửa: ${doi.join(', ')}` : 'Nhập kho')
      else if (doi.length) ghiNhatKy(man, String(row.id), soCt, s.ten, `Sửa chứng từ: ${doi.join(', ')}`)
    }
    // Phiếu mua được trả ghi thêm phiếu chi này vào phần đã thanh toán; bỏ chọn hoặc đổi lý do thì gỡ ra (T718)
    if (laTien && (traNoNcc || row?._traNo)) {
      ghiTraNo({ id: moi ? idMoi : String(row!.id), so: soCt, loai: String(loai?.k) }, (row?._traNo as TraNo[] | undefined) ?? [], traNoNcc ? traNo : [], s.ten)
    }
    // Xuất điều chuyển (T748): sinh phiếu nhập điều chuyển ở cửa hàng nhận, trạng thái Chờ nhập; sửa phiếu xuất khi phiếu nhập còn chờ thì phiếu nhập đổi theo
    if (dcn === 'xdc' && (!row?._phieuNhap || row.ttSx === 'cho')) {
      const idX = moi ? idMoi : String(row!.id), pn = row?._phieuNhap as { id: string; so: string } | undefined
      const ndNhap = {
        ngay: ngayCt, thang: Number(ngayCt.split('/')[1]) || 10, cn: cnNhan, doiTuong: cuaHang, _cnXuat: cuaHang, _khoXuat: kho, _kho: khoNhan,
        _dong: dongNhapDc({ _dong: dsDong }), tien: tongTien, thue: 0, tong: tongTien, dienGiai: ghiChu, _ghiChu: ghiChu, ttSx: 'cho', tt: 'nhap',
        _thamChieu: soCt, _thamChieuId: idX, _thamChieuDi: `/app/${DCN.xdc.man}/${idX}`,
      }
      if (pn) suaPhieu(DCN.ndc.man, pn.id, ndNhap)
      else {
        const idN = `${idMoi}-ndc`, soN = soKeTiep(DCN.ndc.man, `${DCN.ndc.prefix}2610-`)
        themPhieu(DCN.ndc.man, { id: idN, so: soN, nguon: 'tay', ...ndNhap }, s.ten)
        ghiNhatKy(DCN.ndc.man, idN, soN, s.ten, `Sinh từ phiếu xuất điều chuyển ${soCt}`)
        suaPhieu(DCN.xdc.man, idX, { _phieuNhap: { id: idN, so: soN } })
      }
    }
    // Lưu phiếu nhập sản xuất: phiếu xuất tham chiếu chuyển Đã nhập; đổi tham chiếu thì phiếu xuất cũ về Chờ nhập (T152). Nhập điều chuyển cũng vậy (T155)
    if (coTcNhap) {
      const manXuat = manDoi, cu = String(row?._thamChieuId ?? '')
      if (cu && cu !== thamChieuSx.id) suaPhieu(manXuat, cu, { ttSx: 'cho', _phieuNhap: undefined })
      suaPhieu(manXuat, thamChieuSx.id, { ttSx: 'da', _phieuNhap: { id: moi ? idMoi : String(row?.id), so: soCt } })
    }
    // Hoá đơn thay thế mới (T787): sinh cùng lúc huỷ bán y hệt chứng từ gốc, ghi âm; chứng từ gốc ghi lại hai chứng từ mới để tham chiếu.
    // Sửa ngày hoá đơn thay thế thì huỷ bán đổi ngày theo, sửa thông tin khác không ảnh hưởng huỷ bán
    let soHb = ''
    if (laHdMoi && hdGoc) {
      if (moi) {
        const moiCt: CtLq = { id: idMoi, so: soCt, loai: loaiCt }
        const ds: CtLq[] = [moiCt]
        if (loaiCt === 'HDTHAYTHE' && lapHd) {
          const idHb = `${idMoi}-hb`
          soHb = soCtMoi(rows ?? [], TIEN_TO_CT.HUYBAN)
          themPhieu(man, huyBanTu(lapHd, idHb, soHb, ngayCt, hdGoc, moiCt), s.ten)
          ghiNhatKy(man, idHb, soHb, s.ten, `Thêm mới chứng từ, sinh kèm hoá đơn thay thế ${soCt}`)
          suaPhieu(man, idMoi, { _huyBan: { id: idHb, so: soHb, loai: 'HUYBAN' } })
          ds.push({ id: idHb, so: soHb, loai: 'HUYBAN' })
        }
        const goc0 = rows?.find(r => String(r.id) === hdGoc.id)
        suaPhieu(man, hdGoc.id, { _dsHdMoi: [...((goc0?._dsHdMoi as CtLq[] | undefined) ?? []), ...ds] })
        ghiNhatKy(man, hdGoc.id, hdGoc.so, s.ten, `Lập ${TEN_LOAI_CT[loaiCt].toLowerCase()} ${soCt}`)
      } else if (row?._huyBan && ngayCt !== row.ngay) {
        const hb = row._huyBan as CtLq
        suaPhieu(man, hb.id, { ngay: ngayCt, thang: Number(ngayCt.split('/')[1]) || 10 })
        ghiNhatKy(man, hb.id, hb.so, s.ten, `Đổi ngày theo hoá đơn thay thế ${soCt}`)
      }
    }
    const hdMoi = phatHanh ? phatHanhHd(s, man, moi ? idMoi : String(row!.id), kyHieuHd, ngayHd, khachHd, khongLayHd, tienHdTam) : undefined
    toast(hdMoi ? `Đã lưu ${soCt}, đã ${laHdMoi ? 'phát hành' : 'xuất'} hoá đơn ${hdMoi.mau}${hdMoi.kyHieu} số ${hdMoi.so}${soHb ? `, sinh huỷ bán ${soHb}` : ''}`
      : laHdMoi ? `Đã lưu dự thảo ${soCt}${soHb ? `, sinh huỷ bán ${soHb}` : ''}`
      : moi ? `Đã lưu ${soCt}` : ndcCho ? `Đã nhập kho ${soCt}` : `Đã lưu thay đổi ${soCt}`)
    if (moi) baoDaLuu({ man, id: idMoi, so: soCt })   // tour Hướng dẫn nhanh ghi lại phiếu mẫu để xoá khi tắt tour (T681)
    // Phiếu chi mới lý do Chi phí chờ phân bổ: báo rồi mở màn tạo thẻ chi phí phân bổ, điền sẵn từ phiếu (T419: thông báo, không hỏi)
    // Mỗi dòng phiếu có lý do Chi phí chờ phân bổ thành một dòng chi tiết của thẻ (tên = diễn giải, số tiền = thành tiền)
    // Sửa phiếu (vd đã xoá thẻ cũ để sửa, T439): phiếu chưa còn thẻ nào thì cũng báo tạo thẻ như phiếu mới
    // Lý do được tích Chi phí phân bổ nhiều kỳ ở danh mục Lý do nghiệp vụ, không cố định một lý do (T700)
    const dongCho = oLy ? dsDong.filter(d => laLyPhanBo(d.ly ?? lyDo, s)) : []
    const idPhieu = moi ? idMoi : String(row!.id)
    if (dongCho.length && (moi || !theCuaPhieu(row).length)) {
      setHoiThe({ moMoi, idMoi: idPhieu, tu: {
        dong: dongCho.map(d => ({ ten: d.ten, gt: String(d.tien), sl: 1 })),
        soCt, ngayCt, ghiChuCt: ghiChu, ngay: ngayCt, ngayPb: ngayCt, _goc: `${path}/${idPhieu}`,
      } })
      return
    }
    // Ghi khoản chi từ hướng dẫn Trang chủ (T138): lưu xong về Trang chủ, hướng dẫn khen rồi chạy tiếp
    if (moi && mod.key === 'tien' && loai?.k === 'chi' && xongViecHuongDan('chi', `“${lyDo || dienGiai || 'Chi tiền'}” ${money(tongThanhToan)}`, s.donVi, nav)) return
    if (moi && goiYVe && !moMoi) { setHoiVe({ moMoi, idMoi }); return }
    sauLuu(moMoi, idMoi)
  }

  function sauLuu(moMoi: boolean, idMoi: string) {
    if (moMoi) {
      nav(`${path}/moi${loai ? `?loai=${loai.k}` : ''}`, { replace: true })
    } else if (moi) {
      // Lưu phiếu mới: ở lại form, xem chi tiết phiếu vừa lưu; bấm đóng mới về danh sách (T51)
      // Đang chạy tour Hướng dẫn nhanh thì đóng form về danh sách để tour khoanh phiếu vừa lưu (T676, T681)
      if (huongDanDangChay()) dongForm()
      else nav(`${path}/${idMoi}`, { replace: true })
    } else {
      setDangSua(false)
    }
  }

  // Xoá chứng từ (Tiện ích, Ctrl+Delete): cùng luật xoá với danh sách (QD32): kỳ đã khoá sổ không xoá, gói có ghi sổ chỉ xoá phiếu chưa ghi
  function thuXoa() {
    if (!row || khoaSua) return
    if (daKhoaSo(row.ngay, row.cn)) toast(`${row.so} thuộc kỳ đã khoá sổ, không xoá được`)
    else if (coGhiSo && row.tt !== 'nhap' && !laHdMoi) toast(`${row.so} đã ghi sổ, bỏ ghi sổ rồi mới xoá`)   // hoá đơn thay thế, điều chỉnh dự thảo ghi sổ ngay nhưng vẫn xoá được (T787)
    else if (lyDoKhongXoaTheCuaPhieu(row)) toast(lyDoKhongXoaTheCuaPhieu(row)!)   // thẻ chi phí của phiếu thuộc kỳ đã khoá sổ (T439)
    else if (ttThamChieu(row)) toast(`${row.so} có phiếu ${ttThamChieu(row)!.so} tham chiếu, xoá ${ttThamChieu(row)!.so} trước`)   // T85, T91
    else if (((laSx && !sxNhap) || (dcn === 'xdc' && row.ttSx !== 'cho')) && row._phieuNhap) toast(`${row.so} đã có phiếu nhập ${(row._phieuNhap as { so: string }).so}, xoá phiếu nhập trước`)   // T152
    else setHoiXoa(true)
  }

  // Phát hành hoá đơn thay thế, điều chỉnh đang dự thảo từ chân form khi mở lại (T787)
  function phatHanhNhap() {
    if (!row) return
    const thieuNm = khongLayHd ? null : thieuKhach(khachHd)
    const thieu = !ngayHd ? 'Chọn Ngày hoá đơn' : !kyHieuDung(kyHieuHd) ? 'Ký hiệu hoá đơn gồm 7 ký tự, vd 1C26TAA' : thieuNm ? `${thieuNm} trên hoá đơn, bấm Sửa rồi Thay đổi thông tin VAT` : ''
    if (thieu) { toast(thieu); return }
    const man = `${mod.key}/${sc.slug}`
    const hd = phatHanhHd(s, man, String(row.id), kyHieuHd, ngayHd, khachHd, khongLayHd, tienHdTam)
    ghiNhatKy(man, String(row.id), soCt, s.ten, `Phát hành hoá đơn ${hd.mau}${hd.kyHieu} số ${hd.so}`)
    toast(`Đã phát hành hoá đơn ${hd.mau}${hd.kyHieu} số ${hd.so}`)
  }

  // Sửa phiếu: phiếu chi đã có thẻ chi phí phân bổ thì không sửa, báo xoá thẻ trước (T439)
  function batSua() {
    if (khoaDc) return
    if (row && theCuaPhieu(row).length) setHoiKhongSua(true)
    else setDangSua(true)
  }
  const batSuaRef = useRef(batSua)
  batSuaRef.current = batSua

  // In: lấy dữ liệu đang có trên form, phiếu mới chưa lưu cũng in được
  function moIn() {
    setPhieuIn([{
      sc, cfg, loai,
      row: { ...row, id: row?.id ?? 'moi', so: soCt, ngay: ngayCt, cn: cuaHang, doiTuong, dienGiai, _diaChi: diaChi, _mst: mst, loai: loai?.k, tien: tongTien, thue: tongThue, tong: tongThanhToan },
    }])
  }

  // Phím tắt
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (e.shiftKey && dcn !== 'ndc') luu(true)   // phiếu nhập điều chuyển không thêm mới (T748)
        else luu(false)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        if (!khoaSua && !khoaDc) batSuaRef.current()   // phiếu điều chỉnh, phiếu FABi chỉ xem (T129, T283); phiếu có thẻ chi phí thì báo (T439)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') {
        // Huỷ thay đổi như nút Huỷ (T297)
        e.preventDefault()
        if (dangSua && !ndcCho) { if (moi) setHoiDong(true); else setDangSua(false) }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        // Sao chép chứng từ như mục Sao chép ở Tiện ích (T297)
        e.preventDefault()
        if (!dangSua && row && !laDc && dcn !== 'ndc') toast('Đã sao chép chứng từ')
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
  const tenPhieu = loaiCt !== 'XBAN' ? TEN_LOAI_CT[loaiCt] : loai?.ten ?? (cfg.them?.startsWith('Thêm ') ? cfg.them.charAt(5).toUpperCase() + cfg.them.slice(6) : tenMan(sc))

  // Đang xem tất cả cửa hàng thì phải chọn một cửa hàng trước khi lập chứng từ mới
  if (canChonCn) {
    return (
      <FormToanMan icon={mod.icon} iconNet onClose={dongForm} title={tenPhieu} footClass="fsf-f-xem"
        foot={<button type="button" className="xp-btn-outline" onClick={dongForm}>Huỷ</button>}>
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
    // Phiếu thu chi bỏ tab hạch toán (T49); bỏ tab Ghi sổ ở mọi gói, chỉ chế độ Nợ/Có còn tab Hạch toán (T726, như T640)
    ...(laTien || laKk || dcn === 'ck' || kieu !== 'noco' ? [] :   // phiếu kiểm kê, chuyển kho không có tab Hạch toán (T124, T155)
      [['ht', 'Hạch toán'] as [string, string]]),
    ...(s.goi === 'S' ? [] : [['dk', 'Đính kèm'] as [string, string]]),   // gói Standard không có đính kèm (T52)
    ['ls', 'Lịch sử'],
  ]

  // Tuỳ chỉnh giao diện phiếu (T89): ô đầu phiếu không bắt buộc và tổng chân phiếu bật tắt được, nhớ chung khoá với cột bảng (tiền tố dau:, chan:)
  const hienDau = (k: string) => !anCot.includes(`dau:${k}`)
  // Phiếu thu, chi tiền (2.1.1) không có ô Mã số thuế; chuyển quỹ cũng không (T168)
  const coMst = nhom !== 'cq' && !(laTien && sc.code === '2.1.1')
  const coHanTt = Boolean(bo.tt) && s.goi === 'PR'   // gói Standard, Plus ẩn hạn thanh toán (T180)
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
      {suaTtc ? (
        <ChonDanhMuc dm="kho" nhan="kho" value={kho} onChange={setKho} ds={!kho || dsKhoCn.includes(kho) ? dsKhoCn : [kho, ...dsKhoCn]} />
      ) : <input className="inp" readOnly value={kho} />}
    </div>
  )
  const oDiaChi = hienDau('diaChi') && (
    <div className="f">
      <label>Địa chỉ</label>
      <input className="inp" readOnly={!suaTtc} value={diaChi} onChange={e => setDiaChi(e.target.value)} />
    </div>
  )
  // Dưới Địa chỉ (T785): ô tích Người mua không lấy hoá đơn, cùng dòng canh phải link Thay đổi thông tin VAT mở popup Thông tin hoá đơn
  // (ngày hoá đơn, mẫu số - ký hiệu, người mua Cá nhân/Công ty); chỉ khi đang bật Xuất HĐĐT
  const coXuatHd = Boolean(hdDienTu && (hdDaXuat || ((suaTtc || laHdMoi) && phatHd)))   // hoá đơn thay thế, điều chỉnh dự thảo vẫn hiện tiền hoá đơn (T787)
  const oXuatHd = coXuatHd && !hdDaXuat && suaTtc && (
    <div className="ct-kl-dong">
      <label className="ct-kl"><input type="checkbox" checked={khongLayHd} onChange={e => setKhongLayHd(e.target.checked)} />Người mua không lấy hoá đơn</label>
      <button type="button" className="ph-nut" onClick={() => setMoNguoiMua(true)}>Thay đổi thông tin VAT</button>
    </div>
  )
  // Chuyển quỹ: ô quỹ đi, quỹ đến và người thực hiện
  const oQuyCq = (nhan: string, v: string, setV: (v: string) => void) => (
    <div className="f">
      <label>{nhan} <em>*</em></label>
      {suaTtc ? <ChonDanhMuc dm="quy" nhan="quỹ" value={v} onChange={setV} ds={QUY_TIEN} khongThem /> : <input className="inp" readOnly value={v} />}
    </div>
  )
  const oNguoiTh = hienDau('nguoi') && (
    <div className="f">
      <label>Người thực hiện</label>
      <input className="inp" readOnly={!suaTtc} value={nguoiGiao} onChange={e => setNguoiGiao(e.target.value)} />
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
      <input className="inp" readOnly={!suaTtc} value={nguoiGiao} onChange={e => setNguoiGiao(e.target.value)} />
    </div>
  )
  const oGhiChu = hienDau('ghiChu') && !laHdMoi && loaiCt !== 'HUYBAN' && (   // hoá đơn thay thế, điều chỉnh (T787), huỷ bán (T801) ẩn Ghi chú
    <div className="f" style={keoGc ? { gridColumn: '1 / 3' } : undefined}>
      <label>Ghi chú</label>
      <input className="inp" readOnly={!suaTtc} value={ghiChu} placeholder={suaTtc ? 'Ghi chú thêm cho phiếu' : ''}
        onChange={e => { setGhiChu(e.target.value); setDienGiai(e.target.value) }} />
    </div>
  )

  const laPhieuChi = laTien && (loai?.k === 'chi' || loai?.k === 'unc')
  const laPhieuThu = laTien && (loai?.k === 'thu' || loai?.k === 'bc')
  const iconDau = (laPhieuChi || laPhieuThu) ? (
    <span className={`fsf-ic-xp ${laPhieuChi ? 'chi' : 'thu'}`}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.8333 5.83333V3.33333C15.8333 3.11232 15.7455 2.90036 15.5893 2.74408C15.433 2.5878 15.221 2.5 15 2.5H4.16667C3.72464 2.5 3.30072 2.67559 2.98816 2.98816C2.67559 3.30072 2.5 3.72464 2.5 4.16667C2.5 4.60869 2.67559 5.03262 2.98816 5.34518C3.30072 5.65774 3.72464 5.83333 4.16667 5.83333H15.8333ZM15.8333 5.83333H16.6667C16.8877 5.83333 17.0996 5.92113 17.2559 6.07741C17.4122 6.23369 17.5 6.44565 17.5 6.66667V10M17.5 10H15C14.558 10 14.134 10.1756 13.8215 10.4882C13.5089 10.8007 13.3333 11.2246 13.3333 11.6667C13.3333 12.1087 13.5089 12.5326 13.8215 12.8452C14.134 13.1577 14.558 13.3333 15 13.3333H17.5C17.721 13.3333 17.933 13.2455 18.0893 13.0893C18.2455 12.933 18.3333 12.721 18.3333 12.5V10.8333C18.3333 10.6123 18.2455 10.4004 18.0893 10.2441C17.933 10.0878 17.721 10 17.5 10Z" />
        <path d="M2.5 4.16667V15.8333C2.5 16.2754 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H16.6667C16.8877 17.5 17.0996 17.4122 17.2559 17.2559C17.4122 17.0996 17.5 16.8877 17.5 16.6667V13.3333" />
      </svg>
    </span>
  ) : undefined

  return (
    <FormToanMan
      icon={mod.icon}
      iconNet
      iconNode={iconDau}
      xem={!dangSua}
      footClass="fsf-f-xem"   // thêm mới, sửa cũng chân trắng như lúc xem (T513)
      tinh={Boolean((loc.state as { chuyenPhieu?: boolean } | null)?.chuyenPhieu)}
      onClose={dongMoi}
      dongNgay={dongForm}   // tour Hướng dẫn nhanh đi ra bước ngoài form hoặc tắt thì đóng không hỏi (T680, T681)
      day={laKk || dcn === 'ck' || (laDc && s.goi === 'S') || !hienChan('tongTien') ? undefined
        : laTien && chiTien ? <TongDay tong={tongThanhToan} soDong={dsDong.length} />
          // Phần tổng thành dải cố định ở đáy form, cuộn bảng vẫn thấy (T105); phiếu mua chỉ Tổng tiền vì số khác đã có trên dòng (T84)
          // Trả lại hàng mua chỉ Tổng tiền, bỏ Tiền hàng, Chiết khấu, Tiền thuế GTGT (T727)
          // Bán hàng thêm tay, hàng bán trả lại: dải phép tính như chi tiết Xuất bán POS (T758)
          : cfg.dongPos ? <PhepTinhBan tongTien={tongTien} giam={tongGiamGia} ck={tongCk - tongGiamGia + tongPhiDv} phiDv={tongPhiDv} phiVc={tongPhiVc}
            tyLe={Boolean(giamGtgt)} thue={giamGtgt ? tongGiam : tongThue} tong={tongThanhToan} an={[...anCot, ...boCotBan]}
            trai={coXuatHd ? <NhomTienHd tam={tienHdTam} hd={hdDaXuat} mau2={(hdDaXuat?.mau ?? kyHieuHd[0]) === '2'} /> : undefined} />
          : <DaiTong tong={tongThanhToan}
            trai={cpCo ? <OChiPhiMua tien={cpMua} onTien={setCpMua} dong={dsDong} onPhanBo={setDsDong} sua={dangSua} /> : undefined}
            muc={chiTien || truocThue || laDc || laSx || laDcn || khoGon || (nhom === 'mua' && traLai) ? [] : [
            ['Tiền hàng', tongTien] as [string, number],
            ...(bo.ck ? [['Chiết khấu', tongCk ? -tongCk : 0] as [string, number]] : []),
            giamGtgt ? ['Giảm thuế GTGT', tongGiam ? -tongGiam : 0] : ['Tiền thuế GTGT', tongThue],
            ...(bo.tongNhap ? [['Giá trị nhập kho', tongTien - tongCk + (hkd ? tongThue : 0)] as [string, number]] : []),
          ]} />}
      giua={(
        moi ? <span className="fsf-tt moi">Thêm mới</span>
          : dangSua ? <span className="fsf-tt sua">Đang chỉnh sửa <b>{soCt}</b></span>
            : <span className="fsf-tt xem">Chi tiết phiếu <b>{soCt}</b>{laHuyBan && ' · Do thay thế hoá đơn'}</span>
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
            {/* Đầu form bỏ nhãn trạng thái ghi sổ ở mọi phiếu, PhuongXT 05/11/2026 (T744) */}
            {/* Trạng thái xuất, nhập của phiếu sản xuất (T152) */}
            {coTtXn && TT_SX[String(row.ttSx)] && <St k={TT_SX[String(row.ttSx)][0]}>{TT_SX[String(row.ttSx)][1]}</St>}
            <span className={`src ${NGUON[row.nguon]?.[0] ?? 'tay'}`}>
              {NGUON[row.nguon]?.[1] ?? 'Thủ công'}
            </span>
            {cuaHang && <span className="chip info" title="Cửa hàng lập chứng từ, không sửa được"><Icon n="cuahang" className="ic sm" />{cuaHang}</span>}
            {metaThem}
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
            {!ndcCho && (   // phiếu nhập điều chuyển chờ: không có Huỷ, đóng form bằng nút đóng (T748)
              <button
                type="button"
                className="xp-btn-outline"
                onClick={() => { if (moi) setHoiDong(true); else { setDangSua(false); if (khoaLyDtStandard) setDsDong(dongGoc); } }}
              >
                Huỷ
              </button>
            )}
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
              <HopCotPhieu dsDau={dsDau} dsChan={dsChan} ds={cfg.dongPos ? COT_BHB.filter(([k]) => !boCotBan.includes(k) && (giamGtgt ? k !== 'ts' && k !== 'thue' : k !== 'giamThue')) : laKk ? COT_KK : laSx ? cotSx(sx!) : laDcn ? cotDcn(dcn!) : cotTuyChon(cfg, { coNhomHhdv: nhom === 'mua' && nhanKemHd && s.goi === 'PR', coKho: Boolean(bo.kho) && !khoDau && !laDc && !khoGon, giaVon, coLo: nhom === 'mua' && s.goi === 'PR', coCk: Boolean(bo.ck), coKm: kieu !== 'khong', coLy: Boolean(oLy), coNhapKho: truocThue, coXuatKho: nhom === 'mua' && traLai, coGiamThue: giamGtgt, coCpMua: cpCo }).filter(([k]) => !anDc.includes(k))}
                an={anCot} onDoi={doiAnCot} onDong={() => setHopCot(false)} />
            )}
            {laHdMoi ? <>   {/* hoá đơn thay thế, điều chỉnh: Lưu dự thảo, Lưu và phát hành, không ghi chữ phím tắt (T787) */}
              <button type="button" className="xp-btn-outline" onClick={() => luu(false)} data-hd="luu">Lưu dự thảo</button>
              <button type="button" className="xp-btn-sua" onClick={() => luu(false, true)}>Lưu và phát hành</button>
            </> : ndcCho ? (   // phiếu nhập điều chuyển chờ: sửa thực nhận rồi Nhập kho (T748)
              <button type="button" className="xp-btn-sua" onClick={() => luu(false)}>Nhập kho (Ctrl+S)</button>
            ) : (
              <button type="button" className="xp-btn-outline" onClick={() => luu(false)} data-hd="luu">
                {hdDienTu ? (phatHd && !hdDaXuat ? 'Lưu và xuất HĐĐT' : 'Lưu') : 'Lưu (Ctrl+S)'}
              </button>
            )}
            {dcn !== 'ndc' && !laHdMoi && (   // phiếu nhập điều chuyển chỉ sinh từ phiếu xuất, không thêm mới (T748)
              <button type="button" className="xp-btn-sua" onClick={() => luu(true)}>
                {hdDienTu ? (phatHd && !hdDaXuat ? 'Lưu, xuất HĐĐT và thêm' : 'Lưu và thêm') : 'Lưu và thêm (Ctrl+Shift+S)'}
              </button>
            )}
          </>
        ) : (
          <>
            <div className="xp-footer-trai">
              {/* Chứng từ trước, sau ra ngoài menu Tiện ích thành nút biểu tượng (T584) */}
              {(coTruoc || coSau) && (
                <div className="xp-chuyen-phieu">
                  <button type="button" className="xp-btn-outline xp-btn-ic" onClick={veTruoc} disabled={!coTruoc} title="Chứng từ trước" aria-label="Chứng từ trước">
                    <Icon n="chevl" className="ic sm" />
                  </button>
                  <button type="button" className="xp-btn-outline xp-btn-ic" onClick={veSau} disabled={!coSau} title="Chứng từ sau" aria-label="Chứng từ sau">
                    <Icon n="chevr" className="ic sm" />
                  </button>
                </div>
              )}
              <Dropdown
                btnClass="xp-btn-outline"
                align="start"
                width={220}
                label={
                  <>
                    <span>Tiện ích</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 5.5L7 9L10.5 5.5" />
                    </svg>
                  </>
                }
              >
                {dong => (
                  <>
                    {!laDc && dcn !== 'ndc' && (   // phiếu nhập điều chuyển không sao chép (T748)
                      <MenuItem icon="copy" onClick={() => toast('Đã sao chép chứng từ')}>
                        Sao chép
                      </MenuItem>
                    )}
                    {(coTraHang || coTraBan) && (
                      <MenuItem icon="back" onClick={() => { dong(); moTraHang() }}>
                        Trả hàng
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
                    {coTkGoi && !laKk && dcn !== 'ck' && (
                      <MenuItem icon="book" onClick={() => setHienTk(!hienTk)}>
                        {hienTk ? 'Cột tài khoản: Đang hiện' : 'Cột tài khoản: Đang ẩn'}
                      </MenuItem>
                    )}
                    {/* Đã xuất HĐĐT (T785): tải PDF, XML hoá đơn; Xoá chứng từ mờ */}
                    {hdDaXuat && <>
                      <MenuItem icon="doc" onClick={() => { dong(); toast(`Đã tải PDF hoá đơn số ${hdDaXuat.so}`) }}>Tải PDF hoá đơn</MenuItem>
                      <MenuItem icon="doc" onClick={() => { dong(); toast(`Đã tải XML hoá đơn số ${hdDaXuat.so}`) }}>Tải XML hoá đơn</MenuItem>
                      <MenuItem icon="trash" lock onClick={() => toast('Chứng từ đã xuất HĐĐT, không xoá được. Lập hoá đơn điều chỉnh, thay thế ở menu Hoá đơn điện tử')}>Xoá chứng từ</MenuItem>
                    </>}
                    {row && !khoaSua && (
                      <MenuItem icon="trash" danger onClick={thuXoa}>
                        Xoá chứng từ
                      </MenuItem>
                    )}
                  </>
                )}
              </Dropdown>
              {/* Bỏ nút Ghi sổ, Bỏ ghi sổ ở chân form, mọi phiếu (T746) */}
              {!anIn && (
                <button type="button" className="xp-btn-in" onClick={moIn}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12H2.66667C2.31304 12 1.97391 11.8595 1.72386 11.6095C1.47381 11.3594 1.33333 11.0203 1.33333 10.6667V7.33333C1.33333 6.97971 1.47381 6.64057 1.72386 6.39052C1.97391 6.14048 2.31304 6 2.66667 6H13.3333C13.687 6 14.0261 6.14048 14.2761 6.39052C14.5262 6.64057 14.6667 6.97971 14.6667 7.33333V10.6667C14.6667 11.0203 14.5262 11.3594 14.2761 11.6095C14.0261 11.8595 13.687 12 13.3333 12H12" />
                    <path d="M4 6V2C4 1.82319 4.07024 1.65362 4.19526 1.5286C4.32029 1.40357 4.48986 1.33333 4.66667 1.33333H11.3333C11.5101 1.33333 11.6797 1.40357 11.8047 1.5286C11.9298 1.65362 12 1.82319 12 2V6" />
                    <path d="M4.66667 9.33333H11.3333C11.7015 9.33333 12 9.63181 12 10V14C12 14.3682 11.7015 14.6667 11.3333 14.6667H4.66667C4.29848 14.6667 4 14.3682 4 14V10C4 9.63181 4.29848 9.33333 4.66667 9.33333Z" />
                  </svg>
                  <span>In phiếu</span>
                </button>
              )}
              {chanThem}
            </div>
            <div className="xp-footer-phai">
              {hdDaXuat && <span className="ct-hd-khoa" title="Chứng từ đã xuất hoá đơn điện tử không sửa, không xoá. Muốn đổi tiền, hàng, người mua thì lập hoá đơn điều chỉnh hoặc thay thế ở menu Hoá đơn điện tử">
                <Icon n="lock" className="ic sm" />Đã xuất HĐĐT · không sửa được</span>}
              {/* Huỷ bán sửa, xoá ở hoá đơn thay thế; hoá đơn thay thế, điều chỉnh dự thảo có nút Phát hành (T787) */}
              {laHuyBan && row?._hdTt ? <span className="ct-hd-khoa"><Icon n="lock" className="ic sm" />Sửa hoặc xoá ở hoá đơn thay thế
                <Link className="ds-link-so" to={`${path}/${(row._hdTt as CtLq).id}`}>{(row._hdTt as CtLq).so}</Link></span> : null}
              {laHdMoi && row && !hdDaXuat && (
                <button type="button" className="xp-btn-outline" onClick={phatHanhNhap}><Icon n="receipt" className="ic sm" /><span>Phát hành</span></button>
              )}
              {/* Phiếu nhập điều chuyển chờ mở ra là sửa thực nhận, Nhập kho; đã nhập vẫn Sửa được thực nhận (T748) */}
              {!khoaSua && !khoaDc && (
                <button
                  type="button"
                  className="xp-btn-sua"
                  onClick={batSua}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.66667 13.3333H5.33333L12.3333 6.33333C12.5084 6.15824 12.6473 5.95037 12.7421 5.72159C12.8368 5.49282 12.8856 5.24762 12.8856 5C12.8856 4.75238 12.8368 4.50718 12.7421 4.27841C12.6473 4.04963 12.5084 3.84176 12.3333 3.66667C12.1582 3.49157 11.9504 3.35268 11.7216 3.25792C11.4928 3.16315 11.2476 3.11438 11 3.11438C10.7524 3.11438 10.5072 3.16315 10.2784 3.25792C10.0496 3.35268 9.84176 3.49157 9.66667 3.66667L2.66667 10.6667V13.3333Z" />
                    <path d="M9 4.33333L11.6667 7" />
                  </svg>
                  <span>{hdDienTu ? 'Sửa' : 'Sửa (Ctrl+E)'}</span>   {/* form bán hàng lập tay bỏ chữ phím tắt trên nút (T785) */}
                </button>
              )}
            </div>
            {hopCot && (
              <HopCotPhieu dsDau={dsDau} dsChan={dsChan} ds={cfg.dongPos ? COT_BHB.filter(([k]) => !boCotBan.includes(k) && (giamGtgt ? k !== 'ts' && k !== 'thue' : k !== 'giamThue')) : laKk ? COT_KK : laSx ? cotSx(sx!) : laDcn ? cotDcn(dcn!) : cotTuyChon(cfg, { coNhomHhdv: nhom === 'mua' && nhanKemHd && s.goi === 'PR', coKho: Boolean(bo.kho) && !khoDau && !laDc && !khoGon, giaVon, coLo: nhom === 'mua' && s.goi === 'PR', coCk: Boolean(bo.ck), coKm: kieu !== 'khong', coLy: Boolean(oLy), coNhapKho: truocThue, coXuatKho: nhom === 'mua' && traLai, coGiamThue: giamGtgt, coCpMua: cpCo }).filter(([k]) => !anDc.includes(k))}
                an={anCot} onDoi={doiAnCot} onDong={() => setHopCot(false)} />
            )}
            {hopTt && row && (
              <HopThanhToan tieuDe={`${tenThanhToan} cho ${soCt}`} chiTt={chiTt} conLai={conLai} quyTm={quyTm} ngay0={ngayCt} dg0={dgTt}
                onDong={() => setHopTt(false)} onLuu={lapThanhToan} />
            )}
            {hoiXoa && row && (
              <HopXacNhan tieuDe={`Xoá ${row.so}?`} nut="Xoá phiếu" onDong={() => setHoiXoa(false)}
                onDongY={() => { setHoiXoa(false); xoaPhieu(`${mod.key}/${sc.slug}`, [{ id: String(row.id), so: soCt }, ...(row._huyBan ? [{ id: (row._huyBan as CtLq).id, so: (row._huyBan as CtLq).so }] : [])], s.ten); xoaTheCuaPhieu([row], s.ten); if (coTcNhap && row._thamChieuId) suaPhieu(manDoi, String(row._thamChieuId), { ttSx: 'cho', _phieuNhap: undefined }); if (laKk) xoaPhieu(MAN_DC, dsDcCon(row).map(c => ({ id: c.id, so: c.so })), s.ten); if (dcn === 'xdc' && row._phieuNhap) xoaPhieu(DCN.ndc.man, [row._phieuNhap as CtTt], s.ten); toast(`Đã xoá ${row.so}`); dongForm() }}>
                {theCuaPhieu(row).length > 0 ? 'Xoá phiếu chi này sẽ xoá thẻ chi phí đã tạo. Bạn có muốn thực hiện không? ' : ''}Phiếu đã xoá không lấy lại được.{row._huyBan ? <> Huỷ bán {(row._huyBan as CtLq).so} cũng bị xoá theo.</> : null}{laKk && dsDcCon(row).length > 0 && <> Phiếu điều chỉnh {dsDcCon(row).map(c => c.so).join(', ')} cũng bị xoá theo.</>}
              </HopXacNhan>
            )}
          </>
        )
      }
    >
      {phieuIn && <HopInChungTu ds={phieuIn} onDong={() => setPhieuIn(null)} />}
      {/* Hộp hướng dẫn phím tắt, dùng chung với form thẻ chi phí (T297) */}
      {modalPhim && <HopPhimTat onDong={() => setModalPhim(false)} />}

      {/* Phần trên: Thông tin chung kiểu AMIS. Đầu phiếu đứng yên, chỉ vùng bảng chi tiết cuộn (T105) */}
      <div className="stack ct-co-dinh" style={{ gap: 10 }}>   {/* khối cách nhau 10px cho bảng chi tiết nhiều chỗ (T336) */}
        {/* Hoá đơn thay thế, điều chỉnh, huỷ bán (T787): loại điều chỉnh ở dòng đầu; hoá đơn gốc là một dòng chữ, không sửa, cuối dòng link xem */}
        {hdGoc && (
          <section className="card ct-hd-goc">
            <div className="ct-hd-goc-dong">
              <Icon n="receipt" className="ic sm" />
              <span>{loaiCt === 'HDDIEUCHINH' ? 'Điều chỉnh cho' : loaiCt === 'HUYBAN' ? 'Huỷ bán do thay thế' : 'Thay thế cho'} hoá đơn mẫu số <b>{hdGoc.hd.mau}</b>, ký hiệu <b className="code">{hdGoc.hd.kyHieu}</b>,
                số <b className="code">{hdGoc.hd.so}</b>, ngày <b>{hdGoc.hd.ngay}</b>
                {hdGoc.hd.traCuu && <> · Mã tra cứu <b className="code">{hdGoc.hd.traCuu}</b></>} · Chứng từ <Link className="ds-link-so" to={`${path}/${hdGoc.id}`}>{hdGoc.so}</Link></span>
              {/* Loại điều chỉnh cùng dòng hoá đơn gốc, tăng đứng trước giảm (dinhlanphuongipacc 11/11/2026) */}
              {loaiCt === 'HDDIEUCHINH' && (
                <div className="ct-hd-goc-loai">
                  <b>Loại điều chỉnh:</b>
                  {([['tang', 'Điều chỉnh tăng'], ['giam', 'Điều chỉnh giảm']] as const).map(([v, t]) => (
                    <label key={v}><input type="radio" name="dcLoai" disabled={!dangSua} checked={dcLoai === v}
                      onChange={() => { setDcLoai(v); setDsDong(ds => theoChieu(ds, v === 'giam' ? -1 : 1)) }} />{t}</label>
                  ))}
                </div>
              )}
              <button type="button" className="ph-nut" onClick={() => setXemGoc(true)}>Xem hoá đơn gốc<Icon n="eye" className="ic sm" /></button>
            </div>
          </section>
        )}
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
                  {coThanhToanSau && (
                    <button type="button" className="btn sm" onClick={() => setHopTt(true)}>
                      <Icon n="wallet" className="ic sm" />{tenThanhToan}
                    </button>
                  )}
                </span>
              )}

              <span className="grow" />

              {/* Nhãn tình trạng thanh toán sát lề phải, như chip trên App (T580) */}
              {row && nhom === 'mua' && (() => { const [cls, nhan] = TT_TIEN.mua[ttTienTheoTra(row)]; return <span className={`ct-nhan-tt ${cls}`}>{nhan}</span> })()}

              {/* Bán hàng lập tay (T785): công tắc Phát hành HĐĐT cùng chỗ ô tích Lập kèm hoá đơn; đã xuất thì nhãn chữ kèm mã tra cứu, không bấm */}
              {hdDaXuat ? <span className="ct-hd-nhan" title={`Mã cơ quan thuế ${hdDaXuat.ma}`}>Đã xuất HĐĐT · Mã tra cứu <b className="code">{hdDaXuat.traCuu ?? hdDaXuat.ma}</b></span>
                // Hoá đơn thay thế, điều chỉnh luôn có hoá đơn: nhãn thay công tắc; huỷ bán không xuất hoá đơn (T787)
                : laHdMoi ? <span className="ct-hd-nhan">{TEN_LOAI_CT[loaiCt]}{row ? ' · Dự thảo' : ''}</span>
                : laHuyBan ? <span className="ct-hd-nhan">Huỷ bán · không xuất hoá đơn</span>
                : hdDienTu && dangSua && <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" className="bat-tat" checked={phatHd}
                    onChange={e => { setPhatHd(e.target.checked); if (e.target.checked) setKhongLayHd(!laKhachCty(doiTuong)) }} />
                  Xuất HĐĐT
                </label>}
              {/* Ô tích kèm hoá đơn chỉ khi thêm mới, sửa; xem chi tiết thì bỏ, thông tin hoá đơn vẫn hiện ở đầu phiếu (T162) */}
              {dangSua && !hdDienTu && <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  className="bat-tat"
                  checked={nhanKemHd}
                  onChange={e => setNhanKemHd(e.target.checked)}
                />
                {nhom === 'mua' ? (traLai ? 'Xuất kèm hoá đơn' : 'Nhận kèm hoá đơn') : 'Lập kèm hoá đơn'}
              </label>}
              {/* Tích Chi phí mua hàng thì dải đáy có ô số tiền, nút Phân bổ; bỏ tích thì xoá số đã chia trên dòng (T757) */}
              {dangSua && coCpMua && <label className="row" style={{ gap: 6, cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  className="bat-tat"
                  checked={batCp}
                  onChange={e => {
                    setBatCp(e.target.checked)
                    if (!e.target.checked) setDsDong(ds => ds.map(d => d.cpMua ? { ...d, cpMua: 0 } : d))
                  }}
                />
                Chi phí mua hàng
              </label>}
            </div>
          </section>
        )}

        {/* Khối thông tin chung 3 cột: Đối tượng / Thông tin phụ / Chứng từ; ct-ttc nhãn bên trái ô cho khối thấp xuống (T335) */}
        <section className="card ct-ttc" style={{ padding: '8px 16px' }} data-hd="ttc">
          <div
            className="grid"
            style={{
              gridTemplateColumns: gonDau ? 'minmax(0, 1fr) 300px' : coHdDau ? 'minmax(0, 1.4fr) minmax(0, 1.2fr) 280px 300px' : 'minmax(0, 1.4fr) minmax(0, 1.2fr) 300px',   // cột ngày, số phiếu 300px vì nhãn nằm bên trái ô (T335); cột hoá đơn 280px cho ô Ngày hoá đơn đủ năm (T464)
              gap: 16,
              rowGap: laHdMoi ? 6 : 16,   // hàng Lý do, Email cách đều các ô phía trên (T801)
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
                  {suaTtc ? (
                    <ChonDanhMuc dm={nhom === 'thu' || nhom === 'chi' ? 'quyTm' : 'tkNh'} nhan={nhom === 'thu' || nhom === 'chi' ? 'quỹ tiền mặt' : 'quỹ ngân hàng'}
                      value={quy} onChange={setQuy} ds={dsQuy} khongThem />
                  ) : (
                    <input className="inp" readOnly value={quy} />
                  )}
                </div>
              )}
              <div className="f">
                <label>{laTien ? 'Đối tượng' : cfg.nhan ?? 'Đối tượng'} {(!laTien || canDt) && <em>*</em>}</label>
                {suaTtc ? (
                  <ChonDanhMuc dm={dmDt} nhan={(laTien ? 'đối tượng' : cfg.nhan ?? 'đối tượng').toLowerCase()} value={doiTuong} onChange={chonDoiTuong}
                    ds={dsDt.includes(doiTuong) || !doiTuong ? dsDt : [doiTuong, ...dsDt]} />
                ) : (
                  <input className="inp" readOnly value={doiTuong} />
                )}
              </div>
              {!muaBan && oNguoi}
              {!tcGiua && oDiaChi}
              {oXuatHd}
              </>)}
            </div>}

            {/* Cột 2: lý do, nhân viên, mã số thuế, hạn thanh toán */}
            <div className="stack" style={{ gap: 10 }}>
              {oLy && (
                <div className="f">
                  {/* Lý do chi được tích Là chi phí (danh mục Lý do nghiệp vụ) thì hiện nhãn Chi phí cạnh tên ô (T246) */}
                  <label>{oLy.nhan}</label>
                  {/* Lý do được tích Là chi phí: nhãn Chi phí nằm cuối ô lý do (T246, T419) */}
                  <div className={`ly-o${laLyChiPhi(lyDo, s) ? ' co-cp' : ''}${suaTtc ? ' sua' : ''}`}>
                    {suaTtc ? (
                      <ChonDanhMuc dm={`ly:${oLy.nhan}`} nhan={oLy.nhan.toLowerCase()} value={lyDo} onChange={chonLyDo} ds={oLy.ds!} />
                    ) : (
                      <input className="inp" readOnly value={lyDo} />
                    )}
                    {laLyChiPhi(lyDo, s) && <span className="chip ok ly-cp" title="Lý do nghiệp vụ được tích Là chi phí: khoản chi tính vào Chi phí trong tháng">Chi phí</span>}
                  </div>
                  {/* T419: phiếu mới có khoản chờ phân bổ thì nhắc trước, lưu xong sẽ mở màn tạo thẻ */}
                  {suaTtc && (moi || !theCuaPhieu(row).length) && dsDong.some(d => laLyPhanBo(d.ly ?? lyDo, s)) && (
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
                    <label>{laKk ? 'Kho kiểm kê' : (laDc && loai?.k === 'ndc') || sxNhap || laNk ? 'Kho nhập' : 'Kho xuất'} <em>*</em></label>
                    {suaTtc ? (
                      <ChonDanhMuc dm="kho" nhan="kho" value={kho} onChange={setKho} ds={!kho || dsKhoCn.includes(kho) ? dsKhoCn : [kho, ...dsKhoCn]} />
                    ) : <input className="inp" readOnly value={kho} />}
                  </div>
                  {hienDau('nhanVien') && (
                    <div className="f" style={{ flex: 1 }}>
                      <label>Nhân viên thực hiện</label>
                      {suaTtc ? (
                        <ChonDanhMuc dm="nv" nhan="nhân viên" value={nhanVien} onChange={setNhanVien}
                          ds={NHAN_VIEN.map(n => ({ v: n.ten, t: `${n.ten} (${n.bp})` }))} />
                      ) : <input className="inp" readOnly value={nhanVien} />}
                    </div>
                  )}
                </div>
              )}
              {/* Điều chuyển (T155): xuất có kho xuất, cửa hàng nhận, kho nhận; nhập có tham chiếu, kho nhận; chuyển kho có kho xuất, kho nhận */}
              {laDcn && (
                <DauDieuChuyen loai={dcn!} sua={suaTtc} cuaHang={cuaHang} kho={kho} setKho={setKho} khoNhan={khoNhan} setKhoNhan={setKhoNhan}
                  setCnNhan={setCnNhan} nguon={nguonDc} thamChieu={thamChieuSx} />
              )}
              {/* Phiếu nhập sản xuất: tham chiếu bắt buộc, chọn phiếu xuất cùng loại đang chờ nhập (T152) */}
              {sxNhap && (
                <div className="f">
                  <label>Tham chiếu <em>*</em></label>
                  {suaTtc ? <OThamChieuSx loai={sx!} cn={cuaHang} value={thamChieuSx.id} onChon={chonThamChieuSx} />
                    : <div className="sx-tc-xem">{thamChieuSx.id ? <Link className="ds-link-so" to={`/app/${SX[SX[sx!].doi!].man}/${thamChieuSx.id}`}>{thamChieuSx.so}</Link> : <span className="dim">Chưa có</span>}</div>}
                </div>
              )}
              {!gonDau && !laTien && !muaBan && hienDau('nhanVien') && (
                <div className="f">
                  <label>Nhân viên thực hiện</label>
                  {suaTtc ? (
                    <ChonDanhMuc dm="nv" nhan="nhân viên" value={nhanVien} onChange={setNhanVien}
                      ds={NHAN_VIEN.map(n => ({ v: n.ten, t: `${n.ten} (${n.bp})` }))} />
                  ) : <input className="inp" readOnly value={nhanVien} />}
                </div>
              )}
              {!gonDau && nhom !== 'cq' && ((coMst && hienDau('mst')) || (coHanTt && hinhThucTt === 'congno' && hienDau('hanTt'))) && <div className="row" style={{ gap: 10 }}>
                {coMst && hienDau('mst') && <div className="f" style={{ flex: 1 }}>
                  <label>Mã số thuế</label>
                  {suaTtc ? (
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
                    {/* Hạn thanh toán chọn bằng lịch như Ngày chứng từ (T557) */}
                    {suaTtc ? (
                      <ONgay value={hanTt} onChange={setHanTt} />
                    ) : (
                      <input className="inp" readOnly value={hanTt} />
                    )}
                  </div>
                )}
              </div>}
              {muaBan && oNguoi}
              {hdDienTu && (
                <div className="f">
                  <label>Kênh bán <em>*</em></label>
                  {suaTtc ? <Select className="inp" value={kenh} onChange={e => setKenh(e.target.value)} aria-label="Kênh bán" ds={(kenh && !KENH_BAN.includes(kenh) ? [kenh, ...KENH_BAN] : KENH_BAN).map(v => ({ v, t: v }))} />
                    : <input className="inp" readOnly value={kenh} />}
                </div>
              )}
              {!keoGc && oGhiChu}
            </div>

            {/* Mua tích Nhận kèm hoá đơn, bán tích Lập kèm hoá đơn: thông tin hoá đơn thành một cột trước cột ngày, số phiếu, ba hàng đều với hai cột trái (T62, T68, T83) */}
            {/* Bán hàng lập tay (T785): đang lập thì Ngày hoá đơn, Ký hiệu, Số hoá đơn cấp khi phát hành; đã xuất thì Số hoá đơn là link kèm mắt mở popup xem hoá đơn */}
            {coHdDau && hdDienTu && (
              <div className="stack ct-hd-dau" style={{ gap: 10, gridRow: keoGc ? 'span 2' : undefined }}>
                {hdDaXuat ? <>
                  <div className="f">
                    <label>Số hoá đơn</label>
                    <div className="inp ct-so-hd">
                      <button type="button" className="ph-nut code" onClick={() => setMoXemHd(true)} title="Xem hoá đơn">{hdDaXuat.so}</button>
                      <button type="button" className="icon-btn ct-mat" onClick={() => setMoXemHd(true)} title="Xem hoá đơn" aria-label="Xem hoá đơn"><Icon n="eye" className="ic sm" /></button>
                    </div>
                  </div>
                  <div className="f"><label>Ký hiệu</label><input className="inp code" readOnly value={hdDaXuat.mau + hdDaXuat.kyHieu} /></div>
                  <div className="f"><label>Ngày hoá đơn</label><input className="inp" readOnly value={hdDaXuat.ngay} /></div>
                </> : <>
                  <div className="f"><label>Ngày hoá đơn <em>*</em></label>{dangSua ? <ONgay value={ngayHd} onChange={setNgayHd} /> : <input className="inp" readOnly value={ngayHd} />}</div>
                  <div className="f"><label>Ký hiệu <em>*</em></label>{!dangSua ? <input className="inp code" readOnly value={kyHieuHd} />
                    : cauHd && <OKyHieu h={cauHd} id="form" className="inp code" value={kyHieuHd} onChange={setKyHieuHd} />}</div>
                  <div className="f"><label>Số hoá đơn</label><input className="inp" readOnly value="" placeholder={laHdMoi ? 'Cấp khi phát hành' : 'Cấp khi xuất'} /></div>
                </>}
                {/* Email nhận hoá đơn dưới ô hoá đơn, chung trường với popup Thay đổi thông tin VAT; người mua không lấy hoá đơn thì để trống, khoá (T790) */}
                {/* Hoá đơn thay thế, điều chỉnh ẩn Email, Ghi chú cho bảng chi tiết rộng hơn (T787) */}
                {!laHdMoi && <div className="f"><label>Email</label>
                  <input className="inp" type="email" value={khongLayHd ? '' : khachHd.email} readOnly={Boolean(hdDaXuat) || !suaTtc || khongLayHd}
                    placeholder={khongLayHd ? 'Không lấy hoá đơn' : 'Email nhận hoá đơn'} onChange={e => setKhachHd(k => ({ ...k, email: e.target.value.trim() }))} />
                </div>}
              </div>
            )}
            {coHdDau && !hdDienTu && (
              <div className="stack ct-hd-dau" style={{ gap: 10, gridRow: keoGc ? 'span 2' : undefined }}>
                {/* Số hoá đơn lên đầu; Mẫu số gộp vào Ký hiệu, vd 1C26TMM (ký tự đầu là mẫu số) (T463) */}
                <div className="f">
                  <label>Số hoá đơn <em>*</em></label>
                  <input className="inp code" inputMode="numeric" value={soHd} onChange={e => setSoHd(chuanSoHd(e.target.value))} readOnly={!dangSua} />
                </div>
                <div className="f">
                  <label>Ký hiệu <em>*</em></label>
                  <input className="inp code" maxLength={7} value={kyHieuHd} onChange={e => setKyHieuHd(chuanKyHieuHd(e.target.value))} readOnly={!dangSua} title="Gồm mẫu số và ký hiệu hoá đơn, vd 1C26TMM" />
                </div>
                <div className="f">
                  <label>Ngày hoá đơn <em>*</em></label>
                  {dangSua ? <ONgay value={ngayHd} onChange={setNgayHd} /> : <input className="inp" readOnly value={ngayHd} />}
                </div>
              </div>
            )}

            {/* Cột 3: Ngày chứng từ; số chứng từ chỉ hiện ở tiêu đề giữa, không lặp ô riêng (T647). Cửa hàng hiện trên đầu form. Ghi chú kéo dài thì cột này chiếm cả hàng Ghi chú (T78) */}
            <div className="stack" style={{ gap: 10, gridRow: keoGc ? 'span 2' : undefined }}>
              <div className="f">
                <label>{laSx ? (sxNhap ? 'Thời gian nhập' : 'Thời gian xuất') : laDcn ? 'Thời gian' : 'Ngày chứng từ'} <em>*</em></label>
                {/* Mọi màn chọn ngày bằng lịch (T464); phiếu sản xuất, điều chuyển kèm giờ: chọn ngày trên lịch thì giữ giờ đang có, giờ gõ ngay trong ô */}
                {dangSua ? (
                  <ONgay
                    value={ngayCt}
                    placeholder={laSx || laDcn ? 'dd/mm/yyyy hh:mm' : undefined}
                    onChange={v => setNgayCt(c => (laSx || laDcn) && /^\d{2}\/\d{2}\/\d{4}$/.test(v) && c.includes(' ') ? `${v} ${c.split(' ')[1]}` : v)}
                  />
                ) : (
                  <input className="inp" readOnly value={ngayCt} />
                )}
              </div>
              {/* T419: chỉ hiện khi phiếu có lý do được tích Là chi phí */}
              {coThangLl && dsDong.some(d => laLyChiPhi(d.ly ?? lyDo, s)) && (
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
            {/* Hàng cuối hoá đơn thay thế, điều chỉnh (T787): Lý do bắt buộc qua hai cột trái; Email nhận hoá đơn qua hai cột phải, sửa được khi lập, sửa */}
            {laHdMoi && (
              <div className={`f ct-ly-do-hd${thuLuuHd && !lyDoHd.trim() ? ' loi' : ''}`} style={{ gridColumn: '1 / 3', marginTop: 0 }}>
                <label>Lý do {loaiCt === 'HDTHAYTHE' ? 'thay thế' : 'điều chỉnh'} <em>*</em></label>
                <input className="inp" readOnly={!dangSua} value={lyDoHd} onChange={e => setLyDoHd(e.target.value)} aria-label="Lý do"
                  placeholder={dangSua ? (loaiCt === 'HDTHAYTHE' ? 'Vd: sai đơn giá, đơn giá đúng theo báo giá ngày 20/10/2026' : 'Vd: giảm giá do phục vụ trễ, theo biên bản ngày 05/11/2026') : ''} />
              </div>
            )}
            {laHdMoi && (
              <div className="f" style={{ gridColumn: '3 / 5', paddingLeft: coHdDau ? 8 : 0 }}>   {/* thẳng cột hoá đơn ct-hd-dau lùi 8px (T801) */}
                <label>Email</label>
                <input className="inp" type="email" value={khongLayHd ? '' : khachHd.email} readOnly={Boolean(hdDaXuat) || !dangSua || khongLayHd} aria-label="Email nhận hoá đơn"
                  placeholder={khongLayHd ? 'Không lấy hoá đơn' : 'Email nhận hoá đơn'} onChange={e => setKhachHd(k => ({ ...k, email: e.target.value.trim() }))} />
              </div>
            )}
          </div>
          {/* Dòng Tham chiếu chung cuối phần thông tin chung, nhãn thẳng cột nhãn phía trên (T585).
              Thêm loại tham chiếu mới thì nối vào dsThamChieu */}
          {dsThamChieu.length > 0 && (
            <div className="ct-tham-chieu">
              <span className="dim">Tham chiếu</span>
              <span className="ct-tham-chieu-ds">
                {dsThamChieu.map(c => <Link key={c.so} className="ds-link-so" to={c.to} state={c.state} title={c.ten}>{c.so}</Link>)}
              </span>
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
            {/* Phiếu mua hàng: Thuế GTGT, Chiết khấu áp xuống mọi dòng (T492) */}
            {nhom === 'mua' && dangSua && !laKk && !laSx && !laDcn && (   // giữ ô khi sang tab khác để nhớ mức đã chọn
              <ApDauBang dong={dsDong} onChange={setDsDong} an={tab !== 'ct'} coThue={cfg.thue !== 0 && !anCot.includes('ts')} coCk={Boolean(bo.ck)} />
            )}
            {/* Chứng từ bán hàng kiểu Xuất bán POS: Chiết khấu, Phí dịch vụ, Thuế GTGT cả bill áp xuống mọi dòng (T753) */}
            {cfg.dongPos && dangSua && <ApDauBangBan dong={dsDong} onChange={doiDong} an={tab !== 'ct'} coThue={!giamGtgt} />}
          </div>

          <div className="ct-than" data-hd="chi-tiet">
          <BaoCaoDoRongCtx.Provider value={tab === 'ct' ? undefined : doRongTab}>
          {/* Tab 1: Chi tiết / Hàng tiền */}
          {tab === 'ct' && laKk && <BangKiemKe dong={dsDong} onChange={setDsDong} cheDo={dangSua ? 'sua' : 'xem'} an={anCot} khongTong={!hienChan('dongTong')} hienLoc={moLoc} doRong={doRongCt} />}
          {tab === 'ct' && laSx && (
            <BangSanXuat loai={sx!} dong={dsDong as DongSx[]} onChange={setDsDong} cheDo={dangSua ? 'sua' : 'xem'} coTk={hienTk} an={anCot}
              khongTong={!hienChan('dongTong')} kho={kho} coThamChieu={Boolean(thamChieuSx.id)} />
          )}
          {tab === 'ct' && laDcn && (
            <BangDieuChuyen loai={dcn!} dong={dsDong as DongDcn[]} onChange={setDsDong} cheDo={dangSua ? 'sua' : 'xem'} coTk={hienTk} an={anCot}
              khongTong={!hienChan('dongTong')} kho={kho} coThamChieu={Boolean(thamChieuSx.id)} />
          )}
          {tab === 'ct' && hienTraNo && (
            <BangTraNoNcc ncc={doiTuong} ds={dsTraNo} chon={traNo} onChange={setTraNo} cheDo={dangSua ? 'sua' : 'xem'} />
          )}
          {tab === 'ct' && cfg.dongPos && (
            <BangHangBan dong={dsDong} onChange={doiDong} cheDo={dangSua ? 'sua' : 'xem'} tyLe={Boolean(giamGtgt)} giamThue={giamThueHang} an={[...anCot, ...boCotBan]} choAm={loaiCt === 'HDDIEUCHINH'} ngay={ngayCt} chiDongCo={traBan} />
          )}
          {tab === 'ct' && !cfg.dongPos && !laKk && !laSx && !laDcn && !hienTraNo && (
            <BangSua
              cfg={cfg}
              dong={dsDong}
              onChange={setDsDong}
              cheDo={dangSua ? 'sua' : 'xem'}
              coTk={hienTk}
              nhanTk={nhanTkDong}
              tkTheoLy={coTkTheoLy ? (ly => tkTheoLyDo(loaiPhieuTien, ly)) : undefined}
              coKho={Boolean(bo.kho) && !khoDau && !laDc && !khoGon}   // phiếu điều chỉnh, nhập khác, xuất huỷ: kho ở đầu phiếu (T126, T737, T741)
              giaVon={giaVon}
              coCpMua={cpCo}
              onTongCp={setCpMua}   // gõ chi phí ở dòng thì ô tổng ở dải đáy bằng tổng các dòng
              khoMacDinh={khoMotCn || 'Kho tổng'}
              coNhapKho={nhom === 'mua' && Boolean(bo.tongNhap)}
              xuatKho={nhom === 'mua' && traLai}   // T728
              chiDongCo={traBan}   // T816
              themGon={nhom === 'mua'}
              coThemHangLoat={nhom === 'mua'}   // Thêm hàng loạt ở phiếu mua hàng (T465)
              gtnkCoThue={hkd}
              giamThue={giamGtgt ? giamThueHang : undefined}
              coNhomHhdv={nhom === 'mua' && nhanKemHd && s.goi === 'PR'}   // T162
              coCk={Boolean(bo.ck)}
              coLo={nhom === 'mua' && s.goi === 'PR'}   // số lô, hạn dùng chỉ có ở gói Pro (T68)
              coKm={kieu !== 'khong'}
              lyDo={oLy ? { nhan: oLy.nhan, ds: oLy.ds!, macDinh: lyDo } : undefined}
              dtMacDinh={laTien ? doiTuong : ''}
              an={[...anCot, ...anDc, ...(khoaLyDtStandard ? ['ly', 'dt'] : [])]}   // gói Free phiếu thu, chi: lý do, đối tượng chỉ ở phần trên, bảng chi tiết bỏ hai cột này (T448)
              khongTong={(laTien && chiTien) || !hienChan('dongTong')}
              chiXemLy={khoaLyDtStandard}
              chiXemDt={khoaLyDtStandard}
              hienLoc={moLoc}
              doRong={doRongCt}
            />
          )}

          {/* Tab 2: Hoá đơn */}
          {tab === 'hd' && (
            <div style={{ padding: 16 }}>
              <div className="form-grid" style={{ maxWidth: 720 }}>
                <div className="f">
                  <label>Số hoá đơn</label>
                  <input className="inp code" inputMode="numeric" value={soHd} onChange={e => setSoHd(chuanSoHd(e.target.value))} disabled={!dangSua} />
                </div>
                <div className="f">
                  <label>Ký hiệu</label>
                  <input className="inp code" maxLength={7} value={kyHieuHd} onChange={e => setKyHieuHd(chuanKyHieuHd(e.target.value))} disabled={!dangSua} title="Gồm mẫu số và ký hiệu hoá đơn, vd 1C26TMM" />
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
          </BaoCaoDoRongCtx.Provider>
          </div>

        </section>

        {children}
        {moNguoiMua && cauHd && <HopNguoiMua h={cauHd} k0={khachHd} khongLay={khongLayHd} ngay0={ngayHd} kyHieu0={kyHieuHd} onDong={() => setMoNguoiMua(false)}
          onDongY={x => { setKhachHd(x.k); setKhongLayHd(x.khongLay); setNgayHd(x.ngay); setKyHieuHd(x.kyHieu) }} />}
        {moXemHd && hdDaXuat && row && <HopXemHd s={s} r={row} hd={hdDaXuat} toast={toast} onDong={() => setMoXemHd(false)} />}
        {xemGoc && hdGoc && <HopXemHd s={s} r={rows?.find(r => String(r.id) === hdGoc.id) ?? r0 ?? {}} hd={hdGoc.hd} toast={toast} onDong={() => setXemGoc(false)} />}
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
          {soCt} có khoản chi phí phân bổ nhiều kỳ. Phần mềm mở màn Tạo thẻ chi phí phân bổ, điền sẵn tên, số tiền, ngày, chứng từ gốc từ phiếu. Bạn vẫn sửa lại được.
        </HopXacNhan>
      )}
      {hoiKhongSua && row && (
        <HopXacNhan tieuDe={`Không sửa được ${row.so}`} nut="Mở thẻ" nutHuy="Đóng" nutDo={false}
          onDong={() => setHoiKhongSua(false)}
          onDongY={() => { setHoiKhongSua(false); nav(`/app/ccdc/8-1-1?mo=${theCuaPhieu(row)[0]}`, { state: { veGoc: `${path}/${row.id}` } }) }}>   {/* xoá thẻ xong về lại phiếu ở chế độ sửa (T439) */}
          Phiếu đã có thẻ chi phí phân bổ {theCuaPhieu(row).join(', ')}. Xoá thẻ trước rồi mới sửa được phiếu. Thẻ chỉ xoá được khi kỳ khoá sổ còn trước tháng bắt đầu phân bổ của thẻ.
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
/** Phiếu mua gửi sang Thêm phiếu trả lại hàng mua (T727); chứng từ bán hàng lập tay gửi sang Thêm hàng bán trả lại (ban, T815) */
export interface TraTu {   // điện thoại dùng chung khi lập trả lại hàng mua (T819)
  id: string; so: string; man: string; di: string; cn: string; doiTuong: string; mst: string; diaChi: string; kho: string; dong: Dong[]; dsTra: CtTt[]
  ban?: boolean; httt?: 'congno' | 'tienmat' | 'chuyenkhoan'; pttt?: string
}

export const QUY_TIEN = [
  ...CUA_HANG.map(c => `Quỹ tiền mặt ${c.ngan}`),
  ...TK_NGAN_HANG.map(t => `${t.nh.split(',')[0]} ${t.so}`),
]

/** Đoán lý do thu, chi từ diễn giải; không khớp thì lấy lý do cuối danh sách (Thu khác, Chi phí khác) */
/** Thẻ chi phí phân bổ của phiếu chi: thẻ tạo khi lưu phiếu (_theCp, T168) và thẻ mẫu trỏ về phiếu (_goc, T436) */
export const theCuaPhieu = (r: Row | undefined): string[] => !r ? [] : [...new Set([
  ...(Array.isArray(r._theCp) ? (r._theCp as string[]) : []),
  ...theMauTheoGoc(`/app/tien/2-1-1/${r.id}`),
])].filter(so => !laDaXoa('dm/8-1-1', so))   // thẻ đã xoá thì phiếu không còn tham chiếu, sửa được (T439)
/** Thẻ của phiếu không xoá được vì kỳ phân bổ đã khoá sổ: câu báo đầu tiên (T439) */
export const lyDoKhongXoaTheCuaPhieu = (r: Row | undefined): string | null =>
  theCuaPhieu(r).map(so => { const t = theMauTheoSo(so); return t ? lyDoKhongXoaThe(t) : null }).find(Boolean) ?? null
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
export function DaiTong({ muc, tong, nhan = 'Tổng tiền', tren = [], trai }: { muc: [string, number][]; tong: number; nhan?: string; tren?: [string, number][]; trai?: ReactNode }) {
  const so = (v: number) => (v < 0 ? `-${money(-v)}` : money(v))
  return (
    <div className="pos-day">
      {trai}   {/* ô nhập ở đầu dải, vd Chi phí mua hàng (T757) */}
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

/** Dải phép tính ở đáy form như chi tiết Xuất bán POS (T613): Tiền hàng − Giảm giá − Chiết khấu + Phí dịch vụ = Doanh thu tính thuế ± thuế = Tổng thanh toán (T758) */
function PhepTinhBan({ tongTien, giam, ck, phiDv, phiVc, tyLe, thue, tong, an, trai }: { tongTien: number; giam: number; ck: number; phiDv: number; phiVc: number; tyLe: boolean; thue: number; tong: number; an: string[]; trai?: ReactNode }) {
  // Chỉ hiện mục có cột đang hiện trên bảng hàng (T758); Tiền hàng, Tổng thanh toán luôn hiện
  const hien = (...k: string[]) => k.some(x => !an.includes(x))
  const muc: [string, string, number][] = [
    ['', 'Tiền hàng', tongTien],
    ...(hien('pt', 'giam') ? [['−', 'Giảm giá', giam] as [string, string, number]] : []),
    ...(hien('ptCk', 'ck') ? [['−', 'Chiết khấu', ck] as [string, string, number]] : []),
    ...(hien('ptPhiDv', 'phiDv') ? [['+', 'Phí dịch vụ', phiDv] as [string, string, number]] : []),
    ...(phiVc && hien('phiVc') ? [['+', 'Phí vận chuyển', phiVc] as [string, string, number]] : []),
  ]
  const coThue = tyLe ? hien('giamThue') : hien('ts', 'thue')
  const o = (dau: string, nhan: string, so: string, lop = '') => (
    <span key={nhan} className="pos-phep-cum">
      {dau && <span className="pos-phep-dau">{dau}</span>}
      <span className={`pos-phep-o ${lop}`}><small>{nhan}</small><b>{so}</b></span>
    </span>
  )
  return (
    <div className="fsf-f-pos ban-phep">
      {trai}   {/* nhóm tiền hoá đơn ở đầu trái dải tổng (T785) */}
      <div className="pos-phep">
        {muc.map(([dau, nhan, so]) => o(dau, nhan, money(so)))}
        {hien('dtTruocThue') && o('=', 'Doanh thu tính thuế', money(tongTien - giam - ck + phiDv + phiVc), 'nen')}
        {coThue && o(tyLe ? '−' : '+', tyLe ? 'Giảm trừ thuế' : 'Thuế GTGT', money(thue))}
        {o('=', 'Tổng thanh toán', moneyD(tong), 'tong')}
      </div>
    </div>
  )
}

/** Nhóm tiền hoá đơn ở đầu trái dải tổng (T785): Tiền trước thuế HĐ, Tiền thuế HĐ (mẫu 2 là Giảm trừ thuế), Tổng tiền hoá đơn.
 *  Đang lập là tạm tính theo chứng từ; đã xuất lấy theo hoá đơn nhà cung cấp trả về, số lệch với chứng từ tô đỏ để thấy cần điều chỉnh */
function NhomTienHd({ tam, hd, mau2 }: { tam: { truoc: number; thue: number; tong: number }; hd?: { truoc?: number; thue?: number; tong?: number }; mau2: boolean }) {
  const so = hd?.truoc !== undefined ? { truoc: hd.truoc, thue: hd.thue ?? 0, tong: hd.tong ?? 0 } : tam
  const o = (nhan: string, k: 'truoc' | 'thue' | 'tong') => (
    <span className={`pos-phep-o${so[k] !== tam[k] ? ' lech' : ''}`} title={so[k] !== tam[k] ? `Chứng từ ${money(tam[k])}, lệch với hoá đơn: cần lập hoá đơn điều chỉnh` : undefined}>
      <small>{nhan}</small><b>{money(so[k])}</b>
    </span>
  )
  return (
    <div className="ct-tien-hd" title={hd ? 'Tiền trên hoá đơn đã phát hành' : 'Tạm tính tiền hoá đơn trước khi phát hành'}>
      {o('Tiền trước thuế HĐ', 'truoc')}{o(mau2 ? 'Giảm trừ thuế HĐ' : 'Tiền thuế HĐ', 'thue')}{o('Tổng tiền hoá đơn', 'tong')}
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
      const th = [...than.querySelectorAll<HTMLElement>('table thead th')].find(x => ['Thành tiền', 'Tiền vốn'].includes(x.textContent?.trim() ?? ''))
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
export function thangLaiLo(ngay: string, ch?: string): string[] {
  const k = khoaSoDenCua(ch)   // mốc khoá của cửa hàng trên phiếu (T19)
  const [, m0, y0] = ngay.split('/').map(Number)
  if (!m0 || !y0) return []
  const ds: string[] = []
  for (let m = m0, y = y0; ds.length < 24; m--) {
    if (m === 0) { m = 12; y-- }
    if (ds.length && (y < k.nam || (y === k.nam && m <= k.thang))) break
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
  const kieu = kieuGhiSoDv(s)
  if (kieu === 'khong') {
    return (
      <Note kind="gray" icon="info">
        Gói Standard chưa áp chế độ kế toán nên phiếu không sinh bút toán. Số tiền vẫn vào sổ quỹ và sổ công nợ.{' '}
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
        <Note icon="book">Gói Plus theo {CHE_DO.TT58.soHieu}: không dùng tài khoản Nợ/Có. Phiếu ghi thẳng vào sổ.</Note>
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

/** Nhật ký từng phiếu ghi nhận ở mọi gói, kể cả Free: dòng thời gian bản gọn (T732) */
export function LichSu({ goi, moi, man, id }: { goi: Goi; moi: boolean; man: string; id: string }) {
  const tatCa = useDongLichSu(goi, man, id)

  if (moi) return <div className="empty"><b>Chứng từ chưa lưu</b></div>
  if (tatCa.length === 0) return <div className="ls-g"><p className="ls-g-trong">Chưa có thao tác nào.</p></div>

  const soThaoTac = tatCa.length
  const soNguoi = new Set(tatCa.map(x => x.ai)).size
  const suaMoiNhat = tatCa.find(x => x.loai === 'sua')
  const thoiGianSua = suaMoiNhat ? suaMoiNhat.luc.replace(/\/(\d{4})\s/, ' ') : null

  const nhom = nhomTheoNgay(tatCa)

  return (
    <div className="ls-g">
      {/* Dòng tóm tắt duy nhất */}
      <p className="ls-g-tom-tat">
        {soThaoTac} thao tác, {soNguoi} người{thoiGianSua ? ` · sửa gần nhất ${thoiGianSua}` : ''}
      </p>

      {nhom.map((g, gIdx) => (
        <Fragment key={g.ngay}>
          <h3 className="ls-g-ngay">{g.ngay}</h3>
          {g.items.map((item, idx) => {
            const laHangCuoiTatCa = gIdx === nhom.length - 1 && idx === g.items.length - 1
            const gioPart = item.luc.includes(' ') ? item.luc.split(' ')[1] : item.luc
            const noiDung = item.noiDung ?? item.ghiChu ?? ''
            const coDoi = (item.doi && item.doi.length > 0) || (item.tongCu !== undefined && item.tongMoi !== undefined)
            const chenhTong = item.tongCu !== undefined && item.tongMoi !== undefined ? item.tongMoi - item.tongCu : 0

            return (
              <div key={`${item.luc}-${item.ai}-${idx}`} className="ls-g-ev">
                <div className="ls-g-rail">
                  <span className={`ls-g-dot ${item.loai}`}>
                    <IconLoai loai={item.loai} />
                  </span>
                  {!laHangCuoiTatCa && <span className="ls-g-ln" />}
                </div>

                <div className="ls-g-main">
                  <div className="ls-g-head">
                    <b>{item.tenViec}</b>
                    <span className="ls-g-who">{item.ai}</span>
                    <span className="ls-g-time">{gioPart}</span>
                  </div>

                  {!coDoi && (
                    <div className="ls-g-facts" title={noiDung}>
                      {item.duKien && item.duKien.length > 0 ? (
                        item.duKien.map((dk, dkIdx) => (
                          <span key={dkIdx} className={dk.endsWith(' đ') ? 'strong' : undefined}>
                            {dk}
                          </span>
                        ))
                      ) : (
                        <span>{noiDung}</span>
                      )}
                    </div>
                  )}

                  {coDoi && (
                    <div className="ls-g-diff">
                      {item.doi && item.doi.map((d, dIdx) => (
                        <div key={dIdx} className="ls-g-r">
                          <span className="ls-g-k">{d.ten}</span>
                          <span className="ls-g-v">
                            {d.xoa ? (
                              <>
                                <span className="ls-g-tag-x">Đã xoá</span>
                                {d.cu && <s>{d.cu}</s>}
                              </>
                            ) : (
                              <>
                                {d.cu && <s>{d.cu}</s>}
                                {d.cu && <span className="ls-g-to">→</span>}
                                <b>{d.moi ?? 'Đã cập nhật'}</b>
                              </>
                            )}
                          </span>
                          {d.chenh !== undefined && d.chenh !== 0 ? (
                            <span className={`ls-g-d ${d.chenh > 0 ? 'up' : 'down'}`}>
                              {d.chenh > 0 ? `+${money(d.chenh)}` : `\u2212${money(Math.abs(d.chenh))}`}
                            </span>
                          ) : (
                            <span className="ls-g-d" />
                          )}
                        </div>
                      ))}
                      {item.tongCu !== undefined && item.tongMoi !== undefined && (
                        <div className="ls-g-r ls-g-tot">
                          <span className="ls-g-k">Tổng tiền</span>
                          <span className="ls-g-v">
                            <s>{money(item.tongCu)}</s>
                            <span className="ls-g-to">→</span>
                            <b>{money(item.tongMoi)} đ</b>
                          </span>
                          {chenhTong !== 0 ? (
                            <span className={`ls-g-d ${chenhTong > 0 ? 'up' : 'down'}`}>
                              {chenhTong > 0 ? `+${money(chenhTong)}` : `\u2212${money(Math.abs(chenhTong))}`}
                            </span>
                          ) : (
                            <span className="ls-g-d" />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {item.lyDo && (
                    <p className="ls-g-why">
                      <b>Lý do</b> {item.lyDo}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </Fragment>
      ))}
    </div>
  )
}

// Giữ tương thích với VoucherDetail
export const VoucherDetail = ChungTuForm
