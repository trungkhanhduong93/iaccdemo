// Hướng dẫn nhanh từng màn (T673, QD86): nút la bàn cuối thanh tab phân hệ, bấm thì khung trượt ra bên phải, không che màn.
// Khung có 4 mục: Màn này để làm gì, Làm nhanh (kèm sơ đồ khung màn đánh số khớp từng bước), Lưu ý, Đi tiếp (sơ đồ luồng lấy từ quy-trinh.ts).
// Nội dung riêng của màn nằm ở src/modules/<phân hệ>/huong-dan.ts, tra theo slug màn; màn chưa có thì dùng bộ chung theo kiểu màn.
// Lần đầu mở một màn: nút nhấp nháy, bấm mới mở khung. Đã bấm thì màn đó thôi nhấp nháy, nhớ theo người dùng và màn.
// Màn mà đầu báo cáo nằm thay thanh tab (phân hệ Báo cáo, báo cáo đầu mới T576) đặt nút ở thanh chọn báo cáo, Tất cả báo cáo (T674).
// Kiểu dải bước (T679, QD87): bấm la bàn hiện dải dưới thanh tab, mỗi lần một bước, số cam đánh lên đúng nút thật của màn;
// Xem đủ hướng dẫn mở khung nổi bên phải đủ 4 mục.
// Form toàn màn mở thì dải, khung nổi lên form ngay dưới thanh đầu form; bước nằm trong form chỉ vào ô của form (T676).
// Bước có khung cam thì làm tối xung quanh; Bước kế, Bước trước tự mở, đóng form theo bước; nút bóng đèn kèm chữ Hướng dẫn (T680).
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSession, type Session } from '../app/session'
import { MODULES, dich, hienMan, laBaoCao, moDuoc, nhanTab } from '../app/registry'
import { anNgoaiGoi, type Goi } from '../app/plan'
import type { ModuleDef, NutQT, QuyTrinhDef, ScreenDef } from '../modules/types'
import { baoCaoCuaPhanHe } from '../modules/bao-cao/cuaPhanHe'
import { Icon } from './Icon'
import { heSoZoom } from './zoom'
import { datDaiChay, dongFormTren, formTren, ngheForm, soLanLuu } from './huongDanForm'

/** Một bước Làm nhanh. o: khoá ô trên sơ đồ khung màn mà bước chỉ tới, hoặc ô trong form phiếu (O_FORM); di: đường dẫn sau /app/ cho nút làm ngay, nutDi: chữ trên nút đó */
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
  // Tất cả báo cáo, nhóm báo cáo của phân hệ Báo cáo (TrungTamBaoCao): cột nhóm bên trái, danh sách bên phải (T674)
  if (mod.key === 'bao-cao' && !sc.goc) return {
    muc: sc.slug === 'tat-ca' ? 'Mọi sổ sách, báo cáo của đơn vị ở một chỗ, chia nhóm theo phân hệ.'
      : `Sổ sách, báo cáo nhóm ${ten.replace(/^Nhóm báo cáo /, '')}. Bấm Tất cả ở cột trái để xem mọi nhóm.`,
    buoc: [
      { chu: 'Bấm một nhóm ở cột trái để chỉ xem báo cáo của nhóm đó.', o: 'nhom' },
      { chu: 'Gõ tên, mã hoặc ký hiệu mẫu vào ô Tìm báo cáo.', o: 'tim' },
      { chu: 'Bấm tên báo cáo để mở.', o: 'ds' },
      { chu: 'Bấm ngôi sao để ghim báo cáo hay xem. Báo cáo đã ghim, báo cáo vừa mở hiện ở cột trái để mở lại nhanh.', o: 'ds' },
    ],
    soDo: [[{ k: 'ten', ten: 'Báo cáo', rong: 2 }, { k: 'tim', ten: 'Tìm báo cáo' }], [{ k: 'nhom', ten: 'Nhóm, Đã ghim, Gần đây' }, { k: 'ds', ten: 'Danh sách báo cáo theo nhóm', rong: 2, kieu: 'bang' }]],
  }
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
          { chu: 'Điền thông tin rồi bấm Lưu hoặc Ctrl + S.', o: 'ttc' },
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

/** gon: chỉ bước trước, bước đang ở, bước sau trên sơ đồ (T679); màn không có trên sơ đồ thì hiện cả sơ đồ */
function DiTiep({ qtMod, khoa, s, gon }: { qtMod: ModuleDef; khoa: string[]; s: Session; gon?: boolean }) {
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
  const iDang = ds.findIndex(b => b.nut.some(n => khopNut(n, khoa)))
  if (gon && iDang >= 0) {
    // làn của sơ đồ hội tụ chạy song song nên không có bước trước, bước sau là khối kết quả
    const dang = ds[iDang]
    const truoc = dang.song ? undefined : ds[iDang - 1]
    const sauDo = dang.song ? ds.find(b => !b.song) : ds[iDang + 1]
    const hang = (nhan: string, b?: BuocLuong) => b && <><span>{nhan}</span><div className="hdn-l-nut">{b.nut.map(chip)}</div></>
    return <div className="hdn-gan">{hang('Trước đó', truoc)}{hang('Đang ở', dang)}{hang('Tiếp theo', sauDo)}</div>
  }
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

// ── Chỗ thật trên màn của từng ô sơ đồ (T679, QD87) ──
// Màn tự khai data-hd="<khoá ô>" thì dùng chỗ đó; không có thì tìm theo khuôn chung của màn danh sách chứng từ, danh mục, báo cáo, chức năng
const KHUON: Record<string, string[]> = {
  them: ['.main .ds-toolbar-phai :is(.ds-split-them, .ds-nut-them, .btn.pri)'],
  nhom: ['.main .ds-chips', '.main .bc-trai'],
  bang: ['.main .page-voucher .tbl-wrap'],
  // ô Tổng cộng ở thanh phân trang trước: dòng tổng tfoot nằm khuất dưới vùng cuộn của bảng (T676)
  tong: ['.main .pt-bar .pt-tc', '.main .pt-bar', '.main .page-voucher tfoot'],
  chon: ['.main .bc-ten-hang'],
  in: ['.main .bc-dau-nut'],
  to: ['.main .page-report .tbl-wrap', '.main .page-report .report'],
  tim: ['.main .ph-act .thanh-loc'],
  ds: ['.main .bc-ds'],
  mota: ['.main .grid.g-21 > .stack > .card:first-child'],
  lich: ['.main .grid.g-21 > .stack > .card:nth-child(2)'],
  caiDat: ['.main .grid.g-21 > .card'],
}
// Ô trong form phiếu (T676): ChungTuForm gắn data-hd cho khối ô đầu form, bảng dòng chi tiết, nút Lưu
const O_FORM = new Set(['ttc', 'chi-tiet', 'luu'])
const laBuocForm = (x?: BuocHD) => !!x?.o && O_FORM.has(x.o)
// thanh trên đang xem Tất cả cửa hàng thì form hỏi cửa hàng lập phiếu trước khi hiện ô nhập
const KHUON_FORM: Record<string, string[]> = { ttc: ['.chon-cn'], 'chi-tiet': ['.chon-cn'] }
const coKhung = (e: Element) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }

/** Khung bao quanh nhiều phần tử, vd các ô lọc, các tab */
function hop(ds: Element[]): DOMRect | null {
  const rs = ds.filter(coKhung).map(e => e.getBoundingClientRect())
  if (!rs.length) return null
  const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top))
  return new DOMRect(l, t, Math.max(...rs.map(r => r.right)) - l, Math.max(...rs.map(r => r.bottom)) - t)
}

/** form: form toàn màn đang mở, che màn danh sách nên chỉ tìm trong form */
function timCho(k: string, form: HTMLElement | null): DOMRect | null {
  const rieng = [...(form ?? document).querySelectorAll(`[data-hd="${k}"]`)].find(coKhung)
  if (rieng) return rieng.getBoundingClientRect()
  if (form) {
    for (const q of KHUON_FORM[k] ?? []) {
      const e = [...form.querySelectorAll(q)].find(coKhung)
      if (e) return e.getBoundingClientRect()
    }
    return null
  }
  // các tab của phân hệ, không lấy phần trống cuối thanh tab
  if (k === 'tab') return hop([...document.querySelectorAll('.mtabs-in > a, .mtabs-in > .mtabs-more')])
  if (k === 'loc') {
    // thanh lọc chung: các ô bên trái thanh công cụ, trừ cụm nút bên phải (Thêm mới, Excel)
    const thanh = [...document.querySelectorAll('.main .ds-toolbar-figma')].find(coKhung)
    return thanh ? hop([...thanh.children].filter(e => !e.classList.contains('ds-toolbar-phai'))) : null
  }
  for (const q of KHUON[k] ?? []) {
    const e = [...document.querySelectorAll(q)].find(coKhung)
    if (e) return e.getBoundingClientRect()
  }
  return null
}

type Cho = { l: number; t: number; w: number; h: number; sat?: boolean }   // px CSS, đã chia zoom (docs/BAY.md); sat: sát mép trên vùng làm việc

/** Vị trí từng khoá ô trên màn, đo lại khi cuộn, đổi cỡ cửa sổ và đều 400ms (màn tải xong dữ liệu, mở rộng hàng).
 *  form: form toàn màn đang mở thì đo trong form, phần dưới dải */
function useChoThat(khoa: string[], bat: boolean, form: HTMLElement | null): Record<string, Cho> {
  const [cho, setCho] = useState<Record<string, Cho>>({})
  const ds = khoa.join('|')
  useEffect(() => {
    if (!bat) { setCho({}); return }
    let hen = 0
    const do_ = () => {
      hen = 0
      const z = heSoZoom()
      const main = (form ?? document.querySelector('.main'))?.getBoundingClientRect()
      const tabs = form ? form.querySelector(':scope > .hdn-dai')?.getBoundingClientRect() : [...document.querySelectorAll('.mtabs')].find(coKhung)?.getBoundingClientRect()
      const moi: Record<string, Cho> = {}
      if (main) for (const k of khoa) {
        const r = timCho(k, form)
        if (!r) continue
        // chỉ phần nằm trong vùng làm việc: thanh tab và màn chính; trong form là phần dưới dải
        const tren = form ? tabs?.bottom ?? main.top : tabs?.top ?? main.top
        const l = Math.max(r.left, main.left), t = Math.max(r.top, tren)
        const p = Math.min(r.right, main.right), d = Math.min(r.bottom, main.bottom)
        if (p - l < 4 || d - t < 4) continue
        moi[k] = { l: Math.round(l / z), t: Math.round(t / z), w: Math.round((p - l) / z), h: Math.round((d - t) / z), sat: t - tren < 12 }
      }
      setCho(cu => JSON.stringify(cu) === JSON.stringify(moi) ? cu : moi)
    }
    const hoi = () => { if (!hen) hen = requestAnimationFrame(do_) }
    do_()
    const id = window.setInterval(hoi, 400)
    window.addEventListener('scroll', hoi, true)
    window.addEventListener('resize', hoi)
    return () => {
      window.clearInterval(id); cancelAnimationFrame(hen)
      window.removeEventListener('scroll', hoi, true); window.removeEventListener('resize', hoi)
    }
  }, [ds, bat, form])   // eslint-disable-line react-hooks/exhaustive-deps
  return cho
}

// Nút ở thanh chọn báo cáo đang hiện thì nút cuối thanh tab (đã ẩn theo thanh tab) thôi gắn, mỗi màn đúng một nút (T674)
let soNutNgoai = 0
const ngheNut = new Set<() => void>()
const baoNut = () => ngheNut.forEach(f => f())
const ngheNutNgoai = (f: () => void) => { ngheNut.add(f); return () => { ngheNut.delete(f) } }

const KHOA_XEM = 'iacc-hdn-da-xem'
const docXem = (): string[] => { try { const v = JSON.parse(localStorage.getItem(KHOA_XEM) || '[]'); return Array.isArray(v) ? v : [] } catch { return [] } }
function ghiXem(k: string) {
  const ds = docXem()
  if (ds.includes(k)) return
  try { localStorage.setItem(KHOA_XEM, JSON.stringify([k, ...ds].slice(0, 500))) } catch { /* trình duyệt chặn lưu thì thôi */ }
}

/** Nút Hướng dẫn (bóng đèn, T680) cuối thanh tab, dải bước và khung hướng dẫn. Trang chủ đã có hướng dẫn từng bước riêng (T138) nên không gắn.
 *  ngoaiThanhTab: nút đặt ở thanh chọn báo cáo, Tất cả báo cáo khi thanh tab ẩn; dải, khung nằm sát dưới thanh trên (T674) */
export function NutHuongDan({ mod, ngoaiThanhTab }: { mod: ModuleDef; ngoaiThanhTab?: boolean }) {
  const { s } = useSession()
  useEffect(() => {
    if (!ngoaiThanhTab) return
    soNutNgoai++; baoNut()
    return () => { soNutNgoai--; baoNut() }
  }, [ngoaiThanhTab])
  const coNutNgoai = useSyncExternalStore(ngheNutNgoai, () => soNutNgoai > 0)
  const loc = useLocation()
  const nav = useNavigate()
  const [dai, setDai] = useState(false)     // dải bước
  const [mo, setMo] = useState(false)       // khung đủ, chỉ mở từ dải
  const [buoc, setBuoc] = useState(0)
  const [ro, setRo] = useState<number | null>(null)   // bước đang rê chuột trong khung
  const [sang, setSang] = useState<string | null>(null)
  const fsf = useSyncExternalStore(ngheForm, formTren)    // form toàn màn đang mở (T676)
  const soLuu = useSyncExternalStore(ngheForm, soLanLuu)
  const slug = loc.pathname.split('/')[3]
  const sc = manDangMo(mod, slug, s)
  const rieng = sc && NOI_DUNG[sc.goc ?? mod.key]?.[sc.slug]
  const hd = sc && (rieng && (!rieng.goi || rieng.goi.includes(s.goi)) ? rieng : boChung(sc, mod))
  const khoaO = [...new Set((hd?.buoc ?? []).flatMap(b => b.o ? [b.o] : []))]
  const form = dai ? fsf : null   // dải nổi trên form này
  const cho = useChoThat(khoaO, dai, form)
  const khoaXem = `${s.email}|${mod.key}/${slug ?? ''}`
  const [daXem, setDaXem] = useState(() => docXem().includes(khoaXem))
  useEffect(() => { setDaXem(docXem().includes(khoaXem)) }, [khoaXem])
  useEffect(() => { setBuoc(0); setRo(null) }, [khoaXem])   // đổi màn thì về bước 1
  useEffect(() => { if (!mo) { setRo(null); setSang(null) } }, [mo])   // khung đóng khi chuột còn trên một bước thì không có mouseleave
  // dải đang mở mà chuyển màn: màn mới cũng tính là đã xem
  useEffect(() => { if (dai && sc) { ghiXem(khoaXem); setDaXem(true) } }, [dai, khoaXem])   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!dai) return
    // Esc đóng khung trước, rồi tới dải; trừ khi đang mở form toàn màn hay hộp thoại (phím Esc của chúng)
    const on = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || document.querySelector('.fsf, .overlay')) return
      if (mo) setMo(false); else setDai(false)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [dai, mo])
  useEffect(() => { if (!dai) return; datDaiChay(true); return () => datDaiChay(false) }, [dai])
  // Form toàn màn mở, đóng khi dải đang chạy (T676): mở phiếu mới mà dải còn ở bước trước form thì sang bước đầu trong form;
  // đóng form lúc đang ở bước trong form: đã lưu thì sang bước sau form, chưa lưu thì về bước mở form
  const formCu = useRef<HTMLElement | null>(null)
  const luuLucMo = useRef(0)
  const moBoiDai = useRef(false)                     // dải vừa mở form: nút làm ngay, Bước kế vào bước trong form (T680)
  const formDai = useRef<HTMLElement | null>(null)   // form do dải mở: tắt hướng dẫn thì đóng luôn
  useEffect(() => {
    const cu = formCu.current
    formCu.current = form
    if (cu === form) return
    if (form && !cu) { formDai.current = moBoiDai.current ? form : null; moBoiDai.current = false }
    if (!form) formDai.current = null
    if (!hd) return
    const dau = hd.buoc.findIndex(laBuocForm)
    if (dau < 0) return
    if (form) {
      if (!cu) luuLucMo.current = soLuu
      if (loc.pathname.split('/')[4] === 'moi' && buoc < dau) setBuoc(dau)
    } else if (laBuocForm(hd.buoc[buoc])) {
      const cuoi = hd.buoc.length - 1 - [...hd.buoc].reverse().findIndex(laBuocForm)
      setBuoc(soLuu > luuLucMo.current ? Math.min(cuoi + 1, hd.buoc.length - 1) : Math.max(dau - 1, 0))
    }
  }, [form])   // eslint-disable-line react-hooks/exhaustive-deps
  // Lưu và thêm: form mở lại phiếu trống, dải về bước đầu trong form
  useEffect(() => {
    if (!form || !hd || !laBuocForm(hd.buoc[buoc])) return
    setBuoc(hd.buoc.findIndex(laBuocForm))
  }, [soLuu])   // eslint-disable-line react-hooks/exhaustive-deps
  // khung đủ trong form: từ dưới dải tới trên chân form, đo theo px của form nên không lệch theo zoom
  const [viTri, setViTri] = useState<{ top: number; bottom: number } | null>(null)
  useLayoutEffect(() => {
    const d = form?.querySelector<HTMLElement>(':scope > .hdn-dai'), f = form?.querySelector<HTMLElement>(':scope > .fsf-f')
    setViTri(form && mo && d ? { top: d.offsetTop + d.offsetHeight + 4, bottom: f ? form.clientHeight - f.offsetTop + 12 : 12 } : null)
  }, [form, mo])
  if (mod.key === 'trang-chu' || !sc || !hd || (!ngoaiThanhTab && coNutNgoai)) return null

  // báo cáo mở từ phân hệ Báo cáo (/app/bao-cao/<slug>) đi tiếp theo sơ đồ của phân hệ gốc
  const qtMod = MODULES.find(m => m.key === (hd.quyTrinh?.mod ?? (mod.key === 'bao-cao' ? sc.goc : undefined) ?? mod.key))
  const khoa = [`${sc.goc ?? mod.key}/${sc.slug}`, ...(hd.quyTrinh?.khop ?? [])]
  const soBuoc = hd.buoc.length
  const i = Math.min(buoc, Math.max(soBuoc - 1, 0))
  const b = hd.buoc[i] as BuocHD | undefined
  const coCho = Object.keys(cho).length > 0   // màn có chỗ thật để đánh số; không có thì khung dùng sơ đồ vẽ
  // tắt hướng dẫn (bỏ qua): đóng luôn form do dải mở, không hỏi (T680)
  const tat = () => { if (form && form === formDai.current) dongFormTren(); setDai(false); setMo(false) }
  const lam = (di: string) => { setMo(false); moBoiDai.current = true; nav(`/app/${di}`) }
  // form mở cho bước trong form: nút làm ngay của bước trước gần nhất (vd Ghi một khoản chi), không có thì Thêm mới của màn chứng từ
  const diMoForm = (n: number) => hd.buoc.slice(0, n).reverse().find(x => x.di)?.di
    ?? (sc.kind === 'voucher' && !sc.voucher?.khongThem ? `${loc.pathname.split('/')[2]}/${sc.slug}/moi` : undefined)
  // Bước kế, Bước trước, bấm bước trong khung: giao diện tự tới chỗ của bước (T680). Bước trong form mà form chưa mở thì mở form;
  // bước ở màn danh sách mà form đang mở thì đóng form không hỏi
  const diToi = (n: number) => {
    setBuoc(n)
    const x = hd.buoc[n]
    if (laBuocForm(x) && !form) {
      const di = diMoForm(n)
      if (di) { moBoiDai.current = true; nav(`/app/${di}`) }
    } else if (x?.o && !laBuocForm(x) && form) dongFormTren()
  }
  const nutLam = (x: BuocHD, cls: string) => x.di && <button type="button" className={`btn sm ${cls}`} onClick={() => lam(x.di!)}>{x.nutDi ?? 'Làm ngay'}<Icon n="arrow" className="ic sm" /></button>
  // số cam: mỗi ô thật một vòng, ghi số các bước chỉ tới ô đó; bước đang xem (hoặc đang rê trong khung) có viền cam
  // nhiều khoá cùng một chỗ (vd form hỏi cửa hàng trước khi hiện ô nhập) gom thành một vòng
  const sangO = hd.buoc[ro ?? i]?.o
  const nhomCho = new Map<string, { ks: string[]; c: Cho }>()
  for (const [k, c] of Object.entries(cho)) {
    const id = `${c.l},${c.t},${c.w},${c.h}`
    const g = nhomCho.get(id)
    if (g) g.ks.push(k); else nhomCho.set(id, { ks: [k], c })
  }
  // khung cam lố ra 3px; ô sát mép trên (hàng tab) thì vẽ vào trong theo chiều dọc để thanh trên không cắt mất cạnh trên (T680)
  const khung = (c: Cho) => ({ left: c.l - 3, top: c.sat ? c.t + 3 : c.t - 3, width: c.w + 6, height: c.sat ? c.h - 6 : c.h + 6 })
  let toi: ReturnType<typeof khung> | undefined   // chỗ bước đang xem: phần còn lại của màn tối đi
  const cham = [...nhomCho.values()].map(({ ks, c }) => {
    const so = hd.buoc.flatMap((x, n) => x.o && ks.includes(x.o) ? [n] : [])
    const k = ks.join(' ')
    const on = !!sangO && ks.includes(sangO)
    if (on) toi = khung(c)
    return (
      <div key={k} data-k={k} className={`hdn-cham-o${on ? ' on' : ''}${c.sat ? ' sat' : ''}`} style={khung(c)}>
        <span className="hdn-cham-so">{so.map(n => <i key={n} className={n === i ? 'on' : ''}>{n + 1}</i>)}</span>
      </div>
    )
  })

  const chamEl = cham.length > 0 && <div className="hdn-cham" aria-hidden>{toi && <div className="hdn-toi" style={toi} />}{cham}</div>
  const daiEl = (
    <div className={`hdn-dai${ngoaiThanhTab ? ' ngoai' : ''}${s.thuGon ? ' gon' : ''}`} id="hdn-dai" role="region" aria-label={`Hướng dẫn nhanh: ${nhanTab(sc)}`} data-o={b?.o}>
      <div className="hdn-dai-in">
        <Icon n="bong-den" className="ic sm hdn-dai-ic" />
        {b ? <>
          <b className="hdn-dai-so">Bước {i + 1}/{soBuoc}</b>
          <span className="hdn-dai-chu" title={b.chu} aria-live="polite">{b.chu}</span>
          {nutLam(b, 'hdn-dai-lam')}
          <span className="hdn-dai-nut">
            <button type="button" className="btn sm ghost" disabled={i === 0} onClick={() => diToi(i - 1)}><Icon n="chevl" className="ic sm" />Bước trước</button>
            {i < soBuoc - 1
              ? <button type="button" className="btn sm pri" onClick={() => diToi(i + 1)}>Bước kế<Icon n="chevr" className="ic sm" /></button>
              : <button type="button" className="btn sm pri" onClick={tat}>Xong</button>}
          </span>
        </> : <span className="hdn-dai-chu" title={hd.muc}>{hd.muc}</span>}
        <span className="hdn-dai-phai">
          <button type="button" className={`btn sm ghost hdn-dai-du${mo ? ' on' : ''}`} aria-expanded={mo} aria-controls="hdn-khung" onClick={() => setMo(!mo)}>Xem đủ hướng dẫn</button>
          <button type="button" className="btn sm ghost hdn-dai-x" aria-label="Tắt hướng dẫn" title="Tắt hướng dẫn (Esc)" onClick={tat}><Icon n="x" className="ic sm" /></button>
        </span>
      </div>
    </div>
  )
  const khungEl = mo && (
    <aside className={`hdn-khung${ngoaiThanhTab ? ' ngoai' : ''}`} id="hdn-khung" aria-label={`Hướng dẫn nhanh: ${nhanTab(sc)}`} style={viTri ?? undefined}>
      <header className="hdn-dau">
        <span className="hdn-dau-ic"><Icon n="bong-den" className="ic" /></span>
        <div className="hdn-dau-chu"><small>Hướng dẫn nhanh</small><b>{nhanTab(sc)}</b></div>
        <button type="button" className="btn sm ghost hdn-dong" aria-label="Đóng hướng dẫn đủ" onClick={() => setMo(false)}><Icon n="x" className="ic sm" /></button>
      </header>
      <div className="hdn-than">
        <section className="hdn-muc">
          <h4>Màn này để làm gì</h4>
          <p>{hd.muc}</p>
        </section>
        {soBuoc > 0 && (
          <section className="hdn-muc">
            <h4>Làm nhanh</h4>
            {coCho
              ? <span className="hdn-goi-y">Số cam trên màn chỉ đúng chỗ của từng bước. Bấm một bước để làm từ bước đó.</span>
              : hd.soDo && <SoDoMan soDo={hd.soDo} buoc={hd.buoc} sang={sang} setSang={setSang} />}
            <ol className="hdn-buoc">
              {hd.buoc.map((x, n) => (
                <li key={n} className={`${n === i ? 'on' : ''}${(coCho ? ro === n : x.o && sang === x.o) ? ' sang' : ''}`}
                  onMouseEnter={() => { setRo(n); if (x.o) setSang(x.o) }} onMouseLeave={() => { setRo(null); setSang(null) }}>
                  <button type="button" className="hdn-buoc-chon" onClick={() => { diToi(n); setMo(false) }} aria-label={`Làm từ bước ${n + 1}`}>
                    <span className="hdn-buoc-so">{n + 1}</span>
                    <p>{x.chu}</p>
                  </button>
                  {nutLam(x, 'hdn-lam')}
                </li>
              ))}
            </ol>
          </section>
        )}
        {!!hd.luuY?.length && (
          <section className="hdn-muc">
            <h4>Lưu ý</h4>
            <ul className="hdn-luu">{hd.luuY.map((x, n) => <li key={n}>{x}</li>)}</ul>
          </section>
        )}
        {qtMod?.quyTrinh && sc.kind !== 'quytrinh' && (
          <section className="hdn-muc">
            <h4>Đi tiếp</h4>
            <DiTiep qtMod={qtMod} khoa={khoa} s={s} gon />
            <Link className="hdn-mo-qt" to={`/app/${qtMod.key}/quy-trinh`}><Icon n="flow" className="ic sm" />Mở sơ đồ Quy trình</Link>
          </section>
        )}
      </div>
    </aside>
  )

  return (
    <>
      <button type="button" className={`mtabs-hdn${daXem ? '' : ' nhay'}${dai ? ' on' : ''}`} title="Hướng dẫn nhanh" aria-label="Hướng dẫn nhanh"
        aria-expanded={dai} aria-controls="hdn-dai" onClick={() => dai ? tat() : setDai(true)}>
        <Icon n="bong-den" className="ic sm" /><span>Hướng dẫn</span>
      </button>
      {/* dải, số cam, khung nằm thẳng trong body để nổi trên sidebar, thanh trên, lớp tối phủ được cả màn (T680);
          form toàn màn đang mở thì nằm trong form, dải ngay dưới thanh đầu form; hộp thoại .overlay vẫn nằm trên (T676) */}
      {dai && createPortal(<>{daiEl}{chamEl}{khungEl}</>, form ?? document.body)}
    </>
  )
}

/** ModuleTabs gắn nút ở mọi phân hệ trừ Trang chủ */
export const coHuongDanNhanh = (mod: ModuleDef) => mod.key !== 'trang-chu'

