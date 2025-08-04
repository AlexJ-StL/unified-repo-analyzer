import React from 'react';
import { Repository } from '../../store/useRepositoryStore';
interface RepositoryCardProps {
  repository: Repository;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
}
declare const RepositoryCard: React.FC<RepositoryCardProps>;
export default RepositoryCard;
