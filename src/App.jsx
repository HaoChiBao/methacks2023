import { useState } from 'react';
import './App.css';
import { VideoRoom } from './components/VideoRoom';

window.onload = function () {
  const script0 = document.createElement("script");
  const script1 = document.createElement("script");
  const script2 = document.createElement("script");
  const script3 = document.createElement("script");

  script0.src =
      "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
  script1.src =
      "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js";
  script2.src =
      "https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js";
  script3.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";

  script0.async = true;
  script1.async = true;
  script2.async = true;
  script3.async = true;

  script0.crossOrigin = "anonymous";
  script1.crossOrigin = "anonymous";
  script2.crossOrigin = "anonymous";
  script3.crossOrigin = "anonymous";

  document.body.appendChild(script0);
  document.body.appendChild(script1);
  document.body.appendChild(script2);
  document.body.appendChild(script3);
};

function App() {
  const [joined, setJoined] = useState(false);
  return (
    <div className="App">
      <h1>Cum Call</h1>

      {!joined && (
        <button onClick={() => setJoined(true)}>
          Join Room
        </button>
      )}

      {joined && <VideoRoom />}
    </div>
  );
}

export default App;
