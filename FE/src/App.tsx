import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [prot, setProt] = useState("http");
  const [state, setState] = useState();
  const [errMessage, setErrMessage] = useState("");
  const wsRef = useRef<WebSocket>(null);

  const callCalculator = async (path: string) => {
    setErrMessage("");
    try {
      const res = await fetch(`http://localhost:3000/${path}`, {
        method: "POST",
      });
      if (res.status !== 200) {
        setErrMessage(res.statusText);
        return;
      }
      const data = await res.json();
      setState(data.state);
    } catch (e: any) {
      console.error(e);
      setErrMessage(e.message);
    }
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/");
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        setState(data.state);
      } catch (e: any) {
        console.error(e);
        setErrMessage(e.message);
      }
    };
    wsRef.current = ws;
    return () => {
      ws.readyState === WebSocket.OPEN && ws.close();
    };
  }, []);

  const incHandler = () => {
    prot === "http" && callCalculator("inc");
    prot === "ws" && wsRef.current?.send("inc");
  };

  const decHandler = () => {
    prot === "http" && callCalculator("dec");
    prot === "ws" && wsRef.current?.send("dec");
  };

  return (
    <>
      <h1>Calculator</h1>
      <div className="card">
        <p>
          <select
            name="prot"
            value={prot}
            onChange={(e) => setProt(e.target.value)}
          >
            <option value="http">HTTP</option>
            <option value="ws">WebSocket</option>
          </select>
        </p>
        <button onClick={incHandler}>inc</button>
        <button onClick={decHandler}>dec</button>
        {typeof state === "number" && <p>{state}</p>}
        {errMessage && <p>{errMessage}</p>}
      </div>
    </>
  );
}

export default App;
