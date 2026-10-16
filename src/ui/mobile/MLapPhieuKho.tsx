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
  CONG_THUC_CB, keoNvlCb, SX, soLuong, tienToSx, hangCua,
  type DongSx, type LoaiSx,
} from '../../modules/kho/san-xuat'
import { DCN, khoCuaCn, type LoaiDcn } from '../../modules/kho/dieu-chuyen'
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

  // Kho chính
  const [kho, setKho] = useState(() => {
    if (gocData?._kho || gocData?.kho) return String(gocData._kho ?? gocData.kho)
    return dsKhoCn[0] ?? 'Kho bếp Lê Lợi'
  })

  // Kho nhận
  const [khoNhan, setKhoNhan] = useState(() => {
    if (gocData?._khoNhan) return String(gocData._khoNhan)
    if (laDcn && dcn === 'ck') {
      const khoKhac = dsKhoCn.find(k => k !== (gocData?._kho ?? dsKhoCn[0]))
      return khoKhac ?? ''
    }
    return ''
  })

  // Cửa hàng nhận
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

  // Sheets chọn
  const [moChonKho, setMoChonKho] = useState(false)
  const [moChonKhoNhan, setMoChonKhoNhan] = useState(false)
  const [moChonCnNhan, setMoChonCnNhan] = useState(false)

  // Sheet chọn hàng
  const [moChonHang, setMoChonHang] = useState(false)
  const [nhomHangChon, setNhomHangChon] = useState('Tất cả')
  const [timHang, setTimHang] = useState('')
  const [moChonNhomHang, setMoChonNhomHang] = useState(false)

  // Báo lỗi theo ô
  const [loiO, setLoiO] = useState<Record<string, string>>({})

  // Sau khi lưu
  const [daLuu, setDaLuu] = useState(false)
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

  const xoaDong = (idx: number) => {
    setDsDong(ds => ds.filter((_, i) => i !== idx))
  }

  // Chọn thành phẩm trong sản xuất
  const apDungCongThucSx = (spMa: string, slTp: number) => {
    setTpChonMa(spMa)
    setTpSoLuong(slTp)
    const nvlDong = keoNvlCb(spMa, slTp)
    setDsDong(nvlDong)
    if (loiO.hang) setLoiO(l => { const n = { ...l }; delete n.hang; return n })
  }

  // Danh sách hàng hiển thị trong sheet chọn hàng
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
      if (loiO.hang) setLoiO(l => { const n = { ...l }; delete n.hang; return n })
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
      if (loiO.hang) setLoiO(l => { const n = { ...l }; delete n.hang; return n })
    }
  }

  const cuonDenO = (idO: string) => {
    setTimeout(() => {
      const el = document.getElementById(idO)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  // Thực hiện lưu chứng từ
  const thucHienLuu = (moMoi = false) => {
    const loiMoi: Record<string, string> = {}

    if (!kho.trim()) {
      loiMoi.kho = 'Vui lòng chọn kho'
    }

    if (laDcn) {
      if (dcn === 'ck') {
        if (!khoNhan.trim()) {
          loiMoi.khoNhan = 'Vui lòng chọn kho nhận'
        } else if (khoNhan === kho) {
          loiMoi.khoNhan = 'Kho nhận phải khác kho xuất'
        }
      } else if (dcn === 'xdc') {
        if (!cnNhan.trim()) {
          loiMoi.cnNhan = 'Vui lòng chọn cửa hàng nhận'
        }
        if (!khoNhan.trim()) {
          loiMoi.khoNhan = 'Vui lòng chọn kho nhận'
        } else if (khoNhan === kho) {
          loiMoi.khoNhan = 'Kho nhận phải khác kho xuất'
        }
      }
    }

    if (dsDong.length === 0) {
      loiMoi.hang = 'Vui lòng chọn ít nhất một mặt hàng'
    }

    if (!thoiGian.trim()) {
      loiMoi.thoiGian = 'Vui lòng chọn thời gian'
    }

    if (Object.keys(loiMoi).length > 0) {
      setLoiO(loiMoi)
      const dauTienKey = Object.keys(loiMoi)[0]
      cuonDenO(`m-lp-o-${dauTienKey}`)
      const thongBao = Object.values(loiMoi)[0]
      toast(thongBao)
      return
    }

    setLoiO({})

    const ngayChiTiet = thoiGian.split(' ')[0]
    if (!dangSua && truocDauNam(s, ngayChiTiet)) {
      toast(`Ngày chứng từ phải từ ngày đầu năm ${ngayDauNam(s)} trở đi`)
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

    // Đồng bộ phiếu điều chỉnh cho Kiểm kê
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
    } else {
      setSoPhieuMoi(soCt)
      setIdPhieuMoi(idLuu)
      setDaLuu(true)
    }
  }

  const handleQuayLai = () => {
    if (dangSua) nav(`${path}/${id}`)
    else nav(path)
  }

  // ── MÀN HÌNH THÀNH CÔNG ──
  if (daLuu) {
    return (
      <div className="m-lp">
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
      </div>
    )
  }

  const tenThuong = tenLoai.toLowerCase().startsWith('phiếu ') ? tenLoai.slice(6).toLowerCase() : tenLoai.toLowerCase()
  const tieuDe = dangSua ? `${tenLoai} ${row?.so ?? ''}`.trim() : `Phiếu ${tenThuong} mới`

  return (
    <div className="m-lp m-lp-mot-man">
      {/* ── THANH ĐẦU ── */}
      <div className="m-lp-dau">
        <button type="button" className="m-nut-back" onClick={handleQuayLai} aria-label="Quay lại" title="Quay lại">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="m-lp-tieu-de">{tieuDe}</h2>
        <div className="m-lp-dau-phu" />
      </div>

      <div className="m-lp-than m-lp-than-cuon">
        {/* ════ NHÓM 1: KHO, CỬA HÀNG NHẬN, KHO NHẬN ════ */}
        <div className="m-the-trang m-lp-nhom-dong">
          {/* Kho chính */}
          <div
            className="m-lp-dong-o"
            id="m-lp-o-kho"
            onClick={() => setMoChonKho(true)}
          >
            <div className="m-lp-dong-trai">
              <Icon n="store" className="ic sm m-lp-dong-ic" />
              <div className="m-lp-dong-nd">
                <span className="m-lp-dong-nhan">
                  {laKk
                    ? 'Kho kiểm kê'
                    : laDcn
                    ? (dcn === 'ndc' ? 'Kho nhận' : 'Kho xuất')
                    : laSx
                    ? (SX[sx!].nhap ? 'Kho nhập' : 'Kho xuất')
                    : 'Kho'} <b className="m-lp-sao">*</b>
                </span>
                <span className={`m-lp-dong-tri ${!kho ? 'mo' : ''}`}>{kho || 'Chọn kho'}</span>
              </div>
            </div>
            <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" />
          </div>
          {loiO.kho && <div className="m-lp-loi-o">{loiO.kho}</div>}

          {/* Cửa hàng nhận (xdc) */}
          {laDcn && dcn === 'xdc' && (
            <>
              <div
                className="m-lp-dong-o"
                id="m-lp-o-cnNhan"
                onClick={() => setMoChonCnNhan(true)}
              >
                <div className="m-lp-dong-trai">
                  <Icon n="store" className="ic sm m-lp-dong-ic" />
                  <div className="m-lp-dong-nd">
                    <span className="m-lp-dong-nhan">Cửa hàng nhận <b className="m-lp-sao">*</b></span>
                    <span className={`m-lp-dong-tri ${!cnNhan ? 'mo' : ''}`}>{cnNhan || 'Chọn cửa hàng nhận'}</span>
                  </div>
                </div>
                <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" />
              </div>
              {loiO.cnNhan && <div className="m-lp-loi-o">{loiO.cnNhan}</div>}
            </>
          )}

          {/* Kho nhận (điều chuyển) */}
          {laDcn && (dcn === 'ck' || dcn === 'xdc') && (
            <>
              <div
                className="m-lp-dong-o m-lp-kho-nhan-wrap"
                id="m-lp-o-khoNhan"
                onClick={() => setMoChonKhoNhan(true)}
              >
                <div className="m-lp-dong-trai">
                  <Icon n="store" className="ic sm m-lp-dong-ic" />
                  <div className="m-lp-dong-nd">
                    <span className="m-lp-dong-nhan">Kho nhận <b className="m-lp-sao">*</b></span>
                    <span className={`m-lp-dong-tri ${!khoNhan ? 'mo' : ''}`}>{khoNhan || 'Chọn kho nhận'}</span>
                  </div>
                </div>
                <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" />
              </div>
              {loiO.khoNhan && <div className="m-lp-loi-o">{loiO.khoNhan}</div>}
            </>
          )}
        </div>

        {/* ════ NHÓM 2: DANH SÁCH HÀNG HOÁ / KIỂM KÊ / SẢN XUẤT ════ */}
        {/* Với sản xuất chế biến: Khối chọn thành phẩm */}
        {laSx && sx === 'xcb' && (
          <div className="m-lp-tp-hop">
            <div className="m-lp-hang-man-tieu-hang">
              <span className="m-lp-hang-man-tieu-chu">THÀNH PHẨM CHẾ BIẾN ({dsTpCoCongThuc.length})</span>
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

            <div className="m-lp-tp-sl" style={{ marginTop: 10 }}>
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

        {/* Danh sách hàng hoá */}
        <div className="m-lp-khoi-hang-man" id="m-lp-o-hang">
          <div className="m-lp-hang-man-tieu-hang">
            <span className="m-lp-hang-man-tieu-chu">
              {laKk ? 'CHI TIẾT KIỂM KÊ' : 'DANH SÁCH HÀNG HOÁ'} ({dsDong.length})
            </span>
            {(!laSx || sx !== 'xcb') && (
              <button
                type="button"
                className="m-lp-btn-them-nhanh"
                onClick={() => setMoChonHang(true)}
              >
                <Icon n="plus" className="ic sm" /> Thêm hàng
              </button>
            )}
          </div>

          {dsDong.length === 0 ? (
            <div
              className="m-the-trang m-lp-hang-trong-hop"
              onClick={() => {
                if (!laSx || sx !== 'xcb') setMoChonHang(true)
              }}
            >
              <div style={{ color: 'var(--muted)', marginBottom: 6 }}><Icon n="box" className="ic md" /></div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Chưa có mặt hàng nào</span>
              {(!laSx || sx !== 'xcb') && (
                <span className="m-lp-btn-them-chu">+ Chọn mặt hàng</span>
              )}
            </div>
          ) : (
            <div className="m-lp-ds-hang-the">
              {dsDong.map((d, i) => {
                if (laKk) {
                  const tonHt = Number(d.tonHt ?? 0)
                  const tonTt = Number(d.tonTt ?? tonHt)
                  const chenh = tonTt - tonHt
                  return (
                    <div key={i} className="m-the-trang m-lp-the-hang-item m-lp-the-sua">
                      <div className="m-lp-hang-item-dau">
                        <div className="m-lp-hang-item-ten">
                          <b>{i + 1}. {d.ten}</b>
                          {d.ma && <span className="m-lp-hang-item-ma">· {d.ma}</span>}
                        </div>
                        <button
                          type="button"
                          className="m-lp-hang-item-xoa"
                          onClick={() => xoaDong(i)}
                          aria-label="Xoá hàng"
                        >
                          <Icon n="x" className="ic sm" />
                        </button>
                      </div>

                      <div className="m-lp-hang-item-luoi">
                        {/* Tồn sổ sách */}
                        <div className="m-lp-hang-item-o">
                          <span className="m-lp-hang-item-nhan">Tồn sổ sách:</span>
                          <span className="m-lp-dong-tri">{money(tonHt)} {d.dvt || 'Cái'}</span>
                        </div>

                        {/* Số thực tế */}
                        <div className="m-lp-hang-item-o">
                          <span className="m-lp-hang-item-nhan dam">Số thực tế:</span>
                          <div className="m-lp-sl-stepper" style={{ width: 'auto' }}>
                            <input
                              type="text"
                              className="m-lp-sua-inp num m-lp-sl-inp"
                              style={{ width: 80 }}
                              value={d.tonTt ?? tonHt}
                              onChange={e => {
                                const v = Number(e.target.value.replace(/[^0-9.]/g, '')) || 0
                                doiDong(i, { tonTt: v, sl: v })
                              }}
                            />
                            <span className="m-lp-dvt-gia" style={{ marginLeft: 4 }}>{d.dvt || 'Cái'}</span>
                          </div>
                        </div>

                        {/* Chênh lệch */}
                        <div className="m-lp-hang-item-o">
                          <span className="m-lp-hang-item-nhan dam">Chênh lệch:</span>
                          <div className="m-lp-kk-chenh" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className={`dam ${chenh < 0 ? 'do' : chenh > 0 ? 'xanh' : ''}`}>
                              {chenh > 0 ? `+${money(chenh)}` : money(chenh)} {d.dvt}
                            </span>
                            {chenh < 0 && <span className="m-ct-chip err">Thiếu</span>}
                            {chenh > 0 && <span className="m-ct-chip ok">Thừa</span>}
                            {chenh === 0 && <span className="m-ct-chip dim">Khớp</span>}
                          </div>
                        </div>

                        {/* Ghi chú lý do chênh lệch */}
                        <div className="m-lp-hang-item-o" style={{ width: '100%', marginTop: 4 }}>
                          <input
                            type="text"
                            className="m-lp-sua-inp ghi-chu"
                            style={{ width: '100%' }}
                            placeholder="Lý do chênh lệch nếu có"
                            value={d.ghiChu || ''}
                            onChange={e => doiDong(i, { ghiChu: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )
                }

                const dongSx = d as DongSx
                return (
                  <div key={i} className="m-the-trang m-lp-the-hang-item m-lp-the-sua">
                    <div className="m-lp-hang-item-dau">
                      <div className="m-lp-hang-item-ten">
                        <b>{i + 1}. {d.ten}</b>
                        {d.ma && <span className="m-lp-hang-item-ma">· {d.ma}</span>}
                        {d.dvt && <span className="m-lp-hang-item-dvt">({d.dvt})</span>}
                      </div>
                      <button
                        type="button"
                        className="m-lp-hang-item-xoa"
                        onClick={() => xoaDong(i)}
                        aria-label="Xoá hàng"
                      >
                        <Icon n="x" className="ic sm" />
                      </button>
                    </div>

                    {dongSx.tp && (
                      <div className="m-lp-tp-badge" style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
                        Thành phẩm: {dongSx.tp}
                      </div>
                    )}

                    <div className="m-lp-hang-item-luoi">
                      {/* Số lượng */}
                      <div className="m-lp-hang-item-o">
                        <span className="m-lp-hang-item-nhan">
                          Số lượng:
                          {dongSx.slKh !== undefined && (
                            <small style={{ color: 'var(--muted)', marginLeft: 4 }}>
                              (KH: {soLuong(dongSx.slKh)})
                            </small>
                          )}
                        </span>
                        <div className="m-lp-sl-stepper">
                          <button
                            type="button"
                            className="m-lp-step-btn"
                            onClick={() => doiDong(i, { sl: Math.max(1, (d.sl || 1) - 1) })}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            className="m-lp-sua-inp num m-lp-sl-inp"
                            value={d.sl ?? 1}
                            onChange={e => {
                              const v = Number(e.target.value.replace(/[^0-9.]/g, '')) || 0
                              doiDong(i, { sl: v })
                            }}
                          />
                          <button
                            type="button"
                            className="m-lp-step-btn"
                            onClick={() => doiDong(i, { sl: (d.sl || 1) + 1 })}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Đơn giá */}
                      {dcn !== 'ck' && (
                        <div className="m-lp-hang-item-o">
                          <span className="m-lp-hang-item-nhan">Đơn giá:</span>
                          <div className="m-lp-gia-wrap">
                            <input
                              type="text"
                              className="m-lp-sua-inp num m-lp-gia-inp"
                              value={money(d.gia || 0)}
                              onChange={e => {
                                const v = Number(e.target.value.replace(/\D/g, '')) || 0
                                doiDong(i, { gia: v })
                              }}
                            />
                            <span className="m-lp-dvt-gia">đ</span>
                          </div>
                        </div>
                      )}

                      {/* Thành tiền */}
                      {dcn !== 'ck' && (
                        <div className="m-lp-hang-item-o">
                          <span className="m-lp-hang-item-nhan dam">Thành tiền:</span>
                          <span className="m-lp-hang-item-tien dam cam">{money(d.tien || 0)} đ</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {loiO.hang && <div className="m-lp-loi-o">{loiO.hang}</div>}
        </div>

        {/* ════ NHÓM 3: NGÀY, GHI CHÚ ════ */}
        <div className="m-the-trang m-lp-nhom-dong">
          {/* Ngày */}
          <div
            className="m-lp-dong-o m-lp-the-truong"
            id="m-lp-o-thoiGian"
            onClick={() => setMoLich(true)}
          >
            <div className="m-lp-dong-trai">
              <Icon n="clock" className="ic sm m-lp-dong-ic" />
              <div className="m-lp-dong-nd">
                <span className="m-lp-dong-nhan">Thời gian <b className="m-lp-sao">*</b></span>
                <span className="m-lp-dong-tri m-lp-tri-xanh">{thoiGian}</span>
                <input
                  type="text"
                  className="m-lp-inp-tri"
                  value={thoiGian}
                  readOnly
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            <Icon n="chevr" className="ic sm m-lp-dong-mui-ten" />
          </div>

          {/* Ghi chú / Diễn giải */}
          <div className="m-lp-dong-o m-lp-dong-nhap">
            <div className="m-lp-dong-trai" style={{ width: '100%' }}>
              <Icon n="file" className="ic sm m-lp-dong-ic" />
              <input
                type="text"
                className="m-lp-dong-inp"
                placeholder={laDc ? 'Lý do điều chỉnh' : 'Ghi chú'}
                value={ghiChu}
                onChange={e => setGhiChu(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── THANH CỐ ĐỊNH Ở ĐÁY: TỔNG TIỀN / MẶT HÀNG & NÚT LƯU LẠI ── */}
      <div className="m-lp-day m-lp-day-mot-man">
        <div className="m-lp-day-hang-tong">
          {laKk ? (
            <>
              <span className="m-lp-day-nhan">Mặt hàng:</span>
              <span className="m-lp-day-tong dam">{dsDong.length}</span>
            </>
          ) : (
            <>
              <span className="m-lp-day-nhan">Tổng tiền:</span>
              <span className="m-lp-day-tong dam cam">{money(tongTien)} đ</span>
            </>
          )}
        </div>
        <button
          type="button"
          className="m-lp-nut-chinh m-lp-nut-luu"
          onClick={() => thucHienLuu(false)}
        >
          Lưu lại
        </button>
      </div>

      {/* ── SHEET CHỌN KHO ── */}
      <MChon
        mo={moChonKho}
        onDong={() => setMoChonKho(false)}
        tieuDe={laKk ? 'Chọn kho kiểm kê' : 'Chọn kho'}
        ds={dsKhoCn.map(k => ({ k, ten: k }))}
        chon={kho}
        onChon={v => {
          setKho(v)
          if (loiO.kho) setLoiO(l => { const n = { ...l }; delete n.kho; return n })
          if (laDcn && dcn === 'ck' && v === khoNhan) setKhoNhan('')
        }}
        apDung
        tim
      />

      {/* ── SHEET CHỌN CỬA HÀNG NHẬN (XDC) ── */}
      {laDcn && dcn === 'xdc' && (
        <MChon
          mo={moChonCnNhan}
          onDong={() => setMoChonCnNhan(false)}
          tieuDe="Chọn cửa hàng nhận"
          ds={dsCnNhan.map(c => ({ k: c.ten, ten: c.ten }))}
          chon={cnNhan}
          onChon={v => {
            setCnNhan(v)
            if (loiO.cnNhan) setLoiO(l => { const n = { ...l }; delete n.cnNhan; return n })
            const k = khoCuaCn(v)
            setKhoNhan(k.length === 1 ? k[0] : '')
          }}
          apDung
          tim
        />
      )}

      {/* ── SHEET CHỌN KHO NHẬN ── */}
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
            if (loiO.khoNhan) setLoiO(l => { const n = { ...l }; delete n.khoNhan; return n })
          }}
          apDung
          tim
        />
      )}

      {/* ── SHEET TẤM CHỌN HÀNG HOÁ ── */}
      {moChonHang && (
        <div className="m-tam-overlay" onClick={() => setMoChonHang(false)}>
          <div className="m-tam-hop m-tam-hop-apdung m-lp-sheet-hang" onClick={e => e.stopPropagation()}>
            <div className="m-tam-dau m-tam-dau-apdung">
              <h2 className="m-tam-tieu">Chọn hàng hoá</h2>
              <button
                type="button"
                className="m-tam-dong-btn"
                onClick={() => setMoChonHang(false)}
                aria-label="Đóng"
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>

            <div className="m-lp-loc-hang">
              <button
                type="button"
                className="m-lp-btn-nhom"
                onClick={() => setMoChonNhomHang(true)}
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

            <div className="m-lp-than m-lp-ds-hang" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
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

            <div className="m-tam-day">
              <div className="m-lp-day-trai">
                <span className="m-lp-day-dem">Đã chọn: <b>{dsDong.length}</b></span>
              </div>
              <button
                type="button"
                className="m-tam-btn-apdung"
                onClick={() => setMoChonHang(false)}
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHEET CHỌN NHÓM HÀNG ── */}
      <MChon
        mo={moChonNhomHang}
        onDong={() => setMoChonNhomHang(false)}
        tieuDe="Chọn nhóm hàng"
        ds={dsNhomHang.map(nh => ({ k: nh, ten: nh }))}
        chon={nhomHangChon}
        onChon={setNhomHangChon}
        apDung
        tim
      />

      {/* ── LỊCH ĐƠN ── */}
      {moLich && (
        <LichDon
          value={thoiGian.slice(0, 10)}
          onChange={v => setThoiGian(v + thoiGian.slice(10))}
          onDong={() => setMoLich(false)}
        />
      )}
    </div>
  )
}
