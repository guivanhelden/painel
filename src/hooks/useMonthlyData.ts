import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useMonthlyData() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [todayData, setTodayData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [monthlyResponse, todayResponse] = await Promise.all([
          supabase
            .from('view_trello_cards_mes')
            .select('*')
            .order('card_data_criado', { ascending: false }),
          supabase
            .from('view_trello_cards_hoje')
            .select('*')
            .order('card_data_criado', { ascending: false })
        ]);

        if (monthlyResponse.error) throw monthlyResponse.error;
        if (todayResponse.error) throw todayResponse.error;

        setMonthlyData(monthlyResponse.data || []);
        setTodayData(todayResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const monthlySubscription = supabase
      .channel('monthly_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'view_trello_cards_mes' }, 
        () => fetchData())
      .subscribe();

    const todaySubscription = supabase
      .channel('today_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'view_trello_cards_hoje' }, 
        () => fetchData())
      .subscribe();

    return () => {
      monthlySubscription.unsubscribe();
      todaySubscription.unsubscribe();
    };
  }, []);

  return { monthlyData, todayData, loading };
}