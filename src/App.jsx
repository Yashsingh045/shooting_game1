import React, { useState, useEffect, useRef } from "react";
import './App.css';

// Basic Game Settings
const soldierSpeed = 10;
const enemySpeed = 1.8;
const bulletSpeed = 10;
const enemyFrequency = 200;

function App() {
  // Game state
  const [soldier, setSoldier] = useState({ x: 350, y: 500, health: 100 });
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); // To track if the game has started

  const gameAreaRef = useRef(null);

  // images
  const soldierImage = "./src/assets/photos/soldier.png"; 
  const enemyImage = "./src/assets/photos/enemy.png";
  const bulletImage = "./src/assets/photos/bullet.png";

  // Movement logic
  const handleKeyDown = (e) => {
    if (gameOver || !gameStarted) return; // Disable controls when game is over or not started
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
    if (gameOver || !gameStarted) return; // Only spawn enemies when game is active
    const interval = setInterval(() => {
      const randomX = Math.floor(Math.random() * (gameAreaRef.current.offsetWidth - 50));
      setEnemies((prev) => [
        ...prev,
        { x: randomX, y: 0, speed: enemySpeed, id: Math.random() },
      ]);
    }, enemyFrequency);
    return () => clearInterval(interval);
  }, [gameOver, gameStarted]);

  // Game loop: Move bullets and enemies
  useEffect(() => {
    if (gameOver || !gameStarted) return;

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
    }, 30);

    return () => clearInterval(gameInterval);
  }, [bullets, enemies, soldier, gameOver, gameStarted]);

  // Listen for keydown events
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [soldier, gameOver, gameStarted]);

  // Reset game state
  const handleReplay = () => {
    setSoldier({ x: 250, y: 400, health: 100 });
    setBullets([]);
    setEnemies([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false); // Stop the game
  };

  const handlePlay = () => {
    setGameStarted(true); // Start the game
  };

  return (
    <div className="App">
      <div className="gameArea" ref={gameAreaRef}>
        {!gameStarted && !gameOver && (
          <div className="playButton" onClick={handlePlay}>
            Play
          </div>
        )}

        {gameOver && (
          <div className="gameOver" >
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
              width: "10px",
              height: "40px",
            }}
          >
            <img
              src={bulletImage}
              alt="Bullet"
              style={{ width: "12px", height: "40px" }}
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
