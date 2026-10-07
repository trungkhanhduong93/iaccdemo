// Hệ thống: người dùng, phân quyền, gói thuê bao, cấu hình, thông tin đơn vị
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ScreenProps } from '../types'
import { MODULES, duongDan } from '../../app/registry'
import { donViHienTai, useSession } from '../../app/session'
import { FEATURES, GOI, GOIS, MODS, demTheoGoi, kieuGhiSo, type Goi } from '../../app/plan'
import { CHI_NHANH, NGUOI_DUNG } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Card, Note, PageHead, Pk } from '../../ui/Page'
import { St, Table } from '../../ui/Table'

export function NguoiDung({ sc }: ScreenProps) {
  const { toast } = useSession()
  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!} meta={<span className="chip">{NGUOI_DUNG.length}/10 người dùng của gói</span>}>
        <button className="btn pri" onClick={() => toast('Đã gửi lời mời tới email')}><Icon n="mail" className="ic sm" />Mời người dùng</button>
      </PageHead>
      <section className="card">
        <Table cols={[{ k: 'ten', t: 'Họ tên', r: r => <span className="row"><span className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{r.ten.split(' ').slice(-2).map((x: string) => x[0]).join('')}</span><b style={{ color: 'var(--ink)' }}>{r.ten}</b></span> },
          { k: 'email', t: 'Email', cls: 'dim' }, { k: 'vaiTro', t: 'Vai trò' }, { k: 'pham', t: 'Phạm vi dữ liệu' }, { k: 'lan', t: 'Đăng nhập gần nhất', cls: 'dim' },
          { k: 'tt', t: 'Trạng thái', r: r => r.tt === 'ok' ? <St k="ok">Đang dùng</St> : <St k="warn">Chưa nhận lời mời</St> }, { k: 'x', t: '', r: () => <button className="btn sm ghost">Sửa</button> }]} rows={NGUOI_DUNG} />
      </section>
      <Note icon="shield">Xác thực hai lớp bắt buộc với kế toán trưởng và chủ doanh nghiệp. Người dùng chỉ thấy dữ liệu chi nhánh, kho được giao.</Note>
    </div>
  )
}

const VAI_TRO = ['Chủ doanh nghiệp', 'Kế toán trưởng', 'Kế toán viên', 'Quản lý chi nhánh', 'Thủ kho']
const QUYEN = ['Xem', 'Thêm', 'Sửa', 'Xoá', 'Ghi sổ', 'Khoá sổ']
const MAC_DINH: Record<string, string[]> = {
  'Chủ doanh nghiệp': ['Xem'], 'Kế toán trưởng': QUYEN, 'Kế toán viên': ['Xem', 'Thêm', 'Sửa', 'Ghi sổ'], 'Quản lý chi nhánh': ['Xem', 'Thêm'], 'Thủ kho': ['Xem', 'Thêm', 'Sửa'],
}

export function PhanQuyen({ sc }: ScreenProps) {
  const { toast } = useSession()
  const [vt, setVt] = useState('Kế toán viên')
  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!}>
        <button className="btn">Thêm vai trò</button>
        <button className="btn pri" onClick={() => toast(`Đã lưu quyền của ${vt}`)}>Lưu</button>
      </PageHead>
      <div className="grid" style={{ gridTemplateColumns: '240px minmax(0,1fr)', alignItems: 'start' }}>
        <Card title="Vai trò" pad={false}>
          <div className="panel-list" style={{ padding: 8 }}>
            {VAI_TRO.map(v => <a key={v} className={v === vt ? 'on' : ''} onClick={() => setVt(v)} style={{ cursor: 'pointer' }}><span>{v}</span></a>)}
          </div>
        </Card>
        <section className="card">
          <div className="card-h"><h3>Quyền của {vt}</h3><span className="sub">Theo phân hệ · phạm vi dữ liệu đặt ở Người dùng</span></div>
          <table className="tbl matrix">
            <thead><tr><th>Phân hệ</th>{QUYEN.map(q => <th key={q} className="c">{q}</th>)}</tr></thead>
            <tbody>
              {MODS.map(m => (
                <tr key={m}><td>{m}</td>{QUYEN.map(q => <td key={q} className="c"><input type="checkbox" defaultChecked={MAC_DINH[vt].includes(q)} key={vt + q} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}

export function GoiThueBao({ sc }: ScreenProps) {
  const { s, set, toast } = useSession()
  const dv = donViHienTai(s)
  const [mo, setMo] = useState<number | null>(null)
  const gia: Record<Goi, string> = { F: '0 đ', S: 'Chờ chốt giá', M: 'Chờ chốt giá', A: 'Chờ chốt giá' }
  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!} meta={<><Pk g={s.goi} /><span className="chip">{GOI[s.goi].cheDo}</span><span className="chip">Hạn dùng 06/10/2027</span></>}>
        <button className="btn" onClick={() => toast('Đã gia hạn thêm 12 tháng')}>Gia hạn online</button>
      </PageHead>
      <div className="grid g4" style={{ marginBottom: 14 }}>
        {GOIS.map(g => {
          const n = demTheoGoi(g)
          const dang = g === s.goi
          return (
            <div key={g} className="card" style={{ padding: 18, borderColor: dang ? `var(--${GOI[g].cls})` : undefined, boxShadow: dang ? `0 0 0 2px var(--${GOI[g].cls}) inset` : undefined }}>
              <div className="row"><Pk g={g} /><span className="grow" />{dang && <span className="chip ok">Đang dùng</span>}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '12px 0 2px' }}>{n.co}<small style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}> /{n.tong} tính năng</small></div>
              <div className="muted" style={{ fontSize: 12.5, minHeight: 36 }}>{GOI[g].mota}</div>
              <div style={{ fontSize: 12.5, margin: '8px 0 12px' }}><b style={{ color: 'var(--ink)' }}>{g === 'F' ? 'Không chế độ kế toán' : GOI[g].cheDo}</b><br /><span className="muted">Giá: {gia[g]}</span></div>
              {dang ? <button className="btn" style={{ width: '100%' }} disabled>Gói hiện tại</button>
                : <button className={`btn ${GOIS.indexOf(g) > GOIS.indexOf(s.goi) ? 'acc' : ''}`} style={{ width: '100%' }} onClick={() => { set({ goi: g }); toast(`Đã chuyển ${dv.viettat} sang gói ${GOI[g].ten}`) }}>
                  {GOIS.indexOf(g) > GOIS.indexOf(s.goi) ? 'Nâng cấp' : 'Chuyển về gói này'}</button>}
            </div>
          )
        })}
      </div>
      <section className="card">
        <div className="card-h"><h3>So sánh tính năng theo phân hệ</h3><span className="sub">Lấy từ file Dự kiến tính năng IACC Cloud · bấm phân hệ để xem từng tính năng</span></div>
        <table className="tbl matrix">
          <thead><tr><th>Phân hệ</th>{GOIS.map(g => <th key={g} className="c"><Pk g={g} o /></th>)}</tr></thead>
          <tbody>
            {MODS.map((m, i) => {
              const fs = FEATURES.filter(f => f.m === i)
              const mod = MODULES.find(x => x.mod === i)
              return [
                <tr key={m} className="click" onClick={() => setMo(mo === i ? null : i)}>
                  <td><span className="row"><Icon n={mo === i ? 'chevd' : 'chevr'} className="ic sm" /><b style={{ color: 'var(--ink)' }}>{m}</b></span></td>
                  {GOIS.map(g => { const c = fs.filter(f => f.g.includes(g)).length; return <td key={g} className="c">{c ? <b>{c}/{fs.length}</b> : <span className="x">—</span>}</td> })}
                </tr>,
                ...(mo === i ? fs.map(f => (
                  <tr key={f.c} className="sub">
                    <td>{mod ? <Link to={duongDan(mod, mod.screens.find(z => z.code === f.c)!)}>{f.n}</Link> : f.n} <small className="muted">{f.c}</small></td>
                    {GOIS.map(g => <td key={g} className="c">{f.g.includes(g) ? <Icon n="check" className="ic sm" /> : <span className="x">—</span>}</td>)}
                  </tr>
                )) : []),
              ]
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export function CauHinh({ sc }: ScreenProps) {
  const { s, toast } = useSession()
  const noco = kieuGhiSo(s.goi) === 'noco'
  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!}><button className="btn pri" onClick={() => toast('Đã lưu cấu hình')}>Lưu</button></PageHead>
      <div className="grid g2" style={{ alignItems: 'start' }}>
        <Card title="Chế độ kế toán">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="f"><label>Chế độ</label><input className="inp" readOnly value={GOI[s.goi].cheDo} /></div>
            <div className="f"><label>Năm tài chính</label><input className="inp" defaultValue="01/01 – 31/12" /></div>
            <div className="f"><label>Phương pháp tính giá xuất kho</label><select className="inp"><option>Bình quân gia quyền cuối kỳ</option><option>Bình quân tức thời</option><option>Nhập trước xuất trước</option></select></div>
            <div className="f"><label>Phương pháp tính thuế GTGT</label><input className="inp" readOnly value={s.goi === 'S' ? 'Trực tiếp trên doanh thu' : s.goi === 'F' ? 'Không áp dụng' : 'Khấu trừ'} /></div>
          </div>
        </Card>
        <Card title="Bộ định khoản tự động" act={noco ? <Link className="btn sm ghost" to="/app/danh-muc/1-15">Sửa bộ định khoản</Link> : undefined}>
          {noco ? <Note icon="book">Thứ tự ưu tiên tài khoản: hàng hoá, rồi nhóm hàng, rồi mặc định của chế độ. Bộ mặc định ngành F&B đã nạp sẵn 7 bút toán.</Note>
            : <Note kind="gray">Gói {GOI[s.goi].ten} không dùng tài khoản Nợ/Có nên không có bộ định khoản.</Note>}
        </Card>
        <Card title="Đánh số chứng từ">
          <Table cols={[{ k: 'loai', t: 'Loại chứng từ' }, { k: 'mau', t: 'Mẫu số', cls: 'code' }, { k: 'vd', t: 'Ví dụ', cls: 'dim' }]} rows={[
            { loai: 'Phiếu thu', mau: 'PT{YY}{MM}-{0000}', vd: 'PT2610-0001' }, { loai: 'Phiếu chi', mau: 'PC{YY}{MM}-{0000}', vd: 'PC2610-0241' },
            { loai: 'Bán hàng từ FABi', mau: 'BH{YY}{MM}-{CN}-{DD}', vd: 'BH2610-Q1-07' }, { loai: 'Mua hàng', mau: 'MH{YY}{MM}-{0000}', vd: 'MH2610-0118' }]} />
        </Card>
        <Card title="Chi nhánh và ánh xạ POS">
          <Table cols={[{ k: 'ten', t: 'Chi nhánh' }, { k: 'fabi', t: 'Mã trên FABi', cls: 'code' }, { k: 'kho', t: 'Kho' }]} rows={CHI_NHANH.map(c => ({ ten: c.ten, fabi: `FB-${c.id.toUpperCase()}-01`, kho: c.kho.length }))} />
        </Card>
      </div>
    </div>
  )
}

export function ThongTinDonVi({ sc }: ScreenProps) {
  const { s, toast } = useSession()
  const dv = donViHienTai(s)
  return (
    <div className="page">
      <PageHead crumb={['Hệ thống']} title={sc.ten!}><button className="btn pri" onClick={() => toast('Đã lưu thông tin đơn vị')}>Lưu</button></PageHead>
      <Card title="Thông tin trên chứng từ, báo cáo">
        <div className="form-grid">
          <div className="f c2"><label>Tên đơn vị</label><input className="inp" defaultValue={dv.ten} /></div>
          <div className="f"><label>Mã số thuế</label><input className="inp" readOnly defaultValue={dv.mst} /></div>
          <div className="f"><label>Số điểm bán</label><input className="inp" readOnly defaultValue={dv.diem} /></div>
          <div className="f c4"><label>Địa chỉ</label><input className="inp" defaultValue={dv.diaChi} /></div>
          <div className="f c2"><label>Người đại diện theo pháp luật</label><input className="inp" defaultValue={dv.nguoiDaiDien} /></div>
          <div className="f c2"><label>Kế toán trưởng</label><input className="inp" defaultValue="Trần Thu Hà" /></div>
        </div>
      </Card>
    </div>
  )
}
