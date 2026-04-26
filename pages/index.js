import { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  Heart, MessageCircle, Send, Plus, Home, User as UserIcon, Bell, LogOut,
  X, ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, Image as ImageIcon,
  Earth, Users, MessageSquare, ThumbsUp, Camera, Settings, MoreHorizontal,
  Search, UserPlus, Trash2, Moon, Sun, BarChart3, Check, Link as LinkIcon
} from "lucide-react";
import { auth, db, googleProvider } from "../lib/firebase";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signInWithPopup, signOut, onAuthStateChanged, sendPasswordResetEmail
} from "firebase/auth";
import {
  collection, doc, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp, arrayUnion,
  arrayRemove, increment
} from "firebase/firestore";

const PLAYVO_LOGO = "data:image/png;base64,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";

// ====== Theme tokens (Facebook + Playvo) ======
const T = {
  // gradients & accents
  brandGrad: "from-blue-500 via-fuchsia-500 to-orange-500",
  brandText: "from-blue-600 via-fuchsia-500 to-orange-500",
  primaryBtn: "from-fuchsia-500 via-pink-500 to-orange-500",
  fbBlue: "bg-blue-500",
  fbBlueHover: "hover:bg-blue-600",
};

// ====== Helpers ======
const fmtTime = (ts) => {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "เมื่อกี้";
  if (diff < 3600) return Math.floor(diff / 60) + " น.";
  if (diff < 86400) return Math.floor(diff / 3600) + " ชม.";
  if (diff < 604800) return Math.floor(diff / 86400) + " วัน";
  return d.toLocaleDateString("th-TH");
};
const formatNum = (n) => {
  if (!n) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
};
const REACTIONS = [
  { type: "like", emoji: "👍", color: "text-blue-500", label: "ถูกใจ" },
  { type: "love", emoji: "❤️", color: "text-red-500", label: "รักเลย" },
  { type: "haha", emoji: "😂", color: "text-amber-500", label: "ฮ่าฮ่า" },
  { type: "wow", emoji: "😮", color: "text-amber-500", label: "ว้าว" },
  { type: "sad", emoji: "😢", color: "text-amber-500", label: "เศร้า" },
  { type: "angry", emoji: "😡", color: "text-orange-600", label: "โกรธ" },
];

// 60+ Avatar options
const AVATAR_EMOJIS = [
  "🐻","🦊","🐼","🦁","🐯","🐨","🐸","🦄","🐙","🦋","🌟","🔥",
  "🐶","🐱","🐭","🐹","🐰","🦝","🐻‍❄️","🐮","🐷","🐵","🙈","🐔",
  "🐧","🐦","🐤","🦅","🦆","🦢","🦉","🦇","🐺","🐗","🐴","🦓",
  "🦒","🐘","🦏","🐪","🦘","🐢","🐍","🦎","🐊","🐳","🐬","🐠",
  "🦈","🐙","🦀","🦞","🦂","🕷️","🦗","🐝","🐞","🌈","⭐","✨",
];

// ====== Auth Context ======
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("playvo-theme");
      if (saved === "dark") setThemeState("dark");
    }
  }, []);

  const setTheme = (t) => {
    setThemeState(t);
    if (typeof window !== "undefined") localStorage.setItem("playvo-theme", t);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setProfile({ id: u.uid, ...snap.data() });
        } else {
          const newProfile = {
            email: u.email,
            displayName: u.displayName || u.email.split("@")[0],
            username: (u.email.split("@")[0] || "user").toLowerCase().replace(/[^a-z0-9_]/g, ""),
            avatar: AVATAR_EMOJIS[Math.floor(Math.random() * AVATAR_EMOJIS.length)],
            avatarUrl: "",
            bio: "ยินดีต้อนรับสู่ Playvo!",
            createdAt: serverTimestamp(),
          };
          await setDoc(ref, newProfile);
          setProfile({ id: u.uid, ...newProfile });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthCtx.Provider value={{ user, profile, setProfile, loading, theme, setTheme }}>
      {children}
    </AuthCtx.Provider>
  );
}

// ====== Avatar Component (handles emoji + URL) ======
function Avatar({ user, size = "md", onClick }) {
  const sizes = { xs: "w-7 h-7 text-sm", sm: "w-8 h-8 text-base", md: "w-11 h-11 text-2xl", lg: "w-14 h-14 text-2xl", xl: "w-28 h-28 text-6xl" };
  const cls = sizes[size] || sizes.md;
  const inner = user?.avatarUrl ? (
    <img src={user.avatarUrl} alt="" className={`${cls} rounded-full object-cover shadow-md`} />
  ) : (
    <div className={`${cls} rounded-full bg-gradient-to-br from-blue-500 via-fuchsia-500 to-orange-500 flex items-center justify-center shadow-md`}>
      {user?.avatar || "🐻"}
    </div>
  );
  return onClick ? <button onClick={onClick} className="shrink-0">{inner}</button> : <div className="shrink-0">{inner}</div>;
}

// ====== Toast ======
const ToastCtx = createContext(null);
const useToast = () => useContext(ToastCtx);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const show = (text) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  };
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="fixed top-20 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
        {toasts.map((t) => (
          <div key={t.id} className="bg-slate-800/95 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 text-sm text-white shadow-2xl animate-slideup max-w-sm">
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ====== Confirm Dialog ======
const ConfirmCtx = createContext(null);
const useConfirm = () => useContext(ConfirmCtx);
function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const ask = (text) => new Promise((resolve) => setState({ text, resolve }));
  const close = (val) => { state?.resolve(val); setState(null); };
  return (
    <ConfirmCtx.Provider value={ask}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4" onClick={() => close(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full">
            <p className="text-slate-800 dark:text-slate-100">{state.text}</p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => close(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 dark:text-slate-200 font-semibold">ยกเลิก</button>
              <button onClick={() => close(true)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold">ยืนยัน</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}

// ====== Auth Screen ======
function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const toast = useToast();

  const tErr = (code) => ({
    "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง",
    "auth/user-not-found": "ไม่พบบัญชีนี้",
    "auth/wrong-password": "รหัสผ่านไม่ถูกต้อง",
    "auth/invalid-credential": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth/email-already-in-use": "อีเมลนี้ถูกใช้แล้ว",
    "auth/weak-password": "รหัสผ่านอ่อนเกินไป (อย่างน้อย 6 ตัว)",
    "auth/popup-closed-by-user": "ยกเลิกการเข้าสู่ระบบ",
    "auth/network-request-failed": "ปัญหาเครือข่าย กรุณาลองใหม่",
  })[code] || "เกิดข้อผิดพลาด: " + code;

  const handleLogin = async (e) => {
    e?.preventDefault();
    setErr(""); setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast("ยินดีต้อนรับ! 🎉");
    } catch (e) { setErr(tErr(e.code)); }
    setBusy(false);
  };
  const handleSignup = async (e) => {
    e?.preventDefault();
    setErr("");
    if (password !== confirm) { setErr("รหัสผ่านไม่ตรงกัน"); return; }
    if (password.length < 6) { setErr("รหัสผ่านอย่างน้อย 6 ตัวอักษร"); return; }
    setBusy(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast("สมัครสำเร็จ! 🎉");
    } catch (e) { setErr(tErr(e.code)); }
    setBusy(false);
  };
  const handleGoogle = async () => {
    setBusy(true); setErr("");
    try {
      await signInWithPopup(auth, googleProvider);
      toast("เข้าสู่ระบบสำเร็จ");
    } catch (e) { setErr(tErr(e.code)); }
    setBusy(false);
  };
  const handleForgot = async () => {
    setErr(""); setInfo("");
    if (!email) { setErr("กรุณาใส่อีเมล"); return; }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo("ส่งลิงก์รีเซ็ตไปยังอีเมลแล้ว ✓ (ตรวจ Spam ด้วยนะ)");
    } catch (e) { setErr(tErr(e.code)); }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-orange-300 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-fuchsia-300 rounded-full filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-2xl bg-white/80 border border-white shadow-2xl shadow-blue-500/10 rounded-3xl p-8">
          <div className="text-center mb-6">
            <img src={PLAYVO_LOGO} alt="Playvo" className="w-28 h-28 mx-auto drop-shadow-xl" />
            <p className="text-xs text-slate-500 mt-1 tracking-[0.3em] uppercase font-semibold">Play Every Moment</p>
          </div>

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-800 text-center">เข้าสู่ระบบ</h2>
              <Input icon={Mail} value={email} onChange={setEmail} placeholder="อีเมล" type="email" />
              <Input icon={Lock} value={password} onChange={setPassword} placeholder="รหัสผ่าน" type={showPass ? "text" : "password"} rightIcon={showPass ? EyeOff : Eye} onRightClick={() => setShowPass(!showPass)} />
              {err && <p className="text-rose-500 text-sm">{err}</p>}
              <button type="button" onClick={() => { setMode("forgot"); setErr(""); setInfo(""); }} className="text-xs text-slate-500 hover:text-slate-700">ลืมรหัสผ่าน?</button>
              <PrimaryBtn busy={busy}>เข้าสู่ระบบ</PrimaryBtn>
              <OrDivider />
              <GoogleBtn onClick={handleGoogle} busy={busy} />
              <p className="text-center text-sm text-slate-600 pt-2">
                ยังไม่มีบัญชี? <button type="button" onClick={() => { setMode("signup"); setErr(""); }} className="text-blue-600 font-semibold">สมัครสมาชิก</button>
              </p>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-800 text-center">สร้างบัญชี</h2>
              <Input icon={Mail} value={email} onChange={setEmail} placeholder="อีเมล" type="email" />
              <Input icon={Lock} value={password} onChange={setPassword} placeholder="รหัสผ่าน (6+ ตัว)" type={showPass ? "text" : "password"} rightIcon={showPass ? EyeOff : Eye} onRightClick={() => setShowPass(!showPass)} />
              <Input icon={Lock} value={confirm} onChange={setConfirm} placeholder="ยืนยันรหัสผ่าน" type={showPass ? "text" : "password"} />
              {err && <p className="text-rose-500 text-sm">{err}</p>}
              <PrimaryBtn busy={busy}>สมัครสมาชิก</PrimaryBtn>
              <OrDivider />
              <GoogleBtn onClick={handleGoogle} busy={busy} />
              <p className="text-center text-sm text-slate-600 pt-2">
                มีบัญชีแล้ว? <button type="button" onClick={() => { setMode("login"); setErr(""); }} className="text-blue-600 font-semibold">เข้าสู่ระบบ</button>
              </p>
            </form>
          )}

          {mode === "forgot" && (
            <div className="space-y-3">
              <button onClick={() => { setMode("login"); setErr(""); setInfo(""); }} className="flex items-center gap-1 text-slate-500 text-sm">
                <ArrowLeft className="w-4 h-4" /> กลับ
              </button>
              <h2 className="text-2xl font-bold text-slate-800">รีเซ็ตรหัสผ่าน</h2>
              <p className="text-slate-600 text-sm">กรอกอีเมลของคุณ เราจะส่งลิงก์รีเซ็ตให้</p>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">⚠️ ถ้าไม่เจอเมล ตรวจในกล่อง Spam หรือ Promotions ด้วยนะครับ</p>
              <Input icon={Mail} value={email} onChange={setEmail} placeholder="อีเมล" type="email" />
              {err && <p className="text-rose-500 text-sm">{err}</p>}
              {info && <p className="text-emerald-600 text-sm bg-emerald-50 border border-emerald-200 rounded-lg p-2">{info}</p>}
              <PrimaryBtn busy={busy} onClick={handleForgot}>ส่งลิงก์รีเซ็ต</PrimaryBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ icon: Icon, value, onChange, placeholder, type = "text", rightIcon: RIcon, onRightClick }) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-12 pr-12 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 transition shadow-sm" />
      {RIcon && <button type="button" onClick={onRightClick} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><RIcon className="w-5 h-5" /></button>}
    </div>
  );
}
function PrimaryBtn({ children, busy, onClick }) {
  return (
    <button type="submit" onClick={onClick} disabled={busy}
      className="w-full bg-gradient-to-r from-blue-500 via-fuchsia-500 to-orange-500 text-white font-bold py-3 rounded-2xl shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2">
      {busy && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}
function OrDivider() {
  return <div className="flex items-center gap-3 my-1"><div className="flex-1 h-px bg-slate-200" /><span className="text-xs text-slate-400">หรือ</span><div className="flex-1 h-px bg-slate-200" /></div>;
}
function GoogleBtn({ onClick, busy }) {
  return (
    <button type="button" onClick={onClick} disabled={busy}
      className="w-full bg-white text-slate-700 font-semibold py-3 rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 border-2 border-slate-200 shadow-sm hover:bg-slate-50">
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      เข้าสู่ระบบด้วย Google
    </button>
  );
}

// ====== Main App ======
function MainApp() {
  const { profile, theme } = useAuth();
  const [page, setPage] = useState("feed");
  const [profileUid, setProfileUid] = useState(null);
  const [chatUid, setChatUid] = useState(null);

  const goProfile = (uid) => { setProfileUid(uid); setPage("profile"); };
  const goChat = (uid) => { setChatUid(uid); setPage("chat"); };

  const dark = theme === "dark";
  const bgClass = dark ? "bg-slate-900" : "bg-gradient-to-b from-blue-50 via-white to-orange-50";

  return (
    <div className={`h-screen w-full max-w-md mx-auto ${bgClass} relative overflow-hidden flex flex-col ${dark ? "dark" : ""}`}>
      <div className="flex-1 overflow-hidden">
        {page === "feed" && <FeedPage onProfile={goProfile} onChat={goChat} onNotifications={() => setPage("notifications")} onMessages={() => setPage("messages")} onFriends={() => setPage("friends")} />}
        {page === "friends" && <FriendsPage onBack={() => setPage("feed")} onProfile={goProfile} onChat={goChat} />}
        {page === "messages" && <MessagesPage onBack={() => setPage("feed")} onChat={goChat} />}
        {page === "chat" && <ChatPage uid={chatUid} onBack={() => setPage("messages")} />}
        {page === "notifications" && <NotificationsPage onBack={() => setPage("feed")} />}
        {page === "profile" && <ProfilePage uid={profileUid || profile.id} onBack={profileUid && profileUid !== profile.id ? () => { setProfileUid(null); setPage("feed"); } : null} onSettings={() => setPage("settings")} onProfile={goProfile} />}
        {page === "settings" && <SettingsPage onBack={() => setPage("profile")} />}
      </div>

      {!["chat", "settings"].includes(page) && (
        <div className={`${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} border-t shadow-lg`}>
          <div className="flex items-center justify-around py-2">
            <NavBtn icon={Home} label="หน้าแรก" active={page === "feed"} onClick={() => setPage("feed")} />
            <NavBtn icon={Users} label="เพื่อน" active={page === "friends"} onClick={() => setPage("friends")} />
            <NavBtn icon={MessageSquare} label="ข้อความ" active={page === "messages"} onClick={() => setPage("messages")} />
            <NavBtn icon={Bell} label="แจ้งเตือน" active={page === "notifications"} onClick={() => setPage("notifications")} />
            <NavBtn icon={UserIcon} label="โปรไฟล์" active={page === "profile" && (!profileUid || profileUid === profile.id)} onClick={() => { setProfileUid(profile.id); setPage("profile"); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick }) {
  const { theme } = useAuth();
  const dark = theme === "dark";
  const inactiveColor = dark ? "text-slate-500" : "text-slate-400";
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 px-3 py-1">
      <Icon className={`w-6 h-6 ${active ? "text-blue-500" : inactiveColor}`} fill={active ? "currentColor" : "none"} />
      <span className={`text-[10px] ${active ? "text-blue-500 font-semibold" : inactiveColor}`}>{label}</span>
    </button>
  );
}

// ====== Feed Page ======
function FeedPage({ onProfile, onChat, onNotifications, onMessages, onFriends }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-slate-900 text-slate-100" : "bg-gradient-to-b from-blue-50 via-white to-orange-50 text-slate-800"}`}>
      <div className={`sticky top-0 z-10 backdrop-blur-xl border-b ${dark ? "bg-slate-800/80 border-slate-700" : "bg-white/80 border-slate-200"}`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <img src={PLAYVO_LOGO} alt="Playvo" className="w-9 h-9" />
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent">Playvo</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={onFriends} className={`w-10 h-10 rounded-full ${dark ? "bg-slate-700" : "bg-slate-100"} flex items-center justify-center`}><Users className="w-5 h-5" /></button>
            <button onClick={onMessages} className={`w-10 h-10 rounded-full ${dark ? "bg-slate-700" : "bg-slate-100"} flex items-center justify-center`}><MessageSquare className="w-5 h-5" /></button>
            <button onClick={onNotifications} className={`w-10 h-10 rounded-full ${dark ? "bg-slate-700" : "bg-slate-100"} flex items-center justify-center`}><Bell className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <button onClick={() => setShowComposer(true)} className={`mx-3 mt-3 w-[calc(100%-1.5rem)] flex items-center gap-3 p-3 rounded-2xl border shadow-sm ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <Avatar user={profile} size="md" />
        <span className={`text-sm flex-1 text-left ${dark ? "text-slate-400" : "text-slate-500"}`}>คุณกำลังคิดอะไรอยู่?</span>
        <ImageIcon className="w-5 h-5 text-emerald-500" />
      </button>

      <div className="space-y-3 mt-3 pb-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : posts.length === 0 ? (
          <div className={`text-center py-16 ${dark ? "text-slate-500" : "text-slate-400"}`}>ยังไม่มีโพสต์ — เป็นคนแรกที่โพสต์เลยสิ! 🎉</div>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} onProfile={onProfile} />)
        )}
      </div>

      {showComposer && <PostComposer onClose={() => setShowComposer(false)} />}
    </div>
  );
}

// ====== Post Card ======
function PostCard({ post, onProfile }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const toast = useToast();
  const confirm = useConfirm();
  const [author, setAuthor] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    getDoc(doc(db, "users", post.userId)).then((snap) => {
      if (snap.exists()) setAuthor({ id: snap.id, ...snap.data() });
    });
  }, [post.userId]);

  useEffect(() => {
    if (!showComments) return;
    const q = query(collection(db, "posts", post.id, "comments"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [showComments, post.id]);

  const myReaction = post.reactions?.[profile.id];
  const myReactionData = REACTIONS.find((r) => r.type === myReaction);
  const reactionCounts = post.reactions || {};
  const totalReactions = Object.values(reactionCounts).filter(Boolean).length;
  const topEmojis = [...new Set(Object.values(reactionCounts).filter(Boolean))].slice(0, 3).map((t) => REACTIONS.find((r) => r.type === t)).filter(Boolean);

  const react = async (type) => {
    setShowReactions(false);
    const ref = doc(db, "posts", post.id);
    if (myReaction === type) {
      await updateDoc(ref, { [`reactions.${profile.id}`]: null });
    } else {
      await updateDoc(ref, { [`reactions.${profile.id}`]: type });
    }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    await addDoc(collection(db, "posts", post.id, "comments"), {
      text: commentText.trim(),
      userId: profile.id,
      userAvatar: profile.avatar,
      userAvatarUrl: profile.avatarUrl || "",
      userName: profile.displayName,
      createdAt: serverTimestamp(),
      reactions: {},
    });
    await updateDoc(doc(db, "posts", post.id), { commentsCount: increment(1) });
    setCommentText("");
  };

  const deletePost = async () => {
    setShowMenu(false);
    if (!(await confirm("ลบโพสต์นี้? (ลบแล้วเรียกคืนไม่ได้)"))) return;
    await deleteDoc(doc(db, "posts", post.id));
    toast("ลบโพสต์แล้ว ✓");
  };

  const isMyPost = post.userId === profile.id;

  if (!author) return null;

  const cardBg = dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`${cardBg} border mx-3 rounded-2xl overflow-hidden shadow-sm`}>
      <div className="flex items-center gap-3 p-3">
        <Avatar user={author} size="md" onClick={() => onProfile(post.userId)} />
        <div className="flex-1 min-w-0">
          <button onClick={() => onProfile(post.userId)} className={`font-semibold text-sm ${textPrimary}`}>{author.displayName}</button>
          <div className={`flex items-center gap-1.5 text-[11px] ${textSecondary}`}><span>{fmtTime(post.createdAt)}</span><span>·</span><Earth className="w-3 h-3" /></div>
        </div>
        {isMyPost && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}><MoreHorizontal className={`w-5 h-5 ${textSecondary}`} /></button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className={`absolute right-0 top-7 z-40 ${cardBg} border rounded-xl shadow-xl py-1 w-32`}>
                  <button onClick={deletePost} className="w-full px-3 py-2 text-sm text-left text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> ลบโพสต์
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {post.text && <p className={`px-3 pb-3 text-[15px] whitespace-pre-line ${textPrimary}`}>{post.text}</p>}
      {post.image && <img src={post.image} alt="" className="w-full max-h-[500px] object-cover" loading="lazy" />}

      {(totalReactions > 0 || (post.commentsCount || 0) > 0) && (
        <div className={`flex items-center justify-between px-3 py-2 text-xs ${textSecondary}`}>
          {totalReactions > 0 && <div className="flex items-center gap-1"><div className="flex -space-x-1">{topEmojis.map((r) => <div key={r.type} className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${dark ? "bg-slate-700 border-slate-800" : "bg-white border-slate-200"}`}>{r.emoji}</div>)}</div><span className="ml-1">{totalReactions}</span></div>}
          {(post.commentsCount || 0) > 0 && <span>{post.commentsCount} ความคิดเห็น</span>}
        </div>
      )}

      <div className={`flex border-t ${dark ? "border-slate-700" : "border-slate-100"} relative`}>
        <div className="flex-1 relative" onMouseEnter={() => setShowReactions(true)} onMouseLeave={() => setShowReactions(false)}>
          <button onClick={() => react(myReaction || "like")} onTouchStart={(e) => { e.preventDefault(); setShowReactions(true); }} className={`w-full flex items-center justify-center gap-2 py-2.5 ${myReactionData ? myReactionData.color : textSecondary}`}>
            {myReactionData ? <span className="text-lg">{myReactionData.emoji}</span> : <ThumbsUp className="w-5 h-5" />}
            <span className="text-sm font-semibold">{myReactionData ? myReactionData.label : "ถูกใจ"}</span>
          </button>
          {showReactions && (
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${cardBg} rounded-full px-2 py-1.5 flex gap-1 shadow-2xl border animate-slideup z-30`}>
              {REACTIONS.map((r) => <button key={r.type} onClick={() => react(r.type)} className="text-2xl hover:scale-125 transition transform">{r.emoji}</button>)}
            </div>
          )}
        </div>
        <button onClick={() => setShowComments(!showComments)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 ${textSecondary}`}>
          <MessageCircle className="w-5 h-5" /><span className="text-sm font-semibold">คอมเมนต์</span>
        </button>
      </div>

      {showComments && (
        <div className={`border-t p-3 space-y-3 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-100 bg-slate-50"}`}>
          {comments.map((c) => <CommentItem key={c.id} comment={c} postId={post.id} dark={dark} />)}
          <div className="flex gap-2 items-center">
            <Avatar user={profile} size="sm" />
            <div className={`flex-1 flex items-center rounded-full px-3 py-1.5 ${dark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}`}>
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitComment()} placeholder="แสดงความคิดเห็น..." className={`flex-1 bg-transparent text-sm focus:outline-none ${textPrimary}`} />
              <button onClick={submitComment} disabled={!commentText.trim()} className="text-blue-500 disabled:text-slate-300"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ====== Comment Item (with reactions + delete) ======
function CommentItem({ comment, postId, dark }) {
  const { profile } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const [showReactPicker, setShowReactPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const myReaction = comment.reactions?.[profile.id];
  const reactionList = Object.values(comment.reactions || {}).filter(Boolean);
  const reactionCount = reactionList.length;
  const topEmoji = REACTIONS.find((r) => r.type === reactionList[0])?.emoji || "👍";

  const react = async (type) => {
    setShowReactPicker(false);
    const ref = doc(db, "posts", postId, "comments", comment.id);
    if (myReaction === type) {
      await updateDoc(ref, { [`reactions.${profile.id}`]: null });
    } else {
      await updateDoc(ref, { [`reactions.${profile.id}`]: type });
    }
  };

  const deleteCom = async () => {
    setShowMenu(false);
    if (!(await confirm("ลบคอมเมนต์นี้?"))) return;
    await deleteDoc(doc(db, "posts", postId, "comments", comment.id));
    await updateDoc(doc(db, "posts", postId), { commentsCount: increment(-1) });
    toast("ลบแล้ว ✓");
  };

  const isMine = comment.userId === profile.id;
  const fakeUser = { avatar: comment.userAvatar, avatarUrl: comment.userAvatarUrl };
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";

  return (
    <div className="flex gap-2 group">
      <Avatar user={fakeUser} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="relative inline-block">
          <div className={`rounded-2xl px-3 py-2 border inline-block ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
            <p className={`text-xs font-semibold ${textPrimary}`}>{comment.userName}</p>
            <p className={`text-sm ${textPrimary}`}>{comment.text}</p>
          </div>
          {reactionCount > 0 && (
            <div className={`absolute -bottom-2 -right-1 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 shadow border text-[10px] ${dark ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"}`}>
              <span>{topEmoji}</span>
              <span className={dark ? "text-slate-300" : "text-slate-600"}>{reactionCount}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 ml-3 mt-1.5 text-[10px]">
          <span className={dark ? "text-slate-500" : "text-slate-400"}>{fmtTime(comment.createdAt)}</span>
          <div className="relative" onMouseEnter={() => setShowReactPicker(true)} onMouseLeave={() => setShowReactPicker(false)}>
            <button onClick={() => react(myReaction || "like")} onTouchStart={(e) => { e.preventDefault(); setShowReactPicker(true); }} className={`font-semibold ${myReaction ? "text-blue-500" : dark ? "text-slate-400" : "text-slate-500"}`}>
              {myReaction ? REACTIONS.find((r) => r.type === myReaction)?.label : "ถูกใจ"}
            </button>
            {showReactPicker && (
              <div className={`absolute bottom-full left-0 mb-1 rounded-full px-2 py-1 flex gap-1 shadow-xl border animate-slideup z-30 ${dark ? "bg-slate-700 border-slate-600" : "bg-white border-slate-200"}`}>
                {REACTIONS.map((r) => <button key={r.type} onClick={() => react(r.type)} className="text-lg hover:scale-125 transition">{r.emoji}</button>)}
              </div>
            )}
          </div>
          {isMine && (
            <button onClick={deleteCom} className="text-red-500 font-semibold opacity-0 group-hover:opacity-100 transition">ลบ</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ====== Post Composer ======
function PostComposer({ onClose }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const toast = useToast();
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const SAMPLES = [
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800",
  ];

  const submit = async () => {
    if (!text.trim() && !imageUrl) { toast("ใส่ข้อความหรือรูป"); return; }
    setBusy(true);
    await addDoc(collection(db, "posts"), {
      userId: profile.id,
      text: text.trim(),
      image: imageUrl || null,
      createdAt: serverTimestamp(),
      reactions: {},
      commentsCount: 0,
    });
    toast("โพสต์สำเร็จ! 🎉");
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${dark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}`}>
      <div className={`flex items-center justify-between p-4 border-b ${dark ? "border-slate-700" : "border-slate-200"}`}>
        <button onClick={onClose}><X className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg">สร้างโพสต์</h2>
        <button onClick={submit} disabled={busy || (!text.trim() && !imageUrl)} className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-semibold disabled:opacity-30">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "โพสต์"}
        </button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 mb-3">
          <Avatar user={profile} size="md" />
          <p className="font-semibold text-sm">{profile.displayName}</p>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="คุณกำลังคิดอะไรอยู่?" className={`w-full bg-transparent text-lg focus:outline-none resize-none min-h-[120px] ${dark ? "placeholder-slate-500" : "placeholder-slate-400"}`} autoFocus />
        {imageUrl && (
          <div className="relative rounded-2xl overflow-hidden mt-3">
            <img src={imageUrl} alt="" className="w-full max-h-80 object-cover" />
            <button onClick={() => setImageUrl("")} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        )}
        {!imageUrl && (
          <div className="mt-4">
            <p className={`text-xs mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>เลือกรูปตัวอย่าง:</p>
            <div className="grid grid-cols-4 gap-2">
              {SAMPLES.map((url) => (
                <button key={url} onClick={() => setImageUrl(url)} className={`aspect-square rounded-xl overflow-hidden ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input type="text" placeholder="หรือวาง URL รูปจากเว็บอื่น..." onChange={(e) => setImageUrl(e.target.value)} className={`w-full mt-3 px-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-blue-400 ${dark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200"}`} />
          </div>
        )}
      </div>
    </div>
  );
}

// ====== Friends Page ======
function FriendsPage({ onBack, onProfile, onChat }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const [tab, setTab] = useState("all");
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDocs(collection(db, "users")).then((snap) => {
      setAllUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.id !== profile.id));
    });
  }, [profile.id]);

  const friendIds = profile.friends || [];
  const requestIds = profile.friendRequests || [];

  const friends = allUsers.filter((u) => friendIds.includes(u.id));
  const requests = allUsers.filter((u) => requestIds.includes(u.id));
  const filtered = (tab === "all" ? allUsers : tab === "friends" ? friends : requests)
    .filter((u) => !search || u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase()));

  const textPrimary = dark ? "text-slate-100" : "text-slate-800";

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-slate-900" : "bg-gradient-to-b from-blue-50 via-white to-orange-50"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 backdrop-blur-xl p-4 flex items-center gap-3 border-b ${dark ? "bg-slate-800/80 border-slate-700" : "bg-white/80 border-slate-200"}`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg">เพื่อน</h2>
      </div>
      <div className="p-3">
        <div className="relative mb-3">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? "text-slate-500" : "text-slate-400"}`} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหา..." className={`w-full rounded-full pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 border ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`} />
        </div>
        <div className="flex gap-2 mb-3">
          {[
            { k: "all", l: "ทั้งหมด" },
            { k: "requests", l: `คำขอ (${requests.length})` },
            { k: "friends", l: `เพื่อน (${friends.length})` },
          ].map(({ k, l }) => (
            <button key={k} onClick={() => setTab(k)} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === k ? "bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white" : dark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}`}>{l}</button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map((u) => <UserRow key={u.id} user={u} myProfile={profile} onProfile={onProfile} onChat={onChat} dark={dark} />)}
          {filtered.length === 0 && <div className={`text-center py-10 text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>ไม่มีรายการ</div>}
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, myProfile, onProfile, onChat, dark }) {
  const toast = useToast();
  const isFriend = (myProfile.friends || []).includes(user.id);
  const isPending = (user.friendRequests || []).includes(myProfile.id);
  const incomingRequest = (myProfile.friendRequests || []).includes(user.id);
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  const sendReq = async () => {
    await updateDoc(doc(db, "users", user.id), { friendRequests: arrayUnion(myProfile.id) });
    toast("ส่งคำขอแล้ว ✓");
  };
  const accept = async () => {
    await updateDoc(doc(db, "users", myProfile.id), { friends: arrayUnion(user.id), friendRequests: arrayRemove(user.id) });
    await updateDoc(doc(db, "users", user.id), { friends: arrayUnion(myProfile.id) });
    toast("เพิ่มเพื่อนแล้ว 🎉");
  };
  const decline = async () => {
    await updateDoc(doc(db, "users", myProfile.id), { friendRequests: arrayRemove(user.id) });
    toast("ปฏิเสธคำขอ");
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border shadow-sm ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
      <button onClick={() => onProfile(user.id)} className="flex items-center gap-3 flex-1">
        <Avatar user={user} size="lg" />
        <div className="text-left">
          <p className={`font-semibold text-sm ${textPrimary}`}>{user.displayName}</p>
          <p className={`text-xs ${textSecondary}`}>@{user.username}</p>
        </div>
      </button>
      {isFriend ? (
        <button onClick={() => onChat(user.id)} className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><MessageSquare className="w-5 h-5" /></button>
      ) : incomingRequest ? (
        <div className="flex gap-1">
          <button onClick={accept} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white text-xs font-semibold">รับ</button>
          <button onClick={decline} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${dark ? "bg-slate-700" : "bg-slate-100"}`}>ปฏิเสธ</button>
        </div>
      ) : isPending ? (
        <span className={`text-xs px-3 ${textSecondary}`}>รอตอบรับ</span>
      ) : (
        <button onClick={sendReq} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white text-xs font-semibold"><UserPlus className="w-3 h-3" />เพิ่ม</button>
      )}
    </div>
  );
}

// ====== Messages Page ======
function MessagesPage({ onBack, onChat }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const [users, setUsers] = useState({});
  const friendIds = profile.friends || [];
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  useEffect(() => {
    if (friendIds.length === 0) return;
    Promise.all(friendIds.map((id) => getDoc(doc(db, "users", id)))).then((snaps) => {
      const map = {};
      snaps.forEach((s) => { if (s.exists()) map[s.id] = { id: s.id, ...s.data() }; });
      setUsers(map);
    });
  }, [friendIds.join(",")]);

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-slate-900" : "bg-gradient-to-b from-blue-50 via-white to-orange-50"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 backdrop-blur-xl p-4 flex items-center gap-3 border-b ${dark ? "bg-slate-800/80 border-slate-700" : "bg-white/80 border-slate-200"}`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg">ข้อความ</h2>
      </div>
      <div className="p-3 space-y-1">
        {friendIds.length === 0 && <p className={`text-center py-12 ${textSecondary}`}>ยังไม่มีเพื่อน</p>}
        {friendIds.map((id) => {
          const u = users[id];
          if (!u) return null;
          return (
            <button key={id} onClick={() => onChat(id)} className={`w-full flex items-center gap-3 p-2 rounded-2xl ${dark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}>
              <Avatar user={u} size="lg" />
              <div className="flex-1 text-left">
                <p className={`font-semibold text-sm ${textPrimary}`}>{u.displayName}</p>
                <p className={`text-xs ${textSecondary}`}>@{u.username}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ====== Chat Page ======
function ChatPage({ uid, onBack }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);
  const chatId = [profile.id, uid].sort().join("_");

  useEffect(() => {
    if (uid) getDoc(doc(db, "users", uid)).then((s) => s.exists() && setOther({ id: s.id, ...s.data() }));
  }, [uid]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"), limit(100));
    const unsub = onSnapshot(q, (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const submit = async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText("");
    await addDoc(collection(db, "chats", chatId, "messages"), {
      from: profile.id, to: uid, text: msg, createdAt: serverTimestamp(),
    });
  };

  if (!other) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";

  return (
    <div className={`h-full flex flex-col ${dark ? "bg-slate-900" : "bg-gradient-to-b from-blue-50 via-white to-orange-50"} ${textPrimary}`}>
      <div className={`backdrop-blur-xl p-3 flex items-center gap-3 border-b ${dark ? "bg-slate-800/90 border-slate-700" : "bg-white/90 border-slate-200"}`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <Avatar user={other} size="md" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{other.displayName}</p>
          <p className="text-[11px] text-emerald-500">ออนไลน์</p>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && <div className={`text-center py-12 text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>ส่งข้อความแรกหา {other.displayName} เลย!</div>}
        {messages.map((m) => {
          const isMe = m.from === profile.id;
          return (
            <div key={m.id} className={`flex gap-2 items-end ${isMe ? "flex-row-reverse" : ""}`}>
              {!isMe && <Avatar user={other} size="xs" />}
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white rounded-br-md shadow-md" : dark ? "bg-slate-800 border border-slate-700 rounded-bl-md text-slate-100" : "bg-white border border-slate-200 rounded-bl-md shadow-sm"}`}>
                <p>{m.text}</p>
                <p className={`text-[10px] mt-0.5 ${isMe ? "text-white/80" : dark ? "text-slate-500" : "text-slate-400"}`}>{fmtTime(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className={`border-t p-3 flex items-center gap-2 ${dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
        <div className={`flex-1 flex items-center rounded-full px-4 py-2 ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="พิมพ์ข้อความ..." className={`flex-1 bg-transparent text-sm focus:outline-none ${textPrimary}`} />
        </div>
        <button onClick={submit} disabled={!text.trim()} className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-fuchsia-500 flex items-center justify-center disabled:opacity-30">
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

// ====== Notifications ======
function NotificationsPage({ onBack }) {
  const { theme } = useAuth();
  const dark = theme === "dark";
  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-slate-900 text-slate-100" : "bg-gradient-to-b from-blue-50 via-white to-orange-50 text-slate-800"}`}>
      <div className={`sticky top-0 z-10 backdrop-blur-xl p-4 flex items-center gap-3 border-b ${dark ? "bg-slate-800/80 border-slate-700" : "bg-white/80 border-slate-200"}`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg">การแจ้งเตือน</h2>
      </div>
      <div className="p-4">
        <div className={`rounded-2xl p-6 text-center border shadow-sm ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
          <Bell className={`w-12 h-12 mx-auto mb-3 ${dark ? "text-slate-600" : "text-slate-300"}`} />
          <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>ระบบแจ้งเตือนจะเปิดเร็วๆ นี้</p>
        </div>
      </div>
    </div>
  );
}

// ====== Profile Page ======
function ProfilePage({ uid, onBack, onSettings, onProfile }) {
  const { profile: me, setProfile, theme } = useAuth();
  const dark = theme === "dark";
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({ displayName: "", bio: "", avatar: "", avatarUrl: "" });
  const isOwn = uid === me.id;

  useEffect(() => {
    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(ref, (s) => {
      if (s.exists()) {
        const u = { id: s.id, ...s.data() };
        setUser(u);
        setEdit({ displayName: u.displayName || "", bio: u.bio || "", avatar: u.avatar || "🐻", avatarUrl: u.avatarUrl || "" });
      }
    });
    return () => unsub();
  }, [uid]);

  useEffect(() => {
    const q = query(collection(db, "posts"), where("userId", "==", uid), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [uid]);

  const saveEdit = async () => {
    const update = { displayName: edit.displayName, bio: edit.bio, avatar: edit.avatar, avatarUrl: edit.avatarUrl };
    await updateDoc(doc(db, "users", me.id), update);
    setProfile({ ...me, ...update });
    setEditing(false);
    toast("บันทึกแล้ว ✓");
  };

  if (!user) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  const textPrimary = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-slate-900" : "bg-gradient-to-b from-blue-50 via-white to-orange-50"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 backdrop-blur-xl p-4 flex items-center justify-between border-b ${dark ? "bg-slate-800/80 border-slate-700" : "bg-white/80 border-slate-200"}`}>
        {onBack ? <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button> : <div className="w-6" />}
        <h2 className="font-bold">@{user.username}</h2>
        {isOwn ? <button onClick={onSettings}><Settings className="w-6 h-6" /></button> : <div className="w-6" />}
      </div>
      <div className="p-6 text-center">
        <div className="inline-block relative">
          <Avatar user={user} size="xl" />
          {isOwn && (
            <button onClick={() => setEditing(true)} className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 text-white flex items-center justify-center shadow-lg">
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>
        <h1 className="text-2xl font-bold mt-3">{user.displayName}</h1>
        <p className={textSecondary}>@{user.username}</p>
        <div className="flex justify-center gap-8 mt-6">
          <div><p className="text-xl font-bold">{(user.friends || []).length}</p><p className={`text-xs ${textSecondary}`}>เพื่อน</p></div>
          <div><p className="text-xl font-bold">{posts.length}</p><p className={`text-xs ${textSecondary}`}>โพสต์</p></div>
        </div>
        <p className="text-sm mt-4 max-w-xs mx-auto">{user.bio}</p>
        {isOwn && (
          <button onClick={() => setEditing(true)} className={`mt-5 px-6 py-2 rounded-full font-semibold text-sm border ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>แก้ไขโปรไฟล์</button>
        )}
      </div>
      <div className="p-3">
        <h3 className={`text-sm font-bold mb-2 uppercase tracking-wider ${textSecondary}`}>โพสต์</h3>
        <div className="space-y-3">
          {posts.length === 0 ? <p className={`text-center py-8 text-sm ${textSecondary}`}>ยังไม่มีโพสต์</p> : posts.map((p) => <PostCard key={p.id} post={p} onProfile={onProfile} />)}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setEditing(false)}>
          <div onClick={(e) => e.stopPropagation()} className={`rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideup ${dark ? "bg-slate-800" : "bg-white"}`}>
            <h3 className={`text-xl font-bold mb-4 ${textPrimary}`}>แก้ไขโปรไฟล์</h3>

            {/* Avatar URL input */}
            <p className={`text-xs font-semibold mb-2 ${textSecondary}`}>📷 ใช้รูปจาก URL</p>
            <div className="relative mb-3">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={edit.avatarUrl} onChange={(e) => setEdit({ ...edit, avatarUrl: e.target.value })} placeholder="วาง URL รูป (เช่น https://...)" className={`w-full rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 border ${dark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200"}`} />
            </div>
            {edit.avatarUrl && (
              <div className="flex items-center gap-2 mb-3">
                <img src={edit.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-blue-400" onError={(e) => { e.target.style.display = "none"; }} />
                <p className={`text-xs ${textSecondary}`}>ตัวอย่างรูป (ถ้าไม่ขึ้น แสดงว่า URL ใช้ไม่ได้)</p>
              </div>
            )}

            <p className={`text-xs font-semibold mb-2 ${textSecondary}`}>หรือเลือก Emoji ({AVATAR_EMOJIS.length}+ แบบ)</p>
            <div className="grid grid-cols-8 gap-1.5 mb-4 max-h-48 overflow-y-auto p-1">
              {AVATAR_EMOJIS.map((a) => (
                <button key={a} onClick={() => setEdit({ ...edit, avatar: a, avatarUrl: "" })} className={`text-2xl p-1.5 rounded-lg transition ${edit.avatar === a && !edit.avatarUrl ? "bg-gradient-to-br from-blue-400 to-fuchsia-400 scale-110" : dark ? "bg-slate-700" : "bg-slate-100"}`}>{a}</button>
              ))}
            </div>

            <input value={edit.displayName} onChange={(e) => setEdit({ ...edit, displayName: e.target.value })} placeholder="ชื่อแสดง" className={`w-full rounded-2xl px-4 py-3 mb-3 focus:outline-none focus:border-blue-400 border-2 ${dark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200"}`} />
            <textarea value={edit.bio} onChange={(e) => setEdit({ ...edit, bio: e.target.value })} placeholder="เกี่ยวกับคุณ..." rows={3} className={`w-full rounded-2xl px-4 py-3 mb-4 focus:outline-none focus:border-blue-400 border-2 resize-none ${dark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200"}`} />
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className={`flex-1 py-3 rounded-2xl font-semibold ${dark ? "bg-slate-700 text-slate-200" : "bg-slate-100"}`}>ยกเลิก</button>
              <button onClick={saveEdit} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-fuchsia-500 text-white font-semibold">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ====== Settings ======
function SettingsPage({ onBack }) {
  const { profile, theme, setTheme } = useAuth();
  const dark = theme === "dark";
  const handleLogout = async () => { await signOut(auth); };
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-slate-900" : "bg-gradient-to-b from-blue-50 via-white to-orange-50"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 backdrop-blur-xl p-4 flex items-center gap-3 border-b ${dark ? "bg-slate-800/80 border-slate-700" : "bg-white/80 border-slate-200"}`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg">การตั้งค่า</h2>
      </div>
      <div className="p-4 space-y-2">
        <div className={`rounded-2xl p-4 border shadow-sm ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
          <p className={`text-xs ${textSecondary}`}>บัญชี</p>
          <p className="font-medium">{profile?.email}</p>
        </div>

        <button onClick={() => setTheme(dark ? "light" : "dark")} className={`w-full rounded-2xl p-4 border shadow-sm flex items-center justify-between ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
          <div className="flex items-center gap-3">
            {dark ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div className="text-left">
              <p className="font-medium">โหมด{dark ? "มืด" : "สว่าง"}</p>
              <p className={`text-xs ${textSecondary}`}>กดเพื่อสลับ</p>
            </div>
          </div>
          <div className={`w-12 h-6 rounded-full transition relative ${dark ? "bg-blue-500" : "bg-slate-300"}`}>
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition shadow ${dark ? "left-6" : "left-0.5"}`} />
          </div>
        </button>

        <button onClick={handleLogout} className="w-full bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-semibold py-3 rounded-2xl flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" /> ออกจากระบบ
        </button>
        <p className={`text-center text-xs pt-8 ${textSecondary}`}>Playvo v1.1 · Play Every Moment</p>
      </div>
    </div>
  );
}

// ====== Root ======
function PlayvoRoot() {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <img src={PLAYVO_LOGO} alt="" className="w-20 h-20 animate-pulse" />
      </div>
    );
  }
  if (!user || !profile) return <AuthScreen />;
  return <MainApp />;
}

export default function Page() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <PlayvoRoot />
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
