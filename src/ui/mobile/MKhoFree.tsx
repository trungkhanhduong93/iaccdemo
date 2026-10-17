// Trang chủ gói Free điện thoại: khối Mua hàng & công nợ NCC, Hao hụt kiểm kê (T324)
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '../../app/session'
import { CUA_HANG } from '../../data/mock'
import { tinhToanTongQuan } from '../../modules/home/chiSo'
import { soLieuCongNo, soLieuKiemKe, soLieuMua } from '../../modules/home/khoFree'
import { datLocDaXem, docTuyChinh, luuTuyChinh } from '../bao-cao/tuyChinhBC'
import { moneyD, pct, short } from '../format'
import { Icon } from '../Icon'

export function MKhoFree({ selCns, thang }: { selCns: string[]; thang: number }) {
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
      {/* Khối Mua hàng & công nợ nhà cung cấp */}
      <div className="m-tc-the-ivt m-free-the m-tck-khoi">
        <div className="m-tc-the-head">
          <div className="m-tc-the-tieu-hop">
            <h3 className="m-tc-the-tieu">
              <Icon n="khohang" className="ic sm" /> Mua hàng &amp; công nợ nhà cung cấp
            </h3>
          </div>
          <div className="m-tck-links">
            <Link
              to="/app/bao-cao/4-2-7"
              className="m-tck-link"
              onClick={() => {
                luuTuyChinh(s.donVi, '4.2.7', { ...(docTuyChinh(s.donVi, '4.2.7') ?? {}), nhom: ['ma'], xemNhom: 'tongHop' })
                datLocDaXem('/app/bao-cao/4-2-7', {}, String(thang))
              }}
            >
              Bảng kê ›
            </Link>
            <Link
              to="/app/bao-cao/4-2-3"
              className="m-tck-link"
              onClick={() => datLocDaXem('/app/bao-cao/4-2-3', {}, String(thang))}
            >
              Công nợ ›
            </Link>
          </div>
        </div>
        <div className="bbt-e-mota">Giá trị hàng mua trong tháng và số tiền còn phải trả</div>

        <div className="m-tck-hai">
          <div className="m-tck-kpi">
            <div className="m-tck-hoi">Giá trị mua hàng {thang === 10 ? 'tháng này' : `tháng ${thang}`}</div>
            <div className="m-tck-tra" style={{ color: 'var(--blue, #0560a6)' }}>{moneyD(mua.nhap)}</div>
            <div className="m-tck-phu">
              {mua.soDon} phiếu
              {mua.soSanh && (
                <> · <span className={mua.soSanh.pct > 0 ? 'm-tck-tang' : 'm-tck-giam'} title={`So với ${mua.soSanh.nhan} (${short(mua.soSanh.truoc)})`}>
                  {mua.soSanh.pct > 0 ? '▲' : '▼'} {pct(Math.abs(mua.soSanh.pct))} so với cùng kỳ
                </span></>
              )}
            </div>
          </div>
          <div className="m-tck-kpi">
            <div className="m-tck-hoi">Công nợ phải trả</div>
            <div className="m-tck-tra" style={{ color: 'var(--orange-d, #d0650a)' }}>{moneyD(no.cuoiRong)}</div>
            <div className="m-tck-phu">{no.soNcc} nhà cung cấp</div>
          </div>
        </div>

        {/* Dòng chảy công nợ: khớp dòng Tổng cộng báo cáo 4.2.3 */}
        <div className="m-tck-dong-chay">
          <div className="m-tck-dong-t">
            <div className="m-tck-dong-l"><b>Nợ đầu kỳ</b><span>Còn nợ từ đầu tháng</span></div>
            <div className="m-tck-dong-r"><b>{moneyD(no.dau)}</b></div>
          </div>
          <div className="m-tck-dong-t">
            <div className="m-tck-dong-l"><b>+ Phát sinh mua nợ</b><span>Mua chưa thanh toán</span></div>
            <div className="m-tck-dong-r"><b>{moneyD(no.phatSinh)}</b></div>
          </div>
          <div className="m-tck-dong-t">
            <div className="m-tck-dong-l"><b>− Đã thanh toán</b></div>
            <div className="m-tck-dong-r"><b>{moneyD(no.traHang + no.thanhToan)}</b></div>
          </div>
          <div className="m-tck-dong-t m-tck-tong">
            <div className="m-tck-dong-l"><b>= Nợ cuối kỳ</b><span>Còn phải trả đến hôm nay</span></div>
            <div className="m-tck-dong-r"><b>{moneyD(no.cuoiRong)}</b></div>
          </div>
        </div>

        <div className="m-tck-ds">
          <div className="m-tck-nhom-wrap">
            <div className="m-tck-nhom">Mặt hàng mua nhiều nhất</div>
            {mua.topMh.map(x => (
              <div className="m-tck-dong" key={x.ma}>
                <span className="m-tck-ten"><span className="m-tck-ma">{x.ma}</span>{x.ten}</span>
                <b>{short(x.tien)}</b>
              </div>
            ))}
          </div>
          <div className="m-tck-nhom-wrap">
            <div className="m-tck-nhom">Nhà cung cấp nợ nhiều nhất</div>
            {no.top.map(x => (
              <div className="m-tck-dong" key={x.ten}>
                <span className="m-tck-ten" title={x.ten}>{x.ten}</span>
                <b>{short(x.v)}</b>
              </div>
            ))}
          </div>
        </div>

        <div className="m-tck-chan">
          <Link to="/app/mua-hang/4-1-1/moi" className="m-tck-btn">
            <Icon n="plus" className="ic sm" />Tạo phiếu mua hàng
          </Link>
          <Link to="/app/tien/2-1-1/moi?loai=chi&ly=CHI02" className="m-tck-btn">
            <Icon n="plus" className="ic sm" />Thanh toán nhà cung cấp
          </Link>
        </div>
      </div>

      {/* Khối Hao hụt kiểm kê */}
      <div className="m-tc-the-ivt m-free-the m-tck-khoi">
        <div className="m-tc-the-head">
          <div className="m-tc-the-tieu-hop">
            <h3 className="m-tc-the-tieu">
              <Icon n="khohang" className="ic sm" /> Hao hụt kiểm kê
            </h3>
          </div>
          <div className="m-tck-links">
            <Link
              to="/app/bao-cao/5-2-15"
              className="m-tck-link"
              onClick={() => datLocDaXem('/app/bao-cao/5-2-15', {}, String(thang))}
            >
              Báo cáo hao hụt ›
            </Link>
          </div>
        </div>
        <div className="bbt-e-mota">Chênh lệch giữa tồn thực tế và tồn trên sổ sách</div>

        {/* Gói Free chỉ theo dõi số lượng, không có số tiền thừa, thiếu */}
        <div className="m-tck-hoi">Mặt hàng chênh lệch {thang === 10 ? 'tháng này' : `tháng ${thang}`}</div>
        <div className="m-tck-tra m-tck-tra-lon" style={{ color: kk.thieu + kk.thua > 0 ? 'var(--red, #c2362b)' : 'var(--green, #138a52)' }}>
          {kk.thieu + kk.thua}
        </div>
        <div className="m-tck-phu">
          Thiếu {kk.thieu} · thừa {kk.thua} · đã kiểm {kk.soKiem}/{kk.tongMh}
        </div>

        <div className="m-tck-nhom">Tiến độ kiểm kê theo cửa hàng</div>
        <div className="m-tck-tien-do">
          {kk.theoCn.map(x => (
            <div className="m-tck-cn" key={x.cn}>
              <span className="m-tck-ten">{x.cn.replace(/^Phố Mây /, '')}</span>
              <span className="m-tck-thanh"><i style={{ width: `${x.tong ? Math.min(100, (x.soKiem / x.tong) * 100) : 0}%` }} /></span>
              <span className="m-tck-so">{x.soKiem}/{x.tong}</span>
              {x.daKiem
                ? <span className={x.lech ? 'm-tck-thieu' : 'm-tck-giam'}>{x.lech ? `lệch ${x.lech}` : 'khớp'}</span>
                : <span className="m-tck-thieu">chưa kiểm</span>}
            </div>
          ))}
        </div>

        <div className="m-tck-ds">
          <div className="m-tck-nhom-wrap">
            <div className="m-tck-nhom">Thiếu nhiều nhất</div>
            {kk.topThieu.length ? kk.topThieu.map(x => (
              <div className="m-tck-dong" key={x.cn + x.ma}>
                <span className="m-tck-ten" title={x.cn}><span className="m-tck-ma">{x.ma}</span>{x.ten}</span>
                <b className="m-tck-thieu">−{Math.abs(x.lech).toLocaleString('vi-VN')} {x.dvt}</b>
              </div>
            )) : <div className="m-tck-trong">Không có mặt hàng thiếu</div>}
          </div>
          <div className="m-tck-nhom-wrap">
            <div className="m-tck-nhom">Thừa nhiều nhất</div>
            {kk.topThua.length ? kk.topThua.map(x => (
              <div className="m-tck-dong" key={x.cn + x.ma}>
                <span className="m-tck-ten" title={x.cn}><span className="m-tck-ma">{x.ma}</span>{x.ten}</span>
                <b className="m-tck-thua">+{x.lech.toLocaleString('vi-VN')} {x.dvt}</b>
              </div>
            )) : <div className="m-tck-trong">Không có mặt hàng thừa</div>}
          </div>
        </div>

        <div className="m-tck-chan m-tck-chan-1">
          <Link to="/app/kho/5-1-10/moi" className="m-tck-btn m-tck-btn-full">
            <Icon n="plus" className="ic sm" />Kiểm kê ngay
          </Link>
        </div>
      </div>
    </>
  )
}
