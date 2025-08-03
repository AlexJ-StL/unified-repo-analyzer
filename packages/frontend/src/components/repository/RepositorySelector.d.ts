import React from 'react';
interface RepositorySelectorProps {
    onSelect?: (path: string) => void;
    className?: string;
}
declare const RepositorySelector: React.FC<RepositorySelectorProps>;
export default RepositorySelector;
