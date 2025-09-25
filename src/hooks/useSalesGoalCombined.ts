import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SalesGoalData {
  ano: number;
  mes: number;
  percentual_atingido: number;
  valor_meta: number;
  valor_realizado: number;
}

interface TeamGoalData {
  supervisor: string;
  ano: number;
  mes: number;
  percentual_atingido: number;
  valor_meta: number;
  valor_realizado: number;
  equipe_id?: string;
}

export function useSalesGoalCombined() {
  const [salesGoalData, setSalesGoalData] = useState<SalesGoalData | null>(null);
  const [teamGoalsData, setTeamGoalsData] = useState<TeamGoalData[]>([]);
  const [previousGoalData, setPreviousGoalData] = useState<Pick<SalesGoalData, 'ano' | 'mes' | 'percentual_atingido'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        const prevDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const prevYear = prevDate.getFullYear();
        const prevMonth = prevDate.getMonth() + 1;

        // Buscar meta geral
        const { data: generalData, error: generalError } = await supabase
          .from('vw_metas_venda_geral')
          .select('*')
          .eq('ano', currentYear)
          .eq('mes', currentMonth)
          .maybeSingle();

        if (generalError) throw generalError;
        setSalesGoalData(generalData);

        // Buscar metas das equipes
        const { data: teamData, error: teamError } = await supabase
          .from('vw_metas_vendas_supervisor')
          .select('*')
          .eq('ano', currentYear)
          .eq('mes', currentMonth)
          .order('percentual_atingido', { ascending: false });

        if (teamError) throw teamError;
        setTeamGoalsData(teamData || []);

        // Buscar mês anterior (somente percentual e identificação)
        const { data: prevData, error: prevError } = await supabase
          .from('vw_metas_venda_geral')
          .select('ano, mes, percentual_atingido')
          .eq('ano', prevYear)
          .eq('mes', prevMonth)
          .maybeSingle();

        if (prevError) throw prevError;
        setPreviousGoalData(prevData ?? null);
      } catch (error) {
        console.error('Error fetching sales goal data:', error);
        setError('Erro ao carregar dados de metas');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscriptions para atualizações em tempo real
    const generalSubscription = supabase
      .channel('sales_goal_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vw_metas_venda_geral' },
        () => fetchData()
      )
      .subscribe();

    const teamSubscription = supabase
      .channel('team_goals_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vw_metas_vendas_supervisor' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      generalSubscription.unsubscribe();
      teamSubscription.unsubscribe();
    };
  }, []);

  return { 
    salesGoalData, 
    teamGoalsData, 
    previousGoalData, 
    loading, 
    error 
  };
}
