import { Metadata } from "next";
import Daily from "./components/Daily";
import Goal from "./components/Goal";
import Info from "./components/Info";
import Location from "./components/Location";
import MySelf from "./components/MySelf";
import TechnologyStack from "./components/TechnologyStack";

export const metadata: Metadata = {
  title: "👋不一样的烟火",
};

export default function About() {
  return (
    <div>
      <div className="avoidHeader flex w-full flex-col items-center gap-5">
        <Info />
        <div className="flex w-[80%] flex-col items-center gap-3 lg:w-[1250px]">
          <MySelf />
          <div className="flex w-full flex-row gap-6">
            <div className="w-3/5">
              <Goal />
            </div>
            <div className="flex-1">
              <TechnologyStack />
            </div>
          </div>
          <div className="flex w-full flex-row gap-6">
            <div className="flex-1">
              <Daily />
            </div>
            <div className="w-3/5">
              <Location />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
