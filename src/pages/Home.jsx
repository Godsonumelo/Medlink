import Hero from "../components/home/Hero";
import Stats from "../components/home/Stats";
import TopDoctors from "../components/home/TopDoctors";
import DownloadApp from "../components/home/DownloadApp";

export default function Home() {
  return (
    <div className="gradient-landing">
      <Hero />
      <Stats />
      <TopDoctors />
      <DownloadApp />
    </div>
  );
}
