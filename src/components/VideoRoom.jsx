import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { VideoPlayer } from './VideoPlayer';

import { Hands } from '@mediapipe/hands/hands';
import {drawLandmarks} from '@mediapipe/drawing_utils/drawing_utils';
import {drawConnectors} from '@mediapipe/drawing_utils/drawing_utils';
import {Camera} from '@mediapipe/camera_utils/camera_utils'

// import * as Tone from 'tone';

import videoButton from './images/buttons/video.gif';
import audioButton from './images/buttons/microphone.gif';
import exitButton from './images/buttons/exit.gif';

import "./buttonsBar.css"

const APP_ID = 'fd724da3607e4f568c1775a94077234d';
const TOKEN =
  '007eJxTYLj61nPdTMZkY7ZVB9YG7Q16lx4Y4X75xty7niWtbA5rLvkoMKSlmBuZpCQamxmYp5qkmZpZJBuam5smWpoYmJsbGZukfFUPT2kIZGT4wnyHmZEBAkF8FobcxMw8BgYAbgEfoA==';
const CHANNEL = 'main';

const client = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8',
});



const importAll = (r) => r.keys().map(r);

const pianoNotes = importAll(require.context('./tunes/piano/notes', false, /\.(wav)$/));
const snareNote = importAll(require.context('./tunes/snare', false, /\.(mp3)$/));
const maracasNote = importAll(require.context('./tunes/maracas', false, /\.(mp3)$/));

console.log(pianoNotes)
console.log(snareNote)
console.log(maracasNote)

const playMaracas = () => {
  let audio = new Audio(maracasNote[1]);
  audio.play();
}

const playSnare = () => {
  let audio = new Audio(snareNote[0]);
  audio.play();
}

const playNote = (note, duration) => {
  // console.log(1)
  let audio = new Audio(pianoNotes[note]);
  audio.play();
}

const whiteKeys = [
  {'note': 0, 'color': 'white'},
  {'note': 1, 'color': 'white'},
  {'note': 2, 'color': 'white'},
  {'note': 3, 'color': 'white'},
  {'note': 4, 'color': 'white'},
  {'note': 5, 'color': 'white'},
  {'note': 6, 'color': 'white'},
  {'note': 7, 'color': 'white'},
  {'note': 8, 'color': 'white'},
  {'note': 9, 'color': 'white'}
]



// write whiteKeys in reverse order
whiteKeys.reverse();

const blackKeys = [
  'C#4', 'D#4', 'F#4', 'G#4', 'A#4', 'C#5', 'D#5'
];

function isCoordinateInRect(x, y, rect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
}

function getAngle(x1, y1, x2, y2) {
  return Math.atan2(y1-y2, x1-x2) * 180 / Math.PI;
}

export const VideoRoom = () => {
  
  const [pianoState, setPianoState] = useState(false) // true if piano is on
  const [drumState, setDrumState] = useState(false) // true if drum is on
  const [maracasState, setMaracasState] = useState(true) // true if maracas is on

  const [snareState, setSnareState] = useState(false) // true if snare is on
  
  useEffect(() => {

    const video = document.querySelector('.client-video')
    console.log(11111, video)

    function onResults(results){
  
      const canvasElement = document.querySelector(`.client-canvas`);
  
      canvasElement.width = video.videoWidth;
      canvasElement.height = video.videoHeight;
  
      if(canvasElement != null){
        const canvasCtx = canvasElement.getContext('2d');
        
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        canvasCtx.translate(canvasElement.width, 0);
        canvasCtx.scale(-1, 1);
        
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        
        
        // if (results.multiHandLandmarks) {
        if (results.multiHandLandmarks.length != 0) {
          // point 4: Thumb tip
          // point 8: Index finger tip
          // point 12: Middle finger tip
          // point 16: Ring finger tip
          // point 20: Pinky finger tip
          
          const HAND_CONNECTIONS = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
          ]
  
          for (const landmarks of results.multiHandLandmarks) {
            const thumb = landmarks[4]
            const index = landmarks[8]
            const middle = landmarks[12]
            const ring = landmarks[16]
            const pinky = landmarks[20]

            
            // =-=-=-=-=-==-=- Instrument =-=-=-=-=-=-=-=-=
            
            // piano
            if (pianoState){
              // Set the starting point and width of the line
              const startX = 0; // Starting x-coordinate
              const startY = 400; // Starting y-coordinate
              
              // Set the line color and thickness
              canvasCtx.strokeStyle = 'black'; // Line color
              canvasCtx.lineWidth = 2; // Line thickness
              
              // Begin the path
              canvasCtx.beginPath();
              
              // Move to the starting point
              canvasCtx.moveTo(startX, startY);
              
              // Draw the horizontal line
              canvasCtx.lineTo(canvasElement.width, startY);
              
              
              // draw piano keys white
              const numKeys = 10;
              const keyWidth = canvasElement.width / numKeys;
              const keyHeight = 100;
              let pressedKey = -1;

              for (let i = 0; i < numKeys; i++) {
                const x = i * keyWidth;
                
                // fill in piano key
                // whiteKeys[i].color = 'white';

                const rect = {
                  left: x,
                  right: x + keyWidth,
                  top: 400,
                  bottom: 400 + keyHeight
                }

                try{

                  if(thumb.y * canvasElement.height > startY){
                    if(isCoordinateInRect(thumb.x * canvasElement.width, thumb.y * canvasElement.height, rect)){

                      pressedKey = i;
                      whiteKeys[i].color = 'red';

                      playNote(whiteKeys[i].note, '64n')
                    } else if (whiteKeys[i].color == 'red' || pressedKey == i){
                      whiteKeys[i].color = 'white';
                    }
                  }
                  if(index.y * canvasElement.height > startY){
                    if(isCoordinateInRect(index.x * canvasElement.width, index.y * canvasElement.height, rect)){

                      pressedKey = i;
                      whiteKeys[i].color = 'red';

                      playNote(whiteKeys[i].note, '64n')
                    }else if (whiteKeys[i].color == 'red' || pressedKey == i){
                      whiteKeys[i].color = 'white';
                    }
                  }
                  if(middle.y * canvasElement.height > startY){
                    if(isCoordinateInRect(middle.x * canvasElement.width, middle.y * canvasElement.height, rect)){

                      pressedKey = i;
                      whiteKeys[i].color = 'red';

                      playNote(whiteKeys[i].note, '64n')
                    }else if (whiteKeys[i].color == 'red' || pressedKey == i){
                      whiteKeys[i].color = 'white';
                    }
                  }
                  if(ring.y * canvasElement.height > startY){
                    if(isCoordinateInRect(ring.x * canvasElement.width, ring.y * canvasElement.height, rect)){

                      pressedKey = i;
                      whiteKeys[i].color = 'red';

                      playNote(whiteKeys[i].note, '64n')
                    }else if (whiteKeys[i].color == 'red' || pressedKey == i){
                      whiteKeys[i].color = 'white';
                    }
                  }
                  if(pinky.y * canvasElement.height > startY){
                    if(isCoordinateInRect(pinky.x * canvasElement.width, pinky.y * canvasElement.height, rect)){

                      pressedKey = i;
                      whiteKeys[i].color = 'red';

                      playNote(whiteKeys[i].note, '64n')
                    }else if (whiteKeys[i].color == 'red' || pressedKey == i){
                      whiteKeys[i].color = 'white';
                    }
                  }
                  

                  
                } catch(e) {
                  console.log(e)
                }

                canvasCtx.fillStyle = whiteKeys[i].color;
                canvasCtx.fillRect(x, 400, keyWidth, keyHeight);
                
                canvasCtx.strokeStyle = 'black';
                canvasCtx.lineWidth = 2;
                canvasCtx.strokeRect(x, 400, keyWidth, keyHeight);
                
              }
              
              // black keys
              const blackKeys = [1, 2, 4, 5, 6, 8, 9];
              const blackKeyWidth = keyWidth / 2;
              const blackKeyHeight = 60;

              for (let i = 0; i < numKeys; i++) {
                if (blackKeys.includes(i % numKeys)) {
                  const x = i * keyWidth - blackKeyWidth / 2;
                  canvasCtx.fillStyle = 'black';
                  canvasCtx.fillRect(x, 400, blackKeyWidth, blackKeyHeight);
                }
              }
              
            }

            // snare
            if (snareState){
              // console.log(getDistance(thumb.x, thumb.y, pinky.x, pinky.y))
              if (getDistance(thumb.x, thumb.y, pinky.x, pinky.y) < 0.045){
                playSnare();
                // playMaracas();
              }
              
            }

            if (maracasState){
              const indexConnect = landmarks[5]
              const middleConnect = landmarks[9]

              const indexAngle = getAngle(indexConnect.x, indexConnect.y, index.x, index.y)
              const middleAngle = getAngle(middleConnect.x, middleConnect.y, middle.x, middle.y)

              if(indexAngle > 80 && indexAngle < 100 && middleAngle > 80 && middleAngle < 100){
                playMaracas();
              }
              
            }

            // // Stroke the path (draw the line)
            // canvasCtx.stroke();
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#B9FAF8', lineWidth: 5});
            drawLandmarks(canvasCtx, landmarks, {color: '#A663CC', lineWidth: 2});
          }
        }

        canvasCtx.restore();
      }
    }
  
  
    const hands = new Hands({locateFile: (file) => {
      // console.log(file)
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 0, 
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    hands.onResults(onResults);
  
    console.log('local')
    const camera = new Camera(video, {
      onFrame: async () => {
        // console.log(1)
        await hands.send({image: video});
      },
      // width: video.videoWidth,
      // height: video.videoHeight
    });
    camera.start();

  }, [])

  const [users, setUsers] = useState([]);
  const [localTracks, setLocalTracks] = useState([]);

  const handleUserJoined = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    if (mediaType === 'video') {
      setUsers((previousUsers) => [...previousUsers, user]);
    }

    if (mediaType === 'audio') {
      user.audioTrack.play()
    }
  };

  const handleUserLeft = (user) => {
    setUsers((previousUsers) =>
      previousUsers.filter((u) => u.uid !== user.uid)
    );
  };

  let temp = null
  let tracks = [0,0]
  tracks[0] = AgoraRTC.createMicrophoneAudioTrack();
  
  useEffect(() => {
    client.on('user-published', handleUserJoined);
    client.on('user-left', handleUserLeft);
    
    
    const video = document.querySelector('.client-canvas');
    const stream = video.captureStream();
    var videoTracks = stream.getVideoTracks();
    tracks[1] = AgoraRTC.createCustomVideoTrack({
      mediaStreamTrack: videoTracks[0],
    });

    client
      .join(APP_ID, CHANNEL, TOKEN, null)
      .then((uid) =>
        Promise.all([
          tracks[0],
          tracks[1],
          uid,
        ])
      )
      .then(([audioT, videoT, uid]) => {
        const [audioTrack, videoTrack] = [audioT, videoT];
        setLocalTracks(tracks);
        setUsers((previousUsers) => [
          ...previousUsers,
          {
            uid,
            videoTrack,
            audioTrack,
          },
        ]);
        client.publish([audioT, videoT]);
        temp = [audioT, videoT];
        // console.log(temp, 'temp')
      });

    return () => {
      for (let localTrack of localTracks) {
        localTrack.stop();
        localTrack.close();
      }
      client.off("user-published", handleUserJoined);
      client.off("user-left", handleUserLeft);
      client.unpublish(temp).then(() => client.leave());
    };
  }, []);

  // const [videoIcon, setVideoIcon] = useState('https://www.svgrepo.com/show/310197/video.svg')
  //   const [audioIcon, setAudioIcon] = useState('https://www.svgrepo.com/show/309778/mic-on.svg')
  //   const [exitIcon, setExitIcon] = useState('https://www.svgrepo.com/show/309378/call-outbound.svg')
  const [videoIcon, setVideoIcon] = useState(videoButton)
    const [audioIcon, setAudioIcon] = useState(audioButton)
    const [exitIcon, setExitIcon] = useState(exitButton)

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 50vw)',
        }}
      >
          <video style = {{position: "absolute", opacity: "0"}} className = "client-video"></video>
        <canvas className="client-canvas" width="200" height="200" style = {{position: "absolute", pointerEvents:"none",transform: "scaleX(-1)",opacity: "0"}}></canvas>
        {users.map((user) => (
          <VideoPlayer key={user.uid} user={user} />
        ))}

      </div>
      
          {/* buttons bar */}
          <div className="buttonsBar">
            <button
            onClick={() => {
              try{
                console.log(localTracks[0])
                  const videoTrack = localTracks[1];
                  videoTrack.setEnabled(!videoTrack.enabled);
                  if(videoTrack.enabled){
                      setVideoIcon('https://www.svgrepo.com/show/310199/video-off.svg')
                  } else {
                      setVideoIcon(videoButton)
                  }
              }catch(e){
                console.log(e)
              }
            }}
            >
                <img src = {videoIcon}/>
            </button>
            <button
            onClick={() => {
                try{
                  const audioTrack = localTracks[0];
                  audioTrack.setEnabled(!audioTrack.enabled);
                  if(audioTrack.enabled){
                      setAudioIcon('https://www.svgrepo.com/show/309777/mic-off.svg')
                  } else {
                      setAudioIcon(audioButton)
                  }
                } catch(e){
                  console.log(e)
                }
            }}
            >
                <img src = {audioIcon}/>   
            </button>

            <button
            onClick={() => {
              // refresh page
              window.location.reload();
            }}
            >
                <img src = {exitIcon}/>
            </button>
        </div>

    </div>
  );
};
