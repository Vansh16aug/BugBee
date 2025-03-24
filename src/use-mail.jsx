import { useState } from "react";

export default function useMail() {
  const [mail, setMail] = useState({
    selected: 1,
  });

  return [mail];
}
