// Thanh tab ngang của phân hệ: Quy trình, các màn chứng từ, danh mục, chức năng, Báo cáo. Tab không đủ chỗ dồn vào "Khác".
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSession } from './session'
import { duongDan, hienMan, laBaoCao, maKhoa, moDuoc, nhanTab, tabCua } from './registry'
import { GOI, minGoi } from './plan'
import type { ModuleDef, ScreenDef } from '../modules/types'
import { Icon } from '../ui/Icon'
import { Pk } from '../ui/Page'
import { Dropdown, MenuItem } from '../ui/Dropdown'

const KHAC = 110  // chỗ cho nút "Khác" kèm số tab bên trong

export function ModuleTabs({ mod }: { mod: ModuleDef }) {
  const { s } = useSession()
  const loc = useLocation()
  const tabs = useMemo(() => tabCua(mod).filter(sc => hienMan(sc, s.goi, s.cheDo)), [mod, s.goi, s.cheDo])
  const giua = tabs.filter(t => t.kind !== 'baocao')
  const bc = tabs.find(t => t.kind === 'baocao')
  const slug = loc.pathname.split('/')[3]
  const cur = mod.screens.find(sc => sc.slug === slug)
  const active = mod.key === 'bao-cao' ? 'tat-ca' : (cur && laBaoCao(cur) ? 'bao-cao' : slug)

  const wrap = useRef<HTMLDivElement>(null)
  const meas = useRef<HTMLDivElement>(null)
  const [do_, setDo] = useState<{ w: number[]; W: number } | null>(null)   // bề rộng từng tab và bề rộng thanh

  useLayoutEffect(() => {
    const el = wrap.current, m = meas.current
    if (!el || !m) return
    const tinh = () => setDo({ w: [...m.children].map(c => (c as HTMLElement).offsetWidth), W: el.clientWidth })
    tinh()
    const ro = new ResizeObserver(tinh)
    ro.observe(el)
    document.fonts?.ready.then(tinh)
    return () => ro.disconnect()
  }, [tabs, s.goi])

  // Phân hệ Báo cáo chỉ có 1 tab "Tất cả báo cáo": ẩn thanh tab (T58)
  if (mod.key === 'bao-cao' && tabs.length <= 1) return null

  // Không đủ chỗ: giữ tab đang mở, lấy thêm các tab đầu tới khi hết chỗ, còn lại dồn vào "Khác"
  let hien = giua
  if (do_ && do_.w.length === giua.length + (bc ? 1 : 0)) {
    const wG = do_.w.slice(0, giua.length)
    const cho = do_.W - (bc ? do_.w[giua.length] : 0)
    if (wG.reduce((a, x) => a + x, 0) > cho) {
      const ia = giua.findIndex(t => t.slug === active)
      const chon = new Set<number>(ia >= 0 ? [ia] : [])
      let dung = ia >= 0 ? wG[ia] : 0
      for (let i = 0; i < giua.length; i++) {
        if (i === ia) continue
        if (dung + wG[i] > cho - KHAC) break
        dung += wG[i]
        chon.add(i)
      }
      hien = giua.filter((_, i) => chon.has(i))
    }
  }
  const khac = giua.filter(t => !hien.includes(t))

  const tab = (sc: ScreenDef) => {
    const ok = moDuoc(sc, s.goi)
    return (
      <Link key={sc.slug} to={duongDan(mod, sc)} className={`${sc.slug === active ? 'on' : ''} ${ok ? '' : 'lock'}`}
        title={ok ? undefined : `Có ở gói ${GOI[minGoi(maKhoa(sc)!)].ten}`}>
        {sc.kind === 'quytrinh' && <Icon n="flow" className="ic sm" />}
        {nhanTab(sc)}
        {!ok && <Icon n="lock" className="ic sm" />}
      </Link>
    )
  }

  return (
    <div className="mtabs" aria-label={`Màn hình ${mod.ten}`}>
      <div className="mtabs-in" ref={wrap}>
        {hien.map(tab)}
        {khac.length > 0 && (
          <Dropdown btnClass="mtabs-more" popClass="pop-khac" align="end" keep label={<>Khác<span className="mtabs-n">{khac.length}</span><Icon n="chevd" className="ic sm" /></>}>
            {khac.map(sc => {
              const ok = moDuoc(sc, s.goi)
              const ma = maKhoa(sc)
              return (
                <MenuItem key={sc.slug} to={duongDan(mod, sc)} icon={sc.icon ?? (sc.kind === 'voucher' ? 'doc' : sc.kind === 'catalog' ? 'folder' : sc.kind === 'tool' ? 'play' : mod.icon)}
                  lock={!ok} right={!ok && ma ? <Pk g={minGoi(ma)} o /> : undefined}>{nhanTab(sc)}</MenuItem>
              )
            })}
          </Dropdown>
        )}
        {bc && tab(bc)}
      </div>
      <div className="mtabs-meas" ref={meas} aria-hidden>
        {[...giua, ...(bc ? [bc] : [])].map(sc => (
          <span key={sc.slug}>{sc.kind === 'quytrinh' && <Icon n="flow" className="ic sm" />}{nhanTab(sc)}{!moDuoc(sc, s.goi) && <Icon n="lock" className="ic sm" />}</span>
        ))}
      </div>
    </div>
  )
}
