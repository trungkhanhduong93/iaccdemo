// Hướng dẫn nhanh từng màn (T673, QD86): nút Hướng dẫn cuối thanh tab phân hệ. Nội dung 4 mục: Màn này để làm gì, Làm nhanh, Lưu ý,
// Đi tiếp (sơ đồ luồng lấy từ quy-trinh.ts). Nội dung riêng của màn nằm ở src/modules/<phân hệ>/huong-dan.ts, tra theo slug màn; màn chưa có thì dùng bộ chung theo kiểu màn.
// Lần đầu mở một màn: nút nhấp nháy, bấm rồi thì màn đó thôi nhấp nháy, nhớ theo người dùng và màn.
// Màn mà đầu báo cáo nằm thay thanh tab (phân hệ Báo cáo, báo cáo đầu mới T576) đặt nút ở thanh chọn báo cáo, Tất cả báo cáo (T674).
// Kiểu tour như Trang chủ (T681, QD88, thay dải bước của QD87): lớp tối chặn bấm, khoanh sáng đúng chỗ thật của từng bước, bong bóng cạnh chỗ khoanh.
// Bong bóng đầu giữa màn: Màn này để làm gì; bong bóng cuối: Lưu ý, Đi tiếp. Tiếp tự làm thao tác của bước: mở form, chọn cửa hàng, bấm Lưu.
// Bỏ qua, Xong trả lại như lúc bấm nút: đóng form, về đúng màn, tab, cửa hàng như cũ, xoá phiếu mẫu tour đã lưu.
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { cuaHangHienTai, useSession, type Session } from '../app/session'
import { MODULES, dich, hienMan, laBaoCao, moDuoc, nhanTab } from '../app/registry'
import { anNgoaiGoi, type Goi } from '../app/plan'
import type { ModuleDef, NutQT, QuyTrinhDef, ScreenDef } from '../modules/types'
import { baoCaoCuaPhanHe } from '../modules/bao-cao/cuaPhanHe'
import { Icon } from './Icon'
import { heSoZoom } from './zoom'
import { datTourChay, dongFormTren, formTren, ngheForm, phieuTour, soLanLuu } from './huongDanForm'
import { boPhieuMoi } from './generic/daXoa'

/** Một bước Làm nhanh. o: khoá ô trên sơ đồ khung màn mà bước chỉ tới, hoặc ô trong form phiếu (O_FORM); di: đường dẫn sau /app/ cho nút làm ngay, nutDi: chữ trên nút đó */
export interface BuocHD { chu: string; o?: string; di?: string; nutDi?: string; dt?: string }
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
export function manDangMo(mod: ModuleDef, slug: string | undefined, s: Session) {
  return mod.screens.find(x => x.slug === slug) ?? (slug ? baoCaoCuaPhanHe(mod, s).find(x => x.slug === slug) : undefined)
}

export function layHuongDan(mod: ModuleDef, sc: ScreenDef | undefined, s: Session): HuongDanMan | undefined {
  if (!sc || mod.key === 'trang-chu') return undefined
  const rieng = NOI_DUNG[sc.goc ?? mod.key]?.[sc.slug]
  return rieng && (!rieng.goi || rieng.goi.includes(s.goi)) ? rieng : boChung(sc, mod)
}

// ── Đi tiếp: các bước trên sơ đồ Quy trình theo đúng bản gói đang dùng thấy (như QuyTrinhScreen) ──
export interface BuocLuong { ten?: string; nut: NutQT[]; song?: boolean }   // song: làn của sơ đồ hội tụ, các làn cùng đổ về bước sau

export function luongCua(qt: QuyTrinhDef, s: Session): BuocLuong[] {
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

export const khopNut = (n: NutQT, khoa: string[]) => {
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

/** Sơ đồ khung màn: các ô xếp theo hàng như màn thật, ô nào có bước Làm nhanh chỉ tới thì gắn số bước.
 *  Bong bóng tour giữa màn hiện sơ đồ khi bước không tìm được chỗ thật, ô của bước đang xem sáng cam (T681) */
function SoDoMan({ soDo, buoc, sang }: { soDo: OSoDo[][]; buoc: BuocHD[]; sang?: string }) {
  const so = (k: string) => buoc.flatMap((b, i) => b.o === k ? [i + 1] : [])
  return (
    <div className="hdn-sodo" aria-label="Sơ đồ khung màn">
      {soDo.map((hang, i) => (
        <div key={i} className="hdn-sodo-hang">
          {hang.map(o => {
            const ds = so(o.k)
            return (
              <div key={o.k} className={`hdn-o${o.kieu ? ' ' + o.kieu : ''}${sang === o.k ? ' sang' : ''}`} style={{ flexGrow: o.rong ?? 1 }}>
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
export const laBuocForm = (x?: BuocHD) => !!x?.o && O_FORM.has(x.o)
const coKhung = (e: Element) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }

/** Khung bao quanh nhiều phần tử, vd các ô lọc, các tab */
function hop(ds: Element[]): DOMRect | null {
  const rs = ds.filter(coKhung).map(e => e.getBoundingClientRect())
  if (!rs.length) return null
  const l = Math.min(...rs.map(r => r.left)), t = Math.min(...rs.map(r => r.top))
  return new DOMRect(l, t, Math.max(...rs.map(r => r.right)) - l, Math.max(...rs.map(r => r.bottom)) - t)
}

/** form: form toàn màn đang mở, che màn danh sách nên chỉ tìm trong form */
export function timCho(k: string, form: HTMLElement | null): DOMRect | null {
  const rieng = [...(form ?? document).querySelectorAll(`[data-hd="${k}"]`)].find(coKhung)
  if (rieng) return rieng.getBoundingClientRect()
  if (form) return null
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

// ── Tour (T681, QD88): như tour Trang chủ (T138), lớp tối chặn bấm, khoanh sáng chỗ thật, bong bóng cạnh chỗ khoanh ──
/** Một bong bóng của tour. dau: mở đầu giữa màn; cuoi: Lưu ý, Đi tiếp; buoc: bước Làm nhanh thứ n;
 *  cn: form hỏi cửa hàng lập phiếu, đứng trước bước đầu trong form (n); vua: phiếu vừa lưu ở đầu danh sách, sau bước Lưu (n) */
export interface BuocTour { k: 'dau' | 'cuoi' | 'buoc' | 'cn' | 'vua'; n: number }

/** hoiCn: thanh trên đang xem Tất cả cửa hàng nên form phiếu mới hỏi cửa hàng trước khi hiện ô nhập */
export function dsTour(hd: HuongDanMan, hoiCn: boolean): BuocTour[] {
  const dau = hd.buoc.findIndex(laBuocForm)
  return [
    { k: 'dau', n: -1 },
    ...hd.buoc.flatMap((x, n): BuocTour[] => [
      ...(n === dau && hoiCn ? [{ k: 'cn' as const, n }] : []),
      { k: 'buoc', n },
      ...(x.o === 'luu' ? [{ k: 'vua' as const, n }] : []),
    ]),
    { k: 'cuoi', n: -1 },
  ]
}
export const trongForm = (hd: HuongDanMan, x?: BuocTour) => x?.k === 'cn' || (x?.k === 'buoc' && laBuocForm(hd.buoc[x.n]))

const LE = 6        // khoảng hở quanh chỗ khoanh, như tour Trang chủ
const RONG = 320    // bề rộng bong bóng
const CHU_CN = 'Thanh trên đang xem Tất cả cửa hàng nên phiếu mới hỏi lập cho cửa hàng nào. Bấm tên một cửa hàng để chọn.'

/** Chỗ khoanh của bước tour, px CSS đã chia zoom (docs/BAY.md). Khối dài hơn màn (bảng, tờ báo cáo) chỉ khoanh phần đang thấy.
 *  so: số phiếu vừa lưu, khoanh dòng đầu tiên mang số đó trong bảng danh sách */
export function choTour(hd: HuongDanMan, x: BuocTour, form: HTMLElement | null, so?: string): DOMRect | null {
  const o = x.k === 'buoc' ? hd.buoc[x.n].o : undefined
  const el = x.k === 'cn' ? form?.querySelector('.chon-cn')
    : x.k === 'vua' && so ? [...document.querySelectorAll('.main table.tbl tbody tr')].find(tr => coKhung(tr) && !!tr.textContent?.includes(so))
    : undefined
  const r = el && coKhung(el) ? el.getBoundingClientRect() : o ? timCho(o, form) : null
  if (!r) return null
  const l = Math.max(r.left, LE), t = Math.max(r.top, LE), p = Math.min(r.right, window.innerWidth - LE), d = Math.min(r.bottom, window.innerHeight - LE)
  if (p - l < 4 || d - t < 4) return null
  const z = heSoZoom()
  return new DOMRect(l / z, t / z, (p - l) / z, (d - t) / z)
}

/** Bong bóng bên phải, trái, dưới, trên chỗ khoanh, chỗ nào đủ chỗ trước; khối cao gần hết màn thì đặt ở đáy màn (như tour Trang chủ) */
function viTriBong(o: DOMRect, cao: number): CSSProperties {
  const z = heSoZoom(), W = window.innerWidth / z, H = window.innerHeight / z
  const doc = Math.max(12, Math.min(o.top, H - cao - 12)), ngang = Math.max(12, Math.min(o.left, W - RONG - 12))
  if (o.right + LE + 14 + RONG < W) return { left: o.right + LE + 14, top: doc }
  if (o.left - LE - 14 - RONG > 0) return { left: o.left - LE - 14 - RONG, top: doc }
  if (o.bottom + LE + 12 + cao + 12 < H) return { top: o.bottom + LE + 12, left: ngang }
  if (o.top - LE - 12 - cao - 12 > 0) return { top: o.top - LE - 12 - cao, left: ngang }
  return { top: Math.max(12, H - cao - 12), left: Math.max(12, (W - RONG) / 2) }
}

/** Đo chiều cao bong bóng sau khi vẽ, để viTriBong đặt không tràn màn */
function useCaoBong() {
  const [cao, setCao] = useState(200)
  const ref = (el: HTMLDivElement | null) => { if (el && Math.abs(el.offsetHeight - cao) > 2) setCao(el.offsetHeight) }
  return [cao, ref] as const
}

// Nút ở thanh chọn báo cáo đang hiện thì nút cuối thanh tab (đã ẩn theo thanh tab) thôi gắn, mỗi màn đúng một nút (T674)
let soNutNgoai = 0
const ngheNut = new Set<() => void>()
const baoNut = () => ngheNut.forEach(f => f())
const ngheNutNgoai = (f: () => void) => { ngheNut.add(f); return () => { ngheNut.delete(f) } }

export const KHOA_XEM = 'iacc-hdn-da-xem'
export const docXem = (): string[] => { try { const v = JSON.parse(localStorage.getItem(KHOA_XEM) || '[]'); return Array.isArray(v) ? v : [] } catch { return [] } }
export function ghiXem(k: string) {
  const ds = docXem()
  if (ds.includes(k)) return
  try { localStorage.setItem(KHOA_XEM, JSON.stringify([k, ...ds].slice(0, 500))) } catch { /* trình duyệt chặn lưu thì thôi */ }
}

/** Nút Hướng dẫn (bóng đèn, T680) cuối thanh tab và tour của màn (T681, QD88). Trang chủ đã có hướng dẫn từng bước riêng (T138) nên không gắn.
 *  ngoaiThanhTab: nút đặt ở thanh chọn báo cáo, Tất cả báo cáo khi thanh tab ẩn (T674) */
export function NutHuongDan({ mod, ngoaiThanhTab }: { mod: ModuleDef; ngoaiThanhTab?: boolean }) {
  const { s, set } = useSession()
  useEffect(() => {
    if (!ngoaiThanhTab) return
    soNutNgoai++; baoNut()
    return () => { soNutNgoai--; baoNut() }
  }, [ngoaiThanhTab])
  const coNutNgoai = useSyncExternalStore(ngheNutNgoai, () => soNutNgoai > 0)
  const loc = useLocation()
  const nav = useNavigate()
  // lúc bấm nút Hướng dẫn: đường dẫn (màn, tab đang xem), cửa hàng trên thanh trên, form phiếu mới có hỏi cửa hàng không. null: tour đang tắt
  const [goc, setGoc] = useState<{ path: string; cuaHang: string; hoiCn: boolean } | null>(null)
  const [i, setI] = useState(0)
  const [o, setO] = useState<DOMRect | null>(null)   // chỗ khoanh của bước đang xem, null thì bong bóng nằm giữa màn
  const [doi, setDoi] = useState(false)               // đang chờ chỗ khoanh hiện (form đang mở ra): chỉ phủ tối, chưa hiện bong bóng
  const [caoBong, refBong] = useCaoBong()
  const refTiep = useRef<HTMLButtonElement>(null)
  const form = useSyncExternalStore(ngheForm, formTren)    // form toàn màn đang mở (T676)
  const slug = loc.pathname.split('/')[3]
  const sc = manDangMo(mod, slug, s)
  const rieng = sc && NOI_DUNG[sc.goc ?? mod.key]?.[sc.slug]
  const hd = sc && (rieng && (!rieng.goi || rieng.goi.includes(s.goi)) ? rieng : boChung(sc, mod))
  const chay = goc !== null
  const ds = hd ? dsTour(hd, !!goc?.hoiCn) : []
  const x = ds[i] as BuocTour | undefined
  const khoaXem = `${s.email}|${mod.key}/${slug ?? ''}`
  const [daXem, setDaXem] = useState(() => docXem().includes(khoaXem))
  useEffect(() => { setDaXem(docXem().includes(khoaXem)) }, [khoaXem])
  // tour đang chạy mà sang màn khác thì tắt, không quay về
  useEffect(() => { if (goc) ketThuc(false) }, [khoaXem])   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!chay) return; datTourChay(true); return () => datTourChay(false) }, [chay])
  // bám chỗ khoanh mỗi khung hình như tour Trang chủ: form mở ra, bảng tải xong, cuộn, đổi cỡ cửa sổ làm nó dịch chuyển.
  // Bước có chỗ khoanh mà chưa thấy thì chỉ phủ tối, chờ tối đa 1,5 giây rồi mới đặt bong bóng giữa màn
  useEffect(() => {
    if (!hd || !x) return
    const coCho = x.k === 'cn' || x.k === 'vua' || (x.k === 'buoc' && !!hd.buoc[x.n].o)
    const bd = Date.now()
    let f = 0
    const bam = () => {
      const r = coCho ? choTour(hd, x, formTren(), phieuTour().at(-1)?.so) : null
      setO(c => c && r && c.x === r.x && c.y === r.y && c.width === r.width && c.height === r.height ? c : r)
      setDoi(coCho && !r && Date.now() - bd < 1500)
      if (coCho) f = requestAnimationFrame(bam)
    }
    bam()   // đo ngay, không chờ khung hình đầu (tab chạy nền thì requestAnimationFrame đứng)
    return () => cancelAnimationFrame(f)
  }, [chay, i, khoaXem])   // eslint-disable-line react-hooks/exhaustive-deps
  // Enter bấm nút chính của bong bóng: đưa con trỏ vào nút đó mỗi lần sang bước
  useEffect(() => { if (chay && !doi) refTiep.current?.focus({ preventScroll: true }) }, [chay, i, doi])
  useEffect(() => {
    if (!chay) return
    // lớp tối chặn bấm thì chặn luôn phím của màn bên dưới (Esc đóng form, Ctrl + S lưu phiếu), chỉ nút Bỏ qua mới tắt tour.
    // Tab, Enter, phím cách trong bong bóng vẫn bấm được nút của bong bóng
    const chan = (e: KeyboardEvent) => {
      const trong = e.target instanceof Element && !!e.target.closest('.hdn-tour .hdan-bong')
      if (!(e.key === 'Tab' || (trong && (e.key === 'Enter' || e.key === ' ')))) e.preventDefault()
      e.stopPropagation()
    }
    window.addEventListener('keydown', chan, true)
    return () => window.removeEventListener('keydown', chan, true)
  }, [chay])

  /** Bỏ qua, Xong: trả lại như lúc bấm nút Hướng dẫn. Đóng form tour mở, xoá phiếu mẫu tour đã lưu, cửa hàng trên thanh trên như cũ.
   *  veCu: về đúng màn, tab lúc bấm nút; bấm chỗ Đi tiếp, nút làm ngay thì sang màn đó, không về */
  function ketThuc(veCu: boolean) {
    if (!goc) return
    if (formTren()) dongFormTren()
    for (const p of phieuTour()) boPhieuMoi(p.man, p.id)
    if (s.cuaHang !== goc.cuaHang) set({ cuaHang: goc.cuaHang })
    setGoc(null)
    if (veCu) nav(goc.path, { replace: true })
  }
  // form mở cho bước trong form: nút làm ngay của bước trước gần nhất (vd Ghi một khoản chi), không có thì Thêm mới của màn chứng từ
  function diMoForm(n: number) {
    if (!hd || !sc) return undefined
    return hd.buoc.slice(0, n).reverse().find(y => y.di)?.di
      ?? (sc.kind === 'voucher' && !sc.voucher?.khongThem ? `${loc.pathname.split('/')[2]}/${sc.slug}/moi` : undefined)
  }
  /** Sang bong bóng t, giao diện tự tới chỗ của bước (T680): bước trong form mà form chưa mở thì mở form; quay lại bước chọn cửa hàng
   *  thì thanh trên về như cũ để form hỏi lại; bước ngoài form mà form đang mở thì đóng form không hỏi */
  function toi(t: number) {
    const y = ds[t]
    if (!hd || !y) return
    if (trongForm(hd, y)) {
      if (y.k === 'cn' && goc && s.cuaHang !== goc.cuaHang) set({ cuaHang: goc.cuaHang })
      const di = !formTren() && diMoForm(y.n)
      if (di) nav(`/app/${di}`)
    } else if (formTren()) dongFormTren()
    setI(t)
  }
  /** Tiếp: máy tự làm thao tác của bước đang xem rồi mới sang bước sau. Chọn cửa hàng: bấm cửa hàng đầu tiên. Bước Lưu: bấm Lưu,
   *  form tự đóng về danh sách (ChungTuForm), bước sau khoanh phiếu vừa lưu; lưu không được thì ở lại, form báo ô còn thiếu */
  function tiep() {
    if (!hd || !x) return
    if (x.k === 'cn') form?.querySelector<HTMLElement>('.chon-cn-ds button')?.click()
    const luu = x.k === 'buoc' && hd.buoc[x.n].o === 'luu' ? form?.querySelector<HTMLElement>('[data-hd="luu"]') : null
    if (luu) {
      const truoc = soLanLuu()
      luu.click()
      if (soLanLuu() > truoc) setI(i + 1)   // form tự đóng sau khi lưu, không đóng thêm lần nữa
      return
    }
    toi(i + 1)
  }

  if (mod.key === 'trang-chu' || !sc || !hd || (!ngoaiThanhTab && coNutNgoai)) return null

  // báo cáo mở từ phân hệ Báo cáo (/app/bao-cao/<slug>) đi tiếp theo sơ đồ của phân hệ gốc
  const qtMod = MODULES.find(m => m.key === (hd.quyTrinh?.mod ?? (mod.key === 'bao-cao' ? sc.goc : undefined) ?? mod.key))
  const khoa = [`${sc.goc ?? mod.key}/${sc.slug}`, ...(hd.quyTrinh?.khop ?? [])]
  const tong = ds.length - 2   // số bước, không tính bong bóng mở đầu, kết
  const b = x?.k === 'buoc' ? hd.buoc[x.n] : undefined
  const soVua = phieuTour().at(-1)?.so
  const batDau = () => {
    ghiXem(khoaXem); setDaXem(true)
    setGoc({ path: loc.pathname + loc.search, cuaHang: s.cuaHang, hoiCn: !cuaHangHienTai(s) })
    setI(0); setO(null); setDoi(false)
  }
  // nút làm ngay của bước mà Tiếp không tự làm (vd Mở Thu chi tiền mặt): tắt tour rồi tới đó
  const lam = (di: string) => { ketThuc(false); nav(`/app/${di}`) }

  const boQua = <button type="button" className="btn ghost sm" onClick={() => ketThuc(true)}>Bỏ qua</button>
  let than: ReactNode = null
  if (x?.k === 'dau') than = <>
    <div className="hdan-bong-ic"><Icon n="bong-den" className="ic" /></div>
    <small className="hdn-bong-nhan">Hướng dẫn nhanh</small>
    <b>{nhanTab(sc)}</b>
    <p>{hd.muc}</p>
    <div className="row hdan-nut">{boQua}<button ref={refTiep} type="button" className="btn pri sm" onClick={() => toi(1)}>Bắt đầu</button></div>
  </>
  else if (x?.k === 'cuoi') than = <>
    <div className="hdn-bong-dau"><span className="hdan-bong-ic"><Icon n="check" className="ic" /></span><b>Đã xem hết hướng dẫn</b></div>
    {!!hd.luuY?.length && (
      <section className="hdn-muc">
        <h4>Lưu ý</h4>
        <ul className="hdn-luu">{hd.luuY.map((y, n) => <li key={n}>{y}</li>)}</ul>
      </section>
    )}
    {qtMod?.quyTrinh && sc.kind !== 'quytrinh' && (
      <section className="hdn-muc">
        <h4>Đi tiếp</h4>
        <DiTiep qtMod={qtMod} khoa={khoa} s={s} gon />
        <Link className="hdn-mo-qt" to={`/app/${qtMod.key}/quy-trinh`}><Icon n="flow" className="ic sm" />Mở sơ đồ Quy trình</Link>
      </section>
    )}
    <p>Bấm nút Hướng dẫn để xem lại bất cứ lúc nào.</p>
    <div className="row hdan-nut">
      {tong > 0 && <button type="button" className="btn sm" onClick={() => toi(i - 1)}>Quay lại</button>}
      <span className="grow" />
      <button ref={refTiep} type="button" className="btn pri sm" onClick={() => ketThuc(true)}>Xong</button>
    </div>
  </>
  else if (x) than = <>
    <span className="hdn-bong-so">Bước {i}/{tong}</span>
    <p className="hdn-bong-chu">{x.k === 'cn' ? CHU_CN
      : x.k === 'vua' ? `Phiếu ${soVua ?? ''} vừa lưu nằm ở đầu danh sách. Đây là phiếu mẫu của hướng dẫn, tắt hướng dẫn thì phiếu tự xoá.`
      : b?.chu}</p>
    {!o && b?.o && hd.soDo && <SoDoMan soDo={hd.soDo} buoc={hd.buoc} sang={b.o} />}
    {b?.di && !trongForm(hd, ds[i + 1]) && (
      <button type="button" className="btn sm hdan-lam" onClick={() => lam(b.di!)}>{b.nutDi ?? 'Làm ngay'}<Icon n="arrow" className="ic sm" /></button>
    )}
    <div className="row hdan-nut">
      <span className="grow" />
      {boQua}
      {i > 1 && <button type="button" className="btn sm" onClick={() => toi(i - 1)}>Quay lại</button>}
      <button ref={refTiep} type="button" className="btn pri sm" onClick={tiep}>Tiếp</button>
    </div>
  </>

  // tour nằm thẳng trong body như tour Trang chủ: trên sidebar, thanh trên, form toàn màn (.fsf z 45), hộp thoại (.overlay z 50).
  // Lớp tối, khung khoanh phủ cả màn nên bấm vào vùng tối không làm gì
  const tourEl = x && (
    <div className="hdan hdn-tour" role="dialog" aria-modal="true" aria-label={`Hướng dẫn nhanh: ${nhanTab(sc)}`}>
      {o ? <div className="hdan-lo" style={{ left: o.left - LE, top: o.top - LE, width: o.width + LE * 2, height: o.height + LE * 2 }} />
        : <div className="hdan-toi" />}
      {!doi && (
        // bấm chỗ Đi tiếp, Mở sơ đồ Quy trình trong bong bóng cuối: tắt tour rồi sang màn đó
        <div ref={refBong} className={`hdan-bong${o ? '' : ' giua'}${x.k === 'cuoi' ? ' cuoi' : ''}`} style={o ? viTriBong(o, caoBong) : undefined}
          data-k={x.k === 'buoc' ? b?.o ?? '' : x.k} data-buoc={i} data-tong={tong} aria-live="polite"
          onClickCapture={e => { if (e.target instanceof Element && e.target.closest('a')) ketThuc(false) }}>
          {than}
        </div>
      )}
    </div>
  )

  return (
    <>
      <button type="button" className={`mtabs-hdn${daXem ? '' : ' nhay'}${chay ? ' on' : ''}`} title="Hướng dẫn nhanh" aria-label="Hướng dẫn nhanh"
        aria-haspopup="dialog" onClick={batDau}>
        <Icon n="bong-den" className="ic sm" /><span>Hướng dẫn</span>
      </button>
      {chay && tourEl && createPortal(tourEl, document.body)}
    </>
  )
}

/** ModuleTabs gắn nút ở mọi phân hệ trừ Trang chủ */
export const coHuongDanNhanh = (mod: ModuleDef) => mod.key !== 'trang-chu'
