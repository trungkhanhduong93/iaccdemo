import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SessionProvider } from './app/session'
import { Shell } from './app/Shell'
import { HomeRedirect, NotFound, ScreenRoute } from './app/Screen'
import { Login, QuenMatKhau } from './modules/auth/Login'
import { ChonDonVi } from './modules/auth/ChonDonVi'
import { KhoiTao } from './modules/onboarding/KhoiTao'

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
          <Route path="/app" element={<Shell />}>
            <Route index element={<HomeRedirect />} />
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
