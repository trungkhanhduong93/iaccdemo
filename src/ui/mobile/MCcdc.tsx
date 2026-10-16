import { useMemo, useState, type FC } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Row, ScreenProps } from '../../modules/types'
import { cuaHangHienTai, useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { money, fold } from '../format'
import { Icon } from '../Icon'
import { MDanhSach } from './MDanhSach'
import { MBaoCaoTheoDoi } from './MBaoCaoTheoDoi'
import { MChon } from './MChon'
import {
  daPhanBoToiKy,
  LOAI_THE,
  type DongPb,
} from '../../modules/ccdc/the-phan-bo'

// Dữ liệu thẻ mẫu ccdc
const THE_MAU_BASE = [
  { soThe: 'TPB2601-0001', loai: 'Công cụ dụng cụ', ngay: '05/01/2026', ten: 'Bộ nồi inox 50 lít', cn: 'Phố Mây Lê Lợi', gt: 24_600_000, ky: 12, soCt: 'PC2610-0250', ngayCt: '03/10/2026', ghiChuCt: 'Chi mua rau, củ tại chợ', _goc: '/app/tien/2-1-1/chi-3', dong: [{ ma: 'CC001', ten: 'Bộ nồi inox 50 lít', gt: 24_600_000, ky: 12, sl: 1, dg: 24_600_000, ngayPb: '05/01/2026' }] },
  { soThe: 'TPB2606-0002', loai: 'Công cụ dụng cụ', ngay: '20/06/2026', ten: 'Bàn ghế gỗ khu ngoài trời', cn: 'Phố Mây Thảo Điền', gt: 86_400_000, ky: 24, soCt: 'PC2609-0240', ngayCt: '29/09/2026', ghiChuCt: 'Chi mua rau, củ tại chợ', _goc: '/app/tien/2-1-1/chi-6', dong: [{ ma: 'CC002', ten: 'Bàn ghế gỗ khu ngoài trời', gt: 86_400_000, ky: 24, sl: 1, dg: 86_400_000, ngayPb: '20/06/2026' }] },
  { soThe: 'TPB2608-0003', loai: 'Công cụ dụng cụ', ngay: '01/08/2026', ten: 'Máy POS cầm tay và Máy xay', cn: 'Phố Mây Nguyễn Tri Phương', gt: 50_700_000, ky: 18, soCt: 'UNC2610-0256', ngayCt: '05/10/2026', ghiChuCt: 'Trả tiền nhà cung cấp thịt bò', _goc: '/app/tien/2-1-1/unc-1', dong: [{ ma: 'CC003', ten: 'Máy POS cầm tay', gt: 31_800_000, ky: 18, sl: 1, dg: 31_800_000, ngayPb: '01/08/2026' }, { ma: 'CC004', ten: 'Máy xay sinh tố công nghiệp', gt: 18_900_000, ky: 12, sl: 1, dg: 18_900_000, ngayPb: '01/08/2026' }] },
  { soThe: 'TPB2607-0004', loai: 'Chi phí trả trước', ngay: '01/07/2026', ten: 'Tiền thuê mặt bằng trả trước 6 tháng', cn: 'Phố Mây Lê Lợi', gt: 594_000_000, ky: 6, soCt: 'UNC2609-0236', ngayCt: '25/09/2026', ghiChuCt: 'Trả tiền thuê mặt bằng tháng 10', _goc: '/app/tien/2-1-1/unc-8', dong: [{ ma: 'TT001', ten: 'Tiền thuê mặt bằng trả trước 6 tháng', gt: 594_000_000, ky: 6, sl: 1, dg: 594_000_000, ngayPb: '01/07/2026' }] },
  { soThe: 'TPB2601-0005', loai: 'Chi phí trả trước', ngay: '01/01/2026', ten: 'Phí bản quyền phần mềm năm 2026', cn: 'Phố Mây Thảo Điền', gt: 18_000_000, ky: 12, soCt: 'UNC2609-0237', ngayCt: '26/09/2026', ghiChuCt: 'Trả tiền nhà cung cấp thịt bò', _goc: '/app/tien/2-1-1/unc-7', dong: [{ ma: 'TT002', ten: 'Phí bản quyền phần mềm năm 2026', gt: 18_000_000, ky: 12, sl: 1, dg: 18_000_000, ngayPb: '01/01/2026' }] },
  { soThe: 'TPB2602-0006', loai: 'Chi phí trả trước', ngay: '01/02/2026', ten: 'Bảo hiểm cháy nổ 6 tháng', cn: 'Phố Mây Nguyễn Tri Phương', gt: 12_000_000, ky: 6, soCt: 'PC2609-0236', ngayCt: '26/09/2026', ghiChuCt: 'Chi tiền gas tháng 10', _goc: '/app/tien/2-1-1/chi-8', dong: [{ ma: 'TT003', ten: 'Bảo hiểm cháy nổ 6 tháng', gt: 12_000_000, ky: 6, sl: 1, dg: 12_000_000, ngayPb: '01/02/2026' }] },
  { soThe: 'TPB2611-0007', loai: 'Công cụ dụng cụ', ngay: '05/11/2026', ten: 'Dao thớt bếp trọn bộ', cn: 'Phố Mây Lê Lợi', gt: 9_600_000, ky: 12, soCt: 'PC2610-0259', ngayCt: '07/10/2026', ghiChuCt: 'Chi tiền điện tháng 9', _goc: '/app/tien/2-1-1/chi-0', dong: [{ ma: 'CC005', ten: 'Dao thớt bếp trọn bộ', gt: 9_600_000, ky: 12, sl: 1, dg: 9_600_000, ngayPb: '05/11/2026' }] },
  { soThe: 'TPB2609-0008', loai: 'Chi phí trả trước', ngay: '01/09/2026', ten: 'Tiền thuê kho lạnh 6 tháng', cn: 'Phố Mây Thảo Điền', gt: 92_400_000, ky: 12, soCt: 'UNC2610-0252', ngayCt: '03/10/2026', ghiChuCt: 'Trả tiền thuê mặt bằng tháng 10', _goc: '/app/tien/2-1-1/unc-2', dong: [{ ma: 'CPTT.0001', ten: 'Tiền thuê kho lạnh 6 tháng', gt: 54_000_000, ky: 6, sl: 1, dg: 54_000_000, ngayPb: '01/09/2026' }] },
  { soThe: 'TPB2609-0009', loai: 'Công cụ dụng cụ', ngay: '15/09/2026', ten: 'Ly thuỷ tinh 300ml và tủ mát', cn: 'Phố Mây Nguyễn Tri Phương', gt: 40_500_000, ky: 12, soCt: 'PC2609-0243', ngayCt: '30/09/2026', ghiChuCt: 'Chi tiền gas tháng 10', _goc: '/app/tien/2-1-1/chi-5', dong: [{ ma: 'CC006', ten: 'Ly thuỷ tinh 300ml', gt: 7_200_000, ky: 12, sl: 240, dg: 30_000, ngayPb: '15/09/2026' }, { ma: 'CC007', ten: 'Tủ mát 2 cánh', gt: 28_500_000, ky: 24, sl: 1, dg: 28_500_000, ngayPb: '15/09/2026' }] },
  { soThe: 'TPB2610-0010', loai: 'Tài sản cố định', ngay: '01/10/2026', ten: 'Máy rửa chén công nghiệp', cn: 'Phố Mây Lê Lợi', gt: 310_000_000, ky: 60, soCt: 'UNC2609-0244', ngayCt: '28/09/2026', ghiChuCt: 'Nộp thuế GTGT tháng 9', _goc: '/app/tien/2-1-1/unc-5', dong: [{ ma: 'TSCD.0001', ten: 'Máy rửa chén công nghiệp', gt: 186_000_000, ky: 60, sl: 1, dg: 186_000_000, ngayPb: '01/10/2026' }, { ma: 'TSCD.0002', ten: 'Hệ thống hút khói bếp', gt: 124_000_000, ky: 60, sl: 1, dg: 124_000_000, ngayPb: '01/10/2026' }] },
  { soThe: 'TPB2610-0011', loai: 'Chi phí trả trước', ngay: '07/10/2026', ten: 'Tiền nhà 6 tháng', cn: 'Phố Mây Lê Lợi', gt: 72_000_000, ky: 6, soCt: 'PC2610-0261', ngayCt: '07/10/2026', ghiChuCt: 'Tiền nhà 6 tháng', _goc: '/app/tien/2-1-1/chi-cpb', dong: [{ ma: 'CPTT.0004', ten: 'Tiền nhà 6 tháng', gt: 72_000_000, ky: 6, sl: 1, dg: 72_000_000, ngayPb: '07/10/2026' }] },
]

type TheItem = (typeof THE_MAU_BASE)[0] & {
  da?: number
  con?: number
  ttCls?: string
  ttNhan?: string
}

export const MCcdc: FC<ScreenProps> = ({ sc, mod }) => {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const cnChon = cuaHangHienTai(s)

  const [theList, setTheList] = useState(THE_MAU_BASE)
  const [theXem, setTheXem] = useState<TheItem | null>(null)
  const [moChonCn, setMoChonCn] = useState(false)
  const [moGhiTang, setMoGhiTang] = useState(false)
  const [cnGhiTang, setCnGhiTang] = useState<string>('')
  const [moTheoDoi, setMoTheoDoi] = useState(false)

  // Form state ghi tăng mới
  const [ftLoai, setFtLoai] = useState('Chi phí trả trước')
  const [moChonLoai, setMoChonLoai] = useState(false)
  const [ftTen, setFtTen] = useState('')
  const [ftGt, setFtGt] = useState('24000000')
  const [ftKy, setFtKy] = useState('12')
  const [ftNgayPb, setFtNgayPb] = useState('01/10/2026')
  const [ftNgay, setFtNgay] = useState('01/10/2026')

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

  // Tabs ngang trên đầu danh sách
  const hangTabs = (
    <div className="m-ds-hang-tabs" role="tablist">
      <button type="button" role="tab" aria-selected={true} className="m-tab-chu on">
        Thẻ chi phí
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={false}
        className="m-tab-chu"
        onClick={() => nav('/app/ccdc/8-1-2')}
      >
        Tăng, giảm CCDC
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={false}
        className="m-tab-chu"
        onClick={() => nav('/app/ccdc/8-1-3')}
      >
        Kiểm kê CCDC
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={false}
        className="m-tab-chu"
        onClick={() => setMoTheoDoi(true)}
      >
        Báo cáo theo dõi
      </button>
    </div>
  )

  const handleBatDauThem = () => {
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

  const handleLuuGhiTang = () => {
    if (!ftTen.trim()) {
      toast('Vui lòng nhập tên thẻ chi phí')
      return
    }
    const valGt = Number(ftGt) || 0
    const valKy = Number(ftKy) || 12
    if (valGt <= 0) {
      toast('Số tiền phải lớn hơn 0')
      return
    }
    const sttMoi = theList.length + 1
    const soTheMoi = `TPB2610-${String(sttMoi).padStart(4, '0')}`
    const theMoi = {
      soThe: soTheMoi,
      loai: ftLoai,
      ngay: ftNgay,
      ten: ftTen,
      cn: cnGhiTang || 'Phố Mây Lê Lợi',
      gt: valGt,
      ky: valKy,
      soCt: `PC2610-${String(sttMoi + 200).padStart(4, '0')}`,
      ngayCt: ftNgay,
      ghiChuCt: ftTen,
      _goc: '',
      dong: [{ ma: `CPTT.${String(sttMoi).padStart(4, '0')}`, ten: ftTen, gt: valGt, ky: valKy, sl: 1, dg: valGt, ngayPb: ftNgayPb }],
    }
    setTheList(prev => [theMoi, ...prev])
    toast(`Đã ghi tăng thẻ ${soTheMoi}`)
    setMoGhiTang(false)
    setFtTen('')
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
              onClick={() => setTheXem(r)}
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
                      <Icon n="store" className="ic sm" />
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

      {/* ── MÀN GHI TĂNG THẺ (DÙNG LỚP m-*, KHÔNG TRÀN NGANG Ở 390PX) ── */}
      {moGhiTang && (
        <div className="m-man-toan-man">
          <header className="m-thanh-tren">
            <div className="m-thanh-tren-trai">
              <button
                type="button"
                className="m-nut-back"
                onClick={() => setMoGhiTang(false)}
                aria-label="Quay lại"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            </div>
            <h1 className="m-thanh-tren-tieu-de">Ghi tăng thẻ chi phí</h1>
          </header>

          <div className="m-than-form">
            <div className="m-form-nhom">
              <div className="m-form-dong-nhan">Cửa hàng</div>
              <div className="m-form-gia-tri-tinh">{cnGhiTang || 'Phố Mây Lê Lợi'}</div>
            </div>

            <div className="m-form-nhom">
              <label className="m-form-dong-nhan">Loại thẻ</label>
              <button type="button" className="m-form-inp m-form-chon" onClick={() => setMoChonLoai(true)}>
                <span>{ftLoai}</span>
                <Icon n="chevd" className="ic sm" />
              </button>
              <MChon
                mo={moChonLoai}
                onDong={() => setMoChonLoai(false)}
                tieuDe="Loại thẻ"
                ds={Object.keys(LOAI_THE).map(k => ({ k, ten: k }))}
                chon={ftLoai}
                onChon={k => { setFtLoai(k); setMoChonLoai(false) }}
              />
            </div>

            <div className="m-form-nhom">
              <label className="m-form-dong-nhan">Tên mục chi phí / CCDC *</label>
              <input
                type="text"
                className="m-form-inp"
                placeholder="Vd: Bộ nồi inox 50 lít"
                value={ftTen}
                onChange={e => setFtTen(e.target.value)}
              />
            </div>

            <div className="m-form-nhom">
              <label className="m-form-dong-nhan">Số tiền (VNĐ) *</label>
              <input
                type="number"
                className="m-form-inp"
                value={ftGt}
                onChange={e => setFtGt(e.target.value)}
              />
            </div>

            <div className="m-form-nhom">
              <label className="m-form-dong-nhan">Số tháng phân bổ *</label>
              <input
                type="number"
                className="m-form-inp"
                value={ftKy}
                onChange={e => setFtKy(e.target.value)}
              />
            </div>

            <div className="m-form-nhom">
              <label className="m-form-dong-nhan">Ngày bắt đầu phân bổ</label>
              <input
                type="text"
                className="m-form-inp"
                value={ftNgayPb}
                placeholder="dd/mm/yyyy"
                onChange={e => setFtNgayPb(e.target.value)}
              />
            </div>

            <div className="m-form-nhom">
              <label className="m-form-dong-nhan">Ngày ghi tăng</label>
              <input
                type="text"
                className="m-form-inp"
                value={ftNgay}
                placeholder="dd/mm/yyyy"
                onChange={e => setFtNgay(e.target.value)}
              />
            </div>
          </div>

          <div className="m-form-day">
            <button
              type="button"
              className="m-loc-btn-reset"
              onClick={() => setMoGhiTang(false)}
            >
              Huỷ
            </button>
            <button
              type="button"
              className="m-loc-btn-apply"
              onClick={handleLuuGhiTang}
            >
              Tạo thẻ
            </button>
          </div>
        </div>
      )}

      {/* ── MÀN CHI TIẾT THẺ (DÙNG LỚP m-*, KHÔNG TRÀN NGANG Ở 390PX) ── */}
      {theXem && (
        <div className="m-man-toan-man">
          <header className="m-thanh-tren">
            <div className="m-thanh-tren-trai">
              <button
                type="button"
                className="m-nut-back"
                onClick={() => setTheXem(null)}
                aria-label="Quay lại"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            </div>
            <h1 className="m-thanh-tren-tieu-de">Chi tiết {theXem.soThe}</h1>
          </header>

          <div className="m-than-form" style={{ paddingBottom: 80 }}>
            {/* Thẻ tổng quan */}
            <div className="m-the-ct" style={{ margin: '0 0 16px' }}>
              <div className="m-the-ct-hang1">
                <span className="m-the-ct-so">{theXem.soThe}</span>
                <span className={`m-the-ct-tag ${theXem.ttCls}`}>{theXem.ttNhan}</span>
              </div>
              <div className="m-the-ct-hang2">
                <span className="m-the-ct-dt" style={{ fontWeight: 600, fontSize: 16 }}>{theXem.ten}</span>
              </div>
              <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>
                {theXem.loai} · {theXem.cn} · Ngày: {theXem.ngay}
              </div>
              <div className="m-the-ct-vach" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, color: '#888' }}>Giá trị</div>
                  <b style={{ fontSize: 14, color: '#1a1a1a' }}>{money(theXem.gt)} đ</b>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#888' }}>Đã PB</div>
                  <b style={{ fontSize: 14, color: '#0066cc' }}>{money(theXem.da ?? 0)} đ</b>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#888' }}>Còn lại</div>
                  <b style={{ fontSize: 14, color: '#e65100' }}>{money(theXem.con ?? 0)} đ</b>
                </div>
              </div>
            </div>

            {/* Chi tiết phân bổ */}
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>
                Chi tiết các mục phân bổ ({theXem.dong?.length ?? 1})
              </h3>
              {theXem.dong?.map((d: DongPb, idx: number) => (
                <div key={idx} className="m-the-ct" style={{ margin: '0 0 10px', padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <b style={{ fontSize: 14, color: '#0066cc' }}>{d.ma || `Mục ${idx + 1}`}</b>
                    <b style={{ fontSize: 14 }}>{money(d.gt as number)} đ</b>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 4 }}>
                    {d.ten}
                  </div>
                  <div style={{ fontSize: 13, color: '#777' }}>
                    Phân bổ {d.ky as number} tháng · Bắt đầu: {String(d.ngayPb || theXem.ngay)}
                  </div>
                </div>
              ))}
            </div>

            {/* Thông tin mua */}
            {theXem.soCt && (
              <div className="m-the-ct" style={{ margin: '0 0 16px', padding: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px', color: '#1a1a1a' }}>
                  Thông tin mua gốc
                </h3>
                <div style={{ fontSize: 14, color: '#444', lineHeight: 1.6 }}>
                  <div>Số chứng từ: <b>{theXem.soCt}</b></div>
                  <div>Ngày chứng từ: {theXem.ngayCt}</div>
                  <div>Ghi chú: {theXem.ghiChuCt}</div>
                </div>
              </div>
            )}
          </div>

          <div className="m-form-day">
            <button
              type="button"
              className="m-loc-btn-apply"
              style={{ width: '100%' }}
              onClick={() => setTheXem(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Sheet Báo cáo theo dõi */}
      <MBaoCaoTheoDoi
        mo={moTheoDoi}
        onDong={() => setMoTheoDoi(false)}
        modKey="ccdc"
      />
    </>
  )
}
