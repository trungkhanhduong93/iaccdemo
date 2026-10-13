import { Link, useNavigate } from 'react-router-dom'
import { dsDonVi, useSession } from '../../app/session'
import { ROLE } from '../../data/mock'
import { GOI, GOIS } from '../../app/plan'
import { MODULES, duongDan, hienMan, moDuoc, tabCua, tenMan } from '../../app/registry'
import { Icon } from '../Icon'
import { Pk } from '../Page'

export function MKhac() {
  const { s, set } = useSession()
  const nav = useNavigate()

  const ten = s.ten.split(' ').slice(-2).map(x => x[0]).join('')

  const modDm = MODULES.find(m => m.key === 'danh-muc')
  const modHt = MODULES.find(m => m.key === 'he-thong')

  const dsDm = modDm ? tabCua(modDm).filter(sc => hienMan(sc, s.goi, s.cheDo, s)) : []
  const dsHt = modHt ? tabCua(modHt).filter(sc => hienMan(sc, s.goi, s.cheDo, s)) : []

  return (
    <div className="m-khac">
      {/* Thẻ người dùng */}
      <section className="m-khac-the-user">
        <div className="m-khac-user-av">{ten}</div>
        <div className="m-khac-user-info">
          <h2 className="m-khac-user-ten">{s.ten}</h2>
          <div className="m-khac-user-email">{s.email}</div>
          <div className="m-khac-user-tags">
            <span className="m-khac-vai-tro">{ROLE[s.role]}</span>
            <Pk g={s.goi} />
          </div>
        </div>
      </section>

      {/* Nhóm Danh mục & thiết lập */}
      <section className="m-khac-nhom">
        <h3 className="m-khac-nhom-tieu">Danh mục & thiết lập</h3>
        <div className="m-khac-ds">
          {modDm && dsDm.map(sc => {
            const khoa = !moDuoc(sc, s.goi)
            return (
              <Link
                key={`dm-${sc.slug}`}
                to={duongDan(modDm, sc)}
                className={`m-khac-dong${khoa ? ' khoa' : ''}`}
              >
                <div className="m-khac-dong-trai">
                  <span className="m-khac-dong-ic">
                    <Icon n={sc.icon ?? modDm.icon} className="ic sm" />
                  </span>
                  <span className="m-khac-dong-ten">{tenMan(sc)}</span>
                </div>
                <div className="m-khac-dong-phai">
                  {khoa && (
                    <span className="m-khac-dong-lk">
                      <Icon n="lock" className="ic xs" />
                    </span>
                  )}
                  <Icon n="chevr" className="ic sm m-khac-mui-ten" />
                </div>
              </Link>
            )
          })}
          {modHt && dsHt.map(sc => {
            const khoa = !moDuoc(sc, s.goi)
            return (
              <Link
                key={`ht-${sc.slug}`}
                to={duongDan(modHt, sc)}
                className={`m-khac-dong${khoa ? ' khoa' : ''}`}
              >
                <div className="m-khac-dong-trai">
                  <span className="m-khac-dong-ic">
                    <Icon n={sc.icon ?? modHt.icon} className="ic sm" />
                  </span>
                  <span className="m-khac-dong-ten">{tenMan(sc)}</span>
                </div>
                <div className="m-khac-dong-phai">
                  {khoa && (
                    <span className="m-khac-dong-lk">
                      <Icon n="lock" className="ic xs" />
                    </span>
                  )}
                  <Icon n="chevr" className="ic sm m-khac-mui-ten" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Nhóm Đơn vị & xem thử gói */}
      <section className="m-khac-nhom">
        <h3 className="m-khac-nhom-tieu">Đơn vị kế toán</h3>
        <div className="m-khac-ds">
          {dsDonVi(s).map(d => {
            const on = d.id === s.donVi
            return (
              <button
                key={d.id}
                type="button"
                className={`m-khac-dong-btn${on ? ' on' : ''}`}
                onClick={() => set({ donVi: d.id, goi: d.goi, chiNhanh: 'all' })}
              >
                <div className="m-khac-dong-trai">
                  <span className="m-khac-dv-av">{d.viettat}</span>
                  <div className="m-khac-dv-info">
                    <span className="m-khac-dong-ten">{d.ten}</span>
                    <small className="m-khac-dong-phu">
                      {d.mst ? `MST ${d.mst}` : 'Chưa khai MST'} · {d.diem} điểm
                    </small>
                  </div>
                </div>
                <div className="m-khac-dong-phai">
                  <Pk g={d.goi} />
                  {on && <Icon n="check" className="ic sm m-khac-tich" />}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="m-khac-nhom">
        <h3 className="m-khac-nhom-tieu">Trải nghiệm gói</h3>
        <div className="m-khac-ds">
          {GOIS.map(g => {
            const on = s.goi === g
            return (
              <button
                key={g}
                type="button"
                className={`m-khac-dong-btn${on ? ' on' : ''}`}
                onClick={() => set({ goi: g })}
              >
                <div className="m-khac-dong-trai">
                  <span className="m-khac-dong-ten">{GOI[g].ten}</span>
                </div>
                <div className="m-khac-dong-phai">
                  <Pk g={g} />
                  {on && <Icon n="check" className="ic sm m-khac-tich" />}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Nút Đăng xuất */}
      <section className="m-khac-nhom-logout">
        <button
          type="button"
          className="m-khac-logout-btn"
          onClick={() => {
            set({ loggedIn: false })
            nav('/dang-nhap')
          }}
        >
          <Icon n="logout" className="ic sm" />
          <span>Đăng xuất</span>
        </button>
      </section>
    </div>
  )
}
