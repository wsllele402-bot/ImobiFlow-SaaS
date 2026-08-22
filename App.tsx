import React, { useEffect, useState, useRef } from 'react';
import './src/app.css';
import { dbService } from './src/services/dbService';
import fbApp from './src/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { PropertyType, ExpenseCategory } from './types';

const fns = getFunctions(fbApp, 'southamerica-east1');

const brl = (n: any) => Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const TIPOS = Object.values(PropertyType);
const CATS = Object.values(ExpenseCategory);
const propIcon = (t: string) => t === PropertyType.CASA ? 'fa-house' : t === PropertyType.GALPAO ? 'fa-warehouse' : 'fa-building';
const initials = (n: string) => (n || '').split(' ').filter(Boolean).map(x => x[0]).slice(0, 2).join('').toUpperCase() || '--';
const fmtDate = (s: string) => { if (!s) return '—'; const p = s.split('-'); return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : s; };
const HISTORY = [
  { m: 'Jan', receb: 11800, desp: 450 }, { m: 'Fev', receb: 12100, desp: 200 },
  { m: 'Mar', receb: 12300, desp: 980 }, { m: 'Abr', receb: 12750, desp: 540 }, { m: 'Mai', receb: 12750, desp: 120 },
];
const COMP = new Date().toISOString().slice(0, 7);
const MESNOME = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const COMP_LABEL = `${MESNOME[+COMP.split('-')[1]]} de ${COMP.split('-')[0]}`;
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => { const d = new Date(+COMP.split('-')[0], +COMP.split('-')[1] - 1 - i, 1); return d.toISOString().slice(0, 7); });
const monthLabel = (m: string) => `${MESNOME[+m.split('-')[1]]} de ${m.split('-')[0]}`;
const recMonthOf = (p: any) => (p.receivedAt ? String(p.receivedAt).slice(0, 7) : p.competencia);
const BOLETO_FEE = 2.00;

// ---------------- LOGIN ----------------
const Login: React.FC<{ onIn: (u: any) => void }> = ({ onIn }) => {
  const [view, setView] = useState<'hero' | 'login' | 'signup'>('hero');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const deckRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = deckRef.current; if (!el) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `translateY(-50%) rotateY(${-16 - x * 10}deg) rotateX(${7 + y * 8}deg)`;
  };
  const onLeave = () => { if (deckRef.current) deckRef.current.style.transform = 'translateY(-50%) rotateY(-16deg) rotateX(7deg)'; };

  const doLogin = async () => {
    setErr(''); setBusy(true);
    try { const { user } = await dbService.signin(email.trim(), pass); onIn(user); }
    catch (e) { setErr('Não foi possível entrar. Confira e-mail e senha.'); }
    setBusy(false);
  };
  const doSignup = async () => {
    setErr('');
    if (!name.trim()) { setErr('Informe seu nome.'); return; }
    setBusy(true);
    try { await dbService.signup(email.trim(), pass, name.trim()); alert('Conta criada! Agora faça login.'); setView('login'); setErr(''); }
    catch (e) { setErr('Não foi possível criar a conta. Tente outro e-mail.'); }
    setBusy(false);
  };

  // ---- tela inicial: herói premium com 3D ----
  if (view === 'hero') return (
    <div className="lg-stage">
      <div className="lg-nav">
        <div className="lg-logo"><div className="mk">◆</div><div className="nm">ImobiFlow</div></div>
        <div className="lg-navr">
          <button className="lg-enter" onClick={() => { setErr(''); setView('login'); }}>Entrar</button>
          <button className="lg-assine" onClick={() => { setErr(''); setView('signup'); }}>Assinar</button>
        </div>
      </div>
      <div className="lg-grid">
        <div className="lg-hero">
          <span className="lg-badge">◆ Feito para administradores de imóveis</span>
          <h1>A sua carteira de imóveis<br /><span className="g">no piloto automático</span>.</h1>
          <p className="lg-sub">Boletos que se geram sozinhos, repasses calculados no clique e a inadimplência sempre sob o seu olhar. Menos planilha, mais resultado.</p>
          <div className="lg-ctas">
            <button className="lg-primary" onClick={() => { setErr(''); setView('signup'); }}>Começar agora →</button>
            <div className="lg-micro"><b>Teste grátis</b><br />sem cartão de crédito</div>
          </div>
          <div className="lg-proof">
            <div className="lg-avs"><span style={{ background: '#5e8bff' }}>AR</span><span style={{ background: '#37c98d' }}>JL</span><span style={{ background: '#eab23e' }}>MS</span><span style={{ background: '#f26a60' }}>CP</span></div>
            <div className="lg-pt">Administradores confiam no ImobiFlow para gerir<br /><b>mais de 90 imóveis</b> — do boleto ao repasse.</div>
          </div>
        </div>
        <div className="lg-scene" onMouseMove={onMove} onMouseLeave={onLeave}>
          <div className="lg-deck" ref={deckRef}>
            <div className="lg-dash">
              <div className="d-top"><div className="l"><span className="dm">◆</span> Painel</div><div className="pick">Julho 2026 ▾</div></div>
              <div className="d-body">
                <div className="d-side">
                  <div className="it on"><span className="dot" /> Painel</div>
                  <div className="it"><span className="dot" /> Imóveis</div>
                  <div className="it"><span className="dot" /> Proprietários</div>
                  <div className="it"><span className="dot" /> Cobranças</div>
                  <div className="it"><span className="dot" /> Vagas</div>
                  <div className="it"><span className="dot" /> Relatórios</div>
                </div>
                <div className="d-main">
                  <div className="coq">
                    <div className="h"><span className="t">Recebimento de julho</span><span className="c">Mês saudável</span></div>
                    <div className="big"><b>42</b> de 45 aluguéis recebidos</div>
                    <div className="tr"><i style={{ background: '#1c8a5a', width: '84%' }} /><i style={{ background: '#b07d12', width: '3%' }} /><i style={{ background: '#c23934', width: '6%' }} /></div>
                  </div>
                  <div className="d-kpis">
                    <div className="kp"><div className="l">Líquido p/ repasse</div><div className="v pos">R$ 72.140</div></div>
                    <div className="kp"><div className="l">A receber</div><div className="v">R$ 5.800</div></div>
                  </div>
                  <div className="chartbox">
                    <div className="l">Recebido × Despesas</div>
                    <svg viewBox="0 0 420 90" width="100%" style={{ height: 74 }}>
                      <defs><linearGradient id="lgg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c8a5a" stopOpacity=".18" /><stop offset="1" stopColor="#1c8a5a" stopOpacity="0" /></linearGradient></defs>
                      <path d="M6,64 L92,54 L178,58 L264,34 L350,40 L414,20 L414,86 L6,86 Z" fill="url(#lgg)" />
                      <path d="M6,64 L92,54 L178,58 L264,34 L350,40 L414,20" fill="none" stroke="#1c8a5a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="414" cy="20" r="3.5" fill="#1c8a5a" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg-chip pay"><span className="ic" style={{ background: '#e5f3ec', color: '#1c8a5a' }}>✓</span><div>Boleto pago<div className="s">Ana Duarte · R$ 1.200</div></div></div>
            <div className="lg-chip rep"><span className="ic" style={{ background: '#e9f0fc', color: '#1f5fd0' }}>⇄</span><div>Repasse concluído<div className="s">7 proprietários</div></div></div>
          </div>
        </div>
      </div>
    </div>
  );

  // ---- login / cadastro: cartão sobre o mesmo cenário ----
  const signup = view === 'signup';
  return (
    <div className="lg-stage lg-auth">
      <div className="lg-nav">
        <div className="lg-logo" style={{ cursor: 'pointer' }} onClick={() => { setErr(''); setView('hero'); }}><div className="mk">◆</div><div className="nm">ImobiFlow</div></div>
        <button className="lg-back" onClick={() => { setErr(''); setView('hero'); }}>← Voltar</button>
      </div>
      <div className="lg-authwrap">
        <div className="lg-card">
          <div className="fh">{signup ? 'Criar sua conta' : 'Entrar'}</div>
          <div className="fsub">{signup ? 'Comece a organizar seus aluguéis hoje.' : 'Acesse o painel da sua carteira.'}</div>
          {signup && <div className="lg-fg"><label>Nome</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" /></div>}
          <div className="lg-fg"><label>E-mail</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" /></div>
          <div className="lg-fg"><label>Senha</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && (signup ? doSignup() : doLogin())} /></div>
          {err && <p className="lg-err">{err}</p>}
          <button className="lg-primary lg-full" disabled={busy} onClick={signup ? doSignup : doLogin}>{busy ? 'Aguarde...' : (signup ? 'Começar agora' : 'Entrar')}</button>
          <div className="lg-switch">
            {signup ? <>Já tem conta? <b onClick={() => { setErr(''); setView('login'); }}>Entrar</b></> : <>Ainda não tem conta? <b onClick={() => { setErr(''); setView('signup'); }}>Assine o ImobiFlow</b></>}
          </div>
        </div>
      </div>
    </div>
  );
};

const CHKITEMS = ['Pintura e paredes', 'Elétrica e tomadas', 'Hidráulica e torneiras', 'Vidros e janelas', 'Limpeza geral', 'Chaves e controles'];
const STEP_NAMES = ['Imóvel', 'Inquilino', 'Análise de crédito', 'Contrato', 'Vistoria', 'Revisão'];

const Wizard: React.FC<{ properties: any[]; tenants: any[]; owners: any[]; onClose: () => void; onDone: (w: any) => void }> = ({ properties, tenants, owners, onClose, onDone }) => {
  const avail = properties.filter(p => p.status === 'available').sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
  const [step, setStep] = useState(0);
  const today = new Date().toISOString().slice(0, 10);
  const nextYear = (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0, 10); })();
  const [w, setW] = useState<any>({
    propertyId: avail[0]?.id || '', tenantMode: 'new', tenantId: tenants[0]?.id || '',
    tName: '', tDoc: '', tPhone: '', creditResult: 'aprovado', creditScore: '', creditObs: '',
    start: today, end: nextYear, rent: '', dueDay: 5, index: 'IPCA', guarantee: 'Caução',
    checks: [true, true, true, false, false, false], vobs: '', caucao: false, caucaoValue: '',
  });
  const set = (k: string, v: any) => setW((s: any) => ({ ...s, [k]: v }));
  const oName = (id: string) => owners.find(o => o.id === id)?.name || '';
  useEffect(() => { const p = properties.find(x => x.id === w.propertyId); if (p && !w.rent) set('rent', p.price); }, [w.propertyId]);

  const next = () => {
    if (step === 0 && !w.propertyId) return;
    if (step === 1) { if (w.tenantMode === 'new' && !w.tName.trim()) return; if (w.tenantMode === 'existing' && !w.tenantId) return; }
    if (step === STEP_NAMES.length - 1) { onDone(w); return; }
    setStep(step + 1);
  };
  const toggleChk = (i: number) => set('checks', w.checks.map((c: boolean, idx: number) => idx === i ? !c : c));

  return <div className="ov" onClick={e => { if ((e.target as any).className === 'ov') onClose(); }}>
    <div className="modal" style={{ maxWidth: 520 }}>
      <div className="mh"><h3><i className="fas fa-file-signature" /> Nova locação</h3><p>Passo {step + 1} de {STEP_NAMES.length} · {STEP_NAMES[step]}</p><div className="wizbar"><div style={{ width: `${(step + 1) / STEP_NAMES.length * 100}%` }} /></div></div>
      <div className="mb">
        {step === 0 && (avail.length === 0
          ? <div className="emptyrow">Nenhum imóvel disponível. Cadastre um imóvel ou marque um como Disponível antes de iniciar.</div>
          : <><p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 14 }}>Escolha o imóvel a ser alugado (só aparecem os Disponíveis).</p>
            <div className="field-g" style={{ marginTop: 0 }}><label className="lbl">Imóvel disponível</label><select className="inp" value={w.propertyId} onChange={e => set('propertyId', e.target.value)}>{avail.map(p => <option key={p.id} value={p.id}>{p.title} · {oName(p.ownerId)}</option>)}</select></div></>)}
        {step === 1 && <>
          <div className="field-g" style={{ marginTop: 0 }}><label className="lbl">Inquilino</label><select className="inp" value={w.tenantMode} onChange={e => set('tenantMode', e.target.value)}><option value="new">Cadastrar novo</option><option value="existing">Já cadastrado</option></select></div>
          {w.tenantMode === 'existing'
            ? <div className="field-g"><label className="lbl">Selecione</label><select className="inp" value={w.tenantId} onChange={e => set('tenantId', e.target.value)}>{tenants.length === 0 ? <option value="">Nenhum cadastrado</option> : [...tenants].sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''))).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            : <><div className="field-g"><label className="lbl">Nome</label><input className="inp" value={w.tName} onChange={e => set('tName', e.target.value)} /></div>
              <div style={{ display: 'flex', gap: 12 }}><div className="field-g" style={{ flex: 1 }}><label className="lbl">CPF/CNPJ</label><input className="inp" value={w.tDoc} onChange={e => set('tDoc', e.target.value)} /></div><div className="field-g" style={{ flex: 1 }}><label className="lbl">Telefone</label><input className="inp" value={w.tPhone} onChange={e => set('tPhone', e.target.value)} /></div></div>
              <label className="lbl" style={{ display: 'block', margin: '14px 0 7px' }}>Documentos</label><div className="dz" onClick={() => alert('A Pasta Digital (upload de documentos) entra na próxima etapa.')}><i className="fas fa-cloud-arrow-up" /><div style={{ marginTop: 6 }}>Anexar RG/CPF e comprovante de renda</div></div></>}
        </>}
        {step === 2 && <>
          <div className="field-g" style={{ marginTop: 0 }}><label className="lbl">Resultado da análise</label><select className="inp" value={w.creditResult} onChange={e => set('creditResult', e.target.value)}><option value="aprovado">Aprovado</option><option value="analise">Em análise</option><option value="reprovado">Reprovado</option></select></div>
          <div className="field-g"><label className="lbl">Score (opcional)</label><input className="inp" value={w.creditScore} onChange={e => set('creditScore', e.target.value)} /></div>
          <div className="field-g"><label className="lbl">Observações</label><textarea className="inp" rows={2} style={{ resize: 'vertical' }} value={w.creditObs} onChange={e => set('creditObs', e.target.value)} /></div>
        </>}
        {step === 3 && <>
          <div style={{ display: 'flex', gap: 12 }}><div className="field-g" style={{ flex: 1, marginTop: 0 }}><label className="lbl">Início</label><input className="inp" type="date" value={w.start} onChange={e => set('start', e.target.value)} /></div><div className="field-g" style={{ flex: 1, marginTop: 0 }}><label className="lbl">Término</label><input className="inp" type="date" value={w.end} onChange={e => set('end', e.target.value)} /></div></div>
          <div style={{ display: 'flex', gap: 12 }}><div className="field-g" style={{ flex: 1 }}><label className="lbl">Aluguel (R$)</label><input className="inp" type="number" value={w.rent} onChange={e => set('rent', e.target.value)} /></div><div className="field-g" style={{ width: 110 }}><label className="lbl">Dia venc.</label><input className="inp" type="number" value={w.dueDay} onChange={e => set('dueDay', e.target.value)} /></div></div>
          <div style={{ display: 'flex', gap: 12 }}><div className="field-g" style={{ flex: 1 }}><label className="lbl">Reajuste</label><select className="inp" value={w.index} onChange={e => set('index', e.target.value)}><option>IPCA</option><option>IGP-M</option></select></div><div className="field-g" style={{ flex: 1 }}><label className="lbl">Garantia</label><select className="inp" value={w.guarantee} onChange={e => set('guarantee', e.target.value)}><option>Caução</option><option>Fiador</option><option>Seguro-fiança</option></select></div></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, cursor: 'pointer', fontWeight: 600, fontSize: 13.5 }}>
            <input type="checkbox" checked={!!w.caucao} onChange={e => set('caucao', e.target.checked)} style={{ width: 18, height: 18 }} />
            Cobrar caução (gera um boleto separado)
          </label>
          {w.caucao && <div className="field-g"><label className="lbl">Valor do caução (R$)</label><input className="inp" type="number" value={w.caucaoValue} onChange={e => set('caucaoValue', e.target.value)} placeholder="Ex: 800" /></div>}
        </>}
        {step === 4 && <>
          <p style={{ fontSize: 13, color: 'var(--gray)', marginBottom: 10 }}>Confira o estado de entrega do imóvel.</p>
          {CHKITEMS.map((c, i) => <div key={i} className={'chk' + (w.checks[i] ? ' on' : '')} onClick={() => toggleChk(i)}><span className="bx"><i className="fas fa-check" /></span><span className="tx">{c}</span></div>)}
          <div className="field-g"><label className="lbl">Observações</label><textarea className="inp" rows={2} style={{ resize: 'vertical' }} value={w.vobs} onChange={e => set('vobs', e.target.value)} /></div>
        </>}
        {step === 5 && (() => {
          const p = properties.find(x => x.id === w.propertyId);
          const tn = w.tenantMode === 'new' ? w.tName : (tenants.find(t => t.id === w.tenantId)?.name || '—');
          const okc = w.checks.filter(Boolean).length;
          const cl: any = { aprovado: 'Aprovado', analise: 'Em análise', reprovado: 'Reprovado' };
          return <>
            <div className="revrow"><span className="k">Imóvel</span><span className="v">{p?.title} · {oName(p?.ownerId)}</span></div>
            <div className="revrow"><span className="k">Inquilino</span><span className="v">{tn || '—'}</span></div>
            <div className="revrow"><span className="k">Crédito</span><span className="v">{cl[w.creditResult]}</span></div>
            <div className="revrow"><span className="k">Contrato</span><span className="v">{w.start} a {w.end}</span></div>
            <div className="revrow"><span className="k">Aluguel</span><span className="v">R$ {brl(w.rent)} · dia {w.dueDay}</span></div>
            <div className="revrow"><span className="k">Reajuste / Garantia</span><span className="v">{w.index} · {w.guarantee}</span></div>
            <div className="revrow"><span className="k">Vistoria</span><span className="v">{okc} de {CHKITEMS.length} itens</span></div>
            {w.caucao && Number(w.caucaoValue) > 0 && <div className="revrow"><span className="k">Caução</span><span className="v">R$ {brl(w.caucaoValue)} · boleto será gerado</span></div>}
            <div className="note" style={{ marginTop: 14 }}><i className="fas fa-circle-info" /><span>Ao efetivar: o imóvel passa a <b>Alugado</b> e o contrato é criado.</span></div>
          </>;
        })()}
      </div>
      <div className="mf">
        <button className="cancel" onClick={() => step === 0 ? onClose() : setStep(step - 1)}>{step === 0 ? 'Cancelar' : 'Voltar'}</button>
        <button className="confirm" onClick={next}>{step === STEP_NAMES.length - 1 ? 'Efetivar locação' : 'Continuar'}</button>
      </div>
    </div>
  </div>;
};

const EXITCHK = ['Paredes e pintura', 'Elétrica e tomadas', 'Hidráulica e torneiras', 'Vidros e janelas', 'Limpeza geral', 'Chaves e controles devolvidos'];
const EncerrarModal: React.FC<{ lease: any; property: any; tenant: any; onClose: () => void; onConfirm: (p: any) => void }> = ({ lease, property, tenant, onClose, onConfirm }) => {
  const [checks, setChecks] = useState([false, false, false, false, false, false]);
  const [obs, setObs] = useState('');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const toggle = (i: number) => setChecks(checks.map((c, idx) => idx === i ? !c : c));
  return <div className="ov" onClick={e => { if ((e.target as any).className === 'ov') onClose(); }}>
    <div className="modal" style={{ maxWidth: 480 }}>
      <div className="mh" style={{ background: 'var(--amber)' }}><h3><i className="fas fa-file-circle-xmark" /> Encerrar contrato</h3><p>{property?.title} · {tenant?.name || ''}</p></div>
      <div className="mb">
        <div className="field-g" style={{ marginTop: 0 }}><label className="lbl">Data de saída</label><input className="inp" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
        <label className="lbl" style={{ display: 'block', margin: '16px 0 4px' }}>Vistoria de saída</label>
        {EXITCHK.map((c, i) => <div key={i} className={'chk' + (checks[i] ? ' on' : '')} onClick={() => toggle(i)}><span className="bx"><i className="fas fa-check" /></span><span className="tx">{c}</span></div>)}
        <div className="field-g"><label className="lbl">Observações da saída</label><textarea className="inp" rows={2} style={{ resize: 'vertical' }} value={obs} onChange={e => setObs(e.target.value)} placeholder="Ex: parede riscada no quarto, combinar reparo..." /></div>
      </div>
      <div className="mf"><button className="cancel" onClick={onClose}>Cancelar</button><button className="confirm" style={{ background: 'var(--amber)' }} onClick={() => onConfirm({ endDate, checks, obs })}>Confirmar encerramento</button></div>
    </div>
  </div>;
};

// ---------------- APP ----------------
const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [booting, setBooting] = useState(true);
  const [screen, setScreen] = useState('dashboard');
  const [owners, setOwners] = useState<any[]>([]);
  const [props, setProps] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [leases, setLeases] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [wizOpen, setWizOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [exitLease, setExitLease] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [toast, setToast] = useState('');
  const [dark, setDark] = useState(() => { try { const v = localStorage.getItem('imobiflow-theme'); return v ? v === 'dark' : true; } catch { return true; } });
  const [navHidden, setNavHidden] = useState(() => { try { return localStorage.getItem('imobiflow-nav') === 'hidden'; } catch { return false; } });
  const [fImo, setFImo] = useState({ q: '', type: '', status: '', owner: '' });
  const [fInq, setFInq] = useState('');
  const [fDesp, setFDesp] = useState({ q: '', cat: '', owner: '' });
  const [sortImo, setSortImo] = useState('title');
  const [sortOwn, setSortOwn] = useState('name');
  const [sortInq, setSortInq] = useState('name');
  const [sortDesp, setSortDesp] = useState('date-desc');
  const [fPag, setFPag] = useState('');
  const [sortPag, setSortPag] = useState('comp');
  const [mesPag, setMesPag] = useState('');
  const [mesPend, setMesPend] = useState(COMP);
  const [fPend, setFPend] = useState('');
  const [sortPend, setSortPend] = useState('tenant');
  const [pendEdit, setPendEdit] = useState<any>(null);
  const [repOwner, setRepOwner] = useState('');
  const [selMonth, setSelMonth] = useState(COMP);
  const [closings, setClosings] = useState<any[]>([]);
  const [statusHist, setStatusHist] = useState<any[]>([]);
  const [statusEdit, setStatusEdit] = useState<any>(null);
  const [vagas, setVagas] = useState<any[]>([]);
  const [vagaEdit, setVagaEdit] = useState<any>(null);
  const [openCard, setOpenCard] = useState<Record<string, boolean>>({});

  useEffect(() => { (async () => { const u = await dbService.getMe(); setUser(u); if (u) await loadAll(); setBooting(false); })(); }, []);
  useEffect(() => { document.body.classList.toggle('dark', dark); try { localStorage.setItem('imobiflow-theme', dark ? 'dark' : 'light'); } catch { } }, [dark]);
  useEffect(() => { try { localStorage.setItem('imobiflow-nav', navHidden ? 'hidden' : 'shown'); } catch { } }, [navHidden]);

  const loadAll = async () => {
    try {
      const [o, p, t, e, l, pay, cl, sh, vg] = await Promise.all([
        dbService.fetchData('owners'), dbService.fetchData('properties'),
        dbService.fetchData('tenants'), dbService.fetchData('expenses'), dbService.fetchData('leases'), dbService.fetchData('payments'), dbService.fetchData('closings'),
        dbService.fetchData('statusHistory').catch(() => []),
        dbService.fetchData('parkingSpots').catch(() => []),
      ]);
      setOwners(o); setProps(p); setTenants(t); setExpenses(e); setLeases(l); setPayments(pay); setClosings(cl); setStatusHist(sh || []); setVagas(vg || []);
    } catch (err) { console.error(err); }
  };
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200); };
  const logout = async () => { await dbService.logout(); setUser(null); };

  const save = async () => {
    const { coll, values } = form;
    try {
      const clean = { ...values };
      if (clean.price !== undefined) clean.price = Number(clean.price) || 0;
      if (clean.amount !== undefined) clean.amount = Number(clean.amount) || 0;
      if (clean.commissionRate !== undefined) clean.commissionRate = Number(clean.commissionRate) || 0;
      if (clean.monthlyRent !== undefined) clean.monthlyRent = Number(clean.monthlyRent) || 0;
      if (clean.dueDay !== undefined) clean.dueDay = Number(clean.dueDay) || 0;
      if (values.id) await dbService.update(coll, values.id, clean);
      else await dbService.insert(coll, clean);
      setForm(null); await loadAll(); notify('Salvo com sucesso ✓');
    } catch (err) { console.error(err); notify('Erro ao salvar'); }
  };
  const remove = async (coll: string, id: string, label: string) => {
    if (!window.confirm(`Excluir ${label}? Essa ação não pode ser desfeita.`)) return;
    try { await dbService.delete(coll, id); await loadAll(); notify('Excluído'); }
    catch { notify('Erro ao excluir'); }
  };
  const logStatus = async (propertyId: string, status: string, date: string, reason: string) => {
    try { await dbService.insert('statusHistory', { propertyId, status, date, reason: reason || '', createdAt: new Date().toISOString() }); } catch (e) { console.error('logStatus falhou (ignorado):', e); }
  };
  const setMaintenance = (p: any) => {
    const next = p.status === 'maintenance' ? 'available' : 'maintenance';
    setStatusEdit({ property: p, status: next, date: new Date().toISOString().slice(0, 10), reason: '' });
  };
  const salvarStatus = async () => {
    if (!statusEdit) return;
    const { property, status, date, reason } = statusEdit;
    try {
      await dbService.update('properties', property.id, { status });
      await logStatus(property.id, status, date, reason);
      setStatusEdit(null); await loadAll();
      notify(status === 'maintenance' ? 'Imóvel em manutenção' : status === 'available' ? 'Imóvel disponível' : 'Status atualizado');
    } catch (e) { console.error(e); notify('Erro ao alterar status'); }
  };
  const statusInMonth = (propertyId: string, month: string) => {
    const mEnd = `${month}-31`;
    const h = statusHist.filter(x => x.propertyId === propertyId && String(x.date || '') <= mEnd).sort((a, b) => String(b.date).localeCompare(String(a.date)));
    if (h.length) return h[0].status;
    return props.find(x => x.id === propertyId)?.status || 'available';
  };
  const rentedInMonth = (propertyId: string, month: string) => {
    const mStart = `${month}-01`, mEnd = `${month}-31`;
    return leases.some(l => {
      if (l.propertyId !== propertyId) return false;
      if (String(l.startDate || '9999') > mEnd) return false;
      const end = l.active ? '9999-12-31' : String(l.endedAt || l.endDate || '');
      return !end || end >= mStart;
    });
  };
  const efetivarLocacao = async (w: any) => {
    try {
      let tenantId = w.tenantId;
      if (w.tenantMode === 'new') {
        const t = await dbService.insert('tenants', { name: w.tName || 'Novo inquilino', document: w.tDoc || '', phone: w.tPhone || '' });
        tenantId = t.id;
      }
      const caucaoVal = w.caucao ? Number(w.caucaoValue) || 0 : 0;
      const lease: any = await dbService.insert('leases', {
        propertyId: w.propertyId, tenantId, startDate: w.start, endDate: w.end,
        monthlyRent: Number(w.rent) || 0, dueDay: Number(w.dueDay) || 5, active: true, deposit: caucaoVal,
        readjustIndex: w.index, guarantee: w.guarantee,
        creditResult: w.creditResult, creditScore: w.creditScore, creditNotes: w.creditObs,
        entryChecklist: JSON.stringify({ items: w.checks, notes: w.vobs }),
      });
      await dbService.update('properties', w.propertyId, { status: 'rented' });
      await logStatus(w.propertyId, 'rented', w.start || new Date().toISOString().slice(0, 10), 'Locação iniciada');
      setWizOpen(false); await loadAll();
      if (caucaoVal > 0) {
        try {
          const fn = httpsCallable(fns, 'createAsaasCharge');
          const d = new Date(); d.setDate(d.getDate() + 1); const dueDate = d.toISOString().slice(0, 10);
          const res: any = await fn({ tenantId, leaseId: lease.id, amount: caucaoVal, dueDate, billingType: 'BOLETO', kind: 'deposit', description: 'Caução' });
          await loadAll(); notify('Locação efetivada · boleto de caução gerado ✓');
          if (res?.data?.invoiceUrl) window.open(res.data.invoiceUrl, '_blank');
        } catch (err: any) { console.error(err); notify('Locação criada, mas o boleto de caução falhou: ' + (err?.message || '')); }
      } else {
        notify('Locação efetivada · imóvel alugado ✓');
      }
    } catch (err) { console.error(err); notify('Erro ao efetivar a locação'); }
  };

  const calcOwner = (o: any, month: string) => {
    const ps = props.filter(p => p.ownerId === o.id && p.status === 'rented');
    const recebido = payments.filter(p => p.ownerId === o.id && p.status === 'RECEIVED' && (p.kind || 'rent') !== 'deposit' && recMonthOf(p) === month).reduce((s, p) => s + Number(p.amount || 0), 0);
    const desp = expenses.filter(e => e.ownerId === o.id && String(e.date || '').slice(0, 7) === month).reduce((s, e) => s + Number(e.amount || 0), 0);
    const rate = Number(o.commissionRate ?? 10);
    const mode = o.commissionMode || 'deducted';
    const taxa = Math.round(recebido * rate) / 100;
    const liquido = mode === 'deducted' ? recebido - desp - taxa : recebido - desp;
    return { recebido, desp, rate, mode, taxa, liquido, names: ps.map(p => p.title).sort((a, b) => String(a).localeCompare(String(b))).join(' · ') || 'Sem imóveis alugados' };
  };
  const fecharMes = async (o: any, month: string, calc: any) => {
    try { await dbService.insert('closings', { ownerId: o.id, month, recebido: calc.recebido, desp: calc.desp, taxa: calc.taxa, liquido: calc.liquido, rate: calc.rate, mode: calc.mode, closedAt: new Date().toISOString() }); await loadAll(); notify('Mês fechado ✓'); }
    catch (err) { console.error(err); notify('Erro ao fechar o mês'); }
  };
  const reabrirMes = async (closing: any) => {
    if (!window.confirm('Reabrir este mês? O fechamento salvo será removido e voltará a ser calculado ao vivo.')) return;
    try { await dbService.delete('closings', closing.id); await loadAll(); notify('Mês reaberto'); }
    catch { notify('Erro ao reabrir'); }
  };
  const exportarPDF = async (o: any, month: string) => {
    try {
      notify('Gerando PDF...');
      const mod: any = await import('html2pdf.js');
      const html2pdf = mod.default || mod;
      const node = document.getElementById('extrato-doc');
      if (!node) { notify('Nada para exportar'); return; }
      const nome = `Extrato-${String(o.name || 'proprietario').replace(/[^a-zA-Z0-9]+/g, '-')}-${month}.pdf`;
      await html2pdf().set({ margin: [8, 8, 8, 8], filename: nome, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(node).save();
      notify('PDF exportado ✓');
    } catch (e) { console.error(e); notify('Erro ao exportar PDF'); }
  };
  const oName = (id: string) => owners.find(o => o.id === id)?.name || '—';

  const uploadDoc = async (propertyId: string, file: File) => {
    setUploading(true);
    try {
      const path = `${user.id}/${propertyId}/${Date.now()}-${file.name}`;
      const stored = await dbService.uploadFile('documents', path, file);
      const p = props.find(x => x.id === propertyId);
      const docs = Array.isArray(p?.documents) ? p.documents : [];
      await dbService.update('properties', propertyId, { documents: [...docs, { name: file.name, path: stored, at: new Date().toISOString() }] });
      await loadAll(); notify('Documento anexado ✓');
    } catch (err) { console.error(err); notify('Erro ao enviar o documento'); }
    setUploading(false);
  };
  const openDoc = async (path: string) => {
    const url = await dbService.getSignedUrl('documents', path);
    if (url) window.open(url, '_blank'); else notify('Não foi possível abrir o documento');
  };
  const removeDoc = async (propertyId: string, idx: number) => {
    if (!window.confirm('Remover este documento da pasta?')) return;
    const p = props.find(x => x.id === propertyId);
    const docs = [...(p?.documents || [])]; docs.splice(idx, 1);
    await dbService.update('properties', propertyId, { documents: docs });
    await loadAll(); notify('Documento removido');
  };
  const markPayment = async (lease: any, existing: any) => {
    try {
      if (existing) { await dbService.delete('payments', existing.id); }
      else {
        const p = props.find(x => x.id === lease.propertyId);
        await dbService.insert('payments', {
          leaseId: lease.id, tenantId: lease.tenantId, propertyId: lease.propertyId, ownerId: p?.ownerId || '',
          amount: Number(lease.monthlyRent) || 0, asaasFee: BOLETO_FEE, competencia: mesPend,
          dueDate: `${mesPend}-${String(lease.dueDay || 5).padStart(2, '0')}`, status: 'RECEIVED', receivedAt: new Date().toISOString(),
        });
      }
      await loadAll(); notify(existing ? 'Recebimento desfeito' : 'Pagamento recebido ✓');
    } catch (err) { console.error(err); notify('Erro ao atualizar o pagamento'); }
  };
  const gerarCobranca = async (lease: any) => {
    try {
      notify('Gerando cobrança no Asaas...');
      const draft = payments.find(x => x.leaseId === lease.id && x.competencia === mesPend && (x.kind || 'rent') !== 'deposit' && !x.asaasPaymentId);
      const amount = draft ? Number(draft.amount || 0) : (Number(lease.monthlyRent) || 0);
      const dueDate = draft?.dueDate || `${mesPend}-${String(lease.dueDay || 5).padStart(2, '0')}`;
      const fn = httpsCallable(fns, 'createAsaasCharge');
      const res: any = await fn({ leaseId: lease.id, tenantId: lease.tenantId, amount, dueDate, billingType: 'BOLETO' });
      if (draft) { try { await dbService.delete('payments', draft.id); } catch (e) { console.error(e); } }
      await loadAll(); notify('Cobrança gerada ✓');
      if (res?.data?.invoiceUrl) window.open(res.data.invoiceUrl, '_blank');
    } catch (err: any) { console.error(err); notify('Erro ao gerar: ' + (err?.message || 'falha')); }
  };
  const openPendEdit = (lease: any, draft: any) => {
    const p = props.find(x => x.id === lease.propertyId);
    setPendEdit({
      draftId: draft?.id || null, leaseId: lease.id, tenantId: lease.tenantId,
      propertyId: lease.propertyId, ownerId: p?.ownerId || '',
      amount: String(draft ? draft.amount : (lease.monthlyRent || '')),
      dueDate: draft?.dueDate || `${mesPend}-${String(lease.dueDay || 5).padStart(2, '0')}`,
    });
  };
  const savePendEdit = async () => {
    if (!pendEdit) return;
    try {
      const data = {
        leaseId: pendEdit.leaseId, tenantId: pendEdit.tenantId, propertyId: pendEdit.propertyId, ownerId: pendEdit.ownerId,
        amount: Number(pendEdit.amount) || 0, competencia: mesPend, dueDate: pendEdit.dueDate,
        status: 'PENDING', kind: 'rent', asaasFee: BOLETO_FEE,
      };
      if (pendEdit.draftId) await dbService.update('payments', pendEdit.draftId, data);
      else await dbService.insert('payments', { ...data, createdAt: new Date().toISOString() });
      setPendEdit(null); await loadAll(); notify('Título atualizado ✓');
    } catch (err) { console.error(err); notify('Erro ao salvar'); }
  };
  const confirmarPag = async (pay: any) => {
    try { await dbService.update('payments', pay.id, { status: 'RECEIVED', receivedAt: new Date().toISOString() }); await loadAll(); notify('Pagamento recebido ✓'); }
    catch { notify('Erro ao confirmar'); }
  };
  const desfazerPag = async (pay: any) => {
    try { if (pay.asaasPaymentId) await dbService.update('payments', pay.id, { status: 'PENDING' }); else await dbService.delete('payments', pay.id); await loadAll(); notify('Desfeito'); }
    catch { notify('Erro ao desfazer'); }
  };
  const excluirPagamento = async (pay: any) => {
    if (!window.confirm('Excluir este recebimento/cobrança? Se houver boleto no Asaas, ele será cancelado. Esta ação não pode ser desfeita.')) return;
    try {
      if (pay.asaasPaymentId) {
        try { const fn = httpsCallable(fns, 'cancelAsaasCharge'); await fn({ asaasPaymentId: pay.asaasPaymentId }); } catch (e) { console.error('cancelamento Asaas falhou (ignorado):', e); }
      }
      await dbService.delete('payments', pay.id);
      await loadAll(); notify('Excluído');
    } catch (err) { console.error(err); notify('Erro ao excluir'); }
  };
  const removeLease = async (lease: any) => {
    const t = tenants.find(x => x.id === lease.tenantId);
    if (!window.confirm(`Remover este contrato de ${t?.name || 'inquilino'} (início ${fmtDate(lease.startDate)})?\n\nAs cobranças PENDENTES deste contrato serão canceladas (inclusive o boleto no Asaas). As já pagas serão mantidas no histórico.\n\nEsta ação não pode ser desfeita.`)) return;
    try {
      const pend = payments.filter(pp => pp.leaseId === lease.id && pp.status !== 'RECEIVED');
      for (const pp of pend) {
        if (pp.asaasPaymentId) { try { const fn = httpsCallable(fns, 'cancelAsaasCharge'); await fn({ asaasPaymentId: pp.asaasPaymentId }); } catch (e) { console.error('cancelamento Asaas falhou (ignorado):', e); } }
        await dbService.delete('payments', pp.id);
      }
      await dbService.delete('leases', lease.id);
      await loadAll(); notify('Contrato removido');
    } catch (err) { console.error(err); notify('Erro ao remover contrato'); }
  };
  const salvarVaga = async () => {
    if (!vagaEdit) return;
    const v = vagaEdit;
    if (!String(v.label || '').trim()) { notify('Dê um nome/número à vaga'); return; }
    const tipo = v.tipo || 'carro';
    const clean = (o: any) => (o && (o.propertyId || o.marca || o.modelo || o.placa)) ? { propertyId: o.propertyId || '', marca: o.marca || '', modelo: o.modelo || '', placa: String(o.placa || '').toUpperCase() } : null;
    const payload: any = { label: v.label.trim(), tipo, carro: tipo === 'moto' ? null : clean(v.carro), moto: tipo === 'carro' ? null : clean(v.moto) };
    try {
      if (v.id) await dbService.update('parkingSpots', v.id, payload);
      else { payload.createdAt = new Date().toISOString(); await dbService.insert('parkingSpots', payload); }
      setVagaEdit(null); await loadAll(); notify('Vaga salva');
    } catch (e) { console.error(e); notify('Erro ao salvar vaga'); }
  };
  const excluirVaga = async (v: any) => {
    if (!window.confirm(`Excluir a ${v.label}? Esta ação não pode ser desfeita.`)) return;
    try { await dbService.delete('parkingSpots', v.id); await loadAll(); notify('Vaga excluída'); }
    catch (e) { console.error(e); notify('Erro ao excluir vaga'); }
  };
  const encerrarContrato = async (lease: any, payload: any) => {
    try {
      await dbService.update('leases', lease.id, { active: false, endedAt: payload.endDate, exitChecklist: JSON.stringify({ items: payload.checks, notes: payload.obs }) });
      await dbService.update('properties', lease.propertyId, { status: 'available' });
      await logStatus(lease.propertyId, 'available', payload.endDate || new Date().toISOString().slice(0, 10), 'Contrato encerrado');
      setExitLease(null); await loadAll(); notify('Contrato encerrado · imóvel disponível');
    } catch (err) { console.error(err); notify('Erro ao encerrar o contrato'); }
  };
  const openLease = (lease: any, renew?: boolean) => {
    const base: any = { ...lease };
    if (renew) { const st = lease.endDate || COMP + '-01'; const d = new Date(st + 'T00:00:00'); d.setFullYear(d.getFullYear() + 1); base.startDate = st; base.endDate = d.toISOString().slice(0, 10); }
    setForm({
      coll: 'leases', title: renew ? 'Renovar contrato' : 'Editar contrato', icon: 'fa-file-contract', values: base,
      fields: [
        { k: 'startDate', l: 'Início', t: 'date', half: true }, { k: 'endDate', l: 'Término', t: 'date', half: true },
        { k: 'monthlyRent', l: 'Aluguel (R$)', t: 'number', half: true }, { k: 'dueDay', l: 'Dia venc.', t: 'number', half: true },
        { k: 'readjustIndex', l: 'Reajuste', t: 'select', half: true, o: [['IPCA', 'IPCA'], ['IGP-M', 'IGP-M']] }, { k: 'guarantee', l: 'Garantia', t: 'select', half: true, o: [['Caução', 'Caução'], ['Fiador', 'Fiador'], ['Seguro-fiança', 'Seguro-fiança']] },
      ],
    });
  };

  // ---- forms ----
  const setV = (k: string, v: any) => setForm((f: any) => ({ ...f, values: { ...f.values, [k]: v } }));
  const openImovel = (p?: any) => setForm({
    coll: 'properties', title: p ? 'Editar imóvel' : 'Novo imóvel', icon: 'fa-house',
    values: { title: '', type: PropertyType.KITNET, address: '', price: '', status: 'available', ownerId: owners[0]?.id || '', ...p },
    fields: [
      { k: 'title', l: 'Título', t: 'text' }, { k: 'type', l: 'Tipo', t: 'select', o: TIPOS.map(x => [x, x]) },
      { k: 'address', l: 'Endereço', t: 'text' },
      { k: 'ownerId', l: 'Proprietário', t: 'select', o: owners.map(o => [o.id, o.name]) },
      { k: 'price', l: 'Aluguel (R$)', t: 'number', half: true },
      { k: 'status', l: 'Situação', t: 'select', half: true, o: [['available', 'Disponível'], ['rented', 'Alugado'], ['maintenance', 'Manutenção']] },
    ],
  });
  const openOwner = (o?: any) => setForm({
    coll: 'owners', title: o ? 'Editar proprietário' : 'Novo proprietário', icon: 'fa-user',
    values: { name: '', phone: '', pixKey: '', commissionRate: 10, commissionMode: 'deducted', ...o },
    fields: [
      { k: 'name', l: 'Nome', t: 'text' }, { k: 'phone', l: 'Telefone', t: 'text' },
      { k: 'pixKey', l: 'Chave PIX', t: 'text' },
      { k: 'commissionRate', l: 'Comissão (%)', t: 'number', half: true },
      { k: 'commissionMode', l: 'Modelo comissão', t: 'select', half: true, o: [['deducted', 'Abatida no repasse'], ['invoiced', 'Faturada à parte']] },
    ],
  });
  const openTenant = (t?: any) => setForm({
    coll: 'tenants', title: t ? 'Editar inquilino' : 'Novo inquilino', icon: 'fa-user-group',
    values: { name: '', phone: '', document: '', notes: '', ...t },
    fields: [
      { k: 'name', l: 'Nome', t: 'text' }, { k: 'document', l: 'CPF / CNPJ', t: 'text' },
      { k: 'phone', l: 'Telefone', t: 'text' }, { k: 'notes', l: 'Observações', t: 'text' },
    ],
  });
  const openDespesa = (e?: any) => setForm({
    coll: 'expenses', title: e ? 'Editar despesa' : 'Nova despesa', icon: 'fa-receipt',
    values: { date: '2026-06-01', ownerId: owners[0]?.id || '', propertyId: '', category: ExpenseCategory.MAINTENANCE, description: '', amount: '', ...e },
    fields: [
      { k: 'date', l: 'Data', t: 'date' },
      { k: 'ownerId', l: 'Proprietário', t: 'select', o: owners.map(o => [o.id, o.name]) },
      { k: 'propertyId', l: 'Imóvel (opcional)', t: 'select', o: [['', '—']].concat(props.map(p => [p.id, p.title])) },
      { k: 'category', l: 'Categoria', t: 'select', o: CATS.map(x => [x, x]) },
      { k: 'description', l: 'Descrição', t: 'text' }, { k: 'amount', l: 'Valor (R$)', t: 'number' },
    ],
  });

  if (booting) return <div className="center"><div className="spin" /></div>;
  if (!user) return <Login onIn={async (u) => { setUser(u); await loadAll(); }} />;

  const titles: any = {
    dashboard: ['Dashboard', 'visão geral da carteira'], imoveis: ['Imóveis', 'gestão da carteira'],
    proprietarios: ['Proprietários', 'fichas de repasse'], inquilinos: ['Inquilinos', 'seus locatários'],
    despesas: ['Despesas', 'lançamentos do mês'], pagamentos: ['Pagamentos', 'cobranças'],
    relatorios: ['Relatórios', 'extrato por proprietário'],
    vagas: ['Vagas de garagem', 'controle de ocupação e veículos'],
  };

  // ---- dashboard chart helpers ----
  const chartMonths = Array.from({ length: 6 }, (_, i) => { const d = new Date(+COMP.split('-')[0], +COMP.split('-')[1] - 6 + i, 1); return d.toISOString().slice(0, 7); });
  const hist = chartMonths.map(m => ({
    m: MESNOME[+m.split('-')[1]].slice(0, 3),
    receb: payments.filter(p => p.status === 'RECEIVED' && recMonthOf(p) === m && (p.kind || 'rent') !== 'deposit').reduce((s, p) => s + Number(p.amount || 0), 0),
    desp: expenses.filter(e => (e.date || '').slice(0, 7) === m).reduce((s, e) => s + Number(e.amount || 0), 0),
  }));
  const maxv = Math.max(1, ...hist.map(h => Math.max(h.receb, h.desp)));
  const statusCount = (st: string) => props.filter(p => p.status === st).length;
  const donut = [
    { l: 'Alugado', v: statusCount('rented'), c: '#1c8a5a' },
    { l: 'Disponível', v: statusCount('available'), c: '#8a8f98' },
    { l: 'Manutenção', v: statusCount('maintenance'), c: '#b07d12' },
  ];
  const donutTotal = props.length;
  const donutCirc = 2 * Math.PI * 52; let donutOff = 0;

  const nav = (id: string, icon: string, label: string) => (
    <button key={id} className={screen === id ? 'active' : ''} onClick={() => { setScreen(id); setDetailId(null); }}><i className={'fas ' + icon} />{label}</button>
  );

  return (
    <div className={'ifapp' + (navHidden ? ' nonav' : '')}>
      <aside className="side">
        <div className="brand"><div className="mk"><i className="fas fa-building" /></div><div className="nm">Imobi<span>Flow</span></div></div>
        <nav className="nav">
          <div className="sec lbl">Gestão</div>
          {nav('dashboard', 'fa-chart-pie', 'Dashboard')}
          {nav('imoveis', 'fa-house', 'Imóveis')}
          {nav('proprietarios', 'fa-user', 'Proprietários')}
          {nav('inquilinos', 'fa-user-group', 'Inquilinos')}
          {nav('vagas', 'fa-square-parking', 'Vagas')}
          <div className="sec lbl">Financeiro</div>
          {nav('despesas', 'fa-receipt', 'Despesas')}
          {nav('pagamentos', 'fa-credit-card', 'Pagamentos')}
          {nav('relatorios', 'fa-file-invoice', 'Relatórios')}
        </nav>
        <div className="foot"><span className="av">{initials(user.name)}</span><div><div className="nn">{user.name}</div><div className="lbl" style={{ fontSize: 10 }}>Administrador</div></div><button className="logout" title="Sair" onClick={logout}><i className="fas fa-right-from-bracket" /></button></div>
      </aside>

      <main className="main">
        <header className="top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="act hidesm" title={navHidden ? 'Mostrar menu' : 'Esconder menu'} onClick={() => setNavHidden(v => !v)}><i className="fas fa-bars" /></button>
            <div><h1>{titles[screen][0]}</h1><div className="subt">{titles[screen][1]}</div></div>
          </div>
          <button className="act" title={dark ? 'Modo claro' : 'Modo escuro'} onClick={() => setDark(d => !d)} style={{ width: 38, height: 38 }}><i className={'fas ' + (dark ? 'fa-sun' : 'fa-moon')} /></button>
        </header>
        <div className="wrap">

          {screen === 'dashboard' && <>
            <div className="filters">
              <select value={selMonth} onChange={e => setSelMonth(e.target.value)}>{MONTH_OPTIONS.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}</select>
              <select value={repOwner} onChange={e => setRepOwner(e.target.value)}><option value="">Todos os proprietários</option>{owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
            </div>
            {(() => {
              const scO = repOwner ? owners.filter(o => o.id === repOwner) : owners;
              const scP = repOwner ? props.filter(p => p.ownerId === repOwner) : props;
              const activeL = leases.filter(l => l.active && scP.some(p => p.id === l.propertyId));
              const cls = activeL.map(l => {
                const pay = payments.find(x => x.leaseId === l.id && x.competencia === selMonth && (x.kind || 'rent') !== 'deposit');
                const received = !!(pay && pay.status === 'RECEIVED');
                const due = pay?.dueDate || `${selMonth}-${String(l.dueDay || 5).padStart(2, '0')}`;
                const dias = Math.floor((Date.now() - new Date(due + 'T00:00:00').getTime()) / 86400000);
                return { received, overdue: !received && dias > 0 };
              });
              const total = cls.length;
              const nRec = cls.filter(x => x.received).length;
              const nVenc = cls.filter(x => x.overdue).length;
              const nAber = Math.max(0, total - nRec - nVenc);
              const pct = total ? Math.round(nRec / total * 100) : 0;
              const recV = scO.reduce((s, o) => s + calcOwner(o, selMonth).recebido, 0);
              const prevV = activeL.reduce((s, l) => s + Number(l.monthlyRent || 0), 0);
              const repV = scO.reduce((s, o) => s + calcOwner(o, selMonth).liquido, 0);
              const saude = total === 0 ? { t: 'Sem locações no mês', c: 'var(--faint)', bg: 'var(--line2)' } : nVenc === 0 ? { t: `Mês saudável · ${pct}% recebido`, c: 'var(--emerald)', bg: 'var(--emerald-50)' } : nVenc <= 2 ? { t: `${pct}% recebido · ${nVenc} em atraso`, c: 'var(--amber)', bg: 'var(--amber-50)' } : { t: `Atenção · ${nVenc} em atraso`, c: 'var(--red)', bg: 'var(--red-50)' };
              return <div className="cockpit glass">
                <div className="ckhd"><div className="ckt">Recebimento de {monthLabel(selMonth)}</div><div className="ckchip" style={{ color: saude.c, background: saude.bg }}><i style={{ background: saude.c }} />{saude.t}</div></div>
                <div className="ckmid">
                  <div className="ckmeter">
                    <div className="ckbig"><b>{nRec}</b> de {total} aluguéis recebidos</div>
                    <div className="cktrack">{nRec > 0 && <i className="r" style={{ flex: nRec }} />}{nAber > 0 && <i className="a" style={{ flex: nAber }} />}{nVenc > 0 && <i className="o" style={{ flex: nVenc }} />}{total === 0 && <i style={{ flex: 1, background: 'var(--line2)' }} />}</div>
                    <div className="cklegend"><span><em style={{ background: 'var(--emerald)' }} />Recebidos <b>{nRec}</b></span><span><em style={{ background: 'var(--amber)' }} />A vencer <b>{nAber}</b></span><span><em style={{ background: 'var(--red)' }} />Em atraso <b>{nVenc}</b></span><span className="ckval">R$ {brl(recV)} de R$ {brl(prevV)}</span></div>
                  </div>
                  <div className="ckrep"><div className="l">Líquido p/ repasse</div><div className="v"><small>R$ </small>{brl(repV)}</div><div className="d">{scO.length} proprietário(s)</div></div>
                </div>
              </div>;
            })()}
            {(() => {
              const scOwners = repOwner ? owners.filter(o => o.id === repOwner) : owners;
              const scProps = repOwner ? props.filter(p => p.ownerId === repOwner) : props;
              const rec = scOwners.reduce((s, o) => s + calcOwner(o, selMonth).recebido, 0);
              const previsto = leases.filter(l => l.active && scProps.some(p => p.id === l.propertyId)).reduce((s, l) => s + Number(l.monthlyRent || 0), 0);
              const rep = scOwners.reduce((s, o) => s + calcOwner(o, selMonth).liquido, 0);
              const alug = scProps.filter(p => p.status === 'rented').length;
              const tot = scProps.filter(p => p.status !== 'maintenance').length;
              return <div className="kpis">
                <div className="kpi glass"><div className="ic bg-ind"><i className="fas fa-house" /></div><div className="lbl">Imóveis Alugados</div><div className="v">{alug} <small>/{tot}</small></div><div className="m">{tot - alug} disponível(is)</div></div>
                <div className="kpi glass"><div className="ic bg-eme"><i className="fas fa-sack-dollar" /></div><div className="lbl">Recebido no Mês</div><div className="v if-mono">{brl(rec)}</div><div className="m">de R$ {brl(previsto)} previstos</div></div>
                <div className="kpi glass hero"><div className="ic"><i className="fas fa-right-left" /></div><div className="lbl">Saldo p/ Repasse</div><div className="v if-mono">{brl(rep)}</div><div className="m">{scOwners.length} proprietário(s)</div></div>
                <div className="kpi glass"><div className="ic bg-red"><i className="fas fa-screwdriver-wrench" /></div><div className="lbl">Em Manutenção</div><div className="v">{scProps.filter(p => p.status === 'maintenance').length}</div><div className="m">imóveis parados</div></div>
              </div>;
            })()}
            <div className="grid2">
              <div className="glass chartcard">
                <div className="ph" style={{ padding: '0 0 14px', border: 'none' }}><h3><span className="bar" />Recebido x Despesas — mês a mês</h3></div>
                <svg viewBox="0 0 340 176" width="100%" style={{ display: 'block', color: 'var(--emerald)', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="feyArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.24" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[150, 104, 58, 12].map((y, k) => <line key={'g' + k} x1="8" y1={y} x2="332" y2={y} className="chart-grid" />)}
                  {hist.map((h, i) => { const x = 8 + (324 / (hist.length - 1)) * i; const dH = h.desp / maxv * 130; return <rect key={'d' + i} x={x - 4} y={150 - dH} width="8" height={Math.max(1, dH)} rx="2" className="chart-desp" />; })}
                  {(() => {
                    const pts = hist.map((h, i) => [8 + (324 / (hist.length - 1)) * i, 150 - (h.receb / maxv) * 130] as [number, number]);
                    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
                    const last = pts[pts.length - 1];
                    return <g>
                      <path d={line + ' L332,150 L8,150 Z'} fill="url(#feyArea)" />
                      <path d={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx={last[0]} cy={last[1]} r="7" fill="currentColor" opacity="0.18" />
                      <circle cx={last[0]} cy={last[1]} r="3.5" fill="currentColor" />
                    </g>;
                  })()}
                  {hist.map((h, i) => { const x = 8 + (324 / (hist.length - 1)) * i; return <text key={'t' + i} x={x} y="168" textAnchor="middle" className="chart-lab">{h.m}</text>; })}
                </svg>
                <div className="legend"><span><i style={{ background: 'var(--indigo)' }} />Recebido</span><span><i style={{ background: 'var(--faint)' }} />Despesas</span></div>
              </div>
              <div className="glass chartcard">
                <div className="ph" style={{ padding: '0 0 14px', border: 'none' }}><h3><span className="bar" />Situação dos imóveis</h3></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <svg viewBox="0 0 128 128" width="120" height="120" style={{ flex: '0 0 auto' }}>
                    {donutTotal === 0 && <circle cx="64" cy="64" r="52" fill="none" stroke="#e5e7eb" strokeWidth="18" />}
                    {donut.filter(s => s.v > 0).map((s, i) => {
                      const len = s.v / donutTotal * donutCirc; const el = <circle key={i} cx="64" cy="64" r="52" fill="none" stroke={s.c} strokeWidth="18" strokeDasharray={`${len} ${donutCirc - len}`} strokeDashoffset={-donutOff} transform="rotate(-90 64 64)" />; donutOff += len; return el;
                    })}
                    <text x="64" y="60" textAnchor="middle" style={{ font: '800 22px Inter', fill: '#0b1220' }}>{donutTotal}</text>
                    <text x="64" y="78" textAnchor="middle" style={{ font: '700 10px Inter', fill: '#6b7280' }}>imóveis</text>
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                    {donut.map(s => <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 700 }}><i style={{ width: 10, height: 10, borderRadius: 3, background: s.c, display: 'inline-block' }} />{s.l}<span className="if-mono" style={{ marginLeft: 'auto', color: 'var(--gray)' }}>{s.v}</span></div>)}
                  </div>
                </div>
              </div>
            </div>
            {(() => {
              const daysUntil = (d: string) => Math.ceil((new Date(d + 'T00:00:00').getTime() - Date.now()) / 86400000);
              const venc = leases.filter(l => l.active && l.endDate).map(l => ({ l, days: daysUntil(l.endDate) })).filter(v => v.days <= 45).sort((a, b) => a.days - b.days);
              return <div className="glass" style={{ marginTop: 18 }}>
                <div className="ph"><h3><span className="bar" />Contratos chegando ao termo</h3><span className="lbl">próximos 45 dias</span></div>
                <div>{venc.length === 0 ? <div className="emptyrow">Nenhum contrato vencendo nos próximos 45 dias</div> : venc.map(v => {
                  const p = props.find(x => x.id === v.l.propertyId); const t = tenants.find(x => x.id === v.l.tenantId);
                  return <div key={v.l.id} className="row" style={{ cursor: 'pointer' }} onClick={() => { setScreen('imoveis'); setDetailId(v.l.propertyId); }}>
                    <span className="ic bg-amb"><i className="fas fa-file-contract" /></span>
                    <div className="g"><div className="t">{p?.title || '—'} — {t?.name || '—'}</div><div className="s">Vence {fmtDate(v.l.endDate)}</div></div>
                    <span className={'pill ' + (v.days < 0 ? 'over' : 'warn')}>{v.days < 0 ? `vencido há ${-v.days}d` : `${v.days} dias`}</span>
                  </div>;
                })}</div>
              </div>;
            })()}
            {(() => {
              const scProps = repOwner ? props.filter(p => p.ownerId === repOwner) : props;
              const inad = leases.filter(l => l.active && scProps.some(p => p.id === l.propertyId)).map(l => {
                const pay = payments.find(x => x.leaseId === l.id && x.competencia === selMonth && (x.kind || 'rent') !== 'deposit');
                const paid = pay && pay.status === 'RECEIVED';
                const due = pay?.dueDate || `${selMonth}-${String(l.dueDay || 5).padStart(2, '0')}`;
                const dias = Math.floor((Date.now() - new Date(due + 'T00:00:00').getTime()) / 86400000);
                return { l, pay, paid, due, dias, valor: pay ? Number(pay.amount || 0) : Number(l.monthlyRent || 0) };
              }).filter(x => !x.paid && x.dias > 0).sort((a, b) => b.dias - a.dias);
              const inadTotal = inad.reduce((s, x) => s + x.valor, 0);
              return <div className="glass" style={{ marginTop: 18 }}>
                <div className="ph"><h3><span className="bar" style={{ background: 'var(--red)' }} />Inadimplência — {monthLabel(selMonth)}</h3><span className="lbl">{inad.length} em atraso · R$ {brl(inadTotal)}</span></div>
                <div>{inad.length === 0 ? <div className="emptyrow">Tudo em dia neste mês 🎉</div> : inad.map(x => {
                  const p = props.find(pp => pp.id === x.l.propertyId); const t = tenants.find(tt => tt.id === x.l.tenantId);
                  return <div key={x.l.id} className="row" style={{ cursor: 'pointer' }} onClick={() => setScreen('pagamentos')}>
                    <span className="ic bg-red"><i className="fas fa-triangle-exclamation" /></span>
                    <div className="g"><div className="t">{t?.name || '—'} — {p?.title || '—'}</div><div className="s">Venc. {fmtDate(x.due)} · {x.pay?.asaasPaymentId ? 'boleto gerado' : 'sem boleto'}</div></div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="if-mono" style={{ fontWeight: 600, fontSize: 13 }}>R$ {brl(x.valor)}</div>
                      <span className={'pill ' + (x.dias > 0 ? 'over' : 'warn')} style={{ marginTop: 3 }}>{x.dias > 0 ? `${x.dias}d atraso` : 'a vencer'}</span>
                    </div>
                  </div>;
                })}</div>
              </div>;
            })()}
          </>}

          {screen === 'imoveis' && (() => {
            if (detailId) {
              const p = props.find(x => x.id === detailId);
              if (!p) return <div className="back" onClick={() => setDetailId(null)}><i className="fas fa-chevron-left" /> Voltar</div>;
              const o = owners.find(x => x.id === p.ownerId);
              const lease = leases.find(l => l.propertyId === p.id && l.active);
              const tenant = lease ? tenants.find(t => t.id === lease.tenantId) : null;
              const docs = Array.isArray(p.documents) ? p.documents : [];
              const badge = p.status === 'maintenance' ? <span className="pill warn">Manutenção</span> : p.status === 'available' ? <span className="pill vac">Disponível</span> : <span className="pill ok">Alugado</span>;
              return <>
                <div className="back" onClick={() => setDetailId(null)}><i className="fas fa-chevron-left" /> Imóveis</div>
                {(() => {
                  const ativos = leases.filter(l => l.propertyId === p.id && l.active);
                  if (ativos.length < 2) return null;
                  return <div className="glass" style={{ marginBottom: 12, borderColor: 'var(--amber)', background: 'var(--amber-50)' }}>
                    <div className="ph" style={{ borderBottom: '1px solid var(--line)' }}><h3><span className="bar" style={{ background: 'var(--amber)' }} />⚠ Atenção: {ativos.length} contratos ativos neste imóvel</h3></div>
                    <div style={{ padding: '12px 18px 16px' }}>
                      <div style={{ fontSize: 12.5, color: 'var(--gray)', marginBottom: 12 }}>Este imóvel tem mais de um contrato ativo (provável duplicação). Confira e remova o contrato errado — as cobranças pendentes dele serão canceladas.</div>
                      {ativos.map(l => { const t = tenants.find(x => x.id === l.tenantId); const nPend = payments.filter(pp => pp.leaseId === l.id && pp.status !== 'RECEIVED').length; return <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid var(--line)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{t?.name || 'Inquilino'}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray)' }}>Início {fmtDate(l.startDate)} · R$ {brl(l.monthlyRent)}/mês · venc. dia {l.dueDay || '—'} · {nPend} cobrança(s) pendente(s)</div>
                        </div>
                        <button className="btn-g" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => removeLease(l)}><i className="fas fa-trash" /> Remover</button>
                      </div>; })}
                    </div>
                  </div>;
                })()}
                <div className="dh">
                  <div><div className="ttl">{p.title}</div><div style={{ color: 'var(--gray)', fontSize: 13, marginTop: 4 }}>{p.address || '—'} · {o?.name || 'Sem proprietário'}{tenant ? ' · ' + tenant.name : ''}</div></div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{badge}<button className="btn-g" onClick={() => openImovel(p)}><i className="fas fa-pen" /> Editar</button></div>
                </div>
                <div className="grid2">
                  <div className="glass">
                    <div className="ph"><h3><span className="bar" />Contrato</h3>{lease ? <span className="pill ok">Ativo</span> : <span className="pill vac">Sem contrato</span>}</div>
                    <div style={{ padding: '6px 18px 14px' }}>
                      {lease ? <>
                        <div className="fld"><span className="k">Inquilino</span><span className="v">{tenant?.name || '—'}</span></div>
                        <div className="fld"><span className="k">Aluguel</span><span className="v if-mono">R$ {brl(lease.monthlyRent)}</span></div>
                        <div className="fld"><span className="k">Início</span><span className="v if-mono">{fmtDate(lease.startDate)}</span></div>
                        <div className="fld"><span className="k">Término</span><span className="v if-mono">{fmtDate(lease.endDate)}</span></div>
                        <div className="fld"><span className="k">Reajuste</span><span className="v">{lease.readjustIndex || '—'}</span></div>
                        <div className="fld"><span className="k">Garantia</span><span className="v">{lease.guarantee || '—'}</span></div>
                        <div className="fld"><span className="k">Vencimento</span><span className="v if-mono">dia {lease.dueDay || '—'}</span></div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                          <button className="btn-g" onClick={() => openLease(lease)}><i className="fas fa-pen" /> Editar</button>
                          <button className="btn-g" onClick={() => openLease(lease, true)}><i className="fas fa-rotate" /> Renovar</button>
                          <button className="btn-g" style={{ color: 'var(--amber)', borderColor: '#f0d9b0' }} onClick={() => setExitLease(lease)}><i className="fas fa-file-circle-xmark" /> Encerrar</button>
                        </div>
                        {(() => {
                          const caucs = payments.filter(pp => pp.leaseId === lease.id && (pp.kind || '') === 'deposit');
                          if (!caucs.length) return null;
                          return <div style={{ marginTop: 14, borderTop: '1px solid var(--line2)', paddingTop: 12 }}>
                            <div className="lbl" style={{ marginBottom: 8 }}>Caução</div>
                            {caucs.map((c: any) => <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 6 }}>
                              <span className="if-mono" style={{ fontWeight: 700 }}>R$ {brl(c.amount)}</span>
                              {c.status === 'RECEIVED' ? <span className="pill ok">Recebido</span> : <span className="pill idg">Aguardando</span>}
                              {c.invoiceUrl && c.invoiceUrl !== '#' && <button className="act" title="Ver boleto" onClick={() => window.open(c.invoiceUrl, '_blank')}><i className="fas fa-eye" /></button>}
                              <button className="act danger" title="Excluir" onClick={() => excluirPagamento(c)}><i className="fas fa-trash" /></button>
                            </div>)}
                          </div>;
                        })()}
                      </> : <div style={{ padding: '14px 0', color: 'var(--gray)', fontSize: 13 }}>Nenhum contrato ativo. Use <b>Nova locação</b> na lista de imóveis para alugar.</div>}
                    </div>
                  </div>
                  <div className="glass">
                    <div className="ph"><h3><span className="bar" />Pasta Digital</h3><span className="lbl">{docs.length} arquivo(s)</span></div>
                    <div style={{ padding: '14px 18px 18px' }}>
                      {docs.map((d: any, i: number) => <div key={i} className="doc">
                        <span className="fi"><i className={'fas ' + (/\.(png|jpe?g|webp|gif)$/i.test(d.name) ? 'fa-image' : 'fa-file-lines')} /></span>
                        <div className="g"><div className="t">{d.name}</div><div className="s">{d.at ? fmtDate(d.at.slice(0, 10)) : ''}</div></div>
                        <button className="act" title="Abrir" onClick={() => openDoc(d.path)}><i className="fas fa-eye" /></button>
                        <button className="act danger" title="Remover" onClick={() => removeDoc(p.id, i)}><i className="fas fa-trash" /></button>
                      </div>)}
                      {docs.length === 0 && <div style={{ color: 'var(--faint)', fontSize: 12.5, fontWeight: 600, textAlign: 'center', padding: '8px 0 14px' }}>Nenhum documento ainda</div>}
                      <label className="dz" style={{ display: 'block' }}>
                        <i className="fas fa-cloud-arrow-up" /><div style={{ marginTop: 6 }}>{uploading ? 'Enviando...' : 'Clique para anexar (contrato, RG, CPF...)'}</div>
                        <input type="file" style={{ display: 'none' }} disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadDoc(p.id, f); (e.target as any).value = ''; }} />
                      </label>
                    </div>
                  </div>
                </div>
                <div className="glass" style={{ marginTop: 12 }}>
                  <div className="ph"><h3><span className="bar" />Histórico de status</h3><span className="lbl">{statusHist.filter(h => h.propertyId === p.id).length} registro(s)</span></div>
                  <div style={{ padding: '6px 18px 16px' }}>
                    {(() => {
                      const hs = statusHist.filter(h => h.propertyId === p.id).sort((a, b) => String(b.date).localeCompare(String(a.date)));
                      if (!hs.length) return <div style={{ color: 'var(--faint)', fontSize: 12.5, fontWeight: 500, padding: '8px 0' }}>Sem histórico ainda. A partir de agora, cada mudança de status fica registrada aqui.</div>;
                      const cor: any = { rented: 'var(--emerald)', available: 'var(--gray)', maintenance: 'var(--amber)' };
                      const nome: any = { rented: 'Alugado', available: 'Disponível', maintenance: 'Manutenção' };
                      return <div className="sthist">{hs.map((h, i) => <div key={i} className="r">
                        <span className="dot" style={{ background: cor[h.status] || 'var(--gray)' }} />
                        <div><div className="st">{nome[h.status] || h.status}</div>{h.reason && <div className="rs">{h.reason}</div>}<div className="dt">{fmtDate(String(h.date || '').slice(0, 10))}</div></div>
                      </div>)}</div>;
                    })()}
                  </div>
                </div>
              </>;
            }
            const list0 = props.filter(p => (!fImo.q || (p.title + ' ' + p.address).toLowerCase().includes(fImo.q.toLowerCase())) && (!fImo.type || p.type === fImo.type) && (!fImo.status || p.status === fImo.status) && (!fImo.owner || p.ownerId === fImo.owner));
            const list = [...list0].sort((a, b) => {
              if (sortImo === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
              if (sortImo === 'price-asc') return Number(a.price || 0) - Number(b.price || 0);
              if (sortImo === 'owner') return oName(a.ownerId).localeCompare(oName(b.ownerId));
              if (sortImo === 'status') return String(a.status).localeCompare(String(b.status));
              return String(a.title || '').localeCompare(String(b.title || ''));
            });
            return <>
              <div className="scrhead"><div className="ti">Imóveis <small>· {list.length} de {props.length}</small></div><div style={{ display: 'flex', gap: 8 }}><button className="btn-i" onClick={() => setWizOpen(true)}><i className="fas fa-file-signature" /> Nova locação</button><button className="btn-g" onClick={() => openImovel()}><i className="fas fa-plus" /> Novo imóvel</button></div></div>
              <div className="filters">
                <div className="fsearch"><i className="fas fa-search" /><input placeholder="Buscar por título ou endereço..." value={fImo.q} onChange={e => setFImo({ ...fImo, q: e.target.value })} /></div>
                <select value={fImo.type} onChange={e => setFImo({ ...fImo, type: e.target.value })}><option value="">Todos os tipos</option>{TIPOS.map(t => <option key={t}>{t}</option>)}</select>
                <select value={fImo.status} onChange={e => setFImo({ ...fImo, status: e.target.value })}><option value="">Todas as situações</option><option value="rented">Alugado</option><option value="available">Disponível</option><option value="maintenance">Manutenção</option></select>
                <select value={fImo.owner} onChange={e => setFImo({ ...fImo, owner: e.target.value })}><option value="">Todos os proprietários</option>{owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
                <select value={sortImo} onChange={e => setSortImo(e.target.value)}><option value="title">Ordenar: Título (A-Z)</option><option value="price-desc">Aluguel (maior)</option><option value="price-asc">Aluguel (menor)</option><option value="owner">Proprietário</option><option value="status">Situação</option></select>
              </div>
              {list.length === 0 ? <div className="glass emptyrow">Nenhum imóvel encontrado</div> :
                <div className="pgrid">{list.map(p => {
                  const off = p.status === 'maintenance';
                  const cov = off ? { bg: 'var(--amber-50)', c: 'var(--amber)' } : p.status === 'available' ? { bg: 'var(--line2)', c: 'var(--faint)' } : { bg: 'var(--indigo-50)', c: 'var(--indigo)' };
                  const badge = off ? <span className="badge pill warn">Manutenção</span> : p.status === 'available' ? <span className="badge pill vac">Disponível</span> : <span className="badge pill ok">Alugado</span>;
                  return <div key={p.id} className={'pcard glass' + (off ? ' off' : '')}>
                    <div className="cover" style={{ background: cov.bg, color: cov.c }}><i className={'fas ' + propIcon(p.type)} />{badge}</div>
                    <div className="body" onClick={() => setDetailId(p.id)}><div className="ttl">{p.title}</div><div className="addr">{p.address || '—'}</div><div className="meta"><div className="price if-mono">{brl(p.price)}<small>/mês</small></div><div className="own">{oName(p.ownerId).split(' ')[0]}</div></div></div>
                    <div className="acts"><button className="act" title="Editar" onClick={() => openImovel(p)}><i className="fas fa-pen" /></button><button className={'act' + (off ? ' ok' : '')} title={off ? 'Reativar' : 'Manutenção'} onClick={() => setMaintenance(p)}><i className={'fas ' + (off ? 'fa-rotate-left' : 'fa-screwdriver-wrench')} /></button><button className="act danger" title="Excluir" onClick={() => remove('properties', p.id, `o imóvel "${p.title}"`)}><i className="fas fa-trash" /></button></div>
                  </div>;
                })}</div>}
            </>;
          })()}

          {screen === 'proprietarios' && <>
            <div className="scrhead"><div className="ti">Proprietários <small>· fechamento do mês</small></div><button className="btn-g" onClick={() => openOwner()}><i className="fas fa-plus" /> Novo proprietário</button></div>
            <div className="note"><i className="fas fa-circle-info" /><span>Cada proprietário tem sua regra de comissão. No modo <b>abatida</b> a comissão sai antes do repasse; no modo <b>faturada</b> repassa o valor cheio e você cobra depois.</span></div>
            {owners.length === 0 ? <div className="glass emptyrow">Nenhum proprietário cadastrado</div> : <>
              <div className="filters"><select value={sortOwn} onChange={e => setSortOwn(e.target.value)}><option value="name">Ordenar: Nome (A-Z)</option><option value="repasse">Maior repasse</option><option value="recebido">Maior recebido</option></select></div>
              {[...owners].sort((a, b) => { if (sortOwn === 'repasse') return calcOwner(b, COMP).liquido - calcOwner(a, COMP).liquido; if (sortOwn === 'recebido') return calcOwner(b, COMP).recebido - calcOwner(a, COMP).recebido; return String(a.name || '').localeCompare(String(b.name || '')); }).map(o => {
              const c = calcOwner(o, COMP);
              return <div key={o.id} className="glass repcard">
                <div className="reph"><span className="av">{initials(o.name)}</span><div className="g"><div className="nm">{o.name}</div><div className="md">{c.names}</div></div>
                  {c.mode === 'deducted' ? <span className="pill ok">Abatida · {c.rate}%</span> : <span className="pill idg">Faturada · {c.rate}%</span>}
                  <div className="acts" style={{ marginLeft: 6 }}><button className="act" onClick={() => openOwner(o)}><i className="fas fa-pen" /></button><button className="act danger" onClick={() => remove('owners', o.id, o.name)}><i className="fas fa-trash" /></button></div>
                </div>
                <div className="repsum">
                  <div className="c"><div className="lbl">Total Recebido</div><div className="val if-mono">{brl(c.recebido)}</div></div>
                  <div className="c"><div className="lbl">Despesas</div><div className="val if-mono" style={{ color: c.desp > 0 ? 'var(--red)' : undefined }}>{brl(c.desp)}</div></div>
                  <div className="c"><div className="lbl">Taxa Adm {c.mode === 'invoiced' ? '(à parte)' : ''}</div><div className="val if-mono" style={{ color: c.mode === 'deducted' ? 'var(--amber)' : 'var(--indigo)' }}>{brl(c.taxa)}</div></div>
                  <div className="c"><div className="lbl">Líquido Repasse</div><div className="val if-mono" style={{ color: 'var(--emerald)' }}>{brl(c.liquido)}</div></div>
                </div>
                <div className="repfoot"><span className="lbl">{c.mode === 'invoiced' && c.taxa > 0 ? `Repassa cheio · cobra ${brl(c.taxa)} depois` : 'Repasse do mês'}</span><div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><span className="net if-mono">R$ {brl(c.liquido)}</span><button className="btn-i" onClick={() => notify('Repasse registrado ✓')}>Repassar</button></div></div>
              </div>;
            })}</>}
          </>}

          {screen === 'inquilinos' && (() => {
            const list0 = tenants.filter(t => !fInq || (t.name || '').toLowerCase().includes(fInq.toLowerCase()));
            const list = [...list0].sort((a, b) => {
              if (sortInq === 'name-desc') return String(b.name || '').localeCompare(String(a.name || ''));
              if (sortInq === 'contract') { const la = leases.find(l => l.tenantId === a.id && l.active); const lb = leases.find(l => l.tenantId === b.id && l.active); return String(la?.endDate || '9999').localeCompare(String(lb?.endDate || '9999')); }
              return String(a.name || '').localeCompare(String(b.name || ''));
            });
            return <>
              <div className="scrhead"><div className="ti">Inquilinos <small>· {tenants.length}</small></div><button className="btn-g" onClick={() => openTenant()}><i className="fas fa-plus" /> Novo inquilino</button></div>
              <div className="filters"><div className="fsearch"><i className="fas fa-search" /><input placeholder="Buscar inquilino..." value={fInq} onChange={e => setFInq(e.target.value)} /></div><select value={sortInq} onChange={e => setSortInq(e.target.value)}><option value="name">Ordenar: Nome (A-Z)</option><option value="name-desc">Nome (Z-A)</option><option value="contract">Contrato (vence antes)</option></select></div>
              <div className="glass tablewrap"><div className="tbl-scroll"><table>
                <thead><tr><th>Inquilino</th><th>Imóvel</th><th className="hidesm">Contrato até</th><th className="hidesm">Telefone</th><th style={{ textAlign: 'right' }}>Ações</th></tr></thead>
                <tbody>{list.length === 0 ? <tr><td colSpan={5} className="emptyrow">Nenhum inquilino</td></tr> : list.map(t => {
                  const lease = leases.find(l => l.tenantId === t.id && l.active);
                  const pr = lease ? (props.find(p => p.id === lease.propertyId)?.title || '—') : null;
                  return <tr key={t.id}>
                    <td className="t">{t.name}</td>
                    <td>{pr || <span className="pill vac">Sem contrato</span>}</td>
                    <td className="hidesm if-mono">{lease ? fmtDate(lease.endDate) : '—'}</td>
                    <td className="hidesm">{t.phone || '—'}</td>
                    <td><div className="acts" style={{ justifyContent: 'flex-end' }}><button className="act" onClick={() => openTenant(t)}><i className="fas fa-pen" /></button><button className="act danger" onClick={() => remove('tenants', t.id, t.name)}><i className="fas fa-trash" /></button></div></td>
                  </tr>;
                })}</tbody>
              </table></div></div>
            </>;
          })()}

          {screen === 'despesas' && (() => {
            const list0 = expenses.filter(e => (!fDesp.q || (e.description || '').toLowerCase().includes(fDesp.q.toLowerCase())) && (!fDesp.cat || e.category === fDesp.cat) && (!fDesp.owner || e.ownerId === fDesp.owner));
            const list = [...list0].sort((a, b) => {
              if (sortDesp === 'date-asc') return String(a.date || '').localeCompare(String(b.date || ''));
              if (sortDesp === 'amount-desc') return Number(b.amount || 0) - Number(a.amount || 0);
              if (sortDesp === 'owner') return oName(a.ownerId).localeCompare(oName(b.ownerId));
              return String(b.date || '').localeCompare(String(a.date || ''));
            });
            const tot = list.reduce((s, e) => s + Number(e.amount || 0), 0);
            return <>
              <div className="scrhead"><div className="ti">Despesas <small>· total R$ {brl(tot)}</small></div><button className="btn-g" onClick={() => openDespesa()}><i className="fas fa-plus" /> Nova despesa</button></div>
              <div className="note"><i className="fas fa-circle-info" /><span>As despesas lançadas aqui são <b>descontadas do repasse</b> do proprietário.</span></div>
              <div className="filters">
                <div className="fsearch"><i className="fas fa-search" /><input placeholder="Buscar descrição..." value={fDesp.q} onChange={e => setFDesp({ ...fDesp, q: e.target.value })} /></div>
                <select value={fDesp.cat} onChange={e => setFDesp({ ...fDesp, cat: e.target.value })}><option value="">Todas as categorias</option>{CATS.map(c => <option key={c}>{c}</option>)}</select>
                <select value={fDesp.owner} onChange={e => setFDesp({ ...fDesp, owner: e.target.value })}><option value="">Todos os proprietários</option>{owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
                <select value={sortDesp} onChange={e => setSortDesp(e.target.value)}><option value="date-desc">Ordenar: Data (recente)</option><option value="date-asc">Data (antiga)</option><option value="amount-desc">Maior valor</option><option value="owner">Proprietário</option></select>
              </div>
              <div className="glass tablewrap"><div className="tbl-scroll"><table>
                <thead><tr><th>Data</th><th>Proprietário</th><th className="hidesm">Categoria</th><th>Descrição</th><th>Valor</th><th style={{ textAlign: 'right' }}>Ações</th></tr></thead>
                <tbody>{list.length === 0 ? <tr><td colSpan={6} className="emptyrow">Nenhuma despesa</td></tr> : list.map(e => <tr key={e.id}>
                  <td className="if-mono">{fmtDate(e.date)}</td><td className="t">{oName(e.ownerId)}</td><td className="hidesm">{e.category}</td><td>{e.description || '—'}</td>
                  <td className="if-mono" style={{ color: 'var(--red)', fontWeight: 700 }}>{brl(e.amount)}</td>
                  <td><div className="acts" style={{ justifyContent: 'flex-end' }}><button className="act" onClick={() => openDespesa(e)}><i className="fas fa-pen" /></button><button className="act danger" onClick={() => remove('expenses', e.id, 'esta despesa')}><i className="fas fa-trash" /></button></div></td>
                </tr>)}</tbody>
              </table></div></div>
            </>;
          })()}

          {screen === 'pagamentos' && (() => {
            const activeLeases = leases.filter(l => l.active);
            const pendentes = activeLeases.filter(l => { const pay = payments.find(x => x.leaseId === l.id && x.competencia === mesPend && (x.kind || 'rent') !== 'deposit'); return !(pay && pay.status === 'RECEIVED'); });
            const pendentesView = pendentes.filter(l => { if (!fPend) return true; const t = tenants.find(x => x.id === l.tenantId); const pr = props.find(x => x.id === l.propertyId); return ((t?.name || '') + ' ' + (pr?.title || '')).toLowerCase().includes(fPend.toLowerCase()); }).sort((a, b) => {
              if (sortPend === 'property') return String(props.find(x => x.id === a.propertyId)?.title || '').localeCompare(String(props.find(x => x.id === b.propertyId)?.title || ''));
              if (sortPend === 'rent-desc') return Number(b.monthlyRent || 0) - Number(a.monthlyRent || 0);
              if (sortPend === 'due') return Number(a.dueDay || 5) - Number(b.dueDay || 5);
              return String(tenants.find(x => x.id === a.tenantId)?.name || '').localeCompare(String(tenants.find(x => x.id === b.tenantId)?.name || ''));
            });
            const recebidoMes = payments.filter(p => p.competencia === mesPend && p.status === 'RECEIVED' && (p.kind || 'rent') !== 'deposit').reduce((s, p) => s + Number(p.amount || 0), 0);
            const previstoMes = activeLeases.reduce((s, l) => s + Number(l.monthlyRent || 0), 0);
            return <>
              <div className="scrhead"><div className="ti">Pagamentos <small>· {COMP_LABEL}</small></div></div>
              <div className="kpis kpis3">
                <div className="kpi glass"><div className="lbl">Recebido</div><div className="v if-mono" style={{ color: 'var(--emerald)' }}>{brl(recebidoMes)}</div></div>
                <div className="kpi glass"><div className="lbl">A receber</div><div className="v if-mono" style={{ color: 'var(--amber)' }}>{brl(previstoMes - recebidoMes)}</div></div>
                <div className="kpi glass"><div className="lbl">Previsto</div><div className="v if-mono">{brl(previstoMes)}</div></div>
              </div>
              <div className="note"><i className="fas fa-circle-info" /><span>Aqui ficam só as cobranças <b>pendentes</b> do mês — quando o inquilino paga, ela some daqui e aparece em <b>Todos os lançamentos</b> (mais abaixo). As cobranças são geradas automaticamente todo dia 1º. O boleto inclui a taxa Asaas de R$ 2,00.</span></div>
              <div className="filters">
                <div className="fsearch"><i className="fas fa-search" /><input placeholder="Buscar por inquilino ou imóvel..." value={fPend} onChange={e => setFPend(e.target.value)} /></div>
                <select value={mesPend} onChange={e => setMesPend(e.target.value)}>{MONTH_OPTIONS.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}</select>
                <select value={sortPend} onChange={e => setSortPend(e.target.value)}><option value="tenant">Ordenar: Inquilino (A-Z)</option><option value="property">Imóvel (A-Z)</option><option value="rent-desc">Maior aluguel</option><option value="due">Dia de vencimento</option></select>
              </div>
              <div className="glass tablewrap"><div className="tbl-scroll"><table className="mstack">
                <thead><tr><th>Inquilino</th><th>Imóvel</th><th>Aluguel</th><th className="hidesm">Boleto (c/ taxa)</th><th className="hidesm">Vencimento</th><th>Status</th><th style={{ textAlign: 'right' }}>Ação</th></tr></thead>
                <tbody>{pendentesView.length === 0 ? <tr><td colSpan={7} className="emptyrow">{pendentes.length === 0 ? 'Nenhuma cobrança pendente neste mês 🎉' : 'Nada encontrado com esse filtro'}</td></tr> : pendentesView.map(l => {
                  const t = tenants.find(x => x.id === l.tenantId); const p = props.find(x => x.id === l.propertyId);
                  const pay = payments.find(x => x.leaseId === l.id && x.competencia === mesPend && (x.kind || 'rent') !== 'deposit');
                  const received = pay?.status === 'RECEIVED';
                  const hasBoleto = !!(pay && pay.asaasPaymentId);
                  const valor = pay ? Number(pay.amount || 0) : Number(l.monthlyRent || 0);
                  const venc = pay?.dueDate ? Number(String(pay.dueDate).slice(8, 10)) : (l.dueDay || 5);
                  const stPill = received ? <span className="pill ok">Recebido</span> : hasBoleto ? <span className="pill idg">Aguardando</span> : <span className="pill warn">Pendente</span>;
                  return <tr key={l.id} className={openCard[l.id] ? 'open' : ''}>
                    <td className="cardhead" onClick={() => setOpenCard(o => ({ ...o, [l.id]: !o[l.id] }))}><div className="chi"><span className="chn">{t?.name || '—'}</span><span className="chv if-mono">R$ {brl(valor)}</span></div><div className="chr">{stPill}<i className="fas fa-chevron-down chev" /></div></td>
                    <td className="t dhide" data-label="Inquilino">{t?.name || '—'}</td><td className="det" data-label="Imóvel">{p?.title || '—'}</td><td className="if-mono dhide" data-label="Aluguel">R$ {brl(valor)}</td>
                    <td className="if-mono det" data-label="Boleto (c/ taxa)" style={{ color: 'var(--gray)' }}>R$ {brl(valor + BOLETO_FEE)}</td>
                    <td className="if-mono det" data-label="Vencimento">dia {venc}</td>
                    <td className="dhide" data-label="Status">{stPill}</td>
                    <td className="actcell" data-label="Ação" style={{ textAlign: 'right' }}>
                      <div className="acts" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {received ? <button className="btn-g" onClick={() => desfazerPag(pay)}>Desfazer</button>
                          : hasBoleto ? <>
                            {pay.invoiceUrl && pay.invoiceUrl !== '#' && <button className="btn-g" onClick={() => window.open(pay.invoiceUrl, '_blank')}>Ver boleto</button>}
                            <button className="btn-i" onClick={() => confirmarPag(pay)}>Marcar recebido</button>
                          </>
                            : <>
                              <button className="act" title="Editar valor / vencimento" onClick={() => openPendEdit(l, pay)}><i className="fas fa-pen" /></button>
                              <button className="btn-i" onClick={() => gerarCobranca(l)}>Gerar boleto</button>
                              <button className="btn-g" onClick={() => pay ? confirmarPag(pay) : markPayment(l, null)}>Marcar recebido</button>
                            </>}
                        {pay && <button className="act danger" title="Excluir" onClick={() => excluirPagamento(pay)}><i className="fas fa-trash" /></button>}
                      </div>
                    </td>
                  </tr>;
                })}</tbody>
              </table></div></div>
              <div className="scrhead" style={{ marginTop: 26 }}><div className="ti">Todos os lançamentos <small>· {payments.length}</small></div></div>
              <div className="filters">
                <div className="fsearch"><i className="fas fa-search" /><input placeholder="Buscar por inquilino ou imóvel..." value={fPag} onChange={e => setFPag(e.target.value)} /></div>
                <select value={mesPag} onChange={e => setMesPag(e.target.value)}><option value="">Todos os meses</option>{MONTH_OPTIONS.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}</select>
                <select value={sortPag} onChange={e => setSortPag(e.target.value)}><option value="comp">Ordenar: Competência (recente)</option><option value="tenant">Inquilino (A-Z)</option><option value="amount">Maior valor</option><option value="status">Status</option></select>
              </div>
              {mesPag && (() => {
                const doMes = payments.filter(p => p.competencia === mesPag && (p.kind || 'rent') !== 'deposit');
                const pagos = doMes.filter(p => p.status === 'RECEIVED');
                const abertos = doMes.filter(p => p.status !== 'RECEIVED');
                const totRec = pagos.reduce((s, p) => s + Number(p.amount || 0), 0);
                const totAb = abertos.reduce((s, p) => s + Number(p.amount || 0), 0);
                return <div className="glass" style={{ padding: '14px 18px', marginBottom: 14, display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5 }}>{monthLabel(mesPag)}</div>
                  <div style={{ fontSize: 13 }}><span className="pill ok">{pagos.length} pagos</span> <span className="if-mono" style={{ color: 'var(--gray)' }}>R$ {brl(totRec)}</span></div>
                  <div style={{ fontSize: 13 }}><span className="pill warn">{abertos.length} em aberto</span> <span className="if-mono" style={{ color: 'var(--gray)' }}>R$ {brl(totAb)}</span></div>
                </div>;
              })()}
              <div className="glass tablewrap"><div className="tbl-scroll"><table className="mstack">
                <thead><tr><th>Competência</th><th>Inquilino</th><th className="hidesm">Imóvel</th><th>Tipo</th><th>Valor</th><th>Status</th><th style={{ textAlign: 'right' }}>Ações</th></tr></thead>
                <tbody>{(() => {
                  const allPays = payments.filter(p => { if (mesPag && p.competencia !== mesPag) return false; if (!fPag) return true; const t = tenants.find(x => x.id === p.tenantId); const pr = props.find(x => x.id === p.propertyId); return ((t?.name || '') + ' ' + (pr?.title || '')).toLowerCase().includes(fPag.toLowerCase()); }).sort((a, b) => {
                    if (sortPag === 'tenant') return String(tenants.find(x => x.id === a.tenantId)?.name || '').localeCompare(String(tenants.find(x => x.id === b.tenantId)?.name || ''));
                    if (sortPag === 'amount') return Number(b.amount || 0) - Number(a.amount || 0);
                    if (sortPag === 'status') return String(a.status || '').localeCompare(String(b.status || ''));
                    return String(b.competencia || '').localeCompare(String(a.competencia || '')) || String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
                  });
                  if (allPays.length === 0) return <tr><td colSpan={7} className="emptyrow">Nenhum lançamento</td></tr>;
                  return allPays.map(p => {
                  const t = tenants.find(x => x.id === p.tenantId); const pr = props.find(x => x.id === p.propertyId);
                  const stPill2 = p.status === 'RECEIVED' ? <span className="pill ok">Recebido</span> : p.status === 'OVERDUE' ? <span className="pill over">Vencido</span> : <span className="pill warn">Pendente</span>;
                  return <tr key={p.id} className={openCard[p.id] ? 'open' : ''}>
                    <td className="cardhead" onClick={() => setOpenCard(o => ({ ...o, [p.id]: !o[p.id] }))}><div className="chi"><span className="chn">{t?.name || '—'}</span><span className="chv if-mono">R$ {brl(p.amount)}{Number(p.juros || 0) > 0 ? ' · +juros' : ''}</span></div><div className="chr">{stPill2}<i className="fas fa-chevron-down chev" /></div></td>
                    <td className="if-mono det" data-label="Competência">{p.competencia || '—'}</td>
                    <td className="t dhide" data-label="Inquilino">{t?.name || '—'}</td>
                    <td className="det" data-label="Imóvel">{pr?.title || '—'}</td>
                    <td className="det" data-label="Tipo">{(p.kind === 'deposit') ? 'Caução' : 'Aluguel'}</td>
                    <td className="if-mono det" data-label="Valor">R$ {brl(p.amount)}{Number(p.juros || 0) > 0 && <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600 }}> · inclui R$ {brl(p.juros)} juros</span>}</td>
                    <td className="dhide" data-label="Status">{stPill2}</td>
                    <td className="actcell" data-label="Ações"><div className="acts" style={{ justifyContent: 'flex-end' }}>
                      {p.invoiceUrl && p.invoiceUrl !== '#' && <button className="act" title="Ver boleto" onClick={() => window.open(p.invoiceUrl, '_blank')}><i className="fas fa-eye" /></button>}
                      <button className="act danger" title="Excluir" onClick={() => excluirPagamento(p)}><i className="fas fa-trash" /></button>
                    </div></td>
                  </tr>;
                }); })()}</tbody>
              </table></div></div>
            </>;
          })()}

          {screen === 'vagas' && (() => {
            const carCap = vagas.filter(v => v.tipo === 'carro' || v.tipo === 'ambos').length;
            const motoCap = vagas.filter(v => v.tipo === 'moto' || v.tipo === 'ambos').length;
            const carsOcc = vagas.filter(v => v.carro && (v.carro.propertyId || v.carro.placa)).length;
            const motosOcc = vagas.filter(v => v.moto && (v.moto.propertyId || v.moto.placa)).length;
            const livres = vagas.filter(v => !(v.carro && (v.carro.propertyId || v.carro.placa)) && !(v.moto && (v.moto.propertyId || v.moto.placa))).length;
            const apLabel = (pid: string) => { const p = props.find(x => x.id === pid); if (!p) return ''; const t = tenants.find(x => x.active !== false && x.id === (leases.find(l => l.propertyId === p.id && l.active)?.tenantId)); return p.title + (t ? ' · ' + t.name : ''); };
            const veic = (o: any) => [o?.marca, o?.modelo].filter(Boolean).join(' ');
            const bar = (occ: number, cap: number, full: boolean) => <div className="vbar"><div style={{ width: (cap ? Math.min(100, occ / cap * 100) : 0) + '%', background: full ? 'var(--red)' : 'var(--indigo)' }} /></div>;
            return <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <button className="btn-i" onClick={() => setVagaEdit({ label: 'Vaga ' + (vagas.length + 1), tipo: 'carro', carro: {}, moto: {} })}><i className="fas fa-plus" /> Nova vaga</button>
              </div>
              <div className="kpis" style={{ marginBottom: 18 }}>
                <div className="kpi glass"><div className="lbl"><i className="fas fa-car" style={{ marginRight: 6, color: 'var(--indigo)' }} />Carros</div><div className="v">{carsOcc}<span style={{ fontSize: 15, color: 'var(--faint)', fontWeight: 500 }}>/{carCap}</span> {carCap > 0 && carsOcc >= carCap && <span className="pill over" style={{ marginLeft: 6 }}>Lotado</span>}</div>{bar(carsOcc, carCap, carCap > 0 && carsOcc >= carCap)}</div>
                <div className="kpi glass"><div className="lbl"><i className="fas fa-motorcycle" style={{ marginRight: 6, color: 'var(--indigo)' }} />Motos</div><div className="v">{motosOcc}<span style={{ fontSize: 15, color: 'var(--faint)', fontWeight: 500 }}>/{motoCap}</span> {motoCap > 0 && motosOcc >= motoCap && <span className="pill over" style={{ marginLeft: 6 }}>Lotado</span>}</div>{bar(motosOcc, motoCap, motoCap > 0 && motosOcc >= motoCap)}</div>
                <div className="kpi glass"><div className="lbl">Vagas livres</div><div className="v" style={{ color: livres > 0 ? 'var(--indigo)' : 'var(--ink)' }}>{livres}<span style={{ fontSize: 15, color: 'var(--faint)', fontWeight: 500 }}>/{vagas.length}</span></div>{bar(vagas.length - livres, vagas.length, false)}</div>
              </div>
              {vagas.length === 0 ? <div className="glass" style={{ padding: 40, textAlign: 'center', color: 'var(--gray)' }}>Nenhuma vaga cadastrada ainda. Clique em <b>Nova vaga</b> para começar.</div> : <div className="vgrid">
                {[...vagas].sort((a, b) => String(a.label).localeCompare(String(b.label), 'pt', { numeric: true })).map(v => {
                  const cOcc = v.carro && (v.carro.propertyId || v.carro.placa), mOcc = v.moto && (v.moto.propertyId || v.moto.placa);
                  const ocupada = cOcc || mOcc;
                  return <div key={v.id} className={'vspot glass' + (ocupada ? ' occ' : ' free')} onClick={() => setVagaEdit({ ...v, carro: v.carro || {}, moto: v.moto || {} })}>
                    <div className="vhd"><span className="vnm">{(v.tipo === 'moto') ? <i className="fas fa-motorcycle" /> : <i className="fas fa-car" />}{v.tipo === 'ambos' && <i className="fas fa-motorcycle" style={{ marginLeft: 2 }} />} {v.label}</span>{ocupada ? <span className="pill ok">Ocupada</span> : <span className="pill vac">Livre</span>}</div>
                    {!ocupada && <div className="vempty">Toque para ocupar</div>}
                    {cOcc && <div className="vveh"><div className="vap"><i className="fas fa-car" /> {apLabel(v.carro.propertyId) || 'Carro'}</div><div className="vsub">{veic(v.carro)}{v.carro.placa && <span className="vplaca">{v.carro.placa}</span>}</div></div>}
                    {mOcc && <div className="vveh"><div className="vap"><i className="fas fa-motorcycle" /> {apLabel(v.moto.propertyId) || 'Moto'}</div><div className="vsub">{veic(v.moto)}{v.moto.placa && <span className="vplaca">{v.moto.placa}</span>}</div></div>}
                  </div>;
                })}
              </div>}
            </>;
          })()}

          {screen === 'relatorios' && <>
            <div className="scrhead"><div className="ti">Relatório de fechamento <small>· para enviar ao proprietário</small></div></div>
            <div className="filters">
              <select value={repOwner || owners[0]?.id || ''} onChange={e => setRepOwner(e.target.value)}>{owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
              <select value={selMonth} onChange={e => setSelMonth(e.target.value)}>{MONTH_OPTIONS.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}</select>
            </div>
            {(() => {
              const o = owners.find(x => x.id === (repOwner || owners[0]?.id)); if (!o) return <div className="glass emptyrow">Cadastre um proprietário primeiro</div>;
              const closing = closings.find(cl => cl.ownerId === o.id && cl.month === selMonth);
              const live = calcOwner(o, selMonth);
              const c = closing || live;
              const recPays = payments.filter(p => p.ownerId === o.id && recMonthOf(p) === selMonth && p.status === 'RECEIVED' && (p.kind || 'rent') !== 'deposit').sort((a, b) => String(props.find(x => x.id === a.propertyId)?.title || '').localeCompare(String(props.find(x => x.id === b.propertyId)?.title || '')));
              const exps = expenses.filter(e => e.ownerId === o.id && String(e.date || '').slice(0, 7) === selMonth).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
              const totalFee = recPays.reduce((s, p) => s + Number(p.asaasFee || 0), 0);
              const chargesM = payments.filter(p => p.ownerId === o.id && p.competencia === selMonth && (p.kind || 'rent') !== 'deposit');
              const diasP = (p: any) => Math.floor((Date.now() - new Date((p.dueDate || `${selMonth}-05`) + 'T00:00:00').getTime()) / 86400000);
              const cVenc = chargesM.filter(p => p.status !== 'RECEIVED' && diasP(p) > 0);
              const inadO = cVenc.map(p => ({ p, dias: diasP(p), valor: Number(p.amount || 0) })).sort((a, b) => b.dias - a.dias);
              const inadTotalO = inadO.reduce((s, x) => s + x.valor, 0);
              const propsO = props.filter(p => p.ownerId === o.id);
              const imoAlug = propsO.filter(p => rentedInMonth(p.id, selMonth)).length;
              const imoManut = propsO.filter(p => !rentedInMonth(p.id, selMonth) && statusInMonth(p.id, selMonth) === 'maintenance').length;
              const imoDisp = propsO.length - imoAlug - imoManut;
              return <>
                <div className="exd-scroll">
                  <div id="extrato-doc" className="exd">
                    <div className="exd-pad">
                      <div className="exd-head">
                        <div>
                          <div className="exd-brand"><div className="exd-mk">◆</div><div className="exd-nm">Imobi<span>Flow</span></div></div>
                          <div className="exd-tag">Gestão de locações · Repasse ao proprietário</div>
                        </div>
                        <div className="exd-meta">
                          <div className="exd-big">Extrato de Repasse</div>
                          Competência: <b>{monthLabel(selMonth)}</b><br />
                          Emitido em: <b>{fmtDate(new Date().toISOString().slice(0, 10))}</b>
                        </div>
                      </div>
                      <div className="exd-owner">
                        <div>
                          <div className="exd-lbl">Proprietário</div>
                          <div className="exd-nm2">{o.name}</div>
                          <div className="exd-sub">{o.phone || ''} · comissão {c.rate}% ({c.mode === 'deducted' ? 'abatida' : 'faturada'})</div>
                        </div>
                        {o.pixKey && <div className="exd-pix"><div className="exd-lbl">Chave PIX</div><div className="exd-pixv">{o.pixKey}</div></div>}
                      </div>
                      <div className="exd-lbl" style={{ marginBottom: 8 }}>Portfólio de imóveis <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: '#98a1ad' }}>· {monthLabel(selMonth)}</span></div>
                      <div className="exd-port">
                        <div className="exd-pcell"><div><div className="exd-pn">{propsO.length}</div><div className="exd-pk">Total de imóveis</div></div></div>
                        <div className="exd-pcell"><span className="exd-pdot" style={{ background: '#0d9488' }} /><div><div className="exd-pn">{imoAlug}</div><div className="exd-pk">Alugados</div></div></div>
                        <div className="exd-pcell"><span className="exd-pdot" style={{ background: '#98a1ad' }} /><div><div className="exd-pn">{imoDisp}</div><div className="exd-pk">Disponíveis</div></div></div>
                        <div className="exd-pcell"><span className="exd-pdot" style={{ background: '#c2820a' }} /><div><div className="exd-pn">{imoManut}</div><div className="exd-pk">Em manutenção</div></div></div>
                      </div>
                      <div className="exd-totes">
                        <div className="exd-tote"><div className="exd-k">Recebido</div><div className="exd-n teal">R$ {brl(c.recebido)}</div></div>
                        <div className="exd-tote"><div className="exd-k">Despesas</div><div className="exd-n rose">R$ {brl(c.desp)}</div></div>
                        <div className="exd-tote"><div className="exd-k">Comissão {c.rate}%</div><div className="exd-n">R$ {brl(c.taxa)}</div></div>
                        <div className="exd-tote"><div className="exd-k">Líquido</div><div className="exd-n">R$ {brl(c.liquido)}</div></div>
                      </div>
                      <div className="exd-sec">
                        <div className="exd-sech"><span className="exd-bar" /><h3>Aluguéis recebidos</h3><span className="exd-ct">{recPays.length} recebimento(s)</span></div>
                        <table className="exd-tbl">
                          <thead><tr><th>Imóvel</th><th>Inquilino</th><th>Recebido em</th><th className="r">Valor</th></tr></thead>
                          <tbody>
                            {recPays.length ? recPays.map(pay => { const pr = props.find(x => x.id === pay.propertyId); const t = tenants.find(x => x.id === pay.tenantId); return <tr key={pay.id}><td><div className="exd-im">{pr?.title || 'Aluguel'}</div></td><td className="exd-iq">{t?.name || '—'}</td><td className="exd-iq">{fmtDate(String(pay.receivedAt || pay.dueDate || '').slice(0, 10))}{Number(pay.juros || 0) > 0 ? ` · inclui R$ ${brl(pay.juros)} juros` : ''}</td><td className="exd-num r">R$ {brl(pay.amount)}</td></tr>; }) : <tr><td colSpan={4} className="exd-empty">Nenhum recebimento neste mês</td></tr>}
                            {recPays.length > 0 && <tr className="exd-sub"><td colSpan={3}><span className="exd-lb">Subtotal recebido</span></td><td className="exd-num r">R$ {brl(c.recebido)}</td></tr>}
                          </tbody>
                        </table>
                      </div>
                      <div className="exd-sec">
                        <div className="exd-sech"><span className="exd-bar rose" /><h3>Despesas</h3><span className="exd-ct">{exps.length} lançamento(s)</span></div>
                        <table className="exd-tbl">
                          <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th className="r">Valor</th></tr></thead>
                          <tbody>
                            {exps.length ? exps.map(e => <tr key={e.id}><td className="exd-iq">{fmtDate(e.date)}</td><td className="exd-im">{e.description || '—'}</td><td className="exd-iq">{e.category || '—'}</td><td className="exd-num r">R$ {brl(e.amount)}</td></tr>) : <tr><td colSpan={4} className="exd-empty">Sem despesas neste mês</td></tr>}
                            {exps.length > 0 && <tr className="exd-sub"><td colSpan={3}><span className="exd-lb">Subtotal despesas</span></td><td className="exd-num r">R$ {brl(c.desp)}</td></tr>}
                          </tbody>
                        </table>
                      </div>
                      <div className="exd-calc">
                        <div className="exd-crow">Total recebido <b>R$ {brl(c.recebido)}</b></div>
                        <div className="exd-crow minus">(−) Despesas <b>− R$ {brl(c.desp)}</b></div>
                        {c.mode === 'deducted'
                          ? <div className="exd-crow minus">(−) Comissão ({c.rate}%) <b>− R$ {brl(c.taxa)}</b></div>
                          : <div className="exd-crow">Comissão ({c.rate}%) — não abatida <b>R$ {brl(c.taxa)}</b></div>}
                        <div className="exd-net"><span className="exd-nt">Líquido a repassar</span><span className="exd-na">R$ {brl(c.liquido)}</span></div>
                        {c.mode !== 'deducted' && <div className="exd-obs"><b>Observação:</b> a comissão de R$ {brl(c.taxa)} ({c.rate}%) é <b>apenas informativa</b> e <b>não está sendo descontada</b> deste repasse (faturada à parte).</div>}
                      </div>
                      {inadO.length > 0 && <div className="exd-sec" style={{ marginTop: 24 }}>
                        <div className="exd-sech"><span className="exd-bar rose" /><h3>Inadimplência — em atraso neste mês</h3><span className="exd-ct">{inadO.length} vencido(s) não pago(s)</span></div>
                        <table className="exd-tbl">
                          <thead><tr><th>Inquilino</th><th>Imóvel</th><th>Vencimento</th><th>Atraso</th><th className="r">Valor</th></tr></thead>
                          <tbody>
                            {inadO.map(x => { const pr = props.find(p => p.id === x.p.propertyId); const t = tenants.find(tt => tt.id === x.p.tenantId); return <tr key={x.p.id}><td className="exd-im">{t?.name || '—'}</td><td className="exd-iq">{pr?.title || '—'}</td><td className="exd-iq">{fmtDate(String(x.p.dueDate || '').slice(0, 10))}</td><td className="exd-iq">{x.dias} dias</td><td className="exd-num r">R$ {brl(x.valor)}</td></tr>; })}
                            <tr className="exd-sub"><td colSpan={4}><span className="exd-lb">Total em atraso</span></td><td className="exd-num r">R$ {brl(inadTotalO)}</td></tr>
                          </tbody>
                        </table>
                      </div>}
                      <div className="exd-foot">
                        {totalFee > 0 && <>Os boletos incluíram R$ {brl(totalFee)} de taxa Asaas (R$ 2,00 por boleto), paga pelo inquilino — não afeta o repasse.<br /></>}
                        Documento gerado pelo ImobiFlow em {fmtDate(new Date().toISOString().slice(0, 10))} · imobiflow.net.br
                        {closing && <><br />Mês fechado em {fmtDate(String(closing.closedAt).slice(0, 10))} — valores congelados.</>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="acts" style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <button className="btn-i" onClick={() => exportarPDF(o, selMonth)}><i className="fas fa-file-arrow-down" /> Exportar PDF</button>
                  {closing
                    ? <button className="btn-g" onClick={() => reabrirMes(closing)}><i className="fas fa-lock-open" /> Reabrir mês</button>
                    : <button className="btn-g" onClick={() => fecharMes(o, selMonth, live)}><i className="fas fa-lock" /> Fechar mês</button>}
                  {closing && <span className="pill ok"><i className="fas fa-lock" /> Fechado</span>}
                </div>
              </>;
            })()}
          </>}

        </div>
      </main>

      {/* mobile nav */}
      <nav className="mob">
        {nav('dashboard', 'fa-chart-pie', 'Início')}{nav('imoveis', 'fa-house', 'Imóveis')}{nav('pagamentos', 'fa-credit-card', 'Cobranças')}{nav('vagas', 'fa-square-parking', 'Vagas')}{nav('proprietarios', 'fa-right-left', 'Repasse')}
      </nav>

      {/* form modal */}
      {form && <div className="ov" onClick={e => { if ((e.target as any).className === 'ov') setForm(null); }}>
        <div className="modal">
          <div className="mh"><h3><i className={'fas ' + form.icon} /> {form.title}</h3></div>
          <div className="mb">
            {(() => {
              const renderField = (fld: any) => (
                <div className="field-g" style={{ marginTop: 0, flex: 1 }} key={fld.k}>
                  <label className="lbl">{fld.l}</label>
                  {fld.t === 'select'
                    ? <select className="inp" value={form.values[fld.k] ?? ''} onChange={e => setV(fld.k, e.target.value)}>{fld.o.map((op: any) => <option key={op[0]} value={op[0]}>{op[1]}</option>)}</select>
                    : <input className="inp" type={fld.t} value={form.values[fld.k] ?? ''} onChange={e => setV(fld.k, e.target.value)} />}
                </div>
              );
              const rows: any[] = []; const flds = form.fields;
              for (let i = 0; i < flds.length;) {
                if (flds[i].half && flds[i + 1]?.half) { rows.push(<div key={i} style={{ display: 'flex', gap: 12, marginTop: 14 }}>{renderField(flds[i])}{renderField(flds[i + 1])}</div>); i += 2; }
                else { rows.push(<div key={i} style={{ marginTop: 14 }}>{renderField(flds[i])}</div>); i += 1; }
              }
              return rows;
            })()}
          </div>
          <div className="mf"><button className="cancel" onClick={() => setForm(null)}>Cancelar</button><button className="confirm" onClick={save}>Salvar</button></div>
        </div>
      </div>}

      {wizOpen && <Wizard properties={props} tenants={tenants} owners={owners} onClose={() => setWizOpen(false)} onDone={efetivarLocacao} />}

      {exitLease && <EncerrarModal lease={exitLease} property={props.find(p => p.id === exitLease.propertyId)} tenant={tenants.find(t => t.id === exitLease.tenantId)} onClose={() => setExitLease(null)} onConfirm={(payload) => encerrarContrato(exitLease, payload)} />}

      {statusEdit && <div className="ov" onClick={() => setStatusEdit(null)}>
        <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
          <div className="mh"><h3><i className="fas fa-screwdriver-wrench" /> Alterar status</h3><p>{statusEdit.property?.title} · registrar no histórico</p></div>
          <div className="mb">
            <div className="fg"><label>Novo status</label>
              <div className="seg">
                {[['available', 'Disponível'], ['maintenance', 'Manutenção'], ['rented', 'Alugado']].map(([v, lab]) => (
                  <button key={v} type="button" className={'segopt' + (statusEdit.status === v ? ' on' : '')} onClick={() => setStatusEdit({ ...statusEdit, status: v })}>{lab}</button>
                ))}
              </div>
            </div>
            <div className="fg"><label>Data da mudança</label><input className="inp" type="date" value={statusEdit.date} onChange={e => setStatusEdit({ ...statusEdit, date: e.target.value })} /></div>
            <div className="fg"><label>Motivo <span style={{ color: 'var(--faint)', fontWeight: 400 }}>(opcional)</span></label><textarea className="inp" style={{ height: 70, resize: 'none' }} placeholder="Ex.: vazamento no banheiro, reforma, resolvido..." value={statusEdit.reason} onChange={e => setStatusEdit({ ...statusEdit, reason: e.target.value })} /></div>
          </div>
          <div className="mf"><button className="cancel" onClick={() => setStatusEdit(null)}>Cancelar</button><button className="confirm" onClick={salvarStatus}>Salvar</button></div>
        </div>
      </div>}

      {vagaEdit && <div className="ov" onClick={() => setVagaEdit(null)}>
        <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
          <div className="mh"><h3><i className="fas fa-square-parking" /> {vagaEdit.id ? 'Editar vaga' : 'Nova vaga'}</h3><p>Ocupação e veículos</p></div>
          <div className="mb">
            <div className="row2">
              <div className="fg"><label>Nome / número</label><input className="inp" value={vagaEdit.label} onChange={e => setVagaEdit({ ...vagaEdit, label: e.target.value })} placeholder="Ex.: Vaga 1" /></div>
              <div className="fg"><label>Tipo da vaga</label>
                <div className="seg">{[['carro', 'Carro'], ['moto', 'Moto'], ['ambos', 'Carro + Moto']].map(([v, lab]) => <button key={v} type="button" className={'segopt' + (vagaEdit.tipo === v ? ' on' : '')} onClick={() => setVagaEdit({ ...vagaEdit, tipo: v })}>{lab}</button>)}</div>
              </div>
            </div>
            {(vagaEdit.tipo === 'carro' || vagaEdit.tipo === 'ambos') && (() => {
              const c = vagaEdit.carro || {}; const setC = (patch: any) => setVagaEdit({ ...vagaEdit, carro: { ...c, ...patch } });
              return <div className="vsec"><div className="vsechd"><span><i className="fas fa-car" /> Carro</span><button type="button" className="vclear" onClick={() => setVagaEdit({ ...vagaEdit, carro: {} })}>Liberar</button></div>
                <div className="fg"><label>Apartamento / cliente</label><select className="inp" value={c.propertyId || ''} onChange={e => setC({ propertyId: e.target.value })}><option value="">— livre —</option>{[...props].sort((a, b) => String(a.title).localeCompare(String(b.title))).map(p => { const t = tenants.find(x => x.id === (leases.find(l => l.propertyId === p.id && l.active)?.tenantId)); return <option key={p.id} value={p.id}>{p.title}{t ? ' — ' + t.name : ''}</option>; })}</select></div>
                <div className="row3"><div className="fg"><label>Marca</label><input className="inp" value={c.marca || ''} onChange={e => setC({ marca: e.target.value })} /></div><div className="fg"><label>Modelo</label><input className="inp" value={c.modelo || ''} onChange={e => setC({ modelo: e.target.value })} /></div><div className="fg"><label>Placa</label><input className="inp" style={{ textTransform: 'uppercase' }} value={c.placa || ''} onChange={e => setC({ placa: e.target.value })} /></div></div>
              </div>;
            })()}
            {(vagaEdit.tipo === 'moto' || vagaEdit.tipo === 'ambos') && (() => {
              const m = vagaEdit.moto || {}; const setM = (patch: any) => setVagaEdit({ ...vagaEdit, moto: { ...m, ...patch } });
              return <div className="vsec"><div className="vsechd"><span><i className="fas fa-motorcycle" /> Moto</span><button type="button" className="vclear" onClick={() => setVagaEdit({ ...vagaEdit, moto: {} })}>Liberar</button></div>
                <div className="fg"><label>Apartamento / cliente</label><select className="inp" value={m.propertyId || ''} onChange={e => setM({ propertyId: e.target.value })}><option value="">— livre —</option>{[...props].sort((a, b) => String(a.title).localeCompare(String(b.title))).map(p => { const t = tenants.find(x => x.id === (leases.find(l => l.propertyId === p.id && l.active)?.tenantId)); return <option key={p.id} value={p.id}>{p.title}{t ? ' — ' + t.name : ''}</option>; })}</select></div>
                <div className="row3"><div className="fg"><label>Marca</label><input className="inp" value={m.marca || ''} onChange={e => setM({ marca: e.target.value })} /></div><div className="fg"><label>Modelo</label><input className="inp" value={m.modelo || ''} onChange={e => setM({ modelo: e.target.value })} /></div><div className="fg"><label>Placa</label><input className="inp" style={{ textTransform: 'uppercase' }} value={m.placa || ''} onChange={e => setM({ placa: e.target.value })} /></div></div>
              </div>;
            })()}
          </div>
          <div className="mf">
            <div style={{ display: 'flex', gap: 8 }}>{vagaEdit.id && <button className="cancel" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => { const v = vagaEdit; setVagaEdit(null); excluirVaga(v); }}>Excluir</button>}<button className="cancel" onClick={() => setVagaEdit(null)}>Cancelar</button></div>
            <button className="confirm" onClick={salvarVaga}>Salvar</button>
          </div>
        </div>
      </div>}

      {pendEdit && <div className="ov" onClick={() => setPendEdit(null)}>
        <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
          <div className="mh"><h3><i className="fas fa-pen" /> Editar título pendente</h3><p>Antes de gerar o boleto</p></div>
          <div className="mb">
            <div className="field-g" style={{ marginTop: 0 }}><label className="lbl">Valor do aluguel (R$)</label><input className="inp" type="number" value={pendEdit.amount} onChange={e => setPendEdit({ ...pendEdit, amount: e.target.value })} placeholder="Ex: 800" /></div>
            <div className="field-g"><label className="lbl">Vencimento</label><input className="inp" type="date" value={pendEdit.dueDate} onChange={e => setPendEdit({ ...pendEdit, dueDate: e.target.value })} /></div>
            <div className="note" style={{ marginTop: 16, marginBottom: 0 }}><i className="fas fa-circle-info" /><span>O boleto sairá com este valor + R$ 2,00 de taxa. Só é possível editar enquanto o boleto não foi gerado.</span></div>
          </div>
          <div className="mf"><button className="cancel" onClick={() => setPendEdit(null)}>Cancelar</button><button className="confirm" onClick={savePendEdit}>Salvar</button></div>
        </div>
      </div>}
      {toast && <div className="toast"><i className="fas fa-check-circle" />{toast}</div>}
    </div>
  );
};

export default App;
