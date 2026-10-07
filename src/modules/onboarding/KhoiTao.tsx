// Khởi tạo đơn vị kế toán 4 bước: chế độ kế toán, thông tin đơn vị, kết nối FABi và iPOS Inventory, số dư đầu kỳ
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../../app/session'
import { GOI, GOIS, demTheoGoi, type Goi } from '../../app/plan'
import { CHI_NHANH } from '../../data/mock'
import { Icon } from '../../ui/Icon'
import { Logo } from '../../ui/Logo'
import { Note, Pk } from '../../ui/Page'
import { Table } from '../../ui/Table'
import { Select } from '../../ui/Dropdown'

const BUOC = ['Chế độ kế toán', 'Thông tin đơn vị', 'Kết nối FABi, Inventory', 'Số dư đầu kỳ']

export function KhoiTao() {
  const { set } = useSession()
  const nav = useNavigate()
  const [b, setB] = useState(0)
  const [goi, setGoi] = useState<Goi>('M')
  const [mst, setMst] = useState('')
  const [traCuu, setTraCuu] = useState(false)
  const [dongBo, setDongBo] = useState('tu')
  const [soDu, setSoDu] = useState('excel')

  const xong = () => { set({ loggedIn: true, goi, donVi: 'pm', khoiTao: true }); nav('/app') }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '36px 40px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="row" style={{ marginBottom: 26 }}>
          <div className="brand" style={{ color: 'var(--ink)' }}><Logo />IACC Cloud</div>
          <span className="grow" />
          <button className="btn ghost" onClick={() => nav(-1)}>Để sau</button>
        </div>
        <div className="steps">{BUOC.map((t, i) => <div key={t} className={i <= b ? 'on' : ''}><i /><span>{i + 1}. {t}</span></div>)}</div>

        <div className="card" style={{ padding: '26px 28px' }}>
          {b === 0 && (
            <>
              <h2 style={{ color: 'var(--ink)', fontSize: 20 }}>Chọn chế độ kế toán</h2>
              <p className="muted" style={{ margin: '4px 0 18px' }}>Chế độ quyết định hệ thống tài khoản, mẫu sổ và báo cáo tài chính. Đổi được khi chuyển gói.</p>
              <div className="grid g2">
                {GOIS.map(g => {
                  const n = demTheoGoi(g)
                  return (
                    <button key={g} className={`opt ${goi === g ? 'on' : ''}`} onClick={() => setGoi(g)}>
                      <span className="radio" />
                      <span className="grow">
                        <span className="row"><b>{g === 'F' ? 'Chưa áp chế độ kế toán' : GOI[g].cheDo}</b><span className="grow" /><Pk g={g} /></span>
                        <small>{GOI[g].mota}. {n.co}/{n.tong} tính năng.</small>
                      </span>
                    </button>
                  )
                })}
              </div>
              <Note icon="sparkle">Gợi ý theo dữ liệu FABi: 3 điểm bán, doanh thu 12 tháng khoảng 29 tỷ. Hợp với gói Medium, TT133.</Note>
            </>
          )}

          {b === 1 && (
            <>
              <h2 style={{ color: 'var(--ink)', fontSize: 20 }}>Thông tin đơn vị</h2>
              <p className="muted" style={{ margin: '4px 0 18px' }}>Nhập mã số thuế để lấy tên, địa chỉ từ cơ sở dữ liệu thuế.</p>
              <div className="form-grid">
                <div className="f c2"><label>Mã số thuế <em>*</em></label>
                  <div className="row"><input className="inp" value={mst} onChange={e => setMst(e.target.value)} placeholder="vd: 0319990001" />
                    <button className="btn" onClick={() => { setMst(mst || '0319990001'); setTraCuu(true) }}>Tra cứu</button></div>
                </div>
                <div className="f c2"><label>Kỳ kế toán bắt đầu</label><input className="inp" defaultValue="01/10/2026" /></div>
                <div className="f c4"><label>Tên đơn vị <em>*</em></label><input className="inp" readOnly={!traCuu} value={traCuu ? 'Công ty TNHH Ẩm thực Phố Mây' : ''} onChange={() => {}} /></div>
                <div className="f c4"><label>Địa chỉ</label><input className="inp" value={traCuu ? '86 Lê Lợi, phường Sài Gòn, TP.HCM' : ''} onChange={() => {}} /></div>
                <div className="f c2"><label>Người đại diện theo pháp luật</label><input className="inp" defaultValue={traCuu ? 'Nguyễn Minh Anh' : ''} /></div>
                <div className="f"><label>Đồng tiền ghi sổ</label><Select className="inp"><option>VND</option>{goi === 'A' && <option>USD</option>}</Select></div>
                <div className="f"><label>Kế toán trưởng</label><input className="inp" defaultValue={traCuu ? 'Trần Thu Hà' : ''} /></div>
              </div>
            </>
          )}

          {b === 2 && (
            <>
              <h2 style={{ color: 'var(--ink)', fontSize: 20 }}>Kết nối FABi và iPOS Inventory</h2>
              <p className="muted" style={{ margin: '4px 0 18px' }}>Danh mục, chi nhánh, kho lấy từ FABi và iPOS Inventory. Không phải nhập lại.</p>
              <div className="grid g2" style={{ marginBottom: 16 }}>
                <div className="opt on"><Icon n="pos" /><span className="grow"><b>FABi</b><small>Đã nhận 3 chi nhánh, 86 món, 9 nhóm món</small></span><span className="chip ok">Đã kết nối</span></div>
                <div className="opt on"><Icon n="box" /><span className="grow"><b>iPOS Inventory</b><small>Đã nhận 5 kho, 142 nguyên vật liệu, 38 công thức</small></span><span className="chip ok">Đã kết nối</span></div>
              </div>
              <Table cols={[{ k: 'fabi', t: 'Chi nhánh trên FABi' }, { k: 'iacc', t: 'Chi nhánh kế toán' }, { k: 'kho', t: 'Kho iPOS Inventory' }]}
                rows={CHI_NHANH.map(c => ({ fabi: c.ten, iacc: c.ten, kho: c.kho.join(', ') }))} />
              <div className="grid g2" style={{ marginTop: 16 }}>
                <button className={`opt ${dongBo === 'tu' ? 'on' : ''}`} onClick={() => setDongBo('tu')}><span className="radio" /><span><b>Tự động theo lịch</b><small>Mỗi 15 phút, chốt cuối ngày lúc 23:30</small></span></button>
                <button className={`opt ${dongBo === 'tay' ? 'on' : ''}`} onClick={() => setDongBo('tay')}><span className="radio" /><span><b>Bấm tải khi cần</b><small>Chọn khoảng ngày và chi nhánh rồi tải</small></span></button>
              </div>
              <div className="f" style={{ marginTop: 14, maxWidth: 360 }}><label>Gom đơn bán thành chứng từ</label><Select className="inp"><option>Mỗi chi nhánh một chứng từ mỗi ngày</option><option>Mỗi ca một chứng từ</option></Select></div>
            </>
          )}

          {b === 3 && (
            <>
              <h2 style={{ color: 'var(--ink)', fontSize: 20 }}>Số dư đầu kỳ</h2>
              <p className="muted" style={{ margin: '4px 0 18px' }}>Số dư ngày 01/10/2026: {goi === 'F' || goi === 'S' ? 'tiền mặt, tiền gửi, công nợ, tồn kho' : 'số dư tài khoản, công nợ, tồn kho'}.</p>
              <div className="grid g3">
                {[['excel', 'upload', 'Nhập từ Excel', 'Tải mẫu, điền rồi tải lên'], ['tay', 'edit', 'Nhập tay', 'Gõ từng dòng trên màn hình'], ['sau', 'clock', 'Để sau', 'Nhập ở Kế toán tổng hợp']].map(([k, ic, t, s]) => (
                  <button key={k} className={`opt ${soDu === k ? 'on' : ''}`} onClick={() => setSoDu(k)}><Icon n={ic} /><span><b>{t}</b><small>{s}</small></span></button>
                ))}
              </div>
              {soDu === 'excel' && (
                <div className="card" style={{ marginTop: 16, padding: 22, borderStyle: 'dashed', textAlign: 'center', boxShadow: 'none' }}>
                  <Icon n="filein" className="ic lg" />
                  <p style={{ margin: '8px 0 12px' }}>Kéo thả tệp Excel vào đây</p>
                  <button className="btn sm"><Icon n="download" className="ic sm" />Tải mẫu Excel số dư</button>
                </div>
              )}
              <Note kind="ok" icon="check">Xong bước này là vào được phần mềm. Doanh thu từ 01/10/2026 tự đồng bộ về từ FABi.</Note>
            </>
          )}

          <div className="row" style={{ marginTop: 24, justifyContent: 'flex-end' }}>
            {b > 0 && <button className="btn lg" onClick={() => setB(b - 1)}>Quay lại</button>}
            {b < 3 ? <button className="btn pri lg" onClick={() => setB(b + 1)}>Tiếp tục<Icon n="arrow" className="ic sm" /></button>
              : <button className="btn acc lg" onClick={xong}>Vào phần mềm<Icon n="arrow" className="ic sm" /></button>}
          </div>
        </div>
      </div>
    </div>
  )
}
