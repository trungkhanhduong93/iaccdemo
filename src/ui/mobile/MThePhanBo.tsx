// Thẻ chi phí phân bổ trên điện thoại (T590): nội dung màn xem (tab Chi tiết, Lịch phân bổ, Lịch sử) và màn sửa thẻ.
// Số liệu dùng chung logic web (lichDong, tinhDong): số gõ lại đè số chia đều, các kỳ từ tháng ngừng về 0,
// kỳ liền trước tháng ngừng nhận toàn bộ phần còn lại. App không thêm, không xoá mục; muốn bỏ thì xoá cả thẻ.
import { useState, type FC, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Goi } from '../../app/plan'
import { canKichHoat, daPhanBoKy, daPhanBoToiKy, kyNay, lichDong, tinhDong, type DongPb } from '../../modules/ccdc/the-phan-bo'
import { docSoQT, money } from '../format'
import { Icon } from '../Icon'
import { LichDon } from '../ChonNgay'
import { HopXacNhan } from '../LocNangCao'
import { MLichSu, type DongLichSu } from './MLichSu'

export type TheMobile = {
  soThe: string
  loai: string
  ngay: string
  ten: string
  cn: string
  gt: number
  ky?: number
  ngayPb?: string
  soCt?: string
  ngayCt?: string
  ghiChuCt?: string
  _goc?: string
  _kieu?: 'dau'
  dong: DongPb[]
}

const so = docSoQT
const laDau = (t: TheMobile) => t._kieu === 'dau'
const kieuDong = (loai: string) => loai === 'Công cụ dụng cụ' ? 'ccdc' : loai === 'Tài sản cố định' ? 'tscd' : 'cptt'
const thangCua = (ngay: string) => { const m = ngay.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? +m[3] * 100 + +m[2] : 0 }
const tenThang = (ky: number) => `${String(ky % 100).padStart(2, '0')}/${Math.floor(ky / 100)}`
const ngaySo = (d: string) => { const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? +m[3] * 10000 + +m[2] * 100 + +m[1] : NaN }
const gtThe = (t: TheMobile) => t.dong.reduce((s, d) => s + so(d.gt), 0)

/** Trạng thái kỳ (T590): Free, Standard theo tháng hiện tại; Plus, Pro theo kỳ đã bấm Phân bổ trên web */
function trangThaiKy(t: TheMobile, ky: number, ngung: boolean, goi: Goi): [string, string] {
  if (ngung) return ['ngung', 'Ngừng phân bổ']
  if (canKichHoat(goi)) return daPhanBoKy(t.soThe, ky) ? ['da', 'Đã phân bổ'] : ['cho', 'Chờ phân bổ']
  return ky <= kyNay() ? ['da', 'Đã phân bổ'] : ['chua', 'Chưa phân bổ']
}

interface KyGop { ky: number; ngay: string; tien: number; ngung: boolean; don: boolean; sua: boolean; phan: { di: number; tien: number; ngung: boolean }[] }
/** Lịch cả thẻ: gộp các dòng theo tháng */
function lichThe(t: TheMobile): KyGop[] {
  const gom = new Map<number, KyGop>()
  t.dong.forEach((d, di) => lichDong(t, d).forEach(k => {
    const ky = thangCua(k.ngay)
    const g = gom.get(ky) ?? { ky, ngay: k.ngay, tien: 0, ngung: true, don: false, sua: false, phan: [] }
    g.tien += k.tien; g.ngung = g.ngung && k.ngung; g.don = g.don || Boolean((k as { don?: boolean }).don); g.sua = g.sua || k.nhap !== undefined
    g.phan.push({ di, tien: k.tien, ngung: k.ngung })
    gom.set(ky, g)
  }))
  return [...gom.values()].sort((a, b) => a.ky - b.ky)
}

const Dong: FC<{ n: string; v: string; dam?: boolean; cls?: string }> = ({ n, v, dam, cls }) => (
  <div className={`m-t449-hang-dong${cls ? ' ' + cls : ''}`}><span className="lbl">{n}</span><span className={`val${dam ? ' bold' : ''}`}>{v}</span></div>
)

/** Một mục phân bổ trên màn xem: khuôn dòng hàng phiếu mua (T449); trường theo loại thẻ và thẻ đầu kỳ */
const MucXem: FC<{ t: TheMobile; d: DongPb; i: number }> = ({ t, d, i }) => {
  const kieu = kieuDong(t.loai), dau = laDau(t)
  const { can, kyCon, tienKy } = tinhDong(t, d)
  return (
    <div className="m-t449-hang-the">
      <div className="m-t449-hang-dau">
        <div className="m-t449-hang-ten">{i + 1}. {d.ten || t.ten}{d.ma ? <span className="m-t449-hang-ma">-{d.ma}</span> : null}</div>
        {d.ngung && <span className="m-tpb-chip ngung">Ngừng phân bổ</span>}
      </div>
      {kieu === 'tscd' && d.moTa && <div className="m-tpb-mo-ta">{d.moTa}</div>}
      <div className="m-t449-hang-than">
        {kieu === 'tscd' && <Dong n="Số hiệu:" v={d.soHieu || '—'} />}
        {kieu === 'ccdc' && <><Dong n="Số lượng:" v={`${so(d.sl) || 1} ${d.dvt || 'Cái'}`} dam /><Dong n="Đơn giá:" v={`${money(so(d.dg))} đ`} /></>}
        <Dong n="Số tiền:" v={`${money(so(d.gt))} đ`} dam />
        {dau && <><Dong n="Giá trị đã phân bổ:" v={`${money(so(d.da))} đ`} /><Dong n="Giá trị cần phân bổ:" v={`${money(can)} đ`} dam /></>}
        <div className="m-tpb-tach" />
        <Dong n="Số tháng phân bổ:" v={`${so(d.ky)} tháng`} />
        {dau && <><Dong n="Số tháng đã phân bổ:" v={`${so(d.kyDa)} tháng`} /><Dong n="Số tháng còn lại:" v={`${kyCon} tháng`} /></>}
        <Dong n="Phân bổ mỗi tháng:" v={`${money(tienKy)} đ`} dam />
        <Dong n="Ngày bắt đầu phân bổ:" v={String(d.ngayPb ?? t.ngayPb ?? '')} />
        {d.ngung && <Dong n="Ngày ngừng phân bổ:" v={String(d.ngayNgung ?? '')} cls="ngung" />}
      </div>
    </div>
  )
}

/** Tab Lịch phân bổ: lọc theo mục, ô tóm tắt, gom theo năm, kỳ này nổi bật, bấm kỳ xem chia theo mục */
const TabLich: FC<{ t: TheMobile; goi: Goi }> = ({ t, goi }) => {
  const [loc, setLoc] = useState<number | 'all'>('all')
  const [mo, setMo] = useState<Record<number, boolean>>({})
  const nhieu = t.dong.length > 1
  const chon = nhieu ? loc : 0
  const kyTruoc = (d: DongPb) => laDau(t) ? so(d.kyDa) : 0
  type KyHien = KyGop & { kySo: number }
  const ds: KyHien[] = chon === 'all'
    ? lichThe(t).map((k, i) => ({ ...k, kySo: i + 1 + (laDau(t) ? Math.max(...t.dong.map(kyTruoc)) : 0) }))
    : lichDong(t, t.dong[chon]).map((k, i) => ({ ky: thangCua(k.ngay), ngay: k.ngay, tien: k.tien, ngung: k.ngung, don: Boolean((k as { don?: boolean }).don), sua: k.nhap !== undefined, phan: [], kySo: i + 1 + kyTruoc(t.dong[chon]) }))
  const nay = kyNay()
  const chay = ds.filter(k => !k.ngung)
  const daXong = chay.filter(k => trangThaiKy(t, k.ky, false, goi)[0] === 'da')
  const toi = chay.find(k => k.ky > nay)
  const conTien = chay.filter(k => trangThaiKy(t, k.ky, false, goi)[0] !== 'da').reduce((s, k) => s + k.tien, 0)
  const nam = new Map<number, KyHien[]>()
  ds.forEach(k => { const y = Math.floor(k.ky / 100); nam.set(y, [...(nam.get(y) ?? []), k]) })
  return (
    <>
      {nhieu && (
        <div className="m-tpb-loc" role="group" aria-label="Lọc theo mục">
          <button type="button" aria-pressed={chon === 'all'} onClick={() => setLoc('all')}>Tất cả mục</button>
          {t.dong.map((d, i) => <button key={i} type="button" aria-pressed={chon === i} onClick={() => setLoc(i)}>{d.ten || t.ten}</button>)}
        </div>
      )}
      <div className="m-pb-the m-tpb-tom">
        <div><div className="n">Đã phân bổ</div><div className="s">{daXong.length}/{chay.length} kỳ</div></div>
        <div><div className="n">Kỳ tới{toi ? ` · ${tenThang(toi.ky)}` : ''}</div><div className="s xanh">{toi ? `${money(toi.tien)} đ` : '—'}</div></div>
        <div><div className="n">Còn phải phân bổ</div><div className="s cam">{money(conTien)} đ</div></div>
      </div>
      {[...nam.entries()].map(([y, ks]) => (
        <div key={y}>
          <div className="m-pb-nhom m-tpb-nhom-nam"><span>Năm {y}</span><span>{money(ks.reduce((s, k) => s + k.tien, 0))} đ</span></div>
          <div className="m-pb-the m-pb-the-gon">
            {ks.map(k => {
              const [cls, nhan] = trangThaiKy(t, k.ky, k.ngung, goi)
              const bam = chon === 'all' && nhieu
              return (
                <div key={k.ky}>
                  <div
                    className={`m-pb-ky-dong${k.ky === nay ? ' m-tpb-ky-nay' : ''}${bam ? ' m-tpb-ky-bam' : ''}`}
                    {...(bam ? { role: 'button', tabIndex: 0, 'aria-expanded': Boolean(mo[k.ky]), onClick: () => setMo(x => ({ ...x, [k.ky]: !x[k.ky] })), onKeyDown: (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMo(x => ({ ...x, [k.ky]: !x[k.ky] })) } } } : {})}
                  >
                    <div>
                      <div className="m-pb-ky-ten">Tháng {tenThang(k.ky)} <span className="m-tpb-ky-so">Kỳ {k.kySo}</span>{k.ky === nay && <span className="m-tpb-chip da nho">Kỳ này</span>}</div>
                      <div className="m-pb-ky-ngay">{k.ngay}</div>
                      {k.don ? <div className="m-tpb-ky-ghi cam">Gồm phần còn lại do ngừng phân bổ</div> : k.sua ? <div className="m-tpb-ky-ghi xanh">Đã sửa số tiền</div> : null}
                    </div>
                    <div className="m-pb-ky-phai">
                      <div className={`m-pb-ky-tien${k.ngung ? ' m-tpb-mo' : ''}`}>{money(k.tien)} đ</div>
                      <span className={`m-tpb-chip ${cls}`}>{nhan}</span>
                    </div>
                  </div>
                  {bam && mo[k.ky] && (
                    <div className="m-tpb-chia">
                      {k.phan.map(p => <div key={p.di}><span>{t.dong[p.di].ten || t.ten}</span><span className={p.ngung ? 'm-tpb-mo' : ''}>{p.ngung ? 'Ngừng · ' : ''}{money(p.tien)} đ</span></div>)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}

/** Thao tác mẫu của thẻ cho tab Lịch sử (cùng khuôn Lịch sử phiếu thu chi) */
function lichSuMau(t: TheMobile): DongLichSu[] {
  const ds: DongLichSu[] = []
  const kyDau = Math.min(...t.dong.map(d => thangCua(String(d.ngayPb ?? t.ngayPb ?? t.ngay))))
  if (kyDau && kyDau < kyNay()) {
    const c = new Date(Math.floor(kyDau / 100), kyDau % 100, 0)
    ds.push({ luc: `${String(c.getDate()).padStart(2, '0')}/${String(c.getMonth() + 1).padStart(2, '0')}/${c.getFullYear()} 17:00`, ai: 'Hệ thống', tenViec: `Phân bổ kỳ ${tenThang(kyDau)}`, loai: 'ghi_so', ghiChu: `Hạch toán chi phí phân bổ tháng ${tenThang(kyDau)}.` })
  }
  ds.push({ luc: `${t.ngay} 08:30`, ai: 'Trần Thu Hà', tenViec: laDau(t) ? 'Nhập thẻ dư đầu kỳ' : 'Ghi tăng thẻ', loai: 'tao', ghiChu: t.soCt ? `Tạo từ chứng từ ${t.soCt}.` : 'Nhập số dư đầu kỳ.' })
  return ds
}

/** Nội dung màn xem thẻ: khối tổng quan (có Ngày ghi tăng), 3 tab */
export const MTheNoiDung: FC<{ t: TheMobile; goi: Goi }> = ({ t, goi }) => {
  const [tab, setTab] = useState<'chitiet' | 'lichpb' | 'lichsu'>('chitiet')
  const nay = kyNay()
  const gt = gtThe(t)
  const da = daPhanBoToiKy(t, nay, goi)
  const con = Math.max(0, gt - da)
  const pt = gt > 0 ? Math.min(100, Math.round(da / gt * 100)) : 0
  const lich = lichThe(t).filter(k => !k.ngung)
  const kyTruoc = laDau(t) ? Math.max(...t.dong.map(d => so(d.kyDa))) : 0
  const tongKy = kyTruoc + lich.length
  const daKy = kyTruoc + lich.filter(k => trangThaiKy(t, k.ky, false, goi)[0] === 'da').length
  const soNgung = t.dong.filter(d => d.ngung).length
  const [ttCls, ttNhan] = soNgung > 0 && soNgung === t.dong.length ? ['ngung', 'Ngừng phân bổ'] : con <= 0 ? ['het', 'Hết phân bổ'] : ['dang', 'Đang phân bổ']
  return (
    <div className="m-pb-noi-dung">
      <div className="m-pb-the m-pb-the-tong-quan">
        <div className="m-pb-hang-chip m-tpb-hang-chip">
          <span className="m-tpb-chips">
            <span className="m-pb-chip-loai">{t.loai}</span>
            {laDau(t) && <span className="m-tpb-chip cho">Đầu kỳ</span>}
          </span>
          <span className="m-tpb-chips">
            {soNgung > 0 && soNgung < t.dong.length && <span className="m-tpb-chip ngung nho">Ngừng {soNgung}/{t.dong.length} mục</span>}
            <span className={`m-pb-chip-tt ${ttCls}`}>{ttNhan}</span>
          </span>
        </div>
        <div className="m-pb-ten-the">{t.ten}</div>
        <div className="m-pb-dong-cn"><Icon n="cuahang" className="ic sm" /><span>{t.cn}</span></div>
        <div>
          <div className="m-pb-nhan-gt">Giá trị thẻ</div>
          <div className="m-pb-so-gt">{money(gt)} đ</div>
        </div>
        <div>
          <div className="m-pb-thanh-tien-do-khung"><div className="m-pb-thanh-tien-do-ruot" style={{ width: `${pt}%` }} /></div>
          <div className="m-pb-tien-do-chu"><span>Đã phân bổ {daKy}/{tongKy} kỳ</span><span>{pt}%</span></div>
        </div>
        <div className="m-pb-luoi-stat">
          <div className="m-pb-o-stat da"><div className="m-pb-o-stat-nhan">Đã phân bổ</div><div className="m-pb-o-stat-so da">{money(da)} đ</div></div>
          <div className="m-pb-o-stat con"><div className="m-pb-o-stat-nhan">Còn lại</div><div className="m-pb-o-stat-so con">{money(con)} đ</div></div>
        </div>
        <div className="m-tpb-ngay-gt"><span>Ngày ghi tăng</span><b>{t.ngay}</b></div>
      </div>

      <div className="m-pb-tabs" role="tablist">
        {([['chitiet', 'Chi tiết'], ['lichpb', 'Lịch phân bổ'], ['lichsu', 'Lịch sử']] as const).map(([k, n]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={`m-pb-tab-btn${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>{n}</button>
        ))}
      </div>

      {tab === 'chitiet' && (
        <>
          <div className="m-pb-nhom">Mục phân bổ ({t.dong.length})</div>
          {t.dong.map((d, i) => <MucXem key={i} t={t} d={d} i={i} />)}
          {t.soCt && (
            <>
              <div className="m-pb-nhom">Thông tin mua</div>
              <div className="m-pb-the m-pb-the-gon">
                <div className="m-pb-dong"><span className="n">Số chứng từ</span>{t._goc ? <Link to={t._goc} className="m-pb-link-so">{t.soCt}</Link> : <span className="g">{t.soCt}</span>}</div>
                <div className="m-pb-dong"><span className="n">Ngày chứng từ</span><span className="g">{t.ngayCt || t.ngay}</span></div>
                <div className="m-pb-dong"><span className="n">Ghi chú</span><span className="g" style={{ fontWeight: 500 }}>{t.ghiChuCt || t.ten}</span></div>
              </div>
            </>
          )}
        </>
      )}
      {tab === 'lichpb' && <TabLich t={t} goi={goi} />}
      {tab === 'lichsu' && <div className="m-tpb-ls"><MLichSu goi={goi} man="dm/8-1-1" id={t.soThe} mau={lichSuMau(t)} /></div>}
    </div>
  )
}

// ── Màn sửa thẻ ──

const ONhap: FC<{ id: string; v: string; onDoi: (s: string) => void; soTien?: boolean; ngan?: boolean; dv?: string; khoa?: boolean; daSua?: boolean; nhan: string }> = ({ id, v, onDoi, soTien, ngan, dv, khoa, daSua, nhan }) => (
  <span className="m-tpb-o">
    <input id={id} className={`m-tpb-inp${ngan ? ' ngan' : ''}${daSua ? ' da-sua' : ''}`} aria-label={nhan} inputMode={soTien ? 'numeric' : undefined} value={v} disabled={khoa}
      onChange={e => onDoi(soTien ? e.target.value.replace(/\D/g, '') : e.target.value)} />
    {dv && <span className="m-tpb-dv">{dv}</span>}
  </span>
)
const tienO = (s: unknown) => { const n = so(s); return n ? money(n) : '' }

/** Đổi của thẻ khi lưu, ghi vào nhật ký "Sửa thẻ: Trường: cũ → mới; ..." để tab Lịch sử tách ra */
function moTaDoi(cu: TheMobile, moi: TheMobile): string {
  const doi: string[] = []
  if (cu.ten !== moi.ten) doi.push(`Tên thẻ: ${cu.ten} → ${moi.ten}`)
  cu.dong.forEach((a, i) => {
    const b = moi.dong[i], ten = a.ten || cu.ten
    if (so(a.gt) !== so(b.gt)) doi.push(`Số tiền · ${ten}: ${money(so(a.gt))} đ → ${money(so(b.gt))} đ`)
    if (so(a.ky) !== so(b.ky)) doi.push(`Số tháng phân bổ · ${ten}: ${so(a.ky)} tháng → ${so(b.ky)} tháng`)
    if (a.ngayPb !== b.ngayPb) doi.push(`Ngày bắt đầu phân bổ · ${ten}: ${a.ngayPb} → ${b.ngayPb}`)
    if ((a.ngung ? a.ngayNgung : '') !== (b.ngung ? b.ngayNgung : '')) doi.push(`Ngày ngừng phân bổ · ${ten}: ${a.ngung ? a.ngayNgung : 'Không'} → ${b.ngung ? b.ngayNgung : 'Không'}`)
    if (JSON.stringify(a._pbSua ?? {}) !== JSON.stringify(b._pbSua ?? {})) doi.push(`Số tiền từng kỳ · ${ten}: Chia đều → Sửa ${Object.keys(b._pbSua ?? {}).length} kỳ`)
  })
  return doi.length ? `Sửa thẻ: ${doi.join('; ')}` : 'Sửa thẻ'
}

/** Ngày ngừng mặc định khi bật: hôm nay (Free, Standard: cuối tháng này), không sớm hơn ngày bắt đầu phân bổ — như web */
function ngayNgungMd(bd: string, goi: Goi): string {
  const n = new Date(), p = (x: number) => String(x).padStart(2, '0')
  const s = goi === 'F' || goi === 'S' ? `${p(new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate())}/${p(n.getMonth() + 1)}/${n.getFullYear()}` : `${p(n.getDate())}/${p(n.getMonth() + 1)}/${n.getFullYear()}`
  return ngaySo(s) < ngaySo(bd) ? bd : s
}

/** Màn sửa thẻ: thông tin chung, danh sách mục (chỉ Sửa), sửa số tiền từng kỳ; lưu mà tổng các kỳ lệch thì hỏi dồn về kỳ cuối */
export const MTheSua: FC<{ t: TheMobile; goi: Goi; onHuy: () => void; onLuu: (moi: TheMobile, nhatKy: string) => void; baoLoi: (s: string) => void }> = ({ t, goi, onHuy, onLuu, baoLoi }) => {
  const [dr, setDr] = useState<TheMobile>(() => JSON.parse(JSON.stringify(t)))
  const [sheet, setSheet] = useState<number | null>(null)
  const [kyDong, setKyDong] = useState<number | null>(null)
  const [hoi, setHoi] = useState<number | null>(null)
  const [lich, setLich] = useState<null | { k: 'ngay' } | { k: 'ngayPb' | 'ngayNgung'; i: number }>(null)
  const kieu = kieuDong(dr.loai), dau = laDau(dr)

  const suaDong = (i: number, moi: Partial<DongPb>, giuKy = false) => setDr(x => ({
    ...x,
    dong: x.dong.map((d, j) => {
      if (j !== i) return d
      const n = { ...d, ...moi }
      if (kieu === 'ccdc' && ('sl' in moi || 'dg' in moi)) n.gt = String(so(n.sl) * so(n.dg))
      if (!giuKy) delete n._pbSua
      return n
    }),
  }))
  const lechDong = (x: TheMobile, d: DongPb) => tinhDong(x, d).can - lichDong(x, d).reduce((s, k) => s + k.tien, 0)

  const luu = (x: TheMobile) => {
    if (!x.ten.trim()) return baoLoi('Nhập tên thẻ')
    const loi = x.dong.findIndex(d => so(d.gt) <= 0 || so(d.ky) <= 0 || !Number.isFinite(ngaySo(String(d.ngayPb ?? ''))))
    if (loi >= 0) return baoLoi(`Mục ${loi + 1}: cần số tiền, số tháng và ngày bắt đầu phân bổ`)
    const ng = x.dong.findIndex(d => d.ngung && !(ngaySo(String(d.ngayNgung ?? '')) >= ngaySo(String(d.ngayPb ?? ''))))
    if (ng >= 0) return baoLoi(`Mục ${ng + 1}: ngày ngừng phân bổ phải sau hoặc bằng ngày bắt đầu phân bổ`)
    const lech = x.dong.findIndex(d => Math.round(lechDong(x, d)) !== 0)
    if (lech >= 0) { setDr(x); setHoi(lech); return }
    onLuu({ ...x, gt: gtThe(x) }, moTaDoi(t, x))
  }
  // Điều chỉnh: dồn chênh lệch vào kỳ cuối còn phân bổ (không phải kỳ ngừng, không phải kỳ nhận phần còn lại)
  const dieuChinh = () => {
    if (hoi === null) return
    const d = dr.dong[hoi], ds = lichDong(dr, d)
    let j = ds.length - 1
    while (j >= 0 && (ds[j].ngung || (ds[j] as { don?: boolean }).don)) j--
    const x = j < 0 ? dr : { ...dr, dong: dr.dong.map((y, i) => i === hoi ? { ...y, _pbSua: { ...y._pbSua, [j]: String(ds[j].tien + Math.round(lechDong(dr, d))) } } : y) }
    setHoi(null)
    luu(x)
  }

  // Màn sửa số tiền từng kỳ của một mục
  if (kyDong !== null) {
    const d = dr.dong[kyDong], ds = lichDong(dr, d), { can } = tinhDong(dr, d)
    const tong = ds.reduce((s, k) => s + k.tien, 0), lech = can - tong
    const conKy = ds.filter(k => !k.ngung).length
    const chiaDeu = () => {
      const goc = { ...d, _pbSua: undefined }
      const j = lichDong(dr, goc).findIndex(k => (k as { don?: boolean }).don)
      const pb: Record<number, string> = {}
      if (j > 0) for (let i = 0; i < j; i++) pb[i] = String(Math.round(can / (j + 1)))
      suaDong(kyDong, { _pbSua: j > 0 ? pb : undefined }, true)
    }
    return (
      <div className="m-pb-man">
        <header className="m-pb-thanh-dau">
          <button type="button" className="m-pb-btn-back" onClick={() => setKyDong(null)} aria-label="Quay lại">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <div className="m-tpb-tieu-de"><h1 className="m-pb-tieu-de">Lịch phân bổ</h1><div>{d.ten || dr.ten}</div></div>
          <span className="m-pb-thanh-dau-phai" />
        </header>
        <div className="m-pb-noi-dung">
          <div className="m-pb-the m-tpb-tom">
            <div><div className="n">Cần phân bổ</div><div className="s">{money(can)} đ</div></div>
            <div><div className="n">Tổng các kỳ</div><div className="s">{money(tong)} đ</div></div>
            <div><div className="n">Chênh lệch</div><div className={`s ${Math.round(lech) ? 'do' : 'xanh'}`}>{Math.round(lech) ? (lech > 0 ? '−' : '+') : ''}{money(Math.abs(Math.round(lech)))} đ</div></div>
          </div>
          <div className="m-pb-nhom m-tpb-nhom-nam">
            <span>{ds.length} kỳ{conKy < ds.length ? ` · ${conKy} kỳ còn phân bổ` : ''}</span>
            <button type="button" className="m-tpb-lk" onClick={chiaDeu} disabled={conKy < 2}>Chia đều lại</button>
          </div>
          {conKy < 2 && <p className="m-tpb-goi-y cam">Mục ngừng ngay từ kỳ đầu nên toàn bộ giá trị dồn vào kỳ đầu, không còn kỳ nào để chia.</p>}
          <div className="m-pb-the m-pb-the-gon">
            {ds.map((k, j) => {
              const don = Boolean((k as { don?: boolean }).don), [, nhan] = trangThaiKy(dr, thangCua(k.ngay), k.ngung, goi)
              return (
                <div key={k.ngay} className="m-pb-ky-dong">
                  <div><div className="m-pb-ky-ten">Tháng {tenThang(thangCua(k.ngay))}</div><div className={`m-pb-ky-ngay${k.ngung || don ? ' m-tpb-cam' : ''}`}>{don ? 'Phần còn lại do ngừng' : nhan}</div></div>
                  <ONhap id={`tpb-ky-${j}`} nhan={`Số tiền tháng ${tenThang(thangCua(k.ngay))}`} soTien v={k.nhap !== undefined ? tienO(k.nhap) : money(k.tien)} khoa={k.ngung || don} daSua={k.nhap !== undefined} dv="đ"
                    onDoi={s => suaDong(kyDong, { _pbSua: { ...d._pbSua, [j]: s } }, true)} />
                </div>
              )
            })}
          </div>
          <p className="m-tpb-goi-y">Ô viền cam là kỳ đã gõ lại. Chia đều lại chia giá trị cần phân bổ cho các kỳ trước tháng ngừng. Kỳ ngừng và kỳ nhận phần còn lại không sửa được. Tổng lệch thì khi lưu thẻ sẽ hỏi điều chỉnh.</p>
        </div>
        <div className="m-pb-day"><button type="button" className="m-pb-btn-luu" onClick={() => setKyDong(null)}>Xong</button></div>
      </div>
    )
  }

  const dS = sheet !== null ? dr.dong[sheet] : null
  return (
    <div className="m-pb-man">
      <header className="m-pb-thanh-dau">
        <button type="button" className="m-pb-btn-back" onClick={onHuy} aria-label="Quay lại">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="m-pb-tieu-de">Sửa thẻ {dr.soThe}</h1>
        <span className="m-pb-thanh-dau-phai" />
      </header>
      <div className="m-pb-noi-dung">
        <div className="m-pb-the m-pb-the-gon">
          <div className="m-pb-dong"><span className="n">Cửa hàng</span><span className="g">{dr.cn}</span></div>
          <div className="m-pb-dong"><span className="n">Loại thẻ</span><span className="m-tpb-khoa">{dr.loai}{dau ? ' · Đầu kỳ' : ''}</span></div>
          <label className="m-pb-dong" htmlFor="tpb-ten"><span className="n">Tên thẻ <b className="m-gt-sao">*</b></span><ONhap id="tpb-ten" nhan="Tên thẻ" v={dr.ten} onDoi={s => setDr(x => ({ ...x, ten: s }))} /></label>
          <div className="m-pb-dong m-gt-bam" role="button" tabIndex={0} onClick={() => setLich({ k: 'ngay' })}><span className="n">Ngày ghi tăng</span><span className="g">{dr.ngay} ›</span></div>
          <div className="m-pb-dong"><span className="n">Giá trị thẻ</span><span className="g">{money(gtThe(dr))} đ</span></div>
        </div>

        <div className="m-pb-nhom">Mục phân bổ ({dr.dong.length})</div>
        {dr.dong.map((d, i) => {
          const { can, kyCon } = tinhDong(dr, d), lech = Math.round(lechDong(dr, d))
          return (
            <div key={i} className="m-t449-hang-the">
              <div className="m-t449-hang-dau">
                <div className="m-t449-hang-ten">{i + 1}. {d.ten || dr.ten}{d.ma ? <span className="m-t449-hang-ma">-{d.ma}</span> : null}</div>
                <div className="m-t449-hang-actions"><button type="button" className="m-t449-btn-sua-hang" onClick={() => setSheet(i)}>Sửa</button></div>
              </div>
              <div className="m-t449-hang-than">
                <Dong n={dau ? 'Cần phân bổ:' : 'Số tiền:'} v={`${money(can)} đ`} dam />
                <Dong n="Phân bổ:" v={`${kyCon} tháng từ ${d.ngayPb ?? ''}`} />
                {d.ngung && <Dong n="Ngừng phân bổ từ:" v={String(d.ngayNgung ?? '')} cls="ngung" />}
              </div>
              <button type="button" className="m-tpb-mo-lich" onClick={() => setKyDong(i)}>
                <span>Lịch {kyCon} kỳ{d._pbSua && Object.keys(d._pbSua).length ? ' · đã sửa số tiền' : ''}</span><span>Sửa số tiền từng kỳ ›</span>
              </button>
              {lech !== 0 && <div className="m-tpb-canh">Tổng các kỳ đang lệch {money(Math.abs(lech))} đ so với giá trị cần phân bổ</div>}
            </div>
          )
        })}

        {dr.soCt && (
          <>
            <div className="m-pb-nhom">Thông tin mua</div>
            <div className="m-pb-the m-pb-the-gon">
              <div className="m-pb-dong"><span className="n">Số chứng từ</span><span className="g">{dr.soCt}</span></div>
              <div className="m-pb-dong"><span className="n">Ngày chứng từ</span><span className="g">{dr.ngayCt || dr.ngay}</span></div>
            </div>
          </>
        )}
      </div>
      <div className="m-pb-day">
        <button type="button" className="m-pb-btn-huy" onClick={onHuy}>Huỷ</button>
        <button type="button" className="m-pb-btn-luu" onClick={() => luu(dr)}>Lưu</button>
      </div>

      {/* Tấm sửa một mục: trường theo loại thẻ và thẻ đầu kỳ */}
      {dS && sheet !== null && (
        <div className="m-loc-overlay" onClick={() => setSheet(null)}>
          <div className="m-loc-tam" onClick={e => e.stopPropagation()} role="dialog" aria-label={`Sửa mục phân bổ ${sheet + 1}`}>
            <div className="m-loc-dau">
              <h2 className="m-loc-tieu-de">Mục phân bổ {sheet + 1}</h2>
              <button type="button" className="m-loc-btn-dong" onClick={() => setSheet(null)} aria-label="Đóng"><Icon n="x" className="ic sm" /></button>
            </div>
            <div className="m-loc-than m-tpb-sheet">
              <div className="m-pb-dong"><span className="n">{kieu === 'ccdc' ? 'Công cụ dụng cụ' : kieu === 'tscd' ? 'Tài sản cố định' : 'Mục chi phí'}</span><span className="g">{dS.ten || dr.ten}{dS.ma ? <span className="m-t449-hang-ma"> -{dS.ma}</span> : null}</span></div>
              {kieu === 'tscd' && (
                <>
                  <label className="m-pb-dong"><span className="n">Số hiệu</span><ONhap id="tpb-so-hieu" nhan="Số hiệu" v={dS.soHieu ?? ''} onDoi={s => suaDong(sheet, { soHieu: s }, true)} /></label>
                  <label className="m-tpb-cot"><span className="n">Mô tả chi tiết</span>
                    <textarea id="tpb-mo-ta" className="m-tpb-inp" rows={2} value={dS.moTa ?? ''} onChange={e => suaDong(sheet, { moTa: e.target.value }, true)} /></label>
                </>
              )}
              {kieu === 'ccdc' ? (
                <>
                  <label className="m-pb-dong"><span className="n">Số lượng</span><ONhap id="tpb-sl" nhan="Số lượng" soTien ngan v={String(so(dS.sl) || '')} dv={dS.dvt || 'Cái'} onDoi={s => suaDong(sheet, { sl: s })} /></label>
                  <label className="m-pb-dong"><span className="n">Đơn giá</span><ONhap id="tpb-dg" nhan="Đơn giá" soTien v={tienO(dS.dg)} dv="đ" onDoi={s => suaDong(sheet, { dg: s })} /></label>
                  <div className="m-pb-dong"><span className="n">Số tiền</span><span className="g">{money(so(dS.gt))} đ</span></div>
                </>
              ) : (
                <label className="m-pb-dong"><span className="n">Số tiền <b className="m-gt-sao">*</b></span><ONhap id="tpb-gt" nhan="Số tiền" soTien v={tienO(dS.gt)} dv="đ" onDoi={s => suaDong(sheet, { gt: s })} /></label>
              )}
              {dau && (
                <>
                  <label className="m-pb-dong"><span className="n">Giá trị đã phân bổ</span><ONhap id="tpb-da" nhan="Giá trị đã phân bổ" soTien v={tienO(dS.da)} dv="đ" onDoi={s => suaDong(sheet, { da: s })} /></label>
                  <div className="m-pb-dong"><span className="n">Giá trị cần phân bổ</span><span className="g">{money(tinhDong(dr, dS).can)} đ</span></div>
                </>
              )}
              <label className="m-pb-dong"><span className="n">Số tháng phân bổ <b className="m-gt-sao">*</b></span><ONhap id="tpb-ky" nhan="Số tháng phân bổ" soTien ngan v={String(so(dS.ky) || '')} dv="tháng" onDoi={s => suaDong(sheet, { ky: s })} /></label>
              {dau && (
                <>
                  <label className="m-pb-dong"><span className="n">Số tháng đã phân bổ</span><ONhap id="tpb-ky-da" nhan="Số tháng đã phân bổ" soTien ngan v={String(so(dS.kyDa) || '')} dv="tháng" onDoi={s => suaDong(sheet, { kyDa: s })} /></label>
                  <div className="m-pb-dong"><span className="n">Số tháng còn lại</span><span className="g">{tinhDong(dr, dS).kyCon} tháng</span></div>
                </>
              )}
              <div className="m-pb-dong m-gt-bam" role="button" tabIndex={0} onClick={() => setLich({ k: 'ngayPb', i: sheet })}><span className="n">Ngày bắt đầu phân bổ</span><span className="g">{dS.ngayPb} ›</span></div>
              <div className="m-pb-dong"><span className="n">Phân bổ mỗi tháng</span><span className="g">{money(tinhDong(dr, dS).tienKy)} đ</span></div>
              <label className="m-pb-dong"><span className="n">Ngừng phân bổ</span>
                <input id="tpb-ngung" type="checkbox" role="switch" className="m-tpb-gat" checked={Boolean(dS.ngung)}
                  onChange={e => suaDong(sheet, { ngung: e.target.checked, ngayNgung: e.target.checked ? ngayNgungMd(String(dS.ngayPb ?? ''), goi) : undefined })} /></label>
              {dS.ngung && <div className="m-pb-dong m-gt-bam" role="button" tabIndex={0} onClick={() => setLich({ k: 'ngayNgung', i: sheet })}><span className="n">Ngày ngừng phân bổ</span><span className="g m-tpb-do">{dS.ngayNgung} ›</span></div>}
            </div>
            <div className="m-loc-day"><button type="button" className="m-pb-btn-luu m-tpb-xong" onClick={() => setSheet(null)}>Xong</button></div>
          </div>
        </div>
      )}

      {lich && (
        <LichDon
          value={lich.k === 'ngay' ? dr.ngay : String(dr.dong[lich.i][lich.k] ?? '')}
          onChange={v => { if (lich.k === 'ngay') setDr(x => ({ ...x, ngay: v })); else suaDong(lich.i, { [lich.k]: v } as Partial<DongPb>) }}
          onDong={() => setLich(null)}
        />
      )}

      {hoi !== null && (
        <HopXacNhan tieuDe="Tổng phân bổ không khớp" nut="Điều chỉnh" nutHuy="Không" nutDo={false} onDong={() => setHoi(null)} onDongY={dieuChinh}>
          Tổng giá trị phân bổ các kỳ của <b>{dr.dong[hoi].ten || dr.ten}</b> đang không khớp. Bạn có muốn điều chỉnh về kỳ phân bổ cuối cùng không?
        </HopXacNhan>
      )}
    </div>
  )
}
