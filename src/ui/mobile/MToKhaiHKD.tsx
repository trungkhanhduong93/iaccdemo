// Kê khai thuế gói Free, Standard trên điện thoại theo app iFaster (T623): khung danh sách như Thu chi (đầu trang riêng, tab Kê khai thuế,
// Báo cáo theo dõi, hàng lọc nút phễu và chip, nút nổi Lập tờ khai), tấm Lập tờ khai từ đáy, màn kê khai 4 bước toàn màn hình.
// Dữ liệu, cách tính dùng chung với web (ToKhaiHKD.tsx, T261).
import { useMemo, useState, type FC, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ScreenProps } from '../../modules/types'
import { useSession, type Session } from '../../app/session'
import { hienMan, tenMan, timMan } from '../../app/registry'
import { kyHieuBC, tenBC, tenBCNgan } from '../../modules/bao-cao/danh-sach'
import { CUA_HANG, DON_VI } from '../../data/mock'
import { DS_QUY_TIEN_112 } from '../../modules/danh-muc/data'
import { NHOM_NGANH_NGHE } from '../../modules/danh-muc/nganh-nghe'
import {
  BUOC, DIA_BAN, DS, DS_TT, NGANH, NHOM_DT, TEN_TO_KHAI, lapToKhai, soLieu, tenKy, tenLoai,
  type ToKhai, type TrangThai,
} from '../../modules/thue/ToKhaiHKD'
import { GoiYKeKhai, KhenToKhai, xongViecHuongDan } from '../../modules/home/HuongDan'
import { Icon } from '../Icon'
import { fold, moneyD } from '../format'
import { MChon } from './MChon'
import { MBaoCaoTheoDoi, type MucTheoDoi } from './MBaoCaoTheoDoi'
import { quayLaiMobile } from './quayLai'

const TT_BADGE: Record<TrangThai, string> = { 'Chưa nộp': 'warn', 'Đã nộp': 'ok', 'Bị từ chối': 'err', 'Đã huỷ': '' }
const tenNhom = () => NHOM_NGANH_NGHE.find(x => x.ma === NGANH.nhom)?.ten ?? ''

// Sổ thuế và bộ sổ TT152 của hộ kinh doanh (như khung Sổ sách của sơ đồ thuế); hiện sổ nào do cấu hình báo cáo quyết định
// theo gói, chế độ, cách tính thuế (CAU_HINH_BC qua hienMan), như danh sách báo cáo
const SO_THEO_DOI: [string, string][] = [
  ['thue', '6.2.5'], ['thue', '6.2.4'], ['thue', '6.2.3'], ['thue', '6.2.1'], ['thue', '6.2.2'],
  ['ban-hang', '3.2.5'], ['tong-hop', '10.4.1'], ['kho', '5.2.8'], ['tien', '2.2.7'],
]
function dsTheoDoi(s: Session): MucTheoDoi[] {
  return SO_THEO_DOI.flatMap(([mk, ma]) => {
    const slug = ma.replace(/\./g, '-')
    const { sc } = timMan(mk, slug)
    if (!sc || !hienMan(sc, s.goi, s.cheDo, s, true)) return []
    const kh = kyHieuBC(ma, s.cheDo, s)
    const ten = tenBCNgan(ma, s.cheDo, s) ?? tenBC(ma, s.cheDo, s) ?? tenMan(sc)
    return [{ ten: kh ? `${ten} (${kh})` : ten, path: `/app/${mk}/${slug}`, loai: 'bc' as const }]
  })
}

// Ô lọc như Xuất bán POS: bấm dòng mở bảng chọn, chọn là áp dụng ngay
interface GtLoc { nam: string; loai: string; tt: string }
const LOC_MAC_DINH: GtLoc = { nam: '2026', loai: '', tt: '' }
const DS_NAM = [{ k: '2026', ten: '2026' }, { k: '2025', ten: '2025' }, { k: '2024', ten: '2024' }, { k: 'tat-ca', ten: 'Tất cả các năm' }]

export const MToKhaiHKD: FC<ScreenProps> = () => {
  const nav = useNavigate()
  const { s, toast } = useSession()
  const [, veLai] = useState(0)
  const [timMo, setTimMo] = useState(false)
  const [tuKhoa, setTuKhoa] = useState('')
  const [loc, setLoc] = useState<GtLoc>(LOC_MAC_DINH)
  const [moLoc, setMoLoc] = useState(false)
  const [moChon, setMoChon] = useState<keyof GtLoc | null>(null)
  const [moTheoDoi, setMoTheoDoi] = useState(false)
  const [moiNhat, setMoiNhat] = useState(true)
  const [lap, setLap] = useState(false)
  const [mo, setMo] = useState<{ tk: ToKhai; buoc: number } | null>(null)

  const dsLoai = [...new Set(DS.map(x => tenLoai(x.lan)))].sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }))
  const oLoc: { k: keyof GtLoc; nhan: string; tatCa: string; ds: { k: string; ten: string }[] }[] = [
    { k: 'nam', nhan: 'Năm', tatCa: '', ds: DS_NAM },
    { k: 'loai', nhan: 'Loại tờ khai', tatCa: 'Tất cả', ds: dsLoai.map(v => ({ k: v, ten: v })) },
    { k: 'tt', nhan: 'Trạng thái', tatCa: 'Tất cả', ds: DS_TT.map(v => ({ k: v, ten: v })) },
  ]
  const giaTri = (o: (typeof oLoc)[number]) => o.ds.find(x => x.k === loc[o.k])?.ten ?? o.tatCa
  const coLoc = loc.nam !== LOC_MAC_DINH.nam || Boolean(loc.loai || loc.tt)
  const oDangMo = oLoc.find(o => o.k === moChon)

  const dangLam = DS.find(x => x.tt === 'Chưa nộp')
  const soDangLam = dangLam ? soLieu(dangLam) : null
  const q = fold(tuKhoa.trim())
  const ds = DS.filter(x => (loc.nam === 'tat-ca' || String(x.nam) === loc.nam) && (!loc.loai || tenLoai(x.lan) === loc.loai) && (!loc.tt || x.tt === loc.tt)
    && (!q || fold(`${x.ma} ${tenKy(x)} ${TEN_TO_KHAI}`).includes(q)))
  const nhomNam = [...new Set(ds.map(x => x.nam))].sort((a, b) => (moiNhat ? b - a : a - b))
    .map(n => ({ nam: n, ds: moiNhat ? ds.filter(x => x.nam === n) : ds.filter(x => x.nam === n).reverse() }))
  const theoDoi = useMemo(() => dsTheoDoi(s), [s])

  const lapMoi = (dau: boolean, n: number) => {
    const tk = lapToKhai(dau, n)
    setLap(false)
    setMo({ tk, buoc: 0 })
    toast(`Đã lập tờ khai ${tk.ma}`)
  }

  return (
    <div className="m-tc-man m-ds-khung m-tk">
      <header className="m-tc-header">
        <div className="m-tc-nav">
          <button type="button" className="m-tc-btn-nav" onClick={() => quayLaiMobile(nav, '/app/nghiep-vu')} aria-label="Quay lại">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <h1 className="m-tc-tieu-de">Kê khai thuế</h1>
          <button type="button" className={`m-tc-btn-nav${timMo ? ' on' : ''}`} aria-label="Tìm kiếm"
            onClick={() => { setTimMo(v => !v); if (timMo) setTuKhoa('') }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
          </button>
        </div>
        {timMo && (
          <div className="m-tc-tim-wrap">
            <svg className="m-tc-tim-ic" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" /></svg>
            <input type="text" autoFocus className="m-tc-tim-inp" placeholder="Mã, kỳ, tên tờ khai" value={tuKhoa}
              onChange={e => setTuKhoa(e.target.value)} aria-label="Tìm tờ khai" />
            {tuKhoa && (
              <button type="button" className="m-tc-tim-x" onClick={() => setTuKhoa('')} aria-label="Xoá tìm kiếm">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        )}
        <div className="m-tc-tabs" role="tablist">
          <button type="button" role="tab" aria-selected className="m-tc-tab-btn on">Kê khai thuế</button>
          <button type="button" role="tab" aria-selected={false} className="m-tc-tab-btn" onClick={() => setMoTheoDoi(true)}>Báo cáo theo dõi</button>
        </div>
      </header>

      <main className="m-tc-content">
        <div className="m-tc-loc-bar">
          <button type="button" className={`m-tc-btn-loc-vuong m-ds-nut-loc-vuong m-ds-nut-loc${coLoc ? ' co-loc' : ''}`} onClick={() => setMoLoc(true)} aria-label="Mở bộ lọc">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
            {coLoc && <span className="m-tc-loc-cham" />}
          </button>
          {oLoc.map(o => <span key={o.k} className="m-chip-xem">{o.nhan}: {giaTri(o)}</span>)}
        </div>

        {/* Tờ khai chưa nộp mới nhất, như thẻ đầu app iFaster */}
        {dangLam && soDangLam && (
          <div className="m-tk-noi">
            <div className="m-tk-noi-dau">
              <span>Tờ khai cần nộp</span>
              <span className="m-tacvu-badge warn">Chưa nộp</span>
            </div>
            <b className="m-tk-noi-ky">{tenKy(dangLam)}</b>
            <span className="m-tk-noi-ma">{dangLam.ma} · {tenLoai(dangLam.lan)}</span>
            <div className="m-tk-noi-so">
              <div><span>Doanh thu</span><b>{moneyD(soDangLam.dt)}</b></div>
              <div><span>Thuế phải nộp</span><b>{moneyD(soDangLam.tong)}</b></div>
            </div>
            <button type="button" className="btn pri m-tk-noi-nut" onClick={() => setMo({ tk: dangLam, buoc: 0 })}>
              Tiếp tục kê khai<Icon n="chevr" className="ic sm" />
            </button>
          </div>
        )}

        <div className="m-tc-hang-sap-xep">
          <span className="m-tc-sx-tieu-de">Danh sách tờ khai ({ds.length})</span>
          <button type="button" className="m-tc-sx-btn" onClick={() => setMoiNhat(v => !v)} aria-label="Sắp xếp tờ khai">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M6 12h12m-9 6h6" /></svg>
            <span>{moiNhat ? 'Mới nhất' : 'Cũ nhất'}</span>
          </button>
        </div>

        {ds.length === 0 ? (
          <div className="m-tc-trong"><p>Không có tờ khai nào phù hợp</p></div>
        ) : (
          <div className="m-tc-danh-sach">
            {nhomNam.map(n => (
              <section key={n.nam} className="m-tc-nhom-ngay">
                <div className="m-tc-ngay-header">
                  <span className="m-tc-ngay-chu">Năm {n.nam}</span>
                  <span className="m-tc-ngay-so">{n.ds.length} tờ khai</span>
                </div>
                <div className="m-tc-card-ngay">
                  {n.ds.map(x => {
                    const so = soLieu(x)
                    return (
                      <button key={x.id} type="button" className="m-tk-dong" onClick={() => setMo({ tk: x, buoc: 0 })}>
                        <span className="m-tk-dong-trai">
                          <b>{tenKy(x)}</b>
                          <small>{x.ma} · {tenLoai(x.lan)}</small>
                        </span>
                        <span className="m-tk-dong-phai">
                          <span className={`m-tacvu-badge ${TT_BADGE[x.tt]}`}>{x.tt}</span>
                          {x.tt !== 'Đã huỷ' && <b>{moneyD(so.tong)}</b>}
                        </span>
                        {/* số liệu từng kỳ như 4 cột danh sách web (T138) */}
                        {x.tt !== 'Đã huỷ' && (
                          <span className="m-tk-dong-so">
                            <span><small>Doanh thu tính thuế</small>{moneyD(so.dt)}</span>
                            <span><small>Giảm trừ</small>{moneyD(so.giam)}</span>
                            <span><small>Thuế GTGT</small>{moneyD(so.gtgt)}</span>
                            <span><small>Thuế TNCN</small>{moneyD(so.tncn)}</span>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <button type="button" className="m-tc-fab m-nut-them-fab m-ds-fab" onClick={() => setLap(true)} aria-label="Lập tờ khai">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        <span>Lập tờ khai</span>
      </button>

      {moLoc && (
        <div className="m-loc-overlay" onClick={() => setMoLoc(false)}>
          <div className="m-loc-tam" onClick={e => e.stopPropagation()}>
            <div className="m-tam-keo" />
            <div className="m-loc-dau">
              <h2 className="m-loc-tieu-de">Bộ lọc</h2>
              <button type="button" className="m-loc-btn-dong" onClick={() => setMoLoc(false)} aria-label="Đóng"><Icon n="x" className="ic sm" /></button>
            </div>
            <div className="m-loc-than">
              {oLoc.map(o => (
                <div key={o.k} className="m-loc-dong" onClick={() => setMoChon(o.k)}>
                  <div className="m-loc-dong-trai">
                    <span className="m-loc-dong-nhan">{o.nhan}</span>
                    <span className="m-loc-dong-tri">{giaTri(o)}</span>
                  </div>
                  <Icon n="chevr" className="ic sm m-loc-dong-ic" />
                </div>
              ))}
            </div>
            <div className="m-loc-day">
              <button type="button" className="m-loc-btn-reset" onClick={() => setLoc(LOC_MAC_DINH)}>Đặt lại</button>
              <button type="button" className="m-loc-btn-apply" onClick={() => setMoLoc(false)}>Áp dụng</button>
            </div>
          </div>
        </div>
      )}
      {oDangMo && (
        <MChon mo onDong={() => setMoChon(null)} tieuDe={oDangMo.nhan}
          ds={[...(oDangMo.tatCa ? [{ k: '', ten: oDangMo.tatCa }] : []), ...oDangMo.ds]}
          chon={loc[oDangMo.k]} onChon={v => setLoc(l => ({ ...l, [oDangMo.k]: v }))} />
      )}

      <MBaoCaoTheoDoi mo={moTheoDoi} onDong={() => setMoTheoDoi(false)} modKey="thue" tieuDe="Báo cáo theo dõi" ds={theoDoi} />
      {/* hướng dẫn Trang chủ (T138): khai xong thông tin kinh doanh thì khoanh số liệu tờ khai đầu danh sách, Lập tờ khai mở tấm chọn kỳ */}
      <GoiYKeKhai chon=".m-tk-dong:has(.m-tk-dong-so)" onLap={() => setLap(true)} />
      {lap && <TamLapToKhai onDong={() => setLap(false)} onLap={lapMoi} />}
      {mo && <ManKeKhai tk={mo.tk} buocDau={mo.buoc} onDong={() => setMo(null)} onDoi={() => veLai(x => x + 1)} />}
    </div>
  )
}

/** Tấm Lập tờ khai từ đáy: nhóm doanh thu, kỳ kê khai khoá theo thiết lập; chọn năm, kỳ 6 tháng */
function TamLapToKhai({ onDong, onLap }: { onDong: () => void; onLap: (dau: boolean, nam: number) => void }) {
  const [nam, setNam] = useState(2026)
  const [dau, setDau] = useState(false)   // 6 tháng đầu năm 2026 đã có tờ khai nên mặc định kỳ đang chạy
  const o = (nhan: string, noiDung: ReactNode) => <div className="m-tk-o"><span>{nhan}</span>{noiDung}</div>
  const nut = <T,>(ds: [T, string][], v: T, dat: (x: T) => void) => (
    <div className="m-tk-tach">
      {ds.map(([k, ten]) => <button key={ten} type="button" className={k === v ? 'on' : ''} onClick={() => dat(k)}>{ten}</button>)}
    </div>
  )
  return (
    <div className="m-tk-nen" onClick={onDong}>
      <div className="m-tk-tam" role="dialog" aria-modal="true" aria-label="Lập tờ khai" onClick={e => e.stopPropagation()}>
        <div className="m-tam-keo" />
        <div className="m-tk-tam-dau">
          <b>Lập tờ khai</b>
          <button type="button" className="m-tk-x" aria-label="Đóng" onClick={onDong}><Icon n="x" className="ic sm" /></button>
        </div>
        <div className="m-tk-tam-than">
          {o('Nhóm doanh thu', <div className="m-tk-khoa">{NHOM_DT}</div>)}
          {o('Năm', nut<number>([[2026, '2026'], [2025, '2025']], nam, setNam))}
          {o('Kỳ kê khai', <div className="m-tk-khoa">6 tháng</div>)}
          {o('Kỳ', nut<boolean>([[true, '6 tháng đầu năm'], [false, '6 tháng cuối năm']], dau, setDau))}
          {o('Tờ khai', <p className="m-tk-ten">{TEN_TO_KHAI}</p>)}
        </div>
        <div className="m-tk-chan">
          <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          <button type="button" className="btn pri" onClick={() => onLap(dau, nam)}>Lập tờ khai</button>
        </div>
      </div>
    </div>
  )
}

/** Màn kê khai 4 bước toàn màn hình: vạch tiến độ bấm được, nội dung bước dạng thẻ, Quay lại, Tiếp tục ở đáy */
function ManKeKhai({ tk, buocDau, onDong, onDoi }: { tk: ToKhai; buocDau: number; onDong: () => void; onDoi: () => void }) {
  const { s, toast } = useSession()
  const nav = useNavigate()
  const [buoc, setBuoc] = useState(buocDau)
  const [xong, setXong] = useState(tk.tt === 'Chưa nộp' ? buocDau + 1 : BUOC.length)
  const dv = DON_VI.find(x => x.id === s.donVi) ?? DON_VI[0]
  const so = useMemo(() => soLieu(tk), [tk])
  const sua = tk.tt === 'Chưa nộp'
  const den = (b: number) => { setBuoc(b); setXong(x => Math.max(x, b + 1)) }
  const dong = (nhan: string, v: ReactNode, cls = '') => <div className={`m-tk-hang${cls}`}><span>{nhan}</span><b>{v}</b></div>
  const nganHang = DS_QUY_TIEN_112.filter(x => x.loai === 'Ngân hàng')

  const noiDung = [
    <>
      <div className="m-tacvu-ks-note warn">Kiểm tra kỹ Mã số thuế để đảm bảo quyền lợi khi thực hiện nghĩa vụ thuế điện tử.</div>
      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">Thông tin hộ kinh doanh</div>
        {dong('Mã số thuế', dv.mst || 'Chưa khai')}
        {dong('Tên hộ kinh doanh', dv.ten)}
        {dong('Người nộp thuế', dv.nguoiDaiDien)}
        {dong('Số điện thoại', '0903 118 226')}
        {dong('Email', 'ketoan@phomay.vn')}
      </div>
      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">Điểm bán hàng ({CUA_HANG.length})</div>
        {CUA_HANG.map((c, i) => {
          const db = DIA_BAN[i % DIA_BAN.length]
          return (
            <div key={c.id} className="m-tk-diem">
              <b>{c.ten}</b>
              <small>Mã địa điểm 0000{i + 1} · POS {c.posId}</small>
              <span>{db.dc}</span>
              <span>{db.cq}</span>
            </div>
          )
        })}
      </div>
    </>,
    <>
      <div className="m-tk-o-so">
        <div><span>Doanh thu {tenKy(tk)}</span><b>{moneyD(so.dt)}</b></div>
        <div className="nhan"><span>Tổng thuế phải nộp</span><b>{moneyD(so.tong)}</b></div>
      </div>
      <div className="m-tacvu-the">
        <div className="m-tacvu-the-tieu">I. Hoạt động kinh doanh có địa điểm cố định</div>
        <p className="m-tacvu-mota">{tenNhom()} · {NGANH.ten}</p>
        {dong('Doanh thu', moneyD(so.dt))}
        {dong(`Thuế GTGT (${NGANH.gtgt}%)`, moneyD(so.gtgt))}
        {dong(`Thuế TNCN (${String(NGANH.tncn).replace('.', ',')}%)`, moneyD(so.tncn))}
        {dong('Tổng thuế', moneyD(so.tong), ' tong')}
        {so.giam > 0 && <div className="m-tacvu-ks-note ok">Được giảm {moneyD(so.giam)} trước khi tính thuế TNCN (doanh thu cả năm đến 1 tỷ đồng không tính thuế TNCN).</div>}
      </div>
    </>,
    <div className="m-tacvu-the">
      <div className="m-tacvu-the-tieu">01/BK-STK · Bảng kê số tài khoản ngân hàng dùng cho kinh doanh</div>
      {nganHang.map(x => (
        <div key={x.stk} className="m-tk-diem">
          <span className="m-tk-diem-dau"><b>{x.stk}</b><span className="m-tacvu-badge ok">Đang hoạt động</span></span>
          <span>{x.ten}</span>
          <small>{dv.nguoiDaiDien.toUpperCase()} · {CUA_HANG[0].ten}</small>
        </div>
      ))}
    </div>,
    <>
      <div className="m-tk-giay">
        <div className="m-tk-giay-dau"><b>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><span>Độc lập - Tự do - Hạnh phúc</span></div>
        <h2>TỜ KHAI THUẾ ĐỐI VỚI HỘ KINH DOANH, CÁ NHÂN KINH DOANH</h2>
        <p className="m-tk-giay-ky">Kỳ tính thuế: {tenKy(tk)} · {tenLoai(tk.lan)}</p>
        {dong('Người nộp thuế', dv.ten)}
        {dong('Mã số thuế', dv.mst || 'Chưa khai')}
        {dong('Ngành nghề', NGANH.ten)}
        {dong('Số điểm kinh doanh', CUA_HANG.length)}
        <div className="m-tk-giay-nhom">{tenNhom()}</div>
        {dong('Doanh thu', moneyD(so.dt))}
        {dong('Thuế GTGT', moneyD(so.gtgt))}
        {dong('Thuế TNCN', moneyD(so.tncn))}
        {dong('Tổng cộng', moneyD(so.tong), ' tong')}
      </div>
      <p className="m-tacvu-mota">Mẫu xem trước, số liệu giả. Mẫu tờ khai cần kế toán trưởng duyệt trước khi dùng thật.</p>
    </>,
  ]

  return (
    <div className="m-tk-man" role="dialog" aria-modal="true" aria-label={`Kê khai thuế: ${tenKy(tk)}`}>
      <header className="m-tk-man-dau">
        <button type="button" className="m-tk-x" aria-label="Quay lại" onClick={onDong}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <span className="m-tk-man-ten"><b>Kê khai thuế</b><small>{tenKy(tk)} · {tk.ma}</small></span>
        <span className={`m-tacvu-badge ${TT_BADGE[tk.tt]}`}>{tk.tt}</span>
      </header>
      <div className="m-tk-buoc">
        <div className="m-tk-vach">
          {BUOC.map((b, i) => (
            <button key={b.ten} type="button" aria-label={`Bước ${i + 1}: ${b.ten}`}
              className={`${i < xong ? 'xong' : ''}${i === buoc ? ' on' : ''}`} onClick={() => den(i)} />
          ))}
        </div>
        <span className="m-tk-buoc-ten"><small>Bước {buoc + 1}/{BUOC.length}</small>{BUOC[buoc].ten}</span>
      </div>
      <div className="m-tk-man-than">{noiDung[buoc]}</div>
      {buoc === BUOC.length - 1 && sua && <KhenToKhai ky={tenKy(tk)} />}   {/* hướng dẫn Trang chủ (T138) */}
      <div className="m-tk-chan">
        {buoc === 0 ? <button type="button" className="btn" onClick={onDong}>Huỷ</button>
          : <button type="button" className="btn" onClick={() => setBuoc(buoc - 1)}>Quay lại</button>}
        {buoc < BUOC.length - 1 && <button type="button" className="btn pri" onClick={() => den(buoc + 1)}>Tiếp tục</button>}
        {buoc === BUOC.length - 1 && <>
          <button type="button" className="btn" onClick={() => toast(`Đã tải xuống tờ khai ${tk.ma} dạng XML`)}><Icon n="download" className="ic sm" />XML</button>
          {sua && <button type="button" className="btn pri" onClick={() => { tk.tt = 'Đã nộp'; onDoi(); toast(`Đã ghi nhận ${tk.ma} đã nộp cơ quan thuế`); onDong(); xongViecHuongDan('thue', tenKy(tk), s.donVi, nav) }}>Đã nộp CQT</button>}
        </>}
      </div>
    </div>
  )
}
