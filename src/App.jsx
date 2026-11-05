import React, { useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut,
  createUserWithEmailAndPassword, getAuth
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  ref, onValue, set, push, update, remove, get
} from 'firebase/database';
import {
  LayoutDashboard, ShoppingCart, Package, Tags, Table2, ReceiptText,
  Users, ScrollText, Settings, LogOut, Search, Plus, Minus, Trash2,
  CreditCard, Banknote, Smartphone, Printer, Download, Edit3, X,
  CheckCircle2, Utensils, TrendingUp, Clock3, ShieldCheck, Menu,
  Eye, EyeOff, Save, ChevronLeft, ChevronRight, Sun, Moon, UserPlus, LogIn, Sparkles
} from 'lucide-react';
import { auth, db, firebaseConfig } from './firebase';

const peso = n => `₱${Number(n || 0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const todayKey = () => new Date().toISOString().slice(0,10);
const nowText = () => new Date().toLocaleString('en-PH');
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;

const defaultProducts = [
  {name:'San Mig Light',category:'Beer',price:80,active:true},
  {name:'Red Horse',category:'Beer',price:75,active:true},
  {name:'Sisig',category:'Food',price:180,active:true},
  {name:'Sizzling Hotdog',category:'Food',price:150,active:true},
  {name:'Fries',category:'Snacks',price:120,active:true},
  {name:'Nachos',category:'Snacks',price:160,active:true},
  {name:'Softdrinks',category:'Drinks',price:55,active:true},
  {name:'Bottled Water',category:'Drinks',price:35,active:true}
];

function useTheme(){
  const [theme,setTheme]=useState(()=>localStorage.getItem('jorves-theme')||'dark');
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('jorves-theme',theme)},[theme]);
  return [theme,()=>setTheme(t=>t==='dark'?'light':'dark')];
}

function ThemeButton({theme,toggle,className=''}){return <button type="button" className={`theme-toggle ${className}`} onClick={toggle} title={theme==='dark'?'Switch to light mode':'Switch to dark mode'}>{theme==='dark'?<Sun/>:<Moon/>}<span>{theme==='dark'?'Light':'Dark'}</span></button>}

function App(){
  const [user,setUser]=useState(null); const [profile,setProfile]=useState(null); const [loading,setLoading]=useState(true); const [theme,toggleTheme]=useTheme();
  useEffect(()=>onAuthStateChanged(auth, async u=>{ setUser(u); if(u){ const s=await get(ref(db,`users/${u.uid}`)); setProfile(s.val()||{name:u.email,role:'cashier'}); } else setProfile(null); setLoading(false); }),[]);
  if(loading) return <div className="splash"><img src="/jorves-logo.png"/><div className="loader"/></div>;
  if(!user) return <Login theme={theme} toggleTheme={toggleTheme}/>;
  return <Shell user={user} profile={profile} setProfile={setProfile} theme={theme} toggleTheme={toggleTheme}/>;
}

function Login({theme,toggleTheme}){
  const [mode,setMode]=useState('login'); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [show,setShow]=useState(false); const [err,setErr]=useState(''); const [busy,setBusy]=useState(false);
  const [name,setName]=useState(''); const [confirm,setConfirm]=useState('');
  const submit=async e=>{e.preventDefault();setBusy(true);setErr('');try{
    if(mode==='login'){await signInWithEmailAndPassword(auth,email,password)}
    else{if(password.length<6) throw new Error('Password must be at least 6 characters.'); if(password!==confirm) throw new Error('Passwords do not match.'); const cred=await createUserWithEmailAndPassword(auth,email,password); await set(ref(db,`users/${cred.user.uid}`),{name:name.trim(),email,role:'cashier',active:true,createdAt:Date.now(),registeredFrom:'self'});}
  }catch(x){setErr(x?.message?.replace('Firebase: ','')||'Unable to continue. Please try again.')}finally{setBusy(false)}};
  const switchMode=m=>{setMode(m);setErr('');setPassword('');setConfirm('')};
  return <div className="login-page"><div className="grid-effect"/><div className="ambient a1"/><div className="ambient a2"/><div className="ambient a3"/><ThemeButton theme={theme} toggle={toggleTheme} className="login-theme"/><div className="login-card glass">
    <div className="brand"><div className="brand-glow"><img src="/jorves-logo.png"/></div><span><Sparkles/> Point of Sale & Operations</span></div>
    <div className="auth-tabs"><button type="button" className={mode==='login'?'active':''} onClick={()=>switchMode('login')}><LogIn/> Sign In</button><button type="button" className={mode==='register'?'active':''} onClick={()=>switchMode('register')}><UserPlus/> Register</button></div>
    <form onSubmit={submit}><h1>{mode==='login'?'Welcome back':'Create your account'}</h1><p>{mode==='login'?'Sign in to start your shift.':'Register as a cashier. An admin can update your role later.'}</p>
      {mode==='register'&&<><label>Full name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Juan Dela Cruz" required/></>}
      <label>Email address</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="staff@jorves.com" required/>
      <label>Password</label><div className="password"><input type={show?'text':'password'} minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/><button type="button" className="icon-btn" onClick={()=>setShow(!show)}>{show?<EyeOff/>:<Eye/>}</button></div>
      {mode==='register'&&<><label>Confirm password</label><input type={show?'text':'password'} minLength={6} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="••••••••" required/></>}
      {err&&<div className="error">{err}</div>}<button className="primary wide auth-submit" disabled={busy}>{mode==='login'?<LogIn/>:<UserPlus/>}{busy?(mode==='login'?'Signing in…':'Creating account…'):(mode==='login'?'Sign in':'Create account')}</button>
    </form><div className="login-foot"><ShieldCheck/> Secure role-based access</div>
  </div></div>;
}

const nav = [
  ['pos','POS',ShoppingCart,['cashier','manager','admin']], ['dashboard','Dashboard',LayoutDashboard,['manager','admin']],
  ['orders','Orders',ReceiptText,['cashier','manager','admin']], ['products','Products',Package,['manager','admin']],
  ['promos','Promos',Tags,['manager','admin']], ['tables','Tables',Table2,['manager','admin']],
  ['reports','Reports',TrendingUp,['manager','admin']], ['users','Users',Users,['admin']], ['audit','Audit Log',ScrollText,['admin']], ['settings','Settings',Settings,['admin']]
];

function Shell({user,profile,theme,toggleTheme}){
  const [page,setPage]=useState(profile?.role==='cashier'?'pos':'dashboard'); const [side,setSide]=useState(false);
  const [products,setProducts]=useData('products',{}); const [promos,setPromos]=useData('promos',{}); const [tables,setTables]=useData('tables',{}); const [orders,setOrders]=useData('orders',{});
  useEffect(()=>{ if(products && Object.keys(products).length===0 && profile?.role==='admin') seed(); },[profile]);
  const seed=async()=>{ const p={}; defaultProducts.forEach(x=>p[uid()]=x); const t={}; for(let i=1;i<=12;i++)t[`T${i}`]={name:`Table ${i}`,active:true}; await update(ref(db),{products:p,tables:t});};
  const audit=async(action,details='')=>push(ref(db,'auditLogs'),{action,details,user:profile?.name||user.email,uid:user.uid,at:Date.now()});
  const allowed=nav.filter(n=>n[3].includes(profile?.role||'cashier'));
  return <div className="app"><aside className={side?'sidebar open':'sidebar'}><div className="side-brand"><img src="/jorves-logo.png"/></div><nav>{allowed.map(([k,l,I])=><button key={k} className={page===k?'active':''} onClick={()=>{setPage(k);setSide(false)}}><I size={19}/><span>{l}</span></button>)}</nav><div className="side-user"><div className="avatar">{(profile?.name||user.email)[0].toUpperCase()}</div><div><b>{profile?.name||user.email}</b><small>{profile?.role||'cashier'}</small></div><button onClick={async()=>{await audit('LOGOUT','User signed out');signOut(auth)}} title="Logout"><LogOut size={18}/></button></div></aside>
    <main><header><button className="menu icon-btn" onClick={()=>setSide(!side)}><Menu/></button><div><h2>{allowed.find(n=>n[0]===page)?.[1]||'POS'}</h2><span>{new Date().toLocaleDateString('en-PH',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</span></div><div className="header-actions"><ThemeButton theme={theme} toggle={toggleTheme}/><div className="role-pill"><ShieldCheck/>{profile?.role}</div></div></header>
      <section className="content">
        {page==='pos'&&<POS products={products} promos={promos} tables={tables} profile={profile} audit={audit}/>} 
        {page==='dashboard'&&<Dashboard orders={orders}/>} {page==='orders'&&<Orders orders={orders}/>} 
        {page==='products'&&<Crud title="Products" path="products" data={products} type="product" audit={audit}/>} {page==='promos'&&<Crud title="Promos" path="promos" data={promos} type="promo" audit={audit}/>} {page==='tables'&&<Crud title="Tables" path="tables" data={tables} type="table" audit={audit}/>} 
        {page==='reports'&&<Reports orders={orders}/>} {page==='users'&&<UserManagement audit={audit}/>} {page==='audit'&&<AuditLog/>} {page==='settings'&&<SystemSettings audit={audit}/>} 
      </section>
    </main>
  </div>;
}

function useData(path, fallback){ const [data,setData]=useState(fallback); useEffect(()=>onValue(ref(db,path),s=>setData(s.val()||fallback)),[path]); return [data,setData]; }

function POS({products,promos,tables,profile,audit}){
  const [cart,setCart]=useState([]); const [cat,setCat]=useState('All'); const [search,setSearch]=useState(''); const [table,setTable]=useState('Takeout'); const [disc,setDisc]=useState(0); const [payment,setPayment]=useState('Cash'); const [cash,setCash]=useState(''); const [receipt,setReceipt]=useState(null);
  const list=Object.entries(products||{}).map(([id,x])=>({id,...x})).filter(x=>x.active!==false);
  const categories=['All',...new Set(list.map(x=>x.category||'Other'))]; const filtered=list.filter(x=>(cat==='All'||x.category===cat)&&x.name.toLowerCase().includes(search.toLowerCase()));
  const subtotal=cart.reduce((s,x)=>s+x.price*x.qty,0); const discount=subtotal*(Number(disc)||0)/100; const total=Math.max(0,subtotal-discount); const change=Math.max(0,(Number(cash)||0)-total);
  const add=(p)=>setCart(c=>{const f=c.find(x=>x.id===p.id);return f?c.map(x=>x.id===p.id?{...x,qty:x.qty+1}:x):[...c,{...p,qty:1}]});
  const qty=(id,d)=>setCart(c=>c.map(x=>x.id===id?{...x,qty:x.qty+d}:x).filter(x=>x.qty>0));
  const checkout=async()=>{if(!cart.length)return alert('Add at least one item.'); if(payment==='Cash'&&Number(cash)<total)return alert('Cash received is less than total.'); const no=`JRV-${todayKey().replaceAll('-','')}-${String(Date.now()).slice(-6)}`; const order={receiptNo:no,items:cart,table,subtotal,discountPercent:Number(disc)||0,discount,total,payment,cashReceived:payment==='Cash'?Number(cash):total,change:payment==='Cash'?change:0,status:'Paid',cashier:profile?.name||'Staff',cashierRole:profile?.role,createdAt:Date.now(),date:todayKey()}; const r=push(ref(db,'orders')); await set(r,order); await audit('SALE',`${no} • ${peso(total)} • ${table}`); setReceipt({...order,id:r.key}); setCart([]);setDisc(0);setCash('');};
  return <div className="pos-grid"><div className="catalog panel"><div className="toolbar"><div className="search"><Search size={18}/><input placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={table} onChange={e=>setTable(e.target.value)}><option>Takeout</option>{Object.values(tables||{}).filter(t=>t.active!==false).map(t=><option key={t.name}>{t.name}</option>)}</select></div>
    <div className="cats">{categories.map(c=><button className={cat===c?'on':''} onClick={()=>setCat(c)} key={c}>{c}</button>)}</div>
    <div className="product-grid">{filtered.map(p=><button className="product-card" key={p.id} onClick={()=>add(p)}><span className="picon"><Utensils size={22}/></span><b>{p.name}</b><small>{p.category}</small><strong>{peso(p.price)}</strong></button>)}</div>
  </div><div className="cart panel"><div className="cart-head"><div><h3>Current Order</h3><span>{table}</span></div><button className="ghost" onClick={()=>setCart([])}><Trash2 size={17}/></button></div><div className="cart-lines">{cart.length===0?<div className="empty"><ShoppingCart size={40}/><p>No items yet</p><small>Tap a product to add it</small></div>:cart.map(x=><div className="line" key={x.id}><div><b>{x.name}</b><small>{peso(x.price)} each</small></div><div className="qty"><button onClick={()=>qty(x.id,-1)}><Minus size={14}/></button><span>{x.qty}</span><button onClick={()=>qty(x.id,1)}><Plus size={14}/></button></div><strong>{peso(x.price*x.qty)}</strong></div>)}</div>
    <div className="summary"><div><span>Subtotal</span><b>{peso(subtotal)}</b></div><div><span>Discount %</span><input type="number" min="0" max="100" value={disc} onChange={e=>setDisc(e.target.value)}/></div><div><span>Discount</span><b>-{peso(discount)}</b></div><div className="total"><span>Total</span><b>{peso(total)}</b></div></div>
    <div className="payments">{[['Cash',Banknote],['GCash',Smartphone],['Card',CreditCard]].map(([p,I])=><button key={p} className={payment===p?'active':''} onClick={()=>setPayment(p)}><I size={18}/>{p}</button>)}</div>{payment==='Cash'&&<div className="cash"><input type="number" placeholder="Cash received" value={cash} onChange={e=>setCash(e.target.value)}/><span>Change: <b>{peso(change)}</b></span></div>}<button className="checkout" onClick={checkout}><CheckCircle2/> Complete Payment • {peso(total)}</button>
  </div>{receipt&&<Receipt receipt={receipt} onClose={()=>setReceipt(null)}/>}</div>;
}

function Dashboard({orders}){ const arr=Object.values(orders||{}); const today=arr.filter(o=>o.date===todayKey()); const sales=today.reduce((s,o)=>s+Number(o.total||0),0); const avg=today.length?sales/today.length:0; const latest=[...today].sort((a,b)=>b.createdAt-a.createdAt).slice(0,6); return <><div className="stats"><Stat icon={TrendingUp} label="Sales Today" value={peso(sales)}/><Stat icon={ReceiptText} label="Orders Today" value={today.length}/><Stat icon={Banknote} label="Average Order" value={peso(avg)}/><Stat icon={Clock3} label="Last Sale" value={latest[0]?new Date(latest[0].createdAt).toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'}):'—'}/></div><div className="panel table-panel"><h3>Today's Recent Orders</h3><OrderTable rows={latest}/></div></> }
function Stat({icon:I,label,value}){return <div className="stat panel"><div className="stat-icon"><I/></div><div><span>{label}</span><b>{value}</b></div></div>}
function Orders({orders}){ const [q,setQ]=useState(''); const rows=Object.values(orders||{}).sort((a,b)=>b.createdAt-a.createdAt).filter(o=>(o.receiptNo||'').toLowerCase().includes(q.toLowerCase())||(o.table||'').toLowerCase().includes(q.toLowerCase())); return <div className="panel table-panel"><div className="section-head"><h3>Order History</h3><div className="search"><Search size={17}/><input placeholder="Receipt or table…" value={q} onChange={e=>setQ(e.target.value)}/></div></div><OrderTable rows={rows}/></div>}
function OrderTable({rows}){return <div className="table-wrap"><table><thead><tr><th>Receipt</th><th>Date/Time</th><th>Table</th><th>Cashier</th><th>Payment</th><th>Status</th><th className="right">Total</th></tr></thead><tbody>{rows.map((o,i)=><tr key={o.receiptNo||i}><td><b>{o.receiptNo}</b></td><td>{new Date(o.createdAt).toLocaleString('en-PH')}</td><td>{o.table}</td><td>{o.cashier}</td><td>{o.payment}</td><td><span className="badge success">{o.status}</span></td><td className="right"><b>{peso(o.total)}</b></td></tr>)}</tbody></table></div>}

function Crud({title,path,data,type,audit}){ const [modal,setModal]=useState(null); const rows=Object.entries(data||{}).map(([id,x])=>({id,...x})); const del=async r=>{if(confirm(`Delete ${r.name}?`)){await remove(ref(db,`${path}/${r.id}`));await audit(`DELETE_${type.toUpperCase()}`,r.name)}}; return <div className="panel table-panel"><div className="section-head"><div><h3>{title}</h3><p>Manage {title.toLowerCase()} used in the POS.</p></div><button className="primary" onClick={()=>setModal({})}><Plus size={17}/> Add {type}</button></div><div className="table-wrap"><table><thead><tr><th>Name</th>{type==='product'&&<><th>Category</th><th>Price</th></>}{type==='promo'&&<><th>Discount %</th><th>Code</th></>}<th>Status</th><th></th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><b>{r.name}</b></td>{type==='product'&&<><td>{r.category}</td><td>{peso(r.price)}</td></>}{type==='promo'&&<><td>{r.discount||0}%</td><td>{r.code||'—'}</td></>}<td><span className={r.active===false?'badge':'badge success'}>{r.active===false?'Inactive':'Active'}</span></td><td className="actions"><button onClick={()=>setModal(r)}><Edit3 size={16}/></button><button className="danger" onClick={()=>del(r)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>{modal&&<EditModal type={type} path={path} row={modal} close={()=>setModal(null)} audit={audit}/>}</div> }
function EditModal({type,path,row,close,audit}){ const [f,setF]=useState({name:row.name||'',category:row.category||'',price:row.price||'',discount:row.discount||'',code:row.code||'',active:row.active!==false}); const save=async e=>{e.preventDefault(); const id=row.id||uid(); const val=type==='product'?{name:f.name,category:f.category||'Other',price:Number(f.price),active:f.active}:type==='promo'?{name:f.name,discount:Number(f.discount),code:f.code,active:f.active}:{name:f.name,active:f.active}; await set(ref(db,`${path}/${id}`),val); await audit(row.id?`UPDATE_${type.toUpperCase()}`:`CREATE_${type.toUpperCase()}`,f.name); close();}; return <Modal close={close}><form onSubmit={save}><h3>{row.id?'Edit':'Add'} {type}</h3><label>Name</label><input value={f.name} onChange={e=>setF({...f,name:e.target.value})} required/>{type==='product'&&<><label>Category</label><input value={f.category} onChange={e=>setF({...f,category:e.target.value})} required/><label>Price</label><input type="number" step="0.01" value={f.price} onChange={e=>setF({...f,price:e.target.value})} required/></>}{type==='promo'&&<><label>Discount %</label><input type="number" value={f.discount} onChange={e=>setF({...f,discount:e.target.value})}/><label>Promo Code</label><input value={f.code} onChange={e=>setF({...f,code:e.target.value})}/></>}<label className="check"><input type="checkbox" checked={f.active} onChange={e=>setF({...f,active:e.target.checked})}/> Active</label><div className="modal-actions"><button type="button" className="ghost" onClick={close}>Cancel</button><button className="primary"><Save size={16}/> Save</button></div></form></Modal> }
function Modal({children,close}){return <div className="modal-bg" onMouseDown={e=>e.target===e.currentTarget&&close()}><div className="modal"><button className="modal-x" onClick={close}><X/></button>{children}</div></div>}

function Reports({orders}){ const [from,setFrom]=useState(todayKey()); const [to,setTo]=useState(todayKey()); const rows=Object.values(orders||{}).filter(o=>o.date>=from&&o.date<=to).sort((a,b)=>b.createdAt-a.createdAt); const total=rows.reduce((s,o)=>s+Number(o.total||0),0); const exportCsv=()=>{const h=['Receipt','Date','Time','Table','Cashier','Payment','Subtotal','Discount','Total'];const lines=[h,...rows.map(o=>[o.receiptNo,o.date,new Date(o.createdAt).toLocaleTimeString('en-PH'),o.table,o.cashier,o.payment,o.subtotal,o.discount,o.total])].map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n'); const blob=new Blob([lines],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`jorves-sales-${from}-to-${to}.csv`;a.click();}; return <><div className="stats"><Stat icon={TrendingUp} label="Filtered Sales" value={peso(total)}/><Stat icon={ReceiptText} label="Transactions" value={rows.length}/></div><div className="panel table-panel"><div className="section-head"><div><h3>Sales Report</h3><p>Filter, review and extract sales data.</p></div><div className="report-actions"><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/><span>to</span><input type="date" value={to} onChange={e=>setTo(e.target.value)}/><button className="primary" onClick={exportCsv}><Download size={16}/> Export CSV</button></div></div><OrderTable rows={rows}/></div></> }

function UserManagement({audit}){ const [users]=useData('users',{}); const [open,setOpen]=useState(false); const create=async f=>{let secondary=null; try{secondary=initializeApp(firebaseConfig,`secondary-${Date.now()}`); const a=getAuth(secondary); const cred=await createUserWithEmailAndPassword(a,f.email,f.password); await set(ref(db,`users/${cred.user.uid}`),{name:f.name,email:f.email,role:f.role,active:true,createdAt:Date.now()}); await audit('CREATE_USER',`${f.name} • ${f.role}`); setOpen(false);}catch(e){alert(e.message)}finally{if(secondary) await deleteApp(secondary)}}; const setRole=async(id,role)=>{await update(ref(db,`users/${id}`),{role});await audit('UPDATE_ROLE',`${id} → ${role}`)}; return <div className="panel table-panel"><div className="section-head"><div><h3>User Management</h3><p>Accounts and role-based access.</p></div><button className="primary" onClick={()=>setOpen(true)}><Plus size={17}/> New Staff</button></div><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{Object.entries(users||{}).map(([id,u])=><tr key={id}><td><b>{u.name}</b></td><td>{u.email}</td><td><select value={u.role} onChange={e=>setRole(id,e.target.value)}><option>cashier</option><option>manager</option><option>admin</option></select></td><td><span className="badge success">Active</span></td></tr>)}</tbody></table></div>{open&&<NewUser close={()=>setOpen(false)} create={create}/>}</div> }
function NewUser({close,create}){const [f,setF]=useState({name:'',email:'',password:'',role:'cashier'});return <Modal close={close}><form onSubmit={e=>{e.preventDefault();create(f)}}><h3>Create Staff Account</h3><label>Full name</label><input required value={f.name} onChange={e=>setF({...f,name:e.target.value})}/><label>Email</label><input type="email" required value={f.email} onChange={e=>setF({...f,email:e.target.value})}/><label>Temporary password</label><input type="password" minLength="6" required value={f.password} onChange={e=>setF({...f,password:e.target.value})}/><label>Role</label><select value={f.role} onChange={e=>setF({...f,role:e.target.value})}><option value="cashier">Cashier</option><option value="manager">Manager</option><option value="admin">Admin</option></select><div className="modal-actions"><button type="button" className="ghost" onClick={close}>Cancel</button><button className="primary">Create Account</button></div></form></Modal>}

function AuditLog(){const [logs]=useData('auditLogs',{});const rows=Object.entries(logs||{}).map(([id,x])=>({id,...x})).sort((a,b)=>b.at-a.at);return <div className="panel table-panel"><div className="section-head"><div><h3>System Audit Log</h3><p>Track important user actions.</p></div></div><div className="table-wrap"><table><thead><tr><th>Date/Time</th><th>User</th><th>Action</th><th>Details</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{new Date(r.at).toLocaleString('en-PH')}</td><td>{r.user}</td><td><span className="badge">{r.action}</span></td><td>{r.details}</td></tr>)}</tbody></table></div></div>}
function SystemSettings({audit}){const [settings]=useData('settings',{businessName:"Jorve's Tambayan",address:'',phone:'',footer:'Thank you for visiting!'});const [f,setF]=useState(settings);useEffect(()=>setF(settings),[settings]);const save=async()=>{await set(ref(db,'settings'),f);await audit('UPDATE_SETTINGS','Business/receipt settings updated');alert('Settings saved.');};return <div className="panel settings-card"><h3>Business & Receipt Settings</h3><label>Business name</label><input value={f.businessName||''} onChange={e=>setF({...f,businessName:e.target.value})}/><label>Address</label><input value={f.address||''} onChange={e=>setF({...f,address:e.target.value})}/><label>Contact number</label><input value={f.phone||''} onChange={e=>setF({...f,phone:e.target.value})}/><label>Receipt footer</label><textarea value={f.footer||''} onChange={e=>setF({...f,footer:e.target.value})}/><button className="primary" onClick={save}><Save size={17}/> Save Settings</button></div>}

function Receipt({receipt,onClose}){const print=()=>window.print();return <div className="modal-bg"><div className="receipt-modal"><button className="modal-x no-print" onClick={onClose}><X/></button><div className="receipt-paper"><img src="/jorves-logo.png"/><h3>Official Receipt</h3><p>{receipt.receiptNo}</p><div className="rmeta"><span>{new Date(receipt.createdAt).toLocaleString('en-PH')}</span><span>{receipt.table}</span><span>Cashier: {receipt.cashier}</span></div>{receipt.items.map(x=><div className="rline" key={x.id}><span>{x.qty} × {x.name}</span><b>{peso(x.qty*x.price)}</b></div>)}<hr/><div className="rline"><span>Subtotal</span><b>{peso(receipt.subtotal)}</b></div><div className="rline"><span>Discount</span><b>-{peso(receipt.discount)}</b></div><div className="rline big"><span>TOTAL</span><b>{peso(receipt.total)}</b></div><div className="rline"><span>{receipt.payment}</span><b>{peso(receipt.cashReceived)}</b></div>{receipt.payment==='Cash'&&<div className="rline"><span>Change</span><b>{peso(receipt.change)}</b></div>}<p className="thanks">Thank you for visiting Jorve's Tambayan!</p></div><div className="modal-actions no-print"><button className="ghost" onClick={onClose}>Close</button><button className="primary" onClick={print}><Printer size={17}/> Print Receipt</button></div></div></div>}

export default App;
