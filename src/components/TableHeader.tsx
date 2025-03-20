import React from 'react';
import { 
  Calendar, 
  User, 
  Building2, 
  ListTodo, 
  UserCircle, 
  Shield, 
  Briefcase,
  LucideIcon
} from 'lucide-react';

interface ColumnConfig {
  label: string;
  icon: LucideIcon;
  width: string;
}

interface TableHeaderProps {
  type: 'signature' | 'new' | 'pending';
}

export function TableHeader({ type }: TableHeaderProps) {
  const columns: ColumnConfig[] = [
    { 
      label: type === 'new' ? 'Data' : 'Dt. Lim.', 
      icon: Calendar,
      width: '13%'
    },
    { 
      label: 'Cliente', 
      icon: User,
      width: '20%'
    },
    { 
      label: 'Operadora', 
      icon: Building2,
      width: '15%'
    },
    { 
      label: 'Etapa', 
      icon: ListTodo,
      width: '11%'
    },
    { 
      label: 'Corretor', 
      icon: UserCircle,
      width: '13%'
    },
    { 
      label: 'Supervisor', 
      icon: Shield,
      width: '14%'
    },
    { 
      label: 'Modalidade', 
      icon: Briefcase,
      width: '14%'
    }
  ];

  return (
    <tr>
      {columns.map(({ label, icon: Icon, width }, index) => (
        <th 
          key={index} 
          className="px-6 py-4 text-left font-semibold whitespace-nowrap"
          style={{ width }}
        >
          <div className="flex items-center gap-2">
            <Icon 
              className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-6 xl:h-6 text-purple-400" 
              aria-label={`${label} Icon`} 
            />
            <span className="text-sm md:text-base lg:text-lg xl:text-lg">{label}</span>
          </div>
        </th>
      ))}
    </tr>
  );
}
