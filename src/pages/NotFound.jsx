import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SiteLayout from "../components/SiteLayout";
export default function NotFound(){return <SiteLayout pageClass="content-page"><main className="page-main section-shell not-found"><span className="page-eyebrow">404 · PAGE NOT FOUND</span><h1 className="page-title">Looks like this<br/><span className="text-accent">page wandered off.</span></h1><p className="page-lead">Halaman yang kamu cari tidak ditemukan atau alamatnya sudah berubah.</p><Link className="button-primary" to="/"><ArrowLeft size={17}/> Back to home</Link></main></SiteLayout>}
