const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

const text = document.getElementsByClassName('text')[0];

videoElement.style.transform = 'scaleX(-1)';
canvasElement.style.transform = 'scaleX(-1)';

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
      // if (results.multiHandLandmarks) {
      if (results.multiHandLandmarks.length != 0) {
        // point 4: Thumb tip
        // point 8: Index finger tip
        // point 12: Middle finger tip
        // point 16: Ring finger tip
        // point 20: Pinky finger tip
            let ams = 0
            for (const landmarks of results.multiHandLandmarks) {
              const thumb = landmarks[4]
              const index = landmarks[8]
              const middle = landmarks[12]
              const ring = landmarks[16]
              const pinky = landmarks[20]
              // console.log(thumb, index, middle, ring, pinky)
              // console.log(landmarks)
              // console.log(HAND_CONNECTIONS)
              drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: 'blue', lineWidth: 5});
              drawLandmarks(canvasCtx, landmarks, {color: 'red', lineWidth: 2});
            }
  }
  canvasCtx.restore();
}

function getRelativeContext(percents, context) {
  return {
    x: percents.x * parseInt(context.canvas.width),
    y: percents.y * parseInt(context.canvas.height),
    z: percents.z
  }
}

const hands = new Hands({locateFile: (file) => {
  console.log(file, 'file')
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({image: videoElement});
    // console.log(videoElement)
  },
  width: videoElement.width,
  height: videoElement.height
});
camera.start();