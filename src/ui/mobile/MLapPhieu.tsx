import { useMemo, useState, type FC } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { dongCua, tkTheoLyDo, type Dong } from '../generic/gen'
import { duongDan, tenMan } from '../../app/registry'
import { cuaHangHienTai, ngayDauNam, truocDauNam, useSession } from '../../app/session'
import { kieuGhiSo } from '../../app/plan'
import { CUA_HANG, HANG, KHACH, KHO, LY_DO, NCC, NHAN_VIEN, NVL } from '../../data/mock'
import { boO, nhomCua, theoLoai } from '../generic/nhom'
import { DS_DOI_TUONG } from '../generic/BangSua'
import { ghiNhatKy, soKeTiep, suaPhieu, themPhieu } from '../generic/daXoa'
import { QUY_TIEN } from '../generic/ChungTuForm'
import { useDongChungTu } from '../generic/VoucherScreen'
import { fold, money } from '../format'
import { Icon } from '../Icon'
import { LichDon } from '../ChonNgay'
import { MChon } from './MChon'
import { MTrong } from './MTrong'
import { MLapPhieuKho } from './MLapPhieuKho'
import { TAI_KHOAN } from '../../modules/danh-muc/data'
import { KhoiHachToan, tinhButToan } from './butToan'

const DS_TK_CHI_TIET = TAI_KHOAN.filter(
  t => !TAI_KHOAN.some(other => other.so !== t.so && other.so.startsWith(t.so))
)

export interface MLapPhieuProps extends ScreenProps {
  id?: string
}

export const MLapPhieu: FC<MLapPhieuProps> = ({ sc, mod, id }) => {
  const cfgMan = sc.voucher
  const laPhieuKho = Boolean(
    cfgMan?.kiemKe ||
    cfgMan?.dieuChinh ||
    cfgMan?.sanXuat ||
    cfgMan?.dieuChuyen
  )

  if (laPhieuKho) {
    return <MLapPhieuKho key={id ?? 'moi'} sc={sc} mod={mod} id={id} />
  }

  const nav = useNavigate()
  const path = duongDan(mod, sc)
  const dangSua = Boolean(id && id !== 'moi')
  const { rows } = useDongChungTu(sc, mod)
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

  return <ThanLapPhieu key={id ?? 'moi'} sc={sc} mod={mod} id={id} row={row} />
}

interface ThanLapPhieuProps extends ScreenProps {
  id?: string
  row?: Row
}

const ThanLapPhieu: FC<ThanLapPhieuProps> = ({ sc, mod, id, row }) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const loc = useLocation()
  const [sp] = useSearchParams()
  const path = duongDan(mod, sc)

  const cfgMan = sc.voucher ?? { prefix: 'CT', doiTuong: 'none', dienGiai: [tenMan(sc)], tien: [0, 0] }
  const saoChep = (loc.state as { saoChep?: Row } | null)?.saoChep
  const gocData = row ?? saoChep
  const dangSua = Boolean(row)

  const loaiKey = gocData?.loai ?? sp.get('loai') ?? cfgMan.loai?.[0]?.k
  const loai = cfgMan.loai?.find(x => x.k === loaiKey) ?? cfgMan.loai?.[0]
  const cfg = theoLoai(cfgMan, loai?.k)
  const nhom = nhomCua(mod.key, cfg, loai?.k)
  const bo = boO(nhom, cfg)
  const laTien = mod.key === 'tien' || cfg.dong === 'tien'
  const cnChon = cuaHangHienTai(s)
  const cuaHang = gocData?.cn ? String(gocData.cn) : cnChon?.ten ?? 'Phố Mây Lê Lợi'
  const tenLoai = loai?.ten ?? (gocData?.tenLoai ? String(gocData.tenLoai) : tenMan(sc))

  // Nguồn hàng
  const danhMucHang = useMemo(() => {
    return cfg.dong === 'nvl' ? NVL : HANG
  }, [cfg.dong])

  const dsNhomHang = useMemo(() => {
    const set = new Set<string>()
    danhMucHang.forEach(h => {
      if (h.nhom) set.add(h.nhom)
    })
    return ['Tất cả', ...Array.from(set)]
  }, [danhMucHang])

  // Đối tượng
  const nhanDoiTuong = laTien
    ? 'Đối tượng'
    : cfg.nhan ?? (cfg.doiTuong === 'ncc' ? 'Nhà cung cấp' : cfg.doiTuong === 'kh' ? 'Khách hàng' : 'Đối tượng')

  const dsDoiTuong = useMemo(() => {
    if (laTien) return DS_DOI_TUONG
    if (cfg.doiTuong === 'ncc') return NCC.map(x => x.ten)
    if (cfg.doiTuong === 'kh') return KHACH.map(x => x.ten)
    if (cfg.doiTuong === 'nv') return NHAN_VIEN.map(x => x.ten)
    return DS_DOI_TUONG
  }, [laTien, cfg.doiTuong])

  // Kho
  const dsKho = useMemo(() => {
    const khoCn = CUA_HANG.find(c => c.ten === cuaHang)?.kho
    return khoCn && khoCn.length ? khoCn : KHO
  }, [cuaHang])

  // Nhãn kho
  const nhanKho = (nhom === 'mua' || nhom === 'nhap' || cfg.prefix === 'TL' || loai?.k === 'ndc')
    ? 'Kho nhập'
    : (nhom === 'ban' || nhom === 'xuat' || cfg.prefix === 'TLN' || loai?.k === 'xdc')
    ? 'Kho xuất'
    : 'Kho'

  // Quỹ
  const quyTm = `Quỹ tiền mặt ${CUA_HANG.find(c => c.ten === cuaHang)?.ngan ?? CUA_HANG[0].ngan}`
  const dsQuy = useMemo(() => {
    if (nhom === 'thu' || nhom === 'chi') return [quyTm]
    if (nhom === 'nhthu' || nhom === 'nhchi') return QUY_TIEN.slice(CUA_HANG.length)
    return QUY_TIEN
  }, [nhom, quyTm])

  // Lý do thu chi
  const dsLyDo = useMemo(() => {
    const dungMuc = nhom === 'thu' || nhom === 'nhthu' ? 'Thu tiền' : 'Chi tiền'
    return LY_DO.filter(x => x.dung === dungMuc).map(x => x.ten)
  }, [nhom])

  // State các bước: 1: Đầu phiếu, 2: Chọn hàng, 3: Sửa hàng / Thu chi, 4: Xác nhận, 5: Thành công
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

  // Kho
  const [kho, setKho] = useState(() => {
    if (gocData?._kho || gocData?.kho) return String(gocData._kho ?? gocData.kho)
    return dsKho[0] ?? 'Kho tổng'
  })

  // Đối tượng
  const [doiTuong, setDoiTuong] = useState(() => {
    if (gocData?.doiTuong) return String(gocData.doiTuong)
    return dsDoiTuong[0] ?? ''
  })

  // Quỹ
  const [quy, setQuy] = useState(() => {
    if (gocData?._quy) return String(gocData._quy)
    return dsQuy[0] ?? quyTm
  })

  // Ghi chú
  const [ghiChu, setGhiChu] = useState(() => {
    return String(gocData?._ghiChu ?? gocData?.dienGiai ?? cfg.dienGiai?.[0] ?? '')
  })

  // Hoá đơn
  const [soHd, setSoHd] = useState(() => String(gocData?._soHd ?? ''))
  const [kyHieuHd, setKyHieuHd] = useState(() => String(gocData?._kyHieuHd ?? ''))

  // Danh sách dòng
  const [dsDong, setDsDong] = useState<Dong[]>(() => {
    // Phiếu mẫu chưa có _dong thì sinh dòng cùng hạt giống như MXemPhieu, bản máy tính
    if (gocData) {
      const rows = (gocData._dong as Dong[] | undefined) ?? dongCua(cfg, `${sc.code ?? sc.slug}-${gocData.id}`)
      if (laTien) {
        return rows.map(d => {
          if (d.tkNo && d.tkCo) return d
          const lyMacDinh = d.ly || dsLyDo[0] || (nhom === 'chi' ? 'Chi tiền' : 'Thu tiền')
          const tk = tkTheoLyDo(loai?.k ?? nhom, lyMacDinh)
          return { ...d, tkNo: d.tkNo || tk.tkNo, tkCo: d.tkCo || tk.tkCo }
        })
      }
      return rows
    }
    if (laTien) {
      const lyMacDinh = dsLyDo[0] ?? (nhom === 'chi' ? 'Chi tiền' : 'Thu tiền')
      const tk = tkTheoLyDo(loai?.k ?? nhom, lyMacDinh)
      return [{
        ma: '',
        ten: cfg.dienGiai?.[0] ?? (nhom === 'chi' ? 'Chi tiền mặt' : 'Thu tiền mặt'),
        dvt: '',
        sl: 1,
        gia: 500000,
        tien: 500000,
        ts: 0,
        thue: 0,
        ptCk: 0,
        ck: 0,
        ly: lyMacDinh,
        dt: dsDoiTuong[0] ?? '',
        ghiChu: '',
        tkNo: tk.tkNo,
        tkCo: tk.tkCo,
      }]
    }
    return []
  })

  // Tìm kiếm và lọc nhóm hàng ở Bước 2
  const [nhomHangChon, setNhomHangChon] = useState('Tất cả')
  const [timHang, setTimHang] = useState('')
  const [moChonNhom, setMoChonNhom] = useState(false)

  // Sheet chọn ở Bước 1
  const [moChonKho, setMoChonKho] = useState(false)
  const [moChonDt, setMoChonDt] = useState(false)
  const [moChonQuy, setMoChonQuy] = useState(false)

  // Sheet chọn lý do ở Bước 3
  const [dongDangChonLyDo, setDongDangChonLyDo] = useState<number | null>(null)
  // Sheet chọn tài khoản Nợ / Có ở Bước 3
  const [chonTk, setChonTk] = useState<{ dong: number; kieu: 'no' | 'co' } | null>(null)

  // Sau khi lưu ở Bước 5
  const [soPhieuMoi, setSoPhieuMoi] = useState('')
  const [idPhieuMoi, setIdPhieuMoi] = useState('')

  // Tính tổng
  const tongTien = useMemo(() => dsDong.reduce((a, d) => a + (Number(d.tien) || 0), 0), [dsDong])
  const tongCk = useMemo(() => dsDong.reduce((a, d) => a + (Number(d.ck) || 0), 0), [dsDong])
  const tongThue = useMemo(() => dsDong.reduce((a, d) => a + (Number(d.thue) || 0), 0), [dsDong])
  const tongThanhToan = useMemo(() => tongTien - tongCk + tongThue, [tongTien, tongCk, tongThue])

  // Bút toán hạch toán Bước 4
  const dsButToan = useMemo(() => {
    return tinhButToan(
      cfg,
      dsDong,
      tongTien,
      tongCk,
      tongThue,
      doiTuong,
      cuaHang,
      s.cheDo,
      nhom,
      row?._httt ?? 'congno',
    )
  }, [cfg, dsDong, tongTien, tongCk, tongThue, doiTuong, cuaHang, s.cheDo, nhom, row?._httt])

  // Cập nhật dòng
  const doiDong = (idx: number, patch: Partial<Dong>) => {
    setDsDong(ds => ds.map((d, i) => {
      if (i !== idx) return d
      const hopNhat = { ...d, ...patch }
      const sl = hopNhat.sl !== undefined ? Number(hopNhat.sl) : 0
      const gia = hopNhat.gia !== undefined ? Number(hopNhat.gia) : 0
      const tien = patch.tien !== undefined ? Number(patch.tien) : Math.round(sl * gia)
      const ptCk = hopNhat.ptCk !== undefined ? Number(hopNhat.ptCk) : 0
      const ck = patch.ck !== undefined ? Number(patch.ck) : Math.round(tien * ptCk / 100)
      const ts = hopNhat.ts !== undefined ? Number(hopNhat.ts) : 0
      const thue = patch.thue !== undefined ? Number(patch.thue) : Math.round((tien - ck) * ts / 100)
      return { ...hopNhat, sl, gia, tien, ptCk, ck, ts, thue }
    }))
  }

  // Bước 1: Tiếp tục
  const quaBuoc1 = () => {
    if (bo.kho && !kho.trim()) {
      toast('Vui lòng chọn kho')
      return
    }
    if (laTien && !quy.trim()) {
      toast('Vui lòng chọn quỹ')
      return
    }
    if (cfg.doiTuong !== 'none' && !doiTuong.trim()) {
      toast(`Vui lòng chọn ${nhanDoiTuong.toLowerCase()}`)
      return
    }
    if (!thoiGian.trim()) {
      toast('Vui lòng nhập thời gian')
      return
    }
    if (laTien) {
      setBuoc(3)
    } else {
      setBuoc(2)
    }
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
      const ts = cfg.thue === 0 ? 0 : (h.ts ?? 0)
      const thue = Math.round(tien * ts / 100)
      setDsDong(ds => [
        ...ds,
        {
          ma: h.ma,
          ten: h.ten,
          dvt: h.dvt,
          sl,
          gia,
          tien,
          ptCk: 0,
          ck: 0,
          ts,
          thue,
          kho,
          ghiChu: '',
        },
      ])
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
          const ts = cfg.thue === 0 ? 0 : (h.ts ?? 0)
          const thue = Math.round(tien * ts / 100)
          dongMoi.push({
            ma: h.ma,
            ten: h.ten,
            dvt: h.dvt,
            sl,
            gia,
            tien,
            ptCk: 0,
            ck: 0,
            ts,
            thue,
            kho,
            ghiChu: '',
          })
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

  const themDongTien = () => {
    const lyMacDinh = dsLyDo[0] ?? (nhom === 'chi' ? 'Chi tiền' : 'Thu tiền')
    const tk = tkTheoLyDo(loai?.k ?? nhom, lyMacDinh)
    setDsDong(ds => [
      ...ds,
      {
        ma: '',
        ten: cfg.dienGiai?.[0] ?? (nhom === 'chi' ? 'Chi tiền mặt' : 'Thu tiền mặt'),
        dvt: '',
        sl: 1,
        gia: 300000,
        tien: 300000,
        ts: 0,
        thue: 0,
        ptCk: 0,
        ck: 0,
        ly: lyMacDinh,
        dt: doiTuong,
        ghiChu: '',
        tkNo: tk.tkNo,
        tkCo: tk.tkCo,
      },
    ])
  }

  // Lưu chứng từ ở Bước 4 (T178 vòng sửa 1)
  const thucHienLuu = (moMoi = false) => {
    const ngayChiTiet = thoiGian.split(' ')[0]
    if (!dangSua && truocDauNam(s, ngayChiTiet)) {
      toast(`Ngày chứng từ phải từ ngày đầu năm ${ngayDauNam(s)} trở đi`)
      return
    }

    const kieu = kieuGhiSo(s.goi)
    const ttLuu = kieu === 'khong' ? 'ghi' : 'nhap'

    const man = `${mod.key}/${sc.slug}`
    const idLuu = dangSua ? String(row!.id) : `moi-${Date.now()}`
    const soCt = dangSua ? String(row!.so) : soKeTiep(man, `${cfg.prefix}2610-`)

    const noiDung = {
      ngay: ngayChiTiet,
      gio: thoiGian.split(' ')[1] || '10:00',
      thang: Number(ngayChiTiet.split('/')[1]) || 10,
      doiTuong,
      dienGiai: ghiChu || cfg.dienGiai?.[0] || 'Chứng từ',
      tien: tongTien - tongCk,
      thue: tongThue,
      tong: tongThanhToan,
      _dong: dsDong,
      _lyDo: laTien ? (dsDong[0]?.ly || 'Chi tiền') : undefined,
      _ghiChu: ghiChu,
      _quy: quy,
      _kho: kho,
      _soHd: soHd,
      _kyHieuHd: kyHieuHd,
      // Sửa phiếu giữ trạng thái ghi sổ, hình thức thanh toán cũ như bản máy tính
      _httt: row?._httt ?? 'congno',
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
      loai: loai?.k,
      tenLoai: loai?.ten ?? tenMan(sc),
      tt: ttLuu,
      ...noiDung,
    }, s.ten)
    ghiNhatKy(man, idLuu, soCt, s.ten, 'Thêm mới chứng từ')
    toast(`Đã lưu ${soCt}`)

    if (moMoi) {
      // Mở lại bước 1 cho chứng từ mới cùng loại
      setGhiChu('')
      setSoHd('')
      setKyHieuHd('')
      setNhomHangChon('Tất cả')
      setTimHang('')
      if (laTien) {
        const lyMacDinh = dsLyDo[0] ?? (nhom === 'chi' ? 'Chi tiền' : 'Thu tiền')
        const tk = tkTheoLyDo(loai?.k ?? nhom, lyMacDinh)
        setDsDong([{
          ma: '',
          ten: cfg.dienGiai?.[0] ?? (nhom === 'chi' ? 'Chi tiền mặt' : 'Thu tiền mặt'),
          dvt: '',
          sl: 1,
          gia: 500000,
          tien: 500000,
          ts: 0,
          thue: 0,
          ptCk: 0,
          ck: 0,
          ly: lyMacDinh,
          dt: dsDoiTuong[0] ?? '',
          ghiChu: '',
          tkNo: tk.tkNo,
          tkCo: tk.tkCo,
        }])
      } else {
        setDsDong([])
      }
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
      if (dangSua) {
        nav(`${path}/${id}`)
      } else {
        nav(path)
      }
    } else if (buoc === 2) {
      setBuoc(1)
    } else if (buoc === 3) {
      if (laTien) setBuoc(1)
      else setBuoc(2)
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
            {/* Thẻ Kho */}
            {bo.kho && (
              <div className="m-the-trang m-lp-the-truong" onClick={() => setMoChonKho(true)}>
                <div className="m-lp-truong-trai">
                  <Icon n="store" className="ic sm m-lp-truong-ic" />
                  <div className="m-lp-truong-nd">
                    <span className="m-lp-truong-nhan">
                      {nhanKho} <b className="m-lp-sao">*</b>
                    </span>
                    <span className="m-lp-truong-tri">{kho || 'Chọn kho'}</span>
                  </div>
                </div>
                {kho && (
                  <button
                    type="button"
                    className="m-lp-truong-x"
                    onClick={e => {
                      e.stopPropagation()
                      setKho('')
                    }}
                    aria-label="Xoá kho"
                  >
                    <Icon n="x" className="ic sm" />
                  </button>
                )}
              </div>
            )}

            {/* Thẻ Quỹ (phiếu thu chi) */}
            {laTien && (
              <div className="m-the-trang m-lp-the-truong" onClick={() => setMoChonQuy(true)}>
                <div className="m-lp-truong-trai">
                  <Icon n="wallet" className="ic sm m-lp-truong-ic" />
                  <div className="m-lp-truong-nd">
                    <span className="m-lp-truong-nhan">
                      Quỹ / Tài khoản <b className="m-lp-sao">*</b>
                    </span>
                    <span className="m-lp-truong-tri">{quy || 'Chọn quỹ'}</span>
                  </div>
                </div>
                {quy && (
                  <button
                    type="button"
                    className="m-lp-truong-x"
                    onClick={e => {
                      e.stopPropagation()
                      setQuy('')
                    }}
                    aria-label="Xoá quỹ"
                  >
                    <Icon n="x" className="ic sm" />
                  </button>
                )}
              </div>
            )}

            {/* Thẻ Đối tượng */}
            {cfg.doiTuong !== 'none' && (
              <div className="m-the-trang m-lp-the-truong" onClick={() => setMoChonDt(true)}>
                <div className="m-lp-truong-trai">
                  <Icon n="user" className="ic sm m-lp-truong-ic" />
                  <div className="m-lp-truong-nd">
                    <span className="m-lp-truong-nhan">
                      {nhanDoiTuong} <b className="m-lp-sao">*</b>
                    </span>
                    <span className="m-lp-truong-tri">{doiTuong || `Chọn ${nhanDoiTuong.toLowerCase()}`}</span>
                  </div>
                </div>
                {doiTuong && (
                  <button
                    type="button"
                    className="m-lp-truong-x"
                    onClick={e => {
                      e.stopPropagation()
                      setDoiTuong('')
                    }}
                    aria-label="Xoá đối tượng"
                  >
                    <Icon n="x" className="ic sm" />
                  </button>
                )}
              </div>
            )}

            {/* Thẻ Thời gian */}
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
                  {/* Chạm ô thời gian mở tấm lịch, giữ nguyên giờ đã có (T199) */}
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

            {/* Thẻ Diễn giải */}
            <div className="m-the-trang m-lp-the-truong">
              <div className="m-lp-truong-trai">
                <Icon n="file" className="ic sm m-lp-truong-ic" />
                <div className="m-lp-truong-nd">
                  <span className="m-lp-truong-nhan">Ghi chú / Diễn giải</span>
                  <input
                    type="text"
                    className="m-lp-inp-tri"
                    value={ghiChu}
                    onChange={e => setGhiChu(e.target.value)}
                    placeholder="Nhập ghi chú nếu có"
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
            tieuDe="Chọn kho"
            ds={dsKho.map(k => ({ k, ten: k }))}
            chon={kho}
            onChon={setKho}
            apDung
            tim
          />

          {/* Sheet chọn đối tượng */}
          <MChon
            mo={moChonDt}
            onDong={() => setMoChonDt(false)}
            tieuDe={`Chọn ${nhanDoiTuong.toLowerCase()}`}
            ds={dsDoiTuong.map(d => ({ k: d, ten: d }))}
            chon={doiTuong}
            onChon={setDoiTuong}
            apDung
            tim
          />

          {/* Sheet chọn quỹ */}
          <MChon
            mo={moChonQuy}
            onDong={() => setMoChonQuy(false)}
            tieuDe="Chọn quỹ / tài khoản"
            ds={dsQuy.map(q => ({ k: q, ten: q }))}
            chon={quy}
            onChon={setQuy}
            apDung
            tim
          />
        </div>
      )}

      {/* ── BƯỚC 2: CHỌN HÀNG HOÁ ── */}
      {buoc === 2 && !laTien && (
        <div className="m-lp-buoc">
          <div className="m-lp-dau">
            <button type="button" className="m-lp-btn-back" onClick={handleQuayLai} aria-label="Quay lại">
              <Icon n="chevl" className="ic sm" />
            </button>
            <h2 className="m-lp-tieu-de">Chọn hàng hoá</h2>
            <div className="m-lp-dau-phu" />
          </div>

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
                      Mã: {h.ma} · {h.dvt} · {money(h.gia)} đ
                    </div>
                  </div>
                  <div className={`m-lp-cb-hang ${daChon ? 'on' : ''}`}>
                    {daChon && <Icon n="check" className="ic sm" />}
                  </div>
                </div>
              )
            })}
          </div>

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

          {/* Sheet chọn nhóm hàng */}
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

      {/* ── BƯỚC 3: SỬA HÀNG ĐÃ CHỌN HOẶC DÒNG THU CHI ── */}
      {buoc === 3 && (
        <div className="m-lp-buoc">
          <div className="m-lp-dau">
            <button type="button" className="m-lp-btn-back" onClick={handleQuayLai} aria-label="Quay lại">
              <Icon n="chevl" className="ic sm" />
            </button>
            <h2 className="m-lp-tieu-de">{laTien ? 'Chi tiết thu chi' : 'Danh sách đã chọn'}</h2>
            <div className="m-lp-dau-phai-nut">
              {laTien ? (
                <button type="button" className="m-lp-btn-icon-dau" onClick={themDongTien} title="Thêm dòng">
                  <Icon n="plus" className="ic sm" />
                </button>
              ) : (
                <button type="button" className="m-lp-btn-icon-dau" onClick={() => setBuoc(2)} title="Thêm hàng">
                  <Icon n="plus" className="ic sm" />
                </button>
              )}
            </div>
          </div>

          <div className="m-lp-than m-lp-ds-sua">
            {laTien ? (
              // Dòng thu chi
              <>
                {dsDong.map((d, i) => (
                  <div key={i} className="m-the-trang m-lp-the-sua">
                    <div className="m-lp-sua-dau">
                      <div className="m-lp-sua-tieu">
                        {i + 1}. {d.ly || 'Khoản thu chi'}
                      </div>
                      <button
                        type="button"
                        className="m-lp-sua-x"
                        onClick={() => xoaDong(i)}
                        title="Xoá dòng"
                      >
                        <Icon n="x" className="ic sm" />
                      </button>
                    </div>

                    <div className="m-lp-sua-luoi">
                      <div className="m-lp-sua-o" onClick={() => setDongDangChonLyDo(i)}>
                        <span className="m-lp-sua-nhan">Lý do:</span>
                        <span className="m-lp-sua-tri-chon">{d.ly || 'Chọn lý do'} <Icon n="chevd" className="ic sm" /></span>
                      </div>
                      <div className="m-lp-sua-o m-lp-hang-tk" onClick={() => setChonTk({ dong: i, kieu: 'no' })}>
                        <span className="m-lp-sua-nhan">Tài khoản:</span>
                        <div className="m-lp-sua-tri-chon m-lp-tk-tri">
                          <span className="m-lp-tk-chu">
                            <span
                              className="m-lp-tk-nut"
                              onClick={e => {
                                e.stopPropagation()
                                setChonTk({ dong: i, kieu: 'no' })
                              }}
                            >
                              Nợ {d.tkNo || '...'}
                            </span>
                            {' · '}
                            <span
                              className="m-lp-tk-nut"
                              onClick={e => {
                                e.stopPropagation()
                                setChonTk({ dong: i, kieu: 'co' })
                              }}
                            >
                              Có {d.tkCo || '...'}
                            </span>
                          </span>
                          <Icon n="chevd" className="ic sm" />
                        </div>
                      </div>
                      <div className="m-lp-sua-o">
                        <span className="m-lp-sua-nhan">Số tiền:</span>
                        <input
                          type="text"
                          className="m-lp-sua-inp num"
                          value={money(d.tien || 0)}
                          onChange={e => doiDong(i, { tien: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                        />
                      </div>
                      <div className="m-lp-sua-o">
                        <span className="m-lp-sua-nhan">Diễn giải:</span>
                        <input
                          type="text"
                          className="m-lp-sua-inp"
                          value={d.ten || ''}
                          onChange={e => doiDong(i, { ten: e.target.value })}
                          placeholder="Nội dung khoản thu chi"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="m-lp-btn-them-dong" onClick={themDongTien}>
                  <Icon n="plus" className="ic sm" /> Thêm dòng
                </button>
              </>
            ) : (
              // Dòng hàng hoá
              dsDong.map((d, i) => (
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

                  <div className="m-lp-sua-luoi">
                    <div className="m-lp-sua-hang">
                      <span className="m-lp-sua-nhan">Số lượng:</span>
                      <div className="m-lp-sua-sl-wrap">
                        <input
                          type="text"
                          className="m-lp-sua-inp num"
                          value={d.sl ?? 1}
                          onChange={e => doiDong(i, { sl: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                        />
                        <span className="m-lp-sua-dvt">{d.dvt || 'Cái'}</span>
                      </div>
                    </div>

                    <div className="m-lp-sua-hang">
                      <span className="m-lp-sua-nhan">Đơn giá:</span>
                      <div className="m-lp-sua-gia-wrap">
                        <input
                          type="text"
                          className="m-lp-sua-inp num"
                          value={money(d.gia || 0)}
                          onChange={e => doiDong(i, { gia: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                        />
                        <span className="m-lp-sua-dvt">đ</span>
                      </div>
                    </div>

                    {Boolean(bo.ck) && (
                      <div className="m-lp-sua-hang">
                        <span className="m-lp-sua-nhan">Giảm giá:</span>
                        <div className="m-lp-sua-gia-wrap">
                          <input
                            type="text"
                            className="m-lp-sua-inp num"
                            value={money(d.ck || 0)}
                            onChange={e => doiDong(i, { ck: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                          />
                          <span className="m-lp-sua-dvt">đ</span>
                        </div>
                      </div>
                    )}

                    <div className="m-lp-sua-hang">
                      <span className="m-lp-sua-nhan">VAT:</span>
                      <div className="m-lp-sua-sl-wrap">
                        <input
                          type="text"
                          className="m-lp-sua-inp num"
                          value={d.ts ?? 0}
                          onChange={e => doiDong(i, { ts: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                        />
                        <span className="m-lp-sua-dvt">%</span>
                      </div>
                    </div>

                    <div className="m-lp-sua-hang">
                      <span className="m-lp-sua-nhan dam">Thành tiền:</span>
                      <span className="m-lp-sua-thanh-tien dam cam">{money(d.tien || 0)} đ</span>
                    </div>

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
              ))
            )}
          </div>

          <div className="m-lp-day">
            <div className="m-lp-day-trai">
              <span className="m-lp-day-nhan">Tổng:</span>
              <span className="m-lp-day-tong">{money(tongThanhToan)} đ</span>
            </div>
            <button
              type="button"
              className="m-lp-nut-chinh"
              onClick={() => {
                if (dsDong.length === 0) {
                  toast(laTien ? 'Vui lòng thêm ít nhất một dòng' : 'Vui lòng chọn ít nhất một mặt hàng')
                  return
                }
                setBuoc(4)
              }}
            >
              Tiếp tục
            </button>
          </div>

          {/* Sheet chọn lý do */}
          {dongDangChonLyDo !== null && (
            <MChon
              mo={dongDangChonLyDo !== null}
              onDong={() => setDongDangChonLyDo(null)}
              tieuDe="Chọn lý do"
              ds={dsLyDo.map(l => ({ k: l, ten: l }))}
              chon={dsDong[dongDangChonLyDo]?.ly}
              onChon={ly => {
                if (dongDangChonLyDo !== null) {
                  const tk = tkTheoLyDo(loai?.k ?? nhom, ly)
                  doiDong(dongDangChonLyDo, { ly, tkNo: tk.tkNo, tkCo: tk.tkCo })
                }
              }}
              apDung
              tim
            />
          )}

          {/* Sheet chọn tài khoản Nợ / Có */}
          {chonTk !== null && (
            <MChon
              mo={chonTk !== null}
              onDong={() => setChonTk(null)}
              tieuDe={chonTk.kieu === 'no' ? 'Chọn tài khoản Nợ' : 'Chọn tài khoản Có'}
              ds={DS_TK_CHI_TIET.map(t => ({ k: t.so, ten: `${t.so} - ${t.ten}` }))}
              chon={chonTk.kieu === 'no' ? dsDong[chonTk.dong]?.tkNo : dsDong[chonTk.dong]?.tkCo}
              onChon={soTk => {
                if (chonTk !== null) {
                  if (chonTk.kieu === 'no') {
                    doiDong(chonTk.dong, { tkNo: soTk })
                  } else {
                    doiDong(chonTk.dong, { tkCo: soTk })
                  }
                }
              }}
              tim
            />
          )}
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
              {bo.kho && (
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Kho:</span>
                  <span className="m-xp-tri dam">{kho}</span>
                </div>
              )}
              {cfg.doiTuong !== 'none' && (
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">{nhanDoiTuong}:</span>
                  <span className="m-xp-tri dam">{doiTuong}</span>
                </div>
              )}
              {laTien && (
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Quỹ / Tài khoản:</span>
                  <span className="m-xp-tri dam">{quy}</span>
                </div>
              )}
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">Thời gian:</span>
                <span className="m-xp-tri">{thoiGian}</span>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="m-the-trang m-lp-the-xac-nhan">
              <span className="m-lp-truong-nhan">Ghi chú:</span>
              <input
                type="text"
                className="m-lp-inp-tri"
                value={ghiChu}
                onChange={e => setGhiChu(e.target.value)}
                placeholder="Nhập ghi chú nếu có"
              />
            </div>

            {/* Hoá đơn VAT (nếu có) */}
            {Boolean(bo.hd) && (
              <div className="m-the-trang m-lp-the-xac-nhan">
                <div className="m-lp-sua-tieu" style={{ marginBottom: 8 }}>Thông tin hoá đơn VAT</div>
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Số hoá đơn:</span>
                  <input
                    type="text"
                    className="m-lp-sua-inp"
                    value={soHd}
                    onChange={e => setSoHd(e.target.value)}
                    placeholder="Nhập số hoá đơn"
                  />
                </div>
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Ký hiệu hoá đơn:</span>
                  <input
                    type="text"
                    className="m-lp-sua-inp"
                    value={kyHieuHd}
                    onChange={e => setKyHieuHd(e.target.value)}
                    placeholder="Nhập ký hiệu"
                  />
                </div>
              </div>
            )}

            {/* Khối Hạch toán */}
            <KhoiHachToan dsButToan={dsButToan} />

            {/* Danh sách dòng hàng */}
            <div className="m-lp-khoi-dong">
              <div className="m-xp-tieu-khoi">
                {laTien ? 'CHI TIẾT THU CHI' : 'DANH SÁCH HÀNG HOÁ'} ({dsDong.length})
              </div>

              {dsDong.map((d, i) => (
                <div key={i} className="m-the-trang m-xp-the-dong">
                  <div className="m-lp-hang-dau">
                    <span className="m-xp-dong-tieu">
                      {i + 1}. {d.ten || d.ly || 'Mặt hàng'} {d.ma ? `· ${d.ma}` : ''}
                    </span>
                    <button type="button" className="m-lp-btn-sua-dong" onClick={() => setBuoc(3)}>
                      Sửa
                    </button>
                  </div>
                  <div className="m-xp-dong-chi-tiet">
                    {!laTien && (
                      <div className="m-xp-dong-tt">
                        <span className="m-xp-nhan">Số lượng:</span>
                        <span className="m-xp-tri dam">
                          {d.sl ?? 1} {d.dvt ?? ''}
                        </span>
                      </div>
                    )}
                    <div className="m-xp-dong-tt">
                      <span className="m-xp-nhan">{laTien ? 'Số tiền:' : 'Đơn giá:'}</span>
                      <span className="m-xp-tri">{money(laTien ? d.tien || 0 : d.gia || 0)} đ</span>
                    </div>
                    {Boolean(d.ck) && (
                      <div className="m-xp-dong-tt">
                        <span className="m-xp-nhan">Giảm giá:</span>
                        <span className="m-xp-tri">-{money(d.ck || 0)} đ</span>
                      </div>
                    )}
                    {Boolean(d.thue) && (
                      <div className="m-xp-dong-tt">
                        <span className="m-xp-nhan">VAT ({d.ts || 0}%):</span>
                        <span className="m-xp-tri">{money(d.thue || 0)} đ</span>
                      </div>
                    )}
                    <div className="m-xp-dong-tt">
                      <span className="m-xp-nhan">Thành tiền:</span>
                      <span className="m-xp-tri dam cam">{money(d.tien || 0)} đ</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Khối tổng kết */}
            <div className="m-the-trang m-xp-the-tong">
              <div className="m-xp-dong-tt">
                <span className="m-xp-nhan">{laTien ? 'Tổng số tiền:' : 'Thành tiền mặt hàng:'}</span>
                <span className="m-xp-tri">{money(tongTien)} đ</span>
              </div>
              {Boolean(tongCk) && (
                <div className="m-xp-dong-tt">
                  <span className="m-xp-nhan">Tổng tiền giảm giá:</span>
                  <span className="m-xp-tri">-{money(tongCk)} đ</span>
                </div>
              )}
              {Boolean(tongThue) && (
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
          </div>

          <div className="m-lp-day m-lp-day-buoc4">
            <div className="m-lp-day-hang-tong">
              <span className="m-lp-day-nhan">Tổng:</span>
              <span className="m-lp-day-tong">{money(tongThanhToan)} đ</span>
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

      {/* ── BƯỚC 5: TẠO THÀNH CÔNG (CHỈ KHI LẬP MỚI) ── */}
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
