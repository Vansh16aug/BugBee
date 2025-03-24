import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import { Ques } from "@/components/Ques/ques";

export default function QuesPage() {
  const [defaultLayout, setDefaultLayout] = useState(undefined);
  const [defaultCollapsed, setDefaultCollapsed] = useState(undefined);

  useEffect(() => {
    const layout = Cookies.get("react-resizable-panels:layout");
    const collapsed = Cookies.get("react-resizable-panels:collapsed");

    const parseJSON = (value) => {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        return undefined;
      }
    };

    setDefaultLayout(layout ? parseJSON(layout) : undefined);
    setDefaultCollapsed(collapsed ? parseJSON(collapsed) : undefined);

    document.body.classList.add("no-scroll");

    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  return (
    <>
      <div className="flex-col flex h-screen overflow-hidden">
        <Ques
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  );
}
