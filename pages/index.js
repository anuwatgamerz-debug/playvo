import { useState, useEffect, useRef, createContext, useContext, useMemo } from "react";
import {
  Heart, MessageCircle, Send, Plus, Home, User as UserIcon, Bell, LogOut,
  X, ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2, Image as ImageIcon,
  Earth, Users, MessageSquare, ThumbsUp, Camera, Settings, MoreHorizontal,
  Search, UserPlus, Trash2, Moon, Sun, BarChart3, Check, Link as LinkIcon,
  EyeOff as EyeOffIcon, Hash, Coffee, Gamepad2, Utensils, Briefcase, MessagesSquare,
  HelpCircle, Sparkles, Calendar, Vote, Smile, Film, CheckCheck, Type,
  Pin, Cake, BellRing, PartyPopper, Bookmark, Trophy, RefreshCw, Swords, Dice5
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
const REACTIONS = [
  { type: "like", emoji: "👍", color: "text-blue-500", label: "ถูกใจ" },
  { type: "love", emoji: "❤️", color: "text-red-500", label: "รักเลย" },
  { type: "haha", emoji: "😂", color: "text-amber-500", label: "ฮ่าฮ่า" },
  { type: "wow", emoji: "😮", color: "text-amber-500", label: "ว้าว" },
  { type: "sad", emoji: "😢", color: "text-amber-500", label: "เศร้า" },
  { type: "angry", emoji: "😡", color: "text-orange-600", label: "โกรธ" },
];

const AVATAR_EMOJIS = [
  "🐻","🦊","🐼","🦁","🐯","🐨","🐸","🦄","🐙","🦋","🌟","🔥",
  "🐶","🐱","🐭","🐹","🐰","🦝","🐻‍❄️","🐮","🐷","🐵","🙈","🐔",
  "🐧","🐦","🐤","🦅","🦆","🦢","🦉","🦇","🐺","🐗","🐴","🦓",
  "🦒","🐘","🦏","🐪","🦘","🐢","🐍","🦎","🐊","🐳","🐬","🐠",
  "🦈","🐙","🦀","🦞","🦂","🕷️","🦗","🐝","🐞","🌈","⭐","✨",
];

// ====== Truth or Dare data ======
const TRUTHS = [
  "ความลับที่ไม่เคยบอกใครคืออะไร?",
  "เคยแอบชอบใครในกลุ่มนี้มั้ย?",
  "เรื่องที่เสียใจที่สุดในชีวิต?",
  "ถ้าได้กลับไปแก้ 1 อย่างในอดีต อยากแก้อะไร?",
  "ใครในกลุ่มที่ขี้บ่นที่สุด?",
  "ครั้งสุดท้ายที่ร้องไห้ ร้องเพราะอะไร?",
  "นิสัยแย่ที่สุดของตัวเองคืออะไร?",
  "เคยโกหกพ่อแม่เรื่องอะไรบ้าง?",
  "ถ้าได้เงิน 1 ล้านตอนนี้ จะใช้ทำอะไรเป็นอย่างแรก?",
  "เคยแอบดูมือถือแฟน/เพื่อนมั้ย?",
  "ถ้าต้องเลือก 1 คนในกลุ่มไปติดเกาะ จะเลือกใคร?",
  "ความฝันที่ยังไม่กล้าบอกใคร?",
  "เคยทำอะไรแล้วเสียดายที่สุด?",
  "ถ้าโลกแตกพรุ่งนี้ จะทำอะไรในวันนี้?",
  "คนแรกที่จะโทรหาตอนเครียด?",
  "นิสัยใครในกลุ่มที่อยากเปลี่ยนที่สุด?",
  "เคยอิจฉาเพื่อนในกลุ่มมั้ย? เรื่องอะไร?",
  "เพลงที่ฟังแล้วร้องไห้?",
  "เคยขโมยของของใครรึเปล่า?",
  "Crush ครั้งล่าสุดเป็นใคร?",
];

const DARES = [
  "ส่งสติกเกอร์น่ารักให้คนในกลุ่ม 5 คน",
  "พิมพ์ 'ฉันสวย/หล่อที่สุดในโลก' ลงในห้องทั่วไป",
  "เล่าเรื่องตลกที่สุดในชีวิตให้กลุ่มฟัง",
  "ส่งรูปตัวเองล่าสุดในแชทกลุ่ม",
  "แต่งกลอน 4 บรรทัดเกี่ยวกับเพื่อนคนถัดไป",
  "เปลี่ยน bio เป็นชื่อเล่นแฟน/คนชอบ 1 ชั่วโมง",
  "ส่งวอยซ์ร้องเพลงท่อนฮุก 1 เพลง",
  "พิมพ์ชม 3 คนในกลุ่ม คนละ 1 ประโยค",
  "เปลี่ยนรูปโปรไฟล์เป็นรูปสัตว์ 1 วัน",
  "เล่าความลับที่ไม่เคยบอกใคร 1 เรื่อง",
  "ทักทายเพื่อนคนแรกที่เห็นในแอป",
  "เลียนเสียงสัตว์ส่งให้กลุ่ม",
  "โพสต์ในห้องนิรนามว่ารักใครในกลุ่มที่สุด",
  "ส่ง emoji 10 ตัวที่อธิบายตัวเอง",
  "เล่าเรื่องน่าอายที่สุด 1 เรื่อง",
  "ทายชื่อเพลงจากท่อนแรก 3 เพลง",
  "เลือกเพื่อน 1 คน บอกข้อดี 5 ข้อ",
  "ตั้ง Daily Question ที่กล้าที่สุด",
  "พิมพ์ทักทายเป็นภาษาแปลกๆ 5 ภาษา",
  "บอกเพลงที่ฟังบ่อยที่สุดเดือนนี้",
];
// ใช้ unicode emoji ใหญ่ๆ เป็น "sticker" (ฟรี ไม่ต้องโหลดรูป)
const STICKER_PACKS = {
  faces: { name: "หน้าตา", stickers: ["😀","😂","🤣","😅","😊","😍","🥰","😘","🤗","🤔","😎","😴","😋","🤤","😭","😢","😱","😡","🥺","😏","🙄","😬","🤐","🤫","🤭","🤯","🥳","🤩","😇","🤠"] },
  animals: { name: "สัตว์", stickers: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🦆","🦉","🦇","🐺","🐗","🐴","🦄","🦋","🐌","🐢","🐍"] },
  food: { name: "อาหาร", stickers: ["🍎","🍊","🍋","🍌","🍉","🍇","🍓","🥑","🍅","🥦","🌽","🍕","🍔","🌮","🍜","🍝","🍣","🍱","🍙","🍩","🎂","🍰","🍪","🍫","🍬","☕","🍵","🍺","🍷","🥤"] },
  hands: { name: "มือ", stickers: ["👍","👎","👌","✌️","🤞","🤟","🤘","👋","🤚","🖐️","✋","🖖","👏","🙌","👐","🤲","🙏","💪","✍️","🤳","💅","🦶","🦵","👂","👃","👀","👅","👄","🫶","🫰"] },
  hearts: { name: "หัวใจ", stickers: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","♥️","💌","💋","💍","💎","🌹","🌷","🌸","🌺","🌻","🌼"] },
  party: { name: "ปาร์ตี้", stickers: ["🎉","🎊","🎈","🎂","🎁","🎀","🎄","🎃","🎆","🎇","✨","🌟","⭐","💫","🔥","💯","💥","💢","💦","💨","🌈","☀️","⛅","🌙","⚡","🎵","🎶","🎤","🎸","🥁"] },
};

// ====== Notification helpers ======
const createNotif = async (toUid, type, fromProfile, extra = {}) => {
  if (!toUid || toUid === fromProfile.id) return;
  try {
    await addDoc(collection(db, "users", toUid, "notifications"), {
      type, // "like" | "comment" | "friend_request" | "friend_accept"
      fromUid: fromProfile.id,
      fromName: fromProfile.displayName,
      fromAvatar: fromProfile.avatar || "🐻",
      fromAvatarUrl: fromProfile.avatarUrl || "",
      read: false,
      createdAt: serverTimestamp(),
      ...extra,
    });
  } catch (e) {
    console.error("notif error", e);
  }
};
const ROOMS = [
  { id: "general", name: "ทั่วไป", icon: Home, gradient: "from-blue-400 to-cyan-500", desc: "พูดคุยสารพัด" },
  { id: "monday-rant", name: "บ่นวันจันทร์", icon: Coffee, gradient: "from-amber-400 to-orange-500", desc: "ระบายเรื่องวันจันทร์" },
  { id: "food", name: "อาหาร", icon: Utensils, gradient: "from-rose-400 to-pink-500", desc: "กินไรดี?" },
  { id: "games", name: "เกม", icon: Gamepad2, gradient: "from-violet-400 to-fuchsia-500", desc: "เกมที่กำลังเล่น" },
  { id: "work", name: "งาน", icon: Briefcase, gradient: "from-slate-400 to-slate-600", desc: "เรื่องงาน" },
  { id: "anonymous", name: "นิรนาม", icon: EyeOffIcon, gradient: "from-purple-500 to-indigo-600", desc: "โพสต์โดยไม่บอกชื่อ" },
];

// ====== Daily Questions ======
const DAILY_QUESTIONS = [
  "วันนี้กินอะไร?", "เพลงที่ฟังบ่อยสุดในเดือนนี้?", "ถ้าเลือกได้ อยากไปเที่ยวที่ไหน?",
  "หนังเรื่องสุดท้ายที่ดู?", "เก่งเรื่องอะไรที่สุด?", "ถ้ามีเงิน 10,000 ตอนนี้จะใช้ทำอะไร?",
  "อาหารที่เกลียดที่สุด?", "ความฝันตอนเด็ก?", "วันหยุดทำอะไรบ้าง?",
  "งานอดิเรกใหม่ที่อยากลอง?", "ถ้าวันนี้เป็นวันสุดท้ายของปี อยากทำอะไร?", "คนที่ขอบคุณที่สุดในชีวิต?",
  "เพื่อนที่คิดถึงตอนนี้?", "สิ่งที่ภูมิใจมากที่สุด?", "หนังสือเล่มล่าสุดที่อ่าน?",
  "ของหวานสุดโปรด?", "วันหยุดในฝัน?", "Skill อะไรที่อยากเรียนรู้?",
  "อาหารที่กินไม่เบื่อ?", "เพลงประจำตัวคืออะไร?",
];
const getDailyQuestion = () => {
  const day = Math.floor(Date.now() / 86400000);
  return DAILY_QUESTIONS[day % DAILY_QUESTIONS.length];
};

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

// ====== Avatar ======
function Avatar({ user, size = "md", onClick, anonymous = false }) {
  const sizes = { xs: "w-7 h-7 text-sm", sm: "w-8 h-8 text-base", md: "w-11 h-11 text-2xl", lg: "w-14 h-14 text-2xl", xl: "w-28 h-28 text-6xl" };
  const cls = sizes[size] || sizes.md;
  if (anonymous) {
    return (
      <div className={`${cls} rounded-full bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-md shrink-0`}>
        <EyeOffIcon className={size === "xs" ? "w-3 h-3" : size === "sm" ? "w-4 h-4" : "w-6 h-6"} color="white" />
      </div>
    );
  }
  const inner = user?.avatarUrl ? (
    <img src={user.avatarUrl} alt="" className={`${cls} rounded-full object-cover shadow-md shrink-0`} />
  ) : (
    <div className={`${cls} rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0`}>
      {user?.avatar || "🐻"}
    </div>
  );
  return onClick ? <button onClick={onClick} className="shrink-0">{inner}</button> : inner;
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

// ====== Confirm ======
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
    e?.preventDefault(); setErr(""); setBusy(true);
    try { await signInWithEmailAndPassword(auth, email, password); toast("ยินดีต้อนรับ! 🎉"); }
    catch (e) { setErr(tErr(e.code)); }
    setBusy(false);
  };
  const handleSignup = async (e) => {
    e?.preventDefault(); setErr("");
    if (password !== confirm) { setErr("รหัสผ่านไม่ตรงกัน"); return; }
    if (password.length < 6) { setErr("รหัสผ่านอย่างน้อย 6 ตัวอักษร"); return; }
    setBusy(true);
    try { await createUserWithEmailAndPassword(auth, email, password); toast("สมัครสำเร็จ! 🎉"); }
    catch (e) { setErr(tErr(e.code)); }
    setBusy(false);
  };
  const handleGoogle = async () => {
    setBusy(true); setErr("");
    try { await signInWithPopup(auth, googleProvider); toast("เข้าสู่ระบบสำเร็จ"); }
    catch (e) { setErr(tErr(e.code)); }
    setBusy(false);
  };
  const handleForgot = async () => {
    setErr(""); setInfo("");
    if (!email) { setErr("กรุณาใส่อีเมล"); return; }
    setBusy(true);
    try { await sendPasswordResetEmail(auth, email); setInfo("ส่งลิงก์รีเซ็ตไปยังอีเมลแล้ว ✓ (ตรวจ Spam ด้วยนะ)"); }
    catch (e) { setErr(tErr(e.code)); }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl opacity-0 animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-orange-300 rounded-full filter blur-3xl opacity-0 animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-fuchsia-300 rounded-full filter blur-3xl opacity-0 animate-pulse" style={{ animationDelay: "2s" }} />
      </div>
      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
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
              <button type="button" onClick={() => { setMode("forgot"); setErr(""); setInfo(""); }} className="text-xs text-slate-500 hover:text-black dark:hover:text-white underline">ลืมรหัสผ่าน?</button>
              <PrimaryBtn busy={busy}>เข้าสู่ระบบ</PrimaryBtn>
              <OrDivider />
              <GoogleBtn onClick={handleGoogle} busy={busy} />
              <p className="text-center text-sm text-slate-600 pt-2">
                ยังไม่มีบัญชี? <button type="button" onClick={() => { setMode("signup"); setErr(""); }} className="text-black dark:text-white font-bold underline">สมัครสมาชิก</button>
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
                มีบัญชีแล้ว? <button type="button" onClick={() => { setMode("login"); setErr(""); }} className="text-black dark:text-white font-bold underline">เข้าสู่ระบบ</button>
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
      className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-full hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2">
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
  const [chatGroupId, setChatGroupId] = useState(null);
  const [activeRoom, setActiveRoom] = useState("general");
  const [activeGame, setActiveGame] = useState(null);
  const [gameMatchId, setGameMatchId] = useState(null);

  const goProfile = (uid) => { setProfileUid(uid); setPage("profile"); };
  const goChat = (uid) => { setChatUid(uid); setChatGroupId(null); setPage("chat"); };
  const goGroupChat = (gid) => { setChatGroupId(gid); setChatUid(null); setPage("groupchat"); };
  const goGame = (gameId, matchId = null) => { setActiveGame(gameId); setGameMatchId(matchId); setPage("playgame"); };

  const dark = theme === "dark";
  const bgClass = dark ? "bg-black" : "bg-white";

  return (
    <div className={`h-screen w-full max-w-md mx-auto ${bgClass} relative overflow-hidden flex flex-col ${dark ? "dark" : ""}`}>
      <div className="flex-1 overflow-hidden">
        {page === "feed" && <FeedPage onProfile={goProfile} onChat={goChat} onNotifications={() => setPage("notifications")} onMessages={() => setPage("messages")} onFriends={() => setPage("friends")} onRooms={() => setPage("rooms")} activeRoom={activeRoom} setActiveRoom={setActiveRoom} />}
        {page === "rooms" && <RoomsPage onBack={() => setPage("feed")} onSelectRoom={(r) => { setActiveRoom(r); setPage("feed"); }} activeRoom={activeRoom} />}
        {page === "friends" && <FriendsPage onBack={() => setPage("feed")} onProfile={goProfile} onChat={goChat} />}
        {page === "messages" && <MessagesPage onBack={() => setPage("feed")} onChat={goChat} onGroupChat={goGroupChat} />}
        {page === "chat" && <ChatPage uid={chatUid} onBack={() => setPage("messages")} />}
        {page === "groupchat" && <GroupChatPage groupId={chatGroupId} onBack={() => setPage("messages")} onProfile={goProfile} />}
        {page === "notifications" && <NotificationsPage onBack={() => setPage("feed")} />}
        {page === "games" && <GamesHubPage onBack={() => setPage("feed")} onPlay={goGame} />}
        {page === "playgame" && <GamePlayPage gameId={activeGame} matchId={gameMatchId} onBack={() => setPage("games")} />}
        {page === "profile" && <ProfilePage uid={profileUid || profile.id} onBack={profileUid && profileUid !== profile.id ? () => { setProfileUid(null); setPage("feed"); } : null} onSettings={() => setPage("settings")} onProfile={goProfile} />}
        {page === "settings" && <SettingsPage onBack={() => setPage("profile")} />}
      </div>

      {!["chat", "groupchat", "settings", "playgame"].includes(page) && (
        <div className={`${dark ? "bg-black border-slate-800" : "bg-white border-slate-200"} border-t`}>
          <div className="flex items-center justify-around py-2">
            <NavBtn icon={Home} label="หน้าแรก" active={page === "feed"} onClick={() => setPage("feed")} />
            <NavBtn icon={Users} label="เพื่อน" active={page === "friends"} onClick={() => setPage("friends")} />
            <NavBtn icon={Gamepad2} label="เกม" active={page === "games" || page === "playgame"} onClick={() => setPage("games")} />
            <NavBtn icon={MessageSquare} label="แชท" active={page === "messages"} onClick={() => setPage("messages")} />
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
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 px-2 py-1">
      <Icon className={`w-6 h-6 ${active ? "text-black dark:text-white" : inactiveColor}`} fill={active ? "currentColor" : "none"} />
      <span className={`text-[10px] ${active ? "text-black dark:text-white font-semibold" : inactiveColor}`}>{label}</span>
    </button>
  );
}

// ====== Rooms Page ======
function RoomsPage({ onBack, onSelectRoom, activeRoom }) {
  const { theme } = useAuth();
  const dark = theme === "dark";
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-black" : "bg-white"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 p-4 flex items-center gap-3 ${dark ? "bg-black border-slate-800" : "bg-white border-slate-200"} border-b`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg">ห้องทั้งหมด</h2>
      </div>
      <div className="p-3">
        <p className={`text-xs mb-3 ${textSecondary}`}>เลือกห้องเพื่อโพสต์/ดูเนื้อหาเฉพาะหัวข้อ</p>
        <div className="grid grid-cols-2 gap-3">
          {ROOMS.map((r) => {
            const Icon = r.icon;
            const isActive = activeRoom === r.id;
            return (
              <button key={r.id} onClick={() => onSelectRoom(r.id)} className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${r.gradient} hover:scale-[1.02] transition text-left text-white dark:text-black ${isActive ? "ring-4 ring-blue-400" : ""}`}>
                <Icon className="w-8 h-8 mb-2" />
                <p className="font-bold text-base">{r.name}</p>
                <p className="text-xs text-white/80 mt-0.5">{r.desc}</p>
                {isActive && <div className="absolute top-2 right-2 bg-white/30 backdrop-blur rounded-full px-2 py-0.5 text-[10px] font-bold">กำลังดู</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ====== Daily Question Card ======
function DailyQuestionCard({ onAnswer }) {
  const { theme } = useAuth();
  const dark = theme === "dark";
  const question = useMemo(() => getDailyQuestion(), []);

  return (
    <div className={`mx-3 mt-3 rounded-2xl overflow-hidden shadow-md bg-black dark:bg-white text-white`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">คำถามประจำวัน</span>
        </div>
        <p className="text-lg font-bold mb-3">{question}</p>
        <button onClick={() => onAnswer(question)} className="w-full bg-white/20 backdrop-blur hover:bg-white/30 transition rounded-xl py-2 text-sm font-semibold flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" /> ตอบคำถามนี้
        </button>
      </div>
    </div>
  );
}

// ====== Feed Page ======
function FeedPage({ onProfile, onChat, onNotifications, onMessages, onFriends, onRooms, activeRoom, setActiveRoom }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [composerInitial, setComposerInitial] = useState({});
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [birthdayFriends, setBirthdayFriends] = useState([]);

  const currentRoom = ROOMS.find((r) => r.id === activeRoom) || ROOMS[0];

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const filtered = all.filter((p) => (p.room || "general") === activeRoom);
      setPosts(filtered);
      setLoading(false);
    });
    return () => unsub();
  }, [activeRoom]);

  // Listen unread notifications count
  useEffect(() => {
    const q = query(collection(db, "users", profile.id, "notifications"), where("read", "==", false));
    const unsub = onSnapshot(q, (snap) => setUnreadNotif(snap.size), () => {});
    return () => unsub();
  }, [profile.id]);

  // Find friends with birthday today
  useEffect(() => {
    const friendIds = profile.friends || [];
    if (friendIds.length === 0) { setBirthdayFriends([]); return; }
    Promise.all(friendIds.map((id) => getDoc(doc(db, "users", id)))).then((snaps) => {
      const today = new Date();
      const todayMD = `${today.getMonth() + 1}-${today.getDate()}`;
      const list = [];
      snaps.forEach((s) => {
        if (s.exists()) {
          const u = { id: s.id, ...s.data() };
          if (u.birthday && u.birthday === todayMD) list.push(u);
        }
      });
      setBirthdayFriends(list);
    });
  }, [(profile.friends || []).join(",")]);

  const handleAnswerDaily = (question) => {
    setComposerInitial({ text: `❓ ${question}\n\n` });
    setShowComposer(true);
  };

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-black text-slate-100" : "bg-white text-slate-800"}`}>
      <div className={`sticky top-0 z-10 ${dark ? "bg-black border-slate-800" : "bg-white border-slate-200"} border-b`}>
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <img src={PLAYVO_LOGO} alt="Playvo" className="w-9 h-9" />
            <h1 className="text-2xl font-black text-black dark:text-white">Playvo</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={onFriends} className={`w-10 h-10 rounded-full ${dark ? "hover:bg-slate-900" : "hover:bg-slate-100"} flex items-center justify-center`}><Users className="w-5 h-5" /></button>
            <button onClick={onMessages} className={`w-10 h-10 rounded-full ${dark ? "hover:bg-slate-900" : "hover:bg-slate-100"} flex items-center justify-center`}><MessageSquare className="w-5 h-5" /></button>
            <button onClick={onNotifications} className={`relative w-10 h-10 rounded-full ${dark ? "hover:bg-slate-900" : "hover:bg-slate-100"} flex items-center justify-center`}>
              <Bell className="w-5 h-5" />
              {unreadNotif > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-700">
                  {unreadNotif > 9 ? "9+" : unreadNotif}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Room selector */}
        <div className="flex gap-2 px-3 pb-3 overflow-x-auto scrollbar-hide">
          {ROOMS.map((r) => {
            const Icon = r.icon;
            const active = activeRoom === r.id;
            return (
              <button key={r.id} onClick={() => setActiveRoom(r.id)} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${active ? "bg-black dark:bg-white text-white border-transparent" : dark ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-700"}`}>
                <Icon className="w-3.5 h-3.5" /> {r.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Question (only in general room) */}
      {activeRoom === "general" && <DailyQuestionCard onAnswer={handleAnswerDaily} />}

      {/* Birthday banner */}
      {birthdayFriends.length > 0 && activeRoom === "general" && (
        <div className="mx-3 mt-3 rounded-2xl overflow-hidden bg-black dark:bg-white text-white dark:text-black dark:text-black">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PartyPopper className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">วันเกิดเพื่อน 🎂</span>
            </div>
            <p className="text-base font-bold mb-2">
              {birthdayFriends.length === 1
                ? `วันนี้วันเกิด ${birthdayFriends[0].displayName}!`
                : `วันนี้วันเกิดเพื่อน ${birthdayFriends.length} คน!`}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {birthdayFriends.slice(0, 5).map((u) => (
                <button key={u.id} onClick={() => onProfile(u.id)} className="flex items-center gap-1 bg-white/20 backdrop-blur rounded-full pl-1 pr-3 py-1">
                  <Avatar user={u} size="xs" />
                  <span className="text-xs font-semibold">{u.displayName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Composer trigger */}
      <button onClick={() => { setComposerInitial({ room: activeRoom, anonymous: activeRoom === "anonymous" }); setShowComposer(true); }} className={`mx-3 mt-3 w-[calc(100%-1.5rem)] flex items-center gap-3 p-3 rounded-2xl border shadow-sm ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
        <Avatar user={profile} size="md" anonymous={activeRoom === "anonymous"} />
        <span className={`text-sm flex-1 text-left ${dark ? "text-slate-400" : "text-slate-500"}`}>
          {activeRoom === "anonymous" ? "โพสต์แบบนิรนาม..." : `โพสต์ในห้อง ${currentRoom.name}...`}
        </span>
        <BarChart3 className="w-5 h-5" />
      </button>

      {/* Posts */}
      <div className="space-y-3 mt-3 pb-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" /></div>
        ) : posts.length === 0 ? (
          <div className={`text-center py-16 ${dark ? "text-slate-500" : "text-slate-400"}`}>
            <p>ยังไม่มีโพสต์ในห้อง {currentRoom.name}</p>
            <p className="text-xs mt-1">เป็นคนแรกที่โพสต์เลยสิ! 🎉</p>
          </div>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} onProfile={onProfile} />)
        )}
      </div>

      {showComposer && <PostComposer initial={composerInitial} activeRoom={activeRoom} onClose={() => { setShowComposer(false); setComposerInitial({}); }} />}
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

  const isAnon = post.anonymous;

  useEffect(() => {
    if (isAnon) return;
    getDoc(doc(db, "users", post.userId)).then((snap) => {
      if (snap.exists()) setAuthor({ id: snap.id, ...snap.data() });
    });
  }, [post.userId, isAnon]);

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
    if (myReaction === type) await updateDoc(ref, { [`reactions.${profile.id}`]: null });
    else {
      await updateDoc(ref, { [`reactions.${profile.id}`]: type });
      // Send notification to post owner (if not me, not anonymous)
      if (post.userId !== profile.id && !isAnon) {
        createNotif(post.userId, "like", profile, { postId: post.id });
      }
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
    // Send notification to post owner (if not me, not anonymous)
    if (post.userId !== profile.id && !isAnon) {
      createNotif(post.userId, "comment", profile, { postId: post.id, comment: commentText.trim().slice(0, 50) });
    }
    setCommentText("");
  };

  const deletePost = async () => {
    setShowMenu(false);
    if (!(await confirm("ลบโพสต์นี้? (ลบแล้วเรียกคืนไม่ได้)"))) return;
    await deleteDoc(doc(db, "posts", post.id));
    toast("ลบโพสต์แล้ว ✓");
  };

  const togglePin = async () => {
    setShowMenu(false);
    await updateDoc(doc(db, "posts", post.id), { pinned: !post.pinned });
    toast(post.pinned ? "เลิกปักหมุด" : "ปักหมุดแล้ว 📌");
  };

  const votePoll = async (optionIdx) => {
    if (!post.poll) return;
    const ref = doc(db, "posts", post.id);
    const myVote = post.poll.votes?.[profile.id];
    if (myVote === optionIdx) {
      // un-vote
      await updateDoc(ref, { [`poll.votes.${profile.id}`]: null });
    } else {
      await updateDoc(ref, { [`poll.votes.${profile.id}`]: optionIdx });
    }
  };

  const isMyPost = post.userId === profile.id;

  if (!isAnon && !author) return null;

  const cardBg = dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  // Poll calculations
  const poll = post.poll;
  const pollVotes = poll?.votes ? Object.values(poll.votes).filter((v) => v !== null && v !== undefined) : [];
  const totalVotes = pollVotes.length;
  const myVote = poll?.votes?.[profile.id];

  const room = ROOMS.find((r) => r.id === (post.room || "general"));
  const RoomIcon = room?.icon || Home;

  return (
    <div className={`${dark ? "bg-black" : "bg-white"} border-b ${dark ? "border-slate-800" : "border-slate-200"}`}>
      <div className="flex items-center gap-3 p-3">
        {isAnon ? (
          <Avatar anonymous={true} size="md" />
        ) : (
          <Avatar user={author} size="md" onClick={() => onProfile(post.userId)} />
        )}
        <div className="flex-1 min-w-0">
          {isAnon ? (
            <p className={`font-semibold text-sm ${textPrimary}`}>นิรนาม</p>
          ) : (
            <button onClick={() => onProfile(post.userId)} className={`font-semibold text-sm ${textPrimary}`}>{author.displayName}</button>
          )}
          <div className={`flex items-center gap-1.5 text-[11px] ${textSecondary}`}>
            <span>{fmtTime(post.createdAt)}</span>
            <span>·</span>
            <RoomIcon className="w-3 h-3" />
            <span>{room?.name || "ทั่วไป"}</span>
          </div>
        </div>
        {isMyPost && !isAnon && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}><MoreHorizontal className={`w-5 h-5 ${textSecondary}`} /></button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className={`absolute right-0 top-7 z-40 ${cardBg} border rounded-xl shadow-xl py-1 w-40`}>
                  <button onClick={togglePin} className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
                    <Pin className="w-4 h-4" /> {post.pinned ? "เลิกปักหมุด" : "ปักหมุดโพสต์"}
                  </button>
                  <button onClick={deletePost} className="w-full px-3 py-2 text-sm text-left text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> ลบโพสต์
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {post.pinned && (
        <div className={`px-3 -mt-1 mb-1 flex items-center gap-1 text-[11px] ${textSecondary}`}>
          <Pin className="w-3 h-3" /> ปักหมุดไว้
        </div>
      )}
      {post.text && <p className={`px-3 pb-3 text-[15px] whitespace-pre-line ${textPrimary}`}>{post.text}</p>}
      {post.image && <img src={post.image} alt="" className="w-full max-h-[500px] object-cover" loading="lazy" />}

      {/* Poll */}
      {poll && (
        <div className="px-3 pb-3 space-y-2">
          {poll.options.map((opt, idx) => {
            const count = pollVotes.filter((v) => v === idx).length;
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
            const isMine = myVote === idx;
            return (
              <button key={idx} onClick={() => votePoll(idx)} className={`relative w-full rounded-xl border-2 overflow-hidden text-left transition ${isMine ? "border-black dark:border-white" : dark ? "border-slate-700" : "border-slate-200"}`}>
                <div className={`absolute inset-y-0 left-0 ${isMine ? "bg-slate-200 dark:bg-slate-800" : dark ? "bg-slate-700/50" : "bg-slate-100"} transition-all`} style={{ width: `${pct}%` }} />
                <div className="relative px-3 py-2 flex items-center justify-between">
                  <span className={`text-sm font-medium ${textPrimary}`}>{isMine && "✓ "}{opt}</span>
                  <span className={`text-xs ${textSecondary}`}>{count} ({pct}%)</span>
                </div>
              </button>
            );
          })}
          <p className={`text-xs ${textSecondary}`}>{totalVotes} คนโหวต {myVote != null ? "· กดอีกครั้งเพื่อยกเลิก" : ""}</p>
        </div>
      )}

      {(totalReactions > 0 || (post.commentsCount || 0) > 0) && (
        <div className={`flex items-center justify-between px-3 py-2 text-xs ${textSecondary}`}>
          {totalReactions > 0 && <div className="flex items-center gap-1"><div className="flex -space-x-1">{topEmojis.map((r) => <div key={r.type} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${dark ? "bg-slate-800" : "bg-slate-100"}`}>{r.emoji}</div>)}</div><span className="ml-1">{totalReactions}</span></div>}
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
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${dark ? "bg-black border-slate-700" : "bg-white border-slate-200"} rounded-full px-2 py-1.5 flex gap-1 border animate-slideup z-30`}>
              {REACTIONS.map((r) => <button key={r.type} onClick={() => react(r.type)} className="text-2xl hover:scale-125 transition transform">{r.emoji}</button>)}
            </div>
          )}
        </div>
        <button onClick={() => setShowComments(!showComments)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 ${textSecondary}`}>
          <MessageCircle className="w-5 h-5" /><span className="text-sm font-semibold">คอมเมนต์</span>
        </button>
      </div>

      {showComments && (
        <div className={`border-t p-3 space-y-3 ${dark ? "border-slate-700 bg-black" : "border-slate-100 bg-slate-50"}`}>
          {comments.map((c) => <CommentItem key={c.id} comment={c} postId={post.id} dark={dark} />)}
          <div className="flex gap-2 items-center">
            <Avatar user={profile} size="sm" />
            <div className={`flex-1 flex items-center rounded-full px-3 py-1.5 ${dark ? "bg-slate-900" : "bg-slate-100"}`}>
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitComment()} placeholder="แสดงความคิดเห็น..." className={`flex-1 bg-transparent text-sm focus:outline-none ${textPrimary}`} />
              <button onClick={submitComment} disabled={!commentText.trim()} className="text-blue-500 disabled:text-slate-300"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ====== Comment Item ======
function CommentItem({ comment, postId, dark }) {
  const { profile } = useAuth();
  const confirm = useConfirm();
  const toast = useToast();
  const [showReactPicker, setShowReactPicker] = useState(false);

  const myReaction = comment.reactions?.[profile.id];
  const reactionList = Object.values(comment.reactions || {}).filter(Boolean);
  const reactionCount = reactionList.length;
  const topEmoji = REACTIONS.find((r) => r.type === reactionList[0])?.emoji || "👍";

  const react = async (type) => {
    setShowReactPicker(false);
    const ref = doc(db, "posts", postId, "comments", comment.id);
    if (myReaction === type) await updateDoc(ref, { [`reactions.${profile.id}`]: null });
    else await updateDoc(ref, { [`reactions.${profile.id}`]: type });
  };

  const deleteCom = async () => {
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
            <button onClick={() => react(myReaction || "like")} onTouchStart={(e) => { e.preventDefault(); setShowReactPicker(true); }} className={`font-semibold ${myReaction ? "text-black dark:text-white" : dark ? "text-slate-500" : "text-slate-500"}`}>
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
function PostComposer({ onClose, activeRoom = "general", initial = {} }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const toast = useToast();
  const [text, setText] = useState(initial.text || "");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [room, setRoom] = useState(initial.room || activeRoom);
  const [anonymous, setAnonymous] = useState(initial.anonymous || activeRoom === "anonymous");
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [pollMode, setPollMode] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // sync anonymous when room changes
  useEffect(() => {
    if (room === "anonymous") setAnonymous(true);
  }, [room]);

  const SAMPLES = [
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
    "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800",
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800",
  ];

  const submit = async () => {
    const validPollOpts = pollOptions.filter((o) => o.trim()).map((o) => o.trim());
    if (pollMode && validPollOpts.length < 2) { toast("ต้องมีตัวเลือกอย่างน้อย 2 ข้อ"); return; }
    if (!text.trim() && !imageUrl && !pollMode) { toast("ใส่ข้อความ/รูป/โพล"); return; }

    setBusy(true);
    const data = {
      userId: profile.id,
      text: text.trim(),
      image: imageUrl || null,
      room,
      anonymous: anonymous || room === "anonymous",
      createdAt: serverTimestamp(),
      reactions: {},
      commentsCount: 0,
    };
    if (pollMode) {
      data.poll = { options: validPollOpts, votes: {} };
    }
    await addDoc(collection(db, "posts"), data);
    toast("โพสต์สำเร็จ! 🎉");
    onClose();
  };

  const currentRoom = ROOMS.find((r) => r.id === room) || ROOMS[0];
  const RoomIcon = currentRoom.icon;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${dark ? "bg-black text-slate-100" : "bg-white text-slate-800"}`}>
      <div className={`flex items-center justify-between p-4 border-b ${dark ? "border-slate-700" : "border-slate-200"}`}>
        <button onClick={onClose}><X className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg">สร้างโพสต์</h2>
        <button onClick={submit} disabled={busy || (!text.trim() && !imageUrl && !pollMode)} className="px-4 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold disabled:opacity-30">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "โพสต์"}
        </button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center gap-3 mb-3">
          <Avatar user={profile} size="md" anonymous={anonymous || room === "anonymous"} />
          <div className="flex-1">
            <p className="font-semibold text-sm">{anonymous || room === "anonymous" ? "นิรนาม" : profile.displayName}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {/* Room picker */}
              <button onClick={() => setShowRoomPicker(!showRoomPicker)} className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${dark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                <RoomIcon className="w-3 h-3" /> {currentRoom.name} ▾
              </button>
              {/* Anonymous toggle (only if not in anonymous room) */}
              {room !== "anonymous" && (
                <button onClick={() => setAnonymous(!anonymous)} className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${anonymous ? "bg-purple-500 border-purple-500 text-white" : dark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"}`}>
                  <EyeOffIcon className="w-3 h-3" /> นิรนาม
                </button>
              )}
            </div>
            {showRoomPicker && (
              <div className={`mt-2 grid grid-cols-2 gap-1 p-2 rounded-xl border ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} shadow-lg`}>
                {ROOMS.map((r) => {
                  const I = r.icon;
                  return (
                    <button key={r.id} onClick={() => { setRoom(r.id); setShowRoomPicker(false); }} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs ${room === r.id ? "bg-blue-500 text-white" : dark ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}>
                      <I className="w-3 h-3" /> {r.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="คุณกำลังคิดอะไรอยู่?" className={`w-full bg-transparent text-lg focus:outline-none resize-none min-h-[100px] ${dark ? "placeholder-slate-500" : "placeholder-slate-400"}`} autoFocus />

        {/* Poll editor */}
        {pollMode && (
          <div className={`rounded-2xl border p-3 mb-3 ${dark ? "bg-slate-800 border-slate-700" : "bg-blue-50 border-blue-200"}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> โพล</p>
              <button onClick={() => { setPollMode(false); setPollOptions(["", ""]); }} className="text-xs text-red-500">ยกเลิกโพล</button>
            </div>
            {pollOptions.map((opt, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input value={opt} onChange={(e) => { const n = [...pollOptions]; n[idx] = e.target.value; setPollOptions(n); }} placeholder={`ตัวเลือก ${idx + 1}`} className={`flex-1 rounded-xl px-3 py-2 text-sm border focus:outline-none focus:border-blue-400 ${dark ? "bg-black border-slate-700 text-slate-100" : "bg-white border-slate-200"}`} />
                {pollOptions.length > 2 && (
                  <button onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))} className="text-red-500 px-2"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
            {pollOptions.length < 6 && (
              <button onClick={() => setPollOptions([...pollOptions, ""])} className="text-xs text-black dark:text-white font-semibold underline">
                <Plus className="w-3 h-3" /> เพิ่มตัวเลือก
              </button>
            )}
          </div>
        )}

        {imageUrl && (
          <div className="relative rounded-2xl overflow-hidden mt-3">
            <img src={imageUrl} alt="" className="w-full max-h-80 object-cover" />
            <button onClick={() => setImageUrl("")} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"><X className="w-4 h-4" /></button>
          </div>
        )}

        {!imageUrl && !pollMode && (
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

      {/* Action toolbar */}
      <div className={`border-t p-3 flex gap-2 flex-wrap ${dark ? "border-slate-700" : "border-slate-200"}`}>
        <button onClick={() => setPollMode(!pollMode)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium ${pollMode ? "bg-black text-white dark:bg-white dark:text-black" : dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
          <BarChart3 className="w-4 h-4" /> {pollMode ? "ปิดโพล" : "เพิ่มโพล"}
        </button>
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
    <div className={`h-full overflow-y-auto ${dark ? "bg-black" : "bg-white"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 p-4 flex items-center gap-3 ${dark ? "bg-black border-slate-800" : "bg-white border-slate-200"} border-b`}>
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
            <button key={k} onClick={() => setTab(k)} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === k ? "bg-black dark:bg-white text-white" : dark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}`}>{l}</button>
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
    createNotif(user.id, "friend_request", myProfile);
    toast("ส่งคำขอแล้ว ✓");
  };
  const accept = async () => {
    await updateDoc(doc(db, "users", myProfile.id), { friends: arrayUnion(user.id), friendRequests: arrayRemove(user.id) });
    await updateDoc(doc(db, "users", user.id), { friends: arrayUnion(myProfile.id) });
    createNotif(user.id, "friend_accept", myProfile);
    toast("เพิ่มเพื่อนแล้ว 🎉");
  };
  const decline = async () => { await updateDoc(doc(db, "users", myProfile.id), { friendRequests: arrayRemove(user.id) }); toast("ปฏิเสธคำขอ"); };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl ${dark ? "hover:bg-slate-900" : "hover:bg-slate-50"}`}>
      <button onClick={() => onProfile(user.id)} className="flex items-center gap-3 flex-1">
        <Avatar user={user} size="lg" />
        <div className="text-left">
          <p className={`font-semibold text-sm ${textPrimary}`}>{user.displayName}</p>
          <p className={`text-xs ${textSecondary}`}>@{user.username}</p>
        </div>
      </button>
      {isFriend ? (
        <button onClick={() => onChat(user.id)} className={`w-10 h-10 rounded-full ${dark ? "bg-slate-900 text-white" : "bg-slate-100 text-black"} flex items-center justify-center`}><MessageSquare className="w-5 h-5" /></button>
      ) : incomingRequest ? (
        <div className="flex gap-1">
          <button onClick={accept} className="px-3 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold">รับ</button>
          <button onClick={decline} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${dark ? "bg-slate-700" : "bg-slate-100"}`}>ปฏิเสธ</button>
        </div>
      ) : isPending ? (
        <span className={`text-xs px-3 ${textSecondary}`}>รอตอบรับ</span>
      ) : (
        <button onClick={sendReq} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold"><UserPlus className="w-3 h-3" />เพิ่ม</button>
      )}
    </div>
  );
}

// ====== Messages ======
function MessagesPage({ onBack, onChat, onGroupChat }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const [users, setUsers] = useState({});
  const [groups, setGroups] = useState([]);
  const [tab, setTab] = useState("direct");
  const [showCreator, setShowCreator] = useState(false);
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

  useEffect(() => {
    const q = query(collection(db, "groupChats"), where("members", "array-contains", profile.id));
    const unsub = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [profile.id]);

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-black" : "bg-white"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 p-4 flex items-center gap-3 ${dark ? "bg-black border-slate-800" : "bg-white border-slate-200"} border-b`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg flex-1">ข้อความ</h2>
        <button onClick={() => setShowCreator(true)} className="w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-md">
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="px-3 pt-3">
        <div className="flex gap-2 mb-3">
          <button onClick={() => setTab("direct")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === "direct" ? "bg-black dark:bg-white text-white" : dark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}`}>
            ส่วนตัว
          </button>
          <button onClick={() => setTab("groups")} className={`flex-1 py-2 rounded-xl text-sm font-semibold ${tab === "groups" ? "bg-black dark:bg-white text-white" : dark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}`}>
            กลุ่ม ({groups.length})
          </button>
        </div>
      </div>
      <div className="p-3 space-y-1">
        {tab === "direct" && (
          <>
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
          </>
        )}
        {tab === "groups" && (
          <>
            {groups.length === 0 && (
              <div className="text-center py-12">
                <p className={textSecondary}>ยังไม่มีกลุ่มแชท</p>
                <button onClick={() => setShowCreator(true)} className="mt-3 px-4 py-2 rounded-full bg-black dark:bg-white text-white text-sm font-semibold">
                  + สร้างกลุ่มแรก
                </button>
              </div>
            )}
            {groups.map((g) => (
              <button key={g.id} onClick={() => onGroupChat(g.id)} className={`w-full flex items-center gap-3 p-2 rounded-2xl ${dark ? "hover:bg-slate-800" : "hover:bg-slate-100"}`}>
                <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-md">
                  {g.emoji || "👥"}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-semibold text-sm ${textPrimary}`}>{g.name}</p>
                  <p className={`text-xs ${textSecondary}`}>{(g.members || []).length} คน</p>
                </div>
              </button>
            ))}
          </>
        )}
      </div>
      {showCreator && <GroupCreator onClose={() => setShowCreator(false)} onCreated={(gid) => { setShowCreator(false); onGroupChat(gid); }} />}
    </div>
  );
}

function GroupCreator({ onClose, onCreated }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const toast = useToast();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("👥");
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [users, setUsers] = useState({});
  const friendIds = profile.friends || [];

  const EMOJIS = ["👥", "👨‍👩‍👧", "🎉", "🎮", "🍕", "☕", "💼", "🎬", "🎵", "⚽", "🎨", "📚"];

  useEffect(() => {
    if (friendIds.length === 0) return;
    Promise.all(friendIds.map((id) => getDoc(doc(db, "users", id)))).then((snaps) => {
      const map = {};
      snaps.forEach((s) => { if (s.exists()) map[s.id] = { id: s.id, ...s.data() }; });
      setUsers(map);
    });
  }, [friendIds.join(",")]);

  const toggle = (id) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const create = async () => {
    if (!name.trim()) { toast("ใส่ชื่อกลุ่ม"); return; }
    if (selected.size < 1) { toast("เลือกอย่างน้อย 1 คน"); return; }
    setBusy(true);
    const ref = await addDoc(collection(db, "groupChats"), {
      name: name.trim(),
      emoji,
      members: [profile.id, ...Array.from(selected)],
      createdBy: profile.id,
      createdAt: serverTimestamp(),
    });
    toast("สร้างกลุ่มแล้ว 🎉");
    onCreated(ref.id);
  };

  const textPrimary = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`fixed inset-0 z-[60] flex flex-col ${dark ? "bg-black text-slate-100" : "bg-white text-slate-800"}`}>
      <div className={`flex items-center justify-between p-4 border-b ${dark ? "border-slate-700" : "border-slate-200"}`}>
        <button onClick={onClose}><X className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg">สร้างกลุ่มแชท</h2>
        <button onClick={create} disabled={busy || !name.trim() || selected.size === 0} className="px-4 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold disabled:opacity-30 text-sm">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "สร้าง"}
        </button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <p className={`text-xs font-semibold mb-2 ${textSecondary}`}>ไอคอนกลุ่ม</p>
        <div className="grid grid-cols-6 gap-2 mb-4">
          {EMOJIS.map((e) => (
            <button key={e} onClick={() => setEmoji(e)} className={`text-2xl p-2 rounded-xl ${emoji === e ? "bg-black dark:bg-white scale-110" : dark ? "bg-slate-800" : "bg-slate-100"}`}>{e}</button>
          ))}
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="ชื่อกลุ่ม" className={`w-full rounded-2xl px-4 py-3 mb-4 focus:outline-none focus:border-blue-400 border-2 ${dark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200"}`} />
        <p className={`text-xs font-semibold mb-2 ${textSecondary}`}>เลือกเพื่อน ({selected.size} คน)</p>
        {friendIds.length === 0 ? (
          <p className={`text-center py-8 text-sm ${textSecondary}`}>ยังไม่มีเพื่อน — เพิ่มเพื่อนก่อนสร้างกลุ่ม</p>
        ) : (
          <div className="space-y-2">
            {friendIds.map((id) => {
              const u = users[id];
              if (!u) return null;
              const isSelected = selected.has(id);
              return (
                <button key={id} onClick={() => toggle(id)} className={`w-full flex items-center gap-3 p-2 rounded-2xl border-2 ${isSelected ? "border-black dark:border-white bg-slate-50 dark:bg-slate-900" : dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
                  <Avatar user={u} size="md" />
                  <div className="flex-1 text-left">
                    <p className={`font-semibold text-sm ${textPrimary}`}>{u.displayName}</p>
                    <p className={`text-xs ${textSecondary}`}>@{u.username}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "bg-black dark:bg-white border-black dark:border-white" : dark ? "border-slate-600" : "border-slate-300"}`}>
                    {isSelected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ====== Sticker Picker ======
function StickerPicker({ onSelect, onClose, dark }) {
  const [tab, setTab] = useState("faces");
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-md mx-auto rounded-t-3xl p-4 max-h-[60vh] flex flex-col animate-slideup ${dark ? "bg-slate-800" : "bg-white"}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-bold ${dark ? "text-slate-100" : "text-slate-800"}`}>เลือกสติกเกอร์</h3>
          <button onClick={onClose}><X className={`w-5 h-5 ${dark ? "text-slate-400" : "text-slate-500"}`} /></button>
        </div>
        <div className="flex gap-1 mb-3 overflow-x-auto">
          {Object.entries(STICKER_PACKS).map(([k, v]) => (
            <button key={k} onClick={() => setTab(k)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold ${tab === k ? "bg-black dark:bg-white text-white" : dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
              {v.name}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-6 gap-2">
            {STICKER_PACKS[tab].stickers.map((s, idx) => (
              <button key={idx} onClick={() => { onSelect(s); onClose(); }} className={`aspect-square text-3xl rounded-xl flex items-center justify-center ${dark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-50 hover:bg-slate-100"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== GIF Picker (Tenor) ======
function GifPicker({ onSelect, onClose, dark }) {
  const [query, setQuery] = useState("happy");
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        // Tenor public API (free, no key needed for basic usage)
        const url = `https://g.tenor.com/v1/search?q=${encodeURIComponent(query)}&key=LIVDSRZULELA&limit=20&media_filter=minimal`;
        const r = await fetch(url);
        const data = await r.json();
        setGifs(data.results || []);
      } catch (e) {
        console.error("GIF fetch error:", e);
        setGifs([]);
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-md mx-auto rounded-t-3xl p-4 max-h-[70vh] flex flex-col animate-slideup ${dark ? "bg-slate-800" : "bg-white"}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-bold ${dark ? "text-slate-100" : "text-slate-800"}`}>เลือก GIF</h3>
          <button onClick={onClose}><X className={`w-5 h-5 ${dark ? "text-slate-400" : "text-slate-500"}`} /></button>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหา GIF..." className={`w-full mb-3 px-4 py-2 rounded-full text-sm focus:outline-none border ${dark ? "bg-black border-slate-700 text-slate-100" : "bg-slate-50 border-slate-200"}`} autoFocus />
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-black dark:text-white" /></div>
          ) : gifs.length === 0 ? (
            <p className={`text-center py-8 text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>ไม่พบ GIF</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {gifs.map((g) => {
                const url = g.media?.[0]?.tinygif?.url || g.media?.[0]?.gif?.url;
                if (!url) return null;
                return (
                  <button key={g.id} onClick={() => { onSelect(url); onClose(); }} className="rounded-lg overflow-hidden bg-slate-100">
                    <img src={url} alt="" className="w-full" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <p className={`text-[10px] text-center mt-2 ${dark ? "text-slate-500" : "text-slate-400"}`}>Powered by Tenor</p>
      </div>
    </div>
  );
}

// ====== Chat ======
function ChatPage({ uid, onBack }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const [other, setOther] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const scrollRef = useRef(null);
  const typingTimerRef = useRef(null);
  const chatId = [profile.id, uid].sort().join("_");

  useEffect(() => { if (uid) getDoc(doc(db, "users", uid)).then((s) => s.exists() && setOther({ id: s.id, ...s.data() })); }, [uid]);

  // Listen to messages
  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [chatId]);

  // Listen to typing indicator
  useEffect(() => {
    if (!chatId || !uid) return;
    const ref = doc(db, "chats", chatId);
    const unsub = onSnapshot(ref, (s) => {
      if (s.exists()) {
        const data = s.data();
        const typingTs = data.typing?.[uid];
        if (typingTs && typingTs.toMillis) {
          const ago = Date.now() - typingTs.toMillis();
          setOtherTyping(ago < 4000);
        } else {
          setOtherTyping(false);
        }
      }
    });
    const interval = setInterval(() => {
      // Re-check typing freshness
      setOtherTyping((prev) => prev);
    }, 1500);
    return () => { unsub(); clearInterval(interval); };
  }, [chatId, uid]);

  // Mark messages as read
  useEffect(() => {
    if (!messages.length || !chatId) return;
    const unread = messages.filter((m) => m.from === uid && !m.readBy?.includes(profile.id));
    if (unread.length === 0) return;
    unread.forEach(async (m) => {
      try {
        await updateDoc(doc(db, "chats", chatId, "messages", m.id), {
          readBy: arrayUnion(profile.id),
        });
      } catch (e) {}
    });
  }, [messages, chatId, uid, profile.id]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages.length, otherTyping]);

  const setTypingStatus = async () => {
    try {
      await setDoc(doc(db, "chats", chatId), {
        [`typing.${profile.id}`]: serverTimestamp(),
      }, { merge: true });
    } catch (e) {}
  };

  const handleTextChange = (val) => {
    setText(val);
    if (val) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      setTypingStatus();
      typingTimerRef.current = setTimeout(() => {}, 3000);
    }
  };

  const submit = async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText("");
    await addDoc(collection(db, "chats", chatId, "messages"), {
      from: profile.id, to: uid, text: msg, createdAt: serverTimestamp(), readBy: [profile.id]
    });
  };

  const sendGif = async (gifUrl) => {
    await addDoc(collection(db, "chats", chatId, "messages"), {
      from: profile.id, to: uid, gif: gifUrl, createdAt: serverTimestamp(), readBy: [profile.id]
    });
  };

  const sendSticker = async (sticker) => {
    await addDoc(collection(db, "chats", chatId, "messages"), {
      from: profile.id, to: uid, sticker: sticker, createdAt: serverTimestamp(), readBy: [profile.id]
    });
  };

  if (!other) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" /></div>;
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";

  return (
    <div className={`h-full flex flex-col ${dark ? "bg-black" : "bg-white"} ${textPrimary}`}>
      <div className={`backdrop-blur-xl p-3 flex items-center gap-3 border-b ${dark ? "bg-slate-800/90 border-slate-700" : "bg-white/90 border-slate-200"}`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <Avatar user={other} size="md" />
        <div className="flex-1">
          <p className="font-semibold text-sm">{other.displayName}</p>
          <p className="text-[11px] text-slate-400">{otherTyping ? "กำลังพิมพ์..." : "ออนไลน์"}</p>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && <div className={`text-center py-12 text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>ส่งข้อความแรกหา {other.displayName} เลย!</div>}
        {messages.map((m, idx) => {
          const isMe = m.from === profile.id;
          const isLast = idx === messages.length - 1;
          const isRead = isMe && m.readBy?.includes(uid);
          return (
            <div key={m.id}>
              <div className={`flex gap-2 items-end ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe && <Avatar user={other} size="xs" />}
                {m.gif ? (
                  <div className={`max-w-[60%] rounded-2xl overflow-hidden ${isMe ? "rounded-br-md" : "rounded-bl-md"} shadow-md`}>
                    <img src={m.gif} alt="" className="w-full" />
                    <p className={`text-[10px] px-2 py-1 ${isMe ? "bg-blue-500 text-white/80" : dark ? "bg-slate-800 text-slate-400" : "bg-white text-slate-400"}`}>{fmtTime(m.createdAt)}</p>
                  </div>
                ) : m.sticker ? (
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <span className="text-7xl leading-none">{m.sticker}</span>
                    <p className={`text-[10px] mt-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>{fmtTime(m.createdAt)}</p>
                  </div>
                ) : (
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-black dark:bg-white text-white rounded-br-md shadow-md" : dark ? "bg-slate-800 border border-slate-700 rounded-bl-md text-slate-100" : "bg-white border border-slate-200 rounded-bl-md shadow-sm"}`}>
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-0.5 ${isMe ? "text-white/80" : dark ? "text-slate-500" : "text-slate-400"}`}>{fmtTime(m.createdAt)}</p>
                  </div>
                )}
              </div>
              {/* Read receipt below my last message */}
              {isMe && isLast && (
                <p className={`text-[10px] mt-1 mr-2 text-right ${isRead ? "text-black dark:text-white font-semibold" : dark ? "text-slate-500" : "text-slate-400"}`}>
                  {isRead ? "✓✓ อ่านแล้ว" : "✓ ส่งแล้ว"}
                </p>
              )}
            </div>
          );
        })}
        {otherTyping && (
          <div className="flex gap-2 items-end">
            <Avatar user={other} size="xs" />
            <div className={`px-4 py-2 rounded-2xl rounded-bl-md ${dark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"} shadow-sm`}>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={`border-t p-3 flex items-center gap-2 ${dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
        <button onClick={() => setShowStickerPicker(true)} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${dark ? "bg-slate-700" : "bg-slate-100"}`}>😀</button>
        <button onClick={() => setShowGifPicker(true)} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>GIF</button>
        <div className={`flex-1 flex items-center rounded-full px-4 py-2 ${dark ? "bg-slate-900" : "bg-slate-100"}`}>
          <input value={text} onChange={(e) => handleTextChange(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="พิมพ์ข้อความ..." className={`flex-1 bg-transparent text-sm focus:outline-none ${textPrimary}`} />
        </div>
        <button onClick={submit} disabled={!text.trim()} className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center disabled:opacity-30">
          <Send className="w-4 h-4 text-white dark:text-black" />
        </button>
      </div>
      {showGifPicker && <GifPicker onSelect={sendGif} onClose={() => setShowGifPicker(false)} dark={dark} />}
      {showStickerPicker && <StickerPicker onSelect={sendSticker} onClose={() => setShowStickerPicker(false)} dark={dark} />}
    </div>
  );
}

// ====== Group Chat ======
function GroupChatPage({ groupId, onBack, onProfile }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState({});
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!groupId) return;
    const unsub = onSnapshot(doc(db, "groupChats", groupId), (s) => {
      if (s.exists()) {
        const g = { id: s.id, ...s.data() };
        setGroup(g);
        // Fetch member profiles
        Promise.all((g.members || []).map((id) => getDoc(doc(db, "users", id)))).then((snaps) => {
          const map = {};
          snaps.forEach((sn) => { if (sn.exists()) map[sn.id] = { id: sn.id, ...sn.data() }; });
          setMembers(map);
        });
      }
    });
    return () => unsub();
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    const q = query(collection(db, "groupChats", groupId, "messages"), orderBy("createdAt", "asc"), limit(200));
    const unsub = onSnapshot(q, (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [groupId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages.length]);

  const submit = async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText("");
    await addDoc(collection(db, "groupChats", groupId, "messages"), {
      from: profile.id, fromName: profile.displayName, fromAvatar: profile.avatar, fromAvatarUrl: profile.avatarUrl || "",
      text: msg, createdAt: serverTimestamp()
    });
  };

  const sendGif = async (gifUrl) => {
    await addDoc(collection(db, "groupChats", groupId, "messages"), {
      from: profile.id, fromName: profile.displayName, fromAvatar: profile.avatar, fromAvatarUrl: profile.avatarUrl || "",
      gif: gifUrl, createdAt: serverTimestamp()
    });
  };

  const sendSticker = async (sticker) => {
    await addDoc(collection(db, "groupChats", groupId, "messages"), {
      from: profile.id, fromName: profile.displayName, fromAvatar: profile.avatar, fromAvatarUrl: profile.avatarUrl || "",
      sticker: sticker, createdAt: serverTimestamp()
    });
  };

  if (!group) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" /></div>;
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";

  return (
    <div className={`h-full flex flex-col ${dark ? "bg-black" : "bg-white"} ${textPrimary}`}>
      <div className={`backdrop-blur-xl p-3 flex items-center gap-3 border-b ${dark ? "bg-slate-800/90 border-slate-700" : "bg-white/90 border-slate-200"}`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <button onClick={() => setShowInfo(true)} className="flex items-center gap-3 flex-1 text-left">
          <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-md">
            {group.emoji || "👥"}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{group.name}</p>
            <p className={`text-[11px] ${dark ? "text-slate-400" : "text-slate-500"}`}>{(group.members || []).length} คน</p>
          </div>
        </button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && <div className={`text-center py-12 text-sm ${dark ? "text-slate-500" : "text-slate-400"}`}>ยังไม่มีข้อความในกลุ่ม</div>}
        {messages.map((m, idx) => {
          const isMe = m.from === profile.id;
          const prev = messages[idx - 1];
          const showSender = !isMe && (!prev || prev.from !== m.from);
          const fakeUser = { avatar: m.fromAvatar, avatarUrl: m.fromAvatarUrl };
          return (
            <div key={m.id}>
              {showSender && (
                <p className={`text-[10px] ml-9 mb-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>{m.fromName}</p>
              )}
              <div className={`flex gap-2 items-end ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe ? (
                  <Avatar user={fakeUser} size="xs" onClick={() => onProfile(m.from)} />
                ) : null}
                {m.gif ? (
                  <div className={`max-w-[60%] rounded-2xl overflow-hidden ${isMe ? "rounded-br-md" : "rounded-bl-md"} shadow-md`}>
                    <img src={m.gif} alt="" className="w-full" />
                    <p className={`text-[10px] px-2 py-1 ${isMe ? "bg-blue-500 text-white/80" : dark ? "bg-slate-800 text-slate-400" : "bg-white text-slate-400"}`}>{fmtTime(m.createdAt)}</p>
                  </div>
                ) : m.sticker ? (
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <span className="text-7xl leading-none">{m.sticker}</span>
                    <p className={`text-[10px] mt-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>{fmtTime(m.createdAt)}</p>
                  </div>
                ) : (
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-black dark:bg-white text-white rounded-br-md shadow-md" : dark ? "bg-slate-800 border border-slate-700 rounded-bl-md text-slate-100" : "bg-white border border-slate-200 rounded-bl-md shadow-sm"}`}>
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-0.5 ${isMe ? "text-white/80" : dark ? "text-slate-500" : "text-slate-400"}`}>{fmtTime(m.createdAt)}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className={`border-t p-3 flex items-center gap-2 ${dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
        <button onClick={() => setShowStickerPicker(true)} className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${dark ? "bg-slate-700" : "bg-slate-100"}`}>😀</button>
        <button onClick={() => setShowGifPicker(true)} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${dark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}>GIF</button>
        <div className={`flex-1 flex items-center rounded-full px-4 py-2 ${dark ? "bg-slate-900" : "bg-slate-100"}`}>
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="พิมพ์ข้อความ..." className={`flex-1 bg-transparent text-sm focus:outline-none ${textPrimary}`} />
        </div>
        <button onClick={submit} disabled={!text.trim()} className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center disabled:opacity-30">
          <Send className="w-4 h-4 text-white dark:text-black" />
        </button>
      </div>
      {showGifPicker && <GifPicker onSelect={sendGif} onClose={() => setShowGifPicker(false)} dark={dark} />}
      {showStickerPicker && <StickerPicker onSelect={sendSticker} onClose={() => setShowStickerPicker(false)} dark={dark} />}
      {showInfo && <GroupInfoSheet group={group} members={members} onClose={() => setShowInfo(false)} onProfile={onProfile} dark={dark} />}
    </div>
  );
}

function GroupInfoSheet({ group, members, onClose, onProfile, dark }) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-md mx-auto rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto animate-slideup ${dark ? "bg-slate-800 text-slate-100" : "bg-white text-slate-800"}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">ข้อมูลกลุ่ม</h3>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="text-center mb-4">
          <div className="inline-flex w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 items-center justify-center text-4xl shadow-lg mb-2">{group.emoji || "👥"}</div>
          <h4 className="text-xl font-bold">{group.name}</h4>
          <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>{(group.members || []).length} สมาชิก</p>
        </div>
        <h5 className={`text-xs font-bold uppercase tracking-wider mb-2 ${dark ? "text-slate-400" : "text-slate-500"}`}>สมาชิก</h5>
        <div className="space-y-2">
          {(group.members || []).map((id) => {
            const u = members[id];
            if (!u) return null;
            return (
              <button key={id} onClick={() => { onClose(); onProfile(id); }} className={`w-full flex items-center gap-3 p-2 rounded-xl ${dark ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}>
                <Avatar user={u} size="md" />
                <div className="text-left flex-1">
                  <p className="font-semibold text-sm">{u.displayName}</p>
                  <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>@{u.username}</p>
                </div>
                {id === group.createdBy && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold">ผู้สร้าง</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ====== Notifications ======
function NotificationsPage({ onBack }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users", profile.id, "notifications"), orderBy("createdAt", "desc"), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      setNotifs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });
    return () => unsub();
  }, [profile.id]);

  // Mark all as read on open
  useEffect(() => {
    const t = setTimeout(async () => {
      const unread = notifs.filter((n) => !n.read);
      for (const n of unread) {
        try { await updateDoc(doc(db, "users", profile.id, "notifications", n.id), { read: true }); } catch (e) {}
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [notifs.length, profile.id]);

  const labels = {
    like: "ถูกใจโพสต์ของคุณ",
    comment: "แสดงความคิดเห็นในโพสต์ของคุณ",
    friend_request: "ส่งคำขอเป็นเพื่อน",
    friend_accept: "รับคำขอเป็นเพื่อน",
    comment_reaction: "รีแอคคอมเมนต์ของคุณ",
  };
  const icons = {
    like: "❤️", comment: "💬", friend_request: "👋", friend_accept: "🎉", comment_reaction: "😊",
  };

  const textPrimary = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-black" : "bg-white"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 p-4 flex items-center gap-3 ${dark ? "bg-black border-slate-800" : "bg-white border-slate-200"} border-b`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg">การแจ้งเตือน</h2>
      </div>
      <div className="p-3">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" /></div>
        ) : notifs.length === 0 ? (
          <div className={`rounded-2xl p-8 text-center border shadow-sm ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}`}>
            <Bell className={`w-12 h-12 mx-auto mb-3 ${dark ? "text-slate-600" : "text-slate-300"}`} />
            <p className={`text-sm ${textSecondary}`}>ยังไม่มีการแจ้งเตือน</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifs.map((n) => {
              const fakeUser = { avatar: n.fromAvatar, avatarUrl: n.fromAvatarUrl };
              return (
                <div key={n.id} className={`flex items-center gap-3 p-3 rounded-2xl ${!n.read ? (dark ? "bg-slate-900" : "bg-slate-50") : ""}`}>
                  <div className="relative">
                    <Avatar user={fakeUser} size="md" />
                    <span className="absolute -bottom-1 -right-1 text-base bg-white dark:bg-slate-700 rounded-full w-6 h-6 flex items-center justify-center border-2 border-white dark:border-slate-700 text-xs">{icons[n.type] || "🔔"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${textPrimary}`}><span className="font-semibold">{n.fromName}</span> <span className={textSecondary}>{labels[n.type] || "แจ้งเตือน"}</span></p>
                    <p className={`text-[11px] ${textSecondary}`}>{fmtTime(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-black dark:bg-white shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ====== Profile (BUG FIXED!) ======
function ProfilePage({ uid, onBack, onSettings, onProfile }) {
  const { profile: me, setProfile, theme } = useAuth();
  const dark = theme === "dark";
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({ displayName: "", bio: "", avatar: "", avatarUrl: "", birthday: "" });
  const isOwn = uid === me.id;

  useEffect(() => {
    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(ref, (s) => {
      if (s.exists()) {
        const u = { id: s.id, ...s.data() };
        setUser(u);
        setEdit({ displayName: u.displayName || "", bio: u.bio || "", avatar: u.avatar || "🐻", avatarUrl: u.avatarUrl || "", birthday: u.birthday || "" });
      }
    });
    return () => unsub();
  }, [uid]);

  // FIX: ใช้ where อย่างเดียว แล้ว sort ใน client (เลี่ยง composite index)
  useEffect(() => {
    setPostsLoading(true);
    const q = query(collection(db, "posts"), where("userId", "==", uid));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // sort: pinned first, then by createdAt desc
      list.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const ta = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tb = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tb - ta;
      });
      // filter out anonymous posts (don't show on profile)
      const visible = list.filter((p) => !p.anonymous);
      setPosts(visible);
      setPostsLoading(false);
    }, (err) => {
      console.error("Profile posts error:", err);
      setPostsLoading(false);
    });
    return () => unsub();
  }, [uid]);

  const saveEdit = async () => {
    const update = { displayName: edit.displayName, bio: edit.bio, avatar: edit.avatar, avatarUrl: edit.avatarUrl, birthday: edit.birthday || "" };
    await updateDoc(doc(db, "users", me.id), update);
    setProfile({ ...me, ...update });
    setEditing(false);
    toast("บันทึกแล้ว ✓");
  };

  if (!user) return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-black dark:text-white" /></div>;

  const textPrimary = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-black" : "bg-white"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 p-4 flex items-center justify-between ${dark ? "bg-black border-slate-800" : "bg-white border-slate-200"} border-b`}>
        {onBack ? <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button> : <div className="w-6" />}
        <h2 className="font-bold">@{user.username}</h2>
        {isOwn ? <button onClick={onSettings}><Settings className="w-6 h-6" /></button> : <div className="w-6" />}
      </div>
      <div className="p-6 text-center">
        <div className="inline-block relative">
          <Avatar user={user} size="xl" />
          {isOwn && (
            <button onClick={() => setEditing(true)} className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-black dark:bg-white border-2 border-white dark:border-black text-white dark:text-black flex items-center justify-center shadow-lg">
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
          {postsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-black dark:text-white" /></div>
          ) : posts.length === 0 ? (
            <p className={`text-center py-8 text-sm ${textSecondary}`}>ยังไม่มีโพสต์</p>
          ) : (
            posts.map((p) => <PostCard key={p.id} post={p} onProfile={onProfile} />)
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setEditing(false)}>
          <div onClick={(e) => e.stopPropagation()} className={`rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideup ${dark ? "bg-black border-t border-slate-800" : "bg-white"}`}>
            <h3 className={`text-xl font-bold mb-4 ${textPrimary}`}>แก้ไขโปรไฟล์</h3>

            <p className={`text-xs font-semibold mb-2 ${textSecondary}`}>📷 ใช้รูปจาก URL</p>
            <div className="relative mb-3">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={edit.avatarUrl} onChange={(e) => setEdit({ ...edit, avatarUrl: e.target.value })} placeholder="วาง URL รูป (เช่น https://...)" className={`w-full rounded-xl pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 border ${dark ? "bg-black border-slate-700 text-slate-100" : "bg-white border-slate-200"}`} />
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
                <button key={a} onClick={() => setEdit({ ...edit, avatar: a, avatarUrl: "" })} className={`text-2xl p-1.5 rounded-lg transition ${edit.avatar === a && !edit.avatarUrl ? "bg-black dark:bg-white scale-110" : dark ? "bg-slate-700" : "bg-slate-100"}`}>{a}</button>
              ))}
            </div>

            <input value={edit.displayName} onChange={(e) => setEdit({ ...edit, displayName: e.target.value })} placeholder="ชื่อแสดง" className={`w-full rounded-2xl px-4 py-3 mb-3 focus:outline-none focus:border-blue-400 border-2 ${dark ? "bg-black border-slate-700 text-slate-100" : "bg-white border-slate-200"}`} />
            <textarea value={edit.bio} onChange={(e) => setEdit({ ...edit, bio: e.target.value })} placeholder="เกี่ยวกับคุณ..." rows={3} className={`w-full rounded-2xl px-4 py-3 mb-3 focus:outline-none focus:border-blue-400 border-2 resize-none ${dark ? "bg-black border-slate-700 text-slate-100" : "bg-white border-slate-200"}`} />

            <p className={`text-xs font-semibold mb-2 ${textSecondary}`}>🎂 วันเกิด (เพื่อนจะเห็นวันนี้วันเกิดคุณ)</p>
            <div className="flex gap-2 mb-4">
              <select
                value={edit.birthday ? edit.birthday.split("-")[0] : ""}
                onChange={(e) => {
                  const m = e.target.value;
                  const d = edit.birthday ? edit.birthday.split("-")[1] || "" : "";
                  setEdit({ ...edit, birthday: m && d ? `${m}-${d}` : (m ? `${m}-1` : "") });
                }}
                className={`flex-1 rounded-xl px-3 py-2.5 text-sm border-2 focus:outline-none focus:border-blue-400 ${dark ? "bg-black border-slate-700 text-slate-100" : "bg-white border-slate-200"}`}
              >
                <option value="">เลือกเดือน</option>
                {["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <select
                value={edit.birthday ? edit.birthday.split("-")[1] || "" : ""}
                onChange={(e) => {
                  const d = e.target.value;
                  const m = edit.birthday ? edit.birthday.split("-")[0] || "" : "";
                  setEdit({ ...edit, birthday: m && d ? `${m}-${d}` : "" });
                }}
                className={`w-24 rounded-xl px-3 py-2.5 text-sm border-2 focus:outline-none focus:border-blue-400 ${dark ? "bg-black border-slate-700 text-slate-100" : "bg-white border-slate-200"}`}
              >
                <option value="">วัน</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {edit.birthday && (
                <button onClick={() => setEdit({ ...edit, birthday: "" })} className="text-red-500 text-xs px-2">ลบ</button>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className={`flex-1 py-3 rounded-2xl font-semibold ${dark ? "bg-slate-700 text-slate-200" : "bg-slate-100"}`}>ยกเลิก</button>
              <button onClick={saveEdit} className="flex-1 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold">บันทึก</button>
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
    <div className={`h-full overflow-y-auto ${dark ? "bg-black" : "bg-white"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 p-4 flex items-center gap-3 ${dark ? "bg-black border-slate-800" : "bg-white border-slate-200"} border-b`}>
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

        <button onClick={handleLogout} className="w-full bg-transparent border border-red-500 text-red-500 font-semibold py-3 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" /> ออกจากระบบ
        </button>
        <p className={`text-center text-xs pt-8 ${textSecondary}`}>Playvo v1.6 · Play Every Moment</p>
      </div>
    </div>
  );
}

// ====== GAMES ======

const GAMES = [
  { id: "ox", name: "OX (Tic-tac-toe)", desc: "ท้าเพื่อน 1-vs-1 เรียง 3 ตัวก่อนชนะ", icon: "⭕", gradient: "from-blue-500 to-cyan-500", needFriend: true },
  { id: "rps", name: "เป่ายิ้งฉุบ", desc: "เลือกพร้อมกัน ใครชนะ?", icon: "✊", gradient: "from-orange-500 to-pink-500", needFriend: true },
  { id: "tod", name: "Truth or Dare", desc: "สุ่มคำถาม/ภารกิจ เล่นคนเดียวก็ได้", icon: "🎯", gradient: "from-violet-500 to-fuchsia-500", needFriend: false },
];

function GamesHubPage({ onBack, onPlay }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState({});
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  // Listen to matches I'm in
  useEffect(() => {
    const q = query(collection(db, "gameMatches"), where("players", "array-contains", profile.id));
    const unsub = onSnapshot(q, async (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // sort by updatedAt desc
      list.sort((a, b) => {
        const ta = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        const tb = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        return tb - ta;
      });
      setMatches(list.filter((m) => m.status !== "ended").slice(0, 20));

      // Fetch user profiles
      const allUids = new Set();
      list.forEach((m) => (m.players || []).forEach((u) => allUids.add(u)));
      const need = [...allUids].filter((u) => !users[u]);
      if (need.length > 0) {
        const snaps = await Promise.all(need.map((u) => getDoc(doc(db, "users", u))));
        const map = { ...users };
        snaps.forEach((s) => { if (s.exists()) map[s.id] = { id: s.id, ...s.data() }; });
        setUsers(map);
      }
    });
    return () => unsub();
  }, [profile.id]);

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-black" : "bg-white"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 p-4 flex items-center gap-3 ${dark ? "bg-black border-slate-800" : "bg-white border-slate-200"} border-b`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg flex items-center gap-2"><Gamepad2 className="w-5 h-5" /> เกม</h2>
      </div>

      <div className="p-3">
        {/* Active matches */}
        {matches.length > 0 && (
          <>
            <p className={`text-xs font-semibold mb-2 ${textSecondary}`}>🔴 เกมที่กำลังเล่น</p>
            <div className="space-y-2 mb-4">
              {matches.map((m) => {
                const game = GAMES.find((g) => g.id === m.gameId);
                if (!game) return null;
                const opponentId = (m.players || []).find((p) => p !== profile.id);
                const opp = opponentId ? users[opponentId] : null;
                const isMyTurn = m.gameId === "ox" && m.turn === profile.id;
                return (
                  <button key={m.id} onClick={() => onPlay(m.gameId, m.id)} className={`w-full flex items-center gap-3 p-3 rounded-2xl border shadow-sm ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.gradient} flex items-center justify-center text-2xl shadow`}>{game.icon}</div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">{game.name}</p>
                      <p className={`text-xs ${textSecondary}`}>{opp ? `กับ ${opp.displayName}` : "..."}</p>
                    </div>
                    {isMyTurn && <span className="text-xs px-2 py-1 rounded-full bg-red-500 text-white font-semibold animate-pulse">ตาคุณ</span>}
                    {!isMyTurn && m.status === "waiting" && <span className={`text-xs px-2 py-1 rounded-full ${dark ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>รอคู่ต่อสู้</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <p className={`text-xs font-semibold mb-2 ${textSecondary}`}>🎮 เลือกเกม</p>
        <div className="space-y-3">
          {GAMES.map((g) => (
            <button key={g.id} onClick={() => onPlay(g.id)} className={`w-full relative overflow-hidden rounded-2xl text-left shadow-md`}>
              <div className={`bg-gradient-to-br ${g.gradient} p-4 text-white`}>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{g.icon}</div>
                  <div className="flex-1">
                    <p className="font-bold text-base">{g.name}</p>
                    <p className="text-xs text-white/80">{g.desc}</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function GamePlayPage({ gameId, matchId, onBack }) {
  if (gameId === "ox") return <OXGame matchId={matchId} onBack={onBack} />;
  if (gameId === "rps") return <RPSGame matchId={matchId} onBack={onBack} />;
  if (gameId === "tod") return <TruthOrDareGame onBack={onBack} />;
  return <div className="p-4">เกมไม่พบ</div>;
}

// ====== Game: OX (Tic-tac-toe) ======
function OXGame({ matchId, onBack }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const toast = useToast();
  const [match, setMatch] = useState(null);
  const [opp, setOpp] = useState(null);
  const [showFriendPicker, setShowFriendPicker] = useState(!matchId);
  const [creating, setCreating] = useState(false);
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";

  // Listen to match
  useEffect(() => {
    if (!matchId) return;
    const unsub = onSnapshot(doc(db, "gameMatches", matchId), (s) => {
      if (s.exists()) {
        const m = { id: s.id, ...s.data() };
        setMatch(m);
        const oppId = (m.players || []).find((p) => p !== profile.id);
        if (oppId && (!opp || opp.id !== oppId)) {
          getDoc(doc(db, "users", oppId)).then((u) => { if (u.exists()) setOpp({ id: u.id, ...u.data() }); });
        }
      }
    });
    return () => unsub();
  }, [matchId, profile.id]);

  const startMatch = async (friendId) => {
    setCreating(true);
    const ref = await addDoc(collection(db, "gameMatches"), {
      gameId: "ox",
      players: [profile.id, friendId],
      board: ["", "", "", "", "", "", "", "", ""],
      turn: profile.id, // I start
      symbols: { [profile.id]: "X", [friendId]: "O" },
      status: "playing",
      winner: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setShowFriendPicker(false);
    setCreating(false);
    // Notify opponent
    createNotif(friendId, "comment", profile, { gameMatchId: ref.id, customText: "ท้าคุณเล่น OX! 🎮" });
    // Hack: navigate by reloading via parent — easier: just set local match
    window.location.hash = `#game/ox/${ref.id}`;
    setMatch({ id: ref.id, gameId: "ox", players: [profile.id, friendId], board: ["", "", "", "", "", "", "", "", ""], turn: profile.id, symbols: { [profile.id]: "X", [friendId]: "O" }, status: "playing", winner: null });
    toast("สร้างเกมแล้ว! รอเพื่อนเข้าร่วม");
  };

  const checkWinner = (board) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (board.every((c) => c)) return "draw";
    return null;
  };

  const play = async (idx) => {
    if (!match || match.status === "ended") return;
    if (match.turn !== profile.id) { toast("ไม่ใช่ตาคุณ"); return; }
    if (match.board[idx]) return;

    const newBoard = [...match.board];
    newBoard[idx] = match.symbols[profile.id];
    const oppId = match.players.find((p) => p !== profile.id);
    const result = checkWinner(newBoard);

    const update = {
      board: newBoard,
      turn: oppId,
      updatedAt: serverTimestamp(),
    };
    if (result) {
      update.status = "ended";
      update.winner = result === "draw" ? "draw" : profile.id;
    }
    await updateDoc(doc(db, "gameMatches", match.id), update);
  };

  const restart = async () => {
    const oppId = match.players.find((p) => p !== profile.id);
    await updateDoc(doc(db, "gameMatches", match.id), {
      board: ["", "", "", "", "", "", "", "", ""],
      turn: oppId, // loser starts (or other player)
      status: "playing",
      winner: null,
      updatedAt: serverTimestamp(),
    });
  };

  // Render: if no match yet, show friend picker
  if (!match && !showFriendPicker && !matchId) {
    setShowFriendPicker(true);
  }

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-black" : "bg-white"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 p-4 flex items-center gap-3 ${dark ? "bg-black border-slate-800" : "bg-white border-slate-200"} border-b`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg flex items-center gap-2">⭕❌ OX</h2>
      </div>

      {showFriendPicker && (
        <FriendPickerForGame onPick={startMatch} onCancel={onBack} busy={creating} title="เลือกเพื่อนเล่น OX" />
      )}

      {match && (
        <div className="p-4">
          {/* Players */}
          <div className="flex items-center justify-around mb-6">
            <div className="text-center">
              <Avatar user={profile} size="lg" />
              <p className="text-sm font-semibold mt-1">คุณ</p>
              <p className="text-3xl font-black text-blue-500">{match.symbols?.[profile.id] || "X"}</p>
            </div>
            <Swords className="w-8 h-8 text-slate-400" />
            <div className="text-center">
              {opp ? <Avatar user={opp} size="lg" /> : <div className="w-14 h-14 rounded-full bg-slate-200" />}
              <p className="text-sm font-semibold mt-1">{opp?.displayName || "..."}</p>
              <p className="text-3xl font-black text-fuchsia-500">{match.symbols?.[opp?.id] || "O"}</p>
            </div>
          </div>

          {/* Status */}
          <div className="text-center mb-4">
            {match.status === "ended" ? (
              <div className="space-y-2">
                {match.winner === "draw" ? (
                  <p className="text-lg font-bold text-amber-500">🤝 เสมอ!</p>
                ) : match.winner === profile.id ? (
                  <p className="text-2xl font-bold text-emerald-500">🎉 คุณชนะ!</p>
                ) : (
                  <p className="text-lg font-bold text-rose-500">😢 คุณแพ้</p>
                )}
                <button onClick={restart} className="px-6 py-2 rounded-full bg-black dark:bg-white text-white font-semibold inline-flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> เล่นอีกครั้ง
                </button>
              </div>
            ) : match.turn === profile.id ? (
              <p className="text-base font-semibold text-black dark:text-white animate-pulse">ตาคุณแล้ว!</p>
            ) : (
              <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>กำลังรอ {opp?.displayName || "คู่ต่อสู้"}...</p>
            )}
          </div>

          {/* Board */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {match.board.map((cell, idx) => (
              <button
                key={idx}
                onClick={() => play(idx)}
                disabled={match.status === "ended" || cell || match.turn !== profile.id}
                className={`aspect-square rounded-2xl text-5xl font-black flex items-center justify-center transition ${dark ? "bg-slate-800 border-2 border-slate-700" : "bg-white border-2 border-slate-200"} ${cell === "X" ? "text-blue-500" : cell === "O" ? "text-fuchsia-500" : ""} ${!cell && match.status === "playing" && match.turn === profile.id ? "hover:bg-blue-50 dark:hover:bg-slate-700" : ""}`}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ====== Game: Rock-Paper-Scissors ======
function RPSGame({ matchId, onBack }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const toast = useToast();
  const [match, setMatch] = useState(null);
  const [opp, setOpp] = useState(null);
  const [showFriendPicker, setShowFriendPicker] = useState(!matchId);
  const [creating, setCreating] = useState(false);
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";

  const CHOICES = [
    { id: "rock", emoji: "✊", name: "ค้อน" },
    { id: "paper", emoji: "✋", name: "กระดาษ" },
    { id: "scissors", emoji: "✌️", name: "กรรไกร" },
  ];

  useEffect(() => {
    if (!matchId) return;
    const unsub = onSnapshot(doc(db, "gameMatches", matchId), (s) => {
      if (s.exists()) {
        const m = { id: s.id, ...s.data() };
        setMatch(m);
        const oppId = (m.players || []).find((p) => p !== profile.id);
        if (oppId && (!opp || opp.id !== oppId)) {
          getDoc(doc(db, "users", oppId)).then((u) => { if (u.exists()) setOpp({ id: u.id, ...u.data() }); });
        }
      }
    });
    return () => unsub();
  }, [matchId, profile.id]);

  const startMatch = async (friendId) => {
    setCreating(true);
    const ref = await addDoc(collection(db, "gameMatches"), {
      gameId: "rps",
      players: [profile.id, friendId],
      choices: {},
      score: { [profile.id]: 0, [friendId]: 0 },
      status: "playing",
      round: 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setShowFriendPicker(false);
    setCreating(false);
    createNotif(friendId, "comment", profile, { gameMatchId: ref.id, customText: "ท้าคุณเป่ายิ้งฉุบ! ✊" });
    setMatch({ id: ref.id, gameId: "rps", players: [profile.id, friendId], choices: {}, score: { [profile.id]: 0, [friendId]: 0 }, status: "playing", round: 1 });
    toast("สร้างเกมแล้ว!");
  };

  const choose = async (choiceId) => {
    if (!match) return;
    if (match.choices?.[profile.id]) return;
    const newChoices = { ...(match.choices || {}), [profile.id]: choiceId };
    const oppId = match.players.find((p) => p !== profile.id);
    const update = { choices: newChoices, updatedAt: serverTimestamp() };

    // If both chose, calculate winner
    if (newChoices[oppId]) {
      const my = newChoices[profile.id];
      const theirs = newChoices[oppId];
      let winnerId = null;
      if (my !== theirs) {
        const wins = { rock: "scissors", paper: "rock", scissors: "paper" };
        winnerId = wins[my] === theirs ? profile.id : oppId;
      }
      const newScore = { ...match.score };
      if (winnerId) newScore[winnerId] = (newScore[winnerId] || 0) + 1;
      update.score = newScore;
      update.lastResult = { my, theirs, winner: winnerId };
    }
    await updateDoc(doc(db, "gameMatches", match.id), update);
  };

  const nextRound = async () => {
    await updateDoc(doc(db, "gameMatches", match.id), {
      choices: {},
      round: (match.round || 1) + 1,
      lastResult: null,
      updatedAt: serverTimestamp(),
    });
  };

  const myChoice = match?.choices?.[profile.id];
  const oppId = match ? match.players.find((p) => p !== profile.id) : null;
  const oppChose = oppId && match?.choices?.[oppId];
  const bothChose = myChoice && oppChose;

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-black" : "bg-white"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 p-4 flex items-center gap-3 ${dark ? "bg-black border-slate-800" : "bg-white border-slate-200"} border-b`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg flex items-center gap-2">✊✋✌️ เป่ายิ้งฉุบ</h2>
      </div>

      {showFriendPicker && (
        <FriendPickerForGame onPick={startMatch} onCancel={onBack} busy={creating} title="เลือกเพื่อนเล่นเป่ายิ้งฉุบ" />
      )}

      {match && (
        <div className="p-4">
          {/* Score */}
          <div className="flex items-center justify-around mb-6">
            <div className="text-center">
              <Avatar user={profile} size="lg" />
              <p className="text-sm font-semibold mt-1">คุณ</p>
              <p className="text-3xl font-black text-blue-500">{match.score?.[profile.id] || 0}</p>
            </div>
            <p className="text-2xl font-bold">VS</p>
            <div className="text-center">
              {opp ? <Avatar user={opp} size="lg" /> : <div className="w-14 h-14 rounded-full bg-slate-200" />}
              <p className="text-sm font-semibold mt-1">{opp?.displayName || "..."}</p>
              <p className="text-3xl font-black text-fuchsia-500">{match.score?.[oppId] || 0}</p>
            </div>
          </div>

          <p className={`text-center text-sm mb-4 ${dark ? "text-slate-400" : "text-slate-500"}`}>รอบที่ {match.round || 1}</p>

          {/* Result */}
          {bothChose && match.lastResult && (
            <div className={`rounded-2xl p-4 mb-4 text-center ${dark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}`}>
              <div className="flex items-center justify-around mb-3">
                <div>
                  <p className="text-xs mb-1">คุณ</p>
                  <p className="text-6xl">{CHOICES.find((c) => c.id === match.lastResult.my)?.emoji}</p>
                </div>
                <p className="text-xl font-bold">VS</p>
                <div>
                  <p className="text-xs mb-1">{opp?.displayName}</p>
                  <p className="text-6xl">{CHOICES.find((c) => c.id === match.lastResult.theirs)?.emoji}</p>
                </div>
              </div>
              {match.lastResult.winner === profile.id ? (
                <p className="text-xl font-bold text-emerald-500">🎉 คุณชนะรอบนี้!</p>
              ) : match.lastResult.winner === oppId ? (
                <p className="text-xl font-bold text-rose-500">😢 คุณแพ้รอบนี้</p>
              ) : (
                <p className="text-xl font-bold text-amber-500">🤝 เสมอ!</p>
              )}
              <button onClick={nextRound} className="mt-3 px-6 py-2 rounded-full bg-black dark:bg-white text-white font-semibold inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> เล่นต่อ
              </button>
            </div>
          )}

          {/* Choice buttons */}
          {!myChoice && (
            <>
              <p className={`text-center text-sm mb-3 ${dark ? "text-slate-400" : "text-slate-500"}`}>เลือกของคุณ:</p>
              <div className="grid grid-cols-3 gap-3">
                {CHOICES.map((c) => (
                  <button key={c.id} onClick={() => choose(c.id)} className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition hover:scale-105 ${dark ? "bg-slate-800 border-2 border-slate-700" : "bg-white border-2 border-slate-200"}`}>
                    <span className="text-5xl">{c.emoji}</span>
                    <span className="text-xs font-semibold">{c.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {myChoice && !bothChose && (
            <div className="text-center py-4">
              <p className="text-base mb-2">คุณเลือก <span className="text-3xl">{CHOICES.find((c) => c.id === myChoice)?.emoji}</span></p>
              <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"} animate-pulse`}>รอ {opp?.displayName || "คู่ต่อสู้"} เลือก...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ====== Game: Truth or Dare ======
function TruthOrDareGame({ onBack }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const [mode, setMode] = useState(null); // null | "truth" | "dare"
  const [question, setQuestion] = useState("");
  const [randomFriend, setRandomFriend] = useState(null);
  const [users, setUsers] = useState([]);
  const friendIds = profile.friends || [];
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";

  useEffect(() => {
    if (friendIds.length === 0) return;
    Promise.all(friendIds.map((id) => getDoc(doc(db, "users", id)))).then((snaps) => {
      const list = [];
      snaps.forEach((s) => { if (s.exists()) list.push({ id: s.id, ...s.data() }); });
      setUsers(list);
    });
  }, [friendIds.join(",")]);

  const spin = (m) => {
    setMode(m);
    const pool = m === "truth" ? TRUTHS : DARES;
    setQuestion(pool[Math.floor(Math.random() * pool.length)]);
    if (users.length > 0) {
      setRandomFriend(users[Math.floor(Math.random() * users.length)]);
    } else {
      setRandomFriend(null);
    }
  };

  return (
    <div className={`h-full overflow-y-auto ${dark ? "bg-black" : "bg-white"} ${textPrimary}`}>
      <div className={`sticky top-0 z-10 p-4 flex items-center gap-3 ${dark ? "bg-black border-slate-800" : "bg-white border-slate-200"} border-b`}>
        <button onClick={onBack}><ArrowLeft className="w-6 h-6" /></button>
        <h2 className="font-bold text-lg flex items-center gap-2">🎯 Truth or Dare</h2>
      </div>

      <div className="p-4">
        {!mode && (
          <div className="space-y-3 mt-8">
            <p className={`text-center text-sm mb-4 ${dark ? "text-slate-400" : "text-slate-500"}`}>เลือก: ความจริง หรือ ภารกิจ</p>
            <button onClick={() => spin("truth")} className="w-full p-6 rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg hover:scale-[1.02] transition">
              <p className="text-5xl mb-2">💭</p>
              <p className="text-2xl font-bold">Truth</p>
              <p className="text-xs opacity-80 mt-1">ตอบคำถามอย่างจริงใจ</p>
            </button>
            <button onClick={() => spin("dare")} className="w-full p-6 rounded-3xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg hover:scale-[1.02] transition">
              <p className="text-5xl mb-2">🔥</p>
              <p className="text-2xl font-bold">Dare</p>
              <p className="text-xs opacity-80 mt-1">ทำภารกิจที่ได้รับ</p>
            </button>
          </div>
        )}

        {mode && (
          <div className="space-y-4 mt-4">
            <div className={`rounded-3xl p-6 text-center bg-gradient-to-br ${mode === "truth" ? "from-blue-500 to-cyan-500" : "from-orange-500 to-rose-500"} text-white shadow-lg`}>
              <p className="text-xs uppercase tracking-widest opacity-80 mb-2">{mode === "truth" ? "💭 Truth" : "🔥 Dare"}</p>
              {randomFriend && (
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Avatar user={randomFriend} size="sm" />
                  <p className="font-bold text-base">{randomFriend.displayName}</p>
                </div>
              )}
              <p className="text-lg font-semibold">{question}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => spin(mode)} className={`flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 ${dark ? "bg-slate-800 border border-slate-700 text-slate-100" : "bg-white border border-slate-200"}`}>
                <RefreshCw className="w-4 h-4" /> สุ่มใหม่
              </button>
              <button onClick={() => { setMode(null); setQuestion(""); setRandomFriend(null); }} className="flex-1 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold">
                เปลี่ยนโหมด
              </button>
            </div>

            {users.length === 0 && (
              <p className={`text-center text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>💡 เพิ่มเพื่อนเพื่อให้ระบบสุ่มชื่อให้</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ====== Friend Picker (shared by games) ======
function FriendPickerForGame({ onPick, onCancel, busy, title }) {
  const { profile, theme } = useAuth();
  const dark = theme === "dark";
  const [users, setUsers] = useState([]);
  const friendIds = profile.friends || [];
  const textPrimary = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  useEffect(() => {
    if (friendIds.length === 0) return;
    Promise.all(friendIds.map((id) => getDoc(doc(db, "users", id)))).then((snaps) => {
      const list = [];
      snaps.forEach((s) => { if (s.exists()) list.push({ id: s.id, ...s.data() }); });
      setUsers(list);
    });
  }, [friendIds.join(",")]);

  return (
    <div className="p-4">
      <p className={`text-sm font-semibold mb-3 ${textPrimary}`}>{title}</p>
      {friendIds.length === 0 ? (
        <div className={`rounded-2xl p-6 text-center ${dark ? "bg-slate-800" : "bg-white"} border ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <p className={`text-sm ${textSecondary}`}>ยังไม่มีเพื่อน — เพิ่มเพื่อนก่อนเล่นเกม</p>
          <button onClick={onCancel} className="mt-3 px-4 py-2 rounded-full bg-black dark:bg-white text-white text-sm font-semibold">กลับ</button>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <button key={u.id} disabled={busy} onClick={() => onPick(u.id)} className={`w-full flex items-center gap-3 p-3 rounded-2xl border shadow-sm disabled:opacity-50 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
              <Avatar user={u} size="md" />
              <div className="flex-1 text-left">
                <p className={`font-semibold text-sm ${textPrimary}`}>{u.displayName}</p>
                <p className={`text-xs ${textSecondary}`}>@{u.username}</p>
              </div>
              <Swords className="w-5 h-5 text-blue-500" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ====== Root ======
function PlayvoRoot() {
  const { user, profile, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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
