// Component chọn hai cột (Chưa chọn | Đã chọn) dùng chung (T380, T381)
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Popover } from './Dropdown'
import { Icon } from './Icon'
import { fold } from './format'
import { useLaMobile } from './mobile/useLaMobile'

export interface MucHaiCot {
  v: string
  t?: string
  ma?: string
}

export interface ChonHaiCotProps {
  ds: (string | MucHaiCot)[]
  value: string[]
  onChange: (value: string[]) => void
  nhan?: string
  goiY?: string
  maDs?: (v: string) => string
  onLamMoi?: () => void
  className?: string
  btnClass?: string
  disabled?: boolean
  /** Ô lọc danh sách: giá trị hiện thành chip tên đầu + chip +N, có nút X xoá nhanh (T510) */
  chip?: boolean
}

export function ChonHaiCot({
  ds,
  value,
  onChange,
  nhan = 'danh sách',
  goiY = 'Chọn...',
  maDs,
  onLamMoi,
  className = '',
  btnClass = '',
  disabled = false,
  chip = false,
}: ChonHaiCotProps) {
  const laMobile = useLaMobile()
  const [mo, setMo] = useState(false)
  const [timTrai, setTimTrai] = useState('')
  const [timPhai, setTimPhai] = useState('')
  const [timMobi, setTimMobi] = useState('')
  const nutRef = useRef<HTMLDivElement>(null)
  const cbAllMobiRef = useRef<HTMLInputElement>(null)

  // Chuẩn hoá danh sách mục
  const danhSach = useMemo((): { v: string; t: string; ma?: string }[] => {
    return ds.map(item => {
      if (typeof item === 'string') {
        const ma = maDs ? maDs(item) : undefined
        return { v: item, t: item, ma: ma || undefined }
      }
      const ma = item.ma || (maDs ? maDs(item.v) : undefined)
      return { v: item.v, t: item.t ?? item.v, ma: ma || undefined }
    })
  }, [ds, maDs])

  const giaTriHopLe = useMemo(() => {
    const tapHop = new Set(danhSach.map(x => x.v))
    return value.filter(v => tapHop.has(v))
  }, [value, danhSach])

  const chuaChon = useMemo(() => {
    const tapDaChon = new Set(giaTriHopLe)
    return danhSach.filter(x => !tapDaChon.has(x.v))
  }, [danhSach, giaTriHopLe])

  const daChon = useMemo(() => {
    const banDo = new Map(danhSach.map(x => [x.v, x]))
    return giaTriHopLe.map(v => banDo.get(v)!).filter(Boolean)
  }, [danhSach, giaTriHopLe])

  // Lọc tìm kiếm không dấu theo tên hoặc mã trên web
  const chuaChonLoc = useMemo(() => {
    const tu = fold(timTrai.trim())
    if (!tu) return chuaChon
    return chuaChon.filter(x => fold(x.t).includes(tu) || (x.ma && fold(x.ma).includes(tu)))
  }, [chuaChon, timTrai])

  const daChonLoc = useMemo(() => {
    const tu = fold(timPhai.trim())
    if (!tu) return daChon
    return daChon.filter(x => fold(x.t).includes(tu) || (x.ma && fold(x.ma).includes(tu)))
  }, [daChon, timPhai])

  // Lọc tìm kiếm trên điện thoại (danh sách một cột)
  const dsMobiLoc = useMemo(() => {
    const tu = fold(timMobi.trim())
    if (!tu) return danhSach
    return danhSach.filter(x => fold(x.t).includes(tu) || (x.ma && fold(x.ma).includes(tu)))
  }, [danhSach, timMobi])

  const cacMucMobiHienTai = useMemo(() => dsMobiLoc.map(x => x.v), [dsMobiLoc])
  const soDaChonMobi = useMemo(() => {
    return cacMucMobiHienTai.filter(v => giaTriHopLe.includes(v)).length
  }, [cacMucMobiHienTai, giaTriHopLe])

  const isAllMobi = cacMucMobiHienTai.length > 0 && soDaChonMobi === cacMucMobiHienTai.length
  const isHalfMobi = soDaChonMobi > 0 && soDaChonMobi < cacMucMobiHienTai.length

  useEffect(() => {
    if (cbAllMobiRef.current) {
      cbAllMobiRef.current.indeterminate = isHalfMobi
    }
  }, [isHalfMobi, isAllMobi])

  useEffect(() => {
    if (mo) {
      setTimTrai('')
      setTimPhai('')
      setTimMobi('')
    }
  }, [mo])

  const them = useCallback((v: string) => {
    if (!giaTriHopLe.includes(v)) {
      onChange([...giaTriHopLe, v])
    }
  }, [giaTriHopLe, onChange])

  const bo = useCallback((v: string) => {
    onChange(giaTriHopLe.filter(x => x !== v))
  }, [giaTriHopLe, onChange])

  const chonTatCaTrai = useCallback(() => {
    const cacMuc = chuaChonLoc.map(x => x.v)
    const moi = Array.from(new Set([...giaTriHopLe, ...cacMuc]))
    onChange(moi)
  }, [chuaChonLoc, giaTriHopLe, onChange])

  const lamMoi = useCallback(() => {
    setTimTrai('')
    setTimPhai('')
    onLamMoi?.()
  }, [onLamMoi])

  // Bật/tắt tất cả trên điện thoại (chỉ áp dụng cho các mục đang hiển thị theo từ khoá tìm kiếm)
  const toggleTatCaMobi = useCallback(() => {
    if (isAllMobi) {
      const boSet = new Set(cacMucMobiHienTai)
      onChange(giaTriHopLe.filter(v => !boSet.has(v)))
    } else {
      const moi = Array.from(new Set([...giaTriHopLe, ...cacMucMobiHienTai]))
      onChange(moi)
    }
  }, [isAllMobi, cacMucMobiHienTai, giaTriHopLe, onChange])

  // Bật/tắt 1 mục trên điện thoại
  const toggleMobi = useCallback((v: string) => {
    if (giaTriHopLe.includes(v)) {
      onChange(giaTriHopLe.filter(x => x !== v))
    } else {
      onChange([...giaTriHopLe, v])
    }
  }, [giaTriHopLe, onChange])

  // Chuỗi hiển thị rút gọn bên ngoài ô (áp dụng chung cả Web lẫn Mobile):
  // Chọn 1 hiện mã đó (hoặc tên nếu không có mã); chọn nhiều hiện mã đầu + ' +N <đơn vị>'; chưa chọn hiện gợi ý
  const chuHienThi = useMemo(() => {
    if (giaTriHopLe.length === 0) return null
    const dau = daChon[0]
    if (!dau) return null
    const maDau = dau.ma || dau.t
    if (giaTriHopLe.length === 1) return maDau
    const n = giaTriHopLe.length - 1
    const lowerNhan = nhan.toLowerCase()
    let donVi = ''
    if (lowerNhan.includes('nhà cung cấp') || lowerNhan.includes('ncc')) {
      donVi = ' NCC'
    } else if (lowerNhan.includes('kênh')) {
      donVi = ' kênh'
    } else if (lowerNhan.includes('kho')) {
      donVi = ' kho'
    } else if (lowerNhan.includes('hàng')) {
      donVi = ' hàng hoá'
    } else if (lowerNhan.includes('cửa hàng')) {
      donVi = ' CH'
    }
    return `${maDau} +${n}${donVi}`
  }, [giaTriHopLe, daChon, nhan])

  // Cột bên trái trên web: Chưa chọn
  const cotTrai = (
    <div className="chc-cot chc-cot-trai">
      <div className="chc-cot-dau">
        <span className="chc-cot-tieu-de">Chưa chọn</span>
        <button
          type="button"
          className="icon-btn sm chc-lam-moi"
          title="Làm mới danh sách"
          aria-label="Làm mới danh sách"
          onClick={lamMoi}
        >
          <Icon n="refresh" className="ic sm" />
        </button>
      </div>
      <div className="chc-tim-khung">
        <Icon n="search" className="ic sm chc-tim-ic" />
        <input
          type="text"
          className="chc-tim-inp"
          placeholder={chip ? 'Tìm mã, tên, MST' : 'Tìm kiếm...'}
          value={timTrai}
          onChange={e => setTimTrai(e.target.value)}
        />
      </div>
      <div
        className="chc-chon-tat-ca"
        role="button"
        tabIndex={0}
        onClick={chonTatCaTrai}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chonTatCaTrai() } }}
      >
        <input
          type="checkbox"
          className="chc-cb"
          checked={chuaChonLoc.length > 0 && chuaChonLoc.every(x => giaTriHopLe.includes(x.v))}
          readOnly
          tabIndex={-1}
        />
        <span>Chọn tất cả{chip ? ` ${chuaChonLoc.length}` : ''}</span>
      </div>
      <div className="chc-ds">
        {chuaChonLoc.map(x => (
          <div
            key={x.v}
            className="chc-dong"
            role="button"
            tabIndex={0}
            onClick={() => them(x.v)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); them(x.v) } }}
          >
            <input
              type="checkbox"
              className="chc-cb"
              checked={false}
              readOnly
              tabIndex={-1}
            />
            <div className="chc-dong-nd">
              <div className="chc-dong-ten">{x.t}</div>
              {x.ma && <div className="chc-dong-ma">Mã: {x.ma}</div>}
            </div>
          </div>
        ))}
        {chuaChonLoc.length === 0 && (
          <div className="chc-trong">Không có dữ liệu</div>
        )}
      </div>
    </div>
  )

  // Cột bên phải trên web: Đã chọn
  const cotPhai = (
    <div className="chc-cot chc-cot-phai">
      <div className="chc-cot-dau">
        <span className="chc-cot-tieu-de">{chip ? `Đã chọn (${giaTriHopLe.length})` : 'Đã chọn'}</span>
        {chip && (
          <button
            type="button"
            className="chc-bo-tat-ca"
            onClick={() => onChange([])}
          >
            Bỏ chọn tất cả
          </button>
        )}
      </div>
      <div className="chc-tim-khung">
        <Icon n="search" className="ic sm chc-tim-ic" />
        <input
          type="text"
          className="chc-tim-inp"
          placeholder={chip ? 'Tìm trong đã chọn' : 'Tìm kiếm...'}
          value={timPhai}
          onChange={e => setTimPhai(e.target.value)}
        />
      </div>
      <div className="chc-ds">
        {daChonLoc.map(x => (
          <div
            key={x.v}
            className="chc-dong"
            role="button"
            tabIndex={0}
            onClick={() => bo(x.v)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bo(x.v) } }}
          >
            <input
              type="checkbox"
              className="chc-cb"
              checked={true}
              readOnly
              tabIndex={-1}
            />
            <div className="chc-dong-nd">
              <div className="chc-dong-ten">{x.t}</div>
              {x.ma && <div className="chc-dong-ma">Mã: {x.ma}</div>}
            </div>
          </div>
        ))}
        {daChonLoc.length === 0 && (
          <div className="chc-trong">Không có dữ liệu</div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <div
        ref={nutRef}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={mo}
        aria-haspopup="dialog"
        aria-label={nhan}
        className={`inp chc-o ${btnClass} ${className}${chip ? ' chc-chip-mode' : ''}${mo ? ' open' : ''}${disabled ? ' disabled' : ''}`}
        onClick={() => { if (!disabled) setMo(o => !o) }}
        onKeyDown={e => {
          if (!disabled && (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === ' ')) {
            e.preventDefault()
            setMo(true)
          }
        }}
      >
        {chip ? (
          <>
            <span
              className="chc-gia-tri-wrap"
              title={
                daChon.length === 1
                  ? (daChon[0].ma ? `${daChon[0].t} · Mã: ${daChon[0].ma}` : daChon[0].t)
                  : daChon.length > 1
                  ? daChon.map(x => x.t).join(', ')
                  : undefined
              }
            >
              {daChon.length === 0 ? (
                <span className="chc-goi-y">{goiY || 'Tất cả'}</span>
              ) : daChon.length === 1 ? (
                <span className="chc-mot-ten">
                  {daChon[0].t}
                </span>
              ) : (
                <>
                  <span className="chc-chip chc-chip-ten" title={daChon[0].t}>
                    {daChon[0].t}
                  </span>
                  <span className="chc-chip chc-chip-so">+{daChon.length - 1}</span>
                </>
              )}
            </span>
            {daChon.length > 0 && !disabled && (
              <button
                type="button"
                className="chc-xoa"
                title={`Bỏ lọc ${nhan}`}
                aria-label={`Bỏ lọc ${nhan}`}
                onClick={e => {
                  e.stopPropagation()
                  onChange([])
                }}
              >
                <Icon n="x" className="ic xs" />
              </button>
            )}
            {daChon.length === 0 && <Icon n="chevd" className="ic sm chc-mui-ten" />}
          </>
        ) : (
          <>
            <span className="chc-gia-tri-wrap" title={daChon.map(x => x.t).join(', ')}>
              {chuHienThi ? (
                <span className="chc-gia-tri">{chuHienThi}</span>
              ) : (
                <span className="chc-goi-y">{goiY}</span>
              )}
            </span>
            <Icon n="chevd" className="ic sm chc-mui-ten" />
          </>
        )}
      </div>

      {/* Web: hộp hai cột Popover */}
      {mo && !laMobile && (
        <Popover
          anchor={nutRef}
          open={mo}
          onClose={() => setMo(false)}
          width={chip ? 600 : 580}
          role="dialog"
          className={chip ? 'pop-chc chc-pop-loc' : 'pop-chc'}
        >
          <div className="chc-than-hai-cot">
            {cotTrai}
            {cotPhai}
          </div>
        </Popover>
      )}

      {/* Điện thoại: sheet một cột có tìm kiếm, 'Chọn tất cả' dòng đầu, danh sách checkbox và nút Xong sát đáy */}
      {mo && laMobile && createPortal(
        <div className="chc-sheet-nen" onClick={() => setMo(false)}>
          <div
            className="chc-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={nhan}
            onClick={e => e.stopPropagation()}
          >
            <div className="chc-sheet-dau">
              <span>{nhan}</span>
              <button
                type="button"
                className="icon-btn sm"
                title="Đóng"
                aria-label="Đóng"
                onClick={() => setMo(false)}
              >
                <Icon n="x" className="ic sm" />
              </button>
            </div>

            {/* Ô tìm kiếm trên cùng */}
            <div className="chc-m-tim-wrap">
              <Icon n="search" className="ic sm chc-tim-ic" />
              <input
                type="text"
                className="chc-m-tim-inp"
                placeholder={nhan.toLowerCase().includes('nhà cung cấp') || nhan.toLowerCase().includes('ncc') ? 'Tìm nhà cung cấp...' : `Tìm ${nhan.toLowerCase()}...`}
                value={timMobi}
                onChange={e => setTimMobi(e.target.value)}
              />
              {timMobi && (
                <button
                  type="button"
                  className="chc-tim-x"
                  onClick={() => setTimMobi('')}
                  aria-label="Xoá tìm kiếm"
                >
                  <Icon n="x" className="ic sm" />
                </button>
              )}
            </div>

            {/* Dòng ĐẦU danh sách là 'Chọn tất cả' có ô vuông */}
            <div
              className={`chc-m-dong chc-m-chon-tat-ca${isAllMobi ? ' on' : ''}`}
              role="button"
              tabIndex={0}
              onClick={toggleTatCaMobi}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTatCaMobi() } }}
            >
              <input
                ref={cbAllMobiRef}
                type="checkbox"
                className="chc-cb chc-m-cb"
                checked={isAllMobi}
                onChange={toggleTatCaMobi}
                onClick={e => e.stopPropagation()}
                aria-label="Chọn tất cả"
              />
              <span className="chc-m-dong-ten chc-m-tat-ca-ten">Chọn tất cả</span>
            </div>

            {/* Danh sách từng mục */}
            <div className="chc-m-ds">
              {dsMobiLoc.map(x => {
                const isChon = giaTriHopLe.includes(x.v)
                return (
                  <div
                    key={x.v}
                    className={`chc-m-dong${isChon ? ' on' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleMobi(x.v)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMobi(x.v) } }}
                  >
                    <input
                      type="checkbox"
                      className="chc-cb chc-m-cb"
                      checked={isChon}
                      onChange={() => toggleMobi(x.v)}
                      onClick={e => e.stopPropagation()}
                      tabIndex={-1}
                      aria-label={x.t}
                    />
                    <div className="chc-m-dong-nd">
                      <div className="chc-m-dong-ten">{x.t}</div>
                      {x.ma && <div className="chc-m-dong-ma">Mã: {x.ma}</div>}
                    </div>
                  </div>
                )
              })}
              {dsMobiLoc.length === 0 && (
                <div className="chc-trong">Không có dữ liệu phù hợp</div>
              )}
            </div>

            {/* Nút Xong sát đáy */}
            <div className="chc-sheet-day">
              <button
                type="button"
                className="btn pri lg chc-nut-xong"
                onClick={() => setMo(false)}
              >
                Xong
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
