import { Link, useSearchParams } from 'react-router-dom'
import { useSession } from '../../app/session'
import { MODULES, duongDan, hienMan, hienPhanHe, moDuoc, phanHeKhoa, tabCua, tenMan } from '../../app/registry'
import type { ScreenDef } from '../../modules/types'
import { Icon } from '../Icon'

export function MNghiepVu() {
  const { s } = useSession()
  const [params] = useSearchParams()
  const modKey = params.get('m')

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
      tabCua(m).some(manMoTrenMobile)
  )

  const modHienTai = modKey ? dsPhanHe.find(m => m.key === modKey) : null

  if (modHienTai) {
    const dsMan = tabCua(modHienTai).filter(manMoTrenMobile)

    return (
      <div className="m-nghiep-vu m-nv-chi-tiet">
        <div className="m-nv-ds-head">
          <div className="m-nv-ds-head-ic">
            <Icon n={modHienTai.icon} />
          </div>
          <div className="m-nv-ds-head-info">
            <h2 className="m-nv-ds-tieu">{modHienTai.ten}</h2>
            {modHienTai.mota && <p className="m-nv-ds-mota">{modHienTai.mota}</p>}
          </div>
        </div>

        <div className="m-nv-ds">
          {dsMan.map(sc => {
            const khoa = !moDuoc(sc, s.goi)
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
                  {khoa && (
                    <span className="m-nv-dong-lk" title="Ngoài gói">
                      <Icon n="lock" className="ic xs" />
                    </span>
                  )}
                  <Icon n="chevr" className="ic sm m-nv-dong-mui-ten" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="m-nghiep-vu">
      <div className="m-nv-luoi">
        {dsPhanHe.map(m => {
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
                    <Icon n="lock" className="ic xs" />
                  </span>
                )}
              </div>
              <span className="m-nv-o-ten">{m.ten}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
