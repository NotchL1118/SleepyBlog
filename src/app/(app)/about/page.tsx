import { Metadata } from "next";
import AboutContent from "./components/AboutContent";

export const metadata: Metadata = {
  title: "👋不一样的烟火",
};

export default function About() {
  return <AboutContent />;
}
