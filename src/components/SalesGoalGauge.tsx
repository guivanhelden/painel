import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import { useSound } from '../hooks/useSound';
import { CongratulationsMessage } from './CongratulationsMessage';

const getProgressEmoji = (percentage: number) => {
  if (percentage >= 100) return '🥳🎉';
  if (percentage >= 90) return '🤗';
  if (percentage >= 80) return '😍';
  if (percentage >= 70) return '🤩';
  if (percentage >= 60) return '😆';
  if (percentage >= 50) return '😁';
  if (percentage >= 40) return '😃';
  if (percentage >= 30) return '😊';
  if (percentage >= 20) return '😏';
  if (percentage >= 10) return '😐';
  return '😵‍💫';
};

interface SalesGoalGaugeProps {
  percentageAchieved: number;
  totalGoal: number;
  currentValue: number;
  onGoalAchieved?: (show: boolean) => void;
}

const getEndOfMonth = () => {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = lastDay.getDate() - today.getDate();
  
  return {
    daysRemaining,
    formattedDate: lastDay.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long'
    })
  };
};

export function SalesGoalGauge({ 
  percentageAchieved, 
  totalGoal, 
  currentValue,
  onGoalAchieved 
}: SalesGoalGaugeProps) {
  const { playSound } = useSound();
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => latest.toFixed(1));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (percentageAchieved >= 100) {
      // Primeiro toca o som
      playSound('success');
      
      // Delay para os fogos
      const fireworksTimer = setTimeout(() => {
        onGoalAchieved?.(true);
      }, 2000); // 2 segundos após a animação do gauge

      // Timer para remover os fogos
      const removeTimer = setTimeout(() => {
        onGoalAchieved?.(false);
      }, 10000); // 10 segundos no total

      return () => {
        clearTimeout(fireworksTimer);
        clearTimeout(removeTimer);
      };
    } else {
      onGoalAchieved?.(false);
    }
  }, [percentageAchieved, onGoalAchieved, playSound]);

  // Efeito para animar o número
  useEffect(() => {
    const duration = 2000; // 2 segundos
    const steps = 60; // 60 frames
    const stepDuration = duration / steps;
    const increment = percentageAchieved / steps;
    let current = 0;
    let frame = 0;

    const timer = setInterval(() => {
      current += increment;
      frame++;
      
      if (frame === steps) {
        current = percentageAchieved;
        clearInterval(timer);
      }
      
      setDisplayValue(current);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [percentageAchieved]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getColor = () => {
    if (percentageAchieved >= 100) return 'text-emerald-500';
    if (percentageAchieved >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMessage = () => {
    const remaining = totalGoal - currentValue;
    const { daysRemaining, formattedDate } = getEndOfMonth();
    const daysText = `${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'} até ${formattedDate}`;

    if (percentageAchieved >= 100) {
      return {
        text: 'Parabéns! Meta alcançada!',
        subText: daysText,
        icon: TrendingUp,
        color: 'text-emerald-500'
      };
    }
    if (percentageAchieved >= 80) {
      return {
        text: `Estamos quase lá! ${remaining <= 100000 ? `Faltam ${formatCurrency(remaining)}` : 'Continue assim!'}`,
        subText: daysText,
        icon: Target,
        color: 'text-yellow-500'
      };
    }
    return {
      text: `Vamos acelerar! ${remaining <= 100000 ? `Potencial de ${formatCurrency(remaining)}` : 'Foco na meta!'}`,
      subText: daysText,
      icon: AlertCircle,
      color: 'text-red-500'
    };
  };

  const message = getMessage();
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentageAchieved > 100 ? 100 : percentageAchieved) / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/60 backdrop-blur-lg rounded-3xl p-6 lg:p-8 xl:p-10 shadow-2xl w-full max-w-3xl lg:max-w-5xl xl:max-w-7xl mx-auto border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300">
      <div className="flex items-center gap-4 mb-6 lg:mb-8 xl:mb-10 bg-gradient-to-r from-purple-900/50 to-pink-900/30 p-4 lg:p-6 rounded-xl border border-purple-500/20 shadow-lg">
        <div className="bg-purple-500/20 p-3 lg:p-4 rounded-lg">
          <Target className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-purple-400" />
        </div>
        <h3 className="text-2xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Meta de Vendas
        </h3>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16">
        <div className="flex-1 w-full lg:w-auto flex justify-center">
          <div className="relative w-72 h-72 lg:w-96 lg:h-96 xl:w-[32rem] xl:h-[32rem] transform hover:scale-105 transition-all duration-500 ease-out">
            <svg className="w-full h-full" viewBox="0 0 200 200">
              {/* Círculo de fundo */}
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke="url(#gradientBg)"
                strokeWidth="12"
                className="opacity-30"
              />

              {/* Círculo de progresso */}
              <motion.circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke={`url(#gradient${percentageAchieved >= 100 ? 'Success' : percentageAchieved >= 80 ? 'Warning' : 'Danger'})`}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={2 * Math.PI * 88 * (1 - progress)}
                transform="rotate(-90 100 100)"
                className="filter drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - progress) }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />

              {/* Texto da porcentagem */}
              <motion.text
                x="100"
                y="80"
                textAnchor="middle"
                className={`text-5xl lg:text-6xl xl:text-7xl font-black ${getColor()}`}
                fill="currentColor"
                filter="url(#neonGlow)"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                {displayValue.toFixed(1)}%
              </motion.text>

              {/* Emoji */}
              <motion.text
                x="100"
                y="150"
                textAnchor="middle"
                className="text-4xl lg:text-5xl xl:text-6xl"
                fill="currentColor"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                {getProgressEmoji(percentageAchieved)}
              </motion.text>

              {/* Definições dos gradientes */}
              <defs>
                <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.1" />
                </linearGradient>

                <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(168,85,247,0.4)" />
                  <stop offset="100%" stopColor="rgba(168,85,247,0)" />
                </radialGradient>

                <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feFlood floodColor="rgba(168,85,247,0.5)" result="flood" />
                  <feComposite in="flood" in2="SourceGraphic" operator="in" result="mask" />
                  <feGaussianBlur in="mask" stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Gradientes existentes com animação */}
                <linearGradient id="gradientSuccess" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#059669">
                    <animate attributeName="stopColor" values="#059669;#10b981;#059669" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#10b981">
                    <animate attributeName="stopColor" values="#10b981;#059669;#10b981" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>

                <linearGradient id="gradientWarning" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d97706">
                    <animate attributeName="stopColor" values="#d97706;#fbbf24;#d97706" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#fbbf24">
                    <animate attributeName="stopColor" values="#fbbf24;#d97706;#fbbf24" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>

                <linearGradient id="gradientDanger" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#dc2626">
                    <animate attributeName="stopColor" values="#dc2626;#ef4444;#dc2626" dur="3s" repeatCount="indefinite" />
                  </stop>
                  <stop offset="100%" stopColor="#ef4444">
                    <animate attributeName="stopColor" values="#ef4444;#dc2626;#ef4444" dur="3s" repeatCount="indefinite" />
                  </stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`flex-1 flex flex-col items-center gap-3 lg:gap-4 xl:gap-5 ${message.color} text-center bg-gray-900/40 p-4 lg:p-6 xl:p-8 rounded-2xl backdrop-blur-md border border-gray-700/40 hover:border-gray-600/50 transition-all duration-300 shadow-lg`}
        >
          <div className="flex items-center gap-3 lg:gap-4 xl:gap-5">
            <div className="bg-current/20 p-3 lg:p-4 rounded-xl shadow-inner">
              <message.icon className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12" />
            </div>
            <p className="text-2xl lg:text-3xl xl:text-4xl font-bold">
              {message.text}
            </p>
          </div>
          <p className="text-base lg:text-lg xl:text-xl opacity-80">
            {message.subText}
          </p>
        </motion.div>
      </div>
      
      {percentageAchieved >= 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1 }}
        >
          <CongratulationsMessage />
        </motion.div>
      )}
    </div>
  );
}