import React from 'react';
interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}
declare const Pagination: React.FC<PaginationProps>;
export default Pagination;
