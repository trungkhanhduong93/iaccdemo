import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSession } from '../../app/session'
import { MODULES, duongDan, hienMan, hienPhanHe, maKhoa, moDuoc, phanHeKhoa, tabCua, tenMan, tenPhanHe } from '../../app/registry'
import { GOIS, anNgoaiGoi, minGoi, type Goi } from '../../app/plan'
import type { ModuleDef, ScreenDef } from '../../modules/types'
import { Icon } from '../Icon'
import { Pk } from '../Page'
import { MQuyTrinh, layDsBuoc } from './MQuyTrinh'

const minGoiPhanHe = (m: ModuleDef): Goi => GOIS.find(g => !phanHeKhoa(m, g)) ?? 'PR'

export function MNghiepVu() {
  const { s } = useSession()
  const [params, setParams] = useSearchParams()
  const modKey = params.get('m')
  const xem = params.get('xem')

  // Chỉ hiện màn mà gói Free hoặc Standard mở được trên điện thoại, áp cho mọi gói (Trum chốt 13/10/2026, T194)
  const manMoTrenMobile = (sc: ScreenDef) =>
    hienMan(sc, s.goi, s.cheDo, s) && (moDuoc(sc, 'F') || moDuoc(sc, 'S'))

  const dsPhanHe = MODULES.filter(
    m =>
      hienPhanHe(m, s.goi) &&
      m.key !== 'trang-chu' &&
      m.key !== 'bao-cao' &&
      m.key !== 'danh-muc' &&
      m.key !== 'he-thong' &&
      m.key !== 'thao-tac-nhanh' &&
      (!anNgoaiGoi(s.goi) || !phanHeKhoa(m, s.goi)) &&
      tabCua(m).some(sc => manMoTrenMobile(sc) && (!anNgoaiGoi(s.goi) || moDuoc(sc, s.goi)))
  )

  const modHienTai = modKey ? dsPhanHe.find(m => m.key === modKey) : null

  // Kiểm tra phân hệ có sơ đồ quy trình và còn bước sau khi lọc ngoài gói
  const coQuyTrinh = useMemo(() => {
    if (!modHienTai) return false
    return layDsBuoc(modHienTai, s).length > 0
  }, [modHienTai, s])

  const dangXemDs = xem === 'ds' || !coQuyTrinh

  const chuyenTab = (tab: 'qt' | 'ds') => {
    const next = new URLSearchParams(params)
    if (tab === 'ds') {
      next.set('xem', 'ds')
    } else {
      next.delete('xem')
    }
    setParams(next)
  }

  if (modHienTai) {
    const dsMan = tabCua(modHienTai).filter(sc => manMoTrenMobile(sc) && (!anNgoaiGoi(s.goi) || moDuoc(sc, s.goi)))

    return (
      <div className="m-nghiep-vu m-nv-chi-tiet">
        <div className="m-nv-ds-head">
          <div className="m-nv-ds-head-ic">
            <Icon n={modHienTai.icon} />
          </div>
          <div className="m-nv-ds-head-info">
            <h2 className="m-nv-ds-tieu">{tenPhanHe(modHienTai, s.goi).ten}</h2>
            {modHienTai.mota && <p className="m-nv-ds-mota">{modHienTai.mota}</p>}
          </div>
        </div>

        {coQuyTrinh && (
          <div className="m-nv-phan-doan" role="tablist" aria-label="Xem theo quy trình hoặc danh sách">
            <button
              type="button"
              role="tab"
              aria-selected={!dangXemDs}
              className={`m-nv-pd-nut${!dangXemDs ? ' on' : ''}`}
              onClick={() => chuyenTab('qt')}
            >
              Quy trình
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={dangXemDs}
              className={`m-nv-pd-nut${dangXemDs ? ' on' : ''}`}
              onClick={() => chuyenTab('ds')}
            >
              Tất cả
            </button>
          </div>
        )}

        {coQuyTrinh && !dangXemDs ? (
          <MQuyTrinh mod={modHienTai} />
        ) : (
          <div className="m-nv-ds">
            {dsMan.map(sc => {
              const khoa = !moDuoc(sc, s.goi)
              const ma = maKhoa(sc)
              return (
                <Link
                  key={sc.slug}
                  to={duongDan(modHienTai, sc)}
                  className={`m-nv-dong${khoa ? ' khoa' : ''}`}
                >
                  <div className="m-nv-dong-trai">
                    <span className="m-nv-dong-ic">
                      <Icon n={sc.icon ?? modHienTai.icon} className="ic sm" />
                    </span>
                    <span className="m-nv-dong-ten">{tenMan(sc)}</span>
                  </div>
                  <div className="m-nv-dong-phai">
                    {khoa && ma && <Pk g={minGoi(ma)} o />}
                    <Icon n="chevr" className="ic sm m-nv-dong-mui-ten" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="m-nghiep-vu">
      <div className="m-nv-luoi">
        {dsPhanHe.filter(m => !anNgoaiGoi(s.goi) || !phanHeKhoa(m, s.goi)).map(m => {
          const khoa = phanHeKhoa(m, s.goi)
          return (
            <Link
              key={m.key}
              to={`/app/nghiep-vu?m=${m.key}`}
              className={`m-nv-o${khoa ? ' khoa' : ''}`}
            >
              <div className="m-nv-o-ic">
                <Icon n={m.icon} />
                {khoa && (
                  <span className="m-nv-o-lk" title="Ngoài gói">
                    <Pk g={minGoiPhanHe(m)} o />
                  </span>
                )}
              </div>
              <span className="m-nv-o-ten">{tenPhanHe(m, s.goi).ten}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
