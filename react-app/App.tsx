import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import ShoppingListPage from "./pages/ShoppingList";
import AuthPage from "./pages/Auth";
import { SupabaseProvider } from "./components/SupabaseProvider";
import { ProtectedRoute } from "./components/auth";
import { OrientationProvider } from "./contexts/OrientationContext";
import LoadingDebug from "./components/LoadingDebug";
import { AdvancedDebug } from "./components/AdvancedDebug";

export default function App() {
  return (
    <SupabaseProvider>
      <LoadingDebug />
      <AdvancedDebug />
      <OrientationProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/list/:id" element={
              <ProtectedRoute>
                <ShoppingListPage />
              </ProtectedRoute>
            } />
            <Route path="/demo" element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-4 flex items-center justify-center">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-2xl">
                    <h1 className="text-3xl font-bold text-white mb-4">Demonstrações</h1>
                    <p className="text-white/90 mb-6">
                      Esta é uma página de demonstração do aplicativo responsivo.
                      O sistema está funcionando corretamente com autenticação Supabase!
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-xl p-4">
                        <h3 className="text-white font-semibold mb-2">✅ Autenticação</h3>
                        <p className="text-white/70 text-sm">Login/logout funcionando</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4">
                        <h3 className="text-white font-semibold mb-2">✅ Responsivo</h3>
                        <p className="text-white/70 text-sm">Adaptado para todos os dispositivos</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4">
                        <h3 className="text-white font-semibold mb-2">✅ Supabase</h3>
                        <p className="text-white/70 text-sm">Banco de dados configurado</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4">
                        <h3 className="text-white font-semibold mb-2">✅ Design</h3>
                        <p className="text-white/70 text-sm">Interface moderna e intuitiva</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/forgot-password" element={<AuthPage />} />
            <Route path="/reset-password" element={<AuthPage />} />
          </Routes>
        </Router>
      </OrientationProvider>
    </SupabaseProvider>
  );
}
