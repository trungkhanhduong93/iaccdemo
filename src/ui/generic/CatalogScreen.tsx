// Màn danh mục chung: bảng có tìm kiếm, lọc nhóm, ngăn kéo thêm và sửa
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Col, Row, ScreenProps } from '../../modules/types'
import { tenMan } from '../../app/registry'
import { useSession } from '../../app/session'
import { Icon } from '../Icon'
import { PageHead } from '../Page'
import { St, Table } from '../Table'
import { fold } from '../format'
import { Dropdown, MenuItem, Select } from '../Dropdown'
import { LocO, ThanhLoc } from '../ThanhLoc'

export function CatalogScreen({ sc, mod }: ScreenProps) {
  const { s, toast } = useSession()
  const cfg = sc.catalog ?? { cols: [{ k: 'ma', t: 'Mã', cls: 'code' }, { k: 'ten', t: 'Tên' }], rows: () => [] }
  const all = useMemo(() => cfg.rows(), [sc])
  const [q, setQ] = useState('')
  const [nhom, setNhom] = useState('')
  const [edit, setEdit] = useState<Row | null>(null)
  const nhoms = cfg.nhomLoc ? [...new Set(all.map(r => r[cfg.nhomLoc!]))] : []
  const rows = all.filter(r => (!nhom || r[cfg.nhomLoc!] === nhom) && (!q || fold(Object.values(r).join(' ')).includes(fold(q))))
  const cols0 = typeof cfg.cols === 'function' ? cfg.cols(s.goi) : cfg.cols
  const cols: Col[] = [
    ...cols0,
    { k: '_tt', t: 'Trạng thái', r: r => r._tt === 0 ? <St k="dim">Ngừng dùng</St> : <St k="ok">Đang dùng</St> },
    ...(cfg.chucNang ? [{
      k: '_cn',
      t: 'Chức năng',
      w: 150,
      dinh: 'phai' as const,
      r: (r: Row) => {
        const acts = cfg.chucNang!(r)
        if (!acts || acts.length === 0) return null
        const [dau, ...conLai] = acts
        return (
          <div className="row" style={{ gap: 4, justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
            <Link to={`/app/${dau.di}`} className="btn sm ghost">{dau.nhan}</Link>
            {conLai.length > 0 && (
              <Dropdown
                btnClass="icon-btn sm"
                align="end"
                label={<Icon n="more" className="ic sm" />}
              >
                {conLai.map(m => (
                  <MenuItem key={m.di} to={`/app/${m.di}`} icon={m.icon}>{m.nhan}</MenuItem>
                ))}
              </Dropdown>
            )}
          </div>
        )
      },
    }] : []),
  ]
  const ten = tenMan(sc)

  return (
    <div className="page">
      <PageHead crumb={[mod.ten]} title={ten} code={sc.code}>
        <button className="btn"><Icon n="upload" className="ic sm" />Nhập Excel</button>
        <button className="btn"><Icon n="download" className="ic sm" />Xuất Excel</button>
        <button className="btn pri" onClick={() => setEdit({})}><Icon n="plus" className="ic sm" />Thêm mới</button>
      </PageHead>
      {cfg.note?.(s.goi)}
      <section className="card">
        <ThanhLoc
          tim={{
            value: q,
            onChange: setQ,
            placeholder: 'Tìm theo mã, tên',
          }}
          boLoc={
            nhoms.length > 1 ? (
              <LocO nhan={cfg.nhanLoc ?? 'Nhóm'}>
                <Select className="inp" value={nhom} onChange={e => setNhom(e.target.value)}>
                  <option value="">Tất cả</option>
                  {nhoms.map(n => <option key={n}>{n}</option>)}
                </Select>
              </LocO>
            ) : undefined
          }
          dangLoc={nhom !== ''}
          onLamMoi={() => setNhom('')}
          phai={<span className="muted" style={{ fontSize: 12 }}>{rows.length}/{all.length} dòng</span>}
        />
        {rows.length ? <Table cols={cols} rows={rows} motDong onRow={r => setEdit(r)} /> : (
          all.length ? <div className="empty"><b>Không có dòng khớp bộ lọc</b><button className="btn sm" style={{ marginTop: 10 }} onClick={() => { setQ(''); setNhom('') }}>Xoá bộ lọc</button></div>
            : <div className="empty"><b>Chưa có dữ liệu</b><button className="btn sm pri" style={{ marginTop: 10 }} onClick={() => setEdit({})}>{cfg.them ?? 'Thêm mới'}</button></div>
        )}
      </section>

      {edit && (
        <>
          <div className="overlay" style={{ padding: 0 }} onClick={() => setEdit(null)} />
          <aside className="drawer">
            <div className="drawer-h">
              <div className="grow"><h3 style={{ color: 'var(--ink)', fontSize: 16 }}>{edit.ma || edit.ten ? `Sửa: ${edit.ten ?? edit.ma}` : cfg.them ?? 'Thêm mới'}</h3><small className="muted">{ten}</small></div>
              <button className="icon-btn" onClick={() => setEdit(null)}><Icon n="x" /></button>
            </div>
            <div className="drawer-b">
              {cols0.map(c => (
                <div className="f" key={c.k}><label>{c.t}</label><input className="inp" defaultValue={typeof edit[c.k] === 'number' ? edit[c.k].toLocaleString('vi-VN') : edit[c.k] ?? ''} /></div>
              ))}
              <label className="row" style={{ fontSize: 13 }}><input type="checkbox" defaultChecked /> Đang dùng</label>
            </div>
            <div className="drawer-f">
              <button className="btn" onClick={() => setEdit(null)}>Huỷ</button>
              <button className="btn pri" onClick={() => { setEdit(null); toast('Đã lưu') }}>Lưu</button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
