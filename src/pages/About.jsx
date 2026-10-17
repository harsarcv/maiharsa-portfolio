import { useEffect, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, Camera, Box } from "lucide-react";
import { Link } from "react-router-dom";
import SiteLayout from "../components/SiteLayout";
import { getExperiences } from "../api";

const skillGroups = [
  { icon: Box, title: "3D Art & Design", tools: "Blender · SketchUp", skills: "Environment & object modeling, UV unwrapping, texturing, spatial layout" },
  { icon: Camera, title: "Video Production", tools: "Premiere Pro · After Effects · CapCut", skills: "Directing, storyboarding, editing, color grading, sound design" },
  { icon: BriefcaseBusiness, title: "Photography & Editing", tools: "Lightroom · Photoshop", skills: "Portrait, event, street photography, composition, cosplay retouching" },
];
export default function About() {
  const [experiences, setExperiences] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { let alive = true; getExperiences().then((data) => alive && setExperiences(data)).catch((e) => alive && setError(e.message)).finally(() => alive && setLoading(false)); return () => { alive = false; }; }, []);
  return <SiteLayout pageClass="content-page"><main className="page-main section-shell">
    <div className="page-eyebrow">ABOUT ME · THE PERSON BEHIND THE WORK</div><h1 className="page-title">Curious by default.<br/><span className="text-accent">Creative by practice.</span></h1>
    <div className="about-page-intro"><p className="page-lead">Saya Maiharsa Muara, mahasiswa Informatika yang tertarik menggabungkan teknologi dengan visual storytelling—mulai dari 3D art, filmmaking, fotografi, hingga produk digital.</p><p>Saya menikmati proses belajar, bereksperimen, dan mengubah ide menjadi karya yang memiliki tujuan. Setiap disiplin memberi cara berbeda untuk memecahkan masalah dan menyampaikan cerita.</p></div>
    <section className="page-section"><div className="section-heading"><div><span className="section-kicker">SKILL SET</span><h2>Tools & disciplines.</h2></div></div><div className="skill-grid">{skillGroups.map(({icon: Icon,title,tools,skills})=><article className="skill-card" key={title}><Icon size={25}/><h3>{title}</h3><p className="skill-tools">{tools}</p><p>{skills}</p></article>)}</div></section>
    <section className="page-section"><span className="section-kicker">EXPERIENCE & ORGANIZATION</span><h2>Learning through making.</h2>{loading ? <p className="state-message">Memuat pengalaman…</p> : error ? <p className="state-message" role="alert">Data pengalaman belum dapat dimuat: {error}</p> : experiences.length ? <div className="timeline">{experiences.map((item,i)=><article className="timeline-item" key={`${item.organization}-${item.role_title}-${i}`}><div className="timeline-dot"/><div className="timeline-meta">{item.period || ""} {item.exp_type ? `· ${item.exp_type}` : ""}</div><h3>{item.role_title} <span>— {item.organization}</span></h3><p>{item.description}</p>{Array.isArray(item.highlights) && item.highlights.length > 0 && <ul>{item.highlights.map((h,j)=><li key={j}>{h}</li>)}</ul>}</article>)}</div> : <p className="state-message">Data pengalaman belum tersedia. Tambahkan data yang sudah terverifikasi ke tabel experiences.</p>}</section>
    <div className="page-cta"><div><span className="section-kicker">HAVE A PROJECT IN MIND?</span><h2>Let&apos;s create something meaningful.</h2></div><Link className="button-primary" to="/contact">Get in touch <ArrowUpRight size={17}/></Link></div>
  </main></SiteLayout>;
}
