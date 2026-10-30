// Trang chủ gói Free trên điện thoại (T324)
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { cheDoHienTai, denBoMst, donViHienTai, dsCuaHang, useSession } from '../../app/session'
import { CUA_HANG, KHOA_SO_DEN, KY_MO, ROLE } from '../../data/mock'
import { Icon, ONen } from '../Icon'
import { fold, moneyD, pct, short } from '../format'
import { type KyBaoCao, tinhToanTongQuan } from '../../modules/home/chiSo'
import { tonQuyTheoSo } from '../../modules/home/LichSuQuy'
import { moTaCachNgan, nvlKy } from '../../modules/home/chi-phi-nvl'
import { useMoTuTrangChu } from '../../app/tuTrangChu'
import { Select } from '../Dropdown'
import { datLocDaXem } from '../bao-cao/tuyChinhBC'
import { MKhoStandard } from './MKhoStandard'
import { HopLaiLo13, HopThuChi13, laiLo13Thang, thuChi13Thang, VongQuy } from '../../modules/home/BaBaiToanStandard'
import { FigmaGradientIcon } from '../FigmaIcon'
import { ModalQuy } from '../../modules/home/quyThuChi'
import { useThaoTacNhanh, TOI_DA_THAO_TAC, type ThaoTacMuc } from '../../app/thaoTacNhanh'
import { MTimKiem } from './MTimKiem'
import { MChon } from './MChon'
import { useChonLoaiTien } from './MChonLoaiTien'
import { MODULES, tenPhanHe } from '../../app/registry'
import { anNgoaiGoi, minGoi } from '../../app/plan'
import { Pk } from '../Page'
import { DS_QUY_TIEN_112 } from '../../modules/danh-muc/data'
import { HuongDan, moLaiHuongDan } from '../../modules/home/HuongDan'
import { ChipTamTinh, DongDongBo, NhacSoDuKet, laDonViMoi, phanDaVe, useDongBoFabi } from '../../modules/home/NhacDonViMoi'
import { layLaiLoCuaHang } from '../../modules/home/soLieuBieuDoStandard'
import { chiPhiThangTuPhieu, usePhieuChiPhi } from '../../modules/home/chiPhiPhieu'

/** 5 quỹ mẫu chỉ có số dư, đồng bộ với BaBaiToanStandard (T303) */
const QUY_MAU_THEM = [
  { quy: 'Quỹ tiền mặt Hai Bà Trưng', tienMat: true, cuoi: 8_400_000 },
  { quy: 'Quỹ tiền mặt Phú Nhuận', tienMat: true, cuoi: 16_250_000 },
  { quy: 'Quỹ tiền mặt Thủ Đức', tienMat: true, cuoi: 12_700_000 },
  { quy: 'MB Bank, chi nhánh Phú Nhuận', tienMat: false, cuoi: 41_300_000 },
  { quy: 'VPBank, chi nhánh Thủ Đức', tienMat: false, cuoi: 33_600_000 },
].map(q => ({ ...q, mo: q.cuoi, thu: 0, chi: 0 }))

export function MTrangChuStandard(_props?: Partial<ScreenProps>) {
  const { s, set, toast } = useSession()
  const dv = donViHienTai(s)
  const moTuTrangChu = useMoTuTrangChu()

  // Cửa hàng
  const dsCnRaw = dsCuaHang(s)
  const dsCn = dsCnRaw.length ? dsCnRaw : CUA_HANG
  const cn = dsCn.find(c => c.id === s.cuaHang)
  const tenNgan = (id: string) => CUA_HANG.find(x => x.id === id)?.ngan
  const nhanCn = cn ? (tenNgan(cn.id) ?? cn.ten) : 'Tất cả'

  const selCns = useMemo(() => {
    if (!s.cuaHang || s.cuaHang === 'all') {
      return dsCn.map(c => c.id)
    }
    return [s.cuaHang]
  }, [s.cuaHang, dsCn])

  const dsChonCn = useMemo(() => {
    return [
      { k: 'all', ten: 'Tất cả cửa hàng', moTa: 'Chỉ xem gộp, chưa lập chứng từ' },
      ...dsCn.map(c => ({ k: c.id, ten: c.ten, moTa: tenNgan(c.id) })),
    ]
  }, [dsCn])

  // Chọn tháng, năm
  const [searchParams, setSearchParams] = useSearchParams()
  const thangUrl = Number(searchParams.get('thang'))
  const [thangF, setThangFState] = useState(thangUrl >= 7 && thangUrl <= 10 ? thangUrl : 10)
  const namUrl = Number(searchParams.get('nam'))
  const [namF, setNamFState] = useState(namUrl === 2026 ? namUrl : 2026)

  const setThangF = (t: number) => {
    setThangFState(t)
    setSearchParams(
      prev => {
        const n = new URLSearchParams(prev)
        n.set('thang', String(t))
        return n
      },
      { replace: true }
    )
  }

  const setNamF = (n: number) => {
    setNamFState(n)
    setSearchParams(
      prev => {
        const p = new URLSearchParams(prev)
        p.set('nam', String(n))
        return p
      },
      { replace: true }
    )
  }

  const dsChonNam = useMemo(
    () => [{ k: '2026', ten: 'Năm 2026' }],
    []
  )

  const dsChonThang = useMemo(
    () => [
      { k: '10', ten: 'Tháng 10' },
      { k: '9', ten: 'Tháng 9' },
      { k: '8', ten: 'Tháng 8' },
      { k: '7', ten: 'Tháng 7' },
    ],
    []
  )

  useEffect(() => {
    const t = Number(searchParams.get('thang'))
    if (t >= 7 && t <= 10 && t !== thangF) setThangFState(t)
    const n = Number(searchParams.get('nam'))
    if (n === 2026 && n !== namF) setNamFState(n)
  }, [searchParams, thangF, namF])

  // Modals
  const [moTimKiem, setMoTimKiem] = useState(false)
  const [moDropdownXemSo, setMoDropdownXemSo] = useState(false)
  const [moChonCn, setMoChonCn] = useState(false)
  const [moChonNam, setMoChonNam] = useState(false)
  const [moChonThang, setMoChonThang] = useState(false)
  const [moDsQuy, setMoDsQuy] = useState(false)
  const [moBieuDo, setMoBieuDo] = useState(false)
  const [moThuChi13, setMoThuChi13] = useState(false)
  const [modalQuy, setModalQuy] = useState<string | null>(null)

  // 1. Thao tác nhanh
  const {
    ds: thaoTacNhanhDs,
    tatCa: thaoTacTatCa,
    ids: thaoTacIds,
    luu: luuThaoTac,
    macDinhIds: thaoTacMacDinhIds,
  } = useThaoTacNhanh(s)
  const [moTuyChinhThaoTac, setMoTuyChinhThaoTac] = useState(false)
  const chonLoaiTien = useChonLoaiTien()
  const [chonThaoTacIds, setChonThaoTacIds] = useState<string[]>([])
  const [timThaoTac, setTimThaoTac] = useState('')

  useEffect(() => {
    if (!moTuyChinhThaoTac) return
    setChonThaoTacIds([...thaoTacIds])
    setTimThaoTac('')
  }, [moTuyChinhThaoTac, thaoTacIds])

  const mapThaoTac = useMemo(
    () => new Map(thaoTacTatCa.map(m => [m.id, m])),
    [thaoTacTatCa]
  )
  const chonThaoTacItems = useMemo(
    () =>
      chonThaoTacIds
        .map(id => mapThaoTac.get(id))
        .filter((x): x is ThaoTacMuc => x !== undefined && (!anNgoaiGoi(s.goi) || !x.khoa)),
    [chonThaoTacIds, mapThaoTac, s.goi]
  )

  const handleLenThaoTac = (idx: number) => {
    if (idx <= 0) return
    setChonThaoTacIds(prev => {
      const next = [...prev]
      const tam = next[idx - 1]
      next[idx - 1] = next[idx]
      next[idx] = tam
      return next
    })
  }

  const handleXuongThaoTac = (idx: number) => {
    if (idx >= chonThaoTacIds.length - 1) return
    setChonThaoTacIds(prev => {
      const next = [...prev]
      const tam = next[idx + 1]
      next[idx + 1] = next[idx]
      next[idx] = tam
      return next
    })
  }

  const handleBoChonThaoTac = (id: string) => {
    setChonThaoTacIds(prev => prev.filter(x => x !== id))
  }

  const handleToggleThaoTac = (id: string) => {
    setChonThaoTacIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id)
      }
      if (prev.length >= TOI_DA_THAO_TAC) {
        toast('Tối đa 8 thao tác')
        return prev
      }
      return [...prev, id]
    })
  }

  const handleKhoiPhucThaoTac = () => {
    setChonThaoTacIds([...thaoTacMacDinhIds])
    toast('Đã khôi phục thao tác mặc định')
  }

  const handleLuuThaoTac = () => {
    luuThaoTac(chonThaoTacIds)
    toast('Đã lưu thao tác nhanh')
    setMoTuyChinhThaoTac(false)
  }

  const wordsThaoTac = useMemo(() => fold(timThaoTac).split(/\s+/).filter(Boolean), [timThaoTac])
  const mucThaoTac = useMemo(() => {
    if (wordsThaoTac.length) {
      const cum = wordsThaoTac.join(' ')
      const hang = (x: ThaoTacMuc) => {
        const tf = fold(x.ten)
        return tf.startsWith(cum) ? 0 : tf.includes(' ' + cum) ? 1 : 2
      }
      const kq = thaoTacTatCa
        .filter(x => {
          if (anNgoaiGoi(s.goi) && x.khoa) return false
          const tf = fold(x.ten) + ' ' + fold(x.tenMod ?? '')
          return wordsThaoTac.every(w => tf.includes(w))
        })
        .map(x => [hang(x), x] as const)
        .sort((a, b) => a[0] - b[0])
        .map(([, x]) => x)
      return [{ ten: 'Kết quả', ds: kq }]
    }

    const theoMod = new Map<string, ThaoTacMuc[]>()
    for (const item of thaoTacTatCa) {
      if (anNgoaiGoi(s.goi) && item.khoa) continue
      const k = item.modKey
      const list = theoMod.get(k) ?? []
      list.push(item)
      theoMod.set(k, list)
    }

    const res: { ten: string; ds: ThaoTacMuc[] }[] = []
    for (const m of MODULES) {
      const ds = theoMod.get(m.key)
      if (ds && ds.length > 0) {
        res.push({
          ten: tenPhanHe(m, s.goi).ten,
          ds,
        })
      }
    }
    return res
  }, [thaoTacTatCa, wordsThaoTac, s.goi])

  // 2. Số liệu tính toán
  const kyXem: KyBaoCao = thangF === 10 ? 'thang-nay' : 'thang-truoc'
  const d0 = useMemo(() => tinhToanTongQuan(kyXem, selCns, s.cheDo, thangF), [kyXem, selCns, s.cheDo, thangF])
  // Chứng từ FABi còn đổ về sau Kết nối: doanh thu, chi phí, quỹ tăng dần như bản web (T687)
  const db = useDongBoFabi()
  const pDt = db ? phanDaVe(db.t) : 1
  const ctDaVe = db ? Math.round(db.ct * pDt) : 0
  const d = db ? { ...d0, dtThuan: Math.round(d0.dtThuan * pDt) } : d0

  // Lãi lỗ
  const nvl0 = useMemo(() => nvlKy(s, selCns, thangF), [s, selCns, thangF])
  const nvl = db ? { ...nvl0, tien: Math.round(nvl0.tien * pDt) } : nvl0
  // Chi phí hoạt động cộng từ phiếu chi có lý do là chi phí, như bản web (T483)
  const pcp = usePhieuChiPhi(s)
  const cpPhieu = useMemo(() => chiPhiThangTuPhieu(pcp, thangF, selCns), [pcp, thangF, selCns])
  const cpThang = Math.round(cpPhieu.tong * pDt)
  const loiNhuan = d.dtThuan - nvl.tien - cpThang - d.cpPhanBo
  const bien = d.dtThuan > 0 ? loiNhuan / d.dtThuan : 0
  const chiLon = cpPhieu.ds[0]   // lý do chi phí lớn nhất trong tháng
  const laiLo13 = useMemo(() => laiLo13Thang(s, selCns, pcp), [s, selCns, pcp])
  const laiLoCn = useMemo(() => layLaiLoCuaHang(thangF, selCns, s, pcp), [thangF, selCns, s, pcp])

  // Quỹ tiền
  const quyDu = useMemo(() => [...tonQuyTheoSo(thangF, selCns), ...QUY_MAU_THEM], [thangF, selCns])
  // Phiếu thu FABi chia cho các quỹ có thu theo số tiền thu, mỗi quỹ về hết ở một lúc khác nhau, như bản web (T687)
  const quyDb = useMemo(() => {
    if (!db) return undefined
    const coThu = quyDu.filter(q => q.thu > 0)
    const tongThu = coThu.reduce((a, q) => a + q.thu, 0) || 1
    return Object.fromEntries(coThu.map((q, i) => {
      const tong = Math.max(1, Math.round(db.tc * q.thu / tongThu))
      return [q.quy, { p: phanDaVe(db.t, [1, 0.6, 0.85, 0.7, 0.5][i % 5]), tong }]
    }))
  }, [db, quyDu])
  const quy = useMemo(() => quyDb ? quyDu.map(q => quyDb[q.quy] ? { ...q, thu: Math.round(q.thu * quyDb[q.quy].p), cuoi: Math.round(q.cuoi - q.thu * (1 - quyDb[q.quy].p)) } : q) : quyDu, [quyDu, quyDb])
  const dongBoQuy = quyDb && Object.fromEntries(Object.entries(quyDb).map(([k, v]) => [k, { da: Math.round(v.tong * v.p), tong: v.tong }]))
  const tongQuy = useMemo(() => {
    return {
      cuoi: quy.reduce((a, r) => a + r.cuoi, 0),
      thu: quy.reduce((a, r) => a + r.thu, 0),
      chi: quy.reduce((a, r) => a + r.chi, 0),
    }
  }, [quy])
  const thuChi13 = useMemo(() => thuChi13Thang(selCns), [selCns])

  const layIconThaoTac = (item: ThaoTacMuc) => {
    const k = item.icon || item.id || ''
    if (k === 'percent') return <FigmaGradientIcon name="ke-khai-thue" size={24} />
    if (k.includes('thu') || item.ten.includes('Thu')) return <FigmaGradientIcon name="thu-tien" size={24} />
    if (k.includes('chi') || item.ten.includes('Chi')) return <FigmaGradientIcon name="chi-tien" size={24} />
    if (k.includes('mua') || item.ten.includes('mua') || item.to.includes('mua-hang')) return <FigmaGradientIcon name="mua-hang" size={24} />
    if (k.includes('kho') || item.ten.includes('Kiểm kê') || item.to.includes('kho')) return <FigmaGradientIcon name="nhap-kho" size={24} />
    if (k.includes('bao-cao') || k.includes('so-quy') || item.ten.includes('Sổ quỹ')) return <FigmaGradientIcon name="bao-cao" size={24} />
    return <FigmaGradientIcon name="bao-cao" size={24} />
  }


  return (
    <div className="m-trang-chu m-tcf-trang" onClickCapture={moTuTrangChu}>
      <HuongDan />   {/* hướng dẫn từng bước lần đầu, đơn vị mới kết nối từ FABi (T138) */}
      {/* 1. Header gradient theo Figma MB01 (T498) */}
      <section className="m-tc-figma-header">
        <div className="m-tc-figma-hoa-tiet-1" />
        <div className="m-tc-figma-hoa-tiet-2" />

        <div className="m-tc-figma-dau">
          <div className="m-tc-figma-dau-trai">
            <div className="m-tc-figma-avatar-wrap">
              <span className="m-tc-figma-badge-standard">STANDARD</span>
              <div className="m-tc-figma-avatar">{dv.viettat}</div>
            </div>
            <div className="m-tc-figma-don-vi">
              <h2 className="m-tc-figma-dv-ten">{dv.ten}</h2>
              {/* chưa có MST: nhãn cam Bổ sung MST mở hộp Thông tin kê khai ở màn Kê khai thuế, kèm tên thông tư, như thanh trên web (file "Chỉnh text Onboarding.xlsx", 29/10/2026) */}
              {dv.mst
                ? <div className="m-tc-figma-dv-vaitro">{ROLE[s.role]}</div>
                : <div className="m-tc-figma-dv-vaitro m-dv-bo-mst"><Link className="dv-bo-mst" to={denBoMst(s.goi)}><Icon n="info" className="ic sm" />Bổ sung MST</Link><span>{cheDoHienTai(s).ngan.replace(/^TT\s*/, 'Thông tư ')}</span></div>}
            </div>
          </div>
          <div className="m-tc-figma-dau-phai">
            {/* xem lại hướng dẫn từng bước (T138) */}
            <button type="button" className="m-tc-figma-nut-tron m-tc-xem-hd" onClick={moLaiHuongDan} title="Xem lại hướng dẫn" aria-label="Xem lại hướng dẫn">
              <Icon n="la-ban" className="ic sm" />
            </button>
            <button
              type="button"
              className="m-tc-figma-nut-tron"
              onClick={() => setMoTimKiem(true)}
              title="Tìm kiếm"
              aria-label="Tìm kiếm màn hình"
            >
              <Icon n="search" className="ic sm" />
            </button>
            <button
              type="button"
              className="m-tc-figma-nut-tron"
              title="Thông báo"
            >
              <Icon n="bell" className="ic sm" />
              <span className="m-tc-figma-cham-tb" />
            </button>
          </div>
        </div>

        {/* 3 chips bộ lọc: Cửa hàng, Năm, Tháng */}
        <div className="m-tc-figma-bo-loc">
          <button
            type="button"
            className="m-tc-figma-chip"
            onClick={() => setMoChonCn(true)}
            title="Chọn cửa hàng hiển thị"
          >
            <span>CH: {nhanCn}</span>
            <Icon n="chevd" className="ic sm" />
          </button>

          <button
            type="button"
            className="m-tc-figma-chip"
            onClick={() => setMoChonNam(true)}
            title="Chọn năm"
          >
            <span>Năm {namF}</span>
            <Icon n="chevd" className="ic sm" />
          </button>

          <button
            type="button"
            className="m-tc-figma-chip"
            onClick={() => setMoChonThang(true)}
            title="Chọn tháng"
          >
            <span>Tháng {thangF}</span>
            <Icon n="chevd" className="ic sm" />
          </button>
        </div>
      </section>

      <div className="m-tcf-than" style={{ padding: '14px 16px 84px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 2. Thao tác nhanh (5 ô icon gradient vuông bo 10px) */}
        {thaoTacNhanhDs.length > 0 && (
          <div className="m-tcf-figma-card">
            <div className="m-tcf-figma-card-head">
              <div className="m-tcf-figma-head-trai">
                <h3 className="m-tcf-figma-card-tieu">Thao tác nhanh</h3>
                <span className="m-tcf-figma-card-info" title="Các thao tác nhanh thường dùng">
                  <Icon n="info" className="ic sm" />
                </span>
              </div>
              <button
                type="button"
                className="m-tcf-figma-link-bc"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                onClick={() => setMoTuyChinhThaoTac(true)}
              >
                Tuỳ chỉnh
              </button>
            </div>

            <div className="m-tcf-nhanh-grid">
              {thaoTacNhanhDs.slice(0, 5).map(item => (
                <Link
                  key={item.id}
                  to={item.to}
                  {...chonLoaiTien.bam(item)}
                  className="m-tcf-nhanh-muc"
                >
                  <div className="m-tcf-nhanh-o-ic">
                    {layIconThaoTac(item)}
                  </div>
                  <span className="m-tcf-nhanh-chu">{item.ten}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Nhắc khoá sổ tháng chưa khoá */}
        {(KHOA_SO_DEN.nam < KY_MO.nam ||
          (KHOA_SO_DEN.nam === KY_MO.nam && KHOA_SO_DEN.thang < KY_MO.thang - 1)) && (
          <div className="m-tcf-nhac-khoa-wrap">
            <Link
              to="/app/he-thong/khoa-so"
              className="bbt-nhac-khoa m-tcf-nhac-khoa"
              title="Khoá sổ để chốt số liệu, phiếu trong tháng không bị sửa nhầm"
            >
              <Icon n="lock" className="ic sm" />
              <span>
                Tháng{' '}
                {KHOA_SO_DEN.thang === 12 ? 1 : KHOA_SO_DEN.thang + 1}/
                {KHOA_SO_DEN.thang === 12 ? KHOA_SO_DEN.nam + 1 : KHOA_SO_DEN.nam} chưa khoá sổ
              </span>
              <b>Khoá sổ ›</b>
            </Link>
          </div>
        )}

        {/* 3. Thẻ Kết quả kinh doanh theo Figma */}
        <div className="m-tcf-figma-card">
          <div className="m-tcf-figma-card-head">
            <div className="m-tcf-figma-head-trai">
              <FigmaGradientIcon name="bao-cao" size={22} />
              <h2 className="m-tcf-figma-card-tieu">Kết quả kinh doanh</h2>
            </div>
            <Link
              to="/app/bao-cao/10-2-3"
              className="m-tcf-figma-link-bc"
              aria-label="Xem báo cáo kết quả kinh doanh"
              onClick={() => datLocDaXem('/app/bao-cao/10-2-3', {}, String(thangF))}
            >
              Xem BC ›
            </Link>
          </div>
          <div className="m-tcf-figma-card-mota">Doanh thu trừ các khoản chi phí trong tháng</div>

          <div className="m-tcf-hero-box">
            <div className="m-tcf-hero-lbl">
              Lợi nhuận {thangF === 10 ? 'tháng này' : `tháng ${thangF}`}<ChipTamTinh />
            </div>
            <div
              className="m-tcf-hero-so"
              style={{ color: loiNhuan < 0 ? 'var(--red, #c2362b)' : laDonViMoi(s) ? 'var(--ink)' : 'var(--green, #138a52)' }}   // đơn vị mới: lợi nhuận tạm tính (T138)
            >
              {loiNhuan < 0 ? `Lỗ ${moneyD(Math.abs(loiNhuan))}` : moneyD(loiNhuan)}
            </div>
            <div className="m-tcf-hero-sub">Biên lợi nhuận {pct(bien)}</div>
          </div>

          <div className="m-tcf-kqkd-bang">
            {/* Dòng Doanh thu: Trum chốt số tiền màu --blue */}
            <div className={`m-tcf-kqkd-hang${db ? ' co-db' : ''}`}>
              <div className="m-tcf-kqkd-cot-trai">
                <div className="m-tcf-kqkd-ten-hang">Doanh thu</div>
              </div>
              <div className="m-tcf-kqkd-cot-phai">
                <span className="m-tcf-kqkd-so-tien dt-blue">{moneyD(d.dtThuan)}</span>
                <Icon n="chevr" className="ic sm m-tcf-mui-an" />
              </div>
              {db && <DongDongBo da={ctDaVe} tong={db.ct} />}
            </div>

            {/* Chi phí nguyên vật liệu: Trum chốt % màu --orange */}
            <Link
              to={`/app/trang-chu/chi-phi-nvl?thang=${thangF}`}
              className="m-tcf-kqkd-hang m-tcf-kqkd-hang-link"
              title="Xem chi phí nguyên vật liệu"
            >
              <div className="m-tcf-kqkd-cot-trai">
                <div className="m-tcf-kqkd-ten-hang">Chi phí nguyên vật liệu</div>
                <div className="m-tcf-kqkd-sub-hang">{moTaCachNgan(nvl.ds)}</div>
              </div>
              <div className="m-tcf-kqkd-cot-phai">
                <div className="m-tcf-kqkd-tien-pt">
                  <div className="m-tcf-kqkd-so-tien">{moneyD(nvl.tien)}</div>
                  <div className="m-tcf-kqkd-pt-cam">{pct(d.dtThuan > 0 ? nvl.tien / d.dtThuan : 0)}</div>
                </div>
                <Icon n="chevr" className="ic sm m-tcf-mui-xam" />
              </div>
            </Link>

            {/* Chi phí hoạt động: Trum chốt % màu --orange */}
            <Link
              to={`/app/trang-chu/chi-phi-thang?thang=${thangF}`}
              className="m-tcf-kqkd-hang m-tcf-kqkd-hang-link"
              title="Xem chi phí hoạt động"
            >
              <div className="m-tcf-kqkd-cot-trai">
                <div className="m-tcf-kqkd-ten-hang">Chi phí hoạt động</div>
                <div className="m-tcf-kqkd-sub-hang">
                  {chiLon
                    ? `Lớn nhất: ${chiLon.ly} ${short(chiLon.v)}`
                    : 'Lương, mặt bằng, điện nước…'}
                </div>
              </div>
              <div className="m-tcf-kqkd-cot-phai">
                <div className="m-tcf-kqkd-tien-pt">
                  <div className="m-tcf-kqkd-so-tien">{moneyD(cpThang)}</div>
                  <div className="m-tcf-kqkd-pt-cam">{pct(d.dtThuan > 0 ? cpThang / d.dtThuan : 0)}</div>
                </div>
                <Icon n="chevr" className="ic sm m-tcf-mui-xam" />
              </div>
            </Link>

            {/* Chi phí phân bổ nhiều tháng: Trum chốt % màu --orange */}
            <Link
              to="/app/ccdc/8-1-1"
              className="m-tcf-kqkd-hang m-tcf-kqkd-hang-link"
              title="Xem chi phí phân bổ, khấu hao"
            >
              <div className="m-tcf-kqkd-cot-trai">
                <div className="m-tcf-kqkd-ten-hang">Chi phí phân bổ nhiều tháng</div>
                <div className="m-tcf-kqkd-sub-hang">Chi phí phân bổ nhiều tháng</div>
              </div>
              <div className="m-tcf-kqkd-cot-phai">
                <div className="m-tcf-kqkd-tien-pt">
                  <div className="m-tcf-kqkd-so-tien">{moneyD(d.cpPhanBo)}</div>
                  <div className="m-tcf-kqkd-pt-cam">{pct(d.dtThuan > 0 ? d.cpPhanBo / d.dtThuan : 0)}</div>
                </div>
                <Icon n="chevr" className="ic sm m-tcf-mui-xam" />
              </div>
            </Link>

            {/* Lợi nhuận: nền xanh lá nhạt --greent, chữ xanh đậm */}
            <div className="m-tcf-kqkd-hang m-tcf-kqkd-hang-ln">
              <div className="m-tcf-kqkd-cot-trai">
                <div className="m-tcf-kqkd-ten-hang">Lợi nhuận</div>
              </div>
              <div className="m-tcf-kqkd-cot-phai">
                <div className="m-tcf-kqkd-tien-pt">
                  <div className="m-tcf-kqkd-so-tien">
                    {loiNhuan < 0 ? `Lỗ ${moneyD(Math.abs(loiNhuan))}` : moneyD(loiNhuan)}
                  </div>
                  <div className="m-tcf-kqkd-pt-xanh">{pct(bien)}</div>
                </div>
                <Icon n="chevr" className="ic sm m-tcf-mui-an" />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="m-tcf-nut-vien"
            style={{ marginTop: 14 }}
            onClick={() => setMoBieuDo(true)}
          >
            <Icon n="chart" className="ic sm" />
            <span>Xem hiệu quả kinh doanh 13 tháng</span>
            <Icon n="chevr" className="ic sm m-tcf-mui-xam" />
          </button>
        </div>

        {/* 4. Thẻ Quỹ tiền theo Figma */}
        <div className="m-tcf-figma-card">
          <div className="m-tcf-figma-card-head">
            <div className="m-tcf-figma-head-trai">
              <FigmaGradientIcon name="thu-tien" size={22} />
              <h2 className="m-tcf-figma-card-tieu">Quỹ tiền</h2>
            </div>
            <div className="m-tcf-xem-so-hop">
              <button
                type="button"
                className="m-tcf-btn-xem-so"
                onClick={() => setMoDropdownXemSo(!moDropdownXemSo)}
              >
                <span>Xem sổ</span>
                <Icon n="chevd" className={`ic sm ${moDropdownXemSo ? 'xoay' : ''}`} />
              </button>
              {moDropdownXemSo && (
                <div className="m-tcf-menu-xem-so">
                  <Link
                    to="/app/bao-cao/2-2-1"
                    className="m-tcf-menu-item"
                    onClick={() => {
                      setMoDropdownXemSo(false)
                      datLocDaXem('/app/bao-cao/2-2-1', {}, String(thangF))
                    }}
                  >
                    Sổ quỹ tiền mặt
                  </Link>
                  <Link
                    to="/app/bao-cao/2-2-3"
                    className="m-tcf-menu-item"
                    onClick={() => {
                      setMoDropdownXemSo(false)
                      datLocDaXem('/app/bao-cao/2-2-3', {}, String(thangF))
                    }}
                  >
                    Sổ ngân hàng
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="m-tcf-figma-card-mota">Tiền mặt tại cửa hàng và tiền gửi ngân hàng</div>

          <div className="m-tcf-hero-box">
            <div className="m-tcf-hero-lbl">
              {thangF === 10 ? 'Tồn quỹ hiện tại' : `Tồn quỹ cuối tháng ${thangF}/2026`}
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', marginTop: 4 }}
              onClick={() => setModalQuy('tat-ca')}
              title="Xem biểu đồ thu chi tất cả quỹ"
            >
              <span className="m-tcf-hero-so" style={{ color: 'var(--blue, #0560a6)', marginTop: 0 }}>
                {moneyD(tongQuy.cuoi)}
              </span>
              <Icon n="chevr" className="ic sm m-tcf-mui-blue" />
            </div>
            <div className="m-tcf-hero-sub">
              {thangF === 10 ? 'Tháng này thu' : `Tháng ${thangF} thu`}{' '}
              <span style={{ color: 'var(--green, #138a52)' }}>{short(tongQuy.thu)}</span> · chi{' '}
              <span style={{ color: 'var(--red, #c2362b)' }}>{short(tongQuy.chi)}</span>
            </div>
            {dongBoQuy && (   // vòng quỹ điện thoại vẽ bằng SVG, không có dòng từng quỹ: báo gộp phiếu thu của mọi quỹ (T687)
              <div className="m-tcf-db-quy">
                <DongDongBo da={Object.values(dongBoQuy).reduce((a, x) => a + x.da, 0)} tong={Object.values(dongBoQuy).reduce((a, x) => a + x.tong, 0)} />
              </div>
            )}
            <NhacSoDuKet />
          </div>

          {quy.length > 0 ? (
            <VongQuy ds={quy} tong={tongQuy.cuoi} onChon={setModalQuy} kieu="mobile" moDs={moDsQuy} onMoDsThayDoi={setMoDsQuy} />
          ) : (
            <div className="bbt-quy-trong" style={{ padding: 20, textAlign: 'center' }}>
              <Icon n="wallet" className="ic" />
              <b>Chưa có quỹ tiền nào</b>
            </div>
          )}

          <div className="m-tcf-hang-2nut">
            <Link
              to="/app/danh-muc/1-12?moi=1&goiY=thuchi"
              className="m-tcf-nut-vien chu-xanh"
              title="Tạo quỹ tiền mặt hoặc tài khoản ngân hàng"
            >
              <Icon n="plus" className="ic sm" />
              <span>Tạo quỹ</span>
            </Link>
            <button
              type="button"
              className="m-tcf-nut-vien"
              onClick={() => setMoDsQuy(true)}
              title="Xem danh sách tất cả quỹ"
            >
              <span>Tất cả quỹ ({quy.length}) ›</span>
            </button>
          </div>

          <button
            type="button"
            className="m-tcf-nut-vien"
            style={{ marginTop: 8 }}
            onClick={() => setMoThuChi13(true)}
            title="Xem dòng tiền 13 tháng"
          >
            <Icon n="chart" className="ic sm" />
            <span>Xem dòng tiền 13 tháng</span>
            <Icon n="chevr" className="ic sm m-tcf-mui-xam" />
          </button>
        </div>

        {/* 5. Khối Mua hàng & công nợ NCC, Hao hụt kiểm kê */}
        <MKhoStandard selCns={selCns} thang={thangF} />
      </div>

      {/* Popups & Modals */}
      {moBieuDo && (
        <HopLaiLo13
          ds={laiLo13}
          onDong={() => setMoBieuDo(false)}
          thangXem={thangF}
          selCns={selCns}
          laiLoCn={laiLoCn}
        />
      )}

      {chonLoaiTien.sheet}

      {moThuChi13 && (
        <HopThuChi13
          ds={thuChi13}
          onDong={() => setMoThuChi13(false)}
        />
      )}

      {modalQuy && (
        <ModalQuy
          quyKey={modalQuy}
          thang={thangF}
          isMobile={true}
          selCns={selCns}
          onDong={() => setModalQuy(null)}
        />
      )}

      <MChon
        mo={moChonCn}
        tieuDe="Chọn cửa hàng làm việc"
        ds={dsChonCn}
        chon={s.cuaHang || 'all'}
        onChon={k => {
          set({ cuaHang: k })   // Tất cả lưu 'all' như web để bước chọn cửa hàng trước khi lập phiếu bắt được (T611)
          setMoChonCn(false)
        }}
        onDong={() => setMoChonCn(false)}
      />

      <MChon
        mo={moChonNam}
        tieuDe="Chọn năm"
        ds={dsChonNam}
        chon={String(namF)}
        onChon={k => {
          setNamF(Number(k))
          setMoChonNam(false)
        }}
        onDong={() => setMoChonNam(false)}
      />

      <MChon
        mo={moChonThang}
        tieuDe="Chọn tháng"
        ds={dsChonThang}
        chon={String(thangF)}
        onChon={k => {
          setThangF(Number(k))
          setMoChonThang(false)
        }}
        onDong={() => setMoChonThang(false)}
      />

      <MTimKiem mo={moTimKiem} onDong={() => setMoTimKiem(false)} />

      {/* Tấm trượt tuỳ chỉnh thao tác nhanh (T266, T280, T342) */}
      {moTuyChinhThaoTac && (
        <div className="m-tam-overlay" onClick={() => setMoTuyChinhThaoTac(false)}>
          <div className="m-tam-hop m-tam-hop-apdung" style={{ height: '94vh', maxHeight: '94vh' }} onClick={e => e.stopPropagation()}>
            <div className="m-tam-dau m-tam-dau-apdung">
              <h2 className="m-tam-tieu">Tuỳ chỉnh thao tác nhanh</h2>
              <button
                type="button"
                className="m-tam-dong-btn"
                onClick={() => setMoTuyChinhThaoTac(false)}
                aria-label="Đóng"
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>

            <div className="m-tam-tim-wrap">
              <Icon n="search" className="m-tam-tim-ic ic sm" />
              <input
                className="m-tam-tim-inp"
                placeholder="Tìm thao tác hoặc màn hình..."
                value={timThaoTac}
                onChange={e => setTimThaoTac(e.target.value)}
              />
              {timThaoTac && (
                <button
                  type="button"
                  className="m-tam-tim-x"
                  onClick={() => setTimThaoTac('')}
                  aria-label="Xoá tìm kiếm"
                >
                  <Icon n="x" className="ic sm" />
                </button>
              )}
            </div>

            {/* Hàng đã chọn */}
            <div className="ttn-m-da-chon-khung" style={{ padding: '10px 16px', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                <span>Đã chọn ({chonThaoTacIds.length}/{TOI_DA_THAO_TAC})</span>
                {chonThaoTacIds.length >= TOI_DA_THAO_TAC && (
                  <span style={{ color: 'var(--orange-d)', fontSize: 11.5 }}>Tối đa {TOI_DA_THAO_TAC} thao tác</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                {chonThaoTacItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      background: '#fff',
                      borderRadius: 8,
                      border: '1px solid var(--line-2)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <ONen n={item.icon} kieu="nhat" co="sm" />
                      <span style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.ten}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 'none' }}>
                      <button
                        type="button"
                        className="ttn-btn-mui-ten"
                        title="Lên trên"
                        disabled={idx === 0}
                        onClick={() => handleLenThaoTac(idx)}
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        className="ttn-btn-mui-ten"
                        title="Xuống dưới"
                        disabled={idx === chonThaoTacItems.length - 1}
                        onClick={() => handleXuongThaoTac(idx)}
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        className="ttn-btn-mui-ten"
                        style={{ color: 'var(--red)' }}
                        title={`Bỏ ${item.ten}`}
                        onClick={() => handleBoChonThaoTac(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danh sách ứng viên gom phân hệ */}
            <div className="m-tam-ds" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }}>
              {mucThaoTac.length === 0 && (
                <div className="m-tam-trong" style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
                  Không tìm thấy thao tác nào
                </div>
              )}
              {mucThaoTac.map(g => (
                <div key={g.ten} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '10px 0 4px' }}>
                    {g.ten}
                  </div>
                  {g.ds.map(x => {
                    const isChon = chonThaoTacIds.includes(x.id)
                    const atLimit = chonThaoTacIds.length >= TOI_DA_THAO_TAC && !isChon
                    return (
                      <div
                        key={x.id}
                        className="m-tam-dong"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          padding: '8px 0',
                          borderBottom: '1px solid var(--line-2)',
                          opacity: atLimit ? 0.5 : 1,
                        }}
                      >
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            flex: 1,
                            minWidth: 0,
                            cursor: x.khoa ? 'not-allowed' : 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isChon}
                            disabled={x.khoa || atLimit}
                            onChange={() => !x.khoa && handleToggleThaoTac(x.id)}
                            style={{ width: 18, height: 18, accentColor: 'var(--blue)' }}
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <ONen n={x.icon} kieu="nhat" co="sm" />
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>{x.ten}</span>
                              <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{x.tenMod}</span>
                            </div>
                            {x.khoa && x.ma && <Pk g={minGoi(x.ma)} o />}
                          </div>
                        </label>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>

            <div className="m-tam-day ttn-m-day">
              <button
                type="button"
                className="btn sm ghost ttn-m-btn-khoiphuc"
                onClick={handleKhoiPhucThaoTac}
              >
                Khôi phục
              </button>
              <div className="ttn-m-day-phai">
                <button
                  type="button"
                  className="m-tam-btn-huy"
                  onClick={() => setMoTuyChinhThaoTac(false)}
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  className="m-tam-btn-apdung"
                  onClick={handleLuuThaoTac}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
