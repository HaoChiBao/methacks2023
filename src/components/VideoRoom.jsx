import React, { useEffect, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { VideoPlayer } from './VideoPlayer';

const APP_ID = 'fd724da3607e4f568c1775a94077234d';
const TOKEN =
  '007eJxTYNh+lJVzdtlv5SOdF9+4bvhrvjH+03w+gU9NHBusb4tcOpWkwJCWYm5kkpJobGZgnmqSZmpmkWxobm6aaGliYG5uZGySwnctNKUhkJHBPzKNgREKQXwWhtzEzDwGBgCZqx96';
const CHANNEL = 'main';

const client = AgoraRTC.createClient({
  mode: 'rtc',
  codec: 'vp8',
});

export const VideoRoom = () => {
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

            // console.log(results.image)
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

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 200px)',
        }}
      >
          <video style = {{position: "absolute", opacity: "0"}} className = "client-video"></video>
        <canvas className="client-canvas" width="200" height="200" style = {{transform: "scaleX(-1)"}}></canvas>
        {users.map((user) => (
          <VideoPlayer key={user.uid} user={user} />
        ))}
      </div>
    </div>
  );
};
