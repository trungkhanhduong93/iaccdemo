import { useCallback, useEffect, useMemo, useState, type FC } from 'react'
import type { Row, ScreenProps } from '../../modules/types'
import { kyMacDinh, useSession } from '../../app/session'
import { fold, money } from '../format'
import { tenMan } from '../../app/registry'
import { TRUONG_DM } from '../../modules/danh-muc/truong-dm'
import { MDanhSach } from './MDanhSach'
import { MFormDm } from './MFormDm'
import type { KieuMTrong } from './MTrong'

export const MDanhMuc: FC<ScreenProps> = ({ sc }) => {
  const { s, toast } = useSession()
  const cfg = sc.catalog ?? {
    cols: [
      { k: 'ma', t: 'Mã', cls: 'code' },
      { k: 'ten', t: 'Tên' },
    ],
    rows: () => [],
  }

  const [ky] = useState(() => kyMacDinh(s))
  const cols0 = useMemo(
    () => (typeof cfg.cols === 'function' ? cfg.cols(s.goi, s.cheDo) : cfg.cols),
    [cfg.cols, s.goi, s.cheDo],
  )

  // Ghi đè trạng thái bật/tắt theo dòng khi người dùng đổi trong form (T181, T183)
  const [ttGhiDe, setTtGhiDe] = useState<Record<string, number>>({})
  useEffect(() => {
    setTtGhiDe({})
  }, [sc, s.cheDo])

  const khoaDong = useCallback(
    (r: Row) =>
      String(
        r._k ??
          r.ma ??
          r.so ??
          r.username ??
          r.id ??
          (cols0[0]?.k ? r[cols0[0].k] : undefined) ??
          r.ten ??
          '',
      ),
    [cols0],
  )

  const allGoc = useMemo(
    () => cfg.rows(s.cheDo, ky).filter(r => !cfg.locGoi || cfg.locGoi(s.goi, r)),
    [cfg, s.cheDo, ky, s.goi],
  )
  const all = useMemo((): Row[] => {
    return allGoc.map((r, i) => {
      const k = String(
        r.ma ??
          r.so ??
          r.username ??
          r.id ??
          (cols0[0]?.k ? r[cols0[0].k] : undefined) ??
          r.ten ??
          `_r_${i}`,
      )
      const _k = r._k ?? k
      const tt = ttGhiDe[_k] !== undefined ? ttGhiDe[_k] : r._tt
      return { ...r, _k, _tt: tt }
    })
  }, [allGoc, ttGhiDe, cols0])

  const choThem = !cfg.khongThem?.includes(s.goi)

  const nhoms = useMemo(
    () =>
      cfg.nhomLoc
        ? [...new Set(all.map(r => String(r[cfg.nhomLoc!] ?? '')).filter(Boolean))].sort()
        : [],
    [all, cfg.nhomLoc],
  )
  const [nhomChon, setNhomChon] = useState('')

  const chips = useMemo(() => {
    if (nhoms.length === 0) return []
    return [
      { k: '', ten: 'Tất cả', dem: all.length },
      ...nhoms.map(n => ({
        k: n,
        ten: n,
        dem: all.filter(r => String(r[cfg.nhomLoc!] ?? '') === n).length,
      })),
    ]
  }, [nhoms, all, cfg.nhomLoc])

  const rows = useMemo(() => {
    return all.filter(r => {
      if (nhomChon && String(r[cfg.nhomLoc!] ?? '') !== nhomChon) return false
      return true
    })
  }, [all, nhomChon, cfg.nhomLoc])

  const cotSo = useMemo(() => cols0.find(c => c.num || c.k === 'gia'), [cols0])

  const kieuTrong: KieuMTrong =
    sc.slug === '1-2' ? 'hang' : sc.slug === '1-8' ? 'kho' : sc.slug === '1-5' ? 'ncc' : 'chung'

  const cauHinh = useMemo(
    () => cfg.truong ?? TRUONG_DM[sc.code ?? ''] ?? TRUONG_DM[sc.slug ?? ''],
    [cfg.truong, sc.code, sc.slug],
  )

  const [edit, setEdit] = useState<Row | null>(null)
  const [dienSan, setDienSan] = useState<Row | undefined>(undefined)

  const ten = tenMan(sc)

  const handleLuu = useCallback(
    (val: Record<string, any>, themTiep: boolean) => {
      if (val && val._tt !== undefined) {
        const k = khoaDong(val)
        if (k) setTtGhiDe(prev => ({ ...prev, [k]: Number(val._tt) }))
      }
      toast('Đã lưu')
      if (!themTiep) setEdit(null)
    },
    [khoaDong, toast],
  )

  return (
    <>
      <MDanhSach
        rows={rows}
        timTheo={(r, q) => {
          const text = Object.values(r)
            .map(v => (v && typeof v === 'object' ? '' : String(v ?? '')))
            .join(' ')
          return fold(text).includes(fold(q))
        }}
        timPlaceholder="Tìm theo mã, tên..."
        chips={chips}
        chipChon={nhomChon}
        onChipChon={setNhomChon}
        onThem={choThem ? () => { setEdit({}); setDienSan(undefined) } : undefined}
        nhanThem={cfg.them ?? '+ Thêm mới'}
        kieuTrong={kieuTrong}
        tomTat={
          <span>
            Tổng <b>{rows.length}</b> bản ghi
          </span>
        }
        the={(r, i) => {
          const giaTriSo =
            cotSo && r[cotSo.k] !== undefined && r[cotSo.k] !== '' ? r[cotSo.k] : undefined
          return (
            <div
              key={`${String(r.id ?? r.ma ?? r.ten ?? '')}_${i}`}
              className="m-the-dm"
              onClick={() => { setEdit(r); setDienSan(undefined) }}
              role="button"
              tabIndex={0}
            >
              <div className="m-the-dm-trai">
                <span className="m-the-dm-ten">{r.ten || r.ma}</span>
                {r.ma && <span className="m-the-dm-ma">Mã: {r.ma}</span>}
              </div>
              <div className="m-the-dm-phai">
                {giaTriSo !== undefined && (
                  <span className="m-the-dm-so">
                    {typeof giaTriSo === 'number'
                      ? `${money(giaTriSo)} đ`
                      : String(giaTriSo)}
                  </span>
                )}
                {!cfg.dsChungTu && (
                  <span className={`m-ct-chip ${r._tt === 0 ? 'dim' : 'ok'}`}>
                    {r._tt === 0 ? 'Ngừng dùng' : 'Đang dùng'}
                  </span>
                )}
              </div>
            </div>
          )
        }}
      />
      {edit && (
        <MFormDm
          sc={sc}
          cauHinh={cauHinh}
          edit={edit}
          dienSan={dienSan}
          nhomLoc={cfg.nhomLoc}
          all={all}
          cols0={cols0}
          nhoms={nhoms}
          ten={ten}
          tenNgan={sc.ngan ?? ten}
          onDong={() => setEdit(null)}
          onLuu={handleLuu}
        />
      )}
    </>
  )
}

