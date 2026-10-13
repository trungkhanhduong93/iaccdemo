import { Link } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { donViHienTai, useSession } from '../../app/session'
import { CHI_NHANH, ROLE } from '../../data/mock'
import { Icon } from '../Icon'
import { money, pct } from '../format'
import { tinhToanTongQuan } from '../../modules/home/chiSo'
import { moDuoc, timMan } from '../../app/registry'

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
  const { s, toast } = useSession()
  const dv = donViHienTai(s)

  const d = tinhToanTongQuan('thang-nay', CHI_NHANH.map(c => c.id), s.cheDo)

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

  return (
    <div className="m-trang-chu">
      {/* Đầu trang: nền chuyển sắc nhạt từ tint sang bg */}
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
            onClick={() => toast('Đang làm')}
            title="Tìm kiếm"
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

      {/* Khối Thao tác nhanh: 4 ô */}
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

      {/* Thẻ số liệu KPI */}
      <section className="m-tc-so-lieu">
        <div className="m-tc-the">
          <div className="m-tc-the-top">
            <span className="m-tc-the-ic"><Icon n="receipt" className="ic sm" /></span>
            <span className="m-tc-the-tieu">Doanh thu thuần</span>
          </div>
          <div className="m-tc-so-to">{money(d.dtThuan)} đ</div>
          <SoSanhDong tang={d.tangDT} label={d.tangDT !== null ? d.soSanhLabel : ''} />
        </div>

        <div className="m-tc-the">
          <div className="m-tc-the-top">
            <span className="m-tc-the-ic"><Icon n="pulse" className="ic sm" /></span>
            <span className="m-tc-the-tieu">Lợi nhuận gộp</span>
          </div>
          <div className="m-tc-so-to">{money(d.lnGop)} đ</div>
          <SoSanhDong tang={d.tangLG} label={`· Biên ${pct(d.bienGop)}`} />
        </div>

        <div className="m-tc-the">
          <div className="m-tc-the-top">
            <span className="m-tc-the-ic"><Icon n="chart" className="ic sm" /></span>
            <span className="m-tc-the-tieu">Lợi nhuận trước thuế</span>
          </div>
          <div className="m-tc-so-to">{money(d.lnTruocThue)} đ</div>
          <SoSanhDong tang={d.tangLNTT} label={`· Biên ${pct(d.bienLNTT)}`} />
        </div>

        <div className="m-tc-the">
          <div className="m-tc-the-top">
            <span className="m-tc-the-ic"><Icon n="wallet" className="ic sm" /></span>
            <span className="m-tc-the-tieu">Tiền khả dụng</span>
          </div>
          <div className="m-tc-so-to">{money(d.tienKhaDung)} đ</div>
          <SoSanhDong tang={d.tangTien} label={`· Đủ chi ${d.soNgayDuChi} ngày`} />
        </div>
      </section>
    </div>
  )
}
