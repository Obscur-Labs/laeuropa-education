import "./(site)/site.css";
import { EuStars } from "@/components/ui";

export const metadata = { title: "Page not found | LA Europa Education", robots: { index: false } };

export default function NotFound() {
  return (
    <section className="section notfound">
      <div className="container">
        <EuStars size={220} className="eu-stars spin-slow" />
        <p className="eyebrow">Error 404</p>
        <h1>Looks like this flight <em>got diverted</em></h1>
        <p>The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
        <div className="btn-row center">
          <a href="/" className="btn btn-blue">Back to home</a>
          <a href="/contact" className="btn btn-outline">Contact us</a>
        </div>
      </div>
    </section>
  );
}
