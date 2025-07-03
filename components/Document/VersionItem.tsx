import { IVersion } from '@/models/models';

interface VersionItemProps {
  version: IVersion;
  isSelected: boolean;
  isCurrent: boolean;
  onClick: (version: IVersion) => void;
  onMouseEnter: (version: IVersion) => void;
  onMouseLeave: () => void;
}

const VersionItem: React.FC<VersionItemProps> = ({
  version,
  isSelected,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isCurrent,
}) => {
  return (
    <div className='py-1.5' onMouseEnter={() => onMouseEnter(version)} onMouseLeave={onMouseLeave}>
      <div
        className={`p-4 border rounded-lg cursor-pointer transition-all ${
          isSelected || isCurrent
            ? 'bg-mainLightGray border-mainDarkHover'
            : 'border-mainLightGray hover:bg-mainLightGray'
        }`}
        onClick={() => onClick(version)}
      >
        <p className='text-base font-medium text-mainDark'>Changed by: {version.userEmail}</p>
        <p className='text-sm text-mainGray'>At: {new Date(version.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default VersionItem;
