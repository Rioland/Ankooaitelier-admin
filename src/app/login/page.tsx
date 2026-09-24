"use client";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { login } from "@/app/actions";

export default function Login() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-950 px-4">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl animate-float" />
      <div className="absolute -bottom-32 -right-20 h-[28rem] w-[28rem] rounded-full bg-brand-700/40 blur-3xl" />
      <motion.form
        action={action}
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl sm:p-10"
      >
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 font-display text-xl font-bold text-white">A</span>
          <div>
            <p className="font-display text-2xl font-semibold text-brand-900">Ankooaitelier Admin</p>
            <p className="text-sm text-neutral-500">Sign in to manage your store</p>
          </div>
        </div>
        <div className="space-y-4">
          <div><label className="label">Email</label><input name="email" type="email" required autoComplete="username" className="input" /></div>
          <div><label className="label">Password</label><input name="password" type="password" required autoComplete="current-password" className="input" /></div>
        </div>
        {state?.error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
        <button disabled={pending} className="btn-primary mt-6 w-full !py-3.5">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Sign in
        </button>
      </motion.form>
    </div>
  );
}
