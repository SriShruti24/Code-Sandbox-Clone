import { FileIcon } from '../FileIcon/FileIcon';
import './EditorButton.css';

export const EditorButton = ({ name, extension, isActive, onSelect, onClose }) => {
    return (
        <div
            className={`editor-tab ${isActive ? 'active' : ''}`}
            onClick={onSelect}
        >
            <span className="tab-icon">
                <FileIcon extension={extension} />
            </span>

            <span className="tab-name">{name}</span>

            <button
                className="tab-close"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                title="Close"
            >
                ×
            </button>
        </div>
    );
};