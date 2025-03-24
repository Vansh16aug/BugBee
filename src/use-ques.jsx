import { useState } from "react";

export default function useMail() {
  const [ques, setQues] = useState({
    selected: 1,
  });

  return [ques];
}
