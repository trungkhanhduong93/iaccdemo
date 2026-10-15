// Các thành phần biểu đồ và thẻ cảnh báo dùng chung cho trang chủ gói Free (T274)
import { Link } from 'react-router-dom'
import { Icon } from '../../ui/Icon'
import { moneyD, pct, short } from '../../ui/format'
import type {
  DuLieuCanTheoDoi,
  ItemTop5,
  LaiLoCnItem,
  TheTop5Data,
} from './soLieuBieuDoFree'

/** Màu sắc chủ đạo theo loại thẻ */
const MAU_THE = {
  doanhThu: 'var(--blue, #0560a6)',
  chiPhi: 'var(--orange-d, #c2410c)',
  giaVon: 'var(--amber, #b45309)',
  nhaCungCap: 'var(--teal, #0f766e)',
  chiTien: 'var(--indigo, #4338ca)',
}

/** Định dạng số thập phân dùng dấu phẩy kiểu Việt Nam: 10.8 -> 10,8 (T274) */
export function vnNum(n: number, maxD = 1): string {
  if (isNaN(n) || !isFinite(n)) return '0'
  return n.toLocaleString('vi-VN', { maximumFractionDigits: maxD })
}

/** 1. Thẻ biểu đồ top 5 thanh ngang (T274) */
export function TheTop5Hbar({ data, loai = 'doanhThu' }: { data: TheTop5Data; loai?: keyof typeof MAU_THE }) {
  const mau = MAU_THE[loai] || MAU_THE.doanhThu
  const maxVal = Math.max(1, ...data.items.map(x => x.soTien))

  return (
    <div className="bbt-the-bd">
      <div className="bbt-the-bd-dau">
        <div className="bbt-the-bd-tieu-hop">
          <h3 className="bbt-the-bd-tieu">{data.tieuDe}</h3>
          <span className="bbt-the-bd-thang">Tháng {data.thang}/2026</span>
        </div>
        <div className="bbt-the-bd-tong-hop">
          <span className="bbt-the-bd-tong-nhan">{data.nhanTong}</span>
          <b className="bbt-the-bd-tong-so">{moneyD(data.tong)}</b>
        </div>
      </div>

      <div className="bbt-the-bd-ds">
        {data.items.map((it: ItemTop5, idx: number) => {
          const tyLeBar = Math.min(100, Math.max(6, Math.round((it.soTien / maxVal) * 100)))
          return (
            <div
              key={it.ten || idx}
              className="bbt-the-bd-dong"
              title={`${it.ten}: ${moneyD(it.soTien)} (${pct(it.phanTram / 100)})`}
            >
              <div className="bbt-the-bd-dong-info">
                <span className="bbt-the-bd-dong-stt">{idx + 1}</span>
                <span className="bbt-the-bd-dong-ten" title={it.ten}>{it.ten}</span>
                <span className="grow" />
                <b className="bbt-the-bd-dong-tien">{moneyD(it.soTien)}</b>
                <span className="bbt-the-bd-dong-pct">{pct(it.phanTram / 100)}</span>
              </div>
              <div className="bbt-the-bd-thanh-nen">
                <div
                  className="bbt-the-bd-thanh-chinh"
                  style={{ width: `${tyLeBar}%`, background: mau }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="bbt-the-bd-chan">
        <Link to={data.link} className="bbt-the-bd-link" title={data.nhanLink}>
          <span>{data.nhanLink}</span>
          <Icon n="chevr" className="ic sm" />
        </Link>
      </div>
    </div>
  )
}

/** 2. Thẻ biểu đồ Lãi lỗ theo chi nhánh (T274) */
export function TheLaiLoChiNhanh({ ds, thang }: { ds: LaiLoCnItem[]; thang: number }) {
  const maxVal = Math.max(1, ...ds.flatMap(x => [x.dt, x.cp]))

  return (
    <div className="bbt-the-bd bbt-the-bd--cn">
      <div className="bbt-the-bd-dau">
        <div className="bbt-the-bd-tieu-hop">
          <h3 className="bbt-the-bd-tieu">Lãi lỗ theo chi nhánh</h3>
          <span className="bbt-the-bd-thang">Tháng {thang}/2026</span>
        </div>
        <div className="bbt-bd-chu-thich">
          <span className="bbt-ct-muc"><i className="bbt-ct-dot dt" /> Doanh thu</span>
          <span className="bbt-ct-muc"><i className="bbt-ct-dot cp" /> Chi phí</span>
          <span className="bbt-ct-muc"><i className="bbt-ct-dot lai" /> Lãi</span>
          <span className="bbt-ct-muc"><i className="bbt-ct-dot lo" /> Lỗ</span>
        </div>
      </div>

      {/* Biểu đồ cột SVG cho các chi nhánh */}
      <div className="bbt-cn-bd-hop">
        <div className="bbt-cn-luoi">
          {ds.map(cn => {
            const hDt = Math.round((cn.dt / maxVal) * 110)
            const hCp = Math.round((cn.cp / maxVal) * 110)
            const hLai = Math.max(4, Math.round((Math.abs(cn.lai) / maxVal) * 110))

            return (
              <div
                key={cn.id}
                className={`bbt-cn-cot-nhom ${cn.dangChon ? 'dang-chon' : ''}`}
                title={`${cn.ten}
Doanh thu: ${moneyD(cn.dt)}
Chi phí: ${moneyD(cn.cp)}
${cn.lo ? 'Lỗ' : 'Lãi'}: ${moneyD(Math.abs(cn.lai))}`}
              >
                <div className="bbt-cn-cot-khung">
                  <div className="bbt-cn-thanh-cot dt" style={{ height: `${hDt}px` }}>
                    <span className="bbt-cn-cot-val">{short(cn.dt)}</span>
                  </div>
                  <div className="bbt-cn-thanh-cot cp" style={{ height: `${hCp}px` }}>
                    <span className="bbt-cn-cot-val">{short(cn.cp)}</span>
                  </div>
                  <div
                    className={`bbt-cn-thanh-cot ${cn.lo ? 'lo' : 'lai'}`}
                    style={{ height: `${hLai}px` }}
                  >
                    <span className="bbt-cn-cot-val">{short(Math.abs(cn.lai))}</span>
                  </div>
                </div>

                <div className="bbt-cn-ten-hop">
                  <span className="bbt-cn-ten">{cn.ten}</span>
                  {cn.dangChon && <span className="bbt-cn-chip-chon">Đang chọn</span>}
                </div>

                <div className={`bbt-cn-lai-dong ${cn.lo ? 'lo' : 'lai'}`}>
                  <b>{cn.lo ? `Lỗ ${moneyD(Math.abs(cn.lai))}` : moneyD(cn.lai)}</b>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bbt-the-bd-chan">
        <Link to="/app/bao-cao/10-2-3" className="bbt-the-bd-link">
          <span>Xem kết quả kinh doanh</span>
          <Icon n="chevr" className="ic sm" />
        </Link>
      </div>
    </div>
  )
}

/** 3. Biểu đồ chi nhánh bên trong modal lãi lỗ khi Tất cả chi nhánh (T274) */
export function BieuDoChiNhanhModal({ ds, thang }: { ds: LaiLoCnItem[]; thang: number }) {
  const maxVal = Math.max(1, ...ds.flatMap(x => [x.dt, x.cp]))

  return (
    <div className="bbt-modal-cn-wrap">
      <div className="bbt-modal-cn-luoi">
        {ds.map(cn => {
          const hDt = Math.round((cn.dt / maxVal) * 140)
          const hCp = Math.round((cn.cp / maxVal) * 140)
          const hLai = Math.max(6, Math.round((Math.abs(cn.lai) / maxVal) * 140))

          return (
            <div key={cn.id} className="bbt-modal-cn-cot">
              <div className="bbt-modal-cn-bieu-do">
                <div className="bbt-cn-thanh-cot dt" style={{ height: `${hDt}px` }}>
                  <span className="bbt-cn-cot-val">{short(cn.dt)}</span>
                </div>
                <div className="bbt-cn-thanh-cot cp" style={{ height: `${hCp}px` }}>
                  <span className="bbt-cn-cot-val">{short(cn.cp)}</span>
                </div>
                <div
                  className={`bbt-cn-thanh-cot ${cn.lo ? 'lo' : 'lai'}`}
                  style={{ height: `${hLai}px` }}
                >
                  <span className="bbt-cn-cot-val">{short(Math.abs(cn.lai))}</span>
                </div>
              </div>
              <div className="bbt-modal-cn-ten"><b>{cn.ten}</b></div>
              <div className={`bbt-modal-cn-so ${cn.lo ? 'lo' : 'lai'}`}>
                {cn.lo ? `Lỗ ${moneyD(Math.abs(cn.lai))}` : moneyD(cn.lai)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bảng chi tiết lãi lỗ theo chi nhánh */}
      <div className="bbt-modal-cn-bang-hop">
        <table className="bbt-modal-cn-bang">
          <thead>
            <tr>
              <th>Chi nhánh</th>
              <th className="num">Doanh thu</th>
              <th className="num">Chi phí</th>
              <th className="num">Lãi lỗ</th>
              <th className="num">Biên lãi</th>
            </tr>
          </thead>
          <tbody>
            {ds.map(cn => (
              <tr key={cn.id}>
                <td><b>{cn.ten}</b></td>
                <td className="num">{moneyD(cn.dt)}</td>
                <td className="num">{moneyD(cn.cp)}</td>
                <td className={`num ${cn.lo ? 'lo' : 'lai'}`}>
                  <b>{cn.lo ? `Lỗ ${moneyD(Math.abs(cn.lai))}` : moneyD(cn.lai)}</b>
                </td>
                <td className="num">{pct(cn.bienLai)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** 4. Lưới thẻ tab Cần theo dõi (T274) */
export function LuoiCanTheoDoi({ data, thang }: { data: DuLieuCanTheoDoi; thang: number }) {
  return (
    <div className="bbt-ctd-grid">
      {/* Thẻ 1: Công nợ quá hạn cần thanh toán */}
      <div className="bbt-ctd-card">
        <div className="bbt-ctd-head">
          <div className="bbt-ctd-icon red"><Icon n="clock" className="ic sm" /></div>
          <div className="bbt-ctd-title-group">
            <h3 className="bbt-ctd-title">Công nợ quá hạn cần thanh toán</h3>
            <span className="bbt-ctd-sub">Có {data.congNoQuaHan.soNcc} nhà cung cấp quá hạn</span>
          </div>
          <span className="bbt-ctd-tag red">Cần chi trả</span>
        </div>

        <div className="bbt-ctd-so-lon red">
          {moneyD(data.congNoQuaHan.tongTien)}
        </div>
        <div className="bbt-ctd-note-minhhoa">Số minh hoạ</div>

        <div className="bbt-ctd-ds">
          {data.congNoQuaHan.top5.map((it, i) => (
            <div key={i} className="bbt-ctd-dong">
              <span className="bbt-ctd-dong-ten" title={it.ten}>{it.ten}</span>
              <span className="grow" />
              <b className="bbt-ctd-dong-tien">{moneyD(it.soTien)}</b>
              <span className="bbt-ctd-dong-tag red">quá {it.soNgay} ngày</span>
            </div>
          ))}
        </div>

        <div className="bbt-ctd-foot">
          <Link to={data.congNoQuaHan.link} className="bbt-the-bd-link">
            <span>Xem chi tiết</span>
            <Icon n="chevr" className="ic sm" />
          </Link>
        </div>
      </div>

      {/* Thẻ 2: Hàng hoá âm kho */}
      <div className="bbt-ctd-card">
        <div className="bbt-ctd-head">
          <div className="bbt-ctd-icon red"><Icon n="khohang" className="ic sm" /></div>
          <div className="bbt-ctd-title-group">
            <h3 className="bbt-ctd-title">Hàng hoá âm kho</h3>
            <span className="bbt-ctd-sub">Xuất bán trước khi ghi phiếu nhập</span>
          </div>
          <span className="bbt-ctd-tag red">Cần rà soát</span>
        </div>

        <div className="bbt-ctd-so-lon red">
          {data.amKho.soMatHang} mặt hàng
        </div>
        <div className="bbt-ctd-note-minhhoa">Số minh hoạ</div>

        <div className="bbt-ctd-ds">
          {data.amKho.top5.map((it, i) => (
            <div key={i} className="bbt-ctd-dong">
              <div className="bbt-ctd-dong-trai">
                <span className="bbt-ctd-dong-ten" title={it.ten}>{it.ten}</span>
                <small className="bbt-ctd-dong-kho">{it.kho}</small>
              </div>
              <span className="grow" />
              <b className="bbt-ctd-dong-tien red">âm {vnNum(it.soLuong)} {it.dvt}</b>
            </div>
          ))}
        </div>

        <div className="bbt-ctd-foot">
          <Link to={data.amKho.link} className="bbt-the-bd-link">
            <span>Xem chi tiết</span>
            <Icon n="chevr" className="ic sm" />
          </Link>
        </div>
      </div>

      {/* Thẻ 3: Hàng hoá huỷ cao */}
      <div className="bbt-ctd-card">
        <div className="bbt-ctd-head">
          <div className="bbt-ctd-icon orange"><Icon n="trash" className="ic sm" /></div>
          <div className="bbt-ctd-title-group">
            <h3 className="bbt-ctd-title">Hàng hoá huỷ cao</h3>
            <span className="bbt-ctd-sub">Hao hụt sơ chế và hỏng cuối ca</span>
          </div>
          <span className="bbt-ctd-tag orange">Hao hụt</span>
        </div>

        <div className="bbt-ctd-so-lon orange">
          {moneyD(data.huyHang.tongTien)}
        </div>
        <div className="bbt-ctd-note-minhhoa">Số minh hoạ</div>

        <div className="bbt-ctd-ds">
          {data.huyHang.top5.map((it, i) => (
            <div key={i} className="bbt-ctd-dong">
              <div className="bbt-ctd-dong-trai">
                <span className="bbt-ctd-dong-ten" title={it.ten}>{it.ten}</span>
                <small className="bbt-ctd-dong-kho">{vnNum(it.soLuong)} {it.dvt}</small>
              </div>
              <span className="grow" />
              <b className="bbt-ctd-dong-tien">{moneyD(it.giaTri)}</b>
              <span className="bbt-ctd-dong-tag orange">{vnNum(it.tyLe)}% so với nhập</span>
            </div>
          ))}
        </div>

        <div className="bbt-ctd-foot">
          <Link to={data.huyHang.link} className="bbt-the-bd-link">
            <span>Xem chi tiết</span>
            <Icon n="chevr" className="ic sm" />
          </Link>
        </div>
      </div>

      {/* Thẻ 4: Doanh thu lệch so với POS */}
      <div className="bbt-ctd-card">
        <div className="bbt-ctd-head">
          <div className="bbt-ctd-icon orange"><Icon n="receipt" className="ic sm" /></div>
          <div className="bbt-ctd-title-group">
            <h3 className="bbt-ctd-title">Doanh thu lệch so với POS</h3>
            <span className="bbt-ctd-sub">Chưa đồng bộ đủ chứng từ bán hàng</span>
          </div>
          <span className="bbt-ctd-tag orange">Lệch {data.lechPos.soNgayLech} ngày</span>
        </div>

        <div className="bbt-ctd-so-lon orange">
          Lệch {moneyD(data.lechPos.tongLech)}
        </div>
        <div className="bbt-ctd-note-minhhoa">Số minh hoạ</div>

        {/* Biểu đồ cặp 7 ngày gần nhất */}
        <div className="bbt-pos-7ngay">
          {data.lechPos.dsNgay.map((d, i) => {
            const hPos = Math.round((d.dtPos / 35_000_000) * 48)
            const hKt = Math.round((d.dtKt / 35_000_000) * 48)
            return (
              <div
                key={i}
                className={`bbt-pos-ngay-cot ${d.coLech ? 'co-lech' : ''}`}
                title={`Ngày ${d.ngay}
POS: ${moneyD(d.dtPos)}
Kế toán: ${moneyD(d.dtKt)}
${d.coLech ? `Lệch: ${moneyD(d.lech)}` : 'Khớp hoàn toàn'}`}
              >
                <div className="bbt-pos-cap-thanh">
                  <div className="bbt-pos-bar pos" style={{ height: `${hPos}px` }} />
                  <div
                    className={`bbt-pos-bar kt ${d.coLech ? 'lech' : ''}`}
                    style={{ height: `${hKt}px` }}
                  />
                </div>
                <span className="bbt-pos-ngay-nhan">{d.ngay.slice(0, 2)}</span>
              </div>
            )
          })}
        </div>

        <div className="bbt-ctd-foot">
          <Link to={data.lechPos.link} className="bbt-the-bd-link">
            <span>Xem chi tiết</span>
            <Icon n="chevr" className="ic sm" />
          </Link>
        </div>
      </div>

      {/* Thẻ 5: Tháng chưa khoá sổ */}
      <div className="bbt-ctd-card">
        <div className="bbt-ctd-head">
          <div className="bbt-ctd-icon orange"><Icon n="lock" className="ic sm" /></div>
          <div className="bbt-ctd-title-group">
            <h3 className="bbt-ctd-title">Tháng chưa khoá sổ</h3>
            <span className="bbt-ctd-sub">Cần chốt số liệu trước khi kết kỳ</span>
          </div>
          <span className="bbt-ctd-tag orange">Chưa khoá</span>
        </div>

        <div className="bbt-ctd-so-lon orange">
          {data.chuaKhoaSo.soThang} tháng chưa khoá
        </div>

        <div className="bbt-ctd-ds" style={{ marginTop: 12 }}>
          {data.chuaKhoaSo.danhSach.map((th, i) => (
            <div key={i} className="bbt-ctd-dong">
              <span className="bbt-ctd-dong-ten"><b>{th}</b></span>
              <span className="grow" />
              <span className="bbt-ctd-dong-tag orange">chưa khoá sổ</span>
            </div>
          ))}
        </div>

        <div className="bbt-ctd-foot">
          <Link to={data.chuaKhoaSo.link} className="bbt-the-bd-link">
            <span>Khoá sổ</span>
            <Icon n="chevr" className="ic sm" />
          </Link>
        </div>
      </div>

      {/* Thẻ 6: Biến động chi phí so với tháng trước */}
      <div className="bbt-ctd-card">
        <div className="bbt-ctd-head">
          <div className="bbt-ctd-icon green"><Icon n="pulse" className="ic sm" /></div>
          <div className="bbt-ctd-title-group">
            <h3 className="bbt-ctd-title">Biến động chi phí</h3>
            <span className="bbt-ctd-sub">So sánh với tháng {Math.max(1, thang - 1)}/2026</span>
          </div>
          <span className="bbt-ctd-tag green">Đã cân đối</span>
        </div>

        <div className={`bbt-ctd-so-lon ${data.bienDongCp.chenhLechPct >= 0 ? 'red' : 'green'}`}>
          {vnNum(Math.abs(data.bienDongCp.chenhLechPct))}%
        </div>

        <div className="bbt-ctd-ds" style={{ marginTop: 8 }}>
          {data.bienDongCp.top3.map((it, i) => (
            <div key={i} className="bbt-ctd-dong">
              <span className="bbt-ctd-dong-ten" title={it.ten}>{it.ten}</span>
              <span className="grow" />
              <b className={`bbt-ctd-dong-tien ${it.tang ? 'red' : 'green'}`}>
                {vnNum(it.pct)}%
              </b>
            </div>
          ))}
        </div>

        <div className="bbt-ctd-foot">
          <Link to={data.bienDongCp.link} className="bbt-the-bd-link">
            <span>Xem chi tiết</span>
            <Icon n="chevr" className="ic sm" />
          </Link>
        </div>
      </div>
    </div>
  )
}
