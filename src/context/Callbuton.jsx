import React, { useState } from "react";

const CallButton = ({ handleCallUser }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  const toggleAudio = () => {
    setIsAudioEnabled((prevAudioState) => !prevAudioState);
  };
  

  return (
    <div>
      <button onClick={handleCallUser}> make a call Call</button>
      <button onClick={toggleAudio}>
        {isAudioEnabled ? "Disable Audio" : "Enable Audio"}
      </button>
    </div>
  );
};

export default CallButton;
