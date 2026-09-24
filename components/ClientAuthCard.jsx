import React,{useState} from "react";
import {CheckCircle2} from "lucide-react";
import {supabase} from "../supabaseClient";
import {BASE_PATH} from "../apiBase";

const redirectTo=()=>`${window.location.origin}${BASE_PATH}/client`;

export default function ClientAuthCard(){
  const [mode,setMode]=useState("password"),[email,setEmail]=useState(""),[password,setPassword]=useState("");
  const [sent,setSent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");

  async function run(event){
    event.preventDefault(); setBusy(true); setError("");
    try{
      if(!supabase) throw new Error("Client login is not connected yet.");
      if(mode==="password"){
        const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password}); if(error) throw error;
      } else if(mode==="create"){
        if(password.length<8) throw new Error("Use at least 8 characters for your password.");
        const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:redirectTo()}}); if(error) throw error;
        if(!data.session) setSent(true);
      } else {
        const {error}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:redirectTo(),shouldCreateUser:true}}); if(error) throw error;
        setSent(true);
      }
    }catch(e){setError(e.message||"Could not sign in.");}finally{setBusy(false);}
  }

  async function google(){
    setBusy(true);setError("");
    try{
      const {error}=await supabase.auth.signInWithOAuth({provider:"google",options:{redirectTo:redirectTo()}});
      if(error) throw error;
    }catch(e){setError(e.message||"Could not continue with Google.");setBusy(false);}
  }

  if(sent) return <div className="text-center"><CheckCircle2 className="mx-auto text-[#17724F]" size={38}/><h2 className="mt-4 font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">Check your email</h2><p className="mt-2 text-sm text-[#7E7767]">We sent a secure confirmation to {email}.</p><button onClick={()=>setSent(false)} className="mt-5 text-sm font-semibold underline">Back to sign in</button></div>;

  return <div>
    <button type="button" onClick={google} disabled={busy} className="w-full rounded-full border border-[#CFC5AE] bg-white px-5 py-3.5 text-sm font-semibold text-[#0B4933]">CONTINUE WITH GOOGLE</button>
    <div className="my-5 flex items-center gap-3"><div className="h-px flex-1 bg-[#E7DFCE]"/><span className="text-xs text-[#9A9A9A]">OR</span><div className="h-px flex-1 bg-[#E7DFCE]"/></div>
    <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#F8F3E8] p-1">
      {[["password","Password"],["create","Create account"],["magic","Email link"]].map(([id,label])=><button key={id} type="button" onClick={()=>{setMode(id);setError("")}} className={`rounded-lg px-2 py-2.5 text-xs font-semibold ${mode===id?"bg-white text-[#0B4933] shadow-sm":"text-[#7E7767]"}`}>{label}</button>)}
    </div>
    <form className="mt-5" onSubmit={run}>
      <label className="text-sm font-semibold">Email address</label>
      <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-[#D9D9D9] px-4 py-3"/>
      {mode!=="magic"&&<><label className="mt-4 block text-sm font-semibold">Password</label><input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#D9D9D9] px-4 py-3"/></>}
      {error&&<p className="mt-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="mt-5 w-full rounded-full bg-[#0B4933] py-3.5 text-sm font-semibold text-white">{busy?"PLEASE WAIT...":mode==="password"?"SIGN IN":mode==="create"?"CREATE MY ACCOUNT":"EMAIL MY SIGN-IN LINK"}</button>
    </form>
  </div>;
}
