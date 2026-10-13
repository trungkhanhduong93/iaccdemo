import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { donViHienTai, useSession } from '../../app/session'
import { CHI_NHANH, DAILY, KHO, NVL, ROLE, kqkd } from '../../data/mock'
import { Icon } from '../Icon'
import { money, pct } from '../format'
import { tinhToanTongQuan } from '../../modules/home/chiSo'
import { soCai } from '../../modules/tong-hop/so-cai'
import { dinhMucTon } from '../../modules/kho/data'
import { moDuoc, timMan } from '../../app/registry'
import { TrendChart } from '../Charts'
import { MTimKiem } from './MTimKiem'
import { MChon } from './MChon'

function SoSanhDong({ tang, label }: { tang: number | null; label?: string }) {
  if (tang === null) {
    return <div className="m-tc-ss neutral">— Chưa có kỳ so sánh</div>
  }
  const tot = tang >= 0
  const dau = tang > 0 ? '▲ +' : tang < 0 ? '▼ -' : ''
  return (
    <div className={`m-tc-ss ${tot ? 'tot' : 'xau'}`}>
      <span className="m-tc-ss-val">{dau}{pct(Math.abs(tang))}</span>
      {label && <span className="m-tc-ss-lbl"> {label}</span>}
    </div>
  )
}

export function MTrangChu(_props?: Partial<ScreenProps>) {
  const { s } = useSession()
  const nav = useNavigate()
  const dv = donViHienTai(s)

  const [tabActive, setTabActive] = useState<0 | 1>(0)
  const [moTimKiem, setMoTimKiem] = useState(false)
  const [moChonKho, setMoChonKho] = useState(false)
  const [khoChon, setKhoChon] = useState<string>('Tất cả')
  const snapRef = useRef<HTMLDivElement>(null)

  // Nhãn gói thuê bao (PRO, PLUS, STD, FREE)
  const nhanGoi = s.goi === 'PR' ? 'PRO' : s.goi === 'PL' ? 'PLUS' : s.goi === 'S' ? 'STD' : 'FREE'

  const d = tinhToanTongQuan('thang-nay', CHI_NHANH.map(c => c.id), s.cheDo)

  // Phải thu khách hàng (TK 131)
  const sc10 = soCai(10)
  const sc9 = soCai(9)
  const phaiThuNay = Math.max(0, sc10.cuoi['131'] || 0)
  const phaiThuTruoc = Math.max(0, sc9.cuoi['131'] || 0)
  const tangPhaiThu = phaiThuTruoc > 0 ? (phaiThuNay - phaiThuTruoc) / phaiThuTruoc : null

  // 1. Thao tác nhanh (5 ô biểu tượng tròn nền nhạt chữ dưới)
  const { sc: scThu } = timMan('tien', '2-1-1')
  const { sc: scChi } = timMan('tien', '2-1-1')
  const { sc: scNhap } = timMan('kho', '5-1-1')
  const { sc: scXuat } = timMan('kho', '5-1-2')
  const { sc: scSoQuy } = timMan('tien', '2-2-1')

  const thaoTac5 = [
    {
      ten: 'Thu tiền',
      icon: 'cashin',
      to: '/app/tien/2-1-1/moi?loai=thu',
      khoa: scThu ? !moDuoc(scThu, s.goi) : false,
    },
    {
      ten: 'Chi tiền',
      icon: 'cashout',
      to: '/app/tien/2-1-1/moi?loai=chi',
      khoa: scChi ? !moDuoc(scChi, s.goi) : false,
    },
    {
      ten: 'Nhập kho',
      icon: 'filein',
      to: '/app/kho/5-1-1/moi',
      khoa: scNhap ? !moDuoc(scNhap, s.goi) : false,
    },
    {
      ten: 'Xuất kho',
      icon: 'pos',
      to: '/app/kho/5-1-2/moi',
      khoa: scXuat ? !moDuoc(scXuat, s.goi) : false,
    },
    {
      ten: 'Sổ quỹ',
      icon: 'wallet',
      to: '/app/tien/2-2-1',
      khoa: scSoQuy ? !moDuoc(scSoQuy, s.goi) : false,
    },
  ]

  // 3. Dữ liệu tổng tồn kho
  const rowsDm = useMemo(() => dinhMucTon.rows(s.cheDo, 202610), [s.cheDo])
  const rowsDmLoc = useMemo(() => {
    if (khoChon === 'Tất cả') return rowsDm
    return rowsDm.filter(r => r.kho === khoChon)
  }, [rowsDm, khoChon])

  const nvlGia = useMemo(() => new Map(NVL.map(n => [n.ten, n.gia])), [])

  const { tongTienTon, soHetHang, soDuoiNgau, soVuotNgau } = useMemo(() => {
    let tong = 0, het = 0, duoi = 0, vuot = 0
    for (const r of rowsDmLoc) {
      const ton = Number(r.ton) || 0
      const min = Number(r.min) || 0
      const max = Number(r.max) || 0
      const gia = nvlGia.get(String(r.ten)) ?? 30000
      tong += Math.max(0, ton) * gia
      if (ton <= 0) het++
      else if (ton < min) duoi++
      else if (ton > max) vuot++
    }
    return {
      tongTienTon: tong,
      soHetHang: het,
      soDuoiNgau: duoi,
      soVuotNgau: vuot,
    }
  }, [rowsDmLoc, nvlGia])

  // 4. Chi phí nguyên vật liệu T10/2026
  const k10 = useMemo(() => kqkd(10, 2026), [])
  const pctGv10 = k10.dtThuan > 0 ? (k10.gv / k10.dtThuan) * 100 : 0

  // So sánh cùng kỳ tháng trước (01-07/10 so với 01-07/09)
  const gv9CungKy = useMemo(() => {
    const ds9 = DAILY.filter(d => d.date.getMonth() === 8 && d.date.getDate() <= 7)
    return ds9.reduce((a, b) => a + b.gv, 0)
  }, [])
  const tangGvThang = gv9CungKy > 0 ? (k10.gv - gv9CungKy) / gv9CungKy : 0
  const tangGvNam = 0.086 // So với cùng kỳ năm trước (+8,6%)

  // 5. Tỷ lệ chi phí nguyên vật liệu (các tháng 5 đến 10)
  const dataTrendNvl = useMemo(() => {
    return [5, 6, 7, 8, 9, 10].map(th => {
      const k = kqkd(th, 2026)
      const bien = k.dtThuan > 0 ? (k.gv / k.dtThuan) * 100 : 0
      return {
        l: 'T' + th,
        dt: k.gv,
        ln: k.gv,
        bien,
      }
    })
  }, [])

  // 7. Tỷ lệ tồn tại các kho
  const thongKeKho = useMemo(() => {
    const danhSachKho = Array.from(new Set(rowsDm.map(r => String(r.kho))))
    return danhSachKho.map(tenKho => {
      const cacDong = rowsDm.filter(r => r.kho === tenKho)
      const tong = cacDong.length || 1
      let het = 0, duoi = 0, vuot = 0, trong = 0
      for (const r of cacDong) {
        const ton = Number(r.ton) || 0
        const min = Number(r.min) || 0
        const max = Number(r.max) || 0
        if (ton <= 0) het++
        else if (ton < min) duoi++
        else if (ton > max) vuot++
        else trong++
      }
      return {
        tenKho,
        tong,
        het,
        duoi,
        vuot,
        trong,
        pctHet: (het / tong) * 100,
        pctDuoi: (duoi / tong) * 100,
        pctVuot: (vuot / tong) * 100,
        pctTrong: (trong / tong) * 100,
      }
    })
  }, [rowsDm])

  const thongKeTong = useMemo(() => {
    const rows = khoChon === 'Tất cả' ? rowsDm : rowsDm.filter(r => r.kho === khoChon)
    const tong = rows.length || 1
    let het = 0, duoi = 0, vuot = 0, trong = 0
    for (const r of rows) {
      const ton = Number(r.ton) || 0
      const min = Number(r.min) || 0
      const max = Number(r.max) || 0
      if (ton <= 0) het++
      else if (ton < min) duoi++
      else if (ton > max) vuot++
      else trong++
    }
    return {
      pctHet: Math.round((het / tong) * 100),
      pctDuoi: Math.round((duoi / tong) * 100),
      pctVuot: Math.round((vuot / tong) * 100),
      pctTrong: Math.round((trong / tong) * 100),
    }
  }, [rowsDm, khoChon])

  // Danh sách việc cần theo dõi (Tab 2)
  const dsTheoDoi = useMemo(() => {
    const viecs: {
      id: string
      ten: string
      chiTiet: string
      icon: string
      to: string
      scKey: [string, string]
    }[] = []

    // 1. Công nợ phải thu quá hạn
    viecs.push({
      id: 'cong-no-qua-han',
      ten: 'Công nợ phải thu quá hạn',
      chiTiet: '4 khách hàng · 86.400.000 đ',
      icon: 'wallet',
      to: '/app/tien/2-2-5',
      scKey: ['tien', '2-2-5'],
    })

    // 2. Hàng tồn dưới định mức (tính từ dinhMucTon)
    const dsDuoi = rowsDm.filter(r => Number(r.ton) < Number(r.min))
    if (dsDuoi.length > 0) {
      viecs.push({
        id: 'hang-ton-duoi-dm',
        ten: 'Hàng tồn dưới định mức',
        chiTiet: `${dsDuoi.length} mặt hàng`,
        icon: 'box',
        to: '/app/kho/5-1-13',
        scKey: ['kho', '5-1-13'],
      })
    }

    // 3. Hạn nộp tờ khai thuế kế tiếp
    viecs.push({
      id: 'han-to-khai-thue',
      ten: 'Hạn nộp tờ khai thuế GTGT',
      chiTiet: 'Hạn 30/10/2026 (còn 23 ngày)',
      icon: 'percent',
      to: '/app/thue/6-2-3',
      scKey: ['thue', '6-2-3'],
    })

    // Lọc theo quyền gói: dòng nào màn gói không mở được thì ẩn
    return viecs.filter(v => {
      const { sc } = timMan(v.scKey[0], v.scKey[1])
      if (!sc) return true
      return moDuoc(sc, s.goi)
    })
  }, [rowsDm, s.goi])

  // Danh sách chọn kho
  const dsChonKho = useMemo(() => {
    return [
      { k: 'Tất cả', ten: 'Tất cả kho' },
      ...KHO.map(k => ({ k, ten: k })),
    ]
  }, [])

  // Điều khiển chuyển tab bằng click và cuộn vuốt ngang
  const handleChuyenTab = (idx: 0 | 1) => {
    setTabActive(idx)
    if (snapRef.current) {
      const w = snapRef.current.clientWidth
      snapRef.current.scrollTo({ left: idx * w, behavior: 'smooth' })
    }
  }

  const handleScroll = () => {
    if (snapRef.current) {
      const { scrollLeft, clientWidth } = snapRef.current
      if (clientWidth > 0) {
        const idx = (Math.round(scrollLeft / clientWidth) as number) >= 1 ? 1 : 0
        if (idx !== tabActive) {
          setTabActive(idx)
        }
      }
    }
  }

  return (
    <div className="m-trang-chu">
      {/* Đầu trang IVT: nền vàng kem chuyển trắng, logo vuông đè nhãn gói, cụm tìm kiếm & chuông bo tròn */}
      <section className="m-tc-dau">
        <div className="m-tc-dau-trai">
          <div className="m-tc-logo-hop">
            <span className="m-tc-goi-badge">{nhanGoi}</span>
            <div className="m-tc-logo-av">{dv.viettat}</div>
          </div>
          <div className="m-tc-don-vi">
            <h2 className="m-tc-dv-ten">{dv.ten}</h2>
            <div className="m-tc-dv-vai-tro">{ROLE[s.role]}</div>
          </div>
        </div>
        <div className="m-tc-dau-phai">
          <div className="m-tc-cum-phai">
            <button
              type="button"
              className="m-tc-nut-tron"
              onClick={() => setMoTimKiem(true)}
              title="Tìm kiếm"
              aria-label="Tìm kiếm màn hình"
            >
              <Icon n="search" className="ic sm" />
            </button>
            <button
              type="button"
              className="m-tc-nut-tron"
              title="Thông báo"
            >
              <Icon n="bell" className="ic sm" />
              {dsTheoDoi.length > 0 && <span className="m-tc-badge-so">{dsTheoDoi.length}</span>}
            </button>
          </div>
        </div>
      </section>

      {/* Hàng dưới: nhóm tab viên thuốc "Quản trị | Cần theo dõi", bên phải chip trắng "Kho: ..." */}
      <div className="m-tc-thanh-dieu-huong">
        <div className="m-tc-vien-thuoc">
          <button
            type="button"
            className={`m-tc-tab ${tabActive === 0 ? 'on' : ''}`}
            onClick={() => handleChuyenTab(0)}
          >
            Quản trị
          </button>
          <button
            type="button"
            className={`m-tc-tab ${tabActive === 1 ? 'on' : ''}`}
            onClick={() => handleChuyenTab(1)}
          >
            Cần theo dõi
            {dsTheoDoi.length > 0 && <span className="m-tc-tab-dem">{dsTheoDoi.length}</span>}
          </button>
        </div>

        <button
          type="button"
          className="m-tc-chip-kho"
          onClick={() => setMoChonKho(true)}
          title="Chọn kho hiển thị"
        >
          <span className="m-tc-chip-kho-nhan">Kho: {khoChon}</span>
          <Icon n="chevd" className="ic xs" />
        </button>
      </div>

      {/* Khung chứa 2 trang vuốt ngang bằng scroll-snap */}
      <div className="m-tc-snap-wrap" ref={snapRef} onScroll={handleScroll}>
        {/* TRANG 1: QUẢN TRỊ (CÁC THẺ THEO BỐ CỤC IVT) */}
        <div className="m-tc-snap-trang">
          {/* Thẻ 1: Thao tác nhanh */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Thao tác nhanh</h3>
                <span className="m-tc-the-info" title="Các thao tác nhanh thường dùng">
                  <Icon n="info" className="ic xs" />
                </span>
              </div>
              <button
                type="button"
                className="m-tc-the-link"
                onClick={() => nav('/app/trang-chu/tong-quan')}
              >
                Tuỳ chỉnh
              </button>
            </div>
            <div className="m-tc-nhanh-5">
              {thaoTac5.map(item => (
                <Link
                  key={item.ten}
                  to={item.to}
                  className={`m-tc-nhanh-o5${item.khoa ? ' khoa' : ''}`}
                >
                  <div className="m-tc-nhanh-ic-tron">
                    <Icon n={item.icon} className="ic sm" />
                    {item.khoa && (
                      <span className="m-tc-nhanh-lk">
                        <Icon n="lock" className="ic xs" />
                      </span>
                    )}
                  </div>
                  <span className="m-tc-nhanh-ten5">{item.ten}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Thẻ 2: Doanh thu, lợi nhuận, tiền hiện có (lưới 2 cột) */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Tổng quan tài chính</h3>
                <span className="m-tc-the-info" title="Doanh thu, lợi nhuận và tiền">
                  <Icon n="info" className="ic xs" />
                </span>
              </div>
              <Link to="/app/trang-chu/tong-quan" className="m-tc-the-link">
                Chi tiết
              </Link>
            </div>
            <div className="m-tc-kpi-luoi">
              <div className="m-tc-kpi-muc">
                <div className="m-tc-kpi-nhan">Doanh thu thuần</div>
                <div className="m-tc-kpi-so">{money(d.dtThuan)} đ</div>
                <SoSanhDong tang={d.tangDT} label={d.tangDT !== null ? d.soSanhLabel : ''} />
              </div>
              <div className="m-tc-kpi-muc">
                <div className="m-tc-kpi-nhan">Lợi nhuận trước thuế</div>
                <div className="m-tc-kpi-so">{money(d.lnTruocThue)} đ</div>
                <SoSanhDong tang={d.tangLNTT} label={`· Biên ${pct(d.bienLNTT)}`} />
              </div>
              <div className="m-tc-kpi-muc">
                <div className="m-tc-kpi-nhan">Tiền hiện có</div>
                <div className="m-tc-kpi-so">{money(d.tienKhaDung)} đ</div>
                <SoSanhDong tang={d.tangTien} label={`· Đủ chi ${d.soNgayDuChi} ngày`} />
              </div>
              <div className="m-tc-kpi-muc">
                <div className="m-tc-kpi-nhan">Phải thu khách hàng</div>
                <div className="m-tc-kpi-so">{money(phaiThuNay)} đ</div>
                <SoSanhDong tang={tangPhaiThu} label={tangPhaiThu !== null ? 'so với T9' : ''} />
              </div>
            </div>
          </div>

          {/* Thẻ 3: Tổng tồn kho */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Tổng tồn kho</h3>
                <span className="m-tc-the-info" title="Tổng giá trị tồn kho và tình trạng định mức">
                  <Icon n="info" className="ic xs" />
                </span>
              </div>
              <Link to="/app/kho/5-1-13" className="m-tc-the-link">
                Chi tiết
              </Link>
            </div>
            <div className="m-tc-so-lon">{money(tongTienTon)} đ</div>
            <hr className="m-tc-ke" />
            <div className="m-tc-3cot">
              <div className="m-tc-cot-muc">
                <div className="m-tc-cot-nhan">Hết hàng</div>
                <div className="m-tc-cot-so do">{soHetHang} HH</div>
              </div>
              <div className="m-tc-cot-muc">
                <div className="m-tc-cot-nhan">Dưới ngưỡng</div>
                <div className="m-tc-cot-so cam">{soDuoiNgau} HH</div>
              </div>
              <div className="m-tc-cot-muc">
                <div className="m-tc-cot-nhan">Vượt ngưỡng</div>
                <div className="m-tc-cot-so cam">{soVuotNgau} HH</div>
              </div>
            </div>
          </div>

          {/* Thẻ 4: Chi phí nguyên vật liệu T10/2026 */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Chi phí nguyên vật liệu T10/2026</h3>
                <span className="m-tc-the-info" title="Chi phí giá vốn nguyên vật liệu trong tháng">
                  <Icon n="info" className="ic xs" />
                </span>
              </div>
              <Link to="/app/bao-cao/nhom-kho" className="m-tc-the-link">
                Chi tiết
              </Link>
            </div>
            <div className="m-tc-nvl-hang-so">
              <span className="m-tc-so-lon">{money(k10.gv)} đ</span>
              <span className="m-tc-nvl-cam">({pctGv10.toFixed(1)}% doanh thu)</span>
            </div>
            <hr className="m-tc-ke" />
            <div className="m-tc-2cot">
              <div className="m-tc-cot-muc">
                <div className={`m-tc-ss-ivt ${tangGvThang >= 0 ? 'tang' : 'giam'}`}>
                  <span className="m-tc-ss-mui-ten">{tangGvThang >= 0 ? '▲ +' : '▼ -'}{pct(Math.abs(tangGvThang))}</span>
                </div>
                <div className="m-tc-ss-chu">so với cùng kỳ tháng trước</div>
              </div>
              <div className="m-tc-cot-muc">
                <div className={`m-tc-ss-ivt ${tangGvNam >= 0 ? 'tang' : 'giam'}`}>
                  <span className="m-tc-ss-mui-ten">{tangGvNam >= 0 ? '▲ +' : '▼ -'}{pct(Math.abs(tangGvNam))}</span>
                </div>
                <div className="m-tc-ss-chu">so với cùng kỳ năm trước</div>
              </div>
            </div>
          </div>

          {/* Thẻ 5: Tỷ lệ chi phí nguyên vật liệu */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Tỷ lệ chi phí nguyên vật liệu</h3>
                <span className="m-tc-the-info" title="Diễn biến chi phí và tỷ lệ nguyên vật liệu qua các tháng">
                  <Icon n="info" className="ic xs" />
                </span>
              </div>
              <div className="m-tc-bd-head-chon">
                Năm 2026 <Icon n="chevd" className="ic xs" />
              </div>
            </div>
            <div className="m-tc-bd-wrap">
              <TrendChart data={dataTrendNvl} h={210} />
            </div>
          </div>

          {/* Thẻ 7: Tỷ lệ tồn tại các kho */}
          <div className="m-tc-the-ivt">
            <div className="m-tc-the-head">
              <div className="m-tc-the-tieu-hop">
                <h3 className="m-tc-the-tieu">Tỷ lệ tồn tại các kho</h3>
                <span className="m-tc-the-info" title="Phân bổ trạng thái tồn định mức của từng kho">
                  <Icon n="info" className="ic xs" />
                </span>
              </div>
              <Link to="/app/kho/5-1-13" className="m-tc-the-link">
                Chi tiết
              </Link>
            </div>

            <div className="m-tc-kho-khung-xam">
              <div className="m-tc-kho-ten">{khoChon === 'Tất cả' ? 'Tất cả kho' : khoChon}</div>
              <div className="m-tc-kho-chu-thich">
                <span className="m-tc-ct-muc">
                  <i className="m-tc-ct-cham do" /> Hết hàng {thongKeTong.pctHet}%
                </span>
                <span className="m-tc-ct-muc">
                  <i className="m-tc-ct-cham cam" /> Dưới ngưỡng {thongKeTong.pctDuoi}%
                </span>
                <span className="m-tc-ct-muc">
                  <i className="m-tc-ct-cham tim" /> Vượt ngưỡng {thongKeTong.pctVuot}%
                </span>
                <span className="m-tc-ct-muc">
                  <i className="m-tc-ct-cham xanh" /> Trong ngưỡng {thongKeTong.pctTrong}%
                </span>
                <span className="m-tc-ct-muc">
                  <i className="m-tc-ct-cham xam" /> Khác 0%
                </span>
              </div>
            </div>

            <div className="m-tc-kho-ds-dong">
              {thongKeKho.map(k => (
                <div key={k.tenKho} className="m-tc-kho-dong">
                  <div className="m-tc-kho-dong-ten">{k.tenKho}</div>
                  <div className="m-tc-kho-thanh-wrap">
                    {k.pctHet > 0 && (
                      <div
                        className="m-tc-kho-phan do"
                        style={{ width: `${k.pctHet}%` }}
                        title={`Hết hàng: ${k.pctHet.toFixed(0)}%`}
                      />
                    )}
                    {k.pctDuoi > 0 && (
                      <div
                        className="m-tc-kho-phan cam"
                        style={{ width: `${k.pctDuoi}%` }}
                        title={`Dưới ngưỡng: ${k.pctDuoi.toFixed(0)}%`}
                      />
                    )}
                    {k.pctVuot > 0 && (
                      <div
                        className="m-tc-kho-phan tim"
                        style={{ width: `${k.pctVuot}%` }}
                        title={`Vượt ngưỡng: ${k.pctVuot.toFixed(0)}%`}
                      />
                    )}
                    {k.pctTrong > 0 && (
                      <div
                        className="m-tc-kho-phan xanh"
                        style={{ width: `${k.pctTrong}%` }}
                        title={`Trong ngưỡng: ${k.pctTrong.toFixed(0)}%`}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TRANG 2: CẦN THEO DÕI */}
        <div className="m-tc-snap-trang">
          <section className="m-tc-ds-theo-doi">
            {dsTheoDoi.length === 0 ? (
              <div className="m-tc-ctd-trong">Không có việc cần theo dõi</div>
            ) : (
              <div className="m-tc-ctd-ds">
                {dsTheoDoi.map(v => (
                  <div
                    key={v.id}
                    className="m-tc-ctd-dong"
                    onClick={() => nav(v.to)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="m-tc-ctd-ic">
                      <Icon n={v.icon} className="ic sm" />
                    </div>
                    <div className="m-tc-ctd-nd">
                      <div className="m-tc-ctd-ten">{v.ten}</div>
                      <div className="m-tc-ctd-sub">{v.chiTiet}</div>
                    </div>
                    <Icon n="chevr" className="ic sm m-tc-theo-doi-mui-ten" />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Lớp phủ tìm kiếm màn hình */}
      <MTimKiem mo={moTimKiem} onDong={() => setMoTimKiem(false)} />

      {/* Sheet chọn kho */}
      <MChon
        mo={moChonKho}
        onDong={() => setMoChonKho(false)}
        tieuDe="Chọn kho hiển thị"
        ds={dsChonKho}
        chon={khoChon}
        onChon={k => setKhoChon(k)}
      />
    </div>
  )
}
