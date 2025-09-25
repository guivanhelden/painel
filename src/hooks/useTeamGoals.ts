import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface TeamGoalData {
  supervisor: string;
  ano: number;
  mes: number;
  percentual_atingido: number;
  valor_meta: number;
  valor_realizado: number;
  equipe_id?: string;
  equipe?: string;
}

export function useTeamGoals() {
  const [teamGoalsData, setTeamGoalsData] = useState<TeamGoalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const { data, error } = await supabase
          .from('vw_metas_vendas_supervisor')
          .select('*')
          .eq('ano', currentYear)
          .eq('mes', currentMonth)
          .order('percentual_atingido', { ascending: false });

        if (error) throw error;
        setTeamGoalsData(data || []);
      } catch (error) {
        console.error('Error fetching team goals data:', error);
        setError('Erro ao carregar metas das equipes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscription para atualizações em tempo real
    const subscription = supabase
      .channel('team_goals_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vw_metas_vendas_supervisor' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { teamGoalsData, loading, error };
}
