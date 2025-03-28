import React, { useState, useEffect, useRef } from "react";
import './App.css';

// Basic Game Settings
const soldierSpeed = 10;
const enemySpeed = 1.8;
const bulletSpeed = 10;
const enemyFrequency = 200;
const winningScore = 250;

function App() {

  // Game state
  const [soldier, setSoldier] = useState({ x: 350, y: 500, health: 100 });
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); // To track if the game has started
  const [wonWar, setWonWar] = useState(false); // To track if the player has won

  const gameAreaRef = useRef(null);

  // images
  const soldierImage = "https://media-hosting.imagekit.io/4af1622961934c90/soldier.png?Expires=1837793156&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=Oei-kOaxn8qC-4Ft0RayTbIbbNIC51Xh9tX6ZBzN8Ii7qaq1ACbsRoMPPXpQD4P-QBd0mcRLUNKnJvXgjTYYVnBt5JMsUxsO3pZawpKzAgmtj7VpCU1lkldfTK70DAc0YMH6R4DCkaLuoAlnq3FiXrDUaOO12iXrgU54-b9HxCSkigGfv~efz0lV7cS3ILdHMxhNcY6O1VUyeaPZUB1VtZ6FZGQy6dFeFgDqWJFWmNrLXNf8KM2ce6aQpwt389JXi~6DlcmH0xvutVSIJWbEzYYsqW4kN5VEoCeMKo7IsAYskUi1s9MUJt-ckM~QQG9USjxVNfY6FT45rmroR1Bf0w__"; 
  const enemyImage = "https://media-hosting.imagekit.io/ad9bb4c6bc2e4c75/enemy.png?Expires=1837793090&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=C-z2TKhcEYMAukC5U6z0hIZVjueeyRTgcjiEj9GFTXtKH7Zvkl82hy1RARYu9FWrEn2PXBOE-i0CX2Bt2n8q5vZALlLok~TTLdZlt3tFuetAmz0qoeSzXABZxeyzq0Qks81No1aMaFxtGIOX58ERqF106uKGY-8to18ZTzpXS1pj-~NbYN5WqhhoNacMcjSvdhcll-Sjikg17SBWq0Div8WuKge1w3o9ZqMblgoupPXhdIq41ssbcCVVUzk6ZLLVEAO28AGHBMErPKB2olsRZjK9gVnFrmvT9ry0MehzwaIaVfnD4Ynn8SnIuKpZzzpHJ52kH7x7MBRL7r0X4kycLA__";
  const bulletImage = "https://media-hosting.imagekit.io/e77445685ecb42db/bullet.png?Expires=1837792660&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=xEGz9L1aXX5skRAI6OuAts1lEMQXBEhFS9rEKw0bfhe2nEmOvjBqRwO8fQObkxDKcP-m3dWRJ3UmMk~NBHbXr~cmTkhhSO06TZz9druq2anvT0Yrb4BjvJtc7sASFBTSw5~ksGB1R52w6Lfbic2pR11mzz2HcIllYeEIc~1~5X3-uvNi1f2q40qETfMB68c6HAw3Z25CisCbaB0W2N4L-hyhI3pHPwAtBZFWYLtRcUDZsa-jlcZDXGit8yIMmwGJj1Fnc0baZHb5iOW4ZgZXeE97hcc2uYNyUZyU1sOIoKgZ4ilxaDdQ2bPmZMp2XaLeg-Sbl1XC8-hKRb47MQsm0A__"

  // Movement logic
  const handleKeyDown = (e) => {
    if (gameOver || wonWar || !gameStarted) return; // Disable controls when game is over or not started or won
    const { x, y } = soldier;

    switch (e.key) {
      case "ArrowUp":
        setSoldier((prev) => ({ ...prev, y: Math.max(0, y - soldierSpeed) }));
        break;
      case "ArrowDown":
        setSoldier((prev) => ({
          ...prev,
          y: Math.min(gameAreaRef.current.offsetHeight - 50, y + soldierSpeed),
        }));
        break;
      case "ArrowLeft":
        setSoldier((prev) => ({ ...prev, x: Math.max(0, x - soldierSpeed) }));
        break;
      case "ArrowRight":
        setSoldier((prev) => ({
          ...prev,
          x: Math.min(gameAreaRef.current.offsetWidth - 50, x + soldierSpeed),
        }));
        break;
      case " ":
        shootBullet();
        break;
      default:
        break;
    }
  };

  // Shooting logic
  const shootBullet = () => {
    setBullets((prev) => [
      ...prev,
      { x: soldier.x + 20, y: soldier.y, speed: bulletSpeed },
    ]);
  };

  // Spawn enemies
  useEffect(() => {
    if (gameOver || !gameStarted || wonWar) return; // Only spawn enemies when game is active
    const interval = setInterval(() => {
      const randomX = Math.floor(Math.random() * (gameAreaRef.current.offsetWidth - 50));
      setEnemies((prev) => [
        ...prev,
        { x: randomX, y: 0, speed: enemySpeed, id: Math.random() },
      ]);
    }, enemyFrequency);
    return () => clearInterval(interval);
  }, [gameOver, gameStarted, wonWar]);

  // Game loop: Move bullets and enemies
  useEffect(() => {
    if (gameOver || !gameStarted || wonWar) return;

    const gameInterval = setInterval(() => {
      // Move bullets
      setBullets((prev) =>
        prev
          .map((bullet) => ({ ...bullet, y: bullet.y - bullet.speed })) // Move bullets up
          .filter((bullet) => bullet.y > 0) // Remove bullets that went off-screen
      );

      // Move enemies toward the soldier and check for collisions
      setEnemies((prevEnemies) =>
        prevEnemies
          .map((enemy) => {
            const dx = soldier.x - enemy.x;
            const dy = soldier.y - enemy.y;
            const angle = Math.atan2(dy, dx); // Get the angle toward the soldier
            const speed = enemy.speed;

            // Move the enemy toward the soldier
            return {
              ...enemy,
              x: enemy.x + Math.cos(angle) * speed,
              y: enemy.y + Math.sin(angle) * speed,
            };
          })
          .filter((enemy) => enemy.y < gameAreaRef.current.offsetHeight) // Remove enemies off-screen
      );

      // Collision detection
      bullets.forEach((bullet) => {
        enemies.forEach((enemy) => {
          if (
            bullet.x < enemy.x + 50 &&
            bullet.x + 10 > enemy.x &&
            bullet.y < enemy.y + 50 &&
            bullet.y + 10 > enemy.y
          ) {
            // Remove enemy and bullet on collision
            setEnemies((prev) => prev.filter((e) => e.id !== enemy.id));
            setBullets((prev) => prev.filter((b) => b !== bullet));
            setScore((prev) => prev + 1);
          }
        });
      });

      // Check for collisions between soldier and enemies
      enemies.forEach((enemy) => {
        if (
          soldier.x < enemy.x + 50 &&
          soldier.x + 50 > enemy.x &&
          soldier.y < enemy.y + 50 &&
          soldier.y + 50 > enemy.y
        ) {
          // Soldier gets hit, reduce health
          setSoldier((prev) => ({ ...prev, health: prev.health - 8 }));
          if (soldier.health <= 0) {
            setGameOver(true);
          }
        }
      });

      // Check if score reaches the winning score
      if (score >= winningScore) {
        setWonWar(true);
        setGameOver(true);
      }
    }, 30);

    return () => clearInterval(gameInterval);
  }, [bullets, enemies, soldier, gameOver, gameStarted, score, wonWar]);

  // Listen for keydown events
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  },);

  // Reset game state
  const handleReplay = () => {
    setSoldier({ x: 250, y: 400, health: 100 });
    setBullets([]);
    setEnemies([]);
    setScore(0);
    setGameOver(false);
    setWonWar(false); // Reset the won war flag
    setGameStarted(false); // Stop the game
  };

  const handlePlay = () => {
    setGameStarted(true); // Start the game
  };

  return (
    <div className="App">
      <div className="gameArea" ref={gameAreaRef}>
        {/* Show instructions before the game starts */}
        {!gameStarted && !gameOver && !wonWar && (
          <>
            <h2 className="head">Shooting Game</h2>
          <div className="instructions">
            <p>Press Space to Shoot</p>
            <p>Use Arrow Keys to Move</p>
          </div>
            <div className="playButton" onClick={handlePlay}>
              Play
            </div>
          </>
        )}

        {/* Show game over or win message */}
        {gameOver && !wonWar && (
          <div className="gameOver">
            <div className="gameOverMessage">
              Game Over
              <br />
              <span style={{ color: 'red', fontSize: '18px' }}>Health: {soldier.health}</span>
              <br />
              <span style={{ color: 'gold', fontSize: '18px' }}>Score: {score}</span>
            </div>
            <button className="replayButton" onClick={handleReplay}>
              Replay
            </button>
          </div>
        )}

        {/* Show "You won the war" message */}
        {wonWar && (
          <div className="gameOver">
            <div className="gameOverMessage">
              Congratulations, You Won the War!
              <br />
              <span style={{ color: 'gold', fontSize: '18px' }}>Score: {score}</span>
            </div>
            <button className="replayButton" onClick={handleReplay}>
              Replay
            </button>
          </div>
        )}

        <div
          className="soldier"
          style={{ left: soldier.x, top: soldier.y, position: "absolute" }}
        >
          <img
            src={soldierImage}
            alt="Soldier"
            style={{ width: "70px", height: "70px" }}
          />
        </div>

        {bullets.map((bullet, index) => (
          <div
            key={index}
            className="bullet"
            style={{
              left: bullet.x,
              top: bullet.y,
              position: "absolute",
              width: "0px",
              height: "40px",
            }}
          >
            <img
              src={bulletImage}
              alt="Bullet"
              style={{ width: "8px", height: "30px" }}
            />
          </div>
        ))}

        {enemies.map((enemy) => (
          <div
            key={enemy.id}
            className="enemy"
            style={{ left: enemy.x, top: enemy.y, position: "absolute" }}
          >
            <img
              src={enemyImage}
              alt="Enemy"
              style={{ width: "60px", height: "60px" }}
            />
          </div>
        ))}

        <div className="healthBar">
          Health: {soldier.health} | Score: {score}
        </div>
      </div>
    </div>
  );
}

export default App;
