import { useMemo, type FC } from 'react'
import { Link } from 'react-router-dom'
import type { NutQT, QuyTrinhDef, ScreenProps } from '../../modules/types'
import { dich, hienMan, maKhoa, moDuoc } from '../../app/registry'
import { useSession } from '../../app/session'
import { anNgoaiGoi, type Goi } from '../../app/plan'
import { Icon } from '../Icon'

function moNut(n: NutQT, goi: Goi) {
  if (!n.di) return { path: '', sc: undefined, ok: true, ma: undefined }
  const d = dich(n.di)
  const ok = !d.sc || moDuoc(d.sc, goi)
  return { ...d, ok, ma: d.sc ? maKhoa(d.sc) : undefined }
}

interface BuocMobile {
  id: string
  so: number
  ten: string
  moTa?: string
  icon: string
  di: string
  path: string
  ok: boolean
}

export const MQuyTrinh: FC<ScreenProps> = ({ mod }) => {
  const { s } = useSession()
  const an = anNgoaiGoi(s.goi)

  const hien = (n: NutQT) => {
    const m = moNut(n, s.goi)
    if (m.sc && !hienMan(m.sc, s.goi, s.cheDo, s)) return false
    return !an || m.ok
  }

  const goc0 = mod.quyTrinh
  const goc: QuyTrinhDef | undefined =
    goc0 && s.goi === 'F' && goc0.hoiTuFree
      ? { ...goc0, buoc: [], hoiTu: goc0.hoiTuFree }
      : goc0

  const luong =
    goc && s.goi === 'F' && goc.luongFree
      ? goc.luongFree
          .map(c => ({ ...c, nut: c.nut.filter(hien) }))
          .filter(c => c.nut.length > 0)
      : null

  const dsBuoc = useMemo((): BuocMobile[] => {
    if (!goc) return []
    const res: BuocMobile[] = []

    // 1. Sơ đồ hội tụ (hoiTu)
    if (goc.hoiTu) {
      let buocSo = 1
      const lanLoc = goc.hoiTu.lan
        .map(l => ({ ...l, nut: l.nut.filter(hien) }))
        .filter(l => l.nut.length > 0)

      lanLoc.forEach((l, idx) => {
        l.nut.forEach((n, nIdx) => {
          const m = moNut(n, s.goi)
          res.push({
            id: `lan-${idx}-${nIdx}-${n.di || n.ten}`,
            so: buocSo,
            ten: n.ten,
            moTa: l.ten !== n.ten ? l.ten : n.noi,
            icon: n.icon || l.icon || 'doc',
            di: n.di,
            path: m.path,
            ok: m.ok,
          })
        })
        buocSo++
      })

      const raNut = goc.hoiTu.ra.nut.filter(hien)
      if (raNut.length > 0) {
        raNut.forEach((n, nIdx) => {
          const m = moNut(n, s.goi)
          res.push({
            id: `ra-${nIdx}-${n.di || n.ten}`,
            so: buocSo,
            ten: n.ten,
            moTa: goc.hoiTu!.ra.ten !== n.ten ? goc.hoiTu!.ra.ten : undefined,
            icon: n.icon || goc.hoiTu!.ra.icon || 'book',
            di: n.di,
            path: m.path,
            ok: m.ok,
          })
        })
      }
      return res
    }

    // 2. Sơ đồ luồng cột (luongFree)
    if (luong) {
      let buocSo = 1
      luong.forEach((c, cIdx) => {
        c.nut.forEach((n, nIdx) => {
          const m = moNut(n, s.goi)
          res.push({
            id: `luong-${cIdx}-${nIdx}-${n.di || n.ten}`,
            so: buocSo,
            ten: n.ten,
            moTa: n.noi || c.noi,
            icon: n.icon || 'doc',
            di: n.di,
            path: m.path,
            ok: m.ok,
          })
        })
        buocSo++
      })
      return res
    }

    // 3. Sơ đồ bước trục ngang (buoc)
    if (goc.buoc) {
      let buocSo = 1
      goc.buoc.forEach((b, bIdx) => {
        const tren = (b.tren ?? []).filter(hien)
        const chinh = hien(b.chinh) ? [b.chinh] : []
        const duoi = (b.duoi ?? []).filter(hien)
        const tatCa = [...tren, ...chinh, ...duoi]

        if (tatCa.length === 0) return

        tatCa.forEach((n, nIdx) => {
          const m = moNut(n, s.goi)
          res.push({
            id: `buoc-${bIdx}-${nIdx}-${n.di || n.ten}`,
            so: buocSo,
            ten: n.ten,
            moTa: b.ten && b.ten !== n.ten ? b.ten : n.noi,
            icon: n.icon || 'doc',
            di: n.di,
            path: m.path,
            ok: m.ok,
          })
        })
        buocSo++
      })
      return res
    }

    return res
  }, [goc, luong, s.goi, s.cheDo])

  return (
    <div className="m-quytrinh">
      {s.goi === 'F' && goc0?.moTaFree && (
        <p className="m-qt-mota-dau">{goc0.moTaFree}</p>
      )}

      <div className="m-qt-ds">
        {dsBuoc.map((b, i) => (
          <div key={b.id} className="m-qt-muc">
            {i < dsBuoc.length - 1 && <div className="m-qt-duong" />}
            <div className="m-qt-cot-so">
              <span className="m-qt-so">{b.so}</span>
            </div>

            {b.di ? (
              <Link
                to={b.path}
                className={`m-qt-the m-qt-buoc${!b.ok ? ' khoa' : ''}`}
                title={b.ok ? `Mở ${b.ten.toLowerCase()}` : `${b.ten}: ngoài gói`}
              >
                <div className="m-qt-the-nd">
                  <div className="m-qt-the-trai">
                    <span className="m-qt-the-ic">
                      <Icon n={b.icon} className="ic sm" />
                    </span>
                    <div className="m-qt-the-chu">
                      <span className="m-qt-the-ten">{b.ten}</span>
                      {b.moTa && <span className="m-qt-the-mota">{b.moTa}</span>}
                    </div>
                  </div>
                  <div className="m-qt-the-phai">
                    {!b.ok && (
                      <span className="m-qt-the-lk" title="Ngoài gói">
                        <Icon n="lock" className="ic xs" />
                      </span>
                    )}
                    <Icon n="chevr" className="ic sm m-qt-the-arr" />
                  </div>
                </div>
              </Link>
            ) : (
              <div className="m-qt-the m-qt-buoc tinh">
                <div className="m-qt-the-nd">
                  <div className="m-qt-the-trai">
                    <span className="m-qt-the-ic">
                      <Icon n={b.icon} className="ic sm" />
                    </span>
                    <div className="m-qt-the-chu">
                      <span className="m-qt-the-ten">{b.ten}</span>
                      {b.moTa && <span className="m-qt-the-mota">{b.moTa}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
