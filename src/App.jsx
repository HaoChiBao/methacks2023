import { useState } from 'react';
import './App.css';
import { VideoRoom } from './components/VideoRoom';

import myImage from './components/images/background2.jpg';

import title from './components/images/title/main.gif';

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

      <div className="wallpaper">
        <img src = {myImage}/>
      </div>

      {!joined && (
        <div className="title">
          <button onClick={() => setJoined(true)}>
            {/* <h1>PAPER ORCHESTRA</h1> */}
            <img src={title} alt="" />
          </button>
        </div>
      )}

      {joined && <VideoRoom />}
    </div>
  );
}

export default App;
