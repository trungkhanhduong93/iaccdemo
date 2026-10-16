import { useMemo, useState, type FC } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { duongDan, tenMan } from '../../app/registry'
import { cuaHangHienTai, ngayDauNam, truocDauNam, useSession } from '../../app/session'
import { CUA_HANG, HANG, KHO, NVL } from '../../data/mock'
import { fold, money } from '../format'
import { Icon } from '../Icon'
import { LichDon } from '../ChonNgay'
import { MChon } from './MChon'
import { MTrong } from './MTrong'
import { bayGio, dsDcCon, ghiNhatKy, soKeTiep, suaPhieu, themPhieu, xoaPhieu, type CtTt } from '../generic/daXoa'
import { useDongChungTu } from '../generic/VoucherScreen'
import { useDsPhieuDcn } from '../../modules/kho/BangDieuChuyen'
import { useDsPhieuSx } from '../../modules/kho/BangSanXuat'
import { MAN_DC, phieuDieuChinh, type LoaiDc } from '../../modules/kho/dieu-chinh'
import {
  CONG_THUC_CB, CONG_THUC_SC, SX, dongNhapTuXuat, dongXuatSc, hangCua, keoNvlCb, soLuong, tienToSx,
  type DongSx, type LoaiSx,
} from '../../modules/kho/san-xuat'
import { DCN, khoCuaCn, type DongDcn, type LoaiDcn } from '../../modules/kho/dieu-chuyen'
import type { Dong } from '../generic/gen'

export interface MLapPhieuKhoProps extends ScreenProps {
  id?: string
}

export const MLapPhieuKho: FC<MLapPhieuKhoProps> = ({ sc, mod, id }) => {
  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const dangSua = Boolean(id && id !== 'moi')
  const cfgMan = sc.voucher ?? { prefix: 'CT', doiTuong: 'none', dienGiai: [tenMan(sc)], tien: [0, 0] }

  const laDcn = Boolean(cfgMan.dieuChuyen)
  const laSx = Boolean(cfgMan.sanXuat)

  const { rows: rowsGoc } = useDongChungTu(sc, mod)
  const rowsDcn = useDsPhieuDcn(cfgMan.dieuChuyen ?? 'xdc')
  const rowsSx = useDsPhieuSx(cfgMan.sanXuat ?? 'xsc')
  const rows = laDcn ? rowsDcn : laSx ? rowsSx : rowsGoc

  const row = useMemo(() => (dangSua ? rows.find(r => String(r.id) === String(id)) : undefined), [rows, id, dangSua])

  if (dangSua && !row) {
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

  return <ThanLapPhieuKho key={id ?? 'moi'} sc={sc} mod={mod} id={id} row={row} />
}

interface ThanLapPhieuKhoProps extends ScreenProps {
  id?: string
  row?: Row
}

const ThanLapPhieuKho: FC<ThanLapPhieuKhoProps> = ({ sc, mod, id, row }) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const loc = useLocation()
  const [sp] = useSearchParams()
  const path = duongDan(mod, sc)

  const cfgMan = sc.voucher ?? { prefix: 'CT', doiTuong: 'none', dienGiai: [tenMan(sc)], tien: [0, 0] }
  const saoChep = (loc.state as { saoChep?: Row } | null)?.saoChep
  const gocData = row ?? saoChep
  const dangSua = Boolean(row)

  const laKk = Boolean(cfgMan.kiemKe)
  const laDc = Boolean(cfgMan.dieuChinh)
  const sx = cfgMan.sanXuat as LoaiSx | undefined
  const laSx = Boolean(sx)
  const dcn = cfgMan.dieuChuyen as LoaiDcn | undefined
  const laDcn = Boolean(dcn)

  // Loại tab điều chỉnh
  const loaiKey = (gocData?.loai ?? sp.get('loai') ?? cfgMan.loai?.[0]?.k ?? 'xdc') as LoaiDc
  const loai = cfgMan.loai?.find(x => x.k === loaiKey) ?? cfgMan.loai?.[0]

  // Tên loại phiếu hiển thị
  const tenLoai = useMemo(() => {
    if (laKk) return 'Kiểm kê kho'
    if (laDc) return loaiKey === 'ndc' ? 'Nhập điều chỉnh' : 'Xuất điều chỉnh'
    if (laSx && sx) return SX[sx].ten
    if (laDcn && dcn) return DCN[dcn].ten
    return tenMan(sc)
  }, [laKk, laDc, loaiKey, laSx, sx, laDcn, dcn, sc])

  const cnChon = cuaHangHienTai(s)
  const cuaHang = gocData?.cn ? String(gocData.cn) : cnChon?.ten ?? 'Phố Mây Lê Lợi'

  // Danh sách kho theo cửa hàng
  const dsKhoCn = useMemo(() => {
    const k = khoCuaCn(cuaHang)
    return k.length ? k : KHO
  }, [cuaHang])

  // State các bước: 1: Thông tin chung, 2: Chọn hàng/thành phẩm, 3: Sửa dòng, 4: Xác nhận, 5: Thành công
  const [buoc, setBuoc] = useState<number>(1)

  // Thời gian
  const [moLich, setMoLich] = useState(false)
  const [thoiGian, setThoiGian] = useState(() => {
    if (gocData?.ngay) return [gocData.ngay, gocData.gio || '10:00'].filter(Boolean).join(' ')
    const now = new Date()
    const d = String(now.getDate()).padStart(2, '0')
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const y = now.getFullYear()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    return `${d}/${m}/${y} ${hh}:${mm}`
  })

  // Kho chính (kho xuất với xdc/ck/sx xuất, kho nhập với ndc/sx nhập/kk/dc)
  const [kho, setKho] = useState(() => {
    if (gocData?._kho || gocData?.kho) return String(gocData._kho ?? gocData.kho)
    return dsKhoCn[0] ?? 'Kho bếp Lê Lợi'
  })

  // Kho nhận (với điều chuyển)
  const [khoNhan, setKhoNhan] = useState(() => {
    if (gocData?._khoNhan) return String(gocData._khoNhan)
    if (laDcn && dcn === 'ck') {
      const khoKhac = dsKhoCn.find(k => k !== (gocData?._kho ?? dsKhoCn[0]))
      return khoKhac ?? ''
    }
    return ''
  })

  // Cửa hàng nhận (với xuất điều chuyển xdc)
  const dsCnNhan = useMemo(() => CUA_HANG.filter(c => c.ten !== cuaHang), [cuaHang])
  const [cnNhan, setCnNhan] = useState(() => {
    if (gocData?._cnNhan || gocData?.doiTuong) return String(gocData._cnNhan ?? gocData.doiTuong)
    return dsCnNhan[0]?.ten ?? 'Phố Mây Thảo Điền'
  })

  const dsKhoNhanXdc = useMemo(() => khoCuaCn(cnNhan), [cnNhan])

  // Ghi chú
  const [ghiChu, setGhiChu] = useState(() => {
    return String(gocData?._ghiChu ?? gocData?.dienGiai ?? cfgMan.dienGiai?.[0] ?? '')
  })

  // Danh sách dòng
  const [dsDong, setDsDong] = useState<Dong[]>(() => {
    if (gocData?._dong && Array.isArray(gocData._dong)) return gocData._dong as Dong[]
    return []
  })

  // Thành phẩm chọn ở sản xuất chế biến
  const dsTpCoCongThuc = useMemo(() => CONG_THUC_CB.filter(c => c.tt === 'on'), [])
  const [tpChonMa, setTpChonMa] = useState<string>(() => dsTpCoCongThuc[0]?.spMa ?? 'PHO01')
  const [tpSoLuong, setTpSoLuong] = useState<number>(10)

  // Nguồn hàng hoá
  const danhMucHang = useMemo(() => NVL, [])

  const dsNhomHang = useMemo(() => {
    const set = new Set<string>()
    danhMucHang.forEach(h => {
      if (h.nhom) set.add(h.nhom)
    })
    return ['Tất cả', ...Array.from(set)]
  }, [danhMucHang])

  // Lọc và tìm kiếm ở Bước 2
  const [nhomHangChon, setNhomHangChon] = useState('Tất cả')
  const [timHang, setTimHang] = useState('')
  const [moChonNhom, setMoChonNhom] = useState(false)

  // Sheet chọn ở Bước 1
  const [moChonKho, setMoChonKho] = useState(false)
  const [moChonKhoNhan, setMoChonKhoNhan] = useState(false)
  const [moChonCnNhan, setMoChonCnNhan] = useState(false)

  // Sau khi lưu ở Bước 5
  const [soPhieuMoi, setSoPhieuMoi] = useState('')
  const [idPhieuMoi, setIdPhieuMoi] = useState('')

  // Tính tổng
  const tongTien = useMemo(() => {
    if (laKk) return 0
    return dsDong.reduce((a, d) => a + (Number(d.tien) || 0), 0)
  }, [dsDong, laKk])

  // Cập nhật dòng
  const doiDong = (idx: number, patch: Partial<Dong>) => {
    setDsDong(ds => ds.map((d, i) => {
      if (i !== idx) return d
      const hopNhat = { ...d, ...patch }
      if (laKk) {
        const tonHt = hopNhat.tonHt !== undefined ? Number(hopNhat.tonHt) : 0
        const tonTt = hopNhat.tonTt !== undefined ? Number(hopNhat.tonTt) : 0
        return { ...hopNhat, tonHt, tonTt, sl: tonTt }
      }
      const sl = hopNhat.sl !== undefined ? Number(hopNhat.sl) : 0
      const gia = hopNhat.gia !== undefined ? Number(hopNhat.gia) : 0
      const tien = patch.tien !== undefined ? Number(patch.tien) : Math.round(sl * gia)
      return { ...hopNhat, sl, gia, tien }
    }))
  }

  // Bước 1: Tiếp tục
  const quaBuoc1 = () => {
    if (!kho.trim()) {
      toast('Vui lòng chọn kho')
      return
    }
    if (laDcn) {
      if (dcn === 'ck') {
        if (!khoNhan.trim()) {
          toast('Vui lòng chọn kho nhận')
          return
        }
        if (khoNhan === kho) {
          toast('Kho nhận phải khác kho xuất')
          return
        }
      } else if (dcn === 'xdc') {
        if (!cnNhan.trim()) {
          toast('Vui lòng chọn cửa hàng nhận')
          return
        }
        if (!khoNhan.trim()) {
          toast('Vui lòng chọn kho nhận')
          return
        }
        if (khoNhan === kho) {
          toast('Kho nhận phải khác kho xuất')
          return
        }
      }
    }
    if (!thoiGian.trim()) {
      toast('Vui lòng nhập thời gian')
      return
    }

    // Nếu là sửa hoặc đã có dòng thì qua bước 3, chưa có dòng thì qua bước 2
    if (dsDong.length > 0 && dangSua) {
      setBuoc(3)
    } else {
      setBuoc(2)
    }
  }

  // Chọn thành phẩm trong sản xuất
  const apDungCongThucSx = (spMa: string, slTp: number) => {
    setTpChonMa(spMa)
    setTpSoLuong(slTp)
    const nvlDong = keoNvlCb(spMa, slTp)
    setDsDong(nvlDong)
  }

  // Bước 2: Danh sách hàng hiển thị
  const dsHangHienThi = useMemo(() => {
    let list = danhMucHang
    if (nhomHangChon && nhomHangChon !== 'Tất cả') {
      list = list.filter(h => h.nhom === nhomHangChon)
    }
    if (timHang.trim()) {
      const q = fold(timHang.trim())
      list = list.filter(h => fold(h.ten).includes(q) || fold(h.ma).includes(q))
    }
    return list
  }, [danhMucHang, nhomHangChon, timHang])

  const tatCaDaChon = dsHangHienThi.length > 0 && dsHangHienThi.every(h => dsDong.some(d => d.ma === h.ma))

  const toggleHang = (h: (typeof danhMucHang)[0]) => {
    const daCo = dsDong.some(d => d.ma === h.ma)
    if (daCo) {
      setDsDong(ds => ds.filter(d => d.ma !== h.ma))
    } else {
      const gia = h.gia || 0
      const sl = 1
      const tien = sl * gia
      if (laKk) {
        // Kiểm kê: có tồn hệ thống mẫu 10, tồn thực tế mặc định 10
        setDsDong(ds => [
          ...ds,
          {
            ma: h.ma,
            ten: h.ten,
            dvt: h.dvt,
            sl: 10,
            gia: 0,
            tien: 0,
            ts: 0,
            thue: 0,
            tonHt: 10,
            tonTt: 10,
            kho,
            ghiChu: '',
          },
        ])
      } else {
        setDsDong(ds => [
          ...ds,
          {
            ma: h.ma,
            ten: h.ten,
            dvt: h.dvt,
            sl,
            gia,
            tien,
            ts: 0,
            thue: 0,
            kho,
            ghiChu: '',
          },
        ])
      }
    }
  }

  const toggleTatCa = () => {
    if (tatCaDaChon) {
      const maSet = new Set(dsHangHienThi.map(h => h.ma))
      setDsDong(ds => ds.filter(d => !maSet.has(d.ma ?? '')))
    } else {
      const dongMoi = [...dsDong]
      for (const h of dsHangHienThi) {
        if (!dongMoi.some(d => d.ma === h.ma)) {
          const gia = h.gia || 0
          const sl = 1
          const tien = sl * gia
          if (laKk) {
            dongMoi.push({
              ma: h.ma,
              ten: h.ten,
              dvt: h.dvt,
              sl: 10,
              gia: 0,
              tien: 0,
              ts: 0,
              thue: 0,
              tonHt: 10,
              tonTt: 10,
              kho,
              ghiChu: '',
            })
          } else {
            dongMoi.push({
              ma: h.ma,
              ten: h.ten,
              dvt: h.dvt,
              sl,
              gia,
              tien,
              ts: 0,
              thue: 0,
              kho,
              ghiChu: '',
            })
          }
        }
      }
      setDsDong(dongMoi)
    }
  }

  // Thao tác Bước 3
  const nhanDoiDong = (idx: number) => {
    const item = dsDong[idx]
    if (!item) return
    setDsDong(ds => [...ds.slice(0, idx + 1), { ...item }, ...ds.slice(idx + 1)])
  }

  const xoaDong = (idx: number) => {
    setDsDong(ds => ds.filter((_, i) => i !== idx))
  }

  // Thực hiện lưu chứng từ
  const thucHienLuu = (moMoi = false) => {
    const ngayChiTiet = thoiGian.split(' ')[0]
    if (!dangSua && truocDauNam(s, ngayChiTiet)) {
      toast(`Ngày chứng từ phải từ ngày đầu năm ${ngayDauNam(s)} trở đi`)
      return
    }

    if (laDcn && (dcn === 'ck' || dcn === 'xdc') && khoNhan === kho) {
      toast('Kho nhận phải khác kho xuất')
      return
    }

    if (dsDong.length === 0) {
      toast('Vui lòng chọn ít nhất một mặt hàng')
      return
    }

    const man = `${mod.key}/${sc.slug}`
    const idLuu = dangSua ? String(row!.id) : `moi-${Date.now()}`
    let soCt = ''

    if (dangSua) {
      soCt = String(row!.so)
    } else {
      if (laKk) {
        soCt = soKeTiep(man, `${cfgMan.prefix || 'KK'}2610-`)
      } else if (laDc) {
        const prefix = loaiKey === 'ndc' ? 'NDC2610-' : 'XDC2610-'
        soCt = soKeTiep(man, prefix)
      } else if (laSx && sx) {
        soCt = soKeTiep(man, tienToSx(sx))
      } else if (laDcn && dcn) {
        soCt = soKeTiep(man, `${DCN[dcn].prefix}2610-`)
      } else {
        soCt = soKeTiep(man, `${cfgMan.prefix || 'CT'}2610-`)
      }
    }

    // Xử lý riêng cho Kiểm kê: đồng bộ phiếu điều chỉnh
    let dsDc: CtTt[] | undefined = undefined
    if (laKk) {
      const cu = dsDcCon(row)
      const kk = { id: idLuu, so: soCt, ngay: ngayChiTiet, cn: cuaHang, kho }
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
      dsDc = ra
    }

    const noiDung: Record<string, unknown> = {
      ngay: ngayChiTiet,
      gio: thoiGian.split(' ')[1] || '10:00',
      thang: Number(ngayChiTiet.split('/')[1]) || 10,
      doiTuong: laDcn && dcn === 'xdc' ? cnNhan : '',
      dienGiai: ghiChu || (laKk ? 'Kiểm kê kho' : laDc ? (loaiKey === 'ndc' ? 'Nhập điều chỉnh' : 'Xuất điều chỉnh') : tenLoai),
      tien: tongTien,
      thue: 0,
      tong: tongTien,
      _dong: dsDong,
      _kho: kho,
      _ghiChu: ghiChu,
      ...(dsDc ? { _dsDc: dsDc } : {}),
      ...(laSx ? {
        ttSx: row?.ttSx ?? (SX[sx!].nhap ? 'da' : 'cho'),
        _ngayCapNhat: bayGio(),
        _nguoiCapNhat: s.ten,
      } : {}),
      ...(laDcn ? {
        ...(dcn !== 'ck' ? { ttSx: row?.ttSx ?? (dcn === 'ndc' ? 'da' : 'cho') } : {}),
        _ngayCapNhat: bayGio(),
        _nguoiCapNhat: s.ten,
        _khoNhan: khoNhan,
        ...(dcn === 'xdc' ? { _cnNhan: cnNhan } : {}),
      } : {}),
    }

    if (dangSua) {
      suaPhieu(man, String(row!.id), noiDung)
      ghiNhatKy(man, String(row!.id), soCt, s.ten, 'Sửa chứng từ')
      toast(`Đã lưu thay đổi ${soCt}`)
      nav(`${path}/${row!.id}`)
      return
    }

    themPhieu(man, {
      id: idLuu,
      so: soCt,
      cn: cuaHang,
      nguon: 'tay',
      loai: laDc ? loaiKey : loai?.k,
      tenLoai,
      tt: laKk || (laDcn && dcn === 'ck') ? 'ghi' : 'nhap',
      ...noiDung,
    }, s.ten)
    ghiNhatKy(man, idLuu, soCt, s.ten, 'Thêm mới chứng từ')
    toast(`Đã lưu ${soCt}`)

    if (moMoi) {
      setGhiChu('')
      setNhomHangChon('Tất cả')
      setTimHang('')
      setDsDong([])
      setBuoc(1)
    } else {
      setSoPhieuMoi(soCt)
      setIdPhieuMoi(idLuu)
      setBuoc(5)
    }
  }

  // Điều hướng nút quay lại
  const handleQuayLai = () => {
    if (buoc === 1) {
      if (dangSua) nav(`${path}/${id}`)
      else nav(path)
    } else if (buoc === 2) {
      setBuoc(1)
    } else if (buoc === 3) {
      setBuoc(2)
    } else if (buoc === 4) {
      setBuoc(3)
    } else if (buoc === 5) {
      nav(path)
    }
  }

  return (
    <div className="m-lp">
      {/* ── BƯỚC 1: ĐẦU PHIẾU ── */}
      {buoc === 1 && (
        <div className="m-lp-buoc">
          <div className="m-lp-dau">
            <button type="button" className="m-lp-btn-back" onClick={handleQuayLai} aria-label="Quay lại">
              <Icon n="chevl" className="ic sm" />
            </button>
            <h2 className="m-lp-tieu-de">{dangSua ? `Chỉnh sửa ${tenLoai}` : `Thêm mới ${tenLoai}`}</h2>
            <div className="m-lp-dau-phu" />
          </div>

          <div className="m-lp-than">
            {/* Kho xuất / Kho kiểm kê */}
            <div className="m-the-trang m-lp-the-truong" onClick={() => setMoChonKho(true)}>
              <div className="m-lp-truong-trai">
                <Icon n="store" className="ic sm m-lp-truong-ic" />
                <div className="m-lp-truong-nd">
                  <span className="m-lp-truong-nhan">
                    {laKk
                      ? 'Kho kiểm kê'
                      : laDcn
                      ? (dcn === 'ndc' ? 'Kho nhận' : 'Kho xuất')
                      : laSx
                      ? (SX[sx!].nhap ? 'Kho nhập' : 'Kho xuất')
                      : 'Kho'} <b className="m-lp-sao">*</b>
                  </span>
                  <span className="m-lp-truong-tri">{kho || 'Chọn kho'}</span>
                </div>
              </div>
            </div>

            {/* Cửa hàng nhận (với xuất điều chuyển) */}
            {laDcn && dcn === 'xdc' && (
              <div className="m-the-trang m-lp-the-truong" onClick={() => setMoChonCnNhan(true)}>
                <div className="m-lp-truong-trai">
                  <Icon n="store" className="ic sm m-lp-truong-ic" />
                  <div className="m-lp-truong-nd">
                    <span className="m-lp-truong-nhan">
                      Cửa hàng nhận <b className="m-lp-sao">*</b>
                    </span>
                    <span className="m-lp-truong-tri">{cnNhan || 'Chọn cửa hàng nhận'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Kho nhận (với điều chuyển) */}
            {laDcn && (dcn === 'ck' || dcn === 'xdc') && (
              <div className="m-the-trang m-lp-the-truong m-lp-kho-nhan-wrap" onClick={() => setMoChonKhoNhan(true)}>
                <div className="m-lp-truong-trai">
                  <Icon n="store" className="ic sm m-lp-truong-ic" />
                  <div className="m-lp-truong-nd">
                    <span className="m-lp-truong-nhan">
                      Kho nhận <b className="m-lp-sao">*</b>
                    </span>
                    <span className="m-lp-truong-tri">{khoNhan || 'Chọn kho nhận'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Thời gian */}
            <div className="m-the-trang m-lp-the-truong">
              <div className="m-lp-truong-trai">
                <Icon n="clock" className="ic sm m-lp-truong-ic" />
                <div className="m-lp-truong-nd">
                  <span className="m-lp-truong-nhan">
                    Thời gian <b className="m-lp-sao">*</b>
                  </span>
                  <input
                    type="text"
                    className="m-lp-inp-tri"
                    value={thoiGian}
                    readOnly
                    onClick={() => setMoLich(true)}
                    placeholder="DD/MM/YYYY HH:mm"
                  />
                  {moLich && (
                    <LichDon
                      value={thoiGian.slice(0, 10)}
                      onChange={v => setThoiGian(v + thoiGian.slice(10))}
                      onDong={() => setMoLich(false)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Ghi chú / Diễn giải */}
            <div className="m-the-trang m-lp-the-truong">
              <div className="m-lp-truong-trai">
                <Icon n="file" className="ic sm m-lp-truong-ic" />
                <div className="m-lp-truong-nd">
                  <span className="m-lp-truong-nhan">
                    {laDc ? 'Lý do điều chỉnh' : 'Ghi chú / Diễn giải'}
                  </span>
                  <input
                    type="text"
                    className="m-lp-inp-tri"
                    value={ghiChu}
                    onChange={e => setGhiChu(e.target.value)}
                    placeholder={laDc ? 'Nhập lý do điều chỉnh' : 'Nhập ghi chú nếu có'}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="m-lp-day">
            <button type="button" className="m-lp-nut-chinh m-lp-nut-tiep" onClick={quaBuoc1}>
              Tiếp tục
            </button>
          </div>

          {/* Sheet chọn kho */}
          <MChon
            mo={moChonKho}
            onDong={() => setMoChonKho(false)}
            tieuDe={laKk ? 'Chọn kho kiểm kê' : 'Chọn kho'}
            ds={dsKhoCn.map(k => ({ k, ten: k }))}
            chon={kho}
            onChon={v => {
              setKho(v)
              if (laDcn && dcn === 'ck' && v === khoNhan) setKhoNhan('')
            }}
            apDung
            tim
          />

          {/* Sheet chọn cửa hàng nhận (xdc) */}
          {laDcn && dcn === 'xdc' && (
            <MChon
              mo={moChonCnNhan}
              onDong={() => setMoChonCnNhan(false)}
              tieuDe="Chọn cửa hàng nhận"
              ds={dsCnNhan.map(c => ({ k: c.ten, ten: c.ten }))}
              chon={cnNhan}
              onChon={v => {
                setCnNhan(v)
                const k = khoCuaCn(v)
                setKhoNhan(k.length === 1 ? k[0] : '')
              }}
              apDung
              tim
            />
          )}

          {/* Sheet chọn kho nhận */}
          {laDcn && (dcn === 'ck' || dcn === 'xdc') && (
            <MChon
              mo={moChonKhoNhan}
              onDong={() => setMoChonKhoNhan(false)}
              tieuDe="Chọn kho nhận"
              ds={(dcn === 'xdc' ? dsKhoNhanXdc : dsKhoCn).map(k => ({ k, ten: k }))}
              chon={khoNhan}
              onChon={v => {
                if (v === kho) {
                  toast('Kho nhận phải khác kho xuất')
                  return
                }
                setKhoNhan(v)
              }}
              apDung
              tim
            />
          )}
        </div>
      )}

      {/* ── BƯỚC 2: CHỌN HÀNG HOÁ HOẶC THÀNH PHẨM ── */}
      {buoc === 2 && (
        <div className="m-lp-buoc">
          <div className="m-lp-dau">
            <button type="button" className="m-lp-btn-back" onClick={handleQuayLai} aria-label="Quay lại">
              <Icon n="chevl" className="ic sm" />
            </button>
            <h2 className="m-lp-tieu-de">{laSx && sx === 'xcb' ? 'Chọn thành phẩm sản xuất' : 'Chọn hàng hoá'}</h2>
            <div className="m-lp-dau-phu" />
          </div>

          {/* Với sản xuất chế biến: Khối chọn thành phẩm và số lượng định làm */}
          {laSx && sx === 'xcb' && (
            <div className="m-lp-tp-hop">
              <div className="m-lp-truong-nhan" style={{ marginBottom: 6, fontWeight: 600 }}>
                Thành phẩm có công thức chế biến ({dsTpCoCongThuc.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dsTpCoCongThuc.map(c => {
                  const tp = hangCua(c.spMa)
                  const dangChon = tpChonMa === c.spMa && dsDong.length > 0
                  return (
                    <div
                      key={c.id}
                      className={`m-the-trang m-lp-tp-the ${dangChon ? 'on' : ''}`}
                      onClick={() => apDungCongThucSx(c.spMa, tpSoLuong)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{tp?.ten ?? c.spMa}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          Mã: {c.spMa} · {c.moTa || 'Công thức chuẩn'}
                        </div>
                      </div>
                      <div className={`m-lp-cb-hang ${dangChon ? 'on' : ''}`}>
                        {dangChon && <Icon n="check" className="ic sm" />}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="m-lp-tp-sl">
                <span className="m-lp-sua-nhan">Số lượng làm:</span>
                <input
                  type="text"
                  className="m-lp-sua-inp num"
                  style={{ width: 80 }}
                  value={tpSoLuong}
                  onChange={e => {
                    const n = Number(e.target.value.replace(/\D/g, '')) || 1
                    apDungCongThucSx(tpChonMa, n)
                  }}
                />
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{hangCua(tpChonMa)?.dvt ?? 'Tô'}</span>
              </div>
            </div>
          )}

          {/* Với các loại khác hoặc chọn thêm NVL */}
          {(!laSx || sx !== 'xcb') && (
            <>
              <div className="m-lp-loc-hang">
                <button
                  type="button"
                  className="m-lp-btn-nhom"
                  onClick={() => setMoChonNhom(true)}
                >
                  <span>{nhomHangChon}</span>
                  <Icon n="chevd" className="ic sm" />
                </button>
                <div className="m-lp-tim-hang-wrap">
                  <Icon n="search" className="ic sm m-lp-tim-ic" />
                  <input
                    type="text"
                    className="m-lp-tim-hang-inp"
                    placeholder="Tìm tên, mã hàng..."
                    value={timHang}
                    onChange={e => setTimHang(e.target.value)}
                  />
                  {timHang && (
                    <button type="button" className="m-lp-tim-hang-x" onClick={() => setTimHang('')}>
                      <Icon n="x" className="ic sm" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className={`m-lp-cb-tat-ca ${tatCaDaChon ? 'on' : ''}`}
                  onClick={toggleTatCa}
                  title="Chọn tất cả"
                >
                  {tatCaDaChon && <Icon n="check" className="ic sm" />}
                </button>
              </div>

              <div className="m-lp-than m-lp-ds-hang">
                {dsHangHienThi.map(h => {
                  const daChon = dsDong.some(d => d.ma === h.ma)
                  return (
                    <div
                      key={h.ma}
                      className={`m-the-trang m-lp-the-hang ${daChon ? 'on' : ''}`}
                      onClick={() => toggleHang(h)}
                    >
                      <div className="m-lp-hang-trai">
                        <div className="m-lp-hang-ten">{h.ten}</div>
                        <div className="m-lp-hang-phu">
                          Mã: {h.ma} · {h.dvt} {!laKk && `· ${money(h.gia)} đ`}
                        </div>
                      </div>
                      <div className={`m-lp-cb-hang ${daChon ? 'on' : ''}`}>
                        {daChon && <Icon n="check" className="ic sm" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <div className="m-lp-day">
            <div className="m-lp-day-trai">
              <span className="m-lp-day-dem">Đã chọn: <b>{dsDong.length}</b></span>
            </div>
            <button
              type="button"
              className="m-lp-nut-chinh"
              disabled={dsDong.length === 0}
              onClick={() => {
                if (dsDong.length === 0) {
                  toast('Vui lòng chọn ít nhất một mặt hàng')
                  return
                }
                setBuoc(3)
              }}
            >
              Danh sách đã chọn
            </button>
          </div>

          <MChon
            mo={moChonNhom}
            onDong={() => setMoChonNhom(false)}
            tieuDe="Chọn nhóm hàng"
            ds={dsNhomHang.map(nh => ({ k: nh, ten: nh }))}
            chon={nhomHangChon}
            onChon={setNhomHangChon}
            apDung
            tim
          />
        </div>
      )}

      {/* ── BƯỚC 3: SỬA DÒNG CHI TIẾT ── */}
      {buoc === 3 && (
        <div className="m-lp-buoc">
          <div className="m-lp-dau">
            <button type="button" className="m-lp-btn-back" onClick={handleQuayLai} aria-label="Quay lại">
              <Icon n="chevl" className="ic sm" />
            </button>
            <h2 className="m-lp-tieu-de">
              {laKk ? 'Chi tiết kiểm kê' : 'Danh sách đã chọn'}
            </h2>
            <div className="m-lp-dau-phai-nut">
              <button type="button" className="m-lp-btn-icon-dau" onClick={() => setBuoc(2)} title="Thêm hàng">
                <Icon n="plus" className="ic sm" />
              </button>
            </div>
          </div>

          <div className="m-lp-than m-lp-ds-sua">
            {laKk ? (
              // Dòng kiểm kê: tồn sổ sách (chỉ đọc), số thực tế (nhập), chênh lệch tự tính, tô màu thừa/thiếu
              dsDong.map((d, i) => {
                const tonHt = Number(d.tonHt ?? 0)
                const tonTt = Number(d.tonTt ?? tonHt)
                const chenh = tonTt - tonHt
                return (
                  <div key={i} className="m-the-trang m-lp-the-sua">
                    <div className="m-lp-sua-dau">
                      <div className="m-lp-sua-tieu">
                        {i + 1}. {d.ten} {d.ma ? `· ${d.ma}` : ''}
                      </div>
                      <div className="m-lp-sua-tac-vu">
                        <button type="button" className="m-lp-sua-nut do" onClick={() => xoaDong(i)} title="Xoá">
                          <Icon n="x" className="ic sm" />
                        </button>
                      </div>
                    </div>

                    <div className="m-lp-sua-luoi">
                      {/* Tồn sổ sách (chỉ đọc) */}
                      <div className="m-lp-sua-hang">
                        <span className="m-lp-sua-nhan">Tồn sổ sách:</span>
                        <div className="m-lp-kk-doc">
                          <span>{money(tonHt)} {d.dvt || 'Cái'}</span>
                        </div>
                      </div>

                      {/* Số thực tế (nhập) */}
                      <div className="m-lp-sua-hang">
                        <span className="m-lp-sua-nhan dam">Số thực tế:</span>
                        <div className="m-lp-sua-sl-wrap">
                          <input
                            type="text"
                            className="m-lp-sua-inp num"
                            value={d.tonTt ?? tonHt}
                            onChange={e => {
                              const v = Number(e.target.value.replace(/[^0-9.]/g, '')) || 0
                              doiDong(i, { tonTt: v, sl: v })
                            }}
                          />
                          <span className="m-lp-sua-dvt">{d.dvt || 'Cái'}</span>
                        </div>
                      </div>

                      {/* Chênh lệch tự tính */}
                      <div className="m-lp-sua-hang">
                        <span className="m-lp-sua-nhan dam">Chênh lệch:</span>
                        <div className="m-lp-kk-chenh">
                          <span className={`dam ${chenh < 0 ? 'do' : chenh > 0 ? 'xanh' : ''}`}>
                            {chenh > 0 ? `+${money(chenh)}` : money(chenh)} {d.dvt}
                          </span>
                          {chenh < 0 && <span className="m-ct-chip err">Thiếu</span>}
                          {chenh > 0 && <span className="m-ct-chip ok">Thừa</span>}
                          {chenh === 0 && <span className="m-ct-chip dim">Khớp</span>}
                        </div>
                      </div>

                      {/* Ghi chú lý do chênh lệch */}
                      <div className="m-lp-sua-hang doc">
                        <input
                          type="text"
                          className="m-lp-sua-inp ghi-chu"
                          placeholder="Lý do chênh lệch nếu có"
                          value={d.ghiChu || ''}
                          onChange={e => doiDong(i, { ghiChu: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              // Dòng điều chỉnh, sản xuất, điều chuyển: sửa được số lượng
              dsDong.map((d, i) => {
                const dongSx = d as DongSx
                return (
                  <div key={i} className="m-the-trang m-lp-the-sua">
                    <div className="m-lp-sua-dau">
                      <div className="m-lp-sua-tieu">
                        {i + 1}. {d.ten} {d.ma ? `· ${d.ma}` : ''}
                      </div>
                      <div className="m-lp-sua-tac-vu">
                        <button type="button" className="m-lp-sua-nut" onClick={() => nhanDoiDong(i)} title="Nhân đôi">
                          <Icon n="copy" className="ic sm" />
                        </button>
                        <button type="button" className="m-lp-sua-nut do" onClick={() => xoaDong(i)} title="Xoá">
                          <Icon n="x" className="ic sm" />
                        </button>
                      </div>
                    </div>

                    {dongSx.tp && (
                      <div className="m-lp-tp-badge">
                        <Icon n="flask" className="ic sm" /> Thành phẩm: {dongSx.tp}
                      </div>
                    )}

                    <div className="m-lp-sua-luoi">
                      <div className="m-lp-sua-hang">
                        <span className="m-lp-sua-nhan">
                          Số lượng:
                          {dongSx.slKh !== undefined && (
                            <small style={{ color: 'var(--muted)', marginLeft: 4 }}>
                              (KH: {soLuong(dongSx.slKh)})
                            </small>
                          )}
                        </span>
                        <div className="m-lp-sua-sl-wrap">
                          <input
                            type="text"
                            className="m-lp-sua-inp num"
                            value={d.sl ?? 1}
                            onChange={e => {
                              const v = Number(e.target.value.replace(/[^0-9.]/g, '')) || 0
                              doiDong(i, { sl: v })
                            }}
                          />
                          <span className="m-lp-sua-dvt">{d.dvt || 'Cái'}</span>
                        </div>
                      </div>

                      {dcn !== 'ck' && (
                        <div className="m-lp-sua-hang">
                          <span className="m-lp-sua-nhan">Đơn giá:</span>
                          <div className="m-lp-sua-gia-wrap">
                            <input
                              type="text"
                              className="m-lp-sua-inp num"
                              value={money(d.gia || 0)}
                              onChange={e => {
                                const v = Number(e.target.value.replace(/\D/g, '')) || 0
                                doiDong(i, { gia: v })
                              }}
                            />
                            <span className="m-lp-sua-dvt">đ</span>
                          </div>
                        </div>
                      )}

                      {dcn !== 'ck' && (
                        <div className="m-lp-sua-hang">
                          <span className="m-lp-sua-nhan dam">Thành tiền:</span>
                          <span className="m-lp-sua-thanh-tien dam cam">{money(d.tien || 0)} đ</span>
                        </div>
                      )}

                      <div className="m-lp-sua-hang doc">
                        <input
                          type="text"
                          className="m-lp-sua-inp ghi-chu"
                          placeholder="Nhập ghi chú nếu có"
                          value={d.ghiChu || ''}
                          onChange={e => doiDong(i, { ghiChu: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="m-lp-day">
            <div className="m-lp-day-trai">
              {laKk ? (
                <span className="m-lp-day-nhan">Tổng mặt hàng: <b>{dsDong.length}</b></span>
              ) : (
                <>
                  <span className="m-lp-day-nhan">Tổng:</span>
                  <span className="m-lp-day-tong">{money(tongTien)} đ</span>
                </>
              )}
            </div>
            <button
              type="button"
              className="m-lp-nut-chinh"
              onClick={() => {
                if (dsDong.length === 0) {
                  toast('Vui lòng chọn ít nhất một mặt hàng')
                  return
                }
                setBuoc(4)
              }}
            >
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {/* ── BƯỚC 4: XÁC NHẬN THÔNG TIN ── */}
      {buoc === 4 && (
        <div className="m-lp-buoc m-lp-buoc-b4">
          <div className="m-lp-dau">
            <button type="button" className="m-lp-btn-back" onClick={handleQuayLai} aria-label="Quay lại">
              <Icon n="chevl" className="ic sm" />
            </button>
            <h2 className="m-lp-tieu-de">Thông tin {tenLoai.toLowerCase()}</h2>
            <div className="m-lp-dau-phu" />
          </div>

          <div className="m-lp-than">
            {/* Tóm tắt đầu phiếu */}
            <div className="m-the-trang m-lp-the-xac-nhan">
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">
                  {laKk ? 'Kho kiểm kê' : laDcn && (dcn === 'xdc' || dcn === 'ck') ? 'Kho xuất' : 'Kho'}:
                </span>
                <span className="m-xp-tri dam">{kho}</span>
              </div>
              {laDcn && dcn === 'xdc' && (
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Cửa hàng nhận:</span>
                  <span className="m-xp-tri dam">{cnNhan}</span>
                </div>
              )}
              {laDcn && (dcn === 'ck' || dcn === 'xdc') && (
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Kho nhận:</span>
                  <span className="m-xp-tri dam">{khoNhan}</span>
                </div>
              )}
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Thời gian:</span>
                <span className="m-xp-tri">{thoiGian}</span>
              </div>
              {ghiChu && (
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Ghi chú:</span>
                  <span className="m-xp-tri">{ghiChu}</span>
                </div>
              )}
            </div>

            {/* Danh sách dòng hàng */}
            <div className="m-lp-khoi-dong">
              <div className="m-xp-tieu-khoi">
                {laKk ? 'DANH SÁCH KIỂM KÊ' : 'DANH SÁCH HÀNG HOÁ'} ({dsDong.length})
              </div>

              {dsDong.map((d, i) => {
                if (laKk) {
                  const tonHt = Number(d.tonHt ?? 0)
                  const tonTt = Number(d.tonTt ?? tonHt)
                  const chenh = tonTt - tonHt
                  return (
                    <div key={i} className="m-the-trang m-xp-the-dong">
                      <div className="m-lp-hang-dau">
                        <span className="m-xp-dong-tieu">
                          {i + 1}. {d.ten} {d.ma ? `· ${d.ma}` : ''}
                        </span>
                        <button type="button" className="m-lp-btn-sua-dong" onClick={() => setBuoc(3)}>
                          Sửa
                        </button>
                      </div>
                      <div className="m-xp-dong-chi-tiet">
                        <div className="m-xp-dong-tt">
                          <span className="m-xp-nhan">Tồn sổ sách:</span>
                          <span className="m-xp-tri">{money(tonHt)} {d.dvt}</span>
                        </div>
                        <div className="m-xp-dong-tt">
                          <span className="m-xp-nhan">Số thực tế:</span>
                          <span className="m-xp-tri dam">{money(tonTt)} {d.dvt}</span>
                        </div>
                        <div className="m-xp-dong-tt">
                          <span className="m-xp-nhan">Chênh lệch:</span>
                          <span className={`m-xp-tri dam ${chenh < 0 ? 'do' : chenh > 0 ? 'xanh' : ''}`}>
                            {chenh > 0 ? `+${money(chenh)}` : money(chenh)} {d.dvt}
                            {chenh < 0 && <span className="m-ct-chip err">Thiếu</span>}
                            {chenh > 0 && <span className="m-ct-chip ok">Thừa</span>}
                            {chenh === 0 && <span className="m-ct-chip dim">Khớp</span>}
                          </span>
                        </div>
                        {d.ghiChu && (
                          <div className="m-xp-dong-tt">
                            <span className="m-xp-nhan">Ghi chú:</span>
                            <span className="m-xp-tri">{d.ghiChu}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={i} className="m-the-trang m-xp-the-dong">
                    <div className="m-lp-hang-dau">
                      <span className="m-xp-dong-tieu">
                        {i + 1}. {d.ten} {d.ma ? `· ${d.ma}` : ''}
                      </span>
                      <button type="button" className="m-lp-btn-sua-dong" onClick={() => setBuoc(3)}>
                        Sửa
                      </button>
                    </div>
                    <div className="m-xp-dong-chi-tiet">
                      <div className="m-xp-dong-tt">
                        <span className="m-xp-nhan">Số lượng:</span>
                        <span className="m-xp-tri dam">{d.sl ?? 1} {d.dvt ?? ''}</span>
                      </div>
                      {dcn !== 'ck' && (
                        <>
                          <div className="m-xp-dong-tt">
                            <span className="m-xp-nhan">Đơn giá:</span>
                            <span className="m-xp-tri">{money(d.gia || 0)} đ</span>
                          </div>
                          <div className="m-xp-dong-tt">
                            <span className="m-xp-nhan">Thành tiền:</span>
                            <span className="m-xp-tri dam cam">{money(d.tien || 0)} đ</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Khối tổng kết */}
            <div className="m-the-trang m-xp-the-tong">
              {laKk ? (
                <>
                  <div className="m-xp-dong-tt">
                    <span className="m-xp-nhan">Tổng mặt hàng kiểm kê:</span>
                    <span className="m-xp-tri dam">{dsDong.length}</span>
                  </div>
                  <div className="m-xp-dong-tt">
                    <span className="m-xp-nhan">Mặt hàng thiếu:</span>
                    <span className="m-xp-tri dam do">
                      {dsDong.filter(d => (Number(d.tonTt ?? d.tonHt) - Number(d.tonHt ?? 0)) < 0).length}
                    </span>
                  </div>
                  <div className="m-xp-dong-tt">
                    <span className="m-xp-nhan">Mặt hàng thừa:</span>
                    <span className="m-xp-tri dam xanh">
                      {dsDong.filter(d => (Number(d.tonTt ?? d.tonHt) - Number(d.tonHt ?? 0)) > 0).length}
                    </span>
                  </div>
                </>
              ) : (
                <div className="m-xp-dong-tt m-xp-dong-tong-cong">
                  <span className="m-xp-nhan dam">Tổng thanh toán:</span>
                  <span className="m-xp-tri dam cam lon">{money(tongTien)} đ</span>
                </div>
              )}
            </div>
          </div>

          <div className="m-lp-day m-lp-day-buoc4">
            <div className="m-lp-day-hang-tong">
              {laKk ? (
                <span className="m-lp-day-nhan">Tổng mặt hàng: <b>{dsDong.length}</b></span>
              ) : (
                <>
                  <span className="m-lp-day-nhan">Tổng:</span>
                  <span className="m-lp-day-tong">{money(tongTien)} đ</span>
                </>
              )}
            </div>
            <div className="m-lp-day-hang-nut">
              {!dangSua && (
                <button
                  type="button"
                  className="m-lp-nut-phu"
                  onClick={() => thucHienLuu(true)}
                >
                  Lưu và thêm
                </button>
              )}
              <button
                type="button"
                className={`m-lp-nut-chinh${dangSua ? ' toan-man' : ''}`}
                onClick={() => thucHienLuu(false)}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BƯỚC 5: TẠO THÀNH CÔNG ── */}
      {buoc === 5 && (
        <div className="m-lp-buoc m-lp-buoc-thanh-cong">
          <div className="m-lp-dau-thanh-cong">
            <button type="button" className="m-lp-btn-home" onClick={() => nav(path)} aria-label="Về trang danh sách">
              <Icon n="home" className="ic sm" />
            </button>
          </div>

          <div className="m-lp-thanh-cong-than">
            <div className="m-lp-thanh-cong-vong">
              <Icon n="check" className="ic lg m-lp-thanh-cong-tich" />
            </div>
            <h2 className="m-lp-thanh-cong-tieu">Tạo chứng từ thành công</h2>
            <p className="m-lp-thanh-cong-mota">
              Bạn vừa tạo thành công phiếu {tenLoai} <b>{soPhieuMoi}</b>. Bấm Xem phiếu để kiểm tra chi tiết hoặc bấm Đóng để quay lại danh sách phiếu.
            </p>

            <div className="m-lp-thanh-cong-nut-hang">
              <button type="button" className="m-lp-btn-dong" onClick={() => nav(path)}>
                Đóng
              </button>
              <button
                type="button"
                className="m-lp-btn-xem"
                onClick={() => nav(`${path}/${idPhieuMoi}`)}
              >
                Xem phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
