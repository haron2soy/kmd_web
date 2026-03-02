import {Navbar} from "./Navbar";
import { Header } from "./Header";
import { Footer } from "./Footer";
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}