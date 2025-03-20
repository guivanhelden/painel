import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SalesGoalData {
  ano: number;
  mes: number;
  percentual_atingido: number;
  valor_meta: number;
  valor_realizado: number;
}

export function useSalesGoal() {
  const [salesGoalData, setSalesGoalData] = useState<SalesGoalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const { data, error } = await supabase
          .from('vw_metas_venda_geral')
          .select('*')
          .eq('ano', currentYear)
          .eq('mes', currentMonth)
          .single();

        if (error) throw error;
        setSalesGoalData(data);
      } catch (error) {
        console.error('Error fetching sales goal data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const subscription = supabase
      .channel('sales_goal_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vw_metas_venda_geral' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { salesGoalData, loading };
}