import React, { useState, useEffect, useCallback } from "react";

const API_URL =
  "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD&api_key=15eba0bffdebd75bc16d354e190b838f1047e9a717b286001ddd21883dcde067";

const BitPredict: React.FC = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [guess, setGuess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPriceREST = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setPrice(data.USD);
    } catch (error) {
      console.error("Error fetching price via REST:", error);
    }
  }, []);

  useEffect(() => {
    fetchPriceREST();
    const intervalId = setInterval(fetchPriceREST, 10000); // Fetch every 10 seconds
    fetchScore();

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchPriceREST]);

  const fetchScore = async () => {
    // try {
    //   const user = await Auth.currentAuthenticatedUser();
    //   const response = await API.get("bitpredictApi", "/score", {
    //     headers: {
    //       Authorization: `Bearer ${(await Auth.currentSession())
    //         .getIdToken()
    //         .getJwtToken()}`,
    //     },
    //   });
    //   setScore(response.score);
    //   setIsLoading(false);
    // } catch (error) {
    //   console.error("Error fetching score:", error);
    //   setIsLoading(false);
    // }

    setIsLoading(false);
    return 5;
  };

  const makeGuess = async (direction: "up" | "down") => {
    try {
      // const response = await API.post("bitpredictApi", "/guess", {
      //   body: { direction },
      //   headers: {
      //     Authorization: `Bearer ${(await Auth.currentSession())
      //       .getIdToken()
      //       .getJwtToken()}`,
      //   },
      // });
      setGuess(direction);
      // console.log("Guess submitted:", response);
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
