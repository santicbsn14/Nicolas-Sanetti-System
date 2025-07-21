import mongoose from "mongoose";
export interface Paginated<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    totalPages: number;
    page: number;
    pagingCounter: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    prevPage?: number | null;
    nextPage?: number | null;
}
export interface CriteriaFilters {
    pacient_id?: string;
    professional_id?: string;
    date_time?: Date;
    state?: string;
    session_type?: string;
    // Puedes añadir más filtros según sea necesario
}

// Define la interfaz Criteria, que incluye los filtros bajo "filters"
export interface Criteria {
    limit?: number;  // Número máximo de resultados por página
    page?: number;   // Número de página a recuperar
    filters?: CriteriaFilters;  // Objeto que agrupa los filtros
}
export type IdMongo = mongoose.Types.ObjectId
