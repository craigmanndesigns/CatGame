import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type GameState = 'IDLE' | 'SCRATCHING' | 'WARNING' | 'ATTACK' | 'GAMEOVER';

const BellyGame = () => {
    const [gameState, setGameState] = useState<GameState>('IDLE');
    const [score, setScore] = useState(0);
    const [sessionScore, setSessionScore] = useState(0); // Score for the current "hold"

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const warningRef = useRef<NodeJS.Timeout | null>(null);

    const CAT_IMAGES = {
        IDLE: '/images/cat_idle.png',
        SCRATCHING: '/images/cat_scratching.png',
        WARNING: '/images/cat_warning.png',
        ATTACK: '/images/cat_attack.png',
        GAMEOVER: '/images/cat_scratching.png',
    };

    const [isShaking, setIsShaking] = useState(false);

    const triggerShake = () => {
        setIsShaking(true);
        // Stop shaking after 500ms
        setTimeout(() => setIsShaking(false), 500);
    };


    const startScratching = () => {
        if (gameState === 'GAMEOVER' || gameState === 'ATTACK') return;

        setGameState('SCRATCHING');
        setSessionScore(0); // Reset the points for this specific rub

        const totalWait = Math.random() * 3000 + 1000;
        const warningTime = totalWait - 700;

        warningRef.current = setTimeout(() => setGameState('WARNING'), warningTime);
        timerRef.current = setTimeout(() => {
            setGameState('ATTACK');
            triggerShake();
        }, totalWait);
    };

    const stopScratching = () => {
        if (gameState === 'SCRATCHING' || gameState === 'WARNING') {
            const isRiskTaker = gameState === 'WARNING';
            const finalGain = isRiskTaker ? sessionScore * 2 : sessionScore;

            setScore(prev => prev + Math.floor(finalGain));

            // Clear timers
            if (timerRef.current) clearTimeout(timerRef.current);
            if (warningRef.current) clearTimeout(warningRef.current);

            setGameState('IDLE');
        } else if (gameState === 'ATTACK') {
            setGameState('GAMEOVER');
        }
    };

    // Continuous Scoring Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === 'SCRATCHING' || gameState === 'WARNING') {
            interval = setInterval(() => {
                setSessionScore(s => s + 1);
            }, 50); // Adds points every 50ms
        }
        return () => clearInterval(interval);
    }, [gameState]);

    useEffect(() => {
        Object.values(CAT_IMAGES).forEach((src) => {
            const img = new Image();
            img.src = src;
        });
    }, []);

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white select-none transition-all
          ${gameState === 'WARNING' && 'bg-orange-500'}
          ${gameState === 'ATTACK' && 'bg-red-600'}
          ${gameState === 'GAMEOVER' && 'bg-black'}
        `}
        >
            <motion.div
                className="flex flex-col items-center justify-center "
                animate={isShaking ? {
                    x: [0, -10, 10, -10, 10, 0],
                    y: [0, 5, -5, 5, -5, 0],
                } : { x: 0, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-black italic text-yellow-400">Scratch the cat</h1>
                    <div className="text-xl font-mono text-slate-400">TOTAL: {score}</div>

                    {/* Current Hold Display */}
                    <div className="h-8 mt-2">
                        {(gameState === 'SCRATCHING' || gameState === 'WARNING') && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className={`text-2xl font-bold ${gameState === 'WARNING' ? 'text-orange-500' : 'text-green-400'}`}
                            >
                                +{sessionScore} {gameState === 'WARNING' && '(2X MULTIPLIER!)'}
                            </motion.div>
                        )}
                    </div>
                </div>
                <motion.div
                    className={`w-72 h-72 overflow-hidden flex items-center justify-center cursor-grab transition-all
                        ${gameState === 'WARNING' && 'scale-110'}
                        ${gameState === 'SCRATCHING' && 'cursor-grabbing'}
                        `}
                    onMouseDown={startScratching}
                    onMouseUp={stopScratching}
                    onTouchStart={startScratching}
                    onTouchEnd={stopScratching}
                    animate={gameState === 'SCRATCHING' || gameState === 'WARNING' ? { rotate: [0, -2, 2, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 0.1 }}
                >
                    <img
                        src={CAT_IMAGES[gameState]}
                        alt="Cat"
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                {gameState === 'GAMEOVER' && (
                    <button
                        onClick={() => { setScore(0); setGameState('IDLE'); }}
                        className="mt-8 bg-yellow-400 text-black px-8 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition"
                    >
                        TRY AGAIN
                    </button>
                )}

            </motion.div>
        </div>

    );
};

export default BellyGame;