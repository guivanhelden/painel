import React, { useEffect, useState, useRef } from 'react';
import { supabase } from './lib/supabase';
import { DashboardTable } from './components/DashboardTable';
import { ActivitySquare, ClipboardSignature, AlertCircle, Target, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SalesGoalTab } from './components/SalesGoalTab';
import { FireworksEffect } from './components/FireworksEffect';
import { FlipChartTab } from './components/FlipChartTab';
import { useAutoReload } from './hooks/useAutoReload';


export default function App() {
  const [signatureData, setSignatureData] = useState<any[]>([]);
  const [newProposalsData, setNewProposalsData] = useState<any[]>([]);
  const [pendingData, setPendingData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'signature' | 'new' | 'pending' | 'sales' | 'flipchart'>('signature');
  const [loading, setLoading] = useState(true);
  const [showFireworks, setShowFireworks] = useState(false);
  // Estado para controlar se a rotação automática deve ser pausada
  const [pauseRotation, setPauseRotation] = useState(false);
  // Referência para o intervalo de rotação
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-reload apenas em produção, com intervalo configurável via env VITE_AUTO_RELOAD_MS
  useAutoReload({
    enabled: import.meta.env.PROD,
    intervalMs: Number(import.meta.env.VITE_AUTO_RELOAD_MS ?? 600000),
    pauseWhenHidden: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: signatureData, error: signatureError } = await supabase
          .from('view_trello_cards_aguarde_assinatura_2')
          .select('*, board_name')
          .order('dias_restantes', { ascending: true });

        if (signatureError) throw signatureError;
        setSignatureData(signatureData || []);

        const { data: newProposalsData, error: newProposalsError } = await supabase
          .from('view_trello_cards_hoje')
          .select('*, board_name');

        if (newProposalsError) throw newProposalsError;
        setNewProposalsData(newProposalsData || []);

        const { data: pendingData, error: pendingError } = await supabase
          .from('view_trello_cards_pendencias')
          .select('*, board_name')
          .order('dias_restantes', { ascending: true });

        if (pendingError) throw pendingError;
        setPendingData(pendingData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const signatureSubscription = supabase
      .channel('signature_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'view_trello_cards_aguarde_assinatura_2' }, 
        () => fetchData())
      .subscribe();

    const newProposalsSubscription = supabase
      .channel('new_proposals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'view_trello_cards_hoje' }, 
        () => fetchData())
      .subscribe();

    const pendingSubscription = supabase
      .channel('pending_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'view_trello_cards_pendencias' }, 
        () => fetchData())
      .subscribe();

    // Iniciar o intervalo de rotação
    startRotationInterval();

    return () => {
      signatureSubscription.unsubscribe();
      newProposalsSubscription.unsubscribe();
      pendingSubscription.unsubscribe();
      // Limpar o intervalo quando o componente for desmontado
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
        rotationIntervalRef.current = null;
      }
    };
  }, []);

  // Efeito para gerenciar o intervalo de rotação com base no estado pauseRotation
  useEffect(() => {
    if (pauseRotation) {
      // Se a rotação estiver pausada, limpar o intervalo atual
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
        rotationIntervalRef.current = null;
      }
    } else {
      // Se a rotação não estiver pausada, iniciar o intervalo (se ainda não existir)
      if (!rotationIntervalRef.current) {
        startRotationInterval();
      }
    }
  }, [pauseRotation]);

  // Função para iniciar o intervalo de rotação
  const startRotationInterval = () => {
    rotationIntervalRef.current = setInterval(() => {
      setActiveTab(prev => {
        if (prev === 'signature') return 'new';
        if (prev === 'new') return 'pending';
        if (prev === 'pending') return 'sales';
        if (prev === 'sales') return 'flipchart';
        return 'signature';
      });
    }, 30000);
  };

  // Função para lidar com mudanças no modo de edição do FlipChartTab
  const handleFlipChartEditingChange = (isEditing: boolean) => {
    setPauseRotation(isEditing);
  };

  // Função para controlar a exibição dos fogos
  const handleShowFireworks = (show: boolean) => {
    if (activeTab === 'sales') {
      console.log('Fireworks:', show);
      setShowFireworks(show);
    } else {
      setShowFireworks(false);
    }
  };

  // Quando mudar de aba, desliga os fogos
  useEffect(() => {
    setShowFireworks(false);
  }, [activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 lg:p-8">
      {activeTab === 'sales' && <FireworksEffect enabled={showFireworks} />}
      
      <div className="max-w-[95vw] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-4"
        >
          <div className="flex items-center gap-4 lg:gap-8">
            <img
              src="https://broker.vhseguros.com.br/imagens/logo_van_h.png"
              alt="VH Seguros"
              className="h-8 lg:h-12 opacity-90"
            />
            <h1 className="text-2x1 lg:text-3x1 xl:text-3x1 font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent whitespace-nowrap">
              Monitoramento de Propostas
            </h1>
          </div>
          <div className="flex gap-4 flex-wrap xl:flex-nowrap xl:gap-2 justify-center">
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setActiveTab('signature')}
    className={`flex items-center gap-2 px-4 lg:px-6 xl:px-3 py-2 lg:py-3 xl:py-2 rounded-lg transition-all text-lg lg:text-xl xl:text-base ${
      activeTab === 'signature'
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
        : 'bg-gray-800 text-gray-300'
    } flex-shrink-0`}
  >
    <ClipboardSignature className="w-5 h-5 xl:w-4 xl:h-4" />
    Aguardando Assinatura
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setActiveTab('new')}
    className={`flex items-center gap-2 px-4 lg:px-6 xl:px-3 py-2 lg:py-3 xl:py-2 rounded-lg transition-all text-lg lg:text-xl xl:text-base ${
      activeTab === 'new'
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
        : 'bg-gray-800 text-gray-300'
    } flex-shrink-0`}
  >
    <ActivitySquare className="w-5 h-5 xl:w-4 xl:h-4" />
    Propostas Novas
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setActiveTab('sales')}
    className={`flex items-center gap-2 px-4 lg:px-6 xl:px-3 py-2 lg:py-3 xl:py-2 rounded-lg transition-all text-lg lg:text-xl xl:text-base ${
      activeTab === 'sales'
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
        : 'bg-gray-800 text-gray-300'
    } flex-shrink-0`}
  >
    <Target className="w-5 h-5 xl:w-4 xl:h-4" />
    Meta de Vendas
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setActiveTab('pending')}
    className={`flex items-center gap-2 px-4 lg:px-6 xl:px-3 py-2 lg:py-3 xl:py-2 rounded-lg transition-all text-lg lg:text-xl xl:text-base ${
      activeTab === 'pending'
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
        : 'bg-gray-800 text-gray-300'
    } flex-shrink-0`}
  >
    <AlertCircle className="w-5 h-5 xl:w-4 xl:h-4" />
    Pendências
  </motion.button>

  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={() => setActiveTab('flipchart')}
    className={`flex items-center gap-2 px-4 lg:px-6 xl:px-3 py-2 lg:py-3 xl:py-2 rounded-lg transition-all text-lg lg:text-xl xl:text-base ${
      activeTab === 'flipchart'
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
        : 'bg-gray-800 text-gray-300'
    } flex-shrink-0`}
  >
    <FileText className="w-5 h-5 xl:w-4 xl:h-4" />
    Flip Chart
  </motion.button>
</div>

            </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'signature' ? (
              <DashboardTable 
                data={signatureData} 
                type="signature" 
              />
            ) : activeTab === 'new' ? (
              <DashboardTable 
                data={newProposalsData} 
                type="new" 
              />
            ) : activeTab === 'sales' ? (
              <SalesGoalTab onGoalAchieved={handleShowFireworks} />
            ) : activeTab === 'pending' ? (
              <DashboardTable data={pendingData} type="pending" />
            ) : activeTab === 'flipchart' ? (
              <FlipChartTab onEditingChange={handleFlipChartEditingChange} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}