import { useState, type FC } from 'react'
import type { ScreenProps } from '../../modules/types'
import { cheDoHienTai, donViHienTai, useSession } from '../../app/session'
import {
  DIEM_NOI_BAT,
  GIA_GOI_NAM,
  GIA_GOI_THANG,
  GOI,
  GOIS,
  demTheoGoi,
  type Goi,
} from '../../app/plan'
import { cheDoCuaGoi } from '../../app/che-do'
import { GoiLogo } from '../GoiLogo'
import { Icon } from '../Icon'

export const MGoiThueBao: FC<ScreenProps> = () => {
  const { s, set, toast } = useSession()
  const dv = donViHienTai(s)

  const [ky, setKy] = useState<'nam' | 'thang'>('nam')
  const [dangChuyen, setDangChuyen] = useState<Goi | null>(null)

  const bangGia = ky === 'nam' ? GIA_GOI_NAM : GIA_GOI_THANG

  const thucHienDoiGoi = (g: Goi) => {
    const cdMoi = cheDoCuaGoi(g)
    set({ goi: g, cheDo: cdMoi.ma })
    toast(`Đã chuyển đơn vị ${dv.viettat} sang gói ${GOI[g].ten} (${cdMoi.soHieu})`)
    setDangChuyen(null)
  }

  return (
    <div className="m-gtb-khung">
      {/* 1. Thẻ hiện trạng bản quyền gói đang dùng */}
      <section className="m-gtb-hero">
        <div className="m-gtb-hero-dau">
          <GoiLogo g={s.goi} size={44} glow />
          <div>
            <div className="m-gtb-hero-ten">Gói {GOI[s.goi].ten}</div>
            <div className="m-gtb-hero-dv">{dv.ten}</div>
          </div>
        </div>
        <p className="m-gtb-hero-mota">
          Chế độ kế toán: <b>{cheDoHienTai(s).soHieu}</b> ({cheDoHienTai(s).ten}) · MST: {dv.mst} · {dv.diem} điểm bán
        </p>
        <div className="m-gtb-hero-chan">
          <button
            type="button"
            className="btn pri sm"
            onClick={() => toast('Yêu cầu gia hạn đã được gửi tới chuyên viên hỗ trợ iPOS')}
          >
            Gia hạn 1 năm
          </button>
          <a type="button" className="btn sm" href="tel:19004766">
            <Icon n="help" className="ic sm" /> 1900 4766
          </a>
        </div>
      </section>

      {/* 2. Thanh chuyển đổi kỳ thanh toán */}
      <div className="m-gtb-ky-switch">
        <button
          type="button"
          className={`m-gtb-ky-btn ${ky === 'nam' ? 'on' : ''}`}
          onClick={() => setKy('nam')}
        >
          Thanh toán theo năm (-20%)
        </button>
        <button
          type="button"
          className={`m-gtb-ky-btn ${ky === 'thang' ? 'on' : ''}`}
          onClick={() => setKy('thang')}
        >
          Thanh toán theo tháng
        </button>
      </div>

      {/* 3. Dải các thẻ gói dọc */}
      <div className="m-gtb-ds-the">
        {GOIS.map(g => {
          const n = demTheoGoi(g)
          const dangDung = g === s.goi
          const laKhuyenDung = g === 'PL'
          const thongTinGia = bangGia[g]
          const highlights = DIEM_NOI_BAT[g]
          const cd = cheDoCuaGoi(g)

          return (
            <div
              key={g}
              className={`m-gtb-the${dangDung ? ' dang-dung' : ''}${laKhuyenDung && !dangDung ? ' khuyen-dung' : ''}`}
            >
              <div className="m-gtb-the-dau">
                <GoiLogo g={g} size={36} glow={dangDung || laKhuyenDung} />
                <div>
                  <div className="m-gtb-the-ten">
                    {GOI[g].ten}
                    {dangDung ? (
                      <span className="chip ok" style={{ marginLeft: 6 }}>Đang dùng</span>
                    ) : laKhuyenDung ? (
                      <span className="chip info" style={{ marginLeft: 6 }}>Khuyên dùng</span>
                    ) : null}
                  </div>
                  <div className="m-gtb-the-mota">{highlights.tieuDe}</div>
                </div>
              </div>

              <div className="m-gtb-the-gia">
                <span className="m-gtb-the-so">{thongTinGia.gia}</span>
                <span className="m-gtb-the-ky">{thongTinGia.chuKy}</span>
              </div>

              <div className="m-gtb-the-specs">
                <div>✓ Mở {n.co}/{n.tong} tính năng</div>
                <div>✓ Chế độ áp dụng: {cd.soHieu} ({cd.ten})</div>
              </div>

              <div className="m-gtb-the-cta">
                {dangDung ? (
                  <button type="button" className="btn sm" disabled style={{ width: '100%' }}>
                    <Icon n="check" className="ic sm" /> Gói đang dùng
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`btn sm ${g === 'PL' || g === 'PR' ? 'acc' : 'pri'}`}
                    style={{ width: '100%' }}
                    onClick={() => setDangChuyen(g)}
                  >
                    {GOIS.indexOf(g) > GOIS.indexOf(s.goi)
                      ? `Nâng cấp lên ${GOI[g].ten}`
                      : `Chuyển về ${GOI[g].ten}`}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal xác nhận chuyển gói */}
      {dangChuyen && (
        <div className="gtb-overlay" onClick={() => setDangChuyen(null)}>
          <div className="card gtb-dialog" onClick={e => e.stopPropagation()}>
            <div className="gtb-dialog-header">
              <GoiLogo g={dangChuyen} size={40} glow />
              <div>
                <h3 style={{ margin: 0, fontSize: 16 }}>Chuyển sang gói {GOI[dangChuyen].ten}</h3>
                <span className="muted" style={{ fontSize: 12 }}>
                  Áp dụng cho {dv.ten}
                </span>
              </div>
            </div>

            <div className="gtb-dialog-body" style={{ margin: '14px 0', fontSize: 13, lineHeight: 1.5 }}>
              <p>
                Chế độ kế toán sẽ đổi sang <b>{cheDoCuaGoi(dangChuyen).soHieu}</b>.
              </p>
              <div style={{ background: 'var(--soft)', padding: 10, borderRadius: 8, marginTop: 8 }}>
                ✓ Mở khoá {demTheoGoi(dangChuyen).co} tính năng nghiệp vụ.
                <br />
                ✓ Dữ liệu kế toán hiện tại được lưu giữ an toàn.
              </div>
            </div>

            <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" className="btn sm" onClick={() => setDangChuyen(null)}>
                Huỷ bỏ
              </button>
              <button type="button" className="btn sm acc" onClick={() => thucHienDoiGoi(dangChuyen)}>
                Xác nhận chuyển gói
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
