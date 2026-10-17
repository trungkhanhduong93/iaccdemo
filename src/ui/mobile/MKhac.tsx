import { Link, useNavigate } from 'react-router-dom'
import { dsDonVi, useSession } from '../../app/session'
import { ROLE } from '../../data/mock'
import { GOI, GOIS, anNgoaiGoi, minGoi } from '../../app/plan'
import { MODULES, duongDan, hienMan, maKhoa, moDuoc, tabCua, tenMan } from '../../app/registry'
import { Icon } from '../Icon'
import { Pk } from '../Page'

export function MKhac() {
  const { s, set } = useSession()
  const nav = useNavigate()

  const ten = s.ten.split(' ').slice(-2).map(x => x[0]).join('')

  const modDm = MODULES.find(m => m.key === 'danh-muc')
  const modHt = MODULES.find(m => m.key === 'he-thong')

  const dsDm = modDm ? tabCua(modDm).filter(sc => hienMan(sc, s.goi, s.cheDo, s) && (!anNgoaiGoi(s.goi) || moDuoc(sc, s.goi))) : []
  const dsHt = modHt ? tabCua(modHt).filter(sc => hienMan(sc, s.goi, s.cheDo, s) && (!anNgoaiGoi(s.goi) || moDuoc(sc, s.goi))) : []

  return (
    <div className="m-khac">
      {/* 1. Thẻ người dùng */}
      <section className="m-khac-nhom-wrap">
        <div className="m-khac-the m-khac-the-user">
          <div className="m-khac-user-av">{ten}</div>
          <div className="m-khac-user-info">
            <h2 className="m-khac-user-ten">{s.ten}</h2>
            <div className="m-khac-user-email">{s.email}</div>
            <div className="m-khac-user-tags">
              <span className="m-khac-vai-tro">{ROLE[s.role]}</span>
              <Pk g={s.goi} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Nhóm Danh mục */}
      {modDm && dsDm.length > 0 && (
        <section className="m-khac-nhom-wrap">
          <h3 className="m-khac-nhom-tieu">DANH MỤC</h3>
          <div className="m-khac-the">
            <div className="m-khac-ds">
              {dsDm.map(sc => {
                const khoa = !moDuoc(sc, s.goi)
                const ma = maKhoa(sc)
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
                      <div className="m-khac-dong-nd">
                        <span className="m-khac-dong-ten">{tenMan(sc)}</span>
                      </div>
                    </div>
                    <div className="m-khac-dong-phai">
                      {khoa && ma && <Pk g={minGoi(ma)} o />}
                      <Icon n="chevr" className="ic sm m-khac-mui-ten" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. Nhóm Thiết lập */}
      {modHt && dsHt.length > 0 && (
        <section className="m-khac-nhom-wrap">
          <h3 className="m-khac-nhom-tieu">THIẾT LẬP</h3>
          <div className="m-khac-the">
            <div className="m-khac-ds">
              {dsHt.map(sc => {
                const khoa = !moDuoc(sc, s.goi)
                const ma = maKhoa(sc)
                return (
                  <Link
                    key={`ht-${sc.slug}`}
                    to={duongDan(modHt, sc)}
                    className={`m-khac-dong${khoa ? ' khoa' : ''}`}
                  >
                    <div className="m-khac-dong-trai">
                      <span className="m-khac-dong-ic ht">
                        <Icon n={sc.slug === 'khoa-so' ? 'lock' : (sc.icon ?? modHt.icon)} className="ic sm" />
                      </span>
                      <div className="m-khac-dong-nd">
                        <span className="m-khac-dong-ten">{tenMan(sc)}</span>
                      </div>
                    </div>
                    <div className="m-khac-dong-phai">
                      {khoa && ma && <Pk g={minGoi(ma)} o />}
                      <Icon n="chevr" className="ic sm m-khac-mui-ten" />
                    </div>
                  </Link>
                )
              })}
              {!dsHt.some(sc => sc.slug === 'khoa-so') && (
                <Link
                  to="/app/tong-hop/10-1-6"
                  className="m-khac-dong"
                >
                  <div className="m-khac-dong-trai">
                    <span className="m-khac-dong-ic ht">
                      <Icon n="lock" className="ic sm" />
                    </span>
                    <div className="m-khac-dong-nd">
                      <span className="m-khac-dong-ten">Khoá sổ</span>
                    </div>
                  </div>
                  <div className="m-khac-dong-phai">
                    <Icon n="chevr" className="ic sm m-khac-mui-ten" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 4. Nhóm Đơn vị kế toán */}
      <section className="m-khac-nhom-wrap">
        <h3 className="m-khac-nhom-tieu">ĐƠN VỊ KẾ TOÁN</h3>
        <div className="m-khac-the">
          <div className="m-khac-ds">
            {dsDonVi(s).map(d => {
              const on = d.id === s.donVi
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`m-khac-dong-btn${on ? ' on' : ''}`}
                  onClick={() => set({ donVi: d.id, goi: d.goi, cuaHang: 'all' })}
                >
                  <div className="m-khac-dong-trai">
                    <span className="m-khac-dv-av">{d.viettat}</span>
                    <div className="m-khac-dong-nd">
                      <span className="m-khac-dong-ten">{d.ten}</span>
                      <span className="m-khac-dong-phu">
                        {d.mst ? `MST ${d.mst}` : 'Chưa khai MST'} · {d.diem} điểm
                      </span>
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
        </div>
      </section>

      {/* 5. Nhóm Trải nghiệm gói */}
      <section className="m-khac-nhom-wrap">
        <h3 className="m-khac-nhom-tieu">TRẢI NGHIỆM GÓI</h3>
        <div className="m-khac-the">
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
                    <span className="m-khac-dong-ic goi">
                      <Icon n="layers" className="ic sm" />
                    </span>
                    <div className="m-khac-dong-nd">
                      <span className="m-khac-dong-ten">{GOI[g].ten}</span>
                      <span className="m-khac-dong-phu">{GOI[g].mota}</span>
                    </div>
                  </div>
                  <div className="m-khac-dong-phai">
                    <Pk g={g} />
                    {on && <Icon n="check" className="ic sm m-khac-tich" />}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. Nút Đăng xuất riêng */}
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
