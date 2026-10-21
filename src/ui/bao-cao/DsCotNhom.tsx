// Danh sách cột tuỳ chỉnh báo cáo theo mẫu A (T587): tìm kiếm, gom thẻ theo nhóm, đổi tên, kéo thả đổi thứ tự
import { useMemo, useRef, useState } from 'react'
import type { Col } from '../../modules/types'
import { Icon } from '../Icon'
import { LEN, Net, TayNam, XUONG, type MucDs } from '../thiet-ke/DsCot'
import { doiCho, useKeoDong } from '../thiet-ke/keo'

function DongCot({
  item,
  tenGoc,
  i,
  tong,
  keo,
  onDoiAn,
  onDoiTen,
  onLen,
  onXuong,
}: {
  item: MucDs
  tenGoc?: string
  i: number
  tong: number
  keo: ReturnType<typeof useKeoDong>
  onDoiAn: (k: string) => void
  onDoiTen: (k: string, tenMoi: string) => void
  onLen: (i: number) => void
  onXuong: (i: number) => void
}) {
  const [dangSua, setDangSua] = useState(false)
  const [tenTam, setTenTam] = useState(item.ten)
  const inputRef = useRef<HTMLInputElement>(null)

  const batDauSua = () => {
    setTenTam(item.ten)
    setDangSua(true)
  }

  const xongSua = () => {
    setDangSua(false)
    const t = tenTam.trim()
    if (t && t !== item.ten) {
      onDoiTen(item.k, t)
    }
  }

  const daDoi = !!tenGoc && item.ten !== tenGoc
  const hien = !item.an

  return (
    <div
      {...keo.dong(i)}
      className={`tc-dong${!hien ? ' tat' : ''}${keo.keo === i ? ' dang-keo' : ''}${keo.dich === i ? ' dich' : ''}`}
    >
      <span className="tc-keo" aria-hidden="true" {...keo.tay(i)}>
        <TayNam />
      </span>
      <button
        type="button"
        className={`tc-cb${hien ? ' on' : ''}`}
        onClick={() => onDoiAn(item.k)}
        aria-label={`Hiện cột ${item.ten}`}
        aria-pressed={hien}
      >
        {hien && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12l5 5 9-10" />
          </svg>
        )}
      </button>

      {dangSua ? (
        <input
          ref={inputRef}
          className="tc-o-ten"
          autoFocus
          value={tenTam}
          onChange={e => setTenTam(e.target.value)}
          onBlur={xongSua}
          onKeyDown={e => {
            if (e.key === 'Enter') xongSua()
            else if (e.key === 'Escape') setDangSua(false)
          }}
          aria-label="Tên cột"
        />
      ) : (
        <>
          <span className="tc-ten">{item.ten}</span>
          {daDoi && <span className="tc-goc">gốc: {tenGoc}</span>}
          <span className="tc-dong-nut">
            <button
              type="button"
              className="tc-sua"
              onClick={batDauSua}
              aria-label={`Đổi tên cột ${item.ten}`}
              title="Đổi tên"
            >
              <Icon n="edit" className="ic sm" kieu="net" />
            </button>
            <button
              type="button"
              className="tc-sua"
              disabled={i === 0}
              onClick={() => onLen(i)}
              aria-label={`Đưa cột ${item.ten} lên`}
              title="Lên"
            >
              <Net d={LEN} />
            </button>
            <button
              type="button"
              className="tc-sua"
              disabled={i === tong - 1}
              onClick={() => onXuong(i)}
              aria-label={`Đưa cột ${item.ten} xuống`}
              title="Xuống"
            >
              <Net d={XUONG} />
            </button>
          </span>
        </>
      )}
    </div>
  )
}

function TheNhom({
  tenNhom,
  items,
  colsMap,
  tim,
  keoNhom,
  nhomIdx,
  onDoiItemsTrongNhom,
  onDoiAn,
  onDoiTen,
  onToggleNhom,
}: {
  tenNhom: string
  items: MucDs[]
  colsMap: Map<string, Col>
  tim: string
  keoNhom: ReturnType<typeof useKeoDong>
  nhomIdx: number
  onDoiItemsTrongNhom: (tu: number, den: number) => void
  onDoiAn: (k: string) => void
  onDoiTen: (k: string, tenMoi: string) => void
  onToggleNhom: (tenNhom: string, tatCaHien: boolean) => void
}) {
  const [mo, setMo] = useState(true)
  const keoDong = useKeoDong(onDoiItemsTrongNhom)

  const timNorm = tim.trim().toLowerCase()
  const rowsHienThi = useMemo(() => {
    if (!timNorm) return items
    return items.filter(x => {
      const tg = colsMap.get(x.k)?.t ?? ''
      return (
        x.ten.toLowerCase().includes(timNorm) ||
        tg.toLowerCase().includes(timNorm) ||
        tenNhom.toLowerCase().includes(timNorm)
      )
    })
  }, [items, timNorm, colsMap, tenNhom])

  const tongSo = items.length
  const soHien = items.filter(x => !x.an).length
  const du = soHien === tongSo
  const mot = soHien > 0 && soHien < tongSo
  const dangMo = mo || Boolean(timNorm)

  if (timNorm && rowsHienThi.length === 0) return null

  return (
    <div
      {...keoNhom.dong(nhomIdx)}
      className={`tc-nhom${keoNhom.keo === nhomIdx ? ' dang-keo' : ''}${keoNhom.dich === nhomIdx ? ' dich' : ''}`}
    >
      <div className="tc-nhom-dau">
        <span className="tc-keo" aria-hidden="true" {...keoNhom.tay(nhomIdx)}>
          <TayNam />
        </span>
        <button
          type="button"
          className={`tc-cb${soHien > 0 ? ' on' : ''}`}
          onClick={() => onToggleNhom(tenNhom, du)}
          aria-label={`Hiện cả nhóm ${tenNhom}`}
        >
          {du && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5 9-10" />
            </svg>
          )}
          {mot && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 12h12" />
            </svg>
          )}
        </button>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{tenNhom}</span>
        <span className="tc-dem">{soHien}/{tongSo}</span>
        <button
          type="button"
          className={`tc-chev${dangMo ? ' mo' : ''}`}
          onClick={() => setMo(!mo)}
          aria-label={`Mở, thu nhóm ${tenNhom}`}
          aria-expanded={dangMo}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {dangMo && (
        <div className="tc-nhom-than">
          {rowsHienThi.map((x, idx) => {
            const gocIdx = items.indexOf(x)
            return (
              <DongCot
                key={x.k}
                item={x}
                tenGoc={colsMap.get(x.k)?.t}
                i={gocIdx >= 0 ? gocIdx : idx}
                tong={tongSo}
                keo={keoDong}
                onDoiAn={onDoiAn}
                onDoiTen={onDoiTen}
                onLen={i => onDoiItemsTrongNhom(i, i - 1)}
                onXuong={i => onDoiItemsTrongNhom(i, i + 1)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export function DsCotNhom({
  items,
  colsGoc = [],
  onChange,
}: {
  items: MucDs[]
  colsGoc: Col[]
  onChange: (items: MucDs[]) => void
}) {
  const [tim, setTim] = useState('')
  const colsMap = useMemo(() => new Map(colsGoc.map(c => [c.k, c])), [colsGoc])

  const hasNhom = useMemo(() => items.some(x => Boolean(colsMap.get(x.k)?.nhom)), [items, colsMap])

  const thongTinKeys = useMemo(
    () => items.filter(x => !colsMap.get(x.k)?.nhom).map(x => x.k),
    [items, colsMap],
  )

  const nhomNames = useMemo(() => {
    const res: string[] = []
    for (const x of items) {
      const nh = colsMap.get(x.k)?.nhom
      if (nh && !res.includes(nh)) res.push(nh)
    }
    return res
  }, [items, colsMap])

  const keoPhang = useKeoDong((tu, den) => onChange(doiCho(items, tu, den)))

  const keoThongTin = useKeoDong((tu, den) => {
    const ttItems = items.filter(x => !colsMap.get(x.k)?.nhom)
    const nhomItems = items.filter(x => colsMap.get(x.k)?.nhom)
    const reordered = doiCho(ttItems, tu, den)
    onChange([...reordered, ...nhomItems])
  })

  const keoNhom = useKeoDong((tu, den) => {
    const reorderedNhomNames = doiCho(nhomNames, tu, den)
    const ttItems = items.filter(x => !colsMap.get(x.k)?.nhom)
    const groupedItems = reorderedNhomNames.flatMap(nh =>
      items.filter(x => colsMap.get(x.k)?.nhom === nh),
    )
    onChange([...ttItems, ...groupedItems])
  })

  const onDoiItemsTrongNhom = (tenNhom: string, tu: number, den: number) => {
    const groupItems = items.filter(x => colsMap.get(x.k)?.nhom === tenNhom)
    const reordered = doiCho(groupItems, tu, den)
    const moi = [...items]
    const indices: number[] = []
    for (let i = 0; i < moi.length; i++) {
      if (colsMap.get(moi[i].k)?.nhom === tenNhom) {
        indices.push(i)
      }
    }
    indices.forEach((pos, idx) => {
      moi[pos] = reordered[idx]
    })
    onChange(moi)
  }

  const onDoiAn = (k: string) => {
    onChange(items.map(x => (x.k === k ? { ...x, an: !x.an } : x)))
  }

  const onDoiTen = (k: string, tenMoi: string) => {
    onChange(items.map(x => (x.k === k ? { ...x, ten: tenMoi } : x)))
  }

  const onToggleNhom = (tenNhom: string, tatCaHien: boolean) => {
    onChange(
      items.map(x => {
        if (colsMap.get(x.k)?.nhom === tenNhom) {
          return { ...x, an: tatCaHien }
        }
        return x
      }),
    )
  }

  const hienTatCa = () => {
    onChange(items.map(x => ({ ...x, an: false })))
  }

  const tongSo = items.length
  const soHien = items.filter(x => !x.an).length
  const duHet = soHien === tongSo

  const timNorm = tim.trim().toLowerCase()

  return (
    <div className="tc-cot-khung">
      <div className="tc-cot-dau">
        <label className="tc-tim-khung">
          <Icon n="search" className="ic sm" kieu="net" />
          <input
            value={tim}
            onChange={e => setTim(e.target.value)}
            placeholder="Tìm cột"
            aria-label="Tìm cột"
            className="tc-tim-inp"
          />
        </label>
        <span className="tc-cot-dem">
          <b>{soHien}</b> / {tongSo} cột đang hiện
        </span>
        <button
          type="button"
          className="tc-link"
          onClick={hienTatCa}
          disabled={duHet}
        >
          Hiện tất cả
        </button>
      </div>

      {!hasNhom ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items
            .filter(x => {
              if (!timNorm) return true
              const tg = colsMap.get(x.k)?.t ?? ''
              return x.ten.toLowerCase().includes(timNorm) || tg.toLowerCase().includes(timNorm)
            })
            .map((x, idx) => {
              const gocIdx = items.indexOf(x)
              return (
                <DongCot
                  key={x.k}
                  item={x}
                  tenGoc={colsMap.get(x.k)?.t}
                  i={gocIdx >= 0 ? gocIdx : idx}
                  tong={tongSo}
                  keo={keoPhang}
                  onDoiAn={onDoiAn}
                  onDoiTen={onDoiTen}
                  onLen={i => onChange(doiCho(items, i, i - 1))}
                  onXuong={i => onChange(doiCho(items, i, i + 1))}
                />
              )
            })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {thongTinKeys.length > 0 && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div className="tc-muc-tieu-de">CỘT THÔNG TIN</div>
              {items
                .filter(x => !colsMap.get(x.k)?.nhom)
                .filter(x => {
                  if (!timNorm) return true
                  const tg = colsMap.get(x.k)?.t ?? ''
                  return x.ten.toLowerCase().includes(timNorm) || tg.toLowerCase().includes(timNorm)
                })
                .map((x, idx) => {
                  const ttItems = items.filter(it => !colsMap.get(it.k)?.nhom)
                  const ttIdx = ttItems.indexOf(x)
                  return (
                    <DongCot
                      key={x.k}
                      item={x}
                      tenGoc={colsMap.get(x.k)?.t}
                      i={ttIdx >= 0 ? ttIdx : idx}
                      tong={ttItems.length}
                      keo={keoThongTin}
                      onDoiAn={onDoiAn}
                      onDoiTen={onDoiTen}
                      onLen={i => {
                        const tt = items.filter(it => !colsMap.get(it.k)?.nhom)
                        const nh = items.filter(it => colsMap.get(it.k)?.nhom)
                        onChange([...doiCho(tt, i, i - 1), ...nh])
                      }}
                      onXuong={i => {
                        const tt = items.filter(it => !colsMap.get(it.k)?.nhom)
                        const nh = items.filter(it => colsMap.get(it.k)?.nhom)
                        onChange([...doiCho(tt, i, i + 1), ...nh])
                      }}
                    />
                  )
                })}
            </section>
          )}

          {nhomNames.length > 0 && (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="tc-muc-tieu-de">CỘT SỐ LIỆU</div>
              {nhomNames.map((nh, nhIdx) => (
                <TheNhom
                  key={nh}
                  tenNhom={nh}
                  items={items.filter(x => colsMap.get(x.k)?.nhom === nh)}
                  colsMap={colsMap}
                  tim={tim}
                  keoNhom={keoNhom}
                  nhomIdx={nhIdx}
                  onDoiItemsTrongNhom={(tu, den) => onDoiItemsTrongNhom(nh, tu, den)}
                  onDoiAn={onDoiAn}
                  onDoiTen={onDoiTen}
                  onToggleNhom={onToggleNhom}
                />
              ))}
            </section>
          )}

          <div className="tc-chu-thich">
            Kéo thẻ nhóm để đổi thứ tự cả nhóm. Kéo dòng để đổi thứ tự trong nhóm.
          </div>
        </div>
      )}
    </div>
  )
}
