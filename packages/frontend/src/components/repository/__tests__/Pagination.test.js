import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Pagination from '../Pagination';
describe('Pagination', () => {
    it('renders pagination with correct page numbers', () => {
        const onPageChangeMock = vi.fn();
        render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChangeMock}/>);
        // Should show first page, current page and neighbors, and last page
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument();
        // Should have ellipsis
        const ellipses = screen.getAllByText('...');
        expect(ellipses.length).toBe(1); // Only one ellipsis after page 4
    });
    it('handles page changes correctly', () => {
        const onPageChangeMock = vi.fn();
        render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChangeMock}/>);
        // Click on page 4
        fireEvent.click(screen.getByText('4'));
        expect(onPageChangeMock).toHaveBeenCalledWith(4);
        // Click on page 1
        fireEvent.click(screen.getByText('1'));
        expect(onPageChangeMock).toHaveBeenCalledWith(1);
        // Click on last page
        fireEvent.click(screen.getByText('10'));
        expect(onPageChangeMock).toHaveBeenCalledWith(10);
    });
    it('handles next and previous buttons correctly', () => {
        const onPageChangeMock = vi.fn();
        render(<Pagination currentPage={3} totalPages={10} onPageChange={onPageChangeMock}/>);
        // Click next button
        fireEvent.click(screen.getByText('Next'));
        expect(onPageChangeMock).toHaveBeenCalledWith(4);
        // Click previous button
        fireEvent.click(screen.getByText('Previous'));
        expect(onPageChangeMock).toHaveBeenCalledWith(2);
    });
    it('disables previous button on first page', () => {
        const onPageChangeMock = vi.fn();
        render(<Pagination currentPage={1} totalPages={10} onPageChange={onPageChangeMock}/>);
        // Previous button should be disabled
        const previousButton = screen.getByText('Previous');
        expect(previousButton).toHaveClass('cursor-not-allowed');
        expect(previousButton).toHaveClass('text-gray-300');
        // Click should not trigger callback
        fireEvent.click(previousButton);
        expect(onPageChangeMock).not.toHaveBeenCalled();
    });
    it('disables next button on last page', () => {
        const onPageChangeMock = vi.fn();
        render(<Pagination currentPage={10} totalPages={10} onPageChange={onPageChangeMock}/>);
        // Next button should be disabled
        const nextButton = screen.getByText('Next');
        expect(nextButton).toHaveClass('cursor-not-allowed');
        expect(nextButton).toHaveClass('text-gray-300');
        // Click should not trigger callback
        fireEvent.click(nextButton);
        expect(onPageChangeMock).not.toHaveBeenCalled();
    });
    it('handles small number of pages correctly', () => {
        const onPageChangeMock = vi.fn();
        render(<Pagination currentPage={2} totalPages={3} onPageChange={onPageChangeMock}/>);
        // Should show all pages without ellipsis
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        // Should not have ellipsis
        expect(screen.queryByText('...')).not.toBeInTheDocument();
    });
    it('shows mobile pagination indicator', () => {
        const onPageChangeMock = vi.fn();
        render(<Pagination currentPage={5} totalPages={10} onPageChange={onPageChangeMock}/>);
        // Should show mobile indicator
        expect(screen.getByText('Page 5 of 10')).toBeInTheDocument();
    });
});
//# sourceMappingURL=Pagination.test.js.map