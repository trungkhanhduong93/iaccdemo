// Điện thoại (T803): màn Thông báo, màn Cài đặt thông báo, tấm trượt Góp ý và Mã hỗ trợ, nút đổi ngôn ngữ ở màn Khác
import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { useSession } from '../../app/session'
import { CoTron, CongTac, D, DongThongBao, PhanDoan, Sv } from '../../app/thong-bao/chung'
import { useMaHoTro } from '../../app/thong-bao/ThanhTren'
import { DS_CAI_DAT, DS_NGON_NGU, DS_THE, DS_THONG_BAO, nhomNgay, useThongBao, type TheTb } from '../../app/thong-bao/data'

/** Đặt nút vào góc phải thanh trên của khung điện thoại */
function NutGocPhai({ children }: { children: ReactNode }) {
  const [cho, setCho] = useState<HTMLElement | null>(null)
  useEffect(() => setCho(document.getElementById('m-thanh-tren-phai-slot')), [])
  return cho ? createPortal(children, cho) : null
}

export function MThongBao() {
  const tb = useThongBao()
  const [the, setThe] = useState<TheTb>('vh')
  const [chiMoi, setChiMoi] = useState(false)
  const ganDay = DS_THONG_BAO.filter(n => n.ago < 7)
  const ds = ganDay.filter(n => n.the === the && (!chiMoi || tb.chuaDoc(n)))
  const nhom = [...new Set(ds.map(nhomNgay))]

  return (
    <div className="m-tb">
      <NutGocPhai>
        <Link className="m-tb-nut-cd" to="/app/thong-bao/cai-dat" title="Cài đặt thông báo" aria-label="Cài đặt thông báo"><Sv d={D.banhRang} c={22} net={1.8} /></Link>
      </NutGocPhai>
      <div className="m-tb-the">
        <PhanDoan deu nhan="Thẻ thông báo" chon={the} onChon={setThe} ds={DS_THE.map(t => {
          const so = ganDay.filter(n => n.the === t.id && tb.chuaDoc(n)).length
          return { id: t.id, ten: <>{t.ten}{so > 0 && <em>{so}</em>}</> }
        })} />
      </div>
      <div className="m-tb-loc">
        <button type="button" className={`m-tb-chip${chiMoi ? '' : ' on'}`} aria-pressed={!chiMoi} onClick={() => setChiMoi(false)}>Tất cả</button>
        <button type="button" className={`m-tb-chip${chiMoi ? ' on' : ''}`} aria-pressed={chiMoi} onClick={() => setChiMoi(true)}>Chưa đọc</button>
        <span className="grow" />
        <button type="button" className="m-tb-doc-het" onClick={tb.docHet}>Đọc hết</button>
      </div>
      {nhom.map(g => (
        <section key={g}>
          <h2 className="m-tb-nhom">{g}</h2>
          <div className="m-tb-ds">
            {ds.filter(n => nhomNgay(n) === g).map(n => <DongThongBao key={n.id} n={n} chuaDoc={tb.chuaDoc(n)} onDoc={() => tb.danhDau([n.id])} />)}
          </div>
        </section>
      ))}
      {!ds.length && <div className="tb-trong lon">{chiMoi ? 'Đã đọc hết thông báo ở mục này.' : 'Chưa có thông báo ở mục này.'}</div>}
    </div>
  )
}

export function MCaiDatThongBao() {
  const tb = useThongBao()
  const { toast } = useSession()
  const nav = useNavigate()
  const [cd, setCd] = useState(tb.caiDat)
  const [q, setQ] = useState('')
  const tu = q.trim().toLowerCase()
  const ids = DS_CAI_DAT.flatMap(g => g.ds.map(r => r.id))
  const batHet = ids.every(id => cd[id])
  const nhom = DS_CAI_DAT.map(g => ({ ...g, ds: g.ds.filter(r => !tu || r.ten.toLowerCase().includes(tu)) })).filter(g => g.ds.length)

  return (
    <div className="m-tb m-tb-cd">
      <div className="m-tb-cd-than">
        <label className="tb-o-tim to"><Sv d={D.tim} net={2} />
          <input type="search" placeholder="Tìm loại thông báo" aria-label="Tìm loại thông báo" value={q} onChange={e => setQ(e.target.value)} />
        </label>
        <div className="m-tb-ds m-tb-cd-het">
          <div className="m-tb-cd-dong"><b className="grow">Bật tất cả</b>
            <CongTac to bat={batHet} nhan="Bật tất cả" onDoi={() => setCd(Object.fromEntries(ids.map(id => [id, !batHet])))} />
          </div>
        </div>
        {nhom.map(g => (
          <section key={g.ten}>
            <h2 className="m-tb-nhom">{g.ten}</h2>
            <div className="m-tb-ds">
              {g.ds.map(r => (
                <div key={r.id} className="m-tb-cd-dong"><span className="grow">{r.ten}</span>
                  <CongTac to bat={!!cd[r.id]} nhan={r.ten} onDoi={() => setCd(c => ({ ...c, [r.id]: !c[r.id] }))} />
                </div>
              ))}
            </div>
          </section>
        ))}
        {!nhom.length && <div className="tb-trong lon">Không có loại thông báo khớp từ tìm.</div>}
      </div>
      <div className="m-tb-cd-chan">
        <button type="button" className="m-tb-nut-chinh" onClick={() => { tb.luuCaiDat(cd); toast('Đã lưu cài đặt thông báo'); nav(-1) }}>Lưu</button>
      </div>
    </div>
  )
}

/** Tấm trượt từ đáy màn: bấm nền hoặc nút X để đóng */
function Tam({ ten, onDong, children }: { ten: string; onDong: () => void; children: ReactNode }) {
  return createPortal(
    <div className="m-tb-tam-nen" onClick={e => { if (e.target === e.currentTarget) onDong() }}>
      <section role="dialog" aria-modal="true" aria-label={ten} className="m-tb-tam">
        <span className="m-tb-tam-keo" />
        <div className="m-tb-tam-dau"><h2>{ten}</h2>
          <button type="button" aria-label="Đóng" onClick={onDong}><Sv d={D.x} c={20} net={2} /></button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  )
}

const LOAI_GOP_Y = [{ id: 'loi', ten: 'Báo lỗi' }, { id: 'dx', ten: 'Đề xuất' }, { id: 'khac', ten: 'Khác' }] as const

export function MTamGopY({ onDong }: { onDong: () => void }) {
  const { toast } = useSession()
  const [loai, setLoai] = useState<typeof LOAI_GOP_Y[number]['id']>('loi')
  const [tieuDe, setTieuDe] = useState('')
  const [nd, setNd] = useState('')
  const du = tieuDe.trim().length > 0 && nd.trim().length > 0
  return (
    <Tam ten="Góp ý" onDong={onDong}>
      <div className="m-tb-tam-than">
        <PhanDoan deu nhan="Loại góp ý" chon={loai} onChon={setLoai} ds={[...LOAI_GOP_Y]} />
        <label className="tb-o to"><span>Tiêu đề</span>
          <input placeholder="Tóm tắt trong 1 câu" maxLength={50} value={tieuDe} onChange={e => setTieuDe(e.target.value)} />
        </label>
        <label className="tb-o to"><span>Nội dung</span>
          <textarea placeholder="Đang làm ở màn nào, bấm gì, thấy gì" maxLength={2000} value={nd} onChange={e => setNd(e.target.value)} />
        </label>
        <label className="m-tb-them-anh" aria-label="Thêm ảnh"><Sv d={D.mayAnh} c={24} net={1.8} /><input type="file" accept="image/*" multiple hidden /></label>
      </div>
      <div className="m-tb-tam-chan">
        <button type="button" className="m-tb-nut-chinh" disabled={!du}
          onClick={() => { toast('Đã gửi góp ý. Bộ phận hỗ trợ phản hồi trong 1–2 ngày làm việc'); onDong() }}>Gửi</button>
      </div>
    </Tam>
  )
}

export function MTamMaHoTro({ onDong }: { onDong: () => void }) {
  const m = useMaHoTro()
  return (
    <Tam ten="Mã hỗ trợ" onDong={onDong}>
      <div className="m-tb-tam-than">
        <p className="m-tb-ma-chu">Đọc mã này cho nhân viên hỗ trợ để họ vào xem phiên làm việc của bạn.</p>
        <div className="m-tb-ma-o"><b>{m.ma}</b><span>Hết hạn lúc {m.han}</span></div>
        <div className="m-tb-ma-nut">
          <button type="button" className="m-tb-nut-phu" onClick={m.taoMoi}>Tạo mã mới</button>
          <button type="button" className="m-tb-nut-chinh" onClick={m.chep}>{m.daChep ? 'Đã chép' : 'Chép mã'}</button>
        </div>
      </div>
    </Tam>
  )
}

/** Nút đổi ngôn ngữ ở chân màn Khác: menu bật lên phía trên nút */
export function MNutNgonNgu() {
  const tb = useThongBao()
  const [mo, setMo] = useState(false)
  return (
    <div className="m-tb-nn">
      <button type="button" className="m-tb-nn-nut" aria-haspopup="menu" aria-expanded={mo} onClick={() => setMo(v => !v)}>
        <CoTron nn={tb.nn} c={26} /><span>{DS_NGON_NGU.find(l => l.id === tb.nn)?.ten}</span><Sv d={mo ? D.len : D.xuong} c={16} net={2.2} />
      </button>
      {mo && (
        <>
          <div className="m-tb-nn-nen" onClick={() => setMo(false)} />
          <div className="m-tb-nn-menu" role="menu" aria-label="Ngôn ngữ">
            {DS_NGON_NGU.map(l => (
              <button key={l.id} type="button" role="menuitemradio" aria-checked={tb.nn === l.id} className={tb.nn === l.id ? 'on' : undefined}
                onClick={() => { tb.doiNgonNgu(l.id); setMo(false) }}>
                <CoTron nn={l.id} c={26} /><span className="grow">{l.ten}</span>{tb.nn === l.id && <Sv d={D.tich} net={2.4} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
