import { useEffect, useState } from "react";
import { ArrowUpRight, Play } from "lucide-react";
import SiteLayout from "../components/SiteLayout";
import { getProjects } from "../api";

function videoEmbed(url) {
  if (!url) return "";

  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id =
        u.searchParams.get("v") ||
        u.pathname.split("/").filter(Boolean).pop();

      return id
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : "";
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean).pop();

      return id ? `https://player.vimeo.com/video/${id}` : "";
    }

    if (host === "instagram.com" || host === "instagr.am") {
      const parts = u.pathname.split("/").filter(Boolean);

      if (["reel", "reels", "p", "tv"].includes(parts[0]) && parts[1]) {
        return `https://www.instagram.com/${parts[0]}/${parts[1]}/embed/`;
      }
    }
  } catch {
    return "";
  }

  return "";
}

export default function GalleryFilm() {
 const [items,setItems]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{let alive=true;getProjects().then(d=>alive&&setItems(d.filter(p=>/film|video|filmmaking|aftermovie|motion/i.test(`${p.main_category||""} ${p.sub_category||""}`)||p.video_embed_url))).catch(e=>alive&&setError(e.message)).finally(()=>alive&&setLoading(false));return()=>{alive=false}},[]);
 return <SiteLayout pageClass="content-page"><main className="page-main section-shell"><div className="page-eyebrow">SELECTED WORKS · 02</div><h1 className="page-title">Moving images.<br/><span className="text-accent">Stories in motion.</span></h1><p className="page-lead">Film, aftermovie, and video projects—each piece tells a story through direction, editing, and rhythm.</p>{loading?<p className="state-message">Memuat video…</p>:error?<p className="state-message" role="alert">Video belum dapat dimuat: {error}</p>:items.length?<div className="media-grid">{items.map(p=>{const embed=videoEmbed(p.video_embed_url);return <article className="media-card" key={p.id||p.slug}><div className="media-frame">{embed?<iframe src={embed} title={p.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/>:p.thumbnail_url?<img src={p.thumbnail_url} alt={p.title} loading="lazy"/>:<div className="media-placeholder"><Play size={30}/><span>Video link belum tersedia</span></div>}</div><div className="media-card-body"><div className="media-meta">{p.project_year||""} {p.sub_category?`· ${p.sub_category}`:""}</div><h2>{p.title}</h2><p>{p.description||""}</p><p className="media-role">{p.role||""}{Array.isArray(p.tools)&&p.tools.length?` · ${p.tools.join(", ")}`:""}</p>{embed&&<a className="text-link" href={p.video_embed_url} target="_blank" rel="noreferrer">Watch on platform <ArrowUpRight size={16}/></a>}</div></article>})}</div>:<div className="empty-panel"><Play size={26}/><h2>Video projects will appear here.</h2><p>Tambahkan data proyek filmmaking beserta video_embed_url YouTube/Vimeo di database. Tidak ada karya contoh yang dibuat-buat.</p></div>}</main></SiteLayout>;
}
