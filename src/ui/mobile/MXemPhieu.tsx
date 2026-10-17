import { useMemo, useState, type FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { money } from '../format'
import { NGUON, TT_CT, dongCua, doanLyDoThuChi, ttNghiepVu, type Dong } from '../generic/gen'
import { boO, nhomCua, theoLoai, TT_TIEN } from '../generic/nhom'
import { useDongChungTu } from '../generic/VoucherScreen'
import { useDsPhieuDcn } from '../../modules/kho/BangDieuChuyen'
import { useDsPhieuSx } from '../../modules/kho/BangSanXuat'
import { SX, TT_SX } from '../../modules/kho/san-xuat'
import { DCN } from '../../modules/kho/dieu-chuyen'
import { MAN_DC } from '../../modules/kho/dieu-chinh'
import { CUA_HANG, KHOAN_MUC, TK_NGAN_HANG, daKhoaSo } from '../../data/mock'
import { ctTtCon, dsDcCon, dsTtCon, suaPhieu, ttThamChieu, ttTienTheoTra, xoaPhieu } from '../generic/daXoa'
import { LichSu } from '../generic/ChungTuForm'
import { loaiXuLy } from '../generic/BangKiemKe'
import { HopXacNhan } from '../LocNangCao'
import { HopInChungTu, type PhieuIn } from '../bao-cao/InChungTu'
import { Icon } from '../Icon'
import { MChon } from './MChon'
import { MTrong } from './MTrong'
import { chieuTien, dauTien, lopChieu } from './chieuTien'
import { KhoiHachToan, tinhButToan } from './butToan'

export interface MXemPhieuProps extends ScreenProps {
  id?: string
}

// Dòng thu chi lưu mã khoản mục, bản máy tính hiện tên
const tenKm = (ma: string) => KHOAN_MUC.find(x => x.ma === ma)?.ten ?? ma

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
          <button type="button" className="btn pri" onClick={() => nav(path)}>
            Về danh sách
          </button>
        </div>
      </div>
    )
  }
  // Tách lớp trong để phiếu bị xoá giữa chừng không làm đổi số hook
  return <ThanPhieu key={String(row.id)} sc={sc} mod={mod} row={row} />
}

const ThanPhieu: FC<ScreenProps & { row: Row }> = ({ sc, mod, row }) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const cfgMan = sc.voucher ?? { prefix: 'CT', doiTuong: 'none', dienGiai: [tenMan(sc)], tien: [0, 0] }

  const [timKiem, setTimKiem] = useState('')
  const [moLs, setMoLs] = useState(false)
  const [moMenu, setMoMenu] = useState(false)
  const [hoiXoa, setHoiXoa] = useState(false)
  const [hoiBoGhi, setHoiBoGhi] = useState(false)
  const [phieuIn, setPhieuIn] = useState<PhieuIn[] | null>(null)

  const loai = cfgMan.loai?.find(x => x.k === row.loai) ?? cfgMan.loai?.[0]
  const cfg = theoLoai(cfgMan, loai?.k)
  const nhom = nhomCua(mod.key, cfg, loai?.k)
  const bo = boO(nhom, cfg)
  const chieu = chieuTien(mod.key, cfg, row)
  const dau = dauTien(chieu)
  const lop = lopChieu(chieu)

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
  const kieu = kieuGhiSo(s.cheDo)
  const ghi = kieuGhiSo(s.goi) !== 'khong'

  // Nghiệp vụ (đối tượng, địa chỉ, mst, hoá đơn, hạn tt)
  const nv = useMemo(() => (row ? ttNghiepVu(row) : null), [row])

  // Màn có dòng chi tiết dạng diễn giải (không có cột số lượng trên máy tính)
  const laDongDienGiai = cfg.dong === 'tien' || cfg.dong === 'ts' ||
    ['4.1.5', '4.1.6', '6.1.1', '6.1.2', '7.1.2', '8.1.2', '8.1.3', '10.1.1'].includes(String(sc.code ?? sc.slug))

  // Thu chi 2.1.1
  const laThuChi211 = sc.code === '2.1.1' || sc.slug === '2-1-1'
  const cuaHangTen = String(row.cn ?? '')
  const quyTm = `Quỹ tiền mặt ${CUA_HANG.find(c => c.ten === cuaHangTen)?.ngan ?? CUA_HANG[0].ngan}`
  const quyNhMacDinh = TK_NGAN_HANG[0] ? `${TK_NGAN_HANG[0].nh.split(',')[0]} ${TK_NGAN_HANG[0].so}` : 'Vietcombank 0071000888999'

  // Quỹ
  let nhanQuy = ''
  let triQuy = ''
  if (laThuChi211 || laTien) {
    if (nhom === 'cq') {
      nhanQuy = 'Từ quỹ'
      triQuy = String(row._tuQuy ?? row._quy ?? quyTm)
    } else if (loai?.k === 'bc' || loai?.k === 'unc' || nhom === 'nhthu' || nhom === 'nhchi') {
      nhanQuy = 'Quỹ ngân hàng'
      triQuy = String(row._quy ?? quyNhMacDinh)
    } else {
      nhanQuy = 'Quỹ tiền mặt'
      triQuy = String(row._quy ?? quyTm)
    }
  }
  const triDenQuy = nhom === 'cq' ? String(row._denQuy ?? quyNhMacDinh) : ''

  // Dòng chi tiết
  const idSeed = `${sc.code ?? sc.slug}-${row.id}`
  const dsDong: Dong[] = useMemo(() => {
    return (row._dong as Dong[] | undefined) ?? dongCua(cfg, idSeed)
  }, [row, cfg, idSeed])

  // Lý do thu / chi
  let nhanLyDo = ''
  let triLyDo = ''
  if (laThuChi211 || laTien) {
    const isThu = loai?.k === 'thu' || loai?.k === 'bc' || nhom === 'thu' || nhom === 'nhthu'
    nhanLyDo = isThu ? 'Lý do thu' : 'Lý do chi'
    triLyDo = String(row._lyDo ?? dsDong[0]?.ly ?? doanLyDoThuChi(loai?.k ?? '', String(row.dienGiai || '')) ?? '')
  }

  // Người giao dịch / Người thực hiện
  let nhanNguoiGiaoDich = ''
  let triNguoiGiaoDich = ''
  if (laThuChi211) {
    nhanNguoiGiaoDich = nhom === 'cq' ? 'Người thực hiện' : 'Người giao dịch'
    triNguoiGiaoDich = String(row._nguoiGiao ?? row._nguoi ?? nv?.nguoi ?? '')
  }

  // Thông tin hoá đơn (3.1.2, 3.1.3, 3.1.4, 4.1.1-4.1.6, 6.1.1, 6.1.2)
  const manCoHd = ['3.1.2', '3.1.3', '3.1.4', '4.1.1', '4.1.2', '4.1.3', '4.1.4', '4.1.5', '4.1.6', '6.1.1', '6.1.2'].includes(String(sc.code ?? sc.slug)) || Boolean(bo.hd)
  // Có hoá đơn: theo đúng cách danh sách bản máy tính tính cột hoá đơn (VoucherScreen)
  const coHd = manCoHd && (row._nhanKemHd !== undefined ? Boolean(row._nhanKemHd) : nv?.ttHd === 'da')
  const soHd = coHd ? String(row._soHd ?? nv?.soHd ?? '') : ''
  const kyHieuHd = coHd ? String(row._kyHieuHd ?? nv?.kyHieuHd ?? '') : ''
  const ngayHd = coHd ? String(row._ngayHd ?? nv?.ngayHd ?? '') : ''
  const mauSoHd = coHd ? '1' : ''   // bản máy tính để mặc định Mẫu số HĐ là 1

  // Tình trạng thanh toán (3.1.x, 4.1.x)
  const nhomMb = mod.key === 'mua-hang' ? 'mua' : mod.key === 'ban-hang' ? 'ban' : null
  const ttTienTri = nhomMb ? ttTienTheoTra(row) : null
  const ttTienText = nhomMb && ttTienTri ? TT_TIEN[nhomMb][ttTienTri]?.[1] : ''

  // Mã số thuế và Hạn thanh toán (QD56: hạn tt ẩn ở gói Free, Standard)
  const coMst = nhom !== 'cq' && !(laTien && laThuChi211) && Boolean(row.doiTuong)
  const mst = coMst ? String(row._mst ?? nv?.mst ?? '') : ''
  const coHanTt = Boolean(bo.tt) && s.goi !== 'F' && s.goi !== 'S'
  const hanTt = (coHanTt && nhomMb) ? String(row._hanTt ?? nv?.hanTt ?? '') : ''

  // Nhãn kho
  const nhanKho = laKk
    ? 'Kho kiểm kê'
    : (nhom === 'mua' || nhom === 'nhap' || cfg.prefix === 'TL' || loai?.k === 'ndc')
    ? 'Kho nhập'
    : (nhom === 'ban' || nhom === 'xuat' || cfg.prefix === 'TLN' || loai?.k === 'xdc')
    ? 'Kho xuất'
    : 'Kho'

  // Lọc dòng nếu có tìm kiếm
  const dsDongLoc = useMemo(() => {
    if (!timKiem.trim()) return dsDong
    const q = timKiem.trim().toLowerCase()
    return dsDong.filter(d => {
      const txt = `${d.ma ?? ''} ${d.ten ?? ''} ${d.ly ?? ''} ${d.ghiChu ?? ''}`.toLowerCase()
      return txt.includes(q)
    })
  }, [dsDong, timKiem])

  // Tính tổng
  const tongTien = dsDong.reduce((a, d) => a + (Number(d.tien) || 0), 0)
  const tongCk = dsDong.reduce((a, d) => a + (Number(d.ck) || 0), 0)
  const tongThue = dsDong.reduce((a, d) => a + (Number(d.thue) || 0), 0)
  const tongThanhToan = laKk ? 0 : tongTien - tongCk + tongThue

  // Bút toán hạch toán mở sẵn (Mẫu A)
  const dsButToan = useMemo(() => {
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
  }, [cfg, dsDong, tongTien, tongCk, tongThue, row, nv, s.cheDo, nhom])

  // Tên loại phiếu
  const tenLoai = loai?.ten ?? (row.tenLoai ? String(row.tenLoai) : tenMan(sc))
  const soCt = String(row.so)

  // Chip trạng thái
  const ttCtInfo = TT_CT[row.tt] ?? ['dim', row.tt]
  const ttSxInfo = coTtXn && row.ttSx ? TT_SX[String(row.ttSx)] : null

  // Kho
  const kho = String(
    row._kho ??
      row.kho ??
      (row._khoDs as string[] | undefined)?.[0] ??
      dsDong.find(d => d.kho)?.kho ??
      '',
  )

  // Tham chiếu
  const ctTtCu = ctTtCon(row)
  const dsTt = dsTtCon(row)
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

  // Nút hành động chính: phiếu đã ghi sổ thì nút chính là In (chống bỏ ghi sổ nhầm)
  const coNutGhiSo = kieu !== 'khong' && !laDc
  const nutChinh = coNutGhiSo
    ? (row.tt === 'ghi'
        ? {
            nhan: 'In',
            action: thucHienIn,
          }
        : {
            nhan: 'Ghi sổ',
            action: () => toast('Đã ghi sổ'),
          })
    : !laDc
    ? {
        nhan: 'Sửa',
        action: () => nav(`${path}/${row.id}?sua=1`),
      }
    : null

  // Menu ba chấm
  const dsMenu = [
    ...(!laDc ? [{ k: 'sua', ten: 'Sửa chứng từ' }] : []),
    { k: 'in', ten: 'In chứng từ' },
    ...(!laDc ? [{ k: 'copy', ten: 'Sao chép chứng từ' }] : []),
    ...(!laDc ? [{ k: 'xoa', ten: 'Xoá chứng từ' }] : []),
  ]

  const handleMenuChon = (k: string) => {
    if (k === 'sua') {
      nav(`${path}/${row.id}?sua=1`)
    } else if (k === 'in') {
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
    } else if (k === 'copy') {
      toast('Đã sao chép chứng từ')
      nav(`${path}/moi${row.loai ? `?loai=${row.loai}` : ''}`, { state: { saoChep: row } })
    } else if (k === 'xoa') {
      if (daKhoaSo(String(row.ngay))) {
        toast(`${row.so} thuộc kỳ đã khoá sổ, không xoá được`)
      } else if (kieu !== 'khong' && row.tt !== 'nhap') {
        toast(`${row.so} đã ghi sổ, bỏ ghi sổ rồi mới xoá`)
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
    nav(path)
  }

  return (
    <div className="m-xp">
      {/* 1. Thẻ đầu phiếu như mẫu A: loại & quỹ, số phiếu & chip, số tiền lớn, thông tin chi tiết */}
      <div className="m-the-trang m-xp-the-dau">
        <div className="m-xp-loai">{[tenLoai, triQuy].filter(Boolean).join(' · ')}</div>
        <div className="m-xp-dau">
          <h2 className="m-xp-so">{soCt}</h2>
          <div className="m-xp-dau-phai">
            {ghi && ttCtInfo && <span className={`m-ct-chip ${ttCtInfo[0]}`}>{ttCtInfo[1]}</span>}
            {ttSxInfo && <span className={`m-ct-chip ${ttSxInfo[0]}`}>{ttSxInfo[1]}</span>}
          </div>
        </div>
        {/* Điểm 10: chỉ giữ dòng cam Tổng thanh toán, bỏ số tiền lớn ở đầu thẻ header */}

        <div className="m-xp-dong-tt">
          <span className="m-xp-nhan">Thời gian:</span>
          <span className="m-xp-tri">{[row.ngay, row.gio].filter(Boolean).join(' ')}</span>
        </div>
        {nhanQuy && triQuy && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">{nhanQuy}:</span>
            <span className="m-xp-tri dam">{triQuy}</span>
          </div>
        )}
        {triDenQuy && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">Đến quỹ:</span>
            <span className="m-xp-tri dam">{triDenQuy}</span>
          </div>
        )}
        {row.doiTuong && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">{laTien ? 'Đối tượng' : cfg.nhan ?? 'Đối tượng'}:</span>
            <span className="m-xp-tri dam">{String(row.doiTuong)}</span>
          </div>
        )}
        {nhanNguoiGiaoDich && triNguoiGiaoDich && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">{nhanNguoiGiaoDich}:</span>
            <span className="m-xp-tri">{triNguoiGiaoDich}</span>
          </div>
        )}
        {nhanLyDo && triLyDo && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">{nhanLyDo}:</span>
            <span className="m-xp-tri">{triLyDo}</span>
          </div>
        )}
        {row.cn && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">Cửa hàng:</span>
            <span className="m-xp-tri">{String(row.cn)}</span>
          </div>
        )}
        {dcn === 'xdc' ? (
          <>
            {kho && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Kho xuất:</span>
                <span className="m-xp-tri dam">{kho}</span>
              </div>
            )}
            {row._cnNhan && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Cửa hàng nhận:</span>
                <span className="m-xp-tri">{String(row._cnNhan)}</span>
              </div>
            )}
            {row._khoNhan && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Kho nhận:</span>
                <span className="m-xp-tri">{String(row._khoNhan)}</span>
              </div>
            )}
          </>
        ) : dcn === 'ndc' ? (
          <>
            {row._cnXuat && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Cửa hàng xuất:</span>
                <span className="m-xp-tri">{String(row._cnXuat)}</span>
              </div>
            )}
            {row._khoXuat && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Kho xuất:</span>
                <span className="m-xp-tri">{String(row._khoXuat)}</span>
              </div>
            )}
            {kho && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Kho nhận:</span>
                <span className="m-xp-tri dam">{kho}</span>
              </div>
            )}
          </>
        ) : dcn === 'ck' ? (
          <>
            {kho && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Kho xuất:</span>
                <span className="m-xp-tri dam">{kho}</span>
              </div>
            )}
            {row._khoNhan && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Kho nhận:</span>
                <span className="m-xp-tri dam">{String(row._khoNhan)}</span>
              </div>
            )}
          </>
        ) : (
          kho && (
            <div className="m-xp-dong-tt">
              <span className="m-xp-nhan">{nhanKho}:</span>
              <span className="m-xp-tri dam">{kho}</span>
            </div>
          )
        )}
        {soHd && (
          <>
            {mauSoHd && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Mẫu số HĐ:</span>
                <span className="m-xp-tri">{mauSoHd}</span>
              </div>
            )}
            {kyHieuHd && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Ký hiệu HĐ:</span>
                <span className="m-xp-tri">{kyHieuHd}</span>
              </div>
            )}
            <div className="m-xp-dong-tt">
              <span className="m-xp-nhan">Số hoá đơn:</span>
              <span className="m-xp-tri dam">{soHd}</span>
            </div>
            {ngayHd && (
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Ngày hoá đơn:</span>
                <span className="m-xp-tri">{ngayHd}</span>
              </div>
            )}
          </>
        )}
        {ttTienText && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">Tình trạng thanh toán:</span>
            <span className="m-xp-tri dam">{ttTienText}</span>
          </div>
        )}
        {mst && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">Mã số thuế:</span>
            <span className="m-xp-tri">{mst}</span>
          </div>
        )}
        {hanTt && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">Hạn thanh toán:</span>
            <span className="m-xp-tri">{hanTt}</span>
          </div>
        )}
        {(row.dienGiai || row._ghiChu) && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">Diễn giải:</span>
            <span className="m-xp-tri">{String(row.dienGiai || row._ghiChu)}</span>
          </div>
        )}
        {!laKk && !laDc && (
          <div className="m-xp-dong-tt">
            <span className="m-xp-nhan">Nguồn:</span>
            <span className="m-xp-tri">
              <span className={`src ${NGUON[row.nguon]?.[0] ?? 'tay'}`}>
                {NGUON[row.nguon]?.[1] ?? 'Thủ công'}
              </span>
            </span>
          </div>
        )}
        {/* Tham chiếu thẻ chi phí phân bổ (2.1.1) */}
        {Array.isArray(row._theCp) && (row._theCp as string[]).length > 0 && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Tham chiếu:</span>
            <span className="m-xp-tri m-xp-links">
              {(row._theCp as string[]).map(so => (
                <Link key={so} className="m-xp-link-tc" to={`/app/ccdc/8-1-1?mo=${so}`}>
                  Thẻ chi phí {so}
                </Link>
              ))}
            </span>
          </div>
        )}

        {/* Dòng tham chiếu */}
        {coTcNhap && row._thamChieu && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Tham chiếu:</span>
            <span className="m-xp-tri">
              <Link className="m-xp-link-tc" to={String(row._thamChieuDi || `/app/${manDoi}/${row._thamChieuId}`)}>
                {String(row._thamChieu)}
              </Link>
            </span>
          </div>
        )}
        {coTtXn && !sxNhap && dcn !== 'ndc' && row._phieuNhap && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Phiếu nhập:</span>
            <span className="m-xp-tri">
              <Link
                className="m-xp-link-tc"
                to={`/app/${dcn === 'xdc' ? DCN.ndc.man : SX[SX[sx!].doi!].man}/${(row._phieuNhap as { id: string }).id}`}
              >
                {(row._phieuNhap as { so: string }).so}
              </Link>
            </span>
          </div>
        )}
        {laKk && dsDc.length > 0 && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Xử lý chênh lệch:</span>
            <span className="m-xp-tri m-xp-links">
              {dsDc.map(c => (
                <Link key={c.id} className="m-xp-link-tc" to={`/app/${MAN_DC}/${c.id}`}>
                  {c.so}
                </Link>
              ))}
            </span>
          </div>
        )}
        {laDc && row._thamChieu && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Theo phiếu kiểm kê:</span>
            <span className="m-xp-tri">
              <Link className="m-xp-link-tc" to={`/app/kho/5-1-10/${String(row._kkId)}`}>
                {String(row._thamChieu)}
              </Link>
            </span>
          </div>
        )}
        {ctTtCu && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Chứng từ thanh toán:</span>
            <span className="m-xp-tri">
              <Link className="m-xp-link-tc" to={`/app/tien/2-1-1/${ctTtCu.id}`}>
                {ctTtCu.so}
              </Link>
            </span>
          </div>
        )}
        {dsTt.length > 0 && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Phiếu thanh toán:</span>
            <span className="m-xp-tri m-xp-links">
              {dsTt.map(c => (
                <Link key={c.id} className="m-xp-link-tc" to={`/app/tien/2-1-1/${c.id}`}>
                  {c.so}
                </Link>
              ))}
            </span>
          </div>
        )}
        {row._thamChieuDi && !coTcNhap && !(laDc && String(row._phieuGoc || row.phieuGoc || row._thamChieu || '') === String(row._thamChieu || '')) && (
          <div className="m-xp-dong-tt m-xp-tc">
            <span className="m-xp-nhan">Phiếu gốc:</span>
            <span className="m-xp-tri">
              <Link className="m-xp-link-tc" to={String(row._thamChieuDi)}>
                {String(row._phieuGoc || row.phieuGoc || row._thamChieu || 'Xem phiếu gốc')}
              </Link>
            </span>
          </div>
        )}
      </div>

      {/* Khối Hạch toán mở sẵn (Mẫu A) */}
      <KhoiHachToan dsButToan={dsButToan} />

      {/* 3. Danh sách dòng hàng / dòng thu chi / dòng kiểm kê */}
      <div className="m-xp-khoi-dong">
        <div className="m-xp-tieu-khoi">
          {laTien ? 'CHI TIẾT THU CHI' : laKk ? 'DANH SÁCH KIỂM KÊ' : laDongDienGiai ? 'CHI TIẾT' : 'DANH SÁCH HÀNG HOÁ'} ({dsDong.length})
        </div>

        {dsDong.length > 3 && (
          <div className="m-xp-tim-wrap">
            <Icon n="search" className="ic sm m-xp-tim-ic" kieu="net" />
            <input
              type="text"
              className="m-xp-tim-inp"
              placeholder="Nhập tên, mã hàng hoá..."
              value={timKiem}
              onChange={e => setTimKiem(e.target.value)}
            />
            {timKiem && (
              <button type="button" className="m-xp-tim-x" onClick={() => setTimKiem('')}>
                <Icon n="x" className="ic sm" kieu="net" />
              </button>
            )}
          </div>
        )}

        <div className="m-the-trang m-xp-ds-the">
          {dsDongLoc.length === 0 ? (
            <div className="m-xp-dong-trong">Không có dòng chi tiết</div>
          ) : (
            dsDongLoc.map((d, i) => {
              if (laKk) {
                const chenh = (d.tonTt ?? 0) - (d.tonHt ?? 0)
                const loaiKk = loaiXuLy(d) || 'Khớp'
                const chenhTxt = chenh > 0 ? `+${money(chenh)}` : money(chenh)
                const chenhLop = chenh > 0 ? 'm-so-dong-duong' : chenh < 0 ? 'm-so-dong-am' : ''
                const dvtTxt = d.dvt ? ` ${d.dvt}` : ''

                return (
                  <div key={i} className="m-xp-dong m-xp-dong-kk">
                    <div className="m-xp-kk-hang1">
                      <div className="m-xp-kk-ten-khoi">
                        {d.ma && <span className="m-bcd-ct-ma">{d.ma}</span>}
                        <b className="m-xp-dong-ten">{d.ten || 'Mặt hàng'}</b>
                      </div>
                      <span className={`m-xp-kk-chip ${chenh > 0 ? 'nhap' : chenh < 0 ? 'xuat' : 'khop'}`}>
                        {loaiKk}
                      </span>
                    </div>

                    <div className="m-xp-kk-luoi">
                      <div className="m-xp-kk-o">
                        <span className="m-xp-kk-nhan">Tồn hệ thống</span>
                        <span className="m-xp-kk-so">{money(d.tonHt ?? 0)}{dvtTxt}</span>
                      </div>
                      <div className="m-xp-kk-o">
                        <span className="m-xp-kk-nhan">Tồn thực tế</span>
                        <span className="m-xp-kk-so">{money(d.tonTt ?? 0)}{dvtTxt}</span>
                      </div>
                      <div className="m-xp-kk-o">
                        <span className="m-xp-kk-nhan">SL điều chỉnh</span>
                        <b className={`m-xp-kk-so ${chenhLop}`}>{chenhTxt}{dvtTxt}</b>
                      </div>
                    </div>

                    {d.ghiChu && (
                      <div className="m-xp-kk-ghichu">
                        <span className="m-xp-kk-gc-nhan">Ghi chú:</span> {d.ghiChu}
                      </div>
                    )}
                  </div>
                )
              }

              if (laTien) {
                const tieuDe = d.ten || d.ly || row.dienGiai || 'Nội dung'
                const dong2Parts = [
                  d.ly && d.ly !== tieuDe ? d.ly : '',
                  d.dt && d.dt !== row.doiTuong ? `Đối tượng: ${d.dt}` : '',
                  d.km ? `Khoản mục: ${tenKm(d.km)}` : '',
                  d.cv ? `Công việc: ${d.cv}` : '',
                  d.ts ? `VAT ${d.ts}%` : d.thue ? `VAT: ${money(d.thue)} đ` : '',
                  d.ghiChu,
                ].filter(Boolean)
                const dong2 = dong2Parts.join(' · ') || (d.ly ? d.ly : '')

                return (
                  <div key={i} className="m-xp-dong">
                    <div className="m-xp-dong-hang1">
                      <span className="m-xp-dong-ten">{tieuDe}</span>
                      <span className="m-xp-dong-tien m-num">{money(d.tien || 0)} đ</span>
                    </div>
                    {dong2 && <div className="m-xp-dong-phu">{dong2}</div>}
                  </div>
                )
              }

              if (laDongDienGiai) {
                const tieuDe = d.ten || d.ly || row.dienGiai || 'Diễn giải'
                const dong2Parts = [
                  d.ly && d.ly !== tieuDe ? d.ly : '',
                  d.km ? `Khoản mục: ${tenKm(d.km)}` : '',
                  d.cv ? `Công việc: ${d.cv}` : '',
                  d.ts ? `VAT ${d.ts}%` : d.thue ? `VAT: ${money(d.thue)} đ` : '',
                  d.kho ? `Kho: ${d.kho}` : '',
                  d.ghiChu,
                ].filter(Boolean)
                const dong2 = dong2Parts.join(' · ')

                return (
                  <div key={i} className="m-xp-dong">
                    <div className="m-xp-dong-hang1">
                      <span className="m-xp-dong-ten">{tieuDe}</span>
                      <span className="m-xp-dong-tien m-num">{money(d.tien || 0)} đ</span>
                    </div>
                    {dong2 && <div className="m-xp-dong-phu">{dong2}</div>}
                  </div>
                )
              }

              // Dòng hàng, nvl
              const slGia = laDc
                ? `Số lượng: ${money(d.sl ?? 0)}${d.dvt ? ` ${d.dvt}` : ''}`
                : `${d.sl ?? 0}${d.dvt ? ` ${d.dvt}` : ''} × ${money(d.gia ?? 0)}`
              const ckTxt = !laDc && d.ck ? `Giảm ${money(d.ck)}` : ''
              const vatTxt = !laDc && (d.ts ? `VAT ${d.ts}%` : d.thue ? `VAT ${money(d.thue)}` : '')
              const khoTxt = d.kho ? `Kho: ${d.kho}` : ''
              const dong2Parts = [slGia, ckTxt, vatTxt, khoTxt, d.ghiChu].filter(Boolean)
              const dong2 = dong2Parts.join(' · ')

              return (
                <div key={i} className="m-xp-dong">
                  <div className="m-xp-dong-hang1">
                    <span className="m-xp-dong-ten">{d.ten || 'Mặt hàng'}</span>
                    {!laDc && <span className="m-xp-dong-tien m-num">{money(d.tien || 0)} đ</span>}
                    {laDc && <span className="m-xp-dong-tien m-num">{money(d.sl ?? 0)} {d.dvt || ''}</span>}
                  </div>
                  <div className="m-xp-dong-phu">{dong2}</div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 4. Khối tổng kết: khớp số với DaiTong, thu chi bỏ Thành tiền mặt hàng */}
      {!laKk && !laDc && (
        <div className="m-the-trang m-xp-the-tong">
          {!laTien && (
            <div className="m-xp-dong-tt">
              <span className="m-xp-nhan">{laDongDienGiai ? 'Thành tiền' : 'Thành tiền mặt hàng'}:</span>
              <span className="m-xp-tri">{money(tongTien)} đ</span>
            </div>
          )}
          {!laTien && Boolean(bo.ck || tongCk) && (
            <div className="m-xp-dong-tt">
              <span className="m-xp-nhan">Tổng tiền giảm giá:</span>
              <span className="m-xp-tri">{tongCk ? `-${money(tongCk)}` : '0'} đ</span>
            </div>
          )}
          {!laTien && Boolean(tongThue > 0) && (
            <div className="m-xp-dong-tt">
              <span className="m-xp-nhan">Tổng tiền thuế:</span>
              <span className="m-xp-tri">{money(tongThue)} đ</span>
            </div>
          )}
          <div className="m-xp-dong-tt m-xp-dong-tong-cong">
            <span className="m-xp-nhan dam">Tổng thanh toán:</span>
            <span className="m-xp-tri dam cam lon">{money(tongThanhToan)} đ</span>
          </div>
        </div>
      )}

      {/* 5. Khối Lịch sử */}
      <div className="m-the-trang m-xp-accordion">
        <button
          type="button"
          className="m-xp-acc-head"
          onClick={() => setMoLs(!moLs)}
          aria-expanded={moLs}
        >
          <div className="m-xp-acc-tieu">
            <Icon n="history" className="ic sm" kieu="net" />
            <span>Lịch sử thao tác</span>
          </div>
          <Icon n={moLs ? 'chevu' : 'chevd'} className="ic sm" kieu="net" />
        </button>
        {moLs && (
          <div className="m-xp-acc-nd">
            <LichSu goi={s.goi} moi={false} man={`${mod.key}/${sc.slug}`} id={String(row.id)} />
          </div>
        )}
      </div>

      {/* 6. Thanh thao tác dính đáy (nằm trên thanh dưới nổi, không bị che) */}
      <div className="m-xp-day" style={{ justifyContent: 'flex-end' }}>
        <div className="m-xp-day-phai">
          {coNutGhiSo && row.tt === 'ghi' && (
            <button
              type="button"
              className="m-xp-nut-bo-ghi"
              onClick={() => setHoiBoGhi(true)}
            >
              Bỏ ghi sổ
            </button>
          )}
          {nutChinh && (
            <button type="button" className="m-xp-nut-cam" onClick={nutChinh.action}>
              {nutChinh.nhan}
            </button>
          )}
          <button
            type="button"
            className="m-xp-nut-menu"
            onClick={() => setMoMenu(true)}
            aria-label="Thao tác khác"
          >
            <Icon n="more" className="ic" kieu="net" />
          </button>
        </div>
      </div>

      {/* Tấm trượt menu ba chấm MChon */}
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
    </div>
  )
}
