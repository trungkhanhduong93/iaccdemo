// Trang chủ gói Free điện thoại: khối Mua hàng & công nợ NCC, Hao hụt kiểm kê (T324, T498 Figma)
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { tinhToanTongQuan } from '../../modules/home/chiSo'
import { soLieuCongNo, soLieuKiemKe, soLieuMua } from '../../modules/home/khoStandard'
import { datLocDaXem, docTuyChinh, luuTuyChinh } from '../bao-cao/tuyChinhBC'
import { moneyD, pct, short } from '../format'
import { Icon } from '../Icon'
import { FigmaGradientIcon } from '../FigmaIcon'

export function MKhoStandard({ selCns, thang }: { selCns: string[]; thang: number }) {
  const { s } = useSession()

  const cns = useMemo(() => (selCns && selCns.length > 0 ? selCns : CUA_HANG.map(c => c.id)), [selCns])
  const tenCn = useMemo(() => new Set(CUA_HANG.filter(c => cns.includes(c.id)).map(c => c.ten)), [cns])
  const motCnKho = cns.length === 1 ? CUA_HANG.find(c => c.id === cns[0])?.ten : undefined

  const dHien = useMemo(() => {
    return tinhToanTongQuan(thang === 10 ? 'thang-nay' : 'thang-truoc', cns, s.cheDo, thang)
  }, [cns, s.cheDo, thang])

  const mua = useMemo(() => soLieuMua(thang, tenCn, dHien.dtThuan), [thang, tenCn, dHien.dtThuan])
  const no = useMemo(() => soLieuCongNo(thang, motCnKho), [thang, motCnKho])
  const kk = useMemo(() => soLieuKiemKe(thang, tenCn), [thang, tenCn])

  return (
    <>
      {/* 4. Khối Mua hàng & công nợ nhà cung cấp theo Figma */}
      <div className="m-tcf-figma-card">
        <div className="m-tcf-figma-card-head">
          <div className="m-tcf-figma-head-trai">
            <FigmaGradientIcon name="mua-hang" size={22} />
            <h3 className="m-tcf-figma-card-tieu">Mua hàng &amp; công nợ</h3>
          </div>
        </div>
        <div className="m-tcf-figma-card-mota">Giá trị hàng mua trong tháng và số tiền còn phải trả</div>

        {/* Tile 1: Giá trị mua hàng */}
        <div className="m-tcf-kpi-tile">
          <div className="m-tcf-kpi-tile-lbl">Giá trị mua hàng {thang === 10 ? 'tháng này' : `tháng ${thang}`}</div>
          <div className="m-tcf-kpi-tile-tien tien-blue">{moneyD(mua.nhap)}</div>
          <div className="m-tcf-kpi-tile-bot">
            <span>
              {mua.soDon} phiếu
              {mua.soSanh && (
                <> · <span style={{ color: mua.soSanh.pct > 0 ? 'var(--green, #138a52)' : 'var(--red, #c2362b)' }}>
                  {mua.soSanh.pct > 0 ? '▲' : '▼'} {pct(Math.abs(mua.soSanh.pct))} so với cùng kỳ
                </span></>
              )}
            </span>
            <Link
              to="/app/bao-cao/4-2-7"
              className="m-tcf-kpi-link"
              onClick={() => {
                luuTuyChinh(s.donVi, '4.2.7', { ...(docTuyChinh(s.donVi, '4.2.7') ?? {}), nhom: ['ma'], xemNhom: 'tongHop' })
                datLocDaXem('/app/bao-cao/4-2-7', {}, String(thang))
              }}
            >
              Bảng kê ›
            </Link>
          </div>
        </div>

        {/* Tile 2: Công nợ phải trả */}
        <div className="m-tcf-kpi-tile">
          <div className="m-tcf-kpi-tile-lbl">Công nợ phải trả</div>
          <div className="m-tcf-kpi-tile-tien tien-orange">{moneyD(no.cuoiRong)}</div>
          <div className="m-tcf-kpi-tile-bot">
            <span>{no.soNcc} nhà cung cấp</span>
            <Link
              to="/app/bao-cao/4-2-3"
              className="m-tcf-kpi-link"
              onClick={() => datLocDaXem('/app/bao-cao/4-2-3', {}, String(thang))}
            >
              Công nợ ›
            </Link>
          </div>
        </div>

        {/* Dòng đối chiếu công nợ */}
        <div className="m-tcf-kqkd-bang">
          <div className="m-tcf-kqkd-hang">
            <div className="m-tcf-kqkd-cot-trai">
              <div className="m-tcf-kqkd-ten-hang">Nợ đầu kỳ</div>
              <div className="m-tcf-kqkd-sub-hang">Còn nợ từ đầu tháng</div>
            </div>
            <div className="m-tcf-kqkd-cot-phai">
              <span className="m-tcf-kqkd-so-tien">{moneyD(no.dau)}</span>
            </div>
          </div>
          <div className="m-tcf-kqkd-hang">
            <div className="m-tcf-kqkd-cot-trai">
              <div className="m-tcf-kqkd-ten-hang">+ Phát sinh mua nợ</div>
              <div className="m-tcf-kqkd-sub-hang">Mua chưa thanh toán</div>
            </div>
            <div className="m-tcf-kqkd-cot-phai">
              <span className="m-tcf-kqkd-so-tien">{moneyD(no.phatSinh)}</span>
            </div>
          </div>
          <div className="m-tcf-kqkd-hang">
            <div className="m-tcf-kqkd-cot-trai">
              <div className="m-tcf-kqkd-ten-hang">− Đã thanh toán</div>
            </div>
            <div className="m-tcf-kqkd-cot-phai">
              <span className="m-tcf-kqkd-so-tien">{moneyD(no.traHang + no.thanhToan)}</span>
            </div>
          </div>
          <div className="m-tcf-kqkd-hang">
            <div className="m-tcf-kqkd-cot-trai">
              <div className="m-tcf-kqkd-ten-hang">= Nợ cuối kỳ</div>
              <div className="m-tcf-kqkd-sub-hang">Còn phải trả đến hôm nay</div>
            </div>
            <div className="m-tcf-kqkd-cot-phai">
              <span className="m-tcf-kqkd-so-tien" style={{ color: 'var(--orange, #f28020)' }}>{moneyD(no.cuoiRong)}</span>
            </div>
          </div>
        </div>

        {/* Danh sách mặt hàng mua nhiều nhất */}
        <div className="m-tcf-ds-tieu">MẶT HÀNG MUA NHIỀU NHẤT</div>
        {mua.topMh.map(x => (
          <div className="m-tcf-ds-dong" key={x.ma}>
            <div className="m-tcf-ds-trai">
              <span className="m-tcf-ma-chip">{x.ma}</span>
              <span className="m-tcf-ds-ten">{x.ten}</span>
            </div>
            <span className="m-tcf-ds-phai">{short(x.tien)}</span>
          </div>
        ))}

        {/* Danh sách nhà cung cấp nợ nhiều nhất */}
        <div className="m-tcf-ds-tieu">NHÀ CUNG CẤP NỢ NHIỀU NHẤT</div>
        {no.top.map(x => (
          <div className="m-tcf-ds-dong" key={x.ten}>
            <div className="m-tcf-ds-trai">
              <span className="m-tcf-ds-ten" title={x.ten}>{x.ten}</span>
            </div>
            <span className="m-tcf-ds-phai cam">{short(x.v)}</span>
          </div>
        ))}

        {/* Nút hành động Mua hàng */}
        <Link
          to="/app/mua-hang/4-1-1/moi"
          className="m-tcf-nut-vien chu-xanh"
          style={{ marginTop: 14 }}
        >
          <Icon n="plus" className="ic sm" kieu="net" />
          <span>Tạo phiếu mua hàng</span>
        </Link>
        <Link
          to="/app/tien/2-1-1/moi?loai=chi&ly=CHI02"
          className="m-tcf-nut-vien chu-xanh"
          style={{ marginTop: 8 }}
        >
          <Icon n="card" className="ic sm" kieu="net" />
          <span>Thanh toán nhà cung cấp</span>
        </Link>
      </div>

      {/* 5. Khối Hao hụt kiểm kê theo Figma */}
      <div className="m-tcf-figma-card">
        <div className="m-tcf-figma-card-head">
          <div className="m-tcf-figma-head-trai">
            <FigmaGradientIcon name="nhap-kho" size={22} />
            <h3 className="m-tcf-figma-card-tieu">Hao hụt kiểm kê</h3>
          </div>
          <Link
            to="/app/bao-cao/5-2-15"
            className="m-tcf-figma-link-bc"
            onClick={() => datLocDaXem('/app/bao-cao/5-2-15', {}, String(thang))}
          >
            Báo cáo hao hụt ›
          </Link>
        </div>
        <div className="m-tcf-figma-card-mota">Chênh lệch giữa tồn thực tế và tồn trên sổ sách</div>

        {/* Hero: Mặt hàng chênh lệch */}
        <div className="m-tcf-hero-box">
          <div className="m-tcf-hero-lbl">Mặt hàng chênh lệch {thang === 10 ? 'tháng này' : `tháng ${thang}`}</div>
          <div className="m-tcf-kk-hero-row">
            <div
              className="m-tcf-kk-so-lon"
              style={{ color: kk.thieu + kk.thua > 0 ? 'var(--red, #c2362b)' : 'var(--green, #138a52)' }}
            >
              {kk.thieu + kk.thua}
            </div>
            <div className="m-tcf-kk-pills">
              <span className="m-tcf-pill do">Thiếu {kk.thieu}</span>
              <span className="m-tcf-pill xanh">Thừa {kk.thua}</span>
              <span className="m-tcf-pill lam">Đã kiểm {kk.soKiem}/{kk.tongMh}</span>
            </div>
          </div>
        </div>

        {/* Tiến độ kiểm kê theo cửa hàng */}
        <div className="m-tcf-ds-tieu">TIẾN ĐỘ KIỂM KÊ THEO CỬA HÀNG</div>
        <div style={{ marginTop: 4 }}>
          <div className="m-tcf-tiendo-dong m-tcf-tiendo-dau"><span>Kiểm kê lần cuối</span></div>
          {kk.theoCn.map(x => (
            <div className="m-tcf-tiendo-dong" key={x.cn}>
              <span className="m-tcf-tiendo-ten">{x.cn.replace(/^Phố Mây /, '')}</span>
              <div className="m-tcf-tiendo-thanh">
                <div
                  className="m-tcf-tiendo-ruot"
                  style={{ width: `${x.tong ? Math.min(100, (x.soKiem / x.tong) * 100) : 0}%` }}
                />
              </div>
              {x.daKiem ? (
                <span className="m-tcf-tiendo-ngay" title={`Lần kiểm kê cuối ngày ${x.ngayCuoi}${x.lech ? `, lệch ${x.lech} mặt hàng` : ', khớp sổ sách'}`}>
                  {x.ngayCuoi.slice(0, 5)}
                </span>
              ) : (
                <span className="m-tcf-tiendo-lech">chưa kiểm</span>
              )}
            </div>
          ))}
        </div>

        {/* Thiếu nhiều nhất */}
        <div className="m-tcf-ds-tieu">THIẾU NHIỀU NHẤT</div>
        {kk.topThieu.length ? (
          kk.topThieu.map(x => (
            <div className="m-tcf-ds-dong" key={x.cn + x.ma}>
              <div className="m-tcf-ds-trai">
                <span className="m-tcf-ma-chip">{x.ma}</span>
                <span className="m-tcf-ds-ten" title={x.cn}>{x.ten}</span>
              </div>
              <span className="m-tcf-ds-phai do">−{Math.abs(x.lech).toLocaleString('vi-VN')} {x.dvt}</span>
            </div>
          ))
        ) : (
          <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--muted, #6b7280)' }}>
            Không có mặt hàng thiếu
          </div>
        )}

        {/* Thừa nhiều nhất */}
        <div className="m-tcf-ds-tieu">THỪA NHIỀU NHẤT</div>
        {kk.topThua.length ? (
          kk.topThua.map(x => (
            <div className="m-tcf-ds-dong" key={x.cn + x.ma}>
              <div className="m-tcf-ds-trai">
                <span className="m-tcf-ma-chip">{x.ma}</span>
                <span className="m-tcf-ds-ten" title={x.cn}>{x.ten}</span>
              </div>
              <span className="m-tcf-ds-phai xanh">+{x.lech.toLocaleString('vi-VN')} {x.dvt}</span>
            </div>
          ))
        ) : (
          <div style={{ padding: '8px 0', fontSize: 13, color: 'var(--muted, #6b7280)' }}>
            Không có mặt hàng thừa
          </div>
        )}

        {/* Nút Kiểm kê ngay */}
        <Link
          to="/app/kho/5-1-10/moi"
          className="m-tcf-nut-vien chu-xanh"
          style={{ marginTop: 14 }}
        >
          <Icon n="clipboard" className="ic sm" kieu="net" />
          <span>Kiểm kê ngay</span>
        </Link>
      </div>
    </>
  )
}
