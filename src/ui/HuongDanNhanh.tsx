// Hướng dẫn nhanh từng màn (T673, QD86): nút la bàn cuối thanh tab phân hệ, bấm thì khung trượt ra bên phải, không che màn.
// Khung có 4 mục: Màn này để làm gì, Làm nhanh (kèm sơ đồ khung màn đánh số khớp từng bước), Lưu ý, Đi tiếp (sơ đồ luồng lấy từ quy-trinh.ts).
// Nội dung riêng của màn nằm ở src/modules/<phân hệ>/huong-dan.ts, tra theo slug màn; màn chưa có thì dùng bộ chung theo kiểu màn.
// Lần đầu mở một màn: nút nhấp nháy, bấm mới mở khung. Đã bấm thì màn đó thôi nhấp nháy, nhớ theo người dùng và màn.
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSession, type Session } from '../app/session'
import { MODULES, dich, hienMan, laBaoCao, moDuoc, nhanTab } from '../app/registry'
import { anNgoaiGoi, type Goi } from '../app/plan'
import type { ModuleDef, NutQT, QuyTrinhDef, ScreenDef } from '../modules/types'
import { baoCaoCuaPhanHe } from '../modules/bao-cao/cuaPhanHe'
import { Icon } from './Icon'

/** Một bước Làm nhanh. o: khoá ô trên sơ đồ khung màn mà bước chỉ tới; di: đường dẫn sau /app/ cho nút làm ngay, nutDi: chữ trên nút đó */
export interface BuocHD { chu: string; o?: string; di?: string; nutDi?: string }
/** Ô trên sơ đồ khung màn. rong: hệ số giãn ngang; kieu nut là nút xanh, tab là hàng tab, bang là khối bảng cao */
export interface OSoDo { k: string; ten: string; rong?: number; kieu?: 'nut' | 'tab' | 'bang' }
export interface HuongDanMan {
  muc: string              // Màn này để làm gì, 1 câu
  buoc: BuocHD[]           // Làm nhanh, 3 đến 5 bước
  luuY?: string[]
  soDo?: OSoDo[][]         // sơ đồ khung màn, mỗi phần tử là một hàng ô từ trên xuống
  goi?: Goi[]              // chỉ dùng ở các gói này, gói khác dùng bộ chung
  quyTrinh?: { mod: string; khop?: string[] }   // Đi tiếp lấy sơ đồ của phân hệ khác; khop: ô sơ đồ tính là màn này, dạng 'phân hệ/slug'
}

const NOI_DUNG: Record<string, Record<string, HuongDanMan>> = Object.fromEntries(
  Object.entries(import.meta.glob<{ huongDan: Record<string, HuongDanMan> }>('../modules/*/huong-dan.ts', { eager: true }))
    .map(([p, m]) => [p.split('/')[2], m.huongDan]),
)

// ── Bộ chung theo kiểu màn: phần lớn màn dựng từ cùng khuôn nên dùng chung được ──
const O_LOC: OSoDo = { k: 'loc', ten: 'Thời gian, tìm, Lọc', rong: 3 }
const O_THEM: OSoDo = { k: 'them', ten: 'Thêm mới', kieu: 'nut' }

function boChung(sc: ScreenDef, mod: ModuleDef): HuongDanMan {
  const ten = nhanTab(sc)
  if (laBaoCao(sc)) return {
    muc: `Xem ${ten} theo kỳ, in hoặc xuất ra file.`,
    buoc: [
      { chu: 'Chọn kỳ báo cáo, bấm Lọc để lấy số.', o: 'loc' },
      { chu: 'Đọc số trên tờ báo cáo. Bấm số chứng từ để mở phiếu gốc.', o: 'to' },
      { chu: 'Bấm In để in, bấm Xuất báo cáo để tải file về máy.', o: 'in' },
      { chu: 'Bấm tên báo cáo phía trên để đổi sang báo cáo khác.', o: 'chon' },
    ],
    luuY: ['Nút Tuỳ chỉnh chọn cột hiện trên báo cáo.'],
    soDo: [[{ k: 'chon', ten: 'Tên báo cáo', rong: 3 }, { k: 'in', ten: 'In, Xuất báo cáo', kieu: 'nut' }], [{ k: 'loc', ten: 'Kỳ báo cáo, Lọc' }], [{ k: 'to', ten: 'Tờ báo cáo', kieu: 'bang' }]],
  }
  if (sc.kind === 'voucher') {
    const them = !sc.voucher?.khongThem
    const nhieuLoai = (sc.voucher?.loai?.length ?? 0) > 1
    return {
      muc: them ? `Lập mới, tìm và xem lại chứng từ ${ten}.` : `Xem lại chứng từ ${ten}. Phiếu ở đây do phiếu khác sinh ra, không lập tay.`,
      buoc: [
        ...(them ? [
          { chu: nhieuLoai ? 'Bấm Thêm mới để lập chứng từ. Bấm mũi tên cạnh nút để chọn loại phiếu.' : 'Bấm Thêm mới để lập chứng từ.', o: 'them' },
          { chu: 'Điền thông tin rồi bấm Lưu hoặc Ctrl + S.' },
        ] : []),
        { chu: 'Chọn thời gian, gõ số hoặc diễn giải, bấm Lọc để tìm.', o: 'loc' },
        { chu: 'Bấm số chứng từ để xem chi tiết, in, sửa.', o: 'bang' },
      ],
      luuY: ['Phễu nhỏ trên tiêu đề cột lọc riêng từng cột.', 'Nút Excel phía trên bảng nhập hoặc xuất cả danh sách.'],
      soDo: [them ? [O_LOC, O_THEM] : [O_LOC], [{ k: 'bang', ten: 'Danh sách chứng từ', kieu: 'bang' }], [{ k: 'tong', ten: 'Tổng tiền, chuyển trang' }]],
    }
  }
  if (sc.kind === 'catalog') return {
    muc: `Khai báo ${ten} một lần, khi lập phiếu chỉ cần chọn lại.`,
    buoc: [
      { chu: 'Bấm Thêm mới, điền mã, tên rồi bấm Lưu.', o: 'them' },
      { chu: 'Gõ mã hoặc tên, bấm Lọc để tìm.', o: 'loc' },
      { chu: 'Các nút có số đếm phía trên bảng lọc nhanh theo nhóm.', o: 'nhom' },
      { chu: 'Bấm một dòng để xem, sửa.', o: 'bang' },
    ],
    soDo: [[{ k: 'loc', ten: 'Tìm, Lọc', rong: 3 }, O_THEM], [{ k: 'nhom', ten: 'Nút lọc nhanh có số đếm' }], [{ k: 'bang', ten: `Danh sách ${ten}`, kieu: 'bang' }]],
  }
  if (sc.kind === 'tool') {
    const t = sc.tool
    return {
      muc: t?.mota ?? `${ten}: chức năng tiện ích của phân hệ ${mod.ten}.`,
      buoc: [
        { chu: 'Đọc Mô tả để biết chức năng làm gì.', o: 'mota' },
        ...(t?.caiDat?.length ? [{ chu: 'Chỉnh Cài đặt rồi bấm Lưu cài đặt.', o: 'caiDat' }] : []),
        { chu: `Bấm ${t?.nut ?? 'nút chính'} để chạy. Kết quả hiện ở Lần chạy gần đây.`, o: 'lich' },
      ],
      soDo: [[{ k: 'mota', ten: 'Mô tả, nút chạy', rong: 2 }, ...(t?.caiDat?.length ? [{ k: 'caiDat', ten: 'Cài đặt' }] : [])], [{ k: 'lich', ten: 'Lần chạy gần đây' }]],
    }
  }
  if (sc.kind === 'quytrinh') return {
    muc: `Sơ đồ các bước nghiệp vụ của phân hệ ${mod.ten}, đọc từ trái sang phải.`,
    buoc: [{ chu: 'Đọc tên từng bước để biết việc nào làm trước, việc nào làm sau.' }, { chu: 'Bấm một ô trên sơ đồ để mở đúng màn đó.' }],
  }
  if (sc.kind === 'baocao') return {
    muc: `Danh sách báo cáo của phân hệ ${mod.ten}.`,
    buoc: [{ chu: 'Bấm tên báo cáo để mở.' }, { chu: 'Bấm ngôi sao để ghim báo cáo hay xem.' }],
  }
  return { muc: mod.mota ? `Phân hệ ${mod.ten}: ${mod.mota.toLowerCase()}.` : `Màn ${ten} của phân hệ ${mod.ten}.`, buoc: [] }
}

/** Màn đang mở trong phân hệ, kể cả báo cáo phân hệ khác mở ngay trong phân hệ (T385) */
function manDangMo(mod: ModuleDef, slug: string | undefined, s: Session) {
  return mod.screens.find(x => x.slug === slug) ?? (slug ? baoCaoCuaPhanHe(mod, s).find(x => x.slug === slug) : undefined)
}

// ── Đi tiếp: các bước trên sơ đồ Quy trình theo đúng bản gói đang dùng thấy (như QuyTrinhScreen) ──
interface BuocLuong { ten?: string; nut: NutQT[]; song?: boolean }   // song: làn của sơ đồ hội tụ, các làn cùng đổ về bước sau

function luongCua(qt: QuyTrinhDef, s: Session): BuocLuong[] {
  const S = s.goi === 'S'
  const an = anNgoaiGoi(s.goi)
  const hien = (n: NutQT) => {
    if (!n.di) return true
    const d = dich(n.di)
    if (d.sc && !hienMan(d.sc, s.goi, s.cheDo, s)) return false
    return !an || !d.sc || moDuoc(d.sc, s.goi)
  }
  // thứ tự như QuyTrinhScreen: bước theo kỳ gói Standard, sơ đồ hội tụ, sơ đồ luồng gói Standard, trục ngang
  const ht = S && qt.hoiTuStandard ? qt.hoiTuStandard : qt.hoiTu
  const ds: BuocLuong[] = S && qt.buocKyStandard ? qt.buocKyStandard.map(b => ({ ten: b.ten, nut: [...b.nut, ...(b.nhom?.flatMap(g => g.nut) ?? [])] }))
    : ht ? [...ht.lan.map(l => ({ ten: l.ten, nut: l.nut, song: true })), { ten: (S && qt.raStandard ? qt.raStandard : ht.ra).ten, nut: (S && qt.raStandard ? qt.raStandard : ht.ra).nut }]
    : S && qt.luongStandard ? qt.luongStandard.map(c => ({ nut: c.nut }))
    : qt.buoc.map(b => ({ ten: b.ten ?? b.chinh.ten, nut: [b.chinh, ...(b.tren ?? []), ...(b.duoi ?? [])] }))
  return ds.map(b => ({ ...b, nut: b.nut.filter(hien).filter((n, i, a) => a.findIndex(x => x.ten === n.ten && x.di === n.di) === i) })).filter(b => b.nut.length > 0)
}

const khopNut = (n: NutQT, khoa: string[]) => {
  const p = n.di.split('?')[0]
  return !!n.di && khoa.some(k => p === k || p.startsWith(k + '/'))
}

function DiTiep({ qtMod, khoa, s }: { qtMod: ModuleDef; khoa: string[]; s: Session }) {
  const ds = luongCua(qtMod.quyTrinh!, s)
  if (!ds.length) return null
  const chip = (n: NutQT, i: number) => {
    const on = khopNut(n, khoa)
    const d = n.di ? dich(n.di) : undefined
    return n.di && d && (!d.sc || moDuoc(d.sc, s.goi))
      ? <Link key={i} to={d.path} className={`hdn-chip${on ? ' on' : ''}`}>{n.ten}</Link>
      : <span key={i} className="hdn-chip tinh">{n.ten}</span>
  }
  const buoc = (b: BuocLuong, i: number) => (
    <li key={i} className={`hdn-l-buoc${b.nut.some(n => khopNut(n, khoa)) ? ' on' : ''}`}>
      <span className="hdn-l-cham" aria-hidden />
      <div className="hdn-l-than">
        {b.ten && !(b.nut.length === 1 && b.nut[0].ten === b.ten) && <b>{b.ten}</b>}   {/* bước chỉ có một ô trùng tên thì chỉ hiện ô */}
        <div className="hdn-l-nut">{b.nut.map(chip)}</div>
      </div>
    </li>
  )
  // sơ đồ hội tụ: các làn gom trong một khối, mũi tên đổ về khối kết quả
  const song = ds.filter(b => b.song), sau = ds.filter(b => !b.song)
  return (
    <ol className="hdn-luong">
      {song.length > 0 && (
        <li className={`hdn-l-buoc hdn-l-song${song.some(b => b.nut.some(n => khopNut(n, khoa))) ? ' on' : ''}`}>
          <span className="hdn-l-cham" aria-hidden />
          <div className="hdn-l-than">
            <b>Ghi nghiệp vụ</b>
            <ul className="hdn-l-lan">
              {song.map((b, i) => <li key={i} className={b.nut.some(n => khopNut(n, khoa)) ? 'on' : ''}><span>{b.ten}</span><div className="hdn-l-nut">{b.nut.map(chip)}</div></li>)}
            </ul>
          </div>
        </li>
      )}
      {sau.map(buoc)}
    </ol>
  )
}

/** Sơ đồ khung màn: các ô xếp theo hàng như màn thật, ô nào có bước Làm nhanh chỉ tới thì gắn số bước */
function SoDoMan({ soDo, buoc, sang, setSang }: { soDo: OSoDo[][]; buoc: BuocHD[]; sang: string | null; setSang: (k: string | null) => void }) {
  const so = (k: string) => buoc.flatMap((b, i) => b.o === k ? [i + 1] : [])
  return (
    <div className="hdn-sodo" aria-label="Sơ đồ khung màn">
      {soDo.map((hang, i) => (
        <div key={i} className="hdn-sodo-hang">
          {hang.map(o => {
            const ds = so(o.k)
            return (
              <div key={o.k} className={`hdn-o${o.kieu ? ' ' + o.kieu : ''}${sang === o.k ? ' sang' : ''}`} style={{ flexGrow: o.rong ?? 1 }}
                onMouseEnter={() => ds.length && setSang(o.k)} onMouseLeave={() => setSang(null)}>
                <span>{o.ten}</span>
                {ds.length > 0 && <span className="hdn-o-so">{ds.map(n => <i key={n}>{n}</i>)}</span>}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

const KHOA_XEM = 'iacc-hdn-da-xem'
const docXem = (): string[] => { try { const v = JSON.parse(localStorage.getItem(KHOA_XEM) || '[]'); return Array.isArray(v) ? v : [] } catch { return [] } }
function ghiXem(k: string) {
  const ds = docXem()
  if (ds.includes(k)) return
  try { localStorage.setItem(KHOA_XEM, JSON.stringify([k, ...ds].slice(0, 500))) } catch { /* trình duyệt chặn lưu thì thôi */ }
}

/** Nút la bàn cuối thanh tab và khung hướng dẫn. Trang chủ đã có hướng dẫn từng bước riêng (T138) nên không gắn */
export function NutHuongDan({ mod }: { mod: ModuleDef }) {
  const { s } = useSession()
  const loc = useLocation()
  const nav = useNavigate()
  const [mo, setMo] = useState(false)
  const [sang, setSang] = useState<string | null>(null)
  const slug = loc.pathname.split('/')[3]
  const sc = manDangMo(mod, slug, s)
  const khoaXem = `${s.email}|${mod.key}/${slug ?? ''}`
  const [daXem, setDaXem] = useState(() => docXem().includes(khoaXem))
  useEffect(() => { setDaXem(docXem().includes(khoaXem)) }, [khoaXem])
  // khung đang mở mà chuyển màn: màn mới cũng tính là đã xem
  useEffect(() => { if (mo && sc) { ghiXem(khoaXem); setDaXem(true) } }, [mo, khoaXem])   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!mo) return
    // Esc đóng khung, trừ khi đang mở form toàn màn hay hộp thoại (phím Esc của chúng)
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('.fsf, .overlay')) setMo(false) }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [mo])
  if (mod.key === 'trang-chu' || !sc) return null

  const rieng = NOI_DUNG[sc.goc ?? mod.key]?.[sc.slug]
  const hd = rieng && (!rieng.goi || rieng.goi.includes(s.goi)) ? rieng : boChung(sc, mod)
  const qtMod = MODULES.find(m => m.key === (hd.quyTrinh?.mod ?? mod.key))
  const khoa = [`${sc.goc ?? mod.key}/${sc.slug}`, ...(hd.quyTrinh?.khop ?? [])]

  return (
    <>
      <button type="button" className={`mtabs-hdn${daXem ? '' : ' nhay'}${mo ? ' on' : ''}`} title="Hướng dẫn nhanh" aria-label="Hướng dẫn nhanh"
        aria-expanded={mo} aria-controls="hdn-khung" onClick={() => setMo(!mo)}>
        <Icon n="la-ban" className="ic" />
      </button>
      {mo && (
        <aside className="hdn-khung" id="hdn-khung" aria-label={`Hướng dẫn nhanh: ${nhanTab(sc)}`}>
          <header className="hdn-dau">
            <span className="hdn-dau-ic"><Icon n="la-ban" className="ic" /></span>
            <div className="hdn-dau-chu"><small>Hướng dẫn nhanh</small><b>{nhanTab(sc)}</b></div>
            <button type="button" className="btn sm ghost hdn-dong" aria-label="Đóng hướng dẫn" onClick={() => setMo(false)}><Icon n="x" className="ic sm" /></button>
          </header>
          <div className="hdn-than">
            <section className="hdn-muc">
              <h4>Màn này để làm gì</h4>
              <p>{hd.muc}</p>
            </section>
            {hd.buoc.length > 0 && (
              <section className="hdn-muc">
                <h4>Làm nhanh</h4>
                {hd.soDo && <SoDoMan soDo={hd.soDo} buoc={hd.buoc} sang={sang} setSang={setSang} />}
                <ol className="hdn-buoc">
                  {hd.buoc.map((b, i) => (
                    <li key={i} className={b.o && sang === b.o ? 'sang' : ''} onMouseEnter={() => b.o && setSang(b.o)} onMouseLeave={() => setSang(null)}>
                      <span className="hdn-buoc-so">{i + 1}</span>
                      <div>
                        <p>{b.chu}</p>
                        {b.di && <button type="button" className="btn sm hdn-lam" onClick={() => nav(`/app/${b.di}`)}>{b.nutDi ?? 'Làm ngay'}<Icon n="arrow" className="ic sm" /></button>}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            )}
            {!!hd.luuY?.length && (
              <section className="hdn-muc">
                <h4>Lưu ý</h4>
                <ul className="hdn-luu">{hd.luuY.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </section>
            )}
            {qtMod?.quyTrinh && sc.kind !== 'quytrinh' && (
              <section className="hdn-muc">
                <h4>Đi tiếp</h4>
                <DiTiep qtMod={qtMod} khoa={khoa} s={s} />
                <Link className="hdn-mo-qt" to={`/app/${qtMod.key}/quy-trinh`}><Icon n="flow" className="ic sm" />Mở sơ đồ Quy trình</Link>
              </section>
            )}
          </div>
        </aside>
      )}
    </>
  )
}

/** ModuleTabs gắn nút ở mọi phân hệ trừ Trang chủ */
export const coHuongDanNhanh = (mod: ModuleDef) => mod.key !== 'trang-chu'

