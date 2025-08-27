import {useMemo } from "react";
import { PaginationMeta, PaginationLinks } from "@/types/Pagination";
import { Select } from "@/components/ui";

interface PaginationProps {
    meta: PaginationMeta;
    links: PaginationLinks;
    onPageChange: (page: number) => void;
    onRowsPerPageChange?: (rowsPerPage: number) => void;
    rowsPerPage?: number;
}

const BasePagination: React.FC<PaginationProps> = ({
    meta,
    links,
    onPageChange,
    onRowsPerPageChange,
    rowsPerPage = 10
}) => {
    const pages = useMemo(() => {
        const pages = [];
        const start = Math.max(1, meta.current_page - 2);
        const end = Math.min(meta.last_page, meta.current_page + 2);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    }, [meta.current_page, meta.last_page]);

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">

            <div className="flex justify-between flex-1 sm:hidden">
                <button
                    onClick={() => onPageChange(meta.current_page - 1)}
                    disabled={!links.prev}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Précédent
                </button>
                <button
                    onClick={() => onPageChange(meta.current_page + 1)}
                    disabled={!links.next}
                    className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Suivant
                </button>
            </div>

            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                {onRowsPerPageChange && (
                    <div className="flex items-center space-x-2">
                        <label htmlFor="rows-per-page" className="text-sm text-gray-700">
                            Lignes par page :
                        </label>
                        <Select
                            id="rows-per-page"
                            value={rowsPerPage}
                            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                            className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </Select>
                    </div>
                )}
                <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-700">
                        Affichage de <span className="font-medium">{meta.from}</span> à{' '}
                        <span className="font-medium">{meta.to}</span> sur{' '}
                        <span className="font-medium">{meta.total}</span> résultats
                    </p>

                    {/* Rows per page selector */}
                </div>

                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(meta.current_page - 1)}
                            disabled={!links.prev}
                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Précédent
                        </button>

                        {pages.map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                                    page === meta.current_page
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => onPageChange(meta.current_page + 1)}
                            disabled={!links.next}
                            className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};


export default BasePagination;
