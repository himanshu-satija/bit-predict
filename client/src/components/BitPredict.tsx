import React, { useState, useEffect } from "react";

import Auth from "@aws-amplify/auth";
import API from "@aws-amplify/api";
import io from "socket.io-client";

const BitPredict: React.FC = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [guess, setGuess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Connect to CryptoCompare WebSocket
    const socket = io("wss://streamer.cryptocompare.com");
    socket.emit("SubAdd", { subs: ["5~CCCAGG~BTC~USD"] });

    socket.on("m", (message: string) => {
      const [, , , , price] = message.split("~");
      setPrice(parseFloat(price));
    });

    // Fetch initial score
    fetchScore();

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchScore = async () => {
    try {
      const user = await Auth.currentAuthenticatedUser();
      const response = await API.get("bitpredictApi", "/score", {
        headers: {
          Authorization: `Bearer ${(await Auth.currentSession())
            .getIdToken()
            .getJwtToken()}`,
        },
      });
      setScore(response.score);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching score:", error);
      setIsLoading(false);
    }
  };

  const makeGuess = async (direction: "up" | "down") => {
    try {
      const response = await API.post("bitpredictApi", "/guess", {
        body: { direction },
        headers: {
          Authorization: `Bearer ${(await Auth.currentSession())
            .getIdToken()
            .getJwtToken()}`,
        },
      });
      setGuess(direction);
      console.log("Guess submitted:", response);
    } catch (error) {
      console.error("Error submitting guess:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>BitPredict</h1>
      <p>Current BTC Price: ${price?.toFixed(2)}</p>
      <p>Your Score: {score}</p>
      {guess ? (
        <p>Your current guess: {guess}</p>
      ) : (
        <div>
          <button onClick={() => makeGuess("up")}>Guess Up</button>
          <button onClick={() => makeGuess("down")}>Guess Down</button>
        </div>
      )}
    </div>
  );
};

export default BitPredict;
