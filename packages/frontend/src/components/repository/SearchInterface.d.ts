import React from 'react';
interface SearchInterfaceProps {
  onSelectRepository?: (repositoryId: string) => void;
  onCompareRepositories?: (repositoryIds: string[]) => void;
}
declare const SearchInterface: React.FC<SearchInterfaceProps>;
export default SearchInterface;
