import React,{useState} from "react";
import {supabase} from "../supabaseClient";
export default function AccountSecurity(){
  const [password,setPassword]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
  async function save(e){e.preventDefault();setBusy(true);setMessage("");setError("");
    try{if(password.length<8)throw new Error("Use at least 8 characters.");const {error}=await supabase.auth.updateUser({password});if(error)throw error;setPassword("");setMessage("Password saved.");}
    catch(e){setError(e.message||"Could not update password.");}finally{setBusy(false);}
  }
  return <section className="rounded-2xl border border-[#E7DFCE] bg-[#FFFDF8] p-5 sm:p-6"><h2 className="font-['Fraunces'] text-2xl font-semibold text-[#0B4933]">Account security</h2><p className="mt-2 text-sm text-[#6F6859]">Set or change your password. You can still use Google or an emailed sign-in link.</p><form onSubmit={save} className="mt-5"><label className="text-sm font-semibold">New password</label><input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-[#D9D9D9] px-4 py-3"/>{message&&<p className="mt-3 text-sm text-[#17724F]">{message}</p>}{error&&<p className="mt-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="mt-4 rounded-full bg-[#0B4933] px-5 py-3 text-xs font-semibold text-white">{busy?"SAVING...":"SAVE PASSWORD"}</button></form></section>;
}
