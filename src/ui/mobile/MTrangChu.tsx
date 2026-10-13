import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { donViHienTai, useSession } from '../../app/session'
import { CHI_NHANH, ROLE } from '../../data/mock'
import { Icon } from '../Icon'
import { money, pct } from '../format'
import { tinhToanTongQuan } from '../../modules/home/chiSo'
import { soCai } from '../../modules/tong-hop/so-cai'
import { dinhMucTon } from '../../modules/kho/data'
import { moDuoc, timMan } from '../../app/registry'
import { Bars, CostStructureChart, TrendChart } from '../Charts'
import { MTimKiem } from './MTimKiem'

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
  const snapRef = useRef<HTMLDivElement>(null)

  const d = tinhToanTongQuan('thang-nay', CHI_NHANH.map(c => c.id), s.cheDo)

  // Phải thu khách hàng (TK 131)
  const sc10 = soCai(10)
  const sc9 = soCai(9)
  const phaiThuNay = Math.max(0, sc10.cuoi['131'] || 0)
  const phaiThuTruoc = Math.max(0, sc9.cuoi['131'] || 0)
  const tangPhaiThu = phaiThuTruoc > 0 ? (phaiThuNay - phaiThuTruoc) / phaiThuTruoc : null

  // Màn kiểm tra quyền cho Thao tác nhanh
  const { sc: scThu } = timMan('tien', '2-1-1')
  const { sc: scChi } = timMan('tien', '2-1-1')
  const { sc: scNhap } = timMan('kho', '5-1-1')
  const { sc: scXuat } = timMan('kho', '5-1-2')

  const thaoTac = [
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
  ]

  // Danh sách việc cần theo dõi
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
    const rowsDm = dinhMucTon.rows(s.cheDo, 202610)
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
  }, [s.goi, s.cheDo])

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
      {/* Đầu trang: avatar, tên đơn vị, nút kính lúp, chuông */}
      <section className="m-tc-dau">
        <div className="m-tc-dau-trai">
          <div className="m-tc-av">{dv.viettat}</div>
          <div className="m-tc-don-vi">
            <h2 className="m-tc-dv-ten">{dv.ten}</h2>
            <div className="m-tc-dv-vai-tro">{ROLE[s.role]}</div>
          </div>
        </div>
        <div className="m-tc-dau-phai">
          <button
            type="button"
            className="m-tc-nut-tron"
            onClick={() => setMoTimKiem(true)}
            title="Tìm kiếm" aria-label="Tìm kiếm màn hình"
          >
            <Icon n="search" className="ic sm" />
          </button>
          <button
            type="button"
            className="m-tc-nut-tron"
            title="Thông báo"
          >
            <Icon n="bell" className="ic sm" />
            <span className="m-tc-badge-do" />
          </button>
        </div>
      </section>

      {/* Thanh hai tab: Tổng quan | Cần theo dõi */}
      <div className="m-tc-tabs">
        <button
          type="button"
          className={`m-tc-tab ${tabActive === 0 ? 'on' : ''}`}
          onClick={() => handleChuyenTab(0)}
        >
          Tổng quan
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

      {/* Khung chứa 2 trang vuốt ngang bằng scroll-snap */}
      <div className="m-tc-snap-wrap" ref={snapRef} onScroll={handleScroll}>
        {/* TRANG 1: TỔNG QUAN */}
        <div className="m-tc-snap-trang">
          {/* 4 thẻ số KPI */}
          <section className="m-tc-so-lieu">
            {/* 1. Doanh thu thuần */}
            <div className="m-tc-the">
              <div className="m-tc-the-top">
                <span className="m-tc-the-ic"><Icon n="receipt" className="ic sm" /></span>
                <span className="m-tc-the-tieu">Doanh thu thuần</span>
              </div>
              <div className="m-tc-so-to">{money(d.dtThuan)} đ</div>
              <SoSanhDong tang={d.tangDT} label={d.tangDT !== null ? d.soSanhLabel : ''} />
            </div>

            {/* 2. Lợi nhuận trước thuế */}
            <div className="m-tc-the">
              <div className="m-tc-the-top">
                <span className="m-tc-the-ic"><Icon n="chart" className="ic sm" /></span>
                <span className="m-tc-the-tieu">Lợi nhuận</span>
              </div>
              <div className="m-tc-so-to">{money(d.lnTruocThue)} đ</div>
              <SoSanhDong tang={d.tangLNTT} label={`· Biên ${pct(d.bienLNTT)}`} />
            </div>

            {/* 3. Tiền hiện có */}
            <div className="m-tc-the">
              <div className="m-tc-the-top">
                <span className="m-tc-the-ic"><Icon n="wallet" className="ic sm" /></span>
                <span className="m-tc-the-tieu">Tiền hiện có</span>
              </div>
              <div className="m-tc-so-to">{money(d.tienKhaDung)} đ</div>
              <SoSanhDong tang={d.tangTien} label={`· Đủ chi ${d.soNgayDuChi} ngày`} />
            </div>

            {/* 4. Phải thu khách hàng */}
            <div className="m-tc-the">
              <div className="m-tc-the-top">
                <span className="m-tc-the-ic"><Icon n="user" className="ic sm" /></span>
                <span className="m-tc-the-tieu">Phải thu khách hàng</span>
              </div>
              <div className="m-tc-so-to">{money(phaiThuNay)} đ</div>
              <SoSanhDong tang={tangPhaiThu} label={tangPhaiThu !== null ? 'so với tháng 9' : ''} />
            </div>
          </section>

          {/* Biểu đồ xu hướng doanh thu 4-6 tháng */}
          <section className="m-tc-bieu-do-wrap">
            <div className="m-tc-the">
              <div className="m-tc-the-top">
                <span className="m-tc-the-ic"><Icon n="chart" className="ic sm" /></span>
                <span className="m-tc-the-tieu">Doanh thu qua các tháng</span>
              </div>
              <TrendChart data={d.trend} h={200} />
            </div>
          </section>

          {/* Biểu đồ cơ cấu chi phí */}
          <section className="m-tc-bieu-do-wrap">
            <div className="m-tc-the">
              <div className="m-tc-the-top">
                <span className="m-tc-the-ic"><Icon n="pie" className="ic sm" /></span>
                <span className="m-tc-the-tieu">Cơ cấu chi phí</span>
              </div>
              <CostStructureChart parts={d.coCauCp} />
            </div>
          </section>

          {/* Khối Thao tác nhanh ở cuối tab Tổng quan */}
          <section className="m-tc-nhanh">
            <div className="m-tc-nhanh-head">
              <h3 className="m-tc-muc-tieu">Thao tác nhanh</h3>
            </div>
            <div className="m-tc-nhanh-luoi">
              {thaoTac.map(item => (
                <Link
                  key={item.ten}
                  to={item.to}
                  className={`m-tc-nhanh-o${item.khoa ? ' khoa' : ''}`}
                >
                  <div className="m-tc-nhanh-ic">
                    <Icon n={item.icon} />
                    {item.khoa && (
                      <span className="m-tc-nhanh-lk">
                        <Icon n="lock" className="ic xs" />
                      </span>
                    )}
                  </div>
                  <span className="m-tc-nhanh-ten">{item.ten}</span>
                </Link>
              ))}
            </div>
          </section>
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
    </div>
  )
}
