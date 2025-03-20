import React from 'react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { TableHeader } from './TableHeader';
import { ProposalCounter } from './ProposalCounter';

interface TableProps {
  data: any[];
  type: 'signature' | 'new' | 'pending';
  totalProposals?: number;
}

export function DashboardTable({ data, type, totalProposals }: TableProps) {
  const getDaysRemaining = (dueDate: string) => {
    if (!dueDate) return 0;
    const today = new Date();
    const due = new Date(dueDate);
    if (!isValid(due)) return 0;
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string, formatStr: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (!isValid(date)) return '-';
    return format(date, formatStr, { locale: ptBR });
  };

  const getRowClassName = (dueDate: string, dias_restantes?: number) => {
    if (!dueDate) return '';
    
    if (type === 'signature') {
      const daysRemaining = getDaysRemaining(dueDate);
      if (daysRemaining <= -10) return 'bg-red-900 animate-pulse-row animate-zoom';
      if (daysRemaining <= 0) return 'bg-red-900/80 animate-pulse-row';
      if (daysRemaining <= 2) return 'bg-yellow-900/80';
    }
    
    if (type === 'pending' && typeof dias_restantes === 'number') {
      if (dias_restantes <= 0) return 'bg-red-900/80 animate-pulse-row';
      if (dias_restantes <= 1) return 'bg-yellow-900/80';
    }
    
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {type === 'new' && totalProposals && (
        <ProposalCounter count={totalProposals} data={data} />
      )}

      <div className="w-full bg-gray-900 rounded-lg shadow-xl border border-gray-800">
        <table className="w-full table-fixed text-white">
          <thead className="bg-purple-900/50">
            <TableHeader type={type} />
          </thead>
          <tbody className="text-xl lg:text-2xl">
            {data.map((row, index) => (
              <motion.tr 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${getRowClassName(row.due, row.dias_restantes)}`}
              >
                <td className="px-2 py-1 whitespace-nowrap text-sm xl:text-center xl:text-lg">
                  {type === 'signature' || type === 'pending'
                    ? formatDate(row.due, 'dd/MMM')
                    : formatDate(row.card_data_criado, 'dd/MMM HH:mm')}
                </td>
                <td className="px-2 py-1 whitespace-nowrap text-sm lg:text-base">
                  <div className="scroll-container">
                    <div className="scroll-text">
                      <div className="scroll-text-inner">
                        {`${row.name || '-'}   ✦   `.repeat(5)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-2 py-1 whitespace-nowrap text-sm lg:text-base overflow-hidden">
                  <img 
                    src={row.logo_operadora} 
                    alt="Logo da Operadora" // Melhor prática: descrição mais clara
                    className="w-auto h-10 md:h-9 lg:h-10 xl:h-12 hover:scale-110 transition-transform rounded-md"
                  />
                </td>

                <td className="px-2 py-1 whitespace-nowrap text-sm lg:text-base">
                        {row.id_list}
                </td>
                <td className="px-2 py-1 whitespace-nowrap text-sm xl:text-center xl:text-lg">         
                        {row.corretor_nome}
                </td>
                <td className="px-2 py-1 whitespace-nowrap text-sm xl:text-center xl:text-lg">
                        {row.supervisor}
                </td>
                <td className="px-2 py-1 whitespace-nowrap text-sm xl:text-center xl:text-lg">
                        {row.board_name}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}