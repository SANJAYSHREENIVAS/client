import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import {FaPhone} from 'react-icons/fa'
import { FaVideo } from 'react-icons/fa';
import { FiPhoneMissed } from 'react-icons/fi';

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const handleUserJoined = useCallback(({ name, id }) => {
    console.log(`name ${name} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);





  return (
    <div>
      <h1 style={{color:"white" ,fontFamily:""}}>Room Page</h1>
      <h4 style={{color:"white" ,fontFamily:""}}>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream &&
       <button onClick={sendStreams}className="btn-12"><span>Stream</span><span><FaVideo/></span></button>}
      {remoteSocketId &&
       <button onClick={handleCallUser}className="btn-12"><span>Call</span><span><FaPhone /></span></button>}
      

      <button  className="btn-12" onClick={() => { window.location.href = 'http://localhost:3000/'; }}>
      <span>End Call</span><span><FiPhoneMissed/></span></button>
      

      
<div className="allin" style={{ display: 'flex' }}>
  {myStream && (
    <>
   
      
      <div className="player1">
      <h1>My Room</h1>
      <ReactPlayer
        playing
        unmuted
        height=" 50vh"

        // height="500px"
        width="50vw"
        url={myStream}
      />
      </div>
      </>
    
  )}
  {remoteStream && (
 <>

      <div className="player2">
      <h1>Roomate</h1>
      
      <ReactPlayer
      
        playing

        unmuted
        height=" 50vh"

        // height="500px"
        width="50vw"
        //  height="500px"
        //  width="200px"
        url={remoteStream}
      />
      </div>
      </>
    
  )}
</div>


    </div>
  );
};

export default RoomPage;
