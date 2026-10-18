import { useMemo, useState, type FC } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { hienMan, laBaoCao } from '../../app/registry'
import { anNgoaiGoi } from '../../app/plan'
import { CUA_HANG } from '../../data/mock'
import { money, fold } from '../format'
import { Icon } from '../Icon'
import { suaPhieu } from '../generic/daXoa'
import { MDanhSach } from './MDanhSach'
import { MBaoCaoTheoDoi } from './MBaoCaoTheoDoi'
import { MChon } from './MChon'
import { LichDon } from '../ChonNgay'
import {
  daPhanBoToiKy,
  LOAI_THE,
  soTheKeTiep,
  type DongPb,
} from '../../modules/ccdc/the-phan-bo'

// Dữ liệu thẻ mẫu ccdc
const THE_MAU_BASE = [
  { soThe: 'TPB2601-0001', loai: 'Công cụ dụng cụ', ngay: '05/01/2026', ten: 'Bộ nồi inox 50 lít', cn: 'Phố Mây Lê Lợi', gt: 24_600_000, ky: 12, soCt: 'PC2610-0250', ngayCt: '03/10/2026', ghiChuCt: 'Chi mua rau, củ tại chợ', _goc: '/app/tien/2-1-1/chi-3', dong: [{ ma: 'CCDC0001', ten: 'Bộ nồi inox 50 lít', gt: 24_600_000, ky: 12, sl: 1, dg: 24_600_000, ngayPb: '05/01/2026' }] },
  { soThe: 'TPB2606-0002', loai: 'Công cụ dụng cụ', ngay: '20/06/2026', ten: 'Bàn ghế gỗ khu ngoài trời', cn: 'Phố Mây Thảo Điền', gt: 86_400_000, ky: 24, soCt: 'PC2609-0240', ngayCt: '29/09/2026', ghiChuCt: 'Chi mua rau, củ tại chợ', _goc: '/app/tien/2-1-1/chi-6', dong: [{ ma: 'CCDC0002', ten: 'Bàn ghế gỗ khu ngoài trời', gt: 86_400_000, ky: 24, sl: 1, dg: 86_400_000, ngayPb: '20/06/2026' }] },
  { soThe: 'TPB2608-0003', loai: 'Công cụ dụng cụ', ngay: '01/08/2026', ten: 'Máy POS cầm tay và Máy xay', cn: 'Phố Mây Nguyễn Tri Phương', gt: 50_700_000, ky: 18, soCt: 'UNC2610-0256', ngayCt: '05/10/2026', ghiChuCt: 'Trả tiền nhà cung cấp thịt bò', _goc: '/app/tien/2-1-1/unc-1', dong: [{ ma: 'CCDC0003', ten: 'Máy POS cầm tay', gt: 31_800_000, ky: 18, sl: 1, dg: 31_800_000, ngayPb: '01/08/2026' }, { ma: 'CCDC0004', ten: 'Máy xay sinh tố công nghiệp', gt: 18_900_000, ky: 12, sl: 1, dg: 18_900_000, ngayPb: '01/08/2026' }] },
  { soThe: 'TPB2607-0004', loai: 'Chi phí trả trước', ngay: '01/07/2026', ten: 'Tiền thuê mặt bằng trả trước 6 tháng', cn: 'Phố Mây Lê Lợi', gt: 594_000_000, ky: 6, soCt: 'UNC2609-0236', ngayCt: '25/09/2026', ghiChuCt: 'Trả tiền thuê mặt bằng tháng 10', _goc: '/app/tien/2-1-1/unc-8', dong: [{ ma: 'TT001', ten: 'Tiền thuê mặt bằng trả trước 6 tháng', gt: 594_000_000, ky: 6, sl: 1, dg: 594_000_000, ngayPb: '01/07/2026' }] },
  { soThe: 'TPB2601-0005', loai: 'Chi phí trả trước', ngay: '01/01/2026', ten: 'Phí bản quyền phần mềm năm 2026', cn: 'Phố Mây Thảo Điền', gt: 18_000_000, ky: 12, soCt: 'UNC2609-0237', ngayCt: '26/09/2026', ghiChuCt: 'Trả tiền nhà cung cấp thịt bò', _goc: '/app/tien/2-1-1/unc-7', dong: [{ ma: 'TT002', ten: 'Phí bản quyền phần mềm năm 2026', gt: 18_000_000, ky: 12, sl: 1, dg: 18_000_000, ngayPb: '01/01/2026' }] },
  { soThe: 'TPB2602-0006', loai: 'Chi phí trả trước', ngay: '01/02/2026', ten: 'Bảo hiểm cháy nổ 6 tháng', cn: 'Phố Mây Nguyễn Tri Phương', gt: 12_000_000, ky: 6, soCt: 'PC2609-0236', ngayCt: '26/09/2026', ghiChuCt: 'Chi tiền gas tháng 10', _goc: '/app/tien/2-1-1/chi-8', dong: [{ ma: 'TT003', ten: 'Bảo hiểm cháy nổ 6 tháng', gt: 12_000_000, ky: 6, sl: 1, dg: 12_000_000, ngayPb: '01/02/2026' }] },
  { soThe: 'TPB2611-0007', loai: 'Công cụ dụng cụ', ngay: '05/11/2026', ten: 'Dao thớt bếp trọn bộ', cn: 'Phố Mây Lê Lợi', gt: 9_600_000, ky: 12, soCt: 'PC2610-0259', ngayCt: '07/10/2026', ghiChuCt: 'Chi tiền điện tháng 9', _goc: '/app/tien/2-1-1/chi-0', dong: [{ ma: 'CCDC0005', ten: 'Dao thớt bếp trọn bộ', gt: 9_600_000, ky: 12, sl: 1, dg: 9_600_000, ngayPb: '05/11/2026' }] },
  { soThe: 'TPB2609-0008', loai: 'Chi phí trả trước', ngay: '01/09/2026', ten: 'Tiền thuê kho lạnh 6 tháng', cn: 'Phố Mây Thảo Điền', gt: 92_400_000, ky: 12, soCt: 'UNC2610-0252', ngayCt: '03/10/2026', ghiChuCt: 'Trả tiền thuê mặt bằng tháng 10', _goc: '/app/tien/2-1-1/unc-2', dong: [{ ma: 'CPTT.0001', ten: 'Tiền thuê kho lạnh 6 tháng', gt: 54_000_000, ky: 6, sl: 1, dg: 54_000_000, ngayPb: '01/09/2026' }] },
  { soThe: 'TPB2609-0009', loai: 'Công cụ dụng cụ', ngay: '15/09/2026', ten: 'Ly thuỷ tinh 300ml và tủ mát', cn: 'Phố Mây Nguyễn Tri Phương', gt: 40_500_000, ky: 12, soCt: 'PC2609-0243', ngayCt: '30/09/2026', ghiChuCt: 'Chi tiền gas tháng 10', _goc: '/app/tien/2-1-1/chi-5', dong: [{ ma: 'CCDC0006', ten: 'Ly thuỷ tinh 300ml', gt: 7_200_000, ky: 12, sl: 240, dg: 30_000, ngayPb: '15/09/2026' }, { ma: 'CCDC0007', ten: 'Tủ mát 2 cánh', gt: 28_500_000, ky: 24, sl: 1, dg: 28_500_000, ngayPb: '15/09/2026' }] },
  { soThe: 'TPB2610-0010', loai: 'Tài sản cố định', ngay: '01/10/2026', ten: 'Máy rửa chén công nghiệp', cn: 'Phố Mây Lê Lợi', gt: 310_000_000, ky: 60, soCt: 'UNC2609-0244', ngayCt: '28/09/2026', ghiChuCt: 'Nộp thuế GTGT tháng 9', _goc: '/app/tien/2-1-1/unc-5', dong: [{ ma: 'TSCD.0001', ten: 'Máy rửa chén công nghiệp', gt: 186_000_000, ky: 60, sl: 1, dg: 186_000_000, ngayPb: '01/10/2026' }, { ma: 'TSCD.0002', ten: 'Hệ thống hút khói bếp', gt: 124_000_000, ky: 60, sl: 1, dg: 124_000_000, ngayPb: '01/10/2026' }] },
  { soThe: 'TPB2610-0011', loai: 'Chi phí trả trước', ngay: '07/10/2026', ten: 'Tiền nhà 6 tháng', cn: 'Phố Mây Lê Lợi', gt: 72_000_000, ky: 6, soCt: 'PC2610-0261', ngayCt: '07/10/2026', ghiChuCt: 'Tiền nhà 6 tháng', _goc: '/app/tien/2-1-1/chi-cpb', dong: [{ ma: 'CPTT.0004', ten: 'Tiền nhà 6 tháng', gt: 72_000_000, ky: 6, sl: 1, dg: 72_000_000, ngayPb: '07/10/2026' }] },
]

type TheItem = (typeof THE_MAU_BASE)[0] & {
  da?: number
  con?: number
  het?: boolean
  ngayPb?: string
  ttCls?: string
  ttNhan?: string
}

/** Thẻ tạo trong phiên, giữ lại khi rời màn rồi quay lại (vd mở từ link Thẻ chi phí trên phiếu chi) (T421) */
const theTaoPhien: TheItem[] = []

export const MCcdc: FC<ScreenProps> = ({ sc, mod }) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const loc = useLocation()
  const [sp] = useSearchParams()
  const cnChon = cuaHangHienTai(s)

  interface TuPhieuData {
    cn?: string
    gt?: number | string
    tien?: number | string
    ten?: string
    ghiChuCt?: string
    ngay?: string
    ngayCt?: string
    ngayPb?: string
    soCt?: string
    idMoi?: string
    _goc?: string
    dong?: { ten?: string; gt?: number | string }[]
  }
  const tuPhieu = (loc.state as { tuPhieu?: TuPhieuData } | null)?.tuPhieu

  const [theList, setTheList] = useState<TheItem[]>(() => [...theTaoPhien, ...THE_MAU_BASE])
  // ?mo=<số thẻ>: mở thẳng chi tiết thẻ, vd bấm Thẻ chi phí trên phiếu chi; quay lại thì về màn trước (T421)
  const [theXem, setTheXem] = useState<TheItem | null>(() => { const mo = sp.get('mo'); return mo ? [...theTaoPhien, ...THE_MAU_BASE].find(t => t.soThe === mo) ?? null : null })
  const [tuLink] = useState(() => Boolean(sp.get('mo')))
  const [tabThe, setTabThe] = useState<'chitiet' | 'lichpb' | 'lichsu'>('chitiet')
  const [theSuaId, setTheSuaId] = useState<string | null>(null)
  const [moMenuMore, setMoMenuMore] = useState(false)
  const [moChonCn, setMoChonCn] = useState(false)
  const [moGhiTang, setMoGhiTang] = useState(() => Boolean(tuPhieu || sp.get('moi') === 'the'))
  const [cnGhiTang, setCnGhiTang] = useState<string>(() => tuPhieu?.cn || cnChon?.ten || 'Phố Mây Lê Lợi')
  const [moTheoDoi, setMoTheoDoi] = useState(false)

  // Form state ghi tăng mới
  const [ftLoai, setFtLoai] = useState('Chi phí trả trước')
  const [moChonLoai, setMoChonLoai] = useState(false)
  const [ftTen, setFtTen] = useState(() => tuPhieu?.ten || tuPhieu?.ghiChuCt || tuPhieu?.dong?.[0]?.ten || '')
  const [ftGt, setFtGt] = useState(() => String(tuPhieu?.gt || tuPhieu?.tien || tuPhieu?.dong?.[0]?.gt || '24000000'))
  const [ftKy, setFtKy] = useState('12')
  const [ftNgayPb, setFtNgayPb] = useState(() => tuPhieu?.ngayPb || tuPhieu?.ngay || tuPhieu?.ngayCt || '01/10/2026')
  const [ftNgay, setFtNgay] = useState(() => tuPhieu?.ngay || tuPhieu?.ngayCt || '01/10/2026')
  const [daChonNgayPb, setDaChonNgayPb] = useState(() => Boolean(tuPhieu?.ngayPb))
  const [moLichGt, setMoLichGt] = useState(false)
  const [moLichPb, setMoLichPb] = useState(false)

  const kyHienTai = 202610

  const [chipTT, setChipTT] = useState('all')

  // Danh sách đã tính đã phân bổ và còn lại
  const list = useMemo(() => {
    return theList
      .filter(t => !cnChon || t.cn === cnChon.ten)
      .map(t => {
        const da = daPhanBoToiKy(t, kyHienTai)
        const con = Math.max(0, t.gt - da)
        const ttNhan = con <= 0 ? 'Hết phân bổ' : 'Đang phân bổ'
        const ttCls = con <= 0 ? 'dim' : 'ok'
        return {
          ...t,
          da,
          con,
          ttNhan,
          ttCls,
        }
      })
  }, [theList, cnChon, kyHienTai])

  const listLoc = useMemo(() => {
    if (chipTT === 'dang') return list.filter(r => (r.con ?? 0) > 0)
    if (chipTT === 'het') return list.filter(r => (r.con ?? 0) <= 0)
    return list
  }, [list, chipTT])

  const chips = useMemo(() => [
    { k: 'all', ten: 'Tất cả', dem: list.length },
    { k: 'dang', ten: 'Đang phân bổ', dem: list.filter(r => (r.con ?? 0) > 0).length },
    { k: 'het', ten: 'Hết phân bổ', dem: list.filter(r => (r.con ?? 0) <= 0).length },
  ], [list])

  const tongTien = useMemo(() => listLoc.reduce((s, r) => s + r.gt, 0), [listLoc])

  // Tabs ngang trên đầu danh sách (T363: ẩn tab ngoài gói theo hienMan / moDuoc / anNgoaiGoi; còn <= 1 tab thì ẩn luôn hàng tab)
  const tabs = useMemo(() => {
    const ds: { k: string; ten: string; on?: boolean; onClick?: () => void }[] = []

    const sc811 = mod?.screens.find(x => x.slug === '8-1-1' || x.code === '8.1.1')
    if (!sc811 || hienMan(sc811, s.goi, s.cheDo, s)) {
      ds.push({ k: '8-1-1', ten: 'Thẻ chi phí', on: true })
    }

    const sc812 = mod?.screens.find(x => x.slug === '8-1-2' || x.code === '8.1.2')
    if (sc812 && hienMan(sc812, s.goi, s.cheDo, s)) {
      ds.push({ k: '8-1-2', ten: 'Tăng, giảm CCDC', onClick: () => nav('/app/ccdc/8-1-2') })
    }

    const sc813 = mod?.screens.find(x => x.slug === '8-1-3' || x.code === '8.1.3')
    if (sc813 && hienMan(sc813, s.goi, s.cheDo, s)) {
      ds.push({ k: '8-1-3', ten: 'Kiểm kê CCDC', onClick: () => nav('/app/ccdc/8-1-3') })
    }

    if (!anNgoaiGoi(s.goi)) {
      ds.push({ k: 'bctd', ten: 'Báo cáo theo dõi', onClick: () => setMoTheoDoi(true) })
    }

    return ds
  }, [mod, s.goi, s.cheDo, s, nav])

  const hangTabs = tabs.length > 1 ? (
    <div className="m-ds-hang-tabs" role="tablist">
      {tabs.map(t => (
        <button
          key={t.k}
          type="button"
          role="tab"
          aria-selected={Boolean(t.on)}
          className={`m-tab-chu${t.on ? ' on' : ''}`}
          onClick={t.onClick}
        >
          {t.ten}
        </button>
      ))}
    </div>
  ) : undefined

  const handleBatDauThem = () => {
    setTheSuaId(null)
    setFtLoai('Chi phí trả trước')
    setFtTen('')
    setFtGt('24000000')
    setFtKy('12')
    setFtNgay('01/10/2026')
    setFtNgayPb('01/10/2026')
    setDaChonNgayPb(false)
    if (!cnChon) {
      setMoChonCn(true)
    } else {
      setCnGhiTang(cnChon.ten)
      setMoGhiTang(true)
    }
  }

  const handleChonCnDeThem = (ten: string) => {
    setCnGhiTang(ten)
    setMoChonCn(false)
    setMoGhiTang(true)
  }

  const valGt = Number(ftGt) || 0
  const valKy = Number(ftKy) || 12
  const moiThang = valKy > 0 ? Math.round(valGt / valKy) : 0

  const handleLuuGhiTang = () => {
    if (!ftTen.trim()) {
      toast('Vui lòng nhập tên mục chi phí / CCDC')
      return
    }
    if (valGt <= 0) {
      toast('Số tiền phải lớn hơn 0')
      return
    }
    if (valKy <= 0) {
      toast('Số tháng phân bổ phải lớn hơn 0')
      return
    }
    if (theSuaId) {
      setTheList(prev => prev.map(t => t.soThe === theSuaId ? {
        ...t,
        loai: ftLoai,
        ten: ftTen.trim(),
        gt: valGt,
        ky: valKy,
        ngay: ftNgay,
        ngayPb: ftNgayPb,
        cn: cnGhiTang || t.cn,
        dong: t.dong?.length ? t.dong.map((d, i) => i === 0 ? { ...d, ten: ftTen.trim(), gt: valGt, ky: valKy, dg: valGt, ngayPb: ftNgayPb } : d) : [{ ma: 'CPTT.0001', ten: ftTen.trim(), gt: valGt, ky: valKy, sl: 1, dg: valGt, ngayPb: ftNgayPb }],
      } : t))
      toast(`Đã cập nhật thẻ ${theSuaId}`)
      setTheSuaId(null)
      setMoGhiTang(false)
      setFtTen('')
      setDaChonNgayPb(false)
      return
    }
    const sttMoi = theList.length + 1
    const soTheMoi = soTheKeTiep(theList.map(t => t.soThe), 'the', ftNgay) || `TPB2610-${String(sttMoi).padStart(4, '0')}`
    const theMoi: TheItem = {
      soThe: soTheMoi,
      loai: ftLoai,
      ngay: ftNgay,
      ngayPb: ftNgayPb,
      ten: ftTen.trim(),
      cn: cnGhiTang || 'Phố Mây Lê Lợi',
      gt: valGt,
      ky: valKy,
      soCt: tuPhieu?.soCt || `PC2610-${String(sttMoi + 200).padStart(4, '0')}`,
      ngayCt: tuPhieu?.ngayCt || ftNgay,
      ghiChuCt: tuPhieu?.ghiChuCt || ftTen.trim(),
      _goc: tuPhieu?._goc || '',
      dong: [{ ma: `CPTT.${String(sttMoi).padStart(4, '0')}`, ten: ftTen.trim(), gt: valGt, ky: valKy, sl: 1, dg: valGt, ngayPb: ftNgayPb }],
    }
    setTheList(prev => [theMoi, ...prev])
    theTaoPhien.unshift(theMoi)
    toast(`Đã ghi tăng thẻ ${soTheMoi}`)
    setMoGhiTang(false)
    setFtTen('')
    setDaChonNgayPb(false)
    // T419: thẻ tạo từ phiếu chi thì ghi số thẻ vào phiếu gốc (phiếu hiện Thẻ chi phí) rồi về lại phiếu
    if (tuPhieu?._goc) {
      const m = tuPhieu._goc.match(/^\/app\/(.+)\/([^/]+)$/)
      if (m) suaPhieu(m[1], m[2], { _theCp: [soTheMoi] })
      nav(tuPhieu._goc, { replace: true })
    }
  }

  return (
    <>
      <MDanhSach
        rows={listLoc}
        timTheo={(r, q) => {
          const text = `${r.soThe} ${r.ten} ${r.cn} ${r.loai}`.toLowerCase()
          return text.includes(q.toLowerCase())
        }}
        timPlaceholder="Tìm theo số thẻ, tên, cửa hàng..."
        chips={chips}
        chipChon={chipTT}
        onChipChon={setChipTT}
        hangTabs={hangTabs}
        tomTat={
          <span>
            {listLoc.length} thẻ chi phí · {money(tongTien)} đ
          </span>
        }
        onThem={handleBatDauThem}
        nhanThem="+ Ghi tăng"
        the={(r, i) => {
          const soKy = r.dong?.[0]?.ky ?? r.ky ?? 12
          return (
            <div
              key={`${r.soThe}_${i}`}
              className="m-the-ct"
              onClick={() => { setTheXem(r); setTabThe('chitiet') }}
              role="button"
              tabIndex={0}
            >
              {/* Dòng 1: tên thẻ đậm, nhãn trạng thái */}
              <div className="m-the-ct-hang1">
                <span className="m-the-ct-so">{r.soThe} - {r.ten}</span>
                <span className={`m-the-ct-tag ${r.ttCls}`}>{r.ttNhan}</span>
              </div>
              {/* Dòng 2: cửa hàng */}
              <div className="m-the-ct-hang2">
                <span className="m-the-ct-dt">{r.cn}</span>
              </div>
              <div className="m-the-ct-vach" />
              {/* Dòng 3: kỳ phân bổ, còn lại, số tiền đậm bên phải */}
              <div className="m-the-ct-hang3">
                <span className="m-the-ct-ngay-hang">
                  {soKy} tháng · Còn {money(r.con)}
                </span>
                <span className="m-the-ct-tien">{money(r.gt)} đ</span>
              </div>
            </div>
          )
        }}
      />

      {/* ── TẤM CHỌN CỬA HÀNG KÉO LÊN TỪ DƯỚI (Item 5 spec) ── */}
      {moChonCn && (
        <div className="m-loc-overlay" onClick={() => setMoChonCn(false)}>
          <div className="m-loc-tam" onClick={e => e.stopPropagation()}>
            <div className="m-loc-dau">
              <h2 className="m-loc-tieu-de">Chọn cửa hàng ghi tăng</h2>
              <button
                type="button"
                className="m-loc-btn-dong"
                onClick={() => setMoChonCn(false)}
                aria-label="Đóng"
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>
            <div className="m-loc-than">
              <p style={{ margin: '0 0 12px', fontSize: 14, color: '#666' }}>
                Bạn đang xem tất cả cửa hàng. Chọn cửa hàng để lập thẻ chi phí mới:
              </p>
              <div className="m-loc-ds-muc">
                {CUA_HANG.map(c => (
                  <div
                    key={c.id}
                    className="m-loc-muc-dong"
                    onClick={() => handleChonCnDeThem(c.ten)}
                  >
                    <span style={{ marginRight: 10, color: '#0066cc', display: 'inline-flex' }}>
                      <Icon n="cuahang" className="ic sm" />
                    </span>
                    <span className="m-loc-muc-ten">{c.ten}</span>
                    <span style={{ color: '#bbb', display: 'inline-flex' }}>
                      <Icon n="chevr" className="ic sm" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="m-loc-day">
              <button
                type="button"
                className="m-loc-btn-reset"
                onClick={() => setMoChonCn(false)}
              >
                Huỷ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MÀN GHI TĂNG / SỬA THẺ THEO MẪU MÀN XEM (T415) ── */}
      {moGhiTang && (() => {
        const theSuaCard = theSuaId ? theList.find(t => t.soThe === theSuaId) : null
        const soCtHien = theSuaCard?.soCt || tuPhieu?.soCt
        const ngayCtHien = theSuaCard?.ngayCt || tuPhieu?.ngayCt || ftNgay
        const ghiChuCtHien = theSuaCard?.ghiChuCt || tuPhieu?.ghiChuCt || ftTen

        return (
          <div className="m-pb-man">
            <header className="m-pb-thanh-dau">
              <button
                type="button"
                className="m-pb-btn-back"
                onClick={() => { setMoGhiTang(false); setTheSuaId(null); setDaChonNgayPb(false); if (tuPhieu?._goc && !theSuaId) nav(tuPhieu._goc, { replace: true }) }}
                aria-label="Quay lại"
              >
                <Icon n="back" className="ic" />
              </button>
              <h1 className="m-pb-tieu-de">{theSuaId ? `Sửa thẻ ${theSuaId}` : 'Ghi tăng thẻ chi phí'}</h1>
              <span className="m-pb-thanh-dau-phai" />
            </header>

            <div className="m-pb-noi-dung">
              {/* Thẻ 1: Thông tin chung */}
              <div className="m-pb-the m-pb-the-gon">
                {/* Cửa hàng */}
                <div className="m-pb-dong">
                  <span className="m-gt-nhan">
                    <Icon n="cuahang" className="ic sm m-lp-dong-ic" />
                    Cửa hàng
                  </span>
                  <span className="m-gt-tri">{cnGhiTang || 'Phố Mây Lê Lợi'}</span>
                </div>

                {/* Loại thẻ */}
                <div
                  className="m-pb-dong m-gt-bam"
                  onClick={() => setMoChonLoai(true)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="m-gt-nhan">
                    <Icon n="layers" className="ic sm m-lp-dong-ic" kieu="net" />
                    Loại thẻ
                  </span>
                  <span className="m-gt-tri">
                    <span>{ftLoai}</span>
                    <Icon n="chevr" className="ic sm" kieu="net" />
                  </span>
                </div>

                {/* Tên mục chi phí / CCDC */}
                <div className="m-pb-dong m-gt-dong-ten">
                  <span className="m-gt-nhan">
                    <Icon n="tool" className="ic sm m-lp-dong-ic" kieu="net" />
                    Tên mục chi phí / CCDC <b className="m-gt-sao">*</b>
                  </span>
                  <input
                    type="text"
                    className="m-gt-inp-ten"
                    placeholder="Vd: Bộ nồi inox 5 món"
                    value={ftTen}
                    onChange={e => setFtTen(e.target.value)}
                  />
                </div>

                {/* Số tiền */}
                <div className="m-pb-dong">
                  <span className="m-gt-nhan">
                    <Icon n="wallet" className="ic sm m-lp-dong-ic" kieu="net" />
                    Số tiền <b className="m-gt-sao">*</b>
                  </span>
                  <div className="m-gt-tri">
                    <input
                      type="text"
                      className="m-gt-inp num"
                      placeholder="0"
                      value={ftGt ? money(Number(ftGt) || 0) : ''}
                      onChange={e => setFtGt(e.target.value.replace(/\D/g, ''))}
                    />
                    <span className="m-gt-donvi">đ</span>
                  </div>
                </div>
              </div>

              {/* Thẻ 2: THÔNG TIN THẺ */}
              <div className="m-pb-nhom">THÔNG TIN THẺ</div>
              <div className="m-pb-the m-pb-the-gon">
                {/* Ngày ghi tăng */}
                <div
                  className="m-pb-dong m-gt-bam"
                  onClick={() => setMoLichGt(true)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="m-gt-nhan">
                    <Icon n="clock" className="ic sm m-lp-dong-ic" kieu="net" />
                    Ngày ghi tăng
                  </span>
                  <span className="m-gt-tri">
                    <span>{ftNgay}</span>
                    <Icon n="chevr" className="ic sm" kieu="net" />
                  </span>
                </div>

                {/* Bắt đầu phân bổ */}
                <div
                  className="m-pb-dong m-gt-bam"
                  onClick={() => setMoLichPb(true)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="m-gt-nhan">
                    <Icon n="calendar" className="ic sm m-lp-dong-ic" kieu="net" />
                    Bắt đầu phân bổ
                  </span>
                  <span className="m-gt-tri">
                    <span>{ftNgayPb}</span>
                    <Icon n="chevr" className="ic sm" kieu="net" />
                  </span>
                </div>

                {/* Số tháng phân bổ */}
                <div className="m-pb-dong">
                  <span className="m-gt-nhan">
                    <Icon n="clock" className="ic sm m-lp-dong-ic" kieu="net" />
                    Số tháng phân bổ <b className="m-gt-sao">*</b>
                  </span>
                  <div className="m-gt-tri">
                    <input
                      type="text"
                      className="m-gt-inp num"
                      placeholder="12"
                      value={ftKy}
                      onChange={e => setFtKy(e.target.value.replace(/\D/g, ''))}
                      style={{ maxWidth: 60 }}
                    />
                    <span className="m-gt-donvi">tháng</span>
                  </div>
                </div>

                {/* Mỗi tháng phân bổ (tính sẵn) */}
                <div className="m-pb-dong">
                  <span className="m-gt-nhan">
                    <Icon n="phanbo" className="ic sm m-lp-dong-ic" kieu="net" />
                    Mỗi tháng phân bổ
                  </span>
                  <span className="m-gt-tri m-gt-tinh">
                    {money(moiThang)} đ
                  </span>
                </div>
              </div>

              {/* Thẻ 3: THÔNG TIN MUA (nếu có chứng từ gốc) */}
              {soCtHien && (
                <>
                  <div className="m-pb-nhom">THÔNG TIN MUA</div>
                  <div className="m-pb-the m-pb-the-gon">
                    <div className="m-pb-dong">
                      <span className="n">Số chứng từ</span>
                      {theSuaCard?._goc ? (
                        <Link to={theSuaCard._goc} className="m-pb-link-so">
                          {soCtHien}
                        </Link>
                      ) : (
                        <span className="g">{soCtHien}</span>
                      )}
                    </div>
                    <div className="m-pb-dong">
                      <span className="n">Ngày chứng từ</span>
                      <span className="g">{ngayCtHien}</span>
                    </div>
                    <div className="m-pb-dong">
                      <span className="n">Ghi chú</span>
                      <span className="g" style={{ fontWeight: 500 }}>
                        {ghiChuCtHien}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <MChon
                mo={moChonLoai}
                onDong={() => setMoChonLoai(false)}
                tieuDe="Loại thẻ"
                ds={Object.keys(LOAI_THE).map(k => ({ k, ten: k }))}
                chon={ftLoai}
                onChon={k => { setFtLoai(k); setMoChonLoai(false) }}
              />

              {moLichPb && (
                <LichDon
                  value={ftNgayPb}
                  onChange={v => {
                    setFtNgayPb(v)
                    setDaChonNgayPb(true)
                  }}
                  onDong={() => setMoLichPb(false)}
                />
              )}

              {moLichGt && (
                <LichDon
                  value={ftNgay}
                  onChange={v => {
                    setFtNgay(v)
                    if (!daChonNgayPb) {
                      setFtNgayPb(v)
                    }
                  }}
                  onDong={() => setMoLichGt(false)}
                />
              )}
            </div>

            <div className="m-pb-day">
              <button
                type="button"
                className="m-pb-btn-huy"
                onClick={() => { setMoGhiTang(false); setTheSuaId(null); setDaChonNgayPb(false); if (tuPhieu?._goc && !theSuaId) nav(tuPhieu._goc, { replace: true }) }}
              >
                Huỷ
              </button>
              <button
                type="button"
                className="m-pb-btn-luu"
                onClick={handleLuuGhiTang}
              >
                Lưu
              </button>
            </div>
          </div>
        )
      })()}

      {/* ── MÀN CHI TIẾT THẺ PHÂN BỔ MẪU A (T365) ── */}
      {theXem && (() => {
        const tongKy = theXem.ky || theXem.dong?.[0]?.ky || 12
        const gtTong = theXem.gt || 0
        const daTong = theXem.da !== undefined ? theXem.da : 0
        const conTong = theXem.con !== undefined ? theXem.con : Math.max(0, gtTong - daTong)
        const moiKy = tongKy > 0 ? Math.round(gtTong / tongKy) : 0
        const daKy = moiKy > 0 ? Math.min(tongKy, Math.round(daTong / moiKy)) : 0
        const phanTram = gtTong > 0 ? Math.min(100, Math.round((daTong / gtTong) * 100)) : 0
        const laHet = conTong <= 0 || theXem.het || theXem.ttNhan === 'Hết phân bổ'
        const ngayBdThe = theXem.ngayPb || theXem.dong?.[0]?.ngayPb || theXem.ngay || '01/01/2026'

        const mMatch = ngayBdThe.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
        const dsKy = mMatch && tongKy > 0 ? Array.from({ length: tongKy }, (_, i) => {
          const cuoi = new Date(+mMatch[3], +mMatch[2] - 1 + i + 1, 0)
          const dStr = `${String(cuoi.getDate()).padStart(2, '0')}/${String(cuoi.getMonth() + 1).padStart(2, '0')}/${cuoi.getFullYear()}`
          const kySo = cuoi.getFullYear() * 100 + (cuoi.getMonth() + 1)
          const tien = i < tongKy - 1 ? moiKy : gtTong - moiKy * (tongKy - 1)
          const daPb = kySo <= 202610
          return { kyIdx: i + 1, ngay: dStr, tien, daPb }
        }) : []

        const handleBatDauSua = () => {
          setTheSuaId(theXem.soThe)
          setFtLoai(theXem.loai)
          setFtTen(theXem.ten)
          setFtGt(String(theXem.gt))
          setFtKy(String(tongKy))
          setFtNgay(theXem.ngay)
          setFtNgayPb(ngayBdThe)
          setDaChonNgayPb(true)
          setCnGhiTang(theXem.cn)
          setTheXem(null)
          setMoGhiTang(true)
        }

        const handleSaoChepThe = () => {
          const sttMoi = theList.length + 1
          const soTheMoi = soTheKeTiep(theList.map(t => t.soThe), 'the', theXem.ngay) || `TPB2610-${String(sttMoi).padStart(4, '0')}`
          const theMoi = {
            ...theXem,
            soThe: soTheMoi,
            ten: `${theXem.ten} (Sao chép)`,
            da: 0,
            con: theXem.gt,
            het: false,
            ttNhan: 'Đang phân bổ',
            ttCls: 'm-the-tag-dang',
            dong: (theXem.dong || []).map(d => ({ ...d, da: 0, kyDa: 0 })),
          }
          setTheList(prev => [theMoi, ...prev])
          toast(`Đã sao chép thẻ ${soTheMoi}`)
          setMoMenuMore(false)
          setTheXem(theMoi)
        }

        const handleXoaThe = () => {
          setTheList(prev => prev.filter(t => t.soThe !== theXem.soThe))
          toast(`Đã xoá thẻ ${theXem.soThe}`)
          setMoMenuMore(false)
          setTheXem(null)
        }

        return (
          <div className="m-pb-man">
            {/* Thanh đầu: nút back, tiêu đề là số thẻ */}
            <header className="m-pb-thanh-dau">
              <button
                type="button"
                className="m-pb-btn-back"
                onClick={() => { setTheXem(null); if (tuLink) nav(-1) }}
                aria-label="Quay lại"
              >
                <Icon n="back" className="ic" />
              </button>
              <h1 className="m-pb-tieu-de">{theXem.soThe}</h1>
              <span className="m-pb-thanh-dau-phai" />
            </header>

            <div className="m-pb-noi-dung">
              {/* Thẻ tổng quan */}
              <div className="m-pb-the m-pb-the-tong-quan">
                <div className="m-pb-hang-chip">
                  <span className="m-pb-chip-loai">{theXem.loai}</span>
                  <span className={`m-pb-chip-tt ${laHet ? 'het' : 'dang'}`}>
                    {laHet ? 'Hết phân bổ' : 'Đang phân bổ'}
                  </span>
                </div>
                <div className="m-pb-ten-the">{theXem.ten}</div>
                <div className="m-pb-dong-cn">
                  <Icon n="cuahang" className="ic sm" />
                  <span>{theXem.cn}</span>
                </div>
                <div>
                  <div className="m-pb-nhan-gt">Giá trị thẻ</div>
                  <div className="m-pb-so-gt">{money(gtTong)} đ</div>
                </div>
                <div>
                  <div className="m-pb-thanh-tien-do-khung">
                    <div className="m-pb-thanh-tien-do-ruot" style={{ width: `${phanTram}%` }} />
                  </div>
                  <div className="m-pb-tien-do-chu">
                    <span>Đã phân bổ {daKy}/{tongKy} kỳ</span>
                    <span>{phanTram}%</span>
                  </div>
                </div>
                <div className="m-pb-luoi-stat">
                  <div className="m-pb-o-stat da">
                    <div className="m-pb-o-stat-nhan">Đã phân bổ</div>
                    <div className="m-pb-o-stat-so da">{money(daTong)} đ</div>
                  </div>
                  <div className="m-pb-o-stat con">
                    <div className="m-pb-o-stat-nhan">Còn lại</div>
                    <div className="m-pb-o-stat-so con">{money(conTong)} đ</div>
                  </div>
                </div>
              </div>

              {/* Tab 3 nút dạng segmented */}
              <div className="m-pb-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tabThe === 'chitiet'}
                  className={`m-pb-tab-btn${tabThe === 'chitiet' ? ' on' : ''}`}
                  onClick={() => setTabThe('chitiet')}
                >
                  Chi tiết
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tabThe === 'lichpb'}
                  className={`m-pb-tab-btn${tabThe === 'lichpb' ? ' on' : ''}`}
                  onClick={() => setTabThe('lichpb')}
                >
                  Lịch phân bổ
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tabThe === 'lichsu'}
                  className={`m-pb-tab-btn${tabThe === 'lichsu' ? ' on' : ''}`}
                  onClick={() => setTabThe('lichsu')}
                >
                  Lịch sử
                </button>
              </div>

              {/* Tab 1: Chi tiết */}
              {tabThe === 'chitiet' && (
                <>
                  <div className="m-pb-nhom">THÔNG TIN THẺ</div>
                  <div className="m-pb-the m-pb-the-gon">
                    <div className="m-pb-dong">
                      <span className="n">Ngày ghi tăng</span>
                      <span className="g">{theXem.ngay}</span>
                    </div>
                    <div className="m-pb-dong">
                      <span className="n">Bắt đầu phân bổ</span>
                      <span className="g">{ngayBdThe}</span>
                    </div>
                    <div className="m-pb-dong">
                      <span className="n">Số tháng phân bổ</span>
                      <span className="g">{tongKy} tháng</span>
                    </div>
                    <div className="m-pb-dong">
                      <span className="n">Phân bổ mỗi kỳ</span>
                      <span className="g">{money(moiKy)} đ</span>
                    </div>
                  </div>

                  <div className="m-pb-nhom">MỤC PHÂN BỔ ({theXem.dong?.length || 1})</div>
                  {(theXem.dong && theXem.dong.length > 0 ? theXem.dong : [{ ma: theXem.soThe, ten: theXem.ten, gt: theXem.gt, sl: 1, dg: theXem.gt, dvt: 'Bộ' }]).map((d: DongPb, idx: number) => (
                    <div key={idx} className="m-pb-the m-pb-muc-dong">
                      <div className="m-pb-muc-hang1">
                        <span className="m-pb-muc-ten">
                          {d.ma && <span className="m-pb-muc-ma">{d.ma}</span>}
                          {d.ten || theXem.ten}
                        </span>
                      </div>
                      <div className="m-pb-muc-hang2">
                        <span>{Number(d.sl) || 1} {d.dvt || 'Bộ'} × {money(Number(d.dg) || Number(d.gt) || 0)}</span>
                        <b className="m-pb-muc-tong">{money(Number(d.gt) || 0)} đ</b>
                      </div>
                    </div>
                  ))}

                  <div className="m-pb-nhom">THÔNG TIN MUA</div>
                  <div className="m-pb-the m-pb-the-gon">
                    <div className="m-pb-dong">
                      <span className="n">Số chứng từ</span>
                      {theXem._goc ? (
                        <Link to={theXem._goc} className="m-pb-link-so">
                          {theXem.soCt}
                        </Link>
                      ) : (
                        <span className="g">{theXem.soCt || '—'}</span>
                      )}
                    </div>
                    <div className="m-pb-dong">
                      <span className="n">Ngày chứng từ</span>
                      <span className="g">{theXem.ngayCt || theXem.ngay}</span>
                    </div>
                    <div className="m-pb-dong">
                      <span className="n">Ghi chú</span>
                      <span className="g" style={{ fontWeight: 500 }}>
                        {theXem.ghiChuCt || theXem.ten}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2: Lịch phân bổ */}
              {tabThe === 'lichpb' && (
                <>
                  <div className="m-pb-nhom">CÁC KỲ PHÂN BỔ ({dsKy.length})</div>
                  <div className="m-pb-the m-pb-the-gon">
                    {dsKy.map(k => (
                      <div key={k.kyIdx} className="m-pb-ky-dong">
                        <div>
                          <div className="m-pb-ky-ten">Kỳ {k.kyIdx}</div>
                          <div className="m-pb-ky-ngay">{k.ngay}</div>
                        </div>
                        <div className="m-pb-ky-phai">
                          <div className="m-pb-ky-tien">{money(k.tien)} đ</div>
                          <span className={`m-pb-ky-tag ${k.daPb ? 'da' : 'chua'}`}>
                            {k.daPb ? 'Đã phân bổ' : 'Chưa phân bổ'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Tab 3: Lịch sử */}
              {tabThe === 'lichsu' && (
                <>
                  <div className="m-pb-nhom">NHẬT KÝ THAO TÁC</div>
                  <div className="m-pb-the m-pb-the-gon">
                    <div className="m-pb-ls-dong">
                      <div className="m-pb-ls-tren">{theXem.ngay} 08:30 · Trần Thu Hà</div>
                      <div className="m-pb-ls-viec">Ghi tăng thẻ chi phí</div>
                    </div>
                    {daKy > 0 && (
                      <div className="m-pb-ls-dong">
                        <div className="m-pb-ls-tren">30/09/2026 17:00 · Hệ thống</div>
                        <div className="m-pb-ls-viec">Phân bổ chi phí tự động kỳ 09/2026</div>
                      </div>
                    )}
                    {theXem.soCt && (
                      <div className="m-pb-ls-dong">
                        <div className="m-pb-ls-tren">{theXem.ngayCt || theXem.ngay} 10:15 · Trần Thu Hà</div>
                        <div className="m-pb-ls-viec">Tạo từ chứng từ {theXem.soCt}</div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Thanh dưới: nút "..." và nút cam "Sửa thẻ" */}
            <div className="m-pb-day">
              <button
                type="button"
                className="m-pb-btn-more"
                aria-label="Thao tác khác"
                onClick={() => setMoMenuMore(true)}
              >
                <Icon n="more" className="ic sm" />
              </button>
              <button
                type="button"
                className="m-pb-btn-sua"
                onClick={handleBatDauSua}
              >
                Sửa thẻ
              </button>
            </div>

            {/* Menu thao tác khác */}
            {moMenuMore && (
              <div className="m-loc-overlay" onClick={() => setMoMenuMore(false)}>
                <div className="m-loc-tam" onClick={e => e.stopPropagation()}>
                  <div className="m-loc-dau">
                    <h2 className="m-loc-tieu-de">Thao tác thẻ {theXem.soThe}</h2>
                    <button
                      type="button"
                      className="m-loc-btn-dong"
                      onClick={() => setMoMenuMore(false)}
                      aria-label="Đóng"
                    >
                      <Icon n="x" className="ic sm" />
                    </button>
                  </div>
                  <div className="m-loc-than">
                    <div className="m-loc-ds-muc">
                      <div className="m-loc-muc-dong" onClick={handleSaoChepThe}>
                        <span style={{ marginRight: 10, color: '#0066cc', display: 'inline-flex' }}>
                          <Icon n="copy" className="ic sm" />
                        </span>
                        <span className="m-loc-muc-ten">Sao chép thẻ này</span>
                      </div>
                      <div className="m-loc-muc-dong" onClick={handleXoaThe}>
                        <span style={{ marginRight: 10, color: '#d0650a', display: 'inline-flex' }}>
                          <Icon n="trash" className="ic sm" />
                        </span>
                        <span className="m-loc-muc-ten" style={{ color: '#d0650a' }}>Xoá thẻ này</span>
                      </div>
                    </div>
                  </div>
                  <div className="m-loc-day">
                    <button
                      type="button"
                      className="m-loc-btn-reset"
                      onClick={() => setMoMenuMore(false)}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* Sheet Báo cáo theo dõi */}
      <MBaoCaoTheoDoi
        mo={moTheoDoi}
        onDong={() => setMoTheoDoi(false)}
        modKey="ccdc"
      />
    </>
  )
}
