import { Metadata } from "next";
import Info from "./components/Info";

export const metadata: Metadata = {
  title: "👋不一样的烟火哈哈",
};

export default function About() {
  return (
    <div>
      <div className="avoidHeader w-full">
        <Info />
      </div>
    </div>
  );
}
