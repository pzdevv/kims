import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="text-center z-10 px-6 animate-fade-in">
        {/* Large 404 */}
        <h1 className="text-[10rem] md:text-[14rem] font-bold leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-slate-400/80 via-slate-500/50 to-slate-700/30 select-none">
          404
        </h1>

        {/* School-themed message */}
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 -mt-4">
          Lost in the Corridors?
        </h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
          The page you are looking for seems to have vanished or moved to a
          different classroom. Let's get you back on track.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            className="min-w-[140px] bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-500 transition-all duration-200"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            GO BACK
          </Button>
          <Button
            className="min-w-[140px] bg-primary hover:bg-primary/90 text-white transition-all duration-200"
            asChild
          >
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              RETURN HOME
            </Link>
          </Button>
        </div>

        {/* Footer text */}
        <p className="text-slate-600 text-xs uppercase tracking-widest mt-16">
          Kavya School · Inventory Portal
        </p>
      </div>
    </div>
  );
};

export default NotFound;
