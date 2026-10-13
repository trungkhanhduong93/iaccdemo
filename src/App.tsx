import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider } from './app/session'
import { KhungApp } from './app/KhungApp'
import { HomeRedirect, NotFound, ScreenRoute } from './app/Screen'
import { Login, QuenMatKhau } from './modules/auth/Login'
import { ChonDonVi } from './modules/auth/ChonDonVi'
import { KhoiTao } from './modules/onboarding/KhoiTao'
import { KhoiTaoFabi } from './modules/onboarding/KhoiTaoFabi'
import { useLaMobile } from './ui/mobile/useLaMobile'
import { MChiMayTinh } from './ui/mobile/MChiMayTinh'

function RouteTamMobile() {
  const laMobile = useLaMobile()
  return laMobile ? <MChiMayTinh /> : <Navigate to="/app" replace />
}

export default function App() {
  return (
    <SessionProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dang-nhap" replace />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/quen-mat-khau" element={<QuenMatKhau />} />
          <Route path="/chon-don-vi" element={<ChonDonVi />} />
          <Route path="/khoi-tao" element={<KhoiTao />} />
          <Route path="/khoi-tao-fabi" element={<KhoiTaoFabi />} />
          <Route path="/app" element={<KhungApp />}>
            <Route index element={<HomeRedirect />} />
            <Route path="nghiep-vu" element={<RouteTamMobile />} />
            <Route path="khac" element={<RouteTamMobile />} />
            <Route path=":mod" element={<ScreenRoute />} />
            <Route path=":mod/:slug" element={<ScreenRoute />} />
            <Route path=":mod/:slug/:id" element={<ScreenRoute />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<Navigate to="/dang-nhap" replace />} />
        </Routes>
      </HashRouter>
    </SessionProvider>
  )
}
