import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/auth-context";
import { fetchJson } from "../lib/fetch-config";
import Navbar from "./navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
const FETCH_INTERVAL = 5000;

const BitPredict: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [price, setPrice] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [guess, setGuess] = useState<string | null>(null);
  const [guessPrice, setGuessPrice] = useState<number | null>(null);
  const [guessTime, setGuessTime] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isLoadingGuess, setIsLoadingGuess] = useState<boolean>(false);
  const [isGuessResolved, setIsGuessResolved] = useState<boolean>(false);
  const [priceColor, setPriceColor] = useState<string>(
    "text-gray-900 dark:text-gray-100"
  );
  const [showScoreMessage, setShowScoreMessage] = useState(false);
  const [prevScore, setPrevScore] = useState(0);
  const [scoreChange, setScoreChange] = useState(0);

  // Fetch current BTC price from server
  const fetchPrice = useCallback(async () => {
    try {
      const data = await fetchJson("/btc-price");
      setPrice(data.price);
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  }, []);

  // Fetch current score and check if guess is resolved
  const fetchScoreAndGuessStatus = async () => {
    try {
      const data = await fetchJson("/score");
      setScore(data.score);
      if (data.last_guess && data.last_guess_time && data.last_price) {
        setGuess(data.last_guess);
        setGuessTime(new Date(data.last_guess_time));
        setGuessPrice(data.last_price);
        setIsGuessResolved(false);
      } else {
        setIsGuessResolved(true);
        setGuess(null);
        setGuessTime(null);
        setGuessPrice(null);
      }
    } catch (error) {
      console.error("Error fetching score and guess status:", error);
    }
  };

  // Handle making a guess
  const makeGuess = async (direction: "up" | "down") => {
    setIsLoadingGuess(true);
    try {
      const response = await fetchJson("/guess", {
        method: "POST",
        body: JSON.stringify({ guess: direction }),
      });
      setGuess(direction);
      setGuessTime(new Date());
      setGuessPrice(response.price);
      setIsGuessResolved(false);
      setCountdown(60); // Set countdown to 60 immediately
      setIsLoadingGuess(false);
    } catch (error) {
      console.error("Error submitting guess:", error);
      setIsLoadingGuess(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    fetchScoreAndGuessStatus();
    const intervalId = setInterval(() => {
      fetchPrice();
      fetchScoreAndGuessStatus(); // Periodic refresh of data
    }, FETCH_INTERVAL); // Update the price and score every FETCH_INTERVAL

    return () => clearInterval(intervalId);
  }, [fetchPrice, isAuthenticated]);

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      if (guessTime && !isGuessResolved) {
        const secondsLeft =
          60 - Math.floor((new Date().getTime() - guessTime.getTime()) / 1000);
        setCountdown(secondsLeft > 0 ? secondsLeft : 0);
      } else {
        setCountdown(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [guessTime, isGuessResolved]);

  useEffect(() => {
    if (guess && guessPrice != null && price != null) {
      if (
        (guess === "up" && price > guessPrice) ||
        (guess === "down" && price < guessPrice)
      ) {
        setPriceColor("text-green-600 dark:text-green-400");
      } else if (
        (guess === "up" && price < guessPrice) ||
        (guess === "down" && price > guessPrice)
      ) {
        setPriceColor("text-red-600 dark:text-red-400");
      } else {
        setPriceColor("text-gray-900 dark:text-gray-100");
      }
    } else {
      setPriceColor("text-gray-900 dark:text-gray-100");
    }
  }, [guess, guessPrice, price]);

  useEffect(() => {
    if (prevScore !== score && prevScore !== 0) {
      const change = score - prevScore;
      setScoreChange(change);
      setShowScoreMessage(true);
      setTimeout(() => setShowScoreMessage(false), 3000); // Hide after 3 seconds
    }
    setPrevScore(score);
  }, [score, prevScore]);

  const scoreMessageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  };

  const getScoreMessage = (change: number) => {
    if (change > 0) {
      return `Congratulations! Your score increased by ${change}!`;
    } else if (change < 0) {
      return `Don't worry! Keep predicting. Your score changed by ${change}.`;
    }
    return "Your score has been updated!";
  };

  const getCreativeMessage = (countdown: number) => {
    if (countdown > 45) {
      return "Your next big win is just around the corner!";
    } else if (countdown > 30) {
      return "The crypto winds are shifting. Ready to ride the wave?";
    } else if (countdown > 15) {
      return "Your crypto instincts are tingling. Can you feel it?";
    } else {
      return "Brace yourself! The next prediction window is about to open!";
    }
  };

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900 rounded-lg">
      <Navbar />
      <main className="flex-grow w-full px-8 py-12 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto">
          <AnimatePresence>
            {showScoreMessage && (
              <motion.div
                className="fixed inset-x-0 top-20 flex justify-center"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={scoreMessageVariants}
                transition={{ duration: 0.5 }}
              >
                <Alert variant={scoreChange > 0 ? "default" : "destructive"}>
                  <AlertTitle>Score Update</AlertTitle>
                  <AlertDescription>
                    {getScoreMessage(scoreChange)}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Current BTC Price</CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-3xl font-semibold ${priceColor}`}>
                  ${price ? price.toFixed(2) : "Loading..."}
                </p>
                {guess && guessPrice != null && (
                  <p className="text-sm mt-2">
                    Your guess: {guess === "up" ? "Up" : "Down"} at $
                    {typeof guessPrice === "number"
                      ? guessPrice.toFixed(2)
                      : guessPrice}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Score</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{score}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{guess ? "Current Guess" : "Make a Guess"}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingGuess && (
                <p className="text-gray-600 dark:text-gray-400">Guessing...</p>
              )}
              {guess && !isLoadingGuess ? (
                <>
                  <Alert className="mb-4">
                    <AlertTitle>Your Prediction</AlertTitle>
                    <AlertDescription>
                      You have guessed the price will go{" "}
                      {guess === "up" ? "up ⬆️" : "down ⬇️"}.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-2">
                    <Progress value={((60 - countdown) / 60) * 100} />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getCreativeMessage(countdown)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Next prediction in: {countdown} seconds
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {countdown <= 0 ? (
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <Button
                        onClick={() => makeGuess("up")}
                        className="flex-1"
                      >
                        <ArrowUp className="mr-2 h-4 w-4" /> Guess Up
                      </Button>
                      <Button
                        onClick={() => makeGuess("down")}
                        className="flex-1"
                      >
                        <ArrowDown className="mr-2 h-4 w-4" /> Guess Down
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Progress value={((60 - countdown) / 60) * 100} />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getCreativeMessage(countdown)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Next prediction in: {countdown} seconds
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BitPredict;
