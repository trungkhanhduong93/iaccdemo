// Báo cáo ở tab Báo cáo của một phân hệ (T384, T385): nhóm báo cáo của phân hệ, cộng mọi báo cáo sơ đồ Quy trình của phân hệ nhắc tới
// theo đúng kiểu sơ đồ của gói đang dùng, kể cả báo cáo của phân hệ khác (vd Mua hàng gói Free có Báo cáo xuất nhập tồn của Kho)
import type { ModuleDef, NutQT, QuyTrinhDef, ScreenDef } from '../types'
import type { Session } from '../../app/session'
import type { Goi } from '../../app/plan'
import { MODULES, dich, laBaoCao, vaoBaoCao } from '../../app/registry'
import { layNhomBaoCao } from './TrungTam'

/** Đích các ô của sơ đồ Quy trình đang hiện ở gói (cùng cách chọn sơ đồ của QuyTrinhScreen) và khung Báo cáo bên phải */
function diQuyTrinh(qt: QuyTrinhDef, goi: Goi): string[] {
  const lay = (ds?: { di?: string }[]) => (ds ?? []).map(n => n.di).filter((d): d is string => Boolean(d))
  const f = goi === 'S'
  const khung = (f && qt.baoCaoFree ? qt.baoCaoFree : qt.baoCao) ?? []
  if (f && qt.buocKyFree) return [...qt.buocKyFree.flatMap(b => lay(b.nut)), ...khung]
  if (f && qt.luongFree) return [...qt.luongFree.flatMap(c => lay(c.nut)), ...khung]
  const hoiTu = f && qt.hoiTuFree ? qt.hoiTuFree : qt.hoiTu
  const ra = f && qt.raFree ? qt.raFree : hoiTu?.ra
  return [
    ...qt.buoc.flatMap(b => lay([b.chinh, ...(b.tren ?? []), ...(b.duoi ?? [])] as NutQT[])),
    ...(hoiTu ? [...hoiTu.lan.flatMap(l => lay(l.nut)), ...lay(ra?.nut)] : []),
    ...khung,
  ]
}

/** Bản sao báo cáo (có goc là phân hệ gốc) hiện ở tab Báo cáo của phân hệ mod, không trùng */
export function baoCaoCuaPhanHe(mod: ModuleDef, s: Session): ScreenDef[] {
  const banSao = MODULES.find(m => m.key === 'bao-cao')?.screens.filter(x => x.goc) ?? []
  const nhom = layNhomBaoCao(s).find(g => g.mod.key === mod.key)?.screens ?? []
  const quyTrinh = mod.quyTrinh ? diQuyTrinh(mod.quyTrinh, s.goi).flatMap(di => {
    const { mod: m, sc } = dich(di, mod.key)
    if (!m || !sc || !(laBaoCao(sc) || vaoBaoCao(sc))) return []
    const x = banSao.find(b => b.goc === m.key && b.slug === sc.slug)
    return x ? [x] : []
  }) : []
  const ds: ScreenDef[] = []
  for (const x of [...nhom, ...quyTrinh]) if (!ds.some(y => y.goc === x.goc && y.slug === x.slug)) ds.push(x)
  return ds
}
