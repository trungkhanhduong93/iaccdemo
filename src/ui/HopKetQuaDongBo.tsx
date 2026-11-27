import { ThongBao, type LoaiThongBao } from './ThongBao'

export interface KetQuaHop {
  loai: 'ok' | 'motPhan' | 'loi'
  tieuDe: string
  dong: string
  chiTiet?: string[]
  thongTin?: [string, string][]
  nutChinh?: { ten: string; onClick: () => void }
}

const CAU_HINH: Record<KetQuaHop['loai'], { loai: LoaiThongBao; nhan: string; hinh?: 'loi' }> = {
  ok: { loai: 'xong', nhan: 'Đồng bộ xong' },
  motPhan: { loai: 'canhBao', nhan: 'Cần xem lại' },
  loi: { loai: 'chan', nhan: 'Chưa đồng bộ được', hinh: 'loi' },
}

export function HopKetQuaDongBo({ kq, onDong }: { kq: KetQuaHop; onDong: () => void }) {
  const ch = CAU_HINH[kq.loai]
  const moTa = kq.chiTiet?.length ? (
    <>
      {kq.dong}
      <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
        {kq.chiTiet.map((dong, i) => <li key={i}>{dong}</li>)}
      </ul>
    </>
  ) : kq.dong

  return (
    <ThongBao
      loai={ch.loai}
      nhan={ch.nhan}
      hinh={ch.hinh}
      tieuDe={kq.tieuDe}
      moTa={moTa}
      duKien={kq.thongTin?.map(([nhan, gt]) => ({ nhan, gt }))}
      nut={kq.nutChinh}
      nutPhu="Đóng"
      onDong={onDong}
    />
  )
}
