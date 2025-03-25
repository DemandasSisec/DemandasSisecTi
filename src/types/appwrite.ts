export type TipoDemanda = 'desenvolvimento' | 'dados' | 'suporte' | 'infraestrutura' | 'outros'
export type Urgencia = 'baixa' | 'media' | 'alta'
export type Status = 'pendente' | 'em_andamento' | 'concluida' | 'suspenso'

export interface User {
    $id: string;
    name: string;
    email: string;
    role: 'admin' | 'admin_ti' | 'user';
    department: string;
    created_at: string;
    updated_at: string;
}

export interface Demand {
    $id: string;
    titulo: string;
    descricao: string;
    tipo: string;
    urgencia: string;
    status: string;
    prazo: string;
    responsavel: string;
    solicitante: string;
    created_at: string;
    link?: string;
    dataSuspensao?: string;
    dataFinalizacao?: string;
}

export interface Comment {
    $id: string;
    demand_id: string;
    user_id: string;
    content: string;
    created_at: string;
    type: 'comment' | 'postponement';
}

export interface Department {
    $id: string;
    name: string;
    description: string;
    created_at: string;
}

export interface Solicitacao {
    $id: string;
    titulo: string;
    descricao: string;
    tipo: TipoDemanda;
    urgencia: Urgencia;
    status: Status;
    prazo: string;
    responsavel: string;
    solicitante: string;
    created_at: string;
    link?: string;
    dataSuspensao?: string;
    dataFinalizacao?: string;
}

export interface Comentario {
    $id: string;
    demand_id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    autor: string;
    texto: string;
    data: string;
    tipo: 'comment' | 'adiamento';
}

export interface Adiamento {
    $id: string;
    demand_id: string;
    user_id: string;
    reason: string;
    new_date: string;
    created_at: string;
}

export interface DemandaPorResponsavel {
  responsavel: string;
  total: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  suspensas: number;
}

export interface DemandaPorMes {
  mes: string;
  total: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  suspensas: number;
}

export interface DemandaPorTipo {
  tipo: string;
  quantidade: number;
} 